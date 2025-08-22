// nodes/CreateJ2vMovie/utils/textElementProcessor.ts

import { IDataObject } from 'n8n-workflow';
import {
    TextElement,
    TextElementParams,
    TextSettings,
    SubtitleElement,
    SubtitleElementParams,
    SubtitleSettings
} from '../operations/shared/elements';

/**
 * Enhanced text element processor with all API properties
 */
export function processTextElement(params: TextElementParams): TextElement {
    const textElement: TextElement = {
        type: 'text',
        text: params.text,
    };

    // Style
    if (params.style) {
        textElement.style = params.style;
    }

    // Build settings object for text styling
    const settings: TextSettings = {};

    // Font properties
    if (params.fontFamily) settings['font-family'] = params.fontFamily;
    if (params.fontSize) settings['font-size'] = params.fontSize;
    if (params.fontWeight !== undefined) settings['font-weight'] = params.fontWeight;
    if (params.fontColor) settings['font-color'] = params.fontColor;
    if (params.backgroundColor) settings['background-color'] = params.backgroundColor;

    // Text formatting
    if (params.textAlign) settings['text-align'] = params.textAlign;
    if (params.lineHeight) settings['line-height'] = params.lineHeight;
    if (params.letterSpacing) settings['letter-spacing'] = params.letterSpacing;
    if (params.textShadow) settings['text-shadow'] = params.textShadow;
    if (params.textTransform) settings['text-transform'] = params.textTransform;

    // Position within text canvas
    if (params.verticalPosition) settings['vertical-position'] = params.verticalPosition;
    if (params.horizontalPosition) settings['horizontal-position'] = params.horizontalPosition;

    // Add custom settings if provided
    if (params.customSettings) {
        Object.assign(settings, params.customSettings);
    }

    // Only add settings if there are any
    if (Object.keys(settings).length > 0) {
        textElement.settings = settings;
    }

    // Core properties
    if (params.cache !== undefined) textElement.cache = params.cache;
    if (params.comment) textElement.comment = params.comment;
    if (params.condition) textElement.condition = params.condition;

    // Chroma key
    if (params.chromaKeyColor) {
        textElement['chroma-key'] = {
            color: params.chromaKeyColor,
            ...(params.chromaKeyTolerance !== undefined && { tolerance: params.chromaKeyTolerance })
        };
    }

    // Correction
    const correction: any = {};
    if (params.brightness !== undefined) correction.brightness = params.brightness;
    if (params.contrast !== undefined) correction.contrast = params.contrast;
    if (params.gamma !== undefined) correction.gamma = params.gamma;
    if (params.saturation !== undefined) correction.saturation = params.saturation;

    if (Object.keys(correction).length > 0) {
        textElement.correction = correction;
    }

    // Timing
    if (params.duration !== undefined) textElement.duration = params.duration;
    if (params.extraTime !== undefined) textElement['extra-time'] = params.extraTime;
    if (params.start !== undefined) textElement.start = params.start;
    if (params.fadeIn !== undefined) textElement['fade-in'] = params.fadeIn;
    if (params.fadeOut !== undefined) textElement['fade-out'] = params.fadeOut;

    // Transform
    if (params.flipHorizontal !== undefined) textElement['flip-horizontal'] = params.flipHorizontal;
    if (params.flipVertical !== undefined) textElement['flip-vertical'] = params.flipVertical;
    if (params.height !== undefined) textElement.height = params.height;
    if (params.width !== undefined) textElement.width = params.width;
    if (params.mask) textElement.mask = params.mask;

    // Position
    if (params.position) textElement.position = params.position;
    if (params.x !== undefined) textElement.x = params.x;
    if (params.y !== undefined) textElement.y = params.y;
    if (params.zIndex !== undefined) textElement['z-index'] = params.zIndex;

    // Resize
    if (params.resize) textElement.resize = params.resize;

    // Animation
    if (params.pan) textElement.pan = params.pan;
    if (params.panCrop !== undefined) textElement['pan-crop'] = params.panCrop;
    if (params.panDistance !== undefined) textElement['pan-distance'] = params.panDistance;
    if (params.zoom !== undefined) textElement.zoom = params.zoom;

    // Rotation
    if (params.rotateAngle !== undefined || params.rotateSpeed !== undefined) {
        textElement.rotate = {
            angle: params.rotateAngle ?? 0,
            ...(params.rotateSpeed !== undefined && { speed: params.rotateSpeed })
        };
    }

    // Variables
    if (params.variables) textElement.variables = params.variables;

    return textElement;
}

