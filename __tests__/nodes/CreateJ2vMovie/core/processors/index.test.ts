// __tests__/nodes/CreateJ2vMovie/core/processors/index.test.ts

import {
  convertCamelToKebab,
  processCommonProperties,
  processVisualProperties,
  processVolume,
  processDuration,
  processStart,
  processLoop,
  processCrop,
  processColor,
  processFontSize,
  getProcessor,
  getSupportedElementTypes,
  isElementTypeSupported,
  processFallbackElement
} from '../../../../../nodes/CreateJ2vMovie/core/processors/index';

describe('processors/index - Shared Utilities', () => {
  
  describe('convertCamelToKebab', () => {
    it.each([
      ['backgroundColor to background-color', { backgroundColor: '#FF0000' }, { 'background-color': '#FF0000' }],
      ['fadeIn and fadeOut', { fadeIn: 2, fadeOut: 3 }, { 'fade-in': 2, 'fade-out': 3 }],
      ['zIndex to z-index', { zIndex: 5 }, { 'z-index': 5 }],
      ['font properties', { fontFamily: 'Arial', fontSize: 24, fontWeight: '700' }, { 'font-family': 'Arial', 'font-size': 24, 'font-weight': '700' }],
      ['text alignment', { textAlign: 'center', verticalPosition: 'top' }, { 'text-align': 'center', 'vertical-position': 'top' }],
      ['mixed properties', { normalProp: 'value', camelCase: 'test', backgroundColor: '#000' }, { normalProp: 'value', camelCase: 'test', 'background-color': '#000' }],
      ['no conversions needed', { type: 'video', src: 'video.mp4' }, { type: 'video', src: 'video.mp4' }]
    ])('should convert %s', (_, input, expected) => {
      const result = convertCamelToKebab(input);
      expect(result).toEqual(expected);
    });

    it('should remove original camelCase properties after conversion', () => {
      const input = { fadeIn: 2, fadeOut: 3, backgroundColor: '#FF0000' };
      const result = convertCamelToKebab(input);
      
      expect(result).not.toHaveProperty('fadeIn');
      expect(result).not.toHaveProperty('fadeOut');
      expect(result).not.toHaveProperty('backgroundColor');
      expect(result).toHaveProperty('fade-in');
      expect(result).toHaveProperty('fade-out');
      expect(result).toHaveProperty('background-color');
    });

    it.each([
      ['null input', null, null],
      ['non-object input', 'string', 'string'],
      ['array input', [1, 2, 3], [1, 2, 3]],
      ['empty object', {}, {}]
    ])('should handle edge case: %s', (_, input, expected) => {
      const result = convertCamelToKebab(input);
      expect(result).toEqual(expected);
    });
  });

  describe('processVolume', () => {
    it.each([
      ['valid number', 5, 5],
      ['valid string number', '2.5', 2.5],
      ['minimum boundary', 0, 0],
      ['maximum boundary', 10, 10],
      ['above maximum clamped', 15, 10],
      ['below minimum clamped', -5, 0],
      ['decimal value', 3.7, 3.7]
    ])('should process %s', (_, input, expected) => {
      expect(processVolume(input)).toBe(expected);
    });

    it.each([
      ['invalid string', 'invalid', 1],
      ['NaN', NaN, 1],
      ['null becomes 0', null, 0],
      ['undefined', undefined, 1],
      ['empty string', '', 1]
    ])('should handle invalid input: %s', (_, input, expected) => {
      expect(processVolume(input)).toBe(expected);
    });
  });

  describe('processDuration', () => {
    it.each([
      ['positive number', 10, 10],
      ['string number', '5.5', 5.5],
      ['zero', 0, 0],
      ['special value -1', -1, -1],
      ['special value -2', -2, -2],
      ['decimal value', 2.7, 2.7]
    ])('should process %s', (_, input, expected) => {
      expect(processDuration(input)).toBe(expected);
    });

    it.each([
      ['negative non-special', -5, 0],
      ['invalid string', 'invalid', -1],
      ['NaN', NaN, -1],
      ['null becomes 0', null, 0],
      ['undefined', undefined, -1]
    ])('should handle edge case: %s', (_, input, expected) => {
      expect(processDuration(input)).toBe(expected);
    });
  });

  describe('processStart', () => {
    it.each([
      ['positive number', 5, 5],
      ['string number', '2.5', 2.5],
      ['zero', 0, 0],
      ['decimal value', 1.3, 1.3]
    ])('should process %s', (_, input, expected) => {
      expect(processStart(input)).toBe(expected);
    });

    it.each([
      ['negative clamped', -5, 0],
      ['invalid string', 'invalid', 0],
      ['NaN', NaN, 0],
      ['null becomes 0', null, 0],
      ['undefined', undefined, 0]
    ])('should handle edge case: %s', (_, input, expected) => {
      expect(processStart(input)).toBe(expected);
    });
  });

  describe('processLoop', () => {
    it.each([
      ['boolean true', true, -1],
      ['boolean false', false, 1],
      ['numeric value', 5, 5],
      ['zero', 0, 0],
      ['negative number', -3, -3]
    ])('should process %s', (_, input, expected) => {
      expect(processLoop(input)).toBe(expected);
    });
  });

  describe('processCrop', () => {
    it.each([
      ['true to cover', true, 'cover'],
      ['false to contain', false, 'contain']
    ])('should process %s', (_, input, expected) => {
      expect(processCrop(input)).toBe(expected);
    });
  });

  describe('processColor', () => {
    it.each([
      ['color without hash', 'FF0000', '#FF0000'],
      ['color with hash', '#00FF00', '#00FF00'],
      ['uppercase', 'BLUE', '#BLUE'],
      ['lowercase', 'red', '#red']
    ])('should process %s', (_, input, expected) => {
      expect(processColor(input)).toBe(expected);
    });
  });

  describe('processFontSize', () => {
    it.each([
      ['string with px', '24px', 24],
      ['string with pt', '18pt', 18],
      ['string with em', '2em', 2],
      ['string with rem', '1.5rem', 1.5],
      ['numeric value', 32, 32],
      ['invalid string', 'large', 'large'],
      ['mixed string', '16px extra text', 16]
    ])('should process %s', (_, input, expected) => {
      expect(processFontSize(input)).toBe(expected);
    });
  });

  describe('processVisualProperties', () => {
    it.each([
      ['positioning properties', { position: 'center', x: '10', y: '20' }, { position: 'center', x: 10, y: 20 }],
      ['dimension properties', { width: '100', height: '200' }, { width: 100, height: 200 }],
      ['negative width to auto', { width: -50 }, { width: -1 }],
      ['negative height to auto', { height: -100 }, { height: -1 }],
      ['preserve -1 dimensions', { width: -1, height: -1 }, { width: -1, height: -1 }],
      ['boolean flip properties', { flipHorizontal: true, flipVertical: false }, { flipHorizontal: true, flipVertical: false }],
      ['pan settings', { pan: 'left', panDistance: 0.3, panCrop: true }, { pan: 'left', panDistance: 0.3, panCrop: true }],
      ['zoom clamping', { zoom: 15 }, { zoom: 10 }],
      ['zoom minimum', { zoom: -15 }, { zoom: -10 }],
      ['pan distance clamping max', { panDistance: 1.0 }, { panDistance: 0.5 }],
      ['pan distance clamping min', { panDistance: 0.001 }, { panDistance: 0.01 }]
    ])('should process %s', (_, input, expected) => {
      const result = processVisualProperties(input);
      expect(result).toMatchObject(expected);
    });

    it('should handle complex visual properties', () => {
      const input = {
        type: 'video',
        position: 'custom',
        x: 50,
        y: 75,
        width: 640,
        height: 480,
        resize: 'cover',
        zoom: 2.5,
        flipHorizontal: true,
        pan: 'right',
        panDistance: 0.2,
        panCrop: false,
        crop: { x: 10, y: 20, width: 100, height: 200 },
        rotate: { angle: 45, speed: 2 },
        mask: 'mask.png',
        chromaKey: { color: '#00FF00', tolerance: 30 },
        correction: { brightness: 0.2, contrast: 1.5 }
      };

      const result = processVisualProperties(input);

      expect(result).toMatchObject({
        type: 'video',
        position: 'custom',
        x: 50,
        y: 75,
        width: 640,
        height: 480,
        resize: 'cover',
        zoom: 2.5,
        flipHorizontal: true,
        pan: 'right',
        panDistance: 0.2,
        panCrop: false,
        crop: { x: 10, y: 20, width: 100, height: 200 },
        rotate: { angle: 45, speed: 2 },
        mask: 'mask.png',
        chromaKey: { color: '#00FF00', tolerance: 30 },
        correction: { brightness: 0.2, contrast: 1.5 }
      });
    });

    it.each([
      ['invalid x coordinate', { x: 'invalid' }],
      ['invalid y coordinate', { y: 'invalid' }],
      ['invalid width', { width: 'auto' }],
      ['invalid height', { height: 'auto' }],
      ['invalid zoom', { zoom: 'big' }],
      ['invalid pan distance', { panDistance: 'far' }]
    ])('should handle invalid values: %s', (_, input) => {
      const result = processVisualProperties(input);
      
      // Invalid numeric values should not be processed, original value preserved
      if ('x' in input && input.x === 'invalid') {
        expect(result.x).toBe('invalid');
      }
      if ('y' in input && input.y === 'invalid') {
        expect(result.y).toBe('invalid');
      }
      if ('width' in input && input.width === 'auto') {
        expect(result.width).toBe('auto');
      }
      if ('height' in input && input.height === 'auto') {
        expect(result.height).toBe('auto');
      }
      if ('zoom' in input && input.zoom === 'big') {
        expect(result.zoom).toBe('big');
      }
      if ('panDistance' in input && input.panDistance === 'far') {
        expect(result.panDistance).toBe('far');
      }
    });

    it('should preserve undefined properties', () => {
      const input = { type: 'image', src: 'test.jpg' };
      const result = processVisualProperties(input);
      
      expect(result).toEqual({ type: 'image', src: 'test.jpg' });
      expect(result).not.toHaveProperty('x');
      expect(result).not.toHaveProperty('y');
      expect(result).not.toHaveProperty('width');
      expect(result).not.toHaveProperty('height');
    });
  });

  describe('processCommonProperties', () => {
    it('should process timing properties', () => {
      const input = { type: 'test', duration: '10', start: '5' };
      const result = processCommonProperties(input);
      
      expect(result).toMatchObject({
        type: 'test',
        duration: 10,
        start: 5
      });
    });

    it('should handle special duration values', () => {
      const input = { type: 'test', duration: -1, start: -3 };
      const result = processCommonProperties(input);
      
      expect(result).toMatchObject({
        type: 'test',
        duration: -1,
        start: 0
      });
    });

    it('should preserve properties without transformation', () => {
      const input = { type: 'test', src: 'file.mp4', volume: 5 };
      const result = processCommonProperties(input);
      
      expect(result).toMatchObject({
        type: 'test',
        src: 'file.mp4',
        volume: 5
      });
    });
  });

  describe('Processor Registry', () => {
    describe('getProcessor', () => {
      it.each([
        ['audio', 'audio'],
        ['voice', 'voice']
      ])('should return processor for implemented %s', (_, elementType) => {
        const processor = getProcessor(elementType);
        expect(processor).toBeInstanceOf(Function);
        expect(processor).not.toBe(processFallbackElement);
      });

      it.each([
        ['video', 'video'],
        ['image', 'image'],
        ['text', 'text'],
        ['subtitles', 'subtitles'],
        ['component', 'component'],
        ['audiogram', 'audiogram']
      ])('should return processor for %s (may be fallback during development)', (_, elementType) => {
        const processor = getProcessor(elementType);
        expect(processor).toBeInstanceOf(Function);
      });

      it('should return null for unknown element type', () => {
        expect(getProcessor('unknown')).toBeNull();
      });
    });

    describe('getSupportedElementTypes', () => {
      it('should return all supported element types', () => {
        const types = getSupportedElementTypes();
        expect(types).toContain('video');
        expect(types).toContain('audio');
        expect(types).toContain('image');
        expect(types).toContain('text');
        expect(types).toContain('voice');
        expect(types).toContain('subtitles');
        expect(types).toContain('component');
        expect(types).toContain('audiogram');
        expect(types.length).toBe(8);
      });
    });

    describe('isElementTypeSupported', () => {
      it.each([
        ['video', true],
        ['audio', true],
        ['text', true],
        ['voice', true],
        ['unknown', false],
        ['', false]
      ])('should check if %s is supported', (elementType, expected) => {
        expect(isElementTypeSupported(elementType)).toBe(expected);
      });
    });
  });

  describe('processFallbackElement', () => {
    it('should process unknown element with basic transformations', () => {
      const input = {
        type: 'unknown',
        loop: true,
        volume: '5.5',
        fadeIn: 2,
        backgroundColor: '#FF0000',
        duration: '10'
      };

      const result = processFallbackElement(input);

      expect(result).toMatchObject({
        type: 'unknown',
        loop: -1,
        volume: 5.5,
        'fade-in': 2,
        'background-color': '#FF0000',
        duration: 10
      });

      expect(result).not.toHaveProperty('fadeIn');
      expect(result).not.toHaveProperty('backgroundColor');
    });

    it('should handle minimal element', () => {
      const input = { type: 'custom', src: 'test.file' };
      const result = processFallbackElement(input);
      
      expect(result).toEqual({
        type: 'custom',
        src: 'test.file'
      });
    });
  });
});