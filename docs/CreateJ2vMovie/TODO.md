# CreateJ2vMovie Node - TODO List

## Phase 1: Code Cleanup & Consistency
**Priority: MEDIUM - Technical Debt**

### 1.1 Remove Deprecated Functions
- [ ] Remove `createSubtitleElement()` from mergeVideosBuilder.ts (marked as deprecated)
- [ ] Audit codebase for any other deprecated helper functions
- [ ] Update documentation to remove references to deprecated functions

### 1.2 Extend Movie-Level Elements to Other Operations
- [ ] Add movie-level elements support to `mergeVideoAudioBuilder.ts`
- [ ] Add movie-level elements UI to `mergeVideoAudioOperation.ts`
- [ ] Ensure consistent movie-level element patterns across all operations
- [ ] Update tests for mergeVideoAudio movie-level elements

### 1.3 Enhance Subtitle Auto-Detection
- [ ] Consider supporting additional URL schemes (https, ftp, relative URLs)
- [ ] Add validation for subtitle file extensions (.srt, .vtt, .ass)
- [ ] Improve error messages for invalid subtitle content detection
- [ ] Add user feedback for auto-detection results

## Phase 2: Feature Enhancements
**Priority: LOW - Future Improvements**

### 2.1 Advanced Subtitle Features
- [ ] Add support for subtitle timing validation
- [ ] Add subtitle format conversion (SRT ↔ VTT ↔ ASS)
- [ ] Add subtitle preview functionality
- [ ] Add multi-language subtitle support per element

### 2.2 Enhanced Movie-Level Element Types
- [ ] Add movie-level image elements (logos, watermarks)
- [ ] Add movie-level audio elements (background music)
- [ ] Add movie-level voice elements (narration)
- [ ] Update UI and processing logic for new element types

### 2.3 Performance Optimizations
- [ ] Implement element processing batching for large collections
- [ ] Add caching for repeated element validations
- [ ] Optimize memory usage for large subtitle files
- [ ] Add progress indicators for long-running operations

## Phase 3: Developer Experience
**Priority: LOW - Quality of Life**

### 3.1 Enhanced Error Handling
- [ ] Add element-specific error recovery strategies
- [ ] Improve validation error message formatting
- [ ] Add suggestions for common validation failures
- [ ] Add validation warnings for potential issues

### 3.2 Documentation & Examples
- [ ] Add usage examples for movie-level elements
- [ ] Create troubleshooting guide for subtitle auto-detection
- [ ] Add best practices guide for element positioning
- [ ] Create video tutorials for complex operations

### 3.3 Development Tools
- [ ] Add element preview functionality for testing
- [ ] Create validation tool for JSON templates
- [ ] Add schema validation for element configurations
- [ ] Create migration tools for updating deprecated patterns

## Completed in Recent Updates ✅

- [x] Add movie-level elements support to mergeVideos operation
- [x] Implement subtitle auto-detection (URL vs inline content)
- [x] Update mergeVideosBuilder.ts with movie-level element processing
- [x] Update mergeVideosOperation.ts with Movie Elements UI collection
- [x] Add comprehensive test coverage for movie-level elements
- [x] Remove createSubtitleElement() deprecated function
- [x] Update ARCHITECTURE.md with new features and patterns

## Implementation Notes

### Movie-Level Elements Pattern
When adding movie-level elements to other operations, follow this pattern:

1. **UI Layer**: Add `movieElements` fixedCollection to operation parameters
2. **Processing**: Process movie elements separately from scene elements
3. **API Structure**: Add to `requestBody.elements` (not `scene.elements`)
4. **Testing**: Test both movie-level and scene-level element processing
5. **Validation**: Validate movie elements with same rigor as scene elements

### Subtitle Auto-Detection Logic
Current implementation:
```typescript
...(subtitleElement.captions?.startsWith('http') 
    ? { src: subtitleElement.captions } 
    : { text: subtitleElement.captions || '' })
```

Enhancement considerations:
- Support more URL schemes beyond 'http'
- Validate file extensions for URL sources
- Add content-type detection for better classification
- Provide user feedback about detection results

### Priority Guidelines

**HIGH**: Critical bugs, security issues, breaking changes
**MEDIUM**: Technical debt, consistency improvements, missing features
**LOW**: Nice-to-have features, developer experience improvements, optimizations

### Development Workflow

1. **Before Starting**: Check this TODO list and update status
2. **During Development**: Add new TODO items as they're discovered
3. **After Completion**: Move completed items to "Completed" section with date
4. **Regular Maintenance**: Review and reprioritize items quarterly