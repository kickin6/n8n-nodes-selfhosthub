import { IDataObject } from 'n8n-workflow';

/**
 * Builds webhook object for JSON2Video API
 * Returns undefined if no webhook URL is provided
 */
export function buildWebhookObject(webhookUrl: string): IDataObject | undefined {
  if (!webhookUrl || typeof webhookUrl !== 'string' || webhookUrl.trim() === '') {
    return undefined;
  }

  return {
    url: webhookUrl.trim(),
  };
}

/**
 * Builds webhook object in exports format for JSON2Video API
 * This is used in basic mode for some operations
 */
export function buildWebhookExports(webhookUrl: string): IDataObject[] | undefined {
  if (!webhookUrl || typeof webhookUrl !== 'string' || webhookUrl.trim() === '') {
    return undefined;
  }

  return [{
    destinations: [{
      type: 'webhook',
      endpoint: webhookUrl.trim()
    }]
  }];
}

/**
 * Validates webhook URL format
 */
export function isValidWebhookUrl(url: string): boolean {
  if (!url || typeof url !== 'string') {
    return false;
  }

  try {
    const parsed = new URL(url.trim());
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch (error) {
    return false;
  }
}

/**
 * Sanitizes webhook URL by trimming whitespace and validating format
 */
export function sanitizeWebhookUrl(url: string): string | null {
  if (!url || typeof url !== 'string') {
    return null;
  }

  const trimmed = url.trim();
  if (!isValidWebhookUrl(trimmed)) {
    return null;
  }

  return trimmed;
}