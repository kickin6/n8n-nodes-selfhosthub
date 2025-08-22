# CreateJ2vMovie Node Architecture

## Overview

The CreateJ2vMovie node is an n8n integration for the JSON2Video API that converts JSON configurations into video content. It supports three main operations: creating movies from scratch, merging video with audio, and combining multiple videos.

## Directory Structure & File Purposes

```
nodes/CreateJ2vMovie/
├── CreateJ2vMovie.node.ts          # Main n8n node definition and routing
├── operations/                     # Operation-specific n8n parameter definitions
│   ├── createMovieOperation.ts     # Movie creation UI parameters & validation
│   ├── mergeVideoAudioOperation.ts # Video/audio merging UI parameters
│   ├── mergeVideosOperation.ts     # Video concatenation UI parameters with movie-level elements
│   └── shared/
│       ├── commonParams.ts         # Shared parameters across all operations
│       └── elements.ts             # Element field definitions & TypeScript interfaces
├── utils/                          # Core processing logic
│   ├── elementProcessor.ts         # Simple element processing (image, video, audio, voice)
│   ├── textElementProcessor.ts     # Text-based element processing (text, subtitles)
│   ├── positionUtils.ts           # Position calculation utilities
│   ├── webhookUtils.ts            # Webhook handling utilities
│   └── requestBuilder/            # Request body construction
│       ├── index.ts               # Main builder entry point & operation routing
│       ├── createMovieBuilder.ts  # Movie creation request body building
│       ├── mergeVideoAudioBuilder.ts # Video/audio merge request body building
│       ├── mergeVideosBuilder.ts  # Video concatenation with movie-level and scene-level elements
│       ├── advanced.ts            # Advanced mode JSON template processing
│       ├── shared.ts              # Shared builder utilities & helper functions
│       └── types.ts               # TypeScript interfaces for API structures
├── templates/                     # JSON templates for advanced mode
│   ├── createMovie.json          # Default template for movie creation
│   ├── mergeVideoAudio.json      # Default template for video/audio merge
│   └── mergeVideos.json          # Default template for video concatenation
└── schema/                        # Parameter validation schemas
    └── parameters.json           # JSON schema for parameter validation
```

## Test Architecture

```
__tests__/nodes/CreateJ2vMovie/
├── CreateJ2vMovie.node.test.ts              # Main node integration tests
├── operations/                              # Parameter definition tests
│   ├── createMovieOperation.test.ts
│   ├── mergeVideoAudioOperation.test.ts
│   └── mergeVideosOperation.test.ts
├── utils/                                   # Core logic tests
│   ├── elementProcessor.test.ts
│   ├── textElementProcessor.test.ts
│   ├── positionUtils.test.ts
│   ├── webhookUtils.test.ts
│   └── requestBuilder/                      # Request builder tests
│       ├── requestBuilder.createMovie.test.ts
│       ├── requestBuilder.mergeVideoAudio.test.ts
│       ├── requestBuilder.mergeVideos.test.ts   # Includes movie-level elements tests
│       ├── advanced.test.ts
│       └── shared.test.ts
└── fixtures/                                # Test data and mocks
    ├── elementFixtures.ts
    ├── mockExecuteFunctions.ts
    └── templateFixtures.ts
```

## Core Processing Architecture

The node follows a dual-processor pattern that handles elements based on their complexity and API requirements:

### 1. Element Processing Strategy

**Simple Elements** (`elementProcessor.ts`):
- **Handles**: image, video, audio, voice
- **Processing**: Direct property mapping, basic positioning
- **API Format**: Flat properties with minimal transformation
- **Called From**: All request builders for non-text elements

**Text-Based Elements** (`textElementProcessor.ts`):
- **Handles**: text, subtitles  
- **Processing**: Complex `settings` object construction with kebab-case properties
- **API Format**: Nested settings object + direct properties
- **Called From**: Request builders for text/subtitle elements specifically

### 2. Operation-Specific Request Builders

Each JSON2Video API operation has specialized requirements handled by dedicated builders:

