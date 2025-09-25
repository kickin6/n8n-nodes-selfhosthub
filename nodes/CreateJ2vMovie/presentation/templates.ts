// nodes/CreateJ2vMovie/presentation/templates.ts

import { INodeProperties } from 'n8n-workflow';

/**
 * Template selector parameter for advanced mode
 */
export const templateSelectorParameter: INodeProperties = {
  displayName: 'Template',
  name: 'templateType',
  type: 'options',
  options: [
    {
      name: 'Blank Template',
      value: 'blank',
      description: 'Empty template to start from scratch',
    },
    {
      name: 'Video from images',
      value: 'videoImage',
      description: 'Create video from images',
    },
    {
      name: 'Video + Audio Merge',
      value: 'videoAudio',
      description: 'Merge video with audio track',
    },
    {
      name: 'Video Sequence',
      value: 'videoSequence',
      description: 'Merge multiple videos in sequence',
    },
    {
      name: 'Image Slideshow',
      value: 'slideshow',
      description: 'Create slideshow from images with transitions',
    },
    {
      name: 'Video with Text Overlay',
      value: 'textOverlay',
      description: 'Add text overlays to video',
    },
    {
      name: 'Faceless Video (TTS + Visuals)',
      value: 'faceless',
      description: 'Create faceless video with AI voice and visuals',
    },
    {
      name: 'Social Media Story (9:16)',
      value: 'socialStory',
      description: 'Vertical video for Instagram/TikTok',
    },
    {
      name: 'Presentation/Tutorial',
      value: 'presentation',
      description: 'Educational content with voice and visuals',
    },
  ],
  default: 'blank',
  description: 'Select a pre-built template to start with',
  displayOptions: {
    show: {
      advancedMode: [true],
    },
  },
};