// __tests__/nodes/CreateJ2vMovie/presentation/nodeProperties.test.ts

import {
  getAllNodeProperties,
  isValidOperation,
  getOperationValidationRules,
  getOperationDefaults,
  getAdvancedModeParameterName,
  getJsonTemplateParameterName,
  getOperationPlaceholder,
  getOperationDescription,
  getOperationJsonTemplate
} from '../../../../nodes/CreateJ2vMovie/presentation/nodeProperties';

describe('presentation/nodeProperties', () => {
  describe('getAllNodeProperties', () => {
    it('should return an array of node properties', () => {
      const properties = getAllNodeProperties();
      
      expect(Array.isArray(properties)).toBe(true);
      expect(properties.length).toBeGreaterThan(0);
      
      // First property should be operation parameter
      expect(properties[0].name).toBe('operation');
      expect(properties[0].type).toBe('options');
      expect(properties[0].default).toBe('createMovie');
    });

    it('should include operation parameter with correct options', () => {
      const properties = getAllNodeProperties();
      const operationParam = properties[0];
      
      expect(operationParam.options).toBeDefined();
      expect(Array.isArray(operationParam.options)).toBe(true);
      expect(operationParam.options!).toHaveLength(3);
      
      const options = operationParam.options as Array<{ name: string; value: string; description?: string }>;
      expect(options[0].value).toBe('createMovie');
      expect(options[1].value).toBe('mergeVideoAudio');
      expect(options[2].value).toBe('mergeVideos');
    });
  });

  describe('isValidOperation', () => {
    it('should return true for valid operations', () => {
      expect(isValidOperation('createMovie')).toBe(true);
      expect(isValidOperation('mergeVideoAudio')).toBe(true);
      expect(isValidOperation('mergeVideos')).toBe(true);
    });

    it('should return false for invalid operations', () => {
      expect(isValidOperation('invalid')).toBe(false);
      expect(isValidOperation('')).toBe(false);
      expect(isValidOperation('unknownOperation')).toBe(false);
    });
  });

  describe('getOperationValidationRules', () => {
    it('should return validation rules for createMovie', () => {
      const rules = getOperationValidationRules('createMovie');
      
      expect(Array.isArray(rules)).toBe(true);
      expect(rules).toContain('Requires either movie elements or scene elements');
      expect(rules).toContain('Supports export configurations');
    });

    it('should return validation rules for mergeVideoAudio', () => {
      const rules = getOperationValidationRules('mergeVideoAudio');
      
      expect(Array.isArray(rules)).toBe(true);
      expect(rules).toContain('Requires at least one video or audio element');
    });

    it('should return validation rules for mergeVideos', () => {
      const rules = getOperationValidationRules('mergeVideos');
      
      expect(Array.isArray(rules)).toBe(true);
      expect(rules).toContain('Requires at least one video element');
      expect(rules).toContain('Supports transition effects');
    });

    it('should return empty array for unknown operation', () => {
      const rules = getOperationValidationRules('unknownOperation');
      
      expect(Array.isArray(rules)).toBe(true);
      expect(rules).toHaveLength(0);
    });

    it('should handle empty string operation', () => {
      const rules = getOperationValidationRules('');
      
      expect(Array.isArray(rules)).toBe(true);
      expect(rules).toHaveLength(0);
    });
  });

  describe('getOperationDefaults', () => {
    it('should return default values for createMovie', () => {
      const defaults = getOperationDefaults('createMovie');
      
      expect(defaults).toMatchObject({
        advancedMode: false,
        advancedModeMergeVideoAudio: false,
        advancedModeMergeVideos: false,
        cache: true,
        draft: false,
        output_width: 1920,
        output_height: 1080
      });
    });

    it('should return default values for mergeVideoAudio', () => {
      const defaults = getOperationDefaults('mergeVideoAudio');
      
      expect(defaults).toMatchObject({
        advancedMode: false,
        advancedModeMergeVideoAudio: false,
        advancedModeMergeVideos: false,
        cache: true,
        draft: false
      });
      expect(defaults.output_width).toBeUndefined();
      expect(defaults.output_height).toBeUndefined();
    });

    it('should return default values for mergeVideos', () => {
      const defaults = getOperationDefaults('mergeVideos');
      
      expect(defaults).toMatchObject({
        advancedMode: false,
        advancedModeMergeVideoAudio: false,
        advancedModeMergeVideos: false,
        cache: true,
        draft: false,
        transition: 'fade',
        transitionDuration: 1.0
      });
    });

    it('should return basic defaults for unknown operation', () => {
      const defaults = getOperationDefaults('unknownOperation');
      
      expect(defaults).toMatchObject({
        advancedMode: false,
        advancedModeMergeVideoAudio: false,
        advancedModeMergeVideos: false,
        cache: true,
        draft: false
      });
      expect(defaults.output_width).toBeUndefined();
      expect(defaults.transition).toBeUndefined();
    });

    it('should handle empty string operation', () => {
      const defaults = getOperationDefaults('');
      
      expect(defaults).toMatchObject({
        advancedMode: false,
        advancedModeMergeVideoAudio: false,
        advancedModeMergeVideos: false,
        cache: true,
        draft: false
      });
    });
  });

  describe('getAdvancedModeParameterName', () => {
    it('should return correct parameter names for each operation', () => {
      expect(getAdvancedModeParameterName('createMovie')).toBe('advancedMode');
      expect(getAdvancedModeParameterName('mergeVideoAudio')).toBe('advancedModeMergeVideoAudio');
      expect(getAdvancedModeParameterName('mergeVideos')).toBe('advancedModeMergeVideos');
    });

    it('should return default parameter name for unknown operation', () => {
      expect(getAdvancedModeParameterName('unknown')).toBe('advancedMode');
      expect(getAdvancedModeParameterName('')).toBe('advancedMode');
    });
  });

  describe('getJsonTemplateParameterName', () => {
    it('should return correct template parameter names for each operation', () => {
      expect(getJsonTemplateParameterName('createMovie')).toBe('jsonTemplate');
      expect(getJsonTemplateParameterName('mergeVideoAudio')).toBe('jsonTemplateMergeVideoAudio');
      expect(getJsonTemplateParameterName('mergeVideos')).toBe('jsonTemplateMergeVideos');
    });

    it('should return default template parameter name for unknown operation', () => {
      expect(getJsonTemplateParameterName('unknown')).toBe('jsonTemplate');
      expect(getJsonTemplateParameterName('')).toBe('jsonTemplate');
    });
  });

  describe('getOperationPlaceholder', () => {
    it('should return correct placeholders for each operation', () => {
      expect(getOperationPlaceholder('createMovie')).toBe('Add Scene Element');
      expect(getOperationPlaceholder('mergeVideoAudio')).toBe('Add Video or Audio Element');
      expect(getOperationPlaceholder('mergeVideos')).toBe('Add Video Element');
    });

    it('should return default placeholder for unknown operation', () => {
      expect(getOperationPlaceholder('unknown')).toBe('Add Scene Element');
      expect(getOperationPlaceholder('')).toBe('Add Scene Element');
    });
  });

  describe('getOperationDescription', () => {
    it('should return correct descriptions for each operation', () => {
      expect(getOperationDescription('createMovie')).toBe('Elements that appear in scenes (videos, images, text, audio)');
      expect(getOperationDescription('mergeVideoAudio')).toBe('Add video and audio elements to merge together. Typically one video and one audio element.');
      expect(getOperationDescription('mergeVideos')).toBe('Add multiple video elements to merge in sequence with optional transitions.');
    });

    it('should return default description for unknown operation', () => {
      expect(getOperationDescription('unknown')).toBe('Elements that appear in scenes (videos, images, text, audio)');
      expect(getOperationDescription('')).toBe('Elements that appear in scenes (videos, images, text, audio)');
    });
  });

  describe('getOperationJsonTemplate', () => {
    it('should return valid JSON template for createMovie', () => {
      const template = getOperationJsonTemplate('createMovie');
      
      expect(() => JSON.parse(template)).not.toThrow();
      
      const parsed = JSON.parse(template);
      expect(parsed).toHaveProperty('width');
      expect(parsed).toHaveProperty('height');
      expect(parsed).toHaveProperty('quality');
      expect(parsed).toHaveProperty('elements');
      expect(parsed).toHaveProperty('scenes');
      expect(Array.isArray(parsed.elements)).toBe(true);
      expect(Array.isArray(parsed.scenes)).toBe(true);
    });

    it('should return valid JSON template for mergeVideoAudio', () => {
      const template = getOperationJsonTemplate('mergeVideoAudio');
      
      expect(() => JSON.parse(template)).not.toThrow();
      
      const parsed = JSON.parse(template);
      expect(parsed).toHaveProperty('scenes');
      expect(Array.isArray(parsed.scenes)).toBe(true);
      expect(parsed.scenes[0]).toHaveProperty('elements');
      expect(parsed.scenes[0].elements).toHaveLength(2);
      expect(parsed.scenes[0].elements[0].type).toBe('video');
      expect(parsed.scenes[0].elements[1].type).toBe('audio');
    });

    it('should return valid JSON template for mergeVideos', () => {
      const template = getOperationJsonTemplate('mergeVideos');
      
      expect(() => JSON.parse(template)).not.toThrow();
      
      const parsed = JSON.parse(template);
      expect(parsed).toHaveProperty('scenes');
      expect(Array.isArray(parsed.scenes)).toBe(true);
      expect(parsed.scenes).toHaveLength(2);
      expect(parsed.scenes[1]).toHaveProperty('transition');
      expect(parsed.scenes[1].transition).toHaveProperty('style');
      expect(parsed.scenes[1].transition).toHaveProperty('duration');
    });

    it('should return default template for unknown operation', () => {
      const template = getOperationJsonTemplate('unknown');
      const defaultTemplate = getOperationJsonTemplate('createMovie');
      
      expect(template).toBe(defaultTemplate);
    });

    it('should return default template for empty operation', () => {
      const template = getOperationJsonTemplate('');
      const defaultTemplate = getOperationJsonTemplate('createMovie');
      
      expect(template).toBe(defaultTemplate);
    });
  });

  describe('integration tests', () => {
    it('should have consistent operation values across all functions', () => {
      const operations = ['createMovie', 'mergeVideoAudio', 'mergeVideos'];
      
      operations.forEach(operation => {
        expect(isValidOperation(operation)).toBe(true);
        expect(getOperationValidationRules(operation)).toBeDefined();
        expect(getOperationDefaults(operation)).toBeDefined();
        expect(getAdvancedModeParameterName(operation)).toBeDefined();
        expect(getJsonTemplateParameterName(operation)).toBeDefined();
        expect(getOperationPlaceholder(operation)).toBeDefined();
        expect(getOperationDescription(operation)).toBeDefined();
        expect(getOperationJsonTemplate(operation)).toBeDefined();
      });
    });

    it('should provide consistent advanced mode parameter names', () => {
      const createMovieParam = getAdvancedModeParameterName('createMovie');
      const mergeVideoAudioParam = getAdvancedModeParameterName('mergeVideoAudio');
      const mergeVideosParam = getAdvancedModeParameterName('mergeVideos');
      
      expect(createMovieParam).toBe('advancedMode');
      expect(mergeVideoAudioParam).toBe('advancedModeMergeVideoAudio');
      expect(mergeVideosParam).toBe('advancedModeMergeVideos');
      
      // Verify these parameter names exist in defaults
      const defaults = getOperationDefaults('createMovie');
      expect(defaults).toHaveProperty(createMovieParam);
      expect(defaults).toHaveProperty(mergeVideoAudioParam);
      expect(defaults).toHaveProperty(mergeVideosParam);
    });

    it('should provide valid JSON templates for all operations', () => {
      const operations = ['createMovie', 'mergeVideoAudio', 'mergeVideos'];
      
      operations.forEach(operation => {
        const template = getOperationJsonTemplate(operation);
        expect(() => JSON.parse(template)).not.toThrow();
        
        const parsed = JSON.parse(template);
        expect(typeof parsed).toBe('object');
        expect(parsed).not.toBeNull();
      });
    });
  });
});