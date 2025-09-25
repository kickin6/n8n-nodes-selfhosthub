# CreateJ2vMovie Node Documentation

The CreateJ2vMovie node provides a comprehensive interface to the JSON2Video API, enabling video creation through an intuitive form-based interface or advanced JSON templates with flexible export and delivery options.

## Overview

This node transforms n8n workflow parameters into valid JSON2Video API requests through a robust 3-layer architecture with 100% test coverage. The implementation supports complex video creation while maintaining strict API compliance and comprehensive error handling, with multiple delivery methods for generated videos.

## Modes

### Basic Mode (Form-Based)

**Purpose**: Intuitive form-based interface for video creation with full control over scenes, elements, transitions, and export delivery.

**Use Cases**:
- Single-scene video productions
- Custom element positioning and timing
- Mixed content types (video, audio, text, images)
- Professional video workflows with delivery automation

**Parameter Structure**:
```
Basic Mode (Form Interface)
├── Output Settings (toggle)
│   ├── Width (required when enabled)
│   ├── Height (required when enabled)
│   ├── Quality
│   └── Format
├── Movie Settings (toggle)
│   ├── Movie Elements Collection
│   │   ├── Subtitles
│   │   ├── Audio
│   │   ├── Voice
│   │   └── Text
├── Scene Configuration
│   ├── Scene Elements Collection
│   │   ├── Video
│   │   ├── Audio
│   │   ├── Image
│   │   ├── Text
│   │   ├── Voice
│   │   ├── HTML
│   │   ├── Component
│   │   └── Audiogram
└── Export Settings (toggle)
    ├── Webhook delivery
    ├── FTP/SFTP upload
    └── Email notification
```

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

**Current Limitation**: Basic mode creates a single scene containing all elements. For multi-scene videos, use Advanced Mode.

### Advanced Mode (JSON Template)

**Purpose**: Direct JSON template input for full API control and complex multi-scene productions.

**Use Cases**:
- Multi-scene video sequences with transitions
- Complex timing and synchronization
- Data-driven video generation
- Bulk video production from templates
- Dynamic content with variables

**Template Categories**:
- **Blank**: Empty template for custom creation
- **Video & Audio**: Merging audio tracks with video
- **Video Sequence**: Multi-video concatenation
- **Slideshow**: Image sequence with transitions
- **Text Overlay**: Dynamic text on video/images
- **Faceless**: Text-to-speech content videos
- **Social Story**: Vertical format for social media
- **Presentation**: Educational/business content

**Features**:
- Full access to all JSON2Video API features
- Multiple scenes with transitions
- Complex element layering
- Variable substitution
- Conditional rendering
- Iterative scene generation

## Toggle-Based Configuration

### Output Settings Toggle

**Purpose**: Controls video output configuration

**When Enabled**:
- Width and height become required parameters
- Quality and format options become available
- Advanced rendering settings accessible

**When Disabled**:
- Uses API default dimensions (1920x1080)
- Standard quality settings applied
- Simplified processing workflow

### Movie Settings Toggle

**Purpose**: Controls movie-level element configuration

**When Enabled**:
- Movie elements collection becomes available
- Global subtitles, audio, voice, and text elements
- Movie-wide configuration options

**When Disabled**:
- Only scene-level elements available
- Simplified workflow for basic video creation
- Reduced parameter complexity

### Export Settings Toggle

**Purpose**: Controls video delivery configuration

**When Enabled**:
- Multiple delivery method selection
- Webhook, FTP, and email configuration
- Automatic distribution after processing

**When Disabled**:
- Standard API response with video URL
- Manual download/distribution required
- Simplified workflow completion

## Architecture Overview

### Core Principles
- **Single Source of Truth**: JSON2Video API schema defines all rules
- **Template-Driven Advanced Mode**: Pre-built templates accelerate creation
- **Fail Fast**: Invalid data caught early before API submission
- **Schema-First**: All validation references official API schema
- **100% Test Coverage**: Every code path explicitly tested

### Three-Layer Architecture

```
Presentation Layer (UI/Parameters)
├── fields.ts        # Element field definitions
├── parameters.ts    # Toggle-based parameter groups
├── properties.ts    # Node property orchestration
└── templates.ts     # JSON template library

Business Logic Layer
├── collector.ts     # Parameter extraction from n8n
├── buildRequest.ts  # Request assembly with validation
└── validator.ts     # API compliance validation

Data Layer (API Schema)
├── schema.ts        # TypeScript interfaces matching API
└── rules.ts         # Validation constants and rules
```

## Element Types

### Movie-Level Elements
- **Subtitles**: Global captions/subtitles (only at movie level)
- **Audio**: Background music or narration
- **Voice**: Text-to-speech narration
- **Text**: Global text overlays

### Scene-Level Elements
- **Video**: Video clips with effects
- **Audio**: Scene-specific audio tracks
- **Image**: Static images or AI-generated
- **Text**: Scene text overlays
- **Voice**: Scene-specific TTS
- **HTML**: Custom HTML content
- **Component**: Pre-built components
- **Audiogram**: Audio visualization

## Export Delivery Methods

### Webhook
- Real-time notifications
- Custom endpoint configuration
- JSON payload with video details

### FTP/SFTP
- Automatic file upload
- Secure transfer support
- Custom path configuration

### Email
- Notification with download link
- Custom subject and message
- Multiple recipient support

## Usage Examples

### Basic Mode: Simple Video with Music

```javascript
{
  "outputSettings": true,
  "width": 1920,
  "height": 1080,
  "movieSettings": true,
  "movieElements": [{
    "type": "audio",
    "src": "https://example.com/background.mp3"
  }],
  "sceneElements": [{
    "type": "video",
    "src": "https://example.com/main.mp4"
  }]
}
```

### Advanced Mode: Multi-Scene with Transitions

```json
{
  "scenes": [
    {
      "elements": [{
        "type": "video",
        "src": "https://example.com/intro.mp4"
      }],
      "transition": {
        "style": "fade",
        "duration": 1.0
      }
    },
    {
      "elements": [{
        "type": "video", 
        "src": "https://example.com/main.mp4"
      }]
    }
  ]
}
```

### Automated Delivery Workflow

```javascript
{
  "outputSettings": true,
  "width": 1920,
  "height": 1080,
  "sceneElements": [/* elements */],
  "exportSettings": true,
  "exports": [{
    "webhook": {
      "url": "https://api.example.com/webhook"
    }
  }, {
    "email": {
      "to": "client@example.com",
      "subject": "Your video is ready"
    }
  }]
}
```

## Performance and Optimization

### Processing Efficiency

- **Parameter Collection**: Optimized extraction with minimal overhead
- **Validation Pipeline**: Early validation prevents unnecessary processing
- **Request Building**: Efficient transformation with schema compliance
- **Error Handling**: Fast-fail approach with detailed error reporting

### Quality Metrics

- **100% Test Coverage**: Comprehensive testing across all components
- **Zero Compilation Errors**: Full TypeScript compliance
- **Schema Validation**: Runtime validation against official API schema
- **Error Prevention**: Comprehensive validation prevents API errors

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