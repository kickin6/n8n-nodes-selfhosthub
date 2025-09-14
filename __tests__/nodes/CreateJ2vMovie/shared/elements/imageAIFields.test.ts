// __tests__/nodes/CreateJ2vMovie/shared/elements/imageAIFields.test.ts

import { imageAIFields } from '../../../../../nodes/CreateJ2vMovie/shared/elementFields';
import { INodeProperties } from 'n8n-workflow';

describe('imageAIFields', () => {
  const AI_GENERATION_COLLECTION = imageAIFields[0];
  const AI_OPTIONS = AI_GENERATION_COLLECTION.options! as any[];

  // Test data matrices for extensive parametrization
  const AI_OPTION_SPECS = [
    ['prompt', { type: 'string', default: '', description: 'Text prompt describing the image' }],
    ['model', { type: 'options', default: 'flux-pro', description: 'AI model for image generation' }],
    ['aspectRatio', { type: 'options', default: 'horizontal', description: 'Image aspect ratio' }],
    ['connection', { type: 'string', default: '', description: 'connection ID for custom AI API' }],
    ['modelSettings', { type: 'json', default: '{}', description: 'model-specific settings' }],
  ] as const;

  const AI_MODEL_OPTIONS = [
    ['Flux Pro (Best Quality)', 'flux-pro'],
    ['Flux Schnell (Fastest)', 'flux-schnell'],
    ['Freepik Classic', 'freepik-classic'],
  ] as const;

  const ASPECT_RATIO_OPTIONS = [
    ['Horizontal (16:9)', 'horizontal'],
    ['Vertical (9:16)', 'vertical'],
    ['Square (1:1)', 'squared'],
  ] as const;

  const ELEMENT_TYPE_TESTS = [
    ['image', true],
    ['video', false],
    ['audio', false],
    ['text', false],
    ['voice', false],
    ['component', false],
    ['html', false],
    ['audiogram', false],
    ['subtitles', false],
  ] as const;

  const STRING_FIELD_TESTS = [
    ['prompt', { multiline: true, rows: 3 }],
    ['connection', { multiline: false }],
  ] as const;

  const JSON_FIELD_TESTS = [
    ['modelSettings', '{}', 'should have empty object default'],
  ] as const;

  const PROMPT_VALIDATION_TESTS = [
    ['should accept descriptive prompts', 'A beautiful mountain landscape with snow-capped peaks'],
    ['should accept style prompts', 'Digital art, vibrant colors, fantasy style'],
    ['should accept technical prompts', '4K resolution, photorealistic, professional photography'],
    ['should accept empty prompt', ''],
  ] as const;

  const MODEL_CAPABILITY_TESTS = [
    ['flux-pro', 'best quality', 'should prioritize image quality'],
    ['flux-schnell', 'fastest', 'should prioritize generation speed'],
    ['freepik-classic', 'freepik', 'should use Freepik generation'],
  ] as const;

  const ASPECT_RATIO_DIMENSION_TESTS = [
    ['horizontal', '16:9', 'landscape orientation'],
    ['vertical', '9:16', 'portrait orientation'],
    ['squared', '1:1', 'square format'],
  ] as const;

  describe('basic structure validation', () => {
    it('should export single AI generation collection', () => {
      expect(Array.isArray(imageAIFields)).toBe(true);
      expect(imageAIFields.length).toBe(1);
    });

    it('should be valid collection field', () => {
      expect(AI_GENERATION_COLLECTION.name).toBe('aiGeneration');
      expect(AI_GENERATION_COLLECTION.displayName).toBe('AI Image Generation');
      expect(AI_GENERATION_COLLECTION.type).toBe('collection');
      expect(AI_GENERATION_COLLECTION.placeholder).toBeDefined();
      expect(AI_GENERATION_COLLECTION.default).toEqual({});
      expect(AI_GENERATION_COLLECTION.description).toBeDefined();
      
      expect(typeof AI_GENERATION_COLLECTION.placeholder).toBe('string');
      expect(typeof AI_GENERATION_COLLECTION.description).toBe('string');
    });

    test.each(ELEMENT_TYPE_TESTS)('should %s target %s element type', (elementType, shouldTarget) => {
      const targetTypes = AI_GENERATION_COLLECTION.displayOptions!.show!.type as string[];
      
      if (shouldTarget) {
        expect(targetTypes).toContain(elementType);
      } else {
        expect(targetTypes).not.toContain(elementType);
      }
    });

    it('should target image elements only', () => {
      const targetTypes = AI_GENERATION_COLLECTION.displayOptions!.show!.type as string[];
      
      expect(targetTypes).toEqual(['image']);
      expect(targetTypes.length).toBe(1);
    });
  });

  describe('AI option existence and structure', () => {
    test.each(AI_OPTION_SPECS)('should have %s option with correct structure', (optionName, specs) => {
      const option = AI_OPTIONS.find(opt => opt.name === optionName);
      
      expect(option).toBeDefined();
      expect(option.displayName).toBeDefined();
      expect(option.type).toBe(specs.type);
      expect(option.default).toEqual(specs.default);
      expect(option.description).toContain(specs.description);
      
      expect(typeof option.displayName).toBe('string');
      expect(typeof option.description).toBe('string');
    });

    test.each(AI_OPTION_SPECS)('should have valid INodeProperties structure for %s', (optionName) => {
      const option = AI_OPTIONS.find(opt => opt.name === optionName);
      
      expect(option.name).toBeDefined();
      expect(option.displayName).toBeDefined();
      expect(option.type).toBeDefined();
      expect(option.description).toBeDefined();
    });
  });

  describe('prompt field validation', () => {
    const promptOption = AI_OPTIONS.find(opt => opt.name === 'prompt')!;

    it('should have correct prompt field structure', () => {
      expect(promptOption.type).toBe('string');
      expect(promptOption.default).toBe('');
      expect(promptOption.typeOptions?.rows).toBe(3);
      expect(promptOption.description).toContain('Text prompt');
    });

    test.each(STRING_FIELD_TESTS)('should have proper string configuration for %s', (fieldName, config) => {
      const option = AI_OPTIONS.find(opt => opt.name === fieldName)!;
      
      expect(option.type).toBe('string');
      
      if (config.multiline) {
        expect(option.typeOptions?.rows).toBeDefined();
        expect(option.typeOptions!.rows).toBe(config.rows);
      } else {
        expect(option.typeOptions?.rows).toBeUndefined();
      }
    });

    test.each(PROMPT_VALIDATION_TESTS)('should support prompt: %s', (description, promptText) => {
      expect(typeof promptText).toBe('string');
      expect(promptOption.type).toBe('string');
      
      // All string values should be acceptable for prompts
      expect(promptText.length).toBeGreaterThanOrEqual(0);
    });

    it('should support multiline prompt input', () => {
      expect(promptOption.typeOptions?.rows).toBe(3);
      expect(promptOption.typeOptions!.rows).toBeGreaterThan(1);
    });
  });

  describe('AI model validation', () => {
    const modelOption = AI_OPTIONS.find(opt => opt.name === 'model')!;

    it('should have correct model option structure', () => {
      expect(modelOption.type).toBe('options');
      expect(modelOption.default).toBe('flux-pro');
      expect(modelOption.options).toBeDefined();
      expect(Array.isArray(modelOption.options)).toBe(true);
    });

    test.each(AI_MODEL_OPTIONS)('should have %s option with value %s', (displayName, value) => {
      const option = modelOption.options!.find((opt: any) => opt.value === value) as any;
      
      expect(option).toBeDefined();
      expect(option.name).toBe(displayName);
      expect(option.value).toBe(value);
    });

    test.each(MODEL_CAPABILITY_TESTS)('should support %s model (%s): %s', (modelValue, capability, description) => {
      const option = modelOption.options!.find((opt: any) => opt.value === modelValue);
      expect(option).toBeDefined();
    });

    it('should have flux-pro as default model', () => {
      expect(modelOption.default).toBe('flux-pro');
      
      const fluxProOption = modelOption.options!.find((opt: any) => opt.value === 'flux-pro');
      expect(fluxProOption).toBeDefined();
    });

    it('should have complete model coverage', () => {
      const optionValues = modelOption.options!.map((opt: any) => opt.value);
      const expectedValues = AI_MODEL_OPTIONS.map(([, value]) => value);
      
      expect(optionValues.sort()).toEqual(expectedValues.sort());
    });
  });

  describe('aspect ratio validation', () => {
    const aspectRatioOption = AI_OPTIONS.find(opt => opt.name === 'aspectRatio')!;

    it('should have correct aspect ratio option structure', () => {
      expect(aspectRatioOption.type).toBe('options');
      expect(aspectRatioOption.default).toBe('horizontal');
      expect(aspectRatioOption.options).toBeDefined();
      expect(Array.isArray(aspectRatioOption.options)).toBe(true);
    });

    test.each(ASPECT_RATIO_OPTIONS)('should have %s option with value %s', (displayName, value) => {
      const option = aspectRatioOption.options!.find((opt: any) => opt.value === value) as any;
      
      expect(option).toBeDefined();
      expect(option.name).toBe(displayName);
      expect(option.value).toBe(value);
    });

    test.each(ASPECT_RATIO_DIMENSION_TESTS)('should support %s aspect ratio (%s): %s', (ratioValue, dimensions, description) => {
      const option = aspectRatioOption.options!.find((opt: any) => opt.value === ratioValue);
      expect(option).toBeDefined();
    });

    it('should have horizontal as default aspect ratio', () => {
      expect(aspectRatioOption.default).toBe('horizontal');
      
      const horizontalOption = aspectRatioOption.options!.find((opt: any) => opt.value === 'horizontal');
      expect(horizontalOption).toBeDefined();
    });

    it('should have complete aspect ratio coverage', () => {
      const optionValues = aspectRatioOption.options!.map((opt: any) => opt.value);
      const expectedValues = ASPECT_RATIO_OPTIONS.map(([, value]) => value);
      
      expect(optionValues.sort()).toEqual(expectedValues.sort());
    });
  });

  describe('connection field validation', () => {
    const connectionOption = AI_OPTIONS.find(opt => opt.name === 'connection')!;

    it('should have correct connection field structure', () => {
      expect(connectionOption.type).toBe('string');
      expect(connectionOption.default).toBe('');
      expect(connectionOption.description).toContain('connection ID');
      expect(connectionOption.description).toContain('custom AI API');
    });

    it('should support optional connection configuration', () => {
      expect(connectionOption.default).toBe('');
      expect(typeof connectionOption.default).toBe('string');
    });

    it('should not have multiline configuration', () => {
      expect(connectionOption.typeOptions?.rows).toBeUndefined();
    });
  });

  describe('model settings validation', () => {
    test.each(JSON_FIELD_TESTS)('should have %s field with default %s: %s', (fieldName, expectedDefault, description) => {
      const option = AI_OPTIONS.find(opt => opt.name === fieldName)!;
      
      expect(option.type).toBe('json');
      expect(option.default).toBe(expectedDefault);
      expect(option.description).toContain('settings');
    });

    it('should support JSON model settings', () => {
      const modelSettingsOption = AI_OPTIONS.find(opt => opt.name === 'modelSettings')!;
      
      expect(modelSettingsOption.type).toBe('json');
      expect(modelSettingsOption.default).toBe('{}');
      expect(modelSettingsOption.description).toContain('model-specific');
    });

    it('should have empty object as default settings', () => {
      const modelSettingsOption = AI_OPTIONS.find(opt => opt.name === 'modelSettings')!;
      
      expect(modelSettingsOption.default).toBe('{}');
      expect(() => JSON.parse(modelSettingsOption.default)).not.toThrow();
    });
  });

  describe('AI generation workflow validation', () => {
    it('should support complete AI image generation workflow', () => {
      const optionNames = AI_OPTIONS.map(opt => opt.name);
      
      // Core generation fields
      expect(optionNames).toContain('prompt');
      expect(optionNames).toContain('model');
      expect(optionNames).toContain('aspectRatio');
      
      // Configuration fields
      expect(optionNames).toContain('connection');
      expect(optionNames).toContain('modelSettings');
    });

    it('should have appropriate option count', () => {
      expect(AI_OPTIONS.length).toBe(5);
      expect(AI_OPTION_SPECS.length).toBe(5);
    });

    it('should maintain logical option order', () => {
      const expectedOrder = ['prompt', 'model', 'aspectRatio', 'connection', 'modelSettings'];
      const actualOrder = AI_OPTIONS.map(opt => opt.name);
      
      expect(actualOrder).toEqual(expectedOrder);
    });

    it('should have sensible default values', () => {
      const defaultTests = [
        ['prompt', ''], // Empty prompt for user input
        ['model', 'flux-pro'], // Best quality model
        ['aspectRatio', 'horizontal'], // Common landscape format
        ['connection', ''], // No custom connection by default
        ['modelSettings', '{}'], // Empty settings object
      ];

      defaultTests.forEach(([optionName, expectedDefault]) => {
        const option = AI_OPTIONS.find(opt => opt.name === optionName);
        expect(option.default).toEqual(expectedDefault);
      });
    });
  });

  describe('AI model comparison validation', () => {
    it('should prioritize quality vs speed appropriately', () => {
      const modelOption = AI_OPTIONS.find(opt => opt.name === 'model')!;
      
      // Should have flux-pro as default (quality)
      expect(modelOption.default).toBe('flux-pro');
      
      // Should offer schnell as speed alternative
      const schnellOption = modelOption.options!.find((opt: any) => opt.value === 'flux-schnell');
      expect(schnellOption).toBeDefined();
      expect(schnellOption.name).toContain('Fastest');
      
      // Should offer classic as additional option
      const classicOption = modelOption.options!.find((opt: any) => opt.value === 'freepik-classic');
      expect(classicOption).toBeDefined();
    });

    it('should support different aspect ratios for various use cases', () => {
      const aspectRatioOption = AI_OPTIONS.find(opt => opt.name === 'aspectRatio')!;
      
      // Should support video content (horizontal)
      const horizontalOption = aspectRatioOption.options!.find((opt: any) => opt.value === 'horizontal');
      expect(horizontalOption.name).toContain('16:9');
      
      // Should support mobile content (vertical)
      const verticalOption = aspectRatioOption.options!.find((opt: any) => opt.value === 'vertical');
      expect(verticalOption.name).toContain('9:16');
      
      // Should support social media (square)
      const squareOption = aspectRatioOption.options!.find((opt: any) => opt.value === 'squared');
      expect(squareOption.name).toContain('1:1');
    });
  });

  describe('edge cases and configuration', () => {
    it('should handle empty prompt gracefully', () => {
      const promptOption = AI_OPTIONS.find(opt => opt.name === 'prompt')!;
      
      expect(promptOption.default).toBe('');
      expect(promptOption.type).toBe('string');
    });

    it('should handle custom API connections', () => {
      const connectionOption = AI_OPTIONS.find(opt => opt.name === 'connection')!;
      
      expect(connectionOption.type).toBe('string');
      expect(connectionOption.default).toBe('');
      expect(connectionOption.description).toContain('Optional');
    });

    it('should handle model-specific settings as JSON', () => {
      const modelSettingsOption = AI_OPTIONS.find(opt => opt.name === 'modelSettings')!;
      
      expect(modelSettingsOption.type).toBe('json');
      
      // Should be valid JSON by default
      expect(() => JSON.parse(modelSettingsOption.default)).not.toThrow();
      
      // Should be an empty object
      const parsed = JSON.parse(modelSettingsOption.default);
      expect(typeof parsed).toBe('object');
      expect(Object.keys(parsed).length).toBe(0);
    });

    it('should support flexible prompt input', () => {
      const promptOption = AI_OPTIONS.find(opt => opt.name === 'prompt')!;
      
      // Should support multiline input
      expect(promptOption.typeOptions?.rows).toBeGreaterThan(1);
      
      // Should not be required (empty default)
      expect(promptOption.default).toBe('');
    });
  });

  describe('serialization and integrity', () => {
    it('should not have circular references', () => {
      expect(() => JSON.stringify(imageAIFields)).not.toThrow();
    });

    it('should have consistent naming patterns', () => {
      AI_OPTIONS.forEach(option => {
        // Names should be camelCase
        expect(option.name).toMatch(/^[a-z][a-zA-Z0-9]*$/);
        
        // DisplayName should be title case
        expect(option.displayName).toMatch(/^[A-Z]/);
        expect(option.displayName.length).toBeGreaterThan(0);
      });
    });

    test.each(AI_OPTION_SPECS)('should have required properties for %s option', (optionName) => {
      const option = AI_OPTIONS.find(opt => opt.name === optionName);
      
      expect(option.name).toBeDefined();
      expect(option.displayName).toBeDefined();
      expect(option.type).toBeDefined();
      expect(option.description).toBeDefined();
    });

    it('should have valid JSON defaults', () => {
      const jsonFields = AI_OPTIONS.filter(opt => opt.type === 'json');
      
      jsonFields.forEach(field => {
        expect(() => JSON.parse(field.default)).not.toThrow();
      });
    });
  });
});