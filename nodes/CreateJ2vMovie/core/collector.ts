// nodes/CreateJ2vMovie/core/collector.ts

import { IExecuteFunctions } from 'n8n-workflow';
import { ExportConfig } from '../schema/schema';

/**
 * Collected parameters from n8n node for request building
 */
export interface CollectedParameters {
  recordId?: string;
  elements?: any[];
  subtitles?: any;
  outputSettings?: any;
  exportConfigs?: ExportConfig[];
  jsonTemplate?: string;
  isAdvancedMode?: boolean;
  movieSettings?: {
    id?: string;
    comment?: string;
    variables?: any;
    cache?: boolean;
    draft?: boolean;
    clientData?: any;
    resolution?: string;
  };
}

// API defaults to optimize request size by skipping default values
const API_DEFAULTS = {
  // Timing
  start: 0,
  duration: -1,
  'extra-time': 0,
  'z-index': 0,
  'fade-in': 0,
  'fade-out': 0,

  // Position and sizing
  position: 'center-center',
  x: 0,
  y: 0,
  width: -1,
  height: -1,

  // Audio
  volume: 1,
  muted: false,
  seek: 0,
  loop: 0,

  // Visual effects
  'pan-distance': 0.1,
  'pan-crop': true,
  zoom: 0,
  'flip-horizontal': false,
  'flip-vertical': false,

  // Image AI
  model: 'flux-schnell',
  'aspect-ratio': 'horizontal',

  // Voice
  voice: 'en-US-AriaNeural',

  // HTML
  tailwindcss: false,
  wait: 2,

  // Audiogram
  color: '#ffffff',
  opacity: 0.5,
  amplitude: 5,

  // Component
  cache: true,

  // FTP
  port: 21,
  secure: false
};

/**
 * Check if a value should be included in API request
 * Skips undefined, null, empty strings, and API defaults
 */
function shouldIncludeValue(key: string, value: any): boolean {
  if (value === undefined || value === null) return false;

  if (typeof value === 'string' && value.trim() === '') return false;

  const defaultValue = API_DEFAULTS[key as keyof typeof API_DEFAULTS];
  if (defaultValue !== undefined && value === defaultValue) return false;

  return true;
}

/**
 * Process unified element from n8n parameters into API format
 * Handles camelCase to kebab-case conversion and field optimization
 */
