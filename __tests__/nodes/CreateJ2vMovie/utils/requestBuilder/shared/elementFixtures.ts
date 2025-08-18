/**
 * Element fixtures for testing
 * Contains sample data for all element types currently supported
 */

/**
 * Video element fixtures
 */
export const videoElements = {
  basic: {
    type: 'video',
    src: 'https://example.com/video.mp4'
  },
  
  withDuration: {
    type: 'video',
    src: 'https://example.com/video.mp4',
    duration: 10
  },
  
  withAllProperties: {
    type: 'video',
    src: 'https://example.com/video.mp4',
    start: 2,
    duration: 15,
    volume: 0.8,
    muted: false,
    loop: true,
    crop: false,
    fit: 'cover',
    speed: 1.5
  },
  
  muted: {
    type: 'video',
    src: 'https://example.com/video.mp4',
    muted: true,
    volume: 0
  }
};

/**
 * Audio element fixtures
 */
export const audioElements = {
  basic: {
    type: 'audio',
    src: 'https://example.com/audio.mp3'
  },
  
  withVolume: {
    type: 'audio',
    src: 'https://example.com/audio.mp3',
    volume: 0.7
  },
  
  withAllProperties: {
    type: 'audio',
    src: 'https://example.com/audio.mp3',
    start: 5,
    duration: 20,
    volume: 0.9,
    loop: false
  },
  
  looped: {
    type: 'audio',
    src: 'https://example.com/background.mp3',
    loop: true,
    volume: 0.3
  }
};

/**
 * Text element fixtures
 */
export const textElements = {
  basic: {
    text: 'Basic text',
    style: '001'
  },
  
  minimal: {
    text: 'Minimal text element'
  },
  
  complete: {
    text: 'Complete text element',
    style: '001',
    fontFamily: 'Roboto',
    fontSize: '32px',
    fontWeight: '600',
    fontColor: '#FFFFFF',
    backgroundColor: '#000000',
    textAlign: 'center',
    verticalPosition: 'center',
    horizontalPosition: 'center',
    position: 'center-center',
    x: 0,
    y: 0,
    start: 0,
    duration: 5,
    fadeIn: 0.3,
    fadeOut: 0.3,
    zIndex: 10
  },
  
  customPosition: {
    text: 'Custom positioned text',
    style: '002',
    position: 'custom',
    x: 100,
    y: 200
  },
  
  differentStyles: [
    { text: 'Basic style', style: '001' },
    { text: 'Word by word', style: '002' },
    { text: 'Character by character', style: '003' },
    { text: 'Jumping letters', style: '004' }
  ],
  
  withBackgrounds: [
    { 
      text: 'Solid background',
      backgroundColor: '#000000',
      fontColor: '#FFFFFF'
    },
    { 
      text: 'Red background',
      backgroundColor: '#FF0000',
      fontColor: '#FFFFFF'
    }
  ],
  
  positioning: [
    { text: 'Top left', position: 'top-left' },
    { text: 'Top right', position: 'top-right' },
    { text: 'Bottom left', position: 'bottom-left' },
    { text: 'Bottom right', position: 'bottom-right' },
    { text: 'Center', position: 'center-center' }
  ]
};

/**
 * Mixed element collections for testing scenarios with multiple element types
 */
export const mixedElements = {
  videoAndAudio: [
    videoElements.basic,
    audioElements.withVolume
  ],
  
  videoAndText: [
    videoElements.withDuration,
    textElements.basic
  ],
  
  allTypes: [
    videoElements.basic,
    audioElements.basic,
    textElements.complete
  ]
};

/**
 * Invalid element fixtures for testing validation
 */
export const invalidElements = {
  text: {
    emptyText: { text: '', style: '001' },
    missingText: { style: '001' },
    invalidStyle: { text: 'Valid text', style: 'invalid-style' }
  },
  
  video: {
    missingSrc: { type: 'video', duration: 10 },
    emptySrc: { type: 'video', src: '' }
  },
  
  audio: {
    missingSrc: { type: 'audio', volume: 0.5 },
    emptySrc: { type: 'audio', src: '' }
  }
};

/**
 * Helper function to create element collections for different operations
 */
export const createElementCollection = (elements: any[]) => ({
  elementValues: elements
});

/**
 * Helper function to create text element collections
 */
export const createTextElementCollection = (textElements: any[]) => ({
  textDetails: textElements
});

/**
 * Common test scenarios
 */
export const testScenarios = {
  emptyScene: {
    elements: createElementCollection([]),
    textElements: createTextElementCollection([])
  },
  
  videoOnlyScene: {
    elements: createElementCollection([videoElements.basic]),
    textElements: createTextElementCollection([])
  },
  
  textOnlyScene: {
    elements: createElementCollection([]),
    textElements: createTextElementCollection([textElements.basic])
  },
  
  mixedScene: {
    elements: createElementCollection([videoElements.basic, audioElements.basic]),
    textElements: createTextElementCollection([textElements.complete])
  }
};