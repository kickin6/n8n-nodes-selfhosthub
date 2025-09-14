// nodes/CreateJ2vMovie/core/parameterCollector.ts

import { IExecuteFunctions } from 'n8n-workflow';
import { ExportConfig } from '../schema/json2videoSchema';
import { getAdvancedModeParameterName, getJsonTemplateParameterName } from '../presentation/nodeProperties';

// =============================================================================
// INTERFACES
// =============================================================================

export interface CollectedParameters {
  operation: string;
  isAdvancedMode: boolean;

  // Basic mode parameters
  width?: number;
  height?: number;
  quality?: string;
  cache?: boolean;
  draft?: boolean;
  resolution?: string;

  // Unified element collections
  movieElements: any[];
  sceneElements: any[];

  // Operation-specific settings
  operationSettings?: OperationSettings;

  // Advanced mode parameters
  jsonTemplate?: string;
  advancedOverrides?: Record<string, any>;

  // Common properties
  recordId?: string;
  exportConfigs?: ExportConfig[];
  sceneDuration?: number;
}

export interface OperationSettings {
  outputSettings?: {
    width?: number;
    height?: number;
    format?: string;
    quality?: string;
    frameRate?: number;
    cache?: boolean;
    draft?: boolean;
    resolution?: string;
  };
  transition?: string;
  transitionDuration?: number;
}

export interface ParameterValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// =============================================================================
// MAIN COLLECTION FUNCTIONS
// =============================================================================

export function collectParameters(
  this: IExecuteFunctions,
  itemIndex: number = 0
): CollectedParameters {

  // CLEAN: Only read 'operation' parameter - no fallback logic needed
  const operation = this.getNodeParameter('operation', itemIndex, 'createMovie') as string;
  
  // Get the correct advanced mode parameter name for this operation
  const advancedModeParamName = getAdvancedModeParameterName(operation);
  const isAdvancedMode = this.getNodeParameter(advancedModeParamName, itemIndex, false) as boolean;

  const parameters: CollectedParameters = {
    operation,
    isAdvancedMode,
    movieElements: [],
    sceneElements: []
  };

  if (isAdvancedMode) {
    collectAdvancedModeParameters.call(this, parameters, itemIndex);
  } else {
    collectElementCollections.call(this, parameters, itemIndex);
    collectOperationSettings.call(this, parameters, itemIndex);
  }

  collectCommonProperties.call(this, parameters, itemIndex);

  return parameters;
}

// =============================================================================
// COLLECTION FUNCTIONS
// =============================================================================

function collectElementCollections(
  this: IExecuteFunctions,
  parameters: CollectedParameters,
  itemIndex: number
): void {

  switch (parameters.operation) {
    case 'createMovie':
      collectCreateMovieElementCollections.call(this, parameters, itemIndex);
      break;
    case 'mergeVideoAudio':
      collectMergeVideoAudioElementCollections.call(this, parameters, itemIndex);
      break;
    case 'mergeVideos':
      collectMergeVideosElementCollections.call(this, parameters, itemIndex);
      break;
  }
}

function collectOperationSettings(
  this: IExecuteFunctions,
  parameters: CollectedParameters,
  itemIndex: number
): void {

  const operationSettings: OperationSettings = {};

  switch (parameters.operation) {
    case 'createMovie':
      const outputSettings = this.getNodeParameter('outputSettings', itemIndex, {}) as any;
      if (outputSettings && outputSettings.outputDetails) {
        operationSettings.outputSettings = outputSettings.outputDetails;

        if (outputSettings.outputDetails.resolution && operationSettings.outputSettings) {
          const dimensions = mapResolutionToDimensions(outputSettings.outputDetails.resolution);
          if (dimensions && operationSettings.outputSettings) {
            operationSettings.outputSettings.width = dimensions.width;
            operationSettings.outputSettings.height = dimensions.height;
          }
        }
      }
      break;

    case 'mergeVideoAudio':
      const mergeAudioOutput = this.getNodeParameter('outputSettings', itemIndex, {}) as any;
      if (mergeAudioOutput && mergeAudioOutput.outputDetails) {
        operationSettings.outputSettings = mergeAudioOutput.outputDetails;
      }
      break;

    case 'mergeVideos':
      const transition = this.getNodeParameter('transition', itemIndex, 'none') as string;
      const transitionDuration = this.getNodeParameter('transitionDuration', itemIndex, 1) as number;
      const mergeVideosOutput = this.getNodeParameter('outputSettings', itemIndex, {}) as any;

      operationSettings.transition = transition;
      operationSettings.transitionDuration = transitionDuration;

      if (mergeVideosOutput && mergeVideosOutput.outputDetails) {
        operationSettings.outputSettings = mergeVideosOutput.outputDetails;
      }
      break;
  }

  parameters.operationSettings = operationSettings;
}

