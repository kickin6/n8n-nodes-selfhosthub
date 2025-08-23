// __tests__/nodes/CreateJ2vMovie/utils/requestBuilder/sharedBuilder.test.ts

jest.mock('@nodes/CreateJ2vMovie/utils/elementProcessor', () => ({
    processElement: jest.fn()
}));

jest.mock('@nodes/CreateJ2vMovie/utils/textElementProcessor', () => ({
    processTextElement: jest.fn(),
    processSubtitleElement: jest.fn(),
    validateTextElementParams: jest.fn(),
    validateSubtitleElementParams: jest.fn()
}));

jest.mock('@nodes/CreateJ2vMovie/utils/validationUtils', () => ({
    validateMovieElements: jest.fn(),
    validateSceneElements: jest.fn()
}));

import { IDataObject } from 'n8n-workflow';
import {
    getParameterValue,
    processMovieElements,
    processVideoElements,
    processAudioElements,
    processImageElements,
    processVoiceElements,
    processComponentElements,
    processAudiogramElements,
    getActionConfig,
    processAllMovieElements,
    processMovieTextElements,
    processMovieSubtitleElements,
    processSceneTextElements,
    finalizeRequestBody,
    initializeRequestBody,
    addCommonParameters,
    processOutputSettings
} from '@nodes/CreateJ2vMovie/utils/requestBuilder/shared';
import { processElement } from '@nodes/CreateJ2vMovie/utils/elementProcessor';
import {
    processTextElement,
    processSubtitleElement,
    validateTextElementParams,
    validateSubtitleElementParams
} from '@nodes/CreateJ2vMovie/utils/textElementProcessor';
import { validateMovieElements } from '@nodes/CreateJ2vMovie/utils/validationUtils';
import { VideoRequestBody } from '@nodes/CreateJ2vMovie/utils/requestBuilder/types';
import { TextElementParams } from '@nodes/CreateJ2vMovie/operations/shared/elements';

const createMockExecuteFunctions = () => ({
    getNodeParameter: jest.fn(),
    logger: {
        warn: jest.fn(),
        debug: jest.fn(),
        info: jest.fn(),
        error: jest.fn()
    },
    getCredentials: jest.fn(),
    getExecutionId: jest.fn(),
    getNode: jest.fn(),
    getWorkflow: jest.fn(),
    getMode: jest.fn(),
    getActivationMode: jest.fn(),
    getRestApiUrl: jest.fn(),
    getInstanceBaseUrl: jest.fn(),
    getTimezone: jest.fn(),
    getExecuteData: jest.fn(),
    sendMessageToUI: jest.fn(),
    helpers: {} as any,
} as any);

describe('requestBuilder shared utilities', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getParameterValue', () => {

        test('should return parameter value when parameter exists', () => {
            const mockExecute = createMockExecuteFunctions();
            mockExecute.getNodeParameter.mockReturnValue('test-value');

            const result = getParameterValue.call(mockExecute, 'testParam', 0, 'default');

            expect(result).toBe('test-value');
            expect(mockExecute.getNodeParameter).toHaveBeenCalledWith('testParam', 0, 'default');
        });

        test('should return default value when parameter access throws error', () => {
            const mockExecute = createMockExecuteFunctions();
            mockExecute.getNodeParameter.mockImplementation(() => {
                throw new Error('Parameter not found');
            });

            const result = getParameterValue.call(mockExecute, 'nonexistentParam', 0, 'fallback');

            expect(result).toBe('fallback');
            expect(mockExecute.getNodeParameter).toHaveBeenCalledWith('nonexistentParam', 0, 'fallback');
        });

        test('should use default itemIndex and defaultValue when not provided', () => {
            const mockExecute = createMockExecuteFunctions();
            mockExecute.getNodeParameter.mockReturnValue('param-value');

            const result = getParameterValue.call(mockExecute, 'testParam');

            expect(result).toBe('param-value');
            expect(mockExecute.getNodeParameter).toHaveBeenCalledWith('testParam', 0, '');
        });

        test('should handle different parameter types', () => {
            const mockExecute = createMockExecuteFunctions();

            // Test string
            mockExecute.getNodeParameter.mockReturnValueOnce('string-value');
            expect(getParameterValue.call(mockExecute, 'stringParam')).toBe('string-value');

            // Test number
            mockExecute.getNodeParameter.mockReturnValueOnce(42);
            expect(getParameterValue.call(mockExecute, 'numberParam')).toBe(42);

            // Test boolean
            mockExecute.getNodeParameter.mockReturnValueOnce(true);
            expect(getParameterValue.call(mockExecute, 'boolParam')).toBe(true);
        });
    });

});

