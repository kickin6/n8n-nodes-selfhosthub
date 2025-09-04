// nodes/CreateJ2vMovie/core/processors/audioProcessor.ts

import { 
  ProcessedElement, 
  convertCamelToKebab, 
  processCommonProperties, 
  processVolume, 
  processLoop,
  processStart
} from './index';

/**
 * Process audio element with complete schema support
 * Audio elements support all common properties plus audio-specific properties
 */
export function processAudioElement(element: any): ProcessedElement {
  let processed = { ...element };

  // Audio-specific properties
  if (processed.src !== undefined) processed.src = processed.src;
  if (processed.seek !== undefined) processed.seek = processStart(processed.seek);
  if (processed.volume !== undefined) processed.volume = processVolume(processed.volume);
  if (processed.muted !== undefined) processed.muted = Boolean(processed.muted);
  if (processed.loop !== undefined) processed.loop = processLoop(processed.loop);

  // Common element properties are handled by processCommonProperties and convertCamelToKebab:
  // - cache, comment, condition, duration, extra-time, fade-in, fade-out
  // - id, start, type, variables, z-index

  // Apply common properties (timing, fade, z-index, etc.)
  processed = processCommonProperties(processed);

  // Apply camelCase → kebab-case conversions
  processed = convertCamelToKebab(processed);

  return processed;
}