import { IExecuteFunctions } from 'n8n-workflow';
import { CreateLeonardoImage } from '../../../nodes/CreateLeonardoImage/CreateLeonardoImage.node';
import {
  createMockNodeType,
  createLeonardoMockFunction,
} from '../../shared/leonardo-helpers';

describe('CreateLeonardoImage - Advanced Features', () => {
  let createLeonardoImage: CreateLeonardoImage;
  let mockExecuteFunction: IExecuteFunctions;

  beforeEach(() => {
    createLeonardoImage = new CreateLeonardoImage();
    createMockNodeType(createLeonardoImage);
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('advanced options', () => {
    it('should successfully create an image with advanced options', async () => {
      const parameters = {
        operation: 'createLeonardoImage',
        prompt: 'Advanced options test',
        modelSelectionMethod: 'list',
        modelId: 'b820ea11-02bf-4652-97ae-9ac0cc00593d',
        width: 512,
        height: 512,
        numImages: 1,
        advancedOptions: true,
        negativePrompt: 'blurry, low quality',
        guidanceScale: 10,
        scheduler: 'EULER_DISCRETE',
        initStrength: 0.7,
      };

      mockExecuteFunction = createLeonardoMockFunction(parameters);

      mockExecuteFunction.helpers = {
        request: jest.fn()
          .mockResolvedValueOnce(JSON.stringify({
            sdGenerationJob: { generationId: 'mock-generation-id' }
          }))
          .mockResolvedValueOnce(JSON.stringify({
            generations_by_pk: {
              id: 'mock-generation-id',
              status: 'COMPLETE',
              prompt: 'Advanced options test',
              modelId: 'b820ea11-02bf-4652-97ae-9ac0cc00593d',
              width: 512,
              height: 512,
              negative_prompt: 'blurry, low quality',
              guidance_scale: 10,
              scheduler: 'EULER_DISCRETE',
              init_strength: 0.7,
              generated_images: [{
                id: 'mock-image-adv',
                url: 'https://example.com/advanced-image.jpg',
                nsfw: false,
              }],
            },
          })),
      } as any;

      jest.spyOn(mockExecuteFunction, 'getCredentials').mockResolvedValue({
        apiKey: 'mock-api-key',
      });

      const executePromise = createLeonardoImage.execute!.call(mockExecuteFunction);
      await jest.advanceTimersByTimeAsync(4000);
      const result = await executePromise;

      expect(result.length).toBe(1);
      expect(result[0].length).toBe(1);
      expect(mockExecuteFunction.helpers.request).toHaveBeenCalledTimes(2);

      const json = result[0][0].json as any;
      expect(json).toHaveProperty('success', true);
      expect(json.rawResponse.generations_by_pk).toHaveProperty('negative_prompt', 'blurry, low quality');
      expect(json.rawResponse.generations_by_pk).toHaveProperty('guidance_scale', 10);
      expect(json.rawResponse.generations_by_pk).toHaveProperty('scheduler', 'EULER_DISCRETE');
      expect(json.rawResponse.generations_by_pk).toHaveProperty('init_strength', 0.7);
    });

    it('should successfully use Image-to-Image when enabled', async () => {
      const parameters = {
        operation: 'createLeonardoImage',
        prompt: 'Image-to-Image test',
        modelId: 'b820ea11-02bf-4652-97ae-9ac0cc00593d',
        width: 512,
        height: 512,
        numImages: 1,
        advancedOptions: true,
        imageToImage: 'true',
        initImageUrl: 'https://example.com/source.jpg',
        initStrength: 0.7,
      };

      mockExecuteFunction = createLeonardoMockFunction(parameters);

      mockExecuteFunction.helpers = {
        request: jest.fn()
          .mockResolvedValueOnce(JSON.stringify({
            sdGenerationJob: { generationId: 'mock-generation-id' }
          }))
          .mockResolvedValueOnce(JSON.stringify({
            generations_by_pk: {
              id: 'mock-generation-id',
              status: 'COMPLETE',
              prompt: 'Image-to-Image test',
              modelId: 'b820ea11-02bf-4652-97ae-9ac0cc00593d',
              width: 512,
              height: 512,
              init_image_url: 'https://example.com/source.jpg',
              init_strength: 0.7,
              generated_images: [{
                id: 'mock-image-id',
                url: 'https://example.com/result.jpg',
                nsfw: false,
              }],
            },
          })),
      } as any;

      jest.spyOn(mockExecuteFunction, 'getCredentials').mockResolvedValue({
        apiKey: 'mock-api-key',
      });

      const executePromise = createLeonardoImage.execute!.call(mockExecuteFunction);
      await jest.advanceTimersByTimeAsync(4000);
      const result = await executePromise;

      expect(result.length).toBe(1);
      expect(result[0].length).toBe(1);
      expect(mockExecuteFunction.helpers.request).toHaveBeenCalledTimes(2);
      
      const json = result[0][0].json as any;
      expect(json).toHaveProperty('success', true);
      expect(json.rawResponse.generations_by_pk).toHaveProperty('init_image_url', 'https://example.com/source.jpg');
      expect(json.rawResponse.generations_by_pk).toHaveProperty('init_strength', 0.7);
    });

    it('should successfully handle controlnets', async () => {
      const parameters = {
        operation: 'createLeonardoImage',
        prompt: 'Test with controlnets',
        modelId: 'b820ea11-02bf-4652-97ae-9ac0cc00593d',
        width: 512,
        height: 512,
        numImages: 1,
        'controlnets.controlNetValues': [
          {
            initImageId: 'control-image-1',
            initImageType: 'UPLOADED',
            preprocessorId: '67',
            weight: 0.6,
            strengthType: 'Mid',
          },
          {
            initImageId: 'control-image-2',
            initImageType: 'UPLOADED',
            preprocessorId: '68',
            weight: 0.8,
            strengthType: 'High',
          },
        ],
      };

      mockExecuteFunction = createLeonardoMockFunction(parameters);

      mockExecuteFunction.helpers = {
        request: jest.fn()
          .mockResolvedValueOnce(JSON.stringify({
            sdGenerationJob: { generationId: 'mock-generation-id' }
          }))
          .mockResolvedValueOnce(JSON.stringify({
            generations_by_pk: {
              id: 'mock-generation-id',
              status: 'COMPLETE',
              prompt: 'Test with controlnets',
              modelId: 'b820ea11-02bf-4652-97ae-9ac0cc00593d',
              width: 512,
              height: 512,
              controlnets: [
                {
                  initImageId: 'control-image-1',
                  initImageType: 'UPLOADED',
                  preprocessorId: '67',
                  weight: 0.6,
                  strengthType: 'Mid',
                },
                {
                  initImageId: 'control-image-2',
                  initImageType: 'UPLOADED',
                  preprocessorId: '68',
                  weight: 0.8,
                  strengthType: 'High',
                },
              ],
              generated_images: [{
                id: 'mock-image-1',
                url: 'https://example.com/controlnet-image.jpg',
                nsfw: false,
              }],
            },
          })),
      } as any;

      jest.spyOn(mockExecuteFunction, 'getCredentials').mockResolvedValue({
        apiKey: 'mock-api-key',
      });

      const executePromise = createLeonardoImage.execute!.call(mockExecuteFunction);
      await jest.advanceTimersByTimeAsync(4000);
      const result = await executePromise;

      expect(result.length).toBe(1);
      expect(result[0].length).toBe(1);
      
      const json = result[0][0].json as any;
      expect(json).toHaveProperty('success', true);
      expect(json.rawResponse.generations_by_pk).toHaveProperty('controlnets');
      expect(json.rawResponse.generations_by_pk.controlnets.length).toBe(2);
      expect(json.rawResponse.generations_by_pk.controlnets[0]).toHaveProperty('initImageId', 'control-image-1');
      expect(json.rawResponse.generations_by_pk.controlnets[1]).toHaveProperty('initImageId', 'control-image-2');
    });

    it('should successfully create an image with single image prompt', async () => {
      const parameters = {
        operation: 'createLeonardoImage',
        prompt: 'Test with image prompts',
        modelId: 'b820ea11-02bf-4652-97ae-9ac0cc00593d',
        width: 512,
        height: 512,
        numImages: 1,
        'imagePrompts.imagePromptValues': [
          {
            imageId: 'test-image-prompt-id',
          },
        ],
      };

      mockExecuteFunction = createLeonardoMockFunction(parameters);

      mockExecuteFunction.helpers = {
        request: jest.fn()
          .mockResolvedValueOnce(JSON.stringify({
            sdGenerationJob: { generationId: 'mock-generation-id' }
          }))
          .mockResolvedValueOnce(JSON.stringify({
            generations_by_pk: {
              id: 'mock-generation-id',
              status: 'COMPLETE',
              prompt: 'Test with image prompts',
              modelId: 'b820ea11-02bf-4652-97ae-9ac0cc00593d',
              width: 512,
              height: 512,
              imagePrompts: ['test-image-prompt-id'],
              generated_images: [{
                id: 'mock-image-1',
                url: 'https://example.com/image-prompt-result.jpg',
                nsfw: false,
              }],
            },
          })),
      } as any;

      jest.spyOn(mockExecuteFunction, 'getCredentials').mockResolvedValue({
        apiKey: 'mock-api-key',
      });

      const executePromise = createLeonardoImage.execute!.call(mockExecuteFunction);
      await jest.advanceTimersByTimeAsync(4000);
      const result = await executePromise;

      expect(result.length).toBe(1);
      expect(result[0].length).toBe(1);
      
      const json = result[0][0].json as any;
      expect(json).toHaveProperty('success', true);
      expect(json.rawResponse.generations_by_pk).toHaveProperty('imagePrompts');
      expect(json.rawResponse.generations_by_pk.imagePrompts).toContain('test-image-prompt-id');
    });

    it('should successfully handle multiple image prompts', async () => {
      const parameters = {
        operation: 'createLeonardoImage',
        prompt: 'Test with multiple image prompts',
        modelId: 'b820ea11-02bf-4652-97ae-9ac0cc00593d',
        width: 512,
        height: 512,
        numImages: 1,
        'imagePrompts.imagePromptValues': [
          {
            imageId: 'test-image-prompt-id-1',
          },
          {
            imageId: 'test-image-prompt-id-2',
          },
        ],
      };

      mockExecuteFunction = createLeonardoMockFunction(parameters);

      mockExecuteFunction.helpers = {
        request: jest.fn()
          .mockResolvedValueOnce(JSON.stringify({
            sdGenerationJob: { generationId: 'mock-generation-id' }
          }))
          .mockResolvedValueOnce(JSON.stringify({
            generations_by_pk: {
              id: 'mock-generation-id',
              status: 'COMPLETE',
              prompt: 'Test with multiple image prompts',
              modelId: 'b820ea11-02bf-4652-97ae-9ac0cc00593d',
              width: 512,
              height: 512,
              imagePrompts: ['test-image-prompt-id-1', 'test-image-prompt-id-2'],
              generated_images: [{
                id: 'mock-image-1',
                url: 'https://example.com/image-prompt-result.jpg',
                nsfw: false,
              }],
            },
          })),
      } as any;

      jest.spyOn(mockExecuteFunction, 'getCredentials').mockResolvedValue({
        apiKey: 'mock-api-key',
      });

      const executePromise = createLeonardoImage.execute!.call(mockExecuteFunction);
      await jest.advanceTimersByTimeAsync(4000);
      const result = await executePromise;

      expect(result.length).toBe(1);
      expect(result[0].length).toBe(1);
      
      const json = result[0][0].json as any;
      expect(json).toHaveProperty('success', true);
      expect(json).toHaveProperty('images');
      expect(json.images.length).toBe(1);
      expect(json.success).toBe(true);
    });
  });
});