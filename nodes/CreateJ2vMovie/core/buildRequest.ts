// nodes/CreateJ2vMovie/core/buildRequest.ts

import { JSON2VideoRequest, Scene } from '../schema/schema';
import { CollectedParameters } from './collector';

/**
 * Request building result with detailed error reporting
 */
export interface RequestBuildResult {
  request: JSON2VideoRequest | null;
  errors: string[];
  warnings: string[];
}

/**
 * Build complete JSON2Video API request from collected parameters
 * Handles both basic mode (form parameters) and advanced mode (JSON template)
 */
export function buildRequest(parameters: CollectedParameters): RequestBuildResult {
  const result: RequestBuildResult = {
    request: null,
    errors: [],
    warnings: []
  };

  try {
    if (parameters.isAdvancedMode) {
      result.request = buildAdvancedModeRequest(parameters, result);
    } else {
      result.request = buildBasicModeRequest(parameters, result);
    }

    if (result.request) {
      applyCommonRequestProperties(result.request, parameters);

      if (!result.request.scenes || result.request.scenes.length === 0) {
        result.warnings.push('Request has no scenes - video will be empty');
      }
    }

    return result;

  } catch (error) {
    result.errors.push('Request building failed: Unknown error');
    return result;
  }
}

/**
 * Build request from JSON template in advanced mode
 */
function buildAdvancedModeRequest(
  parameters: CollectedParameters,
  result: RequestBuildResult
): JSON2VideoRequest | null {

  try {
    if (!parameters.jsonTemplate || !parameters.jsonTemplate.trim()) {
      result.errors.push('Advanced mode requires a JSON template');
      return null;
    }

    let baseRequest: JSON2VideoRequest;
    try {
      baseRequest = JSON.parse(parameters.jsonTemplate.trim());
    } catch (parseError) {
      result.errors.push('Invalid JSON template: Parse error');
      return null;
    }

    if (!baseRequest.scenes) {
      baseRequest.scenes = [];
    }

    return baseRequest;

  } catch (error) {
    result.errors.push('Advanced mode processing failed: Unknown error');
    return null;
  }
}

/**
 * Build request from form parameters using single-scene approach
 */
function buildBasicModeRequest(
  parameters: CollectedParameters,
  result: RequestBuildResult
): JSON2VideoRequest | null {

  const request: JSON2VideoRequest = {
    scenes: []
  };

  applyOutputSettings(request, parameters);

  // Process movie-level subtitles
  if (parameters.subtitles && typeof parameters.subtitles === 'object') {
    request.elements = [parameters.subtitles];
  }

  buildSingleScene(request, parameters, result);

  return request;
}

/**
 * Apply output settings to the request
 */
function applyOutputSettings(
  request: JSON2VideoRequest,
  parameters: CollectedParameters
): void {

  if (parameters.outputSettings) {
    const output = parameters.outputSettings;

    if (output.width !== undefined) request.width = output.width;
    if (output.height !== undefined) request.height = output.height;
    if (output.quality !== undefined) request.quality = output.quality as any;
    if (output.cache !== undefined) request.cache = output.cache;
  }

  // Set defaults if no output settings provided
  if (!request.width) request.width = 1920;
  if (!request.height) request.height = 1080;
  if (!request.quality) request.quality = 'high';
}

/**
 * Build single scene with all collected elements
 */
function buildSingleScene(
  request: JSON2VideoRequest,
  parameters: CollectedParameters,
  result: RequestBuildResult
): void {

  const scene: Scene = {
    elements: []
  };

  if (parameters.elements && parameters.elements.length > 0) {
    parameters.elements.forEach((element, index) => {
      try {
        if (!element.type) {
          result.errors.push(`Element ${index + 1}: missing type`);
          return;
        }

        scene.elements.push(element);

      } catch (error) {
        result.errors.push(`Element ${index + 1}: Unknown error`);
      }
    });
  }

  request.scenes.push(scene);

  if (scene.elements.length === 0) {
    if (!parameters.subtitles) {
      result.warnings.push('No elements or subtitles provided - video will be empty');
    } else {
      result.warnings.push('No scene elements provided - only subtitles will appear');
    }
  }
}

/**
 * Apply common request properties that affect all operations
 */
function applyCommonRequestProperties(
  request: JSON2VideoRequest,
  parameters: CollectedParameters
): void {

  // Apply exports configuration with v2 API format
  if (parameters.exportConfigs && parameters.exportConfigs.length > 0) {
    request.exports = parameters.exportConfigs;

    // Warning for multiple export configs (API limitation)
    if (parameters.exportConfigs.length > 1) {
      // This warning will be shown in validation, so we don't duplicate it here
    }
  }

  if (parameters.recordId) {
    const recordComment = `RecordID: ${parameters.recordId}`;
    if (request.comment) {
      request.comment += ` | ${recordComment}`;
    } else {
      request.comment = recordComment;
    }
  }

  if (!request.id) {
    request.id = parameters.recordId || `n8n-${Date.now()}`;
  }
}

/**
 * Check if request contains meaningful content
 */
export function isEmptyRequest(request: JSON2VideoRequest): boolean {
  if (request.elements && request.elements.length > 0) {
    return false;
  }

  if (request.scenes && request.scenes.length > 0) {
    return !request.scenes.some(scene =>
      scene.elements && scene.elements.length > 0
    );
  }

  return true;
}