export function validateNoSubtitlesInSceneElements(elements: IDataObject[]): string[] {
    const errors: string[] = [];
    elements.forEach((element, index) => {
        if (element.type === 'subtitles') {
            errors.push(`Element ${index + 1}: Subtitles can only be added at movie level, not in individual scenes`);
        }
    });
    return errors;
}

/**
 * Process subtitle element with proper settings object structure and auto-detection
 */
export function processSubtitleElement(params: SubtitleElementParams): SubtitleElement {
    const subtitleElement: SubtitleElement = {
        type: 'subtitles',
    };

    // Auto-detect URL vs inline content using captions property (NEW FEATURE)
    if (params.captions) {
        if (params.captions.startsWith('http')) {
            // URL detected - use as src
            subtitleElement.src = params.captions;
        } else {
            // Inline content detected - use as text  
            subtitleElement.text = params.captions;
        }
    }
    
    // Fallback to original properties if captions not provided
    if (params.text && !subtitleElement.text) subtitleElement.text = params.text;
    if (params.src && !subtitleElement.src) subtitleElement.src = params.src;
    
    // Basic properties (direct, not in settings)
    if (params.language) subtitleElement.language = params.language;
    if (params.model) subtitleElement.model = params.model; // NEW: API model support
    if (params.position) subtitleElement.position = params.position;

    // Build settings object - this is where most formatting goes for subtitles
    const settings: SubtitleSettings = {};
    
    // Font properties
    if (params.fontFamily) settings['font-family'] = params.fontFamily;
    if (params.fontSize !== undefined) settings['font-size'] = params.fontSize;
    if (params.fontWeight) settings['font-weight'] = params.fontWeight;
    if (params.fontColor) settings['font-color'] = params.fontColor;
    
    // Background and styling
    if (params.backgroundColor) settings['background-color'] = params.backgroundColor;
    if (params.border) settings.border = params.border;
    if (params.borderRadius) settings['border-radius'] = params.borderRadius;
    
    // Text formatting
    if (params.textAlign) settings['text-align'] = params.textAlign;
    if (params.lineHeight) settings['line-height'] = params.lineHeight;
    if (params.letterSpacing) settings['letter-spacing'] = params.letterSpacing;
    if (params.textShadow) settings['text-shadow'] = params.textShadow;
    if (params.textTransform) settings['text-transform'] = params.textTransform;
    
    // Position within subtitle area
    if (params.verticalPosition) settings['vertical-position'] = params.verticalPosition;
    if (params.horizontalPosition) settings['horizontal-position'] = params.horizontalPosition;
    
    // Spacing and layout
    if (params.padding) settings.padding = params.padding;
    if (params.margin) settings.margin = params.margin;
    if (params.maxWidth) settings['max-width'] = params.maxWidth;
    if (params.wordWrap) settings['word-wrap'] = params.wordWrap;
    if (params.whiteSpace) settings['white-space'] = params.whiteSpace;
    
    // Effects
    if (params.opacity !== undefined) settings.opacity = params.opacity;

    // Only add settings if there are any
    if (Object.keys(settings).length > 0) {
        subtitleElement.settings = settings;
    }

    // Direct properties (not in settings)
    if (params.cache !== undefined) subtitleElement.cache = params.cache;
    if (params.comment) subtitleElement.comment = params.comment;
    if (params.condition) subtitleElement.condition = params.condition;

    // Timing
    if (params.start !== undefined) subtitleElement.start = params.start;
    if (params.duration !== undefined) subtitleElement.duration = params.duration;
    if (params.extraTime !== undefined) subtitleElement['extra-time'] = params.extraTime;
    if (params.fadeIn !== undefined) subtitleElement['fade-in'] = params.fadeIn;
    if (params.fadeOut !== undefined) subtitleElement['fade-out'] = params.fadeOut;
    if (params.zIndex !== undefined) subtitleElement['z-index'] = params.zIndex;

    // Variables
    if (params.variables) subtitleElement.variables = params.variables;

    return subtitleElement;
}

/**
 * Validates text element parameters
 */
