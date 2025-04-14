import * as index from '../index';
import { CreateLeonardoImage } from '../nodes/CreateLeonardoImage/CreateLeonardoImage.node';
import { CreateLeonardoImageCredentials } from '../credentials/CreateLeonardoImageCredentials.credentials';
import { LeonardoAiApi } from '../credentials/LeonardoAiApi.credentials';

describe('Index exports', () => {
  it('should export nodes array', () => {
    expect(index.nodes).toBeDefined();
    expect(Array.isArray(index.nodes)).toBe(true);
    expect(index.nodes.length).toBeGreaterThan(0);

    // Should contain our CreateLeonardoImage node
    const leonardoNode = index.nodes[0];
    expect(leonardoNode).toBeDefined();
    expect(leonardoNode instanceof CreateLeonardoImage).toBe(true);
  });

  it('should export credentials array', () => {
    expect(index.credentials).toBeDefined();
    expect(Array.isArray(index.credentials)).toBe(true);
    expect(index.credentials.length).toBe(2); // Should have exactly 2 credential types

    // Should contain our CreateLeonardoImageCredentials credentials
    const createLeonardoImageCredentials = index.credentials[0];
    expect(createLeonardoImageCredentials).toBeDefined();
    expect(createLeonardoImageCredentials instanceof CreateLeonardoImageCredentials).toBe(true);
    
    // Should contain our LeonardoAiApi credentials
    const leonardoAiApiCredentials = index.credentials[1];
    expect(leonardoAiApiCredentials).toBeDefined();
    expect(leonardoAiApiCredentials instanceof LeonardoAiApi).toBe(true);
  });
});
