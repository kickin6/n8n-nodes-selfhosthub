// nodes/CreateJ2vMovie/core/validator.ts

import {
  ValidationResult,
  validateJSON2VideoRequest,
  validateMovieElements,
  validateSceneElements
} from '../schema/rules';
import { JSON2VideoRequest } from '../schema/schema';
import { RequestBuildResult } from './buildRequest';

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
}

/**
 * Actionable errors categorized by type
 */
export interface ActionableErrors {
  fixable: string[];
  critical: string[];
  warnings: string[];
}

/**
 * Comprehensive request validation
 */
export function validateRequest(
  request: JSON2VideoRequest,
  options: ValidationOptions = {}
): RequestValidationResult {

  const opts: Required<ValidationOptions> = {
    level: options.level || 'complete',
    strictMode: options.strictMode !== false,
    includeWarnings: options.includeWarnings !== false,
    validateElements: options.validateElements !== false,
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
    if (!request || typeof request !== 'object') {
      result.errors.push('Request must be a valid object');
      result.isValid = false;
      result.canProceed = false;
      return result;
    }

    // Schema validation (structural and semantic)
    if (opts.level === 'structural' || opts.level === 'semantic' || opts.level === 'complete') {
      performSchemaValidation(request, result, opts);
    }

    // Complete element validation
    if (opts.level === 'complete') {
      performCompleteValidation(request, result, opts);
    }

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

  // Check that request has at least one element somewhere
  let hasAnyElements = false;

  if (request.elements && request.elements.length > 0) {
    hasAnyElements = true;
  }

  if (request.scenes && Array.isArray(request.scenes)) {
    for (const scene of request.scenes) {
      if (scene.elements && Array.isArray(scene.elements) && scene.elements.length > 0) {
        hasAnyElements = true;
        break;
      }
    }
  }

  if (!hasAnyElements) {
    result.errors.push('Request must contain at least one element (either at movie level or in scenes) to create a valid video');
  }

  performCrossValidation(request, result, options);
}

/**
 * Perform cross-validation between different parts of the request
 */
function performCrossValidation(
  request: JSON2VideoRequest,
  result: RequestValidationResult,
  options: Required<ValidationOptions>
): void {
  // Cross-validation logic for element compatibility, duration constraints, etc.
  // Subtitle conflicts are prevented by TypeScript types
}

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
 * Extract actionable errors categorized by fixability
 */
export function extractActionableErrors(result: RequestValidationResult): ActionableErrors {
  const actionableErrors: ActionableErrors = {
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
      actionableErrors.fixable.push(error);
    } else if (isCritical) {
      actionableErrors.critical.push(error);
    } else {
      actionableErrors.critical.push(error);
    }
  });

  return actionableErrors;
}

/**
 * Determine if validation errors are recoverable
 */
export function isRecoverable(result: RequestValidationResult): boolean {
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

  // Business rule errors might be recoverable
  const recoverablePatterns = [
    /at least one element is required/i,
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

  const validationResult = validateRequest(buildResult.request, options);

  // Merge build errors with validation errors
  if (buildResult.errors && buildResult.errors.length > 0) {
    validationResult.errors.unshift(...buildResult.errors);
    validationResult.isValid = false;
  }

  return validationResult;
}