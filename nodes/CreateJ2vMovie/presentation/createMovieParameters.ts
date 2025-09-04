// nodes/CreateJ2vMovie/presentation/createMovieParameters.ts

import { INodeProperties } from 'n8n-workflow';
import { completeElementFields } from '../operations/shared/elements';
import {
  advancedModeParameters,
  jsonTemplateParameters,
  qualityParameter,
  createAdvancedModeOverrides,
  createBasicModeParams
} from '../operations/shared/commonParams';

// =============================================================================
// CREATE MOVIE OPERATION PARAMETERS
// =============================================================================

/**
 * Basic mode parameters for the createMovie operation
 * Uses shared definitions to eliminate duplication while supporting
 * the full createMovie workflow with movie-level and scene-level elements
 */
export const createMovieParameters: INodeProperties[] = [
  // Basic mode common parameters (recordId, webhookUrl) - using shared helper
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
    description: 'Elements that appear across all scenes in the movie (e.g., background audio, subtitles)',
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
        values: completeElementFields,
      },
    ],
  },

  // Basic Movie Configuration Parameters
  {
    displayName: 'Output Width',
    name: 'output_width',
    type: 'number',
    typeOptions: {
      minValue: 50,
      maxValue: 3840,
      numberPrecision: 0,
    },
    default: 1024,
    required: true,
    description: 'Output width of the video in pixels',
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
      minValue: 50,
      maxValue: 3840,
      numberPrecision: 0,
    },
    default: 768,
    required: true,
    description: 'Output height of the video in pixels',
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
      minValue: 1,
      maxValue: 120,
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
    displayName: 'Cache',
    name: 'cache',
    type: 'boolean',
    default: true,
    description: 'Use cached assets when possible for faster rendering',
    displayOptions: {
      show: {
        operation: ['createMovie'],
        advancedMode: [false],
      },
    },
  },
  {
    displayName: 'Draft Mode',
    name: 'draft',
    type: 'boolean',
    default: false,
    description: 'Generate draft quality for faster preview',
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
        values: completeElementFields,
      },
    ],
  },
];

// =============================================================================
// ADVANCED MODE PARAMETERS
// =============================================================================

/**
 * Advanced mode parameter for the createMovie operation
 * Uses shared definition for consistency
 */
export const createMovieAdvancedModeParameter: INodeProperties = advancedModeParameters.createMovie;

/**
 * JSON Template parameter for advanced mode
 * Uses shared definition with createMovie-specific template
 */
export const createMovieJsonTemplateParameter: INodeProperties = jsonTemplateParameters.createMovie as INodeProperties;

/**
 * Advanced mode override parameters for createMovie operation
 * Uses shared function to generate consistent parameter sets
 */
export const createMovieAdvancedParameters: INodeProperties[] = createAdvancedModeOverrides(
  'createMovie', 
  'advancedMode'
);