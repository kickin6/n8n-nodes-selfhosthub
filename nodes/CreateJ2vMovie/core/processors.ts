// nodes/CreateJ2vMovie/core/processors/index.ts

// =============================================================================
// CONSOLIDATED ELEMENT PROCESSORS
// =============================================================================

/**
 * Process text element with text-specific settings collection
 */
export function processTextElement(element: any): any {
  let processed: any = { ...element };

  // Process text settings collection
  if (processed.textSettings !== undefined) {
    const settings = processed.textSettings;
    const processedSettings: any = {};

    if (settings.fontFamily !== undefined) processedSettings['font-family'] = settings.fontFamily;
    if (settings.fontSize !== undefined) {
      const fontSize = typeof settings.fontSize === 'string' ? 
        parseFloat(settings.fontSize) : settings.fontSize;
      if (!isNaN(fontSize)) processedSettings['font-size'] = fontSize;
    }
    if (settings.fontWeight !== undefined) processedSettings['font-weight'] = settings.fontWeight;
    if (settings.textAlign !== undefined) processedSettings['text-align'] = settings.textAlign;
    if (settings.textColor !== undefined) processedSettings.color = settings.textColor;
    if (settings.backgroundColor !== undefined) processedSettings['background-color'] = settings.backgroundColor;
    if (settings.borderColor !== undefined) processedSettings['border-color'] = settings.borderColor;
    if (settings.borderWidth !== undefined) processedSettings['border-width'] = settings.borderWidth;
    if (settings.borderRadius !== undefined) processedSettings['border-radius'] = settings.borderRadius;
    if (settings.padding !== undefined) processedSettings.padding = settings.padding;
    if (settings.margin !== undefined) processedSettings.margin = settings.margin;
    if (settings.lineHeight !== undefined) processedSettings['line-height'] = settings.lineHeight;
    if (settings.letterSpacing !== undefined) processedSettings['letter-spacing'] = settings.letterSpacing;
    if (settings.textShadow !== undefined) processedSettings['text-shadow'] = settings.textShadow;
    if (settings.opacity !== undefined) processedSettings.opacity = settings.opacity;
    if (settings.transform !== undefined) processedSettings.transform = settings.transform;

    if (Object.keys(processedSettings).length > 0) {
      processed.settings = processedSettings;
    }
    delete processed.textSettings;
  }

  // Apply basic element processing
  return processBasicElement(processed);
}

/**
 * Process subtitle element with subtitle-specific settings collection
 */
export function processSubtitleElement(element: any): any {
  let processed: any = { ...element };

  // Process subtitle settings collection
  if (processed.subtitleSettings !== undefined) {
    const settings = processed.subtitleSettings;
    const processedSettings: any = {};

    if (settings.fontFamily !== undefined) processedSettings['font-family'] = settings.fontFamily;
    if (settings.fontSize !== undefined) {
      const fontSize = typeof settings.fontSize === 'string' ? 
        parseFloat(settings.fontSize) : settings.fontSize;
      if (!isNaN(fontSize)) processedSettings['font-size'] = fontSize;
    }
    if (settings.fontWeight !== undefined) processedSettings['font-weight'] = settings.fontWeight;
    if (settings.textAlign !== undefined) processedSettings['text-align'] = settings.textAlign;
    if (settings.textColor !== undefined) processedSettings.color = settings.textColor;
    if (settings.backgroundColor !== undefined) processedSettings['background-color'] = settings.backgroundColor;
    if (settings.borderColor !== undefined) processedSettings['border-color'] = settings.borderColor;
    if (settings.borderWidth !== undefined) processedSettings['border-width'] = settings.borderWidth;
    if (settings.borderRadius !== undefined) processedSettings['border-radius'] = settings.borderRadius;
    if (settings.padding !== undefined) processedSettings.padding = settings.padding;
    if (settings.margin !== undefined) processedSettings.margin = settings.margin;
    if (settings.lineHeight !== undefined) processedSettings['line-height'] = settings.lineHeight;
    if (settings.letterSpacing !== undefined) processedSettings['letter-spacing'] = settings.letterSpacing;
    if (settings.textShadow !== undefined) processedSettings['text-shadow'] = settings.textShadow;
    if (settings.opacity !== undefined) processedSettings.opacity = settings.opacity;
    if (settings.transform !== undefined) processedSettings.transform = settings.transform;

    if (Object.keys(processedSettings).length > 0) {
      processed.settings = processedSettings;
    }
    delete processed.subtitleSettings;
  }

  // Apply basic element processing
  return processBasicElement(processed);
}

