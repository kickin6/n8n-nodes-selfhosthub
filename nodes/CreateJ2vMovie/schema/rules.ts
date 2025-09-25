// nodes/CreateJ2vMovie/schema/rules.ts

import {
  JSON2VideoRequest,
  API_RULES,
  TextElementParams,
  SubtitleElementParams,
  MovieElement,
  SceneElement,
  ExportConfig,
  ExportDestination,
  isMovieElement,
  isSceneElement,
  isSubtitleElement,
  hasRequiredFields,
  hasRequiredExportFields,
  isValidDuration,
  isValidPosition,
  isValidFtpPort,
  isWebhookDestination,
  isFtpDestination,
  isEmailDestination
} from './schema';

/**
 * Validation result interface for consistent error reporting
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate image element with src OR prompt requirement
 * Images can use either a source URL or AI generation prompt, but not both
 */
export function validateImageElement(element: any, context: string = ''): string[] {
  const errors: string[] = [];
  
  if (!element || element.type !== 'image') {
    return errors;
  }

  const hasSrc = element.src && typeof element.src === 'string' && element.src.trim() !== '';
  const hasPrompt = element.prompt && typeof element.prompt === 'string' && element.prompt.trim() !== '';

  if (!hasSrc && !hasPrompt) {
    errors.push(`${context}: Image elements require either a source URL or AI prompt`);
  } else if (hasSrc && hasPrompt) {
    errors.push(`${context}: Image elements cannot have both source URL and AI prompt - choose one`);
  }

  // Validate AI-specific fields when using prompts
  if (hasPrompt) {
    if (element.model && !API_RULES.VALID_AI_MODELS.includes(element.model)) {
      errors.push(`${context}: Invalid AI model '${element.model}'. Must be one of: ${API_RULES.VALID_AI_MODELS.join(', ')}`);
    }
    if (element['aspect-ratio'] && !API_RULES.VALID_ASPECT_RATIOS.includes(element['aspect-ratio'])) {
      errors.push(`${context}: Invalid aspect ratio '${element['aspect-ratio']}'. Must be one of: ${API_RULES.VALID_ASPECT_RATIOS.join(', ')}`);
    }
  }

  // Validate URL format when using source
  if (hasSrc && !isValidUrl(element.src)) {
    errors.push(`${context}: Invalid source URL format`);
  }

  return errors;
}

/**
 * Validate text element parameters for completeness and format
 */
