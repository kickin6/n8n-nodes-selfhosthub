// nodes/CreateJ2vMovie/shared/movieParams.ts

import { INodeProperties } from 'n8n-workflow';

export const recordIdParameter: INodeProperties = {
  displayName: 'Record ID',
  name: 'recordId',
  type: 'string',
  required: false,
  default: '',
  description: 'Optional identifier. If not provided, JSON2Video will auto-generate one.',
};

export const exportSettingsParameter: INodeProperties = {
  displayName: 'Export Settings',
  name: 'exportSettings',
  type: 'fixedCollection',
  typeOptions: {
    multipleValues: true,
  },
  placeholder: 'Add Export Configuration',
  description: 'Configure how the generated video should be delivered (webhook, FTP, email)',
  default: {},
  options: [
    {
      name: 'exportValues',
      displayName: 'Export Configuration',
      values: [
        // Export Type Selector
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

        // Basic Export Settings (all types)
        {
          displayName: 'Format',
          name: 'format',
          type: 'options',
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
          type: 'options',
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
          displayName: 'Resolution',
          name: 'resolution',
          type: 'string',
          default: '',
          placeholder: 'e.g. 1920x1080',
          description: 'Custom resolution (optional, format: WIDTHxHEIGHT)',
        },
        {
          displayName: 'Width',
          name: 'width',
          type: 'number',
          default: undefined,
          description: 'Custom width in pixels (optional)',
        },
        {
          displayName: 'Height',
          name: 'height',
          type: 'number',
          default: undefined,
          description: 'Custom height in pixels (optional)',
        },

        // Webhook-specific fields
        {
          displayName: 'Webhook URL',
          name: 'webhookUrl',
          type: 'string',
          required: true,
          default: '',
          displayOptions: {
            show: {
              exportType: ['webhook'],
            },
          },
          typeOptions: {
            validation: [
              {
                type: 'url',
                properties: {
                  protocols: ['https'],
                },
              },
            ],
          },
          description: 'HTTPS URL to receive webhook notifications when video is complete',
        },

        // FTP-specific fields
        {
          displayName: 'FTP Host',
          name: 'ftpHost',
          type: 'string',
          required: true,
          default: '',
          displayOptions: {
            show: {
              exportType: ['ftp'],
            },
          },
          description: 'FTP server hostname or IP address',
        },
        {
          displayName: 'Port',
          name: 'ftpPort',
          type: 'number',
          default: 21,
          displayOptions: {
            show: {
              exportType: ['ftp'],
            },
          },
          description: 'FTP server port (21 for FTP, 22 for SFTP)',
        },
        {
          displayName: 'Username',
          name: 'ftpUsername',
          type: 'string',
          required: true,
          default: '',
          displayOptions: {
            show: {
              exportType: ['ftp'],
            },
          },
          description: 'FTP username',
        },
        {
          displayName: 'Password',
          name: 'ftpPassword',
          type: 'string',
          typeOptions: {
            password: true,
          },
          required: true,
          default: '',
          displayOptions: {
            show: {
              exportType: ['ftp'],
            },
          },
          description: 'FTP password',
        },
        {
          displayName: 'Upload Path',
          name: 'ftpPath',
          type: 'string',
          default: '/',
          displayOptions: {
            show: {
              exportType: ['ftp'],
            },
          },
          description: 'Remote directory path for upload',
        },
        {
          displayName: 'Secure Connection (SFTP)',
          name: 'ftpSecure',
          type: 'boolean',
          default: false,
          displayOptions: {
            show: {
              exportType: ['ftp'],
            },
          },
          description: 'Use SFTP (SSH File Transfer Protocol) instead of FTP',
        },

        // Email-specific fields
        {
          displayName: 'To Address(es)',
          name: 'emailTo',
          type: 'string',
          required: true,
          default: '',
          displayOptions: {
            show: {
              exportType: ['email'],
            },
          },
          typeOptions: {
            validation: [
              {
                type: 'email',
              },
            ],
          },
          description: 'Recipient email address(es), comma-separated for multiple recipients',
        },
        {
          displayName: 'From Address',
          name: 'emailFrom',
          type: 'string',
          default: '',
          displayOptions: {
            show: {
              exportType: ['email'],
            },
          },
          typeOptions: {
            validation: [
              {
                type: 'email',
              },
            ],
          },
          description: 'Sender email address (optional)',
        },
        {
          displayName: 'Subject',
          name: 'emailSubject',
          type: 'string',
          default: '',
          displayOptions: {
            show: {
              exportType: ['email'],
            },
          },
          description: 'Email subject line (optional)',
        },
        {
          displayName: 'Message',
          name: 'emailMessage',
          type: 'string',
          typeOptions: {
            rows: 3,
          },
          default: '',
          displayOptions: {
            show: {
              exportType: ['email'],
            },
          },
          description: 'Email message body (optional)',
        },
      ],
    },
  ],
};

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

export const cacheParameter: INodeProperties = {
  displayName: 'Cache',
  name: 'cache',
  type: 'boolean',
  default: true,
  description: 'Override the cache setting in the JSON template',
};

export const draftParameter: INodeProperties = {
  displayName: 'Draft',
  name: 'draft',
  type: 'boolean',
  default: false,
  description: 'Override the draft setting in the JSON template',
};

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

