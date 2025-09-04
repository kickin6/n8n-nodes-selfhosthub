// nodes/CreateJ2vMovie/core/processors/voiceProcessor.ts

import { 
  ProcessedElement, 
  convertCamelToKebab, 
  processCommonProperties, 
  processVolume 
} from './index';

/**
 * Process voice element with complete schema support
 * Voice elements support: voice properties and common timing/fade properties
 * Voice does NOT support positioning or visual effects (audio-only element)
 */
export function processVoiceElement(element: any): ProcessedElement {
  let processed = { ...element };

  // Voice-specific properties
  if (processed.text !== undefined) processed.text = processed.text; // Required field
  if (processed.voice !== undefined) processed.voice = processed.voice;
  if (processed.model !== undefined) processed.model = processed.model;
  if (processed.connection !== undefined) processed.connection = processed.connection;
  if (processed.volume !== undefined) processed.volume = processVolume(processed.volume);
  if (processed.muted !== undefined) processed.muted = Boolean(processed.muted);

  // Apply common properties (timing, fade, z-index, etc.)
  processed = processCommonProperties(processed);

  // Apply camelCase → kebab-case conversions
  processed = convertCamelToKebab(processed);

  return processed;
}