// __tests__/nodes/CreateJ2vMovie/utils/textElementProcessor.test.ts

import {
	processTextElement,
	processSubtitleElement,
	validateTextElementParams,
	validateSubtitleElementParams,
	validateNoSubtitlesInSceneElements
} from '@nodes/CreateJ2vMovie/utils/textElementProcessor';
import { TextElementParams, SubtitleElementParams } from '@nodes/CreateJ2vMovie/operations/shared/elements';
import { IDataObject } from 'n8n-workflow';

describe('Text Element Processing', () => {
	test('should process text element with font settings', () => {
		const params: TextElementParams = {
			text: 'Hello World',
			fontFamily: 'Roboto',
			fontSize: '32px',
			fontWeight: '600',
			fontColor: '#FFFFFF',
			backgroundColor: '#000000',
			textAlign: 'center'
		};

		const result = processTextElement(params);

		expect(result.type).toBe('text');
		expect(result.text).toBe('Hello World');
		expect(result.settings).toEqual({
			'font-family': 'Roboto',
			'font-size': '32px',
			'font-weight': '600',
			'font-color': '#FFFFFF',
			'background-color': '#000000',
			'text-align': 'center'
		});
	});

	test('should process text element with position settings', () => {
		const params: TextElementParams = {
			text: 'Hello World',
			verticalPosition: 'bottom',
			horizontalPosition: 'center',
			position: 'bottom-left',
			x: 50,
			y: 100,
			zIndex: 10
		};

		const result = processTextElement(params);

		expect(result.settings).toEqual({
			'vertical-position': 'bottom',
			'horizontal-position': 'center'
		});
		expect(result.position).toBe('bottom-left');
		expect(result.x).toBe(50);
		expect(result.y).toBe(100);
		expect(result['z-index']).toBe(10);
	});

	test('should process text element with timing properties', () => {
		const params: TextElementParams = {
			text: 'Hello World',
			start: 2.5,
			duration: 10,
			extraTime: 1,
			fadeIn: 0.5,
			fadeOut: 0.5
		};

		const result = processTextElement(params);

		expect(result.start).toBe(2.5);
		expect(result.duration).toBe(10);
		expect(result['extra-time']).toBe(1);
		expect(result['fade-in']).toBe(0.5);
		expect(result['fade-out']).toBe(0.5);
	});

	test('should process text element with transform properties', () => {
		const params: TextElementParams = {
			text: 'Hello World',
			width: 800,
			height: 600,
			flipHorizontal: true,
			flipVertical: false,
			resize: 'cover'
		};

		const result = processTextElement(params);

		expect(result.width).toBe(800);
		expect(result.height).toBe(600);
		expect(result['flip-horizontal']).toBe(true);
		expect(result['flip-vertical']).toBe(false);
		expect(result.resize).toBe('cover');
	});

	test('should process text element with animation properties', () => {
		const params: TextElementParams = {
			text: 'Hello World',
			pan: 'left',
			panCrop: false,
			panDistance: 0.2,
			zoom: 2,
			rotateAngle: 45,
			rotateSpeed: 2
		};

		const result = processTextElement(params);

		expect(result.pan).toBe('left');
		expect(result['pan-crop']).toBe(false);
		expect(result['pan-distance']).toBe(0.2);
		expect(result.zoom).toBe(2);
		expect(result.rotate).toEqual({
			angle: 45,
			speed: 2
		});
	});

	test('should process text element with chroma key', () => {
		const params: TextElementParams = {
			text: 'Hello World',
			chromaKeyColor: '#00FF00',
			chromaKeyTolerance: 50
		};

		const result = processTextElement(params);

		expect(result['chroma-key']).toEqual({
			color: '#00FF00',
			tolerance: 50
		});
	});

	test('should process text element with correction settings', () => {
		const params: TextElementParams = {
			text: 'Hello World',
			brightness: 0.2,
			contrast: 1.5,
			gamma: 1.2,
			saturation: 1.1
		};

		const result = processTextElement(params);

		expect(result.correction).toEqual({
			brightness: 0.2,
			contrast: 1.5,
			gamma: 1.2,
			saturation: 1.1
		});
	});

	test('should process text element with style and custom settings', () => {
		const params: TextElementParams = {
			text: 'Hello World',
			style: '002',
			customSettings: {
				'text-shadow': '2px 2px 4px #000000'
			}
		};

		const result = processTextElement(params);

		expect(result.style).toBe('002');
		expect(result.settings).toEqual({
			'text-shadow': '2px 2px 4px #000000'
		});
	});

	test('should process text element with all optional properties', () => {
		const params: TextElementParams = {
			text: 'Hello World',
			cache: false,
			comment: 'Test comment',
			condition: 'some condition',
			mask: 'https://example.com/mask.png',
			variables: { key: 'value' }
		};

		const result = processTextElement(params);

		expect(result.cache).toBe(false);
		expect(result.comment).toBe('Test comment');
		expect(result.condition).toBe('some condition');
		expect(result.mask).toBe('https://example.com/mask.png');
		expect(result.variables).toEqual({ key: 'value' });
	});

	test('should not add settings object if no settings provided', () => {
		const params: TextElementParams = {
			text: 'Hello World'
		};

		const result = processTextElement(params);

		expect(result.settings).toBeUndefined();
	});

	test('should handle rotation with only angle', () => {
		const params: TextElementParams = {
			text: 'Hello World',
			rotateAngle: 90
		};

		const result = processTextElement(params);

		expect(result.rotate).toEqual({
			angle: 90
		});
	});

	test('should handle rotation with only speed', () => {
		const params: TextElementParams = {
			text: 'Hello World',
			rotateSpeed: 3
		};

		const result = processTextElement(params);

		expect(result.rotate).toEqual({
			angle: 0,
			speed: 3
		});
	});

	test('should process text element with line height and letter spacing', () => {
		const params: TextElementParams = {
			text: 'Hello World',
			lineHeight: '1.5',
			letterSpacing: '2px',
			textShadow: '1px 1px 2px #000000',
			textTransform: 'uppercase'
		};

		const result = processTextElement(params);

		expect(result.settings).toEqual({
			'line-height': '1.5',
			'letter-spacing': '2px',
			'text-shadow': '1px 1px 2px #000000',
			'text-transform': 'uppercase'
		});
	});

	test('should handle chroma key with color only', () => {
		const params: TextElementParams = {
			text: 'Hello World',
			chromaKeyColor: '#00FF00'
		};

		const result = processTextElement(params);

		expect(result['chroma-key']).toEqual({
			color: '#00FF00'
		});
	});

	test('should handle correction with single property', () => {
		const params: TextElementParams = {
			text: 'Hello World',
			brightness: 0.5
		};

		const result = processTextElement(params);

		expect(result.correction).toEqual({
			brightness: 0.5
		});
	});

	test('should handle lineHeight without letterSpacing', () => {
		const params: TextElementParams = {
			text: 'Hello World',
			lineHeight: '1.8'
		};

		const result = processTextElement(params);

		expect(result.settings).toEqual({
			'line-height': '1.8'
		});
	});

	test('should handle letterSpacing without lineHeight', () => {
		const params: TextElementParams = {
			text: 'Hello World',
			letterSpacing: '3px'
		};

		const result = processTextElement(params);

		expect(result.settings).toEqual({
			'letter-spacing': '3px'
		});
	});

	test('should handle textTransform without position properties', () => {
		const params: TextElementParams = {
			text: 'Hello World',
			textTransform: 'uppercase'
		};

		const result = processTextElement(params);

		expect(result.settings).toEqual({
			'text-transform': 'uppercase'
		});
	});

	test('should handle verticalPosition without horizontalPosition', () => {
		const params: TextElementParams = {
			text: 'Hello World',
			verticalPosition: 'top'
		};

		const result = processTextElement(params);

		expect(result.settings).toEqual({
			'vertical-position': 'top'
		});
	});

	test('should handle horizontalPosition without verticalPosition', () => {
		const params: TextElementParams = {
			text: 'Hello World',
			horizontalPosition: 'left'
		};

		const result = processTextElement(params);

		expect(result.settings).toEqual({
			'horizontal-position': 'left'
		});
	});
});

