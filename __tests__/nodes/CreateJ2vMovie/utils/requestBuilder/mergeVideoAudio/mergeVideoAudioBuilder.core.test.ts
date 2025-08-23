// __tests__/nodes/CreateJ2vMovie/utils/requestBuilder/mergeVideoAudio/mergeVideoAudioBuilder.core.test.ts

import { buildMergeVideosRequestBody } from '@nodes/CreateJ2vMovie/utils/requestBuilder/mergeVideosBuilder';
import { processTextElement, processSubtitleElement } from '@nodes/CreateJ2vMovie/utils/textElementProcessor';
import { processVideoElements, processAudioElements } from '@nodes/CreateJ2vMovie/utils/requestBuilder/shared';

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

// Mock the shared processors (NEW - testing unified processors)
jest.mock('@nodes/CreateJ2vMovie/utils/requestBuilder/shared', () => ({
	processVideoElements: jest.fn(),
	processAudioElements: jest.fn(),
	processMovieElements: jest.fn(),
}));

// Mock the elementProcessor
jest.mock('@nodes/CreateJ2vMovie/utils/elementProcessor', () => ({
	processElement: jest.fn(),
}));

describe('mergeVideosBuilder.core', () => {
	let mockExecute: any;
	let mockProcessTextElement: jest.MockedFunction<typeof processTextElement>;
	let mockProcessSubtitleElement: jest.MockedFunction<typeof processSubtitleElement>;
	let mockProcessVideoElements: jest.MockedFunction<typeof processVideoElements>;
	let mockProcessAudioElements: jest.MockedFunction<typeof processAudioElements>;

	beforeEach(() => {
		jest.clearAllMocks();

		mockExecute = {
			getNodeParameter: jest.fn(),
			logger: {
				debug: jest.fn(),
				info: jest.fn(),
				warn: jest.fn(),
				error: jest.fn(),
			},
		};

		mockProcessTextElement = processTextElement as jest.MockedFunction<typeof processTextElement>;
		mockProcessSubtitleElement = processSubtitleElement as jest.MockedFunction<typeof processSubtitleElement>;
		mockProcessVideoElements = processVideoElements as jest.MockedFunction<typeof processVideoElements>;
		mockProcessAudioElements = processAudioElements as jest.MockedFunction<typeof processAudioElements>;

		// Set up default mock returns
		mockProcessTextElement.mockReturnValue({ type: 'text', text: 'Processed text' });
		mockProcessSubtitleElement.mockReturnValue({ type: 'subtitles', captions: 'Processed subtitle' });

		// Validation mocks return no errors by default
		const validationUtils = require('@nodes/CreateJ2vMovie/utils/validationUtils');
		validationUtils.validateSceneElements.mockReturnValue([]);
		validationUtils.validateMovieElements.mockReturnValue([]);
	});

	describe('Basic Request Structure', () => {
		test('should build basic request with minimal parameters', () => {
			mockExecute.getNodeParameter.mockImplementation((paramName: string) => {
				switch (paramName) {
					case 'framerate': return 30;
					case 'output_width': return 1920;
					case 'output_height': return 1080;
					case 'recordId': return 'test-record';
					case 'webhookUrl': return '';
					case 'videoUrls.videoDetails': return [{ url: 'https://example.com/video.mp4' }];
					default: return [];
				}
			});

			const result = buildMergeVideosRequestBody.call(mockExecute, 0);

			expect(result).toMatchObject({
				fps: 30,
				width: 1920,
				height: 1080,
				id: 'test-record',
				scenes: expect.any(Array)
			});
		});

		test('should handle empty recordId', () => {
			mockExecute.getNodeParameter.mockImplementation((paramName: string) => {
				switch (paramName) {
					case 'framerate': return 25;
					case 'output_width': return 1024;
					case 'output_height': return 768;
					case 'recordId': return '';
					case 'webhookUrl': return '';
					case 'videoUrls.videoDetails': return [{ url: 'https://example.com/video.mp4' }];
					default: return [];
				}
			});

			const result = buildMergeVideosRequestBody.call(mockExecute, 0);

			expect(result.id).toBe('');
		});
	});

	describe('Unified Video Processing', () => {
		test('should use processVideoElements for video processing', () => {
			mockExecute.getNodeParameter.mockImplementation((paramName: string) => {
				switch (paramName) {
					case 'framerate': return 30;
					case 'output_width': return 1920;
					case 'output_height': return 1080;
					case 'recordId': return '';
					case 'webhookUrl': return '';
					case 'videoUrls.videoDetails': return [{
						url: 'https://example.com/video.mp4',
						duration: 10,
						volume: 0.8,
						muted: false,
						loop: true,
						fit: 'cover',
						seek: 5,
						speed: 1.5
					}];
					default: return [];
				}
			});

			buildMergeVideosRequestBody.call(mockExecute, 0);

			// Verify processVideoElements was called with correct video data
			expect(mockProcessVideoElements).toHaveBeenCalledWith(
				expect.arrayContaining([
					expect.objectContaining({
						type: 'video',
						src: 'https://example.com/video.mp4',
						duration: 10,
						volume: 0.8,
						muted: false,
						loop: true,
						fit: 'cover',
						seek: 5,
						speed: 1.5
					})
				]),
				expect.any(Object)
			);
		});

		test('should handle multiple videos with processVideoElements', () => {
			mockExecute.getNodeParameter.mockImplementation((paramName: string) => {
				switch (paramName) {
					case 'framerate': return 25;
					case 'output_width': return 1024;
					case 'output_height': return 768;
					case 'recordId': return '';
					case 'webhookUrl': return '';
					case 'videoUrls.videoDetails': return [
						{ url: 'https://example.com/video1.mp4', duration: 5 },
						{ url: 'https://example.com/video2.mp4', volume: 0.7 },
						{ url: 'https://example.com/video3.mp4', muted: true }
					];
					default: return [];
				}
			});

			buildMergeVideosRequestBody.call(mockExecute, 0);

			// Should call processVideoElements for each scene
			expect(mockProcessVideoElements).toHaveBeenCalledTimes(3);
		});

		test('should handle video processing errors gracefully', () => {
			mockProcessVideoElements.mockImplementation(() => {
				throw new Error('Video processing failed');
			});

			mockExecute.getNodeParameter.mockImplementation((paramName: string) => {
				switch (paramName) {
					case 'framerate': return 30;
					case 'output_width': return 1920;
					case 'output_height': return 1080;
					case 'recordId': return '';
					case 'webhookUrl': return '';
					case 'videoUrls.videoDetails': return [{ url: 'https://example.com/video.mp4' }];
					default: return [];
				}
			});

			const result = buildMergeVideosRequestBody.call(mockExecute, 0);

			expect(mockExecute.logger.warn).toHaveBeenCalledWith(
				expect.stringContaining('Error processing video element')
			);
			expect(result.scenes).toHaveLength(1);
		});
	});

	describe('Scene Element Processing with Unified Processors', () => {
		test('should use processAudioElements for scene audio elements', () => {
			mockExecute.getNodeParameter.mockImplementation((paramName: string, index?: number) => {
				switch (paramName) {
					case 'framerate': return 30;
					case 'output_width': return 1920;
					case 'output_height': return 1080;
					case 'recordId': return '';
					case 'webhookUrl': return '';
					case 'videoUrls.videoDetails': return [{ url: 'https://example.com/video.mp4' }];
					case 'sceneElements.elementValues':
						return index === 0 ? [{
							type: 'audio',
							src: 'https://example.com/audio.mp3',
							volume: 0.7,
							fadeIn: 2,
							fadeOut: 1.5
						}] : [];
					default: return [];
				}
			});

			buildMergeVideosRequestBody.call(mockExecute, 0);

			expect(mockProcessAudioElements).toHaveBeenCalledWith(
				expect.arrayContaining([
					expect.objectContaining({
						type: 'audio',
						src: 'https://example.com/audio.mp3',
						volume: 0.7,
						fadeIn: 2,
						fadeOut: 1.5
					})
				]),
				expect.any(Object)
			);
		});

		test('should handle mixed scene elements using appropriate processors', () => {
			mockExecute.getNodeParameter.mockImplementation((paramName: string, index?: number) => {
				switch (paramName) {
					case 'framerate': return 25;
					case 'output_width': return 1024;
					case 'output_height': return 768;
					case 'recordId': return '';
					case 'webhookUrl': return '';
					case 'videoUrls.videoDetails': return [{ url: 'https://example.com/video.mp4' }];
					case 'sceneElements.elementValues':
						return index === 0 ? [
							{ type: 'audio', src: 'https://example.com/audio.mp3' },
							{ type: 'image', src: 'https://example.com/image.jpg' },
							{ type: 'voice', text: 'Hello world', voice: 'en-US-AriaNeural' }
						] : [];
					default: return [];
				}
			});

			buildMergeVideosRequestBody.call(mockExecute, 0);

			// Should call processAudioElements for audio elements
			expect(mockProcessAudioElements).toHaveBeenCalled();
		});

		test('should handle scene element processing errors gracefully', () => {
			mockProcessAudioElements.mockImplementation(() => {
				throw new Error('Audio processing failed');
			});

			mockExecute.getNodeParameter.mockImplementation((paramName: string, index?: number) => {
				switch (paramName) {
					case 'framerate': return 30;
					case 'output_width': return 1920;
					case 'output_height': return 1080;
					case 'recordId': return '';
					case 'webhookUrl': return '';
					case 'videoUrls.videoDetails': return [{ url: 'https://example.com/video.mp4' }];
					case 'sceneElements.elementValues':
						return index === 0 ? [{ type: 'audio', src: 'https://example.com/audio.mp3' }] : [];
					default: return [];
				}
			});

			const result = buildMergeVideosRequestBody.call(mockExecute, 0);

			expect(mockExecute.logger.warn).toHaveBeenCalled();
			expect(result.scenes).toHaveLength(1);
		});
	});

	describe('Video Property Filtering and Validation', () => {
		test('should filter out invalid video properties', () => {
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

			buildMergeVideosRequestBody.call(mockExecute, 0);

			// Should call processVideoElements with filtered data (invalid properties removed)
			const calledWith = mockProcessVideoElements.mock.calls[0][0][0];
			expect(calledWith).toEqual(
				expect.objectContaining({
					type: 'video',
					src: 'https://example.com/video.mp4'
				})
			);
			expect(calledWith).not.toHaveProperty('duration');
			expect(calledWith).not.toHaveProperty('volume');
			expect(calledWith).not.toHaveProperty('seek');
			expect(calledWith).not.toHaveProperty('speed');
			expect(calledWith).not.toHaveProperty('start');
		});

		test('should handle video with all valid properties', () => {
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

			buildMergeVideosRequestBody.call(mockExecute, 0);

			expect(mockProcessVideoElements).toHaveBeenCalledWith(
				expect.arrayContaining([
					expect.objectContaining({
						type: 'video',
						src: 'https://example.com/video.mp4',
						duration: -2,
						volume: 0.5,
						muted: true,
						loop: true,
						seek: 10
					})
				]),
				expect.any(Object)
			);
		});
	});

	describe('Transition Processing', () => {
		test('should handle transitions between multiple videos', () => {
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
			expect(result.scenes[1].transition).toEqual({
				style: 'fade',
				duration: 2
			});
		});

		test('should handle transition without style gracefully', () => {
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

	describe('Webhook Configuration', () => {
		test('should configure webhook when URL provided', () => {
			mockExecute.getNodeParameter.mockImplementation((paramName: string) => {
				switch (paramName) {
					case 'framerate': return 30;
					case 'output_width': return 1920;
					case 'output_height': return 1080;
					case 'recordId': return 'webhook-test';
					case 'webhookUrl': return 'https://webhook.example.com';
					case 'videoUrls.videoDetails': return [{ url: 'https://example.com/video.mp4' }];
					default: return [];
				}
			});

			const result = buildMergeVideosRequestBody.call(mockExecute, 0);

			expect(result.exports).toEqual([{
				type: 'webhook',
				webhook: 'https://webhook.example.com'
			}]);
		});

		test('should not configure webhook when URL is empty', () => {
			mockExecute.getNodeParameter.mockImplementation((paramName: string) => {
				switch (paramName) {
					case 'framerate': return 30;
					case 'output_width': return 1920;
					case 'output_height': return 1080;
					case 'recordId': return '';
					case 'webhookUrl': return '';
					case 'videoUrls.videoDetails': return [{ url: 'https://example.com/video.mp4' }];
					default: return [];
				}
			});

			const result = buildMergeVideosRequestBody.call(mockExecute, 0);

			expect(result.exports).toBeUndefined();
		});
	});

	describe('Edge Cases and Error Handling', () => {
		test('should handle empty video details array', () => {
			mockExecute.getNodeParameter.mockImplementation((paramName: string) => {
				switch (paramName) {
					case 'framerate': return 30;
					case 'output_width': return 1920;
					case 'output_height': return 1080;
					case 'recordId': return '';
					case 'webhookUrl': return '';
					case 'videoUrls.videoDetails': return [];
					default: return [];
				}
			});

			const result = buildMergeVideosRequestBody.call(mockExecute, 0);

			expect(result.scenes).toHaveLength(0);
		});

		test('should handle validation errors for scene elements', () => {
			const validationUtils = require('@nodes/CreateJ2vMovie/utils/validationUtils');
			validationUtils.validateSceneElements.mockReturnValue(['Validation error']);

			mockExecute.getNodeParameter.mockImplementation((paramName: string, index?: number) => {
				switch (paramName) {
					case 'framerate': return 30;
					case 'output_width': return 1920;
					case 'output_height': return 1080;
					case 'recordId': return '';
					case 'webhookUrl': return '';
					case 'videoUrls.videoDetails': return [{ url: 'https://example.com/video.mp4' }];
					case 'sceneElements.elementValues':
						return index === 0 ? [{ type: 'invalid' }] : [];
					default: return [];
				}
			});

			expect(() => {
				buildMergeVideosRequestBody.call(mockExecute, 0);
			}).toThrow('Scene element validation errors:\nValidation error');
		});

		test('should handle validation errors for movie elements', () => {
			const validationUtils = require('@nodes/CreateJ2vMovie/utils/validationUtils');
			validationUtils.validateMovieElements.mockReturnValue(['Movie validation error']);

			mockExecute.getNodeParameter.mockImplementation((paramName: string) => {
				switch (paramName) {
					case 'framerate': return 30;
					case 'output_width': return 1920;
					case 'output_height': return 1080;
					case 'recordId': return '';
					case 'webhookUrl': return '';
					case 'videoUrls.videoDetails': return [{ url: 'https://example.com/video.mp4' }];
					case 'movieTextElements.textDetails': return [{ invalid: 'element' }];
					default: return [];
				}
			});

			expect(() => {
				buildMergeVideosRequestBody.call(mockExecute, 0);
			}).toThrow('Movie element validation errors:\nMovie validation error');
		});
	});

	describe('Integration Scenarios', () => {
		test('should handle complete video merging with all elements', () => {
			mockExecute.getNodeParameter.mockImplementation((paramName: string, index?: number) => {
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
					case 'sceneElements.elementValues':
						return index === 0 ? [{ type: 'audio', src: 'https://example.com/audio.mp3' }] : [];
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

			// Check transition
			expect(result.scenes[1].transition).toEqual({
				style: 'fade',
				duration: 1.5
			});

			// Verify unified processors were called
			expect(mockProcessVideoElements).toHaveBeenCalledTimes(2);
			expect(mockProcessAudioElements).toHaveBeenCalledTimes(1);
		});
	});
});