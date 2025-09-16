// nodes/CreateJ2vMovie/presentation/unifiedParameters.ts
// COMPLETE REFACTOR: Added missing movie-level parameters and fixed structure

import { INodeProperties } from 'n8n-workflow';
import { elementCollection } from '../shared/elementFields';

/**
 * UNIFIED PARAMETERS - Complete API coverage with movie settings
 */
export const unifiedParameters: INodeProperties[] = [
  // =============================================================================
  // BASIC CONFIGURATION
  // =============================================================================
  
  {
    displayName: 'Record ID',
    name: 'recordId',
    type: 'string' as const,
    default: '',
    description: 'Optional record identifier for tracking. If not provided, JSON2Video will auto-generate one.',
  },

  // =============================================================================
  // MOVIE SETTINGS TOGGLE → MOVIE SETTINGS FIELDS
  // =============================================================================

  {
    displayName: 'Movie Settings',
    name: 'showMovieSettings',
    type: 'boolean' as const,
    default: false,
    description: 'Configure advanced movie-level settings',
    displayOptions: {
      hide: {
        advancedMode: [true],
        advancedModeMergeVideoAudio: [true],
        advancedModeMergeVideos: [true],
      },
    },
  },

  // Movie settings fields appear immediately after toggle
  {
    displayName: 'Movie ID',
    name: 'movieId',
    type: 'string' as const,
    default: '',
    description: 'Custom movie identifier (overrides record ID)',
    displayOptions: {
      show: { showMovieSettings: [true] },
      hide: {
        advancedMode: [true],
        advancedModeMergeVideoAudio: [true],
        advancedModeMergeVideos: [true],
      },
    },
  },
  {
    displayName: 'Movie Comment',
    name: 'movieComment',
    type: 'string' as const,
    default: '',
    description: 'Internal notes/memo for this movie',
    displayOptions: {
      show: { showMovieSettings: [true] },
      hide: {
        advancedMode: [true],
        advancedModeMergeVideoAudio: [true],
        advancedModeMergeVideos: [true],
      },
    },
  },
  {
    displayName: 'Movie Variables',
    name: 'movieVariables',
    type: 'json' as const,
    typeOptions: {
      alwaysOpenEditWindow: true,
    },
    default: '{}',
    description: 'Movie-level variables as JSON object for template usage',
    displayOptions: {
      show: { showMovieSettings: [true] },
      hide: {
        advancedMode: [true],
        advancedModeMergeVideoAudio: [true],
        advancedModeMergeVideos: [true],
      },
    },
  },
  {
    displayName: 'Movie Cache',
    name: 'movieCache',
    type: 'boolean' as const,
    default: true,
    description: 'Use cached render if available at movie level',
    displayOptions: {
      show: { showMovieSettings: [true] },
      hide: {
        advancedMode: [true],
        advancedModeMergeVideoAudio: [true],
        advancedModeMergeVideos: [true],
      },
    },
  },
  {
    displayName: 'Draft Mode',
    name: 'movieDraft',
    type: 'boolean' as const,
    default: false,
    description: 'Generate draft quality for faster preview',
    displayOptions: {
      show: { showMovieSettings: [true] },
      hide: {
        advancedMode: [true],
        advancedModeMergeVideoAudio: [true],
        advancedModeMergeVideos: [true],
      },
    },
  },
  {
    displayName: 'Client Data',
    name: 'clientData',
    type: 'json' as const,
    default: '{}',
    description: 'Custom key-value data for webhooks and callbacks',
    displayOptions: {
      show: { showMovieSettings: [true] },
      hide: {
        advancedMode: [true],
        advancedModeMergeVideoAudio: [true],
        advancedModeMergeVideos: [true],
      },
    },
  },
  {
    displayName: 'Movie Resolution',
    name: 'movieResolution',
    type: 'options' as const,
    options: [
      { name: 'Custom (use width/height)', value: 'custom' },
      { name: 'Standard Definition', value: 'sd' },
      { name: 'High Definition', value: 'hd' },
      { name: 'Full HD', value: 'full-hd' },
      { name: 'Square', value: 'squared' },
      { name: 'Instagram Story', value: 'instagram-story' },
      { name: 'Instagram Feed', value: 'instagram-feed' },
      { name: 'Twitter Landscape', value: 'twitter-landscape' },
      { name: 'Twitter Portrait', value: 'twitter-portrait' },
    ],
    default: 'custom',
    description: 'Video resolution preset (overrides output settings)',
    displayOptions: {
      show: { showMovieSettings: [true] },
      hide: {
        advancedMode: [true],
        advancedModeMergeVideoAudio: [true],
        advancedModeMergeVideos: [true],
      },
    },
  },

  // =============================================================================
  // MOVIE-LEVEL SUBTITLES (FOR CREATEMOVIE ONLY)
  // =============================================================================

  {
    displayName: 'Add Subtitles',
    name: 'enableSubtitles',
    type: 'boolean' as const,
    default: false,
    description: 'Add subtitles to the video (movie-level, appears across entire video)',
    displayOptions: {
      show: {
        operation: ['createMovie'],
      },
      hide: {
        advancedMode: [true],
        advancedModeMergeVideoAudio: [true],
        advancedModeMergeVideos: [true],
      },
    },
  },

  {
    displayName: 'Captions',
    name: 'captions',
    type: 'string' as const,
    typeOptions: { rows: 4 },
    default: '',
    placeholder: 'https://example.com/subtitles.srt OR paste subtitle content directly',
    description: 'URL to subtitle file (SRT, VTT, ASS) OR actual subtitle content as text. Leave empty to auto-generate from audio.',
    displayOptions: {
      show: {
        operation: ['createMovie'],
        enableSubtitles: [true],
      },
      hide: {
        advancedMode: [true],
        advancedModeMergeVideoAudio: [true],
        advancedModeMergeVideos: [true],
      },
    },
  },

  {
    displayName: 'Comment',
    name: 'subtitleComment',
    type: 'string' as const,
    default: '',
    placeholder: 'Internal comment about subtitles',
    description: 'Internal comment or note about the subtitle element',
    displayOptions: {
      show: {
        operation: ['createMovie'],
        enableSubtitles: [true],
      },
      hide: {
        advancedMode: [true],
        advancedModeMergeVideoAudio: [true],
        advancedModeMergeVideos: [true],
      },
    },
  },

  {
    displayName: 'Language',
    name: 'subtitleLanguage',
    type: 'options' as const,
    options: [
      { name: 'Auto-detect', value: 'auto' },
      { name: 'English', value: 'en' },
      { name: 'Spanish', value: 'es' },
      { name: 'French', value: 'fr' },
      { name: 'German', value: 'de' },
      { name: 'Italian', value: 'it' },
      { name: 'Portuguese', value: 'pt' },
      { name: 'Russian', value: 'ru' },
      { name: 'Japanese', value: 'ja' },
      { name: 'Korean', value: 'ko' },
      { name: 'Chinese (Simplified)', value: 'zh' },
      { name: 'Arabic', value: 'ar' },
      { name: 'Hindi', value: 'hi' },
      { name: 'Dutch', value: 'nl' },
      { name: 'Swedish', value: 'sv' },
      { name: 'Norwegian', value: 'no' },
      { name: 'Danish', value: 'da' },
      { name: 'Finnish', value: 'fi' },
      { name: 'Polish', value: 'pl' },
      { name: 'Czech', value: 'cs' },
      { name: 'Hungarian', value: 'hu' },
      { name: 'Romanian', value: 'ro' },
      { name: 'Bulgarian', value: 'bg' },
      { name: 'Croatian', value: 'hr' },
      { name: 'Serbian', value: 'sr' },
      { name: 'Slovak', value: 'sk' },
      { name: 'Slovenian', value: 'sl' },
      { name: 'Estonian', value: 'et' },
      { name: 'Latvian', value: 'lv' },
      { name: 'Lithuanian', value: 'lt' },
      { name: 'Greek', value: 'el' },
      { name: 'Turkish', value: 'tr' },
      { name: 'Hebrew', value: 'he' },
      { name: 'Thai', value: 'th' },
      { name: 'Vietnamese', value: 'vi' },
      { name: 'Indonesian', value: 'id' },
      { name: 'Malay', value: 'ms' },
      { name: 'Filipino', value: 'fil' },
    ],
    default: 'auto',
    description: 'Language code for subtitles or "auto" for auto-detection',
    displayOptions: {
      show: {
        operation: ['createMovie'],
        enableSubtitles: [true],
      },
      hide: {
        advancedMode: [true],
        advancedModeMergeVideoAudio: [true],
        advancedModeMergeVideos: [true],
      },
    },
  },

  {
    displayName: 'Transcription Model',
    name: 'subtitleModel',
    type: 'options' as const,
    options: [
      { name: 'Default', value: 'default' },
      { name: 'Whisper', value: 'whisper' },
    ],
    default: 'default',
    description: 'Transcription model to use when auto-generating subtitles from audio',
    displayOptions: {
      show: {
        operation: ['createMovie'],
        enableSubtitles: [true],
      },
      hide: {
        advancedMode: [true],
        advancedModeMergeVideoAudio: [true],
        advancedModeMergeVideos: [true],
      },
    },
  },

  {
    displayName: 'Subtitle Settings',
    name: 'subtitleSettings',
    type: 'json' as const,
    typeOptions: {
      alwaysOpenEditWindow: true,
    },
    default: `{
  "style": "classic",
  "font-family": "Arial",
  "font-size": 32,
  "position": "bottom-center",
  "word-color": "#FFFF00",
  "line-color": "#FFFFFF",
  "box-color": "#000000",
  "outline-color": "#000000",
  "outline-width": 2,
  "max-words-per-line": 4
}`,
    description: 'Subtitle styling and appearance settings as JSON object. Complete settings object with kebab-case properties.',
    displayOptions: {
      show: {
        operation: ['createMovie'],
        enableSubtitles: [true],
      },
      hide: {
        advancedMode: [true],
        advancedModeMergeVideoAudio: [true],
        advancedModeMergeVideos: [true],
      },
    },
  },

  // =============================================================================
  // UNIFIED ELEMENTS COLLECTION
  // =============================================================================

  // Main unified element collection
  {
    ...elementCollection,
    displayOptions: {
      hide: {
        advancedMode: [true],
        advancedModeMergeVideoAudio: [true],
        advancedModeMergeVideos: [true],
      },
    },
  },

  // =============================================================================
  // OUTPUT SETTINGS
  // =============================================================================

  {
    displayName: 'Output Settings',
    name: 'outputSettings',
    type: 'fixedCollection' as const,
    typeOptions: {
      multipleValues: false,
    },
    placeholder: 'Add Output Settings',
    description: 'Configure output video settings',
    displayOptions: {
      hide: {
        advancedMode: [true],
        advancedModeMergeVideoAudio: [true],
        advancedModeMergeVideos: [true],
      },
    },
    default: {},
    options: [
      {
        name: 'outputValues',
        displayName: 'Output Configuration',
        values: [
          {
            displayName: 'Output Width',
            name: 'width',
            type: 'number' as const,
            default: 1920,
            description: 'Video width in pixels',
          },
          {
            displayName: 'Output Height',
            name: 'height',
            type: 'number' as const,
            default: 1080,
            description: 'Video height in pixels',
          },
          {
            displayName: 'Quality',
            name: 'quality',
            type: 'options' as const,
            options: [
              { name: 'Low', value: 'low' },
              { name: 'Medium', value: 'medium' },
              { name: 'High', value: 'high' },
              { name: 'Very High', value: 'very_high' },
            ],
            default: 'high',
            description: 'Video quality setting',
          },
          {
            displayName: 'Cache',
            name: 'cache',
            type: 'boolean' as const,
            default: true,
            description: 'Use cached assets when possible for faster rendering',
          },
        ],
      },
    ],
  },

  // =============================================================================
  // EXPORT SETTINGS
  // =============================================================================

  {
    displayName: 'Export Settings',
    name: 'exportSettings',
    type: 'fixedCollection' as const,
    typeOptions: {
      multipleValues: true,
    },
    placeholder: 'Add Export Configuration',
    description: 'Configure video delivery methods',
    displayOptions: {
      hide: {
        advancedMode: [true],
        advancedModeMergeVideoAudio: [true],
        advancedModeMergeVideos: [true],
      },
    },
    default: {},
    options: [
      {
        name: 'exportValues',
        displayName: 'Export Configuration',
        values: [
          {
            displayName: 'Export Type',
            name: 'exportType',
            type: 'options' as const,
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
            displayName: 'Format',
            name: 'format',
            type: 'options' as const,
            options: [
              { name: 'MP4', value: 'mp4' },
              { name: 'WebM', value: 'webm' },
              { name: 'GIF', value: 'gif' },
            ],
            default: 'mp4',
            description: 'Video format for export',
          },
          {
            displayName: 'Quality',
            name: 'quality',
            type: 'options' as const,
            options: [
              { name: 'Low', value: 'low' },
              { name: 'Medium', value: 'medium' },
              { name: 'High', value: 'high' },
              { name: 'Very High', value: 'very_high' },
            ],
            default: 'high',
            description: 'Video quality setting',
          },
          // Webhook fields
          {
            displayName: 'Webhook URL',
            name: 'webhookUrl',
            type: 'string' as const,
            required: true,
            default: '',
            displayOptions: {
              show: { exportType: ['webhook'] },
            },
            typeOptions: {
              validation: [
                {
                  type: 'url',
                  properties: { protocols: ['https'] },
                },
              ],
            },
            description: 'HTTPS URL to receive webhook notifications when video is complete',
          },
          // FTP fields
          {
            displayName: 'FTP Host',
            name: 'ftpHost',
            type: 'string' as const,
            required: true,
            default: '',
            displayOptions: {
              show: { exportType: ['ftp'] },
            },
            description: 'FTP server hostname or IP address',
          },
          {
            displayName: 'FTP Username',
            name: 'ftpUsername',
            type: 'string' as const,
            required: true,
            default: '',
            displayOptions: {
              show: { exportType: ['ftp'] },
            },
            description: 'FTP username',
          },
          {
            displayName: 'FTP Password',
            name: 'ftpPassword',
            type: 'string' as const,
            typeOptions: { password: true },
            required: true,
            default: '',
            displayOptions: {
              show: { exportType: ['ftp'] },
            },
            description: 'FTP password',
          },
          {
            displayName: 'FTP Path',
            name: 'ftpPath',
            type: 'string' as const,
            default: '/',
            displayOptions: {
              show: { exportType: ['ftp'] },
            },
            description: 'Remote directory path for upload',
          },
          // Email fields
          {
            displayName: 'Email To',
            name: 'emailTo',
            type: 'string' as const,
            required: true,
            default: '',
            displayOptions: {
              show: { exportType: ['email'] },
            },
            typeOptions: {
              validation: [{ type: 'email' }],
            },
            description: 'Recipient email address',
          },
          {
            displayName: 'Email Subject',
            name: 'emailSubject',
            type: 'string' as const,
            default: 'Your video is ready',
            displayOptions: {
              show: { exportType: ['email'] },
            },
            description: 'Email subject line',
          },
          {
            displayName: 'Email Message',
            name: 'emailMessage',
            type: 'string' as const,
            typeOptions: { rows: 3 },
            default: '',
            displayOptions: {
              show: { exportType: ['email'] },
            },
            description: 'Email message body',
          },
        ],
      },
    ],
  },
];

