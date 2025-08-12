# Self-Host Hub - Leonardo Node Technical Documentation

## Overview

The Self-Host Hub Leonardo integration for n8n provides access to Leonardo's powerful AI image generation capabilities through a clean, well-structured interface. This document covers technical details for node developers and advanced users.

## Node Structure

### Main Components

1. **CreateLeonardoImage.node.ts**: Primary node implementation
2. **CreateLeonardoImageCredentials.credentials.ts**: Image creation credentials
3. **LeonardoAiApi.credentials.ts**: General API credentials
4. **models.ts**: Static model definitions
5. **parameterUtils.ts**: Utility functions for parameter processing

### API Interface

The node communicates with Leonardo's REST API v1 at `https://cloud.leonardo.ai/api/rest/v1`.

Primary endpoints used:

- `POST /generations`: Initiate image generation
- `GET /generations/{id}`: Check generation status and retrieve results

## Operation: createLeonardoImage

### Parameters

#### Basic Parameters

| Parameter            | Type    | Description                                               | Default | Required |
| -------------------- | ------- | --------------------------------------------------------- | ------- | -------- |
| prompt               | string  | Primary text prompt for image generation                  | -       | Yes      |
| modelSelectionMethod | options | Choose between list or custom model                       | "list"  | Yes      |
| modelId              | options | Model to use (when modelSelectionMethod is "list")        | -       | Yes      |
| customModelId        | string  | Custom model UUID (when modelSelectionMethod is "custom") | -       | Yes      |
| width                | number  | Width of generated images (multiples of 8)                | 1024    | No       |
| height               | number  | Height of generated images (multiples of 8)               | 576     | No       |
| numImages            | number  | Number of images to generate                              | 1       | No       |

#### Advanced Parameters

| Parameter           | Type    | Description                                    | Default         | Required |
| ------------------- | ------- | ---------------------------------------------- | --------------- | -------- |
| negativePrompt      | string  | Text describing what to exclude                | ""              | No       |
| promptMagic         | boolean | Enable Prompt Magic for better adherence       | false           | No       |
| promptMagicStrength | number  | Strength of Prompt Magic (0.1-1.0)             | 0.5             | No       |
| guidanceScale       | number  | How closely to follow the prompt (1-20)        | 5               | No       |
| scheduler           | options | Sampling method for the diffusion process      | "EULER_DISCRETE" | No       |
| seed                | string  | Seed for reproducible generation               | -               | No       |
| inferenceSteps      | number  | Denoising steps (20-60)                        | 20              | No       |
| imageToImage        | boolean | Enable image-to-image generation               | false           | No       |
| initImageUrl        | string  | URL to reference image                         | -               | No       |
| initStrength        | number  | How much to preserve from init image (0.0-1.0) | 0.5             | No       |
| public              | boolean | Make images public in community feed           | false           | No       |
| tiling              | boolean | Generate tileable images                       | false           | No       |
| transparency        | options | Generate with transparent background           | "disabled"      | No       |
| alchemy             | boolean | Enable Alchemy mode for enhanced quality       | false           | No       |
| contrast            | number  | Contrast level (1.0-4.5, Phoenix requires 2.5+ with alchemy) | 1.0    | No       |
| presetStyle         | options | Style preset for SDXL models only             | ""              | No       |
| styleUUID           | options | Style UUID for Flux/Phoenix/Lucid Realism models | ""           | No       |
| generationTimeout   | number  | Maximum wait time for generation (15-120 seconds) | 30           | No       |

### Style Parameters

#### presetStyle (SDXL Models Only)

Compatible with SDXL models: Leonardo Diffusion XL, Leonardo Kino XL, Leonardo Vision XL, Leonardo Anime XL, Leonardo Lightning XL, AlbedoBase XL, SDXL 1.0, SDXL 0.9

Available values:
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

#### styleUUID (Flux/Phoenix/Lucid Realism Models Only)

Compatible with: Flux Dev, Flux Schnell, Lucid Realism, Leonardo Phoenix 1.0, Leonardo Phoenix 0.9