// BLOCK 2
describe('Unified Element Processors', () => {
    let mockThis: any;
    let mockProcessElement: jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks()
        mockThis = createMockExecuteFunctions();
        mockProcessElement = processElement as jest.Mock;
    });

    describe('processVideoElements', () => {
        test('should process single video element correctly', () => {
            const videoElements = [{
                type: 'video',
                src: 'https://example.com/test.mp4',
                duration: 10,
                volume: 0.8,
                muted: false
            }];
            const context = { width: 1920, height: 1080 };

            const expectedProcessedElement = {
                type: 'video',
                src: 'https://example.com/test.mp4',
                duration: 10,
                volume: 0.8,
                muted: false
            };

            mockProcessElement.mockReturnValue(expectedProcessedElement);

            const result = processVideoElements.call(mockThis, videoElements, context);

            expect(result).toHaveLength(1);
            expect(result[0]).toEqual(expectedProcessedElement);
            expect(mockProcessElement).toHaveBeenCalledWith(videoElements[0], 1920, 1080);
        });

        test('should process multiple video elements', () => {
            const videoElements = [
                { type: 'video', src: 'video1.mp4', duration: 5 },
                { type: 'video', src: 'video2.mp4', duration: 8 }
            ];
            const context = { width: 1280, height: 720 };

            mockProcessElement
                .mockReturnValueOnce({ type: 'video', src: 'video1.mp4', duration: 5 })
                .mockReturnValueOnce({ type: 'video', src: 'video2.mp4', duration: 8 });

            const result = processVideoElements.call(mockThis, videoElements, context);

            expect(result).toHaveLength(2);
            expect(mockProcessElement).toHaveBeenCalledTimes(2);
        });

        test('should handle empty video elements array', () => {
            const result = processVideoElements.call(mockThis, [], { width: 1920, height: 1080 });

            expect(result).toHaveLength(0);
            expect(mockProcessElement).not.toHaveBeenCalled();
        });
    });

    describe('processAudioElements', () => {
        test('should process single audio element correctly', () => {
            const audioElements = [{
                type: 'audio',
                src: 'https://example.com/test.mp3',
                volume: 0.7,
                loop: 0
            }];
            const context = { width: 1920, height: 1080 };

            const expectedProcessedElement = {
                type: 'audio',
                src: 'https://example.com/test.mp3',
                volume: 0.7,
                loop: 0
            };

            mockProcessElement.mockReturnValue(expectedProcessedElement);

            const result = processAudioElements.call(mockThis, audioElements, context);

            expect(result).toHaveLength(1);
            expect(result[0]).toEqual(expectedProcessedElement);
            expect(mockProcessElement).toHaveBeenCalledWith(audioElements[0], 1920, 1080);
        });

        test('should process multiple audio elements', () => {
            const audioElements = [
                { type: 'audio', src: 'audio1.mp3', volume: 0.5 },
                { type: 'audio', src: 'audio2.mp3', volume: 0.8 }
            ];
            const context = { width: 1280, height: 720 };

            mockProcessElement
                .mockReturnValueOnce({ type: 'audio', src: 'audio1.mp3', volume: 0.5 })
                .mockReturnValueOnce({ type: 'audio', src: 'audio2.mp3', volume: 0.8 });

            const result = processAudioElements.call(mockThis, audioElements, context);

            expect(result).toHaveLength(2);
            expect(mockProcessElement).toHaveBeenCalledTimes(2);
        });
    });

    describe('processImageElements', () => {
        test('should process single image element correctly', () => {
            const imageElements = [{
                type: 'image',
                src: 'https://example.com/test.jpg',
                width: 500,
                height: 300,
                opacity: 0.9
            }];
            const context = { width: 1920, height: 1080 };

            const expectedProcessedElement = {
                type: 'image',
                src: 'https://example.com/test.jpg',
                width: 500,
                height: 300,
                opacity: 0.9
            };

            mockProcessElement.mockReturnValue(expectedProcessedElement);

            const result = processImageElements.call(mockThis, imageElements, context);

            expect(result).toHaveLength(1);
            expect(result[0]).toEqual(expectedProcessedElement);
            expect(mockProcessElement).toHaveBeenCalledWith(imageElements[0], 1920, 1080);
        });
    });

    describe('processVoiceElements', () => {
        test('should process single voice element correctly', () => {
            const voiceElements = [{
                type: 'voice',
                text: 'Hello world',
                voice: 'en-US-AriaNeural',
                rate: 1.0,
                pitch: 1.0
            }];
            const context = { width: 1920, height: 1080 };

            const expectedProcessedElement = {
                type: 'voice',
                text: 'Hello world',
                voice: 'en-US-AriaNeural',
                rate: 1.0,
                pitch: 1.0
            };

            mockProcessElement.mockReturnValue(expectedProcessedElement);

            const result = processVoiceElements.call(mockThis, voiceElements, context);

            expect(result).toHaveLength(1);
            expect(result[0]).toEqual(expectedProcessedElement);
            expect(mockProcessElement).toHaveBeenCalledWith(voiceElements[0], 1920, 1080);
        });
    });

    describe('processComponentElements', () => {
        test('should throw error for unimplemented component elements', () => {
            const componentElements = [{ type: 'component', id: 'test-component' }];
            const context = { width: 1920, height: 1080 };

            expect(() => {
                processComponentElements.call(mockThis, componentElements, context);
            }).toThrow('Component elements not yet implemented');
        });
    });

    describe('processAudiogramElements', () => {
        test('should throw error for unimplemented audiogram elements', () => {
            const audiogramElements = [{ type: 'audiogram', audio: 'test.mp3' }];
            const context = { width: 1920, height: 1080 };

            expect(() => {
                processAudiogramElements.call(mockThis, audiogramElements, context);
            }).toThrow('Audiogram elements not yet implemented');
        });
    });
});

// BLOCK 3
describe('Action Configuration System', () => {
    describe('getActionConfig', () => {
        test('should return correct config for createMovie operation', () => {
            const config = getActionConfig('createMovie');

            expect(config).toEqual({
                supportsMovieSubtitles: false,
                supportsSceneTransitions: true,
                supportsCustomScenes: true,
                allowedElementTypes: ['video', 'audio', 'image', 'text', 'voice']
            });
        });

        test('should return correct config for mergeVideoAudio operation', () => {
            const config = getActionConfig('mergeVideoAudio');

            expect(config).toEqual({
                supportsMovieSubtitles: false,
                supportsSceneTransitions: false,
                supportsCustomScenes: false,
                allowedElementTypes: ['video', 'audio', 'text']
            });
        });

        test('should return correct config for mergeVideos operation', () => {
            const config = getActionConfig('mergeVideos');

            expect(config).toEqual({
                supportsMovieSubtitles: true,
                supportsSceneTransitions: true,
                supportsCustomScenes: false,
                allowedElementTypes: ['video', 'text', 'subtitles']
            });
        });

        test('should return default config for unknown operation', () => {
            const config = getActionConfig('unknownOperation');

            expect(config).toEqual({
                supportsMovieSubtitles: false,
                supportsSceneTransitions: false,
                supportsCustomScenes: false,
                allowedElementTypes: []
            });
        });
    });
});