/**
 * Consolidated basic element processor that handles all simple element types
 * Handles: video, audio, image, voice, component, html, audiogram
 */
export function processBasicElement(element: any): any {
  let processed: any = { ...element };

  // =============================================================================
  // TIMING COLLECTION PROCESSING
  // =============================================================================
  if (processed.timing !== undefined) {
    const timing = processed.timing;
    if (timing.start !== undefined) processed.start = timing.start;
    if (timing.duration !== undefined) processed.duration = timing.duration;
    if (timing.extraTime !== undefined) processed['extra-time'] = timing.extraTime;
    if (timing.fadeIn !== undefined) processed['fade-in'] = timing.fadeIn;
    if (timing.fadeOut !== undefined) processed['fade-out'] = timing.fadeOut;
    if (timing.zIndex !== undefined) processed['z-index'] = timing.zIndex;
    delete processed.timing;
  }

  // =============================================================================
  // AUDIO CONTROLS COLLECTION PROCESSING
  // =============================================================================
  if (processed.audioControls !== undefined) {
    const audio = processed.audioControls;
    if (audio.volume !== undefined) {
      const volume = typeof audio.volume === 'string' ? parseFloat(audio.volume) : audio.volume;
      if (!isNaN(volume)) processed.volume = Math.max(0, Math.min(10, volume));
    }
    if (audio.muted !== undefined) processed.muted = Boolean(audio.muted);
    if (audio.seek !== undefined) {
      const seek = typeof audio.seek === 'string' ? parseFloat(audio.seek) : audio.seek;
      if (!isNaN(seek)) processed.seek = Math.max(0, seek);
    }
    if (audio.loop !== undefined) {
      if (typeof audio.loop === 'boolean') {
        processed.loop = audio.loop ? -1 : 1;
      } else {
        const loopCount = typeof audio.loop === 'string' ? parseInt(audio.loop) : audio.loop;
        if (!isNaN(loopCount)) processed.loop = loopCount;
      }
    }
    delete processed.audioControls;
  }

  // =============================================================================
  // POSITIONING COLLECTION PROCESSING
  // =============================================================================
  if (processed.positioning !== undefined) {
    const pos = processed.positioning;
    if (pos.position !== undefined) processed.position = pos.position;
    if (pos.x !== undefined) {
      const x = typeof pos.x === 'string' ? parseFloat(pos.x) : pos.x;
      if (!isNaN(x)) processed.x = x;
    }
    if (pos.y !== undefined) {
      const y = typeof pos.y === 'string' ? parseFloat(pos.y) : pos.y;
      if (!isNaN(y)) processed.y = y;
    }
    if (pos.width !== undefined) {
      const width = typeof pos.width === 'string' ? parseFloat(pos.width) : pos.width;
      if (!isNaN(width)) processed.width = width > 0 ? width : -1;
    }
    if (pos.height !== undefined) {
      const height = typeof pos.height === 'string' ? parseFloat(pos.height) : pos.height;
      if (!isNaN(height)) processed.height = height > 0 ? height : -1;
    }
    if (pos.resize !== undefined) processed.resize = pos.resize;
    delete processed.positioning;
  }

  // =============================================================================
  // VISUAL EFFECTS COLLECTION PROCESSING
  // =============================================================================
  if (processed.visualEffects !== undefined) {
    const effects = processed.visualEffects;
    if (effects.zoom !== undefined) {
      const zoom = typeof effects.zoom === 'string' ? parseFloat(effects.zoom) : effects.zoom;
      if (!isNaN(zoom)) processed.zoom = zoom;
    }
    if (effects.flipHorizontal !== undefined) processed['flip-horizontal'] = Boolean(effects.flipHorizontal);
    if (effects.flipVertical !== undefined) processed['flip-vertical'] = Boolean(effects.flipVertical);
    if (effects.mask !== undefined) processed.mask = effects.mask;
    if (effects.pan !== undefined) processed.pan = effects.pan;
    if (effects.panDistance !== undefined) {
      const panDistance = typeof effects.panDistance === 'string' ? parseFloat(effects.panDistance) : effects.panDistance;
      if (!isNaN(panDistance)) processed['pan-distance'] = panDistance;
    }
    if (effects.panCrop !== undefined) processed['pan-crop'] = Boolean(effects.panCrop);
    delete processed.visualEffects;
  }

  // =============================================================================
  // CROP SETTINGS COLLECTION PROCESSING
  // =============================================================================
  if (processed.crop !== undefined && typeof processed.crop === 'object' && processed.crop.cropValues) {
    const cropData = processed.crop.cropValues;
    const cropObj: any = {};
    if (cropData.width !== undefined) cropObj.width = cropData.width;
    if (cropData.height !== undefined) cropObj.height = cropData.height;
    if (cropData.x !== undefined) cropObj.x = cropData.x;
    if (cropData.y !== undefined) cropObj.y = cropData.y;
    
    if (Object.keys(cropObj).length > 0) {
      processed.crop = cropObj;
    } else {
      delete processed.crop;
    }
  } else if (processed.crop && typeof processed.crop === 'object' && !processed.crop.cropValues) {
    delete processed.crop;
  }

  // =============================================================================
  // ROTATION SETTINGS COLLECTION PROCESSING
  // =============================================================================
  if (processed.rotate !== undefined && typeof processed.rotate === 'object' && processed.rotate.rotationValues) {
    const rotateData = processed.rotate.rotationValues;
    const rotateObj: any = {};
    if (rotateData.angle !== undefined) rotateObj.angle = rotateData.angle;
    if (rotateData.speed !== undefined) rotateObj.speed = rotateData.speed;
    
    if (Object.keys(rotateObj).length > 0) {
      processed.rotate = rotateObj;
    } else {
      delete processed.rotate;
    }
  } else if (processed.rotate && typeof processed.rotate === 'object' && !processed.rotate.rotationValues) {
    delete processed.rotate;
  }

  // =============================================================================
  // CHROMA KEY SETTINGS COLLECTION PROCESSING
  // =============================================================================
  if (processed.chromaKey !== undefined && typeof processed.chromaKey === 'object' && processed.chromaKey.chromaValues) {
    const chromaData = processed.chromaKey.chromaValues;
    const chromaObj: any = {};
    if (chromaData.color !== undefined) chromaObj.color = chromaData.color;
    if (chromaData.tolerance !== undefined) chromaObj.tolerance = chromaData.tolerance;
    
    if (Object.keys(chromaObj).length > 0) {
      processed['chroma-key'] = chromaObj;
    }
    delete processed.chromaKey;
  } else if (processed.chromaKey && typeof processed.chromaKey === 'object' && !processed.chromaKey.chromaValues) {
    delete processed.chromaKey;
  }

  // =============================================================================
  // COLOR CORRECTION COLLECTION PROCESSING
  // =============================================================================
  if (processed.correction !== undefined && typeof processed.correction === 'object') {
    const correction = processed.correction;
    
    if (correction.brightness !== undefined || correction.contrast !== undefined || 
        correction.gamma !== undefined || correction.saturation !== undefined) {
      const correctionObj: any = {};
      if (correction.brightness !== undefined) correctionObj.brightness = correction.brightness;
      if (correction.contrast !== undefined) correctionObj.contrast = correction.contrast;
      if (correction.gamma !== undefined) correctionObj.gamma = correction.gamma;
      if (correction.saturation !== undefined) correctionObj.saturation = correction.saturation;
      
      if (Object.keys(correctionObj).length > 0) {
        processed.correction = correctionObj;
      }
    } else {
      delete processed.correction;
    }
  }

  // =============================================================================
  // AI GENERATION COLLECTION PROCESSING (for images)
  // =============================================================================
  if (processed.aiGeneration !== undefined) {
    const ai = processed.aiGeneration;
    if (ai.prompt !== undefined) processed.prompt = ai.prompt;
    if (ai.model !== undefined) processed.model = ai.model;
    if (ai.aspectRatio !== undefined) processed['aspect-ratio'] = ai.aspectRatio;
    if (ai.connection !== undefined) processed.connection = ai.connection;
    if (ai.modelSettings !== undefined) processed['model-settings'] = ai.modelSettings;
    delete processed.aiGeneration;
  }

  // =============================================================================
  // VOICE SETTINGS COLLECTION PROCESSING
  // =============================================================================
  if (processed.voiceSettings !== undefined) {
    const voice = processed.voiceSettings;
    if (voice.voice !== undefined) processed.voice = voice.voice;
    if (voice.model !== undefined) processed.model = voice.model;
    if (voice.connection !== undefined) processed.connection = voice.connection;
    delete processed.voiceSettings;
  }

  // =============================================================================
  // COMPONENT SETTINGS COLLECTION PROCESSING
  // =============================================================================
  if (processed.componentSettings !== undefined) {
    const comp = processed.componentSettings;
    if (comp.component !== undefined) processed.component = comp.component;
    if (comp.settings !== undefined) processed.settings = comp.settings;
    delete processed.componentSettings;
  }

  // =============================================================================
  // HTML SETTINGS COLLECTION PROCESSING
  // =============================================================================
  if (processed.htmlSettings !== undefined) {
    const html = processed.htmlSettings;
    if (html.html !== undefined) processed.html = html.html;
    if (html.tailwindcss !== undefined) processed.tailwindcss = Boolean(html.tailwindcss);
    if (html.wait !== undefined) {
      const wait = typeof html.wait === 'string' ? parseFloat(html.wait) : Number(html.wait);
      if (!isNaN(wait)) {
        processed.wait = Math.max(0, Math.min(5, wait));
      } else {
        processed.wait = 2;
      }
    }
    delete processed.htmlSettings;
  }

  // =============================================================================
  // AUDIOGRAM SETTINGS COLLECTION PROCESSING
  // =============================================================================
  if (processed.audiogramSettings !== undefined) {
    const audiogram = processed.audiogramSettings;
    if (audiogram.color !== undefined) processed.color = audiogram.color;
    if (audiogram.opacity !== undefined) {
      const opacity = parseFloat(audiogram.opacity);
      if (!isNaN(opacity)) {
        processed.opacity = Math.max(0, Math.min(1, opacity));
      } else {
        processed.opacity = 0.5;
      }
    }
    if (audiogram.amplitude !== undefined) {
      const amplitude = parseFloat(audiogram.amplitude);
      if (!isNaN(amplitude)) {
        processed.amplitude = Math.max(0, Math.min(10, amplitude));
      } else {
        processed.amplitude = 5;
      }
    }
    delete processed.audiogramSettings;
  }

  // =============================================================================
  // NUMERIC FIELD PROCESSING
  // =============================================================================
  
  // Process direct numeric fields that may come as strings
  if (processed.duration !== undefined) {
    const duration = typeof processed.duration === 'string' ? 
      parseFloat(processed.duration) : Number(processed.duration);
    if (!isNaN(duration) && duration !== -1 && duration !== -2) {
      processed.duration = Math.max(0, duration);
    }
  }

  if (processed.start !== undefined) {
    const start = typeof processed.start === 'string' ? parseFloat(processed.start) : Number(processed.start);
    if (!isNaN(start)) {
      processed.start = Math.max(0, start);
    }
  }

  // Apply common properties processing (id, comment, condition, variables, cache)
  processed = processCommonProperties(processed);

  // Apply camelCase → kebab-case conversions
  processed = convertCamelToKebab(processed);

  return processed;
}

