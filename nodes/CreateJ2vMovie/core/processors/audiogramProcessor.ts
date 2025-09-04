// nodes/CreateJ2vMovie/core/processors/audiogramProcessor.ts

import { 
  ProcessedElement, 
  convertCamelToKebab, 
  processCommonProperties, 
  processVisualProperties 
} from './index';

/**
 * Process audiogram element with complete schema support
 * Audiogram elements support visual positioning and audiogram-specific properties
 */
export function processAudiogramElement(element: any): ProcessedElement {
  let processed = { ...element };

  // Audiogram-specific properties
  if (processed.color !== undefined) processed.color = processed.color;
  if (processed.opacity !== undefined) {
    const opacity = parseFloat(processed.opacity);
    if (!isNaN(opacity)) {
      processed.opacity = Math.max(0, Math.min(1, opacity));
    } else {
      processed.opacity = 0.5; // Default opacity
    }
  }
  if (processed.amplitude !== undefined) {
    const amplitude = parseFloat(processed.amplitude);
    if (!isNaN(amplitude)) {
      processed.amplitude = Math.max(0, Math.min(10, amplitude));
    } else {
      processed.amplitude = 5; // Default amplitude
    }
  }

  // Apply visual properties (position, dimensions, effects)
  processed = processVisualProperties(processed);

  // Apply common properties (timing, fade, z-index, etc.)
  processed = processCommonProperties(processed);

  // Apply camelCase → kebab-case conversions
  processed = convertCamelToKebab(processed);

  return processed;
}