// nodes/CreateJ2vMovie/operations/shared/elements.ts

import { INodeProperties } from 'n8n-workflow';

/**
 * Common element fields that apply to all element types
 */
export const commonElementFields: INodeProperties[] = [
    {
        displayName: 'Start Time (seconds)',
        name: 'start',
        type: 'number',
        default: undefined,
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
    ...commonElementFields,  // FIXED: was commonElementFieldds
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
    {
        displayName: 'Opacity',
        name: 'opacity',
        type: 'number',
        default: 1.0,
        description: 'Opacity level (0.0 = transparent, 1.0 = opaque)',
        typeOptions: {
            minValue: 0,
            maxValue: 1,
            numberPrecision: 2,
        },
        displayOptions: {
            show: {
                type: ['image'],
            },
        },
    },
    // Scale object properties
    {
        displayName: 'Scale Width',
        name: 'scaleWidth',
        type: 'number',
        default: 0,
        description: 'Scale width (0 = no scaling)',
        displayOptions: {
            show: {
                type: ['image'],
            },
        },
    },
    {
        displayName: 'Scale Height',
        name: 'scaleHeight',
        type: 'number',
        default: 0,
        description: 'Scale height (0 = no scaling)',
        displayOptions: {
            show: {
                type: ['image'],
            },
        },
    },
    // Rotate object properties
    {
        displayName: 'Rotation Angle',
        name: 'rotateAngle',
        type: 'number',
        default: 0,
        description: 'Rotation angle in degrees',
        displayOptions: {
            show: {
                type: ['image'],
            },
        },
    },
    {
        displayName: 'Rotation Speed',
        name: 'rotateSpeed',
        type: 'number',
        default: 0,
        description: 'Rotation speed',
        displayOptions: {
            show: {
                type: ['image'],
            },
        },
    },
    {
        displayName: 'Opacity',
        name: 'opacity',
        type: 'number',
        default: 1.0,
        description: 'Opacity level (0.0 = transparent, 1.0 = opaque)',
        typeOptions: {
            minValue: 0,
            maxValue: 1,
            numberPrecision: 2,
        },
        displayOptions: {
            show: {
                type: ['image'],
            },
        },
    },
    {
        displayName: 'Scale Width',
        name: 'scaleWidth',
        type: 'number',
        default: 0,
        description: 'Scale width (0 = no scaling)',
        displayOptions: {
            show: {
                type: ['image'],
            },
        },
    },
    {
        displayName: 'Scale Height',
        name: 'scaleHeight',
        type: 'number',
        default: 0,
        description: 'Scale height (0 = no scaling)',
        displayOptions: {
            show: {
                type: ['image'],
            },
        },
    },
    {
        displayName: 'Rotation Angle',
        name: 'rotateAngle',
        type: 'number',
        default: 0,
        description: 'Rotation angle in degrees',
        displayOptions: {
            show: {
                type: ['image'],
            },
        },
    },
    {
        displayName: 'Rotation Speed',
        name: 'rotateSpeed',
        type: 'number',
        default: 0,
        description: 'Rotation speed',
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
    // SCHEMA DELTA FIX: Add loop as number type (not boolean)
    {
        displayName: 'Loop',
        name: 'loop',
        type: 'options',
        options: [
            { name: 'Play Once', value: 0 },
            { name: 'Loop Infinitely', value: -1 },
        ],
        default: 0,
        description: 'Loop behavior (0 = play once, -1 = infinite loop)',
        displayOptions: {
            show: {
                type: ['video'],
            },
        },
    },
    // SCHEMA DELTA FIX: Add complete fit enum options
    {
        displayName: 'Fit Mode',
        name: 'fit',
        type: 'options',
        options: [
            { name: 'Cover (Crop to Fill)', value: 'cover' },
            { name: 'Contain (Fit Inside)', value: 'contain' },
            { name: 'Fill (Stretch)', value: 'fill' },
            { name: 'Fit (Best Fit)', value: 'fit' },
        ],
        default: 'cover',
        description: 'How video should fit within the specified dimensions',
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
    // NEW: Adding seek property per Schema Delta List
    {
        displayName: 'Seek (Start Offset)',
        name: 'seek',
        type: 'number',
        default: 0,
        description: 'Starting offset in seconds within the video file',
        typeOptions: {
            minValue: 0,
            numberPrecision: 2,
        },
        displayOptions: {
            show: {
                type: ['video'],
            },
        },
    },
];

/**
 * Enhanced text element specific fields with all API properties
 */
export const textElementFields: INodeProperties[] = [
    {
        displayName: 'Text Content',
        name: 'text',
        type: 'string',
        required: true,
        default: '',
        description: 'Text content to display',
        displayOptions: {
            show: {
                type: ['text'],
            },
        },
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
            { name: 'Typewriter (005)', value: '005' },
            { name: 'Slide In (006)', value: '006' },
        ],
        displayOptions: {
            show: {
                type: ['text'],
            },
        },
    },
    ...positionFields,

    // Font settings (go into settings object)
    {
        displayName: 'Font Family',
        name: 'fontFamily',
        type: 'string',
        default: 'Roboto',
        placeholder: 'Roboto, Arial, or custom font URL',
        description: 'Google Font name or URL to custom font file',
        displayOptions: {
            show: {
                type: ['text'],
            },
        },
    },
    {
        displayName: 'Font Size',
        name: 'fontSize',
        type: 'string',
        default: '32px',
        placeholder: '32px',
        description: 'Font size with units (px, em, rem)',
        displayOptions: {
            show: {
                type: ['text'],
            },
        },
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
        displayOptions: {
            show: {
                type: ['text'],
            },
        },
    },
    {
        displayName: 'Font Color',
        name: 'fontColor',
        type: 'string',
        default: '#FFFFFF',
        placeholder: '#FFFFFF',
        description: 'Text color in hex format',
        displayOptions: {
            show: {
                type: ['text'],
            },
        },
    },
    {
        displayName: 'Background Color',
        name: 'backgroundColor',
        type: 'string',
        default: '',
        placeholder: '#000000 or rgba(0,0,0,0.7)',
        description: 'Background color behind text (optional)',
        displayOptions: {
            show: {
                type: ['text'],
            },
        },
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
        displayOptions: {
            show: {
                type: ['text'],
            },
        },
    },

    // Advanced text styling
    {
        displayName: 'Line Height',
        name: 'lineHeight',
        type: 'string',
        default: '',
        placeholder: '1.2 or 32px',
        description: 'Line height (number or with units)',
        displayOptions: {
            show: {
                type: ['text'],
            },
        },
    },
    {
        displayName: 'Letter Spacing',
        name: 'letterSpacing',
        type: 'string',
        default: '',
        placeholder: '2px',
        description: 'Letter spacing with units',
        displayOptions: {
            show: {
                type: ['text'],
            },
        },
    },
    {
        displayName: 'Text Shadow',
        name: 'textShadow',
        type: 'string',
        default: '',
        placeholder: '2px 2px 4px rgba(0,0,0,0.5)',
        description: 'CSS text shadow',
        displayOptions: {
            show: {
                type: ['text'],
            },
        },
    },
    {
        displayName: 'Text Transform',
        name: 'textTransform',
        type: 'options',
        default: 'none',
        options: [
            { name: 'None', value: 'none' },
            { name: 'Uppercase', value: 'uppercase' },
            { name: 'Lowercase', value: 'lowercase' },
            { name: 'Capitalize', value: 'capitalize' },
        ],
        displayOptions: {
            show: {
                type: ['text'],
            },
        },
    },

    // Position settings within text canvas
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
        displayOptions: {
            show: {
                type: ['text'],
            },
        },
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
        displayOptions: {
            show: {
                type: ['text'],
            },
        },
    },

    // Dimensions
    {
        displayName: 'Width',
        name: 'width',
        type: 'number',
        default: -1,
        description: 'Text canvas width in pixels (-1 for auto)',
        displayOptions: {
            show: {
                type: ['text'],
            },
        },
    },
    {
        displayName: 'Height',
        name: 'height',
        type: 'number',
        default: -1,
        description: 'Text canvas height in pixels (-1 for auto)',
        displayOptions: {
            show: {
                type: ['text'],
            },
        },
    },

    // Effects and animation
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
        displayOptions: {
            show: {
                type: ['text'],
            },
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
        displayOptions: {
            show: {
                type: ['text'],
            },
        },
    },
    {
        displayName: 'Pan Direction',
        name: 'pan',
        type: 'options',
        default: '',
        options: [
            { name: 'None', value: '' },
            { name: 'Left', value: 'left' },
            { name: 'Right', value: 'right' },
            { name: 'Top', value: 'top' },
            { name: 'Bottom', value: 'bottom' },
            { name: 'Top Left', value: 'top-left' },
            { name: 'Top Right', value: 'top-right' },
            { name: 'Bottom Left', value: 'bottom-left' },
            { name: 'Bottom Right', value: 'bottom-right' },
        ],
        description: 'Pan animation direction',
        displayOptions: {
            show: {
                type: ['text'],
            },
        },
    },
    {
        displayName: 'Pan Distance',
        name: 'panDistance',
        type: 'number',
        default: 0.1,
        description: 'Pan animation distance (0.01 to 0.5)',
        typeOptions: {
            numberPrecision: 2,
            minValue: 0.01,
            maxValue: 0.5,
        },
        displayOptions: {
            show: {
                type: ['text'],
                pan: ['left', 'right', 'top', 'bottom', 'top-left', 'top-right', 'bottom-left', 'bottom-right'],
            },
        },
    },
    {
        displayName: 'Zoom',
        name: 'zoom',
        type: 'number',
        default: 0,
        description: 'Zoom level (-10 to 10, positive values zoom in)',
        typeOptions: {
            numberPrecision: 2,
            minValue: -10,
            maxValue: 10,
        },
        displayOptions: {
            show: {
                type: ['text'],
            },
        },
    },

    // Additional properties
    {
        displayName: 'Extra Time',
        name: 'extraTime',
        type: 'number',
        default: 0,
        description: 'Extra time after element ends (seconds)',
        typeOptions: {
            numberPrecision: 2,
        },
        displayOptions: {
            show: {
                type: ['text'],
            },
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
        displayOptions: {
            show: {
                type: ['text'],
            },
        },
    },
    {
        displayName: 'Cache',
        name: 'cache',
        type: 'boolean',
        default: true,
        description: 'Whether to cache this element',
        displayOptions: {
            show: {
                type: ['text'],
            },
        },
    },
    {
        displayName: 'Comment',
        name: 'comment',
        type: 'string',
        default: '',
        description: 'Internal comment for this element',
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
    // SCHEMA DELTA FIX: Add loop as number type (not boolean)
    {
        displayName: 'Loop',
        name: 'loop',
        type: 'options',
        options: [
            { name: 'Play Once', value: 0 },
            { name: 'Loop Infinitely', value: -1 },
        ],
        default: 0,
        description: 'Loop behavior (0 = play once, -1 = infinite loop)',
        displayOptions: {
            show: {
                type: ['audio'],
            },
        },
    },
    // SCHEMA DELTA FIX: Add fade properties per API schema
    {
        displayName: 'Fade In Duration',
        name: 'fadeIn',
        type: 'number',
        default: 0,
        description: 'Fade in duration (seconds)',
        typeOptions: {
            minValue: 0,
            numberPrecision: 2,
        },
        displayOptions: {
            show: {
                type: ['audio'],
            },
        },
    },
    {
        displayName: 'Fade Out Duration',
        name: 'fadeOut',
        type: 'number',
        default: 0,
        description: 'Fade out duration (seconds)',
        typeOptions: {
            minValue: 0,
            numberPrecision: 2,
        },
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
    // SCHEMA DELTA FIX: Add rate validation (0.5-2.0 range)
    {
        displayName: 'Speech Rate',
        name: 'rate',
        type: 'number',
        default: 1.0,
        description: 'Speech rate (0.5 = slow, 1.0 = normal, 2.0 = fast)',
        typeOptions: {
            minValue: 0.5,
            maxValue: 2.0,
            numberPrecision: 2,
        },
        displayOptions: {
            show: {
                type: ['voice'],
            },
        },
    },
    // SCHEMA DELTA FIX: Add pitch validation (0.5-2.0 range)
    {
        displayName: 'Speech Pitch',
        name: 'pitch',
        type: 'number',
        default: 1.0,
        description: 'Speech pitch (0.5 = low, 1.0 = normal, 2.0 = high)',
        typeOptions: {
            minValue: 0.5,
            maxValue: 2.0,
            numberPrecision: 2,
        },
        displayOptions: {
            show: {
                type: ['voice'],
            },
        },
    },
];

/**
 * Complete subtitles element specific fields with proper settings object support
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
    // SCHEMA DELTA FIX: Add language at root level (not in settings)
    {
        displayName: 'Language',
        name: 'language',
        type: 'options',
        options: [
            { name: 'English', value: 'en' },
            { name: 'Spanish', value: 'es' },
            { name: 'French', value: 'fr' },
            { name: 'German', value: 'de' },
            { name: 'Italian', value: 'it' },
            { name: 'Portuguese', value: 'pt' },
            { name: 'Dutch', value: 'nl' },
            { name: 'Russian', value: 'ru' },
            { name: 'Chinese (Simplified)', value: 'zh' },
            { name: 'Japanese', value: 'ja' },
            { name: 'Korean', value: 'ko' },
            { name: 'Arabic', value: 'ar' },
        ],
        default: 'en',
        description: 'Language of the subtitles (ISO 639-1)',
        displayOptions: {
            show: {
                type: ['subtitles'],
            },
        },
    },
    // SCHEMA DELTA FIX: Add model at root level (not in settings)
    {
        displayName: 'Transcription Model',
        name: 'model',
        type: 'options',
        options: [
            { name: 'Default (Most Accurate)', value: 'default' },
            { name: 'Whisper (More Languages)', value: 'whisper' },
        ],
        default: 'default',
        description: 'AI model for subtitle generation',
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
            { name: 'Top Left', value: 'top-left' },
            { name: 'Top Center', value: 'top-center' },
            { name: 'Top Right', value: 'top-right' },
            { name: 'Center Left', value: 'center-left' },
            { name: 'Center Center', value: 'center-center' },
            { name: 'Center Right', value: 'center-right' },
            { name: 'Bottom Left', value: 'bottom-left' },
            { name: 'Bottom Center', value: 'bottom-center' },
            { name: 'Bottom Right', value: 'bottom-right' },
            { name: 'Mid Bottom Center', value: 'mid-bottom-center' },
            { name: 'Mid Top Center', value: 'mid-top-center' },
        ],
        default: 'bottom-center',
        description: 'Position of the subtitles',
        displayOptions: {
            show: {
                type: ['subtitles'],
            },
        },
    },

    // Settings object properties - Font settings
    {
        displayName: 'Font Family',
        name: 'fontFamily',
        type: 'string',
        default: 'Arial',
        description: 'Font family for subtitles',
        displayOptions: {
            show: {
                type: ['subtitles'],
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
                type: ['subtitles'],
            },
        },
    },
    {
        displayName: 'Font Weight',
        name: 'fontWeight',
        type: 'options',
        default: '400',
        options: [
            { name: 'Light (300)', value: '300' },
            { name: 'Regular (400)', value: '400' },
            { name: 'Medium (500)', value: '500' },
            { name: 'Semi-bold (600)', value: '600' },
            { name: 'Bold (700)', value: '700' },
            { name: 'Extra Bold (800)', value: '800' },
        ],
        displayOptions: {
            show: {
                type: ['subtitles'],
            },
        },
    },
    {
        displayName: 'Font Color',
        name: 'fontColor',
        type: 'string',
        default: '#FFFFFF',
        description: 'Text color in hex format',
        displayOptions: {
            show: {
                type: ['subtitles'],
            },
        },
    },
    {
        displayName: 'Background Color',
        name: 'backgroundColor',
        type: 'string',
        default: '',
        placeholder: '#000000 or rgba(0,0,0,0.7)',
        description: 'Background color behind subtitles (optional)',
        displayOptions: {
            show: {
                type: ['subtitles'],
            },
        },
    },
    {
        displayName: 'Border',
        name: 'border',
        type: 'string',
        default: '',
        placeholder: '2px solid #FFFFFF',
        description: 'CSS border property',
        displayOptions: {
            show: {
                type: ['subtitles'],
            },
        },
    },
    {
        displayName: 'Border Radius',
        name: 'borderRadius',
        type: 'string',
        default: '',
        placeholder: '4px',
        description: 'Border radius for background',
        displayOptions: {
            show: {
                type: ['subtitles'],
            },
        },
    },
    {
        displayName: 'Text Align',
        name: 'textAlign',
        type: 'options',
        default: 'center',
        options: [
            { name: 'Left', value: 'left' },
            { name: 'Center', value: 'center' },
            { name: 'Right', value: 'right' },
            { name: 'Justify', value: 'justify' },
        ],
        displayOptions: {
            show: {
                type: ['subtitles'],
            },
        },
    },
    {
        displayName: 'Line Height',
        name: 'lineHeight',
        type: 'string',
        default: '1.2',
        placeholder: '1.2 or 32px',
        description: 'Line height (number or with units)',
        displayOptions: {
            show: {
                type: ['subtitles'],
            },
        },
    },
    {
        displayName: 'Letter Spacing',
        name: 'letterSpacing',
        type: 'string',
        default: '',
        placeholder: '1px',
        description: 'Letter spacing with units',
        displayOptions: {
            show: {
                type: ['subtitles'],
            },
        },
    },
    // SCHEMA DELTA FIX: Add text-shadow property that was missing
    {
        displayName: 'Text Shadow',
        name: 'textShadow',
        type: 'string',
        default: '2px 2px 4px rgba(0,0,0,0.8)',
        placeholder: '2px 2px 4px rgba(0,0,0,0.8)',
        description: 'CSS text shadow for better readability',
        displayOptions: {
            show: {
                type: ['subtitles'],
            },
        },
    },
    {
        displayName: 'Text Transform',
        name: 'textTransform',
        type: 'options',
        default: 'none',
        options: [
            { name: 'None', value: 'none' },
            { name: 'Uppercase', value: 'uppercase' },
            { name: 'Lowercase', value: 'lowercase' },
            { name: 'Capitalize', value: 'capitalize' },
        ],
        displayOptions: {
            show: {
                type: ['subtitles'],
            },
        },
    },
    {
        displayName: 'Vertical Position in Subtitle Area',
        name: 'verticalPosition',
        type: 'options',
        default: 'bottom',
        options: [
            { name: 'Top', value: 'top' },
            { name: 'Center', value: 'center' },
            { name: 'Bottom', value: 'bottom' },
        ],
        description: 'Vertical alignment within subtitle area',
        displayOptions: {
            show: {
                type: ['subtitles'],
            },
        },
    },
    {
        displayName: 'Horizontal Position in Subtitle Area',
        name: 'horizontalPosition',
        type: 'options',
        default: 'center',
        options: [
            { name: 'Left', value: 'left' },
            { name: 'Center', value: 'center' },
            { name: 'Right', value: 'right' },
        ],
        description: 'Horizontal alignment within subtitle area',
        displayOptions: {
            show: {
                type: ['subtitles'],
            },
        },
    },
    {
        displayName: 'Padding',
        name: 'padding',
        type: 'string',
        default: '',
        placeholder: '8px 16px',
        description: 'CSS padding for subtitle background',
        displayOptions: {
            show: {
                type: ['subtitles'],
            },
        },
    },
    {
        displayName: 'Margin',
        name: 'margin',
        type: 'string',
        default: '',
        placeholder: '0 20px 20px 20px',
        description: 'CSS margin around subtitles',
        displayOptions: {
            show: {
                type: ['subtitles'],
            },
        },
    },
    {
        displayName: 'Max Width',
        name: 'maxWidth',
        type: 'string',
        default: '',
        placeholder: '80% or 600px',
        description: 'Maximum width of subtitle area',
        displayOptions: {
            show: {
                type: ['subtitles'],
            },
        },
    },
    {
        displayName: 'Word Wrap',
        name: 'wordWrap',
        type: 'options',
        default: 'break-word',
        options: [
            { name: 'Normal', value: 'normal' },
            { name: 'Break Word', value: 'break-word' },
            { name: 'Break All', value: 'break-all' },
        ],
        displayOptions: {
            show: {
                type: ['subtitles'],
            },
        },
    },
    {
        displayName: 'White Space',
        name: 'whiteSpace',
        type: 'options',
        default: 'normal',
        options: [
            { name: 'Normal', value: 'normal' },
            { name: 'Pre', value: 'pre' },
            { name: 'Pre Line', value: 'pre-line' },
            { name: 'Pre Wrap', value: 'pre-wrap' },
            { name: 'No Wrap', value: 'nowrap' },
        ],
        displayOptions: {
            show: {
                type: ['subtitles'],
            },
        },
    },
    {
        displayName: 'Opacity',
        name: 'opacity',
        type: 'number',
        default: 1,
        description: 'Subtitle opacity (0-1)',
        typeOptions: {
            numberPrecision: 2,
            minValue: 0,
            maxValue: 1,
        },
        displayOptions: {
            show: {
                type: ['subtitles'],
            },
        },
    },

    // Timing properties (direct properties, not in settings)
    {
        displayName: 'Start Time',
        name: 'start',
        type: 'number',
        default: 0,
        description: 'When to start showing subtitles (seconds)',
        typeOptions: {
            numberPrecision: 2,
        },
        displayOptions: {
            show: {
                type: ['subtitles'],
            },
        },
    },
    {
        displayName: 'Duration',
        name: 'duration',
        type: 'number',
        default: -2,
        description: 'How long to show subtitles (seconds, -2 = match container, -1 = auto)',
        typeOptions: {
            numberPrecision: 2,
        },
        displayOptions: {
            show: {
                type: ['subtitles'],
            },
        },
    },
    {
        displayName: 'Extra Time',
        name: 'extraTime',
        type: 'number',
        default: 0,
        description: 'Extra time after element ends (seconds)',
        typeOptions: {
            numberPrecision: 2,
        },
        displayOptions: {
            show: {
                type: ['subtitles'],
            },
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
        displayOptions: {
            show: {
                type: ['subtitles'],
            },
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
        displayOptions: {
            show: {
                type: ['subtitles'],
            },
        },
    },
    {
        displayName: 'Z-Index',
        name: 'zIndex',
        type: 'number',
        default: 50,
        description: 'Stacking order (-99 to 99, higher values appear on top)',
        typeOptions: {
            minValue: -99,
            maxValue: 99,
        },
        displayOptions: {
            show: {
                type: ['subtitles'],
            },
        },
    },
    {
        displayName: 'Cache',
        name: 'cache',
        type: 'boolean',
        default: true,
        description: 'Whether to cache this element',
        displayOptions: {
            show: {
                type: ['subtitles'],
            },
        },
    },
    {
        displayName: 'Comment',
        name: 'comment',
        type: 'string',
        default: '',
        description: 'Internal comment for this element',
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
    ...commonElementFields,  // FIXED: was commonElementFieldds (line ~1251)
    ...imageElementFields.filter(field => field.name !== 'type' &&
        field.name !== 'start' &&
        field.name !== 'duration'), // Exclude duplicate fields
    ...videoElementFields,
    ...textElementFields,
    ...audioElementFields,
    ...voiceElementFields,
    ...subtitlesElementFields,
];

/**
 * Enhanced interfaces for element parameters
 */
export interface TextSettings {
    // Font properties
    'font-family'?: string;
    'font-size'?: string;
    'font-weight'?: string | number;
    'font-color'?: string;
    'background-color'?: string;
    'text-align'?: 'left' | 'center' | 'right' | 'justify';
    'line-height'?: string;
    'letter-spacing'?: string;
    'text-shadow'?: string;
    'text-transform'?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';

    // Position properties within text canvas
    'vertical-position'?: 'top' | 'center' | 'bottom';
    'horizontal-position'?: 'left' | 'center' | 'right';

    // Additional CSS properties (extensible)
    [key: string]: string | number | undefined;
}

export interface ChromaKey {
    color: string; // Color to make transparent (e.g., "#00b140")
    tolerance?: number; // Sensitivity (1-100, default: 25)
}

export interface Correction {
    brightness?: number; // -1 to 1, default: 0
    contrast?: number; // -1000 to 1000, default: 1
    gamma?: number; // 0.1 to 10, default: 1
    saturation?: number; // 0 to 3, default: 1
}

export interface Crop {
    height: number;
    width: number;
    x?: number; // default: 0
    y?: number; // default: 0
}

export interface Rotate {
    angle: number; // -360 to 360, default: 0
    speed?: number; // Time to complete rotation, default: 0
}

export interface TextElement {
    // Required properties
    type: 'text';
    text: string;

    // Optional core properties
    id?: string; // default: "@randomString"
    cache?: boolean; // default: true
    comment?: string;
    condition?: string;

    // Visual effects
    'chroma-key'?: ChromaKey;
    correction?: Correction;
    crop?: Crop;

    // Timing properties
    duration?: number; // default: -2 (match container duration)
    'extra-time'?: number; // default: 0
    start?: number; // default: 0
    'fade-in'?: number;
    'fade-out'?: number;

    // Transform properties
    'flip-horizontal'?: boolean; // default: false
    'flip-vertical'?: boolean; // default: false
    height?: number; // default: -1
    width?: number; // default: -1
    mask?: string; // URL to PNG or video mask

    // Animation properties
    pan?: 'left' | 'top' | 'right' | 'bottom' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    'pan-crop'?: boolean; // default: true
    'pan-distance'?: number; // 0.01 to 0.5, default: 0.1
    rotate?: Rotate;
    zoom?: number; // -10 to 10

    // Position properties
    position?: 'top-left' | 'top-right' | 'bottom-right' | 'bottom-left' | 'center-center' | 'custom'; // default: 'custom'
    x?: number; // default: 0 (when position is 'custom')
    y?: number; // default: 0 (when position is 'custom')
    'z-index'?: number; // -99 to 99, default: 0

    // Resize mode
    resize?: 'cover' | 'fill' | 'fit' | 'contain';

    // Text-specific properties
    style?: string; // default: "001"
    settings?: TextSettings;

    // Variables
    variables?: Record<string, any>;
}

// Node.js parameter interface for the text element
export interface TextElementParams {
    // Basic text properties
    displayName?: string;
    text: string;
    style?: string;

    // Font settings
    fontFamily?: string;
    fontSize?: string;
    fontWeight?: string | number;
    fontColor?: string;
    backgroundColor?: string;
    textAlign?: 'left' | 'center' | 'right' | 'justify';
    lineHeight?: string;
    letterSpacing?: string;
    textShadow?: string;
    textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';

    // Position within text canvas
    verticalPosition?: 'top' | 'center' | 'bottom';
    horizontalPosition?: 'left' | 'center' | 'right';

    // Element positioning
    position?: 'top-left' | 'top-right' | 'bottom-right' | 'bottom-left' | 'center-center' | 'custom';
    x?: number;
    y?: number;
    zIndex?: number;

    // Timing
    start?: number;
    duration?: number;
    extraTime?: number;
    fadeIn?: number;
    fadeOut?: number;

    // Transform
    width?: number;
    height?: number;
    resize?: 'cover' | 'fill' | 'fit' | 'contain';
    flipHorizontal?: boolean;
    flipVertical?: boolean;

    // Effects
    chromaKeyColor?: string;
    chromaKeyTolerance?: number;
    brightness?: number;
    contrast?: number;
    gamma?: number;
    saturation?: number;

    // Animation
    pan?: 'left' | 'top' | 'right' | 'bottom' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    panCrop?: boolean;
    panDistance?: number;
    zoom?: number;
    rotateAngle?: number;
    rotateSpeed?: number;

    // Advanced
    mask?: string;
    condition?: string;
    cache?: boolean;
    comment?: string;

    // Custom settings
    customSettings?: Record<string, any>;
    variables?: Record<string, any>;
}

export interface SubtitleElement {
    type: 'subtitles';
    text?: string;
    src?: string;
    captions?: string;  // NEW: Auto-detection property (URL or inline content)
    language?: string;  // SCHEMA DELTA FIX: Now at root level
    model?: string;     // SCHEMA DELTA FIX: Now at root level
    position?: string;
    settings?: SubtitleSettings;

    // Direct properties (not in settings)
    id?: string;
    cache?: boolean;
    comment?: string;
    condition?: string;
    start?: number;
    duration?: number;
    'extra-time'?: number;
    'fade-in'?: number;
    'fade-out'?: number;
    'z-index'?: number;
    variables?: Record<string, any>;
}

export interface SubtitleSettings {
    'font-family'?: string;
    'font-size'?: number;  // Changed from string | number to number
    'font-weight'?: string;  // Keep as string for values like "600", "bold"
    'font-color'?: string;
    'background-color'?: string;
    border?: string;
    'border-radius'?: string;
    'text-align'?: 'left' | 'center' | 'right' | 'justify';
    'line-height'?: string;
    'letter-spacing'?: string;
    'text-shadow'?: string;  // SCHEMA DELTA FIX: Added missing property
    'text-transform'?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
    'vertical-position'?: 'top' | 'center' | 'bottom';
    'horizontal-position'?: 'left' | 'center' | 'right';
    padding?: string;
    margin?: string;
    'max-width'?: string;
    'word-wrap'?: 'normal' | 'break-word' | 'break-all';
    'white-space'?: 'normal' | 'pre' | 'pre-line' | 'pre-wrap' | 'nowrap';
    opacity?: number;
    [key: string]: string | number | undefined;
}

// SCHEMA DELTA FIX: Updated SubtitleElementParams interface
export interface SubtitleElementParams {
    // Basic subtitle properties - Updated to match API schema
    text?: string;                    // Existing property - inline subtitle content
    src?: string;                     // Existing property - URL to subtitle file  
    captions?: string;                // NEW: Auto-detection property (URL or inline content)
    language?: string;                // MOVED: Now root-level (ISO language code)
    model?: string;                   // MOVED: Now root-level (transcription model)

    // Existing source type property
    subtitleSourceType?: 'text' | 'src';

    // Position and styling properties
    position?: 'top-left' | 'top-right' | 'bottom-right' | 'bottom-left' | 'center-center' | 'custom' | 'bottom-center' | 'top-center';

    // Timing properties (existing)
    start?: number;
    duration?: number;
    extraTime?: number;
    fadeIn?: number;
    fadeOut?: number;
    zIndex?: number;

    // Font and styling properties (existing)
    fontFamily?: string;
    fontSize?: number;  // Changed to number only
    fontWeight?: string;  // Keep as string
    fontColor?: string;
    backgroundColor?: string;
    textAlign?: 'left' | 'center' | 'right' | 'justify';
    lineHeight?: string;
    letterSpacing?: string;
    textShadow?: string;  // SCHEMA DELTA FIX: Added missing property
    textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
    border?: string;
    borderRadius?: string;

    // Layout properties (existing)
    verticalPosition?: 'top' | 'center' | 'bottom';
    horizontalPosition?: 'left' | 'center' | 'right';
    padding?: string;
    margin?: string;
    maxWidth?: string;
    wordWrap?: 'normal' | 'break-word' | 'break-all';
    whiteSpace?: 'normal' | 'pre' | 'pre-line' | 'pre-wrap' | 'nowrap';
    opacity?: number;

    // Core element properties (existing)
    cache?: boolean;
    comment?: string;
    condition?: string;
    variables?: Record<string, any>;
}