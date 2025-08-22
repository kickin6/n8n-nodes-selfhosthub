// __tests__/nodes/CreateJ2vMovie/utils/requestBuilder/advancedBuilder.test.ts

import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { buildRequestBody, buildCreateMovieRequestBody, buildMergeVideoAudioRequestBody, buildMergeVideosRequestBody } from '@nodes/CreateJ2vMovie/utils/requestBuilder';

describe('requestBuilder - Advanced Mode', () => {
    describe('buildRequestBody - Advanced Mode', () => {
        test('should handle advanced mode with valid JSON template for createMovie', () => {
            const validJsonTemplate = JSON.stringify({
                width: 1920,
                height: 1080,
                fps: 30,
                elements: [
                    {
                        type: 'text',
                        text: 'Advanced Mode Test',
                        'font-family': 'Arial',
                        'font-size': 48,
                        color: '#ff0000'
                    }
                ]
            });

            const mockExecute = {
                getNodeParameter: (parameterName: string, itemIndex: number, fallbackValue?: any) => {
                    if (parameterName === 'operation') return 'createMovie';
                    if (parameterName === 'jsonTemplate') return validJsonTemplate;
                    return fallbackValue;
                },
                logger: {
                    debug: jest.fn(),
                    warn: jest.fn(),
                    info: jest.fn(),
                    error: jest.fn(),
                }
            };

            const result = buildRequestBody.call(
                mockExecute as unknown as IExecuteFunctions,
                'createMovie',
                0,
                true
            );

            expect(result).toHaveProperty('width', 1920);
            expect(result).toHaveProperty('height', 1080);
            expect(result).toHaveProperty('fps', 30);
            expect(result).toHaveProperty('elements');
            const elements = result.elements as any[];
            expect(elements.length).toBe(1);
            expect(elements[0].text).toBe('Advanced Mode Test');
        });

        test('should handle advanced mode with mergeVideoAudio operation', () => {
            const validJsonTemplate = JSON.stringify({
                scenes: [{ elements: [] }]
            });

            const mockExecute = {
                getNodeParameter: (parameterName: string, itemIndex: number, fallbackValue?: any) => {
                    if (parameterName === 'operation') return 'mergeVideoAudio';
                    if (parameterName === 'jsonTemplateMergeAudio') return validJsonTemplate;
                    return fallbackValue;
                },
                logger: {
                    debug: jest.fn(),
                    warn: jest.fn(),
                    info: jest.fn(),
                    error: jest.fn(),
                }
            };

            const result = buildRequestBody.call(
                mockExecute as unknown as IExecuteFunctions,
                'mergeVideoAudio',
                0,
                true
            );

            expect(result).toHaveProperty('scenes');
        });

        test('should handle advanced mode with mergeVideos operation', () => {
            const validJsonTemplate = JSON.stringify({
                scenes: [{ elements: [] }]
            });

            const mockExecute = {
                getNodeParameter: (parameterName: string, itemIndex: number, fallbackValue?: any) => {
                    if (parameterName === 'operation') return 'mergeVideos';
                    if (parameterName === 'jsonTemplateMergeVideos') return validJsonTemplate;
                    return fallbackValue;
                },
                logger: {
                    debug: jest.fn(),
                    warn: jest.fn(),
                    info: jest.fn(),
                    error: jest.fn(),
                }
            };

            const result = buildRequestBody.call(
                mockExecute as unknown as IExecuteFunctions,
                'mergeVideos',
                0,
                true
            );

            expect(result).toHaveProperty('scenes');
        });

        test('should throw error with invalid JSON template in advanced mode', () => {
            const invalidJsonTemplate = '{invalid: json}';

            const mockExecute = {
                getNodeParameter: (parameterName: string, itemIndex: number, fallbackValue?: any) => {
                    if (parameterName === 'operation') return 'createMovie';
                    if (parameterName === 'jsonTemplate') return invalidJsonTemplate;
                    return fallbackValue;
                },
                logger: {
                    debug: jest.fn(),
                    warn: jest.fn(),
                    info: jest.fn(),
                    error: jest.fn(),
                }
            };

            expect(() => {
                buildRequestBody.call(
                    mockExecute as unknown as IExecuteFunctions,
                    'createMovie',
                    0,
                    true
                );
            }).toThrow('Invalid JSON template:');
        });

        test('should handle advanced mode with overrides', () => {
            const templateWithoutOverrides = JSON.stringify({
                width: 1280,
                height: 720,
                elements: []
            });

            const mockExecute = {
                getNodeParameter: (parameterName: string, itemIndex: number, fallbackValue?: any) => {
                    const paramMap: { [key: string]: any } = {
                        'operation': 'createMovie',
                        'jsonTemplate': templateWithoutOverrides,
                        'recordId': 'override-123',
                        'outputWidth': 1920,
                        'outputHeight': 1080,
                        'framerate': 30,
                        'webhookUrl': 'https://webhook.site/override',
                        'quality': 'high',
                        'cache': true,
                        'draft': false,
                        'resolution': '4K'
                    };

                    if (paramMap[parameterName] !== undefined) {
                        return paramMap[parameterName];
                    }

                    return fallbackValue;
                },
                logger: {
                    debug: jest.fn(),
                    warn: jest.fn(),
                    info: jest.fn(),
                    error: jest.fn(),
                }
            };

            const result = buildRequestBody.call(
                mockExecute as unknown as IExecuteFunctions,
                'createMovie',
                0,
                true
            );

            expect(result).toHaveProperty('id', 'override-123');
            expect(result).toHaveProperty('width', 1920);
            expect(result).toHaveProperty('height', 1080);
            expect(result).toHaveProperty('fps', 30);
            expect(result).toHaveProperty('quality', 'high');
            expect(result).toHaveProperty('cache', true);
            expect(result).toHaveProperty('draft', false);
            expect(result).toHaveProperty('resolution', '4K');
            expect(result).toHaveProperty('webhook');
        });

        test('should handle advanced mode overrides with null values', () => {
            const templateWithoutOverrides = JSON.stringify({
                width: 1280,
                height: 720
            });

            const mockExecute = {
                getNodeParameter: (parameterName: string, itemIndex: number, fallbackValue?: any) => {
                    const paramMap: { [key: string]: any } = {
                        'operation': 'createMovie',
                        'jsonTemplate': templateWithoutOverrides,
                        'recordId': '',
                        'outputWidth': null,
                        'outputHeight': null,
                        'framerate': null,
                        'webhookUrl': '',
                        'quality': null,
                        'cache': null,
                        'draft': null,
                        'resolution': null
                    };

                    if (paramMap.hasOwnProperty(parameterName)) {
                        return paramMap[parameterName];
                    }

                    return fallbackValue;
                },
                logger: {
                    debug: jest.fn(),
                    warn: jest.fn(),
                    info: jest.fn(),
                    error: jest.fn(),
                }
            };

            const result = buildRequestBody.call(
                mockExecute as unknown as IExecuteFunctions,
                'createMovie',
                0,
                true
            );

            expect(result).toHaveProperty('width', 1280);
            expect(result).toHaveProperty('height', 720);
            expect(result).not.toHaveProperty('id');
            expect(result).not.toHaveProperty('webhook');
        });

        test('should handle parameter access errors in advanced mode overrides', () => {
            const templateWithoutOverrides = JSON.stringify({
                width: 1280,
                height: 720
            });

            const mockExecute = {
                getNodeParameter: (parameterName: string, itemIndex: number, fallbackValue?: any) => {
                    if (parameterName === 'jsonTemplate') return templateWithoutOverrides;
                    if (parameterName === 'recordId') return 'test-id';
                    if (parameterName === 'outputWidth') return 1920;
                    if (parameterName === 'outputHeight') return 1080;
                    if (parameterName === 'framerate') return 30;
                    if (parameterName === 'webhookUrl') return 'https://example.com/webhook';

                    if (['quality', 'cache', 'draft', 'resolution'].includes(parameterName)) {
                        throw new Error('Parameter not available');
                    }

                    return fallbackValue;
                },
                logger: {
                    debug: jest.fn(),
                    warn: jest.fn(),
                    info: jest.fn(),
                    error: jest.fn(),
                }
            };

            const result = buildRequestBody.call(
                mockExecute as unknown as IExecuteFunctions,
                'createMovie',
                0,
                true
            );

            expect(result).toHaveProperty('id', 'test-id');
            expect(result).toHaveProperty('width', 1920);
            expect(result).toHaveProperty('height', 1080);
            expect(result).toHaveProperty('fps', 30);
            expect(result).toHaveProperty('webhook');

            expect(result).not.toHaveProperty('quality');
            expect(result).not.toHaveProperty('cache');
            expect(result).not.toHaveProperty('draft');
            expect(result).not.toHaveProperty('resolution');
        });

        test('should handle JSON parsing error without message property', () => {
            const mockExecute = {
                getNodeParameter: (parameterName: string, itemIndex: number, fallbackValue?: any) => {
                    if (parameterName === 'jsonTemplate') return '{invalid json}';
                    return fallbackValue;
                },
                logger: {
                    debug: jest.fn(),
                    warn: jest.fn(),
                    info: jest.fn(),
                    error: jest.fn(),
                }
            };

            const originalJSONParse = JSON.parse;
            JSON.parse = jest.fn().mockImplementation(() => {
                const error: any = {};
                throw error;
            });

            try {
                expect(() => {
                    buildRequestBody.call(
                        mockExecute as unknown as IExecuteFunctions,
                        'createMovie',
                        0,
                        true
                    );
                }).toThrow('Invalid JSON template: Unknown parsing error');
            } finally {
                JSON.parse = originalJSONParse;
            }
        });

        test('should use default parameters when itemIndex and isAdvancedMode not provided', () => {
            const mockExecute = {
                getNodeParameter: (parameterName: string, itemIndex: number, fallbackValue?: any) => {
                    if (parameterName === 'framerate') return 25;
                    if (parameterName === 'output_width') return 1024;
                    if (parameterName === 'output_height') return 768;
                    return fallbackValue;
                },
                logger: {
                    debug: jest.fn(),
                    warn: jest.fn(),
                    info: jest.fn(),
                    error: jest.fn(),
                }
            };

            const result = buildRequestBody.call(
                mockExecute as unknown as IExecuteFunctions,
                'createMovie'
            );

            expect(result).toHaveProperty('fps', 25);
        });

        test('should test audio loop logic directly', () => {
            const mockExecute = {
                getNodeParameter: (parameterName: string, itemIndex: number, fallbackValue?: any) => {
                    if (parameterName === 'audioElement') {
                        throw new Error('audioElement not available');
                    }
                    if (parameterName === 'audioElement.audioDetails') {
                        return {
                            src: 'https://example.com/audio.mp3',
                            loop: false
                        };
                    }
                    return fallbackValue;
                },
                logger: {
                    debug: jest.fn(),
                    warn: jest.fn(),
                    info: jest.fn(),
                    error: jest.fn(),
                }
            };

            const result = buildRequestBody.call(
                mockExecute as unknown as IExecuteFunctions,
                'mergeVideoAudio',
                0,
                false
            );

            const scenes = result.scenes as any[];
            const audioElement = scenes[0].elements.find((el: any) => el.type === 'audio');
            expect(audioElement.loop).toBe(1);
        });

        test('buildCreateMovieRequestBody should use default itemIndex', () => {
            const mockExecute = {
                getNodeParameter: jest.fn().mockReturnValue(''),
                logger: { debug: jest.fn(), warn: jest.fn(), info: jest.fn(), error: jest.fn() }
            };

            expect(() => {
                buildCreateMovieRequestBody.call(mockExecute as unknown as IExecuteFunctions);
            }).not.toThrow();
        });

        test('buildMergeVideoAudioRequestBody should use default itemIndex', () => {
            const mockExecute = {
                getNodeParameter: jest.fn().mockReturnValue(''),
                logger: { debug: jest.fn(), warn: jest.fn(), info: jest.fn(), error: jest.fn() }
            };

            expect(() => {
                buildMergeVideoAudioRequestBody.call(mockExecute as unknown as IExecuteFunctions);
            }).not.toThrow();
        });

        test('buildMergeVideosRequestBody should use default itemIndex', () => {
            const mockExecute = {
                getNodeParameter: jest.fn().mockReturnValue(''),
                logger: { debug: jest.fn(), warn: jest.fn(), info: jest.fn(), error: jest.fn() }
            };

            expect(() => {
                buildMergeVideosRequestBody.call(mockExecute as unknown as IExecuteFunctions);
            }).not.toThrow();
        });
    });
});