function processUnifiedElement(element: any): any {
  const processed: any = {
    type: element.type,
  };

  // Required content fields
  const requiredContentFields = ['text', 'src', 'html', 'component', 'prompt'];
  requiredContentFields.forEach(prop => {
    if (element[prop] && element[prop].toString().trim() !== '') {
      processed[prop] = element[prop];
    }
  });

  // Basic metadata fields
  if (element.id && element.id.trim()) processed.id = element.id;
  if (element.comment && element.comment.trim()) processed.comment = element.comment;
  if (element.condition && element.condition.trim()) processed.condition = element.condition;

  if (element.variables !== undefined) {
    try {
      const vars = typeof element.variables === 'string'
        ? JSON.parse(element.variables)
        : element.variables;
      if (vars && Object.keys(vars).length > 0) {
        processed.variables = vars;
      }
    } catch (e) {
      // Skip invalid JSON
    }
  }

  // Timing properties
  if (shouldIncludeValue('start', element.start)) {
    processed.start = Number(element.start);
  }
  if (shouldIncludeValue('duration', element.duration)) {
    processed.duration = Number(element.duration);
  }
  if (shouldIncludeValue('extra-time', element.extraTime)) {
    processed['extra-time'] = Number(element.extraTime);
  }

  // Layer and fade properties
  if (shouldIncludeValue('z-index', element.zIndex)) {
    processed['z-index'] = Number(element.zIndex);
  }
  if (shouldIncludeValue('fade-in', element.fadeIn)) {
    processed['fade-in'] = Number(element.fadeIn);
  }
  if (shouldIncludeValue('fade-out', element.fadeOut)) {
    processed['fade-out'] = Number(element.fadeOut);
  }

  // Position and sizing properties
  const positionProps = [
    { key: 'position', prop: 'position' },
    { key: 'x', prop: 'x' },
    { key: 'y', prop: 'y' },
    { key: 'width', prop: 'width' },
    { key: 'height', prop: 'height' },
    { key: 'resize', prop: 'resize' }
  ];

  positionProps.forEach(({ key, prop }) => {
    if (shouldIncludeValue(key, element[prop])) {
      processed[prop] = element[prop];
    }
  });

  // Resize property - always include when set (no API default to skip)
  if (element.resize && element.resize.trim() !== '') {
    processed.resize = element.resize;
  }

  // Audio properties
  const audioProps = [
    { key: 'volume', prop: 'volume' },
    { key: 'muted', prop: 'muted' },
    { key: 'seek', prop: 'seek' },
    { key: 'loop', prop: 'loop' }
  ];

  audioProps.forEach(({ key, prop }) => {
    if (shouldIncludeValue(key, element[prop])) {
      processed[prop] = element[prop];
    }
  });

  // Visual effect properties
  if (shouldIncludeValue('pan', element.pan)) {
    processed.pan = element.pan;
  }
  if (shouldIncludeValue('pan-distance', element.panDistance)) {
    processed['pan-distance'] = element.panDistance;
  }
  if (shouldIncludeValue('pan-crop', element.panCrop)) {
    processed['pan-crop'] = element.panCrop;
  }
  if (shouldIncludeValue('zoom', element.zoom)) {
    processed.zoom = element.zoom;
  }
  if (shouldIncludeValue('flip-horizontal', element.flipHorizontal)) {
    processed['flip-horizontal'] = element.flipHorizontal;
  }
  if (shouldIncludeValue('flip-vertical', element.flipVertical)) {
    processed['flip-vertical'] = element.flipVertical;
  }
  if (shouldIncludeValue('mask', element.mask)) {
    processed.mask = element.mask;
  }

  // Complex object properties (crop, rotate, etc.)
  const jsonObjectProps = ['crop', 'rotate', 'correction', 'chromaKey'];
  jsonObjectProps.forEach(prop => {
    const kebabProp = prop === 'chromaKey' ? 'chroma-key' : prop;

    if (element[prop] !== undefined) {
      if (typeof element[prop] === 'string' && element[prop].trim()) {
        try {
          const parsed = JSON.parse(element[prop]);
          if (parsed && Object.keys(parsed).length > 0) {
            processed[kebabProp] = parsed;
          }
        } catch (e) {
          // Skip invalid JSON
        }
      } else if (typeof element[prop] === 'object' && element[prop] !== null) {
        if (Object.keys(element[prop]).length > 0) {
          processed[kebabProp] = element[prop];
        }
      }
    }
  });

  // camelCase to kebab-case conversions
  const kebabConversions = [
    { from: 'aspectRatio', to: 'aspect-ratio' },
    { from: 'modelSettings', to: 'model-settings' }
  ];

  kebabConversions.forEach(({ from, to }) => {
    if (element[from] !== undefined) {
      if (typeof element[from] === 'string' && element[from].trim()) {
        try {
          const parsed = JSON.parse(element[from]);
          if (parsed && Object.keys(parsed).length > 0) {
            processed[to] = parsed;
          }
        } catch (e) {
          if (element[from].trim() !== '') {
            processed[to] = element[from];
          }
        }
      } else if (element[from] !== null && element[from] !== '') {
        processed[to] = element[from];
      }
    }
  });

  if (element.type === 'text') {
    if (element.textSettings && element.textSettings.trim() !== '{}') {
      try {
        const settings = JSON.parse(element.textSettings);
        if (settings && Object.keys(settings).length > 0) {
          processed.settings = settings;
        }
      } catch (e) {
        // Skip invalid JSON
      }
    }

    if (element.textStyle && element.textStyle !== '001') {
      processed.style = element.textStyle;
    }
  }

  // Type-specific properties
  if (element.type === 'voice') {
    if (element.voice && shouldIncludeValue('voice', element.voice)) {
      processed.voice = element.voice;
    }
    if (element.model && element.model !== 'azure') {
      processed.model = element.model;
    }
    if (element.connection && element.connection.trim()) {
      processed.connection = element.connection;
    }
  }

  if (element.type === 'image') {
    if (element.model && shouldIncludeValue('model', element.model)) {
      processed.model = element.model;
    }
    if (element.connection && element.connection.trim()) {
      processed.connection = element.connection;
    }
  }

  if (element.type === 'html') {
    if (shouldIncludeValue('tailwindcss', element.tailwindcss)) {
      processed.tailwindcss = element.tailwindcss;
    }
    if (shouldIncludeValue('wait', element.wait)) {
      processed.wait = element.wait;
    }
  }

  if (element.type === 'audiogram') {
    if (shouldIncludeValue('color', element.color)) {
      processed.color = element.color;
    }
    if (shouldIncludeValue('opacity', element.opacity)) {
      processed.opacity = element.opacity;
    }
    if (shouldIncludeValue('amplitude', element.amplitude)) {
      processed.amplitude = element.amplitude;
    }
  }

  if (element.type === 'component' && element.settings) {
    try {
      const settings = typeof element.settings === 'string'
        ? JSON.parse(element.settings)
        : element.settings;
      if (settings && Object.keys(settings).length > 0) {
        processed.settings = settings;
      }
    } catch (e) {
      if (typeof element.settings === 'object' && Object.keys(element.settings).length > 0) {
        processed.settings = element.settings;
      }
    }
  }

  return processed;
}

