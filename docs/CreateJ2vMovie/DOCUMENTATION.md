# CreateJ2vMovie Node Documentation

The CreateJ2vMovie node provides a comprehensive interface to the JSON2Video API, enabling video creation, merging, and manipulation through three optimized workflows with flexible export and delivery options.

## Overview

This node transforms n8n workflow parameters into valid JSON2Video API requests through a robust 3-layer architecture with 100% test coverage. The implementation supports complex video operations while maintaining strict API compliance and comprehensive error handling, with multiple delivery methods for generated videos.

## Operations

### createMovie

**Purpose**: Complex video creation with full control over scenes, elements, transitions, and export delivery.

**Use Cases**:
- Multi-scene video productions
- Custom element positioning and timing
- Advanced transitions and effects
- Mixed content types (video, audio, text, images)
- Professional video workflows with delivery automation

**Parameters**:
- **Output Dimensions**: width, height (required)
- **Movie Elements**: Global elements (subtitles, background audio, voice)
- **Scenes**: Array of scene configurations with individual elements
- **Export Settings**: Multi-delivery configuration (webhook, FTP, email)
- **Advanced Settings**: Quality, rendering options
- **Advanced Mode**: Direct JSON input with full API access

**API Mapping**: 
- Full JSON2Video schema support
- Movie-level and scene-level element hierarchy
- Complete transition and effect system
- Multiple export configuration support

**Validation Rules**:
- Requires either movie elements or scene elements
- Subtitles only allowed at movie level
- All required API fields enforced
- Export configurations validated per delivery method

### mergeVideoAudio

**Purpose**: Simple video and audio overlay operation for quick merging workflows.

**Use Cases**:
- Adding background music to video
- Replacing video audio track
- Basic text overlays on merged content
- Automated video processing with delivery

**Parameters**:
- **Video Element**: Single video source with positioning controls
- **Audio Element**: Single audio source with timing controls
- **Additional Elements**: Optional text overlays or global elements
- **Output Settings**: Dimensions, quality, webhook URL
- **Export Settings**: Delivery configuration options
- **Advanced Mode**: JSON template with parameter overrides

**API Mapping**:
- Single scene containing video and audio elements
- Simplified parameter structure for common use case
- Automatic element type configuration
- Export configuration support

**Validation Rules**:
- Requires exactly one scene
- Scene must contain both video and audio elements
- Standard element validation applies
- Export delivery method validation

### mergeVideos

**Purpose**: Video sequence creation and concatenation with transition effects and delivery automation.

**Use Cases**:
- Creating video montages
- Concatenating multiple video clips
- Adding transitions between video segments
- Building video playlists
- Automated video compilation workflows

**Parameters**:
- **Video Elements**: Multiple video sources (2+ required)
- **Transition Settings**: Style, duration, timing
- **Global Elements**: Background audio, text overlays
- **Sequencing**: Order and timing controls
- **Export Settings**: Multi-delivery configuration
- **Advanced Mode**: Full JSON control for complex sequences

**API Mapping**:
- Multiple scenes with one video element per scene
- Transition objects between scenes
- Global elements at movie level
- Export configuration array support

**Validation Rules**:
- Requires multiple scenes (minimum 2)
- Each scene must contain at least one video element
- Transition validation for supported effects
- Export configuration validation

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

## Export and Delivery System

### Overview

The CreateJ2vMovie node supports multiple simultaneous delivery methods for generated videos, enabling automated workflows and integration with external systems.

### Export Types

#### Webhook Delivery
**Purpose**: Real-time notifications and data integration

**Configuration**:
- **Webhook URL** (required): HTTPS endpoint for notifications
- **Format**: MP4, WebM, GIF
- **Quality**: Low, Medium, High, Ultra
- **Custom Resolution**: Optional width/height override

**Use Cases**:
- Trigger downstream n8n workflows
- Integration with external APIs
- Real-time status updates
- Automated processing pipelines

