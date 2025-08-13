import {
  IDataObject,
  IExecuteFunctions,
  INodeExecutionData,
  INodeParameters
} from 'n8n-workflow';
import { CreateJ2vMovie } from '../../../nodes/CreateJ2vMovie/CreateJ2vMovie.node';

describe('CreateJ2vMovie - Operations', () => {
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

  describe('createMovie operation', () => {
    test('should create a movie with basic parameters', async () => {
      const nodeParameters: INodeParameters = {
        operation: 'createMovie',
        recordId: 'test-record-123',
        webhookUrl: 'https://webhook.site/test',
        images: 'https://example.com/image1.jpg,https://example.com/image2.jpg',
        output_width: 1280,
        output_height: 720,
        quality: 'medium',
        framerate: 30,
        crop: true,
        smoothness: 5,
        padding_color: 'black',
        horizontal_position: 'center',
        vertical_position: 'middle',
      };

      mockExecuteFunction = createMockExecuteFunction(nodeParameters);

      const result = await createJ2vMovie.execute.call(mockExecuteFunction);

      expect(mockExecuteFunction.helpers.request).toHaveBeenCalledWith(
        expect.objectContaining({
          url: expect.stringMatching(/https:\/\/api\.json2video\.com\/v2\/movies\?id=test-record-123/),
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

    test('should create a movie with movie elements', async () => {
      const nodeParameters: INodeParameters = {
        operation: 'createMovie',
        recordId: 'test-record-123',
        webhookUrl: 'https://webhook.site/test',
        output_width: 1280,
        output_height: 720,
        quality: 'medium',
        framerate: 30,
        advancedMode: false,
        movieElements: [
          {
            type: 'image',
            start: 0,
            duration: 5,
            src: 'https://example.com/movie-image.jpg',
            positionPreset: 'center',
            width: 500,
            height: 300,
            zoom: 0
          },
          {
            type: 'text',
            start: 1,
            duration: 4,
            text: 'Movie Title',
            positionPreset: 'top_center',
            'font-family': 'Arial',
            'font-size': 32,
            color: '#ffffff'
          },
          {
            type: 'audio',
            start: 0,
            duration: -2,
            src: 'https://example.com/background-music.mp3',
            volume: 0.8
          }
        ]
      };

      mockExecuteFunction = createMockExecuteFunction(nodeParameters);

      const result = await createJ2vMovie.execute.call(mockExecuteFunction);

      const requestCall = (mockExecuteFunction.helpers.request as jest.Mock).mock.calls[0][0];
      
      expect(requestCall.body).toHaveProperty('elements');
      expect(requestCall.body.elements).toHaveLength(3);
      expect(requestCall.body.elements[0].type).toBe('image');
      expect(requestCall.body.elements[1].type).toBe('text');
      expect(requestCall.body.elements[2].type).toBe('audio');

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

    test('should handle images provided as JSON', async () => {
      const nodeParameters: INodeParameters = {
        operation: 'createMovie',
        recordId: 'test-record-123',
        webhookUrl: 'https://webhook.site/test',
        images: '[{"src":"https://example.com/image1.jpg","type":"image","duration":3},{"src":"https://example.com/image2.jpg","type":"image","duration":4}]',
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

    test('should create a video with subtitle elements', async () => {
      const nodeParameters: INodeParameters = {
        operation: 'createMovie',
        recordId: 'test-record-123',
        webhookUrl: 'https://webhook.site/test',
        elements: [
          {
            type: 'subtitles',
            subtitleSourceType: 'text',
            text: 'This is some test subtitle text',
            language: 'en',
            position: 'bottom-center',
            'font-family': 'Arial',
            'font-size': 32,
            color: 'white',
            'background-color': 'rgba(0,0,0,0.5)',
            style: 'normal',
            opacity: 0.9,
            start: 1,
            duration: 5
          }
        ],
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
          method: 'POST'
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

    test('should create a video with SRT subtitle source', async () => {
      const nodeParameters: INodeParameters = {
        operation: 'createMovie',
        recordId: 'test-record-123',
        webhookUrl: 'https://webhook.site/test',
        elements: [
          {
            type: 'subtitles',
            subtitleSourceType: 'src',
            src: 'https://example.com/subtitles.srt',
            language: 'en',
            position: 'bottom-center',
            start: 0,
            duration: 10
          }
        ],
        output_width: 1280,
        output_height: 720,
        framerate: 30,
      };

      mockExecuteFunction = createMockExecuteFunction(nodeParameters);

      const result = await createJ2vMovie.execute.call(mockExecuteFunction);

      expect(mockExecuteFunction.helpers.request).toHaveBeenCalledWith(
        expect.objectContaining({
          url: expect.stringMatching(/https:\/\/api\.json2video\.com\/v2\/movies/),
          method: 'POST'
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

  describe('mergeVideoAudio operation', () => {
    test('should merge video and audio successfully', async () => {
      const nodeParameters: INodeParameters = {
        operation: 'mergeVideoAudio',
        recordId: 'test-record-123',
        webhookUrl: 'https://webhook.site/test',
        video: 'https://example.com/video.mp4',
        audio: 'https://example.com/audio.mp3',
        output_width: 1280,
        output_height: 720,
        quality: 'medium',
        framerate: 30,
        subtitles: false,
      };

      mockExecuteFunction = createMockExecuteFunction(nodeParameters);

      const result = await createJ2vMovie.execute.call(mockExecuteFunction);

      expect(mockExecuteFunction.helpers.request).toHaveBeenCalledWith(
        expect.objectContaining({
          url: expect.stringMatching(/https:\/\/api\.json2video\.com\/v2\/movies\?id=test-record-123&webhook=/),
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

    test('should merge video and audio with subtitles', async () => {
      const nodeParameters: INodeParameters = {
        operation: 'mergeVideoAudio',
        recordId: 'test-record-123',
        webhookUrl: 'https://webhook.site/test',
        video: 'https://example.com/video.mp4',
        audio: 'https://example.com/audio.mp3',
        output_width: 1280,
        output_height: 720,
        quality: 'medium',
        framerate: 30,
        subtitles: true,
        subtitles_text: 'This is a test subtitle\nSecond line of subtitles',
        subtitles_font: 'Arial',
        subtitles_color: '#FFFFFF',
        subtitles_background: '#000000',
        subtitles_size: 24,
      };

      mockExecuteFunction = createMockExecuteFunction(nodeParameters);

      const result = await createJ2vMovie.execute.call(mockExecuteFunction);

      expect(mockExecuteFunction.helpers.request).toHaveBeenCalledWith(
        expect.objectContaining({
          url: expect.stringMatching(/https:\/\/api\.json2video\.com\/v2\/movies\?id=test-record-123&webhook=/),
          method: 'POST'
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

  describe('mergeVideos operation', () => {
    test('should merge videos successfully', async () => {
      const nodeParameters: INodeParameters = {
        operation: 'mergeVideos',
        recordId: 'test-record-123',
        webhookUrl: 'https://webhook.site/test',
        videos: 'https://example.com/video1.mp4,https://example.com/video2.mp4',
        output_width: 1280,
        output_height: 720,
        quality: 'medium',
        framerate: 30,
        subtitles: false,
      };

      mockExecuteFunction = createMockExecuteFunction(nodeParameters);

      const result = await createJ2vMovie.execute.call(mockExecuteFunction);

      expect(mockExecuteFunction.helpers.request).toHaveBeenCalledWith(
        expect.objectContaining({
          url: expect.stringMatching(/https:\/\/api\.json2video\.com\/v2\/movies\?id=test-record-123&webhook=/),
          method: 'POST'
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

    test('should merge videos with subtitles', async () => {
      const nodeParameters: INodeParameters = {
        operation: 'mergeVideos',
        recordId: 'test-record-123',
        webhookUrl: 'https://webhook.site/test',
        videos: 'https://example.com/video1.mp4,https://example.com/video2.mp4',
        output_width: 1280,
        output_height: 720,
        quality: 'medium',
        framerate: 30,
        subtitles: true,
        subtitles_text: 'This is a test subtitle\nSecond line of subtitles',
        subtitles_font: 'Arial',
        subtitles_color: '#FFFFFF',
        subtitles_background: '#000000',
        subtitles_size: 24,
      };

      mockExecuteFunction = createMockExecuteFunction(nodeParameters);

      const result = await createJ2vMovie.execute.call(mockExecuteFunction);

      expect(mockExecuteFunction.helpers.request).toHaveBeenCalledWith(
        expect.objectContaining({
          url: expect.stringMatching(/https:\/\/api\.json2video\.com\/v2\/movies\?id=test-record-123&webhook=/),
          method: 'POST'
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

  describe('checkStatus operation', () => {
    test('should check status successfully', async () => {
      const nodeParameters: INodeParameters = {
        operation: 'checkStatus',
        jobId: 'test-job-id',
      };

      mockExecuteFunction = createMockExecuteFunction(nodeParameters);
      
      // Override the mock for GET request
      (mockExecuteFunction.helpers.request as jest.Mock).mockResolvedValueOnce({
        id: 'test-job-id',
        status: 'completed',
        url: 'https://example.com/video.mp4',
      });

      const result = await createJ2vMovie.execute.call(mockExecuteFunction);

      expect(mockExecuteFunction.helpers.request).toHaveBeenCalledWith(
        expect.objectContaining({
          url: 'https://api.json2video.com/v2/movies/test-job-id',
          method: 'GET',
          headers: expect.objectContaining({
            'x-api-key': 'test-api-key'
          })
        })
      );

      expect(result).toEqual([[
        {
          json: {
            id: 'test-job-id',
            status: 'completed',
            url: 'https://example.com/video.mp4',
          },
          pairedItem: { item: 0 },
        }
      ]]);
    });
  });
});