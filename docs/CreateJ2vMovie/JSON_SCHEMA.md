# JSON2Video API JSON Schema Documentation

This document describes the JSON schema used in the JSON2Video API and how it interacts with override parameters in the JSON2Video node.

## Base JSON Template Structure

The base JSON structure used in Advanced Mode adheres to the following schema:

```json
{
  "id": "string",          // (Optional) Unique identifier for the video
  "fps": number,           // (Required) Frames per second (e.g., 25)
  "width": number,         // (Required) Output width in pixels (e.g., 1024)
  "height": number,        // (Required) Output height in pixels (e.g., 768)
  "quality": "string",     // (Optional) Video quality ("low", "medium", "high")
  "resolution": "string",  // (Optional) Predefined resolution ("full-hd", "hd", "4k", "custom")
  "cache": boolean,        // (Optional) Whether to force refresh rendering
  "draft": boolean,        // (Optional) Whether to generate a draft version
  "webhook": "string",     // (Optional) URL to receive notifications
  "scenes": [              // (Required) Array of scenes
    {
      "elements": [        // (Required) Array of elements in the scene
        // Element objects (see below)
      ]
    }
  ],
  "elements": []           // (Optional) Array of elements that appear across all scenes
}
```

> **Important Note**: Properties like `padding_color`, `horizontal_position`, `vertical_position`, and `zoom` at the movie level are not supported by the API, despite being mentioned in some documentation. These properties should be used within elements instead.

## Scene Structure

Each scene can have the following properties:

```json
{
  "background-color": "string", // Background color (e.g., "#000000")
  "duration": number,          // Duration in seconds
  "transition": {              // Optional transition effect
    "style": "string",         // Transition style (e.g., "fade", "wiperight")
    "duration": number         // Transition duration in seconds
  },
  "elements": [],              // Array of elements in the scene
  "cache": boolean             // Force refresh rendering for this scene
}
```

## Element Types

Each element in a scene must have a `type` property defining its type. Elements share common properties:

```json
{
  "type": "element-type",
  "start": number,           // Start time in seconds
  "duration": number,        // Duration in seconds
  "extra-time": number,      // Additional time after duration
  "position": "string",      // Position on screen (see positioning section)
  "x": number,               // X-coordinate (used when position is "custom")
  "y": number,               // Y-coordinate (used when position is "custom")
  "cache": boolean           // Force refresh rendering for this element
}
```

### Element Positioning

The `position` property determines how an element is positioned:

```json
"position": "center-center" // Centers the element both horizontally and vertically
```

Valid position values:

- `top-left`: Positions the element at the top-left corner
- `top-right`: Positions the element at the top-right corner
- `bottom-right`: Positions the element at the bottom-right corner
- `bottom-left`: Positions the element at the bottom-left corner
- `center-center`: Centers the element both horizontally and vertically
- `custom`: Uses the exact coordinates specified in `x` and `y` properties

> When using a named position value (anything other than "custom"), the `x` and `y` coordinates are ignored, and the element is automatically positioned according to the named position. The default is "custom" if not specified.

### Image Element

```json
{
  "type": "image",
  "src": "https://example.com/image.jpg",
  "start": 0,
  "duration": 5,
  "position": "center-center", // Or "custom" to use x/y coordinates
  "x": 0, // Used when position is "custom"
  "y": 0, // Used when position is "custom"
  "scale": {
    "width": 0,
    "height": 0
  },
  "zoom": 0,
  "rotate": {
    "angle": 45,
    "speed": 1
  },
  "opacity": 0.8
}
```

### Video Element

```json
{
  "type": "video",
  "src": "https://example.com/video.mp4",
  "start": 0,
  "duration": -2, // -2 means use entire video duration
  "position": "center-center", // Or "custom" to use x/y coordinates
  "x": 0, // Used when position is "custom"
  "y": 0, // Used when position is "custom"
  "volume": 1.0,
  "muted": false,
  "loop": false,
  "crop": false,
  "fit": "cover",
  "zoom": 0
}
```

### Text Element

```json
{
  "type": "text",
  "text": "Your text content",
  "start": 0,
  "duration": 5,
  "position": "center-center", // Or "custom" to use x/y coordinates
  "x": 960, // Used when position is "custom"
  "y": 540, // Used when position is "custom"
  "font-family": "Arial",
  "font-size": 32,
  "color": "white",
  "background-color": "transparent",
  "text-align": "center",
  "opacity": 1.0,
  "style": "001" // Predefined animation style
}
```

### Audio Element

```json
{
  "type": "audio",
  "src": "https://example.com/audio.mp3",
  "start": 0,
  "duration": -2, // -2 means use entire audio duration
  "volume": 0.8,
  "loop": false,
  "fade-in": 1.0,
  "fade-out": 1.0
}
```

### Voice Element

```json
{
  "type": "voice",
  "text": "Text to convert to speech",
  "voice": "en-US-AriaNeural",
  "start": 0,
  "volume": 1.0,
  "rate": 1.0,
  "pitch": 1.0
}
```

### Subtitles Element

```json
{
  "type": "subtitles",
  "settings": {
    "style": "classic",
    "model": "default",
    "language": "en",
    "all_caps": false,
    "position": "bottom-center",
    "font_size": 16,
    "font_family": "Arial"
  }
}
```

## Override Parameters

In Advanced Mode, several parameters can override values in the JSON template:

| Parameter     | Description            | JSON Property | Type    |
| ------------- | ---------------------- | ------------- | ------- |
| Record ID     | Record identifier      | `id`          | string  |
| Output Width  | Video width            | `width`       | number  |
| Output Height | Video height           | `height`      | number  |
| Framerate     | Frames per second      | `fps`         | number  |
| Quality       | Video quality          | `quality`     | string  |
| Cache         | Force refresh          | `cache`       | boolean |
| Draft         | Generate draft version | `draft`       | boolean |
| Resolution    | Predefined resolution  | `resolution`  | string  |
| Webhook URL   | Notification URL       | `webhook`     | string  |

## How Overrides Work

In the JSON2Video node's Advanced Mode:

1. The node first parses the JSON template provided in the "JSON Template" field
2. Required parameters (Output Width, Output Height, Framerate) are always overridden if provided
3. Optional override parameters are applied only if they're provided
4. The resulting modified JSON is sent to the JSON2Video API

This allows you to maintain a complex JSON template with detailed scene configurations while easily overriding specific parameters when needed without editing the JSON directly.

## Best Practices

1. Always include the core required properties (`fps`, `width`, `height`, `scenes`)
2. For complex video projects, build the full JSON template with all scenes and elements
3. Use override parameters for values that might change frequently between runs
4. For element positioning, use named positions like "center-center" instead of coordinates when possible
5. If precise positioning is needed, set `position: "custom"` and specify x/y coordinates
6. Avoid using properties like `padding_color` or `horizontal_position` at the top level of the movie object
7. When referencing data from previous nodes, use expressions in the JSON template
