import { IDataObject, IExecuteFunctions, NodeParameterValue } from 'n8n-workflow';
import { 
  buildRequestBody, 
  buildMergeVideoAudioRequestBody, 
  buildMergeVideosRequestBody 
} from '../../../../nodes/CreateJ2vMovie/utils/parameterUtils';

// Add a helper type to make TypeScript happy with our assertions
interface RequestBodyWithElements extends IDataObject {
  elements?: IDataObject[];
  scenes?: Array<{elements: IDataObject[]}>;
}

describe('parameterUtils', () => {
  describe('calculatePositionFromPreset', () => {
    test('should calculate position for all position presets', () => {
      // Import the function directly
      const { calculatePositionFromPreset } = require('../../../../nodes/CreateJ2vMovie/utils/parameterUtils');
      
      // Define test cases for all position presets
      const testCases = [
        { preset: 'top_left', expectedX: 250, expectedY: 150 },
        { preset: 'top_center', expectedX: 640, expectedY: 150 },
        { preset: 'top_right', expectedX: 1030, expectedY: 150 },
        { preset: 'middle_left', expectedX: 250, expectedY: 360 },
        { preset: 'center', expectedX: 640, expectedY: 360 },
        { preset: 'middle_right', expectedX: 1030, expectedY: 360 },
        { preset: 'bottom_left', expectedX: 250, expectedY: 570 },
        { preset: 'bottom_center', expectedX: 640, expectedY: 570 },
        { preset: 'bottom_right', expectedX: 1030, expectedY: 570 },
        // Test default case (should use center if preset is not recognized)
        { preset: 'invalid_preset', expectedX: 640, expectedY: 360 }
      ];
      
      // Test each position preset
      testCases.forEach(({ preset, expectedX, expectedY }) => {
        const result = calculatePositionFromPreset(
          preset,
          1280,  // video width
          720,   // video height
          500,   // element width
          300    // element height
        );
        
        expect(result.x).toBeCloseTo(expectedX);
        expect(result.y).toBeCloseTo(expectedY);
      });
    });
    
    test('should handle custom positions by using default center', () => {
      // Import the function
      const { calculatePositionFromPreset } = require('../../../../nodes/CreateJ2vMovie/utils/parameterUtils');
      
      // For 'custom' preset, the function should use the default (center)
      const result = calculatePositionFromPreset(
        'custom',
        1280,
        720,
        500,
        300
      );
      
      // Should default to center position
      expect(result.x).toBeCloseTo(640);
      expect(result.y).toBeCloseTo(360);
    });
  });
  
  describe('mapPositionPresetToApiFormat', () => {
    test('should map all position presets to API format', () => {
      // Import the function directly
      const { mapPositionPresetToApiFormat } = require('../../../../nodes/CreateJ2vMovie/utils/parameterUtils');
      
      // Define test cases for all position mappings
      const testCases = [
        { preset: 'top_left', expected: 'top-left' },
        { preset: 'top_center', expected: 'top-center' },
        { preset: 'top_right', expected: 'top-right' },
        { preset: 'middle_left', expected: 'center-left' },
        { preset: 'center', expected: 'center-center' },
        { preset: 'middle_right', expected: 'center-right' },
        { preset: 'bottom_left', expected: 'bottom-left' },
        { preset: 'bottom_center', expected: 'bottom-center' },
        { preset: 'bottom_right', expected: 'bottom-right' },
        // Test default cases
        { preset: 'custom', expected: 'center-center' }, // 'custom' will use default
        { preset: 'invalid_preset', expected: 'center-center' }
      ];
      
      // Test each position mapping
      testCases.forEach(({ preset, expected }) => {
        const result = mapPositionPresetToApiFormat(preset);
        expect(result).toBe(expected);
      });
    });
  });
  
  describe('getParameterValue', () => {
    test('should return default value when parameter lookup fails', () => {
      // Create a mock that throws an error when getting node parameters
      const mockExecute = {
        getNodeParameter: () => {
          throw new Error('Parameter not found');
        },
        logger: {
          debug: jest.fn(),
          warn: jest.fn(),
          info: jest.fn(),
          error: jest.fn(),
        }
      };
      
      // Import the function directly for testing
      const { getParameterValue } = require('../../../../nodes/CreateJ2vMovie/utils/parameterUtils');
      
      // Call the function with the mock
      const result = getParameterValue.call(
        mockExecute as unknown as IExecuteFunctions,
        'nonExistentParameter',
        0,
        'defaultValue'
      );
      
      // Should return the default value
      expect(result).toBe('defaultValue');
    });
  });
  describe('buildRequestBody', () => {
    // Add tests for advanced mode with valid JSON template
    test('should handle advanced mode with valid JSON template for createMovie', () => {
      const validJsonTemplate = JSON.stringify({
        width: 1920,
        height: 1080,
        fps: 30,
        elements: [
          {
            type: 'text',
            text: 'Advanced Mode Test',
            'font-family': 'Arial',
            'font-size': 48,
            color: '#ff0000'
          }
        ]
      });
      
      const mockExecute = {
        getNodeParameter: (parameterName: string, itemIndex: number, fallbackValue?: any) => {
          if (parameterName === 'operation') return 'createMovie';
          if (parameterName === 'jsonTemplate') return validJsonTemplate;
          return fallbackValue;
        },
        logger: {
          debug: jest.fn(),
          warn: jest.fn(),
          info: jest.fn(),
          error: jest.fn(),
        }
      };
      
      // Call with advanced mode = true
      const result = buildRequestBody.call(
        mockExecute as unknown as IExecuteFunctions, 
        'createMovie', 
        0, 
        true
      );
      
      // Verify the JSON template was parsed and returned
      expect(result).toHaveProperty('width', 1920);
      expect(result).toHaveProperty('height', 1080);
      expect(result).toHaveProperty('fps', 30);
      expect(result).toHaveProperty('elements');
      const elements = result.elements as any[];
      expect(elements.length).toBe(1);
      expect(elements[0].text).toBe('Advanced Mode Test');
    });
    
    test('should handle advanced mode with valid JSON template for mergeVideoAudio', () => {
      const validJsonTemplate = JSON.stringify({
        video: 'https://example.com/advanced-video.mp4',
        audio: 'https://example.com/advanced-audio.mp3',
        fps: 24
      });
      
      const mockExecute = {
        getNodeParameter: (parameterName: string, itemIndex: number, fallbackValue?: any) => {
          if (parameterName === 'operation') return 'mergeVideoAudio';
          if (parameterName === 'jsonTemplateMergeAudio') return validJsonTemplate;
          return fallbackValue;
        },
        logger: {
          debug: jest.fn(),
          warn: jest.fn(),
          info: jest.fn(),
          error: jest.fn(),
        }
      };
      
      // Call with advanced mode = true
      const result = buildRequestBody.call(
        mockExecute as unknown as IExecuteFunctions, 
        'mergeVideoAudio', 
        0, 
        true
      );
      
      // Verify the JSON template was parsed and returned
      expect(result).toHaveProperty('video', 'https://example.com/advanced-video.mp4');
      expect(result).toHaveProperty('audio', 'https://example.com/advanced-audio.mp3');
      expect(result).toHaveProperty('fps', 24);
    });
    
    test('should handle advanced mode with valid JSON template for mergeVideos', () => {
      const validJsonTemplate = JSON.stringify({
        videos: ['https://example.com/vid1.mp4', 'https://example.com/vid2.mp4'],
        fps: 30
      });
      
      const mockExecute = {
        getNodeParameter: (parameterName: string, itemIndex: number, fallbackValue?: any) => {
          if (parameterName === 'operation') return 'mergeVideos';
          if (parameterName === 'jsonTemplateMergeVideos') return validJsonTemplate;
          return fallbackValue;
        },
        logger: {
          debug: jest.fn(),
          warn: jest.fn(),
          info: jest.fn(),
          error: jest.fn(),
        }
      };
      
      // Call with advanced mode = true
      const result = buildRequestBody.call(
        mockExecute as unknown as IExecuteFunctions, 
        'mergeVideos', 
        0, 
        true
      );
      
      // Verify the JSON template was parsed and returned
      expect(result).toHaveProperty('videos');
      expect(Array.isArray(result.videos)).toBe(true);
      
      // Type assertion to make TypeScript happy
      const videos = result.videos as string[];
      expect(videos[0]).toBe('https://example.com/vid1.mp4');
      expect(videos[1]).toBe('https://example.com/vid2.mp4');
      expect(result).toHaveProperty('fps', 30);
    });
    
    test('should throw error with invalid JSON template in advanced mode', () => {
      const invalidJsonTemplate = '{invalid: json}';
      
      const mockExecute = {
        getNodeParameter: (parameterName: string, itemIndex: number, fallbackValue?: any) => {
          if (parameterName === 'operation') return 'createMovie';
          if (parameterName === 'jsonTemplate') return invalidJsonTemplate;
          return fallbackValue;
        },
        logger: {
          debug: jest.fn(),
          warn: jest.fn(),
          info: jest.fn(),
          error: jest.fn(),
        }
      };
      
      // Call with advanced mode = true and expect it to throw
      expect(() => {
        buildRequestBody.call(
          mockExecute as unknown as IExecuteFunctions, 
          'createMovie', 
          0, 
          true
        );
      }).toThrow('Invalid JSON template:');
    });
    
    test('should directly call buildMergeVideoAudioRequestBody for mergeVideoAudio operation', () => {
      const mockExecute = {
        getNodeParameter: (parameterName: string, itemIndex: number, fallbackValue?: any) => {
          if (parameterName === 'operation') return 'mergeVideoAudio';
          // Return elements in the new structure
          if (parameterName === 'videoElement.videoDetails') {
            return { src: 'https://example.com/direct-test.mp4' };
          }
          if (parameterName === 'audioElement.audioDetails') {
            return { src: 'https://example.com/direct-test.mp3' };
          }
          return fallbackValue;
        },
        logger: {
          debug: jest.fn(),
          warn: jest.fn(),
          info: jest.fn(),
          error: jest.fn(),
        }
      };
      
      // Spy on the merge function
      const { buildMergeVideoAudioRequestBody } = require('../../../../nodes/CreateJ2vMovie/utils/parameterUtils');
      const spy = jest.spyOn(buildMergeVideoAudioRequestBody, 'call');
      
      // Call buildRequestBody which should call our spy function
      const result = buildRequestBody.call(
        mockExecute as unknown as IExecuteFunctions, 
        'mergeVideoAudio', 
        0, 
        false
      );
      
      // Verify we directly called the right function
      expect(spy).toHaveBeenCalled();
      expect(result).toHaveProperty('video', 'https://example.com/direct-test.mp4');
      expect(result).toHaveProperty('audio', 'https://example.com/direct-test.mp3');
      
      // Clean up
      spy.mockRestore();
    });
    
    test('should directly call buildMergeVideosRequestBody for mergeVideos operation', () => {
      const mockExecute = {
        getNodeParameter: (parameterName: string, itemIndex: number, fallbackValue?: any) => {
          if (parameterName === 'operation') return 'mergeVideos';
          // Return elements in the new structure
          if (parameterName === 'videoElements.videoDetails') {
            return [
              { src: 'https://example.com/direct-test1.mp4' },
              { src: 'https://example.com/direct-test2.mp4' }
            ];
          }
          return fallbackValue;
        },
        logger: {
          debug: jest.fn(),
          warn: jest.fn(),
          info: jest.fn(),
          error: jest.fn(),
        }
      };
      
      // Spy on the merge function
      const { buildMergeVideosRequestBody } = require('../../../../nodes/CreateJ2vMovie/utils/parameterUtils');
      const spy = jest.spyOn(buildMergeVideosRequestBody, 'call');
      
      // Call buildRequestBody which should call our spy function
      const result = buildRequestBody.call(
        mockExecute as unknown as IExecuteFunctions, 
        'mergeVideos', 
        0, 
        false
      );
      
      // Verify we directly called the right function
      expect(spy).toHaveBeenCalled();
      
      // Check video objects (not strings now)
      expect(result.videos).toBeInstanceOf(Array);
      const videos = result.videos as IDataObject[];
      expect(videos).toHaveLength(2);
      expect(videos[0]).toHaveProperty('src', 'https://example.com/direct-test1.mp4');
      expect(videos[1]).toHaveProperty('src', 'https://example.com/direct-test2.mp4');
      
      // Clean up
      spy.mockRestore();
    });
    
    test('should handle checkStatus operation correctly', () => {
      const mockExecute = {
        getNodeParameter: (parameterName: string, itemIndex: number, fallbackValue?: any) => {
          if (parameterName === 'operation') return 'checkStatus';
          return fallbackValue;
        },
        logger: {
          debug: jest.fn(),
          warn: jest.fn(),
          info: jest.fn(),
          error: jest.fn(),
        }
      };
      
      const result = buildRequestBody.call(
        mockExecute as unknown as IExecuteFunctions, 
        'checkStatus', 
        0, 
        false
      );
      
      // Verify an empty object is returned
      expect(result).toEqual({});
    });
    
    test('should throw error for unsupported operations', () => {
      const mockExecute = {
        getNodeParameter: (parameterName: string, itemIndex: number, fallbackValue?: any) => {
          if (parameterName === 'operation') return 'unknownOperation';
          return fallbackValue;
        },
        logger: {
          debug: jest.fn(),
          warn: jest.fn(),
          info: jest.fn(),
          error: jest.fn(),
        }
      };
      
      // Expect it to throw for unsupported operation
      expect(() => {
        buildRequestBody.call(
          mockExecute as unknown as IExecuteFunctions, 
          'unknownOperation', 
          0, 
          false
        );
      }).toThrow('Unsupported operation: unknownOperation');
    });
    
    const createMockExecuteFunction = (parameters: {[key: string]: any}) => {
      const mockExecute = {
        getNodeParameter: (
          parameterName: string,
          itemIndex: number,
          fallbackValue?: any
        ) => {
          // Handle the element collections specially
          if (parameterName === 'movieElements.elementValues' && parameters.movieElements) {
            return parameters.movieElements;
          }
          
          if (parameterName === 'elements.elementValues' && parameters.elements) {
            return parameters.elements;
          }
          
          // Check if the parameter exists
          if (parameters[parameterName] !== undefined) {
            return parameters[parameterName];
          }
          
          // Test the error paths for the try/catch blocks
          if (parameterName === 'cache' || 
              parameterName === 'draft' || 
              parameterName === 'movieElements' ||
              parameterName === 'elements') {
            throw new Error(`Parameter ${parameterName} not found`);
          }
          
          return fallbackValue;
        },
        logger: {
          debug: jest.fn(),
          warn: jest.fn(),
          info: jest.fn(),
          error: jest.fn(),
        }
      };
      
      return mockExecute as unknown as IExecuteFunctions;
    };

    test('should handle optional parameters and catch errors when they are not available', () => {
      // Setup mock with basic parameters but missing optional ones
      const mockExecute = createMockExecuteFunction({
        operation: 'createMovie',
        output_width: 1280,
        output_height: 720,
        framerate: 30,
        quality: 'medium',
      });

      // Call the function
      const result = buildRequestBody.call(mockExecute, 'createMovie', 0, false);
      
      // Verify results
      expect(result).toHaveProperty('fps', 30);
      expect(result).toHaveProperty('width', 1280);
      expect(result).toHaveProperty('height', 720);
      expect(result).toHaveProperty('quality', 'medium');
      expect(result).toHaveProperty('scenes');
      expect(result).not.toHaveProperty('cache');
      expect(result).not.toHaveProperty('draft');
    });

    test('should handle missing movieElements and elements', () => {
      // Setup mock with only basic parameters and no elements
      const mockExecute = createMockExecuteFunction({
        operation: 'createMovie',
        output_width: 1280,
        output_height: 720,
        framerate: 30,
      });

      // Call the function
      const result = buildRequestBody.call(mockExecute, 'createMovie', 0, false) as RequestBodyWithElements;
      
      // Check the result
      expect(result).not.toHaveProperty('elements');
      expect(result.scenes).toBeDefined();
      expect(result.scenes?.length).toBe(0);
    });

    test('should handle optional movieElements and elements if present', () => {
      // Setup mock with all parameters including movieElements and elements
      const mockExecute = createMockExecuteFunction({
        operation: 'createMovie',
        output_width: 1280,
        output_height: 720,
        framerate: 30,
        draft: true,
        cache: true,
        movieElements: [
          {
            type: 'image',
            src: 'https://example.com/movie-image.jpg',
            positionPreset: 'center',
            width: 500,
            height: 300,
            start: 0,
            duration: 5
          }
        ],
        elements: [
          {
            type: 'text',
            text: 'Hello World',
            positionPreset: 'center',
            'font-family': 'Arial',
            'font-size': 32,
            color: '#ffffff',
            start: 0,
            duration: 4
          }
        ]
      });

      // Call the function
      const result = buildRequestBody.call(mockExecute, 'createMovie', 0, false) as RequestBodyWithElements;
      
      // Check the result has both movieElements and elements
      expect(result).toHaveProperty('elements');
      expect(result.elements).toBeDefined();
      expect(result.elements?.length).toBe(1);
      expect(result.elements?.[0].type).toBe('image');
      
      expect(result).toHaveProperty('scenes');
      expect(result.scenes).toBeDefined();
      expect(result.scenes?.length).toBe(1);
      expect(result.scenes?.[0].elements.length).toBe(1);
      expect(result.scenes?.[0].elements[0].type).toBe('text');
      
      // Check cache and draft were set
      expect(result).toHaveProperty('cache', true);
      expect(result).toHaveProperty('draft', true);
    });
    
    test('should handle fallback path for movie elements', () => {
      // First path fails but second path succeeds
      const mockExecuteWithFallback = {
        getNodeParameter: (
          parameterName: string,
          itemIndex: number,
          fallbackValue?: any
        ) => {
          // Throw error for first path but return elements for second path
          if (parameterName === 'movieElements.elementValues') {
            throw new Error(`Test error - ${parameterName} path failed`);
          }
          
          if (parameterName === 'movieElements') {
            return [
              {
                type: 'image',
                src: 'https://example.com/fallback-image.jpg',
                positionPreset: 'center',
                width: 500,
                height: 300,
                start: 0,
                duration: 5
              }
            ];
          }
          
          // Return default values for basic parameters
          return {
            operation: 'createMovie',
            output_width: 1280,
            output_height: 720,
            framerate: 30,
          }[parameterName] || fallbackValue;
        },
        logger: {
          debug: jest.fn(),
          warn: jest.fn(),
          info: jest.fn(),
          error: jest.fn(),
        }
      };
      
      // Call the function
      const result = buildRequestBody.call(
        mockExecuteWithFallback as unknown as IExecuteFunctions, 
        'createMovie', 
        0, 
        false
      ) as RequestBodyWithElements;
      
      // Verify the result has elements from the fallback path
      expect(result).toHaveProperty('elements');
      const elements = result.elements as any[];
      expect(Array.isArray(elements)).toBe(true);
      expect(elements.length).toBe(1);
      expect(elements[0].type).toBe('image');
      expect(elements[0].src).toBe('https://example.com/fallback-image.jpg');
      
      // Basic movie parameters should still be set
      expect(result).toHaveProperty('fps', 30);
      expect(result).toHaveProperty('width', 1280);
      expect(result).toHaveProperty('height', 720);
    });

    test('should handle error paths for movie elements', () => {
      // Both movie elements paths will fail but we'll still get a valid result
      const mockExecuteWithBothFailing = {
        getNodeParameter: (
          parameterName: string,
          itemIndex: number,
          fallbackValue?: any
        ) => {
          // Throw error for both element paths to hit the error branch
          if (parameterName === 'movieElements.elementValues' ||
              parameterName === 'movieElements') {
            throw new Error(`Test error - ${parameterName} path failed`);
          }
          
          // Return default values for basic parameters
          return {
            operation: 'createMovie',
            output_width: 1280,
            output_height: 720,
            framerate: 30,
          }[parameterName] || fallbackValue;
        },
        logger: {
          debug: jest.fn(),
          warn: jest.fn(),
          info: jest.fn(),
          error: jest.fn(),
        }
      };
      
      // Call the function
      const result = buildRequestBody.call(
        mockExecuteWithBothFailing as unknown as IExecuteFunctions, 
        'createMovie', 
        0, 
        false
      ) as RequestBodyWithElements;
      
      // Verify the result doesn't have movie elements even though all paths failed
      expect(result).not.toHaveProperty('elements');
      
      // Basic movie parameters should still be set
      expect(result).toHaveProperty('fps', 30);
      expect(result).toHaveProperty('width', 1280);
      expect(result).toHaveProperty('height', 720);
    });
    
    test('should handle fallback path for scene elements', () => {
      // First path fails but second path succeeds
      const mockExecuteWithFallback = {
        getNodeParameter: (
          parameterName: string,
          itemIndex: number,
          fallbackValue?: any
        ) => {
          // Throw error for first path but return elements for second path
          if (parameterName === 'elements.elementValues') {
            throw new Error(`Test error - ${parameterName} path failed`);
          }
          
          if (parameterName === 'elements') {
            return [
              {
                type: 'text',
                text: 'Fallback element',
                positionPreset: 'center',
                'font-family': 'Arial',
                'font-size': 32,
                color: '#ffffff',
                start: 0,
                duration: 4
              }
            ];
          }
          
          // Return default values for basic parameters
          return {
            operation: 'createMovie',
            output_width: 1280,
            output_height: 720,
            framerate: 30,
          }[parameterName] || fallbackValue;
        },
        logger: {
          debug: jest.fn(),
          warn: jest.fn(),
          info: jest.fn(),
          error: jest.fn(),
        }
      };
      
      // Call the function
      const result = buildRequestBody.call(
        mockExecuteWithFallback as unknown as IExecuteFunctions, 
        'createMovie', 
        0, 
        false
      ) as RequestBodyWithElements;
      
      // Verify the result has scenes with elements from the fallback path
      expect(result.scenes).toBeDefined();
      const scenes = result.scenes as any[];
      expect(Array.isArray(scenes)).toBe(true);
      expect(scenes.length).toBe(1);
      
      if (scenes.length > 0) {
        expect(scenes[0]).toHaveProperty('elements');
        expect(Array.isArray(scenes[0].elements)).toBe(true);
        expect(scenes[0].elements.length).toBe(1);
        expect(scenes[0].elements[0].type).toBe('text');
        expect(scenes[0].elements[0].text).toBe('Fallback element');
      }
      
      // Basic movie parameters should still be set
      expect(result).toHaveProperty('fps', 30);
      expect(result).toHaveProperty('width', 1280);
      expect(result).toHaveProperty('height', 720);
    });

    test('should handle error paths for scene elements', () => {
      // Both scene elements paths will fail but we'll still get a valid result
      const mockExecuteWithBothFailing = {
        getNodeParameter: (
          parameterName: string,
          itemIndex: number,
          fallbackValue?: any
        ) => {
          // Throw error for all element paths to hit the error branch
          if (parameterName === 'scenes.scene1.elements.elementValues' ||
              parameterName === 'elements' ||
              parameterName === 'elements.elementValues') {
            throw new Error(`Test error - ${parameterName} path failed`);
          }
          
          // Return default values for basic parameters
          return {
            operation: 'createMovie',
            output_width: 1280,
            output_height: 720,
            framerate: 30,
          }[parameterName] || fallbackValue;
        },
        logger: {
          debug: jest.fn(),
          warn: jest.fn(),
          info: jest.fn(),
          error: jest.fn(),
        }
      };
      
      // Call the function
      const result = buildRequestBody.call(
        mockExecuteWithBothFailing as unknown as IExecuteFunctions, 
        'createMovie', 
        0, 
        false
      ) as RequestBodyWithElements;
      
      // Verify the result still has scenes array even though all element paths failed
      expect(result.scenes).toBeDefined();
      const scenes = result.scenes as any[];
      expect(Array.isArray(scenes)).toBe(true);
      expect(scenes.length).toBe(0);
      
      // Basic movie parameters should still be set
      expect(result).toHaveProperty('fps', 30);
      expect(result).toHaveProperty('width', 1280);
      expect(result).toHaveProperty('height', 720);
    });

    test('should specifically process text elements with proper font properties', () => {
      // Test specifically for text element property handling
      const mockExecute = createMockExecuteFunction({
        operation: 'createMovie',
        output_width: 1280,
        output_height: 720,
        framerate: 30,
        elements: [
          {
            type: 'text',
            text: 'Test Font Properties',
            positionPreset: 'center',
            'font-family': 'Roboto',
            'font-size': 48,
            color: '#ff5500',
            start: 2,
            duration: 10
          }
        ]
      });
      
      // Call the function
      const result = buildRequestBody.call(mockExecute, 'createMovie', 0, false) as RequestBodyWithElements;
      
      // Verify text element properties
      expect(result.scenes).toBeDefined();
      const scenes = result.scenes as any[];
      expect(scenes.length).toBe(1);
      expect(scenes[0].elements.length).toBe(1);
      
      const textElement = scenes[0].elements[0];
      expect(textElement.type).toBe('text');
      expect(textElement.text).toBe('Test Font Properties');
      expect(textElement['font-family']).toBe('Roboto');
      expect(textElement['font-size']).toBe(48);
      expect(textElement.color).toBe('#ff5500');
    });
    
    test('should process all element types correctly', () => {
      // Setup mock with various element types to test processElement
      const mockExecute = createMockExecuteFunction({
        operation: 'createMovie',
        output_width: 1280,
        output_height: 720,
        framerate: 30,
        elements: [
          // Image with positionPreset
          {
            type: 'image',
            src: 'https://example.com/image.jpg',
            positionPreset: 'center',
            width: 500,
            height: 300,
            start: 0,
            duration: 5
          },
          // Image with custom position
          {
            type: 'image',
            src: 'https://example.com/image2.jpg',
            positionPreset: 'custom',
            x: 100,
            y: 200,
            width: 400,
            height: 300,
            zoom: 1.5,
            start: 5,
            duration: 5
          },
          // Video
          {
            type: 'video',
            src: 'https://example.com/video.mp4',
            positionPreset: 'bottom_right',
            volume: 0.8,
            muted: false,
            crop: true,
            start: 0,
            duration: 10
          },
          // Video with custom position
          {
            type: 'video',
            src: 'https://example.com/video2.mp4',
            positionPreset: 'custom',
            x: 300,
            y: 400,
            start: 10,
            duration: 5
          },
          // Text
          {
            type: 'text',
            text: 'Hello World',
            positionPreset: 'top_center',
            'font-family': 'Arial',
            'font-size': 32,
            color: '#ffffff',
            start: 0,
            duration: 4
          },
          // Text with custom position
          {
            type: 'text',
            text: 'Custom Position',
            positionPreset: 'custom',
            x: 500,
            y: 300,
            'font-family': 'Verdana',
            'font-size': 24,
            color: '#000000',
            start: 5,
            duration: 4
          },
          // Audio
          {
            type: 'audio',
            src: 'https://example.com/audio.mp3',
            volume: 0.5,
            start: 0,
            duration: -2
          },
          // Voice
          {
            type: 'voice',
            text: 'This is voice over',
            voice: 'en-US-Standard-A',
            start: 0,
            duration: 5
          },
          // Subtitles with text
          {
            type: 'subtitles',
            subtitleSourceType: 'text',
            text: 'Subtitle text',
            language: 'en',
            position: 'bottom-center',
            'font-family': 'Arial',
            'font-size': 24,
            color: '#ffffff',
            'background-color': 'rgba(0,0,0,0.5)',
            style: 'outline',
            opacity: 0.9,
            start: 0,
            duration: -2
          },
          // Subtitles with SRT source
          {
            type: 'subtitles',
            subtitleSourceType: 'src',
            src: 'https://example.com/subs.srt',
            language: 'en',
            position: 'bottom-center',
            start: 0,
            duration: -2
          }
        ]
      });

      // Call the function
      const result = buildRequestBody.call(mockExecute, 'createMovie', 0, false) as RequestBodyWithElements;
      
      // Using simpler assertions to focus on core functionality
      expect(result.scenes).toBeDefined();
      
      // Assert that the proper number of elements are processed
      const scenes = result.scenes;
      
      // Since we know scenes exists and has at least one item with 10 elements in our test scenario,
      // let's perform some basic checks instead of detailed property checks
      expect(scenes).toBeDefined();
      expect(Array.isArray(scenes)).toBe(true);
      expect(scenes && scenes.length).toBeGreaterThan(0);
      
      if (scenes && scenes.length > 0) {
        const firstScene = scenes[0];
        expect(firstScene).toHaveProperty('elements');
        expect(Array.isArray(firstScene.elements)).toBe(true);
        expect(firstScene.elements.length).toBe(10);
        
        // Verify we have elements of different types
        const elementTypes = firstScene.elements.map((el: any) => el.type);
        expect(elementTypes).toContain('image');
        expect(elementTypes).toContain('text');
        expect(elementTypes).toContain('video');
        expect(elementTypes).toContain('audio');
        expect(elementTypes).toContain('voice');
        expect(elementTypes).toContain('subtitles');
      }
    });
  });

  describe('buildMergeVideoAudioRequestBody', () => {
    const createMockExecuteFunction = (parameters: {[key: string]: any}) => {
      const mockExecute = {
        getNodeParameter: (
          parameterName: string,
          itemIndex: number,
          fallbackValue?: any
        ) => {
          // Handle the new element-based structure
          if (parameterName === 'videoElement.videoDetails') {
            return parameters.videoElement?.videoDetails || fallbackValue;
          }
          if (parameterName === 'audioElement.audioDetails') {
            return parameters.audioElement?.audioDetails || fallbackValue;
          }
          if (parameterName === 'outputSettings.outputDetails') {
            return parameters.outputSettings?.outputDetails || fallbackValue;
          }
          
          // Check if the parameter exists (for any legacy parameters)
          if (parameters[parameterName] !== undefined) {
            return parameters[parameterName];
          }
          
          return fallbackValue;
        },
        logger: {
          debug: jest.fn(),
          warn: jest.fn(),
          info: jest.fn(),
          error: jest.fn(),
        }
      };
      
      return mockExecute as unknown as IExecuteFunctions;
    };

    test('should build request body with all parameters using element-based structure', () => {
      // Setup mock with complete parameters
      const mockExecute = createMockExecuteFunction({
        videoElement: {
          videoDetails: {
            src: 'https://example.com/video.mp4',
            start: 1,
            duration: 10,
            speed: 1.5,
            volume: 0
          }
        },
        audioElement: {
          audioDetails: {
            src: 'https://example.com/audio.mp3',
            start: 0,
            duration: 12,
            volume: 0.8,
            loop: true
          }
        },
        outputSettings: {
          outputDetails: {
            width: 1920,
            height: 1080,
            fps: 24,
            quality: 'high',
            format: 'mp4'
          }
        }
      });

      // Call the function
      const result = buildMergeVideoAudioRequestBody.call(mockExecute, 0);
      
      // Verify all parameters were included
      expect(result).toHaveProperty('video', 'https://example.com/video.mp4');
      expect(result).toHaveProperty('audio', 'https://example.com/audio.mp3');
      expect(result).toHaveProperty('fps', 24);
      expect(result).toHaveProperty('width', 1920);
      expect(result).toHaveProperty('height', 1080);
      expect(result).toHaveProperty('quality', 'high');
      
      // Check additional element properties
      expect(result).toHaveProperty('video_start', 1);
      expect(result).toHaveProperty('video_duration', 10);
      expect(result).toHaveProperty('video_speed', 1.5);
      expect(result).toHaveProperty('video_volume', 0);
      expect(result).toHaveProperty('audio_start', 0);
      expect(result).toHaveProperty('audio_duration', 12);
      expect(result).toHaveProperty('audio_volume', 0.8);
      expect(result).toHaveProperty('audio_loop', true);
      expect(result).toHaveProperty('format', 'mp4');
    });

    test('should use default values when only required parameters are provided', () => {
      // Setup mock with minimal required parameters
      const mockExecute = createMockExecuteFunction({
        videoElement: {
          videoDetails: {
            src: 'https://example.com/video.mp4'
          }
        },
        audioElement: {
          audioDetails: {
            src: 'https://example.com/audio.mp3'
          }
        }
      });

      // Call the function
      const result = buildMergeVideoAudioRequestBody.call(mockExecute, 0);
      
      // Verify required parameters and defaults
      expect(result).toHaveProperty('video', 'https://example.com/video.mp4');
      expect(result).toHaveProperty('audio', 'https://example.com/audio.mp3');
      
      // Should have default values or no property
      expect(result).toHaveProperty('width', 1024); // Default width
      expect(result).toHaveProperty('height', 768); // Default height
      expect(result).toHaveProperty('fps', 30); // Default fps
    });
    
    test('should handle missing element collections gracefully', () => {
      // Setup mock with no element collections but with legacy parameters for backward compatibility
      const mockExecute = createMockExecuteFunction({
        // Intentionally no videoElement or audioElement provided
      });

      // Call the function - should not fail
      const result = buildMergeVideoAudioRequestBody.call(mockExecute, 0);
      
      // Should have default values
      expect(result).toHaveProperty('width', 1024);
      expect(result).toHaveProperty('height', 768);
      expect(result).toHaveProperty('fps', 30);
    });
  });

  describe('buildMergeVideosRequestBody', () => {
    const createMockExecuteFunction = (parameters: {[key: string]: any}) => {
      const mockExecute = {
        getNodeParameter: (
          parameterName: string,
          itemIndex: number,
          fallbackValue?: any
        ) => {
          // Handle the new element-based structure
          if (parameterName === 'videoElements.videoDetails') {
            return parameters.videoElements?.videoDetails || fallbackValue;
          }
          if (parameterName === 'transition') {
            return parameters.transition || fallbackValue;
          }
          if (parameterName === 'transitionDuration') {
            return parameters.transitionDuration || fallbackValue;
          }
          if (parameterName === 'outputSettings.outputDetails') {
            return parameters.outputSettings?.outputDetails || fallbackValue;
          }
          
          // Check if the parameter exists (for any legacy parameters)
          if (parameters[parameterName] !== undefined) {
            return parameters[parameterName];
          }
          
          return fallbackValue;
        },
        logger: {
          debug: jest.fn(),
          warn: jest.fn(),
          info: jest.fn(),
          error: jest.fn(),
        }
      };
      
      return mockExecute as unknown as IExecuteFunctions;
    };

    test('should build request body with multiple video elements', () => {
      // Setup mock with complete parameters
      const mockExecute = createMockExecuteFunction({
        videoElements: {
          videoDetails: [
            {
              src: 'https://example.com/video1.mp4',
              start: 0,
              duration: 10,
              speed: 1,
              volume: 0.8
            },
            {
              src: 'https://example.com/video2.mp4',
              start: 2,
              duration: 15,
              speed: 1.2,
              volume: 0.5
            },
            {
              src: 'https://example.com/video3.mp4',
              start: 0,
              duration: -1,
              speed: 1,
              volume: 1
            }
          ]
        },
        transition: 'fade',
        transitionDuration: 1.5,
        outputSettings: {
          outputDetails: {
            width: 1280,
            height: 720,
            fps: 30,
            quality: 'medium',
            format: 'mp4'
          }
        }
      });

      // Call the function
      const result = buildMergeVideosRequestBody.call(mockExecute, 0);
      
      // Check video configurations
      expect(result).toHaveProperty('videos');
      expect(Array.isArray(result.videos)).toBe(true);
      expect(result.videos).toHaveLength(3);
      
      // Check the video properties in the first video element
      const videos = result.videos as IDataObject[];
      expect(videos[0]).toHaveProperty('src', 'https://example.com/video1.mp4');
      expect(videos[0]).toHaveProperty('start', 0);
      expect(videos[0]).toHaveProperty('duration', 10);
      expect(videos[0]).toHaveProperty('speed', 1);
      expect(videos[0]).toHaveProperty('volume', 0.8);
      
      // Verify the second video element
      expect(videos[1]).toHaveProperty('src', 'https://example.com/video2.mp4');
      expect(videos[1]).toHaveProperty('start', 2);
      expect(videos[1]).toHaveProperty('duration', 15);
      expect(videos[1]).toHaveProperty('speed', 1.2);
      expect(videos[1]).toHaveProperty('volume', 0.5);
      
      // Check transition settings
      expect(result).toHaveProperty('transition', 'fade');
      expect(result).toHaveProperty('transition_duration', 1.5);
      
      // Check output settings
      expect(result).toHaveProperty('fps', 30);
      expect(result).toHaveProperty('width', 1280);
      expect(result).toHaveProperty('height', 720);
      expect(result).toHaveProperty('quality', 'medium');
      expect(result).toHaveProperty('format', 'mp4');
    });

    test('should handle empty video elements and use default parameters', () => {
      // Setup mock with empty video elements array
      const mockExecute = createMockExecuteFunction({
        videoElements: {
          videoDetails: []
        }
      });

      // Call the function
      const result = buildMergeVideosRequestBody.call(mockExecute, 0);
      
      // Check the videos array is empty
      expect(result).toHaveProperty('videos');
      expect(Array.isArray(result.videos)).toBe(true);
      expect(result.videos).toHaveLength(0);
      
      // Check defaults were used
      expect(result).toHaveProperty('width', 1024);
      expect(result).toHaveProperty('height', 768);
      expect(result).toHaveProperty('fps', 30);
    });

    test('should handle missing video elements collection', () => {
      // Setup mock with no video elements collection
      const mockExecute = createMockExecuteFunction({
        // No videoElements provided
        outputSettings: {
          outputDetails: {
            width: 1920,
            height: 1080,
            fps: 60
          }
        }
      });

      // Call the function
      const result = buildMergeVideosRequestBody.call(mockExecute, 0);
      
      // Should have empty videos array
      expect(result).toHaveProperty('videos');
      expect(Array.isArray(result.videos)).toBe(true);
      expect(result.videos).toHaveLength(0);
      
      // Should use provided output settings
      expect(result).toHaveProperty('width', 1920);
      expect(result).toHaveProperty('height', 1080);
      expect(result).toHaveProperty('fps', 60);
    });
    
    test('should handle no transition between videos', () => {
      // Setup mock with video elements but no transition
      const mockExecute = createMockExecuteFunction({
        videoElements: {
          videoDetails: [
            { src: 'https://example.com/video1.mp4' },
            { src: 'https://example.com/video2.mp4' }
          ]
        },
        transition: 'none'
      });

      // Call the function
      const result = buildMergeVideosRequestBody.call(mockExecute, 0);
      
      // Check video configurations
      expect(result).toHaveProperty('videos');
      const videos = result.videos as IDataObject[];
      expect(videos).toHaveLength(2);
      
      // Should not have transition properties
      expect(result).not.toHaveProperty('transition_duration');
    });
  });
});