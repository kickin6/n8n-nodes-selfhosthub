import { calculatePositionFromPreset, mapPositionPresetToApiFormat } from '../../../../nodes/CreateJ2vMovie/utils/positionUtils';

describe('positionUtils', () => {
  describe('calculatePositionFromPreset', () => {
    test('should calculate position for all position presets', () => {
      const testCases = [
        { preset: 'top_left', expectedX: 250, expectedY: 150 },
        { preset: 'top_center', expectedX: 640, expectedY: 150 },
        { preset: 'top_right', expectedX: 1030, expectedY: 150 },
        { preset: 'middle_left', expectedX: 250, expectedY: 360 },
        { preset: 'center', expectedX: 640, expectedY: 360 },
        { preset: 'middle_right', expectedX: 1030, expectedY: 360 },
        { preset: 'bottom_left', expectedX: 250, expectedY: 570 },
        { preset: 'bottom_center', expectedX: 640, expectedY: 570 },
        { preset: 'bottom_right', expectedX: 1030, expectedY: 570 },
        // Test default case (should use center if preset is not recognized)
        { preset: 'invalid_preset', expectedX: 640, expectedY: 360 }
      ];
      
      testCases.forEach(({ preset, expectedX, expectedY }) => {
        const result = calculatePositionFromPreset(
          preset,
          1280,  // video width
          720,   // video height
          500,   // element width
          300    // element height
        );
        
        expect(result.x).toBeCloseTo(expectedX);
        expect(result.y).toBeCloseTo(expectedY);
      });
    });
    
    test('should handle custom positions by using default center', () => {
      const result = calculatePositionFromPreset(
        'custom',
        1280,
        720,
        500,
        300
      );
      
      expect(result.x).toBeCloseTo(640);
      expect(result.y).toBeCloseTo(360);
    });

    test('should handle different video dimensions', () => {
      const result = calculatePositionFromPreset(
        'top_left',
        1920,
        1080,
        400,
        200
      );
      
      // For 1920x1080 video with 400x200 element
      // Offset should be (400/2, 200/2) = (200, 100)
      expect(result.x).toBeCloseTo(200);
      expect(result.y).toBeCloseTo(100);
    });
  });
  
  describe('mapPositionPresetToApiFormat', () => {
    test('should map all position presets to API format', () => {
      const testCases = [
        { preset: 'top_left', expected: 'top-left' },
        { preset: 'top_center', expected: 'top-center' },
        { preset: 'top_right', expected: 'top-right' },
        { preset: 'middle_left', expected: 'center-left' },
        { preset: 'center', expected: 'center-center' },
        { preset: 'middle_right', expected: 'center-right' },
        { preset: 'bottom_left', expected: 'bottom-left' },
        { preset: 'bottom_center', expected: 'bottom-center' },
        { preset: 'bottom_right', expected: 'bottom-right' },
        // Test default cases
        { preset: 'custom', expected: 'center-center' },
        { preset: 'invalid_preset', expected: 'center-center' },
        { preset: null, expected: 'center-center' },
        { preset: undefined, expected: 'center-center' }
      ];
      
      testCases.forEach(({ preset, expected }) => {
        const result = mapPositionPresetToApiFormat(preset);
        expect(result).toBe(expected);
      });
    });
  });
});