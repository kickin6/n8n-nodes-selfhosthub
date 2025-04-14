import axios from 'axios';
import { ICredentialDataDecryptedObject, IExecuteFunctions, INodeParameters } from 'n8n-workflow';
import { CreateLeonardoImage } from '../../../nodes/CreateLeonardoImage/CreateLeonardoImage.node';
import { buildRequestBody } from '../../../nodes/CreateLeonardoImage/parameterUtils';
import { createMockExecuteFunction } from '../../helpers';

// Mock axios to prevent actual API calls during testing
jest.mock('axios');
const axiosMock = axios as jest.Mocked<typeof axios>;

// Mock API responses for both POST and GET requests
beforeAll(() => {
  // Mock API responses for both POST and GET requests
  axiosMock.post.mockResolvedValue({
    data: {
      sdGenerationJob: {
        generationId: 'mock-generation-id',
        status: 'PENDING',
      },
    },
  });

  axiosMock.get.mockResolvedValue({
    data: {
      generations_by_pk: {
        id: 'mock-generation-id',
        status: 'COMPLETE',
        modelId: 'some-model-id',
        prompt: 'test prompt',
        width: 512,
        height: 512,
        generated_images: [
          {
            id: 'image-1',
            url: 'https://example.com/image1.jpg',
            nsfw: false,
            likeCount: 0,
          },
        ],
      },
    },
  });
});

// Mock getCredentials in createMockExecuteFunction
jest.mock('../../helpers', () => {
  const originalModule = jest.requireActual('../../helpers');

  return {
    ...originalModule,
    createMockExecuteFunction: (nodeParameters: INodeParameters) => {
      const mockExecute = originalModule.createMockExecuteFunction(nodeParameters);

      // Add mock credentials
      const originalGetCredentials = mockExecute.getCredentials;
      mockExecute.getCredentials = function (type: string): ICredentialDataDecryptedObject {
        if (type === 'createLeonardoImageCredentials' || type === 'leonardoAiApi') {
          return {
            apiKey: 'test-api-key',
          } as ICredentialDataDecryptedObject;
        }
        return originalGetCredentials.call(this, type);
      };

      return mockExecute;
    },
  };
});

