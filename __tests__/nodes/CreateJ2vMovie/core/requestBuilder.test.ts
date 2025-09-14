// __tests__/nodes/CreateJ2vMovie/core/requestBuilder.test.ts

import { buildRequest, RequestBuildResult } from '../../../../nodes/CreateJ2vMovie/core/requestBuilder';
import { CollectedParameters } from '../../../../nodes/CreateJ2vMovie/core/parameterCollector';

describe('core/requestBuilder', () => {
  
  function createBaseParameters(overrides: Partial<CollectedParameters> = {}): CollectedParameters {
    return {
      action: 'createMovie',
      isAdvancedMode: false,
      movieElements: [],
      sceneElements: [],
      ...overrides
    };
  }

  describe('buildRequest', () => {
    
    describe('basic request building', () => {
      it.each([
        [
          'createMovie with config',
          {
            action: 'createMovie' as const,
            movieElements: [{ type: 'subtitles', captions: 'Movie subtitles' }],
            sceneElements: [{ type: 'video', src: 'video.mp4' }],
            operationSettings: {
              outputSettings: { width: 1920, height: 1080, quality: 'high', cache: true }
            }
          },
          {
            width: 1920,
            height: 1080,
            quality: 'high',
            cache: true,
            elements: [{ type: 'subtitles', captions: 'Movie subtitles' }],
            scenes: [{ elements: [{ type: 'video', src: 'video.mp4' }] }]
          }
        ],
        [
          'createMovie with only scene elements',
          {
            action: 'createMovie' as const,
            sceneElements: [{ type: 'text', text: 'Hello World' }]
          },
          {
            scenes: [{ elements: [{ type: 'text', text: 'Hello World' }] }]
          }
        ],
        [
          'mergeVideoAudio basic valid',
          {
            action: 'mergeVideoAudio' as const,
            sceneElements: [
              { type: 'video', src: 'video.mp4', volume: 1 },
              { type: 'audio', src: 'audio.mp3', volume: 0.8 }
            ],
            operationSettings: {
              outputSettings: { width: 1920, height: 1080, quality: 'high' }
            }
          },
          {
            width: 1920,
            height: 1080,
            quality: 'high',
            scenes: [{
              elements: [
                { type: 'video', src: 'video.mp4', volume: 1 },
                { type: 'audio', src: 'audio.mp3', volume: 0.8 }
              ]
            }]
          }
        ],
        [
          'mergeVideoAudio missing video',
          {
            action: 'mergeVideoAudio' as const,
            sceneElements: [{ type: 'audio', src: 'audio.mp3' }]
          },
          {
            scenes: [{ elements: [{ type: 'audio', src: 'audio.mp3' }] }]
          }
        ]
      ])('should build request for %s', (_, params, expectedRequest) => {
        const parameters = createBaseParameters(params);
        const result = buildRequest(parameters);

        expect(result.request).toMatchObject(expectedRequest);
        expect(result.errors).toHaveLength(0);
        expect(result.warnings).toHaveLength(0);
      });
    });

    describe('mergeVideos operation', () => {
      it.each([
        [
          'basic with transitions using 3 videos',
          {
            action: 'mergeVideos' as const,
            sceneElements: [
              { type: 'video', src: 'video1.mp4', duration: 10 },
              { type: 'video', src: 'video2.mp4', duration: 8 },
              { type: 'video', src: 'video3.mp4', duration: 12 }
            ],
            operationSettings: {
              transition: 'fade',
              transitionDuration: 2,
              outputSettings: { width: 1280, height: 720 }
            }
          },
          {
            width: 1280,
            height: 720,
            scenes: [
              { elements: [{ type: 'video', src: 'video1.mp4', duration: 10 }] },
              { 
                elements: [{ type: 'video', src: 'video2.mp4', duration: 8 }],
                transition: { style: 'fade', duration: 2 }
              },
              { elements: [{ type: 'video', src: 'video3.mp4', duration: 12 }] }
            ]
          },
          []
        ],
        [
          'no transitions',
          {
            action: 'mergeVideos' as const,
            sceneElements: [
              { type: 'video', src: 'video1.mp4' },
              { type: 'video', src: 'video2.mp4' }
            ]
          },
          {
            scenes: [
              { elements: [{ type: 'video', src: 'video1.mp4' }] },
              { elements: [{ type: 'video', src: 'video2.mp4' }] }
            ]
          },
          []
        ],
        [
          'single video with warning',
          {
            action: 'mergeVideos' as const,
            sceneElements: [{ type: 'video', src: 'video1.mp4' }]
          },
          {
            scenes: [{ elements: [{ type: 'video', src: 'video1.mp4' }] }]
          },
          ['mergeVideos with single video - consider using mergeVideoAudio for audio overlay']
        ],
        [
          'with sceneIndex grouping',
          {
            action: 'mergeVideos' as const,
            sceneElements: [
              { type: 'video', src: 'video1.mp4', sceneIndex: 0 },
              { type: 'video', src: 'video2.mp4', sceneIndex: 0 },
              { type: 'video', src: 'video3.mp4', sceneIndex: 1 }
            ],
            operationSettings: { transition: 'fade', transitionDuration: 2 }
          },
          {
            scenes: [
              { 
                elements: [
                  { type: 'video', src: 'video1.mp4', 'scene-index': 0 },
                  { type: 'video', src: 'video2.mp4', 'scene-index': 0 }
                ],
                transition: { style: 'fade', duration: 2 }
              },
              { elements: [{ type: 'video', src: 'video3.mp4', 'scene-index': 1 }] }
            ]
          },
          []
        ]
      ])('should build request for mergeVideos %s', (_, params, expectedRequest, expectedWarnings) => {
        const parameters = createBaseParameters(params);
        const result = buildRequest(parameters);

        expect(result.request).toMatchObject(expectedRequest);
        expect(result.warnings).toEqual(expectedWarnings);
      });

      it('should handle transition duration defaulting', () => {
        const parameters = createBaseParameters({
          action: 'mergeVideos',
          sceneElements: [
            { type: 'video', src: 'video1.mp4' },
            { type: 'video', src: 'video2.mp4' },
            { type: 'video', src: 'video3.mp4' }
          ],
          operationSettings: { transition: 'fade' }
        });

        const result = buildRequest(parameters);

        expect(result.request?.scenes[1].transition).toEqual({
          style: 'fade',
          duration: 1
        });
        expect(result.request?.scenes[2].transition).toBeUndefined();
      });

      it('should handle transition none setting', () => {
        const parameters = createBaseParameters({
          action: 'mergeVideos',
          sceneElements: [
            { type: 'video', src: 'video1.mp4' },
            { type: 'video', src: 'video2.mp4' }
          ],
          operationSettings: { transition: 'none' }
        });

        const result = buildRequest(parameters);

        expect(result.request?.scenes[0].transition).toBeUndefined();
        expect(result.request?.scenes[1].transition).toBeUndefined();
      });

      it('should handle sceneIndex grouping with gaps', () => {
        const parameters = createBaseParameters({
          action: 'mergeVideos',
          sceneElements: [
            { type: 'video', src: 'video1.mp4', sceneIndex: 0 },
            { type: 'video', src: 'video2.mp4', sceneIndex: 2 }
          ]
        });

        const result = buildRequest(parameters);

        expect(result.request?.scenes).toHaveLength(2);
        expect(result.request?.scenes[0].elements).toEqual([
          { type: 'video', src: 'video1.mp4', 'scene-index': 0 }
        ]);
        expect(result.request?.scenes[1].elements).toEqual([
          { type: 'video', src: 'video2.mp4', 'scene-index': 2 }
        ]);
      });
    });

    describe('error cases', () => {
      it.each([
        [
          'mergeVideoAudio empty elements',
          { action: 'mergeVideoAudio' as const, sceneElements: [] },
          { scenes: [{ elements: [] }] },
          ['No valid video or audio elements found for mergeVideoAudio'],
          ['No scenes created for mergeVideoAudio operation']
        ],
        [
          'mergeVideos empty elements',
          { action: 'mergeVideos' as const, sceneElements: [] },
          { scenes: [{ elements: [] }] },
          ['No video elements found for mergeVideos'],
          ['No scenes created for mergeVideos operation']
        ],
        [
          'unsupported action',
          { action: 'unsupportedAction' as any },
          { scenes: [] },
          ['Unsupported operation: unsupportedAction'],
          ['Request has no scenes - video will be empty']
        ],
        [
          'createMovie no elements',
          { action: 'createMovie' as const, movieElements: [], sceneElements: [] },
          { scenes: [{ elements: [] }] },
          [],
          ['No elements provided, creating empty scene']
        ],
        [
          'createMovie only movie elements',
          { 
            action: 'createMovie' as const,
            movieElements: [{ type: 'audio', src: 'background.mp3' }],
            sceneElements: []
          },
          {
            elements: [{ type: 'audio', src: 'background.mp3' }],
            scenes: [{ elements: [] }]
          },
          [],
          ['No scene elements provided, creating empty scene with movie elements']
        ]
      ])('should handle %s', (_, params, expectedRequest, expectedErrors, expectedWarnings) => {
        const parameters = createBaseParameters(params);
        const result = buildRequest(parameters);

        expect(result.request).toMatchObject(expectedRequest);
        expect(result.errors).toEqual(expectedErrors);
        expect(result.warnings).toEqual(expectedWarnings);
      });
    });

    describe('advanced mode', () => {
      it.each([
        [
          'valid JSON template',
          {
            action: 'createMovie' as const,
            isAdvancedMode: true,
            jsonTemplate: JSON.stringify({
              width: 1024,
              height: 768,
              scenes: [{ elements: [{ type: 'text', text: 'Advanced mode text' }] }]
            })
          },
          {
            width: 1024,
            height: 768,
            scenes: [{ elements: [{ type: 'text', text: 'Advanced mode text' }] }]
          },
          [],
          []
        ],
        [
          'JSON template with overrides',
          {
            action: 'createMovie' as const,
            isAdvancedMode: true,
            jsonTemplate: JSON.stringify({ width: 1024, height: 768, scenes: [] }),
            advancedOverrides: { width: 1920, quality: 'ultra' }
          },
          {
            width: 1920,
            height: 768,
            quality: 'ultra',
            scenes: []
          },
          [],
          ['Request has no scenes - video will be empty']
        ],
        [
          'all override properties',
          {
            action: 'createMovie' as const,
            isAdvancedMode: true,
            jsonTemplate: JSON.stringify({ scenes: [] }),
            advancedOverrides: {
              width: 1920,
              height: 1080,
              quality: 'high',
              resolution: 'full-hd',
              cache: false
            }
          },
          {
            width: 1920,
            height: 1080,
            quality: 'high',
            resolution: 'full-hd',
            cache: false,
            scenes: []
          },
          [],
          ['Request has no scenes - video will be empty']
        ]
      ])('should handle %s', (_, params, expectedRequest, expectedErrors, expectedWarnings) => {
        const parameters = createBaseParameters(params);
        const result = buildRequest(parameters);

        expect(result.request).toMatchObject(expectedRequest);
        expect(result.errors).toEqual(expectedErrors);
        expect(result.warnings).toEqual(expectedWarnings);
      });

      it.each([
        [
          'missing JSON template',
          { isAdvancedMode: true, jsonTemplate: '' },
          ['Advanced mode requires a JSON template']
        ],
        [
          'whitespace only JSON template',
          { isAdvancedMode: true, jsonTemplate: '   \n\t  ' },
          ['Advanced mode requires a JSON template']
        ],
        [
          'invalid JSON template',
          { isAdvancedMode: true, jsonTemplate: '{ invalid json' },
          ['Invalid JSON template']
        ]
      ])('should handle advanced mode error: %s', (_, params, expectedErrorSubstrings) => {
        const parameters = createBaseParameters(params);
        const result = buildRequest(parameters);

        expect(result.request).toBeNull();
        expectedErrorSubstrings.forEach(errorSubstring => {
          expect(result.errors.some(error => error.includes(errorSubstring))).toBe(true);
        });
      });

      it.each([
        ['Error object', () => { throw new Error('Explicit JSON parse error'); }, 'Invalid JSON template: Explicit JSON parse error'],
        ['non-Error exception', () => { throw 'String error'; }, 'Invalid JSON template: Parse error']
      ])('should handle JSON parsing with %s', (_, mockFn, expectedError) => {
        jest.spyOn(JSON, 'parse').mockImplementationOnce(mockFn);

        const parameters = createBaseParameters({
          isAdvancedMode: true,
          jsonTemplate: '{"scenes": []}'
        });

        const result = buildRequest(parameters);

        expect(result.request).toBeNull();
        expect(result.errors).toContain(expectedError);

        jest.restoreAllMocks();
      });

      it('should handle missing scenes property in JSON template', () => {
        const parameters = createBaseParameters({
          action: 'createMovie',
          isAdvancedMode: true,
          jsonTemplate: JSON.stringify({ width: 800 })
        });

        const result = buildRequest(parameters);

        expect(result.request).toMatchObject({
          width: 800,
          scenes: []
        });
        expect(result.warnings).toContain('Request has no scenes - video will be empty');
      });

      it.each([
        ['Error object', () => { throw new Error('Proxy access error'); }, 'Advanced mode processing failed: Proxy access error'],
        ['non-Error exception', () => { throw 'String error'; }, 'Advanced mode processing failed: Unknown error']
      ])('should handle advanced mode processing exception with %s', (_, proxyFn, expectedError) => {
        const mockOverrides = new Proxy({}, { get: proxyFn });

        const parameters = createBaseParameters({
          action: 'createMovie',
          isAdvancedMode: true,
          jsonTemplate: JSON.stringify({ scenes: [] }),
          advancedOverrides: mockOverrides as any
        });

        const result = buildRequest(parameters);

        expect(result.request).toBeNull();
        expect(result.errors).toContain(expectedError);
      });
    });

    describe('common properties', () => {
      it('should apply record ID', () => {
        const parameters = createBaseParameters({
          action: 'createMovie',
          sceneElements: [{ type: 'text', text: 'test' }],
          recordId: 'test-123'
        });

        const result = buildRequest(parameters);

        expect(result.request?.comment).toBe('RecordID: test-123');
      });

      it('should apply export configurations', () => {
        const exportConfigs = [
          { format: 'mp4' as const, webhook: { url: 'https://example.com/webhook' } },
          { format: 'gif' as const, email: { to: 'user@example.com' } },
          { format: 'webm' as const, ftp: { host: 'ftp.example.com', username: 'user', password: 'pass' } }
        ] as any[];
        
        const parameters = createBaseParameters({
          action: 'createMovie',
          sceneElements: [{ type: 'text', text: 'test' }],
          exportConfigs
        });

        const result = buildRequest(parameters);

        expect(result.request?.exports).toEqual(exportConfigs);
      });

      it.each([
        ['existing comment with record ID', { recordId: 'test-123' }, 'Existing comment | RecordID: test-123']
      ])('should handle %s', (_, params, expectedComment) => {
        const parameters = createBaseParameters({
          action: 'createMovie',
          isAdvancedMode: true,
          jsonTemplate: JSON.stringify({
            comment: 'Existing comment',
            scenes: [{ elements: [{ type: 'text', text: 'test' }] }]
          }),
          ...params
        });

        const result = buildRequest(parameters);

        expect(result.request?.comment).toBe(expectedComment);
      });
    });

    describe('output settings handling', () => {
      it.each([
        ['undefined operation settings', { operationSettings: undefined }],
        ['undefined output settings', { operationSettings: {} }],
        ['undefined individual output settings', { operationSettings: { outputSettings: { width: undefined, height: undefined, quality: undefined } } }]
      ])('should handle %s', (_, params) => {
        const parameters = createBaseParameters({
          action: 'mergeVideoAudio',
          sceneElements: [{ type: 'video', src: 'video.mp4' }],
          ...params
        });

        const result = buildRequest(parameters);

        expect(result.request).not.toHaveProperty('width');
        expect(result.request).not.toHaveProperty('height');
        expect(result.request).not.toHaveProperty('quality');
      });

      it('should handle partial output settings', () => {
        const parameters = createBaseParameters({
          action: 'mergeVideoAudio',
          sceneElements: [{ type: 'video', src: 'video.mp4' }],
          operationSettings: {
            outputSettings: { width: 1920, quality: 'high' }
          }
        });

        const result = buildRequest(parameters);

        expect(result.request).toHaveProperty('width', 1920);
        expect(result.request).toHaveProperty('quality', 'high');
      });

      it('should handle draft property in output settings', () => {
        const parameters = createBaseParameters({
          action: 'createMovie',
          sceneElements: [{ type: 'text', text: 'test' }],
          operationSettings: {
            outputSettings: {
              width: 1920,
              height: 1080,
              draft: true,
              resolution: 'full-hd'
            }
          }
        });

        const result = buildRequest(parameters);

        expect(result.request).toMatchObject({
          width: 1920,
          height: 1080,
          resolution: 'full-hd'
        });
        expect(result.request).not.toHaveProperty('draft');
      });

      it('should handle all advanced override branches', () => {
        const parameters = createBaseParameters({
          action: 'createMovie',
          isAdvancedMode: true,
          jsonTemplate: JSON.stringify({ scenes: [] }),
          advancedOverrides: {
            width: 1920,
            height: 1080,
            quality: 'high',
            resolution: 'full-hd',
            cache: false
          }
        });

        const result = buildRequest(parameters);

        expect(result.request).toMatchObject({
          width: 1920,
          height: 1080,
          quality: 'high',
          resolution: 'full-hd',
          cache: false,
          scenes: []
        });
      });

      it('should handle advanced mode with undefined override values', () => {
        const parameters = createBaseParameters({
          action: 'createMovie',
          isAdvancedMode: true,
          jsonTemplate: JSON.stringify({ 
            width: 800,
            height: 600,
            quality: 'low',
            resolution: 'sd',
            cache: true,
            scenes: []
          }),
          advancedOverrides: {
            width: undefined,
            height: undefined,
            quality: undefined,
            resolution: undefined,
            cache: undefined
          }
        });

        const result = buildRequest(parameters);

        expect(result.request).toMatchObject({
          width: 800,
          height: 600,
          quality: 'low',
          resolution: 'sd',
          cache: true,
          scenes: []
        });
      });
    });

    describe('element processing error handling', () => {
      it.each([
        ['movie elements', { movieElements: [null] as any, sceneElements: [{ type: 'text', text: 'test' }] }],
        ['scene elements in createMovie', { sceneElements: [null] as any }],
        ['scene elements in mergeVideoAudio', { action: 'mergeVideoAudio' as const, sceneElements: [null] as any }]
      ])('should handle %s processing errors', (_, params) => {
        const parameters = createBaseParameters({
          action: 'createMovie',
          ...params
        });

        const result = buildRequest(parameters);

        expect(result.errors.length).toBeGreaterThan(0);
        expect(result.errors.some(error => error.includes('Element 0:'))).toBe(true);
        expect(result.request).toBeDefined();
      });

      it('should handle scene element processing errors in mergeVideos', () => {
        const parameters = createBaseParameters({
          action: 'mergeVideos',
          sceneElements: [
            { invalid: 'element1' },
            { invalid: 'element2' }
          ] as any
        });

        const result = buildRequest(parameters);

        expect(result.errors.length).toBeGreaterThan(0);
        expect(result.errors.some(error => error.includes('Scene 1:'))).toBe(true);
        expect(result.errors.some(error => error.includes('Scene 2:'))).toBe(true);
        expect(result.request).toBeDefined();
      });

      it.each([
        ['movie elements', { movieElements: 'not an array' as any, sceneElements: [{ type: 'text', text: 'test' }] }],
        ['scene elements', { sceneElements: 'not an array' as any }]
      ])('should handle non-array elements input for %s', (_, params) => {
        const parameters = createBaseParameters({
          action: 'createMovie',
          ...params
        });

        const result = buildRequest(parameters);

        expect(result.errors).toContain('Elements must be an array');
        expect(result.request).toBeDefined();
      });
    });

    describe('exception handling', () => {
      it.each([
        ['Error object', () => { throw new Error('Property access error'); }, 'Request building failed: Property access error'],
        ['non-Error exception', () => { throw 'String error'; }, 'Request building failed: Unknown error']
      ])('should handle main buildRequest exception with %s', (_, throwFn, expectedError) => {
        const parameters = createBaseParameters({
          action: 'createMovie',
          sceneElements: [{ type: 'text', text: 'test' }]
        });

        Object.defineProperty(parameters, 'movieElements', { get: throwFn });

        const result = buildRequest(parameters);

        expect(result.request).toBeNull();
        expect(result.errors).toContain(expectedError);
      });
    });
  });
});