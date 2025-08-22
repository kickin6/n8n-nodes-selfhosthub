// nodes/CreateJ2vMovie/utils/elementProcessor.ts

import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { calculatePositionFromPreset, mapPositionPresetToApiFormat } from './positionUtils';

/**
 * Process an element object based on its type and return the API-compatible format
 * This processor handles simple elements: image, video, audio, voice
 * Text and subtitle elements should use textElementProcessor for proper API compliance
 */
export function processElement(
    this: IExecuteFunctions,
    element: IDataObject,
    videoWidth: number,
    videoHeight: number
): IDataObject {
    const processedElement: IDataObject = {
        type: element.type,
    };

    // Only add start and duration if they are defined and valid
    if (element.start !== undefined) {
        processedElement.start = element.start;
    }

    if (element.duration !== undefined) {
        processedElement.duration = element.duration;
    }

    switch (element.type) {
        case 'image':
            return processImageElement(element, processedElement, videoWidth, videoHeight);
        case 'video':
            return processVideoElement(element, processedElement, videoWidth, videoHeight);
        case 'audio':
            return processAudioElement(element, processedElement);
        case 'voice':
            return processVoiceElement(element, processedElement);
        case 'text':
            throw new Error('Text elements should be processed using textElementProcessor.processTextElement() for proper API compliance with settings object');
        case 'subtitles':
            throw new Error('Subtitle elements should be processed using textElementProcessor.processSubtitleElement() for proper API compliance with settings object');
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

    if (element.opacity !== undefined) {
        processedElement.opacity = element.opacity;
    }

    if (element.scaleWidth !== undefined || element.scaleHeight !== undefined) {
        processedElement.scale = {
            width: element.scaleWidth || 0,
            height: element.scaleHeight || 0
        };
    }

    if (element.rotateAngle !== undefined || element.rotateSpeed !== undefined) {
        processedElement.rotate = {
            angle: element.rotateAngle || 0,
            speed: element.rotateSpeed || 0
        };
    }
    return processedElement;
}

/**
 * Process video element properties with Schema Delta compliance
 */
function processVideoElement(
    element: IDataObject,
    processedElement: IDataObject,
    videoWidth: number,
    videoHeight: number
): IDataObject {
    // Ensure type is preserved
    processedElement.type = 'video';

    if (element.src && typeof element.src === 'string') {
        processedElement.src = element.src;
    }

    processedElement = applyPositioning(element, processedElement, videoWidth, videoHeight);

    if ((element.width as number) > 0) processedElement.width = element.width;
    if ((element.height as number) > 0) processedElement.height = element.height;
    if ((element.zoom as number) !== 0) processedElement.zoom = element.zoom;

    // Enhanced duration handling with proper validation
    if (element.duration !== undefined) {
        const duration = Number(element.duration);
        if (!isNaN(duration)) {
            // Allow positive durations, -1 (full duration), and -2 (full duration)
            if (duration > 0 || duration === -1 || duration === -2) {
                processedElement.duration = duration;
            }
        }
    }

    // SCHEMA DELTA FIX: Add seek property processing
    if (element.seek !== undefined) {
        const seek = Number(element.seek);
        if (!isNaN(seek) && seek >= 0) {
            processedElement.seek = seek;
        }
    }

    // Add video-specific properties with validation
    if (element.volume !== undefined) processedElement.volume = element.volume;
    if (element.muted !== undefined) processedElement.muted = element.muted;

    // SCHEMA DELTA FIX: Process loop as number (not boolean)
    if (element.loop !== undefined) {
        const loop = Number(element.loop);
        if (!isNaN(loop)) {
            processedElement.loop = loop; // 0 = play once, -1 = infinite
        }
    }

    // SCHEMA DELTA FIX: Process fit mode  
    if (element.fit !== undefined) {
        const validFitModes = ['cover', 'contain', 'fill', 'fit'];
        if (validFitModes.includes(element.fit as string)) {
            processedElement.fit = element.fit;
        }
    }

    // Process crop property (valid API property)
    if (element.crop !== undefined) {
        processedElement.crop = element.crop;
    }

    if (element.speed !== undefined) processedElement.speed = element.speed;

    return processedElement;
}

/**
 * Process audio element properties with Schema Delta compliance
 */
function processAudioElement(
    element: IDataObject,
    processedElement: IDataObject
): IDataObject {
    if (element.src && typeof element.src === 'string') {
        processedElement.src = element.src;
    }

    if (element.volume !== undefined) processedElement.volume = element.volume;

    // SCHEMA DELTA FIX: Process loop as number (not boolean)
    if (element.loop !== undefined) {
        const loop = Number(element.loop);
        if (!isNaN(loop)) {
            processedElement.loop = loop; // 0 = play once, -1 = infinite
        }
    }

    // SCHEMA DELTA FIX: Add fade processing
    if (element.fadeIn !== undefined) {
        const fadeIn = Number(element.fadeIn);
        if (!isNaN(fadeIn) && fadeIn >= 0) {
            processedElement['fade-in'] = fadeIn; // Convert to kebab-case
        }
    }

    if (element.fadeOut !== undefined) {
        const fadeOut = Number(element.fadeOut);
        if (!isNaN(fadeOut) && fadeOut >= 0) {
            processedElement['fade-out'] = fadeOut; // Convert to kebab-case
        }
    }

    return processedElement;
}

/**
 * Process voice element properties with Schema Delta compliance
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

    // SCHEMA DELTA FIX: Add rate and pitch processing with validation
    if (element.rate !== undefined) {
        const rate = Number(element.rate);
        if (!isNaN(rate) && rate >= 0.5 && rate <= 2.0) {
            processedElement.rate = rate;
        }
    }

    if (element.pitch !== undefined) {
        const pitch = Number(element.pitch);
        if (!isNaN(pitch) && pitch >= 0.5 && pitch <= 2.0) {
            processedElement.pitch = pitch;
        }
    }

    if (element.volume !== undefined) processedElement.volume = element.volume;

    return processedElement;
}

/**
 * Apply positioning to element based on position preset or coordinates
 */
function applyPositioning(
    element: IDataObject,
    processedElement: IDataObject,
    videoWidth: number,
    videoHeight: number
): IDataObject {
    if (element.position && typeof element.position === 'string') {
        const coords = calculatePositionFromPreset(element.position, videoWidth, videoHeight);
        processedElement.x = coords.x;
        processedElement.y = coords.y;
        processedElement.position = mapPositionPresetToApiFormat(element.position);
    } else {
        if (element.x !== undefined) processedElement.x = element.x;
        if (element.y !== undefined) processedElement.y = element.y;
    }

    return processedElement;
}