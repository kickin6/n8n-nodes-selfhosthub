// __tests__/nodes/CreateJ2vMovie/core/processors.test.ts

import {
  ELEMENT_PROCESSORS,
  processTextElement,
  processSubtitleElement,
  processBasicElement,
  convertCamelToKebab,
  processCommonProperties,
  processLoop,
  processVolume,
  processDuration,
  processStart,
  processDimension,
  processFontSize,
  getProcessor,
  getSupportedElementTypes,
  isElementTypeSupported,
} from '../../../../nodes/CreateJ2vMovie/core/processors';

describe('core/processors/index', () => {
  describe('ELEMENT_PROCESSORS', () => {
    const processorTestCases = [
      { type: 'text' as const, expectedProcessor: processTextElement },
      { type: 'subtitles' as const, expectedProcessor: processSubtitleElement },
      { type: 'video' as const, expectedProcessor: processBasicElement },
      { type: 'audio' as const, expectedProcessor: processBasicElement },
      { type: 'image' as const, expectedProcessor: processBasicElement },
      { type: 'voice' as const, expectedProcessor: processBasicElement },
      { type: 'component' as const, expectedProcessor: processBasicElement },
      { type: 'audiogram' as const, expectedProcessor: processBasicElement },
      { type: 'html' as const, expectedProcessor: processBasicElement },
    ];

    test.each(processorTestCases)('should have $type processor', ({ type, expectedProcessor }) => {
      expect(ELEMENT_PROCESSORS).toHaveProperty(type);
      expect(ELEMENT_PROCESSORS[type]).toBe(expectedProcessor);
      expect(typeof ELEMENT_PROCESSORS[type]).toBe('function');
    });
  });

  describe('processTextElement', () => {
    const textElementTestCases = [
      {
        name: 'complete textSettings collection',
        input: {
          type: 'text',
          text: 'Hello World',
          textSettings: {
            fontFamily: 'Arial',
            fontSize: '16px',
            fontWeight: 'bold',
            textAlign: 'center',
            textColor: '#000000',
            backgroundColor: '#ffffff',
            borderColor: '#cccccc',
            borderWidth: '1px',
            borderRadius: '5px',
            padding: '10px',
            margin: '5px',
            lineHeight: '1.5',
            letterSpacing: '1px',
            textShadow: '1px 1px 1px rgba(0,0,0,0.3)',
            opacity: 0.9,
            transform: 'rotate(45deg)',
          },
        },
        expectedSettings: {
          'font-family': 'Arial',
          'font-size': 16,
          'font-weight': 'bold',
          'text-align': 'center',
          'color': '#000000',
          'background-color': '#ffffff',
          'border-color': '#cccccc',
          'border-width': '1px',
          'border-radius': '5px',
          'padding': '10px',
          'margin': '5px',
          'line-height': '1.5',
          'letter-spacing': '1px',
          'text-shadow': '1px 1px 1px rgba(0,0,0,0.3)',
          'opacity': 0.9,
          'transform': 'rotate(45deg)',
        },
      },
      {
        name: 'numeric fontSize conversion',
        input: { type: 'text', textSettings: { fontSize: 20 } },
        expectedSettings: { 'font-size': 20 },
      },
      {
        name: 'partial textSettings with undefined values',
        input: {
          type: 'text',
          textSettings: {
            fontFamily: 'Arial',
            fontSize: undefined,
            textColor: '#000',
          },
        },
        expectedSettings: {
          'font-family': 'Arial',
          'color': '#000',
        },
      },
      {
        name: 'no textSettings',
        input: { type: 'text', text: 'Hello' },
        expectedSettings: undefined,
      },
      {
        name: 'empty textSettings',
        input: { type: 'text', textSettings: {} },
        expectedSettings: undefined,
      },
      {
        name: 'invalid fontSize string',
        input: { type: 'text', textSettings: { fontSize: 'invalid' } },
        expectedSettings: undefined,
      },
    ];

    test.each(textElementTestCases)('should handle $name', ({ input, expectedSettings }) => {
      const result = processTextElement(input);
      expect(result.settings).toEqual(expectedSettings);
      expect(result.textSettings).toBeUndefined();
    });
  });

  describe('processSubtitleElement', () => {
    const subtitleElementTestCases = [
      {
        name: 'complete subtitleSettings collection',
        input: {
          type: 'subtitles',
          subtitleSettings: {
            fontFamily: 'Helvetica',
            fontSize: '14px',
            fontWeight: 'normal',
            textAlign: 'left',
            textColor: '#ffffff',
            backgroundColor: '#000000',
            borderColor: '#333333',
            borderWidth: '2px',
            borderRadius: '3px',
            padding: '8px',
            margin: '4px',
            lineHeight: '1.2',
            letterSpacing: '0.5px',
            textShadow: '2px 2px 2px rgba(0,0,0,0.5)',
            opacity: 0.8,
            transform: 'scale(1.1)',
          },
        },
        expectedSettings: {
          'font-family': 'Helvetica',
          'font-size': 14,
          'font-weight': 'normal',
          'text-align': 'left',
          'color': '#ffffff',
          'background-color': '#000000',
          'border-color': '#333333',
          'border-width': '2px',
          'border-radius': '3px',
          'padding': '8px',
          'margin': '4px',
          'line-height': '1.2',
          'letter-spacing': '0.5px',
          'text-shadow': '2px 2px 2px rgba(0,0,0,0.5)',
          'opacity': 0.8,
          'transform': 'scale(1.1)',
        },
      },
      {
        name: 'numeric fontSize in subtitleSettings',
        input: { type: 'subtitles', subtitleSettings: { fontSize: 18 } },
        expectedSettings: { 'font-size': 18 },
      },
      {
        name: 'no subtitleSettings',
        input: { type: 'subtitles' },
        expectedSettings: undefined,
      },
      {
        name: 'invalid fontSize string in subtitleSettings',
        input: { type: 'subtitles', subtitleSettings: { fontSize: 'invalid' } },
        expectedSettings: undefined,
      },
    ];

    test.each(subtitleElementTestCases)('should handle $name', ({ input, expectedSettings }) => {
      const result = processSubtitleElement(input);
      expect(result.settings).toEqual(expectedSettings);
      expect(result.subtitleSettings).toBeUndefined();
    });
  });

  describe('processBasicElement', () => {
    describe('timing collection', () => {
      const timingTestCases = [
        {
          name: 'complete timing collection',
          input: {
            type: 'video',
            timing: {
              start: 2.5,
              duration: 10,
              extraTime: 1,
              fadeIn: 0.5,
              fadeOut: 0.3,
              zIndex: 5,
            },
          },
          expectedProps: {
            start: 2.5,
            duration: 10,
            'extra-time': 1,
            'fade-in': 0.5,
            'fade-out': 0.3,
            'z-index': 5,
          },
        },
        {
          name: 'partial timing collection',
          input: { type: 'audio', timing: { start: 1, duration: 5 } },
          expectedProps: { start: 1, duration: 5 },
        },
        {
          name: 'no timing collection',
          input: { type: 'video' },
          expectedProps: {},
        },
      ];

      test.each(timingTestCases)('should handle $name', ({ input, expectedProps }) => {
        const result = processBasicElement(input);
        Object.entries(expectedProps).forEach(([key, value]) => {
          expect(result[key]).toBe(value);
        });
        expect(result.timing).toBeUndefined();
      });
    });

    describe('audioControls collection', () => {
      const audioControlsTestCases = [
        {
          name: 'complete audioControls with boolean true loop',
          input: {
            type: 'video',
            audioControls: { volume: 8, muted: true, seek: 5.5, loop: true },
          },
          expectedProps: { volume: 8, muted: true, seek: 5.5, loop: -1 },
        },
        {
          name: 'complete audioControls with boolean false loop',
          input: {
            type: 'video',
            audioControls: { volume: 3, muted: false, seek: 2.1, loop: false },
          },
          expectedProps: { volume: 3, muted: false, seek: 2.1, loop: 1 },
        },
        {
          name: 'audioControls with numeric loop',
          input: { type: 'audio', audioControls: { loop: 5 } },
          expectedProps: { loop: 5 },
        },
        {
          name: 'audioControls with volume clamping high',
          input: { type: 'audio', audioControls: { volume: 15 } },
          expectedProps: { volume: 10 },
        },
        {
          name: 'audioControls with volume clamping low',
          input: { type: 'audio', audioControls: { volume: -3 } },
          expectedProps: { volume: 0 },
        },
        {
          name: 'audioControls with string conversions',
          input: {
            type: 'video',
            audioControls: { volume: '7.5', seek: '3.2', loop: '4' },
          },
          expectedProps: { volume: 7.5, seek: 3.2, loop: 4 },
        },
        {
          name: 'audioControls with NaN values',
          input: {
            type: 'video',
            audioControls: { volume: 'invalid', seek: 'invalid', loop: 'invalid' },
          },
          expectedProps: {},
        },
      ];

      test.each(audioControlsTestCases)('should handle $name', ({ input, expectedProps }) => {
        const result = processBasicElement(input);
        Object.entries(expectedProps).forEach(([key, value]) => {
          expect(result[key]).toBe(value);
        });
        expect(result.audioControls).toBeUndefined();
      });
    });

    describe('positioning collection', () => {
      const positioningTestCases = [
        {
          name: 'complete positioning collection',
          input: {
            type: 'image',
            positioning: {
              position: 'center-center',
              x: 100,
              y: 200,
              width: 300,
              height: 400,
              resize: 'cover',
            },
          },
          expectedProps: {
            position: 'center-center',
            x: 100,
            y: 200,
            width: 300,
            height: 400,
            resize: 'cover',
          },
        },
        {
          name: 'positioning with width/height clamping',
          input: {
            type: 'image',
            positioning: { width: -5, height: 0 },
          },
          expectedProps: { width: -1, height: -1 },
        },
        {
          name: 'positioning with string conversions',
          input: {
            type: 'component',
            positioning: { x: '50.5', y: '75.3', width: '200', height: '150' },
          },
          expectedProps: { x: 50.5, y: 75.3, width: 200, height: 150 },
        },
        {
          name: 'positioning with NaN values',
          input: {
            type: 'image',
            positioning: { x: 'invalid', y: 'invalid', width: 'invalid', height: 'invalid' },
          },
          expectedProps: {},
        },
      ];

      test.each(positioningTestCases)('should handle $name', ({ input, expectedProps }) => {
        const result = processBasicElement(input);
        Object.entries(expectedProps).forEach(([key, value]) => {
          expect(result[key]).toBe(value);
        });
        expect(result.positioning).toBeUndefined();
      });
    });

    describe('visualEffects collection', () => {
      const visualEffectsTestCases = [
        {
          name: 'complete visualEffects collection',
          input: {
            type: 'video',
            visualEffects: {
              zoom: 1.5,
              flipHorizontal: true,
              flipVertical: false,
              mask: 'circle',
              pan: 'left',
              panDistance: 100,
              panCrop: true,
            },
          },
          expectedProps: {
            zoom: 1.5,
            'flip-horizontal': true,
            'flip-vertical': false,
            mask: 'circle',
            pan: 'left',
            'pan-distance': 100,
            'pan-crop': true,
          },
        },
        {
          name: 'visualEffects with string conversions',
          input: {
            type: 'image',
            visualEffects: { zoom: '2.5', panDistance: '150' },
          },
          expectedProps: { zoom: 2.5, 'pan-distance': 150 },
        },
        {
          name: 'visualEffects with NaN values',
          input: {
            type: 'video',
            visualEffects: { zoom: 'invalid', panDistance: 'invalid' },
          },
          expectedProps: {},
        },
      ];

      test.each(visualEffectsTestCases)('should handle $name', ({ input, expectedProps }) => {
        const result = processBasicElement(input);
        Object.entries(expectedProps).forEach(([key, value]) => {
          expect(result[key]).toBe(value);
        });
        expect(result.visualEffects).toBeUndefined();
      });
    });

    describe('crop collection', () => {
      const cropTestCases = [
        {
          name: 'valid crop with cropValues',
          input: {
            type: 'video',
            crop: { cropValues: { width: 200, height: 150, x: 10, y: 20 } },
          },
          expectedCrop: { width: 200, height: 150, x: 10, y: 20 },
        },
        {
          name: 'crop without cropValues',
          input: { type: 'video', crop: { otherProp: 'value' } },
          expectedCrop: undefined,
        },
        {
          name: 'crop with empty cropValues',
          input: { type: 'video', crop: { cropValues: {} } },
          expectedCrop: undefined,
        },
      ];

      test.each(cropTestCases)('should handle $name', ({ input, expectedCrop }) => {
        const result = processBasicElement(input);
        expect(result.crop).toEqual(expectedCrop);
      });
    });

    describe('rotate collection', () => {
      const rotateTestCases = [
        {
          name: 'valid rotate with rotationValues',
          input: {
            type: 'image',
            rotate: { rotationValues: { angle: 45, speed: 2 } },
          },
          expectedRotate: { angle: 45, speed: 2 },
        },
        {
          name: 'rotate without rotationValues',
          input: { type: 'image', rotate: { otherProp: 'value' } },
          expectedRotate: undefined,
        },
        {
          name: 'rotate with empty rotationValues',
          input: { type: 'image', rotate: { rotationValues: {} } },
          expectedRotate: undefined,
        },
      ];

      test.each(rotateTestCases)('should handle $name', ({ input, expectedRotate }) => {
        const result = processBasicElement(input);
        expect(result.rotate).toEqual(expectedRotate);
      });
    });

    describe('chromaKey collection', () => {
      const chromaKeyTestCases = [
        {
          name: 'valid chromaKey with chromaValues',
          input: {
            type: 'video',
            chromaKey: { chromaValues: { color: '#00FF00', tolerance: 25 } },
          },
          expectedChromaKey: { color: '#00FF00', tolerance: 25 },
        },
        {
          name: 'chromaKey without chromaValues',
          input: { type: 'video', chromaKey: { otherProp: 'value' } },
          expectedChromaKey: undefined,
        },
      ];

      test.each(chromaKeyTestCases)('should handle $name', ({ input, expectedChromaKey }) => {
        const result = processBasicElement(input);
        expect(result['chroma-key']).toEqual(expectedChromaKey);
        expect(result.chromaKey).toBeUndefined();
      });
    });

    describe('correction collection', () => {
      const correctionTestCases = [
        {
          name: 'valid correction properties',
          input: {
            type: 'video',
            correction: { brightness: 1.2, contrast: 0.8, gamma: 1.1, saturation: 1.5 },
          },
          expectedCorrection: { brightness: 1.2, contrast: 0.8, gamma: 1.1, saturation: 1.5 },
        },
        {
          name: 'correction with invalid properties only',
          input: { type: 'video', correction: { invalidProp: 'value' } },
          expectedCorrection: undefined,
        },
      ];

      test.each(correctionTestCases)('should handle $name', ({ input, expectedCorrection }) => {
        const result = processBasicElement(input);
        expect(result.correction).toEqual(expectedCorrection);
      });
    });

    describe('aiGeneration collection', () => {
      const aiGenerationTestCases = [
        {
          name: 'complete aiGeneration collection',
          input: {
            type: 'image',
            aiGeneration: {
              prompt: 'A beautiful sunset',
              model: 'flux-pro',
              aspectRatio: 'horizontal',
              connection: 'leonardo',
              modelSettings: { quality: 'high' },
            },
          },
          expectedProps: {
            prompt: 'A beautiful sunset',
            model: 'flux-pro',
            'aspect-ratio': 'horizontal',
            connection: 'leonardo',
            'model-settings': { quality: 'high' },
          },
        },
        {
          name: 'partial aiGeneration collection',
          input: { type: 'image', aiGeneration: { prompt: 'Test prompt' } },
          expectedProps: { prompt: 'Test prompt' },
        },
      ];

      test.each(aiGenerationTestCases)('should handle $name', ({ input, expectedProps }) => {
        const result = processBasicElement(input);
        Object.entries(expectedProps).forEach(([key, value]) => {
          expect(result[key]).toEqual(value);
        });
        expect(result.aiGeneration).toBeUndefined();
      });
    });

    describe('voiceSettings collection', () => {
      const voiceSettingsTestCases = [
        {
          name: 'complete voiceSettings collection',
          input: {
            type: 'voice',
            voiceSettings: {
              voice: 'en-US-JennyNeural',
              model: 'azure',
              connection: 'azure-speech',
            },
          },
          expectedProps: {
            voice: 'en-US-JennyNeural',
            model: 'azure',
            connection: 'azure-speech',
          },
        },
        {
          name: 'partial voiceSettings collection',
          input: { type: 'voice', voiceSettings: { voice: 'en-US-AriaNeural' } },
          expectedProps: { voice: 'en-US-AriaNeural' },
        },
        {
          name: 'no voiceSettings',
          input: { type: 'voice' },
          expectedProps: {},
        },
      ];

      test.each(voiceSettingsTestCases)('should handle $name', ({ input, expectedProps }) => {
        const result = processBasicElement(input);
        Object.entries(expectedProps).forEach(([key, value]) => {
          expect(result[key]).toBe(value);
        });
        expect(result.voiceSettings).toBeUndefined();
      });
    });

    describe('componentSettings collection', () => {
      const componentSettingsTestCases = [
        {
          name: 'complete componentSettings collection',
          input: {
            type: 'component',
            componentSettings: {
              component: 'subtitle-block',
              settings: { text: 'Hello World', color: '#FFFFFF' },
            },
          },
          expectedProps: {
            component: 'subtitle-block',
            settings: { text: 'Hello World', color: '#FFFFFF' },
          },
        },
        {
          name: 'partial componentSettings collection',
          input: { type: 'component', componentSettings: { component: 'title-card' } },
          expectedProps: { component: 'title-card' },
        },
        {
          name: 'no componentSettings',
          input: { type: 'component' },
          expectedProps: {},
        },
      ];

      test.each(componentSettingsTestCases)('should handle $name', ({ input, expectedProps }) => {
        const result = processBasicElement(input);
        Object.entries(expectedProps).forEach(([key, value]) => {
          expect(result[key]).toEqual(value);
        });
        expect(result.componentSettings).toBeUndefined();
      });
    });

    describe('htmlSettings collection', () => {
      const htmlSettingsTestCases = [
        {
          name: 'valid htmlSettings collection',
          input: { type: 'html', htmlSettings: { html: '<div>Hello</div>', tailwindcss: true, wait: 3.5 } },
          expectedProps: { html: '<div>Hello</div>', tailwindcss: true, wait: 3.5 },
        },
        {
          name: 'htmlSettings with wait clamping high',
          input: { type: 'html', htmlSettings: { wait: 10 } },
          expectedProps: { wait: 5 },
        },
        {
          name: 'htmlSettings with wait clamping low',
          input: { type: 'html', htmlSettings: { wait: -2 } },
          expectedProps: { wait: 0 },
        },
        {
          name: 'htmlSettings with string wait conversion',
          input: { type: 'html', htmlSettings: { wait: '4.2' } },
          expectedProps: { wait: 4.2 },
        },
        {
          name: 'htmlSettings with invalid wait',
          input: { type: 'html', htmlSettings: { wait: 'invalid' } },
          expectedProps: { wait: 2 },
        },
        {
          name: 'htmlSettings with undefined html property',
          input: { type: 'html', htmlSettings: { html: undefined, tailwindcss: false } },
          expectedProps: { tailwindcss: false },
        },
      ];

      test.each(htmlSettingsTestCases)('should handle $name', ({ input, expectedProps }) => {
        const result = processBasicElement(input);
        Object.entries(expectedProps).forEach(([key, value]) => {
          expect(result[key]).toBe(value);
        });
        expect(result.htmlSettings).toBeUndefined();
      });
    });

    describe('audiogramSettings collection', () => {
      const audiogramSettingsTestCases = [
        {
          name: 'complete audiogramSettings collection',
          input: {
            type: 'audiogram',
            audiogramSettings: { color: '#FF0000', opacity: 0.7, amplitude: 8 },
          },
          expectedProps: { color: '#FF0000', opacity: 0.7, amplitude: 8 },
        },
        {
          name: 'audiogramSettings with opacity clamping high',
          input: { type: 'audiogram', audiogramSettings: { opacity: 1.5 } },
          expectedProps: { opacity: 1 },
        },
        {
          name: 'audiogramSettings with opacity clamping low',
          input: { type: 'audiogram', audiogramSettings: { opacity: -0.5 } },
          expectedProps: { opacity: 0 },
        },
        {
          name: 'audiogramSettings with amplitude clamping high',
          input: { type: 'audiogram', audiogramSettings: { amplitude: 15 } },
          expectedProps: { amplitude: 10 },
        },
        {
          name: 'audiogramSettings with amplitude clamping low',
          input: { type: 'audiogram', audiogramSettings: { amplitude: -2 } },
          expectedProps: { amplitude: 0 },
        },
        {
          name: 'audiogramSettings with invalid opacity',
          input: { type: 'audiogram', audiogramSettings: { opacity: 'invalid' } },
          expectedProps: { opacity: 0.5 },
        },
        {
          name: 'audiogramSettings with invalid amplitude',
          input: { type: 'audiogram', audiogramSettings: { amplitude: 'invalid' } },
          expectedProps: { amplitude: 5 },
        },
      ];

      test.each(audiogramSettingsTestCases)('should handle $name', ({ input, expectedProps }) => {
        const result = processBasicElement(input);
        Object.entries(expectedProps).forEach(([key, value]) => {
          expect(result[key]).toBe(value);
        });
        expect(result.audiogramSettings).toBeUndefined();
      });
    });

    describe('individual property processing', () => {
      const individualPropertyTestCases = [
        {
          name: 'individual duration and start properties',
          input: { type: 'audio', duration: '3.7', start: '-1.5', volume: 15, loop: false },
          expectedProps: { duration: 3.7, start: 0, volume: 15, loop: false },
        },
        {
          name: 'special duration value -1',
          input: { type: 'video', duration: -1 },
          expectedProps: { duration: -1 },
        },
        {
          name: 'special duration value -2',
          input: { type: 'video', duration: -2 },
          expectedProps: { duration: -2 },
        },
        {
          name: 'string duration conversion',
          input: { type: 'video', duration: '5.5' },
          expectedProps: { duration: 5.5 },
        },
        {
          name: 'invalid duration string',
          input: { type: 'video', duration: 'invalid' },
          expectedProps: { duration: 'invalid' },
        },
        {
          name: 'string start conversion',
          input: { type: 'video', start: '2.5' },
          expectedProps: { start: 2.5 },
        },
        {
          name: 'invalid start string',
          input: { type: 'video', start: 'invalid' },
          expectedProps: { start: 'invalid' },
        },
      ];

      test.each(individualPropertyTestCases)('should handle $name', ({ input, expectedProps }) => {
        const result = processBasicElement(input);
        Object.entries(expectedProps).forEach(([key, value]) => {
          expect(result[key]).toBe(value);
        });
      });
    });

    describe('camelCase to kebab-case conversion', () => {
      const kebabCaseTestCases = [
        {
          name: 'camelCase properties',
          input: { type: 'component', customProperty: 'value', anotherCamelCase: 'test' },
          expectedProps: { 'custom-property': 'value', 'another-camel-case': 'test' },
        },
        {
          name: 'no special properties',
          input: { type: 'video', src: 'video.mp4' },
          expectedProps: { type: 'video', src: 'video.mp4' },
        },
      ];

      test.each(kebabCaseTestCases)('should handle $name', ({ input, expectedProps }) => {
        const result = processBasicElement(input);
        Object.entries(expectedProps).forEach(([key, value]) => {
          expect(result[key]).toBe(value);
        });
      });
    });
  });

  describe('convertCamelToKebab', () => {
    const camelToKebabTestCases = [
      { input: null, expected: null, description: 'null input' },
      { input: undefined, expected: undefined, description: 'undefined input' },
      { input: 'string', expected: 'string', description: 'string primitive' },
      { input: 123, expected: 123, description: 'number primitive' },
      { input: true, expected: true, description: 'boolean true' },
      { input: false, expected: false, description: 'boolean false' },
    ];

    test.each(camelToKebabTestCases)('should handle $description', ({ input, expected }) => {
      expect(convertCamelToKebab(input)).toBe(expected);
    });

    const objectTestCases = [
      {
        name: 'array elements',
        input: [{ camelCase: 'value' }, { anotherCamel: 'test' }],
        expected: [{ 'camel-case': 'value' }, { 'another-camel': 'test' }],
      },
      {
        name: 'object keys conversion',
        input: {
          camelCase: 'value',
          anotherCamelCase: 'test',
          normalkey: 'normal',
          PascalCase: 'pascal',
          multiWordCamelCase: 'multi',
        },
        expected: {
          'camel-case': 'value',
          'another-camel-case': 'test',
          normalkey: 'normal',
          '-pascal-case': 'pascal',
          'multi-word-camel-case': 'multi',
        },
      },
      {
        name: 'nested objects',
        input: {
          outerCamel: {
            innerCamel: 'value',
            deepNested: { veryDeepCamel: 'deep' },
          },
        },
        expected: {
          'outer-camel': {
            'inner-camel': 'value',
            'deep-nested': { 'very-deep-camel': 'deep' },
          },
        },
      },
      {
        name: 'mixed arrays and objects',
        input: {
          arrayProp: [{ itemCamel: 'value' }],
          objectProp: { nestedCamel: 'nested' },
        },
        expected: {
          'array-prop': [{ 'item-camel': 'value' }],
          'object-prop': { 'nested-camel': 'nested' },
        },
      },
    ];

    test.each(objectTestCases)('should handle $name', ({ input, expected }) => {
      expect(convertCamelToKebab(input)).toEqual(expected);
    });
  });

  describe('processCommonProperties', () => {
    const commonPropertiesTestCases = [
      {
        name: 'complete element with all properties',
        input: {
          id: 'test-id',
          comment: 'test comment',
          condition: 'test condition',
          variables: { var1: 'value1' },
          cache: true,
          otherProp: 'other',
        },
        shouldBeCopy: true,
      },
      {
        name: 'empty object',
        input: {},
        shouldBeCopy: true,
      },
    ];

    test.each(commonPropertiesTestCases)('should handle $name', ({ input, shouldBeCopy }) => {
      const result = processCommonProperties(input);
      expect(result).toEqual(input);
      if (shouldBeCopy) {
        expect(result).not.toBe(input);
      }
    });
  });

  describe('processLoop', () => {
    const loopTestCases = [
      { input: true, expected: -1, description: 'boolean true' },
      { input: false, expected: 1, description: 'boolean false' },
      { input: '5', expected: 5, description: 'string number' },
      { input: '0', expected: 0, description: 'string zero' },
      { input: '-1', expected: -1, description: 'string negative' },
      { input: 3, expected: 3, description: 'positive number' },
      { input: 0, expected: 0, description: 'zero number' },
      { input: -1, expected: -1, description: 'negative number' },
      { input: 'invalid', expected: -1, description: 'invalid string' },
      { input: NaN, expected: -1, description: 'NaN input' },
    ];

    test.each(loopTestCases)('should handle $description', ({ input, expected }) => {
      expect(processLoop(input)).toBe(expected);
    });
  });

  describe('processVolume', () => {
    const volumeTestCases = [
      { input: '5.5', expected: 5.5, description: 'string number' },
      { input: '0', expected: 0, description: 'string zero' },
      { input: '10', expected: 10, description: 'string max' },
      { input: 7.3, expected: 7.3, description: 'numeric input' },
      { input: 0, expected: 0, description: 'zero input' },
      { input: 10, expected: 10, description: 'max input' },
      { input: -5, expected: 0, description: 'negative clamping' },
      { input: '-3.2', expected: 0, description: 'negative string clamping' },
      { input: 15, expected: 10, description: 'positive clamping' },
      { input: '12.8', expected: 10, description: 'positive string clamping' },
      { input: 'invalid', expected: 1, description: 'invalid string' },
      { input: NaN, expected: 1, description: 'NaN input' },
    ];

    test.each(volumeTestCases)('should handle $description', ({ input, expected }) => {
      expect(processVolume(input)).toBe(expected);
    });
  });

  describe('processDuration', () => {
    const durationTestCases = [
      { input: '5.5', expected: 5.5, description: 'string number' },
      { input: '0', expected: 0, description: 'string zero' },
      { input: 3.7, expected: 3.7, description: 'numeric input' },
      { input: 0, expected: 0, description: 'zero input' },
      { input: -1, expected: -1, description: 'special value -1 (auto)' },
      { input: '-1', expected: -1, description: 'string special value -1' },
      { input: -2, expected: -2, description: 'special value -2 (scene length)' },
      { input: '-2', expected: -2, description: 'string special value -2' },
      { input: -5, expected: 0, description: 'other negative clamping' },
      { input: '-3.2', expected: 0, description: 'other negative string clamping' },
      { input: 'invalid', expected: -1, description: 'invalid string' },
      { input: NaN, expected: -1, description: 'NaN input' },
    ];

    test.each(durationTestCases)('should handle $description', ({ input, expected }) => {
      expect(processDuration(input)).toBe(expected);
    });
  });

  describe('processStart', () => {
    const startTestCases = [
      { input: '5.5', expected: 5.5, description: 'string number' },
      { input: '0', expected: 0, description: 'string zero' },
      { input: 3.7, expected: 3.7, description: 'numeric input' },
      { input: 0, expected: 0, description: 'zero input' },
      { input: -5, expected: 0, description: 'negative clamping' },
      { input: '-3.2', expected: 0, description: 'negative string clamping' },
      { input: 'invalid', expected: 0, description: 'invalid string' },
      { input: NaN, expected: 0, description: 'NaN input' },
    ];

    test.each(startTestCases)('should handle $description', ({ input, expected }) => {
      expect(processStart(input)).toBe(expected);
    });
  });

  describe('processDimension', () => {
    const dimensionTestCases = [
      { input: '100', expected: 100, description: 'string number' },
      { input: '50.5', expected: 50.5, description: 'string decimal' },
      { input: 200, expected: 200, description: 'numeric input' },
      { input: 0, expected: 0, description: 'zero input' },
      { input: -1, expected: -1, description: 'special value -1 (default)' },
      { input: '-1', expected: -1, description: 'string special value -1' },
      { input: -5, expected: 0, description: 'other negative clamping' },
      { input: '-3.2', expected: 0, description: 'other negative string clamping' },
      { input: 'invalid', expected: -1, description: 'invalid string' },
      { input: NaN, expected: -1, description: 'NaN input' },
    ];

    test.each(dimensionTestCases)('should handle $description', ({ input, expected }) => {
      expect(processDimension(input)).toBe(expected);
    });
  });

  describe('processFontSize', () => {
    const fontSizeTestCases = [
      { input: 16, expected: 16, description: 'positive number' },
      { input: 0, expected: 1, description: 'zero clamping' },
      { input: -5, expected: 1, description: 'negative clamping' },
      { input: '16px', expected: 16, description: 'px string' },
      { input: '12.5px', expected: 12.5, description: 'decimal px string' },
      { input: '1.2em', expected: 1.2, description: 'em string' },
      { input: '2.5em', expected: 2.5, description: 'decimal em string' },
      { input: '1.5rem', expected: 1.5, description: 'rem string' },
      { input: 'invalid', expected: 'invalid', description: 'non-matching string' },
      { input: 'large', expected: 'large', description: 'text string' },
      { input: {}, expected: {}, description: 'object input' },
      { input: [], expected: [], description: 'array input' },
      { input: null, expected: null, description: 'null input' },
    ];

    test.each(fontSizeTestCases)('should handle $description', ({ input, expected }) => {
      expect(processFontSize(input)).toEqual(expected);
    });
  });

  describe('getProcessor', () => {
    const supportedProcessorTestCases = [
      { type: 'text', processor: processTextElement },
      { type: 'subtitles', processor: processSubtitleElement },
      { type: 'video', processor: processBasicElement },
      { type: 'audio', processor: processBasicElement },
      { type: 'image', processor: processBasicElement },
      { type: 'voice', processor: processBasicElement },
      { type: 'component', processor: processBasicElement },
      { type: 'audiogram', processor: processBasicElement },
      { type: 'html', processor: processBasicElement },
    ];

    test.each(supportedProcessorTestCases)('should return $processor.name for $type', ({ type, processor }) => {
      expect(getProcessor(type)).toBe(processor);
    });

    const unsupportedProcessorTestCases = [
      { type: 'unknown' },
      { type: '' },
      { type: 'custom' },
      { type: 'invalid' },
    ];

    test.each(unsupportedProcessorTestCases)('should return null for unsupported type: $type', ({ type }) => {
      expect(getProcessor(type)).toBe(null);
    });
  });

  describe('getSupportedElementTypes', () => {
    it('should return array of all supported element types', () => {
      const result = getSupportedElementTypes();
      expect(result).toEqual(['video', 'audio', 'image', 'text', 'voice', 'component', 'audiogram', 'html', 'subtitles']);
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('isElementTypeSupported', () => {
    const supportedTypeTestCases = [
      { type: 'text' },
      { type: 'subtitles' },
      { type: 'video' },
      { type: 'audio' },
      { type: 'image' },
      { type: 'voice' },
      { type: 'component' },
      { type: 'audiogram' },
      { type: 'html' },
    ];

    test.each(supportedTypeTestCases)('should return true for supported type: $type', ({ type }) => {
      expect(isElementTypeSupported(type)).toBe(true);
    });

    const unsupportedTypeTestCases = [
      { type: 'unknown' },
      { type: 'custom' },
      { type: '' },
      { type: 'invalid' },
    ];

    test.each(unsupportedTypeTestCases)('should return false for unsupported type: $type', ({ type }) => {
      expect(isElementTypeSupported(type)).toBe(false);
    });
  });
});