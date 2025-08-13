import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { getParameterValue } from '../../../../../nodes/CreateJ2vMovie/utils/requestBuilder';

describe('requestBuilder - Basic Functions', () => {
  describe('getParameterValue', () => {
    test('should return parameter value when found', () => {
      const mockExecute = {
        getNodeParameter: jest.fn().mockReturnValue('test-value'),
        logger: {
          debug: jest.fn(),
          warn: jest.fn(),
          info: jest.fn(),
          error: jest.fn(),
        }
      };
      
      const result = getParameterValue.call(
        mockExecute as unknown as IExecuteFunctions,
        'testParam',
        0,
        'defaultValue'
      );
      
      expect(result).toBe('test-value');
      expect(mockExecute.getNodeParameter).toHaveBeenCalledWith('testParam', 0, 'defaultValue');
    });

    test('should return default value when parameter lookup fails', () => {
      const mockExecute = {
        getNodeParameter: jest.fn().mockImplementation(() => {
          throw new Error('Parameter not found');
        }),
        logger: {
          debug: jest.fn(),
          warn: jest.fn(),
          info: jest.fn(),
          error: jest.fn(),
        }
      };
      
      const result = getParameterValue.call(
        mockExecute as unknown as IExecuteFunctions,
        'nonExistentParameter',
        0,
        'defaultValue'
      );
      
      expect(result).toBe('defaultValue');
    });
  });
});