// nodes/CreateJ2vMovie/core/processors/textProcessor.ts

import { 
  ProcessedElement, 
  convertCamelToKebab, 
  processCommonProperties 
} from './index';
import { TextSettings } from '../../schema/json2videoSchema';

/**
 * Process text element with complete schema support
 * Text elements support text-specific properties and settings object
 * Text elements can appear in both movie and scene levels
 */
export function processTextElement(element: any): ProcessedElement {
  let processed = { ...element };

  // Text-specific properties
  if (processed.text !== undefined) processed.text = processed.text; // Required field
  if (processed.style !== undefined) processed.style = processed.style;

  // Basic positioning properties (separate from settings)
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
      processed.width = width < 0 ? -1 : width;
    }
  }
  if (processed.height !== undefined) {
    const height = parseFloat(processed.height);
    if (!isNaN(height)) {
      processed.height = height < 0 ? -1 : height;
    }
  }
  if (processed.resize !== undefined) processed.resize = processed.resize;

  // Process text settings object
  if (processed.settings || hasTextSettingsProperties(processed)) {
    processed.settings = createTextSettings(processed);
  }

  // Apply common properties (timing, fade, z-index, etc.)
  processed = processCommonProperties(processed);

  // Apply camelCase → kebab-case conversions
  processed = convertCamelToKebab(processed);

  return processed;
}

/**
 * Check if element has any text settings properties (camelCase or kebab-case)
 */
function hasTextSettingsProperties(element: any): boolean {
  const settingsProps = [
    'fontFamily', 'font-family', 'fontSize', 'font-size', 'fontWeight', 'font-weight',
    'fontColor', 'font-color', 'backgroundColor', 'background-color', 'textAlign', 'text-align',
    'verticalPosition', 'vertical-position', 'horizontalPosition', 'horizontal-position',
    'lineHeight', 'line-height', 'letterSpacing', 'letter-spacing', 'textShadow', 'text-shadow',
    'textDecoration', 'text-decoration', 'textTransform', 'text-transform'
  ];
  
  return settingsProps.some(prop => element[prop] !== undefined);
}

/**
 * Create text settings object with kebab-case properties
 */
function createTextSettings(element: any): TextSettings {
  const settings: TextSettings = {};

  // Copy existing settings object if present
  if (element.settings && typeof element.settings === 'object') {
    Object.assign(settings, element.settings);
  }

  // Map camelCase properties to kebab-case in settings
  const propertyMappings = [
    ['fontFamily', 'font-family'],
    ['fontSize', 'font-size'],
    ['fontWeight', 'font-weight'],
    ['fontColor', 'font-color'],
    ['backgroundColor', 'background-color'],
    ['textAlign', 'text-align'],
    ['verticalPosition', 'vertical-position'],
    ['horizontalPosition', 'horizontal-position'],
    ['lineHeight', 'line-height'],
    ['letterSpacing', 'letter-spacing'],
    ['textShadow', 'text-shadow'],
    ['textDecoration', 'text-decoration'],
    ['textTransform', 'text-transform']
  ];

  propertyMappings.forEach(([camelCase, kebabCase]) => {
    if (element[camelCase] !== undefined) {
      settings[kebabCase as keyof TextSettings] = element[camelCase];
      delete element[camelCase]; // Remove from main element
    }
  });

  // Handle numeric/string conversions for specific properties
  if (settings['font-size'] !== undefined) {
    // Font size can be number or string (with units)
    const fontSize = settings['font-size'];
    if (typeof fontSize === 'number') {
      settings['font-size'] = fontSize;
    } else if (typeof fontSize === 'string') {
      const parsed = parseFloat(fontSize);
      if (!isNaN(parsed) && fontSize.match(/^\d+(\.\d+)?$/)) {
        // Pure numeric string gets 'px' units added
        settings['font-size'] = fontSize + 'px';
      } else {
        settings['font-size'] = fontSize; // Preserve strings with units or invalid formats
      }
    }
  }

  if (settings['font-weight'] !== undefined) {
    // Font weight can be number or string
    const fontWeight = settings['font-weight'];
    if (typeof fontWeight === 'string') {
      const parsed = parseInt(fontWeight);
      if (!isNaN(parsed)) {
        settings['font-weight'] = parsed;
      } else {
        settings['font-weight'] = fontWeight; // Keep string values like "bold", "normal"
      }
    }
  }

  if (settings['line-height'] !== undefined) {
    const lineHeightValue = settings['line-height'];
    let lineHeight: number;
    
    if (typeof lineHeightValue === 'number') {
      lineHeight = lineHeightValue;
    } else {
      lineHeight = parseFloat(String(lineHeightValue));
    }
    
    if (!isNaN(lineHeight)) {
      settings['line-height'] = Math.max(0.1, lineHeight);
    }
  }

  if (settings['letter-spacing'] !== undefined) {
    const letterSpacingValue = settings['letter-spacing'];
    let letterSpacing: number;
    
    if (typeof letterSpacingValue === 'number') {
      letterSpacing = letterSpacingValue;
    } else {
      letterSpacing = parseFloat(String(letterSpacingValue));
    }
    
    if (!isNaN(letterSpacing)) {
      settings['letter-spacing'] = letterSpacing;
    }
  }

  return settings;
}