function collectAdvancedModeParameters(
  this: IExecuteFunctions,
  parameters: CollectedParameters,
  itemIndex: number
): void {

  // Get the correct JSON template parameter name for this operation
  const templateParamName = getJsonTemplateParameterName(parameters.operation);
  
  try {
    parameters.jsonTemplate = this.getNodeParameter(templateParamName, itemIndex) as string;
  } catch {
    // Parameter doesn't exist, leave undefined
  }

  const overrideParams = ['width', 'height', 'quality', 'cache', 'resolution', 'recordId'];
  const overrides: Record<string, any> = {};
  
  overrideParams.forEach(paramName => {
    try {
      const value = this.getNodeParameter(paramName, itemIndex, null);
      if (value !== null && value !== undefined && value !== '') {
        overrides[paramName] = value;
      }
    } catch {
      // Parameter doesn't exist, skip
    }
  });

  if (Object.keys(overrides).length > 0) {
    parameters.advancedOverrides = overrides;
  }
}

function collectCommonProperties(
  this: IExecuteFunctions,
  parameters: CollectedParameters,
  itemIndex: number
): void {

  try {
    parameters.recordId = this.getNodeParameter('recordId', itemIndex, '') as string;
  } catch {
    // recordId not available for this operation type
  }

  try {
    collectExportConfigs.call(this, parameters, itemIndex);
  } catch {
    parameters.exportConfigs = [];
  }

  try {
    parameters.cache = this.getNodeParameter('cache', itemIndex, true) as boolean;
  } catch {
    // cache not available for this operation type
  }

  try {
    parameters.draft = this.getNodeParameter('draft', itemIndex, false) as boolean;
  } catch {
    // draft not available for this operation type
  }

  try {
    parameters.sceneDuration = this.getNodeParameter('sceneDuration', itemIndex, -1) as number;
  } catch {
    // sceneDuration not available for this operation type
  }
}

function collectExportConfigs(
  this: IExecuteFunctions,
  parameters: CollectedParameters,
  itemIndex: number
): void {

  const exportSettings = this.getNodeParameter('exportSettings', itemIndex, {}) as any;

  if (exportSettings && exportSettings.exportValues) {
    const exports = Array.isArray(exportSettings.exportValues)
      ? exportSettings.exportValues
      : [exportSettings.exportValues];

    parameters.exportConfigs = exports
      .map((rawExport: any) => processExportConfig(rawExport))
      .filter((config: any) => config !== null);
  } else {
    parameters.exportConfigs = [];
  }
}

// =============================================================================
// OPERATION-SPECIFIC COLLECTION FUNCTIONS
// =============================================================================

function collectCreateMovieElementCollections(
  this: IExecuteFunctions,
  parameters: CollectedParameters,
  itemIndex: number
): void {

  const movieElementsCollection = this.getNodeParameter('movieElements', itemIndex, {}) as any;
  if (movieElementsCollection && movieElementsCollection.elementValues) {
    parameters.movieElements = Array.isArray(movieElementsCollection.elementValues)
      ? movieElementsCollection.elementValues
      : [movieElementsCollection.elementValues];
  } else {
    parameters.movieElements = [];
  }

  const sceneElementsCollection = this.getNodeParameter('sceneElements', itemIndex, {}) as any;
  if (sceneElementsCollection && sceneElementsCollection.elementValues) {
    parameters.sceneElements = Array.isArray(sceneElementsCollection.elementValues)
      ? sceneElementsCollection.elementValues
      : [sceneElementsCollection.elementValues];
  } else {
    parameters.sceneElements = [];
  }
}