// BLOCK 4
describe('Request Body Initialization and Processing', () => {
    let mockThis: any;

    beforeEach(() => {
        jest.clearAllMocks()
        mockThis = createMockExecuteFunctions();
        mockThis.getNodeParameter.mockImplementation((param: string, index: number, defaultValue: any) => {
            const paramMap: any = {
                'framerate': 25,
                'output_width': 1024,
                'output_height': 768,
                'recordId': 'test-record-123',
                'webhookUrl': 'https://example.com/webhook'
            };
            return paramMap[param] || defaultValue;
        });
    });

    describe('initializeRequestBody', () => {
        test('should initialize request body with correct default values', () => {
            const result = initializeRequestBody.call(mockThis, 0);

            expect(result).toEqual({
                fps: 25,
                width: 1024,
                height: 768,
                scenes: []
            });
        });
    });

    describe('addCommonParameters', () => {
        test('should add basic setup parameters', () => {
            const requestBody: VideoRequestBody = {
                fps: 25,
                width: 1024,
                height: 768,
                scenes: []
            };

            addCommonParameters.call(mockThis, requestBody, 0, []);

            expect(requestBody.id).toBe('test-record-123');
            expect(requestBody.exports).toEqual([{
                destinations: [{
                    type: 'webhook',
                    endpoint: 'https://example.com/webhook'
                }]
            }]);
        });

        test('should add operation-specific parameters', () => {
            mockThis.getNodeParameter.mockImplementation((param: string, index: number, defaultValue: any) => {
                const paramMap: any = {
                    'quality': 'high',
                    'cache': true,
                    'client-data': '{"key": "value"}',
                    'comment': 'Test comment',
                    'draft': false
                };
                return paramMap[param] !== undefined ? paramMap[param] : defaultValue;
            });

            const requestBody: VideoRequestBody = {
                fps: 25,
                width: 1024,
                height: 768,
                scenes: []
            };

            addCommonParameters.call(mockThis, requestBody, 0, ['quality', 'cache', 'client-data', 'comment', 'draft']);

            expect(requestBody.quality).toBe('high');
            expect(requestBody.cache).toBe(true);
            expect(requestBody['client-data']).toEqual({ key: 'value' });
            expect(requestBody.comment).toBe('Test comment');
            expect(requestBody.draft).toBe(false);
        });

        test('should skip invalid JSON in client-data', () => {
            mockThis.getNodeParameter.mockImplementation((param: string) => {
                if (param === 'client-data') return '{ invalid json }';
                return undefined;
            });

            const requestBody: VideoRequestBody = {
                fps: 25,
                width: 1024,
                height: 768,
                scenes: []
            };

            addCommonParameters.call(mockThis, requestBody, 0, ['client-data']);

            expect(requestBody['client-data']).toBeUndefined();
        });

        test('should handle fallback to direct parameter access when outputSettings fails', () => {
            mockThis.getNodeParameter.mockImplementation((param: string) => {
                if (param === 'outputSettings') throw new Error('Not found');
                if (param === 'outputSettings.outputDetails') throw new Error('Not found');
                if (param === 'width') return 1600;
                if (param === 'height') return 900;
                if (param === 'fps') return 24;
                return undefined;
            });

            const requestBody: VideoRequestBody = {
                fps: 25,
                width: 1024,
                height: 768,
                scenes: []
            };

            processOutputSettings.call(mockThis, requestBody, 0);

            expect(requestBody.width).toBe(1600);
            expect(requestBody.height).toBe(900);
            expect(requestBody.fps).toBe(24);
        });

        test('should handle errors in processOutputSettings gracefully', () => {
            mockThis.getNodeParameter.mockImplementation(() => {
                throw new Error('All parameters fail');
            });

            const requestBody: VideoRequestBody = {
                fps: 25,
                width: 1024,
                height: 768,
                scenes: []
            };

            processOutputSettings.call(mockThis, requestBody, 0);

            expect(mockThis.logger.warn).toHaveBeenCalledWith(
                expect.stringContaining('Failed to process output settings')
            );
        });

        test('should call addCommonParameters without includeOperationParams', () => {
            const mockExecute = createMockExecuteFunctions();
            const requestBody = { fps: 25, width: 1024, height: 768, scenes: [] };

            addCommonParameters.call(mockExecute, requestBody, 0);

            expect(requestBody).toBeDefined();
        });
    });

    describe('processOutputSettings', () => {
        test('should process output settings from collection structure', () => {
            mockThis.getNodeParameter.mockImplementation((param: string) => {
                if (param === 'outputSettings') {
                    return {
                        outputDetails: {
                            width: 1920,
                            height: 1080,
                            fps: 30,
                            quality: 'high'
                        }
                    };
                }
                return undefined;
            });

            const requestBody: VideoRequestBody = {
                fps: 25,
                width: 1024,
                height: 768,
                scenes: []
            };

            processOutputSettings.call(mockThis, requestBody, 0);

            expect(requestBody.width).toBe(1920);
            expect(requestBody.height).toBe(1080);
            expect(requestBody.fps).toBe(30);
            expect(requestBody.quality).toBe('high');
        });

        test('should handle missing output settings gracefully', () => {
            mockThis.getNodeParameter.mockReturnValue(undefined);

            const requestBody: VideoRequestBody = {
                fps: 25,
                width: 1024,
                height: 768,
                scenes: []
            };

            const originalValues = { ...requestBody };

            processOutputSettings.call(mockThis, requestBody, 0);

            expect(requestBody.width).toBe(originalValues.width);
            expect(requestBody.height).toBe(originalValues.height);
            expect(requestBody.fps).toBe(originalValues.fps);
        });
    });

    describe('finalizeRequestBody', () => {
        test('should add scenes and movie elements to request body', () => {
            const requestBody: VideoRequestBody = {
                fps: 25,
                width: 1024,
                height: 768,
                scenes: []
            };

            const scenes = [
                { elements: [{ type: 'video', src: 'test.mp4' }] }
            ];

            const movieElements = [
                { type: 'text', text: 'Global title' }
            ];

            const result = finalizeRequestBody(requestBody, scenes, movieElements);

            expect(result.scenes).toEqual(scenes);
            expect(result.elements).toEqual(movieElements);
        });

        test('should create default empty scene when no scenes provided', () => {
            const requestBody: VideoRequestBody = {
                fps: 25,
                width: 1024,
                height: 768,
                scenes: []
            };

            const result = finalizeRequestBody(requestBody, [], []);

            expect(result.scenes).toEqual([{ elements: [] }]);
            expect(result.elements).toBeUndefined();
        });
    });
});

