// nodes/CreateJ2vMovie/core/processors/index.ts

import { API_RULES } from '../../schema/json2videoSchema';

// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

export interface ProcessedElement {
  type: string;
  [key: string]: any;
}

export interface ElementProcessor<T = any> {
  (element: T): ProcessedElement;
}

// =============================================================================
// SHARED TRANSFORMATION UTILITIES
// =============================================================================

/**
 * Convert camelCase properties to kebab-case for API compliance
 */
export function convertCamelToKebab(obj: any): any {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
    return obj;
  }

  const converted = { ...obj };
  
  const conversions: Record<string, string> = {
    backgroundColor: 'background-color',
    extraTime: 'extra-time',
    panDistance: 'pan-distance',
    panCrop: 'pan-crop',
    flipHorizontal: 'flip-horizontal',
    flipVertical: 'flip-vertical',
    chromaKey: 'chroma-key',
    fadeIn: 'fade-in',
    fadeOut: 'fade-out',
    zIndex: 'z-index',
    aspectRatio: 'aspect-ratio',
    modelSettings: 'model-settings',
    allCaps: 'all-caps',
    fontFamily: 'font-family',
    fontSize: 'font-size',
    fontWeight: 'font-weight',
    fontColor: 'font-color',
    fontUrl: 'font-url',
    textAlign: 'text-align',
    verticalPosition: 'vertical-position',
    horizontalPosition: 'horizontal-position',
    lineHeight: 'line-height',
    letterSpacing: 'letter-spacing',
    textShadow: 'text-shadow',
    textDecoration: 'text-decoration',
    textTransform: 'text-transform',
    wordColor: 'word-color',
    lineColor: 'line-color',
    boxColor: 'box-color',
    outlineColor: 'outline-color',
    shadowColor: 'shadow-color',
    outlineWidth: 'outline-width',
    shadowOffset: 'shadow-offset',
    maxWordsPerLine: 'max-words-per-line'
  };

  Object.entries(conversions).forEach(([camelCase, kebabCase]) => {
    if (converted.hasOwnProperty(camelCase)) {
      converted[kebabCase] = converted[camelCase];
      delete converted[camelCase];
    }
  });

  return converted;
}

/**
 * Process common element properties (timing, positioning, etc.)
 */
export function processCommonProperties(element: any): any {
  const processed = { ...element };

  // Process duration - handle special values -1 and -2
  if (processed.duration !== undefined) {
    processed.duration = processDuration(processed.duration);
  }

  // Process start time
  if (processed.start !== undefined) {
    processed.start = processStart(processed.start);
  }

  return processed;
}

/**
 * Process visual element properties (positioning, dimensions, effects)
 * Used by video, image, component, audiogram elements
 */
export function processVisualProperties(element: any): any {
  const processed = { ...element };

  // Basic positioning and dimensions
  if (processed.position !== undefined) processed.position = processed.position;
  if (processed.x !== undefined) {
    const x = parseFloat(processed.x);
    if (!isNaN(x)) processed.x = x;
  }
  if (processed.y !== undefined) {
    const y = parseFloat(processed.y);
    if (!isNaN(y)) processed.y = y;
  }
  if (processed.width !== undefined) {
    const width = parseFloat(processed.width);
    if (!isNaN(width)) {
      processed.width = width < 0 ? -1 : width; // Allow -1 for auto, clamp other negatives
    }
  }
  if (processed.height !== undefined) {
    const height = parseFloat(processed.height);
    if (!isNaN(height)) {
      processed.height = height < 0 ? -1 : height; // Allow -1 for auto, clamp other negatives
    }
  }
  if (processed.resize !== undefined) processed.resize = processed.resize;

  // Visual effects (these properties are preserved as-is, camelCase conversion handled later)
  if (processed.crop !== undefined) processed.crop = processed.crop;
  if (processed.rotate !== undefined) processed.rotate = processed.rotate;
  if (processed.pan !== undefined) processed.pan = processed.pan;
  if (processed.panDistance !== undefined) {
    const panDistance = parseFloat(processed.panDistance);
    if (!isNaN(panDistance)) {
      processed.panDistance = Math.max(API_RULES.VALIDATION_RANGES['pan-distance'].min, 
                                      Math.min(API_RULES.VALIDATION_RANGES['pan-distance'].max, panDistance));
    }
  }
  if (processed.panCrop !== undefined) processed.panCrop = Boolean(processed.panCrop);
  if (processed.zoom !== undefined) {
    const zoom = parseFloat(processed.zoom);
    if (!isNaN(zoom)) {
      processed.zoom = Math.max(API_RULES.VALIDATION_RANGES.zoom.min, 
                               Math.min(API_RULES.VALIDATION_RANGES.zoom.max, zoom));
    }
  }
  if (processed.flipHorizontal !== undefined) processed.flipHorizontal = Boolean(processed.flipHorizontal);
  if (processed.flipVertical !== undefined) processed.flipVertical = Boolean(processed.flipVertical);
  if (processed.mask !== undefined) processed.mask = processed.mask;
  if (processed.chromaKey !== undefined) processed.chromaKey = processed.chromaKey;
  if (processed.correction !== undefined) processed.correction = processed.correction;

  return processed;
}

