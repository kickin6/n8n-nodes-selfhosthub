// nodes/CreateJ2vMovie/presentation/nodeProperties.ts
// Updated to use unified parameters with single collection

import { INodeProperties } from 'n8n-workflow';
import { 
  unifiedParameters,
  unifiedAdvancedModeParameter,
  mergeVideoAudioAdvancedModeParameter,
  mergeVideosAdvancedModeParameter,
  unifiedJsonTemplateParameter,
  mergeVideoAudioJsonTemplateParameter,
  mergeVideosJsonTemplateParameter,
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
      description: 'Create a complete video from elements with optional subtitles and export',
    },
    {
      name: 'Merge Video Audio',
      value: 'mergeVideoAudio',
      description: 'Merge video and audio files together',
    },
    {
      name: 'Merge Videos',
      value: 'mergeVideos',
      description: 'Merge multiple video files in sequence',
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
    // 1. Operation selector (always first)
    operationParameter,
    
    // 2. Operation-specific advanced mode toggles (right after operation)
    unifiedAdvancedModeParameter,
    mergeVideoAudioAdvancedModeParameter,
    mergeVideosAdvancedModeParameter,
    
    // 3. All unified parameters (single collection approach)
    ...unifiedParameters,
    
    // 4. Operation-specific JSON template parameters
    unifiedJsonTemplateParameter,
    mergeVideoAudioJsonTemplateParameter,
    mergeVideosJsonTemplateParameter,
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
      rules.push('Requires at least one element or subtitles content');
      rules.push('Supports movie-level subtitles');
      rules.push('Supports export configurations');
      break;
    case 'mergeVideoAudio':
      rules.push('Requires at least one video or audio element');
      break;
    case 'mergeVideos':
      rules.push('Requires at least one video element');
      rules.push('Multiple video elements will be merged in sequence');
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
    enableSubtitles: false,
  };
  
  // No operation-specific defaults needed for unified architecture
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

// Helper functions for operation-specific UI behavior
export function getOperationPlaceholder(operation: string): string {
  switch (operation) {
    case 'mergeVideoAudio':
      return 'Add Video or Audio Element';
    case 'mergeVideos':
      return 'Add Video Element';
    case 'createMovie':
    default:
      return 'Add Element';
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
      return 'Create a complete video with any combination of elements (videos, images, text, audio, etc.)';
  }
}

export function getOperationJsonTemplate(operation: string): string {
  switch (operation) {
    case 'mergeVideoAudio':
      return `{
  "width": 1920,
  "height": 1080,
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
  "width": 1920,
  "height": 1080,
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
      ]
    }
  ]
}`;
    case 'createMovie':
    default:
      return `{
  "width": 1920,
  "height": 1080,
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
          "type": "video",
          "src": "https://example.com/video.mp4"
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