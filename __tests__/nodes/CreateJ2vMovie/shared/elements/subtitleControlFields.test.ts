// __tests__/nodes/CreateJ2vMovie/shared/elements/subtitleControlFields.test.ts

import { subtitleControlFields } from '../../../../../nodes/CreateJ2vMovie/shared/elementFields';
import { INodeProperties } from 'n8n-workflow';

describe('subtitleControlFields', () => {
  const SUBTITLE_FIELDS = subtitleControlFields as INodeProperties[];

  const MAIN_COLLECTION_SPECS = [
    ['subtitleContent', 'collection', 'Configure subtitle content and source options', 'Add Subtitle Source', 5],
    ['subtitleSettings', 'collection', 'Configure subtitle appearance and styling options', 'Add Subtitle Setting', 17],
  ] as const;

  const CONTENT_OPTION_SPECS = [
    ['contentSource', 'options', 'captions', 'How to provide subtitle content', false, undefined],
    ['captions', 'string', '', 'Subtitle file URL (SRT, VTT, ASS) or inline subtitle content', true, { rows: 6 }],
    ['text', 'string', '', 'Direct text input for subtitle content', true, { rows: 4 }],
    ['language', 'string', 'en', 'Language code for subtitle processing', false, undefined],
    ['model', 'options', 'default', 'AI model for automatic transcription from audio', false, undefined],
  ] as const;

  const SETTINGS_OPTION_SPECS = [
    ['allCaps', 'boolean', false, 'Convert all subtitle text to uppercase', false, undefined],
    ['position', 'options', 'bottom-center', 'Subtitle position on screen', false, undefined],
    ['fontSize', 'number', 24, 'Subtitle font size in pixels', false, { minValue: 12, maxValue: 100 }],
    ['fontFamily', 'string', 'Arial', 'Font family for subtitle text', false, undefined],
    ['fontUrl', 'string', '', 'Custom font URL (optional)', false, undefined],
    ['wordColor', 'color', '#ffffff', 'Color of the subtitle text', false, undefined],
    ['lineColor', 'color', '#ffffff', 'Color of text line/stroke', false, undefined],
    ['boxColor', 'color', '', 'Background box color', false, undefined],
    ['outlineColor', 'color', '#000000', 'Text outline/border color', false, undefined],
    ['outlineWidth', 'number', 1, 'Text outline width in pixels', false, { minValue: 0, maxValue: 10, numberPrecision: 1 }],
    ['shadowColor', 'color', '#000000', 'Text shadow color', false, undefined],
    ['shadowOffset', 'number', 0, 'Text shadow offset distance in pixels', false, { minValue: 0, maxValue: 20, numberPrecision: 1 }],
    ['maxWordsPerLine', 'number', 4, 'Maximum number of words displayed per subtitle line', false, { minValue: 1, maxValue: 20, numberPrecision: 0 }],
    ['x', 'number', 0, 'Custom X position', false, undefined],
    ['y', 'number', 0, 'Custom Y position', false, undefined],
    ['keywords', 'string', '', 'Comma-separated keywords to improve transcription accuracy', false, { rows: 3 }],
    ['replace', 'json', '{}', 'JSON object mapping words to replace', false, undefined],
  ] as const;

  const POSITION_OPTIONS_SPECS = [
    ['Bottom Center', 'bottom-center'],
    ['Top Center', 'top-center'],
    ['Center Center', 'center-center'],
    ['Custom (Set X/Y)', 'custom'],
  ] as const;

  const MODEL_OPTIONS_SPECS = [
    ['Default (Fast)', 'default'],
    ['Whisper (Accurate)', 'whisper'],
  ] as const;

  const INVALID_FIELD_NAMES = [
    '',
    'invalid-name',
    'InvalidName',
    'invalid_name',
    '123invalid',
    'invalid name',
    'invalid.name',
  ] as const;

  const INVALID_DISPLAY_NAMES = [
    '',
    'lowercase only',
    'UPPERCASE ONLY',
    'no spaces',
  ] as const;

  const VALID_HEX_COLORS = [
    '#000000',
    '#FFFFFF',
    '#FF0000',
    '#00FF00',
    '#0000FF',
    '#123456',
    '#ABCDEF',
    '#ffffff',
    '#abc',
    '#ABC',
  ] as const;

  const INVALID_HEX_COLORS = [
    'red',
    'rgb(255,0,0)',
    '#GGGGGG',
    '#12345',
    '#1234567',
    'ffffff',
    '#',
  ] as const;

  const NUMERIC_BOUNDARY_TESTS = [
    ['fontSize', 12, 100, [11, 101, -1, 0, 1000]],
    ['outlineWidth', 0, 10, [-1, 11, -10, 100]],
    ['shadowOffset', 0, 20, [-1, 21, -5, 50]],
    ['maxWordsPerLine', 1, 20, [0, 21, -1, 100]],
  ] as const;

  const JSON_VALIDATION_TESTS = [
    ['valid empty object', '{}', true],
    ['valid object with strings', '{"old": "new", "ML": "Machine Learning"}', true],
    ['valid nested object', '{"replacements": {"AI": "Artificial Intelligence"}}', true],
    ['invalid json - missing quotes', '{old: "new"}', false],
    ['invalid json - trailing comma', '{"old": "new",}', false],
    ['invalid json - unclosed brace', '{"old": "new"', false],
    ['invalid json - single quotes', "{'old': 'new'}", false],
    ['empty string', '', false],
    ['null value', 'null', true],
    ['array instead of object', '["item1", "item2"]', true],
  ] as const;

  describe('basic structure validation', () => {
    it('should export subtitle control fields array', () => {
      expect(Array.isArray(SUBTITLE_FIELDS)).toBe(true);
      expect(SUBTITLE_FIELDS.length).toBe(2);
    });

    test.each(MAIN_COLLECTION_SPECS)('should have %s collection with correct structure', (fieldName, expectedType, expectedDescription, expectedPlaceholder, expectedOptionsCount) => {
      const field = SUBTITLE_FIELDS.find(f => f.name === fieldName);
      
      expect(field).toBeDefined();
      expect(field!.type).toBe(expectedType);
      expect(String(field!.description || '')).toContain(expectedDescription);
      expect(String(field!.placeholder || '')).toBe(expectedPlaceholder);
      expect(field!.displayOptions).toEqual({ show: { type: ['subtitles'] } });
      expect(field!.default).toEqual({});
      expect(Array.isArray(field!.options)).toBe(true);
      expect(field!.options!.length).toBe(expectedOptionsCount);
    });

    it('should only show for subtitle element type', () => {
      SUBTITLE_FIELDS.forEach(field => {
        expect(field.displayOptions).toEqual({ show: { type: ['subtitles'] } });
      });
    });

    test.each(INVALID_FIELD_NAMES)('should not accept invalid field name: %s', (invalidName) => {
      const hasInvalidName = SUBTITLE_FIELDS.some(field => field.name === invalidName);
      expect(hasInvalidName).toBe(false);
    });
  });

  describe('subtitle content collection validation', () => {
    const contentField = SUBTITLE_FIELDS.find(f => f.name === 'subtitleContent')!;
    const contentOptions = contentField.options! as INodeProperties[];

    test.each(CONTENT_OPTION_SPECS)('should have %s option with correct properties', (optionName, expectedType, expectedDefault, expectedDescription, hasMultiline, expectedTypeOptions) => {
      const option = contentOptions.find(opt => opt.name === optionName);
      
      expect(option).toBeDefined();
      expect(option!.type).toBe(expectedType);
      expect(option!.default).toEqual(expectedDefault);
      expect(String(option!.description || '')).toContain(expectedDescription);
      expect(option!.displayName).toBeDefined();
      
      if (hasMultiline && expectedTypeOptions) {
        expect(option!.typeOptions?.rows).toBe(expectedTypeOptions.rows);
      }
      
      // Check conditional display options for captions and text fields
      if (option!.name === 'captions') {
        expect(option!.displayOptions).toEqual({ show: { contentSource: ['captions'] } });
      }
      if (option!.name === 'text') {
        expect(option!.displayOptions).toEqual({ show: { contentSource: ['text'] } });
      }
    });

    describe('positive model validation', () => {
      const modelOption = contentOptions.find(opt => opt.name === 'model')!;
      const modelChoices = modelOption.options! as any[];

      test.each(MODEL_OPTIONS_SPECS)('should support %s model option', (displayName, value) => {
        const modelChoice = modelChoices.find(opt => opt.value === value);
        expect(modelChoice).toBeDefined();
        expect(modelChoice.name).toBe(displayName);
      });

      it('should have valid default model option', () => {
        const defaultValue = String(modelOption.default);
        const defaultModel = modelChoices.find(opt => opt.value === defaultValue);
        expect(defaultModel).toBeDefined();
      });
    });

    describe('negative content validation', () => {
      it('should not have undefined or null options', () => {
        contentOptions.forEach(option => {
          expect(option).toBeDefined();
          expect(option).not.toBeNull();
          expect(option.name).toBeDefined();
          expect(option.displayName).toBeDefined();
          expect(option.type).toBeDefined();
        });
      });

      it('should not have empty option arrays for choice fields', () => {
        const choiceFields = contentOptions.filter(opt => opt.type === 'options');
        choiceFields.forEach(field => {
          expect(Array.isArray(field.options)).toBe(true);
          expect(field.options!.length).toBeGreaterThan(0);
        });
      });
    });
  });

  describe('subtitle settings collection validation', () => {
    const settingsField = SUBTITLE_FIELDS.find(f => f.name === 'subtitleSettings')!;
    const settingsOptions = settingsField.options! as INodeProperties[];

    test.each(SETTINGS_OPTION_SPECS)('should have %s option with correct configuration', (optionName, expectedType, expectedDefault, expectedDescription, isRequired, expectedTypeOptions) => {
      const option = settingsOptions.find(opt => opt.name === optionName);
      
      expect(option).toBeDefined();
      expect(option!.type).toBe(expectedType);
      expect(option!.default).toEqual(expectedDefault);
      expect(String(option!.description || '')).toContain(expectedDescription);
      expect(option!.displayName).toBeDefined();
      expect(Boolean(option!.required)).toBe(isRequired);
      
      if (expectedTypeOptions) {
        Object.entries(expectedTypeOptions).forEach(([key, value]) => {
          expect(option!.typeOptions?.[key as keyof typeof expectedTypeOptions]).toBe(value);
        });
      }
    });

    describe('positive position validation', () => {
      const positionOption = settingsOptions.find(opt => opt.name === 'position')!;
      const positionChoices = positionOption.options! as any[];

      test.each(POSITION_OPTIONS_SPECS)('should support %s position', (displayName, value) => {
        const posChoice = positionChoices.find(opt => opt.value === value);
        expect(posChoice).toBeDefined();
        expect(posChoice.name).toBe(displayName);
      });

      it('should have valid default position', () => {
        const defaultValue = String(positionOption.default);
        const defaultPos = positionChoices.find(opt => opt.value === defaultValue);
        expect(defaultPos).toBeDefined();
      });
    });

    describe('positive color validation', () => {
      const colorFields = settingsOptions.filter(opt => opt.type === 'color');

      test.each(VALID_HEX_COLORS)('should accept valid hex color: %s', (validColor) => {
        const hexPattern = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
        expect(hexPattern.test(validColor)).toBe(true);
      });

      it('should have valid default colors', () => {
        colorFields.forEach(field => {
          const defaultValue = String(field.default || '');
          if (defaultValue && defaultValue !== '') {
            const hexPattern = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
            expect(hexPattern.test(defaultValue)).toBe(true);
          }
        });
      });
    });

    describe('negative color validation', () => {
      test.each(INVALID_HEX_COLORS)('should reject invalid hex color: %s', (invalidColor) => {
        const hexPattern = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
        expect(hexPattern.test(invalidColor)).toBe(false);
      });
    });

    describe('boundary testing for numeric fields', () => {
      test.each(NUMERIC_BOUNDARY_TESTS)('should validate %s boundaries correctly', (fieldName, min, max, invalidValues) => {
        const option = settingsOptions.find(opt => opt.name === fieldName)!;
        
        expect(option.typeOptions?.minValue).toBe(min);
        expect(option.typeOptions?.maxValue).toBe(max);
        expect(Number(option.default)).toBeGreaterThanOrEqual(min);
        expect(Number(option.default)).toBeLessThanOrEqual(max);
        
        invalidValues.forEach(invalidValue => {
          expect(invalidValue < min || invalidValue > max).toBe(true);
        });
      });

      it('should have integer precision for count fields', () => {
        const maxWordsOption = settingsOptions.find(opt => opt.name === 'maxWordsPerLine')!;
        expect(maxWordsOption.typeOptions?.numberPrecision).toBe(0);
      });

      it('should have decimal precision for measurement fields', () => {
        const outlineWidthOption = settingsOptions.find(opt => opt.name === 'outlineWidth')!;
        const shadowOffsetOption = settingsOptions.find(opt => opt.name === 'shadowOffset')!;
        
        expect(outlineWidthOption.typeOptions?.numberPrecision).toBe(1);
        expect(shadowOffsetOption.typeOptions?.numberPrecision).toBe(1);
      });
    });

    describe('conditional display validation', () => {
      const xOption = settingsOptions.find(opt => opt.name === 'x')!;
      const yOption = settingsOptions.find(opt => opt.name === 'y')!;
      const regularOptions = settingsOptions.filter(opt => !['x', 'y'].includes(opt.name));

      it('should show x/y fields only when position is custom', () => {
        expect(xOption.displayOptions).toEqual({ show: { position: ['custom'] } });
        expect(yOption.displayOptions).toEqual({ show: { position: ['custom'] } });
      });

      it('should not have display conditions for non-positional fields', () => {
        regularOptions.forEach(option => {
          expect(option.displayOptions).toBeUndefined();
        });
      });
    });

    describe('JSON field validation', () => {
      const replaceOption = settingsOptions.find(opt => opt.name === 'replace')!;

      test.each(JSON_VALIDATION_TESTS)('should handle %s in replace field', (testName, jsonString, shouldBeValid) => {
        if (shouldBeValid) {
          expect(() => JSON.parse(jsonString)).not.toThrow();
        } else {
          expect(() => JSON.parse(jsonString)).toThrow();
        }
      });

      it('should have valid default JSON', () => {
        const defaultValue = String(replaceOption.default);
        expect(() => JSON.parse(defaultValue)).not.toThrow();
        expect(JSON.parse(defaultValue)).toEqual({});
      });
    });
  });

  describe('negative validation tests', () => {
    test.each(INVALID_DISPLAY_NAMES)('should not have invalid display name pattern: %s', (invalidDisplayName) => {
      const allOptions = SUBTITLE_FIELDS.flatMap(field => [field, ...(field.options! as INodeProperties[])]);
      const hasInvalidDisplayName = allOptions.some(option => String(option.displayName || '') === invalidDisplayName);
      expect(hasInvalidDisplayName).toBe(false);
    });

    it('should not have circular references in any nested structures', () => {
      expect(() => JSON.stringify(SUBTITLE_FIELDS)).not.toThrow();
      
      SUBTITLE_FIELDS.forEach(field => {
        expect(() => JSON.stringify(field)).not.toThrow();
        if (field.options) {
          expect(() => JSON.stringify(field.options)).not.toThrow();
        }
      });
    });

    it('should not have undefined required properties', () => {
      const allOptions = SUBTITLE_FIELDS.flatMap(field => [field, ...(field.options! as INodeProperties[])]);
      
      allOptions.forEach(option => {
        expect(option.name).toBeDefined();
        expect(option.displayName).toBeDefined();
        expect(option.type).toBeDefined();
        expect(option.default).toBeDefined();
        expect(typeof option.name).toBe('string');
        expect(typeof String(option.displayName || '')).toBe('string');
        expect(typeof option.type).toBe('string');
      });
    });

    it('should not have empty or malformed option arrays', () => {
      const choiceFields = SUBTITLE_FIELDS.flatMap(field => field.options! as INodeProperties[])
        .filter(option => option.type === 'options');
      
      choiceFields.forEach(field => {
        expect(Array.isArray(field.options)).toBe(true);
        expect(field.options!.length).toBeGreaterThan(0);
        
        (field.options! as any[]).forEach(option => {
          expect(option.name).toBeDefined();
          expect(option.value).toBeDefined();
          expect(typeof option.name).toBe('string');
          expect(option.name.trim()).not.toBe('');
        });
      });
    });

    it('should not accept non-collection type for main fields', () => {
      SUBTITLE_FIELDS.forEach(field => {
        expect(field.type).toBe('collection');
        expect(field.type).not.toBe('string');
        expect(field.type).not.toBe('number');
        expect(field.type).not.toBe('boolean');
        expect(field.type).not.toBe('options');
      });
    });
  });

  describe('edge cases and error conditions', () => {
    it('should handle missing or undefined field properties gracefully', () => {
      SUBTITLE_FIELDS.forEach(field => {
        expect(field.name).not.toBe('');
        expect(field.name).not.toBeNull();
        expect(field.name).not.toBeUndefined();
        
        if (field.options) {
          (field.options as INodeProperties[]).forEach(option => {
            expect(option.name).not.toBe('');
            expect(option.name).not.toBeNull();
            expect(option.name).not.toBeUndefined();
          });
        }
      });
    });

    it('should maintain proper camelCase naming convention', () => {
      const allOptions = SUBTITLE_FIELDS.flatMap(field => field.options! as INodeProperties[]);
      const camelCasePattern = /^[a-z][a-zA-Z0-9]*$/;
      
      allOptions.forEach(option => {
        expect(option.name).toMatch(camelCasePattern);
      });
    });

    it('should have consistent default value types matching field types', () => {
      const allOptions = SUBTITLE_FIELDS.flatMap(field => field.options! as INodeProperties[]);
      
      allOptions.forEach(option => {
        switch (option.type) {
          case 'boolean':
            expect(typeof option.default).toBe('boolean');
            break;
          case 'number':
            expect(typeof option.default).toBe('number');
            break;
          case 'string':
          case 'color':
            expect(typeof option.default).toBe('string');
            break;
          case 'json':
            expect(typeof option.default).toBe('string');
            expect(() => JSON.parse(String(option.default))).not.toThrow();
            break;
          case 'options':
            if (option.options && Array.isArray(option.options)) {
              const validValues = (option.options as any[]).map(opt => opt.value);
              expect(validValues).toContain(option.default);
            }
            break;
        }
      });
    });

    it('should handle subtitle-specific display options correctly', () => {
      SUBTITLE_FIELDS.forEach(field => {
        expect(field.displayOptions?.show?.type).toContain('subtitles');
        expect(field.displayOptions?.show?.type).not.toContain('text');
        expect(field.displayOptions?.show?.type).not.toContain('video');
        expect(field.displayOptions?.show?.type).not.toContain('audio');
      });
    });
  });

  describe('integration and performance', () => {
    it('should maintain efficient field ordering', () => {
      const fieldNames = SUBTITLE_FIELDS.map(f => f.name);
      expect(fieldNames).toEqual(['subtitleContent', 'subtitleSettings']);
    });

    it('should have reasonable option counts for performance', () => {
      SUBTITLE_FIELDS.forEach(field => {
        expect(field.options!.length).toBeLessThan(50);
        expect(field.options!.length).toBeGreaterThan(0);
      });
    });

    it('should support complete subtitle workflow requirements', () => {
      const contentOptions = (SUBTITLE_FIELDS.find(f => f.name === 'subtitleContent')!.options! as INodeProperties[]).map(opt => opt.name);
      const settingsOptions = (SUBTITLE_FIELDS.find(f => f.name === 'subtitleSettings')!.options! as INodeProperties[]).map(opt => opt.name);
      
      const requiredContentFields = ['contentSource', 'captions', 'text', 'language', 'model'];
      const requiredSettingsFields = ['fontSize', 'fontFamily', 'position', 'wordColor'];
      
      requiredContentFields.forEach(field => {
        expect(contentOptions).toContain(field);
      });
      
      requiredSettingsFields.forEach(field => {
        expect(settingsOptions).toContain(field);
      });
    });

    it('should maintain memory efficiency with no duplicate references', () => {
      const allFieldNames = SUBTITLE_FIELDS.flatMap(field => [
        field.name,
        ...(field.options! as INodeProperties[]).map(opt => opt.name)
      ]);
      
      const uniqueNames = new Set(allFieldNames);
      expect(uniqueNames.size).toBe(allFieldNames.length);
    });
  });
});