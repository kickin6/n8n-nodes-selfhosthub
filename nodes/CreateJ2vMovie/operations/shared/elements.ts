// nodes/CreateJ2vMovie/operations/shared/elements.ts

import { INodeProperties } from 'n8n-workflow';

// =============================================================================
// COMMON ELEMENT FIELDS
// =============================================================================

export const commonElementFields: INodeProperties[] = [
  {
    displayName: 'Start Time (seconds)',
    name: 'start',
    type: 'number',
    default: 0,
    description: 'Start time in seconds',
  },
  {
    displayName: 'Duration (seconds)', 
    name: 'duration',
    type: 'number',
    default: -1,
    description: 'Duration in seconds (-1 = auto from media, -2 = match container, positive = explicit)',
  },
  {
    displayName: 'Z-Index',
    name: 'zIndex',
    type: 'number',
    default: 0,
    description: 'Stacking order (-99 to 99)',
  },
  {
    displayName: 'Fade In Duration',
    name: 'fadeIn',
    type: 'number',
    default: 0,
    description: 'Fade in duration in seconds',
  },
  {
    displayName: 'Fade Out Duration',
    name: 'fadeOut',
    type: 'number',
    default: 0,
    description: 'Fade out duration in seconds',
  },
];

// =============================================================================
// COMPLETE ELEMENT DEFINITION - FIXED
// =============================================================================

