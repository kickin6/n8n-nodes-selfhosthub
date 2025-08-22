// __tests__/nodes/CreateJ2vMovie/utils/requestBuilder/mergeVideos/mergeVideosBuilder.movieElements.test.ts

// __tests__/nodes/CreateJ2vMovie/utils/requestBuilder/mergeVideosBuilder.movieElements.test.ts

import { buildMergeVideosRequestBody } from '@nodes/CreateJ2vMovie/utils/requestBuilder/mergeVideosBuilder';
import { processTextElement, processSubtitleElement } from '@nodes/CreateJ2vMovie/utils/textElementProcessor';

// Mock the textElementProcessor functions
jest.mock('@nodes/CreateJ2vMovie/utils/textElementProcessor', () => ({
	processTextElement: jest.fn(),
	processSubtitleElement: jest.fn(),
	validateTextElementParams: jest.fn(),
	validateSubtitleElementParams: jest.fn(),
}));

// Mock the validationUtils
jest.mock('@nodes/CreateJ2vMovie/utils/validationUtils', () => ({
	validateSceneElements: jest.fn(),
	validateMovieElements: jest.fn(),
}));

// Mock the elementProcessor
jest.mock('@nodes/CreateJ2vMovie/utils/elementProcessor', () => ({
	processElement: jest.fn(),
}));

