// __tests__/nodes/CreateJ2vMovie/core/elementProcessor.test.ts

import {
  processTextElement,
  processSubtitleElement,
  processBasicElement,
  processElement,
  processElements,
  processMovieElements,
  processSceneElements,
  getElementContext,
  validateElementContext
} from '../../../../nodes/CreateJ2vMovie/core/elementProcessor';

describe('elementProcessor', () => {
  
  describe('processTextElement', () => {
    it.each([
      ['basic text element', { text: 'Hello World', type: 'text' }, { type: 'text', text: 'Hello World' }],
      ['text with timing', { text: 'Timed text', type: 'text', start: 5, duration: 10 }, { type: 'text', text: 'Timed text', start: 5, duration: 10 }],
      ['text with custom position', { text: 'Positioned', type: 'text', position: 'custom', x: 100, y: 200 }, { type: 'text', text: 'Positioned', position: 'custom', x: 100, y: 200 }],
      ['text with font styling', { text: 'Font test', type: 'text', fontFamily: 'Arial', fontSize: '24px', fontWeight: '700', fontColor: '#FF0000' }, { type: 'text', text: 'Font test', settings: { 'font-family': 'Arial', 'font-size': 24, 'font-weight': '700', 'font-color': '#FF0000' } }],
      ['text with numeric font size', { text: 'Numeric font', type: 'text', fontSize: 32 }, { type: 'text', text: 'Numeric font', settings: { 'font-size': 32 } }],
      ['text with alignment', { text: 'Aligned', type: 'text', textAlign: 'center', verticalPosition: 'top', horizontalPosition: 'right' }, { type: 'text', text: 'Aligned', settings: { 'text-align': 'center', 'vertical-position': 'top', 'horizontal-position': 'right' } }],
      ['text with width and height', { text: 'Sized text', type: 'text', width: 800, height: 600 }, { type: 'text', text: 'Sized text', width: 800, height: 600 }],
      ['text with valid style', { text: 'Styled text', type: 'text', style: '001' }, { type: 'text', text: 'Styled text', style: '001' }],
      ['text with additional properties', { text: 'Full text', type: 'text', lineHeight: 1.5, letterSpacing: 2, textShadow: '2px 2px 4px #000', textDecoration: 'underline', textTransform: 'uppercase' }, { type: 'text', text: 'Full text', settings: { 'line-height': 1.5, 'letter-spacing': 2, 'text-shadow': '2px 2px 4px #000', 'text-decoration': 'underline', 'text-transform': 'uppercase' } }],
      ['text with background color', { text: 'Background text', type: 'text', backgroundColor: '#000000' }, { type: 'text', text: 'Background text', settings: { 'background-color': '#000000' } }]
    ])('should process %s', (_, input, expected) => {
      const result = processTextElement(input);
      expect(result).toEqual(expected);
    });

    it.each([
      ['invalid text style passes through', { text: 'Test', type: 'text', style: 'invalid' }, { type: 'text', text: 'Test', style: 'invalid' }],
      ['invalid text alignment passes through', { text: 'Test', type: 'text', textAlign: 'invalid' }, { type: 'text', text: 'Test', settings: { 'text-align': 'invalid' } }],
      ['no styling properties', { text: 'Plain', type: 'text' }, { type: 'text', text: 'Plain' }],
      ['font size parsing with units', { text: 'Test', type: 'text', fontSize: '24px' }, { type: 'text', text: 'Test', settings: { 'font-size': 24 } }],
      ['font size invalid string', { text: 'Test', type: 'text', fontSize: 'large' }, { type: 'text', text: 'Test', settings: { 'font-size': 'large' } }]
    ])('should handle edge case: %s', (_, input, expected) => {
      const result = processTextElement(input);
      expect(result).toEqual(expected);
    });
  });

  describe('processSubtitleElement', () => {
    it.each([
      ['subtitle with URL', { captions: 'https://example.com/subtitles.srt', type: 'subtitles' }, { type: 'subtitles', captions: 'https://example.com/subtitles.srt' }],
      ['subtitle with HTTP URL', { captions: 'http://example.com/subtitles.srt', type: 'subtitles' }, { type: 'subtitles', captions: 'http://example.com/subtitles.srt' }],
      ['subtitle with inline text', { captions: '00:00:01,000 --> 00:00:05,000\nHello World', type: 'subtitles' }, { type: 'subtitles', captions: '00:00:01,000 --> 00:00:05,000\nHello World' }],
      ['subtitle with language and model', { captions: 'https://example.com/subs.srt', language: 'en', model: 'whisper', type: 'subtitles' }, { type: 'subtitles', captions: 'https://example.com/subs.srt', language: 'en', model: 'whisper' }]
    ])('should process %s', (_, input, expected) => {
      const result = processSubtitleElement(input);
      expect(result).toEqual(expected);
    });

    it('should handle subtitle with comprehensive settings', () => {
      const input = {
        captions: 'Test subtitles',
        type: 'subtitles',
        style: 'classic',
        allCaps: true,
        position: 'bottom-center',
        fontFamily: 'Arial',
        fontSize: 24,
        fontUrl: 'https://example.com/font.ttf',
        wordColor: '#FFFF00',
        lineColor: '#FFFFFF',
        boxColor: '#000000',
        outlineColor: '#000000',
        shadowColor: '#666666',
        outlineWidth: 2,
        shadowOffset: 1,
        maxWordsPerLine: 4,
        x: 10,
        y: 20,
        keywords: ['word1', 'word2'],
        replace: { 'old': 'new' }
      };
      const result = processSubtitleElement(input);
      
      expect(result.type).toBe('subtitles');
      expect(result.captions).toBe('Test subtitles');
      expect(result.settings).toEqual({
        style: 'classic',
        'all-caps': true,
        position: 'bottom-center',
        'font-family': 'Arial',
        'font-size': 24,
        'font-url': 'https://example.com/font.ttf',
        'word-color': '#FFFF00',
        'line-color': '#FFFFFF',
        'box-color': '#000000',
        'outline-color': '#000000',
        'shadow-color': '#666666',
        'outline-width': 2,
        'shadow-offset': 1,
        'max-words-per-line': 4,
        x: 10,
        y: 20,
        keywords: ['word1', 'word2'],
        replace: { 'old': 'new' }
      });
    });

    it.each([
      ['empty arrays and objects', { captions: 'Test', type: 'subtitles', keywords: [], replace: {} }, { type: 'subtitles', captions: 'Test' }],
      ['no settings', { captions: 'Simple', type: 'subtitles' }, { type: 'subtitles', captions: 'Simple' }]
    ])('should handle %s', (_, input, expected) => {
      const result = processSubtitleElement(input);
      expect(result).toEqual(expected);
    });
  });

  describe('processBasicElement', () => {
    it.each([
      ['basic video', { type: 'video', src: 'video.mp4' }, { type: 'video', src: 'video.mp4' }],
      ['video with boolean loop true', { type: 'video', src: 'video.mp4', loop: true }, { type: 'video', src: 'video.mp4', loop: -1 }],
      ['video with boolean loop false', { type: 'video', src: 'video.mp4', loop: false }, { type: 'video', src: 'video.mp4', loop: 1 }],
      ['video with boolean crop true', { type: 'video', src: 'video.mp4', crop: true }, { type: 'video', src: 'video.mp4', resize: 'cover' }],
      ['video with boolean crop false', { type: 'video', src: 'video.mp4', crop: false }, { type: 'video', src: 'video.mp4', resize: 'contain' }],
      ['basic audio', { type: 'audio', src: 'audio.mp3' }, { type: 'audio', src: 'audio.mp3' }],
      ['basic image', { type: 'image', src: 'image.jpg' }, { type: 'image', src: 'image.jpg' }],
      ['basic voice', { type: 'voice', text: 'Hello world' }, { type: 'voice', text: 'Hello world' }],
      ['basic component', { type: 'component', component: 'my-component-id' }, { type: 'component', component: 'my-component-id' }],
      ['basic audiogram', { type: 'audiogram' }, { type: 'audiogram' }]
    ])('should process %s element', (_, input, expected) => {
      const result = processBasicElement(input);
      expect(result).toMatchObject(expected);
    });

    it('should handle comprehensive camelCase to kebab-case transformations', () => {
      const input = {
        type: 'video',
        src: 'video.mp4',
        backgroundColor: '#FF0000',
        extraTime: 5,
        panDistance: 0.3,
        panCrop: true,
        flipHorizontal: true,
        flipVertical: false,
        chromaKey: { color: '#00FF00', tolerance: 30 },
        fadeIn: 2,
        fadeOut: 3,
        zIndex: 5
      };
      
      const result = processBasicElement(input);
      
      expect(result).toMatchObject({
        type: 'video',
        src: 'video.mp4',
        'background-color': '#FF0000',
        'extra-time': 5,
        'pan-distance': 0.3,
        'pan-crop': true,
        'flip-horizontal': true,
        'flip-vertical': false,
        'chroma-key': { color: '#00FF00', tolerance: 30 },
        'fade-in': 2,
        'fade-out': 3,
        'z-index': 5
      });
      
      // Ensure camelCase properties are removed
      expect(result).not.toHaveProperty('backgroundColor');
      expect(result).not.toHaveProperty('extraTime');
      expect(result).not.toHaveProperty('fadeIn');
    });

    it.each([
      ['image AI properties', { type: 'image', prompt: 'sunset', aspectRatio: 'horizontal', modelSettings: { steps: 50 } }, { 'aspect-ratio': 'horizontal', 'model-settings': { steps: 50 } }],
      ['audiogram color without hash', { type: 'audiogram', color: 'FF0000' }, { color: '#FF0000' }],
      ['audiogram color with hash', { type: 'audiogram', color: '#00FF00' }, { color: '#00FF00' }],
      ['voice with invalid model', { type: 'voice', text: 'Test', model: 'invalid-model' }, { text: 'Test' }],
      ['volume string parsing', { type: 'audio', src: 'test.mp3', volume: '5.5' }, { volume: 5.5 }],
      ['volume clamping high', { type: 'audio', src: 'test.mp3', volume: 15 }, { volume: 10 }],
      ['volume clamping low', { type: 'audio', src: 'test.mp3', volume: -5 }, { volume: 0 }],
      ['duration string parsing', { type: 'video', src: 'test.mp4', duration: '10.5' }, { duration: 10.5 }],
      ['start string parsing', { type: 'video', src: 'test.mp4', start: '5.5' }, { start: 5.5 }],
      ['special duration -1', { type: 'video', src: 'test.mp4', duration: -1 }, { duration: -1 }],
      ['special duration -2', { type: 'video', src: 'test.mp4', duration: -2 }, { duration: -2 }]
    ])('should handle %s', (_, input, expectedSubset) => {
      const result = processBasicElement(input);
      expect(result).toMatchObject(expectedSubset);
    });

    it.each([
      ['invalid volume string', { type: 'audio', src: 'test.mp3', volume: 'invalid' }],
      ['invalid duration string', { type: 'video', src: 'test.mp4', duration: 'invalid' }],
      ['invalid start string', { type: 'video', src: 'test.mp4', start: 'invalid' }],
      ['NaN volume', { type: 'audio', src: 'test.mp3', volume: NaN }],
      ['NaN duration', { type: 'video', src: 'test.mp4', duration: NaN }],
      ['NaN start', { type: 'video', src: 'test.mp4', start: NaN }]
    ])('should handle invalid numeric values: %s', (_, input) => {
      expect(() => processBasicElement(input)).not.toThrow();
      const result = processBasicElement(input);
      expect(result).toHaveProperty('type', input.type);
    });

    it('should throw error for component without ID', () => {
      expect(() => {
        processBasicElement({ type: 'component' });
      }).toThrow('Component elements require a component ID');
    });
  });

  describe('processElement - Router Function', () => {
    it.each([
      ['text element', { type: 'text', text: 'Hello' }],
      ['subtitle element', { type: 'subtitles', captions: 'Test subtitles' }],
      ['video element', { type: 'video', src: 'video.mp4' }],
      ['audio element', { type: 'audio', src: 'audio.mp3' }],
      ['image element', { type: 'image', src: 'image.jpg' }],
      ['voice element', { type: 'voice', text: 'Hello' }],
      ['component element', { type: 'component', component: 'comp-1' }],
      ['audiogram element', { type: 'audiogram', color: '#FF0000' }]
    ])('should route %s', (_, input) => {
      const result = processElement(input);
      expect(result).toHaveProperty('type', input.type);
    });

    it.each([
      ['null element', null, 'Element must have a type property'],
      ['element without type', { someProperty: 'value' }, 'Element must have a type property'],
      ['element with null type', { type: null }, 'Element must have a type property']
    ])('should handle invalid input: %s', (_, input, expectedError) => {
      expect(() => processElement(input)).toThrow(expectedError);
    });

    it('should handle component element that throws error', () => {
      expect(() => {
        processElement({ type: 'component' });
      }).toThrow('Component elements require a component ID');
    });
  });

  describe('processElements - Batch Processing', () => {
    it.each([
      ['valid elements array', [{ type: 'text', text: 'Hello' }, { type: 'video', src: 'video.mp4' }], { processedCount: 2, errorCount: 0 }],
      ['mixed valid and invalid', [{ type: 'text', text: 'Hello' }, { type: 'component' }, { type: 'video', src: 'video.mp4' }], { processedCount: 2, errorCount: 1 }],
      ['empty array', [], { processedCount: 0, errorCount: 0 }],
      ['non-array input', 'not-an-array', { processedCount: 0, errorCount: 1 }]
    ])('should handle %s', (_, input, expected) => {
      const result = processElements(input as any);
      expect(result.processed).toHaveLength(expected.processedCount);
      expect(result.errors).toHaveLength(expected.errorCount);
    });

    it('should handle elements with processing errors', () => {
      const problematicElements = [
        { type: 'text', text: 'Good element' },
        { type: 'component' }, // Missing component ID - will cause error
        { type: 'video', src: 'good-video.mp4' }
      ];

      const result = processElements(problematicElements);
      
      expect(result.processed).toHaveLength(2);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('Element 2:');
      expect(result.errors[0]).toContain('Component elements require a component ID');
    });

    it('should handle multiple processing errors', () => {
      const elements = [
        { type: 'component' },        // Error: missing component ID
        { type: 'text', text: 'Good' }, // Valid
        { type: 'component' },        // Error: missing component ID  
        null                          // Error: no type
      ];

      const result = processElements(elements);
      
      expect(result.processed).toHaveLength(1);
      expect(result.errors).toHaveLength(3);
      expect(result.errors[0]).toContain('Element 1:');
      expect(result.errors[1]).toContain('Element 3:');
      expect(result.errors[2]).toContain('Element 4:');
    });
  });

  describe('processMovieElements', () => {
    it.each([
      ['valid movie elements', [{ type: 'text', text: 'Movie title' }, { type: 'subtitles', captions: 'Subtitle content' }], { processedCount: 2, errorCount: 0 }],
      ['scene-only elements at movie level', [{ type: 'text', text: 'Valid' }, { type: 'video', src: 'video.mp4' }], { processedCount: 1, errorCount: 1 }]
    ])('should validate %s', (_, input, expected) => {
      const result = processMovieElements(input);
      expect(result.processed).toHaveLength(expected.processedCount);
      expect(result.errors).toHaveLength(expected.errorCount);
    });
  });

  describe('processSceneElements', () => {
    it.each([
      ['valid scene elements', [{ type: 'video', src: 'video.mp4' }, { type: 'text', text: 'Scene text' }], { processedCount: 2, errorCount: 0 }],
      ['scene elements with subtitles', [{ type: 'video', src: 'video.mp4' }, { type: 'subtitles', captions: 'Should not be here' }], { processedCount: 1, errorCount: 1 }]
    ])('should validate %s', (_, input, expected) => {
      const result = processSceneElements(input);
      expect(result.processed).toHaveLength(expected.processedCount);
      expect(result.errors).toHaveLength(expected.errorCount);
      
      if (expected.errorCount > 0) {
        expect(result.errors.some((error: string) => error.includes('Subtitles can only be added at movie level'))).toBe(true);
      }
    });

    it('should reject elements not allowed at scene level', () => {
      const mockElement = { type: 'unknown-scene-type', someProperty: 'value' };
      const result = processSceneElements([mockElement]);
      
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some((error: string) => 
        error.includes('is not allowed at scene level')
      )).toBe(true);
    });
  });

  describe('getElementContext', () => {
    it.each([
      ['subtitles', 'subtitles', 'movie'],
      ['video', 'video', 'scene'],
      ['image', 'image', 'scene'],
      ['component', 'component', 'scene'],
      ['audiogram', 'audiogram', 'scene'],
      ['text', 'text', 'both'],
      ['audio', 'audio', 'both'],
      ['voice', 'voice', 'both'],
      ['unknown type', 'unknown-type', 'scene']
    ])('should determine context for %s element', (_, elementType, expected) => {
      const result = getElementContext(elementType);
      expect(result).toBe(expected);
    });
  });

  describe('validateElementContext', () => {
    it.each([
      ['text at movie level', 'text', 'movie', true],
      ['subtitles at movie level', 'subtitles', 'movie', true],
      ['audio at movie level', 'audio', 'movie', true],
      ['voice at movie level', 'voice', 'movie', true],
      ['video at movie level', 'video', 'movie', false],
      ['image at movie level', 'image', 'movie', false],
      ['component at movie level', 'component', 'movie', false],
      ['video at scene level', 'video', 'scene', true],
      ['image at scene level', 'image', 'scene', true],
      ['text at scene level', 'text', 'scene', true],
      ['subtitles at scene level', 'subtitles', 'scene', false]
    ])('should validate %s', (_, elementType, context, expected) => {
      const result = validateElementContext(elementType, context as 'movie' | 'scene');
      expect(result).toBe(expected);
    });
  });
});