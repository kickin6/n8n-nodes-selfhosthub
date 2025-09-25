// nodes/CreateJ2vMovie/presentation/properties.ts

import { INodeProperties } from 'n8n-workflow';
import {
  unifiedParameters,
  unifiedAdvancedModeParameter,
  jsonTemplateBlank,
  jsonTemplateVideoImage,
  jsonTemplateVideoAudio,
  jsonTemplateVideoSequence,
  jsonTemplateSlideshow,
  jsonTemplateTextOverlay,
  jsonTemplateFaceless,
  jsonTemplateSocialStory,
  jsonTemplatePresentation,
} from './parameters';
import { templateSelectorParameter } from './templates';

/**
 * Get all node properties in the correct order for n8n UI
 */
export function getAllNodeProperties(): INodeProperties[] {
  return [
    unifiedAdvancedModeParameter,
    templateSelectorParameter,
    ...unifiedParameters,
    jsonTemplateBlank,
    jsonTemplateVideoImage,
    jsonTemplateVideoAudio,
    jsonTemplateVideoSequence,
    jsonTemplateSlideshow,
    jsonTemplateTextOverlay,
    jsonTemplateFaceless,
    jsonTemplateSocialStory,
    jsonTemplatePresentation,
  ];
}