export const completeElementFields: INodeProperties[] = [
  {
    displayName: 'Element Type',
    name: 'type',
    type: 'options',
    options: [
      { name: 'Video', value: 'video' },
      { name: 'Audio', value: 'audio' },
      { name: 'Image', value: 'image' },
      { name: 'Text', value: 'text' },
      { name: 'Voice (Text-to-Speech)', value: 'voice' },
      { name: 'Subtitles', value: 'subtitles' },
      { name: 'Component', value: 'component' },
      { name: 'Audiogram', value: 'audiogram' },
    ],
    default: 'video',
    description: 'Type of element to add',
  },
  
  // COMMON FIELDS - NO displayOptions restrictions
  ...commonElementFields,
  
  // POSITIONING - NO type restrictions to avoid circular dependencies
  {
    displayName: 'Position',
    name: 'position',
    type: 'options',
    options: [
      { name: 'Custom (Set X/Y)', value: 'custom' },
      { name: 'Top Left', value: 'top-left' },
      { name: 'Top Center', value: 'top-center' },
      { name: 'Top Right', value: 'top-right' },
      { name: 'Center Left', value: 'center-left' },
      { name: 'Center Center', value: 'center-center' },
      { name: 'Center Right', value: 'center-right' },
      { name: 'Bottom Left', value: 'bottom-left' },
      { name: 'Bottom Center', value: 'bottom-center' },
      { name: 'Bottom Right', value: 'bottom-right' },
    ],
    default: 'center-center',
    description: 'Position preset for the element',
    // NO displayOptions here - this was causing the circular dependency
  },
  {
    displayName: 'X Position',
    name: 'x',
    type: 'number',
    default: 0,
    description: 'X coordinate when position is custom',
    displayOptions: {
      show: {
        position: ['custom'], // This is OK - references sibling parameter
      },
    },
  },
  {
    displayName: 'Y Position',
    name: 'y',
    type: 'number',
    default: 0,
    description: 'Y coordinate when position is custom',
    displayOptions: {
      show: {
        position: ['custom'], // This is OK - references sibling parameter
      },
    },
  },
  {
    displayName: 'Width',
    name: 'width',
    type: 'number',
    default: -1,
    description: 'Element width (-1 = auto)',
    // NO displayOptions here - was causing circular dependency
  },
  {
    displayName: 'Height',
    name: 'height',
    type: 'number',
    default: -1,
    description: 'Element height (-1 = auto)',
    // NO displayOptions here - was causing circular dependency
  },

  // VIDEO-SPECIFIC FIELDS - NO type restrictions
  {
    displayName: 'Video URL',
    name: 'src',
    type: 'string',
    default: '',
    description: 'URL of the video file (for video elements)',
    // REMOVED: displayOptions that referenced 'type'
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
    description: 'Volume level (0-10) for video/audio elements',
    // REMOVED: displayOptions that referenced 'type'
  },
  {
    displayName: 'Muted',
    name: 'muted',
    type: 'boolean',
    default: false,
    description: 'Mute the audio for video/audio elements',
    // REMOVED: displayOptions that referenced 'type'
  },
  {
    displayName: 'Loop',
    name: 'loop',
    type: 'boolean',
    default: false,
    description: 'Loop the media if shorter than scene',
    // REMOVED: displayOptions that referenced 'type'
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
    description: 'How to resize media to fit dimensions',
    // REMOVED: displayOptions that referenced 'type'
  },

  // TEXT-SPECIFIC FIELDS - NO type restrictions
  {
    displayName: 'Text Content',
    name: 'text',
    type: 'string',
    default: '',
    description: 'Text content to display (for text/voice elements)',
    // REMOVED: displayOptions that referenced 'type'
  },
  {
    displayName: 'Font Family',
    name: 'fontFamily',
    type: 'string',
    default: 'Arial',
    description: 'Font family (for text elements)',
    // REMOVED: displayOptions that referenced 'type'
  },
  {
    displayName: 'Font Size',
    name: 'fontSize',
    type: 'number',
    default: 32,
    description: 'Font size in pixels (for text elements)',
    // REMOVED: displayOptions that referenced 'type'
  },
  {
    displayName: 'Font Color',
    name: 'fontColor',
    type: 'color',
    default: '#ffffff',
    description: 'Text color (for text elements)',
    // REMOVED: displayOptions that referenced 'type'
  },

  // IMAGE-SPECIFIC FIELDS - NO type restrictions
  {
    displayName: 'Image Source Type',
    name: 'imageSourceType',
    type: 'options',
    options: [
      { name: 'URL', value: 'url' },
      { name: 'AI Generated', value: 'ai' },
    ],
    default: 'url',
    description: 'Use existing image or generate with AI (for image elements)',
    // REMOVED: displayOptions that referenced 'type'
  },
  {
    displayName: 'AI Prompt',
    name: 'prompt',
    type: 'string',
    default: '',
    description: 'Text prompt for AI image generation',
    displayOptions: {
      show: {
        imageSourceType: ['ai'], // This is OK - references sibling parameter
      },
    },
  },
  {
    displayName: 'AI Model',
    name: 'model',
    type: 'options',
    options: [
      { name: 'Flux Pro', value: 'flux-pro' },
      { name: 'Flux Schnell', value: 'flux-schnell' },
      { name: 'Freepik Classic', value: 'freepik-classic' },
    ],
    default: 'flux-schnell',
    description: 'AI model for image generation',
    displayOptions: {
      show: {
        imageSourceType: ['ai'], // This is OK - references sibling parameter
      },
    },
  },

  // VOICE-SPECIFIC FIELDS - NO type restrictions
  {
    displayName: 'Voice',
    name: 'voice',
    type: 'string',
    default: 'en-US-AriaNeural',
    description: 'Voice ID to use for text-to-speech (for voice elements)',
    // REMOVED: displayOptions that referenced 'type'
  },

  // SUBTITLES-SPECIFIC FIELDS - NO type restrictions
  {
    displayName: 'Captions',
    name: 'captions',
    type: 'string',
    default: '',
    description: 'Subtitle content or URL (for subtitle elements)',
    // REMOVED: displayOptions that referenced 'type'
  },

  // COMPONENT-SPECIFIC FIELDS - NO type restrictions
  {
    displayName: 'Component ID',
    name: 'component',
    type: 'string',
    default: '',
    description: 'Pre-defined component ID from library (for component elements)',
    // REMOVED: displayOptions that referenced 'type'
  },

  // AUDIOGRAM-SPECIFIC FIELDS - NO type restrictions
  {
    displayName: 'Wave Color',
    name: 'color',
    type: 'color',
    default: '#ffffff',
    description: 'Color of the audio waveform (for audiogram elements)',
    // REMOVED: displayOptions that referenced 'type'
  },
];

// =============================================================================
// COMPATIBILITY EXPORTS - Keep existing structure
// =============================================================================

// Export empty arrays for compatibility with existing imports
export const positionFields: INodeProperties[] = [];
export const videoElementFields: INodeProperties[] = [];
export const audioElementFields: INodeProperties[] = [];
export const imageElementFields: INodeProperties[] = [];
export const textElementFields: INodeProperties[] = [];
export const voiceElementFields: INodeProperties[] = [];
export const subtitlesElementFields: INodeProperties[] = [];
export const componentElementFields: INodeProperties[] = [];
export const audiogramElementFields: INodeProperties[] = [];