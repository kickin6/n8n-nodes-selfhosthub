import { buildWebhookObject, isValidWebhookUrl, buildWebhookExports, sanitizeWebhookUrl } from '../../../../nodes/CreateJ2vMovie/utils/webhookUtils';

describe('webhookUtils', () => {
  describe('isValidWebhookUrl', () => {
    test('should return true for valid URLs', () => {
      const validUrls = [
        'https://example.com/webhook',
        'http://example.com/webhook',
        'https://webhook.site/test',
        'https://api.example.com/webhook/path?param=value',
        'https://subdomain.domain.com/path'
      ];

      validUrls.forEach(url => {
        expect(isValidWebhookUrl(url)).toBe(true);
      });
    });

    test('should return false for invalid URLs', () => {
      const invalidUrls = [
        '',
        'ftp://example.com',
        'invalid://url',
        'https://',
        'http://',
        null,
        undefined
      ];

      invalidUrls.forEach(url => {
        expect(isValidWebhookUrl(url as any)).toBe(false);
      });
    });

    test('should handle edge cases', () => {
      expect(isValidWebhookUrl('https://example.com')).toBe(true);
      expect(isValidWebhookUrl('https://192.168.1.1/webhook')).toBe(true);
      expect(isValidWebhookUrl('https://localhost:3000/webhook')).toBe(true);
    });
  });

  describe('buildWebhookObject', () => {
    test('should return webhook object for valid URL', () => {
      const validUrl = 'https://webhook.site/test';
      const result = buildWebhookObject(validUrl);
      
      expect(result).toEqual({
        url: validUrl
      });
    });

    test('should return undefined for empty/null URLs', () => {
      const invalidUrls = [
        '',
        null,
        undefined
      ];

      invalidUrls.forEach(url => {
        expect(buildWebhookObject(url as any)).toBeUndefined();
      });
      
      // buildWebhookObject doesn't validate URL format, just checks for presence
      expect(buildWebhookObject('not-a-url')).toEqual({ url: 'not-a-url' });
      expect(buildWebhookObject('ftp://example.com')).toEqual({ url: 'ftp://example.com' });
    });

    test('should handle URL with query parameters', () => {
      const urlWithParams = 'https://example.com/webhook?token=abc123&type=json';
      const result = buildWebhookObject(urlWithParams);
      
      expect(result).toEqual({
        url: urlWithParams
      });
    });

    test('should handle localhost URLs', () => {
      const localhostUrl = 'http://localhost:3000/webhook';
      const result = buildWebhookObject(localhostUrl);
      
      expect(result).toEqual({
        url: localhostUrl
      });
    });
  });

  describe('buildWebhookExports', () => {
    test('should return webhook exports array for valid URL', () => {
      const validUrl = 'https://webhook.site/test';
      const result = buildWebhookExports(validUrl);
      
      expect(result).toEqual([{
        destinations: [{
          type: 'webhook',
          endpoint: validUrl
        }]
      }]);
    });

    test('should return undefined for invalid URLs', () => {
      const invalidUrls = [
        '',
        null,
        undefined
      ];

      invalidUrls.forEach(url => {
        expect(buildWebhookExports(url as any)).toBeUndefined();
      });
    });
  });

  describe('sanitizeWebhookUrl', () => {
    test('should return trimmed URL for valid input', () => {
      const url = '  https://example.com/webhook  ';
      const result = sanitizeWebhookUrl(url);
      
      expect(result).toBe('https://example.com/webhook');
    });

    test('should return null for invalid input', () => {
      const invalidInputs = [
        '',
        null,
        undefined
      ];

      invalidInputs.forEach(input => {
        expect(sanitizeWebhookUrl(input as any)).toBe(null);
      });
    });

    test('should handle already clean URLs', () => {
      const cleanUrl = 'https://example.com/webhook';
      const result = sanitizeWebhookUrl(cleanUrl);
      
      expect(result).toBe(cleanUrl);
    });
  });
});