// BLOCK 5
describe('Movie Element Processing', () => {
    let mockThis: any;
    let mockProcessTextElement: jest.Mock;
    let mockProcessSubtitleElement: jest.Mock;
    let mockValidateTextElementParams: jest.Mock;
    let mockValidateSubtitleElementParams: jest.Mock;
    let mockValidateMovieElements: jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks()
        mockThis = createMockExecuteFunctions();

        mockProcessTextElement = processTextElement as jest.Mock;
        mockProcessSubtitleElement = processSubtitleElement as jest.Mock;
        mockValidateTextElementParams = validateTextElementParams as jest.Mock;
        mockValidateSubtitleElementParams = validateSubtitleElementParams as jest.Mock;
        mockValidateMovieElements = validateMovieElements as jest.Mock;

        // Setup default mock returns
        mockValidateTextElementParams.mockReturnValue([]);
        mockValidateSubtitleElementParams.mockReturnValue([]);
        mockValidateMovieElements.mockReturnValue([]);
    });

    describe('processMovieTextElements', () => {
        test('should process movie text elements successfully', () => {
            const mockTextElements = [
                { text: 'Global Title', fontFamily: 'Arial', fontSize: '36px' }
            ];

            mockThis.getNodeParameter.mockImplementation((param: string) => {
                if (param === 'movieTextElements.textDetails') return mockTextElements;
                return [];
            });

            const expectedProcessedElement = {
                type: 'text',
                text: 'Global Title',
                settings: { 'font-family': 'Arial', 'font-size': '36px' }
            };

            mockProcessTextElement.mockReturnValue(expectedProcessedElement as any);

            const result = processMovieTextElements.call(mockThis, 0);

            expect(result).toHaveLength(1);
            expect(result[0]).toEqual(expectedProcessedElement);
            expect(mockValidateTextElementParams).toHaveBeenCalledWith(mockTextElements[0]);
            expect(mockProcessTextElement).toHaveBeenCalledWith(mockTextElements[0]);
        });

        test('should throw error for validation failures', () => {
            const mockTextElements = [
                { text: '', fontFamily: 'Arial' } // Invalid: empty text
            ];

            mockThis.getNodeParameter.mockImplementation((param: string) => {
                if (param === 'movieTextElements.textDetails') return mockTextElements;
                return [];
            });

            mockValidateTextElementParams.mockReturnValue(['Text content is required']);

            expect(() => {
                processMovieTextElements.call(mockThis, 0);
            }).toThrow('Movie text element validation errors:\nMovie text element 1: Text content is required');
        });
    });

    describe('processMovieSubtitleElements', () => {
        test('should process subtitle elements with URL detection', () => {
            const mockSubtitleElements = [
                {
                    captions: 'https://example.com/subtitles.srt',
                    language: 'en',
                    model: 'default'
                }
            ];

            mockThis.getNodeParameter.mockImplementation((param: string) => {
                if (param === 'movieElements.subtitleDetails') return mockSubtitleElements;
                return [];
            });

            const expectedProcessedElement = {
                type: 'subtitles',
                src: 'https://example.com/subtitles.srt',
                language: 'en',
                model: 'default'
            };

            mockProcessSubtitleElement.mockReturnValue(expectedProcessedElement as any);

            const result = processMovieSubtitleElements.call(mockThis, 0);

            expect(result).toHaveLength(1);
            expect(result[0]).toEqual(expectedProcessedElement);
        });

        test('should process subtitle elements with inline text', () => {
            const mockSubtitleElements = [
                {
                    captions: 'This is inline subtitle text',
                    language: 'es',
                    model: 'whisper'
                }
            ];

            mockThis.getNodeParameter.mockImplementation((param: string) => {
                if (param === 'movieElements.subtitleDetails') return mockSubtitleElements;
                return [];
            });

            const expectedProcessedElement = {
                type: 'subtitles',
                text: 'This is inline subtitle text',
                language: 'es',
                model: 'whisper'
            };

            mockProcessSubtitleElement.mockReturnValue(expectedProcessedElement as any);

            const result = processMovieSubtitleElements.call(mockThis, 0);

            expect(result).toHaveLength(1);
            expect(result[0]).toEqual(expectedProcessedElement);
        });

        test('should handle subtitle with start time', () => {
            const mockExecute = createMockExecuteFunctions();
            mockExecute.getNodeParameter = jest.fn().mockReturnValue([
                {
                    captions: 'Test subtitle',
                    start: 5.5
                    // No duration - should not be included
                }
            ]);

            const mockProcessedSubtitle = { type: 'subtitles' as const, text: 'Test subtitle' };
            (processSubtitleElement as jest.MockedFunction<typeof processSubtitleElement>)
                .mockReturnValue(mockProcessedSubtitle);
            (validateSubtitleElementParams as jest.MockedFunction<typeof validateSubtitleElementParams>)
                .mockReturnValue([]);

            const result = processMovieSubtitleElements.call(mockExecute, 0);

            expect(processSubtitleElement).toHaveBeenCalledWith({
                text: 'Test subtitle',
                start: 5.5
            });
            expect(result).toHaveLength(1);
        });

        test('should handle subtitle with duration but no start', () => {
            const mockExecute = createMockExecuteFunctions();
            mockExecute.getNodeParameter = jest.fn().mockReturnValue([
                {
                    captions: 'Test subtitle',
                    duration: 3.0
                    // No start - should not be included
                }
            ]);

            const mockProcessedSubtitle = { type: 'subtitles' as const, text: 'Test subtitle' };
            (processSubtitleElement as jest.MockedFunction<typeof processSubtitleElement>)
                .mockReturnValue(mockProcessedSubtitle);
            (validateSubtitleElementParams as jest.MockedFunction<typeof validateSubtitleElementParams>)
                .mockReturnValue([]);

            const result = processMovieSubtitleElements.call(mockExecute, 0);

            expect(processSubtitleElement).toHaveBeenCalledWith({
                text: 'Test subtitle',
                duration: 3.0
            });
            expect(result).toHaveLength(1);
        });

        test('should handle subtitle with undefined captions', () => {
            const mockExecute = createMockExecuteFunctions();
            mockExecute.getNodeParameter = jest.fn().mockReturnValue([
                {
                    captions: undefined,
                    language: 'en',
                    model: 'whisper'
                }
            ]);

            const mockProcessedSubtitle = { type: 'subtitles' as const };
            (processSubtitleElement as jest.MockedFunction<typeof processSubtitleElement>)
                .mockReturnValue(mockProcessedSubtitle);
            (validateSubtitleElementParams as jest.MockedFunction<typeof validateSubtitleElementParams>)
                .mockReturnValue([]);

            const result = processMovieSubtitleElements.call(mockExecute, 0);

            expect(processSubtitleElement).toHaveBeenCalledWith({
                language: 'en',
                model: 'whisper'
            });
            expect(result).toHaveLength(1);
        });
    });

    describe('processAllMovieElements', () => {
        test('should process all movie elements including text and subtitles', () => {
            const requestBody: VideoRequestBody = {
                fps: 25,
                width: 1024,
                height: 768,
                scenes: []
            };

            // Mock text elements
            mockThis.getNodeParameter.mockImplementation((param: string) => {
                if (param === 'movieTextElements.textDetails') return [{ text: 'Title' }];
                if (param === 'movieElements.subtitleDetails') return [{ captions: 'Subtitle text', language: 'en' }];
                if (param === 'movieElements.elementValues') return [{ type: 'audio', src: 'bg.mp3' }];
                return [];
            });

            mockProcessTextElement.mockReturnValue({ type: 'text', text: 'Title' } as any);
            mockProcessSubtitleElement.mockReturnValue({ type: 'subtitles', text: 'Subtitle text' } as any);

            const mockProcessElement = processElement as jest.MockedFunction<typeof processElement>;
            mockProcessElement.mockReturnValue({ type: 'audio', src: 'bg.mp3' });

            const result = processAllMovieElements.call(mockThis, 0, requestBody, true);

            expect(result).toHaveLength(3); // text + subtitle + audio
            expect(result[0]).toEqual({ type: 'text', text: 'Title' });
            expect(result[1]).toEqual({ type: 'subtitles', text: 'Subtitle text' });
            expect(result[2]).toEqual({ type: 'audio', src: 'bg.mp3' });
        });

        test('should exclude subtitles when includeSubtitles is false', () => {
            const requestBody: VideoRequestBody = {
                fps: 25,
                width: 1024,
                height: 768,
                scenes: []
            };

            mockThis.getNodeParameter.mockImplementation((param: string) => {
                if (param === 'movieTextElements.textDetails') return [{ text: 'Title' }];
                if (param === 'movieElements.elementValues') return [];
                return [];
            });

            mockProcessTextElement.mockReturnValue({ type: 'text', text: 'Title' } as any);

            const result = processAllMovieElements.call(mockThis, 0, requestBody, false);

            expect(result).toHaveLength(1); // Only text element
            expect(result[0]).toEqual({ type: 'text', text: 'Title' });
        });

        test('should call processAllMovieElements without includeSubtitles parameter', () => {
            const mockExecute = createMockExecuteFunctions();
            mockExecute.getNodeParameter = jest.fn()
                .mockReturnValueOnce([]) // movieTextElements.textDetails
                .mockReturnValueOnce([]); // movieElements.elementValues

            const requestBody = { fps: 25, width: 1024, height: 768, scenes: [] };

            const result = processAllMovieElements.call(mockExecute, 0, requestBody);

            expect(result).toBeDefined();
            expect(Array.isArray(result)).toBe(true);
        });
    });

    describe('processSceneTextElements', () => {
        test('should process scene text elements and add to scene elements array', () => {
            const sceneTextElements: TextElementParams[] = [
                { text: 'Scene subtitle', position: 'center-center' as const }
            ];
            const sceneElements: any[] = [];

            mockProcessTextElement.mockReturnValue({
                type: 'text',
                text: 'Scene subtitle',
                position: 'bottom-center'
            } as any);

            processSceneTextElements.call(mockThis, sceneTextElements, 0, sceneElements);

            expect(sceneElements).toHaveLength(1);
            expect(sceneElements[0]).toEqual({
                type: 'text',
                text: 'Scene subtitle',
                position: 'bottom-center'
            });
            expect(mockValidateTextElementParams).toHaveBeenCalledWith(sceneTextElements[0]);
            expect(mockProcessTextElement).toHaveBeenCalledWith(sceneTextElements[0]);
        });

        test('should handle empty scene text elements array', () => {
            const sceneElements: any[] = [{ type: 'video', src: 'test.mp4' }];
            const originalLength = sceneElements.length;

            processSceneTextElements.call(mockThis, [], 0, sceneElements);

            expect(sceneElements).toHaveLength(originalLength);
        });

        test('should throw error for scene text element validation failures', () => {
            const sceneTextElements = [
                { text: '', fontColor: 'invalid-color' }
            ];
            const sceneElements: any[] = [];

            mockValidateTextElementParams.mockReturnValue([
                'Text content is required',
                'fontColor must be a valid color'
            ]);

            expect(() => {
                processSceneTextElements.call(mockThis, sceneTextElements, 0, sceneElements);
            }).toThrow('Scene text element validation errors:\nScene 1 text element 1: Text content is required, fontColor must be a valid color');
        });
    });
    test('should handle validation errors in processMovieSubtitleElements', () => {
        mockThis.getNodeParameter.mockImplementation((param: string) => {
            if (param === 'movieElements.subtitleDetails') return [{ captions: '' }]; // Invalid
            return [];
        });

        const mockValidateSubtitleElementParams = validateSubtitleElementParams as jest.Mock;
        mockValidateSubtitleElementParams.mockReturnValue(['Captions required']);

        expect(() => {
            processMovieSubtitleElements.call(mockThis, 0);
        }).toThrow('Movie subtitle element validation errors');
    });
});

