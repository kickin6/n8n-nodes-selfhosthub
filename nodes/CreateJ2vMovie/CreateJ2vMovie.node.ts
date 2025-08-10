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
import {
  createMovieAdvancedModeParameter,
  createMovieAdvancedParameters,
  createMovieJsonTemplateParameter,
  createMovieParameters
} from './operations/createMovie';
import {
  mergeVideoAudioAdvancedModeParameter,
  mergeVideoAudioAdvancedParameters,
  mergeVideoAudioJsonTemplateParameter,
  mergeVideoAudioParameters
} from './operations/mergeVideoAudio';
import {
  mergeVideosAdvancedModeParameter,
  mergeVideosAdvancedParameters,
  mergeVideosJsonTemplateParameter,
  mergeVideosParameters
} from './operations/mergeVideos';
import { buildRequestBody } from './utils/requestBuilder';

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
    // We use NodeConnectionType.Main directly because isolatedModules is disabled in tsconfig.json
    // If isolatedModules is enabled, these would need to be replaced with string literals and type assertions
    // For more details, see docs/DEVELOPMENT_GUIDELINES.md#typescript-configuration
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
    properties: [
      // Core operation selector
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        options: [
          {
            name: 'Create Movie',
            value: 'createMovie',
          },
          {
            name: 'Merge Video and Audio',
            value: 'mergeVideoAudio',
          },
          {
            name: 'Merge Videos',
            value: 'mergeVideos',
          },
        ],
        default: 'createMovie',
      },

      // Advanced Mode toggle for each operation
      createMovieAdvancedModeParameter,
      mergeVideoAudioAdvancedModeParameter,
      mergeVideosAdvancedModeParameter,

      // JSON Template for advanced mode for each operation
      createMovieJsonTemplateParameter,
      mergeVideoAudioJsonTemplateParameter,
      mergeVideosJsonTemplateParameter,

      // Import parameter definitions for each operation - validate each parameter has required fields
      ...createMovieParameters.filter(p => p && typeof p.name === 'string'),
      ...createMovieAdvancedParameters.filter(p => p && typeof p.name === 'string'),
      ...mergeVideoAudioParameters.filter(p => p && typeof p.name === 'string'),
      ...mergeVideoAudioAdvancedParameters.filter(p => p && typeof p.name === 'string'),
      ...mergeVideosParameters.filter(p => p && typeof p.name === 'string'),
      ...mergeVideosAdvancedParameters.filter(p => p && typeof p.name === 'string'),
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];
    const credentials = await this.getCredentials('json2VideoApiCredentials');
    const apiKey = credentials.apiKey as string;

    // Process each item
    for (let i = 0; i < items.length; i++) {
      try {
        // Get operation type
        const operation = String(this.getNodeParameter('operation', i, ''));

        // Check for advanced mode based on operation
        let isAdvancedMode = false;
        if (operation === 'createMovie') {
          isAdvancedMode = this.getNodeParameter('advancedMode', i, true) as boolean;
        } else if (operation === 'mergeVideoAudio') {
          isAdvancedMode = this.getNodeParameter('advancedModeMergeAudio', i, true) as boolean;
        } else if (operation === 'mergeVideos') {
          isAdvancedMode = this.getNodeParameter('advancedModeMergeVideos', i, true) as boolean;
        }

        // Log parameters for debugging
        try {
          const movieElements = this.getNodeParameter('movieElements.elementValues', i, []);
          console.log('DEBUG - movieElements:', JSON.stringify(movieElements));
          const elements = this.getNodeParameter('elements.elementValues', i, []);
          console.log('DEBUG - elements:', JSON.stringify(elements));
        } catch (error) {
          console.log('DEBUG - Error getting elements:', error);
        }

        // Build request body using the centralized utility
        const requestBody = buildRequestBody.call(this, operation, i, isAdvancedMode);

        // Debug the request body right after it's built
        console.log('DEBUG - Request Body after buildRequestBody:', JSON.stringify(requestBody, null, 2));

        // Get recordId and webhookUrl for the API URL parameters
        const recordId = String(this.getNodeParameter('recordId', i, ''));
        const webhookUrl = String(this.getNodeParameter('webhookUrl', i, ''));

        // Common API call setup
        const options: IRequestOptions = {
          method: 'POST' as IHttpRequestMethods,
          url: '',
          body: requestBody,
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
          },
          json: true,
        };

        // Set the appropriate API endpoint based on operation
        switch (operation) {
          case 'createMovie':
          case 'mergeVideoAudio':
          case 'mergeVideos':
            options.url = `https://api.json2video.com/v2/movies?id=${recordId}&webhook=${encodeURIComponent(webhookUrl)}`;
            break;
          case 'checkStatus':
            const jobId = this.getNodeParameter('jobId', i) as string;
            options.url = `https://api.json2video.com/v2/movies/${jobId}`;
            options.method = 'GET';
            break;
        }

        // Log the request body for debugging
        console.log('DEBUG - Request Body:', JSON.stringify(options.body, null, 2));

        // Make the API request
        const responseData = await this.helpers.request(options);

        // Debug the response data
        console.log('DEBUG - API Response:', JSON.stringify(responseData, null, 2));
        console.log('DEBUG - Response type:', typeof responseData);
        console.log('DEBUG - Is array:', Array.isArray(responseData));

        // Handle the API response properly - JSON2Video returns an object, not an array
        let processedResponse: IDataObject[];
        if (Array.isArray(responseData)) {
          processedResponse = responseData as IDataObject[];
        } else {
          // Single object response - wrap in array
          processedResponse = [responseData as IDataObject];
        }

        // Return the API response
        const executionData = this.helpers.constructExecutionMetaData(
          this.helpers.returnJsonArray(processedResponse),
          { itemData: { item: i } },
        );

        returnData.push(...executionData);
      } catch (error: any) {
        if (this.continueOnFail()) {
          // Add error as json to output
          returnData.push({
            json: {
              error: error.message || 'Unknown error occurred',
            },
            pairedItem: {
              item: i,
            },
          });
          continue;
        }
        throw error;
      }
    }

    return [returnData];
  }
}