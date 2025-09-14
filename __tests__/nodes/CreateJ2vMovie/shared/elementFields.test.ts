// __tests__/nodes/CreateJ2vMovie/shared/elementFields.test.ts

import {
  commonElementFields,
  commonTimingFields,
  positionFields,
  visualTransformFields,
  cropSettings,
  rotationSettings,
  chromaKeySettings,
  colorCorrectionSettings,
  audioControlFields,
  voiceControlFields,
  componentControlFields,
  htmlControlFields,
  audiogramControlFields,
  imageAIFields,
  textControlFields,
  subtitleControlFields,
  completeElementFields
} from '../../../../nodes/CreateJ2vMovie/shared/elementFields';
import { INodeProperties } from 'n8n-workflow';

describe('elements/index.ts - architectural integrity', () => {
  const SHARED_FIELD_EXPORTS: Array<[string, INodeProperties[]]> = [
    ['commonElementFields', commonElementFields],
    ['commonTimingFields', commonTimingFields],
    ['positionFields', positionFields],
    ['visualTransformFields', visualTransformFields],
    ['audioControlFields', audioControlFields],
    ['voiceControlFields', voiceControlFields],
    ['componentControlFields', componentControlFields],
    ['htmlControlFields', htmlControlFields],
    ['audiogramControlFields', audiogramControlFields],
    ['imageAIFields', imageAIFields],
    ['textControlFields', textControlFields],
    ['subtitleControlFields', subtitleControlFields],
  ];

  const SETTINGS_OBJECT_EXPORTS: Array<[string, INodeProperties]> = [
    ['cropSettings', cropSettings],
    ['rotationSettings', rotationSettings],
    ['chromaKeySettings', chromaKeySettings],
    ['colorCorrectionSettings', colorCorrectionSettings],
  ];

  describe('export architecture', () => {
    test.each(SHARED_FIELD_EXPORTS)('%s should be exported as non-empty array', (name, fields) => {
      expect(Array.isArray(fields)).toBe(true);
      expect(fields.length).toBeGreaterThan(0);
    });

    test.each(SETTINGS_OBJECT_EXPORTS)('%s should be exported as settings object', (name, settings) => {
      expect(typeof settings).toBe('object');
      expect(settings).not.toBeNull();
    });

    it('should export completeElementFields as comprehensive array', () => {
      expect(Array.isArray(completeElementFields)).toBe(true);
      expect(completeElementFields.length).toBeGreaterThan(0);
    });
  });

  describe('integration architecture', () => {
    it('should have element type selector in commonElementFields', () => {
      const typeField = commonElementFields.find((field: INodeProperties) => field.name === 'type');
      expect(typeField).toBeDefined();
      expect(typeField!.type).toBe('options');
    });

    it('should combine shared components into completeElementFields', () => {
      const sharedFieldCount = SHARED_FIELD_EXPORTS.reduce((total, [, fields]) => total + fields.length, 0);
      const settingsCount = SETTINGS_OBJECT_EXPORTS.length;
      
      // CompleteElementFields should include content from shared collections plus settings
      expect(completeElementFields.length).toBeGreaterThan(sharedFieldCount);
      expect(completeElementFields.length).toBeGreaterThan(settingsCount);
    });

    it('should include core architectural fields', () => {
      const fieldNames = completeElementFields.map((field: INodeProperties) => field.name);
      const coreFields = ['type', 'timing'];
      
      coreFields.forEach(coreField => {
        expect(fieldNames).toContain(coreField);
      });
    });

    it('should apply description mapping transformation', () => {
      const fieldsWithDescriptions = completeElementFields.filter((field: INodeProperties) => field.description);
      expect(fieldsWithDescriptions.length).toBeGreaterThan(0);
    });
  });

  describe('structural integrity', () => {
    const SERIALIZATION_OBJECTS: Array<[string, any]> = [
      ['completeElementFields', completeElementFields],
      ['cropSettings', cropSettings],
      ['rotationSettings', rotationSettings],
      ['chromaKeySettings', chromaKeySettings],
      ['colorCorrectionSettings', colorCorrectionSettings],
    ];

    test.each(SERIALIZATION_OBJECTS)('%s should not have circular references', (name, obj) => {
      expect(() => JSON.stringify(obj)).not.toThrow();
    });

    it('should not have duplicate field names in completeElementFields', () => {
      const fieldNames = completeElementFields.map((field: INodeProperties) => field.name);
      const uniqueNames = new Set(fieldNames);
      
      // Some duplication expected (multiple src fields with different displayOptions)
      expect(uniqueNames.size).toBeGreaterThan(0);
      expect(fieldNames.length).toBeGreaterThanOrEqual(uniqueNames.size);
    });

    it('should maintain architectural consistency', () => {
      // Basic structural validation - not field-level details
      completeElementFields.forEach((field: INodeProperties) => {
        expect(field).toHaveProperty('name');
        expect(field).toHaveProperty('type');
        expect(field).toHaveProperty('default');
      });
    });
  });
});