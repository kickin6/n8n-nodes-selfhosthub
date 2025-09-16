// __tests__/nodes/CreateJ2vMovie/core/parameterCollector.test.ts

import { 
  collectParameters, 
  validateCollectedParameters,
  CollectedParameters,
  OperationSettings,
  ParameterValidationResult
} from '../../../../nodes/CreateJ2vMovie/core/parameterCollector';

interface ExportConfig {
  type?: string;
  webhook?: {
    url: string;
    method?: string;
  };
  ftp?: {
    host: string;
    username: string;
    password: string;
    port: number;
    path: string;
    secure: boolean;
  };
  email?: {
    to: string;
    from?: string;
    subject?: string;
    message?: string;
  };
}

function createMockExecute(params: Record<string, any>) {
  return {
    getNodeParameter: (paramName: string, itemIndex: number, defaultValue?: any) => {
      return params[paramName] !== undefined ? params[paramName] : defaultValue;
    }
  } as any;
}

describe('core/parameterCollector', () => {
  describe('collectParameters', () => {
    describe('basic functionality', () => {
      it('should collect basic createMovie parameters', () => {
        const mockExecute = createMockExecute({
          operation: 'createMovie',
          advancedMode: false,
          movieElements: { elementValues: [{ type: 'subtitles', captions: 'test.srt' }] },
          sceneElements: { elementValues: [{ type: 'image', src: 'test.jpg' }] }
        });

        const result = collectParameters.call(mockExecute, 0);
        
        expect(result.operation).toBe('createMovie');
        expect(result.isAdvancedMode).toBe(false);
        expect(result.movieElements).toEqual([{ type: 'subtitles', captions: 'test.srt' }]);
        expect(result.sceneElements).toEqual([{ type: 'image', src: 'test.jpg' }]);
      });

      it('should collect advanced mode parameters', () => {
        const mockExecute = createMockExecute({
          operation: 'createMovie',
          advancedMode: true,
          jsonTemplate: '{"width": 1920, "height": 1080}'
        });

        const result = collectParameters.call(mockExecute, 0);
        
        expect(result.operation).toBe('createMovie');
        expect(result.isAdvancedMode).toBe(true);
        expect(result.jsonTemplate).toBe('{"width": 1920, "height": 1080}');
      });

      it('should use default itemIndex when not provided', () => {
        const mockExecute = {
          getNodeParameter: jest.fn((paramName: string, itemIndex: number, defaultValue?: any) => {
            // Verify that itemIndex 0 is used when no argument provided
            expect(itemIndex).toBe(0);
            
            const params: Record<string, any> = {
              operation: 'createMovie',
              advancedMode: false,
              movieElements: { elementValues: [{ type: 'text', text: 'test' }] }
            };
            return params[paramName] !== undefined ? params[paramName] : defaultValue;
          })
        } as any;

        // Call without itemIndex argument to test default parameter value
        const result = collectParameters.call(mockExecute);
        
        expect(result.operation).toBe('createMovie');
        expect(result.isAdvancedMode).toBe(false);
        expect(result.movieElements).toEqual([{ type: 'text', text: 'test' }]);
        
        // Verify that getNodeParameter was called with itemIndex 0
        expect(mockExecute.getNodeParameter).toHaveBeenCalledWith('operation', 0, 'createMovie');
      });
    });

    describe('createMovie operation', () => {
      it('should collect createMovie parameters with resolution mapping', () => {
        const mockExecute = createMockExecute({
          operation: 'createMovie',
          advancedMode: false,
          outputSettings: {
            outputDetails: { resolution: 'hd', width: 1280, height: 720 }
          }
        });

        const result = collectParameters.call(mockExecute, 0);
        
        expect(result.operation).toBe('createMovie');
        expect(result.isAdvancedMode).toBe(false);
        expect(result.movieElements).toEqual([]);
        expect(result.sceneElements).toEqual([]);
        expect(result.operationSettings?.outputSettings?.resolution).toBe('hd');
        expect(result.operationSettings?.outputSettings?.width).toBe(1280);
        expect(result.operationSettings?.outputSettings?.height).toBe(720);
      });

      it('should handle single element values as arrays', () => {
        const mockExecute = createMockExecute({
          operation: 'createMovie',
          advancedMode: false,
          movieElements: {
            elementValues: { type: 'subtitles', captions: 'Single subtitle' }
          },
          sceneElements: {
            elementValues: { type: 'video', src: 'single-video.mp4' }
          }
        });

        const result = collectParameters.call(mockExecute, 0);

        expect(result.movieElements).toEqual([{ type: 'subtitles', captions: 'Single subtitle' }]);
        expect(result.sceneElements).toEqual([{ type: 'video', src: 'single-video.mp4' }]);
      });
    });

    describe('mergeVideoAudio operation', () => {
      it('should collect mergeVideoAudio parameters correctly', () => {
        const mockExecute = createMockExecute({
          operation: 'mergeVideoAudio',
          advancedModeMergeVideoAudio: false,
          videoElement: { 
            videoDetails: { src: 'video.mp4', volume: 1 } 
          },
          audioElement: { 
            audioDetails: { src: 'audio.mp3', volume: 0.8 } 
          },
          outputSettings: {
            outputDetails: { width: 1920, height: 1080, quality: 'high' }
          }
        });

        const result = collectParameters.call(mockExecute, 0);
        
        expect(result.operation).toBe('mergeVideoAudio');
        expect(result.sceneElements).toHaveLength(2);
        expect(result.sceneElements[0]).toEqual({ type: 'video', src: 'video.mp4', volume: 1 });
        expect(result.sceneElements[1]).toEqual({ type: 'audio', src: 'audio.mp3', volume: 0.8 });
        expect(result.movieElements).toEqual([]);
      });

      it('should handle missing element collections', () => {
        const mockExecute = createMockExecute({
          operation: 'mergeVideoAudio',
          advancedModeMergeVideoAudio: false
        });

        const result = collectParameters.call(mockExecute, 0);
        
        expect(result.sceneElements).toEqual([]);
      });

      it('should handle missing videoElement', () => {
        const mockExecute = createMockExecute({
          operation: 'mergeVideoAudio',
          advancedModeMergeVideoAudio: false,
          audioElement: { 
            audioDetails: { src: 'audio.mp3', volume: 0.8 } 
          }
        });

        const result = collectParameters.call(mockExecute, 0);
        
        expect(result.sceneElements).toHaveLength(1);
        expect(result.sceneElements[0]).toEqual({ type: 'audio', src: 'audio.mp3', volume: 0.8 });
      });

      it('should handle missing audioElement', () => {
        const mockExecute = createMockExecute({
          operation: 'mergeVideoAudio',
          advancedModeMergeVideoAudio: false,
          videoElement: { 
            videoDetails: { src: 'video.mp4', volume: 1 } 
          }
        });

        const result = collectParameters.call(mockExecute, 0);
        
        expect(result.sceneElements).toHaveLength(1);
        expect(result.sceneElements[0]).toEqual({ type: 'video', src: 'video.mp4', volume: 1 });
      });
    });

    describe('mergeVideos operation', () => {
      it('should collect mergeVideos parameters correctly', () => {
        const mockExecute = createMockExecute({
          operation: 'mergeVideos',
          advancedModeMergeVideos: false,
          videoElements: { 
            elementValues: [
              { src: 'video1.mp4', duration: 5 },
              { src: 'video2.mp4', duration: 3 }
            ] 
          },
          transition: 'fade',
          transitionDuration: 1.5,
          outputSettings: {
            outputDetails: { width: 1920, height: 1080 }
          }
        });

        const result = collectParameters.call(mockExecute, 0);
        
        expect(result.sceneElements).toHaveLength(2);
        expect(result.sceneElements[0]).toEqual({ type: 'video', src: 'video1.mp4', duration: 5 });
        expect(result.sceneElements[1]).toEqual({ type: 'video', src: 'video2.mp4', duration: 3 });
        expect(result.operationSettings?.transition).toBe('fade');
        expect(result.operationSettings?.transitionDuration).toBe(1.5);
      });

      it('should handle single video element not in array for mergeVideos', () => {
        const mockExecute = createMockExecute({
          operation: 'mergeVideos',
          advancedModeMergeVideos: false,
          videoElements: { 
            elementValues: { src: 'single-video.mp4', duration: 5 }
          }
        });

        const result = collectParameters.call(mockExecute, 0);
        
        expect(result.sceneElements).toHaveLength(1);
        expect(result.sceneElements[0]).toEqual({ type: 'video', src: 'single-video.mp4', duration: 5 });
      });

      it('should handle missing videoElements collection', () => {
        const mockExecute = createMockExecute({
          operation: 'mergeVideos',
          advancedModeMergeVideos: false,
          transition: 'fade',
          transitionDuration: 1.0
        });

        const result = collectParameters.call(mockExecute, 0);
        
        expect(result.sceneElements).toEqual([]);
        expect(result.operationSettings?.transition).toBe('fade');
        expect(result.operationSettings?.transitionDuration).toBe(1.0);
      });

      it('should use default transition settings when parameters are not available', () => {
        const mockExecute = {
          getNodeParameter: (paramName: string, itemIndex: number, defaultValue?: any) => {
            if (paramName === 'operation') return 'mergeVideos';
            if (paramName === 'advancedModeMergeVideos') return false;
            if (paramName === 'transition' || paramName === 'transitionDuration') {
              throw new Error('Parameter not available');
            }
            return defaultValue;
          }
        } as any;

        const result = collectParameters.call(mockExecute, 0);
        
        expect(result.operationSettings?.transition).toBe('none');
        expect(result.operationSettings?.transitionDuration).toBe(1);
      });
    });

    describe('operation parameter mapping', () => {
      it('should handle operation to operation mapping', () => {
        const mockExecute = createMockExecute({
          operation: 'createMovie',
          advancedMode: false
        });

        const result = collectParameters.call(mockExecute, 0);
        
        expect(result.operation).toBe('createMovie');
      });

      it('should prefer operation parameter (standard n8n convention)', () => {
        const mockExecute = createMockExecute({
          operation: 'mergeVideos',
          advancedModeMergeVideos: false
        });

        const result = collectParameters.call(mockExecute, 0);
        
        expect(result.operation).toBe('mergeVideos');
      });
    });

    describe('advanced mode JSON template mapping', () => {
      it('should map jsonTemplateMergeVideoAudio correctly', () => {
        const mockExecute = createMockExecute({
          operation: 'mergeVideoAudio',
          advancedModeMergeVideoAudio: true,
          jsonTemplateMergeVideoAudio: '{"audio": {"volume": 0.5}}'
        });

        const result = collectParameters.call(mockExecute, 0);
        
        expect(result.jsonTemplate).toBe('{"audio": {"volume": 0.5}}');
      });

      it('should map jsonTemplateMergeVideos correctly', () => {
        const mockExecute = createMockExecute({
          operation: 'mergeVideos',
          advancedModeMergeVideos: true,
          jsonTemplateMergeVideos: '{"transition": "crossfade"}'
        });

        const result = collectParameters.call(mockExecute, 0);
        
        expect(result.jsonTemplate).toBe('{"transition": "crossfade"}');
      });

      it('should handle missing operation-specific template', () => {
        const mockExecute = createMockExecute({
          operation: 'unknownOperation',
          advancedMode: true
        });

        const result = collectParameters.call(mockExecute, 0);
        
        expect(result.jsonTemplate).toBeUndefined();
      });
    });

    describe('export configurations', () => {
      it('should collect webhook export correctly', () => {
        const mockExecute = createMockExecute({
          operation: 'createMovie',
          advancedMode: false,
          exportSettings: {
            exportValues: [{
              exportType: 'webhook',
              webhookUrl: 'https://api.example.com/webhook',
              webhookMethod: 'POST'
            }]
          }
        });

        const result = collectParameters.call(mockExecute, 0);
        
        expect(result.exportConfigs).toHaveLength(1);
        expect(result.exportConfigs![0]).toMatchObject({
          webhook: {
            url: 'https://api.example.com/webhook'
          }
        });
      });

      it('should handle single export value (not in array)', () => {
        const mockExecute = createMockExecute({
          operation: 'createMovie',
          advancedMode: false,
          exportSettings: {
            exportValues: {  // Single object, not array - tests line 247 branch
              exportType: 'webhook',
              webhookUrl: 'https://api.example.com/webhook'
            }
          }
        });

        const result = collectParameters.call(mockExecute, 0);
        
        expect(result.exportConfigs).toHaveLength(1);
        expect(result.exportConfigs![0]).toMatchObject({
          webhook: { url: 'https://api.example.com/webhook' }
        });
      });

      it('should collect FTP export with secure defaults', () => {
        const mockExecute = createMockExecute({
          operation: 'createMovie',
          advancedMode: false,
          exportSettings: {
            exportValues: [{
              exportType: 'ftp',
              ftpHost: 'ftp.example.com',
              ftpUsername: 'user',
              ftpPassword: 'pass',
              ftpPort: 21,
              ftpSecure: true
            }]
          }
        });

        const result = collectParameters.call(mockExecute, 0);
        
        const expectedConfig: ExportConfig = {
          ftp: {
            host: 'ftp.example.com',
            username: 'user',
            password: 'pass',
            port: 21,
            path: '/',
            secure: true
          }
        };

        expect(result.exportConfigs).toHaveLength(1);
        expect(result.exportConfigs![0]).toMatchObject(expectedConfig);
      });

      it('should use default values for missing FTP fields', () => {
        const mockExecute = createMockExecute({
          operation: 'createMovie',
          advancedMode: false,
          exportSettings: {
            exportValues: [{
              exportType: 'ftp',
              ftpHost: 'ftp.example.com'
            }]
          }
        });

        const result = collectParameters.call(mockExecute, 0);
        
        expect(result.exportConfigs).toHaveLength(1);
        expect(result.exportConfigs![0]).toMatchObject({
          ftp: {
            host: 'ftp.example.com',
            username: '',
            password: '',
            port: 21,
            path: '/',
            secure: false
          }
        });
      });

      it('should collect email export with optional fields', () => {
        const mockExecute = createMockExecute({
          operation: 'createMovie',
          advancedMode: false,
          exportSettings: {
            exportValues: [{
              exportType: 'email',
              emailTo: 'recipient@example.com',
              emailFrom: 'sender@example.com',
              emailSubject: 'Video Complete',
              emailMessage: 'Your video is ready!'
            }]
          }
        });

        const result = collectParameters.call(mockExecute, 0);
        
        expect(result.exportConfigs).toHaveLength(1);
        expect(result.exportConfigs![0]).toMatchObject({
          email: {
            to: 'recipient@example.com',
            from: 'sender@example.com',
            subject: 'Video Complete',
            message: 'Your video is ready!'
          }
        });
      });

      it('should filter out invalid export configurations', () => {
        const mockExecute = createMockExecute({
          operation: 'createMovie',
          advancedMode: false,
          exportSettings: {
            exportValues: [
              { exportType: 'webhook' },
              { exportType: 'ftp' },
              { exportType: 'email' }
            ]
          }
        });

        const result = collectParameters.call(mockExecute, 0);
        
        expect(result.exportConfigs).toHaveLength(0);
      });

      it('should handle missing export settings', () => {
        const mockExecute = createMockExecute({
          operation: 'createMovie',
          advancedMode: false
        });

        const result = collectParameters.call(mockExecute, 0);
        
        expect(result.exportConfigs).toEqual([]);
      });

      it('should handle unknown export type', () => {
        const mockExecute = createMockExecute({
          operation: 'createMovie',
          advancedMode: false,
          exportSettings: {
            exportValues: [{
              exportType: 'unknown',
              someField: 'value'
            }]
          }
        });

        const result = collectParameters.call(mockExecute, 0);
        
        expect(result.exportConfigs).toHaveLength(0);
      });

      it('should handle null export config', () => {
        const mockExecute = createMockExecute({
          operation: 'createMovie',
          advancedMode: false,
          exportSettings: {
            exportValues: [null]
          }
        });

        const result = collectParameters.call(mockExecute, 0);
        
        expect(result.exportConfigs).toHaveLength(0);
      });

      it('should handle exception when collectExportConfigs throws', () => {
        const mockExecute = {
          getNodeParameter: (paramName: string, itemIndex: number, defaultValue?: any) => {
            if (paramName === 'exportSettings') {
              throw new Error('Export settings error');
            }
            if (paramName === 'operation') return 'createMovie';
            if (paramName === 'advancedMode') return false;
            return defaultValue;
          }
        } as any;

        const result = collectParameters.call(mockExecute, 0);
        
        expect(result.exportConfigs).toEqual([]);
      });
    });

    describe('resolution mapping', () => {
      it.each([
        ['hd', 1280, 720],
        ['fhd', 1920, 1080],
        ['4k', 3840, 2160]
      ])('should map %s resolution to %dx%d', (preset, expectedWidth, expectedHeight) => {
        const mockExecute = createMockExecute({
          operation: 'createMovie',
          advancedMode: false,
          outputSettings: {
            outputDetails: { resolution: preset }
          }
        });

        const result = collectParameters.call(mockExecute, 0);

        expect(result.operationSettings?.outputSettings?.width).toBe(expectedWidth);
        expect(result.operationSettings?.outputSettings?.height).toBe(expectedHeight);
      });

      it('should handle unknown resolution preset', () => {
        const mockExecute = createMockExecute({
          operation: 'createMovie',
          advancedMode: false,
          outputSettings: {
            outputDetails: { resolution: 'unknown-preset' }
          }
        });

        const result = collectParameters.call(mockExecute, 0);

        expect(result.operationSettings?.outputSettings?.resolution).toBe('unknown-preset');
        expect(result.operationSettings?.outputSettings?.width).toBeUndefined();
        expect(result.operationSettings?.outputSettings?.height).toBeUndefined();
      });
    });

    describe('common properties', () => {
      it('should collect recordId when available', () => {
        const mockExecute = createMockExecute({
          operation: 'createMovie',
          advancedMode: false,
          recordId: 'test-record-123'
        });

        const result = collectParameters.call(mockExecute, 0);

        expect(result.recordId).toBe('test-record-123');
      });

      it('should collect sceneDuration when available', () => {
        const mockExecute = createMockExecute({
          operation: 'createMovie',
          advancedMode: false,
          sceneDuration: 5.5
        });

        const result = collectParameters.call(mockExecute, 0);

        expect(result.sceneDuration).toBe(5.5);
      });

      it('should handle missing optional parameters gracefully', () => {
        const mockExecute = createMockExecute({
          operation: 'createMovie',
          advancedMode: false
        });

        const result = collectParameters.call(mockExecute, 0);

        expect(result.recordId).toBe('');
        expect(result.exportConfigs).toEqual([]);
        expect(result.sceneDuration).toBe(-1);
      });
    });
  });

  describe('validateCollectedParameters', () => {
    describe('element collection validation', () => {
      it.each([
        ['createMovie with movie elements', { operation: 'createMovie', movieElements: [{ type: 'text', text: 'test' }], sceneElements: [], operationSettings: { outputSettings: { width: 1920 } } }, true, [], []],
        ['createMovie with scene elements', { operation: 'createMovie', movieElements: [], sceneElements: [{ type: 'image', src: 'test.jpg' }], operationSettings: { outputSettings: { width: 1920 } } }, true, [], []],
        ['createMovie with no elements', { operation: 'createMovie', movieElements: [], sceneElements: [] }, false, ['createMovie operation requires either movie elements or scene elements'], ['No operation settings found']],
        ['mergeVideoAudio with elements', { operation: 'mergeVideoAudio', movieElements: [], sceneElements: [{ type: 'video', src: 'test.mp4' }], operationSettings: { outputSettings: { width: 1920 } } }, true, [], []],
        ['mergeVideoAudio with no elements', { operation: 'mergeVideoAudio', movieElements: [], sceneElements: [] }, false, ['mergeVideoAudio operation requires at least a video or audio element'], ['No operation settings found']],
        ['mergeVideos with elements', { operation: 'mergeVideos', movieElements: [], sceneElements: [{ type: 'video', src: 'test.mp4' }], operationSettings: { outputSettings: { width: 1920 } } }, true, [], []],
        ['mergeVideos with no elements', { operation: 'mergeVideos', movieElements: [], sceneElements: [] }, true, [], ['mergeVideos operation requires at least one video element', 'No operation settings found']],
        ['unknown operation', { operation: 'unknownOperation', movieElements: [], sceneElements: [] }, false, ['Invalid operation: unknownOperation'], ['No operation settings found']]
      ])('should validate %s', (_, parametersInput, expectedValid, expectedErrors, expectedWarnings) => {
        const parameters = { 
          isAdvancedMode: false, 
          ...parametersInput 
        } as CollectedParameters;
        
        const result = validateCollectedParameters(parameters);

        expect(result.isValid).toBe(expectedValid);
        expect(result.errors).toEqual(expectedErrors);
        expect(result.warnings).toEqual(expectedWarnings);
      });
    });

    describe('missing operation validation', () => {
      it('should validate missing operation parameter', () => {
        const parameters: CollectedParameters = {
          operation: '',
          isAdvancedMode: false,
          movieElements: [],
          sceneElements: []
        };

        const result = validateCollectedParameters(parameters);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Missing operation parameter');
      });

      it('should validate undefined operation parameter', () => {
        const parameters: CollectedParameters = {
          operation: undefined as any,
          isAdvancedMode: false,
          movieElements: [],
          sceneElements: []
        };

        const result = validateCollectedParameters(parameters);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Missing operation parameter');
      });

      it('should validate null operation parameter', () => {
        const parameters: CollectedParameters = {
          operation: null as any,
          isAdvancedMode: false,
          movieElements: [],
          sceneElements: []
        };

        const result = validateCollectedParameters(parameters);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Missing operation parameter');
      });
    });

    describe('advanced mode validation', () => {
      it('should require JSON template in advanced mode', () => {
        const parameters: CollectedParameters = {
          operation: 'createMovie',
          isAdvancedMode: true,
          movieElements: [],
          sceneElements: []
        };

        const result = validateCollectedParameters(parameters);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('JSON template is required in advanced mode');
      });

      it('should validate JSON template syntax', () => {
        const parameters: CollectedParameters = {
          operation: 'createMovie',
          isAdvancedMode: true,
          jsonTemplate: 'invalid json',
          movieElements: [],
          sceneElements: []
        };

        const result = validateCollectedParameters(parameters);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Invalid JSON template syntax');
      });

      it('should accept valid JSON template', () => {
        const parameters: CollectedParameters = {
          operation: 'createMovie',
          isAdvancedMode: true,
          jsonTemplate: '{"width": 1920, "height": 1080}',
          movieElements: [],
          sceneElements: []
        };

        const result = validateCollectedParameters(parameters);

        expect(result.isValid).toBe(true);
        expect(result.errors).toEqual([]);
      });
    });

    describe('operation settings validation', () => {
      it('should validate invalid width', () => {
        const parameters: CollectedParameters = {
          operation: 'createMovie',
          isAdvancedMode: false,
          movieElements: [{ type: 'text', text: 'test' }],
          sceneElements: [],
          operationSettings: {
            outputSettings: { width: 0 }
          }
        };

        const result = validateCollectedParameters(parameters);

        expect(result.isValid).toBe(false);
        expect(result.errors).toEqual(['Output width must be between 1 and 4096 pixels']);
      });

      it('should validate invalid height', () => {
        const parameters: CollectedParameters = {
          operation: 'createMovie',
          isAdvancedMode: false,
          movieElements: [{ type: 'text', text: 'test' }],
          sceneElements: [],
          operationSettings: {
            outputSettings: { height: 5000 }
          }
        };

        const result = validateCollectedParameters(parameters);

        expect(result.isValid).toBe(false);
        expect(result.errors).toEqual(['Output height must be between 1 and 4096 pixels']);
      });

      it.each([
        ['transition duration - negative', -1, 'Transition duration must be between 0 and 10 seconds'],
        ['transition duration - above maximum', 15, 'Transition duration must be between 0 and 10 seconds']
      ])('should validate %s', (_, transitionDuration, expectedError) => {
        const parameters: CollectedParameters = {
          operation: 'mergeVideos',
          isAdvancedMode: false,
          movieElements: [],
          sceneElements: [{ type: 'video', src: 'test.mp4' }],
          operationSettings: {
            transitionDuration
          }
        };

        const result = validateCollectedParameters(parameters);

        expect(result.isValid).toBe(false);
        expect(result.errors).toEqual([expectedError]);
      });

      it.each([
        ['transition duration - minimum valid', 0],
        ['transition duration - maximum valid', 10],
        ['transition duration - middle range', 2.5]
      ])('should accept %s', (_, transitionDuration) => {
        const parameters: CollectedParameters = {
          operation: 'mergeVideos',
          isAdvancedMode: false,
          movieElements: [],
          sceneElements: [{ type: 'video', src: 'test.mp4' }],
          operationSettings: {
            transitionDuration
          }
        };

        const result = validateCollectedParameters(parameters);

        expect(result.isValid).toBe(true);
        expect(result.errors).toEqual([]);
      });

      it.each([
        ['output width - below minimum', { width: 0 }, 'Output width must be between 1 and 4096 pixels'],
        ['output width - above maximum', { width: 5000 }, 'Output width must be between 1 and 4096 pixels'],
        ['output height - below minimum', { height: 0 }, 'Output height must be between 1 and 4096 pixels'],
        ['output height - above maximum', { height: 5000 }, 'Output height must be between 1 and 4096 pixels']
      ])('should validate %s', (_, outputSettings, expectedError) => {
        const parameters: CollectedParameters = {
          operation: 'createMovie',
          isAdvancedMode: false,
          movieElements: [{ type: 'text', text: 'test' }],
          sceneElements: [],
          operationSettings: {
            outputSettings
          }
        };

        const result = validateCollectedParameters(parameters);

        expect(result.isValid).toBe(false);
        expect(result.errors).toEqual([expectedError]);
      });

      it.each([
        ['output dimensions - minimum valid', { width: 1, height: 1 }],
        ['output dimensions - maximum valid', { width: 4096, height: 4096 }],
        ['output dimensions - typical values', { width: 1920, height: 1080 }]
      ])('should accept %s', (_, outputSettings) => {
        const parameters: CollectedParameters = {
          operation: 'createMovie',
          isAdvancedMode: false,
          movieElements: [{ type: 'text', text: 'test' }],
          sceneElements: [],
          operationSettings: {
            outputSettings
          }
        };

        const result = validateCollectedParameters(parameters);

        expect(result.isValid).toBe(true);
        expect(result.errors).toEqual([]);
      });

      it('should warn when no operation settings found', () => {
        const parameters: CollectedParameters = {
          operation: 'createMovie',
          isAdvancedMode: false,
          movieElements: [{ type: 'text', text: 'test' }],
          sceneElements: []
        };

        const result = validateCollectedParameters(parameters);

        expect(result.warnings).toContain('No operation settings found');
      });
    });

    describe('export configuration validation', () => {
      it.each([
        ['webhook missing URL', [{ webhook: { url: '' } }], ['Export config 1: Webhook URL is required']],
        ['webhook non-HTTPS URL', [{ webhook: { url: 'http://example.com' } }], ['Export config 1: Webhook URL must use HTTPS']],
        ['FTP missing host', [{ ftp: { host: '', username: 'user', password: 'pass', port: 21, path: '/', secure: false } }], ['Export config 1: FTP host is required']],
        ['FTP missing username', [{ ftp: { host: 'ftp.example.com', username: '', password: 'pass', port: 21, path: '/', secure: false } }], ['Export config 1: FTP username is required']],
        ['FTP missing password', [{ ftp: { host: 'ftp.example.com', username: 'user', password: '', port: 21, path: '/', secure: false } }], ['Export config 1: FTP password is required']],
        ['email missing recipient', [{ email: { to: '' } }], ['Export config 1: Email recipient is required']],
        ['email invalid recipient', [{ email: { to: 'invalid-email' } }], ['Export config 1: Invalid email address at position 1: invalid-email']],
        ['email invalid from address', [{ email: { to: 'valid@example.com', from: 'invalid-from' } }], ['Export config 1: Invalid from email address: invalid-from']]
      ])('should validate %s', (_, exportConfigs, expectedErrors) => {
        const parameters: CollectedParameters = {
          operation: 'createMovie',
          isAdvancedMode: false,
          movieElements: [{ type: 'text', text: 'test' }],
          sceneElements: [],
          exportConfigs
        };

        const result = validateCollectedParameters(parameters);

        expect(result.errors.filter((e: string) => e.includes('Export config'))).toEqual(expectedErrors);
      });

      it('should validate multiple email recipients', () => {
        const parameters: CollectedParameters = {
          operation: 'createMovie',
          isAdvancedMode: false,
          movieElements: [{ type: 'text', text: 'test' }],
          sceneElements: [],
          exportConfigs: [{
            email: {
              to: ['user1@example.com', 'user2@example.com', 'invalid-email']  // Tests line 545 branch
            }
          }]
        };

        const result = validateCollectedParameters(parameters);

        expect(result.errors.filter(e => e.includes('Export config'))).toContain(
          'Export config 1: Invalid email address at position 3: invalid-email'
        );
      });

      it('should validate invalid export configuration format - null', () => {
        const parameters: CollectedParameters = {
          operation: 'createMovie',
          isAdvancedMode: false,
          movieElements: [{ type: 'text', text: 'test' }],
          sceneElements: [],
          exportConfigs: [null as any]
        };

        const result = validateCollectedParameters(parameters);

        expect(result.errors).toContain('Export config 1: Invalid export configuration format');
      });

      it('should validate invalid export configuration format - string', () => {
        const parameters: CollectedParameters = {
          operation: 'createMovie',
          isAdvancedMode: false,
          movieElements: [{ type: 'text', text: 'test' }],
          sceneElements: [],
          exportConfigs: ['invalid' as any]
        };

        const result = validateCollectedParameters(parameters);

        expect(result.errors).toContain('Export config 1: Invalid export configuration format');
      });

      it.each([
        ['FTP invalid port - zero', [{ ftp: { host: 'ftp.example.com', username: 'user', password: 'pass', port: 0, path: '/', secure: false } }], ['Export config 1: FTP port must be between 1 and 65535']],
        ['FTP invalid port - above max', [{ ftp: { host: 'ftp.example.com', username: 'user', password: 'pass', port: 70000, path: '/', secure: false } }], ['Export config 1: FTP port must be between 1 and 65535']]
      ])('should validate %s', (_, exportConfigs, expectedErrors) => {
        const parameters: CollectedParameters = {
          operation: 'createMovie',
          isAdvancedMode: false,
          movieElements: [{ type: 'text', text: 'test' }],
          sceneElements: [],
          exportConfigs
        };

        const result = validateCollectedParameters(parameters);

        expect(result.errors.filter((e: string) => e.includes('Export config'))).toEqual(expectedErrors);
      });

      it('should validate FTP with no port specified (should pass)', () => {
        const parameters: CollectedParameters = {
          operation: 'createMovie',
          isAdvancedMode: false,
          movieElements: [{ type: 'text', text: 'test' }],
          sceneElements: [],
          exportConfigs: [{
            ftp: {
              host: 'ftp.example.com',
              username: 'user',
              password: 'pass',
              path: '/',
              secure: false
            }
          }]
        };

        const result = validateCollectedParameters(parameters);

        expect(result.errors.filter((e: string) => e.includes('Export config'))).toEqual([]);
      });

      it('should handle multiple valid export configurations', () => {
        const parameters: CollectedParameters = {
          operation: 'createMovie',
          isAdvancedMode: false,
          movieElements: [{ type: 'text', text: 'test' }],
          sceneElements: [],
          exportConfigs: [
            {
              webhook: {
                url: 'https://api.example.com/webhook'
              }
            },
            {
              email: {
                to: 'user@example.com'
              }
            }
          ] as any
        };

        const result = validateCollectedParameters(parameters);

        expect(result.errors.filter((e: string) => e.includes('Export config'))).toEqual([]);
      });

      it('should handle empty export configuration array', () => {
        const parameters: CollectedParameters = {
          operation: 'createMovie',
          isAdvancedMode: false,
          movieElements: [{ type: 'text', text: 'test' }],
          sceneElements: [],
          exportConfigs: []
        };

        const result = validateCollectedParameters(parameters);

        expect(result.errors.filter((e: string) => e.includes('Export config'))).toEqual([]);
      });
    });
  });
});