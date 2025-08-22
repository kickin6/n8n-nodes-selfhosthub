// __tests__/nodes/CreateJ2vMovie/utils/elementProcessor.test.ts

import { processElement } from '@nodes/CreateJ2vMovie/utils/elementProcessor';
import { IDataObject, IExecuteFunctions } from 'n8n-workflow';

const mockExecuteFunctions = {} as IExecuteFunctions;

describe('elementProcessor', () => {
	describe('processElement', () => {
		test('should process image element', () => {
			const imageElement: IDataObject = {
				type: 'image',
				src: 'https://example.com/image.jpg',
				positionPreset: 'center',
				width: 100,
				height: 100,
				zoom: 1.5,
				start: 0,
				duration: 5
			};

			const result = processElement.call(mockExecuteFunctions, imageElement, 1920, 1080);

			expect(result).toHaveProperty('type', 'image');
			expect(result).toHaveProperty('src', 'https://example.com/image.jpg');
			expect(result).toHaveProperty('width', 100);
			expect(result).toHaveProperty('height', 100);
			expect(result).toHaveProperty('zoom', 1.5);
		});

		test('should process image element with opacity', () => {
			const imageElement: IDataObject = {
				type: 'image',
				src: 'https://example.com/image.jpg',
				opacity: 0.8,
				start: 0,
				duration: 5
			};

			const result = processElement.call(mockExecuteFunctions, imageElement, 1920, 1080);

			expect(result).toHaveProperty('type', 'image');
			expect(result).toHaveProperty('opacity', 0.8);
		});

		test('should process image element with scale properties', () => {
			const imageElement: IDataObject = {
				type: 'image',
				src: 'https://example.com/image.jpg',
				scaleWidth: 200,
				scaleHeight: 150,
				start: 0,
				duration: 5
			};

			const result = processElement.call(mockExecuteFunctions, imageElement, 1920, 1080);

			expect(result).toHaveProperty('type', 'image');
			expect(result).toHaveProperty('scale', {
				width: 200,
				height: 150
			});
		});

		test('should process image element with only scale width', () => {
			const imageElement: IDataObject = {
				type: 'image',
				src: 'https://example.com/image.jpg',
				scaleWidth: 300,
				start: 0,
				duration: 5
			};

			const result = processElement.call(mockExecuteFunctions, imageElement, 1920, 1080);

			expect(result).toHaveProperty('type', 'image');
			expect(result).toHaveProperty('scale', {
				width: 300,
				height: 0
			});
		});

		test('should process image element with only scale height', () => {
			const imageElement: IDataObject = {
				type: 'image',
				src: 'https://example.com/image.jpg',
				scaleHeight: 250,
				start: 0,
				duration: 5
			};

			const result = processElement.call(mockExecuteFunctions, imageElement, 1920, 1080);

			expect(result).toHaveProperty('type', 'image');
			expect(result).toHaveProperty('scale', {
				width: 0,
				height: 250
			});
		});

		test('should process image element with rotation properties', () => {
			const imageElement: IDataObject = {
				type: 'image',
				src: 'https://example.com/image.jpg',
				rotateAngle: 45,
				rotateSpeed: 2,
				start: 0,
				duration: 5
			};

			const result = processElement.call(mockExecuteFunctions, imageElement, 1920, 1080);

			expect(result).toHaveProperty('type', 'image');
			expect(result).toHaveProperty('rotate', {
				angle: 45,
				speed: 2
			});
		});

		test('should process image element with only rotation angle', () => {
			const imageElement: IDataObject = {
				type: 'image',
				src: 'https://example.com/image.jpg',
				rotateAngle: 90,
				start: 0,
				duration: 5
			};

			const result = processElement.call(mockExecuteFunctions, imageElement, 1920, 1080);

			expect(result).toHaveProperty('type', 'image');
			expect(result).toHaveProperty('rotate', {
				angle: 90,
				speed: 0
			});
		});

		test('should process image element with only rotation speed', () => {
			const imageElement: IDataObject = {
				type: 'image',
				src: 'https://example.com/image.jpg',
				rotateSpeed: 3,
				start: 0,
				duration: 5
			};

			const result = processElement.call(mockExecuteFunctions, imageElement, 1920, 1080);

			expect(result).toHaveProperty('type', 'image');
			expect(result).toHaveProperty('rotate', {
				angle: 0,
				speed: 3
			});
		});

		test('should process image element with all new properties', () => {
			const imageElement: IDataObject = {
				type: 'image',
				src: 'https://example.com/image.jpg',
				opacity: 0.5,
				scaleWidth: 400,
				scaleHeight: 300,
				rotateAngle: 180,
				rotateSpeed: 1,
				start: 0,
				duration: 10
			};

			const result = processElement.call(mockExecuteFunctions, imageElement, 1920, 1080);

			expect(result).toHaveProperty('type', 'image');
			expect(result).toHaveProperty('opacity', 0.5);
			expect(result).toHaveProperty('scale', {
				width: 400,
				height: 300
			});
			expect(result).toHaveProperty('rotate', {
				angle: 180,
				speed: 1
			});
		});

		test('should not add scale object if no scale properties provided', () => {
			const imageElement: IDataObject = {
				type: 'image',
				src: 'https://example.com/image.jpg',
				start: 0,
				duration: 5
			};

			const result = processElement.call(mockExecuteFunctions, imageElement, 1920, 1080);

			expect(result).toHaveProperty('type', 'image');
			expect(result).not.toHaveProperty('scale');
		});

		test('should not add rotate object if no rotation properties provided', () => {
			const imageElement: IDataObject = {
				type: 'image',
				src: 'https://example.com/image.jpg',
				start: 0,
				duration: 5
			};

			const result = processElement.call(mockExecuteFunctions, imageElement, 1920, 1080);

			expect(result).toHaveProperty('type', 'image');
			expect(result).not.toHaveProperty('rotate');
		});

		test('should process video element', () => {
			const videoElement: IDataObject = {
				type: 'video',
				src: 'https://example.com/video.mp4',
				positionPreset: 'center',
				width: 200,
				height: 150,
				zoom: 2,
				duration: 10,
				volume: 0.8,
				muted: false,
				crop: true,
				start: 0
			};

			const result = processElement.call(mockExecuteFunctions, videoElement, 1920, 1080);

			expect(result).toHaveProperty('type', 'video');
			expect(result).toHaveProperty('src', 'https://example.com/video.mp4');
			expect(result).toHaveProperty('width', 200);
			expect(result).toHaveProperty('height', 150);
			expect(result).toHaveProperty('zoom', 2);
			expect(result).toHaveProperty('duration', 10);
			expect(result).toHaveProperty('volume', 0.8);
			expect(result).toHaveProperty('muted', false);
			expect(result).toHaveProperty('crop', true);
		});

		test('should process video element with seek property', () => {
			const videoElement: IDataObject = {
				type: 'video',
				src: 'https://example.com/video.mp4',
				seek: 5,
				start: 0,
				duration: 10
			};

			const result = processElement.call(mockExecuteFunctions, videoElement, 1920, 1080);

			expect(result).toHaveProperty('type', 'video');
			expect(result).toHaveProperty('seek', 5);
		});

		test('should process video element with loop as number', () => {
			const videoElement: IDataObject = {
				type: 'video',
				src: 'https://example.com/video.mp4',
				loop: -1,
				start: 0,
				duration: 10
			};

			const result = processElement.call(mockExecuteFunctions, videoElement, 1920, 1080);

			expect(result).toHaveProperty('type', 'video');
			expect(result).toHaveProperty('loop', -1);
		});

		test('should process video element with speed property', () => {
			const videoElement: IDataObject = {
				type: 'video',
				src: 'https://example.com/video.mp4',
				speed: 1.5,
				start: 0,
				duration: 10
			};

			const result = processElement.call(mockExecuteFunctions, videoElement, 1920, 1080);

			expect(result).toHaveProperty('type', 'video');
			expect(result).toHaveProperty('speed', 1.5);
		});

		test('should process video element with fit mode', () => {
			const videoElement: IDataObject = {
				type: 'video',
				src: 'https://example.com/video.mp4',
				fit: 'contain',
				start: 0,
				duration: 10
			};

			const result = processElement.call(mockExecuteFunctions, videoElement, 1920, 1080);

			expect(result).toHaveProperty('type', 'video');
			expect(result).toHaveProperty('fit', 'contain');
		});

		test('should process video element with invalid fit mode', () => {
			const videoElement: IDataObject = {
				type: 'video',
				src: 'https://example.com/video.mp4',
				fit: 'invalid',
				start: 0,
				duration: 10
			};

			const result = processElement.call(mockExecuteFunctions, videoElement, 1920, 1080);

			expect(result).toHaveProperty('type', 'video');
			expect(result).not.toHaveProperty('fit');
		});

		test('should process audio element', () => {
			const audioElement: IDataObject = {
				type: 'audio',
				src: 'https://example.com/audio.mp3',
				volume: 0.8,
				start: 5,
				duration: 10
			};

			const result = processElement.call(mockExecuteFunctions, audioElement, 1920, 1080);

			expect(result).toHaveProperty('type', 'audio');
			expect(result).toHaveProperty('src', 'https://example.com/audio.mp3');
			expect(result).toHaveProperty('volume', 0.8);
			expect(result).toHaveProperty('start', 5);
			expect(result).toHaveProperty('duration', 10);
		});

		test('should process audio element with loop as number', () => {
			const audioElement: IDataObject = {
				type: 'audio',
				src: 'https://example.com/audio.mp3',
				loop: 0,
				start: 0,
				duration: 10
			};

			const result = processElement.call(mockExecuteFunctions, audioElement, 1920, 1080);

			expect(result).toHaveProperty('type', 'audio');
			expect(result).toHaveProperty('loop', 0);
		});

		test('should process audio element with fade properties', () => {
			const audioElement: IDataObject = {
				type: 'audio',
				src: 'https://example.com/audio.mp3',
				fadeIn: 2,
				fadeOut: 3,
				start: 0,
				duration: 10
			};

			const result = processElement.call(mockExecuteFunctions, audioElement, 1920, 1080);

			expect(result).toHaveProperty('type', 'audio');
			expect(result).toHaveProperty('fade-in', 2);
			expect(result).toHaveProperty('fade-out', 3);
		});

		test('should not process invalid fade values', () => {
			const audioElement: IDataObject = {
				type: 'audio',
				src: 'https://example.com/audio.mp3',
				fadeIn: -1,
				fadeOut: 'invalid',
				start: 0,
				duration: 10
			};

			const result = processElement.call(mockExecuteFunctions, audioElement, 1920, 1080);

			expect(result).toHaveProperty('type', 'audio');
			expect(result).not.toHaveProperty('fade-in');
			expect(result).not.toHaveProperty('fade-out');
		});

		test('should process voice element', () => {
			const voiceElement: IDataObject = {
				type: 'voice',
				text: 'Hello world',
				voice: 'en-US-Standard-A',
				start: 0,
				duration: 5
			};

			const result = processElement.call(mockExecuteFunctions, voiceElement, 1920, 1080);

			expect(result).toHaveProperty('type', 'voice');
			expect(result).toHaveProperty('text', 'Hello world');
			expect(result).toHaveProperty('voice', 'en-US-Standard-A');
		});

		test('should process voice element with rate and pitch', () => {
			const voiceElement: IDataObject = {
				type: 'voice',
				text: 'Hello world',
				voice: 'en-US-Standard-A',
				rate: 1.5,
				pitch: 0.8,
				volume: 0.9,
				start: 0,
				duration: 5
			};

			const result = processElement.call(mockExecuteFunctions, voiceElement, 1920, 1080);

			expect(result).toHaveProperty('type', 'voice');
			expect(result).toHaveProperty('rate', 1.5);
			expect(result).toHaveProperty('pitch', 0.8);
			expect(result).toHaveProperty('volume', 0.9);
		});

		test('should not process invalid rate and pitch values', () => {
			const voiceElement: IDataObject = {
				type: 'voice',
				text: 'Hello world',
				voice: 'en-US-Standard-A',
				rate: 3.0, // Out of range
				pitch: 0.3, // Out of range
				start: 0,
				duration: 5
			};

			const result = processElement.call(mockExecuteFunctions, voiceElement, 1920, 1080);

			expect(result).toHaveProperty('type', 'voice');
			expect(result).not.toHaveProperty('rate');
			expect(result).not.toHaveProperty('pitch');
		});

		test('should throw error for text element type', () => {
			const textElement: IDataObject = {
				type: 'text',
				text: 'Hello World',
				start: 0,
				duration: 5
			};

			expect(() => {
				processElement.call(mockExecuteFunctions, textElement, 1920, 1080);
			}).toThrow('Text elements should be processed using textElementProcessor.processTextElement() for proper API compliance with settings object');
		});

		test('should throw error for subtitles element type', () => {
			const subtitlesElement: IDataObject = {
				type: 'subtitles',
				text: 'Subtitle text',
				start: 0,
				duration: 5
			};

			expect(() => {
				processElement.call(mockExecuteFunctions, subtitlesElement, 1920, 1080);
			}).toThrow('Subtitle elements should be processed using textElementProcessor.processSubtitleElement() for proper API compliance with settings object');
		});

		test('should process unknown element type', () => {
			const unknownElement: IDataObject = {
				type: 'unknown',
				start: 0,
				duration: 5
			};

			const result = processElement.call(mockExecuteFunctions, unknownElement, 1920, 1080);

			expect(result).toEqual({
				type: 'unknown',
				start: 0,
				duration: 5
			});
		});

		test('should process image element without src', () => {
			const imageElement: IDataObject = {
				type: 'image',
				positionPreset: 'center',
				width: 100,
				height: 100,
				start: 0,
				duration: 5
			};

			const result = processElement.call(mockExecuteFunctions, imageElement, 1920, 1080);

			expect(result).toHaveProperty('type', 'image');
			expect(result).not.toHaveProperty('src');
			expect(result).toHaveProperty('width', 100);
		});

		test('should handle position preset in element processor', () => {
			const imageElement: IDataObject = {
				type: 'image',
				src: 'https://example.com/image.jpg',
				positionPreset: 'center',
				width: 400,
				height: 300,
				start: 0,
				duration: 5
			};

			const result = processElement.call(mockExecuteFunctions, imageElement, 1920, 1080);

			expect(result).toHaveProperty('type', 'image');
			expect(result).toHaveProperty('x', 150);
			expect(result).toHaveProperty('y', 250);
			expect(result).toHaveProperty('width', 400);
			expect(result).toHaveProperty('height', 300);
			expect(result).not.toHaveProperty('position');
		});

		test('should process element with only x coordinate', () => {
			const imageElement: IDataObject = {
				type: 'image',
				src: 'https://example.com/image.jpg',
				x: 300,
				width: 200,
				height: 150
			};

			const result = processElement.call(mockExecuteFunctions, imageElement, 1920, 1080);

			expect(result).toHaveProperty('type', 'image');
			expect(result).toHaveProperty('x', 300);
			expect(result).not.toHaveProperty('y');
			expect(result).not.toHaveProperty('position');
		});

		test('should process element with only y coordinate', () => {
			const imageElement: IDataObject = {
				type: 'image',
				src: 'https://example.com/image.jpg',
				y: 400,
				width: 200,
				height: 150
			};

			const result = processElement.call(mockExecuteFunctions, imageElement, 1920, 1080);

			expect(result).toHaveProperty('type', 'image');
			expect(result).toHaveProperty('y', 400);
			expect(result).not.toHaveProperty('x');
			expect(result).not.toHaveProperty('position');
		});

		test('should process element with x=0 and y=0 coordinates', () => {
			const imageElement: IDataObject = {
				type: 'image',
				src: 'https://example.com/image.jpg',
				x: 0,
				y: 0,
				width: 200,
				height: 150
			};

			const result = processElement.call(mockExecuteFunctions, imageElement, 1920, 1080);

			expect(result).toHaveProperty('type', 'image');
			expect(result).toHaveProperty('x', 0);
			expect(result).toHaveProperty('y', 0);
			expect(result).not.toHaveProperty('position');
		});

		test('should process image element with position preset', () => {
			const imageElement: IDataObject = {
				type: 'image',
				src: 'https://example.com/image.jpg',
				position: 'top_left',
				width: 300,
				height: 200,
				start: 0,
				duration: 5
			};

			const result = processElement.call(mockExecuteFunctions, imageElement, 1920, 1080);

			expect(result).toHaveProperty('type', 'image');
			expect(result).toHaveProperty('src', 'https://example.com/image.jpg');
			expect(result).toHaveProperty('x');
			expect(result).toHaveProperty('y');
			expect(result).toHaveProperty('position', 'top-left');
		});

		test('should process video element with center position preset', () => {
			const videoElement: IDataObject = {
				type: 'video',
				src: 'https://example.com/video.mp4',
				position: 'center',
				width: 400,
				height: 300,
				duration: 10,
				volume: 0.8,
				start: 0
			};

			const result = processElement.call(mockExecuteFunctions, videoElement, 1920, 1080);

			expect(result).toHaveProperty('type', 'video');
		});

		test('should process video element with duration -1', () => {
			const videoElement: IDataObject = {
				type: 'video',
				src: 'https://example.com/video.mp4',
				positionPreset: 'center',
				duration: -1,
				start: 0
			};

			const result = processElement.call(mockExecuteFunctions, videoElement, 1920, 1080);

			expect(result).toHaveProperty('type', 'video');
			expect(result).toHaveProperty('duration', -1);
		});

		test('should process video element with duration -2', () => {
			const videoElement: IDataObject = {
				type: 'video',
				src: 'https://example.com/video.mp4',
				positionPreset: 'center',
				duration: -2,
				start: 0
			};

			const result = processElement.call(mockExecuteFunctions, videoElement, 1920, 1080);

			expect(result).toHaveProperty('type', 'video');
			expect(result).toHaveProperty('duration', -2);
		});

		test('should process video element with zero duration', () => {
			const videoElement: IDataObject = {
				type: 'video',
				src: 'https://example.com/video.mp4',
				positionPreset: 'center',
				duration: 0,
				start: 0
			};

			const result = processElement.call(mockExecuteFunctions, videoElement, 1920, 1080);

			expect(result).toHaveProperty('type', 'video');
			expect(result.duration).toBe(0);
		});

		test('should process video element with negative duration other than -1 or -2', () => {
			const videoElement: IDataObject = {
				type: 'video',
				src: 'https://example.com/video.mp4',
				positionPreset: 'center',
				duration: -5,
				start: 0
			};

			const result = processElement.call(mockExecuteFunctions, videoElement, 1920, 1080);

			expect(result).toHaveProperty('type', 'video');
			expect(result).not.toHaveProperty('duration');
		});

		test('should process element without start and duration', () => {
			const imageElement: IDataObject = {
				type: 'image',
				src: 'https://example.com/image.jpg'
			};

			const result = processElement.call(mockExecuteFunctions, imageElement, 1920, 1080);

			expect(result).toHaveProperty('type', 'image');
			expect(result).not.toHaveProperty('start');
			expect(result).not.toHaveProperty('duration');
		});

		test('should process element with undefined start and duration', () => {
			const imageElement: IDataObject = {
				type: 'image',
				src: 'https://example.com/image.jpg',
				start: undefined,
				duration: undefined
			};

			const result = processElement.call(mockExecuteFunctions, imageElement, 1920, 1080);

			expect(result).toHaveProperty('type', 'image');
			expect(result).not.toHaveProperty('start');
			expect(result).not.toHaveProperty('duration');
		});
	});
});