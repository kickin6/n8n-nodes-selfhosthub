/**
 * Test file to verify element fixtures are structured correctly
 * This ensures our element test data is valid before we use it in actual tests
 */

import { 
  videoElements,
  audioElements,
  textElements,
  mixedElements,
  invalidElements,
  createElementCollection,
  createTextElementCollection,
  testScenarios
} from './elementFixtures';

describe('Element Fixtures', () => {
  describe('Video Elements', () => {
    test('should have basic video element', () => {
      expect(videoElements.basic.type).toBe('video');
      expect(videoElements.basic.src).toBeDefined();
      expect(typeof videoElements.basic.src).toBe('string');
    });

    test('should have video element with duration', () => {
      expect(videoElements.withDuration.type).toBe('video');
      expect(videoElements.withDuration.duration).toBe(10);
    });

    test('should have video element with all properties', () => {
      const video = videoElements.withAllProperties;
      expect(video.type).toBe('video');
      expect(video.src).toBeDefined();
      expect(video.start).toBe(2);
      expect(video.duration).toBe(15);
      expect(video.volume).toBe(0.8);
      expect(video.muted).toBe(false);
      expect(video.loop).toBe(true);
      expect(video.crop).toBe(false);
      expect(video.fit).toBe('cover');
      expect(video.speed).toBe(1.5);
    });

    test('should have muted video element', () => {
      expect(videoElements.muted.muted).toBe(true);
      expect(videoElements.muted.volume).toBe(0);
    });
  });

  describe('Audio Elements', () => {
    test('should have basic audio element', () => {
      expect(audioElements.basic.type).toBe('audio');
      expect(audioElements.basic.src).toBeDefined();
      expect(typeof audioElements.basic.src).toBe('string');
    });

    test('should have audio element with volume', () => {
      expect(audioElements.withVolume.volume).toBe(0.7);
    });

    test('should have audio element with all properties', () => {
      const audio = audioElements.withAllProperties;
      expect(audio.type).toBe('audio');
      expect(audio.start).toBe(5);
      expect(audio.duration).toBe(20);
      expect(audio.volume).toBe(0.9);
      expect(audio.loop).toBe(false);
    });

    test('should have looped audio element', () => {
      expect(audioElements.looped.loop).toBe(true);
      expect(audioElements.looped.volume).toBe(0.3);
    });
  });

  describe('Text Elements', () => {
    test('should have basic text element', () => {
      expect(textElements.basic.text).toBe('Basic text');
      expect(textElements.basic.style).toBe('001');
    });

    test('should have minimal text element', () => {
      expect(textElements.minimal.text).toBe('Minimal text element');
      expect('style' in textElements.minimal).toBe(false);
    });

    test('should have complete text element with all properties', () => {
      const text = textElements.complete;
      expect(text.text).toBe('Complete text element');
      expect(text.style).toBe('001');
      expect(text.fontFamily).toBe('Roboto');
      expect(text.fontSize).toBe('32px');
      expect(text.fontWeight).toBe('600');
      expect(text.fontColor).toBe('#FFFFFF');
      expect(text.backgroundColor).toBe('#000000');
      expect(text.textAlign).toBe('center');
      expect(text.position).toBe('center-center');
      expect(text.start).toBe(0);
      expect(text.duration).toBe(5);
      expect(text.fadeIn).toBe(0.3);
      expect(text.fadeOut).toBe(0.3);
      expect(text.zIndex).toBe(10);
    });

    test('should have custom positioned text element', () => {
      const text = textElements.customPosition;
      expect(text.position).toBe('custom');
      expect(text.x).toBe(100);
      expect(text.y).toBe(200);
    });

    test('should have different text styles array', () => {
      expect(Array.isArray(textElements.differentStyles)).toBe(true);
      expect(textElements.differentStyles).toHaveLength(4);
      expect(textElements.differentStyles[0].style).toBe('001');
      expect(textElements.differentStyles[1].style).toBe('002');
      expect(textElements.differentStyles[2].style).toBe('003');
      expect(textElements.differentStyles[3].style).toBe('004');
    });

    test('should have text with backgrounds array', () => {
      expect(Array.isArray(textElements.withBackgrounds)).toBe(true);
      expect(textElements.withBackgrounds).toHaveLength(2);
      expect(textElements.withBackgrounds[0].backgroundColor).toBe('#000000');
      expect(textElements.withBackgrounds[1].backgroundColor).toBe('#FF0000');
    });

    test('should have positioning array', () => {
      expect(Array.isArray(textElements.positioning)).toBe(true);
      expect(textElements.positioning).toHaveLength(5);
      expect(textElements.positioning[0].position).toBe('top-left');
      expect(textElements.positioning[4].position).toBe('center-center');
    });
  });

  describe('Mixed Elements', () => {
    test('should have video and audio combination', () => {
      expect(mixedElements.videoAndAudio).toHaveLength(2);
      expect(mixedElements.videoAndAudio[0].type).toBe('video');
      expect(mixedElements.videoAndAudio[1].type).toBe('audio');
    });

    test('should have video and text combination', () => {
      expect(mixedElements.videoAndText).toHaveLength(2);
      expect((mixedElements.videoAndText[0] as any).type).toBe('video');
      expect((mixedElements.videoAndText[1] as any).text).toBeDefined();
    });

    test('should have all types combination', () => {
      expect(mixedElements.allTypes).toHaveLength(3);
      expect((mixedElements.allTypes[0] as any).type).toBe('video');
      expect((mixedElements.allTypes[1] as any).type).toBe('audio');
      expect((mixedElements.allTypes[2] as any).text).toBeDefined();
    });
  });

  describe('Invalid Elements', () => {
    test('should have invalid text elements', () => {
      expect(invalidElements.text.emptyText.text).toBe('');
      expect('text' in invalidElements.text.missingText).toBe(false);
      expect(invalidElements.text.invalidStyle.style).toBe('invalid-style');
    });

    test('should have invalid video elements', () => {
      expect('src' in invalidElements.video.missingSrc).toBe(false);
      expect(invalidElements.video.emptySrc.src).toBe('');
    });

    test('should have invalid audio elements', () => {
      expect('src' in invalidElements.audio.missingSrc).toBe(false);
      expect(invalidElements.audio.emptySrc.src).toBe('');
    });
  });

  describe('Helper Functions', () => {
    test('createElementCollection should wrap elements correctly', () => {
      const elements = [videoElements.basic, audioElements.basic];
      const collection = createElementCollection(elements);
      
      expect(collection.elementValues).toEqual(elements);
    });

    test('createTextElementCollection should wrap text elements correctly', () => {
      const textElems = [textElements.basic, textElements.complete];
      const collection = createTextElementCollection(textElems);
      
      expect(collection.textDetails).toEqual(textElems);
    });
  });

  describe('Test Scenarios', () => {
    test('should have empty scene scenario', () => {
      expect(testScenarios.emptyScene.elements.elementValues).toEqual([]);
      expect(testScenarios.emptyScene.textElements.textDetails).toEqual([]);
    });

    test('should have video only scene scenario', () => {
      expect(testScenarios.videoOnlyScene.elements.elementValues).toHaveLength(1);
      expect(testScenarios.videoOnlyScene.elements.elementValues[0].type).toBe('video');
      expect(testScenarios.videoOnlyScene.textElements.textDetails).toEqual([]);
    });

    test('should have text only scene scenario', () => {
      expect(testScenarios.textOnlyScene.elements.elementValues).toEqual([]);
      expect(testScenarios.textOnlyScene.textElements.textDetails).toHaveLength(1);
      expect(testScenarios.textOnlyScene.textElements.textDetails[0].text).toBe('Basic text');
    });

    test('should have mixed scene scenario', () => {
      expect(testScenarios.mixedScene.elements.elementValues).toHaveLength(2);
      expect(testScenarios.mixedScene.textElements.textDetails).toHaveLength(1);
      expect(testScenarios.mixedScene.elements.elementValues[0].type).toBe('video');
      expect(testScenarios.mixedScene.elements.elementValues[1].type).toBe('audio');
      expect(testScenarios.mixedScene.textElements.textDetails[0].text).toBe('Complete text element');
    });
  });
});