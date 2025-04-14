import { LeonardoAiApi } from '../../credentials/LeonardoAiApi.credentials';

describe('LeonardoAiApi Credentials', () => {
  let credentials: LeonardoAiApi;

  beforeEach(() => {
    credentials = new LeonardoAiApi();
  });

  it('should be properly named', () => {
    expect(credentials.name).toBe('leonardoAiApi');
    expect(credentials.displayName).toBe('Self-Host Hub - Leonardo API');
  });

  it('should have documentation URL', () => {
    expect(credentials.documentationUrl).toBe('https://docs.leonardo.ai/docs');
  });

  it('should define required properties', () => {
    expect(credentials.properties).toBeDefined();
    expect(credentials.properties.length).toBeGreaterThan(0);

    const apiKeyProperty = credentials.properties.find(p => p.name === 'apiKey');
    expect(apiKeyProperty).toBeDefined();
    expect(apiKeyProperty?.type).toBe('string');
    expect(apiKeyProperty?.displayName).toBe('API Key');
    expect(apiKeyProperty?.required).toBe(true);

    // Should be private/hidden
    expect(apiKeyProperty?.typeOptions).toHaveProperty('password', true);
  });
});
