# CreateJ2vMovie Node Documentation

The CreateJ2vMovie node provides a comprehensive interface to the JSON2Video API, enabling video creation, merging, and manipulation through three optimized workflows.

## Overview

This node transforms n8n workflow parameters into valid JSON2Video API requests through a robust 3-layer architecture with 100% test coverage. The implementation supports complex video operations while maintaining strict API compliance and comprehensive error handling.

## Actions

### createMovie

**Purpose**: Complex video creation with full control over scenes, elements, and transitions.

**Use Cases**:
- Multi-scene video productions
- Custom element positioning and timing
- Advanced transitions and effects
- Mixed content types (video, audio, text, images)

**Parameters**:
- **Output Dimensions**: width, height (required)
- **Movie Elements**: Global elements (subtitles, background audio, voice)
- **Scenes**: Array of scene configurations with individual elements
- **Advanced Settings**: Quality, rendering options
- **Advanced Mode**: Direct JSON input with full API access

**API Mapping**: 
- Full JSON2Video schema support
- Movie-level and scene-level element hierarchy
- Complete transition and effect system

**Validation Rules**:
- Requires either movie elements or scene elements
- Subtitles only allowed at movie level
- All required API fields enforced

### mergeVideoAudio

**Purpose**: Simple video and audio overlay operation for quick merging workflows.

**Use Cases**:
- Adding background music to video
- Replacing video audio track
- Basic text overlays on merged content

**Parameters**:
- **Video Element**: Single video source with positioning controls
- **Audio Element**: Single audio source with timing controls
- **Additional Elements**: Optional text overlays or global elements
- **Output Settings**: Dimensions, quality, webhook URL
- **Advanced Mode**: JSON template with parameter overrides

**API Mapping**:
- Single scene containing video and audio elements
- Simplified parameter structure for common use case
- Automatic element type configuration

**Validation Rules**:
- Requires exactly one scene
- Scene must contain both video and audio elements
- Standard element validation applies

### mergeVideos

**Purpose**: Video sequence creation and concatenation with transition effects.

**Use Cases**:
- Creating video montages
- Concatenating multiple video clips
- Adding transitions between video segments
- Building video playlists

**Parameters**:
- **Video Elements**: Multiple video sources (2+ required)
- **Transition Settings**: Style, duration, timing
- **Global Elements**: Background audio, text overlays
- **Sequencing**: Order and timing controls
- **Advanced Mode**: Full JSON control for complex sequences

**API Mapping**:
- Multiple scenes with one video element per scene
- Transition objects between scenes
- Global elements at movie level

**Validation Rules**:
- Requires multiple scenes (minimum 2)
- Each scene must contain at least one video element
- Transition validation for supported effects

## Element Types

### Movie-Level Elements

**Allowed Types**: `text`, `subtitles`, `audio`, `voice`

These elements appear throughout the entire video and are defined at the movie level:

#### Text Element
- **Properties**: content, font, color, position, timing
- **Use Case**: Global titles, watermarks, credits
- **Positioning**: Full coordinate and preset system

#### Subtitles Element  
- **Properties**: content, styling, timing, font settings
- **Use Case**: Video captions and subtitles
- **Restriction**: Only allowed at movie level (API rule)

#### Audio Element
- **Properties**: src, volume, seek, loop, muted
- **Use Case**: Background music, sound effects
- **Controls**: Full audio manipulation options

#### Voice Element
- **Properties**: text, voice selection, speed, volume
- **Use Case**: AI-generated narration and voiceovers
- **Features**: Multiple voice options, timing control

### Scene-Level Elements

**Allowed Types**: `video`, `audio`, `image`, `text`, `voice`, `component`, `audiogram`, `html`

These elements are specific to individual scenes:

#### Video Element
- **Properties**: src, resize, position, crop, effects
- **Controls**: Volume, seeking, looping, muting
- **Effects**: Rotation, pan, zoom, flip, chroma key, color correction
- **Positioning**: Coordinate system and preset positions

#### Audio Element  
- **Properties**: src, volume, seek, loop, muted
- **Use Case**: Scene-specific audio, dialogue
- **Same as movie-level but scoped to scene**

#### Image Element
- **Properties**: src, resize, position, effects
- **Effects**: Same visual transformations as video
- **AI Generation**: Optional AI-generated images via prompt

#### Text Element
- **Properties**: content, font, color, position, timing  
- **Use Case**: Scene-specific titles, labels
- **Styling**: Full typography and positioning control

#### Voice Element
- **Properties**: text, voice, speed, volume
- **Same as movie-level but scoped to scene**

#### Component Element
- **Properties**: type, configuration, positioning
- **Use Case**: Reusable video components

#### HTML Element
- **Properties**: content, styling, dimensions
- **Use Case**: Custom HTML rendering in video

#### Audiogram Element
- **Properties**: audio source, visualization style
- **Use Case**: Audio waveform visualizations

## Parameter Structure

### Required Fields

**createMovie**:
- `output_width` (number)
- `output_height` (number)
- At least one of: movie elements or scene elements

**mergeVideoAudio**:
- `output_width` (number)  
- `output_height` (number)
- `videoElement` (fixedCollection)
- `audioElement` (fixedCollection)