describe('CreateLeonardoImage Node', () => {
  let createLeonardoImage: CreateLeonardoImage;
  let mockExecuteFunction: IExecuteFunctions;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    createLeonardoImage = new CreateLeonardoImage();

    // Create standard parameters
    const nodeParameters: INodeParameters = {
      prompt: 'A beautiful sunset',
      width: 1024,
      height: 768,
      numImages: 1,
      modelSelectionMethod: 'list',
      modelId: 'b24e16ff-06e3-43eb-8d33-4416c2d75876',
      advancedOptions: false,
    };

    // Create mock execute function
    mockExecuteFunction = createMockExecuteFunction(nodeParameters);
  });

  // Test for basic image generation - focusing on request body building
  test('should successfully generate an image with basic parameters', async () => {
    // Just test the parameter transformation logic itself, not the API call
    const requestBody = buildRequestBody.call(mockExecuteFunction, 0);

    expect(requestBody).toHaveProperty('prompt', 'A beautiful sunset');
    expect(requestBody).toHaveProperty('width', 1024);
    expect(requestBody).toHaveProperty('height', 768);
    expect(requestBody).toHaveProperty('num_images', 1);
    expect(requestBody).toHaveProperty('modelId', 'b24e16ff-06e3-43eb-8d33-4416c2d75876');
  });

  test('should include advanced parameters when advancedOptions is enabled', async () => {
    // Override parameters to include advanced options
    const advancedParams: INodeParameters = {
      prompt: 'A beautiful sunset',
      width: 1024,
      height: 768,
      numImages: 1,
      modelSelectionMethod: 'list',
      modelId: 'b24e16ff-06e3-43eb-8d33-4416c2d75876',
      advancedOptions: true,
      negativePrompt: 'blurry, bad quality',
      seed: '123456',
      guidanceScale: '7',
      inferenceSteps: '30',
      scheduler: 'EULER_DISCRETE',
    };

    // Create a new mock with advanced parameters
    mockExecuteFunction = createMockExecuteFunction(advancedParams);

    // Just test the parameter transformation logic itself, not the API call
    const requestBody = buildRequestBody.call(mockExecuteFunction, 0);

    expect(requestBody).toHaveProperty('negative_prompt', 'blurry, bad quality');
    expect(requestBody).toHaveProperty('seed', '123456');
    expect(requestBody).toHaveProperty('guidance_scale', 7);
    expect(requestBody).toHaveProperty('num_inference_steps', 30);
    expect(requestBody).toHaveProperty('scheduler', 'EULER_DISCRETE');
  });

  test('should handle boolean parameters correctly', async () => {
    // Override parameters to include boolean options
    const booleanParams: INodeParameters = {
      prompt: 'A beautiful sunset',
      width: 1024,
      height: 768,
      numImages: 1,
      modelSelectionMethod: 'list',
      modelId: 'b24e16ff-06e3-43eb-8d33-4416c2d75876',
      advancedOptions: true,
      promptMagic: 'true',
      tiling: 'true',
      alchemy: 'false',
    };

    // Create a new mock with boolean parameters
    mockExecuteFunction = createMockExecuteFunction(booleanParams);

    // Just test the parameter transformation logic itself, not the API call
    const requestBody = buildRequestBody.call(mockExecuteFunction, 0);

    expect(requestBody).toHaveProperty('prompt_magic', true);
    expect(requestBody).toHaveProperty('tiling', true);
    expect(requestBody).toHaveProperty('alchemy', false);
  });

  test('should correctly transform special parameters', async () => {
    // Override parameters to include special parameters
    const specialParams: INodeParameters = {
      prompt: 'A beautiful sunset',
      width: 1024,
      height: 768,
      numImages: 1,
      modelSelectionMethod: 'list',
      modelId: 'b24e16ff-06e3-43eb-8d33-4416c2d75876',
      advancedOptions: true,
      sdVersion: 'SDXL_1_0',
      promptMagic: 'true',
      promptMagicStrength: '0.7',
      promptMagicVersion: 'v3',
      transparency: 'foreground_only',
    };

    // Create a new mock with special parameters
    mockExecuteFunction = createMockExecuteFunction(specialParams);

    // Just test the parameter transformation logic itself, not the API call
    const requestBody = buildRequestBody.call(mockExecuteFunction, 0);

    expect(requestBody).toHaveProperty('sd_version', 'SDXL_1_0');
    expect(requestBody).toHaveProperty('prompt_magic', true);
    expect(requestBody).toHaveProperty('prompt_magic_strength', 0.7);
    expect(requestBody).toHaveProperty('prompt_magic_version', 'v3');
    expect(requestBody).toHaveProperty('transparency', 'foreground_only');
  });

  // Test error handling in execute method
  test('should handle errors gracefully', async () => {
    // We need to preserve the original operation parameter
    const nodeParameters = {
      prompt: 'A beautiful sunset',
      width: 1024,
      height: 768,
      numImages: 1,
      modelSelectionMethod: 'list',
      modelId: 'b24e16ff-06e3-43eb-8d33-4416c2d75876',
      advancedOptions: false,
      operation: 'createLeonardoImage',
    };

    // Mock the helpers.request function to throw an error
    const mockExecute = createMockExecuteFunction(nodeParameters);
    mockExecute.helpers.request = jest.fn().mockRejectedValueOnce(new Error('API Error'));

    const result = await createLeonardoImage.execute.call(mockExecute);

    // Check structure of result
    expect(result).toHaveLength(1);
    expect(result[0]).toHaveLength(1);

    // Verify error response format
    expect(result[0][0].json).toHaveProperty('success', false);
    expect(result[0][0].json).toHaveProperty('error', 'API Error');
  });

  // Test error handling for missing generationId
  test('should handle missing generationId in response', async () => {
    // We need to preserve the original operation parameter
    const nodeParameters = {
      prompt: 'A beautiful sunset',
      width: 1024,
      height: 768,
      numImages: 1,
      modelSelectionMethod: 'list',
      modelId: 'b24e16ff-06e3-43eb-8d33-4416c2d75876',
      advancedOptions: false,
      operation: 'createLeonardoImage',
    };

    // Create a custom mock where the first request returns an incomplete response
    const mockExecute = createMockExecuteFunction(nodeParameters);
    mockExecute.helpers.request = jest.fn().mockResolvedValueOnce({
      sdGenerationJob: {}, // Missing generationId
    });

    const result = await createLeonardoImage.execute.call(mockExecute);

    // Verify error handling
    expect(result[0][0].json).toHaveProperty('success', false);
    expect(result[0][0].json).toHaveProperty(
      'error',
      "Response does not contain the expected 'generationId' field."
    );
  });

  // Test for unsupported operation in CreateLeonardoImage.node.ts
  test('should throw error for unsupported operation', async () => {
    // Override parameters to include invalid operation
    const nodeParameters: INodeParameters = {
      prompt: 'A beautiful sunset',
      width: 1024,
      height: 768,
      numImages: 1,
      modelSelectionMethod: 'list',
      modelId: 'b24e16ff-06e3-43eb-8d33-4416c2d75876',
      advancedOptions: false,
      operation: 'invalidOperation', // Invalid operation type
    };

    // Create a new mock execute function
    mockExecuteFunction = createMockExecuteFunction(nodeParameters);

    const result = await createLeonardoImage.execute.call(mockExecuteFunction);

    // Verify error handling
    expect(result[0][0].json).toHaveProperty('success', false);
    expect(result[0][0].json).toHaveProperty('error', 'Unsupported operation: invalidOperation');
  });

  // Test for line 1551 (parsing string response)
  test('should handle string status response', async () => {
    // We need to preserve the original operation parameter
    const nodeParameters = {
      prompt: 'A beautiful sunset',
      width: 1024,
      height: 768,
      numImages: 1,
      modelSelectionMethod: 'list',
      modelId: 'b24e16ff-06e3-43eb-8d33-4416c2d75876',
      advancedOptions: false,
      operation: 'createLeonardoImage',
    };

    // Create a custom mock where responses are strings
    const mockExecute = createMockExecuteFunction(nodeParameters);

    // Mock string responses for both the initial request and status check
    mockExecute.helpers.request = jest
      .fn()
      .mockResolvedValueOnce(
        JSON.stringify({
          sdGenerationJob: {
            generationId: 'test-id',
          },
        })
      )
      .mockResolvedValueOnce(
        JSON.stringify({
          generations_by_pk: {
            id: 'test-id',
            status: 'COMPLETE',
            generated_images: [
              {
                id: 'img-1',
                url: 'https://example.com/img.jpg',
              },
            ],
          },
        })
      );

    const result = await createLeonardoImage.execute.call(mockExecute);

    // Basic verification
    expect(result[0][0].json).toHaveProperty('success', true);
  });

  // Test for line 1569 (empty generated_images)
  test('should handle missing generated_images array', async () => {
    // We need to preserve the original operation parameter
    const nodeParameters = {
      prompt: 'A beautiful sunset',
      width: 1024,
      height: 768,
      numImages: 1,
      modelSelectionMethod: 'list',
      modelId: 'b24e16ff-06e3-43eb-8d33-4416c2d75876',
      advancedOptions: false,
      operation: 'createLeonardoImage',
    };

    // Create a custom mock where generated_images is missing
    const mockExecute = createMockExecuteFunction(nodeParameters);

    // Mock responses with missing generated_images
    mockExecute.helpers.request = jest
      .fn()
      .mockResolvedValueOnce({
        sdGenerationJob: {
          generationId: 'test-id',
        },
      })
      .mockResolvedValueOnce({
        generations_by_pk: {
          id: 'test-id',
          status: 'COMPLETE',
          // No generated_images property
        },
      });

    const result = await createLeonardoImage.execute.call(mockExecute);

    // Verify empty array fallback
    expect(result[0][0].json.images).toEqual([]);
    expect(result[0][0].json.imageCount).toBe(0);
  });

  // Test for line 1587 (null imageUrl when no images)
  test('should handle empty images array for imageUrl', async () => {
    // We need to preserve the original operation parameter
    const nodeParameters = {
      prompt: 'A beautiful sunset',
      width: 1024,
      height: 768,
      numImages: 1,
      modelSelectionMethod: 'list',
      modelId: 'b24e16ff-06e3-43eb-8d33-4416c2d75876',
      advancedOptions: false,
      operation: 'createLeonardoImage',
    };

    // Create a custom mock with empty generated_images array
    const mockExecute = createMockExecuteFunction(nodeParameters);

    // Mock responses with empty generated_images array
    mockExecute.helpers.request = jest
      .fn()
      .mockResolvedValueOnce({
        sdGenerationJob: {
          generationId: 'test-id',
        },
      })
      .mockResolvedValueOnce({
        generations_by_pk: {
          id: 'test-id',
          status: 'COMPLETE',
          generated_images: [], // Empty array
        },
      });

    const result = await createLeonardoImage.execute.call(mockExecute);

    // Verify imageUrl is null
    expect(result[0][0].json).toHaveProperty('imageUrl', null);
  });
});
