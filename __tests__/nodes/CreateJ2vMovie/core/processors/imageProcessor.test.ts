// __tests__/nodes/CreateJ2vMovie/core/processors/imageProcessor.test.ts

import { processImageElement } from '../../../../../nodes/CreateJ2vMovie/core/processors/imageProcessor';

describe('imageProcessor', () => {
  describe('processImageElement', () => {

    describe('image-specific properties', () => {
      it.each([
        ['basic image with src', { type: 'image', src: 'image.jpg' }, { type: 'image', src: 'image.jpg' }],
        ['image without src', { type: 'image' }, { type: 'image' }],
        ['image with URL src', { type: 'image', src: 'https://example.com/photo.png' }, { type: 'image', src: 'https://example.com/photo.png' }],
        ['image with relative path', { type: 'image', src: './assets/logo.svg' }, { type: 'image', src: './assets/logo.svg' }],
        ['image with empty src', { type: 'image', src: '' }, { type: 'image', src: '' }],
        ['image with null src', { type: 'image', src: null }, { type: 'image', src: null }]
      ])('should process %s', (_, input, expected) => {
        const result = processImageElement(input);
        expect(result).toEqual(expected);
      });

      it('should handle complex AI generation settings', () => {
        const input = {
          type: 'image',
          prompt: 'A photorealistic portrait of a woman in Renaissance clothing, oil painting style, dramatic lighting',
          model: 'flux-pro',
          aspectRatio: 'vertical',
          connection: 'premium-ai-service',
          modelSettings: {
            steps: 50,
            guidance: 7.5,
            seed: 12345,
            negative_prompt: 'blurry, low quality, distorted'
          }
        };

        const result = processImageElement(input);

        expect(result).toEqual({
          type: 'image',
          prompt: 'A photorealistic portrait of a woman in Renaissance clothing, oil painting style, dramatic lighting',
          model: 'flux-pro',
          'aspect-ratio': 'vertical',
          connection: 'premium-ai-service',
          'model-settings': {
            steps: 50,
            guidance: 7.5,
            seed: 12345,
            negative_prompt: 'blurry, low quality, distorted'
          }
        });

        expect(result).not.toHaveProperty('aspectRatio');
        expect(result).not.toHaveProperty('modelSettings');
      });

      it('should handle both src and AI properties together', () => {
        const input = {
          type: 'image',
          src: 'fallback.jpg',
          prompt: 'Generate if src fails',
          model: 'flux-schnell',
          aspectRatio: 'horizontal'
        };

        const result = processImageElement(input);

        expect(result).toMatchObject({
          type: 'image',
          src: 'fallback.jpg',
          prompt: 'Generate if src fails',
          model: 'flux-schnell',
          'aspect-ratio': 'horizontal'
        });
      });
    });

    describe('visual properties integration', () => {
      it.each([
        ['position properties', { type: 'image', src: 'test.jpg', position: 'center-left', x: 50, y: 100 }, { position: 'center-left', x: 50, y: 100 }],
        ['dimension properties', { type: 'image', src: 'test.jpg', width: 800, height: 600 }, { width: 800, height: 600 }],
        ['string dimensions', { type: 'image', src: 'test.jpg', width: '1024', height: '768' }, { width: 1024, height: 768 }],
        ['resize mode', { type: 'image', src: 'test.jpg', resize: 'cover' }, { resize: 'cover' }],
        ['negative dimensions clamped', { type: 'image', src: 'test.jpg', width: -300, height: -200 }, { width: -1, height: -1 }],
        ['zero dimensions', { type: 'image', src: 'test.jpg', width: 0, height: 0 }, { width: 0, height: 0 }],
        ['decimal positions', { type: 'image', src: 'test.jpg', x: 123.45, y: 67.89 }, { x: 123.45, y: 67.89 }]
      ])('should handle %s', (_, input, expectedSubset) => {
        const result = processImageElement(input);
        expect(result).toMatchObject(expectedSubset);
      });
    });

    describe('visual effects integration', () => {
      it('should handle crop object', () => {
        const input = { type: 'image', src: 'crop.jpg', crop: { width: 400, height: 300, x: 100, y: 50 } };
        const result = processImageElement(input);
        expect(result).toMatchObject({ crop: { width: 400, height: 300, x: 100, y: 50 } });
      });

      it('should handle rotation object', () => {
        const input = { type: 'image', src: 'rotate.jpg', rotate: { angle: 45, speed: 0.5 } };
        const result = processImageElement(input);
        expect(result).toMatchObject({ rotate: { angle: 45, speed: 0.5 } });
      });

      it('should handle pan properties with camelCase conversion', () => {
        const input = { type: 'image', src: 'pan.jpg', pan: 'top-right', panDistance: 0.15 };
        const result = processImageElement(input);
        expect(result).toMatchObject({ pan: 'top-right', 'pan-distance': 0.15 });
        expect(result).not.toHaveProperty('panDistance');
      });

      it('should handle zoom level', () => {
        const input = { type: 'image', src: 'zoom.jpg', zoom: 3 };
        const result = processImageElement(input);
        expect(result).toMatchObject({ zoom: 3 });
      });

      it('should handle flip properties with camelCase conversion', () => {
        const input = { type: 'image', src: 'flip.jpg', flipHorizontal: true, flipVertical: false };
        const result = processImageElement(input);
        expect(result).toMatchObject({ 'flip-horizontal': true, 'flip-vertical': false });
        expect(result).not.toHaveProperty('flipHorizontal');
        expect(result).not.toHaveProperty('flipVertical');
      });

      it('should handle mask URL', () => {
        const input = { type: 'image', src: 'masked.jpg', mask: 'mask-shape.png' };
        const result = processImageElement(input);
        expect(result).toMatchObject({ mask: 'mask-shape.png' });
      });

      it('should handle chroma key with camelCase conversion', () => {
        const input = { type: 'image', src: 'greenscreen.jpg', chromaKey: { color: '#00FF00', tolerance: 30 } };
        const result = processImageElement(input);
        expect(result).toMatchObject({ 'chroma-key': { color: '#00FF00', tolerance: 30 } });
        expect(result).not.toHaveProperty('chromaKey');
      });

      it('should handle color correction', () => {
        const input = { type: 'image', src: 'correct.jpg', correction: { brightness: 0.3, contrast: 1.1, saturation: 1.5 } };
        const result = processImageElement(input);
        expect(result).toMatchObject({ correction: { brightness: 0.3, contrast: 1.1, saturation: 1.5 } });
      });
    });

    describe('common properties integration', () => {
      it.each([
        ['timing properties', { type: 'image', src: 'timed.jpg', start: 4, duration: 8 }, { start: 4, duration: 8 }],
        ['string timing values', { type: 'image', src: 'timed.jpg', start: '2.2', duration: '15.8' }, { start: 2.2, duration: 15.8 }],
        ['special duration -1', { type: 'image', src: 'auto.jpg', duration: -1 }, { duration: -1 }],
        ['special duration -2', { type: 'image', src: 'match.jpg', duration: -2 }, { duration: -2 }],
        ['negative start clamped to 0', { type: 'image', src: 'early.jpg', start: -4 }, { start: 0 }],
        ['zero duration', { type: 'image', src: 'instant.jpg', duration: 0 }, { duration: 0 }],
        ['decimal timing', { type: 'image', src: 'precise.jpg', start: 1.33, duration: 9.67 }, { start: 1.33, duration: 9.67 }]
      ])('should handle %s', (_, input, expectedSubset) => {
        const result = processImageElement(input);
        expect(result).toMatchObject(expectedSubset);
      });
    });

    describe('camelCase to kebab-case conversion', () => {
      it.each([
        ['fade properties', { type: 'image', src: 'fade.jpg', fadeIn: 1.2, fadeOut: 2.8 }, { 'fade-in': 1.2, 'fade-out': 2.8 }],
        ['z-index', { type: 'image', src: 'layer.jpg', zIndex: 8 }, { 'z-index': 8 }],
        ['extra time', { type: 'image', src: 'extend.jpg', extraTime: 1.5 }, { 'extra-time': 1.5 }],
        ['pan distance', { type: 'image', src: 'pan.jpg', panDistance: 0.25 }, { 'pan-distance': 0.25 }],
        ['pan crop', { type: 'image', src: 'pancrop.jpg', panCrop: false }, { 'pan-crop': false }],
        ['combined camelCase properties', { type: 'image', src: 'combined.jpg', fadeIn: 1, zIndex: 5, panDistance: 0.1 }, { 'fade-in': 1, 'z-index': 5, 'pan-distance': 0.1 }]
      ])('should convert %s', (_, input, expectedSubset) => {
        const result = processImageElement(input);
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
      it('should handle complete image element with src and all supported properties', () => {
        const input = {
          type: 'image',
          src: 'https://example.com/hero-image.jpg',
          // Visual properties
          position: 'center-center',
          x: 0,
          y: 0,
          width: 1920,
          height: 1080,
          resize: 'cover',
          // Effects
          crop: { width: 1800, height: 1000, x: 60, y: 40 },
          rotate: { angle: 5, speed: 0 },
          pan: 'left',
          panDistance: 0.05,
          zoom: 1.1,
          flipHorizontal: false,
          flipVertical: false,
          correction: { brightness: 0.1, contrast: 1.05, saturation: 1.1 },
          // Common properties
          start: 0,
          duration: 30,
          fadeIn: 2,
          fadeOut: 1,
          zIndex: 1,
          extraTime: 0,
          // Meta properties
          id: 'hero-background',
          comment: 'Main background image with subtle effects',
          cache: true
        };

        const result = processImageElement(input);

        expect(result).toMatchObject({
          type: 'image',
          src: 'https://example.com/hero-image.jpg',
          position: 'center-center',
          x: 0,
          y: 0,
          width: 1920,
          height: 1080,
          resize: 'cover',
          crop: { width: 1800, height: 1000, x: 60, y: 40 },
          rotate: { angle: 5, speed: 0 },
          pan: 'left',
          'pan-distance': 0.05,
          zoom: 1.1,
          'flip-horizontal': false,
          'flip-vertical': false,
          correction: { brightness: 0.1, contrast: 1.05, saturation: 1.1 },
          start: 0,
          duration: 30,
          'fade-in': 2,
          'fade-out': 1,
          'z-index': 1,
          'extra-time': 0,
          id: 'hero-background',
          comment: 'Main background image with subtle effects',
          cache: true
        });

        // Verify camelCase properties removed
        expect(result).not.toHaveProperty('fadeIn');
        expect(result).not.toHaveProperty('fadeOut');
        expect(result).not.toHaveProperty('zIndex');
        expect(result).not.toHaveProperty('extraTime');
        expect(result).not.toHaveProperty('panDistance');
        expect(result).not.toHaveProperty('flipHorizontal');
        expect(result).not.toHaveProperty('flipVertical');
      });

      it('should handle complete AI-generated image with all properties', () => {
        const input = {
          type: 'image',
          prompt: 'A majestic mountain landscape at golden hour, photorealistic, highly detailed, 4K quality',
          model: 'flux-pro',
          aspectRatio: 'horizontal',
          connection: 'flux-premium',
          modelSettings: {
            steps: 30,
            guidance_scale: 7.0,
            seed: 42,
            scheduler: 'DPM++ 2M Karras'
          },
          // Visual properties
          position: 'center-center',
          width: 1280,
          height: 720,
          // Common properties
          duration: 25,
          fadeIn: 3,
          id: 'ai-landscape',
          comment: 'AI-generated landscape background'
        };

        const result = processImageElement(input);

        expect(result).toMatchObject({
          type: 'image',
          prompt: 'A majestic mountain landscape at golden hour, photorealistic, highly detailed, 4K quality',
          model: 'flux-pro',
          'aspect-ratio': 'horizontal',
          connection: 'flux-premium',
          'model-settings': {
            steps: 30,
            guidance_scale: 7.0,
            seed: 42,
            scheduler: 'DPM++ 2M Karras'
          },
          position: 'center-center',
          width: 1280,
          height: 720,
          duration: 25,
          'fade-in': 3,
          id: 'ai-landscape',
          comment: 'AI-generated landscape background'
        });

        expect(result).not.toHaveProperty('aspectRatio');
        expect(result).not.toHaveProperty('modelSettings');
        expect(result).not.toHaveProperty('fadeIn');
      });

      it('should handle minimal image element', () => {
        const input = { type: 'image' };
        const result = processImageElement(input);

        expect(result).toEqual({ type: 'image' });
      });

      it('should handle image element with only src', () => {
        const input = { type: 'image', src: 'simple.png' };
        const result = processImageElement(input);

        expect(result).toEqual({
          type: 'image',
          src: 'simple.png'
        });
      });
    });

    describe('error handling and edge cases', () => {
      it.each([
        ['invalid duration string', { type: 'image', src: 'test.jpg', duration: 'permanent' }, { duration: -1 }],
        ['NaN duration', { type: 'image', src: 'test.jpg', duration: NaN }, { duration: -1 }],
        ['invalid start string', { type: 'image', src: 'test.jpg', start: 'immediately' }, { start: 0 }],
        ['NaN start', { type: 'image', src: 'test.jpg', start: NaN }, { start: 0 }],
        ['null src preserved', { type: 'image', src: null }, { src: null }],
        ['empty string src', { type: 'image', src: '' }, { src: '' }],
        ['undefined properties ignored', { type: 'image', src: 'test.jpg', width: undefined, height: undefined }, { src: 'test.jpg' }]
      ])('should handle invalid values gracefully: %s', (_, input, expectedSubset) => {
        const result = processImageElement(input);
        expect(result).toMatchObject(expectedSubset);
      });

      it('should preserve unknown image properties', () => {
        const input = {
          type: 'image',
          src: 'custom.jpg',
          customImageProperty: 'custom-value',
          experimentalFeature: true,
          metadata: { format: 'JPEG', size: '2MB', author: 'photographer' }
        };

        const result = processImageElement(input);

        expect(result.customImageProperty).toBe('custom-value');
        expect(result.experimentalFeature).toBe(true);
        expect(result.metadata).toEqual({ format: 'JPEG', size: '2MB', author: 'photographer' });
      });

      it('should handle edge case AI generation values', () => {
        const input = {
          type: 'image',
          prompt: '',                    // Empty prompt
          model: 'flux-schnell',
          aspectRatio: 'squared',
          modelSettings: null,          // Null model settings
          connection: ''                // Empty connection
        };

        const result = processImageElement(input);

        expect(result.prompt).toBe('');
        expect(result.model).toBe('flux-schnell');
        expect(result['aspect-ratio']).toBe('squared');
        expect(result['model-settings']).toBe(null);
        expect(result.connection).toBe('');
        expect(result).not.toHaveProperty('aspectRatio');
        expect(result).not.toHaveProperty('modelSettings');
      });

      it('should handle mixed src and AI properties with undefined values', () => {
        const input = {
          type: 'image',
          src: 'backup.jpg',
          prompt: undefined,
          model: 'flux-pro',
          aspectRatio: undefined,
          modelSettings: { quality: 'high' }
        };

        const result = processImageElement(input);

        expect(result.src).toBe('backup.jpg');
        expect(result).not.toHaveProperty('prompt');
        expect(result.model).toBe('flux-pro');
        expect(result).not.toHaveProperty('aspect-ratio');
        expect(result['model-settings']).toEqual({ quality: 'high' });
        expect(result).not.toHaveProperty('aspectRatio');
        expect(result).not.toHaveProperty('modelSettings');
      });
    });

    describe('AI model and aspect ratio combinations', () => {
      it.each([
        ['flux-pro horizontal', { type: 'image', prompt: 'Test', model: 'flux-pro', aspectRatio: 'horizontal' }, { model: 'flux-pro', 'aspect-ratio': 'horizontal' }],
        ['flux-pro vertical', { type: 'image', prompt: 'Test', model: 'flux-pro', aspectRatio: 'vertical' }, { model: 'flux-pro', 'aspect-ratio': 'vertical' }],
        ['flux-pro squared', { type: 'image', prompt: 'Test', model: 'flux-pro', aspectRatio: 'squared' }, { model: 'flux-pro', 'aspect-ratio': 'squared' }],
        ['flux-schnell horizontal', { type: 'image', prompt: 'Test', model: 'flux-schnell', aspectRatio: 'horizontal' }, { model: 'flux-schnell', 'aspect-ratio': 'horizontal' }],
        ['freepik-classic vertical', { type: 'image', prompt: 'Test', model: 'freepik-classic', aspectRatio: 'vertical' }, { model: 'freepik-classic', 'aspect-ratio': 'vertical' }]
      ])('should handle %s', (_, input, expectedSubset) => {
        const result = processImageElement(input);
        expect(result).toMatchObject(expectedSubset);
        expect(result).not.toHaveProperty('aspectRatio');
      });
    });
  });
});