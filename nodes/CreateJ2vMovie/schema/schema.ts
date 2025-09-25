// nodes/CreateJ2vMovie/schema/schema.ts

/**
 * Complete JSON2Video API Schema Definition
 * Based on official v2 API documentation - serves as the single source of truth for all API validation
 */

/**
 * Root JSON2Video API request interface
 */
export interface JSON2VideoRequest {
  id?: string;
  resolution?: string;
  width?: number;
  height?: number;
  quality?: 'low' | 'medium' | 'high' | 'very_high';
  cache?: boolean;
  'client-data'?: Record<string, any>;
  comment?: string;
  variables?: Record<string, any>;
  elements?: MovieElement[];
  exports?: ExportConfig[];
  scenes: Scene[];
}

/**
 * Export configuration for video delivery methods (v2 API format)
 */
export interface ExportConfig {
  destinations: ExportDestination[];
}

/**
 * Export destination union type
 */
export type ExportDestination = WebhookDestination | FtpDestination | EmailDestination;

/**
 * Webhook export destination
 */
export interface WebhookDestination {
  type: 'webhook';
  endpoint: string;
}

/**
 * FTP/SFTP export destination
 */
export interface FtpDestination {
  type: 'ftp';
  host: string;
  port?: number;
  username: string;
  password: string;
  'remote-path'?: string;
  file?: string;
  secure?: boolean; // SFTP vs FTP
}

/**
 * Email export destination
 */
export interface EmailDestination {
  type: 'email';
  to: string | string[];
  from?: string;
  subject?: string;
  message?: string;
}

/**
 * Scene object containing elements and settings
 */
export interface Scene {
  id?: string;
  duration?: number;
  'background-color'?: string;
  comment?: string;
  condition?: string;
  cache?: boolean;
  variables?: Record<string, any>;
  elements: SceneElement[];
}

/**
 * Base element interface with common properties
 */
export interface BaseElement {
  type: string;
  id?: string;
  comment?: string;
  condition?: string;
  variables?: Record<string, any>;
  cache?: boolean;
  start?: number;
  duration?: number;
  'extra-time'?: number;
  'z-index'?: number;
  'fade-in'?: number;
  'fade-out'?: number;
}

/**
 * Visual element interface with positioning and effects
 */
export interface VisualElement extends BaseElement {
  position?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  resize?: 'cover' | 'fill' | 'fit' | 'contain';
  crop?: CropObject;
  rotate?: RotateObject;
  pan?: string;
  'pan-distance'?: number;
  'pan-crop'?: boolean;
  zoom?: number;
  'flip-horizontal'?: boolean;
  'flip-vertical'?: boolean;
  mask?: string;
  'chroma-key'?: ChromaKeyObject;
  correction?: CorrectionObject;
}

/**
 * Audio element interface with playback controls
 */
export interface AudioElement extends BaseElement {
  src?: string;
  seek?: number;
  volume?: number;
  muted?: boolean;
  loop?: number;
}

/**
 * Movie-level text element (global across entire video)
 */
export interface MovieTextElement extends BaseElement {
  type: 'text';
  text: string;
  style?: '001' | '002' | '003' | '004' | '005' | '006' | '007' | '008' | '009' | '010';
  position?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  resize?: string;
  settings?: TextSettings;
}

/**
 * Subtitle element (only allowed at movie level)
 */
export interface SubtitleElement extends BaseElement {
  type: 'subtitles';
  captions?: string;
  src?: string;
  text?: string;
  language?: string;
  model?: 'default' | 'whisper';
  settings?: SubtitleSettings;
}

/**
 * Movie-level audio element
 */
export interface MovieAudioElement extends AudioElement {
  type: 'audio';
}

/**
 * Voice/TTS element for speech synthesis
 */
export interface VoiceElement extends BaseElement {
  type: 'voice';
  text: string;
  voice?: string;
  model?: 'azure' | 'elevenlabs' | 'elevenlabs-flash-v2-5';
  connection?: string;
  volume?: number;
  muted?: boolean;
}

/**
 * Union type for all movie-level elements
 */
export type MovieElement = MovieTextElement | SubtitleElement | MovieAudioElement | VoiceElement;

/**
 * Video element for scene-level video content
 */
export interface VideoElement extends VisualElement {
  type: 'video';
  src?: string;
  seek?: number;
  volume?: number;
  muted?: boolean;
  loop?: number;
}

