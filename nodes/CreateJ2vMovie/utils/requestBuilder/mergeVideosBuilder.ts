import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { VideoRequestBody, Scene, VideoElement } from './types';
import { TextElement, TextElementParams } from '../../operations/shared/elements';
import { processTextElement, validateTextElementParams } from '../textElementProcesor';

/**
 * Builds the request body for the mergeVideos operation in basic mode
 * Now includes support for text elements (subtitles/captions)
 */
export function buildMergeVideosRequestBody(this: IExecuteFunctions, itemIndex = 0): VideoRequestBody {
	const requestBody: VideoRequestBody = {
		scenes: [],
		fps: 30,
		width: 1024,
		height: 768
	};
	const scenes: Scene[] = [];

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
	const transition = this.getNodeParameter('transition', itemIndex, 'none') as string;
	let transitionConfig: { style: string; duration?: number } | undefined;
	if (transition && transition !== 'none') {
		transitionConfig = {
			style: transition
		};
		const transitionDuration = this.getNodeParameter('transitionDuration', itemIndex, 1) as number;
		if (transitionDuration > 0) {
			transitionConfig.duration = transitionDuration;
		}
	}

	// Process video elements - each video becomes a separate scene
	const videoElements = this.getNodeParameter('videoElements.videoDetails', itemIndex, []) as IDataObject[];
	
	// Handle case where videoElements is not an array - return empty scenes gracefully
	if (!Array.isArray(videoElements)) {
		requestBody.scenes = scenes;
		return requestBody;
	}
	
	// Don't throw error for empty arrays - let the function complete and return empty scenes
	// This allows the function to work in all contexts (initialization, default, etc.)
	// The validation can be handled at a higher level if needed
	if (videoElements.length === 0) {
		requestBody.scenes = scenes;
		return requestBody;
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

	videoElements.forEach((videoElement: IDataObject, index: number) => {
		if (videoElement.src) {
			const videoConfig: VideoElement = {
				type: 'video',
				src: videoElement.src as string,
			};

			// Set start time (usually 0 for scene-based videos)
			if (videoElement.start !== undefined) {
				videoConfig.start = videoElement.start as number;
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
					}
				}
			}

			if (videoElement.speed !== undefined) videoConfig.speed = videoElement.speed as number;
			if (videoElement.volume !== undefined) videoConfig.volume = videoElement.volume as number;

			// Create scene elements array starting with the video
			const sceneElements: IDataObject[] = [videoConfig as unknown as IDataObject];

			// Add text elements that should appear in this scene
			// For mergeVideos, we add text elements to all scenes, but users can control timing via start/duration
			processedTextElements.forEach(textElement => {
				sceneElements.push(textElement as unknown as IDataObject);
			});

			// Create a scene for this video with its text elements
			const scene: Scene = {
				elements: sceneElements
			};

			// Add transition to all scenes except the first one
			if (index > 0 && transitionConfig) {
				scene.transition = transitionConfig;
			}

			scenes.push(scene);
		}
	});

	// Set output settings
	const outputSettings = this.getNodeParameter('outputSettings.outputDetails', itemIndex, {}) as IDataObject;
	if (outputSettings) {
		if (outputSettings.width !== undefined) requestBody.width = outputSettings.width as number;
		if (outputSettings.height !== undefined) requestBody.height = outputSettings.height as number;
		if (outputSettings.fps !== undefined) requestBody.fps = outputSettings.fps as number;
		if (outputSettings.quality !== undefined) requestBody.quality = outputSettings.quality as string;
	}

	requestBody.scenes = scenes;
	return requestBody;
}

/**
 * Helper function to create a subtitle-focused text element with common defaults
 * This can be used for quick subtitle creation
 */
export function createSubtitleElement(
	text: string,
	startTime: number,
	duration: number,
	options: Partial<TextElementParams> = {}
): TextElement {
	const defaultParams: TextElementParams = {
		text,
		start: startTime,
		duration,
		style: '001',
		fontFamily: 'Roboto',
		fontSize: '32px',
		fontWeight: '600',
		fontColor: '#FFFFFF',
		backgroundColor: 'rgba(0, 0, 0, 0.7)',
		textAlign: 'center',
		verticalPosition: 'bottom',
		horizontalPosition: 'center',
		position: 'bottom-left',
		x: 50,
		y: 50,
		fadeIn: 0.3,
		fadeOut: 0.3,
		zIndex: 10, // Ensure subtitles appear above video
		...options
	};

	return processTextElement(defaultParams);
}

/**
 * Helper function to validate that at least one video element exists
 * This maintains the existing validation expectations
 */
export function validateMergeVideosElements(videoElements: IDataObject[]): void {
	if (!Array.isArray(videoElements) || videoElements.length === 0) {
		throw new Error('At least one video element is required for merging videos');
	}

	// Validate that each video has a source
	videoElements.forEach((video, index) => {
		if (!video.src || typeof video.src !== 'string' || video.src.trim() === '') {
			throw new Error(`Video element ${index + 1}: Source URL is required`);
		}
	});
}