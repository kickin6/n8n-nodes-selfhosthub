import { CreateLeonardoImage } from './nodes/CreateLeonardoImage/CreateLeonardoImage.node';
import { CreateLeonardoImageCredentials } from './credentials/CreateLeonardoImageCredentials.credentials';
import { LeonardoAiApi } from './credentials/LeonardoAiApi.credentials';

// Create instances of our classes for exporting
const createLeonardoImageInstance = new CreateLeonardoImage();
const createLeonardoImageCredentialsInstance = new CreateLeonardoImageCredentials();
const leonardoAiApiCredentialsInstance = new LeonardoAiApi();

// Export the node instances
export const nodes = [createLeonardoImageInstance];

// Export the credential instances
export const credentials = [
  createLeonardoImageCredentialsInstance,
  leonardoAiApiCredentialsInstance
];
