// nodes/CreateJ2vMovie/core/requestBuilder.ts

import { JSON2VideoRequest, Scene, MovieElement, SceneElement } from '../schema/json2videoSchema';
import { CollectedParameters } from './parameterCollector';
import { processElements, processElement } from './elementProcessor';

// =============================================================================
// INTERFACES
// =============================================================================

/**
 * Request building result with detailed error reporting
 */
export interface RequestBuildResult {
  request: JSON2VideoRequest | null;
  errors: string[];
  warnings: string[];
}

// =============================================================================
// MAIN REQUEST BUILDER FUNCTION
// =============================================================================

/**
 * Build complete JSON2Video API request from collected parameters
 * This is the main entry point that orchestrates the entire request building process
 */
export function buildRequest(parameters: CollectedParameters): RequestBuildResult {
  const result: RequestBuildResult = {
    request: null,
    errors: [],
    warnings: []
  };

  try {
    if (parameters.isAdvancedMode) {
      // Advanced mode: Start with JSON template, apply overrides
      result.request = buildAdvancedModeRequest(parameters, result);
    } else {
      // Basic mode: Build from form parameters using unified approach
      result.request = buildUnifiedRequest(parameters, result);
    }

    // Apply common request properties
    if (result.request) {
      applyCommonRequestProperties(result.request, parameters);
      
      // Final validation
      if (!result.request.scenes || result.request.scenes.length === 0) {
        result.warnings.push('Request has no scenes - video will be empty');
      }
    }

    return result;

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    result.errors.push(`Request building failed: ${errorMessage}`);
    return result;
  }
}

// =============================================================================
// ADVANCED MODE REQUEST BUILDING
// =============================================================================

/**
 * Build request from JSON template with parameter overrides
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

    // Parse the JSON template
    let baseRequest: JSON2VideoRequest;
    try {
      baseRequest = JSON.parse(parameters.jsonTemplate.trim());
    } catch (parseError) {
      const errorMessage = parseError instanceof Error ? parseError.message : 'Parse error';
      result.errors.push(`Invalid JSON template: ${errorMessage}`);
      return null;
    }

    // Apply parameter overrides to the parsed template
    if (parameters.advancedOverrides) {
      applyAdvancedOverrides(baseRequest, parameters.advancedOverrides);
    }

    // Ensure minimum required structure
    if (!baseRequest.scenes) {
      baseRequest.scenes = [];
    }

    return baseRequest;

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    result.errors.push(`Advanced mode processing failed: ${errorMessage}`);
    return null;
  }
}

/**
 * Apply parameter overrides to JSON template
 */
function applyAdvancedOverrides(
  request: JSON2VideoRequest, 
  overrides: NonNullable<CollectedParameters['advancedOverrides']>
): void {
  
  // Apply dimensional overrides
  if (overrides.width !== undefined) {
    request.width = overrides.width;
  }
  if (overrides.height !== undefined) {
    request.height = overrides.height;
  }

  // Apply quality/rendering overrides
  if (overrides.quality !== undefined) {
    request.quality = overrides.quality as any;
  }
  if (overrides.resolution !== undefined) {
    request.resolution = overrides.resolution;
  }
  if (overrides.cache !== undefined) {
    request.cache = overrides.cache;
  }
}

// =============================================================================
// UNIFIED REQUEST BUILDING
// =============================================================================

/**
 * Build request using unified approach for all operations
 * This replaces the operation-specific request builders
 */
function buildUnifiedRequest(
  parameters: CollectedParameters,
  result: RequestBuildResult
): JSON2VideoRequest | null {

  const request: JSON2VideoRequest = {
    scenes: []
  };

  // Apply operation settings to request
  applyOperationSettings(request, parameters);

  // Process movie-level elements (global across all scenes)
  if (parameters.movieElements && parameters.movieElements.length > 0) {
    const movieResult = processElements(parameters.movieElements);
    if (movieResult.errors.length > 0) {
      result.errors.push(...movieResult.errors);
    }
    if (movieResult.processed.length > 0) {
      request.elements = movieResult.processed;
    }
  }

  // Build scenes based on operation type
  buildScenesForOperation(request, parameters, result);

  // If no scenes were created, handle based on operation
  if (request.scenes.length === 0) {
    handleEmptyScenes(request, parameters, result);
  }

  return request;
}

/**
 * Apply operation settings to the request
 */
function applyOperationSettings(
  request: JSON2VideoRequest,
  parameters: CollectedParameters
): void {

  if (!parameters.operationSettings) {
    return;
  }

  const settings = parameters.operationSettings;

  // Apply output settings if present
  if (settings.outputSettings) {
    const output = settings.outputSettings;
    
    if (output.width !== undefined) request.width = output.width;
    if (output.height !== undefined) request.height = output.height;
    if (output.quality !== undefined) request.quality = output.quality as any;
    if (output.cache !== undefined) request.cache = output.cache;
    // Note: draft property not supported in JSON2VideoRequest schema
    if (output.resolution !== undefined) request.resolution = output.resolution;
  }
}

/**
 * Build scenes based on operation type using unified element collections
 */
