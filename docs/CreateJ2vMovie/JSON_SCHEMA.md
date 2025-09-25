# JSON2Video API Complete Documentation

This document defines the complete JSON2Video API schema based on the official API documentation and serves as the authoritative reference for the CreateJ2vMovie n8n node.

**API Documentation References:**
- Main API Documentation: https://json2video.com/docs/api/
- v2 API Documentation: https://json2video.com/docs/v2/
- Movie Schema: https://json2video.com/docs/api/#schema-movie
- Scene Schema: https://json2video.com/docs/api/#schema-scene

---

## Overview

The JSON2Video API follows a hierarchical structure:

```
Movie (top-level container)
├── Movie-level Elements (global elements: subtitles, text, audio, voice)
├── Exports (delivery configurations: webhook, ftp, email)
└── Scenes (array of scene objects)
    └── Scene-level Elements (per-scene: video, audio, image, text, voice, html, component, audiogram)
```

**Critical Rule**: Subtitles elements can ONLY exist at the movie level, not within scenes.

---

## Movie Object (Root)

**API Reference:** https://json2video.com/docs/api/#schema-movie

The top-level movie object defines the overall structure and settings.

### Required Properties
- `scenes` (array) - Array of scene objects

### Optional Properties

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `id` | string | No | "@randomString" | Unique identifier |
| `resolution` | string | No | "custom" | Video resolution preset |
| `width` | integer | No | 640 | Custom width in pixels (50-3840, required if resolution="custom") |
| `height` | integer | No | 360 | Custom height in pixels (50-3840, required if resolution="custom") |
| `quality` | string | No | "high" | Output quality: "low", "medium", "high", "very_high" |
| `cache` | boolean | No | true | Use cached render if available |
| `client-data` | object | No | {} | Custom key-value data for webhooks |
| `comment` | string | No | - | Internal notes/memos |
| `variables` | object | No | {} | Movie-level variables |
| `elements` | array | No | - | Movie-level elements (global across all scenes) |
| `exports` | array | No | - | Export configurations (v2 API format) |

### Resolution Options
- `"sd"` - Standard Definition
- `"hd"` - High Definition  
- `"full-hd"` - Full HD (1920x1080)
- `"squared"` - Square aspect ratio
- `"instagram-story"` - Instagram Stories format
- `"instagram-feed"` - Instagram Feed format
- `"twitter-landscape"` - Twitter landscape
- `"twitter-portrait"` - Twitter portrait
- `"custom"` - Custom dimensions (requires width/height)

---

## Export Configuration (v2 API)

**API Reference:** https://json2video.com/docs/v2/api-reference/exports

The v2 API uses a new export format with destinations array:

```json
{
  "exports": [
    {
      "destinations": [
        {
          "type": "webhook",
          "endpoint": "https://example.com/webhook"
        },
        {
          "type": "ftp",
          "host": "ftp.example.com",
          "username": "user",
          "password": "pass"
        },
        {
          "type": "email",
          "to": "user@example.com"
        }
      ]
    }
  ]
}
```

### Webhook Destination

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `type` | string | **Yes** | Must be "webhook" |
| `endpoint` | string | **Yes** | HTTPS URL to receive POST request |

### FTP/SFTP Destination

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `type` | string | **Yes** | - | Must be "ftp" |
| `host` | string | **Yes** | - | FTP server hostname/IP |
| `username` | string | **Yes** | - | FTP username |
| `password` | string | **Yes** | - | FTP password |
| `port` | integer | No | 21 | Server port (1-65535) |
| `remote-path` | string | No | "/" | Upload directory path |
| `file` | string | No | - | Custom filename |
| `secure` | boolean | No | false | Use SFTP instead of FTP |

### Email Destination

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `type` | string | **Yes** | - | Must be "email" |
| `to` | string/array | **Yes** | - | Recipient email(s) |
| `from` | string | No | - | Sender email address |
| `subject` | string | No | "Your video is ready" | Email subject line |
| `message` | string | No | - | Email body content |

---

## Scene Object

**API Reference:** https://json2video.com/docs/api/#schema-scene

Represents a distinct segment of video content within the movie.

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `id` | string | No | "@randomString" | Unique identifier |
| `duration` | number | No | -1 | Duration in seconds (-1 = auto-calculate) |
| `background-color` | string | No | "#000000" | Hex color or "transparent" |
| `comment` | string | No | - | Internal notes |
| `condition` | string | No | - | Conditional expression for inclusion |
| `cache` | boolean | No | true | Use cached render |
| `variables` | object | No | {} | Scene-level variables (override movie-level) |
| `elements` | array | No | - | Scene-level elements |

