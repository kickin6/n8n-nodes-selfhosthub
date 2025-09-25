// __tests__/nodes/CreateJ2vMovie/presentation/properties.test.ts

import { INodeProperties } from 'n8n-workflow';
import { getAllNodeProperties } from '../../../../nodes/CreateJ2vMovie/presentation/properties';

describe('CreateJ2vMovie Properties', () => {
  describe('getAllNodeProperties', () => {
    let properties: INodeProperties[];

    beforeEach(() => {
      properties = getAllNodeProperties();
    });

    it('should return an array of properties', () => {
      expect(Array.isArray(properties)).toBe(true);
      expect(properties.length).toBeGreaterThan(0);
    });

    it('should include advanced mode parameter as first item', () => {
      const advancedMode = properties[0];
      expect(advancedMode.name).toBe('advancedMode');
      expect(advancedMode.type).toBe('boolean');
      expect(advancedMode.default).toBe(false);
      expect(advancedMode.displayName).toBe('Advanced Mode');
    });

    it('should include template selector parameter as second item', () => {
      const templateSelector = properties[1];
      expect(templateSelector.name).toBe('templateType');
      expect(templateSelector.type).toBe('options');
      expect(templateSelector.default).toBe('blank');
      expect(templateSelector.displayOptions).toEqual({
        show: {
          advancedMode: [true]
        }
      });
    });

    it('should include all unified parameters', () => {
      // Check for key parameters that should exist
      const recordId = properties.find(p => p.name === 'recordId');
      expect(recordId).toBeDefined();
      expect(recordId?.type).toBe('string');

      const elements = properties.find(p => p.name === 'elements');
      expect(elements).toBeDefined();
      expect(elements?.type).toBe('fixedCollection');

      const outputSettings = properties.find(p => p.name === 'outputSettings');
      expect(outputSettings).toBeDefined();
      expect(outputSettings?.type).toBe('fixedCollection');

      const exportSettings = properties.find(p => p.name === 'exportSettings');
      expect(exportSettings).toBeDefined();
      expect(exportSettings?.type).toBe('fixedCollection');
    });

    it('should include all JSON template parameters', () => {
      const templateParams = [
        'jsonTemplateBlank',
        'jsonTemplateVideoImage',
        'jsonTemplateVideoAudio',
        'jsonTemplateVideoSequence',
        'jsonTemplateSlideshow',
        'jsonTemplateTextOverlay',
        'jsonTemplateFaceless',
        'jsonTemplateSocialStory',
        'jsonTemplatePresentation'
      ];

      templateParams.forEach(paramName => {
        const param = properties.find(p => p.name === paramName);
        expect(param).toBeDefined();
        expect(param?.type).toBe('json');
        expect(param?.displayOptions).toBeDefined();
      });
    });

    it('should have correct display options for template JSON fields', () => {
      const jsonTemplateBlank = properties.find(p => p.name === 'jsonTemplateBlank');
      expect(jsonTemplateBlank?.displayOptions).toEqual({
        show: {
          advancedMode: [true],
          templateType: ['blank']
        }
      });

      const jsonTemplateVideoAudio = properties.find(p => p.name === 'jsonTemplateVideoAudio');
      expect(jsonTemplateVideoAudio?.displayOptions).toEqual({
        show: {
          advancedMode: [true],
          templateType: ['videoAudio']
        }
      });
    });

    it('should include movie settings parameters', () => {
      const movieSettingsToggle = properties.find(p => p.name === 'showMovieSettings');
      expect(movieSettingsToggle).toBeDefined();
      expect(movieSettingsToggle?.type).toBe('boolean');

      const movieId = properties.find(p => p.name === 'movieId');
      expect(movieId).toBeDefined();
      expect(movieId?.displayOptions?.show).toEqual({ showMovieSettings: [true] });
    });

    it('should include subtitle parameters', () => {
      const enableSubtitles = properties.find(p => p.name === 'enableSubtitles');
      expect(enableSubtitles).toBeDefined();
      expect(enableSubtitles?.type).toBe('boolean');

      const captions = properties.find(p => p.name === 'captions');
      expect(captions).toBeDefined();
      expect(captions?.displayOptions?.show).toEqual({ enableSubtitles: [true] });
    });

    it('should have properties in correct order', () => {
      // Verify the order matches our getAllNodeProperties function
      expect(properties[0].name).toBe('advancedMode'); // unifiedAdvancedModeParameter
      expect(properties[1].name).toBe('templateType'); // templateSelectorParameter
      expect(properties[2].name).toBe('recordId'); // First item in unifiedParameters
      
      // Last items should be the JSON templates
      const lastItems = properties.slice(-9);
      const jsonTemplateNames = [
        'jsonTemplateBlank',
        'jsonTemplateVideoImage',
        'jsonTemplateVideoAudio',
        'jsonTemplateVideoSequence',
        'jsonTemplateSlideshow',
        'jsonTemplateTextOverlay',
        'jsonTemplateFaceless',
        'jsonTemplateSocialStory',
        'jsonTemplatePresentation'
      ];
      
      lastItems.forEach((item, index) => {
        expect(item.name).toBe(jsonTemplateNames[index]);
      });
    });
  });

  describe('Property visibility rules', () => {
    let properties: INodeProperties[];

    beforeEach(() => {
      properties = getAllNodeProperties();
    });

    it('should hide form parameters when advanced mode is true', () => {
      const formParams = [
        'showMovieSettings',
        'movieId',
        'enableSubtitles',
        'captions',
        'elements',
        'outputSettings',
        'exportSettings'
      ];

      formParams.forEach(paramName => {
        const param = properties.find(p => p.name === paramName);
        if (param?.displayOptions?.hide) {
          expect(param.displayOptions.hide).toEqual({ advancedMode: [true] });
        }
      });
    });

    it('should show template selector only in advanced mode', () => {
      const templateSelector = properties.find(p => p.name === 'templateType');
      expect(templateSelector?.displayOptions?.show).toEqual({ advancedMode: [true] });
    });

    it('should show correct JSON field based on template selection', () => {
      const templates = [
        { name: 'jsonTemplateBlank', template: 'blank' },
        { name: 'jsonTemplateVideoImage', template: 'videoImage' },
        { name: 'jsonTemplateVideoAudio', template: 'videoAudio' },
        { name: 'jsonTemplateVideoSequence', template: 'videoSequence' },
        { name: 'jsonTemplateSlideshow', template: 'slideshow' },
        { name: 'jsonTemplateTextOverlay', template: 'textOverlay' },
        { name: 'jsonTemplateFaceless', template: 'faceless' },
        { name: 'jsonTemplateSocialStory', template: 'socialStory' },
        { name: 'jsonTemplatePresentation', template: 'presentation' }
      ];

      templates.forEach(({ name, template }) => {
        const param = properties.find(p => p.name === name);
        expect(param?.displayOptions?.show).toEqual({
          advancedMode: [true],
          templateType: [template]
        });
      });
    });
  });

  describe('Template content', () => {
    let properties: INodeProperties[];

    beforeEach(() => {
      properties = getAllNodeProperties();
    });

    it('should have valid JSON in all template defaults', () => {
      const jsonTemplates = properties.filter(p => p.name.startsWith('jsonTemplate'));
      
      jsonTemplates.forEach(template => {
        console.log("LOG")
        console.debug("DEBUG")
        expect(() => JSON.parse(template.default as string)).not.toThrow();
        
        const parsed = JSON.parse(template.default as string);
        expect(parsed).toHaveProperty('width');
        expect(parsed).toHaveProperty('height');
        expect(parsed).toHaveProperty('quality');
        expect(parsed).toHaveProperty('scenes');
      });
    });

    it('should have appropriate content in video+audio template', () => {
      const template = properties.find(p => p.name === 'jsonTemplateVideoAudio');
      const parsed = JSON.parse(template?.default as string);
      
      expect(parsed.scenes[0].elements).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ type: 'video' }),
          expect.objectContaining({ type: 'audio' })
        ])
      );
    });

    it('should have vertical dimensions in social story template', () => {
      const template = properties.find(p => p.name === 'jsonTemplateSocialStory');
      const parsed = JSON.parse(template?.default as string);
      
      expect(parsed.width).toBe(1080);
      expect(parsed.height).toBe(1920);
    });

    it('should have AI elements in faceless template', () => {
      const template = properties.find(p => p.name === 'jsonTemplateFaceless');
      const parsed = JSON.parse(template?.default as string);
      
      // Check for voice elements
      const hasVoice = parsed.scenes.some((scene: any) => 
        scene.elements?.some((el: any) => el.type === 'voice')
      );
      expect(hasVoice).toBe(true);
      
      // Check for AI image generation
      const hasAIImage = parsed.scenes.some((scene: any) =>
        scene.elements?.some((el: any) => el.type === 'image' && el.prompt)
      );
      expect(hasAIImage).toBe(true);
    });
  });
});