// nodes/CreateJ2vMovie/operations/createMovieOperation.ts

import { INodeProperties } from 'n8n-workflow';
import { completeElementFields } from './shared/elements';
import {
	advancedModeParameters,
	jsonTemplateParameters,
	createAdvancedModeOverrides,
	createBasicModeParams,
	qualityParameter
} from './shared/commonParams';

/**
 * Text element fields specifically for createMovie operation
 * Using a focused subset of the full text element capabilities
 */
const textElementFields: INodeProperties[] = [
	{
		displayName: 'Text Content',
		name: 'text',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'Enter your text content',
		description: 'The text to display (HTML formatting not supported)',
	},
	{
		displayName: 'Style',
		name: 'style',
		type: 'options',
		default: '001',
		description: 'Text animation style',
		options: [
			{ name: 'Basic (001)', value: '001' },
			{ name: 'Word by Word (002)', value: '002' },
			{ name: 'Character by Character (003)', value: '003' },
			{ name: 'Jumping Letters (004)', value: '004' },
		],
	},
	{
		displayName: 'Font Family',
		name: 'fontFamily',
		type: 'string',
		default: 'Roboto',
		placeholder: 'Roboto, Arial, or custom font URL',
		description: 'Google Font name or URL to custom font file',
	},
	{
		displayName: 'Font Size',
		name: 'fontSize',
		type: 'string',
		default: '32px',
		placeholder: '32px',
		description: 'Font size with units (px, em, rem)',
	},
	{
		displayName: 'Font Weight',
		name: 'fontWeight',
		type: 'options',
		default: '600',
		options: [
			{ name: 'Light (300)', value: '300' },
			{ name: 'Regular (400)', value: '400' },
			{ name: 'Medium (500)', value: '500' },
			{ name: 'Semi-bold (600)', value: '600' },
			{ name: 'Bold (700)', value: '700' },
			{ name: 'Extra Bold (800)', value: '800' },
		],
	},
	{
		displayName: 'Font Color',
		name: 'fontColor',
		type: 'string',
		default: '#FFFFFF',
		placeholder: '#FFFFFF',
		description: 'Text color in hex format',
	},
	{
		displayName: 'Background Color',
		name: 'backgroundColor',
		type: 'string',
		default: '',
		placeholder: '#000000 or rgba(0,0,0,0.7)',
		description: 'Background color behind text (optional)',
	},
	{
		displayName: 'Text Alignment',
		name: 'textAlign',
		type: 'options',
		default: 'center',
		options: [
			{ name: 'Left', value: 'left' },
			{ name: 'Center', value: 'center' },
			{ name: 'Right', value: 'right' },
			{ name: 'Justify', value: 'justify' },
		],
	},
	{
		displayName: 'Vertical Position in Text Canvas',
		name: 'verticalPosition',
		type: 'options',
		default: 'center',
		description: 'Vertical alignment within text canvas',
		options: [
			{ name: 'Top', value: 'top' },
			{ name: 'Center', value: 'center' },
			{ name: 'Bottom', value: 'bottom' },
		],
	},
	{
		displayName: 'Horizontal Position in Text Canvas',
		name: 'horizontalPosition',
		type: 'options',
		default: 'center',
		description: 'Horizontal alignment within text canvas',
		options: [
			{ name: 'Left', value: 'left' },
			{ name: 'Center', value: 'center' },
			{ name: 'Right', value: 'right' },
		],
	},
	{
		displayName: 'Canvas Position Preset',
		name: 'position',
		type: 'options',
		default: 'center-center',
		options: [
			{ name: 'Top Left', value: 'top-left' },
			{ name: 'Top Right', value: 'top-right' },
			{ name: 'Bottom Left', value: 'bottom-left' },
			{ name: 'Bottom Right', value: 'bottom-right' },
			{ name: 'Center', value: 'center-center' },
			{ name: 'Custom', value: 'custom' },
		],
	},
	{
		displayName: 'X Position',
		name: 'x',
		type: 'number',
		default: 0,
		description: 'Horizontal position in pixels (when position is custom)',
		displayOptions: {
			show: {
				position: ['custom'],
			},
		},
	},
	{
		displayName: 'Y Position',
		name: 'y',
		type: 'number',
		default: 0,
		description: 'Vertical position in pixels (when position is custom)',
		displayOptions: {
			show: {
				position: ['custom'],
			},
		},
	},
	{
		displayName: 'Start Time',
		name: 'start',
		type: 'number',
		default: 0,
		description: 'When to start showing text (seconds)',
		typeOptions: {
			numberPrecision: 2,
		},
	},
	{
		displayName: 'Duration',
		name: 'duration',
		type: 'number',
		default: 5,
		description: 'How long to show text (seconds, -2 = match scene, -1 = auto)',
		typeOptions: {
			numberPrecision: 2,
		},
	},
	{
		displayName: 'Fade In Duration',
		name: 'fadeIn',
		type: 'number',
		default: 0.3,
		description: 'Fade in effect duration (seconds)',
		typeOptions: {
			numberPrecision: 2,
			minValue: 0,
		},
	},
	{
		displayName: 'Fade Out Duration',
		name: 'fadeOut',
		type: 'number',
		default: 0.3,
		description: 'Fade out effect duration (seconds)',
		typeOptions: {
			numberPrecision: 2,
			minValue: 0,
		},
	},
	{
		displayName: 'Z-Index',
		name: 'zIndex',
		type: 'number',
		default: 10,
		description: 'Stacking order (-99 to 99, higher values appear on top)',
		typeOptions: {
			minValue: -99,
			maxValue: 99,
		},
	},
];

