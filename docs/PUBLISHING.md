# Publishing Guide for n8n-nodes-selfhosthub

This document outlines the process for preparing, testing, and publishing the n8n-nodes-selfhosthub package to npm.

## TLDR: Quick Publishing Steps

```bash
# 1. Merge feature branch to main first (via GitHub PR)

# 2. Prepare main branch
git checkout main
git pull origin main

# 3. Version bump (automatically updates package.json and creates tag)
npm version patch   # Bug fixes (0.1.0 → 0.1.1)
npm version minor   # New features (0.1.0 → 0.2.0)
npm version major   # Breaking changes (0.1.0 → 1.0.0)

# 4. Run tests
npx jest
npx jest --coverage --silent

# 5. Build the package
npm run build

# 6. Login to npm (if needed)
npm login

# 7. Publish
npm publish

# 8. Push version tag to GitHub
git push --follow-tags

# 9. Create GitHub release through the web interface
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
- Adding support for new API features from any integrated service
- Expanding node capabilities (additional operations, etc.)
- Performance improvements that don't change behavior

**Increment the PATCH version when:**
- Bug fixes that don't change the interface
- Documentation improvements
- Code refactoring that maintains the same behavior
- Dependency updates that don't affect functionality
- Error handling improvements that maintain compatibility

#### Example Decision Scenarios

- **Added a new parameter to customize output?** → Minor version (0.x.0)
- **Fixed a bug in error handling?** → Patch version (0.0.x)
- **Renamed a parameter field?** → Major version (x.0.0)
- **Added support for a new API feature?** → Minor version (0.x.0)
- **Changed the credential API structure?** → Major version (x.0.0)
- **Updated documentation comments?** → Patch version (0.0.x)
- **Added a new service integration node?** → Minor version (0.x.0)
- **Changed how existing nodes handle responses?** → Major version (x.0.0)

###