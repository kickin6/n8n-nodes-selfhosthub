# Self-Host Hub Node Development Guidelines

This document outlines the standards and best practices for developing and maintaining nodes in the Self-Host Hub n8n node collection. Following these guidelines will ensure consistency across all nodes in the package and provide a cohesive user experience.

## Branding and Naming Conventions

### Node Naming

- **Display Name**: `Self-Host Hub (ServiceName)` 
  - Use proper capitalization following the service's official branding
  - Example: "Self-Host Hub (Leonardo)" for Leonardo.ai integration

- **Group**: Always use `selfhosthub` for the group property (lowercase)
  - This ensures all Self-Host Hub nodes appear together in the n8n UI

- **Default Name**: Match the display name for consistency
  ```javascript
  defaults: {
    name: 'Self-Host Hub (ServiceName)',
  },
  ```

- **Internal Name**: Use camelCase without special characters
  ```javascript
  name: 'createServiceName',
  ```

### Visual Identity

- Use blue emoji indicators (🔷 🔹 🔵) for section headers in the n8n UI
- Maintain consistent organization of parameters in sections:
  - Basic Parameters
  - Service-Specific Options
  - Advanced Options

## Code Organization

### Project Structure

- Place each service in its own subfolder under `/nodes/`
  ```
  nodes/
    ├── CreateLeonardoImage/
    │   ├── CreateLeonardoImage.node.ts
    │   └── models.ts
    ├── OtherServiceNode/
    │   ├── OtherServiceNode.node.ts
    │   └── ...
  ```

- Create corresponding credential files in `/credentials/`
  ```
  credentials/
    ├── CreateLeonardoImageCredentials.credentials.ts
    ├── OtherServiceCredentials.credentials.ts
  ```

- Update `index.ts` to export all nodes and credentials
  ```typescript
  export const nodes = [
    new CreateLeonardoImage(),
    new OtherServiceNode(),
  ];

  export const credentials = [
    new CreateLeonardoImageCredentials(),
    new OtherServiceCredentials(),
  ];
  ```

### Internal Structure

- Keep parameter handling separate from API interaction logic
- Implement polling mechanism pattern for long-running operations
- Use consistent error handling and validation approaches

## Code Style and Quality

### TypeScript Configuration

- The project is configured to be compatible with n8n's TypeScript expectations
- By default, `isolatedModules` is disabled in `tsconfig.json` to allow using n8n's const enums
- When working with NodeConnectionType and other const enums, use the enum directly:
  ```typescript
  inputs: [{ type: NodeConnectionType.Main }]
  ```
- If you need to temporarily enable `isolatedModules` for testing:
  1. Make your changes to tsconfig.json
  2. Test locally
  3. Revert tsconfig.json changes before committing

### Formatting

- Use Prettier with the project's configuration
- Always run `npm run format` before committing changes
- Use single quotes for strings consistently
- Follow the line length and indentation settings in `.prettierrc`

### Structure

- Use section comments to organize node parameters
  ```typescript
  // Prompt Engineering
  {
    displayName: '🔷 Prompt Engineering',
    name: 'promptEngineeringHeading',
    type: 'notice',
    // ...
  }
  ```

- Consistently group related parameters under the same section
- Order sections logically (e.g., basic parameters first, then advanced options)

### Parameter Design

- For boolean parameters, use three-state select boxes (true/false/empty) instead of toggle buttons
- Set appropriate display conditions to show or hide dependent parameters
- Use "NO_SELECTION" as value and "No Selection" as text for empty dropdown options
- Match API parameter names where possible to minimize confusion
- When adapting API parameters, use clear descriptive names
- Document any parameter name transformations in code comments

### Error Handling

- Use proper error handling in all API requests
- Provide informative error messages that help users troubleshoot issues
- Consider edge cases like API rate limits, authentication failures, etc.

## Testing

### Test Organization

- Place tests in the appropriate directory:
  - Node tests: `__tests__/nodes/ServiceName/`
  - Credential tests: `__tests__/credentials/`
  - Utility tests: `__tests__/src/`
  - Manual tests: `__tests__/manual/`

- Ensure test files are excluded from production builds:
  ```json
  // tsconfig.json
  "exclude": [
    "node_modules",
    "dist",
    "attached_assets/**",
    "__tests__/**"
  ]
  ```

### Test Coverage Requirements

- **Goal**: 100% code coverage for all submissions
- Document any lines that cannot be tested with clear explanations:
  ```typescript
  /* istanbul ignore next - This code handles a rare system error that can't be reliably simulated in tests */
  catch (error) {
    if (error instanceof SystemError) {
      // Handle system error...
    }
  }
  ```
