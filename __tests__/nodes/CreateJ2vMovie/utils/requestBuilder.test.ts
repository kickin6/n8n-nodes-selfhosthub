import { IDataObject, IExecuteFunctions, NodeParameterValue } from 'n8n-workflow';
import { 
  buildRequestBody, 
  getParameterValue
} from '../../../../nodes/CreateJ2vMovie/utils/requestBuilder';

describe('requestBuilder', () => {
  describe('getParameterValue', () => {
    test('should return parameter value when found', () => {
      const mockExecute = {
        getNodeParameter: jest.fn().mockReturnValue('test-value'),
        logger: {
          debug: jest.fn(),
          warn: jest.fn(),
          info: jest.fn(),
          error: jest.fn(),
        }
      };
      
      const result = getParameterValue.call(
        mockExecute as unknown as IExecuteFunctions,
        'testParam',
        0,
        'defaultValue'
      );
      
      expect(result).toBe('test-value');
      expect(mockExecute.getNodeParameter).toHaveBeenCalledWith('testParam', 0, 'defaultValue');
    });

    test('should return default value when parameter lookup fails', () => {
      const mockExecute = {
        getNodeParameter: jest.fn().mockImplementation(() => {
          throw new Error('Parameter not found');
        }),
        logger: {
          debug: jest.fn(),
          warn: jest.fn(),
          info: jest.fn(),
          error: jest.fn(),
        }
      };
      
      const result = getParameterValue.call(
        mockExecute as unknown as IExecuteFunctions,
        'nonExistentParameter',
        0,
        'defaultValue'
      );
      
      expect(result).toBe('defaultValue');
    });
  });

  describe('buildRequestBody', () => {
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

    test('should handle checkStatus operation correctly', () => {
      const mockExecute = {
        getNodeParameter: (parameterName: string, itemIndex: number, fallbackValue?: any) => {
          if (parameterName === 'operation') return 'checkStatus';
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
        'checkStatus', 
        0, 
        false
      );
      
      expect(result).toEqual({});
    });
    
    test('should throw error for unsupported operations', () => {
      const mockExecute = {
        getNodeParameter: (parameterName: string, itemIndex: number, fallbackValue?: any) => {
          if (parameterName === 'operation') return 'unknownOperation';
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
          'unknownOperation', 
          0, 
          false
        );
      }).toThrow('Unsupported operation: unknownOperation');
    });

    test('should handle createMovie operation in basic mode', () => {
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
            'resolution': '1080p',
            'movieElements.elementValues': [
              {
                elementType: 'text',
                text: 'Test Text',
                positionPreset: 'center'
              }
            ],
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
      expect(result).toHaveProperty('width', 1920);
      expect(result).toHaveProperty('height', 1080);
      expect(result).toHaveProperty('fps', 30);
      expect(result).toHaveProperty('quality', 'high');
      expect(result).toHaveProperty('cache', true);
      expect(result).toHaveProperty('draft', false);
      // Note: resolution parameter is not handled by basic mode createMovie
    });

    test('should handle mergeVideoAudio operation in basic mode', () => {
      const mockExecute = {
        getNodeParameter: (parameterName: string, itemIndex: number, fallbackValue?: any) => {
          const paramMap: { [key: string]: any } = {
            'operation': 'mergeVideoAudio',
            'recordId': 'merge-123',
            'webhookUrl': 'https://webhook.site/merge',
            'videoElement.videoDetails': { src: 'https://example.com/video.mp4' },
            'audioElement.audioDetails': { src: 'https://example.com/audio.mp3' }
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
        'mergeVideoAudio', 
        0, 
        false
      );
      
      expect(result).toHaveProperty('scenes');
      expect(result).toHaveProperty('id', 'merge-123');
    });

    test('should handle mergeVideos operation in basic mode', () => {
      const mockExecute = {
        getNodeParameter: (parameterName: string, itemIndex: number, fallbackValue?: any) => {
          const paramMap: { [key: string]: any } = {
            'operation': 'mergeVideos',
            'recordId': 'videos-123',
            'webhookUrl': 'https://webhook.site/videos',
            'videoElements.videoDetails': [
              { src: 'https://example.com/video1.mp4' },
              { src: 'https://example.com/video2.mp4' }
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
        'mergeVideos', 
        0, 
        false
      );
      
      expect(result).toHaveProperty('scenes');
      expect(result).toHaveProperty('id', 'videos-123');
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
  });
});