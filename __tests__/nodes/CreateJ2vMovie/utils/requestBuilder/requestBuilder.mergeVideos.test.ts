import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { buildRequestBody } from '../../../../../nodes/CreateJ2vMovie/utils/requestBuilder';

describe('requestBuilder - mergeVideos Operation', () => {
  describe('buildRequestBody - mergeVideos Basic Mode', () => {
    test('should handle mergeVideos operation in basic mode', () => {
      const mockExecute = {
        getNodeParameter: (parameterName: string, itemIndex: number, fallbackValue?: any) => {
          const paramMap: { [key: string]: any } = {
            'operation': 'mergeVideos',
            'recordId': 'videos-123',
            'webhookUrl': 'https://webhook.site/videos',
            'transition': 'fade',
            'transitionDuration': 2,
            'videoElements.videoDetails': [
              {
                src: 'https://example.com/video1.mp4',
                duration: 10,
                speed: 1.5,
                volume: 0.8
              },
              {
                src: 'https://example.com/video2.mp4',
                duration: -1,
                start: 5
              }
            ],
            'outputSettings.outputDetails': {
              width: 1920,
              height: 1080,
              fps: 30,
              quality: 'high'
            }
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
      expect(result).toHaveProperty('width', 1920);
      expect(result).toHaveProperty('height', 1080);
      expect(result).toHaveProperty('fps', 30);
      expect(result).toHaveProperty('quality', 'high');

      const scenes = result.scenes as any[];
      expect(scenes).toHaveLength(2);

      expect(scenes[0]).not.toHaveProperty('transition');

      expect(scenes[1]).toHaveProperty('transition');
      expect(scenes[1].transition.style).toBe('fade');
      expect(scenes[1].transition.duration).toBe(2);
    });

    test('should handle mergeVideos with no transition', () => {
      const mockExecute = {
        getNodeParameter: (parameterName: string, itemIndex: number, fallbackValue?: any) => {
          const paramMap: { [key: string]: any } = {
            'transition': 'none',
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

      const scenes = result.scenes as any[];
      expect(scenes).toHaveLength(2);

      expect(scenes[0]).not.toHaveProperty('transition');
      expect(scenes[1]).not.toHaveProperty('transition');
    });

    test('should handle mergeVideos with invalid video duration', () => {
      const mockExecute = {
        getNodeParameter: (parameterName: string, itemIndex: number, fallbackValue?: any) => {
          const paramMap: { [key: string]: any } = {
            'videoElements.videoDetails': [
              {
                src: 'https://example.com/video1.mp4',
                duration: -5
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
        'mergeVideos',
        0,
        false
      );

      const scenes = result.scenes as any[];
      const videoElement = scenes[0].elements[0];

      expect(videoElement).not.toHaveProperty('duration');
      expect(mockExecute.logger.debug).toHaveBeenCalledWith(
        expect.stringContaining('Invalid duration -5')
      );
    });

    test('should handle mergeVideos with empty video elements', () => {
      const mockExecute = {
        getNodeParameter: (parameterName: string, itemIndex: number, fallbackValue?: any) => {
          const paramMap: { [key: string]: any } = {
            'videoElements.videoDetails': []
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

      const scenes = result.scenes as any[];
      expect(scenes).toHaveLength(1);
      expect(scenes[0].elements).toHaveLength(0);
      expect(mockExecute.logger.debug).toHaveBeenCalledWith(
        'No video elements found or empty array'
      );
    });

    test('should handle mergeVideos transition access error', () => {
      const mockExecute = {
        getNodeParameter: (parameterName: string, itemIndex: number, fallbackValue?: any) => {
          if (parameterName === 'transition') {
            throw new Error('Transition parameter not available');
          }
          if (parameterName === 'videoElements.videoDetails') {
            return [{ src: 'https://example.com/video.mp4' }];
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
      expect(mockExecute.logger.debug).toHaveBeenCalledWith('Error accessing transition settings');
    });

    test('should handle mergeVideos video elements access error', () => {
      const mockExecute = {
        getNodeParameter: (parameterName: string, itemIndex: number, fallbackValue?: any) => {
          if (parameterName === 'videoElements.videoDetails') {
            throw new Error('Video elements not available');
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
      const scenes = result.scenes as any[];
      expect(scenes).toHaveLength(1);
      expect(scenes[0].elements).toHaveLength(0);
      expect(mockExecute.logger.debug).toHaveBeenCalledWith('Error accessing video elements collection');
    });

    test('should handle mergeVideos output settings access error', () => {
      const mockExecute = {
        getNodeParameter: (parameterName: string, itemIndex: number, fallbackValue?: any) => {
          if (parameterName === 'outputSettings.outputDetails') {
            throw new Error('Output settings not available');
          }
          if (parameterName === 'videoElements.videoDetails') {
            return [{ src: 'https://example.com/video.mp4' }];
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

      expect(result).toHaveProperty('width', 1024);
      expect(result).toHaveProperty('height', 768);
      expect(result).toHaveProperty('fps', 30);
      expect(mockExecute.logger.debug).toHaveBeenCalledWith('No output settings found or error accessing output settings properties');
    });

    test('should handle mergeVideos with video elements without src', () => {
      const mockExecute = {
        getNodeParameter: (parameterName: string, itemIndex: number, fallbackValue?: any) => {
          if (parameterName === 'videoElements.videoDetails') {
            return [
              { src: 'https://example.com/video1.mp4' },
              { duration: 10 },
              { src: 'https://example.com/video2.mp4' }
            ];
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

      const scenes = result.scenes as any[];
      expect(scenes).toHaveLength(2);
      expect(scenes[0].elements[0].src).toBe('https://example.com/video1.mp4');
      expect(scenes[1].elements[0].src).toBe('https://example.com/video2.mp4');
    });

    test('should handle mergeVideos with positive transition duration', () => {
      const mockExecute = {
        getNodeParameter: (parameterName: string, itemIndex: number, fallbackValue?: any) => {
          if (parameterName === 'transition') return 'crossfade';
          if (parameterName === 'transitionDuration') return 0;
          if (parameterName === 'videoElements.videoDetails') {
            return [
              { src: 'https://example.com/video1.mp4' },
              { src: 'https://example.com/video2.mp4' }
            ];
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

      const scenes = result.scenes as any[];
      expect(scenes[1]).toHaveProperty('transition');
      expect(scenes[1].transition.style).toBe('crossfade');
      expect(scenes[1].transition).not.toHaveProperty('duration');
    });

    // TARGET LINE 443: Test the specific duration handling logic that was missing coverage
    test('should handle mergeVideos with valid positive duration', () => {
      const mockExecute = {
        getNodeParameter: (parameterName: string, itemIndex: number, fallbackValue?: any) => {
          if (parameterName === 'videoElements.videoDetails') {
            return [
              {
                src: 'https://example.com/video1.mp4',
                duration: 15.5 // Valid positive duration
              }
            ];
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

      const scenes = result.scenes as any[];
      const videoElement = scenes[0].elements[0];
      expect(videoElement.duration).toBe(15.5);
    });

    test('should handle mergeVideos with duration -2 explicitly set', () => {
      const mockExecute = {
        getNodeParameter: (parameterName: string, itemIndex: number, fallbackValue?: any) => {
          if (parameterName === 'videoElements.videoDetails') {
            return [
              {
                src: 'https://example.com/video1.mp4',
                duration: -2 // Explicit -2 value
              }
            ];
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

      const scenes = result.scenes as any[];
      const videoElement = scenes[0].elements[0];
      expect(videoElement.duration).toBe(-2);
    });

    test('should handle mergeVideos with zero duration', () => {
      const mockExecute = {
        getNodeParameter: (parameterName: string, itemIndex: number, fallbackValue?: any) => {
          if (parameterName === 'videoElements.videoDetails') {
            return [
              {
                src: 'https://example.com/video1.mp4',
                duration: 0 // Zero duration should not be set
              }
            ];
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

      const scenes = result.scenes as any[];
      const videoElement = scenes[0].elements[0];
      // Zero duration should not be set as a property
      expect(videoElement).not.toHaveProperty('duration');
    });

    // Test to cover the else branch when duration is invalid but not logged
    test('should handle mergeVideos with undefined duration', () => {
      const mockExecute = {
        getNodeParameter: (parameterName: string, itemIndex: number, fallbackValue?: any) => {
          if (parameterName === 'videoElements.videoDetails') {
            return [
              {
                src: 'https://example.com/video1.mp4'
                // No duration property at all
              }
            ];
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

      const scenes = result.scenes as any[];
      const videoElement = scenes[0].elements[0];
      // When no duration is provided, no duration property should be set
      expect(videoElement).not.toHaveProperty('duration');
      expect(videoElement).toHaveProperty('src', 'https://example.com/video1.mp4');
    });
  });
});