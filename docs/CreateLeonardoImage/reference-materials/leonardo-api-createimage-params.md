# Leonardo.ai API Parameters Reference

This document provides a comprehensive list of all parameters available in the Leonardo.ai API for image generation, along with their possible values, defaults, and special notes.

## Required Parameters

| Parameter | Type   | Default                      | Description                        |
| --------- | ------ | ---------------------------- | ---------------------------------- |
| prompt    | string | "A majestic cat in the snow" | The prompt used to generate images |

## Optional Parameters with Select/Dropdown Values

### presetStyle

**Type:** string or null  
**Default:** null  
**Description:** The style to generate images with. **Compatible with SDXL models only.**

**Possible Values:**

- BOKEH
- CINEMATIC
- CINEMATIC_CLOSEUP
- CREATIVE
- FASHION
- FILM
- FOOD
- HDR
- LONG_EXPOSURE
- MACRO

**Special Notes:**

- **Model Compatibility**: Only works with SDXL models (Leonardo Diffusion XL, Leonardo Kino XL, Leonardo Vision XL, Leonardo Anime XL, Leonardo Lightning XL, AlbedoBase XL, SDXL 1.0, SDXL 0.9)
- **Not compatible** with Flux, Lucid Realism, or Phoenix models - use styleUUID instead
- **API Parameter Name**: Uses camelCase (`presetStyle`) in API requests
- When alchemy is disabled, limited style options may be available
- When alchemy is enabled, all listed values are available

### styleUUID

**Type:** string or null  
**Default:** null  
**Description:** Style UUID for advanced styling. **Compatible with Flux, Lucid Realism, and Phoenix models only.**

**Possible Values (UUID format):**

- `debdf72a-91a4-467b-bf61-cc02bdeb69c6` - 3D Render
- `9fdc5e8c-4d13-49b4-9ce6-5a74cbb19177` - Bokeh
- `a5632c7c-ddbb-4e2f-ba34-8456ab3ac436` - Cinematic
- `33abbb99-03b9-4dd7-9761-ee98650b2c88` - Cinematic Concept
- `6fedbf1f-4a17-45ec-84fb-92fe524a29ef` - Creative
- `111dc692-d470-4eec-b791-3475abac4c46` - Dynamic
- `594c4a08-a522-4e0e-b7ff-e4dac4b6b622` - Fashion
- `2e74ec31-f3a4-4825-b08b-2894f6d13941` - Graphic Design Pop Art
- `1fbb6a68-9319-44d2-8d56-2957ca0ece6a` - Graphic Design Vector
- `97c20e5c-1af6-4d42-b227-54d03d8f0727` - HDR
- `645e4195-f63d-4715-a3f2-3fb1e6eb8c70` - Illustration
- `30c1d34f-e3a9-479a-b56f-c018bbc9c02a` - Macro
- `cadc8cd6-7838-4c99-b645-df76be8ba8d8` - Minimalist
- `621e1c9a-6319-4bee-a12d-ae40659162fa` - Moody
- `556c1ee5-ec38-42e8-955a-1e82dad0ffa1` - None
- `8e2bc543-6ee2-45f9-bcd9-594b6ce84dcd` - Portrait
- `22a9a7d2-2166-4d86-80ff-22e2643adbcf` - Pro B&W Photography
- `7c3f932b-a572-47cb-9b9b-f20211e63b5b` - Pro Color Photography
- `581ba6d6-5aac-4492-bebe-54c424a0d46e` - Pro Film Photography
- `0d34f8e1-46d4-428f-8ddd-4b11811fa7c9` - Portrait Fashion
- `b504f83c-3326-4947-82e1-7fe9e839ec0f` - Ray Traced
- `be8c6b58-739c-4d44-b9c1-b032ed308b61` - Sketch (B&W)
- `093accc3-7633-4ffd-82da-d34000dfc0d6` - Sketch (Color)
- `5bdc3f2a-1be6-4d1c-8e77-992a30824a2c` - Stock Photo
- `dee282d3-891f-4f73-ba02-7f8131e5541b` - Vibrant

