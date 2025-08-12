# Leonardo AI Node - Parameter Handling Guide

This document explains the parameter handling approach used in the Leonardo AI node.

## Overview

The Leonardo API uses a variety of parameters with inconsistent naming conventions (mixing camelCase and snake_case). To address this, we've standardized our internal handling and added utility functions that simplify parameter processing.

## Key Design Decisions

1. **API-Specific Naming**: We preserve Leonardo's API naming conventions (mix of camelCase and snake_case) for compatibility
2. **Three State Booleans**: Parameters like `tiling`, `unzoom`, etc. support three states (true/false/not set)
3. **Model-Specific Parameters**: Different models support different parameter sets with conditional display logic
4. **Special Parameter Handling**: Some parameters require specific handling:
   - `weighting`
   - `unzoomAmount` (only included when `unzoom` is true)
   - `canvasRequestType` (only included when `canvasRequest` is true)
   - `photoreal_style` and `photoreal_strength`
   - `styleUUID` (camelCase for Flux/Phoenix/Lucid Realism models)
   - `presetStyle` (camelCase for SDXL models)
   - `contrast` (numeric conversion required)

## Parameter Processing Functions

### `processParameter`

This function is the core of parameter handling and supports:

- Optional parameter transformation
- Conditional inclusion
- Automatic conversion to the correct API parameter name

```typescript
export function processParameter(
  params: IDataObject,
  requestBody: IDataObject,
  mapping: ParameterMapping
): void;
```

### `processParameterBatch`

Processes multiple parameters at once using the same mapping logic:

```typescript
export function processParameterBatch(
  params: IDataObject,
  requestBody: IDataObject,
  mappings: ParameterMapping[]
): void;
```

### `processThreeStateBoolean`

Handles boolean parameters that can be true, false, or not set:

```typescript
export function processThreeStateBoolean(
  params: IDataObject,
  requestBody: IDataObject,
  paramKey: string,
  apiKey?: string
): void;
```

### `processNumericParameter`

Safely converts and processes numeric parameters:

```typescript
export function processNumericParameter(
  params: IDataObject,
  requestBody: IDataObject,
  paramKey: string,
  apiKey?: string
): void;
```

## Parameter Types

### Basic Parameters

- `prompt`: The main text prompt (required)
- `width`: Image width (required)
- `height`: Image height (required)
- `num_images`: Number of images to generate (required)
- `modelId`: The generation model to use (required)

### Advanced Parameters

- Text Parameters:

  - `negative_prompt`: Text to avoid in generation
  - `seed`: Random seed for reproducibility
  - `enhancePromptInstruction`: Custom instructions for prompt enhancement
  - `presetStyle`: Predefined style to apply (SDXL models only - uses camelCase)
  - `styleUUID`: Style UUID for advanced styling (Flux/Phoenix/Lucid Realism models only - uses camelCase)

- Numeric Parameters:

  - `guidance_scale`: How closely to follow the prompt
  - `num_inference_steps`: Number of generation steps
  - `weighting`: Parameter weighting factor
  - `promptMagicStrength`: Strength of prompt magic feature (snake_case: `prompt_magic_strength`)
  - `unzoomAmount`: Amount of unzoom to apply (only when unzoom is enabled)
  - `controlnet_strength`: Strength of controlnet guidance
  - `contrast`: Contrast level (numeric, requires parseFloat conversion)

- Boolean Parameters:
  - `prompt_magic`: Use prompt magic
  - `tiling`: Generate tileable images
  - `unzoom`: Apply unzoom
  - `alchemy`: Use alchemy mode
  - `high_contrast`: Enhance contrast
  - `high_resolution`: Generate higher resolution
  - `photoreal`: Enable photoreal mode
  - `expanded_domain`: Use expanded domain
  - `fantasy_avatar`: Generate fantasy avatars
  - `ultra`: Use ultra quality mode
  - `public`: Make image publicly visible
  - `enhance_prompt`: Enhance the prompt
  - `canvas_request`: Use canvas features
  - `nsfw_filter`: Apply NSFW filter

