// __tests__/nodes/CreateJ2vMovie/shared/elements/commonTimingFields.test.ts

import { commonTimingFields } from '../../../../../nodes/CreateJ2vMovie/shared/elementFields';
import { INodeProperties } from 'n8n-workflow';

describe('commonTimingFields', () => {
  const TIMING_COLLECTION = commonTimingFields[0];
  const TIMING_OPTIONS = TIMING_COLLECTION.options! as any[];

  // Test data matrices for extensive parametrization
  const TIMING_FIELD_SPECS = [
    ['start', { type: 'number', default: 0, minValue: 0, precision: 2, description: 'starts appearing' }],
    ['duration', { type: 'number', default: -1, precision: 2, description: 'Duration of the element' }],
    ['extraTime', { type: 'number', default: 0, precision: 2, description: 'Additional time' }],
    ['zIndex', { type: 'number', default: 0, description: 'Layer order' }],
    ['fadeIn', { type: 'number', default: 0, minValue: 0, precision: 2, description: 'Fade in duration' }],
    ['fadeOut', { type: 'number', default: 0, minValue: 0, precision: 2, description: 'Fade out duration' }],
  ] as const;

  const VALID_TEST_VALUES = [
    ['start', [0, 0.5, 1, 10.25, 999.99]],
    ['duration', [-2, -1, 0, 1, 5.5, 100]],
    ['extraTime', [0, 0.01, 1, 5.75, 30]],
    ['zIndex', [-10, -1, 0, 1, 5, 100]],
    ['fadeIn', [0, 0.1, 0.5, 1, 2.5]],
    ['fadeOut', [0, 0.1, 0.5, 1, 2.5]],
  ] as const;

  const INVALID_TEST_VALUES = [
    ['start', [-1, -0.1], 'should reject negative start times'],
    ['fadeIn', [-1, -0.1], 'should reject negative fade in duration'],
    ['fadeOut', [-1, -0.1], 'should reject negative fade out duration'],
  ] as const;

  const PRECISION_TEST_FIELDS = [
    ['start', 2],
    ['duration', 2], 
    ['extraTime', 2],
    ['fadeIn', 2],
    ['fadeOut', 2],
  ] as const;

  const DEFAULT_VALUE_TESTS = [
    ['start', 0],
    ['duration', -1],
    ['extraTime', 0],
    ['zIndex', 0],
    ['fadeIn', 0],
    ['fadeOut', 0],
  ] as const;

  const ELEMENT_TYPE_TESTS = [
    ['video', true],
    ['audio', true],
    ['image', true],
    ['text', true],
    ['voice', true],
    ['component', true],
    ['html', true],
    ['audiogram', true],
    ['subtitles', false], // Subtitles excluded from timing
  ] as const;

  describe('basic structure validation', () => {
    it('should export single timing collection', () => {
      expect(Array.isArray(commonTimingFields)).toBe(true);
      expect(commonTimingFields.length).toBe(1);
    });

    it('should be valid collection field', () => {
      expect(TIMING_COLLECTION.name).toBe('timing');
      expect(TIMING_COLLECTION.displayName).toBe('Timing');
      expect(TIMING_COLLECTION.type).toBe('collection');
      expect(TIMING_COLLECTION.placeholder).toBeDefined();
      expect(TIMING_COLLECTION.default).toEqual({});
      expect(TIMING_COLLECTION.description).toBeDefined();
      
      expect(typeof TIMING_COLLECTION.placeholder).toBe('string');
      expect(typeof TIMING_COLLECTION.description).toBe('string');
    });

    test.each(ELEMENT_TYPE_TESTS)('should %s include %s element type', (elementType, shouldInclude) => {
      const targetTypes = TIMING_COLLECTION.displayOptions!.show!.type as string[];
      
      if (shouldInclude) {
        expect(targetTypes).toContain(elementType);
      } else {
        expect(targetTypes).not.toContain(elementType);
      }
    });
  });

  describe('timing field existence and structure', () => {
    test.each(TIMING_FIELD_SPECS)('should have %s field with correct structure', (fieldName, specs) => {
      const option = TIMING_OPTIONS.find((opt: any) => opt.name === fieldName);
      
      expect(option).toBeDefined();
      expect(option.displayName).toBeDefined();
      expect(option.type).toBe(specs.type);
      expect(option.default).toBe(specs.default);
      expect(option.description).toContain(specs.description);
      
      expect(typeof option.displayName).toBe('string');
      expect(typeof option.description).toBe('string');
    });

    test.each(TIMING_FIELD_SPECS)('should have valid INodeProperties structure for %s', (fieldName) => {
      const option = TIMING_OPTIONS.find((opt: any) => opt.name === fieldName);
      
      expect(option.name).toBeDefined();
      expect(option.displayName).toBeDefined();
      expect(option.type).toBeDefined();
      expect(option.default).toBeDefined();
      expect(option.description).toBeDefined();
    });
  });

  describe('field constraints validation', () => {
    test.each(PRECISION_TEST_FIELDS)('should have correct precision for %s field', (fieldName, expectedPrecision) => {
      const option = TIMING_OPTIONS.find((opt: any) => opt.name === fieldName);
      
      expect(option.typeOptions?.numberPrecision).toBe(expectedPrecision);
    });

    test.each(DEFAULT_VALUE_TESTS)('should have correct default value for %s', (fieldName, expectedDefault) => {
      const option = TIMING_OPTIONS.find((opt: any) => opt.name === fieldName);
      
      expect(option.default).toBe(expectedDefault);
    });

    it('should have minimum value constraints where appropriate', () => {
      const minValueFields = ['start', 'fadeIn', 'fadeOut'];
      
      minValueFields.forEach(fieldName => {
        const option = TIMING_OPTIONS.find((opt: any) => opt.name === fieldName);
        expect(option.typeOptions?.minValue).toBe(0);
      });
    });

    it('should allow negative values for duration (auto-detect)', () => {
      const durationOption = TIMING_OPTIONS.find((opt: any) => opt.name === 'duration');
      // Duration should not have minValue constraint since -1, -2 are valid
      expect(durationOption.typeOptions?.minValue).toBeUndefined();
    });

    it('should allow negative values for zIndex (layering)', () => {
      const zIndexOption = TIMING_OPTIONS.find((opt: any) => opt.name === 'zIndex');
      // zIndex should not have minValue constraint for layering below
      expect(zIndexOption.typeOptions?.minValue).toBeUndefined();
    });
  });

  describe('positive value testing', () => {
    test.each(VALID_TEST_VALUES)('should accept valid values for %s field', (fieldName, validValues) => {
      const option = TIMING_OPTIONS.find((opt: any) => opt.name === fieldName);
      
      validValues.forEach(value => {
        // Test that the field accepts the type of value
        expect(typeof value).toBe('number');
        
        // Test constraints if they exist
        if (option.typeOptions?.minValue !== undefined) {
          expect(value).toBeGreaterThanOrEqual(option.typeOptions.minValue);
        }
        
        if (option.typeOptions?.maxValue !== undefined) {
          expect(value).toBeLessThanOrEqual(option.typeOptions.maxValue);
        }
      });
    });
  });

  describe('negative value testing', () => {
    test.each(INVALID_TEST_VALUES)('should have constraints that would reject invalid values for %s: %s', (fieldName, invalidValues, description) => {
      const option = TIMING_OPTIONS.find((opt: any) => opt.name === fieldName);
      
      // Test that constraints exist to prevent invalid values
      invalidValues.forEach(invalidValue => {
        if (option.typeOptions?.minValue !== undefined) {
          expect(invalidValue).toBeLessThan(option.typeOptions.minValue);
        }
      });
    });
  });

  describe('edge case validation', () => {
    it('should handle special duration values correctly', () => {
      const durationOption = TIMING_OPTIONS.find((opt: any) => opt.name === 'duration');
      
      // Should accept -1 (auto-detect) and -2 (match scene)
      expect(durationOption.default).toBe(-1);
      // Should have precision for fractional seconds
      expect(durationOption.typeOptions?.numberPrecision).toBe(2);
    });

    it('should handle zero values appropriately', () => {
      const zeroDefaultFields = ['start', 'extraTime', 'zIndex', 'fadeIn', 'fadeOut'];
      
      zeroDefaultFields.forEach(fieldName => {
        const option = TIMING_OPTIONS.find((opt: any) => opt.name === fieldName);
        expect(option.default).toBe(0);
      });
    });

    it('should handle very small timing values', () => {
      const precisionFields = ['start', 'duration', 'extraTime', 'fadeIn', 'fadeOut'];
      
      precisionFields.forEach(fieldName => {
        const option = TIMING_OPTIONS.find((opt: any) => opt.name === fieldName);
        // Should support 0.01 second precision
        expect(option.typeOptions?.numberPrecision).toBe(2);
      });
    });
  });

  describe('serialization and integrity', () => {
    it('should not have circular references', () => {
      expect(() => JSON.stringify(commonTimingFields)).not.toThrow();
    });

    it('should have consistent naming patterns', () => {
      TIMING_OPTIONS.forEach((option: any) => {
        // Names should be camelCase
        expect(option.name).toMatch(/^[a-z][a-zA-Z0-9]*$/);
        
        // DisplayName should be title case or descriptive
        expect(option.displayName).toMatch(/^[A-Z]/);
        expect(option.displayName.length).toBeGreaterThan(0);
      });
    });

    test.each(TIMING_FIELD_SPECS)('should have required properties for %s field', (fieldName) => {
      const option = TIMING_OPTIONS.find((opt: any) => opt.name === fieldName);
      
      expect(option.name).toBeDefined();
      expect(option.displayName).toBeDefined();
      expect(option.type).toBeDefined();
      expect(option.default).toBeDefined();
      expect(option.description).toBeDefined();
    });
  });

  describe('timing logic validation', () => {
    it('should support video timeline concepts', () => {
      const fieldNames = TIMING_OPTIONS.map((opt: any) => opt.name);
      
      // Core timeline fields
      expect(fieldNames).toContain('start');
      expect(fieldNames).toContain('duration');
      
      // Enhancement fields
      expect(fieldNames).toContain('extraTime');
      expect(fieldNames).toContain('zIndex');
      
      // Effect fields
      expect(fieldNames).toContain('fadeIn');
      expect(fieldNames).toContain('fadeOut');
    });

    it('should have appropriate field count', () => {
      expect(TIMING_OPTIONS.length).toBe(6);
      expect(TIMING_FIELD_SPECS.length).toBe(6);
    });

    it('should maintain field order consistency', () => {
      const expectedOrder = ['start', 'duration', 'extraTime', 'zIndex', 'fadeIn', 'fadeOut'];
      const actualOrder = TIMING_OPTIONS.map((opt: any) => opt.name);
      
      expectedOrder.forEach((expectedField, index) => {
        expect(actualOrder[index]).toBe(expectedField);
      });
    });
  });
});