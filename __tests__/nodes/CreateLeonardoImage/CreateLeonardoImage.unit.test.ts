import axios from 'axios';
import { ICredentialDataDecryptedObject, IExecuteFunctions, INodeParameters } from 'n8n-workflow';
import { CreateLeonardoImage } from '../../../nodes/CreateLeonardoImage/CreateLeonardoImage.node';
import { buildRequestBody } from '../../../nodes/CreateLeonardoImage/parameterUtils';
import { createLeonardoMockFunction } from '../../shared/leonardo-helpers';

jest.mock('axios');
const axiosMock = axios as jest.Mocked<typeof axios>;

beforeAll(() => {
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

describe('CreateLeonardoImage Node', () => {
  let createLeonardoImage: CreateLeonardoImage;
  let mockExecuteFunction: IExecuteFunctions;

  beforeEach(() => {
    jest.clearAllMocks();
    createLeonardoImage = new CreateLeonardoImage();

    const nodeParameters: INodeParameters = {
      prompt: 'A beautiful sunset',
      width: 1024,
      height: 768,
      numImages: 1,
      modelSelectionMethod: 'list',
      modelId: 'b24e16ff-06e3-43eb-8d33-4416c2d75876',
      advancedOptions: false,
    };

    mockExecuteFunction = createLeonardoMockFunction(nodeParameters);
  });

  test('should successfully generate an image with basic parameters', async () => {
    const requestBody = buildRequestBody.call(mockExecuteFunction, 0);

    expect(requestBody).toHaveProperty('prompt', 'A beautiful sunset');
    expect(requestBody).toHaveProperty('width', 1024);
    expect(requestBody).toHaveProperty('height', 768);
    expect(requestBody).toHaveProperty('num_images', 1);
    expect(requestBody).toHaveProperty('modelId', 'b24e16ff-06e3-43eb-8d33-4416c2d75876');
  });

  test('should include advanced parameters when advancedOptions is enabled', async () => {
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

    mockExecuteFunction = createLeonardoMockFunction(advancedParams);

    const requestBody = buildRequestBody.call(mockExecuteFunction, 0);

    expect(requestBody).toHaveProperty('negative_prompt', 'blurry, bad quality');
    expect(requestBody).toHaveProperty('seed', '123456');
    expect(requestBody).toHaveProperty('guidance_scale', 7);
    expect(requestBody).toHaveProperty('num_inference_steps', 30);
    expect(requestBody).toHaveProperty('scheduler', 'EULER_DISCRETE');
  });

  test('should handle boolean parameters correctly', async () => {
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

    mockExecuteFunction = createLeonardoMockFunction(booleanParams);

    const requestBody = buildRequestBody.call(mockExecuteFunction, 0);

    expect(requestBody).toHaveProperty('prompt_magic', true);
    expect(requestBody).toHaveProperty('tiling', true);
    expect(requestBody).toHaveProperty('alchemy', false);
  });

  test('should correctly transform special parameters', async () => {
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

    mockExecuteFunction = createLeonardoMockFunction(specialParams);

    const requestBody = buildRequestBody.call(mockExecuteFunction, 0);

    expect(requestBody).toHaveProperty('sd_version', 'SDXL_1_0');
    expect(requestBody).toHaveProperty('prompt_magic', true);
    expect(requestBody).toHaveProperty('prompt_magic_strength', 0.7);
    expect(requestBody).toHaveProperty('prompt_magic_version', 'v3');
    expect(requestBody).toHaveProperty('transparency', 'foreground_only');
  });

  test('should handle errors gracefully', async () => {
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

    const mockExecute = createLeonardoMockFunction(nodeParameters);
    mockExecute.helpers.request = jest.fn().mockRejectedValueOnce(new Error('API Error'));

    const result = await createLeonardoImage.execute.call(mockExecute);

    expect(result).toHaveLength(1);
    expect(result[0]).toHaveLength(1);

    expect(result[0][0].json).toHaveProperty('success', false);
    expect(result[0][0].json).toHaveProperty('error', 'API Error');
  });

  test('should handle missing generationId in response', async () => {
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

    const mockExecute = createLeonardoMockFunction(nodeParameters);
    mockExecute.helpers.request = jest.fn().mockResolvedValueOnce({
      sdGenerationJob: {},
    });

    const result = await createLeonardoImage.execute.call(mockExecute);

    expect(result[0][0].json).toHaveProperty('success', false);
    expect(result[0][0].json).toHaveProperty(
      'error',
      "Response does not contain the expected 'generationId' field."
    );
  });

  test('should throw error for unsupported operation', async () => {
    const nodeParameters: INodeParameters = {
      prompt: 'A beautiful sunset',
      width: 1024,
      height: 768,
      numImages: 1,
      modelSelectionMethod: 'list',
      modelId: 'b24e16ff-06e3-43eb-8d33-4416c2d75876',
      advancedOptions: false,
      operation: 'invalidOperation',
    };

    mockExecuteFunction = createLeonardoMockFunction(nodeParameters);

    const result = await createLeonardoImage.execute.call(mockExecuteFunction);

    expect(result[0][0].json).toHaveProperty('success', false);
    expect(result[0][0].json).toHaveProperty('error', 'Unsupported operation: invalidOperation');
  });

  test('should handle string status response', async () => {
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

    const mockExecute = createLeonardoMockFunction(nodeParameters);

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

    expect(result[0][0].json).toHaveProperty('success', true);
  });

  test('should handle missing generated_images array', async () => {
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

    const mockExecute = createLeonardoMockFunction(nodeParameters);

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
        },
      });

    const result = await createLeonardoImage.execute.call(mockExecute);

    expect(result[0][0].json.images).toEqual([]);
    expect(result[0][0].json.imageCount).toBe(0);
  });

  test('should handle empty images array for imageUrl', async () => {
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

    const mockExecute = createLeonardoMockFunction(nodeParameters);

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
          generated_images: [],
        },
      });

    const result = await createLeonardoImage.execute.call(mockExecute);

    expect(result[0][0].json).toHaveProperty('imageUrl', null);
  });
});