**Special Notes:**

- **Model Compatibility**: Only works with Flux, Lucid Realism, and Phoenix models (Flux Dev, Flux Schnell, Lucid Realism, Leonardo Phoenix 1.0, Leonardo Phoenix 0.9)
- **Not compatible** with SDXL models - use presetStyle instead
- **API Parameter Name**: Uses camelCase (`styleUUID`) in API requests
- **Response Behavior**: May not appear in immediate polling response but will be applied to generated images and visible in webhook responses

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
| alchemy        | true    | Enable to use Alchemy. Note: The appropriate Alchemy version is selected for the specified model. For example, XL models will use Alchemy V2. **Not compatible with Flux Dev.** |
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
| contrast                 | number or null  | 1.0                                    | 1.0 to 4.5                                           | Adjusts the contrast level of the generated image. Used in Phoenix and Flux models. Accepts values [1.0, 1.3, 1.8, 2.5, 3, 3.5, 4, 4.5]. **For Phoenix with alchemy enabled, contrast must be 2.5 or higher.** **API Parameter Name**: Uses camelCase (`contrast`) and requires numeric conversion. |
| guidance_scale           | integer or null | 7                                      | 1 to 20                                              | How strongly the generation should reflect the prompt. 7 is recommended. Must be between 1 and 20. **API Parameter Name**: Uses snake_case (`guidance_scale`).                                                                                                                                                               |
| height                   | integer or null | 576                                    | 32 to 1536                                           | The input height of the images. Must be between 32 and 1536 and be a multiple of 8. Note: Input resolution is not always the same as output resolution due to upscaling from other features.                                                                                                                                    |
| imagePromptWeight        | number or null  | -                                      | -                                                    | Weight for image prompts.                                                                                                                                                                                                                                                                                                       |
| init_strength            | number or null  | 0.5                                    | 0.1 to 0.9                                           | How strongly the generated images should reflect the original image in image2image. Must be a float between 0.1 and 0.9.                                                                                                                                                                                                        |
| modelId                  | string or null  | "1e60896f-3c26-4296-8ecc-53e2afecc132" | -                                                    | The model ID used for image generation. If not provided, uses sd_version to determine the version of Stable Diffusion to use. In-app, model IDs are under the Finetune Models menu. Click on the platform model or your custom model, then click View More. For platform models, you can also use the List Platform Models API. |
| negative_prompt          | string or null  | -                                      | -                                                    | The negative prompt used for the image generation. **API Parameter Name**: Uses snake_case (`negative_prompt`).                                                                                                                                                                                                                |
| num_images               | integer or null | 1                                      | 1 to 8                                               | The number of images to generate. Must be between 1 and 8. If either width or height is over 768, must be between 1 and 4. **API Parameter Name**: Uses snake_case (`num_images`).                                                                                                                                            |
| num_inference_steps      | integer or null | 20                                     | 10 to 60                                             | The Step Count to use for the generation. Must be between 10 and 60. **API Parameter Name**: Uses snake_case (`num_inference_steps`).                                                                                                                                                                                         |
| photoRealVersion         | string or null  | -                                      | "v1" or "v2"                                         | The version of photoReal to use. Must be v1 or v2.                                                                                                                                                                                                                                                                              |
| photoRealStrength        | number or null  | 0.55 (default)                         | -                                                    | Depth of field of photoReal. Must be 0.55 for low, 0.5 for medium, or 0.45 for high.                                                                                                                                                                                                                                            |
| promptMagicStrength      | number or null  | 0.5                                    | 0.1 to 1.0                                           | Strength of prompt magic. Must be a float between 0.1 and 1.0. **API Parameter Name**: Uses snake_case (`prompt_magic_strength`).                                                                                                                                                                                             |
| promptMagicVersion       | string or null  | -                                      | "v2" or "v3"                                         | Prompt magic version, for use when promptMagic: true.                                                                                                                                                                                                                                                                           |
| seed                     | integer or null | -                                      | Up to 2147483637 (Flux) or 9999999998 (other models) | Apply a fixed seed to maintain consistency across generation sets. The maximum seed value is 2147483637 for Flux and 9999999998 for other models.                                                                                                                                                                               |
| unzoomAmount             | number or null  | 0.2                                    | 0.1 to 1.0                                           | How much the image should be unzoomed (requires an init_image_id and unzoom to be set to true).                                                                                                                                                                                                                                 |
| upscaleRatio             | number or null  | -                                      | 1 to 4                                               | How much the image should be upscaled. **(Enterprise Only)**                                                                                                                                                                                                                                                                    |
| width                    | integer or null | 1024                                   | 32 to 1536                                           | The input width of the images. Must be between 32 and 1536 and be a multiple of 8. Note: Input resolution is not always the same as output resolution due to upscaling from other features.                                                                                                                                     |
| enhancePromptInstruction | string or null  | -                                      | -                                                    | When enhancePrompt is enabled, the prompt is enhanced based on the given instructions.                                                                                                                                                                                                                                          |
| weighting                | number or null  | 0.5                                    | 0.0 to 1.0                                           | How much weighting to use for generation.                                                                                                                                                                                                                                                                                       |