## Model-Specific Parameter Handling

### Style Parameters

The node implements conditional logic to show only compatible style parameters:

#### SDXL Models
- **Compatible**: Leonardo Diffusion XL, Leonardo Kino XL, Leonardo Vision XL, Leonardo Anime XL, Leonardo Lightning XL, AlbedoBase XL, SDXL 1.0, SDXL 0.9
- **Style Parameter**: `presetStyle` (camelCase)
- **Available Values**: BOKEH, CINEMATIC, CINEMATIC_CLOSEUP, CREATIVE, FASHION, FILM, FOOD, HDR, LONG_EXPOSURE, MACRO

#### Flux/Phoenix/Lucid Realism Models
- **Compatible**: Flux Dev, Flux Schnell, Lucid Realism, Leonardo Phoenix 1.0, Leonardo Phoenix 0.9
- **Style Parameter**: `styleUUID` (camelCase)
- **Available Values**: UUID strings for various styles (3D Render, Bokeh, Cinematic, Creative, Dynamic, Fashion, etc.)

### Model Compatibility Logic

The node uses `displayOptions` to conditionally show parameters based on selected model:

```typescript
displayOptions: {
  show: {
    operation: ['createLeonardoImage'],
    advancedOptions: [true],
    modelSelectionMethod: ['list'],
    modelId: [/* array of compatible model IDs */],
  },
}
```

## API Naming Conventions

Leonardo's API uses inconsistent naming conventions that we must respect:

### camelCase Parameters
- `styleUUID`
- `presetStyle`
- `modelId`
- `numImages` → `num_images`

### snake_case Parameters
- `negative_prompt`
- `guidance_scale`
- `num_inference_steps`
- `prompt_magic`
- `high_contrast`
- `canvas_request`

### Special Cases
- `contrast`: Numeric value requiring parseFloat conversion
- `photoreal`: Boolean that triggers additional related parameters
- Conditional parameters only included when parent feature is enabled

## Testing Approach

Some parameter handling logic is inherently difficult to test through standard unit tests:

1. **String-to-number Transforms**: Coverage tools sometimes incorrectly report these as untested
2. **Conditional Functions**: Complex condition checks on parameter objects are difficult to verify in unit tests
3. **Complex Nested Logic**: Multi-level conditional behavior is challenging to fully explore in tests
4. **Model Compatibility Logic**: UI conditional display logic is not easily unit tested

We use `istanbul ignore` directives with detailed comments to explain why specific lines are excluded from coverage reporting.

### Istanbul Ignore Directives

For future reference, we've added istanbul ignore directives to the codebase. The sections are functionally tested through manual test workflows and console logging but could benefit from more comprehensive test coverage in the future if better testing approaches are developed.

## Debug Logging

The codebase maintains debug `console.log` statements that help verify the correct execution path during development. These logs provide valuable insights for future developers and help confirm that conditionally-executed code is working as expected.

Key debug points include:
- Parameter loading verification
- Style parameter processing
- Request body construction
- Model compatibility checks

## API Response Considerations

**Important**: Leonardo's API has inconsistent response behavior:

- **Immediate Response**: Style parameters (presetStyle, styleUUID) often missing from polling response metadata
- **Webhook Response**: Contains complete parameter details including applied styles
- **Visual Verification**: Styles are applied to images even when not shown in response

This behavior is documented to prevent confusion during development and debugging. The parameter processing is working correctly even when response metadata doesn't reflect applied parameters.

## Future Improvements

Areas for potential enhancement:

1. **Dynamic Model Fetching**: Automatically fetch available models and their capabilities
2. **Enhanced Validation**: Real-time parameter compatibility checking
3. **Webhook Integration**: Support Leonardo webhooks for complete response data
4. **Advanced Error Handling**: More specific error messages for parameter conflicts
5. **Performance Optimization**: Reduce parameter processing overhead
6. **Testing Coverage**: Develop better approaches for testing conditional logic