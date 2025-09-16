// nodes/CreateJ2vMovie/core/processors.ts

// =============================================================================
// ELEMENT PROCESSORS - JSON OBJECTS HANDLED IN PARAMETER COLLECTOR
// =============================================================================

/**
 * Process text element with complete text settings object
 */
export function processTextElement(element: any): any {
  let processed = processCommonProperties(element);

  // Text elements already have settings object built in parameter collector
  // Just ensure kebab-case conversion is applied
  processed = convertCamelToKebab(processed);

  return processed;
}

/**
 * Process subtitle element with complete subtitle settings object  
 */
export function processSubtitleElement(element: any): any {
  let processed = processCommonProperties(element);

  // Subtitle elements already have settings object built in parameter collector
  // Just ensure kebab-case conversion is applied
  processed = convertCamelToKebab(processed);

  return processed;
}

/**
 * Unified basic element processor - handles all simple element types
 */
export function processBasicElement(element: any): any {
  let processed = processCommonProperties(element);

  // All complex objects (crop, rotate, chroma-key, correction) are already
  // parsed from JSON strings in the parameter collector
  // Just ensure kebab-case conversion is applied
  processed = convertCamelToKebab(processed);

  return processed;
}

// =============================================================================
// ELEMENT PROCESSOR REGISTRY
// =============================================================================

export const processVideoElement = processBasicElement;
export const processAudioElement = processBasicElement;
export const processImageElement = processBasicElement;
export const processVoiceElement = processBasicElement;
export const processComponentElement = processBasicElement;
export const processAudiogramElement = processBasicElement;
export const processHtmlElement = processBasicElement;

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
 * Handles: id, comment, condition, variables, cache, timing properties
 */
export function processCommonProperties(element: any): any {
  const processed = { ...element };

  // Common properties pass through as-is
  // The parameter collector already handles the proper structure
  // This function mainly exists for consistency and future extensibility
  
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

// =============================================================================
// MASK FIELD PROCESSING (NEW)
// =============================================================================

/**
 * Process mask field - ensures proper URL format
 */
export function processMask(mask: any): string | undefined {
  if (!mask || typeof mask !== 'string' || mask.trim() === '') {
    return undefined;
  }
  
  return mask.trim();
}

// =============================================================================
// PAN-CROP PROCESSING (FIXED)  
// =============================================================================

/**
 * Process pan-crop field with correct kebab-case naming
 */
export function processPanCrop(panCrop: any): boolean | undefined {
  if (panCrop === undefined || panCrop === null) {
    return undefined;
  }
  
  return Boolean(panCrop);
}