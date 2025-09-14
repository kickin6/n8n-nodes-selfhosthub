// nodes/CreateJ2vMovie/shared/elementFields.ts

import { INodeProperties } from 'n8n-workflow';

// =============================================================================
// ELEMENT TYPE GROUPS FOR displayOptions.show
// =============================================================================

// All elements except subtitles (subtitles only has basic properties)
const COMMON_ELEMENT_TYPES = ['video', 'audio', 'image', 'text', 'voice', 'component', 'html', 'audiogram'];

// Elements that support full visual transformations
const VISUAL_ELEMENT_TYPES = ['video', 'image', 'component', 'html', 'audiogram'];

// Elements that support basic positioning (includes text with limited visual properties)
const POSITIONING_ELEMENT_TYPES = ['video', 'image', 'text', 'component', 'html', 'audiogram'];

// Elements with full audio controls (seek, loop, volume, muted)
const FULL_AUDIO_TYPES = ['video', 'audio'];

// Voice elements (limited audio properties - volume, muted only)
const VOICE_AUDIO_TYPES = ['voice'];

// All audio-capable elements
const ALL_AUDIO_TYPES = ['video', 'audio', 'voice'];

// =============================================================================
// COMMON ELEMENT FIELDS
// =============================================================================

/**
 * Common fields that appear in all element types
 * These are the base properties shared across all elements
 */
export const commonElementFields: INodeProperties[] = [
  {
    displayName: 'Element Type',
    name: 'type',
    type: 'options',
    options: [
      { name: 'Video', value: 'video' },
      { name: 'Audio', value: 'audio' },
      { name: 'Image', value: 'image' },
      { name: 'Text', value: 'text' },
      { name: 'Voice', value: 'voice' },
      { name: 'Component', value: 'component' },
      { name: 'HTML', value: 'html' },
      { name: 'Audiogram', value: 'audiogram' },
      { name: 'Subtitles', value: 'subtitles' },
    ],
    default: 'video',
    description: 'Type of element to add',
  },

  // ELEMENT SPECIFIC SOURCE URL
  {
    displayName: 'Source URL',
    name: 'src',
    type: 'string',
    default: '',
    required: true,
    description: 'URL of the media file. Leave empty for AI-generated images.',
    displayOptions: {
      show: {
        type: ['video', 'audio', 'audiogram', 'html'],
      },
    },
  },
  {
    displayName: 'Source Image URL',
    name: 'src',
    type: 'string',
    default: '',
    required: false,
    description: 'URL of the image file. Leave empty for AI-generated images.',
    displayOptions: {
      show: {
        type: ['image'],
      },
    },
  },
  {
    displayName: 'Component ID',
    name: 'component',
    type: 'string',
    default: '',
    required: true,
    description: 'Pre-defined component ID from the JSON2Video component library',
    displayOptions: {
      show: {
        type: ['component'],
      },
    },
  },
  {
    displayName: 'Text Content',
    name: 'text',
    type: 'string',
    typeOptions: {
      rows: 4,
    },
    default: '',
    required: true,
    description: 'Text content to display or convert to speech',
    displayOptions: {
      show: {
        type: ['text', 'voice'],
      },
    },
  },
];

// =============================================================================
// TIMING FIELDS
// =============================================================================

/**
 * Common timing properties used by all elements
 */
export const commonTimingFields: INodeProperties[] = [
  {
    displayName: 'Timing',
    name: 'timing',
    type: 'collection',
    placeholder: 'Add Timing Option',
    default: {},
    description: 'Configure timing and duration options',
    displayOptions: { show: { type: COMMON_ELEMENT_TYPES } },
    options: [
      {
        displayName: 'Start Time',
        name: 'start',
        type: 'number',
        typeOptions: {
          minValue: 0,
          numberPrecision: 2,
        },
        default: 0,
        description: 'When the element starts appearing (seconds)',
      },
      {
        displayName: 'Duration',
        name: 'duration',
        type: 'number',
        typeOptions: {
          numberPrecision: 2,
        },
        default: -1,
        description: 'Duration of the element (-1 = auto-detect from media, -2 = match scene)',
      },
      {
        displayName: 'Extra Time',
        name: 'extraTime',
        type: 'number',
        typeOptions: {
          numberPrecision: 2,
        },
        default: 0,
        description: 'Additional time to extend duration beyond detected length',
      },
      {
        displayName: 'Z-Index (Layer)',
        name: 'zIndex',
        type: 'number',
        default: 0,
        description: 'Layer order (higher numbers appear on top)',
      },
      {
        displayName: 'Fade In',
        name: 'fadeIn',
        type: 'number',
        typeOptions: {
          minValue: 0,
          numberPrecision: 2,
        },
        default: 0,
        description: 'Fade in duration (seconds)',
      },
      {
        displayName: 'Fade Out',
        name: 'fadeOut',
        type: 'number',
        typeOptions: {
          minValue: 0,
          numberPrecision: 2,
        },
        default: 0,
        description: 'Fade out duration (seconds)',
      },
    ],
  },
];

