import { CreateLeonardoImageCredentials } from '../../credentials/CreateLeonardoImageCredentials.credentials';

describe('CreateLeonardoImageCredentials', () => {
  let credentials: CreateLeonardoImageCredentials;

  beforeEach(() => {
    credentials = new CreateLeonardoImageCredentials();
  });

  describe('properties', () => {
    it('should define the credential type correctly', () => {
      expect(credentials.name).toBe('createLeonardoImageCredentials');
      expect(credentials.displayName).toBe('Self-Host Hub - Leonardo Image Creator');
      expect(credentials.documentationUrl).toBe('https://docs.leonardo.ai/docs');
    });

    it('should define required properties correctly', () => {
      const apiKeyProperty = credentials.properties.find(p => p.name === 'apiKey');
      expect(apiKeyProperty).toBeDefined();
      expect(apiKeyProperty!.type).toBe('string');
      expect(apiKeyProperty!.default).toBe('');
      expect(apiKeyProperty!.required).toBe(true);
      expect(apiKeyProperty!.typeOptions).toHaveProperty('password', true);
      expect(apiKeyProperty!.description).toBeDefined();
    });
  });
});