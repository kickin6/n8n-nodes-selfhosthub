// nodes/CreateJ2vMovie/presentation/unifiedParameters.ts

import { INodeProperties } from 'n8n-workflow';
import { completeElementFields } from '../shared/elementFields';
import { qualityParameter } from '../shared/movieParams';

/**
 * Remove displayOptions from element fields to prevent n8n parameter dependency errors
 */
const elementsWithoutDisplayOptions = completeElementFields.map(field => {
  const { displayOptions, ...cleanField } = field;
  return cleanField;
});

/**
 * Shared output settings collection
 */
const outputSettingsCollection: INodeProperties = {
  displayName: 'Output Settings',
  name: 'outputSettings',
  type: 'fixedCollection',
  default: {},
  placeholder: 'Configure Output Settings',
  description: 'Configure video output format and quality settings',
  options: [
    {
      name: 'outputDetails',
      displayName: 'Output Configuration',
      values: [
        {
          displayName: 'Output Width',
          name: 'width',
          type: 'number',
          default: 1920,
          description: 'Video width in pixels',
          typeOptions: {
            minValue: 1,
            maxValue: 4096,
          },
        },
        {
          displayName: 'Output Height',
          name: 'height',
          type: 'number',
          default: 1080,
          description: 'Video height in pixels',
          typeOptions: {
            minValue: 1,
            maxValue: 4096,
          },
        },
        {
          displayName: 'Format',
          name: 'format',
          type: 'options',
          options: [
            { name: 'MP4', value: 'mp4' },
            { name: 'WebM', value: 'webm' },
            { name: 'MOV', value: 'mov' },
            { name: 'AVI', value: 'avi' },
          ],
          default: 'mp4',
          description: 'Output video format',
        },
        {
          displayName: 'Quality',
          name: 'quality',
          type: 'options',
          options: [
            { name: 'Low', value: 'low' },
            { name: 'Medium', value: 'medium' },
            { name: 'High', value: 'high' },
            { name: 'Ultra', value: 'ultra' },
          ],
          default: 'high',
          description: 'Video quality setting',
        },
        {
          displayName: 'Frame Rate',
          name: 'frameRate',
          type: 'number',
          default: 30,
          description: 'Video frame rate (fps)',
          typeOptions: {
            minValue: 1,
            maxValue: 60,
          },
        },
        {
          displayName: 'Cache',
          name: 'cache',
          type: 'boolean',
          default: true,
          description: 'Use cached assets when possible for faster rendering',
        },
        {
          displayName: 'Draft Mode',
          name: 'draft',
          type: 'boolean',
          default: false,
          description: 'Generate draft quality for faster preview',
        },
        {
          displayName: 'Resolution',
          name: 'resolution',
          type: 'string',
          default: '',
          description: 'Resolution preset (overrides width/height)',
        },
      ],
    },
  ],
};

/**
 * Unified parameters that work for all operations
 */
