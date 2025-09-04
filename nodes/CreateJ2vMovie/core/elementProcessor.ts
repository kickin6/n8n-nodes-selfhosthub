// nodes/CreateJ2vMovie/core/elementProcessor.ts

import {
  MovieTextElement,
  SceneTextElement,
  SubtitleElement,
  TextElementParams,
  SubtitleElementParams,
  TextSettings,
  SubtitleSettings,
  MovieElement,
  SceneElement,
  API_RULES
} from '../schema/json2videoSchema';

// =============================================================================
// TEXT ELEMENT PROCESSING
// =============================================================================

export function processTextElement(params: TextElementParams): MovieTextElement | SceneTextElement {
  const textElement: MovieTextElement | SceneTextElement = {
    type: 'text',
    text: params.text,
  };

  // Add timing properties
  if (params.start !== undefined) {
    textElement.start = params.start;
  }
  if (params.duration !== undefined) {
    textElement.duration = params.duration;
  }

  // Add positioning properties
  if (params.position) {
    textElement.position = params.position;
  }
  if (params.x !== undefined) {
    textElement.x = params.x;
  }
  if (params.y !== undefined) {
    textElement.y = params.y;
  }
  // REMOVED: Defensive width/height checks - if they're provided, use them
  if (params.width !== undefined) {
    textElement.width = params.width;
  }
  if (params.height !== undefined) {
    textElement.height = params.height;
  }

  // REMOVED: Defensive style validation - schema validators handle this
  if (params.style) {
    textElement.style = params.style as '001' | '002' | '003' | '004';
  }

  // Build settings object for text styling
  const settings: TextSettings = {};

  if (params.fontFamily) {
    settings['font-family'] = params.fontFamily;
  }
  if (params.fontSize !== undefined) {
    if (typeof params.fontSize === 'string') {
      const numericSize = parseFloat(params.fontSize.replace(/px|pt|em|rem/g, ''));
      (settings as any)['font-size'] = isNaN(numericSize) ? params.fontSize : numericSize;
    } else {
      (settings as any)['font-size'] = params.fontSize;
    }
  }
  if (params.fontWeight !== undefined) {
    settings['font-weight'] = params.fontWeight;
  }
  if (params.fontColor) {
    settings['font-color'] = params.fontColor;
  }
  if (params.backgroundColor) {
    settings['background-color'] = params.backgroundColor;
  }

  // REMOVED: Defensive alignment validation - schema validators handle this
  if (params.textAlign) {
    settings['text-align'] = params.textAlign as 'left' | 'center' | 'right' | 'justify';
  }
  if (params.verticalPosition) {
    settings['vertical-position'] = params.verticalPosition as 'top' | 'center' | 'bottom';
  }
  if (params.horizontalPosition) {
    settings['horizontal-position'] = params.horizontalPosition as 'left' | 'center' | 'right';
  }

  // Additional text properties
  if (params.lineHeight !== undefined) {
    settings['line-height'] = params.lineHeight;
  }
  if (params.letterSpacing !== undefined) {
    settings['letter-spacing'] = params.letterSpacing;
  }
  if (params.textShadow) {
    settings['text-shadow'] = params.textShadow;
  }
  if (params.textDecoration) {
    settings['text-decoration'] = params.textDecoration;
  }
  if (params.textTransform) {
    settings['text-transform'] = params.textTransform;
  }

  if (Object.keys(settings).length > 0) {
    textElement.settings = settings;
  }

  return textElement;
}

// =============================================================================
// SUBTITLE ELEMENT PROCESSING
// =============================================================================

