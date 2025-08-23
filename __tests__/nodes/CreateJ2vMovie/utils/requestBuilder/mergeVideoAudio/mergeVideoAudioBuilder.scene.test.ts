// __tests__/nodes/CreateJ2vMovie/utils/requestBuilder/mergeVideoAudio/mergeVideoAudioBuilder.scene.test.ts

import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { buildMergeVideoAudioRequestBody } from '@nodes/CreateJ2vMovie/utils/requestBuilder';
import { createMockExecute } from '../shared/mockHelpers';

/**
 * Scene-level elements tests for mergeVideoAudioBuilder
 * Tests scene-level text elements, validation, and error handling
 */
describe('mergeVideoAudioBuilder - Scene-Level Elements', () => {

    describe('Scene-Level Text Elements', () => {

        test('should process scene-level text elements correctly', () => {
            const mockExecute = createMockExecute({
                'textElements.textDetails': [{
                    text: 'Scene Caption',
                    style: '002',
                    fontFamily: 'Helvetica',
                    fontSize: '18px',
                    fontColor: '#000000',
                    position: 'bottom-center',
                    start: 2,
                    duration: 8
                }]
            });

            const result = buildMergeVideoAudioRequestBody.call(mockExecute as unknown as IExecuteFunctions);

            expect(result.scenes[0].elements).toHaveLength(1);
            const textElement = result.scenes[0].elements[0];
            expect(textElement).toMatchObject({
                type: 'text',
                text: 'Scene Caption',
                style: '002',
                position: 'bottom-center',
                start: 2,
                duration: 8
            });
        });

        test('should process multiple scene-level text elements', () => {
            const mockExecute = createMockExecute({
                'textElements.textDetails': [
                    { text: 'First Caption', style: '001', position: 'top-left' },
                    { text: 'Second Caption', style: '002', position: 'bottom-right' }
                ]
            });

            const result = buildMergeVideoAudioRequestBody.call(mockExecute as unknown as IExecuteFunctions);

            expect(result.scenes[0].elements).toHaveLength(2);
            expect(result.scenes[0].elements[0]).toHaveProperty('text', 'First Caption');
            expect(result.scenes[0].elements[1]).toHaveProperty('text', 'Second Caption');
        });

        test('should combine scene text elements with video and audio', () => {
            const mockExecute = createMockExecute({
                'textElements.textDetails': [{ text: 'Scene Overlay', style: '001' }],
                'videoElement': { videoDetails: { src: 'https://example.com/video.mp4' } },
                'audioElement': { audioDetails: { src: 'https://example.com/audio.mp3' } }
            });

            const result = buildMergeVideoAudioRequestBody.call(mockExecute as unknown as IExecuteFunctions);

            expect(result.scenes[0].elements).toHaveLength(3);
            expect(result.scenes[0].elements.find(el => el.type === 'video')).toBeDefined();
            expect(result.scenes[0].elements.find(el => el.type === 'audio')).toBeDefined();
            expect(result.scenes[0].elements.find(el => el.type === 'text')).toBeDefined();
        });
    });
});

describe('Scene Text Elements Parameter Handling', () => {

    test('should process sceneTextElements.textDetails parameter', () => {
        const mockExecute = createMockExecute({
            'sceneTextElements.textDetails': [{
                text: 'Scene-specific Text',
                style: '003',
                position: 'center-center'
            }]
        });

        const result = buildMergeVideoAudioRequestBody.call(mockExecute as unknown as IExecuteFunctions);

        expect(result.scenes[0].elements).toHaveLength(1);
        expect(result.scenes[0].elements[0]).toMatchObject({
            type: 'text',
            text: 'Scene-specific Text',
            style: '003'
        });
    });

    test('should handle missing sceneTextElements parameter gracefully', () => {
        const mockExecute = {
            getNodeParameter: (parameterName: string, itemIndex: number, fallbackValue?: any) => {
                if (parameterName === 'sceneTextElements.textDetails') {
                    throw new Error('Parameter does not exist');
                }
                return fallbackValue;
            },
            logger: {
                debug: jest.fn(),
                warn: jest.fn(),
                info: jest.fn(),
                error: jest.fn(),
            }
        };

        expect(() => {
            buildMergeVideoAudioRequestBody.call(mockExecute as unknown as IExecuteFunctions);
        }).not.toThrow();
    });

    test('should combine both sceneTextElements and textElements', () => {
        const mockExecute = createMockExecute({
            'sceneTextElements.textDetails': [{ text: 'Scene Text 1', style: '001' }],
            'textElements.textDetails': [{ text: 'Scene Text 2', style: '002' }]
        });

        const result = buildMergeVideoAudioRequestBody.call(mockExecute as unknown as IExecuteFunctions);

        expect(result.scenes[0].elements).toHaveLength(2);
        const textElements = result.scenes[0].elements.filter(el => el.type === 'text');
        expect(textElements[0]).toHaveProperty('text', 'Scene Text 1');
        expect(textElements[1]).toHaveProperty('text', 'Scene Text 2');
    });

});