export const unifiedParameters: INodeProperties[] = [
  // Record ID - common to all operations
  {
    displayName: 'Record ID',
    name: 'recordId',
    type: 'string',
    default: '',
    description: 'Optional record identifier for tracking. If not provided, JSON2Video will auto-generate one.',
  },

  // Movie-level Elements (createMovie only)
  {
    displayName: 'Movie Elements',
    name: 'movieElements',
    type: 'fixedCollection',
    typeOptions: {
      multipleValues: true,
      sortable: true,
    },
    placeholder: 'Add Movie Element',
    description: 'Elements that appear across all scenes in the movie (subtitles, background audio, etc.)',
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
        values: elementsWithoutDisplayOptions,
      },
    ],
  },

  // Scene Elements - universal element collection
  {
    displayName: 'Scene Elements',
    name: 'sceneElements',
    type: 'fixedCollection',
    typeOptions: {
      multipleValues: true,
      sortable: true,
    },
    placeholder: 'Add Scene Element',
    description: 'Elements that appear in scenes (videos, images, text, audio)',
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
        values: elementsWithoutDisplayOptions,
      },
    ],
  },

  // Video Element for mergeVideoAudio
  {
    displayName: 'Video Element',
    name: 'videoElement',
    type: 'fixedCollection',
    default: {},
    placeholder: 'Add Video Element',
    description: 'Configure the video source for merging with audio',
    displayOptions: {
      show: {
        operation: ['mergeVideoAudio'],
        advancedModeMergeVideoAudio: [false],
      },
    },
    options: [
      {
        name: 'videoDetails',
        displayName: 'Video Details',
        values: elementsWithoutDisplayOptions,
      },
    ],
  },

  // Audio Element for mergeVideoAudio
  {
    displayName: 'Audio Element',
    name: 'audioElement',
    type: 'fixedCollection',
    default: {},
    placeholder: 'Add Audio Element',
    description: 'Configure the audio source for merging with video',
    displayOptions: {
      show: {
        operation: ['mergeVideoAudio'],
        advancedModeMergeVideoAudio: [false],
      },
    },
    options: [
      {
        name: 'audioDetails',
        displayName: 'Audio Details',
        values: elementsWithoutDisplayOptions,
      },
    ],
  },

  // Video Elements collection for mergeVideos
  {
    displayName: 'Video Elements',
    name: 'videoElements',
    type: 'fixedCollection',
    typeOptions: {
      multipleValues: true,
      sortable: true,
    },
    placeholder: 'Add Video Element',
    description: 'Add videos to merge in sequence. Each video will become a separate scene.',
    default: {},
    displayOptions: {
      show: {
        operation: ['mergeVideos'],
        advancedModeMergeVideos: [false],
      },
    },
    options: [
      {
        name: 'elementValues',
        displayName: 'Video',
        values: elementsWithoutDisplayOptions,
      },
    ],
  },

  // Transition Settings (mergeVideos only)
  {
    displayName: 'Transition Style',
    name: 'transition',
    type: 'options',
    options: [
      { name: 'None', value: 'none' },
      { name: 'Fade', value: 'fade' },
      { name: 'Slide Left', value: 'slideLeft' },
      { name: 'Slide Right', value: 'slideRight' },
      { name: 'Slide Up', value: 'slideUp' },
      { name: 'Slide Down', value: 'slideDown' },
      { name: 'Zoom In', value: 'zoomIn' },
      { name: 'Zoom Out', value: 'zoomOut' },
    ],
    default: 'none',
    description: 'Transition effect between video segments',
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
    description: 'Duration of transition effect in seconds',
    typeOptions: {
      minValue: 0,
      maxValue: 10,
      numberPrecision: 2,
    },
    displayOptions: {
      show: {
        operation: ['mergeVideos'],
        advancedModeMergeVideos: [false],
      },
    },
  },

  // Output Settings - consistent across all operations
  outputSettingsCollection,

  // createMovie specific basic parameters (legacy compatibility)
  {
    displayName: 'Output Width',
    name: 'output_width',
    type: 'number',
    default: 1024,
    description: 'Video width in pixels',
    displayOptions: {
      show: {
        operation: ['createMovie'],
        advancedMode: [false],
      },
    },
    typeOptions: {
      minValue: 1,
      maxValue: 4096,
    },
  },

  {
    displayName: 'Output Height',
    name: 'output_height',
    type: 'number',
    default: 768,
    description: 'Video height in pixels',
    displayOptions: {
      show: {
        operation: ['createMovie'],
        advancedMode: [false],
      },
    },
    typeOptions: {
      minValue: 1,
      maxValue: 4096,
    },
  },

  // Quality parameter - using shared definition
  {
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

  // Export Settings for createMovie
  {
    displayName: 'Export Settings',
    name: 'exportSettings',
    type: 'fixedCollection',
    typeOptions: {
      multipleValues: true,
    },
    placeholder: 'Add Export Configuration',
    description: 'Configure export destinations (webhook, FTP, email)',
    default: {},
    displayOptions: {
      show: {
        operation: ['createMovie'],
        advancedMode: [false],
      },
    },
    options: [
      {
        name: 'exportValues',
        displayName: 'Export Configuration',
        values: [
          {
            displayName: 'Export Type',
            name: 'exportType',
            type: 'options',
            required: true,
            default: 'webhook',
            options: [
              { name: 'Webhook', value: 'webhook' },
              { name: 'FTP Upload', value: 'ftp' },
              { name: 'Email Delivery', value: 'email' },
            ],
            description: 'Method for delivering the generated video',
          },
          {
            displayName: 'Webhook URL',
            name: 'webhookUrl',
            type: 'string',
            default: '',
            description: 'URL to receive the video when generation completes',
          },
        ],
      },
    ],
  },
];

