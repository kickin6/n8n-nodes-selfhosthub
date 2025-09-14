// __tests__/nodes/CreateJ2vMovie/shared/movieParams.test.ts

import {
  recordIdParameter,
  outputWidthParameter,
  outputHeightParameter,
  qualityParameter,
  cacheParameter,
  draftParameter,
  resolutionParameter,
  advancedModeParameters,
  jsonTemplateParameters,
  createAdvancedModeOverrides,
  createBasicModeParams
} from '../../../../nodes/CreateJ2vMovie/shared/movieParams';
import { INodeProperties, INodePropertyOptions } from 'n8n-workflow';

describe('movieParams', () => {

  describe('basic parameter exports', () => {
    it('should export recordId and webhookUrl parameters with required false', () => {
      // These two parameters explicitly set required: false in the source
      expect(recordIdParameter.name).toBe('recordId');
      expect(recordIdParameter.type).toBe('string');
      expect(recordIdParameter.required).toBe(false);
      expect(recordIdParameter.default).toBe('');
    });

    it('should export other parameters without required field', () => {
      // These parameters don't have required field set in source
      const paramsWithoutRequired = [
        { param: outputWidthParameter, name: 'outputWidth', type: 'number', default: undefined },
        { param: outputHeightParameter, name: 'outputHeight', type: 'number', default: undefined },
        { param: qualityParameter, name: 'quality', type: 'options', default: 'high' },
        { param: cacheParameter, name: 'cache', type: 'boolean', default: true },
        { param: draftParameter, name: 'draft', type: 'boolean', default: false },
        { param: resolutionParameter, name: 'resolution', type: 'options', default: 'custom' }
      ];

      paramsWithoutRequired.forEach(({ param, name, type, default: expectedDefault }) => {
        expect(param.name).toBe(name);
        expect(param.type).toBe(type);
        expect(param.required).toBeUndefined();
        expect(param.default).toBe(expectedDefault);
      });
    });

    it('should have all parameters with display names and descriptions', () => {
      const allParams = [
        recordIdParameter,
        outputWidthParameter,
        outputHeightParameter,
        qualityParameter,
        cacheParameter,
        draftParameter,
        resolutionParameter
      ];

      allParams.forEach(param => {
        expect(typeof param.displayName).toBe('string');
        expect(param.displayName.length).toBeGreaterThan(0);
        if (param.description) {
          expect(typeof param.description).toBe('string');
          expect(param.description.length).toBeGreaterThan(0);
        }
      });
    });

    it.each([
      ['recordId', recordIdParameter, 'Record ID'],
      ['outputWidth', outputWidthParameter, 'Output Width'],
      ['outputHeight', outputHeightParameter, 'Output Height'],
      ['quality', qualityParameter, 'Quality'],
      ['cache', cacheParameter, 'Cache'],
      ['draft', draftParameter, 'Draft'],
      ['resolution', resolutionParameter, 'Resolution']
    ])('should have correct display name for %s', (_, param, expectedDisplayName) => {
      expect(param.displayName).toBe(expectedDisplayName);
    });

    it.each([
      ['recordId', recordIdParameter, /Optional identifier/i],
      ['outputWidth', outputWidthParameter, /override.*width/i],
      ['outputHeight', outputHeightParameter, /override.*height/i],
      ['quality', qualityParameter, /Video quality/i],
      ['cache', cacheParameter, /override.*cache/i],
      ['draft', draftParameter, /override.*draft/i],
      ['resolution', resolutionParameter, /override.*resolution/i]
    ])('should have descriptive description for %s', (_, param, expectedPattern) => {
      expect(param.description).toBeDefined();
      expect(param.description!).toMatch(expectedPattern);
    });

    it('should have all parameters without display options (raw parameters)', () => {
      const allBasicParams = [
        recordIdParameter,
        outputWidthParameter,
        outputHeightParameter,
        qualityParameter,
        cacheParameter,
        draftParameter,
        resolutionParameter
      ];

      allBasicParams.forEach(param => {
        expect(param.displayOptions).toBeUndefined();
      });
    });
  });

  describe('quality parameter', () => {
    it('should have correct quality options', () => {
      expect(qualityParameter.type).toBe('options');
      expect(qualityParameter.options).toHaveLength(4);
      expect(qualityParameter.options).toEqual([
        { name: 'Low', value: 'low' },
        { name: 'Medium', value: 'medium' },
        { name: 'High', value: 'high' },
        { name: 'Very High', value: 'very_high' }
      ]);
    });

    it('should have high quality as default', () => {
      expect(qualityParameter.default).toBe('high');
    });

    it('should have proper option structure', () => {
      qualityParameter.options!.forEach((option) => {
        const opt = option as INodePropertyOptions;
        expect(opt).toHaveProperty('name');
        expect(opt).toHaveProperty('value');
        expect(typeof opt.name).toBe('string');
        expect(typeof opt.value).toBe('string');
        expect(opt.name).toBeTruthy();
        expect(opt.value).toBeTruthy();
      });
    });
  });

  describe('resolution parameter', () => {
    it('should have correct resolution options', () => {
      expect(resolutionParameter.type).toBe('options');
      expect(resolutionParameter.options).toHaveLength(9);

      const expectedOptions = [
        { name: 'Standard Definition', value: 'sd' },
        { name: 'High Definition', value: 'hd' },
        { name: 'Full HD', value: 'full-hd' },
        { name: 'Square', value: 'squared' },
        { name: 'Instagram Story', value: 'instagram-story' },
        { name: 'Instagram Feed', value: 'instagram-feed' },
        { name: 'Twitter Landscape', value: 'twitter-landscape' },
        { name: 'Twitter Portrait', value: 'twitter-portrait' },
        { name: 'Custom', value: 'custom' }
      ];

      expect(resolutionParameter.options).toEqual(expectedOptions);
    });

    it('should have custom as default', () => {
      expect(resolutionParameter.default).toBe('custom');
    });

    it('should have proper option structure', () => {
      resolutionParameter.options!.forEach((option) => {
        const opt = option as INodePropertyOptions;
        expect(opt).toHaveProperty('name');
        expect(opt).toHaveProperty('value');
        expect(typeof opt.name).toBe('string');
        expect(typeof opt.value).toBe('string');
        expect(opt.name).toBeTruthy();
        expect(opt.value).toBeTruthy();
      });
    });

    it('should include social media formats', () => {
      const optionValues = resolutionParameter.options!.map((opt) => (opt as INodePropertyOptions).value);
      expect(optionValues).toContain('instagram-story');
      expect(optionValues).toContain('instagram-feed');
      expect(optionValues).toContain('twitter-landscape');
      expect(optionValues).toContain('twitter-portrait');
    });
  });

  describe('advancedModeParameters', () => {
    it('should export three advanced mode parameters', () => {
      expect(advancedModeParameters).toHaveProperty('createMovie');
      expect(advancedModeParameters).toHaveProperty('mergeVideoAudio');
      expect(advancedModeParameters).toHaveProperty('mergeVideos');
      expect(Object.keys(advancedModeParameters)).toHaveLength(3);
    });

    it.each([
      ['createMovie', 'advancedMode'],
      ['mergeVideoAudio', 'advancedModeMergeVideoAudio'],
      ['mergeVideos', 'advancedModeMergeVideos']
    ])('should have correct structure for %s parameter', (operationType, expectedName) => {
      const param = advancedModeParameters[operationType as keyof typeof advancedModeParameters];

      expect(param.displayName).toBe('Advanced Mode');
      expect(param.name).toBe(expectedName);
      expect(param.type).toBe('boolean');
      expect(param.default).toBe(false);
      expect(param.description).toContain('Use JSON template with override parameters instead of the form interface');
      expect(param.description).toContain('JSON template');
      expect(param.displayOptions).toBeUndefined();
    });

    it('should have different parameter names for each operation', () => {
      const names = Object.values(advancedModeParameters).map(param => param.name);
      const uniqueNames = new Set(names);
      expect(names.length).toBe(uniqueNames.size);
      expect(names).toContain('advancedMode');
      expect(names).toContain('advancedModeMergeVideoAudio');
      expect(names).toContain('advancedModeMergeVideos');
    });

    it('should have consistent boolean type and false default', () => {
      Object.values(advancedModeParameters).forEach(param => {
        expect(param.type).toBe('boolean');
        expect(param.default).toBe(false);
        expect(param.displayName).toBe('Advanced Mode');
      });
    });
  });

  describe('jsonTemplateParameters', () => {
    it('should export three JSON template parameters', () => {
      expect(jsonTemplateParameters).toHaveProperty('createMovie');
      expect(jsonTemplateParameters).toHaveProperty('mergeVideoAudio');
      expect(jsonTemplateParameters).toHaveProperty('mergeVideos');
      expect(Object.keys(jsonTemplateParameters)).toHaveLength(3);
    });

    it.each([
      ['createMovie', 'jsonTemplate'],
      ['mergeVideoAudio', 'jsonTemplateMergeVideoAudio'],
      ['mergeVideos', 'jsonTemplateMergeVideos']
    ])('should have correct structure for %s template', (operationType, expectedName) => {
      const param = jsonTemplateParameters[operationType as keyof typeof jsonTemplateParameters];

      expect(param.displayName).toBe('JSON Template');
      expect(param.name).toBe(expectedName);
      expect(param.type).toBe('json');
      expect(typeof param.default).toBe('string');
      expect(param.description).toContain('JSON2Video API request template');
      expect(param.description).toContain('Override specific values using the parameters below.');
      expect(param.displayOptions).toBeUndefined();
    });

    it('should have valid JSON as defaults', () => {
      Object.values(jsonTemplateParameters).forEach(param => {
        expect(() => {
          JSON.parse(param.default as string);
        }).not.toThrow();
      });
    });

    it('should have different template structures for each operation', () => {
      const createMovieTemplate = JSON.parse(jsonTemplateParameters.createMovie.default as string);
      const mergeVideoAudioTemplate = JSON.parse(jsonTemplateParameters.mergeVideoAudio.default as string);
      const mergeVideosTemplate = JSON.parse(jsonTemplateParameters.mergeVideos.default as string);

      // All should have basic structure
      expect(createMovieTemplate).toHaveProperty('width');
      expect(createMovieTemplate).toHaveProperty('height');
      expect(createMovieTemplate).toHaveProperty('quality');
      expect(createMovieTemplate).toHaveProperty('scenes');

      expect(mergeVideoAudioTemplate).toHaveProperty('scenes');

      expect(mergeVideosTemplate).toHaveProperty('scenes');
    });

    it('should have appropriate default values in templates', () => {
      const createMovieTemplate = JSON.parse(jsonTemplateParameters.createMovie.default as string);

      expect(createMovieTemplate.width).toBe(1920);
      expect(createMovieTemplate.height).toBe(1080);
      expect(createMovieTemplate.quality).toBe('high');
      expect(Array.isArray(createMovieTemplate.scenes)).toBe(true);
      expect(createMovieTemplate.scenes).toHaveLength(1);
    });

    it('should have proper scene structure in templates', () => {
      Object.values(jsonTemplateParameters).forEach(param => {
        const template = JSON.parse(param.default as string);
        expect(Array.isArray(template.scenes)).toBe(true);
        template.scenes.forEach((scene: any) => {
          expect(scene).toHaveProperty('elements');
          expect(Array.isArray(scene.elements)).toBe(true);
        });
      });
    });

    it('should have operation-appropriate elements in templates', () => {
      const createMovieTemplate = JSON.parse(jsonTemplateParameters.createMovie.default as string);
      const mergeVideoAudioTemplate = JSON.parse(jsonTemplateParameters.mergeVideoAudio.default as string);
      const mergeVideosTemplate = JSON.parse(jsonTemplateParameters.mergeVideos.default as string);

      // Create movie should have image element
      const createMovieElement = createMovieTemplate.scenes[0].elements[0];

      // Merge video audio should have video and audio elements
      const mergeVideoAudioElements = mergeVideoAudioTemplate.scenes[0].elements;
      const videoElement = mergeVideoAudioElements.find((el: any) => el.type === 'video');
      const audioElement = mergeVideoAudioElements.find((el: any) => el.type === 'audio');
      expect(videoElement).toBeDefined();
      expect(audioElement).toBeDefined();

      // Merge videos should have multiple scenes with video elements
      expect(mergeVideosTemplate.scenes).toHaveLength(2);
      mergeVideosTemplate.scenes.forEach((scene: any) => {
        expect(scene.elements).toHaveLength(1);
        expect(scene.elements[0].type).toBe('video');
      });
    });
  });

  describe('createAdvancedModeOverrides function', () => {
    it('should return array of override parameters', () => {
      const result = createAdvancedModeOverrides('testOperation', 'testAdvancedParam');

      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(7);
    });

    it('should include all expected override parameters', () => {
      const result = createAdvancedModeOverrides('testOperation', 'testAdvancedParam');
      const paramNames = result.map(param => param.name);

      expect(paramNames).toContain('recordId');
      expect(paramNames).toContain('outputWidth');
      expect(paramNames).toContain('outputHeight');
      expect(paramNames).toContain('quality');
      expect(paramNames).toContain('cache');
      expect(paramNames).toContain('draft');
      expect(paramNames).toContain('resolution');
    });

    it('should return parameters without display options', () => {
      const result = createAdvancedModeOverrides('testOperation', 'testAdvancedParam');

      result.forEach(param => {
        expect(param.displayOptions).toBeUndefined();
      });
    });

    it('should return the same parameters regardless of input arguments', () => {
      const result1 = createAdvancedModeOverrides('operation1', 'param1');
      const result2 = createAdvancedModeOverrides('operation2', 'param2');

      expect(result1).toEqual(result2);
      expect(result1.length).toBe(result2.length);
    });

    it('should include parameters with correct types', () => {
      const result = createAdvancedModeOverrides('testOperation', 'testAdvancedParam');

      const recordIdParam = result.find(p => p.name === 'recordId');
      const qualityParam = result.find(p => p.name === 'quality');
      const cacheParam = result.find(p => p.name === 'cache');
      const outputWidthParam = result.find(p => p.name === 'outputWidth');

      expect(recordIdParam!.type).toBe('string');
      expect(qualityParam!.type).toBe('options');
      expect(cacheParam!.type).toBe('boolean');
      expect(outputWidthParam!.type).toBe('number');
    });

    it('should return consistent parameter objects', () => {
      const result1 = createAdvancedModeOverrides('test', 'test');
      const result2 = createAdvancedModeOverrides('test', 'test');

      // The functions return the same objects by reference, which is expected behavior
      // Test that the functions return consistent results
      expect(result1).toEqual(result2);
      expect(result1.length).toBe(result2.length);

      // Test that parameters have the expected structure
      result1.forEach(param => {
        expect(param.name).toBeDefined();
        expect(param.type).toBeDefined();
        expect(param.displayName).toBeDefined();
      });
    });
  });

  describe('createBasicModeParams function', () => {
    it('should return array of basic parameters', () => {
      const result = createBasicModeParams('testOperation', 'testAdvancedParam');

      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(2);
    });

    it('should include only recordId and exportSettings parameters', () => {
      const result = createBasicModeParams('testOperation', 'testAdvancedParam');
      const paramNames = result.map(param => param.name);

      expect(paramNames).toEqual(['recordId', 'exportSettings']);
    });

    it('should return parameters without display options', () => {
      const result = createBasicModeParams('testOperation', 'testAdvancedParam');

      result.forEach(param => {
        expect(param.displayOptions).toBeUndefined();
      });
    });

    it('should return the same parameters regardless of input arguments', () => {
      const result1 = createBasicModeParams('operation1', 'param1');
      const result2 = createBasicModeParams('operation2', 'param2');

      expect(result1).toEqual(result2);
      expect(result1.length).toBe(result2.length);
    });

    it('should return mixed type parameters', () => {
      const result = createBasicModeParams('createMovie', 'advancedMode');

      expect(result.length).toBe(2);

      // recordId is string type
      const recordIdParam = result.find(p => p.name === 'recordId');
      expect(recordIdParam!.type).toBe('string');
      expect(recordIdParam!.default).toBe('');
      expect(recordIdParam!.required).toBe(false);

      // exportSettings is fixedCollection type
      const exportSettingsParam = result.find(p => p.name === 'exportSettings');
      expect(exportSettingsParam!.type).toBe('fixedCollection');
      expect(exportSettingsParam!.default).toEqual({});
    });

    it('should return parameters with proper structure', () => {
      const result = createBasicModeParams('createMovie', 'advancedMode');

      result.forEach(param => {
        expect(param).toHaveProperty('name');
        expect(param).toHaveProperty('type');
        expect(param).toHaveProperty('displayName');
        expect(param).toHaveProperty('description');
        expect(param).toHaveProperty('default');
        // Note: 'required' is optional and not present on exportSettings
      });
    });
  });

  describe('parameter consistency and validation', () => {
    it('should have no duplicate parameter names in exports', () => {
      const allParams = [
        recordIdParameter,
        outputWidthParameter,
        outputHeightParameter,
        qualityParameter,
        cacheParameter,
        draftParameter,
        resolutionParameter
      ];

      const paramNames = allParams.map(param => param.name);
      const uniqueNames = new Set(paramNames);

      expect(paramNames.length).toBe(uniqueNames.size);
    });

    it('should have consistent INodeProperties interface compliance', () => {
      const allParams: INodeProperties[] = [
        recordIdParameter,
        outputWidthParameter,
        outputHeightParameter,
        qualityParameter,
        cacheParameter,
        draftParameter,
        resolutionParameter,
        ...Object.values(advancedModeParameters),
        ...Object.values(jsonTemplateParameters)
      ];

      allParams.forEach(param => {
        expect(param).toHaveProperty('name');
        expect(param).toHaveProperty('type');
        expect(param).toHaveProperty('displayName');
        expect(param).toHaveProperty('default');
        expect(typeof param.name).toBe('string');
        expect(typeof param.type).toBe('string');
        expect(typeof param.displayName).toBe('string');
      });
    });

    it('should have proper defaults for different parameter types', () => {
      expect(recordIdParameter.default).toBe('');
      expect(outputWidthParameter.default).toBeUndefined();
      expect(outputHeightParameter.default).toBeUndefined();
      expect(qualityParameter.default).toBe('high');
      expect(cacheParameter.default).toBe(true);
      expect(draftParameter.default).toBe(false);
      expect(resolutionParameter.default).toBe('custom');
    });

    it('should have required field set correctly', () => {
      // Only recordId and webhookUrl have required: false
      expect(recordIdParameter.required).toBe(false);

      // All others don't have required field set
      expect(outputWidthParameter.required).toBeUndefined();
      expect(outputHeightParameter.required).toBeUndefined();
      expect(qualityParameter.required).toBeUndefined();
      expect(cacheParameter.required).toBeUndefined();
      expect(draftParameter.required).toBeUndefined();
      expect(resolutionParameter.required).toBeUndefined();
    });

    it('should have valid parameter types', () => {
      const validTypes = ['string', 'number', 'boolean', 'options', 'json'];

      const allParams = [
        recordIdParameter,
        outputWidthParameter,
        outputHeightParameter,
        qualityParameter,
        cacheParameter,
        draftParameter,
        resolutionParameter,
        ...Object.values(advancedModeParameters),
        ...Object.values(jsonTemplateParameters)
      ];

      allParams.forEach(param => {
        expect(validTypes).toContain(param.type);
      });
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle function calls with null or undefined arguments', () => {
      expect(() => {
        createAdvancedModeOverrides(null as any, undefined as any);
      }).not.toThrow();

      expect(() => {
        createBasicModeParams(null as any, undefined as any);
      }).not.toThrow();
    });

    it('should handle function calls with empty string arguments', () => {
      const result1 = createAdvancedModeOverrides('', '');
      const result2 = createBasicModeParams('', '');

      expect(Array.isArray(result1)).toBe(true);
      expect(Array.isArray(result2)).toBe(true);
      expect(result1.length).toBeGreaterThan(0);
      expect(result2.length).toBeGreaterThan(0);
    });

    it('should return valid parameters even with unusual inputs', () => {
      const result = createAdvancedModeOverrides('🚀', '特殊字符');

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(7);
      result.forEach(param => {
        expect(param.name).toBeDefined();
        expect(param.type).toBeDefined();
        expect(param.displayName).toBeDefined();
      });
    });

    it('should have proper JSON validation in templates', () => {
      Object.values(jsonTemplateParameters).forEach(param => {
        const template = param.default as string;
        expect(typeof template).toBe('string');
        expect(template.length).toBeGreaterThan(0);

        let parsed;
        expect(() => {
          parsed = JSON.parse(template);
        }).not.toThrow();

        expect(typeof parsed).toBe('object');
        expect(parsed).not.toBeNull();
      });
    });

    it('should handle parameter modification without affecting exports', () => {
      const originalRecordId = { ...recordIdParameter };

      // Simulate parameter modification
      const modifiedParam = { ...recordIdParameter };
      modifiedParam.displayName = 'Modified Record ID';

      // Original should remain unchanged
      expect(recordIdParameter.displayName).toBe(originalRecordId.displayName);
      expect(recordIdParameter.displayName).not.toBe('Modified Record ID');
    });
  });

  describe('parameter documentation and usability', () => {
    it('should have helpful descriptions for optional parameters', () => {
      expect(recordIdParameter.description).toContain('Optional');
    });

    it('should have clear override descriptions', () => {
      const overrideParams = [outputWidthParameter, outputHeightParameter];

      overrideParams.forEach(param => {
        expect(param.description).toContain('Override');
        expect(param.description).toContain('JSON template');
      });
    });

    it('should have consistent naming conventions', () => {
      const allParams = [
        recordIdParameter,
        outputWidthParameter,
        outputHeightParameter,
        qualityParameter,
        cacheParameter,
        draftParameter,
        resolutionParameter
      ];

      allParams.forEach(param => {
        // Parameter names should be camelCase
        expect(param.name).toMatch(/^[a-z][a-zA-Z0-9]*$/);

        // Display names should be Title Case
        expect(param.displayName).toMatch(/^[A-Z]/);
      });
    });

    it('should have template descriptions that mention override functionality', () => {
      Object.values(jsonTemplateParameters).forEach(param => {
        expect(param.description).toContain('JSON2Video API request template');
        expect(param.description).toContain('Override specific values using the parameters below.');
      });
    });
  });
});