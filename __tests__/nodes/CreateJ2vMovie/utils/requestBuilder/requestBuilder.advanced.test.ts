import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { buildRequestBody } from '../../../../../nodes/CreateJ2vMovie/utils/requestBuilder';

describe('requestBuilder - Advanced Mode', () => {
  describe('buildRequestBody - Advanced Mode', () => {
    test('should handle advanced mode with valid JSON template for createMovie', () => {
      const validJsonTemplate = JSON.stringify({
        width: 1920,
        height: 1080,
        fps: 30,
        elements: [
          {
            type: 'text',
            text: 'Advanced Mode Test',
            'font-family': 'Arial',
            'font-size': 48,
            color: '#ff0000'
          }
        ]
      });
      
      const mockExecute = {
        getNodeParameter: (parameterName: string, itemIndex: number, fallbackValue?: any) => {
          if (parameterName === 'operation') return 'createMovie';
          if (parameterName === 'jsonTemplate') return validJsonTemplate;
          return fallbackValue;
        },
        logger: {
          debug: jest.fn(),
          warn: jest.fn(),
          info: jest.fn(),
          error: jest.fn(),
        }
      };
      
      const result = buildRequestBody.call(
        mockExecute as unknown as IExecuteFunctions, 
        'createMovie', 
        0, 
        true
      );
      
      expect(result).toHaveProperty('width', 1920);
      expect(result).toHaveProperty('height', 1080);
      expect(result).toHaveProperty('fps', 30);
      expect(result).toHaveProperty('elements');
      const elements = result.elements as any[];
      expect(elements.length).toBe(1);
      expect(elements[0].text).toBe('Advanced Mode Test');
    });

    test('should handle advanced mode with mergeVideoAudio operation', () => {
      const validJsonTemplate = JSON.stringify({
        scenes: [{ elements: [] }]
      });
      
      const mockExecute = {
        getNodeParameter: (parameterName: string, itemIndex: number, fallbackValue?: any) => {
          if (parameterName === 'operation') return 'mergeVideoAudio';
          if (parameterName === 'jsonTemplateMergeAudio') return validJsonTemplate;
          return fallbackValue;
        },
        logger: {
          debug: jest.fn(),
          warn: jest.fn(),
          info: jest.fn(),
          error: jest.fn(),
        }
      };
      
      const result = buildRequestBody.call(
        mockExecute as unknown as IExecuteFunctions, 
        'mergeVideoAudio', 
        0, 
        true
      );
      
      expect(result).toHaveProperty('scenes');
    });

    test('should handle advanced mode with mergeVideos operation', () => {
      const validJsonTemplate = JSON.stringify({
        scenes: [{ elements: [] }]
      });
      
      const mockExecute = {
        getNodeParameter: (parameterName: string, itemIndex: number, fallbackValue?: any) => {
          if (parameterName === 'operation') return 'mergeVideos';
          if (parameterName === 'jsonTemplateMergeVideos') return validJsonTemplate;
          return fallbackValue;
        },
        logger: {
          debug: jest.fn(),
          warn: jest.fn(),
          info: jest.fn(),
          error: jest.fn(),
        }
      };
      
      const result = buildRequestBody.call(
        mockExecute as unknown as IExecuteFunctions, 
        'mergeVideos', 
        0, 
        true
      );
      
      expect(result).toHaveProperty('scenes');
    });
    
    test('should throw error with invalid JSON template in advanced mode', () => {
      const invalidJsonTemplate = '{invalid: json}';
      
      const mockExecute = {
        getNodeParameter: (parameterName: string, itemIndex: number, fallbackValue?: any) => {
          if (parameterName === 'operation') return 'createMovie';
          if (parameterName === 'jsonTemplate') return invalidJsonTemplate;
          return fallbackValue;
        },
        logger: {
          debug: jest.fn(),
          warn: jest.fn(),
          info: jest.fn(),
          error: jest.fn(),
        }
      };
      
      expect(() => {
        buildRequestBody.call(
          mockExecute as unknown as IExecuteFunctions, 
          'createMovie', 
          0, 
          true
        );
      }).toThrow('Invalid JSON template:');
    });

    test('should handle advanced mode with overrides', () => {
      const templateWithoutOverrides = JSON.stringify({
        width: 1280,
        height: 720,
        elements: []
      });
      
      const mockExecute = {
        getNodeParameter: (parameterName: string, itemIndex: number, fallbackValue?: any) => {
          const paramMap: { [key: string]: any } = {
            'operation': 'createMovie',
            'jsonTemplate': templateWithoutOverrides,
            'recordId': 'override-123',
            'outputWidth': 1920,
            'outputHeight': 1080,
            'framerate': 30,
            'webhookUrl': 'https://webhook.site/override',
            'quality': 'high',
            'cache': true,
            'draft': false,
            'resolution': '4K'
          };
          
          if (paramMap[parameterName] !== undefined) {
            return paramMap[parameterName];
          }
          
          return fallbackValue;
        },
        logger: {
          debug: jest.fn(),
          warn: jest.fn(),
          info: jest.fn(),
          error: jest.fn(),
        }
      };
      
      const result = buildRequestBody.call(
        mockExecute as unknown as IExecuteFunctions, 
        'createMovie', 
        0, 
        true
      );
      
      // Should override template values
      expect(result).toHaveProperty('id', 'override-123');
      expect(result).toHaveProperty('width', 1920); // overridden from 1280
      expect(result).toHaveProperty('height', 1080); // overridden from 720
      expect(result).toHaveProperty('fps', 30);
      expect(result).toHaveProperty('quality', 'high');
      expect(result).toHaveProperty('cache', true);
      expect(result).toHaveProperty('draft', false);
      expect(result).toHaveProperty('resolution', '4K');
      expect(result).toHaveProperty('webhook');
    });

    test('should handle advanced mode overrides with null values', () => {
      const templateWithoutOverrides = JSON.stringify({
        width: 1280,
        height: 720
      });
      
      const mockExecute = {
        getNodeParameter: (parameterName: string, itemIndex: number, fallbackValue?: any) => {
          const paramMap: { [key: string]: any } = {
            'operation': 'createMovie',
            'jsonTemplate': templateWithoutOverrides,
            'recordId': '',
            'outputWidth': null,
            'outputHeight': null,
            'framerate': null,
            'webhookUrl': '',
            'quality': null,
            'cache': null,
            'draft': null,
            'resolution': null
          };
          
          if (paramMap.hasOwnProperty(parameterName)) {
            return paramMap[parameterName];
          }
          
          return fallbackValue;
        },
        logger: {
          debug: jest.fn(),
          warn: jest.fn(),
          info: jest.fn(),
          error: jest.fn(),
        }
      };
      
      const result = buildRequestBody.call(
        mockExecute as unknown as IExecuteFunctions, 
        'createMovie', 
        0, 
        true
      );
      
      // Should keep original template values when overrides are null/empty
      expect(result).toHaveProperty('width', 1280);
      expect(result).toHaveProperty('height', 720);
      expect(result).not.toHaveProperty('id');
      expect(result).not.toHaveProperty('webhook');
    });

    test('should handle parameter access errors in advanced mode overrides', () => {
      const templateWithoutOverrides = JSON.stringify({
        width: 1280,
        height: 720
      });
      
      const mockExecute = {
        getNodeParameter: (parameterName: string, itemIndex: number, fallbackValue?: any) => {
          if (parameterName === 'jsonTemplate') return templateWithoutOverrides;
          if (parameterName === 'recordId') return 'test-id';
          if (parameterName === 'outputWidth') return 1920;
          if (parameterName === 'outputHeight') return 1080;
          if (parameterName === 'framerate') return 30;
          if (parameterName === 'webhookUrl') return 'https://example.com/webhook';
          
          // These parameters will throw errors (simulating optional parameters)
          if (['quality', 'cache', 'draft', 'resolution'].includes(parameterName)) {
            throw new Error('Parameter not available');
          }
          
          return fallbackValue;
        },
        logger: {
          debug: jest.fn(),
          warn: jest.fn(),
          info: jest.fn(),
          error: jest.fn(),
        }
      };
      
      const result = buildRequestBody.call(
        mockExecute as unknown as IExecuteFunctions, 
        'createMovie', 
        0, 
        true
      );
      
      // Should handle parameter access errors gracefully
      expect(result).toHaveProperty('id', 'test-id');
      expect(result).toHaveProperty('width', 1920);
      expect(result).toHaveProperty('height', 1080);
      expect(result).toHaveProperty('fps', 30);
      expect(result).toHaveProperty('webhook');
      
      // These should not be present due to parameter access errors
      expect(result).not.toHaveProperty('quality');
      expect(result).not.toHaveProperty('cache');
      expect(result).not.toHaveProperty('draft');
      expect(result).not.toHaveProperty('resolution');
    });
  });
});