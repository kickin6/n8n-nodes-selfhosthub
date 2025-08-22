// __tests__/nodes/CreateJ2vMovie/utils/requestBuilder/mergeVideos/mergeVideosBuilder.sceneElements.test.ts

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

describe('mergeVideosBuilder - Scene-Level Elements', () => {
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

	describe('when processing scene text elements', () => {
		test('processes scene-level text elements', () => {
			mockExecute.getNodeParameter.mockImplementation((paramName: string) => {
				switch (paramName) {
					case 'framerate': return 25;
					case 'output_width': return 1024;
					case 'output_height': return 768;
					case 'recordId': return '';
					case 'webhookUrl': return '';
					case 'videoUrls.videoDetails': return [{
						url: 'https://example.com/video.mp4',
						textElements: {
							textDetails: [{
								text: 'Scene text',
								style: '002'
							}]
						}
					}];
					default: return [];
				}
			});

			const result = buildMergeVideosRequestBody.call(mockExecute, 0);

			expect(result.scenes[0].elements).toHaveLength(2); // Video + Text
			expect(processTextElement).toHaveBeenCalledWith({
				text: 'Scene text',
				style: '002'
			});
		});

		test('processes scene-level text elements through text processor', () => {
			mockExecute.getNodeParameter.mockImplementation((paramName: string) => {
				switch (paramName) {
					case 'framerate': return 25;
					case 'output_width': return 1024;
					case 'output_height': return 768;
					case 'recordId': return '';
					case 'webhookUrl': return '';
					case 'videoUrls.videoDetails': return [{
						url: 'https://example.com/video.mp4',
						elements: {
							elementValues: [{
								type: 'text',
								text: 'Scene element text',
								start: 2,
								duration: 5,
								style: '002',
								position: 'bottom-center',
								'font-family': 'Roboto',
								'font-size': '32px',
								color: '#FFFF00'
							}]
						}
					}];
					default: return [];
				}
			});

			const result = buildMergeVideosRequestBody.call(mockExecute, 0);

			expect(result.scenes[0].elements).toHaveLength(2); // Video + Text
			expect(processTextElement).toHaveBeenCalledWith({
				text: 'Scene element text',
				start: 2,
				duration: 5,
				style: '002',
				position: 'bottom-center',
				fontFamily: 'Roboto',
				fontSize: '32px',
				fontColor: '#FFFF00'
			});
		});

		test('handles scene element with undefined text', () => {
			mockExecute.getNodeParameter.mockImplementation((paramName: string) => {
				switch (paramName) {
					case 'framerate': return 25;
					case 'output_width': return 1024;
					case 'output_height': return 768;
					case 'recordId': return '';
					case 'webhookUrl': return '';
					case 'videoUrls.videoDetails': return [{
						url: 'https://example.com/video.mp4',
						elements: {
							elementValues: [{
								type: 'text',
								// text property is undefined
								style: '004',
								position: 'top-left'
							}]
						}
					}];
					default: return [];
				}
			});

			const result = buildMergeVideosRequestBody.call(mockExecute, 0);

			expect(processTextElement).toHaveBeenCalledWith({
				text: 'Default Text', // Should use default value
				style: '004',
				position: 'top-left'
			});
		});

		test('handles scene text element validation errors', () => {
			mockValidateTextElementParams.mockReturnValue(['Scene text validation error']);

			mockExecute.getNodeParameter.mockImplementation((paramName: string) => {
				switch (paramName) {
					case 'framerate': return 25;
					case 'output_width': return 1024;
					case 'output_height': return 768;
					case 'recordId': return '';
					case 'webhookUrl': return '';
					case 'videoUrls.videoDetails': return [{
						url: 'https://example.com/video.mp4',
						textElements: {
							textDetails: [{
								text: '' // Invalid
							}]
						}
					}];
					default: return [];
				}
			});

			expect(() => {
				buildMergeVideosRequestBody.call(mockExecute, 0);
			}).toThrow('Scene text element validation errors');
		});
	});

	describe('when processing scene subtitle elements', () => {
		test('handles scene-level subtitle validation errors', () => {
			mockValidateSceneElements.mockReturnValue(['Subtitles cannot be in scenes']);

			mockExecute.getNodeParameter.mockImplementation((paramName: string) => {
				switch (paramName) {
					case 'framerate': return 25;
					case 'output_width': return 1024;
					case 'output_height': return 768;
					case 'recordId': return '';
					case 'webhookUrl': return '';
					case 'videoUrls.videoDetails': return [{
						url: 'https://example.com/video.mp4',
						subtitleElements: {
							subtitleDetails: [{
								captions: 'Scene subtitles'
							}]
						}
					}];
					default: return [];
				}
			});

			expect(() => {
				buildMergeVideosRequestBody.call(mockExecute, 0);
			}).toThrow('Scene subtitle validation errors');
		});
	});

	describe('when processing scene standard elements', () => {
		test('processes scene-level standard elements', () => {
			mockExecute.getNodeParameter.mockImplementation((paramName: string) => {
				switch (paramName) {
					case 'framerate': return 25;
					case 'output_width': return 1024;
					case 'output_height': return 768;
					case 'recordId': return '';
					case 'webhookUrl': return '';
					case 'videoUrls.videoDetails': return [{
						url: 'https://example.com/video.mp4',
						elements: {
							elementValues: [{
								type: 'image',
								src: 'https://example.com/image.jpg'
							}]
						}
					}];
					default: return [];
				}
			});

			const result = buildMergeVideosRequestBody.call(mockExecute, 0);

			expect(result.scenes[0].elements).toHaveLength(2); // Video + Image
			expect(mockProcessElement).toHaveBeenCalled();
		});

		test('processes scene-level non-text elements through element processor', () => {
			mockExecute.getNodeParameter.mockImplementation((paramName: string) => {
				switch (paramName) {
					case 'framerate': return 25;
					case 'output_width': return 1024;
					case 'output_height': return 768;
					case 'recordId': return '';
					case 'webhookUrl': return '';
					case 'videoUrls.videoDetails': return [{
						url: 'https://example.com/video.mp4',
						elements: {
							elementValues: [{
								type: 'image',
								src: 'https://example.com/scene-image.jpg',
								start: 1,
								duration: 3,
								position: 'top-right'
							}]
						}
					}];
					default: return [];
				}
			});

			const result = buildMergeVideosRequestBody.call(mockExecute, 0);

			expect(result.scenes[0].elements).toHaveLength(2); // Video + Image
			expect(mockProcessElement).toHaveBeenCalledWith(
				{
					type: 'image',
					src: 'https://example.com/scene-image.jpg',
					start: 1,
					duration: 3,
					position: 'top-right'
				},
				1024,
				768
			);
		});

		test('handles scene element validation errors', () => {
			mockValidateSceneElements.mockReturnValue(['Invalid scene element']);

			mockExecute.getNodeParameter.mockImplementation((paramName: string) => {
				switch (paramName) {
					case 'framerate': return 25;
					case 'output_width': return 1024;
					case 'output_height': return 768;
					case 'recordId': return '';
					case 'webhookUrl': return '';
					case 'videoUrls.videoDetails': return [{
						url: 'https://example.com/video.mp4',
						elements: {
							elementValues: [{
								type: 'subtitles' // Invalid in scene
							}]
						}
					}];
					default: return [];
				}
			});

			expect(() => {
				buildMergeVideosRequestBody.call(mockExecute, 0);
			}).toThrow('Scene element validation errors');
		});
	});

	describe('when handling scene element processing errors', () => {
		test('handles scene-level element processing errors gracefully', () => {
			mockProcessElement.mockImplementation(() => {
				throw new Error('Scene element processing failed');
			});

			mockExecute.getNodeParameter.mockImplementation((paramName: string) => {
				switch (paramName) {
					case 'framerate': return 25;
					case 'output_width': return 1024;
					case 'output_height': return 768;
					case 'recordId': return '';
					case 'webhookUrl': return '';
					case 'videoUrls.videoDetails': return [{
						url: 'https://example.com/video.mp4',
						elements: {
							elementValues: [{
								type: 'audio',
								src: 'https://example.com/scene-audio.mp3'
							}]
						}
					}];
					default: return [];
				}
			});

			const result = buildMergeVideosRequestBody.call(mockExecute, 0);

			expect(mockExecute.logger.warn).toHaveBeenCalled();
			expect(result.scenes[0].elements).toHaveLength(1); // Only video, failed element not added
		});
	});
});