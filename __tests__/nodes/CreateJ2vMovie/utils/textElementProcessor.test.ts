import { processTextElement, validateTextElementParams } from '@nodes/CreateJ2vMovie/utils/textElementProcesor';
import { TextElementParams } from '@nodes/CreateJ2vMovie/operations/shared/elements';

describe('textElementProcessor', () => {
	describe('processTextElement', () => {
		test('should process basic text element', () => {
			const params: TextElementParams = {
				text: 'Hello World'
			};

			const result = processTextElement(params);

			expect(result).toEqual({
				type: 'text',
				text: 'Hello World'
			});
		});

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
	});

	describe('validateTextElementParams', () => {
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
				panDistance: 0.8
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

		test('should validate rotation angle range', () => {
			const params: TextElementParams = {
				text: 'Hello World',
				rotateAngle: 500
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

		test('should validate hex color format', () => {
			const params: TextElementParams = {
				text: 'Hello World',
				fontColor: 'red',
				backgroundColor: '#GGGGGG',
				chromaKeyColor: '#12345'
			};

			const errors = validateTextElementParams(params);

			expect(errors).toContain('fontColor must be a valid hex color (e.g., #FF0000)');
			expect(errors).toContain('backgroundColor must be a valid hex color (e.g., #FF0000)');
			expect(errors).toContain('chromaKeyColor must be a valid hex color (e.g., #FF0000)');
		});

		test('should pass validation for valid parameters', () => {
			const params: TextElementParams = {
				text: 'Hello World',
				fontColor: '#FFFFFF',
				backgroundColor: '#000000',
				chromaKeyColor: '#00FF00',
				chromaKeyTolerance: 50,
				brightness: 0.5,
				contrast: 1.5,
				gamma: 1.2,
				saturation: 1.1,
				panDistance: 0.2,
				zoom: 2,
				rotateAngle: 45,
				zIndex: 10
			};

			const errors = validateTextElementParams(params);

			expect(errors).toHaveLength(0);
		});

		test('should return multiple errors for multiple invalid fields', () => {
			const params: TextElementParams = {
				text: '',
				brightness: 2,
				zoom: 15
			};

			const errors = validateTextElementParams(params);

			expect(errors).toHaveLength(3);
			expect(errors).toContain('Text content is required and cannot be empty');
			expect(errors).toContain('Brightness must be between -1 and 1');
			expect(errors).toContain('Zoom must be between -10 and 10');
		});
	});
});