// __tests__/nodes/CreateJ2vMovie/utils/requestBuilder/sharedBuilder.test.ts

jest.mock('@nodes/CreateJ2vMovie/utils/elementProcessor', () => ({
  processElement: jest.fn()
}));

jest.mock('@nodes/CreateJ2vMovie/utils/textElementProcessor', () => ({
  processTextElement: jest.fn(),
  processSubtitleElement: jest.fn()
}));

import { IDataObject } from 'n8n-workflow';
import { getParameterValue, processMovieElements } from '@nodes/CreateJ2vMovie/utils/requestBuilder/shared';
import { processElement } from '@nodes/CreateJ2vMovie/utils/elementProcessor';
import { processTextElement, processSubtitleElement } from '@nodes/CreateJ2vMovie/utils/textElementProcessor';

const createMockExecuteFunctions = () => ({
  getNodeParameter: jest.fn(),
  logger: { 
    warn: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    error: jest.fn()
  },
  getCredentials: jest.fn(),
  getExecutionId: jest.fn(),
  getNode: jest.fn(),
  getWorkflow: jest.fn(),
  getMode: jest.fn(),
  getActivationMode: jest.fn(),
  getRestApiUrl: jest.fn(),
  getInstanceBaseUrl: jest.fn(),
  getTimezone: jest.fn(),
  getExecuteData: jest.fn(),
  sendMessageToUI: jest.fn(),
  helpers: {} as any,
} as any);

