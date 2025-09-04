// nodes/CreateJ2vMovie/presentation/nodeProperties.ts

import { INodeProperties } from 'n8n-workflow';
import {
  createMovieAdvancedModeParameter,
  createMovieAdvancedParameters,
  createMovieJsonTemplateParameter,
  createMovieParameters
} from './createMovieParameters';
import {
  mergeVideoAudioAdvancedModeParameter,
  mergeVideoAudioAdvancedParameters,
  mergeVideoAudioJsonTemplateParameter,
  mergeVideoAudioParameters
} from './mergeVideoAudioParameters';
import {
  mergeVideosAdvancedModeParameter,
  mergeVideosAdvancedParameters,
  mergeVideosJsonTemplateParameter,
  mergeVideosParameters
} from './mergeVideosParameters';

// =============================================================================
// AUTONOMOUS NODE PROPERTIES AGGREGATION
// =============================================================================

/**
 * Get all node properties for the CreateJ2vMovie node
 * This function consolidates all presentation parameters into a single array
 * The main node file uses this to remain autonomous from implementation details
 */
export function getAllNodeProperties(): INodeProperties[] {
  return [
    // =============================================================================
    // CORE OPERATION SELECTOR (DRIVES ALL OTHER PARAMETERS)
    // =============================================================================
    {
      displayName: 'Operation',
      name: 'operation',
      type: 'options',
      noDataExpression: true,
      options: getAvailableOperations(),
      default: 'createMovie',
      description: 'Choose the video creation operation to perform',
    },

    // =============================================================================
    // ADVANCED MODE TOGGLES (ONE PER OPERATION)
    // =============================================================================
    createMovieAdvancedModeParameter,
    mergeVideoAudioAdvancedModeParameter,
    mergeVideosAdvancedModeParameter,

    // =============================================================================
    // JSON TEMPLATES (ADVANCED MODE)
    // =============================================================================
    createMovieJsonTemplateParameter,
    mergeVideoAudioJsonTemplateParameter,
    mergeVideosJsonTemplateParameter,

    // =============================================================================
    // OPERATION-SPECIFIC PARAMETERS
    // =============================================================================
    
    // Create Movie Operation Parameters
    ...validateAndFilterParameters(createMovieParameters, 'createMovie'),
    ...validateAndFilterParameters(createMovieAdvancedParameters, 'createMovie-advanced'),
    
    // Merge Video & Audio Operation Parameters  
    ...validateAndFilterParameters(mergeVideoAudioParameters, 'mergeVideoAudio'),
    ...validateAndFilterParameters(mergeVideoAudioAdvancedParameters, 'mergeVideoAudio-advanced'),
    
    // Merge Videos Operation Parameters
    ...validateAndFilterParameters(mergeVideosParameters, 'mergeVideos'),
    ...validateAndFilterParameters(mergeVideosAdvancedParameters, 'mergeVideos-advanced'),
  ];
}

// =============================================================================
// DYNAMIC OPERATION DISCOVERY
// =============================================================================

/**
 * Get available operations dynamically
 * This allows adding new operations without modifying the main node file
 */
function getAvailableOperations(): Array<{ name: string; value: string }> {
  return [
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
  ];
}

/**
 * Get operation names programmatically for validation
 * Used by core layer to validate operations without hard-coding
 */
export function getValidOperationNames(): string[] {
  return getAvailableOperations().map(op => op.value);
}

/**
 * Check if an operation is valid
 * AUTONOMOUS: Core layer can validate operations without knowing specifics
 */
export function isValidOperation(operation: string): boolean {
  return getValidOperationNames().includes(operation);
}

// =============================================================================
// PARAMETER VALIDATION AND FILTERING
// =============================================================================

/**
 * Validate and filter parameters to ensure they're properly formed
 * This prevents runtime errors from malformed parameter definitions
 */
