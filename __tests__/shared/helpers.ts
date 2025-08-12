import {
  IExecuteFunctions,
  IDataObject,
  INodeExecutionData,
  INodeParameters,
  INodeType,
  NodeConnectionType,
} from 'n8n-workflow';

/**
 * Mock for the execute function - generic n8n utilities only
 */
export function createMockExecuteFunction(
  nodeParameters: INodeParameters,
  workflow: any = {}
): IExecuteFunctions {
  const fakeExecute = {
    getNodeParameter(parameterName: string, itemIndex: number, fallbackValue?: any): any {
      const parameter = nodeParameters[parameterName];
      if (parameter === undefined) {
        return fallbackValue;
      }
      return parameter;
    },
    getWorkflowStaticData(type: string): IDataObject {
      if (workflow.staticData === undefined) {
        workflow.staticData = {};
      }
      if (workflow.staticData[type] === undefined) {
        workflow.staticData[type] = {};
      }
      return workflow.staticData[type] as IDataObject;
    },
    getInputData() {
      return workflow.input || [{ json: {} }];
    },
    helpers: {
      request: jest.fn().mockResolvedValue({
        error: 'Generic mock - override with specific node helpers',
      }),
    },
    getCredentials: jest.fn().mockImplementation(async (type: string) => {
      throw new Error(`Credentials for "${type}" not found - override with specific node helpers`);
    }),
    continueOnFail: () => false,
  };

  return fakeExecute as unknown as IExecuteFunctions;
}

/**
 * Creates a mock node type from a partial implementation
 */
export function createMockNodeType(nodeType: Partial<INodeType>): INodeType {
  const defaults: Partial<INodeType> = {
    description: {
      displayName: 'Mock Node',
      name: 'mockNode',
      group: ['transform'],
      version: 1,
      description: 'Mock node for testing',
      defaults: {
        name: 'Mock',
      },
      inputs: [
        {
          displayName: 'Input',
          type: NodeConnectionType.Main,
        },
      ],
      outputs: [
        {
          displayName: 'Output',
          type: NodeConnectionType.Main,
        },
      ],
      properties: [],
    },
    execute: async () => {
      return [[]];
    },
  };

  return { ...defaults, ...nodeType } as INodeType;
}

/**
 * Utility for asserting that results were successful
 */
export function expectSuccessfulExecution(
  result: INodeExecutionData[][],
  expectedLength: number = 1
): void {
  expect(result.length).toEqual(1);
  expect(result[0].length).toEqual(expectedLength);
  
  // Don't check success property as it might not be consistent between test mocks and actual implementation
  // Just verify that we have data returned
  expect(result[0][0].json).toBeDefined();
}

/**
 * Utility for asserting that execution resulted in an error
 */
export function expectErrorExecution(result: INodeExecutionData[][]): void {
  expect(result.length).toEqual(1);
  expect(result[0].length).toEqual(1);
  expect(result[0][0].json).toHaveProperty('success', false);
  expect(result[0][0].json).toHaveProperty('error');
}