// nodes/CreateJ2vMovie/core/schemaValidator.ts

import { 
  ValidationResult,
  validateJSON2VideoRequest,
  validateMovieElements,
  validateSceneElements
} from '../schema/validators';
import { JSON2VideoRequest, Scene, SceneElement, MovieElement } from '../schema/json2videoSchema';
import { RequestBuildResult } from './requestBuilder';

// =============================================================================
// INTERFACES
// =============================================================================

/**
 * Extended validation result with request context
 */
export interface RequestValidationResult extends ValidationResult {
  request?: JSON2VideoRequest;
  canProceed: boolean;
  validationLevel: 'structural' | 'semantic' | 'complete';
}

/**
 * Validation options to control validation depth
 */
export interface ValidationOptions {
  level?: 'structural' | 'semantic' | 'complete';
  strictMode?: boolean;
  includeWarnings?: boolean;
  validateElements?: boolean;
  skipOperationRules?: boolean;
}

/**
 * Actionable errors categorized by type
 */
export interface ActionableErrors {
  fixable: string[];
  critical: string[];
  warnings: string[];
}

// =============================================================================
// MAIN VALIDATION FUNCTION
// =============================================================================

/**
 * Comprehensive request validation with operation-specific rules
 * Updated to work with unified element collections from refactor
 */
export function validateRequest(
  request: JSON2VideoRequest,
  operation: string,
  options: ValidationOptions = {}
): RequestValidationResult {

  // Set default options
  const opts: Required<ValidationOptions> = {
    level: options.level || 'complete',
    strictMode: options.strictMode !== false,
    includeWarnings: options.includeWarnings !== false,
    validateElements: options.validateElements !== false,
    skipOperationRules: options.skipOperationRules || false
  };

  const result: RequestValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
    canProceed: false,
    validationLevel: opts.level,
    request
  };

  try {
    // Step 1: Basic structural validation
    if (!request || typeof request !== 'object') {
      result.errors.push('Request must be a valid object');
      result.isValid = false;
      result.canProceed = false;
      return result;
    }

    // Step 2: Schema validation (structural and semantic)
    if (opts.level === 'structural' || opts.level === 'semantic' || opts.level === 'complete') {
      performSchemaValidation(request, result, opts);
    }

    // Step 3: Operation-specific business rules validation
    if (opts.level === 'semantic' || opts.level === 'complete') {
      validateOperationBusinessRules(request, operation, result, opts);
    }

    // Step 4: Complete element validation
    if (opts.level === 'complete') {
      performCompleteValidation(request, result, opts);
    }

    // Determine final status
    result.isValid = result.errors.length === 0;
    result.canProceed = result.isValid || !opts.strictMode;

    return result;

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown validation error';
    result.errors.push(`Validation failed: ${errorMessage}`);
    result.isValid = false;
    result.canProceed = false;
    return result;
  }
}

// =============================================================================
// VALIDATION PHASES
// =============================================================================

/**
 * Perform basic schema validation using the validators
 */
function performSchemaValidation(
  request: JSON2VideoRequest,
  result: RequestValidationResult,
  options: Required<ValidationOptions>
): void {

  const schemaResult = validateJSON2VideoRequest(request);
  result.errors.push(...schemaResult.errors);
  
  if (options.includeWarnings) {
    result.warnings.push(...schemaResult.warnings);
  }
}

/**
 * Perform complete element validation
 */
function performCompleteValidation(
  request: JSON2VideoRequest,
  result: RequestValidationResult,
  options: Required<ValidationOptions>
): void {

  if (!options.validateElements) {
    return;
  }

  if (request.elements && request.elements.length > 0) {
    const movieElementErrors = validateMovieElements(request.elements);
    result.errors.push(...movieElementErrors);
  }

  if (request.scenes) {
    request.scenes.forEach((scene, sceneIndex) => {
      if (scene.elements && scene.elements.length > 0) {
        const sceneElementErrors = validateSceneElements(scene.elements, `Scene ${sceneIndex + 1}`);
        result.errors.push(...sceneElementErrors);
      }
    });
  }

  performCrossValidation(request, result, options);
}

// =============================================================================
// UNIFIED ACTION-SPECIFIC VALIDATION
// =============================================================================

/**
 * Unified operation-specific business rules validation
 * Updated to work with unified JSON2VideoRequest structure after refactor
 */
function validateOperationBusinessRules(
  request: JSON2VideoRequest,
  operation: string,
  result: RequestValidationResult,
  options: Required<ValidationOptions>
): void {
  
  if (options.skipOperationRules) {
    return;
  }
  
  switch (operation) {
    case 'createMovie':
      validateCreateMovieRequiredStructure(request, result);
      break;
    case 'mergeVideoAudio':
      validateMergeVideoAudioRequiredStructure(request, result);
      break;
    case 'mergeVideos':
      validateMergeVideosRequiredStructure(request, result);
      break;
    default:
      if (options.strictMode) {
        result.warnings.push(`Unknown operation type: ${operation}`);
      }
      break;
  }
}

/**
 * Validate createMovie required structure
 * Updated: Now validates the final JSON2VideoRequest after unified processing
 */
function validateCreateMovieRequiredStructure(
  request: JSON2VideoRequest,
  result: RequestValidationResult
): void {

  const hasMovieElements = request.elements && request.elements.length > 0;
  const hasSceneElements = request.scenes && request.scenes.some(scene => scene.elements && scene.elements.length > 0);

  if (!hasMovieElements && !hasSceneElements) {
    result.errors.push('createMovie operation requires either movie elements or scene elements');
  }
}

