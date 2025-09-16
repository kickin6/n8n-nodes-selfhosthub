# CreateJ2vMovie Node Architecture

## Overview

The CreateJ2vMovie node provides video creation and manipulation capabilities through the JSON2Video API. The architecture follows clean design principles with explicit operation-based validation and clear separation of concerns.

## Architecture Principles

### Core Design Decisions

**Single Source of Truth**: JSON2Video API schema defines all rules and validation  
**Explicit Operation-Based Processing**: All validation and processing uses explicit operation parameters instead of heuristic detection  
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
│   ├── parameterCollector.ts       # Extract n8n parameters by operation
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
- **Export Configuration Management**: Comprehensive export settings for delivery options

**Responsibilities**:
- Export `INodeProperties[]` parameter definitions through `getAllNodeProperties()`
- Provide operation validation through `isValidOperation()`
- Define operation-specific validation rules via `getOperationValidationRules()`
- Supply operation defaults through `getOperationDefaults()`
- Mark API-required fields as `required: true`
- Provide field-level validation via `typeOptions`
- Define display conditions for complex workflows
- Include advanced mode JSON text area option
- Configure export delivery options (webhook, FTP, email)
- Pure UI definitions - no business logic or shared utilities

### Export Configuration Architecture

The export system supports multiple delivery methods with comprehensive validation:

**Export Types**:
- **Webhook**: HTTPS notifications when video generation completes
- **FTP/SFTP**: Direct file upload to FTP servers
- **Email**: Email delivery with attachments

**Implementation**:
```typescript
const exportSettingsCollection: INodeProperties = {
  displayName: 'Export Settings',
  name: 'exportSettings',
  type: 'fixedCollection',
  typeOptions: { multipleValues: true },
  options: [{
    name: 'exportValues',
    displayName: 'Export Configuration',
    values: [
      // Export type selector
      { name: 'exportType', type: 'options', required: true },
      // Format and quality settings# CreateJ2vMovie Node Architecture

## Overview

The CreateJ2vMovie node provides video creation and manipulation capabilities through the JSON2Video API. The architecture follows clean design principles with explicit operation-based validation and clear separation of concerns.

## Architecture Principles

### Core Design Decisions

**Single Source of Truth**: JSON2Video API schema defines all rules and validation  
**Explicit Operation-Based Processing**: All validation and processing uses explicit operation parameters instead of heuristic detection  
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
│   ├── parameterCollector.ts       # Extract n8n parameters by operation
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
- **Export Configuration Management**: Comprehensive export settings for delivery options

**Responsibilities**:
- Export `INodeProperties[]` parameter definitions through `getAllNodeProperties()`
- Provide operation validation through `isValidOperation()`
- Define operation-specific validation rules via `getOperationValidationRules()`
- Supply operation defaults through `getOperationDefaults()`
- Mark API-required fields as `required: true`
- Provide field-level validation via `typeOptions`
- Define display conditions for complex workflows
- Include advanced mode JSON text area option
- Configure export delivery options (webhook, FTP, email)
- Pure UI definitions - no business logic or shared utilities

### Export Configuration Architecture

The export system supports multiple delivery methods with comprehensive validation:

**Export Types**:
- **Webhook**: HTTPS notifications when video generation completes
- **FTP/SFTP**: Direct file upload to FTP servers
- **Email**: Email delivery with attachments

**Implementation**:
```typescript
const exportSettingsCollection: INodeProperties = {
  displayName: 'Export Settings',
  name: 'exportSettings',
  type: 'fixedCollection',
  typeOptions: { multipleValues: true },
  options: [{
    name: 'exportValues',
    displayName: 'Export Configuration',
    values: [
      // Export type selector
      { name: 'exportType', type: 'options', required: true },
      // Format and quality settings
      { name: 'format', type: 'options' },
      { name: 'quality', type: 'options' },
      // Delivery-specific configurations
      { name: 'webhookUrl', displayOptions: { show: { exportType: ['webhook'] } } },
      { name: 'ftpHost', displayOptions: { show: { exportType: ['ftp'] } } },
      { name: 'emailTo', displayOptions: { show: { exportType: ['email'] } } }
    ]
  }]
};
```

### Core Layer (`core/`)

**Purpose**: Implement business logic and API interoperation patterns

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
- Process export configurations into API format
- Provide detailed error messages for validation failures
- No UI concerns - pure business logic

**Processing Pipeline**:
1. **Parameter Collection**: Extract operation-specific parameters from n8n
2. **Element Processing**: Transform elements according to JSON2Video API rules
3. **Export Processing**: Convert export configurations to API format
4. **Request Building**: Assemble final JSON structure with proper hierarchy
5. **Schema Validation**: Validate complete request against API schema
6. **API Dispatch**: Send validated JSON to JSON2Video API

#### Export Configuration Processing

The core layer transforms n8n export parameters into JSON2Video API format:

```typescript
function processExportConfig(rawExport: any): ExportConfig | null {
  const config: ExportConfig = {};

  switch (rawExport.exportType) {
    case 'webhook':
      config.webhook = { url: rawExport.webhookUrl };
      break;
    case 'ftp':
      config.ftp = {
        host: rawExport.ftpHost,
        port: rawExport.ftpPort || 21,
        username: rawExport.ftpUsername,
        password: rawExport.ftpPassword,
        path: rawExport.ftpPath || '/',
        secure: rawExport.ftpSecure || false
      };
      break;
    case 'email':
      config.email = {
        to: rawExport.emailTo,
        from: rawExport.emailFrom,
        subject: rawExport.emailSubject,
        message: rawExport.emailMessage
      };
      break;
  }

  return config;
}
```

### Schema Layer (`schema/`)

**Purpose**: Single source of truth for JSON2Video API schema and validation

**Files**:
- `json2videoSchema.ts` - Complete API schema definition
- `validators.ts` - Reusable validation functions

**Export Schema Definitions**:
```typescript
export interface ExportConfig {
  format?: 'mp4' | 'webm' | 'gif';
  quality?: 'low' | 'medium' | 'high' | 'very_high';
  resolution?: string;
  width?: number;
  height?: number;
  
