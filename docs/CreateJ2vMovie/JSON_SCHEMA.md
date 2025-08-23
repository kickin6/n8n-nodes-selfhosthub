# JSON2Video API Complete Documentation

This document defines the complete JSON2Video API schema based on the official API documentation. It serves as the authoritative reference for the JSON2Video n8n node development.

---

## Overview

The JSON2Video API follows a hierarchical structure:

```
Movie (top-level container)
├── Movie-level Elements (global elements: subtitles, text, audio, voice, etc.)
├── Scenes (array of scene objects)
    ├── Scene-level Elements (per-scene: video, audio, image, text, voice)
```

**Critical Rule**: Subtitles elements can ONLY exist at the movie level, not within scenes.

---

## Movie Object (Root)

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
| `quality` | string | No | "high" | Output quality: "low", "medium", "high" |
| `cache` | boolean | No | true | Use cached render if available |
| `client-data` | object | No | {} | Custom key-value data for webhooks |
| `comment` | string | No | - | Internal notes/memos |
| `variables` | object | No | {} | Movie-level variables |
| `elements` | array | No | - | Movie-level elements (global across all scenes) |
| `exports` | array | No | - | Export configurations |

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

## Scene Object

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

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `type` | string | **Yes** | - | Must be "video" |
| `src` | string | No | - | Video URL |
| `seek` | number | No | 0 | Start offset within file (seconds) |
| `volume` | number | No | 1 | Volume multiplier (0-10) |
| `muted` | boolean | No | false | Mute audio track |
| `loop` | number | No | - | Loop count (-1=infinite, positive=repeat count) |
| `resize` | string | No | - | "cover", "fill", "fit", "contain" |
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

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `type` | string | **Yes** | - | Must be "audio" |
| `src` | string | No | - | Audio URL |
| `seek` | number | No | 0 | Start offset within file (seconds) |
| `volume` | number | No | 1 | Volume multiplier (0-10) |
| `muted` | boolean | No | false | Mute audio |
| `loop` | number | No | - | Loop count (-1=infinite, positive=repeat count) |

### 3. Image Element

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `type` | string | **Yes** | - | Must be "image" |
| `src` | string | No | - | Image URL (if not using AI generation) |
| `prompt` | string | No | - | AI generation text prompt |
| `model` | string | No | - | AI model: "flux-pro", "flux-schnell", "freepik-classic" |
| `aspect-ratio` | string | No | "horizontal" | AI generation: "horizontal", "vertical", "squared" |
| `connection` | string | No | - | Connection ID for custom AI API key |
| `model-settings` | object | No | - | AI model-specific settings |
| `position` | string | No | "custom" | Positioning preset or "custom" |
| `x` | number | No | 0 | X coordinate |
| `y` | number | No | 0 | Y coordinate |
| `width` | number | No | -1 | Width in pixels (-1=auto) |
| `height` | number | No | -1 | Height in pixels (-1=auto) |
| `resize` | string | No | - | "cover", "fill", "fit", "contain" |
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

**Note**: Text elements use a complex `settings` object with kebab-case properties for styling.

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `type` | string | **Yes** | - | Must be "text" |
| `text` | string | **Yes** | - | Text content to display |
| `style` | string | No | "001" | Animation style: "001", "002", "003", "004" |
| `position` | string | No | "custom" | Positioning preset or "custom" |
| `x` | number | No | 0 | X coordinate |
| `y` | number | No | 0 | Y coordinate |
| `width` | number | No | -1 | Width in pixels (-1=auto) |
| `height` | number | No | -1 | Height in pixels (-1=auto) |
| `resize` | string | No | - | "cover", "fill", "fit", "contain" |
| `settings` | object | No | {} | Text styling object (see below) |

#### Text Settings Object (kebab-case properties)

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `font-family` | string | No | - | Google Fonts name or custom font URL |
| `font-size` | string | No | - | Font size with units (e.g., "32px", "2em") |
| `font-weight` | string | No | - | Font weight: "300" to "800" |
| `font-color` | string | No | - | Text color (hex code) |
| `background-color` | string | No | - | Background color (hex or rgba) |
| `text-align` | string | No | - | "left", "center", "right", "justify" |
| `vertical-position` | string | No | - | Textbox vertical alignment: "top", "center", "bottom" |
| `horizontal-position` | string | No | - | Textbox horizontal alignment: "left", "center", "right" |

### 5. Voice Element

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `type` | string | **Yes** | - | Must be "voice" |
| `text` | string | **Yes** | - | Text to synthesize into speech |
| `voice` | string | No | - | Voice name/ID to use |
| `model` | string | No | - | TTS model: "azure", "elevenlabs", "elevenlabs-flash-v2-5" |
| `connection` | string | No | - | Connection ID for custom API key |
| `volume` | number | No | 1 | Volume multiplier (0-10) |
| `muted` | boolean | No | false | Mute generated audio |