---

## Common Element Properties

All elements share these base properties:

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `type` | string | **Yes** | - | Element type identifier |
| `id` | string | No | "@randomString" | Unique identifier |
| `comment` | string | No | - | Internal notes |
| `condition` | string | No | - | Conditional rendering expression |
| `variables` | object | No | {} | Element-level variables |
| `cache` | boolean | No | true | Use cached render |
| `start` | number | No | 0 | Start time in seconds |
| `duration` | number | No | -1 | Duration (-1=intrinsic, -2=match container) |
| `extra-time` | number | No | 0 | Additional time after duration |
| `z-index` | number | No | 0 | Stacking order (-99 to 99) |
| `fade-in` | number | No | - | Fade in duration in seconds (≥0) |
| `fade-out` | number | No | - | Fade out duration in seconds (≥0) |

### Duration Special Values
- **Positive numbers**: Explicit duration in seconds
- **-1**: Auto-duration based on asset intrinsic length
- **-2**: Match container duration (scene or movie)

---

## Element Types

### 1. Video Element

**API Reference:** https://json2video.com/docs/api/#schema-video

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `type` | string | **Yes** | - | Must be "video" |
| `src` | string | No | - | Video URL |
| `seek` | number | No | 0 | Start offset within file (seconds) |
| `volume` | number | No | 1 | Volume multiplier (0-10) |
| `muted` | boolean | No | false | Mute audio track |
| `loop` | number | No | - | Loop count (-1=infinite, positive=repeat count) |
| `resize` | string | No | "cover" | "cover", "fill", "fit", "contain" |
| `position` | string | No | "custom" | Positioning preset or "custom" |
| `x` | number | No | 0 | X coordinate (when position="custom") |
| `y` | number | No | 0 | Y coordinate (when position="custom") |
| `width` | number | No | -1 | Width in pixels (-1=maintain aspect ratio) |
| `height` | number | No | -1 | Height in pixels (-1=maintain aspect ratio) |
| `crop` | object | No | - | Cropping area settings |
| `rotate` | object | No | - | Rotation settings (angle, speed) |
| `pan` | string | No | - | Pan direction: "left", "right", "top", "bottom", combinations |
| `pan-distance` | number | No | 0.1 | Pan distance (0.01-0.5) |
| `pan-crop` | boolean | No | true | Stretch during pan |
| `zoom` | number | No | - | Zoom level (-10 to 10) |
| `flip-horizontal` | boolean | No | false | Horizontal flip |
| `flip-vertical` | boolean | No | false | Vertical flip |
| `mask` | string | No | - | Mask URL for transparency effects |
| `chroma-key` | object | No | - | Green screen settings (color, tolerance) |
| `correction` | object | No | - | Color correction (brightness, contrast, gamma, saturation) |

### 2. Audio Element

**API Reference:** https://json2video.com/docs/api/#schema-audio

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `type` | string | **Yes** | - | Must be "audio" |
| `src` | string | No | - | Audio URL |
| `seek` | number | No | 0 | Start offset within file (seconds) |
| `volume` | number | No | 1 | Volume multiplier (0-10) |
| `muted` | boolean | No | false | Mute audio |
| `loop` | number | No | - | Loop count (-1=infinite, positive=repeat count) |

### 3. Image Element

**API Reference:** https://json2video.com/docs/api/#schema-image

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `type` | string | **Yes** | - | Must be "image" |
| `src` | string | No | - | Image URL (if not using AI generation) |
| `prompt` | string | No | - | AI generation text prompt |
| `model` | string | No | "flux-schnell" | AI model: "flux-pro", "flux-schnell", "freepik-classic" |
| `aspect-ratio` | string | No | "horizontal" | AI generation: "horizontal", "vertical", "squared" |
| `connection` | string | No | - | Connection ID for custom AI API key |
| `model-settings` | object | No | - | AI model-specific settings |
| `position` | string | No | "custom" | Positioning preset or "custom" |
| `x` | number | No | 0 | X coordinate |
| `y` | number | No | 0 | Y coordinate |
| `width` | number | No | -1 | Width in pixels (-1=auto) |
| `height` | number | No | -1 | Height in pixels (-1=auto) |
| `resize` | string | No | "cover" | "cover", "fill", "fit", "contain" |
| `crop` | object | No | - | Cropping settings |
| `rotate` | object | No | - | Rotation settings |
| `pan` | string | No | - | Pan direction |
| `pan-distance` | number | No | 0.1 | Pan distance (0.01-0.5) |
| `pan-crop` | boolean | No | true | Stretch during pan |
| `zoom` | number | No | - | Zoom level (-10 to 10) |
| `flip-horizontal` | boolean | No | false | Horizontal flip |
| `flip-vertical` | boolean | No | false | Vertical flip |
| `mask` | string | No | - | Mask URL |
| `chroma-key` | object | No | - | Green screen settings |
| `correction` | object | No | - | Color correction |

