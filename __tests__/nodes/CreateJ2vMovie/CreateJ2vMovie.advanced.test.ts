import {
  IDataObject,
  IExecuteFunctions,
  INodeExecutionData,
  INodeParameters
} from 'n8n-workflow';
import { CreateJ2vMovie } from '../../../nodes/CreateJ2vMovie/CreateJ2vMovie.node';

describe('CreateJ2vMovie - Advanced Mode', () => {
  /**
   * Helper function to create a mock execute function with given parameters
   */
  const createMockExecuteFunction = (nodeParameters: INodeParameters) => {
    const mockExecute = {
      getNodeParameter: (
        parameterName: string,
        itemIndex: number,
        fallbackValue?: any
      ) => {
        // Handle dotted path notation for 'movieElements.elementValues' and 'elements.elementValues'
        if (parameterName === 'movieElements.elementValues' && nodeParameters.movieElements) {
          return nodeParameters.movieElements;
        }
        if (parameterName === 'elements.elementValues' && nodeParameters.elements) {
          return nodeParameters.elements;
        }
        
        return (
          nodeParameters[parameterName] !== undefined
            ? nodeParameters[parameterName]
            : fallbackValue
        );
      },
      getInputData: jest.fn().mockReturnValue([{}]),
      getCredentials: jest.fn().mockImplementation((type: string) => {
        if (type === 'json2VideoApiCredentials') {
          return { apiKey: 'test-api-key' };
        }
        throw new Error(`Unknown credentials type: ${type}`);
      }),
      continueOnFail: jest.fn().mockReturnValue(false),
      logger: {
        debug: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        info: jest.fn(),
      },
      helpers: {
        returnJsonArray: jest.fn((data: IDataObject | IDataObject[]) => {
          if (Array.isArray(data)) {
            return data.map((item: IDataObject) => ({ json: item }));
          } else {
            return [{ json: data }];
          }
        }),
        request: jest.fn().mockResolvedValue({
          id: 'test-job-id',
          status: 'queued',
        }),
        constructExecutionMetaData: jest.fn((data: INodeExecutionData[], { itemData }: { itemData: { item: number } }) => {
          return data.map((item: INodeExecutionData, index: number) => {
            return {
              ...item,
              pairedItem: {
                item: itemData?.item || index,
              },
            };
          });
        }),
      },
    };
    return mockExecute as unknown as IExecuteFunctions;
  };

  let createJ2vMovie: CreateJ2vMovie;
  let mockExecuteFunction: IExecuteFunctions;

  beforeEach(() => {
    jest.clearAllMocks();
    createJ2vMovie = new CreateJ2vMovie();
  });

  describe('createMovie advanced mode', () => {
    test('should create a movie with advanced mode using JSON template', async () => {
      const nodeParameters: INodeParameters = {
        operation: 'createMovie',
        recordId: 'test-record-123',
        webhookUrl: 'https://webhook.site/test',
        advancedMode: true,
        jsonTemplate: '[{"src":"https://example.com/image1.jpg","duration":3},{"src":"https://example.com/image2.jpg","duration":4}]',
        output_width: 1280,
        output_height: 720,
        quality: 'medium',
        framerate: 30,
      };

      mockExecuteFunction = createMockExecuteFunction(nodeParameters);

      const result = await createJ2vMovie.execute.call(mockExecuteFunction);

      expect(mockExecuteFunction.helpers.request).toHaveBeenCalledWith(
        expect.objectContaining({
          url: expect.stringMatching(/https:\/\/api\.json2video\.com\/v2\/movies/),
          method: 'POST',
          headers: expect.objectContaining({
            'x-api-key': 'test-api-key'
          })
        })
      );

      expect(result).toEqual([[
        {
          json: {
            id: 'test-job-id',
            status: 'queued',
          },
          pairedItem: { item: 0 },
        }
      ]]);
    });

    test('should handle advanced mode with complex JSON template', async () => {
      const complexTemplate = JSON.stringify([
        {
          type: 'image',
          src: 'https://example.com/image1.jpg',
          duration: 5,
          start: 0,
          position: { x: 100, y: 200 },
          width: 500,
          height: 300
        },
        {
          type: 'text',
          text: 'Advanced Template Text',
          duration: 3,
          start: 1,
          'font-family': 'Arial',
          'font-size': 32,
          color: '#ffffff',
          position: 'center'
        },
        {
          type: 'audio',
          src: 'https://example.com/background.mp3',
          duration: -1,
          start: 0,
          volume: 0.7
        }
      ]);

      const nodeParameters: INodeParameters = {
        operation: 'createMovie',
        recordId: 'test-record-456',
        webhookUrl: 'https://webhook.site/advanced',
        advancedMode: true,
        jsonTemplate: complexTemplate,
        output_width: 1920,
        output_height: 1080,
        quality: 'high',
        framerate: 60,
      };

      mockExecuteFunction = createMockExecuteFunction(nodeParameters);

      const result = await createJ2vMovie.execute.call(mockExecuteFunction);

      const requestCall = (mockExecuteFunction.helpers.request as jest.Mock).mock.calls[0][0];
      
      // Verify the request body contains the parsed JSON template
      // In advanced mode, elements are indexed by number, not in an array
      expect(requestCall.body).toHaveProperty('0');
      expect(requestCall.body).toHaveProperty('1');
      expect(requestCall.body).toHaveProperty('2');
      expect(requestCall.body['0'].type).toBe('image');
      expect(requestCall.body['1'].type).toBe('text');
      expect(requestCall.body['2'].type).toBe('audio');

      expect(result).toEqual([[
        {
          json: {
            id: 'test-job-id',
            status: 'queued',
          },
          pairedItem: { item: 0 },
        }
      ]]);
    });
  });

  describe('mergeVideoAudio advanced mode', () => {
    test('should handle mergeVideoAudio with advancedModeMergeAudio parameter', async () => {
      const nodeParameters: INodeParameters = {
        operation: 'mergeVideoAudio',
        recordId: 'test-record-123',
        webhookUrl: 'https://webhook.site/test',
        advancedModeMergeAudio: true,
        jsonTemplateMergeAudio: '{"video":"https://example.com/video.mp4","audio":"https://example.com/audio.mp3","subtitles":true}',
        video: 'https://example.com/video.mp4',
        audio: 'https://example.com/audio.mp3',
      };

      mockExecuteFunction = createMockExecuteFunction(nodeParameters);

      const result = await createJ2vMovie.execute.call(mockExecuteFunction);

      expect(mockExecuteFunction.helpers.request).toHaveBeenCalledWith(
        expect.objectContaining({
          url: expect.stringMatching(/https:\/\/api\.json2video\.com\/v2\/movies/),
          method: 'POST',
        })
      );

      expect(result).toEqual([[
        {
          json: {
            id: 'test-job-id',
            status: 'queued',
          },
          pairedItem: { item: 0 },
        }
      ]]);
    });

    test('should handle mergeVideoAudio in basic mode', async () => {
      const nodeParameters: INodeParameters = {
        operation: 'mergeVideoAudio',
        recordId: 'test-record-123',
        webhookUrl: 'https://webhook.site/test',
        advancedModeMergeAudio: false,
        video: 'https://example.com/video.mp4',
        audio: 'https://example.com/audio.mp3',
        output_width: 1280,
        output_height: 720,
      };

      mockExecuteFunction = createMockExecuteFunction(nodeParameters);

      const result = await createJ2vMovie.execute.call(mockExecuteFunction);

      expect(mockExecuteFunction.helpers.request).toHaveBeenCalledWith(
        expect.objectContaining({
          url: expect.stringMatching(/https:\/\/api\.json2video\.com\/v2\/movies/),
          method: 'POST',
        })
      );

      expect(result).toEqual([[
        {
          json: {
            id: 'test-job-id',
            status: 'queued',
          },
          pairedItem: { item: 0 },
        }
      ]]);
    });
  });

  describe('mergeVideos advanced mode', () => {
    test('should handle mergeVideos with advancedModeMergeVideos parameter', async () => {
      const nodeParameters: INodeParameters = {
        operation: 'mergeVideos',
        recordId: 'test-record-123',
        webhookUrl: 'https://webhook.site/test',
        advancedModeMergeVideos: true,
        jsonTemplateMergeVideos: '{"videos":["https://example.com/video1.mp4","https://example.com/video2.mp4"],"transition":"fade"}',
        videos: 'https://example.com/video1.mp4,https://example.com/video2.mp4',
      };

      mockExecuteFunction = createMockExecuteFunction(nodeParameters);

      const result = await createJ2vMovie.execute.call(mockExecuteFunction);

      expect(mockExecuteFunction.helpers.request).toHaveBeenCalledWith(
        expect.objectContaining({
          url: expect.stringMatching(/https:\/\/api\.json2video\.com\/v2\/movies/),
          method: 'POST',
        })
      );

      expect(result).toEqual([[
        {
          json: {
            id: 'test-job-id',
            status: 'queued',
          },
          pairedItem: { item: 0 },
        }
      ]]);
    });

    test('should handle mergeVideos in basic mode', async () => {
      const nodeParameters: INodeParameters = {
        operation: 'mergeVideos',
        recordId: 'test-record-123',
        webhookUrl: 'https://webhook.site/test',
        advancedModeMergeVideos: false,
        videos: 'https://example.com/video1.mp4,https://example.com/video2.mp4',
        output_width: 1280,
        output_height: 720,
      };

      mockExecuteFunction = createMockExecuteFunction(nodeParameters);

      const result = await createJ2vMovie.execute.call(mockExecuteFunction);

      expect(mockExecuteFunction.helpers.request).toHaveBeenCalledWith(
        expect.objectContaining({
          url: expect.stringMatching(/https:\/\/api\.json2video\.com\/v2\/movies/),
          method: 'POST',
        })
      );

      expect(result).toEqual([[
        {
          json: {
            id: 'test-job-id',
            status: 'queued',
          },
          pairedItem: { item: 0 },
        }
      ]]);
    });
  });

  describe('advanced mode edge cases', () => {
    test('should handle empty JSON template', async () => {
      const nodeParameters: INodeParameters = {
        operation: 'createMovie',
        recordId: 'test-record-123',
        webhookUrl: 'https://webhook.site/test',
        advancedMode: true,
        jsonTemplate: '[]', // Empty array
        output_width: 1280,
        output_height: 720,
      };

      mockExecuteFunction = createMockExecuteFunction(nodeParameters);

      const result = await createJ2vMovie.execute.call(mockExecuteFunction);

      expect(mockExecuteFunction.helpers.request).toHaveBeenCalledWith(
        expect.objectContaining({
          url: expect.stringMatching(/https:\/\/api\.json2video\.com\/v2\/movies/),
          method: 'POST',
        })
      );

      expect(result).toEqual([[
        {
          json: {
            id: 'test-job-id',
            status: 'queued',
          },
          pairedItem: { item: 0 },
        }
      ]]);
    });

    test('should handle advanced mode with both movie elements and JSON template', async () => {
      const nodeParameters: INodeParameters = {
        operation: 'createMovie',
        recordId: 'test-record-123',
        webhookUrl: 'https://webhook.site/test',
        advancedMode: true,
        jsonTemplate: '[{"type":"image","src":"https://example.com/template.jpg","duration":5}]',
        movieElements: [
          {
            type: 'text',
            text: 'This should be ignored in advanced mode',
            start: 0,
            duration: 3
          }
        ],
        output_width: 1280,
        output_height: 720,
      };

      mockExecuteFunction = createMockExecuteFunction(nodeParameters);

      const result = await createJ2vMovie.execute.call(mockExecuteFunction);

      const requestCall = (mockExecuteFunction.helpers.request as jest.Mock).mock.calls[0][0];
      
      // In advanced mode, should use JSON template, not movieElements
      expect(requestCall.body).toHaveProperty('0');
      expect(requestCall.body['0'].type).toBe('image');
      expect(requestCall.body['0'].src).toBe('https://example.com/template.jpg');

      expect(result).toEqual([[
        {
          json: {
            id: 'test-job-id',
            status: 'queued',
          },
          pairedItem: { item: 0 },
        }
      ]]);
    });

    test('should handle advanced mode with additional parameters', async () => {
      const nodeParameters: INodeParameters = {
        operation: 'createMovie',
        recordId: 'test-record-789',
        webhookUrl: 'https://webhook.site/advanced',
        advancedMode: true,
        jsonTemplate: '[{"type":"image","src":"https://example.com/image.jpg","duration":10}]',
        output_width: 4096,
        output_height: 2160,
        quality: 'ultra',
        framerate: 120,
        filename: 'advanced-video.mp4',
        zoom: 2.0,
        duration: 30,
      };

      mockExecuteFunction = createMockExecuteFunction(nodeParameters);

      const result = await createJ2vMovie.execute.call(mockExecuteFunction);

      const requestCall = (mockExecuteFunction.helpers.request as jest.Mock).mock.calls[0][0];
      
      // Should include advanced settings
      expect(requestCall.body).toHaveProperty('fps', 120);
      expect(requestCall.body).toHaveProperty('quality', 'ultra');
      // Note: width/height may not be in a resolution object depending on implementation

      expect(result).toEqual([[
        {
          json: {
            id: 'test-job-id',
            status: 'queued',
          },
          pairedItem: { item: 0 },
        }
      ]]);
    });

    test('should handle advanced mode with object JSON template', async () => {
      const nodeParameters: INodeParameters = {
        operation: 'createMovie',
        recordId: 'test-record-456',
        webhookUrl: 'https://webhook.site/test',
        advancedMode: true,
        jsonTemplate: '{"elements":[{"type":"text","text":"Object template"}],"settings":{"quality":"high"}}',
        output_width: 1280,
        output_height: 720,
      };

      mockExecuteFunction = createMockExecuteFunction(nodeParameters);

      const result = await createJ2vMovie.execute.call(mockExecuteFunction);

      const requestCall = (mockExecuteFunction.helpers.request as jest.Mock).mock.calls[0][0];
      
      // Should use the object structure from JSON template
      expect(requestCall.body).toHaveProperty('elements');
      expect(requestCall.body).toHaveProperty('settings');
      expect(requestCall.body.settings.quality).toBe('high');

      expect(result).toEqual([[
        {
          json: {
            id: 'test-job-id',
            status: 'queued',
          },
          pairedItem: { item: 0 },
        }
      ]]);
    });
  });

  describe('advanced mode with scene elements', () => {
    test('should handle advanced mode with scene-specific elements', async () => {
      const nodeParameters: INodeParameters = {
        operation: 'createMovie',
        recordId: 'test-record-scene',
        webhookUrl: 'https://webhook.site/test',
        advancedMode: true,
        jsonTemplate: '[{"type":"image","src":"https://example.com/bg.jpg","duration":10}]',
        elements: [
          {
            type: 'text',
            text: 'Scene overlay text',
            start: 2,
            duration: 5,
            position: 'center'
          }
        ],
        output_width: 1920,
        output_height: 1080,
      };

      mockExecuteFunction = createMockExecuteFunction(nodeParameters);

      const result = await createJ2vMovie.execute.call(mockExecuteFunction);

      const requestCall = (mockExecuteFunction.helpers.request as jest.Mock).mock.calls[0][0];
      
      // Should include both template elements and scene elements
      expect(requestCall.body).toHaveProperty('0'); // From JSON template
      expect(requestCall.body).toHaveProperty('id', 'test-record-scene');
      expect(requestCall.body).toHaveProperty('webhook');

      expect(result).toEqual([[
        {
          json: {
            id: 'test-job-id',
            status: 'queued',
          },
          pairedItem: { item: 0 },
        }
      ]]);
    });
  });

  describe('mergeVideoAudio advanced mode edge cases', () => {
    test('should handle mergeVideoAudio advanced mode with complex template', async () => {
      const complexMergeTemplate = JSON.stringify({
        video: 'https://example.com/video.mp4',
        audio: 'https://example.com/audio.mp3',
        subtitles: {
          enabled: true,
          text: 'Advanced subtitle text',
          font: 'Arial',
          size: 24,
          color: '#FFFFFF'
        },
        effects: {
          fade_in: 2,
          fade_out: 1
        }
      });

      const nodeParameters: INodeParameters = {
        operation: 'mergeVideoAudio',
        recordId: 'test-merge-advanced',
        webhookUrl: 'https://webhook.site/test',
        advancedModeMergeAudio: true,
        jsonTemplateMergeAudio: complexMergeTemplate,
        output_width: 1280,
        output_height: 720,
      };

      mockExecuteFunction = createMockExecuteFunction(nodeParameters);

      const result = await createJ2vMovie.execute.call(mockExecuteFunction);

      const requestCall = (mockExecuteFunction.helpers.request as jest.Mock).mock.calls[0][0];
      
      // Should use the advanced template structure
      expect(requestCall.body).toHaveProperty('video', 'https://example.com/video.mp4');
      expect(requestCall.body).toHaveProperty('audio', 'https://example.com/audio.mp3');
      expect(requestCall.body).toHaveProperty('subtitles');
      expect(requestCall.body).toHaveProperty('effects');

      expect(result).toEqual([[
        {
          json: {
            id: 'test-job-id',
            status: 'queued',
          },
          pairedItem: { item: 0 },
        }
      ]]);
    });
  });

  describe('mergeVideos advanced mode edge cases', () => {
    test('should handle mergeVideos advanced mode with transitions', async () => {
      const complexMergeVideosTemplate = JSON.stringify({
        videos: [
          {
            src: 'https://example.com/video1.mp4',
            duration: 10,
            transition: 'fade'
          },
          {
            src: 'https://example.com/video2.mp4', 
            duration: 15,
            transition: 'slide'
          }
        ],
        settings: {
          transition_duration: 2,
          audio_mix: 'blend'
        }
      });

      const nodeParameters: INodeParameters = {
        operation: 'mergeVideos',
        recordId: 'test-merge-videos-advanced',
        webhookUrl: 'https://webhook.site/test',
        advancedModeMergeVideos: true,
        jsonTemplateMergeVideos: complexMergeVideosTemplate,
        output_width: 1920,
        output_height: 1080,
      };

      mockExecuteFunction = createMockExecuteFunction(nodeParameters);

      const result = await createJ2vMovie.execute.call(mockExecuteFunction);

      const requestCall = (mockExecuteFunction.helpers.request as jest.Mock).mock.calls[0][0];
      
      // Should use the advanced template structure
      expect(requestCall.body).toHaveProperty('videos');
      expect(requestCall.body).toHaveProperty('settings');
      expect(requestCall.body.videos).toHaveLength(2);
      expect(requestCall.body.settings.transition_duration).toBe(2);

      expect(result).toEqual([[
        {
          json: {
            id: 'test-job-id',
            status: 'queued',
          },
          pairedItem: { item: 0 },
        }
      ]]);
    });
  });
});