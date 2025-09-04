// __tests__/nodes/CreateJ2vMovie/core/parameterCollector.test.ts

import { IExecuteFunctions } from 'n8n-workflow';
import {
  collectParameters,
  validateCollectedParameters,
  getSafeParameter,
  sanitizeParametersForLogging,
  CollectedParameters,
} from '../../../../nodes/CreateJ2vMovie/core/parameterCollector';

const createMockExecute = (parameters: Record<string, any> = {}): IExecuteFunctions => {
  return {
    getNodeParameter: jest.fn((paramName: string, itemIndex: number, defaultValue?: any) => {
      if (parameters.hasOwnProperty(paramName)) {
        return parameters[paramName];
      }
      if (defaultValue !== undefined) {
        return defaultValue;
      }
      return undefined;
    })
  } as unknown as IExecuteFunctions;
};

describe('parameterCollector', () => {

  describe('collectParameters - createMovie workflow', () => {
    it('should process basic mode minimal parameters', () => {
      const mockExecute = createMockExecute({ advancedMode: false });
      const result = collectParameters(mockExecute, 0, 'createMovie');

      expect(result.action).toBe('createMovie');
      expect(result.isAdvancedMode).toBe(false);
      expect(result.movieElements).toEqual([]);
      expect(result.sceneElements).toEqual([]);
    });

    it('should process basic mode with full config', () => {
      const mockExecute = createMockExecute({
        advancedMode: false,
        output_width: 1920,
        output_height: 1080,
        framerate: 30,
        quality: 'high',
        'movieElements.elementValues': [{ type: 'text', text: 'Movie title' }],
        'elements.elementValues': [{ type: 'video', src: 'video.mp4' }]
      });

      const result = collectParameters(mockExecute, 0, 'createMovie');

      expect(result.width).toBe(1920);
      expect(result.height).toBe(1080);
      expect(result.fps).toBe(30);
      expect(result.quality).toBe('high');
      expect(result.movieElements).toHaveLength(1);
      expect(result.sceneElements).toHaveLength(1);
    });

    it('should process advanced mode with template', () => {
      const mockExecute = createMockExecute({
        advancedMode: true,
        jsonTemplate: '{"scenes":[]}',
        outputWidth: 1280,
        quality: 'medium'
      });

      const result = collectParameters(mockExecute, 0, 'createMovie');

      expect(result.isAdvancedMode).toBe(true);
      expect(result.jsonTemplate).toBe('{"scenes":[]}');
      expect(result.advancedOverrides).toEqual({
        width: 1280,
        quality: 'medium'
      });
    });
  });

  describe('collectParameters - mergeVideoAudio workflow', () => {
    it('should process basic mode complete', () => {
      const mockExecute = createMockExecute({
        advancedModeMergeAudio: false,
        'videoElement.videoDetails': { src: 'video.mp4', volume: 1 },
        'audioElement.audioDetails': { src: 'audio.mp3', volume: 0.8 },
        'outputSettings.outputDetails': { width: 1920, height: 1080 }
      });

      const result = collectParameters(mockExecute, 0, 'mergeVideoAudio');

      expect(result.action).toBe('mergeVideoAudio');
      expect(result.mergeVideoAudio?.videoElement?.src).toBe('video.mp4');
      expect(result.mergeVideoAudio?.audioElement?.src).toBe('audio.mp3');
    });

    it('should process advanced mode', () => {
      const mockExecute = createMockExecute({
        advancedModeMergeAudio: true,
        jsonTemplateMergeAudio: '{"scenes":[]}',
        framerate: 25
      });

      const result = collectParameters(mockExecute, 0, 'mergeVideoAudio');

      expect(result.isAdvancedMode).toBe(true);
      expect(result.jsonTemplate).toBe('{"scenes":[]}');
      expect(result.advancedOverrides?.fps).toBe(25);
    });
  });

  describe('collectParameters - mergeVideos workflow', () => {
    it('should process basic mode complete', () => {
      const mockExecute = createMockExecute({
        advancedModeMergeVideos: false,
        'videoElements.videoDetails': [{ src: 'video1.mp4' }, { src: 'video2.mp4' }],
        transition: 'fade',
        transitionDuration: 2
      });

      const result = collectParameters(mockExecute, 0, 'mergeVideos');

      expect(result.action).toBe('mergeVideos');
      expect(result.mergeVideos?.videoElements).toHaveLength(2);
      expect(result.mergeVideos?.transition).toBe('fade');
      expect(result.mergeVideos?.transitionDuration).toBe(2);
    });

    it('should process advanced mode', () => {
      const mockExecute = createMockExecute({
        advancedModeMergeVideos: true,
        jsonTemplateMergeVideos: '{"scenes":[]}',
        resolution: 'hd'
      });

      const result = collectParameters(mockExecute, 0, 'mergeVideos');

      expect(result.isAdvancedMode).toBe(true);
      expect(result.jsonTemplate).toBe('{"scenes":[]}');
      expect(result.advancedOverrides?.resolution).toBe('hd');
    });
  });

  describe('error handling', () => {
    it('should handle unknown workflow type', () => {
      const mockExecute = createMockExecute({});

      expect(() => collectParameters(mockExecute, 0, 'unknownWorkflow' as any))
        .toThrow('Unsupported action type: unknownWorkflow');
    });

    it('should handle parameter access errors', () => {
      const mockExecute = {
        getNodeParameter: jest.fn(() => {
          throw new Error('Parameter access failed');
        })
      } as unknown as IExecuteFunctions;

      expect(() => collectParameters(mockExecute, 0, 'createMovie'))
        .toThrow('Parameter access failed');
    });

    it('should default to basic mode when advanced mode parameter missing', () => {
      const mockExecute = createMockExecute({});
      const result = collectParameters(mockExecute, 0, 'createMovie');

      expect(result.isAdvancedMode).toBe(false);
    });

    it('should handle collection parameter errors gracefully', () => {
      const mockExecute = {
        getNodeParameter: jest.fn((paramName: string, itemIndex: number, defaultValue?: any) => {
          if (paramName.includes('elementValues') || paramName.includes('Details')) {
            throw new Error('Collection parameter access failed');
          }
          return defaultValue;
        })
      } as unknown as IExecuteFunctions;

      const result = collectParameters(mockExecute, 0, 'createMovie');

      expect(result.movieElements).toEqual([]);
      expect(result.sceneElements).toEqual([]);
    });

    it('should handle mergeVideoAudio collection errors gracefully', () => {
      const mockExecute = {
        getNodeParameter: jest.fn((paramName: string, itemIndex: number, defaultValue?: any) => {
          if (paramName.includes('Details')) {
            throw new Error('Collection parameter access failed');
          }
          return defaultValue;
        })
      } as unknown as IExecuteFunctions;

      const result = collectParameters(mockExecute, 0, 'mergeVideoAudio');

      expect(result.mergeVideoAudio?.videoElement).toEqual({});
      expect(result.mergeVideoAudio?.audioElement).toEqual({});
      expect(result.mergeVideoAudio?.outputSettings).toEqual({});
    });

    it('should handle mergeVideos collection errors gracefully', () => {
      const mockExecute = {
        getNodeParameter: jest.fn((paramName: string, itemIndex: number, defaultValue?: any) => {
          if (paramName.includes('Details')) {
            throw new Error('Collection parameter access failed');
          }
          return defaultValue;
        })
      } as unknown as IExecuteFunctions;

      const result = collectParameters(mockExecute, 0, 'mergeVideos');

      expect(result.mergeVideos?.videoElements).toEqual([]);
      expect(result.mergeVideos?.outputSettings).toEqual({});
    });

    it('should handle advanced mode parameter collection errors', () => {
      const mockExecute = {
        getNodeParameter: jest.fn((paramName: string, itemIndex: number, defaultValue?: any) => {
          // Return basic values needed for workflow setup
          if (paramName === 'jsonTemplate') return '{}';
          if (paramName === 'advancedMode') return true;
          if (paramName === 'recordId') return '';
          if (paramName === 'webhookUrl') return '';

          // These should work
          if (paramName === 'outputWidth') return 1920;
          if (paramName === 'framerate') return 30;
          if (paramName === 'quality') return 'high';

          // These should fail and be caught by try-catch blocks
          if (paramName === 'outputHeight') throw new Error('Height access failed');
          if (paramName === 'resolution') throw new Error('Resolution access failed');
          if (paramName === 'cache') throw new Error('Cache access failed');
          if (paramName === 'draft') throw new Error('Draft access failed');

          return defaultValue;
        })
      } as unknown as IExecuteFunctions;

      const result = collectParameters(mockExecute, 0, 'createMovie');

      // Should have parameters that worked
      expect(result.advancedOverrides?.width).toBe(1920);
      expect(result.advancedOverrides?.fps).toBe(30);
      expect(result.advancedOverrides?.quality).toBe('high');

      // Should not have parameters that failed (caught by try-catch)
      expect(result.advancedOverrides?.height).toBeUndefined();
      expect(result.advancedOverrides?.resolution).toBeUndefined();
      expect(result.advancedOverrides?.cache).toBeUndefined();
      expect(result.advancedOverrides?.draft).toBeUndefined();
    });

    it('should handle undefined values in advanced mode parameters', () => {
      const mockExecute = {
        getNodeParameter: jest.fn((paramName: string, itemIndex: number, defaultValue?: any) => {
          if (paramName === 'jsonTemplate') return '{}';
          if (paramName === 'advancedMode') return true;
          if (paramName === 'recordId') return '';
          if (paramName === 'webhookUrl') return '';

          // Return undefined for all advanced override parameters to test line 365 and 377-380
          return undefined;
        })
      } as unknown as IExecuteFunctions;

      const result = collectParameters(mockExecute, 0, 'createMovie');

      // Should have empty advancedOverrides object when all parameters are undefined
      expect(result.advancedOverrides).toEqual({});
    });
  });

  describe('validateCollectedParameters', () => {
    it('should validate valid createMovie basic parameters', () => {
      const parameters = {
        action: 'createMovie' as const,
        isAdvancedMode: false,
        movieElements: [{ type: 'text', text: 'Hello' }],
        sceneElements: []
      };

      const errors = validateCollectedParameters(parameters);
      expect(errors).toEqual([]);
    });

    it('should validate valid advanced mode parameters', () => {
      const parameters = {
        action: 'createMovie' as const,
        isAdvancedMode: true,
        jsonTemplate: '{"scenes":[]}'
      };

      const errors = validateCollectedParameters(parameters);
      expect(errors).toEqual([]);
    });

    it('should require workflow type', () => {
      const parameters = {
        isAdvancedMode: false
      } as any;

      const errors = validateCollectedParameters(parameters);
      expect(errors).toEqual(['Action type is required']);
    });

    it('should require JSON template in advanced mode', () => {
      const parameters = {
        action: 'createMovie' as const,
        isAdvancedMode: true
      };

      const errors = validateCollectedParameters(parameters);
      expect(errors).toContain('JSON template is required in advanced mode');
    });

    it('should validate JSON template format', () => {
      const parameters = {
        action: 'createMovie' as const,
        isAdvancedMode: true,
        jsonTemplate: 'invalid json {'
      };

      const errors = validateCollectedParameters(parameters);
      expect(errors).toContain('JSON template must be valid JSON');
    });

    it('should require content in basic createMovie mode', () => {
      const parameters = {
        action: 'createMovie' as const,
        isAdvancedMode: false,
        movieElements: [],
        sceneElements: []
      };

      const errors = validateCollectedParameters(parameters);
      expect(errors).toContain('At least one movie element or scene element is required');
    });

    it('should allow createMovie with only movie elements', () => {
      const parameters = {
        action: 'createMovie' as const,
        isAdvancedMode: false,
        movieElements: [{ type: 'text', text: 'Hello' }],
        sceneElements: []
      };

      const errors = validateCollectedParameters(parameters);
      expect(errors).toEqual([]);
    });

    it('should allow createMovie with only scene elements', () => {
      const parameters = {
        action: 'createMovie' as const,
        isAdvancedMode: false,
        movieElements: [],
        sceneElements: [{ type: 'video', src: 'video.mp4' }]
      };

      const errors = validateCollectedParameters(parameters);
      expect(errors).toEqual([]);
    });

    it('should require video and audio sources for mergeVideoAudio', () => {
      const parameters = {
        action: 'mergeVideoAudio' as const,
        isAdvancedMode: false,
        mergeVideoAudio: {
          videoElement: {},
          audioElement: {}
        }
      };

      const errors = validateCollectedParameters(parameters);
      expect(errors).toEqual(['Both video and audio sources are required for mergeVideoAudio action']);
    });

    it('should allow mergeVideoAudio with both sources', () => {
      const parameters = {
        action: 'mergeVideoAudio' as const,
        isAdvancedMode: false,
        mergeVideoAudio: {
          videoElement: { src: 'video.mp4' },
          audioElement: { src: 'audio.mp3' }
        }
      };

      const errors = validateCollectedParameters(parameters);
      expect(errors).toEqual([]);
    });

    it('should handle missing mergeVideoAudio object', () => {
      const parameters = {
        action: 'mergeVideoAudio' as const,
        isAdvancedMode: false
      };

      const errors = validateCollectedParameters(parameters);
      expect(errors).toEqual(['Both video and audio sources are required for mergeVideoAudio action']);
    });

    it('should require sufficient videos for mergeVideos', () => {
      const parameters = {
        action: 'mergeVideos' as const,
        isAdvancedMode: false,
        mergeVideos: {
          videoElements: [{ src: 'video1.mp4' }]
        }
      };

      const errors = validateCollectedParameters(parameters);
      expect(errors).toEqual(['At least 2 video sources are required for mergeVideos action']);
    });

    it('should allow mergeVideos with sufficient videos', () => {
      const parameters = {
        action: 'mergeVideos' as const,
        isAdvancedMode: false,
        mergeVideos: {
          videoElements: [{ src: 'v1.mp4' }, { src: 'v2.mp4' }]
        }
      };

      const errors = validateCollectedParameters(parameters);
      expect(errors).toEqual([]);
    });

    it('should handle missing mergeVideos object', () => {
      const parameters = {
        action: 'mergeVideos' as const,
        isAdvancedMode: false
      };

      const errors = validateCollectedParameters(parameters);
      expect(errors).toEqual(['At least 2 video sources are required for mergeVideos action']);
    });

    it('should validate recordId type', () => {
      const parameters = {
        action: 'createMovie' as const,
        isAdvancedMode: false,
        movieElements: [{ type: 'text', text: 'Hello' }],
        recordId: 123 as any
      };

      const errors = validateCollectedParameters(parameters);
      expect(errors).toContain('Invalid type for recordId: must be a string');
    });

    it('should validate webhookUrl type', () => {
      const parameters = {
        action: 'createMovie' as const,
        isAdvancedMode: false,
        movieElements: [{ type: 'text', text: 'Hello' }],
        webhookUrl: true as any
      };

      const errors = validateCollectedParameters(parameters);
      expect(errors).toContain('Invalid type for webhookUrl: must be a string');
    });
  });

  describe('getSafeParameter', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should return existing parameter value', () => {
      const mockExecute = createMockExecute({ testParam: 'expected' });
      const result = getSafeParameter(mockExecute, 'testParam', 0, 'default');
      expect(result).toBe('expected');
    });

    it('should return parameter with type validation', () => {
      const mockExecute = createMockExecute({ numberParam: 42 });
      const result = getSafeParameter(mockExecute, 'numberParam', 0, 0, 'number');
      expect(result).toBe(42);
    });

    it('should use default for missing parameter', () => {
      const mockExecute = createMockExecute({});
      const result = getSafeParameter(mockExecute, 'missingParam', 0, 'default');
      expect(result).toBe('default');
    });

    it('should use default for wrong type parameter', () => {
      const mockExecute = createMockExecute({ wrongType: 'string-value' });

      const result = getSafeParameter(mockExecute, 'wrongType', 0, 'default', 'number');

      expect(result).toBe('default');
    });

    it('should use default when parameter access throws error', () => {
      const mockExecute = {
        getNodeParameter: jest.fn(() => {
          throw new Error('Access error');
        })
      } as unknown as IExecuteFunctions;

      const result = getSafeParameter(mockExecute, 'errorParam', 0, 'default');

      expect(result).toBe('default');
    });
  });

  describe('sanitizeParametersForLogging', () => {
    it('should truncate long JSON template and preserve original', () => {
      const input = {
        action: 'createMovie' as const,
        isAdvancedMode: true,
        jsonTemplate: 'x'.repeat(300),
        webhookUrl: 'https://sensitive.com'
      };
      const originalTemplate = input.jsonTemplate;

      const result = sanitizeParametersForLogging(input);

      expect(result.jsonTemplate).toBe('x'.repeat(200) + '...[truncated]');
      expect(result.webhookUrl).toBe('[WEBHOOK_URL]');
      expect(input.jsonTemplate).toBe(originalTemplate);
    });

    it('should preserve short JSON template', () => {
      const input = {
        action: 'createMovie' as const,
        isAdvancedMode: true,
        jsonTemplate: '{"scenes":[]}',
        recordId: 'safe-id'
      };

      const result = sanitizeParametersForLogging(input);

      expect(result.jsonTemplate).toBe('{"scenes":[]}');
      expect(result.recordId).toBe('safe-id');
      expect(result.action).toBe('createMovie');
    });

    it('should handle parameters without sensitive data', () => {
      const input = {
        action: 'createMovie' as const,
        isAdvancedMode: false,
        recordId: 'public-id'
      };

      const result = sanitizeParametersForLogging(input);

      expect(result.action).toBe('createMovie');
      expect(result.recordId).toBe('public-id');
      expect(result.isAdvancedMode).toBe(false);
    });
  });

  describe('edge cases and boundary conditions', () => {
    it('should handle empty strings for recordId and webhookUrl', () => {
      const mockExecute = createMockExecute({ recordId: '', webhookUrl: '   ' });
      const result = collectParameters(mockExecute, 0, 'createMovie');

      expect(result.recordId).toBeUndefined();
      expect(result.webhookUrl).toBeUndefined();
    });

    it('should handle non-empty recordId and webhookUrl', () => {
      const mockExecute = createMockExecute({
        recordId: '  test-123  ',
        webhookUrl: '  https://example.com  '
      });
      const result = collectParameters(mockExecute, 0, 'createMovie');

      expect(result.recordId).toBe('test-123');
      expect(result.webhookUrl).toBe('https://example.com');
    });

    it('should handle mergeVideoAudio with missing videoElement', () => {
      const parameters = {
        action: 'mergeVideoAudio' as const,
        isAdvancedMode: false,
        mergeVideoAudio: {
          audioElement: { src: 'audio.mp3' }
          // Missing videoElement entirely
        }
      };

      const errors = validateCollectedParameters(parameters);
      expect(errors).toEqual(['Both video and audio sources are required for mergeVideoAudio action']);
    });

    it('should validate mergeVideoAudio when video src exists but audio src missing', () => {
      const parameters = {
        action: 'mergeVideoAudio' as const,
        isAdvancedMode: false,
        mergeVideoAudio: {
          videoElement: { src: 'video.mp4' }
        }
      };

      const errors = validateCollectedParameters(parameters);
      expect(errors).toEqual(['Both video and audio sources are required for mergeVideoAudio action']);
    });

    it('should handle high item indices', () => {
      const mockExecute = createMockExecute({ advancedMode: false });
      const result = collectParameters(mockExecute, 999, 'createMovie');

      expect(result.action).toBe('createMovie');
    });

    it('should preserve parameter types during collection', () => {
      const mockExecute = createMockExecute({
        advancedMode: false,
        output_width: 1920,
        cache: true,
        quality: 'high',
        'movieElements.elementValues': [{ type: 'text' }]
      });

      const result = collectParameters(mockExecute, 0, 'createMovie');

      expect(typeof result.width).toBe('number');
      expect(typeof result.cache).toBe('boolean');
      expect(typeof result.quality).toBe('string');
      expect(Array.isArray(result.movieElements)).toBe(true);
    });

    it('should handle undefined movieElements and sceneElements', () => {
      const parameters = {
        action: 'createMovie' as const,
        isAdvancedMode: false,
        movieElements: undefined,
        sceneElements: undefined
      };

      const errors = validateCollectedParameters(parameters);
      expect(errors).toContain('At least one movie element or scene element is required');
    });
  });

  it('should handle successful advanced mode parameter retrieval', () => {
    const mockExecute = {
      getNodeParameter: jest.fn((paramName: string, itemIndex: number, defaultValue?: any) => {
        if (paramName === 'jsonTemplate') return '{}';
        if (paramName === 'advancedMode') return true;
        if (paramName === 'recordId') return '';
        if (paramName === 'webhookUrl') return '';

        // These should successfully return values (covering the success branches)
        if (paramName === 'outputHeight') return 720;    // Line 368-369
        if (paramName === 'resolution') return 'hd';     // Lines 388-389
        if (paramName === 'cache') return false;         // Lines 391-392
        if (paramName === 'draft') return true;          // Lines 393-394

        return defaultValue;
      })
    } as unknown as IExecuteFunctions;

    const result = collectParameters(mockExecute, 0, 'createMovie');

    expect(result.advancedOverrides?.height).toBe(720);
    expect(result.advancedOverrides?.resolution).toBe('hd');
    expect(result.advancedOverrides?.cache).toBe(false);
    expect(result.advancedOverrides?.draft).toBe(true);
  });

  it('should sanitize webhookUrl in logging', () => {
    const input = {
      action: 'createMovie' as const,
      isAdvancedMode: false,
      webhookUrl: 'https://webhook.example.com/secret'  // Ensure this triggers line 437
    };

    const result = sanitizeParametersForLogging(input);

    expect(result.webhookUrl).toBe('[WEBHOOK_URL]');
  });
});