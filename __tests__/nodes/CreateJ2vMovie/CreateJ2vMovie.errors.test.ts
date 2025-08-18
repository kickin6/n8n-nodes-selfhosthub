import {
  IDataObject,
  IExecuteFunctions,
  INodeExecutionData,
  INodeParameters
} from 'n8n-workflow';
import { CreateJ2vMovie } from '@nodes/CreateJ2vMovie/CreateJ2vMovie.node';

describe('CreateJ2vMovie - Error Handling', () => {
  const createMockExecuteFunction = (nodeParameters: INodeParameters) => {
    const mockExecute = {
      getNodeParameter: (
        parameterName: string,
        itemIndex: number,
        fallbackValue?: any
      ) => {
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
      getNode: jest.fn().mockReturnValue({
        parameters: nodeParameters
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
        jsonTemplate: '{invalid-json}',
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
        jsonTemplate: '{invalid-json}',
        output_width: 1280,
        output_height: 720,
      };

      mockExecuteFunction = createMockExecuteFunction(nodeParameters);
      (mockExecuteFunction.continueOnFail as jest.Mock).mockReturnValue(true);

      (mockExecuteFunction.helpers.request as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid JSON template: Expected property name or \'}\' in JSON at position 1 (line 1 column 2)');
      });

      const result = await createJ2vMovie.execute.call(mockExecuteFunction);

      expect(result).toEqual([[
        {
          json: {
            error: expect.stringMatching(/Invalid JSON template: Expected property name or '\}' in JSON at position 1/),
          },
          pairedItem: {
            item: 0,
          },
        },
      ]]);
    });

    test('should handle invalid images format error', async () => {
      const nodeParameters: INodeParameters = {
        operation: 'createMovie',
        recordId: 'test-record-123',
        webhookUrl: 'https://webhook.site/test',
        images: '{invalid-json-images}',
        output_width: 1280,
        output_height: 720,
      };

      mockExecuteFunction = createMockExecuteFunction(nodeParameters);
      (mockExecuteFunction.continueOnFail as jest.Mock).mockReturnValue(true);

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
        getCredentials: jest.fn().mockResolvedValue({ apiKey: '' })
      } as unknown as IExecuteFunctions;

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
        recordId: 'test-record-123',
        webhookUrl: 'https://webhook.site/test',
        images: 'https://example.com/image1.jpg',
      };

      mockExecuteFunction = createMockExecuteFunction(nodeParameters);
      (mockExecuteFunction.continueOnFail as jest.Mock).mockReturnValue(true);

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

      (mockExecuteFunction.helpers.request as jest.Mock).mockResolvedValueOnce(undefined);

      const result = await createJ2vMovie.execute.call(mockExecuteFunction);

      expect(result).toEqual([[
        {
          json: expect.objectContaining({
            input_jobId: 'test-job-id',
            input_operation: 'checkStatus',
          }),
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

      (mockExecuteFunction.helpers.request as jest.Mock).mockResolvedValueOnce(null);

      const result = await createJ2vMovie.execute.call(mockExecuteFunction);

      expect(result).toEqual([[
        {
          json: expect.objectContaining({
            input_images: 'https://example.com/image1.jpg',
            input_operation: 'createMovie',
            input_recordId: 'test-record-123',
            input_webhookUrl: 'https://webhook.site/test',
          }),
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

      (mockExecuteFunction.helpers.request as jest.Mock).mockResolvedValueOnce('invalid response');

      const result = await createJ2vMovie.execute.call(mockExecuteFunction);

      expect(result).toEqual([[
        {
          json: expect.objectContaining({
            input_images: 'https://example.com/image1.jpg',
            input_operation: 'createMovie',
            input_recordId: 'test-record-123',
            input_webhookUrl: 'https://webhook.site/test',
          }),
          pairedItem: { item: 0 },
        }
      ]]);
    });
  });
});