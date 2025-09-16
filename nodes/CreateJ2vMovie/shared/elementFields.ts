// nodes/CreateJ2vMovie/shared/elementFields.ts
// COMPLETE REFACTOR: Fixed field ordering, image logic, JSON objects, and missing parameters

import { INodeProperties } from 'n8n-workflow';

/**
 * Complete unified element fields with proper ordering and full API coverage
 */
export const elementFields: INodeProperties[] = [
  // =============================================================================
  // ELEMENT TYPE (ALWAYS FIRST)
  // =============================================================================
  {
    displayName: 'Element Type',
    name: 'type',
    type: 'options',
    options: [
      { name: 'Video', value: 'video' },
      { name: 'Audio', value: 'audio' },
      { name: 'Image', value: 'image' },
      { name: 'Text', value: 'text' },
      { name: 'Voice/TTS', value: 'voice' },
      { name: 'Component', value: 'component' },
      { name: 'HTML', value: 'html' },
      { name: 'Audiogram', value: 'audiogram' },
    ],
    default: 'video',
    description: 'Type of element to add to the video',
  },

  // =============================================================================
  // SOURCE/CONTENT FIELDS (TYPE-SPECIFIC, ALWAYS VISIBLE)
  // =============================================================================
  
  // Video Source
  {
    displayName: 'Video Source URL',
    name: 'src',
    type: 'string',
    default: '',
    required: true,
    description: 'URL of the video file',
    displayOptions: {
      show: { type: ['video'] }
    },
  },

  // Audio Source
  {
    displayName: 'Audio Source URL',
    name: 'src',
    type: 'string',
    default: '',
    required: true,
    description: 'URL of the audio file',
    displayOptions: {
      show: { type: ['audio'] }
    },
  },

  // Image Source (NOT required when using AI generation)
  {
    displayName: 'Image Source URL',
    name: 'src',
    type: 'string',
    default: '',
    required: false, // FIXED: Not required when using AI prompt
    description: 'URL of the image file (leave empty if using AI generation)',
    displayOptions: {
      show: { type: ['image'] }
    },
  },

  // Image AI Prompt (alternative to src)
  {
    displayName: 'AI Prompt',
    name: 'prompt',
    type: 'string',
    typeOptions: { rows: 3 },
    default: '',
    required: false,
    description: 'Text prompt for AI image generation (alternative to source URL)',
    displayOptions: {
      show: { type: ['image'] }
    },
  },

  // Text Content
  {
    displayName: 'Text Content',
    name: 'text',
    type: 'string',
    typeOptions: { rows: 3 },
    default: '',
    required: true,
    description: 'Text content to display or convert to speech',
    displayOptions: {
      show: { type: ['text', 'voice'] }
    },
  },

  // Component ID
  {
    displayName: 'Component ID',
    name: 'component',
    type: 'string',
    default: '',
    required: true,
    description: 'Pre-defined component ID from JSON2Video library',
    displayOptions: {
      show: { type: ['component'] }
    },
  },

  // HTML Source
  {
    displayName: 'HTML Source URL',
    name: 'src',
    type: 'string',
    default: '',
    description: 'URL of the webpage to render',
    displayOptions: {
      show: { type: ['html'] }
    },
  },

  // HTML Code (alternative to src)
  {
    displayName: 'HTML Code',
    name: 'html',
    type: 'string',
    typeOptions: { rows: 5 },
    default: '',
    description: 'HTML snippet to render (alternative to source URL)',
    displayOptions: {
      show: { type: ['html'] }
    },
  },

  // Audiogram Source
  {
    displayName: 'Audio Source URL',
    name: 'src',
    type: 'string',
    default: '',
    required: true,
    description: 'URL of the audio file for waveform visualization',
    displayOptions: {
      show: { type: ['audiogram'] }
    },
  },

  // =============================================================================
  // BASIC TIMING (ALWAYS VISIBLE)
  // =============================================================================
  {
    displayName: 'Start Time (seconds)',
    name: 'start',
    type: 'number',
    typeOptions: { minValue: 0, numberPrecision: 2 },
    default: 0,
    description: 'When the element starts appearing in the video',
  },
  {
    displayName: 'Duration (seconds)',
    name: 'duration',
    type: 'number',
    typeOptions: { numberPrecision: 2 },
    default: -1,
    description: 'Element duration (-1=auto-detect, -2=match scene duration)',
  },

  // =============================================================================
  // SECTION 1: POSITIONING TOGGLE → POSITIONING FIELDS
  // =============================================================================
  {
    displayName: 'Position & Size',
    name: 'showPositioning',
    type: 'boolean',
    default: false,
    description: 'Configure element position and dimensions',
    displayOptions: {
      show: { type: ['video', 'image', 'text', 'component', 'html', 'audiogram'] }
    },
  },

  // Positioning fields appear immediately after toggle
  {
    displayName: 'Position',
    name: 'position',
    type: 'options',
    options: [
      { name: 'Top Left', value: 'top-left' },
      { name: 'Top Center', value: 'top-center' },
      { name: 'Top Right', value: 'top-right' },
      { name: 'Center Left', value: 'center-left' },
      { name: 'Center Center', value: 'center-center' },
      { name: 'Center Right', value: 'center-right' },
      { name: 'Bottom Left', value: 'bottom-left' },
      { name: 'Bottom Center', value: 'bottom-center' },
      { name: 'Bottom Right', value: 'bottom-right' },
      { name: 'Custom Coordinates', value: 'custom' },
    ],
    default: 'center-center',
    description: 'Element position preset or custom coordinates',
    displayOptions: {
      show: { 
        type: ['video', 'image', 'text', 'component', 'html', 'audiogram'],
        showPositioning: [true]
      }
    },
  },
  {
    displayName: 'X Position',
    name: 'x',
    type: 'number',
    default: 0,
    description: 'Horizontal position in pixels from left edge',
    displayOptions: {
      show: { 
        type: ['video', 'image', 'text', 'component', 'html', 'audiogram'],
        showPositioning: [true],
        position: ['custom']
      }
    },
  },
  {
    displayName: 'Y Position',
    name: 'y',
    type: 'number',
    default: 0,
    description: 'Vertical position in pixels from top edge',
    displayOptions: {
      show: { 
        type: ['video', 'image', 'text', 'component', 'html', 'audiogram'],
        showPositioning: [true],
        position: ['custom']
      }
    },
  },
  {
    displayName: 'Width',
    name: 'width',
    type: 'number',
    default: -1,
    description: 'Element width in pixels (-1=auto)',
    displayOptions: {
      show: { 
        type: ['video', 'image', 'text', 'component', 'html', 'audiogram'],
        showPositioning: [true]
      }
    },
  },
  {
    displayName: 'Height',
    name: 'height',
    type: 'number',
    default: -1,
    description: 'Element height in pixels (-1=auto)',
    displayOptions: {
      show: { 
        type: ['video', 'image', 'text', 'component', 'html', 'audiogram'],
        showPositioning: [true]
      }
    },
  },
  {
    displayName: 'Resize Mode',
    name: 'resize',
    type: 'options',
    options: [
      { name: 'Cover (fill and crop)', value: 'cover' },
      { name: 'Contain (fit inside)', value: 'contain' },
      { name: 'Fill (stretch to fit)', value: 'fill' },
      { name: 'Fit (scale down only)', value: 'fit' },
    ],
    default: 'cover',
    description: 'How to resize element to fit dimensions',
    displayOptions: {
      show: { 
        type: ['video', 'image', 'component', 'html', 'audiogram'],
        showPositioning: [true]
      }
    },
  },

  // =============================================================================
  // SECTION 2: AUDIO CONTROLS TOGGLE → AUDIO FIELDS
  // =============================================================================
  {
    displayName: 'Audio Controls',
    name: 'showAudioControls',
    type: 'boolean',
    default: false,
    description: 'Configure volume, muting, and playback options',
    displayOptions: {
      show: { type: ['video', 'audio', 'voice'] }
    },
  },

  // Audio control fields appear immediately after toggle
  {
    displayName: 'Volume',
    name: 'volume',
    type: 'number',
    typeOptions: { minValue: 0, maxValue: 10, numberPrecision: 2 },
    default: 1,
    description: 'Volume level (0=mute, 1=normal, 10=max)',
    displayOptions: {
      show: { 
        type: ['video', 'audio', 'voice'],
        showAudioControls: [true]
      }
    },
  },
  {
    displayName: 'Muted',
    name: 'muted',
    type: 'boolean',
    default: false,
    description: 'Mute audio track',
    displayOptions: {
      show: { 
        type: ['video', 'audio', 'voice'],
        showAudioControls: [true]
      }
    },
  },
  {
    displayName: 'Seek (Start Offset)',
    name: 'seek',
    type: 'number',
    typeOptions: { minValue: 0, numberPrecision: 2 },
    default: 0,
    description: 'Start offset within file (seconds)',
    displayOptions: {
      show: { 
        type: ['video', 'audio'],
        showAudioControls: [true]
      }
    },
  },
  {
    displayName: 'Loop Count',
    name: 'loop',
    type: 'number',
    typeOptions: { minValue: -1 },
    default: 0,
    description: 'Loop count (-1=infinite, 0=no loop, >0=repeat count)',
    displayOptions: {
      show: { 
        type: ['video', 'audio'],
        showAudioControls: [true]
      }
    },
  },

  // =============================================================================
  // SECTION 3: TEXT STYLING TOGGLE → TEXT FIELDS
  // =============================================================================
  {
    displayName: 'Text Styling',
    name: 'showTextStyling',
    type: 'boolean',
    default: false,
    description: 'Configure font, color, and text appearance',
    displayOptions: {
      show: { type: ['text'] }
    },
  },

  // Text styling fields appear immediately after toggle
  {
    displayName: 'Font Family',
    name: 'fontFamily',
    type: 'options',
    options: [
      { name: 'Arial', value: 'Arial' },
      { name: 'Helvetica', value: 'Helvetica' },
      { name: 'Times New Roman', value: 'Times New Roman' },
      { name: 'Georgia', value: 'Georgia' },
      { name: 'Verdana', value: 'Verdana' },
      { name: 'Courier New', value: 'Courier New' },
      { name: 'Roboto', value: 'Roboto' },
      { name: 'Open Sans', value: 'Open Sans' },
      { name: 'Lato', value: 'Lato' },
      { name: 'Montserrat', value: 'Montserrat' },
      { name: 'Source Sans Pro', value: 'Source Sans Pro' },
    ],
    default: 'Arial',
    description: 'Font family name',
    displayOptions: {
      show: { 
        type: ['text'],
        showTextStyling: [true]
      }
    },
  },
  {
    displayName: 'Font Size',
    name: 'fontSize',
    type: 'number',
    typeOptions: { minValue: 8, maxValue: 500 },
    default: 32,
    description: 'Font size in pixels',
    displayOptions: {
      show: { 
        type: ['text'],
        showTextStyling: [true]
      }
    },
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
    displayOptions: {
      show: { 
        type: ['text'],
        showTextStyling: [true]
      }
    },
  },
  {
    displayName: 'Text Color',
    name: 'fontColor',
    type: 'color',
    default: '#ffffff',
    description: 'Text color',
    displayOptions: {
      show: { 
        type: ['text'],
        showTextStyling: [true]
      }
    },
  },
  {
    displayName: 'Background Color',
    name: 'backgroundColor',
    type: 'color',
    default: 'transparent',
    description: 'Text background color',
    displayOptions: {
      show: { 
        type: ['text'],
        showTextStyling: [true]
      }
    },
  },
  {
    displayName: 'Text Align',
    name: 'textAlign',
    type: 'options',
    options: [
      { name: 'Left', value: 'left' },
      { name: 'Center', value: 'center' },
      { name: 'Right', value: 'right' },
      { name: 'Justify', value: 'justify' },
    ],
    default: 'center',
    description: 'Text alignment',
    displayOptions: {
      show: { 
        type: ['text'],
        showTextStyling: [true]
      }
    },
  },
  {
    displayName: 'Text Style',
    name: 'textStyle',
    type: 'options',
    options: [
      { name: 'Style 001', value: '001' },
      { name: 'Style 002', value: '002' },
      { name: 'Style 003', value: '003' },
      { name: 'Style 004', value: '004' },
    ],
    default: '001',
    description: 'Text animation style',
    displayOptions: {
      show: { 
        type: ['text'],
        showTextStyling: [true]
      }
    },
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
    description: 'Vertical text alignment within textbox',
    displayOptions: {
      show: { 
        type: ['text'],
        showTextStyling: [true]
      }
    },
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
    description: 'Horizontal text alignment within textbox',
    displayOptions: {
      show: { 
        type: ['text'],
        showTextStyling: [true]
      }
    },
  },
  {
    displayName: 'Line Height',
    name: 'lineHeight',
    type: 'number',
    typeOptions: { minValue: 0.5, maxValue: 3.0, numberPrecision: 2 },
    default: 1.2,
    description: 'Line spacing multiplier',
    displayOptions: {
      show: { 
        type: ['text'],
        showTextStyling: [true]
      }
    },
  },
  {
    displayName: 'Letter Spacing',
    name: 'letterSpacing',
    type: 'number',
    default: 0,
    description: 'Letter spacing in pixels',
    displayOptions: {
      show: { 
        type: ['text'],
        showTextStyling: [true]
      }
    },
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
    displayOptions: {
      show: { 
        type: ['text'],
        showTextStyling: [true]
      }
    },
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
    displayOptions: {
      show: { 
        type: ['text'],
        showTextStyling: [true]
      }
    },
  },
  {
    displayName: 'Text Shadow',
    name: 'textShadow',
    type: 'string',
    default: '',
    placeholder: 'e.g., 2px 2px 4px rgba(0,0,0,0.5)',
    description: 'CSS text shadow property',
    displayOptions: {
      show: { 
        type: ['text'],
        showTextStyling: [true]
      }
    },
  },

  // =============================================================================
  // SECTION 4: VOICE SETTINGS TOGGLE → VOICE FIELDS
  // =============================================================================
  {
    displayName: 'Voice Settings',
    name: 'showVoiceSettings',
    type: 'boolean',
    default: false,
    description: 'Configure text-to-speech options',
    displayOptions: {
      show: { type: ['voice'] }
    },
  },

  // Voice settings fields appear immediately after toggle
  {
    displayName: 'Voice ID',
    name: 'voice',
    type: 'string',
    default: 'en-US-AriaNeural',
    description: 'TTS voice identifier (e.g., en-US-AriaNeural)',
    displayOptions: {
      show: { 
        type: ['voice'],
        showVoiceSettings: [true]
      }
    },
  },
  {
    displayName: 'TTS Model',
    name: 'model',
    type: 'options',
    options: [
      { name: 'Azure Cognitive Services', value: 'azure' },
      { name: 'ElevenLabs', value: 'elevenlabs' },
      { name: 'ElevenLabs Flash v2.5', value: 'elevenlabs-flash-v2-5' },
    ],
    default: 'azure',
    description: 'Text-to-speech model provider',
    displayOptions: {
      show: { 
        type: ['voice'],
        showVoiceSettings: [true]
      }
    },
  },
  {
    displayName: 'Voice Connection',
    name: 'connection',
    type: 'string',
    default: '',
    description: 'Connection ID for custom TTS API key',
    displayOptions: {
      show: { 
        type: ['voice'],
        showVoiceSettings: [true]
      }
    },
  },

  // =============================================================================
  // SECTION 5: IMAGE GENERATION TOGGLE → AI FIELDS
  // =============================================================================
  {
    displayName: 'AI Image Settings',
    name: 'showImageGeneration',
    type: 'boolean',
    default: false,
    description: 'Configure AI image generation (when using prompt instead of URL)',
    displayOptions: {
      show: { type: ['image'] }
    },
  },

  // AI generation fields appear immediately after toggle
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
    description: 'AI image generation model',
    displayOptions: {
      show: { 
        type: ['image'],
        showImageGeneration: [true]
      }
    },
  },
  {
    displayName: 'Aspect Ratio',
    name: 'aspectRatio',
    type: 'options',
    options: [
      { name: 'Horizontal', value: 'horizontal' },
      { name: 'Vertical', value: 'vertical' },
      { name: 'Square', value: 'squared' },
    ],
    default: 'horizontal',
    description: 'AI image generation aspect ratio',
    displayOptions: {
      show: { 
        type: ['image'],
        showImageGeneration: [true]
      }
    },
  },
  {
    displayName: 'AI Connection',
    name: 'connection',
    type: 'string',
    default: '',
    description: 'Connection ID for custom AI API key',
    displayOptions: {
      show: { 
        type: ['image'],
        showImageGeneration: [true]
      }
    },
  },
  {
    displayName: 'Model Settings',
    name: 'modelSettings',
    type: 'json',
    default: '{}',
    description: 'AI model-specific settings as JSON object',
    displayOptions: {
      show: { 
        type: ['image'],
        showImageGeneration: [true]
      }
    },
  },

  // =============================================================================
  // SECTION 6: VISUAL EFFECTS TOGGLE → VISUAL EFFECTS FIELDS
  // =============================================================================
  {
    displayName: 'Visual Effects',
    name: 'showVisualEffects',
    type: 'boolean',
    default: false,
    description: 'Apply visual effects like crop, rotation, color correction',
    displayOptions: {
      show: { type: ['video', 'image', 'component', 'html', 'audiogram'] }
    },
  },

  // Basic visual effects appear immediately after toggle
  {
    displayName: 'Pan Direction',
    name: 'pan',
    type: 'options',
    options: [
      { name: 'None', value: '' },
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
    description: 'Ken Burns pan effect direction',
    displayOptions: {
      show: { 
        type: ['video', 'image', 'component', 'html', 'audiogram'],
        showVisualEffects: [true]
      }
    },
  },
  {
    displayName: 'Pan Distance',
    name: 'panDistance',
    type: 'number',
    typeOptions: { minValue: 0.01, maxValue: 0.5, numberPrecision: 2 },
    default: 0.1,
    description: 'Pan distance (0.01-0.5)',
    displayOptions: {
      show: { 
        type: ['video', 'image', 'component', 'html', 'audiogram'],
        showVisualEffects: [true]
      }
    },
  },
  {
    displayName: 'Pan Crop',
    name: 'panCrop',
    type: 'boolean',
    default: true,
    description: 'Stretch during pan animation',
    displayOptions: {
      show: { 
        type: ['video', 'image', 'component', 'html', 'audiogram'],
        showVisualEffects: [true]
      }
    },
  },
  {
    displayName: 'Zoom',
    name: 'zoom',
    type: 'number',
    typeOptions: { minValue: -10, maxValue: 10, numberPrecision: 1 },
    default: 0,
    description: 'Zoom level (-10 to 10)',
    displayOptions: {
      show: { 
        type: ['video', 'image', 'component', 'html', 'audiogram'],
        showVisualEffects: [true]
      }
    },
  },
  {
    displayName: 'Flip Horizontal',
    name: 'flipHorizontal',
    type: 'boolean',
    default: false,
    description: 'Flip element horizontally',
    displayOptions: {
      show: { 
        type: ['video', 'image', 'component', 'html', 'audiogram'],
        showVisualEffects: [true]
      }
    },
  },
  {
    displayName: 'Flip Vertical',
    name: 'flipVertical',
    type: 'boolean',
    default: false,
    description: 'Flip element vertically',
    displayOptions: {
      show: { 
        type: ['video', 'image', 'component', 'html', 'audiogram'],
        showVisualEffects: [true]
      }
    },
  },
  {
    displayName: 'Mask URL',
    name: 'mask',
    type: 'string',
    default: '',
    description: 'Mask image URL for transparency effects',
    displayOptions: {
      show: { 
        type: ['video', 'image', 'component', 'html', 'audiogram'],
        showVisualEffects: [true]
      }
    },
  },

  // FIXED: Crop as JSON textarea object
  {
    displayName: 'Crop Settings',
    name: 'crop',
    type: 'json',
    default: '{}',
    placeholder: 'e.g., {"width": 100, "height": 100, "x": 0, "y": 0}',
    description: 'Crop area settings as JSON object with width, height, x, y properties',
    displayOptions: {
      show: { 
        type: ['video', 'image', 'component', 'html', 'audiogram'],
        showVisualEffects: [true]
      }
    },
  },

  // FIXED: Rotate as JSON textarea object  
  {
    displayName: 'Rotation Settings',
    name: 'rotate',
    type: 'json',
    default: '{}',
    placeholder: 'e.g., {"angle": 45, "speed": 1}',
    description: 'Rotation settings as JSON object with angle and speed properties',
    displayOptions: {
      show: { 
        type: ['video', 'image', 'component', 'html', 'audiogram'],
        showVisualEffects: [true]
      }
    },
  },

  // FIXED: Chroma-key as JSON textarea object (with correct kebab-case name)
  {
    displayName: 'Chroma Key Settings',
    name: 'chromaKey',
    type: 'json',
    default: '{}',
    placeholder: 'e.g., {"color": "#00FF00", "tolerance": 25}',
    description: 'Green screen settings as JSON object with color and tolerance properties',
    displayOptions: {
      show: { 
        type: ['video', 'image', 'component', 'html', 'audiogram'],
        showVisualEffects: [true]
      }
    },
  },

  // FIXED: Correction as JSON textarea object
  {
    displayName: 'Color Correction',
    name: 'correction',
    type: 'json',
    default: '{}',
    placeholder: 'e.g., {"brightness": 0.1, "contrast": 1.2, "gamma": 1.0, "saturation": 1.1}',
    description: 'Color correction settings as JSON object',
    displayOptions: {
      show: { 
        type: ['video', 'image', 'component', 'html', 'audiogram'],
        showVisualEffects: [true]
      }
    },
  },

  // =============================================================================
  // SECTION 7: ADVANCED SETTINGS TOGGLE → ADVANCED FIELDS
  // =============================================================================
  {
    displayName: 'Advanced Settings',
    name: 'showAdvancedSettings',
    type: 'boolean',
    default: false,
    description: 'Technical options like ID, conditions, variables, and cache',
  },

  // Advanced fields appear immediately after toggle
  {
    displayName: 'Element ID',
    name: 'id',
    type: 'string',
    default: '',
    description: 'Unique identifier for this element (auto-generated if empty)',
    displayOptions: {
      show: { showAdvancedSettings: [true] }
    },
  },
  {
    displayName: 'Comment',
    name: 'comment',
    type: 'string',
    default: '',
    description: 'Internal comment or note about this element',
    displayOptions: {
      show: { showAdvancedSettings: [true] }
    },
  },
  {
    displayName: 'Condition',
    name: 'condition',
    type: 'string',
    default: '',
    description: 'Conditional expression for rendering (e.g., "{{ show_logo == true }}")',
    displayOptions: {
      show: { showAdvancedSettings: [true] }
    },
  },
  {
    displayName: 'Variables',
    name: 'variables',
    type: 'json',
    default: '{}',
    description: 'Element-level variables as JSON object',
    displayOptions: {
      show: { showAdvancedSettings: [true] }
    },
  },
  {
    displayName: 'Cache',
    name: 'cache',
    type: 'boolean',
    default: true,
    description: 'Use cached render if available',
    displayOptions: {
      show: { showAdvancedSettings: [true] }
    },
  },
  {
    displayName: 'Extra Time (seconds)',
    name: 'extraTime',
    type: 'number',
    typeOptions: { minValue: 0, numberPrecision: 2 },
    default: 0,
    description: 'Additional time after duration',
    displayOptions: {
      show: { showAdvancedSettings: [true] }
    },
  },
  {
    displayName: 'Z-Index (Layer)',
    name: 'zIndex',
    type: 'number',
    typeOptions: { minValue: -99, maxValue: 99 },
    default: 0,
    description: 'Layer order (higher numbers appear on top)',
    displayOptions: {
      show: { showAdvancedSettings: [true] }
    },
  },
  {
    displayName: 'Fade In (seconds)',
    name: 'fadeIn',
    type: 'number',
    typeOptions: { minValue: 0, numberPrecision: 2 },
    default: 0,
    description: 'Fade in duration in seconds',
    displayOptions: {
      show: { showAdvancedSettings: [true] }
    },
  },
  {
    displayName: 'Fade Out (seconds)',
    name: 'fadeOut',
    type: 'number',
    typeOptions: { minValue: 0, numberPrecision: 2 },
    default: 0,
    description: 'Fade out duration in seconds',
    displayOptions: {
      show: { showAdvancedSettings: [true] }
    },
  },

  // =============================================================================
  // TYPE-SPECIFIC FIELDS (Component, HTML, Audiogram)
  // =============================================================================
  {
    displayName: 'Component Settings',
    name: 'settings',
    type: 'json',
    default: '{}',
    description: 'Component configuration as JSON object',
    displayOptions: {
      show: { type: ['component'] }
    },
  },
  {
    displayName: 'Enable TailwindCSS',
    name: 'tailwindcss',
    type: 'boolean',
    default: false,
    description: 'Enable TailwindCSS framework for HTML snippet',
    displayOptions: {
      show: { type: ['html'] }
    },
  },
  {
    displayName: 'Wait Time (seconds)',
    name: 'wait',
    type: 'number',
    typeOptions: { minValue: 0, maxValue: 5, numberPrecision: 1 },
    default: 2,
    description: 'Time to wait before taking screenshot',
    displayOptions: {
      show: { type: ['html'] }
    },
  },
  {
    displayName: 'Wave Color',
    name: 'color',
    type: 'color',
    default: '#ffffff',
    description: 'Audio waveform color',
    displayOptions: {
      show: { type: ['audiogram'] }
    },
  },
  {
    displayName: 'Wave Opacity',
    name: 'opacity',
    type: 'number',
    typeOptions: { minValue: 0, maxValue: 1, numberPrecision: 2 },
    default: 0.5,
    description: 'Waveform opacity (0=transparent, 1=opaque)',
    displayOptions: {
      show: { type: ['audiogram'] }
    },
  },
  {
    displayName: 'Wave Amplitude',
    name: 'amplitude',
    type: 'number',
    typeOptions: { minValue: 0, maxValue: 10, numberPrecision: 1 },
    default: 5,
    description: 'Wave amplitude scaling (0-10)',
    displayOptions: {
      show: { type: ['audiogram'] }
    },
  },
];

/**
 * Main element collection parameter
 */
export const elementCollection: INodeProperties = {
  displayName: 'Elements',
  name: 'elements',
  type: 'fixedCollection',
  typeOptions: {
    multipleValues: true,
    sortable: true,
  },
  placeholder: 'Add Element',
  description: 'Video elements (videos, images, text, audio, etc.)',
  default: {},
  options: [
    {
      name: 'elementValues',
      displayName: 'Element',
      values: elementFields,
    },
  ],
};