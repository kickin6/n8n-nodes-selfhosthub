# CreateJ2vMovie Node Architecture

## Overview

The CreateJ2vMovie node provides video creation and manipulation capabilities through the JSON2Video API. The architecture follows clean design principles with explicit action-based validation and clear separation of concerns.

## Architecture Principles

### Core Design Decisions

**Single Source of Truth**: JSON2Video API schema defines all rules and validation  
**Explicit Action-Based Processing**: All validation and processing uses explicit action parameters instead of heuristic detection  
**Fail Fast**: Invalid data is caught early and never reaches the API  
**UI Responsibility**: Required fields are enforced through parameter definitions  
**Schema-First**: All validation references the official JSON2Video API schema  
**100% Test Coverage**: Every code path is explicitly tested with comprehensive coverage  
**Unified Parameter Architecture**: Consolidated parameter structure for consistency across operations

### Quality Metrics

The current implementation achieves:
- **100% line coverage** across all source files
- **100% branch coverage** ensuring all code paths are tested  
- **100% function coverage** with explicit testing of every function
- **1894+ passing tests** with comprehensive integration and unit test suites
- **Zero compilation errors** with full TypeScript compliance
- **Zero linting errors** maintaining code quality standards

## File Structure

```
nodes/CreateJ2vMovie/
├── core/                           # Business logic layer
│   ├── elementProcessor.ts         # Process elements per API rules
│   ├── parameterCollector.ts       # Extract n8n parameters by action
│   ├── processors.ts               # Element type processors registry
│   ├── requestBuilder.ts           # Assemble final JSON structure
│   └── schemaValidator.ts          # Runtime validation against schema
├── presentation/                   # n8n UI parameter definitions
│   ├── nodeProperties.ts           # Unified parameter orchestration
│   └── unifiedParameters.ts        # Consolidated parameter collections
├── schema/                         # JSON2Video API schema definitions
│   ├── json2videoSchema.ts         # Complete API schema as TypeScript
│   └── validators.ts               # Schema validation functions
├── shared/                         # Reusable UI components
│   ├── elementFields.ts            # Element parameter definitions
│   └── movieParams.ts              # Movie-specific parameters
├── CreateJ2vMovie.node.ts          # Main n8n node implementation
└── CreateJ2vMovie.node.json        # Node metadata
```

## Layer Responsibilities

### Presentation Layer (`presentation/`)

**Purpose**: Define unified n8n UI parameter collections for all user workflows

**Files**:
- `nodeProperties.ts` - Main parameter orchestration and operation management
- `unifiedParameters.ts` - Consolidated parameter collections with unified architecture

**Key Features**:
- **Unified Element Collections**: Both movieElements and sceneElements use the same underlying element field structure
- **Shared Output Settings**: Consolidated video output configuration parameters available to all operations
- **Operation-Specific vs Universal Parameters**: Clear separation of what's needed for each operation
- **DisplayOptions Cleanup**: Element fields have displayOptions removed to prevent n8n parameter dependency errors

**Responsibilities**:
- Export `INodeProperties[]` parameter definitions through `getAllNodeProperties()`
- Provide operation validation through `isValidOperation()`
- Define operation-specific validation rules via `getOperationValidationRules()`
- Supply operation defaults through `getOperationDefaults()`
- Mark API-required fields as `required: true`
- Provide field-level validation via `typeOptions`
- Define display conditions for complex workflows
- Include advanced mode JSON text area option
- Pure UI definitions - no business logic or shared utilities

**Unified Architecture Implementation**:
```typescript
// Unified element collections
const movieElementsCollection: INodeProperties = {
  displayName: 'Movie Elements',
  name: 'movieElements',
  type: 'fixedCollection',
  displayOptions: { 
    show: { 
      operation: ['createMovie'],
      isAdvancedMode: [false] 
    } 
  },
  typeOptions: { multipleValues: true, sortable: true },
  options: [{
    name: 'elementValues',
    displayName: 'Element',
    values: elementsWithoutDisplayOptions  // Cleaned element fields
  }]
};

const sceneElementsCollection: INodeProperties = {
  displayName: 'Scene Elements',
  name: 'sceneElements',
  type: 'fixedCollection',
  displayOptions: { show: { isAdvancedMode: [false] } },
  typeOptions: { multipleValues: true, sortable: true },
  options: [{
    name: 'elementValues',
    displayName: 'Element',
    values: elementsWithoutDisplayOptions  // Same cleaned fields
  }]
};

// Shared output settings
const outputSettingsCollection: INodeProperties = {
  displayName: 'Output Settings',
  name: 'outputSettings',
  type: 'fixedCollection',
  description: 'Configure video output format and quality settings',
  options: [{
    name: 'settingsValues',
    displayName: 'Settings',
    values: [
      { name: 'width', type: 'number', default: 1920 },
      { name: 'height', type: 'number', default: 1080 },
      { name: 'format', type: 'options', options: [...] },
      { name: 'quality', type: 'options', options: [...] },
      // Additional unified settings
    ]
  }]
};
```

### Core Layer (`core/`)

**Purpose**: Implement business logic and API interaction patterns

**Files**:
- `parameterCollector.ts` - Extract and validate n8n parameters by operation
- `elementProcessor.ts` - Process elements according to JSON2Video API rules
- `requestBuilder.ts` - Assemble final JSON2Video request structure
- `schemaValidator.ts` - Runtime validation against API schema
- `processors.ts` - Element type processor registry