describe('processMovieElements (Existing Tests)', () => {

    test('should handle empty movieElements array', () => {
        const mockExecute = createMockExecuteFunctions();
        const movieElements: IDataObject[] = [];
        const allMovieElements: IDataObject[] = [];
        const requestBody = { width: 1024, height: 768 };

        processMovieElements.call(mockExecute, movieElements, requestBody, allMovieElements);

        expect(allMovieElements).toHaveLength(0);
        expect(processTextElement).not.toHaveBeenCalled();
        expect(processSubtitleElement).not.toHaveBeenCalled();
        expect(processElement).not.toHaveBeenCalled();
    });

    test('should handle null or undefined movieElements', () => {
        const mockExecute = createMockExecuteFunctions();
        const allMovieElements: IDataObject[] = [];
        const requestBody = { width: 1024, height: 768 };

        // Test null
        processMovieElements.call(mockExecute, null as any, requestBody, allMovieElements);
        expect(allMovieElements).toHaveLength(0);

        // Test undefined
        processMovieElements.call(mockExecute, undefined as any, requestBody, allMovieElements);
        expect(allMovieElements).toHaveLength(0);
    });

    test('should process text elements correctly', () => {
        const mockExecute = createMockExecuteFunctions();
        const mockProcessedText = { type: 'text', text: 'Processed text', settings: {} };
        (processTextElement as jest.MockedFunction<typeof processTextElement>)
            .mockReturnValue(mockProcessedText as any);

        const movieElements: IDataObject[] = [
            {
                type: 'text',
                text: 'Test text',
                start: 0,
                duration: 5,
                style: '001',
                position: 'center-center',
                'font-family': 'Arial',
                'font-size': '24px',
                color: '#FF0000'
            }
        ];
        const allMovieElements: IDataObject[] = [];
        const requestBody = { width: 1024, height: 768 };

        processMovieElements.call(mockExecute, movieElements, requestBody, allMovieElements);

        expect(processTextElement).toHaveBeenCalledWith({
            text: 'Test text',
            start: 0,
            duration: 5,
            style: '001',
            position: 'center-center',
            fontFamily: 'Arial',
            fontSize: '24px',
            fontColor: '#FF0000'
        });
        expect(allMovieElements).toHaveLength(1);
        expect(allMovieElements[0]).toEqual(mockProcessedText);
    });

    test('should handle text elements with missing properties', () => {
        const mockExecute = createMockExecuteFunctions();
        const mockProcessedText = { type: 'text', text: '', settings: {} };
        (processTextElement as jest.MockedFunction<typeof processTextElement>)
            .mockReturnValue(mockProcessedText as any);

        const movieElements: IDataObject[] = [
            {
                type: 'text',
                // Missing text property - should pass empty object to let API handle validation
            }
        ];
        const allMovieElements: IDataObject[] = [];
        const requestBody = { width: 1024, height: 768 };

        processMovieElements.call(mockExecute, movieElements, requestBody, allMovieElements);

        // Should pass empty object since no text was provided
        expect(processTextElement).toHaveBeenCalledWith({});
        expect(allMovieElements).toHaveLength(1);
    });

    test('should handle text elements with undefined values', () => {
        const mockExecute = createMockExecuteFunctions();
        const mockProcessedText = { type: 'text', text: 'Test', settings: {} };
        (processTextElement as jest.MockedFunction<typeof processTextElement>)
            .mockReturnValue(mockProcessedText as any);

        const movieElements: IDataObject[] = [
            {
                type: 'text',
                text: 'Test',
                start: undefined,
                duration: undefined,
                'font-family': undefined
            }
        ];
        const allMovieElements: IDataObject[] = [];
        const requestBody = { width: 1024, height: 768 };

        processMovieElements.call(mockExecute, movieElements, requestBody, allMovieElements);

        // Should only include defined properties
        expect(processTextElement).toHaveBeenCalledWith({
            text: 'Test'
        });
    });

    test('should process subtitle elements correctly', () => {
        const mockExecute = createMockExecuteFunctions();
        const mockProcessedSubtitle = { type: 'subtitles', text: 'Subtitle text', language: 'en' };
        (processSubtitleElement as jest.MockedFunction<typeof processSubtitleElement>)
            .mockReturnValue(mockProcessedSubtitle as any);

        const movieElements: IDataObject[] = [
            {
                type: 'subtitles',
                captions: 'Subtitle content',
                language: 'es',
                model: 'whisper',
                start: 2,
                duration: 10
            }
        ];
        const allMovieElements: IDataObject[] = [];
        const requestBody = { width: 1024, height: 768 };

        processMovieElements.call(mockExecute, movieElements, requestBody, allMovieElements);

        expect(processSubtitleElement).toHaveBeenCalledWith({
            captions: 'Subtitle content',
            language: 'es',
            model: 'whisper',
            start: 2,
            duration: 10
        });
        expect(allMovieElements).toHaveLength(1);
        expect(allMovieElements[0]).toEqual(mockProcessedSubtitle);
    });

    test('should handle subtitle elements with default values', () => {
        const mockExecute = createMockExecuteFunctions();
        const mockProcessedSubtitle = { type: 'subtitles', text: '', language: 'en' };
        (processSubtitleElement as jest.MockedFunction<typeof processSubtitleElement>)
            .mockReturnValue(mockProcessedSubtitle as any);

        const movieElements: IDataObject[] = [
            {
                type: 'subtitles',
                captions: 'Test subtitle'
                // Missing language and model - should only pass what was provided
            }
        ];
        const allMovieElements: IDataObject[] = [];
        const requestBody = { width: 1024, height: 768 };

        processMovieElements.call(mockExecute, movieElements, requestBody, allMovieElements);

        expect(processSubtitleElement).toHaveBeenCalledWith({
            captions: 'Test subtitle'
        });
    });

    test('should process other element types using unified processors', () => {
        const mockExecute = createMockExecuteFunctions();
        const mockProcessedElement = { type: 'image', src: 'processed.jpg' };

        // Mock the unified processors instead of processElement directly
        const mockProcessElement = processElement as jest.MockedFunction<typeof processElement>;
        mockProcessElement.mockReturnValue(mockProcessedElement);

        const movieElements: IDataObject[] = [
            {
                type: 'image',
                src: 'test.jpg',
                duration: 5
            },
            {
                type: 'video',
                src: 'test.mp4',
                duration: 10
            }
        ];
        const allMovieElements: IDataObject[] = [];
        const requestBody = { width: 1024, height: 768 };

        processMovieElements.call(mockExecute, movieElements, requestBody, allMovieElements);

        expect(allMovieElements).toHaveLength(2);
        expect(allMovieElements[0]).toEqual(mockProcessedElement);
        expect(allMovieElements[1]).toEqual(mockProcessedElement);
    });

    test('should handle mixed element types', () => {
        const mockExecute = createMockExecuteFunctions();
        const mockProcessedText = { type: 'text', text: 'Text element' };
        const mockProcessedSubtitle = { type: 'subtitles', text: 'Subtitle element' };
        const mockProcessedImage = { type: 'image', src: 'image.jpg' };

        jest.clearAllMocks();

        (processTextElement as jest.MockedFunction<typeof processTextElement>)
            .mockReturnValue(mockProcessedText as any);
        (processSubtitleElement as jest.MockedFunction<typeof processSubtitleElement>)
            .mockReturnValue(mockProcessedSubtitle as any);
        (processElement as jest.MockedFunction<typeof processElement>)
            .mockReturnValue(mockProcessedImage);

        const movieElements: IDataObject[] = [
            { type: 'text', text: 'Test text' },
            { type: 'subtitles', captions: 'Test subtitle', language: 'en' },
            { type: 'image', src: 'test.jpg' }
        ];
        const allMovieElements: IDataObject[] = [];
        const requestBody = { width: 1024, height: 768 };

        processMovieElements.call(mockExecute, movieElements, requestBody, allMovieElements);

        expect(processTextElement).toHaveBeenCalledTimes(1);
        expect(processSubtitleElement).toHaveBeenCalledTimes(1);
        expect(allMovieElements).toHaveLength(3);
        expect(allMovieElements[0]).toEqual(mockProcessedText);
        expect(allMovieElements[1]).toEqual(mockProcessedSubtitle);
        expect(allMovieElements[2]).toEqual(mockProcessedImage);
    });

    test('should handle processing errors and continue with other elements', () => {
        const mockExecute = createMockExecuteFunctions();
        const mockProcessedText = { type: 'text', text: 'Success' };

        (processTextElement as jest.MockedFunction<typeof processTextElement>)
            .mockImplementationOnce(() => {
                throw new Error('Text processing failed');
            })
            .mockReturnValue(mockProcessedText as any);

        const movieElements: IDataObject[] = [
            { type: 'text', text: 'Failing text' },
            { type: 'text', text: 'Success text' }
        ];
        const allMovieElements: IDataObject[] = [];
        const requestBody = { width: 1024, height: 768 };

        processMovieElements.call(mockExecute, movieElements, requestBody, allMovieElements);

        expect(mockExecute.logger.warn).toHaveBeenCalledWith('Failed to process movie element of type text: Error: Text processing failed');
        expect(allMovieElements).toHaveLength(1);
        expect(allMovieElements[0]).toEqual(mockProcessedText);
    });

    test('should handle position validation for text elements', () => {
        const mockExecute = createMockExecuteFunctions();
        jest.clearAllMocks();

        const mockProcessedText = { type: 'text', text: 'Test' };
        (processTextElement as jest.MockedFunction<typeof processTextElement>)
            .mockReturnValue(mockProcessedText as any);

        const movieElements: IDataObject[] = [
            {
                type: 'text',
                text: 'Test with valid position',
                position: 'top-left'
            },
            {
                type: 'text',
                text: 'Test with invalid position',
                position: 'invalid-position'
            },
            {
                type: 'text',
                text: 'Test with non-string position',
                position: 123
            }
        ];
        const allMovieElements: IDataObject[] = [];
        const requestBody = { width: 1024, height: 768 };

        processMovieElements.call(mockExecute, movieElements, requestBody, allMovieElements);

        // First call should include position
        expect(processTextElement).toHaveBeenNthCalledWith(1, {
            text: 'Test with valid position',
            position: 'top-left'
        });

        // Second call should include position (string passed through)
        expect(processTextElement).toHaveBeenNthCalledWith(2, {
            text: 'Test with invalid position',
            position: 'invalid-position'
        });

        // Third call should not include position (non-string)
        expect(processTextElement).toHaveBeenNthCalledWith(3, {
            text: 'Test with non-string position'
        });
    });

    test('should maintain allMovieElements array reference', () => {
        const mockExecute = createMockExecuteFunctions();
        const mockProcessedText = { type: 'text', text: 'Test' };
        (processTextElement as jest.MockedFunction<typeof processTextElement>)
            .mockReturnValue(mockProcessedText as any);

        const movieElements: IDataObject[] = [
            { type: 'text', text: 'Test text' }
        ];
        const allMovieElements: IDataObject[] = [];
        const originalReference = allMovieElements;
        const requestBody = { width: 1024, height: 768 };

        processMovieElements.call(mockExecute, movieElements, requestBody, allMovieElements);

        // Should modify the same array reference, not create a new one
        expect(allMovieElements).toBe(originalReference);
        expect(allMovieElements).toHaveLength(1);
    });

    test('should handle invalid element objects gracefully', () => {
        const mockExecute = createMockExecuteFunctions();
        const movieElements = [
            null,
            { type: 'unknown-type', data: 'test' },
            { /* missing type */ },
            'invalid-element'
        ];
        const requestBody = { width: 1920, height: 1080 };
        const allMovieElements: any[] = [];

        processMovieElements.call(mockExecute, movieElements as any, requestBody, allMovieElements);

        expect(allMovieElements).toHaveLength(0);
        expect(mockExecute.logger.warn).toHaveBeenCalledWith('Movie element missing type property');
        expect(mockExecute.logger.warn).toHaveBeenCalledWith('Unknown movie element type: unknown-type');
    });

    test('should handle unified processor errors gracefully', () => {
        const mockExecute = createMockExecuteFunctions();
        const movieElements = [
            { type: 'video', src: 'test.mp4' }
        ];
        const requestBody = { width: 1920, height: 1080 };
        const allMovieElements: any[] = [];

        // Mock unified processor to throw error
        const mockProcessElement = processElement as jest.MockedFunction<typeof processElement>;
        mockProcessElement.mockImplementation(() => {
            throw new Error('Unified processor failed');
        });

        processMovieElements.call(mockExecute, movieElements, requestBody, allMovieElements);

        expect(allMovieElements).toHaveLength(0);
        expect(mockExecute.logger.warn).toHaveBeenCalledWith(
            expect.stringContaining('Failed to process movie element of type video')
        );
    });

    test('should process voice elements in movie elements', () => {
        const mockExecute = createMockExecuteFunctions();
        jest.clearAllMocks();

        const mockProcessedVoice = { type: 'voice', text: 'Hello world', voice: 'en-US-AriaNeural' };
        const mockProcessElement = processElement as jest.Mock;
        mockProcessElement.mockReturnValue(mockProcessedVoice);

        const movieElements: IDataObject[] = [
            {
                type: 'voice',
                text: 'Hello world',
                voice: 'en-US-AriaNeural'
            }
        ];
        const allMovieElements: IDataObject[] = [];
        const requestBody = { width: 1024, height: 768 };

        processMovieElements.call(mockExecute, movieElements, requestBody, allMovieElements);

        expect(allMovieElements).toHaveLength(1);
        expect(allMovieElements[0]).toEqual(mockProcessedVoice);
    });
});