export function validateTextElementParams(params: TextElementParams): string[] {
    const errors: string[] = [];

    // Required fields
    if (!params.text || params.text.trim() === '') {
        errors.push('Text content is required and cannot be empty');
    }

    // Validate numeric ranges
    if (params.chromaKeyTolerance !== undefined) {
        if (params.chromaKeyTolerance < 1 || params.chromaKeyTolerance > 100) {
            errors.push('Chroma key tolerance must be between 1 and 100');
        }
    }

    if (params.brightness !== undefined) {
        if (params.brightness < -1 || params.brightness > 1) {
            errors.push('Brightness must be between -1 and 1');
        }
    }

    if (params.contrast !== undefined) {
        if (params.contrast < -1000 || params.contrast > 1000) {
            errors.push('Contrast must be between -1000 and 1000');
        }
    }

    if (params.gamma !== undefined) {
        if (params.gamma < 0.1 || params.gamma > 10) {
            errors.push('Gamma must be between 0.1 and 10');
        }
    }

    if (params.saturation !== undefined) {
        if (params.saturation < 0 || params.saturation > 3) {
            errors.push('Saturation must be between 0 and 3');
        }
    }

    if (params.panDistance !== undefined) {
        if (params.panDistance < 0.01 || params.panDistance > 0.5) {
            errors.push('Pan distance must be between 0.01 and 0.5');
        }
    }

    if (params.zoom !== undefined) {
        if (params.zoom < -10 || params.zoom > 10) {
            errors.push('Zoom must be between -10 and 10');
        }
    }

    if (params.rotateAngle !== undefined) {
        if (params.rotateAngle < -360 || params.rotateAngle > 360) {
            errors.push('Rotation angle must be between -360 and 360');
        }
    }

    if (params.zIndex !== undefined) {
        if (params.zIndex < -99 || params.zIndex > 99) {
            errors.push('Z-index must be between -99 and 99');
        }
    }

    // Validate color format (basic hex validation and rgba/rgb support)
    const colorFields = ['fontColor', 'backgroundColor', 'chromaKeyColor'];
    colorFields.forEach(field => {
        const value = (params as any)[field];
        if (value && typeof value === 'string') {
            const trimmedValue = value.trim();
            const isHex = /^#[0-9A-Fa-f]{6}$/.test(trimmedValue);
            const isRgba = trimmedValue.startsWith('rgba(') && trimmedValue.endsWith(')');
            const isRgb = trimmedValue.startsWith('rgb(') && trimmedValue.endsWith(')');

            if (!isHex && !isRgba && !isRgb) {
                errors.push(`${field} must be a valid color (hex like #FF0000, rgb like rgb(255,0,0), or rgba like rgba(255,0,0,0.5))`);
            }
        }
    });

    return errors;
}

/**
 * Validates subtitle element parameters - Updated to support captions property
 */
export function validateSubtitleElementParams(params: SubtitleElementParams): string[] {
    const errors: string[] = [];

    // Check for captions property first (NEW unified approach)
    if (params.captions) {
        if (params.captions.trim() === '') {
            errors.push('Captions content cannot be empty');
        }
    } else {
        // Fallback to legacy validation for text/src properties
        if (params.subtitleSourceType === 'text') {
            if (!params.text || params.text.trim() === '') {
                errors.push('Text content is required when using text source type');
            }
        } else if (params.subtitleSourceType === 'src') {
            if (!params.src || params.src.trim() === '') {
                errors.push('Source URL is required when using file source type');
            }
        } else {
            // If no source type and no captions, require either text or src
            if ((!params.text || params.text.trim() === '') && (!params.src || params.src.trim() === '')) {
                errors.push('Either captions content, text content, or source URL is required');
            }
        }
    }

    // Validate numeric ranges
    if (params.opacity !== undefined) {
        if (params.opacity < 0 || params.opacity > 1) {
            errors.push('Opacity must be between 0 and 1');
        }
    }

    if (params.fadeIn !== undefined) {
        if (params.fadeIn < 0) {
            errors.push('Fade in duration must be 0 or greater');
        }
    }

    if (params.fadeOut !== undefined) {
        if (params.fadeOut < 0) {
            errors.push('Fade out duration must be 0 or greater');
        }
    }

    if (params.zIndex !== undefined) {
        if (params.zIndex < -99 || params.zIndex > 99) {
            errors.push('Z-index must be between -99 and 99');
        }
    }

    // Validate color format (basic hex validation and rgba/rgb support)
    const colorFields = ['fontColor', 'backgroundColor'];
    colorFields.forEach(field => {
        const value = (params as any)[field];
        if (value && typeof value === 'string') {
            const trimmedValue = value.trim();
            const isHex = /^#[0-9A-Fa-f]{6}$/.test(trimmedValue);
            const isRgba = trimmedValue.startsWith('rgba(') && trimmedValue.endsWith(')');
            const isRgb = trimmedValue.startsWith('rgb(') && trimmedValue.endsWith(')');
            
            if (!isHex && !isRgba && !isRgb) {
                errors.push(`${field} must be a valid color (hex like #FF0000, rgb like rgb(255,0,0), or rgba like rgba(255,0,0,0.5))`);
            }
        }
    });

    return errors;
}