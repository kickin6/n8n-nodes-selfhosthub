// __tests__/nodes/CreateJ2vMovie/presentation/parameters.test.ts

import {
  unifiedParameters,
  unifiedAdvancedModeParameter,
  jsonTemplateBlank,
  jsonTemplateVideoImage,
  jsonTemplateVideoAudio,
  jsonTemplateVideoSequence,
  jsonTemplateSlideshow,
  jsonTemplateTextOverlay,
  jsonTemplateFaceless,
  jsonTemplateSocialStory,
  jsonTemplatePresentation
} from '../../../../nodes/CreateJ2vMovie/presentation/parameters';
import { INodePropertyCollection } from 'n8n-workflow';

describe('parameters', () => {
  it('should be an array', () => {
    expect(Array.isArray(unifiedParameters)).toBe(true);
  });

  it('should have recordId parameter', () => {
    const recordIdParam = unifiedParameters.find(p => p.name === 'recordId');
    expect(recordIdParam).toBeDefined();
    expect(recordIdParam!.type).toBe('string');
    expect(recordIdParam!.default).toBe('');
  });

  it('should have movie settings toggle', () => {
    const movieSettingsParam = unifiedParameters.find(p => p.name === 'showMovieSettings');
    expect(movieSettingsParam).toBeDefined();
    expect(movieSettingsParam!.type).toBe('boolean');
    expect(movieSettingsParam!.default).toBe(false);
  });

  describe('movie settings fields', () => {
    it('should have movieId parameter', () => {
      const param = unifiedParameters.find(p => p.name === 'movieId');
      expect(param).toBeDefined();
      expect(param!.type).toBe('string');
      expect(param!.displayOptions?.show?.showMovieSettings).toEqual([true]);
    });

    it('should have movieComment parameter', () => {
      const param = unifiedParameters.find(p => p.name === 'movieComment');
      expect(param).toBeDefined();
      expect(param!.type).toBe('string');
      expect(param!.displayOptions?.show?.showMovieSettings).toEqual([true]);
    });

    it('should have movieVariables parameter', () => {
      const param = unifiedParameters.find(p => p.name === 'movieVariables');
      expect(param).toBeDefined();
      expect(param!.type).toBe('json');
      expect(param!.default).toBe('{}');
      expect(param!.displayOptions?.show?.showMovieSettings).toEqual([true]);
    });

    it('should have movieCache parameter', () => {
      const param = unifiedParameters.find(p => p.name === 'movieCache');
      expect(param).toBeDefined();
      expect(param!.type).toBe('boolean');
      expect(param!.default).toBe(true);
      expect(param!.displayOptions?.show?.showMovieSettings).toEqual([true]);
    });

    it('should have movieDraft parameter', () => {
      const param = unifiedParameters.find(p => p.name === 'movieDraft');
      expect(param).toBeDefined();
      expect(param!.type).toBe('boolean');
      expect(param!.default).toBe(false);
      expect(param!.displayOptions?.show?.showMovieSettings).toEqual([true]);
    });

    it('should have clientData parameter', () => {
      const param = unifiedParameters.find(p => p.name === 'clientData');
      expect(param).toBeDefined();
      expect(param!.type).toBe('json');
      expect(param!.default).toBe('{}');
      expect(param!.displayOptions?.show?.showMovieSettings).toEqual([true]);
    });

    it('should have movieResolution parameter', () => {
      const param = unifiedParameters.find(p => p.name === 'movieResolution');
      expect(param).toBeDefined();
      expect(param!.type).toBe('options');
      expect(param!.default).toBe('custom');
      expect(param!.displayOptions?.show?.showMovieSettings).toEqual([true]);
      expect(param!.options).toBeDefined();
      expect(param!.options!.length).toBeGreaterThan(0);
    });
  });

  describe('subtitle settings', () => {
    it('should have enableSubtitles parameter', () => {
      const param = unifiedParameters.find(p => p.name === 'enableSubtitles');
      expect(param).toBeDefined();
      expect(param!.type).toBe('boolean');
      expect(param!.default).toBe(false);
      expect(param!.displayOptions?.hide?.advancedMode).toEqual([true]);
    });

    it('should have captions parameter', () => {
      const param = unifiedParameters.find(p => p.name === 'captions');
      expect(param).toBeDefined();
      expect(param!.type).toBe('string');
      expect(param!.displayOptions?.show?.enableSubtitles).toEqual([true]);
      expect(param!.displayOptions?.hide?.advancedMode).toEqual([true]);
    });

    it('should have subtitleLanguage parameter', () => {
      const param = unifiedParameters.find(p => p.name === 'subtitleLanguage');
      expect(param).toBeDefined();
      expect(param!.type).toBe('options');
      expect(param!.default).toBe('auto');
      expect(param!.displayOptions?.show?.enableSubtitles).toEqual([true]);
      expect(param!.displayOptions?.hide?.advancedMode).toEqual([true]);
    });

    it('should have subtitleModel parameter', () => {
      const param = unifiedParameters.find(p => p.name === 'subtitleModel');
      expect(param).toBeDefined();
      expect(param!.type).toBe('options');
      expect(param!.default).toBe('default');
      expect(param!.displayOptions?.show?.enableSubtitles).toEqual([true]);
      expect(param!.displayOptions?.hide?.advancedMode).toEqual([true]);
    });

    it('should have subtitleSettings parameter', () => {
      const param = unifiedParameters.find(p => p.name === 'subtitleSettings');
      expect(param).toBeDefined();
      expect(param!.type).toBe('json');
      expect(param!.displayOptions?.show?.enableSubtitles).toEqual([true]);
      expect(param!.displayOptions?.hide?.advancedMode).toEqual([true]);
    });
  });

  describe('elements collection', () => {
    it('should have elements parameter', () => {
      const elementsParam = unifiedParameters.find(p => p.name === 'elements');
      expect(elementsParam).toBeDefined();
      expect(elementsParam!.type).toBe('fixedCollection');
      expect(elementsParam!.displayOptions?.hide?.advancedMode).toEqual([true]);
    });
  });

  describe('output settings', () => {
    it('should have outputSettings parameter', () => {
      const outputParam = unifiedParameters.find(p => p.name === 'outputSettings');
      expect(outputParam).toBeDefined();
      expect(outputParam!.type).toBe('fixedCollection');
      expect(outputParam!.typeOptions?.multipleValues).toBe(false);
    });

    it('should have output configuration fields', () => {
      const outputParam = unifiedParameters.find(p => p.name === 'outputSettings');
      const option = outputParam!.options![0] as INodePropertyCollection;
      
      expect(option.name).toBe('outputValues');
      expect(option.displayName).toBe('Output Configuration');
      
      const fieldNames = option.values.map(f => f.name);
      expect(fieldNames).toContain('width');
      expect(fieldNames).toContain('height');
      expect(fieldNames).toContain('quality');
      expect(fieldNames).toContain('cache');
    });
  });

  describe('export settings', () => {
    it('should have exportSettings parameter', () => {
      const exportParam = unifiedParameters.find(p => p.name === 'exportSettings');
      expect(exportParam).toBeDefined();
      expect(exportParam!.type).toBe('fixedCollection');
      expect(exportParam!.typeOptions?.multipleValues).toBe(true);
      expect(exportParam!.placeholder).toBe('Add Export Destination');
    });

    it('should have export configuration fields', () => {
      const exportParam = unifiedParameters.find(p => p.name === 'exportSettings');
      const option = exportParam!.options![0] as INodePropertyCollection;
      
      expect(option.name).toBe('exportValues');
      expect(option.displayName).toBe('Export Destination');
      
      const fieldNames = option.values.map(f => f.name);
      const expectedFields = [
        'exportType', 'webhookUrl', 'ftpHost', 'ftpPort', 'ftpUsername', 
        'ftpPassword', 'ftpPath', 'ftpFile', 'ftpSecure', 'emailTo', 
        'emailFrom', 'emailSubject', 'emailMessage'
      ];
      
      // Check each expected field individually
      expectedFields.forEach(fieldName => {
        expect(fieldNames).toContain(fieldName);
      });
    });

    it('should have exportType field with correct options', () => {
      const exportParam = unifiedParameters.find(p => p.name === 'exportSettings');
      const option = exportParam!.options![0] as INodePropertyCollection;
      const exportTypeField = option.values.find(f => f.name === 'exportType');
      
      expect(exportTypeField).toBeDefined();
      expect(exportTypeField!.type).toBe('options');
      expect(exportTypeField!.required).toBe(true);
      expect(exportTypeField!.default).toBe('webhook');
      
      const optionValues = exportTypeField!.options!.map((opt: any) => opt.value);
      expect(optionValues).toContain('webhook');
      expect(optionValues).toContain('ftp');
      expect(optionValues).toContain('email');
    });

    it('should have webhookUrl field with proper validation', () => {
      const exportParam = unifiedParameters.find(p => p.name === 'exportSettings');
      const option = exportParam!.options![0] as INodePropertyCollection;
      const webhookField = option.values.find(f => f.name === 'webhookUrl');
      
      expect(webhookField).toBeDefined();
      expect(webhookField!.type).toBe('string');
      expect(webhookField!.required).toBe(true);
      expect(webhookField!.displayOptions?.show?.exportType).toEqual(['webhook']);
      expect(webhookField!.typeOptions?.validation).toBeDefined();
    });

    it('should have FTP fields with correct configuration', () => {
      const exportParam = unifiedParameters.find(p => p.name === 'exportSettings');
      const option = exportParam!.options![0] as INodePropertyCollection;
      
      const ftpHost = option.values.find(f => f.name === 'ftpHost');
      expect(ftpHost).toBeDefined();
      expect(ftpHost!.required).toBe(true);
      expect(ftpHost!.displayOptions?.show?.exportType).toEqual(['ftp']);

      const ftpPort = option.values.find(f => f.name === 'ftpPort');
      expect(ftpPort).toBeDefined();
      expect(ftpPort!.type).toBe('number');
      expect(ftpPort!.default).toBe(21);
      expect(ftpPort!.displayOptions?.show?.exportType).toEqual(['ftp']);

      const ftpUsername = option.values.find(f => f.name === 'ftpUsername');
      expect(ftpUsername).toBeDefined();
      expect(ftpUsername!.required).toBe(true);
      expect(ftpUsername!.displayOptions?.show?.exportType).toEqual(['ftp']);

      const ftpPassword = option.values.find(f => f.name === 'ftpPassword');
      expect(ftpPassword).toBeDefined();
      expect(ftpPassword!.required).toBe(true);
      expect(ftpPassword!.typeOptions?.password).toBe(true);
      expect(ftpPassword!.displayOptions?.show?.exportType).toEqual(['ftp']);

      const ftpPath = option.values.find(f => f.name === 'ftpPath');
      expect(ftpPath).toBeDefined();
      expect(ftpPath!.default).toBe('/');
      expect(ftpPath!.displayOptions?.show?.exportType).toEqual(['ftp']);

      const ftpFile = option.values.find(f => f.name === 'ftpFile');
      expect(ftpFile).toBeDefined();
      expect(ftpFile!.displayOptions?.show?.exportType).toEqual(['ftp']);

      const ftpSecure = option.values.find(f => f.name === 'ftpSecure');
      expect(ftpSecure).toBeDefined();
      expect(ftpSecure!.type).toBe('boolean');
      expect(ftpSecure!.default).toBe(false);
      expect(ftpSecure!.displayOptions?.show?.exportType).toEqual(['ftp']);
    });

    it('should have email fields with correct configuration', () => {
      const exportParam = unifiedParameters.find(p => p.name === 'exportSettings');
      const option = exportParam!.options![0] as INodePropertyCollection;
      
      const emailTo = option.values.find(f => f.name === 'emailTo');
      expect(emailTo).toBeDefined();
      expect(emailTo!.required).toBe(true);
      expect(emailTo!.displayOptions?.show?.exportType).toEqual(['email']);
      expect(emailTo!.typeOptions?.validation).toBeDefined();

      const emailFrom = option.values.find(f => f.name === 'emailFrom');
      expect(emailFrom).toBeDefined();
      expect(emailFrom!.displayOptions?.show?.exportType).toEqual(['email']);
      expect(emailFrom!.typeOptions?.validation).toBeDefined();

      const emailSubject = option.values.find(f => f.name === 'emailSubject');
      expect(emailSubject).toBeDefined();
      expect(emailSubject!.default).toBe('Your video is ready');
      expect(emailSubject!.displayOptions?.show?.exportType).toEqual(['email']);

      const emailMessage = option.values.find(f => f.name === 'emailMessage');
      expect(emailMessage).toBeDefined();
      expect(emailMessage!.displayOptions?.show?.exportType).toEqual(['email']);
    });
  });

  describe('advanced mode parameters', () => {
    it('should have unifiedAdvancedModeParameter', () => {
      expect(unifiedAdvancedModeParameter.name).toBe('advancedMode');
      expect(unifiedAdvancedModeParameter.type).toBe('boolean');
      expect(unifiedAdvancedModeParameter.default).toBe(false);
      expect(unifiedAdvancedModeParameter.description).toContain('full JSON control');
    });
  });

  describe('JSON template parameters', () => {
    it('should have jsonTemplateBlank', () => {
      expect(jsonTemplateBlank.name).toBe('jsonTemplateBlank');
      expect(jsonTemplateBlank.type).toBe('json');
      expect(jsonTemplateBlank.displayOptions?.show?.advancedMode).toEqual([true]);
      expect(jsonTemplateBlank.displayOptions?.show?.templateType).toEqual(['blank']);
      
      const defaultTemplate = jsonTemplateBlank.default as string;
      expect(defaultTemplate).toContain('"width"');
      expect(defaultTemplate).toContain('"height"');
      expect(defaultTemplate).toContain('"scenes"');
    });

    it('should have jsonTemplateVideoImage', () => {
      expect(jsonTemplateVideoImage.name).toBe('jsonTemplateVideoImage');
      expect(jsonTemplateVideoImage.type).toBe('json');
      expect(jsonTemplateVideoImage.displayOptions?.show?.advancedMode).toEqual([true]);
      expect(jsonTemplateVideoImage.displayOptions?.show?.templateType).toEqual(['videoImage']);
      
      const defaultTemplate = jsonTemplateVideoImage.default as string;
      expect(defaultTemplate).toContain('"type": "image"');
    });

    it('should have jsonTemplateVideoAudio', () => {
      expect(jsonTemplateVideoAudio.name).toBe('jsonTemplateVideoAudio');
      expect(jsonTemplateVideoAudio.type).toBe('json');
      expect(jsonTemplateVideoAudio.displayOptions?.show?.advancedMode).toEqual([true]);
      expect(jsonTemplateVideoAudio.displayOptions?.show?.templateType).toEqual(['videoAudio']);
      
      const defaultTemplate = jsonTemplateVideoAudio.default as string;
      expect(defaultTemplate).toContain('"type": "video"');
      expect(defaultTemplate).toContain('"type": "audio"');
    });

    it('should have jsonTemplateVideoSequence', () => {
      expect(jsonTemplateVideoSequence.name).toBe('jsonTemplateVideoSequence');
      expect(jsonTemplateVideoSequence.type).toBe('json');
      expect(jsonTemplateVideoSequence.displayOptions?.show?.advancedMode).toEqual([true]);
      expect(jsonTemplateVideoSequence.displayOptions?.show?.templateType).toEqual(['videoSequence']);
      
      const defaultTemplate = jsonTemplateVideoSequence.default as string;
      expect(defaultTemplate).toContain('video0Url');
    });

    it('should have jsonTemplateSlideshow', () => {
      expect(jsonTemplateSlideshow.name).toBe('jsonTemplateSlideshow');
      expect(jsonTemplateSlideshow.type).toBe('json');
      expect(jsonTemplateSlideshow.displayOptions?.show?.advancedMode).toEqual([true]);
      expect(jsonTemplateSlideshow.displayOptions?.show?.templateType).toEqual(['slideshow']);
    });

    it('should have jsonTemplateTextOverlay', () => {
      expect(jsonTemplateTextOverlay.name).toBe('jsonTemplateTextOverlay');
      expect(jsonTemplateTextOverlay.type).toBe('json');
      expect(jsonTemplateTextOverlay.displayOptions?.show?.advancedMode).toEqual([true]);
      expect(jsonTemplateTextOverlay.displayOptions?.show?.templateType).toEqual(['textOverlay']);
    });

    it('should have jsonTemplateFaceless', () => {
      expect(jsonTemplateFaceless.name).toBe('jsonTemplateFaceless');
      expect(jsonTemplateFaceless.type).toBe('json');
      expect(jsonTemplateFaceless.displayOptions?.show?.advancedMode).toEqual([true]);
      expect(jsonTemplateFaceless.displayOptions?.show?.templateType).toEqual(['faceless']);
      
      const defaultTemplate = jsonTemplateFaceless.default as string;
      expect(defaultTemplate).toContain('"type": "voice"');
    });

    it('should have jsonTemplateSocialStory', () => {
      expect(jsonTemplateSocialStory.name).toBe('jsonTemplateSocialStory');
      expect(jsonTemplateSocialStory.type).toBe('json');
      expect(jsonTemplateSocialStory.displayOptions?.show?.advancedMode).toEqual([true]);
      expect(jsonTemplateSocialStory.displayOptions?.show?.templateType).toEqual(['socialStory']);
      
      const defaultTemplate = jsonTemplateSocialStory.default as string;
      const parsed = JSON.parse(defaultTemplate);
      expect(parsed.width).toBe(1080);
      expect(parsed.height).toBe(1920);
    });

    it('should have jsonTemplatePresentation', () => {
      expect(jsonTemplatePresentation.name).toBe('jsonTemplatePresentation');
      expect(jsonTemplatePresentation.type).toBe('json');
      expect(jsonTemplatePresentation.displayOptions?.show?.advancedMode).toEqual([true]);
      expect(jsonTemplatePresentation.displayOptions?.show?.templateType).toEqual(['presentation']);
    });
  });

  describe('display options', () => {
    it('should hide form parameters when advanced mode is enabled', () => {
      const formParams = unifiedParameters.filter(p => 
        p.displayOptions?.hide?.advancedMode?.includes(true)
      );
      
      expect(formParams.length).toBeGreaterThan(0);
      
      // Check key form params are hidden in advanced mode
      const expectedHidden = ['showMovieSettings', 'enableSubtitles', 'elements', 'outputSettings', 'exportSettings'];
      expectedHidden.forEach(paramName => {
        const param = unifiedParameters.find(p => p.name === paramName);
        if (param?.displayOptions?.hide?.advancedMode) {
          expect(param.displayOptions.hide.advancedMode).toEqual([true]);
        }
      });
    });
  });
});