describe('Subtitle Element Processing', () => {
	test('should process basic subtitle element with text', () => {
		const params: SubtitleElementParams = {
			text: 'Hello World Subtitle',
			language: 'en'
		};

		const result = processSubtitleElement(params);

		expect(result.type).toBe('subtitles');
		expect(result.text).toBe('Hello World Subtitle');
		expect(result.language).toBe('en');
	});

	test('should process subtitle element with src', () => {
		const params: SubtitleElementParams = {
			src: 'https://example.com/subtitles.srt',
			language: 'en'
		};

		const result = processSubtitleElement(params);

		expect(result.type).toBe('subtitles');
		expect(result.src).toBe('https://example.com/subtitles.srt');
		expect(result.language).toBe('en');
	});

	test('should process subtitle element with font settings', () => {
		const params: SubtitleElementParams = {
			text: 'Subtitle Text',
			fontFamily: 'Arial',
			fontSize: 24,
			fontWeight: 'bold',
			fontColor: '#FFFFFF',
			backgroundColor: '#000000',
			textAlign: 'center'
		};

		const result = processSubtitleElement(params);

		expect(result.settings).toEqual({
			'font-family': 'Arial',
			'font-size': 24,
			'font-weight': 'bold',
			'font-color': '#FFFFFF',
			'background-color': '#000000',
			'text-align': 'center'
		});
	});

	test('should process subtitle element with border and effects', () => {
		const params: SubtitleElementParams = {
			text: 'Subtitle Text',
			border: '2px solid #FFFFFF',
			borderRadius: '5px',
			textShadow: '2px 2px 4px #000000'
		};

		const result = processSubtitleElement(params);

		expect(result.settings).toEqual({
			'border': '2px solid #FFFFFF',
			'border-radius': '5px',
			'text-shadow': '2px 2px 4px #000000'
		});
	});

	test('should process subtitle element with layout settings', () => {
		const params: SubtitleElementParams = {
			text: 'Subtitle Text',
			lineHeight: '1.4',
			letterSpacing: '1px',
			textTransform: 'lowercase'
		};

		const result = processSubtitleElement(params);

		expect(result.settings).toEqual({
			'line-height': '1.4',
			'letter-spacing': '1px',
			'text-transform': 'lowercase'
		});
	});

	test('should process subtitle element with timing and positioning', () => {
		const params: SubtitleElementParams = {
			text: 'Subtitle Text',
			position: 'bottom-center',
			start: 5,
			duration: -2,
			fadeIn: 0.5,
			fadeOut: 0.5,
			zIndex: 10
		};

		const result = processSubtitleElement(params);

		expect(result.position).toBe('bottom-center');
		expect(result.start).toBe(5);
		expect(result.duration).toBe(-2);
		expect(result['fade-in']).toBe(0.5);
		expect(result['fade-out']).toBe(0.5);
		expect(result['z-index']).toBe(10);
	});

	test('should process subtitle element with all optional properties', () => {
		const params: SubtitleElementParams = {
			text: 'Complete Subtitle',
			cache: false,
			comment: 'Test subtitle',
			condition: 'show_subtitles',
			variables: { lang: 'en' },
			extraTime: 1
		};

		const result = processSubtitleElement(params);

		expect(result.cache).toBe(false);
		expect(result.comment).toBe('Test subtitle');
		expect(result.condition).toBe('show_subtitles');
		expect(result.variables).toEqual({ lang: 'en' });
		expect(result['extra-time']).toBe(1);
	});

	test('should process subtitle element with mixed settings', () => {
		const params: SubtitleElementParams = {
			text: 'Mixed Settings Subtitle',
			fontFamily: 'Arial',
			opacity: 0.8,
			padding: '10px',
			textAlign: 'center'
		};

		const result = processSubtitleElement(params);

		expect(result.settings).toEqual({
			'font-family': 'Arial',
			'opacity': 0.8,
			'padding': '10px',
			'text-align': 'center'
		});
	});

	test('should auto-detect URL in captions and use as src', () => {
		const params: SubtitleElementParams = {
			captions: 'https://example.com/subtitles.srt',
			language: 'en'
		};

		const result = processSubtitleElement(params);

		expect(result.src).toBe('https://example.com/subtitles.srt');
		expect(result.text).toBeUndefined();
		expect(result.language).toBe('en');
	});

	test('should auto-detect inline content in captions and use as text', () => {
		const params: SubtitleElementParams = {
			captions: 'This is inline subtitle content',
			language: 'es'
		};

		const result = processSubtitleElement(params);

		expect(result.text).toBe('This is inline subtitle content');
		expect(result.src).toBeUndefined();
		expect(result.language).toBe('es');
	});

	test('should fallback to text/src properties when captions not provided', () => {
		const params: SubtitleElementParams = {
			text: 'Fallback text',
			src: 'https://example.com/fallback.srt'
		};

		const result = processSubtitleElement(params);

		expect(result.text).toBe('Fallback text');
		expect(result.src).toBe('https://example.com/fallback.srt');
	});

	test('should handle model property', () => {
		const params: SubtitleElementParams = {
			captions: 'Test subtitle',
			model: 'whisper'
		};

		const result = processSubtitleElement(params);

		expect(result.model).toBe('whisper');
	});

	test('should execute verticalPosition branch in processSubtitleElement', () => {
		const params: SubtitleElementParams = {
			text: 'Hello World',
			verticalPosition: 'top'
		};

		const result = processSubtitleElement(params);

		expect(result.settings).toEqual({
			'vertical-position': 'top'
		});
	});

	test('should execute horizontalPosition branch in processSubtitleElement', () => {
		const params: SubtitleElementParams = {
			text: 'Hello World',
			horizontalPosition: 'left'
		};

		const result = processSubtitleElement(params);

		expect(result.settings).toEqual({
			'horizontal-position': 'left'
		});
	});

	test('should execute margin branch in processSubtitleElement', () => {
		const params: SubtitleElementParams = {
			text: 'Hello World',
			margin: '10px'
		};

		const result = processSubtitleElement(params);

		expect(result.settings).toEqual({
			'margin': '10px'
		});
	});

	test('should execute maxWidth branch in processSubtitleElement', () => {
		const params: SubtitleElementParams = {
			text: 'Hello World',
			maxWidth: '80%'
		};

		const result = processSubtitleElement(params);

		expect(result.settings).toEqual({
			'max-width': '80%'
		});
	});

	test('should execute wordWrap branch in processSubtitleElement', () => {
		const params: SubtitleElementParams = {
			text: 'Hello World',
			wordWrap: 'break-word'
		};

		const result = processSubtitleElement(params);

		expect(result.settings).toEqual({
			'word-wrap': 'break-word'
		});
	});

	test('should execute whiteSpace branch in processSubtitleElement', () => {
		const params: SubtitleElementParams = {
			text: 'Hello World',
			whiteSpace: 'nowrap'
		};

		const result = processSubtitleElement(params);

		expect(result.settings).toEqual({
			'white-space': 'nowrap'
		});
	});
});