/**
 * Scene-specific fields for the scenes collection
 */
export const sceneFields: INodeProperties[] = [
	{
		displayName: 'Scene Duration (seconds)',
		name: 'duration',
		type: 'number',
		default: -1,
		description: 'Duration of the scene in seconds (-1 for auto-calculated based on elements)',
	},
	{
		displayName: 'Background Color',
		name: 'background-color',
		type: 'color',
		default: '#000000',
		description: 'Background color for this scene',
	},
	{
		displayName: 'Transition Style',
		name: 'transition_style',
		type: 'options',
		options: [
			{ name: 'None', value: 'none' },
			{ name: 'Fade', value: 'fade' },
			{ name: 'Slide Left', value: 'slideleft' },
			{ name: 'Slide Right', value: 'slideright' },
			{ name: 'Slide Up', value: 'slideup' },
			{ name: 'Slide Down', value: 'slidedown' },
			{ name: 'Circle Open', value: 'circleopen' },
			{ name: 'Circle Close', value: 'circleclose' },
		],
		default: 'none',
		description: 'Transition effect when entering this scene',
	},
	{
		displayName: 'Transition Duration (seconds)',
		name: 'transition_duration',
		type: 'number',
		default: 1,
		description: 'Duration of the transition effect',
		displayOptions: {
			show: {
				transition_style: ['fade', 'slideleft', 'slideright', 'slideup', 'slidedown', 'circleopen', 'circleclose'],
			},
		},
	},
	{
		displayName: 'Scene Comment',
		name: 'comment',
		type: 'string',
		default: '',
		description: 'Internal note for this scene (for reference only)',
	},
	{
		displayName: 'Scene Elements',
		name: 'elements',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
			sortable: true,
		},
		placeholder: 'Add Element to Scene',
		description: 'Elements within this scene',
		default: {},
		options: [
			{
				name: 'elementValues',
				displayName: 'Element',
				values: completeElementFields,
			},
		],
	},
	{
		displayName: 'Scene Text Elements',
		name: 'textElements',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
		},
		default: {},
		placeholder: 'Add Text Element to Scene',
		description: 'Text overlays specific to this scene',
		options: [
			{
				name: 'textDetails',
				displayName: 'Text Element',
				values: textElementFields,
			},
		],
	},
];

/**
 * Basic mode parameters for the createMovie operation
 * Now dramatically simplified using shared definitions
 */
