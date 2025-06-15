import { CreateJ2vMovie } from '../nodes/CreateJ2vMovie/CreateJ2vMovie.node.js';
import { IExecuteFunctions, INodeParameters, NodeParameterValue } from 'n8n-workflow';

/**
 * This file is for testing the renamed CreateMovie operation.
 */
async function runRenameTest() {
    console.log('Starting test for renamed Create Movie operation...');

    // Mock the execute functions
    const mockExecuteFunctions: IExecuteFunctions = {
        getNodeParameter(
            parameterName: string,
            itemIndex: number,
            fallbackValue?: NodeParameterValue
        ): NodeParameterValue {
            const params: {[key: string]: NodeParameterValue} = {
                // Test with createMovie operation
                'operation': 'createMovie',
                'recordId': 'test-record-123',
                'webhookUrl': 'https://example.com/webhook',
                'advancedMode': false,
                'framerate': 30,
                'output_width': 1280,
                'output_height': 720,
                'quality': 'high',
                'cache': true,
                'draft': false,
                // Add more parameters as needed
            };

            return params[parameterName] ?? fallbackValue;
        },
        getInputData() {
            return [{ json: {} }];
        },
        getCredentials(type: string): any {
            if (type === 'json2VideoApiCredentials') {
                return { apiKey: 'test-api-key' };
            }
            return {};
        },
        helpers: {
            request: async (options: any) => {
                console.log('API Request Options:', JSON.stringify(options, null, 2));
                // Mock the API response
                return { id: 'mock-job-id', status: 'processing' };
            },
            returnJsonArray: (items: any[]) => items,
            constructExecutionMetaData: (items: any[], meta: any) => items,
        } as any,
        continueOnFail: () => false,
    } as unknown as IExecuteFunctions;

    try {
        // Create an instance of the node
        const node = new CreateJ2vMovie();
        
        // Execute the node
        const result = await node.execute.call(mockExecuteFunctions);
        
        console.log('Test result:', JSON.stringify(result, null, 2));
        console.log('Test completed successfully!');
    } catch (error) {
        console.error('Test failed with error:', error);
    }
}

// Run the test
runRenameTest();