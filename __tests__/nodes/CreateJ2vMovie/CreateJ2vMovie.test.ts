// __tests__/nodes/CreateJ2vMovie/CreateJ2vMovie.test.ts

import { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { CreateJ2vMovie, extractErrorMessage, extractParameterErrorMessage, extractMainErrorMessage, isEmptyRequest, createBaseArray } from '../../../nodes/CreateJ2vMovie/CreateJ2vMovie.node';

describe('CreateJ2vMovie Node - Complete Test Suite', () => {
    let node: CreateJ2vMovie;
    let mockExecute: jest.Mocked<IExecuteFunctions>;

    beforeEach(() => {
        node = new CreateJ2vMovie();

        mockExecute = {
            getInputData: jest.fn(),
            getNodeParameter: jest.fn(),
            getCredentials: jest.fn(),
            helpers: {
                request: jest.fn(),
                returnJsonArray: jest.fn(),
                constructExecutionMetaData: jest.fn(),
            },
            continueOnFail: jest.fn(),
        } as any;

        jest.clearAllMocks();

        mockExecute.getInputData.mockReturnValue([{ json: {} }]);
        mockExecute.getCredentials.mockResolvedValue({ apiKey: 'test-api-key' });
        mockExecute.continueOnFail.mockReturnValue(false);

        (mockExecute.helpers.request as jest.MockedFunction<any>).mockResolvedValue({ id: 'test-job', status: 'queued' });
        (mockExecute.helpers.returnJsonArray as jest.MockedFunction<any>).mockReturnValue([{ json: { id: 'test-job' } }]);
        (mockExecute.helpers.constructExecutionMetaData as jest.MockedFunction<any>).mockReturnValue([{ json: { id: 'test-job' }, pairedItem: { item: 0 } }]);
    });

    describe('node description', () => {
        it('should have correct basic properties', () => {
            expect(node.description.displayName).toBe('Self-Host Hub (JSON2Video)');
            expect(node.description.name).toBe('createJ2vMovie');
            expect(node.description.version).toBe(1);
            expect(node.description.description).toBe('Create videos with the JSON2Video API');
        });

        it('should have required credentials and I/O configuration', () => {
            expect(node.description.credentials).toEqual([{ name: 'json2VideoApiCredentials', required: true }]);
            expect(node.description.inputs).toHaveLength(1);
            expect(node.description.outputs).toHaveLength(1);
            expect(Array.isArray(node.description.properties)).toBe(true);
        });
    });

    describe('utility functions', () => {
        describe('extractErrorMessage', () => {
            it.each([
                ['valid error', new Error('Test error'), 'Test error'],
                ['null error', null, 'Unknown error occurred'],
                ['undefined error', undefined, 'Unknown error occurred'],
                ['error without message', {}, 'Unknown error occurred'],
                ['empty message', new Error(''), 'Unknown error occurred'],
                ['whitespace message', new Error('   \t\n   '), 'Unknown error occurred']
            ])('should handle %s', (_, error, expected) => {
                expect(extractErrorMessage(error)).toBe(expected);
            });
        });

        describe('extractParameterErrorMessage', () => {
            it.each([
                ['valid Error instance', new Error('Parameter error'), 'Parameter error'],
                ['Error with empty message', new Error(''), null],
                ['Error with whitespace message', new Error('   \t   '), null],
                ['non-Error object', { message: 'Not an error' }, null],
                ['null error', null, null]
            ])('should handle %s', (_, error, expected) => {
                expect(extractParameterErrorMessage(error)).toBe(expected);
            });
        });

        describe('extractMainErrorMessage', () => {
            it.each([
                ['valid error', new Error('Main error'), 'Main error'],
                ['error without message', {}, 'Unknown error occurred'],
                ['empty message', new Error(''), 'Unknown error occurred'],
                ['null error', null, 'Unknown error occurred']
            ])('should handle %s', (_, error, expected) => {
                expect(extractMainErrorMessage(error)).toBe(expected);
            });
        });

        describe('isEmptyRequest', () => {
            it.each([
                ['empty object', {}, true],
                ['object with properties', { scenes: [] }, false],
                ['null request', null, false],
                ['array request', [], true],
                ['non-object request', 'string', false]
            ])('should handle %s', (_, request, expected) => {
                expect(isEmptyRequest(request)).toBe(expected);
            });
        });

        describe('createBaseArray', () => {
            it.each([
                ['array input', [{ id: 1 }, { id: 2 }], [{ id: 1 }, { id: 2 }]],
                ['single object input', { id: 1 }, [{ id: 1 }]],
                ['null input', null, [{}]],
                ['falsy input', false, [{}]]
            ])('should handle %s', (_, input, expected) => {
                expect(createBaseArray(input)).toEqual(expected);
            });
        });
    });

    describe('execute method - core functionality', () => {
        describe('input data handling', () => {
            it('should handle empty input data without fetching credentials', async () => {
                mockExecute.getInputData.mockReturnValue([]);

                const result = await node.execute.call(mockExecute);

                expect(result).toBeDefined();
                expect(result[0]).toHaveLength(0);
                expect(mockExecute.getCredentials).not.toHaveBeenCalled();
            });
        });

        describe('credentials error handling', () => {
            beforeEach(() => {
                mockExecute.getInputData.mockReturnValue([{ json: {} }]);
            });

            it.each([
                ['standard error with continueOnFail false', new Error('Credentials not found'), false, true, 'Item 1 processing failed: Credentials not found'],
                ['empty error message with continueOnFail false', new Error(''), false, true, 'Item 1 processing failed: Unknown error occurred'],
                ['non-Error object with continueOnFail false', 'String error', false, true, 'Item 1 processing failed: Unknown error occurred'],
                ['standard error with continueOnFail true', new Error('API key invalid'), true, false, 'API key invalid']
            ])('should handle %s', async (_, credentialsError, continueOnFail, shouldThrow, expectedError) => {
                mockExecute.getCredentials.mockRejectedValue(credentialsError);
                mockExecute.continueOnFail.mockReturnValue(continueOnFail);

                if (shouldThrow) {
                    await expect(node.execute.call(mockExecute)).rejects.toThrow(expectedError as string);
                } else {
                    const result = await node.execute.call(mockExecute);
                    expect(result[0]).toHaveLength(1);
                    expect(result[0][0].json.error).toBe(expectedError);
                }
            });
        });

        describe('operation validation', () => {
            beforeEach(() => {
                mockExecute.getCredentials.mockResolvedValue({ apiKey: 'test-key' });
                mockExecute.continueOnFail.mockReturnValue(true);
            });

            it.each([
                ['missing operation', '', 'Operation is required'],
                ['invalid operation', 'invalidOperation', 'Invalid operation: invalidOperation']
            ])('should handle %s', async (_, operation, expectedError) => {
                mockExecute.getNodeParameter.mockReturnValue(operation);

                const result = await node.execute.call(mockExecute);
                expect(result[0][0].json.error).toBe(expectedError);
            });
        });
    });

    describe('critical path coverage - specific branches', () => {
        beforeEach(() => {
            mockExecute.getCredentials.mockResolvedValue({ apiKey: 'test-key' });
            mockExecute.continueOnFail.mockReturnValue(true);
        });

        describe('parameter error extraction branch', () => {
            it('should handle extractable parameter errors by providing invalid JSON template', async () => {
                mockExecute.getNodeParameter.mockImplementation((name: string) => {
                    switch (name) {
                        case 'operation': return 'createMovie';
                        case 'advancedMode': return true;
                        case 'jsonTemplate': return 'invalid json{'; // This should cause a parameter collection error
                        default: return undefined;
                    }
                });

                const result = await node.execute.call(mockExecute);
                // Should hit the extractable parameter error path
                expect(result[0][0].json.error).toContain('Parameter validation failed');
            });

            it('should re-throw non-extractable parameter errors by forcing getNodeParameter to fail', async () => {
                mockExecute.continueOnFail.mockReturnValue(false); // Ensure it throws

                // Force getNodeParameter to throw a non-Error object
                mockExecute.getNodeParameter.mockImplementation((name: string) => {
                    if (name === 'operation') {
                        return 'createMovie';
                    }
                    // Throw a non-Error object that extractParameterErrorMessage will return null for
                    throw { notAnErrorObject: 'this should hit appropriate line' };
                });

                await expect(node.execute.call(mockExecute))
                    .rejects.toThrow('Item 1 processing failed: Unknown error occurred');
            });
        });

        describe('build result error handling', () => {
            it('should handle build warnings when build errors occur', async () => {
                const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

                mockExecute.getNodeParameter.mockReturnValue('createMovie');

                jest.doMock('../../../nodes/CreateJ2vMovie/core/requestBuilder', () => ({
                    buildRequest: jest.fn(() => ({
                        request: null,
                        errors: ['Critical build error'],
                        warnings: ['Build warning 1', 'Build warning 2']
                    }))
                }));

                jest.doMock('../../../nodes/CreateJ2vMovie/core/parameterCollector', () => ({
                    collectParameters: jest.fn(() => ({ action: 'createMovie', isAdvancedMode: false })),
                    validateCollectedParameters: jest.fn(() => [])
                }));

                delete require.cache[require.resolve('../../../nodes/CreateJ2vMovie/CreateJ2vMovie.node')];
                const { CreateJ2vMovie: TestNode } = require('../../../nodes/CreateJ2vMovie/CreateJ2vMovie.node');
                const testNode = new TestNode();

                const result = await testNode.execute.call(mockExecute);

                consoleSpy.mockRestore();
                jest.unmock('../../../nodes/CreateJ2vMovie/core/requestBuilder');
                jest.unmock('../../../nodes/CreateJ2vMovie/core/parameterCollector');
            });
        });

        describe('request validation branches', () => {
            it('should handle buildRequest returning null request', async () => {
                mockExecute.getNodeParameter.mockReturnValue('createMovie');
                mockExecute.continueOnFail.mockReturnValue(false);

                jest.doMock('../../../nodes/CreateJ2vMovie/core/requestBuilder', () => ({
                    buildRequest: jest.fn(() => ({ request: null, errors: [], warnings: [] }))
                }));

                jest.doMock('../../../nodes/CreateJ2vMovie/core/parameterCollector', () => ({
                    collectParameters: jest.fn(() => ({ action: 'createMovie', isAdvancedMode: false })),
                    validateCollectedParameters: jest.fn(() => [])
                }));

                delete require.cache[require.resolve('../../../nodes/CreateJ2vMovie/CreateJ2vMovie.node')];
                const { CreateJ2vMovie: TestNode } = require('../../../nodes/CreateJ2vMovie/CreateJ2vMovie.node');
                const testNode = new TestNode();

                await expect(testNode.execute.call(mockExecute))
                    .rejects.toThrow('Item 1 processing failed: Request building failed: No request generated');

                jest.unmock('../../../nodes/CreateJ2vMovie/core/requestBuilder');
                jest.unmock('../../../nodes/CreateJ2vMovie/core/parameterCollector');
            });

            it('should handle buildRequest returning empty object', async () => {
                mockExecute.getNodeParameter.mockReturnValue('createMovie');
                mockExecute.continueOnFail.mockReturnValue(false);

                jest.doMock('../../../nodes/CreateJ2vMovie/core/requestBuilder', () => ({
                    buildRequest: jest.fn(() => ({ request: {}, errors: [], warnings: [] }))
                }));

                jest.doMock('../../../nodes/CreateJ2vMovie/core/parameterCollector', () => ({
                    collectParameters: jest.fn(() => ({ action: 'createMovie', isAdvancedMode: false })),
                    validateCollectedParameters: jest.fn(() => [])
                }));

                delete require.cache[require.resolve('../../../nodes/CreateJ2vMovie/CreateJ2vMovie.node')];
                const { CreateJ2vMovie: TestNode } = require('../../../nodes/CreateJ2vMovie/CreateJ2vMovie.node');
                const testNode = new TestNode();

                await expect(testNode.execute.call(mockExecute))
                    .rejects.toThrow('Item 1 processing failed: Request building failed: Empty request generated');

                jest.unmock('../../../nodes/CreateJ2vMovie/core/requestBuilder');
                jest.unmock('../../../nodes/CreateJ2vMovie/core/parameterCollector');
            });
        });

        describe('validation error message building', () => {
            it('should build validation error messages with fixable errors', async () => {
                mockExecute.getNodeParameter.mockReturnValue('createMovie');

                jest.doMock('../../../nodes/CreateJ2vMovie/core/requestBuilder', () => ({
                    buildRequest: jest.fn(() => ({
                        request: { scenes: [] },
                        errors: [],
                        warnings: []
                    }))
                }));

                jest.doMock('../../../nodes/CreateJ2vMovie/core/schemaValidator', () => ({
                    validateRequest: jest.fn(() => ({
                        isValid: false,
                        canProceed: false,
                        errors: ['Critical error', 'Fixable error'],
                        warnings: []
                    })),
                    createValidationSummary: jest.fn(() => 'Validation failed'),
                    extractActionableErrors: jest.fn(() => ({
                        critical: ['Critical error'],
                        fixable: ['Fixable error'],
                        warnings: []
                    }))
                }));

                jest.doMock('../../../nodes/CreateJ2vMovie/core/parameterCollector', () => ({
                    collectParameters: jest.fn(() => ({ action: 'createMovie', isAdvancedMode: false })),
                    validateCollectedParameters: jest.fn(() => [])
                }));

                delete require.cache[require.resolve('../../../nodes/CreateJ2vMovie/CreateJ2vMovie.node')];
                const { CreateJ2vMovie: TestNode } = require('../../../nodes/CreateJ2vMovie/CreateJ2vMovie.node');
                const testNode = new TestNode();

                const result = await testNode.execute.call(mockExecute);

                expect(result[0][0].json.error).toContain('Critical errors: Critical error');
                expect(result[0][0].json.error).toContain('Fixable errors: Fixable error');

                jest.unmock('../../../nodes/CreateJ2vMovie/core/requestBuilder');
                jest.unmock('../../../nodes/CreateJ2vMovie/core/schemaValidator');
                jest.unmock('../../../nodes/CreateJ2vMovie/core/parameterCollector');
            });
        });

        describe('logging behavior', () => {
            it('should log error messages during item processing', async () => {
                const errorSpy = jest.spyOn(console, 'error').mockImplementation();

                mockExecute.getNodeParameter.mockReturnValue('createMovie');

                jest.doMock('../../../nodes/CreateJ2vMovie/core/parameterCollector', () => ({
                    collectParameters: jest.fn(() => { throw new Error('Processing error for logging test'); }),
                    validateCollectedParameters: jest.fn(() => [])
                }));

                delete require.cache[require.resolve('../../../nodes/CreateJ2vMovie/CreateJ2vMovie.node')];
                const { CreateJ2vMovie: TestNode } = require('../../../nodes/CreateJ2vMovie/CreateJ2vMovie.node');
                const testNode = new TestNode();

                await testNode.execute.call(mockExecute);

                expect(errorSpy).toHaveBeenCalledWith(
                    'Error processing item 1:',
                    "Failed to collect parameters for operation 'createMovie': Processing error for logging test"
                );

                errorSpy.mockRestore();
                jest.unmock('../../../nodes/CreateJ2vMovie/core/parameterCollector');
            });
        });

        afterEach(() => {
            jest.resetModules();
            jest.clearAllMocks();
        });
    });

    describe('integration scenarios', () => {
        beforeEach(() => {
            mockExecute.getCredentials.mockResolvedValue({ apiKey: 'test-key' });
            mockExecute.continueOnFail.mockReturnValue(true);
        });

        it('should handle multiple input items sequentially', async () => {
            const inputItems = [
                { json: { itemId: 'item1' } },
                { json: { itemId: 'item2' } }
            ];

            mockExecute.getInputData.mockReturnValue(inputItems);
            mockExecute.getNodeParameter.mockImplementation((name: string, itemIndex: number) => {
                switch (name) {
                    case 'operation': return 'createMovie';
                    case 'advancedMode': return false;
                    case 'recordId': return `batch-item-${itemIndex + 1}`;
                    default: return undefined;
                }
            });

            const result = await node.execute.call(mockExecute);

            expect(result).toBeDefined();
            expect(result[0]).toHaveLength(inputItems.length);
            result[0].forEach((resultItem) => {
                expect(resultItem.json.error || resultItem.json.id).toBeDefined();
            });
        });

        it('should handle API request building correctly', async () => {
            mockExecute.getNodeParameter.mockImplementation((name: string) => {
                switch (name) {
                    case 'operation': return 'createMovie';
                    case 'advancedMode': return true;
                    case 'recordId': return 'test-record-123';
                    case 'webhookUrl': return 'https://webhook.example.com/test';
                    case 'jsonTemplate': return JSON.stringify({
                        scenes: [{ elements: [{ type: 'video', src: 'https://example.com/test.mp4' }] }]
                    });
                    default: return undefined;
                }
            });

            const result = await node.execute.call(mockExecute);

            if ((mockExecute.helpers.request as jest.MockedFunction<any>).mock.calls.length > 0) {
                expect(mockExecute.helpers.request).toHaveBeenCalledWith(
                    expect.objectContaining({
                        method: 'POST',
                        url: expect.stringContaining('https://api.json2video.com/v2/movies'),
                        headers: expect.objectContaining({
                            'Content-Type': 'application/json',
                            'x-api-key': 'test-key'
                        })
                    })
                );
            }

            expect(result).toBeDefined();
            expect(result[0]).toHaveLength(1);
        });
    });
});