### 4. Text Element

**API Reference:** https://json2video.com/docs/api/#schema-text

**Note**: Text elements use a complex `settings` object with kebab-case properties for styling.

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `type` | string | **Yes** | - | Must be "text" |
| `text` | string | **Yes** | - | Text content to display |
| `style` | string | No | "001" | Animation style: "001" through "010" |
| `position` | string | No | "custom" | Positioning preset or "custom" |
| `x` | number | No | 0 | X coordinate |
| `y` | number | No | 0 | Y coordinate |
| `width` | number | No | -1 | Width in pixels (-1=auto) |
| `height` | number | No | -1 | Height in pixels (-1=auto) |
| `resize` | string | No | "cover" | "cover", "fill", "fit", "contain" |
| `settings` | object | No | {} | Text styling object (see below) |

#### Text Settings Object (kebab-case properties)

| Property | Type | Required | Default | Valid Values | Description |
|----------|------|----------|---------|--------------|-------------|
| `font-family` | string | No | "Arial" | Google Fonts name or custom font URL | Font family |
| `font-size` | string/number | No | 32 | 8-500 | Font size with units or number |
| `font-weight` | string/number | No | "400" | "100"-"900" (multiples of 100) | Font weight |
| `font-color` | string | No | "#ffffff" | Hex, rgb, rgba, "transparent" | Text color |
| `background-color` | string | No | "transparent" | Hex, rgb, rgba, "transparent" | Background color |
| `text-align` | string | No | "center" | "left", "center", "right", "justify" | Text alignment |
| `vertical-position` | string | No | "center" | "top", "center", "bottom" | Textbox vertical alignment |
| `horizontal-position` | string | No | "center" | "left", "center", "right" | Textbox horizontal alignment |
| `line-height` | number | No | 1.2 | 0.5-3.0 | Line spacing multiplier |
| `letter-spacing` | number | No | 0 | Any number | Letter spacing in pixels |
| `text-shadow` | string | No | - | CSS shadow format | CSS text-shadow property |
| `text-decoration` | string | No | "none" | "none", "underline", "overline", "line-through" | Text decoration |
| `text-transform` | string | No | "none" | "none", "uppercase", "lowercase", "capitalize" | Text case transformation |

### 5. Voice Element

**API Reference:** https://json2video.com/docs/api/#schema-voice

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `type` | string | **Yes** | - | Must be "voice" |
| `text` | string | **Yes** | - | Text to synthesize into speech |
| `voice` | string | No | "en-US-AriaNeural" | Voice name/ID to use |
| `model` | string | No | "azure" | TTS model: "azure", "elevenlabs", "elevenlabs-flash-v2-5" |
| `connection` | string | No | - | Connection ID for custom API key |
| `volume` | number | No | 1 | Volume multiplier (0-10) |
| `muted` | boolean | No | false | Mute generated audio |

### 6. Component Element

**API Reference:** https://json2video.com/docs/api/#schema-component

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `type` | string | **Yes** | - | Must be "component" |
| `component` | string | **Yes** | - | Pre-defined component ID from library |
| `settings` | object | No | {} | Component-specific customization settings |
| `position` | string | No | "custom" | Positioning preset or "custom" |
| `x` | number | No | 0 | X coordinate |
| `y` | number | No | 0 | Y coordinate |
| `width` | number | No | -1 | Width in pixels (-1=auto) |
| `height` | number | No | -1 | Height in pixels (-1=auto) |
| `resize` | string | No | "cover" | "cover", "fill", "fit", "contain" |
| `crop` | object | No | - | Cropping settings |
| `rotate` | object | No | - | Rotation settings |
| `pan` | string | No | - | Pan direction |
| `pan-distance` | number | No | 0.1 | Pan distance (0.01-0.5) |
| `pan-crop` | boolean | No | true | Stretch during pan |
| `zoom` | number | No | - | Zoom level (-10 to 10) |
| `flip-horizontal` | boolean | No | false | Horizontal flip |
| `flip-vertical` | boolean | No | false | Vertical flip |
| `mask` | string | No | - | Mask URL |
| `chroma-key` | object | No | - | Green screen settings |
| `correction` | object | No | - | Color correction |