### 6. Voice Element

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `type` | string | **Yes** | - | Must be "voice" |
| `text` | string | **Yes** | - | Text to synthesize into speech |
| `voice` | string | No | - | Voice name/ID to use |
| `model` | string | No | - | TTS model: "azure", "elevenlabs", "elevenlabs-flash-v2-5" |
| `connection` | string | No | - | Connection ID for custom API key |
| `volume` | number | No | 1 | Volume multiplier (0-10) |
| `muted` | boolean | No | false | Mute generated audio |

### 7. Component Element

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
| `resize` | string | No | - | "cover", "fill", "fit", "contain" |
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

### 8. Audiogram Element

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `type` | string | **Yes** | - | Must be "audiogram" |
| `color` | string | No | - | Wave color (hex code, e.g., "#FF0000") |
| `opacity` | number | No | 0.5 | Opacity (0.0-1.0) |
| `amplitude` | number | No | 5 | Wave amplitude scaling (0-10) |
| `position` | string | No | "custom" | Positioning preset or "custom" |
| `x` | number | No | 0 | X coordinate |
| `y` | number | No | 0 | Y coordinate |
| `width` | number | No | -1 | Width in pixels (-1=inherit movie width) |
| `height` | number | No | -1 | Height in pixels (-1=inherit movie height) |
| `resize` | string | No | - | "cover", "fill", "fit", "contain" |
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

**Critical**: Subtitles can ONLY exist in the movie `elements` array, never in scene elements.

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `type` | string | **Yes** | - | Must be "subtitles" |
| `captions` | string | No | - | Subtitle file URL or inline content (SRT/VTT/ASS) |
| `language` | string | No | "auto" | Language code or "auto" for detection |
| `model` | string | No | "default" | Transcription model: "default", "whisper" |
| `settings` | object | No | {} | Subtitle styling settings |

#### Subtitle Settings Object

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `style` | string | No | "classic" | Subtitle style |
| `all-caps` | boolean | No | false | Make subtitles uppercase |
| `font-family` | string | No | "Arial" | Font family name |
| `font-size` | number | No | - | Font size (defaults to 5% of movie width) |
| `font-url` | string | No | - | Custom font URL (TTF format) |
| `position` | string | No | "bottom-center" | Position on canvas |
| `word-color` | string | No | "#FFFF00" | Color of current word |
| `line-color` | string | No | "#FFFFFF" | Color of other words |
| `box-color` | string | No | "#000000" | Background box color |
| `outline-color` | string | No | "#000000" | Text outline color |
| `outline-width` | number | No | 0 | Outline width |
| `shadow-color` | string | No | "#000000" | Shadow color |
| `shadow-offset` | number | No | 0 | Shadow offset |
| `max-words-per-line` | number | No | 4 | Maximum words per line |
| `x` | number | No | 0 | X coordinate (when position="custom") |
| `y` | number | No | 0 | Y coordinate (when position="custom") |
| `keywords` | array | No | - | Keywords for transcription accuracy |
| `replace` | object | No | - | Word replacement mapping |

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

### Dynamic Number of Scenes

Use the `iterate` property to generate multiple scenes from array data:

```json
{
  "variables": {
    "slides": [
      {"image": "img1.jpg", "title": "Slide 1"},
      {"image": "img2.jpg", "title": "Slide 2"}
    ]
  },
  "scenes": [
    {
      "iterate": "slides",
      "elements": [
        {
          "type": "image",
          "src": "{{image}}"
        },
        {
          "type": "text", 
          "text": "{{title}}"
        }
      ]
    }
  ]
}
```

---

## Shared Object Specifications

## Property Naming Convention

**Critical**: The API uses kebab-case property names, while n8n UI uses camelCase.

**API (kebab-case)**: `background-color`, `font-family`, `z-index`
**n8n UI (camelCase)**: `backgroundColor`, `fontFamily`, `zIndex`

The n8n node processors must convert camelCase to kebab-case for API requests.

---

## Validation Rules

1. **Subtitles Restriction**: Subtitles elements can only exist in movie `elements` array
2. **Required Fields**: Each element type has specific required properties
3. **Value Ranges**: Numeric properties have defined min/max values
4. **Enum Values**: String properties with limited valid options
5. **Conditional Requirements**: Some properties become required based on others (e.g., x/y when position="custom")

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

## Performance Optimization Notes

1. **Scene Structure**: Split into multiple scenes for parallel rendering
2. **Asset Optimization**: Use appropriate formats and sizes
3. **Caching**: Leverage `cache: true` for repeated elements
4. **Transitions**: Use sparingly, prefer `fade` when needed