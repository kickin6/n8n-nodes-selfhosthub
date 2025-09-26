// __tests__/nodes/CreateJ2vMovie/schema/schema.test.ts

import {
  JSON2VideoRequest,
  ExportConfig,
  WebhookDestination,
  FtpDestination,
  EmailDestination,
  Scene,
  VideoElement,
  ImageElement,
  TextSettings,
  SubtitleSettings,
  API_RULES,
  isMovieElement,
  isSceneElement,
  isSubtitleElement,
  isTextElement,
  isHtmlElement,
  isWebhookDestination,
  isFtpDestination,
  isEmailDestination,
  hasRequiredFields,
  hasRequiredExportFields,
  isValidDuration,
  isValidPosition,
  isValidWait,
  isValidFtpPort,
} from '../../../../nodes/CreateJ2vMovie/schema/schema';

describe('schema', () => {
  describe('JSON2VideoRequest interface', () => {
    it('should allow valid request structure', () => {
      const request: JSON2VideoRequest = {
        scenes: [
          {
            elements: [
              {
                type: 'video',
                src: 'test.mp4',
              }
            ]
          }
        ]
      };
      expect(request).toBeDefined();
      expect(request.scenes).toHaveLength(1);
    });

    it('should allow optional properties', () => {
      const request: JSON2VideoRequest = {
        id: 'test-id',
        width: 1920,
        height: 1080,
        quality: 'high',
        cache: true,
        comment: 'test comment',
        variables: { test: 'value' },
        elements: [],
        exports: [],
        scenes: []
      };
      expect(request.id).toBe('test-id');
      expect(request.width).toBe(1920);
      expect(request.height).toBe(1080);
    });
  });

  describe('ExportConfig interface', () => {
    it('should allow valid export configuration with destinations', () => {
      const exportConfig: ExportConfig = {
        destinations: [
          {
            type: 'webhook',
            endpoint: 'https://example.com/webhook'
          }
        ]
      };
      expect(exportConfig.destinations).toHaveLength(1);
      expect(exportConfig.destinations[0].type).toBe('webhook');
    });

    it('should allow multiple destinations', () => {
      const exportConfig: ExportConfig = {
        destinations: [
          {
            type: 'webhook',
            endpoint: 'https://example.com/webhook'
          },
          {
            type: 'email',
            to: 'test@example.com'
          }
        ]
      };
      expect(exportConfig.destinations).toHaveLength(2);
    });
  });

  describe('export destination interfaces', () => {
    describe('WebhookDestination', () => {
      it('should allow valid webhook destination', () => {
        const webhook: WebhookDestination = {
          type: 'webhook',
          endpoint: 'https://example.com/webhook'
        };
        expect(webhook.type).toBe('webhook');
        expect(webhook.endpoint).toBe('https://example.com/webhook');
      });
    });

    describe('FtpDestination', () => {
      it('should allow valid FTP destination with required fields', () => {
        const ftp: FtpDestination = {
          type: 'ftp',
          host: 'ftp.example.com',
          username: 'user',
          password: 'pass'
        };
        expect(ftp.type).toBe('ftp');
        expect(ftp.host).toBe('ftp.example.com');
      });

      it('should allow optional FTP fields', () => {
        const ftp: FtpDestination = {
          type: 'ftp',
          host: 'ftp.example.com',
          port: 21,
          username: 'user',
          password: 'pass',
          'remote-path': '/uploads',
          file: 'video.mp4',
          secure: true
        };
        expect(ftp.port).toBe(21);
        expect(ftp['remote-path']).toBe('/uploads');
        expect(ftp.secure).toBe(true);
      });
    });

    describe('EmailDestination', () => {
      it('should allow valid email destination with required fields', () => {
        const email: EmailDestination = {
          type: 'email',
          to: 'recipient@example.com'
        };
        expect(email.type).toBe('email');
        expect(email.to).toBe('recipient@example.com');
      });

      it('should allow email destination with multiple recipients', () => {
        const email: EmailDestination = {
          type: 'email',
          to: ['user1@example.com', 'user2@example.com']
        };
        expect(Array.isArray(email.to)).toBe(true);
        expect(email.to).toHaveLength(2);
      });

      it('should allow optional email fields', () => {
        const email: EmailDestination = {
          type: 'email',
          to: 'recipient@example.com',
          from: 'sender@example.com',
          subject: 'Your video',
          message: 'Video is ready'
        };
        expect(email.from).toBe('sender@example.com');
        expect(email.subject).toBe('Your video');
      });
    });
  });

  describe('Scene interface', () => {
    it('should allow valid scene structure', () => {
      const scene: Scene = {
        elements: [
          {
            type: 'video',
            src: 'test.mp4'
          }
        ]
      };
      expect(scene.elements).toHaveLength(1);
    });

    it('should allow optional scene properties', () => {
      const scene: Scene = {
        id: 'scene-1',
        duration: 10,
        'background-color': '#000000',
        comment: 'test scene',
        condition: 'true',
        cache: true,
        variables: { test: 'value' },
        elements: []
      };
      expect(scene.id).toBe('scene-1');
      expect(scene.duration).toBe(10);
    });
  });

  describe('element interfaces', () => {
    describe('VideoElement', () => {
      it('should allow valid video element', () => {
        const video: VideoElement = {
          type: 'video',
          src: 'test.mp4'
        };
        expect(video.type).toBe('video');
        expect(video.src).toBe('test.mp4');
      });

      it('should allow video element with all properties', () => {
        const video: VideoElement = {
          type: 'video',
          src: 'test.mp4',
          seek: 5,
          volume: 0.8,
          muted: false,
          loop: 2,
          position: 'center-center',
          x: 100,
          y: 50,
          width: 640,
          height: 480
        };
        expect(video.seek).toBe(5);
        expect(video.volume).toBe(0.8);
        expect(video.position).toBe('center-center');
      });
    });

    describe('ImageElement', () => {
      it('should allow image element with src', () => {
        const image: ImageElement = {
          type: 'image',
          src: 'test.jpg'
        };
        expect(image.type).toBe('image');
        expect(image.src).toBe('test.jpg');
      });

      it('should allow image element with AI generation', () => {
        const image: ImageElement = {
          type: 'image',
          prompt: 'Beautiful sunset',
          model: 'flux-pro',
          'aspect-ratio': 'horizontal',
          connection: 'ai-connection'
        };
        expect(image.prompt).toBe('Beautiful sunset');
        expect(image.model).toBe('flux-pro');
        expect(image['aspect-ratio']).toBe('horizontal');
      });
    });
  });

  describe('TextSettings interface', () => {
    it('should allow valid text settings with kebab-case properties', () => {
      const settings: TextSettings = {
        'font-family': 'Arial',
        'font-size': 24,
        'font-weight': '400',
        'font-color': '#ffffff',
        'background-color': 'transparent',
        'text-align': 'center',
        'vertical-position': 'center',
        'horizontal-position': 'center',
        'line-height': 1.2,
        'letter-spacing': 0,
        'text-shadow': '2px 2px 4px rgba(0,0,0,0.5)',
        'text-decoration': 'none',
        'text-transform': 'none'
      };
      expect(settings['font-family']).toBe('Arial');
      expect(settings['font-size']).toBe(24);
      expect(settings['text-align']).toBe('center');
    });
  });

  describe('SubtitleSettings interface', () => {
    it('should allow valid subtitle settings', () => {
      const settings: SubtitleSettings = {
        style: 'classic',
        'all-caps': false,
        'font-family': 'Arial',
        'font-size': 32,
        position: 'bottom-center',
        'word-color': '#FFFF00',
        'line-color': '#FFFFFF',
        'box-color': '#000000',
        'outline-color': '#000000',
        'outline-width': 2,
        'shadow-color': '#000000',
        'shadow-offset': 1,
        'max-words-per-line': 4,
        x: 0,
        y: 0,
        keywords: ['important', 'words'],
        replace: { 'old': 'new' }
      };
      expect(settings.style).toBe('classic');
      expect(settings['word-color']).toBe('#FFFF00');
      expect(settings['max-words-per-line']).toBe(4);
    });
  });

  describe('API_RULES constants', () => {
    it('should have correct element type rules', () => {
      expect(API_RULES.MOVIE_ELEMENT_TYPES).toEqual(['text', 'subtitles', 'audio', 'voice']);
      expect(API_RULES.SCENE_ELEMENT_TYPES).toEqual(['video', 'audio', 'image', 'text', 'voice', 'component', 'audiogram', 'html']);
    });

    it('should have export rules', () => {
      expect(API_RULES.EXPORT_RULES.VALID_DESTINATION_TYPES).toEqual(['webhook', 'ftp', 'email']);
      expect(API_RULES.EXPORT_RULES.SUPPORTS_MULTIPLE_DESTINATIONS).toBe(true);
      expect(API_RULES.EXPORT_RULES.SINGLE_EXPORT_CONFIG).toBe(true);
    });

    it('should have validation ranges', () => {
      expect(API_RULES.VALIDATION_RANGES.width).toEqual({ min: 50, max: 3840 });
      expect(API_RULES.VALIDATION_RANGES.height).toEqual({ min: 50, max: 3840 });
      expect(API_RULES.VALIDATION_RANGES.volume).toEqual({ min: 0, max: 10 });
    });

    it('should have valid enum values', () => {
      expect(API_RULES.VALID_QUALITIES).toEqual(['low', 'medium', 'high', 'very_high']);
      expect(API_RULES.VALID_POSITIONS).toContain('center-center');
      expect(API_RULES.VALID_AI_MODELS).toContain('flux-pro');
    });
  });

  describe('type guard functions', () => {
    describe('element type guards', () => {
      it('should correctly identify movie elements', () => {
        expect(isMovieElement({ type: 'text' })).toBe(true);
        expect(isMovieElement({ type: 'subtitles' })).toBe(true);
        expect(isMovieElement({ type: 'audio' })).toBe(true);
        expect(isMovieElement({ type: 'voice' })).toBe(true);
        expect(isMovieElement({ type: 'video' })).toBe(false);
        expect(isMovieElement({ type: 'image' })).toBe(false);
        expect(isMovieElement(null)).toBe(false);
        expect(isMovieElement({})).toBe(false);
      });

      it('should correctly identify scene elements', () => {
        expect(isSceneElement({ type: 'video' })).toBe(true);
        expect(isSceneElement({ type: 'audio' })).toBe(true);
        expect(isSceneElement({ type: 'image' })).toBe(true);
        expect(isSceneElement({ type: 'text' })).toBe(true);
        expect(isSceneElement({ type: 'voice' })).toBe(true);
        expect(isSceneElement({ type: 'component' })).toBe(true);
        expect(isSceneElement({ type: 'audiogram' })).toBe(true);
        expect(isSceneElement({ type: 'html' })).toBe(true);
        expect(isSceneElement({ type: 'subtitles' })).toBe(false);
        expect(isSceneElement(null)).toBe(false);
      });

      it('should correctly identify subtitle elements', () => {
        expect(isSubtitleElement({ type: 'subtitles' })).toBe(true);
        expect(isSubtitleElement({ type: 'text' })).toBe(false);
        expect(isSubtitleElement({ type: 'video' })).toBe(false);
        expect(isSubtitleElement(null)).toBe(false);
        expect(isSubtitleElement({})).toBe(false);
      });

      it('should correctly identify text elements', () => {
        expect(isTextElement({ type: 'text' })).toBe(true);
        expect(isTextElement({ type: 'subtitles' })).toBe(false);
        expect(isTextElement({ type: 'video' })).toBe(false);
        expect(isTextElement(null)).toBe(false);
      });

      it('should correctly identify HTML elements', () => {
        expect(isHtmlElement({ type: 'html' })).toBe(true);
        expect(isHtmlElement({ type: 'text' })).toBe(false);
        expect(isHtmlElement({ type: 'video' })).toBe(false);
        expect(isHtmlElement(null)).toBe(false);
      });
    });

    describe('export destination type guards', () => {
      it('should correctly identify webhook destinations', () => {
        expect(isWebhookDestination({ type: 'webhook', endpoint: 'https://example.com' })).toBe(true);
        expect(isWebhookDestination({ type: 'ftp' })).toBe(false);
        expect(isWebhookDestination({ type: 'email' })).toBe(false);
        expect(isWebhookDestination(null)).toBe(false);
        expect(isWebhookDestination({})).toBe(false);
      });

      it('should correctly identify FTP destinations', () => {
        expect(isFtpDestination({ type: 'ftp', host: 'ftp.example.com' })).toBe(true);
        expect(isFtpDestination({ type: 'webhook' })).toBe(false);
        expect(isFtpDestination({ type: 'email' })).toBe(false);
        expect(isFtpDestination(null)).toBe(false);
      });

      it('should correctly identify email destinations', () => {
        expect(isEmailDestination({ type: 'email', to: 'test@example.com' })).toBe(true);
        expect(isEmailDestination({ type: 'webhook' })).toBe(false);
        expect(isEmailDestination({ type: 'ftp' })).toBe(false);
        expect(isEmailDestination(null)).toBe(false);
      });
    });
  });

  describe('hasRequiredFields', () => {
    it('should validate text elements correctly', () => {
      expect(hasRequiredFields({ type: 'text', text: 'hello' })).toBe(true);
      expect(hasRequiredFields({ type: 'text' })).toBe(false);
      expect(hasRequiredFields({ type: 'text', text: '' })).toBe(false);
      expect(hasRequiredFields({ type: 'text', text: '   ' })).toBe(false);
    });

    it('should validate voice elements correctly', () => {
      expect(hasRequiredFields({ type: 'voice', text: 'hello' })).toBe(true);
      expect(hasRequiredFields({ type: 'voice' })).toBe(false);
      expect(hasRequiredFields({ type: 'voice', text: '' })).toBe(false);
    });

    it('should validate component elements correctly', () => {
      expect(hasRequiredFields({ type: 'component', component: 'comp-id' })).toBe(true);
      expect(hasRequiredFields({ type: 'component' })).toBe(false);
      expect(hasRequiredFields({ type: 'component', component: '' })).toBe(false);
    });

    it('should handle elements with no required fields', () => {
      expect(hasRequiredFields({ type: 'video' })).toBe(true);
      expect(hasRequiredFields({ type: 'audio' })).toBe(true);
      expect(hasRequiredFields({ type: 'image' })).toBe(true);
      expect(hasRequiredFields({ type: 'audiogram' })).toBe(true);
      expect(hasRequiredFields({ type: 'html' })).toBe(true);
    });

    it('should return true for unknown element types', () => {
      expect(hasRequiredFields({ type: 'unknown' })).toBe(true);
    });

    it('should handle null and invalid elements', () => {
      expect(hasRequiredFields(null)).toBe(false);
      expect(hasRequiredFields({})).toBe(false);
      expect(hasRequiredFields({ text: 'hello' })).toBe(false);
    });
  });

  describe('hasRequiredExportFields', () => {
    it('should validate webhook destinations correctly', () => {
      expect(hasRequiredExportFields({ type: 'webhook', endpoint: 'https://example.com' })).toBe(true);
      expect(hasRequiredExportFields({ type: 'webhook' })).toBe(false);
      expect(hasRequiredExportFields({ type: 'webhook', endpoint: '' })).toBe(false);
      expect(hasRequiredExportFields({ type: 'webhook', endpoint: '   ' })).toBe(false);
    });

    it('should validate FTP destinations correctly', () => {
      expect(hasRequiredExportFields({
        type: 'ftp',
        host: 'ftp.example.com',
        username: 'user',
        password: 'pass'
      })).toBe(true);
      expect(hasRequiredExportFields({ type: 'ftp' })).toBe(false);
      expect(hasRequiredExportFields({ type: 'ftp', host: 'example.com' })).toBe(false);
    });

    it('should validate email destinations correctly', () => {
      expect(hasRequiredExportFields({ type: 'email', to: 'test@example.com' })).toBe(true);
      expect(hasRequiredExportFields({ type: 'email' })).toBe(false);
      expect(hasRequiredExportFields({ type: 'email', to: '' })).toBe(false);
    });

    it('should return true for unknown destination types', () => {
      expect(hasRequiredExportFields({ type: 'unknown' })).toBe(true);
    });

    it('should handle null and invalid destinations', () => {
      expect(hasRequiredExportFields(null)).toBe(false);
      expect(hasRequiredExportFields({})).toBe(false);
      expect(hasRequiredExportFields({ endpoint: 'https://example.com' })).toBe(false);
    });
  });

  describe('isValidDuration', () => {
    it('should validate positive durations', () => {
      expect(isValidDuration(1)).toBe(true);
      expect(isValidDuration(10.5)).toBe(true);
      expect(isValidDuration(100)).toBe(true);
    });

    it('should validate special duration values', () => {
      expect(isValidDuration(-1)).toBe(true);
      expect(isValidDuration(-2)).toBe(true);
    });

    it('should reject invalid durations', () => {
      expect(isValidDuration(0)).toBe(false);
      expect(isValidDuration(-5)).toBe(false);
      expect(isValidDuration('10')).toBe(false);
      expect(isValidDuration(null)).toBe(true);
      expect(isValidDuration(undefined)).toBe(true);
    });
  });

  describe('isValidPosition', () => {
    it('should validate valid positions', () => {
      expect(isValidPosition('top-left')).toBe(true);
      expect(isValidPosition('center-center')).toBe(true);
      expect(isValidPosition('bottom-right')).toBe(true);
      expect(isValidPosition('custom')).toBe(true);
    });

    it('should reject invalid positions', () => {
      expect(isValidPosition('invalid')).toBe(false);
      expect(isValidPosition('top-middle')).toBe(false);
      expect(isValidPosition('')).toBe(false);
    });
  });

  describe('isValidWait', () => {
    it('should validate valid wait times', () => {
      expect(isValidWait(0)).toBe(true);
      expect(isValidWait(2.5)).toBe(true);
      expect(isValidWait(5)).toBe(true);
      expect(isValidWait(undefined)).toBe(true);
      expect(isValidWait(null)).toBe(true);
    });

    it('should reject invalid wait times', () => {
      expect(isValidWait(-1)).toBe(false);
      expect(isValidWait(6)).toBe(false);
      expect(isValidWait('2')).toBe(false);
    });
  });

  describe('isValidFtpPort', () => {
    it('should validate valid FTP ports', () => {
      expect(isValidFtpPort(21)).toBe(true);
      expect(isValidFtpPort(22)).toBe(true);
      expect(isValidFtpPort(8080)).toBe(true);
      expect(isValidFtpPort(65535)).toBe(true);
      expect(isValidFtpPort(undefined)).toBe(true);
      expect(isValidFtpPort(null)).toBe(true);
    });

    it('should reject invalid FTP ports', () => {
      expect(isValidFtpPort(0)).toBe(false);
      expect(isValidFtpPort(-1)).toBe(false);
      expect(isValidFtpPort(65536)).toBe(false);
      expect(isValidFtpPort('21')).toBe(false);
    });
  });
});