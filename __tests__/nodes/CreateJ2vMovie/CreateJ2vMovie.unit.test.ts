import {
  IDataObject,
  IExecuteFunctions,
  INodeExecutionData,
  INodeParameters
} from 'n8n-workflow';
import { CreateJ2vMovie } from '../../../nodes/CreateJ2vMovie/CreateJ2vMovie.node';

describe('CreateJ2vMovie - Unit Tests & Coverage', () => {
  /**
   * Helper function to create a mock execute function with given parameters
   */
  const createMockExecuteFunction = (nodeParameters: INodeParameters, inputData: any[] = [{}]) => {
    const mockExecute = {
      getNodeParameter: jest.fn((
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
      }),
      getInputData: jest.fn().mockReturnValue(inputData),
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

  describe('Debug logging coverage (line 137)', () => {
    test('should handle debug logging when elements exist', async () => {
      const nodeParameters: INodeParameters = {
        operation: 'createMovie',
        recordId: 'test-record-123',
        webhookUrl: 'https://webhook.site/test',
        images: 'https://example.com/image1.jpg',
        // These should trigger the debug logging in the try block
        movieElements: [{ type: 'image', src: 'test.jpg', start: 0, duration: 5 }],
        elements: [{ type: 'text', text: 'Hello', start: 1, duration: 3 }]
      };

      mockExecuteFunction = createMockExecuteFunction(nodeParameters);

      // Spy on console.log to verify the debug logging is hit
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await createJ2vMovie.execute.call(mockExecuteFunction);

      // Verify debug logging was called (this should hit line 137)
      expect(consoleSpy).toHaveBeenCalledWith('DEBUG - movieElements:', expect.any(String));
      expect(consoleSpy).toHaveBeenCalledWith('DEBUG - elements:', expect.any(String));

      consoleSpy.mockRestore();
    });

    test('should handle debug logging error when elements cannot be retrieved', async () => {
      const nodeParameters: INodeParameters = {
        operation: 'createMovie',
        recordId: 'test-record-123',
        webhookUrl: 'https://webhook.site/test',
        images: 'https://example.com/image1.jpg',
      };

      // Create a mock that throws an error when getting elements
      const mockExecuteWithError = {
        ...createMockExecuteFunction(nodeParameters),
        getNodeParameter: jest.fn((parameterName: string, itemIndex: number, fallbackValue?: any) => {
          if (parameterName === 'movieElements.elementValues' || parameterName === 'elements.elementValues') {
            throw new Error('Parameter not found');
          }
          return nodeParameters[parameterName] !== undefined ? nodeParameters[parameterName] : fallbackValue;
        })
      } as unknown as IExecuteFunctions;

      // Spy on console.log to verify error logging
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await createJ2vMovie.execute.call(mockExecuteWithError);

      // Assert that error logging was called
      expect(consoleSpy).toHaveBeenCalledWith('DEBUG - Error getting elements:', expect.any(Error));

      consoleSpy.mockRestore();
    });
  });

  describe('Array response handling (line 190)', () => {
    test('should handle API response as array', async () => {
      const nodeParameters: INodeParameters = {
        operation: 'createMovie',
        recordId: 'test-record-123',
        webhookUrl: 'https://webhook.site/test',
        images: 'https://example.com/image1.jpg',
      };

      mockExecuteFunction = createMockExecuteFunction(nodeParameters);

      // Mock API to return an array (this should hit line 190 - the Array.isArray check)
      (mockExecuteFunction.helpers.request as jest.Mock).mockResolvedValueOnce([
        { id: 'job-1', status: 'queued' },
        { id: 'job-2', status: 'queued' }
      ]);

      const result = await createJ2vMovie.execute.call(mockExecuteFunction);

      // Should handle array response properly
      expect(result).toEqual([[
        {
          json: { id: 'job-1', status: 'queued' },
          pairedItem: { item: 0 },
        },
        {
          json: { id: 'job-2', status: 'queued' },
          pairedItem: { item: 1 },
        }
      ]]);
    });

    test('should handle single object response (non-array)', async () => {
      const nodeParameters: INodeParameters = {
        operation: 'createMovie',
        recordId: 'test-record-123',
        webhookUrl: 'https://webhook.site/test',
        images: 'https://example.com/image1.jpg',
      };

      mockExecuteFunction = createMockExecuteFunction(nodeParameters);

      // Mock API to return single object (this goes to the else branch)
      (mockExecuteFunction.helpers.request as jest.Mock).mockResolvedValueOnce({
        id: 'single-job',
        status: 'processing'
      });

      const result = await createJ2vMovie.execute.call(mockExecuteFunction);

      // Should wrap single object in array
      expect(result).toEqual([[
        {
          json: { id: 'single-job', status: 'processing' },
          pairedItem: { item: 0 },
        }
      ]]);
    });
  });

  describe('Multiple input items processing', () => {
    test('should handle multiple input items', async () => {
      const nodeParameters: INodeParameters = {
        operation: 'createMovie',
        recordId: 'test-record-123',
        webhookUrl: 'https://webhook.site/test',
        images: 'https://example.com/image1.jpg',
      };

      // Create mock with multiple input items
      mockExecuteFunction = createMockExecuteFunction(nodeParameters, [{}, {}, {}]); // 3 items

      const result = await createJ2vMovie.execute.call(mockExecuteFunction);

      // Should process all 3 items
      expect(mockExecuteFunction.helpers.request).toHaveBeenCalledTimes(3);
      expect(result[0]).toHaveLength(3); // 3 results
      
      // Each result should have correct pairedItem
      expect(result[0][0].pairedItem).toEqual({ item: 0 });
      expect(result[0][1].pairedItem).toEqual({ item: 1 });
      expect(result[0][2].pairedItem).toEqual({ item: 2 });
    });

    test('should handle mixed success and error in multiple items with continueOnFail', async () => {
      const nodeParameters: INodeParameters = {
        operation: 'createMovie',
        recordId: 'test-record-123',
        webhookUrl: 'https://webhook.site/test',
        images: 'https://example.com/image1.jpg',
      };

      mockExecuteFunction = createMockExecuteFunction(nodeParameters, [{}, {}]); // 2 items
      (mockExecuteFunction.continueOnFail as jest.Mock).mockReturnValue(true);

      // Mock first call to succeed, second to fail
      (mockExecuteFunction.helpers.request as jest.Mock)
        .mockResolvedValueOnce({ id: 'success-job', status: 'queued' })
        .mockRejectedValueOnce(new Error('Second item failed'));

      const result = await createJ2vMovie.execute.call(mockExecuteFunction);

      expect(result[0]).toHaveLength(2);
      
      // First item should succeed
      expect(result[0][0]).toEqual({
        json: { id: 'success-job', status: 'queued' },
        pairedItem: { item: 0 },
      });
      
      // Second item should be error
      expect(result[0][1]).toEqual({
        json: { error: 'Second item failed' },
        pairedItem: { item: 1 },
      });
    });
  });

  describe('Advanced mode parameter detection', () => {
    test('should detect advancedMode for createMovie operation', async () => {
      const nodeParameters: INodeParameters = {
        operation: 'createMovie',
        advancedMode: true,
        jsonTemplate: '[]',
        recordId: 'test-record-123',
        webhookUrl: 'https://webhook.site/test',
      };

      mockExecuteFunction = createMockExecuteFunction(nodeParameters);

      await createJ2vMovie.execute.call(mockExecuteFunction);

      // Should call getNodeParameter for 'advancedMode'
      expect(mockExecuteFunction.getNodeParameter).toHaveBeenCalledWith('advancedMode', 0, true);
    });

    test('should detect advancedModeMergeAudio for mergeVideoAudio operation', async () => {
      const nodeParameters: INodeParameters = {
        operation: 'mergeVideoAudio',
        advancedModeMergeAudio: true,
        jsonTemplateMergeAudio: '{}',
        recordId: 'test-record-123',
        webhookUrl: 'https://webhook.site/test',
      };

      mockExecuteFunction = createMockExecuteFunction(nodeParameters);

      await createJ2vMovie.execute.call(mockExecuteFunction);

      // Should call getNodeParameter for 'advancedModeMergeAudio'
      expect(mockExecuteFunction.getNodeParameter).toHaveBeenCalledWith('advancedModeMergeAudio', 0, true);
    });

    test('should detect advancedModeMergeVideos for mergeVideos operation', async () => {
      const nodeParameters: INodeParameters = {
        operation: 'mergeVideos',
        advancedModeMergeVideos: true,
        jsonTemplateMergeVideos: '{}',
        recordId: 'test-record-123',
        webhookUrl: 'https://webhook.site/test',
      };

      mockExecuteFunction = createMockExecuteFunction(nodeParameters);

      await createJ2vMovie.execute.call(mockExecuteFunction);

      // Should call getNodeParameter for 'advancedModeMergeVideos'
      expect(mockExecuteFunction.getNodeParameter).toHaveBeenCalledWith('advancedModeMergeVideos', 0, true);
    });
  });

  describe('URL construction edge cases', () => {
    test('should handle empty recordId and webhookUrl', async () => {
      const nodeParameters: INodeParameters = {
        operation: 'createMovie',
        recordId: '', // Empty string
        webhookUrl: '', // Empty string
        images: 'https://example.com/image1.jpg',
      };

      mockExecuteFunction = createMockExecuteFunction(nodeParameters);

      await createJ2vMovie.execute.call(mockExecuteFunction);

      // URL should still be constructed with empty values
      expect(mockExecuteFunction.helpers.request).toHaveBeenCalledWith(
        expect.objectContaining({
          url: expect.stringMatching(/https:\/\/api\.json2video\.com\/v2\/movies\?id=&webhook=/),
          method: 'POST',
        })
      );
    });

    test('should handle special characters in webhookUrl', async () => {
      const nodeParameters: INodeParameters = {
        operation: 'createMovie',
        recordId: 'test-123',
        webhookUrl: 'https://webhook.site/test?param=value&other=123',
        images: 'https://example.com/image1.jpg',
      };

      mockExecuteFunction = createMockExecuteFunction(nodeParameters);

      await createJ2vMovie.execute.call(mockExecuteFunction);

      // webhookUrl should be properly encoded
      expect(mockExecuteFunction.helpers.request).toHaveBeenCalledWith(
        expect.objectContaining({
          url: expect.stringContaining('webhook=https%3A%2F%2Fwebhook.site%2Ftest%3Fparam%3Dvalue%26other%3D123'),
          method: 'POST',
        })
      );
    });
  });

  describe('Switch case coverage', () => {
    test('should handle checkStatus operation switch case', async () => {
      const nodeParameters: INodeParameters = {
        operation: 'checkStatus',
        jobId: 'test-job-123',
      };

      mockExecuteFunction = createMockExecuteFunction(nodeParameters);

      await createJ2vMovie.execute.call(mockExecuteFunction);

      // Should hit the checkStatus case in the switch statement
      expect(mockExecuteFunction.helpers.request).toHaveBeenCalledWith(
        expect.objectContaining({
          url: 'https://api.json2video.com/v2/movies/test-job-123',
          method: 'GET',
        })
      );
    });

    test('should handle unknown operation falling through switch', async () => {
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

  describe('Edge case parameter handling', () => {
    test('should handle undefined operation parameter', async () => {
      const nodeParameters: INodeParameters = {
        // operation parameter missing/undefined
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

      // Should default to empty string and handle error
      expect(mockExecuteFunction.getNodeParameter).toHaveBeenCalledWith('operation', 0, '');
      expect(result).toEqual([[
        {
          json: {
            error: 'Unsupported operation: ',
          },
          pairedItem: { item: 0 },
        }
      ]]);
    });

    test('should handle String() conversion for recordId and webhookUrl', async () => {
      const nodeParameters: INodeParameters = {
        operation: 'createMovie',
        recordId: 123, // Number instead of string
        webhookUrl: null, // null value
        images: 'https://example.com/image1.jpg',
      };

      mockExecuteFunction = createMockExecuteFunction(nodeParameters);

      await createJ2vMovie.execute.call(mockExecuteFunction);

      // Should convert to strings
      expect(mockExecuteFunction.helpers.request).toHaveBeenCalledWith(
        expect.objectContaining({
          url: expect.stringMatching(/https:\/\/api\.json2video\.com\/v2\/movies\?id=123&webhook=null/),
          method: 'POST',
        })
      );
    });
  });

  describe('Request body debugging', () => {
    test('should log request body for debugging', async () => {
      const nodeParameters: INodeParameters = {
        operation: 'createMovie',
        recordId: 'test-record-123',
        webhookUrl: 'https://webhook.site/test',
        images: 'https://example.com/image1.jpg',
      };

      mockExecuteFunction = createMockExecuteFunction(nodeParameters);

      // Spy on console.log to verify request body logging
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await createJ2vMovie.execute.call(mockExecuteFunction);

      // Should log request body and API response
      expect(consoleSpy).toHaveBeenCalledWith('DEBUG - Request Body after buildRequestBody:', expect.any(String));
      expect(consoleSpy).toHaveBeenCalledWith('DEBUG - Request Body:', expect.any(String));
      expect(consoleSpy).toHaveBeenCalledWith('DEBUG - API Response:', expect.any(String));

      consoleSpy.mockRestore();
    });
  });
});