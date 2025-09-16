// nodes/CreateJ2vMovie/core/requestBuilder.ts
// Updated for single-scene architecture

import { JSON2VideoRequest, Scene } from '../schema/json2videoSchema';
import { CollectedParameters } from './parameterCollector';

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
 */
export function buildRequest(parameters: CollectedParameters): RequestBuildResult {
  const result: RequestBuildResult = {
    request: null,
    errors: [],
    warnings: []
  };

  try {
    if (parameters.isAdvancedMode) {
      // Advanced mode: Use JSON template only
      result.request = buildAdvancedModeRequest(parameters, result);
    } else {
      // Basic mode: Build from form parameters using single-scene approach
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
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    result.errors.push(`Request building failed: ${errorMessage}`);
    return result;
  }
}

// =============================================================================
// ADVANCED MODE REQUEST BUILDING
// =============================================================================

/**
 * Build request from JSON template only
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

// =============================================================================
// BASIC MODE REQUEST BUILDING (SINGLE-SCENE APPROACH)
// =============================================================================

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

  // Apply output settings to request
  applyOutputSettings(request, parameters);

  // Process movie-level subtitles (for createMovie operation)
  if (parameters.subtitles && typeof parameters.subtitles === 'object') {
    request.elements = [parameters.subtitles];
  }

  // Create single scene with all elements
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

  // Apply output settings if present
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

  // Create the single scene
  const scene: Scene = {
    elements: []
  };

  // Add all collected elements to the scene
  if (parameters.elements && parameters.elements.length > 0) {
    // Process each element
    parameters.elements.forEach((element, index) => {
      try {
        // Basic validation
        if (!element.type) {
          result.errors.push(`Element ${index + 1}: missing type`);
          return;
        }

        // Add the element (already processed by parameter collector)
        scene.elements.push(element);

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        result.errors.push(`Element ${index + 1}: ${errorMessage}`);
      }
    });
  }

  // Add the scene to the request (even if empty)
  request.scenes.push(scene);

  // Operation-specific adjustments
  adjustForOperation(request, parameters, result);

  // Warnings for empty content
  if (scene.elements.length === 0) {
    if (!parameters.subtitles) {
      result.warnings.push('No elements or subtitles provided - video will be empty');
    } else {
      result.warnings.push('No scene elements provided - only subtitles will appear');
    }
  }
}

/**
 * Apply operation-specific adjustments to the request
 */
function adjustForOperation(
  request: JSON2VideoRequest,
  parameters: CollectedParameters,
  result: RequestBuildResult
): void {

  switch (parameters.operation) {
    case 'createMovie':
      // No specific adjustments needed - already handles movie elements and scenes
      break;

    case 'mergeVideoAudio':
      // Ensure we have video and audio elements
      const scene = request.scenes[0];
      if (scene && scene.elements) {
        const hasVideo = scene.elements.some(el => el.type === 'video');
        const hasAudio = scene.elements.some(el => el.type === 'audio');
        
        if (!hasVideo) {
          result.warnings.push('mergeVideoAudio: No video element found');
        }
        if (!hasAudio) {
          result.warnings.push('mergeVideoAudio: No audio element found');
        }
      }
      break;

    case 'mergeVideos':
      // For mergeVideos, create separate scenes for each video element
      if (request.scenes[0] && request.scenes[0].elements) {
        const videoElements = request.scenes[0].elements.filter(el => el.type === 'video');
        const otherElements = request.scenes[0].elements.filter(el => el.type !== 'video');
        
        if (videoElements.length > 1) {
          // Create separate scenes for each video
          request.scenes = videoElements.map((videoElement, index) => ({
            elements: [videoElement, ...otherElements]
          }));
          
          result.warnings.push(`Created ${videoElements.length} scenes for mergeVideos operation`);
        } else if (videoElements.length === 1) {
          result.warnings.push('mergeVideos with single video - consider using createMovie or mergeVideoAudio');
        } else {
          result.warnings.push('mergeVideos: No video elements found');
        }
      }
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
  
  // Apply export configurations
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

  // Ensure we have an ID
  if (!request.id) {
    request.id = parameters.recordId || `n8n-${Date.now()}`;
  }
}

/**
 * Helper to check if request is effectively empty
 */
export function isEmptyRequest(request: JSON2VideoRequest): boolean {
  // Has movie-level elements (like subtitles)
  if (request.elements && request.elements.length > 0) {
    return false;
  }
  
  // Has scene elements
  if (request.scenes && request.scenes.length > 0) {
    return !request.scenes.some(scene => 
      scene.elements && scene.elements.length > 0
    );
  }
  
  return true;
}