function validateAndFilterParameters(
  parameters: INodeProperties[], 
  source: string
): INodeProperties[] {
  return parameters.filter((param, index) => {
    // Basic validation - ensure parameter has required properties
    if (!param || typeof param !== 'object') {
      return false;
    }

    if (typeof param.name !== 'string' || param.name.trim() === '') {
      return false;
    }

    if (typeof param.type !== 'string' || param.type.trim() === '') {
      return false;
    }

    // Additional validation for specific parameter types
    if (param.type === 'options' && (!param.options || !Array.isArray(param.options))) {
      return false;
    }

    if (param.type === 'fixedCollection' && (!param.options || !Array.isArray(param.options))) {
      return false;
    }

    return true;
  });
}

// =============================================================================
// OPERATION METADATA (FOR AUTONOMOUS OPERATION)
// =============================================================================

/**
 * Get metadata about an operation without knowing implementation details
 */
export function getOperationMetadata(operation: string): {
  isValid: boolean;
  hasAdvancedMode: boolean;
  advancedModeParamName?: string;
  jsonTemplateParamName?: string;
} {
  const validOps = getValidOperationNames();
  
  if (!validOps.includes(operation)) {
    return { isValid: false, hasAdvancedMode: false };
  }

  // Define advanced mode parameter mappings
  const advancedModeParams: Record<string, string> = {
    'createMovie': 'advancedMode',
    'mergeVideoAudio': 'advancedModeMergeAudio',
    'mergeVideos': 'advancedModeMergeVideos',
  };

  const jsonTemplateParams: Record<string, string> = {
    'createMovie': 'jsonTemplate',
    'mergeVideoAudio': 'jsonTemplateMergeAudio',
    'mergeVideos': 'jsonTemplateMergeVideos',
  };

  return {
    isValid: true,
    hasAdvancedMode: operation in advancedModeParams,
    advancedModeParamName: advancedModeParams[operation],
    jsonTemplateParamName: jsonTemplateParams[operation],
  };
}

// =============================================================================
// PARAMETER INTROSPECTION (FOR DEBUGGING)
// =============================================================================

/**
 * Get statistics about the parameter definitions
 * Useful for debugging and ensuring all operations are properly configured
 */
export function getParameterStatistics(): {
  totalParameters: number;
  parametersByOperation: Record<string, number>;
  advancedModeParameters: number;
  jsonTemplateParameters: number;
  validationErrors: string[];
} {
  const allParams = getAllNodeProperties();
  const operations = getValidOperationNames();
  const validationErrors: string[] = [];

  const stats = {
    totalParameters: allParams.length,
    parametersByOperation: {} as Record<string, number>,
    advancedModeParameters: 0,
    jsonTemplateParameters: 0,
    validationErrors
  };

  // Count parameters by operation
  operations.forEach(op => {
    const opParams = allParams.filter(param => {
      const displayOptions = param.displayOptions;
      if (!displayOptions || !displayOptions.show) return false;
      return displayOptions.show.operation && displayOptions.show.operation.includes(op);
    });
    stats.parametersByOperation[op] = opParams.length;
  });

  // Count advanced mode and template parameters
  stats.advancedModeParameters = allParams.filter(param => 
    param.name.includes('advancedMode')
  ).length;

  stats.jsonTemplateParameters = allParams.filter(param => 
    param.name.includes('jsonTemplate')
  ).length;

  // Validate each operation has required parameters
  operations.forEach(op => {
    const metadata = getOperationMetadata(op);
    if (metadata.hasAdvancedMode) {
      const hasAdvancedParam = allParams.some(p => p.name === metadata.advancedModeParamName);
      const hasTemplateParam = allParams.some(p => p.name === metadata.jsonTemplateParamName);
      
      if (!hasAdvancedParam) {
        validationErrors.push(`Operation '${op}' missing advanced mode parameter: ${metadata.advancedModeParamName}`);
      }
      if (!hasTemplateParam) {
        validationErrors.push(`Operation '${op}' missing JSON template parameter: ${metadata.jsonTemplateParamName}`);
      }
    }
  });

  return stats;
}
