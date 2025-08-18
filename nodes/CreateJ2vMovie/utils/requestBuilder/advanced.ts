import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { buildWebhookObject } from '../webhookUtils';
import { VideoRequestBody } from './types';

/**
 * Apply advanced mode overrides to a parsed JSON template
 */
export function applyAdvancedModeOverrides(
  this: IExecuteFunctions,
  parsedTemplate: IDataObject,
  operation: string,
  itemIndex: number
): VideoRequestBody {
  const result = { ...parsedTemplate } as unknown as VideoRequestBody;

  const recordId = this.getNodeParameter('recordId', itemIndex, '') as string;
  const outputWidth = this.getNodeParameter('outputWidth', itemIndex, null) as number | null;
  const outputHeight = this.getNodeParameter('outputHeight', itemIndex, null) as number | null;
  const framerate = this.getNodeParameter('framerate', itemIndex, null) as number | null;
  const webhookUrl = this.getNodeParameter('webhookUrl', itemIndex, '') as string;

  if (recordId) result.id = recordId;
  if (outputWidth) result.width = outputWidth;
  if (outputHeight) result.height = outputHeight;
  if (framerate) result.fps = framerate;

  const webhook = buildWebhookObject(webhookUrl);
  if (webhook) {
    result.webhook = webhook;
  }

  try {
    const quality = this.getNodeParameter('quality', itemIndex, null) as string | null;
    if (quality) result.quality = quality;
  } catch (e) {
    // Quality parameter not available
  }

  try {
    const cache = this.getNodeParameter('cache', itemIndex, null) as boolean | null;
    if (cache !== null) result.cache = cache;
  } catch (e) {
    // Cache parameter not available
  }

  try {
    const draft = this.getNodeParameter('draft', itemIndex, null) as boolean | null;
    if (draft !== null) result.draft = draft;
  } catch (e) {
    // Draft parameter not available
  }

  try {
    const resolution = this.getNodeParameter('resolution', itemIndex, null) as string | null;
    if (resolution) result.resolution = resolution;
  } catch (e) {
    // Resolution parameter not available
  }

  return result;
}