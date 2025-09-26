// __tests__/nodes/CreateJ2vMovie/schema/rules.test.ts

import {
  validateTextElementParams,
  validateSubtitleElementParams,
  validateMovieElements,
  validateSceneElements,
  validateJSON2VideoRequest,
  validateImageElement,
  validateExportConfig,
  validateExportDestination
} from '../../../../nodes/CreateJ2vMovie/schema/rules';

import {
  TextElementParams,
  SubtitleElementParams,
  ExportConfig,
  ExportDestination
} from '../../../../nodes/CreateJ2vMovie/schema/schema';

describe('rules', () => {

  describe('validateImageElement', () => {
    it.each([
      ['image with src', { type: 'image', src: 'https://example.com/image.jpg' }],
      ['image with prompt', { type: 'image', prompt: 'A beautiful sunset' }],
      ['image with prompt and valid model', { type: 'image', prompt: 'Test', model: 'flux-pro' }],
      ['image with prompt and valid aspect ratio', { type: 'image', prompt: 'Test', 'aspect-ratio': 'horizontal' }]
    ])('should validate valid image element: %s', (_, element) => {
      const errors = validateImageElement(element, 'Test context');
      expect(errors).toHaveLength(0);
    });

    it.each([
      ['image without src or prompt', { type: 'image' }, 'either a source URL or AI prompt'],
      ['image with both src and prompt', { type: 'image', src: 'test.jpg', prompt: 'test' }, 'cannot have both source URL and AI prompt'],
      ['image with empty src and empty prompt', { type: 'image', src: '', prompt: '' }, 'either a source URL or AI prompt'],
      ['image with invalid model', { type: 'image', prompt: 'test', model: 'invalid-model' }, 'Invalid AI model'],
      ['image with invalid aspect ratio', { type: 'image', prompt: 'test', 'aspect-ratio': 'invalid' }, 'Invalid aspect ratio'],
      ['image with invalid src URL', { type: 'image', src: 'not-a-url' }, 'Invalid source URL format']
    ])('should reject invalid image element: %s', (_, element, expectedError) => {
      const errors = validateImageElement(element, 'Test context');
      expect(errors.some(e => e.includes(expectedError))).toBe(true);
    });

    it('should return empty errors for non-image elements', () => {
      const errors = validateImageElement({ type: 'video', src: 'test.mp4' }, 'Test');
      expect(errors).toHaveLength(0);
    });

    it('should handle null/undefined element', () => {
      const errors1 = validateImageElement(null, 'Test');
      const errors2 = validateImageElement(undefined, 'Test');
      expect(errors1).toHaveLength(0);
      expect(errors2).toHaveLength(0);
    });
  });

  describe('validateExportConfig', () => {
    it.each([
      ['valid webhook config', {
        destinations: [{ type: 'webhook', endpoint: 'https://example.com/webhook' }]
      }],
      ['valid FTP config', {
        destinations: [{ type: 'ftp', host: 'ftp.example.com', username: 'user', password: 'pass' }]
      }],
      ['valid email config', {
        destinations: [{ type: 'email', to: 'test@example.com' }]
      }],
      ['multiple destinations', {
        destinations: [
          { type: 'webhook', endpoint: 'https://example.com/webhook' },
          { type: 'email', to: 'test@example.com' }
        ]
      }]
    ])('should validate valid export config: %s', (_, config) => {
      const errors = validateExportConfig(config as ExportConfig);
      expect(errors).toHaveLength(0);
    });

    it.each([
      ['null config', null, 'Export config must be an object'],
      ['string config', 'invalid', 'Export config must be an object'],
      ['number config', 123, 'Export config must be an object'],
      ['missing destinations', {}, 'Export config must have a destinations array'],
      ['string destinations', { destinations: 'invalid' }, 'Destinations must be an array'],
      ['empty destinations', { destinations: [] }, 'At least one destination is required']
    ])('should reject invalid export config: %s', (_, config, expectedError) => {
      const errors = validateExportConfig(config as any);
      expect(errors.some(e => e.includes(expectedError))).toBe(true);
    });

    it('should validate individual destinations', () => {
      const config: ExportConfig = {
        destinations: [
          { type: 'webhook', endpoint: 'https://example.com' },
          { type: 'webhook' } as any,
          { type: 'ftp', host: 'ftp.example.com' } as any
        ]
      };

      const errors = validateExportConfig(config);
      expect(errors.some(e => e.includes('Missing required fields for webhook destination'))).toBe(true);
      expect(errors.some(e => e.includes('Missing required fields for ftp destination'))).toBe(true);
    });

    it('should provide context for multiple destinations', () => {
      const config: ExportConfig = {
        destinations: [
          { type: 'webhook', endpoint: 'https://example.com' },
          { type: 'email' } as any
        ]
      };

      const errors = validateExportConfig(config, 'Test export');
      expect(errors.some(e => e.includes('Test export: Destination 2'))).toBe(true);
    });
  });

  describe('validateExportDestination', () => {
    it.each([
      ['valid webhook', { type: 'webhook', endpoint: 'https://example.com' }],
      ['valid FTP', { type: 'ftp', host: 'ftp.example.com', username: 'user', password: 'pass' }],
      ['valid FTP with port', { type: 'ftp', host: 'ftp.example.com', port: 22, username: 'user', password: 'pass' }],
      ['valid email', { type: 'email', to: 'test@example.com' }],
      ['valid email with array recipients', { type: 'email', to: ['test1@example.com', 'test2@example.com'] }]
    ])('should validate valid destination: %s', (_, destination) => {
      const errors = validateExportDestination(destination as ExportDestination);
      expect(errors).toHaveLength(0);
    });

    it.each([
      ['null destination', null, 'Destination must be an object'],
      ['string destination', 'invalid', 'Destination must be an object'],
      ['missing type', { endpoint: 'https://example.com' }, 'Destination type is required'],
      ['invalid type', { type: 'invalid-type' }, 'Invalid destination type'],
      ['webhook missing endpoint', { type: 'webhook' }, 'Missing required fields for webhook destination'],
      ['webhook empty endpoint', { type: 'webhook', endpoint: '' }, 'Missing required fields for webhook destination'],
      ['webhook invalid URL', { type: 'webhook', endpoint: 'not-a-url' }, 'Invalid webhook endpoint URL format'],
      ['webhook non-https URL', { type: 'webhook', endpoint: 'http://example.com' }, 'Webhook endpoint must use HTTPS'],
      ['FTP missing host', { type: 'ftp', username: 'user', password: 'pass' }, 'Missing required fields for ftp destination'],
      ['FTP missing username', { type: 'ftp', host: 'ftp.example.com', password: 'pass' }, 'Missing required fields for ftp destination'],
      ['FTP missing password', { type: 'ftp', host: 'ftp.example.com', username: 'user' }, 'Missing required fields for ftp destination'],
      ['FTP invalid port high', { type: 'ftp', host: 'ftp.example.com', username: 'user', password: 'pass', port: 70000 }, 'FTP port must be between 1 and 65535'],
      ['FTP invalid remote path', { type: 'ftp', host: 'ftp.example.com', username: 'user', password: 'pass', 'remote-path': 'relative/path' }, 'Remote path must be absolute'],
      ['FTP path with ..', { type: 'ftp', host: 'ftp.example.com', username: 'user', password: 'pass', 'remote-path': '/uploads/../etc' }, 'Remote path must be absolute and not contain'],
      ['email missing recipient', { type: 'email' }, 'Missing required fields for email destination'],
      ['email empty recipient', { type: 'email', to: '' }, 'Missing required fields for email destination'],
      ['email invalid recipient', { type: 'email', to: 'invalid-email' }, 'Invalid email address'],
      ['email invalid sender', { type: 'email', to: 'test@example.com', from: 'invalid-email' }, 'Invalid sender email address']
    ])('should reject invalid destination: %s', (_, destination, expectedError) => {
      const errors = validateExportDestination(destination as any);
      expect(errors.some(e => e.includes(expectedError))).toBe(true);
    });

    it('should validate email array recipients', () => {
      const destination = {
        type: 'email',
        to: ['valid@example.com', 'invalid-email', 'another@example.com']
      };

      const errors = validateExportDestination(destination as any);
      expect(errors.some(e => e.includes('Invalid email address at index 2: invalid-email'))).toBe(true);
    });

    it('should provide context in error messages', () => {
      const destination = { type: 'webhook' };
      const errors = validateExportDestination(destination as any, 'Test context');
      expect(errors.some(e => e.includes('Test context:'))).toBe(true);
    });

    it('should handle edge cases', () => {
      const destinations = [
        { type: 'ftp', host: 'ftp.example.com', username: 'user', password: 'pass', 'remote-path': '/' },
        { type: 'email', to: '' }, // Empty string instead of empty array
        { type: 'webhook', endpoint: 'https://example.com' }
      ];

      destinations.forEach((dest, index) => {
        const errors = validateExportDestination(dest as any);
        if (index === 1) {
          expect(errors.some(e => e.includes('Missing required fields for email destination'))).toBe(true);
        } else {
          expect(errors).toHaveLength(0);
        }
      });
    });
  });

  describe('validateTextElementParams', () => {
    it.each([
      ['basic text', { text: 'Hello World' }],
      ['with font size', { text: 'Test', fontSize: 24 }],
      ['with font size string', { text: 'Test', fontSize: '24px' }],
      ['with font weight number', { text: 'Test', fontWeight: 400 }],
      ['with font weight string', { text: 'Test', fontWeight: '400' }],
      ['with colors', { text: 'Test', fontColor: '#ff0000', backgroundColor: 'rgba(0,0,0,0.5)' }],
      ['with transparent color', { text: 'Test', fontColor: 'transparent' }],
      ['with rgb color', { text: 'Test', fontColor: 'rgb(255,0,0)' }],
      ['with short hex color', { text: 'Test', fontColor: '#f00' }],
      ['with top-left position', { text: 'Test', position: 'top-left' }],
      ['with custom position', { text: 'Test', position: 'custom', x: 100, y: 200 }],
      ['with duration -1', { text: 'Test', duration: -1 }],
      ['with duration -2', { text: 'Test', duration: -2 }],
      ['with valid start time', { text: 'Test', start: 5 }],
      ['with text alignment', { text: 'Test', textAlign: 'center' }],
      ['with vertical position', { text: 'Test', verticalPosition: 'top' }],
      ['with horizontal position', { text: 'Test', horizontalPosition: 'center' }]
    ])('should validate valid text params: %s', (_, params) => {
      const errors = validateTextElementParams(params as TextElementParams);
      expect(errors).toHaveLength(0);
    });

    it.each([
      ['empty text', { text: '' }, 'Text content is required'],
      ['whitespace only text', { text: '   \t\n  ' }, 'Text content is required'],
      ['missing text', {}, 'Text content is required'],
      ['font size too small', { text: 'Test', fontSize: 0 }, 'Font size must be a number between 1 and 200'],
      ['font size too large', { text: 'Test', fontSize: 250 }, 'Font size must be a number between 1 and 200'],
      ['font size invalid string', { text: 'Test', fontSize: 'invalid' as any }, 'Font size must be a number between 1 and 200'],
      ['font size NaN from string', { text: 'Test', fontSize: 'notapxvalue' as any }, 'Font size must be a number between 1 and 200'],
      ['font weight too low', { text: 'Test', fontWeight: 50 }, 'Font weight must be a multiple of 100'],
      ['font weight too high', { text: 'Test', fontWeight: 950 }, 'Font weight must be a multiple of 100'],
      ['invalid font weight', { text: 'Test', fontWeight: 450 }, 'Font weight must be a multiple of 100'],
      ['font weight invalid string', { text: 'Test', fontWeight: 'invalid' as any }, 'Font weight must be a multiple of 100'],
      ['font weight NaN from string', { text: 'Test', fontWeight: 'notanumber' as any }, 'Font weight must be a multiple of 100'],
      ['invalid color format', { text: 'Test', fontColor: 'blue' }, 'fontColor must be a valid color'],
      ['invalid background color', { text: 'Test', backgroundColor: 'blue' }, 'backgroundColor must be a valid color'],
      ['custom position missing x', { text: 'Test', position: 'custom' }, 'X and Y coordinates are required'],
      ['custom position missing y', { text: 'Test', position: 'custom', x: 100 }, 'X and Y coordinates are required'],
      ['invalid text align', { text: 'Test', textAlign: 'invalid' as any }, 'Text align must be one of'],
      ['invalid vertical position', { text: 'Test', verticalPosition: 'middle' as any }, 'Vertical position must be one of'],
      ['invalid horizontal position', { text: 'Test', horizontalPosition: 'middle' as any }, 'Horizontal position must be one of'],
      ['invalid position', { text: 'Test', position: 'invalid-position' as any }, 'Position must be one of'],
      ['invalid duration', { text: 'Test', duration: -5 }, 'Duration must be a positive number'],
      ['negative start time', { text: 'Test', start: -1 }, 'Start time must be a non-negative number']
    ])('should reject invalid text params: %s', (_, params, expectedError) => {
      const errors = validateTextElementParams(params as TextElementParams);
      expect(errors.some(e => e.includes(expectedError))).toBe(true);
    });
  });

  describe('validateSubtitleElementParams', () => {
    it.each([
      ['with captions', { captions: 'SRT content' }],
      ['with src URL', { src: 'https://example.com/subs.srt' }],
      ['with text content', { text: 'Auto-generated' }],
      ['with language', { captions: 'Test', language: 'en' }],
      ['with language code', { captions: 'Test', language: 'en-US' }],
      ['with auto language', { captions: 'Test', language: 'auto' }],
      ['with position', { captions: 'Test', position: 'bottom-center' }],
      ['with font size', { captions: 'Test', fontSize: 18 }],
      ['with outline width', { captions: 'Test', outlineWidth: 2 }],
      ['with shadow offset', { captions: 'Test', shadowOffset: 3 }],
      ['with max words per line', { captions: 'Test', maxWordsPerLine: 5 }],
      ['with all colors', { captions: 'Test', wordColor: '#fff', lineColor: '#000', boxColor: 'rgba(0,0,0,0.5)', outlineColor: '#ff0000', shadowColor: 'transparent' }]
    ])('should validate valid subtitle params: %s', (_, params) => {
      const errors = validateSubtitleElementParams(params as SubtitleElementParams);
      expect(errors).toHaveLength(0);
    });

    it.each([
      ['no content source', {}, 'Either captions text, src URL, or text content is required'],
      ['empty captions', { captions: '' }, 'Either captions text, src URL, or text content is required'],
      ['whitespace captions', { captions: '   ' }, 'Either captions text, src URL, or text content is required'],
      ['empty src', { src: '' }, 'Either captions text, src URL, or text content is required'],
      ['whitespace src', { src: '   ' }, 'Either captions text, src URL, or text content is required'],
      ['empty text', { text: '' }, 'Either captions text, src URL, or text content is required'],
      ['whitespace text', { text: '   ' }, 'Either captions text, src URL, or text content is required'],
      ['multiple sources captions+src', { captions: 'test', src: 'test.srt' }, 'Cannot specify multiple subtitle sources'],
      ['multiple sources captions+text', { captions: 'test', text: 'test' }, 'Cannot specify multiple subtitle sources'],
      ['multiple sources src+text', { src: 'test.srt', text: 'test' }, 'Cannot specify multiple subtitle sources'],
      ['all three sources', { captions: 'test', src: 'test.srt', text: 'test' }, 'Cannot specify multiple subtitle sources'],
      ['invalid URL', { src: 'not-a-url' }, 'Subtitle src must be a valid URL'],
      ['invalid language format', { captions: 'test', language: 'invalid' }, 'Language must be in format'],
      ['invalid language too long', { captions: 'test', language: 'en-US-extra' }, 'Language must be in format'],
      ['invalid position', { captions: 'test', position: 'invalid-pos' as any }, 'Position must be one of'],
      ['font size too small', { captions: 'test', fontSize: 0 }, 'Font size must be a number between 1 and 200'],
      ['font size too large', { captions: 'test', fontSize: 250 }, 'Font size must be a number between 1 and 200'],
      ['font size not number', { captions: 'test', fontSize: 'invalid' as any }, 'Font size must be a number between 1 and 200'],
      ['outline width negative', { captions: 'test', outlineWidth: -1 }, 'Outline width must be a number between 0 and 10'],
      ['outline width too large', { captions: 'test', outlineWidth: 15 }, 'Outline width must be a number between 0 and 10'],
      ['outline width not number', { captions: 'test', outlineWidth: 'invalid' as any }, 'Outline width must be a number between 0 and 10'],
      ['shadow offset negative', { captions: 'test', shadowOffset: -1 }, 'Shadow offset must be a number between 0 and 10'],
      ['shadow offset too large', { captions: 'test', shadowOffset: 15 }, 'Shadow offset must be a number between 0 and 10'],
      ['shadow offset not number', { captions: 'test', shadowOffset: 'invalid' as any }, 'Shadow offset must be a number between 0 and 10'],
      ['max words too small', { captions: 'test', maxWordsPerLine: 0 }, 'Max words per line must be a number between 1 and 20'],
      ['max words too large', { captions: 'test', maxWordsPerLine: 25 }, 'Max words per line must be a number between 1 and 20'],
      ['max words not number', { captions: 'test', maxWordsPerLine: 'invalid' as any }, 'Max words per line must be a number between 1 and 20'],
      ['invalid wordColor', { captions: 'test', wordColor: 'blue' }, 'wordColor must be a valid color'],
      ['invalid lineColor', { captions: 'test', lineColor: 'blue' }, 'lineColor must be a valid color'],
      ['invalid boxColor', { captions: 'test', boxColor: 'blue' }, 'boxColor must be a valid color'],
      ['invalid outlineColor', { captions: 'test', outlineColor: 'blue' }, 'outlineColor must be a valid color'],
      ['invalid shadowColor', { captions: 'test', shadowColor: 'blue' }, 'shadowColor must be a valid color']
    ])('should reject invalid subtitle params: %s', (_, params, expectedError) => {
      const errors = validateSubtitleElementParams(params as SubtitleElementParams);
      expect(errors.some(e => e.includes(expectedError))).toBe(true);
    });
  });

  describe('validateMovieElements', () => {
    it.each([
      ['subtitles', { type: 'subtitles', captions: 'Test' }],
      ['audio', { type: 'audio', src: 'https://test.com/audio.mp3' }],
      ['text', { type: 'text', text: 'Movie title' }],
      ['voice', { type: 'voice', text: 'Narration' }]
    ])('should validate valid movie element: %s', (_, element) => {
      const errors = validateMovieElements([element]);
      expect(errors).toHaveLength(0);
    });

    it.each([
      ['video', { type: 'video', src: 'test.mp4' }],
      ['image', { type: 'image', src: 'test.jpg' }],
      ['component', { type: 'component', component: 'test' }],
      ['html', { type: 'html', html: '<p>test</p>' }],
      ['audiogram', { type: 'audiogram', src: 'test.mp3' }]
    ])('should reject scene-only element at movie level: %s', (elementType, element) => {
      const errors = validateMovieElements([element]);
      expect(errors.some(e => e.includes(`'${elementType}' is not allowed at movie level`))).toBe(true);
    });

    it.each([
      ['non-array input', null, 'Movie elements must be an array'],
      ['non-array string', 'invalid', 'Movie elements must be an array'],
      ['null element', [null], 'Element must be an object'],
      ['string element', ['invalid'], 'Element must be an object'],
      ['missing type', [{}], 'Element type is required'],
      ['invalid type', [{ type: 'invalid' }], 'not allowed at movie level'],
      ['missing required fields', [{ type: 'text' }], 'Missing required fields'],
      ['empty required field', [{ type: 'text', text: '' }], 'Missing required fields'],
      ['valid element', [{ type: 'text', text: 'Valid text' }], '']
    ])('should handle various input scenarios: %s', (_, input, expectedError) => {
      const errors = validateMovieElements(input as any);
      if (expectedError === '') {
        expect(errors).toHaveLength(0);
      } else {
        expect(errors.some(e => e.includes(expectedError))).toBe(true);
      }
    });

    it('should validate text and subtitle element properties', () => {
      const elementsWithErrors = [
        { type: 'text', text: 'Valid text', fontSize: 0 },
        { type: 'subtitles' }
      ];
      const errors = validateMovieElements(elementsWithErrors);
      expect(errors.some(e => e.includes('Font size must be a number between 1 and 200'))).toBe(true);
      expect(errors.some(e => e.includes('Either captions text, src URL, or text content is required'))).toBe(true);
    });

    it('should validate subtitles with text field', () => {
      const elements = [{ type: 'subtitles', text: 'Valid subtitle text' }];
      const errors = validateMovieElements(elements);
      expect(errors).toHaveLength(0);
    });

    it('should call validateCommonElementFields for all elements', () => {
      const elements = [
        { type: 'text', text: 'Test', duration: -5 },
        { type: 'audio', src: 'test.mp3', volume: 15 }
      ];
      const errors = validateMovieElements(elements);
      expect(errors.some(e => e.includes('Duration must be a positive number'))).toBe(true);
      expect(errors.some(e => e.includes('Volume must be a number between'))).toBe(true);
    });
  });

  describe('validateSceneElements', () => {
    it.each([
      ['video', { type: 'video', src: 'https://test.com/video.mp4' }],
      ['audio', { type: 'audio', src: 'https://test.com/audio.mp3' }],
      ['image with src', { type: 'image', src: 'https://test.com/image.jpg' }],
      ['image with prompt', { type: 'image', prompt: 'A beautiful sunset' }],
      ['text', { type: 'text', text: 'Scene text' }],
      ['voice', { type: 'voice', text: 'Narration' }],
      ['component', { type: 'component', component: 'test-component' }],
      ['html with src', { type: 'html', src: 'https://example.com/page.html' }],
      ['html with content', { type: 'html', html: '<p>Test HTML</p>' }],
      ['audiogram', { type: 'audiogram', src: 'https://test.com/audio.mp3' }]
    ])('should validate valid scene element: %s', (_, element) => {
      const errors = validateSceneElements([element]);
      expect(errors).toHaveLength(0);
    });

    it.each([
      ['subtitles in scene', { type: 'subtitles', captions: 'test' }, 'Subtitles can only be added at movie level'],
      ['invalid video URL', { type: 'video', src: 'not-a-url' }, 'Invalid URL for video source'],
      ['invalid audio URL', { type: 'audio', src: 'not-a-url' }, 'Invalid URL for audio source'],
      ['missing component ID', { type: 'component' }, 'Component ID is required'],
      ['empty component ID', { type: 'component', component: '' }, 'Component ID is required'],
      ['whitespace component ID', { type: 'component', component: '   ' }, 'Component ID is required'],
      ['html without src or content', { type: 'html' }, 'HTML elements require either source URL or HTML content'],
      ['html with empty src and content', { type: 'html', src: '', html: '' }, 'HTML elements require either source URL or HTML content'],
      ['html with invalid src URL', { type: 'html', src: 'not-a-url' }, 'Invalid URL for HTML source'],
      ['voice without text', { type: 'voice' }, 'Text content is required for voice elements'],
      ['voice with empty text', { type: 'voice', text: '' }, 'Text content is required for voice elements'],
      ['voice with whitespace text', { type: 'voice', text: '   ' }, 'Text content is required for voice elements'],
      ['voice with invalid model', { type: 'voice', text: 'test', model: 'invalid-model' }, 'Invalid TTS model']
    ])('should reject invalid scene element: %s', (_, element, expectedError) => {
      const errors = validateSceneElements([element]);
      expect(errors.some(e => e.includes(expectedError))).toBe(true);
    });

    it.each([
      ['non-array', {}, '', 'Scene elements must be an array'],
      ['non-array with context', {}, 'Scene 1', 'Scene 1: Scene elements must be an array'],
      ['non-object element', ['string'], '', 'Element must be an object'],
      ['missing type', [{}], '', 'Element type is required'],
      ['invalid element type', [{ type: 'invalid-type' }], '', 'not allowed at scene level'],
      ['missing required fields', [{ type: 'text' }], '', 'Missing required fields'],
      ['empty required field', [{ type: 'text', text: '' }], '', 'Missing required fields'],
      ['valid element', [{ type: 'text', text: 'Valid scene text' }], '', '']
    ])('should handle edge cases: %s', (_, elements, context, expectedError) => {
      const errors = validateSceneElements(elements as any, context);
      if (expectedError === '') {
        expect(errors).toHaveLength(0);
      } else {
        expect(errors.some(e => e.includes(expectedError))).toBe(true);
      }
    });

    it('should validate text element properties in scenes', () => {
      const elements = [{ type: 'text', text: 'Valid text', fontSize: 300 }];
      const errors = validateSceneElements(elements);
      expect(errors.some(e => e.includes('Font size must be a number between 1 and 200'))).toBe(true);
    });

    it('should call validateImageElement for image elements', () => {
      const elements = [{ type: 'image' }];
      const errors = validateSceneElements(elements);
      expect(errors.some(e => e.includes('either a source URL or AI prompt'))).toBe(true);
    });

    it('should call validateCommonElementFields for all elements', () => {
      const elements = [
        { type: 'video', src: 'https://test.com/video.mp4', 'z-index': 200 },
        { type: 'text', text: 'test', position: 'custom' }
      ];
      const errors = validateSceneElements(elements);
      expect(errors.some(e => e.includes('Z-index must be a number between'))).toBe(true);
      expect(errors.some(e => e.includes('X and Y coordinates are required'))).toBe(true);
    });
  });

  describe('validateJSON2VideoRequest', () => {
    const validElement = { type: 'video', src: 'https://test.com/video.mp4' };

    it.each([
      ['minimal request', { scenes: [{ elements: [validElement] }] }],
      ['with dimensions', { width: 1920, height: 1080, scenes: [{ elements: [validElement] }] }],
      ['with quality', { quality: 'high', scenes: [{ elements: [validElement] }] }],
      ['with custom resolution', { resolution: 'custom', width: 1920, height: 1080, scenes: [{ elements: [validElement] }] }],
      ['with movie elements', {
        elements: [{ type: 'subtitles', captions: 'test' }],
        scenes: [{ elements: [validElement] }]
      }],
      ['with scene duration', {
        scenes: [{
          elements: [validElement],
          duration: 10
        }]
      }],
      ['with scene background color', {
        scenes: [{
          elements: [validElement],
          'background-color': '#ffffff'
        }]
      }],
      ['with exports', {
        scenes: [{ elements: [validElement] }],
        exports: [{ destinations: [{ type: 'webhook', endpoint: 'https://example.com' }] }]
      }]
    ])('should validate valid request: %s', (_, request) => {
      const result = validateJSON2VideoRequest(request);
      expect(result.isValid).toBe(true);
    });

    it.each([
      ['null request', null, 'Request must be an object'],
      ['string request', 'invalid', 'Request must be an object'],
      ['missing scenes', {}, 'Missing required field: scenes'],
      ['non-array scenes', { scenes: 'invalid' }, 'Scenes must be an array'],
      ['width NaN', { width: NaN, scenes: [{ elements: [validElement] }] }, 'width must be a number'],
      ['width string', { width: 'invalid', scenes: [{ elements: [validElement] }] }, 'width must be a number'],
      ['width below minimum', { width: 30, scenes: [{ elements: [validElement] }] }, 'width must be between'],
      ['width above maximum', { width: 5000, scenes: [{ elements: [validElement] }] }, 'width must be between'],
      ['height NaN', { height: NaN, scenes: [{ elements: [validElement] }] }, 'height must be a number'],
      ['height out of range', { height: 5000, scenes: [{ elements: [validElement] }] }, 'height must be between'],
      ['invalid quality', { quality: 'ultra', scenes: [{ elements: [validElement] }] }, 'Quality must be one of'],
      ['invalid resolution', { resolution: 'ultra-hd', scenes: [{ elements: [validElement] }] }, 'Resolution must be one of'],
      ['custom resolution missing width', { resolution: 'custom', scenes: [{ elements: [validElement] }] }, 'Width is required when resolution is "custom"'],
      ['custom resolution missing height', { resolution: 'custom', width: 1920, scenes: [{ elements: [validElement] }] }, 'Height is required when resolution is "custom"']
    ])('should reject invalid request: %s', (_, request, expectedError) => {
      const result = validateJSON2VideoRequest(request as any);
      expect(result.errors.some(e => e.includes(expectedError))).toBe(true);
    });

    it.each([
      ['empty scenes array', { scenes: [] }, 'No scenes defined - video will be empty', 'warning'],
      ['invalid scene object', { scenes: [null] }, 'Scene must be an object', 'error'],
      ['scene missing elements', { scenes: [{}] }, 'Missing required field: elements', 'error'],
      ['invalid scene duration', { scenes: [{ elements: [validElement], duration: -5 }] }, 'Duration must be a positive number', 'error'],
      ['scene duration -1 valid', { scenes: [{ elements: [validElement], duration: -1 }] }, '', 'valid'],
      ['scene duration -2 valid', { scenes: [{ elements: [validElement], duration: -2 }] }, '', 'valid'],
      ['invalid background color', {
        scenes: [{
          elements: [validElement],
          'background-color': 'invalid-color'
        }]
      }, 'Invalid background color format', 'error']
    ])('should handle specific validation cases: %s', (_, request, expectedError, errorType) => {
      const result = validateJSON2VideoRequest(request as any);
      if (errorType === 'warning') {
        expect(result.warnings.some(w => w.includes(expectedError))).toBe(true);
      } else if (errorType === 'valid') {
        expect(result.isValid).toBe(true);
      } else {
        expect(result.errors.some(e => e.includes(expectedError))).toBe(true);
      }
    });

    it('should validate movie elements in request', () => {
      const request = {
        elements: [{ type: 'text', text: 'Valid text', fontSize: 0 }],
        scenes: [{ elements: [validElement] }]
      };
      const result = validateJSON2VideoRequest(request);
      expect(result.errors.some(e => e.includes('Font size must be a number between 1 and 200'))).toBe(true);
    });

    it('should detect subtitles in scenes', () => {
      const request = {
        scenes: [{
          elements: [
            validElement,
            { type: 'subtitles', captions: 'test' }
          ]
        }]
      };
      const result = validateJSON2VideoRequest(request);
      expect(result.errors.some(e => e.includes('Subtitles can only be added at movie level'))).toBe(true);
    });

    it('should validate exports configuration', () => {
      const requestWithValidExports = {
        scenes: [{ elements: [validElement] }],
        exports: [{ destinations: [{ type: 'webhook', endpoint: 'https://example.com' }] }]
      };

      const result1 = validateJSON2VideoRequest(requestWithValidExports);
      expect(result1.isValid).toBe(true);

      const requestWithInvalidExports = {
        scenes: [{ elements: [validElement] }],
        exports: 'invalid'
      };

      const result2 = validateJSON2VideoRequest(requestWithInvalidExports as any);
      expect(result2.errors.some(e => e.includes('Exports must be an array'))).toBe(true);
    });

    it('should warn about multiple export configs', () => {
      const request = {
        scenes: [{ elements: [validElement] }],
        exports: [
          { destinations: [{ type: 'webhook', endpoint: 'https://example.com' }] },
          { destinations: [{ type: 'email', to: 'test@example.com' }] }
        ]
      };

      const result = validateJSON2VideoRequest(request);
      expect(result.warnings.some(w => w.includes('Currently only one export configuration is supported'))).toBe(true);
    });

    it('should validate scenes with complex nested structures', () => {
      const request = {
        elements: [{ type: 'subtitles', captions: 'Movie subtitles' }],
        scenes: [
          {
            elements: [validElement],
            duration: 10,
            'background-color': '#ff0000',
            transition: { style: 'fade', duration: 0.5 }
          },
          {
            elements: [{ type: 'text', text: 'Scene 2 text' }]
          }
        ]
      };
      const result = validateJSON2VideoRequest(request);
      expect(result.isValid).toBe(true);
    });
  });

  describe('Common Element Field Validation', () => {
    it.each([
      ['invalid duration', { duration: -3 }, 'Duration must be a positive number, -1 (intrinsic), or -2 (match container)'],
      ['negative start time', { start: -1 }, 'Start time must be a non-negative number'],
      ['start time not number', { start: 'invalid' }, 'Start time must be a non-negative number'],
      ['invalid z-index type', { 'z-index': 'invalid' }, 'Z-index must be a number between'],
      ['z-index too low', { 'z-index': -200 }, 'Z-index must be a number between'],
      ['z-index too high', { 'z-index': 200 }, 'Z-index must be a number between'],
      ['invalid volume type', { volume: 'loud' }, 'Volume must be a number between'],
      ['volume too low', { volume: -5 }, 'Volume must be a number between'],
      ['volume too high', { volume: 25 }, 'Volume must be a number between'],
      ['invalid position', { position: 'somewhere' }, 'Invalid position. Must be one of'],
      ['custom position missing x', { position: 'custom', y: 200 }, 'X and Y coordinates are required'],
      ['custom position missing y', { position: 'custom', x: 100 }, 'X and Y coordinates are required'],
      ['negative fade-in', { 'fade-in': -1 }, 'Fade-in must be a non-negative number'],
      ['fade-in not number', { 'fade-in': 'invalid' }, 'Fade-in must be a non-negative number'],
      ['negative fade-out', { 'fade-out': -2 }, 'Fade-out must be a non-negative number'],
      ['fade-out not number', { 'fade-out': 'invalid' }, 'Fade-out must be a non-negative number']
    ])('should validate common field: %s', (_, extraFields, expectedError) => {
      const element = {
        type: 'video',
        src: 'https://test.com/video.mp4',
        ...extraFields
      };

      const errors = validateSceneElements([element]);
      expect(errors.some(e => e.includes(expectedError))).toBe(true);
    });

    it.each([
      ['valid common fields', {
        duration: 5,
        start: 0,
        'z-index': 5,
        volume: 0.8,
        position: 'center-center',
        'fade-in': 1,
        'fade-out': 1
      }],
      ['valid custom position', {
        position: 'custom',
        x: 100,
        y: 200
      }]
    ])('should accept %s', (_, extraFields) => {
      const element = {
        type: 'video',
        src: 'https://test.com/video.mp4',
        ...extraFields
      };

      const errors = validateSceneElements([element]);
      expect(errors).toHaveLength(0);
    });

    it('should validate crop object fields', () => {
      const element = {
        type: 'video',
        src: 'https://test.com/video.mp4',
        crop: { width: -1, height: 0 }
      };

      const errors = validateSceneElements([element]);
      expect(errors.some(e => e.includes('Crop width must be a positive number'))).toBe(true);
      expect(errors.some(e => e.includes('Crop height must be a positive number'))).toBe(true);
    });

    it('should handle crop object validation errors', () => {
      const elementWithProblematicCrop = {
        type: 'video',
        src: 'https://test.com/video.mp4',
        crop: {
          get width() {
            throw new Error('Property access error');
          },
          height: 100
        }
      };

      const errors = validateSceneElements([elementWithProblematicCrop]);
      expect(errors.some(e => e.includes('Invalid crop object structure'))).toBe(true);
    });
  });

  describe('Helper Function Coverage', () => {
    it('should test isValidUrl with various inputs', () => {
      const elements = [
        { type: 'video', src: 'https://example.com/video.mp4' },
        { type: 'video', src: 'not-a-url' },
        { type: 'audio', src: 'not-a-url' }
      ];

      elements.forEach(element => {
        const errors = validateSceneElements([element]);
        if (element.src === 'not-a-url') {
          expect(errors.length).toBeGreaterThan(0);
        } else {
          expect(errors).toHaveLength(0);
        }
      });
    });

    it('should cover remaining edge cases for 100% coverage', () => {
      const imageElementErrors = validateImageElement({ type: 'image' });
      expect(imageElementErrors.some(e => e.includes('either a source URL or AI prompt'))).toBe(true);

      const requestWithNestedSubtitles = {
        elements: [{ type: 'subtitles', captions: 'Movie level' }],
        scenes: [
          {
            elements: [
              { type: 'video', src: 'https://test.com/video.mp4' },
              { type: 'subtitles', captions: 'Scene level - should error' }
            ]
          }
        ]
      };

      const result = validateJSON2VideoRequest(requestWithNestedSubtitles);
      expect(result.errors.some(e => e.includes('Subtitles must be at movie level, not in scenes'))).toBe(true);
    });

    it('should test isValidColor with various inputs', () => {
      const colors = [
        '#ff0000',
        'rgba(255,0,0,0.5)',
        'transparent',
        'invalid-color'
      ];

      colors.forEach(color => {
        const request = {
          scenes: [{
            elements: [{ type: 'video', src: 'https://test.com/video.mp4' }],
            'background-color': color
          }]
        };

        const result = validateJSON2VideoRequest(request);

        if (color === 'invalid-color') {
          expect(result.errors.length).toBeGreaterThan(0);
        } else {
          expect(result.errors).toHaveLength(0);
        }
      });
    });

    it('should test isValidEmail with various inputs', () => {
      const emailTests = [
        { email: 'valid@example.com', shouldBeValid: true },
        { email: 'also.valid@example.co.uk', shouldBeValid: true },
        { email: 'invalid-email', shouldBeValid: false },
        { email: 'missing@domain', shouldBeValid: false },
        { email: '@missinglocal.com', shouldBeValid: false },
        { email: 'spaces @domain.com', shouldBeValid: false }
      ];

      emailTests.forEach(({ email, shouldBeValid }) => {
        const destination = { type: 'email', to: email };
        const errors = validateExportDestination(destination as any);

        if (shouldBeValid) {
          expect(errors).toHaveLength(0);
        } else {
          expect(errors.some(e => e.includes('Invalid email address'))).toBe(true);
        }
      });
    });
  });

  describe('Edge Cases and Error Paths', () => {
    it.each([
      ['validateJSON2VideoRequest with null', () => validateJSON2VideoRequest(null)],
      ['validateMovieElements with null', () => validateMovieElements(null as any)],
      ['validateSceneElements with null', () => validateSceneElements(null as any)]
    ])('should handle null inputs gracefully: %s', (_, testFn) => {
      expect(testFn).not.toThrow();
    });

    it('should handle null params in text validation', () => {
      expect(() => validateTextElementParams(null as any)).toThrow('Cannot read properties of null');
    });

    it('should handle null params in subtitle validation', () => {
      expect(() => validateSubtitleElementParams(null as any)).toThrow('Cannot read properties of null');
    });

    it.each([
      [-1, true],
      [-2, true],
      [5, true],
      [0.1, true],
      [-5, false],
      [0, false]
    ])('should validate duration special values: %d (valid: %s)', (duration, shouldBeValid) => {
      const request = {
        scenes: [{
          elements: [{
            type: 'video',
            src: 'https://test.com/video.mp4',
            duration
          }]
        }]
      };

      const result = validateJSON2VideoRequest(request);
      expect(result.isValid).toBe(shouldBeValid);
    });

    it.each([
      ['valid colors', ['#ff0000', '#f00', 'rgb(255,0,0)', 'rgba(255,0,0,0.5)', 'transparent'], false],
      ['invalid colors', ['blue', 'red', 'green', 'yellow', 'invalid-color'], true]
    ])('should validate color formats: %s', (_, colors, shouldHaveError) => {
      colors.forEach(color => {
        const params: SubtitleElementParams = {
          captions: 'Test',
          wordColor: color
        };
        const errors = validateSubtitleElementParams(params);
        expect(errors.some(e => e.includes('wordColor must be a valid color'))).toBe(shouldHaveError);
      });
    });

    it('should handle various field type scenarios', () => {
      const testCases = [
        { type: 'text', text: undefined },
        { type: 'text', text: null },
        { type: 'text', text: '' },
        { type: 'text', text: '   ' },
        { type: 'text', text: 'valid' },
        { type: 'subtitles', captions: '', src: '', text: '' },
        { type: 'subtitles', captions: null, src: null, text: null },
        { type: 'subtitles', captions: undefined, src: undefined, text: undefined },
        { type: 'audio', src: '' },
        { type: 'audio', src: null },
        { type: 'audio', src: undefined },
        { type: 'voice', text: '' },
        { type: 'voice', text: null },
        { type: 'voice', text: undefined }
      ];

      testCases.forEach(element => {
        const movieErrors = validateMovieElements([element]);
        expect(Array.isArray(movieErrors)).toBe(true);

        if (element.type !== 'subtitles') {
          const sceneErrors = validateSceneElements([element]);
          expect(Array.isArray(sceneErrors)).toBe(true);
        }
      });
    });

    it('should validate all subtitle color fields', () => {
      const colorFields = ['wordColor', 'lineColor', 'boxColor', 'outlineColor', 'shadowColor'];

      colorFields.forEach(field => {
        const params = {
          captions: 'Test',
          [field]: 'invalid-color'
        };

        const errors = validateSubtitleElementParams(params as any);
        expect(errors.some(e => e.includes(`${field} must be a valid color`))).toBe(true);
      });
    });

    it('should handle numeric validation edge cases', () => {
      const numericTests: Array<{ [key: string]: any; isValid: boolean }> = [
        { fontSize: '24px', isValid: true },
        { fontSize: 'invalid', isValid: false },
        { fontSize: NaN, isValid: false },
        { fontWeight: '400', isValid: true },
        { fontWeight: 'invalid', isValid: false },
        { fontWeight: NaN, isValid: false }
      ];

      numericTests.forEach(test => {
        const { isValid, ...params } = test;
        const fullParams = { text: 'Test', ...params };

        const errors = validateTextElementParams(fullParams as any);
        if (isValid) {
          expect(errors).toHaveLength(0);
        } else {
          expect(errors.length).toBeGreaterThan(0);
        }
      });
    });

    it('should test various validation error messages', () => {
      const errorTests = [
        { params: { text: '' }, expectedIncludes: 'Text content is required' },
        { params: { text: 'test', fontSize: 0 }, expectedIncludes: 'Font size must be a number between 1 and 200' },
        { params: { text: 'test', fontWeight: 50 }, expectedIncludes: 'Font weight must be a multiple of 100' },
        { params: { text: 'test', fontColor: 'blue' }, expectedIncludes: 'fontColor must be a valid color' },
        { params: { text: 'test', backgroundColor: 'blue' }, expectedIncludes: 'backgroundColor must be a valid color' },
        { params: { text: 'test', position: 'custom' }, expectedIncludes: 'X and Y coordinates are required' },
        { params: { text: 'test', textAlign: 'invalid' }, expectedIncludes: 'Text align must be one of' },
        { params: { text: 'test', verticalPosition: 'invalid' }, expectedIncludes: 'Vertical position must be one of' },
        { params: { text: 'test', horizontalPosition: 'invalid' }, expectedIncludes: 'Horizontal position must be one of' },
        { params: { text: 'test', position: 'invalid' }, expectedIncludes: 'Position must be one of' },
        { params: { text: 'test', duration: -5 }, expectedIncludes: 'Duration must be a positive number' },
        { params: { text: 'test', start: -1 }, expectedIncludes: 'Start time must be a non-negative number' }
      ];

      errorTests.forEach(test => {
        const errors = validateTextElementParams(test.params as any);
        expect(errors.some(e => e.includes(test.expectedIncludes))).toBe(true);
      });
    });

    it('should handle export validation with different error conditions', () => {
      const testCases = [
        { exportConfig: { destinations: 'invalid' }, errorIncludes: 'Destinations must be an array' },
        { exportConfig: { destinations: undefined }, errorIncludes: 'Export config must have a destinations array' },
        { exportConfig: { destinations: [null] }, errorIncludes: 'Destination must be an object' },
        { exportConfig: { destinations: [undefined] }, errorIncludes: 'Destination must be an object' },
        { exportConfig: { destinations: ['string'] }, errorIncludes: 'Destination must be an object' },
        { exportConfig: { destinations: [42] }, errorIncludes: 'Destination must be an object' },
        { exportConfig: { destinations: [{}] }, errorIncludes: 'Destination type is required' },
        { exportConfig: { destinations: [{ endpoint: 'test' }] }, errorIncludes: 'Destination type is required' },
        { exportConfig: { destinations: [{ type: 'invalid' }] }, errorIncludes: 'Invalid destination type' },
        { exportConfig: { destinations: [{ type: 123 }] }, errorIncludes: 'Invalid destination type' },
      ];

      testCases.forEach(({ exportConfig, errorIncludes }) => {
        const errors = validateExportConfig(exportConfig as any);
        expect(errors.some(e => e.includes(errorIncludes))).toBe(true);
      });
    });

    it('should handle destination validation edge cases', () => {
      const destinations = [
        { dest: { type: 'webhook', endpoint: 'http://example.com' }, error: 'Webhook endpoint must use HTTPS' },
        { dest: { type: 'webhook', endpoint: 'invalid-url' }, error: 'Invalid webhook endpoint URL format' },
        { dest: { type: 'ftp', host: 'ftp.example.com', username: 'user', password: 'pass', port: '22' }, error: 'FTP port must be between 1 and 65535' },
        { dest: { type: 'ftp', host: 'ftp.example.com', username: 'user', password: 'pass', 'remote-path': 'no-slash' }, error: 'Remote path must be absolute' },
        { dest: { type: 'email', to: 'test@example.com', from: 'bad-email' }, error: 'Invalid sender email address' },
        { dest: { type: 'email', to: ['good@example.com', 'bad-email'] }, error: 'Invalid email address at index 2: bad-email' },
      ];

      destinations.forEach(({ dest, error }) => {
        const errors = validateExportDestination(dest as any);
        expect(errors.some(e => e.includes(error))).toBe(true);
      });
    });
  });
});