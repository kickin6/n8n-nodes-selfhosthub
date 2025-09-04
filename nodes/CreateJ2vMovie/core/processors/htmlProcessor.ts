// nodes/CreateJ2vMovie/core/processors/htmlProcessor.ts

import { 
  ProcessedElement, 
  convertCamelToKebab, 
  processCommonProperties 
} from './index';

/**
 * Process HTML element with complete schema support
 * HTML elements support all VisualElement properties plus HTML-specific properties
 * HTML elements are scene-level only (not allowed in movie elements)
 */
export function processHtmlElement(element: any): ProcessedElement {
  let processed = { ...element };

  // HTML-specific properties
  if (processed.html !== undefined) processed.html = processed.html;
  if (processed.src !== undefined) processed.src = processed.src;
  if (processed.tailwindcss !== undefined) processed.tailwindcss = Boolean(processed.tailwindcss);
  if (processed.wait !== undefined) processed.wait = processWait(processed.wait);

  // Visual properties are handled by processCommonProperties and convertCamelToKebab:
  // - position, x, y, width, height, resize, crop, rotate, pan, pan-distance, pan-crop
  // - zoom, flip-horizontal, flip-vertical, mask, chroma-key, correction

  // Common element properties are handled by processCommonProperties and convertCamelToKebab:
  // - cache, comment, condition, duration, extra-time, fade-in, fade-out
  // - id, start, type, variables, z-index

  // Apply common properties (timing, fade, z-index, visual effects, etc.)
  processed = processCommonProperties(processed);

  // Apply camelCase → kebab-case conversions
  processed = convertCamelToKebab(processed);

  return processed;
}

/**
 * Process wait property with validation and type conversion
 * Wait must be a number between 0 and 5 seconds
 */
function processWait(wait: any): number {
  if (wait === undefined || wait === null) return 2; // Default value from schema

  // Convert string to number if possible
  const numericWait = typeof wait === 'string' ? parseFloat(wait) : Number(wait);

  // Return default if not a valid number
  if (isNaN(numericWait)) return 2;

  // Clamp to valid range (0-5 seconds)
  return Math.max(0, Math.min(5, numericWait));
}