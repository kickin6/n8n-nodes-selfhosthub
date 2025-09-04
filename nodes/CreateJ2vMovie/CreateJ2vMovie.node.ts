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
import { buildRequest } from './core/requestBuilder';
import { validateRequest, createValidationSummary, extractActionableErrors } from './core/schemaValidator';

export class CreateJ2vMovie implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Self-Host Hub (JSON2Video)',
    name: 'createJ2vMovie',
    icon: 'file:createJ2vMovie.png',
    group: [],
    version: 1,
    subtitle: '=',
    description: 'Create videos with the JSON2Video API',
    defaults: {
      name: 'Self-Host Hub (JSON2Video)',
    },
    inputs: [
      {
        type: 'main' as NodeConnectionType,
        displayName: 'Input',
      },
    ],
    outputs: [
      {
        type: 'main' as NodeConnectionType,
        displayName: 'Output',
      },
    ],
    credentials: [
      {
        name: 'json2VideoApiCredentials',
        required: true,
      },
    ],
    // AUTONOMOUS: Get all properties from presentation layer without knowing specifics
    properties: getAllNodeProperties(),
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    // If there are no items, short-circuit early (do not fetch credentials)
    if (!items || items.length === 0) {
      return [returnData];
    }

    // Fetch credentials once, wrap as tests expect on failure
    let apiKey: string;
    try {
      const credentials = await this.getCredentials('json2VideoApiCredentials');
      apiKey = credentials.apiKey as string;
    } catch (e: any) {
      const msg = extractErrorMessage(e);
      if (this.continueOnFail()) {
        return [[{ json: { error: msg }, pairedItem: { item: 0 } }]];
      }
      throw new Error(`Item 1 processing failed: ${msg}`);
    }

    // Process each item using the clean architecture pipeline
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

        // Safe to cast since we validated above
        const action = operation as CollectedParameters['action'];

        // =============================================================================
        // STEP 2: COLLECT PARAMETERS (IMPLEMENTATION AGNOSTIC)
        // =============================================================================
        let collectedParameters: CollectedParameters;
        try {
          collectedParameters = collectParameters(this, i, action);
        } catch (error) {
          const msg = extractParameterErrorMessage(error);
          if (msg) {
            throw new Error(`Failed to collect parameters for operation '${operation}': ${msg}`);
          } else {
            throw error;
          }
        }

        // Validate collected parameters (core layer enforces rules)
        const parameterErrors = validateCollectedParameters(collectedParameters);
        if (parameterErrors.length > 0) {
          throw new Error(`Parameter validation failed: ${parameterErrors.join('; ')}`);
        }

        // =============================================================================
        // STEP 3: BUILD REQUEST (WORKFLOW AGNOSTIC)
        // =============================================================================
        const buildResult = buildRequest(collectedParameters);

        // Check for build errors
        if (buildResult.errors.length > 0) {
          const errorMessage = `Request building failed: ${buildResult.errors.join('; ')}`;
          throw new Error(errorMessage);
        }

        if (!buildResult.request) {
          throw new Error('Request building failed: No request generated');
        }

        // Extra guard: avoid sending an *empty* object as a request
        if (isEmptyRequest(buildResult.request)) {
          throw new Error('Request building failed: Empty request generated');
        }

        // =============================================================================
        // STEP 4: VALIDATE REQUEST (SCHEMA DRIVEN)
        // =============================================================================
        const validationResult = validateRequest(
          buildResult.request,
          collectedParameters.action,  // Pass explicit action
          {
            level: 'complete',
            strictMode: true,
            includeWarnings: true,
            validateElements: true,
            skipActionRules: collectedParameters.isAdvancedMode  // Skip action rules for advanced mode
          }
        );

        // Handle validation failures (fail fast principle)
        if (!validationResult.canProceed) {
          const actionableErrors = extractActionableErrors(validationResult);
          const errorMessage = buildValidationErrorMessage(operation, actionableErrors);
          throw new Error(errorMessage);
        }

        // =============================================================================
        // STEP 5: PREPARE API REQUEST (GENERIC)
        // =============================================================================

        // At this point we have a fully validated JSON2Video request
        const finalRequest = validationResult.request!;

        // Build API URL with proper parameter encoding (recordId/webhook only if present)
        const apiUrl = buildApiUrl(collectedParameters);

        // Prepare HTTP request options
        const requestOptions: IRequestOptions = {
          method: 'POST' as IHttpRequestMethods,
          url: apiUrl,
          body: finalRequest,
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
          },
          json: true,
        };

        // =============================================================================
        // STEP 6: EXECUTE API REQUEST (OPERATION AGNOSTIC)
        // =============================================================================

        const responseData = await this.helpers.request(requestOptions);

        // =============================================================================
        // STEP 7: PROCESS API RESPONSE (GENERIC)
        // =============================================================================

        const processedResponse = processApiResponse(responseData);

        // Return the API response with execution metadata
        const executionData = this.helpers.constructExecutionMetaData(
          this.helpers.returnJsonArray(processedResponse),
          { itemData: { item: i } },
        );

        returnData.push(...executionData);
      } catch (error: any) {
        // =============================================================================
        // ERROR HANDLING (OPERATION AGNOSTIC)
        // =============================================================================
        const errorMessage = extractMainErrorMessage(error);
        console.error(`Error processing item ${i + 1}:`, errorMessage);

        if (this.continueOnFail()) {
          // Add error as json to output
          returnData.push({
            json: {
              error: errorMessage,
              operation: String(this.getNodeParameter('operation', i, 'unknown')),
              itemIndex: i,
              timestamp: new Date().toISOString(),
            },
            pairedItem: {
              item: i,
            },
          });
          continue;
        }

        // Re-throw error to stop execution
        throw new Error(`Item ${i + 1} processing failed: ${errorMessage}`);
      }
    }

    return [returnData];
  }
}