describe('mergeVideosBuilder - Movie-Level Elements', () => {
	let mockExecute: any;
	let mockValidateTextElementParams: jest.Mock;
	let mockValidateSubtitleElementParams: jest.Mock;
	let mockValidateSceneElements: jest.Mock;
	let mockValidateMovieElements: jest.Mock;
	let mockProcessElement: jest.Mock;

	beforeEach(() => {
		jest.clearAllMocks();

		// Get mock references
		mockValidateTextElementParams = require('@nodes/CreateJ2vMovie/utils/textElementProcessor').validateTextElementParams;
		mockValidateSubtitleElementParams = require('@nodes/CreateJ2vMovie/utils/textElementProcessor').validateSubtitleElementParams;
		mockValidateSceneElements = require('@nodes/CreateJ2vMovie/utils/validationUtils').validateSceneElements;
		mockValidateMovieElements = require('@nodes/CreateJ2vMovie/utils/validationUtils').validateMovieElements;
		mockProcessElement = require('@nodes/CreateJ2vMovie/utils/elementProcessor').processElement;

		// Set default mock implementations
		mockValidateTextElementParams.mockReturnValue([]);
		mockValidateSubtitleElementParams.mockReturnValue([]);
		mockValidateSceneElements.mockReturnValue([]);
		mockValidateMovieElements.mockReturnValue([]);
		mockProcessElement.mockReturnValue({ type: 'image', src: 'test.jpg' });

		mockExecute = {
			getNodeParameter: jest.fn(),
			logger: {
				warn: jest.fn(),
			},
		};

		// Set default return values
		mockExecute.getNodeParameter.mockImplementation((paramName: string, itemIndex: number, defaultValue?: any) => {
			switch (paramName) {
				case 'recordId':
				case 'webhookUrl':
					return defaultValue || '';
				case 'framerate':
					return 25;
				case 'output_width':
					return 1024;
				case 'output_height':
					return 768;
				case 'videoUrls.videoDetails':
				case 'movieElements.elementValues':
				case 'movieTextElements.textDetails':
				case 'movieElements.subtitleDetails':
				case 'textElements.textDetails':
				case 'subtitleElements.subtitleDetails':
					return [];
				default:
					return defaultValue;
			}
		});

		// Mock text and subtitle processors
		(processTextElement as jest.Mock).mockReturnValue({
			type: 'text',
			text: 'Test text',
			style: '001'
		});

		(processSubtitleElement as jest.Mock).mockReturnValue({
			type: 'subtitles',
			text: 'Test subtitle',
			language: 'en'
		});
	});

	describe('when processing movie text elements', () => {
		test('processes movie-level text elements', () => {
			mockExecute.getNodeParameter.mockImplementation((paramName: string) => {
				switch (paramName) {
					case 'framerate': return 25;
					case 'output_width': return 1024;
					case 'output_height': return 768;
					case 'recordId': return '';
					case 'webhookUrl': return '';
					case 'movieTextElements.textDetails': return [{
						text: 'Movie title',
						style: '001',
						duration: 5
					}];
					default: return [];
				}
			});

			const result = buildMergeVideosRequestBody.call(mockExecute, 0);

			expect(result.elements).toBeDefined();
			expect(result.elements).toHaveLength(1);
			expect(processTextElement).toHaveBeenCalledWith({
				text: 'Movie title',
				style: '001',
				duration: 5
			});
		});

		test('handles text element validation errors', () => {
			mockValidateTextElementParams.mockReturnValue(['Text content is required']);

			mockExecute.getNodeParameter.mockImplementation((paramName: string) => {
				switch (paramName) {
					case 'framerate': return 25;
					case 'output_width': return 1024;
					case 'output_height': return 768;
					case 'recordId': return '';
					case 'webhookUrl': return '';
					case 'movieTextElements.textDetails': return [{
						text: ''
					}];
					default: return [];
				}
			});

			expect(() => {
				buildMergeVideosRequestBody.call(mockExecute, 0);
			}).toThrow('Movie text element validation errors');
		});

		test('processes movie-level text elements through text processor', () => {
			mockExecute.getNodeParameter.mockImplementation((paramName: string) => {
				switch (paramName) {
					case 'framerate': return 25;
					case 'output_width': return 1024;
					case 'output_height': return 768;
					case 'recordId': return '';
					case 'webhookUrl': return '';
					case 'movieElements.elementValues': return [{
						type: 'text',
						text: 'Movie element text',
						start: 0,
						duration: 10,
						style: '001',
						position: 'center-center',
						'font-family': 'Arial',
						'font-size': '24px',
						color: '#FFFFFF'
					}];
					default: return [];
				}
			});

			const result = buildMergeVideosRequestBody.call(mockExecute, 0);

			expect(result.elements).toBeDefined();
			expect(result.elements).toHaveLength(1);
			expect(processTextElement).toHaveBeenCalledWith({
				text: 'Movie element text',
				start: 0,
				duration: 10,
				style: '001',
				position: 'center-center',
				fontFamily: 'Arial',
				fontSize: '24px',
				fontColor: '#FFFFFF'
			});
		});

		test('handles movie element with undefined text', () => {
			mockExecute.getNodeParameter.mockImplementation((paramName: string) => {
				switch (paramName) {
					case 'framerate': return 25;
					case 'output_width': return 1024;
					case 'output_height': return 768;
					case 'recordId': return '';
					case 'webhookUrl': return '';
					case 'movieElements.elementValues': return [{
						type: 'text',
						style: '003'
					}];
					default: return [];
				}
			});

			const result = buildMergeVideosRequestBody.call(mockExecute, 0);

			expect(processTextElement).toHaveBeenCalledWith({
				text: 'Default Text',
				style: '003'
			});
		});
	});

	describe('when processing movie subtitle elements', () => {
		test('processes subtitle elements with URL captions', () => {
			mockExecute.getNodeParameter.mockImplementation((paramName: string) => {
				switch (paramName) {
					case 'framerate': return 25;
					case 'output_width': return 1024;
					case 'output_height': return 768;
					case 'recordId': return '';
					case 'webhookUrl': return '';
					case 'movieElements.subtitleDetails': return [{
						captions: 'https://example.com/subtitles.srt',
						language: 'en',
						model: 'default'
					}];
					default: return [];
				}
			});

			const result = buildMergeVideosRequestBody.call(mockExecute, 0);

			expect(result.elements).toBeDefined();
			expect(result.elements).toHaveLength(1);
			expect(processSubtitleElement).toHaveBeenCalledWith({
				src: 'https://example.com/subtitles.srt',
				language: 'en',
				model: 'default'
			});
		});

		test('processes subtitle elements with inline text captions', () => {
			mockExecute.getNodeParameter.mockImplementation((paramName: string) => {
				switch (paramName) {
					case 'framerate': return 25;
					case 'output_width': return 1024;
					case 'output_height': return 768;
					case 'recordId': return '';
					case 'webhookUrl': return '';
					case 'movieElements.subtitleDetails': return [{
						captions: 'Inline subtitle content',
						language: 'es',
						model: 'default'
					}];
					default: return [];
				}
			});

			const result = buildMergeVideosRequestBody.call(mockExecute, 0);

			expect(result.elements).toBeDefined();
			expect(result.elements).toHaveLength(1);
			expect(processSubtitleElement).toHaveBeenCalledWith({
				text: 'Inline subtitle content',
				language: 'es',
				model: 'default'
			});
		});

		test('handles subtitle element validation errors', () => {
			mockValidateSubtitleElementParams.mockReturnValue(['Captions content is required']);

			mockExecute.getNodeParameter.mockImplementation((paramName: string) => {
				switch (paramName) {
					case 'framerate': return 25;
					case 'output_width': return 1024;
					case 'output_height': return 768;
					case 'recordId': return '';
					case 'webhookUrl': return '';
					case 'movieElements.subtitleDetails': return [{
						captions: ''
					}];
					default: return [];
				}
			});

			expect(() => {
				buildMergeVideosRequestBody.call(mockExecute, 0);
			}).toThrow('Movie subtitle element validation errors');
		});

		test('handles subtitle captions that do not start with http', () => {
			mockExecute.getNodeParameter.mockImplementation((paramName: string) => {
				switch (paramName) {
					case 'framerate': return 25;
					case 'output_width': return 1024;
					case 'output_height': return 768;
					case 'recordId': return '';
					case 'webhookUrl': return '';
					case 'movieElements.subtitleDetails': return [{
						captions: 'Non-URL subtitle content',
						language: 'fr',
						model: 'whisper'
					}];
					default: return [];
				}
			});

			const result = buildMergeVideosRequestBody.call(mockExecute, 0);

			expect(processSubtitleElement).toHaveBeenCalledWith({
				text: 'Non-URL subtitle content',
				language: 'fr',
				model: 'whisper'
			});
		});

		test('handles subtitle captions starting with http', () => {
			mockValidateSubtitleElementParams.mockReturnValue([]);

			mockExecute.getNodeParameter.mockImplementation((paramName: string) => {
				if (paramName === 'movieElements.subtitleDetails') {
					return [{
						captions: 'https://example.com/subtitles.srt'
					}];
				}
				switch (paramName) {
					case 'framerate': return 25;
					case 'output_width': return 1024;
					case 'output_height': return 768;
					case 'recordId': return '';
					case 'webhookUrl': return '';
					default: return [];
				}
			});

			buildMergeVideosRequestBody.call(mockExecute, 0);

			expect(processSubtitleElement).toHaveBeenCalled();
		});

		test('handles subtitle with start and duration defined', () => {
			mockValidateSubtitleElementParams.mockReturnValue([]);

			mockExecute.getNodeParameter.mockImplementation((paramName: string) => {
				if (paramName === 'movieElements.subtitleDetails') {
					return [{
						captions: 'https://example.com/subtitles.srt',
						language: 'en',
						start: 5,
						duration: 10
					}];
				}
				switch (paramName) {
					case 'framerate': return 25;
					case 'output_width': return 1024;
					case 'output_height': return 768;
					case 'recordId': return '';
					case 'webhookUrl': return '';
					default: return [];
				}
			});

			buildMergeVideosRequestBody.call(mockExecute, 0);

			expect(processSubtitleElement).toHaveBeenCalledWith(
				expect.objectContaining({
					start: 5,
					duration: 10
				})
			);
		});

		test('handles subtitle elements with undefined start and duration', () => {
			mockValidateSubtitleElementParams.mockReturnValue([]);

			mockExecute.getNodeParameter.mockImplementation((paramName: string) => {
				if (paramName === 'movieElements.subtitleDetails') {
					return [{
						captions: 'https://example.com/subs.srt',
						language: 'de'
						// No start or duration properties
					}];
				}
				switch (paramName) {
					case 'framerate': return 25;
					case 'output_width': return 1024;
					case 'output_height': return 768;
					case 'recordId': return '';
					case 'webhookUrl': return '';
					default: return [];
				}
			});

			const result = buildMergeVideosRequestBody.call(mockExecute, 0);

			expect(processSubtitleElement).toHaveBeenCalledWith({
				src: 'https://example.com/subs.srt',
				language: 'de',
				model: 'default'
				// Should not include start/duration since they were undefined
			});
		});

		test('handles subtitle with undefined captions', () => {
			mockValidateSubtitleElementParams.mockReturnValue([]);

			mockExecute.getNodeParameter.mockImplementation((paramName: string) => {
				if (paramName === 'movieElements.subtitleDetails') {
					return [{
						language: 'en'
						// captions is undefined
					}];
				}
				switch (paramName) {
					case 'framerate': return 25;
					case 'output_width': return 1024;
					case 'output_height': return 768;
					case 'recordId': return '';
					case 'webhookUrl': return '';
					default: return [];
				}
			});

			buildMergeVideosRequestBody.call(mockExecute, 0);

			expect(processSubtitleElement).toHaveBeenCalled();
		});

		test('handles subtitle with undefined language', () => {
			mockValidateSubtitleElementParams.mockReturnValue([]);

			mockExecute.getNodeParameter.mockImplementation((paramName: string) => {
				if (paramName === 'movieElements.subtitleDetails') {
					return [{
						captions: 'inline subtitle text'
						// language is undefined
					}];
				}
				switch (paramName) {
					case 'framerate': return 25;
					case 'output_width': return 1024;
					case 'output_height': return 768;
					case 'recordId': return '';
					case 'webhookUrl': return '';
					default: return [];
				}
			});

			buildMergeVideosRequestBody.call(mockExecute, 0);

			expect(processSubtitleElement).toHaveBeenCalledWith(
				expect.objectContaining({
					language: 'en'
				})
			);
		});

		test('handles inline subtitle with start and duration defined', () => {
			mockValidateSubtitleElementParams.mockReturnValue([]);

			mockExecute.getNodeParameter.mockImplementation((paramName: string) => {
				if (paramName === 'movieElements.subtitleDetails') {
					return [{
						captions: 'inline subtitle text', // doesn't start with 'http'
						language: 'en',
						start: 3,
						duration: 7
					}];
				}
				switch (paramName) {
					case 'framerate': return 25;
					case 'output_width': return 1024;
					case 'output_height': return 768;
					case 'recordId': return '';
					case 'webhookUrl': return '';
					default: return [];
				}
			});

			buildMergeVideosRequestBody.call(mockExecute, 0);

			expect(processSubtitleElement).toHaveBeenCalledWith(
				expect.objectContaining({
					text: 'inline subtitle text',
					start: 3,
					duration: 7
				})
			);
		});

		test('processes subtitle elements through subtitle processor', () => {
			mockExecute.getNodeParameter.mockImplementation((paramName: string) => {
				switch (paramName) {
					case 'framerate': return 25;
					case 'output_width': return 1024;
					case 'output_height': return 768;
					case 'recordId': return '';
					case 'webhookUrl': return '';
					case 'movieElements.elementValues': return [{
						type: 'subtitles',
						captions: 'Movie subtitle content',
						language: 'en',
						model: 'default',
						start: 0,
						duration: -2
					}];
					default: return [];
				}
			});

			const result = buildMergeVideosRequestBody.call(mockExecute, 0);

			expect(result.elements).toBeDefined();
			expect(result.elements).toHaveLength(1);
			expect(processSubtitleElement).toHaveBeenCalledWith({
				captions: 'Movie subtitle content',
				language: 'en',
				model: 'default',
				start: 0,
				duration: -2
			});
		});

		test('handles movie subtitle element with undefined language', () => {
			mockValidateMovieElements.mockReturnValue([]);

			mockExecute.getNodeParameter.mockImplementation((paramName: string) => {
				if (paramName === 'movieElements.elementValues') {
					return [{
						type: 'subtitles',
						captions: 'Movie subtitle content',
						// language is undefined
					}];
				}
				switch (paramName) {
					case 'framerate': return 25;
					case 'output_width': return 1024;
					case 'output_height': return 768;
					case 'recordId': return '';
					case 'webhookUrl': return '';
					default: return [];
				}
			});

			buildMergeVideosRequestBody.call(mockExecute, 0);

			expect(processSubtitleElement).toHaveBeenCalledWith(
				expect.objectContaining({
					language: 'en'
				})
			);
		});

		test('handles movie subtitle element with undefined model', () => {
			mockValidateMovieElements.mockReturnValue([]);

			mockExecute.getNodeParameter.mockImplementation((paramName: string) => {
				if (paramName === 'movieElements.elementValues') {
					return [{
						type: 'subtitles',
						captions: 'Movie subtitle content',
						language: 'en'
						// model is undefined
					}];
				}
				switch (paramName) {
					case 'framerate': return 25;
					case 'output_width': return 1024;
					case 'output_height': return 768;
					case 'recordId': return '';
					case 'webhookUrl': return '';
					default: return [];
				}
			});

			buildMergeVideosRequestBody.call(mockExecute, 0);

			expect(processSubtitleElement).toHaveBeenCalledWith(
				expect.objectContaining({
					model: 'default'
				})
			);
		});
	});

	describe('when processing mixed movie elements', () => {
		test('handles mixed movie-level elements', () => {
			mockExecute.getNodeParameter.mockImplementation((paramName: string) => {
				switch (paramName) {
					case 'framerate': return 25;
					case 'output_width': return 1024;
					case 'output_height': return 768;
					case 'recordId': return '';
					case 'webhookUrl': return '';
					case 'movieTextElements.textDetails': return [{
						text: 'Movie title',
						style: '001'
					}];
					case 'movieElements.subtitleDetails': return [{
						captions: 'Movie subtitles',
						language: 'en'
					}];
					default: return [];
				}
			});

			const result = buildMergeVideosRequestBody.call(mockExecute, 0);

			expect(result.elements).toBeDefined();
			expect(result.elements).toHaveLength(2); // Text + Subtitle
		});

		test('processes non-text elements through element processor', () => {
			mockExecute.getNodeParameter.mockImplementation((paramName: string) => {
				switch (paramName) {
					case 'framerate': return 25;
					case 'output_width': return 1024;
					case 'output_height': return 768;
					case 'recordId': return '';
					case 'webhookUrl': return '';
					case 'movieElements.elementValues': return [{
						type: 'audio',
						src: 'https://example.com/movie-audio.mp3',
						volume: 0.8,
						loop: false
					}];
					default: return [];
				}
			});

			const result = buildMergeVideosRequestBody.call(mockExecute, 0);

			expect(result.elements).toBeDefined();
			expect(result.elements).toHaveLength(1);
			expect(mockProcessElement).toHaveBeenCalledWith(
				{
					type: 'audio',
					src: 'https://example.com/movie-audio.mp3',
					volume: 0.8,
					loop: false
				},
				1024,
				768
			);
		});
	});

	describe('when handling movie element validation', () => {
		test('handles movie element validation errors', () => {
			mockValidateMovieElements.mockReturnValue(['Invalid movie element']);

			mockExecute.getNodeParameter.mockImplementation((paramName: string) => {
				switch (paramName) {
					case 'framerate': return 25;
					case 'output_width': return 1024;
					case 'output_height': return 768;
					case 'recordId': return '';
					case 'webhookUrl': return '';
					case 'movieElements.elementValues': return [{
						type: 'subtitles'
					}];
					default: return [];
				}
			});

			expect(() => {
				buildMergeVideosRequestBody.call(mockExecute, 0);
			}).toThrow('Movie element validation errors');
		});
	});

	describe('when handling movie element processing errors', () => {
		test('logs warnings for failed element processing', () => {
			mockProcessElement.mockImplementation(() => {
				throw new Error('Processing failed');
			});

			mockExecute.getNodeParameter.mockImplementation((paramName: string) => {
				switch (paramName) {
					case 'framerate': return 25;
					case 'output_width': return 1024;
					case 'output_height': return 768;
					case 'recordId': return '';
					case 'webhookUrl': return '';
					case 'movieElements.elementValues': return [{
						type: 'image',
						src: 'https://example.com/image.jpg'
					}];
					default: return [];
				}
			});

			const result = buildMergeVideosRequestBody.call(mockExecute, 0);

			expect(mockExecute.logger.warn).toHaveBeenCalledWith(
				expect.stringContaining('Failed to process movie element')
			);
		});

		test('handles movie-level element processing errors gracefully', () => {
			mockProcessElement.mockImplementation(() => {
				throw new Error('Element processing failed');
			});

			mockExecute.getNodeParameter.mockImplementation((paramName: string) => {
				switch (paramName) {
					case 'framerate': return 25;
					case 'output_width': return 1024;
					case 'output_height': return 768;
					case 'recordId': return '';
					case 'webhookUrl': return '';
					case 'movieElements.elementValues': return [{
						type: 'audio',
						src: 'https://example.com/audio.mp3'
					}];
					default: return [];
				}
			});

			const result = buildMergeVideosRequestBody.call(mockExecute, 0);

			expect(mockExecute.logger.warn).toHaveBeenCalled();
			expect(result.elements).toBeUndefined(); // Failed element not added
		});
	});
});