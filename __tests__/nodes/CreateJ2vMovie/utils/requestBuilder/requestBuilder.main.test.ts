import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { buildRequestBody } from '../../../../../nodes/CreateJ2vMovie/utils/requestBuilder';

describe('requestBuilder - Main Operations', () => {
  describe('buildRequestBody - Core Operations', () => {
    test('should handle checkStatus operation correctly', () => {
      const mockExecute = {
        getNodeParameter: (parameterName: string, itemIndex: number, fallbackValue?: any) => {
          if (parameterName === 'operation') return 'checkStatus';
          return fallbackValue;
        },
        logger: {
          debug: jest.fn(),
          warn: jest.fn(),
          info: jest.fn(),
          error: jest.fn(),
        }
      };
      
      const result = buildRequestBody.call(
        mockExecute as unknown as IExecuteFunctions, 
        'checkStatus', 
        0, 
        false
      );
      
      expect(result).toEqual({});
    });
    
    test('should throw error for unsupported operations', () => {
      const mockExecute = {
        getNodeParameter: (parameterName: string, itemIndex: number, fallbackValue?: any) => {
          if (parameterName === 'operation') return 'unknownOperation';
          return fallbackValue;
        },
        logger: {
          debug: jest.fn(),
          warn: jest.fn(),
          info: jest.fn(),
          error: jest.fn(),
        }
      };
      
      expect(() => {
        buildRequestBody.call(
          mockExecute as unknown as IExecuteFunctions, 
          'unknownOperation', 
          0, 
          false
        );
      }).toThrow('Unsupported operation: unknownOperation');
    });

    test('should execute createMovie in basic mode', () => {
      const mockExecute = {
        getNodeParameter: (parameterName: string, itemIndex: number, fallbackValue?: any) => {
          if (parameterName === 'framerate') return 30;
          if (parameterName === 'output_width') return 1920;
          if (parameterName === 'output_height') return 1080;
          return fallbackValue;
        },
        logger: {
          debug: jest.fn(),
          warn: jest.fn(),
          info: jest.fn(),
          error: jest.fn(),
        }
      };
      
      const result = buildRequestBody.call(
        mockExecute as unknown as IExecuteFunctions, 
        'createMovie', 
        0, 
        false
      );
      
      expect(result).toHaveProperty('fps', 30);
      expect(result).toHaveProperty('width', 1920);
      expect(result).toHaveProperty('height', 1080);
      expect(result).toHaveProperty('scenes');
    });

    test('should execute mergeVideoAudio in basic mode', () => {
      const mockExecute = {
        getNodeParameter: (parameterName: string, itemIndex: number, fallbackValue?: any) => {
          return fallbackValue;
        },
        logger: {
          debug: jest.fn(),
          warn: jest.fn(),
          info: jest.fn(),
          error: jest.fn(),
        }
      };
      
      const result = buildRequestBody.call(
        mockExecute as unknown as IExecuteFunctions, 
        'mergeVideoAudio', 
        0, 
        false
      );
      
      expect(result).toHaveProperty('scenes');
      expect(result).toHaveProperty('width', 1024);
      expect(result).toHaveProperty('height', 768);
      expect(result).toHaveProperty('fps', 30);
    });

    test('should execute mergeVideos in basic mode', () => {
      const mockExecute = {
        getNodeParameter: (parameterName: string, itemIndex: number, fallbackValue?: any) => {
          return fallbackValue;
        },
        logger: {
          debug: jest.fn(),
          warn: jest.fn(),
          info: jest.fn(),
          error: jest.fn(),
        }
      };
      
      const result = buildRequestBody.call(
        mockExecute as unknown as IExecuteFunctions, 
        'mergeVideos', 
        0, 
        false
      );
      
      expect(result).toHaveProperty('scenes');
      expect(result).toHaveProperty('width', 1024);
      expect(result).toHaveProperty('height', 768);
      expect(result).toHaveProperty('fps', 30);
    });
  });
});