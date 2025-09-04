# CreateJ2vMovie Node - Architecture

## Overview

The CreateJ2vMovie n8n node provides a comprehensive interface to the JSON2Video API, enabling users to create videos programmatically through three distinct workflows. The architecture follows clean design principles with clear separation of concerns and a schema-first approach.

## Core Principles

1. **Single Source of Truth**: JSON2Video API schema defines all rules and validation
2. **Fail Fast**: Invalid data should never reach the API
3. **UI Responsibility**: Enforce required fields and guide user input through parameter definitions
4. **Core Responsibility**: Transform and validate data, never assume defaults
5. **100% Testable**: Every code path explicitly tested, no hidden defaults or fallback logic
6. **Schema-First**: All validation references the official JSON2Video API schema

## Architecture Layers

```
┌─────────────────────────────────────────────────────────────────┐
│ PRESENTATION LAYER (n8n Parameter Definitions)                 │
├─────────────────────────────────────────────────────────────────┤
│ • Three UI workflows: createMovie, mergeVideoAudio, mergeVideos     │
│ • Parameter definitions with required: true for API fields    │
│ • Field-level validation (regex, min/max, enums, etc.)        │
│ • Display conditions for complex workflows                     │
│ • Advanced mode: JSON text area with real-time validation     │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│ CORE LAYER (Business Logic)                                    │
├─────────────────────────────────────────────────────────────────┤
│ • parameterCollector.ts - Extracts n8n parameters by workflow │
│ • elementProcessor.ts - Processes elements per API rules      │
│ • requestBuilder.ts - Assembles final JSON structure          │
│ • schemaValidator.ts - Validates against JSON2Video schema    │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│ SCHEMA LAYER (API Contract)                                    │
├─────────────────────────────────────────────────────────────────┤
│ • json2videoSchema.ts - Complete API schema definition        │
│ • validators.ts - Schema validation functions                 │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│ JSON2VIDEO API                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## File Structure

```
nodes/CreateJ2vMovie/
├── presentation/                    # UI parameter definitions
│   ├── createMovieParameters.ts     # Movie creation workflow UI
│   ├── mergeVideoAudioParameters.ts      # Audio merging workflow UI
│   └── mergeVideosParameters.ts     # Video sequence workflow UI
├── schema/                          # API schema and validation
│   ├── json2videoSchema.ts          # Complete JSON2Video API schema
│   └── validators.ts                # Schema validation functions
├── core/                            # Business logic
│   ├── parameterCollector.ts        # Extract parameters by workflow
│   ├── elementProcessor.ts          # Process elements per API rules
│   ├── requestBuilder.ts            # Build final JSON request
│   └── schemaValidator.ts           # Runtime schema validation
└── CreateJ2vMovie.node.ts           # Main node orchestration

__tests__/nodes/CreateJ2vMovie/      # Mirror structure for tests
├── presentation/
│   ├── createMovieParameters.test.ts
│   ├── mergeVideoAudioParameters.test.ts
│   └── mergeVideosParameters.test.ts
├── schema/
│   ├── json2videoSchema.test.ts
│   └── validators.test.ts
├── core/
│   ├── parameterCollector.test.ts
│   ├── elementProcessor.test.ts
│   ├── requestBuilder.test.ts
│   └── schemaValidator.test.ts
├── fixtures/
│   ├── testData.ts                  # Test data fixtures
│   └── mockExecuteFunctions.ts      # n8n mock utilities
└── CreateJ2vMovie.node.test.ts
```

## Layer Responsibilities

### Presentation Layer (`presentation/`)

**Purpose**: Define n8n UI parameter collections for different user workflows

**Files**:
- `createMovieParameters.ts` - Complex movie creation with custom scenes
- `mergeVideoAudioParameters.ts` - Simple video + audio merging workflow  
- `mergeVideosParameters.ts` - Video sequence/concatenation workflow

**Responsibilities**:
- Export `INodeProperties[]` parameter definitions
- Mark API-required fields as `required: true`
- Provide field-level validation via `typeOptions`
- Define display conditions for complex workflows
- Include advanced mode JSON text area option
- Pure UI definitions - no business logic or shared utilities

**Example Structure**:
```typescript
export const createMovieParameters: INodeProperties[] = [
  {
    displayName: 'Mode',
    name: 'mode',
    type: 'options',
    options: [
      { name: 'Basic Mode', value: 'basic' },
      { name: 'Advanced Mode (JSON)', value: 'advanced' }
    ],
    default: 'basic'
  },
  // Basic mode parameters...
  // Advanced mode JSON textarea...
];
```

### Schema Layer (`schema/`)

**Purpose**: Single source of truth for JSON2Video API schema and validation

**Files**:
- `json2videoSchema.ts` - Complete API schema definition
- `validators.ts` - Reusable validation functions

**Responsibilities**:
- Define complete JSON2Video API schema as TypeScript interfaces
- Export validation functions for all element types
- Define API rules (subtitles only at movie level, etc.)
- Provide clear error messages for schema violations
- Support both runtime validation and compile-time type checking

**API Schema Structure**:
```typescript
export interface JSON2VideoRequest {
  width: number;
  height: number;
  fps: number;
  elements?: MovieElement[];  // Movie-level elements
  scenes: Scene[];
}

export interface MovieElement {
  type: 'text' | 'subtitles' | 'audio' | 'voice';
  // Element-specific properties
}

export interface Scene {
  elements: SceneElement[];
  transition?: Transition;
}

export interface SceneElement {
  type: 'video' | 'audio' | 'image' | 'text' | 'voice';
  // Element-specific properties
}