/**
 * Image element with support for AI generation
 */
export interface ImageElement extends VisualElement {
  type: 'image';
  src?: string;
  prompt?: string;
  model?: 'flux-pro' | 'flux-schnell' | 'freepik-classic';
  'aspect-ratio'?: 'horizontal' | 'vertical' | 'squared';
  connection?: string;
  'model-settings'?: Record<string, any>;
}

/**
 * Scene-level text element
 */
export interface SceneTextElement extends BaseElement {
  type: 'text';
  text: string;
  style?: '001' | '002' | '003' | '004' | '005' | '006' | '007' | '008' | '009' | '010';
  position?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  resize?: string;
  settings?: TextSettings;
}

/**
 * Scene-level audio element
 */
export interface SceneAudioElement extends AudioElement {
  type: 'audio';
}

/**
 * Scene-level voice element
 */
export interface SceneVoiceElement extends BaseElement {
  type: 'voice';
  text: string;
  voice?: string;
  model?: 'azure' | 'elevenlabs' | 'elevenlabs-flash-v2-5';
  connection?: string;
  volume?: number;
  muted?: boolean;
}

/**
 * Component element for reusable video components
 */
export interface ComponentElement extends VisualElement {
  type: 'component';
  component: string;
  settings?: Record<string, any>;
}

/**
 * Audiogram element for audio waveform visualization
 */
export interface AudiogramElement extends VisualElement {
  type: 'audiogram';
  color?: string;
  opacity?: number;
  amplitude?: number;
}

/**
 * HTML element for custom HTML rendering
 */
export interface HtmlElement extends VisualElement {
  type: 'html';
  html?: string;
  src?: string;
  tailwindcss?: boolean;
  wait?: number;
}

/**
 * Union type for all scene-level elements
 */
export type SceneElement = VideoElement | ImageElement | SceneTextElement | SceneAudioElement | SceneVoiceElement | ComponentElement | AudiogramElement | HtmlElement;

/**
 * Crop object for element cropping
 */
export interface CropObject {
  width: number;
  height: number;
  x?: number;
  y?: number;
}

/**
 * Rotation object for element rotation effects
 */
export interface RotateObject {
  angle: number;
  speed?: number;
}

/**
 * Chroma key object for green screen effects
 */
export interface ChromaKeyObject {
  color: string;
  tolerance?: number;
}

/**
 * Color correction object for visual adjustments
 */
export interface CorrectionObject {
  brightness?: number;
  contrast?: number;
  gamma?: number;
  saturation?: number;
}

/**
 * Text styling settings using kebab-case properties
 */
export interface TextSettings {
  'font-family'?: string;
  'font-size'?: number | string;
  'font-weight'?: number | string;
  'font-color'?: string;
  'background-color'?: string;
  'text-align'?: 'left' | 'center' | 'right' | 'justify';
  'vertical-position'?: 'top' | 'center' | 'bottom';
  'horizontal-position'?: 'left' | 'center' | 'right';
  'line-height'?: number;
  'letter-spacing'?: number;
  'text-shadow'?: string;
  'text-decoration'?: string;
  'text-transform'?: string;
}

/**
 * Subtitle styling settings using kebab-case properties
 */
export interface SubtitleSettings {
  style?: string;
  'all-caps'?: boolean;
  'font-family'?: string;
  'font-size'?: number | string;
  'font-url'?: string;
  position?: string;
  'word-color'?: string;
  'line-color'?: string;
  'box-color'?: string;
  'outline-color'?: string;
  'outline-width'?: number;
  'shadow-color'?: string;
  'shadow-offset'?: number;
  'max-words-per-line'?: number;
  x?: number;
  y?: number;
  keywords?: string[];
  replace?: Record<string, string>;
  model?: string;
  language?: string;
}

/**
 * API rules and validation constants
 */
