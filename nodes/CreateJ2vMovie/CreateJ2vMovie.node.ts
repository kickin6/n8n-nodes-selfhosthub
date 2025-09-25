// nodes/CreateJ2vMovie/CreateJ2vMovie.node.ts

import {
  IDataObject,
  IExecuteFunctions,
  IHttpRequestMethods,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  IRequestOptions,
  NodeConnectionType,
} from 'n8n-workflow';

import { getAllNodeProperties } from './presentation/properties';
import { collectParameters, validateCollectedParameters, CollectedParameters } from './core/collector';
import { buildRequest, RequestBuildResult } from './core/buildRequest';
import { validateBuildResult, RequestValidationResult } from './core/validator';

/**
 * n8n node for creating videos using the JSON2Video API
 */
export class CreateJ2vMovie implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Self-Host Hub (JSON2Video)',
    name: 'createJ2vMovie',
    icon: 'file:createJ2vMovie.png',
    group: ['transform'],
    version: 2,
    subtitle: '={{$parameter["advancedMode"] ? "Advanced Mode" : "Create Movie"}}',
    description: 'Create videos with the JSON2Video API',
    defaults: {
      name: 'Create JSON2Video Movie',
    },
    inputs: [
      {
        displayName: '',
        type: NodeConnectionType.Main,
      },
    ],
    outputs: [
      {
        displayName: '',
        type: NodeConnectionType.Main,
      },
    ],
    credentials: [
      {
        name: 'json2VideoApiCredentials',
        required: true,
      },
    ],
    requestDefaults: {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    },
    properties: getAllNodeProperties(),
  };

  /**
   * Execute the node for each input item
   */
  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();

    if (items.length === 0) {
      return [[]];
    }

    const returnData: INodeExecutionData[] = [];

    for (let i = 0; i < items.length; i++) {
      try {
        // Collect and validate parameters
        const collectedParameters = collectParameters.call(this, i);
        const parameterValidation = validateCollectedParameters(collectedParameters);

        // Build API request
        const buildResult = buildRequest(collectedParameters);

        // Validate complete request
        const validationResult: RequestValidationResult = validateBuildResult(
          buildResult,
          {
            level: 'complete',
            strictMode: true,
            includeWarnings: true,
            validateElements: true,
          }
        );

        if (!validationResult.isValid) {
          throw new Error(validationResult.errors.join('; '));
        }

        // Prepare API request
        const credentials = await this.getCredentials('json2VideoApiCredentials');
        if (!credentials || !credentials.apiKey) {
          throw new Error('JSON2Video API credentials are required');
        }

        const baseUrl = 'https://api.json2video.com/v2/movies';
        let apiUrl = baseUrl;

        const urlParams = new URLSearchParams();

        // Add optional query parameters
        const webhookUrl = this.getNodeParameter('webhookUrl', i, '') as string;
        if (webhookUrl) {
          urlParams.append('webhook', webhookUrl);
        }

        const recordId = this.getNodeParameter('recordId', i, '') as string;
        if (recordId) {
          urlParams.append('id', recordId);
        }

        if (urlParams.toString()) {
          apiUrl += '?' + urlParams.toString();
        }

        const requestOptions: IRequestOptions = {
          method: 'POST' as IHttpRequestMethods,
          url: apiUrl,
          headers: {
            'x-api-key': credentials.apiKey as string,
            'Content-Type': 'application/json',
          },
          body: buildResult.request,
          json: true,
        };

        const response = await this.helpers.request(requestOptions);

        // Process response
        const responseData = processApiResponse(response.body);

        // Add execution metadata to response
        for (const responseItem of responseData) {
          returnData.push({
            json: {
              ...responseItem,
              itemIndex: i,
              timestamp: new Date().toISOString(),
            },
            pairedItem: { item: i },
          });
        }

      } catch (error) {
        const errorMessage = extractMainErrorMessage(extractErrorMessage(error));

        if (this.continueOnFail()) {
          returnData.push({
            json: {
              error: errorMessage,
              itemIndex: i,
              timestamp: new Date().toISOString(),
            },
            pairedItem: { item: i },
          });
        } else {
          throw new Error(`Item ${i + 1} processing failed: ${errorMessage}`);
        }
      }
    }

    return [returnData];
  }
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Extract error message from various error types
 */
export function extractErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message || 'Unknown error occurred';
  }
  return 'Unknown error occurred';
}

/**
 * Extract parameter-specific error messages
 */
export function extractParameterErrorMessage(error: unknown): string {
  const message = extractErrorMessage(error);
  const parameterErrorPrefix = 'Parameter validation failed: ';
  if (message.startsWith(parameterErrorPrefix)) {
    return message.substring(parameterErrorPrefix.length);
  }
  return message;
}

/**
 * Extract main error by removing common error prefixes
 */
export function extractMainErrorMessage(message: string): string {
  const errorPrefixes = [
    'Request building failed: ',
    'Request validation failed: ',
    'Failed to collect parameters for operation \'',
    'Processing failed: ',
    'API error: ',
    'Network error: ',
    'Authentication failed: ',
    'Invalid operation: ',
    'Build failed: ',
    'Validation failed: ',
    'Parameter validation failed: ',
  ];

  for (const prefix of errorPrefixes) {
    if (message.startsWith(prefix)) {
      let cleaned = message.substring(prefix.length);
      // Handle operation-specific error format
      if (prefix.includes('operation') && cleaned.includes('\': ')) {
        cleaned = cleaned.split('\': ')[1];
      }
      return cleaned;
    }
  }

  return message;
}

/**
 * Check if request contains meaningful content
 */
export function isEmptyRequest(request: any): boolean {
  if (!request || Object.keys(request).length === 0) {
    return true;
  }

  if (request.elements && request.elements.length > 0) {
    return false;
  }

  if (request.scenes && Array.isArray(request.scenes)) {
    if (request.scenes.length === 0) {
      return true;
    }

    const hasContent = request.scenes.some((scene: any) =>
      scene && scene.elements && Array.isArray(scene.elements) && scene.elements.length > 0
    );

    if (!hasContent) {
      return true;
    }
  }

  return false;
}

/**
 * Create base return array structure
 */
export function createBaseArray(): INodeExecutionData[][] {
  return [[]];
}

/**
 * Process API response into standardized format
 */
function processApiResponse(responseData: any): IDataObject[] {
  if (Array.isArray(responseData)) {
    return responseData as IDataObject[];
  }

  if (responseData) {
    return [responseData as IDataObject];
  }

  return [{}];
}