**createMovieBuilder.ts**:
- **Purpose**: Builds complex movie compositions with scenes
- **Handles**: Movie-level elements, scene-level elements, text elements
- **Complexity**: Most complex - supports nested scenes and multi-level elements
- **Key Logic**: Scene processing, element layering, movie-level vs scene-level routing

**mergeVideoAudioBuilder.ts**:
- **Purpose**: Synchronizes video and audio into single composition
- **Handles**: Single video element, single audio element, timing synchronization
- **Complexity**: Medium - focused on A/V sync and element coordination
- **Key Logic**: Audio-video timing, volume control, subtitle overlay for accessibility

**mergeVideosBuilder.ts**:
- **Purpose**: Concatenates multiple videos with transitions and global elements
- **Handles**: Multiple video elements, transitions, movie-level text/subtitles, scene-level subtitles
- **Complexity**: Medium-High - sequential video processing with global element support
- **Key Logic**: Video sequence management, transition timing, movie-level vs scene-level element routing

### 3. Movie-Level Elements Support

**mergeVideosBuilder.ts** now supports movie-level elements that appear across all scenes:

**Movie Elements**:
- **Text Elements**: Global text overlays using `textElementProcessor`
- **Subtitle Elements**: Global subtitle tracks with language support and auto-detection
- **API Structure**: Added to `requestBody.elements` (not scene elements)
- **UI Format**: Simplified interface with auto-detection for URL vs inline content

**Processing Logic**:
```typescript
// Movie-level elements go to requestBody.elements
if (allMovieElements.length > 0) {
    requestBody.elements = allMovieElements;
}

// Scene-level elements go to each scene.elements
scenes.forEach(scene => {
    scene.elements.push(...sceneElements);
});
```

**Subtitle Auto-Detection**:
```typescript
// Auto-detect URL vs inline content for subtitles
const subtitleParams = subtitleElement.captions?.startsWith('http') 
    ? { src: subtitleElement.captions, language: subtitleElement.language }
    : { text: subtitleElement.captions || '', language: subtitleElement.language };
```

## Element Processing Flow

### Element Type Routing Logic

**In Request Builders**:
```typescript
// Movie-level processing (mergeVideos only)
if (movieElement.type === 'text') {
    processedElement = processTextElement(textParams);
    allMovieElements.push(processedElement);
} else if (movieElement.type === 'subtitles') {
    // Auto-detect URL vs inline content
    const subtitleParams = subtitleElement.captions?.startsWith('http') 
        ? { src: subtitleElement.captions, language: subtitleElement.language }
        : { text: subtitleElement.captions || '', language: subtitleElement.language };
    processedElement = processSubtitleElement(subtitleParams);
    allMovieElements.push(processedElement);
}

// Scene-level processing (all operations)
if (element.type === 'text') {
    processedElement = processTextElement(textParams);
} else if (element.type === 'subtitles') {
    processedElement = processSubtitleElement(subtitleParams);
} else {
    // Route to elementProcessor for: image, video, audio, voice
    processedElement = processElement.call(this, element, width, height);
}
```

### Text vs Subtitle Processing Distinction

**Text Elements**:
- **Purpose**: Decorative text, titles, graphics, overlays
- **Positioning**: Flexible positioning throughout video canvas
- **Styling**: Full creative control, artistic fonts, effects
- **Timing**: Manual timing control
- **API Structure**: `settings` object + direct properties

**Subtitle Elements**:
- **Purpose**: Captions, translations, accessibility, audio-synchronized text
- **Positioning**: Optimized for readability (typically bottom-centered)
- **Styling**: Readable fonts, high contrast, shadows for clarity
- **Timing**: Often synchronized to audio/speech
- **API Structure**: `settings` object + direct properties (same as text but different defaults)
- **Source Types**: URL references (SRT/VTT files) or inline subtitle content

## Request Builder Architecture

### Data Flow Pattern

```
n8n UI Parameters
       ↓
Operation Files (Parameter Definitions)
       ↓
Request Builders (Business Logic)
       ↓
Element Processors (API Formatting)
       ↓
JSON2Video API Request
```

