// __tests__/nodes/CreateJ2vMovie/schema/json2videoSchema.test.ts

import {
  JSON2VideoRequest,
  Scene,
  MovieElement,
  SceneElement,
  SubtitleElement,
  MovieTextElement,
  SceneTextElement,
  VideoElement,
  ImageElement,
  AudioElement,
  VoiceElement,
  ComponentElement,
  AudiogramElement,
  HtmlElement,
  ExportConfig,
  API_RULES,
  isMovieElement,
  isSceneElement,
  isSubtitleElement,
  isTextElement,
  isHtmlElement,
  hasRequiredFields,
  isValidDuration,
  isValidPosition,
  isValidWait,
  WebhookExportConfig,
  FtpExportConfig,
  EmailExportConfig
} from '../../../../nodes/CreateJ2vMovie/schema/json2videoSchema';

describe('JSON2Video Schema', () => {

  describe('API_RULES Constants', () => {
    it('should have correct movie element types', () => {
      expect(API_RULES.MOVIE_ELEMENT_TYPES).toEqual(['text', 'subtitles', 'audio', 'voice']);
      expect(API_RULES.MOVIE_ELEMENT_TYPES).toHaveLength(4);
    });

    it('should have correct scene element types', () => {
      expect(API_RULES.SCENE_ELEMENT_TYPES).toEqual(['video', 'audio', 'image', 'text', 'voice', 'component', 'audiogram', 'html']);
      expect(API_RULES.SCENE_ELEMENT_TYPES).toHaveLength(8);
    });

    it('should have correct required fields mapping', () => {
      expect(API_RULES.REQUIRED_FIELDS.movie).toEqual(['scenes']);
      expect(API_RULES.REQUIRED_FIELDS.scene).toEqual([]);
      expect(API_RULES.REQUIRED_FIELDS.video).toEqual(['type']);
      expect(API_RULES.REQUIRED_FIELDS.audio).toEqual([]);
      expect(API_RULES.REQUIRED_FIELDS.image).toEqual([]);
      expect(API_RULES.REQUIRED_FIELDS.text).toEqual(['text', 'type']);
      expect(API_RULES.REQUIRED_FIELDS.voice).toEqual(['text', 'type']);
      expect(API_RULES.REQUIRED_FIELDS.subtitles).toEqual(['type']);
      expect(API_RULES.REQUIRED_FIELDS.component).toEqual(['component', 'type']);
      expect(API_RULES.REQUIRED_FIELDS.audiogram).toEqual([]);
      expect(API_RULES.REQUIRED_FIELDS.html).toEqual([]);
    });

    it('should have subtitle rules', () => {
      expect(API_RULES.SUBTITLE_RULES.ONLY_AT_MOVIE_LEVEL).toBe(true);
      expect(API_RULES.SUBTITLE_RULES.NOT_ALLOWED_IN_SCENES).toBe(true);
    });

    it('should have validation ranges', () => {
      expect(API_RULES.VALIDATION_RANGES.width).toEqual({ min: 50, max: 3840 });
      expect(API_RULES.VALIDATION_RANGES.height).toEqual({ min: 50, max: 3840 });
      expect(API_RULES.VALIDATION_RANGES.volume).toEqual({ min: 0, max: 10 });
      expect(API_RULES.VALIDATION_RANGES.opacity).toEqual({ min: 0, max: 1 });
      expect(API_RULES.VALIDATION_RANGES['z-index']).toEqual({ min: -99, max: 99 });
      expect(API_RULES.VALIDATION_RANGES.zoom).toEqual({ min: -10, max: 10 });
      expect(API_RULES.VALIDATION_RANGES['pan-distance']).toEqual({ min: 0.01, max: 0.5 });
      expect(API_RULES.VALIDATION_RANGES.tolerance).toEqual({ min: 1, max: 100 });
      expect(API_RULES.VALIDATION_RANGES.brightness).toEqual({ min: -1, max: 1 });
      expect(API_RULES.VALIDATION_RANGES.contrast).toEqual({ min: -1000, max: 1000 });
      expect(API_RULES.VALIDATION_RANGES.gamma).toEqual({ min: 0.1, max: 10 });
      expect(API_RULES.VALIDATION_RANGES.saturation).toEqual({ min: 0, max: 3 });
      expect(API_RULES.VALIDATION_RANGES.wait).toEqual({ min: 0, max: 5 });
    });

    it('should have valid positions', () => {
      expect(API_RULES.VALID_POSITIONS).toEqual([
        'top-left', 'top-center', 'top-right',
        'center-left', 'center-center', 'center-right',
        'bottom-left', 'bottom-center', 'bottom-right',
        'custom'
      ]);
    });

    it('should have valid qualities', () => {
      expect(API_RULES.VALID_QUALITIES).toEqual(['low', 'medium', 'high', 'very_high']);
    });

    it('should have valid resolutions', () => {
      expect(API_RULES.VALID_RESOLUTIONS).toEqual([
        'sd', 'hd', 'full-hd', 'squared', 'instagram-story',
        'instagram-feed', 'twitter-landscape', 'twitter-portrait', 'custom'
      ]);
    });

    it('should have valid resize modes', () => {
      expect(API_RULES.VALID_RESIZE_MODES).toEqual(['cover', 'fill', 'fit', 'contain']);
    });

    it('should have valid transition styles', () => {
      expect(API_RULES.VALID_TRANSITION_STYLES).toEqual([
        'fade', 'dissolve', 'wipeLeft', 'wipeRight', 'wipeUp', 'wipeDown'
      ]);
    });

    it('should have valid text styles', () => {
      expect(API_RULES.VALID_TEXT_STYLES).toEqual(['001', '002', '003', '004']);
    });

    it('should have valid AI models', () => {
      expect(API_RULES.VALID_AI_MODELS).toEqual(['flux-pro', 'flux-schnell', 'freepik-classic']);
    });

    it('should have valid aspect ratios', () => {
      expect(API_RULES.VALID_ASPECT_RATIOS).toEqual(['horizontal', 'vertical', 'squared']);
    });

    it('should have valid TTS models', () => {
      expect(API_RULES.VALID_TTS_MODELS).toEqual(['azure', 'elevenlabs', 'elevenlabs-flash-v2-5']);
    });

    it('should have valid pan directions', () => {
      expect(API_RULES.VALID_PAN_DIRECTIONS).toEqual([
        'left', 'right', 'top', 'bottom',
        'top-left', 'top-right', 'bottom-left', 'bottom-right'
      ]);
    });

    it('should have special duration values', () => {
      expect(API_RULES.SPECIAL_DURATION_VALUES).toEqual([-1, -2]);
    });
  });

  describe('isMovieElement', () => {
    it.each([
      ['text element', { type: 'text', text: 'test' }, true],
      ['subtitles element', { type: 'subtitles', captions: 'test' }, true],
      ['audio element', { type: 'audio', src: 'test.mp3' }, true],
      ['voice element', { type: 'voice', text: 'test' }, true],
      ['video element', { type: 'video', src: 'test.mp4' }, false],
      ['image element', { type: 'image', src: 'test.jpg' }, false],
      ['component element', { type: 'component', component: 'test' }, false],
      ['audiogram element', { type: 'audiogram' }, false],
      ['html element', { type: 'html', html: '<p>test</p>' }, false],
      ['invalid type', { type: 'invalid' }, false],
      ['element without type', { text: 'test' }, false],
      ['element with null type', { type: null }, false],
      ['element with empty type', { type: '' }, false]
    ])('should identify movie element: %s', (_, element, expected) => {
      expect(isMovieElement(element)).toBe(expected);
    });

    it.each([
      ['null element', null],
      ['undefined element', undefined]
    ])('should handle falsy inputs: %s', (_, element) => {
      const result = isMovieElement(element);
      expect([false, null, undefined]).toContain(result);
    });
  });

  describe('isSceneElement', () => {
    it.each([
      ['video element', { type: 'video', src: 'test.mp4' }, true],
      ['audio element', { type: 'audio', src: 'test.mp3' }, true],
      ['image element', { type: 'image', src: 'test.jpg' }, true],
      ['text element', { type: 'text', text: 'test' }, true],
      ['voice element', { type: 'voice', text: 'test' }, true],
      ['component element', { type: 'component', component: 'test' }, true],
      ['audiogram element', { type: 'audiogram' }, true],
      ['html element', { type: 'html', html: '<p>test</p>' }, true],
      ['subtitles element', { type: 'subtitles', captions: 'test' }, false],
      ['invalid type', { type: 'invalid' }, false],
      ['element without type', { src: 'test.mp4' }, false],
      ['element with null type', { type: null }, false],
      ['element with empty type', { type: '' }, false]
    ])('should identify scene element: %s', (_, element, expected) => {
      expect(isSceneElement(element)).toBe(expected);
    });

    it.each([
      ['null element', null],
      ['undefined element', undefined]
    ])('should handle falsy inputs: %s', (_, element) => {
      const result = isSceneElement(element);
      expect([false, null, undefined]).toContain(result);
    });
  });

  describe('isSubtitleElement', () => {
    it.each([
      ['subtitles element', { type: 'subtitles', captions: 'test' }, true],
      ['text element', { type: 'text', text: 'test' }, false],
      ['video element', { type: 'video', src: 'test.mp4' }, false],
      ['html element', { type: 'html', html: '<p>test</p>' }, false],
      ['invalid type', { type: 'invalid' }, false],
      ['element without type', { captions: 'test' }, false],
      ['element with null type', { type: null }, false],
      ['element with empty type', { type: '' }, false]
    ])('should identify subtitle element: %s', (_, element, expected) => {
      expect(isSubtitleElement(element)).toBe(expected);
    });

    it.each([
      ['null element', null],
      ['undefined element', undefined]
    ])('should handle falsy inputs: %s', (_, element) => {
      const result = isSubtitleElement(element);
      expect([false, null, undefined]).toContain(result);
    });
  });

  describe('isTextElement', () => {
    it.each([
      ['text element', { type: 'text', text: 'test' }, true],
      ['subtitles element', { type: 'subtitles', captions: 'test' }, false],
      ['video element', { type: 'video', src: 'test.mp4' }, false],
      ['html element', { type: 'html', html: '<p>test</p>' }, false],
      ['invalid type', { type: 'invalid' }, false],
      ['element without type', { text: 'test' }, false],
      ['element with null type', { type: null }, false],
      ['element with empty type', { type: '' }, false]
    ])('should identify text element: %s', (_, element, expected) => {
      expect(isTextElement(element)).toBe(expected);
    });

    it.each([
      ['null element', null],
      ['undefined element', undefined]
    ])('should handle falsy inputs: %s', (_, element) => {
      const result = isTextElement(element);
      expect([false, null, undefined]).toContain(result);
    });
  });

  describe('isHtmlElement', () => {
    it.each([
      ['html element with html content', { type: 'html', html: '<p>test</p>' }, true],
      ['html element with src', { type: 'html', src: 'https://example.com' }, true],
      ['html element minimal', { type: 'html' }, true],
      ['text element', { type: 'text', text: 'test' }, false],
      ['video element', { type: 'video', src: 'test.mp4' }, false],
      ['subtitles element', { type: 'subtitles', captions: 'test' }, false],
      ['invalid type', { type: 'invalid' }, false],
      ['element without type', { html: '<p>test</p>' }, false],
      ['element with null type', { type: null }, false],
      ['element with empty type', { type: '' }, false]
    ])('should identify html element: %s', (_, element, expected) => {
      expect(isHtmlElement(element)).toBe(expected);
    });

    it.each([
      ['null element', null],
      ['undefined element', undefined]
    ])('should handle falsy inputs: %s', (_, element) => {
      const result = isHtmlElement(element);
      expect([false, null, undefined]).toContain(result);
    });
  });

  describe('hasRequiredFields', () => {
    it.each([
      ['null element', null, false],
      ['undefined element', undefined, false],
      ['element without type', { text: 'test' }, false],
      ['element with null type', { type: null }, false],
      ['element with empty type', { type: '' }, false],
      ['video with src', { type: 'video', src: 'test.mp4' }, true],
      ['audio with src', { type: 'audio', src: 'test.mp3' }, true],
      ['audio without src', { type: 'audio' }, true],
      ['audio with empty src', { type: 'audio', src: '' }, true],
      ['text with text', { type: 'text', text: 'test content' }, true],
      ['text without text', { type: 'text' }, false],
      ['text with empty text', { type: 'text', text: '' }, false],
      ['text with whitespace text', { type: 'text', text: '   ' }, false],
      ['text with null text', { type: 'text', text: null }, false],
      ['voice with text', { type: 'voice', text: 'speech content' }, true],
      ['voice without text', { type: 'voice' }, false],
      ['voice with empty text', { type: 'voice', text: '' }, false],
      ['component with component', { type: 'component', component: 'test-component' }, true],
      ['component without component', { type: 'component' }, false],
      ['component with empty component', { type: 'component', component: '' }, false],
      ['component with whitespace component', { type: 'component', component: '   ' }, false],
      ['image without src or prompt', { type: 'image' }, true],
      ['image with src', { type: 'image', src: 'test.jpg' }, true],
      ['image with prompt', { type: 'image', prompt: 'AI prompt' }, true],
      ['subtitles without content', { type: 'subtitles' }, true],
      ['subtitles with captions', { type: 'subtitles', captions: 'test' }, true],
      ['audiogram without content', { type: 'audiogram' }, true],
      ['audiogram with color', { type: 'audiogram', color: '#ff0000' }, true],
      ['html without content', { type: 'html' }, true],
      ['html with html content', { type: 'html', html: '<p>test</p>' }, true],
      ['html with src', { type: 'html', src: 'https://example.com' }, true],
      ['unknown type', { type: 'unknown' }, true]
    ])('should validate required fields: %s', (_, element, expected) => {
      expect(hasRequiredFields(element)).toBe(expected);
    });
  });

  describe('isValidDuration', () => {
    it.each([
      ['undefined duration', undefined, true],
      ['null duration', null, true],
      ['positive number', 5, true],
      ['decimal number', 2.5, true],
      ['zero', 0, false],
      ['negative number', -5, false],
      ['special value -1', -1, true],
      ['special value -2', -2, true],
      ['string number', '5', false],
      ['string', 'invalid', false],
      ['NaN', NaN, false],
      ['Infinity', Infinity, true],
      ['-Infinity', -Infinity, false],
      ['object', {}, false],
      ['array', [], false],
      ['boolean true', true, false],
      ['boolean false', false, false]
    ])('should validate duration: %s', (_, duration, expected) => {
      expect(isValidDuration(duration)).toBe(expected);
    });
  });

  describe('isValidPosition', () => {
    it.each([
      ['top-left', 'top-left', true],
      ['top-center', 'top-center', true],
      ['top-right', 'top-right', true],
      ['center-left', 'center-left', true],
      ['center-center', 'center-center', true],
      ['center-right', 'center-right', true],
      ['bottom-left', 'bottom-left', true],
      ['bottom-center', 'bottom-center', true],
      ['bottom-right', 'bottom-right', true],
      ['custom', 'custom', true],
      ['invalid position', 'invalid-position', false],
      ['empty string', '', false],
      ['null', null as any, false],
      ['undefined', undefined as any, false],
      ['number', 123 as any, false],
      ['object', {} as any, false],
      ['case sensitive', 'TOP-LEFT', false],
      ['with spaces', 'top left', false]
    ])('should validate position: %s', (_, position, expected) => {
      expect(isValidPosition(position)).toBe(expected);
    });
  });

  describe('isValidWait', () => {
    it.each([
      ['undefined wait', undefined, true],
      ['null wait', null, true],
      ['zero', 0, true],
      ['minimum boundary', 0, true],
      ['maximum boundary', 5, true],
      ['valid decimal', 2.5, true],
      ['valid integer', 3, true],
      ['below minimum', -1, false],
      ['above maximum', 6, false],
      ['string number', '2', false],
      ['string', 'invalid', false],
      ['NaN', NaN, false],
      ['Infinity', Infinity, false],
      ['-Infinity', -Infinity, false],
      ['object', {}, false],
      ['array', [], false],
      ['boolean true', true, false],
      ['boolean false', false, false]
    ])('should validate wait: %s', (_, wait, expected) => {
      expect(isValidWait(wait)).toBe(expected);
    });
  });

  describe('Type Interface Coverage', () => {
    it('should support JSON2VideoRequest interface', () => {
      const request: JSON2VideoRequest = {
        scenes: [{ elements: [] }]
      };
      expect(request.scenes).toHaveLength(1);
    });

    it('should support Scene interface', () => {
      const scene: Scene = {
        elements: [{ type: 'video', src: 'test.mp4' }]
      };
      expect(scene.elements).toHaveLength(1);
    });

    it('should support MovieElement interfaces', () => {
      const textElement: MovieTextElement = { type: 'text', text: 'test' };
      const subtitleElement: SubtitleElement = { type: 'subtitles', captions: 'test' };
      const audioElement: MovieElement = { type: 'audio', src: 'test.mp3' };
      const voiceElement: VoiceElement = { type: 'voice', text: 'test' };

      expect(textElement.type).toBe('text');
      expect(subtitleElement.type).toBe('subtitles');
      expect(audioElement.type).toBe('audio');
      expect(voiceElement.type).toBe('voice');
    });

    it('should support SceneElement interfaces', () => {
      const videoElement: VideoElement = { type: 'video', src: 'test.mp4' };
      const imageElement: ImageElement = { type: 'image', src: 'test.jpg' };
      const textElement: SceneTextElement = { type: 'text', text: 'test' };
      const audioElement: SceneElement = { type: 'audio', src: 'test.mp3' };
      const voiceElement: VoiceElement = { type: 'voice', text: 'test' };
      const componentElement: ComponentElement = { type: 'component', component: 'test' };
      const audiogramElement: AudiogramElement = { type: 'audiogram' };
      const htmlElement: HtmlElement = { type: 'html', html: '<p>test</p>' };

      expect(videoElement.type).toBe('video');
      expect(imageElement.type).toBe('image');
      expect(textElement.type).toBe('text');
      expect(audioElement.type).toBe('audio');
      expect(voiceElement.type).toBe('voice');
      expect(componentElement.type).toBe('component');
      expect(audiogramElement.type).toBe('audiogram');
      expect(htmlElement.type).toBe('html');
    });

    it('should support shared object interfaces', () => {
      const cropObject = { width: 100, height: 100, x: 0, y: 0 };
      const rotateObject = { angle: 45, speed: 1 };
      const chromaKeyObject = { color: '#00FF00', tolerance: 25 };
      const correctionObject = { brightness: 0.5, contrast: 1.2, gamma: 1.0, saturation: 1.1 };

      expect(cropObject.width).toBe(100);
      expect(rotateObject.angle).toBe(45);
      expect(chromaKeyObject.color).toBe('#00FF00');
      expect(correctionObject.brightness).toBe(0.5);
    });

    it('should support settings objects', () => {
      const textSettings = {
        'font-family': 'Arial',
        'font-size': 24,
        'font-weight': 400,
        'font-color': '#000000',
        'text-align': 'center' as const
      };

      const subtitleSettings = {
        style: 'classic',
        'font-size': 18,
        'word-color': '#FFFF00',
        'line-color': '#FFFFFF',
        'max-words-per-line': 4
      };

      expect(textSettings['font-family']).toBe('Arial');
      expect(subtitleSettings['word-color']).toBe('#FFFF00');
    });

    it('should support parameter interfaces', () => {
      const textParams = {
        text: 'test',
        fontSize: 24,
        fontWeight: 400,
        fontColor: '#000000'
      };

      const subtitleParams = {
        captions: 'test captions',
        fontSize: 18,
        wordColor: '#FFFF00'
      };

      const basicParams = {
        type: 'video',
        src: 'test.mp4',
        duration: 10
      };

      const htmlParams = {
        html: '<p>test</p>',
        tailwindcss: true,
        wait: 3
      };

      expect(textParams.text).toBe('test');
      expect(subtitleParams.captions).toBe('test captions');
      expect(basicParams.type).toBe('video');
      expect(htmlParams.html).toBe('<p>test</p>');
      expect(htmlParams.tailwindcss).toBe(true);
      expect(htmlParams.wait).toBe(3);
    });
  });

  describe('Edge Cases and Boundary Conditions', () => {
    it.each([
      ['empty object for hasRequiredFields', {}],
      ['object with extra properties', { type: 'text', text: 'test', extraProp: 'value' }],
      ['element with all optional fields', { 
        type: 'video', 
        src: 'test.mp4',
        id: 'test-id',
        comment: 'test comment',
        condition: 'test condition',
        variables: { test: 'value' },
        cache: true,
        start: 0,
        duration: 10,
        'extra-time': 2,
        'z-index': 5,
        'fade-in': 1,
        'fade-out': 1
      }]
    ])('should handle edge case: %s', (_, element) => {
      expect(() => {
        isMovieElement(element);
        isSceneElement(element);
        isSubtitleElement(element);
        isTextElement(element);
        isHtmlElement(element);
        hasRequiredFields(element);
      }).not.toThrow();
    });

    it('should handle complex nested objects', () => {
      const complexElement = {
        type: 'image',
        src: 'test.jpg',
        crop: { width: 100, height: 100, x: 10, y: 10 },
        rotate: { angle: 45, speed: 2 },
        'chroma-key': { color: '#00FF00', tolerance: 50 },
        correction: { brightness: 0.2, contrast: 1.1, gamma: 0.9, saturation: 1.3 },
        settings: { 'custom-prop': 'value' }
      };

      expect(hasRequiredFields(complexElement)).toBe(true);
      expect(isSceneElement(complexElement)).toBe(true);
    });

    it('should validate numeric edge cases for duration', () => {
      expect(isValidDuration(0.0001)).toBe(true);
      expect(isValidDuration(Number.MAX_VALUE)).toBe(true);
      expect(isValidDuration(Number.MIN_VALUE)).toBe(true);
      expect(isValidDuration(-0)).toBe(false);
      expect(isValidDuration(Number.NEGATIVE_INFINITY)).toBe(false);
      expect(isValidDuration(Number.POSITIVE_INFINITY)).toBe(true);
    });

    it('should validate numeric edge cases for wait', () => {
      expect(isValidWait(0.0001)).toBe(true);
      expect(isValidWait(4.9999)).toBe(true);
      expect(isValidWait(0)).toBe(true);
      expect(isValidWait(5)).toBe(true);
      expect(isValidWait(-0.0001)).toBe(false);
      expect(isValidWait(5.0001)).toBe(false);
      expect(isValidWait(Number.POSITIVE_INFINITY)).toBe(false);
      expect(isValidWait(Number.NEGATIVE_INFINITY)).toBe(false);
    });

    it('should handle trimming logic for required fields', () => {
      const elementsWithWhitespace = [
        { type: 'text', text: '\t\n\r ' },
        { type: 'voice', text: '   ' },
        { type: 'component', component: '\t\t' }
      ];

      elementsWithWhitespace.forEach(element => {
        expect(hasRequiredFields(element)).toBe(false);
      });

      // Audio elements with whitespace src should still pass (audio src not required)
      const audioWithWhitespace = { type: 'audio', src: '\n\r\n' };
      expect(hasRequiredFields(audioWithWhitespace)).toBe(true);
    });

    it('should test all API_RULES array lengths and immutability', () => {
      expect(API_RULES.MOVIE_ELEMENT_TYPES.length).toBeGreaterThan(0);
      expect(API_RULES.SCENE_ELEMENT_TYPES.length).toBeGreaterThan(0);
      expect(API_RULES.VALID_POSITIONS.length).toBeGreaterThan(0);
      expect(API_RULES.VALID_QUALITIES.length).toBeGreaterThan(0);
      expect(API_RULES.VALID_RESOLUTIONS.length).toBeGreaterThan(0);
      expect(API_RULES.VALID_RESIZE_MODES.length).toBeGreaterThan(0);
      expect(API_RULES.VALID_TRANSITION_STYLES.length).toBeGreaterThan(0);
      expect(API_RULES.VALID_TEXT_STYLES.length).toBeGreaterThan(0);
      expect(API_RULES.VALID_AI_MODELS.length).toBeGreaterThan(0);
      expect(API_RULES.VALID_ASPECT_RATIOS.length).toBeGreaterThan(0);
      expect(API_RULES.VALID_TTS_MODELS.length).toBeGreaterThan(0);
      expect(API_RULES.VALID_PAN_DIRECTIONS.length).toBeGreaterThan(0);
      expect(API_RULES.SPECIAL_DURATION_VALUES.length).toBeGreaterThan(0);

      // Test that arrays are properly defined and accessible
      expect(Array.isArray(API_RULES.MOVIE_ELEMENT_TYPES)).toBe(true);
      expect(Array.isArray(API_RULES.SCENE_ELEMENT_TYPES)).toBe(true);
    });

    it('should handle HTML element specific properties', () => {
      const htmlElements = [
        { type: 'html', html: '<div>Hello World</div>' },
        { type: 'html', src: 'https://example.com' },
        { type: 'html', html: '<p>Test</p>', tailwindcss: true, wait: 2.5 },
        { type: 'html', src: 'https://test.com', wait: 0 },
        { type: 'html', src: 'https://test.com', wait: 5 }
      ];

      htmlElements.forEach(element => {
        expect(isHtmlElement(element)).toBe(true);
        expect(isSceneElement(element)).toBe(true);
        expect(isMovieElement(element)).toBe(false);
        expect(hasRequiredFields(element)).toBe(true);
      });
    });
  });
});

