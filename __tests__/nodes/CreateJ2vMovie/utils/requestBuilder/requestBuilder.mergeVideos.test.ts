import { buildMergeVideosRequestBody, createSubtitleElement, validateMergeVideosElements } from '@nodes/CreateJ2vMovie/utils/requestBuilder';

const createMockExecuteFunctions = () => ({
	getNodeParameter: jest.fn(),
	logger: { debug: jest.fn() },
	getCredentials: jest.fn(),
	getExecutionId: jest.fn(),
	getNode: jest.fn(),
	getWorkflow: jest.fn(),
	getMode: jest.fn(),
	getActivationMode: jest.fn(),
	getRestApiUrl: jest.fn(),
	getInstanceBaseUrl: jest.fn(),
	getTimezone: jest.fn(),
	getExecuteData: jest.fn(),
	sendMessageToUI: jest.fn(),
	helpers: {} as any,
} as any);

describe('requestBuilder - mergeVideos Operation', () => {
	describe('buildRequestBody - mergeVideos Basic Mode', () => {

		test('should handle mergeVideos with invalid video duration', () => {
			const mockExecute = createMockExecuteFunctions();

			mockExecute.getNodeParameter.mockImplementation((param: string, itemIndex: any, defaultValue: any) => {
				if (param === 'recordId') return '';
				if (param === 'webhookUrl') return '';
				if (param === 'transition') return 'none';
				if (param === 'videoElements.videoDetails') {
					return [{ src: 'video.mp4', duration: -5 }];
				}
				if (param === 'textElements.textDetails') return [];
				if (param === 'outputSettings.outputDetails') return {};
				return defaultValue;
			});

			const result = buildMergeVideosRequestBody.call(mockExecute, 0);

			const videoElement = result.scenes[0]?.elements[0];
			expect(videoElement).not.toHaveProperty('duration');
		});

		test('should handle empty video elements gracefully', () => {
			const mockExecute = createMockExecuteFunctions();

			mockExecute.getNodeParameter.mockImplementation((param: string, itemIndex: any, defaultValue: any) => {
				if (param === 'recordId') return '';
				if (param === 'webhookUrl') return '';
				if (param === 'transition') return 'none';
				if (param === 'videoElements.videoDetails') return []; // Empty array
				if (param === 'textElements.textDetails') return [];
				if (param === 'outputSettings.outputDetails') return {};
				return defaultValue;
			});

			// Should not throw error and should return valid request body with empty scenes
			const result = buildMergeVideosRequestBody.call(mockExecute, 0);

			expect(result).toBeDefined();
			expect(result.scenes).toBeDefined();
			expect(result.scenes).toHaveLength(0);
			expect(result).toHaveProperty('width', 1024);
			expect(result).toHaveProperty('height', 768);
			expect(result).toHaveProperty('fps', 30);
		});

		test('should throw error for transition access error', () => {
			const mockExecute = createMockExecuteFunctions();

			mockExecute.getNodeParameter.mockImplementation((param: string, itemIndex: any, defaultValue: any) => {
				if (param === 'recordId') return '';
				if (param === 'webhookUrl') return '';
				if (param === 'transition') {
					throw new Error('Parameter access failed');
				}
				return defaultValue;
			});

			expect(() => {
				buildMergeVideosRequestBody.call(mockExecute, 0);
			}).toThrow('Parameter access failed');
		});

		test('should throw error for video elements access error', () => {
			const mockExecute = createMockExecuteFunctions();

			mockExecute.getNodeParameter.mockImplementation((param: string, itemIndex: any, defaultValue: any) => {
				if (param === 'recordId') return '';
				if (param === 'webhookUrl') return '';
				if (param === 'transition') return 'none';
				if (param === 'videoElements.videoDetails') {
					throw new Error('Access error');
				}
				return defaultValue;
			});

			expect(() => {
				buildMergeVideosRequestBody.call(mockExecute, 0);
			}).toThrow('Access error');
		});

		test('should handle mergeVideos with valid video elements', () => {
			const mockExecute = createMockExecuteFunctions();

			mockExecute.getNodeParameter.mockImplementation((param: string, itemIndex: any, defaultValue: any) => {
				if (param === 'recordId') return '';
				if (param === 'webhookUrl') return '';
				if (param === 'transition') return 'none';
				if (param === 'videoElements.videoDetails') return [{ src: 'video.mp4' }];
				if (param === 'textElements.textDetails') return [];
				if (param === 'outputSettings.outputDetails') return {};
				return defaultValue;
			});

			const result = buildMergeVideosRequestBody.call(mockExecute, 0);

			expect(result).toHaveProperty('width', 1024);
			expect(result).toHaveProperty('height', 768);
			expect(result).toHaveProperty('fps', 30);
		});

		test('should handle video with positive duration', () => {
			const mockExecute = createMockExecuteFunctions();

			mockExecute.getNodeParameter.mockImplementation((param: string, itemIndex: any, defaultValue: any) => {
				if (param === 'recordId') return '';
				if (param === 'webhookUrl') return '';
				if (param === 'transition') return 'fade';
				if (param === 'transitionDuration') return 2;
				if (param === 'videoElements.videoDetails') {
					return [{ src: 'video1.mp4', duration: 10 }, { src: 'video2.mp4', duration: 5 }];
				}
				if (param === 'textElements.textDetails') return [];
				if (param === 'outputSettings.outputDetails') return { width: 1920, height: 1080, fps: 24 };
				return defaultValue;
			});

			const result = buildMergeVideosRequestBody.call(mockExecute, 0);

			expect(result.scenes).toHaveLength(2);
			expect(result.scenes[0].elements[0]).toHaveProperty('duration', 10);
			expect(result.scenes[1].elements[0]).toHaveProperty('duration', 5);
			expect(result.scenes[1]).toHaveProperty('transition');
		});

		test('should handle video with -1 duration', () => {
			const mockExecute = createMockExecuteFunctions();

			mockExecute.getNodeParameter.mockImplementation((param: string, itemIndex: any, defaultValue: any) => {
				if (param === 'recordId') return '';
				if (param === 'webhookUrl') return '';
				if (param === 'transition') return 'none';
				if (param === 'videoElements.videoDetails') {
					return [{ src: 'video.mp4', duration: -1 }];
				}
				if (param === 'textElements.textDetails') return [];
				if (param === 'outputSettings.outputDetails') return {};
				return defaultValue;
			});

			const result = buildMergeVideosRequestBody.call(mockExecute, 0);

			expect(result.scenes[0].elements[0]).toHaveProperty('duration', -1);
		});

		test('should handle video with -2 duration', () => {
			const mockExecute = createMockExecuteFunctions();

			mockExecute.getNodeParameter.mockImplementation((param: string, itemIndex: any, defaultValue: any) => {
				if (param === 'recordId') return '';
				if (param === 'webhookUrl') return '';
				if (param === 'transition') return 'none';
				if (param === 'videoElements.videoDetails') {
					return [{ src: 'video.mp4', duration: -2 }];
				}
				if (param === 'textElements.textDetails') return [];
				if (param === 'outputSettings.outputDetails') return {};
				return defaultValue;
			});

			const result = buildMergeVideosRequestBody.call(mockExecute, 0);

			expect(result.scenes[0].elements[0]).toHaveProperty('duration', -2);
		});

		test('should handle video with speed and volume', () => {
			const mockExecute = createMockExecuteFunctions();

			mockExecute.getNodeParameter.mockImplementation((param: string, itemIndex: any, defaultValue: any) => {
				if (param === 'recordId') return '';
				if (param === 'webhookUrl') return '';
				if (param === 'transition') return 'none';
				if (param === 'videoElements.videoDetails') {
					return [{ src: 'video.mp4', speed: 2, volume: 0.5, start: 10 }];
				}
				if (param === 'textElements.textDetails') return [];
				if (param === 'outputSettings.outputDetails') return {};
				return defaultValue;
			});

			const result = buildMergeVideosRequestBody.call(mockExecute, 0);

			const videoElement = result.scenes[0].elements[0];
			expect(videoElement).toHaveProperty('speed', 2);
			expect(videoElement).toHaveProperty('volume', 0.5);
			expect(videoElement).toHaveProperty('start', 10);
		});

		test('should handle video without src', () => {
			const mockExecute = createMockExecuteFunctions();

			mockExecute.getNodeParameter.mockImplementation((param: string, itemIndex: any, defaultValue: any) => {
				if (param === 'recordId') return '';
				if (param === 'webhookUrl') return '';
				if (param === 'transition') return 'none';
				if (param === 'videoElements.videoDetails') {
					return [{ duration: 10 }]; // No src property
				}
				if (param === 'textElements.textDetails') return [];
				if (param === 'outputSettings.outputDetails') return {};
				return defaultValue;
			});

			const result = buildMergeVideosRequestBody.call(mockExecute, 0);

			expect(result.scenes).toHaveLength(0);
		});

		test('should handle NaN duration', () => {
			const mockExecute = createMockExecuteFunctions();

			mockExecute.getNodeParameter.mockImplementation((param: string, itemIndex: any, defaultValue: any) => {
				if (param === 'recordId') return '';
				if (param === 'webhookUrl') return '';
				if (param === 'transition') return 'none';
				if (param === 'videoElements.videoDetails') {
					return [{ src: 'video.mp4', duration: 'invalid' }]; // Will be NaN
				}
				if (param === 'textElements.textDetails') return [];
				if (param === 'outputSettings.outputDetails') return {};
				return defaultValue;
			});

			const result = buildMergeVideosRequestBody.call(mockExecute, 0);

			expect(result.scenes[0].elements[0]).not.toHaveProperty('duration');
		});

		test('should handle output settings with quality parameter', () => {
			const mockExecute = createMockExecuteFunctions();

			mockExecute.getNodeParameter.mockImplementation((param: string, itemIndex: any, defaultValue: any) => {
				if (param === 'recordId') return '';
				if (param === 'webhookUrl') return '';
				if (param === 'transition') return 'none';
				if (param === 'videoElements.videoDetails') {
					return [{ src: 'video.mp4', duration: 10 }];
				}
				if (param === 'textElements.textDetails') return [];
				if (param === 'outputSettings.outputDetails') {
					return {
						width: 1920,
						height: 1080,
						fps: 24,
						quality: 'high' // This will cover line #116
					};
				}
				return defaultValue;
			});

			const result = buildMergeVideosRequestBody.call(mockExecute, 0);

			expect(result).toHaveProperty('width', 1920);
			expect(result).toHaveProperty('height', 1080);
			expect(result).toHaveProperty('fps', 24);
			expect(result).toHaveProperty('quality', 'high'); // Verify quality is set
			expect(result.scenes).toHaveLength(1);
		});

		// NEW: Test for text elements
		test('should handle video with text elements', () => {
			const mockExecute = createMockExecuteFunctions();

			mockExecute.getNodeParameter.mockImplementation((param: string, itemIndex: any, defaultValue: any) => {
				if (param === 'recordId') return '';
				if (param === 'webhookUrl') return '';
				if (param === 'transition') return 'none';
				if (param === 'videoElements.videoDetails') {
					return [{ src: 'video.mp4', duration: 10 }];
				}
				if (param === 'textElements.textDetails') {
					return [{
						text: 'Hello World',
						style: '001',
						fontFamily: 'Roboto',
						fontSize: '32px',
						fontColor: '#FFFFFF',
						start: 0,
						duration: 5
					}];
				}
				if (param === 'outputSettings.outputDetails') return {};
				return defaultValue;
			});

			const result = buildMergeVideosRequestBody.call(mockExecute, 0);

			expect(result.scenes).toHaveLength(1);
			expect(result.scenes[0].elements).toHaveLength(2); // Video + Text element
			
			const videoElement = result.scenes[0].elements[0];
			const textElement = result.scenes[0].elements[1];
			
			expect(videoElement).toHaveProperty('type', 'video');
			expect(textElement).toHaveProperty('type', 'text');
			expect(textElement).toHaveProperty('text', 'Hello World');
			expect(textElement).toHaveProperty('style', '001');
			expect(textElement).toHaveProperty('start', 0);
			expect(textElement).toHaveProperty('duration', 5);
		});

		test('should handle empty text elements array', () => {
			const mockExecute = createMockExecuteFunctions();

			mockExecute.getNodeParameter.mockImplementation((param: string, itemIndex: any, defaultValue: any) => {
				if (param === 'recordId') return '';
				if (param === 'webhookUrl') return '';
				if (param === 'transition') return 'none';
				if (param === 'videoElements.videoDetails') {
					return [{ src: 'video.mp4', duration: 10 }];
				}
				if (param === 'textElements.textDetails') return []; // Empty text elements
				if (param === 'outputSettings.outputDetails') return {};
				return defaultValue;
			});

			const result = buildMergeVideosRequestBody.call(mockExecute, 0);

			expect(result.scenes).toHaveLength(1);
			expect(result.scenes[0].elements).toHaveLength(1); // Only video element
			expect(result.scenes[0].elements[0]).toHaveProperty('type', 'video');
		});

		test('should throw error for invalid text element', () => {
			const mockExecute = createMockExecuteFunctions();

			mockExecute.getNodeParameter.mockImplementation((param: string, itemIndex: any, defaultValue: any) => {
				if (param === 'recordId') return '';
				if (param === 'webhookUrl') return '';
				if (param === 'transition') return 'none';
				if (param === 'videoElements.videoDetails') {
					return [{ src: 'video.mp4', duration: 10 }];
				}
				if (param === 'textElements.textDetails') {
					return [{
						text: '', // Invalid empty text
						style: '001'
					}];
				}
				if (param === 'outputSettings.outputDetails') return {};
				return defaultValue;
			});

			expect(() => {
				buildMergeVideosRequestBody.call(mockExecute, 0);
			}).toThrow('Text element validation errors');
		});

		test('should handle non-array text elements gracefully', () => {
			const mockExecute = createMockExecuteFunctions();

			mockExecute.getNodeParameter.mockImplementation((param: string, itemIndex: any, defaultValue: any) => {
				if (param === 'recordId') return '';
				if (param === 'webhookUrl') return '';
				if (param === 'transition') return 'none';
				if (param === 'videoElements.videoDetails') {
					return [{ src: 'video.mp4', duration: 10 }];
				}
				if (param === 'textElements.textDetails') return null; // Non-array value
				if (param === 'outputSettings.outputDetails') return {};
				return defaultValue;
			});

			const result = buildMergeVideosRequestBody.call(mockExecute, 0);

			expect(result.scenes).toHaveLength(1);
			expect(result.scenes[0].elements).toHaveLength(1); // Only video element
		});
	});
});

