import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  IDataObject,
  NodeParameterValue
} from 'n8n-workflow';
import { CreateLeonardoImage } from '../nodes/CreateLeonardoImage/CreateLeonardoImage.node';

/**
 * This file is for manual testing of the CreateLeonardoImage node.
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
        'operation': 'createLeonardoImage',
        'prompt': 'A beautiful mountain landscape with a lake, photorealistic',
        'width': 1024,
        'height': 768,
        'numImages': 1,
        'modelSelectionMethod': 'list',
        'modelId': 'e316348f-7773-490e-adcd-46757c738eb7', // Leonardo Creative
        'advancedOptions': false,
      };
      
      return params[parameterName.toString()] !== undefined 
        ? params[parameterName.toString()] 
        : fallbackValue;
    },
    
    getCredentials: async function<T extends object>(type: string): Promise<T> {
      if (type === 'createLeonardoImageCredentials') {
        return {
          apiKey: process.env.LEONARDO_API_KEY || 'YOUR_API_KEY_HERE',
        } as unknown as T;
      }
      throw new Error(`Credentials for ${type} not found`);
    },
    
    continueOnFail: () => false,
    
    helpers: {
      returnJsonArray: (data: IDataObject[]) => {
        return data.map(item => ({ json: item }));
      }
    }
  } as unknown as IExecuteFunctions;

  // Create node instance
  const nodeType = new CreateLeonardoImage();
  
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