describe('Error Handling and Validation', () => {

    test('should handle text element validation errors', () => {
        const mockExecute = createMockExecute({
            'textElements.textDetails': [
                { style: '001' }, // missing text property
                { text: 'Valid Text', style: '002' }
            ]
        });

        expect(() => {
            buildMergeVideoAudioRequestBody.call(mockExecute as unknown as IExecuteFunctions);
        }).toThrow('Text element validation errors');
    });
});

describe('Error Coverage Tests', () => {

    test('should cover video element processing error paths (line 33)', () => {
        const mockExecute = createMockExecute({
            'videoElement': { videoDetails: { src: 'https://example.com/video.mp4' } }
        });

        const shared = require('@nodes/CreateJ2vMovie/utils/requestBuilder/shared');
        const originalProcessVideoElements = shared.processVideoElements;

        // Test with error message
        shared.processVideoElements = jest.fn(() => { throw new Error('Mock error'); });
        expect(() => {
            buildMergeVideoAudioRequestBody.call(mockExecute as unknown as IExecuteFunctions);
        }).toThrow('Video element processing failed: Mock error');

        // Test without error message  
        shared.processVideoElements = jest.fn(() => {
            const error = new Error();
            error.message = '';
            throw error;
        });
        expect(() => {
            buildMergeVideoAudioRequestBody.call(mockExecute as unknown as IExecuteFunctions);
        }).toThrow('Video element processing failed: Unknown error');

        shared.processVideoElements = originalProcessVideoElements;
    });

    test('should cover audio element processing error paths (line 44)', () => {
        const mockExecute = createMockExecute({
            'audioElement': { audioDetails: { src: 'https://example.com/audio.mp3' } }
        });

        const shared = require('@nodes/CreateJ2vMovie/utils/requestBuilder/shared');
        const originalProcessAudioElements = shared.processAudioElements;

        // Test with error message
        shared.processAudioElements = jest.fn(() => { throw new Error('Mock audio error'); });
        expect(() => {
            buildMergeVideoAudioRequestBody.call(mockExecute as unknown as IExecuteFunctions);
        }).toThrow('Audio element processing failed: Mock audio error');

        // Test without error message
        shared.processAudioElements = jest.fn(() => {
            const error = { message: null };
            throw error;
        });
        expect(() => {
            buildMergeVideoAudioRequestBody.call(mockExecute as unknown as IExecuteFunctions);
        }).toThrow('Audio element processing failed: Unknown error');

        shared.processAudioElements = originalProcessAudioElements;
    });

    test('should cover scene validation error path (line 61)', () => {
        const mockExecute = createMockExecute({
            'videoElement': { videoDetails: { src: 'https://example.com/video.mp4' } },
            'sceneTextElements.textDetails': [{ text: 'Test text', style: '001' }]
        });

        const validationUtils = require('@nodes/CreateJ2vMovie/utils/validationUtils');
        const originalValidateSceneElements = validationUtils.validateSceneElements;

        validationUtils.validateSceneElements = jest.fn(() => ['Mock validation error']);

        expect(() => {
            buildMergeVideoAudioRequestBody.call(mockExecute as unknown as IExecuteFunctions);
        }).toThrow('Scene element validation errors:\nMock validation error');

        validationUtils.validateSceneElements = originalValidateSceneElements;
    });
});
