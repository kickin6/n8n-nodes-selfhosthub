// nodes/CreateJ2vMovie/operations/shared/commonParams.ts

import { INodeProperties } from 'n8n-workflow';

// =============================================================================
// SHARED COMMON PARAMETERS
// =============================================================================

/**
 * Shared common parameters used across JSON2Video operations
 * These parameters appear in multiple operations and are defined once
 * to eliminate duplication and ensure consistency
 */

// =============================================================================
// BASIC PARAMETERS
// =============================================================================

/**
 * Record ID parameter - used for webhook correlation
 * Optional in all modes since JSON2Video can auto-generate IDs
 */
export const recordIdParameter: INodeProperties = {
  displayName: 'Record ID',
  name: 'recordId',
  type: 'string',
  required: false,
  default: '',
  description: 'Optional identifier for webhook correlation. If not provided, JSON2Video will auto-generate one.',
};

/**
 * Webhook URL parameter - optional for all operations
 */
export const webhookUrlParameter: INodeProperties = {
  displayName: 'Webhook URL',
  name: 'webhookUrl',
  type: 'string',
  default: '',
  required: false,
  description: 'Optional webhook URL for status notifications when video is complete',
};

// =============================================================================
// ADVANCED MODE OVERRIDE PARAMETERS
// =============================================================================

/**
 * Output dimensions parameters for advanced mode overrides
 */
export const outputWidthParameter: INodeProperties = {
  displayName: 'Output Width',
  name: 'outputWidth',
  type: 'number',
  default: undefined,
  description: 'Override the output width in the JSON template',
};

export const outputHeightParameter: INodeProperties = {
  displayName: 'Output Height',
  name: 'outputHeight',
  type: 'number',
  default: undefined,
  description: 'Override the output height in the JSON template',
};

/**
 * Framerate parameter for advanced mode overrides
 */
export const framerateParameter: INodeProperties = {
  displayName: 'Framerate',
  name: 'framerate',
  type: 'number',
  default: undefined,
  description: 'Override the framerate in the JSON template',
};

/**
 * Quality parameter - shared across operations
 */
export const qualityParameter: INodeProperties = {
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
  description: 'Video quality setting',
};

/**
 * Cache parameter for advanced mode overrides
 */
export const cacheParameter: INodeProperties = {
  displayName: 'Cache',
  name: 'cache',
  type: 'boolean',
  default: true,
  description: 'Override the cache setting in the JSON template',
};

/**
 * Draft parameter for advanced mode overrides
 */
export const draftParameter: INodeProperties = {
  displayName: 'Draft',
  name: 'draft',
  type: 'boolean',
  default: false,
  description: 'Override the draft setting in the JSON template',
};

/**
 * Resolution parameter for advanced mode overrides
 */
export const resolutionParameter: INodeProperties = {
  displayName: 'Resolution',
  name: 'resolution',
  type: 'options',
  options: [
    { name: 'Standard Definition', value: 'sd' },
    { name: 'High Definition', value: 'hd' },
    { name: 'Full HD', value: 'full-hd' },
    { name: 'Square', value: 'squared' },
    { name: 'Instagram Story', value: 'instagram-story' },
    { name: 'Instagram Feed', value: 'instagram-feed' },
    { name: 'Twitter Landscape', value: 'twitter-landscape' },
    { name: 'Twitter Portrait', value: 'twitter-portrait' },
    { name: 'Custom', value: 'custom' },
  ],
  default: 'custom',
  description: 'Override the resolution in the JSON template',
};

// =============================================================================
// ADVANCED MODE TOGGLE PARAMETERS
// =============================================================================

/**
 * Advanced mode toggle parameters for each operation
 * Each operation has its own advanced mode parameter to avoid conflicts
 */
export const advancedModeParameters = {
  createMovie: {
    displayName: 'Advanced Mode',
    name: 'advancedMode',
    type: 'boolean',
    default: false,
    description: 'Whether to use advanced mode with direct JSON template input',
    displayOptions: {
      show: {
        operation: ['createMovie'],
      },
    },
  } as INodeProperties,

  mergeVideoAudio: {
    displayName: 'Advanced Mode',
    name: 'advancedModeMergeVideoAudio',
    type: 'boolean',
    default: false,
    description: 'Whether to use advanced mode with direct JSON template input',
    displayOptions: {
      show: {
        operation: ['mergeVideoAudio'],
      },
    },
  } as INodeProperties,

  mergeVideos: {
    displayName: 'Advanced Mode',
    name: 'advancedModeMergeVideos',
    type: 'boolean',
    default: false,
    description: 'Whether to use advanced mode with direct JSON template input',
    displayOptions: {
      show: {
        operation: ['mergeVideos'],
      },
    },
  } as INodeProperties,
};

