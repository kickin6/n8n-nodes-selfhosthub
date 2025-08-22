// nodes/CreateJ2vMovie/utils/requestBuilder/shared.ts

import { SubtitleElementParams, TextElementParams, TextElement } from '@nodes/CreateJ2vMovie/operations/shared/elements';
import { IDataObject, IExecuteFunctions, NodeParameterValue } from 'n8n-workflow';
import { processSubtitleElement, processTextElement, validateTextElementParams, validateSubtitleElementParams } from '../textElementProcessor';
import { validateMovieElements } from '../validationUtils';
import { VideoRequestBody } from './types';

export function getParameterValue(
  this: IExecuteFunctions,
  parameterName: string,
  itemIndex = 0,
  defaultValue: NodeParameterValue = ''
): NodeParameterValue {
  try {
    return this.getNodeParameter(parameterName, itemIndex, defaultValue) as NodeParameterValue;
  } catch (error: any) {
    return defaultValue;
  }
}

export function setupBasicRequest(
  this: IExecuteFunctions,
  itemIndex: number
): { recordId?: string; exports?: any[] } {
  const result: { recordId?: string; exports?: any[] } = {};

  const recordId = this.getNodeParameter('recordId', itemIndex, '') as string;
  if (recordId && recordId.trim() !== '') {
    result.recordId = recordId.trim();
  }

  const webhookUrl = this.getNodeParameter('webhookUrl', itemIndex, '') as string;
  if (webhookUrl && webhookUrl.trim() !== '') {
    result.exports = [{
      destinations: [{
        type: 'webhook',
        endpoint: webhookUrl.trim()
      }]
    }];
  }

  return result;
}

export function initializeRequestBody(
  this: IExecuteFunctions, 
  itemIndex: number
): VideoRequestBody {
  return {
    fps: this.getNodeParameter('framerate', itemIndex, 25) as number,
    width: this.getNodeParameter('output_width', itemIndex, 1024) as number,
    height: this.getNodeParameter('output_height', itemIndex, 768) as number,
    scenes: [],
  };
}

export function addCommonParameters(
  this: IExecuteFunctions,
  requestBody: VideoRequestBody,
  itemIndex: number,
  includeOperationParams: string[] = []
): void {
  const basicSetup = setupBasicRequest.call(this, itemIndex);
  if (basicSetup.recordId) requestBody.id = basicSetup.recordId;
  if (basicSetup.exports) requestBody.exports = basicSetup.exports;

  includeOperationParams.forEach(param => {
    if (param === 'quality') {
      const quality = this.getNodeParameter('quality', itemIndex, '') as string;
      if (quality) requestBody.quality = quality;
    }
    if (param === 'cache') {
      const cache = this.getNodeParameter('cache', itemIndex, undefined);
      if (cache !== undefined) requestBody.cache = cache as boolean;
    }
    if (param === 'client-data') {
      const clientData = this.getNodeParameter('client-data', itemIndex, '{}') as string;
      if (clientData && clientData.trim() !== '{}') {
        try {
          requestBody['client-data'] = JSON.parse(clientData);
        } catch (error) {
          // Skip invalid JSON
        }
      }
    }
    if (param === 'comment') {
      const comment = this.getNodeParameter('comment', itemIndex, '') as string;
      if (comment && comment.trim() !== '') {
        requestBody.comment = comment.trim();
      }
    }
    if (param === 'draft') {
      const draft = this.getNodeParameter('draft', itemIndex, undefined);
      if (draft !== undefined) requestBody.draft = draft as boolean;
    }
  });
}

