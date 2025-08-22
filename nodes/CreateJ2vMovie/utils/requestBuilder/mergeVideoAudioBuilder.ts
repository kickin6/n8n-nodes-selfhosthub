// nodes/CreateJ2vMovie/utils/requestBuilder/mergeVideoAudioBuilder.ts

import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { VideoRequestBody } from './types';
import { TextElement, TextElementParams } from '../../operations/shared/elements';
import { processTextElement, validateTextElementParams } from '../textElementProcessor';
import { validateSceneElements } from '../validationUtils';
import { 
  initializeRequestBody,
  addCommonParameters,
  processAllMovieElements,
  processSceneTextElements,
  processOutputSettings,
  finalizeRequestBody
} from './shared';

function processMergeVideoAudioScenes(
  this: IExecuteFunctions,
  itemIndex: number,
  requestBody: VideoRequestBody
): any[] {
  const elements: IDataObject[] = [];
  const { processElement } = require('../elementProcessor');

  const videoElement = this.getNodeParameter('videoElement', itemIndex, {}) as IDataObject;
  if (videoElement && Object.keys(videoElement).length > 0) {
    try {
      const processedVideo = processElement(videoElement, requestBody.width, requestBody.height);
      if (processedVideo) {
        elements.push(processedVideo);
      }
    } catch (error: any) {
      throw new Error(`Video element processing failed: ${error.message || 'Unknown error'}`);
    }
  }

  const audioElement = this.getNodeParameter('audioElement', itemIndex, {}) as IDataObject;
  if (audioElement && Object.keys(audioElement).length > 0) {
    try {
      const processedAudio = processElement(audioElement, requestBody.width, requestBody.height);
      if (processedAudio) {
        elements.push(processedAudio);
      }
    } catch (error: any) {
      throw new Error(`Audio element processing failed: ${error.message || 'Unknown error'}`);
    }
  }

  const sceneElements: IDataObject[] = [...elements];
  try {
    const sceneTextElements = this.getNodeParameter('sceneTextElements.textDetails', itemIndex, []) as TextElementParams[];
    if (Array.isArray(sceneTextElements) && sceneTextElements.length > 0) {
      processSceneTextElements.call(this, sceneTextElements, 0, sceneElements);
    }
  } catch (error) {
    // Continue if scene text elements parameter doesn't exist
  }

  if (sceneElements.length > 0) {
    const sceneValidationErrors = validateSceneElements(sceneElements);
    if (sceneValidationErrors.length > 0) {
      throw new Error(`Scene element validation errors:\n${sceneValidationErrors.join('\n')}`);
    }
  }

  const textElements = this.getNodeParameter('textElements.textDetails', itemIndex, []) as TextElementParams[];
  const processedTextElements: TextElement[] = [];
  const textValidationErrors: string[] = [];

  if (Array.isArray(textElements)) {
    textElements.forEach((textElement, index) => {
      const errors = validateTextElementParams(textElement);
      if (errors.length > 0) {
        textValidationErrors.push(`Text element ${index + 1}: ${errors.join(', ')}`);
      } else {
        processedTextElements.push(processTextElement(textElement));
      }
    });

    if (textValidationErrors.length > 0) {
      throw new Error(`Text element validation errors:\n${textValidationErrors.join('\n')}`);
    }

    processedTextElements.forEach(textElement => {
      sceneElements.push(textElement as unknown as IDataObject);
    });
  }

  const scene = { elements: sceneElements };
  return [scene];
}

export function buildMergeVideoAudioRequestBody(this: IExecuteFunctions, itemIndex = 0): VideoRequestBody {
  // 1. Initialize basic request structure
  const requestBody = initializeRequestBody.call(this, itemIndex);
  
  // 2. Setup common request properties
  addCommonParameters.call(this, requestBody, itemIndex, []);
  
  // 3. Process movie-level elements
  const allMovieElements = processAllMovieElements.call(this, itemIndex, requestBody, false);
  
  // 4. Process operation-specific content
  const scenes = processMergeVideoAudioScenes.call(this, itemIndex, requestBody);
  
  // 5. Handle output settings
  processOutputSettings.call(this, requestBody, itemIndex);
  
  // 6. Finalize request body
  return finalizeRequestBody(requestBody, scenes, allMovieElements);
}