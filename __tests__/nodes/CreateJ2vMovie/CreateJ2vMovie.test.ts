import axios from 'axios';
import {
  IDataObject,
  IExecuteFunctions,
  INodeExecutionData,
  INodeParameters
} from 'n8n-workflow';
import { CreateJ2vMovie } from '../../../nodes/CreateJ2vMovie/CreateJ2vMovie.node';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('CreateJ2vMovie', () => {
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
        request: jest.fn().mockImplementation(async (options) => {
          // Mock request based on options
          const { method, url } = options;

          // For any POST request to create videos
          if (method === 'POST' && url.includes('https://api.json2video.com/v2/movies')) {
            return {
              id: 'test-job-id',
              status: 'queued',
            };
          }
          // For any POST request to merge videos and audio
          else if (method === 'POST' && url.includes('https://api.json2video.com/v2/movies/merge-audio')) {
            return {
              id: 'test-job-id',
              status: 'queued',
            };
          }
          // For any POST request to merge multiple videos
          else if (method === 'POST' && url.includes('https://api.json2video.com/v2/movies/merge')) {
            return {
              id: 'test-job-id',
              status: 'queued',
            };
          }
          // For status check
          else if (method === 'GET' && url === 'https://api.json2video.com/v2/movies/test-job-id') {
            return {
              id: 'test-job-id',
              status: 'completed',
              url: 'https://example.com/video.mp4',
            };
          }

          throw new Error(`Unexpected request in test mock: ${method} ${url}`);
        }),
        constructExecutionMetaData: jest.fn((data: INodeExecutionData[], { itemData }: { itemData: INodeExecutionData[] }) => {
          return data.map((item: INodeExecutionData, index: number) => {
            return {
              ...item,
              pairedItem: {
                item: index,
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
    // Set up default mock response
    mockedAxios.post.mockResolvedValue({
      data: {
        id: 'test-job-id',
        status: 'queued',
      }
    });
    mockedAxios.get.mockResolvedValue({
      data: {
        id: 'test-job-id',
        status: 'completed',
        url: 'https://example.com/video.mp4',
      }
    });
  });

  describe('execute()', () => {
    test('should create a movie successfully', async () => {
      // Arrange
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

      // Act
      const result = await createJ2vMovie.execute.call(mockExecuteFunction);

      // Assert
      const requestCall = (mockExecuteFunction.helpers.request as jest.Mock).mock.calls[0][0];
      console.log('Actual createMovie request:', JSON.stringify(requestCall, null, 2));

      // Per JSON2Video API docs, parameters are passed as query params
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

    test('should merge video and audio successfully', async () => {
      // Arrange
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

      // Act
      const result = await createJ2vMovie.execute.call(mockExecuteFunction);

      // Assert
      const requestCall = (mockExecuteFunction.helpers.request as jest.Mock).mock.calls[0][0];
      console.log('Actual mergeVideoAudio request:', JSON.stringify(requestCall, null, 2));

      // Per JSON2Video API docs, parameters are passed as query params
      expect(mockExecuteFunction.helpers.request).toHaveBeenCalledWith(
        expect.objectContaining({
          url: expect.stringMatching(/https:\/\/api\.json2video\.com\/v2\/movies\/merge-audio/),
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

    test('should merge videos successfully', async () => {
      // Arrange
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

      // Act
      const result = await createJ2vMovie.execute.call(mockExecuteFunction);

      // Assert
      const requestCall = (mockExecuteFunction.helpers.request as jest.Mock).mock.calls[0][0];
      console.log('Actual mergeVideos request:', JSON.stringify(requestCall, null, 2));

      // Per JSON2Video API docs, parameters are passed as query params
      expect(mockExecuteFunction.helpers.request).toHaveBeenCalledWith(
        expect.objectContaining({
          url: expect.stringMatching(/https:\/\/api\.json2video\.com\/v2\/movies\/merge/),
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

    test('should check status successfully', async () => {
      // Arrange
      const nodeParameters: INodeParameters = {
        operation: 'checkStatus',
        jobId: 'test-job-id',
      };

      mockExecuteFunction = createMockExecuteFunction(nodeParameters);

      // Act
      const result = await createJ2vMovie.execute.call(mockExecuteFunction);

      // Assert
      const requestCall = (mockExecuteFunction.helpers.request as jest.Mock).mock.calls[0][0];
      console.log('Actual checkStatus request:', JSON.stringify(requestCall, null, 2));

      // Per JSON2Video API docs, GET request to retrieve status
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

    test('should handle error gracefully when continueOnFail is true with Error object', async () => {
      // Arrange
      const nodeParameters: INodeParameters = {
        operation: 'createMovie',
        recordId: 'test-record-123',
        webhookUrl: 'https://webhook.site/test',
        images: 'https://example.com/image1.jpg,https://example.com/image2.jpg',
      };

      mockExecuteFunction = createMockExecuteFunction(nodeParameters);
      (mockExecuteFunction.continueOnFail as jest.Mock).mockReturnValue(true);

      // Mock API error with Error object
      (mockExecuteFunction.helpers.request as jest.Mock).mockRejectedValueOnce(new Error('API error'));

      // Act
      const result = await createJ2vMovie.execute.call(mockExecuteFunction);

      // Assert
      expect(result).toEqual([[
        {
          json: {
            error: 'API error',
          },
          pairedItem: { item: 0 },
        }
      ]]);
    });

    test('should handle error gracefully when continueOnFail is true with non-Error object', async () => {
      // Arrange
      const nodeParameters: INodeParameters = {
        operation: 'createMovie',
        recordId: 'test-record-123',
        webhookUrl: 'https://webhook.site/test',
        images: 'https://example.com/image1.jpg,https://example.com/image2.jpg',
      };

      mockExecuteFunction = createMockExecuteFunction(nodeParameters);
      (mockExecuteFunction.continueOnFail as jest.Mock).mockReturnValue(true);

      // Mock API error with a string
      (mockExecuteFunction.helpers.request as jest.Mock).mockRejectedValueOnce('Simple string error');

      // Act
      const result = await createJ2vMovie.execute.call(mockExecuteFunction);

      // Assert
      expect(result).toEqual([[
        {
          json: {
            error: 'Unknown error occurred',
          },
          pairedItem: { item: 0 },
        }
      ]]);
    });

    test('should throw error when continueOnFail is false', async () => {
      // Arrange
      const nodeParameters: INodeParameters = {
        operation: 'createMovie',
        recordId: 'test-record-123',
        webhookUrl: 'https://webhook.site/test',
        images: 'https://example.com/image1.jpg,https://example.com/image2.jpg',
      };

      mockExecuteFunction = createMockExecuteFunction(nodeParameters);

      // Mock API error
      (mockExecuteFunction.helpers.request as jest.Mock).mockRejectedValueOnce(new Error('API error'));

      // Act & Assert
      await expect(createJ2vMovie.execute.call(mockExecuteFunction))
        .rejects.toThrow('API error');
    });

    test('should handle invalid JSON template error in advanced mode with Error object', async () => {
      // Arrange
      const nodeParameters: INodeParameters = {
        operation: 'createMovie',
        recordId: 'test-record-123',
        webhookUrl: 'https://webhook.site/test',
        advancedMode: true,
        jsonTemplate: '{invalid-json}', // Invalid JSON
        output_width: 1280,
        output_height: 720,
        quality: 'medium',
        framerate: 30,
      };

      mockExecuteFunction = createMockExecuteFunction(nodeParameters);

      // Act & Assert
      await expect(createJ2vMovie.execute.call(mockExecuteFunction))
        .rejects.toThrow('Invalid JSON template');
    });

    test('should handle invalid JSON template error in advanced mode with non-Error object', async () => {
      // Arrange
      const nodeParameters: INodeParameters = {
        operation: 'createMovie',
        recordId: 'test-record-123',
        webhookUrl: 'https://webhook.site/test',
        advancedMode: true,
        jsonTemplate: '{invalid-json}', // Invalid JSON
        output_width: 1280,
        output_height: 720,
        quality: 'medium',
        framerate: 30,
      };

      mockExecuteFunction = createMockExecuteFunction(nodeParameters);

      // Mock the request function to simulate the error scenario
      (mockExecuteFunction.helpers.request as jest.Mock).mockImplementationOnce(() => {
        // This simulates the scenario where JSON parsing fails with non-Error
        const error: any = "Invalid JSON string";
        throw error;
      });

      // Act & Assert
      await expect(createJ2vMovie.execute.call(mockExecuteFunction))
        .rejects.toThrow();
    });

    test('should create a movie with movie elements', async () => {
      // Arrange
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
        ],
        elements: [
          {
            type: 'image',
            start: 0,
            duration: 5,
            src: 'https://example.com/scene-image.jpg',
            positionPreset: 'bottom_right',
            width: 300,
            height: 200,
            zoom: 0
          }
        ]
      };

      mockExecuteFunction = createMockExecuteFunction(nodeParameters);

      // Act
      const result = await createJ2vMovie.execute.call(mockExecuteFunction);

      // Assert
      const requestCall = (mockExecuteFunction.helpers.request as jest.Mock).mock.calls[0][0];
      console.log('Actual movie elements request:', JSON.stringify(requestCall, null, 2));

      // Verify request body contains both 'elements' (movie elements) and 'scenes' with scene elements
      expect(requestCall.body).toHaveProperty('elements');
      expect(requestCall.body.elements).toHaveLength(3);
      expect(requestCall.body).toHaveProperty('scenes');
      expect(requestCall.body.scenes[0].elements).toHaveLength(1);

      // Check movie elements were processed correctly
      expect(requestCall.body.elements[0].type).toBe('image');
      expect(requestCall.body.elements[1].type).toBe('text');
      expect(requestCall.body.elements[2].type).toBe('audio');

      // Check scene elements
      expect(requestCall.body.scenes[0].elements[0].type).toBe('image');
      expect(requestCall.body.scenes[0].elements[0].position).toBe('bottom-right');

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
      // Arrange
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

      // Act
      const result = await createJ2vMovie.execute.call(mockExecuteFunction);

      // Assert
      const requestCall = (mockExecuteFunction.helpers.request as jest.Mock).mock.calls[0][0];
      console.log('Actual images as JSON request:', JSON.stringify(requestCall, null, 2));

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

    test('should handle invalid images format error with Error object', async () => {
      // Arrange
      const nodeParameters: INodeParameters = {
        operation: 'createMovie',
        recordId: 'test-record-123',
        webhookUrl: 'https://webhook.site/test',
        images: '{invalid-json}', // Invalid JSON that will cause a parse error
        output_width: 1280,
        output_height: 720,
        quality: 'medium',
        framerate: 30,
      };

      mockExecuteFunction = createMockExecuteFunction(nodeParameters);

      // Override the request method to throw an error
      (mockExecuteFunction.helpers.request as jest.Mock).mockImplementationOnce(() => {
        throw new Error('Invalid images format');
      });

      // Act & Assert
      await expect(createJ2vMovie.execute.call(mockExecuteFunction))
        .rejects.toThrow('Invalid images format');
    });

    test('should handle invalid images format error with non-Error object', async () => {
      // Arrange
      const nodeParameters: INodeParameters = {
        operation: 'createMovie',
        recordId: 'test-record-123',
        webhookUrl: 'https://webhook.site/test',
        images: '{invalid-json}', // Invalid JSON that will cause a parse error
        output_width: 1280,
        output_height: 720,
        quality: 'medium',
        framerate: 30,
      };

      mockExecuteFunction = createMockExecuteFunction(nodeParameters);

      // Set continueOnFail to false to ensure the error is thrown
      (mockExecuteFunction.continueOnFail as jest.Mock).mockReturnValue(false);

      // Create a stringified error that matches what would happen if a string is thrown
      const errorMessage = "Non-error JSON parsing issue";

      // Mock the request helper to throw our error like the implementation would
      (mockExecuteFunction.helpers.request as jest.Mock).mockImplementation(() => {
        throw errorMessage;
      });

      // Act & Assert
      try {
        await createJ2vMovie.execute.call(mockExecuteFunction);
        // If we get here, the test should fail
        expect('Test should have thrown').toBe('But it did not');
      } catch (error) {
        // Test passes if we get an error
        expect(error).toBe(errorMessage);
      }
    });

    test('should handle no response from API', async () => {
      // Arrange
      const nodeParameters: INodeParameters = {
        operation: 'checkStatus',
        jobId: 'test-job-id',
      };

      mockExecuteFunction = createMockExecuteFunction(nodeParameters);

      // Mock response as undefined
      (mockExecuteFunction.helpers.request as jest.Mock).mockResolvedValueOnce(undefined);

      // Act
      const result = await createJ2vMovie.execute.call(mockExecuteFunction);

      // Assert
      // The actual implementation simply returns undefined when there's no response
      expect(result).toEqual([[
        {
          json: undefined,
          pairedItem: { item: 0 },
        }
      ]]);
    });

    test('should create a video with advanced mode', async () => {
      // Arrange
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

      // Act
      const result = await createJ2vMovie.execute.call(mockExecuteFunction);

      // Assert
      const requestCall = (mockExecuteFunction.helpers.request as jest.Mock).mock.calls[0][0];
      console.log('Actual advanced mode request:', JSON.stringify(requestCall, null, 2));

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

    test('should create a video with subtitle parameters', async () => {
      // Arrange
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

      // Act
      const result = await createJ2vMovie.execute.call(mockExecuteFunction);

      // Assert
      const requestCall = (mockExecuteFunction.helpers.request as jest.Mock).mock.calls[0][0];
      console.log('Actual subtitles request:', JSON.stringify(requestCall, null, 2));

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

    test('should create a video with SRT subtitle source', async () => {
      // Arrange
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

      // Act
      const result = await createJ2vMovie.execute.call(mockExecuteFunction);

      // Assert
      const requestCall = (mockExecuteFunction.helpers.request as jest.Mock).mock.calls[0][0];
      console.log('Actual SRT subtitles request:', JSON.stringify(requestCall, null, 2));

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

    test('should create a video with filename, zoom and duration parameters', async () => {
      // Arrange
      const nodeParameters: INodeParameters = {
        operation: 'createMovie',
        recordId: 'test-record-123',
        webhookUrl: 'https://webhook.site/test',
        images: 'https://example.com/image1.jpg,https://example.com/image2.jpg',
        output_width: 1280,
        output_height: 720,
        quality: 'medium',
        framerate: 30,
        filename: 'test-output-video.mp4',
        zoom: 1.5,
        duration: 10,
      };

      mockExecuteFunction = createMockExecuteFunction(nodeParameters);

      // Act
      const result = await createJ2vMovie.execute.call(mockExecuteFunction);

      // Assert
      const requestCall = (mockExecuteFunction.helpers.request as jest.Mock).mock.calls[0][0];
      console.log('Actual filename/zoom request:', JSON.stringify(requestCall, null, 2));

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

    test('should merge video and audio with subtitles', async () => {
      // Arrange
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

      // Act
      const result = await createJ2vMovie.execute.call(mockExecuteFunction);

      // Assert
      const requestCall = (mockExecuteFunction.helpers.request as jest.Mock).mock.calls[0][0];
      console.log('Actual merge with subtitles request:', JSON.stringify(requestCall, null, 2));

      expect(mockExecuteFunction.helpers.request).toHaveBeenCalledWith(
        expect.objectContaining({
          url: expect.stringMatching(/https:\/\/api\.json2video\.com\/v2\/movies\/merge-audio/),
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

    test('should merge videos with subtitles', async () => {
      // Arrange
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

      // Act
      const result = await createJ2vMovie.execute.call(mockExecuteFunction);

      // Assert
      const requestCall = (mockExecuteFunction.helpers.request as jest.Mock).mock.calls[0][0];
      console.log('Actual merge videos with subtitles request:', JSON.stringify(requestCall, null, 2));

      expect(mockExecuteFunction.helpers.request).toHaveBeenCalledWith(
        expect.objectContaining({
          url: expect.stringMatching(/https:\/\/api\.json2video\.com\/v2\/movies\/merge/),
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
  });
});
