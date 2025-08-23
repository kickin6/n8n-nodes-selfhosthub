// __tests__/nodes/CreateJ2vMovie/utils/requestBuilder/createMovie/createMovieBuilder.core.test.ts

jest.mock('@nodes/CreateJ2vMovie/utils/elementProcessor', () => ({
	processElement: jest.fn()
}));

import { createMockExecute } from '../shared/mockHelpers';
import { buildCreateMovieRequestBody } from '@nodes/CreateJ2vMovie/utils/requestBuilder';

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

describe('createMovieBuilder - Core Request Building', () => {

	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('Basic Request Structure', () => {

		test('should create basic request structure with default values', () => {
			const mockExecute = createMockExecute({});

			const result = buildCreateMovieRequestBody.call(mockExecute, 0);

			expect(result).toHaveProperty('fps', 25);
			expect(result).toHaveProperty('width', 1024);
			expect(result).toHaveProperty('height', 768);
			expect(result).toHaveProperty('scenes');
			expect(Array.isArray(result.scenes)).toBe(true);
		});

		test('should use default itemIndex when not provided', () => {
			const mockExecute = createMockExecute({});

			// Call without itemIndex parameter to test default value
			const result = buildCreateMovieRequestBody.call(mockExecute);

			expect(result).toHaveProperty('fps', 25);
			expect(result).toHaveProperty('width', 1024);
			expect(result).toHaveProperty('height', 768);
			expect(result).toHaveProperty('scenes');
		});

		test('should set custom dimensions and framerate', () => {
			const mockExecute = createMockExecute({
				framerate: 30,
				output_width: 1920,
				output_height: 1080
			});

			const result = buildCreateMovieRequestBody.call(mockExecute, 0);

			expect(result).toHaveProperty('fps', 30);
			expect(result).toHaveProperty('width', 1920);
			expect(result).toHaveProperty('height', 1080);
		});

		test('should ensure at least one empty scene exists when no scenes provided', () => {
			const mockExecute = createMockExecute({});

			const result = buildCreateMovieRequestBody.call(mockExecute, 0);

			expect(result.scenes).toHaveLength(1);
			expect(result.scenes[0]).toEqual({ elements: [] });
		});
	});

	describe('Optional Parameters', () => {

		test('should trim recordId and set it as id', () => {
			const mockExecute = createMockExecute({
				recordId: '  test-record-123  '
			});

			const result = buildCreateMovieRequestBody.call(mockExecute, 0);

			expect(result).toHaveProperty('id', 'test-record-123');
		});

		test('should handle recordId with only spaces', () => {
			const mockExecute = createMockExecute({
				recordId: '   '
			});

			const result = buildCreateMovieRequestBody.call(mockExecute, 0);

			expect(result).not.toHaveProperty('id');
		});

		test('should trim webhookUrl and create exports array with webhook destination', () => {
			const mockExecute = createMockExecute({
				webhookUrl: '  https://example.com/webhook  '
			});

			const result = buildCreateMovieRequestBody.call(mockExecute, 0);

			expect(result).toHaveProperty('exports');
			expect(result.exports).toHaveLength(1);
			expect(result.exports![0]).toHaveProperty('destinations');
			expect(result.exports![0].destinations).toHaveLength(1);
			expect(result.exports![0].destinations[0]).toEqual({
				type: 'webhook',
				endpoint: 'https://example.com/webhook'
			});
		});

		test('should handle webhookUrl with only spaces', () => {
			const mockExecute = createMockExecute({
				webhookUrl: '   '
			});

			const result = buildCreateMovieRequestBody.call(mockExecute, 0);

			expect(result).not.toHaveProperty('exports');
		});

		test('should set quality parameter when provided', () => {
			const mockExecute = createMockExecute({
				quality: 'high'
			});

			const result = buildCreateMovieRequestBody.call(mockExecute, 0);

			expect(result).toHaveProperty('quality', 'high');
		});

		test('should set different quality values', () => {
			const qualities = ['low', 'medium', 'high', 'ultra-hd'];

			qualities.forEach(quality => {
				const mockExecute = createMockExecute({
					quality: quality
				});

				const result = buildCreateMovieRequestBody.call(mockExecute, 0);

				expect(result).toHaveProperty('quality', quality);
			});
		});

		test('should set cache parameter when defined', () => {
			const mockExecute = createMockExecute({
				cache: true
			});

			const result = buildCreateMovieRequestBody.call(mockExecute, 0);

			expect(result).toHaveProperty('cache', true);
		});

		test('should set cache parameter to false when defined', () => {
			const mockExecute = createMockExecute({
				cache: false
			});

			const result = buildCreateMovieRequestBody.call(mockExecute, 0);

			expect(result).toHaveProperty('cache', false);
		});

		test('should set draft parameter when defined', () => {
			const mockExecute = createMockExecute({
				draft: true
			});

			const result = buildCreateMovieRequestBody.call(mockExecute, 0);

			expect(result).toHaveProperty('draft', true);
		});

		test('should set draft parameter to false when defined', () => {
			const mockExecute = createMockExecute({
				draft: false
			});

			const result = buildCreateMovieRequestBody.call(mockExecute, 0);

			expect(result).toHaveProperty('draft', false);
		});

		test('should handle all parameters together', () => {
			const mockExecute = createMockExecute({
				recordId: '  combined-test-id  ',
				webhookUrl: '  https://combined.example.com/webhook  ',
				quality: 'high'
			});

			const result = buildCreateMovieRequestBody.call(mockExecute, 0);

			expect(result).toHaveProperty('id', 'combined-test-id');
			expect(result).toHaveProperty('exports');
			expect(result.exports![0].destinations[0]).toEqual({
				type: 'webhook',
				endpoint: 'https://combined.example.com/webhook'
			});
			expect(result).toHaveProperty('quality', 'high');
		});
	});

	describe('Client Data and Comments', () => {

		test('should handle valid client-data JSON', () => {
			const mockExecute = createMockExecute({
				'client-data': '{"project": "test", "version": "1.0"}'
			});

			const result = buildCreateMovieRequestBody.call(mockExecute, 0);

			expect(result).toHaveProperty('client-data');
			expect(result['client-data']).toEqual({ project: 'test', version: '1.0' });
		});

		test('should handle invalid client-data JSON', () => {
			const mockExecute = createMockExecute({
				'client-data': '{invalid json}'
			});

			const result = buildCreateMovieRequestBody.call(mockExecute, 0);

			expect(result).not.toHaveProperty('client-data');
		});

		test('should handle empty client-data', () => {
			const mockExecute = createMockExecute({
				'client-data': '{}'
			});

			const result = buildCreateMovieRequestBody.call(mockExecute, 0);

			expect(result).not.toHaveProperty('client-data');
		});

		test('should trim and preserve valid comments', () => {
			const mockExecute = createMockExecute({
				comment: '  test comment  '
			});

			const result = buildCreateMovieRequestBody.call(mockExecute, 0);

			expect(result).toHaveProperty('comment', 'test comment');
		});

		test('should handle empty comments', () => {
			const mockExecute = createMockExecute({
				comment: '   '
			});

			const result = buildCreateMovieRequestBody.call(mockExecute, 0);

			expect(result).not.toHaveProperty('comment');
		});
	});

	describe('Error Handling', () => {

		test('should handle parameter access errors', () => {
			const mockExecute = createMockExecuteFunctions();
			mockExecute.getNodeParameter.mockImplementation((param: string, itemIndex: any, defaultValue: any) => {
				if (param === 'scenes.sceneValues') throw new Error('Scenes access failed');
				return createMockExecute().getNodeParameter(param, itemIndex, defaultValue);
			});

			const result = buildCreateMovieRequestBody.call(mockExecute, 0);

			expect(result).not.toHaveProperty('cache');
			expect(result).not.toHaveProperty('draft');
		});
	});

	describe('Scene Processing Basics', () => {
		test('should process text element and reach break statement', () => {
			const mockProcessElement = require('@nodes/CreateJ2vMovie/utils/elementProcessor').processElement;
			mockProcessElement.mockReturnValueOnce({
				type: 'text',
				text: 'Test text',
				style: '001'
			});

			const mockExecute = createMockExecute({
				'scenes.sceneValues': [{
					elements: {
						elementValues: [
							{
								type: 'text',
								text: 'Test text',
								style: '001',
								start: 0,
								duration: 5
							}
						]
					}
				}]
			});

			const result = buildCreateMovieRequestBody.call(mockExecute, 0);

			expect(result.scenes).toHaveLength(1);
			expect(result.scenes[0].elements).toHaveLength(1);
			expect(result.scenes[0].elements[0]).toHaveProperty('type', 'text');
			expect(result.scenes[0].elements[0]).toHaveProperty('text', 'Test text');
			expect(mockProcessElement).toHaveBeenCalledWith(
				expect.objectContaining({ type: 'text', text: 'Test text' }),
				1024,
				768
			);
		});

		test('should process subtitles element and reach break statement', () => {
			const mockProcessElement = require('@nodes/CreateJ2vMovie/utils/elementProcessor').processElement;
			mockProcessElement.mockReturnValueOnce({
				type: 'subtitles',
				text: 'Test subtitles',
				language: 'en'
			});

			const mockExecute = createMockExecute({
				'scenes.sceneValues': [{
					elements: {
						elementValues: [
							{
								type: 'subtitles',
								text: 'Test subtitles',
								language: 'en',
								start: 0,
								duration: 5
							}
						]
					}
				}]
			});

			const result = buildCreateMovieRequestBody.call(mockExecute, 0);

			expect(result.scenes).toHaveLength(1);
			expect(result.scenes[0].elements).toHaveLength(1);
			expect(result.scenes[0].elements[0]).toHaveProperty('type', 'subtitles');
			expect(result.scenes[0].elements[0]).toHaveProperty('text', 'Test subtitles');
			expect(mockProcessElement).toHaveBeenCalledWith(
				expect.objectContaining({ type: 'subtitles', text: 'Test subtitles' }),
				1024,
				768
			);
		});

		test('should handle scenes with missing element collections', () => {
			const mockExecute = createMockExecute({
				'scenes.sceneValues': [{}]
			});

			const result = buildCreateMovieRequestBody.call(mockExecute, 0);

			expect(result.scenes).toHaveLength(1);
			expect(result.scenes[0].elements).toHaveLength(0);
		});

		test('should handle scene with duration and background color', () => {
			const mockExecute = createMockExecute({
				'scenes.sceneValues': [{
					duration: 10,
					'background-color': '#FF0000',
					comment: 'Test scene',
					elements: { elementValues: [] }
				}]
			});

			const result = buildCreateMovieRequestBody.call(mockExecute, 0);

			expect(result.scenes[0]).toHaveProperty('duration', 10);
			expect(result.scenes[0]).toHaveProperty('background-color', '#FF0000');
			expect(result.scenes[0]).toHaveProperty('comment', 'Test scene');
		});

		test('should handle scene transitions', () => {
			const mockExecute = createMockExecute({
				'scenes.sceneValues': [
					{ elements: { elementValues: [] } },
					{
						transition_style: 'fade',
						transition_duration: 2,
						elements: { elementValues: [] }
					}
				]
			});

			const result = buildCreateMovieRequestBody.call(mockExecute, 0);

			expect(result.scenes[0]).not.toHaveProperty('transition');
			expect(result.scenes[1]).toHaveProperty('transition');
			expect(result.scenes[1].transition!.style).toBe('fade');
			expect(result.scenes[1].transition!.duration).toBe(2);
		});

		test('should filter invalid scene durations', () => {
			const scenarios = [
				{ duration: -1, expectProperty: false, description: 'negative duration' },
				{ duration: 'invalid', expectProperty: false, description: 'invalid string duration' },
				{ duration: 0, expectProperty: false, description: 'zero duration' }
			];

			scenarios.forEach(scenario => {
				const mockExecute = createMockExecute({
					'scenes.sceneValues': [{
						duration: scenario.duration,
						elements: { elementValues: [] }
					}]
				});

				const result = buildCreateMovieRequestBody.call(mockExecute, 0);

				if (scenario.expectProperty) {
					expect(result.scenes[0]).toHaveProperty('duration');
				} else {
					expect(result.scenes[0]).not.toHaveProperty('duration');
				}
			});
		});

		test('should filter invalid transition durations', () => {
			const scenarios = [
				{ duration: 0, expectProperty: false },
				{ duration: 'invalid', expectProperty: false }
			];

			scenarios.forEach(scenario => {
				const mockExecute = createMockExecute({
					'scenes.sceneValues': [
						{ elements: { elementValues: [] } },
						{
							transition_style: 'fade',
							transition_duration: scenario.duration,
							elements: { elementValues: [] }
						}
					]
				});

				const result = buildCreateMovieRequestBody.call(mockExecute, 0);

				expect(result.scenes[1].transition!.style).toBe('fade');
				if (scenario.expectProperty) {
					expect(result.scenes[1].transition).toHaveProperty('duration');
				} else {
					expect(result.scenes[1].transition).not.toHaveProperty('duration');
				}
			});
		});

		test('should filter default background colors and empty comments', () => {
			const scenarios = [
				{ 'background-color': '#000000', expectProperty: false },
				{ comment: '', expectProperty: false },
				{ comment: '   ', expectProperty: false }
			];

			scenarios.forEach(scenario => {
				const mockExecute = createMockExecute({
					'scenes.sceneValues': [{ ...scenario, elements: { elementValues: [] } }]
				});

				const result = buildCreateMovieRequestBody.call(mockExecute, 0);
				const property = Object.keys(scenario)[0];

				expect(result.scenes[0]).not.toHaveProperty(property);
			});
		});

		test('should route and process an image element via shared processor', () => {
			const mockExecute = createMockExecute({
				'scenes.sceneValues': [{
					elements: {
						elementValues: [
							{
								type: 'image',
								src: 'https://example.com/image.png',
								width: 100,
								height: 60,
								start: 0,
								duration: 2,
							}
						]
					}
				}]
			});

			const result = buildCreateMovieRequestBody.call(mockExecute, 0);

			expect(result.scenes).toHaveLength(1);
			expect(result.scenes[0].elements.length).toBeGreaterThan(0);
			expect(result.scenes[0].elements[0]).toHaveProperty('type', 'image');
			expect(result.scenes[0].elements[0]).toHaveProperty('src', 'https://example.com/image.png');
		});

		test('should route and process a voice element via shared processor', () => {
			const mockExecute = createMockExecute({
				'scenes.sceneValues': [{
					elements: {
						elementValues: [
							{
								type: 'voice',
								text: 'Hello world',
								voice: 'en-US-Standard-A',
								start: 0,
								duration: 5,
							}
						]
					}
				}]
			});

			const result = buildCreateMovieRequestBody.call(mockExecute, 0);

			expect(result.scenes).toHaveLength(1);
			expect(result.scenes[0].elements.length).toBeGreaterThan(0);
			expect(result.scenes[0].elements[0]).toHaveProperty('type', 'voice');
			expect(result.scenes[0].elements[0]).toHaveProperty('text', 'Hello world');
			expect(result.scenes[0].elements[0]).toHaveProperty('voice', 'en-US-Standard-A');
		});

	});
});