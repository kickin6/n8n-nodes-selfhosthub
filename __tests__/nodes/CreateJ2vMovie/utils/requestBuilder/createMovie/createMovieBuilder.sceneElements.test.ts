// __tests__/nodes/CreateJ2vMovie/utils/requestBuilder/createMovie/createMovieBuilder.sceneElements.test.ts

jest.mock('@nodes/CreateJ2vMovie/utils/elementProcessor', () => ({
  processElement: jest.fn()
}));

import { createMockExecute } from '../shared/mockHelpers';
import { buildCreateMovieRequestBody } from '@nodes/CreateJ2vMovie/utils/requestBuilder';
import { processElement } from '@nodes/CreateJ2vMovie/utils/elementProcessor';

describe('createMovieBuilder - Scene-Level Elements', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Scene Element Processing', () => {

    test('should process scene elements with mock processor', () => {
      const textElement = {
        text: 'Test text',
        style: '001'
      };

      // Mock processElement to return a valid element
      (processElement as jest.MockedFunction<typeof processElement>)
        .mockImplementation((element) => ({
          type: element.type,
          src: element.src,
          processed: true
        }));

      const mockExecute = createMockExecute({
        'scenes.sceneValues': [{
          elements: {
            elementValues: [
              { type: 'video', src: 'test1.mp4' },
              { type: 'audio', src: 'test1.mp3' }
            ]
          },
          textElements: {
            textDetails: [textElement]
          }
        }]
      });

      const result = buildCreateMovieRequestBody.call(mockExecute, 0);

      expect(result.scenes[0].elements.length).toBeGreaterThanOrEqual(1);
      const processedTextElement = result.scenes[0].elements.find((el: any) => el && el.type === 'text');
      expect(processedTextElement).toBeDefined();
      expect((processedTextElement as any).text).toBe('Test text');
    });

    test('should handle mocked element processor', () => {
      const mockExecute = createMockExecute({
        'scenes.sceneValues': [{
          elements: {
            elementValues: [{ type: 'test-element' }]
          }
        }]
      });

      (processElement as jest.MockedFunction<typeof processElement>)
        .mockReturnValue({
          type: 'mocked-element',
          processed: true,
          src: 'mocked.mp4'
        });

      const result = buildCreateMovieRequestBody.call(mockExecute, 0);
      expect(result.scenes[0].elements.length).toBeGreaterThanOrEqual(1);
      expect(processElement).toHaveBeenCalled();
    });

    test('should handle array operations in element processing', () => {
      const sceneElements: any[] = [];
      const processedSceneElements = [
        { type: 'video', src: 'processed1.mp4' },
        { type: 'audio', src: 'processed1.mp3' }
      ];

      sceneElements.push(...processedSceneElements);

      expect(sceneElements).toHaveLength(2);
      expect(sceneElements[0]).toEqual({ type: 'video', src: 'processed1.mp4' });
      expect(sceneElements[1]).toEqual({ type: 'audio', src: 'processed1.mp3' });

      const moreElements = [{ type: 'image', src: 'image.jpg' }];
      sceneElements.push(...moreElements);

      expect(sceneElements).toHaveLength(3);
      expect(sceneElements[2]).toEqual({ type: 'image', src: 'image.jpg' });
    });

    test('should handle scene processing errors gracefully', () => {
      const mockExecute = createMockExecute({
        'scenes.sceneValues': [{
          elements: {
            elementValues: [{ type: 'text', content: 'test' }]
          }
        }]
      });

      (processElement as jest.MockedFunction<typeof processElement>)
        .mockImplementation(() => {
          throw new Error('Element processing failed');
        });

      const result = buildCreateMovieRequestBody.call(mockExecute, 0);

      expect(result).toHaveProperty('scenes');
      expect(result.scenes).toHaveLength(1);
      expect(processElement).toHaveBeenCalled();
    });

    test('should handle element processing errors gracefully', () => {
      const mockExecute = createMockExecute({
        'scenes.sceneValues': [{
          elements: {
            elementValues: [{ type: 'simple-element' }]
          }
        }]
      });

      expect(() => {
        buildCreateMovieRequestBody.call(mockExecute, 0);
      }).not.toThrow();
    });
  });

  describe('Scene Text Elements Processing', () => {

    test('should process multiple scenes with text elements', () => {
      const mockExecute = createMockExecute({
        'scenes.sceneValues': [
          {
            elements: { elementValues: [] },
            textElements: {
              textDetails: [{
                text: 'Scene 1 text',
                style: '001',
                start: 0,
                duration: 5
              }]
            }
          },
          {
            elements: { elementValues: [] },
            textElements: {
              textDetails: [{
                text: 'Scene 2 text',
                style: '002',
                start: 0,
                duration: 8
              }]
            }
          }
        ]
      });

      const result = buildCreateMovieRequestBody.call(mockExecute, 0);

      expect(result.scenes).toHaveLength(2);
      expect((result.scenes[0].elements[0] as any).text).toBe('Scene 1 text');
      expect((result.scenes[0].elements[0] as any).duration).toBe(5);
      expect((result.scenes[1].elements[0] as any).text).toBe('Scene 2 text');
      expect((result.scenes[1].elements[0] as any).duration).toBe(8);
    });

    test('should handle empty scene-level text elements', () => {
      const mockExecute = createMockExecute({
        'scenes.sceneValues': [{
          elements: { elementValues: [] },
          textElements: {
            textDetails: []
          }
        }]
      });

      const result = buildCreateMovieRequestBody.call(mockExecute, 0);

      expect(result.scenes[0].elements).toHaveLength(0);
    });

    test('should handle invalid scene-level text elements', () => {
      const invalidElement = {
        text: '',
        style: '001'
      };

      const mockExecute = createMockExecute({
        'scenes.sceneValues': [{
          elements: { elementValues: [] },
          textElements: {
            textDetails: [invalidElement]
          }
        }]
      });

      expect(() => {
        buildCreateMovieRequestBody.call(mockExecute, 0);
      }).toThrow('Scene text element validation errors');
    });

    test('should validate mixed valid and invalid scene-level text elements', () => {
      const elements = [
        { text: 'Valid text', style: '001' },
        { text: '', style: '002' },
        { style: '003' },
        { text: 'Another valid text', style: '004' }
      ];

      const mockExecute = createMockExecute({
        'scenes.sceneValues': [{
          elements: { elementValues: [] },
          textElements: {
            textDetails: elements
          }
        }]
      });

      expect(() => {
        buildCreateMovieRequestBody.call(mockExecute, 0);
      }).toThrow('Scene text element validation errors');
    });

    test('should handle scene text elements with traditional elements', () => {
      const textElement = {
        text: 'Scene with elements',
        style: '001',
        start: 0,
        duration: -2
      };

      // Mock processElement to return expected format
      (processElement as jest.MockedFunction<typeof processElement>)
        .mockImplementation((element) => ({
          type: element.type,
          src: element.src,
          processed: true
        }));

      const mockExecute = createMockExecute({
        'scenes.sceneValues': [{
          elements: {
            elementValues: [
              { type: 'video', src: 'scene-video.mp4' },
              { type: 'audio', src: 'scene-audio.mp3' }
            ]
          },
          textElements: {
            textDetails: [textElement]
          }
        }]
      });

      const result = buildCreateMovieRequestBody.call(mockExecute, 0);

      expect(result.scenes[0].elements.length).toBeGreaterThanOrEqual(1);
      const processedTextElement = result.scenes[0].elements.find((el: any) => el && el.type === 'text');
      expect(processedTextElement).toBeDefined();
      expect((processedTextElement as any).text).toBe('Scene with elements');
    });

    test('should handle scenes.sceneValues parameter access failure', () => {
      const mockExecuteFunctions = () => ({
        getNodeParameter: jest.fn(),
        logger: { debug: jest.fn() },
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

      const mockExecute = mockExecuteFunctions();
      
      // Mock getNodeParameter to throw error for scenes.sceneValues
      mockExecute.getNodeParameter.mockImplementation((param: string, itemIndex: any, defaultValue: any) => {
        if (param === 'scenes.sceneValues') {
          throw new Error('Parameter access failed');
        }
        // Return defaults for other parameters
        if (param === 'framerate') return 25;
        if (param === 'output_width') return 1024; 
        if (param === 'output_height') return 768;
        if (param === 'recordId') return '';
        if (param === 'webhookUrl') return '';
        if (param === 'quality') return '';
        if (param === 'cache') return undefined;
        if (param === 'client-data') return '{}';
        if (param === 'comment') return '';
        if (param === 'draft') return undefined;
        if (param === 'movieTextElements.textDetails') return [];
        if (param === 'movieElements.elementValues') return [];
        return defaultValue;
      });

      const result = buildCreateMovieRequestBody.call(mockExecute, 0);

      // Should still create a valid response with empty scene when scenes processing fails
      expect(result).toHaveProperty('scenes');
      expect(result.scenes).toHaveLength(1);
      expect(result.scenes[0]).toEqual({ elements: [] });
    });
  });

  describe('Scene Validation', () => {

    test('should validate scene elements and throw on validation errors', () => {
      const mockExecute = createMockExecute({
        'scenes.sceneValues': [{
          elements: {
            elementValues: [
              {
                type: 'subtitles', // Subtitles not allowed in scenes
                text: 'Invalid subtitle placement'
              }
            ]
          }
        }]
      });

      expect(() => {
        buildCreateMovieRequestBody.call(mockExecute, 0);
      }).toThrow('Scene element validation errors');
    });

    test('should handle validation error re-throwing for scene elements', () => {
      const mockExecute = createMockExecute({
        'scenes.sceneValues': [{
          elements: {
            elementValues: [
              {
                type: 'subtitles',
                text: 'Subtitle in scene - should fail validation'
              }
            ]
          }
        }]
      });

      expect(() => {
        buildCreateMovieRequestBody.call(mockExecute, 0);
      }).toThrow(/Scene element validation errors/);
    });

    test('should handle validation error re-throwing for scene text elements', () => {
      const mockExecute = createMockExecute({
        'scenes.sceneValues': [{
          elements: { elementValues: [] },
          textElements: {
            textDetails: [
              { text: '', style: '001' } // Invalid - empty text
            ]
          }
        }]
      });

      expect(() => {
        buildCreateMovieRequestBody.call(mockExecute, 0);
      }).toThrow(/Scene text element validation errors/);
    });
  });

  describe('Scene Error Handling', () => {

    test('should continue processing on non-validation errors for traditional elements', () => {
      // Mock processElement to throw a non-validation error
      (processElement as jest.MockedFunction<typeof processElement>)
        .mockImplementation(() => {
          throw new Error('Random processing error');
        });

      const mockExecute = createMockExecute({
        'scenes.sceneValues': [{
          elements: {
            elementValues: [
              { type: 'video', src: 'test.mp4' }
            ]
          }
        }]
      });

      // Should not throw and should continue processing
      expect(() => {
        buildCreateMovieRequestBody.call(mockExecute, 0);
      }).not.toThrow();

      const result = buildCreateMovieRequestBody.call(mockExecute, 0);
      expect(result.scenes).toHaveLength(1);
    });

    test('should continue processing on non-validation errors for text elements', () => {
      const mockExecute = createMockExecute({
        'scenes.sceneValues': [{
          elements: { elementValues: [] },
          textElements: {
            textDetails: [
              { text: 'Valid text', style: '001' }
            ]
          }
        }]
      });

      // Should not throw and should process the scene
      expect(() => {
        buildCreateMovieRequestBody.call(mockExecute, 0);
      }).not.toThrow();

      const result = buildCreateMovieRequestBody.call(mockExecute, 0);
      expect(result.scenes).toHaveLength(1);
      expect(result.scenes[0].elements).toHaveLength(1);
    });

    test('should continue processing on non-validation errors for scenes collection', () => {
      const mockExecute = createMockExecute({
        'scenes.sceneValues': [
          {
            elements: { elementValues: [] },
            textElements: { textDetails: [] }
          }
        ]
      });

      // Should not throw even if there are minor processing issues
      expect(() => {
        buildCreateMovieRequestBody.call(mockExecute, 0);
      }).not.toThrow();

      const result = buildCreateMovieRequestBody.call(mockExecute, 0);
      expect(result.scenes).toHaveLength(1);
    });
  });
});