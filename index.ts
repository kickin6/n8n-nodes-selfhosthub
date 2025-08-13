import { CreateLeonardoImageCredentials } from './credentials/CreateLeonardoImageCredentials.credentials';
import { Json2VideoApiCredentials } from './credentials/Json2VideoApiCredentials.credentials';
import { LeonardoAiApi } from './credentials/LeonardoAiApi.credentials';
import { CreateJ2vMovie } from './nodes/CreateJ2vMovie/CreateJ2vMovie.node';
import { CreateLeonardoImage } from './nodes/CreateLeonardoImage/CreateLeonardoImage.node';

// Create instances of our classes for exporting
const createLeonardoImageInstance = new CreateLeonardoImage();
const createLeonardoImageCredentialsInstance = new CreateLeonardoImageCredentials();
const leonardoAiApiCredentialsInstance = new LeonardoAiApi();
const createJ2vMovieInstance = new CreateJ2vMovie();
const json2VideoApiCredentialsInstance = new Json2VideoApiCredentials();

// Export the node instances
export const nodes = [createLeonardoImageInstance, createJ2vMovieInstance];

// Export the credential instances
export const credentials = [
  createLeonardoImageCredentialsInstance,
  leonardoAiApiCredentialsInstance,
  json2VideoApiCredentialsInstance
];