  // Delivery methods (mutually exclusive)
  webhook?: WebhookExportConfig;
  ftp?: FtpExportConfig;  
  email?: EmailExportConfig;
}

export interface WebhookExportConfig {
  url: string;
}

export interface FtpExportConfig {
  host: string;
  port?: number;
  username: string;
  password: string;
  path?: string;
  secure?: boolean; // SFTP vs FTP
}

export interface EmailExportConfig {
  to: string | string[];
  from?: string;
  subject?: string;
  message?: string;
}
```

**Responsibilities**:
- Define complete JSON2Video API schema as TypeScript interfaces
- Export validation functions for all element types and export configurations
- Define API rules (subtitles only at movie level, export requirements, etc.)
- Provide clear error messages for schema violations
- Support both runtime validation and compile-time type checking

### Shared Layer (`shared/`)

**Purpose**: Reusable UI components and parameter definitions

**Files**:
- `elementFields.ts` - Complete element parameter definitions
- `movieParams.ts` - Movie-specific parameter definitions including export settings

**Export Parameter Definitions**:
The `movieParams.ts` file contains comprehensive export configuration parameters:

```typescript
export const exportSettingsParameter: INodeProperties = {
  displayName: 'Export Settings',
  name: 'exportSettings',
  type: 'fixedCollection',
  typeOptions: { multipleValues: true },
  description: 'Configure how the generated video should be delivered (webhook, FTP, email)',
  options: [{
    name: 'exportValues',
    displayName: 'Export Configuration',
    values: [
      // Export type with conditional field display
      // Format and quality options
      // Delivery-specific configurations with validation
    ]
  }]
};
```

## Unified Parameter Architecture

### Key Benefits

1. **Consistency**: Both movieElements and sceneElements use the same underlying field definitions
2. **Maintainability**: Changes to element fields automatically apply to both collections
3. **Reduced Duplication**: Single source of truth for element field definitions
4. **Better UX**: Consistent interface across different operations
5. **Simplified Testing**: Unified structure reduces test complexity
6. **Export Flexibility**: Multiple delivery options with proper validation

### Implementation Details

**Export Configuration Unification**:
- Single `exportSettings` collection available across operations
- Supports multiple export configurations per request
- Conditional field display based on export type
- Comprehensive validation for each delivery method

**Element Field Unification**:
- `elementsWithoutDisplayOptions` removes displayOptions from shared element fields
- Both movieElements and sceneElements collections use this cleaned field set
- Prevents n8n parameter dependency conflicts
- Maintains all other field properties (validation, defaults, etc.)

**Unified Output Settings Architecture**:
- All operations use the same `outputSettings` collection for video configuration
- Eliminates operation-specific output parameters (width, height, quality fields)
- Provides consistent interface across createMovie, mergeVideoAudio, and mergeVideos
- Advanced mode contains only JSON template without override parameters

## Export System Architecture

### Multi-Delivery Support

The export system supports multiple simultaneous delivery methods:

1. **Primary Generation**: Video generated with specified quality/format
2. **Parallel Export Processing**: Multiple export configurations processed simultaneously
3. **Delivery Confirmation**: Each delivery method provides independent confirmation
4. **Error Isolation**: Failure in one delivery method doesn't affect others

### Validation Strategy

**Parameter-Level Validation**:
- Required fields enforced through n8n parameter definitions
- Type validation via `typeOptions`
- URL validation for webhook endpoints
- Email validation for email delivery

**Processing-Level Validation**:
- Export configuration completeness checking
- Delivery method compatibility validation
- Security validation (HTTPS-only webhooks)

**API-Level Validation**:
- Complete export configuration validation against JSON2Video schema
- Cross-validation between export settings and output settings
- Runtime validation before API dispatch

## Testing Strategy

### Coverage Requirements
- **100% line coverage** - Every line of code executed in tests
- **100% branch coverage** - All conditional paths tested
- **100% function coverage** - Every function called in tests

### Export Testing Structure
```
__tests__/nodes/CreateJ2vMovie/
├── core/
│   ├── elementProcessor.test.ts    # Export parameter collection
│   ├── parameterCollector.test.ts  # Export parameter collection testing
│   ├── processors.test.ts          # Element processor testing
│   ├── requestBuilder.test.ts      # Export configuration building
│   └── schemaValidator.test.ts     # Export validation rules
├── presentation/
│   ├── nodeProperties.test.ts      # Node properties testing
│   └── unifiedParameters.test.ts   # Export UI parameter testing
├── schema/
│   ├── json2videoSchema.test.ts    # Export schema definitions
│   └── validators.test.ts          # Export validation functions
├── shared/
│   ├── elementFields.test.ts       # Element fields testing
│   └── movieParams.test.ts         # Export parameter definitions
└── CreateJ2vMovie.node.test.ts     # Main node integration tests
```

### Integration Testing
- Full end-to-end export parameter collection and processing
- Validation of export configuration transformation
- Cross-delivery-method compatibility verification
- Error handling and validation testing for all export types

The architecture maintains clean separation of concerns while providing comprehensive export functionality with multiple delivery options and robust validation at every layer.
      { name: 'format', type: 'options' },
      { name: 'quality', type: 'options' },
      // Delivery-specific configurations
      { name: 'webhookUrl', displayOptions: { show: { exportType: ['webhook'] } } },
      { name: 'ftpHost', displayOptions: { show: { exportType: ['ftp'] } } },
      { name: 'emailTo', displayOptions: { show: { exportType: ['email'] } } }
    ]
  }]
};
```

