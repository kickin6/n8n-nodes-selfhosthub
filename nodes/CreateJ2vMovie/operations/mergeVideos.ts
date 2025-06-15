import { INodeProperties } from 'n8n-workflow';

/**
 * Basic mode parameters for the mergeVideos operation, organized alphabetically
 */
export const mergeVideosParameters: INodeProperties[] = [
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
                                operation: ['mergeVideos'],
                                advancedModeMergeVideos: [false],
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
                                operation: ['mergeVideos'],
                                advancedModeMergeVideos: [false],
                        },
                },
        },
        // Video Elements
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
                                                default: 1,
                                                description: 'Volume level (0 = mute, 1 = full volume)',
                                        },
                                ],
                        },
                ],
                description: 'Add videos to merge in sequence',
        },
        // Transition settings
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
        // Output Settings
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
 */
export const mergeVideosAdvancedModeParameter: INodeProperties = {
        displayName: 'Advanced Mode',
        name: 'advancedModeMergeVideos',
        type: 'boolean',
        default: true,
        description: 'Whether to use advanced mode with direct JSON template input',
        displayOptions: {
                show: {
                        operation: ['mergeVideos'],
                },
        },
};

/**
 * JSON Template parameter for advanced mode
 */
export const mergeVideosJsonTemplateParameter: INodeProperties = {
        displayName: 'JSON Template',
        name: 'jsonTemplateMergeVideos',
        type: 'json',
        default: '=',
        description: '<pre>Schema:\n{\n  "videos": [\n    "https://example.com/video1.mp4",\n    "https://example.com/video2.mp4"\n  ],\n  "fps": 25,\n  "width": 1024,\n  "height": 768\n}</pre>',
        displayOptions: {
                show: {
                        operation: ['mergeVideos'],
                        advancedModeMergeVideos: [true],
                },
        },
};

/**
 * Parameters for advanced mode
 */
export const mergeVideosAdvancedParameters: INodeProperties[] = [];