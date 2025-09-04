// __tests__/nodes/CreateJ2vMovie/core/processors/componentProcessor.test.ts

import { processComponentElement } from '../../../../../nodes/CreateJ2vMovie/core/processors/componentProcessor';

describe('componentProcessor', () => {
  describe('processComponentElement', () => {
    
    describe('component-specific properties', () => {
      it.each([
        ['basic component element', { type: 'component', component: 'intro-template' }, { type: 'component', component: 'intro-template' }],
        ['component with settings object', { type: 'component', component: 'news-ticker', settings: { speed: 5 } }, { type: 'component', component: 'news-ticker', settings: { speed: 5 } }],
        ['component with complex settings', { type: 'component', component: 'chart-display', settings: { type: 'bar', data: [1, 2, 3], colors: ['#FF0000', '#00FF00'] } }, { type: 'component', component: 'chart-display', settings: { type: 'bar', data: [1, 2, 3], colors: ['#FF0000', '#00FF00'] } }],
        ['component with empty settings', { type: 'component', component: 'simple-layout', settings: {} }, { type: 'component', component: 'simple-layout', settings: {} }],
        ['component without settings', { type: 'component', component: 'default-template' }, { type: 'component', component: 'default-template' }],
        ['component with null settings', { type: 'component', component: 'basic-layout', settings: null }, { type: 'component', component: 'basic-layout', settings: null }]
      ])('should process %s', (_, input, expected) => {
        const result = processComponentElement(input);
        expect(result).toEqual(expected);
      });

      it('should preserve settings object structure completely', () => {
        const complexSettings = {
          title: 'Breaking News',
          subtitle: 'Latest Updates',
          animation: {
            type: 'slideIn',
            duration: 2.5,
            easing: 'ease-out'
          },
          styling: {
            backgroundColor: '#1a1a1a',
            textColor: '#ffffff',
            font: {
              family: 'Arial Black',
              size: 24,
              weight: 'bold'
            }
          },
          data: {
            items: [
              { id: 1, text: 'First item', priority: 'high' },
              { id: 2, text: 'Second item', priority: 'medium' }
            ]
          },
          flags: {
            autoplay: true,
            loop: false,
            showControls: true
          }
        };

        const input = {
          type: 'component',
          component: 'advanced-news-ticker',
          settings: complexSettings
        };

        const result = processComponentElement(input);
        
        expect(result.settings).toEqual(complexSettings);
        expect(result.settings).not.toBe(complexSettings); // Should be a copy, not reference
      });
    });

    describe('visual properties integration', () => {
      it.each([
        ['position properties', { type: 'component', component: 'overlay', position: 'top-right', x: 20, y: 10 }, { position: 'top-right', x: 20, y: 10 }],
        ['dimension properties', { type: 'component', component: 'sidebar', width: 300, height: 600 }, { width: 300, height: 600 }],
        ['string dimensions', { type: 'component', component: 'banner', width: '1200', height: '200' }, { width: 1200, height: 200 }],
        ['resize mode', { type: 'component', component: 'logo', resize: 'contain' }, { resize: 'contain' }],
        ['negative dimensions clamped', { type: 'component', component: 'element', width: -200, height: -100 }, { width: -1, height: -1 }],
        ['zero dimensions', { type: 'component', component: 'spacer', width: 0, height: 0 }, { width: 0, height: 0 }],
        ['decimal positions', { type: 'component', component: 'floater', x: 125.7, y: 88.3 }, { x: 125.7, y: 88.3 }]
      ])('should handle %s', (_, input, expectedSubset) => {
        const result = processComponentElement(input);
        expect(result).toMatchObject(expectedSubset);
      });
    });

    describe('common properties integration', () => {
      it.each([
        ['timing properties', { type: 'component', component: 'timed', start: 3, duration: 12 }, { start: 3, duration: 12 }],
        ['string timing values', { type: 'component', component: 'timed', start: '1.8', duration: '20.4' }, { start: 1.8, duration: 20.4 }],
        ['special duration -1', { type: 'component', component: 'auto-duration', duration: -1 }, { duration: -1 }],
        ['special duration -2', { type: 'component', component: 'match-container', duration: -2 }, { duration: -2 }],
        ['negative start clamped to 0', { type: 'component', component: 'early-start', start: -3 }, { start: 0 }],
        ['zero duration', { type: 'component', component: 'instant', duration: 0 }, { duration: 0 }],
        ['decimal timing', { type: 'component', component: 'precise', start: 2.75, duration: 11.25 }, { start: 2.75, duration: 11.25 }]
      ])('should handle %s', (_, input, expectedSubset) => {
        const result = processComponentElement(input);
        expect(result).toMatchObject(expectedSubset);
      });
    });

    describe('camelCase to kebab-case conversion', () => {
      it.each([
        ['fade properties', { type: 'component', component: 'fading', fadeIn: 1.5, fadeOut: 2.5 }, { 'fade-in': 1.5, 'fade-out': 2.5 }],
        ['z-index', { type: 'component', component: 'layered', zIndex: 15 }, { 'z-index': 15 }],
        ['extra time', { type: 'component', component: 'extended', extraTime: 3 }, { 'extra-time': 3 }],
        ['pan distance', { type: 'component', component: 'panning', panDistance: 0.4 }, { 'pan-distance': 0.4 }],
        ['pan crop', { type: 'component', component: 'pan-cropped', panCrop: true }, { 'pan-crop': true }]
      ])('should convert %s', (_, input, expectedSubset) => {
        const result = processComponentElement(input);
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
      it('should handle complete component element with all supported properties', () => {
        const input = {
          type: 'component',
          component: 'advanced-overlay-template',
          settings: {
            title: 'Live Stream Overlay',
            theme: 'dark',
            animation: { enter: 'fadeIn', exit: 'slideUp' },
            elements: {
              logo: { src: 'logo.png', position: 'top-left' },
              ticker: { text: 'Breaking News', speed: 2 }
            }
          },
          // Visual properties
          position: 'top-center',
          x: 0,
          y: 20,
          width: 1200,
          height: 300,
          resize: 'fit',
          zoom: 1.2,
          // Effects
          crop: { width: 1000, height: 250, x: 100, y: 25 },
          flipHorizontal: true,
          // Common properties
          start: 2,
          duration: 45,
          fadeIn: 2,
          fadeOut: 3,
          zIndex: 5,
          extraTime: 1,
          // Meta properties
          id: 'main-overlay',
          comment: 'Primary stream overlay with dynamic content',
          cache: false
        };

        const result = processComponentElement(input);

        expect(result).toMatchObject({
          type: 'component',
          component: 'advanced-overlay-template',
          settings: {
            title: 'Live Stream Overlay',
            theme: 'dark',
            animation: { enter: 'fadeIn', exit: 'slideUp' },
            elements: {
              logo: { src: 'logo.png', position: 'top-left' },
              ticker: { text: 'Breaking News', speed: 2 }
            }
          },
          position: 'top-center',
          x: 0,
          y: 20,
          width: 1200,
          height: 300,
          resize: 'fit',
          zoom: 1.2,
          crop: { width: 1000, height: 250, x: 100, y: 25 },
          'flip-horizontal': true,
          start: 2,
          duration: 45,
          'fade-in': 2,
          'fade-out': 3,
          'z-index': 5,
          'extra-time': 1,
          id: 'main-overlay',
          comment: 'Primary stream overlay with dynamic content',
          cache: false
        });

        // Verify camelCase properties removed
        expect(result).not.toHaveProperty('fadeIn');
        expect(result).not.toHaveProperty('fadeOut');
        expect(result).not.toHaveProperty('zIndex');
        expect(result).not.toHaveProperty('extraTime');
        expect(result).not.toHaveProperty('flipHorizontal');
      });

      it('should handle minimal component element with only required fields', () => {
        const input = { type: 'component', component: 'simple-template' };
        const result = processComponentElement(input);
        
        expect(result).toEqual({ 
          type: 'component',
          component: 'simple-template'
        });
      });

      it('should handle component element with only settings', () => {
        const input = { 
          type: 'component',
          component: 'configurable-element',
          settings: { mode: 'production', debug: false }
        };
        const result = processComponentElement(input);
        
        expect(result).toEqual({ 
          type: 'component',
          component: 'configurable-element',
          settings: { mode: 'production', debug: false }
        });
      });
    });

    describe('error handling and edge cases', () => {
      it.each([
        ['invalid duration string', { type: 'component', component: 'test', duration: 'eternal' }, { duration: -1 }],
        ['NaN duration', { type: 'component', component: 'test', duration: NaN }, { duration: -1 }],
        ['invalid start string', { type: 'component', component: 'test', start: 'now' }, { start: 0 }],
        ['NaN start', { type: 'component', component: 'test', start: NaN }, { start: 0 }],
        ['null component preserved', { type: 'component', component: null }, { component: null }],
        ['empty string component', { type: 'component', component: '' }, { component: '' }],
        ['undefined properties ignored', { type: 'component', component: 'test', settings: undefined, width: undefined }, { component: 'test' }]
      ])('should handle invalid values gracefully: %s', (_, input, expectedSubset) => {
        const result = processComponentElement(input);
        expect(result).toMatchObject(expectedSubset);
      });

      it('should preserve unknown component properties', () => {
        const input = {
          type: 'component',
          component: 'custom-template',
          customComponentProperty: 'custom-value',
          experimentalFeature: true,
          metadata: { version: '2.1', author: 'developer' }
        };

        const result = processComponentElement(input);
        
        expect(result.customComponentProperty).toBe('custom-value');
        expect(result.experimentalFeature).toBe(true);
        expect(result.metadata).toEqual({ version: '2.1', author: 'developer' });
      });

      it('should handle edge case settings values', () => {
        const edgeCaseSettings = {
          stringValue: 'normal text',
          numberValue: 42,
          booleanValue: true,
          arrayValue: [1, 'two', { three: 3 }],
          objectValue: { nested: { deeply: { value: 'here' } } },
          nullValue: null,
          undefinedValue: undefined,
          emptyString: '',
          zeroNumber: 0,
          falsyBoolean: false
        };

        const input = {
          type: 'component',
          component: 'edge-case-component',
          settings: edgeCaseSettings
        };

        const result = processComponentElement(input);
        
        expect(result.settings).toEqual(edgeCaseSettings);
      });

      it('should handle non-object settings values', () => {
        const testCases = [
          ['string settings', { type: 'component', component: 'test', settings: 'string-config' }, { settings: 'string-config' }],
          ['number settings', { type: 'component', component: 'test', settings: 123 }, { settings: 123 }],
          ['boolean settings', { type: 'component', component: 'test', settings: true }, { settings: true }],
          ['array settings', { type: 'component', component: 'test', settings: [1, 2, 3] }, { settings: [1, 2, 3] }]
        ];

        testCases.forEach(([description, input, expectedSubset]) => {
          const result = processComponentElement(input);
          expect(result).toMatchObject(expectedSubset);
        });
      });
    });

    describe('settings object preservation', () => {
      it.each([
        ['primitive values', { string: 'text', number: 42, boolean: true, null: null }],
        ['array values', { numbers: [1, 2, 3], strings: ['a', 'b', 'c'], mixed: [1, 'two', true] }],
        ['nested objects', { level1: { level2: { level3: { value: 'deep' } } } }],
        ['mixed complex structure', { 
          config: { enabled: true, priority: 5 }, 
          items: [{ id: 1, name: 'first' }, { id: 2, name: 'second' }],
          metadata: { created: '2024-01-01', tags: ['important', 'urgent'] }
        }]
      ])('should preserve settings structure: %s', (_, settingsValue) => {
        const input = {
          type: 'component',
          component: 'structure-test',
          settings: settingsValue
        };

        const result = processComponentElement(input);
        expect(result.settings).toEqual(settingsValue);
      });
    });
  });
});