/**
 * Operation-specific advanced mode parameters
 */
export const unifiedAdvancedModeParameter: INodeProperties = {
  displayName: 'Advanced Mode',
  name: 'advancedMode',
  type: 'boolean',
  default: false,
  description: 'Enable advanced mode to provide raw JSON template instead of using the form fields',
  displayOptions: {
    show: {
      operation: ['createMovie'],
    },
  },
};

export const mergeVideoAudioAdvancedModeParameter: INodeProperties = {
  displayName: 'Advanced Mode',
  name: 'advancedModeMergeVideoAudio',
  type: 'boolean',
  default: false,
  description: 'Enable advanced mode to provide raw JSON template instead of using the form fields',
  displayOptions: {
    show: {
      operation: ['mergeVideoAudio'],
    },
  },
};

export const mergeVideosAdvancedModeParameter: INodeProperties = {
  displayName: 'Advanced Mode',
  name: 'advancedModeMergeVideos',
  type: 'boolean',
  default: false,
  description: 'Enable advanced mode to provide raw JSON template instead of using the form fields',
  displayOptions: {
    show: {
      operation: ['mergeVideos'],
    },
  },
};

/**
 * Operation-specific JSON template parameters
 */
export const unifiedJsonTemplateParameter: INodeProperties = {
  displayName: 'JSON Template',
  name: 'jsonTemplate',
  type: 'json',
  default: '{}',
  description: 'Raw JSON2Video API template. Use the basic mode parameters to override specific values.',
  displayOptions: {
    show: {
      operation: ['createMovie'],
      advancedMode: [true],
    },
  },
};

export const mergeVideoAudioJsonTemplateParameter: INodeProperties = {
  displayName: 'JSON Template',
  name: 'jsonTemplateMergeVideoAudio',
  type: 'json',
  default: '{}',
  description: 'Raw JSON2Video API template. Use the basic mode parameters to override specific values.',
  displayOptions: {
    show: {
      operation: ['mergeVideoAudio'],
      advancedModeMergeVideoAudio: [true],
    },
  },
};

export const mergeVideosJsonTemplateParameter: INodeProperties = {
  displayName: 'JSON Template',
  name: 'jsonTemplateMergeVideos',
  type: 'json',
  default: '{}',
  description: 'Raw JSON2Video API template. Use the basic mode parameters to override specific values.',
  displayOptions: {
    show: {
      operation: ['mergeVideos'],
      advancedModeMergeVideos: [true],
    },
  },
};

/**
 * Unified advanced mode override parameters
 */