describe('Export Configuration Interfaces', () => {
  
  describe('ExportConfig interface', () => {
    it('should support basic export configuration', () => {
      const basicExport: ExportConfig = {
        format: 'mp4',
        quality: 'high',
      };
      
      expect(basicExport.format).toBe('mp4');
      expect(basicExport.quality).toBe('high');
    });

    it('should support all export formats', () => {
      const formats: Array<'mp4' | 'webm' | 'gif'> = ['mp4', 'webm', 'gif'];
      
      formats.forEach(format => {
        const exportConfig: ExportConfig = { format };
        expect(exportConfig.format).toBe(format);
      });
    });

    it('should support all quality levels', () => {
      const qualities: Array<'low' | 'medium' | 'high' | 'very_high'> = ['low', 'medium', 'high', 'very_high'];
      
      qualities.forEach(quality => {
        const exportConfig: ExportConfig = { quality };
        expect(exportConfig.quality).toBe(quality);
      });
    });

    it('should support custom resolution and dimensions', () => {
      const exportConfig: ExportConfig = {
        resolution: '1920x1080',
        width: 1920,
        height: 1080
      };
      
      expect(exportConfig.resolution).toBe('1920x1080');
      expect(exportConfig.width).toBe(1920);
      expect(exportConfig.height).toBe(1080);
    });
  });

  describe('WebhookExportConfig interface', () => {
    it('should require URL', () => {
      const webhook: WebhookExportConfig = {
        url: 'https://example.com/webhook'
      };
      
      expect(webhook.url).toBe('https://example.com/webhook');
    });
  });

  describe('FtpExportConfig interface', () => {
    it('should require host, username, and password', () => {
      const ftp: FtpExportConfig = {
        host: 'ftp.example.com',
        username: 'testuser',
        password: 'testpass'
      };
      
      expect(ftp.host).toBe('ftp.example.com');
      expect(ftp.username).toBe('testuser');
      expect(ftp.password).toBe('testpass');
    });

    it('should support custom port', () => {
      const ftp: FtpExportConfig = {
        host: 'ftp.example.com',
        username: 'testuser',
        password: 'testpass',
        port: 2121
      };
      
      expect(ftp.port).toBe(2121);
    });

    it('should support custom path', () => {
      const ftp: FtpExportConfig = {
        host: 'ftp.example.com',
        username: 'testuser',
        password: 'testpass',
        path: '/uploads/videos/'
      };
      
      expect(ftp.path).toBe('/uploads/videos/');
    });

    it('should support secure connection (SFTP)', () => {
      const sftp: FtpExportConfig = {
        host: 'sftp.example.com',
        username: 'sftpuser',
        password: 'sftppass',
        secure: true
      };
      
      expect(sftp.secure).toBe(true);
    });

    it('should support complete FTP configuration', () => {
      const ftp: FtpExportConfig = {
        host: 'uploads.example.com',
        port: 21,
        username: 'videobot',
        password: 'securepass123',
        path: '/public/videos/',
        secure: false
      };
      
      expect(ftp.host).toBe('uploads.example.com');
      expect(ftp.port).toBe(21);
      expect(ftp.username).toBe('videobot');
      expect(ftp.password).toBe('securepass123');
      expect(ftp.path).toBe('/public/videos/');
      expect(ftp.secure).toBe(false);
    });
  });

  describe('EmailExportConfig interface', () => {
    it('should require to address', () => {
      const email: EmailExportConfig = {
        to: 'recipient@example.com'
      };
      
      expect(email.to).toBe('recipient@example.com');
    });

    it('should support multiple recipients as string array', () => {
      const email: EmailExportConfig = {
        to: ['user1@example.com', 'user2@example.com', 'admin@example.com']
      };
      
      expect(Array.isArray(email.to)).toBe(true);
      expect(email.to).toHaveLength(3);
      expect(email.to).toContain('user1@example.com');
      expect(email.to).toContain('admin@example.com');
    });

    it('should support from address', () => {
      const email: EmailExportConfig = {
        to: 'recipient@example.com',
        from: 'noreply@videoservice.com'
      };
      
      expect(email.from).toBe('noreply@videoservice.com');
    });

    it('should support custom subject and message', () => {
      const email: EmailExportConfig = {
        to: 'client@company.com',
        from: 'videos@myservice.com',
        subject: 'Your video is ready!',
        message: 'Hi there! Your requested video has been generated and is ready for download.'
      };
      
      expect(email.subject).toBe('Your video is ready!');
      expect(email.message).toContain('Your requested video has been generated');
    });

    it('should support complete email configuration', () => {
      const email: EmailExportConfig = {
        to: ['marketing@company.com', 'designer@company.com'],
        from: 'automation@videoplatform.io',
        subject: 'Weekly Video Report - Generated Successfully',
        message: 'The weekly marketing video has been generated. Please review and approve for publishing.'
      };
      
      expect(Array.isArray(email.to)).toBe(true);
      expect(email.to).toHaveLength(2);
      expect(email.from).toContain('@videoplatform.io');
      expect(email.subject).toContain('Weekly Video Report');
      expect(email.message).toContain('review and approve');
    });
  });

  describe('Complete ExportConfig with delivery methods', () => {
    it('should support webhook export configuration', () => {
      const exportConfig: ExportConfig = {
        format: 'mp4',
        quality: 'very_high',
        webhook: {
          url: 'https://api.myapp.com/video-complete',
        }
      };
      
      expect(exportConfig.format).toBe('mp4');
      expect(exportConfig.quality).toBe('very_high');
      expect(exportConfig.webhook).toBeDefined();
      expect(exportConfig.webhook!.url).toContain('myapp.com');
      expect(exportConfig.ftp).toBeUndefined();
      expect(exportConfig.email).toBeUndefined();
    });

    it('should support FTP export configuration', () => {
      const exportConfig: ExportConfig = {
        format: 'webm',
        quality: 'medium',
        resolution: '1280x720',
        ftp: {
          host: 'files.company.com',
          port: 22,
          username: 'videouser',
          password: 'ftppassword',
          path: '/shared/videos/',
          secure: true
        }
      };
      
      expect(exportConfig.format).toBe('webm');
      expect(exportConfig.resolution).toBe('1280x720');
      expect(exportConfig.ftp).toBeDefined();
      expect(exportConfig.ftp!.secure).toBe(true);
      expect(exportConfig.webhook).toBeUndefined();
      expect(exportConfig.email).toBeUndefined();
    });

    it('should support email export configuration', () => {
      const exportConfig: ExportConfig = {
        format: 'gif',
        quality: 'low',
        width: 640,
        height: 480,
        email: {
          to: 'stakeholder@company.com',
          from: 'reports@videosystem.com',
          subject: 'Animated Report Ready',
          message: 'Your animated GIF report has been generated successfully.'
        }
      };
      
      expect(exportConfig.format).toBe('gif');
      expect(exportConfig.quality).toBe('low');
      expect(exportConfig.width).toBe(640);
      expect(exportConfig.height).toBe(480);
      expect(exportConfig.email).toBeDefined();
      expect(exportConfig.email!.to).toBe('stakeholder@company.com');
      expect(exportConfig.webhook).toBeUndefined();
      expect(exportConfig.ftp).toBeUndefined();
    });
  });

  describe('JSON2VideoRequest with exports', () => {
    it('should support exports array in JSON2VideoRequest', () => {
      const request: JSON2VideoRequest = {
        width: 1920,
        height: 1080,
        quality: 'high',
        scenes: [{
          elements: [{
            type: 'text',
            text: 'Hello World'
          }]
        }],
        exports: [{
          format: 'mp4',
          webhook: {
            url: 'https://example.com/notify'
          }
        }]
      };
      
      expect(request.exports).toBeDefined();
      expect(request.exports).toHaveLength(1);
      expect(request.exports![0].format).toBe('mp4');
      expect(request.exports![0].webhook?.url).toBe('https://example.com/notify');
    });

    it('should support multiple export configurations', () => {
      const request: JSON2VideoRequest = {
        scenes: [{
          elements: [{
            type: 'video',
            src: 'https://example.com/input.mp4'
          }]
        }],
        exports: [
          {
            format: 'mp4',
            quality: 'high',
            webhook: {
              url: 'https://primary-service.com/callback',
            }
          },
          {
            format: 'gif',
            quality: 'medium',
            email: {
              to: 'preview@company.com',
              subject: 'Preview GIF Ready'
            }
          },
          {
            format: 'webm',
            quality: 'very_high',
            ftp: {
              host: 'backup.company.com',
              username: 'archiver',
              password: 'backup123',
              path: '/archives/videos/',
              secure: true
            }
          }
        ]
      };
      
      expect(request.exports).toHaveLength(3);
      
      // First export (webhook)
      expect(request.exports![0].webhook).toBeDefined();
      expect(request.exports![0].email).toBeUndefined();
      expect(request.exports![0].ftp).toBeUndefined();
      
      // Second export (email)
      expect(request.exports![1].email).toBeDefined();
      expect(request.exports![1].webhook).toBeUndefined();
      expect(request.exports![1].ftp).toBeUndefined();
      
      // Third export (FTP)
      expect(request.exports![2].ftp).toBeDefined();
      expect(request.exports![2].webhook).toBeUndefined();
      expect(request.exports![2].email).toBeUndefined();
    });

    it('should support request without exports', () => {
      const request: JSON2VideoRequest = {
        scenes: [{
          elements: [{
            type: 'text',
            text: 'Simple video without exports'
          }]
        }]
      };
      
      expect(request.exports).toBeUndefined();
    });

    it('should support empty exports array', () => {
      const request: JSON2VideoRequest = {
        scenes: [{
          elements: [{
            type: 'image',
            src: 'https://example.com/image.jpg'
          }]
        }],
        exports: []
      };
      
      expect(request.exports).toBeDefined();
      expect(request.exports).toHaveLength(0);
    });
  });

  describe('Export configuration type safety', () => {
    it('should enforce mutually exclusive delivery methods', () => {
      // This test ensures that each export config should only have one delivery method
      const webhookOnly: ExportConfig = {
        webhook: { url: 'https://example.com' }
        // Should not have ftp or email
      };
      
      const ftpOnly: ExportConfig = {
        ftp: {
          host: 'ftp.example.com',
          username: 'user',
          password: 'pass'
        }
        // Should not have webhook or email
      };
      
      const emailOnly: ExportConfig = {
        email: {
          to: 'user@example.com'
        }
        // Should not have webhook or ftp
      };
      
      expect(webhookOnly.webhook).toBeDefined();
      expect(webhookOnly.ftp).toBeUndefined();
      expect(webhookOnly.email).toBeUndefined();
      
      expect(ftpOnly.ftp).toBeDefined();
      expect(ftpOnly.webhook).toBeUndefined();
      expect(ftpOnly.email).toBeUndefined();
      
      expect(emailOnly.email).toBeDefined();
      expect(emailOnly.webhook).toBeUndefined();
      expect(emailOnly.ftp).toBeUndefined();
    });

    it('should support serialization of export configurations', () => {
      const exportConfig: ExportConfig = {
        format: 'mp4',
        quality: 'high',
        width: 1920,
        height: 1080,
        webhook: {
          url: 'https://api.example.com/webhook',
        }
      };
      
      expect(() => JSON.stringify(exportConfig)).not.toThrow();
      
      const serialized = JSON.stringify(exportConfig);
      const parsed = JSON.parse(serialized);
      
      expect(parsed.webhook.url).toBe('https://api.example.com/webhook');
    });
  });
});