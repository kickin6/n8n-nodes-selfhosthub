// __tests__/nodes/CreateJ2vMovie/shared/elements/textControlFields.test.ts

import { textControlFields } from '../../../../../nodes/CreateJ2vMovie/shared/elementFields';
import { INodeProperties } from 'n8n-workflow';

describe('textControlFields', () => {
  const TEXT_COLLECTION_SPECS = [
    ['textStyling', { type: 'collection', description: 'text appearance and styling' }],
    ['textLayout', { type: 'collection', description: 'text positioning and spacing' }],
    ['textEffects', { type: 'collection', description: 'text visual effects and decorations' }],
  ] as const;

  const ELEMENT_TYPE_TESTS = [
    ['text', true],
    ['video', false],
    ['audio', false],
    ['image', false],
    ['voice', false],
    ['component', false],
    ['html', false],
    ['audiogram', false],
    ['subtitles', false],
  ] as const;

  const VALID_FONT_SIZE_VALUES = [8, 16, 24, 32, 48, 64, 96, 128, 200];
  const INVALID_FONT_SIZE_VALUES = [0, 7, 201, 300, -10];

  const VALID_LINE_HEIGHT_VALUES = [0.5, 0.8, 1.0, 1.2, 1.5, 2.0, 3.0];
  const INVALID_LINE_HEIGHT_VALUES = [0.4, 0, -1, 3.1, 5.0];

  const COLOR_VALIDATION_TESTS = [
    ['fontColor', '#ffffff', 'Primary text color'],
    ['backgroundColor', '', 'Text background color (transparent by default)'],
  ] as const;

  describe('structure validation', () => {
    it('should export valid text control fields array', () => {
      expect(Array.isArray(textControlFields)).toBe(true);
      expect(textControlFields.length).toBe(3);
    });

    test.each(TEXT_COLLECTION_SPECS)('should have %s collection with correct structure', (collectionName, specs) => {
      const collection = textControlFields.find(f => f.name === collectionName);
      
      expect(collection).toBeDefined();
      expect(collection!.type).toBe(specs.type);
      expect(collection!.description).toContain(specs.description);
      expect(collection!.placeholder).toBeDefined();
      expect(collection!.default).toEqual({});
      
      expect(typeof collection!.displayName).toBe('string');
      expect(typeof collection!.description).toBe('string');
      expect(typeof collection!.placeholder).toBe('string');
    });

    test.each(ELEMENT_TYPE_TESTS)('should %s target %s element type', (elementType, shouldTarget) => {
      textControlFields.forEach(collection => {
        const targetTypes = collection.displayOptions!.show!.type as string[];
        
        if (shouldTarget) {
          expect(targetTypes).toContain(elementType);
        } else {
          expect(targetTypes).not.toContain(elementType);
        }
      });
    });

    it('should target text elements only', () => {
      textControlFields.forEach(collection => {
        const targetTypes = collection.displayOptions!.show!.type as string[];
        expect(targetTypes).toEqual(['text']);
      });
    });
  });

  describe('text styling collection validation', () => {
    const textStylingCollection = textControlFields.find(f => f.name === 'textStyling')!;
    const stylingOptions = textStylingCollection.options! as any[];

    it('should have fontFamily option with correct structure', () => {
      const option = stylingOptions.find(opt => opt.name === 'fontFamily');
      
      expect(option).toBeDefined();
      expect(option.displayName).toBeDefined();
      expect(option.type).toBe('string');
      expect(option.default).toBe('Arial');
      expect(option.description).toContain('Font family name');
    });

    it('should have fontSize option with correct structure', () => {
      const option = stylingOptions.find(opt => opt.name === 'fontSize');
      
      expect(option).toBeDefined();
      expect(option.displayName).toBeDefined();
      expect(option.type).toBe('number');
      expect(option.default).toBe(32);
      expect(option.description).toContain('Font size in pixels');
      expect(option.typeOptions?.minValue).toBe(8);
      expect(option.typeOptions?.maxValue).toBe(200);
    });

    it('should have fontWeight option with correct structure', () => {
      const option = stylingOptions.find(opt => opt.name === 'fontWeight');
      
      expect(option).toBeDefined();
      expect(option.displayName).toBeDefined();
      expect(option.type).toBe('options');
      expect(option.default).toBe('400');
      expect(option.description).toContain('Font weight');
    });

    it('should have fontColor option with correct structure', () => {
      const option = stylingOptions.find(opt => opt.name === 'fontColor');
      
      expect(option).toBeDefined();
      expect(option.displayName).toBeDefined();
      expect(option.type).toBe('color');
      expect(option.default).toBe('#ffffff');
      expect(option.description).toContain('Text color');
    });

    it('should have backgroundColor option with correct structure', () => {
      const option = stylingOptions.find(opt => opt.name === 'backgroundColor');
      
      expect(option).toBeDefined();
      expect(option.displayName).toBeDefined();
      expect(option.type).toBe('color');
      expect(option.default).toBe('');
      expect(option.description).toContain('Text background color');
    });

    it('should have style option with correct structure', () => {
      const option = stylingOptions.find(opt => opt.name === 'style');
      
      expect(option).toBeDefined();
      expect(option.displayName).toBeDefined();
      expect(option.type).toBe('options');
      expect(option.default).toBe('001');
      expect(option.description).toContain('Text animation style');
    });

    it('should have font family as string field', () => {
      const fontFamilyOption = stylingOptions.find(opt => opt.name === 'fontFamily')!;
      
      expect(fontFamilyOption.type).toBe('string');
      expect(fontFamilyOption.default).toBe('Arial');
      expect(fontFamilyOption.description).toContain('Font family name');
    });

    test.each(VALID_FONT_SIZE_VALUES)('should accept valid font size value: %s', (validValue) => {
      const fontSizeOption = stylingOptions.find(opt => opt.name === 'fontSize')!;
      
      expect(typeof validValue).toBe('number');
      expect(validValue).toBeGreaterThanOrEqual(fontSizeOption.typeOptions!.minValue);
      expect(validValue).toBeLessThanOrEqual(fontSizeOption.typeOptions!.maxValue);
    });

    test.each(INVALID_FONT_SIZE_VALUES)('should have constraints that reject invalid font size: %s', (invalidValue) => {
      const fontSizeOption = stylingOptions.find(opt => opt.name === 'fontSize')!;
      const minValue = fontSizeOption.typeOptions!.minValue;
      const maxValue = fontSizeOption.typeOptions!.maxValue;
      
      expect(invalidValue < minValue || invalidValue > maxValue).toBe(true);
    });

    it('should have valid font weight options from actual implementation', () => {
      const fontWeightOption = stylingOptions.find(opt => opt.name === 'fontWeight')!;
      
      expect(fontWeightOption.options).toBeDefined();
      expect(fontWeightOption.options!.length).toBe(6);
      
      const expectedFontWeights = [
        { name: 'Light (300)', value: '300' },
        { name: 'Normal (400)', value: '400' },
        { name: 'Medium (500)', value: '500' },
        { name: 'Semi-Bold (600)', value: '600' },
        { name: 'Bold (700)', value: '700' },
        { name: 'Extra Bold (800)', value: '800' },
      ];
      
      expectedFontWeights.forEach(({ name, value }) => {
        const option = fontWeightOption.options!.find((opt: any) => opt.value === value);
        expect(option).toBeDefined();
        expect(option.name).toBe(name);
        expect(option.value).toBe(value);
      });
    });

    it('should have valid text style options from actual implementation', () => {
      const styleOption = stylingOptions.find(opt => opt.name === 'style')!;
      
      expect(styleOption.options).toBeDefined();
      expect(styleOption.options!.length).toBe(4);
      
      const expectedTextStyles = [
        { name: 'Basic (001)', value: '001' },
        { name: 'Fade In (002)', value: '002' },
        { name: 'Type Writer (003)', value: '003' },
        { name: 'Bounce (004)', value: '004' },
      ];
      
      expectedTextStyles.forEach(({ name, value }) => {
        const option = styleOption.options!.find((opt: any) => opt.value === value);
        expect(option).toBeDefined();
        expect(option.name).toBe(name);
        expect(option.value).toBe(value);
      });
    });

    test.each(COLOR_VALIDATION_TESTS)('should have %s color field: %s (%s)', (fieldName, expectedDefault, description) => {
      const colorOption = stylingOptions.find(opt => opt.name === fieldName)!;
      
      expect(colorOption.type).toBe('color');
      expect(colorOption.default).toBe(expectedDefault);
    });
  });

  describe('text layout collection validation', () => {
    const textLayoutCollection = textControlFields.find(f => f.name === 'textLayout')!;
    const layoutOptions = textLayoutCollection.options! as any[];

    it('should have textAlign option with correct structure', () => {
      const option = layoutOptions.find(opt => opt.name === 'textAlign');
      
      expect(option).toBeDefined();
      expect(option.displayName).toBeDefined();
      expect(option.type).toBe('options');
      expect(option.default).toBe('center');
      expect(option.description).toContain('Horizontal text alignment');
    });

    it('should have verticalPosition option with correct structure', () => {
      const option = layoutOptions.find(opt => opt.name === 'verticalPosition');
      
      expect(option).toBeDefined();
      expect(option.displayName).toBeDefined();
      expect(option.type).toBe('options');
      expect(option.default).toBe('center');
      expect(option.description).toContain('Vertical alignment');
    });

    it('should have horizontalPosition option with correct structure', () => {
      const option = layoutOptions.find(opt => opt.name === 'horizontalPosition');
      
      expect(option).toBeDefined();
      expect(option.displayName).toBeDefined();
      expect(option.type).toBe('options');
      expect(option.default).toBe('center');
      expect(option.description).toContain('Horizontal alignment of content within the text box bounds');
    });

    it('should have lineHeight option with correct structure', () => {
      const option = layoutOptions.find(opt => opt.name === 'lineHeight');
      
      expect(option).toBeDefined();
      expect(option.displayName).toBeDefined();
      expect(option.type).toBe('number');
      expect(option.default).toBe(1.2);
      expect(option.description).toContain('Line spacing multiplier (0.5-3.0). 1.0 = normal, 1.5 = extra space.');
      expect(option.typeOptions?.minValue).toBe(0.5);
      expect(option.typeOptions?.maxValue).toBe(3.0);
      expect(option.typeOptions?.numberPrecision).toBe(2);
    });

    it('should have letterSpacing option with correct structure', () => {
      const option = layoutOptions.find(opt => opt.name === 'letterSpacing');
      
      expect(option).toBeDefined();
      expect(option.displayName).toBeDefined();
      expect(option.type).toBe('number');
      expect(option.default).toBe(0);
      expect(option.description).toContain('Letter spacing in pixels');
      expect(option.typeOptions?.numberPrecision).toBe(2);
    });

    it('should have valid text align options', () => {
      const textAlignOption = layoutOptions.find(opt => opt.name === 'textAlign')!;
      
      expect(textAlignOption.options).toBeDefined();
      expect(textAlignOption.options!.length).toBe(4);
      
      const expectedTextAlignOptions = [
        { name: 'Left', value: 'left' },
        { name: 'Center', value: 'center' },
        { name: 'Right', value: 'right' },
        { name: 'Justify', value: 'justify' },
      ];
      
      expectedTextAlignOptions.forEach(({ name, value }) => {
        const option = textAlignOption.options!.find((opt: any) => opt.value === value);
        expect(option).toBeDefined();
        expect(option.name).toBe(name);
        expect(option.value).toBe(value);
      });
    });

    test.each(VALID_LINE_HEIGHT_VALUES)('should accept valid line height value: %s', (validValue) => {
      const lineHeightOption = layoutOptions.find(opt => opt.name === 'lineHeight')!;
      
      expect(typeof validValue).toBe('number');
      expect(validValue).toBeGreaterThanOrEqual(lineHeightOption.typeOptions!.minValue);
      expect(validValue).toBeLessThanOrEqual(lineHeightOption.typeOptions!.maxValue);
    });

    test.each(INVALID_LINE_HEIGHT_VALUES)('should have constraints that reject invalid line height: %s', (invalidValue) => {
      const lineHeightOption = layoutOptions.find(opt => opt.name === 'lineHeight')!;
      const minValue = lineHeightOption.typeOptions!.minValue;
      const maxValue = lineHeightOption.typeOptions!.maxValue;
      
      expect(invalidValue < minValue || invalidValue > maxValue).toBe(true);
    });

    it('should have letter spacing with proper precision', () => {
      const letterSpacingOption = layoutOptions.find(opt => opt.name === 'letterSpacing')!;
      
      expect(letterSpacingOption.type).toBe('number');
      expect(letterSpacingOption.default).toBe(0);
      expect(letterSpacingOption.typeOptions?.numberPrecision).toBe(2);
      expect(letterSpacingOption.description).toContain('Positive values increase spacing');
    });
  });

  describe('text effects collection validation', () => {
    const textEffectsCollection = textControlFields.find(f => f.name === 'textEffects')!;
    const effectsOptions = textEffectsCollection.options! as any[];

    it('should have textShadow option with correct structure', () => {
      const option = effectsOptions.find(opt => opt.name === 'textShadow');
      
      expect(option).toBeDefined();
      expect(option.displayName).toBeDefined();
      expect(option.type).toBe('string');
      expect(option.default).toBe('');
      expect(option.description).toContain('CSS text-shadow property');
    });

    it('should have textDecoration option with correct structure', () => {
      const option = effectsOptions.find(opt => opt.name === 'textDecoration');
      
      expect(option).toBeDefined();
      expect(option.displayName).toBeDefined();
      expect(option.type).toBe('options');
      expect(option.default).toBe('none');
      expect(option.description).toContain('Text decoration');
    });

    it('should have textTransform option with correct structure', () => {
      const option = effectsOptions.find(opt => opt.name === 'textTransform');
      
      expect(option).toBeDefined();
      expect(option.displayName).toBeDefined();
      expect(option.type).toBe('options');
      expect(option.default).toBe('none');
      expect(option.description).toContain('Text case transformation');
    });

    it('should have text shadow as string field', () => {
      const textShadowOption = effectsOptions.find(opt => opt.name === 'textShadow')!;
      
      expect(textShadowOption.type).toBe('string');
      expect(textShadowOption.default).toBe('');
      expect(textShadowOption.description).toContain('CSS text-shadow');
      expect(textShadowOption.description).toContain('2px 2px 4px rgba(0,0,0,0.5)');
    });

    it('should have valid text decoration options', () => {
      const textDecorationOption = effectsOptions.find(opt => opt.name === 'textDecoration')!;
      
      expect(textDecorationOption.options).toBeDefined();
      
      const expectedDecorationOptions = [
        { name: 'None', value: 'none' },
        { name: 'Underline', value: 'underline' },
        { name: 'Overline', value: 'overline' },
        { name: 'Line Through', value: 'line-through' },
      ];
      
      expectedDecorationOptions.forEach(({ name, value }) => {
        const option = textDecorationOption.options!.find((opt: any) => opt.value === value);
        expect(option).toBeDefined();
        expect(option.name).toBe(name);
        expect(option.value).toBe(value);
      });
    });

    it('should have valid text transform options', () => {
      const textTransformOption = effectsOptions.find(opt => opt.name === 'textTransform')!;
      
      expect(textTransformOption.options).toBeDefined();
      
      const expectedTransformOptions = [
        { name: 'None', value: 'none' },
        { name: 'Uppercase', value: 'uppercase' },
        { name: 'Lowercase', value: 'lowercase' },
        { name: 'Capitalize', value: 'capitalize' },
      ];
      
      expectedTransformOptions.forEach(({ name, value }) => {
        const option = textTransformOption.options!.find((opt: any) => opt.value === value);
        expect(option).toBeDefined();
        expect(option.name).toBe(name);
        expect(option.value).toBe(value);
      });
    });
  });

  describe('text control workflow validation', () => {
    it('should support complete text styling workflow', () => {
      const allOptionNames = textControlFields.flatMap(collection => 
        (collection.options! as any[]).map(opt => opt.name)
      );
      
      // Core styling
      expect(allOptionNames).toContain('fontFamily');
      expect(allOptionNames).toContain('fontSize');
      expect(allOptionNames).toContain('fontWeight');
      expect(allOptionNames).toContain('fontColor');
      
      // Layout positioning
      expect(allOptionNames).toContain('textAlign');
      expect(allOptionNames).toContain('verticalPosition');
      expect(allOptionNames).toContain('lineHeight');
      
      // Visual effects
      expect(allOptionNames).toContain('textShadow');
      expect(allOptionNames).toContain('textDecoration');
      expect(allOptionNames).toContain('textTransform');
    });

    it('should have logical collection organization', () => {
      const collectionNames = textControlFields.map(f => f.name);
      const expectedOrder = ['textStyling', 'textLayout', 'textEffects'];
      
      expect(collectionNames).toEqual(expectedOrder);
    });

    it('should have appropriate option counts per collection', () => {
      const optionCounts = textControlFields.map(collection => ({
        name: collection.name,
        count: (collection.options! as any[]).length
      }));
      
      expect(optionCounts).toEqual([
        { name: 'textStyling', count: 6 },
        { name: 'textLayout', count: 5 },
        { name: 'textEffects', count: 3 },
      ]);
    });

    it('should have sensible default values', () => {
      const defaultTests = [
        // Styling defaults
        ['fontFamily', 'Arial'],
        ['fontSize', 32],
        ['fontWeight', '400'],
        ['fontColor', '#ffffff'],
        ['backgroundColor', ''],
        ['style', '001'],
        
        // Layout defaults
        ['textAlign', 'center'],
        ['verticalPosition', 'center'],
        ['horizontalPosition', 'center'],
        ['lineHeight', 1.2],
        ['letterSpacing', 0],
        
        // Effects defaults
        ['textShadow', ''],
        ['textDecoration', 'none'],
        ['textTransform', 'none'],
      ];

      defaultTests.forEach(([optionName, expectedDefault]) => {
        const option = textControlFields
          .flatMap(collection => collection.options! as any[])
          .find(opt => opt.name === optionName);
        
        expect(option.default).toEqual(expectedDefault);
      });
    });
  });

  describe('typography system validation', () => {
    it('should support comprehensive typography controls', () => {
      const textStylingOptions = (textControlFields.find(f => f.name === 'textStyling')!.options! as any[]);
      
      // Font properties
      const fontFamily = textStylingOptions.find(opt => opt.name === 'fontFamily');
      const fontSize = textStylingOptions.find(opt => opt.name === 'fontSize');
      const fontWeight = textStylingOptions.find(opt => opt.name === 'fontWeight');
      
      expect(fontFamily).toBeDefined();
      expect(fontSize).toBeDefined();
      expect(fontWeight).toBeDefined();
      
      // Color properties
      const fontColor = textStylingOptions.find(opt => opt.name === 'fontColor');
      const backgroundColor = textStylingOptions.find(opt => opt.name === 'backgroundColor');
      
      expect(fontColor).toBeDefined();
      expect(backgroundColor).toBeDefined();
    });

    it('should support text animation styles', () => {
      const textStylingOptions = (textControlFields.find(f => f.name === 'textStyling')!.options! as any[]);
      const styleOption = textStylingOptions.find(opt => opt.name === 'style')!;
      
      expect(styleOption.type).toBe('options');
      expect(styleOption.default).toBe('001');
      
      // Should have multiple animation styles
      expect(styleOption.options!.length).toBe(4); // Actual count from source
    });

    it('should support advanced layout controls', () => {
      const textLayoutOptions = (textControlFields.find(f => f.name === 'textLayout')!.options! as any[]);
      
      // Alignment controls
      const textAlign = textLayoutOptions.find(opt => opt.name === 'textAlign');
      const verticalPosition = textLayoutOptions.find(opt => opt.name === 'verticalPosition');
      const horizontalPosition = textLayoutOptions.find(opt => opt.name === 'horizontalPosition');
      
      expect(textAlign).toBeDefined();
      expect(verticalPosition).toBeDefined();
      expect(horizontalPosition).toBeDefined();
      
      // Spacing controls
      const lineHeight = textLayoutOptions.find(opt => opt.name === 'lineHeight');
      const letterSpacing = textLayoutOptions.find(opt => opt.name === 'letterSpacing');
      
      expect(lineHeight).toBeDefined();
      expect(letterSpacing).toBeDefined();
    });
  });

  describe('edge cases and constraints', () => {
    it('should handle font size limits appropriately', () => {
      const textStylingOptions = (textControlFields.find(f => f.name === 'textStyling')!.options! as any[]);
      const fontSizeOption = textStylingOptions.find(opt => opt.name === 'fontSize')!;
      
      expect(fontSizeOption.typeOptions!.minValue).toBe(8); // Minimum readable size
      expect(fontSizeOption.typeOptions!.maxValue).toBe(200); // Maximum practical size
      expect(fontSizeOption.default).toBe(32); // Reasonable default
    });

    it('should handle line height precision', () => {
      const textLayoutOptions = (textControlFields.find(f => f.name === 'textLayout')!.options! as any[]);
      const lineHeightOption = textLayoutOptions.find(opt => opt.name === 'lineHeight')!;
      
      expect(lineHeightOption.typeOptions!.numberPrecision).toBe(2);
      expect(lineHeightOption.typeOptions!.minValue).toBe(0.5);
      expect(lineHeightOption.typeOptions!.maxValue).toBe(3.0);
    });

    it('should handle letter spacing with negative values', () => {
      const textLayoutOptions = (textControlFields.find(f => f.name === 'textLayout')!.options! as any[]);
      const letterSpacingOption = textLayoutOptions.find(opt => opt.name === 'letterSpacing')!;
      
      expect(letterSpacingOption.typeOptions!.numberPrecision).toBe(2);
      expect(letterSpacingOption.default).toBe(0);
      // Should not have minValue constraint (allows negative spacing)
      expect(letterSpacingOption.typeOptions!.minValue).toBeUndefined();
    });

    it('should handle optional background color', () => {
      const textStylingOptions = (textControlFields.find(f => f.name === 'textStyling')!.options! as any[]);
      const backgroundColorOption = textStylingOptions.find(opt => opt.name === 'backgroundColor')!;
      
      expect(backgroundColorOption.type).toBe('color');
      expect(backgroundColorOption.default).toBe(''); // Transparent by default
      expect(backgroundColorOption.description).toContain('Leave empty for transparent');
    });
  });

  describe('serialization and integrity', () => {
    it('should not have circular references', () => {
      expect(() => JSON.stringify(textControlFields)).not.toThrow();
    });

    it('should have consistent naming patterns', () => {
      textControlFields.forEach(collection => {
        // Collection names should be camelCase
        expect(collection.name).toMatch(/^[a-z][a-zA-Z0-9]*$/);
        
        // Collection display names should be title case
        expect(collection.displayName).toMatch(/^[A-Z]/);
        
        (collection.options! as any[]).forEach(option => {
          // Option names should be camelCase
          expect(option.name).toMatch(/^[a-z][a-zA-Z0-9]*$/);
          
          // Option display names should be title case
          expect(option.displayName).toMatch(/^[A-Z]/);
        });
      });
    });

    it('should have required INodeProperties structure', () => {
      textControlFields.forEach(collection => {
        expect(collection.name).toBeDefined();
        expect(collection.displayName).toBeDefined();
        expect(collection.type).toBeDefined();
        expect(collection.default).toBeDefined();
        expect(collection.description).toBeDefined();
        
        (collection.options! as any[]).forEach(option => {
          expect(option.name).toBeDefined();
          expect(option.displayName).toBeDefined();
          expect(option.type).toBeDefined();
          expect(option.default).toBeDefined();
          expect(option.description).toBeDefined();
        });
      });
    });
  });

  describe('element targeting and display logic', () => {
    it('should properly target text elements', () => {
      textControlFields.forEach(collection => {
        expect(collection.displayOptions).toBeDefined();
        expect(collection.displayOptions!.show).toBeDefined();
        expect(collection.displayOptions!.show!.type).toEqual(['text']);
      });
    });

    it('should have proper collection structure', () => {
      textControlFields.forEach(collection => {
        expect(collection.type).toBe('collection');
        expect(collection.options).toBeDefined();
        expect(Array.isArray(collection.options)).toBe(true);
        expect((collection.options! as any[]).length).toBeGreaterThan(0);
      });
    });
  });

  describe('comprehensive field coverage', () => {
    it('should include all essential text styling options', () => {
      const allOptions = textControlFields.flatMap(collection => 
        (collection.options! as any[])
      );
      const optionNames = allOptions.map(opt => opt.name);

      // Typography basics
      expect(optionNames).toContain('fontFamily');
      expect(optionNames).toContain('fontSize');
      expect(optionNames).toContain('fontWeight');

      // Color and appearance  
      expect(optionNames).toContain('fontColor');
      expect(optionNames).toContain('backgroundColor');

      // Layout and positioning
      expect(optionNames).toContain('textAlign');
      expect(optionNames).toContain('verticalPosition');
      expect(optionNames).toContain('horizontalPosition');

      // Advanced typography
      expect(optionNames).toContain('lineHeight');
      expect(optionNames).toContain('letterSpacing');

      // Visual effects
      expect(optionNames).toContain('textShadow');
      expect(optionNames).toContain('textDecoration');
      expect(optionNames).toContain('textTransform');

      // Animation style
      expect(optionNames).toContain('style');
    });

    it('should have proper type distribution', () => {
      const allOptions = textControlFields.flatMap(collection => 
        (collection.options! as any[])
      );
      
      const typeDistribution = allOptions.reduce((acc, opt) => {
        acc[opt.type] = (acc[opt.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Should have balanced type distribution
      expect(typeDistribution.string).toBe(2); // fontFamily, textShadow
      expect(typeDistribution.number).toBe(3); // fontSize, lineHeight, letterSpacing
      expect(typeDistribution.color).toBe(2); // fontColor, backgroundColor
      expect(typeDistribution.options).toBe(7); // All select/dropdown fields
    });
  });

  describe('validation rules integration', () => {
    it('should have appropriate constraints for numeric fields', () => {
      const textStylingOptions = (textControlFields.find(f => f.name === 'textStyling')!.options! as any[]);
      const textLayoutOptions = (textControlFields.find(f => f.name === 'textLayout')!.options! as any[]);
      
      // Font size constraints
      const fontSizeOption = textStylingOptions.find(opt => opt.name === 'fontSize')!;
      expect(fontSizeOption.typeOptions.minValue).toBe(8);
      expect(fontSizeOption.typeOptions.maxValue).toBe(200);

      // Line height constraints
      const lineHeightOption = textLayoutOptions.find(opt => opt.name === 'lineHeight')!;
      expect(lineHeightOption.typeOptions.minValue).toBe(0.5);
      expect(lineHeightOption.typeOptions.maxValue).toBe(3.0);
      expect(lineHeightOption.typeOptions.numberPrecision).toBe(2);

      // Letter spacing precision
      const letterSpacingOption = textLayoutOptions.find(opt => opt.name === 'letterSpacing')!;
      expect(letterSpacingOption.typeOptions.numberPrecision).toBe(2);
    });

    it('should have proper default values for production use', () => {
      const allOptions = textControlFields.flatMap(collection => 
        (collection.options! as any[])
      );

      allOptions.forEach(option => {
        expect(option.default).toBeDefined();
        
        // Ensure defaults are appropriate types
        if (option.type === 'number') {
          expect(typeof option.default).toBe('number');
        } else if (option.type === 'string') {
          expect(typeof option.default).toBe('string');
        } else if (option.type === 'color') {
          expect(typeof option.default).toBe('string');
        } else if (option.type === 'options') {
          expect(typeof option.default).toBe('string');
        }
      });
    });
  });

  describe('options validation', () => {
    it('should have valid font weight options from actual implementation', () => {
      const textStylingOptions = (textControlFields.find(f => f.name === 'textStyling')!.options! as any[]);
      const fontWeightOption = textStylingOptions.find(opt => opt.name === 'fontWeight')!;
      
      expect(fontWeightOption.options).toBeDefined();
      expect(fontWeightOption.options!.length).toBe(6);
      
      const expectedFontWeights = [
        { name: 'Light (300)', value: '300' },
        { name: 'Normal (400)', value: '400' },
        { name: 'Medium (500)', value: '500' },
        { name: 'Semi-Bold (600)', value: '600' },
        { name: 'Bold (700)', value: '700' },
        { name: 'Extra Bold (800)', value: '800' },
      ];
      
      expectedFontWeights.forEach(({ name, value }) => {
        const option = fontWeightOption.options!.find((opt: any) => opt.value === value);
        expect(option).toBeDefined();
        expect(option.name).toBe(name);
        expect(option.value).toBe(value);
      });
    });

    it('should have valid position options from actual implementation', () => {
      const textLayoutOptions = (textControlFields.find(f => f.name === 'textLayout')!.options! as any[]);
      
      // Test vertical position options
      const verticalPositionOption = textLayoutOptions.find(opt => opt.name === 'verticalPosition')!;
      expect(verticalPositionOption.options).toBeDefined();
      expect(verticalPositionOption.options!.length).toBe(3);
      
      const expectedVerticalPositions = [
        { name: 'Top', value: 'top' },
        { name: 'Center', value: 'center' },
        { name: 'Bottom', value: 'bottom' },
      ];
      
      expectedVerticalPositions.forEach(({ name, value }) => {
        const option = verticalPositionOption.options!.find((opt: any) => opt.value === value);
        expect(option).toBeDefined();
        expect(option.name).toBe(name);
        expect(option.value).toBe(value);
      });
      
      // Test horizontal position options
      const horizontalPositionOption = textLayoutOptions.find(opt => opt.name === 'horizontalPosition')!;
      expect(horizontalPositionOption.options).toBeDefined();
      expect(horizontalPositionOption.options!.length).toBe(3);
      
      const expectedHorizontalPositions = [
        { name: 'Left', value: 'left' },
        { name: 'Center', value: 'center' },
        { name: 'Right', value: 'right' },
      ];
      
      expectedHorizontalPositions.forEach(({ name, value }) => {
        const option = horizontalPositionOption.options!.find((opt: any) => opt.value === value);
        expect(option).toBeDefined();
        expect(option.name).toBe(name);
        expect(option.value).toBe(value);
      });
    });
  });

  describe('collection completeness', () => {
    it('should provide comprehensive text styling capabilities', () => {
      // Verify each collection has the expected fields
      const textStyling = textControlFields.find(f => f.name === 'textStyling')!;
      const textLayout = textControlFields.find(f => f.name === 'textLayout')!;
      const textEffects = textControlFields.find(f => f.name === 'textEffects')!;

      const stylingOptionNames = (textStyling.options! as any[]).map(opt => opt.name);
      const layoutOptionNames = (textLayout.options! as any[]).map(opt => opt.name);
      const effectsOptionNames = (textEffects.options! as any[]).map(opt => opt.name);

      // Styling collection should cover typography basics
      expect(stylingOptionNames).toEqual(expect.arrayContaining([
        'fontFamily', 'fontSize', 'fontWeight', 'fontColor', 'backgroundColor', 'style'
      ]));

      // Layout collection should cover positioning
      expect(layoutOptionNames).toEqual(expect.arrayContaining([
        'textAlign', 'verticalPosition', 'horizontalPosition', 'lineHeight', 'letterSpacing'
      ]));

      // Effects collection should cover visual enhancements
      expect(effectsOptionNames).toEqual(expect.arrayContaining([
        'textShadow', 'textDecoration', 'textTransform'
      ]));
    });

    it('should avoid field duplication across collections', () => {
      const allOptionNames = textControlFields.flatMap(collection => 
        (collection.options! as any[]).map(opt => opt.name)
      );
      
      const uniqueOptionNames = [...new Set(allOptionNames)];
      expect(allOptionNames).toHaveLength(uniqueOptionNames.length);
    });
  });
});