// =============================================================================
// POSITIONING FIELDS
// =============================================================================

/**
 * Position and dimension properties for visual elements
 */
export const positionFields: INodeProperties[] = [
  {
    displayName: 'Width',
    name: 'width',
    type: 'number',
    default: -1,
    description: 'Element width in pixels (-1 = auto)',
    displayOptions: { show: { type: POSITIONING_ELEMENT_TYPES } },
  },
  {
    displayName: 'Height',
    name: 'height',
    type: 'number',
    default: -1,
    description: 'Element height in pixels (-1 = auto)',
    displayOptions: { show: { type: POSITIONING_ELEMENT_TYPES } },
  },
  {
    displayName: 'Positioning',
    name: 'positioning',
    type: 'collection',
    placeholder: 'Add Position Option',
    default: {},
    description: 'Configure element positioning options',
    displayOptions: { show: { type: POSITIONING_ELEMENT_TYPES } },
    options: [
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
        default: 'custom',
        description: 'Position preset. Choose custom to set exact coordinates.',
      },
      {
        displayName: 'X Position',
        name: 'x',
        type: 'number',
        default: 0,
        description: 'Horizontal position in pixels from left edge',
      },
      {
        displayName: 'Y Position',
        name: 'y',
        type: 'number',
        default: 0,
        description: 'Vertical position in pixels from top edge',
      },
    ],
  },
];

// =============================================================================
// VISUAL TRANSFORM FIELDS
// =============================================================================

/**
 * Visual effects and transformations for visual elements
 */
export const visualTransformFields: INodeProperties[] = [
  {
    displayName: 'Visual Effects',
    name: 'visualEffects',
    type: 'collection',
    placeholder: 'Add Visual Effect',
    default: {},
    description: 'Configure visual effects and transformations',
    displayOptions: { show: { type: VISUAL_ELEMENT_TYPES } },
    options: [
      {
        displayName: 'Resize Mode',
        name: 'resize',
        type: 'options',
        options: [
          { name: 'Cover (Fill & Crop)', value: 'cover' },
          { name: 'Contain (Fit Inside)', value: 'contain' },
          { name: 'Fill (Stretch)', value: 'fill' },
          { name: 'Fit (Scale Down)', value: 'fit' },
        ],
        default: 'cover',
        description: 'How to resize element to fit dimensions',
      },
      {
        displayName: 'Pan Direction',
        name: 'pan',
        type: 'options',
        options: [
          { name: 'Left', value: 'left' },
          { name: 'Right', value: 'right' },
          { name: 'Top', value: 'top' },
          { name: 'Bottom', value: 'bottom' },
          { name: 'Top Left', value: 'top-left' },
          { name: 'Top Right', value: 'top-right' },
          { name: 'Bottom Left', value: 'bottom-left' },
          { name: 'Bottom Right', value: 'bottom-right' },
        ],
        default: '',
        description: 'Pan direction for Ken Burns effect',
      },
      {
        displayName: 'Pan Distance',
        name: 'panDistance',
        type: 'number',
        typeOptions: {
          minValue: 0.01,
          maxValue: 0.5,
          numberPrecision: 2,
        },
        default: 0.1,
        description: 'Pan distance (0.01-0.5)',
      },
      {
        displayName: 'Pan Crop',
        name: 'panCrop',
        type: 'boolean',
        default: true,
        description: 'Stretch during pan to avoid black borders',
      },
      {
        displayName: 'Zoom',
        name: 'zoom',
        type: 'number',
        typeOptions: {
          minValue: -10,
          maxValue: 10,
          numberPrecision: 1,
        },
        default: 0,
        description: 'Zoom level (-10 to 10)',
      },
      {
        displayName: 'Flip Horizontal',
        name: 'flipHorizontal',
        type: 'boolean',
        default: false,
        description: 'Mirror element horizontally',
      },
      {
        displayName: 'Flip Vertical',
        name: 'flipVertical',
        type: 'boolean',
        default: false,
        description: 'Mirror element vertically',
      },
      {
        displayName: 'Mask',
        name: 'mask',
        type: 'string',
        default: '',
        description: 'URL of mask image for transparency effects',
      },
    ],
  },
];

