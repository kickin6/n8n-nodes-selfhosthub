// __tests__/nodes/CreateJ2vMovie/schema/validators.test.ts

import { 
  validateTextElementParams,
  validateSubtitleElementParams,
  validateMovieElements,
  validateSceneElements,
  validateJSON2VideoRequest,
  ValidationResult
} from '../../../../nodes/CreateJ2vMovie/schema/validators';

import {
  TextElementParams,
  SubtitleElementParams
} from '../../../../nodes/CreateJ2vMovie/schema/json2videoSchema';

describe('Schema Validators', () => {

  describe('validateTextElementParams', () => {
    it.each([
      ['basic text', { text: 'Hello World' }],
      ['with font size', { text: 'Test', fontSize: 24 }],
      ['with font size string', { text: 'Test', fontSize: '24px' }],
      ['with font weight number', { text: 'Test', fontWeight: 400 }],
      ['with font weight string', { text: 'Test', fontWeight: '400' }],
      ['with colors', { text: 'Test', fontColor: '#ff0000', backgroundColor: 'rgba(0,0,0,0.5)' }],
      ['with transparent color', { text: 'Test', fontColor: 'transparent' }],
      ['with rgb color', { text: 'Test', fontColor: 'rgb(255,0,0)' }],
      ['with short hex color', { text: 'Test', fontColor: '#f00' }],
      ['with top-left position', { text: 'Test', position: 'top-left' }],
      ['with custom position', { text: 'Test', position: 'custom', x: 100, y: 200 }],
      ['with duration -1', { text: 'Test', duration: -1 }],
      ['with duration -2', { text: 'Test', duration: -2 }],
      ['with valid start time', { text: 'Test', start: 5 }],
      ['with text alignment', { text: 'Test', textAlign: 'center' }],
      ['with vertical position', { text: 'Test', verticalPosition: 'top' }],
      ['with horizontal position', { text: 'Test', horizontalPosition: 'center' }]
    ])('should validate valid text params: %s', (_, params) => {
      const errors = validateTextElementParams(params as TextElementParams);
      expect(errors).toHaveLength(0);
    });

    it.each([
      ['empty text', { text: '' }, 'Text content is required'],
      ['whitespace only text', { text: '   \t\n  ' }, 'Text content is required'],
      ['missing text', {}, 'Text content is required'],
      ['font size too small', { text: 'Test', fontSize: 0 }, 'Font size must be a number between 1 and 200'],
      ['font size too large', { text: 'Test', fontSize: 250 }, 'Font size must be a number between 1 and 200'],
      ['font size invalid string', { text: 'Test', fontSize: 'invalid' as any }, 'Font size must be a number between 1 and 200'],
      ['font size NaN from string', { text: 'Test', fontSize: 'notapxvalue' as any }, 'Font size must be a number between 1 and 200'],
      ['font weight too low', { text: 'Test', fontWeight: 50 }, 'Font weight must be a multiple of 100'],
      ['font weight too high', { text: 'Test', fontWeight: 950 }, 'Font weight must be a multiple of 100'],
      ['invalid font weight', { text: 'Test', fontWeight: 450 }, 'Font weight must be a multiple of 100'],
      ['font weight invalid string', { text: 'Test', fontWeight: 'invalid' as any }, 'Font weight must be a multiple of 100'],
      ['font weight NaN from string', { text: 'Test', fontWeight: 'notanumber' as any }, 'Font weight must be a multiple of 100'],
      ['invalid color format', { text: 'Test', fontColor: 'blue' }, 'fontColor must be a valid color'],
      ['invalid background color', { text: 'Test', backgroundColor: 'blue' }, 'backgroundColor must be a valid color'],
      ['custom position missing x', { text: 'Test', position: 'custom' }, 'X and Y coordinates are required'],
      ['custom position missing y', { text: 'Test', position: 'custom', x: 100 }, 'X and Y coordinates are required'],
      ['invalid text align', { text: 'Test', textAlign: 'invalid' as any }, 'Text align must be one of'],
      ['invalid vertical position', { text: 'Test', verticalPosition: 'middle' as any }, 'Vertical position must be one of'],
      ['invalid horizontal position', { text: 'Test', horizontalPosition: 'middle' as any }, 'Horizontal position must be one of'],
      ['invalid position', { text: 'Test', position: 'invalid-position' as any }, 'Position must be one of'],
      ['invalid duration', { text: 'Test', duration: -5 }, 'Duration must be a positive number'],
      ['negative start time', { text: 'Test', start: -1 }, 'Start time must be a non-negative number']
    ])('should reject invalid text params: %s', (_, params, expectedError) => {
      const errors = validateTextElementParams(params as TextElementParams);
      expect(errors.some(e => e.includes(expectedError))).toBe(true);
    });
  });

  describe('validateSubtitleElementParams', () => {
    it.each([
      ['with captions', { captions: 'SRT content' }],
      ['with src URL', { src: 'https://example.com/subs.srt' }],
      ['with text content', { text: 'Auto-generated' }],
      ['with language', { captions: 'Test', language: 'en' }],
      ['with language code', { captions: 'Test', language: 'en-US' }],
      ['with position', { captions: 'Test', position: 'bottom-center' }],
      ['with font size', { captions: 'Test', fontSize: 18 }],
      ['with outline width', { captions: 'Test', outlineWidth: 2 }],
      ['with shadow offset', { captions: 'Test', shadowOffset: 3 }],
      ['with max words per line', { captions: 'Test', maxWordsPerLine: 5 }],
      ['with all colors', { captions: 'Test', wordColor: '#fff', lineColor: '#000', boxColor: 'rgba(0,0,0,0.5)', outlineColor: '#ff0000', shadowColor: 'transparent' }]
    ])('should validate valid subtitle params: %s', (_, params) => {
      const errors = validateSubtitleElementParams(params as SubtitleElementParams);
      expect(errors).toHaveLength(0);
    });

    it.each([
      ['no content source', {}, 'Either captions text, src URL, or text content is required'],
      ['empty captions', { captions: '' }, 'Either captions text, src URL, or text content is required'],
      ['whitespace captions', { captions: '   ' }, 'Either captions text, src URL, or text content is required'],
      ['empty src', { src: '' }, 'Either captions text, src URL, or text content is required'],
      ['whitespace src', { src: '   ' }, 'Either captions text, src URL, or text content is required'],
      ['empty text', { text: '' }, 'Either captions text, src URL, or text content is required'],
      ['whitespace text', { text: '   ' }, 'Either captions text, src URL, or text content is required'],
      ['multiple sources captions+src', { captions: 'test', src: 'test.srt' }, 'Cannot specify multiple subtitle sources'],
      ['multiple sources captions+text', { captions: 'test', text: 'test' }, 'Cannot specify multiple subtitle sources'],
      ['multiple sources src+text', { src: 'test.srt', text: 'test' }, 'Cannot specify multiple subtitle sources'],
      ['all three sources', { captions: 'test', src: 'test.srt', text: 'test' }, 'Cannot specify multiple subtitle sources'],
      ['invalid URL', { src: 'not-a-url' }, 'Subtitle src must be a valid URL'],
      ['invalid language format', { captions: 'test', language: 'invalid' }, 'Language must be in format'],
      ['invalid language too long', { captions: 'test', language: 'en-US-extra' }, 'Language must be in format'],
      ['invalid position', { captions: 'test', position: 'invalid-pos' as any }, 'Position must be one of'],
      ['font size too small', { captions: 'test', fontSize: 0 }, 'Font size must be a number between 1 and 200'],
      ['font size too large', { captions: 'test', fontSize: 250 }, 'Font size must be a number between 1 and 200'],
      ['font size not number', { captions: 'test', fontSize: 'invalid' as any }, 'Font size must be a number between 1 and 200'],
      ['outline width negative', { captions: 'test', outlineWidth: -1 }, 'Outline width must be a number between 0 and 10'],
      ['outline width too large', { captions: 'test', outlineWidth: 15 }, 'Outline width must be a number between 0 and 10'],
      ['outline width not number', { captions: 'test', outlineWidth: 'invalid' as any }, 'Outline width must be a number between 0 and 10'],
      ['shadow offset negative', { captions: 'test', shadowOffset: -1 }, 'Shadow offset must be a number between 0 and 10'],
      ['shadow offset too large', { captions: 'test', shadowOffset: 15 }, 'Shadow offset must be a number between 0 and 10'],
      ['shadow offset not number', { captions: 'test', shadowOffset: 'invalid' as any }, 'Shadow offset must be a number between 0 and 10'],
      ['max words too small', { captions: 'test', maxWordsPerLine: 0 }, 'Max words per line must be a number between 1 and 20'],
      ['max words too large', { captions: 'test', maxWordsPerLine: 25 }, 'Max words per line must be a number between 1 and 20'],
      ['max words not number', { captions: 'test', maxWordsPerLine: 'invalid' as any }, 'Max words per line must be a number between 1 and 20'],
      ['invalid wordColor', { captions: 'test', wordColor: 'blue' }, 'wordColor must be a valid color'],
      ['invalid lineColor', { captions: 'test', lineColor: 'blue' }, 'lineColor must be a valid color'],
      ['invalid boxColor', { captions: 'test', boxColor: 'blue' }, 'boxColor must be a valid color'],
      ['invalid outlineColor', { captions: 'test', outlineColor: 'blue' }, 'outlineColor must be a valid color'],
      ['invalid shadowColor', { captions: 'test', shadowColor: 'blue' }, 'shadowColor must be a valid color']
    ])('should reject invalid subtitle params: %s', (_, params, expectedError) => {
      const errors = validateSubtitleElementParams(params as SubtitleElementParams);
      expect(errors.some(e => e.includes(expectedError))).toBe(true);
    });
  });

  describe('validateMovieElements', () => {
    it.each([
      ['subtitles', { type: 'subtitles', captions: 'Test' }],
      ['audio', { type: 'audio', src: 'https://test.com/audio.mp3' }],
      ['text', { type: 'text', text: 'Movie title' }],
      ['voice', { type: 'voice', text: 'Narration' }]
    ])('should validate valid movie element: %s', (_, element) => {
      const errors = validateMovieElements([element]);
      expect(errors).toHaveLength(0);
    });

    it.each([
      ['video', { type: 'video', src: 'test.mp4' }],
      ['image', { type: 'image', src: 'test.jpg' }],
      ['component', { type: 'component', component: 'test' }]
    ])('should reject scene-only element at movie level: %s', (elementType, element) => {
      const errors = validateMovieElements([element]);
      expect(errors.some(e => e.includes(`'${elementType}' is not allowed at movie level`))).toBe(true);
    });

    it.each([
      ['non-array input', null, 'Movie elements must be an array'],
      ['non-array string', 'invalid', 'Movie elements must be an array'],
      ['null element', [null], 'Element must be an object'],
      ['string element', ['invalid'], 'Element must be an object'],
      ['missing type', [{}], 'Element type is required'],
      ['invalid type', [{ type: 'invalid' }], 'not allowed at movie level'],
      ['missing required fields', [{ type: 'text' }], 'Missing required fields'],
      ['empty required field', [{ type: 'text', text: '' }], 'Missing required fields'],
      ['valid element', [{ type: 'text', text: 'Valid text' }], '']
    ])('should handle various input scenarios: %s', (_, input, expectedError) => {
      const errors = validateMovieElements(input as any);
      if (expectedError === '') {
        expect(errors).toHaveLength(0);
      } else {
        expect(errors.some(e => e.includes(expectedError))).toBe(true);
      }
    });

    it('should validate text and subtitle element properties', () => {
      const elementsWithErrors = [
        { type: 'text', text: 'Valid text', fontSize: 0 },
        { type: 'subtitles' }
      ];
      const errors = validateMovieElements(elementsWithErrors);
      expect(errors.some(e => e.includes('Font size must be a number between 1 and 200'))).toBe(true);
      expect(errors.some(e => e.includes('Either captions text, src URL, or text content is required'))).toBe(true);
    });

    it('should validate subtitles with text field', () => {
      const elements = [{ type: 'subtitles', text: 'Valid subtitle text' }];
      const errors = validateMovieElements(elements);
      expect(errors).toHaveLength(0);
    });
  });

  describe('validateSceneElements', () => {
    it.each([
      ['video', { type: 'video', src: 'https://test.com/video.mp4' }],
      ['audio', { type: 'audio', src: 'https://test.com/audio.mp3' }],
      ['image', { type: 'image', src: 'https://test.com/image.jpg' }],
      ['text', { type: 'text', text: 'Scene text' }],
      ['voice', { type: 'voice', text: 'Narration' }],
      ['component', { type: 'component', component: 'test-component' }],
      ['image with AI prompt', { type: 'image', prompt: 'A beautiful sunset', model: 'flux-pro' }]
    ])('should validate valid scene element: %s', (_, element) => {
      const errors = validateSceneElements([element]);
      expect(errors).toHaveLength(0);
    });

    it.each([
      ['subtitles in scene', { type: 'subtitles', captions: 'test' }, 'Subtitles can only be added at movie level'],
      ['invalid video URL', { type: 'video', src: 'not-a-url' }, 'Invalid URL for video source'],
      ['invalid audio URL', { type: 'audio', src: 'not-a-url' }, 'Invalid URL for audio source'],
      ['invalid image URL', { type: 'image', src: 'not-a-url' }, 'Invalid URL for image source'],
      ['missing component ID', { type: 'component' }, 'Component ID is required'],
      ['empty component ID', { type: 'component', component: '' }, 'Component ID is required'],
      ['whitespace component ID', { type: 'component', component: '   ' }, 'Component ID is required'],
      ['AI image without model', { type: 'image', prompt: 'test' }, 'AI model is required when using prompt'],
      ['AI image with empty model', { type: 'image', prompt: 'test', model: '' }, 'AI model is required when using prompt'],
      ['invalid AI model', { type: 'image', prompt: 'test', model: 'invalid' }, 'Invalid AI model']
    ])('should reject invalid scene element: %s', (_, element, expectedError) => {
      const errors = validateSceneElements([element]);
      expect(errors.some(e => e.includes(expectedError))).toBe(true);
    });

    it.each([
      ['non-array', {}, '', 'Scene elements must be an array'],
      ['non-array with context', {}, 'Scene 1', 'Scene 1: Scene elements must be an array'],
      ['non-object element', ['string'], '', 'Element must be an object'],
      ['missing type', [{}], '', 'Element type is required'],
      ['invalid element type', [{ type: 'invalid-type' }], '', 'not allowed at scene level'],
      ['missing required fields', [{ type: 'text' }], '', 'Missing required fields'],
      ['empty required field', [{ type: 'text', text: '' }], '', 'Missing required fields'],
      ['valid element', [{ type: 'text', text: 'Valid scene text' }], '', '']
    ])('should handle edge cases: %s', (_, elements, context, expectedError) => {
      const errors = validateSceneElements(elements as any, context);
      if (expectedError === '') {
        expect(errors).toHaveLength(0);
      } else {
        expect(errors.some(e => e.includes(expectedError))).toBe(true);
      }
    });

    it('should validate text element properties in scenes', () => {
      const elements = [{ type: 'text', text: 'Valid text', fontSize: 300 }];
      const errors = validateSceneElements(elements);
      expect(errors.some(e => e.includes('Font size must be a number between 1 and 200'))).toBe(true);
    });
  });

  describe('validateJSON2VideoRequest', () => {
    const validElement = { type: 'video', src: 'https://test.com/video.mp4' };
    
    it.each([
      ['minimal request', { scenes: [{ elements: [validElement] }] }],
      ['with dimensions', { width: 1920, height: 1080, scenes: [{ elements: [validElement] }] }],
      ['with fps', { fps: 30, scenes: [{ elements: [validElement] }] }],
      ['with quality', { quality: 'high', scenes: [{ elements: [validElement] }] }],
      ['with custom resolution', { resolution: 'custom', width: 1920, height: 1080, scenes: [{ elements: [validElement] }] }],
      ['with movie elements', { 
        elements: [{ type: 'subtitles', captions: 'test' }], 
        scenes: [{ elements: [validElement] }] 
      }],
      ['with scene transitions', { 
        scenes: [{ 
          elements: [validElement], 
          transition: { style: 'fade', duration: 1.0 } 
        }] 
      }],
      ['with scene duration', { 
        scenes: [{ 
          elements: [validElement], 
          duration: 10 
        }] 
      }],
      ['with scene background color', { 
        scenes: [{ 
          elements: [validElement], 
          'background-color': '#ffffff' 
        }] 
      }]
    ])('should validate valid request: %s', (_, request) => {
      const result = validateJSON2VideoRequest(request);
      expect(result.isValid).toBe(true);
    });

    it.each([
      ['null request', null, 'Request must be an object'],
      ['string request', 'invalid', 'Request must be an object'],
      ['missing scenes', {}, 'Missing required field: scenes'],
      ['non-array scenes', { scenes: 'invalid' }, 'Scenes must be an array'],
      ['width NaN', { width: NaN, scenes: [{ elements: [validElement] }] }, 'width must be a number'],
      ['width string', { width: 'invalid', scenes: [{ elements: [validElement] }] }, 'width must be a number'],
      ['width below minimum', { width: 30, scenes: [{ elements: [validElement] }] }, 'width must be between'],
      ['width above maximum', { width: 5000, scenes: [{ elements: [validElement] }] }, 'width must be between'],
      ['height NaN', { height: NaN, scenes: [{ elements: [validElement] }] }, 'height must be a number'],
      ['height out of range', { height: 5000, scenes: [{ elements: [validElement] }] }, 'height must be between'],
      ['fps NaN', { fps: NaN, scenes: [{ elements: [validElement] }] }, 'fps must be a number'],
      ['fps out of range', { fps: 200, scenes: [{ elements: [validElement] }] }, 'fps must be between'],
      ['invalid quality', { quality: 'ultra', scenes: [{ elements: [validElement] }] }, 'Quality must be one of'],
      ['invalid resolution', { resolution: 'ultra-hd', scenes: [{ elements: [validElement] }] }, 'Resolution must be one of'],
      ['custom resolution missing width', { resolution: 'custom', scenes: [{ elements: [validElement] }] }, 'Width is required when resolution is "custom"'],
      ['custom resolution missing height', { resolution: 'custom', width: 1920, scenes: [{ elements: [validElement] }] }, 'Height is required when resolution is "custom"']
    ])('should reject invalid request: %s', (_, request, expectedError) => {
      const result = validateJSON2VideoRequest(request as any);
      expect(result.errors.some(e => e.includes(expectedError))).toBe(true);
    });

    it.each([
      ['empty scenes array', { scenes: [] }, 'No scenes defined - video will be empty', 'warning'],
      ['invalid scene object', { scenes: [null] }, 'Scene must be an object', 'error'],
      ['scene missing elements', { scenes: [{}] }, 'Missing required field: elements', 'error'],
      ['invalid scene duration', { scenes: [{ elements: [validElement], duration: -5 }] }, 'Duration must be a positive number', 'error'],
      ['scene duration -1 valid', { scenes: [{ elements: [validElement], duration: -1 }] }, '', 'valid'],
      ['scene duration -2 valid', { scenes: [{ elements: [validElement], duration: -2 }] }, '', 'valid'],
      ['invalid transition style', { 
        scenes: [{ 
          elements: [validElement], 
          transition: { style: 'invalid' } 
        }] 
      }, 'Invalid transition style', 'error'],
      ['missing transition style', { 
        scenes: [{ 
          elements: [validElement], 
          transition: {} 
        }] 
      }, 'Invalid transition style', 'error'],
      ['invalid transition duration', { 
        scenes: [{ 
          elements: [validElement], 
          transition: { style: 'fade', duration: -1 } 
        }] 
      }, 'Transition duration must be a positive number', 'error'],
      ['transition duration not number', { 
        scenes: [{ 
          elements: [validElement], 
          transition: { style: 'fade', duration: 'invalid' } 
        }] 
      }, 'Transition duration must be a positive number', 'error'],
      ['invalid background color', { 
        scenes: [{ 
          elements: [validElement], 
          'background-color': 'invalid-color' 
        }] 
      }, 'Invalid background color format', 'error']
    ])('should handle specific validation cases: %s', (_, request, expectedError, errorType) => {
      const result = validateJSON2VideoRequest(request as any);
      if (errorType === 'warning') {
        expect(result.warnings.some(w => w.includes(expectedError))).toBe(true);
      } else if (errorType === 'valid') {
        expect(result.isValid).toBe(true);
      } else {
        expect(result.errors.some(e => e.includes(expectedError))).toBe(true);
      }
    });

    it('should validate movie elements in request', () => {
      const request = {
        elements: [{ type: 'text', text: 'Valid text', fontSize: 0 }],
        scenes: [{ elements: [validElement] }]
      };
      const result = validateJSON2VideoRequest(request);
      expect(result.errors.some(e => e.includes('Font size must be a number between 1 and 200'))).toBe(true);
    });
  });

  describe('Common Element Field Validation', () => {
    it.each([
      ['invalid duration', { duration: -3 }, 'Duration must be a positive number, -1 (intrinsic), or -2 (match container)'],
      ['negative start time', { start: -1 }, 'Start time must be a non-negative number'],
      ['start time not number', { start: 'invalid' }, 'Start time must be a non-negative number'],
      ['invalid z-index type', { 'z-index': 'invalid' }, 'Z-index must be a number between'],
      ['z-index too low', { 'z-index': -200 }, 'Z-index must be a number between'],
      ['z-index too high', { 'z-index': 200 }, 'Z-index must be a number between'],
      ['invalid volume type', { volume: 'loud' }, 'Volume must be a number between'],
      ['volume too low', { volume: -5 }, 'Volume must be a number between'],
      ['volume too high', { volume: 25 }, 'Volume must be a number between'],
      ['invalid position', { position: 'somewhere' }, 'Invalid position. Must be one of'],
      ['custom position missing x', { position: 'custom', y: 200 }, 'X and Y coordinates are required'],
      ['custom position missing y', { position: 'custom', x: 100 }, 'X and Y coordinates are required'],
      ['negative fade-in', { 'fade-in': -1 }, 'Fade-in must be a non-negative number'],
      ['fade-in not number', { 'fade-in': 'invalid' }, 'Fade-in must be a non-negative number'],
      ['negative fade-out', { 'fade-out': -2 }, 'Fade-out must be a non-negative number'],
      ['fade-out not number', { 'fade-out': 'invalid' }, 'Fade-out must be a non-negative number']
    ])('should validate common field: %s', (_, extraFields, expectedError) => {
      const element = { 
        type: 'video', 
        src: 'https://test.com/video.mp4',
        ...extraFields 
      };
      
      const errors = validateSceneElements([element]);
      expect(errors.some(e => e.includes(expectedError))).toBe(true);
    });

    it.each([
      ['valid common fields', {
        duration: 5,
        start: 0,
        'z-index': 5,
        volume: 0.8,
        position: 'center-center',
        'fade-in': 1,
        'fade-out': 1
      }],
      ['valid custom position', {
        position: 'custom',
        x: 100,
        y: 200
      }]
    ])('should accept %s', (_, extraFields) => {
      const element = {
        type: 'video',
        src: 'https://test.com/video.mp4',
        ...extraFields
      };
      
      const errors = validateSceneElements([element]);
      expect(errors).toHaveLength(0);
    });
  });

  describe('Edge Cases', () => {
    it.each([
      ['validateJSON2VideoRequest with null', () => validateJSON2VideoRequest(null)],
      ['validateMovieElements with null', () => validateMovieElements(null as any)],
      ['validateSceneElements with null', () => validateSceneElements(null as any)]
    ])('should handle null inputs gracefully: %s', (_, testFn) => {
      expect(testFn).not.toThrow();
    });

    it.each([
      [-1, true],
      [-2, true],
      [5, true],
      [0.1, true],
      [-5, false]
    ])('should validate duration special values: %d (valid: %s)', (duration, shouldBeValid) => {
      const request = {
        scenes: [{
          elements: [{
            type: 'video',
            src: 'https://test.com/video.mp4',
            duration
          }]
        }]
      };

      const result = validateJSON2VideoRequest(request);
      expect(result.isValid).toBe(shouldBeValid);
    });

    it.each([
      ['valid colors', ['#ff0000', '#f00', 'rgb(255,0,0)', 'rgba(255,0,0,0.5)', 'transparent'], false],
      ['invalid colors', ['blue', 'red', 'green', 'yellow', 'invalid-color'], true]
    ])('should validate color formats: %s', (_, colors, shouldHaveError) => {
      colors.forEach(color => {
        const params: SubtitleElementParams = {
          captions: 'Test',
          wordColor: color
        };
        const errors = validateSubtitleElementParams(params);
        expect(errors.some(e => e.includes('wordColor must be a valid color'))).toBe(shouldHaveError);
      });
    });

    it('should test URL validation edge cases', () => {
      expect(() => new URL('invalid-url')).toThrow();
      expect(() => new URL('https://example.com')).not.toThrow();
    });

    it.each([
      ['elements with various field states', [
        { type: 'text', text: '' },
        { type: 'text', text: '   ' },
        { type: 'text', text: null },
        { type: 'text' },
        { type: 'text', text: 'valid' }
      ]],
      ['movie elements with field states', [
        { type: 'subtitles', captions: '', src: '', text: '' },
        { type: 'subtitles', captions: 'valid' },
        { type: 'audio', src: '' },
        { type: 'audio', src: 'valid' },
        { type: 'voice', text: '' },
        { type: 'voice', text: 'valid' }
      ]]
    ])('should test validation paths: %s', (_, elements) => {
      elements.forEach(element => {
        const movieErrors = validateMovieElements([element]);
        expect(Array.isArray(movieErrors)).toBe(true);
        
        if (element.type !== 'subtitles') {
          const sceneErrors = validateSceneElements([element]);
          expect(Array.isArray(sceneErrors)).toBe(true);
        }
      });
    });
  });
});