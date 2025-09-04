// nodes/CreateJ2vMovie/core/parameterCollector.ts

import { IExecuteFunctions } from 'n8n-workflow';
import { JSON2VideoRequest } from '../schema/json2videoSchema';

// =============================================================================
// INTERFACES
// =============================================================================

/**
 * Structured parameters collected from n8n execution context
 * This interface normalizes all action types into a common structure
 */
export interface CollectedParameters {
  // Action identification
  action: 'createMovie' | 'mergeVideoAudio' | 'mergeVideos';
  isAdvancedMode: boolean;

  // Correlation parameters (optional in API)
  recordId?: string;
  webhookUrl?: string;

  // Movie configuration
  width?: number;
  height?: number;
  fps?: number;
  quality?: string;
  resolution?: string;
  cache?: boolean;
  draft?: boolean;

  // Content arrays
  movieElements?: any[];
  sceneElements?: any[];
  scenes?: any[];

  // Advanced mode
  jsonTemplate?: string;
  advancedOverrides?: {
    width?: number;
    height?: number;
    fps?: number;
    quality?: string;
    resolution?: string;
    cache?: boolean;
    draft?: boolean;
  };

  // Action-specific parameters
  mergeVideoAudio?: {
    videoElement?: any;
    audioElement?: any;
    outputSettings?: any;
  };

  mergeVideos?: {
    videoElements?: any[];
    transition?: string;
    transitionDuration?: number;
    outputSettings?: any;
  };
}

// =============================================================================
// MAIN PARAMETER COLLECTION FUNCTION
// =============================================================================

/**
 * Collect and normalize parameters from n8n execution context
 * This is the main entry point for parameter extraction
 */
export function collectParameters(
  execute: IExecuteFunctions,
  itemIndex: number,
  action: 'createMovie' | 'mergeVideoAudio' | 'mergeVideos'
): CollectedParameters {

  const parameters: CollectedParameters = {
    action,
    isAdvancedMode: false,
  };

  // Collect common parameters first
  collectCommonParameters(execute, itemIndex, parameters);

  // Determine advanced mode based on action
  determineAdvancedMode(execute, itemIndex, action, parameters);

  // Collect action-specific parameters
  switch (action) {
    case 'createMovie':
      collectCreateMovieParameters(execute, itemIndex, parameters);
      break;
    case 'mergeVideoAudio':
      collectMergeAudioParameters(execute, itemIndex, parameters);
      break;
    case 'mergeVideos':
      collectMergeVideosParameters(execute, itemIndex, parameters);
      break;
    default:
      throw new Error(`Unsupported action type: ${action}`);
  }

  return parameters;
}

// =============================================================================
// COMMON PARAMETER COLLECTION
// =============================================================================

/**
 * Collect parameters that are common across all actions
 */
function collectCommonParameters(
  execute: IExecuteFunctions,
  itemIndex: number,
  parameters: CollectedParameters
): void {

  // Correlation parameters are optional — API will auto-generate if omitted
  const recordId = String(execute.getNodeParameter('recordId', itemIndex, ''));
  const webhookUrl = String(execute.getNodeParameter('webhookUrl', itemIndex, ''));

  if (recordId.trim()) parameters.recordId = recordId.trim();
  if (webhookUrl.trim()) parameters.webhookUrl = webhookUrl.trim();
}

// =============================================================================
// ADVANCED MODE DETECTION
// =============================================================================

/**
 * Determine if action is in advanced mode based on operation-specific parameter names
 */
function determineAdvancedMode(
  execute: IExecuteFunctions,
  itemIndex: number,
  action: string,
  parameters: CollectedParameters
): void {

  try {
    let advancedModeParam: string;

    // Each action has its own advanced mode parameter name
    switch (action) {
      case 'createMovie':
        advancedModeParam = 'advancedMode';
        break;
      case 'mergeVideoAudio':
        advancedModeParam = 'advancedModeMergeAudio';
        break;
      case 'mergeVideos':
        advancedModeParam = 'advancedModeMergeVideos';
        break;
      default:
        throw new Error(`Unknown action for advanced mode detection: ${action}`);
    }

    parameters.isAdvancedMode = Boolean(execute.getNodeParameter(advancedModeParam, itemIndex, false));

  } catch (error) {
    // If advanced mode parameter doesn't exist, default to basic mode
    parameters.isAdvancedMode = false;
  }
}

// =============================================================================
// ACTION-SPECIFIC PARAMETER COLLECTION
// =============================================================================

/**
 * Collect parameters specific to createMovie action
 */
function collectCreateMovieParameters(
  execute: IExecuteFunctions,
  itemIndex: number,
  parameters: CollectedParameters
): void {

  if (parameters.isAdvancedMode) {
    // Advanced mode: JSON template + overrides
    collectAdvancedModeParameters(execute, itemIndex, parameters, 'createMovie');
  } else {
    // Basic mode: Form parameters
    collectBasicMovieParameters(execute, itemIndex, parameters);
  }
}

/**
 * Collect parameters specific to mergeVideoAudio action  
 */
