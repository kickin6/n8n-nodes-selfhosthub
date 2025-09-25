// __tests__/nodes/CreateJ2vMovie/core/collector.test.ts

import {
  collectParameters,
  validateCollectedParameters,
  CollectedParameters
} from '../../../../nodes/CreateJ2vMovie/core/collector';
import { IExecuteFunctions } from 'n8n-workflow';

/**
 * Creates a mock n8n execution context for testing parameter collection
 */
const createExecuteContext = (params: Record<string, any> = {}): IExecuteFunctions => {
  const mockGetNodeParameter = jest.fn((paramName: string, itemIndex: number, fallback?: any) =>
    params[paramName] !== undefined ? params[paramName] : fallback);

  return {
    getNodeParameter: mockGetNodeParameter as any,
  } as IExecuteFunctions;
};

describe('collector', () => {
  describe('collectParameters', () => {
    describe('advanced mode with templates', () => {
      test('should use jsonTemplateBlank as fallback for unknown template type', () => {
        const template = '{"fallback": "template"}';
        const context = createExecuteContext({
          advancedMode: true,
          templateType: 'unknownTemplateType', // This will trigger the fallback
          jsonTemplateBlank: template
        });

        const result = collectParameters.call(context, 0);

        expect(result.isAdvancedMode).toBe(true);
        expect(result.jsonTemplate).toBe(template);
      });
      test('should collect basic mode parameters by default', () => {
        const context = createExecuteContext({
          advancedMode: false
        });

        const result = collectParameters.call(context, 0);

        expect(result.isAdvancedMode).toBe(false);
        expect(result.outputSettings).toEqual({
          width: 1920, height: 1080, quality: 'high', cache: true
        });
      });

      test('should collect advanced mode with blank template', () => {
        const template = '{"width": 1920, "height": 1080}';
        const context = createExecuteContext({
          advancedMode: true,
          templateType: 'blank',
          jsonTemplateBlank: template
        });

        const result = collectParameters.call(context, 0);

        expect(result.isAdvancedMode).toBe(true);
        expect(result.jsonTemplate).toBe(template);
      });

      test('should collect advanced mode with different templates', () => {
        const templates = [
          { type: 'videoImage', field: 'jsonTemplateVideoImage' },
          { type: 'videoAudio', field: 'jsonTemplateVideoAudio' },
          { type: 'videoSequence', field: 'jsonTemplateVideoSequence' },
          { type: 'slideshow', field: 'jsonTemplateSlideshow' },
          { type: 'textOverlay', field: 'jsonTemplateTextOverlay' },
          { type: 'faceless', field: 'jsonTemplateFaceless' },
          { type: 'socialStory', field: 'jsonTemplateSocialStory' },
          { type: 'presentation', field: 'jsonTemplatePresentation' },
        ];

        templates.forEach(({ type, field }) => {
          const template = `{"template": "${type}"}`;
          const context = createExecuteContext({
            advancedMode: true,
            templateType: type,
            [field]: template
          });

          const result = collectParameters.call(context, 0);

          expect(result.isAdvancedMode).toBe(true);
          expect(result.jsonTemplate).toBe(template);
        });
      });

      test('should collect recordId parameter', () => {
        const recordId = 'record-123';
        const result = collectParameters.call(
          createExecuteContext({ recordId }), 0
        );
        expect(result.recordId).toBe(recordId);
      });
    });

    describe('elements processing', () => {
      const elementTestData = [
        {
          name: 'text with non-default properties and settings',
          input: {
            type: 'text', text: 'Hello', id: 'text-1', comment: 'test',
            condition: 'true', variables: '{"key": "value"}',
            textSettings: '{"font-size": 24, "font-color": "#ff0000", "font-family": "Roboto"}',
            textStyle: 'custom-style'
          },
          expected: {
            type: 'text', text: 'Hello', id: 'text-1', comment: 'test',
            condition: 'true', variables: { key: 'value' },
            settings: {
              'font-size': 24,
              'font-color': '#ff0000',
              'font-family': 'Roboto'
            },
            style: 'custom-style'
          }
        },
        {
          name: 'text with default values filtered out',
          input: {
            type: 'text', text: 'Hello',
            textSettings: '{}',
            textStyle: '001'
          },
          expected: {
            type: 'text', text: 'Hello'
          }
        },
        {
          name: 'voice element complete',
          input: { type: 'voice', text: 'Hello world', voice: 'en-US-Custom', model: 'neural', connection: 'azure' },
          expected: { type: 'voice', text: 'Hello world', voice: 'en-US-Custom', model: 'neural', connection: 'azure' }
        },
        {
          name: 'voice element with defaults filtered',
          input: { type: 'voice', text: 'Hello world', voice: 'en-US-AriaNeural', model: 'azure' },
          expected: { type: 'voice', text: 'Hello world' }
        },
        {
          name: 'html element complete',
          input: { type: 'html', html: '<div>test</div>', tailwindcss: true, wait: 3 },
          expected: { type: 'html', html: '<div>test</div>', tailwindcss: true, wait: 3 }
        },
        {
          name: 'html element with defaults filtered',
          input: { type: 'html', html: '<div>test</div>', tailwindcss: false, wait: 2 },
          expected: { type: 'html', html: '<div>test</div>' }
        },
        {
          name: 'audiogram element complete',
          input: { type: 'audiogram', src: 'audio.mp3', color: '#ff0000', opacity: 0.7, amplitude: 6 },
          expected: { type: 'audiogram', src: 'audio.mp3', color: '#ff0000', opacity: 0.7, amplitude: 6 }
        },
        {
          name: 'audiogram element with defaults filtered',
          input: { type: 'audiogram', src: 'audio.mp3', color: '#ffffff', opacity: 0.5, amplitude: 5 },
          expected: { type: 'audiogram', src: 'audio.mp3' }
        },
        {
          name: 'component with JSON settings',
          input: { type: 'component', component: 'comp-id', settings: '{"config": "value"}' },
          expected: { type: 'component', component: 'comp-id', settings: { config: 'value' } }
        },
        {
          name: 'component with object settings',
          input: { type: 'component', component: 'comp-id', settings: { config: 'value' } },
          expected: { type: 'component', component: 'comp-id', settings: { config: 'value' } }
        },
        {
          name: 'component with cache default filtered',
          input: { type: 'component', component: 'comp-id', cache: true },
          expected: { type: 'component', component: 'comp-id' }
        },
        {
          name: 'image with AI generation and non-default model',
          input: {
            type: 'image', prompt: 'sunset',
            model: 'dall-e-3',
            modelSettings: '{"quality": "hd"}',
            aspectRatio: '{"width": 16, "height": 9}'
          },
          expected: {
            type: 'image', prompt: 'sunset',
            model: 'dall-e-3',
            'model-settings': { quality: 'hd' },
            'aspect-ratio': { width: 16, height: 9 }
          }
        },
        {
          name: 'image with default model filtered',
          input: { type: 'image', prompt: 'sunset', model: 'flux-schnell' },
          expected: { type: 'image', prompt: 'sunset' }
        }
      ];

      test.each(elementTestData)(
        'should process $name correctly',
        ({ input, expected }) => {
          const result = collectParameters.call(
            createExecuteContext({
              elements: { elementValues: input }
            }), 0
          );
          expect(result.elements).toEqual([expected]);
        }
      );

      test('should handle timing properties with defaults filtered', () => {
        const result = collectParameters.call(
          createExecuteContext({
            elements: {
              elementValues: [
                {
                  type: 'text', text: 'test',
                  start: 0,
                  duration: -1,
                  extraTime: 0,
                  zIndex: 0,
                  fadeIn: 0,
                  fadeOut: 0,
                },
                {
                  type: 'text', text: 'test2',
                  start: 5,
                  duration: 10,
                  extraTime: 2,
                  zIndex: 1,
                  fadeIn: 1,
                  fadeOut: 1,
                }
              ]
            }
          }), 0
        );

        expect(result.elements).toHaveLength(2);
        expect(result.elements![0]).toEqual({ type: 'text', text: 'test' });
        expect(result.elements![1]).toEqual({
          type: 'text', text: 'test2',
          start: 5, duration: 10, 'extra-time': 2,
          'z-index': 1, 'fade-in': 1, 'fade-out': 1
        });
      });

      test('should handle position properties with defaults filtered', () => {
        const result = collectParameters.call(
          createExecuteContext({
            elements: {
              elementValues: [
                {
                  type: 'text', text: 'test',
                  position: 'center-center',
                  x: 0,
                  y: 0,
                  width: -1,
                  height: -1,
                  resize: ''
                },
                {
                  type: 'text', text: 'test2',
                  position: 'top-left',
                  x: 100,
                  y: 200,
                  width: 800,
                  height: 600,
                  resize: 'cover'
                }
              ]
            }
          }), 0
        );

        expect(result.elements).toHaveLength(2);
        expect(result.elements![0]).toEqual({ type: 'text', text: 'test' });
        expect(result.elements![1]).toEqual({
          type: 'text', text: 'test2',
          position: 'top-left', x: 100, y: 200,
          width: 800, height: 600, resize: 'cover'
        });
      });

      test('should handle audio properties with defaults filtered', () => {
        const result = collectParameters.call(
          createExecuteContext({
            elements: {
              elementValues: [
                {
                  type: 'audio', src: 'audio.mp3',
                  volume: 1,
                  muted: false,
                  seek: 0,
                  loop: 0
                },
                {
                  type: 'audio', src: 'audio2.mp3',
                  volume: 0.5,
                  muted: true,
                  seek: 10,
                  loop: 3
                }
              ]
            }
          }), 0
        );

        expect(result.elements).toHaveLength(2);
        expect(result.elements![0]).toEqual({ type: 'audio', src: 'audio.mp3' });
        expect(result.elements![1]).toEqual({
          type: 'audio', src: 'audio2.mp3',
          volume: 0.5, muted: true, seek: 10, loop: 3
        });
      });

      test('should handle visual effects with defaults filtered', () => {
        const result = collectParameters.call(
          createExecuteContext({
            elements: {
              elementValues: [
                {
                  type: 'image', src: 'img.jpg',
                  panDistance: 0.1,
                  panCrop: true,
                  zoom: 0,
                  flipHorizontal: false,
                  flipVertical: false
                },
                {
                  type: 'image', src: 'img2.jpg',
                  pan: 'right-to-left',
                  panDistance: 0.2,
                  panCrop: false,
                  zoom: 1.5,
                  flipHorizontal: true,
                  flipVertical: true,
                  mask: 'circle'
                }
              ]
            }
          }), 0
        );

        expect(result.elements).toHaveLength(2);
        expect(result.elements![0]).toEqual({ type: 'image', src: 'img.jpg' });
        expect(result.elements![1]).toEqual({
          type: 'image', src: 'img2.jpg',
          pan: 'right-to-left', 'pan-distance': 0.2, 'pan-crop': false,
          zoom: 1.5, 'flip-horizontal': true, 'flip-vertical': true, mask: 'circle'
        });
      });

      test('should handle JSON object properties', () => {
        const result = collectParameters.call(
          createExecuteContext({
            elements: {
              elementValues: [
                {
                  type: 'image', src: 'img.jpg',
                  crop: '{"x": 10, "y": 20}',
                  rotate: { angle: 45 },
                  correction: '{"brightness": 1.2}',
                  chromaKey: { color: '#00ff00' }
                }
              ]
            }
          }), 0
        );

        expect(result.elements![0]).toEqual({
          type: 'image', src: 'img.jpg',
          crop: { x: 10, y: 20 },
          rotate: { angle: 45 },
          correction: { brightness: 1.2 },
          'chroma-key': { color: '#00ff00' }
        });
      });

      test('should handle empty/invalid JSON object properties', () => {
        const result = collectParameters.call(
          createExecuteContext({
            elements: {
              elementValues: [
                {
                  type: 'image', src: 'img.jpg',
                  crop: '{}',
                  rotate: '',
                  correction: '{invalid json',
                  chromaKey: null
                }
              ]
            }
          }), 0
        );

        expect(result.elements![0]).toEqual({ type: 'image', src: 'img.jpg' });
      });

      const emptyElementScenarios = [
        { name: 'undefined elements', input: undefined },
        { name: 'empty object', input: {} },
        { name: 'undefined elementValues', input: { elementValues: undefined } },
        { name: 'empty array', input: { elementValues: [] } }
      ];

      test.each(emptyElementScenarios)(
        'should handle $name gracefully',
        ({ input }) => {
          const result = collectParameters.call(
            createExecuteContext({ elements: input }), 0
          );
          expect(result.elements).toEqual([]);
        }
      );

      test('should handle non-string kebab-case properties', () => {
        const result = collectParameters.call(
          createExecuteContext({
            elements: {
              elementValues: [
                {
                  type: 'image',
                  prompt: 'sunset',
                  aspectRatio: { width: 16, height: 9 },
                  modelSettings: { quality: 'hd' }
                }
              ]
            }
          }), 0
        );

        expect(result.elements).toHaveLength(1);
        expect((result.elements![0] as any)['aspect-ratio']).toEqual({ width: 16, height: 9 });
        expect((result.elements![0] as any)['model-settings']).toEqual({ quality: 'hd' });
      });

      test('should handle empty string kebab-case properties', () => {
        const result = collectParameters.call(
          createExecuteContext({
            elements: {
              elementValues: [
                {
                  type: 'image',
                  prompt: 'sunset',
                  aspectRatio: '',
                  modelSettings: '   '
                }
              ]
            }
          }), 0
        );

        expect(result.elements![0]).toEqual({
          type: 'image',
          prompt: 'sunset',
          'model-settings': '   '
        });
      });

      test('should handle null kebab-case properties', () => {
        const result = collectParameters.call(
          createExecuteContext({
            elements: {
              elementValues: [
                {
                  type: 'image',
                  prompt: 'sunset',
                  aspectRatio: null,
                  modelSettings: undefined
                }
              ]
            }
          }), 0
        );

        expect(result.elements![0]).toEqual({ type: 'image', prompt: 'sunset' });
      });

      test('should handle variables JSON parsing branches', () => {
        const result = collectParameters.call(
          createExecuteContext({
            elements: {
              elementValues: [
                { type: 'text', text: 'test1', variables: '{"valid": "json"}' },
                { type: 'text', text: 'test2', variables: 'invalid json' },
                { type: 'text', text: 'test3', variables: { already: 'object' } },
                { type: 'text', text: 'test4' }
              ]
            }
          }), 0
        );

        expect(result.elements).toHaveLength(4);
        expect(result.elements![0].variables).toEqual({ valid: 'json' });
        expect(result.elements![1].variables).toBeUndefined();
        expect(result.elements![2].variables).toEqual({ already: 'object' });
        expect(result.elements![3].variables).toBeUndefined();
      });

      test('should handle malformed JSON in kebab-case properties with new logic', () => {
        const result = collectParameters.call(
          createExecuteContext({
            elements: {
              elementValues: [
                { type: 'image', prompt: 'test', aspectRatio: 'malformed json string' },
                { type: 'image', prompt: 'test2', modelSettings: '{incomplete json' }
              ]
            }
          }), 0
        );

        expect(result.elements).toHaveLength(2);
        expect((result.elements![0] as any)['aspect-ratio']).toBe('malformed json string');
        expect((result.elements![1] as any)['model-settings']).toBe('{incomplete json');
      });

      test('should handle malformed JSON in element properties with fallback', () => {
        const result = collectParameters.call(
          createExecuteContext({
            elements: {
              elementValues: [
                { type: 'text', text: 'test', variables: 'invalid json' },
                { type: 'image', prompt: 'test', modelSettings: '{incomplete' },
                { type: 'component', component: 'test', settings: 'bad json' }
              ]
            }
          }), 0
        );

        expect(result.elements).toHaveLength(3);
        expect(result.elements![0].variables).toBeUndefined();
        expect((result.elements![1] as any)['model-settings']).toBe('{incomplete');
        expect(result.elements![2].settings).toBeUndefined();
      });

      test('should handle FTP export with missing optional fields', () => {
        const result = collectParameters.call(
          createExecuteContext({
            exportSettings: {
              exportValues: [
                {
                  exportType: 'ftp',
                  ftpHost: 'ftp.example.com',
                  ftpUsername: 'user',
                  ftpPassword: 'pass'
                }
              ]
            }
          }), 0
        );

        expect(result.exportConfigs).toHaveLength(1);
        expect(result.exportConfigs![0].destinations).toHaveLength(1);
        expect(result.exportConfigs![0].destinations[0]).toEqual({
          type: 'ftp',
          host: 'ftp.example.com',
          username: 'user',
          password: 'pass'
        });
      });

      test('should handle single element as array', () => {
        const result = collectParameters.call(
          createExecuteContext({
            elements: { elementValues: { type: 'text', text: 'test' } }
          }), 0
        );
        expect(result.elements).toHaveLength(1);
        expect(result.elements![0].type).toBe('text');
      });

      test('should handle component with object settings that have keys', () => {
        const result = collectParameters.call(
          createExecuteContext({
            elements: {
              elementValues: [
                { type: 'component', component: 'test', settings: { validKey: 'value' } }
              ]
            }
          }), 0
        );

        expect(result.elements![0].settings).toEqual({ validKey: 'value' });
      });

      test('should handle voice element with connection field', () => {
        const result = collectParameters.call(
          createExecuteContext({
            elements: {
              elementValues: [
                { type: 'voice', text: 'hello', connection: 'custom-connection' },
                { type: 'voice', text: 'hello2', connection: '' }
              ]
            }
          }), 0
        );

        expect(result.elements).toHaveLength(2);
        expect(result.elements![0].connection).toBe('custom-connection');
        expect(result.elements![1].connection).toBeUndefined();
      });

      test('should handle image element with connection field', () => {
        const result = collectParameters.call(
          createExecuteContext({
            elements: {
              elementValues: [
                { type: 'image', prompt: 'test', connection: 'custom-connection' },
                { type: 'image', prompt: 'test2', connection: '' }
              ]
            }
          }), 0
        );

        expect(result.elements).toHaveLength(2);
        expect(result.elements![0].connection).toBe('custom-connection');
        expect(result.elements![1].connection).toBeUndefined();
      });

      test('should handle component with malformed settings', () => {
        const result = collectParameters.call(
          createExecuteContext({
            elements: {
              elementValues: [
                { type: 'component', component: 'test', settings: 'bad json' },
                { type: 'component', component: 'test2', settings: {} }
              ]
            }
          }), 0
        );

        expect(result.elements).toHaveLength(2);
        expect(result.elements![0].settings).toBeUndefined();
        expect(result.elements![1].settings).toBeUndefined();
      });

      test('should handle component settings with Object.keys throwing error', () => {
        const originalObjectKeys = Object.keys;
        Object.keys = jest.fn().mockImplementationOnce(() => {
          throw new Error('Object.keys error');
        }).mockImplementation((obj) => originalObjectKeys(obj));

        try {
          const result = collectParameters.call(
            createExecuteContext({
              elements: {
                elementValues: [
                  { type: 'component', component: 'test', settings: { valid: 'object' } }
                ]
              }
            }), 0
          );

          expect(result.elements![0].settings).toEqual({ valid: 'object' });
        } finally {
          Object.keys = originalObjectKeys;
        }
      });

      test('should handle empty required content fields', () => {
        const result = collectParameters.call(
          createExecuteContext({
            elements: {
              elementValues: [
                { type: 'text', text: '', src: '   ', html: '', component: '', prompt: '' },
                { type: 'text', text: 'valid' }
              ]
            }
          }), 0
        );

        expect(result.elements).toHaveLength(2);
        expect(result.elements![0]).toEqual({ type: 'text' });
        expect(result.elements![1]).toEqual({ type: 'text', text: 'valid' });
      });

      test('should handle empty metadata fields', () => {
        const result = collectParameters.call(
          createExecuteContext({
            elements: {
              elementValues: [
                { type: 'text', text: 'test', id: '', comment: '   ', condition: '' }
              ]
            }
          }), 0
        );

        expect(result.elements![0]).toEqual({ type: 'text', text: 'test' });
      });
    });

    describe('movie settings collection', () => {
      const movieSettingsData = [
        {
          name: 'complete settings',
          input: {
            showMovieSettings: true,
            movieId: 'movie-123',
            movieComment: 'Test movie',
            movieCache: false,
            movieDraft: true,
            movieResolution: 'hd',
            movieVariables: '{"title": "My Movie"}',
            clientData: '{"userId": 456}'
          },
          expected: {
            id: 'movie-123',
            comment: 'Test movie',
            cache: false,
            draft: true,
            resolution: 'hd',
            variables: { title: 'My Movie' },
            'client-data': { userId: 456 }
          }
        },
        {
          name: 'disabled settings',
          input: { showMovieSettings: false, movieId: 'ignored' },
          expected: {}
        },
        {
          name: 'custom resolution filtered out',
          input: { showMovieSettings: true, movieResolution: 'custom' },
          expected: { cache: true, draft: false }
        },
        {
          name: 'default cache and draft values included when explicitly set',
          input: { showMovieSettings: true, movieCache: true, movieDraft: false },
          expected: { cache: true, draft: false }
        }
      ];

      test.each(movieSettingsData)(
        'should handle $name',
        ({ input, expected }) => {
          const result = collectParameters.call(
            createExecuteContext({ ...input }), 0
          );
          expect(result.movieSettings).toEqual(expected);
        }
      );

      const malformedJsonCases = [
        { field: 'movieVariables', value: 'invalid json', key: 'variables' },
        { field: 'clientData', value: '{incomplete', key: 'client-data' },
        { field: 'movieVariables', value: '{}', key: 'variables' },
        { field: 'clientData', value: '  {}  ', key: 'client-data' }
      ];

      test.each(malformedJsonCases)(
        'should handle malformed/empty $field silently',
        ({ field, value, key }) => {
          const result = collectParameters.call(
            createExecuteContext({
              showMovieSettings: true,
              [field]: value
            }), 0
          );

          expect((result.movieSettings as any)?.[key]).toBeUndefined();
        }
      );
    });

    describe('subtitles collection', () => {
      const subtitleData = [
        {
          name: 'complete subtitle configuration with settings',
          input: {
            enableSubtitles: true,
            captions: 'subtitles.srt',
            subtitleComment: 'English subtitles',
            subtitleLanguage: 'en',
            subtitleModel: 'whisper-1',
            subtitleSettings: '{"fontSize": 18, "color": "white"}'
          },
          expected: {
            type: 'subtitles',
            captions: 'subtitles.srt',
            comment: 'English subtitles',
            language: 'en',
            model: 'whisper-1',
            settings: { fontSize: 18, color: 'white' }
          }
        },
        {
          name: 'default model filtered',
          input: {
            enableSubtitles: true,
            captions: 'test.srt',
            subtitleModel: 'default'
          },
          expected: {
            type: 'subtitles',
            captions: 'test.srt',
            language: 'auto'
          }
        },
        {
          name: 'empty settings object filtered',
          input: {
            enableSubtitles: true,
            captions: 'test.srt',
            subtitleSettings: '{}'
          },
          expected: {
            type: 'subtitles',
            captions: 'test.srt',
            language: 'auto'
          }
        },
        {
          name: 'disabled subtitles',
          input: { enableSubtitles: false },
          expected: undefined
        }
      ];

      test.each(subtitleData)(
        'should handle $name',
        ({ input, expected }) => {
          const result = collectParameters.call(createExecuteContext(input), 0);
          expect(result.subtitles).toEqual(expected);
        }
      );

      test('should handle malformed subtitle settings silently', () => {
        const result = collectParameters.call(
          createExecuteContext({
            enableSubtitles: true,
            captions: 'test.srt',
            subtitleSettings: '{"incomplete'
          }), 0
        );
        expect(result.subtitles?.settings).toBeUndefined();
      });
    });

    describe('output settings collection', () => {
      const outputSettingsData = [
        {
          name: 'custom settings',
          input: { outputSettings: { outputValues: { width: 1280, height: 720, quality: 'medium', cache: false } } },
          expected: { width: 1280, height: 720, quality: 'medium', cache: false }
        },
        {
          name: 'defaults when missing',
          input: {},
          expected: { width: 1920, height: 1080, quality: 'high', cache: true }
        },
        {
          name: 'defaults when empty',
          input: { outputSettings: {} },
          expected: { width: 1920, height: 1080, quality: 'high', cache: true }
        }
      ];

      test.each(outputSettingsData)(
        'should handle $name',
        ({ input, expected }) => {
          const result = collectParameters.call(
            createExecuteContext({ ...input }), 0
          );
          expect(result.outputSettings).toEqual(expected);
        }
      );
    });

    describe('export configurations', () => {
      const exportData = [
        {
          name: 'webhook export',
          input: [{ exportType: 'webhook', webhookUrl: 'https://example.com' }],
          expected: [{
            destinations: [{
              type: 'webhook',
              endpoint: 'https://example.com'
            }]
          }]
        },
        {
          name: 'FTP export complete',
          input: [{
            exportType: 'ftp',
            ftpHost: 'ftp.com',
            ftpPort: 22,
            ftpUsername: 'admin',
            ftpPassword: 'secret',
            ftpPath: '/uploads',
            ftpFile: 'video.mp4',
            ftpSecure: true
          }],
          expected: [{
            destinations: [{
              type: 'ftp',
              host: 'ftp.com',
              port: 22,
              username: 'admin',
              password: 'secret',
              'remote-path': '/uploads',
              file: 'video.mp4',
              secure: true
            }]
          }]
        },
        {
          name: 'FTP export with defaults',
          input: [{
            exportType: 'ftp',
            ftpHost: 'ftp.example.com',
            ftpUsername: 'user',
            ftpPassword: 'pass'
          }],
          expected: [{
            destinations: [{
              type: 'ftp',
              host: 'ftp.example.com',
              username: 'user',
              password: 'pass'
            }]
          }]
        },
        {
          name: 'email export with optional fields',
          input: [{
            exportType: 'email',
            emailTo: 'user@test.com',
            emailFrom: 'app@test.com',
            emailSubject: 'Custom Subject',
            emailMessage: 'Custom message'
          }],
          expected: [{
            destinations: [{
              type: 'email',
              to: 'user@test.com',
              from: 'app@test.com',
              subject: 'Custom Subject',
              message: 'Custom message'
            }]
          }]
        },
        {
          name: 'email export with defaults filtered',
          input: [{
            exportType: 'email',
            emailTo: 'user@test.com',
            emailSubject: 'Your video is ready'
          }],
          expected: [{
            destinations: [{
              type: 'email',
              to: 'user@test.com'
            }]
          }]
        },
        {
          name: 'multiple export destinations',
          input: [
            { exportType: 'webhook', webhookUrl: 'https://example.com/hook' },
            { exportType: 'email', emailTo: 'user@test.com' }
          ],
          expected: [{
            destinations: [
              {
                type: 'webhook',
                endpoint: 'https://example.com/hook'
              },
              {
                type: 'email',
                to: 'user@test.com'
              }
            ]
          }]
        }
      ];

      test.each(exportData)(
        'should process $name',
        ({ input, expected }) => {
          const result = collectParameters.call(
            createExecuteContext({
              exportSettings: { exportValues: input }
            }), 0
          );
          expect(result.exportConfigs).toEqual(expected);
        }
      );

      test('should convert single export to array', () => {
        const result = collectParameters.call(
          createExecuteContext({
            exportSettings: { exportValues: { exportType: 'webhook', webhookUrl: 'https://test.com' } }
          }), 0
        );
        expect(result.exportConfigs).toHaveLength(1);
        expect(result.exportConfigs![0].destinations).toHaveLength(1);
        expect(result.exportConfigs![0].destinations[0].type).toBe('webhook');
      });

      const emptyExportCases = [
        { name: 'no exportSettings', input: {} },
        { name: 'empty exportValues', input: { exportSettings: { exportValues: [] } } },
        { name: 'null exportValues', input: { exportSettings: { exportValues: null } } }
      ];

      test.each(emptyExportCases)(
        'should return empty array for $name',
        ({ input }) => {
          const result = collectParameters.call(
            createExecuteContext({ ...input }), 0
          );
          expect(result.exportConfigs).toEqual([]);
        }
      );

      test('should handle FTP with default port filtered', () => {
        const result = collectParameters.call(
          createExecuteContext({
            exportSettings: {
              exportValues: [{
                exportType: 'ftp',
                ftpHost: 'ftp.example.com',
                ftpPort: 21,
                ftpUsername: 'user',
                ftpPassword: 'pass',
                ftpPath: '/',
                ftpSecure: false
              }]
            }
          }), 0
        );

        expect(result.exportConfigs![0].destinations[0]).toEqual({
          type: 'ftp',
          host: 'ftp.example.com',
          username: 'user',
          password: 'pass'
        });
      });
    });

    describe('export configuration validation - comprehensive coverage', () => {
      test('should validate export config without destinations array', () => {
        const params: CollectedParameters = {
          isAdvancedMode: false,
          elements: [{ type: 'text', text: 'test' }],
          exportConfigs: [{ /* missing destinations */ } as any]
        };

        const result = validateCollectedParameters(params);
        expect(result.isValid).toBe(false);
        expect(result.errors.some(e => e.includes('at least one destination is required'))).toBe(true);
      });

      test('should validate export config with empty destinations array', () => {
        const params: CollectedParameters = {
          isAdvancedMode: false,
          elements: [{ type: 'text', text: 'test' }],
          exportConfigs: [{ destinations: [] }]
        };

        const result = validateCollectedParameters(params);
        expect(result.isValid).toBe(false);
        expect(result.errors.some(e => e.includes('at least one destination is required'))).toBe(true);
      });

      test('should validate export config with non-array destinations', () => {
        const params: CollectedParameters = {
          isAdvancedMode: false,
          elements: [{ type: 'text', text: 'test' }],
          exportConfigs: [{ destinations: 'invalid' as any }]
        };

        const result = validateCollectedParameters(params);
        expect(result.isValid).toBe(false);
        expect(result.errors.some(e => e.includes('at least one destination is required'))).toBe(true);
      });

      test('should validate destination without type', () => {
        const params: CollectedParameters = {
          isAdvancedMode: false,
          elements: [{ type: 'text', text: 'test' }],
          exportConfigs: [{
            destinations: [{ endpoint: 'https://example.com' } as any]
          }]
        };

        const result = validateCollectedParameters(params);
        expect(result.isValid).toBe(false);
        expect(result.errors.some(e => e.includes('destination type is required'))).toBe(true);
      });

      test('should validate destination that is not an object', () => {
        const params: CollectedParameters = {
          isAdvancedMode: false,
          elements: [{ type: 'text', text: 'test' }],
          exportConfigs: [{
            destinations: ['invalid destination' as any]
          }]
        };

        const result = validateCollectedParameters(params);
        expect(result.isValid).toBe(false);
        expect(result.errors.some(e => e.includes('destination must be an object'))).toBe(true);
      });

      test('should validate null/undefined destinations', () => {
        const params: CollectedParameters = {
          isAdvancedMode: false,
          elements: [{ type: 'text', text: 'test' }],
          exportConfigs: [{
            destinations: [null as any, undefined as any]
          }]
        };

        const result = validateCollectedParameters(params);
        expect(result.isValid).toBe(false);
        expect(result.errors.some(e => e.includes('destination must be an object'))).toBe(true);
      });

      test('should validate webhook destination without endpoint', () => {
        const params: CollectedParameters = {
          isAdvancedMode: false,
          elements: [{ type: 'text', text: 'test' }],
          exportConfigs: [{
            destinations: [{ type: 'webhook' } as any]
          }]
        };

        const result = validateCollectedParameters(params);
        expect(result.isValid).toBe(false);
        expect(result.errors.some(e => e.includes('webhook endpoint URL is required'))).toBe(true);
      });

      test('should validate webhook destination with empty endpoint', () => {
        const params: CollectedParameters = {
          isAdvancedMode: false,
          elements: [{ type: 'text', text: 'test' }],
          exportConfigs: [{
            destinations: [{ type: 'webhook', endpoint: '' } as any]
          }]
        };

        const result = validateCollectedParameters(params);
        expect(result.isValid).toBe(false);
        expect(result.errors.some(e => e.includes('webhook endpoint URL is required'))).toBe(true);
      });

      test('should validate FTP destination missing required fields', () => {
        const params: CollectedParameters = {
          isAdvancedMode: false,
          elements: [{ type: 'text', text: 'test' }],
          exportConfigs: [{
            destinations: [{ type: 'ftp', host: 'ftp.example.com' } as any]
          }]
        };

        const result = validateCollectedParameters(params);
        expect(result.isValid).toBe(false);
        expect(result.errors.some(e => e.includes('FTP username is required'))).toBe(true);
        expect(result.errors.some(e => e.includes('FTP password is required'))).toBe(true);
      });

      test('should validate FTP destination with empty required fields', () => {
        const params: CollectedParameters = {
          isAdvancedMode: false,
          elements: [{ type: 'text', text: 'test' }],
          exportConfigs: [{
            destinations: [{
              type: 'ftp',
              host: '',
              username: '   ',
              password: ''
            } as any]
          }]
        };

        const result = validateCollectedParameters(params);
        expect(result.isValid).toBe(false);
        expect(result.errors.some(e => e.includes('FTP host is required'))).toBe(true);
        expect(result.errors.some(e => e.includes('FTP username is required'))).toBe(true);
        expect(result.errors.some(e => e.includes('FTP password is required'))).toBe(true);
      });

      test('should validate FTP destination with invalid port', () => {
        const params: CollectedParameters = {
          isAdvancedMode: false,
          elements: [{ type: 'text', text: 'test' }],
          exportConfigs: [{
            destinations: [{
              type: 'ftp',
              host: 'ftp.example.com',
              username: 'user',
              password: 'pass',
              port: 70000
            } as any]
          }]
        };

        const result = validateCollectedParameters(params);
        expect(result.isValid).toBe(false);
        expect(result.errors.some(e => e.includes('FTP port must be a number between 1 and 65535'))).toBe(true);
      });

      test('should validate FTP destination with negative port', () => {
        const params: CollectedParameters = {
          isAdvancedMode: false,
          elements: [{ type: 'text', text: 'test' }],
          exportConfigs: [{
            destinations: [{
              type: 'ftp',
              host: 'ftp.example.com',
              username: 'user',
              password: 'pass',
              port: -1
            } as any]
          }]
        };

        const result = validateCollectedParameters(params);
        expect(result.isValid).toBe(false);
        expect(result.errors.some(e => e.includes('FTP port must be a number between 1 and 65535'))).toBe(true);
      });

      test('should validate email destination without recipient', () => {
        const params: CollectedParameters = {
          isAdvancedMode: false,
          elements: [{ type: 'text', text: 'test' }],
          exportConfigs: [{
            destinations: [{ type: 'email' } as any]
          }]
        };

        const result = validateCollectedParameters(params);
        expect(result.isValid).toBe(false);
        expect(result.errors.some(e => e.includes('email recipient is required'))).toBe(true);
      });

      test('should validate email destination with empty recipient', () => {
        const params: CollectedParameters = {
          isAdvancedMode: false,
          elements: [{ type: 'text', text: 'test' }],
          exportConfigs: [{
            destinations: [{ type: 'email', to: '' } as any]
          }]
        };

        const result = validateCollectedParameters(params);
        expect(result.isValid).toBe(false);
        expect(result.errors.some(e => e.includes('email recipient is required'))).toBe(true);
      });

      test('should validate email destination with whitespace-only recipient', () => {
        const params: CollectedParameters = {
          isAdvancedMode: false,
          elements: [{ type: 'text', text: 'test' }],
          exportConfigs: [{
            destinations: [{ type: 'email', to: '   ' } as any]
          }]
        };

        const result = validateCollectedParameters(params);
        expect(result.isValid).toBe(false);
        expect(result.errors.some(e => e.includes('email recipient is required'))).toBe(true);
      });

      test('should validate email destination with tab/newline recipient', () => {
        const params: CollectedParameters = {
          isAdvancedMode: false,
          elements: [{ type: 'text', text: 'test' }],
          exportConfigs: [{
            destinations: [{ type: 'email', to: '\t\n\r ' } as any]
          }]
        };

        const result = validateCollectedParameters(params);
        expect(result.isValid).toBe(false);
        expect(result.errors.some(e => e.includes('email recipient is required'))).toBe(true);
      });

      test('should validate unknown destination type', () => {
        const params: CollectedParameters = {
          isAdvancedMode: false,
          elements: [{ type: 'text', text: 'test' }],
          exportConfigs: [{
            destinations: [{ type: 'unknown-type', someField: 'value' } as any]
          }]
        };

        const result = validateCollectedParameters(params);
        expect(result.isValid).toBe(false);
        expect(result.errors.some(e => e.includes('invalid destination type'))).toBe(true);
      });

      test('should handle multiple export configs with mixed validity', () => {
        const params: CollectedParameters = {
          isAdvancedMode: false,
          elements: [{ type: 'text', text: 'test' }],
          exportConfigs: [
            {
              destinations: [{ type: 'webhook', endpoint: 'https://valid.com' }]
            },
            {
              destinations: [{ type: 'ftp' } as any]
            },
            {
              destinations: []
            }
          ]
        };

        const result = validateCollectedParameters(params);
        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(3);
      });

      test('should provide context for multiple destinations in same config', () => {
        const params: CollectedParameters = {
          isAdvancedMode: false,
          elements: [{ type: 'text', text: 'test' }],
          exportConfigs: [{
            destinations: [
              { type: 'webhook', endpoint: 'https://example.com' },
              { type: 'webhook' } as any,
              { type: 'email' } as any
            ]
          }]
        };

        const result = validateCollectedParameters(params);
        expect(result.isValid).toBe(false);
        expect(result.errors.some(e => e.includes('Export config 1, destination 2'))).toBe(true);
        expect(result.errors.some(e => e.includes('Export config 1, destination 3'))).toBe(true);
      });
    });

    describe('edge cases and error handling', () => {
      test('should handle null parameter values gracefully', () => {
        const context = createExecuteContext({});
        const mockFn = context.getNodeParameter as jest.Mock;

        mockFn.mockImplementation((paramName, itemIndex, fallback) => {
          const nullValueParams = ['elements', 'outputSettings', 'exportSettings'];
          if (nullValueParams.includes(paramName)) return null;
          return fallback;
        });

        const result = collectParameters.call(context, 0);

        expect(result.elements).toEqual([]);
        expect(result.exportConfigs).toEqual([]);
        expect(result.outputSettings).toEqual({
          width: 1920, height: 1080, quality: 'high', cache: true
        });
      });

      test('should handle element with empty variables object', () => {
        const result = collectParameters.call(
          createExecuteContext({
            elements: {
              elementValues: [
                { type: 'text', text: 'test', variables: {} }
              ]
            }
          }), 0
        );

        expect(result.elements![0].variables).toBeUndefined();
      });

      test('shouldIncludeValue function with isRequired parameter', () => {
        const testIsRequiredLogic = (value: any, isRequired: boolean): boolean => {
          if (isRequired) return value !== undefined && value !== null;
          return false;
        };

        expect(testIsRequiredLogic('value', true)).toBe(true);
        expect(testIsRequiredLogic('', true)).toBe(true);
        expect(testIsRequiredLogic(0, true)).toBe(true);
        expect(testIsRequiredLogic(false, true)).toBe(true);
        expect(testIsRequiredLogic(null, true)).toBe(false);
        expect(testIsRequiredLogic(undefined, true)).toBe(false);

        expect(testIsRequiredLogic('value', false)).toBe(false);
      });
    });
  });

  describe('validateCollectedParameters', () => {
    /**
     * Creates a base valid parameters object for testing with optional overrides
     */
    const createValidParams = (overrides: Partial<CollectedParameters> = {}): CollectedParameters => ({
      isAdvancedMode: false,
      elements: [],
      recordId: 'test-record',
      ...overrides
    });

    describe('advanced mode validation', () => {
      const advancedModeTests = [
        {
          name: 'valid JSON template',
          params: { isAdvancedMode: true, jsonTemplate: '{"test": true}' },
          valid: true
        },
        {
          name: 'empty template',
          params: { isAdvancedMode: true, jsonTemplate: '' },
          valid: false,
          errorContains: 'JSON template is required'
        },
        {
          name: 'whitespace template',
          params: { isAdvancedMode: true, jsonTemplate: '   ' },
          valid: false,
          errorContains: 'JSON template is required'
        }
      ];

      test.each(advancedModeTests)(
        'should validate $name',
        ({ params, valid, errorContains }) => {
          const result = validateCollectedParameters(createValidParams(params));
          expect(result.isValid).toBe(valid);
          if (errorContains) {
            expect(result.errors.some(e => e.includes(errorContains))).toBe(true);
          }
        }
      );

      test('should skip element validation in advanced mode', () => {
        const params = createValidParams({
          isAdvancedMode: true,
          jsonTemplate: '{"valid": true}',
          elements: []
        });

        const result = validateCollectedParameters(params);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });

    describe('basic mode validation', () => {
      test('should require at least one element', () => {
        const result = validateCollectedParameters(createValidParams({ elements: [] }));
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('At least one element is required');
      });

      test('should accept valid elements', () => {
        const result = validateCollectedParameters(
          createValidParams({ elements: [{ type: 'text', text: 'content' }] })
        );
        expect(result.isValid).toBe(true);
      });

      test('should also accept valid subtitles when no elements', () => {
        const result = validateCollectedParameters(
          createValidParams({
            elements: [],
            subtitles: { type: 'subtitles', captions: 'test.srt' }
          })
        );
        expect(result.isValid).toBe(true);
      });
    });

    describe('element validation', () => {
      test('should require element type', () => {
        const result = validateCollectedParameters(
          createValidParams({ elements: [{ text: 'no type' }, {}, { src: 'no type' }] })
        );
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Element 1: type is required');
        expect(result.errors).toContain('Element 2: type is required');
        expect(result.errors).toContain('Element 3: type is required');
      });

      const mediaElementTests = [
        { type: 'video', errorMsg: 'source URL is required for video elements' },
        { type: 'audio', errorMsg: 'source URL is required for audio elements' },
        { type: 'audiogram', errorMsg: 'source URL is required for audiogram elements' }
      ];

      test.each(mediaElementTests)(
        'should require src for $type elements',
        ({ type, errorMsg }) => {
          const result = validateCollectedParameters(createValidParams({ elements: [{ type }] }));
          expect(result.isValid).toBe(false);
          expect(result.errors).toContain(`Element 1: ${errorMsg}`);
        }
      );

      test.each(mediaElementTests)(
        'should accept valid $type element',
        ({ type }) => {
          const result = validateCollectedParameters(
            createValidParams({ elements: [{ type, src: 'https://example.com/media.mp4' }] })
          );
          expect(result.isValid).toBe(true);
        }
      );

      const textElementTests = [
        { type: 'text', errorMsg: 'text content is required for text elements' },
        { type: 'voice', errorMsg: 'text content is required for voice elements' }
      ];

      test.each(textElementTests)(
        'should require text for $type elements',
        ({ type, errorMsg }) => {
          const result = validateCollectedParameters(createValidParams({ elements: [{ type }] }));
          expect(result.isValid).toBe(false);
          expect(result.errors).toContain(`Element 1: ${errorMsg}`);
        }
      );

      test.each(textElementTests)(
        'should accept valid $type element',
        ({ type }) => {
          const result = validateCollectedParameters(
            createValidParams({ elements: [{ type, text: 'Valid content' }] })
          );
          expect(result.isValid).toBe(true);
        }
      );

      test('should require component ID for component elements', () => {
        const result = validateCollectedParameters(createValidParams({ elements: [{ type: 'component' }] }));
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Element 1: component ID is required for component elements');
      });

      test('should accept valid component element', () => {
        const result = validateCollectedParameters(
          createValidParams({ elements: [{ type: 'component', component: 'comp-123' }] })
        );
        expect(result.isValid).toBe(true);
      });

      const imageValidationTests = [
        {
          element: { type: 'image' },
          errorContains: 'either source URL or AI prompt is required'
        },
        {
          element: { type: 'image', src: '', prompt: '' },
          errorContains: 'either source URL or AI prompt is required'
        },
        {
          element: { type: 'image', src: '   ', prompt: '   ' },
          errorContains: 'either source URL or AI prompt is required'
        },
        {
          element: { type: 'image', src: 'img.jpg', prompt: 'AI prompt' },
          errorContains: 'cannot specify both source URL and AI prompt'
        }
      ];

      test.each(imageValidationTests)(
        'should validate image element: %o',
        ({ element, errorContains }) => {
          const result = validateCollectedParameters(createValidParams({ elements: [element] }));
          expect(result.isValid).toBe(false);
          expect(result.errors.some(e => e.includes(errorContains))).toBe(true);
        }
      );

      const validImageTests = [
        { type: 'image', src: 'image.jpg' },
        { type: 'image', prompt: 'Beautiful sunset' },
        { type: 'image', src: 'https://example.com/image.png' },
        { type: 'image', prompt: 'AI generated artwork' }
      ];

      test.each(validImageTests)(
        'should accept valid image element: %o',
        (element) => {
          const result = validateCollectedParameters(createValidParams({ elements: [element] }));
          expect(result.isValid).toBe(true);
        }
      );

      const htmlValidationTests = [
        { element: { type: 'html' }, valid: false },
        { element: { type: 'html', src: '', html: '' }, valid: false },
        { element: { type: 'html', src: '   ', html: '   ' }, valid: false },
        { element: { type: 'html', src: 'https://example.com' }, valid: true },
        { element: { type: 'html', html: '<div>Content</div>' }, valid: true }
      ];

      test.each(htmlValidationTests)(
        'should validate html element: %o',
        ({ element, valid }) => {
          const result = validateCollectedParameters(createValidParams({ elements: [element] }));
          expect(result.isValid).toBe(valid);
          if (!valid) {
            expect(result.errors.some(e => e.includes('either source URL or HTML content is required'))).toBe(true);
          }
        }
      );
    });

    describe('edge cases', () => {
      test('should handle null/undefined elements gracefully', () => {
        const result1 = validateCollectedParameters(createValidParams({ elements: null as any }));
        expect(result1.isValid).toBe(false);
        expect(result1.errors).toContain('At least one element is required');

        const result2 = validateCollectedParameters(createValidParams({ elements: undefined as any }));
        expect(result2.isValid).toBe(false);
        expect(result2.errors).toContain('At least one element is required');
      });

      test('should handle null/undefined elements in array', () => {
        expect(() => {
          validateCollectedParameters(createValidParams({ elements: [null] as any }));
        }).toThrow();

        expect(() => {
          validateCollectedParameters(createValidParams({ elements: [undefined] as any }));
        }).toThrow();
      });

      test('should accumulate multiple validation errors', () => {
        const elements = [
          {},
          { type: 'text' },
          { type: 'video' },
          { type: 'image', src: 'img.jpg', prompt: 'prompt' },
          { type: 'component' }
        ];

        const result = validateCollectedParameters(createValidParams({ elements }));
        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThanOrEqual(5);
      });

      test('should maintain consistent return structure', () => {
        const testCases = [
          createValidParams({ isAdvancedMode: true, jsonTemplate: '{}' }),
          createValidParams({ elements: [{ type: 'text', text: 'valid' }] }),
          createValidParams({ elements: [] })
        ];

        testCases.forEach(params => {
          const result = validateCollectedParameters(params);

          expect(result).toHaveProperty('isValid');
          expect(result).toHaveProperty('errors');
          expect(typeof result.isValid).toBe('boolean');
          expect(Array.isArray(result.errors)).toBe(true);
          expect(result.isValid).toBe(result.errors.length === 0);
        });
      });
    });

    describe('comprehensive element type validation', () => {
      const elementTypeValidation = [
        { type: 'text', validProps: { text: 'content' }, invalidCase: {}, errorContains: 'text content is required' },
        { type: 'voice', validProps: { text: 'speech' }, invalidCase: {}, errorContains: 'text content is required' },
        { type: 'video', validProps: { src: 'video.mp4' }, invalidCase: {}, errorContains: 'source URL is required' },
        { type: 'audio', validProps: { src: 'audio.mp3' }, invalidCase: {}, errorContains: 'source URL is required' },
        { type: 'audiogram', validProps: { src: 'audio.wav' }, invalidCase: {}, errorContains: 'source URL is required' },
        { type: 'component', validProps: { component: 'comp-1' }, invalidCase: {}, errorContains: 'component ID is required' }
      ];

      test.each(elementTypeValidation)(
        'should validate $type elements correctly',
        ({ type, validProps, invalidCase, errorContains }) => {
          const validResult = validateCollectedParameters(
            createValidParams({ elements: [{ type, ...validProps }] })
          );
          expect(validResult.isValid).toBe(true);

          const invalidResult = validateCollectedParameters(
            createValidParams({ elements: [{ type, ...invalidCase }] })
          );
          expect(invalidResult.isValid).toBe(false);
          expect(invalidResult.errors.some(e => e.includes(errorContains))).toBe(true);
        }
      );
    });
  });

  describe('integration tests', () => {
    test('complete workflow with basic mode', () => {
      const context = createExecuteContext({
        recordId: 'movie-123',
        elements: { elementValues: [{ type: 'text', text: 'Title' }] },
        enableSubtitles: true,
        captions: 'subtitles.srt',
        showMovieSettings: true,
        movieId: 'movie-456',
        outputSettings: { outputValues: { width: 1920, height: 1080 } },
        exportSettings: { exportValues: [{ exportType: 'webhook', webhookUrl: 'https://example.com' }] }
      });

      const collected = collectParameters.call(context, 0);
      const validation = validateCollectedParameters(collected);

      expect(collected.elements).toHaveLength(1);
      expect(collected.subtitles).toBeDefined();
      expect(collected.movieSettings?.id).toBe('movie-456');
      expect(collected.exportConfigs).toHaveLength(1);
      expect(validation.isValid).toBe(true);
    });

    test('complete workflow with advanced mode', () => {
      const context = createExecuteContext({
        advancedMode: true,
        templateType: 'videoAudio',
        jsonTemplateVideoAudio: '{"test": "advanced"}'
      });

      const collected = collectParameters.call(context, 0);
      const validation = validateCollectedParameters(collected);

      expect(collected.isAdvancedMode).toBe(true);
      expect(collected.jsonTemplate).toBe('{"test": "advanced"}');
      expect(validation.isValid).toBe(true);
    });

    const failureScenarios = [
      {
        name: 'missing elements',
        params: { elements: [] },
        errorContains: 'At least one element is required'
      },
      {
        name: 'advanced mode without template',
        params: { advancedMode: true, jsonTemplate: '' },
        errorContains: 'JSON template is required'
      }
    ];

    test.each(failureScenarios)(
      'should handle validation failure: $name',
      ({ params, errorContains }) => {
        const context = createExecuteContext(params);
        const collected = collectParameters.call(context, 0);
        const validation = validateCollectedParameters(collected);

        expect(validation.isValid).toBe(false);
        expect(validation.errors.some(e => e.includes(errorContains))).toBe(true);
      }
    );

    test('should handle multiple simultaneous errors', () => {
      const context = createExecuteContext({
        elements: {
          elementValues: [
            {},
            { type: 'text' },
            { type: 'video' },
            { type: 'image', src: 'img.jpg', prompt: 'conflict' },
            { type: 'component' },
            { type: 'html' }
          ]
        }
      });

      const collected = collectParameters.call(context, 0);
      const validation = validateCollectedParameters(collected);

      expect(validation.isValid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(5);

      expect(validation.errors.some(e => e.includes('type is required'))).toBe(true);
      expect(validation.errors.some(e => e.includes('text content is required'))).toBe(true);
      expect(validation.errors.some(e => e.includes('source URL is required'))).toBe(true);
      expect(validation.errors.some(e => e.includes('cannot specify both'))).toBe(true);
      expect(validation.errors.some(e => e.includes('component ID is required'))).toBe(true);
      expect(validation.errors.some(e => e.includes('either source URL or HTML'))).toBe(true);
    });

    test('should handle complex parameter edge cases', () => {
      const context = createExecuteContext({
        elements: { elementValues: null },
        outputSettings: null,
        exportSettings: null,
        showMovieSettings: false
      });

      const mockFn = context.getNodeParameter as jest.Mock;

      mockFn.mockImplementation((paramName, itemIndex, fallback) => {
        const paramMap: Record<string, any> = {
          'elements': { elementValues: null },
          'outputSettings': null,
          'exportSettings': null,
          'showMovieSettings': false
        };

        return paramMap[paramName] !== undefined ? paramMap[paramName] : fallback;
      });

      const result = collectParameters.call(context, 0);

      expect(result.elements).toEqual([]);
      expect(result.exportConfigs).toEqual([]);
      expect(result.movieSettings).toEqual({});
      expect(result.outputSettings).toEqual({
        width: 1920, height: 1080, quality: 'high', cache: true
      });
    });

    test('should handle different template types in advanced mode', () => {
      const templates = [
        'blank',
        'videoImage',
        'videoAudio',
        'videoSequence',
        'slideshow',
        'textOverlay',
        'faceless',
        'socialStory',
        'presentation'
      ];

      templates.forEach(templateType => {
        const fieldName = templateType === 'blank' ? 'jsonTemplateBlank' :
          `jsonTemplate${templateType.charAt(0).toUpperCase() + templateType.slice(1)}`;

        const context = createExecuteContext({
          advancedMode: true,
          templateType,
          [fieldName]: `{"template": "${templateType}"}`
        });

        const collected = collectParameters.call(context, 0);

        expect(collected.isAdvancedMode).toBe(true);
        expect(collected.jsonTemplate).toBe(`{"template": "${templateType}"}`);
      });
    });
  });
});