export const API_RULES = {
  MOVIE_ELEMENT_TYPES: ['text', 'subtitles', 'audio', 'voice'] as const,
  SCENE_ELEMENT_TYPES: ['video', 'audio', 'image', 'text', 'voice', 'component', 'audiogram', 'html'] as const,

  REQUIRED_FIELDS: {
    movie: ['scenes'] as const,
    scene: [] as const,
    video: ['type'] as const,
    audio: [] as const,
    image: [] as const,
    text: ['text', 'type'] as const,
    voice: ['text', 'type'] as const,
    subtitles: ['type'] as const,
    component: ['component', 'type'] as const,
    audiogram: [] as const,
    html: [] as const
  },

  EXPORT_RULES: {
    REQUIRED_FIELDS: {
      webhook: ['endpoint'] as const,
      ftp: ['host', 'username', 'password'] as const,
      email: ['to'] as const
    },
    VALID_DESTINATION_TYPES: ['webhook', 'ftp', 'email'] as const,
    SUPPORTS_MULTIPLE_DESTINATIONS: true,
    SINGLE_EXPORT_CONFIG: true // Currently only supports one item in exports array
  },

  SUBTITLE_RULES: {
    ONLY_AT_MOVIE_LEVEL: true,
    NOT_ALLOWED_IN_SCENES: true
  },

  VALIDATION_RANGES: {
    width: { min: 50, max: 3840 },
    height: { min: 50, max: 3840 },
    volume: { min: 0, max: 10 },
    opacity: { min: 0, max: 1 },
    'z-index': { min: -99, max: 99 },
    zoom: { min: -10, max: 10 },
    'pan-distance': { min: 0.01, max: 0.5 },
    tolerance: { min: 1, max: 100 },
    brightness: { min: -1, max: 1 },
    contrast: { min: -1000, max: 1000 },
    gamma: { min: 0.1, max: 10 },
    saturation: { min: 0, max: 3 },
    wait: { min: 0, max: 5 },
    ftpPort: { min: 1, max: 65535 },
  },

  VALID_POSITIONS: [
    'top-left', 'top-center', 'top-right',
    'center-left', 'center-center', 'center-right',
    'bottom-left', 'bottom-center', 'bottom-right',
    'custom'
  ] as const,

  VALID_QUALITIES: ['low', 'medium', 'high', 'very_high'] as const,

  VALID_RESOLUTIONS: [
    'sd', 'hd', 'full-hd', 'squared', 'instagram-story',
    'instagram-feed', 'twitter-landscape', 'twitter-portrait', 'custom'
  ] as const,

  VALID_RESIZE_MODES: ['cover', 'fill', 'fit', 'contain'] as const,

  VALID_TEXT_STYLES: ['001', '002', '003', '004', '005', '006', '007', '008', '009', '010'] as const,

  VALID_AI_MODELS: ['flux-pro', 'flux-schnell', 'freepik-classic'] as const,

  VALID_ASPECT_RATIOS: ['horizontal', 'vertical', 'squared'] as const,

  VALID_TTS_MODELS: ['azure', 'elevenlabs', 'elevenlabs-flash-v2-5'] as const,

  VALID_PAN_DIRECTIONS: [
    'left', 'right', 'top', 'bottom',
    'top-left', 'top-right', 'bottom-left', 'bottom-right'
  ] as const,

  SPECIAL_DURATION_VALUES: [-1, -2] as const, // -1 = intrinsic, -2 = match container
} as const;

/**
 * Text element parameters for processing - simplified for JSON settings approach
 */
export interface TextElementParams {
  text: string;
  textStyle?: string;
  textSettings?: string | object;
  position?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  start?: number;
  duration?: number;
  [key: string]: any;
}

/**
 * Subtitle element parameters for processing
 */
export interface SubtitleElementParams {
  captions?: string;
  src?: string;
  text?: string;
  style?: string;
  model?: string;
  language?: string;
  allCaps?: boolean;
  position?: string;
  fontSize?: number | string;
  fontFamily?: string;
  fontUrl?: string;
  wordColor?: string;
  lineColor?: string;
  boxColor?: string;
  outlineColor?: string;
  outlineWidth?: number;
  shadowColor?: string;
  shadowOffset?: number;
  maxWordsPerLine?: number;
  x?: number;
  y?: number;
  keywords?: string[];
  replace?: Record<string, string>;
}

/**
 * Basic element parameters for processing
 */
export interface BasicElementParams {
  type: string;
  src?: string;
  text?: string;
  start?: number;
  duration?: number;
  volume?: number;
  muted?: boolean;
  loop?: boolean | number;
  crop?: boolean | CropObject;
  position?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  [key: string]: any;
}

/**
 * HTML element parameters for processing
 */
