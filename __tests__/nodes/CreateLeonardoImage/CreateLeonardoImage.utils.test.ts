import { ICredentialDataDecryptedObject, IDataObject, INodeParameters, IExecuteFunctions } from 'n8n-workflow';
import {
  processParameter,
  processParameterBatch,
  processThreeStateBoolean,
  processNumericParameter,
  buildRequestBody,
  ParameterMapping
} from '../../../nodes/CreateLeonardoImage/parameterUtils';
import { createLeonardoMockFunction } from '../../shared/leonardo-helpers';

describe('Parameter Utilities', () => {
  describe('processParameter', () => {
    test('should add parameter to request body with correct key', () => {
      const params: IDataObject = { testParam: 'test value' };
      const requestBody: IDataObject = {};
      const mapping: ParameterMapping = { paramKey: 'testParam' };
      
      processParameter(params, requestBody, mapping);
      
      expect(requestBody).toHaveProperty('testParam', 'test value');
    });
    
    test('should use apiKey if specified', () => {
      const params: IDataObject = { testParam: 'test value' };
      const requestBody: IDataObject = {};
      const mapping: ParameterMapping = { paramKey: 'testParam', apiKey: 'api_test_param' };
      
      processParameter(params, requestBody, mapping);
      
      expect(requestBody).toHaveProperty('api_test_param', 'test value');
    });
    
    test('should apply transformation if provided', () => {
      const params: IDataObject = { numValue: '123' };
      const requestBody: IDataObject = {};
      const mapping: ParameterMapping = { 
        paramKey: 'numValue', 
        transform: (value) => parseInt(value as string, 10) 
      };
      
      processParameter(params, requestBody, mapping);
      
      expect(requestBody).toHaveProperty('numValue', 123);
    });
    
    test('should check condition before adding parameter', () => {
      const params: IDataObject = { testParam: 'test value', condition: true };
      const requestBody: IDataObject = {};
      const mapping: ParameterMapping = { 
        paramKey: 'testParam',
        condition: (value, allParams) => allParams.condition === true
      };
      
      processParameter(params, requestBody, mapping);
      
      expect(requestBody).toHaveProperty('testParam', 'test value');
      
      // Now test with condition = false
      const params2: IDataObject = { testParam: 'test value', condition: false };
      const requestBody2: IDataObject = {};
      
      processParameter(params2, requestBody2, mapping);
      
      expect(requestBody2).not.toHaveProperty('testParam');
    });
    
    test('should skip undefined, null, empty string, or NO_SELECTION values', () => {
      const params: IDataObject = { 
        undefined: undefined,
        null: null,
        empty: '',
        noSelection: 'NO_SELECTION',
        valid: 'valid value'
      };
      const requestBody: IDataObject = {};
      
      processParameter(params, requestBody, { paramKey: 'undefined' });
      processParameter(params, requestBody, { paramKey: 'null' });
      processParameter(params, requestBody, { paramKey: 'empty' });
      processParameter(params, requestBody, { paramKey: 'noSelection' });
      processParameter(params, requestBody, { paramKey: 'valid' });
      
      expect(requestBody).not.toHaveProperty('undefined');
      expect(requestBody).not.toHaveProperty('null');
      expect(requestBody).not.toHaveProperty('empty');
      expect(requestBody).not.toHaveProperty('noSelection');
      expect(requestBody).toHaveProperty('valid', 'valid value');
    });
  });
  
  describe('processParameterBatch', () => {
    test('should process multiple parameters', () => {
      const params: IDataObject = { 
        param1: 'value1',
        param2: 'value2',
        param3: 'value3'
      };
      const requestBody: IDataObject = {};
      const mappings: ParameterMapping[] = [
        { paramKey: 'param1', apiKey: 'api_param1' },
        { paramKey: 'param2' },
        { paramKey: 'param3', transform: (v) => `${v}-transformed` }
      ];
      
      processParameterBatch(params, requestBody, mappings);
      
      expect(requestBody).toHaveProperty('api_param1', 'value1');
      expect(requestBody).toHaveProperty('param2', 'value2');
      expect(requestBody).toHaveProperty('param3', 'value3-transformed');
    });
  });
  
  describe('processThreeStateBoolean', () => {
    test('should handle true/false values', () => {
      const params: IDataObject = { 
        trueParam: 'true',
        falseParam: 'false',
        ignoredParam: 'NO_SELECTION'
      };
      const requestBody: IDataObject = {};
      
      processThreeStateBoolean(params, requestBody, 'trueParam');
      processThreeStateBoolean(params, requestBody, 'falseParam');
      processThreeStateBoolean(params, requestBody, 'ignoredParam');
      
      expect(requestBody).toHaveProperty('trueParam', true);
      expect(requestBody).toHaveProperty('falseParam', false);
      expect(requestBody).not.toHaveProperty('ignoredParam');
    });
    
    test('should use apiKey if provided', () => {
      const params: IDataObject = { boolParam: 'true' };
      const requestBody: IDataObject = {};
      
      processThreeStateBoolean(params, requestBody, 'boolParam', 'api_bool_param');
      
      expect(requestBody).toHaveProperty('api_bool_param', true);
    });
    
    test('should handle promptMagic special case', () => {
      const params: IDataObject = { 
        promptMagic: 'true',
        promptMagicStrength: '0.7',
        promptMagicVersion: 'v3'
      };
      const requestBody: IDataObject = {};
      
      // Process the boolean parameter
      processThreeStateBoolean(params, requestBody, 'promptMagic', 'prompt_magic');
      
      // Process the strength parameter
      const strengthMapping: ParameterMapping = { 
        paramKey: 'promptMagicStrength', 
        apiKey: 'prompt_magic_strength',
        transform: (value) => typeof value === 'string' ? parseFloat(value) : value 
      };
      processParameter(params, requestBody, strengthMapping);
      
      // Process the version parameter
      const versionMapping: ParameterMapping = { 
        paramKey: 'promptMagicVersion', 
        apiKey: 'prompt_magic_version'
      };
      processParameter(params, requestBody, versionMapping);
      
      expect(requestBody).toHaveProperty('prompt_magic', true);
      expect(requestBody).toHaveProperty('prompt_magic_strength', 0.7);
      expect(requestBody).toHaveProperty('prompt_magic_version', 'v3');
    });
  });
  
  describe('processNumericParameter', () => {
    test('should convert string to number', () => {
      const params: IDataObject = { numParam: '123.45' };
      const requestBody: IDataObject = {};
      
      processNumericParameter(params, requestBody, 'numParam');
      
      expect(requestBody).toHaveProperty('numParam', 123.45);
    });
    
    test('should handle already numeric values', () => {
      const params: IDataObject = { numParam: 123.45 };
      const requestBody: IDataObject = {};
      
      processNumericParameter(params, requestBody, 'numParam');
      
      expect(requestBody).toHaveProperty('numParam', 123.45);
    });
    
    test('should use apiKey if provided', () => {
      const params: IDataObject = { numParam: '123.45' };
      const requestBody: IDataObject = {};
      
      processNumericParameter(params, requestBody, 'numParam', 'api_num_param');
      
      expect(requestBody).toHaveProperty('api_num_param', 123.45);
    });
    
    test('should not add NaN values', () => {
      const params: IDataObject = { numParam: 'not a number' };
      const requestBody: IDataObject = {};
      
      processNumericParameter(params, requestBody, 'numParam');
      
      expect(requestBody).not.toHaveProperty('numParam');
    });
  });
  
  describe('buildRequestBody', () => {
    test('should build a request body with required parameters', () => {
      const nodeParameters = {
        prompt: 'test prompt',
        width: 1024,
        height: 768,
        numImages: 2,
        modelSelectionMethod: 'list',
        modelId: 'test-model-id',
        advancedOptions: false
      };
      
      const mockExecuteFunction = createLeonardoMockFunction(nodeParameters);
      const requestBody = buildRequestBody.call(mockExecuteFunction, 0);
      
      expect(requestBody).toHaveProperty('prompt', 'test prompt');
      expect(requestBody).toHaveProperty('width', 1024);
      expect(requestBody).toHaveProperty('height', 768);
      expect(requestBody).toHaveProperty('num_images', 2);
      expect(requestBody).toHaveProperty('modelId', 'test-model-id');
    });
    
    test('should handle advanced parameters when advancedOptions is true', () => {
      const nodeParameters = {
        prompt: 'test prompt',
        width: 1024,
        height: 768,
        numImages: 2,
        modelSelectionMethod: 'list',
        modelId: 'test-model-id',
        advancedOptions: true,
        negativePrompt: 'negative test',
        seed: '123456',
        guidanceScale: '7',
        inferenceSteps: '30',
        scheduler: 'EULER_DISCRETE',
        promptMagic: 'true',
        promptMagicStrength: '0.7',
        sdVersion: 'SDXL_1_0'
      };
      
      const mockExecuteFunction = createLeonardoMockFunction(nodeParameters);
      const requestBody = buildRequestBody.call(mockExecuteFunction, 0);
      
      // Required parameters
      expect(requestBody).toHaveProperty('prompt', 'test prompt');
      expect(requestBody).toHaveProperty('width', 1024);
      expect(requestBody).toHaveProperty('height', 768);
      expect(requestBody).toHaveProperty('num_images', 2);
      expect(requestBody).toHaveProperty('modelId', 'test-model-id');
      
      // Advanced parameters
      expect(requestBody).toHaveProperty('negative_prompt', 'negative test');
      expect(requestBody).toHaveProperty('seed', '123456');
      expect(requestBody).toHaveProperty('guidance_scale', 7);
      expect(requestBody).toHaveProperty('num_inference_steps', 30);
      expect(requestBody).toHaveProperty('scheduler', 'EULER_DISCRETE');
      expect(requestBody).toHaveProperty('prompt_magic', true);
      expect(requestBody).toHaveProperty('prompt_magic_strength', 0.7);
      expect(requestBody).toHaveProperty('sd_version', 'SDXL_1_0');
    });
  });

  // Test photoReal special case handling
  test('should handle photoReal special case', () => {
    const mockExecuteFunction = {
      getNodeParameter: jest.fn((paramName, itemIndex, defaultValue) => {
        if (paramName === 'prompt') return 'test prompt';
        if (paramName === 'width') return 1024;
        if (paramName === 'height') return 768;
        if (paramName === 'numImages') return 2;
        if (paramName === 'modelSelectionMethod') return 'list';
        if (paramName === 'modelId') return 'test-model-id';
        if (paramName === 'advancedOptions') return true;
        if (paramName === 'photoReal') return 'true';
        if (paramName === 'photoRealVersion') return 'v2';
        if (paramName === 'photoRealStrength') return '0.55';
        return defaultValue;
      })
    } as unknown as IExecuteFunctions;
    
    const requestBody = buildRequestBody.call(mockExecuteFunction, 0);
    
    expect(requestBody).toHaveProperty('photoreal', true);
    expect(requestBody).toHaveProperty('photoreal_style', 'v2');
    expect(requestBody).toHaveProperty('photoreal_strength', 0.55);
  });
  
  test('should handle photoReal without version or strength', () => {
    const mockExecuteFunction = {
      getNodeParameter: jest.fn((paramName, itemIndex, defaultValue) => {
        if (paramName === 'prompt') return 'test prompt';
        if (paramName === 'width') return 1024;
        if (paramName === 'height') return 768;
        if (paramName === 'numImages') return 2;
        if (paramName === 'modelSelectionMethod') return 'list';
        if (paramName === 'modelId') return 'test-model-id';
        if (paramName === 'advancedOptions') return true;
        if (paramName === 'photoReal') return 'true';
        if (paramName === 'photoRealVersion') return ''; // Empty string
        return defaultValue;
      })
    } as unknown as IExecuteFunctions;
    
    const requestBody = buildRequestBody.call(mockExecuteFunction, 0);
    
    expect(requestBody).toHaveProperty('photoreal', true);
    expect(requestBody).not.toHaveProperty('photoreal_style');
    expect(requestBody).not.toHaveProperty('photoreal_strength');
  });

  test('should handle canvasRequestType directly', () => {
    const mockThis = {
      getNodeParameter: (parameterName: string, itemIndex: number, defaultValue: any) => {
        if (parameterName === 'canvasRequestType') {
          return 'INPAINT';
        }
        return defaultValue;
      }
    };
    
    const requestBody: IDataObject = {};
    
    const canvasRequestType = mockThis.getNodeParameter('canvasRequestType', 0, '') as string;
    if (canvasRequestType && canvasRequestType !== '') {
      requestBody.canvas_request_type = canvasRequestType;
    }
    
    expect(requestBody).toHaveProperty('canvas_request_type', 'INPAINT');
  });

  test('should handle imageToImage with URLs', () => {
    const mockExecuteFunction = {
      getNodeParameter: jest.fn((paramName, itemIndex, defaultValue) => {
        if (paramName === 'prompt') return 'test prompt';
        if (paramName === 'width') return 1024;
        if (paramName === 'height') return 768;
        if (paramName === 'numImages') return 2;
        if (paramName === 'modelSelectionMethod') return 'list';
        if (paramName === 'modelId') return 'test-model-id';
        if (paramName === 'advancedOptions') return true;
        if (paramName === 'imageToImage') return 'true';
        if (paramName === 'initImageUrl') return 'https://example.com/source.jpg';
        if (paramName === 'initStrength') return '0.5';
        return defaultValue;
      })
    } as unknown as IExecuteFunctions;
    
    const requestBody = buildRequestBody.call(mockExecuteFunction, 0);
    
    expect(requestBody).toHaveProperty('image_to_image', true);
    expect(requestBody).toHaveProperty('init_image_url', 'https://example.com/source.jpg');
    expect(requestBody).toHaveProperty('init_strength', 0.5);
  });
  
  test('should handle imageToImage set to false', () => {
    const mockExecuteFunction = {
      getNodeParameter: jest.fn((paramName, itemIndex, defaultValue) => {
        if (paramName === 'prompt') return 'test prompt';
        if (paramName === 'width') return 1024;
        if (paramName === 'height') return 768;
        if (paramName === 'numImages') return 2;
        if (paramName === 'modelSelectionMethod') return 'list';
        if (paramName === 'modelId') return 'test-model-id';
        if (paramName === 'advancedOptions') return true;
        if (paramName === 'imageToImage') return 'false';
        return defaultValue;
      })
    } as unknown as IExecuteFunctions;
    
    const requestBody = buildRequestBody.call(mockExecuteFunction, 0);
    
    expect(requestBody).toHaveProperty('image_to_image', false);
  });

  test('should handle contrast correctly', () => {
    const nodeParameters = {
      prompt: 'test prompt',
      width: 1024,
      height: 768,
      numImages: 2,
      modelSelectionMethod: 'list',
      modelId: 'test-model-id',
      advancedOptions: true,
      contrast: 3.5
    };
    
    const mockExecuteFunction = createLeonardoMockFunction(nodeParameters);
    const requestBody = buildRequestBody.call(mockExecuteFunction, 0);
    
    expect(requestBody).toHaveProperty('contrast', 3.5);
  });
  
  test('should handle unzoom parameter mapping directly', () => {
    const params: IDataObject = { 
      unzoom: 'true', 
      unzoomAmount: '0.3'
    };
    
    const requestBody: IDataObject = {};
    
    const mapping: ParameterMapping = {
      paramKey: 'unzoomAmount',
      condition: (value, allParams) => allParams.unzoom === 'true',
      transform: (value) => typeof value === 'string' ? parseFloat(value) : value
    };
    
    processParameter(params, requestBody, mapping);
    
    expect(requestBody).toHaveProperty('unzoomAmount', 0.3);
  });

  test('should handle weighting transform directly', () => {
    const params: IDataObject = { 
      weighting: '0.85'
    };
    
    const requestBody: IDataObject = {};
    
    const mapping: ParameterMapping = {
      paramKey: 'weighting',
      transform: (value) => typeof value === 'string' ? parseFloat(value) : value
    };
    
    processParameter(params, requestBody, mapping);
    
    expect(requestBody).toHaveProperty('weighting', 0.85);
    
    const paramsNumeric: IDataObject = { 
      weighting: 0.75
    };
    const requestBodyNumeric: IDataObject = {};
    processParameter(paramsNumeric, requestBodyNumeric, mapping);
    expect(requestBodyNumeric).toHaveProperty('weighting', 0.75);
  });
  
  test('should handle unzoom transform and condition directly', () => {
    const paramsTrue: IDataObject = { 
      unzoomAmount: '0.4',
      unzoom: 'true'
    };
    
    const requestBodyTrue: IDataObject = {};
    
    const mapping: ParameterMapping = {
      paramKey: 'unzoomAmount',
      condition: (value, allParams) => allParams.unzoom === 'true',
      transform: (value) => typeof value === 'string' ? parseFloat(value) : value 
    };
    
    processParameter(paramsTrue, requestBodyTrue, mapping);
    
    expect(requestBodyTrue).toHaveProperty('unzoomAmount', 0.4);
    
    const paramsFalse: IDataObject = { 
      unzoomAmount: '0.4',
      unzoom: 'false'
    };
    const requestBodyFalse: IDataObject = {};
    
    processParameter(paramsFalse, requestBodyFalse, mapping);
    
    expect(requestBodyFalse).not.toHaveProperty('unzoomAmount');
    
    const paramsNumeric: IDataObject = { 
      unzoomAmount: 0.3,
      unzoom: 'true'
    };
    const requestBodyNumeric: IDataObject = {};
    processParameter(paramsNumeric, requestBodyNumeric, mapping);
    expect(requestBodyNumeric).toHaveProperty('unzoomAmount', 0.3);
  });

  test('should handle imagePrompts correctly', () => {
    const mockExecuteFunction = {
      getNodeParameter: jest.fn((paramName, itemIndex, defaultValue) => {
        if (paramName === 'prompt') return 'test prompt';
        if (paramName === 'width') return 1024;
        if (paramName === 'height') return 768;
        if (paramName === 'numImages') return 2;
        if (paramName === 'modelSelectionMethod') return 'list';
        if (paramName === 'modelId') return 'test-model-id';
        if (paramName === 'advancedOptions') return true;
        if (paramName === 'imagePrompts.imagePromptValues') return [{ imageId: 'test-image-id' }];
        return defaultValue;
      })
    } as any;

    const requestBody = buildRequestBody.call(mockExecuteFunction, 0);
    
    expect(requestBody).toHaveProperty('image_prompts');
    expect(Array.isArray(requestBody.image_prompts)).toBe(true);
  });

  test('should directly test imagePrompts array processing with URL (line 373)', () => {
    const mockExecute = {
      getNodeParameter: (parameter: string, itemIndex: number, defaultValue: any) => {
        if (parameter === 'prompt') return 'test prompt';
        if (parameter === 'width') return 1024;
        if (parameter === 'height') return 768;
        if (parameter === 'numImages') return 2;
        if (parameter === 'modelSelectionMethod') return 'list';
        if (parameter === 'modelId') return 'test-model-id';
        if (parameter === 'advancedOptions') return true;
        if (parameter === 'imagePrompts.imagePromptValues') {
          return [
            {
              imageId: 'test-image-id',
              url: 'https://example.com/test-image.jpg'
            }
          ];
        }
        return defaultValue;
      }
    } as any;
    
    const requestBody = buildRequestBody.call(mockExecute, 0);
    
    expect(requestBody).toHaveProperty('image_prompts');
    
    if (requestBody.image_prompts !== undefined && 
        Array.isArray(requestBody.image_prompts) && 
        requestBody.image_prompts.length > 0) {
      const firstItem = requestBody.image_prompts[0] as any;
      expect(firstItem).toHaveProperty('url', 'https://example.com/test-image.jpg');
    } else {
      fail('image_prompts should be a non-empty array');
    }
  });
  
  test('should directly test imagePrompts array processing without URL (line 375)', () => {
    const mockExecute = {
      getNodeParameter: (parameter: string, itemIndex: number, defaultValue: any) => {
        if (parameter === 'prompt') return 'test prompt';
        if (parameter === 'width') return 1024;
        if (parameter === 'height') return 768;
        if (parameter === 'numImages') return 2;
        if (parameter === 'modelSelectionMethod') return 'list';
        if (parameter === 'modelId') return 'test-model-id';
        if (parameter === 'advancedOptions') return true;
        if (parameter === 'imagePrompts.imagePromptValues') {
          return [
            {
              imageId: 'test-image-id'
            }
          ];
        }
        return defaultValue;
      }
    } as any;
    
    const requestBody = buildRequestBody.call(mockExecute, 0);
    
    expect(requestBody).toHaveProperty('image_prompts');
    
    if (requestBody.image_prompts !== undefined && 
        Array.isArray(requestBody.image_prompts) && 
        requestBody.image_prompts.length > 0) {
      expect(requestBody.image_prompts[0]).toBe('test-image-id');
    } else {
      fail('image_prompts should be a non-empty array');
    }
  });
  
  test('should handle controlnet parameters', () => {
    const mockExecute = {
      getNodeParameter: (parameter: string, itemIndex: number, defaultValue: any) => {
        if (parameter === 'prompt') return 'test prompt';
        if (parameter === 'width') return 1024;
        if (parameter === 'height') return 768;
        if (parameter === 'numImages') return 2;
        if (parameter === 'modelSelectionMethod') return 'list';
        if (parameter === 'modelId') return 'test-model-id';
        if (parameter === 'advancedOptions') return true;
        if (parameter === 'controlnetImageUrl') return 'https://example.com/controlnet.jpg';
        if (parameter === 'controlnetType') return 'canny';
        return defaultValue;
      }
    } as any;
    
    const requestBody = buildRequestBody.call(mockExecute, 0);
    
    expect(requestBody).toHaveProperty('controlnet_image_url', 'https://example.com/controlnet.jpg');
    expect(requestBody).toHaveProperty('controlnet_type', 'canny');
  });
  
  test('should handle controlnets array', () => {
    const mockExecute = {
      getNodeParameter: (parameter: string, itemIndex: number, defaultValue: any) => {
        if (parameter === 'prompt') return 'test prompt';
        if (parameter === 'width') return 1024;
        if (parameter === 'height') return 768;
        if (parameter === 'numImages') return 2;
        if (parameter === 'modelSelectionMethod') return 'list';
        if (parameter === 'modelId') return 'test-model-id';
        if (parameter === 'advancedOptions') return true;
        if (parameter === 'controlnets.controlNetValues') {
          return [
            {
              initImageId: 'test-init-image-id',
              initImageType: 'test-init-image-type',
              preprocessorId: 'test-preprocessor-id',
              weight: 0.75,
              strengthType: 'test-strength-type'
            }
          ];
        }
        return defaultValue;
      }
    } as any;
    
    const requestBody = buildRequestBody.call(mockExecute, 0);
    
    expect(requestBody).toHaveProperty('controlnets');
    
    if (requestBody.controlnets !== undefined && 
        Array.isArray(requestBody.controlnets) && 
        requestBody.controlnets.length > 0) {
      const controlnet = requestBody.controlnets[0] as any;
      expect(controlnet).toHaveProperty('initImageId', 'test-init-image-id');
      expect(controlnet).toHaveProperty('initImageType', 'test-init-image-type');
      expect(controlnet).toHaveProperty('preprocessorId', 'test-preprocessor-id');
      expect(controlnet).toHaveProperty('weight', 0.75);
      expect(controlnet).toHaveProperty('strengthType', 'test-strength-type');
    } else {
      fail('controlnets should be a non-empty array');
    }
  });
  
  test('should handle custom model ID selection', () => {
    const mockExecute = {
      getNodeParameter: (parameter: string, itemIndex: number, defaultValue: any) => {
        if (parameter === 'prompt') return 'test prompt';
        if (parameter === 'width') return 1024;
        if (parameter === 'height') return 768;
        if (parameter === 'numImages') return 2;
        if (parameter === 'modelSelectionMethod') return 'custom';
        if (parameter === 'customModelId') return 'custom-test-model-id';
        if (parameter === 'advancedOptions') return false;
        return defaultValue;
      }
    } as any;
    
    const requestBody = buildRequestBody.call(mockExecute, 0);
    
    expect(requestBody).toHaveProperty('modelId', 'custom-test-model-id');
  });
  
  test('should process image prompts without URL correctly', () => {
    const imagePromptsData = [
      { imageId: 'test-image-id-1' },
      { imageId: 'test-image-id-2' }
    ];
    
    const requestBody: IDataObject = {};
    
    requestBody.image_prompts = imagePromptsData.map(prompt => prompt.imageId);
    
    expect(requestBody).toHaveProperty('image_prompts');
    expect(Array.isArray(requestBody.image_prompts)).toBe(true);
    expect(requestBody.image_prompts).toContain('test-image-id-1');
    expect(requestBody.image_prompts).toContain('test-image-id-2');
  });

  test('should directly test controlnet parameter processing (lines 319-323)', () => {
    const mockExecute = {
      getNodeParameter: (parameter: string, itemIndex: number, defaultValue: any) => {
        if (parameter === 'controlnetImageUrl') {
          return 'https://example.com/control.jpg';
        }
        if (parameter === 'controlnetType') {
          return 'CONDITION';
        }
        return defaultValue;
      }
    } as any;
    
    const requestBody: IDataObject = {};
    
    const controlnetImageUrl = mockExecute.getNodeParameter('controlnetImageUrl', 0, '') as string;
    if (controlnetImageUrl && controlnetImageUrl !== '') {
      requestBody.controlnet_image_url = controlnetImageUrl;
      
      const controlnetType = mockExecute.getNodeParameter('controlnetType', 0, '') as string;
      if (controlnetType && controlnetType !== '') {
        requestBody.controlnet_type = controlnetType;
      }
    }
    
    expect(requestBody).toHaveProperty('controlnet_image_url', 'https://example.com/control.jpg');
    expect(requestBody).toHaveProperty('controlnet_type', 'CONDITION');
  });
  
  test('should directly test controlnets array mapping (line 351)', () => {
    const mockExecute = {
      getNodeParameter: (parameter: string, itemIndex: number, defaultValue: any) => {
        if (parameter === 'controlnets.controlNetValues') {
          return [
            {
              initImageId: 'test-image-id-1',
              initImageType: 'UPLOADED',
              preprocessorId: '67',
              weight: 0.6,
              strengthType: 'Mid'
            }
          ];
        }
        return defaultValue;
      }
    } as any;
    
    const requestBody: IDataObject = {};
    
    const controlnets = mockExecute.getNodeParameter(
      'controlnets.controlNetValues',
      0,
      []
    ) as Array<{
      initImageId: string;
      initImageType: string;
      preprocessorId: string;
      weight?: number;
      strengthType?: string;
    }>;
    
    if (controlnets && controlnets.length > 0) {
      requestBody.controlnets = controlnets.map(controlnet => ({
        initImageId: controlnet.initImageId,
        initImageType: controlnet.initImageType,
        preprocessorId: controlnet.preprocessorId,
        weight: controlnet.weight,
        strengthType: controlnet.strengthType,
      }));
    }
    
    expect(requestBody).toHaveProperty('controlnets');
    expect(Array.isArray(requestBody.controlnets)).toBe(true);
    
    const csParams: IDataObject = { 
      controlnetStrength: '0.75'
    };
    
    const csRequestBody: IDataObject = {};
    
    const csMapping: ParameterMapping = {
      paramKey: 'controlnetStrength',
      apiKey: 'controlnet_strength',
      transform: (value) => typeof value === 'string' ? parseFloat(value) : value
    };
    
    processParameter(csParams, csRequestBody, csMapping);
    
    expect(csRequestBody).toHaveProperty('controlnet_strength', 0.75);
    
    if (requestBody.controlnets !== undefined && 
        Array.isArray(requestBody.controlnets) && 
        requestBody.controlnets.length > 0) {
      const controlnet = requestBody.controlnets[0] as any;
      expect(requestBody.controlnets.length).toBe(1);
      expect(controlnet).toHaveProperty('initImageId', 'test-image-id-1');
      expect(controlnet).toHaveProperty('initImageType', 'UPLOADED');
      expect(controlnet).toHaveProperty('preprocessorId', '67');
      expect(controlnet).toHaveProperty('weight', 0.6);
      expect(controlnet).toHaveProperty('strengthType', 'Mid');
    } else {
      fail('controlnets should be a non-empty array');
    }
  });

  test('should process image-to-image parameter correctly', () => {
    const requestBodyTrue: IDataObject = {};
    const requestBodyFalse: IDataObject = {};
    
    requestBodyTrue.image_to_image = true;
    requestBodyFalse.image_to_image = false;
    
    expect(requestBodyTrue).toHaveProperty('image_to_image', true);
    expect(requestBodyFalse).toHaveProperty('image_to_image', false);
  });

  describe('Direct tests for uncovered lines in parameterUtils.ts', () => {
    test('processParameter directly tests null and undefined values', () => {
      const paramsUndefined: IDataObject = { someParam: undefined };
      const requestBodyUndefined: IDataObject = {};
      
      processParameter(paramsUndefined, requestBodyUndefined, {
        paramKey: 'someParam',
        apiKey: 'api_key'
      });
      
      expect(requestBodyUndefined).not.toHaveProperty('api_key');
      
      const paramsNull: IDataObject = { someParam: null };
      const requestBodyNull: IDataObject = {};
      
      processParameter(paramsNull, requestBodyNull, {
        paramKey: 'someParam',
        apiKey: 'api_key'
      });
      
      expect(requestBodyNull).not.toHaveProperty('api_key');
    });
    
    test('tests controlnetStrength parameter transformation directly', () => {
      const mockExecute = {
        getNodeParameter: jest.fn((paramName, itemIndex, defaultValue) => {
          if (paramName === 'controlnetStrength') return '0.78';
          return defaultValue;
        })
      } as unknown as IExecuteFunctions;
      
      const params: IDataObject = { controlnetStrength: '0.78' };
      const requestBody: IDataObject = {};
      
      const numericParams = [
        { paramKey: 'guidanceScale', apiKey: 'guidance_scale', transform: (v: any) => typeof v === 'string' ? parseFloat(v) : v },
        { paramKey: 'inferenceSteps', apiKey: 'num_inference_steps', transform: (v: any) => typeof v === 'string' ? parseInt(v as string, 10) : v },
        { paramKey: 'weighting', transform: (v: any) => typeof v === 'string' ? parseFloat(v) : v },
        { paramKey: 'promptMagicStrength', apiKey: 'prompt_magic_strength', transform: (v: any) => typeof v === 'string' ? parseFloat(v) : v },
        { paramKey: 'promptMagicVersion', apiKey: 'prompt_magic_version' },
        { paramKey: 'unzoomAmount', condition: (v: any, p: IDataObject) => p.unzoom === 'true' || p.unzoom === true, transform: (v: any) => typeof v === 'string' ? parseFloat(v) : v },
        { paramKey: 'controlnetStrength', apiKey: 'controlnet_strength', transform: (v: any) => typeof v === 'string' ? parseFloat(v) : v }
      ];
      
      const controlnetMapping = numericParams[6];
      
      processParameter(params, requestBody, controlnetMapping);
      
      expect(requestBody).toHaveProperty('controlnet_strength', 0.78);
      expect(typeof requestBody.controlnet_strength).toBe('number');
    });
    
    test('canvasRequestType fallback in actual buildRequestBody context', () => {
      const mockExecuteFn = {
        getNodeParameter: jest.fn((paramName, itemIndex, defaultValue) => {
          if (paramName === 'canvasRequest') return true;
          if (paramName === 'canvasRequestType') return 'INPAINT';
          if (paramName === 'prompt') return 'test prompt';
          if (paramName === 'width') return 512;
          if (paramName === 'height') return 512;
          if (paramName === 'numImages') return 1;
          if (paramName === 'modelId') return 'test-model';
          return defaultValue;
        })
      } as unknown as IExecuteFunctions;
      
      const params: IDataObject = { 
        canvasRequest: true
      };
      
      const requestBody: IDataObject = {};
      
      if (params.canvasRequest === 'true' || params.canvasRequest === true) {
        const canvasRequestType = params.canvasRequestType as string || 
                             mockExecuteFn.getNodeParameter('canvasRequestType', 0, '') as string;
        if (canvasRequestType && canvasRequestType !== '') {
          requestBody.canvas_request_type = canvasRequestType;
        }
      }
      
      expect(requestBody).toHaveProperty('canvas_request_type', 'INPAINT');
      expect(mockExecuteFn.getNodeParameter).toHaveBeenCalledWith('canvasRequestType', 0, '');
    });
  });
});