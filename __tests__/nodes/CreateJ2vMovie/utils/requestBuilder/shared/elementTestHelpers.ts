import { 
  videoElements, 
  audioElements, 
  textElements, 
  mixedElements, 
  invalidElements 
} from './elementFixtures';

/**
 * Element fixture mapping for easy access by type
 */
export const getElementFixture = (elementType: string, variant: string = 'basic'): any => {
  const fixtures: Record<string, any> = {
    video: videoElements,
    audio: audioElements,
    text: textElements
  };
  
  const elementFixtures = fixtures[elementType];
  if (!elementFixtures) {
    throw new Error(`No fixtures found for element type: ${elementType}`);
  }
  
  const fixture = elementFixtures[variant];
  if (!fixture) {
    // If variant not found, try to return the first available fixture
    const availableVariants = Object.keys(elementFixtures);
    if (availableVariants.length > 0) {
      return elementFixtures[availableVariants[0]];
    }
    throw new Error(`No fixture variant '${variant}' found for element type: ${elementType}`);
  }
  
  return fixture;
};

export interface ElementTestConfig {
  operation: 'createMovie' | 'mergeVideoAudio' | 'mergeVideos';
  elementType: string;
  elementData: any;
  expectedInRequest?: any;
  shouldTransform?: boolean;
}

/**
 * Test element processing in a specific operation
 */
export const testElementInOperation = (
  operation: string,
  elementType: string, 
  elementData: any,
  builderFunction: (elements: any[]) => any
) => {
  const elements = [elementData];
  const result = builderFunction(elements);
  
  return {
    operation,
    elementType,
    input: elementData,
    output: result,
    elements: result.elements || result.timeline?.elements || []
  };
};

/**
 * Validate that an element was transformed correctly
 */
export const validateElementTransformation = (
  input: any,
  output: any,
  operation: string
): boolean => {
  // Basic validation that element exists in output
  if (!output.elements && !output.timeline?.elements) {
    return false;
  }
  
  const outputElements = output.elements || output.timeline?.elements || [];
  
  // Check if input element type exists in output
  return outputElements.some((element: any) => element.type === input.type);
};

/**
 * Create a test suite for a specific element type across all operations
 */
export const createElementValidationSuite = (elementType: string, variant: string = 'basic') => {
  const elementData = getElementFixture(elementType, variant);
  
  return {
    elementType,
    variant,
    data: elementData,
    testCases: {
      createMovie: {
        description: `should handle ${elementType} elements in createMovie operation`,
        data: elementData
      },
      mergeVideoAudio: {
        description: `should handle ${elementType} elements in mergeVideoAudio operation`, 
        data: elementData
      },
      mergeVideos: {
        description: `should handle ${elementType} elements in mergeVideos operation`,
        data: elementData
      }
    }
  };
};

/**
 * Test element positioning properties
 */
export const testElementPositioning = (element: any, expectedPosition?: any) => {
  const hasPositioning = element.x !== undefined || 
                        element.y !== undefined || 
                        element.position !== undefined;
  
  if (expectedPosition) {
    return {
      hasPositioning,
      matchesExpected: element.position === expectedPosition ||
                      (element.x === expectedPosition.x && element.y === expectedPosition.y)
    };
  }
  
  return { hasPositioning };
};

/**
 * Test element timing properties (start, duration, end)
 */
export const testElementTiming = (element: any, expectedTiming?: any) => {
  const hasTiming = element.start !== undefined || 
                   element.duration !== undefined || 
                   element.end !== undefined;
  
  const timing = {
    start: element.start,
    duration: element.duration, 
    end: element.end
  };
  
  if (expectedTiming) {
    return {
      hasTiming,
      timing,
      matchesExpected: Object.keys(expectedTiming).every(
        key => timing[key as keyof typeof timing] === expectedTiming[key]
      )
    };
  }
  
  return { hasTiming, timing };
};

/**
 * Get element by type from a collection
 */
export const findElementByType = (elements: any[], type: string): any => {
  return elements.find(element => element.type === type);
};

/**
 * Get all elements of a specific type from a collection
 */
export const findElementsByType = (elements: any[], type: string): any[] => {
  return elements.filter(element => element.type === type);
};

/**
 * Validate that required properties exist on an element
 */
export const validateRequiredProperties = (
  element: any, 
  requiredProps: string[]
): { isValid: boolean; missing: string[] } => {
  const missing = requiredProps.filter(prop => 
    element[prop] === undefined || element[prop] === null
  );
  
  return {
    isValid: missing.length === 0,
    missing
  };
};

/**
 * Create a test description for an element test case
 */
export const createTestDescription = (
  operation: string,
  elementType: string, 
  testType: string = 'processing'
): string => {
  return `should handle ${elementType} elements in ${operation} ${testType}`;
};

/**
 * Common element properties that should be preserved across operations
 */
export const COMMON_ELEMENT_PROPERTIES = [
  'type',
  'start', 
  'duration',
  'end',
  'x',
  'y', 
  'position',
  'width',
  'height'
];

/**
 * Validate that common properties are preserved
 */
export const validateCommonProperties = (input: any, output: any): boolean => {
  return COMMON_ELEMENT_PROPERTIES.every(prop => {
    if (input[prop] !== undefined) {
      return output[prop] === input[prop];
    }
    return true;
  });
};