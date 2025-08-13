import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { buildRequestBody } from '../../../../../nodes/CreateJ2vMovie/utils/requestBuilder';

describe('requestBuilder - mergeVideoAudio Operation', () => {
  describe('buildRequestBody - mergeVideoAudio Basic Mode', () => {
    test('should handle mergeVideoAudio operation with basic parameters', () => {
      const mockExecute = {
        getNodeParameter: (parameterName: string, itemIndex: number, fallbackValue?: any) => {
          if (parameterName === 'recordId') return 'merge-123';
          if (parameterName === 'webhookUrl') return 'https://webhook.site/merge';
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
      
      expect(result).toHaveProperty('id', 'merge-123');
      expect(result).toHaveProperty('exports');
    });

    test('should handle mergeVideoAudio with defaults when no parameters', () => {
      const mockExecute = {
        getNodeParameter: (parameterName: string, itemIndex: number, fallbackValue?: any) => {
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
      expect(result).toHaveProperty('width', 1024);
      expect(result).toHaveProperty('height', 768);
      expect(result).toHaveProperty('fps', 30);
      
      const scenes = result.scenes as any[];
      expect(scenes).toHaveLength(1);
      expect(scenes[0]).toHaveProperty('elements');
    });

    // TARGET LINE 250: Video element collection access - first try block
    test('should handle video element collection format', () => {
      const mockExecute = {
        getNodeParameter: (parameterName: string, itemIndex: number, fallbackValue?: any) => {
          if (parameterName === 'videoElement') {
            return {
              videoDetails: {
                src: 'https://example.com/video.mp4',
                duration: 10,
                volume: 0.8
              }
            };
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
      
      const scenes = result.scenes as any[];
      const videoElement = scenes[0].elements.find((el: any) => el.type === 'video');
      expect(videoElement).toBeDefined();
      expect(videoElement.src).toBe('https://example.com/video.mp4');
    });

    // TARGET LINE 253: Video element fallback to direct parameter access
    test('should handle video element fallback to direct parameter', () => {
      const mockExecute = {
        getNodeParameter: (parameterName: string, itemIndex: number, fallbackValue?: any) => {
          if (parameterName === 'videoElement') {
            throw new Error('videoElement not available');
          }
          if (parameterName === 'videoElement.videoDetails') {
            throw new Error('videoElement.videoDetails not available');
          }
          if (parameterName === 'video') {
            return 'https://example.com/fallback-video.mp4';
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
      
      const scenes = result.scenes as any[];
      const videoElement = scenes[0].elements.find((el: any) => el.type === 'video');
      expect(videoElement).toBeDefined();
      expect(videoElement.src).toBe('https://example.com/fallback-video.mp4');
    });

    // TARGET LINE 259: Video element duration === -1 condition
    test('should handle video element with duration -1', () => {
      const mockExecute = {
        getNodeParameter: (parameterName: string, itemIndex: number, fallbackValue?: any) => {
          // Mock the nested parameter structure that the code expects
          if (parameterName === 'videoElement') {
            throw new Error('videoElement not available'); // Force fallback to next try
          }
          if (parameterName === 'videoElement.videoDetails') {
            return {
              src: 'https://example.com/video.mp4',
              duration: -1
            };
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
      
      const scenes = result.scenes as any[];
      const videoElement = scenes[0].elements.find((el: any) => el.type === 'video');
      expect(videoElement).toBeDefined();
      expect(videoElement.duration).toBe(-1);
    });

    // TARGET LINE 262: Video element duration === -2 condition
    test('should handle video element with duration -2', () => {
      const mockExecute = {
        getNodeParameter: (parameterName: string, itemIndex: number, fallbackValue?: any) => {
          if (parameterName === 'videoElement') {
            throw new Error('videoElement not available');
          }
          if (parameterName === 'videoElement.videoDetails') {
            return {
              src: 'https://example.com/video.mp4',
              duration: -2
            };
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
      
      const scenes = result.scenes as any[];
      const videoElement = scenes[0].elements.find((el: any) => el.type === 'video');
      expect(videoElement).toBeDefined();
      expect(videoElement.duration).toBe(-2);
    });

    // TARGET LINES 265-268: Video element properties (volume, muted, loop, crop)
    test('should handle video element with all properties', () => {
      const mockExecute = {
        getNodeParameter: (parameterName: string, itemIndex: number, fallbackValue?: any) => {
          if (parameterName === 'videoElement') {
            throw new Error('videoElement not available');
          }
          if (parameterName === 'videoElement.videoDetails') {
            return {
              src: 'https://example.com/video.mp4',
              volume: 0.5,
              muted: true,
              loop: true,
              crop: true
            };
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
      
      const scenes = result.scenes as any[];
      const videoElement = scenes[0].elements.find((el: any) => el.type === 'video');
      expect(videoElement).toBeDefined();
      expect(videoElement.volume).toBe(0.5);
      expect(videoElement.muted).toBe(true);
      expect(videoElement.loop).toBe(-1);
      expect(videoElement.resize).toBe('cover');
    });

    test('should handle video element with loop false and crop false', () => {
      const mockExecute = {
        getNodeParameter: (parameterName: string, itemIndex: number, fallbackValue?: any) => {
          if (parameterName === 'videoElement') {
            throw new Error('videoElement not available');
          }
          if (parameterName === 'videoElement.videoDetails') {
            return {
              src: 'https://example.com/video.mp4',
              loop: false,
              crop: false
            };
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
      
      const scenes = result.scenes as any[];
      const videoElement = scenes[0].elements.find((el: any) => el.type === 'video');
      expect(videoElement).toBeDefined();
      expect(videoElement.loop).toBe(1);
      expect(videoElement.resize).toBe('contain');
    });

    // TARGET LINE 272: Video element fit property override
    test('should handle video element fit property override', () => {
      const mockExecute = {
        getNodeParameter: (parameterName: string, itemIndex: number, fallbackValue?: any) => {
          if (parameterName === 'videoElement') {
            throw new Error('videoElement not available');
          }
          if (parameterName === 'videoElement.videoDetails') {
            return {
              src: 'https://example.com/video.mp4',
              crop: false,
              fit: 'fill'
            };
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
      
      const scenes = result.scenes as any[];
      const videoElement = scenes[0].elements.find((el: any) => el.type === 'video');
      expect(videoElement).toBeDefined();
      expect(videoElement.resize).toBe('fill');
    });

    // TARGET LINE 304: Audio element collection access - first try block
    test('should handle audio element collection format', () => {
      const mockExecute = {
        getNodeParameter: (parameterName: string, itemIndex: number, fallbackValue?: any) => {
          if (parameterName === 'audioElement') {
            return {
              audioDetails: {
                src: 'https://example.com/audio.mp3',
                volume: 0.7
              }
            };
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
      
      const scenes = result.scenes as any[];
      const audioElement = scenes[0].elements.find((el: any) => el.type === 'audio');
      expect(audioElement).toBeDefined();
      expect(audioElement.src).toBe('https://example.com/audio.mp3');
    });

    // TARGET LINES 307-309: Audio element fallback paths
    test('should handle audio element fallback to direct parameter', () => {
      const mockExecute = {
        getNodeParameter: (parameterName: string, itemIndex: number, fallbackValue?: any) => {
          if (parameterName === 'audioElement') {
            throw new Error('audioElement not available');
          }
          if (parameterName === 'audioElement.audioDetails') {
            throw new Error('audioElement.audioDetails not available');
          }
          if (parameterName === 'audio') {
            return 'https://example.com/fallback-audio.mp3';
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
      
      const scenes = result.scenes as any[];
      const audioElement = scenes[0].elements.find((el: any) => el.type === 'audio');
      expect(audioElement).toBeDefined();
      expect(audioElement.src).toBe('https://example.com/fallback-audio.mp3');
    });

    // TARGET LINE 313: Audio element start !== 0 condition  
    test('should handle audio element with start time not zero', () => {
      const mockExecute = {
        getNodeParameter: (parameterName: string, itemIndex: number, fallbackValue?: any) => {
          if (parameterName === 'audioElement') {
            throw new Error('audioElement not available');
          }
          if (parameterName === 'audioElement.audioDetails') {
            return {
              src: 'https://example.com/audio.mp3',
              start: 5
            };
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
      
      const scenes = result.scenes as any[];
      const audioElement = scenes[0].elements.find((el: any) => el.type === 'audio');
      expect(audioElement).toBeDefined();
      expect(audioElement.start).toBe(5);
    });

    // TARGET LINE 316: Audio element duration === -1 condition
    test('should handle audio element with duration -1', () => {
      const mockExecute = {
        getNodeParameter: (parameterName: string, itemIndex: number, fallbackValue?: any) => {
          if (parameterName === 'audioElement') {
            throw new Error('audioElement not available');
          }
          if (parameterName === 'audioElement.audioDetails') {
            return {
              src: 'https://example.com/audio.mp3',
              duration: -1
            };
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
      
      const scenes = result.scenes as any[];
      const audioElement = scenes[0].elements.find((el: any) => el.type === 'audio');
      expect(audioElement).toBeDefined();
      expect(audioElement.duration).toBe(-1);
    });

    test('should handle audio element with duration -2', () => {
      const mockExecute = {
        getNodeParameter: (parameterName: string, itemIndex: number, fallbackValue?: any) => {
          if (parameterName === 'audioElement') {
            throw new Error('audioElement not available');
          }
          if (parameterName === 'audioElement.audioDetails') {
            return {
              src: 'https://example.com/audio.mp3',
              duration: -2
            };
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
      
      const scenes = result.scenes as any[];
      const audioElement = scenes[0].elements.find((el: any) => el.type === 'audio');
      expect(audioElement).toBeDefined();
      expect(audioElement.duration).toBe(-2);
    });

    // TARGET LINE 322: Audio element loop condition
    test('should handle audio element with loop true', () => {
      const mockExecute = {
        getNodeParameter: (parameterName: string, itemIndex: number, fallbackValue?: any) => {
          if (parameterName === 'audioElement') {
            throw new Error('audioElement not available');
          }
          if (parameterName === 'audioElement.audioDetails') {
            return {
              src: 'https://example.com/audio.mp3',
              loop: true
            };
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
      
      const scenes = result.scenes as any[];
      const audioElement = scenes[0].elements.find((el: any) => el.type === 'audio');
      expect(audioElement).toBeDefined();
      expect(audioElement.loop).toBe(-1);
    });

    // TARGET LINES 307-309: Audio element with valid positive duration
    test('should handle audio element with valid positive duration', () => {
      const mockExecute = {
        getNodeParameter: (parameterName: string, itemIndex: number, fallbackValue?: any) => {
          if (parameterName === 'audioElement') {
            throw new Error('audioElement not available');
          }
          if (parameterName === 'audioElement.audioDetails') {
            return {
              src: 'https://example.com/audio.mp3',
              duration: 15.5 // Valid positive duration
            };
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
      
      const scenes = result.scenes as any[];
      const audioElement = scenes[0].elements.find((el: any) => el.type === 'audio');
      expect(audioElement).toBeDefined();
      expect(audioElement.duration).toBe(15.5);
    });

    // TARGET LINE 336: Output settings collection access
    test('should handle output settings collection format', () => {
      const mockExecute = {
        getNodeParameter: (parameterName: string, itemIndex: number, fallbackValue?: any) => {
          if (parameterName === 'outputSettings') {
            return {
              outputDetails: {
                width: 1280,
                height: 720,
                fps: 25,
                quality: 'medium'
              }
            };
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
      
      expect(result.width).toBe(1280);
      expect(result.height).toBe(720);
      expect(result.fps).toBe(25);
      expect(result.quality).toBe('medium');
    });

    // TARGET LINE 354: Output settings fallback to individual parameters
    test('should handle output settings fallback to individual parameters', () => {
      const mockExecute = {
        getNodeParameter: (parameterName: string, itemIndex: number, fallbackValue?: any) => {
          if (parameterName === 'outputSettings') {
            throw new Error('outputSettings not available');
          }
          if (parameterName === 'outputSettings.outputDetails') {
            throw new Error('outputSettings.outputDetails not available');
          }
          if (parameterName === 'width') return 1280;
          if (parameterName === 'height') return 720;
          if (parameterName === 'fps') return 25;
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
      
      expect(result.width).toBe(1280);
      expect(result.height).toBe(720);
      expect(result.fps).toBe(25);
    });
  });
});