# Self-Host Hub - Leonardo Node Technical Documentation

## Overview

The Self-Host Hub Leonardo integration for n8n provides access to Leonardo's powerful AI image generation capabilities through a clean, well-structured interface. This document covers technical details for node developers and advanced users.

## Node Structure

### Main Components

1. **CreateLeonardoImage.node.ts**: Primary node implementation
2. **CreateLeonardoImageCredentials.credentials.ts**: Image creation credentials
3. **LeonardoAiApi.credentials.ts**: General API credentials
4. **models.ts**: Static model definitions

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
| width                | number  | Width of generated images (multiples of 8)                | 512     | No       |
| height               | number  | Height of generated images (multiples of 8)               | 512     | No       |
| numImages            | number  | Number of images to generate                              | 1       | No       |

#### Advanced Parameters

| Parameter           | Type    | Description                                    | Default    | Required |
| ------------------- | ------- | ---------------------------------------------- | ---------- | -------- |
| negativePrompt      | string  | Text describing what to exclude                | ""         | No       |
| promptMagic         | boolean | Enable Prompt Magic for better adherence       | false      | No       |
| promptMagicStrength | number  | Strength of Prompt Magic (0.1-1.0)             | 0.5        | No       |
| guidanceScale       | number  | How closely to follow the prompt (1-20)        | 7          | No       |
| scheduler           | options | Sampling method for the diffusion process      | "K_EULER"  | No       |
| seed                | string  | Seed for reproducible generation               | -          | No       |
| inferenceSteps      | number  | Denoising steps (30-60)                        | 30         | No       |
| imageToImage        | boolean | Enable image-to-image generation               | false      | No       |
| initImageUrl        | string  | URL to reference image                         | -          | No       |
| initStrength        | number  | How much to preserve from init image (0.0-1.0) | 0.5        | No       |
| public              | boolean | Make images public in community feed           | false      | No       |
| tiling              | boolean | Generate tileable images                       | false      | No       |
| transparency        | options | Generate with transparent background           | "disabled" | No       |

### Execution Flow

1. **Parameter Collection**: The node first collects all parameters from the user input
2. **API Request Construction**: Parameters are transformed into the appropriate format for Leonardo API
3. **Initial Request**: A POST request to `/generations` initiates the image generation process
4. **Polling Mechanism**: The node polls the `/generations/{id}` endpoint to check status
5. **Response Formatting**: Once complete, results are formatted into a user-friendly structure

### Error Handling

Error handling is implemented at several levels:

1. **Parameter Validation**: Ensures all required parameters are provided
2. **API Error Handling**: Captures and formats API errors
3. **Timeout Handling**: Implements a maximum polling attempts mechanism
4. **Response Validation**: Verifies expected fields in API responses

## Testing

The node includes comprehensive Jest tests:

- Unit tests for the main node functionality
- Credential tests
- Error handling tests
- Timeout scenario tests
- Mock API interaction tests

## Custom Model ID Implementation

The custom model ID feature provides flexibility by:

1. Offering a predefined list of models for ease of use
2. Allowing direct input of model UUIDs for advanced use cases
3. Supporting new models that may not be in the predefined list

## Performance Considerations

- The node uses an adaptive polling mechanism with configurable retry limits
- Initial wait time is set to 1 second with subsequent polls at 1-second intervals
- A maximum of 20 polling attempts prevents infinite waiting

## Security

- API keys are stored securely in n8n's credential store
- No sensitive information is logged in normal operation
- Only authenticated requests are made to the Leonardo API

## Future Enhancements

Areas for potential improvement:

- Dynamic model fetching with caching
- Webhook support for long-running generations
- Support for additional Leonardo services
- Enhanced error reporting with suggested fixes
- Additional Self-Host Hub service integrations
- Improved documentation and tutorials for Self-Host Hub community