export function processSubtitleElement(params: SubtitleElementParams): SubtitleElement {
  const subtitleElement: SubtitleElement = {
    type: 'subtitles',
  };

  if (params.captions) {
    subtitleElement.captions = params.captions;
  }

  if (params.language) {
    subtitleElement.language = params.language;
  }
  if (params.model) {
    subtitleElement.model = params.model as 'default' | 'whisper';
  }

  const settings: SubtitleSettings = {};

  if (params.style) {
    settings.style = params.style;
  }
  if (params.allCaps !== undefined) {
    settings['all-caps'] = params.allCaps;
  }
  if (params.position) {
    settings.position = params.position;
  }

  if (params.fontFamily) {
    settings['font-family'] = params.fontFamily;
  }
  if (params.fontSize !== undefined) {
    settings['font-size'] = params.fontSize;
  }
  if (params.fontUrl) {
    settings['font-url'] = params.fontUrl;
  }

  if (params.wordColor) {
    settings['word-color'] = params.wordColor;
  }
  if (params.lineColor) {
    settings['line-color'] = params.lineColor;
  }
  if (params.boxColor) {
    settings['box-color'] = params.boxColor;
  }
  if (params.outlineColor) {
    settings['outline-color'] = params.outlineColor;
  }
  if (params.shadowColor) {
    settings['shadow-color'] = params.shadowColor;
  }

  if (params.outlineWidth !== undefined) {
    settings['outline-width'] = params.outlineWidth;
  }
  if (params.shadowOffset !== undefined) {
    settings['shadow-offset'] = params.shadowOffset;
  }
  if (params.maxWordsPerLine !== undefined) {
    settings['max-words-per-line'] = params.maxWordsPerLine;
  }

  if (params.x !== undefined) {
    settings.x = params.x;
  }
  if (params.y !== undefined) {
    settings.y = params.y;
  }

  if (params.keywords && params.keywords.length > 0) {
    settings.keywords = params.keywords;
  }
  if (params.replace && Object.keys(params.replace).length > 0) {
    settings.replace = params.replace;
  }

  if (Object.keys(settings).length > 0) {
    subtitleElement.settings = settings;
  }

  return subtitleElement;
}

// =============================================================================
// BASIC ELEMENT PROCESSING
// =============================================================================

export function processBasicElement(element: any): MovieElement | SceneElement {
  const processed = { ...element };

  // API TRANSFORMATIONS
  if (typeof processed.loop === 'boolean') {
    processed.loop = processed.loop ? -1 : 1;
  }

  if (typeof processed.crop === 'boolean') {
    processed.resize = processed.crop ? 'cover' : 'contain';
    delete processed.crop;
  }

  if (processed.volume !== undefined) {
    const volume = typeof processed.volume === 'string' ? parseFloat(processed.volume) : Number(processed.volume);
    if (!isNaN(volume)) {
      processed.volume = Math.max(0, Math.min(API_RULES.VALIDATION_RANGES.volume.max, volume));
    }
  }

  // CamelCase to kebab-case conversions
  if (processed.fadeIn !== undefined) {
    processed['fade-in'] = processed.fadeIn;
    delete processed.fadeIn;
  }
  if (processed.fadeOut !== undefined) {
    processed['fade-out'] = processed.fadeOut;
    delete processed.fadeOut;
  }
  if (processed.zIndex !== undefined) {
    processed['z-index'] = processed.zIndex;
    delete processed.zIndex;
  }
  if (processed.backgroundColor !== undefined) {
    processed['background-color'] = processed.backgroundColor;
    delete processed.backgroundColor;
  }
  if (processed.extraTime !== undefined) {
    processed['extra-time'] = processed.extraTime;
    delete processed.extraTime;
  }
  if (processed.panDistance !== undefined) {
    processed['pan-distance'] = processed.panDistance;
    delete processed.panDistance;
  }
  if (processed.panCrop !== undefined) {
    processed['pan-crop'] = processed.panCrop;
    delete processed.panCrop;
  }
  if (processed.flipHorizontal !== undefined) {
    processed['flip-horizontal'] = processed.flipHorizontal;
    delete processed.flipHorizontal;
  }
  if (processed.flipVertical !== undefined) {
    processed['flip-vertical'] = processed.flipVertical;
    delete processed.flipVertical;
  }
  if (processed.chromaKey !== undefined) {
    processed['chroma-key'] = processed.chromaKey;
    delete processed.chromaKey;
  }

  // Element-specific processing
  if (processed.type === 'image') {
    if (processed.aspectRatio !== undefined) {
      processed['aspect-ratio'] = processed.aspectRatio;
      delete processed.aspectRatio;
    }
    if (processed.modelSettings !== undefined) {
      processed['model-settings'] = processed.modelSettings;
      delete processed.modelSettings;
    }
  }

  if (processed.type === 'component' && !processed.component) {
    throw new Error('Component elements require a component ID');
  }

  if (processed.type === 'audiogram' && processed.color) {
    if (!processed.color.startsWith('#')) {
      processed.color = `#${processed.color}`;
    }
  }

  // Duration validation
  if (processed.duration !== undefined) {
    const duration = typeof processed.duration === 'string' ? parseFloat(processed.duration) : Number(processed.duration);
    if (!isNaN(duration) && duration !== -1 && duration !== -2) {
      processed.duration = Math.max(0, duration);
    }
  }

  if (processed.start !== undefined) {
    const start = typeof processed.start === 'string' ? parseFloat(processed.start) : Number(processed.start);
    if (!isNaN(start)) {
      processed.start = Math.max(0, start);
    }
  }

  return processed as MovieElement | SceneElement;
}

