// __tests__/nodes/CreateJ2vMovie/shared/elements/visualTransformFields.test.ts

import { visualTransformFields } from '../../../../../nodes/CreateJ2vMovie/shared/elementFields';
import { INodeProperties } from 'n8n-workflow';

describe('visualTransformFields', () => {
  const VISUAL_EFFECTS_COLLECTION = visualTransformFields[0];
  const VISUAL_OPTIONS = VISUAL_EFFECTS_COLLECTION.options! as any[];

  // Test data matrices for extensive parametrization
  const VISUAL_OPTION_SPECS = [
    ['resize', { type: 'options', default: 'cover', description: 'How to resize element' }],
    ['pan', { type: 'options', default: '', description: 'Pan direction' }],
    ['panDistance', { type: 'number', default: 0.1, minValue: 0.01, maxValue: 0.5, precision: 2, description: 'Pan distance' }],
    ['panCrop', { type: 'boolean', default: true, description: 'Stretch during pan' }],
    ['zoom', { type: 'number', default: 0, minValue: -10, maxValue: 10, precision: 1, description: 'Zoom level' }],
    ['flipHorizontal', { type: 'boolean', default: false, description: 'Mirror element horizontally' }],
    ['flipVertical', { type: 'boolean', default: false, description: 'Mirror element vertically' }],
    ['mask', { type: 'string', default: '', description: 'URL of mask image' }],
  ] as const;

  const RESIZE_MODE_OPTIONS = [
    ['Cover (Fill & Crop)', 'cover'],
    ['Contain (Fit Inside)', 'contain'],
    ['Fill (Stretch)', 'fill'],
    ['Fit (Scale Down)', 'fit'],
  ] as const;

  const PAN_DIRECTION_OPTIONS = [
    ['Left', 'left'],
    ['Right', 'right'],
    ['Top', 'top'],
    ['Bottom', 'bottom'],
    ['Top Left', 'top-left'],
    ['Top Right', 'top-right'],
    ['Bottom Left', 'bottom-left'],
    ['Bottom Right', 'bottom-right'],
  ] as const;

  const ELEMENT_TYPE_TESTS = [
    ['video', true],
    ['image', true],
    ['component', true],
    ['html', true],
    ['audiogram', true],
    ['audio', false],
    ['text', false],
    ['voice', false],
    ['subtitles', false],
  ] as const;

  const VALID_PAN_DISTANCE_VALUES = [0.01, 0.05, 0.1, 0.2, 0.3, 0.5];
  const INVALID_PAN_DISTANCE_VALUES = [0, 0.005, 0.51, 0.75, 1.0];

  const VALID_ZOOM_VALUES = [-10, -5, -1, 0, 1, 5, 10];
  const INVALID_ZOOM_VALUES = [-11, -15, 11, 20];

  const BOOLEAN_FIELD_TESTS = [
    ['panCrop', true, 'should stretch during pan by default'],
    ['flipHorizontal', false, 'should not flip horizontally by default'],
    ['flipVertical', false, 'should not flip vertically by default'],
  ] as const;

  const NUMBER_CONSTRAINT_TESTS = [
    ['panDistance', { min: 0.01, max: 0.5, precision: 2, default: 0.1 }],
    ['zoom', { min: -10, max: 10, precision: 1, default: 0 }],
  ] as const;

  const PAN_EFFECT_VALIDATION = [
    ['left', 'should pan horizontally left'],
    ['right', 'should pan horizontally right'],
    ['top', 'should pan vertically up'],
    ['bottom', 'should pan vertically down'],
    ['top-left', 'should pan diagonally'],
    ['top-right', 'should pan diagonally'],
    ['bottom-left', 'should pan diagonally'],
    ['bottom-right', 'should pan diagonally'],
  ] as const;

  describe('basic structure validation', () => {
    it('should export single visual effects collection', () => {
      expect(Array.isArray(visualTransformFields)).toBe(true);
      expect(visualTransformFields.length).toBe(1);
    });

    it('should be valid collection field', () => {
      expect(VISUAL_EFFECTS_COLLECTION.name).toBe('visualEffects');
      expect(VISUAL_EFFECTS_COLLECTION.displayName).toBe('Visual Effects');
      expect(VISUAL_EFFECTS_COLLECTION.type).toBe('collection');
      expect(VISUAL_EFFECTS_COLLECTION.placeholder).toBeDefined();
      expect(VISUAL_EFFECTS_COLLECTION.default).toEqual({});
      expect(VISUAL_EFFECTS_COLLECTION.description).toBeDefined();
      
      expect(typeof VISUAL_EFFECTS_COLLECTION.placeholder).toBe('string');
      expect(typeof VISUAL_EFFECTS_COLLECTION.description).toBe('string');
    });

    test.each(ELEMENT_TYPE_TESTS)('should %s target %s element type', (elementType, shouldTarget) => {
      const targetTypes = VISUAL_EFFECTS_COLLECTION.displayOptions!.show!.type as string[];
      
      if (shouldTarget) {
        expect(targetTypes).toContain(elementType);
      } else {
        expect(targetTypes).not.toContain(elementType);
      }
    });

    it('should target visual element types only', () => {
      const targetTypes = VISUAL_EFFECTS_COLLECTION.displayOptions!.show!.type as string[];
      const expectedVisualTypes = ['video', 'image', 'component', 'html', 'audiogram'];
      
      expectedVisualTypes.forEach(elementType => {
        expect(targetTypes).toContain(elementType);
      });
      
      expect(targetTypes.sort()).toEqual(expectedVisualTypes.sort());
    });
  });

  describe('visual option existence and structure', () => {
    test.each(VISUAL_OPTION_SPECS)('should have %s option with correct structure', (optionName, specs) => {
      const option = VISUAL_OPTIONS.find(opt => opt.name === optionName);
      
      expect(option).toBeDefined();
      expect(option.displayName).toBeDefined();
      expect(option.type).toBe(specs.type);
      expect(option.default).toBe(specs.default);
      expect(option.description).toContain(specs.description);
      
      expect(typeof option.displayName).toBe('string');
      expect(typeof option.description).toBe('string');
    });

    test.each(VISUAL_OPTION_SPECS)('should have valid INodeProperties structure for %s', (optionName) => {
      const option = VISUAL_OPTIONS.find(opt => opt.name === optionName);
      
      expect(option.name).toBeDefined();
      expect(option.displayName).toBeDefined();
      expect(option.type).toBeDefined();
      expect(option.description).toBeDefined();
    });
  });

  describe('resize mode validation', () => {
    const resizeOption = VISUAL_OPTIONS.find(opt => opt.name === 'resize')!;

    it('should have correct resize option structure', () => {
      expect(resizeOption.type).toBe('options');
      expect(resizeOption.default).toBe('cover');
      expect(resizeOption.options).toBeDefined();
      expect(Array.isArray(resizeOption.options)).toBe(true);
    });

    test.each(RESIZE_MODE_OPTIONS)('should have %s option with value %s', (displayName, value) => {
      const option = resizeOption.options!.find((opt: any) => opt.value === value) as any;
      
      expect(option).toBeDefined();
      expect(option.name).toBe(displayName);
      expect(option.value).toBe(value);
    });

    it('should have cover as default resize mode', () => {
      expect(resizeOption.default).toBe('cover');
      
      const coverOption = resizeOption.options!.find((opt: any) => opt.value === 'cover');
      expect(coverOption).toBeDefined();
    });

    it('should have complete resize mode coverage', () => {
      const optionValues = resizeOption.options!.map((opt: any) => opt.value);
      const expectedValues = RESIZE_MODE_OPTIONS.map(([, value]) => value);
      
      expect(optionValues.sort()).toEqual(expectedValues.sort());
    });
  });

  describe('pan effect validation', () => {
    const panOption = VISUAL_OPTIONS.find(opt => opt.name === 'pan')!;

    it('should have correct pan option structure', () => {
      expect(panOption.type).toBe('options');
      expect(panOption.default).toBe('');
      expect(panOption.options).toBeDefined();
      expect(Array.isArray(panOption.options)).toBe(true);
    });

    test.each(PAN_DIRECTION_OPTIONS)('should have %s option with value %s', (displayName, value) => {
      const option = panOption.options!.find((opt: any) => opt.value === value) as any;
      
      expect(option).toBeDefined();
      expect(option.name).toBe(displayName);
      expect(option.value).toBe(value);
    });

    test.each(PAN_EFFECT_VALIDATION)('should support %s pan direction: %s', (direction, description) => {
      const option = panOption.options!.find((opt: any) => opt.value === direction);
      expect(option).toBeDefined();
    });

    it('should have empty default (no pan)', () => {
      expect(panOption.default).toBe('');
    });
  });

  describe('pan distance and crop validation', () => {
    const panDistanceOption = VISUAL_OPTIONS.find(opt => opt.name === 'panDistance')!;
    const panCropOption = VISUAL_OPTIONS.find(opt => opt.name === 'panCrop')!;

    test.each(NUMBER_CONSTRAINT_TESTS)('should have correct constraints for %s', (fieldName, constraints) => {
      const option = VISUAL_OPTIONS.find(opt => opt.name === fieldName)!;
      
      expect(option.typeOptions?.minValue).toBe(constraints.min);
      expect(option.typeOptions?.maxValue).toBe(constraints.max);
      expect(option.typeOptions?.numberPrecision).toBe(constraints.precision);
      expect(option.default).toBe(constraints.default);
    });

    test.each(VALID_PAN_DISTANCE_VALUES)('should accept valid pan distance value: %s', (validValue) => {
      expect(typeof validValue).toBe('number');
      expect(validValue).toBeGreaterThanOrEqual(panDistanceOption.typeOptions!.minValue);
      expect(validValue).toBeLessThanOrEqual(panDistanceOption.typeOptions!.maxValue);
    });

    test.each(INVALID_PAN_DISTANCE_VALUES)('should have constraints that reject invalid pan distance: %s', (invalidValue) => {
      const minValue = panDistanceOption.typeOptions!.minValue;
      const maxValue = panDistanceOption.typeOptions!.maxValue;
      
      expect(invalidValue < minValue || invalidValue > maxValue).toBe(true);
    });

    it('should have pan crop as boolean with true default', () => {
      expect(panCropOption.type).toBe('boolean');
      expect(panCropOption.default).toBe(true);
      expect(panCropOption.description).toContain('avoid black borders');
    });
  });

  describe('zoom control validation', () => {
    const zoomOption = VISUAL_OPTIONS.find(opt => opt.name === 'zoom')!;

    it('should have correct zoom option structure', () => {
      expect(zoomOption.type).toBe('number');
      expect(zoomOption.default).toBe(0);
      expect(zoomOption.typeOptions?.minValue).toBe(-10);
      expect(zoomOption.typeOptions?.maxValue).toBe(10);
      expect(zoomOption.typeOptions?.numberPrecision).toBe(1);
    });

    test.each(VALID_ZOOM_VALUES)('should accept valid zoom value: %s', (validValue) => {
      expect(typeof validValue).toBe('number');
      expect(validValue).toBeGreaterThanOrEqual(zoomOption.typeOptions!.minValue);
      expect(validValue).toBeLessThanOrEqual(zoomOption.typeOptions!.maxValue);
    });

    test.each(INVALID_ZOOM_VALUES)('should have constraints that reject invalid zoom value: %s', (invalidValue) => {
      const minValue = zoomOption.typeOptions!.minValue;
      const maxValue = zoomOption.typeOptions!.maxValue;
      
      expect(invalidValue < minValue || invalidValue > maxValue).toBe(true);
    });

    it('should support zoom in and zoom out', () => {
      expect(zoomOption.typeOptions!.minValue).toBeLessThan(0); // Zoom out
      expect(zoomOption.typeOptions!.maxValue).toBeGreaterThan(0); // Zoom in
      expect(zoomOption.default).toBe(0); // No zoom
    });
  });

  describe('flip controls validation', () => {
    test.each(BOOLEAN_FIELD_TESTS)('should have %s field: %s (%s)', (fieldName, expectedDefault, description) => {
      const option = VISUAL_OPTIONS.find(opt => opt.name === fieldName)!;
      
      expect(option.type).toBe('boolean');
      expect(option.default).toBe(expectedDefault);
      expect(typeof option.description).toBe('string');
    });

    it('should support independent horizontal and vertical flipping', () => {
      const flipHorizontalOption = VISUAL_OPTIONS.find(opt => opt.name === 'flipHorizontal')!;
      const flipVerticalOption = VISUAL_OPTIONS.find(opt => opt.name === 'flipVertical')!;
      
      expect(flipHorizontalOption).toBeDefined();
      expect(flipVerticalOption).toBeDefined();
      
      // Both should be independent boolean controls
      expect(flipHorizontalOption.type).toBe('boolean');
      expect(flipVerticalOption.type).toBe('boolean');
      
      // Both should default to false (no flipping)
      expect(flipHorizontalOption.default).toBe(false);
      expect(flipVerticalOption.default).toBe(false);
    });
  });

  describe('mask control validation', () => {
    const maskOption = VISUAL_OPTIONS.find(opt => opt.name === 'mask')!;

    it('should have correct mask option structure', () => {
      expect(maskOption.type).toBe('string');
      expect(maskOption.default).toBe('');
      expect(maskOption.description).toContain('mask image');
      expect(maskOption.description).toContain('transparency effects');
    });

    it('should support URL input for mask image', () => {
      expect(maskOption.type).toBe('string');
      expect(typeof maskOption.default).toBe('string');
      expect(maskOption.default).toBe(''); // No mask by default
    });
  });

  describe('visual transform logic validation', () => {
    it('should support complete visual transformation workflow', () => {
      const optionNames = VISUAL_OPTIONS.map(opt => opt.name);
      
      // Core sizing and fitting
      expect(optionNames).toContain('resize');
      
      // Motion effects
      expect(optionNames).toContain('pan');
      expect(optionNames).toContain('panDistance');
      expect(optionNames).toContain('panCrop');
      
      // Scaling effects
      expect(optionNames).toContain('zoom');
      
      // Mirror effects
      expect(optionNames).toContain('flipHorizontal');
      expect(optionNames).toContain('flipVertical');
      
      // Compositing effects
      expect(optionNames).toContain('mask');
    });

    it('should have appropriate option count', () => {
      expect(VISUAL_OPTIONS.length).toBe(8);
      expect(VISUAL_OPTION_SPECS.length).toBe(8);
    });

    it('should maintain logical option order', () => {
      const expectedOrder = ['resize', 'pan', 'panDistance', 'panCrop', 'zoom', 'flipHorizontal', 'flipVertical', 'mask'];
      const actualOrder = VISUAL_OPTIONS.map(opt => opt.name);
      
      expect(actualOrder).toEqual(expectedOrder);
    });

    it('should have sensible default values', () => {
      const defaultTests = [
        ['resize', 'cover'], // Most common resize mode
        ['pan', ''], // No pan by default
        ['panDistance', 0.1], // Moderate pan distance
        ['panCrop', true], // Avoid black borders
        ['zoom', 0], // No zoom by default
        ['flipHorizontal', false], // No flip by default
        ['flipVertical', false], // No flip by default
        ['mask', ''], // No mask by default
      ];

      defaultTests.forEach(([optionName, expectedDefault]) => {
        const option = VISUAL_OPTIONS.find(opt => opt.name === optionName);
        expect(option.default).toBe(expectedDefault);
      });
    });
  });

  describe('ken burns effect validation', () => {
    it('should support Ken Burns effect with pan and zoom', () => {
      const panOption = VISUAL_OPTIONS.find(opt => opt.name === 'pan')!;
      const panDistanceOption = VISUAL_OPTIONS.find(opt => opt.name === 'panDistance')!;
      const zoomOption = VISUAL_OPTIONS.find(opt => opt.name === 'zoom')!;
      
      // Pan direction should be available
      expect(panOption.options!.length).toBeGreaterThan(0);
      
      // Pan distance should be controllable
      expect(panDistanceOption.typeOptions!.minValue).toBeGreaterThan(0);
      expect(panDistanceOption.typeOptions!.maxValue).toBeLessThan(1);
      
      // Zoom should support both in and out
      expect(zoomOption.typeOptions!.minValue).toBeLessThan(0);
      expect(zoomOption.typeOptions!.maxValue).toBeGreaterThan(0);
    });

    it('should support pan crop to avoid black borders', () => {
      const panCropOption = VISUAL_OPTIONS.find(opt => opt.name === 'panCrop')!;
      
      expect(panCropOption.type).toBe('boolean');
      expect(panCropOption.default).toBe(true);
      expect(panCropOption.description).toContain('Stretch');
      expect(panCropOption.description).toContain('black borders');
    });
  });

  describe('edge cases and constraints', () => {
    it('should handle precise pan distance control', () => {
      const panDistanceOption = VISUAL_OPTIONS.find(opt => opt.name === 'panDistance')!;
      
      expect(panDistanceOption.typeOptions!.numberPrecision).toBe(2);
      expect(panDistanceOption.typeOptions!.minValue).toBe(0.01);
      expect(panDistanceOption.typeOptions!.maxValue).toBe(0.5);
    });

    it('should handle zoom precision and limits', () => {
      const zoomOption = VISUAL_OPTIONS.find(opt => opt.name === 'zoom')!;
      
      expect(zoomOption.typeOptions!.numberPrecision).toBe(1);
      expect(zoomOption.typeOptions!.minValue).toBe(-10);
      expect(zoomOption.typeOptions!.maxValue).toBe(10);
    });

    it('should handle mask URL validation', () => {
      const maskOption = VISUAL_OPTIONS.find(opt => opt.name === 'mask')!;
      
      expect(maskOption.type).toBe('string');
      expect(maskOption.default).toBe('');
    });

    it('should handle boolean controls independently', () => {
      const booleanOptions = VISUAL_OPTIONS.filter(opt => opt.type === 'boolean');
      
      expect(booleanOptions.length).toBe(3); // panCrop, flipHorizontal, flipVertical
      
      booleanOptions.forEach(option => {
        expect(typeof option.default).toBe('boolean');
      });
    });
  });

  describe('serialization and integrity', () => {
    it('should not have circular references', () => {
      expect(() => JSON.stringify(visualTransformFields)).not.toThrow();
    });

    it('should have consistent naming patterns', () => {
      VISUAL_OPTIONS.forEach(option => {
        // Names should be camelCase
        expect(option.name).toMatch(/^[a-z][a-zA-Z0-9]*$/);
        
        // DisplayName should be title case
        expect(option.displayName).toMatch(/^[A-Z]/);
        expect(option.displayName.length).toBeGreaterThan(0);
      });
    });

    test.each(VISUAL_OPTION_SPECS)('should have required properties for %s option', (optionName) => {
      const option = VISUAL_OPTIONS.find(opt => opt.name === optionName);
      
      expect(option.name).toBeDefined();
      expect(option.displayName).toBeDefined();
      expect(option.type).toBeDefined();
      expect(option.description).toBeDefined();
    });
  });
});