/**
 * Position utilities for JSON2Video elements
 * Handles position preset calculations and API format mapping
 */

/**
 * Helper function to calculate X and Y coordinates based on position presets
 */
export function calculatePositionFromPreset(
  positionPreset: string,
  width: number,
  height: number,
  elementWidth: number = 0,
  elementHeight: number = 0
): { x: number; y: number } {
  const videoWidth = width || 1024;
  const videoHeight = height || 768;
  const elemWidthOffset = elementWidth ? elementWidth / 2 : 50;
  const elemHeightOffset = elementHeight ? elementHeight / 2 : 50;

  switch (positionPreset) {
    case 'center':
      return { x: videoWidth / 2, y: videoHeight / 2 };
    case 'top_left':
      return { x: elemWidthOffset, y: elemHeightOffset };
    case 'top_center':
      return { x: videoWidth / 2, y: elemHeightOffset };
    case 'top_right':
      return { x: videoWidth - elemWidthOffset, y: elemHeightOffset };
    case 'middle_left':
      return { x: elemWidthOffset, y: videoHeight / 2 };
    case 'middle_right':
      return { x: videoWidth - elemWidthOffset, y: videoHeight / 2 };
    case 'bottom_left':
      return { x: elemWidthOffset, y: videoHeight - elemHeightOffset };
    case 'bottom_center':
      return { x: videoWidth / 2, y: videoHeight - elemHeightOffset };
    case 'bottom_right':
      return { x: videoWidth - elemWidthOffset, y: videoHeight - elemHeightOffset };
    default:
      return { x: videoWidth / 2, y: videoHeight / 2 };
  }
}

/**
 * Maps internal position presets to JSON2Video API position format
 */
export function mapPositionPresetToApiFormat(positionPreset: any): string {
  if (!positionPreset || typeof positionPreset !== 'string') {
    return 'center-center';
  }

  const positionMap: { [key: string]: string } = {
    center: 'center-center',
    top_left: 'top-left',
    top_center: 'top-center',
    top_right: 'top-right',
    middle_left: 'center-left',
    middle_right: 'center-right',
    bottom_left: 'bottom-left',
    bottom_center: 'bottom-center',
    bottom_right: 'bottom-right',
  };

  return positionMap[positionPreset] || 'center-center';
}

/**
 * Validates that coordinates are within video bounds
 */
export function validatePosition(
  x: number,
  y: number,
  videoWidth: number,
  videoHeight: number
): { isValid: boolean; adjustedX?: number; adjustedY?: number } {
  const isXValid = x >= 0 && x <= videoWidth;
  const isYValid = y >= 0 && y <= videoHeight;

  if (isXValid && isYValid) {
    return { isValid: true };
  }

  // Return adjusted coordinates that fit within bounds
  const adjustedX = Math.max(0, Math.min(x, videoWidth));
  const adjustedY = Math.max(0, Math.min(y, videoHeight));

  return {
    isValid: false,
    adjustedX,
    adjustedY
  };
}

/**
 * Converts API position format back to internal preset format
 * Useful for reverse mapping or validation
 */
export function mapApiFormatToPositionPreset(apiPosition: string): string {
  const reversePositionMap: { [key: string]: string } = {
    'center-center': 'center',
    'top-left': 'top_left',
    'top-center': 'top_center',
    'top-right': 'top_right',
    'center-left': 'middle_left',
    'center-right': 'middle_right',
    'bottom-left': 'bottom_left',
    'bottom-center': 'bottom_center',
    'bottom-right': 'bottom_right',
  };

  return reversePositionMap[apiPosition] || 'center';
}

/**
 * Gets all available position presets
 */
export function getAvailablePositionPresets(): Array<{ name: string; value: string }> {
  return [
    { name: 'Custom (Set X/Y Manually)', value: 'custom' },
    { name: 'Center', value: 'center' },
    { name: 'Top-Left', value: 'top_left' },
    { name: 'Top-Center', value: 'top_center' },
    { name: 'Top-Right', value: 'top_right' },
    { name: 'Middle-Left', value: 'middle_left' },
    { name: 'Middle-Right', value: 'middle_right' },
    { name: 'Bottom-Left', value: 'bottom_left' },
    { name: 'Bottom-Center', value: 'bottom_center' },
    { name: 'Bottom-Right', value: 'bottom_right' },
  ];
}

/**
 * Calculates element bounds based on position and dimensions
 */
export function calculateElementBounds(
  x: number,
  y: number,
  width: number,
  height: number
): { left: number; top: number; right: number; bottom: number } {
  const halfWidth = width / 2;
  const halfHeight = height / 2;

  return {
    left: x - halfWidth,
    top: y - halfHeight,
    right: x + halfWidth,
    bottom: y + halfHeight
  };
}

/**
 * Checks if two elements overlap based on their positions and dimensions
 */
export function checkElementOverlap(
  element1: { x: number; y: number; width: number; height: number },
  element2: { x: number; y: number; width: number; height: number }
): boolean {
  const bounds1 = calculateElementBounds(element1.x, element1.y, element1.width, element1.height);
  const bounds2 = calculateElementBounds(element2.x, element2.y, element2.width, element2.height);

  return !(
    bounds1.right < bounds2.left ||
    bounds1.left > bounds2.right ||
    bounds1.bottom < bounds2.top ||
    bounds1.top > bounds2.bottom
  );
}