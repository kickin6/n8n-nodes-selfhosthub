import { ICredentialType, INodeProperties } from 'n8n-workflow';

export class LeonardoAiApi implements ICredentialType {
  name = 'leonardoAiApi';
  displayName = 'Self-Host Hub - Leonardo API';
  documentationUrl = 'https://docs.leonardo.ai/docs';
  properties: INodeProperties[] = [
    {
      displayName: 'API Key',
      name: 'apiKey',
      type: 'string',
      typeOptions: { password: true },
      default: '',
      required: true,
      description: 'Your Leonardo API key, available from your Account Settings',
    },
  ];
}