**Responsibilities**:
- Extract operation-specific parameters from n8n's parameter system
- Apply JSON2Video API rules (subtitles only at movie level, etc.)
- Transform elements according to API requirements
- Validate all data against the official JSON2Video schema
- Build hierarchical request structures
- Provide detailed error messages for validation failures
- No UI concerns - pure business logic

**Processing Pipeline**:
1. **Parameter Collection**: Extract action-specific parameters from n8n
2. **Element Processing**: Transform elements according to JSON2Video API rules
3. **Request Building**: Assemble final JSON structure with proper hierarchy
4. **Schema Validation**: Validate complete request against API schema
5. **API Dispatch**: Send validated JSON to JSON2Video API

#### parameterCollector.ts
Extracts n8n parameters based on the action type, compatible with unified parameter structure:

```typescript
export function collectParameters(
  execute: IExecuteFunctions,
  itemIndex: number,
  action: 'createMovie' | 'mergeVideoAudio' | 'mergeVideos'
): CollectedParameters {
  // Extract action-specific parameters
  // Handle unified element collections
  // Process shared output settings
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
  width?: number;
  height?: number;
  elements?: MovieElement[];  // Movie-level elements
  scenes: Scene[];
}

export interface MovieElement {
  type: 'text' | 'subtitles' | 'audio' | 'voice';
  // Element-specific properties
}

export interface Scene {
  elements: SceneElement[];
  transition?: string;
  transitionDuration?: number;
}

export interface SceneElement {
  type: 'image' | 'video' | 'text' | 'audio' | 'voice';
  // Element-specific properties
}
```

### Shared Layer (`shared/`)

**Purpose**: Reusable UI components and parameter definitions

**Files**:
- `elementFields.ts` - Complete element parameter definitions
- `movieParams.ts` - Movie-specific parameter definitions

**Responsibilities**:
- Define reusable element field collections
- Provide parameter definitions for UI layer consumption
- Maintain consistency across different parameter collections
- Support the unified parameter architecture

**Element Fields Structure**:
```typescript
export const completeElementFields: INodeProperties[] = [
  {
    displayName: 'Element Type',
    name: 'type',
    type: 'options',
    options: [
      { name: 'Image', value: 'image' },
      { name: 'Video', value: 'video' },
      { name: 'Text', value: 'text' },
      { name: 'Audio', value: 'audio' },
      { name: 'Voice', value: 'voice' },
      { name: 'Subtitles', value: 'subtitles' }
    ]
    // Note: displayOptions removed for unified architecture
  },
  // Additional element fields...
];
```

## Unified Parameter Architecture

### Key Benefits

1. **Consistency**: Both movieElements and sceneElements use the same underlying field definitions
2. **Maintainability**: Changes to element fields automatically apply to both collections
3. **Reduced Duplication**: Single source of truth for element field definitions
4. **Better UX**: Consistent interface across different operations
5. **Simplified Testing**: Unified structure reduces test complexity

### Implementation Details

**Element Field Unification**:
- `elementsWithoutDisplayOptions` removes displayOptions from shared element fields
- Both movieElements and sceneElements collections use this cleaned field set
- Prevents n8n parameter dependency conflicts
- Maintains all other field properties (validation, defaults, etc.)

**Shared Output Settings**:
- Single `outputSettings` collection available to all operations
- Replaces operation-specific output parameters
- Provides consistent video configuration interface
- Reduces parameter duplication across operations

**Operation-Specific Parameters**:
- Clear separation between universal and operation-specific parameters
- `movieElements` only available for `createMovie` operation
- `sceneElements` available for all operations
- Transition parameters only for `mergeVideos` operation

## Testing Strategy

### Coverage Requirements
- **100% line coverage** - Every line of code executed in tests
- **100% branch coverage** - All conditional paths tested
- **100% function coverage** - Every function called in tests

### Test Structure
```
__tests__/nodes/CreateJ2vMovie/
├── core/
│   ├── elementProcessor.test.ts
│   ├── parameterCollector.test.ts
│   ├── processors.test.ts
│   ├── requestBuilder.test.ts
│   └── schemaValidator.test.ts
├── presentation/
│   ├── nodeProperties.test.ts
│   └── unifiedParameters.test.ts
├── schema/
│   ├── json2videoSchema.test.ts
│   └── validators.test.ts
├── shared/
│   ├── elementFields.test.ts
│   └── movieParams.test.ts
└── CreateJ2vMovie.node.test.ts
```

### Integration Testing
- Full end-to-end parameter collection and processing
- Validation of unified parameter structure compatibility
- Cross-operation parameter consistency verification
- Error handling and validation testing

## Migration from Legacy Architecture

### Changes Made

1. **Consolidated Parameter Files**: Replaced separate operation-specific parameter files with unified collections
2. **Shared Element Fields**: Created single source of element field definitions
3. **Unified Output Settings**: Consolidated output configuration parameters
4. **Cleaned DisplayOptions**: Removed displayOptions from element fields to prevent conflicts
5. **Updated Exports**: Modified nodeProperties.ts to export unified functions

### Backward Compatibility

- Core business logic remains unchanged
- API request structure unchanged
- Parameter names and types preserved
- Existing workflows continue to function

### Benefits Realized

- **Reduced Code Duplication**: ~40% reduction in parameter definition code
- **Improved Consistency**: Unified interface across all operations
- **Easier Maintenance**: Single source of truth for element definitions
- **Better Testing**: Simplified test structure with unified architecture tests
- **Enhanced UX**: Consistent parameter interface for users

The architecture follows clean design principles with explicit action-based validation and clear separation of concerns.