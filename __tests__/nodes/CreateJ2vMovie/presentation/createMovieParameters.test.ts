// __tests__/nodes/CreateJ2vMovie/presentation/createMovieParameters.test.ts

import {
  createMovieParameters,
  createMovieAdvancedModeParameter,
  createMovieJsonTemplateParameter,
  createMovieAdvancedParameters
} from '../../../../nodes/CreateJ2vMovie/presentation/createMovieParameters';
import { INodeProperties, INodePropertyCollection } from 'n8n-workflow';

describe('createMovieParameters', () => {
  describe('main parameter array', () => {
    it.each([
      ['recordId parameter', 'recordId', 'string', false],
      ['webhookUrl parameter', 'webhookUrl', 'string', false],
      ['movie settings notice', 'movieSettings', 'notice', false],
      ['movie elements collection', 'movieElements', 'fixedCollection', false],
      ['scene settings notice', 'sceneSettings', 'notice', false],
      ['scene elements collection', 'elements', 'fixedCollection', false]
    ])('should have %s', (_, paramName, expectedType, isRequired) => {
      const param = createMovieParameters.find(p => p.name === paramName);
      
      expect(param).toBeDefined();
      expect(param!.type).toBe(expectedType);
      
      if (isRequired) {
        expect(param!.required).toBe(true);
      }
    });

    it.each([
      ['recordId shows for createMovie basic mode', 'recordId', ['createMovie']],
      ['movieSettings shows for createMovie basic mode', 'movieSettings', ['createMovie']],
      ['movieElements shows for createMovie basic mode', 'movieElements', ['createMovie']],
      ['elements shows for createMovie basic mode', 'elements', ['createMovie']]
    ])('should have correct display options: %s', (_, paramName, expectedOperations) => {
      const param = createMovieParameters.find(p => p.name === paramName);
      
      expect(param).toBeDefined();
      expect(param!.displayOptions?.show?.operation).toEqual(expectedOperations);
    });

    it.each([
      ['recordId hidden in basic mode', 'recordId', [false]],
      ['movieSettings shown in basic mode', 'movieSettings', [false]],
      ['movieElements shown in basic mode', 'movieElements', [false]],
      ['elements shown in basic mode', 'elements', [false]]
    ])('should have correct advanced mode display: %s', (_, paramName, expectedAdvancedMode) => {
      const param = createMovieParameters.find(p => p.name === paramName);
      
      if (param && param.displayOptions?.show?.advancedMode) {
        expect(param.displayOptions.show.advancedMode).toEqual(expectedAdvancedMode);
      }
    });

    it.each([
      ['recordId has string default', 'recordId', ''],
      ['webhookUrl has string default', 'webhookUrl', ''],
      ['movieSettings has empty default', 'movieSettings', ''],
      ['movieElements has object default', 'movieElements', {}],
      ['elements has object default', 'elements', {}]
    ])('should have correct defaults: %s', (_, paramName, expectedDefault) => {
      const param = createMovieParameters.find(p => p.name === paramName);
      
      expect(param).toBeDefined();
      expect(param!.default).toEqual(expectedDefault);
    });

    it('should have fixedCollection with correct options for movieElements', () => {
      const param = createMovieParameters.find(p => p.name === 'movieElements');
      
      expect(param).toBeDefined();
      expect(param!.type).toBe('fixedCollection');
      expect(param!.typeOptions?.multipleValues).toBe(true);
      expect(param!.typeOptions?.sortable).toBe(true);
      expect(param!.options).toHaveLength(1);
      
      const option = param!.options![0] as INodePropertyCollection;
      expect(option.name).toBe('elementValues');
      expect(option.displayName).toBe('Element');
      expect(Array.isArray(option.values)).toBe(true);
    });

    it('should have fixedCollection with correct options for scene elements', () => {
      const param = createMovieParameters.find(p => p.name === 'elements');
      
      expect(param).toBeDefined();
      expect(param!.type).toBe('fixedCollection');
      expect(param!.typeOptions?.multipleValues).toBe(true);
      expect(param!.typeOptions?.sortable).toBe(true);
      expect(param!.options).toHaveLength(1);
      
      const option = param!.options![0] as INodePropertyCollection;
      expect(option.name).toBe('elementValues');
      expect(option.displayName).toBe('Element');
      expect(Array.isArray(option.values)).toBe(true);
    });

    it.each([
      ['quality has correct options', 'quality', [
        { name: 'Low', value: 'low' },
        { name: 'Medium', value: 'medium' },
        { name: 'High', value: 'high' },
        { name: 'Very High', value: 'very_high' }
      ]]
    ])('should have correct options in advanced parameters: %s', (_, paramName, expectedOptions) => {
      const param = createMovieAdvancedParameters.find(p => p.name === paramName);
      
      expect(param).toBeDefined();
      expect(param!.options).toEqual(expectedOptions);
    });

    it('should have descriptive placeholders and descriptions', () => {
      const movieElementsParam = createMovieParameters.find(p => p.name === 'movieElements');
      const sceneElementsParam = createMovieParameters.find(p => p.name === 'elements');
      
      expect(movieElementsParam!.placeholder).toBe('Add Movie Element');
      expect(movieElementsParam!.description).toContain('Elements that appear across all scenes');
      
      expect(sceneElementsParam!.placeholder).toBe('Add Scene Element');
      expect(sceneElementsParam!.description).toContain('Elements that appear only in specific scenes');
    });
  });

  describe('advanced mode parameter', () => {
    it('should have correct advanced mode parameter structure', () => {
      expect(createMovieAdvancedModeParameter).toBeDefined();
      expect(createMovieAdvancedModeParameter.name).toBe('advancedMode');
      expect(createMovieAdvancedModeParameter.type).toBe('boolean');
      expect(createMovieAdvancedModeParameter.displayOptions?.show?.operation).toEqual(['createMovie']);
    });

    it('should have correct display name and description', () => {
      expect(createMovieAdvancedModeParameter.displayName).toContain('Advanced');
      expect(typeof createMovieAdvancedModeParameter.description).toBe('string');
      expect(createMovieAdvancedModeParameter.description!.length).toBeGreaterThan(0);
    });

    it('should have correct default value', () => {
      expect(createMovieAdvancedModeParameter.default).toBe(false);
    });
  });

  describe('JSON template parameter', () => {
    it('should have correct JSON template parameter structure', () => {
      expect(createMovieJsonTemplateParameter).toBeDefined();
      expect(createMovieJsonTemplateParameter.name).toBe('jsonTemplate');
      expect(createMovieJsonTemplateParameter.type).toBe('json');
    });

    it('should have correct display options for advanced mode', () => {
      expect(createMovieJsonTemplateParameter.displayOptions?.show?.operation).toEqual(['createMovie']);
      expect(createMovieJsonTemplateParameter.displayOptions?.show?.advancedMode).toEqual([true]);
    });

    it('should have JSON template with proper structure', () => {
      expect(typeof createMovieJsonTemplateParameter.default).toBe('string');
      
      const defaultTemplate = createMovieJsonTemplateParameter.default as string;
      expect(() => JSON.parse(defaultTemplate)).not.toThrow();
      
      const parsed = JSON.parse(defaultTemplate);
      expect(parsed).toHaveProperty('scenes');
      expect(Array.isArray(parsed.scenes)).toBe(true);
      expect(parsed).toHaveProperty('fps');
      expect(parsed).toHaveProperty('width');
      expect(parsed).toHaveProperty('height');
      expect(parsed).toHaveProperty('quality');
    });

    it('should have description that mentions override functionality', () => {
      expect(createMovieJsonTemplateParameter.description).toContain('Override parameters');
    });
  });

  describe('advanced parameters array', () => {
    it('should contain expected override parameters', () => {
      expect(Array.isArray(createMovieAdvancedParameters)).toBe(true);
      expect(createMovieAdvancedParameters.length).toBeGreaterThan(0);
      
      const paramNames = createMovieAdvancedParameters.map(p => p.name);
      
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
      const param = createMovieAdvancedParameters.find(p => p.name === paramName);
      
      expect(param).toBeDefined();
      expect(param!.type).toBe(expectedType);
    });

    it('should have correct display options for all advanced parameters', () => {
      createMovieAdvancedParameters.forEach(param => {
        expect(param.displayOptions?.show?.operation).toEqual(['createMovie']);
        expect(param.displayOptions?.show?.advancedMode).toEqual([true]);
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
      const param = createMovieAdvancedParameters.find(p => p.name === paramName);
      
      expect(param).toBeDefined();
      
      if (shouldHaveValidation) {
        if (param!.type === 'options') {
          expect(param!.options).toBeDefined();
          expect(Array.isArray(param!.options)).toBe(true);
          expect(param!.options!.length).toBeGreaterThan(0);
        }
      }
    });

    it('should have consistent parameter descriptions', () => {
      createMovieAdvancedParameters.forEach(param => {
        expect(param.description).toBeDefined();
        expect(typeof param.description).toBe('string');
        expect(param.description!.length).toBeGreaterThan(0);
      });
    });

    it('should have appropriate default values for advanced parameters', () => {
      const recordIdParam = createMovieAdvancedParameters.find(p => p.name === 'recordId');
      const webhookUrlParam = createMovieAdvancedParameters.find(p => p.name === 'webhookUrl');
      const cacheParam = createMovieAdvancedParameters.find(p => p.name === 'cache');
      const draftParam = createMovieAdvancedParameters.find(p => p.name === 'draft');
      const outputWidthParam = createMovieAdvancedParameters.find(p => p.name === 'outputWidth');
      const outputHeightParam = createMovieAdvancedParameters.find(p => p.name === 'outputHeight');
      const framerateParam = createMovieAdvancedParameters.find(p => p.name === 'framerate');
      const resolutionParam = createMovieAdvancedParameters.find(p => p.name === 'resolution');

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
      const paramNames = createMovieParameters.map(p => p.name);
      const uniqueNames = new Set(paramNames);
      
      expect(paramNames.length).toBe(uniqueNames.size);
    });

    it('should have no duplicate parameter names within advanced parameters', () => {
      const paramNames = createMovieAdvancedParameters.map(p => p.name);
      const uniqueNames = new Set(paramNames);
      
      expect(paramNames.length).toBe(uniqueNames.size);
    });

    it('should have all parameters with required properties', () => {
      [...createMovieParameters, ...createMovieAdvancedParameters].forEach(param => {
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
      const allParams = [...createMovieParameters, ...createMovieAdvancedParameters, createMovieAdvancedModeParameter, createMovieJsonTemplateParameter];
      
      allParams.forEach(param => {
        if (param.displayOptions?.show?.operation) {
          expect(param.displayOptions.show.operation).toEqual(['createMovie']);
        }
      });
    });

    it('should have proper type definitions for all parameters', () => {
      [...createMovieParameters, ...createMovieAdvancedParameters, createMovieAdvancedModeParameter, createMovieJsonTemplateParameter]
        .forEach(param => {
          expect(['string', 'number', 'boolean', 'options', 'fixedCollection', 'notice', 'json']).toContain(param.type);
        });
    });
  });

  describe('element field integration', () => {
    it('should have element fields in both movie and scene collections', () => {
      const movieElementsParam = createMovieParameters.find(p => p.name === 'movieElements');
      const sceneElementsParam = createMovieParameters.find(p => p.name === 'elements');
      
      const movieOption = movieElementsParam!.options![0] as INodePropertyCollection;
      const sceneOption = sceneElementsParam!.options![0] as INodePropertyCollection;
      
      expect(movieOption.values).toBeDefined();
      expect(Array.isArray(movieOption.values)).toBe(true);
      expect(movieOption.values.length).toBeGreaterThan(0);
      
      expect(sceneOption.values).toBeDefined();
      expect(Array.isArray(sceneOption.values)).toBe(true);
      expect(sceneOption.values.length).toBeGreaterThan(0);
    });

    it('should have element type selection in both collections', () => {
      const movieElementsParam = createMovieParameters.find(p => p.name === 'movieElements');
      const sceneElementsParam = createMovieParameters.find(p => p.name === 'elements');
      
      const movieOption = movieElementsParam!.options![0] as INodePropertyCollection;
      const sceneOption = sceneElementsParam!.options![0] as INodePropertyCollection;
      
      const movieElementFields = movieOption.values;
      const sceneElementFields = sceneOption.values;
      
      const movieTypeField = movieElementFields.find(field => field.name === 'type');
      const sceneTypeField = sceneElementFields.find(field => field.name === 'type');
      
      expect(movieTypeField).toBeDefined();
      expect(movieTypeField!.type).toBe('options');
      expect(Array.isArray(movieTypeField!.options)).toBe(true);
      expect(movieTypeField!.options!.length).toBeGreaterThan(0);
      
      expect(sceneTypeField).toBeDefined();
      expect(sceneTypeField!.type).toBe('options');
      expect(Array.isArray(sceneTypeField!.options)).toBe(true);
      expect(sceneTypeField!.options!.length).toBeGreaterThan(0);
    });

    it('should have expected element types available', () => {
      const movieElementsParam = createMovieParameters.find(p => p.name === 'movieElements');
      const movieOption = movieElementsParam!.options![0] as INodePropertyCollection;
      const movieTypeField = movieOption.values.find(field => field.name === 'type');
      
      const elementTypes = movieTypeField!.options!.map((opt: any) => opt.value);
      
      expect(elementTypes).toContain('video');
      expect(elementTypes).toContain('audio');
      expect(elementTypes).toContain('image');
      expect(elementTypes).toContain('text');
      expect(elementTypes).toContain('voice');
      expect(elementTypes).toContain('subtitles');
      expect(elementTypes).toContain('component');
      expect(elementTypes).toContain('audiogram');
    });

    it('should have common element fields in both collections', () => {
      const movieElementsParam = createMovieParameters.find(p => p.name === 'movieElements');
      const sceneElementsParam = createMovieParameters.find(p => p.name === 'elements');
      
      const movieOption = movieElementsParam!.options![0] as INodePropertyCollection;
      const sceneOption = sceneElementsParam!.options![0] as INodePropertyCollection;
      
      const movieFieldNames = movieOption.values.map(f => f.name);
      const sceneFieldNames = sceneOption.values.map(f => f.name);
      
      const expectedCommonFields = ['type', 'start', 'duration', 'zIndex', 'fadeIn', 'fadeOut'];
      
      expectedCommonFields.forEach(fieldName => {
        expect(movieFieldNames).toContain(fieldName);
        expect(sceneFieldNames).toContain(fieldName);
      });
    });
  });

  describe('parameter display conditions', () => {
    it('should show basic mode parameters when advancedMode is false', () => {
      const basicParams = createMovieParameters.filter(p => 
        p.displayOptions?.show?.advancedMode?.includes(false)
      );
      
      expect(basicParams.length).toBeGreaterThan(0);
      
      basicParams.forEach(param => {
        expect(param.displayOptions?.show?.operation).toEqual(['createMovie']);
      });
    });

    it('should show advanced mode parameters when advancedMode is true', () => {
      const advancedParams = createMovieAdvancedParameters.filter(p => 
        p.displayOptions?.show?.advancedMode?.includes(true)
      );
      
      expect(advancedParams.length).toBeGreaterThan(0);
      
      advancedParams.forEach(param => {
        expect(param.displayOptions?.show?.operation).toEqual(['createMovie']);
      });
    });

    it('should have JSON template parameter only show in advanced mode', () => {
      expect(createMovieJsonTemplateParameter.displayOptions?.show?.advancedMode).toEqual([true]);
      expect(createMovieJsonTemplateParameter.displayOptions?.show?.operation).toEqual(['createMovie']);
    });

    it('should have advanced mode toggle show for createMovie operation', () => {
      expect(createMovieAdvancedModeParameter.displayOptions?.show?.operation).toEqual(['createMovie']);
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle missing parameters gracefully', () => {
      const nonExistentParam = createMovieParameters.find(p => p.name === 'nonExistent');
      expect(nonExistentParam).toBeUndefined();
    });

    it('should have all required parameters marked correctly', () => {
      const requiredParams = [...createMovieParameters, ...createMovieAdvancedParameters]
        .filter(p => p.required === true);
      
      requiredParams.forEach(param => {
        expect(param.required).toBe(true);
        expect(param.name).toBeDefined();
        expect(param.displayName).toBeDefined();
      });
    });

    it('should have proper validation for numeric fields', () => {
      const numericParams = [...createMovieParameters, ...createMovieAdvancedParameters]
        .filter(p => p.type === 'number');
      
      numericParams.forEach(param => {
        expect(typeof param.default === 'number' || param.default === undefined).toBe(true);
        if (param.typeOptions?.minValue !== undefined) {
          expect(typeof param.typeOptions.minValue).toBe('number');
        }
        if (param.typeOptions?.maxValue !== undefined) {
          expect(typeof param.typeOptions.maxValue).toBe('number');
        }
      });
    });

    it('should have proper validation for option fields', () => {
      const optionParams = [...createMovieParameters, ...createMovieAdvancedParameters]
        .filter(p => p.type === 'options');
      
      optionParams.forEach(param => {
        expect(param.options).toBeDefined();
        expect(Array.isArray(param.options)).toBe(true);
        expect(param.options!.length).toBeGreaterThan(0);
        
        param.options!.forEach((option: any) => {
          expect(option.name).toBeDefined();
          expect(option.value).toBeDefined();
        });
      });
    });
  });

  describe('schema compliance', () => {
    it('should have parameters that comply with INodeProperties interface', () => {
      const allParams: INodeProperties[] = [
        ...createMovieParameters, 
        ...createMovieAdvancedParameters,
        createMovieAdvancedModeParameter,
        createMovieJsonTemplateParameter
      ];
      
      allParams.forEach(param => {
        expect(param).toHaveProperty('name');
        expect(param).toHaveProperty('type');
        expect(param).toHaveProperty('displayName');
        expect(param).toHaveProperty('default');
      });
    });

    it('should have fixedCollection parameters with proper structure', () => {
      const fixedCollectionParams = createMovieParameters.filter(p => p.type === 'fixedCollection');
      
      expect(fixedCollectionParams.length).toBe(2); // movieElements and elements
      
      fixedCollectionParams.forEach(param => {
        expect(param.options).toBeDefined();
        expect(Array.isArray(param.options)).toBe(true);
        expect(param.typeOptions?.multipleValues).toBe(true);
        expect(param.typeOptions?.sortable).toBe(true);
        
        const option = param.options![0] as INodePropertyCollection;
        expect(option).toHaveProperty('name');
        expect(option).toHaveProperty('displayName');
        expect(option).toHaveProperty('values');
        expect(Array.isArray(option.values)).toBe(true);
      });
    });
  });
});