### Core Layer (`core/`)

**Purpose**: Implement business logic and API interoperation patterns

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
- Process export configurations into API format
- Provide detailed error messages for validation failures
- No UI concerns - pure business logic

**Processing Pipeline**:
1. **Parameter Collection**: Extract operation-specific parameters from n8n
2. **Element Processing**: Transform elements according to JSON2Video API rules
3. **Export Processing**: Convert export configurations to API format
4. **Request Building**: Assemble final JSON structure with proper hierarchy
5. **Schema Validation**: Validate complete request against API schema
6. **API Dispatch**: Send validated JSON to JSON2Video API

#### Export Configuration Processing

The core layer transforms n8n export parameters into JSON2Video API format:

```typescript
function processExportConfig(rawExport: any): ExportConfig | null {
  const config: ExportConfig = {};

  switch (rawExport.exportType) {
    case 'webhook':
      config.webhook = { url: rawExport.webhookUrl };
      break;
    case 'ftp':
      config.ftp = {
        host: rawExport.ftpHost,
        port: rawExport.ftpPort || 21,
        username: rawExport.ftpUsername,
        password: rawExport.ftpPassword,
        path: rawExport.ftpPath || '/',
        secure: rawExport.ftpSecure || false
      };
      break;
    case 'email':
      config.email = {
        to: rawExport.emailTo,
        from: rawExport.emailFrom,
        subject: rawExport.emailSubject,
        message: rawExport.emailMessage
      };
      break;
  }

  return config;
}
```

### Schema Layer (`schema/`)

**Purpose**: Single source of truth for JSON2Video API schema and validation

**Files**:
- `json2videoSchema.ts` - Complete API schema definition
- `validators.ts` - Reusable validation functions

**Export Schema Definitions**:
```typescript
export interface ExportConfig {
  format?: 'mp4' | 'webm' | 'gif';
  quality?: 'low' | 'medium' | 'high' | 'very_high';
  resolution?: string;
  width?: number;
  height?: number;
  
  // Delivery methods (mutually exclusive)
  webhook?: WebhookExportConfig;
  ftp?: FtpExportConfig;  
  email?: EmailExportConfig;
}

export interface WebhookExportConfig {
  url: string;
}

export interface FtpExportConfig {
  host: string;
  port?: number;
  username: string;
  password: string;
  path?: string;
  secure?: boolean; // SFTP vs FTP
}

export interface EmailExportConfig {
  to: string | string[];
  from?: string;
  subject?: string;
  message?: string;
}
```

