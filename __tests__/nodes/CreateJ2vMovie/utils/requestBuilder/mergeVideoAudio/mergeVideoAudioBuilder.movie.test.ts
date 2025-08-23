// __tests__/nodes/CreateJ2vMovie/utils/requestBuilder/mergeVideoAudio/mergeVideoAudioBuilder.movie.test.ts

import { IExecuteFunctions } from 'n8n-workflow';
import { buildMergeVideoAudioRequestBody } from '@nodes/CreateJ2vMovie/utils/requestBuilder';
import { createMockExecute } from '../shared/mockHelpers';

/**
 * Movie-level elements tests for mergeVideoAudioBuilder
 * Tests movie-level text elements and their processing
 */
describe('mergeVideoAudioBuilder - Movie-Level Elements', () => {

  describe('Movie-Level Text Elements', () => {

    test('should process movie-level text elements correctly', () => {
      const mockExecute = createMockExecute({
        'movieTextElements.textDetails': [{
          text: 'Global Title',
          style: '001',
          fontFamily: 'Arial',
          fontSize: '24px',
          fontColor: '#FFFFFF',
          position: 'top-center',
          start: 0,
          duration: 5
        }]
      });

      const result = buildMergeVideoAudioRequestBody.call(mockExecute as unknown as IExecuteFunctions);

      expect(result).toHaveProperty('elements');
      expect(Array.isArray(result.elements)).toBe(true);
      expect(result.elements).toHaveLength(1);
      
      const textElement = result.elements![0];
      expect(textElement).toMatchObject({
        type: 'text',
        text: 'Global Title',
        style: '001',
        position: 'top-center',
        start: 0,
        duration: 5
      });
    });

    test('should process multiple movie-level text elements', () => {
      const mockExecute = createMockExecute({
        'movieTextElements.textDetails': [
          { text: 'Title', style: '001', position: 'top-center', start: 0, duration: 3 },
          { text: 'Subtitle', style: '002', position: 'bottom-center', start: 3, duration: 3 }
        ]
      });

      const result = buildMergeVideoAudioRequestBody.call(mockExecute as unknown as IExecuteFunctions);

      expect(result.elements).toHaveLength(2);
      
      const titleElement = result.elements![0];
      const subtitleElement = result.elements![1];
      
      expect(titleElement).toMatchObject({
        text: 'Title',
        style: '001',
        position: 'top-center'
      });
      
      expect(subtitleElement).toMatchObject({
        text: 'Subtitle',
        style: '002',
        position: 'bottom-center'
      });
    });

    test('should handle movie text elements with full styling options', () => {
      const mockExecute = createMockExecute({
        'movieTextElements.textDetails': [{
          text: 'Styled Text',
          style: '003',
          fontFamily: 'Roboto',
          fontSize: '32px',
          fontWeight: 600,
          fontColor: '#FF0000',
          backgroundColor: 'rgba(0,0,0,0.8)',
          textAlign: 'center',
          lineHeight: '1.5',
          letterSpacing: '2px',
          position: 'center-center',
          start: 0,
          duration: 10
        }]
      });

      const result = buildMergeVideoAudioRequestBody.call(mockExecute as unknown as IExecuteFunctions);

      const textElement = result.elements![0];
      expect(textElement).toHaveProperty('type', 'text');
      expect(textElement).toHaveProperty('text', 'Styled Text');
      expect(textElement).toHaveProperty('style', '003');
      expect(textElement).toHaveProperty('settings');
      
      const settings = textElement.settings;
      expect(settings).toMatchObject({
        'font-family': 'Roboto',
        'font-size': '32px',
        'font-weight': 600,
        'font-color': '#FF0000',
        'background-color': 'rgba(0,0,0,0.8)',
        'text-align': 'center',
        'line-height': '1.5',
        'letter-spacing': '2px'
      });
    });

    test('should handle empty movie text elements gracefully', () => {
      const mockExecute = createMockExecute({
        'movieTextElements.textDetails': []
      });

      const result = buildMergeVideoAudioRequestBody.call(mockExecute as unknown as IExecuteFunctions);

      expect(result.elements).toBeUndefined();
    });

    test('should handle non-array movie text elements parameter', () => {
      const mockExecute = createMockExecute({
        'movieTextElements.textDetails': null
      });

      const result = buildMergeVideoAudioRequestBody.call(mockExecute as unknown as IExecuteFunctions);

      expect(result.elements).toBeUndefined();
    });
  });

  describe('Movie-Level vs Scene-Level Element Separation', () => {

    test('should separate movie-level and scene-level text elements', () => {
      const mockExecute = createMockExecute({
        'movieTextElements.textDetails': [{ text: 'Movie Text', style: '001', position: 'top-center' }],
        'textElements.textDetails': [{ text: 'Scene Text', style: '002', position: 'bottom-center' }],
        videoElement: { videoDetails: { src: 'https://example.com/video.mp4' }}
      });

      const result = buildMergeVideoAudioRequestBody.call(mockExecute as unknown as IExecuteFunctions);

      // Movie-level elements at top level
      expect(result).toHaveProperty('elements');
      expect(result.elements).toHaveLength(1);
      expect(result.elements![0]).toHaveProperty('text', 'Movie Text');

      // Scene-level elements in scene
      expect(result.scenes[0].elements).toHaveLength(2); // video + scene text
      const sceneTextElement = result.scenes[0].elements.find(el => el.type === 'text');
      expect(sceneTextElement).toHaveProperty('text', 'Scene Text');
    });

    test('should handle movie-level elements without scene elements', () => {
      const mockExecute = createMockExecute({
        'movieTextElements.textDetails': [{ text: 'Solo Movie Text', style: '001' }]
      });

      const result = buildMergeVideoAudioRequestBody.call(mockExecute as unknown as IExecuteFunctions);

      // Should have movie-level elements
      expect(result.elements).toHaveLength(1);
      expect(result.elements![0]).toHaveProperty('text', 'Solo Movie Text');

      // Scene should be empty
      expect(result.scenes[0].elements).toHaveLength(0);
    });
  });

  describe('Movie Text Element Validation', () => {

    test('should validate movie text element with required properties', () => {
      const mockExecute = createMockExecute({
        'movieTextElements.textDetails': [{ text: 'Valid Text', style: '001' }]
      });

      const result = buildMergeVideoAudioRequestBody.call(mockExecute as unknown as IExecuteFunctions);

      const textElement = result.elements![0];
      expect(textElement).toMatchObject({
        type: 'text',
        text: 'Valid Text',
        style: '001'
      });
    });

    test('should handle movie text elements with positioning', () => {
      const mockExecute = createMockExecute({
        'movieTextElements.textDetails': [{
          text: 'Positioned Text',
          style: '003',
          position: 'bottom-right',
          x: 100,
          y: 50
        }]
      });

      const result = buildMergeVideoAudioRequestBody.call(mockExecute as unknown as IExecuteFunctions);

      const textElement = result.elements![0];
      expect(textElement).toMatchObject({
        position: 'bottom-right',
        x: 100,
        y: 50
      });
    });

    test('should handle movie text elements with minimal properties', () => {
      const mockExecute = createMockExecute({
        'movieTextElements.textDetails': [{ text: 'Minimal Text' }]
      });

      const result = buildMergeVideoAudioRequestBody.call(mockExecute as unknown as IExecuteFunctions);

      const textElement = result.elements![0];
      expect(textElement).toMatchObject({
        type: 'text',
        text: 'Minimal Text'
      });
    });
  });

  describe('Movie Element Processing Edge Cases', () => {

    test('should handle movie text elements with special characters', () => {
      const mockExecute = createMockExecute({
        'movieTextElements.textDetails': [{
          text: 'Special chars: áéíóú ñ © ® ™ 🎬',
          style: '001'
        }]
      });

      const result = buildMergeVideoAudioRequestBody.call(mockExecute as unknown as IExecuteFunctions);

      const textElement = result.elements![0];
      expect(textElement).toHaveProperty('text', 'Special chars: áéíóú ñ © ® ™ 🎬');
    });

    test('should handle movie text elements with numeric and boolean values', () => {
      const mockExecute = createMockExecute({
        'movieTextElements.textDetails': [{
          text: 'Numeric Text',
          style: '001',
          start: 0,
          duration: 10.5,
          fontWeight: 700,
          x: 50,
          y: 100
        }]
      });

      const result = buildMergeVideoAudioRequestBody.call(mockExecute as unknown as IExecuteFunctions);

      const textElement = result.elements![0];
      expect(textElement).toMatchObject({
        start: 0,
        duration: 10.5,
        x: 50,
        y: 100
      });
      expect(textElement.settings).toHaveProperty('font-weight', 700);
    });
  });
});