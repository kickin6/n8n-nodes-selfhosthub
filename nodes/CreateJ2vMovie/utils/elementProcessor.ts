import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { calculatePositionFromPreset, mapPositionPresetToApiFormat } from './positionUtils';

/**
 * Process an element object based on its type and return the API-compatible format
 */
export function processElement(
  this: IExecuteFunctions,
  element: IDataObject,
  videoWidth: number,
  videoHeight: number
): IDataObject {
  const processedElement: IDataObject = {
    type: element.type,
    start: element.start,
    duration: element.duration,
  };

  console.log('DEBUG - Processing element:', JSON.stringify(element, null, 2));

  switch (element.type) {
    case 'image':
      return processImageElement(element, processedElement, videoWidth, videoHeight);
    case 'video':
      return processVideoElement(element, processedElement, videoWidth, videoHeight);
    case 'text':
      return processTextElement(element, processedElement, videoWidth, videoHeight);
    case 'audio':
      return processAudioElement(element, processedElement);
    case 'voice':
      return processVoiceElement(element, processedElement);
    case 'subtitles':
      return processSubtitlesElement(element, processedElement);
    default:
      return processedElement;
  }
}

/**
 * Process image element properties
 */
function processImageElement(
  element: IDataObject,
  processedElement: IDataObject,
  videoWidth: number,
  videoHeight: number
): IDataObject {
  if (element.src && typeof element.src === 'string') {
    processedElement.src = element.src;
  }

  processedElement = applyPositioning(element, processedElement, videoWidth, videoHeight);

  if ((element.width as number) > 0) processedElement.width = element.width;
  if ((element.height as number) > 0) processedElement.height = element.height;
  if ((element.zoom as number) !== 0) processedElement.zoom = element.zoom;

  return processedElement;
}

/**
 * Process video element properties
 */
function processVideoElement(
  element: IDataObject,
  processedElement: IDataObject,
  videoWidth: number,
  videoHeight: number
): IDataObject {
  if (element.src && typeof element.src === 'string') {
    processedElement.src = element.src;
  }

  processedElement = applyPositioning(element, processedElement, videoWidth, videoHeight);

  if ((element.width as number) > 0) processedElement.width = element.width;
  if ((element.height as number) > 0) processedElement.height = element.height;
  if ((element.zoom as number) !== 0) processedElement.zoom = element.zoom;

  if (element.duration !== undefined) {
    const duration = Number(element.duration);
    if (!isNaN(duration)) {
      if (duration > 0) {
        processedElement.duration = duration;
      } else if (duration === -1) {
        processedElement.duration = -1;
      } else if (duration === -2) {
        processedElement.duration = -2;
      }
    }
  }

  if (element.volume !== undefined) processedElement.volume = element.volume;
  if (element.muted !== undefined) processedElement.muted = element.muted;
  if (element.crop !== undefined) processedElement.crop = element.crop;

  return processedElement;
}

/**
 * Process text element properties
 */
function processTextElement(
  element: IDataObject,
  processedElement: IDataObject,
  videoWidth: number,
  videoHeight: number
): IDataObject {
  if (element.text && typeof element.text === 'string') {
    processedElement.text = element.text;
  }

  // Handle positioning
  processedElement = applyPositioning(element, processedElement, videoWidth, videoHeight);

  // Handle text-specific properties
  if (element.fontFamily && typeof element.fontFamily === 'string') {
    processedElement['font-family'] = element.fontFamily;
  }
  if (element.fontSize) processedElement['font-size'] = element.fontSize;
  if (element.color && typeof element.color === 'string') {
    processedElement.color = element.color;
  }

  return processedElement;
}

/**
 * Process audio element properties
 */
function processAudioElement(
  element: IDataObject,
  processedElement: IDataObject
): IDataObject {
  if (element.src && typeof element.src === 'string') {
    processedElement.src = element.src;
  }
  if (element.volume !== undefined) processedElement.volume = element.volume;

  return processedElement;
}

/**
 * Process voice element properties
 */
function processVoiceElement(
  element: IDataObject,
  processedElement: IDataObject
): IDataObject {
  if (element.text && typeof element.text === 'string') {
    processedElement.text = element.text;
  }
  if (element.voice && typeof element.voice === 'string') {
    processedElement.voice = element.voice;
  }

  return processedElement;
}

/**
 * Process subtitles element properties
 */
function processSubtitlesElement(
  element: IDataObject,
  processedElement: IDataObject
): IDataObject {
  if (element.subtitleSourceType === 'text' && element.text && typeof element.text === 'string') {
    processedElement.text = element.text;
  } else if (element.subtitleSourceType === 'src' && element.src && typeof element.src === 'string') {
    processedElement.src = element.src;
  }

  if (element.language && typeof element.language === 'string') {
    processedElement.language = element.language;
  }
  if (element.position && typeof element.position === 'string') {
    processedElement.position = element.position;
  }
  if (element.fontFamily && typeof element.fontFamily === 'string') {
    processedElement['font-family'] = element.fontFamily;
  }
  if (element.fontSize) processedElement['font-size'] = element.fontSize;
  if (element.color && typeof element.color === 'string') {
    processedElement.color = element.color;
  }
  if (element.backgroundColor && typeof element.backgroundColor === 'string') {
    processedElement['background-color'] = element.backgroundColor;
  }
  if (element.style) processedElement.style = element.style;
  if (element.opacity) processedElement.opacity = element.opacity;

  return processedElement;
}

/**
 * Apply positioning logic to visual elements (image, video, text)
 */
function applyPositioning(
  element: IDataObject,
  processedElement: IDataObject,
  videoWidth: number,
  videoHeight: number
): IDataObject {
  if (
    element.positionPreset &&
    typeof element.positionPreset === 'string' &&
    element.positionPreset !== 'custom'
  ) {
    processedElement.position = mapPositionPresetToApiFormat(element.positionPreset as string);
    const position = calculatePositionFromPreset(
      element.positionPreset as string,
      videoWidth,
      videoHeight,
      element.width as number,
      element.height as number
    );
    processedElement.x = position.x;
    processedElement.y = position.y;
  } else {
    processedElement.position = 'custom';
    processedElement.x = element.x;
    processedElement.y = element.y;
  }

  return processedElement;
}