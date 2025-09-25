// __tests__/nodes/CreateJ2vMovie/CreateJ2vMovie.test.ts

import { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { CreateJ2vMovie, extractErrorMessage, extractParameterErrorMessage, extractMainErrorMessage, isEmptyRequest, createBaseArray } from '../../../nodes/CreateJ2vMovie/CreateJ2vMovie.node';

describe('CreateJ2vMovie Node', () => {
    let node: CreateJ2vMovie;
    let mockExecute: any;
    let mockRequest: jest.MockedFunction<any>;

    beforeEach(() => {
        node = new CreateJ2vMovie();

        mockRequest = jest.fn();

        mockExecute = {
            getInputData: jest.fn(),
            getNodeParameter: jest.fn(),
            getCredentials: jest.fn(),
            helpers: {
                request: mockRequest,
                httpRequest: jest.fn(),
                httpRequestWithAuthentication: jest.fn(),
                requestWithAuthenticationPaginated: jest.fn(),
                requestWithAuthentication: jest.fn(),
                requestOAuth2: jest.fn(),
                requestOAuth1: jest.fn(),
            } as any,
            continueOnFail: jest.fn(),
        };

        jest.clearAllMocks();
    });

    describe('basic node structure', () => {
        it('should have correct node description', () => {
            expect(node.description.displayName).toBe('Create JSON2Video Movie');
            expect(node.description.name).toBe('createJ2vMovie');
            expect(node.description.icon).toBe('file:createJ2vMovie.png');
            expect(node.description.group).toEqual(['transform']);
            expect(node.description.version).toBe(1);
            expect(node.description.description).toBe('Create videos with the JSON2Video API');
            expect(node.description.defaults).toEqual({ name: 'Create JSON2Video Movie' });
            expect(Array.isArray(node.description.inputs)).toBe(true);
            expect(Array.isArray(node.description.outputs)).toBe(true);
            expect(Array.isArray(node.description.credentials)).toBe(true);
        });

        it('should have correct subtitle display', () => {
            expect(node.description.subtitle).toBe('={{$parameter["advancedMode"] ? "Advanced Mode" : "Create Movie"}}');
        });

        it('should have correct request defaults', () => {
            expect(node.description.requestDefaults).toEqual({
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
            });
        });
    });

    const createValidParameterMock = (overrides: any = {}) => {
        const baseParams: any = {
            advancedMode: false,
            recordId: '',
            showMovieSettings: false,
            enableSubtitles: false,
            elements: {
                elementValues: [{ type: 'text', text: 'Test text' }]
            },
            outputSettings: {
                outputValues: { width: 1920, height: 1080, quality: 'high', cache: true }
            },
            exportSettings: {},
            webhookUrl: '',
            templateType: 'blank',
            jsonTemplateBlank: '{"scenes": [{"elements": []}]}',
            ...overrides
        };

        return (paramName: string, itemIndex: number, defaultValue?: any) => {
            if (paramName in baseParams) {
                return baseParams[paramName];
            }
            return defaultValue;
        };
    };

    describe('execute method', () => {
        describe('successful execution', () => {
            it('should execute successfully with basic mode', async () => {
                const inputData: INodeExecutionData[] = [{ json: {} }];

                mockExecute.getInputData.mockReturnValue(inputData);
                mockExecute.continueOnFail.mockReturnValue(false);
                mockExecute.getNodeParameter.mockImplementation(createValidParameterMock());
                mockExecute.getCredentials.mockResolvedValue({
                    apiKey: 'test-api-key'
                });

                mockRequest.mockResolvedValue({
                    statusCode: 200,
                    body: { success: true, id: 'video-123' }
                });

                const result = await node.execute.call(mockExecute as IExecuteFunctions);

                expect(result).toBeDefined();
                expect(Array.isArray(result)).toBe(true);
                expect(result.length).toBe(1);
                expect(Array.isArray(result[0])).toBe(true);
                expect(result[0].length).toBe(1);
                expect(result[0][0].json.success).toBe(true);
                expect(result[0][0].json.id).toBe('video-123');
                expect(result[0][0].json.itemIndex).toBe(0);
                expect(result[0][0].json.timestamp).toBeDefined();
            });

            it('should execute successfully with advanced mode and blank template', async () => {
                const inputData: INodeExecutionData[] = [{ json: {} }];

                mockExecute.getInputData.mockReturnValue(inputData);
                mockExecute.continueOnFail.mockReturnValue(false);
                mockExecute.getNodeParameter.mockImplementation(
                    createValidParameterMock({
                        advancedMode: true,
                        templateType: 'blank',
                        jsonTemplateBlank: JSON.stringify({
                            width: 1920,
                            height: 1080,
                            scenes: [{ elements: [{ type: 'text', text: 'Advanced test' }] }]
                        })
                    })
                );
                mockExecute.getCredentials.mockResolvedValue({
                    apiKey: 'test-api-key'
                });

                mockRequest.mockResolvedValue({
                    statusCode: 200,
                    body: { success: true, id: 'video-adv-123' }
                });

                const result = await node.execute.call(mockExecute as IExecuteFunctions);

                expect(result).toBeDefined();
                expect(result[0][0].json.success).toBe(true);
                expect(mockRequest).toHaveBeenCalledWith(
                    expect.objectContaining({
                        body: expect.objectContaining({
                            width: 1920,
                            height: 1080,
                            scenes: expect.any(Array)
                        })
                    })
                );
            });

            it('should handle different template types in advanced mode', async () => {
                const templates = [
                    { type: 'videoImage', field: 'jsonTemplateVideoImage' },
                    { type: 'videoAudio', field: 'jsonTemplateVideoAudio' },
                    { type: 'videoSequence', field: 'jsonTemplateVideoSequence' },
                    { type: 'slideshow', field: 'jsonTemplateSlideshow' },
                    { type: 'textOverlay', field: 'jsonTemplateTextOverlay' },
                    { type: 'faceless', field: 'jsonTemplateFaceless' },
                    { type: 'socialStory', field: 'jsonTemplateSocialStory' },
                    { type: 'presentation', field: 'jsonTemplatePresentation' }
                ];

                for (const template of templates) {
                    const inputData: INodeExecutionData[] = [{ json: {} }];
                    const params: any = {
                        advancedMode: true,
                        templateType: template.type
                    };
                    params[template.field] = JSON.stringify({
                        width: 1920,
                        height: 1080,
                        scenes: [{
                            elements: [{
                                type: 'text',
                                text: 'Test content',
                                duration: 5
                            }]
                        }]
                    });

                    mockExecute.getInputData.mockReturnValue(inputData);
                    mockExecute.continueOnFail.mockReturnValue(false);
                    mockExecute.getNodeParameter.mockImplementation(createValidParameterMock(params));
                    mockExecute.getCredentials.mockResolvedValue({
                        apiKey: 'test-api-key'
                    });

                    mockRequest.mockResolvedValue({
                        statusCode: 200,
                        body: { success: true }
                    });

                    const result = await node.execute.call(mockExecute as IExecuteFunctions);

                    expect(result[0][0].json.success).toBe(true);
                }
            });

            it('should handle URL parameters correctly', async () => {
                const inputData: INodeExecutionData[] = [{ json: {} }];

                mockExecute.getInputData.mockReturnValue(inputData);
                mockExecute.continueOnFail.mockReturnValue(false);
                mockExecute.getNodeParameter.mockImplementation(
                    createValidParameterMock({
                        webhookUrl: 'https://example.com/webhook',
                        recordId: 'record-123'
                    })
                );
                mockExecute.getCredentials.mockResolvedValue({
                    apiKey: 'test-api-key'
                });

                mockRequest.mockResolvedValue({
                    statusCode: 200,
                    body: { success: true }
                });

                await node.execute.call(mockExecute as IExecuteFunctions);

                expect(mockRequest).toHaveBeenCalledWith(
                    expect.objectContaining({
                        url: "https://api.json2video.com/v2/movies?webhook=https%3A%2F%2Fexample.com%2Fwebhook&id=record-123"
                    })
                );
            });

            it('should handle multiple items processing', async () => {
                const inputData: INodeExecutionData[] = [{ json: {} }, { json: {} }];

                mockExecute.getInputData.mockReturnValue(inputData);
                mockExecute.continueOnFail.mockReturnValue(false);
                mockExecute.getNodeParameter.mockImplementation(createValidParameterMock());
                mockExecute.getCredentials.mockResolvedValue({
                    apiKey: 'test-api-key'
                });

                mockRequest.mockResolvedValue({
                    statusCode: 200,
                    body: { success: true }
                });

                const result = await node.execute.call(mockExecute as IExecuteFunctions);

                expect(result[0]).toHaveLength(2);
                expect(mockRequest).toHaveBeenCalledTimes(2);
            });

            it('should handle array response data', async () => {
                const inputData: INodeExecutionData[] = [{ json: {} }];

                mockExecute.getInputData.mockReturnValue(inputData);
                mockExecute.continueOnFail.mockReturnValue(false);
                mockExecute.getNodeParameter.mockImplementation(createValidParameterMock());
                mockExecute.getCredentials.mockResolvedValue({
                    apiKey: 'test-api-key'
                });

                mockRequest.mockResolvedValue({
                    statusCode: 200,
                    body: [{ id: 'video-1' }, { id: 'video-2' }]
                });

                const result = await node.execute.call(mockExecute as IExecuteFunctions);

                expect(result[0]).toHaveLength(2);
                expect(result[0][0].json.id).toBe('video-1');
                expect(result[0][1].json.id).toBe('video-2');
            });

            it('should handle null response body', async () => {
                const inputData: INodeExecutionData[] = [{ json: {} }];

                mockExecute.getInputData.mockReturnValue(inputData);
                mockExecute.continueOnFail.mockReturnValue(false);
                mockExecute.getNodeParameter.mockImplementation(createValidParameterMock());
                mockExecute.getCredentials.mockResolvedValue({
                    apiKey: 'test-api-key'
                });

                mockRequest.mockResolvedValue({
                    statusCode: 200,
                    body: null
                });

                const result = await node.execute.call(mockExecute as IExecuteFunctions);

                expect(result[0]).toHaveLength(1);
                expect(result[0][0].json).toEqual(expect.objectContaining({
                    itemIndex: 0,
                    timestamp: expect.any(String)
                }));
            });

            it('should handle empty input data', async () => {
                mockExecute.getInputData.mockReturnValue([]);

                const result = await node.execute.call(mockExecute as IExecuteFunctions);

                expect(result).toEqual([[]]);
                expect(mockRequest).not.toHaveBeenCalled();
            });
        });

        describe('error handling', () => {
            it('should handle parameter collection errors', async () => {
                const inputData: INodeExecutionData[] = [{ json: {} }];

                mockExecute.getInputData.mockReturnValue(inputData);
                mockExecute.continueOnFail.mockReturnValue(true);
                mockExecute.getNodeParameter.mockImplementation(() => {
                    throw new Error('Parameter error');
                });

                const result = await node.execute.call(mockExecute as IExecuteFunctions);

                expect(result[0]).toHaveLength(1);
                expect(result[0][0].json.error).toBe('Parameter error');
            });

            it('should handle validation errors with continueOnFail true', async () => {
                const inputData: INodeExecutionData[] = [{ json: {} }];

                mockExecute.getInputData.mockReturnValue(inputData);
                mockExecute.continueOnFail.mockReturnValue(true);
                mockExecute.getNodeParameter.mockImplementation(
                    createValidParameterMock({
                        advancedMode: true,
                        templateType: 'blank',
                        jsonTemplateBlank: 'invalid json'
                    })
                );
                // Need to provide credentials to pass that check first
                mockExecute.getCredentials.mockResolvedValue({
                    apiKey: 'test-api-key'
                });

                const result = await node.execute.call(mockExecute as IExecuteFunctions);

                expect(result[0]).toHaveLength(1);
                expect(result[0][0].json.error).toContain("Build result contains no request");
            });

            it('should handle API error with continueOnFail true', async () => {
                const inputData: INodeExecutionData[] = [{ json: {} }];

                mockExecute.getInputData.mockReturnValue(inputData);
                mockExecute.continueOnFail.mockReturnValue(true);
                mockExecute.getNodeParameter.mockImplementation(createValidParameterMock());
                mockExecute.getCredentials.mockResolvedValue({
                    apiKey: 'test-api-key'
                });

                mockRequest.mockRejectedValue(new Error('API error'));

                const result = await node.execute.call(mockExecute as IExecuteFunctions);

                expect(result[0]).toHaveLength(1);
                expect(result[0][0].json.error).toBe('API error');
            });

            it('should handle API error with continueOnFail false', async () => {
                const inputData: INodeExecutionData[] = [{ json: {} }];

                mockExecute.getInputData.mockReturnValue(inputData);
                mockExecute.continueOnFail.mockReturnValue(false);
                mockExecute.getNodeParameter.mockImplementation(createValidParameterMock());
                mockExecute.getCredentials.mockResolvedValue({
                    apiKey: 'test-api-key'
                });

                mockRequest.mockRejectedValue(new Error('Network timeout'));

                await expect(node.execute.call(mockExecute as IExecuteFunctions))
                    .rejects.toThrow('Item 1 processing failed: Network timeout');
            });

            it('should handle missing credentials', async () => {
                const inputData: INodeExecutionData[] = [{ json: {} }];

                mockExecute.getInputData.mockReturnValue(inputData);
                mockExecute.continueOnFail.mockReturnValue(true);
                mockExecute.getNodeParameter.mockImplementation(createValidParameterMock());
                mockExecute.getCredentials.mockResolvedValue(null);

                const result = await node.execute.call(mockExecute as IExecuteFunctions);

                expect(result[0]).toHaveLength(1);
                expect(result[0][0].json.error).toBe('JSON2Video API credentials are required');
            });

            it('should handle credentials without apiKey', async () => {
                const inputData: INodeExecutionData[] = [{ json: {} }];

                mockExecute.getInputData.mockReturnValue(inputData);
                mockExecute.continueOnFail.mockReturnValue(true);
                mockExecute.getNodeParameter.mockImplementation(createValidParameterMock());
                mockExecute.getCredentials.mockResolvedValue({});

                const result = await node.execute.call(mockExecute as IExecuteFunctions);

                expect(result[0]).toHaveLength(1);
                expect(result[0][0].json.error).toBe('JSON2Video API credentials are required');
            });

            it('should handle non-Error exceptions', async () => {
                const inputData: INodeExecutionData[] = [{ json: {} }];

                mockExecute.getInputData.mockReturnValue(inputData);
                mockExecute.continueOnFail.mockReturnValue(true);
                mockExecute.getNodeParameter.mockImplementation(() => {
                    throw 'string error';
                });

                const result = await node.execute.call(mockExecute as IExecuteFunctions);

                expect(result[0]).toHaveLength(1);
                expect(result[0][0].json.error).toBe('Unknown error occurred');
            });
        });
    });

    describe('utility functions', () => {
        describe('extractErrorMessage', () => {
            it.each([
                { input: new Error('Test error message'), expected: 'Test error message' },
                { input: new Error('Network timeout'), expected: 'Network timeout' },
                { input: new Error('API rate limit exceeded'), expected: 'API rate limit exceeded' }
            ])('should extract message from Error object: $expected', ({ input, expected }) => {
                expect(extractErrorMessage(input)).toBe(expected);
            });

            it.each([
                { input: new Error(''), description: 'empty message' },
                { input: new Error(), description: 'no message property' }
            ])('should handle Error with $description', ({ input }) => {
                expect(extractErrorMessage(input)).toBe('Unknown error occurred');
            });

            it.each([
                { input: 'string error', description: 'string' },
                { input: null, description: 'null' },
                { input: undefined, description: 'undefined' },
                { input: 123, description: 'number' },
                { input: {}, description: 'empty object' },
                { input: [], description: 'array' },
                { input: true, description: 'boolean' }
            ])('should handle non-Error objects: $description', ({ input }) => {
                expect(extractErrorMessage(input)).toBe('Unknown error occurred');
            });
        });

        describe('extractParameterErrorMessage', () => {
            it.each([
                {
                    input: new Error('Parameter validation failed: Missing required field'),
                    expected: 'Missing required field',
                    description: 'parameter validation error'
                },
                {
                    input: new Error('Parameter validation failed: Invalid format'),
                    expected: 'Invalid format',
                    description: 'parameter format error'
                },
                {
                    input: new Error('Parameter validation failed: '),
                    expected: '',
                    description: 'empty parameter error message'
                }
            ])('should extract $description', ({ input, expected }) => {
                expect(extractParameterErrorMessage(input)).toBe(expected);
            });

            it.each([
                { input: new Error('Some other error'), expected: 'Some other error' },
                { input: new Error('Network timeout'), expected: 'Network timeout' },
                { input: new Error('API error'), expected: 'API error' }
            ])('should return original message for non-parameter errors: $expected', ({ input, expected }) => {
                expect(extractParameterErrorMessage(input)).toBe(expected);
            });

            it.each([
                { input: 'string', description: 'string' },
                { input: null, description: 'null' },
                { input: undefined, description: 'undefined' },
                { input: 123, description: 'number' },
                { input: {}, description: 'object' },
                { input: [], description: 'array' }
            ])('should handle non-Error objects: $description', ({ input }) => {
                expect(extractParameterErrorMessage(input)).toBe('Unknown error occurred');
            });
        });

        describe('extractMainErrorMessage', () => {
            it.each([
                { input: 'Request building failed: Build error', expected: 'Build error' },
                { input: 'Request validation failed: Validation error', expected: 'Validation error' },
                { input: 'Failed to collect parameters for operation \'createMovie\': Param error', expected: 'Param error' },
                { input: 'Processing failed: Process error', expected: 'Process error' },
                { input: 'API error: API problem', expected: 'API problem' },
                { input: 'Network error: Network problem', expected: 'Network problem' },
                { input: 'Authentication failed: Auth problem', expected: 'Auth problem' },
                { input: 'Invalid operation: Op problem', expected: 'Op problem' },
                { input: 'Build failed: Build problem', expected: 'Build problem' },
                { input: 'Validation failed: Valid problem', expected: 'Valid problem' },
                { input: 'Parameter validation failed: Param problem', expected: 'Param problem' }
            ])('should extract error pattern: $input -> $expected', ({ input, expected }) => {
                expect(extractMainErrorMessage(input)).toBe(expected);
            });

            it.each([
                'Some random error',
                'Unexpected message format',
                'No prefix here',
                '',
                'Just text without colon'
            ])('should return original message when no pattern matches: %s', (input) => {
                expect(extractMainErrorMessage(input)).toBe(input);
            });
        });

        describe('isEmptyRequest', () => {
            it.each([
                { input: null, description: 'null' },
                { input: undefined, description: 'undefined' },
                { input: {}, description: 'empty object' },
                { input: { scenes: [] }, description: 'empty scenes array' },
                { input: { scenes: [{ elements: [] }] }, description: 'scenes with empty elements' },
                { input: { scenes: [{ elements: [] }, { elements: [] }] }, description: 'multiple scenes with empty elements' }
            ])('should detect empty requests: $description', ({ input }) => {
                expect(isEmptyRequest(input)).toBe(true);
            });

            it.each([
                {
                    input: { scenes: [{ elements: [{ type: 'text', text: 'test' }] }] },
                    description: 'scenes with text elements'
                },
                {
                    input: { elements: [{ type: 'subtitles' }] },
                    description: 'movie-level elements'
                },
                {
                    input: { scenes: [{ elements: [] }, { elements: [{ type: 'video' }] }] },
                    description: 'mixed empty and non-empty scenes'
                }
            ])('should detect non-empty requests: $description', ({ input }) => {
                expect(isEmptyRequest(input)).toBe(false);
            });

            it('should handle invalid scenes structure', () => {
                expect(isEmptyRequest({ scenes: 'invalid' })).toBe(false);
                expect(isEmptyRequest({ scenes: [null] })).toBe(true);
                expect(isEmptyRequest({ scenes: [{ elements: 'invalid' }] })).toBe(true);
            });
        });

        describe('createBaseArray', () => {
            it('should create consistent base array structure', () => {
                const result1 = createBaseArray();
                const result2 = createBaseArray();

                expect(result1).toEqual([[]]);
                expect(result2).toEqual([[]]);
                expect(result1).not.toBe(result2);
                expect(Array.isArray(result1)).toBe(true);
                expect(result1.length).toBe(1);
                expect(Array.isArray(result1[0])).toBe(true);
                expect(result1[0].length).toBe(0);
            });
        });
    });
});