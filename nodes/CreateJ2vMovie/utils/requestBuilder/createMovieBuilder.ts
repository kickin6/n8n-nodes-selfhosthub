// nodes/CreateJ2vMovie/utils/requestBuilder/createMovieBuilder.ts

import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { VideoRequestBody, Scene } from './types';
import { TextElementParams } from '../../operations/shared/elements';
import { validateSceneElements } from '../validationUtils';
import { processElement } from '../elementProcessor';
import { 
  initializeRequestBody,
  addCommonParameters,
  processAllMovieElements,
  processSceneTextElements,
  processOutputSettings,
  finalizeRequestBody,
  processVideoElements,
  processAudioElements,
  processImageElements,
  processVoiceElements
} from './shared';

function processCreateMovieScenes(
  this: IExecuteFunctions,
  itemIndex: number,
  requestBody: VideoRequestBody
): Scene[] {
  const scenes: Scene[] = [];
  
  try {
    const scenesCollection = this.getNodeParameter('scenes.sceneValues', itemIndex, []) as IDataObject[];
    if (Array.isArray(scenesCollection) && scenesCollection.length > 0) {
      scenesCollection.forEach((sceneData, index) => {
        const scene: Scene = { elements: [] };

        if (sceneData.duration !== undefined && sceneData.duration !== -1) {
          const duration = Number(sceneData.duration);
          if (!isNaN(duration) && duration > 0) {
            scene.duration = duration;
          }
        }

        if (sceneData['background-color'] && sceneData['background-color'] !== '#000000') {
          scene['background-color'] = sceneData['background-color'] as string;
        }

        if (sceneData.comment && (sceneData.comment as string).trim() !== '') {
          scene.comment = (sceneData.comment as string).trim();
        }

        if (index > 0 && sceneData.transition_style && sceneData.transition_style !== 'none') {
          scene.transition = { style: sceneData.transition_style as string };

          if (sceneData.transition_duration !== undefined) {
            const transitionDuration = Number(sceneData.transition_duration);
            if (!isNaN(transitionDuration) && transitionDuration > 0) {
              scene.transition.duration = transitionDuration;
            }
          }
        }

        const sceneElements: IDataObject[] = [];

        try {
          const elementsCollection = sceneData.elements as IDataObject;
          const sceneTraditionalElements = elementsCollection?.elementValues as IDataObject[];
          if (Array.isArray(sceneTraditionalElements) && sceneTraditionalElements.length > 0) {
            const sceneValidationErrors = validateSceneElements(sceneTraditionalElements, `Scene ${index + 1}`);
            if (sceneValidationErrors.length > 0) {
              throw new Error(`Scene element validation errors:\n${sceneValidationErrors.join('\n')}`);
            }

            sceneTraditionalElements.forEach(element => {
              try {
                let processedElements: IDataObject[] = [];
                
                switch (element.type) {
                  case 'video':
                    processedElements = processVideoElements.call(this, [element], requestBody);
                    break;
                  case 'audio':
                    processedElements = processAudioElements.call(this, [element], requestBody);
                    break;
                  case 'image':
                    processedElements = processImageElements.call(this, [element], requestBody);
                    break;
                  case 'voice':
                    processedElements = processVoiceElements.call(this, [element], requestBody);
                    break;
                  case 'text':
                  case 'subtitles':
                    processedElements = [processElement.call(this, element, requestBody.width, requestBody.height)];
                    break;
                  default:
                    processedElements = [processElement.call(this, element, requestBody.width, requestBody.height)];
                    break;
                }
                
                sceneElements.push(...processedElements);
              } catch (error) {
                this.logger.warn(`Failed to process scene element: ${error}`);
                const processedElement = processElement.call(this, element, requestBody.width, requestBody.height);
                sceneElements.push(processedElement);
              }
            });
          }
        } catch (error) {
          if (error instanceof Error && error.message.includes('validation errors')) {
            throw error;
          }
        }

        try {
          const sceneTextElementsCollection = sceneData.textElements as IDataObject;
          const sceneTextElements = sceneTextElementsCollection?.textDetails as TextElementParams[];
          if (Array.isArray(sceneTextElements) && sceneTextElements.length > 0) {
            processSceneTextElements.call(this, sceneTextElements, index, sceneElements);
          }
        } catch (error) {
          if (error instanceof Error && error.message.includes('validation errors')) {
            throw error;
          }
        }

        scene.elements = sceneElements;
        scenes.push(scene);
      });
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes('validation errors')) {
      throw error;
    }
  }

  return scenes;
}

export function buildCreateMovieRequestBody(this: IExecuteFunctions, itemIndex = 0): VideoRequestBody {
  // 1. Initialize basic request structure
  const requestBody = initializeRequestBody.call(this, itemIndex);
  
  // 2. Setup common request properties
  addCommonParameters.call(this, requestBody, itemIndex, ['quality', 'cache', 'client-data', 'comment', 'draft']);
  
  // 3. Process movie-level elements
  const allMovieElements = processAllMovieElements.call(this, itemIndex, requestBody, false);
  
  // 4. Process operation-specific content
  const scenes = processCreateMovieScenes.call(this, itemIndex, requestBody);
  
  // 5. Handle output settings
  processOutputSettings.call(this, requestBody, itemIndex);
  
  // 6. Finalize request body
  return finalizeRequestBody(requestBody, scenes, allMovieElements);
}