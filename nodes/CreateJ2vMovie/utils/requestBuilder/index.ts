// nodes/CreateJ2vMovie/utils/requestBuilder/index.ts

import { IExecuteFunctions } from 'n8n-workflow';
import { buildCreateMovieRequestBody } from './createMovieBuilder';
import { buildMergeVideoAudioRequestBody } from './mergeVideoAudioBuilder';
import { buildMergeVideosRequestBody } from './mergeVideosBuilder';
import { applyAdvancedModeOverrides } from './advanced';
import { VideoRequestBody } from './types';

/**
 * Builds a JSON2Video request body based on provided parameters
 */
export function buildRequestBody(
  this: IExecuteFunctions,
  operation: string,
  itemIndex = 0,
  isAdvancedMode = false
): VideoRequestBody {
  if (isAdvancedMode) {
    const paramName =
      operation === 'createMovie'
        ? 'jsonTemplate'
        : operation === 'mergeVideoAudio'
          ? 'jsonTemplateMergeAudio'
          : 'jsonTemplateMergeVideos';

    const jsonTemplate = this.getNodeParameter(paramName, itemIndex, '{}') as string;

    try {
      const parsedTemplate = JSON.parse(jsonTemplate);
      const result = applyAdvancedModeOverrides.call(this, parsedTemplate, operation, itemIndex);
      return result;
    } catch (error: any) {
      throw new Error(`Invalid JSON template: ${error.message || 'Unknown parsing error'}`);
    }
  }

  // Only call basic mode functions when NOT in advanced mode
  switch (operation) {
    case 'createMovie':
      return buildCreateMovieRequestBody.call(this, itemIndex);
    case 'mergeVideoAudio':
      return buildMergeVideoAudioRequestBody.call(this, itemIndex);
    case 'mergeVideos':
      return buildMergeVideosRequestBody.call(this, itemIndex);
    case 'checkStatus':
      return {} as VideoRequestBody;
    default:
      throw new Error(`Unsupported operation: ${operation}`);
  }
}

// Re-export individual builders for direct use in tests
export { buildCreateMovieRequestBody } from './createMovieBuilder';
export { buildMergeVideoAudioRequestBody } from './mergeVideoAudioBuilder';
export { buildMergeVideosRequestBody } from './mergeVideosBuilder';
export { getParameterValue } from './shared';
export * from './types';