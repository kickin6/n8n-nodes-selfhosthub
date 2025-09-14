// nodes/CreateJ2vMovie/schema/json2videoSchema.ts

/**
 * Complete JSON2Video API Schema Definition
 * Based on official API documentation and JSON_SCHEMA.md
 * This serves as the single source of truth for all API validation
 */

// =============================================================================
// ROOT REQUEST INTERFACE
// =============================================================================

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

// =============================================================================
// EXPORT CONFIGURATION INTERFACES
// =============================================================================

export interface ExportConfig {
  // Basic export settings
  format?: 'mp4' | 'webm' | 'gif';
  quality?: 'low' | 'medium' | 'high' | 'very_high';
  resolution?: string;
  width?: number;
  height?: number;
  
  // Delivery methods (mutually exclusive)
  webhook?: WebhookExportConfig;
  ftp?: FtpExportConfig;  
  email?: EmailExportConfig;
}

export interface WebhookExportConfig {
  url: string;
}

export interface FtpExportConfig {
  host: string;
  port?: number;
  username: string;
  password: string;
  path?: string;
  secure?: boolean; // SFTP vs FTP
}

export interface EmailExportConfig {
  to: string | string[];
  from?: string;
  subject?: string;
  message?: string;
}

// =============================================================================
// SCENE INTERFACE
// =============================================================================

export interface Scene {
  id?: string;
  duration?: number;
  'background-color'?: string;
  comment?: string;
  condition?: string;
  cache?: boolean;
  variables?: Record<string, any>;
  elements: SceneElement[];
  transition?: Transition;
  iterate?: string;
}

export interface Transition {
  style: 'fade' | 'dissolve' | 'wipeLeft' | 'wipeRight' | 'wipeUp' | 'wipeDown';
  duration?: number;
}

// =============================================================================
// ELEMENT BASE INTERFACES
// =============================================================================

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

export interface AudioElement extends BaseElement {
  src?: string;
  seek?: number;
  volume?: number;
  muted?: boolean;
  loop?: number;
}

// =============================================================================
// MOVIE-LEVEL ELEMENTS (can appear in movie.elements array)
// =============================================================================

export interface MovieTextElement extends BaseElement {
  type: 'text';
  text: string;
  style?: '001' | '002' | '003' | '004';
  position?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  resize?: string;
  settings?: TextSettings;
}

export interface SubtitleElement extends BaseElement {
  type: 'subtitles';
  captions?: string;
  src?: string;
  text?: string;
  language?: string;
  model?: 'default' | 'whisper';
  settings?: SubtitleSettings;
}

export interface MovieAudioElement extends AudioElement {
  type: 'audio';
}

export interface VoiceElement extends BaseElement {
  type: 'voice';
  text: string;
  voice?: string;
  model?: 'azure' | 'elevenlabs' | 'elevenlabs-flash-v2-5';
  connection?: string;
  volume?: number;
  muted?: boolean;
}

export type MovieElement = MovieTextElement | SubtitleElement | MovieAudioElement | VoiceElement;

// =============================================================================
// SCENE-LEVEL ELEMENTS (can appear in scene.elements array)
// =============================================================================

export interface VideoElement extends VisualElement {
  type: 'video';
  src?: string;
  seek?: number;
  volume?: number;
  muted?: boolean;
  loop?: number;
}

export interface ImageElement extends VisualElement {
  type: 'image';
  src?: string;
  prompt?: string;
  model?: 'flux-pro' | 'flux-schnell' | 'freepik-classic';
  'aspect-ratio'?: 'horizontal' | 'vertical' | 'squared';
  connection?: string;
  'model-settings'?: Record<string, any>;
}

export interface SceneTextElement extends BaseElement {
  type: 'text';
  text: string;
  style?: '001' | '002' | '003' | '004';
  position?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  resize?: string;
  settings?: TextSettings;
}

export interface SceneAudioElement extends AudioElement {
  type: 'audio';
}

export interface SceneVoiceElement extends BaseElement {
  type: 'voice';
  text: string;
  voice?: string;
  model?: 'azure' | 'elevenlabs' | 'elevenlabs-flash-v2-5';
  connection?: string;
  volume?: number;
  muted?: boolean;
}