// =============================================================================
// JSON TEMPLATE PARAMETERS
// =============================================================================

/**
 * JSON template parameters for each operation in advanced mode
 * Each operation has its own template with appropriate defaults
 */
export const jsonTemplateParameters = {
  createMovie: {
    displayName: 'JSON Template',
    name: 'jsonTemplate',
    type: 'json',
    default: `{
  "fps": 25,
  "width": 1024,
  "height": 768,
  "quality": "high",
  "scenes": [
    {
      "elements": [
        {
          "type": "image",
          "src": "https://example.com/image.jpg",
          "start": 0,
          "duration": 5,
          "position": "center-center"
        }
      ]
    }
  ]
}`,
    description: 'Complete JSON template for the movie. Override parameters below will replace values in this template.',
    displayOptions: {
      show: {
        operation: ['createMovie'],
        advancedMode: [true],
      },
    },
  } as INodeProperties,

  mergeVideoAudio: {
    displayName: 'JSON Template',
    name: 'jsonTemplateMergeVideoAudio',
    type: 'json',
    default: `{
  "fps": 30,
  "width": 1024,
  "height": 768,
  "quality": "high",
  "scenes": [
    {
      "elements": [
        {
          "type": "video",
          "src": "https://example.com/video.mp4",
          "muted": true
        },
        {
          "type": "audio",
          "src": "https://example.com/audio.mp3",
          "volume": 1.0
        }
      ]
    }
  ]
}`,
    description: 'Complete JSON template for merging video and audio. Override parameters below will replace values in this template.',
    displayOptions: {
      show: {
        operation: ['mergeVideoAudio'],
        advancedModeMergeVideoAudio: [true],
      },
    },
  } as INodeProperties,

  mergeVideos: {
    displayName: 'JSON Template',
    name: 'jsonTemplateMergeVideos',
    type: 'json',
    default: `{
  "fps": 30,
  "width": 1024,
  "height": 768,
  "quality": "high",
  "scenes": [
    {
      "elements": [
        {
          "type": "video",
          "src": "https://example.com/video1.mp4"
        }
      ]
    },
    {
      "elements": [
        {
          "type": "video",
          "src": "https://example.com/video2.mp4"
        }
      ]
    }
  ]
}`,
    description: 'Complete JSON template for merging videos. Override parameters below will replace values in this template.',
    displayOptions: {
      show: {
        operation: ['mergeVideos'],
        advancedModeMergeVideos: [true],
      },
    },
  } as INodeProperties,
};

// =============================================================================
// HELPER FUNCTIONS FOR PARAMETER GENERATION
// =============================================================================

/**
 * Helper function to create advanced mode override parameters with proper display options
 * Used by presentation files to generate consistent parameter sets
 */
export function createAdvancedModeOverrides(operation: string, advancedModeParam: string): INodeProperties[] {
  return [
    {
      ...recordIdParameter,
      displayOptions: {
        show: {
          operation: [operation],
          [advancedModeParam]: [true],
        },
      },
    },
    {
      ...webhookUrlParameter,
      displayOptions: {
        show: {
          operation: [operation],
          [advancedModeParam]: [true],
        },
      },
    },
    {
      ...outputWidthParameter,
      displayOptions: {
        show: {
          operation: [operation],
          [advancedModeParam]: [true],
        },
      },
    },
    {
      ...outputHeightParameter,
      displayOptions: {
        show: {
          operation: [operation],
          [advancedModeParam]: [true],
        },
      },
    },
    {
      ...framerateParameter,
      displayOptions: {
        show: {
          operation: [operation],
          [advancedModeParam]: [true],
        },
      },
    },
    {
      ...qualityParameter,
      displayOptions: {
        show: {
          operation: [operation],
          [advancedModeParam]: [true],
        },
      },
    },
    {
      ...cacheParameter,
      displayOptions: {
        show: {
          operation: [operation],
          [advancedModeParam]: [true],
        },
      },
    },
    {
      ...draftParameter,
      displayOptions: {
        show: {
          operation: [operation],
          [advancedModeParam]: [true],
        },
      },
    },
    {
      ...resolutionParameter,
      displayOptions: {
        show: {
          operation: [operation],
          [advancedModeParam]: [true],
        },
      },
    },
  ];
}

/**
 * Helper function to create basic mode parameters with proper display options
 * Used by presentation files to generate consistent basic mode parameter sets
 */
export function createBasicModeParams(operation: string, advancedModeParam: string): INodeProperties[] {
  return [
    {
      ...recordIdParameter,
      displayOptions: {
        show: {
          operation: [operation],
          [advancedModeParam]: [false],
        },
      },
    },
    {
      ...webhookUrlParameter,
      displayOptions: {
        show: {
          operation: [operation],
          [advancedModeParam]: [false],
        },
      },
    },
  ];
}