// =============================================================================
// FIXED COLLECTION SETTINGS
// =============================================================================

/**
 * Crop settings as fixedCollection
 */
export const cropSettings: INodeProperties = {
  displayName: 'Crop',
  name: 'crop',
  type: 'fixedCollection',
  default: {},
  description: 'Configure cropping area',
  displayOptions: { show: { type: VISUAL_ELEMENT_TYPES } },
  typeOptions: {
    multipleValues: false,
  },
  options: [
    {
      name: 'cropValues',
      displayName: 'Crop Settings',
      values: [
        {
          displayName: 'Width',
          name: 'width',
          type: 'number',
          default: 100,
          description: 'Crop width in pixels',
        },
        {
          displayName: 'Height',
          name: 'height',
          type: 'number',
          default: 100,
          description: 'Crop height in pixels',
        },
        {
          displayName: 'X Offset',
          name: 'x',
          type: 'number',
          default: 0,
          description: 'Horizontal crop start position',
        },
        {
          displayName: 'Y Offset',
          name: 'y',
          type: 'number',
          default: 0,
          description: 'Vertical crop start position',
        },
      ],
    },
  ],
};

/**
 * Rotation settings as fixedCollection
 */
export const rotationSettings: INodeProperties = {
  displayName: 'Rotate',
  name: 'rotate',
  type: 'fixedCollection',
  default: {},
  description: 'Configure rotation animation',
  displayOptions: { show: { type: VISUAL_ELEMENT_TYPES } },
  typeOptions: {
    multipleValues: false,
  },
  options: [
    {
      name: 'rotationValues',
      displayName: 'Rotation Settings',
      values: [
        {
          displayName: 'Angle',
          name: 'angle',
          type: 'number',
          typeOptions: {
            minValue: -360,
            maxValue: 360,
          },
          default: 0,
          description: 'Rotation angle in degrees',
        },
        {
          displayName: 'Speed',
          name: 'speed',
          type: 'number',
          typeOptions: {
            minValue: 0.1,
            maxValue: 10,
            numberPrecision: 1,
          },
          default: 1,
          description: 'Rotation speed multiplier',
        },
      ],
    },
  ],
};

/**
 * Chroma key settings as fixedCollection
 */
export const chromaKeySettings: INodeProperties = {
  displayName: 'Chroma Key',
  name: 'chromaKey',
  type: 'fixedCollection',
  default: {},
  description: 'Configure green screen removal',
  displayOptions: { show: { type: VISUAL_ELEMENT_TYPES } },
  typeOptions: {
    multipleValues: false,
  },
  options: [
    {
      name: 'chromaValues',
      displayName: 'Chroma Key Settings',
      values: [
        {
          displayName: 'Color',
          name: 'color',
          type: 'color',
          default: '#00FF00',
          description: 'Color to remove (typically green #00FF00)',
        },
        {
          displayName: 'Tolerance',
          name: 'tolerance',
          type: 'number',
          typeOptions: {
            minValue: 0,
            maxValue: 100,
          },
          default: 20,
          description: 'Color tolerance (0-100)',
        },
      ],
    },
  ],
};

/**
 * Color correction settings as regular collection
 */
export const colorCorrectionSettings: INodeProperties = {
  displayName: 'Color Correction',
  name: 'correction',
  type: 'collection',
  placeholder: 'Add Correction',
  default: {},
  description: 'Configure color adjustments',
  displayOptions: { show: { type: VISUAL_ELEMENT_TYPES } },
  options: [
    {
      displayName: 'Brightness',
      name: 'brightness',
      type: 'number',
      typeOptions: {
        minValue: -1,
        maxValue: 1,
        numberPrecision: 2,
      },
      default: 0,
      description: 'Brightness adjustment (-1 to 1)',
    },
    {
      displayName: 'Contrast',
      name: 'contrast',
      type: 'number',
      typeOptions: {
        minValue: -1000,
        maxValue: 1000,
        numberPrecision: 1,
      },
      default: 1,
      description: 'Contrast adjustment (-1000 to 1000)',
    },
    {
      displayName: 'Gamma',
      name: 'gamma',
      type: 'number',
      typeOptions: {
        minValue: 0.1,
        maxValue: 10,
        numberPrecision: 2,
      },
      default: 1,
      description: 'Gamma adjustment (0.1 to 10)',
    },
    {
      displayName: 'Saturation',
      name: 'saturation',
      type: 'number',
      typeOptions: {
        minValue: 0,
        maxValue: 3,
        numberPrecision: 2,
      },
      default: 1,
      description: 'Saturation adjustment (0 to 3)',
    },
  ],
};

