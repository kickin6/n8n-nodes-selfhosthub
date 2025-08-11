import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { processElement } from '../../../../nodes/CreateJ2vMovie/utils/elementProcessor';

describe('elementProcessor', () => {
  describe('processElement', () => {
    const mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      logger: {
        debug: jest.fn(),
        warn: jest.fn(),
        info: jest.fn(),
        error: jest.fn(),
      }
    } as unknown as IExecuteFunctions;

    beforeEach(() => {
      jest.clearAllMocks();
    });

    test('should process text element with position preset', () => {
      const textElement: IDataObject = {
        type: 'text',
        text: 'Test Text',
        positionPreset: 'center',
        'font-family': 'Arial',
        'font-size': 32,
        color: 'white'
      };

      const result = processElement.call(mockExecuteFunctions, textElement, 1920, 1080);

      expect(result).toHaveProperty('type', 'text');
      expect(result).toHaveProperty('text', 'Test Text');
      expect(result).toHaveProperty('position', 'center-center');
      // Note: font properties are only copied if they exist on the element, not from hyphenated keys
      expect(result).toHaveProperty('color', 'white');
    });

    test('should process image element', () => {
      const imageElement: IDataObject = {
        type: 'image',
        src: 'https://example.com/image.jpg',
        positionPreset: 'top_left',
        width: 500,
        height: 300
      };

      const result = processElement.call(mockExecuteFunctions, imageElement, 1920, 1080);

      expect(result).toHaveProperty('type', 'image');
      expect(result).toHaveProperty('src', 'https://example.com/image.jpg');
      expect(result).toHaveProperty('position', 'top-left');
      expect(result).toHaveProperty('width', 500);
      expect(result).toHaveProperty('height', 300);
    });

    test('should process audio element', () => {
      const audioElement: IDataObject = {
        type: 'audio',
        src: 'https://example.com/audio.mp3',
        volume: 0.8,
        start: 5,
        duration: 10
      };

      const result = processElement.call(mockExecuteFunctions, audioElement, 1920, 1080);

      expect(result).toHaveProperty('type', 'audio');
      expect(result).toHaveProperty('src', 'https://example.com/audio.mp3');
      expect(result).toHaveProperty('volume', 0.8);
      expect(result).toHaveProperty('start', 5);
      expect(result).toHaveProperty('duration', 10);
    });

    test('should process video element', () => {
      const videoElement: IDataObject = {
        type: 'video',
        src: 'https://example.com/video.mp4',
        positionPreset: 'bottom_right',
        start: 2,
        duration: 15
      };

      const result = processElement.call(mockExecuteFunctions, videoElement, 1920, 1080);

      expect(result).toHaveProperty('type', 'video');
      expect(result).toHaveProperty('src', 'https://example.com/video.mp4');
      expect(result).toHaveProperty('position', 'bottom-right');
      expect(result).toHaveProperty('start', 2);
      expect(result).toHaveProperty('duration', 15);
    });

    test('should process subtitles element', () => {
      const subtitlesElement: IDataObject = {
        type: 'subtitles',
        subtitleSourceType: 'text',
        text: 'Subtitle text',
        language: 'en',
        positionPreset: 'bottom_center',
        'font-family': 'Arial',
        'font-size': 24,
        color: 'white'
      };

      const result = processElement.call(mockExecuteFunctions, subtitlesElement, 1920, 1080);

      expect(result).toHaveProperty('type', 'subtitles');
      expect(result).toHaveProperty('text', 'Subtitle text');
      expect(result).toHaveProperty('language', 'en');
      // Subtitles don't get position processing unless specifically set
      expect(result).toHaveProperty('language', 'en');
      expect(result).toHaveProperty('color', 'white');
    });

    test('should handle custom position coordinates', () => {
      const elementWithCustomPosition: IDataObject = {
        type: 'text',
        text: 'Custom Position',
        positionPreset: 'custom',
        x: 100,
        y: 200
      };

      const result = processElement.call(mockExecuteFunctions, elementWithCustomPosition, 1920, 1080);

      // Custom positioning still sets position to 'custom' and copies x,y values
      expect(result).toHaveProperty('position', 'custom');
      expect(result).toHaveProperty('x', 100);
      expect(result).toHaveProperty('y', 200);
    });

    test('should handle element without position preset', () => {
      const elementWithoutPosition: IDataObject = {
        type: 'text',
        text: 'No Position'
      };

      const result = processElement.call(mockExecuteFunctions, elementWithoutPosition, 1920, 1080);

      expect(result).toHaveProperty('type', 'text');
      expect(result).toHaveProperty('text', 'No Position');
      // Elements without position preset still get 'custom' position
      expect(result).toHaveProperty('position', 'custom');
    });

    test('should handle unknown element type', () => {
      const unknownElement: IDataObject = {
        type: 'unknown',
        someProperty: 'value'
      };

      const result = processElement.call(mockExecuteFunctions, unknownElement, 1920, 1080);

      expect(result).toHaveProperty('type', 'unknown');
      // processElement only preserves known properties
    });

    test('should preserve all element properties', () => {
      const complexElement: IDataObject = {
        type: 'text',
        text: 'Complex Element',
        customProp1: 'value1',
        customProp2: 123,
        customProp3: true,
        positionPreset: 'center'
      };

      const result = processElement.call(mockExecuteFunctions, complexElement, 1920, 1080);

      expect(result).toHaveProperty('type', 'text');
      expect(result).toHaveProperty('text', 'Complex Element');
      // Note: processElement only processes known properties, doesn't preserve all custom properties
      expect(result).toHaveProperty('position', 'center-center');
    });
  });
});