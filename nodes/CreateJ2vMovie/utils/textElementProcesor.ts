import { TextElement, TextElementParams, TextSettings } from '../operations/shared/elements';

/**
 * Converts Node.js parameters to json2video text element format
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

	// Build settings object
	const settings: TextSettings = {};
	
	if (params.fontFamily) {
		settings['font-family'] = params.fontFamily;
	}
	if (params.fontSize) {
		settings['font-size'] = params.fontSize;
	}
	if (params.fontWeight !== undefined) {
		settings['font-weight'] = params.fontWeight;
	}
	if (params.fontColor) {
		settings['font-color'] = params.fontColor;
	}
	if (params.backgroundColor) {
		settings['background-color'] = params.backgroundColor;
	}
	if (params.textAlign) {
		settings['text-align'] = params.textAlign;
	}
	if (params.verticalPosition) {
		settings['vertical-position'] = params.verticalPosition;
	}
	if (params.horizontalPosition) {
		settings['horizontal-position'] = params.horizontalPosition;
	}

	// Add custom settings if provided
	if (params.customSettings) {
		Object.assign(settings, params.customSettings);
	}

	// Only add settings if there are any
	if (Object.keys(settings).length > 0) {
		textElement.settings = settings;
	}

	// Core properties
	if (params.cache !== undefined) {
		textElement.cache = params.cache;
	}
	if (params.comment) {
		textElement.comment = params.comment;
	}
	if (params.condition) {
		textElement.condition = params.condition;
	}

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
	if (params.duration !== undefined) {
		textElement.duration = params.duration;
	}
	if (params.extraTime !== undefined) {
		textElement['extra-time'] = params.extraTime;
	}
	if (params.start !== undefined) {
		textElement.start = params.start;
	}
	if (params.fadeIn !== undefined) {
		textElement['fade-in'] = params.fadeIn;
	}
	if (params.fadeOut !== undefined) {
		textElement['fade-out'] = params.fadeOut;
	}

	// Transform
	if (params.flipHorizontal !== undefined) {
		textElement['flip-horizontal'] = params.flipHorizontal;
	}
	if (params.flipVertical !== undefined) {
		textElement['flip-vertical'] = params.flipVertical;
	}
	if (params.height !== undefined) {
		textElement.height = params.height;
	}
	if (params.width !== undefined) {
		textElement.width = params.width;
	}
	if (params.mask) {
		textElement.mask = params.mask;
	}

	// Position
	if (params.position) {
		textElement.position = params.position;
	}
	if (params.x !== undefined) {
		textElement.x = params.x;
	}
	if (params.y !== undefined) {
		textElement.y = params.y;
	}
	if (params.zIndex !== undefined) {
		textElement['z-index'] = params.zIndex;
	}

	// Resize
	if (params.resize) {
		textElement.resize = params.resize;
	}

	// Animation
	if (params.pan) {
		textElement.pan = params.pan;
	}
	if (params.panCrop !== undefined) {
		textElement['pan-crop'] = params.panCrop;
	}
	if (params.panDistance !== undefined) {
		textElement['pan-distance'] = params.panDistance;
	}
	if (params.zoom !== undefined) {
		textElement.zoom = params.zoom;
	}

	// Rotation
	if (params.rotateAngle !== undefined || params.rotateSpeed !== undefined) {
		textElement.rotate = {
			angle: params.rotateAngle ?? 0,
			...(params.rotateSpeed !== undefined && { speed: params.rotateSpeed })
		};
	}

	// Variables
	if (params.variables) {
		textElement.variables = params.variables;
	}

	return textElement;
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

	// Validate color format (basic hex validation)
	const colorFields = ['fontColor', 'backgroundColor', 'chromaKeyColor'];
	colorFields.forEach(field => {
		const value = (params as any)[field];
		if (value && typeof value === 'string' && !value.match(/^#[0-9A-Fa-f]{6}$/)) {
			errors.push(`${field} must be a valid hex color (e.g., #FF0000)`);
		}
	});

	return errors;
}