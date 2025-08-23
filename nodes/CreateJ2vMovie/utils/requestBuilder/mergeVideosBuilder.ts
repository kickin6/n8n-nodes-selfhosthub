// nodes/CreateJ2vMovie/utils/requestBuilder/mergeVideosBuilder.ts

import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { VideoRequestBody, Scene } from './types';
import { SubtitleElementParams, TextElementParams } from '../../operations/shared/elements';
import { validateSceneElements } from '../validationUtils';
import { processElement } from '../elementProcessor';
import { 
  initializeRequestBody,
  addCommonParameters,
  processAllMovieElements,
  processSceneTextElements,
  processOutputSettings,
  finalizeRequestBody,
  processVideoElements
} from './shared';

function processMergeVideosScenes(
  this: IExecuteFunctions,
  itemIndex: number,
  requestBody: VideoRequestBody
): Scene[] {
  const videoElements = this.getNodeParameter('videoElements.videoDetails', itemIndex, []) as IDataObject[];
  const scenes: Scene[] = [];

  const globalTransition = this.getNodeParameter('transition', itemIndex, 'none') as string;
  const globalTransitionDuration = this.getNodeParameter('transitionDuration', itemIndex, 1) as number;

  if (Array.isArray(videoElements) && videoElements.length > 0) {
    videoElements.forEach((videoData, index) => {
      const scene: Scene = { elements: [] };

      if (videoData.src && typeof videoData.src === 'string') {
        try {
          const processedVideos = processVideoElements.call(this, [videoData], requestBody);
          scene.elements.push(...processedVideos);
        } catch (error) {
          this.logger.warn(`Failed to process video element: ${error}`);
          const processedElement = processElement.call(this, videoData, requestBody.width, requestBody.height);
          scene.elements.push(processedElement);
        }
      }

      if (index > 0) {
        const transitionStyle = globalTransition !== 'none' ? globalTransition : 'none';
        
        if (transitionStyle !== 'none') {
          scene.transition = { style: transitionStyle };

          const transitionDuration = Number(globalTransitionDuration);
          if (!isNaN(transitionDuration) && transitionDuration > 0) {
            scene.transition.duration = transitionDuration;
          }
        }
      }

      try {
        const sceneTextElementsCollection = videoData.textElements as IDataObject;
        const sceneTextElements = sceneTextElementsCollection?.textDetails as TextElementParams[];
        if (Array.isArray(sceneTextElements) && sceneTextElements.length > 0) {
          processSceneTextElements.call(this, sceneTextElements, index, scene.elements);
        }
      } catch (error) {
        if (error instanceof Error && error.message.includes('validation errors')) {
          throw error;
        }
      }

      try {
        const sceneSubtitleElementsCollection = videoData.subtitleElements as IDataObject;
        const sceneSubtitleElements = sceneSubtitleElementsCollection?.subtitleDetails as SubtitleElementParams[];
        if (Array.isArray(sceneSubtitleElements) && sceneSubtitleElements.length > 0) {
          const subtitleAsElements = sceneSubtitleElements.map(s => ({ ...s, type: 'subtitles' }));
          const sceneValidationErrors = validateSceneElements(subtitleAsElements, `Scene ${index + 1}`);
          if (sceneValidationErrors.length > 0) {
            throw new Error(`Scene subtitle validation errors:\n${sceneValidationErrors.join('\n')}`);
          }
        }
      } catch (error) {
        if (error instanceof Error && error.message.includes('validation errors')) {
          throw error;
        }
      }

      try {
        const sceneElementsCollection = videoData.elements as IDataObject;
        const sceneElements = sceneElementsCollection?.elementValues as IDataObject[];
        if (Array.isArray(sceneElements) && sceneElements.length > 0) {
          const sceneValidationErrors = validateSceneElements(sceneElements, `Scene ${index + 1}`);
          if (sceneValidationErrors.length > 0) {
            throw new Error(`Scene element validation errors:\n${sceneValidationErrors.join('\n')}`);
          }

          sceneElements.forEach(element => {
            try {
              const processedElement = processElement.call(this, element, requestBody.width, requestBody.height);
              scene.elements.push(processedElement);
            } catch (error) {
              this.logger.warn(`Failed to process scene element: ${error}`);
              const fallbackElement = processElement.call(this, element, requestBody.width, requestBody.height);
              scene.elements.push(fallbackElement);
            }
          });
        }
      } catch (error) {
        if (error instanceof Error && error.message.includes('validation errors')) {
          throw error;
        }
      }

      scenes.push(scene);
    });
  }

  return scenes;
}

export function buildMergeVideosRequestBody(this: IExecuteFunctions, itemIndex = 0): VideoRequestBody {
  // 1. Initialize basic request structure
  const requestBody = initializeRequestBody.call(this, itemIndex);
  
  // 2. Setup common request properties
  addCommonParameters.call(this, requestBody, itemIndex, []);
  
  // 3. Process movie-level elements
  const allMovieElements = processAllMovieElements.call(this, itemIndex, requestBody, true);
  
  // 4. Process operation-specific content
  const scenes = processMergeVideosScenes.call(this, itemIndex, requestBody);
  
  // 5. Handle output settings
  processOutputSettings.call(this, requestBody, itemIndex);
  
  // 6. Finalize request body
  return finalizeRequestBody(requestBody, scenes, allMovieElements);
}