function collectMergeAudioParameters(
  execute: IExecuteFunctions,
  itemIndex: number,
  parameters: CollectedParameters
): void {

  if (parameters.isAdvancedMode) {
    // Advanced mode: JSON template + overrides
    collectAdvancedModeParameters(execute, itemIndex, parameters, 'mergeVideoAudio');
  } else {
    // Basic mode: Video + Audio elements + Output settings
    collectBasicMergeAudioParameters(execute, itemIndex, parameters);
  }
}

/**
 * Collect parameters specific to mergeVideos action
 */
function collectMergeVideosParameters(
  execute: IExecuteFunctions,
  itemIndex: number,
  parameters: CollectedParameters
): void {

  if (parameters.isAdvancedMode) {
    // Advanced mode: JSON template + overrides  
    collectAdvancedModeParameters(execute, itemIndex, parameters, 'mergeVideos');
  } else {
    // Basic mode: Multiple videos + transitions + Output settings
    collectBasicMergeVideosParameters(execute, itemIndex, parameters);
  }
}

// =============================================================================
// BASIC MODE PARAMETER COLLECTION
// =============================================================================

/**
 * Collect basic mode parameters for createMovie action
 */
function collectBasicMovieParameters(
  execute: IExecuteFunctions,
  itemIndex: number,
  parameters: CollectedParameters
): void {

  // Movie configuration
  parameters.width = execute.getNodeParameter('output_width', itemIndex, undefined) as number | undefined;
  parameters.height = execute.getNodeParameter('output_height', itemIndex, undefined) as number | undefined;
  parameters.fps = execute.getNodeParameter('framerate', itemIndex, undefined) as number | undefined;
  parameters.quality = execute.getNodeParameter('quality', itemIndex, undefined) as string | undefined;
  parameters.cache = execute.getNodeParameter('cache', itemIndex, undefined) as boolean | undefined;
  parameters.draft = execute.getNodeParameter('draft', itemIndex, undefined) as boolean | undefined;

  // Movie elements (global elements across all scenes)
  try {
    parameters.movieElements = execute.getNodeParameter('movieElements.elementValues', itemIndex, []) as any[];
  } catch (error) {
    parameters.movieElements = [];
  }

  // Scene elements (elements within specific scenes)
  try {
    parameters.sceneElements = execute.getNodeParameter('elements.elementValues', itemIndex, []) as any[];
  } catch (error) {
    parameters.sceneElements = [];
  }
}

/**
 * Collect basic mode parameters for mergeVideoAudio action
 */
function collectBasicMergeAudioParameters(
  execute: IExecuteFunctions,
  itemIndex: number,
  parameters: CollectedParameters
): void {

  parameters.mergeVideoAudio = {};

  // Video element configuration
  try {
    parameters.mergeVideoAudio.videoElement = execute.getNodeParameter('videoElement.videoDetails', itemIndex, {}) as any;
  } catch (error) {
    parameters.mergeVideoAudio.videoElement = {};
  }

  // Audio element configuration
  try {
    parameters.mergeVideoAudio.audioElement = execute.getNodeParameter('audioElement.audioDetails', itemIndex, {}) as any;
  } catch (error) {
    parameters.mergeVideoAudio.audioElement = {};
  }

  // Output settings
  try {
    parameters.mergeVideoAudio.outputSettings = execute.getNodeParameter('outputSettings.outputDetails', itemIndex, {}) as any;
  } catch (error) {
    parameters.mergeVideoAudio.outputSettings = {};
  }
}

/**
 * Collect basic mode parameters for mergeVideos action  
 */
function collectBasicMergeVideosParameters(
  execute: IExecuteFunctions,
  itemIndex: number,
  parameters: CollectedParameters
): void {

  parameters.mergeVideos = {};

  // Multiple video elements
  try {
    parameters.mergeVideos.videoElements = execute.getNodeParameter('videoElements.videoDetails', itemIndex, []) as any[];
  } catch (error) {
    parameters.mergeVideos.videoElements = [];
  }

  // Transition settings
  parameters.mergeVideos.transition = execute.getNodeParameter('transition', itemIndex, 'none') as string;
  parameters.mergeVideos.transitionDuration = execute.getNodeParameter('transitionDuration', itemIndex, 1) as number;

  // Output settings
  try {
    parameters.mergeVideos.outputSettings = execute.getNodeParameter('outputSettings.outputDetails', itemIndex, {}) as any;
  } catch (error) {
    parameters.mergeVideos.outputSettings = {};
  }
}

// =============================================================================
// ADVANCED MODE PARAMETER COLLECTION  
// =============================================================================

/**
 * Collect advanced mode parameters (JSON template + overrides)
 */
