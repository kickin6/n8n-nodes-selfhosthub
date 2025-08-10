# Self-Host Hub Documentation

This directory contains comprehensive documentation for all Self-Host Hub n8n nodes and development resources.

## Documentation Structure

### Service-Specific Documentation

#### [Leonardo Image Generation](CreateLeonardoImage/)
AI image generation integration with Leonardo.ai API
- **[User Documentation](CreateLeonardoImage/DOCUMENTATION.md)** - Complete guide for using the Leonardo node
- **[Parameter Handling](CreateLeonardoImage/parameter-handling.md)** - Technical details on parameter processing
- **[Implementation Guidelines](CreateLeonardoImage/leonardo-implementation-guidelines.md)** - Leonardo-specific development patterns
- **[API Reference Materials](CreateLeonardoImage/reference-materials/)** - Official API documentation and examples

#### [JSON2Video](CreateJ2vMovie/)
Video creation and manipulation with JSON2Video API
- **[User Documentation](CreateJ2vMovie/DOCUMENTATION.md)** - Complete guide for using the JSON2Video node
- **[JSON Schema Reference](CreateJ2vMovie/JSON_SCHEMA.md)** - Detailed API schema documentation and examples

### Development Resources

- **[Development Guidelines](DEVELOPMENT_GUIDELINES.md)** - Universal development standards and best practices for all nodes
- **[Publishing Guide](PUBLISHING.md)** - Step-by-step guide for publishing updates to npm

## Getting Started

### For Users
1. Choose the service you want to integrate with from the service-specific documentation above
2. Follow the user documentation for setup and configuration
3. Explore the examples and use cases provided

### For Developers
1. Start with the [Development Guidelines](DEVELOPMENT_GUIDELINES.md) for project-wide standards
2. Review service-specific implementation guidelines for the service you're working on
3. Follow the [Publishing Guide](PUBLISHING.md) when ready to release changes

### For Contributors
1. Read the [Development Guidelines](DEVELOPMENT_GUIDELINES.md) for coding standards and contribution process
2. Check the service-specific documentation for implementation patterns
3. Ensure all tests pass and documentation is updated before submitting PRs

## Available Integrations

| Service | Node Name | Capabilities |
|---------|-----------|--------------|
| Leonardo.ai | Self-Host Hub (Leonardo) | AI image generation, custom models, image-to-image |
| JSON2Video | Self-Host Hub (JSON2Video) | Video creation, media merging, element composition |

## Community Resources

- **Creator Link Tree**: [linktr.ee/selfhosthub](https://linktr.ee/selfhosthub)
- **GitHub Repository**: [n8n-nodes-selfhosthub](https://github.com/kickin6/n8n-nodes-selfhosthub)
- **npm Package**: [n8n-nodes-selfhosthub](https://www.npmjs.com/package/n8n-nodes-selfhosthub)

## Contributing

This project welcomes contributions! Please refer to the Development Guidelines for standards and the individual service documentation for implementation details.

For questions, issues, or feature requests, please use the GitHub repository's issue tracker.