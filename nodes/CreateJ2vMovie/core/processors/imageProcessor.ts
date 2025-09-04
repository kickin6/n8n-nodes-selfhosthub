// nodes/CreateJ2vMovie/core/processors/imageProcessor.ts

import { 
  ProcessedElement, 
  convertCamelToKebab, 
  processCommonProperties, 
  processVisualProperties 
} from './index';

/**
 * Process image element with complete schema support
 * Image elements support visual positioning and image-specific properties (src OR AI generation)
 */
export function processImageElement(element: any): ProcessedElement {
  let processed = { ...element };

  // Image-specific properties (src for regular images) - only process if not undefined
  if (processed.src !== undefined) {
    processed.src = processed.src;
  }

  // AI generation properties (alternative to src) - only process if not undefined
  if (processed.prompt !== undefined) {
    processed.prompt = processed.prompt;
  }
  if (processed.model !== undefined) {
    processed.model = processed.model;
  }
  if (processed.aspectRatio !== undefined) {
    // Convert camelCase to kebab-case for aspect-ratio
    processed['aspect-ratio'] = processed.aspectRatio;
    delete processed.aspectRatio;
  }
  if (processed.connection !== undefined) {
    processed.connection = processed.connection;
  }
  if (processed.modelSettings !== undefined) {
    // Convert camelCase to kebab-case for model-settings
    processed['model-settings'] = processed.modelSettings;
    delete processed.modelSettings;
  }

  // Remove any undefined properties that were set to undefined in the input
  Object.keys(processed).forEach(key => {
    if (processed[key] === undefined) {
      delete processed[key];
    }
  });

  // Apply visual properties (position, dimensions, effects)
  processed = processVisualProperties(processed);

  // Apply common properties (timing, fade, z-index, etc.)
  processed = processCommonProperties(processed);

  // Apply camelCase → kebab-case conversions
  processed = convertCamelToKebab(processed);

  return processed;
}