// =============================================================================
// AUDIO CONTROL FIELDS
// =============================================================================

/**
 * Audio control properties for audio-capable elements
 */
export const audioControlFields: INodeProperties[] = [
  {
    displayName: 'Audio Controls',
    name: 'audioControls',
    type: 'collection',
    placeholder: 'Add Audio Option',
    default: {},
    description: 'Configure audio playback options',
    displayOptions: { show: { type: ALL_AUDIO_TYPES } },
    options: [
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
        description: 'Volume level (0-10). 0 = mute, 1 = normal, 10 = maximum amplification.',
      },
      {
        displayName: 'Muted',
        name: 'muted',
        type: 'boolean',
        default: false,
        description: 'Mute the audio track',
      },
      {
        displayName: 'Seek (Start Offset)',
        name: 'seek',
        type: 'number',
        typeOptions: {
          minValue: 0,
          numberPrecision: 2,
        },
        default: 0,
        description: 'Start offset within the audio file (seconds)',
        displayOptions: { show: { type: FULL_AUDIO_TYPES } },
      },
      {
        displayName: 'Loop',
        name: 'loop',
        type: 'number',
        typeOptions: {
          minValue: -1,
          numberPrecision: 0,
        },
        default: undefined,
        description: 'Loop count (-1=infinite, positive number=repeat count)',
        displayOptions: { show: { type: FULL_AUDIO_TYPES } },
      },
    ],
  },
];

// =============================================================================
// VOICE CONTROL FIELDS
// =============================================================================

/**
 * Voice-specific configuration for TTS elements
 */
export const voiceControlFields: INodeProperties[] = [
  {
    displayName: 'Voice Settings',
    name: 'voiceSettings',
    type: 'collection',
    placeholder: 'Add Voice Option',
    default: {},
    description: 'Configure text-to-speech options',
    displayOptions: { show: { type: ['voice'] } },
    options: [
      {
        displayName: 'Voice',
        name: 'voice',
        type: 'string',
        default: 'en-US-AriaNeural',
        description: 'Voice ID for text-to-speech. Examples: en-US-AriaNeural, en-GB-LibbyNeural, es-ES-ElviraNeural',
      },
      {
        displayName: 'TTS Model',
        name: 'model',
        type: 'options',
        options: [
          { name: 'Azure Cognitive Services', value: 'azure' },
          { name: 'ElevenLabs', value: 'elevenlabs' },
          { name: 'ElevenLabs Flash v2.5 (Fastest)', value: 'elevenlabs-flash-v2-5' },
        ],
        default: 'azure',
        description: 'Text-to-speech model provider. Azure offers many languages, ElevenLabs offers high quality.',
      },
      {
        displayName: 'Connection ID',
        name: 'connection',
        type: 'string',
        default: '',
        description: 'Custom API connection ID for using your own TTS API key',
      },
    ],
  },
  {
    displayName: 'Speech Quality',
    name: 'speechQuality',
    type: 'collection',
    placeholder: 'Add Quality Option',
    default: {},
    description: 'Configure speech quality options',
    displayOptions: { show: { type: ['voice'] } },
    options: [
      {
        displayName: 'Speaking Rate',
        name: 'rate',
        type: 'number',
        typeOptions: {
          minValue: 0.5,
          maxValue: 3.0,
          numberPrecision: 2,
        },
        default: 1.0,
        description: 'Speech rate multiplier (0.5-3.0). 1.0 = normal speed, 0.5 = half speed, 2.0 = double speed.',
      },
      {
        displayName: 'Pitch',
        name: 'pitch',
        type: 'number',
        typeOptions: {
          minValue: 0.5,
          maxValue: 2.0,
          numberPrecision: 2,
        },
        default: 1.0,
        description: 'Voice pitch multiplier (0.5-2.0). 1.0 = normal pitch, lower = deeper, higher = squeakier.',
      },
    ],
  },
];