/**
 * Collect unified elements from n8n parameters
 */
function collectUnifiedElements(
  executeFunctions: IExecuteFunctions,
  itemIndex: number
): any[] {
  const collection = executeFunctions.getNodeParameter('elements', itemIndex, {}) as any;
  if (!collection?.elementValues) return [];

  const elements = Array.isArray(collection.elementValues)
    ? collection.elementValues
    : [collection.elementValues];

  return elements.map(processUnifiedElement);
}

/**
 * Collect export configurations from n8n parameters with v2 API format
 */
function collectExportConfigs(executeFunctions: IExecuteFunctions, itemIndex: number): ExportConfig[] {
  const exportSettings = executeFunctions.getNodeParameter('exportSettings', itemIndex, {}) as any;
  if (!exportSettings?.exportValues) return [];

  const exports = Array.isArray(exportSettings.exportValues)
    ? exportSettings.exportValues
    : [exportSettings.exportValues];

  // Group destinations by their configuration
  const destinations: any[] = [];

  exports.forEach((exportConfig: any) => {
    switch (exportConfig.exportType) {
      case 'webhook':
        if (exportConfig.webhookUrl) {
          destinations.push({
            type: 'webhook',
            endpoint: exportConfig.webhookUrl
          });
        }
        break;

      case 'ftp':
        const ftpDestination: any = {
          type: 'ftp',
          host: exportConfig.ftpHost,
          username: exportConfig.ftpUsername,
          password: exportConfig.ftpPassword
        };

        // Optional FTP fields with proper handling
        if (exportConfig.ftpPort && exportConfig.ftpPort !== 21) {
          ftpDestination.port = Number(exportConfig.ftpPort);
        }

        if (exportConfig.ftpPath && exportConfig.ftpPath.trim() !== '' && exportConfig.ftpPath !== '/') {
          ftpDestination['remote-path'] = exportConfig.ftpPath;
        }

        if (exportConfig.ftpFile && exportConfig.ftpFile.trim() !== '') {
          ftpDestination.file = exportConfig.ftpFile;
        }

        if (exportConfig.ftpSecure === true) {
          ftpDestination.secure = true;
        }

        destinations.push(ftpDestination);
        break;

      case 'email':
        const emailDestination: any = {
          type: 'email',
          to: exportConfig.emailTo
        };

        // Optional email fields
        if (exportConfig.emailFrom && exportConfig.emailFrom.trim() !== '') {
          emailDestination.from = exportConfig.emailFrom;
        }

        if (exportConfig.emailSubject && exportConfig.emailSubject.trim() !== '' && exportConfig.emailSubject !== 'Your video is ready') {
          emailDestination.subject = exportConfig.emailSubject;
        }

        if (exportConfig.emailMessage && exportConfig.emailMessage.trim() !== '') {
          emailDestination.message = exportConfig.emailMessage;
        }

        destinations.push(emailDestination);
        break;
    }
  });

  // Return single export config with all destinations (v2 API format)
  if (destinations.length > 0) {
    return [{
      destinations: destinations
    }];
  }

  return [];
}

/**
 * Collect movie settings from n8n parameters
 */
