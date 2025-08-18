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
} from './operations/createMovieOperation';
import {
	mergeVideoAudioAdvancedModeParameter,
	mergeVideoAudioAdvancedParameters,
	mergeVideoAudioJsonTemplateParameter,
	mergeVideoAudioParameters
} from './operations/mergeVideoAudioOperation';
import {
	mergeVideosAdvancedModeParameter,
	mergeVideosAdvancedParameters,
	mergeVideosJsonTemplateParameter,
	mergeVideosParameters
} from './operations/mergeVideosOperation';
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
			{
				displayName: 'Include Input Parameters in Output',
				name: 'includeInputParams',
				type: 'boolean',
				default: true,
				description: 'Whether to include the input parameters in the output under "_inputParams" key',
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
			...createMovieParameters.filter((p: any) => p && typeof p.name === 'string'),
			...createMovieAdvancedParameters.filter((p: any) => p && typeof p.name === 'string'),
			...mergeVideoAudioParameters.filter((p: any) => p && typeof p.name === 'string'),
			...mergeVideoAudioAdvancedParameters.filter((p: any) => p && typeof p.name === 'string'),
			...mergeVideosParameters.filter((p: any) => p && typeof p.name === 'string'),
			...mergeVideosAdvancedParameters.filter((p: any) => p && typeof p.name === 'string'),
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
				// Check if we should include input parameters
				const includeInputParams = this.getNodeParameter('includeInputParams', i, true) as boolean;

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

				// Build request body using the centralized utility
				const requestBody = buildRequestBody.call(this, operation, i, isAdvancedMode);

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

				// Make the API request
				const responseData = await this.helpers.request(options);

				// Handle the API response properly
				let processedResponse: IDataObject[];
				if (Array.isArray(responseData)) {
					processedResponse = responseData as IDataObject[];
				} else {
					processedResponse = [responseData as IDataObject];
				}

				// Add input parameters if requested
				if (includeInputParams) {
					// Get all set parameters from the node instance
					const nodeParameters = this.getNode().parameters;
					const inputParams: IDataObject = {};

					// Helper function to check if a value is "empty"
					const isEmpty = (value: any): boolean => {
						if (value === undefined || value === null || value === '') return true;
						if (Array.isArray(value) && value.length === 0) return true;
						if (typeof value === 'object' && Object.keys(value).length === 0) return true;
						return false;
					};

					// Dynamically collect all resolved input parameters
					for (const [paramName, paramValue] of Object.entries(nodeParameters)) {
						if (paramName !== 'includeInputParams' && !isEmpty(paramValue)) {
							try {
								// Get the resolved value (handles expressions)
								const resolvedValue = this.getNodeParameter(paramName, i);
								if (!isEmpty(resolvedValue)) {
									inputParams[`input_${paramName}`] = resolvedValue;
								}
							} catch (error) {
								// Parameter couldn't be resolved, skip it
							}
						}
					}

					processedResponse = processedResponse.map(response => ({
						...response,
						...inputParams,
					}));
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