export function processOutputSettings(
  this: IExecuteFunctions,
  requestBody: VideoRequestBody,
  itemIndex: number
): void {
  try {
    let outputSettings: IDataObject = {};
    try {
      const outputSettingsCollection = this.getNodeParameter('outputSettings', itemIndex, {}) as IDataObject;
      if (outputSettingsCollection && outputSettingsCollection.outputDetails) {
        outputSettings = outputSettingsCollection.outputDetails as IDataObject;
      }
    } catch (e1) {
      try {
        outputSettings = this.getNodeParameter('outputSettings.outputDetails', itemIndex, {}) as IDataObject;
      } catch (e2) {
        const width = this.getNodeParameter('width', itemIndex, undefined);
        const height = this.getNodeParameter('height', itemIndex, undefined);
        const fps = this.getNodeParameter('fps', itemIndex, undefined);
        if (width !== undefined) outputSettings.width = width;
        if (height !== undefined) outputSettings.height = height;
        if (fps !== undefined) outputSettings.fps = fps;
      }
    }

    if (outputSettings.width !== undefined) {
      requestBody.width = Number(outputSettings.width);
    }
    if (outputSettings.height !== undefined) {
      requestBody.height = Number(outputSettings.height);
    }
    if (outputSettings.fps !== undefined) {
      requestBody.fps = Number(outputSettings.fps);
    }
    if (outputSettings.quality !== undefined) {
      requestBody.quality = outputSettings.quality as string;
    }
  } catch (error) {
    this.logger.warn(`Failed to process output settings: ${error}`);
  }
}

export function processMovieSubtitleElements(
  this: IExecuteFunctions,
  itemIndex: number
): IDataObject[] {
  const movieSubtitleElements = this.getNodeParameter('movieElements.subtitleDetails', itemIndex, []) as SubtitleElementParams[];
  const processedMovieSubtitleElements: IDataObject[] = [];
  const movieSubtitleValidationErrors: string[] = [];

  if (Array.isArray(movieSubtitleElements)) {
    movieSubtitleElements.forEach((subtitleElement, index) => {
      const errors = validateSubtitleElementParams(subtitleElement);
      if (errors.length > 0) {
        movieSubtitleValidationErrors.push(`Movie subtitle element ${index + 1}: ${errors.join(', ')}`);
      } else {
        const subtitleParams = subtitleElement.captions?.startsWith('http')
          ? {
            src: subtitleElement.captions,
            language: subtitleElement.language || 'en',
            model: subtitleElement.model || 'default',
            ...(subtitleElement.start !== undefined && { start: subtitleElement.start }),
            ...(subtitleElement.duration !== undefined && { duration: subtitleElement.duration }),
          }
          : {
            text: subtitleElement.captions || '',
            language: subtitleElement.language || 'en',
            model: subtitleElement.model || 'default',
            ...(subtitleElement.start !== undefined && { start: subtitleElement.start }),
            ...(subtitleElement.duration !== undefined && { duration: subtitleElement.duration }),
          };

        const processedSubtitle = processSubtitleElement(subtitleParams);
        processedMovieSubtitleElements.push(processedSubtitle as unknown as IDataObject);
      }
    });
  }

  if (movieSubtitleValidationErrors.length > 0) {
    throw new Error(`Movie subtitle element validation errors:\n${movieSubtitleValidationErrors.join('\n')}`);
  }

  return processedMovieSubtitleElements;
}

export function processAllMovieElements(
  this: IExecuteFunctions,
  itemIndex: number,
  requestBody: VideoRequestBody,
  includeSubtitles: boolean = false
): IDataObject[] {
  const allMovieElements: IDataObject[] = [];
  
  const movieTextElements = processMovieTextElements.call(this, itemIndex);
  allMovieElements.push(...movieTextElements);
  
  if (includeSubtitles) {
    const movieSubtitleElements = processMovieSubtitleElements.call(this, itemIndex);
    allMovieElements.push(...movieSubtitleElements);
  }
  
  const movieElements = this.getNodeParameter('movieElements.elementValues', itemIndex, []) as IDataObject[];
  if (Array.isArray(movieElements) && movieElements.length > 0) {
    const movieValidationErrors = validateMovieElements(movieElements);
    if (movieValidationErrors.length > 0) {
      throw new Error(`Movie element validation errors:\n${movieValidationErrors.join('\n')}`);
    }
    processMovieElements.call(this, movieElements, requestBody, allMovieElements);
  }
  
  return allMovieElements;
}