// =============================================================================
// COMPONENT CONTROL FIELDS
// =============================================================================

/**
 * Component-specific configuration
 */
export const componentControlFields: INodeProperties[] = [
  {
    displayName: 'Component Settings',
    name: 'componentSettings',
    type: 'collection',
    placeholder: 'Add Component Option',
    default: {},
    description: 'Configure component customization options',
    displayOptions: { show: { type: ['component'] } },
    options: [
      {
        displayName: 'Settings',
        name: 'settings',
        type: 'json',
        default: '{}',
        description: 'Component-specific customization settings as JSON object',
      },
    ],
  },
];

// =============================================================================
// HTML CONTROL FIELDS  
// =============================================================================

/**
 * HTML-specific configuration
 */
export const htmlControlFields: INodeProperties[] = [
  {
    displayName: 'HTML Content',
    name: 'htmlContent',
    type: 'collection',
    placeholder: 'Add HTML Option',
    default: {},
    description: 'Configure HTML content options',
    displayOptions: { show: { type: ['html'] } },
    options: [
      {
        displayName: 'Content Source',
        name: 'contentSource',
        type: 'options',
        options: [
          { name: 'HTML Code', value: 'html' },
          { name: 'Web Page URL', value: 'src' },
        ],
        default: 'html',
        description: 'Source of HTML content to render',
      },
      {
        displayName: 'HTML Code',
        name: 'html',
        type: 'string',
        typeOptions: {
          rows: 10,
        },
        default: '',
        description: 'HTML snippet to render (supports HTML5, CSS3, JavaScript)',
        displayOptions: { show: { contentSource: ['html'] } },
      },
      {
        displayName: 'Enable TailwindCSS',
        name: 'tailwindcss',
        type: 'boolean',
        default: false,
        description: 'Enable TailwindCSS framework for the HTML snippet',
      },
      {
        displayName: 'Wait Time',
        name: 'wait',
        type: 'number',
        typeOptions: {
          minValue: 0,
          maxValue: 5,
          numberPrecision: 1,
        },
        default: 2,
        description: 'Time in seconds to wait before taking screenshot (0-5). Allows page to load.',
      },
    ],
  },
];

// =============================================================================
// AUDIOGRAM CONTROL FIELDS
// =============================================================================

/**
 * Audiogram-specific configuration
 */
export const audiogramControlFields: INodeProperties[] = [
  {
    displayName: 'Audiogram Settings',
    name: 'audiogramSettings',
    type: 'collection',
    placeholder: 'Add Audiogram Option',
    default: {},
    description: 'Configure audiogram visualization options',
    displayOptions: { show: { type: ['audiogram'] } },
    options: [
      {
        displayName: 'Wave Color',
        name: 'color',
        type: 'color',
        default: '#ffffff',
        description: 'Color of the audio waveform visualization (hex code)',
      },
      {
        displayName: 'Opacity',
        name: 'opacity',
        type: 'number',
        typeOptions: {
          minValue: 0,
          maxValue: 1,
          numberPrecision: 2,
        },
        default: 0.5,
        description: 'Wave opacity (0.0-1.0). 0 = transparent, 1 = fully opaque.',
      },
      {
        displayName: 'Amplitude',
        name: 'amplitude',
        type: 'number',
        typeOptions: {
          minValue: 0,
          maxValue: 10,
          numberPrecision: 1,
        },
        default: 5,
        description: 'Wave amplitude scaling (0-10). Higher values create taller waves.',
      },
    ],
  },
];

// =============================================================================
// IMAGE AI GENERATION FIELDS
// =============================================================================

/**
 * AI image generation configuration (from imageElementFields)
 */
