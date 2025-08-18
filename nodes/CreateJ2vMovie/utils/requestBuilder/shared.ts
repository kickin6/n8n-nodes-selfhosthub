import { IExecuteFunctions, NodeParameterValue } from 'n8n-workflow';

/**
 * Helper function to retrieve a parameter value for a given operation and mode
 */
export function getParameterValue(
  this: IExecuteFunctions,
  parameterName: string,
  itemIndex = 0,
  defaultValue: NodeParameterValue = ''
): NodeParameterValue {
  try {
    return this.getNodeParameter(parameterName, itemIndex, defaultValue) as NodeParameterValue;
  } catch (error: any) {
    return defaultValue;
  }
}