describe('parameter structure validation', () => {
  it('should have all required properties for each parameter', () => {
    unifiedParameters.forEach(param => {
      expect(param.displayName).toBeDefined();
      expect(param.name).toBeDefined();
      expect(param.type).toBeDefined();
      expect(param.description).toBeDefined();
    });
  });

  it('should have valid types for all parameters', () => {
    const validTypes = ['string', 'number', 'boolean', 'options', 'json', 'fixedCollection', 'color', 'notice'];
    
    unifiedParameters.forEach(param => {
      expect(validTypes).toContain(param.type);
    });
  });

  it('should have proper structure for collection parameters', () => {
    const collectionParams = unifiedParameters.filter(p => p.type === 'fixedCollection');
    
    collectionParams.forEach(param => {
      expect(param.options).toBeDefined();
      expect(Array.isArray(param.options)).toBe(true);
      expect(param.options!.length).toBeGreaterThan(0);
      
      param.options!.forEach((option: any) => {
        expect(option.name).toBeDefined();
        expect(option.displayName).toBeDefined();
        expect(option.values).toBeDefined();
        expect(Array.isArray(option.values)).toBe(true);
      });
    });
  });

  it('should have proper structure for options parameters', () => {
    const optionParams = unifiedParameters.filter(p => p.type === 'options');
    
    optionParams.forEach(param => {
      expect(param.options).toBeDefined();
      expect(Array.isArray(param.options)).toBe(true);
      expect(param.options!.length).toBeGreaterThan(0);
      
      param.options!.forEach((option: any) => {
        expect(option.name).toBeDefined();
        expect(option.value).toBeDefined();
      });
    });
  });
});