// __tests__/nodes/CreateJ2vMovie/presentation/unifiedParameters.test.ts

import {
  unifiedParameters,
  unifiedAdvancedModeParameter,
  mergeVideoAudioAdvancedModeParameter,
  mergeVideosAdvancedModeParameter,
  unifiedJsonTemplateParameter,
  mergeVideoAudioJsonTemplateParameter,
  mergeVideosJsonTemplateParameter,
  unifiedAdvancedParameters,
} from '../../../../nodes/CreateJ2vMovie/presentation/unifiedParameters';

// Import helper functions from the correct location
import {
  getOperationPlaceholder,
  getOperationDescription,
  getOperationJsonTemplate,
} from '../../../../nodes/CreateJ2vMovie/presentation/nodeProperties';

import { INodeProperties, INodePropertyCollection } from 'n8n-workflow';

describe('unifiedParameters', () => {
  describe('parameter structure validation', () => {
    it('should have all required properties for each parameter', () => {
      [...unifiedParameters, unifiedAdvancedModeParameter, unifiedJsonTemplateParameter, ...unifiedAdvancedParameters]
        .forEach(param => {
          expect(param.name).toBeDefined();
          expect(typeof param.name).toBe('string');
          expect(param.name.length).toBeGreaterThan(0);

          expect(param.type).toBeDefined();
          expect(typeof param.type).toBe('string');

          expect(param.displayName).toBeDefined();
          expect(typeof param.displayName).toBe('string');
          expect(param.displayName.length).toBeGreaterThan(0);

          // Some parameters may not have defaults (override parameters)
          if (param.default === undefined) {
            expect(['width', 'height', 'quality', 'cache', 'resolution'].includes(param.name)).toBe(true);
          }
        });
    });

    it('should not have displayOptions in fixedCollection child parameters', () => {
      const fixedCollectionParams = unifiedParameters.filter(p => p.type === 'fixedCollection');

      fixedCollectionParams.forEach(param => {
        expect(param.options).toBeDefined();
        expect(Array.isArray(param.options)).toBe(true);

        param.options!.forEach((option: any) => {
          expect(Array.isArray(option.values)).toBe(true);
          
          option.values.forEach((value: any) => {
            // This is the key fix - no displayOptions in child parameters
            expect(value.displayOptions).toBeUndefined();
          });
        });
      });
    });

    it('should have consistent naming conventions', () => {
      expect(unifiedAdvancedModeParameter.name).toBe('advancedMode');
      expect(unifiedJsonTemplateParameter.name).toBe('jsonTemplate');
      
      // Check that parameters follow naming conventions (allowing legacy underscore names)
      [...unifiedParameters, ...unifiedAdvancedParameters].forEach(param => {
        expect(param.name).toMatch(/^[a-z][a-zA-Z0-9_]*$/);
      });
    });
  });

  describe('element collections structure', () => {
    let movieElementsParam: INodeProperties;
    let sceneElementsParam: INodeProperties;

    beforeEach(() => {
      movieElementsParam = unifiedParameters.find(p => p.name === 'movieElements')!;
      sceneElementsParam = unifiedParameters.find(p => p.name === 'sceneElements')!;
    });

    it('should have movie elements parameter for createMovie only', () => {
      expect(movieElementsParam).toBeDefined();
      expect(movieElementsParam.type).toBe('fixedCollection');
      expect(movieElementsParam.displayOptions?.show?.operation).toEqual(['createMovie']);
      expect(movieElementsParam.displayOptions?.show?.advancedMode).toEqual([false]);
    });

    it('should have scene elements parameter for createMovie', () => {
      expect(sceneElementsParam).toBeDefined();
      expect(sceneElementsParam.type).toBe('fixedCollection');
      expect(sceneElementsParam.displayOptions?.show?.advancedMode).toEqual([false]);
      expect(sceneElementsParam.displayOptions?.show?.operation).toEqual(['createMovie']);
    });

    it('should have proper fixedCollection structure', () => {
      [movieElementsParam, sceneElementsParam].forEach(param => {
        expect(param.typeOptions?.multipleValues).toBe(true);
        expect(param.typeOptions?.sortable).toBe(true);
        expect(param.options).toHaveLength(1);

        const option = param.options![0] as INodePropertyCollection;
        expect(option.name).toBe('elementValues');
        expect(option.displayName).toBe('Element');
        expect(Array.isArray(option.values)).toBe(true);
        expect(option.values.length).toBeGreaterThan(0);
      });
    });
  });

  describe('operation-specific element collections', () => {
    it('should have videoElement for mergeVideoAudio', () => {
      const videoElementParam = unifiedParameters.find(p => p.name === 'videoElement');
      expect(videoElementParam).toBeDefined();
      expect(videoElementParam!.displayOptions?.show?.operation).toEqual(['mergeVideoAudio']);
      expect(videoElementParam!.displayOptions?.show?.advancedModeMergeVideoAudio).toEqual([false]);
    });

    it('should have audioElement for mergeVideoAudio', () => {
      const audioElementParam = unifiedParameters.find(p => p.name === 'audioElement');
      expect(audioElementParam).toBeDefined();
      expect(audioElementParam!.displayOptions?.show?.operation).toEqual(['mergeVideoAudio']);
      expect(audioElementParam!.displayOptions?.show?.advancedModeMergeVideoAudio).toEqual([false]);
    });

    it('should have videoElements collection for mergeVideos', () => {
      const videoElementsParam = unifiedParameters.find(p => p.name === 'videoElements');
      expect(videoElementsParam).toBeDefined();
      expect(videoElementsParam!.displayOptions?.show?.operation).toEqual(['mergeVideos']);
      expect(videoElementsParam!.displayOptions?.show?.advancedModeMergeVideos).toEqual([false]);
    });
  });

  describe('output settings consistency', () => {
    let outputSettingsParam: INodeProperties;

    beforeEach(() => {
      outputSettingsParam = unifiedParameters.find(p => p.name === 'outputSettings')!;
    });

    it('should have unified output settings for all operations', () => {
      expect(outputSettingsParam).toBeDefined();
      expect(outputSettingsParam.type).toBe('fixedCollection');
      // Should be available for all operations (no operation restriction)
      expect(outputSettingsParam.displayOptions?.show?.operation).toBeUndefined();
    });

    it('should include all necessary output configuration fields', () => {
      const option = outputSettingsParam.options![0] as INodePropertyCollection;
      const fieldNames = option.values.map(f => f.name);

      expect(fieldNames).toContain('width');
      expect(fieldNames).toContain('height');
      expect(fieldNames).toContain('format');
      expect(fieldNames).toContain('quality');
      expect(fieldNames).toContain('frameRate');
      expect(fieldNames).toContain('cache');
      expect(fieldNames).toContain('draft');
    });

    it('should have proper default values', () => {
      const option = outputSettingsParam.options![0] as INodePropertyCollection;
      
      const widthField = option.values.find(f => f.name === 'width');
      const heightField = option.values.find(f => f.name === 'height');
      const formatField = option.values.find(f => f.name === 'format');
      const qualityField = option.values.find(f => f.name === 'quality');

      expect(widthField?.default).toBe(1920);
      expect(heightField?.default).toBe(1080);
      expect(formatField?.default).toBe('mp4');
      expect(qualityField?.default).toBe('high');
    });
  });

  describe('operation-specific parameters', () => {
    it('should have transition parameters for mergeVideos only', () => {
      const transitionParam = unifiedParameters.find(p => p.name === 'transition');
      const durationParam = unifiedParameters.find(p => p.name === 'transitionDuration');

      expect(transitionParam).toBeDefined();
      expect(transitionParam!.displayOptions?.show?.operation).toEqual(['mergeVideos']);
      expect(transitionParam!.displayOptions?.show?.advancedModeMergeVideos).toEqual([false]);

      expect(durationParam).toBeDefined();
      expect(durationParam!.displayOptions?.show?.operation).toEqual(['mergeVideos']);
      expect(durationParam!.displayOptions?.show?.advancedModeMergeVideos).toEqual([false]);
    });

    it('should have createMovie legacy parameters', () => {
      const legacyParams = ['output_width', 'output_height', 'cache', 'draft'];
      
      legacyParams.forEach(paramName => {
        const param = unifiedParameters.find(p => p.name === paramName);
        expect(param).toBeDefined();
        expect(param!.displayOptions?.show?.operation).toEqual(['createMovie']);
        expect(param!.displayOptions?.show?.advancedMode).toEqual([false]);
      });
    });

    it('should have export settings for createMovie', () => {
      const exportParam = unifiedParameters.find(p => p.name === 'exportSettings');
      
      expect(exportParam).toBeDefined();
      expect(exportParam!.type).toBe('fixedCollection');
      expect(exportParam!.displayOptions?.show?.operation).toEqual(['createMovie']);
      expect(exportParam!.displayOptions?.show?.advancedMode).toEqual([false]);
    });
  });

  describe('advanced mode parameters', () => {
    it('should have operation-specific advanced mode parameters', () => {
      expect(unifiedAdvancedModeParameter.name).toBe('advancedMode');
      expect(unifiedAdvancedModeParameter.type).toBe('boolean');
      expect(unifiedAdvancedModeParameter.default).toBe(false);
      expect(unifiedAdvancedModeParameter.displayOptions?.show?.operation).toEqual(['createMovie']);

      expect(mergeVideoAudioAdvancedModeParameter.name).toBe('advancedModeMergeVideoAudio');
      expect(mergeVideoAudioAdvancedModeParameter.displayOptions?.show?.operation).toEqual(['mergeVideoAudio']);

      expect(mergeVideosAdvancedModeParameter.name).toBe('advancedModeMergeVideos');
      expect(mergeVideosAdvancedModeParameter.displayOptions?.show?.operation).toEqual(['mergeVideos']);
    });

    it('should have operation-specific JSON template parameters', () => {
      expect(unifiedJsonTemplateParameter.name).toBe('jsonTemplate');
      expect(unifiedJsonTemplateParameter.type).toBe('json');
      expect(unifiedJsonTemplateParameter.default).toBe('{}');
      expect(unifiedJsonTemplateParameter.displayOptions?.show?.operation).toEqual(['createMovie']);
      expect(unifiedJsonTemplateParameter.displayOptions?.show?.advancedMode).toEqual([true]);

      expect(mergeVideoAudioJsonTemplateParameter.name).toBe('jsonTemplateMergeVideoAudio');
      expect(mergeVideoAudioJsonTemplateParameter.displayOptions?.show?.operation).toEqual(['mergeVideoAudio']);
      expect(mergeVideoAudioJsonTemplateParameter.displayOptions?.show?.advancedModeMergeVideoAudio).toEqual([true]);

      expect(mergeVideosJsonTemplateParameter.name).toBe('jsonTemplateMergeVideos');
      expect(mergeVideosJsonTemplateParameter.displayOptions?.show?.operation).toEqual(['mergeVideos']);
      expect(mergeVideosJsonTemplateParameter.displayOptions?.show?.advancedModeMergeVideos).toEqual([true]);
    });

    it('should have override parameters with proper display options', () => {
      const advancedParams = unifiedAdvancedParameters;
      
      // Should have multiple instances for different operations
      const widthParams = advancedParams.filter(p => p.name === 'width');
      const heightParams = advancedParams.filter(p => p.name === 'height');
      
      expect(widthParams.length).toBeGreaterThanOrEqual(3); // One for each operation
      expect(heightParams.length).toBeGreaterThanOrEqual(3);
      
      // Each should have appropriate display options
      widthParams.forEach(param => {
        expect(param.displayOptions?.show).toBeDefined();
        const showKeys = Object.keys(param.displayOptions!.show!);
        expect(showKeys.length).toBeGreaterThan(0);
      });
    });
  });

  describe('helper functions', () => {
    it.each([
      ['mergeVideoAudio', 'Add Video or Audio Element'],
      ['mergeVideos', 'Add Video Element'],
      ['createMovie', 'Add Scene Element'],
    ])('should return correct placeholder for %s operation', (operation, expected) => {
      expect(getOperationPlaceholder(operation)).toBe(expected);
    });

    it.each([
      ['mergeVideoAudio', 'Add video and audio elements to merge together'],
      ['mergeVideos', 'Add multiple video elements to merge in sequence'],
      ['createMovie', 'Elements that appear in scenes'],
    ])('should return correct description for %s operation', (operation, expectedPartial) => {
      const description = getOperationDescription(operation);
      expect(description).toContain(expectedPartial);
    });

    it.each([
      ['mergeVideoAudio', '"type": "video"', '"type": "audio"'],
      ['mergeVideos', '"type": "video"', 'video1.mp4', 'video2.mp4'],
      ['createMovie', '"type": "image"', '"type": "text"', 'Hello World'],
    ])('should return valid JSON template for %s operation', (operation, ...expectedParts) => {
      const template = getOperationJsonTemplate(operation);
      
      // Should be valid JSON
      expect(() => JSON.parse(template)).not.toThrow();
      
      // Should contain operation-specific elements
      expectedParts.forEach(part => {
        expect(template).toContain(part);
      });
    });
  });

  describe('architectural consistency', () => {
    it('should follow the same pattern as existing presentation files', () => {
      // Check that we have the main parameter exports
      expect(unifiedParameters).toBeDefined();
      expect(Array.isArray(unifiedParameters)).toBe(true);
      expect(unifiedParameters.length).toBeGreaterThan(0);

      expect(unifiedAdvancedModeParameter).toBeDefined();
      expect(unifiedJsonTemplateParameter).toBeDefined();
      expect(unifiedAdvancedParameters).toBeDefined();
      expect(Array.isArray(unifiedAdvancedParameters)).toBe(true);
    });

    it('should maintain backwards compatibility with existing parameter names', () => {
      // Check that critical parameters still exist with expected names
      const paramNames = unifiedParameters.map(p => p.name);
      
      expect(paramNames).toContain('recordId');
      expect(paramNames).toContain('sceneElements');
      expect(paramNames).toContain('outputSettings');
      
      // createMovie specific
      expect(paramNames).toContain('movieElements');
      expect(paramNames).toContain('output_width');
      expect(paramNames).toContain('output_height');
      expect(paramNames).toContain('exportSettings');
      
      // mergeVideos specific
      expect(paramNames).toContain('transition');
      expect(paramNames).toContain('transitionDuration');
      
      // mergeVideoAudio specific
      expect(paramNames).toContain('videoElement');
      expect(paramNames).toContain('audioElement');
      
      // mergeVideos specific
      expect(paramNames).toContain('videoElements');
    });

    it('should not have any circular references in parameter definitions', () => {
      // Ensure all parameter objects can be serialized
      expect(() => JSON.stringify(unifiedParameters)).not.toThrow();
      expect(() => JSON.stringify(unifiedAdvancedParameters)).not.toThrow();
      expect(() => JSON.stringify(unifiedAdvancedModeParameter)).not.toThrow();
      expect(() => JSON.stringify(unifiedJsonTemplateParameter)).not.toThrow();
    });

    it('should have consistent type definitions', () => {
      const validTypes = ['string', 'number', 'boolean', 'options', 'fixedCollection', 'collection', 'json'];
      
      [...unifiedParameters, unifiedAdvancedModeParameter, unifiedJsonTemplateParameter, ...unifiedAdvancedParameters]
        .forEach(param => {
          expect(validTypes).toContain(param.type);
        });
    });
  });

  describe('display options validation', () => {
    it('should not have conflicting display options', () => {
      [...unifiedParameters, ...unifiedAdvancedParameters].forEach(param => {
        if (param.displayOptions?.show) {
          const showKeys = Object.keys(param.displayOptions.show);
          
          // Should not have multiple advanced mode keys
          const advancedModeKeys = showKeys.filter(key => key.includes('advancedMode'));
          expect(advancedModeKeys.length).toBeLessThanOrEqual(1);
        }
      });
    });

    it('should use consistent parameter names in display options', () => {
      [...unifiedParameters, ...unifiedAdvancedParameters].forEach(param => {
        if (param.displayOptions?.show?.advancedMode) {
          // Should be array of booleans
          expect(Array.isArray(param.displayOptions.show.advancedMode)).toBe(true);
          param.displayOptions.show.advancedMode.forEach((value: any) => {
            expect(typeof value).toBe('boolean');
          });
        }
        
        if (param.displayOptions?.show?.operation) {
          // Should be array of valid operation names
          expect(Array.isArray(param.displayOptions.show.operation)).toBe(true);
          const validOperations = ['createMovie', 'mergeVideoAudio', 'mergeVideos'];
          param.displayOptions.show.operation.forEach((value: any) => {
            expect(validOperations).toContain(value);
          });
        }
      });
    });
  });

  describe('element fields processing', () => {
    it('should remove displayOptions from element fields to prevent n8n errors', () => {
      const sceneElementsParam = unifiedParameters.find(p => p.name === 'sceneElements')!;
      const option = sceneElementsParam.options![0] as INodePropertyCollection;
      
      // All values should not have displayOptions
      option.values.forEach(field => {
        expect(field.displayOptions).toBeUndefined();
      });
    });

    it('should preserve all other field properties', () => {
      const sceneElementsParam = unifiedParameters.find(p => p.name === 'sceneElements')!;
      const option = sceneElementsParam.options![0] as INodePropertyCollection;
      
      // Should have essential properties
      option.values.forEach(field => {
        expect(field.name).toBeDefined();
        expect(field.type).toBeDefined();
        expect(field.displayName).toBeDefined();
        // Note: default can be undefined for some fields
      });
      
      // Should have fields we expect
      const fieldNames = option.values.map(f => f.name);
      expect(fieldNames).toContain('type');
      expect(fieldNames).toContain('src');
      expect(fieldNames).toContain('text');
    });
  });

  describe('operation-specific validation', () => {
    it('should have appropriate parameters for each operation type', () => {
      // createMovie should have movie elements, legacy params, and export settings
      const createMovieParams = unifiedParameters.filter(p => 
        p.displayOptions?.show?.operation?.includes('createMovie')
      );
      const createMovieParamNames = createMovieParams.map(p => p.name);
      
      expect(createMovieParamNames).toContain('movieElements');
      expect(createMovieParamNames).toContain('sceneElements');
      expect(createMovieParamNames).toContain('output_width');
      expect(createMovieParamNames).toContain('output_height');
      expect(createMovieParamNames).toContain('exportSettings');
      
      // mergeVideos should have transition parameters and video elements
      const mergeVideosParams = unifiedParameters.filter(p => 
        p.displayOptions?.show?.operation?.includes('mergeVideos')
      );
      const mergeVideosParamNames = mergeVideosParams.map(p => p.name);
      
      expect(mergeVideosParamNames).toContain('videoElements');
      expect(mergeVideosParamNames).toContain('transition');
      expect(mergeVideosParamNames).toContain('transitionDuration');
      
      // mergeVideoAudio should have video and audio elements
      const mergeVideoAudioParams = unifiedParameters.filter(p => 
        p.displayOptions?.show?.operation?.includes('mergeVideoAudio')
      );
      const mergeVideoAudioParamNames = mergeVideoAudioParams.map(p => p.name);
      
      expect(mergeVideoAudioParamNames).toContain('videoElement');
      expect(mergeVideoAudioParamNames).toContain('audioElement');
    });

    it('should have universal parameters available to all operations', () => {
      const universalParams = unifiedParameters.filter(p => 
        !p.displayOptions?.show?.operation
      );
      
      const universalParamNames = universalParams.map(p => p.name);
      
      expect(universalParamNames).toContain('recordId');
      expect(universalParamNames).toContain('outputSettings');
    });
  });
});

