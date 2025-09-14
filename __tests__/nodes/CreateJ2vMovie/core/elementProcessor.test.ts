// __tests__/nodes/CreateJ2vMovie/core/elementProcessor.test.ts

import {
  processElement,
  processElements,
  processTextElement,
  processSubtitleElement, 
  processBasicElement
} from '../../../../nodes/CreateJ2vMovie/core/elementProcessor';

describe('elementProcessor', () => {
  
  describe('processTextElement (re-export)', () => {
    it('should process text element directly', () => {
      const input = {
        type: 'text',
        text: 'Direct text test',
        textSettings: {
          fontFamily: 'Arial',
          fontSize: 20
        }
      };

      const result = processTextElement(input);
      expect(result.type).toBe('text');
      expect(result.text).toBe('Direct text test');
      expect(result.settings).toMatchObject({
        'font-family': 'Arial',
        'font-size': 20
      });
    });
  });

  describe('processSubtitleElement (re-export)', () => {
    it('should process subtitle element directly', () => {
      const input = {
        type: 'subtitles',
        text: 'Direct subtitle test',
        subtitleSettings: {
          fontSize: '16',
          textColor: '#FFFFFF'
        }
      };

      const result = processSubtitleElement(input);
      expect(result.type).toBe('subtitles');
      expect(result.text).toBe('Direct subtitle test');
      expect(result.settings).toMatchObject({
        'font-size': 16,
        color: '#FFFFFF'
      });
    });
  });

  describe('processBasicElement (re-export)', () => {
    it('should process basic element directly', () => {
      const input = {
        type: 'video',
        src: 'direct-test.mp4',
        timing: { start: 5, duration: 10 },
        audioControls: { volume: 8 }
      };

      const result = processBasicElement(input);
      expect(result.type).toBe('video');
      expect(result.src).toBe('direct-test.mp4');
      expect(result.start).toBe(5);
      expect(result.duration).toBe(10);
      expect(result.volume).toBe(8);
      expect(result).not.toHaveProperty('timing');
      expect(result).not.toHaveProperty('audioControls');
    });
  });
  
  describe('processElement', () => {
    it.each([
      ['text', { type: 'text', text: 'Hello' }],
      ['subtitles', { type: 'subtitles', text: 'Subtitle' }],
      ['video', { type: 'video', src: 'video.mp4' }],
      ['audio', { type: 'audio', src: 'audio.mp3' }],
      ['image', { type: 'image', src: 'image.jpg' }],
      ['voice', { type: 'voice', text: 'Hello' }],
      ['component', { type: 'component', component: 'test' }],
      ['audiogram', { type: 'audiogram', color: '#FF0000' }],
      ['html', { type: 'html', html: '<p>Hello</p>' }],
      ['unknown', { type: 'unknown', prop: 'value' }]
    ])('should route %s elements correctly', (elementType, input) => {
      const result = processElement(input);
      expect(result.type).toBe(elementType);
    });

    it.each([
      ['null element', null],
      ['undefined element', undefined],
      ['element without type', { text: 'No type' }],
      ['empty object', {}]
    ])('should throw error for %s', (_, input) => {
      expect(() => processElement(input)).toThrow('Element must have a type property');
    });

    it('should process text element with settings', () => {
      const input = {
        type: 'text',
        text: 'Styled Text',
        textSettings: {
          fontFamily: 'Arial',
          fontSize: 24
        }
      };

      const result = processElement(input);
      expect(result.type).toBe('text');
      expect(result.text).toBe('Styled Text');
      expect(result.settings).toMatchObject({
        'font-family': 'Arial',
        'font-size': 24
      });
      expect(result).not.toHaveProperty('textSettings');
    });

    it('should process subtitle element with settings', () => {
      const input = {
        type: 'subtitles',
        text: 'Subtitle',
        subtitleSettings: {
          fontFamily: 'Helvetica',
          fontSize: '18'
        }
      };

      const result = processElement(input);
      expect(result.type).toBe('subtitles');
      expect(result.text).toBe('Subtitle');
      expect(result.settings).toMatchObject({
        'font-family': 'Helvetica',
        'font-size': 18
      });
      expect(result).not.toHaveProperty('subtitleSettings');
    });

    it('should process video element with collections', () => {
      const input = {
        type: 'video',
        src: 'video.mp4',
        timing: { start: 5, duration: 10 },
        audioControls: { volume: 8, muted: false },
        positioning: { x: 100, y: 200 }
      };

      const result = processElement(input);
      expect(result.type).toBe('video');
      expect(result.src).toBe('video.mp4');
      expect(result.start).toBe(5);
      expect(result.duration).toBe(10);
      expect(result.volume).toBe(8);
      expect(result.muted).toBe(false);
      expect(result.x).toBe(100);
      expect(result.y).toBe(200);
      expect(result).not.toHaveProperty('timing');
      expect(result).not.toHaveProperty('audioControls');
      expect(result).not.toHaveProperty('positioning');
    });

    it('should process voice element with voice settings', () => {
      const input = {
        type: 'voice',
        text: 'Hello World',
        voiceSettings: {
          voice: 'en-US-AriaNeural',
          model: 'azure'
        }
      };

      const result = processElement(input);
      expect(result.type).toBe('voice');
      expect(result.text).toBe('Hello World');
      expect(result.voice).toBe('en-US-AriaNeural');
      expect(result.model).toBe('azure');
      expect(result).not.toHaveProperty('voiceSettings');
    });

    it('should process audiogram element with settings', () => {
      const input = {
        type: 'audiogram',
        audiogramSettings: {
          color: '#FF6B00',
          opacity: 0.8,
          amplitude: 7
        }
      };

      const result = processElement(input);
      expect(result.type).toBe('audiogram');
      expect(result.color).toBe('#FF6B00');
      expect(result.opacity).toBe(0.8);
      expect(result.amplitude).toBe(7);
      expect(result).not.toHaveProperty('audiogramSettings');
    });

    it('should handle camelCase conversion', () => {
      const input = {
        type: 'video',
        fadeIn: 2,
        fadeOut: 1,
        backgroundColor: '#FF0000'
      };

      const result = processElement(input);
      expect(result).toMatchObject({
        type: 'video',
        'fade-in': 2,
        'fade-out': 1,
        'background-color': '#FF0000'
      });
      expect(result).not.toHaveProperty('fadeIn');
      expect(result).not.toHaveProperty('fadeOut');
      expect(result).not.toHaveProperty('backgroundColor');
    });
  });

  describe('processElements', () => {
    it('should process array of valid elements', () => {
      const input = [
        { type: 'text', text: 'Hello' },
        { type: 'video', src: 'video.mp4' },
        { type: 'audio', src: 'audio.mp3' }
      ];

      const result = processElements(input);

      expect(result.errors).toHaveLength(0);
      expect(result.processed).toHaveLength(3);
      expect(result.processed[0].type).toBe('text');
      expect(result.processed[1].type).toBe('video');
      expect(result.processed[2].type).toBe('audio');
    });

    it('should handle mix of valid and invalid elements', () => {
      const input = [
        { type: 'text', text: 'Valid' },
        { text: 'Invalid - no type' },
        { type: 'video', src: 'valid.mp4' }
      ];

      const result = processElements(input);

      expect(result.processed).toHaveLength(2);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('Element 1:');
      expect(result.errors[0]).toContain('Element must have a type property');
    });

    it('should handle non-array input', () => {
      const result = processElements('not an array' as any);
      expect(result.processed).toEqual([]);
      expect(result.errors).toEqual(['Elements must be an array']);
    });

    it('should handle empty array', () => {
      const result = processElements([]);
      expect(result.processed).toEqual([]);
      expect(result.errors).toEqual([]);
    });

    it('should handle null and undefined elements', () => {
      const input = [
        { type: 'text', text: 'Valid' },
        null,
        undefined,
        { type: 'video', src: 'valid.mp4' }
      ];

      const result = processElements(input);

      expect(result.processed).toHaveLength(2);
      expect(result.errors).toHaveLength(2);
      expect(result.errors[0]).toBe('Element 1: Element must have a type property');
      expect(result.errors[1]).toBe('Element 2: Element must have a type property');
    });

    it('should handle all invalid elements', () => {
      const input = [
        { text: 'No type 1' },
        { text: 'No type 2' },
        null
      ];

      const result = processElements(input);

      expect(result.processed).toHaveLength(0);
      expect(result.errors).toHaveLength(3);
      expect(result.errors[0]).toContain('Element 0:');
      expect(result.errors[1]).toContain('Element 1:');
      expect(result.errors[2]).toContain('Element 2:');
    });

    it('should handle elements that throw non-Error exceptions', () => {
      // Create an element that will throw a string instead of Error
      const problematicElement = {
        get type() {
          throw 'String error instead of Error object';
        }
      };

      const result = processElements([problematicElement]);

      expect(result.processed).toHaveLength(0);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toBe('Element 0: Unknown error');
    });

    it('should preserve element order in results', () => {
      const input = [
        { type: 'video', src: 'first.mp4' },
        { type: 'audio', src: 'second.mp3' },
        { type: 'text', text: 'third' }
      ];

      const result = processElements(input);

      expect(result.processed[0]).toMatchObject({ type: 'video', src: 'first.mp4' });
      expect(result.processed[1]).toMatchObject({ type: 'audio', src: 'second.mp3' });
      expect(result.processed[2]).toMatchObject({ type: 'text', text: 'third' });
    });

    it('should handle large arrays efficiently', () => {
      const input = Array(100).fill(0).map((_, i) => ({
        type: 'text',
        text: `Text ${i}`
      }));

      const result = processElements(input);

      expect(result.processed).toHaveLength(100);
      expect(result.errors).toHaveLength(0);
      expect(result.processed[0].text).toBe('Text 0');
      expect(result.processed[99].text).toBe('Text 99');
    });
  });

  describe('integration tests', () => {
    it('should handle complex element with multiple collections', () => {
      const input = {
        type: 'video',
        src: 'complex.mp4',
        timing: {
          start: 10,
          duration: 30,
          fadeIn: 2,
          fadeOut: 1
        },
        audioControls: {
          volume: 7,
          muted: false,
          seek: 5
        },
        positioning: {
          x: 100,
          y: 200,
          width: 800,
          height: 600
        },
        visualEffects: {
          zoom: 1.5,
          flipHorizontal: true
        }
      };

      const result = processElement(input);

      expect(result).toMatchObject({
        type: 'video',
        src: 'complex.mp4',
        start: 10,
        duration: 30,
        'fade-in': 2,
        'fade-out': 1,
        volume: 7,
        muted: false,
        seek: 5,
        x: 100,
        y: 200,
        width: 800,
        height: 600,
        zoom: 1.5,
        'flip-horizontal': true
      });

      // Verify collections are removed
      expect(result).not.toHaveProperty('timing');
      expect(result).not.toHaveProperty('audioControls');
      expect(result).not.toHaveProperty('positioning');
      expect(result).not.toHaveProperty('visualEffects');
    });

    it('should preserve custom properties while processing collections', () => {
      const input = {
        type: 'image',
        src: 'image.jpg',
        customProperty: 'preserved',
        nestedCustom: { deep: 'value' },
        timing: { start: 5 },
        positioning: { x: 50 }
      };

      const result = processElement(input);

      expect(result).toMatchObject({
        type: 'image',
        src: 'image.jpg',
        'custom-property': 'preserved',
        'nested-custom': { deep: 'value' },
        start: 5,
        x: 50
      });
    });
  });
});