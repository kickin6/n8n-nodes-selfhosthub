// __tests__/nodes/CreateJ2vMovie/core/requestBuilder.test.ts

import {
  buildRequest
} from '../../../../nodes/CreateJ2vMovie/core/requestBuilder';
import { CollectedParameters } from '../../../../nodes/CreateJ2vMovie/core/parameterCollector';

// Mock the element processor functions
jest.mock('../../../../nodes/CreateJ2vMovie/core/elementProcessor', () => ({
  processMovieElements: jest.fn((elements) => ({
    processed: elements.map((el: any) => ({ ...el, processed: true })),
    errors: elements.some((el: any) => el.error) ? ['Processing error'] : []
  })),
  processSceneElements: jest.fn((elements) => ({
    processed: elements.map((el: any) => ({ ...el, processed: true })),
    errors: elements.some((el: any) => el.error) ? ['Processing error'] : []
  })),
  processElement: jest.fn((element) => {
    if (element.error) {
      throw new Error('Processing error for test');
    }
    return { ...element, processed: true };
  })
}));

describe('requestBuilder', () => {
  
  describe('buildRequest', () => {
    it.each([
      // createMovie action - basic mode
      ['createMovie basic minimal',
        {
          action: 'createMovie' as const,
          isAdvancedMode: false,
          sceneElements: [{ type: 'text', text: 'Hello World' }]
        },
        {
          request: { scenes: [{ elements: [{ type: 'text', text: 'Hello World', processed: true }] }] },
          errorCount: 0,
          warningCount: 0
        }],
      
      ['createMovie basic with config',
        {
          action: 'createMovie' as const,
          isAdvancedMode: false,
          width: 1920,
          height: 1080,
          fps: 30,
          quality: 'high' as const,
          cache: true,
          movieElements: [{ type: 'subtitles', captions: 'Movie subtitles' }],
          sceneElements: [{ type: 'video', src: 'video.mp4' }]
        },
        {
          request: {
            width: 1920,
            height: 1080,
            fps: 30,
            quality: 'high',
            cache: true,
            elements: [{ type: 'subtitles', captions: 'Movie subtitles', processed: true }],
            scenes: [{ elements: [{ type: 'video', src: 'video.mp4', processed: true }] }]
          },
          errorCount: 0,
          warningCount: 0
        }],
      
      ['createMovie basic no scene elements',
        {
          action: 'createMovie' as const,
          isAdvancedMode: false,
          movieElements: [{ type: 'text', text: 'Movie title' }]
        },
        {
          request: {
            elements: [{ type: 'text', text: 'Movie title', processed: true }],
            scenes: [{ elements: [] }]
          },
          errorCount: 0,
          warningCount: 1
        }],
      
      ['createMovie basic processing errors',
        {
          action: 'createMovie' as const,
          isAdvancedMode: false,
          movieElements: [{ type: 'text', text: 'Valid' }],
          sceneElements: [{ type: 'video', src: 'video.mp4', error: true }]
        },
        {
          request: {
            elements: [{ type: 'text', text: 'Valid', processed: true }],
            scenes: [{ elements: [{ type: 'video', src: 'video.mp4', error: true, processed: true }] }]
          },
          errorCount: 1,
          warningCount: 0
        }],
      
      // createMovie action - advanced mode
      ['createMovie advanced valid template',
        {
          action: 'createMovie' as const,
          isAdvancedMode: true,
          jsonTemplate: '{"scenes":[{"elements":[{"type":"text","text":"Template text"}]}],"width":800}',
          advancedOverrides: { width: 1200, quality: 'medium' as const }
        },
        {
          request: {
            scenes: [{ elements: [{ type: 'text', text: 'Template text' }] }],
            width: 1200,
            quality: 'medium'
          },
          errorCount: 0,
          warningCount: 0
        }],
      
      ['createMovie advanced missing scenes',
        {
          action: 'createMovie' as const,
          isAdvancedMode: true,
          jsonTemplate: '{"width":800,"height":600}'
        },
        {
          request: {
            width: 800,
            height: 600,
            scenes: []
          },
          errorCount: 0,
          warningCount: 1
        }],
      
      // mergeVideoAudio action
      ['mergeVideoAudio basic valid',
        {
          action: 'mergeVideoAudio' as const,
          isAdvancedMode: false,
          mergeVideoAudio: {
            videoElement: { src: 'video.mp4', volume: 1 },
            audioElement: { src: 'audio.mp3', volume: 0.8 },
            outputSettings: { width: 1920, height: 1080, quality: 'high' as const }
          }
        },
        {
          request: {
            width: 1920,
            height: 1080,
            quality: 'high',
            scenes: [{ elements: [
              { type: 'video', src: 'video.mp4', volume: 1, processed: true },
              { type: 'audio', src: 'audio.mp3', volume: 0.8, processed: true }
            ]}]
          },
          errorCount: 0,
          warningCount: 0
        }],
      
      ['mergeVideoAudio basic missing video',
        {
          action: 'mergeVideoAudio' as const,
          isAdvancedMode: false,
          mergeVideoAudio: {
            videoElement: {},
            audioElement: { src: 'audio.mp3' },
            outputSettings: {}
          }
        },
        {
          request: {
            scenes: [{ elements: [{ type: 'audio', src: 'audio.mp3', processed: true }] }]
          },
          errorCount: 0,
          warningCount: 0
        }],
      
      ['mergeVideoAudio advanced',
        {
          action: 'mergeVideoAudio' as const,
          isAdvancedMode: true,
          jsonTemplate: '{"scenes":[{"elements":[{"type":"video","src":"vid.mp4"},{"type":"audio","src":"aud.mp3"}]}]}',
          advancedOverrides: { fps: 25 }
        },
        {
          request: {
            scenes: [{ elements: [{ type: 'video', src: 'vid.mp4' }, { type: 'audio', src: 'aud.mp3' }] }],
            fps: 25
          },
          errorCount: 0,
          warningCount: 0
        }],
      
      // mergeVideos action
      ['mergeVideos basic with transitions',
        {
          action: 'mergeVideos' as const,
          isAdvancedMode: false,
          mergeVideos: {
            videoElements: [
              { src: 'video1.mp4', duration: 10 },
              { src: 'video2.mp4', duration: 8 },
              { src: 'video3.mp4', duration: 12 }
            ],
            transition: 'fade' as const,
            transitionDuration: 2,
            outputSettings: { width: 1280, height: 720 }
          }
        },
        {
          request: {
            width: 1280,
            height: 720,
            scenes: [
              { elements: [{ type: 'video', src: 'video1.mp4', duration: 10, processed: true }] },
              { 
                elements: [{ type: 'video', src: 'video2.mp4', duration: 8, processed: true }],
                transition: { style: 'fade', duration: 2 }
              },
              { 
                elements: [{ type: 'video', src: 'video3.mp4', duration: 12, processed: true }],
                transition: { style: 'fade', duration: 2 }
              }
            ]
          },
          errorCount: 0,
          warningCount: 0
        }],
      
      ['mergeVideos basic no transitions',
        {
          action: 'mergeVideos' as const,
          isAdvancedMode: false,
          mergeVideos: {
            videoElements: [{ src: 'video1.mp4' }, { src: 'video2.mp4' }],
            transition: 'none' as const,
            outputSettings: {}
          }
        },
        {
          request: {
            scenes: [
              { elements: [{ type: 'video', src: 'video1.mp4', processed: true }] },
              { elements: [{ type: 'video', src: 'video2.mp4', processed: true }] }
            ]
          },
          errorCount: 0,
          warningCount: 0
        }],
      
      ['mergeVideos basic single video',
        {
          action: 'mergeVideos' as const,
          isAdvancedMode: false,
          mergeVideos: {
            videoElements: [{ src: 'video1.mp4' }],
            transition: 'fade' as const,
            outputSettings: {}
          }
        },
        {
          request: {
            scenes: [{ elements: [{ type: 'video', src: 'video1.mp4', processed: true }] }]
          },
          errorCount: 0,
          warningCount: 1
        }]
    ])('should build request for %s', (_, parameters, expected) => {
      const result = buildRequest(parameters);
      
      expect(result.request).toMatchObject(expected.request);
      expect(result.errors).toHaveLength(expected.errorCount);
      expect(result.warnings).toHaveLength(expected.warningCount);
    });

    it.each([
      ['missing mergeVideoAudio config',
        { action: 'mergeVideoAudio' as const, isAdvancedMode: false },
        { request: { scenes: [] }, errorCount: 1, warningCount: 1 }],
      
      ['no valid mergeVideoAudio elements',
        {
          action: 'mergeVideoAudio' as const,
          isAdvancedMode: false,
          mergeVideoAudio: { videoElement: {}, audioElement: {}, outputSettings: {} }
        },
        { request: { scenes: [] }, errorCount: 1, warningCount: 1 }],
      
      ['no mergeVideos videos',
        {
          action: 'mergeVideos' as const,
          isAdvancedMode: false,
          mergeVideos: { videoElements: [], transition: 'fade' as const, outputSettings: {} }
        },
        { request: { scenes: [] }, errorCount: 1, warningCount: 1 }],
      
      ['missing mergeVideos config',
        { action: 'mergeVideos' as const, isAdvancedMode: false },
        { request: { scenes: [] }, errorCount: 1, warningCount: 1 }]
    ])('should handle error case: %s', (_, parameters, expected) => {
      const result = buildRequest(parameters);
      
      expect(result.request).toMatchObject(expected.request);
      expect(result.errors).toHaveLength(expected.errorCount);
      expect(result.warnings).toHaveLength(expected.warningCount);
    });

    it.each([
      ['invalid JSON template',
        { action: 'createMovie' as const, isAdvancedMode: true, jsonTemplate: 'invalid json {' },
        null],
      
      ['missing JSON template',
        { action: 'createMovie' as const, isAdvancedMode: true },
        null],
      
      ['unsupported action',
        { action: 'unsupported' as any, isAdvancedMode: false },
        null]
    ])('should return null request for %s', (_, parameters, expectedRequest) => {
      const result = buildRequest(parameters);
      
      expect(result.request).toBe(expectedRequest);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it.each([
      ['complete JSON template with overrides',
        '{"scenes":[{"elements":[{"type":"text","text":"Hello"}]}],"width":800,"height":600,"quality":"medium"}',
        { width: 1920, quality: 'high' as const, height: 1080, fps: 30, resolution: 'full-hd', cache: false },
        {
          scenes: [{ elements: [{ type: 'text', text: 'Hello' }] }],
          width: 1920,
          height: 1080,
          quality: 'high',
          fps: 30,
          resolution: 'full-hd',
          cache: false
        }],
      
      ['minimal JSON template',
        '{"scenes":[]}',
        { fps: 24 },
        { scenes: [], fps: 24 }],
      
      ['complex JSON structure',
        '{"scenes":[{"elements":[{"type":"video","src":"video.mp4","settings":{"volume":0.8}}],"duration":10}],"elements":[{"type":"subtitles","captions":"Test"}]}',
        {},
        {
          scenes: [{ 
            elements: [{ type: 'video', src: 'video.mp4', settings: { volume: 0.8 } }],
            duration: 10
          }],
          elements: [{ type: 'subtitles', captions: 'Test' }]
        }]
    ])('should process advanced mode template: %s', (_, jsonTemplate, overrides, expected) => {
      const parameters: CollectedParameters = {
        action: 'createMovie',
        isAdvancedMode: true,
        jsonTemplate,
        advancedOverrides: overrides
      };
      
      const result = buildRequest(parameters);
      
      expect(result.request).toMatchObject(expected);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle general exception in buildRequest', () => {
      const mockProcessSceneElements = jest.requireMock('../../../../nodes/CreateJ2vMovie/core/elementProcessor').processSceneElements;
      mockProcessSceneElements.mockImplementationOnce(() => {
        throw new Error('Simulated processing error');
      });

      const parameters: CollectedParameters = {
        action: 'createMovie',
        isAdvancedMode: false,
        sceneElements: [{ type: 'text', text: 'Test' }]
      };

      const result = buildRequest(parameters);
      
      expect(result.request).toBeNull();
      expect(result.errors.some(error => error.includes('Failed to build request'))).toBe(true);
    });

    it('should handle non-Error exceptions in main catch block', () => {
      const mockProcessSceneElements = jest.requireMock('../../../../nodes/CreateJ2vMovie/core/elementProcessor').processSceneElements;
      mockProcessSceneElements.mockImplementationOnce(() => {
        throw 'String error'; // Non-Error exception
      });

      const parameters: CollectedParameters = {
        action: 'createMovie',
        isAdvancedMode: false,
        sceneElements: [{ type: 'text', text: 'Test' }]
      };

      const result = buildRequest(parameters);
      
      expect(result.request).toBeNull();
      expect(result.errors).toContain('Failed to build request: Unknown request building error');
    });

    it('should handle non-Error parseError in JSON parsing', () => {
      const originalParse = JSON.parse;
      JSON.parse = jest.fn().mockImplementationOnce(() => {
        throw 'Parse error string'; // Non-Error exception
      });

      const parameters: CollectedParameters = {
        action: 'createMovie',
        isAdvancedMode: true,
        jsonTemplate: '{"scenes":[]}'
      };

      const result = buildRequest(parameters);
      
      JSON.parse = originalParse;
      
      expect(result.request).toBeNull();
      expect(result.errors).toContain('Invalid JSON template: Parse error');
    });

    it('should handle non-Error exception in advanced mode processing', () => {
      const problematicOverrides = {};
      
      Object.defineProperty(problematicOverrides, 'width', {
        get() {
          throw 'Property access string error'; // Non-Error exception
        }
      });

      const parameters: CollectedParameters = {
        action: 'createMovie',
        isAdvancedMode: true,
        jsonTemplate: '{"scenes":[]}',
        advancedOverrides: problematicOverrides
      };

      const result = buildRequest(parameters);
      
      expect(result.request).toBeNull();
      expect(result.errors).toContain('Advanced mode processing failed: Unknown error');
    });

    it('should handle mergeVideoAudio outputSettings branches', () => {
      const parameters: CollectedParameters = {
        action: 'mergeVideoAudio',
        isAdvancedMode: false,
        mergeVideoAudio: {
          videoElement: { src: 'video.mp4' },
          audioElement: { src: 'audio.mp3' },
          outputSettings: {
            width: 1920,
            height: 1080,
            fps: 30,
            quality: 'high' as const
          }
        }
      };

      const result = buildRequest(parameters);
      
      expect(result.request).toMatchObject({
        width: 1920,
        height: 1080,
        fps: 30,
        quality: 'high'
      });
    });

    it('should handle mergeVideos outputSettings branches', () => {
      const parameters: CollectedParameters = {
        action: 'mergeVideos',
        isAdvancedMode: false,
        mergeVideos: {
          videoElements: [{ src: 'video1.mp4' }, { src: 'video2.mp4' }],
          transition: 'fade',
          outputSettings: {
            width: 1280,
            height: 720,
            fps: 25,
            quality: 'medium' as const
          }
        }
      };

      const result = buildRequest(parameters);
      
      expect(result.request).toMatchObject({
        width: 1280,
        height: 720,
        fps: 25,
        quality: 'medium'
      });
    });

    it('should handle mergeVideos with transition duration defaulting', () => {
      const parameters: CollectedParameters = {
        action: 'mergeVideos',
        isAdvancedMode: false,
        mergeVideos: {
          videoElements: [{ src: 'video1.mp4' }, { src: 'video2.mp4' }],
          transition: 'fade',
          // No transitionDuration specified
          outputSettings: {}
        }
      };

      const result = buildRequest(parameters);
      
      expect(result.request?.scenes[1].transition).toEqual({
        style: 'fade',
        duration: 1 // Default value
      });
    });

    it('should handle non-Error exception in mergeVideos processing', () => {
      const mockProcessElement = jest.requireMock('../../../../nodes/CreateJ2vMovie/core/elementProcessor').processElement;
      
      mockProcessElement.mockImplementationOnce(() => {
        throw 'String processing error'; // Non-Error exception
      });
      
      const parameters: CollectedParameters = {
        action: 'mergeVideos',
        isAdvancedMode: false,
        mergeVideos: {
          videoElements: [{ src: 'video1.mp4' }],
          transition: 'fade',
          outputSettings: {}
        }
      };
      
      const result = buildRequest(parameters);
      
      expect(result.request?.scenes).toHaveLength(0);
      expect(result.errors).toContain('Video 1 processing failed: Unknown processing error');
      expect(result.errors).toContain('No valid video elements found for mergeVideos');
    });

    it('should handle advanced mode processing exception', () => {
      // Create a scenario where applyAdvancedOverrides throws an error
      const problematicOverrides = {};
      
      // Define a getter that throws an error when accessed
      Object.defineProperty(problematicOverrides, 'width', {
        get() {
          throw new Error('Property access error');
        }
      });

      const parameters: CollectedParameters = {
        action: 'createMovie',
        isAdvancedMode: true,
        jsonTemplate: '{"scenes":[]}',
        advancedOverrides: problematicOverrides
      };

      const result = buildRequest(parameters);
      
      expect(result.request).toBeNull();
      expect(result.errors.some(error => error.includes('Advanced mode processing failed'))).toBe(true);
      expect(result.errors.some(error => error.includes('Property access error'))).toBe(true);
    });

    it('should handle mergeVideoAudio processing errors', () => {
      const mockProcessSceneElements = jest.requireMock('../../../../nodes/CreateJ2vMovie/core/elementProcessor').processSceneElements;
      mockProcessSceneElements.mockReturnValueOnce({
        processed: [],
        errors: ['Element processing failed']
      });

      const parameters: CollectedParameters = {
        action: 'mergeVideoAudio',
        isAdvancedMode: false,
        mergeVideoAudio: {
          videoElement: { src: 'video.mp4' },
          audioElement: { src: 'audio.mp3' },
          outputSettings: {}
        }
      };

      const result = buildRequest(parameters);
      
      expect(result.errors).toContain('Element processing failed');
      expect(result.request?.scenes).toHaveLength(1);
    });

    it('should handle mergeVideos processing error', () => {
      const mockProcessElement = jest.requireMock('../../../../nodes/CreateJ2vMovie/core/elementProcessor').processElement;
      
      mockProcessElement
        .mockReturnValueOnce({ type: 'video', src: 'video1.mp4', processed: true })
        .mockImplementationOnce(() => {
          throw new Error('Processing failed for video 2');
        });
      
      const parameters: CollectedParameters = {
        action: 'mergeVideos',
        isAdvancedMode: false,
        mergeVideos: {
          videoElements: [{ src: 'video1.mp4' }, { src: 'video2.mp4' }],
          transition: 'fade',
          outputSettings: {}
        }
      };
      
      const result = buildRequest(parameters);
      
      expect(result.request?.scenes).toHaveLength(1);
      expect(result.errors).toContain('Video 2 processing failed: Processing failed for video 2');
      expect(result.warnings).toHaveLength(1);
    });

    it.each([
      ['with record ID', { recordId: 'test-123' }, { id: 'test-123' }],
      ['without record ID', {}, {}],
      ['with webhook URL', { webhookUrl: 'https://webhook.example.com' }, {}]
    ])('should apply common properties %s', (_, parameters, expected) => {
      const fullParameters: CollectedParameters = {
        action: 'createMovie',
        isAdvancedMode: false,
        sceneElements: [{ type: 'text', text: 'Test' }],
        ...parameters
      };
      
      const result = buildRequest(fullParameters);
      
      if (Object.keys(expected).length > 0) {
        expect(result.request).toMatchObject(expected);
      }
      expect(result.request).not.toHaveProperty('webhookUrl');
    });

    it.each([
      ['element processing errors',
        { action: 'createMovie' as const, isAdvancedMode: false, movieElements: [{ type: 'text', text: 'Test' }], sceneElements: [] },
        { processed: [], errors: ['Movie element processing failed'] },
        'Movie element processing failed'],
      
      ['mixed processing results',
        { action: 'createMovie' as const, isAdvancedMode: false, movieElements: [{ type: 'audio', src: 'bg.mp3' }], sceneElements: [{ type: 'text', text: 'Hello' }] },
        { processed: [{ type: 'audio', src: 'bg.mp3', processed: true }], errors: ['Some movie element failed'] },
        'Some movie element failed']
    ])('should handle %s gracefully', (_, parameters, mockReturn, expectedError) => {
      const mockProcessMovieElements = jest.requireMock('../../../../nodes/CreateJ2vMovie/core/elementProcessor').processMovieElements;
      mockProcessMovieElements.mockReturnValueOnce(mockReturn);
      
      const result = buildRequest(parameters);
      
      expect(result.errors).toContain(expectedError);
    });

    it('should preserve element processing results', () => {
      const parameters: CollectedParameters = {
        action: 'createMovie',
        isAdvancedMode: false,
        movieElements: [{ type: 'subtitles', captions: 'Test subtitles' }],
        sceneElements: [{ type: 'video', src: 'video.mp4' }]
      };
      
      const result = buildRequest(parameters);
      
      expect(result.request?.elements).toEqual([
        { type: 'subtitles', captions: 'Test subtitles', processed: true }
      ]);
      expect(result.request?.scenes[0].elements).toEqual([
        { type: 'video', src: 'video.mp4', processed: true }
      ]);
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });
});