function collectAdvancedModeParameters(
  execute: IExecuteFunctions,
  itemIndex: number,
  parameters: CollectedParameters,
  action: string
): void {

  // Get JSON template based on action
  let templateParam: string;
  switch (action) {
    case 'createMovie':
      templateParam = 'jsonTemplate';
      break;
    case 'mergeVideoAudio':
      templateParam = 'jsonTemplateMergeAudio';
      break;
    case 'mergeVideos':
    default:
      templateParam = 'jsonTemplateMergeVideos';
      break;
  }

  // Extract JSON template
  parameters.jsonTemplate = execute.getNodeParameter(templateParam, itemIndex, '{}') as string;

  // Collect override parameters that can modify the JSON template
  parameters.advancedOverrides = {};

  // Optional overrides - only collect if they exist
  try {
    const outputWidth = execute.getNodeParameter('outputWidth', itemIndex, undefined);
    if (outputWidth !== undefined) parameters.advancedOverrides.width = outputWidth as number;
  } catch (error) { }

  try {
    const outputHeight = execute.getNodeParameter('outputHeight', itemIndex, undefined);
    if (outputHeight !== undefined) parameters.advancedOverrides.height = outputHeight as number;
  } catch (error) { }

  try {
    const framerate = execute.getNodeParameter('framerate', itemIndex, undefined);
    if (framerate !== undefined) parameters.advancedOverrides.fps = framerate as number;
  } catch (error) { }

  try {
    const quality = execute.getNodeParameter('quality', itemIndex, undefined);
    if (quality !== undefined) parameters.advancedOverrides.quality = quality as string;
  } catch (error) { }

  try {
    const resolution = execute.getNodeParameter('resolution', itemIndex, undefined);
    if (resolution !== undefined) parameters.advancedOverrides.resolution = resolution as string;
  } catch (error) { }

  try {
    const cache = execute.getNodeParameter('cache', itemIndex, undefined);
    if (cache !== undefined) parameters.advancedOverrides.cache = cache as boolean;
  } catch (error) { }

  try {
    const draft = execute.getNodeParameter('draft', itemIndex, undefined);
    if (draft !== undefined) parameters.advancedOverrides.draft = draft as boolean;
  } catch (error) { }
}

// =============================================================================
// PARAMETER VALIDATION UTILITIES
// =============================================================================

/**
 * Validate that required parameters are present
 * This enforces the UI responsibility principle - all required fields must come from UI
 */
export function validateCollectedParameters(parameters: CollectedParameters): string[] {
  const errors: string[] = [];

  // Action type is always required
  if (!parameters.action) {
    errors.push('Action type is required');
  }

  // Advanced mode validation
  if (parameters.isAdvancedMode) {
    if (!parameters.jsonTemplate) {
      errors.push('JSON template is required in advanced mode');
    } else {
      try {
        JSON.parse(parameters.jsonTemplate);
      } catch (error) {
        errors.push('JSON template must be valid JSON');
      }
    }
  }

  // Basic mode validation - ensure we have some content
  if (!parameters.isAdvancedMode) {
    switch (parameters.action) {
      case 'createMovie':
        if ((!parameters.movieElements || parameters.movieElements.length === 0) &&
          (!parameters.sceneElements || parameters.sceneElements.length === 0)) {
          errors.push('At least one movie element or scene element is required');
        }
        break;

      case 'mergeVideoAudio':
        const hasVideoSrc = parameters.mergeVideoAudio?.videoElement?.src;
        const hasAudioSrc = parameters.mergeVideoAudio?.audioElement?.src;
        if (!hasVideoSrc || !hasAudioSrc) {
          errors.push('Both video and audio sources are required for mergeVideoAudio action');
        }
        break;
        
      case 'mergeVideos':
        if (!parameters.mergeVideos?.videoElements || parameters.mergeVideos.videoElements.length < 2) {
          errors.push('At least 2 video sources are required for mergeVideos action');
        }
        break;
    }
  }

  // recordId and webhookUrl are optional, only type-check if provided
  if (parameters.recordId !== undefined && typeof parameters.recordId !== 'string') {
    errors.push('Invalid type for recordId: must be a string');
  }
  if (parameters.webhookUrl !== undefined && typeof parameters.webhookUrl !== 'string') {
    errors.push('Invalid type for webhookUrl: must be a string');
  }

  return errors;
}

// =============================================================================
// DEBUGGING AND LOGGING UTILITIES
// =============================================================================

export function getSafeParameter<T>(
  execute: IExecuteFunctions,
  paramName: string,
  itemIndex: number,
  defaultValue: T,
  expectedType?: string
): T {
  try {
    const value = execute.getNodeParameter(paramName, itemIndex, defaultValue);
    if (expectedType && typeof value !== expectedType) {
      return defaultValue;
    }
    return value as T;
  } catch (error) {
    return defaultValue;
  }
}

export function sanitizeParametersForLogging(parameters: CollectedParameters): any {
  const sanitized = { ...parameters };
  if (sanitized.jsonTemplate && sanitized.jsonTemplate.length > 200) {
    sanitized.jsonTemplate = sanitized.jsonTemplate.substring(0, 200) + '...[truncated]';
  }
  if (sanitized.webhookUrl) {
    sanitized.webhookUrl = '[WEBHOOK_URL]';
  }
  return sanitized;
}