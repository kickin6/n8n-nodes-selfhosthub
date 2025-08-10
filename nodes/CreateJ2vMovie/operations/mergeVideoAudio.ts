import { INodeProperties } from 'n8n-workflow';
import { completeElementFields } from './shared/elements';
import {
  advancedModeParameters,
  jsonTemplateParameters,
  createAdvancedModeOverrides,
  createBasicModeParams
} from './shared/commonParams';

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