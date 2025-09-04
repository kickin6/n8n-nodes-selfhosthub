// __tests__/nodes/CreateJ2vMovie/core/processors/subtitleProcessor.test.ts

import { processSubtitleElement } from '../../../../../nodes/CreateJ2vMovie/core/processors/subtitleProcessor';

describe('subtitleProcessor', () => {
  describe('processSubtitleElement', () => {
    
    describe('subtitle content sources', () => {
      it.each([
        ['subtitle with captions', { type: 'subtitles', captions: 'subtitle-file.srt' }, { type: 'subtitles', captions: 'subtitle-file.srt' }],
        ['subtitle with src', { type: 'subtitles', src: 'https://example.com/subs.vtt' }, { type: 'subtitles', src: 'https://example.com/subs.vtt' }],
        ['subtitle with text', { type: 'subtitles', text: 'Manual subtitle text' }, { type: 'subtitles', text: 'Manual subtitle text' }],
        ['subtitle with all sources', { type: 'subtitles', captions: 'file.srt', src: 'url.vtt', text: 'manual' }, { type: 'subtitles', captions: 'file.srt', src: 'url.vtt', text: 'manual' }],
        ['subtitle without content', { type: 'subtitles' }, { type: 'subtitles' }],
        ['subtitle with empty captions', { type: 'subtitles', captions: '' }, { type: 'subtitles', captions: '' }],
        ['subtitle with null src', { type: 'subtitles', src: null }, { type: 'subtitles', src: null }]
      ])('should process %s', (_, input, expected) => {
        const result = processSubtitleElement(input);
        expect(result).toEqual(expected);
      });
    });

    describe('subtitle configuration', () => {
      it.each([
        ['subtitle with language', { type: 'subtitles', captions: 'file.srt', language: 'en' }, { type: 'subtitles', captions: 'file.srt', language: 'en' }],
        ['subtitle with auto language', { type: 'subtitles', captions: 'file.srt', language: 'auto' }, { type: 'subtitles', captions: 'file.srt', language: 'auto' }],
        ['subtitle with default model', { type: 'subtitles', captions: 'file.srt', model: 'default' }, { type: 'subtitles', captions: 'file.srt', model: 'default' }],
        ['subtitle with whisper model', { type: 'subtitles', captions: 'file.srt', model: 'whisper' }, { type: 'subtitles', captions: 'file.srt', model: 'whisper' }],
        ['subtitle with language and model', { type: 'subtitles', text: 'Test', language: 'es', model: 'whisper' }, { type: 'subtitles', text: 'Test', language: 'es', model: 'whisper' }]
      ])('should process %s', (_, input, expected) => {
        const result = processSubtitleElement(input);
        expect(result).toEqual(expected);
      });
    });

    describe('subtitle settings creation from camelCase properties', () => {
      it('should create settings from style property', () => {
        const input = { type: 'subtitles', text: 'Test', style: 'classic' };
        const result = processSubtitleElement(input);
        expect(result).toMatchObject({ settings: { style: 'classic' } });
      });

      it('should create settings from all-caps camelCase', () => {
        const input = { type: 'subtitles', text: 'Test', allCaps: true };
        const result = processSubtitleElement(input);
        expect(result).toMatchObject({ settings: { 'all-caps': true } });
        expect(result).not.toHaveProperty('allCaps');
      });

      it('should create settings from font-family camelCase', () => {
        const input = { type: 'subtitles', text: 'Test', fontFamily: 'Arial' };
        const result = processSubtitleElement(input);
        expect(result).toMatchObject({ settings: { 'font-family': 'Arial' } });
        expect(result).not.toHaveProperty('fontFamily');
      });

      it('should create settings from font-size camelCase', () => {
        const input = { type: 'subtitles', text: 'Test', fontSize: 24 };
        const result = processSubtitleElement(input);
        expect(result).toMatchObject({ settings: { 'font-size': 24 } });
        expect(result).not.toHaveProperty('fontSize');
      });

      it('should create settings from font-url camelCase', () => {
        const input = { type: 'subtitles', text: 'Test', fontUrl: 'custom.ttf' };
        const result = processSubtitleElement(input);
        expect(result).toMatchObject({ settings: { 'font-url': 'custom.ttf' } });
        expect(result).not.toHaveProperty('fontUrl');
      });

      it('should create settings from color properties', () => {
        const wordColorInput = { type: 'subtitles', text: 'Test', wordColor: '#FFFF00' };
        const wordColorResult = processSubtitleElement(wordColorInput);
        expect(wordColorResult).toMatchObject({ settings: { 'word-color': '#FFFF00' } });
        expect(wordColorResult).not.toHaveProperty('wordColor');

        const lineColorInput = { type: 'subtitles', text: 'Test', lineColor: '#FFFFFF' };
        const lineColorResult = processSubtitleElement(lineColorInput);
        expect(lineColorResult).toMatchObject({ settings: { 'line-color': '#FFFFFF' } });
        expect(lineColorResult).not.toHaveProperty('lineColor');

        const boxColorInput = { type: 'subtitles', text: 'Test', boxColor: '#000000' };
        const boxColorResult = processSubtitleElement(boxColorInput);
        expect(boxColorResult).toMatchObject({ settings: { 'box-color': '#000000' } });
        expect(boxColorResult).not.toHaveProperty('boxColor');
      });

      it('should create settings from outline properties', () => {
        const outlineColorInput = { type: 'subtitles', text: 'Test', outlineColor: '#333333' };
        const outlineColorResult = processSubtitleElement(outlineColorInput);
        expect(outlineColorResult).toMatchObject({ settings: { 'outline-color': '#333333' } });
        expect(outlineColorResult).not.toHaveProperty('outlineColor');

        const outlineWidthInput = { type: 'subtitles', text: 'Test', outlineWidth: 2 };
        const outlineWidthResult = processSubtitleElement(outlineWidthInput);
        expect(outlineWidthResult).toMatchObject({ settings: { 'outline-width': 2 } });
        expect(outlineWidthResult).not.toHaveProperty('outlineWidth');
      });

      it('should create settings from shadow properties', () => {
        const shadowColorInput = { type: 'subtitles', text: 'Test', shadowColor: '#666666' };
        const shadowColorResult = processSubtitleElement(shadowColorInput);
        expect(shadowColorResult).toMatchObject({ settings: { 'shadow-color': '#666666' } });
        expect(shadowColorResult).not.toHaveProperty('shadowColor');

        const shadowOffsetInput = { type: 'subtitles', text: 'Test', shadowOffset: 3 };
        const shadowOffsetResult = processSubtitleElement(shadowOffsetInput);
        expect(shadowOffsetResult).toMatchObject({ settings: { 'shadow-offset': 3 } });
        expect(shadowOffsetResult).not.toHaveProperty('shadowOffset');
      });

      it('should create settings from max words per line', () => {
        const input = { type: 'subtitles', text: 'Test', maxWordsPerLine: 6 };
        const result = processSubtitleElement(input);
        expect(result).toMatchObject({ settings: { 'max-words-per-line': 6 } });
        expect(result).not.toHaveProperty('maxWordsPerLine');
      });

      it('should create settings from position coordinates', () => {
        const input = { type: 'subtitles', text: 'Test', position: 'custom', x: 100, y: 200 };
        const result = processSubtitleElement(input);
        expect(result).toMatchObject({ settings: { position: 'custom', x: 100, y: 200 } });
      });

      it('should create settings from keywords array', () => {
        const input = { type: 'subtitles', text: 'Test', keywords: ['technical', 'jargon'] };
        const result = processSubtitleElement(input);
        expect(result).toMatchObject({ settings: { keywords: ['technical', 'jargon'] } });
      });

      it('should create settings from replace object', () => {
        const input = { type: 'subtitles', text: 'Test', replace: { 'AI': 'Artificial Intelligence' } };
        const result = processSubtitleElement(input);
        expect(result).toMatchObject({ settings: { replace: { 'AI': 'Artificial Intelligence' } } });
      });

      it('should handle numeric conversions in settings', () => {
        const input = {
          type: 'subtitles',
          text: 'Numeric test',
          fontSize: '32',
          outlineWidth: '1.5',
          shadowOffset: '-2',
          maxWordsPerLine: '8'
        };

        const result = processSubtitleElement(input);

        expect(result.settings).toMatchObject({
          'font-size': 32,
          'outline-width': 1.5,
          'shadow-offset': -2,
          'max-words-per-line': 8
        });
      });

      it('should clamp numeric values appropriately', () => {
        const input = {
          type: 'subtitles',
          text: 'Clamping test',
          outlineWidth: '-5',      // Should be clamped to 0
          maxWordsPerLine: '0'     // Should be clamped to 1
        };

        const result = processSubtitleElement(input);

        expect(result.settings).toMatchObject({
          'outline-width': 0,
          'max-words-per-line': 1
        });
      });

      it('should handle invalid numeric values gracefully', () => {
        const input = {
          type: 'subtitles',
          text: 'Invalid numeric test',
          fontSize: 'large',
          outlineWidth: 'thick',
          shadowOffset: 'far',
          maxWordsPerLine: 'many'
        };

        const result = processSubtitleElement(input);

        // Invalid values should be preserved as-is
        expect(result.settings).toMatchObject({
          'font-size': 'large',
          'outline-width': 'thick',
          'shadow-offset': 'far',
          'max-words-per-line': 'many'
        });
      });

      it('should convert boolean all-caps correctly', () => {
        const testCases = [
          [{ type: 'subtitles', text: 'Test', allCaps: true }, { 'all-caps': true }],
          [{ type: 'subtitles', text: 'Test', allCaps: false }, { 'all-caps': false }],
          [{ type: 'subtitles', text: 'Test', allCaps: 'true' }, { 'all-caps': true }],
          [{ type: 'subtitles', text: 'Test', allCaps: 'false' }, { 'all-caps': false }],
          [{ type: 'subtitles', text: 'Test', allCaps: 1 }, { 'all-caps': true }],
          [{ type: 'subtitles', text: 'Test', allCaps: 0 }, { 'all-caps': false }]
        ];

        testCases.forEach(([input, expectedSettingsSubset]) => {
          const result = processSubtitleElement(input);
          expect(result.settings).toMatchObject(expectedSettingsSubset);
        });
      });
    });

    describe('existing settings object handling', () => {
      it('should merge existing settings with camelCase properties', () => {
        const input = {
          type: 'subtitles',
          text: 'Merge test',
          settings: {
            style: 'modern',
            'font-family': 'Helvetica',
            'word-color': '#FF0000'
          },
          allCaps: true,
          fontSize: 28,
          lineColor: '#00FF00'
        };

        const result = processSubtitleElement(input);

        expect(result.settings).toMatchObject({
          style: 'modern',
          'font-family': 'Helvetica',
          'word-color': '#FF0000',
          'all-caps': true,
          'font-size': 28,
          'line-color': '#00FF00'
        });

        // CamelCase properties should be removed from main element
        expect(result).not.toHaveProperty('allCaps');
        expect(result).not.toHaveProperty('fontSize');
        expect(result).not.toHaveProperty('lineColor');
      });

      it('should handle settings object without additional properties', () => {
        const input = {
          type: 'subtitles',
          captions: 'file.srt',
          settings: {
            'all-caps': false,
            'font-size': 20,
            position: 'bottom-center'
          }
        };

        const result = processSubtitleElement(input);

        expect(result.settings).toEqual({
          'all-caps': false,
          'font-size': 20,
          position: 'bottom-center'
        });
      });

      it('should not create settings object when no settings properties exist', () => {
        const input = {
          type: 'subtitles',
          captions: 'file.srt',
          language: 'en',
          model: 'default'
        };

        const result = processSubtitleElement(input);

        expect(result).not.toHaveProperty('settings');
      });
    });

    describe('common properties integration', () => {
      it.each([
        ['timing properties', { type: 'subtitles', text: 'Timed subs', start: 2, duration: 20 }, { start: 2, duration: 20 }],
        ['string timing values', { type: 'subtitles', text: 'Timed subs', start: '3.5', duration: '25.2' }, { start: 3.5, duration: 25.2 }],
        ['special duration -1', { type: 'subtitles', text: 'Auto subs', duration: -1 }, { duration: -1 }],
        ['special duration -2', { type: 'subtitles', text: 'Match container', duration: -2 }, { duration: -2 }],
        ['negative start clamped to 0', { type: 'subtitles', text: 'Early subs', start: -1 }, { start: 0 }],
        ['zero duration', { type: 'subtitles', text: 'Instant subs', duration: 0 }, { duration: 0 }],
        ['decimal timing', { type: 'subtitles', text: 'Precise subs', start: 1.75, duration: 18.5 }, { start: 1.75, duration: 18.5 }]
      ])('should handle %s', (_, input, expectedSubset) => {
        const result = processSubtitleElement(input);
        expect(result).toMatchObject(expectedSubset);
      });
    });

    describe('camelCase to kebab-case conversion', () => {
      it('should convert fade properties', () => {
        const input = { type: 'subtitles', text: 'Fading subs', fadeIn: 0.5, fadeOut: 1.5 };
        const result = processSubtitleElement(input);
        expect(result).toMatchObject({ 'fade-in': 0.5, 'fade-out': 1.5 });
        expect(result).not.toHaveProperty('fadeIn');
        expect(result).not.toHaveProperty('fadeOut');
      });

      it('should convert z-index property', () => {
        const input = { type: 'subtitles', text: 'Layered subs', zIndex: 99 };
        const result = processSubtitleElement(input);
        expect(result).toMatchObject({ 'z-index': 99 });
        expect(result).not.toHaveProperty('zIndex');
      });

      it('should convert extra time property', () => {
        const input = { type: 'subtitles', text: 'Extended subs', extraTime: 2.5 };
        const result = processSubtitleElement(input);
        expect(result).toMatchObject({ 'extra-time': 2.5 });
        expect(result).not.toHaveProperty('extraTime');
      });
    });

    describe('comprehensive integration', () => {
      it('should handle complete subtitle element with all supported properties', () => {
        const input = {
          type: 'subtitles',
          captions: 'complete-subtitles.srt',
          language: 'en-US',
          model: 'whisper',
          // Settings properties (camelCase)
          style: 'modern',
          allCaps: false,
          fontFamily: 'Open Sans',
          fontSize: 32,
          fontUrl: 'opensans-bold.ttf',
          position: 'bottom-center',
          wordColor: '#FFFF00',
          lineColor: '#FFFFFF',
          boxColor: '#000000CC',
          outlineColor: '#000000',
          outlineWidth: 1,
          shadowColor: '#333333',
          shadowOffset: 2,
          maxWordsPerLine: 5,
          x: 0,
          y: -50,
          keywords: ['AI', 'machine learning', 'neural network'],
          replace: { 'ML': 'Machine Learning', 'AI': 'Artificial Intelligence' },
          // Common properties
          start: 0,
          duration: -2,
          fadeIn: 1,
          fadeOut: 1,
          zIndex: 10,
          // Meta properties
          id: 'main-subtitles',
          comment: 'Primary subtitle track with custom styling',
          cache: true
        };

        const result = processSubtitleElement(input);

        expect(result).toMatchObject({
          type: 'subtitles',
          captions: 'complete-subtitles.srt',
          language: 'en-US',
          model: 'whisper',
          settings: {
            style: 'modern',
            'all-caps': false,
            'font-family': 'Open Sans',
            'font-size': 32,
            'font-url': 'opensans-bold.ttf',
            position: 'bottom-center',
            'word-color': '#FFFF00',
            'line-color': '#FFFFFF',
            'box-color': '#000000CC',
            'outline-color': '#000000',
            'outline-width': 1,
            'shadow-color': '#333333',
            'shadow-offset': 2,
            'max-words-per-line': 5,
            x: 0,
            y: -50,
            keywords: ['AI', 'machine learning', 'neural network'],
            replace: { 'ML': 'Machine Learning', 'AI': 'Artificial Intelligence' }
          },
          start: 0,
          duration: -2,
          'fade-in': 1,
          'fade-out': 1,
          'z-index': 10,
          id: 'main-subtitles',
          comment: 'Primary subtitle track with custom styling',
          cache: true
        });

        // Verify camelCase properties removed from main element - test each individually
        expect(result).not.toHaveProperty('allCaps');
        expect(result).not.toHaveProperty('fontFamily');
        expect(result).not.toHaveProperty('fontSize');
        expect(result).not.toHaveProperty('fontUrl');
        expect(result).not.toHaveProperty('wordColor');
        expect(result).not.toHaveProperty('lineColor');
        expect(result).not.toHaveProperty('boxColor');
        expect(result).not.toHaveProperty('outlineColor');
        expect(result).not.toHaveProperty('outlineWidth');
        expect(result).not.toHaveProperty('shadowColor');
        expect(result).not.toHaveProperty('shadowOffset');
        expect(result).not.toHaveProperty('maxWordsPerLine');
        expect(result).not.toHaveProperty('fadeIn');
        expect(result).not.toHaveProperty('fadeOut');
        expect(result).not.toHaveProperty('zIndex');
      });

      it('should handle minimal subtitle element', () => {
        const input = { type: 'subtitles' };
        const result = processSubtitleElement(input);
        
        expect(result).toEqual({ type: 'subtitles' });
      });

      it('should handle subtitle element with only content source', () => {
        const input = { type: 'subtitles', captions: 'simple.srt' };
        const result = processSubtitleElement(input);
        
        expect(result).toEqual({ 
          type: 'subtitles',
          captions: 'simple.srt'
        });
      });
    });

    describe('error handling and edge cases', () => {
      it.each([
        ['invalid duration string', { type: 'subtitles', text: 'Test', duration: 'infinite' }, { duration: -1 }],
        ['NaN duration', { type: 'subtitles', text: 'Test', duration: NaN }, { duration: -1 }],
        ['invalid start string', { type: 'subtitles', text: 'Test', start: 'start' }, { start: 0 }],
        ['NaN start', { type: 'subtitles', text: 'Test', start: NaN }, { start: 0 }],
        ['null captions preserved', { type: 'subtitles', captions: null }, { captions: null }],
        ['empty string text', { type: 'subtitles', text: '' }, { text: '' }],
        ['undefined properties ignored', { type: 'subtitles', captions: 'test.srt', fontSize: undefined, wordColor: undefined }, { captions: 'test.srt' }]
      ])('should handle invalid values gracefully: %s', (_, input, expectedSubset) => {
        const result = processSubtitleElement(input);
        expect(result).toMatchObject(expectedSubset);
      });

      it('should preserve unknown subtitle properties', () => {
        const input = {
          type: 'subtitles',
          captions: 'custom.srt',
          customSubtitleProperty: 'custom-value',
          experimentalFeature: true,
          metadata: { format: 'SRT', encoding: 'UTF-8', lines: 150 }
        };

        const result = processSubtitleElement(input);
        
        expect(result.customSubtitleProperty).toBe('custom-value');
        expect(result.experimentalFeature).toBe(true);
        expect(result.metadata).toEqual({ format: 'SRT', encoding: 'UTF-8', lines: 150 });
      });

      it('should handle complex settings edge cases', () => {
        const input = {
          type: 'subtitles',
          text: 'Edge case test',
          settings: null,           // null existing settings
          allCaps: undefined,       // undefined camelCase property
          fontSize: '',            // empty string numeric
          keywords: null,          // null array
          replace: undefined       // undefined object
        };

        const result = processSubtitleElement(input);
        
        expect(result.settings).toEqual({
          'font-size': '',
          keywords: null
        });
      });
    });

    describe('settings detection logic', () => {
      it('should detect settings properties in various forms', () => {
        const testCases = [
          // camelCase properties
          { type: 'subtitles', text: 'Test', fontFamily: 'Arial' },
          { type: 'subtitles', text: 'Test', allCaps: true },
          { type: 'subtitles', text: 'Test', wordColor: '#FF0000' },
          // kebab-case properties
          { type: 'subtitles', text: 'Test', 'font-family': 'Arial' },
          { type: 'subtitles', text: 'Test', 'all-caps': true },
          { type: 'subtitles', text: 'Test', 'word-color': '#FF0000' },
          // mixed case
          { type: 'subtitles', text: 'Test', fontSize: 20, 'line-color': '#FFFFFF' }
        ];

        testCases.forEach(input => {
          const result = processSubtitleElement(input);
          expect(result).toHaveProperty('settings');
          expect(typeof result.settings).toBe('object');
        });
      });

      it('should not create settings when no relevant properties exist', () => {
        const input = {
          type: 'subtitles',
          captions: 'file.srt',
          language: 'en',
          model: 'default',
          start: 5,
          duration: 20,
          comment: 'No settings properties here'
        };

        const result = processSubtitleElement(input);
        expect(result).not.toHaveProperty('settings');
      });
    });
  });
});