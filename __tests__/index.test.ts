import { CreateLeonardoImageCredentials } from '../credentials/CreateLeonardoImageCredentials.credentials';
import { Json2VideoApiCredentials } from '../credentials/Json2VideoApiCredentials.credentials';
import { LeonardoAiApi } from '../credentials/LeonardoAiApi.credentials';
import * as index from '../index';
import { CreateJ2vMovie } from '../nodes/CreateJ2vMovie/CreateJ2vMovie.node';
import { CreateLeonardoImage } from '../nodes/CreateLeonardoImage/CreateLeonardoImage.node';

describe('Index exports', () => {
  it('should export nodes array', () => {
    expect(index.nodes).toBeDefined();
    expect(Array.isArray(index.nodes)).toBe(true);
    expect(index.nodes.length).toBe(2); // Should have exactly 2 nodes

    // Should contain our CreateLeonardoImage node
    const leonardoNode = index.nodes[0];
    expect(leonardoNode).toBeDefined();
    expect(leonardoNode instanceof CreateLeonardoImage).toBe(true);

    // Should contain our CreateJ2vMovie node
    const j2vMovieNode = index.nodes[1];
    expect(j2vMovieNode).toBeDefined();
    expect(j2vMovieNode instanceof CreateJ2vMovie).toBe(true);
  });

  it('should export credentials array', () => {
    expect(index.credentials).toBeDefined();
    expect(Array.isArray(index.credentials)).toBe(true);
    expect(index.credentials.length).toBe(3); // Should have exactly 3 credential types

    // Should contain our CreateLeonardoImageCredentials credentials
    const createLeonardoImageCredentials = index.credentials[0];
    expect(createLeonardoImageCredentials).toBeDefined();
    expect(createLeonardoImageCredentials instanceof CreateLeonardoImageCredentials).toBe(true);

    // Should contain our LeonardoAiApi credentials
    const leonardoAiApiCredentials = index.credentials[1];
    expect(leonardoAiApiCredentials).toBeDefined();
    expect(leonardoAiApiCredentials instanceof LeonardoAiApi).toBe(true);

    // Should contain our Json2VideoApiCredentials credentials
    const json2VideoApiCredentials = index.credentials[2];
    expect(json2VideoApiCredentials).toBeDefined();
    expect(json2VideoApiCredentials instanceof Json2VideoApiCredentials).toBe(true);
  });
});