describe('Text Element Validation', () => {
	test('should validate required text field', () => {
		const params: TextElementParams = {
			text: ''
		};

		const errors = validateTextElementParams(params);

		expect(errors).toContain('Text content is required and cannot be empty');
	});

	test('should validate trimmed empty text', () => {
		const params: TextElementParams = {
			text: '   '
		};

		const errors = validateTextElementParams(params);

		expect(errors).toContain('Text content is required and cannot be empty');
	});

	test('should validate chroma key tolerance range', () => {
		const params: TextElementParams = {
			text: 'Hello World',
			chromaKeyTolerance: 150
		};

		const errors = validateTextElementParams(params);

		expect(errors).toContain('Chroma key tolerance must be between 1 and 100');
	});

	test('should validate brightness range', () => {
		const params: TextElementParams = {
			text: 'Hello World',
			brightness: 2
		};

		const errors = validateTextElementParams(params);

		expect(errors).toContain('Brightness must be between -1 and 1');
	});

	test('should validate contrast range', () => {
		const params: TextElementParams = {
			text: 'Hello World',
			contrast: 2000
		};

		const errors = validateTextElementParams(params);

		expect(errors).toContain('Contrast must be between -1000 and 1000');
	});

	test('should validate gamma range', () => {
		const params: TextElementParams = {
			text: 'Hello World',
			gamma: 15
		};

		const errors = validateTextElementParams(params);

		expect(errors).toContain('Gamma must be between 0.1 and 10');
	});

	test('should validate saturation range', () => {
		const params: TextElementParams = {
			text: 'Hello World',
			saturation: 5
		};

		const errors = validateTextElementParams(params);

		expect(errors).toContain('Saturation must be between 0 and 3');
	});

	test('should validate pan distance range', () => {
		const params: TextElementParams = {
			text: 'Hello World',
			panDistance: 0.6
		};

		const errors = validateTextElementParams(params);

		expect(errors).toContain('Pan distance must be between 0.01 and 0.5');
	});

	test('should validate zoom range', () => {
		const params: TextElementParams = {
			text: 'Hello World',
			zoom: 15
		};

		const errors = validateTextElementParams(params);

		expect(errors).toContain('Zoom must be between -10 and 10');
	});

	test('should validate rotate angle range', () => {
		const params: TextElementParams = {
			text: 'Hello World',
			rotateAngle: 400
		};

		const errors = validateTextElementParams(params);

		expect(errors).toContain('Rotation angle must be between -360 and 360');
	});

	test('should validate z-index range', () => {
		const params: TextElementParams = {
			text: 'Hello World',
			zIndex: 150
		};

		const errors = validateTextElementParams(params);

		expect(errors).toContain('Z-index must be between -99 and 99');
	});

	test('should validate invalid hex colors', () => {
		const params: TextElementParams = {
			text: 'Hello World',
			fontColor: '#ZZZ',
			backgroundColor: 'invalid'
		};

		const errors = validateTextElementParams(params);

		expect(errors).toContain('fontColor must be a valid color (hex like #FF0000, rgb like rgb(255,0,0), or rgba like rgba(255,0,0,0.5))');
		expect(errors).toContain('backgroundColor must be a valid color (hex like #FF0000, rgb like rgb(255,0,0), or rgba like rgba(255,0,0,0.5))');
	});

	test('should accept valid rgb colors', () => {
		const params: TextElementParams = {
			text: 'Hello World',
			fontColor: 'rgb(255,255,255)',
			backgroundColor: 'rgb(0,0,0)',
			chromaKeyColor: 'rgb(0,255,0)'
		};

		const errors = validateTextElementParams(params);

		expect(errors).not.toContain(expect.stringContaining('fontColor'));
		expect(errors).not.toContain(expect.stringContaining('backgroundColor'));
		expect(errors).not.toContain(expect.stringContaining('chromaKeyColor'));
	});

	test('should accept valid rgba colors', () => {
		const params: TextElementParams = {
			text: 'Hello World',
			fontColor: 'rgba(255,255,255,1)',
			backgroundColor: 'rgba(0,0,0,0.5)',
			chromaKeyColor: 'rgba(0,255,0,0.8)'
		};

		const errors = validateTextElementParams(params);

		expect(errors).not.toContain(expect.stringContaining('fontColor'));
		expect(errors).not.toContain(expect.stringContaining('backgroundColor'));
		expect(errors).not.toContain(expect.stringContaining('chromaKeyColor'));
	});
});

