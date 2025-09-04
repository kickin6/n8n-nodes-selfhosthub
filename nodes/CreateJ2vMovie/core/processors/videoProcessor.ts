// nodes/CreateJ2vMovie/core/processors/videoProcessor.ts

import { 
  ProcessedElement, 
  convertCamelToKebab, 
  processCommonProperties, 
  processVisualProperties,
  processVolume,
  processLoop,
  processStart
} from './index';

/**
 * Process video element with complete schema support
 * Video elements support visual positioning, audio properties, and video-specific properties
 */
export function processVideoElement(element: any): ProcessedElement {
  let processed = { ...element };

  // Video-specific properties
  if (processed.src !== undefined) processed.src = processed.src;
  if (processed.seek !== undefined) processed.seek = processStart(processed.seek);
  if (processed.volume !== undefined) processed.volume = processVolume(processed.volume);
  if (processed.muted !== undefined) processed.muted = Boolean(processed.muted);
  if (processed.loop !== undefined) processed.loop = processLoop(processed.loop);

  // Apply visual properties (position, dimensions, effects)
  processed = processVisualProperties(processed);

  // Apply common properties (timing, fade, z-index, etc.)
  processed = processCommonProperties(processed);

  // Apply camelCase → kebab-case conversions
  processed = convertCamelToKebab(processed);

  return processed;
}