/**
 * Parse and validate volume (0-10 range)
 */
export function processVolume(volume: any): number {
  const parsed = typeof volume === 'string' ? parseFloat(volume) : Number(volume);
  if (isNaN(parsed)) {
    return 1; // Default volume
  }
  return Math.max(0, Math.min(API_RULES.VALIDATION_RANGES.volume.max, parsed));
}

/**
 * Parse duration with special value handling
 */
export function processDuration(duration: any): number {
  const parsed = typeof duration === 'string' ? parseFloat(duration) : Number(duration);
  if (isNaN(parsed)) {
    return -1; // Default auto-duration
  }
  // Allow special values -1 (auto) and -2 (match container)
  if (parsed === -1 || parsed === -2) {
    return parsed;
  }
  return Math.max(0, parsed);
}

/**
 * Parse start time (must be >= 0)
 */
export function processStart(start: any): number {
  const parsed = typeof start === 'string' ? parseFloat(start) : Number(start);
  if (isNaN(parsed)) {
    return 0; // Default start
  }
  return Math.max(0, parsed);
}

/**
 * Convert boolean loop to numeric format
 */
export function processLoop(loop: any): number {
  if (typeof loop === 'boolean') {
    return loop ? -1 : 1; // -1 = infinite, 1 = play once
  }
  return loop; // Pass through if already numeric
}

/**
 * Convert boolean crop to resize mode
 */
export function processCrop(crop: boolean): string {
  return crop ? 'cover' : 'contain';
}

/**
 * Ensure color has # prefix
 */
export function processColor(color: string): string {
  if (!color.startsWith('#')) {
    return `#${color}`;
  }
  return color;
}

/**
 * Parse font size - handle string values with units
 */
export function processFontSize(fontSize: any): string | number {
  if (typeof fontSize === 'string') {
    const numericSize = parseFloat(fontSize.replace(/px|pt|em|rem/g, ''));
    return isNaN(numericSize) ? fontSize : numericSize;
  }
  return fontSize;
}

// =============================================================================
// FALLBACK PROCESSING
// =============================================================================

/**
 * Fallback processor for unknown element types
 * Uses basic transformations without element-specific logic
 */
export function processFallbackElement(element: any): ProcessedElement {
  let processed = { ...element };

  // Apply common transformations
  if (processed.loop !== undefined) processed.loop = processLoop(processed.loop);
  if (processed.volume !== undefined) processed.volume = processVolume(processed.volume);
  
  // Apply common properties
  processed = processCommonProperties(processed);
  
  // Apply camelCase conversions
  processed = convertCamelToKebab(processed);

  return processed;
}

// =============================================================================
// PROCESSOR REGISTRY  
// =============================================================================

// Import processors - all processors should exist when this module is used
import { processVideoElement } from './videoProcessor';
import { processAudioElement } from './audioProcessor';
import { processImageElement } from './imageProcessor';
import { processTextElement } from './textProcessor';
import { processVoiceElement } from './voiceProcessor';
import { processSubtitleElement } from './subtitleProcessor';
import { processComponentElement } from './componentProcessor';
import { processAudiogramElement } from './audiogramProcessor';

export const ELEMENT_PROCESSORS: Record<string, ElementProcessor> = {
  video: processVideoElement,
  audio: processAudioElement,
  image: processImageElement,
  text: processTextElement,
  voice: processVoiceElement,
  subtitles: processSubtitleElement,
  component: processComponentElement,
  audiogram: processAudiogramElement,
};

/**
 * Get processor function for element type
 */
export function getProcessor(elementType: string): ElementProcessor | null {
  return ELEMENT_PROCESSORS[elementType] || null;
}

/**
 * Get all supported element types
 */
export function getSupportedElementTypes(): string[] {
  return Object.keys(ELEMENT_PROCESSORS);
}

/**
 * Check if element type is supported
 */
export function isElementTypeSupported(elementType: string): boolean {
  return elementType in ELEMENT_PROCESSORS;
}