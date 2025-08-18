import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { VideoRequestBody, Scene } from './types';
import { TextElement, TextElementParams } from '../../operations/shared/elements';
import { processTextElement, validateTextElementParams } from '../textElementProcesor';

/**
 * Builds the request body for the createMovie operation in basic mode
 * Now includes support for text elements at both movie and scene levels
 */
export function buildCreateMovieRequestBody(this: IExecuteFunctions, itemIndex = 0): VideoRequestBody {
	const requestBody: VideoRequestBody = {
		fps: this.getNodeParameter('framerate', itemIndex, 25) as number,
		width: this.getNodeParameter('output_width', itemIndex, 1024) as number,
		height: this.getNodeParameter('output_height', itemIndex, 768) as number,
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

	// Add cache parameter if provided
	const cache = this.getNodeParameter('cache', itemIndex, undefined);
	if (cache !== undefined) requestBody.cache = cache as boolean;

	// Add client-data if provided
	const clientData = this.getNodeParameter('client-data', itemIndex, '{}') as string;
	if (clientData && clientData.trim() !== '{}') {
		try {
			requestBody['client-data'] = JSON.parse(clientData);
		} catch (error) {
			// Intentionally left blank
		}
	}

	// Add comment if provided
	const comment = this.getNodeParameter('comment', itemIndex, '') as string;
	if (comment && comment.trim() !== '') {
		requestBody.comment = comment.trim();
	}

	// Add draft if provided
	const draft = this.getNodeParameter('draft', itemIndex, undefined);
	if (draft !== undefined) requestBody.draft = draft as boolean;

	// Import element processor here to avoid circular dependencies
	const { processElement } = require('../elementProcessor');

	// Process movie-level text elements
	const movieTextElements = this.getNodeParameter('movieTextElements.textDetails', itemIndex, []) as TextElementParams[];
	const processedMovieTextElements: TextElement[] = [];
	const movieTextValidationErrors: string[] = [];

	// Validate and process movie-level text elements
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

	// Throw validation errors if any
	if (movieTextValidationErrors.length > 0) {
		throw new Error(`Movie text element validation errors:\n${movieTextValidationErrors.join('\n')}`);
	}

	// Add movie-level elements (appear across all scenes) - combines traditional elements and text elements
	const movieElements = this.getNodeParameter('movieElements.elementValues', itemIndex, []) as IDataObject[];
	const allMovieElements: IDataObject[] = [];

	// Add traditional movie elements
	if (Array.isArray(movieElements) && movieElements.length > 0) {
		const processedMovieElements = movieElements.map(element =>
			processElement.call(this, element, requestBody.width, requestBody.height)
		);
		allMovieElements.push(...processedMovieElements);
	}

	// Add movie-level text elements
	processedMovieTextElements.forEach(textElement => {
		allMovieElements.push(textElement as unknown as IDataObject);
	});

	// Set movie elements if any exist
	if (allMovieElements.length > 0) {
		requestBody.elements = allMovieElements;
	}

	const scenes: Scene[] = [];

	// Process scenes collection
	try {
		const scenesCollection = this.getNodeParameter('scenes.sceneValues', itemIndex, []) as IDataObject[];
		if (Array.isArray(scenesCollection) && scenesCollection.length > 0) {
			scenesCollection.forEach((sceneData, index) => {
				const scene: Scene = {
					elements: []
				};

				// Add scene-level properties
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

				// Add transition (skip for first scene)
				if (index > 0 && sceneData.transition_style && sceneData.transition_style !== 'none') {
					scene.transition = {
						style: sceneData.transition_style as string
					};

					if (sceneData.transition_duration !== undefined) {
						const transitionDuration = Number(sceneData.transition_duration);
						if (!isNaN(transitionDuration) && transitionDuration > 0) {
							scene.transition.duration = transitionDuration;
						}
					}
				}

				const sceneElements: IDataObject[] = [];

				// Process traditional elements within this scene
				try {
					const elementsCollection = sceneData.elements as IDataObject;
					const sceneTraditionalElements = elementsCollection?.elementValues as IDataObject[];
					if (Array.isArray(sceneTraditionalElements) && sceneTraditionalElements.length > 0) {
						const processedSceneElements = sceneTraditionalElements.map(element =>
							processElement.call(this, element, requestBody.width, requestBody.height)
						);
						sceneElements.push(...processedSceneElements);
					}
				} catch (error) {
					// Continue processing even if traditional elements fail
				}

				// Process text elements within this scene
				try {
					const sceneTextElementsCollection = sceneData.textElements as IDataObject;
					const sceneTextElements = sceneTextElementsCollection?.textDetails as TextElementParams[];
					const processedSceneTextElements: TextElement[] = [];
					const sceneTextValidationErrors: string[] = [];

					// Validate and process scene-level text elements
					if (Array.isArray(sceneTextElements)) {
						sceneTextElements.forEach((textElement, textIndex) => {
							const errors = validateTextElementParams(textElement);
							if (errors.length > 0) {
								sceneTextValidationErrors.push(`Scene ${index + 1} text element ${textIndex + 1}: ${errors.join(', ')}`);
							} else {
								processedSceneTextElements.push(processTextElement(textElement));
							}
						});
					}

					// Throw validation errors if any
					if (sceneTextValidationErrors.length > 0) {
						throw new Error(`Scene text element validation errors:\n${sceneTextValidationErrors.join('\n')}`);
					}

					// Add scene text elements to scene elements
					processedSceneTextElements.forEach(textElement => {
						sceneElements.push(textElement as unknown as IDataObject);
					});

				} catch (error) {
					// Re-throw validation errors, but continue for other errors
					if (error instanceof Error && error.message.includes('validation errors')) {
						throw error;
					}
					// Continue processing even if scene text elements fail
				}

				// Set scene elements
				scene.elements = sceneElements;
				scenes.push(scene);
			});
		}
	} catch (error) {
		// Re-throw validation errors, but continue for other errors
		if (error instanceof Error && error.message.includes('validation errors')) {
			throw error;
		}
		// Continue processing even if scenes collection fails
	}

	// Ensure at least one empty scene exists
	if (scenes.length === 0) {
		scenes.push({ elements: [] });
	}

	requestBody.scenes = scenes;
	return requestBody;
}