function collectMovieSettings(executeFunctions: IExecuteFunctions, itemIndex: number): any {
  const movieSettings: any = {};

  const showMovieSettings = executeFunctions.getNodeParameter('showMovieSettings', itemIndex, false) as boolean;
  if (!showMovieSettings) return movieSettings;

  const movieId = executeFunctions.getNodeParameter('movieId', itemIndex, '') as string;
  const movieComment = executeFunctions.getNodeParameter('movieComment', itemIndex, '') as string;
  const movieVariables = executeFunctions.getNodeParameter('movieVariables', itemIndex, '{}') as string;
  const movieCache = executeFunctions.getNodeParameter('movieCache', itemIndex, true) as boolean;
  const movieDraft = executeFunctions.getNodeParameter('movieDraft', itemIndex, false) as boolean;
  const clientData = executeFunctions.getNodeParameter('clientData', itemIndex, '{}') as string;
  const movieResolution = executeFunctions.getNodeParameter('movieResolution', itemIndex, 'custom') as string;

  if (movieId) movieSettings.id = movieId;
  if (movieComment) movieSettings.comment = movieComment;
  if (movieCache !== undefined) movieSettings.cache = movieCache;
  if (movieDraft !== undefined) movieSettings.draft = movieDraft;
  if (movieResolution && movieResolution !== 'custom') movieSettings.resolution = movieResolution;

  if (movieVariables && movieVariables.trim() !== '{}') {
    try {
      const parsed = JSON.parse(movieVariables);
      if (Object.keys(parsed).length > 0) {
        movieSettings.variables = parsed;
      }
    } catch (e) {
      // Skip invalid JSON
    }
  }

  if (clientData && clientData.trim() !== '{}') {
    try {
      const parsed = JSON.parse(clientData);
      if (Object.keys(parsed).length > 0) {
        movieSettings['client-data'] = parsed;
      }
    } catch (e) {
      // Skip invalid JSON
    }
  }

  return movieSettings;
}

/**
 * Collect all parameters from n8n execution context
 */
export function collectParameters(this: IExecuteFunctions, itemIndex: number): CollectedParameters {
  const collected: CollectedParameters = {
    recordId: this.getNodeParameter('recordId', itemIndex, '') as string,
  };

  collected.isAdvancedMode = this.getNodeParameter('advancedMode', itemIndex, false) as boolean;

  if (collected.isAdvancedMode) {
    // Get the template type to determine which JSON field to read
    const templateType = this.getNodeParameter('templateType', itemIndex, 'blank') as string;

    // Map template type to parameter name
    const templateFieldMap: Record<string, string> = {
      'blank': 'jsonTemplateBlank',
      'videoImage': 'jsonTemplateVideoImage',
      'videoAudio': 'jsonTemplateVideoAudio',
      'videoSequence': 'jsonTemplateVideoSequence',
      'slideshow': 'jsonTemplateSlideshow',
      'textOverlay': 'jsonTemplateTextOverlay',
      'faceless': 'jsonTemplateFaceless',
      'socialStory': 'jsonTemplateSocialStory',
      'presentation': 'jsonTemplatePresentation',
    };

    const jsonFieldName = templateFieldMap[templateType] || 'jsonTemplateBlank';
    collected.jsonTemplate = this.getNodeParameter(jsonFieldName, itemIndex, '') as string;
  } else {
    collected.movieSettings = collectMovieSettings(this, itemIndex);

    const enableSubtitles = this.getNodeParameter('enableSubtitles', itemIndex, false) as boolean;
    if (enableSubtitles) {
      const subtitleElement: any = {
        type: 'subtitles'
      };

      const captions = this.getNodeParameter('captions', itemIndex, '') as string;
      const subtitleComment = this.getNodeParameter('subtitleComment', itemIndex, '') as string;
      const subtitleLanguage = this.getNodeParameter('subtitleLanguage', itemIndex, 'auto') as string;
      const subtitleModel = this.getNodeParameter('subtitleModel', itemIndex, 'default') as string;

      if (captions) subtitleElement.captions = captions;
      if (subtitleComment) subtitleElement.comment = subtitleComment;
      if (subtitleLanguage) subtitleElement.language = subtitleLanguage;
      if (subtitleModel && subtitleModel !== 'default') subtitleElement.model = subtitleModel;

      const subtitleSettings = this.getNodeParameter('subtitleSettings', itemIndex, '{}') as string;
      if (subtitleSettings && subtitleSettings.trim() !== '{}') {
        try {
          const settings = JSON.parse(subtitleSettings);
          if (settings && Object.keys(settings).length > 0) {
            subtitleElement.settings = settings;
          }
        } catch (e) {
          // Skip invalid JSON
        }
      }

      collected.subtitles = subtitleElement;
    }

    collected.elements = collectUnifiedElements(this, itemIndex);

    const outputSettings = this.getNodeParameter('outputSettings', itemIndex, {}) as any;
    if (outputSettings?.outputValues) {
      collected.outputSettings = outputSettings.outputValues;
    } else {
      collected.outputSettings = {
        width: 1920,
        height: 1080,
        quality: 'high',
        cache: true
      };
    }

    collected.exportConfigs = collectExportConfigs(this, itemIndex);
  }

  return collected;
}

