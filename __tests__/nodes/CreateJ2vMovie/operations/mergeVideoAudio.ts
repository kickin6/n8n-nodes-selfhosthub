import { INodeProperties } from 'n8n-workflow';

/**
 * Basic mode parameters for the mergeVideoAudio operation, organized alphabetically
 */
export const mergeVideoAudioParameters: INodeProperties[] = [
        // Keep recordId and webhookUrl at the top
        {
                displayName: 'Record ID',
                name: 'recordId',
                type: 'string',
                required: true,
                default: '=',
                description: 'The Record ID to associate with this video',
                displayOptions: {
                        show: {
                                operation: ['mergeVideoAudio'],
                                advancedModeMergeAudio: [false],
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
                                operation: ['mergeVideoAudio'],
                                advancedModeMergeAudio: [false],
                        },
                },
        },
        // Video Element
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
                                                default: '=',
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
                                                default: 0,
                                                description: 'Volume level for original video audio (0 = mute, 1 = full volume)',
                                        },
                                ],
                        },
                ],
                description: 'Configure the video source',
        },
        // Audio Element
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
                                                default: '=',
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
        // Output Settings
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
 * Advanced mode parameter for the mergeVideoAudio operation
 */
export const mergeVideoAudioAdvancedModeParameter: INodeProperties = {
        displayName: 'Advanced Mode',
        name: 'advancedModeMergeAudio',
        type: 'boolean',
        default: true,
        description: 'Whether to use advanced mode with direct JSON template input',
        displayOptions: {
                show: {
                        operation: ['mergeVideoAudio'],
                },
        },
};

/**
 * JSON Template parameter for advanced mode
 */
export const mergeVideoAudioJsonTemplateParameter: INodeProperties = {
        displayName: 'JSON Template',
        name: 'jsonTemplateMergeAudio',
        type: 'json',
        default: '=',
        description: '<pre>Schema:\n{\n  "video": "https://example.com/video.mp4",\n  "audio": "https://example.com/audio.mp3",\n  "fps": 25,\n  "width": 1024,\n  "height": 768\n}</pre>',
        displayOptions: {
                show: {
                        operation: ['mergeVideoAudio'],
                        advancedModeMergeAudio: [true],
                },
        },
};

/**
 * Parameters for advanced mode
 */
export const mergeVideoAudioAdvancedParameters: INodeProperties[] = [];