## Array Parameters

### controlnets (array of objects or null)

For image guidance via ControlNet. Each object in the array can have:

- **initImageId**: ID of the image
- **initImageType**: "GENERATED" or "UPLOADED"
- **preprocessorId**: ID values for different ControlNet types:
  - 67: Style Reference
  - 133: Character Reference
  - 182: Content Reference
- **strengthType**: Strength of the ControlNet effect
  - Values: "Low", "Mid", "High", "Ultra", "Max"
  - For Content Reference and Character Reference, only "Low", "Mid", and "High" are supported
  - Style Reference supports all values from "Low" to "Max"
- **weight**: Number value (0.1 to 2.0) for ControlNet influence
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

## Model Compatibility Matrix

| Parameter   | SDXL Models | Phoenix Models | Flux Models | Lucid Realism |
|-------------|-------------|----------------|-------------|---------------|
| presetStyle | ✅          | ❌             | ❌          | ❌            |
| styleUUID   | ❌          | ✅             | ✅          | ✅            |
| alchemy     | ✅          | ✅             | ❌          | ✅            |
| contrast    | ✅          | ✅ (2.5+ with alchemy) | ✅ | ✅         |

## API Naming Conventions

Leonardo's API uses inconsistent naming conventions:

### camelCase Parameters
- `styleUUID`
- `presetStyle`  
- `modelId`
- `contrast`

### snake_case Parameters
- `negative_prompt`
- `guidance_scale`
- `num_inference_steps`
- `prompt_magic_strength`

## Response Behavior Notes

**Important**: Leonardo's API has inconsistent response behavior regarding parameter acknowledgment:

- **Immediate Polling Response**: Often omits style parameters (`presetStyle`, `styleUUID`) even when successfully applied
- **Webhook Response**: Contains complete parameter details including applied styles  
- **Visual Verification**: Style parameters are applied to generated images even when not shown in response metadata

Users should verify styling through visual inspection of generated images rather than relying solely on API response metadata.

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
   - **Flux Dev does not support Alchemy** - will return error if alchemy is enabled

4. **Guidance Scale limitations**:
   - Without Alchemy, the guidance scale operates within a range of 1-20
   - With Alchemy enabled, excluding the SDXL model, the scale extends from 2 to 30
   - When the LEONARDO scheduler is active without Alchemy, the guidance scale cannot exceed 7

5. **Prompt Magic RAW mode**: To enable RAW mode in Prompt Magic V3, set highContrast to false

6. **Phoenix Model Requirements**: For Phoenix, if alchemy is true, contrast needs to be 2.5 or higher

7. **Style Parameter Exclusivity**: Use either `presetStyle` OR `styleUUID`, not both. The appropriate parameter depends on your selected model type.