export function validateTextElementParams(params: TextElementParams): string[] {
  const errors: string[] = [];

  if (!params.text || params.text.trim() === '') {
    errors.push('Text content is required and cannot be empty');
  }

  // Font size validation
  if (params.fontSize !== undefined) {
    const fontSize = typeof params.fontSize === 'string' ?
      parseFloat(params.fontSize.replace('px', '')) : params.fontSize;
    if (isNaN(fontSize) || fontSize < 1 || fontSize > 200) {
      errors.push('Font size must be a number between 1 and 200');
    }
  }

  // Font weight validation
  if (params.fontWeight !== undefined) {
    const weight = typeof params.fontWeight === 'string' ?
      parseInt(params.fontWeight) : params.fontWeight;
    if (isNaN(weight) || weight < 100 || weight > 900 || weight % 100 !== 0) {
      errors.push('Font weight must be a multiple of 100 between 100 and 900');
    }
  }

  // Color validation
  const colorRegex = /^(#[0-9A-Fa-f]{6}|#[0-9A-Fa-f]{3}|rgb\([0-9,\s]+\)|rgba\([0-9,\s.]+\)|transparent)$/;
  if (params.fontColor && !colorRegex.test(params.fontColor)) {
    errors.push('fontColor must be a valid color (hex like #FF0000, rgb like rgb(255,0,0), rgba like rgba(255,0,0,0.5), or "transparent")');
  }
  if (params.backgroundColor && !colorRegex.test(params.backgroundColor)) {
    errors.push('backgroundColor must be a valid color (hex like #FF0000, rgb like rgb(255,0,0), rgba like rgba(255,0,0,0.5), or "transparent")');
  }

  // Position validation
  if (params.position && !isValidPosition(params.position)) {
    errors.push(`Position must be one of: ${API_RULES.VALID_POSITIONS.join(', ')}`);
  }

  // Coordinate validation for custom position
  if (params.position === 'custom') {
    if (params.x === undefined || params.y === undefined) {
      errors.push('X and Y coordinates are required when position is "custom"');
    }
  }

  // Text alignment validation
  const validAlignments = ['left', 'center', 'right', 'justify'];
  if (params.textAlign && !validAlignments.includes(params.textAlign)) {
    errors.push(`Text align must be one of: ${validAlignments.join(', ')}`);
  }

  // Vertical/horizontal position validation
  const validVerticalPositions = ['top', 'center', 'bottom'];
  const validHorizontalPositions = ['left', 'center', 'right'];

  if (params.verticalPosition && !validVerticalPositions.includes(params.verticalPosition)) {
    errors.push(`Vertical position must be one of: ${validVerticalPositions.join(', ')}`);
  }
  if (params.horizontalPosition && !validHorizontalPositions.includes(params.horizontalPosition)) {
    errors.push(`Horizontal position must be one of: ${validHorizontalPositions.join(', ')}`);
  }

  // Duration and timing validation
  if (params.duration !== undefined && !isValidDuration(params.duration)) {
    errors.push('Duration must be a positive number, -1 (intrinsic), or -2 (match container)');
  }

  if (params.start !== undefined && (typeof params.start !== 'number' || params.start < 0)) {
    errors.push('Start time must be a non-negative number');
  }

  return errors;
}

/**
 * Validate subtitle element parameters
 */
export function validateSubtitleElementParams(params: SubtitleElementParams): string[] {
  const errors: string[] = [];

  // Must have either captions, src, or text
  const hasCaptions = params.captions && params.captions.trim() !== '';
  const hasSrc = params.src && params.src.trim() !== '';
  const hasText = params.text && params.text.trim() !== '';

  const sourceCount = [hasCaptions, hasSrc, hasText].filter(Boolean).length;

  if (sourceCount === 0) {
    errors.push('Either captions text, src URL, or text content is required');
  }
  if (sourceCount > 1) {
    errors.push('Cannot specify multiple subtitle sources - choose one of: captions, src, or text');
  }

  // URL validation for src
  if (params.src && !isValidUrl(params.src)) {
    errors.push('Subtitle src must be a valid URL');
  }

  // Language validation
  if (params.language && !/^[a-z]{2}(-[A-Z]{2})?$/.test(params.language) && params.language !== 'auto') {
    errors.push('Language must be in format "en", "en-US", or "auto"');
  }

  // Position validation
  if (params.position && !isValidPosition(params.position)) {
    errors.push(`Position must be one of: ${API_RULES.VALID_POSITIONS.join(', ')}`);
  }

  // Font size validation
  if (params.fontSize !== undefined) {
    if (typeof params.fontSize !== 'number' || params.fontSize < 1 || params.fontSize > 200) {
      errors.push('Font size must be a number between 1 and 200');
    }
  }

  // Numeric range validations
  if (params.outlineWidth !== undefined) {
    if (typeof params.outlineWidth !== 'number' || params.outlineWidth < 0 || params.outlineWidth > 10) {
      errors.push('Outline width must be a number between 0 and 10');
    }
  }

  if (params.shadowOffset !== undefined) {
    if (typeof params.shadowOffset !== 'number' || params.shadowOffset < 0 || params.shadowOffset > 10) {
      errors.push('Shadow offset must be a number between 0 and 10');
    }
  }

  if (params.maxWordsPerLine !== undefined) {
    if (typeof params.maxWordsPerLine !== 'number' || params.maxWordsPerLine < 1 || params.maxWordsPerLine > 20) {
      errors.push('Max words per line must be a number between 1 and 20');
    }
  }

  // Color validation
  const colorRegex = /^(#[0-9A-Fa-f]{6}|#[0-9A-Fa-f]{3}|rgb\([0-9,\s]+\)|rgba\([0-9,\s.]+\)|transparent)$/;
  const colorFields = ['wordColor', 'lineColor', 'boxColor', 'outlineColor', 'shadowColor'];

  colorFields.forEach(field => {
    const value = params[field as keyof SubtitleElementParams];
    if (value && typeof value === 'string' && !colorRegex.test(value)) {
      errors.push(`${field} must be a valid color (hex like #FF0000, rgb like rgb(255,0,0), rgba like rgba(255,0,0,0.5), or "transparent")`);
    }
  });

  return errors;
}

/**
 * Validate export configuration according to v2 API rules
 */
export function validateExportConfig(exportConfig: ExportConfig, context: string = ''): string[] {
  const errors: string[] = [];
  const prefix = context ? `${context}: ` : '';

  if (!exportConfig || typeof exportConfig !== 'object') {
    errors.push(`${prefix}Export config must be an object`);
    return errors;
  }

  if (!exportConfig.destinations) {
    errors.push(`${prefix}Export config must have a destinations array`);
    return errors;
  }

  if (!Array.isArray(exportConfig.destinations)) {
    errors.push(`${prefix}Destinations must be an array`);
    return errors;
  }

  if (exportConfig.destinations.length === 0) {
    errors.push(`${prefix}At least one destination is required`);
    return errors;
  }

  // Validate each destination
  exportConfig.destinations.forEach((destination, index) => {
    const destContext = `${prefix}Destination ${index + 1}`;
    const destErrors = validateExportDestination(destination, destContext);
    errors.push(...destErrors);
  });

  return errors;
}

/**
 * Validate individual export destination
 */
export function validateExportDestination(destination: ExportDestination, context: string = ''): string[] {
  const errors: string[] = [];

  if (!destination || typeof destination !== 'object') {
    errors.push(`${context}: Destination must be an object`);
    return errors;
  }

  if (!destination.type) {
    errors.push(`${context}: Destination type is required`);
    return errors;
  }

  if (!API_RULES.EXPORT_RULES.VALID_DESTINATION_TYPES.includes(destination.type as any)) {
    errors.push(`${context}: Invalid destination type '${destination.type}'. Must be one of: ${API_RULES.EXPORT_RULES.VALID_DESTINATION_TYPES.join(', ')}`);
    return errors;
  }

  // Check required fields
  if (!hasRequiredExportFields(destination)) {
    const requiredFields = API_RULES.EXPORT_RULES.REQUIRED_FIELDS[destination.type as keyof typeof API_RULES.EXPORT_RULES.REQUIRED_FIELDS];
    errors.push(`${context}: Missing required fields for ${destination.type} destination: ${requiredFields.join(', ')}`);
  }

  // Type-specific validation
  if (isWebhookDestination(destination)) {
    if (destination.endpoint && !isValidUrl(destination.endpoint)) {
      errors.push(`${context}: Invalid webhook endpoint URL format`);
    }
    if (destination.endpoint && !destination.endpoint.startsWith('https://')) {
      errors.push(`${context}: Webhook endpoint must use HTTPS`);
    }
  } else if (isFtpDestination(destination)) {
    if (destination.port && !isValidFtpPort(destination.port)) {
      errors.push(`${context}: FTP port must be between 1 and 65535`);
    }
    if (destination['remote-path'] && (!destination['remote-path'].startsWith('/') || destination['remote-path'].includes('..'))) {
      errors.push(`${context}: Remote path must be absolute and not contain '..'`);
    }
  } else if (isEmailDestination(destination)) {
    if (destination.to) {
      const emails = Array.isArray(destination.to) ? destination.to : [destination.to];
      emails.forEach((email, emailIndex) => {
        if (!isValidEmail(email)) {
          errors.push(`${context}: Invalid email address at index ${emailIndex + 1}: ${email}`);
        }
      });
    }
    if (destination.from && !isValidEmail(destination.from)) {
      errors.push(`${context}: Invalid sender email address`);
    }
  }

  return errors;
}

/**
 * Validate movie-level elements against API rules
 */
export function validateMovieElements(elements: any[]): string[] {
  const errors: string[] = [];

  if (!Array.isArray(elements)) {
    errors.push('Movie elements must be an array');
    return errors;
  }

  elements.forEach((element, index) => {
    const elementContext = `Movie element ${index + 1}`;

    if (!element || typeof element !== 'object') {
      errors.push(`${elementContext}: Element must be an object`);
      return;
    }

    if (!element.type) {
      errors.push(`${elementContext}: Element type is required`);
      return;
    }

    // Check if element type is allowed at movie level
    if (!API_RULES.MOVIE_ELEMENT_TYPES.includes(element.type)) {
      errors.push(`${elementContext}: Element type '${element.type}' is not allowed at movie level. Allowed types: ${API_RULES.MOVIE_ELEMENT_TYPES.join(', ')}`);
      return;
    }

    // Required fields validation
    if (!hasRequiredFields(element)) {
      errors.push(`${elementContext}: Missing required fields for ${element.type}`);
    }

    // Element-specific validation
    if (element.type === 'text' && element.text) {
      const textErrors = validateTextElementParams(element);
      errors.push(...textErrors.map(err => `${elementContext}: ${err}`));
    }

    if (element.type === 'subtitles') {
      const subtitleErrors = validateSubtitleElementParams(element);
      errors.push(...subtitleErrors.map(err => `${elementContext}: ${err}`));
    }

    // Common field validations
    validateCommonElementFields(element, elementContext, errors);
  });

  return errors;
}

/**
 * Validate scene-level elements against API rules
 */
export function validateSceneElements(elements: any[], sceneContext: string = ''): string[] {
  const errors: string[] = [];

  if (!Array.isArray(elements)) {
    errors.push(`${sceneContext}: Scene elements must be an array`);
    return errors;
  }

  elements.forEach((element, index) => {
    const elementContext = sceneContext ? `${sceneContext} element ${index + 1}` : `Element ${index + 1}`;

    if (!element || typeof element !== 'object') {
      errors.push(`${elementContext}: Element must be an object`);
      return;
    }

    if (!element.type) {
      errors.push(`${elementContext}: Element type is required`);
      return;
    }

    // Check if subtitles are in scenes (not allowed)
    if (element.type === 'subtitles') {
      errors.push(`${elementContext}: Subtitles can only be added at movie level, not in individual scenes`);
      return;
    }

    // Check if element type is allowed at scene level
    if (!API_RULES.SCENE_ELEMENT_TYPES.includes(element.type)) {
      errors.push(`${elementContext}: Element type '${element.type}' is not allowed at scene level. Allowed types: ${API_RULES.SCENE_ELEMENT_TYPES.join(', ')}`);
      return;
    }

    // Required fields validation
    if (!hasRequiredFields(element)) {
      errors.push(`${elementContext}: Missing required fields for ${element.type}`);
    }

    // Element-specific validation
    if (element.type === 'text' && element.text) {
      const textErrors = validateTextElementParams(element);
      errors.push(...textErrors.map(err => `${elementContext}: ${err}`));
    }

    // Image validation with src/prompt logic
    if (element.type === 'image') {
      const imageErrors = validateImageElement(element, elementContext);
      errors.push(...imageErrors);
    }

    // URL validation for media elements
    if (['video', 'audio'].includes(element.type) && element.src && !isValidUrl(element.src)) {
      errors.push(`${elementContext}: Invalid URL for ${element.type} source`);
    }

    // Component validation
    if (element.type === 'component' && (!element.component || element.component.trim() === '')) {
      errors.push(`${elementContext}: Component ID is required for component elements`);
    }

    // HTML validation (can have src OR html, but at least one)
    if (element.type === 'html') {
      const hasHtmlSrc = element.src && element.src.trim() !== '';
      const hasHtmlContent = element.html && element.html.trim() !== '';
      
      if (!hasHtmlSrc && !hasHtmlContent) {
        errors.push(`${elementContext}: HTML elements require either source URL or HTML content`);
      } else if (hasHtmlSrc && !isValidUrl(element.src)) {
        errors.push(`${elementContext}: Invalid URL for HTML source`);
      }
    }

    // Voice element validation
    if (element.type === 'voice') {
      if (!element.text || element.text.trim() === '') {
        errors.push(`${elementContext}: Text content is required for voice elements`);
      }
      if (element.model && !API_RULES.VALID_TTS_MODELS.includes(element.model)) {
        errors.push(`${elementContext}: Invalid TTS model. Must be one of: ${API_RULES.VALID_TTS_MODELS.join(', ')}`);
      }
    }

    // Common field validations
    validateCommonElementFields(element, elementContext, errors);
  });

  return errors;
}

/**
 * Validate complete JSON2Video request structure
 */
export function validateJSON2VideoRequest(request: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!request || typeof request !== 'object') {
    return {
      isValid: false,
      errors: ['Request must be an object'],
      warnings: []
    };
  }

  // Required top-level field: scenes
  if (!request.scenes) {
    errors.push('Missing required field: scenes');
  } else if (!Array.isArray(request.scenes)) {
    errors.push('Scenes must be an array');
  } else if (request.scenes.length === 0) {
    warnings.push('No scenes defined - video will be empty');
  }

  // Numeric field validations with ranges
  const numericFields = [
    { field: 'width', range: API_RULES.VALIDATION_RANGES.width },
    { field: 'height', range: API_RULES.VALIDATION_RANGES.height },
  ];

  numericFields.forEach(({ field, range }) => {
    const value = request[field];
    if (value !== undefined) {
      if (typeof value !== 'number' || isNaN(value)) {
        errors.push(`${field} must be a number`);
      } else if (value < range.min || value > range.max) {
        errors.push(`${field} must be between ${range.min} and ${range.max}`);
      }
    }
  });

  // Quality validation
  if (request.quality && !API_RULES.VALID_QUALITIES.includes(request.quality)) {
    errors.push(`Quality must be one of: ${API_RULES.VALID_QUALITIES.join(', ')}`);
  }

  // Resolution validation
  if (request.resolution && !API_RULES.VALID_RESOLUTIONS.includes(request.resolution)) {
    errors.push(`Resolution must be one of: ${API_RULES.VALID_RESOLUTIONS.join(', ')}`);
  }

  // Custom resolution requirements
  if (request.resolution === 'custom') {
    if (!request.width) errors.push('Width is required when resolution is "custom"');
    if (!request.height) errors.push('Height is required when resolution is "custom"');
  }

  // Validate movie elements if present
  if (request.elements) {
    const movieElementErrors = validateMovieElements(request.elements);
    errors.push(...movieElementErrors);
  }

  // Validate scenes
  if (request.scenes && Array.isArray(request.scenes)) {
    request.scenes.forEach((scene: any, sceneIndex: number) => {
      const sceneContext = `Scene ${sceneIndex + 1}`;

      if (!scene || typeof scene !== 'object') {
        errors.push(`${sceneContext}: Scene must be an object`);
        return;
      }

      if (!scene.elements) {
        errors.push(`${sceneContext}: Missing required field: elements`);
      } else {
        const sceneErrors = validateSceneElements(scene.elements, sceneContext);
        errors.push(...sceneErrors);
      }

      // Scene-specific validations
      if (scene.duration !== undefined && !isValidDuration(scene.duration)) {
        errors.push(`${sceneContext}: Duration must be a positive number, -1 (auto), or -2 (match container)`);
      }

      if (scene['background-color'] && !isValidColor(scene['background-color'])) {
        errors.push(`${sceneContext}: Invalid background color format`);
      }
    });
  }

  // Validate exports configuration
  if (request.exports) {
    if (!Array.isArray(request.exports)) {
      errors.push('Exports must be an array');
    } else {
      // Check single export config rule
      if (request.exports.length > 1) {
        warnings.push('Currently only one export configuration is supported. Using the first configuration.');
      }

      request.exports.forEach((exportConfig: any, index: number) => {
        const exportErrors = validateExportConfig(exportConfig, `Export config ${index + 1}`);
        errors.push(...exportErrors);
      });
    }
  }

  // Validate movie-level vs scene-level element rules
  if (request.elements && request.scenes) {
    request.scenes.forEach((scene: any, sceneIndex: number) => {
      if (scene.elements && Array.isArray(scene.elements)) {
        scene.elements.forEach((element: any, elementIndex: number) => {
          if (element && element.type === 'subtitles') {
            errors.push(`Scene ${sceneIndex + 1} element ${elementIndex + 1}: Subtitles must be at movie level, not in scenes`);
          }
        });
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validate common element fields that apply to all element types
 */
function validateCommonElementFields(element: any, context: string, errors: string[]): void {
  // Duration validation
  if (element.duration !== undefined && !isValidDuration(element.duration)) {
    errors.push(`${context}: Duration must be a positive number, -1 (intrinsic), or -2 (match container)`);
  }

  // Start time validation
  if (element.start !== undefined && (typeof element.start !== 'number' || element.start < 0)) {
    errors.push(`${context}: Start time must be a non-negative number`);
  }

  // Z-index validation
  if (element['z-index'] !== undefined) {
    const zIndex = element['z-index'];
    const range = API_RULES.VALIDATION_RANGES['z-index'];
    if (typeof zIndex !== 'number' || zIndex < range.min || zIndex > range.max) {
      errors.push(`${context}: Z-index must be a number between ${range.min} and ${range.max}`);
    }
  }

  // Volume validation
  if (element.volume !== undefined) {
    const volume = element.volume;
    const range = API_RULES.VALIDATION_RANGES.volume;
    if (typeof volume !== 'number' || volume < range.min || volume > range.max) {
      errors.push(`${context}: Volume must be a number between ${range.min} and ${range.max}`);
    }
  }

  // Position validation
  if (element.position && !isValidPosition(element.position)) {
    errors.push(`${context}: Invalid position. Must be one of: ${API_RULES.VALID_POSITIONS.join(', ')}`);
  }

  // Coordinate validation for custom position
  if (element.position === 'custom') {
    if (element.x === undefined || element.y === undefined) {
      errors.push(`${context}: X and Y coordinates are required when position is "custom"`);
    }
  }

  // Fade validation
  if (element['fade-in'] !== undefined && (typeof element['fade-in'] !== 'number' || element['fade-in'] < 0)) {
    errors.push(`${context}: Fade-in must be a non-negative number`);
  }
  if (element['fade-out'] !== undefined && (typeof element['fade-out'] !== 'number' || element['fade-out'] < 0)) {
    errors.push(`${context}: Fade-out must be a non-negative number`);
  }

  // JSON object field validation
  const jsonObjectFields = ['crop', 'rotate', 'chroma-key', 'correction'];
  jsonObjectFields.forEach(field => {
    if (element[field] && typeof element[field] === 'object') {
      try {
        if (field === 'crop' && element[field]) {
          const crop = element[field];
          if (crop.width !== undefined && (typeof crop.width !== 'number' || crop.width <= 0)) {
            errors.push(`${context}: Crop width must be a positive number`);
          }
          if (crop.height !== undefined && (typeof crop.height !== 'number' || crop.height <= 0)) {
            errors.push(`${context}: Crop height must be a positive number`);
          }
        }
      } catch (e) {
        errors.push(`${context}: Invalid ${field} object structure`);
      }
    }
  });
}

/**
 * Validate URL format
 */
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate email format
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate color format (hex, rgb, rgba, or transparent)
 */
function isValidColor(color: string): boolean {
  const colorRegex = /^(#[0-9A-Fa-f]{6}|#[0-9A-Fa-f]{3}|rgb\([0-9,\s]+\)|rgba\([0-9,\s.]+\)|transparent)$/;
  return colorRegex.test(color);
}