// BLOCK 7
describe('Error Handling and Edge Cases', () => {
    let mockThis: any;

    beforeEach(() => {
        jest.clearAllMocks()
        mockThis = createMockExecuteFunctions();
    });

    test('should handle getNodeParameter errors by throwing', () => {
        mockThis.getNodeParameter.mockImplementation((param: string) => {
            if (param === 'movieTextElements.textDetails') {
                throw new Error('Parameter not found');
            }
            return [];
        });

        expect(() => {
            processMovieTextElements.call(mockThis, 0);
        }).toThrow('Parameter not found');
    });

    test('should handle malformed element data in processMovieElements', () => {
        const movieElements = [
            { type: 'video' }, // Missing src
            { type: 'audio', src: '' }, // Empty src
            { type: 'text' } // Missing text
        ];
        const requestBody = { width: 1920, height: 1080 };
        const allMovieElements: any[] = [];

        const mockProcessElement = processElement as jest.MockedFunction<typeof processElement>;
        mockProcessElement.mockReturnValue({ type: 'processed' });

        processMovieElements.call(mockThis, movieElements, requestBody, allMovieElements);

        // Should still process elements, even if they have missing properties
        expect(allMovieElements.length).toBeGreaterThanOrEqual(1);
    });

    test('should handle complex error scenarios in processAllMovieElements', () => {
        const requestBody: VideoRequestBody = {
            fps: 25,
            width: 1024,
            height: 768,
            scenes: []
        };

        // Mock to throw validation errors
        const mockValidateMovieElements = validateMovieElements as jest.MockedFunction<typeof validateMovieElements>;
        mockValidateMovieElements.mockReturnValue(['Validation error']);

        mockThis.getNodeParameter.mockImplementation((param: string) => {
            if (param === 'movieElements.elementValues') return [{ type: 'invalid' }];
            return [];
        });

        expect(() => {
            processAllMovieElements.call(mockThis, 0, requestBody, false);
        }).toThrow('Movie element validation errors');
    });
});

