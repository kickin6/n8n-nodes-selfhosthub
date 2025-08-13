import { INodeProperties } from 'n8n-workflow';

/**
 * Shared element parameter definitions for JSON2Video operations
 * These definitions are used across createMovie, mergeVideoAudio, and mergeVideos operations
 */

/**
 * Common element fields that apply to all element types
 */
export const commonElementFields: INodeProperties[] = [
        {
                displayName: 'Start Time (seconds)',
                name: 'start',
                type: 'number',
                default: 0,
                description: 'Start time in seconds',
        },
        {
                displayName: 'Duration (seconds)', 
                name: 'duration',
                type: 'number',
                default: 5,
                description: 'Duration in seconds (-2 for full media duration)',
        },
];

/**
 * Position-related fields for visual elements (image, video, text)
 */
export const positionFields: INodeProperties[] = [
        {
                displayName: 'Element Position',
                name: 'positionPreset',
                type: 'options',
                options: [
                        { name: 'Custom (Set X/Y Manually)', value: 'custom' },
                        { name: 'Center', value: 'center' },
                        { name: 'Top-Left', value: 'top_left' },
                        { name: 'Top-Center', value: 'top_center' },
                        { name: 'Top-Right', value: 'top_right' },
                        { name: 'Middle-Left', value: 'middle_left' },
                        { name: 'Middle-Right', value: 'middle_right' },
                        { name: 'Bottom-Left', value: 'bottom_left' },
                        { name: 'Bottom-Center', value: 'bottom_center' },
                        { name: 'Bottom-Right', value: 'bottom_right' },
                ],
                default: 'center',
                description: 'Preset position for the element on screen',
                displayOptions: {
                        show: {
                                type: ['image', 'text', 'video'],
                        },
                },
        },
        {
                displayName: 'Element X Position',
                name: 'x',
                type: 'number',
                default: 0,
                description: 'Custom X position (only used with Custom position)',
                displayOptions: {
                        show: {
                                type: ['image', 'text', 'video'],
                                positionPreset: ['custom'],
                        },
                },
        },
        {
                displayName: 'Element Y Position',
                name: 'y',
                type: 'number',
                default: 0,
                description: 'Custom Y position (only used with Custom position)',
                displayOptions: {
                        show: {
                                type: ['image', 'text', 'video'],
                                positionPreset: ['custom'],
                        },
                },
        },
];

/**
 * Complete element type selector and all fields for image elements
 */
export const imageElementFields: INodeProperties[] = [
        {
                displayName: 'Element Type',
                name: 'type',
                type: 'options',
                options: [
                        { name: 'Image', value: 'image' },
                        { name: 'Video', value: 'video' },
                        { name: 'Text', value: 'text' },
                        { name: 'Audio', value: 'audio' },
                        { name: 'Voice', value: 'voice' },
                        { name: 'Subtitles', value: 'subtitles' },
                ],
                default: 'image',
                description: 'Type of element to add',
        },
        ...commonElementFields,
        {
                displayName: 'Source URL',
                name: 'src',
                type: 'string',
                default: '',
                description: 'URL of the image file',
                displayOptions: {
                        show: {
                                type: ['image'],
                        },
                },
        },
        ...positionFields,
        {
                displayName: 'Element Width',
                name: 'width',
                type: 'number',
                default: 0,
                description: 'Width of the element (0 to use original)',
                displayOptions: {
                        show: {
                                type: ['image'],
                        },
                },
        },
        {
                displayName: 'Element Height',
                name: 'height',
                type: 'number',
                default: 0,
                description: 'Height of the element (0 to use original)',
                displayOptions: {
                        show: {
                                type: ['image'],
                        },
                },
        },
        {
                displayName: 'Zoom',
                name: 'zoom',
                type: 'number',
                default: 0,
                description: 'Zoom level (positive values zoom in)',
                displayOptions: {
                        show: {
                                type: ['image'],
                        },
                },
        },
];

/**
 * Video element specific fields
 */
export const videoElementFields: INodeProperties[] = [
        {
                displayName: 'Source URL',
                name: 'src',
                type: 'string',
                default: '',
                description: 'URL of the video file',
                displayOptions: {
                        show: {
                                type: ['video'],
                        },
                },
        },
        ...positionFields,
        {
                displayName: 'Element Width',
                name: 'width',
                type: 'number',
                default: 0,
                description: 'Width of the element (0 to use original)',
                displayOptions: {
                        show: {
                                type: ['video'],
                        },
                },
        },
        {
                displayName: 'Element Height',
                name: 'height',
                type: 'number',
                default: 0,
                description: 'Height of the element (0 to use original)',
                displayOptions: {
                        show: {
                                type: ['video'],
                        },
                },
        },
        {
                displayName: 'Zoom',
                name: 'zoom',
                type: 'number',
                default: 0,
                description: 'Zoom level (positive values zoom in)',
                displayOptions: {
                        show: {
                                type: ['video'],
                        },
                },
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
                description: 'Volume level (0-1)',
                displayOptions: {
                        show: {
                                type: ['video'],
                        },
                },
        },
        {
                displayName: 'Muted',
                name: 'muted',
                type: 'boolean',
                default: false,
                description: 'Whether the video should be muted',
                displayOptions: {
                        show: {
                                type: ['video'],
                        },
                },
        },
        {
                displayName: 'Crop',
                name: 'crop',
                type: 'boolean',
                default: false,
                description: 'Whether to crop the video to fit dimensions',
                displayOptions: {
                        show: {
                                type: ['video'],
                        },
                },
        },
];

/**
 * Text element specific fields
 */