// =============================================================================
// ADVANCED MODE PARAMETERS
// =============================================================================

export const unifiedAdvancedModeParameter: INodeProperties = {
  displayName: 'Advanced Mode',
  name: 'advancedMode',
  type: 'boolean' as const,
  default: false,
  description: 'Enable advanced mode for full JSON control (overrides all form settings)',
  displayOptions: {
    show: {
      operation: ['createMovie'],
    },
  },
};

export const mergeVideoAudioAdvancedModeParameter: INodeProperties = {
  displayName: 'Advanced Mode',
  name: 'advancedModeMergeVideoAudio',
  type: 'boolean' as const,
  default: false,
  description: 'Enable advanced mode for full JSON control (overrides all form settings)',
  displayOptions: {
    show: {
      operation: ['mergeVideoAudio'],
    },
  },
};

export const mergeVideosAdvancedModeParameter: INodeProperties = {
  displayName: 'Advanced Mode',
  name: 'advancedModeMergeVideos',
  type: 'boolean' as const,
  default: false,
  description: 'Enable advanced mode for full JSON control (overrides all form settings)',
  displayOptions: {
    show: {
      operation: ['mergeVideos'],
    },
  },
};

// =============================================================================
// JSON TEMPLATE PARAMETERS
// =============================================================================

