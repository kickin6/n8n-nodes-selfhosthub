// __tests__/nodes/CreateJ2vMovie/utils/requestBuilder/createMovie/createMovieBuilder.movieElements.test.ts

jest.mock('@nodes/CreateJ2vMovie/utils/elementProcessor', () => ({
  processElement: jest.fn()
}));

import { validateElements } from '../shared/elementValidators';
import { getElementFixture } from '../shared/elementTestHelpers';
import { createMockExecute } from '../shared/mockHelpers';
import { buildCreateMovieRequestBody } from '@nodes/CreateJ2vMovie/utils/requestBuilder';
import { processElement } from '@nodes/CreateJ2vMovie/utils/elementProcessor';

describe('createMovieBuilder - Movie-Level Elements', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Movie-Level Text Elements Processing', () => {

    test('should process movie-level text elements', () => {
      const textElement = getElementFixture('text', 'complete');

      const mockExecute = createMockExecute({
        'movieTextElements.textDetails': [textElement]
      });

      const result = buildCreateMovieRequestBody.call(mockExecute, 0);

      expect(result.elements).toHaveLength(1);
      const processedElement = result.elements![0] as any;
      expect(processedElement.type).toBe('text');
      expect(processedElement.text).toBe(textElement.text);
      expect(processedElement.style).toBe(textElement.style);
    });

    test('should process multiple movie-level text elements', () => {
      const elements = [
        {
          text: 'First movie text',
          style: '001',
          fontFamily: 'Arial',
          fontSize: '24px',
          start: 0,
          duration: 10
        },
        {
          text: 'Second movie text',
          style: '002',
          fontFamily: 'Roboto',
          fontSize: '28px',
          start: 5,
          duration: 15
        }
      ];

      const validation = validateElements(elements);
      expect(validation.isValid).toBe(true);

      const mockExecute = createMockExecute({
        'movieTextElements.textDetails': elements
      });

      const result = buildCreateMovieRequestBody.call(mockExecute, 0);

      expect(result.elements).toHaveLength(2);
      const firstElement = result.elements![0] as any;
      const secondElement = result.elements![1] as any;

      expect(firstElement.text).toBe('First movie text');
      expect(firstElement.style).toBe('001');
      expect((firstElement.settings as any)['font-family']).toBe('Arial');

      expect(secondElement.text).toBe('Second movie text');
      expect(secondElement.style).toBe('002');
      expect((secondElement.settings as any)['font-family']).toBe('Roboto');
    });

    test('should handle movie-level text elements with special durations', () => {
      const textElement = {
        text: 'Movie overlay text',
        style: '001',
        start: 0,
        duration: -2
      };

      const mockExecute = createMockExecute({
        'movieTextElements.textDetails': [textElement]
      });

      const result = buildCreateMovieRequestBody.call(mockExecute, 0);

      expect(result.elements).toHaveLength(1);
      expect((result.elements![0] as any).text).toBe('Movie overlay text');
      expect((result.elements![0] as any).duration).toBe(-2);
    });

    test('should collect movie text validation errors', () => {
      const mockExecute = createMockExecute({
        'movieTextElements.textDetails': [
          { text: '', style: '001' }, // Invalid - empty text
          { text: 'Valid text', style: '002' }, // Valid
          { style: '003' }, // Invalid - missing text
        ]
      });

      expect(() => {
        buildCreateMovieRequestBody.call(mockExecute, 0);
      }).toThrow('Movie text element validation errors');
    });

    test('should throw movie text validation errors', () => {
      const mockExecute = createMockExecute({
        'movieTextElements.textDetails': [
          { text: '', style: '001' }, // Invalid text element
        ]
      });

      expect(() => {
        buildCreateMovieRequestBody.call(mockExecute, 0);
      }).toThrow('Movie text element validation errors:\nMovie text element 1:');
    });

    test('should handle mixed valid and invalid movie text elements for error collection', () => {
      const mockExecute = createMockExecute({
        'movieTextElements.textDetails': [
          { text: 'Valid text 1', style: '001' }, // Valid
          { text: '', style: '002' }, // Invalid - empty text
          { text: 'Valid text 2', style: '003' }, // Valid
          { style: '004' }, // Invalid - missing text
          { text: 'Valid text 3', style: '005' }, // Valid
        ]
      });

      expect(() => {
        buildCreateMovieRequestBody.call(mockExecute, 0);
      }).toThrow(/Movie text element validation errors:/);
      
      try {
        buildCreateMovieRequestBody.call(mockExecute, 0);
      } catch (error: any) {
        expect(error.message).toContain('Movie text element 2:');
        expect(error.message).toContain('Movie text element 4:');
      }
    });
  });

  describe('Movie Elements Collection Processing', () => {

    test('should validate position in movieElements text processing', () => {
      // Mock processElement to return expected format
      (processElement as jest.MockedFunction<typeof processElement>)
        .mockImplementation((element) => ({
          type: element.type,
          src: element.src,
          processed: true
        }));

      const validPositions = ['top-left', 'top-right', 'bottom-right', 'bottom-left', 'center-center', 'custom'];
      
      validPositions.forEach(position => {
        const mockExecute = createMockExecute({
          'movieElements.elementValues': [
            {
              type: 'text',
              text: 'Test text',
              style: '001',
              position: position
            }
          ]
        });

        const result = buildCreateMovieRequestBody.call(mockExecute, 0);
        
        expect(result).toHaveProperty('elements');
        expect(result.elements).toHaveLength(1);
        const textElement = result.elements![0] as any;
        expect(textElement).toHaveProperty('position', position);
      });
    });

    test('should ignore invalid positions in movieElements text processing', () => {
      // Mock processElement to return expected format
      (processElement as jest.MockedFunction<typeof processElement>)
        .mockImplementation((element) => ({
          type: element.type,
          src: element.src,
          processed: true
        }));

      const mockExecute = createMockExecute({
        'movieElements.elementValues': [
          {
            type: 'text',
            text: 'Test text',
            style: '001',
            position: 'invalid-position'
          }
        ]
      });

      const result = buildCreateMovieRequestBody.call(mockExecute, 0);
      
      expect(result).toHaveProperty('elements');
      expect(result.elements).toHaveLength(1);
      const textElement = result.elements![0] as any;
      expect(textElement).not.toHaveProperty('position', 'invalid-position');
    });

    test('should handle non-string position in movieElements text processing', () => {
      // Mock processElement to return expected format
      (processElement as jest.MockedFunction<typeof processElement>)
        .mockImplementation((element) => ({
          type: element.type,
          src: element.src,
          processed: true
        }));

      const mockExecute = createMockExecute({
        'movieElements.elementValues': [
          {
            type: 'text',
            text: 'Test text',
            style: '001',
            position: 123
          }
        ]
      });

      const result = buildCreateMovieRequestBody.call(mockExecute, 0);
      
      expect(result).toHaveProperty('elements');
      expect(result.elements).toHaveLength(1);
      const textElement = result.elements![0] as any;
      expect(textElement.position).toBeUndefined();
    });

    test('should handle text elements with all properties in movieElements', () => {
      // Mock processElement to avoid interference
      (processElement as jest.MockedFunction<typeof processElement>)
        .mockImplementation((element) => ({
          type: element.type,
          src: element.src,
          processed: true
        }));

      const mockExecute = createMockExecute({
        'movieElements.elementValues': [
          {
            type: 'text',
            text: 'Full properties text',
            start: 2,
            duration: 10,
            'font-family': 'Arial',
            'font-size': '24px',
            color: '#FF0000'
          }
        ]
      });

      const result = buildCreateMovieRequestBody.call(mockExecute, 0);

      expect(result).toHaveProperty('elements');
      expect(result.elements).toHaveLength(1);
      const textElement = result.elements![0] as any;
      expect(textElement).toHaveProperty('text', 'Full properties text');
      expect(textElement).toHaveProperty('start', 2);
      expect(textElement).toHaveProperty('duration', 10);
      expect(textElement.settings).toHaveProperty('font-family', 'Arial');
      expect(textElement.settings).toHaveProperty('font-size', '24px');
      expect(textElement.settings).toHaveProperty('font-color', '#FF0000');
    });

    test('should handle text elements with missing optional properties', () => {
      // Mock processElement to avoid interference
      (processElement as jest.MockedFunction<typeof processElement>)
        .mockImplementation((element) => ({
          type: element.type,
          src: element.src,
          processed: true
        }));

      const mockExecute = createMockExecute({
        'movieElements.elementValues': [
          {
            type: 'text',
            text: 'Minimal text',
          }
        ]
      });

      const result = buildCreateMovieRequestBody.call(mockExecute, 0);

      expect(result).toHaveProperty('elements');
      expect(result.elements).toHaveLength(1);
      const textElement = result.elements![0] as any;
      expect(textElement).toHaveProperty('text', 'Minimal text');
      expect(textElement).not.toHaveProperty('start');
      expect(textElement).not.toHaveProperty('duration');
      expect(textElement.settings).toBeUndefined();
    });

    test('should handle text elements with undefined values', () => {
      // Mock processElement to avoid interference
      (processElement as jest.MockedFunction<typeof processElement>)
        .mockImplementation((element) => ({
          type: element.type,
          src: element.src,
          processed: true
        }));

      const mockExecute = createMockExecute({
        'movieElements.elementValues': [
          {
            type: 'text',
            text: 'Text with undefined values',
            start: undefined,
            duration: undefined,
            'font-family': undefined,
            'font-size': undefined,
            color: undefined
          }
        ]
      });

      const result = buildCreateMovieRequestBody.call(mockExecute, 0);

      expect(result).toHaveProperty('elements');
      expect(result.elements).toHaveLength(1);
      const textElement = result.elements![0] as any;
      expect(textElement).toHaveProperty('text', 'Text with undefined values');
      expect(textElement).not.toHaveProperty('start');
      expect(textElement).not.toHaveProperty('duration');
      expect(textElement.settings).toBeUndefined();
    });

    test('should use default text when text is missing', () => {
      // Mock processElement to avoid interference
      (processElement as jest.MockedFunction<typeof processElement>)
        .mockImplementation((element) => ({
          type: element.type,
          src: element.src,
          processed: true
        }));

      const mockExecute = createMockExecute({
        'movieElements.elementValues': [
          {
            type: 'text',
            start: 0,
            duration: 5
          }
        ]
      });

      const result = buildCreateMovieRequestBody.call(mockExecute, 0);

      expect(result).toHaveProperty('elements');
      expect(result.elements).toHaveLength(1);
      const textElement = result.elements![0] as any;
      expect(textElement).toHaveProperty('text', 'Default Text');
    });

    test('should process subtitle elements in movieElements', () => {
      // Mock processElement to avoid interference
      (processElement as jest.MockedFunction<typeof processElement>)
        .mockImplementation((element) => ({
          type: element.type,
          src: element.src,
          processed: true
        }));

      const mockExecute = createMockExecute({
        'movieElements.elementValues': [
          {
            type: 'subtitles',
            text: 'Movie subtitle',
            language: 'en',
            start: 0,
            duration: 10
          }
        ]
      });

      const result = buildCreateMovieRequestBody.call(mockExecute, 0);

      expect(result).toHaveProperty('elements');
      expect(result.elements).toHaveLength(1);
      const subtitleElement = result.elements![0] as any;
      expect(subtitleElement).toHaveProperty('type', 'subtitles');
      expect(subtitleElement).toHaveProperty('text', 'Movie subtitle');
    });

    test('should process subtitle elements with start and duration spread', () => {
      // Mock processElement to avoid interference
      (processElement as jest.MockedFunction<typeof processElement>)
        .mockImplementation((element) => ({
          type: element.type,
          src: element.src,
          processed: true
        }));

      const mockExecute = createMockExecute({
        'movieElements.elementValues': [
          {
            type: 'subtitles',
            text: 'Subtitle with timing',
            language: 'en',
            start: 2.5,
            duration: 8.5
          }
        ]
      });

      const result = buildCreateMovieRequestBody.call(mockExecute, 0);

      expect(result).toHaveProperty('elements');
      expect(result.elements).toHaveLength(1);
      const subtitleElement = result.elements![0] as any;
      expect(subtitleElement).toHaveProperty('start', 2.5);
      expect(subtitleElement).toHaveProperty('duration', 8.5);
    });

    test('should handle else branch for non-text/subtitle elements', () => {
      // Mock processElement to return expected format
      (processElement as jest.MockedFunction<typeof processElement>)
        .mockImplementation((element) => ({
          type: element.type,
          src: element.src,
          processed: true
        }));

      const mockExecute = createMockExecute({
        'movieElements.elementValues': [
          {
            type: 'image',
            src: 'https://example.com/image.jpg',
            duration: 5
          },
          {
            type: 'video',
            src: 'https://example.com/video.mp4',
            duration: 10
          }
        ]
      });

      const result = buildCreateMovieRequestBody.call(mockExecute, 0);

      expect(result).toHaveProperty('elements');
      expect(result.elements).toHaveLength(2);
      expect(processElement).toHaveBeenCalledTimes(2);
      expect(result.elements![0]).toHaveProperty('type', 'image');
      expect(result.elements![1]).toHaveProperty('type', 'video');
    });

    test('should handle processing errors with console.warn', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

      // Mock processElement to throw an error for certain elements
      (processElement as jest.MockedFunction<typeof processElement>)
        .mockImplementation((element) => {
          if (element.src === 'error-element.jpg') {
            throw new Error('Mock processing error');
          }
          return {
            type: element.type,
            src: element.src,
            processed: true
          };
        });

      const mockExecute = createMockExecute({
        'movieElements.elementValues': [
          { type: 'image', src: 'good-element.jpg' },
          { type: 'image', src: 'error-element.jpg' }, // This will throw error
          { type: 'image', src: 'another-good-element.jpg' }
        ]
      });

      const result = buildCreateMovieRequestBody.call(mockExecute, 0);

      // Should have called console.warn with the error
      expect(consoleSpy).toHaveBeenCalledWith('Failed to process movie element:', expect.any(Error));
      
      // Should still have processed the good elements
      expect(result).toHaveProperty('elements');
      expect(result.elements?.length).toBeGreaterThan(0);

      consoleSpy.mockRestore();
    });

    test('should handle subtitle elements with missing required properties for validation coverage', () => {
      const mockExecute = createMockExecute({
        'movieElements.elementValues': [
          {
            type: 'subtitles',
            // Missing text, src, and captions - should fail validation but test the case where
            // text exists but is empty string
            text: '',
            start: 0,
            duration: 10
          }
        ]
      });

      expect(() => {
        buildCreateMovieRequestBody.call(mockExecute, 0);
      }).toThrow('Movie element validation errors');
    });

    test('should cover both branches of error handling in movieElements processing', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

      // Mock processElement to throw different types of errors to cover all branches
      (processElement as jest.MockedFunction<typeof processElement>)
        .mockImplementation((element) => {
          // Throw error for any element to hit the catch block
          throw new Error(`Processing failed for ${element.type}`);
        });

      const mockExecute = createMockExecute({
        'movieElements.elementValues': [
          { type: 'image', src: 'test.jpg' }
        ]
      });

      // This should not throw, but should log the error and continue
      const result = buildCreateMovieRequestBody.call(mockExecute, 0);

      // Verify the catch block was hit and console.warn was called
      expect(consoleSpy).toHaveBeenCalledWith('Failed to process movie element:', expect.any(Error));
      
      // Should still return a valid result (error was caught and logged)
      expect(result).toHaveProperty('scenes');
      expect(result.scenes).toHaveLength(1);

      consoleSpy.mockRestore();
    });
  });

  describe('Movie Elements Validation', () => {

    test('should validate movie-level elements and throw on validation errors', () => {
      const mockExecute = createMockExecute({
        'movieElements.elementValues': [
          {
            type: 'subtitles',
            // Missing required captions/text/src - should fail validation
          }
        ]
      });

      expect(() => {
        buildCreateMovieRequestBody.call(mockExecute, 0);
      }).toThrow('Movie element validation errors');
    });

    test('should pass validation for valid movie elements', () => {
      const mockExecute = createMockExecute({
        'movieElements.elementValues': [
          {
            type: 'subtitles',
            text: 'Valid subtitle',
            language: 'en'
          }
        ]
      });

      expect(() => {
        buildCreateMovieRequestBody.call(mockExecute, 0);
      }).not.toThrow();
    });
  });

  describe('Movie Elements Integration', () => {

    test('should combine movie text elements and movie elements collection', () => {
      const mockExecute = createMockExecute({
        'movieTextElements.textDetails': [
          {
            text: 'Movie text element',
            style: '001',
            fontFamily: 'Arial'
          }
        ],
        'movieElements.elementValues': [
          {
            type: 'subtitles',
            text: 'Movie subtitle element',
            language: 'en'
          }
        ]
      });

      const result = buildCreateMovieRequestBody.call(mockExecute, 0);

      expect(result.elements).toHaveLength(2);
      
      const textElement = result.elements!.find((el: any) => el.type === 'text');
      const subtitleElement = result.elements!.find((el: any) => el.type === 'subtitles');
      
      expect(textElement).toBeDefined();
      expect((textElement as any).text).toBe('Movie text element');
      
      expect(subtitleElement).toBeDefined();
      expect((subtitleElement as any).text).toBe('Movie subtitle element');
    });

    test('should handle empty movie elements collections', () => {
      const mockExecute = createMockExecute({
        'movieTextElements.textDetails': [],
        'movieElements.elementValues': []
      });

      const result = buildCreateMovieRequestBody.call(mockExecute, 0);

      expect(result).not.toHaveProperty('elements');
    });

    test('should only set elements property when movie elements exist', () => {
      const mockExecute = createMockExecute({
        'movieTextElements.textDetails': [
          {
            text: 'Single movie text',
            style: '001'
          }
        ]
      });

      const result = buildCreateMovieRequestBody.call(mockExecute, 0);

      expect(result).toHaveProperty('elements');
      expect(result.elements).toHaveLength(1);
    });
  });
});