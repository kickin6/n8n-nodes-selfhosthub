// __tests__/nodes/CreateJ2vMovie/core/processors/textProcessor.test.ts

import { processTextElement } from '../../../../../nodes/CreateJ2vMovie/core/processors/textProcessor';

describe('textProcessor', () => {
  describe('processTextElement', () => {
    
    describe('text-specific properties', () => {
      it.each([
        ['basic text element', { type: 'text', text: 'Hello World' }, { type: 'text', text: 'Hello World' }],
        ['text with style', { type: 'text', text: 'Styled text', style: '001' }, { type: 'text', text: 'Styled text', style: '001' }],
        ['text with different styles', { type: 'text', text: 'Test', style: '002' }, { type: 'text', text: 'Test', style: '002' }],
        ['text with style 003', { type: 'text', text: 'Test', style: '003' }, { type: 'text', text: 'Test', style: '003' }],
        ['text with style 004', { type: 'text', text: 'Test', style: '004' }, { type: 'text', text: 'Test', style: '004' }],
        ['text without style', { type: 'text', text: 'Plain text' }, { type: 'text', text: 'Plain text' }],
        ['text with empty string', { type: 'text', text: '' }, { type: 'text', text: '' }],
        ['text with null text', { type: 'text', text: null }, { type: 'text', text: null }]
      ])('should process %s', (_, input, expected) => {
        const result = processTextElement(input);
        expect(result).toEqual(expected);
      });
    });

    describe('basic positioning properties', () => {
      it.each([
        ['position preset', { type: 'text', text: 'Positioned', position: 'top-center' }, { position: 'top-center' }],
        ['custom position', { type: 'text', text: 'Custom', position: 'custom' }, { position: 'custom' }],
        ['x coordinate', { type: 'text', text: 'X pos', x: 150 }, { x: 150 }],
        ['y coordinate', { type: 'text', text: 'Y pos', y: 200 }, { y: 200 }],
        ['string coordinates', { type: 'text', text: 'String coords', x: '100.5', y: '250.75' }, { x: 100.5, y: 250.75 }],
        ['negative coordinates', { type: 'text', text: 'Negative', x: -50, y: -25 }, { x: -50, y: -25 }],
        ['zero coordinates', { type: 'text', text: 'Zero', x: 0, y: 0 }, { x: 0, y: 0 }],
        ['width and height', { type: 'text', text: 'Dimensions', width: 400, height: 100 }, { width: 400, height: 100 }],
        ['string dimensions', { type: 'text', text: 'String dims', width: '600', height: '150' }, { width: 600, height: 150 }],
        ['negative dimensions', { type: 'text', text: 'Negative dims', width: -200, height: -50 }, { width: -1, height: -1 }],
        ['zero dimensions', { type: 'text', text: 'Zero dims', width: 0, height: 0 }, { width: 0, height: 0 }],
        ['resize mode', { type: 'text', text: 'Resized', resize: 'contain' }, { resize: 'contain' }]
      ])('should handle %s', (_, input, expectedSubset) => {
        const result = processTextElement(input);
        expect(result).toMatchObject(expectedSubset);
      });

      it('should handle invalid coordinate values', () => {
        const input = {
          type: 'text',
          text: 'Invalid coords',
          x: 'left',
          y: 'top',
          width: 'wide',
          height: 'tall'
        };

        const result = processTextElement(input);
        
        // Invalid values should be preserved as-is
        expect(result.x).toBe('left');
        expect(result.y).toBe('top');
        expect(result.width).toBe('wide');
        expect(result.height).toBe('tall');
      });
    });

    describe('text settings creation from camelCase properties', () => {
      it.each([
        ['font-family from camelCase', { type: 'text', text: 'Test', fontFamily: 'Helvetica' }, { settings: { 'font-family': 'Helvetica' } }],
        ['font-size from camelCase number', { type: 'text', text: 'Test', fontSize: 24 }, { settings: { 'font-size': 24 } }],
        ['font-size from camelCase string', { type: 'text', text: 'Test', fontSize: '32px' }, { settings: { 'font-size': '32px' } }],
        ['font-weight from camelCase number', { type: 'text', text: 'Test', fontWeight: 700 }, { settings: { 'font-weight': 700 } }],
        ['font-weight from camelCase string', { type: 'text', text: 'Test', fontWeight: 'bold' }, { settings: { 'font-weight': 'bold' } }],
        ['font-color from camelCase', { type: 'text', text: 'Test', fontColor: '#FF0000' }, { settings: { 'font-color': '#FF0000' } }],
        ['background-color from camelCase', { type: 'text', text: 'Test', backgroundColor: '#000000' }, { settings: { 'background-color': '#000000' } }],
        ['text-align from camelCase', { type: 'text', text: 'Test', textAlign: 'center' }, { settings: { 'text-align': 'center' } }],
        ['vertical-position from camelCase', { type: 'text', text: 'Test', verticalPosition: 'middle' }, { settings: { 'vertical-position': 'middle' } }],
        ['horizontal-position from camelCase', { type: 'text', text: 'Test', horizontalPosition: 'left' }, { settings: { 'horizontal-position': 'left' } }],
        ['line-height from camelCase', { type: 'text', text: 'Test', lineHeight: 1.5 }, { settings: { 'line-height': 1.5 } }],
        ['letter-spacing from camelCase', { type: 'text', text: 'Test', letterSpacing: 2 }, { settings: { 'letter-spacing': 2 } }],
        ['text-shadow from camelCase', { type: 'text', text: 'Test', textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }, { settings: { 'text-shadow': '2px 2px 4px rgba(0,0,0,0.5)' } }],
        ['text-decoration from camelCase', { type: 'text', text: 'Test', textDecoration: 'underline' }, { settings: { 'text-decoration': 'underline' } }],
        ['text-transform from camelCase', { type: 'text', text: 'Test', textTransform: 'uppercase' }, { settings: { 'text-transform': 'uppercase' } }]
      ])('should create settings from %s', (_, input, expectedSubset) => {
        const result = processTextElement(input);
        expect(result).toMatchObject(expectedSubset);
        
        // Check that camelCase properties are removed from main element
        const camelCaseProps = ['fontFamily', 'fontSize', 'fontWeight', 'fontColor', 'backgroundColor',
                               'textAlign', 'verticalPosition', 'horizontalPosition', 'lineHeight',
                               'letterSpacing', 'textShadow', 'textDecoration', 'textTransform'];
        camelCaseProps.forEach(prop => {
          if ((input as any)[prop] !== undefined) {
            expect(result).not.toHaveProperty(prop);
          }
        });
      });

      it('should handle font-size with different formats', () => {
        const testCases = [
          [{ type: 'text', text: 'Test', fontSize: 24 }, { 'font-size': 24 }],
          [{ type: 'text', text: 'Test', fontSize: '32px' }, { 'font-size': '32px' }],
          [{ type: 'text', text: 'Test', fontSize: '2em' }, { 'font-size': '2em' }],
          [{ type: 'text', text: 'Test', fontSize: '1.5rem' }, { 'font-size': '1.5rem' }],
          [{ type: 'text', text: 'Test', fontSize: '150%' }, { 'font-size': '150%' }],
          [{ type: 'text', text: 'Test', fontSize: '20.5' }, { 'font-size': '20.5px' }], // Valid numeric string with units
          [{ type: 'text', text: 'Test', fontSize: 'large' }, { 'font-size': 'large' }] // Invalid numeric, preserved as-is
        ];

        testCases.forEach(([input, expectedSettingsSubset]) => {
          const result = processTextElement(input);
          expect(result.settings).toMatchObject(expectedSettingsSubset);
        });
      });

      it('should handle font-weight conversions', () => {
        const testCases = [
          [{ type: 'text', text: 'Test', fontWeight: 400 }, { 'font-weight': 400 }],
          [{ type: 'text', text: 'Test', fontWeight: 'normal' }, { 'font-weight': 'normal' }],
          [{ type: 'text', text: 'Test', fontWeight: 'bold' }, { 'font-weight': 'bold' }],
          [{ type: 'text', text: 'Test', fontWeight: '700' }, { 'font-weight': 700 }],
          [{ type: 'text', text: 'Test', fontWeight: 'bolder' }, { 'font-weight': 'bolder' }]
        ];

        testCases.forEach(([input, expectedSettingsSubset]) => {
          const result = processTextElement(input);
          expect(result.settings).toMatchObject(expectedSettingsSubset);
        });
      });

      it('should clamp line-height to minimum value', () => {
        const testCases = [
          [{ type: 'text', text: 'Test', lineHeight: 1.5 }, { 'line-height': 1.5 }],
          [{ type: 'text', text: 'Test', lineHeight: 0.05 }, { 'line-height': 0.1 }], // Below minimum
          [{ type: 'text', text: 'Test', lineHeight: '2.0' }, { 'line-height': 2.0 }],
          [{ type: 'text', text: 'Test', lineHeight: 'normal' }, { 'line-height': 'normal' }] // Invalid, preserved
        ];

        testCases.forEach(([input, expectedSettingsSubset]) => {
          const result = processTextElement(input);
          expect(result.settings).toMatchObject(expectedSettingsSubset);
        });
      });

      it('should handle letter-spacing values', () => {
        const testCases = [
          [{ type: 'text', text: 'Test', letterSpacing: 2 }, { 'letter-spacing': 2 }],
          [{ type: 'text', text: 'Test', letterSpacing: -1 }, { 'letter-spacing': -1 }],
          [{ type: 'text', text: 'Test', letterSpacing: '1.5' }, { 'letter-spacing': 1.5 }],
          [{ type: 'text', text: 'Test', letterSpacing: 'normal' }, { 'letter-spacing': 'normal' }] // Invalid, preserved
        ];

        testCases.forEach(([input, expectedSettingsSubset]) => {
          const result = processTextElement(input);
          expect(result.settings).toMatchObject(expectedSettingsSubset);
        });
      });
    });

    describe('existing settings object handling', () => {
      it('should merge existing settings with camelCase properties', () => {
        const input = {
          type: 'text',
          text: 'Merge test',
          settings: {
            'font-family': 'Arial',
            'font-size': 20,
            'text-align': 'left'
          },
          fontColor: '#FF0000',
          backgroundColor: '#000000',
          lineHeight: 1.8
        };

        const result = processTextElement(input);

        expect(result.settings).toMatchObject({
          'font-family': 'Arial',
          'font-size': 20,
          'text-align': 'left',
          'font-color': '#FF0000',
          'background-color': '#000000',
          'line-height': 1.8
        });

        // CamelCase properties should be removed from main element
        expect(result).not.toHaveProperty('fontColor');
        expect(result).not.toHaveProperty('backgroundColor');
        expect(result).not.toHaveProperty('lineHeight');
      });

      it('should handle settings object without additional properties', () => {
        const input = {
          type: 'text',
          text: 'Settings only',
          settings: {
            'font-family': 'Georgia',
            'font-size': '24px',
            'font-weight': 'bold',
            'text-align': 'center'
          }
        };

        const result = processTextElement(input);

        expect(result.settings).toEqual({
          'font-family': 'Georgia',
          'font-size': '24px',
          'font-weight': 'bold',
          'text-align': 'center'
        });
      });

      it('should not create settings object when no settings properties exist', () => {
        const input = {
          type: 'text',
          text: 'No settings',
          style: '001',
          position: 'center-center',
          start: 5,
          duration: 10
        };

        const result = processTextElement(input);

        expect(result).not.toHaveProperty('settings');
      });
    });

    describe('common properties integration', () => {
      it.each([
        ['timing properties', { type: 'text', text: 'Timed text', start: 3, duration: 15 }, { start: 3, duration: 15 }],
        ['string timing values', { type: 'text', text: 'Timed text', start: '2.7', duration: '18.3' }, { start: 2.7, duration: 18.3 }],
        ['special duration -1', { type: 'text', text: 'Auto duration', duration: -1 }, { duration: -1 }],
        ['special duration -2', { type: 'text', text: 'Match container', duration: -2 }, { duration: -2 }],
        ['negative start clamped to 0', { type: 'text', text: 'Early start', start: -2 }, { start: 0 }],
        ['zero duration', { type: 'text', text: 'Instant text', duration: 0 }, { duration: 0 }],
        ['decimal timing', { type: 'text', text: 'Precise text', start: 1.25, duration: 12.75 }, { start: 1.25, duration: 12.75 }]
      ])('should handle %s', (_, input, expectedSubset) => {
        const result = processTextElement(input);
        expect(result).toMatchObject(expectedSubset);
      });
    });

    describe('camelCase to kebab-case conversion', () => {
      it('should convert fade properties', () => {
        const input = { type: 'text', text: 'Fading text', fadeIn: 1.8, fadeOut: 2.2 };
        const result = processTextElement(input);
        
        expect(result).toMatchObject({ 'fade-in': 1.8, 'fade-out': 2.2 });
        expect(result).not.toHaveProperty('fadeIn');
        expect(result).not.toHaveProperty('fadeOut');
      });

      it('should convert z-index', () => {
        const input = { type: 'text', text: 'Layered text', zIndex: 15 };
        const result = processTextElement(input);
        
        expect(result).toMatchObject({ 'z-index': 15 });
        expect(result).not.toHaveProperty('zIndex');
      });

      it('should convert extra-time', () => {
        const input = { type: 'text', text: 'Extended text', extraTime: 1.5 };
        const result = processTextElement(input);
        
        expect(result).toMatchObject({ 'extra-time': 1.5 });
        expect(result).not.toHaveProperty('extraTime');
      });

      it('should convert combined kebab properties', () => {
        const input = { type: 'text', text: 'Combined', fadeIn: 1, zIndex: 5, extraTime: 0.5 };
        const result = processTextElement(input);
        
        expect(result).toMatchObject({ 'fade-in': 1, 'z-index': 5, 'extra-time': 0.5 });
        expect(result).not.toHaveProperty('fadeIn');
        expect(result).not.toHaveProperty('zIndex');
        expect(result).not.toHaveProperty('extraTime');
      });
    });

    describe('comprehensive integration', () => {
      it('should handle complete text element with all supported properties', () => {
        const input = {
          type: 'text',
          text: 'Complete text element with all features enabled for comprehensive testing',
          style: '002',
          // Basic positioning
          position: 'center-center',
          x: 0,
          y: 0,
          width: 800,
          height: 200,
          resize: 'fit',
          // Text settings (camelCase)
          fontFamily: 'Roboto',
          fontSize: '28px',
          fontWeight: 'bold',
          fontColor: '#FFFFFF',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          textAlign: 'center',
          verticalPosition: 'center',
          horizontalPosition: 'center',
          lineHeight: 1.4,
          letterSpacing: 1,
          textShadow: '2px 2px 4px rgba(0,0,0,0.7)',
          textDecoration: 'none',
          textTransform: 'none',
          // Common properties
          start: 5,
          duration: 20,
          fadeIn: 2,
          fadeOut: 2,
          zIndex: 20,
          extraTime: 1,
          // Meta properties
          id: 'main-title',
          comment: 'Primary title text with full styling',
          cache: true
        };

        const result = processTextElement(input);

        expect(result).toMatchObject({
          type: 'text',
          text: 'Complete text element with all features enabled for comprehensive testing',
          style: '002',
          position: 'center-center',
          x: 0,
          y: 0,
          width: 800,
          height: 200,
          resize: 'fit',
          settings: {
            'font-family': 'Roboto',
            'font-size': '28px',
            'font-weight': 'bold',
            'font-color': '#FFFFFF',
            'background-color': 'rgba(0, 0, 0, 0.8)',
            'text-align': 'center',
            'vertical-position': 'center',
            'horizontal-position': 'center',
            'line-height': 1.4,
            'letter-spacing': 1,
            'text-shadow': '2px 2px 4px rgba(0,0,0,0.7)',
            'text-decoration': 'none',
            'text-transform': 'none'
          },
          start: 5,
          duration: 20,
          'fade-in': 2,
          'fade-out': 2,
          'z-index': 20,
          'extra-time': 1,
          id: 'main-title',
          comment: 'Primary title text with full styling',
          cache: true
        });

        // Verify camelCase properties removed from main element
        const camelCaseProps = ['fontFamily', 'fontSize', 'fontWeight', 'fontColor', 'backgroundColor',
                               'textAlign', 'verticalPosition', 'horizontalPosition', 'lineHeight',
                               'letterSpacing', 'textShadow', 'textDecoration', 'textTransform',
                               'fadeIn', 'fadeOut', 'zIndex', 'extraTime'];
        camelCaseProps.forEach(prop => {
          expect(result).not.toHaveProperty(prop);
        });
      });

      it('should handle minimal text element with only required fields', () => {
        const input = { type: 'text', text: 'Minimal text' };
        const result = processTextElement(input);
        
        expect(result).toEqual({ 
          type: 'text',
          text: 'Minimal text'
        });
      });

      it('should handle text element with only positioning', () => {
        const input = { 
          type: 'text',
          text: 'Positioned text',
          position: 'top-left',
          x: 50,
          y: 25
        };
        const result = processTextElement(input);
        
        expect(result).toEqual({ 
          type: 'text',
          text: 'Positioned text',
          position: 'top-left',
          x: 50,
          y: 25
        });
      });

      it('should handle text element with only settings', () => {
        const input = { 
          type: 'text',
          text: 'Styled text',
          fontFamily: 'Arial',
          fontSize: 20,
          fontColor: '#FF0000'
        };
        const result = processTextElement(input);
        
        expect(result).toMatchObject({ 
          type: 'text',
          text: 'Styled text',
          settings: {
            'font-family': 'Arial',
            'font-size': 20,
            'font-color': '#FF0000'
          }
        });

        expect(result).not.toHaveProperty('fontFamily');
        expect(result).not.toHaveProperty('fontSize');
        expect(result).not.toHaveProperty('fontColor');
      });
    });

    describe('error handling and edge cases', () => {
      it.each([
        ['invalid duration string', { type: 'text', text: 'Test', duration: 'forever' }, { duration: -1 }],
        ['NaN duration', { type: 'text', text: 'Test', duration: NaN }, { duration: -1 }],
        ['invalid start string', { type: 'text', text: 'Test', start: 'beginning' }, { start: 0 }],
        ['NaN start', { type: 'text', text: 'Test', start: NaN }, { start: 0 }],
        ['null text preserved', { type: 'text', text: null }, { text: null }],
        ['empty string text', { type: 'text', text: '' }, { text: '' }],
        ['undefined properties ignored', { type: 'text', text: 'Test', fontSize: undefined, fontColor: undefined }, { text: 'Test' }]
      ])('should handle invalid values gracefully: %s', (_, input, expectedSubset) => {
        const result = processTextElement(input);
        expect(result).toMatchObject(expectedSubset);
      });

      it('should preserve unknown text properties', () => {
        const input = {
          type: 'text',
          text: 'Custom text',
          customTextProperty: 'custom-value',
          experimentalFeature: true,
          metadata: { language: 'en', readingTime: 5, wordCount: 150 }
        };

        const result = processTextElement(input);
        
        expect(result.customTextProperty).toBe('custom-value');
        expect(result.experimentalFeature).toBe(true);
        expect(result.metadata).toEqual({ language: 'en', readingTime: 5, wordCount: 150 });
      });

      it('should handle edge case positioning values', () => {
        const input = {
          type: 'text',
          text: 'Edge positioning',
          x: NaN,                // Invalid numeric
          y: 'middle',           // String instead of number
          width: -1,             // Negative dimension (valid for auto)
          height: 0,             // Zero height
          position: 'custom'     // Custom position
        };

        const result = processTextElement(input);
        
        expect(result.x).toEqual(NaN);
        expect(result.y).toBe('middle');
        expect(result.width).toBe(-1);
        expect(result.height).toBe(0);
        expect(result.position).toBe('custom');
      });

      it('should handle complex settings edge cases', () => {
        const input = {
          type: 'text',
          text: 'Settings edge cases',
          settings: null,           // null existing settings
          fontFamily: undefined,    // undefined camelCase property
          fontSize: '',            // empty string
          fontWeight: 0,           // zero weight
          lineHeight: -1,          // negative line height (should be clamped)
          letterSpacing: NaN       // invalid letter spacing
        };

        const result = processTextElement(input);
        
        expect(result.settings).toMatchObject({
          'font-size': '',
          'font-weight': 0,
          'line-height': 0.1,      // Clamped to minimum
          'letter-spacing': NaN  // NaN preserved as is
        });
      });
    });

    describe('settings detection logic', () => {
      it('should detect settings properties in various forms', () => {
        const testCases = [
          // camelCase properties
          { type: 'text', text: 'Test', fontFamily: 'Arial' },
          { type: 'text', text: 'Test', fontSize: 20 },
          { type: 'text', text: 'Test', textAlign: 'center' },
          // kebab-case properties
          { type: 'text', text: 'Test', 'font-family': 'Arial' },
          { type: 'text', text: 'Test', 'font-size': 20 },
          { type: 'text', text: 'Test', 'text-align': 'center' },
          // mixed case
          { type: 'text', text: 'Test', fontSize: 20, 'font-color': '#FF0000' }
        ];

        testCases.forEach(input => {
          const result = processTextElement(input);
          expect(result).toHaveProperty('settings');
          expect(typeof result.settings).toBe('object');
        });
      });

      it('should not create settings when no relevant properties exist', () => {
        const input = {
          type: 'text',
          text: 'No settings text',
          style: '001',
          position: 'center-center',
          x: 100,
          y: 200,
          start: 5,
          duration: 10,
          comment: 'No settings properties here'
        };

        const result = processTextElement(input);
        expect(result).not.toHaveProperty('settings');
      });
    });

    describe('font-size parsing edge cases', () => {
      it.each([
        ['valid px units', { type: 'text', text: 'Test', fontSize: '24px' }, { 'font-size': '24px' }],
        ['valid em units', { type: 'text', text: 'Test', fontSize: '1.5em' }, { 'font-size': '1.5em' }],
        ['valid rem units', { type: 'text', text: 'Test', fontSize: '2rem' }, { 'font-size': '2rem' }],
        ['valid percentage', { type: 'text', text: 'Test', fontSize: '150%' }, { 'font-size': '150%' }],
        ['numeric string with decimal', { type: 'text', text: 'Test', fontSize: '20.5' }, { 'font-size': '20.5px' }],
        ['pure number', { type: 'text', text: 'Test', fontSize: 32 }, { 'font-size': 32 }],
        ['invalid format preserved', { type: 'text', text: 'Test', fontSize: 'large' }, { 'font-size': 'large' }],
        ['empty string preserved', { type: 'text', text: 'Test', fontSize: '' }, { 'font-size': '' }]
      ])('should handle font-size %s', (_, input, expectedSettingsSubset) => {
        const result = processTextElement(input);
        expect(result.settings).toMatchObject(expectedSettingsSubset);
      });
    });

    describe('font-weight parsing edge cases', () => {
      it.each([
        ['numeric weight', { type: 'text', text: 'Test', fontWeight: 400 }, { 'font-weight': 400 }],
        ['string numeric weight', { type: 'text', text: 'Test', fontWeight: '700' }, { 'font-weight': 700 }],
        ['keyword weight', { type: 'text', text: 'Test', fontWeight: 'bold' }, { 'font-weight': 'bold' }],
        ['normal keyword', { type: 'text', text: 'Test', fontWeight: 'normal' }, { 'font-weight': 'normal' }],
        ['bolder keyword', { type: 'text', text: 'Test', fontWeight: 'bolder' }, { 'font-weight': 'bolder' }],
        ['lighter keyword', { type: 'text', text: 'Test', fontWeight: 'lighter' }, { 'font-weight': 'lighter' }],
        ['invalid preserved', { type: 'text', text: 'Test', fontWeight: 'heavy' }, { 'font-weight': 'heavy' }]
      ])('should handle font-weight %s', (_, input, expectedSettingsSubset) => {
        const result = processTextElement(input);
        expect(result.settings).toMatchObject(expectedSettingsSubset);
      });
    });

    describe('line-height clamping', () => {
      it.each([
        ['normal value', { type: 'text', text: 'Test', lineHeight: 1.5 }, { 'line-height': 1.5 }],
        ['minimum boundary', { type: 'text', text: 'Test', lineHeight: 0.1 }, { 'line-height': 0.1 }],
        ['below minimum clamped', { type: 'text', text: 'Test', lineHeight: 0.05 }, { 'line-height': 0.1 }],
        ['zero clamped', { type: 'text', text: 'Test', lineHeight: 0 }, { 'line-height': 0.1 }],
        ['negative clamped', { type: 'text', text: 'Test', lineHeight: -1 }, { 'line-height': 0.1 }],
        ['string numeric', { type: 'text', text: 'Test', lineHeight: '2.0' }, { 'line-height': 2.0 }],
        ['invalid preserved', { type: 'text', text: 'Test', lineHeight: 'normal' }, { 'line-height': 'normal' }]
      ])('should handle line-height %s', (_, input, expectedSettingsSubset) => {
        const result = processTextElement(input);
        expect(result.settings).toMatchObject(expectedSettingsSubset);
      });
    });

    describe('letter-spacing handling', () => {
      it.each([
        ['positive spacing', { type: 'text', text: 'Test', letterSpacing: 2 }, { 'letter-spacing': 2 }],
        ['negative spacing', { type: 'text', text: 'Test', letterSpacing: -1 }, { 'letter-spacing': -1 }],
        ['zero spacing', { type: 'text', text: 'Test', letterSpacing: 0 }, { 'letter-spacing': 0 }],
        ['decimal spacing', { type: 'text', text: 'Test', letterSpacing: 1.5 }, { 'letter-spacing': 1.5 }],
        ['string numeric', { type: 'text', text: 'Test', letterSpacing: '3' }, { 'letter-spacing': 3 }],
        ['invalid preserved', { type: 'text', text: 'Test', letterSpacing: 'normal' }, { 'letter-spacing': 'normal' }]
      ])('should handle letter-spacing %s', (_, input, expectedSubset) => {
        const result = processTextElement(input);
        expect(result.settings).toMatchObject(expectedSubset);
      });
    });
  });
});