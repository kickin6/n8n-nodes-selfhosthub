import {
  IAuthenticateGeneric,
  ICredentialTestRequest,
  ICredentialType,
  INodeProperties,
} from 'n8n-workflow';

export class Json2VideoApiCredentials implements ICredentialType {
  name = 'json2VideoApiCredentials';
  displayName = 'JSON2Video API';
  documentationUrl = 'https://json2video.com/docs/api/';
  properties: INodeProperties[] = [
    {
      displayName: 'API Key',
      name: 'apiKey',
      type: 'string',
      typeOptions: { password: true },
      default: '',
      required: true,
      description: 'The API key from your JSON2Video account (Settings > API Keys)',
    },
  ];

  authenticate: IAuthenticateGeneric = {
    type: 'generic',
    properties: {
      headers: {
        'x-api-key': '={{$credentials.apiKey}}',
      },
    },
  };

  test: ICredentialTestRequest = {
    request: {
      baseURL: 'https://api.json2video.com/v2',
      url: '/movies',
      method: 'POST',
      body: {
        data: {
          id: `test-${Date.now()}`,
          width: 640,
          height: 360,
          fps: 25,
          scenes: [{ elements: [] }]
        },
        quality: 'low'
      },
    },
  };
}