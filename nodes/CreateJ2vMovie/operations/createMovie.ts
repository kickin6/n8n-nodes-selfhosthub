import { INodeProperties } from 'n8n-workflow';

/**
 * Basic mode parameters for the createMovie operation, organized alphabetically
 * except for recordId and webhookUrl which remain at the top
 */
export const createMovieParameters: INodeProperties[] = [
        // Keep recordId and webhookUrl at the top
        {
                displayName: 'Record ID',
                name: 'recordId',
                type: 'string',
                required: true,
                default: '=',
                description: 'The Record ID to associate with this movie',
                displayOptions: {
                        show: {
                                operation: ['createMovie'],
                                advancedMode: [false],
                        },
                },
        },
        {
                displayName: 'Webhook URL',
                name: 'webhookUrl',
                type: 'string',
                default: '=',
                required: true,
                description: 'The webhook URL for status updates',
                displayOptions: {
                        show: {
                                operation: ['createMovie'],
                                advancedMode: [false],
                        },
                },
        },
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
        
        // Movie Elements collection (elements that appear across all scenes)
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
                options: [
                        {
                                name: 'elementValues',
                                displayName: 'Element',
                                values: [
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
                                                description: 'Type of element to add to all scenes',
                                        },
                                        // Start and duration fields
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
                                        // Image & Video shared fields
                                        {
                                                displayName: 'Source URL',
                                                name: 'src',
                                                type: 'string',
                                                default: '',
                                                description: 'URL of the image or video file',
                                                displayOptions: {
                                                        show: {
                                                                type: ['image', 'video', 'audio'],
                                                        },
                                                },
                                        },
                                        // Image specific fields
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
                                        // Width and height for images
                                        {
                                                displayName: 'Element Width',
                                                name: 'width',
                                                type: 'number',
                                                default: 0,
                                                description: 'Width of the element (0 to use original)',
                                                displayOptions: {
                                                        show: {
                                                                type: ['image', 'video'],
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
                                                                type: ['image', 'video'],
                                                        },
                                                },
                                        },
                                        // Zoom for images
                                        {
                                                displayName: 'Zoom',
                                                name: 'zoom',
                                                type: 'number',
                                                default: 0,
                                                description: 'Zoom level (positive values zoom in)',
                                                displayOptions: {
                                                        show: {
                                                                type: ['image', 'video'],
                                                        },
                                                },
                                        },
                                        // Text specific fields
                                        {
                                                displayName: 'Text Content',
                                                name: 'text',
                                                type: 'string',
                                                default: '',
                                                description: 'Text content to display',
                                                displayOptions: {
                                                        show: {
                                                                type: ['text', 'voice'],
                                                        },
                                                },
                                        },
                                        {
                                                displayName: 'Font Family',
                                                name: 'font-family',
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
                                                name: 'font-size',
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
                                        // Audio specific fields
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
                                                                type: ['audio', 'video'],
                                                        },
                                                },
                                        },
                                        // Video specific fields
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
                                        // Voice specific fields
                                        {
                                                displayName: 'Voice',
                                                name: 'voice',
                                                type: 'options',
                                                options: [
                                                        { name: 'US English (Female)', value: 'en-US-AriaNeural' },
                                                        { name: 'US English (Male)', value: 'en-US-GuyNeural' },
                                                        { name: 'British English (Female)', value: 'en-GB-SoniaNeural' },
                                                        { name: 'British English (Male)', value: 'en-GB-RyanNeural' },
                                                ],
                                                default: 'en-US-AriaNeural',
                                                description: 'Voice to use for text-to-speech',
                                                displayOptions: {
                                                        show: {
                                                                type: ['voice'],
                                                        },
                                                },
                                        },
                                        // Subtitles specific fields
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
                                        }
                                ],
                        },
                ],
                displayOptions: {
                        show: {
                                operation: ['createMovie'],
                                advancedMode: [false],
                        },
                },
        },

        // The movie parameters in alphabetical order
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
                displayName: 'Duration',
                name: 'duration',
                type: 'number',
                typeOptions: {
                        numberPrecision: 0,
                },
                default: 10,
                description: 'Duration of the video in seconds',
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
                displayName: 'Horizontal Position',
                name: 'horizontal_position',
                type: 'options',
                required: true,
                description: 'Top-level position control: Determines how source images/videos are positioned horizontally within the video frame when crop=true. This affects all content that doesn\'t fit the output dimensions exactly.',
                default: 'center',
                displayOptions: {
                        show: {
                                operation: ['createMovie'],
                                advancedMode: [false],
                        },
                },
                options: [
                        { name: 'Left', value: 'left' },
                        { name: 'Center-Left', value: 'center_left' },
                        { name: 'Center', value: 'center' },
                        { name: 'Center-Right', value: 'center_right' },
                        { name: 'Right', value: 'right' },
                ],
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
                displayName: 'Padding Color',
                name: 'padding_color',
                type: 'string',
                default: 'black',
                description: 'Color to use for padding when crop=false. When images/videos don\'t fill the entire frame, this color will show in the empty areas. Use color name (e.g., "black", "white") or hex code (e.g., "#000000").',
                displayOptions: {
                        show: {
                                operation: ['createMovie'],
                                advancedMode: [false],
                        },
                },
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
                description: 'Output video quality',
                displayOptions: {
                        show: {
                                operation: ['createMovie'],
                                advancedMode: [false],
                        },
                },
        },
        {
                displayName: 'Smoothness',
                name: 'smoothness',
                type: 'number',
                typeOptions: {
                        minValue: 0,
                        maxValue: 100,
                        numberPrecision: 0,
                },
                default: 0,
                description: 'Video smoothness level (0 = no smoothing, higher values make transitions more gradual)',
                displayOptions: {
                        show: {
                                operation: ['createMovie'],
                                advancedMode: [false],
                        },
                },
        },
        {
                displayName: 'Vertical Position',
                name: 'vertical_position',
                type: 'options',
                required: true,
                description: 'Top-level position control: Determines how source images/videos are positioned vertically within the video frame when crop=true. This affects all content that doesn\'t fit the output dimensions exactly.',
                default: 'center',
                displayOptions: {
                        show: {
                                operation: ['createMovie'],
                                advancedMode: [false],
                        },
                },
                options: [
                        { name: 'Top', value: 'top' },
                        { name: 'Center-Top', value: 'center_top' },
                        { name: 'Center', value: 'center' },
                        { name: 'Center-Bottom', value: 'center_bottom' },
                        { name: 'Bottom', value: 'bottom' },
                ],
        },
        // Scene Settings Section Header
        {
                displayName: 'Scene Settings',
                name: 'sceneSettings',
                type: 'notice',
                default: '',
                displayOptions: {
                        show: {
                                operation: ['createMovie'],
                                advancedMode: [false],
                        },
                },
        },
        // Scene-specific Elements collection
        {
                displayName: 'Scene Elements',
                name: 'elements',
                type: 'fixedCollection',
                typeOptions: {
                        multipleValues: true,
                        sortable: true,
                },
                placeholder: 'Add Scene Element',
                description: 'Elements that appear only in specific scenes, not across the entire movie',
                default: {},
                options: [
                        {
                                name: 'elementValues',
                                displayName: 'Element',
                                values: [
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
                                                description: 'Type of element to add to the video',
                                        },
                                        // Image & Video shared fields
                                        {
                                                displayName: 'Source URL',
                                                name: 'src',
                                                type: 'string',
                                                default: '',
                                                description: 'URL of the image or video file',
                                                displayOptions: {
                                                        show: {
                                                                type: ['image', 'video', 'audio'],
                                                        },
                                                },
                                        },
                                        // Image specific fields
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
                                                                type: ['image'],
                                                        },
                                                },
                                        },
                                        {
                                                displayName: 'Element X Position',
                                                name: 'x',
                                                type: 'number',
                                                default: 0,
                                                description: 'Custom X position of the image (only used with Custom position)',
                                                displayOptions: {
                                                        show: {
                                                                type: ['image'],
                                                                positionPreset: ['custom'],
                                                        },
                                                },
                                        },
                                        {
                                                displayName: 'Element Y Position',
                                                name: 'y',
                                                type: 'number',
                                                default: 0,
                                                description: 'Custom Y position of the image (only used with Custom position)',
                                                displayOptions: {
                                                        show: {
                                                                type: ['image'],
                                                                positionPreset: ['custom'],
                                                        },
                                                },
                                        },
                                        {
                                                displayName: 'Element Width',
                                                name: 'width',
                                                type: 'number',
                                                default: 0,
                                                description: 'Width of the image (0 to use original)',
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
                                                description: 'Height of the image (0 to use original)',
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
                                                description: 'Zoom level for this image (positive values zoom in)',
                                                displayOptions: {
                                                        show: {
                                                                type: ['image'],
                                                        },
                                                },
                                        },
                                        // Text specific fields
                                        {
                                                displayName: 'Text Content',
                                                name: 'text',
                                                type: 'string',
                                                default: '',
                                                description: 'Text content to display',
                                                displayOptions: {
                                                        show: {
                                                                type: ['text', 'voice'],
                                                        },
                                                },
                                        },
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
                                                                type: ['text'],
                                                        },
                                                },
                                        },
                                        {
                                                displayName: 'Element X Position',
                                                name: 'x',
                                                type: 'number',
                                                default: 960,
                                                description: 'Custom X position of the text (only used with Custom position)',
                                                displayOptions: {
                                                        show: {
                                                                type: ['text'],
                                                                positionPreset: ['custom'],
                                                        },
                                                },
                                        },
                                        {
                                                displayName: 'Element Y Position',
                                                name: 'y',
                                                type: 'number',
                                                default: 540,
                                                description: 'Custom Y position of the text (only used with Custom position)',
                                                displayOptions: {
                                                        show: {
                                                                type: ['text'],
                                                                positionPreset: ['custom'],
                                                        },
                                                },
                                        },
                                        {
                                                displayName: 'Font Family',
                                                name: 'font-family',
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
                                                name: 'font-size',
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
                                                displayName: 'Color',
                                                name: 'color',
                                                type: 'string',
                                                default: 'white',
                                                description: 'Text color name or hex code',
                                                displayOptions: {
                                                        show: {
                                                                type: ['text'],
                                                        },
                                                },
                                        },
                                        // Audio specific fields
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
                                        // Voice specific fields
                                        {
                                                displayName: 'Voice Name',
                                                name: 'voice',
                                                type: 'options',
                                                options: [
                                                        { name: 'US Female (Aria)', value: 'en-US-AriaNeural' },
                                                        { name: 'US Male (Guy)', value: 'en-US-GuyNeural' },
                                                        { name: 'UK Female (Sonia)', value: 'en-GB-SoniaNeural' },
                                                        { name: 'UK Male (Ryan)', value: 'en-GB-RyanNeural' },
                                                        { name: 'Australian Female (Natasha)', value: 'en-AU-NatashaNeural' },
                                                        { name: 'Australian Male (William)', value: 'en-AU-WilliamNeural' },
                                                ],
                                                default: 'en-US-AriaNeural',
                                                description: 'Text-to-speech voice to use',
                                                displayOptions: {
                                                        show: {
                                                                type: ['voice'],
                                                        },
                                                },
                                        },
                                        // Subtitle settings - expanded to match JSON2Video API capabilities
                                        {
                                                displayName: 'Subtitle Source Type',
                                                name: 'subtitleSourceType',
                                                type: 'options',
                                                options: [
                                                        { name: 'Direct Text', value: 'text' },
                                                        { name: 'SRT File URL', value: 'src' },
                                                ],
                                                default: 'text',
                                                description: 'Whether to use direct text content or an external SRT file',
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
                                                default: '=',
                                                description: 'The subtitle text to display',
                                                displayOptions: {
                                                        show: {
                                                                type: ['subtitles'],
                                                                subtitleSourceType: ['text'],
                                                        },
                                                },
                                        },
                                        {
                                                displayName: 'SRT File URL',
                                                name: 'src',
                                                type: 'string',
                                                default: '={{ $json.srtFileUrl }}',
                                                description: 'URL of an SRT subtitle file',
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
                                                        { name: 'Italian', value: 'it' },
                                                        { name: 'Portuguese', value: 'pt' },
                                                        { name: 'Chinese', value: 'zh' },
                                                        { name: 'Japanese', value: 'ja' },
                                                        { name: 'Korean', value: 'ko' },
                                                        { name: 'Russian', value: 'ru' },
                                                        { name: 'Arabic', value: 'ar' },
                                                        { name: 'Hindi', value: 'hi' },
                                                ],
                                                default: 'en',
                                                description: 'Language for subtitles',
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
                                                        { name: 'Bottom Left', value: 'bottom-left' },
                                                        { name: 'Bottom Right', value: 'bottom-right' },
                                                        { name: 'Top Center', value: 'top-center' },
                                                        { name: 'Top Left', value: 'top-left' },
                                                        { name: 'Top Right', value: 'top-right' },
                                                ],
                                                default: 'bottom-center',
                                                description: 'Position of the subtitles',
                                                displayOptions: {
                                                        show: {
                                                                type: ['subtitles'],
                                                        },
                                                },
                                        },
                                        {
                                                displayName: 'Font Family',
                                                name: 'font-family',
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
                                                description: 'Font family for the subtitles',
                                                displayOptions: {
                                                        show: {
                                                                type: ['subtitles'],
                                                        },
                                                },
                                        },
                                        {
                                                displayName: 'Font Size',
                                                name: 'font-size',
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
                                                displayName: 'Color',
                                                name: 'color',
                                                type: 'string',
                                                default: 'white',
                                                description: 'Text color name or hex code (e.g., white, #FFFFFF)',
                                                displayOptions: {
                                                        show: {
                                                                type: ['subtitles'],
                                                        },
                                                },
                                        },
                                        {
                                                displayName: 'Background Color',
                                                name: 'background-color',
                                                type: 'string',
                                                default: 'rgba(0,0,0,0.5)',
                                                description: 'Background color for the subtitle text (e.g., black, #000000, rgba(0,0,0,0.5))',
                                                displayOptions: {
                                                        show: {
                                                                type: ['subtitles'],
                                                        },
                                                },
                                        },
                                        {
                                                displayName: 'Style',
                                                name: 'style',
                                                type: 'options',
                                                options: [
                                                        { name: 'Normal', value: 'normal' },
                                                        { name: 'Bold', value: 'bold' },
                                                        { name: 'Italic', value: 'italic' },
                                                        { name: 'Bold Italic', value: 'bold italic' },
                                                ],
                                                default: 'normal',
                                                description: 'Text style for the subtitles',
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
                                                typeOptions: {
                                                        minValue: 0,
                                                        maxValue: 1,
                                                        numberPrecision: 2,
                                                },
                                                default: 1,
                                                description: 'Opacity level for subtitles (0-1)',
                                                displayOptions: {
                                                        show: {
                                                                type: ['subtitles'],
                                                        },
                                                },
                                        },
                                        // Common fields for all types
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
                                ],
                        },
                ],
                displayOptions: {
                        show: {
                                operation: ['createMovie'],
                                advancedMode: [false],
                        },
                },
        },
];

/**
 * Advanced mode parameter for the createMovie operation
 */
export const createMovieAdvancedModeParameter: INodeProperties = {
        displayName: 'Advanced Mode',
        name: 'advancedMode',
        type: 'boolean',
        default: true,
        description: 'Whether to use advanced mode with direct JSON template input',
        displayOptions: {
                show: {
                        operation: ['createMovie'],
                },
        },
};

/**
 * JSON Template parameter for advanced mode
 */
export const createMovieJsonTemplateParameter: INodeProperties = {
        displayName: 'JSON Template',
        name: 'jsonTemplate',
        type: 'json',
        default: '=',
        description: '<pre>Schema:\n{\n  "fps": 25,\n  "width": 1024,\n  "height": 768,\n  "scenes": [{\n    "elements": [{\n      "type": "image",\n      "src": "url",\n      "start": 0,\n      "duration": 5\n    }]\n  }]\n}</pre>',
        displayOptions: {
                show: {
                        operation: ['createMovie'],
                        advancedMode: [true],
                },
        },
};

/**
 * Parameters for advanced mode
 */
export const createMovieAdvancedParameters: INodeProperties[] = [];