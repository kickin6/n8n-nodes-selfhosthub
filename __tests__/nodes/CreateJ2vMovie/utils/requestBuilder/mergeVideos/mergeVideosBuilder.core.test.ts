// __tests__/nodes/CreateJ2vMovie/utils/requestBuilder/mergeVideos/mergeVideosBuilder.core.test.ts

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
	...jest.requireActual('@nodes/CreateJ2vMovie/utils/requestBuilder/shared'),
	processVideoElements: jest.fn(),
	processAudioElements: jest.fn(),
	processAllMovieElements: jest.fn(),
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
		mockProcessVideoElements.mockReturnValue([{ type: 'video', src: 'https://example.com/processed-video.mp4' }]);
		mockProcessAudioElements.mockReturnValue([{ type: 'audio', src: 'https://example.com/processed-audio.mp3' }]);

		// Validation mocks return no errors by default
		const validationUtils = require('@nodes/CreateJ2vMovie/utils/validationUtils');
		validationUtils.validateSceneElements.mockReturnValue([]);
		validationUtils.validateMovieElements.mockReturnValue([]);

		// Mock processAllMovieElements
		const shared = require('@nodes/CreateJ2vMovie/utils/requestBuilder/shared');
		shared.processAllMovieElements.mockReturnValue([]);
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
					case 'videoElements.videoDetails': return [{ src: 'https://example.com/video.mp4' }];
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
			expect(result.scenes).toHaveLength(1);
		});

		test('should handle empty recordId', () => {
			mockExecute.getNodeParameter.mockImplementation((paramName: string) => {
				switch (paramName) {
					case 'framerate': return 25;
					case 'output_width': return 1024;
					case 'output_height': return 768;
					case 'recordId': return '';
					case 'webhookUrl': return '';
					case 'videoElements.videoDetails': return [{ src: 'https://example.com/video.mp4' }];
					default: return [];
				}
			});

			const result = buildMergeVideosRequestBody.call(mockExecute, 0);

			expect(result.id).toBe('');
		});

		test('should handle webhook URL configuration', () => {
			mockExecute.getNodeParameter.mockImplementation((paramName: string) => {
				switch (paramName) {
					case 'framerate': return 30;
					case 'output_width': return 1920;
					case 'output_height': return 1080;
					case 'recordId': return 'webhook-test';
					case 'webhookUrl': return 'https://webhook.example.com/callback';
					case 'videoElements.videoDetails': return [{ src: 'https://example.com/video.mp4' }];
					default: return [];
				}
			});

			const result = buildMergeVideosRequestBody.call(mockExecute, 0);

			expect(result.exports).toBeDefined();
			expect(result.exports![0]).toMatchObject({
				destinations: [{
					type: 'webhook',
					endpoint: 'https://webhook.example.com/callback'
				}]
			});
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
					case 'videoElements.videoDetails': return [{
						src: 'https://example.com/video.mp4',
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
				[expect.objectContaining({
					src: 'https://example.com/video.mp4',
					duration: 10,
					volume: 0.8,
					muted: false,
					loop: true,
					fit: 'cover',
					seek: 5,
					speed: 1.5
				})],
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
					case 'videoElements.videoDetails': return [
						{ src: 'https://example.com/video1.mp4', duration: 5 },
						{ src: 'https://example.com/video2.mp4', duration: 8 }
					];
					default: return [];
				}
			});

			buildMergeVideosRequestBody.call(mockExecute, 0);

			expect(mockProcessVideoElements).toHaveBeenCalledTimes(2);
			expect(mockProcessVideoElements).toHaveBeenNthCalledWith(1,
				[expect.objectContaining({ src: 'https://example.com/video1.mp4' })],
				expect.any(Object)
			);
			expect(mockProcessVideoElements).toHaveBeenNthCalledWith(2,
				[expect.objectContaining({ src: 'https://example.com/video2.mp4' })],
				expect.any(Object)
			);
		});

		test('should handle video elements without valid src property', () => {
			mockExecute.getNodeParameter.mockImplementation((paramName: string) => {
				switch (paramName) {
					case 'framerate': return 30;
					case 'output_width': return 1920;
					case 'output_height': return 1080;
					case 'recordId': return '';
					case 'webhookUrl': return '';
					case 'videoElements.videoDetails': return [
						{ duration: 5 }, // Missing src
						{ src: 'https://example.com/video.mp4' },
						{ src: '' }, // Empty src
						{ src: null } // Null src
					];
					default: return [];
				}
			});

			const result = buildMergeVideosRequestBody.call(mockExecute, 0);

			expect(mockProcessVideoElements).toHaveBeenCalledTimes(1); // Only valid src processed
			expect(result.scenes).toHaveLength(4); // All scenes created, but only one has video element
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
					case 'videoElements.videoDetails': return [
						{ src: 'https://example.com/video.mp4' }
					];
					default: return [];
				}
			});

			const result = buildMergeVideosRequestBody.call(mockExecute, 0);

			expect(mockExecute.logger.warn).toHaveBeenCalledWith(
				expect.stringContaining('Failed to process video element')
			);
			expect(result.scenes[0].elements).toHaveLength(0); // No elements added due to error
		});
	});

	describe('Transition Processing', () => {
		test('should apply global transitions', () => {
			mockExecute.getNodeParameter.mockImplementation((paramName: string) => {
				switch (paramName) {
					case 'framerate': return 30;
					case 'output_width': return 1920;
					case 'output_height': return 1080;
					case 'recordId': return '';
					case 'webhookUrl': return '';
					case 'transition': return 'fade';
					case 'transitionDuration': return 2.5;
					case 'videoElements.videoDetails': return [
						{ src: 'https://example.com/video1.mp4' },
						{ src: 'https://example.com/video2.mp4' }
					];
					default: return [];
				}
			});

			const result = buildMergeVideosRequestBody.call(mockExecute, 0);

			expect(result.scenes).toHaveLength(2);
			expect(result.scenes[0].transition).toBeUndefined(); // First scene has no transition
			expect(result.scenes[1].transition).toEqual({
				style: 'fade',
				duration: 2.5
			});
		});

		test('should handle none transition', () => {
			mockExecute.getNodeParameter.mockImplementation((paramName: string) => {
				switch (paramName) {
					case 'framerate': return 30;
					case 'output_width': return 1920;
					case 'output_height': return 1080;
					case 'recordId': return '';
					case 'webhookUrl': return '';
					case 'transition': return 'none';
					case 'transitionDuration': return 1;
					case 'videoElements.videoDetails': return [
						{ src: 'https://example.com/video1.mp4' },
						{ src: 'https://example.com/video2.mp4' }
					];
					default: return [];
				}
			});

			const result = buildMergeVideosRequestBody.call(mockExecute, 0);

			expect(result.scenes[1].transition).toBeUndefined();
		});

		test('should apply video-specific transitions over global', () => {
			mockExecute.getNodeParameter.mockImplementation((paramName: string) => {
				switch (paramName) {
					case 'framerate': return 30;
					case 'output_width': return 1920;
					case 'output_height': return 1080;
					case 'recordId': return '';
					case 'webhookUrl': return '';
					case 'transition': return 'fade';
					case 'transitionDuration': return 1;
					case 'videoElements.videoDetails': return [
						{ src: 'https://example.com/video1.mp4' },
						{
							src: 'https://example.com/video2.mp4',
							transition_style: 'slide',
							transition_duration: 3
						}
					];
					default: return [];
				}
			});

			const result = buildMergeVideosRequestBody.call(mockExecute, 0);

			expect(result.scenes[1].transition).toEqual({
				style: 'slide',
				duration: 3
			});
		});
	});

	describe('Scene Elements Processing with Unified Processors', () => {
		test('should process scene-level audio elements with unified processors', () => {
			mockExecute.getNodeParameter.mockImplementation((paramName: string, itemIndex: number) => {
				switch (paramName) {
					case 'framerate': return 30;
					case 'output_width': return 1920;
					case 'output_height': return 1080;
					case 'recordId': return '';
					case 'webhookUrl': return '';
					case 'videoElements.videoDetails': return [
						{ src: 'https://example.com/video1.mp4' },
						{ src: 'https://example.com/video2.mp4' }
					];
					case 'sceneElements.elementValues':
						return itemIndex === 0 ?
							[{ type: 'audio', src: 'https://example.com/audio1.mp3' }] :
							[{ type: 'audio', src: 'https://example.com/audio2.mp3' }];
					default: return [];
				}
			});

			buildMergeVideosRequestBody.call(mockExecute, 0);

			expect(mockProcessAudioElements).toHaveBeenCalledTimes(2);
			expect(mockProcessAudioElements).toHaveBeenNthCalledWith(1,
				[expect.objectContaining({ type: 'audio', src: 'https://example.com/audio1.mp3' })],
				expect.any(Object)
			);
			expect(mockProcessAudioElements).toHaveBeenNthCalledWith(2,
				[expect.objectContaining({ type: 'audio', src: 'https://example.com/audio2.mp3' })],
				expect.any(Object)
			);
		});

		test('should handle empty scene elements arrays', () => {
			mockExecute.getNodeParameter.mockImplementation((paramName: string) => {
				switch (paramName) {
					case 'framerate': return 30;
					case 'output_width': return 1920;
					case 'output_height': return 1080;
					case 'recordId': return '';
					case 'webhookUrl': return '';
					case 'videoElements.videoDetails': return [
						{ src: 'https://example.com/video.mp4' }
					];
					case 'sceneElements.elementValues': return [];
					default: return [];
				}
			});

			const result = buildMergeVideosRequestBody.call(mockExecute, 0);

			expect(mockProcessAudioElements).not.toHaveBeenCalled();
			expect(result.scenes[0].elements).toHaveLength(1); // Only video element
		});

		test('should handle scene element processing errors gracefully', () => {
			mockProcessAudioElements.mockImplementation(() => {
				throw new Error('Audio processing failed');
			});

			mockExecute.getNodeParameter.mockImplementation((paramName: string, itemIndex: number) => {
				switch (paramName) {
					case 'framerate': return 30;
					case 'output_width': return 1920;
					case 'output_height': return 1080;
					case 'recordId': return '';
					case 'webhookUrl': return '';
					case 'videoElements.videoDetails': return [
						{ src: 'https://example.com/video.mp4' }
					];
					case 'sceneElements.elementValues':
						return [{ type: 'audio', src: 'https://example.com/audio.mp3' }];
					default: return [];
				}
			});

			const result = buildMergeVideosRequestBody.call(mockExecute, 0);

			expect(mockExecute.logger.warn).toHaveBeenCalledWith(
				expect.stringContaining('Failed to process scene element')
			);
			expect(result.scenes[0].elements).toHaveLength(1); // Only video element, failed audio not added
		});
	});

	describe('Movie-Level Elements Integration', () => {
		test('should process movie-level elements', () => {
			const shared = require('@nodes/CreateJ2vMovie/utils/requestBuilder/shared');
			shared.processAllMovieElements.mockReturnValue([
				{ type: 'text', text: 'Movie Title' },
				{ type: 'subtitles', captions: 'Global subtitles' }
			]);

			mockExecute.getNodeParameter.mockImplementation((paramName: string) => {
				switch (paramName) {
					case 'framerate': return 30;
					case 'output_width': return 1920;
					case 'output_height': return 1080;
					case 'recordId': return '';
					case 'webhookUrl': return '';
					case 'videoElements.videoDetails': return [
						{ src: 'https://example.com/video.mp4' }
					];
					case 'movieTextElements.textDetails': return [{
						text: 'Movie Title',
						style: '001',
						duration: 10
					}];
					default: return [];
				}
			});

			const result = buildMergeVideosRequestBody.call(mockExecute, 0);

			expect(result.elements).toBeDefined();
			expect(result.elements).toHaveLength(2);
		});

		test('should not add elements property when no movie elements', () => {
			const shared = require('@nodes/CreateJ2vMovie/utils/requestBuilder/shared');
			shared.processAllMovieElements.mockReturnValue([]);

			mockExecute.getNodeParameter.mockImplementation((paramName: string) => {
				switch (paramName) {
					case 'framerate': return 30;
					case 'output_width': return 1920;
					case 'output_height': return 1080;
					case 'recordId': return '';
					case 'webhookUrl': return '';
					case 'videoElements.videoDetails': return [
						{ src: 'https://example.com/video.mp4' }
					];
					default: return [];
				}
			});

			const result = buildMergeVideosRequestBody.call(mockExecute, 0);

			expect(result.elements).toBeUndefined();
		});
	});

	describe('Edge Cases and Error Handling', () => {
		test('should handle empty video elements array', () => {
			mockExecute.getNodeParameter.mockImplementation((paramName: string) => {
				switch (paramName) {
					case 'framerate': return 30;
					case 'output_width': return 1920;
					case 'output_height': return 1080;
					case 'recordId': return '';
					case 'webhookUrl': return '';
					case 'videoElements.videoDetails': return [];
					default: return [];
				}
			});

			const result = buildMergeVideosRequestBody.call(mockExecute, 0);

			expect(result.scenes).toHaveLength(0);
			expect(mockProcessVideoElements).not.toHaveBeenCalled();
		});

		test('should handle non-array video elements', () => {
			mockExecute.getNodeParameter.mockImplementation((paramName: string) => {
				switch (paramName) {
					case 'framerate': return 30;
					case 'output_width': return 1920;
					case 'output_height': return 1080;
					case 'recordId': return '';
					case 'webhookUrl': return '';
					case 'videoElements.videoDetails': return null;
					default: return [];
				}
			});

			const result = buildMergeVideosRequestBody.call(mockExecute, 0);

			expect(result.scenes).toHaveLength(0);
			expect(mockProcessVideoElements).not.toHaveBeenCalled();
		});

		test('should handle validation errors appropriately', () => {
			const validationUtils = require('@nodes/CreateJ2vMovie/utils/validationUtils');
			validationUtils.validateSceneElements.mockReturnValue(['Scene validation error']);

			mockExecute.getNodeParameter.mockImplementation((paramName: string) => {
				switch (paramName) {
					case 'framerate': return 30;
					case 'output_width': return 1920;
					case 'output_height': return 1080;
					case 'recordId': return '';
					case 'webhookUrl': return '';
					case 'videoElements.videoDetails': return [
						{ src: 'https://example.com/video.mp4' }
					];
					default: return [];
				}
			});

			expect(() => {
				buildMergeVideosRequestBody.call(mockExecute, 0);
			}).toThrow('Scene element validation errors: Scene validation error');
		});

		test('should handle scene element processing try/catch errors', () => {
			mockExecute.getNodeParameter.mockImplementation((paramName: string, itemIndex: number) => {
				switch (paramName) {
					case 'framerate': return 30;
					case 'output_width': return 1920;
					case 'output_height': return 1080;
					case 'recordId': return '';
					case 'webhookUrl': return '';
					case 'videoElements.videoDetails': return [
						{ src: 'https://example.com/video.mp4' }
					];
					case 'sceneElements.elementValues':
						// Return undefined to trigger the try/catch block
						throw new Error('Parameter does not exist');
					default: return [];
				}
			});

			const result = buildMergeVideosRequestBody.call(mockExecute, 0);

			// Should continue processing despite the error
			expect(result.scenes).toHaveLength(1);
			expect(result.scenes[0].elements).toHaveLength(1); // Only video element
		});

		test('should process legacy video elements with textElements', () => {
			mockExecute.getNodeParameter.mockImplementation((paramName: string, itemIndex: number) => {
				switch (paramName) {
					case 'framerate': return 30;
					case 'output_width': return 1920;
					case 'output_height': return 1080;
					case 'recordId': return '';
					case 'webhookUrl': return '';
					case 'videoElements.videoDetails': return [{
						src: 'https://example.com/video.mp4',
						textElements: {
							textDetails: [{
								text: 'Legacy text element',
								style: '001'
							}]
						}
					}];
					default: return [];
				}
			});

			buildMergeVideosRequestBody.call(mockExecute, 0);

			// Should call processTextElement for legacy text elements
			expect(mockProcessTextElement).toHaveBeenCalledWith({
				text: 'Legacy text element',
				style: '001'
			});
		});

		test('should handle legacy video elements with subtitle elements', () => {
			mockExecute.getNodeParameter.mockImplementation((paramName: string, itemIndex: number) => {
				switch (paramName) {
					case 'framerate': return 30;
					case 'output_width': return 1920;
					case 'output_height': return 1080;
					case 'recordId': return '';
					case 'webhookUrl': return '';
					case 'videoElements.videoDetails': return [{
						src: 'https://example.com/video.mp4',
						subtitleElements: {
							subtitleDetails: [{
								captions: 'Legacy subtitle content',
								language: 'en'
							}]
						}
					}];
					default: return [];
				}
			});

			buildMergeVideosRequestBody.call(mockExecute, 0);

			// Should call processSubtitleElement for legacy subtitle elements
			expect(mockProcessSubtitleElement).toHaveBeenCalledWith({
				captions: 'Legacy subtitle content',
				language: 'en'
			});
		});

		test('should handle legacy video elements with generic elements fallback', () => {
			// Mock processElement from elementProcessor
			const mockProcessElement = jest.fn().mockReturnValue({
				type: 'unknown',
				src: 'https://example.com/unknown.file'
			});

			// Mock the elementProcessor module
			jest.doMock('@nodes/CreateJ2vMovie/utils/elementProcessor', () => ({
				processElement: mockProcessElement
			}));

			mockExecute.getNodeParameter.mockImplementation((paramName: string, itemIndex: number) => {
				switch (paramName) {
					case 'framerate': return 30;
					case 'output_width': return 1920;
					case 'output_height': return 1080;
					case 'recordId': return '';
					case 'webhookUrl': return '';
					case 'videoElements.videoDetails': return [{
						src: 'https://example.com/video.mp4',
						elements: {
							elementValues: [{
								type: 'unknown',
								src: 'https://example.com/unknown.file'
							}]
						}
					}];
					default: return [];
				}
			});

			buildMergeVideosRequestBody.call(mockExecute, 0);

			// Should call processElement for unknown element types
			expect(mockProcessElement).toHaveBeenCalledWith(
				{ type: 'unknown', src: 'https://example.com/unknown.file' },
				1920,
				1080
			);
		});

		test('should handle legacy element processing errors gracefully', () => {
			// Mock processElement to throw an error
			const mockProcessElement = jest.fn().mockImplementation(() => {
				throw new Error('Legacy element processing failed');
			});

			jest.doMock('@nodes/CreateJ2vMovie/utils/elementProcessor', () => ({
				processElement: mockProcessElement
			}));

			mockExecute.getNodeParameter.mockImplementation((paramName: string, itemIndex: number) => {
				switch (paramName) {
					case 'framerate': return 30;
					case 'output_width': return 1920;
					case 'output_height': return 1080;
					case 'recordId': return '';
					case 'webhookUrl': return '';
					case 'videoElements.videoDetails': return [{
						src: 'https://example.com/video.mp4',
						elements: {
							elementValues: [{
								type: 'failing',
								src: 'https://example.com/failing.file'
							}]
						}
					}];
					default: return [];
				}
			});

			const result = buildMergeVideosRequestBody.call(mockExecute, 0);

			expect(mockExecute.logger.warn).toHaveBeenCalledWith(
				expect.stringContaining('Failed to process scene element')
			);

			// Should still have the video element despite the failed element processing
			expect(result.scenes[0].elements).toHaveLength(1); // Only video element
		});
	});

	describe('Complete Integration Test', () => {
		test('should build complete request with all features and unified processors', () => {
			const shared = require('@nodes/CreateJ2vMovie/utils/requestBuilder/shared');
			shared.processAllMovieElements.mockReturnValue([
				{ type: 'text', text: 'Global Title' },
				{ type: 'subtitles', captions: 'Global subtitles' }
			]);

			mockExecute.getNodeParameter.mockImplementation((paramName: string, itemIndex: number) => {
				switch (paramName) {
					case 'framerate': return 30;
					case 'output_width': return 1920;
					case 'output_height': return 1080;
					case 'recordId': return 'complete-test';
					case 'webhookUrl': return 'https://webhook.test.com';
					case 'transition': return 'fade';
					case 'transitionDuration': return 1.5;
					case 'videoElements.videoDetails': return [
						{
							src: 'https://example.com/intro.mp4',
							duration: 5,
							volume: 0.8
						},
						{
							src: 'https://example.com/main.mp4',
							duration: -1,
							transition_style: 'slide',
							transition_duration: 2
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
						return itemIndex === 0 ?
							[{ type: 'audio', src: 'https://example.com/audio.mp3' }] :
							[];
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
			expect(result.exports![0].destinations[0].endpoint).toBe('https://webhook.test.com');

			// Check scenes
			expect(result.scenes).toHaveLength(2);

			// Check transitions
			expect(result.scenes[0].transition).toBeUndefined();
			expect(result.scenes[1].transition).toEqual({
				style: 'slide',
				duration: 2
			});

			// Check movie-level elements
			expect(result.elements).toHaveLength(2);

			// Verify unified processors were called
			expect(mockProcessVideoElements).toHaveBeenCalledTimes(2);
			expect(mockProcessAudioElements).toHaveBeenCalledTimes(1);
		});
	});
});