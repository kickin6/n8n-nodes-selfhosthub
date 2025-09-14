// __tests__/nodes/CreateJ2vMovie/shared/elements/settingsObjects.test.ts

import {
    cropSettings,
    rotationSettings,
    chromaKeySettings,
    colorCorrectionSettings
} from '../../../../../nodes/CreateJ2vMovie/shared/elementFields';
import { INodeProperties } from 'n8n-workflow';

describe('settings objects', () => {
    const FIXED_COLLECTION_SETTINGS: Array<[string, INodeProperties]> = [
        ['cropSettings', cropSettings],
        ['rotationSettings', rotationSettings],
        ['chromaKeySettings', chromaKeySettings],
    ];

    const REGULAR_COLLECTION_SETTINGS: Array<[string, INodeProperties]> = [
        ['colorCorrectionSettings', colorCorrectionSettings],
    ];

    const ALL_SETTINGS: Array<[string, INodeProperties]> = [
        ...FIXED_COLLECTION_SETTINGS,
        ...REGULAR_COLLECTION_SETTINGS,
    ];

    describe('basic structure validation', () => {
        test.each(ALL_SETTINGS)('%s should be valid INodeProperties object', (name, settings) => {
            expect(typeof settings).toBe('object');
            expect(settings).not.toBeNull();
            expect(settings.name).toBeDefined();
            expect(settings.displayName).toBeDefined();
            expect(settings.type).toBeDefined();
            expect(settings.default).toBeDefined();
            expect(settings.description).toBeDefined();

            expect(typeof settings.name).toBe('string');
            expect(typeof settings.displayName).toBe('string');
            expect(typeof settings.type).toBe('string');
            expect(typeof settings.description).toBe('string');
            expect(settings.name.length).toBeGreaterThan(0);
            expect(settings.displayName.length).toBeGreaterThan(0);
        });

        test.each(ALL_SETTINGS)('%s should have displayOptions targeting visual elements', (name, settings) => {
            expect(settings.displayOptions).toBeDefined();
            expect(settings.displayOptions!.show).toBeDefined();
            expect(settings.displayOptions!.show!.type).toBeDefined();
            expect(Array.isArray(settings.displayOptions!.show!.type)).toBe(true);
            expect(settings.displayOptions!.show!.type!.length).toBeGreaterThan(0);

            // All settings should target visual element types
            const visualTypes = ['video', 'image', 'component', 'html', 'audiogram'];
            const targetTypes = settings.displayOptions!.show!.type!;
            const hasVisualType = targetTypes.some((type) => visualTypes.includes(type as string));
            expect(hasVisualType).toBe(true);
        });
    });

    describe('fixedCollection structure validation', () => {
        test.each(FIXED_COLLECTION_SETTINGS)('%s should have proper fixedCollection structure', (name, settings) => {
            expect(settings.type).toBe('fixedCollection');
            expect(settings.typeOptions).toBeDefined();
            expect(settings.typeOptions!.multipleValues).toBe(false);
            expect(settings.options).toBeDefined();
            expect(Array.isArray(settings.options)).toBe(true);
            expect(settings.options!.length).toBeGreaterThan(0);
        });

        test.each(FIXED_COLLECTION_SETTINGS)('%s should have valid option structure', (name, settings) => {
            settings.options!.forEach((option: any) => {
                expect(option.name).toBeDefined();
                expect(option.displayName).toBeDefined();
                expect(option.values).toBeDefined();

                expect(typeof option.name).toBe('string');
                expect(typeof option.displayName).toBe('string');
                expect(Array.isArray(option.values)).toBe(true);
                expect(option.values.length).toBeGreaterThan(0);
            });
        });

        test.each(FIXED_COLLECTION_SETTINGS)('%s should have valid value definitions', (name, settings) => {
            settings.options!.forEach((option: any) => {
                option.values.forEach((value: any) => {
                    expect(value.name).toBeDefined();
                    expect(value.displayName).toBeDefined();
                    expect(value.type).toBeDefined();
                    expect(value.default).toBeDefined();
                    expect(value.description).toBeDefined();

                    expect(typeof value.name).toBe('string');
                    expect(typeof value.displayName).toBe('string');
                    expect(typeof value.type).toBe('string');
                    expect(typeof value.description).toBe('string');
                });
            });
        });
    });

    describe('regular collection structure validation', () => {
        test.each(REGULAR_COLLECTION_SETTINGS)('%s should have proper collection structure', (name, settings) => {
            expect(settings.type).toBe('collection');
            expect(settings.placeholder).toBeDefined();
            expect(settings.options).toBeDefined();
            expect(Array.isArray(settings.options)).toBe(true);
            expect(settings.options!.length).toBeGreaterThan(0);

            expect(typeof settings.placeholder).toBe('string');
        });

        test.each(REGULAR_COLLECTION_SETTINGS)('%s should have valid option definitions', (name, settings) => {
            settings.options!.forEach((option: any) => {
                expect(option.name).toBeDefined();
                expect(option.displayName).toBeDefined();
                expect(option.type).toBeDefined();
                expect(option.default).toBeDefined();
                expect(option.description).toBeDefined();

                expect(typeof option.name).toBe('string');
                expect(typeof option.displayName).toBe('string');
                expect(typeof option.type).toBe('string');
                expect(typeof option.description).toBe('string');
            });
        });
    });

    describe('field-specific validation', () => {
        it('cropSettings should define crop area controls', () => {
            const cropOption = cropSettings.options![0] as any;
            const valueNames = cropOption.values.map((v: any) => v.name);

            const expectedFields = ['width', 'height', 'x', 'y'];
            expectedFields.forEach(field => {
                expect(valueNames).toContain(field);
            });

            // All crop values should be numbers
            cropOption.values.forEach((value: any) => {
                expect(value.type).toBe('number');
                expect(typeof value.default).toBe('number');
            });
        });

        it('rotationSettings should define rotation controls', () => {
            const rotationOption = rotationSettings.options![0] as any;
            const valueNames = rotationOption.values.map((v: any) => v.name);

            const expectedFields = ['angle', 'speed'];
            expectedFields.forEach(field => {
                expect(valueNames).toContain(field);
            });

            // Angle should have degree constraints
            const angleField = rotationOption.values.find((v: any) => v.name === 'angle');
            expect(angleField.typeOptions.minValue).toBe(-360);
            expect(angleField.typeOptions.maxValue).toBe(360);

            // Speed should have positive constraints
            const speedField = rotationOption.values.find((v: any) => v.name === 'speed');
            expect(speedField.typeOptions.minValue).toBeGreaterThan(0);
        });

        it('chromaKeySettings should define color removal controls', () => {
            const chromaOption = chromaKeySettings.options![0] as any;
            const valueNames = chromaOption.values.map((v: any) => v.name);

            const expectedFields = ['color', 'tolerance'];
            expectedFields.forEach(field => {
                expect(valueNames).toContain(field);
            });

            // Color should be color type with green default
            const colorField = chromaOption.values.find((v: any) => v.name === 'color');
            expect(colorField.type).toBe('color');
            expect(colorField.default).toBe('#00FF00');

            // Tolerance should be 0-100 range
            const toleranceField = chromaOption.values.find((v: any) => v.name === 'tolerance');
            expect(toleranceField.typeOptions.minValue).toBe(0);
            expect(toleranceField.typeOptions.maxValue).toBe(100);
        });

        it('colorCorrectionSettings should define color adjustment controls', () => {
            const optionNames = colorCorrectionSettings.options!.map((opt: any) => opt.name);

            const expectedFields = ['brightness', 'contrast', 'gamma', 'saturation'];
            expectedFields.forEach(field => {
                expect(optionNames).toContain(field);
            });

            // All color correction fields should be numbers
            colorCorrectionSettings.options!.forEach((option: any) => {
                expect(option.type).toBe('number');
                expect(typeof option.default).toBe('number');
                expect(option.typeOptions).toBeDefined();
            });
        });
    });

    describe('serialization and integrity', () => {
        test.each(ALL_SETTINGS)('%s should not have circular references', (name, settings) => {
            expect(() => JSON.stringify(settings)).not.toThrow();
        });

        test.each(ALL_SETTINGS)('%s should have consistent naming patterns', (name, settings) => {
            // Names should be camelCase
            expect(settings.name).toMatch(/^[a-z][a-zA-Z0-9]*$/);

            // DisplayName should be title case
            expect(settings.displayName).toMatch(/^[A-Z]/);
            expect(settings.displayName.length).toBeGreaterThan(0);
        });
    });
});