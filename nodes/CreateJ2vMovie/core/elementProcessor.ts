// nodes/CreateJ2vMovie/core/elementProcessor.ts

import { 
  processTextElement, 
  processSubtitleElement, 
  processBasicElement,
  ELEMENT_PROCESSORS 
} from './processors';

// =============================================================================
// MAIN ELEMENT PROCESSOR ROUTER
// =============================================================================

export function processElement(element: any): any {
  if (!element || !element.type) {
    throw new Error('Element must have a type property');
  }

  const elementType = element.type;

  // Use processor from registry if available, otherwise use basic processor
  const processor = ELEMENT_PROCESSORS[elementType as keyof typeof ELEMENT_PROCESSORS];
  if (processor) {
    return processor(element);
  }

  // Fallback to basic processor for unknown types
  return processBasicElement(element);
}

// =============================================================================
// BATCH PROCESSING UTILITIES
// =============================================================================

export function processElements(elements: any[]): {
  processed: any[];
  errors: string[];
} {
  const processed: any[] = [];
  const errors: string[] = [];

  if (!Array.isArray(elements)) {
    return { processed: [], errors: ['Elements must be an array'] };
  }

  for (let i = 0; i < elements.length; i++) {
    try {
      const processedElement = processElement(elements[i]);
      processed.push(processedElement);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      errors.push(`Element ${i}: ${errorMessage}`);
    }
  }

  return { processed, errors };
}

// Re-export main functions for backward compatibility
export { processTextElement, processSubtitleElement, processBasicElement } from './processors';