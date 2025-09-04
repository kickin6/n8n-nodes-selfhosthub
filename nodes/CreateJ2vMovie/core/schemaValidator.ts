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
  skipActionRules?: boolean;
}

// =============================================================================
// MAIN VALIDATION FUNCTION
// =============================================================================

/**
 * Main validation function with explicit action parameter
 */
export function validateRequest(
  request: JSON2VideoRequest, 
  action: 'createMovie' | 'mergeVideoAudio' | 'mergeVideos',
  options: ValidationOptions = {}
): RequestValidationResult {

  const result: RequestValidationResult = {
    isValid: false,
    canProceed: false,
    errors: [],
    warnings: [],
    validationLevel: options.level || 'complete',
  };

  try {
    performStructuralValidation(request, result, options);

    if ((options.level === 'semantic' || options.level === 'complete') && result.errors.length === 0) {
      performSemanticValidation(request, result, options, action);
    }

    if (options.level === 'complete' && result.errors.length === 0) {
      performCompleteValidation(request, result, options);
    }

  } catch (error) {
    result.errors.push(`Validation failed: ${(error as Error).message}`);
  }

  result.isValid = result.errors.length === 0;
  result.canProceed = result.isValid;
  result.request = request;

  return result;
}

// =============================================================================
// VALIDATION LEVELS
// =============================================================================

/**
 * Level 1: Structural validation - ensures basic JSON structure is correct
 */
function performStructuralValidation(
  request: JSON2VideoRequest,
  result: RequestValidationResult,
  options: ValidationOptions
): void {

  if (!request || typeof request !== 'object') {
    result.errors.push('Request must be a valid object');
    return;
  }

  if (!Array.isArray(request.scenes)) {
    result.errors.push('Request must contain a scenes array');
  }

  const numericFields = ['width', 'height', 'fps'] as const;
  numericFields.forEach(field => {
    const value = request[field];
    if (value !== undefined && (typeof value !== 'number' || isNaN(value))) {
      result.errors.push(`${field} must be a valid number`);
    }
  });

  const booleanFields = ['cache'] as const;
  booleanFields.forEach(field => {
    const value = request[field];
    if (value !== undefined && typeof value !== 'boolean') {
      result.errors.push(`${field} must be a boolean`);
    }
  });
}

/**
 * Level 2: Semantic validation - ensures JSON structure meets API requirements
 */
function performSemanticValidation(
  request: JSON2VideoRequest,
  result: RequestValidationResult,
  options: ValidationOptions,
  action: string
): void {

  const schemaValidation = validateJSON2VideoRequest(request);
  
  result.errors.push(...schemaValidation.errors);
  
  if (options.includeWarnings) {
    result.warnings.push(...schemaValidation.warnings);
  }

  validateActionBusinessRules(request, action, result, options);
}

/**
 * Level 3: Complete validation - deep validation including element processing
 */
