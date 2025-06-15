import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  IDataObject,
  NodeParameterValue
} from 'n8n-workflow';
import { CreateJ2vMovie } from '../nodes/CreateJ2vMovie/CreateJ2vMovie.node';

/**
 * This file is for manual testing of the CreateJ2vMovie node.
 */
async function runTest() {
  // Create a simplified mock of IExecuteFunctions for testing
  const mockExecuteFunctions = {
    getInputData: () => [{ json: {} }] as INodeExecutionData[],
    
    getNodeParameter: function(
      parameterName: string, 
      itemIndex: number, 
      fallbackValue?: NodeParameterValue
    ): NodeParameterValue {
      const params: {[key: string]: NodeParameterValue} = {
        'operation': 'createMovie',
        'recordId': 'test-record-123',
        'webhookUrl': 'https://webhook.site/your-webhook-id',
        'output_width': 1280,
        'output_height': 720,
        'quality': 'medium',
        'framerate': 30,
        'advancedMode': false,
        'images': 'https://i.imgur.com/example1.jpg,https://i.imgur.com/example2.jpg',
        'crop': true,
        'smoothness': 5,
        'padding_color': 'black',
        'horizontal_position': 'center',
        'vertical_position': 'middle',
      };
      
      return params[parameterName.toString()] !== undefined 
        ? params[parameterName.toString()] 
        : fallbackValue;
    },
    
    getCredentials: async function<T extends object>(type: string): Promise<T> {
      if (type === 'json2VideoApiCredentials') {
        return {
          apiKey: process.env.JSON2VIDEO_API_KEY || 'YOUR_API_KEY_HERE',
        } as unknown as T;
      }
      throw new Error(`Credentials for ${type} not found`);
    },
    
    continueOnFail: () => false,
    
    helpers: {
      returnJsonArray: (data: IDataObject[]) => {
        return data.map(item => ({ json: item }));
      },
      request: async (options: any) => {
        console.log('DEBUG - Request options:', JSON.stringify(options, null, 2));
        // Mock response instead of making actual API call
        return {
          id: 'test-job-id',
          status: 'completed',
          url: 'https://example.com/video.mp4'
        };
      }
    }
  } as unknown as IExecuteFunctions;

  // Create node instance
  const nodeType = new CreateJ2vMovie();
  
  // Execute node
  try {
    const result = await nodeType.execute.call(mockExecuteFunctions);
    console.log('Node execution successful:');
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Node execution failed:');
    console.error(error);
  }
}

// Run the test
runTest().catch(console.error);