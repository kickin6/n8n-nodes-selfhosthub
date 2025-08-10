# n8n-nodes-selfhosthub

This is a community node collection for n8n developed by [Self-Host Hub](https://github.com/kickin6) that enables integration with various AI and content generation services. These nodes allow workflow automation with AI image generation, video creation, and content manipulation capabilities.

## About Self-Host Hub

Self-Host Hub is dedicated to creating high-quality, production-ready n8n nodes for AI and content generation services. Our nodes are designed to work seamlessly with Self-Host Hub Studio, our no-code AI platform, but can also be used independently in any n8n installation.

### Connect with the Creator

- **Link Tree**: [linktr.ee/selfhosthub](https://linktr.ee/selfhosthub)

## Disclaimer

This is an unofficial integration not affiliated with, endorsed by, or connected to Leonardo.ai or JSON2Video. Leonardo is a trademark of Leonardo.ai, Inc. JSON2Video is a trademark of their respective owners. All product and company names are trademarks™ or registered® trademarks of their respective holders. Use of them does not imply any affiliation with or endorsement by them.

## Features

### Self-Host Hub (Leonardo)
- Generate AI images using text prompts
- Fine-tune generation with negative prompts, guidance scaling, and scheduling options
- Support for all Leonardo.ai official models plus custom model IDs
- Image-to-image generation with customizable strength
- Prompt Magic support for better prompt adherence
- Transparency and tiling options
- Customizable inference steps and seed values

### Self-Host Hub (JSON2Video)
- Create videos from JSON templates with scenes and elements
- Merge video and audio files seamlessly
- Combine multiple videos with transitions and effects
- Support for images, videos, text, audio, voice, and subtitle elements
- Advanced positioning and timing controls
- Duration management with automatic detection

### Universal Features
- Flexible input/output options for integration with other n8n workflows
- Comprehensive error handling and retry logic
- 100% test coverage with automated tests
- Modular architecture for easy maintenance and expansion

## Installation

Follow these steps to install this custom node:

1. In n8n, Click `Settings` -> `Community Nodes`
2. In the npm Package Name field, enter `n8n-nodes-selfhosthub` then Install
3. Restart n8n
4. Click `add node` -> `Advanced AI`
5. Choose your desired integration:
   - `Self-Host Hub (Leonardo)` for image generation
   - `Self-Host Hub (JSON2Video)` for video creation

## Node Types

### Self-Host Hub (Leonardo)

A specialized node designed for working with Leonardo.ai API for image generation that provides:

- **Image Generation**: Create stunning AI-generated images from text prompts with advanced parameters and controls
- **Full compatibility** with Self-Host Hub Studio and n8n workflows
- **Comprehensive options** for fine-tuning image generation with the latest Leonardo.ai capabilities

### Self-Host Hub (JSON2Video)

A comprehensive node for JSON2Video API video creation that provides:

- **Video Creation**: Build videos from JSON templates with multiple scenes and elements
- **Media Merging**: Combine video and audio files with precise timing control
- **Element Composition**: Add images, text, audio, voice, and subtitle elements with advanced positioning
- **Template System**: Use JSON templates for consistent video generation workflows

## Credentials

### Self-Host Hub - Leonardo AI API

To use the Leonardo node, you'll need a Leonardo AI API key:

1. Create an account at [Leonardo.ai](https://leonardo.ai)
2. Go to your profile settings and navigate to the API section
3. Generate a new API key
4. Copy and paste the key into n8n's credentials for "Self-Host Hub - Leonardo AI API"

### Self-Host Hub - JSON2Video API

To use the JSON2Video node, you'll need a JSON2Video API key:

1. Create an account at [JSON2Video](https://json2video.com)
2. Navigate to your API settings
3. Generate a new API key
4. Copy and paste the key into n8n's credentials for "Self-Host Hub - JSON2Video API"

## Usage Examples

### Leonardo: Basic Image Generation

1. Add the "Self-Host Hub (Leonardo)" node to your workflow
2. Configure your image generation parameters
3. Enter a descriptive prompt
4. Choose a model, width, height, and number of images
5. Run the workflow to generate images

### Leonardo: Advanced Image Generation with Fine-tuning

1. Follow steps 1-4 from basic image generation
2. Enable "Advanced Options"
3. Add a negative prompt to specify what you don't want in the image
4. Adjust the guidance scale (higher values = more prompt-adherent images)
5. Choose a scheduler for different generation styles
6. Set init strength if using image-to-image generation

### JSON2Video: Basic Video Creation

1. Add the "Self-Host Hub (JSON2Video)" node to your workflow
2. Choose "Create Movie" operation
3. Configure basic parameters (width, height, framerate)
4. Add elements (images, text, audio) to your scenes
5. Run the workflow to generate your video

### JSON2Video: Video and Audio Merging

1. Add the "Self-Host Hub (JSON2Video)" node to your workflow
2. Choose "Merge Video and Audio" operation
3. Provide video and audio file URLs
4. Configure output settings
5. Run the workflow to create the merged video

## Output Formats

### Leonardo Node Output

The Leonardo node returns a structured JSON response with:

- `success`: Boolean indicating if the generation was successful
- `generationId`: Unique identifier for the generation
- `status`: Status of the generation (e.g., "COMPLETE")
- `prompt`: The text prompt used for generation
- `modelId`: The model used for generation
- `imageCount`: Number of images generated
- `images`: Array of generated image objects with URLs and metadata
- `rawResponse`: The full API response for advanced use cases

### JSON2Video Node Output

The JSON2Video node returns:

- `success`: Boolean indicating if the operation was successful
- `project`: Unique project identifier
- `status`: Current status of the video generation
- `url`: Download URL when video is complete
- `duration`: Length of the generated video
- `size`: File size of the generated video
- `width` / `height`: Dimensions of the output video

## Roadmap

As this node package continues to evolve, we've identified several areas for enhancement:

### Code Improvements

- Refactor execute methods into smaller, more maintainable functions
- Extract common polling logic into reusable utility functions
- Strengthen parameter handling with consistent naming conventions
- Improve error recovery strategies for intermittent API issues

### Documentation Enhancements

- Add JSDoc comments to all exported classes and functions
- Expand usage examples with more real-world workflow scenarios
- Document error conditions and provide comprehensive troubleshooting guidance

### Testing Refinements

- Achieve comprehensive test coverage for all edge cases
- Improve organization of test files to reduce overlapping tests
- Add more thorough parameter validation testing
- Implement better testing approaches for complex conditional logic

## Future Development

This node package is designed with expandability in mind as part of the Self-Host Hub collection.

### Leonardo.ai API Integration Expansion

- **Creative Assets**: Video Generation, Texture Generation, Image Variations
- **3D Asset Creation**: 3D Model Generation, Texturing, Character Creation
- **Content Management**: Dataset Operations, Custom Model Training
- **Account Management**: User Authentication, Webhook Integration

### JSON2Video API Integration Expansion

- **Advanced Video Features**: Complex animations, advanced transitions
- **Template Management**: Reusable template systems, template marketplace integration
- **Batch Processing**: Multiple video generation workflows
- **Real-time Features**: Live video streaming capabilities

### Additional Service Integrations

The Self-Host Hub node collection will expand to include other AI and content generation services in future releases, including but not limited to:

- Image editing and enhancement APIs
- Audio generation and processing services
- Text-to-speech and voice synthesis platforms
- Document and presentation generation tools

## Documentation

This repository includes detailed documentation in the `docs/` directory:

- [Documentation Hub](docs/) - Central documentation directory with navigation
- [Leonardo User Guide](docs/CreateLeonardoImage/DOCUMENTATION.md) - Comprehensive Leonardo integration guide
- [JSON2Video User Guide](docs/CreateJ2vMovie/DOCUMENTATION.md) - Complete JSON2Video integration documentation
- [Development Guidelines](docs/DEVELOPMENT_GUIDELINES.md) - Technical standards and development guidelines
- [Publishing Guide](docs/PUBLISHING.md) - Release and publishing procedures

## External Resources

- [Leonardo.ai Documentation](https://docs.leonardo.ai/docs/getting-started)
- [JSON2Video Documentation](https://json2video.com/docs/v2/)
- [n8n Community Node Documentation](https://docs.n8n.io/integrations/creating-nodes/build/declarative-style-node/)
- [Self-Host Hub Linktree](https://linktr.ee/selfhosthub) - Connect with us on YouTube, GitHub, and all other platforms

## License

[MIT License](LICENSE)