describe('Subtitle Element Validation', () => {
	test('should validate requires either captions, text or src when no source type specified', () => {
		const params: SubtitleElementParams = {
			text: '',
			src: ''
		};

		const errors = validateSubtitleElementParams(params);

		expect(errors).toContain('Either captions content, text content, or source URL is required');
	});

	test('should validate empty captions content', () => {
		const params: SubtitleElementParams = {
			captions: '   '  // whitespace only
		};

		const errors = validateSubtitleElementParams(params);

		expect(errors).toContain('Captions content cannot be empty');
	});

	test('should validate text source type with empty text', () => {
		const params: SubtitleElementParams = {
			subtitleSourceType: 'text',
			text: ''
		};

		const errors = validateSubtitleElementParams(params);

		expect(errors).toContain('Text content is required when using text source type');
	});

	test('should validate src source type with empty src', () => {
		const params: SubtitleElementParams = {
			subtitleSourceType: 'src',
			src: ''
		};

		const errors = validateSubtitleElementParams(params);

		expect(errors).toContain('Source URL is required when using file source type');
	});

	test('should validate opacity range', () => {
		const params: SubtitleElementParams = {
			text: 'Subtitle',
			opacity: 1.5
		};

		const errors = validateSubtitleElementParams(params);

		expect(errors).toContain('Opacity must be between 0 and 1');
	});

	test('should validate z-index range', () => {
		const params: SubtitleElementParams = {
			text: 'Subtitle',
			zIndex: 150
		};

		const errors = validateSubtitleElementParams(params);

		expect(errors).toContain('Z-index must be between -99 and 99');
	});

	test('should validate fade durations are non-negative', () => {
		const params: SubtitleElementParams = {
			text: 'Subtitle',
			fadeIn: -1,
			fadeOut: -0.5
		};

		const errors = validateSubtitleElementParams(params);

		expect(errors).toContain('Fade in duration must be 0 or greater');
		expect(errors).toContain('Fade out duration must be 0 or greater');
	});

	test('should validate color formats for subtitles', () => {
		const params: SubtitleElementParams = {
			text: 'Subtitle',
			fontColor: 'invalid',
			backgroundColor: '#ZZZ'
		};

		const errors = validateSubtitleElementParams(params);

		expect(errors).toContain('fontColor must be a valid color (hex like #FF0000, rgb like rgb(255,0,0), or rgba like rgba(255,0,0,0.5))');
		expect(errors).toContain('backgroundColor must be a valid color (hex like #FF0000, rgb like rgb(255,0,0), or rgba like rgba(255,0,0,0.5))');
	});

	test('should pass validation with valid src', () => {
		const params: SubtitleElementParams = {
			src: 'https://example.com/subtitles.srt'
		};

		const errors = validateSubtitleElementParams(params);

		expect(errors).not.toContain('Either captions content, text content, or source URL is required');
	});

	test('should pass validation for valid subtitle parameters', () => {
		const params: SubtitleElementParams = {
			text: 'Valid Subtitle',
			fontFamily: 'Arial',
			fontSize: 24,
			fontColor: '#FFFFFF',
			backgroundColor: 'rgba(0,0,0,0.8)',
			opacity: 0.9,
			zIndex: 10,
			fadeIn: 0.5,
			fadeOut: 0.5
		};

		const errors = validateSubtitleElementParams(params);

		expect(errors).toHaveLength(0);
	});

	test('should validate subtitle with whitespace-only text (covering trim validation)', () => {
		const params: SubtitleElementParams = {
			subtitleSourceType: 'text',
			text: '   '
		};

		const errors = validateSubtitleElementParams(params);

		expect(errors).toContain('Text content is required when using text source type');
	});

	test('should validate subtitle with whitespace-only src (covering trim validation)', () => {
		const params: SubtitleElementParams = {
			subtitleSourceType: 'src',
			src: '   '
		};

		const errors = validateSubtitleElementParams(params);

		expect(errors).toContain('Source URL is required when using file source type');
	});

	test('should validate valid rgb colors for subtitles', () => {
		const params: SubtitleElementParams = {
			text: 'Subtitle',
			fontColor: 'rgb(255,255,255)',
			backgroundColor: 'rgb(0,0,0)'
		};

		const errors = validateSubtitleElementParams(params);

		expect(errors).not.toContain(expect.stringContaining('fontColor'));
		expect(errors).not.toContain(expect.stringContaining('backgroundColor'));
	});

	test('should validate valid captions content', () => {
		const params: SubtitleElementParams = {
			captions: 'Valid caption content'
		};

		const errors = validateSubtitleElementParams(params);

		expect(errors).toHaveLength(0);
	});
});