// =============================================================================
// ERROR MESSAGE EXTRACTION FUNCTIONS
// =============================================================================

/**
 * Extract error message from credentials errors
 */
function extractErrorMessage(error: any): string {
  if (!error) {
    return 'Unknown error occurred';
  }

  if (!error.message) {
    return 'Unknown error occurred';
  }

  const trimmedMessage = String(error.message).trim();
  if (!trimmedMessage) {
    return 'Unknown error occurred';
  }

  return error.message;
}

/**
 * Extract error message from parameter collection errors
 */
function extractParameterErrorMessage(error: any): string | null {
  if (!(error instanceof Error)) {
    return null;
  }

  if (!error.message) {
    return null;
  }

  const trimmedMessage = error.message.trim();
  if (!trimmedMessage) {
    return null;
  }

  return error.message;
}

/**
 * Extract error message from main catch block
 */
function extractMainErrorMessage(error: any): string {
  let errorMessage = '';

  if (error && error.message) {
    errorMessage = error.message;
  }

  if (!String(errorMessage).trim()) {
    return 'Unknown error occurred';
  }

  return errorMessage;
}

/**
 * Check if a request object is empty
 */
function isEmptyRequest(request: any): boolean {
  if (typeof request !== 'object') {
    return false;
  }

  if (request === null) {
    return false;
  }

  return Object.keys(request as object).length === 0;
}

/**
 * Build validation error message
 */
function buildValidationErrorMessage(operation: string, actionableErrors: any): string {
  let errorMessage = `Request validation failed for operation '${operation}'`;

  if (actionableErrors.critical.length > 0) {
    errorMessage += ` - Critical errors: ${actionableErrors.critical.join('; ')}`;
  }

  if (actionableErrors.fixable.length > 0) {
    errorMessage += ` - Fixable errors: ${actionableErrors.fixable.join('; ')}`;
  }

  return errorMessage;
}

// =============================================================================
// UTILITY FUNCTIONS (IMPLEMENTATION AGNOSTIC)
// =============================================================================

/**
 * Build API URL with proper parameter encoding
 * AUTONOMOUS: Doesn't need to know specific parameter names
 */
function buildApiUrl(parameters: CollectedParameters): string {
  let apiUrl = 'https://api.json2video.com/v2/movies';
  const urlParams = new URLSearchParams();

  // recordId is optional — include only if provided
  if (parameters.recordId) {
    urlParams.set('id', parameters.recordId);
  }
  if (parameters.webhookUrl) {
    urlParams.set('webhook', parameters.webhookUrl);
  }

  if (urlParams.toString()) {
    apiUrl += '?' + urlParams.toString();
  }

  return apiUrl;
}

/**
 * Create safe base array from response data
 */
function createBaseArray(responseData: any): IDataObject[] {
  if (Array.isArray(responseData)) {
    return responseData as IDataObject[];
  }

  if (responseData) {
    return [responseData as IDataObject];
  }

  return [{}];
}

/**
 * Process API response in a generic way
 * - Return raw response items by default
 */
function processApiResponse(responseData: any): IDataObject[] {
  return createBaseArray(responseData);
}

export {
  extractErrorMessage,
  isEmptyRequest,
  createBaseArray,
  extractParameterErrorMessage,
  extractMainErrorMessage
};