// __tests__/nodes/CreateJ2vMovie/utils/requestBuilder/mergeVideos/mergeVideosBuilder.core.test.ts

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

describe('mergeVideosBuilder - Core Functionality', () => {
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

		// Set default return values - ensuring correct types
		mockExecute.getNodeParameter.mockImplementation((paramName: string, itemIndex: number, defaultValue?: any) => {
			switch (paramName) {
				// String parameters
				case 'recordId':
				case 'webhookUrl':
					return defaultValue || '';

				// Number parameters
				case 'framerate':
					return 25;
				case 'output_width':
					return 1024;
				case 'output_height':
					return 768;

				// Array parameters
				case 'videoUrls.videoDetails':
				case 'videoElements.videoDetails':
				case 'movieElements.elementValues':
				case 'movieTextElements.textDetails':
				case 'movieElements.subtitleDetails':
				case 'textElements.textDetails':
				case 'subtitleElements.subtitleDetails':
					return [];

				// Object parameters
				case 'outputSettings.outputDetails':
				case 'outputSettings':
					return {};

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

	describe('when building basic request structure', () => {
		test('creates request with default parameters', () => {
			const result = buildMergeVideosRequestBody.call(mockExecute, 0);

			expect(result).toMatchObject({
				fps: 25,
				width: 1024,
				height: 768,
				scenes: expect.any(Array)
			});
			expect(result.scenes).toHaveLength(1); // Fallback empty scene
		});

		test('handles recordId and webhookUrl configuration', () => {
			mockExecute.getNodeParameter.mockImplementation((paramName: string) => {
				switch (paramName) {
					case 'recordId': return 'test-record-123';
					case 'webhookUrl': return 'https://webhook.example.com';
					case 'framerate': return 25;
					case 'output_width': return 1024;
					case 'output_height': return 768;
					default: return [];
				}
			});

			const result = buildMergeVideosRequestBody.call(mockExecute, 0);

			expect(result.id).toBe('test-record-123');
			expect(result.exports).toEqual([{
				destinations: [{
					type: 'webhook',
					endpoint: 'https://webhook.example.com'
				}]
			}]);
		});

		test('handles function call with custom itemIndex', () => {
			const result = buildMergeVideosRequestBody.call(mockExecute, 5);

			expect(result).toBeDefined();
			expect(mockExecute.getNodeParameter).toHaveBeenCalledWith('framerate', 5, 25);
		});

		test('handles function call without itemIndex parameter', () => {
			const result = buildMergeVideosRequestBody.call(mockExecute);

			expect(result).toBeDefined();
			expect(mockExecute.getNodeParameter).toHaveBeenCalledWith('framerate', 0, 25);
			expect(mockExecute.getNodeParameter).toHaveBeenCalledWith('output_width', 0, 1024);
			expect(mockExecute.getNodeParameter).toHaveBeenCalledWith('output_height', 0, 768);
		});

		test('handles empty video elements gracefully', () => {
			const result = buildMergeVideosRequestBody.call(mockExecute, 0);

			expect(result).toBeDefined();
			expect(result.scenes).toBeDefined();
			expect(result.scenes).toHaveLength(1); // Fallback empty scene
			expect(result).toHaveProperty('width', 1024);
			expect(result).toHaveProperty('height', 768);
			expect(result).toHaveProperty('fps', 25);
		});
	});

	describe('when processing video elements', () => {
		test('processes single video element', () => {
			mockExecute.getNodeParameter.mockImplementation((paramName: string) => {
				switch (paramName) {
					case 'framerate': return 25;
					case 'output_width': return 1024;
					case 'output_height': return 768;
					case 'recordId': return '';
					case 'webhookUrl': return '';
					case 'videoUrls.videoDetails': return [{
						url: 'https://example.com/video.mp4',
						duration: -1,
						volume: 1.0,
						muted: false,
						loop: false
					}];
					default: return [];
				}
			});

			const result = buildMergeVideosRequestBody.call(mockExecute, 0);

			expect(result.scenes).toHaveLength(1);
			expect(result.scenes[0].elements).toHaveLength(1);
			expect(result.scenes[0].elements[0]).toMatchObject({
				type: 'video',
				src: 'https://example.com/video.mp4',
				duration: -1,
				volume: 1.0,
				muted: false,
				loop: 1
			});
		});

		test('handles video with all properties', () => {
			mockExecute.getNodeParameter.mockImplementation((paramName: string) => {
				switch (paramName) {
					case 'framerate': return 25;
					case 'output_width': return 1024;
					case 'output_height': return 768;
					case 'recordId': return '';
					case 'webhookUrl': return '';
					case 'videoUrls.videoDetails': return [{
						url: 'https://example.com/video.mp4',
						duration: -2,
						volume: 0.5,
						muted: true,
						loop: true,
						seek: 10
					}];
					default: return [];
				}
			});

			const result = buildMergeVideosRequestBody.call(mockExecute, 0);

			expect(result.scenes[0].elements[0]).toMatchObject({
				type: 'video',
				src: 'https://example.com/video.mp4',
				duration: -2,
				volume: 0.5,
				muted: true,
				loop: -1, // true converts to -1
				seek: 10
			});
		});

		test('handles multiple videos with transitions', () => {
			mockExecute.getNodeParameter.mockImplementation((paramName: string) => {
				switch (paramName) {
					case 'framerate': return 25;
					case 'output_width': return 1024;
					case 'output_height': return 768;
					case 'recordId': return '';
					case 'webhookUrl': return '';
					case 'videoUrls.videoDetails': return [
						{
							url: 'https://example.com/video1.mp4',
							duration: 10
						},
						{
							url: 'https://example.com/video2.mp4',
							duration: 5,
							transition_style: 'fade',
							transition_duration: 2
						}
					];
					default: return [];
				}
			});

			const result = buildMergeVideosRequestBody.call(mockExecute, 0);

			expect(result.scenes).toHaveLength(2);
			expect(result.scenes[0].elements[0]).toMatchObject({
				type: 'video',
				src: 'https://example.com/video1.mp4',
				duration: 10
			});
			expect(result.scenes[0].transition).toBeUndefined(); // No transition for first scene

			expect(result.scenes[1].elements[0]).toMatchObject({
				type: 'video',
				src: 'https://example.com/video2.mp4',
				duration: 5
			});
			expect(result.scenes[1].transition).toEqual({
				style: 'fade',
				duration: 2
			});
		});

		test('skips video without URL', () => {
			mockExecute.getNodeParameter.mockImplementation((paramName: string) => {
				switch (paramName) {
					case 'framerate': return 25;
					case 'output_width': return 1024;
					case 'output_height': return 768;
					case 'recordId': return '';
					case 'webhookUrl': return '';
					case 'videoUrls.videoDetails': return [{
						duration: 10 // No URL
					}];
					default: return [];
				}
			});

			const result = buildMergeVideosRequestBody.call(mockExecute, 0);

			expect(result.scenes).toHaveLength(1);
			expect(result.scenes[0].elements).toHaveLength(0); // No video element added
		});
	});

	describe('when handling error conditions', () => {
		test('handles non-array video data gracefully', () => {
			mockExecute.getNodeParameter.mockImplementation((paramName: string) => {
				switch (paramName) {
					case 'framerate': return 25;
					case 'output_width': return 1024;
					case 'output_height': return 768;
					case 'recordId': return '';
					case 'webhookUrl': return '';
					case 'videoUrls.videoDetails': null; // Non-array
					default: return [];
				}
			});

			const result = buildMergeVideosRequestBody.call(mockExecute, 0);

			expect(result.scenes).toHaveLength(1); // Fallback scene
			expect(result.scenes[0].elements).toHaveLength(0);
		});

		test('handles invalid video properties gracefully', () => {
			mockExecute.getNodeParameter.mockImplementation((paramName: string) => {
				switch (paramName) {
					case 'framerate': return 25;
					case 'output_width': return 1024;
					case 'output_height': return 768;
					case 'recordId': return '';
					case 'webhookUrl': return '';
					case 'videoUrls.videoDetails': return [{
						url: 'https://example.com/video.mp4',
						duration: 'invalid',
						volume: 'invalid',
						seek: -5, // Invalid negative
						speed: 0, // Invalid zero
						start: -1 // Invalid negative
					}];
					default: return [];
				}
			});

			const result = buildMergeVideosRequestBody.call(mockExecute, 0);

			const videoElement = result.scenes[0].elements[0];
			expect(videoElement).not.toHaveProperty('duration');
			expect(videoElement).not.toHaveProperty('volume');
			expect(videoElement).not.toHaveProperty('seek');
			expect(videoElement).not.toHaveProperty('speed');
			expect(videoElement).not.toHaveProperty('start');
		});

		test('handles transition without style gracefully', () => {
			mockExecute.getNodeParameter.mockImplementation((paramName: string) => {
				switch (paramName) {
					case 'framerate': return 25;
					case 'output_width': return 1024;
					case 'output_height': return 768;
					case 'recordId': return '';
					case 'webhookUrl': return '';
					case 'videoUrls.videoDetails': return [
						{ url: 'https://example.com/video1.mp4' },
						{
							url: 'https://example.com/video2.mp4',
							transition_style: '', // Empty style
							transition_duration: 2
						}
					];
					default: return [];
				}
			});

			const result = buildMergeVideosRequestBody.call(mockExecute, 0);

			expect(result.scenes[1].transition).toBeUndefined(); // No transition added
		});
	});

	describe('when handling complete integration scenarios', () => {
		test('handles complete video merging with all elements', () => {
			mockExecute.getNodeParameter.mockImplementation((paramName: string) => {
				switch (paramName) {
					case 'framerate': return 30;
					case 'output_width': return 1920;
					case 'output_height': return 1080;
					case 'recordId': return 'complete-test';
					case 'webhookUrl': return 'https://webhook.test.com';
					case 'videoUrls.videoDetails': return [
						{
							url: 'https://example.com/intro.mp4',
							duration: 5,
							volume: 0.8
						},
						{
							url: 'https://example.com/main.mp4',
							duration: -1,
							transition_style: 'fade',
							transition_duration: 1.5
						}
					];
					case 'movieTextElements.textDetails': return [{
						text: 'Global Title',
						style: '001',
						duration: 10
					}];
					case 'movieElements.subtitleDetails': return [{
						captions: 'Global subtitles content',
						language: 'en'
					}];
					default: return [];
				}
			});

			const result = buildMergeVideosRequestBody.call(mockExecute, 0);

			// Check basic structure
			expect(result).toMatchObject({
				fps: 30,
				width: 1920,
				height: 1080,
				id: 'complete-test'
			});

			// Check webhook
			expect(result.exports).toBeDefined();

			// Check scenes
			expect(result.scenes).toHaveLength(2);
			expect(result.scenes[0].elements[0]).toMatchObject({
				type: 'video',
				src: 'https://example.com/intro.mp4'
			});

			// Check transition
			expect(result.scenes[1].transition).toEqual({
				style: 'fade',
				duration: 1.5
			});

			// Check movie-level elements
			expect(result.elements).toBeDefined();
			expect(result.elements).toHaveLength(2);
		});
	});
});