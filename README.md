# n8n-nodes-selfhosthub

This is a community node collection for n8n developed by [Self-Host Hub](https://github.com/kickin6) that enables integration with various AI services, starting with Leonardo.ai. These nodes allow workflow automation with AI image and content generation capabilities.

## About Self-Host Hub

Self-Host Hub is dedicated to creating high-quality, production-ready n8n nodes for AI and content generation services. Our nodes are designed to work seamlessly with Self-Host Hub Studio, our no-code AI platform, but can also be used independently in any n8n installation.

### Connect with the Creator

- **Link Tree**: [linktr.ee/selfhosthub](https://linktr.ee/selfhosthub)

## Disclaimer

This is an unofficial integration not affiliated with, endorsed by, or connected to Leonardo.ai. Leonardo is a trademark of Leonardo.ai, Inc. All product and company names are trademarks™ or registered® trademarks of their respective holders. Use of them does not imply any affiliation with or endorsement by them.

## Features

- Generate AI images using text prompts
- Fine-tune generation with negative prompts, guidance scaling, and scheduling options
- Support for all Leonardo.ai official models plus custom model IDs
- Image-to-image generation with customizable strength
- Prompt Magic support for better prompt adherence
- Transparency and tiling options
- Customizable inference steps and seed values
- Flexible input/output options for integration with other n8n workflows
- Comprehensive error handling and retry logic
- 100% test coverage with automated tests

## Installation

Follow these steps to install this custom node:

1. In n8n, Click `Settings` -> `Community Nodes`
2. In the npm Package Name field, enter `n8n-nodes-selfhosthub` then Install
3. Restart n8n
4. Click `add node` -> `Advanced AI`
5. Click `Self-Host Hub (Leonardo)`. (You may have to expand "Results in other categories")

## Node Types

### Self-Host Hub (Leonardo)

A specialized node designed for working with Leonardo.ai API for image generation that provides:

- **Image Generation**: Create stunning AI-generated images from text prompts with advanced parameters and controls
- **Full compatibility** with Self-Host Hub Studio and n8n workflows
- **Comprehensive options** for fine-tuning image generation with the latest Leonardo.ai capabilities

## Credentials

### Self-Host Hub - Leonardo AI API

To use this node, you'll need a Leonardo AI API key:

1. Create an account at [Leonardo.ai](https://leonardo.ai)
2. Go to your profile settings and navigate to the API section
3. Generate a new API key
4. Copy and paste the key into n8n's credentials for "Self-Host Hub - Leonardo AI API"

## Usage Examples

### Basic Image Generation

1. Add the "Self-Host Hub (Leonardo)" node to your workflow
2. Configure your image generation parameters
3. Enter a descriptive prompt
4. Choose a model, width, height, and number of images
5. Run the workflow to generate images

### Advanced Image Generation with Fine-tuning

1. Follow steps 1-4 from basic image generation
2. Enable "Advanced Options"
3. Add a negative prompt to specify what you don't want in the image
4. Adjust the guidance scale (higher values = more prompt-adherent images)
5. Choose a scheduler for different generation styles
6. Set init strength if using image-to-image generation

### Output Format

The node returns a structured JSON response with the following fields:

- `success`: Boolean indicating if the generation was successful
- `generationId`: Unique identifier for the generation
- `status`: Status of the generation (e.g., "COMPLETE")
- `prompt`: The text prompt used for generation
- `modelId`: The model used for generation
- `imageCount`: Number of images generated
- `images`: Array of generated image objects, each containing:
  - `id`: Unique image identifier
  - `url`: URL to the generated image
  - `nsfw`: Boolean indicating if the image is flagged as NSFW
  - `width`: Width of the generated image
  - `height`: Height of the generated image
- `rawResponse`: The full API response for advanced use cases

## Roadmap

As this node package continues to evolve, we've identified several areas for enhancement based on code review and user feedback:

### Code Improvements

- Refactor the execute method into smaller, more maintainable functions
- Extract polling logic into a reusable utility function
- Consolidate credential files to reduce duplication and improve consistency
- Strengthen parameter handling with more consistent naming between camelCase and snake_case

### Documentation Enhancements

- Add JSDoc comments to all exported classes and functions
- Expand usage examples with more real-world workflow scenarios
- Document error conditions and provide troubleshooting guidance

### Performance Optimizations

- Implement request caching for repetitive operations
- Optimize polling intervals based on Leonardo.ai API response patterns
- Improve error recovery strategies for intermittent API issues

### Testing Refinements

- Eliminate all istanbul ignore directives by creating comprehensive tests for difficult-to-reach code paths
- Increase test coverage for edge cases and error scenarios
- Refactor code to improve testability of complex conditional logic
- Implement more thorough parameter validation testing
- Improve organization of test files to reduce overlapping tests
- Add more comprehensive documentation for manual test procedures

## Future Development

This node package is designed with expandability in mind as part of the Self-Host Hub collection. Future development consideration includes:

### Leonardo.ai API Integration Expansion:

- **Creative Assets & Generation**:

  - Video Generation API - Create AI-generated videos from text prompts
  - Texture Generation API - Generate seamless textures for 3D models and game development
  - Image Variation API - Create variations of existing images
  - Init Image Generation API - Advanced image-to-image generation

- **3D Asset Creation**:

  - 3D Model Generation API - Generate 3D models from text descriptions
  - 3D Model Texturing API - Apply AI-generated textures to 3D models
  - Character Generation API - Create detailed character models for games and animations

- **Content Management**:

  - Dataset Operations API - Create and manage training datasets
  - User Generated Content API - Access and manage user-generated assets
  - Model Fine-tuning API - Create custom-trained models

- **Account & Workflow Management**:
  - User Authentication API - Manage user access and permissions
  - Webhook Integration - Enable event-based automation workflows
  - Platform-specific Job Management API - Advanced job queuing and monitoring

### Additional Service Integrations:

The Self-Host Hub node collection will expand to include other AI services in future releases.

## Documentation

This repository includes detailed documentation in the `docs/` directory:

- [User Documentation](docs/CreateLeonardoImage/DOCUMENTATION.md) - Comprehensive guide for using the node
- [Development Guidelines](docs/DEVELOPMENT_GUIDELINES.md) - Technical details and development guidelines
- [Parameter Handling](docs/CreateLeonardoImage/parameter-handling.md) - Technical details on parameter processing and testing

## External Resources

- [Leonardo.ai Documentation](https://docs.leonardo.ai/docs/getting-started)
- [n8n Community Node Documentation](https://docs.n8n.io/integrations/creating-nodes/build/declarative-style-node/)
- [Self-Host Hub Linktree](https://linktr.ee/selfhosthub) - Connect with us on YouTube, GitHub, and all other platforms

## License

[MIT License](LICENSE)
