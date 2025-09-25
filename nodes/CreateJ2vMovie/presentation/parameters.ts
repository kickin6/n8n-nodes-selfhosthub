// nodes/CreateJ2vMovie/presentation/parameters.ts

import { INodeProperties } from 'n8n-workflow';
import { elementCollection } from './fields';
import { templateSelectorParameter } from './templates';

/**
 * Parameters collection for video creation
 */
export const unifiedParameters: INodeProperties[] = [
  {
    displayName: 'Record ID',
    name: 'recordId',
    type: 'string' as const,
    default: '',
    description: 'Optional record identifier for tracking. If not provided, JSON2Video will auto-generate one.',
  },

  // Movie settings toggle and fields
  {
    displayName: 'Movie Settings [<a href="https://json2video.com/docs/v2/api-reference/json-syntax/movie" target=_blank>Doc</a>]',
    name: 'movieSettingsDivider',
    type: 'notice',
    default: '',
    description: 'Movie Settings divider',
    displayOptions: {
      hide: {
        advancedMode: [true],
      },
    },
  },
  {
    displayName: 'Show/Hide',
    name: 'showMovieSettings',
    type: 'boolean' as const,
    default: false,
    description: 'Configure advanced movie-level settings',
    displayOptions: {
      hide: {
        advancedMode: [true],
      },
    },
  },
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
      },
    },
  },
  {
    displayName: 'Movie Resolution',
    name: 'movieResolution',
    type: 'options' as const,
    options: [
      { name: 'Custom (use Output Settings width/height)', value: 'custom' },
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
      },
    },
  },

  // Movie-level subtitles
  {
    displayName: 'Subtitles [<a href="https://json2video.com/docs/v2/api-reference/json-syntax/element/subtitles" target=_blank>Doc</a> | <a href="https://json2video.com/docs/v2/api-reference/json-syntax/element/subtitles#settings" target=_blank>Settings</a>]',
    name: 'subtitlesDivider',
    type: 'notice',
    default: '',
    description: 'Subtitles divider',
    displayOptions: {
      hide: {
        advancedMode: [true],
      },
    },
  },
  {
    displayName: 'Show/Hide',
    name: 'enableSubtitles',
    type: 'boolean' as const,
    default: false,
    description: 'Add subtitles to the video (movie-level, appears across entire video)',
    displayOptions: {
      hide: {
        advancedMode: [true],
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
        enableSubtitles: [true],
      },
      hide: {
        advancedMode: [true],
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
        enableSubtitles: [true],
      },
      hide: {
        advancedMode: [true],
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
        enableSubtitles: [true],
      },
      hide: {
        advancedMode: [true],
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
        enableSubtitles: [true],
      },
      hide: {
        advancedMode: [true],
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
    description: 'Subtitle settings [<a href="https://json2video.com/docs/v2/api-reference/json-syntax/element/subtitles#settings" target=_blank>Doc</a>]',
    displayOptions: {
      show: {
        enableSubtitles: [true],
      },
      hide: {
        advancedMode: [true],
      },
    },
  },

  // Elements collection
  {
    ...elementCollection,
    displayOptions: {
      hide: {
        advancedMode: [true],
      },
    },
  },

  // Output settings
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

  // Export settings - Updated for v2 API format
  {
    displayName: 'Export Settings',
    name: 'exportSettings',
    type: 'fixedCollection' as const,
    typeOptions: {
      multipleValues: true,
    },
    placeholder: 'Add Export Destination',
    description: 'Configure export settings [<a href="https://json2video.com/docs/v2/api-reference/exports" target=_blank>Doc</a>]',
    displayOptions: {
      hide: {
        advancedMode: [true],
      },
    },
    default: {},
    options: [
      {
        name: 'exportValues',
        displayName: 'Export Destination',
        values: [
          {
            displayName: 'Destination Type',
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
            displayName: 'FTP Port',
            name: 'ftpPort',
            type: 'number' as const,
            default: 21,
            typeOptions: { minValue: 1, maxValue: 65535 },
            displayOptions: {
              show: { exportType: ['ftp'] },
            },
            description: 'FTP server port (default: 21 for FTP, 22 for SFTP)',
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
            displayName: 'Remote Path',
            name: 'ftpPath',
            type: 'string' as const,
            default: '/',
            displayOptions: {
              show: { exportType: ['ftp'] },
            },
            description: 'Remote directory path for upload (e.g., /videos/)',
          },
          {
            displayName: 'File Name',
            name: 'ftpFile',
            type: 'string' as const,
            default: '',
            displayOptions: {
              show: { exportType: ['ftp'] },
            },
            description: 'Custom filename for uploaded video (optional - auto-generated if empty)',
          },
          {
            displayName: 'Use SFTP (Secure)',
            name: 'ftpSecure',
            type: 'boolean' as const,
            default: false,
            displayOptions: {
              show: { exportType: ['ftp'] },
            },
            description: 'Use SFTP (secure) instead of regular FTP',
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
            displayName: 'Email From',
            name: 'emailFrom',
            type: 'string' as const,
            default: '',
            displayOptions: {
              show: { exportType: ['email'] },
            },
            typeOptions: {
              validation: [{ type: 'email' }],
            },
            description: 'Sender email address (optional)',
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

/**
 * Advanced mode parameter
 */
export const unifiedAdvancedModeParameter: INodeProperties = {
  displayName: 'Advanced Mode',
  name: 'advancedMode',
  type: 'boolean' as const,
  default: false,
  description: 'Enable advanced mode for full JSON control (overrides all form settings)',
};

/**
 * JSON template parameters - one for each template type
 */
export const jsonTemplateBlank: INodeProperties = {
  displayName: 'JSON Template',
  name: 'jsonTemplateBlank',
  type: 'json' as const,
  displayOptions: {
    show: {
      advancedMode: [true],
      templateType: ['blank'],
    },
  },
  default: `{
  "width": 1920,
  "height": 1080,
  "quality": "high",
  "scenes": [
    {
      "elements": []
    }
  ]
}`,
  description: 'Blank template - add your own elements and scenes',
};

export const jsonTemplateVideoImage: INodeProperties = {
  displayName: 'JSON Template', 
  name: 'jsonTemplateVideoImage',
  type: 'json' as const,
  displayOptions: {
    show: {
      advancedMode: [true],
      templateType: ['videoImage'],
    },
  },
  default: `{
  "width": 1920,
  "height": 1080,
  "quality": "high",
  "scenes": [
    {
      "elements": [
        {
          "type": "image",
          "src": "{{  /* image0Url */ }}",
          "start": 0,
          "duration": 5,
          "resize": "cover",
          "zoom": 3
        },
        {
          "type": "image",
          "src": "{{  /* image1Url */ }}",
          "start": 5,
          "duration": 5,
          "resize": "cover",
          "zoom": 3
        },
        {
          "type": "image",
          "src": "{{  /* image2Url */ }}",
          "start": 10,
          "duration": 5,
          "resize": "cover",
          "zoom": 3
        }
      ]
    }
  ]
}`,
  description: 'Create video from images. Requires: image0Url, image1Url, image2Url',
};

export const jsonTemplateVideoAudio: INodeProperties = {
  displayName: 'JSON Template', 
  name: 'jsonTemplateVideoAudio',
  type: 'json' as const,
  displayOptions: {
    show: {
      advancedMode: [true],
      templateType: ['videoAudio'],
    },
  },
  default: `{
  "width": 1920,
  "height": 1080,
  "quality": "high",
  "scenes": [
    {
      "elements": [
        {
          "type": "video",
          "src": "{{  /* video0Url */ }}",
          "volume": 0.3
        },
        {
          "type": "audio",
          "src": "{{  /* audio0Url */ }}",
          "volume": 1
        }
      ]
    }
  ]
}`,
  description: 'Merge video with audio. Requires: video0Url, audio0Url',
};

export const jsonTemplateVideoSequence: INodeProperties = {
  displayName: 'JSON Template',
  name: 'jsonTemplateVideoSequence', 
  type: 'json' as const,
  displayOptions: {
    show: {
      advancedMode: [true],
      templateType: ['videoSequence'],
    },
  },
  default: `{
  "width": 1920,
  "height": 1080,
  "quality": "high",
  "scenes": [
    {
      "elements": [
        {
          "type": "video",
          "src": "{{  /* video0Url */ }}",
          "start": 0,
          "duration": -1
        },
        {
          "type": "video",
          "src": "{{  /* video1Url */ }}",
          "start": 10,
          "duration": -1
        },
        {
          "type": "video",
          "src": "{{  /* video2Url */ }}",
          "start": 20,
          "duration": -1
        }
      ]
    }
  ]
}`,
  description: 'Sequence of videos. Requires: video0Url, video1Url, video2Url',
};

export const jsonTemplateSlideshow: INodeProperties = {
  displayName: 'JSON Template',
  name: 'jsonTemplateSlideshow',
  type: 'json' as const,
  displayOptions: {
    show: {
      advancedMode: [true],
      templateType: ['slideshow'],
    },
  },
  default: `{
  "width": 1920,
  "height": 1080,
  "quality": "high",
  "elements": [
    {
      "type": "audio",
      "src": "{{  /* audio0Url */ }}",
      "volume": 0.5,
      "duration": -2
    }
  ],
  "scenes": [
    {
      "elements": [
        {
          "type": "image",
          "src": "{{  /* image0Url */ }}",
          "start": 0,
          "duration": 4,
          "resize": "cover"
        },
        {
          "type": "image",
          "src": "{{  /* image1Url */ }}",
          "start": 4,
          "duration": 4,
          "resize": "cover"
        },
        {
          "type": "image",
          "src": "{{  /* image2Url */ }}",
          "start": 8,
          "duration": 4,
          "resize": "cover"
        }
      ]
    }
  ]
}`,
  description: 'Image slideshow with music. Requires: image0Url, image1Url, image2Url, audio0Url',
};

export const jsonTemplateTextOverlay: INodeProperties = {
  displayName: 'JSON Template',
  name: 'jsonTemplateTextOverlay',
  type: 'json' as const,
  displayOptions: {
    show: {
      advancedMode: [true],
      templateType: ['textOverlay'],
    },
  },
  default: `{
  "width": 1920,
  "height": 1080,
  "quality": "high",
  "scenes": [
    {
      "elements": [
        {
          "type": "video",
          "src": "{{  /* video0Url */ }}"
        },
        {
          "type": "text",
          "text": "{{  /* text0 */ }}",
          "start": 1,
          "duration": 3,
          "position": "center-center",
          "style": "001",
          "settings": {
            "font-size": "6vw",
            "font-family": "Inter",
            "font-weight": "700",
            "text-align": "center",
            "font-color": "#FFFFFF",
            "text-shadow": "2px 2px 4px rgba(0,0,0,0.8)"
          }
        },
        {
          "type": "text",
          "text": "{{  /* text1 */ }}",
          "start": 2,
          "duration": 3,
          "position": "bottom-center",
          "y": -100,
          "style": "001",
          "settings": {
            "font-size": "3vw",
            "font-family": "Inter",
            "font-weight": "400",
            "text-align": "center",
            "font-color": "#FFFFFF",
            "text-shadow": "1px 1px 2px rgba(0,0,0,0.8)"
          }
        }
      ]
    }
  ]
}`,
  description: 'Video with text overlays. Requires: video0Url, text0, text1',
};

export const jsonTemplateFaceless: INodeProperties = {
  displayName: 'JSON Template',
  name: 'jsonTemplateFaceless',
  type: 'json' as const,
  displayOptions: {
    show: {
      advancedMode: [true],
      templateType: ['faceless'],
    },
  },
  default: `{
  "width": 1920,
  "height": 1080,
  "quality": "high",
  "elements": [
    {
      "type": "subtitles",
      "captions": "",
      "language": "en",
      "model": "default",
      "settings": {
        "style": "classic",
        "font-family": "Arial",
        "font-size": 42,
        "position": "bottom-center",
        "word-color": "#FFFF00",
        "line-color": "#FFFFFF",
        "box-color": "rgba(0,0,0,0.7)",
        "outline-width": 2
      }
    },
    {
      "type": "audio",
      "src": "{{  /* audio0Url */ }}",
      "volume": 0.2,
      "duration": -2
    }
  ],
  "scenes": [
    {
      "elements": [
        {
          "type": "image",
          "prompt": "{{  /* prompt0 */ }}",
          "model": "flux-schnell",
          "resize": "cover",
          "start": 0,
          "duration": 10
        },
        {
          "type": "voice",
          "text": "{{  /* text0 */ }}",
          "voice": "en-US-AriaNeural",
          "model": "azure",
          "start": 0,
          "duration": 10
        },
        {
          "type": "image",
          "prompt": "{{  /* prompt1 */ }}",
          "model": "flux-schnell",
          "resize": "cover",
          "start": 10,
          "duration": 10
        },
        {
          "type": "voice",
          "text": "{{  /* text1 */ }}",
          "voice": "en-US-AriaNeural",
          "model": "azure",
          "start": 10,
          "duration": 10
        }
      ]
    }
  ]
}`,
  description: 'Faceless video with AI voice and images. Requires: prompt0, text0, prompt1, text1, audio0Url',
};

export const jsonTemplateSocialStory: INodeProperties = {
  displayName: 'JSON Template',
  name: 'jsonTemplateSocialStory',
  type: 'json' as const,
  displayOptions: {
    show: {
      advancedMode: [true],
      templateType: ['socialStory'],
    },
  },
  default: `{
  "width": 1080,
  "height": 1920,
  "quality": "high",
  "elements": [
    {
      "type": "audio",
      "src": "{{  /* audio0Url */ }}",
      "volume": 0.8,
      "duration": -2
    }
  ],
  "scenes": [
    {
      "duration": 7,
      "elements": [
        {
          "type": "video",
          "src": "{{  /* video0Url */ }}",
          "resize": "cover",
          "muted": true,
          "duration": -2
        },
        {
          "type": "text",
          "text": "{{  /* text0 */ }}",
          "position": "center-center",
          "start": 0,
          "duration": 3,
          "style": "007",
          "settings": {
            "font-size": "8vw",
            "font-family": "Montserrat",
            "font-weight": "900",
            "text-align": "center",
            "font-color": "#FFFFFF",
            "text-transform": "uppercase",
            "text-shadow": "3px 3px 6px rgba(0,0,0,0.9)"
          },
          "fade-in": 0.3,
          "fade-out": 0.3
        },
        {
          "type": "text",
          "text": "{{  /* text1 */ }}",
          "position": "center-center",
          "start": 3,
          "duration": 4,
          "style": "006",
          "settings": {
            "font-size": "6vw",
            "font-family": "Montserrat",
            "font-weight": "700",
            "text-align": "center",
            "font-color": "#FFFF00",
            "text-shadow": "2px 2px 4px rgba(0,0,0,0.9)"
          }
        }
      ]
    }
  ]
}`,
  description: 'Vertical social media video. Requires: video0Url, text0, text1, audio0Url',
};

export const jsonTemplatePresentation: INodeProperties = {
  displayName: 'JSON Template',
  name: 'jsonTemplatePresentation',
  type: 'json' as const,
  displayOptions: {
    show: {
      advancedMode: [true],
      templateType: ['presentation'],
    },
  },
  default: `{
  "width": 1920,
  "height": 1080,
  "quality": "high",
  "elements": [
    {
      "type": "subtitles",
      "captions": "",
      "language": "auto",
      "model": "whisper",
      "settings": {
        "style": "classic",
        "position": "bottom-center",
        "font-size": 36,
        "word-color": "#FFFF00",
        "line-color": "#FFFFFF",
        "max-words-per-line": 6
      }
    }
  ],
  "scenes": [
    {
      "elements": [
        {
          "type": "html",
          "html": "<div style='background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; flex-direction: column;'><h1 style='color: white; font-size: 72px; font-family: Inter; margin-bottom: 20px;'>{{  /* text0 */ }}</h1><p style='color: rgba(255,255,255,0.9); font-size: 36px; font-family: Inter;'>{{  /* text1 */ }}</p></div>",
          "duration": -2
        },
        {
          "type": "voice",
          "text": "{{  /* text2 */ }}",
          "voice": "en-US-JennyNeural",
          "model": "azure"
        }
      ]
    }
  ]
}`,
  description: 'Presentation/tutorial video. Requires: text0, text1, text2',
};