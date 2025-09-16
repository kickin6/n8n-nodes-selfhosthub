// nodes/CreateJ2vMovie/core/parameterCollector.ts
// COMPLETE REFACTOR: Fixed image src/prompt logic, added movie parameters, JSON object parsing

import { INodeExecutionData, IExecuteFunctions } from 'n8n-workflow';

export interface CollectedParameters {
  recordId?: string;
  elements?: any[];
  subtitles?: any;
  outputSettings?: any;
  exportConfigs?: any[];
  jsonTemplate?: string;
  isAdvancedMode?: boolean;
  operation: string;
  // NEW: Movie-level parameters
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

/**
 * Process element from the unified collection and convert to API format
 * FIXED: Handle image src vs prompt logic and JSON object parsing
 */
function processUnifiedElement(element: any): any {
  const processed: any = {
    type: element.type,
  };

  // =============================================================================
  // COMMON PROPERTIES (all elements)
  // =============================================================================
  if (element.id) processed.id = element.id;
  if (element.comment) processed.comment = element.comment;
  if (element.condition) processed.condition = element.condition;
  if (element.variables !== undefined) {
    try {
      processed.variables = typeof element.variables === 'string' 
        ? JSON.parse(element.variables)
        : element.variables;
    } catch (e) {
      processed.variables = element.variables;
    }
  }
  if (element.cache !== undefined) processed.cache = element.cache;

  // =============================================================================
  // SOURCE PROPERTIES - FIXED IMAGE SRC VS PROMPT LOGIC
  // =============================================================================
  if (element.type === 'image') {
    // FIXED: For images, only collect AI generation fields when prompt exists and src is empty
    if (element.prompt && element.prompt.trim() !== '') {
      processed.prompt = element.prompt;
      
      // Only include AI settings when using prompt
      if (element.model) processed.model = element.model;
      if (element.aspectRatio) processed['aspect-ratio'] = element.aspectRatio;
      if (element.connection) processed.connection = element.connection;
      if (element.modelSettings !== undefined) {
        try {
          processed['model-settings'] = typeof element.modelSettings === 'string' 
            ? JSON.parse(element.modelSettings)
            : element.modelSettings;
        } catch (e) {
          processed['model-settings'] = element.modelSettings;
        }
      }
    } else if (element.src && element.src.trim() !== '') {
      // Use src when no prompt provided
      processed.src = element.src;
    }
    // If neither src nor prompt, validation will catch this later
  } else {
    // For all other element types, src is straightforward
    if (element.src) processed.src = element.src;
  }

  // Other source properties
  if (element.text) processed.text = element.text;
  if (element.component) processed.component = element.component;
  if (element.html) processed.html = element.html;

  // =============================================================================
  // TIMING PROPERTIES
  // =============================================================================
  if (element.start !== undefined) processed.start = element.start;
  if (element.duration !== undefined) processed.duration = element.duration;
  if (element.extraTime !== undefined) processed['extra-time'] = element.extraTime;
  if (element.zIndex !== undefined) processed['z-index'] = element.zIndex;
  if (element.fadeIn !== undefined) processed['fade-in'] = element.fadeIn;
  if (element.fadeOut !== undefined) processed['fade-out'] = element.fadeOut;

  // =============================================================================
  // POSITIONING PROPERTIES
  // =============================================================================
  if (element.position) processed.position = element.position;
  if (element.x !== undefined) processed.x = element.x;
  if (element.y !== undefined) processed.y = element.y;
  if (element.width !== undefined) processed.width = element.width;
  if (element.height !== undefined) processed.height = element.height;
  if (element.resize) processed.resize = element.resize;

  // =============================================================================
  // AUDIO PROPERTIES
  // =============================================================================
  if (element.volume !== undefined) processed.volume = element.volume;
  if (element.muted !== undefined) processed.muted = element.muted;
  if (element.seek !== undefined) processed.seek = element.seek;
  if (element.loop !== undefined) processed.loop = element.loop;

  // =============================================================================
  // VISUAL EFFECTS - FIXED: JSON OBJECT PARSING
  // =============================================================================
  if (element.pan) processed.pan = element.pan;
  if (element.panDistance !== undefined) processed['pan-distance'] = element.panDistance;
  if (element.panCrop !== undefined) processed['pan-crop'] = element.panCrop;
  if (element.zoom !== undefined) processed.zoom = element.zoom;
  if (element.flipHorizontal !== undefined) processed['flip-horizontal'] = element.flipHorizontal;
  if (element.flipVertical !== undefined) processed['flip-vertical'] = element.flipVertical;
  if (element.mask) processed.mask = element.mask;

  // FIXED: Parse JSON textarea objects directly
  if (element.crop && typeof element.crop === 'string' && element.crop.trim() !== '{}' && element.crop.trim() !== '') {
    try {
      const cropObj = JSON.parse(element.crop);
      if (cropObj && Object.keys(cropObj).length > 0) {
        processed.crop = cropObj;
      }
    } catch (e) {
      console.warn('Failed to parse crop JSON:', element.crop);
    }
  }

  if (element.rotate && typeof element.rotate === 'string' && element.rotate.trim() !== '{}' && element.rotate.trim() !== '') {
    try {
      const rotateObj = JSON.parse(element.rotate);
      if (rotateObj && Object.keys(rotateObj).length > 0) {
        processed.rotate = rotateObj;
      }
    } catch (e) {
      console.warn('Failed to parse rotate JSON:', element.rotate);
    }
  }

  if (element.chromaKey && typeof element.chromaKey === 'string' && element.chromaKey.trim() !== '{}' && element.chromaKey.trim() !== '') {
    try {
      const chromaObj = JSON.parse(element.chromaKey);
      if (chromaObj && Object.keys(chromaObj).length > 0) {
        // FIXED: Use correct kebab-case field name
        processed['chroma-key'] = chromaObj;
      }
    } catch (e) {
      console.warn('Failed to parse chroma-key JSON:', element.chromaKey);
    }
  }

  if (element.correction && typeof element.correction === 'string' && element.correction.trim() !== '{}' && element.correction.trim() !== '') {
    try {
      const correctionObj = JSON.parse(element.correction);
      if (correctionObj && Object.keys(correctionObj).length > 0) {
        processed.correction = correctionObj;
      }
    } catch (e) {
      console.warn('Failed to parse correction JSON:', element.correction);
    }
  }

  // =============================================================================
  // TEXT-SPECIFIC PROPERTIES
  // =============================================================================
  if (element.type === 'text') {
    if (element.textStyle) processed.style = element.textStyle;
    
    // Build text settings object with kebab-case properties
    const settings: any = {};
    if (element.fontFamily) settings['font-family'] = element.fontFamily;
    if (element.fontSize !== undefined) settings['font-size'] = element.fontSize;
    if (element.fontWeight) settings['font-weight'] = element.fontWeight;
    if (element.fontColor) settings['font-color'] = element.fontColor;
    if (element.backgroundColor) settings['background-color'] = element.backgroundColor;
    if (element.textAlign) settings['text-align'] = element.textAlign;
    if (element.verticalPosition) settings['vertical-position'] = element.verticalPosition;
    if (element.horizontalPosition) settings['horizontal-position'] = element.horizontalPosition;
    if (element.lineHeight !== undefined) settings['line-height'] = element.lineHeight;
    if (element.letterSpacing !== undefined) settings['letter-spacing'] = element.letterSpacing;
    if (element.textShadow) settings['text-shadow'] = element.textShadow;
    if (element.textDecoration) settings['text-decoration'] = element.textDecoration;
    if (element.textTransform) settings['text-transform'] = element.textTransform;
    
    if (Object.keys(settings).length > 0) {
      processed.settings = settings;
    }
  }

  // =============================================================================
  // VOICE-SPECIFIC PROPERTIES
  // =============================================================================
  if (element.type === 'voice') {
    if (element.voice) processed.voice = element.voice;
    if (element.model) processed.model = element.model;
    if (element.connection) processed.connection = element.connection;
  }

  // =============================================================================
  // HTML-SPECIFIC PROPERTIES
  // =============================================================================
  if (element.type === 'html') {
    if (element.tailwindcss !== undefined) processed.tailwindcss = element.tailwindcss;
    if (element.wait !== undefined) processed.wait = element.wait;
  }

  // =============================================================================
  // AUDIOGRAM-SPECIFIC PROPERTIES
  // =============================================================================
  if (element.type === 'audiogram') {
    if (element.color) processed.color = element.color;
    if (element.opacity !== undefined) processed.opacity = element.opacity;
    if (element.amplitude !== undefined) processed.amplitude = element.amplitude;
  }

  // =============================================================================
  // COMPONENT-SPECIFIC PROPERTIES
  // =============================================================================
  if (element.type === 'component' && element.settings) {
    try {
      processed.settings = typeof element.settings === 'string' 
        ? JSON.parse(element.settings)
        : element.settings;
    } catch (e) {
      processed.settings = element.settings;
    }
  }

  return processed;
}

/**
 * Collect elements from the unified collection
 */
function collectUnifiedElements(
  executeFunctions: IExecuteFunctions,
  itemIndex: number
): any[] {
  try {
    const collection = executeFunctions.getNodeParameter('elements', itemIndex, {}) as any;
    if (!collection?.elementValues) return [];

    const elements = Array.isArray(collection.elementValues) 
      ? collection.elementValues 
      : [collection.elementValues];

    return elements.map(processUnifiedElement);
  } catch (error) {
    console.warn('Failed to collect unified elements:', error);
    return [];
  }
}

/**
 * Collect export configurations
 */
function collectExportConfigs(executeFunctions: IExecuteFunctions, itemIndex: number): any[] {
  try {
    const exportSettings = executeFunctions.getNodeParameter('exportSettings', itemIndex, {}) as any;
    if (!exportSettings?.exportValues) return [];

    const exports = Array.isArray(exportSettings.exportValues) 
      ? exportSettings.exportValues 
      : [exportSettings.exportValues];

    return exports.map((exportConfig: any) => {
      const config: any = {};
      
      // Basic export settings
      if (exportConfig.format) config.format = exportConfig.format;
      if (exportConfig.quality) config.quality = exportConfig.quality;
      if (exportConfig.resolution) config.resolution = exportConfig.resolution;
      if (exportConfig.width !== undefined) config.width = exportConfig.width;
      if (exportConfig.height !== undefined) config.height = exportConfig.height;
      
      // Delivery method specific settings
      switch (exportConfig.exportType) {
        case 'webhook':
          if (exportConfig.webhookUrl) {
            config.webhook = { url: exportConfig.webhookUrl };
          }
          break;
        case 'ftp':
          config.ftp = {
            host: exportConfig.ftpHost,
            port: exportConfig.ftpPort || 21,
            username: exportConfig.ftpUsername,
            password: exportConfig.ftpPassword,
            path: exportConfig.ftpPath || '/',
            secure: exportConfig.ftpSecure || false
          };
          break;
        case 'email':
          config.email = {
            to: exportConfig.emailTo,
            from: exportConfig.emailFrom,
            subject: exportConfig.emailSubject || 'Your video is ready',
            message: exportConfig.emailMessage
          };
          break;
      }
      
      return config;
    });
  } catch (error) {
    console.warn('Failed to collect export configs:', error);
    return [];
  }
}

/**
 * NEW: Collect movie-level settings
 */
function collectMovieSettings(executeFunctions: IExecuteFunctions, itemIndex: number): any {
  const movieSettings: any = {};
  
  try {
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

    // Parse JSON fields
    if (movieVariables && movieVariables.trim() !== '{}') {
      try {
        movieSettings.variables = JSON.parse(movieVariables);
      } catch (e) {
        console.warn('Failed to parse movie variables JSON:', movieVariables);
      }
    }

    if (clientData && clientData.trim() !== '{}') {
      try {
        movieSettings['client-data'] = JSON.parse(clientData);
      } catch (e) {
        console.warn('Failed to parse client data JSON:', clientData);
      }
    }
  } catch (error) {
    console.warn('Failed to collect movie settings:', error);
  }

  return movieSettings;
}

/**
 * Main collection function
 */
export function collectParameters(this: IExecuteFunctions, itemIndex: number): CollectedParameters {
  const operation = String(this.getNodeParameter('operation', itemIndex, ''));
  
  const collected: CollectedParameters = {
    operation,
    recordId: this.getNodeParameter('recordId', itemIndex, '') as string,
  };

  // Determine advanced mode parameter name based on operation
  let advancedModeParam = 'advancedMode';
  let jsonTemplateParam = 'jsonTemplate';
  
  switch (operation) {
    case 'mergeVideoAudio':
      advancedModeParam = 'advancedModeMergeVideoAudio';
      jsonTemplateParam = 'jsonTemplateMergeVideoAudio';
      break;
    case 'mergeVideos':
      advancedModeParam = 'advancedModeMergeVideos';
      jsonTemplateParam = 'jsonTemplateMergeVideos';
      break;
  }

  // Check if advanced mode is enabled
  collected.isAdvancedMode = this.getNodeParameter(advancedModeParam, itemIndex, false) as boolean;

  if (collected.isAdvancedMode) {
    // Advanced mode - use JSON template only
    collected.jsonTemplate = this.getNodeParameter(jsonTemplateParam, itemIndex, '') as string;
  } else {
    // Basic mode - collect from form
    
    // NEW: Collect movie-level settings
    collected.movieSettings = collectMovieSettings(this, itemIndex);
    
    // Collect subtitles (movie-level) - only for createMovie
    if (operation === 'createMovie') {
      const enableSubtitles = this.getNodeParameter('enableSubtitles', itemIndex, false) as boolean;
      if (enableSubtitles) {
        const subtitleElement: any = {
          type: 'subtitles'
        };

        // Main subtitle properties
        const captions = this.getNodeParameter('captions', itemIndex, '') as string;
        const subtitleComment = this.getNodeParameter('subtitleComment', itemIndex, '') as string;
        const subtitleLanguage = this.getNodeParameter('subtitleLanguage', itemIndex, 'auto') as string;
        const subtitleModel = this.getNodeParameter('subtitleModel', itemIndex, 'default') as string;
        
        if (captions) {
          subtitleElement.captions = captions;
        }
        
        if (subtitleComment) {
          subtitleElement.comment = subtitleComment;
        }
        
        if (subtitleLanguage) {
          subtitleElement.language = subtitleLanguage;
        }

        if (subtitleModel && subtitleModel !== 'default') {
          subtitleElement.model = subtitleModel;
        }

        // Parse subtitle settings JSON - FIXED: Complete settings object
        const subtitleSettings = this.getNodeParameter('subtitleSettings', itemIndex, '{}') as string;
        if (subtitleSettings && subtitleSettings.trim() !== '{}') {
          try {
            const settings = JSON.parse(subtitleSettings.trim());
            if (Object.keys(settings).length > 0) {
              subtitleElement.settings = settings;
            }
          } catch (error) {
            console.warn('Failed to parse subtitle settings JSON:', error);
          }
        }

        collected.subtitles = subtitleElement;
      }
    }

    // Collect unified elements (all operations)
    collected.elements = collectUnifiedElements(this, itemIndex);

    // Collect output settings
    const outputSettings = this.getNodeParameter('outputSettings', itemIndex, {}) as any;
    if (outputSettings?.outputValues) {
      collected.outputSettings = outputSettings.outputValues;
    } else {
      // Set defaults if no output settings configured
      collected.outputSettings = {
        width: 1920,
        height: 1080,
        quality: 'high',
        cache: true
      };
    }

    // Collect export configurations
    collected.exportConfigs = collectExportConfigs(this, itemIndex);
  }

  return collected;
}

/**
 * ENHANCED: Validation function for collected parameters with image src/prompt logic
 */
export function validateCollectedParameters(
  collected: CollectedParameters
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Advanced mode validation
  if (collected.isAdvancedMode) {
    if (!collected.jsonTemplate || collected.jsonTemplate.trim() === '') {
      errors.push('JSON template is required when advanced mode is enabled');
    }
    return { isValid: errors.length === 0, errors };
  }

  // Basic mode validation
  const hasElements = collected.elements && collected.elements.length > 0;
  const hasSubtitles = collected.subtitles && typeof collected.subtitles === 'object';

  // Operation-specific validation
  switch (collected.operation) {
    case 'createMovie':
      if (!hasElements && !hasSubtitles) {
        errors.push('At least one element or subtitles content is required for createMovie operation');
      }
      break;

    case 'mergeVideoAudio':
    case 'mergeVideos':
      if (!hasElements) {
        errors.push(`At least one element is required for ${collected.operation} operation`);
      }
      break;

    default:
      errors.push(`Unknown operation: ${collected.operation}`);
  }

  // ENHANCED: Validate element required fields with image src/prompt logic
  if (hasElements) {
    collected.elements!.forEach((element, index) => {
      if (!element.type) {
        errors.push(`Element ${index + 1}: type is required`);
      }
      
      // Type-specific required field validation
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
          // FIXED: Image can have either src or prompt, but not both, and at least one is required
          const hasSrc = element.src && element.src.trim() !== '';
          const hasPrompt = element.prompt && element.prompt.trim() !== '';
          
          if (!hasSrc && !hasPrompt) {
            errors.push(`Element ${index + 1}: either source URL or AI prompt is required for image elements`);
          } else if (hasSrc && hasPrompt) {
            errors.push(`Element ${index + 1}: cannot specify both source URL and AI prompt for image elements - choose one`);
          }
          break;
        case 'html':
          // HTML can have either src or html content
          const hasHtmlSrc = element.src && element.src.trim() !== '';
          const hasHtmlContent = element.html && element.html.trim() !== '';
          
          if (!hasHtmlSrc && !hasHtmlContent) {
            errors.push(`Element ${index + 1}: either source URL or HTML content is required for HTML elements`);
          }
          break;
      }
    });
  }

  return { isValid: errors.length === 0, errors };
}