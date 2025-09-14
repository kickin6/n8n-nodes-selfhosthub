// __tests__/nodes/CreateJ2vMovie/shared/elements/commonElementFields.test.ts

import { commonElementFields } from '../../../../../nodes/CreateJ2vMovie/shared/elementFields';
import { INodeProperties } from 'n8n-workflow';

describe('commonElementFields', () => {
  // Test data matrices for extensive parametrization
  const ELEMENT_TYPE_OPTIONS = [
    ['Video', 'video'],
    ['Audio', 'audio'],
    ['Image', 'image'],
    ['Text', 'text'],
    ['Voice', 'voice'],
    ['Component', 'component'],
    ['HTML', 'html'],
    ['Audiogram', 'audiogram'],
    ['Subtitles', 'subtitles'],
  ] as const;

  const SOURCE_FIELD_SPECS = [
    ['src', ['video', 'audio', 'audiogram', 'html'], true, 'URL of the media file'],
    ['src', ['image'], false, 'URL of the image file'],
    ['component', ['component'], true, 'Pre-defined component ID'],
    ['text', ['text', 'voice'], true, 'Text content'],
  ] as const;

  const FIELD_STRUCTURE_TESTS = [
    ['type', { type: 'options', default: 'video', required: undefined }],
    ['src', { type: 'string', default: '', required: true }],
    ['component', { type: 'string', default: '', required: true }], 
    ['text', { type: 'string', default: '', required: true }],
  ] as const;

  const TYPE_SELECTOR_VALIDATION = [
    ['should be options type', 'type', 'options'],
    ['should have video default', 'default', 'video'],
    ['should have description', 'description', 'Type of element to add'],
  ] as const;

  const ELEMENT_CATEGORIZATION_TESTS = [
    ['media elements', ['video', 'audio', 'audiogram'], 'should use src field'],
    ['visual elements', ['video', 'image', 'component', 'html', 'audiogram'], 'should support visual transforms'],
    ['text elements', ['text', 'voice'], 'should use text field'],
    ['component elements', ['component'], 'should use component field'],
  ] as const;

  const REQUIRED_FIELD_TESTS = [
    ['src', ['video', 'audio', 'audiogram', 'html'], true],
    ['src', ['image'], false],
    ['component', ['component'], true],
    ['text', ['text', 'voice'], true],
  ] as const;

  const DISPLAY_OPTIONS_TESTS = [
    ['video src', ['video', 'audio', 'audiogram', 'html']],
    ['image src', ['image']],
    ['component field', ['component']],
    ['text field', ['text', 'voice']],
  ] as const;

  describe('basic structure validation', () => {
    it('should export common element fields array', () => {
      expect(Array.isArray(commonElementFields)).toBe(true);
      expect(commonElementFields.length).toBeGreaterThan(3);
    });

    it('should have element type selector as first field', () => {
      const typeField = commonElementFields[0];
      expect(typeField.name).toBe('type');
      expect(typeField.type).toBe('options');
    });

    test.each(FIELD_STRUCTURE_TESTS)('should have %s field with correct basic structure', (fieldName, specs) => {
      const field = commonElementFields.find(f => f.name === fieldName);
      
      expect(field).toBeDefined();
      expect(field!.type).toBe(specs.type);
      expect(field!.default).toBe(specs.default);
      
      if (specs.required !== undefined) {
        expect(field!.required).toBe(specs.required);
      }
    });
  });

  describe('element type selector validation', () => {
    const typeField = commonElementFields.find(f => f.name === 'type')!;

    test.each(TYPE_SELECTOR_VALIDATION)('%s', (description, property, expectedValue) => {
      expect(typeField[property as keyof INodeProperties]).toBe(expectedValue);
    });

    test.each(ELEMENT_TYPE_OPTIONS)('should have %s option with value %s', (displayName, value) => {
      const option = typeField.options!.find((opt: any) => opt.value === value) as any;
      
      expect(option).toBeDefined();
      expect(option.name).toBe(displayName);
      expect(option.value).toBe(value);
    });

    it('should have complete element type coverage', () => {
      const optionValues = typeField.options!.map((opt: any) => opt.value);
      const expectedTypes = ELEMENT_TYPE_OPTIONS.map(([, value]) => value);
      
      expect(optionValues.sort()).toEqual(expectedTypes.sort());
      expect(optionValues.length).toBe(expectedTypes.length);
    });

    it('should have video as default element type', () => {
      expect(typeField.default).toBe('video');
      
      const videoOption = typeField.options!.find((opt: any) => opt.value === 'video');
      expect(videoOption).toBeDefined();
    });
  });

  describe('source field validation', () => {
    test.each(SOURCE_FIELD_SPECS)('should have %s field targeting %s (required: %s)', (fieldName, targetTypes, isRequired, description) => {
      const field = commonElementFields.find(f => 
        f.name === fieldName && 
        f.displayOptions?.show?.type &&
        JSON.stringify(f.displayOptions.show.type) === JSON.stringify(targetTypes)
      );
      
      expect(field).toBeDefined();
      expect(field!.required).toBe(isRequired);
      expect(field!.description).toContain(description);
      expect(field!.displayOptions!.show!.type).toEqual(targetTypes);
    });

    test.each(REQUIRED_FIELD_TESTS)('should have correct required setting for %s targeting %s: %s', (fieldName, targetTypes, shouldBeRequired) => {
      const field = commonElementFields.find(f => 
        f.name === fieldName && 
        f.displayOptions?.show?.type &&
        JSON.stringify(f.displayOptions.show.type) === JSON.stringify(targetTypes)
      );
      
      expect(field!.required).toBe(shouldBeRequired);
    });

    it('should have multiple src fields for different element types', () => {
      const srcFields = commonElementFields.filter(f => f.name === 'src');
      
      expect(srcFields.length).toBeGreaterThanOrEqual(2);
      
      // Should have different displayOptions for different element groups
      const displayOptionsStrings = srcFields.map(f => 
        JSON.stringify(f.displayOptions?.show?.type)
      );
      const uniqueDisplayOptions = new Set(displayOptionsStrings);
      
      expect(uniqueDisplayOptions.size).toBe(srcFields.length);
    });

    it('should have different descriptions for different src field contexts', () => {
      const srcFields = commonElementFields.filter(f => f.name === 'src');
      
      srcFields.forEach(field => {
        expect(field.description).toBeDefined();
        expect(typeof field.description).toBe('string');
        expect(field.description!.length).toBeGreaterThan(0);
      });
      
      // Descriptions should be contextually different
      const descriptions = srcFields.map(f => f.description);
      const uniqueDescriptions = new Set(descriptions);
      expect(uniqueDescriptions.size).toBeGreaterThan(1);
    });
  });

  describe('element-specific field validation', () => {
    it('should have component field for component elements', () => {
      const componentField = commonElementFields.find(f => 
        f.name === 'component' && 
        f.displayOptions?.show?.type?.includes('component')
      );
      
      expect(componentField).toBeDefined();
      expect(componentField!.type).toBe('string');
      expect(componentField!.required).toBe(true);
      expect(componentField!.description).toContain('component ID');
    });

    it('should have text field for text-based elements', () => {
      const textField = commonElementFields.find(f => 
        f.name === 'text' && 
        f.displayOptions?.show?.type?.includes('text')
      );
      
      expect(textField).toBeDefined();
      expect(textField!.type).toBe('string');
      expect(textField!.required).toBe(true);
      expect(textField!.typeOptions?.rows).toBeDefined();
      expect(textField!.typeOptions!.rows).toBeGreaterThan(1);
    });

    test.each(ELEMENT_CATEGORIZATION_TESTS)('should properly categorize %s: %s', (categoryName, elementTypes, description) => {
      elementTypes.forEach(elementType => {
        // Find fields that target this element type
        const fieldsForType = commonElementFields.filter(f => 
          f.displayOptions?.show?.type?.includes(elementType)
        );
        
        expect(fieldsForType.length).toBeGreaterThan(0);
        
        // Type field should always be present (no displayOptions)
        const typeField = commonElementFields.find(f => f.name === 'type');
        expect(typeField).toBeDefined();
        expect(typeField!.displayOptions).toBeUndefined();
      });
    });
  });

  describe('display options architecture', () => {
    test.each(DISPLAY_OPTIONS_TESTS)('should have proper displayOptions for %s targeting %s', (fieldDescription, targetTypes) => {
      const field = commonElementFields.find(f => 
        f.displayOptions?.show?.type &&
        JSON.stringify(f.displayOptions.show.type) === JSON.stringify(targetTypes)
      );
      
      expect(field).toBeDefined();
      expect(field!.displayOptions!.show!.type).toEqual(targetTypes);
      
      targetTypes.forEach(elementType => {
        expect(field!.displayOptions!.show!.type).toContain(elementType);
      });
    });

    it('should have fields without displayOptions (always visible)', () => {
      const alwaysVisibleFields = commonElementFields.filter(f => !f.displayOptions);
      
      expect(alwaysVisibleFields.length).toBeGreaterThan(0);
      
      // Type selector should always be visible
      const typeField = alwaysVisibleFields.find(f => f.name === 'type');
      expect(typeField).toBeDefined();
    });

    it('should have conditional fields with proper targeting', () => {
      const conditionalFields = commonElementFields.filter(f => f.displayOptions?.show?.type);
      
      expect(conditionalFields.length).toBeGreaterThan(0);
      
      conditionalFields.forEach(field => {
        expect(Array.isArray(field.displayOptions!.show!.type)).toBe(true);
        expect(field.displayOptions!.show!.type!.length).toBeGreaterThan(0);
        
        field.displayOptions!.show!.type!.forEach((type: any) => {
          expect(typeof type).toBe('string');
          
          // Should be a valid element type
          const validTypes = ELEMENT_TYPE_OPTIONS.map(([, value]) => value);
          expect(validTypes).toContain(type);
        });
      });
    });
  });

  describe('field type and constraint validation', () => {
    it('should have proper string field configurations', () => {
      const stringFields = commonElementFields.filter(f => f.type === 'string');
      
      stringFields.forEach(field => {
        expect(field.default).toBeDefined();
        expect(typeof field.default).toBe('string');
        
        if (field.typeOptions?.rows) {
          expect(typeof field.typeOptions.rows).toBe('number');
          expect(field.typeOptions.rows).toBeGreaterThan(0);
        }
      });
    });

    it('should have proper options field configuration', () => {
      const optionsFields = commonElementFields.filter(f => f.type === 'options');
      
      expect(optionsFields.length).toBeGreaterThan(0);
      
      optionsFields.forEach(field => {
        expect(field.options).toBeDefined();
        expect(Array.isArray(field.options)).toBe(true);
        expect(field.options!.length).toBeGreaterThan(0);
        
        field.options!.forEach((option: any) => {
          expect(option.name).toBeDefined();
          expect(option.value).toBeDefined();
          expect(typeof option.name).toBe('string');
        });
      });
    });

    it('should have appropriate field defaults', () => {
      const defaultTests = [
        ['type', 'video'],
        ['src', ''],
        ['component', ''],
        ['text', ''],
      ];

      defaultTests.forEach(([fieldName, expectedDefault]) => {
        const field = commonElementFields.find(f => f.name === fieldName);
        if (field) {
          expect(field.default).toBe(expectedDefault);
        }
      });
    });
  });

  describe('element workflow validation', () => {
    it('should support complete element creation workflow', () => {
      // Should have type selector
      const typeField = commonElementFields.find(f => f.name === 'type');
      expect(typeField).toBeDefined();
      
      // Should have content fields for each element type
      ELEMENT_TYPE_OPTIONS.forEach(([, elementType]) => {
        const fieldsForType = commonElementFields.filter(f => 
          !f.displayOptions || f.displayOptions.show?.type?.includes(elementType)
        );
        
        expect(fieldsForType.length).toBeGreaterThan(0);
      });
    });

    it('should have required content fields for each element type', () => {
      const requiredFieldsByType = {
        video: ['src'],
        audio: ['src'],
        image: ['src'],
        text: ['text'],
        voice: ['text'],
        component: ['component'],
        html: ['src'],
        audiogram: ['src'],
        subtitles: [], // Subtitles handled by subtitleControlFields
      };

      Object.entries(requiredFieldsByType).forEach(([elementType, requiredFields]) => {
        requiredFields.forEach(fieldName => {
          const field = commonElementFields.find(f => 
            f.name === fieldName && 
            (!f.displayOptions || f.displayOptions.show?.type?.includes(elementType))
          );
          
          expect(field).toBeDefined();
        });
      });
    });

    it('should maintain logical field order', () => {
      // Type selector should be first
      expect(commonElementFields[0].name).toBe('type');
      
      // Content fields should follow type selector
      const fieldNames = commonElementFields.map(f => f.name);
      const typeIndex = fieldNames.indexOf('type');
      
      expect(typeIndex).toBe(0);
    });
  });

  describe('serialization and integrity', () => {
    it('should not have circular references', () => {
      expect(() => JSON.stringify(commonElementFields)).not.toThrow();
    });

    it('should have consistent naming patterns', () => {
      commonElementFields.forEach(field => {
        // Names should be camelCase
        expect(field.name).toMatch(/^[a-z][a-zA-Z0-9]*$/);
        
        // DisplayName should be descriptive
        expect(field.displayName).toBeDefined();
        expect(typeof field.displayName).toBe('string');
        expect(field.displayName.length).toBeGreaterThan(0);
      });
    });

    it('should have required INodeProperties structure', () => {
      commonElementFields.forEach(field => {
        expect(field.name).toBeDefined();
        expect(field.displayName).toBeDefined();
        expect(field.type).toBeDefined();
        expect(field.default).toBeDefined();
        expect(field.description).toBeDefined();
        
        expect(typeof field.name).toBe('string');
        expect(typeof field.displayName).toBe('string');
        expect(typeof field.type).toBe('string');
        expect(typeof field.description).toBe('string');
      });
    });
  });

  describe('edge cases and special handling', () => {
    it('should handle image src field special case (not required)', () => {
      const imageSrcField = commonElementFields.find(f => 
        f.name === 'src' && 
        f.displayOptions?.show?.type?.includes('image') &&
        f.displayOptions.show.type.length === 1
      );
      
      expect(imageSrcField).toBeDefined();
      expect(imageSrcField!.required).toBe(false);
      expect(imageSrcField!.description).toContain('Leave empty for AI-generated');
    });

    it('should handle text field multiline configuration', () => {
      const textField = commonElementFields.find(f => 
        f.name === 'text' && 
        f.displayOptions?.show?.type?.includes('text')
      );
      
      expect(textField).toBeDefined();
      expect(textField!.typeOptions?.rows).toBeDefined();
      expect(textField!.typeOptions!.rows).toBeGreaterThan(1);
    });

    it('should handle component field validation', () => {
      const componentField = commonElementFields.find(f => 
        f.name === 'component'
      );
      
      expect(componentField).toBeDefined();
      expect(componentField!.required).toBe(true);
      expect(componentField!.description).toContain('Pre-defined component ID');
    });

    it('should handle element type option completeness', () => {
      const typeField = commonElementFields.find(f => f.name === 'type')!;
      
      // Should have option for every defined element type
      const optionValues = typeField.options!.map((opt: any) => opt.value);
      expect(optionValues.length).toBe(ELEMENT_TYPE_OPTIONS.length);
      
      // Each option should have both name and value
      typeField.options!.forEach((option: any) => {
        expect(option.name).toBeDefined();
        expect(option.value).toBeDefined();
        expect(typeof option.name).toBe('string');
        expect(typeof option.value).toBe('string');
      });
    });
  });
});