describe('mergeVideosBuilder - Helper Functions', () => {
	
	describe('createSubtitleElement', () => {
		test('should create subtitle element with default settings', () => {
			const result = createSubtitleElement('Test subtitle', 5, 10);

			expect(result).toEqual({
				type: 'text',
				text: 'Test subtitle',
				start: 5,
				duration: 10,
				style: '001',
				position: 'bottom-left',
				x: 50,
				y: 50,
				'fade-in': 0.3,
				'fade-out': 0.3,
				'z-index': 10,
				settings: {
					'font-family': 'Roboto',
					'font-size': '32px',
					'font-weight': '600',
					'font-color': '#FFFFFF',
					'background-color': 'rgba(0, 0, 0, 0.7)',
					'text-align': 'center',
					'vertical-position': 'bottom',
					'horizontal-position': 'center'
				}
			});
		});

		test('should create subtitle element with custom options', () => {
			const customOptions = {
				fontFamily: 'Arial',
				fontSize: '24px',
				fontColor: '#FF0000',
				style: '002'
			};

			const result = createSubtitleElement('Custom subtitle', 2, 8, customOptions);

			expect(result.text).toBe('Custom subtitle');
			expect(result.start).toBe(2);
			expect(result.duration).toBe(8);
			expect(result.style).toBe('002');
			expect(result.settings!['font-family']).toBe('Arial');
			expect(result.settings!['font-size']).toBe('24px');
			expect(result.settings!['font-color']).toBe('#FF0000');
		});

		test('should override default settings with custom options', () => {
			const customOptions = {
				position: 'top-right' as const,
				zIndex: 20,
				fadeIn: 0.5,
				fadeOut: 0.8
			};

			const result = createSubtitleElement('Override test', 0, 5, customOptions);

			expect(result.position).toBe('top-right');
			expect(result['z-index']).toBe(20);
			expect(result['fade-in']).toBe(0.5);
			expect(result['fade-out']).toBe(0.8);
		});
	});

	describe('validateMergeVideosElements', () => {
		test('should pass validation for valid video elements', () => {
			const validVideos = [
				{ src: 'https://example.com/video1.mp4' },
				{ src: 'https://example.com/video2.mp4' }
			];

			expect(() => {
				validateMergeVideosElements(validVideos);
			}).not.toThrow();
		});

		test('should throw error for empty video elements array', () => {
			expect(() => {
				validateMergeVideosElements([]);
			}).toThrow('At least one video element is required for merging videos');
		});

		test('should throw error for non-array video elements', () => {
			expect(() => {
				validateMergeVideosElements(null as any);
			}).toThrow('At least one video element is required for merging videos');

			expect(() => {
				validateMergeVideosElements(undefined as any);
			}).toThrow('At least one video element is required for merging videos');
		});

		test('should throw error for video element without src', () => {
			const invalidVideos = [
				{ src: 'https://example.com/video1.mp4' },
				{ duration: 10 } // Missing src
			];

			expect(() => {
				validateMergeVideosElements(invalidVideos);
			}).toThrow('Video element 2: Source URL is required');
		});

		test('should throw error for video element with empty src', () => {
			const invalidVideos = [
				{ src: '' }, // Empty src
				{ src: '   ' } // Whitespace only src
			];

			expect(() => {
				validateMergeVideosElements(invalidVideos);
			}).toThrow('Video element 1: Source URL is required');
		});

		test('should throw error for video element with non-string src', () => {
			const invalidVideos = [
				{ src: 123 }, // Non-string src
			];

			expect(() => {
				validateMergeVideosElements(invalidVideos);
			}).toThrow('Video element 1: Source URL is required');
		});

		test('should validate multiple video elements with detailed error messages', () => {
			const invalidVideos = [
				{ src: 'https://example.com/video1.mp4' }, // Valid
				{ src: '' }, // Invalid - empty
				{ duration: 10 }, // Invalid - no src
				{ src: 'https://example.com/video4.mp4' }, // Valid
			];

			expect(() => {
				validateMergeVideosElements(invalidVideos);
			}).toThrow('Video element 2: Source URL is required');
		});
	});
});