// =============================================================================
// CONSOLIDATED ELEMENT PROCESSORS (for registry)
// =============================================================================

export const processVideoElement = processBasicElement;
export const processAudioElement = processBasicElement;
export const processImageElement = processBasicElement;
export const processVoiceElement = processBasicElement;
export const processComponentElement = processBasicElement;
export const processAudiogramElement = processBasicElement;
export const processHtmlElement = processBasicElement;

// =============================================================================
// ELEMENT PROCESSOR REGISTRY
// =============================================================================

export const ELEMENT_PROCESSORS = {
  video: processVideoElement,
  audio: processAudioElement,
  image: processImageElement,
  text: processTextElement,
  voice: processVoiceElement,
  component: processComponentElement,
  audiogram: processAudiogramElement,
  html: processHtmlElement,
  subtitles: processSubtitleElement,
} as const;

// =============================================================================
// SHARED PROCESSING UTILITIES
// =============================================================================

export type ProcessedElement = Record<string, any>;

/**
 * Convert camelCase object keys to kebab-case for JSON2Video API
 * This handles the mapping from n8n UI field names to API field names
 */
export function convertCamelToKebab(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(convertCamelToKebab);
  }

  if (typeof obj === 'object') {
    const converted: any = {};
    
    for (const [key, value] of Object.entries(obj)) {
      // Convert camelCase keys to kebab-case
      const kebabKey = key.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
      converted[kebabKey] = convertCamelToKebab(value);
    }
    
    return converted;
  }

  return obj;
}

