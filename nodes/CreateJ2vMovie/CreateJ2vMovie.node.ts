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

// PRESENTATION LAYER: Import parameter definitions (this is the only coupling needed)
import { getAllNodeProperties, isValidOperation } from './presentation/nodeProperties';

// CORE LAYER: Import business logic functions (implementation agnostic)
import { collectParameters, validateCollectedParameters, CollectedParameters } from './core/parameterCollector';
import { buildRequest, RequestBuildResult } from './core/requestBuilder';
import { validateBuildResult, RequestValidationResult } from './core/schemaValidator';

export class CreateJ2vMovie implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Create J2V Movie',
    name: 'createJ2vMovie',
    icon: 'file:createJ2vMovie.png',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"]}}',
    description: 'Create videos with the JSON2Video API',
    defaults: {
      name: 'Create J2V Movie',
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

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();

    if (items.length === 0) {
      return [[]];
    }

    const returnData: INodeExecutionData[] = [];

    // Process each input item through the unified architecture pipeline
    for (let i = 0; i < items.length; i++) {
      try {
        // =============================================================================
        // STEP 1: DETERMINE WORKFLOW (AUTONOMOUS - NO HARD-CODED OPERATIONS)
        // =============================================================================
        const operation = String(this.getNodeParameter('operation', i, ''));

        if (!operation) {
          throw new Error('Operation is required');
        }

        // AUTONOMOUS: Validate operation using presentation layer function
        if (!isValidOperation(operation)) {
          throw new Error(`Invalid operation: ${operation}`);
        }

        // =============================================================================
        // STEP 2: COLLECT PARAMETERS (IMPLEMENTATION AGNOSTIC)
        // =============================================================================
        const collectedParameters = collectParameters.call(this, i);

        // Validate collected parameters (core layer enforces rules)
        const parameterValidation = validateCollectedParameters(collectedParameters);

        // =============================================================================
        // STEP 3: BUILD REQUEST (WORKFLOW AGNOSTIC)
        // =============================================================================
        const buildResult = buildRequest(collectedParameters);

        // =============================================================================
        // STEP 4: VALIDATE REQUEST (EXPLICIT ACTION VALIDATION)
        // =============================================================================
        const validationResult: RequestValidationResult = validateBuildResult(
          buildResult,
          collectedParameters.action,
          {
            level: 'complete',
            strictMode: true,
            includeWarnings: true,
            validateElements: true,
            skipActionRules: collectedParameters.isAdvancedMode
          }
        );

        // =============================================================================
        // STEP 5: EXECUTE API REQUEST (GENERIC)
        // =============================================================================
        const credentials = await this.getCredentials('json2VideoApiCredentials');
        if (!credentials || !credentials.apiKey) {
          throw new Error('JSON2Video API credentials are required');
        }

        // Build API URL with optional query parameters
        const baseUrl = 'https://api.json2video.com/v2/movies';
        let apiUrl = baseUrl;

        const urlParams = new URLSearchParams();

        // Add webhook URL if provided
        const webhookUrl = this.getNodeParameter('webhookUrl', i, '') as string;
        if (webhookUrl) {
          urlParams.append('webhook', webhookUrl);
        }

        // Add record ID if provided
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

        // =============================================================================
        // STEP 6: PROCESS RESPONSE (WORKFLOW AGNOSTIC)
        // =============================================================================
        const responseData = processApiResponse(response.body);

        // Add to return data with execution metadata
        for (const responseItem of responseData) {
          returnData.push({
            json: {
              ...responseItem,
              operation: collectedParameters.action,
              itemIndex: i,
              timestamp: new Date().toISOString(),
            },
            pairedItem: { item: i },
          });
        }

      } catch (error) {
        const errorMessage = extractMainErrorMessage(extractErrorMessage(error));

        if (this.continueOnFail()) {
          // Add error to results but continue processing
          returnData.push({
            json: {
              error: errorMessage,
              operation: this.getNodeParameter('operation', i, 'unknown') as string,
              itemIndex: i,
              timestamp: new Date().toISOString(),
            },
            pairedItem: { item: i },
          });
        } else {
          // Re-throw error to stop execution
          throw new Error(`Item ${i + 1} processing failed: ${errorMessage}`);
        }
      }
    }

    return [returnData];
  }
}

// =============================================================================
// UTILITY FUNCTIONS (EXTRACTED FOR TESTABILITY)
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
 * Extract main error from prefixed error messages
 */
export function extractMainErrorMessage(message: string): string {
  // List of error prefixes to strip
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
      // Handle cases like "Failed to collect parameters for operation 'createMovie': actual error"
      if (prefix.includes('operation') && cleaned.includes('\': ')) {
        cleaned = cleaned.split('\': ')[1];
      }
      return cleaned;
    }
  }

  return message;
}

/**
 * Check if request is effectively empty
 */
export function isEmptyRequest(request: any): boolean {
  if (!request || Object.keys(request).length === 0) {
    return true;
  }

  if (request.scenes && Array.isArray(request.scenes)) {
    if (request.scenes.length === 0) {
      return true;
    }

    // Check if all scenes are empty
    const hasContent = request.scenes.some((scene: any) =>
      scene.elements && Array.isArray(scene.elements) && scene.elements.length > 0
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
 * Process API response in a generic way
 * - Return raw response items by default
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