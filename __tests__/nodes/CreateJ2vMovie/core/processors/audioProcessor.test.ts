// __tests__/nodes/CreateJ2vMovie/core/processors/audioProcessor.test.ts

import { processAudioElement } from '../../../../../nodes/CreateJ2vMovie/core/processors/audioProcessor';

describe('audioProcessor', () => {
  describe('processAudioElement', () => {
    
    describe('audio-specific properties', () => {
      it.each([
        ['basic audio element', { type: 'audio', src: 'audio.mp3' }, { type: 'audio', src: 'audio.mp3' }],
        ['audio with seek', { type: 'audio', src: 'audio.mp3', seek: 10 }, { type: 'audio', src: 'audio.mp3', seek: 10 }],
        ['audio with volume', { type: 'audio', src: 'audio.mp3', volume: 0.5 }, { type: 'audio', src: 'audio.mp3', volume: 0.5 }],
        ['audio with string volume', { type: 'audio', src: 'audio.mp3', volume: '2.5' }, { type: 'audio', src: 'audio.mp3', volume: 2.5 }],
        ['audio with high volume clamped', { type: 'audio', src: 'audio.mp3', volume: 15 }, { type: 'audio', src: 'audio.mp3', volume: 10 }],
        ['audio with negative volume clamped', { type: 'audio', src: 'audio.mp3', volume: -5 }, { type: 'audio', src: 'audio.mp3', volume: 0 }],
        ['audio with boolean loop true', { type: 'audio', src: 'audio.mp3', loop: true }, { type: 'audio', src: 'audio.mp3', loop: -1 }],
        ['audio with boolean loop false', { type: 'audio', src: 'audio.mp3', loop: false }, { type: 'audio', src: 'audio.mp3', loop: 1 }],
        ['audio with numeric loop', { type: 'audio', src: 'audio.mp3', loop: 5 }, { type: 'audio', src: 'audio.mp3', loop: 5 }],
        ['audio with muted true', { type: 'audio', src: 'audio.mp3', muted: true }, { type: 'audio', src: 'audio.mp3', muted: true }],
        ['audio with muted false', { type: 'audio', src: 'audio.mp3', muted: false }, { type: 'audio', src: 'audio.mp3', muted: false }],
        ['audio with string seek', { type: 'audio', src: 'audio.mp3', seek: '5.5' }, { type: 'audio', src: 'audio.mp3', seek: 5.5 }],
        ['audio with negative seek clamped', { type: 'audio', src: 'audio.mp3', seek: -3 }, { type: 'audio', src: 'audio.mp3', seek: 0 }],
        ['audio with zero seek', { type: 'audio', src: 'audio.mp3', seek: 0 }, { type: 'audio', src: 'audio.mp3', seek: 0 }],
        ['audio with decimal seek', { type: 'audio', src: 'audio.mp3', seek: 2.75 }, { type: 'audio', src: 'audio.mp3', seek: 2.75 }]
      ])('should process %s', (_, input, expected) => {
        const result = processAudioElement(input);
        expect(result).toEqual(expected);
      });

      it.each([
        ['string muted value', { type: 'audio', src: 'audio.mp3', muted: 'yes' }, { muted: true }],
        ['numeric muted value', { type: 'audio', src: 'audio.mp3', muted: 1 }, { muted: true }],
        ['zero muted value', { type: 'audio', src: 'audio.mp3', muted: 0 }, { muted: false }],
        ['empty string muted', { type: 'audio', src: 'audio.mp3', muted: '' }, { muted: false }]
      ])('should handle muted type coercion: %s', (_, input, expectedSubset) => {
        const result = processAudioElement(input);
        expect(result).toMatchObject(expectedSubset);
      });
    });

    describe('common properties integration', () => {
      it.each([
        ['timing properties', { type: 'audio', src: 'audio.mp3', start: 5, duration: 10 }, { start: 5, duration: 10 }],
        ['string timing values', { type: 'audio', src: 'audio.mp3', start: '2.5', duration: '15.5' }, { start: 2.5, duration: 15.5 }],
        ['special duration -1', { type: 'audio', src: 'audio.mp3', duration: -1 }, { duration: -1 }],
        ['special duration -2', { type: 'audio', src: 'audio.mp3', duration: -2 }, { duration: -2 }],
        ['negative start clamped to 0', { type: 'audio', src: 'audio.mp3', start: -5 }, { start: 0 }],
        ['zero duration', { type: 'audio', src: 'audio.mp3', duration: 0 }, { duration: 0 }],
        ['decimal timing', { type: 'audio', src: 'audio.mp3', start: 1.25, duration: 8.75 }, { start: 1.25, duration: 8.75 }]
      ])('should handle %s', (_, input, expectedSubset) => {
        const result = processAudioElement(input);
        expect(result).toMatchObject(expectedSubset);
      });
    });

    describe('camelCase to kebab-case conversion', () => {
      it.each([
        ['fade properties', { type: 'audio', src: 'audio.mp3', fadeIn: 2, fadeOut: 3 }, { 'fade-in': 2, 'fade-out': 3 }],
        ['z-index', { type: 'audio', src: 'audio.mp3', zIndex: 5 }, { 'z-index': 5 }],
        ['extra time', { type: 'audio', src: 'audio.mp3', extraTime: 2 }, { 'extra-time': 2 }],
        ['background color', { type: 'audio', src: 'audio.mp3', backgroundColor: '#FF0000' }, { 'background-color': '#FF0000' }]
      ])('should convert %s', (_, input, expectedSubset) => {
        const result = processAudioElement(input);
        expect(result).toMatchObject(expectedSubset);
        
        // Ensure camelCase properties are removed
        Object.keys(input).forEach(key => {
          if (key.includes('In') || key.includes('Out') || key === 'zIndex' || key === 'extraTime' || key === 'backgroundColor') {
            expect(result).not.toHaveProperty(key);
          }
        });
      });
    });

    describe('comprehensive integration', () => {
      it('should handle complete audio element with all supported properties', () => {
        const input = {
          type: 'audio',
          src: 'complex-audio.mp3',
          // Audio properties
          seek: 2.5,
          volume: 7.5,
          muted: false,
          loop: true,
          // Common properties
          start: 10,
          duration: 30,
          fadeIn: 2,
          fadeOut: 1.5,
          zIndex: 3,
          extraTime: 0.5,
          // Meta properties
          id: 'audio-element-1',
          comment: 'Background music',
          cache: true
        };

        const result = processAudioElement(input);

        expect(result).toMatchObject({
          type: 'audio',
          src: 'complex-audio.mp3',
          seek: 2.5,
          volume: 7.5,
          muted: false,
          loop: -1,
          start: 10,
          duration: 30,
          'fade-in': 2,
          'fade-out': 1.5,
          'z-index': 3,
          'extra-time': 0.5,
          id: 'audio-element-1',
          comment: 'Background music',
          cache: true
        });

        // Verify camelCase properties removed
        expect(result).not.toHaveProperty('fadeIn');
        expect(result).not.toHaveProperty('fadeOut');
        expect(result).not.toHaveProperty('zIndex');
        expect(result).not.toHaveProperty('extraTime');
      });

      it('should handle minimal audio element', () => {
        const input = { type: 'audio' };
        const result = processAudioElement(input);
        
        expect(result).toEqual({ type: 'audio' });
      });

      it('should handle audio element with only src', () => {
        const input = { type: 'audio', src: 'simple.mp3' };
        const result = processAudioElement(input);
        
        expect(result).toEqual({ 
          type: 'audio',
          src: 'simple.mp3'
        });
      });
    });

    describe('error handling and edge cases', () => {
      it.each([
        ['invalid volume string', { type: 'audio', src: 'test.mp3', volume: 'loud' }, { volume: 1 }],
        ['NaN volume', { type: 'audio', src: 'test.mp3', volume: NaN }, { volume: 1 }],
        ['invalid duration string', { type: 'audio', src: 'test.mp3', duration: 'forever' }, { duration: -1 }],
        ['NaN duration', { type: 'audio', src: 'test.mp3', duration: NaN }, { duration: -1 }],
        ['invalid start string', { type: 'audio', src: 'test.mp3', start: 'beginning' }, { start: 0 }],
        ['NaN start', { type: 'audio', src: 'test.mp3', start: NaN }, { start: 0 }],
        ['invalid seek string', { type: 'audio', src: 'test.mp3', seek: 'middle' }, { seek: 0 }],
        ['NaN seek', { type: 'audio', src: 'test.mp3', seek: NaN }, { seek: 0 }],
        ['null src preserved', { type: 'audio', src: null }, { src: null }],
        ['undefined properties ignored', { type: 'audio', src: 'test.mp3', volume: undefined, muted: undefined }, { src: 'test.mp3' }]
      ])('should handle invalid values gracefully: %s', (_, input, expectedSubset) => {
        const result = processAudioElement(input);
        expect(result).toMatchObject(expectedSubset);
      });

      it('should preserve unknown audio properties', () => {
        const input = {
          type: 'audio',
          src: 'test.mp3',
          customAudioProperty: 'custom-value',
          experimentalFeature: true,
          metadata: { format: 'mp3', bitrate: 320 }
        };

        const result = processAudioElement(input);
        
        expect(result.customAudioProperty).toBe('custom-value');
        expect(result.experimentalFeature).toBe(true);
        expect(result.metadata).toEqual({ format: 'mp3', bitrate: 320 });
      });

      it('should handle edge case numeric values', () => {
        const input = {
          type: 'audio',
          src: 'edge-case.mp3',
          volume: 0,        // Minimum valid
          seek: 999.99,     // Large valid number
          loop: -1,         // Infinite loop
          start: 0.001,     // Very small start
          duration: 3600    // 1 hour duration
        };

        const result = processAudioElement(input);
        
        expect(result.volume).toBe(0);
        expect(result.seek).toBe(999.99);
        expect(result.loop).toBe(-1);
        expect(result.start).toBe(0.001);
        expect(result.duration).toBe(3600);
      });
    });

    describe('loop property handling', () => {
      it.each([
        ['boolean true converts to -1', { type: 'audio', src: 'test.mp3', loop: true }, { loop: -1 }],
        ['boolean false converts to 1', { type: 'audio', src: 'test.mp3', loop: false }, { loop: 1 }],
        ['numeric value preserved', { type: 'audio', src: 'test.mp3', loop: 5 }, { loop: 5 }],
        ['negative numeric preserved', { type: 'audio', src: 'test.mp3', loop: -3 }, { loop: -3 }],
        ['zero preserved', { type: 'audio', src: 'test.mp3', loop: 0 }, { loop: 0 }],
        ['large number preserved', { type: 'audio', src: 'test.mp3', loop: 100 }, { loop: 100 }]
      ])('should handle %s', (_, input, expectedSubset) => {
        const result = processAudioElement(input);
        expect(result).toMatchObject(expectedSubset);
      });
    });

    describe('volume clamping validation', () => {
      it.each([
        ['volume at minimum boundary', { type: 'audio', src: 'test.mp3', volume: 0 }, { volume: 0 }],
        ['volume at maximum boundary', { type: 'audio', src: 'test.mp3', volume: 10 }, { volume: 10 }],
        ['volume above maximum', { type: 'audio', src: 'test.mp3', volume: 25 }, { volume: 10 }],
        ['volume below minimum', { type: 'audio', src: 'test.mp3', volume: -10 }, { volume: 0 }],
        ['volume with decimals', { type: 'audio', src: 'test.mp3', volume: 3.7 }, { volume: 3.7 }],
        ['volume string parsing', { type: 'audio', src: 'test.mp3', volume: '8.5' }, { volume: 8.5 }]
      ])('should handle %s', (_, input, expectedSubset) => {
        const result = processAudioElement(input);
        expect(result).toMatchObject(expectedSubset);
      });
    });
  });
});