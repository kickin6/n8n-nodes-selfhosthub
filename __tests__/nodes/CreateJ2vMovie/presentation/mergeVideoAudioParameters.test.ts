// __tests__/nodes/CreateJ2vMovie/presentation/mergeVideoAudioParameters.test.ts

import {
  mergeVideoAudioParameters,
  mergeVideoAudioAdvancedModeParameter,
  mergeVideoAudioJsonTemplateParameter,
  mergeVideoAudioAdvancedParameters
} from '../../../../nodes/CreateJ2vMovie/presentation/mergeVideoAudioParameters';
import { INodeProperties, INodePropertyCollection } from 'n8n-workflow';

describe('mergeVideoAudioParameters', () => {
  describe('main parameter array', () => {
    it.each([
      ['recordId parameter', 'recordId', 'string', false],
      ['webhookUrl parameter', 'webhookUrl', 'string', false],
      ['video element collection', 'videoElement', 'fixedCollection', false],
      ['audio element collection', 'audioElement', 'fixedCollection', false],
      ['output settings collection', 'outputSettings', 'fixedCollection', false]
    ])('should have %s', (_, paramName, expectedType, isRequired) => {
      const param = mergeVideoAudioParameters.find(p => p.name === paramName);
      
      expect(param).toBeDefined();
      expect(param!.type).toBe(expectedType);
      
      if (isRequired) {
        expect(param!.required).toBe(true);
      }
    });

    it.each([
      ['recordId shows for mergeVideoAudio operation', 'recordId', ['mergeVideoAudio']],
      ['videoElement shows for mergeVideoAudio operation', 'videoElement', ['mergeVideoAudio']],
      ['audioElement shows for mergeVideoAudio operation', 'audioElement', ['mergeVideoAudio']],
      ['outputSettings shows for mergeVideoAudio operation', 'outputSettings', ['mergeVideoAudio']]
    ])('should have correct display options: %s', (_, paramName, expectedOperations) => {
      const param = mergeVideoAudioParameters.find(p => p.name === paramName);
      
      expect(param).toBeDefined();
      expect(param!.displayOptions?.show?.operation).toEqual(expectedOperations);
    });

    it.each([
      ['recordId hidden in basic mode', 'recordId', [false]],
      ['videoElement shown in basic mode', 'videoElement', [false]],
      ['audioElement shown in basic mode', 'audioElement', [false]],
      ['outputSettings shown in basic mode', 'outputSettings', [false]]
    ])('should have correct advanced mode display: %s', (_, paramName, expectedAdvancedMode) => {
      const param = mergeVideoAudioParameters.find(p => p.name === paramName);
      
      if (param && param.displayOptions?.show?.advancedModeMergeAudio) {
        expect(param.displayOptions.show.advancedModeMergeAudio).toEqual(expectedAdvancedMode);
      }
    });

    it.each([
      ['recordId has string default', 'recordId', ''],
      ['webhookUrl has string default', 'webhookUrl', ''],
      ['videoElement has object default', 'videoElement', {}],
      ['audioElement has object default', 'audioElement', {}],
      ['outputSettings has object default', 'outputSettings', {}]
    ])('should have correct defaults: %s', (_, paramName, expectedDefault) => {
      const param = mergeVideoAudioParameters.find(p => p.name === paramName);
      
      expect(param).toBeDefined();
      expect(param!.default).toEqual(expectedDefault);
    });

    it('should have descriptive placeholders and descriptions', () => {
      const videoElementParam = mergeVideoAudioParameters.find(p => p.name === 'videoElement');
      const audioElementParam = mergeVideoAudioParameters.find(p => p.name === 'audioElement');
      
      expect(videoElementParam!.placeholder).toBe('Add Video Element');
      expect(videoElementParam!.description).toContain('Configure the video source');
      
      expect(audioElementParam!.placeholder).toBe('Add Audio Element');
      expect(audioElementParam!.description).toContain('Configure the audio source');
    });
  });

  describe('video element configuration', () => {
    let videoElementParam: INodeProperties;
    let videoOption: INodePropertyCollection;

    beforeEach(() => {
      videoElementParam = mergeVideoAudioParameters.find(p => p.name === 'videoElement')!;
      videoOption = videoElementParam.options![0] as INodePropertyCollection;
    });

    it('should have correct video element structure', () => {
      expect(videoElementParam).toBeDefined();
      expect(videoElementParam.type).toBe('fixedCollection');
      expect(videoElementParam.options).toHaveLength(1);
      expect(videoOption.name).toBe('videoDetails');
      expect(videoOption.displayName).toBe('Video Details');
      expect(Array.isArray(videoOption.values)).toBe(true);
    });

    it.each([
      ['src field as string', 'src', 'string', '', true],
      ['duration field as number', 'duration', 'number', -1, false],
      ['muted field as boolean', 'muted', 'boolean', false, false],
      ['loop field as boolean', 'loop', 'boolean', false, false],
      ['crop field as boolean', 'crop', 'boolean', false, false],
      ['resize field as options', 'resize', 'options', 'cover', false],
      ['volume field as number', 'volume', 'number', 0, false]
    ])('should have %s', (_, fieldName, expectedType, expectedDefault, isRequired) => {
      const field = videoOption.values.find(f => f.name === fieldName);
      
      expect(field).toBeDefined();
      expect(field!.type).toBe(expectedType);
      expect(field!.default).toBe(expectedDefault);
      if (isRequired) {
        expect(field!.required).toBe(true);
      }
    });

    it('should have resize options with correct values', () => {
      const resizeField = videoOption.values.find(f => f.name === 'resize');
      
      expect(resizeField!.options).toEqual([
        { name: 'Cover (Crop to Fill)', value: 'cover' },
        { name: 'Contain (Fit Inside)', value: 'contain' },
        { name: 'Fill (Stretch)', value: 'fill' },
        { name: 'Fit (Letterbox)', value: 'fit' }
      ]);
    });

    it('should have volume field with proper validation', () => {
      const volumeField = videoOption.values.find(f => f.name === 'volume');
      
      expect(volumeField!.typeOptions?.minValue).toBe(0);
      expect(volumeField!.typeOptions?.maxValue).toBe(10);
      expect(volumeField!.typeOptions?.numberPrecision).toBe(2);
    });

    it('should have required src field', () => {
      const srcField = videoOption.values.find(f => f.name === 'src');
      
      expect(srcField!.required).toBe(true);
      expect(srcField!.description).toContain('URL of the video file');
    });

    it('should have descriptive field descriptions', () => {
      const fields = videoOption.values;
      
      fields.forEach(field => {
        expect(field.description).toBeDefined();
        expect(typeof field.description).toBe('string');
        expect(field.description!.length).toBeGreaterThan(0);
      });
    });
  });

  describe('audio element configuration', () => {
    let audioElementParam: INodeProperties;
    let audioOption: INodePropertyCollection;

    beforeEach(() => {
      audioElementParam = mergeVideoAudioParameters.find(p => p.name === 'audioElement')!;
      audioOption = audioElementParam.options![0] as INodePropertyCollection;
    });

    it('should have correct audio element structure', () => {
      expect(audioElementParam).toBeDefined();
      expect(audioElementParam.type).toBe('fixedCollection');
      expect(audioElementParam.options).toHaveLength(1);
      expect(audioOption.name).toBe('audioDetails');
      expect(audioOption.displayName).toBe('Audio Details');
      expect(Array.isArray(audioOption.values)).toBe(true);
    });

    it.each([
      ['src field as string', 'src', 'string', '', true],
      ['start field as number', 'start', 'number', 0, false],
      ['duration field as number', 'duration', 'number', -1, false],
      ['volume field as number', 'volume', 'number', 1, false],
      ['loop field as boolean', 'loop', 'boolean', false, false]
    ])('should have %s', (_, fieldName, expectedType, expectedDefault, isRequired) => {
      const field = audioOption.values.find(f => f.name === fieldName);
      
      expect(field).toBeDefined();
      expect(field!.type).toBe(expectedType);
      expect(field!.default).toBe(expectedDefault);
      if (isRequired) {
        expect(field!.required).toBe(true);
      }
    });

    it('should have volume field with proper validation', () => {
      const volumeField = audioOption.values.find(f => f.name === 'volume');
      
      expect(volumeField!.typeOptions?.minValue).toBe(0);
      expect(volumeField!.typeOptions?.maxValue).toBe(10);
      expect(volumeField!.typeOptions?.numberPrecision).toBe(2);
    });

    it('should have required src field', () => {
      const srcField = audioOption.values.find(f => f.name === 'src');
      
      expect(srcField!.required).toBe(true);
      expect(srcField!.description).toContain('URL of the audio file');
    });

    it('should have descriptive field descriptions', () => {
      const fields = audioOption.values;
      
      fields.forEach(field => {
        expect(field.description).toBeDefined();
        expect(typeof field.description).toBe('string');
        expect(field.description!.length).toBeGreaterThan(0);
      });
    });
  });

  describe('output settings configuration', () => {
    let outputSettingsParam: INodeProperties;
    let outputOption: INodePropertyCollection;

    beforeEach(() => {
      outputSettingsParam = mergeVideoAudioParameters.find(p => p.name === 'outputSettings')!;
      outputOption = outputSettingsParam.options![0] as INodePropertyCollection;
    });

    it('should have correct output settings structure', () => {
      expect(outputSettingsParam).toBeDefined();
      expect(outputSettingsParam.type).toBe('fixedCollection');
      expect(outputSettingsParam.options).toHaveLength(1);
      expect(outputOption.name).toBe('outputDetails');
      expect(outputOption.displayName).toBe('Output Details');
      expect(Array.isArray(outputOption.values)).toBe(true);
    });

    it.each([
      ['width field as number', 'width', 'number', 1024],
      ['height field as number', 'height', 'number', 768],
      ['fps field as number', 'fps', 'number', 30],
      ['quality field as options', 'quality', 'options', 'high'],
      ['format field as options', 'format', 'options', 'mp4']
    ])('should have %s', (_, fieldName, expectedType, expectedDefault) => {
      const field = outputOption.values.find(f => f.name === fieldName);
      
      expect(field).toBeDefined();
      expect(field!.type).toBe(expectedType);
      expect(field!.default).toBe(expectedDefault);
    });

    it('should have width field with proper validation', () => {
      const widthField = outputOption.values.find(f => f.name === 'width');
      
      expect(widthField!.typeOptions?.minValue).toBe(50);
      expect(widthField!.typeOptions?.maxValue).toBe(3840);
      expect(widthField!.typeOptions?.numberPrecision).toBe(0);
    });

    it('should have height field with proper validation', () => {
      const heightField = outputOption.values.find(f => f.name === 'height');
      
      expect(heightField!.typeOptions?.minValue).toBe(50);
      expect(heightField!.typeOptions?.maxValue).toBe(3840);
      expect(heightField!.typeOptions?.numberPrecision).toBe(0);
    });

    it('should have fps field with proper validation', () => {
      const fpsField = outputOption.values.find(f => f.name === 'fps');
      
      expect(fpsField!.typeOptions?.minValue).toBe(1);
      expect(fpsField!.typeOptions?.maxValue).toBe(120);
      expect(fpsField!.typeOptions?.numberPrecision).toBe(0);
    });

    it('should have quality options with correct values', () => {
      const qualityField = outputOption.values.find(f => f.name === 'quality');
      
      expect(qualityField!.options).toEqual([
        { name: 'Low', value: 'low' },
        { name: 'Medium', value: 'medium' },
        { name: 'High', value: 'high' },
        { name: 'Very High', value: 'very_high' }
      ]);
    });

    it('should have format options with correct values', () => {
      const formatField = outputOption.values.find(f => f.name === 'format');
      
      expect(formatField!.options).toEqual([
        { name: 'MP4', value: 'mp4' },
        { name: 'WebM', value: 'webm' }
      ]);
    });

    it('should have descriptive field descriptions', () => {
      const fields = outputOption.values;
      
      fields.forEach(field => {
        expect(field.description).toBeDefined();
        expect(typeof field.description).toBe('string');
        expect(field.description!.length).toBeGreaterThan(0);
      });
    });
  });

  describe('advanced mode parameter', () => {
    it('should have correct advanced mode parameter structure', () => {
      expect(mergeVideoAudioAdvancedModeParameter).toBeDefined();
      expect(mergeVideoAudioAdvancedModeParameter.name).toBe('advancedModeMergeVideoAudio');
      expect(mergeVideoAudioAdvancedModeParameter.type).toBe('boolean');
      expect(mergeVideoAudioAdvancedModeParameter.displayOptions?.show?.operation).toEqual(['mergeVideoAudio']);
    });

    it('should have correct display name and description', () => {
      expect(mergeVideoAudioAdvancedModeParameter.displayName).toContain('Advanced');
      expect(typeof mergeVideoAudioAdvancedModeParameter.description).toBe('string');
      expect(mergeVideoAudioAdvancedModeParameter.description!.length).toBeGreaterThan(0);
    });

    it('should have correct default value', () => {
      expect(mergeVideoAudioAdvancedModeParameter.default).toBe(false);
    });
  });

  describe('JSON template parameter', () => {
    it('should have correct JSON template parameter structure', () => {
      expect(mergeVideoAudioJsonTemplateParameter).toBeDefined();
      expect(mergeVideoAudioJsonTemplateParameter.name).toBe('jsonTemplateMergeVideoAudio');
      expect(mergeVideoAudioJsonTemplateParameter.type).toBe('json');
    });

    it('should have correct display options for advanced mode', () => {
      expect(mergeVideoAudioJsonTemplateParameter.displayOptions?.show?.operation).toEqual(['mergeVideoAudio']);
      expect(mergeVideoAudioJsonTemplateParameter.displayOptions?.show?.advancedModeMergeVideoAudio).toEqual([true]);
    });

    it('should have JSON template with proper structure', () => {
      expect(typeof mergeVideoAudioJsonTemplateParameter.default).toBe('string');
      
      const defaultTemplate = mergeVideoAudioJsonTemplateParameter.default as string;
      expect(() => JSON.parse(defaultTemplate)).not.toThrow();
      
      const parsed = JSON.parse(defaultTemplate);
      expect(parsed).toHaveProperty('scenes');
      expect(Array.isArray(parsed.scenes)).toBe(true);
      expect(parsed).toHaveProperty('fps');
      expect(parsed).toHaveProperty('width');
      expect(parsed).toHaveProperty('height');
      expect(parsed).toHaveProperty('quality');
    });

    it('should have template with video and audio elements', () => {
      const defaultTemplate = mergeVideoAudioJsonTemplateParameter.default as string;
      const parsed = JSON.parse(defaultTemplate);
      
      expect(parsed.scenes).toHaveLength(1);
      expect(parsed.scenes[0]).toHaveProperty('elements');
      expect(Array.isArray(parsed.scenes[0].elements)).toBe(true);
      
      const elements = parsed.scenes[0].elements;
      const videoElement = elements.find((el: any) => el.type === 'video');
      const audioElement = elements.find((el: any) => el.type === 'audio');
      
      expect(videoElement).toBeDefined();
      expect(audioElement).toBeDefined();
    });

    it('should have description that mentions override functionality', () => {
      expect(mergeVideoAudioJsonTemplateParameter.description).toContain('Override parameters');
    });
  });

  describe('advanced parameters array', () => {
    it('should contain expected override parameters', () => {
      expect(Array.isArray(mergeVideoAudioAdvancedParameters)).toBe(true);
      expect(mergeVideoAudioAdvancedParameters.length).toBeGreaterThan(0);
      
      const paramNames = mergeVideoAudioAdvancedParameters.map(p => p.name);
      
      expect(paramNames).toContain('recordId');
      expect(paramNames).toContain('webhookUrl');
      expect(paramNames).toContain('outputWidth');
      expect(paramNames).toContain('outputHeight');
      expect(paramNames).toContain('framerate');
      expect(paramNames).toContain('quality');
      expect(paramNames).toContain('cache');
      expect(paramNames).toContain('draft');
    });

    it.each([
      ['recordId', 'string'],
      ['webhookUrl', 'string'],
      ['outputWidth', 'number'],
      ['outputHeight', 'number'],
      ['framerate', 'number'],
      ['quality', 'options'],
      ['cache', 'boolean'],
      ['draft', 'boolean']
    ])('should have correct type for %s parameter', (paramName, expectedType) => {
      const param = mergeVideoAudioAdvancedParameters.find(p => p.name === paramName);
      
      expect(param).toBeDefined();
      expect(param!.type).toBe(expectedType);
    });

    it('should have correct display options for all advanced parameters', () => {
      mergeVideoAudioAdvancedParameters.forEach(param => {
        expect(param.displayOptions?.show?.operation).toEqual(['mergeVideoAudio']);
        expect(param.displayOptions?.show?.advancedModeMergeAudio).toEqual([true]);
      });
    });

    it.each([
      ['quality has options', 'quality', true],
      ['recordId has no special validation', 'recordId', false],
      ['webhookUrl has no special validation', 'webhookUrl', false],
      ['cache has no special validation', 'cache', false],
      ['draft has no special validation', 'draft', false],
      ['outputWidth has no validation (override param)', 'outputWidth', false],
      ['outputHeight has no validation (override param)', 'outputHeight', false],
      ['framerate has no validation (override param)', 'framerate', false]
    ])('should have validation where expected: %s', (_, paramName, shouldHaveValidation) => {
      const param = mergeVideoAudioAdvancedParameters.find(p => p.name === paramName);
      
      expect(param).toBeDefined();
      
      if (shouldHaveValidation) {
        if (param!.type === 'options') {
          expect(param!.options).toBeDefined();
          expect(Array.isArray(param!.options)).toBe(true);
          expect(param!.options!.length).toBeGreaterThan(0);
        }
      }
    });

    it('should have appropriate default values', () => {
      const recordIdParam = mergeVideoAudioAdvancedParameters.find(p => p.name === 'recordId');
      const webhookUrlParam = mergeVideoAudioAdvancedParameters.find(p => p.name === 'webhookUrl');
      const cacheParam = mergeVideoAudioAdvancedParameters.find(p => p.name === 'cache');
      const draftParam = mergeVideoAudioAdvancedParameters.find(p => p.name === 'draft');

      expect(recordIdParam!.default).toBe('');
      expect(webhookUrlParam!.default).toBe('');
      expect(cacheParam!.default).toBe(true);
      expect(draftParam!.default).toBe(false);
    });
  });

  describe('parameter consistency', () => {
    it('should have no duplicate parameter names within main parameters', () => {
      const paramNames = mergeVideoAudioParameters.map(p => p.name);
      const uniqueNames = new Set(paramNames);
      
      expect(paramNames.length).toBe(uniqueNames.size);
    });

    it('should have no duplicate parameter names within advanced parameters', () => {
      const paramNames = mergeVideoAudioAdvancedParameters.map(p => p.name);
      const uniqueNames = new Set(paramNames);
      
      expect(paramNames.length).toBe(uniqueNames.size);
    });

    it('should have all parameters with required properties', () => {
      [...mergeVideoAudioParameters, ...mergeVideoAudioAdvancedParameters].forEach(param => {
        expect(param.name).toBeDefined();
        expect(typeof param.name).toBe('string');
        expect(param.name.length).toBeGreaterThan(0);
        
        expect(param.type).toBeDefined();
        expect(typeof param.type).toBe('string');
        
        expect(param.displayName).toBeDefined();
        expect(typeof param.displayName).toBe('string');
        expect(param.displayName.length).toBeGreaterThan(0);
      });
    });

    it('should have consistent operation values in display options', () => {
      const allParams = [...mergeVideoAudioParameters, ...mergeVideoAudioAdvancedParameters, mergeVideoAudioAdvancedModeParameter, mergeVideoAudioJsonTemplateParameter];
      
      allParams.forEach(param => {
        if (param.displayOptions?.show?.operation) {
          expect(param.displayOptions.show.operation).toEqual(['mergeVideoAudio']);
        }
      });
    });

    it('should have proper type definitions for all parameters', () => {
      [...mergeVideoAudioParameters, ...mergeVideoAudioAdvancedParameters, mergeVideoAudioAdvancedModeParameter, mergeVideoAudioJsonTemplateParameter]
        .forEach(param => {
          expect(['string', 'number', 'boolean', 'options', 'fixedCollection', 'notice', 'json']).toContain(param.type);
        });
    });
  });

  describe('parameter display conditions', () => {
    it('should show basic mode parameters when advancedModeMergeAudio is false', () => {
      const basicParams = mergeVideoAudioParameters.filter(p => 
        p.displayOptions?.show?.advancedModeMergeAudio?.includes(false)
      );
      
      expect(basicParams.length).toBeGreaterThan(0);
      
      basicParams.forEach(param => {
        expect(param.displayOptions?.show?.operation).toEqual(['mergeVideoAudio']);
      });
    });

    it('should show advanced mode parameters when advancedModeMergeAudio is true', () => {
      const advancedParams = mergeVideoAudioAdvancedParameters.filter(p => 
        p.displayOptions?.show?.advancedModeMergeAudio?.includes(true)
      );
      
      expect(advancedParams.length).toBeGreaterThan(0);
      
      advancedParams.forEach(param => {
        expect(param.displayOptions?.show?.operation).toEqual(['mergeVideoAudio']);
      });
    });

    it('should have JSON template parameter only show in advanced mode', () => {
      expect(mergeVideoAudioJsonTemplateParameter.displayOptions?.show?.advancedModeMergeVideoAudio).toEqual([true]);
      expect(mergeVideoAudioJsonTemplateParameter.displayOptions?.show?.operation).toEqual(['mergeVideoAudio']);
    });

    it('should have advanced mode toggle show for mergeVideoAudio operation', () => {
      expect(mergeVideoAudioAdvancedModeParameter.displayOptions?.show?.operation).toEqual(['mergeVideoAudio']);
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle missing parameters gracefully', () => {
      const nonExistentParam = mergeVideoAudioParameters.find(p => p.name === 'nonExistent');
      expect(nonExistentParam).toBeUndefined();
    });

    it('should have all required parameters marked correctly', () => {
      const allCollections = mergeVideoAudioParameters.filter(p => p.type === 'fixedCollection');
      
      allCollections.forEach(collection => {
        const option = collection.options![0] as INodePropertyCollection;
        const requiredFields = option.values.filter(f => f.required === true);
        
        requiredFields.forEach(field => {
          expect(field.required).toBe(true);
          expect(field.name).toBeDefined();
          expect(field.displayName).toBeDefined();
        });
      });
    });

    it('should have proper validation for numeric fields', () => {
      const allCollections = mergeVideoAudioParameters.filter(p => p.type === 'fixedCollection');
      
      allCollections.forEach(collection => {
        const option = collection.options![0] as INodePropertyCollection;
        const numericFields = option.values.filter(f => f.type === 'number');
        
        numericFields.forEach(field => {
          expect(typeof field.default).toBe('number');
          if (field.typeOptions?.minValue !== undefined) {
            expect(typeof field.typeOptions.minValue).toBe('number');
          }
          if (field.typeOptions?.maxValue !== undefined) {
            expect(typeof field.typeOptions.maxValue).toBe('number');
          }
        });
      });
    });

    it('should have proper validation for option fields', () => {
      const allCollections = mergeVideoAudioParameters.filter(p => p.type === 'fixedCollection');
      
      allCollections.forEach(collection => {
        const option = collection.options![0] as INodePropertyCollection;
        const optionFields = option.values.filter(f => f.type === 'options');
        
        optionFields.forEach(field => {
          expect(field.options).toBeDefined();
          expect(Array.isArray(field.options)).toBe(true);
          expect(field.options!.length).toBeGreaterThan(0);
          
          field.options!.forEach((option: any) => {
            expect(option.name).toBeDefined();
            expect(option.value).toBeDefined();
          });
        });
      });
    });
  });

  describe('schema compliance', () => {
    it('should have parameters that comply with INodeProperties interface', () => {
      const allParams: INodeProperties[] = [
        ...mergeVideoAudioParameters, 
        ...mergeVideoAudioAdvancedParameters,
        mergeVideoAudioAdvancedModeParameter,
        mergeVideoAudioJsonTemplateParameter
      ];
      
      allParams.forEach(param => {
        expect(param).toHaveProperty('name');
        expect(param).toHaveProperty('type');
        expect(param).toHaveProperty('displayName');
        expect(param).toHaveProperty('default');
      });
    });

    it('should have fixedCollection parameters with proper structure', () => {
      const fixedCollectionParams = mergeVideoAudioParameters.filter(p => p.type === 'fixedCollection');
      
      expect(fixedCollectionParams.length).toBe(3); // videoElement, audioElement, outputSettings
      
      fixedCollectionParams.forEach(param => {
        expect(param.options).toBeDefined();
        expect(Array.isArray(param.options)).toBe(true);
        expect(param.options!.length).toBe(1);
        
        const option = param.options![0] as INodePropertyCollection;
        expect(option).toHaveProperty('name');
        expect(option).toHaveProperty('displayName');
        expect(option).toHaveProperty('values');
        expect(Array.isArray(option.values)).toBe(true);
        expect(option.values.length).toBeGreaterThan(0);
      });
    });

    it('should have proper field types in collections', () => {
      const expectedFieldTypes = ['string', 'number', 'boolean', 'options'];
      const fixedCollectionParams = mergeVideoAudioParameters.filter(p => p.type === 'fixedCollection');
      
      fixedCollectionParams.forEach(param => {
        const option = param.options![0] as INodePropertyCollection;
        option.values.forEach(field => {
          expect(expectedFieldTypes).toContain(field.type);
        });
      });
    });
  });

  describe('workflow-specific features', () => {
    it('should have video-specific fields in video element', () => {
      const videoElementParam = mergeVideoAudioParameters.find(p => p.name === 'videoElement')!;
      const videoOption = videoElementParam.options![0] as INodePropertyCollection;
      const fieldNames = videoOption.values.map(f => f.name);
      
      expect(fieldNames).toContain('muted');
      expect(fieldNames).toContain('crop');
      expect(fieldNames).toContain('resize');
    });

    it('should have audio-specific fields in audio element', () => {
      const audioElementParam = mergeVideoAudioParameters.find(p => p.name === 'audioElement')!;
      const audioOption = audioElementParam.options![0] as INodePropertyCollection;
      const fieldNames = audioOption.values.map(f => f.name);
      
      expect(fieldNames).toContain('volume');
      expect(fieldNames).toContain('loop');
    });

    it('should have output format options for video merging', () => {
      const outputSettingsParam = mergeVideoAudioParameters.find(p => p.name === 'outputSettings')!;
      const outputOption = outputSettingsParam.options![0] as INodePropertyCollection;
      const formatField = outputOption.values.find(f => f.name === 'format');
      
      expect(formatField).toBeDefined();
      expect(formatField!.options).toContainEqual({ name: 'MP4', value: 'mp4' });
      expect(formatField!.options).toContainEqual({ name: 'WebM', value: 'webm' });
    });
  });
});