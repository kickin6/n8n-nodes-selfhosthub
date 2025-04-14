import { IExecuteFunctions, INodeExecutionData, INodeParameters } from 'n8n-workflow';
import { CreateLeonardoImage } from '../../../nodes/CreateLeonardoImage/CreateLeonardoImage.node';
import axios from 'axios';
import { createMockExecuteFunction } from '../../helpers';

type GenerateImageOptions = {
  generationId?: string;
  imageUrl?: string;
  imageId?: string;
  status?: string;
  nsfw?: boolean;
};

/**
 * Creates a standard mock setup for Leonardo tests with common parameters and mocks
 */
export function setupLeonardoTest(parameters: Record<string, any>) {
  jest.clearAllMocks();

  // Create default parameters merged with provided parameters
  const nodeParameters: INodeParameters = {
    prompt: 'Test prompt',
    width: 1024,
    height: 768,
    numImages: 1,
    modelSelectionMethod: 'list',
    modelId: 'test-model-id',
    advancedOptions: false,
    ...parameters
  };

  // Create node instance and mock execute function
  const createLeonardoImage = new CreateLeonardoImage();
  const mockExecuteFunction = createMockExecuteFunction(nodeParameters);

  return { createLeonardoImage, mockExecuteFunction };
}

/**
 * Creates mock API responses for a successful image generation
 */
export function mockSuccessfulImageGeneration(options: GenerateImageOptions = {}) {
  const {
    generationId = 'test-generation-id',
    imageUrl = 'https://example.com/test-image.jpg',
    imageId = 'test-image-id',
    status = 'COMPLETE',
    nsfw = false
  } = options;

  // Mock axios for a successful generation
  const axiosMock = axios as jest.Mocked<typeof axios>;
  
  // Initial POST for generation
  axiosMock.post.mockResolvedValueOnce({
    data: {
      success: true,
      sdGenerationJob: {
        generationId,
      },
      status: 'PENDING',
    },
  });

  // GET for status check
  axiosMock.get.mockResolvedValueOnce({
    data: {
      generations_by_pk: {
        generated_images: [
          {
            id: imageId,
            url: imageUrl,
            nsfw,
            likeCount: 0,
          }
        ],
        status,
      },
    },
  });

  return axiosMock;
}

/**
 * Validate common aspects of a successful response
 */
export function validateSuccessfulResponse(result: INodeExecutionData[][], expectedImageUrl: string) {
  // Check structure of result
  expect(result).toHaveLength(1);
  expect(result[0]).toHaveLength(1);
  
  // Check content of result
  expect(result[0][0].json).toHaveProperty('success', true);
  expect(result[0][0].json).toHaveProperty('imageUrl', expectedImageUrl);
  
  // Check binary data
  if (result[0][0].binary) {
    expect(result[0][0].binary).toHaveProperty('data');
    expect(result[0][0].binary.data).toHaveProperty('mimeType', 'image/jpeg');
    expect(result[0][0].binary.data).toHaveProperty('fileType', 'image');
    expect(result[0][0].binary.data).toHaveProperty('fileName');
    expect(result[0][0].binary.data).toHaveProperty('fileExtension', 'jpg');
  }
}