export const outputSettingsCollection: INodeProperties = {
  displayName: 'Output Settings',
  name: 'outputSettings',
  type: 'fixedCollection',
  typeOptions: {
    multipleValues: false,
  },
  placeholder: 'Configure Output Settings',
  description: 'Video output configuration - resolution, quality, and format settings',
  default: {},
  options: [
    {
      name: 'outputDetails',
      displayName: 'Output Configuration',
      values: [
        {
          displayName: 'Resolution',
          name: 'resolution',
          type: 'options',
          options: [
            { name: 'HD (720p)', value: 'hd' },
            { name: 'Full HD (1080p)', value: 'full-hd' },
            { name: '4K (2160p)', value: '4k' },
            { name: 'Custom', value: 'custom' },
          ],
          default: 'full-hd',
          description: 'Video resolution preset',
        },
        {
          displayName: 'Width',
          name: 'width',
          type: 'number',
          typeOptions: {
            minValue: 50,
            maxValue: 3840,
            numberPrecision: 0,
          },
          displayOptions: {
            show: {
              resolution: ['custom'],
            },
          },
          default: 640,
          description: 'Custom output width in pixels (only when resolution is Custom)',
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
          displayOptions: {
            show: {
              resolution: ['custom'],
            },
          },
          default: 360,
          description: 'Custom output height in pixels (only when resolution is Custom)',
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
          description: 'Video quality setting',
        },
        {
          displayName: 'Cache',
          name: 'cache',
          type: 'boolean',
          default: true,
          description: 'Use cached assets when possible for faster rendering',
        },
      ],
    },
  ],
};

export const developmentSettingsCollection: INodeProperties = {
  displayName: 'Development Settings',
  name: 'developmentSettings',
  type: 'fixedCollection',
  typeOptions: {
    multipleValues: false,
  },
  placeholder: 'Add Development Settings',
  description: 'Advanced development and testing options',
  default: {},
  options: [
    {
      name: 'devDetails',
      displayName: 'Development Options',
      values: [
        {
          displayName: 'Draft Mode',
          name: 'draft',
          type: 'boolean',
          default: false,
          description: 'Generate draft quality for faster preview',
        },
        // NEW: Add export settings to development collection
        exportSettingsParameter,
      ],
    },
  ],
};

export const advancedModeParameters = {
  createMovie: {
    displayName: 'Advanced Mode',
    name: 'advancedMode',
    type: 'boolean',
    default: false,
    description: 'Use JSON template with override parameters instead of the form interface',
  } as INodeProperties,
  mergeVideoAudio: {
    displayName: 'Advanced Mode',
    name: 'advancedModeMergeVideoAudio',
    type: 'boolean',
    default: false,
    description: 'Use JSON template with override parameters instead of the form interface',
  } as INodeProperties,
  mergeVideos: {
    displayName: 'Advanced Mode',
    name: 'advancedModeMergeVideos',
    type: 'boolean',
    default: false,
    description: 'Use JSON template with override parameters instead of the form interface',
  } as INodeProperties,
};

export const jsonTemplateParameters = {
  createMovie: {
    displayName: 'JSON Template',
    name: 'jsonTemplate',
    type: 'json',
    typeOptions: {
      rows: 10,
    },
    default: '{\n  "width": 1920,\n  "height": 1080,\n  "quality": "high",\n  "scenes": [\n    {\n      "elements": []\n    }\n  ]\n}',
    description: 'JSON2Video API request template. Override specific values using the parameters below.',
  } as INodeProperties,
  mergeVideoAudio: {
    displayName: 'JSON Template',
    name: 'jsonTemplateMergeVideoAudio',
    type: 'json',
    typeOptions: {
      rows: 8,
    },
    default: '{\n  "width": 1920,\n  "height": 1080,\n  "scenes": [\n    {\n      "elements": [\n        {\n          "type": "video",\n          "src": "https://example.com/video.mp4"\n        },\n        {\n          "type": "audio",\n          "src": "https://example.com/audio.mp3"\n        }\n      ]\n    }\n  ]\n}',
    description: 'JSON2Video API request template for merging video and audio. Override specific values using the parameters below.',
  } as INodeProperties,
  mergeVideos: {
    displayName: 'JSON Template',
    name: 'jsonTemplateMergeVideos',
    type: 'json',
    typeOptions: {
      rows: 12,
    },
    default: '{\n  "width": 1920,\n  "height": 1080,\n  "scenes": [\n    {\n      "elements": [\n        {\n          "type": "video",\n          "src": "https://example.com/video1.mp4"\n        }\n      ]\n    },\n    {\n      "elements": [\n        {\n          "type": "video",\n          "src": "https://example.com/video2.mp4"\n        }\n      ]\n    }\n  ]\n}',
    description: 'JSON2Video API request template for merging multiple videos. Override specific values using the parameters below.',
  } as INodeProperties,
};

export function createAdvancedModeOverrides(
  operation: string,
  advancedModeParamName: string
): INodeProperties[] {
  return [
    recordIdParameter,
    outputWidthParameter,
    outputHeightParameter,
    {
      ...qualityParameter,
      default: undefined,
      description: 'Override the quality in the JSON template',
    },
    cacheParameter,
    draftParameter,
    resolutionParameter,
  ];
}

export function createBasicModeParams(
  operation: string,
  advancedModeParamName: string
): INodeProperties[] {
  return [
    recordIdParameter,
    exportSettingsParameter,
  ];
}