export const unifiedAdvancedParameters: INodeProperties[] = [
  {
    displayName: 'Output Width Override',
    name: 'width',
    type: 'number',
    default: undefined,
    description: 'Override the width specified in JSON template',
    typeOptions: {
      minValue: 1,
      maxValue: 4096,
    },
    displayOptions: {
      show: {
        advancedMode: [true],
      },
    },
  },
  {
    displayName: 'Output Height Override',
    name: 'height',
    type: 'number',
    default: undefined,
    description: 'Override the height specified in JSON template',
    typeOptions: {
      minValue: 1,
      maxValue: 4096,
    },
    displayOptions: {
      show: {
        advancedMode: [true],
      },
    },
  },
  {
    displayName: 'Quality Override',
    name: 'quality',
    type: 'options',
    options: [
      { name: 'Low', value: 'low' },
      { name: 'Medium', value: 'medium' },
      { name: 'High', value: 'high' },
      { name: 'Ultra', value: 'ultra' },
    ],
    default: undefined,
    description: 'Override the quality setting specified in JSON template',
    displayOptions: {
      show: {
        advancedMode: [true],
      },
    },
  },
  {
    displayName: 'Cache Override',
    name: 'cache',
    type: 'boolean',
    default: undefined,
    description: 'Override the caching setting specified in JSON template',
    displayOptions: {
      show: {
        advancedMode: [true],
      },
    },
  },
  {
    displayName: 'Resolution Override',
    name: 'resolution',
    type: 'string',
    default: '',
    description: 'Override the resolution specified in JSON template',
    displayOptions: {
      show: {
        advancedMode: [true],
      },
    },
  },

  // mergeVideoAudio advanced overrides
  {
    displayName: 'Output Width Override',
    name: 'width',
    type: 'number',
    default: undefined,
    description: 'Override the width specified in JSON template',
    typeOptions: {
      minValue: 1,
      maxValue: 4096,
    },
    displayOptions: {
      show: {
        advancedModeMergeVideoAudio: [true],
      },
    },
  },
  {
    displayName: 'Output Height Override',
    name: 'height',
    type: 'number',
    default: undefined,
    description: 'Override the height specified in JSON template',
    typeOptions: {
      minValue: 1,
      maxValue: 4096,
    },
    displayOptions: {
      show: {
        advancedModeMergeVideoAudio: [true],
      },
    },
  },
  {
    displayName: 'Quality Override',
    name: 'quality',
    type: 'options',
    options: [
      { name: 'Low', value: 'low' },
      { name: 'Medium', value: 'medium' },
      { name: 'High', value: 'high' },
      { name: 'Ultra', value: 'ultra' },
    ],
    default: undefined,
    description: 'Override the quality setting specified in JSON template',
    displayOptions: {
      show: {
        advancedModeMergeVideoAudio: [true],
      },
    },
  },
  {
    displayName: 'Cache Override',
    name: 'cache',
    type: 'boolean',
    default: undefined,
    description: 'Override the caching setting specified in JSON template',
    displayOptions: {
      show: {
        advancedModeMergeVideoAudio: [true],
      },
    },
  },

  // mergeVideos advanced overrides
  {
    displayName: 'Output Width Override',
    name: 'width',
    type: 'number',
    default: undefined,
    description: 'Override the width specified in JSON template',
    typeOptions: {
      minValue: 1,
      maxValue: 4096,
    },
    displayOptions: {
      show: {
        advancedModeMergeVideos: [true],
      },
    },
  },
  {
    displayName: 'Output Height Override',
    name: 'height',
    type: 'number',
    default: undefined,
    description: 'Override the height specified in JSON template',
    typeOptions: {
      minValue: 1,
      maxValue: 4096,
    },
    displayOptions: {
      show: {
        advancedModeMergeVideos: [true],
      },
    },
  },
  {
    displayName: 'Quality Override',
    name: 'quality',
    type: 'options',
    options: [
      { name: 'Low', value: 'low' },
      { name: 'Medium', value: 'medium' },
      { name: 'High', value: 'high' },
      { name: 'Ultra', value: 'ultra' },
    ],
    default: undefined,
    description: 'Override the quality setting specified in JSON template',
    displayOptions: {
      show: {
        advancedModeMergeVideos: [true],
      },
    },
  },
  {
    displayName: 'Cache Override',
    name: 'cache',
    type: 'boolean',
    default: undefined,
    description: 'Override the caching setting specified in JSON template',
    displayOptions: {
      show: {
        advancedModeMergeVideos: [true],
      },
    },
  },
];