// =============================================================================
// MAIN ELEMENT PROCESSOR ROUTER
// =============================================================================

export function processElement(element: any): MovieElement | SceneElement {
  if (!element || !element.type) {
    throw new Error('Element must have a type property');
  }

  const elementType = element.type;

  switch (elementType) {
    case 'text':
      return processTextElement(element as TextElementParams);

    case 'subtitles':
      return processSubtitleElement(element as SubtitleElementParams);

    case 'video':
    case 'audio':
    case 'image':
    case 'voice':
    case 'component':
    case 'audiogram':
      return processBasicElement(element);

    default:
      return processBasicElement(element);
  }
}

// =============================================================================
// BATCH PROCESSING UTILITIES
// =============================================================================

export function processElements(elements: any[]): {
  processed: (MovieElement | SceneElement)[];
  errors: string[];
} {
  const processed: (MovieElement | SceneElement)[] = [];
  const errors: string[] = [];

  if (!Array.isArray(elements)) {
    return { processed: [], errors: ['Elements must be an array'] };
  }

  elements.forEach((element, index) => {
    try {
      const processedElement = processElement(element);
      processed.push(processedElement);
    } catch (error) {
      errors.push(`Element ${index + 1}: ${(error as Error).message}`);
    }
  });

  return { processed, errors };
}

export function processMovieElements(elements: any[]): {
  processed: MovieElement[];
  errors: string[];
} {
  const { processed, errors } = processElements(elements);

  const movieElements: MovieElement[] = [];

  processed.forEach((element, index) => {
    if ((API_RULES.MOVIE_ELEMENT_TYPES as readonly string[]).includes(element.type)) {
      movieElements.push(element as MovieElement);
    } else {
      errors.push(`Element ${index + 1}: Type '${element.type}' is not allowed at movie level`);
    }
  });

  return { processed: movieElements, errors };
}

export function processSceneElements(elements: any[]): {
  processed: SceneElement[];
  errors: string[];
} {
  const { processed, errors } = processElements(elements);

  const sceneElements: SceneElement[] = [];

  processed.forEach((element, index) => {
    if (element.type === 'subtitles') {
      errors.push(`Element ${index + 1}: Subtitles can only be added at movie level, not in scenes`);
    } else if ((API_RULES.SCENE_ELEMENT_TYPES as readonly string[]).includes(element.type)) {
      sceneElements.push(element as SceneElement);
    } else {
      errors.push(`Element ${index + 1}: Type '${element.type}' is not allowed at scene level`);
    }
  });

  return { processed: sceneElements, errors };
}

// =============================================================================
// ELEMENT TYPE DETECTION UTILITIES
// =============================================================================

export function getElementContext(elementType: string): 'movie' | 'scene' | 'both' {
  if (elementType === 'subtitles') {
    return 'movie';
  }

  if (['video', 'image', 'component', 'audiogram'].includes(elementType)) {
    return 'scene';
  }

  if (['text', 'audio', 'voice'].includes(elementType)) {
    return 'both';
  }

  return 'scene';
}

export function validateElementContext(elementType: string, context: 'movie' | 'scene'): boolean {
  if (context === 'movie') {
    return (API_RULES.MOVIE_ELEMENT_TYPES as readonly string[]).includes(elementType);
  } else {
    return (API_RULES.SCENE_ELEMENT_TYPES as readonly string[]).includes(elementType);
  }
}