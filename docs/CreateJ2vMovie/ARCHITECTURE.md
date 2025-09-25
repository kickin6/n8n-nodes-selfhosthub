# CreateJ2vMovie Node Architecture

The CreateJ2vMovie node transforms user input into JSON2Video API requests through a clean three-layer architecture. The implementation supports both form-based (Basic Mode) and JSON template (Advanced Mode) workflows with comprehensive validation and testing.

The architecture follows clean design principles with a template-driven approach for advanced users and an intuitive form-based interface for standard workflows.

## Architecture Principles

### Core Design Decisions

**Single Source of Truth**: JSON2Video API schema defines all rules and validation  
**Template-Driven Advanced Mode**: Pre-built templates accelerate complex video creation  
**Fail Fast**: Invalid data is caught early and never reaches the API  
**UI Responsibility**: Required fields are enforced through parameter definitions  
**Schema-First**: All validation references the official JSON2Video API schema  
**100% Test Coverage**: Every code path is explicitly tested with comprehensive coverage  
**Streamlined Parameters**: Toggle-based parameter groups for enhanced usability

### Quality Metrics

The implementation achieves:
- **100% line coverage** across all source files
- **100% branch coverage** ensuring all code paths are tested  
- **100% function coverage** with explicit testing of every function
- **900+ passing tests** with comprehensive integration and unit test suites
- **Zero compilation errors** with full TypeScript compliance
- **Zero linting errors** maintaining code quality standards

## File Structure

```
nodes/CreateJ2vMovie/
├── core/                           # Business logic layer
│   ├── buildRequest.ts             # Assemble final JSON structure
│   ├── collector.ts                # Extract node parameters from n8n
│   └── validator.ts                # Validate against API schema
├── presentation/                   # UI/Parameter layer
│   ├── fields.ts                   # Element field definitions
│   ├── parameters.ts               # Parameter collection groups
│   ├── properties.ts               # Node property orchestration
│   └── templates.ts                # JSON template library
├── schema/                         # Data model layer
│   ├── rules.ts                    # Validation rules and constants
│   └── schema.ts                   # TypeScript interfaces matching API
└── CreateJ2vMovie.node.ts         # Main node implementation
```

## Layer Responsibilities

### Presentation Layer (`presentation/`)
**Purpose**: Define n8n UI parameters and templates

**Responsibilities**:
- Organize parameters into logical toggle-based groups
- Provide JSON templates for advanced users
- Define field visibility and dependencies
- Present user-friendly descriptions

**Key Features**:
- Toggle-based parameter organization (output, movie, export settings)
- Comprehensive element field definitions
- Template selector with category-specific templates
- Dynamic visibility rules based on mode selection

### Business Logic Layer (`core/`)
**Purpose**: Transform n8n parameters into valid API requests

**Responsibilities**:
- Extract parameters from n8n execution context
- Build JSON2Video API requests (Basic or Advanced Mode)
- Validate request structure and content
- Provide detailed error reporting

**Key Functions**:
- `collectParameters()`: Extract all parameters from n8n
- `buildRequest()`: Assemble API request from parameters
- `validateRequest()`: Ensure API compliance
- `processElement()`: Transform element parameters to API format

### Data Model Layer (`schema/`)
**Purpose**: Define API structure and validation rules

**Responsibilities**:
- TypeScript interfaces matching JSON2Video API
- Validation constants and rules
- API compliance enforcement
- Type safety throughout the codebase

**Key Components**:
- Complete API type definitions
- Validation ranges and constraints  
- Element type restrictions
- Export configuration schemas

## Execution Flow

### Basic Mode (Form-Based)
```
User Input (Forms)
    ↓
collectParameters()
    ↓
buildBasicModeRequest()
    ↓
buildSingleScene()  [Creates one scene with all elements]
    ↓
validateRequest()
    ↓
API Call
```

### Advanced Mode (Template)
```
User Input (JSON Template)
    ↓
collectParameters()
    ↓
buildAdvancedModeRequest()
    ↓
Parse JSON Template
    ↓
validateRequest()
    ↓
API Call
```

## Key Design Patterns

### Toggle-Based Configuration
Groups related parameters behind toggles to reduce complexity:
- **Output Settings**: Video dimensions and quality
- **Movie Settings**: Global elements (subtitles, audio)
- **Export Settings**: Delivery methods (webhook, FTP, email)

### Element Type Routing
Dynamic field display based on element type selection:
- Video → Video-specific fields (trim, effects)
- Image → Image fields (AI prompt, positioning)
- Text → Text styling fields
- Audio → Audio controls (volume, fade)

### Validation Hierarchy
Three levels of validation:
1. **UI Level**: Required fields, type checking
2. **Business Level**: Cross-field validation, dependencies
3. **Schema Level**: API compliance, value ranges

## Request Building

### Basic Mode Characteristics
- Creates a single scene containing all elements
- Simplified parameter structure
- Toggle-based configuration
- Form field validation

### Advanced Mode Characteristics
- Full JSON template control
- Multiple scenes with transitions
- Variable substitution
- Conditional rendering
- Direct API schema mapping

### Common Processing
Both modes share:
- Export configuration handling
- Output settings application
- Record ID tracking
- Error collection and reporting

## Validation Strategy

### Multi-Level Validation
1. **Parameter Collection**: Type checking, required fields
2. **Request Building**: Structure validation, dependencies
3. **API Compliance**: Schema validation, business rules

### Error Categories
- **Structural Errors**: Invalid JSON, missing required objects
- **Validation Errors**: Value out of range, invalid format
- **Business Rule Errors**: Subtitles in scenes, invalid combinations
- **Warning Messages**: Non-critical issues, recommendations

## Testing Architecture

### Coverage Goals
- **100% line coverage** - Every line executed
- **100% branch coverage** - All conditionals tested
- **100% function coverage** - Every function called in tests

### Test Structure
```
tests/nodes/CreateJ2vMovie/
├── core/
│   ├── buildRequest.test.ts        # Request building logic
│   ├── collector.test.ts           # Parameter collection
│   └── validator.test.ts           # Validation rules
├── presentation/
│   ├── fields.test.ts              # Element field definitions
│   ├── parameters.test.ts          # Parameter collections
│   ├── properties.test.ts          # Property orchestration
│   └── templates.test.ts           # Template system
├── schema/
│   ├── rules.test.ts               # Validation rule testing
│   └── schema.test.ts              # Schema definition testing
└── CreateJ2vMovie.test.ts          # Main node integration tests
```

### Integration Testing
- Full end-to-end parameter collection and processing
- Template validation and transformation
- Export configuration validation
- Error handling for all scenarios

## Performance Considerations

### Optimization Strategies
- **Minimal API Calls**: Single request with complete configuration
- **Efficient Validation**: Early validation prevents unnecessary processing
- **Smart Defaults**: API defaults reduce request payload size
- **Template Caching**: Pre-built templates reduce JSON parsing overhead

### Request Optimization
The node automatically:
- Omits default values from requests
- Validates before API submission
- Provides detailed error messages
- Supports batch processing through n8n's item system

## Future Considerations

### Potential Enhancements
- **Multi-Scene Basic Mode**: Enable multiple scenes in form-based mode
- **Visual Timeline Editor**: Drag-and-drop timeline for element timing
- **Template Builder**: UI for creating custom templates
- **Preview System**: Video preview before API submission

### Architectural Flexibility
The clean separation of concerns enables:
- Easy addition of new element types
- New export delivery methods
- Enhanced validation rules
- API version upgrades

The architecture maintains clean separation of concerns while providing comprehensive video creation functionality with robust validation and flexible delivery options at every layer.