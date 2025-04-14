# Publishing Guide for n8n-nodes-selfhosthub

This document outlines the process for preparing, testing, and publishing the n8n-nodes-selfhosthub package to npm.

## TLDR: Quick Publishing Steps

```bash
# 1. Update version in package.json (e.g., "0.1.0" to "0.1.1")

# 2. Run tests
npm test
npm run test:coverage

# 3. Build the package
npm run build

# 4. Login to npm
npm login

# 5. Publish
npm publish

# 6. Tag and push to GitHub
git tag -a v0.1.1 -m "Release v0.1.1"
git push origin v0.1.1

# 7. Create GitHub release through the web interface
```

*See the detailed sections below for complete instructions.*

## Prerequisites

Before publishing, ensure you have the following:

1. An npm account with publishing permissions for the n8n-nodes-selfhosthub package
2. Node.js and npm installed locally
3. Access to the GitHub repository

## Preparation Steps

### 1. Update Version Number

Update the version number in `package.json` according to [Semantic Versioning](https://semver.org/) rules:

- **Major version (x.0.0)**: Breaking changes that are not backward compatible
- **Minor version (0.x.0)**: New features added in a backward-compatible manner
- **Patch version (0.0.x)**: Backward-compatible bug fixes

#### Making Version Decisions

When deciding which version number to increment, consider these guidelines:

**Increment the MAJOR version when:**
- You've changed the node interface in a way that breaks existing workflows
- You've removed or renamed parameters that users might be utilizing
- You've changed the credential structure
- Changes to outputs would break existing workflows using your nodes
- Significant refactoring requiring users to update their workflows

**Increment the MINOR version when:**
- Adding new functionalities that don't break existing workflows
- Adding new parameters or options while maintaining backward compatibility
- Adding support for new API features from Leonardo.ai
- Expanding node capabilities (additional operations, etc.)
- Performance improvements that don't change behavior

**Increment the PATCH version when:**
- Bug fixes that don't change the interface
- Documentation improvements
- Code refactoring that maintains the same behavior
- Dependency updates that don't affect functionality
- Error handling improvements that maintain compatibility

#### Example Decision Scenarios

- **Added a new parameter to customize rendering?** → Minor version (0.x.0)
- **Fixed a bug in error handling?** → Patch version (0.0.x)
- **Renamed a parameter field?** → Major version (x.0.0)
- **Added support for a new Leonardo.ai feature?** → Minor version (0.x.0)
- **Changed the credential API?** → Major version (x.0.0)
- **Updated documentation comments?** → Patch version (0.0.x)

### 2. Update Documentation

Ensure all documentation is up-to-date:

- README.md reflects current functionality
- Node documentation in docs/ directory is accurate
- Code comments are clear and helpful
- Changelog is updated with new features, changes, and bug fixes

### 3. TypeScript Configuration

The project maintains compatibility with n8n's usage of const enums by keeping `isolatedModules` disabled in `tsconfig.json`.

If you need to enable `isolatedModules` for any reason:
1. Uncomment the `"isolatedModules": true,` line in `tsconfig.json`
2. Update all usages of const enums with string literals and type assertions
3. For details, see the TypeScript Configuration section in [DEVELOPMENT_GUIDELINES.md](./DEVELOPMENT_GUIDELINES.md)

## Testing Before Publication

Run these checks before publishing:

### 1. Run All Tests

```bash
npm test
npm run test:coverage
```

Ensure all tests pass and code coverage meets standards (ideally 100%).

The tests should complete in approximately 7-10 seconds with the optimized testing approach using minimal real timeouts instead of fake timers.

### 2. Run Manual Tests

```bash
npx ts-node -r tsconfig-paths/register __tests__/manual/testCreateLeonardoImage.ts
```

Verify that the node functions correctly in a manual test scenario.

### 3. Build the Package

```bash
npm run build
```

Verify the build completes without errors and check that the `dist/` directory contains the expected files.

### 4. Verify the Package Contents

Ensure the package contains only the necessary files:

```bash
# List files that would be included in the published package
npm pack --dry-run
```

## Publishing Process

Once all tests pass and the build is successful, follow these steps to publish:

### 1. Login to npm

```bash
npm login
```

Enter your credentials when prompted.

### 2. Publish the Package

```bash
npm publish
```

For a dry run (not actually publishing):
```bash
npm publish --dry-run
```

### 3. Tag the Release in Git

After successful publication:

```bash
git tag -a v0.1.0 -m "Release v0.1.0"
git push origin v0.1.0
```

Replace `0.1.0` with the actual version number.

### 4. Create a GitHub Release

- Go to the GitHub repository's Releases page
- Create a new release using the tag you just pushed
- Include detailed release notes describing new features, changes, and bug fixes
- Add any additional context or migration information users might need

## Post-Publication

After publishing:

1. Verify the package is accessible on npm: https://www.npmjs.com/package/n8n-nodes-selfhosthub
2. Test installing the package in a new n8n instance to ensure it works as expected
3. Announce the release to the community through appropriate channels

## Troubleshooting

If you encounter issues during the publishing process:

### npm Publish Fails

- Check that your npm account has the appropriate permissions
- Verify you're logged in with the correct account
- Ensure the package version hasn't already been published

### Build Errors

- Check TypeScript configuration issues, especially if you've modified the `tsconfig.json`
- Ensure all dependencies are installed and up-to-date
- Look for linting or formatting errors that might be causing the build to fail

## Version Management

### Managing Pre-releases

For pre-release versions:

```bash
# Update version in package.json to something like "0.1.0-beta.1"
npm publish --tag beta
```

This allows users to test pre-release versions without affecting the default install version.

## Additional Resources

- [npm Publishing Documentation](https://docs.npmjs.com/cli/v8/commands/npm-publish)
- [n8n Community Node Documentation](https://docs.n8n.io/integrations/creating-nodes/code/create-n8n-nodes-module/)
- [Semantic Versioning](https://semver.org/)