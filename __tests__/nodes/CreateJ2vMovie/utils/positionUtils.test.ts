import {
  calculatePositionFromPreset,
  mapPositionPresetToApiFormat,
  validatePosition,
  mapApiFormatToPositionPreset,
  getAvailablePositionPresets,
  calculateElementBounds,
  checkElementOverlap
} from '@nodes/CreateJ2vMovie/utils/positionUtils';

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

    test('should handle zero element dimensions', () => {
      const result = calculatePositionFromPreset(
        'top_left',
        1920,
        1080,
        0,
        0
      );

      // Should use default offset of 50 when element dimensions are 0
      expect(result.x).toBeCloseTo(50);
      expect(result.y).toBeCloseTo(50);
    });

    test('should handle zero video dimensions with fallback', () => {
      const result = calculatePositionFromPreset(
        'center',
        0,  // zero width
        0,  // zero height
        100,
        100
      );

      // Should use fallback dimensions: 1024x768
      expect(result.x).toBeCloseTo(512); // 1024/2
      expect(result.y).toBeCloseTo(384); // 768/2
    });

    test('should handle undefined element dimensions', () => {
      const result = calculatePositionFromPreset(
        'top_left',
        1920,
        1080
        // elementWidth and elementHeight are undefined
      );

      // Should use default offset of 50 when element dimensions are undefined
      expect(result.x).toBeCloseTo(50);
      expect(result.y).toBeCloseTo(50);
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
        { preset: 'invalid_preset', expected: 'center-center' }
      ];

      testCases.forEach(({ preset, expected }) => {
        const result = mapPositionPresetToApiFormat(preset);
        expect(result).toBe(expected);
      });
    });

    // Just test the return values, not the logging
    test('should handle null preset', () => {
      const result = mapPositionPresetToApiFormat(null);
      expect(result).toBe('center-center');
    });

    test('should handle undefined preset', () => {
      const result = mapPositionPresetToApiFormat(undefined);
      expect(result).toBe('center-center');
    });

    test('should handle non-string preset', () => {
      const result = mapPositionPresetToApiFormat(123 as any);
      expect(result).toBe('center-center');
    });
  });

  describe('validatePosition', () => {
    test('should return valid for coordinates within bounds', () => {
      const result = validatePosition(500, 300, 1920, 1080);
      expect(result.isValid).toBe(true);
      expect(result.adjustedX).toBeUndefined();
      expect(result.adjustedY).toBeUndefined();
    });

    test('should return invalid and adjust coordinates outside bounds', () => {
      const result = validatePosition(-100, 1200, 1920, 1080);
      expect(result.isValid).toBe(false);
      expect(result.adjustedX).toBe(0);
      expect(result.adjustedY).toBe(1080);
    });

    test('should handle coordinates exactly at bounds', () => {
      const result = validatePosition(0, 0, 1920, 1080);
      expect(result.isValid).toBe(true);
    });

    test('should handle coordinates at maximum bounds', () => {
      const result = validatePosition(1920, 1080, 1920, 1080);
      expect(result.isValid).toBe(true);
    });

    test('should adjust coordinates that exceed maximum bounds', () => {
      const result = validatePosition(2000, 1200, 1920, 1080);
      expect(result.isValid).toBe(false);
      expect(result.adjustedX).toBe(1920);
      expect(result.adjustedY).toBe(1080);
    });
  });

  describe('mapApiFormatToPositionPreset', () => {
    test('should map API format back to position presets', () => {
      const testCases = [
        { apiFormat: 'center-center', expected: 'center' },
        { apiFormat: 'top-left', expected: 'top_left' },
        { apiFormat: 'top-center', expected: 'top_center' },
        { apiFormat: 'top-right', expected: 'top_right' },
        { apiFormat: 'center-left', expected: 'middle_left' },
        { apiFormat: 'center-right', expected: 'middle_right' },
        { apiFormat: 'bottom-left', expected: 'bottom_left' },
        { apiFormat: 'bottom-center', expected: 'bottom_center' },
        { apiFormat: 'bottom-right', expected: 'bottom_right' },
        { apiFormat: 'invalid-format', expected: 'center' }
      ];

      testCases.forEach(({ apiFormat, expected }) => {
        const result = mapApiFormatToPositionPreset(apiFormat);
        expect(result).toBe(expected);
      });
    });
  });

  describe('getAvailablePositionPresets', () => {
    test('should return all available position presets', () => {
      const result = getAvailablePositionPresets();

      expect(result).toHaveLength(10);
      expect(result[0]).toEqual({ name: 'Custom (Set X/Y Manually)', value: 'custom' });
      expect(result[1]).toEqual({ name: 'Center', value: 'center' });
      expect(result[2]).toEqual({ name: 'Top-Left', value: 'top_left' });
      expect(result[3]).toEqual({ name: 'Top-Center', value: 'top_center' });
      expect(result[4]).toEqual({ name: 'Top-Right', value: 'top_right' });
      expect(result[5]).toEqual({ name: 'Middle-Left', value: 'middle_left' });
      expect(result[6]).toEqual({ name: 'Middle-Right', value: 'middle_right' });
      expect(result[7]).toEqual({ name: 'Bottom-Left', value: 'bottom_left' });
      expect(result[8]).toEqual({ name: 'Bottom-Center', value: 'bottom_center' });
      expect(result[9]).toEqual({ name: 'Bottom-Right', value: 'bottom_right' });
    });
  });

  describe('calculateElementBounds', () => {
    test('should calculate correct bounds for an element', () => {
      const result = calculateElementBounds(100, 100, 50, 30);

      expect(result.left).toBe(75);   // 100 - 25
      expect(result.top).toBe(85);    // 100 - 15
      expect(result.right).toBe(125); // 100 + 25
      expect(result.bottom).toBe(115); // 100 + 15
    });

    test('should handle zero dimensions', () => {
      const result = calculateElementBounds(100, 100, 0, 0);

      expect(result.left).toBe(100);
      expect(result.top).toBe(100);
      expect(result.right).toBe(100);
      expect(result.bottom).toBe(100);
    });

    test('should handle negative coordinates', () => {
      const result = calculateElementBounds(-50, -30, 20, 10);

      expect(result.left).toBe(-60);  // -50 - 10
      expect(result.top).toBe(-35);   // -30 - 5
      expect(result.right).toBe(-40); // -50 + 10
      expect(result.bottom).toBe(-25); // -30 + 5
    });
  });

  describe('checkElementOverlap', () => {
    test('should detect overlapping elements', () => {
      const element1 = { x: 100, y: 100, width: 50, height: 50 };
      const element2 = { x: 120, y: 120, width: 50, height: 50 };

      const result = checkElementOverlap(element1, element2);
      expect(result).toBe(true);
    });

    test('should detect non-overlapping elements', () => {
      const element1 = { x: 100, y: 100, width: 50, height: 50 };
      const element2 = { x: 200, y: 200, width: 50, height: 50 };

      const result = checkElementOverlap(element1, element2);
      expect(result).toBe(false);
    });

    test('should detect adjacent elements as overlapping (they actually touch)', () => {
      const element1 = { x: 100, y: 100, width: 50, height: 50 };
      const element2 = { x: 150, y: 100, width: 50, height: 50 };

      const result = checkElementOverlap(element1, element2);
      expect(result).toBe(true); // Actually overlapping at the edge
    });

    test('should handle elements with zero dimensions as overlapping', () => {
      const element1 = { x: 100, y: 100, width: 0, height: 0 };
      const element2 = { x: 100, y: 100, width: 0, height: 0 };

      const result = checkElementOverlap(element1, element2);
      expect(result).toBe(true); // Zero-dimension elements at same position overlap
    });

    test('should detect overlap when one element is inside another', () => {
      const element1 = { x: 100, y: 100, width: 100, height: 100 };
      const element2 = { x: 110, y: 110, width: 20, height: 20 };

      const result = checkElementOverlap(element1, element2);
      expect(result).toBe(true);
    });

    test('should detect partial overlap', () => {
      const element1 = { x: 100, y: 100, width: 60, height: 60 };
      const element2 = { x: 130, y: 130, width: 60, height: 60 };

      const result = checkElementOverlap(element1, element2);
      expect(result).toBe(true);
    });

    test('should handle negative coordinates', () => {
      const element1 = { x: -50, y: -50, width: 100, height: 100 };
      const element2 = { x: 0, y: 0, width: 50, height: 50 };

      const result = checkElementOverlap(element1, element2);
      expect(result).toBe(true);
    });
  });
});