describe('requestBuilder shared utilities', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getParameterValue', () => {

    test('should return parameter value when parameter exists', () => {
      const mockExecute = createMockExecuteFunctions();
      mockExecute.getNodeParameter.mockReturnValue('test-value');

      const result = getParameterValue.call(mockExecute, 'testParam', 0, 'default');

      expect(result).toBe('test-value');
      expect(mockExecute.getNodeParameter).toHaveBeenCalledWith('testParam', 0, 'default');
    });

    test('should return default value when parameter access throws error', () => {
      const mockExecute = createMockExecuteFunctions();
      mockExecute.getNodeParameter.mockImplementation(() => {
        throw new Error('Parameter not found');
      });

      const result = getParameterValue.call(mockExecute, 'nonexistentParam', 0, 'fallback');

      expect(result).toBe('fallback');
      expect(mockExecute.getNodeParameter).toHaveBeenCalledWith('nonexistentParam', 0, 'fallback');
    });

    test('should use default itemIndex and defaultValue when not provided', () => {
      const mockExecute = createMockExecuteFunctions();
      mockExecute.getNodeParameter.mockReturnValue('param-value');

      const result = getParameterValue.call(mockExecute, 'testParam');

      expect(result).toBe('param-value');
      expect(mockExecute.getNodeParameter).toHaveBeenCalledWith('testParam', 0, '');
    });

    test('should handle different parameter types', () => {
      const mockExecute = createMockExecuteFunctions();
      
      // Test string
      mockExecute.getNodeParameter.mockReturnValueOnce('string-value');
      expect(getParameterValue.call(mockExecute, 'stringParam')).toBe('string-value');

      // Test number
      mockExecute.getNodeParameter.mockReturnValueOnce(42);
      expect(getParameterValue.call(mockExecute, 'numberParam')).toBe(42);

      // Test boolean
      mockExecute.getNodeParameter.mockReturnValueOnce(true);
      expect(getParameterValue.call(mockExecute, 'boolParam')).toBe(true);
    });
  });

  describe('processMovieElements', () => {

    test('should handle empty movieElements array', () => {
      const mockExecute = createMockExecuteFunctions();
      const movieElements: IDataObject[] = [];
      const allMovieElements: IDataObject[] = [];
      const requestBody = { width: 1024, height: 768 };

      processMovieElements.call(mockExecute, movieElements, requestBody, allMovieElements);

      expect(allMovieElements).toHaveLength(0);
      expect(processTextElement).not.toHaveBeenCalled();
      expect(processSubtitleElement).not.toHaveBeenCalled();
      expect(processElement).not.toHaveBeenCalled();
    });

    test('should handle null or undefined movieElements', () => {
      const mockExecute = createMockExecuteFunctions();
      const allMovieElements: IDataObject[] = [];
      const requestBody = { width: 1024, height: 768 };

      // Test null
      processMovieElements.call(mockExecute, null as any, requestBody, allMovieElements);
      expect(allMovieElements).toHaveLength(0);

      // Test undefined
      processMovieElements.call(mockExecute, undefined as any, requestBody, allMovieElements);
      expect(allMovieElements).toHaveLength(0);
    });

    test('should process text elements correctly', () => {
      const mockExecute = createMockExecuteFunctions();
      const mockProcessedText = { type: 'text', text: 'Processed text', settings: {} };
      (processTextElement as jest.MockedFunction<typeof processTextElement>)
        .mockReturnValue(mockProcessedText as any);

      const movieElements: IDataObject[] = [
        {
          type: 'text',
          text: 'Test text',
          start: 0,
          duration: 5,
          style: '001',
          position: 'center-center',
          'font-family': 'Arial',
          'font-size': '24px',
          color: '#FF0000'
        }
      ];
      const allMovieElements: IDataObject[] = [];
      const requestBody = { width: 1024, height: 768 };

      processMovieElements.call(mockExecute, movieElements, requestBody, allMovieElements);

      expect(processTextElement).toHaveBeenCalledWith({
        text: 'Test text',
        start: 0,
        duration: 5,
        style: '001',
        position: 'center-center',
        fontFamily: 'Arial',
        fontSize: '24px',
        fontColor: '#FF0000'
      });
      expect(allMovieElements).toHaveLength(1);
      expect(allMovieElements[0]).toEqual(mockProcessedText);
    });

    test('should handle text elements with missing properties', () => {
      const mockExecute = createMockExecuteFunctions();
      const mockProcessedText = { type: 'text', text: 'Default Text', settings: {} };
      (processTextElement as jest.MockedFunction<typeof processTextElement>)
        .mockReturnValue(mockProcessedText as any);

      const movieElements: IDataObject[] = [
        {
          type: 'text',
          // Missing text property - should use default
        }
      ];
      const allMovieElements: IDataObject[] = [];
      const requestBody = { width: 1024, height: 768 };

      processMovieElements.call(mockExecute, movieElements, requestBody, allMovieElements);

      expect(processTextElement).toHaveBeenCalledWith({
        text: 'Default Text'
      });
      expect(allMovieElements).toHaveLength(1);
    });

    test('should handle text elements with undefined values', () => {
      const mockExecute = createMockExecuteFunctions();
      const mockProcessedText = { type: 'text', text: 'Test', settings: {} };
      (processTextElement as jest.MockedFunction<typeof processTextElement>)
        .mockReturnValue(mockProcessedText as any);

      const movieElements: IDataObject[] = [
        {
          type: 'text',
          text: 'Test',
          start: undefined,
          duration: undefined,
          'font-family': undefined
        }
      ];
      const allMovieElements: IDataObject[] = [];
      const requestBody = { width: 1024, height: 768 };

      processMovieElements.call(mockExecute, movieElements, requestBody, allMovieElements);

      // Should only include defined properties
      expect(processTextElement).toHaveBeenCalledWith({
        text: 'Test'
      });
    });

    test('should process subtitle elements correctly', () => {
      const mockExecute = createMockExecuteFunctions();
      const mockProcessedSubtitle = { type: 'subtitles', text: 'Subtitle text', language: 'en' };
      (processSubtitleElement as jest.MockedFunction<typeof processSubtitleElement>)
        .mockReturnValue(mockProcessedSubtitle as any);

      const movieElements: IDataObject[] = [
        {
          type: 'subtitles',
          captions: 'Subtitle content',
          language: 'es',
          model: 'whisper',
          start: 2,
          duration: 10
        }
      ];
      const allMovieElements: IDataObject[] = [];
      const requestBody = { width: 1024, height: 768 };

      processMovieElements.call(mockExecute, movieElements, requestBody, allMovieElements);

      expect(processSubtitleElement).toHaveBeenCalledWith({
        captions: 'Subtitle content',
        language: 'es',
        model: 'whisper',
        start: 2,
        duration: 10
      });
      expect(allMovieElements).toHaveLength(1);
      expect(allMovieElements[0]).toEqual(mockProcessedSubtitle);
    });

    test('should handle subtitle elements with default values', () => {
      const mockExecute = createMockExecuteFunctions();
      const mockProcessedSubtitle = { type: 'subtitles', text: '', language: 'en' };
      (processSubtitleElement as jest.MockedFunction<typeof processSubtitleElement>)
        .mockReturnValue(mockProcessedSubtitle as any);

      const movieElements: IDataObject[] = [
        {
          type: 'subtitles',
          captions: 'Test subtitle'
          // Missing language and model - should use defaults
        }
      ];
      const allMovieElements: IDataObject[] = [];
      const requestBody = { width: 1024, height: 768 };

      processMovieElements.call(mockExecute, movieElements, requestBody, allMovieElements);

      expect(processSubtitleElement).toHaveBeenCalledWith({
        captions: 'Test subtitle',
        language: 'en',
        model: 'default'
      });
    });

    test('should process other element types using processElement', () => {
      const mockExecute = createMockExecuteFunctions();
      const mockProcessedElement = { type: 'image', src: 'processed.jpg' };
      (processElement as jest.MockedFunction<typeof processElement>)
        .mockReturnValue(mockProcessedElement);

      const movieElements: IDataObject[] = [
        {
          type: 'image',
          src: 'test.jpg',
          duration: 5
        },
        {
          type: 'video',
          src: 'test.mp4',
          duration: 10
        }
      ];
      const allMovieElements: IDataObject[] = [];
      const requestBody = { width: 1024, height: 768 };

      processMovieElements.call(mockExecute, movieElements, requestBody, allMovieElements);

      expect(processElement).toHaveBeenCalledTimes(2);
      expect(processElement).toHaveBeenNthCalledWith(1, movieElements[0], 1024, 768);
      expect(processElement).toHaveBeenNthCalledWith(2, movieElements[1], 1024, 768);
      expect(allMovieElements).toHaveLength(2);
      expect(allMovieElements[0]).toEqual(mockProcessedElement);
      expect(allMovieElements[1]).toEqual(mockProcessedElement);
    });

    test('should handle mixed element types', () => {
      const mockExecute = createMockExecuteFunctions();
      const mockProcessedText = { type: 'text', text: 'Text element' };
      const mockProcessedSubtitle = { type: 'subtitles', text: 'Subtitle element' };
      const mockProcessedImage = { type: 'image', src: 'image.jpg' };

      (processTextElement as jest.MockedFunction<typeof processTextElement>)
        .mockReturnValue(mockProcessedText as any);
      (processSubtitleElement as jest.MockedFunction<typeof processSubtitleElement>)
        .mockReturnValue(mockProcessedSubtitle as any);
      (processElement as jest.MockedFunction<typeof processElement>)
        .mockReturnValue(mockProcessedImage);

      const movieElements: IDataObject[] = [
        { type: 'text', text: 'Test text' },
        { type: 'subtitles', captions: 'Test subtitle', language: 'en' },
        { type: 'image', src: 'test.jpg' }
      ];
      const allMovieElements: IDataObject[] = [];
      const requestBody = { width: 1024, height: 768 };

      processMovieElements.call(mockExecute, movieElements, requestBody, allMovieElements);

      expect(processTextElement).toHaveBeenCalledTimes(1);
      expect(processSubtitleElement).toHaveBeenCalledTimes(1);
      expect(processElement).toHaveBeenCalledTimes(1);
      expect(allMovieElements).toHaveLength(3);
      expect(allMovieElements[0]).toEqual(mockProcessedText);
      expect(allMovieElements[1]).toEqual(mockProcessedSubtitle);
      expect(allMovieElements[2]).toEqual(mockProcessedImage);
    });

    test('should handle processing errors and continue with other elements', () => {
      const mockExecute = createMockExecuteFunctions();
      const mockProcessedText = { type: 'text', text: 'Success' };

      (processTextElement as jest.MockedFunction<typeof processTextElement>)
        .mockImplementationOnce(() => {
          throw new Error('Text processing failed');
        })
        .mockReturnValue(mockProcessedText as any);

      const movieElements: IDataObject[] = [
        { type: 'text', text: 'Failing text' },
        { type: 'text', text: 'Success text' }
      ];
      const allMovieElements: IDataObject[] = [];
      const requestBody = { width: 1024, height: 768 };

      processMovieElements.call(mockExecute, movieElements, requestBody, allMovieElements);

      expect(mockExecute.logger.warn).toHaveBeenCalledWith('Failed to process movie element: Error: Text processing failed');
      expect(allMovieElements).toHaveLength(1);
      expect(allMovieElements[0]).toEqual(mockProcessedText);
    });

    test('should handle position validation for text elements', () => {
      const mockExecute = createMockExecuteFunctions();
      const mockProcessedText = { type: 'text', text: 'Test' };
      (processTextElement as jest.MockedFunction<typeof processTextElement>)
        .mockReturnValue(mockProcessedText as any);

      const movieElements: IDataObject[] = [
        {
          type: 'text',
          text: 'Test with valid position',
          position: 'top-left'
        },
        {
          type: 'text',
          text: 'Test with invalid position',
          position: 'invalid-position'
        },
        {
          type: 'text',
          text: 'Test with non-string position',
          position: 123
        }
      ];
      const allMovieElements: IDataObject[] = [];
      const requestBody = { width: 1024, height: 768 };

      processMovieElements.call(mockExecute, movieElements, requestBody, allMovieElements);

      // First call should include position
      expect(processTextElement).toHaveBeenNthCalledWith(1, {
        text: 'Test with valid position',
        position: 'top-left'
      });

      // Second call should include position (string passed through)
      expect(processTextElement).toHaveBeenNthCalledWith(2, {
        text: 'Test with invalid position',
        position: 'invalid-position'
      });
      
      // Third call should not include position (non-string)
      expect(processTextElement).toHaveBeenNthCalledWith(3, {
        text: 'Test with non-string position'
      });
    });

    test('should maintain allMovieElements array reference', () => {
      const mockExecute = createMockExecuteFunctions();
      const mockProcessedText = { type: 'text', text: 'Test' };
      (processTextElement as jest.MockedFunction<typeof processTextElement>)
        .mockReturnValue(mockProcessedText as any);

      const movieElements: IDataObject[] = [
        { type: 'text', text: 'Test text' }
      ];
      const allMovieElements: IDataObject[] = [];
      const originalReference = allMovieElements;
      const requestBody = { width: 1024, height: 768 };

      processMovieElements.call(mockExecute, movieElements, requestBody, allMovieElements);

      // Should modify the same array reference, not create a new one
      expect(allMovieElements).toBe(originalReference);
      expect(allMovieElements).toHaveLength(1);
    });
  });
});