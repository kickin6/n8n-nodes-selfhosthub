// nodes/CreateJ2vMovie/presentation/mergeVideoAudioParameters.ts

import { INodeProperties } from 'n8n-workflow';
import {
  advancedModeParameters,
  jsonTemplateParameters,
  createAdvancedModeOverrides,
  createBasicModeParams
} from '../operations/shared/commonParams';

// =============================================================================
// MERGE VIDEO & AUDIO OPERATION PARAMETERS
// =============================================================================

/**
 * Basic mode parameters for the mergeVideoAudio operation
 * Uses shared definitions to eliminate duplication while supporting
 * the video + audio merging workflow
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
            displayName: 'Video URL',
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
            default: -1,
            description: 'Duration in seconds (-1 uses entire video)',
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
            displayName: 'Crop to Fit',
            name: 'crop',
            type: 'boolean',
            default: false,
            description: 'Whether to crop the video to match dimensions',
          },
          {
            displayName: 'Resize Mode',
            name: 'resize',
            type: 'options',
            options: [
              { name: 'Cover (Crop to Fill)', value: 'cover' },
              { name: 'Contain (Fit Inside)', value: 'contain' },
              { name: 'Fill (Stretch)', value: 'fill' },
              { name: 'Fit (Letterbox)', value: 'fit' },
            ],
            default: 'cover',
            description: 'How to resize video to fit dimensions',
          },
          {
            displayName: 'Volume',
            name: 'volume',
            type: 'number',
            typeOptions: {
              minValue: 0,
              maxValue: 10,
              numberPrecision: 2,
            },
            default: 0,
            description: 'Volume level for original video audio (0 = mute, 10 = max)',
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
            displayName: 'Audio URL',
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
              maxValue: 10,
              numberPrecision: 2,
            },
            default: 1,
            description: 'Volume level (0 = mute, 10 = max)',
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
              minValue: 50,
              maxValue: 3840,
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
              minValue: 50,
              maxValue: 3840,
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
              minValue: 1,
              maxValue: 120,
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

// =============================================================================
// ADVANCED MODE PARAMETERS
// =============================================================================

/**
 * Advanced mode parameter for the mergeVideoAudio operation
 * Uses shared definition for consistency
 */
export const mergeVideoAudioAdvancedModeParameter: INodeProperties = advancedModeParameters.mergeVideoAudio;

/**
 * JSON Template parameter for advanced mode
 * Uses shared definition with mergeVideoAudio-specific template
 */
export const mergeVideoAudioJsonTemplateParameter: INodeProperties = jsonTemplateParameters.mergeVideoAudio;

/**
 * Advanced mode override parameters for mergeVideoAudio operation
 * Uses shared function to generate consistent parameter sets
 */
export const mergeVideoAudioAdvancedParameters: INodeProperties[] = createAdvancedModeOverrides(
  'mergeVideoAudio',
  'advancedModeMergeAudio'
);