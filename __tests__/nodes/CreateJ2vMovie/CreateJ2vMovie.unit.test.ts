import {
  IDataObject,
  IExecuteFunctions,
  INodeExecutionData,
  INodeParameters
} from 'n8n-workflow';
import { CreateJ2vMovie } from '@nodes/CreateJ2vMovie/CreateJ2vMovie.node';

describe('CreateJ2vMovie - Unit Tests & Coverage', () => {
  const createMockExecuteFunction = (nodeParameters: INodeParameters, inputData: any[] = [{}]) => {
    const mockExecute = {
      getNodeParameter: jest.fn((
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
      }),
      getInputData: jest.fn().mockReturnValue(inputData),
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

  describe('Element processing', () => {
    test('should handle elements when they exist', async () => {
      const nodeParameters: INodeParameters = {
        operation: 'createMovie',
        recordId: 'test-record-123',
        webhookUrl: 'https://webhook.site/test',
        'movieElements.elementValues': [{ type: 'image', src: 'test.jpg', start: 0, duration: 5 }],
        'elements.elementValues': [{ type: 'text', text: 'Hello', start: 1, duration: 3 }]
      };

      mockExecuteFunction = createMockExecuteFunction(nodeParameters);
      const result = await createJ2vMovie.execute.call(mockExecuteFunction);

      expect(result).toBeDefined();
      expect(result[0]).toHaveLength(1);
    });

    test('should continue when elements cannot be retrieved', async () => {
      const nodeParameters: INodeParameters = {
        operation: 'createMovie',
        recordId: 'test-record-123',
        webhookUrl: 'https://webhook.site/test',
      };

      const mockExecuteWithError = {
        ...createMockExecuteFunction(nodeParameters),
        getNodeParameter: jest.fn((parameterName: string, itemIndex: number, fallbackValue?: any) => {
          if (parameterName === 'movieElements.elementValues' || parameterName === 'elements.elementValues') {
            throw new Error('Parameter not found');
          }
          return nodeParameters[parameterName] !== undefined ? nodeParameters[parameterName] : fallbackValue;
        }),
        getNode: jest.fn().mockReturnValue({
          parameters: nodeParameters
        })
      } as unknown as IExecuteFunctions;

      await expect(createJ2vMovie.execute.call(mockExecuteWithError)).resolves.toBeDefined();
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

      (mockExecuteFunction.helpers.request as jest.Mock).mockResolvedValueOnce([
        { id: 'job-1', status: 'queued' },
        { id: 'job-2', status: 'queued' }
      ]);

      const result = await createJ2vMovie.execute.call(mockExecuteFunction);

      expect(result).toEqual([[
        {
          json: expect.objectContaining({
            id: 'job-1',
            status: 'queued',
          }),
          pairedItem: { item: 0 },
        },
        {
          json: expect.objectContaining({
            id: 'job-2',
            status: 'queued',
          }),
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

      (mockExecuteFunction.helpers.request as jest.Mock).mockResolvedValueOnce({
        id: 'single-job',
        status: 'processing'
      });

      const result = await createJ2vMovie.execute.call(mockExecuteFunction);

      expect(result).toEqual([[
        {
          json: expect.objectContaining({
            id: 'single-job',
            status: 'processing',
          }),
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

      mockExecuteFunction = createMockExecuteFunction(nodeParameters, [{}, {}, {}]);

      const result = await createJ2vMovie.execute.call(mockExecuteFunction);

      expect(mockExecuteFunction.helpers.request).toHaveBeenCalledTimes(3);
      expect(result[0]).toHaveLength(3);

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

      mockExecuteFunction = createMockExecuteFunction(nodeParameters, [{}, {}]);
      (mockExecuteFunction.continueOnFail as jest.Mock).mockReturnValue(true);

      (mockExecuteFunction.helpers.request as jest.Mock)
        .mockResolvedValueOnce({ id: 'success-job', status: 'queued' })
        .mockRejectedValueOnce(new Error('Second item failed'));

      const result = await createJ2vMovie.execute.call(mockExecuteFunction);

      expect(result[0]).toHaveLength(2);

      expect(result[0][0]).toEqual({
        json: expect.objectContaining({
          id: 'success-job',
          status: 'queued',
        }),
        pairedItem: { item: 0 },
      });

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

      expect(mockExecuteFunction.getNodeParameter).toHaveBeenCalledWith('advancedModeMergeVideos', 0, true);
    });
  });

  describe('URL construction edge cases', () => {
    test('should handle empty recordId and webhookUrl', async () => {
      const nodeParameters: INodeParameters = {
        operation: 'createMovie',
        recordId: '',
        webhookUrl: '',
        images: 'https://example.com/image1.jpg',
      };

      mockExecuteFunction = createMockExecuteFunction(nodeParameters);

      await createJ2vMovie.execute.call(mockExecuteFunction);

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
        recordId: 123,
        webhookUrl: null,
        images: 'https://example.com/image1.jpg',
      };

      mockExecuteFunction = createMockExecuteFunction(nodeParameters);

      await createJ2vMovie.execute.call(mockExecuteFunction);

      expect(mockExecuteFunction.helpers.request).toHaveBeenCalledWith(
        expect.objectContaining({
          url: expect.stringMatching(/https:\/\/api\.json2video\.com\/v2\/movies\?id=123&webhook=null/),
          method: 'POST',
        })
      );
    });
  });

  describe('Request body handling', () => {
    test('should build and send valid request body', async () => {
      const nodeParameters: INodeParameters = {
        operation: 'createMovie',
        recordId: 'test-record-123',
        webhookUrl: 'https://webhook.site/test',
        images: 'https://example.com/image1.jpg',
      };

      mockExecuteFunction = createMockExecuteFunction(nodeParameters);
      const result = await createJ2vMovie.execute.call(mockExecuteFunction);

      expect(result).toBeDefined();
      expect(result[0]).toHaveLength(1);

      expect(mockExecuteFunction.helpers.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          url: expect.stringContaining('api.json2video.com'),
          body: expect.objectContaining({
            id: 'test-record-123'
          }),
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'x-api-key': expect.any(String)
          }),
          json: true
        })
      );

      const response = result[0][0];
      expect(response).toHaveProperty('json');
    });
  });

  describe('Input parameter inclusion coverage', () => {
    test('should handle empty/undefined values in input parameter inclusion', async () => {
      const nodeParameters: INodeParameters = {
        operation: 'createMovie',
        recordId: '',
        webhookUrl: undefined,
        images: null,
        emptyArray: [],
        emptyObject: {},
        zeroValue: 0,
        falseValue: false,
        emptyString: '',
      };

      mockExecuteFunction = createMockExecuteFunction(nodeParameters);

      const result = await createJ2vMovie.execute.call(mockExecuteFunction);

      expect(result).toBeDefined();
      expect(result[0]).toHaveLength(1);
      
      const responseJson = result[0][0].json;
      expect(responseJson).toHaveProperty('input_operation', 'createMovie');
      expect(responseJson).toHaveProperty('input_zeroValue', 0);
      expect(responseJson).toHaveProperty('input_falseValue', false);
    });

    test('should cover false branch of includeInputParams when disabled', async () => {
      const nodeParameters: INodeParameters = {
        operation: 'createMovie',
        recordId: 'test-123',
        webhookUrl: 'https://webhook.site/test',
        includeInputParams: false,
      };

      mockExecuteFunction = createMockExecuteFunction(nodeParameters);

      const result = await createJ2vMovie.execute.call(mockExecuteFunction);

      expect(result).toBeDefined();
      const responseJson = result[0][0].json;
      expect(responseJson).not.toHaveProperty('input_operation');
      expect(responseJson).not.toHaveProperty('input_recordId');
    });

    test('should handle getNode() throwing an error', async () => {
      const nodeParameters: INodeParameters = {
        operation: 'createMovie',
        recordId: 'test-123',
        webhookUrl: 'https://webhook.site/test',
      };

      const mockExecuteWithError = {
        ...createMockExecuteFunction(nodeParameters),
        getNode: jest.fn().mockImplementation(() => {
          throw new Error('Node not available');
        })
      } as unknown as IExecuteFunctions;

      (mockExecuteWithError.continueOnFail as jest.Mock).mockReturnValue(true);

      const result = await createJ2vMovie.execute.call(mockExecuteWithError);

      expect(result).toBeDefined();
      expect(result[0]).toHaveLength(1);
      expect(result[0][0].json).toHaveProperty('error', 'Node not available');
    });

    test('should handle getNode() returning null', async () => {
      const nodeParameters: INodeParameters = {
        operation: 'createMovie',
        recordId: 'test-123',
        webhookUrl: 'https://webhook.site/test',
      };

      const mockExecuteWithNull = {
        ...createMockExecuteFunction(nodeParameters),
        getNode: jest.fn().mockReturnValue(null)
      } as unknown as IExecuteFunctions;

      (mockExecuteWithNull.continueOnFail as jest.Mock).mockReturnValue(true);

      const result = await createJ2vMovie.execute.call(mockExecuteWithNull);

      expect(result).toBeDefined();
      expect(result[0]).toHaveLength(1);
      expect(result[0][0].json).toHaveProperty('error');
    });

    test('should handle getNode() returning object without parameters', async () => {
      const nodeParameters: INodeParameters = {
        operation: 'createMovie',
        recordId: 'test-123',
        webhookUrl: 'https://webhook.site/test',
      };

      const mockExecuteWithoutParams = {
        ...createMockExecuteFunction(nodeParameters),
        getNode: jest.fn().mockReturnValue({ id: 'node-id', name: 'test-node' })
      } as unknown as IExecuteFunctions;

      (mockExecuteWithoutParams.continueOnFail as jest.Mock).mockReturnValue(true);

      const result = await createJ2vMovie.execute.call(mockExecuteWithoutParams);

      expect(result).toBeDefined();
      expect(result[0]).toHaveLength(1);
      expect(result[0][0].json).toHaveProperty('error');
    });

    test('should handle circular reference objects gracefully', async () => {
      const circularObj: any = { name: 'test' };
      circularObj.self = circularObj;
      
      const nodeParameters: INodeParameters = {
        operation: 'createMovie',
        recordId: 'test-123',
        webhookUrl: 'https://webhook.site/test',
        circularRef: circularObj,
      };

      mockExecuteFunction = createMockExecuteFunction(nodeParameters);

      await expect(createJ2vMovie.execute.call(mockExecuteFunction)).resolves.toBeDefined();
    });
  });
});