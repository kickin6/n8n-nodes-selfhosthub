# Leonardo Node Implementation Guidelines

This document provides specific implementation guidelines for the Leonardo.ai integration node within the Self-Host Hub collection.

## Leonardo-Specific Implementation Patterns

### Parameter Organization

The Leonardo node follows this specific parameter organization pattern:

- **Basic Parameters**
  - Prompt and model selection
  - Image dimensions and count
  
- **Image Options**
  - Dimension controls
  - Output quantity settings
  
- **Prompt Engineering**
  - Negative prompts
  - Prompt Magic settings
  - Enhancement controls
  
- **Generation Parameters**
  - Guidance scale
  - Inference steps
  - Scheduler selection
  - Seed values
  
- **Image-to-Image** (when applicable)
  - Init image configuration
  - Strength settings
  
- **Advanced Options**
  - Public/private settings
  - Transparency options
  - Tiling controls

### Polling Mechanism

The Leonardo node implements a specific polling mechanism for generation jobs:

- **Initial Request**: POST to `/generations` endpoint
- **Status Checking**: GET requests to `/generations/{id}` endpoint
- **Polling Configuration**:
  - Initial wait time: 1 second
  - Polling interval: 1 second
  - Maximum attempts: 20
  - Status transitions: PENDING → STARTED → COMPLETE

```typescript
// Example polling implementation pattern
const pollForCompletion = async (generationId: string) => {
  for (let attempt = 0; attempt < MAX_POLLING_ATTEMPTS; attempt++) {
    await new Promise(resolve => setTimeout(resolve, POLLING_INTERVAL));
    
    const statusResponse = await checkGenerationStatus(generationId);
    
    if (statusResponse.status === 'COMPLETE') {
      return statusResponse;
    } else if (statusResponse.status === 'FAILED') {
      throw new Error(`Generation failed: ${statusResponse.message}`);
    }
  }
  
  throw new Error('Generation timed out');
};
```

### Parameter Handling Patterns

Leonardo API uses inconsistent naming conventions, requiring specific transformation:

1. **Snake Case Conversion**: Internal parameters use snake_case for API compatibility
2. **Three-State Booleans**: Support true/false/undefined states for optional parameters
3. **Conditional Parameters**: Some parameters only apply when others are enabled

```typescript
// Example parameter transformation
const transformParameters = (userParams: IDataObject) => {
  const apiParams: IDataObject = {};
  
  // Standard parameter mapping
  if (userParams.promptMagic !== undefined) {
    apiParams.prompt_magic = userParams.promptMagic;
  }
  
  // Conditional parameter inclusion
  if (userParams.unzoom === true && userParams.unzoomAmount !== undefined) {
    apiParams.unzoom_amount = userParams.unzoomAmount;
  }
  
  return apiParams;
};
```

### Feature Support Guidelines

When implementing Leonardo features:

1. **Model Support**: Maintain compatibility with both predefined models and custom model IDs
2. **Image-to-Image**: Implement proper validation for init image URLs and strength values
3. **Prompt Magic**: Handle strength parameters only when Prompt Magic is enabled
4. **Transparency**: Support multiple transparency modes (disabled, foreground, background)

### Error Handling Patterns

Leonardo-specific error handling should address:

1. **API Rate Limits**: Implement backoff strategies for rate limit responses
2. **Invalid Model IDs**: Provide clear error messages for model validation failures
3. **Generation Failures**: Handle various failure states from the generation API
4. **Image URL Validation**: Validate image URLs for image-to-image operations

### Testing Considerations

Leonardo node tests should cover:

1. **Parameter Validation**: Test all parameter combinations and edge cases
2. **Polling Mechanism**: Test timeout scenarios and status transitions
3. **Model Selection**: Test both predefined and custom model ID flows
4. **Error Scenarios**: Test API failures, timeouts, and invalid parameters

### Future Leonardo Features

When adding new Leonardo API features, follow these patterns:

1. **Parameter Grouping**: Add new parameters to appropriate existing sections
2. **Backward Compatibility**: Ensure new features don't break existing workflows
3. **Documentation**: Update both user and technical documentation
4. **Testing**: Add comprehensive tests for new functionality

## Leonardo API Considerations

### Authentication

- Use the Leonardo AI API credentials type
- API key format: Bearer token in Authorization header
- Validate API key format and accessibility during credential testing

### Endpoints

Primary endpoints used by the Leonardo node:

- `POST /generations`: Create new image generation job
- `GET /generations/{id}`: Check generation status and retrieve results
- Future endpoints may include dataset operations, model management, etc.

### Response Handling

Leonardo API responses follow specific patterns:

```typescript
// Typical generation response structure
interface GenerationResponse {
  sdGenerationJob: {
    generationId: string;
    status: 'PENDING' | 'STARTED' | 'COMPLETE' | 'FAILED';
    generated_images?: Array<{
      id: string;
      url: string;
      nsfw: boolean;
      width: number;
      height: number;
    }>;
  };
}
```

### Rate Limiting

- Leonardo API has rate limits that vary by subscription tier
- Implement graceful handling of 429 responses
- Consider implementing request queuing for high-volume use cases

## Best Practices

1. **Parameter Naming**: Use descriptive names that match Leonardo's documentation where possible
2. **Validation**: Validate parameters client-side before API calls when possible
3. **Error Messages**: Provide actionable error messages that help users resolve issues
4. **Performance**: Cache model lists and other static data when appropriate
5. **Security**: Never log API keys or other sensitive information

## Maintenance

- Monitor Leonardo API documentation for new features and deprecations
- Update model lists periodically to include new official models
- Test integration with Leonardo API changes during their beta periods
- Maintain backward compatibility with existing workflows when possible