- Run coverage reports before creating a PR: `npm run test:coverage`
- Address any coverage gaps or document why they cannot be addressed

### Test Quality Standards

- Implement unit tests for all functions and methods
- Create integration tests for API interactions
- Add edge case tests for all error conditions
- Test all parameter combinations that users might employ
- Verify proper error handling and user-friendly error messages
- Include tests for both success and failure scenarios

### Running Tests

- For automated tests: `npm test` or `npx jest`
- For test coverage: `npx jest --coverage`
- For manual testing: Use appropriate test scripts in `__tests__/manual/`
- Add your own manual test scripts to the `__tests__/manual/` directory

### Testing Implementation Notes

- The project uses real timeouts with minimal delay (1ms) instead of Jest's fake timers
- This approach ensures consistent test behavior across different environments (local, CI/CD)
- No need for complex environment detection or fake timer manipulation
- Faster test execution (~7 seconds) while maintaining 100% code coverage
- If adding asynchronous code with timeouts, use the same pattern of 1ms timeouts for testing

## Documentation

### Code Documentation

- Document complex logic with clear comments
- Include JSDoc comments for public methods
- Explain parameter transformations or non-obvious behavior

### User Documentation

- Create service-specific documentation in the `/docs/` folder
- Update the main README.md to list new nodes
- Include example workflows where appropriate
- Document credential requirements and any API limitations

## API Compatibility

### Version Handling

- Maintain backward compatibility when possible
- Document any breaking changes clearly
- Consider providing fallback behavior for deprecated API features

### Rate Limits

- Be mindful of service API rate limits
- Implement appropriate retry or throttling mechanisms
- Document rate limit considerations for users

## Package Management

### Dependencies

- Keep dependencies to a minimum
- Use only widely supported and well-maintained packages
- Document any special dependency requirements

### n8n Compatibility

- Test with the current n8n version
- Follow n8n's community node development guidelines
- Use the appropriate n8n API version

## Contributing Process

### Issue Creation

- Before starting work, create an issue describing the feature, bug, or improvement
- Include clear acceptance criteria in the issue description
- Add relevant labels (bug, enhancement, documentation, etc.)
- Discuss implementation approaches in the issue before starting work

### Pull Request Guidelines

- All PRs must reference an issue number
- PRs should focus on a single issue or feature
- Include comprehensive test results in the PR description
- Document any implementation decisions or trade-offs made
- Ensure all code is fully tested (100% coverage is the goal)
- Add detailed comments for any code that requires explanation
- Run all tests and verify code coverage before submitting

### Code Review Process

- All code must be reviewed by at least one maintainer
- Address review comments promptly
- Re-request review after making requested changes
- Be open to constructive feedback and suggestions
- Make sure all tests pass in the CI pipeline

### TypeScript Configuration for Development

The project is configured with specific TypeScript settings to maintain compatibility with n8n:

- `isolatedModules` is disabled in `tsconfig.json` for compatibility with n8n's const enums
- When working with const enums (like NodeConnectionType), use them directly in your code
- Follow the TypeScript patterns used in existing code for consistency

If you need to temporarily enable `isolatedModules` for testing purposes:
1. Temporarily uncomment the line in tsconfig.json
2. Run your tests
3. Comment it back out before committing any changes

For publishing information and release management, please refer to [PUBLISHING.md](./PUBLISHING.md).

## Service-Specific Implementation Guides

### Leonardo Node

The Leonardo node implementation includes these specific guidelines:

- **Parameter Organization**:
  - Basic Parameters
  - Image Options
  - Prompt Engineering
  - Generation Parameters
  - Image-to-Image (when applicable)
  - Advanced Options

- **Polling Mechanism**:
  - Use the established polling mechanism for generation jobs
  - Handle status transitions properly (PENDING → STARTED → COMPLETE)
  - Implement proper error handling for failed generations

- **Feature Support**:
  - Maintain support for all implemented features
  - When adding new features, follow the section organization pattern
  - Document new parameters thoroughly

## Community Resources

- Join the Self-Host Hub community on Skool.com
- Check the YouTube channel for updates and tutorials
- Connect via GitHub for issues and feature requests
- Visit the Linktree (https://linktr.ee/selfhosthub) for all resources

## Future Development Roadmap

- Implement additional service integrations
- Support for video generation in Leonardo
- Texture generation features
- 3D model integration
- User account management operations

By following these guidelines, we'll maintain a high-quality, consistent experience across all Self-Host Hub nodes in the n8n ecosystem.