**Validation**:
- HTTPS-only URLs required
- URL format validation
- Reachability testing (optional)

#### FTP/SFTP Upload
**Purpose**: Direct file delivery to remote servers

**Configuration**:
- **Host** (required): FTP server hostname or IP
- **Port**: FTP (21) or SFTP (22) port
- **Username** (required): FTP authentication
- **Password** (required): FTP authentication
- **Upload Path**: Remote directory (default: /)
- **Secure Connection**: SFTP vs standard FTP
- **Format/Quality**: Same options as webhook

**Use Cases**:
- Content delivery networks (CDN)
- Media asset libraries
- Backup and archival
- Integration with legacy systems

**Validation**:
- Connection testing
- Authentication verification
- Path accessibility checking
- File permission validation

#### Email Notification
**Purpose**: Human-readable delivery with attachments

**Configuration**:
- **To Address(es)** (required): Recipient emails (comma-separated)
- **From Address**: Sender email (optional)
- **Subject**: Email subject line
- **Message**: Email body content
- **Format/Quality**: Same options as other methods

**Use Cases**:
- Client delivery
- Team notifications
- Approval workflows
- Manual review processes

**Validation**:
- Email format validation
- Multiple recipient support
- Attachment size limits
- SMTP compatibility

### Multiple Export Configurations

**Simultaneous Delivery**: Each request can include multiple export configurations, enabling parallel delivery to different destinations.

**Example Configuration**:
```json
{
  "exports": [
    {
      "webhook": {
        "url": "https://api.example.com/video-ready"
      },
      "format": "mp4",
      "quality": "high"
    },
    {
      "ftp": {
        "host": "ftp.example.com",
        "username": "user",
        "password": "pass",
        "path": "/videos/"
      },
      "format": "webm",
      "quality": "medium"
    },
    {
      "email": {
        "to": "client@example.com",
        "subject": "Video Ready for Review"
      },
      "format": "mp4",
      "quality": "high"
    }
  ]
}
```

### Export Processing Pipeline

1. **Video Generation**: Primary video created with specified settings
2. **Export Preparation**: Multiple format/quality versions generated as needed
3. **Parallel Delivery**: All export configurations processed simultaneously
4. **Status Tracking**: Individual delivery confirmations provided
5. **Error Handling**: Partial failures don't affect successful deliveries

## Parameter Structure

### Required Fields

**createMovie**:
- `output_width` (number) or outputSettings.width
- `output_height` (number) or outputSettings.height  
- At least one of: movie elements or scene elements

**mergeVideoAudio**:
- `output_width` (number) or outputSettings.width
- `output_height` (number) or outputSettings.height
- `videoElement` (fixedCollection)
- `audioElement` (fixedCollection)

**mergeVideos**:
- `output_width` (number) or outputSettings.width
- `output_height` (number) or outputSettings.height  
- `sceneElements` (fixedCollection with 2+ video elements)

### Optional Parameters

**All Operations**:
- `recordId` (string) - Custom identifier for tracking
- `quality` (options) - Rendering quality preset
- `cache` (boolean) - Enable result caching
- `draft` (boolean) - Generate preview without full rendering
- `exportSettings` (fixedCollection) - Multi-delivery configuration

**Advanced Mode**:
- `advancedMode` (boolean) - Enable JSON input
- `jsonTemplate` (json) - Direct API JSON with full schema access

### Export Configuration Parameters

**Basic Export Settings** (all delivery methods):
- `exportType` (required): webhook, ftp, email
- `format`: mp4, webm, gif
- `quality`: low, medium, high, very_high
- `resolution`: Custom resolution string
- `width`/`height`: Custom dimensions

**Webhook-Specific**:
- `webhookUrl` (required): HTTPS endpoint

**FTP-Specific**:
- `ftpHost` (required): Server hostname
- `ftpPort`: Port number (default 21)
- `ftpUsername` (required): Authentication
- `ftpPassword` (required): Authentication
- `ftpPath`: Upload directory (default /)
- `ftpSecure`: Use SFTP instead of FTP