### 7. Audiogram Element

**API Reference:** https://json2video.com/docs/api/#schema-audiogram

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `type` | string | **Yes** | - | Must be "audiogram" |
| `src` | string | No | - | Audio source URL for visualization |
| `color` | string | No | "#ffffff" | Wave color (hex code) |
| `opacity` | number | No | 0.5 | Opacity (0.0-1.0) |
| `amplitude` | number | No | 5 | Wave amplitude scaling (0-10) |
| `position` | string | No | "custom" | Positioning preset or "custom" |
| `x` | number | No | 0 | X coordinate |
| `y` | number | No | 0 | Y coordinate |
| `width` | number | No | -1 | Width in pixels (-1=inherit movie width) |
| `height` | number | No | -1 | Height in pixels (-1=inherit movie height) |
| `resize` | string | No | "cover" | "cover", "fill", "fit", "contain" |
| `crop` | object | No | - | Cropping settings |
| `rotate` | object | No | - | Rotation settings |
| `pan` | string | No | - | Pan direction |
| `pan-distance` | number | No | 0.1 | Pan distance (0.01-0.5) |
| `pan-crop` | boolean | No | true | Stretch during pan |
| `zoom` | number | No | - | Zoom level (-10 to 10) |
| `flip-horizontal` | boolean | No | false | Horizontal flip |
| `flip-vertical` | boolean | No | false | Vertical flip |
| `mask` | string | No | - | Mask URL |
| `chroma-key` | object | No | - | Green screen settings |
| `correction` | object | No | - | Color correction |

### 8. HTML Element

**API Reference:** https://json2video.com/docs/api/#schema-html

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `type` | string | **Yes** | - | Must be "html" |
| `html` | string | No | - | HTML snippet to render (compatible with HTML5, CSS3, JavaScript) |
| `src` | string | No | - | URL to the web page |
| `tailwindcss` | boolean | No | false | Enables TailwindCSS for the HTML snippet |
| `wait` | number | No | 2 | Time in seconds to wait before taking screenshot (0-5) |
| `position` | string | No | "custom" | Positioning preset or "custom" |
| `x` | number | No | 0 | X coordinate |
| `y` | number | No | 0 | Y coordinate |
| `width` | number | No | -1 | Width in pixels (-1=auto) |
| `height` | number | No | -1 | Height in pixels (-1=auto) |
| `resize` | string | No | "cover" | "cover", "fill", "fit", "contain" |
| `crop` | object | No | - | Cropping settings |
| `rotate` | object | No | - | Rotation settings |
| `pan` | string | No | - | Pan direction |
| `pan-distance` | number | No | 0.1 | Pan distance (0.01-0.5) |
| `pan-crop` | boolean | No | true | Stretch during pan |
| `zoom` | number | No | - | Zoom level (-10 to 10) |
| `flip-horizontal` | boolean | No | false | Horizontal flip |
| `flip-vertical` | boolean | No | false | Vertical flip |
| `mask` | string | No | - | Mask URL |
| `chroma-key` | object | No | - | Green screen settings |
| `correction` | object | No | - | Color correction |

### 9. Subtitles Element (Movie-Level ONLY)

**API Reference:** https://json2video.com/docs/api/#schema-subtitles

**Critical**: Subtitles can ONLY exist in the movie `elements` array, never in scene elements.

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `type` | string | **Yes** | - | Must be "subtitles" |
| `captions` | string | No | - | Subtitle file URL or inline content (SRT/VTT/ASS) |
| `language` | string | No | "auto" | Language code or "auto" for detection |
| `model` | string | No | "default" | Transcription model: "default", "whisper" |
| `settings` | object | No | {} | Subtitle styling settings |

#### Subtitle Settings Object