/**
 * Validate collected parameters for completeness and correctness
 */
export function validateCollectedParameters(
  collected: CollectedParameters
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (collected.isAdvancedMode) {
    if (!collected.jsonTemplate || collected.jsonTemplate.trim() === '') {
      errors.push('JSON template is required when advanced mode is enabled');
    }
    return { isValid: errors.length === 0, errors };
  }

  const hasElements = collected.elements && collected.elements.length > 0;

  if (!hasElements && !collected.subtitles) {
    errors.push('At least one element is required');
  }

  if (hasElements) {
    collected.elements!.forEach((element, index) => {
      if (!element.type) {
        errors.push(`Element ${index + 1}: type is required`);
      }

      switch (element.type) {
        case 'video':
        case 'audio':
        case 'audiogram':
          if (!element.src) {
            errors.push(`Element ${index + 1}: source URL is required for ${element.type} elements`);
          }
          break;
        case 'text':
        case 'voice':
          if (!element.text) {
            errors.push(`Element ${index + 1}: text content is required for ${element.type} elements`);
          }
          break;
        case 'component':
          if (!element.component) {
            errors.push(`Element ${index + 1}: component ID is required for component elements`);
          }
          break;
        case 'image':
          const hasSrc = element.src && element.src.trim() !== '';
          const hasPrompt = element.prompt && element.prompt.trim() !== '';

          if (!hasSrc && !hasPrompt) {
            errors.push(`Element ${index + 1}: either source URL or AI prompt is required for image elements`);
          } else if (hasSrc && hasPrompt) {
            errors.push(`Element ${index + 1}: cannot specify both source URL and AI prompt for image elements - choose one`);
          }
          break;
        case 'html':
          const hasHtmlSrc = element.src && element.src.trim() !== '';
          const hasHtmlContent = element.html && element.html.trim() !== '';

          if (!hasHtmlSrc && !hasHtmlContent) {
            errors.push(`Element ${index + 1}: either source URL or HTML content is required for HTML elements`);
          }
          break;
      }
    });
  }

  // Validate export configurations
  if (collected.exportConfigs && collected.exportConfigs.length > 0) {
    collected.exportConfigs.forEach((exportConfig, configIndex) => {
      if (!exportConfig.destinations || !Array.isArray(exportConfig.destinations) || exportConfig.destinations.length === 0) {
        errors.push(`Export config ${configIndex + 1}: at least one destination is required`);
        return;
      }

      exportConfig.destinations.forEach((destination: any, destIndex: number) => {
        const context = `Export config ${configIndex + 1}, destination ${destIndex + 1}`;

        if (!destination || typeof destination !== 'object') {
          errors.push(`${context}: destination must be an object`);
          return;
        }

        if (!destination.type) {
          errors.push(`${context}: destination type is required`);
          return;
        }

        switch (destination.type) {
          case 'webhook':
            if (!destination.endpoint || destination.endpoint.trim() === '') {
              errors.push(`${context}: webhook endpoint URL is required`);
            }
            break;
          case 'ftp':
            if (!destination.host || destination.host.trim() === '') {
              errors.push(`${context}: FTP host is required`);
            }
            if (!destination.username || destination.username.trim() === '') {
              errors.push(`${context}: FTP username is required`);
            }
            if (!destination.password || destination.password.trim() === '') {
              errors.push(`${context}: FTP password is required`);
            }
            if (destination.port && (typeof destination.port !== 'number' || destination.port < 1 || destination.port > 65535)) {
              errors.push(`${context}: FTP port must be a number between 1 and 65535`);
            }
            break;
          case 'email':
            if (!destination.to || destination.to.toString().trim() === '') {
              errors.push(`${context}: email recipient is required`);
            }
            break;
          default:
            errors.push(`${context}: invalid destination type '${destination.type}'. Must be 'webhook', 'ftp', or 'email'`);
        }
      });
    });
  }

  return { isValid: errors.length === 0, errors };
}