### Builder Responsibilities

**Parameter Collection**: Extract and validate n8n node parameters
1. **Element Processing**: Route elements to appropriate processors
2. **Request Body Construction**: Assemble final API request structure
3. **Validation**: Ensure all required properties are present and valid
4. **Error Handling**: Provide meaningful error messages for validation failures

## File Relationships & Dependencies

### Import Flow
```
Operations Files
    ↓ (import field definitions)
shared/elements.ts
    ↓ (export interfaces)
textElementProcessor.ts ← Request Builders
    ↓ (import interfaces)
Request Builders
    ↓ (build API format)
JSON2Video API
```

### Circular Dependency Prevention
- **Operations** define parameters only, no business logic
- **Request Builders** import from operations but never export to them
- **Processors** are pure functions with no cross-dependencies
- **Shared utilities** are imported by multiple files but import nothing complex

## API Compliance & Formatting

### Critical API Requirements

**Text-Based Elements (text, subtitles)**:
1. **Property Naming**: n8n camelCase → API kebab-case in settings object
2. **Settings Object**: ALL text formatting must be nested under `settings`
3. **Direct Properties**: Timing, positioning, core element properties stay at root level
4. **Type Validation**: Must use exact API type names ('text', 'subtitles')

**Movie vs Scene Elements**:
1. **Movie Elements**: Added to `requestBody.elements` - appear across all scenes
2. **Scene Elements**: Added to `scene.elements` - appear only in specific scenes
3. **Routing Logic**: Determined by operation type and element context

## Extension Points & Future Architecture

### Adding New Element Types

**Simple Elements** (image-like processing):
1. Add to `elementProcessor.ts` switch statement
2. Create processing function following existing pattern
3. Add to operation parameter definitions
4. Create test fixtures and validation

**Complex Elements** (text-like processing):
1. Evaluate if new specialized processor needed
2. If text-like, add to `textElementProcessor.ts`
3. If unique complexity, create new processor following dual-processor pattern
4. Update request builders to route correctly

### Adding New Operations

**Full New Operation**:
1. Create new operation file in `operations/`
2. Create corresponding builder in `utils/requestBuilder/`
3. Add routing to main node file
4. Create comprehensive test suite
5. Add JSON template for advanced mode

**Operation Enhancement**:
1. Update relevant operation parameter file
2. Update corresponding request builder
3. Maintain backward compatibility
4. Update tests and validation

### Adding Movie-Level Elements to Other Operations

**Pattern to Follow** (based on mergeVideos implementation):
1. Add Movie Elements collection to operation parameters
2. Process movie elements separately from scene elements
3. Add movie elements to `requestBody.elements`
4. Maintain scene elements in `scene.elements`
5. Update tests to cover both element levels

## Performance Considerations

### Element Processing Optimization

**Validation Strategy**: 
- Validate all elements before processing any
- Collect all validation errors and throw once
- Avoid partial processing on validation failure

**Memory Management**:
- Process elements in batches for large collections
- Use streaming for large subtitle files
- Clear processed data when no longer needed

**Error Recovery**:
- Graceful degradation for non-critical validation failures
- Detailed error messages with element index and property name
- Preserve as much user data as possible in error states

## Testing Strategy

### Test Coverage Requirements

**Unit Tests**: Individual function testing with mocked dependencies
- Element processors with fixtures
- Request builders with mocked n8n functions
- Utility functions with edge cases

**Integration Tests**: End-to-end operation testing
- Full parameter-to-API request flow
- Real n8n execution context simulation
- Error handling and validation testing

**Movie-Level Elements Testing**:
- Test both movie-level and scene-level element processing
- Test auto-detection logic for subtitle content types
- Test validation error handling for both element levels
- Test element routing between `requestBody.elements` and `scene.elements`

### Test Organization

**Fixtures**: Reusable test data for consistent testing
**Mocks**: n8n function mocking for isolated testing  
**Helpers**: Common test utilities and setup functions
**Coverage**: Minimum 95% line coverage for core business logic