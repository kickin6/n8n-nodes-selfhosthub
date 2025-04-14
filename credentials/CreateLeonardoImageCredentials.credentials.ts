// CreateLeonardoImageCredentials.credentials.ts

import { ICredentialType, INodeProperties } from 'n8n-workflow';

export class CreateLeonardoImageCredentials implements ICredentialType {
  name = 'createLeonardoImageCredentials';
  displayName = 'Self-Host Hub - Leonardo Image Creator';
  documentationUrl = 'https://docs.leonardo.ai/docs';
  properties: INodeProperties[] = [
    {
      displayName: 'API Key',
      name: 'apiKey',
      type: 'string',
      typeOptions: { password: true },
      default: '',
      required: true,
      description: 'Your Leonardo API key for image generation',
    },
  ];
}
