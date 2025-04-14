# Leonardo.ai API Parameters Reference

This document provides a comprehensive list of all parameters available in the Leonardo.ai API for image generation, along with their possible values, defaults, and special notes.

## Required Parameters

| Parameter | Type   | Default                      | Description                        |
| --------- | ------ | ---------------------------- | ---------------------------------- |
| prompt    | string | "A majestic cat in the snow" | The prompt used to generate images |

## Optional Parameters with Select/Dropdown Values

### presetStyle

**Type:** string or null  
**Default:** "DYNAMIC"  
**Description:** The style to generate images with.

**Possible Values:**

- ANIME
- BOKEH
- CINEMATIC
- CINEMATIC_CLOSEUP
- CREATIVE
- DYNAMIC
- ENVIRONMENT
- FASHION
- FILM
- FOOD
- GENERAL
- HDR
- ILLUSTRATION
- LEONARDO
- LONG_EXPOSURE
- MACRO
- MINIMALISTIC
- MONOCHROME
- MOODY
- NONE
- NEUTRAL
- PHOTOGRAPHY
- PORTRAIT
- RAYTRACED
- RENDER_3D
- RETRO
- SKETCH_BW
- SKETCH_COLOR
- STOCK_PHOTO
- VIBRANT
- UNPROCESSED

**Special Notes:**

- When photoReal is enabled, refer to the Guide section for a full list
- When alchemy is disabled, use LEONARDO or NONE
- When alchemy is enabled, use ANIME, CREATIVE, DYNAMIC, ENVIRONMENT, GENERAL, ILLUSTRATION, PHOTOGRAPHY, RAYTRACED, RENDER_3D, SKETCH_BW, SKETCH_COLOR, or NONE

### scheduler

**Type:** string  
**Default:** "EULER_DISCRETE" (if not specified)  
**Description:** The scheduler to generate images with.

**Possible Values:**

- KLMS
- EULER_ANCESTRAL_DISCRETE
- EULER_DISCRETE
- DDIM
- DPM_SOLVER
- PNDM
- LEONARDO

**Special Notes:**

- When using the LEONARDO scheduler without Alchemy, guidance scale cannot exceed 7

### sd_version

**Type:** string  
**Description:** The base version of stable diffusion to use if not using a custom model.

**Possible Values:**

- v1_5 (default if not specified, corresponds to SD 1.5)
- v2 (corresponds to SD 2.1)
- v3
- SDXL_0_8
- SDXL_0_9
- SDXL_1_0
- SDXL_LIGHTNING
- PHOENIX
- FLUX
- FLUX_DEV

### canvasRequestType

**Type:** string or null  
**Description:** The type of request for the Canvas Editor.

**Possible Values:**

- INPAINT
- OUTPAINT
- SKETCH2IMG
- IMG2IMG

### transparency

**Type:** string or null  
**Description:** Which type of transparency this image should use.

**Possible Values:**

- disabled
- foreground_only

## Boolean Parameters (true/false)

| Parameter      | Default | Description                                                                                                                                   |
| -------------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| alchemy        | true    | Enable to use Alchemy. Note: The appropriate Alchemy version is selected for the specified model. For example, XL models will use Alchemy V2. |
| expandedDomain | -       | Enable to use the Expanded Domain feature of Alchemy.                                                                                         |
| fantasyAvatar  | -       | Enable to use the Fantasy Avatar feature.                                                                                                     |
| highContrast   | -       | Enable to use the High Contrast feature of Prompt Magic. Note: Controls RAW mode. Set to false to enable RAW mode.                            |
| highResolution | -       | Enable to use the High Resolution feature of Prompt Magic.                                                                                    |
| photoReal      | -       | Enable the photoReal feature. Requires enabling alchemy and unspecifying modelId (for photoRealVersion V1).                                   |
| promptMagic    | -       | Enable to use Prompt Magic.                                                                                                                   |
| public         | -       | Whether the generated images should show in the community feed.                                                                               |
| tiling         | -       | Whether the generated images should tile on all axis.                                                                                         |
| ultra          | -       | Enable to use Ultra mode. Note: can not be used with Alchemy.                                                                                 |
| unzoom         | -       | Whether the generated images should be unzoomed (requires unzoomAmount and init_image_id to be set).                                          |
| canvasRequest  | -       | Whether the generation is for the Canvas Editor feature.                                                                                      |
| enhancePrompt  | -       | When enabled, your prompt is expanded to include more detail.                                                                                 |

## Numeric/String Parameters

