jest.mock('@nodes/CreateJ2vMovie/utils/elementProcessor', () => ({
  processElement: jest.fn()
}));

import { validateElement, validateElements, getValidationSummary } from './shared/elementValidators';
import { getElementFixture } from './shared/elementTestHelpers';
import { createMockExecute } from './shared/mockHelpers';
import { buildCreateMovieRequestBody } from '@nodes/CreateJ2vMovie/utils/requestBuilder';
import { processElement } from '@nodes/CreateJ2vMovie/utils/elementProcessor';

const createMockExecuteFunctions = () => ({
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

describe('requestBuilder - createMovie Operation', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Configuration', () => {

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

    test('should handle invalid client-data JSON', () => {
      const mockExecute = createMockExecute({
        'client-data': '{invalid json}'
      });

      const result = buildCreateMovieRequestBody.call(mockExecute, 0);

      expect(result).not.toHaveProperty('client-data');
    });

    test('should handle parameter access errors', () => {
      const mockExecute = createMockExecuteFunctions();
      mockExecute.getNodeParameter.mockImplementation((param: string, itemIndex: any, defaultValue: any) => {
        if (param === 'scenes.sceneValues') throw new Error('Scenes access failed');
        return createMockExecute().getNodeParameter(param, itemIndex, defaultValue);
      });

      const result = buildCreateMovieRequestBody.call(mockExecute, 0);

      expect(result).not.toHaveProperty('cache');
      expect(result).not.toHaveProperty('draft');
    });

    test('should handle scene with duration and background color', () => {
      const mockExecute = createMockExecute({
        'scenes.sceneValues': [{
          duration: 10,
          'background-color': '#FF0000',
          comment: 'Test scene',
          elements: { elementValues: [] }
        }]
      });

      const result = buildCreateMovieRequestBody.call(mockExecute, 0);

      expect(result.scenes[0]).toHaveProperty('duration', 10);
      expect(result.scenes[0]).toHaveProperty('background-color', '#FF0000');
      expect(result.scenes[0]).toHaveProperty('comment', 'Test scene');
    });

    test('should handle scene transitions', () => {
      const mockExecute = createMockExecute({
        'scenes.sceneValues': [
          { elements: { elementValues: [] } },
          {
            transition_style: 'fade',
            transition_duration: 2,
            elements: { elementValues: [] }
          }
        ]
      });

      const result = buildCreateMovieRequestBody.call(mockExecute, 0);

      expect(result.scenes[0]).not.toHaveProperty('transition');
      expect(result.scenes[1]).toHaveProperty('transition');
      expect(result.scenes[1].transition!.style).toBe('fade');
      expect(result.scenes[1].transition!.duration).toBe(2);
    });

    test('should filter invalid scene durations', () => {
      const scenarios = [
        { duration: -1, expectProperty: false, description: 'negative duration' },
        { duration: 'invalid', expectProperty: false, description: 'invalid string duration' },
        { duration: 0, expectProperty: false, description: 'zero duration' }
      ];

      scenarios.forEach(scenario => {
        const mockExecute = createMockExecute({
          'scenes.sceneValues': [{
            duration: scenario.duration,
            elements: { elementValues: [] }
          }]
        });

        const result = buildCreateMovieRequestBody.call(mockExecute, 0);

        if (scenario.expectProperty) {
          expect(result.scenes[0]).toHaveProperty('duration');
        } else {
          expect(result.scenes[0]).not.toHaveProperty('duration');
        }
      });
    });

    test('should filter invalid transition durations', () => {
      const scenarios = [
        { duration: 0, expectProperty: false },
        { duration: 'invalid', expectProperty: false }
      ];

      scenarios.forEach(scenario => {
        const mockExecute = createMockExecute({
          'scenes.sceneValues': [
            { elements: { elementValues: [] } },
            {
              transition_style: 'fade',
              transition_duration: scenario.duration,
              elements: { elementValues: [] }
            }
          ]
        });

        const result = buildCreateMovieRequestBody.call(mockExecute, 0);

        expect(result.scenes[1].transition!.style).toBe('fade');
        if (scenario.expectProperty) {
          expect(result.scenes[1].transition).toHaveProperty('duration');
        } else {
          expect(result.scenes[1].transition).not.toHaveProperty('duration');
        }
      });
    });

    test('should filter default background colors and empty comments', () => {
      const scenarios = [
        { 'background-color': '#000000', expectProperty: false },
        { comment: '', expectProperty: false },
        { comment: '   ', expectProperty: false }
      ];

      scenarios.forEach(scenario => {
        const mockExecute = createMockExecute({
          'scenes.sceneValues': [{ ...scenario, elements: { elementValues: [] } }]
        });

        const result = buildCreateMovieRequestBody.call(mockExecute, 0);
        const property = Object.keys(scenario)[0];

        expect(result.scenes[0]).not.toHaveProperty(property);
      });
    });

    test('should trim and preserve valid comments', () => {
      const mockExecute = createMockExecute({
        comment: '  test comment  '
      });

      const result = buildCreateMovieRequestBody.call(mockExecute, 0);

      expect(result).toHaveProperty('comment', 'test comment');
    });

    test('should handle scenes with missing element collections', () => {
      const mockExecute = createMockExecute({
        'scenes.sceneValues': [{}]
      });

      const result = buildCreateMovieRequestBody.call(mockExecute, 0);

      expect(result.scenes).toHaveLength(1);
      expect(result.scenes[0].elements).toHaveLength(0);
    });
  });

  describe('Movie-Level Text Elements', () => {

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

    test('should handle empty movie-level text elements', () => {
      const mockExecute = createMockExecute({
        'movieTextElements.textDetails': []
      });

      const result = buildCreateMovieRequestBody.call(mockExecute, 0);

      expect(result).not.toHaveProperty('elements');
    });

    test('should handle invalid movie-level text elements', () => {
      const invalidElement = {
        text: '',
        style: '001'
      };

      const mockExecute = createMockExecute({
        'movieTextElements.textDetails': [invalidElement]
      });

      expect(() => {
        buildCreateMovieRequestBody.call(mockExecute, 0);
      }).toThrow('Movie text element validation errors');
    });

    test('should validate mixed valid and invalid movie-level text elements', () => {
      const elements = [
        { text: 'Valid text', style: '001' },
        { text: '', style: '002' },
        { style: '003' },
        { text: 'Another valid text', style: '004' }
      ];

      const mockExecute = createMockExecute({
        'movieTextElements.textDetails': elements
      });

      expect(() => {
        buildCreateMovieRequestBody.call(mockExecute, 0);
      }).toThrow('Movie text element validation errors');
    });
  });

  describe('Scene-Level Text Elements', () => {

    test('should process scene-level text elements', () => {
      const textElement = {
        text: 'Scene-level subtitle',
        style: '001',
        fontFamily: 'Roboto',
        fontSize: '32px',
        fontWeight: '600',
        fontColor: '#FFFFFF',
        backgroundColor: '#000000',
        textAlign: 'center',
        verticalPosition: 'center',
        horizontalPosition: 'center',
        position: 'center-center',
        x: 0,
        y: 0,
        start: 0,
        duration: 5,
        fadeIn: 0.3,
        fadeOut: 0.3,
        zIndex: 10
      };

      const mockExecute = createMockExecute({
        'scenes.sceneValues': [{
          elements: { elementValues: [] },
          textElements: {
            textDetails: [textElement]
          }
        }]
      });

      const result = buildCreateMovieRequestBody.call(mockExecute, 0);

      expect(result.scenes[0].elements).toHaveLength(1);
      const processedElement = result.scenes[0].elements[0] as any;

      expect(processedElement.type).toBe('text');
      expect(processedElement.text).toBe('Scene-level subtitle');
      expect(processedElement.style).toBe('001');
      expect(processedElement.position).toBe('center-center');
      expect(processedElement.start).toBe(0);
      expect(processedElement.duration).toBe(5);
      expect(processedElement['fade-in']).toBe(0.3);
      expect(processedElement['fade-out']).toBe(0.3);
      expect(processedElement['z-index']).toBe(10);

      const settings = processedElement.settings as any;
      expect(settings['font-family']).toBe('Roboto');
      expect(settings['font-size']).toBe('32px');
      expect(settings['font-weight']).toBe('600');
      expect(settings['font-color']).toBe('#FFFFFF');
      expect(settings['background-color']).toBe('#000000');
      expect(settings['text-align']).toBe('center');
      expect(settings['vertical-position']).toBe('center');
      expect(settings['horizontal-position']).toBe('center');
    });

    test('should process multiple scene-level text elements', () => {
      const textElements = [
        {
          text: 'First scene text',
          style: '001',
          fontFamily: 'Arial',
          fontSize: '24px',
          start: 0,
          duration: 10
        },
        {
          text: 'Second scene text',
          style: '002',
          fontFamily: 'Roboto',
          fontSize: '28px',
          start: 5,
          duration: 15
        }
      ];

      const mockExecute = createMockExecute({
        'scenes.sceneValues': [{
          elements: { elementValues: [] },
          textElements: {
            textDetails: textElements
          }
        }]
      });

      const result = buildCreateMovieRequestBody.call(mockExecute, 0);

      expect(result.scenes[0].elements).toHaveLength(2);
      const firstElement = result.scenes[0].elements[0] as any;
      const secondElement = result.scenes[0].elements[1] as any;

      expect(firstElement.text).toBe('First scene text');
      expect(firstElement.style).toBe('001');
      expect((firstElement.settings as any)['font-family']).toBe('Arial');

      expect(secondElement.text).toBe('Second scene text');
      expect(secondElement.style).toBe('002');
      expect((secondElement.settings as any)['font-family']).toBe('Roboto');
    });

    test('should handle scene text elements with traditional elements', () => {
      const textElement = {
        text: 'Scene with elements',
        style: '001',
        start: 0,
        duration: -2
      };

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
      const processedTextElement = result.scenes[0].elements.find((el: any) => el.type === 'text');
      expect(processedTextElement).toBeDefined();
      expect((processedTextElement as any).text).toBe('Scene with elements');
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

    test('should process scene elements with mock processor', () => {
      const textElement = {
        text: 'Test text',
        style: '001'
      };

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
      const processedTextElement = result.scenes[0].elements.find((el: any) => el.type === 'text');
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

    test('should handle malformed scene text elements gracefully', () => {
      const mockExecute = createMockExecute({
        'scenes.sceneValues': [{
          elements: { elementValues: [] },
          textElements: 'invalid'
        }]
      });

      const result = buildCreateMovieRequestBody.call(mockExecute, 0);

      expect(result.scenes).toHaveLength(1);
      expect(result.scenes[0].elements).toHaveLength(0);
    });

    test('should handle scenes without text elements property', () => {
      const mockExecute = createMockExecute({
        'scenes.sceneValues': [{
          elements: { elementValues: [] }
        }]
      });

      const result = buildCreateMovieRequestBody.call(mockExecute, 0);

      expect(result.scenes).toHaveLength(1);
      expect(result.scenes[0].elements).toHaveLength(0);
    });
  });

  describe('Mixed Text Elements', () => {

    test('should handle both movie-level and scene-level text elements', () => {
      const movieTextElement = {
        text: 'Movie-wide title',
        style: '001',
        start: 0,
        duration: -2,
        zIndex: 5
      };

      const sceneTextElement = {
        text: 'Scene-specific subtitle',
        style: '002',
        start: 2,
        duration: 8,
        zIndex: 10
      };

      const mockExecute = createMockExecute({
        'movieTextElements.textDetails': [movieTextElement],
        'scenes.sceneValues': [{
          elements: { elementValues: [] },
          textElements: {
            textDetails: [sceneTextElement]
          }
        }]
      });

      const result = buildCreateMovieRequestBody.call(mockExecute, 0);

      expect(result.elements).toHaveLength(1);
      expect((result.elements![0] as any).text).toBe('Movie-wide title');
      expect((result.elements![0] as any)['z-index']).toBe(5);

      expect(result.scenes[0].elements).toHaveLength(1);
      expect((result.scenes[0].elements[0] as any).text).toBe('Scene-specific subtitle');
      expect((result.scenes[0].elements[0] as any)['z-index']).toBe(10);
    });

    test('should handle text elements with different animation styles', () => {
      const textElements = [
        { text: 'Basic style', style: '001' },
        { text: 'Word by word', style: '002' },
        { text: 'Character by character', style: '003' },
        { text: 'Jumping letters', style: '004' }
      ];

      const mockExecute = createMockExecute({
        'movieTextElements.textDetails': textElements
      });

      const result = buildCreateMovieRequestBody.call(mockExecute, 0);

      expect(result.elements).toHaveLength(4);
      expect((result.elements![0] as any).style).toBe('001');
      expect((result.elements![1] as any).style).toBe('002');
      expect((result.elements![2] as any).style).toBe('003');
      expect((result.elements![3] as any).style).toBe('004');
    });

    test('should handle text elements with custom positioning', () => {
      const textElement = {
        text: 'Custom positioned text',
        style: '001',
        position: 'custom',
        x: 100,
        y: 200,
        verticalPosition: 'top',
        horizontalPosition: 'left'
      };

      const mockExecute = createMockExecute({
        'movieTextElements.textDetails': [textElement]
      });

      const result = buildCreateMovieRequestBody.call(mockExecute, 0);

      const processedElement = result.elements![0] as any;
      expect(processedElement.position).toBe('custom');
      expect(processedElement.x).toBe(100);
      expect(processedElement.y).toBe(200);
      expect((processedElement.settings as any)['vertical-position']).toBe('top');
      expect((processedElement.settings as any)['horizontal-position']).toBe('left');
    });

    test('should handle text elements with different durations', () => {
      const textElements = [
        { text: 'Match scene duration', duration: -2 },
        { text: 'Auto duration', duration: -1 },
        { text: 'Fixed duration', duration: 10 }
      ];

      const mockExecute = createMockExecute({
        'movieTextElements.textDetails': textElements
      });

      const result = buildCreateMovieRequestBody.call(mockExecute, 0);

      expect(result.elements).toHaveLength(3);
      expect((result.elements![0] as any).duration).toBe(-2);
      expect((result.elements![1] as any).duration).toBe(-1);
      expect((result.elements![2] as any).duration).toBe(10);
    });

    test('should handle text elements with different fade settings', () => {
      const textElements = [
        {
          text: 'Quick fade',
          fadeIn: 0.1,
          fadeOut: 0.1
        },
        {
          text: 'Slow fade',
          fadeIn: 1.0,
          fadeOut: 1.5
        },
        {
          text: 'No fade',
          fadeIn: 0,
          fadeOut: 0
        }
      ];

      const mockExecute = createMockExecute({
        'movieTextElements.textDetails': textElements
      });

      const result = buildCreateMovieRequestBody.call(mockExecute, 0);

      expect(result.elements).toHaveLength(3);
      expect((result.elements![0] as any)['fade-in']).toBe(0.1);
      expect((result.elements![0] as any)['fade-out']).toBe(0.1);
      expect((result.elements![1] as any)['fade-in']).toBe(1.0);
      expect((result.elements![1] as any)['fade-out']).toBe(1.5);
      expect((result.elements![2] as any)['fade-in']).toBe(0);
      expect((result.elements![2] as any)['fade-out']).toBe(0);
    });

    test('should handle text elements with background colors', () => {
      const textElements = [
        {
          text: 'Solid background',
          style: '001',
          fontFamily: 'Roboto',
          fontSize: '32px',
          fontColor: '#FFFFFF',
          backgroundColor: '#000000',
          textAlign: 'center',
          verticalPosition: 'center',
          horizontalPosition: 'center'
        },
        {
          text: 'Red background',
          style: '001',
          fontFamily: 'Roboto',
          fontSize: '32px',
          fontColor: '#FFFFFF',
          backgroundColor: '#FF0000',
          textAlign: 'center',
          verticalPosition: 'center',
          horizontalPosition: 'center'
        }
      ];

      const mockExecute = createMockExecute({
        'movieTextElements.textDetails': textElements
      });

      const result = buildCreateMovieRequestBody.call(mockExecute, 0);

      expect(result.elements).toHaveLength(2);
      const firstElement = result.elements![0] as any;
      const secondElement = result.elements![1] as any;

      expect((firstElement.settings as any)['background-color']).toBe('#000000');
      expect((secondElement.settings as any)['background-color']).toBe('#FF0000');
    });
  });

  describe('Enhanced Validation', () => {

    test('should validate text elements using shared validators', () => {
      const textElement = getElementFixture('text', 'basic');
      const validationResult = validateElement(textElement);

      expect(validationResult.isValid).toBe(true);
      expect(validationResult.errors).toEqual([]);
      expect(getValidationSummary(validationResult)).toBe('Valid');
    });

    test('should validate complex text elements', () => {
      const textElement = getElementFixture('text', 'complete');
      const validation = validateElement(textElement);
      expect(validation.isValid).toBe(true);

      const mockExecute = createMockExecute({
        'movieTextElements.textDetails': [textElement]
      });

      const result = buildCreateMovieRequestBody.call(mockExecute, 0);

      expect(result.elements).toHaveLength(1);
      const processedElement = result.elements![0] as any;
      expect(processedElement.type).toBe('text');
      expect(processedElement.text).toBe(textElement.text);
    });
  });
});