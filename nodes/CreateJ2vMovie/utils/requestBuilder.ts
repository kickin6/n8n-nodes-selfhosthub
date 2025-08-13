import { IDataObject, IExecuteFunctions, NodeParameterValue } from 'n8n-workflow';
import { buildWebhookObject } from './webhookUtils';

/**
 * Helper function to retrieve a parameter value for a given operation and mode
 */
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

/**
 * Apply advanced mode overrides to a parsed JSON template
 */
function applyAdvancedModeOverrides(
  this: IExecuteFunctions,
  parsedTemplate: IDataObject,
  operation: string,
  itemIndex: number
): IDataObject {
  const result = { ...parsedTemplate };

  const recordId = this.getNodeParameter('recordId', itemIndex, '') as string;
  const outputWidth = this.getNodeParameter('outputWidth', itemIndex, null) as number | null;
  const outputHeight = this.getNodeParameter('outputHeight', itemIndex, null) as number | null;
  const framerate = this.getNodeParameter('framerate', itemIndex, null) as number | null;
  const webhookUrl = this.getNodeParameter('webhookUrl', itemIndex, '') as string;

  if (recordId) result.id = recordId;
  if (outputWidth) result.width = outputWidth;
  if (outputHeight) result.height = outputHeight;
  if (framerate) result.fps = framerate;

  const webhook = buildWebhookObject(webhookUrl);
  if (webhook) {
    result.webhook = webhook;
  }

  try {
    const quality = this.getNodeParameter('quality', itemIndex, null) as string | null;
    if (quality) result.quality = quality;
  } catch (e) {}

  try {
    const cache = this.getNodeParameter('cache', itemIndex, null) as boolean | null;
    if (cache !== null) result.cache = cache;
  } catch (e) {}

  try {
    const draft = this.getNodeParameter('draft', itemIndex, null) as boolean | null;
    if (draft !== null) result.draft = draft;
  } catch (e) {}

  try {
    const resolution = this.getNodeParameter('resolution', itemIndex, null) as string | null;
    if (resolution) result.resolution = resolution;
  } catch (e) {}

  return result;
}

/**
 * Builds a JSON2Video request body based on provided parameters
 */
export function buildRequestBody(
  this: IExecuteFunctions,
  operation: string,
  itemIndex = 0,
  isAdvancedMode = false
): IDataObject {
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
      return {};
    default:
      throw new Error(`Unsupported operation: ${operation}`);
  }
}

/**
 * Builds the request body for the createMovie operation in basic mode
 */
function buildCreateMovieRequestBody(this: IExecuteFunctions, itemIndex = 0): IDataObject {  
  const requestBody: IDataObject = {
    fps: this.getNodeParameter('framerate', itemIndex, 25),
    width: this.getNodeParameter('output_width', itemIndex, 1024),
    height: this.getNodeParameter('output_height', itemIndex, 768),
    scenes: [], // Only required property according to API docs
  };

  // Add record ID if provided (optional)
  const recordId = this.getNodeParameter('recordId', itemIndex, '') as string;
  if (recordId && recordId.trim() !== '') {
    requestBody.id = recordId.trim();
  }

  // Add webhook in exports format if webhook URL is provided
  const webhookUrl = this.getNodeParameter('webhookUrl', itemIndex, '') as string;
  if (webhookUrl && webhookUrl.trim() !== '') {
    requestBody.exports = [{
      destinations: [{
        type: 'webhook',
        endpoint: webhookUrl.trim()
      }]
    }];
  }

  // Add quality parameter if provided
  const quality = this.getNodeParameter('quality', itemIndex, '') as string;
  if (quality) {
    requestBody.quality = quality;
  }

  try {
    const cache = this.getNodeParameter('cache', itemIndex, undefined);
    if (cache !== undefined) requestBody.cache = cache;
  } catch (error) {
    this.logger.debug('Cache parameter not available');
  }

  try {
    const draft = this.getNodeParameter('draft', itemIndex, undefined);
    if (draft !== undefined) requestBody.draft = draft;
  } catch (error) {
    this.logger.debug('Draft parameter not available');
  }

  // Import element processor here to avoid circular dependencies
  const { processElement } = require('./elementProcessor');

  try {
    const movieElements = this.getNodeParameter('movieElements.elementValues', itemIndex, []) as IDataObject[];
    if (Array.isArray(movieElements) && movieElements.length > 0) {
      requestBody.elements = movieElements.map(element =>
        processElement.call(this, element, requestBody.width as number, requestBody.height as number)
      );
    }
  } catch (error) {
    this.logger.debug('Movie elements collection not available or empty');
  }

  const scenes: Array<{ elements: IDataObject[] }> = [];
  try {
    const sceneElements = this.getNodeParameter('elements.elementValues', itemIndex, []) as IDataObject[];
    if (Array.isArray(sceneElements) && sceneElements.length > 0) {
      const scene = {
        elements: sceneElements.map(element =>
          processElement.call(this, element, requestBody.width as number, requestBody.height as number)
        ),
      };
      scenes.push(scene);
    }
  } catch (error) {
    this.logger.debug('Scene elements collection not available or empty');
  }

  requestBody.scenes = scenes;
  return requestBody;
}