**Email-Specific**:
- `emailTo` (required): Recipient addresses
- `emailFrom`: Sender address
- `emailSubject`: Email subject
- `emailMessage`: Email body

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

All operations support advanced mode with direct JSON API access and export configuration:

### Advanced Mode Architecture

Advanced mode provides direct JSON2Video API access without parameter override complexity:

**Implementation**:
- Operation-specific advanced mode toggles (`advancedMode`, `advancedModeMergeVideoAudio`, `advancedModeMergeVideos`)
- Operation-specific JSON template parameters (`jsonTemplate`, `jsonTemplateMergeVideoAudio`, `jsonTemplateMergeVideos`)
- No override parameters - users include all desired settings in JSON template
- Complete API schema access with real-time validation

**Design Principle**:
Advanced mode follows the principle that users who want raw JSON control should specify everything in the JSON template rather than mixing form parameters with JSON overrides. This eliminates parameter precedence confusion and provides cleaner separation between basic and advanced interfaces.
- Complete JSON2Video API schema access
- Real-time validation against official API
- Parameter override capability
- Syntax highlighting and error detection
- Full export configuration support

### Export Configuration in Advanced Mode
```json
{
  "width": 1920,
  "height": 1080,
  "scenes": [
    {
      "elements": [
        {
          "type": "video",
          "src": "https://example.com/video.mp4"
        }
      ]
    }
  ],
  "exports": [
    {
      "webhook": {
        "url": "https://webhook.example.com/callback"
      },
      "format": "mp4",
      "quality": "high"
    }
  ]
}
```

### Validation Process
1. JSON syntax validation
2. Schema compliance checking  
3. Operation-specific business rule validation
4. Element type and hierarchy validation
5. Export configuration validation
6. Delivery method compatibility checking

## Error Handling

### Validation Levels

**UI Level**: Parameter type checking, required field enforcement
**Collection Level**: Missing parameter detection with specific error messages
**Processing Level**: API rule enforcement (subtitles placement, element types)
**Schema Level**: Complete JSON2Video API compliance validation
**Export Level**: Delivery method configuration validation

### Error Messages

**Parameter Errors**:
- `"Missing required parameter: {fieldName}"`
- `"Invalid {fieldName}: {value} (expected {expectedType})"`

**API Rule Errors**:
- `"Subtitles elements not allowed in scenes"`
- `"mergeVideoAudio requires exactly one scene with video and audio elements"`
- `"mergeVideos requires multiple scenes with video elements"`

**Export Configuration Errors**:
- `"Webhook URL must use HTTPS"`
- `"FTP host is required for FTP export"`
- `"Invalid email address: {email}"`
- `"Export configuration {index}: {specific error}"`

**Schema Errors**:
- `"Invalid element type '{type}' for {level} level"`
- `"Required field '{field}' missing from {elementType} element"`

**Recoverable vs Fatal**:
- Missing optional parameters: Warning (continues processing)
- Invalid required parameters: Error (stops processing)
- API rule violations: Error (stops processing)
- Export configuration errors: Error (stops processing)

## API Integration

### Authentication
Credentials managed through n8n's credential system:
- **Credential Type**: `json2VideoApiCredentials`
- **Fields**: API key (required)
- **Security**: Automatic inclusion in request headers

### Request Process
1. Parameter collection by operation type
2. Element processing and validation
3. Export configuration processing and validation
4. JSON request building with export arrays
5. Schema validation including export validation
6. API dispatch with authentication
7. Response processing and error handling

### Export Processing
- Export configurations transformed from n8n UI to API format
- Multiple delivery methods processed in parallel
- Individual delivery status tracking
- Comprehensive error reporting per export method

### Rate Limiting
- Handled via n8n's built-in retry mechanisms
- Exponential backoff for temporary failures
- Clear error messages for quota limits
- Export delivery retries independent of video generation

