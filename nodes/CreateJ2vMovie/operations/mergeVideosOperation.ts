// nodes/CreateJ2vMovie/operations/mergeVideosOperation.ts

import { INodeProperties } from 'n8n-workflow';
import { completeElementFields } from './shared/elements';
import {
	advancedModeParameters,
	jsonTemplateParameters,
	createAdvancedModeOverrides,
	createBasicModeParams
} from './shared/commonParams';

/**
 * Text element fields specifically for mergeVideos operation
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
		description: 'How long to show text (seconds, -2 = match container, -1 = auto)',
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
		default: 0,
		description: 'Stacking order (-99 to 99, higher values appear on top)',
		typeOptions: {
			minValue: -99,
			maxValue: 99,
		},
	},
];

/**
 * Basic mode parameters for the mergeVideos operation
 * Now using shared definitions to eliminate duplication
 */
export const mergeVideosParameters: INodeProperties[] = [
	// Basic mode common parameters
	...createBasicModeParams('mergeVideos', 'advancedModeMergeVideos'),

	// Video Elements Collection - specific to merging multiple videos
	{
		displayName: 'Video Elements',
		name: 'videoElements',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
		},
		default: {},
		placeholder: 'Add Video',
		displayOptions: {
			show: {
				operation: ['mergeVideos'],
				advancedModeMergeVideos: [false],
			},
		},
		options: [
			{
				name: 'videoDetails',
				displayName: 'Video',
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
						description: 'Duration in seconds (-1 for full video)',
					},
					{
						displayName: 'Speed',
						name: 'speed',
						type: 'number',
						default: 1,
						description: 'Playback speed (1 = normal, 2 = double speed, 0.5 = half speed)',
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
				],
			},
		],
		description: 'Add videos to merge in sequence',
	},
	{
		displayName: 'Movie Elements',
		name: 'movieElements',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
		},
		default: {},
		placeholder: 'Add Movie Element',
		description: 'Elements that appear across all scenes in the merged video',
		displayOptions: {
			show: {
				operation: ['mergeVideos'],
				advancedModeMergeVideos: [false],
			},
		},
		options: [
			{
				name: 'textDetails',
				displayName: 'Text Element',
				values: textElementFields,
			},
			{
				name: 'subtitleDetails',
				displayName: 'Subtitle Element',
				values: [
					{
						displayName: 'Language',
						name: 'language',
						type: 'options',
						options: [
							{ name: 'English', value: 'en' },
							{ name: 'Bulgarian', value: 'bg' },
							{ name: 'Catalan', value: 'ca' },
							{ name: 'Czech', value: 'cs' },
							{ name: 'Danish', value: 'da' },
							{ name: 'Dutch', value: 'nl' },
							{ name: 'Estonian', value: 'et' },
							{ name: 'French', value: 'fr' },
							{ name: 'Finnish', value: 'fi' },
							{ name: 'German', value: 'de' },
							{ name: 'Greek', value: 'el' },
							{ name: 'Hindi', value: 'hi' },
							{ name: 'Hungarian', value: 'hu' },
							{ name: 'Indonesian', value: 'id' },
							{ name: 'Italian', value: 'it' },
							{ name: 'Japanese', value: 'ja' },
							{ name: 'Korean', value: 'ko' },
							{ name: 'Latvian', value: 'lv' },
							{ name: 'Lithuanian', value: 'lt' },
							{ name: 'Malay', value: 'ms' },
							{ name: 'Norwegian', value: 'no' },
							{ name: 'Polish', value: 'pl' },
							{ name: 'Portuguese', value: 'pt' },
							{ name: 'Romanian', value: 'ro' },
							{ name: 'Russian', value: 'ru' },
							{ name: 'Slovak', value: 'sk' },
							{ name: 'Spanish', value: 'es' },
							{ name: 'Swedish', value: 'sv' },
							{ name: 'Thai', value: 'th' },
							{ name: 'Turkish', value: 'tr' },
							{ name: 'Ukrainian', value: 'uk' },
							{ name: 'Vietnamese', value: 'vi' },
							{ name: 'Chinese', value: 'zh' },
						],
						default: 'en',
						description: 'Language code for the subtitles',
						required: true,
					},
					{
						displayName: 'Captions',
						name: 'captions',
						type: 'string',
						default: '',
						description: 'URL to subtitle file (SRT/VTT/ASS) or inline subtitle content',
						required: true,
					},
				],
			},
		],
	},

	// Text Elements Collection - for subtitle-focused text overlays (kept for backward compatibility)
	{
		displayName: 'Text Elements (Subtitles)',
		name: 'textElements',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
		},
		default: {},
		placeholder: 'Add Text Element',
		description: 'Add text overlays, subtitles, or captions to your merged video',
		displayOptions: {
			show: {
				operation: ['mergeVideos'],
				advancedModeMergeVideos: [false],
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

	// Transition Settings - specific to merging videos
	{
		displayName: 'Transition',
		name: 'transition',
		type: 'options',
		options: [
			{ name: 'None', value: 'none' },
			{ name: 'Fade', value: 'fade' },
			{ name: 'Dissolve', value: 'dissolve' },
			{ name: 'Wipe Left', value: 'wipeLeft' },
			{ name: 'Wipe Right', value: 'wipeRight' },
			{ name: 'Wipe Up', value: 'wipeUp' },
			{ name: 'Wipe Down', value: 'wipeDown' },
		],
		default: 'none',
		description: 'Transition effect between videos',
		displayOptions: {
			show: {
				operation: ['mergeVideos'],
				advancedModeMergeVideos: [false],
			},
		},
	},
	{
		displayName: 'Transition Duration',
		name: 'transitionDuration',
		type: 'number',
		default: 1,
		description: 'Duration of transition in seconds',
		displayOptions: {
			show: {
				operation: ['mergeVideos'],
				advancedModeMergeVideos: [false],
				transition: ['fade', 'dissolve', 'wipeLeft', 'wipeRight', 'wipeUp', 'wipeDown'],
			},
		},
	},

	// Output Settings Configuration
	{
		displayName: 'Output Settings',
		name: 'outputSettings',
		type: 'fixedCollection',
		default: {},
		displayOptions: {
			show: {
				operation: ['mergeVideos'],
				advancedModeMergeVideos: [false],
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
						type: 'options',
						options: [
							{ name: 'Low', value: 'low' },
							{ name: 'Medium', value: 'medium' },
							{ name: 'High', value: 'high' },
							{ name: 'Very High', value: 'very_high' },
						],
						default: 'high',
						description: 'Quality of the output video',
					},
					{
						displayName: 'Format',
						name: 'format',
						type: 'options',
						options: [
							{ name: 'MP4', value: 'mp4' },
							{ name: 'WebM', value: 'webm' },
						],
						default: 'mp4',
						description: 'Format of the output video',
					},
				],
			},
		],
		description: 'Configure the output video settings',
	},
];

/**
 * Advanced mode parameter for the mergeVideos operation
 * Now using shared definition
 */
export const mergeVideosAdvancedModeParameter: INodeProperties = advancedModeParameters.mergeVideos;

/**
 * JSON Template parameter for advanced mode
 * Now using shared definition
 */
export const mergeVideosJsonTemplateParameter: INodeProperties = jsonTemplateParameters.mergeVideos;

/**
 * Advanced mode override parameters for mergeVideos operation
 * Now using shared definitions with proper display options
 */
export const mergeVideosAdvancedParameters: INodeProperties[] = createAdvancedModeOverrides(
	'mergeVideos',
	'advancedModeMergeVideos'
);