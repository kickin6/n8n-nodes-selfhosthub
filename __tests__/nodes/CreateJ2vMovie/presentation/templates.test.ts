// __tests__/nodes/CreateJ2vMovie/presentation/templates.test.ts

import { INodeProperties, INodePropertyOptions } from 'n8n-workflow';
import { templateSelectorParameter } from '../../../../nodes/CreateJ2vMovie/presentation/templates';

describe('CreateJ2vMovie Templates', () => {
  describe('templateSelectorParameter', () => {
    it('should have correct basic structure', () => {
      expect(templateSelectorParameter.displayName).toBe('Template');
      expect(templateSelectorParameter.name).toBe('templateType');
      expect(templateSelectorParameter.type).toBe('options');
      expect(templateSelectorParameter.default).toBe('blank');
    });

    it('should have all 9 template options', () => {
      expect(templateSelectorParameter.options).toHaveLength(9);
      
      const optionValues = (templateSelectorParameter.options as INodePropertyOptions[])?.map(opt => opt.value);
      expect(optionValues).toEqual([
        'blank',
        'videoImage',
        'videoAudio',
        'videoSequence',
        'slideshow',
        'textOverlay',
        'faceless',
        'socialStory',
        'presentation'
      ]);
    });

    it('should have proper option names and descriptions', () => {
      const options = templateSelectorParameter.options as INodePropertyOptions[] || [];
      
      expect(options[0]).toEqual({
        name: 'Blank Template',
        value: 'blank',
        description: 'Empty template to start from scratch'
      });

      expect(options[1]).toEqual({
        name: 'Video from images',
        value: 'videoImage',
        description: 'Create video from images'
      });

      expect(options[2]).toEqual({
        name: 'Video + Audio Merge',
        value: 'videoAudio',
        description: 'Merge video with audio track'
      });

      expect(options[3]).toEqual({
        name: 'Video Sequence',
        value: 'videoSequence',
        description: 'Merge multiple videos in sequence'
      });

      expect(options[4]).toEqual({
        name: 'Image Slideshow',
        value: 'slideshow',
        description: 'Create slideshow from images with transitions'
      });

      expect(options[5]).toEqual({
        name: 'Video with Text Overlay',
        value: 'textOverlay',
        description: 'Add text overlays to video'
      });

      expect(options[6]).toEqual({
        name: 'Faceless Video (TTS + Visuals)',
        value: 'faceless',
        description: 'Create faceless video with AI voice and visuals'
      });

      expect(options[7]).toEqual({
        name: 'Social Media Story (9:16)',
        value: 'socialStory',
        description: 'Vertical video for Instagram/TikTok'
      });

      expect(options[8]).toEqual({
        name: 'Presentation/Tutorial',
        value: 'presentation',
        description: 'Educational content with voice and visuals'
      });
    });

    it('should only display when advanced mode is enabled', () => {
      expect(templateSelectorParameter.displayOptions).toEqual({
        show: {
          advancedMode: [true]
        }
      });
    });

    it('should have correct description', () => {
      expect(templateSelectorParameter.description).toBe('Select a pre-built template to start with');
    });

    it('should be a valid INodeProperties object', () => {
      // Verify all required properties exist
      expect(templateSelectorParameter).toHaveProperty('displayName');
      expect(templateSelectorParameter).toHaveProperty('name');
      expect(templateSelectorParameter).toHaveProperty('type');
      expect(templateSelectorParameter).toHaveProperty('options');
      expect(templateSelectorParameter).toHaveProperty('default');
      expect(templateSelectorParameter).toHaveProperty('description');
      expect(templateSelectorParameter).toHaveProperty('displayOptions');
    });

    it('should have correct type annotations', () => {
      // Type checking - this will fail compilation if types are wrong
      const param: INodeProperties = templateSelectorParameter;
      expect(param).toBeDefined();
    });
  });

  describe('Template Integration', () => {
    it('should map template values to corresponding JSON parameters', () => {
      const templateToJsonFieldMap: Record<string, string> = {
        'blank': 'jsonTemplateBlank',
        'videoImage': 'jsonTemplateVideoImage',
        'videoAudio': 'jsonTemplateVideoAudio',
        'videoSequence': 'jsonTemplateVideoSequence',
        'slideshow': 'jsonTemplateSlideshow',
        'textOverlay': 'jsonTemplateTextOverlay',
        'faceless': 'jsonTemplateFaceless',
        'socialStory': 'jsonTemplateSocialStory',
        'presentation': 'jsonTemplatePresentation',
      };

      // Verify all template options have corresponding JSON field names
      const options = templateSelectorParameter.options as INodePropertyOptions[] || [];
      options.forEach(option => {
        expect(templateToJsonFieldMap).toHaveProperty(option.value as string);
      });
    });
  });

  describe('Template Descriptions', () => {
    it('should have user-friendly descriptions', () => {
      const options = templateSelectorParameter.options as INodePropertyOptions[] || [];
      
      options.forEach(option => {
        // Verify each description is non-empty and descriptive
        expect(option.description).toBeTruthy();
        expect(option.description!.length).toBeGreaterThan(10);
        
        // Verify descriptions don't contain technical jargon
        expect(option.description).not.toContain('JSON');
        expect(option.description).not.toContain('API');
        expect(option.description).not.toContain('parameter');
      });
    });

    it('should indicate video format for social media template', () => {
      const options = templateSelectorParameter.options as INodePropertyOptions[] || [];
      const socialStoryOption = options.find(
        opt => opt.value === 'socialStory'
      );
      
      expect(socialStoryOption).toBeDefined();
      expect(socialStoryOption!.name).toContain('9:16');
      expect(socialStoryOption!.description).toContain('Instagram');
      expect(socialStoryOption!.description).toContain('TikTok');
    });

    it('should indicate TTS capability for faceless template', () => {
      const options = templateSelectorParameter.options as INodePropertyOptions[] || [];
      const facelessOption = options.find(
        opt => opt.value === 'faceless'
      );
      
      expect(facelessOption).toBeDefined();
      expect(facelessOption!.name).toContain('TTS');
      expect(facelessOption!.description).toContain('voice');
    });
  });

  describe('Template Selection Logic', () => {
    it('should have blank as default template', () => {
      expect(templateSelectorParameter.default).toBe('blank');
    });

    it('should have unique template values', () => {
      const options = templateSelectorParameter.options as INodePropertyOptions[] || [];
      const values = options.map(opt => opt.value) || [];
      const uniqueValues = new Set(values);
      expect(uniqueValues.size).toBe(values.length);
    });

    it('should have unique template names', () => {
      const options = templateSelectorParameter.options as INodePropertyOptions[] || [];
      const names = options.map(opt => opt.name) || [];
      const uniqueNames = new Set(names);
      expect(uniqueNames.size).toBe(names.length);
    });
  });
});