Available styles include:
- 3D Render, Bokeh, Cinematic, Creative, Dynamic
- Fashion, HDR, Illustration, Macro, Minimalist
- Moody, Portrait, Pro Photography styles
- Ray Traced, Sketch styles, Stock Photo, Vibrant

### Model Compatibility Matrix

| Feature     | SDXL Models | Phoenix Models | Flux Models | Lucid Realism |
|-------------|-------------|----------------|-------------|---------------|
| presetStyle | ✅          | ❌             | ❌          | ❌            |
| styleUUID   | ❌          | ✅             | ✅          | ✅            |
| alchemy     | ✅          | ✅             | ❌          | ✅            |
| contrast    | ✅          | ✅ (2.5+ required with alchemy) | ✅ | ✅     |

### Execution Flow

1. **Parameter Collection**: The node first collects all parameters from the user input
2. **Parameter Validation**: Model-specific parameter compatibility is enforced through conditional display logic
3. **API Request Construction**: Parameters are transformed into the appropriate format for Leonardo API using utility functions
4. **Initial Request**: A POST request to `/generations` initiates the image generation process
5. **Polling Mechanism**: The node polls the `/generations/{id}` endpoint to check status with configurable timeout
6. **Response Formatting**: Once complete, results are formatted into a user-friendly structure

### Error Handling

Error handling is implemented at several levels:

1. **Parameter Validation**: Ensures all required parameters are provided and compatible with selected model
2. **API Error Handling**: Captures and formats API errors with meaningful messages
3. **Timeout Handling**: Configurable timeout with reasonable defaults (30 seconds)
4. **Response Validation**: Verifies expected fields in API responses
5. **Model Compatibility**: Prevents incompatible parameter combinations

### Parameter Processing

The node uses a sophisticated parameter processing system implemented in `parameterUtils.ts`:

- **Batch Processing**: Multiple parameters processed efficiently
- **Three-State Booleans**: Supports true/false/not-set for optional boolean parameters
- **Conditional Parameters**: Some parameters only included when related features are enabled
- **Type Conversion**: Automatic conversion between string and numeric types as needed by API

## Testing

The node includes comprehensive Jest tests:

- Unit tests for the main node functionality
- Credential tests
- Error handling tests
- Timeout scenario tests
- Mock API interaction tests
- Parameter processing utility tests

## Custom Model ID Implementation

The custom model ID feature provides flexibility by:

1. Offering a predefined list of models for ease of use
2. Allowing direct input of model UUIDs for advanced use cases
3. Supporting new models that may not be in the predefined list
4. Maintaining compatibility with model-specific features

## Performance Considerations

- The node uses a configurable polling mechanism (default 30 seconds timeout)
- Polls every 2 seconds to balance responsiveness with API efficiency
- Calculated attempts based on timeout setting (timeout ÷ 2 = max attempts)
- Efficient parameter processing with utility functions

## Security

- API keys are stored securely in n8n's credential store
- No sensitive information is logged in normal operation
- Only authenticated requests are made to the Leonardo API
- Parameter validation prevents malformed requests

## API Response Behavior

**Important Note**: Leonardo's API has inconsistent response behavior regarding parameter acknowledgment:

- **Immediate Polling Response**: Often omits style parameters (presetStyle, styleUUID) even when successfully applied
- **Webhook Response**: Contains complete parameter details including applied styles
- **Visual Verification**: Style parameters are applied to generated images even when not shown in response metadata

Users should verify styling through visual inspection of generated images rather than relying solely on API response metadata.

## Future Enhancements

Areas for potential improvement:

- Dynamic model fetching with caching
- Webhook support for long-running generations to get complete response metadata
- Support for additional Leonardo services (upscaling, variations)
- Enhanced error reporting with suggested fixes
- Additional Self-Host Hub service integrations
- Real-time model compatibility validation
- Advanced ControlNet support
- Improved documentation and tutorials for Self-Host Hub community