function collectMergeVideoAudioElementCollections(
  this: IExecuteFunctions,
  parameters: CollectedParameters,
  itemIndex: number
): void {

  const sceneElements: any[] = [];

  try {
    const videoElement = this.getNodeParameter('videoElement', itemIndex, {}) as any;
    if (videoElement && videoElement.videoDetails) {
      sceneElements.push({
        type: 'video',
        ...videoElement.videoDetails
      });
    }
  } catch {
    // No video element
  }

  try {
    const audioElement = this.getNodeParameter('audioElement', itemIndex, {}) as any;
    if (audioElement && audioElement.audioDetails) {
      sceneElements.push({
        type: 'audio',
        ...audioElement.audioDetails
      });
    }
  } catch {
    // No audio element
  }

  parameters.sceneElements = sceneElements;
  parameters.movieElements = [];
}

function collectMergeVideosElementCollections(
  this: IExecuteFunctions,
  parameters: CollectedParameters,
  itemIndex: number
): void {

  const videoElementsCollection = this.getNodeParameter('videoElements', itemIndex, {}) as any;
  
  if (videoElementsCollection && videoElementsCollection.elementValues) {
    const videoElements = Array.isArray(videoElementsCollection.elementValues)
      ? videoElementsCollection.elementValues
      : [videoElementsCollection.elementValues];

    parameters.sceneElements = videoElements.map((video: any) => ({
      type: 'video',
      ...video
    }));
  } else {
    parameters.sceneElements = [];
  }

  parameters.movieElements = [];
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function mapResolutionToDimensions(resolution: string): { width: number; height: number } | null {
  const resolutionMap: Record<string, { width: number; height: number }> = {
    'hd': { width: 1280, height: 720 },
    'fhd': { width: 1920, height: 1080 },
    '4k': { width: 3840, height: 2160 },
    'square': { width: 1080, height: 1080 },
    'portrait': { width: 1080, height: 1920 },
  };
  
  return resolutionMap[resolution] || null;
}

function processExportConfig(rawExport: any): ExportConfig | null {
  if (!rawExport || !rawExport.exportType) return null;

  const config: ExportConfig = {};

  switch (rawExport.exportType) {
    case 'webhook':
      if (!rawExport.webhookUrl) return null;

      config.webhook = {
        url: rawExport.webhookUrl
      };
      break;

    case 'ftp':
      if (!rawExport.ftpHost) return null;

      config.ftp = {
        host: rawExport.ftpHost,
        port: rawExport.ftpPort || 21,
        username: rawExport.ftpUsername || '',
        password: rawExport.ftpPassword || '',
        path: rawExport.ftpPath || '/',
        secure: rawExport.ftpSecure || false
      };
      break;

    case 'email':
      if (!rawExport.emailTo) return null;

      config.email = {
        to: rawExport.emailTo,
        from: rawExport.emailFrom,
        subject: rawExport.emailSubject,
        message: rawExport.emailMessage
      };
      break;

    default:
      return null;
  }

  return config;
}

// =============================================================================
// VALIDATION FUNCTIONS
// =============================================================================

export function validateCollectedParameters(parameters: CollectedParameters): ParameterValidationResult {
  const result: ParameterValidationResult = {
    isValid: true,
    errors: [],
    warnings: []
  };

  if (!parameters.operation) {
    result.errors.push('Missing operation parameter');
  } else if (!['createMovie', 'mergeVideoAudio', 'mergeVideos'].includes(parameters.operation)) {
    result.errors.push(`Invalid operation: ${parameters.operation}`);
  }

  if (parameters.isAdvancedMode) {
    if (!parameters.jsonTemplate || parameters.jsonTemplate.trim() === '') {
      result.errors.push('JSON template is required in advanced mode');
    } else {
      try {
        JSON.parse(parameters.jsonTemplate);
      } catch {
        result.errors.push('Invalid JSON template syntax');
      }
    }
  } else {
    validateBasicModeParameters(parameters, result);
  }

  if (parameters.exportConfigs) {
    parameters.exportConfigs.forEach((config: any, index: number) => {
      const exportErrors = validateExportConfig(config);
      exportErrors.forEach((error: string) => {
        result.errors.push(`Export config ${index + 1}: ${error}`);
      });
    });
  }

  result.isValid = result.errors.length === 0;
  return result;
}

function validateBasicModeParameters(
  parameters: CollectedParameters, 
  result: ParameterValidationResult
): void {

  const elementValidation = validateElementCollections(parameters);
  result.errors.push(...elementValidation.errors);
  result.warnings.push(...elementValidation.warnings);

  if (!parameters.operationSettings) {
    result.warnings.push('No operation settings found');
  } else {
    const { outputSettings, transitionDuration } = parameters.operationSettings;

    if (outputSettings) {
      if (outputSettings.width !== undefined && (outputSettings.width < 1 || outputSettings.width > 4096)) {
        result.errors.push('Output width must be between 1 and 4096 pixels');
      }
      if (outputSettings.height !== undefined && (outputSettings.height < 1 || outputSettings.height > 4096)) {
        result.errors.push('Output height must be between 1 and 4096 pixels');
      }
    }

    if (transitionDuration !== undefined && (transitionDuration < 0 || transitionDuration > 10)) {
      result.errors.push('Transition duration must be between 0 and 10 seconds');
    }
  }
}

function validateElementCollections(parameters: CollectedParameters): { errors: string[], warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  switch (parameters.operation) {
    case 'createMovie':
      if (parameters.movieElements.length === 0 && parameters.sceneElements.length === 0) {
        errors.push('createMovie operation requires either movie elements or scene elements');
      }
      break;

    case 'mergeVideoAudio':
      if (parameters.sceneElements.length === 0) {
        errors.push('mergeVideoAudio operation requires at least a video or audio element');
      }
      break;

    case 'mergeVideos':
      if (parameters.sceneElements.length === 0) {
        warnings.push('mergeVideos operation requires at least one video element');
      }
      break;
  }

  return { errors, warnings };
}

function validateExportConfig(config: any): string[] {
  const errors: string[] = [];

  if (!config || typeof config !== 'object') {
    errors.push('Invalid export configuration format');
    return errors;
  }

  if (config.webhook) {
    if (!config.webhook.url) {
      errors.push('Webhook URL is required');
    } else if (!config.webhook.url.startsWith('https://')) {
      errors.push('Webhook URL must use HTTPS');
    }
  }

  if (config.ftp) {
    if (!config.ftp.host) {
      errors.push('FTP host is required');
    }
    if (!config.ftp.username) {
      errors.push('FTP username is required');
    }
    if (!config.ftp.password) {
      errors.push('FTP password is required');
    }
    // FTP port validation
    if (config.ftp.port !== undefined && (config.ftp.port < 1 || config.ftp.port > 65535)) {
      errors.push('FTP port must be between 1 and 65535');
    }
  }

  if (config.email) {
    if (!config.email.to) {
      errors.push('Email recipient is required');
    } else {
      const recipients = Array.isArray(config.email.to) ? config.email.to : [config.email.to];
      recipients.forEach((email: string, index: number) => {
        if (!isValidEmail(email)) {
          errors.push(`Invalid email address at position ${index + 1}: ${email}`);
        }
      });

      if (config.email.from && !isValidEmail(config.email.from)) {
        errors.push(`Invalid from email address: ${config.email.from}`);
      }
    }
  }

  return errors;
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}