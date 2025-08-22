// nodes/CreateJ2vMovie/utils/requestBuilder/mergeVideosBuilder.ts

import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { VideoRequestBody, Scene } from './types';
import { SubtitleElementParams, TextElementParams } from '../../operations/shared/elements';
import { processTextElement } from '../textElementProcessor';
import { validateSceneElements } from '../validationUtils';
import { 
  initializeRequestBody,
  addCommonParameters,
  processAllMovieElements,
  processSceneTextElements,
  processOutputSettings,
  finalizeRequestBody
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
    const { processElement } = require('../elementProcessor');

    videoElements.forEach((videoData, index) => {
      const scene: Scene = { elements: [] };

      if (videoData.src && typeof videoData.src === 'string') {
        const videoElement: IDataObject = {
          type: 'video',
          src: videoData.src.trim()
        };

        if (videoData.start !== undefined) {
          const start = Number(videoData.start);
          if (!isNaN(start) && start >= 0) {
            videoElement.start = start;
          }
        }

        if (videoData.duration !== undefined) {
          const duration = Number(videoData.duration);
          if (!isNaN(duration) && (duration === -1 || duration === -2 || duration > 0)) {
            videoElement.duration = duration;
          }
        }

        if (videoData.speed !== undefined) {
          const speed = Number(videoData.speed);
          if (!isNaN(speed) && speed > 0) {
            videoElement.speed = speed;
          }
        }

        if (videoData.volume !== undefined) {
          const volume = Number(videoData.volume);
          if (!isNaN(volume) && volume >= 0 && volume <= 1) {
            videoElement.volume = volume;
          }
        }

        scene.elements.push(videoElement);
      }

      if (index > 0) {
        const transitionStyle = globalTransition !== 'none' ? globalTransition : 'none';
        
        if (transitionStyle !== 'none') {
          scene.transition = { style: transitionStyle };

          const transitionDuration = globalTransitionDuration;
          if (transitionDuration !== undefined) {
            const duration = Number(transitionDuration);
            if (!isNaN(duration) && duration > 0) {
              scene.transition.duration = duration;
            }
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

      const sceneSubtitleElementsCollection = videoData.subtitleElements as IDataObject;
      const sceneSubtitleElements = sceneSubtitleElementsCollection?.subtitleDetails as SubtitleElementParams[];
      if (Array.isArray(sceneSubtitleElements) && sceneSubtitleElements.length > 0) {
        const subtitleAsElements = sceneSubtitleElements.map(s => ({ ...s, type: 'subtitles' }));
        const sceneValidationErrors = validateSceneElements(subtitleAsElements, `Scene ${index + 1}`);
        if (sceneValidationErrors.length > 0) {
          throw new Error(`Scene subtitle validation errors:\n${sceneValidationErrors.join('\n')}`);
        }
      }

      const sceneElementsCollection = videoData.elements as IDataObject;
      const sceneElements = sceneElementsCollection?.elementValues as IDataObject[];
      if (Array.isArray(sceneElements) && sceneElements.length > 0) {
        const sceneValidationErrors = validateSceneElements(sceneElements, `Scene ${index + 1}`);
        if (sceneValidationErrors.length > 0) {
          throw new Error(`Scene element validation errors:\n${sceneValidationErrors.join('\n')}`);
        }

        sceneElements.forEach(element => {
          try {
            if (element.type === 'text') {
              const textParams: TextElementParams = {
                text: (element.text as string) || 'Default Text',
                ...(element.start !== undefined && { start: element.start as number }),
                ...(element.duration !== undefined && { duration: element.duration as number }),
                ...(element.style !== undefined && { style: element.style as string }),
                ...(typeof element.position === 'string' && { position: element.position as any }),
                ...(element['font-family'] !== undefined && { fontFamily: element['font-family'] as string }),
                ...(element['font-size'] !== undefined && { fontSize: element['font-size'] as string }),
                ...(element.color !== undefined && { fontColor: element.color as string }),
              };

              const processedTextElement = processTextElement(textParams);
              scene.elements.push(processedTextElement as unknown as IDataObject);
            } else {
              const processedElement = processElement.call(this, element, requestBody.width, requestBody.height);
              scene.elements.push(processedElement);
            }
          } catch (error) {
            this.logger.warn(`Failed to process scene element: ${error}`);
          }
        });
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
  
  // 3. Process movie-level elements (with subtitles support)
  const allMovieElements = processAllMovieElements.call(this, itemIndex, requestBody, true);
  
  // 4. Process operation-specific content
  const scenes = processMergeVideosScenes.call(this, itemIndex, requestBody);
  
  // 5. Handle output settings
  processOutputSettings.call(this, requestBody, itemIndex);
  
  // 6. Finalize request body
  return finalizeRequestBody(requestBody, scenes, allMovieElements);
}