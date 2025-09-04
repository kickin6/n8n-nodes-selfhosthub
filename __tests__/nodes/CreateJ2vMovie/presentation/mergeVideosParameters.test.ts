// __tests__/nodes/CreateJ2vMovie/presentation/mergeVideosParameters.test.ts

import {
  mergeVideosParameters,
  mergeVideosAdvancedModeParameter,
  mergeVideosJsonTemplateParameter,
  mergeVideosAdvancedParameters
} from '../../../../nodes/CreateJ2vMovie/presentation/mergeVideosParameters';
import { INodeProperties, INodePropertyCollection } from 'n8n-workflow';

describe('mergeVideosParameters', () => {
  describe('main parameter array', () => {
    it.each([
      ['recordId parameter', 'recordId', 'string', false],
      ['webhookUrl parameter', 'webhookUrl', 'string', false],
      ['video elements collection', 'videoElements', 'fixedCollection', false],
      ['transition style parameter', 'transition', 'options', false],
      ['transition duration parameter', 'transitionDuration', 'number', false],
      ['output settings collection', 'outputSettings', 'fixedCollection', false]
    ])('should have %s', (_, paramName, expectedType, isRequired) => {
      const param = mergeVideosParameters.find(p => p.name === paramName);
      
      expect(param).toBeDefined();
      expect(param!.type).toBe(expectedType);
      
      if (isRequired) {
        expect(param!.required).toBe(true);
      }
    });

    it.each([
      ['recordId shows for mergeVideos operation', 'recordId', ['mergeVideos']],
      ['videoElements shows for mergeVideos operation', 'videoElements', ['mergeVideos']],
      ['transition shows for mergeVideos operation', 'transition', ['mergeVideos']],
      ['transitionDuration shows for mergeVideos operation', 'transitionDuration', ['mergeVideos']],
      ['outputSettings shows for mergeVideos operation', 'outputSettings', ['mergeVideos']]
    ])('should have correct display options: %s', (_, paramName, expectedOperations) => {
      const param = mergeVideosParameters.find(p => p.name === paramName);
      
      expect(param).toBeDefined();
      expect(param!.displayOptions?.show?.operation).toEqual(expectedOperations);
    });

    it.each([
      ['recordId hidden in basic mode', 'recordId', [false]],
      ['videoElements shown in basic mode', 'videoElements', [false]],
      ['transition shown in basic mode', 'transition', [false]],
      ['transitionDuration shown in basic mode', 'transitionDuration', [false]],
      ['outputSettings shown in basic mode', 'outputSettings', [false]]
    ])('should have correct advanced mode display: %s', (_, paramName, expectedAdvancedMode) => {
      const param = mergeVideosParameters.find(p => p.name === paramName);
      
      if (param && param.displayOptions?.show?.advancedModeMergeVideos) {
        expect(param.displayOptions.show.advancedModeMergeVideos).toEqual(expectedAdvancedMode);
      }
    });

    it.each([
      ['recordId has string default', 'recordId', ''],
      ['webhookUrl has string default', 'webhookUrl', ''],
      ['videoElements has object default', 'videoElements', {}],
      ['transition has none default', 'transition', 'none'],
      ['transitionDuration has numeric default', 'transitionDuration', 1],
      ['outputSettings has object default', 'outputSettings', {}]
    ])('should have correct defaults: %s', (_, paramName, expectedDefault) => {
      const param = mergeVideosParameters.find(p => p.name === paramName);
      
      expect(param).toBeDefined();
      expect(param!.default).toEqual(expectedDefault);
    });

    it('should have descriptive placeholders and descriptions', () => {
      const videoElementsParam = mergeVideosParameters.find(p => p.name === 'videoElements');
      
      expect(videoElementsParam!.placeholder).toBe('Add Video');
      expect(videoElementsParam!.description).toContain('Add videos to merge in sequence');
    });
  });

  describe('video elements configuration', () => {
    let videoElementsParam: INodeProperties;
    let videoOption: INodePropertyCollection;

    beforeEach(() => {
      videoElementsParam = mergeVideosParameters.find(p => p.name === 'videoElements')!;
      videoOption = videoElementsParam.options![0] as INodePropertyCollection;
    });

    it('should have correct video elements structure', () => {
      expect(videoElementsParam).toBeDefined();
      expect(videoElementsParam.type).toBe('fixedCollection');
      expect(videoElementsParam.typeOptions?.multipleValues).toBe(true);
      expect(videoElementsParam.typeOptions?.sortable).toBe(true);
      expect(videoElementsParam.options).toHaveLength(1);
      expect(videoOption.name).toBe('videoDetails');
      expect(videoOption.displayName).toBe('Video');
      expect(Array.isArray(videoOption.values)).toBe(true);
    });

    it.each([
      ['src field as string', 'src', 'string', '', true],
      ['start field as number', 'start', 'number', 0, false],
      ['duration field as number', 'duration', 'number', -1, false],
      ['speed field as number', 'speed', 'number', 1, false],
      ['volume field as number', 'volume', 'number', 1, false],
      ['loop field as boolean', 'loop', 'boolean', false, false]
    ])('should have %s', (_, fieldName, expectedType, expectedDefault, isRequired) => {
      const field = videoOption.values.find(f => f.name === fieldName);
      
      expect(field).toBeDefined();
      expect(field!.type).toBe(expectedType);
      expect(field!.default).toBe(expectedDefault);
      if (isRequired) {
        expect(field!.required).toBe(true);
      }
    });

    it('should have speed field with proper validation', () => {
      const speedField = videoOption.values.find(f => f.name === 'speed');
      
      expect(speedField!.typeOptions?.minValue).toBe(0.1);
      expect(speedField!.typeOptions?.maxValue).toBe(10);
      expect(speedField!.typeOptions?.numberPrecision).toBe(2);
    });

    it('should have volume field with proper validation', () => {
      const volumeField = videoOption.values.find(f => f.name === 'volume');
      
      expect(volumeField!.typeOptions?.minValue).toBe(0);
      expect(volumeField!.typeOptions?.maxValue).toBe(10);
      expect(volumeField!.typeOptions?.numberPrecision).toBe(2);
    });

    it('should have required src field', () => {
      const srcField = videoOption.values.find(f => f.name === 'src');
      
      expect(srcField!.required).toBe(true);
      expect(srcField!.description).toContain('URL of the video file');
    });

    it('should have descriptive field descriptions', () => {
      const fields = videoOption.values;
      
      fields.forEach(field => {
        expect(field.description).toBeDefined();
        expect(typeof field.description).toBe('string');
        expect(field.description!.length).toBeGreaterThan(0);
      });
    });
  });

  describe('transition parameters', () => {
    it('should have transition options with correct values', () => {
      const transitionParam = mergeVideosParameters.find(p => p.name === 'transition');
      
      expect(transitionParam!.options).toEqual([
        { name: 'None', value: 'none' },
        { name: 'Fade', value: 'fade' },
        { name: 'Dissolve', value: 'dissolve' },
        { name: 'Wipe Left', value: 'wipeLeft' },
        { name: 'Wipe Right', value: 'wipeRight' },
        { name: 'Wipe Up', value: 'wipeUp' },
        { name: 'Wipe Down', value: 'wipeDown' }
      ]);
    });

    it('should have transition duration with proper validation', () => {
      const transitionDurationParam = mergeVideosParameters.find(p => p.name === 'transitionDuration');
      
      expect(transitionDurationParam!.typeOptions?.minValue).toBe(0.1);
      expect(transitionDurationParam!.typeOptions?.maxValue).toBe(10);
      expect(transitionDurationParam!.typeOptions?.numberPrecision).toBe(2);
    });

    it('should have conditional display for transition duration', () => {
      const transitionDurationParam = mergeVideosParameters.find(p => p.name === 'transitionDuration');
      
      expect(transitionDurationParam!.displayOptions?.show?.transition).toEqual([
        'fade', 'dissolve', 'wipeLeft', 'wipeRight', 'wipeUp', 'wipeDown'
      ]);
    });

    it('should have proper display conditions for transitions', () => {
      const transitionParam = mergeVideosParameters.find(p => p.name === 'transition');
      const transitionDurationParam = mergeVideosParameters.find(p => p.name === 'transitionDuration');
      
      expect(transitionParam!.displayOptions?.show?.operation).toEqual(['mergeVideos']);
      expect(transitionParam!.displayOptions?.show?.advancedModeMergeVideos).toEqual([false]);
      
      expect(transitionDurationParam!.displayOptions?.show?.operation).toEqual(['mergeVideos']);
      expect(transitionDurationParam!.displayOptions?.show?.advancedModeMergeVideos).toEqual([false]);
    });
  });

  describe('output settings configuration', () => {
    let outputSettingsParam: INodeProperties;
    let outputOption: INodePropertyCollection;

    beforeEach(() => {
      outputSettingsParam = mergeVideosParameters.find(p => p.name === 'outputSettings')!;
      outputOption = outputSettingsParam.options![0] as INodePropertyCollection;
    });

    it('should have correct output settings structure', () => {
      expect(outputSettingsParam).toBeDefined();
      expect(outputSettingsParam.type).toBe('fixedCollection');
      expect(outputSettingsParam.options).toHaveLength(1);
      expect(outputOption.name).toBe('outputDetails');
      expect(outputOption.displayName).toBe('Output Details');
      expect(Array.isArray(outputOption.values)).toBe(true);
    });

    it.each([
      ['width field as number', 'width', 'number', 1024],
      ['height field as number', 'height', 'number', 768],
      ['fps field as number', 'fps', 'number', 30],
      ['quality field as options', 'quality', 'options', 'high'],
      ['format field as options', 'format', 'options', 'mp4']
    ])('should have %s', (_, fieldName, expectedType, expectedDefault) => {
      const field = outputOption.values.find(f => f.name === fieldName);
      
      expect(field).toBeDefined();
      expect(field!.type).toBe(expectedType);
      expect(field!.default).toBe(expectedDefault);
    });

    it('should have width field with proper validation', () => {
      const widthField = outputOption.values.find(f => f.name === 'width');
      
      expect(widthField!.typeOptions?.minValue).toBe(50);
      expect(widthField!.typeOptions?.maxValue).toBe(3840);
      expect(widthField!.typeOptions?.numberPrecision).toBe(0);
    });

    it('should have height field with proper validation', () => {
      const heightField = outputOption.values.find(f => f.name === 'height');
      
      expect(heightField!.typeOptions?.minValue).toBe(50);
      expect(heightField!.typeOptions?.maxValue).toBe(3840);
      expect(heightField!.typeOptions?.numberPrecision).toBe(0);
    });

    it('should have fps field with proper validation', () => {
      const fpsField = outputOption.values.find(f => f.name === 'fps');
      
      expect(fpsField!.typeOptions?.minValue).toBe(1);
      expect(fpsField!.typeOptions?.maxValue).toBe(120);
      expect(fpsField!.typeOptions?.numberPrecision).toBe(0);
    });

    it('should have quality options with correct values', () => {
      const qualityField = outputOption.values.find(f => f.name === 'quality');
      
      expect(qualityField!.options).toEqual([
        { name: 'Low', value: 'low' },
        { name: 'Medium', value: 'medium' },
        { name: 'High', value: 'high' },
        { name: 'Very High', value: 'very_high' }
      ]);
    });

    it('should have format options with correct values', () => {
      const formatField = outputOption.values.find(f => f.name === 'format');
      
      expect(formatField!.options).toEqual([
        { name: 'MP4', value: 'mp4' },
        { name: 'WebM', value: 'webm' }
      ]);
    });

    it('should have descriptive field descriptions', () => {
      const fields = outputOption.values;
      
      fields.forEach(field => {
        expect(field.description).toBeDefined();
        expect(typeof field.description).toBe('string');
        expect(field.description!.length).toBeGreaterThan(0);
      });
    });
  });

  describe('advanced mode parameter', () => {
    it('should have correct advanced mode parameter structure', () => {
      expect(mergeVideosAdvancedModeParameter).toBeDefined();
      expect(mergeVideosAdvancedModeParameter.name).toBe('advancedModeMergeVideos');
      expect(mergeVideosAdvancedModeParameter.type).toBe('boolean');
      expect(mergeVideosAdvancedModeParameter.displayOptions?.show?.operation).toEqual(['mergeVideos']);
    });

    it('should have correct display name and description', () => {
      expect(mergeVideosAdvancedModeParameter.displayName).toContain('Advanced');
      expect(typeof mergeVideosAdvancedModeParameter.description).toBe('string');
      expect(mergeVideosAdvancedModeParameter.description!.length).toBeGreaterThan(0);
    });

    it('should have correct default value', () => {
      expect(mergeVideosAdvancedModeParameter.default).toBe(false);
    });
  });

  describe('JSON template parameter', () => {
    it('should have correct JSON template parameter structure', () => {
      expect(mergeVideosJsonTemplateParameter).toBeDefined();
      expect(mergeVideosJsonTemplateParameter.name).toBe('jsonTemplateMergeVideos');
      expect(mergeVideosJsonTemplateParameter.type).toBe('json');
    });

    it('should have correct display options for advanced mode', () => {
      expect(mergeVideosJsonTemplateParameter.displayOptions?.show?.operation).toEqual(['mergeVideos']);
      expect(mergeVideosJsonTemplateParameter.displayOptions?.show?.advancedModeMergeVideos).toEqual([true]);
    });

    it('should have JSON template with proper structure', () => {
      expect(typeof mergeVideosJsonTemplateParameter.default).toBe('string');
      
      const defaultTemplate = mergeVideosJsonTemplateParameter.default as string;
      expect(() => JSON.parse(defaultTemplate)).not.toThrow();
      
      const parsed = JSON.parse(defaultTemplate);
      expect(parsed).toHaveProperty('scenes');
      expect(Array.isArray(parsed.scenes)).toBe(true);
      expect(parsed).toHaveProperty('fps');
      expect(parsed).toHaveProperty('width');
      expect(parsed).toHaveProperty('height');
      expect(parsed).toHaveProperty('quality');
    });

    it('should have template with multiple scenes for video merging', () => {
      const defaultTemplate = mergeVideosJsonTemplateParameter.default as string;
      const parsed = JSON.parse(defaultTemplate);
      
      expect(parsed.scenes.length).toBeGreaterThan(1);
      
      parsed.scenes.forEach((scene: any) => {
        expect(scene).toHaveProperty('elements');
        expect(Array.isArray(scene.elements)).toBe(true);
      });
    });

    it('should have description that mentions override functionality', () => {
      expect(mergeVideosJsonTemplateParameter.description).toContain('Override parameters');
    });
  });

  describe('advanced parameters array', () => {
    it('should contain expected override parameters', () => {
      expect(Array.isArray(mergeVideosAdvancedParameters)).toBe(true);
      expect(mergeVideosAdvancedParameters.length).toBeGreaterThan(0);
      
      const paramNames = mergeVideosAdvancedParameters.map(p => p.name);
      
      expect(paramNames).toContain('recordId');
      expect(paramNames).toContain('webhookUrl');
      expect(paramNames).toContain('outputWidth');
      expect(paramNames).toContain('outputHeight');
      expect(paramNames).toContain('framerate');
      expect(paramNames).toContain('quality');
      expect(paramNames).toContain('cache');
      expect(paramNames).toContain('draft');
      expect(paramNames).toContain('resolution');
    });

    it.each([
      ['recordId', 'string'],
      ['webhookUrl', 'string'],
      ['outputWidth', 'number'],
      ['outputHeight', 'number'],
      ['framerate', 'number'],
      ['quality', 'options'],
      ['cache', 'boolean'],
      ['draft', 'boolean'],
      ['resolution', 'options']
    ])('should have correct type for %s parameter', (paramName, expectedType) => {
      const param = mergeVideosAdvancedParameters.find(p => p.name === paramName);
      
      expect(param).toBeDefined();
      expect(param!.type).toBe(expectedType);
    });

    it('should have correct display options for all advanced parameters', () => {
      mergeVideosAdvancedParameters.forEach(param => {
        expect(param.displayOptions?.show?.operation).toEqual(['mergeVideos']);
        expect(param.displayOptions?.show?.advancedModeMergeVideos).toEqual([true]);
      });
    });

    it.each([
      ['quality has options', 'quality', true],
      ['resolution has options', 'resolution', true],
      ['recordId has no special validation', 'recordId', false],
      ['webhookUrl has no special validation', 'webhookUrl', false],
      ['cache has no special validation', 'cache', false],
      ['draft has no special validation', 'draft', false],
      ['outputWidth has no validation (override param)', 'outputWidth', false],
      ['outputHeight has no validation (override param)', 'outputHeight', false],
      ['framerate has no validation (override param)', 'framerate', false]
    ])('should have validation where expected: %s', (_, paramName, shouldHaveValidation) => {
      const param = mergeVideosAdvancedParameters.find(p => p.name === paramName);
      
      expect(param).toBeDefined();
      
      if (shouldHaveValidation) {
        if (param!.type === 'options') {
          expect(param!.options).toBeDefined();
          expect(Array.isArray(param!.options)).toBe(true);
          expect(param!.options!.length).toBeGreaterThan(0);
        }
      }
    });

    it('should have appropriate default values for advanced parameters', () => {
      const recordIdParam = mergeVideosAdvancedParameters.find(p => p.name === 'recordId');
      const webhookUrlParam = mergeVideosAdvancedParameters.find(p => p.name === 'webhookUrl');
      const cacheParam = mergeVideosAdvancedParameters.find(p => p.name === 'cache');
      const draftParam = mergeVideosAdvancedParameters.find(p => p.name === 'draft');
      const outputWidthParam = mergeVideosAdvancedParameters.find(p => p.name === 'outputWidth');
      const outputHeightParam = mergeVideosAdvancedParameters.find(p => p.name === 'outputHeight');
      const framerateParam = mergeVideosAdvancedParameters.find(p => p.name === 'framerate');
      const resolutionParam = mergeVideosAdvancedParameters.find(p => p.name === 'resolution');

      expect(recordIdParam!.default).toBe('');
      expect(webhookUrlParam!.default).toBe('');
      expect(cacheParam!.default).toBe(true);
      expect(draftParam!.default).toBe(false);
      expect(outputWidthParam!.default).toBeUndefined();
      expect(outputHeightParam!.default).toBeUndefined();
      expect(framerateParam!.default).toBeUndefined();
      expect(resolutionParam!.default).toBe('custom');
    });
  });

  describe('parameter consistency', () => {
    it('should have no duplicate parameter names within main parameters', () => {
      const paramNames = mergeVideosParameters.map(p => p.name);
      const uniqueNames = new Set(paramNames);
      
      expect(paramNames.length).toBe(uniqueNames.size);
    });

    it('should have no duplicate parameter names within advanced parameters', () => {
      const paramNames = mergeVideosAdvancedParameters.map(p => p.name);
      const uniqueNames = new Set(paramNames);
      
      expect(paramNames.length).toBe(uniqueNames.size);
    });

    it('should have all parameters with required properties', () => {
      [...mergeVideosParameters, ...mergeVideosAdvancedParameters].forEach(param => {
        expect(param.name).toBeDefined();
        expect(typeof param.name).toBe('string');
        expect(param.name.length).toBeGreaterThan(0);
        
        expect(param.type).toBeDefined();
        expect(typeof param.type).toBe('string');
        
        expect(param.displayName).toBeDefined();
        expect(typeof param.displayName).toBe('string');
        expect(param.displayName.length).toBeGreaterThan(0);
      });
    });

    it('should have consistent operation values in display options', () => {
      const allParams = [...mergeVideosParameters, ...mergeVideosAdvancedParameters, mergeVideosAdvancedModeParameter, mergeVideosJsonTemplateParameter];
      
      allParams.forEach(param => {
        if (param.displayOptions?.show?.operation) {
          expect(param.displayOptions.show.operation).toEqual(['mergeVideos']);
        }
      });
    });

    it('should have proper type definitions for all parameters', () => {
      [...mergeVideosParameters, ...mergeVideosAdvancedParameters, mergeVideosAdvancedModeParameter, mergeVideosJsonTemplateParameter]
        .forEach(param => {
          expect(['string', 'number', 'boolean', 'options', 'fixedCollection', 'notice', 'json']).toContain(param.type);
        });
    });
  });

  describe('parameter display conditions', () => {
    it('should show basic mode parameters when advancedModeMergeVideos is false', () => {
      const basicParams = mergeVideosParameters.filter(p => 
        p.displayOptions?.show?.advancedModeMergeVideos?.includes(false)
      );
      
      expect(basicParams.length).toBeGreaterThan(0);
      
      basicParams.forEach(param => {
        expect(param.displayOptions?.show?.operation).toEqual(['mergeVideos']);
      });
    });

    it('should show advanced mode parameters when advancedModeMergeVideos is true', () => {
      const advancedParams = mergeVideosAdvancedParameters.filter(p => 
        p.displayOptions?.show?.advancedModeMergeVideos?.includes(true)
      );
      
      expect(advancedParams.length).toBeGreaterThan(0);
      
      advancedParams.forEach(param => {
        expect(param.displayOptions?.show?.operation).toEqual(['mergeVideos']);
      });
    });

    it('should have JSON template parameter only show in advanced mode', () => {
      expect(mergeVideosJsonTemplateParameter.displayOptions?.show?.advancedModeMergeVideos).toEqual([true]);
      expect(mergeVideosJsonTemplateParameter.displayOptions?.show?.operation).toEqual(['mergeVideos']);
    });

    it('should have advanced mode toggle show for mergeVideos operation', () => {
      expect(mergeVideosAdvancedModeParameter.displayOptions?.show?.operation).toEqual(['mergeVideos']);
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle missing parameters gracefully', () => {
      const nonExistentParam = mergeVideosParameters.find(p => p.name === 'nonExistent');
      expect(nonExistentParam).toBeUndefined();
    });

    it('should have all required parameters marked correctly', () => {
      const allCollections = mergeVideosParameters.filter(p => p.type === 'fixedCollection');
      
      allCollections.forEach(collection => {
        const option = collection.options![0] as INodePropertyCollection;
        const requiredFields = option.values.filter(f => f.required === true);
        
        requiredFields.forEach(field => {
          expect(field.required).toBe(true);
          expect(field.name).toBeDefined();
          expect(field.displayName).toBeDefined();
        });
      });
    });

    it('should have proper validation for numeric fields', () => {
      const allCollections = mergeVideosParameters.filter(p => p.type === 'fixedCollection');
      
      allCollections.forEach(collection => {
        const option = collection.options![0] as INodePropertyCollection;
        const numericFields = option.values.filter(f => f.type === 'number');
        
        numericFields.forEach(field => {
          expect(typeof field.default).toBe('number');
          if (field.typeOptions?.minValue !== undefined) {
            expect(typeof field.typeOptions.minValue).toBe('number');
          }
          if (field.typeOptions?.maxValue !== undefined) {
            expect(typeof field.typeOptions.maxValue).toBe('number');
          }
        });
      });
    });

    it('should have proper validation for option fields', () => {
      const allCollections = mergeVideosParameters.filter(p => p.type === 'fixedCollection');
      const transitionParam = mergeVideosParameters.find(p => p.name === 'transition');
      
      // Test collections
      allCollections.forEach(collection => {
        const option = collection.options![0] as INodePropertyCollection;
        const optionFields = option.values.filter(f => f.type === 'options');
        
        optionFields.forEach(field => {
          expect(field.options).toBeDefined();
          expect(Array.isArray(field.options)).toBe(true);
          expect(field.options!.length).toBeGreaterThan(0);
          
          field.options!.forEach((option: any) => {
            expect(option.name).toBeDefined();
            expect(option.value).toBeDefined();
          });
        });
      });

      // Test transition parameter
      expect(transitionParam!.options).toBeDefined();
      expect(Array.isArray(transitionParam!.options)).toBe(true);
      expect(transitionParam!.options!.length).toBeGreaterThan(0);
    });
  });

  describe('schema compliance', () => {
    it('should have parameters that comply with INodeProperties interface', () => {
      const allParams: INodeProperties[] = [
        ...mergeVideosParameters, 
        ...mergeVideosAdvancedParameters,
        mergeVideosAdvancedModeParameter,
        mergeVideosJsonTemplateParameter
      ];
      
      allParams.forEach(param => {
        expect(param).toHaveProperty('name');
        expect(param).toHaveProperty('type');
        expect(param).toHaveProperty('displayName');
        expect(param).toHaveProperty('default');
      });
    });

    it('should have fixedCollection parameters with proper structure', () => {
      const fixedCollectionParams = mergeVideosParameters.filter(p => p.type === 'fixedCollection');
      
      expect(fixedCollectionParams.length).toBe(2); // videoElements and outputSettings
      
      fixedCollectionParams.forEach(param => {
        expect(param.options).toBeDefined();
        expect(Array.isArray(param.options)).toBe(true);
        expect(param.options!.length).toBe(1);
        
        const option = param.options![0] as INodePropertyCollection;
        expect(option).toHaveProperty('name');
        expect(option).toHaveProperty('displayName');
        expect(option).toHaveProperty('values');
        expect(Array.isArray(option.values)).toBe(true);
        expect(option.values.length).toBeGreaterThan(0);
      });
    });

    it('should have proper field types in collections', () => {
      const expectedFieldTypes = ['string', 'number', 'boolean', 'options'];
      const fixedCollectionParams = mergeVideosParameters.filter(p => p.type === 'fixedCollection');
      
      fixedCollectionParams.forEach(param => {
        const option = param.options![0] as INodePropertyCollection;
        option.values.forEach(field => {
          expect(expectedFieldTypes).toContain(field.type);
        });
      });
    });
  });

  describe('workflow-specific features', () => {
    it('should have video-specific fields in video elements', () => {
      const videoElementsParam = mergeVideosParameters.find(p => p.name === 'videoElements')!;
      const videoOption = videoElementsParam.options![0] as INodePropertyCollection;
      const fieldNames = videoOption.values.map(f => f.name);
      
      expect(fieldNames).toContain('speed');
      expect(fieldNames).toContain('volume');
      expect(fieldNames).toContain('loop');
    });

    it('should have transition-specific parameters', () => {
      const paramNames = mergeVideosParameters.map(p => p.name);
      
      expect(paramNames).toContain('transition');
      expect(paramNames).toContain('transitionDuration');
    });

    it('should have output format options for video merging', () => {
      const outputSettingsParam = mergeVideosParameters.find(p => p.name === 'outputSettings')!;
      const outputOption = outputSettingsParam.options![0] as INodePropertyCollection;
      const formatField = outputOption.values.find(f => f.name === 'format');
      
      expect(formatField).toBeDefined();
      expect(formatField!.options).toContainEqual({ name: 'MP4', value: 'mp4' });
      expect(formatField!.options).toContainEqual({ name: 'WebM', value: 'webm' });
    });

    it('should support multiple videos with sortable collection', () => {
      const videoElementsParam = mergeVideosParameters.find(p => p.name === 'videoElements')!;
      
      expect(videoElementsParam.typeOptions?.multipleValues).toBe(true);
      expect(videoElementsParam.typeOptions?.sortable).toBe(true);
    });

    it('should have playback speed control for video manipulation', () => {
      const videoElementsParam = mergeVideosParameters.find(p => p.name === 'videoElements')!;
      const videoOption = videoElementsParam.options![0] as INodePropertyCollection;
      const speedField = videoOption.values.find(f => f.name === 'speed');
      
      expect(speedField).toBeDefined();
      expect(speedField!.description).toContain('speed');
      expect(speedField!.typeOptions?.minValue).toBe(0.1);
      expect(speedField!.typeOptions?.maxValue).toBe(10);
    });
  });
});