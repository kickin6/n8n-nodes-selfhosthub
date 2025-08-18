import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { buildRequestBody } from '@nodes/CreateJ2vMovie/utils/requestBuilder';

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

// Add these tests to your existing requestBuilder.mergeAudio.test.ts file

describe('requestBuilder - mergeVideoAudio Text Elements', () => {
  describe('buildRequestBody - mergeVideoAudio with Text Elements', () => {

    test('should handle text elements with valid configuration', () => {
      const mockExecute = {
        getNodeParameter: (parameterName: string, itemIndex: number, fallbackValue?: any) => {
          if (parameterName === 'textElements.textDetails') {
            return [{
              text: 'Hello World',
              style: '001',
              fontFamily: 'Roboto',
              fontSize: '32px',
              fontWeight: '600',
              fontColor: '#FFFFFF',
              backgroundColor: '#000000', // Use hex color instead of rgba
              textAlign: 'center',
              verticalPosition: 'bottom',
              horizontalPosition: 'center',
              position: 'bottom-left',
              x: 50,
              y: 50,
              start: 0,
              duration: -2,
              fadeIn: 0.3,
              fadeOut: 0.3,
              zIndex: 10
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
      expect(textElement.position).toBe('bottom-left');
      expect(textElement.start).toBe(0);
      expect(textElement.duration).toBe(-2);
      expect(textElement['fade-in']).toBe(0.3);
      expect(textElement['fade-out']).toBe(0.3);
      expect(textElement['z-index']).toBe(10);
      expect(textElement.settings).toBeDefined();
      expect(textElement.settings['font-family']).toBe('Roboto');
      expect(textElement.settings['font-size']).toBe('32px');
      expect(textElement.settings['font-weight']).toBe('600');
      expect(textElement.settings['font-color']).toBe('#FFFFFF');
      expect(textElement.settings['background-color']).toBe('#000000');
      expect(textElement.settings['text-align']).toBe('center');
      expect(textElement.settings['vertical-position']).toBe('bottom');
      expect(textElement.settings['horizontal-position']).toBe('center');
    });

    test('should handle multiple text elements', () => {
      const mockExecute = {
        getNodeParameter: (parameterName: string, itemIndex: number, fallbackValue?: any) => {
          if (parameterName === 'textElements.textDetails') {
            return [
              {
                text: 'First subtitle',
                style: '001',
                fontFamily: 'Arial',
                fontSize: '24px',
                fontColor: '#FFFFFF',
                start: 0,
                duration: 5
              },
              {
                text: 'Second subtitle',
                style: '002',
                fontFamily: 'Roboto',
                fontSize: '28px',
                fontColor: '#FFFF00',
                start: 5,
                duration: 5
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
        'mergeVideoAudio',
        0,
        false
      );

      const scenes = result.scenes as any[];
      const textElements = scenes[0].elements.filter((el: any) => el.type === 'text');

      expect(textElements).toHaveLength(2);
      expect(textElements[0].text).toBe('First subtitle');
      expect(textElements[0].style).toBe('001');
      expect(textElements[0].start).toBe(0);
      expect(textElements[0].duration).toBe(5);
      expect(textElements[0].settings['font-family']).toBe('Arial');

      expect(textElements[1].text).toBe('Second subtitle');
      expect(textElements[1].style).toBe('002');
      expect(textElements[1].start).toBe(5);
      expect(textElements[1].duration).toBe(5);
      expect(textElements[1].settings['font-family']).toBe('Roboto');
    });

    test('should handle text elements with custom position', () => {
      const mockExecute = {
        getNodeParameter: (parameterName: string, itemIndex: number, fallbackValue?: any) => {
          if (parameterName === 'textElements.textDetails') {
            return [{
              text: 'Custom positioned text',
              style: '003',
              position: 'custom',
              x: 100,
              y: 200,
              start: 2,
              duration: 8
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
      expect(textElement.position).toBe('custom');
      expect(textElement.x).toBe(100);
      expect(textElement.y).toBe(200);
    });

    test('should handle text elements with different styles', () => {
      const mockExecute = {
        getNodeParameter: (parameterName: string, itemIndex: number, fallbackValue?: any) => {
          if (parameterName === 'textElements.textDetails') {
            return [
              { text: 'Basic style', style: '001' },
              { text: 'Word by word', style: '002' },
              { text: 'Character by character', style: '003' },
              { text: 'Jumping letters', style: '004' }
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
        'mergeVideoAudio',
        0,
        false
      );

      const scenes = result.scenes as any[];
      const textElements = scenes[0].elements.filter((el: any) => el.type === 'text');

      expect(textElements).toHaveLength(4);
      expect(textElements[0].style).toBe('001');
      expect(textElements[1].style).toBe('002');
      expect(textElements[2].style).toBe('003');
      expect(textElements[3].style).toBe('004');
    });

    test('should handle empty text elements array', () => {
      const mockExecute = {
        getNodeParameter: (parameterName: string, itemIndex: number, fallbackValue?: any) => {
          if (parameterName === 'textElements.textDetails') {
            return [];
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
      const textElements = scenes[0].elements.filter((el: any) => el.type === 'text');

      expect(textElements).toHaveLength(0);
    });

    test('should handle non-array text elements gracefully', () => {
      const mockExecute = {
        getNodeParameter: (parameterName: string, itemIndex: number, fallbackValue?: any) => {
          if (parameterName === 'textElements.textDetails') {
            return null; // Non-array value
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
      const textElements = scenes[0].elements.filter((el: any) => el.type === 'text');

      expect(textElements).toHaveLength(0);
    });

    test('should throw error for invalid text element - empty text', () => {
      const mockExecute = {
        getNodeParameter: (parameterName: string, itemIndex: number, fallbackValue?: any) => {
          if (parameterName === 'textElements.textDetails') {
            return [{
              text: '', // Invalid empty text
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

    test('should throw error for invalid text element - missing required text', () => {
      const mockExecute = {
        getNodeParameter: (parameterName: string, itemIndex: number, fallbackValue?: any) => {
          if (parameterName === 'textElements.textDetails') {
            return [{
              style: '001'
              // Missing text property
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

    test('should handle text elements with video and audio', () => {
      const mockExecute = {
        getNodeParameter: (parameterName: string, itemIndex: number, fallbackValue?: any) => {
          if (parameterName === 'videoElement') {
            return {
              videoDetails: {
                src: 'https://example.com/video.mp4',
                volume: 0.5
              }
            };
          }
          if (parameterName === 'audioElement') {
            return {
              audioDetails: {
                src: 'https://example.com/audio.mp3',
                volume: 0.8
              }
            };
          }
          if (parameterName === 'textElements.textDetails') {
            return [{
              text: 'Subtitle with video and audio',
              style: '001',
              start: 0,
              duration: 10
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
      const elements = scenes[0].elements;

      expect(elements).toHaveLength(3); // Video + Audio + Text

      const videoElement = elements.find((el: any) => el.type === 'video');
      const audioElement = elements.find((el: any) => el.type === 'audio');
      const textElement = elements.find((el: any) => el.type === 'text');

      expect(videoElement).toBeDefined();
      expect(audioElement).toBeDefined();
      expect(textElement).toBeDefined();
      expect(textElement.text).toBe('Subtitle with video and audio');
    });

    test('should handle text elements with different font weights', () => {
      const mockExecute = {
        getNodeParameter: (parameterName: string, itemIndex: number, fallbackValue?: any) => {
          if (parameterName === 'textElements.textDetails') {
            return [
              { text: 'Light text', fontWeight: '300' },
              { text: 'Regular text', fontWeight: '400' },
              { text: 'Medium text', fontWeight: '500' },
              { text: 'Semi-bold text', fontWeight: '600' },
              { text: 'Bold text', fontWeight: '700' },
              { text: 'Extra bold text', fontWeight: '800' }
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
        'mergeVideoAudio',
        0,
        false
      );

      const scenes = result.scenes as any[];
      const textElements = scenes[0].elements.filter((el: any) => el.type === 'text');

      expect(textElements).toHaveLength(6);
      expect(textElements[0].settings['font-weight']).toBe('300');
      expect(textElements[1].settings['font-weight']).toBe('400');
      expect(textElements[2].settings['font-weight']).toBe('500');
      expect(textElements[3].settings['font-weight']).toBe('600');
      expect(textElements[4].settings['font-weight']).toBe('700');
      expect(textElements[5].settings['font-weight']).toBe('800');
    });

    test('should handle text elements with different alignments', () => {
      const mockExecute = {
        getNodeParameter: (parameterName: string, itemIndex: number, fallbackValue?: any) => {
          if (parameterName === 'textElements.textDetails') {
            return [
              { text: 'Left aligned', textAlign: 'left' },
              { text: 'Center aligned', textAlign: 'center' },
              { text: 'Right aligned', textAlign: 'right' },
              { text: 'Justified', textAlign: 'justify' }
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
        'mergeVideoAudio',
        0,
        false
      );

      const scenes = result.scenes as any[];
      const textElements = scenes[0].elements.filter((el: any) => el.type === 'text');

      expect(textElements).toHaveLength(4);
      expect(textElements[0].settings['text-align']).toBe('left');
      expect(textElements[1].settings['text-align']).toBe('center');
      expect(textElements[2].settings['text-align']).toBe('right');
      expect(textElements[3].settings['text-align']).toBe('justify');
    });

    test('should handle text elements with position presets', () => {
      const mockExecute = {
        getNodeParameter: (parameterName: string, itemIndex: number, fallbackValue?: any) => {
          if (parameterName === 'textElements.textDetails') {
            return [
              { text: 'Top left', position: 'top-left' },
              { text: 'Top right', position: 'top-right' },
              { text: 'Bottom left', position: 'bottom-left' },
              { text: 'Bottom right', position: 'bottom-right' },
              { text: 'Center', position: 'center-center' }
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
        'mergeVideoAudio',
        0,
        false
      );

      const scenes = result.scenes as any[];
      const textElements = scenes[0].elements.filter((el: any) => el.type === 'text');

      expect(textElements).toHaveLength(5);
      expect(textElements[0].position).toBe('top-left');
      expect(textElements[1].position).toBe('top-right');
      expect(textElements[2].position).toBe('bottom-left');
      expect(textElements[3].position).toBe('bottom-right');
      expect(textElements[4].position).toBe('center-center');
    });

    test('should handle text elements with vertical and horizontal positions', () => {
      const mockExecute = {
        getNodeParameter: (parameterName: string, itemIndex: number, fallbackValue?: any) => {
          if (parameterName === 'textElements.textDetails') {
            return [
              {
                text: 'Top center text',
                verticalPosition: 'top',
                horizontalPosition: 'center'
              },
              {
                text: 'Center left text',
                verticalPosition: 'center',
                horizontalPosition: 'left'
              },
              {
                text: 'Bottom right text',
                verticalPosition: 'bottom',
                horizontalPosition: 'right'
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
        'mergeVideoAudio',
        0,
        false
      );

      const scenes = result.scenes as any[];
      const textElements = scenes[0].elements.filter((el: any) => el.type === 'text');

      expect(textElements).toHaveLength(3);
      expect(textElements[0].settings['vertical-position']).toBe('top');
      expect(textElements[0].settings['horizontal-position']).toBe('center');
      expect(textElements[1].settings['vertical-position']).toBe('center');
      expect(textElements[1].settings['horizontal-position']).toBe('left');
      expect(textElements[2].settings['vertical-position']).toBe('bottom');
      expect(textElements[2].settings['horizontal-position']).toBe('right');
    });

    test('should validate multiple text elements with detailed error messages', () => {
      const mockExecute = {
        getNodeParameter: (parameterName: string, itemIndex: number, fallbackValue?: any) => {
          if (parameterName === 'textElements.textDetails') {
            return [
              { text: 'Valid text', style: '001' },
              { text: '', style: '002' }, // Invalid - empty text
              { style: '003' }, // Invalid - missing text
              { text: 'Another valid text', style: '004' }
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
});