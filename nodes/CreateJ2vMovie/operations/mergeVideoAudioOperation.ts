// nodes/CreateJ2vMovie/operations/mergeVideoAudioOperation.ts

import { INodeProperties } from 'n8n-workflow';
import { subtitlesElementFields } from './shared/elements';
import {
	advancedModeParameters,
	jsonTemplateParameters,
	createAdvancedModeOverrides,
	createBasicModeParams
} from './shared/commonParams';

/**
 * Text element fields specifically for mergeVideoAudio operation
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
		default: 'bottom',
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
		default: 'bottom-left',
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
		default: 50,
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
		default: 50,
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
		default: -2,
		description: 'How long to show text (seconds, -2 = match video, -1 = auto)',
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
 * Basic mode parameters for the mergeVideoAudio operation
 * Now using shared definitions to eliminate duplication
 */
export const mergeVideoAudioParameters: INodeProperties[] = [
	// Basic mode common parameters
	...createBasicModeParams('mergeVideoAudio', 'advancedModeMergeAudio'),

	// Video Element Configuration
	{
		displayName: 'Video Element',
		name: 'videoElement',
		type: 'fixedCollection',
		default: {},
		placeholder: 'Add Video Element',
		displayOptions: {
			show: {
				operation: ['mergeVideoAudio'],
				advancedModeMergeAudio: [false],
			},
		},
		options: [
			{
				name: 'videoDetails',
				displayName: 'Video Details',
				values: [
					{
						displayName: 'Source URL',
						name: 'src',
						type: 'string',
						default: '',
						description: 'URL of the video file',
						required: true,
					},
					{
						displayName: 'Duration',
						name: 'duration',
						type: 'number',
						default: -2,
						description: 'Duration in seconds (-2 uses entire video)',
					},
					{
						displayName: 'Muted',
						name: 'muted',
						type: 'boolean',
						default: false,
						description: 'Whether to mute the video audio',
					},
					{
						displayName: 'Loop',
						name: 'loop',
						type: 'boolean',
						default: false,
						description: 'Whether to loop the video if shorter than scene',
					},
					{
						displayName: 'Crop',
						name: 'crop',
						type: 'boolean',
						default: false,
						description: 'Whether to crop the video to match dimensions',
					},
					{
						displayName: 'Fit',
						name: 'fit',
						type: 'string',
						default: 'cover',
						description: 'How to fit video in frame (cover, contain, or fill)',
					},
					{
						displayName: 'Volume',
						name: 'volume',
						type: 'number',
						typeOptions: {
							minValue: 0,
							maxValue: 1,
							numberPrecision: 2,
						},
						default: 0,
						description: 'Volume level for original video audio (0 = mute, 1 = full volume)',
					},
				],
			},
		],
		description: 'Configure the video source',
	},

	// Audio Element Configuration
	{
		displayName: 'Audio Element',
		name: 'audioElement',
		type: 'fixedCollection',
		default: {},
		placeholder: 'Add Audio Element',
		displayOptions: {
			show: {
				operation: ['mergeVideoAudio'],
				advancedModeMergeAudio: [false],
			},
		},
		options: [
			{
				name: 'audioDetails',
				displayName: 'Audio Details',
				values: [
					{
						displayName: 'Source URL',
						name: 'src',
						type: 'string',
						default: '',
						description: 'URL of the audio file',
						required: true,
					},
					{
						displayName: 'Start Time',
						name: 'start',
						type: 'number',
						default: 0,
						description: 'Start time in seconds (use to trim from beginning)',
					},
					{
						displayName: 'Duration',
						name: 'duration',
						type: 'number',
						default: -1,
						description: 'Duration in seconds (-1 for full audio)',
					},
					{
						displayName: 'Volume',
						name: 'volume',
						type: 'number',
						typeOptions: {
							minValue: 0,
							maxValue: 1,
							numberPrecision: 2,
						},
						default: 1,
						description: 'Volume level (0 = mute, 1 = full volume)',
					},
					{
						displayName: 'Loop',
						name: 'loop',
						type: 'boolean',
						default: false,
						description: 'Loop the audio if shorter than the video',
					},
				],
			},
		],
		description: 'Configure the audio source',
	},

	// Text Elements Collection - NEW: for subtitles and text overlays
	{
		displayName: 'Text Elements (Subtitles)',
		name: 'textElements',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
		},
		default: {},
		placeholder: 'Add Text Element',
		description: 'Add text overlays, subtitles, or captions to your video',
		displayOptions: {
			show: {
				operation: ['mergeVideoAudio'],
				advancedModeMergeAudio: [false],
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

	// Subtitle Elements Collection
	{
		displayName: 'Subtitle Elements',
		name: 'subtitleElements',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
		},
		default: {},
		placeholder: 'Add Subtitle Element',
		description: 'Add subtitles or captions for accessibility',
		displayOptions: {
			show: {
				operation: ['mergeVideoAudio'],
				advancedModeMergeAudio: [false],
			},
		},
		options: [
			{
				name: 'subtitleDetails',
				displayName: 'Subtitle Element',
				values: subtitlesElementFields.filter(field => 
					// Only include subtitle-specific fields, not the type selector
					field.name !== 'type' && 
					field.displayOptions?.show?.type?.includes('subtitles')
				),
			},
		],
	},
	
	// Output Settings Configuration
	{
		displayName: 'Output Settings',
		name: 'outputSettings',
		type: 'fixedCollection',
		default: {},
		displayOptions: {
			show: {
				operation: ['mergeVideoAudio'],
				advancedModeMergeAudio: [false],
			},
		},
		options: [
			{
				name: 'outputDetails',
				displayName: 'Output Details',
				values: [
					{
						displayName: 'Width',
						name: 'width',
						type: 'number',
						typeOptions: {
							minValue: 10,
							numberPrecision: 0,
						},
						default: 1024,
						description: 'Width of the output video in pixels',
					},
					{
						displayName: 'Height',
						name: 'height',
						type: 'number',
						typeOptions: {
							minValue: 10,
							numberPrecision: 0,
						},
						default: 768,
						description: 'Height of the output video in pixels',
					},
					{
						displayName: 'Frame Rate',
						name: 'fps',
						type: 'number',
						typeOptions: {
							numberPrecision: 0,
						},
						default: 30,
						description: 'Frames per second for the output video',
					},
					{
						displayName: 'Quality',
						name: 'quality',
						type: 'string',
						default: 'high',
						description: 'Quality of the output video (low, medium, high, very_high)',
					},
					{
						displayName: 'Format',
						name: 'format',
						type: 'string',
						default: 'mp4',
						description: 'Format of the output video (mp4, webm)',
					},
				],
			},
		],
		description: 'Configure the output video settings',
	},
];

/**
 * Advanced mode parameter for the mergeVideoAudio operation
 * Now using shared definition
 */
export const mergeVideoAudioAdvancedModeParameter: INodeProperties = advancedModeParameters.mergeVideoAudio;

/**
 * JSON Template parameter for advanced mode
 * Now using shared definition
 */
export const mergeVideoAudioJsonTemplateParameter: INodeProperties = jsonTemplateParameters.mergeVideoAudio;

/**
 * Advanced mode override parameters for mergeVideoAudio operation
 * Now using shared definitions with proper display options
 */
export const mergeVideoAudioAdvancedParameters: INodeProperties[] = createAdvancedModeOverrides(
	'mergeVideoAudio',
	'advancedModeMergeAudio'
);