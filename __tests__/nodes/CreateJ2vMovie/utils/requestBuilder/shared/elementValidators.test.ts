import {
  validateBaseElement,
  validateVideoElement,
  validateAudioElement,
  validateTextElement,
  validateImageElement,
  validateSubtitleElement,
  validateShapeElement,
  validateElement,
  validateElements,
  getValidationSummary,
  ValidationResult
} from './elementValidators';

import { videoElements, audioElements, textElements } from './elementFixtures';

describe('elementValidators', () => {
  describe('validateBaseElement', () => {
    it('should validate valid element', () => {
      const element = { type: 'test' };
      const result = validateBaseElement(element);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
      expect(result.warnings).toEqual([]);
    });

    it('should reject null element', () => {
      const result = validateBaseElement(null);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Element is null or undefined');
    });

    it('should reject undefined element', () => {
      const result = validateBaseElement(undefined);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Element is null or undefined');
    });

    it('should reject non-object element', () => {
      const result = validateBaseElement('not an object');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Element must be an object');
    });
  });

  describe('validateVideoElement', () => {
    it('should validate basic video element', () => {
      const result = validateVideoElement(videoElements.basic);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should validate video with all properties', () => {
      const result = validateVideoElement(videoElements.withAllProperties);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should reject video without type', () => {
      const element = { src: 'test.mp4' };
      const result = validateVideoElement(element);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Video element must have type "video"');
    });

    it('should reject video with wrong type', () => {
      const element = { type: 'audio', src: 'test.mp4' };
      const result = validateVideoElement(element);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Video element must have type "video"');
    });

    it('should reject video without src', () => {
      const element = { type: 'video' };
      const result = validateVideoElement(element);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Video element must have a src property');
    });

    it('should reject video with empty src', () => {
      const element = { type: 'video', src: '' };
      const result = validateVideoElement(element);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Video element must have a src property');
    });

    it('should reject invalid duration', () => {
      const element = { type: 'video', src: 'test.mp4', duration: -5 };
      const result = validateVideoElement(element);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Video duration must be a positive number');
    });

    it('should reject invalid volume', () => {
      const element = { type: 'video', src: 'test.mp4', volume: 1.5 };
      const result = validateVideoElement(element);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Video volume must be a number between 0 and 1');
    });

    it('should reject invalid fit value', () => {
      const element = { type: 'video', src: 'test.mp4', fit: 'invalid' };
      const result = validateVideoElement(element);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Video fit must be one of: cover, contain, fill, scale-down, none');
    });
  });

  describe('validateAudioElement', () => {
    it('should validate basic audio element', () => {
      const result = validateAudioElement(audioElements.basic);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should validate audio with all properties', () => {
      const result = validateAudioElement(audioElements.withAllProperties);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should reject audio without type', () => {
      const element = { src: 'test.mp3' };
      const result = validateAudioElement(element);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Audio element must have type "audio"');
    });

    it('should reject audio without src', () => {
      const element = { type: 'audio' };
      const result = validateAudioElement(element);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Audio element must have a src property');
    });

    it('should reject invalid volume', () => {
      const element = { type: 'audio', src: 'test.mp3', volume: -0.5 };
      const result = validateAudioElement(element);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Audio volume must be a number between 0 and 1');
    });
  });

  describe('validateTextElement', () => {
    it('should validate basic text element', () => {
      const result = validateTextElement(textElements.basic);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should validate complete text element', () => {
      const result = validateTextElement(textElements.complete);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should reject text without text property', () => {
      const element = { style: '001' };
      const result = validateTextElement(element);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Text element must have a text property');
    });

    it('should reject text with empty text', () => {
      const element = { text: '', style: '001' };
      const result = validateTextElement(element);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Text element must have a text property');
    });

    it('should reject invalid position', () => {
      const element = { text: 'test', position: 'invalid-position' };
      const result = validateTextElement(element);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Text position must be one of: top-left, top-center, top-right, center-left, center-center, center-right, bottom-left, bottom-center, bottom-right, custom');
    });

    it('should warn about missing coordinates for custom position', () => {
      const element = { text: 'test', position: 'custom' };
      const result = validateTextElement(element);
      
      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('Custom positioned text should have x and y coordinates');
    });

    it('should reject invalid color format', () => {
      const element = { text: 'test', fontColor: 'red' };
      const result = validateTextElement(element);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Text fontColor must be a valid hex color (e.g., #FFFFFF)');
    });

    it('should accept valid hex colors', () => {
      const element = { text: 'test', fontColor: '#FF0000', backgroundColor: '#000000' };
      const result = validateTextElement(element);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should reject invalid font weight', () => {
      const element = { text: 'test', fontWeight: '999' };
      const result = validateTextElement(element);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Text fontWeight must be one of: 100, 200, 300, 400, 500, 600, 700, 800, 900, normal, bold');
    });
  });

  describe('validateImageElement', () => {
    it('should validate basic image element', () => {
      const element = { type: 'image', src: 'https://example.com/image.jpg' };
      const result = validateImageElement(element);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should reject image without type', () => {
      const element = { src: 'image.jpg' };
      const result = validateImageElement(element);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Image element must have type "image"');
    });

    it('should reject image without src', () => {
      const element = { type: 'image' };
      const result = validateImageElement(element);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Image element must have a src property');
    });

    it('should reject invalid fit value', () => {
      const element = { type: 'image', src: 'image.jpg', fit: 'stretch' };
      const result = validateImageElement(element);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Image fit must be one of: cover, contain, fill, scale-down, none');
    });
  });

  describe('validateSubtitleElement', () => {
    it('should validate basic subtitle element', () => {
      const element = { type: 'subtitle', text: 'Hello world', start: 0, duration: 5 };
      const result = validateSubtitleElement(element);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should warn about missing start time', () => {
      const element = { type: 'subtitle', text: 'Hello world' };
      const result = validateSubtitleElement(element);
      
      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('Subtitle should have a start time');
    });

    it('should reject subtitle without text', () => {
      const element = { type: 'subtitle', start: 0 };
      const result = validateSubtitleElement(element);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Subtitle element must have a text property');
    });

    it('should reject invalid start time', () => {
      const element = { type: 'subtitle', text: 'test', start: -1 };
      const result = validateSubtitleElement(element);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Subtitle start time must be a positive number');
    });
  });

  describe('validateShapeElement', () => {
    it('should validate rectangle element', () => {
      const element = { type: 'rectangle', width: 100, height: 50, color: '#FF0000' };
      const result = validateShapeElement(element);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should validate circle element', () => {
      const element = { type: 'circle', radius: 25, color: '#00FF00' };
      const result = validateShapeElement(element);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should reject invalid shape type', () => {
      const element = { type: 'triangle' };
      const result = validateShapeElement(element);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Shape element must have type one of: rectangle, circle, arrow, line');
    });

    it('should reject invalid rectangle dimensions', () => {
      const element = { type: 'rectangle', width: -10, height: 0 };
      const result = validateShapeElement(element);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Rectangle width must be a positive number');
      expect(result.errors).toContain('Rectangle height must be a positive number');
    });

    it('should reject invalid circle radius', () => {
      const element = { type: 'circle', radius: -5 };
      const result = validateShapeElement(element);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Circle radius must be a positive number');
    });

    it('should reject invalid color', () => {
      const element = { type: 'rectangle', color: 'blue' };
      const result = validateShapeElement(element);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Shape color must be a valid hex color (e.g., #FF0000)');
    });
  });

  describe('validateElement', () => {
    it('should route video elements to video validator', () => {
      const result = validateElement(videoElements.basic);
      expect(result.isValid).toBe(true);
    });

    it('should route audio elements to audio validator', () => {
      const result = validateElement(audioElements.basic);
      expect(result.isValid).toBe(true);
    });

    it('should route text elements to text validator', () => {
      const result = validateElement(textElements.basic);
      expect(result.isValid).toBe(true);
    });

    it('should reject elements without type', () => {
      const element = { src: 'test.mp4' };
      const result = validateElement(element);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Element must have a type property');
    });

    it('should reject unknown element types', () => {
      const element = { type: 'unknown', data: 'test' };
      const result = validateElement(element);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Unknown element type: unknown');
    });
  });

  describe('validateElements', () => {
    it('should validate array of valid elements', () => {
      const elements = [videoElements.basic, audioElements.basic, textElements.basic];
      const result = validateElements(elements);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should reject non-array input', () => {
      const result = validateElements('not an array' as any);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Elements must be an array');
    });

    it('should collect errors from multiple invalid elements', () => {
      const elements = [
        { type: 'video' }, // missing src
        { type: 'audio' }, // missing src
        { text: '' } // empty text content
      ];
      const result = validateElements(elements);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(3);
      expect(result.errors[0]).toContain('Element 0: Video element must have a src property');
      expect(result.errors[1]).toContain('Element 1: Audio element must have a src property');
      expect(result.errors[2]).toContain('Element 2: Text element must have a text property');
    });

    it('should collect warnings from elements', () => {
      const elements = [
        { type: 'subtitle', text: 'Hello' }, // missing start time
        { text: 'Custom text', position: 'custom' } // missing coordinates
      ];
      const result = validateElements(elements);
      
      expect(result.isValid).toBe(true);
      expect(result.warnings).toHaveLength(2);
      expect(result.warnings[0]).toContain('Element 0: Subtitle should have a start time');
      expect(result.warnings[1]).toContain('Element 1: Custom positioned text should have x and y coordinates');
    });

    it('should validate empty array', () => {
      const result = validateElements([]);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
      expect(result.warnings).toEqual([]);
    });
  });

  describe('getValidationSummary', () => {
    it('should return "Valid" for valid result', () => {
      const result: ValidationResult = {
        isValid: true,
        errors: [],
        warnings: []
      };
      
      expect(getValidationSummary(result)).toBe('Valid');
    });

    it('should return "Valid" with warning count', () => {
      const result: ValidationResult = {
        isValid: true,
        errors: [],
        warnings: ['Warning 1', 'Warning 2']
      };
      
      expect(getValidationSummary(result)).toBe('Valid (2 warnings)');
    });

    it('should return error and warning counts for invalid result', () => {
      const result: ValidationResult = {
        isValid: false,
        errors: ['Error 1', 'Error 2'],
        warnings: ['Warning 1']
      };
      
      expect(getValidationSummary(result)).toBe('Invalid: 2 errors, 1 warnings');
    });

    it('should handle zero warnings in invalid result', () => {
      const result: ValidationResult = {
        isValid: false,
        errors: ['Error 1'],
        warnings: []
      };
      
      expect(getValidationSummary(result)).toBe('Invalid: 1 errors, 0 warnings');
    });
  });
});