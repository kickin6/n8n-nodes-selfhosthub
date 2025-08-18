import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { VideoRequestBody, VideoElement, AudioElement } from './types';
import { TextElement, TextElementParams } from '../../operations/shared/elements';
import { processTextElement, validateTextElementParams } from '../textElementProcesor';

/**
 * Builds the request body for the mergeVideoAudio operation in basic mode
 * Now includes support for text elements (subtitles/captions)
 */
export function buildMergeVideoAudioRequestBody(this: IExecuteFunctions, itemIndex = 0): VideoRequestBody {
	const requestBody: VideoRequestBody = {
		scenes: [], // Only required property according to API docs
		fps: 30,
		width: 1024,
		height: 768
	};
	const elements: (VideoElement | AudioElement | IDataObject)[] = [];

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
		const videoElement: VideoElement = {
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

	// Get audio element
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
		const audioElement: AudioElement = {
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

	// Process text elements
	const textElements = this.getNodeParameter('textElements.textDetails', itemIndex, []) as TextElementParams[];
	const processedTextElements: TextElement[] = [];
	const validationErrors: string[] = [];

	// Validate and process text elements
	if (Array.isArray(textElements)) {
		textElements.forEach((textElement, index) => {
			const errors = validateTextElementParams(textElement);
			if (errors.length > 0) {
				validationErrors.push(`Text element ${index + 1}: ${errors.join(', ')}`);
			} else {
				processedTextElements.push(processTextElement(textElement));
			}
		});
	}

	// Throw validation errors if any
	if (validationErrors.length > 0) {
		throw new Error(`Text element validation errors:\n${validationErrors.join('\n')}`);
	}

	// Add text elements to elements array
	processedTextElements.forEach(textElement => {
		elements.push(textElement as unknown as IDataObject);
	});

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
		// No output settings provided
	}

	requestBody.scenes = [{ elements: elements as unknown as IDataObject[] }];
	return requestBody;
}