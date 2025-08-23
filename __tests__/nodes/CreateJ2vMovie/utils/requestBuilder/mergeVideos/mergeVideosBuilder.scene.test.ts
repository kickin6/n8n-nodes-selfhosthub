// __tests__/nodes/CreateJ2vMovie/utils/requestBuilder/mergeVideos/mergeVideosBuilder.scene.test.ts

import { buildMergeVideosRequestBody } from '@nodes/CreateJ2vMovie/utils/requestBuilder/mergeVideosBuilder';
import { processAudioElements } from '@nodes/CreateJ2vMovie/utils/requestBuilder/shared';
import { IExecuteFunctions } from 'n8n-workflow';

// Mock unified processors for scene elements
jest.mock('@nodes/CreateJ2vMovie/utils/requestBuilder/shared', () => ({
	...jest.requireActual('@nodes/CreateJ2vMovie/utils/requestBuilder/shared'),
	processVideoElements: jest.fn(),
	processAudioElements: jest.fn(),
	processAllMovieElements: jest.fn(),
}));

jest.mock('@nodes/CreateJ2vMovie/utils/validationUtils', () => ({
	validateSceneElements: jest.fn().mockReturnValue([]),
	validateMovieElements: jest.fn().mockReturnValue([])
}));

describe('mergeVideosBuilder - Scene Elements', () => {
	let mockExecute: jest.Mocked<IExecuteFunctions>;
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
		} as any;

		const shared = require('@nodes/CreateJ2vMovie/utils/requestBuilder/shared');
		shared.processVideoElements.mockReturnValue([{
			type: 'video',
			src: 'https://example.com/video.mp4'
		}]);
		
		mockProcessAudioElements = shared.processAudioElements;
		mockProcessAudioElements.mockReturnValue([{
			type: 'audio',
			src: 'https://example.com/audio.mp3'
		}]);

		shared.processAllMovieElements.mockReturnValue([]);
	});

	describe('Scene-Level Audio Elements', () => {
		test('should process audio elements in first scene', () => {
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
						return itemIndex === 0 ? [{
							type: 'audio',
							src: 'https://example.com/scene-audio.mp3',
							volume: 0.8,
							'fade-in': 1.0,
							'fade-out': 2.0
						}] : [];
					default: return [];
				}
			});

			const result = buildMergeVideosRequestBody.call(mockExecute, 0);

			expect(mockProcessAudioElements).toHaveBeenCalledWith(
				[expect.objectContaining({
					type: 'audio',
					src: 'https://example.com/scene-audio.mp3',
					volume: 0.8,
					'fade-in': 1.0,
					'fade-out': 2.0
				})],
				expect.any(Object)
			);

			expect(result.scenes[0].elements).toHaveLength(2); // Video + audio
		});

		test('should process multiple audio elements in different scenes', () => {
			mockExecute.getNodeParameter.mockImplementation((paramName: string, itemIndex: number) => {
				switch (paramName) {
					case 'framerate': return 30;
					case 'output_width': return 1920;
					case 'output_height': return 1080;
					case 'recordId': return '';
					case 'webhookUrl': return '';
					case 'videoElements.videoDetails': return [
						{ src: 'https://example.com/video1.mp4' },
						{ src: 'https://example.com/video2.mp4' },
						{ src: 'https://example.com/video3.mp4' }
					];
					case 'sceneElements.elementValues':
						if (itemIndex === 0) {
							return [{
								type: 'audio',
								src: 'https://example.com/audio1.mp3',
								volume: 0.5
							}];
						} else if (itemIndex === 1) {
							return [{
								type: 'audio',
								src: 'https://example.com/audio2.mp3',
								volume: 0.8
							}];
						}
						return []; // Third scene has no audio
					default: return [];
				}
			});

			const result = buildMergeVideosRequestBody.call(mockExecute, 0);

			expect(mockProcessAudioElements).toHaveBeenCalledTimes(2);
			expect(mockProcessAudioElements).toHaveBeenNthCalledWith(1,
				[expect.objectContaining({
					type: 'audio',
					src: 'https://example.com/audio1.mp3',
					volume: 0.5
				})],
				expect.any(Object)
			);
			expect(mockProcessAudioElements).toHaveBeenNthCalledWith(2,
				[expect.objectContaining({
					type: 'audio',
					src: 'https://example.com/audio2.mp3',
					volume: 0.8
				})],
				expect.any(Object)
			);

			expect(result.scenes).toHaveLength(3);
			expect(result.scenes[0].elements).toHaveLength(2); // Video + audio
			expect(result.scenes[1].elements).toHaveLength(2); // Video + audio
			expect(result.scenes[2].elements).toHaveLength(1); // Video only
		});

		test('should handle multiple audio elements in single scene', () => {
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
						return [
							{
								type: 'audio',
								src: 'https://example.com/bgmusic.mp3',
								volume: 0.3,
								loop: true
							},
							{
								type: 'audio',
								src: 'https://example.com/sfx.mp3',
								volume: 1.0,
								start: 5
							}
						];
					default: return [];
				}
			});

			const result = buildMergeVideosRequestBody.call(mockExecute, 0);

			expect(mockProcessAudioElements).toHaveBeenCalledWith(
				expect.arrayContaining([
					expect.objectContaining({
						type: 'audio',
						src: 'https://example.com/bgmusic.mp3',
						volume: 0.3,
						loop: true
					}),
					expect.objectContaining({
						type: 'audio',
						src: 'https://example.com/sfx.mp3',
						volume: 1.0,
						start: 5
					})
				]),
				expect.any(Object)
			);
		});
	});

	describe('Scene Elements Validation', () => {
		test('should validate scene elements and throw on errors', () => {
			const validationUtils = require('@nodes/CreateJ2vMovie/utils/validationUtils');
			validationUtils.validateSceneElements.mockReturnValue(['Invalid audio element']);

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
						return [{
							type: 'audio',
							// Missing src - should trigger validation error
						}];
					default: return [];
				}
			});

			expect(() => {
				buildMergeVideosRequestBody.call(mockExecute, 0);
			}).toThrow('Scene element validation errors: Invalid audio element');
		});

		test('should call validation for each scene with elements', () => {
			const validationUtils = require('@nodes/CreateJ2vMovie/utils/validationUtils');

			mockExecute.getNodeParameter.mockImplementation((paramName: string, itemIndex: number) => {
				switch (paramName) {
					case 'framerate': return 30;
					case 'output_width': return 1920;
					case 'output_height': return 1080;
					case 'recordId': return '';
					case 'webhookUrl': return '';
					case 'videoElements.videoDetails': return [
						{ src: 'https://example.com/video1.mp4' },
						{ src: 'https://example.com/video2.mp4' },
						{ src: 'https://example.com/video3.mp4' }
					];
					case 'sceneElements.elementValues':
						return itemIndex < 2 ? [{
							type: 'audio',
							src: `https://example.com/audio${itemIndex + 1}.mp3`
						}] : [];
					default: return [];
				}
			});

			buildMergeVideosRequestBody.call(mockExecute, 0);

			expect(validationUtils.validateSceneElements).toHaveBeenCalledTimes(3);
		});
	});

	describe('Scene Element Processing Errors', () => {
		test('should handle audio processing errors gracefully', () => {
			mockProcessAudioElements.mockImplementation(() => {
				throw new Error('Audio codec not supported');
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
						return [{
							type: 'audio',
							src: 'https://example.com/corrupted-audio.mp3'
						}];
					default: return [];
				}
			});

			const result = buildMergeVideosRequestBody.call(mockExecute, 0);

			expect(mockExecute.logger.warn).toHaveBeenCalledWith(
				expect.stringMatching(/Failed to process scene element.*Audio codec not supported/)
			);

			// Should still have video element despite audio processing failure
			expect(result.scenes[0].elements).toHaveLength(1);
		});

		test('should continue processing other scenes when one fails', () => {
			let callCount = 0;
			mockProcessAudioElements.mockImplementation(() => {
				callCount++;
				if (callCount === 1) {
					throw new Error('First scene audio failed');
				}
				return [{
					type: 'audio',
					src: 'https://example.com/processed-audio.mp3'
				}];
			});

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
						return [{
							type: 'audio',
							src: `https://example.com/audio${itemIndex + 1}.mp3`
						}];
					default: return [];
				}
			});

			const result = buildMergeVideosRequestBody.call(mockExecute, 0);

			expect(mockProcessAudioElements).toHaveBeenCalledTimes(2);
			expect(mockExecute.logger.warn).toHaveBeenCalledTimes(1);

			// First scene should have only video due to audio processing failure
			expect(result.scenes[0].elements).toHaveLength(1);
			// Second scene should have both video and audio
			expect(result.scenes[1].elements).toHaveLength(2);
		});
	});

	describe('Mixed Element Types in Scenes', () => {
		test('should handle different audio element configurations', () => {
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
						return [
							{
								type: 'audio',
								src: 'https://example.com/narration.mp3',
								start: 0,
								duration: 30,
								volume: 0.9,
								'fade-in': 2,
								'fade-out': 3
							},
							{
								type: 'audio',
								src: 'https://example.com/background.mp3',
								start: 5,
								duration: -1,
								volume: 0.2,
								loop: true
							}
						];
					default: return [];
				}
			});

			buildMergeVideosRequestBody.call(mockExecute, 0);

			expect(mockProcessAudioElements).toHaveBeenCalledWith(
				expect.arrayContaining([
					expect.objectContaining({
						type: 'audio',
						src: 'https://example.com/narration.mp3',
						start: 0,
						duration: 30,
						volume: 0.9,
						'fade-in': 2,
						'fade-out': 3
					}),
					expect.objectContaining({
						type: 'audio',
						src: 'https://example.com/background.mp3',
						start: 5,
						duration: -1,
						volume: 0.2,
						loop: true
					})
				]),
				expect.any(Object)
			);
		});

		test('should filter out null/undefined scene elements', () => {
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
						return [
							null,
							{
								type: 'audio',
								src: 'https://example.com/valid-audio.mp3'
							},
							undefined,
							{
								type: 'audio',
								src: 'https://example.com/another-audio.mp3'
							}
						];
					default: return [];
				}
			});

			buildMergeVideosRequestBody.call(mockExecute, 0);

			// Should only process the valid audio elements
			expect(mockProcessAudioElements).toHaveBeenCalledWith(
				expect.arrayContaining([
					expect.objectContaining({
						type: 'audio',
						src: 'https://example.com/valid-audio.mp3'
					}),
					expect.objectContaining({
						type: 'audio',
						src: 'https://example.com/another-audio.mp3'
					})
				]),
				expect.any(Object)
			);
		});
	});

	describe('Scene Elements Edge Cases', () => {
		test('should handle empty scene elements for some scenes', () => {
			mockExecute.getNodeParameter.mockImplementation((paramName: string, itemIndex: number) => {
				switch (paramName) {
					case 'framerate': return 30;
					case 'output_width': return 1920;
					case 'output_height': return 1080;
					case 'recordId': return '';
					case 'webhookUrl': return '';
					case 'videoElements.videoDetails': return [
						{ src: 'https://example.com/video1.mp4' },
						{ src: 'https://example.com/video2.mp4' },
						{ src: 'https://example.com/video3.mp4' }
					];
					case 'sceneElements.elementValues':
						// Only second scene has elements
						return itemIndex === 1 ? [{
							type: 'audio',
							src: 'https://example.com/audio.mp3'
						}] : [];
					default: return [];
				}
			});

			const result = buildMergeVideosRequestBody.call(mockExecute, 0);

			expect(mockProcessAudioElements).toHaveBeenCalledTimes(1);
			expect(result.scenes[0].elements).toHaveLength(1); // Video only
			expect(result.scenes[1].elements).toHaveLength(2); // Video + audio
			expect(result.scenes[2].elements).toHaveLength(1); // Video only
		});

		test('should handle scene elements that are not arrays', () => {
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
						return null; // Not an array
					default: return [];
				}
			});

			const result = buildMergeVideosRequestBody.call(mockExecute, 0);

			expect(mockProcessAudioElements).not.toHaveBeenCalled();
			expect(result.scenes[0].elements).toHaveLength(1); // Video only
		});

		test('should handle large numbers of scene elements efficiently', () => {
			const manyAudioElements = Array.from({ length: 50 }, (_, i) => ({
				type: 'audio',
				src: `https://example.com/audio${i + 1}.mp3`,
				volume: Math.random()
			}));

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
						return manyAudioElements;
					default: return [];
				}
			});

			const startTime = Date.now();
			const result = buildMergeVideosRequestBody.call(mockExecute, 0);
			const endTime = Date.now();

			expect(mockProcessAudioElements).toHaveBeenCalledWith(
				expect.arrayContaining(manyAudioElements),
				expect.any(Object)
			);
			expect(endTime - startTime).toBeLessThan(500); // Should be fast
		});
	});
});