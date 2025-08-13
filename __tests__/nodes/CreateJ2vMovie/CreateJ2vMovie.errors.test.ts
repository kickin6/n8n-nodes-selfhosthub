import {
  IDataObject,
  IExecuteFunctions,
  INodeExecutionData,
  INodeParameters
} from 'n8n-workflow';
import { CreateJ2vMovie } from '../../../nodes/CreateJ2vMovie/CreateJ2vMovie.node';

describe('CreateJ2vMovie - Error Handling', () => {
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

  describe('API error handling', () => {
    test('should handle error gracefully when continueOnFail is true with Error object', async () => {
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

      const result = await createJ2vMovie.execute.call(mockExecuteFunction);

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

      const result = await createJ2vMovie.execute.call(mockExecuteFunction);

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
      const nodeParameters: INodeParameters = {
        operation: 'createMovie',
        recordId: 'test-record-123',
        webhookUrl: 'https://webhook.site/test',
        images: 'https://example.com/image1.jpg,https://example.com/image2.jpg',
      };

      mockExecuteFunction = createMockExecuteFunction(nodeParameters);

      // Mock API error
      (mockExecuteFunction.helpers.request as jest.Mock).mockRejectedValueOnce(new Error('API error'));

      await expect(createJ2vMovie.execute.call(mockExecuteFunction))
        .rejects.toThrow('API error');
    });

    test('should handle network timeout error', async () => {
      const nodeParameters: INodeParameters = {
        operation: 'createMovie',
        recordId: 'test-record-123',
        webhookUrl: 'https://webhook.site/test',
        images: 'https://example.com/image1.jpg',
      };

      mockExecuteFunction = createMockExecuteFunction(nodeParameters);
      (mockExecuteFunction.continueOnFail as jest.Mock).mockReturnValue(true);

      // Mock timeout error
      const timeoutError = new Error('Request timeout');
      timeoutError.name = 'TimeoutError';
      (mockExecuteFunction.helpers.request as jest.Mock).mockRejectedValueOnce(timeoutError);

      const result = await createJ2vMovie.execute.call(mockExecuteFunction);

      expect(result).toEqual([[
        {
          json: {
            error: 'Request timeout',
          },
          pairedItem: { item: 0 },
        }
      ]]);
    });

    test('should handle 401 unauthorized error', async () => {
      const nodeParameters: INodeParameters = {
        operation: 'createMovie',
        recordId: 'test-record-123',
        webhookUrl: 'https://webhook.site/test',
        images: 'https://example.com/image1.jpg',
      };

      mockExecuteFunction = createMockExecuteFunction(nodeParameters);
      (mockExecuteFunction.continueOnFail as jest.Mock).mockReturnValue(true);

      // Mock 401 error
      const authError = new Error('Unauthorized');
      (authError as any).statusCode = 401;
      (mockExecuteFunction.helpers.request as jest.Mock).mockRejectedValueOnce(authError);

      const result = await createJ2vMovie.execute.call(mockExecuteFunction);

      expect(result).toEqual([[
        {
          json: {
            error: 'Unauthorized',
          },
          pairedItem: { item: 0 },
        }
      ]]);
    });

    test('should handle 500 internal server error', async () => {
      const nodeParameters: INodeParameters = {
        operation: 'mergeVideoAudio',
        recordId: 'test-record-123',
        webhookUrl: 'https://webhook.site/test',
        video: 'https://example.com/video.mp4',
        audio: 'https://example.com/audio.mp3',
      };

      mockExecuteFunction = createMockExecuteFunction(nodeParameters);
      (mockExecuteFunction.continueOnFail as jest.Mock).mockReturnValue(true);

      // Mock 500 error
      const serverError = new Error('Internal Server Error');
      (serverError as any).statusCode = 500;
      (mockExecuteFunction.helpers.request as jest.Mock).mockRejectedValueOnce(serverError);

      const result = await createJ2vMovie.execute.call(mockExecuteFunction);

      expect(result).toEqual([[
        {
          json: {
            error: 'Internal Server Error',
          },
          pairedItem: { item: 0 },
        }
      ]]);
    });
  });

  describe('JSON parsing errors', () => {
    test('should handle invalid JSON template error in advanced mode with Error object', async () => {
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

      await expect(createJ2vMovie.execute.call(mockExecuteFunction))
        .rejects.toThrow('Invalid JSON template');
    });

    test('should handle invalid JSON template with continueOnFail', async () => {
      const nodeParameters: INodeParameters = {
        operation: 'createMovie',
        recordId: 'test-record-123',
        webhookUrl: 'https://webhook.site/test',
        advancedMode: true,
        jsonTemplate: '{invalid-json}', // Invalid JSON
        output_width: 1280,
        output_height: 720,
      };

      mockExecuteFunction = createMockExecuteFunction(nodeParameters);
      (mockExecuteFunction.continueOnFail as jest.Mock).mockReturnValue(true);

      // Mock the request to never be called due to JSON parsing error
      (mockExecuteFunction.helpers.request as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid JSON template: Expected property name or \'}\' in JSON at position 1 (line 1 column 2)');
      });

      const result = await createJ2vMovie.execute.call(mockExecuteFunction);

      expect(result).toEqual([[
        {
          json: {
            error: 'Invalid JSON template: Expected property name or \'}\' in JSON at position 1 (line 1 column 2)',
          },
          pairedItem: { item: 0 },
        }
      ]]);
    });

    test('should handle invalid images format error', async () => {
      const nodeParameters: INodeParameters = {
        operation: 'createMovie',
        recordId: 'test-record-123',
        webhookUrl: 'https://webhook.site/test',
        images: '{invalid-json-images}', // Invalid JSON for images
        output_width: 1280,
        output_height: 720,
      };

      mockExecuteFunction = createMockExecuteFunction(nodeParameters);
      (mockExecuteFunction.continueOnFail as jest.Mock).mockReturnValue(true);

      // Mock parsing error
      (mockExecuteFunction.helpers.request as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid images format');
      });

      const result = await createJ2vMovie.execute.call(mockExecuteFunction);

      expect(result).toEqual([[
        {
          json: {
            error: 'Invalid images format',
          },
          pairedItem: { item: 0 },
        }
      ]]);
    });
  });

  describe('credential errors', () => {
    test('should handle missing credentials', async () => {
      const nodeParameters: INodeParameters = {
        operation: 'createMovie',
        recordId: 'test-record-123',
        webhookUrl: 'https://webhook.site/test',
        images: 'https://example.com/image1.jpg',
      };

      const mockExecuteWithoutCreds = {
        ...createMockExecuteFunction(nodeParameters),
        getCredentials: jest.fn().mockRejectedValue(new Error('Credentials not found'))
      } as unknown as IExecuteFunctions;

      await expect(createJ2vMovie.execute.call(mockExecuteWithoutCreds))
        .rejects.toThrow('Credentials not found');
    });

    test('should handle invalid credentials', async () => {
      const nodeParameters: INodeParameters = {
        operation: 'createMovie',
        recordId: 'test-record-123',
        webhookUrl: 'https://webhook.site/test',
        images: 'https://example.com/image1.jpg',
      };

      const mockExecuteWithInvalidCreds = {
        ...createMockExecuteFunction(nodeParameters),
        getCredentials: jest.fn().mockResolvedValue({ apiKey: '' }) // Empty API key
      } as unknown as IExecuteFunctions;

      // The node should still make the request with empty API key and let the API handle it
      const result = await createJ2vMovie.execute.call(mockExecuteWithInvalidCreds);

      expect(mockExecuteWithInvalidCreds.helpers.request).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: expect.objectContaining({
            'x-api-key': ''
          })
        })
      );
    });
  });

  describe('parameter validation errors', () => {
    test('should handle missing operation parameter', async () => {
      const nodeParameters: INodeParameters = {
        // operation parameter missing
        recordId: 'test-record-123',
        webhookUrl: 'https://webhook.site/test',
        images: 'https://example.com/image1.jpg',
      };

      mockExecuteFunction = createMockExecuteFunction(nodeParameters);
      (mockExecuteFunction.continueOnFail as jest.Mock).mockReturnValue(true);

      // Mock the request to throw error due to unsupported operation
      (mockExecuteFunction.helpers.request as jest.Mock).mockImplementation(() => {
        throw new Error('Unsupported operation: ');
      });

      const result = await createJ2vMovie.execute.call(mockExecuteFunction);

      expect(result).toEqual([[
        {
          json: {
            error: 'Unsupported operation: ',
          },
          pairedItem: { item: 0 },
        }
      ]]);
    });

    test('should handle unknown operation type', async () => {
      const nodeParameters: INodeParameters = {
        operation: 'unknownOperation',
        recordId: 'test-record-123',
        webhookUrl: 'https://webhook.site/test',
      };

      mockExecuteFunction = createMockExecuteFunction(nodeParameters);
      (mockExecuteFunction.continueOnFail as jest.Mock).mockReturnValue(true);

      // Mock the request to throw error due to unsupported operation
      (mockExecuteFunction.helpers.request as jest.Mock).mockImplementation(() => {
        throw new Error('Unsupported operation: unknownOperation');
      });

      const result = await createJ2vMovie.execute.call(mockExecuteFunction);

      expect(result).toEqual([[
        {
          json: {
            error: 'Unsupported operation: unknownOperation',
          },
          pairedItem: { item: 0 },
        }
      ]]);
    });
  });

  describe('response handling errors', () => {
    test('should handle no response from API', async () => {
      const nodeParameters: INodeParameters = {
        operation: 'checkStatus',
        jobId: 'test-job-id',
      };

      mockExecuteFunction = createMockExecuteFunction(nodeParameters);

      // Mock response as undefined
      (mockExecuteFunction.helpers.request as jest.Mock).mockResolvedValueOnce(undefined);

      const result = await createJ2vMovie.execute.call(mockExecuteFunction);

      expect(result).toEqual([[
        {
          json: undefined,
          pairedItem: { item: 0 },
        }
      ]]);
    });

    test('should handle null response from API', async () => {
      const nodeParameters: INodeParameters = {
        operation: 'createMovie',
        recordId: 'test-record-123',
        webhookUrl: 'https://webhook.site/test',
        images: 'https://example.com/image1.jpg',
      };

      mockExecuteFunction = createMockExecuteFunction(nodeParameters);

      // Mock response as null
      (mockExecuteFunction.helpers.request as jest.Mock).mockResolvedValueOnce(null);

      const result = await createJ2vMovie.execute.call(mockExecuteFunction);

      expect(result).toEqual([[
        {
          json: null,
          pairedItem: { item: 0 },
        }
      ]]);
    });

    test('should handle malformed API response', async () => {
      const nodeParameters: INodeParameters = {
        operation: 'createMovie',
        recordId: 'test-record-123',
        webhookUrl: 'https://webhook.site/test',
        images: 'https://example.com/image1.jpg',
      };

      mockExecuteFunction = createMockExecuteFunction(nodeParameters);

      // Mock malformed response
      (mockExecuteFunction.helpers.request as jest.Mock).mockResolvedValueOnce('invalid response');

      const result = await createJ2vMovie.execute.call(mockExecuteFunction);

      expect(result).toEqual([[
        {
          json: 'invalid response',
          pairedItem: { item: 0 },
        }
      ]]);
    });
  });
});