/**
 * Validate mergeVideoAudio required structure
 * Should have exactly one scene with video and audio elements
 */
function validateMergeVideoAudioRequiredStructure(
  request: JSON2VideoRequest,
  result: RequestValidationResult
): void {

  if (!request.scenes || request.scenes.length === 0) {
    result.errors.push('mergeVideoAudio operation requires at least one scene');
    return;
  }

  const mainScene = request.scenes[0];
  if (!mainScene.elements || mainScene.elements.length === 0) {
    result.errors.push('mergeVideoAudio scene must contain elements');
    return;
  }

  const hasVideo = mainScene.elements.some(element => 'type' in element && element.type === 'video');
  const hasAudio = mainScene.elements.some(element => 'type' in element && element.type === 'audio');

  if (!hasVideo) {
    result.errors.push('mergeVideoAudio operation requires a video element');
  }

  if (!hasAudio) {
    result.errors.push('mergeVideoAudio operation requires an audio element');
  }
}

/**
 * Validate mergeVideos required structure
 * Should have multiple scenes with video elements
 */
function validateMergeVideosRequiredStructure(
  request: JSON2VideoRequest,
  result: RequestValidationResult
): void {

  if (!request.scenes || request.scenes.length < 2) {
    result.errors.push('mergeVideos operation requires at least two scenes');
    return;
  }

  request.scenes.forEach((scene: Scene, index: number) => {
    if (!scene.elements || scene.elements.length === 0) {
      result.errors.push(`mergeVideos Scene ${index + 1} must contain elements`);
      return;
    }

    const hasVideo = scene.elements.some(element => 'type' in element && element.type === 'video');
    if (!hasVideo) {
      result.errors.push(`mergeVideos Scene ${index + 1} must contain a video element`);
    }
  });
}

/**
 * Perform cross-validation between different parts of the request
 */
function performCrossValidation(
  request: JSON2VideoRequest,
  result: RequestValidationResult,
  options: Required<ValidationOptions>
): void {
  // Additional cross-validation logic can be added here
  // For example, checking compatibility between elements, duration constraints, etc.
  
  // Note: Subtitle conflicts are prevented by TypeScript types - 
  // subtitles can only exist in MovieElement, not SceneElement
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Create a human-readable validation summary
 */
export function createValidationSummary(result: RequestValidationResult): string {
  const status = result.isValid ? 'PASS' : 'FAIL';
  const level = result.validationLevel.toUpperCase();
  const errorCount = result.errors.length;
  const warningCount = result.warnings.length;
  
  return `${status} - ${level} validation - Errors: ${errorCount}, Warnings: ${warningCount}`;
}

/**
 * Extract operationable errors categorized by fixability
 */
export function extractActionableErrors(result: RequestValidationResult): ActionableErrors {
  const operationableErrors: ActionableErrors = {
    fixable: [],
    critical: [],
    warnings: [...result.warnings]
  };

  result.errors.forEach(error => {
    const fixablePatterns = [
      /required/i,
      /missing/i,
      /must be.*provided/i,
      /must be.*type/i
    ];

    const criticalPatterns = [
      /system failure/i,
      /fatal/i,
      /crash/i,
      /corruption/i,
      /cannot proceed/i
    ];

    const isFixable = fixablePatterns.some(pattern => pattern.test(error));
    const isCritical = criticalPatterns.some(pattern => pattern.test(error));

    if (isFixable) {
      operationableErrors.fixable.push(error);
    } else if (isCritical) {
      operationableErrors.critical.push(error);
    } else {
      // Default to critical if we can't categorize
      operationableErrors.critical.push(error);
    }
  });

  return operationableErrors;
}

/**
 * Determine if validation errors are recoverable
 */
export function isRecoverable(result: RequestValidationResult): boolean {
  // If there are warnings but no errors, it's recoverable only if no warnings
  if (result.errors.length === 0) {
    return result.warnings.length === 0;
  }

  // Structural errors are usually not recoverable
  const structuralPatterns = [
    /request must be an object/i,
    /scenes must be an array/i,
    /request is null or undefined/i
  ];

  const hasStructuralErrors = result.errors.some(error =>
    structuralPatterns.some(pattern => pattern.test(error))
  );

  if (hasStructuralErrors) {
    return false;
  }

  // Operation-specific business rule errors might be recoverable
  const recoverablePatterns = [
    /requires either movie elements or scene elements/i,
    /requires a video element/i,
    /requires an audio element/i,
    /subtitles can only be at movie level/i
  ];

  return result.errors.some(error => 
    recoverablePatterns.some(pattern => pattern.test(error))
  );
}

/**
 * Validate a RequestBuildResult comprehensively
 */
export function validateBuildResult(
  buildResult: RequestBuildResult,
  operation: string,
  options: ValidationOptions = {}
): RequestValidationResult {

  if (!buildResult.request) {
    return {
      isValid: false,
      errors: ['Build result contains no request'],
      warnings: [],
      canProceed: false,
      validationLevel: options.level || 'complete',
      request: undefined
    };
  }

  const validationResult = validateRequest(buildResult.request, operation, options);
  
  // Merge build errors with validation errors
  if (buildResult.errors && buildResult.errors.length > 0) {
    validationResult.errors.unshift(...buildResult.errors);
    validationResult.isValid = false;
  }

  return validationResult;
}