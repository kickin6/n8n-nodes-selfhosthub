/**
 * Test file to verify shared mock helpers work correctly
 * This ensures our shared utilities are working before we refactor existing tests
 */

import { 
  createMockExecuteFunctions, 
  createBasicMockParams, 
  createBasicParameterMock,
  createEmptyElementCollections,
  createBasicScene,
  createSceneWithTextElements
} from './mockHelpers';

describe('Shared Mock Helpers', () => {
  describe('createMockExecuteFunctions', () => {
    test('should create a valid mock execute functions object', () => {
      const mockExecute = createMockExecuteFunctions();
      
      expect(mockExecute.getNodeParameter).toBeDefined();
      expect(typeof mockExecute.getNodeParameter).toBe('function');
      expect(mockExecute.logger).toBeDefined();
      expect(mockExecute.logger.debug).toBeDefined();
      expect(mockExecute.getCredentials).toBeDefined();
      expect(mockExecute.helpers).toBeDefined();
    });

    test('should allow mocking getNodeParameter', () => {
      const mockExecute = createMockExecuteFunctions();
      mockExecute.getNodeParameter.mockReturnValue('test-value');
      
      const result = mockExecute.getNodeParameter('test-param', 0, 'default');
      expect(result).toBe('test-value');
      expect(mockExecute.getNodeParameter).toHaveBeenCalledWith('test-param', 0, 'default');
    });
  });

  describe('createBasicMockParams', () => {
    test('should return standard parameters', () => {
      const params = createBasicMockParams();
      
      expect(params.framerate).toBe(25);
      expect(params.output_width).toBe(1024);
      expect(params.output_height).toBe(768);
      expect(params.recordId).toBe('');
      expect(params.webhookUrl).toBe('');
      expect(params.quality).toBe('');
      expect(params.cache).toBeUndefined();
      expect(params['client-data']).toBe('{}');
      expect(params.comment).toBe('');
      expect(params.draft).toBeUndefined();
    });
  });

  describe('createBasicParameterMock', () => {
    test('should return basic parameters for known params', () => {
      const paramMock = createBasicParameterMock();
      
      expect(paramMock('framerate', 0, 30)).toBe(25);
      expect(paramMock('output_width', 0, 512)).toBe(1024);
      expect(paramMock('output_height', 0, 384)).toBe(768);
    });

    test('should return default value for unknown params', () => {
      const paramMock = createBasicParameterMock();
      
      expect(paramMock('unknown-param', 0, 'default-value')).toBe('default-value');
    });

    test('should allow additional parameters', () => {
      const paramMock = createBasicParameterMock({
        'custom-param': 'custom-value',
        'another-param': 42
      });
      
      expect(paramMock('framerate', 0, 30)).toBe(25); // Basic param
      expect(paramMock('custom-param', 0, 'default')).toBe('custom-value'); // Additional param
      expect(paramMock('another-param', 0, 0)).toBe(42); // Additional param
      expect(paramMock('unknown-param', 0, 'default')).toBe('default'); // Unknown param
    });
  });

  describe('createEmptyElementCollections', () => {
    test('should return empty element collections', () => {
      const collections = createEmptyElementCollections();
      
      expect(collections['movieElements.elementValues']).toEqual([]);
      expect(collections['movieTextElements.textDetails']).toEqual([]);
      expect(collections['scenes.sceneValues']).toEqual([]);
    });
  });

  describe('createBasicScene', () => {
    test('should create basic scene structure', () => {
      const scene = createBasicScene();
      
      expect(scene.elements).toBeDefined();
      expect(scene.elements.elementValues).toEqual([]);
    });

    test('should allow overrides', () => {
      const scene = createBasicScene({
        duration: 10,
        'background-color': '#FF0000'
      });
      
      expect(scene.elements.elementValues).toEqual([]);
      expect(scene.duration).toBe(10);
      expect(scene['background-color']).toBe('#FF0000');
    });
  });

  describe('createSceneWithTextElements', () => {
    test('should create scene with empty text elements', () => {
      const scene = createSceneWithTextElements();
      
      expect(scene.elements.elementValues).toEqual([]);
      expect(scene.textElements.textDetails).toEqual([]);
    });

    test('should create scene with provided text elements', () => {
      const textElements = [
        { text: 'First text', style: '001' },
        { text: 'Second text', style: '002' }
      ];
      const scene = createSceneWithTextElements(textElements);
      
      expect(scene.elements.elementValues).toEqual([]);
      expect(scene.textElements.textDetails).toEqual(textElements);
    });
  });
});