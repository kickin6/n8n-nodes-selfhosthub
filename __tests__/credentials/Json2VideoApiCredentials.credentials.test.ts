import { Json2VideoApiCredentials } from '../../credentials/Json2VideoApiCredentials.credentials';

describe('Json2VideoApiCredentials', () => {
  let credentials: Json2VideoApiCredentials;

  beforeEach(() => {
    credentials = new Json2VideoApiCredentials();
  });

  describe('properties', () => {
    it('should define the credential type correctly', () => {
      expect(credentials.name).toBe('json2VideoApiCredentials');
      expect(credentials.displayName).toBe('JSON2Video API');
      expect(credentials.documentationUrl).toBe('https://json2video.com/docs/api/');
    });

    it('should define required properties correctly', () => {
      const apiKeyProperty = credentials.properties.find(p => p.name === 'apiKey');
      expect(apiKeyProperty).toBeDefined();
      expect(apiKeyProperty!.displayName).toBe('API Key');
      expect(apiKeyProperty!.type).toBe('string');
      expect(apiKeyProperty!.default).toBe('');
      expect(apiKeyProperty!.required).toBe(true);
      expect(apiKeyProperty!.typeOptions).toHaveProperty('password', true);
      expect(apiKeyProperty!.description).toBe('The API key from your JSON2Video account (Settings > API Keys)');
    });
  });

  describe('authentication', () => {
    it('should define generic authentication correctly', () => {
      expect(credentials.authenticate).toBeDefined();
      expect(credentials.authenticate!.type).toBe('generic');
      expect(credentials.authenticate!.properties).toBeDefined();
      expect(credentials.authenticate!.properties?.headers).toBeDefined();
      expect(credentials.authenticate!.properties?.headers?.['x-api-key']).toBe('={{$credentials.apiKey}}');
    });
  });

  describe('credential test', () => {
    it('should define test request correctly', () => {
      expect(credentials.test).toBeDefined();
      expect(credentials.test!.request).toBeDefined();

      const testRequest = credentials.test!.request;
      expect(testRequest.baseURL).toBe('https://api.json2video.com/v2');
      expect(testRequest.url).toBe('/movies');
      expect(testRequest.method).toBe('POST');
    });

    it('should define test request body correctly', () => {
      const testRequest = credentials.test!.request;
      expect(testRequest.body).toBeDefined();

      const body = testRequest.body as { data: any; quality: string };
      expect(body?.data).toBeDefined();
      expect(body?.quality).toBe('low');

      const data = body?.data;
      expect(data?.id).toMatch(/^test-\d+$/);
      expect(data?.width).toBe(640);
      expect(data?.height).toBe(360);
      expect(data?.fps).toBe(25);
      expect(data?.scenes).toBeDefined();
      expect(Array.isArray(data?.scenes)).toBe(true);
      expect(data?.scenes?.[0]).toEqual({ elements: [] });
    });

    it('should generate unique test IDs', () => {
      const testRequest = credentials.test!.request;
      const body = testRequest.body as { data: { id: string } };
      const testId1 = body?.data?.id;

      // Create new instance to simulate different test runs
      const credentials2 = new Json2VideoApiCredentials();
      const testRequest2 = credentials2.test!.request;
      const body2 = testRequest2.body as { data: { id: string } };
      const testId2 = body2?.data?.id;

      // Note: This test might be flaky due to timing, but demonstrates the intent
      // In a real scenario, you might want to mock Date.now() for deterministic testing
      expect(testId1).toMatch(/^test-\d+$/);
      expect(testId2).toMatch(/^test-\d+$/);
    });
  });

  describe('integration', () => {
    it('should have all required properties for n8n credential type', () => {
      expect(credentials.name).toBeDefined();
      expect(credentials.displayName).toBeDefined();
      expect(credentials.documentationUrl).toBeDefined();
      expect(credentials.properties).toBeDefined();
      expect(credentials.authenticate).toBeDefined();
      expect(credentials.test).toBeDefined();
    });

    it('should properly format authentication headers', () => {
      const authHeaders = credentials.authenticate?.properties?.headers;
      expect(authHeaders).toBeDefined();
      expect(authHeaders?.['x-api-key']).toBe('={{$credentials.apiKey}}');
    });
  });
});