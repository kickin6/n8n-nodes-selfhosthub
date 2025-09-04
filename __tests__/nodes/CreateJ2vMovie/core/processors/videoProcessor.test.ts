// __tests__/nodes/CreateJ2vMovie/core/processors/videoProcessor.test.ts

import { processVideoElement } from '../../../../../nodes/CreateJ2vMovie/core/processors/videoProcessor';

describe('videoProcessor', () => {
  describe('processVideoElement', () => {
    
    describe('video-specific properties', () => {
      it.each([
        ['basic video element', { type: 'video', src: 'video.mp4' }, { type: 'video', src: 'video.mp4' }],
        ['video with URL src', { type: 'video', src: 'https://example.com/video.mp4' }, { type: 'video', src: 'https://example.com/video.mp4' }],
        ['video without src', { type: 'video' }, { type: 'video' }],
        ['video with seek', { type: 'video', src: 'video.mp4', seek: 15 }, { type: 'video', src: 'video.mp4', seek: 15 }],
        ['video with string seek', { type: 'video', src: 'video.mp4', seek: '10.5' }, { type: 'video', src: 'video.mp4', seek: 10.5 }],
        ['video with negative seek clamped', { type: 'video', src: 'video.mp4', seek: -5 }, { type: 'video', src: 'video.mp4', seek: 0 }],
        ['video with zero seek', { type: 'video', src: 'video.mp4', seek: 0 }, { type: 'video', src: 'video.mp4', seek: 0 }],
        ['video with decimal seek', { type: 'video', src: 'video.mp4', seek: 3.25 }, { type: 'video', src: 'video.mp4', seek: 3.25 }],
        ['video with volume', { type: 'video', src: 'video.mp4', volume: 0.8 }, { type: 'video', src: 'video.mp4', volume: 0.8 }],
        ['video with string volume', { type: 'video', src: 'video.mp4', volume: '2.5' }, { type: 'video', src: 'video.mp4', volume: 2.5 }],
        ['video with high volume clamped', { type: 'video', src: 'video.mp4', volume: 15 }, { type: 'video', src: 'video.mp4', volume: 10 }],
        ['video with negative volume clamped', { type: 'video', src: 'video.mp4', volume: -3 }, { type: 'video', src: 'video.mp4', volume: 0 }],
        ['video with boolean loop true', { type: 'video', src: 'video.mp4', loop: true }, { type: 'video', src: 'video.mp4', loop: -1 }],
        ['video with boolean loop false', { type: 'video', src: 'video.mp4', loop: false }, { type: 'video', src: 'video.mp4', loop: 1 }],
        ['video with numeric loop', { type: 'video', src: 'video.mp4', loop: 3 }, { type: 'video', src: 'video.mp4', loop: 3 }],
        ['video with muted true', { type: 'video', src: 'video.mp4', muted: true }, { type: 'video', src: 'video.mp4', muted: true }],
        ['video with muted false', { type: 'video', src: 'video.mp4', muted: false }, { type: 'video', src: 'video.mp4', muted: false }],
        ['video with empty src', { type: 'video', src: '' }, { type: 'video', src: '' }],
        ['video with null src', { type: 'video', src: null }, { type: 'video', src: null }]
      ])('should process %s', (_, input, expected) => {
        const result = processVideoElement(input);
        expect(result).toEqual(expected);
      });

      it.each([
        ['string muted value', { type: 'video', src: 'video.mp4', muted: 'yes' }, { muted: true }],
        ['numeric muted value', { type: 'video', src: 'video.mp4', muted: 1 }, { muted: true }],
        ['zero muted value', { type: 'video', src: 'video.mp4', muted: 0 }, { muted: false }],
        ['empty string muted', { type: 'video', src: 'video.mp4', muted: '' }, { muted: false }]
      ])('should handle muted type coercion: %s', (_, input, expectedSubset) => {
        const result = processVideoElement(input);
        expect(result).toMatchObject(expectedSubset);
      });
    });

    describe('visual properties integration', () => {
      it.each([
        ['position properties', { type: 'video', src: 'video.mp4', position: 'center-center', x: 0, y: 0 }, { position: 'center-center', x: 0, y: 0 }],
        ['dimension properties', { type: 'video', src: 'video.mp4', width: 1280, height: 720 }, { width: 1280, height: 720 }],
        ['string dimensions', { type: 'video', src: 'video.mp4', width: '1920', height: '1080' }, { width: 1920, height: 1080 }],
        ['resize mode', { type: 'video', src: 'video.mp4', resize: 'cover' }, { resize: 'cover' }],
        ['negative dimensions clamped', { type: 'video', src: 'video.mp4', width: -500, height: -300 }, { width: -1, height: -1 }],
        ['zero dimensions', { type: 'video', src: 'video.mp4', width: 0, height: 0 }, { width: 0, height: 0 }],
        ['decimal positions', { type: 'video', src: 'video.mp4', x: 100.5, y: 200.75 }, { x: 100.5, y: 200.75 }],
        ['custom position', { type: 'video', src: 'video.mp4', position: 'custom', x: 150, y: 250 }, { position: 'custom', x: 150, y: 250 }]
      ])('should handle %s', (_, input, expectedSubset) => {
        const result = processVideoElement(input);
        expect(result).toMatchObject(expectedSubset);
      });
    });

    describe('visual effects integration', () => {
      it('should handle crop object', () => {
        const input = { type: 'video', src: 'crop.mp4', crop: { width: 800, height: 600, x: 100, y: 50 } };
        const result = processVideoElement(input);
        expect(result).toMatchObject({ crop: { width: 800, height: 600, x: 100, y: 50 } });
      });

      it('should handle rotation object', () => {
        const input = { type: 'video', src: 'rotate.mp4', rotate: { angle: 15, speed: 1 } };
        const result = processVideoElement(input);
        expect(result).toMatchObject({ rotate: { angle: 15, speed: 1 } });
      });

      it('should handle pan direction with camelCase conversion', () => {
        const input = { type: 'video', src: 'pan.mp4', pan: 'bottom-left', panDistance: 0.3 };
        const result = processVideoElement(input);
        expect(result).toMatchObject({ pan: 'bottom-left', 'pan-distance': 0.3 });
        expect(result).not.toHaveProperty('panDistance');
      });

      it('should handle zoom levels', () => {
        const positiveInput = { type: 'video', src: 'zoom.mp4', zoom: 2 };
        const positiveResult = processVideoElement(positiveInput);
        expect(positiveResult).toMatchObject({ zoom: 2 });

        const negativeInput = { type: 'video', src: 'zoom.mp4', zoom: -1 };
        const negativeResult = processVideoElement(negativeInput);
        expect(negativeResult).toMatchObject({ zoom: -1 });
      });

      it('should handle flip properties with camelCase conversion', () => {
        const bothInput = { type: 'video', src: 'flip.mp4', flipHorizontal: true, flipVertical: true };
        const bothResult = processVideoElement(bothInput);
        expect(bothResult).toMatchObject({ 'flip-horizontal': true, 'flip-vertical': true });
        expect(bothResult).not.toHaveProperty('flipHorizontal');
        expect(bothResult).not.toHaveProperty('flipVertical');

        const mixedInput = { type: 'video', src: 'flip.mp4', flipHorizontal: false, flipVertical: true };
        const mixedResult = processVideoElement(mixedInput);
        expect(mixedResult).toMatchObject({ 'flip-horizontal': false, 'flip-vertical': true });
        expect(mixedResult).not.toHaveProperty('flipHorizontal');
        expect(mixedResult).not.toHaveProperty('flipVertical');
      });

      it('should handle mask URL', () => {
        const input = { type: 'video', src: 'masked.mp4', mask: 'overlay-mask.png' };
        const result = processVideoElement(input);
        expect(result).toMatchObject({ mask: 'overlay-mask.png' });
      });

      it('should handle chroma key with camelCase conversion', () => {
        const input = { type: 'video', src: 'bluescreen.mp4', chromaKey: { color: '#0000FF', tolerance: 40 } };
        const result = processVideoElement(input);
        expect(result).toMatchObject({ 'chroma-key': { color: '#0000FF', tolerance: 40 } });
        expect(result).not.toHaveProperty('chromaKey');
      });

      it('should handle color correction', () => {
        const input = { type: 'video', src: 'correct.mp4', correction: { brightness: 0.2, contrast: 1.3, gamma: 1.1, saturation: 1.2 } };
        const result = processVideoElement(input);
        expect(result).toMatchObject({ correction: { brightness: 0.2, contrast: 1.3, gamma: 1.1, saturation: 1.2 } });
      });

      it('should handle pan crop with camelCase conversion', () => {
        const disabledInput = { type: 'video', src: 'pan.mp4', pan: 'top', panCrop: false };
        const disabledResult = processVideoElement(disabledInput);
        expect(disabledResult).toMatchObject({ pan: 'top', 'pan-crop': false });
        expect(disabledResult).not.toHaveProperty('panCrop');

        const enabledInput = { type: 'video', src: 'pan.mp4', pan: 'left', panCrop: true };
        const enabledResult = processVideoElement(enabledInput);
        expect(enabledResult).toMatchObject({ pan: 'left', 'pan-crop': true });
        expect(enabledResult).not.toHaveProperty('panCrop');
      });
    });

    describe('common properties integration', () => {
      it.each([
        ['timing properties', { type: 'video', src: 'timed.mp4', start: 2, duration: 25 }, { start: 2, duration: 25 }],
        ['string timing values', { type: 'video', src: 'timed.mp4', start: '3.5', duration: '30.2' }, { start: 3.5, duration: 30.2 }],
        ['special duration -1', { type: 'video', src: 'auto.mp4', duration: -1 }, { duration: -1 }],
        ['special duration -2', { type: 'video', src: 'match.mp4', duration: -2 }, { duration: -2 }],
        ['negative start clamped to 0', { type: 'video', src: 'early.mp4', start: -5 }, { start: 0 }],
        ['zero duration', { type: 'video', src: 'instant.mp4', duration: 0 }, { duration: 0 }],
        ['decimal timing', { type: 'video', src: 'precise.mp4', start: 1.75, duration: 28.33 }, { start: 1.75, duration: 28.33 }],
        ['large duration', { type: 'video', src: 'long.mp4', duration: 3600 }, { duration: 3600 }]
      ])('should handle %s', (_, input, expectedSubset) => {
        const result = processVideoElement(input);
        expect(result).toMatchObject(expectedSubset);
      });
    });

    describe('camelCase to kebab-case conversion', () => {
      it('should convert fade properties', () => {
        const input = { type: 'video', src: 'fade.mp4', fadeIn: 2.5, fadeOut: 3.5 };
        const result = processVideoElement(input);
        expect(result).toMatchObject({ 'fade-in': 2.5, 'fade-out': 3.5 });
        expect(result).not.toHaveProperty('fadeIn');
        expect(result).not.toHaveProperty('fadeOut');
      });

      it('should convert z-index', () => {
        const input = { type: 'video', src: 'layer.mp4', zIndex: 25 };
        const result = processVideoElement(input);
        expect(result).toMatchObject({ 'z-index': 25 });
        expect(result).not.toHaveProperty('zIndex');
      });

      it('should convert extra-time', () => {
        const input = { type: 'video', src: 'extend.mp4', extraTime: 2 };
        const result = processVideoElement(input);
        expect(result).toMatchObject({ 'extra-time': 2 });
        expect(result).not.toHaveProperty('extraTime');
      });

      it('should convert pan distance', () => {
        const input = { type: 'video', src: 'pan.mp4', panDistance: 0.4 };
        const result = processVideoElement(input);
        expect(result).toMatchObject({ 'pan-distance': 0.4 });
        expect(result).not.toHaveProperty('panDistance');
      });

      it('should convert pan crop', () => {
        const input = { type: 'video', src: 'pancrop.mp4', panCrop: false };
        const result = processVideoElement(input);
        expect(result).toMatchObject({ 'pan-crop': false });
        expect(result).not.toHaveProperty('panCrop');
      });

      it('should convert flip horizontal', () => {
        const input = { type: 'video', src: 'flip.mp4', flipHorizontal: true };
        const result = processVideoElement(input);
        expect(result).toMatchObject({ 'flip-horizontal': true });
        expect(result).not.toHaveProperty('flipHorizontal');
      });

      it('should convert flip vertical', () => {
        const input = { type: 'video', src: 'flip.mp4', flipVertical: false };
        const result = processVideoElement(input);
        expect(result).toMatchObject({ 'flip-vertical': false });
        expect(result).not.toHaveProperty('flipVertical');
      });

      it('should convert chroma key', () => {
        const input = { type: 'video', src: 'green.mp4', chromaKey: { color: '#00FF00', tolerance: 25 } };
        const result = processVideoElement(input);
        expect(result).toMatchObject({ 'chroma-key': { color: '#00FF00', tolerance: 25 } });
        expect(result).not.toHaveProperty('chromaKey');
      });

      it('should convert combined camelCase properties', () => {
        const input = { type: 'video', src: 'combined.mp4', fadeIn: 1, zIndex: 5, panDistance: 0.1, flipHorizontal: true };
        const result = processVideoElement(input);
        
        expect(result).toMatchObject({ 'fade-in': 1, 'z-index': 5, 'pan-distance': 0.1, 'flip-horizontal': true });
        expect(result).not.toHaveProperty('fadeIn');
        expect(result).not.toHaveProperty('zIndex');
        expect(result).not.toHaveProperty('panDistance');
        expect(result).not.toHaveProperty('flipHorizontal');
      });
    });

    describe('comprehensive integration', () => {
      it('should handle complete video element with all supported properties', () => {
        const input = {
          type: 'video',
          src: 'https://cdn.example.com/complete-video.mp4',
          // Video-specific properties
          seek: 5.5,
          volume: 8.5,
          muted: false,
          loop: 2,
          // Visual properties
          position: 'center-center',
          x: 0,
          y: 0,
          width: 1920,
          height: 1080,
          resize: 'cover',
          // Effects
          crop: { width: 1800, height: 1000, x: 60, y: 40 },
          rotate: { angle: 2, speed: 0 },
          pan: 'right',
          panDistance: 0.08,
          panCrop: true,
          zoom: 1.05,
          flipHorizontal: false,
          flipVertical: false,
          mask: 'video-mask.png',
          chromaKey: { color: '#00FF00', tolerance: 35 },
          correction: { brightness: 0.05, contrast: 1.02, gamma: 1.0, saturation: 1.1 },
          // Common properties
          start: 0,
          duration: 45,
          fadeIn: 2,
          fadeOut: 1.5,
          zIndex: 1,
          extraTime: 0.5,
          // Meta properties
          id: 'main-video',
          comment: 'Primary video content with full processing',
          cache: true
        };

        const result = processVideoElement(input);

        expect(result).toMatchObject({
          type: 'video',
          src: 'https://cdn.example.com/complete-video.mp4',
          seek: 5.5,
          volume: 8.5,
          muted: false,
          loop: 2,
          position: 'center-center',
          x: 0,
          y: 0,
          width: 1920,
          height: 1080,
          resize: 'cover',
          crop: { width: 1800, height: 1000, x: 60, y: 40 },
          rotate: { angle: 2, speed: 0 },
          pan: 'right',
          'pan-distance': 0.08,
          'pan-crop': true,
          zoom: 1.05,
          'flip-horizontal': false,
          'flip-vertical': false,
          mask: 'video-mask.png',
          'chroma-key': { color: '#00FF00', tolerance: 35 },
          correction: { brightness: 0.05, contrast: 1.02, gamma: 1.0, saturation: 1.1 },
          start: 0,
          duration: 45,
          'fade-in': 2,
          'fade-out': 1.5,
          'z-index': 1,
          'extra-time': 0.5,
          id: 'main-video',
          comment: 'Primary video content with full processing',
          cache: true
        });

        // Verify camelCase properties removed
        const camelCaseProps = ['fadeIn', 'fadeOut', 'zIndex', 'extraTime', 'panDistance', 'panCrop', 'flipHorizontal', 'flipVertical', 'chromaKey'];
        camelCaseProps.forEach(prop => {
          expect(result).not.toHaveProperty(prop);
        });
      });

      it('should handle minimal video element', () => {
        const input = { type: 'video' };
        const result = processVideoElement(input);
        
        expect(result).toEqual({ type: 'video' });
      });

      it('should handle video element with only src', () => {
        const input = { type: 'video', src: 'simple.mp4' };
        const result = processVideoElement(input);
        
        expect(result).toEqual({ 
          type: 'video',
          src: 'simple.mp4'
        });
      });

      it('should handle video element with audio properties only', () => {
        const input = { 
          type: 'video',
          src: 'audio-focused.mp4',
          seek: 10,
          volume: 5,
          muted: false,
          loop: true
        };
        const result = processVideoElement(input);
        
        expect(result).toEqual({ 
          type: 'video',
          src: 'audio-focused.mp4',
          seek: 10,
          volume: 5,
          muted: false,
          loop: -1
        });
      });

      it('should handle video element with visual properties only', () => {
        const input = { 
          type: 'video',
          src: 'visual-only.mp4',
          position: 'top-right',
          width: 640,
          height: 480,
          zoom: 1.5
        };
        const result = processVideoElement(input);
        
        expect(result).toEqual({ 
          type: 'video',
          src: 'visual-only.mp4',
          position: 'top-right',
          width: 640,
          height: 480,
          zoom: 1.5
        });
      });
    });

    describe('error handling and edge cases', () => {
      it.each([
        ['invalid volume string', { type: 'video', src: 'test.mp4', volume: 'loud' }, { volume: 1 }],
        ['NaN volume', { type: 'video', src: 'test.mp4', volume: NaN }, { volume: 1 }],
        ['invalid seek string', { type: 'video', src: 'test.mp4', seek: 'middle' }, { seek: 0 }],
        ['NaN seek', { type: 'video', src: 'test.mp4', seek: NaN }, { seek: 0 }],
        ['invalid duration string', { type: 'video', src: 'test.mp4', duration: 'entire' }, { duration: -1 }],
        ['NaN duration', { type: 'video', src: 'test.mp4', duration: NaN }, { duration: -1 }],
        ['invalid start string', { type: 'video', src: 'test.mp4', start: 'now' }, { start: 0 }],
        ['NaN start', { type: 'video', src: 'test.mp4', start: NaN }, { start: 0 }],
        ['null src preserved', { type: 'video', src: null }, { src: null }],
        ['empty string src', { type: 'video', src: '' }, { src: '' }],
        ['undefined properties ignored', { type: 'video', src: 'test.mp4', volume: undefined, muted: undefined }, { src: 'test.mp4' }]
      ])('should handle invalid values gracefully: %s', (_, input, expectedSubset) => {
        const result = processVideoElement(input);
        expect(result).toMatchObject(expectedSubset);
      });

      it('should preserve unknown video properties', () => {
        const input = {
          type: 'video',
          src: 'custom.mp4',
          customVideoProperty: 'custom-value',
          experimentalFeature: true,
          metadata: { format: 'MP4', resolution: '1920x1080', duration: '00:05:30', bitrate: '5000kbps' }
        };

        const result = processVideoElement(input);
        
        expect(result.customVideoProperty).toBe('custom-value');
        expect(result.experimentalFeature).toBe(true);
        expect(result.metadata).toEqual({ format: 'MP4', resolution: '1920x1080', duration: '00:05:30', bitrate: '5000kbps' });
      });

      it('should handle edge case numeric values', () => {
        const input = {
          type: 'video',
          src: 'edge-case.mp4',
          volume: 0,          // Minimum valid
          seek: 999.99,       // Large valid number
          loop: -1,           // Infinite loop
          start: 0.001,       // Very small start
          duration: 7200,     // 2 hour duration
          zoom: -10,          // Minimum zoom
          panDistance: 0.01   // Minimum pan distance
        };

        const result = processVideoElement(input);
        
        expect(result.volume).toBe(0);
        expect(result.seek).toBe(999.99);
        expect(result.loop).toBe(-1);
        expect(result.start).toBe(0.001);
        expect(result.duration).toBe(7200);
        expect(result.zoom).toBe(-10);
        expect(result['pan-distance']).toBe(0.01);
      });

      it('should handle complex visual effects combinations', () => {
        const input = {
          type: 'video',
          src: 'complex-effects.mp4',
          crop: null,                    // null crop
          rotate: { angle: 0 },          // zero rotation
          pan: '',                       // empty pan
          chromaKey: { color: '#FF0000', tolerance: 0 }, // zero tolerance
          correction: { brightness: -1, contrast: -1000, gamma: 0.1, saturation: 0 } // boundary values
        };

        const result = processVideoElement(input);
        
        expect(result.crop).toBe(null);
        expect(result.rotate).toEqual({ angle: 0 });
        expect(result.pan).toBe('');
        expect(result['chroma-key']).toEqual({ color: '#FF0000', tolerance: 0 });
        expect(result.correction).toEqual({ brightness: -1, contrast: -1000, gamma: 0.1, saturation: 0 });
      });
    });

    describe('loop property handling', () => {
      it.each([
        ['boolean true converts to -1', { type: 'video', src: 'test.mp4', loop: true }, { loop: -1 }],
        ['boolean false converts to 1', { type: 'video', src: 'test.mp4', loop: false }, { loop: 1 }],
        ['numeric value preserved', { type: 'video', src: 'test.mp4', loop: 5 }, { loop: 5 }],
        ['negative numeric preserved', { type: 'video', src: 'test.mp4', loop: -3 }, { loop: -3 }],
        ['zero preserved', { type: 'video', src: 'test.mp4', loop: 0 }, { loop: 0 }],
        ['large number preserved', { type: 'video', src: 'test.mp4', loop: 100 }, { loop: 100 }]
      ])('should handle %s', (_, input, expectedSubset) => {
        const result = processVideoElement(input);
        expect(result).toMatchObject(expectedSubset);
      });
    });

    describe('volume clamping validation', () => {
      it.each([
        ['volume at minimum boundary', { type: 'video', src: 'test.mp4', volume: 0 }, { volume: 0 }],
        ['volume at maximum boundary', { type: 'video', src: 'test.mp4', volume: 10 }, { volume: 10 }],
        ['volume above maximum', { type: 'video', src: 'test.mp4', volume: 25 }, { volume: 10 }],
        ['volume below minimum', { type: 'video', src: 'test.mp4', volume: -10 }, { volume: 0 }],
        ['volume with decimals', { type: 'video', src: 'test.mp4', volume: 3.7 }, { volume: 3.7 }],
        ['volume string parsing', { type: 'video', src: 'test.mp4', volume: '8.5' }, { volume: 8.5 }]
      ])('should handle %s', (_, input, expectedSubset) => {
        const result = processVideoElement(input);
        expect(result).toMatchObject(expectedSubset);
      });
    });

    describe('seek clamping validation', () => {
      it.each([
        ['seek at minimum boundary', { type: 'video', src: 'test.mp4', seek: 0 }, { seek: 0 }],
        ['seek above minimum', { type: 'video', src: 'test.mp4', seek: 30 }, { seek: 30 }],
        ['seek below minimum clamped', { type: 'video', src: 'test.mp4', seek: -15 }, { seek: 0 }],
        ['seek with decimals', { type: 'video', src: 'test.mp4', seek: 12.5 }, { seek: 12.5 }],
        ['seek string parsing', { type: 'video', src: 'test.mp4', seek: '45.75' }, { seek: 45.75 }],
        ['large seek value', { type: 'video', src: 'test.mp4', seek: 3600 }, { seek: 3600 }]
      ])('should handle %s', (_, input, expectedSubset) => {
        const result = processVideoElement(input);
        expect(result).toMatchObject(expectedSubset);
      });
    });

    describe('pan direction and distance combinations', () => {
      it.each([
        ['pan left with distance', { type: 'video', src: 'pan.mp4', pan: 'left', panDistance: 0.2 }, { pan: 'left', 'pan-distance': 0.2 }],
        ['pan right with crop', { type: 'video', src: 'pan.mp4', pan: 'right', panCrop: false }, { pan: 'right', 'pan-crop': false }],
        ['pan top-left diagonal', { type: 'video', src: 'pan.mp4', pan: 'top-left', panDistance: 0.15 }, { pan: 'top-left', 'pan-distance': 0.15 }],
        ['pan bottom-right with crop enabled', { type: 'video', src: 'pan.mp4', pan: 'bottom-right', panCrop: true }, { pan: 'bottom-right', 'pan-crop': true }],
        ['pan with all options', { type: 'video', src: 'pan.mp4', pan: 'top', panDistance: 0.3, panCrop: false }, { pan: 'top', 'pan-distance': 0.3, 'pan-crop': false }]
      ])('should handle %s', (_, input, expectedSubset) => {
        const result = processVideoElement(input);
        expect(result).toMatchObject(expectedSubset);
        expect(result).not.toHaveProperty('panDistance');
        expect(result).not.toHaveProperty('panCrop');
      });
    });
  });
});