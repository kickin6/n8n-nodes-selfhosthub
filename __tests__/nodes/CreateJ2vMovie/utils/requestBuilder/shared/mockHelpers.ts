/**
 * Mock helper functions for testing
 * Enhanced with additional utility functions while maintaining backward compatibility
 */

/**
 * Creates a basic mock IExecuteFunctions object
 * @returns Mock IExecuteFunctions with all required properties
 */
export const createMockExecuteFunctions = () => ({
  getNodeParameter: jest.fn(),
  logger: { debug: jest.fn() },
  getCredentials: jest.fn(),
  getExecutionId: jest.fn(),
  getNode: jest.fn(),
  getWorkflow: jest.fn(),
  getMode: jest.fn(),
  getActivationMode: jest.fn(),
  getRestApiUrl: jest.fn(),
  getInstanceBaseUrl: jest.fn(),
  getTimezone: jest.fn(),
  getExecuteData: jest.fn(),
  sendMessageToUI: jest.fn(),
  helpers: {} as any,
} as any);

/**
 * Creates basic mock parameters for CreateJ2vMovie operations
 * @returns Object with common parameter defaults
 */
export const createBasicMockParams = (): Record<string, any> => ({
  framerate: 25,
  output_width: 1024,
  output_height: 768,
  recordId: '',
  webhookUrl: '',
  quality: '',
  cache: undefined,
  'client-data': '{}',
  comment: '',
  draft: undefined
});

/**
 * Creates a mock parameter function with default values
 * @param customParams Custom parameter overrides
 * @returns Mock function for getNodeParameter
 */
export const createBasicParameterMock = (customParams: Record<string, any> = {}) => {
  const defaultParams = createBasicMockParams();
  const allParams: Record<string, any> = { ...defaultParams, ...customParams };

  return jest.fn((param: string, itemIndex: any, defaultValue: any) => {
    if (Object.prototype.hasOwnProperty.call(allParams, param)) {
      return allParams[param];
    }
    return defaultValue;
  });
};

/**
 * Creates empty element collections for testing
 * @returns Object with empty element arrays
 */
export const createEmptyElementCollections = (): Record<string, any> => ({
  'movieElements.elementValues': [],
  'movieTextElements.textDetails': [],
  'scenes.sceneValues': []
});

/**
 * Creates a basic scene configuration
 * @param overrides Properties to override in the scene
 * @returns Scene configuration object
 */
export const createBasicScene = (overrides: any = {}) => ({
  duration: 10,
  'background-color': '#000000',
  comment: '',
  elements: { elementValues: [] },
  textElements: { textDetails: [] },
  ...overrides
});

/**
 * Creates a scene with text elements
 * @param textElements Array of text elements to include
 * @param sceneOverrides Other scene properties to override
 * @returns Scene configuration with text elements
 */
export const createSceneWithTextElements = (textElements: any[] = [], sceneOverrides: any = {}) => ({
  ...createBasicScene(sceneOverrides),
  textElements: {
    textDetails: textElements
  }
});

/**
 * Enhanced mock creator with parameter defaults (NEW)
 * @param customParams Custom parameter overrides
 * @returns Complete mock IExecuteFunctions with configured parameters
 */
export const createMockExecute = (customParams: Record<string, any> = {}) => {
  const mock = createMockExecuteFunctions();
  
  // Combine default params with custom params and empty collections
  const baseParams = createBasicMockParams();
  const emptyCollections = createEmptyElementCollections();
  const allParams: Record<string, any> = { ...baseParams, ...emptyCollections, ...customParams };

  // Create parameter mock that safely handles string indexing
  mock.getNodeParameter = jest.fn((param: string, itemIndex: any, defaultValue: any) => {
    if (Object.prototype.hasOwnProperty.call(allParams, param)) {
      return allParams[param];
    }
    return defaultValue;
  });

  return mock;
};

/**
 * Mock webhook configuration
 */
export const createMockWebhookConfig = (url: string = 'https://webhook.example.com') => ({
  webhookUrl: url
});

/**
 * Mock output settings configuration
 */
export const createMockOutputSettings = (overrides: any = {}) => ({
  width: 1024,
  height: 768,
  fps: 30,
  quality: 'medium',
  ...overrides
});

/**
 * Mock video element configuration
 */
export const createMockVideoElement = (overrides: any = {}) => ({
  type: 'video',
  src: 'https://example.com/video.mp4',
  duration: 10,
  volume: 1.0,
  ...overrides
});

/**
 * Mock audio element configuration
 */
export const createMockAudioElement = (overrides: any = {}) => ({
  type: 'audio',
  src: 'https://example.com/audio.mp3',
  volume: 0.8,
  ...overrides
});

/**
 * Mock transition configuration
 */
export const createMockTransition = (style: string = 'fade', duration: number = 1) => ({
  transition_style: style,
  transition_duration: duration
});

/**
 * Helper to create parameter access errors for testing error handling
 */
export const createParameterAccessError = (paramName: string) => {
  throw new Error(`Parameter access failed for: ${paramName}`);
};

/**
 * Mock logger for testing
 */
export const createMockLogger = () => ({
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
});

/**
 * Helper to validate mock function calls
 */
export const validateMockCalls = (mockFn: jest.Mock, expectedCalls: any[]) => {
  expectedCalls.forEach((expectedCall, index) => {
    expect(mockFn).toHaveBeenNthCalledWith(index + 1, ...expectedCall);
  });
};