export interface ComponentElement extends VisualElement {
  type: 'component';
  component: string;
  settings?: Record<string, any>;
}

export interface AudiogramElement extends VisualElement {
  type: 'audiogram';
  color?: string;
  opacity?: number;
  amplitude?: number;
}

export interface HtmlElement extends VisualElement {
  type: 'html';
  html?: string;
  src?: string;
  tailwindcss?: boolean;
  wait?: number;
}

export type SceneElement = VideoElement | ImageElement | SceneTextElement | SceneAudioElement | SceneVoiceElement | ComponentElement | AudiogramElement | HtmlElement;

// =============================================================================
// SHARED OBJECTS
// =============================================================================

export interface CropObject {
  width: number;
  height: number;
  x?: number;
  y?: number;
}

export interface RotateObject {
  angle: number;
  speed?: number;
}

export interface ChromaKeyObject {
  color: string;
  tolerance?: number;
}

export interface CorrectionObject {
  brightness?: number;
  contrast?: number;
  gamma?: number;
  saturation?: number;
}

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

// =============================================================================
// API RULES AND VALIDATION CONSTANTS
// =============================================================================

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

  VALID_TRANSITION_STYLES: [
    'fade', 'dissolve', 'wipeLeft', 'wipeRight', 'wipeUp', 'wipeDown'
  ] as const,

  VALID_TEXT_STYLES: ['001', '002', '003', '004'] as const,

  VALID_AI_MODELS: ['flux-pro', 'flux-schnell', 'freepik-classic'] as const,

  VALID_ASPECT_RATIOS: ['horizontal', 'vertical', 'squared'] as const,

  VALID_TTS_MODELS: ['azure', 'elevenlabs', 'elevenlabs-flash-v2-5'] as const,

  VALID_PAN_DIRECTIONS: [
    'left', 'right', 'top', 'bottom',
    'top-left', 'top-right', 'bottom-left', 'bottom-right'
  ] as const,

  SPECIAL_DURATION_VALUES: [-1, -2] as const, // -1 = intrinsic, -2 = match container
} as const;

// =============================================================================
// PARAMETER INTERFACES FOR ELEMENT PROCESSING
// =============================================================================

export interface TextElementParams {
  text: string;
  style?: string;
  textTransform?: string;
  position?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  start?: number;
  duration?: number;
  // settings
  fontFamily?: string;
  fontSize?: number | string;
  fontWeight?: number | string;
  fontColor?: string;
  backgroundColor?: string;
  textAlign?: string;
  verticalPosition?: string;
  horizontalPosition?: string;
  // extended settings
  lineHeight?: number;
  letterSpacing?: number;
  textShadow?: string;
  textDecoration?: string;
}

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

// =============================================================================
// TYPE GUARDS AND UTILITIES
// =============================================================================

export function isMovieElement(element: any): element is MovieElement {
  return element && API_RULES.MOVIE_ELEMENT_TYPES.includes(element.type);
}

export function isSceneElement(element: any): element is SceneElement {
  return element && API_RULES.SCENE_ELEMENT_TYPES.includes(element.type);
}

export function isSubtitleElement(element: any): element is SubtitleElement {
  return element && element.type === 'subtitles';
}

export function isTextElement(element: any): element is MovieTextElement | SceneTextElement {
  return element && element.type === 'text';
}

export function isHtmlElement(element: any): element is HtmlElement {
  return element && element.type === 'html';
}

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

export function isValidDuration(duration: any): boolean {
  if (duration === undefined || duration === null) return true;
  if (typeof duration === 'number') {
    return duration > 0 || (API_RULES.SPECIAL_DURATION_VALUES as readonly number[]).includes(duration);
  }
  return false;
}

export function isValidPosition(position: string): boolean {
  return API_RULES.VALID_POSITIONS.includes(position as any);
}

export function isValidWait(wait: any): boolean {
  if (wait === undefined || wait === null) return true;
  if (typeof wait === 'number') {
    return wait >= API_RULES.VALIDATION_RANGES.wait.min && wait <= API_RULES.VALIDATION_RANGES.wait.max;
  }
  return false;
}

// =============================================================================
// EXPORTS
// =============================================================================

export type AllElements = MovieElement | SceneElement;
export type { JSON2VideoRequest as MovieRequest };
export type { Scene as SceneRequest };