function buildScenesForOperation(
  request: JSON2VideoRequest,
  parameters: CollectedParameters,
  result: RequestBuildResult
): void {

  switch (parameters.action) {
    case 'createMovie':
      buildCreateMovieScenes(request, parameters, result);
      break;
    case 'mergeVideoAudio':
      buildMergeVideoAudioScenes(request, parameters, result);
      break;
    case 'mergeVideos':
      buildMergeVideosScenes(request, parameters, result);
      break;
    default:
      result.errors.push(`Unsupported operation: ${parameters.action}`);
  }
}

/**
 * Build scenes for createMovie operation
 */
function buildCreateMovieScenes(
  request: JSON2VideoRequest,
  parameters: CollectedParameters,
  result: RequestBuildResult
): void {

  // For createMovie, all scene elements go into a single scene
  if (parameters.sceneElements && parameters.sceneElements.length > 0) {
    const sceneResult = processElements(parameters.sceneElements);
    if (sceneResult.errors.length > 0) {
      result.errors.push(...sceneResult.errors);
    }
    
    if (sceneResult.processed.length > 0) {
      const scene: Scene = {
        elements: sceneResult.processed
      };
      request.scenes.push(scene);
    }
  }
}

/**
 * Build scenes for mergeVideoAudio operation
 */
function buildMergeVideoAudioScenes(
  request: JSON2VideoRequest,
  parameters: CollectedParameters,
  result: RequestBuildResult
): void {

  // For mergeVideoAudio, all elements go into a single scene
  if (parameters.sceneElements && parameters.sceneElements.length > 0) {
    const sceneResult = processElements(parameters.sceneElements);
    if (sceneResult.errors.length > 0) {
      result.errors.push(...sceneResult.errors);
    }
    
    if (sceneResult.processed.length > 0) {
      const scene: Scene = {
        elements: sceneResult.processed
      };
      request.scenes.push(scene);
    }
  } else {
    result.errors.push('No valid video or audio elements found for mergeVideoAudio');
  }
}

/**
 * Build scenes for mergeVideos operation
 */
function buildMergeVideosScenes(
  request: JSON2VideoRequest,
  parameters: CollectedParameters,
  result: RequestBuildResult
): void {

  if (!parameters.sceneElements || parameters.sceneElements.length === 0) {
    result.errors.push('No video elements found for mergeVideos');
    return;
  }

  // Group elements by sceneIndex (if specified) or create separate scenes for each video
  const sceneGroups = groupElementsForMergeVideos(parameters.sceneElements);
  
  sceneGroups.forEach((elements, index) => {
    const sceneResult = processElements(elements);
    if (sceneResult.errors.length > 0) {
      result.errors.push(...sceneResult.errors.map(err => `Scene ${index + 1}: ${err}`));
    }
    
    if (sceneResult.processed.length > 0) {
      const scene: Scene = {
        elements: sceneResult.processed
      };

      // Apply transition settings if specified and not the last scene
      if (parameters.operationSettings?.transition && 
          parameters.operationSettings.transition !== 'none' &&
          index < sceneGroups.length - 1) {
        scene.transition = {
          style: parameters.operationSettings.transition as any,
          duration: parameters.operationSettings.transitionDuration || 1
        };
      }

      request.scenes.push(scene);
    }
  });

  // Special handling for single video
  if (request.scenes.length === 1) {
    result.warnings.push('mergeVideos with single video - consider using mergeVideoAudio for audio overlay');
  }
}

/**
 * Group scene elements for mergeVideos operation
 */
function groupElementsForMergeVideos(sceneElements: any[]): any[][] {
  // For mergeVideos, each video element becomes its own scene
  // Unless sceneIndex is specified (for future grouping support)
  const groups: any[][] = [];
  
  sceneElements.forEach(element => {
    if (element.sceneIndex !== undefined) {
      // Use specified scene grouping
      if (!groups[element.sceneIndex]) {
        groups[element.sceneIndex] = [];
      }
      groups[element.sceneIndex].push(element);
    } else {
      // Each element gets its own scene
      groups.push([element]);
    }
  });

  return groups.filter(group => group.length > 0);
}

/**
 * Handle cases where no scenes were created
 */
function handleEmptyScenes(
  request: JSON2VideoRequest,
  parameters: CollectedParameters,
  result: RequestBuildResult
): void {

  switch (parameters.action) {
    case 'createMovie':
      if (parameters.movieElements.length > 0) {
        // Has movie elements but no scene elements - create empty scene
        result.warnings.push('No scene elements provided, creating empty scene with movie elements');
        request.scenes.push({ elements: [] });
      } else {
        // No elements at all
        result.warnings.push('No elements provided, creating empty scene');
        request.scenes.push({ elements: [] });
      }
      break;
    
    case 'mergeVideoAudio':
    case 'mergeVideos':
      // These operations should have scene elements - errors already reported in validation
      result.warnings.push(`No scenes created for ${parameters.action} operation`);
      request.scenes.push({ elements: [] });
      break;
  }
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Apply common request properties that affect all operations
 */
function applyCommonRequestProperties(
  request: JSON2VideoRequest,
  parameters: CollectedParameters
): void {
  
  // Apply export configurations (replaces webhook comment hack)
  if (parameters.exportConfigs && parameters.exportConfigs.length > 0) {
    request.exports = parameters.exportConfigs;
  }

  // Apply record ID if specified (as comment for correlation)
  if (parameters.recordId) {
    const recordComment = `RecordID: ${parameters.recordId}`;
    if (request.comment) {
      request.comment += ` | ${recordComment}`;
    } else {
      request.comment = recordComment;
    }
  }
}