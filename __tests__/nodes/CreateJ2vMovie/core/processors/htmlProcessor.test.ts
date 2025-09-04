// __tests__/nodes/CreateJ2vMovie/core/processors/htmlProcessor.test.ts

import { processHtmlElement } from '../../../../../nodes/CreateJ2vMovie/core/processors/htmlProcessor';

describe('htmlProcessor', () => {
  describe('processHtmlElement', () => {
    
    describe('HTML-specific properties', () => {
      it.each([
        ['basic HTML element', { type: 'html', html: '<div>Hello World</div>' }, { type: 'html', html: '<div>Hello World</div>' }],
        ['HTML with src URL', { type: 'html', src: 'https://example.com/page.html' }, { type: 'html', src: 'https://example.com/page.html' }],
        ['HTML with both html and src', { type: 'html', html: '<p>Test</p>', src: 'https://example.com' }, { type: 'html', html: '<p>Test</p>', src: 'https://example.com' }],
        ['HTML without content', { type: 'html' }, { type: 'html' }],
        ['HTML with empty html string', { type: 'html', html: '' }, { type: 'html', html: '' }],
        ['HTML with null src', { type: 'html', src: null }, { type: 'html', src: null }]
      ])('should process %s', (_, input, expected) => {
        const result = processHtmlElement(input);
        expect(result).toEqual(expected);
      });

      it.each([
        ['tailwindcss true', { type: 'html', html: '<div>Test</div>', tailwindcss: true }, { tailwindcss: true }],
        ['tailwindcss false', { type: 'html', html: '<div>Test</div>', tailwindcss: false }, { tailwindcss: false }],
        ['tailwindcss string true', { type: 'html', html: '<div>Test</div>', tailwindcss: 'true' }, { tailwindcss: true }],
        ['tailwindcss string false', { type: 'html', html: '<div>Test</div>', tailwindcss: 'false' }, { tailwindcss: true }],
        ['tailwindcss number 1', { type: 'html', html: '<div>Test</div>', tailwindcss: 1 }, { tailwindcss: true }],
        ['tailwindcss number 0', { type: 'html', html: '<div>Test</div>', tailwindcss: 0 }, { tailwindcss: false }]
      ])('should handle %s', (_, input, expectedSubset) => {
        const result = processHtmlElement(input);
        expect(result).toMatchObject(expectedSubset);
      });

      it.each([
        ['wait 3 seconds', { type: 'html', html: '<div>Test</div>', wait: 3 }, { wait: 3 }],
        ['wait 0 seconds', { type: 'html', html: '<div>Test</div>', wait: 0 }, { wait: 0 }],
        ['wait 5 seconds', { type: 'html', html: '<div>Test</div>', wait: 5 }, { wait: 5 }],
        ['wait decimal', { type: 'html', html: '<div>Test</div>', wait: 2.5 }, { wait: 2.5 }],
        ['wait string number', { type: 'html', html: '<div>Test</div>', wait: '1.5' }, { wait: 1.5 }],
        ['wait above maximum clamped', { type: 'html', html: '<div>Test</div>', wait: 10 }, { wait: 5 }],
        ['wait below minimum clamped', { type: 'html', html: '<div>Test</div>', wait: -2 }, { wait: 0 }],
        ['wait null returns default', { type: 'html', html: '<div>Test</div>', wait: null }, { wait: 2 }]
      ])('should handle %s', (_, input, expectedSubset) => {
        const result = processHtmlElement(input);
        expect(result).toMatchObject(expectedSubset);
      });

      it('should handle wait with invalid values', () => {
        const testCases = [
          [{ type: 'html', html: '<div>Test</div>', wait: 'invalid' }, 2],
          [{ type: 'html', html: '<div>Test</div>', wait: NaN }, 2],
          [{ type: 'html', html: '<div>Test</div>', wait: {} }, 2],
          [{ type: 'html', html: '<div>Test</div>', wait: [] }, 0]
        ];

        testCases.forEach(([input, expected]) => {
          const result = processHtmlElement(input);
          expect(result.wait).toBe(expected);
        });
      });
    });

    describe('visual properties integration', () => {
      it.each([
        ['positioning properties', { type: 'html', html: '<div>Test</div>', position: 'top-left', x: 10, y: 20 }, { position: 'top-left', x: 10, y: 20 }],
        ['size properties', { type: 'html', html: '<div>Test</div>', width: 640, height: 480 }, { width: 640, height: 480 }],
        ['resize mode', { type: 'html', html: '<div>Test</div>', resize: 'cover' }, { resize: 'cover' }],
        ['zoom property', { type: 'html', html: '<div>Test</div>', zoom: 1.5 }, { zoom: 1.5 }],
        ['mask property', { type: 'html', html: '<div>Test</div>', mask: 'mask.png' }, { mask: 'mask.png' }]
      ])('should handle %s', (_, input, expectedSubset) => {
        const result = processHtmlElement(input);
        expect(result).toMatchObject(expectedSubset);
      });

      it('should handle flip properties with camelCase conversion', () => {
        const input = { type: 'html', html: '<div>Test</div>', flipHorizontal: true, flipVertical: false };
        const result = processHtmlElement(input);
        
        expect(result).toMatchObject({ 'flip-horizontal': true, 'flip-vertical': false });
        expect(result).not.toHaveProperty('flipHorizontal');
        expect(result).not.toHaveProperty('flipVertical');
      });

      it('should handle pan properties with camelCase conversion', () => {
        const input = { type: 'html', html: '<div>Test</div>', pan: 'left', panDistance: 0.3, panCrop: true };
        const result = processHtmlElement(input);
        
        expect(result).toMatchObject({ pan: 'left', 'pan-distance': 0.3, 'pan-crop': true });
        expect(result).not.toHaveProperty('panDistance');
        expect(result).not.toHaveProperty('panCrop');
      });

      it('should handle chroma-key object with camelCase conversion', () => {
        const input = { type: 'html', html: '<div>Test</div>', chromaKey: { color: '#00FF00', tolerance: 25 } };
        const result = processHtmlElement(input);
        
        expect(result).toMatchObject({ 'chroma-key': { color: '#00FF00', tolerance: 25 } });
        expect(result).not.toHaveProperty('chromaKey');
      });
    });

    describe('common properties integration', () => {
      it.each([
        ['timing properties', { type: 'html', html: '<div>Test</div>', start: 5, duration: 10 }, { start: 5, duration: 10 }],
        ['string timing values', { type: 'html', html: '<div>Test</div>', start: '2.5', duration: '15.5' }, { start: 2.5, duration: 15.5 }],
        ['special duration -1', { type: 'html', html: '<div>Test</div>', duration: -1 }, { duration: -1 }],
        ['special duration -2', { type: 'html', html: '<div>Test</div>', duration: -2 }, { duration: -2 }],
        ['negative start clamped to 0', { type: 'html', html: '<div>Test</div>', start: -3 }, { start: 0 }],
        ['zero duration', { type: 'html', html: '<div>Test</div>', duration: 0 }, { duration: 0 }],
        ['decimal timing', { type: 'html', html: '<div>Test</div>', start: 1.25, duration: 8.75 }, { start: 1.25, duration: 8.75 }]
      ])('should handle %s', (_, input, expectedSubset) => {
        const result = processHtmlElement(input);
        expect(result).toMatchObject(expectedSubset);
      });
    });

    describe('camelCase to kebab-case conversion', () => {
      it.each([
        ['fade properties', { type: 'html', html: '<div>Test</div>', fadeIn: 1, fadeOut: 2 }, { 'fade-in': 1, 'fade-out': 2 }],
        ['z-index', { type: 'html', html: '<div>Test</div>', zIndex: 5 }, { 'z-index': 5 }],
        ['extra time', { type: 'html', html: '<div>Test</div>', extraTime: 1.5 }, { 'extra-time': 1.5 }],
        ['background color', { type: 'html', html: '<div>Test</div>', backgroundColor: '#FF0000' }, { 'background-color': '#FF0000' }]
      ])('should convert %s', (_, input, expectedSubset) => {
        const result = processHtmlElement(input);
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
      it('should handle complete HTML element with all supported properties', () => {
        const input = {
          type: 'html',
          html: '<div class="container"><h1>Dynamic Content</h1></div>',
          src: 'https://backup.example.com/page.html',
          tailwindcss: true,
          wait: 3.5,
          position: 'center-center',
          x: 100,
          y: 50,
          width: 800,
          height: 600,
          resize: 'contain',
          pan: 'top-right',
          panDistance: 0.25,
          panCrop: true,
          zoom: 1.2,
          flipHorizontal: false,
          flipVertical: true,
          mask: 'overlay-mask.png',
          chromaKey: { color: '#00FF00', tolerance: 30 },
          start: 2,
          duration: 12,
          fadeIn: 0.5,
          fadeOut: 1.0,
          zIndex: 8,
          extraTime: 0.3,
          id: 'html-element-1',
          comment: 'Interactive HTML content',
          cache: true
        };

        const result = processHtmlElement(input);

        expect(result).toMatchObject({
          type: 'html',
          html: '<div class="container"><h1>Dynamic Content</h1></div>',
          src: 'https://backup.example.com/page.html',
          tailwindcss: true,
          wait: 3.5,
          position: 'center-center',
          x: 100,
          y: 50,
          width: 800,
          height: 600,
          resize: 'contain',
          pan: 'top-right',
          'pan-distance': 0.25,
          'pan-crop': true,
          zoom: 1.2,
          'flip-horizontal': false,
          'flip-vertical': true,
          mask: 'overlay-mask.png',
          'chroma-key': { color: '#00FF00', tolerance: 30 },
          start: 2,
          duration: 12,
          'fade-in': 0.5,
          'fade-out': 1.0,
          'z-index': 8,
          'extra-time': 0.3,
          id: 'html-element-1',
          comment: 'Interactive HTML content',
          cache: true
        });

        // Verify camelCase properties removed
        expect(result).not.toHaveProperty('panDistance');
        expect(result).not.toHaveProperty('panCrop');
        expect(result).not.toHaveProperty('flipHorizontal');
        expect(result).not.toHaveProperty('flipVertical');
        expect(result).not.toHaveProperty('chromaKey');
        expect(result).not.toHaveProperty('fadeIn');
        expect(result).not.toHaveProperty('fadeOut');
        expect(result).not.toHaveProperty('zIndex');
        expect(result).not.toHaveProperty('extraTime');
      });

      it('should handle minimal HTML element', () => {
        const input = { type: 'html' };
        const result = processHtmlElement(input);
        
        expect(result).toEqual({ type: 'html' });
      });

      it('should handle HTML element with only content', () => {
        const input = { type: 'html', html: '<p>Simple HTML</p>' };
        const result = processHtmlElement(input);
        
        expect(result).toEqual({ 
          type: 'html',
          html: '<p>Simple HTML</p>'
        });
      });
    });

    describe('error handling and edge cases', () => {
      it.each([
        ['invalid duration string', { type: 'html', html: '<div>Test</div>', duration: 'forever' }, { duration: -1 }],
        ['NaN duration', { type: 'html', html: '<div>Test</div>', duration: NaN }, { duration: -1 }],
        ['invalid start string', { type: 'html', html: '<div>Test</div>', start: 'beginning' }, { start: 0 }],
        ['NaN start', { type: 'html', html: '<div>Test</div>', start: NaN }, { start: 0 }],
        ['null html preserved', { type: 'html', html: null }, { html: null }],
        ['empty string src', { type: 'html', src: '' }, { src: '' }]
      ])('should handle invalid values gracefully: %s', (_, input, expectedSubset) => {
        const result = processHtmlElement(input);
        expect(result).toMatchObject(expectedSubset);
      });

      it('should preserve unknown HTML properties', () => {
        const input = {
          type: 'html',
          html: '<div>Custom HTML</div>',
          customHtmlProperty: 'custom-value',
          experimentalFeature: true,
          metadata: { framework: 'React', version: '18.0.0' }
        };

        const result = processHtmlElement(input);
        
        expect(result.customHtmlProperty).toBe('custom-value');
        expect(result.experimentalFeature).toBe(true);
        expect(result.metadata).toEqual({ framework: 'React', version: '18.0.0' });
      });

      it('should handle edge case numeric values', () => {
        const input = {
          type: 'html',
          html: '<div>Edge case</div>',
          wait: 0,
          zoom: 999.99,
          start: 0.001,
          duration: 3600
        };

        const result = processHtmlElement(input);
        
        expect(result.wait).toBe(0);
        expect(result.zoom).toBe(999.99);
        expect(result.start).toBe(0.001);
        expect(result.duration).toBe(3600);
      });
    });
  });
});