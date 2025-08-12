import { IExecuteFunctions } from 'n8n-workflow';
import { CreateLeonardoImage } from '../../../nodes/CreateLeonardoImage/CreateLeonardoImage.node';
import {
    createLeonardoMockFunction,
    createMockNodeType,
} from '../../shared/leonardo-helpers';

describe('CreateLeonardoImage - Parameter Tests', () => {
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

    describe('parameter handling', () => {
        it('should successfully handle enhancePrompt option', async () => {
            const parameters = {
                operation: 'createLeonardoImage',
                prompt: 'Test with enhanced prompt',
                modelId: 'b820ea11-02bf-4652-97ae-9ac0cc00593d',
                width: 512,
                height: 512,
                numImages: 1,
                enhancePrompt: 'true',
                enhancePromptInstruction: 'Make it more colorful and detailed',
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
                            prompt: 'Test with enhanced prompt',
                            modelId: 'b820ea11-02bf-4652-97ae-9ac0cc00593d',
                            width: 512,
                            height: 512,
                            enhancePrompt: true,
                            enhancePromptInstruction: 'Make it more colorful and detailed',
                            generated_images: [{
                                id: 'mock-image-1',
                                url: 'https://example.com/enhanced-image.jpg',
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

            expect(mockExecuteFunction.helpers.request).toHaveBeenCalledTimes(2);
            expect(result.length).toBe(1);
            expect(result[0].length).toBe(1);

            const json = result[0][0].json as any;
            expect(json).toHaveProperty('success', true);
            expect(json.rawResponse.generations_by_pk).toHaveProperty('enhancePrompt', true);
            expect(json.rawResponse.generations_by_pk).toHaveProperty('enhancePromptInstruction', 'Make it more colorful and detailed');
        });

        it('should handle NO_SELECTION in three-state parameters', async () => {
            const parameters = {
                operation: 'createLeonardoImage',
                prompt: 'Test with NO_SELECTION',
                modelId: 'b820ea11-02bf-4652-97ae-9ac0cc00593d',
                width: 512,
                height: 512,
                numImages: 1,
                enhancePrompt: 'NO_SELECTION',
                photoReal: 'NO_SELECTION',
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
                            prompt: 'Test with NO_SELECTION',
                            modelId: 'b820ea11-02bf-4652-97ae-9ac0cc00593d',
                            width: 512,
                            height: 512,
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
            expect(json.rawResponse.generations_by_pk).not.toHaveProperty('enhancePrompt');
            expect(json.rawResponse.generations_by_pk).not.toHaveProperty('photoReal');
        });

        it('should handle photoReal option', async () => {
            const parameters = {
                operation: 'createLeonardoImage',
                prompt: 'Test with photoReal',
                modelId: 'b820ea11-02bf-4652-97ae-9ac0cc00593d',
                width: 512,
                height: 512,
                numImages: 1,
                photoReal: 'true',
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
                            prompt: 'Test with photoReal',
                            modelId: 'b820ea11-02bf-4652-97ae-9ac0cc00593d',
                            width: 512,
                            height: 512,
                            photoReal: true,
                            generated_images: [{
                                id: 'mock-image-id',
                                url: 'https://example.com/photorealistic.jpg',
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
            expect(json.rawResponse.generations_by_pk).toHaveProperty('photoReal', true);
        });

        it('should handle promptMagic with promptMagicStrength and promptMagicVersion', async () => {
            const parameters = {
                operation: 'createLeonardoImage',
                prompt: 'Test with promptMagic parameters',
                modelId: 'b820ea11-02bf-4652-97ae-9ac0cc00593d',
                width: 512,
                height: 512,
                numImages: 1,
                promptMagic: 'true',
                promptMagicStrength: '0.6',
                promptMagicVersion: '2'
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
                            prompt: 'Test with promptMagic parameters',
                            modelId: 'b820ea11-02bf-4652-97ae-9ac0cc00593d',
                            width: 512,
                            height: 512,
                            prompt_magic: true,
                            prompt_magic_strength: 0.6,
                            prompt_magic_version: '2',
                            promptMagic: true,
                            promptMagicStrength: 0.6,
                            promptMagicVersion: '2',
                            generated_images: [{
                                id: 'mock-image-promptmagic',
                                url: 'https://example.com/promptmagic-image.jpg',
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

            expect(mockExecuteFunction.helpers.request).toHaveBeenCalledTimes(2);
            expect(result.length).toBe(1);
            expect(result[0].length).toBe(1);

            const json = result[0][0].json as any;
            expect(json).toHaveProperty('success', true);
            expect(json.rawResponse.generations_by_pk).toHaveProperty('prompt_magic', true);
            expect(json.rawResponse.generations_by_pk).toHaveProperty('promptMagic', true);
            expect(json.rawResponse.generations_by_pk).toHaveProperty('prompt_magic_strength', 0.6);
            expect(json.rawResponse.generations_by_pk).toHaveProperty('promptMagicStrength', 0.6);
            expect(json.rawResponse.generations_by_pk).toHaveProperty('prompt_magic_version', '2');
            expect(json.rawResponse.generations_by_pk).toHaveProperty('promptMagicVersion', '2');
        });

        it('should set contrast parameter when not default', async () => {
            const parameters = {
                operation: 'createLeonardoImage',
                prompt: 'Test with custom contrast',
                modelId: 'b820ea11-02bf-4652-97ae-9ac0cc00593d',
                width: 512,
                height: 512,
                numImages: 1,
                contrast: '1.2',
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
                            prompt: 'Test with custom contrast',
                            modelId: 'b820ea11-02bf-4652-97ae-9ac0cc00593d',
                            width: 512,
                            height: 512,
                            contrast: '1.2',
                            generated_images: [{
                                id: 'mock-image-contrast',
                                url: 'https://example.com/contrast-image.jpg',
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

            expect(mockExecuteFunction.helpers.request).toHaveBeenCalledTimes(2);
            expect(result.length).toBe(1);
            expect(result[0].length).toBe(1);

            const json = result[0][0].json as any;
            expect(json).toHaveProperty('success', true);
            expect(json.rawResponse.generations_by_pk).toHaveProperty('contrast', '1.2');
        });

        it('should handle transparency parameter', async () => {
            const parameters = {
                operation: 'createLeonardoImage',
                prompt: 'Test with transparency parameter',
                modelId: 'b820ea11-02bf-4652-97ae-9ac0cc00593d',
                width: 512,
                height: 512,
                numImages: 1,
                transparency: 'foreground_only'
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
                            prompt: 'Test with transparency parameter',
                            modelId: 'b820ea11-02bf-4652-97ae-9ac0cc00593d',
                            width: 512,
                            height: 512,
                            transparency: 'foreground_only',
                            generated_images: [{
                                id: 'mock-image-transparent',
                                url: 'https://example.com/transparent-image.jpg',
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

            expect(mockExecuteFunction.helpers.request).toHaveBeenCalledTimes(2);
            expect(result.length).toBe(1);
            expect(result[0].length).toBe(1);

            const json = result[0][0].json as any;
            expect(json).toHaveProperty('success', true);
            expect(json.rawResponse.generations_by_pk).toHaveProperty('transparency', 'foreground_only');
        });

        it('should handle sdVersion parameter', async () => {
            const parameters = {
                operation: 'createLeonardoImage',
                prompt: 'Test with sdVersion parameter',
                modelId: 'b820ea11-02bf-4652-97ae-9ac0cc00593d',
                width: 512,
                height: 512,
                numImages: 1,
                sdVersion: 'SDXL_1_0'
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
                            prompt: 'Test with sdVersion parameter',
                            modelId: 'b820ea11-02bf-4652-97ae-9ac0cc00593d',
                            width: 512,
                            height: 512,
                            sdVersion: 'SDXL_1_0',
                            generated_images: [{
                                id: 'mock-image-sdxl',
                                url: 'https://example.com/sdxl-image.jpg',
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

            expect(mockExecuteFunction.helpers.request).toHaveBeenCalledTimes(2);
            expect(result.length).toBe(1);
            expect(result[0].length).toBe(1);

            const json = result[0][0].json as any;
            expect(json).toHaveProperty('success', true);
            expect(json.rawResponse.generations_by_pk).toHaveProperty('sdVersion', 'SDXL_1_0');
        });
        
        it('should handle false enhancePrompt option', async () => {
            const parameters = {
                operation: 'createLeonardoImage',
                prompt: 'Test with disabled prompt enhancement',
                modelId: 'b820ea11-02bf-4652-97ae-9ac0cc00593d',
                width: 512,
                height: 512,
                numImages: 1,
                enhancePrompt: 'false',
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
                            prompt: 'Test with disabled prompt enhancement',
                            modelId: 'b820ea11-02bf-4652-97ae-9ac0cc00593d',
                            width: 512,
                            height: 512,
                            enhancePrompt: false,
                            generated_images: [{
                                id: 'mock-image-1',
                                url: 'https://example.com/non-enhanced-image.jpg',
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

            expect(mockExecuteFunction.helpers.request).toHaveBeenCalledTimes(2);
            expect(result.length).toBe(1);
            expect(result[0].length).toBe(1);

            const json = result[0][0].json as any;
            expect(json).toHaveProperty('success', true);
            expect(json.rawResponse.generations_by_pk).toHaveProperty('enhancePrompt', false);
        });
    });
});
