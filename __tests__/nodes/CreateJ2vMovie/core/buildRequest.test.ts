// __tests__/nodes/CreateJ2vMovie/core/buildRequest.test.ts

import { buildRequest, RequestBuildResult, isEmptyRequest } from '../../../../nodes/CreateJ2vMovie/core/buildRequest';
import { CollectedParameters } from '../../../../nodes/CreateJ2vMovie/core/collector';

describe('buildRequest', () => {
  
  /**
   * Creates base test parameters with optional overrides
   */
  function createBaseParameters(overrides: Partial<CollectedParameters> = {}): CollectedParameters {
    return {
      isAdvancedMode: false,
      elements: [],
      ...overrides
    };
  }

  describe('buildRequest', () => {
    
    describe('basic request building', () => {
      it.each([
        [
          'request with subtitles and elements',
          {
            subtitles: { type: 'subtitles', captions: 'Movie subtitles' },
            elements: [{ type: 'video', src: 'video.mp4' }],
            outputSettings: { width: 1920, height: 1080, quality: 'high', cache: true }
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
          'request with only elements',
          {
            elements: [{ type: 'text', text: 'Hello World' }]
          },
          {
            width: 1920,
            height: 1080,
            quality: 'high',
            scenes: [{ elements: [{ type: 'text', text: 'Hello World' }] }]
          }
        ],
        [
          'request with video and audio',
          {
            elements: [
              { type: 'video', src: 'video.mp4', volume: 1 },
              { type: 'audio', src: 'audio.mp3', volume: 0.8 }
            ],
            outputSettings: { width: 1920, height: 1080, quality: 'high' }
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
          'request with single audio',
          {
            elements: [{ type: 'audio', src: 'audio.mp3' }],
            outputSettings: { width: 800, height: 600 }
          },
          {
            width: 800,
            height: 600,
            scenes: [{ elements: [{ type: 'audio', src: 'audio.mp3' }] }]
          }
        ]
      ])('should build request for %s', (_, params, expectedRequest) => {
        const parameters = createBaseParameters(params);
        const result = buildRequest(parameters);

        expect(result.request).toMatchObject(expectedRequest);
        expect(result.errors).toHaveLength(0);
      });
    });

    describe('single scene with all elements', () => {
      it('should keep all elements in single scene', () => {
        const parameters = createBaseParameters({
          elements: [
            { type: 'video', src: 'video1.mp4' },
            { type: 'video', src: 'video2.mp4' },
            { type: 'audio', src: 'background.mp3' }
          ]
        });

        const result = buildRequest(parameters);

        // All elements stay in a single scene
        expect(result.request?.scenes).toHaveLength(1);
        expect(result.request?.scenes[0].elements).toEqual([
          { type: 'video', src: 'video1.mp4' },
          { type: 'video', src: 'video2.mp4' },
          { type: 'audio', src: 'background.mp3' }
        ]);
      });
    });

    describe('warning cases', () => {
      it.each([
        [
          'no elements and no subtitles',
          { elements: [] },
          [],
          ['No elements or subtitles provided - video will be empty']
        ],
        [
          'no elements but has subtitles',
          {
            elements: [],
            subtitles: { type: 'subtitles', captions: 'test' }
          },
          [],
          ['No scene elements provided - only subtitles will appear']
        ]
      ])('should handle %s', (_, params, expectedErrors, expectedWarnings) => {
        const parameters = createBaseParameters(params);
        const result = buildRequest(parameters);

        expect(result.errors).toEqual(expectedErrors);
        expect(result.warnings).toEqual(expectedWarnings);
        expect(result.request).toBeDefined();
      });

      it('should handle element with missing type', () => {
        const parameters = createBaseParameters({
          elements: [{ src: 'test.mp4' }] as any
        });

        const result = buildRequest(parameters);

        expect(result.errors).toContain('Element 1: missing type');
      });

      it('should handle element processing error with unknown error type', () => {
        const parameters = createBaseParameters({
          elements: [null] as any
        });

        const result = buildRequest(parameters);

        expect(result.errors.some(error => error.includes('Element 1: Unknown error'))).toBe(true);
      });
    });

    describe('advanced mode', () => {
      it.each([
        [
          'valid JSON template',
          {
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
          'JSON template with missing scenes gets empty array',
          {
            isAdvancedMode: true,
            jsonTemplate: JSON.stringify({ width: 800, height: 600 })
          },
          {
            width: 800,
            height: 600,
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
          'null JSON template',
          { isAdvancedMode: true, jsonTemplate: null as any },
          ['Advanced mode requires a JSON template']
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
        ['Error object', () => { throw new Error('Explicit JSON parse error'); }, 'Invalid JSON template: Parse error'],
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

      it.each([
        ['Error object', () => { throw new Error('Advanced processing error'); }, 'Advanced mode processing failed: Unknown error'],
        ['non-Error exception', () => { throw 'String error'; }, 'Advanced mode processing failed: Unknown error']
      ])('should handle advanced mode processing exception with %s', (_, throwFn, expectedError) => {
        const parameters = createBaseParameters({
          isAdvancedMode: true,
          jsonTemplate: '{"scenes": []}'
        });

        // Create a faulty jsonTemplate string that will cause an exception during trim()
        const faultyTemplate = new String('{"scenes": []}');
        faultyTemplate.trim = throwFn;
        parameters.jsonTemplate = faultyTemplate as any;

        const result = buildRequest(parameters);

        expect(result.request).toBeNull();
        expect(result.errors).toContain(expectedError);
      });
    });

    describe('common properties', () => {
      it('should apply record ID as comment', () => {
        const parameters = createBaseParameters({
          elements: [{ type: 'text', text: 'test' }],
          recordId: 'test-123'
        });

        const result = buildRequest(parameters);

        expect(result.request?.comment).toBe('RecordID: test-123');
        expect(result.request?.id).toBe('test-123');
      });

      it('should apply export configurations', () => {
        const exportConfigs = [
          { destinations: [{ type: 'webhook', endpoint: 'https://example.com/webhook' }] },
          { destinations: [{ type: 'email', to: 'user@example.com' }] }
        ] as any[];
        
        const parameters = createBaseParameters({
          elements: [{ type: 'text', text: 'test' }],
          exportConfigs
        });

        const result = buildRequest(parameters);

        expect(result.request?.exports).toEqual(exportConfigs);
      });

      it('should handle existing comment with record ID', () => {
        const parameters = createBaseParameters({
          isAdvancedMode: true,
          jsonTemplate: JSON.stringify({
            comment: 'Existing comment',
            scenes: [{ elements: [{ type: 'text', text: 'test' }] }]
          }),
          recordId: 'test-123'
        });

        const result = buildRequest(parameters);

        expect(result.request?.comment).toBe('Existing comment | RecordID: test-123');
      });

      it('should auto-generate ID when no record ID provided', () => {
        const parameters = createBaseParameters({
          elements: [{ type: 'text', text: 'test' }]
        });

        const result = buildRequest(parameters);

        expect(result.request?.id).toMatch(/^n8n-\d+$/);
      });
    });

    describe('output settings handling', () => {
      it('should handle undefined output settings with defaults', () => {
        const parameters = createBaseParameters({
          elements: [{ type: 'video', src: 'video.mp4' }]
        });

        const result = buildRequest(parameters);

        // Default values when no output settings
        expect(result.request?.width).toBe(1920);
        expect(result.request?.height).toBe(1080);
        expect(result.request?.quality).toBe('high');
      });

      it('should handle partial output settings', () => {
        const parameters = createBaseParameters({
          elements: [{ type: 'video', src: 'video.mp4' }],
          outputSettings: { width: 1920, quality: 'high' }
        });

        const result = buildRequest(parameters);

        expect(result.request?.width).toBe(1920);
        expect(result.request?.quality).toBe('high');
        expect(result.request?.height).toBe(1080); // default
      });

      it('should handle all output settings', () => {
        const parameters = createBaseParameters({
          elements: [{ type: 'video', src: 'video.mp4' }],
          outputSettings: { width: 1920, height: 1080, quality: 'high', cache: true }
        });

        const result = buildRequest(parameters);

        expect(result.request?.width).toBe(1920);
        expect(result.request?.height).toBe(1080);
        expect(result.request?.quality).toBe('high');
        expect(result.request?.cache).toBe(true);
      });
    });

    describe('exception handling', () => {
      it('should handle main buildRequest exception', () => {
        const parameters = createBaseParameters({
          elements: [{ type: 'text', text: 'test' }]
        });

        // Create a proxy that throws on property access
        const faultyParameters = new Proxy(parameters, {
          get: (target, prop) => {
            if (prop === 'isAdvancedMode') {
              throw new Error('Property access error');
            }
            return (target as any)[prop];
          }
        });

        const result = buildRequest(faultyParameters);

        expect(result.request).toBeNull();
        expect(result.errors).toContain('Request building failed: Unknown error');
      });
    });
  });

  describe('isEmptyRequest', () => {
    it.each([
      ['request with movie elements', { elements: [{ type: 'audio' as const, src: 'test.mp3' }], scenes: [] }, false],
      ['request with scene elements', { scenes: [{ elements: [{ type: 'text' as const, text: 'test' }] }] }, false],
      ['request with empty movie elements and empty scenes', { elements: [], scenes: [] }, true],
      ['request with empty movie elements and scenes with no elements', { elements: [], scenes: [{ elements: [] }] }, true],
      ['request with no elements or scenes', {} as any, true],
      ['request with scenes but all empty', { scenes: [{ elements: [] }, { elements: [] }] }, true]
    ])('should return correct result for %s', (_, request, expected) => {
      expect(isEmptyRequest(request)).toBe(expected);
    });
  });
});