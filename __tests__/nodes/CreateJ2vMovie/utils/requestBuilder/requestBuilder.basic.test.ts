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

    // TARGET LINES 10-11: Test getParameterValue with different parameter types/values
    test('should handle getParameterValue with no default value provided', () => {
      const mockExecute = {
        getNodeParameter: jest.fn().mockReturnValue(42),
        logger: {
          debug: jest.fn(),
          warn: jest.fn(),
          info: jest.fn(),
          error: jest.fn(),
        }
      };
      
      const result = getParameterValue.call(
        mockExecute as unknown as IExecuteFunctions,
        'numericParam'
        // No itemIndex provided - should default to 0
        // No defaultValue provided - should default to ''
      );
      
      expect(result).toBe(42);
      expect(mockExecute.getNodeParameter).toHaveBeenCalledWith('numericParam', 0, '');
    });

    test('should handle getParameterValue with custom itemIndex', () => {
      const mockExecute = {
        getNodeParameter: jest.fn().mockReturnValue('custom-item-value'),
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
        2, // Custom item index
        'fallback'
      );
      
      expect(result).toBe('custom-item-value');
      expect(mockExecute.getNodeParameter).toHaveBeenCalledWith('testParam', 2, 'fallback');
    });

    test('should handle getParameterValue with null error (not Error object)', () => {
      const mockExecute = {
        getNodeParameter: jest.fn().mockImplementation(() => {
          throw 'String error instead of Error object';
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
        'failingParam',
        0,
        'emergency-default'
      );
      
      expect(result).toBe('emergency-default');
    });

    test('should handle getParameterValue with boolean default value', () => {
      const mockExecute = {
        getNodeParameter: jest.fn().mockImplementation(() => {
          throw new Error('Parameter not available');
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
        'booleanParam',
        0,
        true // Boolean default value
      );
      
      expect(result).toBe(true);
    });

    test('should handle getParameterValue with null return value', () => {
      const mockExecute = {
        getNodeParameter: jest.fn().mockReturnValue(null),
        logger: {
          debug: jest.fn(),
          warn: jest.fn(),
          info: jest.fn(),
          error: jest.fn(),
        }
      };
      
      const result = getParameterValue.call(
        mockExecute as unknown as IExecuteFunctions,
        'nullParam',
        0,
        'should-not-be-used'
      );
      
      expect(result).toBe(null);
    });

    test('should handle getParameterValue with undefined return value', () => {
      const mockExecute = {
        getNodeParameter: jest.fn().mockReturnValue(undefined),
        logger: {
          debug: jest.fn(),
          warn: jest.fn(),
          info: jest.fn(),
          error: jest.fn(),
        }
      };
      
      const result = getParameterValue.call(
        mockExecute as unknown as IExecuteFunctions,
        'undefinedParam',
        0,
        'backup-value'
      );
      
      expect(result).toBe(undefined);
    });
  });
});