export const imageAIFields: INodeProperties[] = [
  {
    displayName: 'AI Image Generation',
    name: 'aiGeneration',
    type: 'collection',
    placeholder: 'Add AI Option',
    default: {},
    description: 'Configure AI image generation options',
    displayOptions: { show: { type: ['image'] } },
    options: [
      {
        displayName: 'Prompt',
        name: 'prompt',
        type: 'string',
        typeOptions: {
          rows: 3,
        },
        default: '',
        description: 'Text prompt describing the image to generate',
      },
      {
        displayName: 'AI Model',
        name: 'model',
        type: 'options',
        options: [
          { name: 'Flux Pro (Best Quality)', value: 'flux-pro' },
          { name: 'Flux Schnell (Fastest)', value: 'flux-schnell' },
          { name: 'Freepik Classic', value: 'freepik-classic' },
        ],
        default: 'flux-pro',
        description: 'AI model for image generation. Flux Pro offers best quality, Flux Schnell is fastest.',
      },
      {
        displayName: 'Aspect Ratio',
        name: 'aspectRatio',
        type: 'options',
        options: [
          { name: 'Horizontal (16:9)', value: 'horizontal' },
          { name: 'Vertical (9:16)', value: 'vertical' },
          { name: 'Square (1:1)', value: 'squared' },
        ],
        default: 'horizontal',
        description: 'Image aspect ratio for AI generation',
      },
      {
        displayName: 'Connection ID',
        name: 'connection',
        type: 'string',
        default: '',
        description: 'Optional connection ID for custom AI API key',
      },
      {
        displayName: 'Model Settings',
        name: 'modelSettings',
        type: 'json',
        default: '{}',
        description: 'Additional model-specific settings as JSON object',
      },
    ],
  },
];

// =============================================================================
// TEXT CONTROL FIELDS
// =============================================================================

/**
 * Text styling and layout configuration
 */
export const textControlFields: INodeProperties[] = [
  // Text Styling Collection
  {
    displayName: 'Text Styling',
    name: 'textStyling',
    type: 'collection',
    placeholder: 'Add Style Option',
    default: {},
    description: 'Configure text appearance and styling options',
    displayOptions: { show: { type: ['text'] } },
    options: [
      {
        displayName: 'Font Family',
        name: 'fontFamily',
        type: 'string',
        default: 'Arial',
        description: 'Font family name (e.g., Arial, Helvetica, Times New Roman)',
      },
      {
        displayName: 'Font Size',
        name: 'fontSize',
        type: 'number',
        typeOptions: {
          minValue: 8,
          maxValue: 200,
        },
        default: 32,
        description: 'Font size in pixels',
      },
      {
        displayName: 'Font Weight',
        name: 'fontWeight',
        type: 'options',
        options: [
          { name: 'Light (300)', value: '300' },
          { name: 'Normal (400)', value: '400' },
          { name: 'Medium (500)', value: '500' },
          { name: 'Semi-Bold (600)', value: '600' },
          { name: 'Bold (700)', value: '700' },
          { name: 'Extra Bold (800)', value: '800' },
        ],
        default: '400',
        description: 'Font weight/thickness',
      },
      {
        displayName: 'Font Color',
        name: 'fontColor',
        type: 'color',
        default: '#ffffff',
        description: 'Text color in hex format',
      },
      {
        displayName: 'Background Color',
        name: 'backgroundColor',
        type: 'color',
        default: '',
        description: 'Text background color. Leave empty for transparent background.',
      },
      {
        displayName: 'Text Style',
        name: 'style',
        type: 'options',
        options: [
          { name: 'Basic (001)', value: '001' },
          { name: 'Fade In (002)', value: '002' },
          { name: 'Type Writer (003)', value: '003' },
          { name: 'Bounce (004)', value: '004' },
        ],
        default: '001',
        description: 'Text animation style for entrance effects',
      },
    ],
  },

  // Text Layout Collection
  {
    displayName: 'Text Layout',
    name: 'textLayout',
    type: 'collection',
    placeholder: 'Add Layout Option',
    default: {},
    description: 'Configure text positioning and spacing options',
    displayOptions: { show: { type: ['text'] } },
    options: [
      {
        displayName: 'Text Alignment',
        name: 'textAlign',
        type: 'options',
        options: [
          { name: 'Left', value: 'left' },
          { name: 'Center', value: 'center' },
          { name: 'Right', value: 'right' },
          { name: 'Justify', value: 'justify' },
        ],
        default: 'center',
        description: 'Horizontal text alignment within the text box',
      },
      {
        displayName: 'Vertical Position',
        name: 'verticalPosition',
        type: 'options',
        options: [
          { name: 'Top', value: 'top' },
          { name: 'Center', value: 'center' },
          { name: 'Bottom', value: 'bottom' },
        ],
        default: 'center',
        description: 'Vertical alignment of text within the text box bounds',
      },
      {
        displayName: 'Horizontal Position',
        name: 'horizontalPosition',
        type: 'options',
        options: [
          { name: 'Left', value: 'left' },
          { name: 'Center', value: 'center' },
          { name: 'Right', value: 'right' },
        ],
        default: 'center',
        description: 'Horizontal alignment of content within the text box bounds',
      },
      {
        displayName: 'Line Height',
        name: 'lineHeight',
        type: 'number',
        typeOptions: {
          minValue: 0.5,
          maxValue: 3.0,
          numberPrecision: 2,
        },
        default: 1.2,
        description: 'Line spacing multiplier (0.5-3.0). 1.0 = normal, 1.5 = extra space.',
      },
      {
        displayName: 'Letter Spacing',
        name: 'letterSpacing',
        type: 'number',
        typeOptions: {
          numberPrecision: 2,
        },
        default: 0,
        description: 'Letter spacing in pixels. Positive values increase spacing, negative decreases.',
      },
    ],
  },

  // Text Effects Collection
  {
    displayName: 'Text Effects',
    name: 'textEffects',
    type: 'collection',
    placeholder: 'Add Text Effect',
    default: {},
    description: 'Configure text visual effects and decorations',
    displayOptions: { show: { type: ['text'] } },
    options: [
      {
        displayName: 'Text Shadow',
        name: 'textShadow',
        type: 'string',
        default: '',
        description: 'CSS text-shadow property. Example: "2px 2px 4px rgba(0,0,0,0.5)"',
      },
      {
        displayName: 'Text Decoration',
        name: 'textDecoration',
        type: 'options',
        options: [
          { name: 'None', value: 'none' },
          { name: 'Underline', value: 'underline' },
          { name: 'Overline', value: 'overline' },
          { name: 'Line Through', value: 'line-through' },
        ],
        default: 'none',
        description: 'Text decoration style',
      },
      {
        displayName: 'Text Transform',
        name: 'textTransform',
        type: 'options',
        options: [
          { name: 'None', value: 'none' },
          { name: 'Uppercase', value: 'uppercase' },
          { name: 'Lowercase', value: 'lowercase' },
          { name: 'Capitalize', value: 'capitalize' },
        ],
        default: 'none',
        description: 'Text case transformation',
      },
    ],
  },
];

