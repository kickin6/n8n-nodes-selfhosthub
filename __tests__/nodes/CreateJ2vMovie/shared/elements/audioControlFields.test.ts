// __tests__/nodes/CreateJ2vMovie/shared/elements/audioControlFields.test.ts

import { audioControlFields } from '../../../../../nodes/CreateJ2vMovie/shared/elementFields';
import { INodeProperties } from 'n8n-workflow';

describe('audioControlFields', () => {
  const AUDIO_CONTROL_COLLECTION = audioControlFields[0];
  const AUDIO_OPTIONS = AUDIO_CONTROL_COLLECTION.options! as any[];

  // Test data matrices for extensive parametrization
  const AUDIO_OPTION_SPECS = [
    ['volume', { type: 'number', default: 1, minValue: 0, maxValue: 10, precision: 2, description: 'Volume level' }],
    ['muted', { type: 'boolean', default: false, description: 'Mute the audio' }],
    ['seek', { type: 'number', default: 0, minValue: 0, precision: 2, description: 'Start offset' }],
    ['loop', { type: 'number', default: undefined, minValue: -1, precision: 0, description: 'Loop count' }],
  ] as const;

  const ELEMENT_TYPE_TESTS = [
    ['video', true],
    ['audio', true], 
    ['voice', true],
    ['image', false],
    ['text', false],
    ['component', false],
    ['html', false],
    ['audiogram', false],
    ['subtitles', false],
  ] as const;

  const FULL_AUDIO_ELEMENT_TESTS = [
    ['video', true, 'should have seek and loop'],
    ['audio', true, 'should have seek and loop'],
    ['voice', false, 'should only have volume and muted'],
  ] as const;

  const VALID_VOLUME_VALUES = [0, 0.1, 0.5, 1, 1.5, 2, 5, 10];
  const INVALID_VOLUME_VALUES = [-1, -0.1, 10.1, 11, 100];

  const VALID_SEEK_VALUES = [0, 0.01, 0.5, 1, 5, 30, 120, 3600];
  const INVALID_SEEK_VALUES = [-1, -0.1, -5];

  const VALID_LOOP_VALUES = [-1, 0, 1, 2, 5, 10, 100];
  const INVALID_LOOP_VALUES = [-2, -5, 0.5, 1.1];

  const VOLUME_CONSTRAINT_TESTS = [
    ['minValue', 0, 'should prevent negative volume'],
    ['maxValue', 10, 'should limit maximum amplification'], 
    ['numberPrecision', 2, 'should support decimal precision'],
  ] as const;

  const SEEK_CONSTRAINT_TESTS = [
    ['minValue', 0, 'should prevent negative seek offset'],
    ['numberPrecision', 2, 'should support decimal precision'],
  ] as const;

  const LOOP_CONSTRAINT_TESTS = [
    ['minValue', -1, 'should allow infinite loop (-1)'],
    ['numberPrecision', 0, 'should only allow integers'],
  ] as const;

  describe('basic structure validation', () => {
    it('should export single audio control collection', () => {
      expect(Array.isArray(audioControlFields)).toBe(true);
      expect(audioControlFields.length).toBe(1);
    });

    it('should be valid collection field', () => {
      expect(AUDIO_CONTROL_COLLECTION.name).toBe('audioControls');
      expect(AUDIO_CONTROL_COLLECTION.displayName).toBe('Audio Controls');
      expect(AUDIO_CONTROL_COLLECTION.type).toBe('collection');
      expect(AUDIO_CONTROL_COLLECTION.placeholder).toBeDefined();
      expect(AUDIO_CONTROL_COLLECTION.default).toEqual({});
      expect(AUDIO_CONTROL_COLLECTION.description).toBeDefined();
      
      expect(typeof AUDIO_CONTROL_COLLECTION.placeholder).toBe('string');
      expect(typeof AUDIO_CONTROL_COLLECTION.description).toBe('string');
    });

    test.each(ELEMENT_TYPE_TESTS)('should %s target %s element type', (elementType, shouldTarget) => {
      const targetTypes = AUDIO_CONTROL_COLLECTION.displayOptions!.show!.type as string[];
      
      if (shouldTarget) {
        expect(targetTypes).toContain(elementType);
      } else {
        expect(targetTypes).not.toContain(elementType);
      }
    });

    it('should target all audio-capable elements', () => {
      const targetTypes = AUDIO_CONTROL_COLLECTION.displayOptions!.show!.type as string[];
      const expectedAudioTypes = ['video', 'audio', 'voice'];
      
      expectedAudioTypes.forEach(elementType => {
        expect(targetTypes).toContain(elementType);
      });
    });
  });

  describe('audio option existence and structure', () => {
    test.each(AUDIO_OPTION_SPECS)('should have %s option with correct structure', (optionName, specs) => {
      const option = AUDIO_OPTIONS.find(opt => opt.name === optionName);
      
      expect(option).toBeDefined();
      expect(option.displayName).toBeDefined();
      expect(option.type).toBe(specs.type);
      expect(option.default).toBe(specs.default);
      expect(option.description).toContain(specs.description);
      
      expect(typeof option.displayName).toBe('string');
      expect(typeof option.description).toBe('string');
    });

    test.each(AUDIO_OPTION_SPECS)('should have valid INodeProperties structure for %s', (optionName) => {
      const option = AUDIO_OPTIONS.find(opt => opt.name === optionName);
      
      expect(option.name).toBeDefined();
      expect(option.displayName).toBeDefined();
      expect(option.type).toBeDefined();
      expect(option.description).toBeDefined();
    });
  });

  describe('volume control validation', () => {
    const volumeOption = AUDIO_OPTIONS.find(opt => opt.name === 'volume')!;

    test.each(VOLUME_CONSTRAINT_TESTS)('should have %s constraint: %s (%s)', (constraintType, expectedValue, description) => {
      if (constraintType === 'numberPrecision') {
        expect(volumeOption.typeOptions?.numberPrecision).toBe(expectedValue);
      } else {
        expect(volumeOption.typeOptions?.[constraintType]).toBe(expectedValue);
      }
    });

    it('should have correct volume defaults and type', () => {
      expect(volumeOption.type).toBe('number');
      expect(volumeOption.default).toBe(1);
      expect(volumeOption.description).toContain('0 = mute, 1 = normal, 10 = maximum');
    });

    test.each(VALID_VOLUME_VALUES)('should accept valid volume value: %s', (validValue) => {
      expect(typeof validValue).toBe('number');
      expect(validValue).toBeGreaterThanOrEqual(volumeOption.typeOptions!.minValue);
      expect(validValue).toBeLessThanOrEqual(volumeOption.typeOptions!.maxValue);
    });

    test.each(INVALID_VOLUME_VALUES)('should have constraints that reject invalid volume value: %s', (invalidValue) => {
      const minValue = volumeOption.typeOptions!.minValue;
      const maxValue = volumeOption.typeOptions!.maxValue;
      
      expect(invalidValue < minValue || invalidValue > maxValue).toBe(true);
    });
  });

  describe('muted control validation', () => {
    const mutedOption = AUDIO_OPTIONS.find(opt => opt.name === 'muted')!;

    it('should have correct muted field structure', () => {
      expect(mutedOption.type).toBe('boolean');
      expect(mutedOption.default).toBe(false);
      expect(mutedOption.description).toContain('Mute the audio');
    });

    it('should be boolean type with false default', () => {
      expect(typeof mutedOption.default).toBe('boolean');
      expect(mutedOption.default).toBe(false);
    });
  });

  describe('seek control validation', () => {
    const seekOption = AUDIO_OPTIONS.find(opt => opt.name === 'seek')!;

    test.each(SEEK_CONSTRAINT_TESTS)('should have %s constraint: %s (%s)', (constraintType, expectedValue, description) => {
      if (constraintType === 'numberPrecision') {
        expect(seekOption.typeOptions?.numberPrecision).toBe(expectedValue);
      } else {
        expect(seekOption.typeOptions?.[constraintType]).toBe(expectedValue);
      }
    });

    it('should have correct seek defaults and type', () => {
      expect(seekOption.type).toBe('number');
      expect(seekOption.default).toBe(0);
      expect(seekOption.description).toContain('Start offset');
    });

    test.each(VALID_SEEK_VALUES)('should accept valid seek value: %s', (validValue) => {
      expect(typeof validValue).toBe('number');
      expect(validValue).toBeGreaterThanOrEqual(seekOption.typeOptions!.minValue);
    });

    test.each(INVALID_SEEK_VALUES)('should have constraints that reject invalid seek value: %s', (invalidValue) => {
      expect(invalidValue).toBeLessThan(seekOption.typeOptions!.minValue);
    });

    it('should have displayOptions for full audio types only', () => {
      expect(seekOption.displayOptions).toBeDefined();
      expect(seekOption.displayOptions!.show).toBeDefined();
      expect(seekOption.displayOptions!.show!.type).toEqual(['video', 'audio']);
    });
  });

  describe('loop control validation', () => {
    const loopOption = AUDIO_OPTIONS.find(opt => opt.name === 'loop')!;

    test.each(LOOP_CONSTRAINT_TESTS)('should have %s constraint: %s (%s)', (constraintType, expectedValue, description) => {
      if (constraintType === 'numberPrecision') {
        expect(loopOption.typeOptions?.numberPrecision).toBe(expectedValue);
      } else {
        expect(loopOption.typeOptions?.[constraintType]).toBe(expectedValue);
      }
    });

    it('should have correct loop defaults and type', () => {
      expect(loopOption.type).toBe('number');
      expect(loopOption.default).toBe(undefined);
      expect(loopOption.description).toContain('Loop count');
      expect(loopOption.description).toContain('-1=infinite');
    });

    test.each(VALID_LOOP_VALUES)('should accept valid loop value: %s', (validValue) => {
      expect(typeof validValue).toBe('number');
      expect(validValue).toBeGreaterThanOrEqual(loopOption.typeOptions!.minValue);
      expect(Number.isInteger(validValue)).toBe(true); // Integer precision check
    });

    test.each(INVALID_LOOP_VALUES)('should have constraints that reject invalid loop value: %s', (invalidValue) => {
      const isValidValue = invalidValue >= loopOption.typeOptions!.minValue && 
                          Number.isInteger(invalidValue);
      expect(isValidValue).toBe(false);
    });

    it('should have displayOptions for full audio types only', () => {
      expect(loopOption.displayOptions).toBeDefined();
      expect(loopOption.displayOptions!.show).toBeDefined();
      expect(loopOption.displayOptions!.show!.type).toEqual(['video', 'audio']);
    });
  });

  describe('element type targeting validation', () => {
    test.each(FULL_AUDIO_ELEMENT_TESTS)('should properly target %s elements: %s', (elementType, hasFullControls, description) => {
      const volumeOption = AUDIO_OPTIONS.find(opt => opt.name === 'volume')!;
      const mutedOption = AUDIO_OPTIONS.find(opt => opt.name === 'muted')!;
      const seekOption = AUDIO_OPTIONS.find(opt => opt.name === 'seek')!;
      const loopOption = AUDIO_OPTIONS.find(opt => opt.name === 'loop')!;

      // All audio elements should have volume and muted
      const allAudioTargets = AUDIO_CONTROL_COLLECTION.displayOptions!.show!.type as string[];
      expect(allAudioTargets).toContain(elementType);

      if (hasFullControls) {
        // Full audio types should have seek and loop
        expect(seekOption.displayOptions!.show!.type).toContain(elementType);
        expect(loopOption.displayOptions!.show!.type).toContain(elementType);
      } else {
        // Voice elements should not have seek and loop
        expect(seekOption.displayOptions!.show!.type).not.toContain(elementType);
        expect(loopOption.displayOptions!.show!.type).not.toContain(elementType);
      }
    });

    it('should separate full audio controls from voice controls', () => {
      const seekOption = AUDIO_OPTIONS.find(opt => opt.name === 'seek')!;
      const loopOption = AUDIO_OPTIONS.find(opt => opt.name === 'loop')!;

      const fullAudioTypes = seekOption.displayOptions!.show!.type as string[];
      const expectedFullAudioTypes = ['video', 'audio'];
      
      expect(fullAudioTypes).toEqual(expectedFullAudioTypes);
      expect(loopOption.displayOptions!.show!.type).toEqual(expectedFullAudioTypes);
      
      // Voice should not be in full audio controls
      expect(fullAudioTypes).not.toContain('voice');
    });
  });

  describe('audio control logic validation', () => {
    it('should support complete audio control workflow', () => {
      const optionNames = AUDIO_OPTIONS.map(opt => opt.name);
      
      // Core audio controls
      expect(optionNames).toContain('volume');
      expect(optionNames).toContain('muted');
      
      // Advanced audio controls
      expect(optionNames).toContain('seek');
      expect(optionNames).toContain('loop');
    });

    it('should have appropriate option count', () => {
      expect(AUDIO_OPTIONS.length).toBe(4);
      expect(AUDIO_OPTION_SPECS.length).toBe(4);
    });

    it('should maintain logical option order', () => {
      const expectedOrder = ['volume', 'muted', 'seek', 'loop'];
      const actualOrder = AUDIO_OPTIONS.map(opt => opt.name);
      
      expect(actualOrder).toEqual(expectedOrder);
    });

    it('should have sensible default values', () => {
      const defaultTests = [
        ['volume', 1], // Normal volume
        ['muted', false], // Not muted by default
        ['seek', 0], // Start from beginning
        ['loop', undefined], // No looping by default
      ];

      defaultTests.forEach(([optionName, expectedDefault]) => {
        const option = AUDIO_OPTIONS.find(opt => opt.name === optionName);
        expect(option.default).toBe(expectedDefault);
      });
    });
  });

  describe('edge cases and constraints', () => {
    it('should handle volume amplification correctly', () => {
      const volumeOption = AUDIO_OPTIONS.find(opt => opt.name === 'volume')!;
      
      // Should allow amplification above 1.0
      expect(volumeOption.typeOptions!.maxValue).toBeGreaterThan(1);
      expect(volumeOption.typeOptions!.maxValue).toBe(10);
      
      // Should prevent negative volume
      expect(volumeOption.typeOptions!.minValue).toBe(0);
    });

    it('should handle infinite loop correctly', () => {
      const loopOption = AUDIO_OPTIONS.find(opt => opt.name === 'loop')!;
      
      // Should allow -1 for infinite loop
      expect(loopOption.typeOptions!.minValue).toBe(-1);
      
      // Should only allow integers
      expect(loopOption.typeOptions!.numberPrecision).toBe(0);
    });

    it('should handle precise timing controls', () => {
      const seekOption = AUDIO_OPTIONS.find(opt => opt.name === 'seek')!;
      const volumeOption = AUDIO_OPTIONS.find(opt => opt.name === 'volume')!;
      
      // Should support centisecond precision
      expect(seekOption.typeOptions!.numberPrecision).toBe(2);
      expect(volumeOption.typeOptions!.numberPrecision).toBe(2);
    });

    it('should handle mute vs volume relationship', () => {
      const volumeOption = AUDIO_OPTIONS.find(opt => opt.name === 'volume')!;
      const mutedOption = AUDIO_OPTIONS.find(opt => opt.name === 'muted')!;
      
      // Both should be available for all audio types
      const volumeTargets = AUDIO_CONTROL_COLLECTION.displayOptions!.show!.type as string[];
      const mutedTargets = AUDIO_CONTROL_COLLECTION.displayOptions!.show!.type as string[];
      
      expect(volumeTargets).toEqual(mutedTargets);
    });
  });

  describe('serialization and integrity', () => {
    it('should not have circular references', () => {
      expect(() => JSON.stringify(audioControlFields)).not.toThrow();
    });

    it('should have consistent naming patterns', () => {
      AUDIO_OPTIONS.forEach(option => {
        // Names should be camelCase
        expect(option.name).toMatch(/^[a-z][a-zA-Z0-9]*$/);
        
        // DisplayName should be title case
        expect(option.displayName).toMatch(/^[A-Z]/);
        expect(option.displayName.length).toBeGreaterThan(0);
      });
    });

    test.each(AUDIO_OPTION_SPECS)('should have required properties for %s option', (optionName) => {
      const option = AUDIO_OPTIONS.find(opt => opt.name === optionName);
      
      expect(option.name).toBeDefined();
      expect(option.displayName).toBeDefined();
      expect(option.type).toBeDefined();
      expect(option.description).toBeDefined();
    });
  });
});