import {
  testElementInOperation,
  validateElementTransformation,
  createElementValidationSuite,
  testElementPositioning,
  testElementTiming,
  findElementByType,
  findElementsByType,
  validateRequiredProperties,
  createTestDescription,
  validateCommonProperties,
  getElementFixture,
  COMMON_ELEMENT_PROPERTIES
} from './elementTestHelpers';

import { textElements, videoElements, audioElements } from './elementFixtures';

describe('elementTestHelpers', () => {
  describe('getElementFixture', () => {
    it('should return basic fixture by default', () => {
      const fixture = getElementFixture('text');
      expect(fixture).toBe(textElements.basic);
    });

    it('should return specific variant', () => {
      const fixture = getElementFixture('text', 'complete');
      expect(fixture).toBe(textElements.complete);
    });

    it('should throw error for invalid element type', () => {
      expect(() => {
        getElementFixture('invalid');
      }).toThrow('No fixtures found for element type: invalid');
    });

    it('should return first available fixture for invalid variant', () => {
      const fixture = getElementFixture('text', 'nonexistent');
      // Should return the first available fixture (basic)
      expect(fixture).toBe(textElements.basic);
    });
  });

  describe('testElementInOperation', () => {
    it('should test element processing with a builder function', () => {
      const mockBuilder = jest.fn((elements: any[]) => ({
        elements: elements.map((el: any) => ({ ...el, processed: true }))
      }));

      const result = testElementInOperation(
        'createMovie',
        'text',
        textElements.basic,
        mockBuilder
      );

      expect(result.operation).toBe('createMovie');
      expect(result.elementType).toBe('text');
      expect(result.input).toBe(textElements.basic);
      expect(result.output.elements[0]).toHaveProperty('processed', true);
      expect(mockBuilder).toHaveBeenCalledWith([textElements.basic]);
    });

    it('should handle timeline-based results', () => {
      const mockBuilder = jest.fn((elements: any[]) => ({
        timeline: {
          elements: elements.map((el: any) => ({ ...el, timeline: true }))
        }
      }));

      const result = testElementInOperation(
        'mergeVideos',
        'video',
        videoElements.basic,
        mockBuilder
      );

      expect(result.elements[0]).toHaveProperty('timeline', true);
    });
  });

  describe('validateElementTransformation', () => {
    it('should validate successful element transformation', () => {
      const input = textElements.basic;
      const output = {
        elements: [{ ...textElements.basic, transformed: true }]
      };

      const isValid = validateElementTransformation(input, output, 'createMovie');
      expect(isValid).toBe(true);
    });

    it('should validate timeline-based transformations', () => {
      const input = videoElements.basic;
      const output = {
        timeline: {
          elements: [{ ...videoElements.basic, transformed: true }]
        }
      };

      const isValid = validateElementTransformation(input, output, 'mergeVideos');
      expect(isValid).toBe(true);
    });

    it('should return false for missing elements', () => {
      const input = textElements.basic;
      const output = {
        elements: [{ type: 'video' }] // Different type
      };

      const isValid = validateElementTransformation(input, output, 'createMovie');
      expect(isValid).toBe(false);
    });

    it('should return false for outputs without elements', () => {
      const input = textElements.basic;
      const output = {};

      const isValid = validateElementTransformation(input, output, 'createMovie');
      expect(isValid).toBe(false);
    });
  });

  describe('createElementValidationSuite', () => {
    it('should create validation suite for existing element type', () => {
      const suite = createElementValidationSuite('text');

      expect(suite.elementType).toBe('text');
      expect(suite.variant).toBe('basic');
      expect(suite.data).toBe(textElements.basic);
      expect(suite.testCases).toHaveProperty('createMovie');
      expect(suite.testCases).toHaveProperty('mergeVideoAudio');
      expect(suite.testCases).toHaveProperty('mergeVideos');

      expect(suite.testCases.createMovie.description)
        .toBe('should handle text elements in createMovie operation');
    });

    it('should create validation suite with specific variant', () => {
      const suite = createElementValidationSuite('text', 'complete');

      expect(suite.elementType).toBe('text');
      expect(suite.variant).toBe('complete');
      expect(suite.data).toBe(textElements.complete);
    });

    it('should throw error for non-existent element type', () => {
      expect(() => {
        createElementValidationSuite('nonexistent');
      }).toThrow('No fixtures found for element type: nonexistent');
    });
  });

  describe('testElementPositioning', () => {
    it('should detect elements with positioning', () => {
      const elementWithPosition = { type: 'text', position: 'center' };
      const result = testElementPositioning(elementWithPosition);
      
      expect(result.hasPositioning).toBe(true);
    });

    it('should detect elements with x/y coordinates', () => {
      const elementWithCoords = { type: 'text', x: 100, y: 50 };
      const result = testElementPositioning(elementWithCoords);
      
      expect(result.hasPositioning).toBe(true);
    });

    it('should detect elements without positioning', () => {
      const elementWithoutPosition = { type: 'text' };
      const result = testElementPositioning(elementWithoutPosition);
      
      expect(result.hasPositioning).toBe(false);
    });

    it('should validate expected positioning', () => {
      const element = { type: 'text', position: 'center' };
      const expected = 'center';
      const result = testElementPositioning(element, expected);
      
      expect(result.matchesExpected).toBe(true);
    });

    it('should validate expected coordinates', () => {
      const element = { type: 'text', x: 100, y: 50 };
      const expected = { x: 100, y: 50 };
      const result = testElementPositioning(element, expected);
      
      expect(result.matchesExpected).toBe(true);
    });
  });

  describe('testElementTiming', () => {
    it('should detect elements with timing', () => {
      const elementWithTiming = { type: 'video', start: 0, duration: 10 };
      const result = testElementTiming(elementWithTiming);
      
      expect(result.hasTiming).toBe(true);
      expect(result.timing.start).toBe(0);
      expect(result.timing.duration).toBe(10);
    });

    it('should detect elements without timing', () => {
      const elementWithoutTiming = { type: 'image' };
      const result = testElementTiming(elementWithoutTiming);
      
      expect(result.hasTiming).toBe(false);
    });

    it('should validate expected timing', () => {
      const element = { type: 'video', start: 5, duration: 15 };
      const expected = { start: 5, duration: 15 };
      const result = testElementTiming(element, expected);
      
      expect(result.matchesExpected).toBe(true);
    });
  });

  describe('findElementByType', () => {
    it('should find element by type', () => {
      const elements = [
        { type: 'text', content: 'hello' },
        { type: 'video', src: 'video.mp4' }
      ];

      const textElement = findElementByType(elements, 'text');
      expect(textElement).toEqual({ type: 'text', content: 'hello' });
    });

    it('should return undefined for non-existent type', () => {
      const elements = [{ type: 'text' }];
      const result = findElementByType(elements, 'video');
      expect(result).toBeUndefined();
    });
  });

  describe('findElementsByType', () => {
    it('should find all elements of a type', () => {
      const elements = [
        { type: 'text', id: 1 },
        { type: 'video', id: 2 },
        { type: 'text', id: 3 }
      ];

      const textElements = findElementsByType(elements, 'text');
      expect(textElements).toHaveLength(2);
      expect(textElements[0].id).toBe(1);
      expect(textElements[1].id).toBe(3);
    });

    it('should return empty array for non-existent type', () => {
      const elements = [{ type: 'text' }];
      const result = findElementsByType(elements, 'video');
      expect(result).toEqual([]);
    });
  });

  describe('validateRequiredProperties', () => {
    it('should validate all required properties exist', () => {
      const element = { type: 'text', content: 'hello', position: 'center' };
      const required = ['type', 'content', 'position'];
      
      const result = validateRequiredProperties(element, required);
      expect(result.isValid).toBe(true);
      expect(result.missing).toEqual([]);
    });

    it('should detect missing required properties', () => {
      const element = { type: 'text' };
      const required = ['type', 'content', 'position'];
      
      const result = validateRequiredProperties(element, required);
      expect(result.isValid).toBe(false);
      expect(result.missing).toEqual(['content', 'position']);
    });

    it('should handle null values as missing', () => {
      const element = { type: 'text', content: null, position: undefined };
      const required = ['type', 'content', 'position'];
      
      const result = validateRequiredProperties(element, required);
      expect(result.isValid).toBe(false);
      expect(result.missing).toEqual(['content', 'position']);
    });
  });

  describe('createTestDescription', () => {
    it('should create default test description', () => {
      const desc = createTestDescription('createMovie', 'text');
      expect(desc).toBe('should handle text elements in createMovie processing');
    });

    it('should create custom test description', () => {
      const desc = createTestDescription('mergeVideos', 'video', 'validation');
      expect(desc).toBe('should handle video elements in mergeVideos validation');
    });
  });

  describe('validateCommonProperties', () => {
    it('should validate preserved common properties', () => {
      const input = {
        type: 'text',
        start: 0,
        duration: 10,
        position: 'center'
      };
      
      const output = {
        type: 'text',
        start: 0,
        duration: 10,
        position: 'center',
        processed: true // Additional property is fine
      };

      const isValid = validateCommonProperties(input, output);
      expect(isValid).toBe(true);
    });

    it('should detect changed common properties', () => {
      const input = {
        type: 'text',
        start: 0,
        duration: 10
      };
      
      const output = {
        type: 'text',
        start: 0,
        duration: 15 // Changed duration
      };

      const isValid = validateCommonProperties(input, output);
      expect(isValid).toBe(false);
    });

    it('should handle missing properties in input', () => {
      const input = { type: 'text' }; // Only has type
      const output = { type: 'text', start: 0 }; // Has additional properties

      const isValid = validateCommonProperties(input, output);
      expect(isValid).toBe(true); // Should be valid since input didn't have start
    });
  });

  describe('COMMON_ELEMENT_PROPERTIES', () => {
    it('should include expected common properties', () => {
      const expectedProperties = [
        'type',
        'start', 
        'duration',
        'end',
        'x',
        'y', 
        'position',
        'width',
        'height'
      ];

      expect(COMMON_ELEMENT_PROPERTIES).toEqual(expectedProperties);
    });
  });
});