// nodes/CreateJ2vMovie/core/processors/subtitleProcessor.ts

import {
    ProcessedElement,
    convertCamelToKebab,
    processCommonProperties
} from './index';
import { SubtitleSettings } from '../../schema/json2videoSchema';

/**
 * Process subtitle element with complete schema support
 * Subtitle elements support subtitle-specific properties and settings object
 * Note: Subtitles can only exist at movie level, never in scenes
 */
export function processSubtitleElement(element: any): ProcessedElement {
    let processed = { ...element };

    // Subtitle content sources (captions, src, or text)
    if (processed.captions !== undefined) processed.captions = processed.captions;
    if (processed.src !== undefined) processed.src = processed.src;
    if (processed.text !== undefined) processed.text = processed.text;

    // Subtitle configuration
    if (processed.language !== undefined) processed.language = processed.language;
    if (processed.model !== undefined) processed.model = processed.model;

    // Process subtitle settings object
    if (processed.settings || hasSubtitleSettingsProperties(processed)) {
        processed.settings = createSubtitleSettings(processed);
    }

    // Apply common properties (timing, fade, z-index, etc.)
    processed = processCommonProperties(processed);

    // Apply camelCase → kebab-case conversions
    processed = convertCamelToKebab(processed);

    return processed;
}

/**
 * Check if element has any subtitle settings properties (camelCase or kebab-case)
 */
function hasSubtitleSettingsProperties(element: any): boolean {
    const settingsProps = [
        'style', 'allCaps', 'all-caps', 'fontFamily', 'font-family', 'fontSize', 'font-size',
        'fontUrl', 'font-url', 'position', 'wordColor', 'word-color', 'lineColor', 'line-color',
        'boxColor', 'box-color', 'outlineColor', 'outline-color', 'outlineWidth', 'outline-width',
        'shadowColor', 'shadow-color', 'shadowOffset', 'shadow-offset', 'maxWordsPerLine', 'max-words-per-line',
        'x', 'y', 'keywords', 'replace'
    ];

    return settingsProps.some(prop => element[prop] !== undefined);
}

/**
 * Create subtitle settings object with kebab-case properties
 */
function createSubtitleSettings(element: any): SubtitleSettings {
    const settings: SubtitleSettings = {};

    // Copy existing settings object if present
    if (element.settings && typeof element.settings === 'object') {
        Object.assign(settings, element.settings);
    }

    // Map camelCase properties to kebab-case in settings
    const propertyMappings = [
        ['style', 'style'],
        ['allCaps', 'all-caps'],
        ['fontFamily', 'font-family'],
        ['fontSize', 'font-size'],
        ['fontUrl', 'font-url'],
        ['position', 'position'],
        ['wordColor', 'word-color'],
        ['lineColor', 'line-color'],
        ['boxColor', 'box-color'],
        ['outlineColor', 'outline-color'],
        ['outlineWidth', 'outline-width'],
        ['shadowColor', 'shadow-color'],
        ['shadowOffset', 'shadow-offset'],
        ['maxWordsPerLine', 'max-words-per-line'],
        ['x', 'x'],
        ['y', 'y'],
        ['keywords', 'keywords'],
        ['replace', 'replace']
    ];

    propertyMappings.forEach(([camelCase, kebabCase]) => {
        if (element[camelCase] !== undefined) {
            settings[kebabCase as keyof SubtitleSettings] = element[camelCase];
            delete element[camelCase]; // Remove from main element
        }
    });

    // Handle numeric conversions for specific properties
    if (settings['font-size'] !== undefined) {
        const fontSize = typeof settings['font-size'] === 'string' ? parseFloat(settings['font-size']) : Number(settings['font-size']);
        if (!isNaN(fontSize)) {
            settings['font-size'] = fontSize;
        }
    }

    if (settings['outline-width'] !== undefined) {
        const outlineWidth = typeof settings['outline-width'] === 'string' ? parseFloat(settings['outline-width']) : Number(settings['outline-width']);
        if (!isNaN(outlineWidth)) {
            settings['outline-width'] = Math.max(0, outlineWidth);
        }
    }

    if (settings['shadow-offset'] !== undefined) {
        const shadowOffset = typeof settings['shadow-offset'] === 'string' ? parseFloat(settings['shadow-offset']) : Number(settings['shadow-offset']);
        if (!isNaN(shadowOffset)) {
            settings['shadow-offset'] = shadowOffset;
        }
    }

    if (settings['max-words-per-line'] !== undefined) {
        const maxWords = typeof settings['max-words-per-line'] === 'string' ? parseInt(settings['max-words-per-line']) : Number(settings['max-words-per-line']);
        if (!isNaN(maxWords)) {
            settings['max-words-per-line'] = Math.max(1, maxWords);
        }
    }

    // Handle boolean conversion for all-caps
    if (settings['all-caps'] !== undefined) {
        const value = settings['all-caps'] as any;
        if (typeof value === 'string') {
            settings['all-caps'] = value.toLowerCase() === 'true';
        } else {
            settings['all-caps'] = Boolean(value);
        }
    }

    return settings;
}