// __tests__/nodes/CreateJ2vMovie/core/processors/voiceProcessor.test.ts

import { processVoiceElement } from '../../../../../nodes/CreateJ2vMovie/core/processors/voiceProcessor';

describe('voiceProcessor', () => {
  describe('processVoiceElement', () => {
    
    describe('voice-specific properties', () => {
      it.each([
        ['basic voice element', { type: 'voice', text: 'Hello World' }, { type: 'voice', text: 'Hello World' }],
        ['voice with specific voice ID', { type: 'voice', text: 'Test', voice: 'en-US-JennyNeural' }, { type: 'voice', text: 'Test', voice: 'en-US-JennyNeural' }],
        ['voice with Azure model', { type: 'voice', text: 'Test', model: 'azure' }, { type: 'voice', text: 'Test', model: 'azure' }],
        ['voice with ElevenLabs model', { type: 'voice', text: 'Test', model: 'elevenlabs' }, { type: 'voice', text: 'Test', model: 'elevenlabs' }],
        ['voice with ElevenLabs Flash model', { type: 'voice', text: 'Test', model: 'elevenlabs-flash-v2-5' }, { type: 'voice', text: 'Test', model: 'elevenlabs-flash-v2-5' }],
        ['voice with connection', { type: 'voice', text: 'Test', connection: 'my-tts-connection' }, { type: 'voice', text: 'Test', connection: 'my-tts-connection' }],
        ['voice with volume', { type: 'voice', text: 'Test', volume: 0.8 }, { type: 'voice', text: 'Test', volume: 0.8 }],
        ['voice with string volume', { type: 'voice', text: 'Test', volume: '2.5' }, { type: 'voice', text: 'Test', volume: 2.5 }],
        ['voice with high volume clamped', { type: 'voice', text: 'Test', volume: 15 }, { type: 'voice', text: 'Test', volume: 10 }],
        ['voice with negative volume clamped', { type: 'voice', text: 'Test', volume: -3 }, { type: 'voice', text: 'Test', volume: 0 }],
        ['voice with muted true', { type: 'voice', text: 'Test', muted: true }, { type: 'voice', text: 'Test', muted: true }],
        ['voice with muted false', { type: 'voice', text: 'Test', muted: false }, { type: 'voice', text: 'Test', muted: false }]
      ])('should process %s', (_, input, expected) => {
        const result = processVoiceElement(input);
        expect(result).toEqual(expected);
      });

      it('should preserve unknown voice properties', () => {
        const input = {
          type: 'voice',
          text: 'Test with custom props',
          customVoiceProperty: 'custom-value',
          experimentalFeature: true,
          metadata: { source: 'test' }
        };

        const result = processVoiceElement(input);
        
        expect(result.customVoiceProperty).toBe('custom-value');
        expect(result.experimentalFeature).toBe(true);
        expect(result.metadata).toEqual({ source: 'test' });
      });

      it('should handle voice with only type property', () => {
        const input = { type: 'voice' };
        const result = processVoiceElement(input);
        
        expect(result).toEqual({ type: 'voice' });
      });

      it.each([
        ['empty text string', { type: 'voice', text: '' }, { text: '' }],
        ['long text content', { type: 'voice', text: 'This is a very long text that should be synthesized into speech using the specified voice model and configuration settings.' }, { text: 'This is a very long text that should be synthesized into speech using the specified voice model and configuration settings.' }],
        ['text with special characters', { type: 'voice', text: 'Hello! How are you? I\'m doing well, thanks.' }, { text: 'Hello! How are you? I\'m doing well, thanks.' }],
        ['text with numbers', { type: 'voice', text: 'The temperature is 25 degrees Celsius.' }, { text: 'The temperature is 25 degrees Celsius.' }]
      ])('should handle text variations: %s', (_, input, expectedSubset) => {
        const result = processVoiceElement(input);
        expect(result).toMatchObject(expectedSubset);
      });

      it.each([
        ['string muted value', { type: 'voice', text: 'Test', muted: 'yes' }, { muted: true }],
        ['numeric muted value', { type: 'voice', text: 'Test', muted: 1 }, { muted: true }],
        ['zero muted value', { type: 'voice', text: 'Test', muted: 0 }, { muted: false }],
        ['empty string muted', { type: 'voice', text: 'Test', muted: '' }, { muted: false }]
      ])('should handle muted type coercion: %s', (_, input, expectedSubset) => {
        const result = processVoiceElement(input);
        expect(result).toMatchObject(expectedSubset);
      });
    });

    describe('common properties integration', () => {
      it.each([
        ['timing properties', { type: 'voice', text: 'Timed speech', start: 3, duration: 8 }, { start: 3, duration: 8 }],
        ['string timing values', { type: 'voice', text: 'Timed speech', start: '1.5', duration: '12.3' }, { start: 1.5, duration: 12.3 }],
        ['special duration -1 auto', { type: 'voice', text: 'Auto duration', duration: -1 }, { duration: -1 }],
        ['special duration -2 match container', { type: 'voice', text: 'Match container', duration: -2 }, { duration: -2 }],
        ['negative start clamped', { type: 'voice', text: 'Clamped start', start: -2 }, { start: 0 }],
        ['zero duration', { type: 'voice', text: 'Zero duration', duration: 0 }, { duration: 0 }],
        ['decimal timing', { type: 'voice', text: 'Decimal timing', start: 2.5, duration: 7.3 }, { start: 2.5, duration: 7.3 }]
      ])('should handle %s', (_, input, expectedSubset) => {
        const result = processVoiceElement(input);
        expect(result).toMatchObject(expectedSubset);
      });

    describe('common properties integration', () => {
      it.each([
        ['timing properties', { type: 'voice', text: 'Timed speech', start: 3, duration: 8 }, { start: 3, duration: 8 }],
        ['string timing values', { type: 'voice', text: 'Timed speech', start: '1.5', duration: '12.3' }, { start: 1.5, duration: 12.3 }],
        ['special duration -1 auto', { type: 'voice', text: 'Auto duration', duration: -1 }, { duration: -1 }],
        ['special duration -2 match container', { type: 'voice', text: 'Match container', duration: -2 }, { duration: -2 }],
        ['negative start clamped', { type: 'voice', text: 'Clamped start', start: -2 }, { start: 0 }],
        ['zero duration', { type: 'voice', text: 'Zero duration', duration: 0 }, { duration: 0 }],
        ['decimal timing', { type: 'voice', text: 'Decimal timing', start: 2.5, duration: 7.3 }, { start: 2.5, duration: 7.3 }]
      ])('should handle %s', (_, input, expectedSubset) => {
        const result = processVoiceElement(input);
        expect(result).toMatchObject(expectedSubset);
      });

      it('should convert camelCase fade properties', () => {
        const input = { type: 'voice', text: 'Fades', fadeIn: 1, fadeOut: 2 };
        const result = processVoiceElement(input);
        
        expect(result).toMatchObject({ 'fade-in': 1, 'fade-out': 2 });
        expect(result).not.toHaveProperty('fadeIn');
        expect(result).not.toHaveProperty('fadeOut');
      });

      it('should convert camelCase z-index', () => {
        const input = { type: 'voice', text: 'Z-order', zIndex: 3 };
        const result = processVoiceElement(input);
        
        expect(result).toMatchObject({ 'z-index': 3 });
        expect(result).not.toHaveProperty('zIndex');
      });

      it('should convert camelCase extra time', () => {
        const input = { type: 'voice', text: 'Extra time', extraTime: 1.5 };
        const result = processVoiceElement(input);
        
        expect(result).toMatchObject({ 'extra-time': 1.5 });
        expect(result).not.toHaveProperty('extraTime');
      });

      it('should convert camelCase background color', () => {
        const input = { type: 'voice', text: 'Background', backgroundColor: '#FF0000' };
        const result = processVoiceElement(input);
        
        expect(result).toMatchObject({ 'background-color': '#FF0000' });
        expect(result).not.toHaveProperty('backgroundColor');
      });
    });
    });

    describe('comprehensive integration', () => {
      it('should handle complete voice element with all supported properties', () => {
        const input = {
          type: 'voice',
          text: 'This is a comprehensive test of voice synthesis with all available properties configured.',
          voice: 'en-GB-RyanNeural',
          model: 'azure',
          connection: 'azure-speech-connection',
          volume: 8.5,
          muted: false,
          // Common timing properties
          start: 5,
          duration: 25,
          fadeIn: 1.5,
          fadeOut: 2.0,
          zIndex: 2,
          extraTime: 0.5,
          // Additional properties
          id: 'voice-element-1',
          comment: 'Main narration voice',
          cache: true
        };

        const result = processVoiceElement(input);

        expect(result).toMatchObject({
          type: 'voice',
          text: 'This is a comprehensive test of voice synthesis with all available properties configured.',
          voice: 'en-GB-RyanNeural',
          model: 'azure',
          connection: 'azure-speech-connection',
          volume: 8.5,
          muted: false,
          start: 5,
          duration: 25,
          'fade-in': 1.5,
          'fade-out': 2.0,
          'z-index': 2,
          'extra-time': 0.5,
          id: 'voice-element-1',
          comment: 'Main narration voice',
          cache: true
        });

        // Verify camelCase properties removed
        expect(result).not.toHaveProperty('fadeIn');
        expect(result).not.toHaveProperty('fadeOut');
        expect(result).not.toHaveProperty('zIndex');
        expect(result).not.toHaveProperty('extraTime');
      });

      it('should handle voice element with minimal required properties', () => {
        const input = { type: 'voice', text: 'Minimal voice test' };
        const result = processVoiceElement(input);
        
        expect(result).toEqual({
          type: 'voice',
          text: 'Minimal voice test'
        });
      });
    });

    describe('error handling and edge cases', () => {
      it.each([
        ['invalid volume string', { type: 'voice', text: 'Test', volume: 'loud' }, { volume: 1 }],
        ['NaN volume', { type: 'voice', text: 'Test', volume: NaN }, { volume: 1 }],
        ['invalid duration string', { type: 'voice', text: 'Test', duration: 'forever' }, { duration: -1 }],
        ['NaN duration', { type: 'voice', text: 'Test', duration: NaN }, { duration: -1 }],
        ['invalid start string', { type: 'voice', text: 'Test', start: 'beginning' }, { start: 0 }],
        ['NaN start', { type: 'voice', text: 'Test', start: NaN }, { start: 0 }],
        ['null text preserved', { type: 'voice', text: null }, { text: null }],
        ['undefined properties ignored', { type: 'voice', text: 'Test', voice: undefined, model: undefined }, { text: 'Test' }]
      ])('should handle invalid values gracefully: %s', (_, input, expectedSubset) => {
        const result = processVoiceElement(input);
        expect(result).toMatchObject(expectedSubset);
      });

      it('should preserve voice-specific model values', () => {
        const supportedModels = ['azure', 'elevenlabs', 'elevenlabs-flash-v2-5'];
        
        supportedModels.forEach(model => {
          const input = { type: 'voice', text: 'Model test', model };
          const result = processVoiceElement(input);
          expect(result.model).toBe(model);
        });
      });

      it('should handle voice configurations separately', () => {
        // Test voice property
        const voiceInput = { type: 'voice', text: 'Voice test', voice: 'es-ES-ElviraNeural' };
        const voiceResult = processVoiceElement(voiceInput);
        expect(voiceResult.voice).toBe('es-ES-ElviraNeural');

        // Test connection property
        const connectionInput = { type: 'voice', text: 'Connection test', connection: 'prod-tts-service-v2' };
        const connectionResult = processVoiceElement(connectionInput);
        expect(connectionResult.connection).toBe('prod-tts-service-v2');

        // Test model and connection together
        const combinedInput = { type: 'voice', text: 'Combined test', model: 'elevenlabs-flash-v2-5', connection: 'elevenlabs-premium' };
        const combinedResult = processVoiceElement(combinedInput);
        expect(combinedResult.model).toBe('elevenlabs-flash-v2-5');
        expect(combinedResult.connection).toBe('elevenlabs-premium');
      });
    });
  });
});