export const textElementFields: INodeProperties[] = [
        {
                displayName: 'Text Content',
                name: 'text',
                type: 'string',
                default: '',
                description: 'Text content to display',
                displayOptions: {
                        show: {
                                type: ['text'],
                        },
                },
        },
        ...positionFields,
        {
                displayName: 'Font Family',
                name: 'fontFamily',
                type: 'options',
                options: [
                        { name: 'Arial', value: 'Arial' },
                        { name: 'Verdana', value: 'Verdana' },
                        { name: 'Helvetica', value: 'Helvetica' },
                        { name: 'Times New Roman', value: 'Times New Roman' },
                        { name: 'Courier New', value: 'Courier New' },
                        { name: 'Roboto', value: 'Roboto' },
                        { name: 'Open Sans', value: 'Open Sans' },
                ],
                default: 'Arial',
                description: 'Font family for the text',
                displayOptions: {
                        show: {
                                type: ['text'],
                        },
                },
        },
        {
                displayName: 'Font Size',
                name: 'fontSize',
                type: 'number',
                default: 32,
                description: 'Font size in pixels',
                displayOptions: {
                        show: {
                                type: ['text'],
                        },
                },
        },
        {
                displayName: 'Text Color',
                name: 'color',
                type: 'color',
                default: '#ffffff',
                description: 'Text color',
                displayOptions: {
                        show: {
                                type: ['text'],
                        },
                },
        },
];

/**
 * Audio element specific fields
 */
export const audioElementFields: INodeProperties[] = [
        {
                displayName: 'Source URL',
                name: 'src',
                type: 'string',
                default: '',
                description: 'URL of the audio file',
                displayOptions: {
                        show: {
                                type: ['audio'],
                        },
                },
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
                default: 0.8,
                description: 'Volume level (0-1)',
                displayOptions: {
                        show: {
                                type: ['audio'],
                        },
                },
        },
];

/**
 * Voice element specific fields
 */
export const voiceElementFields: INodeProperties[] = [
        {
                displayName: 'Text Content',
                name: 'text',
                type: 'string',
                default: '',
                description: 'Text content to convert to speech',
                displayOptions: {
                        show: {
                                type: ['voice'],
                        },
                },
        },
        {
                displayName: 'Voice',
                name: 'voice',
                type: 'options',
                options: [
                        { name: 'US English (Female)', value: 'en-US-AriaNeural' },
                        { name: 'US English (Male)', value: 'en-US-GuyNeural' },
                        { name: 'British English (Female)', value: 'en-GB-SoniaNeural' },
                        { name: 'British English (Male)', value: 'en-GB-RyanNeural' },
                        { name: 'Australian Female (Natasha)', value: 'en-AU-NatashaNeural' },
                        { name: 'Australian Male (William)', value: 'en-AU-WilliamNeural' },
                ],
                default: 'en-US-AriaNeural',
                description: 'Voice to use for text-to-speech',
                displayOptions: {
                        show: {
                                type: ['voice'],
                        },
                },
        },
];

/**
 * Subtitles element specific fields
 */
export const subtitlesElementFields: INodeProperties[] = [
        {
                displayName: 'Subtitle Source Type',
                name: 'subtitleSourceType',
                type: 'options',
                options: [
                        { name: 'Text', value: 'text' },
                        { name: 'File URL', value: 'src' },
                ],
                default: 'text',
                description: 'Type of subtitle source',
                displayOptions: {
                        show: {
                                type: ['subtitles'],
                        },
                },
        },
        {
                displayName: 'Subtitle Text',
                name: 'text',
                type: 'string',
                default: '',
                description: 'The subtitle text to display',
                displayOptions: {
                        show: {
                                type: ['subtitles'],
                                subtitleSourceType: ['text'],
                        },
                },
        },
        {
                displayName: 'Subtitle File URL',
                name: 'src',
                type: 'string',
                default: '',
                description: 'URL of the subtitle file (SRT, VTT)',
                displayOptions: {
                        show: {
                                type: ['subtitles'],
                                subtitleSourceType: ['src'],
                        },
                },
        },
        {
                displayName: 'Language',
                name: 'language',
                type: 'options',
                options: [
                        { name: 'English', value: 'en' },
                        { name: 'Spanish', value: 'es' },
                        { name: 'French', value: 'fr' },
                        { name: 'German', value: 'de' },
                        { name: 'Chinese', value: 'zh' },
                        { name: 'Japanese', value: 'ja' },
                ],
                default: 'en',
                description: 'Language of the subtitles',
                displayOptions: {
                        show: {
                                type: ['subtitles'],
                        },
                },
        },
        {
                displayName: 'Position',
                name: 'position',
                type: 'options',
                options: [
                        { name: 'Bottom Center', value: 'bottom-center' },
                        { name: 'Top Center', value: 'top-center' },
                ],
                default: 'bottom-center',
                description: 'Position of the subtitles',
                displayOptions: {
                        show: {
                                type: ['subtitles'],
                        },
                },
        },
];

/**
 * Complete element definition combining all element types
 * This is the main export that operation files should use
 */
export const completeElementFields: INodeProperties[] = [
        {
                displayName: 'Element Type',
                name: 'type',
                type: 'options',
                options: [
                        { name: 'Image', value: 'image' },
                        { name: 'Video', value: 'video' },
                        { name: 'Text', value: 'text' },
                        { name: 'Audio', value: 'audio' },
                        { name: 'Voice', value: 'voice' },
                        { name: 'Subtitles', value: 'subtitles' },
                ],
                default: 'image',
                description: 'Type of element to add',
        },
        ...commonElementFields,
        ...imageElementFields.filter(field => field.name !== 'type'), // Exclude duplicate type field
        ...videoElementFields,
        ...textElementFields,
        ...audioElementFields,
        ...voiceElementFields,
        ...subtitlesElementFields,
];