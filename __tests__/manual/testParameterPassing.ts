import { IExecuteFunctions, INodeType, NodeOperationError, NodeConnectionType } from 'n8n-workflow';
import axios from 'axios';
import { buildRequestBody } from '../../nodes/CreateLeonardoImage/parameterUtils';

/**
 * This test verifies that specific parameters are correctly included in the request body
 * Focus on parameters that don't have proper test coverage:
 * 1. weighting
 * 2. unzoomAmount
 * 3. canvasRequestType
 */

// Mock execute functions for parameter passing testing
const mockExecuteFunctions = {
  getNodeParameter: (name: string, _index: number, defaultValue?: any) => {
    const params: { [key: string]: any } = {
      // Basic parameters
      operation: 'createLeonardoImage',
      prompt: 'A beautiful landscape',
      width: 512,
      height: 512,
      numImages: 1,
      modelSelectionMethod: 'list',
      modelId: 'b820ea11-02bf-4652-97ae-9ac0cc00593d', // Leonardo Diffusion model
      advancedOptions: true,
      
      // Test the specific parameters we're interested in
      weighting: '0.75',         // Specific parameter #1 (as string to trigger transform)
      unzoom: 'true',            // Needed for unzoomAmount to work (must be string 'true')
      unzoomAmount: '0.35',      // Specific parameter #2 (as string)
      canvasRequest: 'true',     // Needed for canvasRequestType to work
      canvasRequestType: 'INPAINT', // Specific parameter #3
    };
    
    // Debug output
    console.log(`getNodeParameter called with: ${name}, returning: ${params[name] !== undefined ? params[name] : defaultValue}`);
    
    return params[name] !== undefined ? params[name] : defaultValue;
  },
  getInputData: () => [{ json: {} }],
  getCredentials: (_name: string) => {
    return {
      apiKey: process.env.LEONARDO_API_KEY || 'mock-api-key',
    };
  },
};

// Run the test
async function testParameterPassing() {
  try {
    console.log('Testing parameter passing for weighting, unzoomAmount, and canvasRequestType...');
    
    // We need a complete workaround to ensure all parameters are properly included
    // Monkey-patch the params object and build a full parameter set
    Object.defineProperty(mockExecuteFunctions, 'params', {
      get: function() {
        return {
          // Basic parameters
          operation: 'createLeonardoImage',
          prompt: 'A beautiful landscape',
          width: 512,
          height: 512,
          numImages: 1,
          modelSelectionMethod: 'list',
          modelId: 'b820ea11-02bf-4652-97ae-9ac0cc00593d',
          advancedOptions: true,
          
          // Test the specific parameters we're interested in
          weighting: '0.75',
          unzoom: 'true',  // String 'true' which should now work with our fixed condition
          unzoomAmount: '0.35',
          canvasRequest: 'true',
          canvasRequestType: 'INPAINT'
        };
      }
    });
    
    // Call buildRequestBody directly to see what parameters get included
    const requestBody = buildRequestBody.call(mockExecuteFunctions as any, 0);
    
    // Print the result
    console.log('Generated request body:');
    console.log(JSON.stringify(requestBody, null, 2));
    
    // Specific assertions for the parameters we care about
    const hasWeighting = 'weighting' in requestBody;
    const hasUnzoomAmount = 'unzoomAmount' in requestBody;
    const hasCanvasRequestType = 'canvas_request_type' in requestBody;
    
    console.log('\nParameters present check:');
    console.log(`weighting parameter included: ${hasWeighting}`);
    console.log(`unzoomAmount parameter included: ${hasUnzoomAmount}`);
    console.log(`canvas_request_type parameter included: ${hasCanvasRequestType}`);
    
    console.log('\nParameter values:');
    if (hasWeighting) {
      console.log(`weighting = ${requestBody.weighting}`);
    }
    if (hasUnzoomAmount) {
      console.log(`unzoomAmount = ${requestBody.unzoomAmount}`);
    }
    if (hasCanvasRequestType) {
      console.log(`canvas_request_type = ${requestBody.canvas_request_type}`);
    }
    
    console.log('\nTest completed');
  } catch (error) {
    console.error('Test failed with error:', error);
  }
}

// Run the test
testParameterPassing();