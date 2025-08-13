import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { buildRequestBody } from '../../../../../nodes/CreateJ2vMovie/utils/requestBuilder';

describe('requestBuilder - createMovie Operation', () => {
  describe('buildRequestBody - createMovie Basic Mode', () => {
    test('should handle createMovie operation in basic mode with movie elements', () => {
      const mockExecute = {
        getNodeParameter: (parameterName: string, itemIndex: number, fallbackValue?: any) => {
          const paramMap: { [key: string]: any } = {
            'operation': 'createMovie',
            'recordId': 'test-123',
            'output_width': 1920,
            'output_height': 1080,
            'framerate': 30,
            'webhookUrl': 'https://webhook.site/test',
            'quality': 'high',
            'cache': true,
            'draft': false,
            'movieElements.elementValues': [
              {
                elementType: 'text',
                text: 'Test Text',
                positionPreset: 'center'
              }
            ],
            'elements.elementValues': []
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
        false
      );
      
      expect(result).toHaveProperty('id', 'test-123');
      expect(result).toHaveProperty('width', 1920);
      expect(result).toHaveProperty('height', 1080);
      expect(result).toHaveProperty('fps', 30);
      expect(result).toHaveProperty('quality', 'high');
      expect(result).toHaveProperty('cache', true);
      expect(result).toHaveProperty('draft', false);
      expect(result).toHaveProperty('exports');
      expect(result).toHaveProperty('elements');
    });

    test('should handle createMovie operation in basic mode with scene elements', () => {
      // Mock require at module level before calling the function
      const mockProcessElement = jest.fn().mockReturnValue({
        type: 'image',
        src: 'https://example.com/test.jpg',
        position: 'top-left'
      });
      
      jest.mock('../../../../../nodes/CreateJ2vMovie/utils/elementProcessor', () => ({
        processElement: mockProcessElement
      }));

      const mockExecute = {
        getNodeParameter: (parameterName: string, itemIndex: number, fallbackValue?: any) => {
          const paramMap: { [key: string]: any } = {
            'operation': 'createMovie',
            'recordId': 'test-123',
            'output_width': 1920,
            'output_height': 1080,
            'framerate': 30,
            'webhookUrl': '',
            'quality': '',
            'cache': undefined,
            'draft': undefined,
            'movieElements.elementValues': [],
            'elements.elementValues': [
              {
                elementType: 'image',
                src: 'https://example.com/test.jpg',
                positionPreset: 'top_left'
              }
            ]
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
        false
      );
      
      expect(result).toHaveProperty('id', 'test-123');
      expect(result).toHaveProperty('scenes');
      // The actual result will depend on how the element processing works
      expect(result.scenes).toBeDefined();
    });

    test('should handle createMovie with empty recordId and webhookUrl', () => {
      const mockExecute = {
        getNodeParameter: (parameterName: string, itemIndex: number, fallbackValue?: any) => {
          const paramMap: { [key: string]: any } = {
            'operation': 'createMovie',
            'recordId': '',
            'output_width': 1920,
            'output_height': 1080,
            'framerate': 30,
            'webhookUrl': '',
            'quality': '',
            'movieElements.elementValues': [],
            'elements.elementValues': []
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
        false
      );
      
      expect(result).not.toHaveProperty('id');
      expect(result).not.toHaveProperty('exports');
      expect(result).not.toHaveProperty('quality');
    });

    test('should handle createMovie parameter access errors in basic mode', () => {
      const mockExecute = {
        getNodeParameter: (parameterName: string, itemIndex: number, fallbackValue?: any) => {
          // Basic required parameters
          if (parameterName === 'framerate') return 25;
          if (parameterName === 'output_width') return 1024;
          if (parameterName === 'output_height') return 768;
          if (parameterName === 'recordId') return 'test-id';
          if (parameterName === 'webhookUrl') return 'https://example.com/webhook';
          if (parameterName === 'quality') return 'medium';
          
          // These will throw errors to test error handling
          if (['cache', 'draft'].includes(parameterName)) {
            throw new Error('Parameter not available');
          }
          
          // Collections that throw errors
          if (['movieElements.elementValues', 'elements.elementValues'].includes(parameterName)) {
            throw new Error('Collection not available');
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
        false
      );
      
      expect(result).toHaveProperty('fps', 25);
      expect(result).toHaveProperty('width', 1024);
      expect(result).toHaveProperty('height', 768);
      expect(result).toHaveProperty('quality', 'medium');
      expect(result).not.toHaveProperty('cache');
      expect(result).not.toHaveProperty('draft');
      expect(mockExecute.logger.debug).toHaveBeenCalledWith('Cache parameter not available');
      expect(mockExecute.logger.debug).toHaveBeenCalledWith('Draft parameter not available');
      expect(mockExecute.logger.debug).toHaveBeenCalledWith('Movie elements collection not available or empty');
      expect(mockExecute.logger.debug).toHaveBeenCalledWith('Scene elements collection not available or empty');
    });

    test('should handle createMovie with whitespace in recordId and webhookUrl', () => {
      const mockExecute = {
        getNodeParameter: (parameterName: string, itemIndex: number, fallbackValue?: any) => {
          const paramMap: { [key: string]: any } = {
            'recordId': '  test-123  ',
            'output_width': 1920,
            'output_height': 1080,
            'framerate': 30,
            'webhookUrl': '  https://webhook.site/test  ',
            'quality': 'high',
            'movieElements.elementValues': [],
            'elements.elementValues': []
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
        false
      );
      
      expect(result).toHaveProperty('id', 'test-123');
      expect(result).toHaveProperty('exports');
      expect(result.exports).toEqual([{
        destinations: [{
          type: 'webhook',
          endpoint: 'https://webhook.site/test'
        }]
      }]);
    });
  });
});