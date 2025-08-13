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

        // Basic Movie Configuration Parameters
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
        
        // Scene-specific Elements (appear in specific scenes only)
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