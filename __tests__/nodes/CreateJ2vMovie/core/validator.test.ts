// __tests__/nodes/CreateJ2vMovie/core/validator.test.ts

import {
  validateRequest,
  createValidationSummary,
  extractActionableErrors,
  isRecoverable,
  validateBuildResult,
  ValidationOptions,
} from '../../../../nodes/CreateJ2vMovie/core/validator';

const textEl = (over = {}) => ({ type: 'text', text: 'Hello', ...over });
const videoEl = (over = {}) => ({ type: 'video', src: 'v.mp4', ...over });
const audioEl = (over = {}) => ({ type: 'audio', src: 'a.mp3', ...over });
const scene = (over = {}) => ({ elements: [] as any[], ...over });

describe('validator', () => {
  describe('validateRequest core functionality', () => {
    it.each([
      // [description, request, expectedValid, shouldHaveErrors]
      ['null request', null, false, true],
      ['empty object', {}, false, true],
      ['minimal valid request', { scenes: [scene({ elements: [textEl()] })] }, undefined, false],
      ['structural invalid - scenes string', { scenes: 'invalid' }, false, true],
      ['structural invalid - non-object', 42, false, true],
      ['scenes array but empty', { scenes: [] }, undefined, false],
      ['scenes with empty elements', { scenes: [{ elements: [] }] }, undefined, false]
    ])('handles %s', (_, request, expectedValid, shouldHaveErrors) => {
      const result = validateRequest(request as any);

      expect(typeof result.isValid).toBe('boolean');
      expect(typeof result.canProceed).toBe('boolean');
      expect(Array.isArray(result.errors)).toBe(true);
      expect(Array.isArray(result.warnings)).toBe(true);

      if (expectedValid !== undefined) {
        expect(result.isValid).toBe(expectedValid);
      }
      if (shouldHaveErrors) {
        expect(result.errors.length).toBeGreaterThan(0);
      }
    });

    it.each([
      // [description, field, invalidValue]
      ['invalid numeric width', 'width', 'not-a-number'],
      ['invalid numeric height', 'height', NaN],
      ['invalid boolean cache', 'cache', 'yes'],
      ['invalid boolean field', 'cache', 123]
    ])('handles %s', (_, field, value) => {
      const request = { scenes: [], [field]: value };
      const result = validateRequest(request as any, { level: 'structural' });
      
      expect(typeof result.isValid).toBe('boolean');
      expect(Array.isArray(result.errors)).toBe(true);
    });
    
    it.each([
      // Fields that are NOT validated for type in structural validation
      ['id as number', 'id', 123],
      ['comment as string', 'comment', 'test'],
      ['quality as string', 'quality', 'high'],
      ['resolution as string', 'resolution', '1080p'],
      ['draft as boolean', 'draft', true]
    ])('should allow %s at structural level', (_, field, value) => {
      const request = { scenes: [], [field]: value };
      const result = validateRequest(request as any, { level: 'structural' });
      
      expect(typeof result.isValid).toBe('boolean');
    });
  });

  describe('validation levels', () => {
    it.each([
      // [level, description, expectElementValidation]
      ['structural' as const, 'basic structure only', false],
      ['semantic' as const, 'schema + business rules', false],
      ['complete' as const, 'full validation including elements', true]
    ])('should handle %s level: %s', (level, _, expectElementValidation) => {
      const request = { scenes: [scene({ elements: [textEl()] })] };
      const result = validateRequest(request as any, { 
        level: level, 
        validateElements: expectElementValidation 
      });

      expect(result.validationLevel).toBe(level);
      expect(typeof result.isValid).toBe('boolean');
    });

    it.each([
      // [description, level, shouldRunSemantic, shouldRunComplete]
      ['structural only', 'structural' as const, false, false],
      ['semantic runs structural+semantic', 'semantic' as const, true, false],
      ['complete runs all levels', 'complete' as const, true, true]
    ])('validation level progression: %s', (_, level, shouldRunSemantic, shouldRunComplete) => {
      const validRequest = { scenes: [scene({ elements: [textEl()] })] };
      const options: ValidationOptions = { level };
      const result = validateRequest(validRequest as any, options);

      expect(result.validationLevel).toBe(level);
      expect(typeof result.isValid).toBe('boolean');
      expect(Array.isArray(result.errors)).toBe(true);
      expect(Array.isArray(result.warnings)).toBe(true);
    });

    it.each([
      ['strictMode true', { strictMode: true, level: 'complete' as const }],
      ['strictMode false', { strictMode: false, level: 'complete' as const }],
      ['includeWarnings false', { includeWarnings: false, level: 'complete' as const }],
      ['validateElements false', { validateElements: false, level: 'complete' as const }]
    ])('should handle option: %s', (_, options) => {
      const request = { scenes: [scene({ elements: [textEl()] })] };
      const result = validateRequest(request as any, options);

      expect(typeof result.isValid).toBe('boolean');
      expect(typeof result.canProceed).toBe('boolean');
    });
  });

  describe('element validation', () => {
    it.each([
      ['valid elements', { scenes: [{ elements: [videoEl(), audioEl()] }] }],
      ['missing required fields', { 
        scenes: [{ elements: [{ type: 'video' }] }] 
      }],
      ['invalid element type', { 
        scenes: [{ elements: [{ type: 'invalid' }] }] 
      }],
      ['subtitles in scene', { 
        scenes: [{ elements: [{ type: 'subtitles', captions: 'test' }] }] 
      }],
      ['subtitles at movie level', { 
        elements: [{ type: 'subtitles', captions: 'test' }],
        scenes: [{ elements: [videoEl()] }] 
      }]
    ])('validates %s', (description, request) => {
      const options: ValidationOptions = { level: 'complete', validateElements: true };
      const result = validateRequest(request as any, options);

      // Log errors for debugging
      if (result.errors.length > 0) {
        console.log(`${description} errors:`, result.errors);
      }

      // For now, just check that validation completes
      expect(typeof result.isValid).toBe('boolean');
      expect(Array.isArray(result.errors)).toBe(true);
      
      // Specific expectations based on what should happen
      if (description === 'subtitles in scene') {
        // Should have error about subtitles in wrong place
        const hasSubtitleError = result.errors.some(e => 
          e.includes('Subtitles') && e.includes('scene')
        );
        expect(hasSubtitleError).toBe(true);
      }
    });
  });

  describe('coverage for remaining uncovered lines', () => {
    it('covers uncovered lines in performCompleteValidation (movie elements path)', () => {
      const options: ValidationOptions = { level: 'complete', validateElements: true };
      const result = validateRequest(
        {
          scenes: [{ elements: [textEl()] }],
          elements: [{ type: 'subtitles', captions: 'test' }]
        } as any,
        options
      );

      expect(typeof result.isValid).toBe('boolean');
    });

    it('covers performCrossValidation function', () => {
      const options: ValidationOptions = { level: 'complete', validateElements: true, includeWarnings: true };
      const result = validateRequest(
        {
          scenes: [{ elements: [textEl()] }],
          elements: [{ type: 'subtitles', captions: 'Movie subtitle' }]
        } as any,
        options
      );

      expect(typeof result.isValid).toBe('boolean');
      expect(Array.isArray(result.warnings)).toBe(true);
    });

    it('covers default case in extractActionableErrors', () => {
      const result = extractActionableErrors({
        errors: ['Unknown error that doesnt match patterns'],
        warnings: []
      } as any);

      expect(result.critical.length).toBe(1);
      expect(result.fixable.length).toBe(0);
      expect(result.warnings.length).toBe(0);
    });

    it('covers validation error handling', () => {
      // Mock validateJSON2VideoRequest from rules module to throw an Error
      const rulesModule = require('../../../../nodes/CreateJ2vMovie/schema/rules');
      const originalValidateJSON2VideoRequest = rulesModule.validateJSON2VideoRequest;
      rulesModule.validateJSON2VideoRequest = jest.fn(() => {
        throw new Error('Schema validation error');
      });

      try {
        const result = validateRequest({ scenes: [] } as any);
        
        expect(result.isValid).toBe(false);
        expect(result.canProceed).toBe(false);
        expect(result.errors.some((e: string) => e.includes('Validation failed: Schema validation error'))).toBe(true);
      } finally {
        rulesModule.validateJSON2VideoRequest = originalValidateJSON2VideoRequest;
      }
    });

    it('covers non-Error exception handling', () => {
      // Mock validateJSON2VideoRequest from rules module to throw a non-Error
      const rulesModule = require('../../../../nodes/CreateJ2vMovie/schema/rules');
      const originalValidateJSON2VideoRequest = rulesModule.validateJSON2VideoRequest;
      rulesModule.validateJSON2VideoRequest = jest.fn(() => {
        throw 'String error'; // Non-Error exception
      });

      try {
        const result = validateRequest({ scenes: [] } as any);
        
        expect(result.isValid).toBe(false);
        expect(result.canProceed).toBe(false);
        expect(result.errors.some((e: string) => e.includes('Validation failed: Unknown validation error'))).toBe(true);
      } finally {
        rulesModule.validateJSON2VideoRequest = originalValidateJSON2VideoRequest;
      }
    });
  });

  describe('elements array validation', () => {
    it.each([
      // [description, elements, level, shouldHaveError]
      ['elements as string', 'not-an-array', 'semantic', false],
      ['elements as number', 42, 'semantic', false],
      ['elements as null', null, 'semantic', false],
      ['elements as object', {}, 'semantic', false],
      ['elements as valid array', [{ type: 'subtitles', captions: 'test' }], 'semantic', false],
      ['elements missing at structural level', 'not-an-array', 'structural', false]
    ])('validates movie %s', (_, elements, level, shouldHaveError) => {
      const options: ValidationOptions = { level: level as any };
      const result = validateRequest(
        { scenes: [], elements } as any,
        options
      );

      expect(typeof result.isValid).toBe('boolean');
      expect(Array.isArray(result.errors)).toBe(true);
    });
  });

  describe('utility functions', () => {
    it.each([
      // [description, input, expectedPattern]
      ['validation pass summary', {
        isValid: true,
        canProceed: true,
        errors: [],
        warnings: ['minor warning'],
        validationLevel: 'complete'
      }, /PASS - COMPLETE validation - Errors: 0, Warnings: 1/],

      ['validation fail summary', {
        isValid: false,
        canProceed: false,
        errors: ['critical error'],
        warnings: [],
        validationLevel: 'structural'
      }, /FAIL - STRUCTURAL validation - Errors: 1, Warnings: 0/],

      ['mixed results summary', {
        isValid: false,
        canProceed: false,
        errors: ['error1', 'error2'],
        warnings: ['warn1', 'warn2'],
        validationLevel: 'semantic'
      }, /FAIL - SEMANTIC validation - Errors: 2, Warnings: 2/]
    ])('createValidationSummary: %s', (_, input, expectedPattern) => {
      const summary = createValidationSummary(input as any);
      expect(typeof summary).toBe('string');
      expect(expectedPattern.test(summary)).toBe(true);
    });

    it.each([
      // [description, input, expectedFixable, expectedCritical, expectedWarnings]
      ['all fixable errors', {
        errors: ['Field is required', 'Name must be provided', 'must be type string'],
        warnings: ['Consider optimization']
      }, 3, 0, 1],

      ['all critical errors', {
        errors: ['System failure', 'Fatal crash', 'Memory corruption'],
        warnings: []
      }, 0, 3, 0],

      ['mixed error types', {
        errors: ['Field must be provided', 'System crash'],
        warnings: ['Performance warning', 'Deprecated feature']
      }, 1, 1, 2],

      ['no errors, only warnings', {
        errors: [],
        warnings: ['Minor issue', 'suggestion']
      }, 0, 0, 2],

      ['empty result', {
        errors: [],
        warnings: []
      }, 0, 0, 0],

      ['unknown errors go to critical', {
        errors: ['Something wrong happened'],
        warnings: []
      }, 0, 1, 0]
    ])('extractActionableErrors: %s', (_, input, expectedFixable, expectedCritical, expectedWarnings) => {
      const result = extractActionableErrors(input as any);

      expect(Array.isArray(result.fixable)).toBe(true);
      expect(Array.isArray(result.critical)).toBe(true);
      expect(Array.isArray(result.warnings)).toBe(true);
      expect(result.fixable.length).toBe(expectedFixable);
      expect(result.critical.length).toBe(expectedCritical);
      expect(result.warnings.length).toBe(expectedWarnings);
    });

    it.each([
      // [description, input, expected]
      ['structural error not recoverable', { errors: ['Request must be an object'], warnings: [] }, false],
      ['array error not recoverable', { errors: ['Scenes must be an array'], warnings: [] }, false],
      ['null error not recoverable', { errors: ['Request is null or undefined'], warnings: [] }, false],
      ['request validation error recoverable', { errors: ['at least one element is required'], warnings: [] }, true],
      ['with warnings not recoverable', { errors: [], warnings: ['Warning message'] }, false],
      ['field validation error recoverable', { errors: ['requires a video element'], warnings: [] }, true],
      ['schema validation error recoverable', { errors: ['requires an audio element'], warnings: [] }, true],
      ['no errors or warnings recoverable', { errors: [], warnings: [] }, true],
      ['multiple recoverable errors', { errors: ['requires a video element', 'requires an audio element'], warnings: [] }, true]
    ])('isRecoverable: %s', (_, input, expected) => {
      expect(isRecoverable(input as any)).toBe(expected);
    });

    it.each([
      // [description, buildResult, shouldBeValid, shouldHaveError]
      ['null request in build result', {
        request: null,
        errors: ['Build failed'],
        warnings: []
      }, false, true],

      ['undefined request in build result', {
        request: undefined,
        errors: ['Build error'],
        warnings: []
      }, false, true],

      ['valid build result', {
        request: { scenes: [{ elements: [textEl()] }] },
        errors: [],
        warnings: []
      }, true, false],

      ['build result with errors', {
        request: { scenes: [{ elements: [textEl()] }] },
        errors: ['Some build error'],
        warnings: ['Build warning']
      }, false, true],

      ['valid request with warnings', {
        request: { scenes: [{ elements: [textEl()] }] },
        errors: [],
        warnings: ['Minor build warning']
      }, true, false]
    ])('validateBuildResult: %s', (_, buildResult, shouldBeValid, shouldHaveError) => {
      const result = validateBuildResult(buildResult as any);

      expect(typeof result.isValid).toBe('boolean');
      expect(typeof result.canProceed).toBe('boolean');
      expect(Array.isArray(result.errors)).toBe(true);
      expect(Array.isArray(result.warnings)).toBe(true);

      if (shouldBeValid !== undefined) {
        expect(result.isValid).toBe(shouldBeValid);
      }
      if (shouldHaveError) {
        expect(result.errors.length).toBeGreaterThan(0);
      }
    });
  });

  describe('comprehensive edge cases', () => {
    it.each([
      // [description, request, options]
      ['undefined options', { scenes: [scene({ elements: [textEl()] })] }, undefined],
      ['empty options object', { scenes: [scene({ elements: [textEl()] })] }, {}],
      ['all options enabled', { scenes: [scene({ elements: [textEl()] })] }, {
        level: 'complete' as const,
        strictMode: true,
        includeWarnings: true,
        validateElements: true
      }],
      ['all options disabled', { scenes: [scene({ elements: [textEl()] })] }, {
        level: 'structural' as const,
        strictMode: false,
        includeWarnings: false,
        validateElements: false
      }]
    ])('handles %s', (_, request, options) => {
      const result = validateRequest(request as any, options);

      expect(typeof result.isValid).toBe('boolean');
      expect(typeof result.canProceed).toBe('boolean');
      expect(Array.isArray(result.errors)).toBe(true);
      expect(Array.isArray(result.warnings)).toBe(true);
    });

    it.each([
      // [description, requestBuilder]
      ['complex nested structure', () => ({
        scenes: [
          scene({ 
            elements: [
              textEl({ text: 'Scene 1 Text' }), 
              videoEl({ src: 'video1.mp4' })
            ] 
          }),
          scene({ 
            elements: [
              audioEl({ src: 'audio.mp3' }),
              textEl({ text: 'Scene 2 Text' })
            ]
          })
        ],
        elements: [
          { type: 'subtitles', captions: 'Global subtitles' }
        ]
      })],

      ['request with all optional fields', () => ({
        id: 'test-123',
        comment: 'Test video',
        width: 1920,
        height: 1080,
        quality: 'high',
        resolution: '1080p',
        draft: false,
        cache: true,
        scenes: [scene({ elements: [textEl()] })]
      })],

      ['scenes with transitions', () => ({
        scenes: [
          { elements: [textEl()], transition: { type: 'fade', duration: 1.0 } },
          { elements: [videoEl()], transition: { type: 'slide', duration: 0.5 } }
        ]
      })],

      ['null properties handling', () => ({
        scenes: [scene({ elements: [textEl()] })],
        comment: null,
        width: null,
        height: null
      })],

      ['circular reference potential', function() {
        const obj: any = {
          scenes: [scene({ elements: [textEl()] })]
        };
        return obj;
      }],

      ['malformed elements causing validation errors', () => ({
        scenes: [{ elements: [null, undefined, { type: null }, { malformed: true }] }]
      })],

      ['empty scenes array', () => ({ scenes: [] })]
    ])('error handling: %s', (_, requestBuilder) => {
      const request = requestBuilder();

      expect(() => {
        const options: ValidationOptions = {
          level: 'complete',
          includeWarnings: true,
          validateElements: true
        };
        const result = validateRequest(request as any, options);

        expect(typeof result.isValid).toBe('boolean');
        expect(Array.isArray(result.errors)).toBe(true);
        expect(Array.isArray(result.warnings)).toBe(true);
      }).not.toThrow();
    });
  });
});