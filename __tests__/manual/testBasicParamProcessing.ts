// Import dependencies
import { IDataObject } from 'n8n-workflow';
import { processParameter, ParameterMapping } from '../../nodes/CreateLeonardoImage/parameterUtils';

/**
 * This test checks the most basic parameter processing function directly
 */
function runBasicTest() {
  console.log('Testing basic parameter processing...');
  
  // Test weighting parameter
  const params: IDataObject = { weighting: '0.75' };
  const requestBody: IDataObject = {};
  
  const mapping: ParameterMapping = {
    paramKey: 'weighting',
    transform: (value) => typeof value === 'string' ? parseFloat(value) : value
  };
  
  processParameter(params, requestBody, mapping);
  
  console.log('Test with params:', params);
  console.log('Result requestBody:', requestBody);
  
  console.log('\nTest with unzoom condition:');
  // Test unzoomAmount with condition met
  const paramsUnzoom: IDataObject = { 
    unzoomAmount: '0.35',
    unzoom: 'true'
  };
  const requestBodyUnzoom: IDataObject = {};
  
  const mappingUnzoom: ParameterMapping = {
    paramKey: 'unzoomAmount',
    condition: (value, allParams) => allParams.unzoom === 'true' || allParams.unzoom === true,
    transform: (value) => typeof value === 'string' ? parseFloat(value) : value
  };
  
  processParameter(paramsUnzoom, requestBodyUnzoom, mappingUnzoom);
  console.log('Params with unzoom true:', paramsUnzoom);
  console.log('Result with unzoom true:', requestBodyUnzoom);
  
  // Test with condition not met
  const paramsNoUnzoom: IDataObject = { 
    unzoomAmount: '0.35',
    unzoom: false
  };
  const requestBodyNoUnzoom: IDataObject = {};
  processParameter(paramsNoUnzoom, requestBodyNoUnzoom, mappingUnzoom);
  console.log('Params with unzoom false:', paramsNoUnzoom);
  console.log('Result with unzoom false:', requestBodyNoUnzoom);
  
  console.log('\nDone testing.');
}

runBasicTest();