export const unifiedJsonTemplateParameter: INodeProperties = {
  displayName: 'JSON Template',
  name: 'jsonTemplate',
  type: 'json' as const,
  displayOptions: {
    show: {
      operation: ['createMovie'],
      advancedMode: [true],
    },
  },
  default: `{
  "width": 1920,
  "height": 1080,
  "quality": "high",
  "elements": [
    {
      "type": "subtitles",
      "captions": "https://example.com/subtitles.srt"
    }
  ],
  "scenes": [
    {
      "elements": [
        {
          "type": "video",
          "src": "https://example.com/video.mp4"
        },
        {
          "type": "text",
          "text": "Hello World",
          "x": 100,
          "y": 100
        }
      ]
    }
  ]
}`,
  description: 'Complete JSON2Video API request template. This overrides all other settings.',
};

export const mergeVideoAudioJsonTemplateParameter: INodeProperties = {
  displayName: 'JSON Template',
  name: 'jsonTemplateMergeVideoAudio',
  type: 'json' as const,
  displayOptions: {
    show: {
      operation: ['mergeVideoAudio'],
      advancedModeMergeVideoAudio: [true],
    },
  },
  default: `{
  "width": 1920,
  "height": 1080,
  "scenes": [
    {
      "elements": [
        {
          "type": "video",
          "src": "https://example.com/video.mp4"
        },
        {
          "type": "audio", 
          "src": "https://example.com/audio.mp3"
        }
      ]
    }
  ]
}`,
  description: 'Complete JSON2Video API request template for merging video and audio.',
};

export const mergeVideosJsonTemplateParameter: INodeProperties = {
  displayName: 'JSON Template',
  name: 'jsonTemplateMergeVideos',
  type: 'json' as const,
  displayOptions: {
    show: {
      operation: ['mergeVideos'],
      advancedModeMergeVideos: [true],
    },
  },
  default: `{
  "width": 1920,
  "height": 1080,
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
  description: 'Complete JSON2Video API request template for merging multiple videos.',
};