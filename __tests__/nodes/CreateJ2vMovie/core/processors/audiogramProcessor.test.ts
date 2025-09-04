// __tests__/nodes/CreateJ2vMovie/core/processors/audiogramProcessor.test.ts

import { processAudiogramElement } from '../../../../../nodes/CreateJ2vMovie/core/processors/audiogramProcessor';

describe('audiogramProcessor', () => {
  describe('processAudiogramElement', () => {
    
    describe('audiogram-specific properties', () => {
      it.each([
        ['basic audiogram element', { type: 'audiogram' }, { type: 'audiogram' }],
        ['audiogram with color', { type: 'audiogram', color: '#FF0000' }, { type: 'audiogram', color: '#FF0000' }],
        ['audiogram with hex color', { type: 'audiogram', color: '#00FF00' }, { type: 'audiogram', color: '#00FF00' }],
        ['audiogram with opacity minimum', { type: 'audiogram', opacity: 0 }, { type: 'audiogram', opacity: 0 }],
        ['audiogram with opacity maximum', { type: 'audiogram', opacity: 1 }, { type: 'audiogram', opacity: 1 }],
        ['audiogram with opacity middle', { type: 'audiogram', opacity: 0.5 }, { type: 'audiogram', opacity: 0.5 }],
        ['audiogram with string opacity', { type: 'audiogram', opacity: '0.8' }, { type: 'audiogram', opacity: 0.8 }],
        ['audiogram with opacity above max', { type: 'audiogram', opacity: 2.5 }, { type: 'audiogram', opacity: 1 }],
        ['audiogram with opacity below min', { type: 'audiogram', opacity: -0.3 }, { type: 'audiogram', opacity: 0 }],
        ['audiogram with amplitude minimum', { type: 'audiogram', amplitude: 0 }, { type: 'audiogram', amplitude: 0 }],
        ['audiogram with amplitude maximum', { type: 'audiogram', amplitude: 10 }, { type: 'audiogram', amplitude: 10 }],
        ['audiogram with amplitude middle', { type: 'audiogram', amplitude: 5 }, { type: 'audiogram', amplitude: 5 }],
        ['audiogram with string amplitude', { type: 'audiogram', amplitude: '7.5' }, { type: 'audiogram', amplitude: 7.5 }],
        ['audiogram with amplitude above max', { type: 'audiogram', amplitude: 15 }, { type: 'audiogram', amplitude: 10 }],
        ['audiogram with amplitude below min', { type: 'audiogram', amplitude: -2 }, { type: 'audiogram', amplitude: 0 }],
        ['audiogram with all specific properties', { type: 'audiogram', color: '#0000FF', opacity: 0.7, amplitude: 8 }, { type: 'audiogram', color: '#0000FF', opacity: 0.7, amplitude: 8 }]
      ])('should process %s', (_, input, expected) => {
        const result = processAudiogramElement(input);
        expect(result).toEqual(expected);
      });

      it.each([
        ['invalid opacity string', { type: 'audiogram', opacity: 'transparent' }, { opacity: 0.5 }],
        ['NaN opacity', { type: 'audiogram', opacity: NaN }, { opacity: 0.5 }],
        ['invalid amplitude string', { type: 'audiogram', amplitude: 'loud' }, { amplitude: 5 }],
        ['NaN amplitude', { type: 'audiogram', amplitude: NaN }, { amplitude: 5 }]
      ])('should handle invalid values with defaults: %s', (_, input, expectedSubset) => {
        const result = processAudiogramElement(input);
        expect(result).toMatchObject(expectedSubset);
      });
    });

    describe('visual properties integration', () => {
      it.each([
        ['position properties', { type: 'audiogram', position: 'center-center', x: 100, y: 200 }, { position: 'center-center', x: 100, y: 200 }],
        ['dimension properties', { type: 'audiogram', width: 640, height: 480 }, { width: 640, height: 480 }],
        ['string dimensions', { type: 'audiogram', width: '800', height: '600' }, { width: 800, height: 600 }],
        ['resize mode', { type: 'audiogram', resize: 'cover' }, { resize: 'cover' }],
        ['negative dimensions clamped', { type: 'audiogram', width: -100, height: -50 }, { width: -1, height: -1 }],
        ['zero dimensions', { type: 'audiogram', width: 0, height: 0 }, { width: 0, height: 0 }],
        ['decimal positions', { type: 'audiogram', x: 150.5, y: 275.3 }, { x: 150.5, y: 275.3 }]
      ])('should handle %s', (_, input, expectedSubset) => {
        const result = processAudiogramElement(input);
        expect(result).toMatchObject(expectedSubset);
      });
    });
    
    describe('common properties integration', () => {
      it.each([
        ['timing properties', { type: 'audiogram', start: 5, duration: 10 }, { start: 5, duration: 10 }],
        ['string timing values', { type: 'audiogram', start: '2.5', duration: '15.5' }, { start: 2.5, duration: 15.5 }],
        ['special duration -1', { type: 'audiogram', duration: -1 }, { duration: -1 }],
        ['special duration -2', { type: 'audiogram', duration: -2 }, { duration: -2 }],
        ['negative start clamped to 0', { type: 'audiogram', start: -5 }, { start: 0 }],
        ['zero duration', { type: 'audiogram', duration: 0 }, { duration: 0 }],
        ['decimal timing', { type: 'audiogram', start: 1.25, duration: 8.75 }, { start: 1.25, duration: 8.75 }]
      ])('should handle %s', (_, input, expectedSubset) => {
        const result = processAudiogramElement(input);
        expect(result).toMatchObject(expectedSubset);
      });
    });

    describe('camelCase to kebab-case conversion', () => {
      it.each([
        ['fade properties', { type: 'audiogram', fadeIn: 2, fadeOut: 3 }, { 'fade-in': 2, 'fade-out': 3 }],
        ['z-index', { type: 'audiogram', zIndex: 5 }, { 'z-index': 5 }],
        ['extra time', { type: 'audiogram', extraTime: 2 }, { 'extra-time': 2 }],
        ['pan distance', { type: 'audiogram', panDistance: 0.3 }, { 'pan-distance': 0.3 }],
        ['pan crop', { type: 'audiogram', panCrop: false }, { 'pan-crop': false }]
      ])('should convert %s', (_, input, expectedSubset) => {
        const result = processAudiogramElement(input);
        expect(result).toMatchObject(expectedSubset);
        
        // Ensure camelCase properties are removed
        Object.keys(input).forEach(key => {
          if (key.includes('In') || key.includes('Out') || key === 'zIndex' || key === 'extraTime' || 
              key === 'panDistance' || key === 'panCrop') {
            expect(result).not.toHaveProperty(key);
          }
        });
      });
    });

    describe('comprehensive integration', () => {
      it('should handle complete audiogram element with all supported properties', () => {
        const input = {
          type: 'audiogram',
          // Audiogram-specific properties
          color: '#FF6B00',
          opacity: 0.8,
          amplitude: 7,
          // Visual properties
          position: 'bottom-center',
          x: 0,
          y: 50,
          width: 800,
          height: 100,
          resize: 'fit',
          zoom: 2,
          // Common properties
          start: 5,
          duration: 30,
          fadeIn: 1,
          fadeOut: 2,
          zIndex: 10,
          extraTime: 0.5,
          // Meta properties
          id: 'audiogram-wave',
          comment: 'Audio waveform visualization',
          cache: true
        };

        const result = processAudiogramElement(input);

        expect(result).toMatchObject({
          type: 'audiogram',
          color: '#FF6B00',
          opacity: 0.8,
          amplitude: 7,
          position: 'bottom-center',
          x: 0,
          y: 50,
          width: 800,
          height: 100,
          resize: 'fit',
          zoom: 2,
          start: 5,
          duration: 30,
          'fade-in': 1,
          'fade-out': 2,
          'z-index': 10,
          'extra-time': 0.5,
          id: 'audiogram-wave',
          comment: 'Audio waveform visualization',
          cache: true
        });

        // Verify camelCase properties removed
        expect(result).not.toHaveProperty('fadeIn');
        expect(result).not.toHaveProperty('fadeOut');
        expect(result).not.toHaveProperty('zIndex');
        expect(result).not.toHaveProperty('extraTime');
      });

      it('should handle minimal audiogram element', () => {
        const input = { type: 'audiogram' };
        const result = processAudiogramElement(input);
        
        expect(result).toEqual({ type: 'audiogram' });
      });

      it('should handle audiogram element with only visual properties', () => {
        const input = { 
          type: 'audiogram',
          position: 'center-center',
          width: 400,
          height: 200
        };
        const result = processAudiogramElement(input);
        
        expect(result).toEqual({ 
          type: 'audiogram',
          position: 'center-center',
          width: 400,
          height: 200
        });
      });
    });

    describe('error handling and edge cases', () => {
      it.each([
        ['invalid opacity string', { type: 'audiogram', opacity: 'half' }, { opacity: 0.5 }],
        ['NaN opacity', { type: 'audiogram', opacity: NaN }, { opacity: 0.5 }],
        ['invalid amplitude string', { type: 'audiogram', amplitude: 'maximum' }, { amplitude: 5 }],
        ['NaN amplitude', { type: 'audiogram', amplitude: NaN }, { amplitude: 5 }],
        ['invalid duration string', { type: 'audiogram', duration: 'forever' }, { duration: -1 }],
        ['NaN duration', { type: 'audiogram', duration: NaN }, { duration: -1 }],
        ['null color preserved', { type: 'audiogram', color: null }, { color: null }],
        ['undefined properties ignored', { type: 'audiogram', color: undefined, opacity: undefined }, {}]
      ])('should handle invalid values gracefully: %s', (_, input, expectedSubset) => {
        const result = processAudiogramElement(input);
        expect(result).toMatchObject(expectedSubset);
      });

      it('should preserve unknown audiogram properties', () => {
        const input = {
          type: 'audiogram',
          customAudiogramProperty: 'custom-value',
          experimentalFeature: true,
          metadata: { waveformType: 'bars', fps: 60 }
        };

        const result = processAudiogramElement(input);
        
        expect(result.customAudiogramProperty).toBe('custom-value');
        expect(result.experimentalFeature).toBe(true);
        expect(result.metadata).toEqual({ waveformType: 'bars', fps: 60 });
      });

      it('should handle boundary value combinations', () => {
        const input = {
          type: 'audiogram',
          opacity: 1,          // Maximum valid
          amplitude: 0,        // Minimum valid
          color: '#FFFFFF',    // Valid hex color
          x: -100,            // Can be negative for positioning
          width: 1920,        // Large valid dimension
          duration: -1        // Special duration value
        };

        const result = processAudiogramElement(input);
        
        expect(result.opacity).toBe(1);
        expect(result.amplitude).toBe(0);
        expect(result.color).toBe('#FFFFFF');
        expect(result.x).toBe(-100);
        expect(result.width).toBe(1920);
        expect(result.duration).toBe(-1);
      });
    });

    describe('opacity clamping validation', () => {
      it.each([
        ['opacity at minimum boundary', { type: 'audiogram', opacity: 0 }, { opacity: 0 }],
        ['opacity at maximum boundary', { type: 'audiogram', opacity: 1 }, { opacity: 1 }],
        ['opacity above maximum', { type: 'audiogram', opacity: 3 }, { opacity: 1 }],
        ['opacity below minimum', { type: 'audiogram', opacity: -0.5 }, { opacity: 0 }],
        ['opacity with decimals', { type: 'audiogram', opacity: 0.75 }, { opacity: 0.75 }],
        ['opacity string parsing', { type: 'audiogram', opacity: '0.25' }, { opacity: 0.25 }]
      ])('should handle %s', (_, input, expectedSubset) => {
        const result = processAudiogramElement(input);
        expect(result).toMatchObject(expectedSubset);
      });
    });

    describe('amplitude clamping validation', () => {
      it.each([
        ['amplitude at minimum boundary', { type: 'audiogram', amplitude: 0 }, { amplitude: 0 }],
        ['amplitude at maximum boundary', { type: 'audiogram', amplitude: 10 }, { amplitude: 10 }],
        ['amplitude above maximum', { type: 'audiogram', amplitude: 20 }, { amplitude: 10 }],
        ['amplitude below minimum', { type: 'audiogram', amplitude: -5 }, { amplitude: 0 }],
        ['amplitude with decimals', { type: 'audiogram', amplitude: 6.5 }, { amplitude: 6.5 }],
        ['amplitude string parsing', { type: 'audiogram', amplitude: '3.7' }, { amplitude: 3.7 }]
      ])('should handle %s', (_, input, expectedSubset) => {
        const result = processAudiogramElement(input);
        expect(result).toMatchObject(expectedSubset);
      });
    });
  });
});