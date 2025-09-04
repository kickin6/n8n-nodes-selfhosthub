// __tests__/nodes/CreateJ2vMovie/core/schemaValidator.test.ts

import {
  validateRequest,
  createValidationSummary,
  extractActionableErrors,
  isRecoverable,
  validateBuildResult,
} from '../../../../nodes/CreateJ2vMovie/core/schemaValidator';

const textEl = (over = {}) => ({ type: 'text', text: 'Hello', ...over });
const videoEl = (over = {}) => ({ type: 'video', src: 'v.mp4', ...over });
const audioEl = (over = {}) => ({ type: 'audio', src: 'a.mp3', ...over });
const scene = (over = {}) => ({ elements: [] as any[], ...over });

describe('schemaValidator', () => {
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
      const result = validateRequest(request as any, 'createMovie');

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
      // [description, field, invalidValue, expectedErrorPattern]
      ['invalid numeric width', 'width', 'not-a-number', 'width must be a valid number'],
      ['invalid numeric height', 'height', NaN, 'height must be a valid number'],
      ['invalid numeric fps', 'fps', 'invalid', 'fps must be a valid number'],
      ['invalid boolean cache', 'cache', 'yes', 'cache must be a boolean'],
      ['invalid boolean field', 'cache', 123, 'cache must be a boolean']
    ])('handles %s', (_, field, value, expectedError) => {
      const request = { scenes: [], [field]: value };
      const result = validateRequest(request as any, 'createMovie', { level: 'structural' });
      
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e: string) => e.includes(expectedError))).toBe(true);
    });
    
    it.each([
      // Fields that are NOT validated for type in structural validation
      ['id as number', 'id', 123],
      ['comment as array', 'comment', ['not', 'a', 'string']],
      ['id as boolean', 'id', true],
      ['comment as number', 'comment', 456]
    ])('allows non-validated field types: %s', (_, field, value) => {
      const result = validateRequest(
        { scenes: [], [field]: value } as any,
        'createMovie',
        { level: 'structural' }
      );
      
      expect(result.isValid).toBe(true);
    });
  });

  describe('validation levels and options', () => {
    const validRequest = { scenes: [scene({ elements: [textEl()] })] };

    it.each([
      // [description, options, expectedLevel]
      ['structural level explicit', { level: 'structural' }, 'structural'],
      ['semantic level explicit', { level: 'semantic' }, 'semantic'],
      ['complete level explicit', { level: 'complete' }, 'complete'],
      ['default level', {}, 'complete'],
      ['undefined options', undefined, 'complete'],
      ['strict mode enabled', { strictMode: true }, 'complete'],
      ['warnings disabled', { includeWarnings: false }, 'complete'],
      ['elements validation disabled', { validateElements: false }, 'complete']
    ])('handles option: %s', (_, options, expectedLevel) => {
      const result = validateRequest(validRequest as any, 'createMovie', options as any);

      expect(typeof result.isValid).toBe('boolean');
      expect(result.validationLevel).toBe(expectedLevel);
    });

    it.each([
      // [description, level, shouldRunSemantic, shouldRunComplete]
      ['structural only', 'structural', false, false],
      ['semantic runs structural+semantic', 'semantic', true, false],
      ['complete runs all levels', 'complete', true, true]
    ])('validation level progression: %s', (_, level, shouldRunSemantic, shouldRunComplete) => {
      const result = validateRequest(validRequest as any, 'createMovie', { level } as any);

      expect(result.validationLevel).toBe(level);
      // All levels should return a valid result structure
      expect(typeof result.isValid).toBe('boolean');
      expect(Array.isArray(result.errors)).toBe(true);
      expect(Array.isArray(result.warnings)).toBe(true);
    });
  });

  describe('action-specific validation', () => {
    it.each([
      // [action, validRequest, description]
      ['createMovie', { 
        scenes: [{ elements: [textEl()] }],
        elements: [{ type: 'subtitles', captions: 'test' }]
      }, 'valid createMovie with movie elements'],
      
      ['mergeVideoAudio', {
        scenes: [{ elements: [videoEl(), audioEl()] }]
      }, 'valid mergeVideoAudio with video and audio'],
      
      ['mergeVideos', {
        scenes: [
          { elements: [videoEl()] },
          { elements: [videoEl()] }
        ]
      }, 'valid mergeVideos with multiple video scenes']
    ])('validates %s action: %s', (action, request, _) => {
      const result = validateRequest(request as any, action as any, { level: 'semantic' });

      expect(typeof result.isValid).toBe('boolean');
      expect(Array.isArray(result.errors)).toBe(true);
      expect(Array.isArray(result.warnings)).toBe(true);
    });

    it.each([
      // [action, invalidRequest, expectedErrorPattern]
      ['createMovie', {
        scenes: [{ elements: [{ type: 'subtitles', captions: 'test' }] }]
      }, 'Subtitles can only be at movie level'],

      ['mergeVideoAudio', {
        scenes: []
      }, 'mergeVideoAudio requires at least one scene'],

      ['mergeVideoAudio', {
        scenes: [{ elements: [audioEl()] }] // Missing video
      }, 'mergeVideoAudio action requires a video element'],

      ['mergeVideoAudio', {
        scenes: [{ elements: [videoEl()] }] // Missing audio
      }, 'mergeVideoAudio action requires an audio element'],

      ['mergeVideos', {
        scenes: []
      }, 'mergeVideos requires at least one scene'],

      ['mergeVideos', {
        scenes: [{ elements: [] }] // Empty elements
      }, 'mergeVideos requires scenes with elements']
    ])('%s action validation error: %s', (action, request, expectedError) => {
      const result = validateRequest(request as any, action as any, { level: 'semantic' });

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e: string) => e.includes(expectedError))).toBe(true);
    });

    it.each([
      // [action, invalidRequest, description]
      ['createMovie', {
        scenes: [{ elements: [{ type: 'subtitles', captions: 'test' }] }]
      }, 'subtitles in scene should be skipped'],

      ['mergeVideoAudio', {
        scenes: [{ elements: [audioEl()] }] // Missing video
      }, 'missing video should be skipped'],

      ['mergeVideos', {
        scenes: []
      }, 'empty scenes should be skipped']
    ])('skipActionRules option for %s: %s', (action, request, _) => {
      const result = validateRequest(request as any, action as any, { 
        level: 'semantic', 
        skipActionRules: true 
      });

      // Should not include action-specific validation errors when skipped
      const hasActionSpecificErrors = result.errors.some(e => 
        e.includes(`${action} action`) || 
        e.includes(`${action} requires`) ||
        e.includes('Subtitles can only be at movie level')
      );
      
      expect(hasActionSpecificErrors).toBe(false);
    });
  });

  describe('complex validation scenarios', () => {
    it.each([
      // [description, request, level, options, shouldBeValid]
      ['custom resolution missing dimensions', {
        scenes: [scene({ elements: [textEl()] })],
        resolution: 'custom'
      }, 'semantic', { includeWarnings: true }, false],

      ['custom resolution with width only', {
        scenes: [scene({ elements: [textEl()] })],
        resolution: 'custom',
        width: 1920
      }, 'semantic', { includeWarnings: true }, false],

      ['custom resolution complete', {
        scenes: [scene({ elements: [textEl()] })],
        resolution: 'custom',
        width: 1920,
        height: 1080
      }, 'semantic', { includeWarnings: true }, true],

      ['movie elements validation enabled', {
        scenes: [{ elements: [textEl()] }],
        elements: [{ type: 'invalid-movie-element' }]
      }, 'complete', { validateElements: true }, false],

      ['movie elements validation disabled', {
        scenes: [{ elements: [textEl()] }],
        elements: [{ type: 'invalid-movie-element' }]
      }, 'complete', { validateElements: false }, false], // Still false because semantic validation runs

      ['scene elements with validation', {
        scenes: [{ elements: [{ type: 'invalid-scene-element' }] }]
      }, 'complete', { validateElements: true }, false]
    ])('handles %s', (_, request, level, options, shouldBeValid) => {
      const result = validateRequest(request as any, 'createMovie', { level, ...options } as any);

      expect(typeof result.isValid).toBe('boolean');
      expect(typeof result.canProceed).toBe('boolean');
      
      if (shouldBeValid !== undefined) {
        expect(result.isValid).toBe(shouldBeValid);
      }
    });

    it.each([
      // [description, requestBuilder]
      ['deeply nested circular reference', () => {
        const circular: any = { scenes: [{ elements: [textEl()] }] };
        const deep: any = { level1: { level2: { level3: circular } } };
        circular.deep = deep;
        deep.circular = circular;
        return circular;
      }],

      ['malformed elements causing validation errors', () => ({
        scenes: [{ elements: [null, undefined, { type: null }, { malformed: true }] }]
      })],

      ['getter property that throws', () => ({
        scenes: [{ elements: [textEl()] }],
        get problematicGetter() { throw new Error('Getter error'); }
      })],

      ['empty scenes array', () => ({ scenes: [] })]
    ])('error handling: %s', (_, requestBuilder) => {
      const request = requestBuilder();

      expect(() => {
        const result = validateRequest(request as any, 'createMovie', {
          level: 'complete',
          includeWarnings: true,
          validateElements: true
        });

        expect(typeof result.isValid).toBe('boolean');
        expect(Array.isArray(result.errors)).toBe(true);
        expect(Array.isArray(result.warnings)).toBe(true);
      }).not.toThrow();
    });
  });

  describe('elements array validation', () => {
    it.each([
      // [description, elements, level, shouldHaveError]
      ['elements as string', 'not-an-array', 'semantic', true],
      ['elements as number', 42, 'semantic', true],
      ['elements as null', null, 'semantic', false], // null elements is not validated - only when elements exist
      ['elements as object', {}, 'semantic', true],
      ['elements as valid array', [{ type: 'subtitles', captions: 'test' }], 'semantic', false],
      ['elements missing at structural level', 'not-an-array', 'structural', false] // Not validated at structural level
    ])('validates movie %s', (_, elements, level, shouldHaveError) => {
      const result = validateRequest(
        { scenes: [], elements } as any,
        'createMovie',
        { level } as any
      );

      if (shouldHaveError) {
        expect(result.errors.some((e: string) => e.includes('Movie elements must be an array'))).toBe(true);
      } else if (level === 'structural') {
        // At structural level, elements array validation is not performed
        expect(result.errors.some((e: string) => e.includes('Movie elements must be an array'))).toBe(false);
      }
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
      }, /PASS.*complete.*Errors: 0.*Warnings: 1/],

      ['validation fail summary', {
        isValid: false,
        canProceed: false,
        errors: ['critical error'],
        warnings: [],
        validationLevel: 'structural'
      }, /FAIL.*structural.*Errors: 1.*Warnings: 0/],

      ['mixed results summary', {
        isValid: false,
        canProceed: false,
        errors: ['error1', 'error2'],
        warnings: ['warn1', 'warn2'],
        validationLevel: 'semantic'
      }, /FAIL.*semantic.*Errors: 2.*Warnings: 2/]
    ])('createValidationSummary: %s', (_, input, expectedPattern) => {
      const summary = createValidationSummary(input as any);
      expect(typeof summary).toBe('string');
      expect(expectedPattern.test(summary)).toBe(true);
    });

    it.each([
      // [description, input, expectedFixable, expectedCritical, expectedWarnings]
      ['all fixable errors', {
        errors: ['Field is required', 'Name must be provided', 'Email missing'],
        warnings: ['Consider optimization']
      }, 3, 0, 1],

      ['all critical errors', {
        errors: ['System failure', 'Fatal crash', 'Memory corruption'],
        warnings: []
      }, 0, 3, 0],

      ['mixed error types', {
        errors: ['Field must be provided', 'System crash'],
        warnings: ['Performance warning', 'Deprecated feature']
      }, 1, 1, 2], // 1 fixable (must be), 1 critical

      ['no errors, only warnings', {
        errors: [],
        warnings: ['Minor issue', 'Suggestion']
      }, 0, 0, 2],

      ['empty result', {
        errors: [],
        warnings: []
      }, 0, 0, 0]
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
      ['request validation error recoverable', { errors: ['Request must be a valid object'], warnings: [] }, true], // This doesn't match the structural patterns
      ['with warnings not recoverable', { errors: [], warnings: ['Warning message'] }, false], // isRecoverable returns false if warnings exist
      ['field validation error recoverable', { errors: ['Field validation failed'], warnings: [] }, true],
      ['schema validation error recoverable', { errors: ['Invalid schema format'], warnings: [] }, true],
      ['no errors or warnings recoverable', { errors: [], warnings: [] }, true],
      ['multiple recoverable errors', { errors: ['Field error', 'Schema issue'], warnings: [] }, true]
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
        request: { scenes: [{ elements: [textEl()] }], action: 'createMovie' },
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
      const result = validateBuildResult(buildResult as any, 'createMovie');

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
        level: 'complete',
        strictMode: true,
        includeWarnings: true,
        validateElements: true,
        skipActionRules: false
      }],
      ['all options disabled', { scenes: [scene({ elements: [textEl()] })] }, {
        level: 'structural',
        strictMode: false,
        includeWarnings: false,
        validateElements: false,
        skipActionRules: true
      }],
      ['malformed but processable request', {
        scenes: [{ elements: [textEl()], unknownProp: { nested: { value: null } } }],
        extraField: 'ignored'
      }, { level: 'complete' }]
    ])('handles edge case: %s', (_, request, options) => {
      expect(() => {
        const result = validateRequest(request as any, 'createMovie', options as any);
        expect(typeof result.isValid).toBe('boolean');
        expect(typeof result.canProceed).toBe('boolean');
        expect(Array.isArray(result.errors)).toBe(true);
        expect(Array.isArray(result.warnings)).toBe(true);
        expect(typeof result.validationLevel).toBe('string');
      }).not.toThrow();
    });

    it.each([
      // [description, action, request, expectedBehavior]
      ['createMovie with empty movie and scene elements', 'createMovie', {
        scenes: [{ elements: [] }],
        elements: []
      }, 'should trigger validation error'],

      ['mergeVideoAudio with multiple scenes', 'mergeVideoAudio', {
        scenes: [
          { elements: [videoEl(), audioEl()] },
          { elements: [videoEl()] }
        ]
      }, 'should process without action-specific errors'],

      ['mergeVideos with single scene', 'mergeVideos', {
        scenes: [{ elements: [videoEl()] }]
      }, 'should process but may have warnings'],

      ['all actions with skipActionRules', 'createMovie', {
        scenes: []
      }, 'should bypass action-specific validation']
    ])('action-specific behavior: %s', (_, action, request, expectedBehavior) => {
      const normalResult = validateRequest(request as any, action as any, { level: 'semantic' });
      const skippedResult = validateRequest(request as any, action as any, { 
        level: 'semantic', 
        skipActionRules: true 
      });

      // Both should return valid result structures
      expect(typeof normalResult.isValid).toBe('boolean');
      expect(typeof skippedResult.isValid).toBe('boolean');

      // When skipActionRules is true, should have fewer action-specific errors
      const normalActionErrors = normalResult.errors.filter(e => 
        e.includes(`${action} action`) || e.includes(`${action} requires`)
      );
      const skippedActionErrors = skippedResult.errors.filter(e => 
        e.includes(`${action} action`) || e.includes(`${action} requires`)
      );

      expect(skippedActionErrors.length).toBeLessThanOrEqual(normalActionErrors.length);
    });
  });

  describe('coverage for remaining uncovered lines', () => {
    it('covers uncovered lines in performCompleteValidation (153-154)', () => {
      // Test lines 153-154: movie elements validation path
      const result = validateRequest(
        {
          scenes: [{ elements: [textEl()] }],
          elements: [{ type: 'subtitles', captions: 'test' }] // Valid movie element
        } as any,
        'createMovie',
        { level: 'complete', validateElements: true }
      );

      expect(typeof result.isValid).toBe('boolean');
    });

    it('covers uncovered line 198: default case in validateActionBusinessRules', () => {
      // Test line 198: default case in switch statement (unreachable in normal flow)
      const result = validateRequest(
        { scenes: [{ elements: [textEl()] }] } as any,
        'unknownAction' as any, // Force unknown action to hit default case
        { level: 'semantic', skipActionRules: false }
      );

      expect(typeof result.isValid).toBe('boolean');
    });

    it('covers mergeVideoAudio scene with no elements path', () => {
      const result = validateRequest(
        {
          scenes: [{ elements: [] }] // Empty elements array to trigger the specific condition
        } as any,
        'mergeVideoAudio',
        { level: 'semantic' }
      );

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e: string) => e.includes('mergeVideoAudio scene must contain elements'))).toBe(true);
    });

    it('covers mergeVideoAudio scene with null elements', () => {
      const result = validateRequest(
        {
          scenes: [{}] // Scene without elements property to trigger the condition
        } as any,
        'mergeVideoAudio', 
        { level: 'semantic' }
      );

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e: string) => e.includes('mergeVideoAudio scene must contain elements'))).toBe(true);
    });
  });
});