describe('Subtitle Placement Validation', () => {
	test('should return no errors for empty elements array', () => {
		const elements: IDataObject[] = [];
		const errors = validateNoSubtitlesInSceneElements(elements);
		expect(errors).toHaveLength(0);
	});

	test('should return no errors for elements without subtitles', () => {
		const elements: IDataObject[] = [
			{ type: 'video', src: 'https://example.com/video.mp4' },
			{ type: 'text', text: 'Hello World' },
			{ type: 'audio', src: 'https://example.com/audio.mp3' },
			{ type: 'image', src: 'https://example.com/image.jpg' }
		];
		const errors = validateNoSubtitlesInSceneElements(elements);
		expect(errors).toHaveLength(0);
	});

	test('should return error for single subtitle element', () => {
		const elements: IDataObject[] = [
			{ type: 'subtitles', text: 'Subtitle text' }
		];
		const errors = validateNoSubtitlesInSceneElements(elements);
		expect(errors).toHaveLength(1);
		expect(errors[0]).toBe('Element 1: Subtitles can only be added at movie level, not in individual scenes');
	});

	test('should return errors for multiple subtitle elements', () => {
		const elements: IDataObject[] = [
			{ type: 'video', src: 'https://example.com/video.mp4' },
			{ type: 'subtitles', text: 'First subtitle' },
			{ type: 'text', text: 'Regular text' },
			{ type: 'subtitles', src: 'https://example.com/subtitles.srt' }
		];
		const errors = validateNoSubtitlesInSceneElements(elements);
		expect(errors).toHaveLength(2);
		expect(errors[0]).toBe('Element 2: Subtitles can only be added at movie level, not in individual scenes');
		expect(errors[1]).toBe('Element 4: Subtitles can only be added at movie level, not in individual scenes');
	});

	test('should provide correct element index in error messages', () => {
		const elements: IDataObject[] = [
			{ type: 'video' },
			{ type: 'audio' },
			{ type: 'subtitles', text: 'Bad subtitle' },
			{ type: 'image' },
			{ type: 'subtitles', src: 'bad.srt' }
		];
		const errors = validateNoSubtitlesInSceneElements(elements);
		expect(errors).toHaveLength(2);
		expect(errors[0]).toContain('Element 3:');
		expect(errors[1]).toContain('Element 5:');
	});

	test('should handle mixed element types correctly', () => {
		const elements: IDataObject[] = [
			{ type: 'text', text: 'Valid text element' },
			{ type: 'subtitles', text: 'Invalid subtitle in scene' },
			{ type: 'voice', text: 'Valid voice element' }
		];
		const errors = validateNoSubtitlesInSceneElements(elements);
		expect(errors).toHaveLength(1);
		expect(errors[0]).toBe('Element 2: Subtitles can only be added at movie level, not in individual scenes');
	});

	test('should handle elements with missing type property', () => {
		const elements: IDataObject[] = [
			{ type: 'video' },
			{ src: 'no-type-property.mp4' }, // Missing type
			{ type: 'subtitles', text: 'Bad subtitle' }
		];
		const errors = validateNoSubtitlesInSceneElements(elements);
		expect(errors).toHaveLength(1);
		expect(errors[0]).toBe('Element 3: Subtitles can only be added at movie level, not in individual scenes');
	});

	test('should handle elements with null or undefined type', () => {
		const elements: IDataObject[] = [
			{ type: null },
			{ type: undefined },
			{ type: 'subtitles', text: 'Bad subtitle' }
		];
		const errors = validateNoSubtitlesInSceneElements(elements);
		expect(errors).toHaveLength(1);
		expect(errors[0]).toBe('Element 3: Subtitles can only be added at movie level, not in individual scenes');
	});
});