describe('Backward Compatibility Tests', () => {
    test('should maintain compatibility with existing movieElements processing', () => {
        const mockExecute = createMockExecuteFunctions();
        const movieElements: IDataObject[] = [
            {
                type: 'video',
                src: 'legacy-video.mp4',
                duration: 10
            }
        ];
        const allMovieElements: IDataObject[] = [];
        const requestBody = { width: 1024, height: 768 };

        const mockProcessElement = processElement as jest.MockedFunction<typeof processElement>;
        mockProcessElement.mockReturnValue({
            type: 'video',
            src: 'legacy-video.mp4',
            duration: 10,
            processed: true
        });

        processMovieElements.call(mockExecute, movieElements, requestBody, allMovieElements);

        expect(allMovieElements).toHaveLength(1);
        expect(allMovieElements[0]).toHaveProperty('processed', true);
    });

    test('should maintain existing function signatures', () => {
        const mockExecute = createMockExecuteFunctions();

        // These should all work without errors (signature compatibility)
        expect(() => getParameterValue.call(mockExecute, 'test')).not.toThrow();
        expect(() => initializeRequestBody.call(mockExecute, 0)).not.toThrow();
        expect(() => processMovieTextElements.call(mockExecute, 0)).not.toThrow();
        expect(() => processMovieSubtitleElements.call(mockExecute, 0)).not.toThrow();
    });
});