export interface HtmlElementParams {
  html?: string;
  src?: string;
  tailwindcss?: boolean;
  wait?: number;
  position?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  start?: number;
  duration?: number;
  // Visual properties
  resize?: string;
  crop?: boolean | CropObject;
  rotate?: RotateObject;
  pan?: string;
  panDistance?: number;
  panCrop?: boolean;
  zoom?: number;
  flipHorizontal?: boolean;
  flipVertical?: boolean;
  mask?: string;
  chromaKey?: ChromaKeyObject;
  correction?: CorrectionObject;
  [key: string]: any;
}

/**
 * Type guard for movie-level elements
 */
export function isMovieElement(element: any): element is MovieElement {
  return Boolean(element && API_RULES.MOVIE_ELEMENT_TYPES.includes(element.type));
}

/**
 * Type guard for scene-level elements
 */
export function isSceneElement(element: any): element is SceneElement {
  return Boolean(element && API_RULES.SCENE_ELEMENT_TYPES.includes(element.type));
}

/**
 * Type guard for subtitle elements
 */
export function isSubtitleElement(element: any): element is SubtitleElement {
  return Boolean(element && element.type === 'subtitles');
}

/**
 * Type guard for text elements
 */
export function isTextElement(element: any): element is MovieTextElement | SceneTextElement {
  return Boolean(element && element.type === 'text');
}

/**
 * Type guard for HTML elements
 */
export function isHtmlElement(element: any): element is HtmlElement {
  return Boolean(element && element.type === 'html');
}

/**
 * Type guard for export destinations
 */
export function isWebhookDestination(destination: any): destination is WebhookDestination {
  return Boolean(destination && destination.type === 'webhook');
}

export function isFtpDestination(destination: any): destination is FtpDestination {
  return Boolean(destination && destination.type === 'ftp');
}

export function isEmailDestination(destination: any): destination is EmailDestination {
  return Boolean(destination && destination.type === 'email');
}

/**
 * Check if element has all required fields for its type
 */
export function hasRequiredFields(element: any): boolean {
  if (!element || !element.type) return false;

  const requiredFields = API_RULES.REQUIRED_FIELDS[element.type as keyof typeof API_RULES.REQUIRED_FIELDS];
  if (!requiredFields) return true;

  return requiredFields.every(field => {
    const value = element[field];
    if (value === undefined || value === null) return false;
    if (typeof value === 'string' && value.trim() === '') return false;
    return true;
  });
}

/**
 * Check if export destination has all required fields for its type
 */
export function hasRequiredExportFields(destination: any): boolean {
  if (!destination || !destination.type) return false;

  const requiredFields = API_RULES.EXPORT_RULES.REQUIRED_FIELDS[destination.type as keyof typeof API_RULES.EXPORT_RULES.REQUIRED_FIELDS];
  if (!requiredFields) return true;

  return requiredFields.every(field => {
    const value = destination[field];
    if (value === undefined || value === null) return false;
    if (typeof value === 'string' && value.trim() === '') return false;
    return true;
  });
}

/**
 * Validate duration value according to API rules
 */
export function isValidDuration(duration: any): boolean {
  if (duration === undefined || duration === null) return true;
  if (typeof duration === 'number') {
    return duration > 0 || (API_RULES.SPECIAL_DURATION_VALUES as readonly number[]).includes(duration);
  }
  return false;
}

/**
 * Validate position value according to API rules
 */
export function isValidPosition(position: string): boolean {
  return API_RULES.VALID_POSITIONS.includes(position as any);
}

/**
 * Validate wait time for HTML elements
 */
export function isValidWait(wait: any): boolean {
  if (wait === undefined || wait === null) return true;
  if (typeof wait === 'number') {
    return wait >= API_RULES.VALIDATION_RANGES.wait.min && wait <= API_RULES.VALIDATION_RANGES.wait.max;
  }
  return false;
}

/**
 * Validate FTP port number
 */
export function isValidFtpPort(port: any): boolean {
  if (port === undefined || port === null) return true;
  if (typeof port === 'number') {
    return port >= API_RULES.VALIDATION_RANGES.ftpPort.min && port <= API_RULES.VALIDATION_RANGES.ftpPort.max;
  }
  return false;
}

/**
 * Union type for all element types
 */
export type AllElements = MovieElement | SceneElement;

/**
 * Alias for the main request interface
 */
export type { JSON2VideoRequest as MovieRequest };

/**
 * Alias for the scene interface
 */
export type { Scene as SceneRequest };