/**
 * Builds the request body for the mergeVideoAudio operation in basic mode
 */
function buildMergeVideoAudioRequestBody(this: IExecuteFunctions, itemIndex = 0): IDataObject {  
  const requestBody: IDataObject = {
    scenes: [], // Only required property according to API docs
  };
  const elements: IDataObject[] = [];

  // Add record ID if provided (optional)
  const recordId = this.getNodeParameter('recordId', itemIndex, '') as string;
  if (recordId && recordId.trim() !== '') {
    requestBody.id = recordId.trim();
  }

  // Add webhook in exports format if webhook URL is provided
  const webhookUrl = this.getNodeParameter('webhookUrl', itemIndex, '') as string;
  if (webhookUrl && webhookUrl.trim() !== '') {
    requestBody.exports = [{
      destinations: [{
        type: 'webhook',
        endpoint: webhookUrl.trim()
      }]
    }];
  }

  // Get video element
  try {
    let videoDetails: IDataObject = {};
    try {
      const videoElementCollection = this.getNodeParameter('videoElement', itemIndex, {}) as IDataObject;
      if (videoElementCollection && videoElementCollection.videoDetails) {
        videoDetails = videoElementCollection.videoDetails as IDataObject;
      }
    } catch (e1) {
      try {
        videoDetails = this.getNodeParameter('videoElement.videoDetails', itemIndex, {}) as IDataObject;
      } catch (e2) {
        const src = this.getNodeParameter('video', itemIndex, '') as string;
        if (src) videoDetails = { src };
      }
    }

    if (videoDetails && videoDetails.src) {
      const videoElement: IDataObject = {
        type: 'video',
        src: String(videoDetails.src).trim(),
      };

      if (videoDetails.duration !== undefined && videoDetails.duration !== -2 && videoDetails.duration !== -1) {
        const duration = Number(videoDetails.duration);
        if (!isNaN(duration) && duration > 0) {
          videoElement.duration = duration;
        }
      } else if (videoDetails.duration === -1) {
        // Use -1 for full video duration
        videoElement.duration = -1;
      } else if (videoDetails.duration === -2) {
        // Use -2 for full video duration  
        videoElement.duration = -2;
      }
      if (videoDetails.volume !== undefined) {
        videoElement.volume = Number(videoDetails.volume);
      }
      if (videoDetails.muted !== undefined) {
        videoElement.muted = Boolean(videoDetails.muted);
      }
      if (videoDetails.loop !== undefined) {
        videoElement.loop = videoDetails.loop ? -1 : 1;
      }
      if (videoDetails.crop !== undefined) {
        if (Boolean(videoDetails.crop)) {
          videoElement.resize = 'cover';
        } else {
          videoElement.resize = 'contain';
        }
      }
      if (videoDetails.fit !== undefined && typeof videoDetails.fit === 'string') {
        videoElement.resize = String(videoDetails.fit);
      }

      elements.push(videoElement);
    }
  } catch (error) {
  }

  // Get audio element
  try {
    let audioDetails: IDataObject = {};
    try {
      const audioElementCollection = this.getNodeParameter('audioElement', itemIndex, {}) as IDataObject;
      if (audioElementCollection && audioElementCollection.audioDetails) {
        audioDetails = audioElementCollection.audioDetails as IDataObject;
      }
    } catch (e1) {
      try {
        audioDetails = this.getNodeParameter('audioElement.audioDetails', itemIndex, {}) as IDataObject;
      } catch (e2) {
        const src = this.getNodeParameter('audio', itemIndex, '') as string;
        if (src) audioDetails = { src };
      }
    }

    if (audioDetails && audioDetails.src) {
      const audioElement: IDataObject = {
        type: 'audio',
        src: String(audioDetails.src).trim(),
      };

      if (audioDetails.start !== undefined && audioDetails.start !== 0) {
        audioElement.start = Number(audioDetails.start);
      }
      if (audioDetails.duration !== undefined && audioDetails.duration !== -1 && audioDetails.duration !== -2) {
        const duration = Number(audioDetails.duration);
        if (!isNaN(duration) && duration > 0) {
          audioElement.duration = duration;
        }
      } else if (audioDetails.duration === -1) {
        // Use -1 for full audio duration
        audioElement.duration = -1;
      } else if (audioDetails.duration === -2) {
        // Use -2 for full audio duration
        audioElement.duration = -2;
      }
      if (audioDetails.volume !== undefined) {
        audioElement.volume = Number(audioDetails.volume);
      }
      if (audioDetails.loop !== undefined) {
        audioElement.loop = audioDetails.loop ? -1 : 1;
      }

      elements.push(audioElement);
    }
  } catch (error) {
  }

  // Get output settings
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
        const width = this.getNodeParameter('width', itemIndex, 1024) as number;
        const height = this.getNodeParameter('height', itemIndex, 768) as number;
        const fps = this.getNodeParameter('fps', itemIndex, 30) as number;
        outputSettings = { width, height, fps };
      }
    }

    if (outputSettings) {
      if (outputSettings.width !== undefined) requestBody.width = Number(outputSettings.width);
      if (outputSettings.height !== undefined) requestBody.height = Number(outputSettings.height);
      if (outputSettings.fps !== undefined) requestBody.fps = Number(outputSettings.fps);
      if (outputSettings.quality !== undefined && typeof outputSettings.quality === 'string') {
        requestBody.quality = String(outputSettings.quality);
      }
    }
  } catch (error) {
  }

  if (requestBody.width === undefined) requestBody.width = 1024;
  if (requestBody.height === undefined) requestBody.height = 768;
  if (requestBody.fps === undefined) requestBody.fps = 30;

  requestBody.scenes = [{ elements: elements }];
  return requestBody;
}