export const API_RULES = {
  MOVIE_ELEMENT_TYPES: ['text', 'subtitles', 'audio', 'voice'],
  SCENE_ELEMENT_TYPES: ['video', 'audio', 'image', 'text', 'voice'],
  REQUIRED_FIELDS: {
    movie: ['width', 'height', 'fps', 'scenes'],
    scene: ['elements'],
    // Element-specific required fields
  }
};
```

### Core Layer (`core/`)

**Purpose**: Business logic for transforming n8n parameters to valid JSON2Video requests

**Files**:
- `parameterCollector.ts` - Extract parameters by workflow type
- `elementProcessor.ts` - Process elements according to API rules
- `requestBuilder.ts` - Assemble final JSON structure
- `schemaValidator.ts` - Runtime validation against schema

**Key Design Rules**:
- No default values in code - UI must collect all required data
- Explicit error handling for every failure scenario
- All functions are pure and testable
- Business logic is workflow-agnostic once parameters are collected

**Processing Flow**:
1. **Parameter Collection**: Extract n8n parameters based on workflow type
2. **Element Processing**: Transform elements according to JSON2Video API rules
3. **Request Building**: Assemble final JSON structure with proper hierarchy
4. **Schema Validation**: Validate complete request against API schema
5. **API Dispatch**: Send validated JSON to JSON2Video API

#### parameterCollector.ts
Extracts n8n parameters based on the workflow type (createMovie, mergeVideoAudio, mergeVideos):

```typescript
export function collectParameters(
  execute: IExecuteFunctions,
  itemIndex: number,
  workflow: 'createMovie' | 'mergeVideoAudio' | 'mergeVideos'
): CollectedParameters {
  // Extract workflow-specific parameters
  // No defaults, explicit validation
  // Return structured data for processing
}
```

#### elementProcessor.ts
Processes movie and scene elements according to JSON2Video API rules:

```typescript
export function processMovieElements(elements: RawElement[]): MovieElement[] {
  // Apply movie-level element rules
  // Validate subtitles placement
  // Transform text elements with settings objects
}

export function processSceneElements(elements: RawElement[]): SceneElement[] {
  // Apply scene-level element rules
  // Reject subtitles in scenes
  // Process positioning and timing
}
```

#### requestBuilder.ts
Assembles the final JSON2Video request structure:

```typescript
export function buildRequest(
  parameters: CollectedParameters,
  movieElements: MovieElement[],
  sceneElements: SceneElement[][]
): JSON2VideoRequest {
  // Build hierarchical JSON structure
  // Apply global settings
  // Structure scenes array
}
```

#### schemaValidator.ts
Validates requests against the JSON2Video API schema:

```typescript
export function validateRequest(request: JSON2VideoRequest): ValidationResult {
  // Runtime schema validation
  // Detailed error messages
  // API compliance checking
}
```

## Workflow Types

### createMovie
- **Purpose**: Complex video creation with custom scenes
- **UI Features**: Scene builder, element collections, transitions
- **API Mapping**: Full JSON2Video feature set

### mergeVideoAudio  
- **Purpose**: Simple video + audio overlay
- **UI Features**: Single video input, single audio input, basic text overlays
- **API Mapping**: Single scene with video and audio elements

### mergeVideos
- **Purpose**: Video sequence/concatenation
- **UI Features**: Multiple video inputs, transition controls, global elements
- **API Mapping**: Multiple scenes with transition effects

## Advanced Mode

All workflows include an advanced mode option:
- Single JSON textarea with syntax highlighting
- Real-time schema validation as user types
- Full JSON2Video API access
- Same validation pipeline as basic mode
- No separate code paths - unified processing

## Error Handling Strategy

**UI Level**: Parameter validation prevents basic input errors
**Collection Level**: Fail explicitly if required parameters missing
**Processing Level**: Fail if API rules are violated (e.g., subtitles in scenes)
**Schema Level**: Fail if final JSON doesn't match API schema
**API Level**: Only receive validated, compliant requests

## Testing Strategy

**Unit Tests**: Each core function with explicit inputs/outputs
**Integration Tests**: Complete workflow processing end-to-end
**Schema Tests**: Validate against real JSON2Video API examples
**Error Tests**: Every failure path explicitly tested
**UI Tests**: Parameter definition validation and display logic

**Test Structure**: Mirror source structure exactly
- Every source file has corresponding `.test.ts` file
- Fixtures provide reusable test data
- Mock functions for n8n execution context
- 100% code coverage target

## Extension Guidelines

### Adding New Workflows
1. Create new parameter file in `presentation/`
2. Add workflow type to `parameterCollector.ts`
3. Update main node file routing
4. Add comprehensive tests

### Adding New Element Types
1. Update schema definitions in `schema/json2videoSchema.ts`
2. Add processing logic in `core/elementProcessor.ts`
3. Update validators in `schema/validators.ts`
4. Add to relevant presentation parameter files

### API Updates
1. Update schema definitions first
2. Update validators for new rules
3. Update element processor logic
4. Update presentation parameters as needed
5. All changes flow from schema outward

## Performance Considerations

- **Parameter Collection**: O(1) lookup for workflow types
- **Element Processing**: Linear with number of elements
- **Schema Validation**: Optimized for early failure
- **Memory Usage**: Process elements in streams for large requests
- **API Rate Limits**: Handle via n8n's built-in retry mechanisms

## Security Considerations

- **Input Validation**: All user inputs validated against strict schemas
- **API Keys**: Managed through n8n's credential system
- **Output Sanitization**: No user data echoed in error messages
- **Request Size Limits**: Validated before API transmission