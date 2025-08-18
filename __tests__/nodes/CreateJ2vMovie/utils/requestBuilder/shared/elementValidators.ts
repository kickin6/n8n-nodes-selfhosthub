/**
 * Element validation utilities for json2video operations
 * Contains validation functions for all supported element types
 */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Base element validation
 */
export const validateBaseElement = (element: any): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!element) {
    errors.push('Element is null or undefined');
    return { isValid: false, errors, warnings };
  }

  if (typeof element !== 'object') {
    errors.push('Element must be an object');
    return { isValid: false, errors, warnings };
  }

  return { isValid: true, errors, warnings };
};

/**
 * Video element validation
 */
export const validateVideoElement = (element: any): ValidationResult => {
  const baseValidation = validateBaseElement(element);
  if (!baseValidation.isValid) {
    return baseValidation;
  }

  const errors: string[] = [];
  const warnings: string[] = [];

  // Required properties
  if (!element.type || element.type !== 'video') {
    errors.push('Video element must have type "video"');
  }

  if (!element.src || (typeof element.src === 'string' && element.src.trim() === '')) {
    errors.push('Video element must have a src property');
  } else if (typeof element.src !== 'string') {
    errors.push('Video element src must be a string');
  }

  // Optional property validation
  if (element.duration !== undefined) {
    if (typeof element.duration !== 'number' || element.duration < 0) {
      errors.push('Video duration must be a positive number');
    }
  }

  if (element.start !== undefined) {
    if (typeof element.start !== 'number' || element.start < 0) {
      errors.push('Video start time must be a positive number');
    }
  }

  if (element.volume !== undefined) {
    if (typeof element.volume !== 'number' || element.volume < 0 || element.volume > 1) {
      errors.push('Video volume must be a number between 0 and 1');
    }
  }

  if (element.speed !== undefined) {
    if (typeof element.speed !== 'number' || element.speed <= 0) {
      errors.push('Video speed must be a positive number');
    }
  }

  if (element.fit !== undefined) {
    const validFitValues = ['cover', 'contain', 'fill', 'scale-down', 'none'];
    if (!validFitValues.includes(element.fit)) {
      errors.push(`Video fit must be one of: ${validFitValues.join(', ')}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Audio element validation
 */
export const validateAudioElement = (element: any): ValidationResult => {
  const baseValidation = validateBaseElement(element);
  if (!baseValidation.isValid) {
    return baseValidation;
  }

  const errors: string[] = [];
  const warnings: string[] = [];

  // Required properties
  if (!element.type || element.type !== 'audio') {
    errors.push('Audio element must have type "audio"');
  }

  if (!element.src || (typeof element.src === 'string' && element.src.trim() === '')) {
    errors.push('Audio element must have a src property');
  } else if (typeof element.src !== 'string') {
    errors.push('Audio element src must be a string');
  }

  // Optional property validation
  if (element.volume !== undefined) {
    if (typeof element.volume !== 'number' || element.volume < 0 || element.volume > 1) {
      errors.push('Audio volume must be a number between 0 and 1');
    }
  }

  if (element.duration !== undefined) {
    if (typeof element.duration !== 'number' || element.duration < 0) {
      errors.push('Audio duration must be a positive number');
    }
  }

  if (element.start !== undefined) {
    if (typeof element.start !== 'number' || element.start < 0) {
      errors.push('Audio start time must be a positive number');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Text element validation
 */
export const validateTextElement = (element: any): ValidationResult => {
  const baseValidation = validateBaseElement(element);
  if (!baseValidation.isValid) {
    return baseValidation;
  }

  const errors: string[] = [];
  const warnings: string[] = [];

  // Required properties
  if (!element.text || (typeof element.text === 'string' && element.text.trim() === '')) {
    errors.push('Text element must have a text property');
  } else if (typeof element.text !== 'string') {
    errors.push('Text element text must be a string');
  }

  // Style validation (if present)
  if (element.style !== undefined) {
    if (typeof element.style !== 'string') {
      errors.push('Text element style must be a string');
    }
  }

  // Position validation
  if (element.position !== undefined) {
    const validPositions = [
      'top-left', 'top-center', 'top-right',
      'center-left', 'center-center', 'center-right',
      'bottom-left', 'bottom-center', 'bottom-right',
      'custom'
    ];
    
    if (!validPositions.includes(element.position)) {
      errors.push(`Text position must be one of: ${validPositions.join(', ')}`);
    }

    // If position is custom, x and y should be provided
    if (element.position === 'custom') {
      if (element.x === undefined || element.y === undefined) {
        warnings.push('Custom positioned text should have x and y coordinates');
      }
    }
  }

  // Coordinate validation
  if (element.x !== undefined && typeof element.x !== 'number') {
    errors.push('Text x coordinate must be a number');
  }

  if (element.y !== undefined && typeof element.y !== 'number') {
    errors.push('Text y coordinate must be a number');
  }

  // Timing validation
  if (element.start !== undefined) {
    if (typeof element.start !== 'number' || element.start < 0) {
      errors.push('Text start time must be a positive number');
    }
  }

  if (element.duration !== undefined) {
    if (typeof element.duration !== 'number' || element.duration <= 0) {
      errors.push('Text duration must be a positive number');
    }
  }

  // Font validation
  if (element.fontSize !== undefined) {
    if (typeof element.fontSize !== 'string' && typeof element.fontSize !== 'number') {
      errors.push('Text fontSize must be a string or number');
    }
  }

  if (element.fontWeight !== undefined) {
    const validWeights = ['100', '200', '300', '400', '500', '600', '700', '800', '900', 'normal', 'bold'];
    if (!validWeights.includes(String(element.fontWeight))) {
      errors.push(`Text fontWeight must be one of: ${validWeights.join(', ')}`);
    }
  }

  // Color validation (basic hex color check)
  if (element.fontColor !== undefined) {
    if (typeof element.fontColor !== 'string' || !/^#[0-9A-Fa-f]{6}$/.test(element.fontColor)) {
      errors.push('Text fontColor must be a valid hex color (e.g., #FFFFFF)');
    }
  }

  if (element.backgroundColor !== undefined) {
    if (typeof element.backgroundColor !== 'string' || !/^#[0-9A-Fa-f]{6}$/.test(element.backgroundColor)) {
      errors.push('Text backgroundColor must be a valid hex color (e.g., #000000)');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Image element validation
 */
export const validateImageElement = (element: any): ValidationResult => {
  const baseValidation = validateBaseElement(element);
  if (!baseValidation.isValid) {
    return baseValidation;
  }

  const errors: string[] = [];
  const warnings: string[] = [];

  // Required properties
  if (!element.type || element.type !== 'image') {
    errors.push('Image element must have type "image"');
  }

  if (!element.src || (typeof element.src === 'string' && element.src.trim() === '')) {
    errors.push('Image element must have a src property');
  } else if (typeof element.src !== 'string') {
    errors.push('Image element src must be a string');
  }

  // Optional property validation
  if (element.fit !== undefined) {
    const validFitValues = ['cover', 'contain', 'fill', 'scale-down', 'none'];
    if (!validFitValues.includes(element.fit)) {
      errors.push(`Image fit must be one of: ${validFitValues.join(', ')}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Subtitle element validation (for future subtitle support)
 */
export const validateSubtitleElement = (element: any): ValidationResult => {
  const baseValidation = validateBaseElement(element);
  if (!baseValidation.isValid) {
    return baseValidation;
  }

  const errors: string[] = [];
  const warnings: string[] = [];

  // Required properties
  if (!element.type || element.type !== 'subtitle') {
    errors.push('Subtitle element must have type "subtitle"');
  }

  if (!element.text || (typeof element.text === 'string' && element.text.trim() === '')) {
    errors.push('Subtitle element must have a text property');
  } else if (typeof element.text !== 'string') {
    errors.push('Subtitle element text must be a string');
  }

  // Timing validation (subtitles typically need timing)
  if (element.start === undefined) {
    warnings.push('Subtitle should have a start time');
  } else if (typeof element.start !== 'number' || element.start < 0) {
    errors.push('Subtitle start time must be a positive number');
  }

  if (element.duration !== undefined) {
    if (typeof element.duration !== 'number' || element.duration <= 0) {
      errors.push('Subtitle duration must be a positive number');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Shape element validation (rectangle, circle, etc.)
 */
export const validateShapeElement = (element: any): ValidationResult => {
  const baseValidation = validateBaseElement(element);
  if (!baseValidation.isValid) {
    return baseValidation;
  }

  const errors: string[] = [];
  const warnings: string[] = [];

  const validShapeTypes = ['rectangle', 'circle', 'arrow', 'line'];
  
  if (!element.type || !validShapeTypes.includes(element.type)) {
    errors.push(`Shape element must have type one of: ${validShapeTypes.join(', ')}`);
  }

  // Rectangle-specific validation
  if (element.type === 'rectangle') {
    if (element.width !== undefined && (typeof element.width !== 'number' || element.width <= 0)) {
      errors.push('Rectangle width must be a positive number');
    }
    if (element.height !== undefined && (typeof element.height !== 'number' || element.height <= 0)) {
      errors.push('Rectangle height must be a positive number');
    }
  }

  // Circle-specific validation
  if (element.type === 'circle') {
    if (element.radius !== undefined && (typeof element.radius !== 'number' || element.radius <= 0)) {
      errors.push('Circle radius must be a positive number');
    }
  }

  // Color validation for shapes
  if (element.color !== undefined) {
    if (typeof element.color !== 'string' || !/^#[0-9A-Fa-f]{6}$/.test(element.color)) {
      errors.push('Shape color must be a valid hex color (e.g., #FF0000)');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Generic element validator that routes to specific validators
 */
export const validateElement = (element: any): ValidationResult => {
  if (!element) {
    return {
      isValid: false,
      errors: ['Element is null or undefined'],
      warnings: []
    };
  }

  // Handle text elements that don't have a type property (your fixture structure)
  if (element.text !== undefined && !element.type) {
    return validateTextElement(element);
  }

  if (!element.type) {
    return {
      isValid: false,
      errors: ['Element must have a type property'],
      warnings: []
    };
  }

  switch (element.type) {
    case 'video':
      return validateVideoElement(element);
    case 'audio':
      return validateAudioElement(element);
    case 'text':
      return validateTextElement(element);
    case 'image':
      return validateImageElement(element);
    case 'subtitle':
      return validateSubtitleElement(element);
    case 'rectangle':
    case 'circle':
    case 'arrow':
    case 'line':
      return validateShapeElement(element);
    default:
      return {
        isValid: false,
        errors: [`Unknown element type: ${element.type}`],
        warnings: []
      };
  }
};

/**
 * Validate an array of elements
 */
export const validateElements = (elements: any[]): ValidationResult => {
  if (!Array.isArray(elements)) {
    return {
      isValid: false,
      errors: ['Elements must be an array'],
      warnings: []
    };
  }

  const allErrors: string[] = [];
  const allWarnings: string[] = [];

  elements.forEach((element, index) => {
    const validation = validateElement(element);
    
    if (!validation.isValid) {
      validation.errors.forEach(error => {
        allErrors.push(`Element ${index}: ${error}`);
      });
    }
    
    validation.warnings.forEach(warning => {
      allWarnings.push(`Element ${index}: ${warning}`);
    });
  });

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings
  };
};

/**
 * Helper to get validation summary
 */
export const getValidationSummary = (result: ValidationResult): string => {
  if (result.isValid) {
    const warningText = result.warnings.length > 0 
      ? ` (${result.warnings.length} warnings)` 
      : '';
    return `Valid${warningText}`;
  }
  
  return `Invalid: ${result.errors.length} errors, ${result.warnings.length} warnings`;
};