### Delivery Tracking
- Individual export status monitoring
- Delivery confirmation per method
- Partial success handling (some exports succeed, others fail)
- Comprehensive logging for troubleshooting

## Performance

### Processing Efficiency
- **Parameter Collection**: O(1) operation-type lookup
- **Element Processing**: O(n) linear with element count
- **Export Processing**: O(m) linear with export configuration count
- **Schema Validation**: Early failure optimization
- **Memory Usage**: Stream processing for large requests

### Export Performance
- **Parallel Processing**: Multiple exports generated simultaneously
- **Format Optimization**: Only generate required formats/qualities
- **Delivery Optimization**: Concurrent delivery to multiple destinations
- **Error Isolation**: Failures in one export don't affect others

### Optimization Features
- Early validation prevents unnecessary API calls
- Cached validation results for repeated patterns
- Minimal object copying during transformation
- Efficient error aggregation and reporting
- Export configuration deduplication

## Testing Coverage

The implementation maintains comprehensive test coverage including export functionality:

### Coverage Statistics
- **Lines**: 100% coverage across all source files
- **Branches**: 100% coverage of all conditional logic
- **Functions**: 100% coverage of all exported functions  
- **Test Count**: 1894+ passing tests across 23+ test suites
- **Export Tests**: Comprehensive coverage of all delivery methods

### Test Categories
- **Unit Tests**: Individual function testing with explicit inputs/outputs
- **Integration Tests**: End-to-end operation processing workflows
- **Export Tests**: All delivery methods and configuration combinations
- **Schema Tests**: Validation against real JSON2Video API examples
- **Error Tests**: Every failure path and edge case explicitly tested
- **UI Tests**: Parameter definition validation and display logic

### Export Testing Structure
- **Parameter Collection**: Export configuration extraction from UI
- **Processing Logic**: Export configuration transformation
- **Validation Rules**: All delivery method validation scenarios
- **Error Handling**: Export-specific error conditions
- **Integration**: End-to-end export workflow testing

### Test Structure
Mirror source architecture exactly:
- Every source file has corresponding `.test.ts` file
- Shared fixtures for consistent test data
- Mock functions for n8n execution context
- Real-world scenario coverage including export workflows
- Comprehensive export configuration testing

## Use Case Examples

### Automated Video Processing Pipeline
```
1. Video uploaded to n8n trigger
2. CreateJ2vMovie processes with mergeVideoAudio
3. Webhook delivery triggers next workflow step
4. FTP upload archives to content library
5. Email notification sent to content team
```

### Multi-Channel Content Distribution
```
1. CreateJ2vMovie generates marketing video
2. High-quality MP4 delivered via FTP to website
3. Compressed WebM sent via webhook to social media API
4. Email notification with preview sent to marketing team
```

### Client Review and Approval Workflow
```
1. Video created with createMovie operation
2. Draft quality email sent to client for review
3. Upon approval, webhook triggers final processing
4. High-quality version uploaded to client FTP
5. Archive copy stored via secondary FTP export
```

## API Reference

For complete API specification, see the [official JSON2Video API documentation](https://json2video.com/docs/v2/).

### Key Endpoints Used
- `POST /v2/movies` - Video creation and processing
- Export endpoints for delivery notifications

### Export Documentation References
- [Export Configuration](https://json2video.com/docs/v2/api-reference/exports)
- [Webhook Delivery](https://json2video.com/docs/v2/api-reference/exports/webhooks)
- [FTP/SFTP Upload](https://json2video.com/docs/v2/api-reference/exports/uploading-to-ftpsftp)
- [Email Notifications](https://json2video.com/docs/v2/api-reference/exports/email-notification)
- [Export Tutorial](https://json2video.com/docs/tutorial/exports/)

### Schema References
- Movie Schema: https://json2video.com/docs/api/#schema-movie
- Scene Schema: https://json2video.com/docs/api/#schema-scene
- Element Schemas: https://json2video.com/docs/api/#elements
- Export Schemas: https://json2video.com/docs/v2/api-reference/exports