| Property | Type | Required | Default | Valid Values | Description |
|----------|------|----------|---------|--------------|-------------|
| `style` | string | No | "classic" | Any string | Subtitle style |
| `all-caps` | boolean | No | false | true, false | Make subtitles uppercase |
| `font-family` | string | No | "Arial" | Font names or custom URL | Font family name |
| `font-size` | number | No | - | 8-200 | Font size (defaults to 5% of movie width) |
| `font-url` | string | No | - | Valid URL | Custom font URL (TTF format) |
| `position` | string | No | "bottom-center" | Position presets or "custom" | Position on canvas |
| `word-color` | string | No | "#FFFF00" | Hex, rgb, rgba | Color of current word |
| `line-color` | string | No | "#FFFFFF" | Hex, rgb, rgba | Color of other words |
| `box-color` | string | No | "#000000" | Hex, rgb, rgba | Background box color |
| `outline-color` | string | No | "#000000" | Hex, rgb, rgba | Text outline color |
| `outline-width` | number | No | 0 | 0-10 | Outline width |
| `shadow-color` | string | No | "#000000" | Hex, rgb, rgba | Shadow color |
| `shadow-offset` | number | No | 0 | 0-20 | Shadow offset |
| `max-words-per-line` | number | No | 4 | 1-20 | Maximum words per line |
| `x` | number | No | 0 | Any number | X coordinate (when position="custom") |
| `y` | number | No | 0 | Any number | Y coordinate (when position="custom") |
| `keywords` | array | No | - | Array of strings | Keywords for transcription accuracy |
| `replace` | object | No | - | Key-value pairs | Word replacement mapping |

---

## Advanced Features

### Variables System

Variables enable dynamic content injection and can be defined at movie, scene, or element levels.

```json
{
  "variables": {
    "title": "Summer Sale!",
    "discount": 20,
    "show_logo": true,
    "colors": ["#FF0000", "#00FF00", "#0000FF"]
  }
}
```

**Usage**: `{{variable_name}}` in any string value
**Scope**: Scene variables override movie variables with same name

### Expressions

Expressions allow calculations and conditional logic within templates.

**Operators**: `+`, `-`, `*`, `/`, `==`, `!=`, `>`, `<`, `>=`, `<=`, `and`, `or`
**Functions**: `min(a, b)`, `max(a, b)`
**Ternary**: `condition ? value_if_true : value_if_false`

**Examples**:
- `"duration": "{{ base_duration + 2 }}"`
- `"text": "{{ show_sale ? 'SALE!' : 'Regular Price' }}"`

### Conditional Elements

Elements can be conditionally included using the `condition` property:

```json
{
  "type": "text",
  "text": "Limited Time Offer!",
  "condition": "{{ show_promo == true }}"
}
```

---

## Property Naming Convention

**Critical**: The API uses kebab-case property names, while n8n UI uses camelCase.

**API (kebab-case)**: `background-color`, `font-family`, `z-index`
**n8n UI (camelCase)**: `backgroundColor`, `fontFamily`, `zIndex`

The n8n node processors must convert camelCase to kebab-case for API requests.

---

## Shared Object Specifications

### Crop Object

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `width` | integer | **Yes** | - | Width of cropping area |
| `height` | integer | **Yes** | - | Height of cropping area |
| `x` | integer | No | 0 | Left point of cropping |
| `y` | integer | No | 0 | Top point of cropping |

### Rotate Object

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `angle` | number | **Yes** | 0 | Rotation angle (-360 to 360) |
| `speed` | number | No | 0 | Rotation animation speed (0=no movement) |

### Chroma-Key Object

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `color` | string | **Yes** | - | Color to make transparent (hex code) |
| `tolerance` | integer | No | 25 | Color sensitivity (1-100) |

### Correction Object

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `brightness` | number | No | 0 | Brightness adjustment (-1 to 1) |
| `contrast` | number | No | 1 | Contrast adjustment (-1000 to 1000) |
| `gamma` | number | No | 1 | Gamma adjustment (0.1 to 10) |
| `saturation` | number | No | 1 | Saturation adjustment (0 to 3) |

---

## Validation Rules

1. **Subtitles Restriction**: Subtitles elements can only exist in movie `elements` array
2. **Required Fields**: Each element type has specific required properties
3. **Value Ranges**: Numeric properties have defined min/max values
4. **Enum Values**: String properties with limited valid options
5. **Conditional Requirements**: Some properties become required based on others (e.g., x/y when position="custom")
6. **Export Format**: v2 API uses `exports` array with `destinations` structure

---

## Performance Optimization Notes

1. **Scene Structure**: Split into multiple scenes for parallel rendering
2. **Asset Optimization**: Use appropriate formats and sizes
3. **Caching**: Leverage `cache: true` for repeated elements
4. **Visual Effects**: Use pan effects within scenes for dynamic visuals
5. **Draft Mode**: Use lower quality for testing iterations