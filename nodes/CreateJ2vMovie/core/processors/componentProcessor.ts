// nodes/CreateJ2vMovie/core/processors/componentProcessor.ts

import {
    ProcessedElement,
    convertCamelToKebab,
    processCommonProperties,
    processVisualProperties
} from './index';

/**
 * Process component element with complete schema support
 * Component elements support visual positioning and component-specific properties
 */
export function processComponentElement(element: any): ProcessedElement {
    let processed = { ...element };

    // Component-specific properties
    if (processed.component !== undefined) processed.component = processed.component; // Required field
    if (processed.settings !== undefined) {
        // Preserve settings object as-is for component-specific customization
        processed.settings = JSON.parse(JSON.stringify(processed.settings));
    }

    // Apply visual properties (position, dimensions, effects)
    processed = processVisualProperties(processed);

    // Apply common properties (timing, fade, z-index, etc.)
    processed = processCommonProperties(processed);

    // Apply camelCase → kebab-case conversions
    processed = convertCamelToKebab(processed);

    return processed;
}