// __tests__/nodes/CreateJ2vMovie/presentation/fields.test.ts

import { elementFields, elementCollection } from '../../../../nodes/CreateJ2vMovie/presentation/fields';
import { INodeProperties } from 'n8n-workflow';

describe('fields', () => {

  describe('export architecture', () => {
    it('should export elementFields as array of 71 field definitions', () => {
      expect(Array.isArray(elementFields)).toBe(true);
      expect(elementFields.length).toBe(71);

      elementFields.forEach((field: INodeProperties, index: number) => {
        expect(field).toHaveProperty('name');
        expect(field).toHaveProperty('type');
        expect(field).toHaveProperty('displayName');
        expect(typeof field.name).toBe('string');
        expect(typeof field.type).toBe('string');
        expect(typeof field.displayName).toBe('string');
      });
    });

    it('should export elementCollection as fixedCollection structure', () => {
      expect(elementCollection).toBeDefined();
      expect(elementCollection.type).toBe('fixedCollection');
      expect(elementCollection.displayName).toBe('Elements');
      expect(Array.isArray(elementCollection.options)).toBe(true);

      if (elementCollection.options && elementCollection.options.length > 0) {
        const collectionOption = elementCollection.options[0] as any;
        expect(collectionOption.name).toBe('elementValues');
        expect(Array.isArray(collectionOption.values)).toBe(true);
        expect(collectionOption.values).toBe(elementFields);
      }
    });
  });

  describe('string field validation', () => {
    const stringFields = [
      'src', 'prompt', 'text', 'component', 'html', 'voice'
    ];

    test.each(stringFields)('should validate %s string field', (fieldName) => {
      const fields = elementFields.filter(f => f.name === fieldName);
      expect(fields.length).toBeGreaterThan(0);

      fields.forEach(field => {
        expect(field.type).toBe('string');
        expect(typeof field.default).toBe('string');
        expect(field.description).toBeDefined();
        expect(typeof field.description).toBe('string');
      });
    });
  });

  describe('number field validation', () => {
    const numberFieldTests = [
      { name: 'start', min: 0, max: undefined, default: 0, precision: 2 },
      { name: 'duration', min: undefined, max: undefined, default: -1, precision: 2 },
      { name: 'extraTime', min: 0, max: undefined, default: 0, precision: 2 },
      { name: 'fadeIn', min: 0, max: undefined, default: 0, precision: 2 },
      { name: 'fadeOut', min: 0, max: undefined, default: 0, precision: 2 },
      { name: 'x', min: undefined, max: undefined, default: 0, precision: 0 },
      { name: 'y', min: undefined, max: undefined, default: 0, precision: 0 },
      { name: 'width', min: undefined, max: undefined, default: -1, precision: 0 },
      { name: 'height', min: undefined, max: undefined, default: -1, precision: 0 },
      { name: 'zIndex', min: -99, max: 99, default: 0, precision: undefined },
      { name: 'volume', min: 0, max: 10, default: 1, precision: 2 },
      { name: 'seek', min: 0, max: undefined, default: 0, precision: 2 },
      { name: 'loop', min: -1, max: undefined, default: 0, precision: undefined },
      { name: 'panDistance', min: 0.01, max: 0.5, default: 0.1, precision: 2 },
      { name: 'zoom', min: -10, max: 10, default: 0, precision: 1 },
      { name: 'wait', min: 0, max: 5, default: 2, precision: 1 },
      { name: 'opacity', min: 0, max: 1, default: 0.5, precision: 2 },
      { name: 'amplitude', min: 0, max: 10, default: 5, precision: 1 }
    ];

    test.each(numberFieldTests)('should validate $name number field', ({ name, min, max, default: defaultVal, precision }) => {
      const field = elementFields.find(f => f.name === name);
      expect(field).toBeDefined();
      expect(field!.type).toBe('number');
      expect(field!.default).toBe(defaultVal);

      if (field!.typeOptions) {
        const opts = field!.typeOptions as any;
        if (min !== undefined) {
          expect(opts.minValue).toBe(min);
        }
        if (max !== undefined) {
          expect(opts.maxValue).toBe(max);
        }
        if (precision !== undefined) {
          expect(opts.numberPrecision).toBe(precision);
        }
      }
    });
  });

  describe('boolean field validation', () => {
    const booleanFields = [
      'showAudioControls', 'muted', 'flipHorizontal', 'flipVertical',
      'showVisualEffects', 'showVoiceSettings', 'tailwindcss',
      'showImageGeneration', 'showAdvancedSettings', 'cache', 'panCrop'
    ];

    test.each(booleanFields)('should validate %s boolean field', (fieldName) => {
      const field = elementFields.find(f => f.name === fieldName);
      expect(field).toBeDefined();
      expect(field!.type).toBe('boolean');
      expect(typeof field!.default).toBe('boolean');
      expect(field!.description).toBeDefined();
    });
  });

  describe('options field validation', () => {
    const optionsFieldTests = [
      {
        name: 'type',
        values: ['video', 'audio', 'image', 'text', 'voice', 'component', 'html', 'audiogram'],
        default: 'video'
      },
      {
        name: 'textStyle',
        values: ['001', '002', '003', '004', '005', '006', '007', '008', '009', '010'],
        default: '001'
      },
      {
        name: 'position',
        values: ['top-left', 'top-center', 'top-right', 'center-left', 'center-center', 'center-right', 'bottom-left', 'bottom-center', 'bottom-right', 'custom'],
        default: 'center-center'
      },
      {
        name: 'resize',
        values: ['natural', 'cover', 'contain', 'fill', 'fit'],
        default: 'cover'
      },
      {
        name: 'voice',
        values: undefined, // String field, not options
        default: 'en-US-AriaNeural'
      },
      {
        name: 'model',
        values: ['azure', 'elevenlabs', 'elevenlabs-flash-v2-5'],
        default: 'azure'
      },
      {
        name: 'pan',
        values: ['', 'left', 'right', 'top', 'bottom', 'top-left', 'top-right', 'bottom-left', 'bottom-right'],
        default: ''
      }
    ];

    test.each(optionsFieldTests)('should validate $name options field', ({ name, values, default: defaultVal }) => {
      const field = elementFields.find(f => f.name === name);
      expect(field).toBeDefined();

      if (values) {
        expect(field!.type).toBe('options');
        expect(field!.default).toBe(defaultVal);
        expect(Array.isArray(field!.options)).toBe(true);

        const actualValues = (field!.options! as any[]).map(opt => opt.value);
        expect(actualValues).toEqual(values);
        expect(values).toContain(defaultVal);
      } else {
        // String field, not options
        expect(field!.type).toBe('string');
        expect(field!.default).toBe(defaultVal);
      }
    });
  });

  describe('color field validation', () => {
    const colorFields = [
      { name: 'color', default: '#ffffff' }
    ];

    test.each(colorFields)('should validate $name color field', ({ name, default: defaultVal }) => {
      const field = elementFields.find(f => f.name === name);
      expect(field).toBeDefined();
      expect(field!.type).toBe('color');
      expect(field!.default).toBe(defaultVal);
    });
  });

  describe('json field validation', () => {
    const jsonFields = [
      'textSettings', 'modelSettings', 'crop', 'rotate', 'chromaKey', 'correction', 'settings', 'variables'
    ];

    test.each(jsonFields)('should validate %s json field', (fieldName) => {
      const fields = elementFields.filter(f => f.name === fieldName);
      if (fields.length > 0) {
        fields.forEach(field => {
          expect(field.type).toBe('json');
          expect(() => JSON.parse(field.default as string)).not.toThrow();
        });
      }
    });
  });

  describe('notice field validation', () => {
    const noticeFields = [
      'timingDivider', 'layoutDivider', 'audioControlsDivider', 'voiceSettingsDivider',
      'aiImageSettingsDivider', 'visualEffectsDivider', 'tailwindcssDivider',
      'audiogramSettingsDivider', 'advancedSettingsDivider'
    ];

    test.each(noticeFields)('should validate %s notice field', (fieldName) => {
      const field = elementFields.find(f => f.name === fieldName);
      expect(field).toBeDefined();
      expect(field!.type).toBe('notice');
      expect(field!.default).toBe('');
      expect(field!.description).toBeDefined();
    });
  });

  describe('display conditions', () => {
    const elementTypeTests = [
      { type: 'video', expectedFields: ['src', 'position', 'width', 'height', 'resize', 'showAudioControls', 'showVisualEffects'] },
      { type: 'audio', expectedFields: ['src', 'showAudioControls'] },
      { type: 'image', expectedFields: ['src', 'prompt', 'position', 'width', 'height', 'resize', 'showVisualEffects', 'showImageGeneration'] },
      { type: 'text', expectedFields: ['text', 'textStyle', 'textSettings', 'position', 'width', 'height'] },
      { type: 'voice', expectedFields: ['text', 'showAudioControls', 'showVoiceSettings'] },
      { type: 'component', expectedFields: ['component', 'settings', 'position', 'width', 'height', 'resize'] },
      { type: 'html', expectedFields: ['html', 'src', 'tailwindcss', 'wait', 'position', 'width', 'height', 'resize'] },
      { type: 'audiogram', expectedFields: ['src', 'color', 'opacity', 'amplitude', 'position', 'width', 'height', 'resize'] }
    ];

    test.each(elementTypeTests)('should have proper fields for $type elements', ({ type, expectedFields }) => {
      const fieldsForType = elementFields.filter(f => {
        if (!f.displayOptions?.show?.type) return true; // Universal fields
        const typeCondition = f.displayOptions.show.type;
        return Array.isArray(typeCondition) && typeCondition.includes(type);
      });

      expect(fieldsForType.length).toBeGreaterThan(2);

      expectedFields.forEach(expectedField => {
        const hasField = fieldsForType.some(f => f.name === expectedField);
        expect(hasField).toBe(true);
      });
    });
  });

  describe('required field validation', () => {
    const requiredFieldTests = [
      { fieldName: 'src', elementType: 'video', required: true },
      { fieldName: 'src', elementType: 'audio', required: true },
      { fieldName: 'src', elementType: 'image', required: false },
      { fieldName: 'text', elementType: 'text', required: true },
      { fieldName: 'text', elementType: 'voice', required: true },
      { fieldName: 'component', elementType: 'component', required: true },
      { fieldName: 'html', elementType: 'html', required: false },
      { fieldName: 'src', elementType: 'audiogram', required: true }
    ];

    test.each(requiredFieldTests)('should validate $fieldName requirement for $elementType', ({ fieldName, elementType, required }) => {
      const field = elementFields.find(f => {
        if (f.name !== fieldName) return false;
        if (!f.displayOptions?.show?.type) return false;
        const typeCondition = f.displayOptions.show.type;
        return Array.isArray(typeCondition) && typeCondition.includes(elementType);
      });

      expect(field).toBeDefined();
      if (required) {
        expect(field!.required).toBe(true);
      } else {
        expect(field!.required).toBeFalsy();
      }
    });
  });

  describe('numeric boundary testing', () => {
    it('should validate volume boundaries', () => {
      const volumeField = elementFields.find(f => f.name === 'volume');
      const opts = volumeField!.typeOptions as any;

      // Test boundary values
      expect(-1).toBeLessThan(opts.minValue);
      expect(0).toBeGreaterThanOrEqual(opts.minValue);
      expect(10).toBeLessThanOrEqual(opts.maxValue);
      expect(11).toBeGreaterThan(opts.maxValue);
    });

    it('should validate zoom boundaries', () => {
      const zoomField = elementFields.find(f => f.name === 'zoom');
      const opts = zoomField!.typeOptions as any;

      expect(-11).toBeLessThan(opts.minValue);
      expect(-10).toBeGreaterThanOrEqual(opts.minValue);
      expect(10).toBeLessThanOrEqual(opts.maxValue);
      expect(11).toBeGreaterThan(opts.maxValue);
    });
  });

  describe('integration and consistency', () => {
    it('should maintain complete coverage of all 71 fields', () => {
      expect(elementFields.length).toBe(71);

      elementFields.forEach((field, index) => {
        expect(field.name).toBeDefined();
        expect(field.displayName).toBeDefined();
        expect(field.type).toBeDefined();
        expect(field.default).toBeDefined();
        expect(field.description).toBeDefined();
      });
    });

    it('should have proper field ordering', () => {
      expect(elementFields[0].name).toBe('type');
    });

    it('should serialize without circular references', () => {
      expect(() => JSON.stringify(elementFields)).not.toThrow();
      expect(() => JSON.stringify(elementCollection)).not.toThrow();
    });

    it('should have consistent naming patterns', () => {
      elementFields.forEach(field => {
        expect(field.name).toMatch(/^[a-z][a-zA-Z0-9]*$/);
        expect(field.displayName.length).toBeGreaterThan(0);
        expect(field.description!.length).toBeGreaterThanOrEqual(10);
      });
    });

    it('should handle toggle field dependencies', () => {
      const toggleFields = elementFields.filter(f =>
        f.type === 'boolean' && f.name.startsWith('show')
      );

      expect(toggleFields.length).toBeGreaterThan(3);

      toggleFields.forEach(toggleField => {
        expect(toggleField.type).toBe('boolean');
        expect(typeof toggleField.default).toBe('boolean');
      });
    });

    it('should have flattened position and size fields always visible for visual elements', () => {
      const positionField = elementFields.find(f => f.name === 'position');
      const widthField = elementFields.find(f => f.name === 'width');
      const heightField = elementFields.find(f => f.name === 'height');
      const resizeField = elementFields.find(f => f.name === 'resize');

      expect(positionField).toBeDefined();
      expect(widthField).toBeDefined();
      expect(heightField).toBeDefined();
      expect(resizeField).toBeDefined();

      expect(positionField!.displayOptions?.show?.showPositioning).toBeUndefined();
      expect(widthField!.displayOptions?.show?.showPositioning).toBeUndefined();
      expect(heightField!.displayOptions?.show?.showPositioning).toBeUndefined();
      expect(resizeField!.displayOptions?.show?.showPositioning).toBeUndefined();

      const visualTypes = ['video', 'image', 'text', 'component', 'html', 'audiogram'];
      expect(positionField!.displayOptions?.show?.type).toEqual(visualTypes);
      expect(widthField!.displayOptions?.show?.type).toEqual(visualTypes);
      expect(heightField!.displayOptions?.show?.type).toEqual(visualTypes);
      expect(resizeField!.displayOptions?.show?.type).toEqual(['video', 'image', 'component', 'html', 'audiogram']);
    });
  });
});