/**
 * Process common element properties
 * Handles: id, comment, condition, variables, cache
 */
export function processCommonProperties(element: any): any {
  const processed = { ...element };

  // These properties pass through as-is (no transformation needed)
  // id, comment, condition, variables, cache all maintain their original values

  return processed;
}

// =============================================================================
// UTILITY FUNCTIONS FOR VALUE PROCESSING
// =============================================================================

/**
 * Process loop values (boolean → number, validation)
 */
export function processLoop(loop: any): number {
  if (typeof loop === 'boolean') {
    return loop ? -1 : 1;
  }
  
  const numericLoop = typeof loop === 'string' ? parseInt(loop) : Number(loop);
  if (isNaN(numericLoop)) {
    return -1; // Default to infinite loop
  }
  
  return numericLoop;
}

/**
 * Process volume values with proper clamping (0-10)
 */
export function processVolume(volume: any): number {
  const numericVolume = typeof volume === 'string' ? parseFloat(volume) : Number(volume);
  if (isNaN(numericVolume)) {
    return 1; // Default volume
  }
  
  return Math.max(0, Math.min(10, numericVolume));
}

/**
 * Process duration values
 */
export function processDuration(duration: any): number {
  const numericDuration = typeof duration === 'string' ? parseFloat(duration) : Number(duration);
  if (isNaN(numericDuration)) {
    return -1; // Default duration
  }
  
  // Special values -1 (auto) and -2 (scene length) are allowed
  if (numericDuration === -1 || numericDuration === -2) {
    return numericDuration;
  }
  
  return Math.max(0, numericDuration);
}

