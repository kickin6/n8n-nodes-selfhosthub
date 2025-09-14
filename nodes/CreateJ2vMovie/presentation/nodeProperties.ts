// nodes/CreateJ2vMovie/presentation/nodeProperties.ts

import { INodeProperties } from 'n8n-workflow';
import { 
  unifiedParameters,
  unifiedAdvancedModeParameter,
  mergeVideoAudioAdvancedModeParameter,
  mergeVideosAdvancedModeParameter,
  unifiedJsonTemplateParameter,
  mergeVideoAudioJsonTemplateParameter,
  mergeVideosJsonTemplateParameter,
  unifiedAdvancedParameters
} from './unifiedParameters';

// Operation parameter - first parameter that determines workflow
const operationParameter: INodeProperties = {
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  options: [
    {
      name: 'Create Movie',
      value: 'createMovie',
      description: 'Create a complete movie from movie and scene elements',
      action: 'Create Movie',
    },
    {
      name: 'Merge Video Audio',
      value: 'mergeVideoAudio',
      description: 'Merge video and audio files together',
      action: 'Merge Video and Audio',
    },
    {
      name: 'Merge Videos',
      value: 'mergeVideos',
      description: 'Merge multiple video files in sequence',
      action: 'Merge Videos',
    },
  ],
  default: 'createMovie',
  description: 'The type of video operation to perform',
};

/**
 * Get all node properties in the correct order
 */
export function getAllNodeProperties(): INodeProperties[] {
  return [
    operationParameter,
    
    // Advanced Mode toggles - operation-specific
    unifiedAdvancedModeParameter,
    mergeVideoAudioAdvancedModeParameter,
    mergeVideosAdvancedModeParameter,
    
    // JSON Template parameters - operation-specific
    unifiedJsonTemplateParameter,
    mergeVideoAudioJsonTemplateParameter,
    mergeVideosJsonTemplateParameter,
    
    // All unified parameters
    ...unifiedParameters,
    
    // Advanced mode overrides
    ...unifiedAdvancedParameters,
  ];
}

/**
 * Validate if operation is supported
 */
export function isValidOperation(operation: string): boolean {
  const validOperations = ['createMovie', 'mergeVideoAudio', 'mergeVideos'];
  return validOperations.includes(operation);
}

/**
 * Get operation-specific parameter validation rules
 */
export function getOperationValidationRules(operation: string): string[] {
  const rules: string[] = [];
  
  switch (operation) {
    case 'createMovie':
      rules.push('Requires either movie elements or scene elements');
      rules.push('Supports export configurations');
      break;
    case 'mergeVideoAudio':
      rules.push('Requires at least one video or audio element');
      break;
    case 'mergeVideos':
      rules.push('Requires at least one video element');
      rules.push('Supports transition effects');
      break;
  }
  
  return rules;
}

/**
 * Get operation-specific default values
 */
export function getOperationDefaults(operation: string): Record<string, any> {
  const defaults: Record<string, any> = {
    advancedMode: false,
    advancedModeMergeVideoAudio: false,
    advancedModeMergeVideos: false,
    cache: true,
    draft: false,
  };
  
  switch (operation) {
    case 'createMovie':
      defaults.output_width = 1920;
      defaults.output_height = 1080;
      break;
    case 'mergeVideos':
      defaults.transition = 'fade';
      defaults.transitionDuration = 1.0;
      break;
  }
  
  return defaults;
}

/**
 * Get the correct advanced mode parameter name for each operation
 */
export function getAdvancedModeParameterName(operation: string): string {
  switch (operation) {
    case 'createMovie':
      return 'advancedMode';
    case 'mergeVideoAudio':
      return 'advancedModeMergeVideoAudio';
    case 'mergeVideos':
      return 'advancedModeMergeVideos';
    default:
      return 'advancedMode';
  }
}

/**
 * Get the correct JSON template parameter name for each operation
 */
export function getJsonTemplateParameterName(operation: string): string {
  switch (operation) {
    case 'createMovie':
      return 'jsonTemplate';
    case 'mergeVideoAudio':
      return 'jsonTemplateMergeVideoAudio';
    case 'mergeVideos':
      return 'jsonTemplateMergeVideos';
    default:
      return 'jsonTemplate';
  }
}

// Helper functions
export function getOperationPlaceholder(operation: string): string {
  switch (operation) {
    case 'mergeVideoAudio':
      return 'Add Video or Audio Element';
    case 'mergeVideos':
      return 'Add Video Element';
    case 'createMovie':
    default:
      return 'Add Scene Element';
  }
}

export function getOperationDescription(operation: string): string {
  switch (operation) {
    case 'mergeVideoAudio':
      return 'Add video and audio elements to merge together. Typically one video and one audio element.';
    case 'mergeVideos':
      return 'Add multiple video elements to merge in sequence with optional transitions.';
    case 'createMovie':
    default:
      return 'Elements that appear in scenes (videos, images, text, audio)';
  }
}

export function getOperationJsonTemplate(operation: string): string {
  switch (operation) {
    case 'mergeVideoAudio':
      return `{
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
}`;
    case 'mergeVideos':
      return `{
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
      ],
      "transition": {
        "style": "fade",
        "duration": 1
      }
    }
  ]
}`;
    case 'createMovie':
    default:
      return `{
  "width": 1024,
  "height": 768,
  "quality": "high",
  "elements": [
    {
      "type": "subtitles",
      "src": "https://example.com/subtitles.srt"
    }
  ],
  "scenes": [
    {
      "elements": [
        {
          "type": "image",
          "src": "https://example.com/image.jpg",
          "duration": 3
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
}`;
  }
}