export const createMovieParameters: INodeProperties[] = [
	// Basic mode common parameters (recordId, webhookUrl)
	...createBasicModeParams('createMovie', 'advancedMode'),

	// Movie Settings Section Header
	{
		displayName: 'Movie Settings',
		name: 'movieSettings',
		type: 'notice',
		default: '',
		displayOptions: {
			show: {
				operation: ['createMovie'],
				advancedMode: [false],
			},
		},
	},

	// Movie-level Elements (appear across all scenes)
	{
		displayName: 'Movie Elements',
		name: 'movieElements',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
			sortable: true,
		},
		placeholder: 'Add Movie Element',
		description: 'Elements that appear across all scenes in the movie',
		default: {},
		displayOptions: {
			show: {
				operation: ['createMovie'],
				advancedMode: [false],
			},
		},
		options: [
			{
				name: 'elementValues',
				displayName: 'Element',
				values: completeElementFields, // Using shared element definitions!
			},
		],
	},

	// Movie-level Text Elements (appear across all scenes)
	{
		displayName: 'Movie Text Elements',
		name: 'movieTextElements',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
		},
		default: {},
		placeholder: 'Add Movie Text Element',
		description: 'Text overlays that appear across all scenes in the movie',
		displayOptions: {
			show: {
				operation: ['createMovie'],
				advancedMode: [false],
			},
		},
		options: [
			{
				name: 'textDetails',
				displayName: 'Text Element',
				values: textElementFields,
			},
		],
	},

	// Basic Movie Configuration Parameters
	{
		displayName: 'Cache',
		name: 'cache',
		type: 'boolean',
		default: true,
		description: 'Use cached version if available to speed up processing, or force new render',
		displayOptions: {
			show: {
				operation: ['createMovie'],
				advancedMode: [false],
			},
		},
	},
	{
		displayName: 'Crop',
		name: 'crop',
		type: 'boolean',
		default: false,
		description: 'Whether to crop for clips that do not match the output dimensions',
		displayOptions: {
			show: {
				operation: ['createMovie'],
				advancedMode: [false],
			},
		},
	},
	{
		displayName: 'Framerate',
		name: 'framerate',
		type: 'number',
		typeOptions: {
			numberPrecision: 0,
		},
		default: 25,
		description: 'Framerate of the output video',
		displayOptions: {
			show: {
				operation: ['createMovie'],
				advancedMode: [false],
			},
		},
	},
	{
		displayName: 'Output Width',
		name: 'output_width',
		type: 'number',
		typeOptions: {
			minValue: 10,
			numberPrecision: 0,
		},
		default: 1024,
		required: true,
		description: 'Output width of the video',
		displayOptions: {
			show: {
				operation: ['createMovie'],
				advancedMode: [false],
			},
		},
	},
	{
		displayName: 'Output Height',
		name: 'output_height',
		type: 'number',
		typeOptions: {
			minValue: 10,
			numberPrecision: 0,
		},
		default: 768,
		required: true,
		description: 'Output height of the video',
		displayOptions: {
			show: {
				operation: ['createMovie'],
				advancedMode: [false],
			},
		},
	},
	{
		// Using shared quality parameter with proper display options
		...qualityParameter,
		displayOptions: {
			show: {
				operation: ['createMovie'],
				advancedMode: [false],
			},
		},
	},
	{
		displayName: 'Client Data',
		name: 'client-data',
		type: 'json',
		default: '{}',
		description: 'Custom key-value data attached to the movie, returned in responses and webhooks',
		displayOptions: {
			show: {
				operation: ['createMovie'],
				advancedMode: [false],
			},
		},
	},
	{
		displayName: 'Comment',
		name: 'comment',
		type: 'string',
		default: '',
		description: 'Internal notes or memo for this movie (for reference only)',
		displayOptions: {
			show: {
				operation: ['createMovie'],
				advancedMode: [false],
			},
		},
	},

	// New Scenes Collection
	{
		displayName: 'Scenes',
		name: 'scenes',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
			sortable: true,
		},
		placeholder: 'Add Scene',
		description: 'Scenes in the movie - each scene renders independently and chains sequentially',
		default: {},
		displayOptions: {
			show: {
				operation: ['createMovie'],
				advancedMode: [false],
			},
		},
		options: [
			{
				name: 'sceneValues',
				displayName: 'Scene',
				values: sceneFields,
			},
		],
	},
];

/**
 * Advanced mode parameter for the createMovie operation
 * Now using shared definition
 */
export const createMovieAdvancedModeParameter: INodeProperties = advancedModeParameters.createMovie;

/**
 * JSON Template parameter for advanced mode
 * Now using shared definition
 */
export const createMovieJsonTemplateParameter: INodeProperties = jsonTemplateParameters.createMovie;

/**
 * Advanced mode override parameters for createMovie operation
 * Now using shared definitions with proper display options
 */
export const createMovieAdvancedParameters: INodeProperties[] = createAdvancedModeOverrides(
	'createMovie',
	'advancedMode'
);