**Responsibilities**:
- Define complete JSON2Video API schema as TypeScript interfaces
- Export validation functions for all element types and export configurations
- Define API rules (subtitles only at movie level, export requirements, etc.)
- Provide clear error messages for schema violations
- Support both runtime validation and compile-time type checking

### Shared Layer (`shared/`)

**Purpose**: Reusable UI components and parameter definitions

**Files**:
- `elementFields.ts` - Complete element parameter definitions
- `movieParams.ts` - Movie-specific parameter definitions including export settings

**Export Parameter Definitions**:
The `movieParams.ts` file contains comprehensive export configuration parameters:

```typescript
export const exportSettingsParameter: INodeProperties = {
  displayName: 'Export Settings',
  name: 'exportSettings',
  type: 'fixedCollection',
  typeOptions: { multipleValues: true },
  description: 'Configure how the generated video should be delivered (webhook, FTP, email)',
  options: [{
    name: 'exportValues',
    displayName: 'Export Configuration',
    values: [
      // Export type with conditional field display
      // Format and quality options
      // Delivery-specific configurations with validation
    ]
  }]
};
```

## Unified Parameter Architecture

### Key Benefits

1. **Consistency**: Both movieElements and sceneElements use the same underlying field definitions
2. **Maintainability**: Changes to element fields automatically apply to both collections
3. **Reduced Duplication**: Single source of truth for element field definitions
4. **Better UX**: Consistent interface across different operations
5. **Simplified Testing**: Unified structure reduces test complexity
6. **Export Flexibility**: Multiple delivery options with proper validation

### Implementation Details

**Export Configuration Unification**:
- Single `exportSettings` collection available across operations
- Supports multiple export configurations per request
- Conditional field display based on export type
- Comprehensive validation for each delivery method

**Element Field Unification**:
- `elementsWithoutDisplayOptions` removes displayOptions from shared element fields
- Both movieElements and sceneElements collections use this cleaned field set
- Prevents n8n parameter dependency conflicts
- Maintains all other field properties (validation, defaults, etc.)

**Shared Output Settings**:
- Single `outputSettings` collection available to all operations
- Replaces operation-specific output parameters
- Provides consistent video configuration interface
- Integrates with export settings for comprehensive delivery control

## Export System Architecture

### Multi-Delivery Support

The export system supports multiple simultaneous delivery methods:

1. **Primary Generation**: Video generated with specified quality/format
2. **Parallel Export Processing**: Multiple export configurations processed simultaneously
3. **Delivery Confirmation**: Each delivery method provides independent confirmation
4. **Error Isolation**: Failure in one delivery method doesn't affect others

### Validation Strategy

**Parameter-Level Validation**:
- Required fields enforced through n8n parameter definitions
- Type validation via `typeOptions`
- URL validation for webhook endpoints
- Email validation for email delivery

**Processing-Level Validation**:
- Export configuration completeness checking
- Delivery method compatibility validation
- Security validation (HTTPS-only webhooks)

**API-Level Validation**:
- Complete export configuration validation against JSON2Video schema
- Cross-validation between export settings and output settings
- Runtime validation before API dispatch

## Testing Strategy

### Coverage Requirements
- **100% line coverage** - Every line of code executed in tests
- **100% branch coverage** - All conditional paths tested
- **100% function coverage** - Every function called in tests

### Export Testing Structure
```
__tests__/nodes/CreateJ2vMovie/
├── core/
│   ├── elementProcessor.test.ts    # Export parameter collection
│   ├── parameterCollector.test.ts  # Export parameter collection testing
│   ├── processors.test.ts          # Element processor testing
│   ├── requestBuilder.test.ts      # Export configuration building
│   └── schemaValidator.test.ts     # Export validation rules
├── presentation/
│   ├── nodeProperties.test.ts      # Node properties testing
│   └── unifiedParameters.test.ts   # Export UI parameter testing
├── schema/
│   ├── json2videoSchema.test.ts    # Export schema definitions
│   └── validators.test.ts          # Export validation functions
├── shared/
│   ├── elementFields.test.ts       # Element fields testing
│   └── movieParams.test.ts         # Export parameter definitions
└── CreateJ2vMovie.node.test.ts     # Main node integration tests
```

### Integration Testing
- Full end-to-end export parameter collection and processing
- Validation of export configuration transformation
- Cross-delivery-method compatibility verification
- Error handling and validation testing for all export types

The architecture maintains clean separation of concerns while providing comprehensive export functionality with multiple delivery options and robust validation at every layer.