| Parameter                | Type            | Default                                | Range                                                | Description                                                                                                                                                                                                                                                                                                                     |
| ------------------------ | --------------- | -------------------------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| contrastRatio            | number or null  | -                                      | 0 to 1 inclusive                                     | Contrast Ratio to use with Alchemy. Must be a float between 0 and 1 inclusive.                                                                                                                                                                                                                                                  |
| contrast                 | number or null  | -                                      | 1 to 4.5                                             | Adjusts the contrast level of the generated image. Used in Phoenix and Flux models. Accepts values [1.0, 1.3, 1.8, 2.5, 3, 3.5, 4, 4.5]. For Phoenix, if alchemy is true, contrast needs to be 2.5 or higher.                                                                                                                   |
| guidance_scale           | integer or null | -                                      | 1 to 20                                              | How strongly the generation should reflect the prompt. 7 is recommended. Must be between 1 and 20.                                                                                                                                                                                                                              |
| height                   | integer or null | 768                                    | 32 to 1536                                           | The input height of the images. Must be between 32 and 1536 and be a multiple of 8. Note: Input resolution is not always the same as output resolution due to upscaling from other features.                                                                                                                                    |
| imagePromptWeight        | number or null  | -                                      | -                                                    | Weight for image prompts.                                                                                                                                                                                                                                                                                                       |
| init_strength            | number or null  | -                                      | 0.1 to 0.9                                           | How strongly the generated images should reflect the original image in image2image. Must be a float between 0.1 and 0.9.                                                                                                                                                                                                        |
| modelId                  | string or null  | "b24e16ff-06e3-43eb-8d33-4416c2d75876" | -                                                    | The model ID used for image generation. If not provided, uses sd_version to determine the version of Stable Diffusion to use. In-app, model IDs are under the Finetune Models menu. Click on the platform model or your custom model, then click View More. For platform models, you can also use the List Platform Models API. |
| negative_prompt          | string or null  | -                                      | -                                                    | The negative prompt used for the image generation.                                                                                                                                                                                                                                                                              |
| num_images               | integer or null | 4                                      | 1 to 8                                               | The number of images to generate. Must be between 1 and 8. If either width or height is over 768, must be between 1 and 4.                                                                                                                                                                                                      |
| num_inference_steps      | integer or null | 15 (default)                           | 10 to 60                                             | The Step Count to use for the generation. Must be between 10 and 60.                                                                                                                                                                                                                                                            |
| photoRealVersion         | string or null  | -                                      | "v1" or "v2"                                         | The version of photoReal to use. Must be v1 or v2.                                                                                                                                                                                                                                                                              |
| photoRealStrength        | number or null  | 0.55 (default)                         | -                                                    | Depth of field of photoReal. Must be 0.55 for low, 0.5 for medium, or 0.45 for high.                                                                                                                                                                                                                                            |
| promptMagicStrength      | number or null  | -                                      | 0.1 to 1.0                                           | Strength of prompt magic. Must be a float between 0.1 and 1.0.                                                                                                                                                                                                                                                                  |
| promptMagicVersion       | string or null  | -                                      | "v2" or "v3"                                         | Prompt magic version, for use when promptMagic: true.                                                                                                                                                                                                                                                                           |
| seed                     | integer or null | -                                      | Up to 2147483637 (Flux) or 9999999998 (other models) | Apply a fixed seed to maintain consistency across generation sets. The maximum seed value is 2147483637 for Flux and 9999999998 for other models.                                                                                                                                                                               |
| unzoomAmount             | number or null  | -                                      | -                                                    | How much the image should be unzoomed (requires an init_image_id and unzoom to be set to true).                                                                                                                                                                                                                                 |
| upscaleRatio             | number or null  | -                                      | -                                                    | How much the image should be upscaled. (Enterprise Only)                                                                                                                                                                                                                                                                        |
| width                    | integer or null | 1024                                   | 32 to 1536                                           | The input width of the images. Must be between 32 and 1536 and be a multiple of 8. Note: Input resolution is not always the same as output resolution due to upscaling from other features.                                                                                                                                     |
| enhancePromptInstruction | string or null  | -                                      | -                                                    | When enhancePrompt is enabled, the prompt is enhanced based on the given instructions.                                                                                                                                                                                                                                          |

## Array Parameters

### controlnets (array of objects or null)

For image guidance via ControlNet. Each object in the array can have:

- **initImageId**: ID of the image
- **initImageType**: "GENERATED" or "UPLOADED"
- **preprocessorId**: ID values for different ControlNet types:
  - 67: Style Reference
  - 133: Character Reference
- **strengthType**: Strength of the ControlNet effect
  - Values: "Low", "Mid", "High", "Ultra", "Max"
  - For Content Reference and Character Reference, only "Low", "Mid", and "High" are supported
  - Style Reference supports all values from "Low" to "Max"
- **influence**: Number value when multiple Style References are used (only used for Style Reference)

### elements (array of objects or null)

For adding Leonardo elements to the generation.

### userElements (array of objects or null)

For adding user-created elements to the generation.

### imagePrompts (array of strings or null)

Array of image IDs to use as prompts.

## Special ID Parameters

| Parameter                | Type           | Description                                                 |
| ------------------------ | -------------- | ----------------------------------------------------------- |
| init_generation_image_id | string or null | The ID of an existing image to use in image2image.          |
| init_image_id            | string or null | The ID of an Init Image to use in image2image.              |
| canvasInitId             | string or null | The ID of an initial image to use in Canvas Editor request. |
| canvasMaskId             | string or null | The ID of a mask image to use in Canvas Editor request.     |

## Special Notes and Interactions

1. **Model IDs**: ModelIds can be found in the Leonardo.ai App. Go to 'Finetune Models', select 'Platform Models' or 'Your Models', click on your desired model, then click 'View More' to display the Model ID.

2. **photoReal settings**:

   - For photoRealVersion "v1": Enable alchemy and do not specify modelId
   - For photoRealVersion "v2": Enable alchemy and specify modelId as one of: Leonardo Kino XL, Leonardo Diffusion XL, or Leonardo Vision XL

3. **Alchemy compatibility**:

   - When using Alchemy V2, the output dimension is 1.75 times bigger than input
   - When using Alchemy V1, the output is 1.5 times bigger
   - When using Alchemy V1 and high resolution, the output is twice the input
   - Alchemy V2 works with SDXL models like Leonardo Vision XL, Leonardo Diffusion XL, AlbedoBase XL and KinoXL

4. **Guidance Scale limitations**:

   - Without Alchemy, the guidance scale operates within a range of 1-20
   - With Alchemy enabled, excluding the SDXL model, the scale extends from 2 to 30
   - When the LEONARDO scheduler is active without Alchemy, the guidance scale cannot exceed 7

5. **Prompt Magic RAW mode**: To enable RAW mode in Prompt Magic V3, set highContrast to false

6. **Phoenix Model Requirements**: For Phoenix, if alchemy is true, contrast needs to be 2.5 or higher