export function processMovieTextElements(
  this: IExecuteFunctions,
  itemIndex: number
): IDataObject[] {
  const movieTextElements = this.getNodeParameter('movieTextElements.textDetails', itemIndex, []) as TextElementParams[];
  const processedMovieTextElements: TextElement[] = [];
  const movieTextValidationErrors: string[] = [];

  if (Array.isArray(movieTextElements)) {
    movieTextElements.forEach((textElement, index) => {
      const errors = validateTextElementParams(textElement);
      if (errors.length > 0) {
        movieTextValidationErrors.push(`Movie text element ${index + 1}: ${errors.join(', ')}`);
      } else {
        processedMovieTextElements.push(processTextElement(textElement));
      }
    });
  }

  if (movieTextValidationErrors.length > 0) {
    throw new Error(`Movie text element validation errors:\n${movieTextValidationErrors.join('\n')}`);
  }

  return processedMovieTextElements.map(textElement => textElement as unknown as IDataObject);
}

export function processSceneTextElements(
  this: IExecuteFunctions,
  sceneTextElements: TextElementParams[],
  sceneIndex: number,
  sceneElements: IDataObject[]
): void {
  if (!Array.isArray(sceneTextElements) || sceneTextElements.length === 0) {
    return;
  }

  const processedSceneTextElements: TextElement[] = [];
  const sceneTextValidationErrors: string[] = [];

  sceneTextElements.forEach((textElement, textIndex) => {
    const errors = validateTextElementParams(textElement);
    if (errors.length > 0) {
      sceneTextValidationErrors.push(`Scene ${sceneIndex + 1} text element ${textIndex + 1}: ${errors.join(', ')}`);
    } else {
      processedSceneTextElements.push(processTextElement(textElement));
    }
  });

  if (sceneTextValidationErrors.length > 0) {
    throw new Error(`Scene text element validation errors:\n${sceneTextValidationErrors.join('\n')}`);
  }

  processedSceneTextElements.forEach(textElement => {
    sceneElements.push(textElement as unknown as IDataObject);
  });
}

export function processMovieElements(
  this: IExecuteFunctions,
  movieElements: IDataObject[],
  requestBody: { width: number; height: number },
  allMovieElements: IDataObject[]
): void {
  const { processElement } = require('../elementProcessor');

  if (Array.isArray(movieElements) && movieElements.length > 0) {
    movieElements.forEach(element => {
      try {
        if (element.type === 'text') {
          const textParams: TextElementParams = {
            text: element.text as string || 'Default Text',
            ...(element.start !== undefined && { start: element.start }),
            ...(element.duration !== undefined && { duration: element.duration }),
            ...(element.style !== undefined && { style: element.style }),
            ...(typeof element.position === 'string' && { position: element.position }),
            ...(element['font-family'] !== undefined && { fontFamily: element['font-family'] }),
            ...(element['font-size'] !== undefined && { fontSize: element['font-size'] }),
            ...(element.color !== undefined && { fontColor: element.color }),
          } as TextElementParams;

          const processedTextElement = processTextElement(textParams);
          allMovieElements.push(processedTextElement as unknown as IDataObject);
        } else if (element.type === 'subtitles') {
          const subtitleParams: SubtitleElementParams = {
            captions: element.captions as string,
            language: element.language as string || 'en',
            model: element.model as string || 'default',
            ...(element.start !== undefined && { start: element.start }),
            ...(element.duration !== undefined && { duration: element.duration }),
          } as SubtitleElementParams;

          const processedSubtitleElement = processSubtitleElement(subtitleParams);
          allMovieElements.push(processedSubtitleElement as unknown as IDataObject);
        } else {
          const processedElement = processElement.call(this, element, requestBody.width, requestBody.height);
          allMovieElements.push(processedElement);
        }
      } catch (error) {
        this.logger.warn(`Failed to process movie element: ${error}`);
      }
    });
  }
}

export function finalizeRequestBody(
  requestBody: VideoRequestBody,
  scenes: any[],
  allMovieElements: IDataObject[]
): VideoRequestBody {
  requestBody.scenes = scenes.length > 0 ? scenes : [{ elements: [] }];
  
  if (allMovieElements.length > 0) {
    requestBody.elements = allMovieElements;
  }
  
  return requestBody;
}