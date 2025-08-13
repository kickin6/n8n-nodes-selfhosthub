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
        fontFamily: 'Arial',
        fontSize: 32,
        color: 'white',
        start: 0,
        duration: 5
      };

      const result = processElement.call(mockExecuteFunctions, textElement, 1920, 1080);

      expect(result).toHaveProperty('type', 'text');
      expect(result).toHaveProperty('text', 'Test Text');
      expect(result).toHaveProperty('position', 'center-center');
      expect(result).toHaveProperty('font-family', 'Arial');
      expect(result).toHaveProperty('font-size', 32);
      expect(result).toHaveProperty('color', 'white');
      expect(result).toHaveProperty('start', 0);
      expect(result).toHaveProperty('duration', 5);
    });

    test('should process image element with all properties', () => {
      const imageElement: IDataObject = {
        type: 'image',
        src: 'https://example.com/image.jpg',
        positionPreset: 'top_left',
        width: 500,
        height: 300,
        zoom: 1.5,
        start: 2,
        duration: 8
      };

      const result = processElement.call(mockExecuteFunctions, imageElement, 1920, 1080);

      expect(result).toHaveProperty('type', 'image');
      expect(result).toHaveProperty('src', 'https://example.com/image.jpg');
      expect(result).toHaveProperty('position', 'top-left');
      expect(result).toHaveProperty('width', 500);
      expect(result).toHaveProperty('height', 300);
      expect(result).toHaveProperty('zoom', 1.5);
      expect(result).toHaveProperty('start', 2);
      expect(result).toHaveProperty('duration', 8);
    });

    test('should process image element without src', () => {
      const imageElement: IDataObject = {
        type: 'image',
        positionPreset: 'center',
        width: 500,
        height: 300
      };

      const result = processElement.call(mockExecuteFunctions, imageElement, 1920, 1080);

      expect(result).toHaveProperty('type', 'image');
      expect(result).not.toHaveProperty('src');
      expect(result).toHaveProperty('position', 'center-center');
    });

    test('should process image element with zero zoom', () => {
      const imageElement: IDataObject = {
        type: 'image',
        src: 'https://example.com/image.jpg',
        positionPreset: 'center',
        zoom: 0
      };

      const result = processElement.call(mockExecuteFunctions, imageElement, 1920, 1080);

      expect(result).not.toHaveProperty('zoom');
    });

    test('should process image element with positive dimensions', () => {
      const imageElement: IDataObject = {
        type: 'image',
        src: 'https://example.com/image.jpg',
        positionPreset: 'center',
        width: 100,
        height: 200
      };

      const result = processElement.call(mockExecuteFunctions, imageElement, 1920, 1080);

      expect(result).toHaveProperty('type', 'image');
      expect(result).toHaveProperty('width', 100);
      expect(result).toHaveProperty('height', 200);
    });

    test('should process image element with zero and negative dimensions', () => {
      const imageElement: IDataObject = {
        type: 'image',
        src: 'https://example.com/image.jpg',
        positionPreset: 'center',
        width: 0,
        height: -10
      };

      const result = processElement.call(mockExecuteFunctions, imageElement, 1920, 1080);

      expect(result).toHaveProperty('type', 'image');
      expect(result).not.toHaveProperty('width');
      expect(result).not.toHaveProperty('height');
    });

    test('should process video element with positive width and height dimensions', () => {
      const videoElement: IDataObject = {
        type: 'video',
        src: 'https://example.com/video.mp4',
        positionPreset: 'center',
        width: 800,
        height: 600,
        start: 0,
        duration: 10
      };

      const result = processElement.call(mockExecuteFunctions, videoElement, 1920, 1080);

      expect(result).toHaveProperty('type', 'video');
      expect(result).toHaveProperty('src', 'https://example.com/video.mp4');
      expect(result).toHaveProperty('width', 800);
      expect(result).toHaveProperty('height', 600);
      expect(result).toHaveProperty('start', 0);
      expect(result).toHaveProperty('duration', 10);
    });

    test('should process video element with duration -1', () => {
      const videoElement: IDataObject = {
        type: 'video',
        src: 'https://example.com/video.mp4',
        positionPreset: 'center',
        duration: -1,
        volume: 0.8,
        muted: false,
        crop: { x: 0, y: 0, width: 100, height: 100 },
        start: 0
      };

      const result = processElement.call(mockExecuteFunctions, videoElement, 1920, 1080);

      expect(result).toHaveProperty('type', 'video');
      expect(result).toHaveProperty('duration', -1);
      expect(result).toHaveProperty('volume', 0.8);
      expect(result).toHaveProperty('muted', false);
      expect(result).toHaveProperty('crop', { x: 0, y: 0, width: 100, height: 100 });
    });

    test('should process video element with duration -2', () => {
      const videoElement: IDataObject = {
        type: 'video',
        src: 'https://example.com/video.mp4',
        positionPreset: 'center',
        duration: -2,
        start: 0
      };

      const result = processElement.call(mockExecuteFunctions, videoElement, 1920, 1080);

      expect(result).toHaveProperty('type', 'video');
      expect(result).toHaveProperty('duration', -2);
    });

    test('should process video element with invalid duration', () => {
      const videoElement: IDataObject = {
        type: 'video',
        src: 'https://example.com/video.mp4',
        positionPreset: 'center',
        duration: 'invalid',
        start: 0
      };

      const result = processElement.call(mockExecuteFunctions, videoElement, 1920, 1080);

      expect(result).toHaveProperty('type', 'video');
      // Invalid duration string will be converted to NaN, which should not be set
      expect(result.duration).toBe('invalid');
    });

    test('should process video element with zero duration', () => {
      const videoElement: IDataObject = {
        type: 'video',
        src: 'https://example.com/video.mp4',
        positionPreset: 'center',
        duration: 0,
        start: 0
      };

      const result = processElement.call(mockExecuteFunctions, videoElement, 1920, 1080);

      expect(result).toHaveProperty('type', 'video');
      expect(result.duration).toBe(0);
    });

    test('should process video element with negative duration other than -1 or -2', () => {
      const videoElement: IDataObject = {
        type: 'video',
        src: 'https://example.com/video.mp4',
        positionPreset: 'center',
        duration: -5,
        start: 0
      };

      const result = processElement.call(mockExecuteFunctions, videoElement, 1920, 1080);

      expect(result).toHaveProperty('type', 'video');
      expect(result.duration).toBe(-5);
    });

    test('should process text element without text property', () => {
      const textElement: IDataObject = {
        type: 'text',
        positionPreset: 'center',
        fontFamily: 'Arial',
        fontSize: 24,
        color: 'blue'
      };

      const result = processElement.call(mockExecuteFunctions, textElement, 1920, 1080);

      expect(result).toHaveProperty('type', 'text');
      expect(result).not.toHaveProperty('text');
      expect(result).toHaveProperty('font-family', 'Arial');
    });

    test('should process text element with invalid fontFamily', () => {
      const textElement: IDataObject = {
        type: 'text',
        text: 'Test',
        positionPreset: 'center',
        fontFamily: 123,
        fontSize: 24,
        color: 'blue'
      };

      const result = processElement.call(mockExecuteFunctions, textElement, 1920, 1080);

      expect(result).toHaveProperty('type', 'text');
      expect(result).not.toHaveProperty('font-family');
    });

    test('should process text element with invalid color', () => {
      const textElement: IDataObject = {
        type: 'text',
        text: 'Test',
        positionPreset: 'center',
        color: 123
      };

      const result = processElement.call(mockExecuteFunctions, textElement, 1920, 1080);

      expect(result).toHaveProperty('type', 'text');
      expect(result).not.toHaveProperty('color');
    });

    test('should process audio element without src', () => {
      const audioElement: IDataObject = {
        type: 'audio',
        volume: 0.8,
        start: 5,
        duration: 10
      };

      const result = processElement.call(mockExecuteFunctions, audioElement, 1920, 1080);

      expect(result).toHaveProperty('type', 'audio');
      expect(result).not.toHaveProperty('src');
      expect(result).toHaveProperty('volume', 0.8);
      expect(result).toHaveProperty('start', 5);
      expect(result).toHaveProperty('duration', 10);
    });

    test('should process audio element with invalid src type', () => {
      const audioElement: IDataObject = {
        type: 'audio',
        src: 123,
        volume: 0.8,
        start: 5,
        duration: 10
      };

      const result = processElement.call(mockExecuteFunctions, audioElement, 1920, 1080);

      expect(result).toHaveProperty('type', 'audio');
      expect(result).not.toHaveProperty('src');
    });

    test('should process voice element without text', () => {
      const voiceElement: IDataObject = {
        type: 'voice',
        voice: 'en-US-Standard-A',
        start: 0,
        duration: 5
      };

      const result = processElement.call(mockExecuteFunctions, voiceElement, 1920, 1080);

      expect(result).toHaveProperty('type', 'voice');
      expect(result).not.toHaveProperty('text');
      expect(result).toHaveProperty('voice', 'en-US-Standard-A');
    });

    test('should process voice element without voice', () => {
      const voiceElement: IDataObject = {
        type: 'voice',
        text: 'Hello world',
        start: 0,
        duration: 5
      };

      const result = processElement.call(mockExecuteFunctions, voiceElement, 1920, 1080);

      expect(result).toHaveProperty('type', 'voice');
      expect(result).toHaveProperty('text', 'Hello world');
      expect(result).not.toHaveProperty('voice');
    });

    test('should process voice element with invalid text type', () => {
      const voiceElement: IDataObject = {
        type: 'voice',
        text: 123,
        voice: 'en-US-Standard-A'
      };

      const result = processElement.call(mockExecuteFunctions, voiceElement, 1920, 1080);

      expect(result).toHaveProperty('type', 'voice');
      expect(result).not.toHaveProperty('text');
    });

    test('should process voice element with invalid voice type', () => {
      const voiceElement: IDataObject = {
        type: 'voice',
        text: 'Hello',
        voice: 123
      };

      const result = processElement.call(mockExecuteFunctions, voiceElement, 1920, 1080);

      expect(result).toHaveProperty('type', 'voice');
      expect(result).not.toHaveProperty('voice');
    });

    test('should process subtitles element with src source type', () => {
      const subtitlesElement: IDataObject = {
        type: 'subtitles',
        subtitleSourceType: 'src',
        src: 'https://example.com/subtitles.srt',
        language: 'en',
        position: 'bottom',
        fontFamily: 'Arial',
        fontSize: 24,
        color: 'white',
        backgroundColor: 'black',
        style: 'bold',
        opacity: 0.9,
        start: 0,
        duration: 60
      };

      const result = processElement.call(mockExecuteFunctions, subtitlesElement, 1920, 1080);

      expect(result).toHaveProperty('type', 'subtitles');
      expect(result).toHaveProperty('src', 'https://example.com/subtitles.srt');
      expect(result).not.toHaveProperty('text');
      expect(result).toHaveProperty('language', 'en');
      expect(result).toHaveProperty('position', 'bottom');
      expect(result).toHaveProperty('font-family', 'Arial');
      expect(result).toHaveProperty('font-size', 24);
      expect(result).toHaveProperty('color', 'white');
      expect(result).toHaveProperty('background-color', 'black');
      expect(result).toHaveProperty('style', 'bold');
      expect(result).toHaveProperty('opacity', 0.9);
    });

    test('should process subtitles element with invalid src type', () => {
      const subtitlesElement: IDataObject = {
        type: 'subtitles',
        subtitleSourceType: 'src',
        src: 123,
        language: 'en'
      };

      const result = processElement.call(mockExecuteFunctions, subtitlesElement, 1920, 1080);

      expect(result).toHaveProperty('type', 'subtitles');
      expect(result).not.toHaveProperty('src');
    });

    test('should process subtitles element with invalid text type', () => {
      const subtitlesElement: IDataObject = {
        type: 'subtitles',
        subtitleSourceType: 'text',
        text: 123,
        language: 'en'
      };

      const result = processElement.call(mockExecuteFunctions, subtitlesElement, 1920, 1080);

      expect(result).toHaveProperty('type', 'subtitles');
      expect(result).not.toHaveProperty('text');
    });

    test('should process subtitles element with invalid language type', () => {
      const subtitlesElement: IDataObject = {
        type: 'subtitles',
        subtitleSourceType: 'text',
        text: 'Subtitle text',
        language: 123
      };

      const result = processElement.call(mockExecuteFunctions, subtitlesElement, 1920, 1080);

      expect(result).toHaveProperty('type', 'subtitles');
      expect(result).not.toHaveProperty('language');
    });

    test('should process subtitles element with invalid position type', () => {
      const subtitlesElement: IDataObject = {
        type: 'subtitles',
        subtitleSourceType: 'text',
        text: 'Subtitle text',
        position: 123
      };

      const result = processElement.call(mockExecuteFunctions, subtitlesElement, 1920, 1080);

      expect(result).toHaveProperty('type', 'subtitles');
      expect(result).not.toHaveProperty('position');
    });

    test('should process subtitles element with invalid fontFamily type', () => {
      const subtitlesElement: IDataObject = {
        type: 'subtitles',
        subtitleSourceType: 'text',
        text: 'Subtitle text',
        fontFamily: 123
      };

      const result = processElement.call(mockExecuteFunctions, subtitlesElement, 1920, 1080);

      expect(result).toHaveProperty('type', 'subtitles');
      expect(result).not.toHaveProperty('font-family');
    });

    test('should process subtitles element with invalid color type', () => {
      const subtitlesElement: IDataObject = {
        type: 'subtitles',
        subtitleSourceType: 'text',
        text: 'Subtitle text',
        color: 123
      };

      const result = processElement.call(mockExecuteFunctions, subtitlesElement, 1920, 1080);

      expect(result).toHaveProperty('type', 'subtitles');
      expect(result).not.toHaveProperty('color');
    });

    test('should process subtitles element with invalid backgroundColor type', () => {
      const subtitlesElement: IDataObject = {
        type: 'subtitles',
        subtitleSourceType: 'text',
        text: 'Subtitle text',
        backgroundColor: 123
      };

      const result = processElement.call(mockExecuteFunctions, subtitlesElement, 1920, 1080);

      expect(result).toHaveProperty('type', 'subtitles');
      expect(result).not.toHaveProperty('background-color');
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

    test('should process subtitles element with text source', () => {
      const subtitlesElement: IDataObject = {
        type: 'subtitles',
        subtitleSourceType: 'text',
        text: 'Subtitle text',
        language: 'en',
        position: 'bottom',
        fontFamily: 'Arial',
        fontSize: 24,
        color: 'white'
      };

      const result = processElement.call(mockExecuteFunctions, subtitlesElement, 1920, 1080);

      expect(result).toHaveProperty('type', 'subtitles');
      expect(result).toHaveProperty('text', 'Subtitle text');
      expect(result).toHaveProperty('language', 'en');
      expect(result).toHaveProperty('position', 'bottom');
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
      expect(result).toHaveProperty('position', 'custom');
    });

    test('should handle unknown element type', () => {
      const unknownElement: IDataObject = {
        type: 'unknown',
        someProperty: 'value',
        start: 0,
        duration: 5
      };

      const result = processElement.call(mockExecuteFunctions, unknownElement, 1920, 1080);

      expect(result).toHaveProperty('type', 'unknown');
      expect(result).toHaveProperty('start', 0);
      expect(result).toHaveProperty('duration', 5);
      expect(result).not.toHaveProperty('someProperty');
    });

    test('should handle elements with zero width and height', () => {
      const imageElement: IDataObject = {
        type: 'image',
        src: 'https://example.com/image.jpg',
        positionPreset: 'center',
        width: 0,
        height: 0
      };

      const result = processElement.call(mockExecuteFunctions, imageElement, 1920, 1080);

      expect(result).toHaveProperty('type', 'image');
      expect(result).not.toHaveProperty('width');
      expect(result).not.toHaveProperty('height');
    });

    test('should handle elements with negative width and height', () => {
      const videoElement: IDataObject = {
        type: 'video',
        src: 'https://example.com/video.mp4',
        positionPreset: 'center',
        width: -100,
        height: -50
      };

      const result = processElement.call(mockExecuteFunctions, videoElement, 1920, 1080);

      expect(result).toHaveProperty('type', 'video');
      expect(result).not.toHaveProperty('width');
      expect(result).not.toHaveProperty('height');
    });

    test('should process text element without fontSize', () => {
      const textElement: IDataObject = {
        type: 'text',
        text: 'Test Text',
        positionPreset: 'center',
        fontFamily: 'Arial',
        color: 'white'
      };

      const result = processElement.call(mockExecuteFunctions, textElement, 1920, 1080);

      expect(result).toHaveProperty('type', 'text');
      expect(result).toHaveProperty('text', 'Test Text');
      expect(result).toHaveProperty('font-family', 'Arial');
      expect(result).toHaveProperty('color', 'white');
      expect(result).not.toHaveProperty('font-size');
    });
  });
});