/**
 * Process start time values
 */
export function processStart(start: any): number {
  const numericStart = typeof start === 'string' ? parseFloat(start) : Number(start);
  if (isNaN(numericStart)) {
    return 0; // Default start
  }
  
  return Math.max(0, numericStart);
}

/**
 * Process dimension values (width, height)
 */
export function processDimension(dimension: any): number {
  const numericDimension = typeof dimension === 'string' ? parseFloat(dimension) : Number(dimension);
  if (isNaN(numericDimension)) {
    return -1; // Use default
  }
  
  // Allow -1 for default, otherwise ensure positive
  return numericDimension === -1 ? -1 : Math.max(0, numericDimension);
}

/**
 * Process font size with unit handling
 */
export function processFontSize(fontSize: any): number {
  if (typeof fontSize === 'number') {
    return Math.max(1, fontSize);
  }
  
  if (typeof fontSize === 'string') {
    // Extract numeric value from strings like "16px", "1.2em"
    const match = fontSize.match(/^(\d+(?:\.\d+)?)/);
    if (match) {
      return parseFloat(match[1]);
    }
  }
  return fontSize;
}

// =============================================================================
// PROCESSOR REGISTRY FUNCTIONS
// =============================================================================

/**
 * Get processor function for element type
 */
export function getProcessor(elementType: string): Function | null {
  return ELEMENT_PROCESSORS[elementType as keyof typeof ELEMENT_PROCESSORS] || null;
}

/**
 * Get all supported element types with dedicated processors
 */
export function getSupportedElementTypes(): string[] {
  return Object.keys(ELEMENT_PROCESSORS);
}

/**
 * Check if element type has a dedicated processor
 */
export function isElementTypeSupported(elementType: string): boolean {
  return elementType in ELEMENT_PROCESSORS;
}