function performCompleteValidation(
  request: JSON2VideoRequest,
  result: RequestValidationResult,
  options: ValidationOptions
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
// SPECIALIZED VALIDATION FUNCTIONS
// =============================================================================

/**
 * Action-specific business rules validation
 */
function validateActionBusinessRules(
  request: JSON2VideoRequest,
  action: string,
  result: RequestValidationResult,
  options: ValidationOptions
): void {
  
  if (options.skipActionRules) {
    return;
  }
  
  switch (action) {
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
      break;
  }
}

/**
 * Validate createMovie required structure
 */
function validateCreateMovieRequiredStructure(
  request: JSON2VideoRequest,
  result: RequestValidationResult
): void {

  const hasMovieElements = request.elements && request.elements.length > 0;
  const hasSceneElements = request.scenes.some(scene => scene.elements && scene.elements.length > 0);

  if (!hasMovieElements && !hasSceneElements) {
    result.errors.push('createMovie action requires either movie elements or scene elements');
  }

  request.scenes.forEach((scene: Scene, index: number) => {
    if (scene.elements) {
      scene.elements.forEach((element: SceneElement, elemIndex: number) => {
        if ((element as any).type === 'subtitles') {
          result.errors.push(`Scene ${index + 1} element ${elemIndex + 1}: Subtitles can only be at movie level`);
        }
      });
    }
  });
}

/**
 * Validate mergeVideoAudio required structure
 */
function validateMergeVideoAudioRequiredStructure(
  request: JSON2VideoRequest,
  result: RequestValidationResult
): void {

  if (request.scenes.length === 0) {
    result.errors.push('mergeVideoAudio requires at least one scene');
    return;
  }

  const scene = request.scenes[0];
  if (!scene.elements || scene.elements.length === 0) {
    result.errors.push('mergeVideoAudio scene must contain elements');
    return;
  }

  const hasVideo = scene.elements.some(el => el.type === 'video');
  const hasAudio = scene.elements.some(el => el.type === 'audio');

  if (!hasVideo) {
    result.errors.push('mergeVideoAudio action requires a video element');
  }
  if (!hasAudio) {
    result.errors.push('mergeVideoAudio action requires an audio element');
  }
}

/**
 * Validate mergeVideos required structure
 */
function validateMergeVideosRequiredStructure(
  request: JSON2VideoRequest,
  result: RequestValidationResult
): void {

  if (request.scenes.length === 0) {
    result.errors.push('mergeVideos requires at least one scene');
    return;
  }

  const hasValidScenes = request.scenes.some(scene => 
    scene.elements && scene.elements.length > 0
  );

  if (!hasValidScenes) {
    result.errors.push('mergeVideos requires scenes with elements');
  }
}

// =============================================================================
// CROSS-VALIDATION AND CONSISTENCY CHECKS
// =============================================================================

/**
 * Perform cross-validation between different parts of the request
 */
function performCrossValidation(
  request: JSON2VideoRequest,
  result: RequestValidationResult,
  options: ValidationOptions
): void {
  // Placeholder for future structural validations
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Create a human-readable validation summary
 */
export function createValidationSummary(result: RequestValidationResult): string {
  const parts = [
    `Status: ${result.isValid ? 'PASS' : 'FAIL'}`,
    `Level: ${result.validationLevel}`,
    `Errors: ${result.errors.length}`,
    `Warnings: ${result.warnings.length}`,
    `Can Proceed: ${result.canProceed ? 'YES' : 'NO'}`
  ];

  return parts.join(' | ');
}

/**
 * Extract actionable validation messages for user feedback
 */
export function extractActionableErrors(result: RequestValidationResult): {
  critical: string[];
  fixable: string[];
  warnings: string[];
} {

  const critical: string[] = [];
  const fixable: string[] = [];

  result.errors.forEach(error => {
    if (error.includes('must be') || error.includes('required') || error.includes('missing')) {
      fixable.push(error);
    } else {
      critical.push(error);
    }
  });

  return {
    critical,
    fixable,
    warnings: result.warnings
  };
}

/**
 * Check if validation errors are recoverable
 */
export function isRecoverable(result: RequestValidationResult): boolean {
  const hasStructuralErrors = result.errors.some(error => 
    error.includes('must be an object') ||
    error.includes('must be an array') ||
    error.includes('is null or undefined')
  );

  return !hasStructuralErrors && result.warnings.length === 0;
}

// =============================================================================
// INTEGRATION WITH REQUEST BUILDER
// =============================================================================

/**
 * Validate a RequestBuildResult from the request builder
 */
export function validateBuildResult(
  buildResult: RequestBuildResult,
  action: 'createMovie' | 'mergeVideoAudio' | 'mergeVideos'
): RequestValidationResult {
  const result: RequestValidationResult = {
    isValid: false,
    errors: [...buildResult.errors],
    warnings: [...buildResult.warnings],
    canProceed: false,
    validationLevel: 'complete'
  };

  if (buildResult.request) {
    const validation = validateRequest(buildResult.request, action, { 
      level: 'complete',
      strictMode: true,
      includeWarnings: true 
    });
    
    result.errors.push(...validation.errors);
    result.warnings.push(...validation.warnings);
    result.request = validation.request;
  } else {
    result.errors.push('Request build failed - no request to validate');
  }

  result.isValid = result.errors.length === 0;
  result.canProceed = result.isValid;

  return result;
}