describe('integration with existing architecture', () => {
  it('should be compatible with parameter collector expectations', () => {
    // Test that the unified structure matches what the parameter collector expects
    const sceneElementsParam = unifiedParameters.find(p => p.name === 'sceneElements')!;
    
    expect(sceneElementsParam.type).toBe('fixedCollection');
    expect(sceneElementsParam.options).toHaveLength(1);
    
    const option = sceneElementsParam.options![0] as INodePropertyCollection;
    expect(option.name).toBe('elementValues');
    expect(Array.isArray(option.values)).toBe(true);
  });

  it('should maintain naming consistency with core functions', () => {
    // Advanced mode parameter names should match what the collector expects
    
    expect(unifiedAdvancedModeParameter.name).toBe('advancedMode');
    expect(mergeVideoAudioAdvancedModeParameter.name).toBe('advancedModeMergeVideoAudio');
    expect(mergeVideosAdvancedModeParameter.name).toBe('advancedModeMergeVideos');
  });

  it('should support all existing test scenarios', () => {
    // Verify that all parameter types needed by tests are present
    const paramTypes = [...unifiedParameters, ...unifiedAdvancedParameters]
      .map(p => p.type);
    
    expect(paramTypes).toContain('string');
    expect(paramTypes).toContain('number');
    expect(paramTypes).toContain('boolean');
    expect(paramTypes).toContain('options');
    expect(paramTypes).toContain('fixedCollection');
    
    // Advanced mode specific
    expect(unifiedJsonTemplateParameter.type).toBe('json');
    expect(mergeVideoAudioJsonTemplateParameter.type).toBe('json');
    expect(mergeVideosJsonTemplateParameter.type).toBe('json');
  });
});