// =============================================================================
// SUBTITLE CONTROL FIELDS
// =============================================================================

/**
 * Subtitle content and styling configuration
 */
export const subtitleControlFields: INodeProperties[] = [
  // Subtitle Content Configuration
  {
    displayName: 'Subtitle Content',
    name: 'subtitleContent',
    type: 'collection',
    placeholder: 'Add Subtitle Source',
    default: {},
    description: 'Configure subtitle content and source options',
    displayOptions: { show: { type: ['subtitles'] } },
    options: [
      {
        displayName: 'Content Source',
        name: 'contentSource',
        type: 'options',
        options: [
          { name: 'Captions Text/File', value: 'captions' },
          { name: 'Direct Text Input', value: 'text' },
        ],
        default: 'captions',
        description: 'How to provide subtitle content',
      },
      {
        displayName: 'Captions',
        name: 'captions',
        type: 'string',
        typeOptions: {
          rows: 6,
        },
        default: '',
        description: 'Subtitle file URL (SRT, VTT, ASS) or inline subtitle content',
        displayOptions: { show: { contentSource: ['captions'] } },
      },
      {
        displayName: 'Text Content',
        name: 'text',
        type: 'string',
        typeOptions: {
          rows: 4,
        },
        default: '',
        description: 'Direct text input for subtitle content',
        displayOptions: { show: { contentSource: ['text'] } },
      },
      {
        displayName: 'Language',
        name: 'language',
        type: 'string',
        default: 'en',
        description: 'Language code for subtitle processing (e.g., en, es, fr, de)',
      },
      {
        displayName: 'Transcription Model',
        name: 'model',
        type: 'options',
        options: [
          { name: 'Default (Fast)', value: 'default' },
          { name: 'Whisper (Accurate)', value: 'whisper' },
        ],
        default: 'default',
        description: 'AI model for automatic transcription from audio',
      },
    ],
  },

  // Subtitle Settings Configuration
  {
    displayName: 'Subtitle Settings',
    name: 'subtitleSettings',
    type: 'collection',
    placeholder: 'Add Subtitle Setting',
    default: {},
    description: 'Configure subtitle appearance and styling options',
    displayOptions: { show: { type: ['subtitles'] } },
    options: [
      {
        displayName: 'All Caps',
        name: 'allCaps',
        type: 'boolean',
        default: false,
        description: 'Convert all subtitle text to uppercase',
      },
      {
        displayName: 'Position',
        name: 'position',
        type: 'options',
        options: [
          { name: 'Bottom Center', value: 'bottom-center' },
          { name: 'Top Center', value: 'top-center' },
          { name: 'Center Center', value: 'center-center' },
          { name: 'Custom (Set X/Y)', value: 'custom' },
        ],
        default: 'bottom-center',
        description: 'Subtitle position on screen',
      },
      {
        displayName: 'Font Size',
        name: 'fontSize',
        type: 'number',
        typeOptions: {
          minValue: 12,
          maxValue: 100,
        },
        default: 24,
        description: 'Subtitle font size in pixels',
      },
      {
        displayName: 'Font Family',
        name: 'fontFamily',
        type: 'string',
        default: 'Arial',
        description: 'Font family for subtitle text',
      },
      {
        displayName: 'Font URL',
        name: 'fontUrl',
        type: 'string',
        default: '',
        description: 'Custom font URL (optional). Leave empty to use system fonts.',
      },
      {
        displayName: 'Word Color',
        name: 'wordColor',
        type: 'color',
        default: '#ffffff',
        description: 'Color of the subtitle text',
      },
      {
        displayName: 'Line Color',
        name: 'lineColor',
        type: 'color',
        default: '#ffffff',
        description: 'Color of text line/stroke',
      },
      {
        displayName: 'Box Color',
        name: 'boxColor',
        type: 'color',
        default: '',
        description: 'Background box color. Leave empty for transparent.',
      },
      {
        displayName: 'Outline Color',
        name: 'outlineColor',
        type: 'color',
        default: '#000000',
        description: 'Text outline/border color',
      },
      {
        displayName: 'Outline Width',
        name: 'outlineWidth',
        type: 'number',
        typeOptions: {
          minValue: 0,
          maxValue: 10,
          numberPrecision: 1,
        },
        default: 1,
        description: 'Text outline width in pixels (0 = no outline)',
      },
      {
        displayName: 'Shadow Color',
        name: 'shadowColor',
        type: 'color',
        default: '#000000',
        description: 'Text shadow color',
      },
      {
        displayName: 'Shadow Offset',
        name: 'shadowOffset',
        type: 'number',
        typeOptions: {
          minValue: 0,
          maxValue: 20,
          numberPrecision: 1,
        },
        default: 0,
        description: 'Text shadow offset distance in pixels (0 = no shadow)',
      },
      {
        displayName: 'Max Words Per Line',
        name: 'maxWordsPerLine',
        type: 'number',
        typeOptions: {
          minValue: 1,
          maxValue: 20,
          numberPrecision: 0,
        },
        default: 4,
        description: 'Maximum number of words displayed per subtitle line',
      },
      {
        displayName: 'X Position',
        name: 'x',
        type: 'number',
        default: 0,
        description: 'Custom X position (when position is set to custom)',
        displayOptions: { show: { position: ['custom'] } },
      },
      {
        displayName: 'Y Position',
        name: 'y',
        type: 'number',
        default: 0,
        description: 'Custom Y position (when position is set to custom)',
        displayOptions: { show: { position: ['custom'] } },
      },
      {
        displayName: 'Keywords',
        name: 'keywords',
        type: 'string',
        typeOptions: {
          rows: 3,
        },
        default: '',
        description: 'Comma-separated keywords to improve transcription accuracy (e.g., "JSON2Video, Claude, AI")',
      },
      {
        displayName: 'Word Replacements',
        name: 'replace',
        type: 'json',
        default: '{}',
        description: 'JSON object mapping words to replace (e.g., {"gonna": "going to", "wanna": "want to"})',
      },
    ],
  },
];

// =============================================================================
// COMPLETE ELEMENT FIELDS
// =============================================================================

/**
 * Complete combined element fields array
 */
export const completeElementFields: INodeProperties[] = [
  ...commonElementFields,
  ...commonTimingFields,
  ...positionFields,
  ...visualTransformFields,
  cropSettings,
  rotationSettings,
  chromaKeySettings,
  colorCorrectionSettings,
  ...audioControlFields,
  ...voiceControlFields,
  ...componentControlFields,
  ...htmlControlFields,
  ...audiogramControlFields,
  ...imageAIFields,
  ...textControlFields,
  ...subtitleControlFields,
];