/**
 * Builds the request body for the mergeVideos operation in basic mode
 */
function buildMergeVideosRequestBody(this: IExecuteFunctions, itemIndex = 0): IDataObject {  
  const requestBody: IDataObject = {
    scenes: [], // Only required property according to API docs
  };
  const scenes: Array<{ elements: IDataObject[]; transition?: IDataObject }> = [];

  // Add record ID if provided (optional)
  const recordId = this.getNodeParameter('recordId', itemIndex, '') as string;
  if (recordId && recordId.trim() !== '') {
    requestBody.id = recordId.trim();
  }

  // Add webhook in exports format if webhook URL is provided  
  const webhookUrl = this.getNodeParameter('webhookUrl', itemIndex, '') as string;
  if (webhookUrl && webhookUrl.trim() !== '') {
    requestBody.exports = [{
      destinations: [{
        type: 'webhook',
        endpoint: webhookUrl.trim()
      }]
    }];
  }

  // Get transition settings
  let transitionConfig: IDataObject | undefined;
  try {
    const transition = this.getNodeParameter('transition', itemIndex, 'none') as string;
    if (transition && transition !== 'none') {
      transitionConfig = {
        style: transition
      };
      const transitionDuration = this.getNodeParameter('transitionDuration', itemIndex, 1) as number;
      if (transitionDuration > 0) {
        transitionConfig.duration = transitionDuration;
      }
    }
  } catch (error) {
    this.logger.debug('Error accessing transition settings');
  }

  // Process video elements - each video becomes a separate scene
  try {
    const videoElements = this.getNodeParameter('videoElements.videoDetails', itemIndex, []) as IDataObject[];

    if (Array.isArray(videoElements) && videoElements.length > 0) {
      videoElements.forEach((videoElement, index) => {
        if (videoElement.src) {
          const videoConfig: IDataObject = {
            type: 'video',
            src: videoElement.src,
          };

          // Set start time (usually 0 for scene-based videos)
          if (videoElement.start !== undefined) {
            videoConfig.start = videoElement.start;
          } else {
            videoConfig.start = 0;
          }

          // Set duration - use the exact value provided, don't convert -1 to -2
          const videoDuration = videoElement.duration;
          if (videoDuration !== undefined && videoDuration !== null) {
            const duration = Number(videoDuration);
            if (!isNaN(duration)) {
              if (duration > 0) {
                // Explicit positive duration
                videoConfig.duration = duration;
              } else if (duration === -1) {
                // Use -1 for full video duration (don't convert to -2)
                videoConfig.duration = -1;
              } else if (duration === -2) {
                // Also support -2 if explicitly set
                videoConfig.duration = -2;
              } else {
                // Invalid duration, skip setting it to let API use default
                this.logger.debug(`Invalid duration ${duration} for video ${videoElement.src}, letting API determine duration`);
              }
            }
          }
          // If no duration is set, don't include duration property - let the API determine it

          if (videoElement.speed !== undefined) videoConfig.speed = videoElement.speed;
          if (videoElement.volume !== undefined) videoConfig.volume = videoElement.volume;

          // Create a scene for this video
          const scene: { elements: IDataObject[]; transition?: IDataObject } = {
            elements: [videoConfig]
          };

          // Add transition to all scenes except the first one
          if (index > 0 && transitionConfig) {
            scene.transition = transitionConfig;
          }

          scenes.push(scene);
        }
      });
    } else {
      this.logger.debug('No video elements found or empty array');
      // Create at least one empty scene
      scenes.push({ elements: [] });
    }
  } catch (error) {
    this.logger.debug('Error accessing video elements collection');
    // Create at least one empty scene
    scenes.push({ elements: [] });
  }

  // Set output settings
  try {
    const outputSettings = this.getNodeParameter('outputSettings.outputDetails', itemIndex, {}) as IDataObject;
    if (outputSettings) {
      if (outputSettings.width !== undefined) requestBody.width = outputSettings.width;
      if (outputSettings.height !== undefined) requestBody.height = outputSettings.height;
      if (outputSettings.fps !== undefined) requestBody.fps = outputSettings.fps;
      if (outputSettings.quality !== undefined) requestBody.quality = outputSettings.quality;
    }
  } catch (error) {
    this.logger.debug('No output settings found or error accessing output settings properties');
  }

  // Set defaults
  if (requestBody.width === undefined) requestBody.width = 1024;
  if (requestBody.height === undefined) requestBody.height = 768;
  if (requestBody.fps === undefined) requestBody.fps = 30;

  requestBody.scenes = scenes;
  return requestBody;
}