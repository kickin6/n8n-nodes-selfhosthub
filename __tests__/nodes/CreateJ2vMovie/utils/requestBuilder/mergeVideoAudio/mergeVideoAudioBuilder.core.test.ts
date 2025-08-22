// __tests__/nodes/CreateJ2vMovie/utils/requestBuilder/mergeVideoAudio/mergeVideoAudioBuilder.core.test.ts

import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { buildRequestBody, buildMergeVideoAudioRequestBody } from '@nodes/CreateJ2vMovie/utils/requestBuilder';

describe('requestBuilder - mergeVideoAudio Operation', () => {
  describe('Basic Mode', () => {
    test('should use default itemIndex when called without parameter', () => {
      const mockExecute = {
        getNodeParameter: (parameterName: string, itemIndex: number, fallbackValue?: any) => {
          expect(itemIndex).toBe(0);
          return fallbackValue;
        },
        logger: {
          debug: jest.fn(),
          warn: jest.fn(),
          info: jest.fn(),
          error: jest.fn(),
        }
      };

      const result = buildMergeVideoAudioRequestBody.call(mockExecute as unknown as IExecuteFunctions);

      expect(result).toHaveProperty('scenes');
      expect(result).toHaveProperty('width', 1024);
      expect(result).toHaveProperty('height', 768);
      expect(result).toHaveProperty('fps', 30);
    });

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

    // Video element tests - keep essential ones only
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

    test('should handle video element with duration -1', () => {
      const mockExecute = {
        getNodeParameter: (parameterName: string, itemIndex: number, fallbackValue?: any) => {
          if (parameterName === 'videoElement') {
            throw new Error('videoElement not available');
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

    // Audio element tests - keep essential ones only
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

    test('should handle audio element with loop false', () => {
      const mockExecute = {
        getNodeParameter: (parameterName: string, itemIndex: number, fallbackValue?: any) => {
          if (parameterName === 'audioElement') {
            throw new Error('audioElement not available');
          }
          if (parameterName === 'audioElement.audioDetails') {
            return {
              src: 'https://example.com/audio.mp3',
              loop: false
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
      expect(audioElement.loop).toBe(1);
    });

    // Output settings tests - FIXED
    test('should handle output settings collection format', () => {
      const mockExecute = {
        getNodeParameter: (parameterName: string, itemIndex: number, fallbackValue?: any) => {
          if (parameterName === 'outputSettings') {
            return {
              outputDetails: {
                width: 1280,
                height: 720,
                fps: 25
                // Removed quality: 'medium' - doesn't exist in implementation
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
      // Removed: expect(result.quality).toBe('medium');
    });

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

    // Basic text element integration - keep minimal
    test('should handle text elements with valid configuration', () => {
      const mockExecute = {
        getNodeParameter: (parameterName: string, itemIndex: number, fallbackValue?: any) => {
          if (parameterName === 'textElements.textDetails') {
            return [{
              text: 'Hello World',
              style: '001',
              fontFamily: 'Roboto',
              fontSize: '32px',
              start: 0,
              duration: -2
            }];
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
      const textElement = scenes[0].elements.find((el: any) => el.type === 'text');

      expect(textElement).toBeDefined();
      expect(textElement.text).toBe('Hello World');
      expect(textElement.style).toBe('001');
    });

    test('should throw error for invalid text element - empty text', () => {
      const mockExecute = {
        getNodeParameter: (parameterName: string, itemIndex: number, fallbackValue?: any) => {
          if (parameterName === 'textElements.textDetails') {
            return [{
              text: '',
              style: '001'
            }];
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

      expect(() => {
        buildRequestBody.call(
          mockExecute as unknown as IExecuteFunctions,
          'mergeVideoAudio',
          0,
          false
        );
      }).toThrow('Text element validation errors');
    });
  });

  // NEW COVERAGE: Movie-Level Elements (Lines 146-166, 205-266, 303, 315)
  describe('Movie-Level Elements - NEW Coverage', () => {
    test('should process subtitle elements and add to scene (Lines 146-166)', () => {
      const mockExecute = {
        getNodeParameter: (parameterName: string, itemIndex: number, fallbackValue?: any) => {
          if (parameterName === 'subtitleElements.subtitleDetails') {
            return [{ captions: 'Test subtitle', language: 'en' }];
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
      const subtitleElements = scenes[0].elements.filter((el: any) => el.type === 'subtitles');
      expect(subtitleElements).toHaveLength(1);
    });

    test('should throw subtitle validation errors (Lines 146-166)', () => {
      const mockExecute = {
        getNodeParameter: (parameterName: string, itemIndex: number, fallbackValue?: any) => {
          if (parameterName === 'subtitleElements.subtitleDetails') {
            return [{ captions: '', language: 'en' }]; // Invalid
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

      expect(() => {
        buildRequestBody.call(
          mockExecute as unknown as IExecuteFunctions,
          'mergeVideoAudio',
          0,
          false
        );
      }).toThrow('Subtitle validation errors');
    });

    test('should process movie text elements and add to top-level (Lines 205-209)', () => {
      const mockExecute = {
        getNodeParameter: (parameterName: string, itemIndex: number, fallbackValue?: any) => {
          if (parameterName === 'movieTextElements.textDetails') {
            return [{ text: 'Movie text', style: '001' }];
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

      expect(result).toHaveProperty('elements');
      expect(result.elements).toHaveLength(1);
      expect((result.elements![0] as any).text).toBe('Movie text');
    });

    test('should process movie elements with text type (Lines 230-266)', () => {
      const mockExecute = {
        getNodeParameter: (parameterName: string, itemIndex: number, fallbackValue?: any) => {
          if (parameterName === 'movieElements.elementValues') {
            return [{ type: 'text', text: 'Movie element text', style: '001' }];
          }
          if (parameterName === 'movieTextElements.textDetails') return [];
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

      expect(result).toHaveProperty('elements');
      expect(result.elements).toHaveLength(1);
    });

    test('should use default text when movie element text missing (Line 225)', () => {
      const mockExecute = {
        getNodeParameter: (parameterName: string, itemIndex: number, fallbackValue?: any) => {
          if (parameterName === 'movieElements.elementValues') {
            return [{ type: 'text', style: '001' }]; // No text property
          }
          if (parameterName === 'movieTextElements.textDetails') return [];
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

      expect(result).toHaveProperty('elements');
      expect(result.elements).toHaveLength(1);
      expect((result.elements![0] as any).text).toBe('Default Text');
    });

    test('should combine movie-level and scene-level elements correctly', () => {
      const mockExecute = {
        getNodeParameter: (parameterName: string, itemIndex: number, fallbackValue?: any) => {
          if (parameterName === 'movieTextElements.textDetails') {
            return [{ text: 'Movie text', style: '001' }];
          }
          if (parameterName === 'textElements.textDetails') {
            return [{ text: 'Scene text', style: '002' }];
          }
          if (parameterName === 'videoElement') {
            return { videoDetails: { src: 'https://example.com/video.mp4' } };
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

      // Should have movie-level elements at top level
      expect(result).toHaveProperty('elements');
      expect(result.elements).toHaveLength(1); // 1 movie text

      // Should have scene-level elements in scene
      expect(result.scenes[0].elements).toHaveLength(2); // 1 video + 1 scene text
    });
  });
});