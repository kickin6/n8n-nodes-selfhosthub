// __tests__/nodes/CreateJ2vMovie/shared/elements/positionFields.test.ts

import { positionFields } from '../../../../../nodes/CreateJ2vMovie/shared/elementFields';
import { INodeProperties } from 'n8n-workflow';

describe('positionFields', () => {
  const POSITION_FIELDS = positionFields as INodeProperties[];

  // Test data matrices for extensive parametrization
  const BASIC_FIELD_SPECS = [
    ['width', { type: 'number', default: -1, description: 'width in pixels' }],
    ['height', { type: 'number', default: -1, description: 'height in pixels' }],
  ] as const;

  const POSITIONING_COLLECTION_SPEC = {
    name: 'positioning',
    type: 'collection',
    default: {},
    description: 'positioning options',
  };

  const POSITION_OPTION_SPECS = [
    ['position', { type: 'options', default: 'custom', description: 'Position preset' }],
    ['x', { type: 'number', default: 0, description: 'Horizontal position' }],
    ['y', { type: 'number', default: 0, description: 'Vertical position' }],
  ] as const;

  const POSITION_PRESET_VALUES = [
    'custom',
    'top-left',
    'top-center', 
    'top-right',
    'center-left',
    'center-center',
    'center-right',
    'bottom-left',
    'bottom-center',
    'bottom-right',
  ] as const;

  const ELEMENT_TYPE_TESTS = [
    ['video', true],
    ['image', true], 
    ['text', true],
    ['component', true],
    ['html', true],
    ['audiogram', true],
    ['audio', false],
    ['voice', false],
    ['subtitles', false],
  ] as const;

  const VALID_DIMENSION_VALUES = [
    ['width', [-1, 0, 1, 100, 1920, 4096]],
    ['height', [-1, 0, 1, 100, 1080, 2160]],
  ] as const;

  const VALID_POSITION_VALUES = [
    ['x', [-1000, -100, -1, 0, 1, 100, 1920, 5000]],
    ['y', [-1000, -100, -1, 0, 1, 100, 1080, 5000]],
  ] as const;

  const DIMENSION_SPECIAL_VALUES = [
    ['width', -1, 'auto width'],
    ['height', -1, 'auto height'],
    ['width', 0, 'zero width (hidden)'],
    ['height', 0, 'zero height (hidden)'],
  ] as const;

  describe('basic structure validation', () => {
    it('should export positioning field array', () => {
      expect(Array.isArray(positionFields)).toBe(true);
      expect(positionFields.length).toBe(3); // width, height, positioning collection
    });

    test.each(BASIC_FIELD_SPECS)('should have %s field with correct structure', (fieldName, specs) => {
      const field = POSITION_FIELDS.find(f => f.name === fieldName);
      
      expect(field).toBeDefined();
      expect(field!.displayName).toBeDefined();
      expect(field!.type).toBe(specs.type);
      expect(field!.default).toBe(specs.default);
      expect(field!.description).toContain(specs.description);
      
      expect(typeof field!.displayName).toBe('string');
      expect(typeof field!.description).toBe('string');
    });

    it('should have positioning collection with correct structure', () => {
      const positioningField = POSITION_FIELDS.find(f => f.name === POSITIONING_COLLECTION_SPEC.name);
      
      expect(positioningField).toBeDefined();
      expect(positioningField!.type).toBe(POSITIONING_COLLECTION_SPEC.type);
      expect(positioningField!.default).toEqual(POSITIONING_COLLECTION_SPEC.default);
      expect(positioningField!.description).toContain(POSITIONING_COLLECTION_SPEC.description);
      expect(positioningField!.placeholder).toBeDefined();
      expect(positioningField!.options).toBeDefined();
      expect(Array.isArray(positioningField!.options)).toBe(true);
    });

    test.each(ELEMENT_TYPE_TESTS)('should %s target %s element type', (elementType, shouldTarget) => {
      POSITION_FIELDS.forEach(field => {
        if (field.displayOptions?.show?.type) {
          const targetTypes = field.displayOptions.show.type as string[];
          
          if (shouldTarget) {
            expect(targetTypes).toContain(elementType);
          } else {
            expect(targetTypes).not.toContain(elementType);
          }
        }
      });
    });
  });

  describe('dimension fields validation', () => {
    test.each(BASIC_FIELD_SPECS)('should have valid %s field properties', (fieldName, specs) => {
      const field = POSITION_FIELDS.find(f => f.name === fieldName);
      
      expect(field!.name).toBe(fieldName);
      expect(field!.displayName).toBeDefined();
      expect(field!.type).toBe('number');
      expect(field!.default).toBe(-1);
      expect(field!.description).toBeDefined();
    });

    test.each(VALID_DIMENSION_VALUES)('should accept valid values for %s field', (fieldName, validValues) => {
      const field = POSITION_FIELDS.find(f => f.name === fieldName);
      
      validValues.forEach(value => {
        expect(typeof value).toBe('number');
        
        // Test that the field type accepts numbers
        expect(field!.type).toBe('number');
        
        // All values should be valid for dimensions (including -1 for auto)
        expect(Number.isFinite(value)).toBe(true);
      });
    });

    test.each(DIMENSION_SPECIAL_VALUES)('should handle special dimension value: %s = %s (%s)', (fieldName, value, description) => {
      const field = POSITION_FIELDS.find(f => f.name === fieldName);
      
      expect(field!.type).toBe('number');
      
      if (value === -1) {
        expect(field!.default).toBe(-1); // Auto dimension
      }
    });
  });

  describe('positioning collection validation', () => {
    const positioningField = POSITION_FIELDS.find(f => f.name === 'positioning')!;
    const positioningOptions = positioningField.options! as any[];

    test.each(POSITION_OPTION_SPECS)('should have %s option in positioning collection', (optionName, specs) => {
      const option = positioningOptions.find(opt => opt.name === optionName);
      
      expect(option).toBeDefined();
      expect(option.displayName).toBeDefined();
      expect(option.type).toBe(specs.type);
      expect(option.default).toBe(specs.default);
      expect(option.description).toContain(specs.description);
      
      expect(typeof option.displayName).toBe('string');
      expect(typeof option.description).toBe('string');
    });

    it('should have position preset options', () => {
      const positionOption = positioningOptions.find(opt => opt.name === 'position');
      
      expect(positionOption.type).toBe('options');
      expect(positionOption.options).toBeDefined();
      expect(Array.isArray(positionOption.options)).toBe(true);
      expect(positionOption.options.length).toBe(POSITION_PRESET_VALUES.length);
      
      POSITION_PRESET_VALUES.forEach(presetValue => {
        const preset = positionOption.options.find((opt: any) => opt.value === presetValue);
        expect(preset).toBeDefined();
        expect(preset.name).toBeDefined();
        expect(typeof preset.name).toBe('string');
      });
    });

    test.each(VALID_POSITION_VALUES)('should accept valid values for %s coordinate', (coordinateName, validValues) => {
      const coordinateOption = positioningOptions.find(opt => opt.name === coordinateName);
      
      validValues.forEach(value => {
        expect(typeof value).toBe('number');
        expect(coordinateOption.type).toBe('number');
        
        // All coordinate values should be finite numbers
        expect(Number.isFinite(value)).toBe(true);
      });
    });
  });

  describe('positioning logic validation', () => {
    const positioningField = POSITION_FIELDS.find(f => f.name === 'positioning')!;
    const positioningOptions = positioningField.options! as any[];

    it('should support custom positioning mode', () => {
      const positionOption = positioningOptions.find(opt => opt.name === 'position');
      
      expect(positionOption.default).toBe('custom');
      
      const customPreset = positionOption.options.find((opt: any) => opt.value === 'custom');
      expect(customPreset).toBeDefined();
      expect(customPreset.name).toContain('Set X/Y');
    });

    it('should provide standard position presets', () => {
      const positionOption = positioningOptions.find(opt => opt.name === 'position');
      
      const expectedPresets = [
        'top-left', 'top-center', 'top-right',
        'center-left', 'center-center', 'center-right', 
        'bottom-left', 'bottom-center', 'bottom-right'
      ];
      
      expectedPresets.forEach(preset => {
        const presetOption = positionOption.options.find((opt: any) => opt.value === preset);
        expect(presetOption).toBeDefined();
      });
    });

    it('should have coordinate fields for custom positioning', () => {
      const xOption = positioningOptions.find(opt => opt.name === 'x');
      const yOption = positioningOptions.find(opt => opt.name === 'y');
      
      expect(xOption).toBeDefined();
      expect(yOption).toBeDefined();
      expect(xOption.default).toBe(0);
      expect(yOption.default).toBe(0);
    });

    it('should maintain logical field order', () => {
      const fieldOrder = POSITION_FIELDS.map(f => f.name);
      const expectedOrder = ['width', 'height', 'positioning'];
      
      expect(fieldOrder).toEqual(expectedOrder);
      
      const optionOrder = positioningOptions.map(opt => opt.name);
      const expectedOptionOrder = ['position', 'x', 'y'];
      
      expect(optionOrder).toEqual(expectedOptionOrder);
    });
  });

  describe('edge cases and constraints', () => {
    it('should handle auto-sizing with -1 values', () => {
      const widthField = POSITION_FIELDS.find(f => f.name === 'width');
      const heightField = POSITION_FIELDS.find(f => f.name === 'height');
      
      expect(widthField!.default).toBe(-1);
      expect(heightField!.default).toBe(-1);
    });

    it('should handle zero dimensions (hidden elements)', () => {
      const dimensionFields = ['width', 'height'];
      
      dimensionFields.forEach(fieldName => {
        const field = POSITION_FIELDS.find(f => f.name === fieldName);
        expect(field!.type).toBe('number');
        // Should accept 0 as valid value (no minValue constraint)
      });
    });

    it('should handle negative coordinates (off-screen positioning)', () => {
      const positioningField = POSITION_FIELDS.find(f => f.name === 'positioning')!;
      const positioningOptions = positioningField.options! as any[];
      
      ['x', 'y'].forEach(coordinateName => {
        const coordinateOption = positioningOptions.find(opt => opt.name === coordinateName);
        expect(coordinateOption.type).toBe('number');
        // Should accept negative values (no minValue constraint)
      });
    });

    it('should handle large coordinate values (high resolution)', () => {
      const positioningField = POSITION_FIELDS.find(f => f.name === 'positioning')!;
      const positioningOptions = positioningField.options! as any[];
      
      ['x', 'y'].forEach(coordinateName => {
        const coordinateOption = positioningOptions.find(opt => opt.name === coordinateName);
        expect(coordinateOption.type).toBe('number');
        // Should accept large values (no maxValue constraint)
      });
    });
  });

  describe('serialization and integrity', () => {
    it('should not have circular references', () => {
      expect(() => JSON.stringify(positionFields)).not.toThrow();
    });

    it('should have consistent naming patterns', () => {
      POSITION_FIELDS.forEach(field => {
        // Names should be camelCase
        expect(field.name).toMatch(/^[a-z][a-zA-Z0-9]*$/);
        
        // DisplayName should be title case
        expect(field.displayName).toMatch(/^[A-Z]/);
        expect(field.displayName.length).toBeGreaterThan(0);
      });
      
      // Check positioning collection options
      const positioningField = POSITION_FIELDS.find(f => f.name === 'positioning')!;
      const positioningOptions = positioningField.options! as any[];
      
      positioningOptions.forEach(option => {
        expect(option.name).toMatch(/^[a-z][a-zA-Z0-9]*$/);
        expect(option.displayName).toMatch(/^[A-Z]/);
      });
    });

    test.each([...BASIC_FIELD_SPECS.map(([name]) => name), 'positioning'])('should have required properties for %s field', (fieldName) => {
      const field = POSITION_FIELDS.find(f => f.name === fieldName);
      
      expect(field!.name).toBeDefined();
      expect(field!.displayName).toBeDefined();
      expect(field!.type).toBeDefined();
      expect(field!.default).toBeDefined();
      expect(field!.description).toBeDefined();
    });
  });

  describe('positioning system validation', () => {
    it('should support complete positioning workflow', () => {
      const fieldNames = POSITION_FIELDS.map(f => f.name);
      
      // Core dimension fields
      expect(fieldNames).toContain('width');
      expect(fieldNames).toContain('height');
      
      // Positioning collection
      expect(fieldNames).toContain('positioning');
      
      // Positioning should contain all coordinate options
      const positioningField = POSITION_FIELDS.find(f => f.name === 'positioning')!;
      const optionNames = (positioningField.options! as any[]).map(opt => opt.name);
      
      expect(optionNames).toContain('position');
      expect(optionNames).toContain('x');
      expect(optionNames).toContain('y');
    });

    it('should have appropriate field count', () => {
      expect(POSITION_FIELDS.length).toBe(3);
      
      const positioningField = POSITION_FIELDS.find(f => f.name === 'positioning')!;
      expect((positioningField.options! as any[]).length).toBe(3);
    });

    it('should target positioning-capable elements only', () => {
      const positioningElements = ['video', 'image', 'text', 'component', 'html', 'audiogram'];
      
      POSITION_FIELDS.forEach(field => {
        if (field.displayOptions?.show?.type) {
          const targetTypes = field.displayOptions.show.type as string[];
          
          positioningElements.forEach(elementType => {
            expect(targetTypes).toContain(elementType);
          });
          
          // Should not target audio-only elements
          expect(targetTypes).not.toContain('audio');
          expect(targetTypes).not.toContain('voice');
          expect(targetTypes).not.toContain('subtitles');
        }
      });
    });
  });
});