**mergeVideos**:
- `output_width` (number)
- `output_height` (number)  
- `sceneElements` (fixedCollection with 2+ video elements)

### Optional Parameters

**All Actions**:
- `webhookUrl` (string) - HTTPS webhook for completion notifications
- `quality` (options) - Rendering quality preset
- `cache` (boolean) - Enable result caching
- `draft` (boolean) - Generate preview without full rendering

**Advanced Mode**:
- `advancedMode` (boolean) - Enable JSON input
- `jsonTemplate` (json) - Direct API JSON with full schema access

### Element Properties

**Common Properties** (all elements):
- `type` (required) - Element type identifier
- `timing` (object) - Start/end timing controls

**Visual Properties** (video, image, component, html, audiogram):
- Position: `x`, `y`, `width`, `height`, `position` preset
- Effects: `crop`, `rotate`, `pan`, `zoom`, `flip-horizontal`, `flip-vertical`
- Advanced: `mask`, `chroma-key`, `correction`

**Audio Properties** (video, audio, voice):
- `volume` (0-10) - Volume multiplier
- `muted` (boolean) - Mute audio track
- `seek` (number) - Start offset in seconds
- `loop` (number) - Loop count (-1 for infinite)

**Text Properties** (text element):
- `text` (string) - Content to display
- `font-family`, `font-size`, `font-weight` - Typography
- `color`, `background-color` - Styling
- `text-align` - Alignment options

## Advanced Mode

All actions support advanced mode with direct JSON API access:

### JSON Template System
- Complete JSON2Video API schema access
- Real-time validation against official API
- Parameter override capability
- Syntax highlighting and error detection

### Implementation
```json
{
  "width": 1920,
  "height": 1080,
  "scenes": [
    {
      "elements": [
        {
          "type": "video",
          "src": "https://example.com/video.mp4",
          "position": "center"
        }
      ]
    }
  ]
}
```

### Validation Process
1. JSON syntax validation
2. Schema compliance checking  
3. Action-specific business rule validation
4. Element type and hierarchy validation

## Error Handling

### Validation Levels

**UI Level**: Parameter type checking, required field enforcement
**Collection Level**: Missing parameter detection with specific error messages
**Processing Level**: API rule enforcement (subtitles placement, element types)
**Schema Level**: Complete JSON2Video API compliance validation

### Error Messages

**Parameter Errors**:
- `"Missing required parameter: {fieldName}"`
- `"Invalid {fieldName}: {value} (expected {expectedType})"`

**API Rule Errors**:
- `"Subtitles elements not allowed in scenes"`
- `"mergeVideoAudio requires exactly one scene with video and audio elements"`
- `"mergeVideos requires multiple scenes with video elements"`

**Schema Errors**:
- `"Invalid element type '{type}' for {level} level"`
- `"Required field '{field}' missing from {elementType} element"`

**Recoverable vs Fatal**:
- Missing optional parameters: Warning (continues processing)
- Invalid required parameters: Error (stops processing)
- API rule violations: Error (stops processing)

## API Integration

### Authentication
Credentials managed through n8n's credential system:
- **Credential Type**: `json2VideoApiCredentials`
- **Fields**: API key (required)
- **Security**: Automatic inclusion in request headers

### Request Process
1. Parameter collection by action type
2. Element processing and validation
3. JSON request building
4. Schema validation
5. API dispatch with authentication
6. Response processing and error handling

### Rate Limiting
- Handled via n8n's built-in retry mechanisms
- Exponential backoff for temporary failures
- Clear error messages for quota limits

### Webhook Support
- Optional HTTPS webhook URL for completion notifications
- Validates webhook URL format before submission
- Provides job tracking capabilities

## Performance

### Processing Efficiency
- **Parameter Collection**: O(1) action-type lookup
- **Element Processing**: O(n) linear with element count
- **Schema Validation**: Early failure optimization
- **Memory Usage**: Stream processing for large requests

### Optimization Features
- Early validation prevents unnecessary API calls
- Cached validation results for repeated patterns
- Minimal object copying during transformation
- Efficient error aggregation and reporting

## Testing Coverage

The implementation maintains comprehensive test coverage:

### Coverage Statistics
- **Lines**: 100% coverage across all source files
- **Branches**: 100% coverage of all conditional logic
- **Functions**: 100% coverage of all exported functions  
- **Test Count**: 1894 passing tests across 23 test suites

### Test Categories
- **Unit Tests**: Individual function testing with explicit inputs/outputs
- **Integration Tests**: End-to-end action processing workflows
- **Schema Tests**: Validation against real JSON2Video API examples
- **Error Tests**: Every failure path and edge case explicitly tested
- **UI Tests**: Parameter definition validation and display logic

### Test Structure
Mirror source architecture exactly:
- Every source file has corresponding `.test.ts` file
- Shared fixtures for consistent test data
- Mock functions for n8n execution context
- Real-world scenario coverage

## API Reference

For complete API specification, see the [official JSON2Video API documentation](https://json2video.com/docs/v2/).

### Key Endpoints Used
- `POST /v2/movies` - Video creation and processing
- Webhook endpoints for completion notifications

### Schema References
- Movie Schema: https://json2video.com/docs/api/#schema-movie
- Scene Schema: https://json2video.com/docs/api/#schema-scene
- Element Schemas: https://json2video.com/docs/api/#elements