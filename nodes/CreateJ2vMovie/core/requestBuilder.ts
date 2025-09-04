// nodes/CreateJ2vMovie/core/requestBuilder.ts

import { JSON2VideoRequest, Scene, MovieElement, SceneElement } from '../schema/json2videoSchema';
import { CollectedParameters } from './parameterCollector';
import { processMovieElements, processSceneElements, processElement } from './elementProcessor';

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
      // Basic mode: Build from form parameters
      result.request = buildBasicModeRequest(parameters, result);
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
    const errorMessage = error instanceof Error ? error.message : 'Unknown request building error';
    result.errors.push(`Failed to build request: ${errorMessage}`);
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
  
  if (!parameters.jsonTemplate) {
    result.errors.push('JSON template is required for advanced mode');
    return null;
  }

  try {
    // Parse JSON template
    let baseRequest: JSON2VideoRequest;
    try {
      baseRequest = JSON.parse(parameters.jsonTemplate);
    } catch (parseError) {
      result.errors.push(`Invalid JSON template: ${parseError instanceof Error ? parseError.message : 'Parse error'}`);
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
  if (overrides.fps !== undefined) {
    request.fps = overrides.fps;
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
// BASIC MODE REQUEST BUILDING
// =============================================================================

/**
 * Build request from form parameters based on workflow type
 */
function buildBasicModeRequest(
  parameters: CollectedParameters,
  result: RequestBuildResult
): JSON2VideoRequest | null {

  switch (parameters.action) {
    case 'createMovie':
      return buildCreateMovieRequest(parameters, result);
    case 'mergeVideoAudio':
      return buildMergeAudioRequest(parameters, result);
    case 'mergeVideos':
      return buildMergeVideosRequest(parameters, result);
    default:
      result.errors.push(`Unsupported workflow: ${parameters.action}`);
      return null;
  }
}

/**
 * Build request for createMovie workflow
 */
function buildCreateMovieRequest(
  parameters: CollectedParameters,
  result: RequestBuildResult
): JSON2VideoRequest {

  const request: JSON2VideoRequest = {
    scenes: []
  };

  // Apply basic movie configuration
  if (parameters.width !== undefined) request.width = parameters.width;
  if (parameters.height !== undefined) request.height = parameters.height;
  if (parameters.fps !== undefined) request.fps = parameters.fps;
  if (parameters.quality !== undefined) request.quality = parameters.quality as any;
  if (parameters.cache !== undefined) request.cache = parameters.cache;

  // Process movie-level elements (global across all scenes)
  if (parameters.movieElements && parameters.movieElements.length > 0) {
    const movieResult = processMovieElements(parameters.movieElements);
    if (movieResult.errors.length > 0) {
      result.errors.push(...movieResult.errors);
    }
    if (movieResult.processed.length > 0) {
      request.elements = movieResult.processed;
    }
  }

  // Build scenes from scene elements
  if (parameters.sceneElements && parameters.sceneElements.length > 0) {
    const sceneResult = processSceneElements(parameters.sceneElements);
    if (sceneResult.errors.length > 0) {
      result.errors.push(...sceneResult.errors);
    }
    
    // Create a single scene containing all scene elements
    if (sceneResult.processed.length > 0) {
      const scene: Scene = {
        elements: sceneResult.processed
      };
      request.scenes.push(scene);
    }
  }

  // If no scenes were created, create an empty scene to prevent API errors
  if (request.scenes.length === 0) {
    result.warnings.push('No scene elements provided, creating empty scene');
    request.scenes.push({ elements: [] });
  }

  return request;
}

/**
 * Build request for mergeVideoAudio workflow
 */
function buildMergeAudioRequest(
  parameters: CollectedParameters,
  result: RequestBuildResult
): JSON2VideoRequest {

  const request: JSON2VideoRequest = {
    scenes: []
  };

  if (!parameters.mergeVideoAudio) {
    result.errors.push('mergeVideoAudio parameters are required');
    return request;
  }

  // Apply output settings as movie configuration
  if (parameters.mergeVideoAudio.outputSettings) {
    const output = parameters.mergeVideoAudio.outputSettings;
    if (output.width !== undefined) request.width = output.width;
    if (output.height !== undefined) request.height = output.height;
    if (output.fps !== undefined) request.fps = output.fps;
    if (output.quality !== undefined) request.quality = output.quality;
  }

  // Create single scene with video + audio elements
  const sceneElements: any[] = [];

  // Add video element
  if (parameters.mergeVideoAudio.videoElement && parameters.mergeVideoAudio.videoElement.src) {
    const videoElement = {
      type: 'video',
      ...parameters.mergeVideoAudio.videoElement
    };
    sceneElements.push(videoElement);
  }

  // Add audio element  
  if (parameters.mergeVideoAudio.audioElement && parameters.mergeVideoAudio.audioElement.src) {
    const audioElement = {
      type: 'audio',
      ...parameters.mergeVideoAudio.audioElement
    };
    sceneElements.push(audioElement);
  }

  // Process elements and create scene
  if (sceneElements.length > 0) {
    const processResult = processSceneElements(sceneElements);
    if (processResult.errors.length > 0) {
      result.errors.push(...processResult.errors);
    }
    
    const scene: Scene = {
      elements: processResult.processed
    };
    request.scenes.push(scene);
  } else {
    result.errors.push('No valid video or audio elements found for mergeVideoAudio');
  }

  return request;
}

/**
 * Build request for mergeVideos workflow  
 */
function buildMergeVideosRequest(
  parameters: CollectedParameters,
  result: RequestBuildResult
): JSON2VideoRequest {

  const request: JSON2VideoRequest = {
    scenes: []
  };

  if (!parameters.mergeVideos) {
    result.errors.push('mergeVideos parameters are required');
    return request;
  }

  // Apply output settings as movie configuration
  if (parameters.mergeVideos.outputSettings) {
    const output = parameters.mergeVideos.outputSettings;
    if (output.width !== undefined) request.width = output.width;
    if (output.height !== undefined) request.height = output.height;
    if (output.fps !== undefined) request.fps = output.fps;
    if (output.quality !== undefined) request.quality = output.quality;
  }

  // Create separate scenes for each video (this allows transitions between them)
  if (parameters.mergeVideos.videoElements && parameters.mergeVideos.videoElements.length > 0) {
    parameters.mergeVideos.videoElements.forEach((videoElement, index) => {
      if (videoElement && videoElement.src) {
        const element = {
          type: 'video',
          ...videoElement
        };

        // Process the video element
        try {
          const processedElement = processElement(element);
          
          const scene: Scene = {
            elements: [processedElement as SceneElement]
          };

          // Add transition to all scenes except the first
          if (index > 0 && parameters.mergeVideos!.transition && parameters.mergeVideos!.transition !== 'none') {
            scene.transition = {
              style: parameters.mergeVideos!.transition as any,
              duration: parameters.mergeVideos!.transitionDuration || 1
            };
          }

          request.scenes.push(scene);
          
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown processing error';
          result.errors.push(`Video ${index + 1} processing failed: ${errorMessage}`);
        }
      }
    });
  }

  if (request.scenes.length === 0) {
    result.errors.push('No valid video elements found for mergeVideos');
  } else if (request.scenes.length < 2) {
    result.warnings.push('mergeVideos workflow typically requires at least 2 videos');
  }

  return request;
}

// =============================================================================
// COMMON REQUEST PROPERTIES
// =============================================================================

/**
 * Apply common properties to all requests regardless of mode
 */
function applyCommonRequestProperties(
  request: JSON2VideoRequest,
  parameters: CollectedParameters
): void {

  // Set record ID for correlation/webhooks
  if (parameters.recordId) {
    request.id = parameters.recordId;
  }

  // Note: webhookUrl is typically handled at the API call level, not in the request body
  // It's passed as a query parameter: ?webhook=encodeURIComponent(webhookUrl)
}