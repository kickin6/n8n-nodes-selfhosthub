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
  "duration": number,          // Duration in seconds (-1 for auto-calculation)
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
  "duration": number,        // Duration in seconds (see Duration Values section)
  "extra-time": number,      // Additional time after duration
  "position": "string",      // Position on screen (see positioning section)
  "x": number,               // X-coordinate (used when position is "custom")
  "y": number,               // Y-coordinate (used when position is "custom")
  "cache": boolean           // Force refresh rendering for this element
}
```

## Duration Values

The JSON2Video API supports several duration value types:

### Positive Numbers
Explicit duration in seconds:
```json
{
  "duration": 5.5    // Element lasts exactly 5.5 seconds
}
```

### Special Duration Values

- **`-1`**: Automatically set duration based on the intrinsic length of the asset file
  ```json
  {
    "type": "video",
    "src": "https://example.com/video.mp4", 
    "duration": -1    // Uses the actual video file duration
  }
  ```

- **`-2`**: Set duration to match the parent container (scene or movie)
  ```json
  {
    "type": "audio",
    "src": "https://example.com/audio.mp3",
    "duration": -2    // Matches the scene/movie duration
  }
  ```

### Duration Best Practices

1. **Use `-1` for media files**: When you want to use the full duration of video/audio files
2. **Use `-2` for background elements**: When you want audio/video to match the container duration
3. **Use positive values for control**: When you need exact timing
4. **Omit duration for auto-detection**: Let the API determine the best duration

## Element Positioning

The `position` property determines how an element is positioned:

```json
"position": "center-center" // Centers the element both horizontally and vertically
```

Valid position values:

- `top-left`: Positions the element at the top-left corner
- `top-center`: Positions the element at the top-center
- `top-right`: Positions the element at the top-right corner
- `center-left`: Positions the element at the center-left
- `center-center`: Centers the element both horizontally and vertically
- `center-right`: Positions the element at the center-right
- `bottom-left`: Positions the element at the bottom-left corner
- `bottom-center`: Positions the element at the bottom-center
- `bottom-right`: Positions the element at the bottom-right corner
- `custom`: Uses the exact coordinates specified in `x` and `y` properties

> When using a named position value (anything other than "custom"), the `x` and `y` coordinates are ignored, and the element is automatically positioned according to the named position. The default is "custom" if not specified.

### Image Element

```json
{
  "type": "image",
  "src": "https://example.com/image.jpg",
  "start": 0,
  "duration": 5,
  "position": "center-center",
  "x": 0,
  "y": 0,
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
  "duration": -1,              // Use video's actual duration
  "position": "center-center",
  "x": 0,
  "y": 0,
  "volume": 1.0,
  "muted": false,
  "loop": -1,                  // -1 = infinite loop, positive number = loop count
  "crop": false,
  "fit": "cover",
  "zoom": 0
}
```

### Text Element

The text element supports comprehensive configuration for subtitles, captions, and text overlays:

```json
{
  "type": "text",
  "text": "Your subtitle text",
  "start": 0,
  "duration": 5,
  "style": "001",                    // Animation style ("001", "002", "003", "004")
  "position": "bottom-left",         // Canvas position preset
  "x": 50,                          // X coordinate (when position is "custom")
  "y": 50,                          // Y coordinate (when position is "custom")
  "z-index": 10,                    // Layering order (-99 to 99)
  "settings": {
    "font-family": "Roboto",        // Google Font or custom font URL
    "font-size": "32px",            // Font size with units
    "font-weight": "600",           // Font weight (300-800)
    "font-color": "#FFFFFF",        // Text color (hex format)
    "background-color": "rgba(0,0,0,0.7)", // Background color (hex or rgba)
    "text-align": "center",         // Text alignment (left, center, right, justify)
    "vertical-position": "bottom",  // Vertical alignment in text canvas (top, center, bottom)
    "horizontal-position": "center" // Horizontal alignment in text canvas (left, center, right)
  },
  "fade-in": 0.3,                   // Fade in duration in seconds
  "fade-out": 0.3,                  // Fade out duration in seconds
  "width": 800,                     // Element width (-1 for auto)
  "height": 100,                    // Element height (-1 for auto)
  "resize": "fit",                  // Resize mode (cover, fill, fit, contain)
  "pan": "left",                    // Pan animation direction
  "pan-distance": 0.1,              // Pan movement distance (0.01-0.5)
  "pan-crop": true,                 // Crop during pan animation
  "zoom": 2,                        // Zoom level (-10 to 10)
  "rotate": {
    "angle": 45,                    // Rotation angle (-360 to 360)
    "speed": 2                      // Time to complete rotation
  },
  "flip-horizontal": false,         // Horizontal flip
  "flip-vertical": false,           // Vertical flip
  "chroma-key": {
    "color": "#00FF00",             // Color to make transparent
    "tolerance": 25                 // Sensitivity (1-100)
  },
  "correction": {
    "brightness": 0.1,              // Brightness adjustment (-1 to 1)
    "contrast": 1.2,                // Contrast adjustment (-1000 to 1000)
    "gamma": 1.0,                   // Gamma adjustment (0.1 to 10)
    "saturation": 1.1               // Saturation adjustment (0 to 3)
  },
  "mask": "https://example.com/mask.png", // URL to mask file
  "condition": "some_variable == true",   // Conditional rendering expression
  "variables": {                          // Element-specific variables
    "custom_var": "value"
  },
  "comment": "Subtitle for intro section"  // Internal note
}
```

#### Text Element Animation Styles

- **"001"**: Basic fade in/out
- **"002"**: Word by word reveal
- **"003"**: Character by character reveal  
- **"004"**: Jumping letters animation

#### Text Element Positioning

Text elements use a two-level positioning system:

1. **Canvas Position** (`position`, `x`, `y`): Where the text canvas is placed on the video
2. **Text Alignment** (`vertical-position`, `horizontal-position`): How text aligns within its canvas

This allows for flexible positioning while maintaining text alignment consistency.

### Audio Element

```json
{
  "type": "audio",
  "src": "https://example.com/audio.mp3",
  "start": 0,
  "duration": -1,              // Use audio's actual duration
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

## Video Merging Structure

When merging videos, each video should be placed in a separate scene with optional text elements:

```json
{
  "fps": 30,
  "width": 1024,
  "height": 768,
  "scenes": [
    {
      "elements": [
        {
          "type": "video",
          "src": "https://example.com/video1.mp4",
          "start": 0,
          "duration": -1
        },
        {
          "type": "text",
          "text": "Introduction Video",
          "start": 1,
          "duration": 3,
          "style": "001",
          "position": "bottom-center",
          "settings": {
            "font-family": "Roboto",
            "font-size": "28px",
            "font-color": "#FFFFFF",
            "background-color": "rgba(0,0,0,0.8)",
            "vertical-position": "bottom",
            "horizontal-position": "center"
          },
          "fade-in": 0.5,
          "fade-out": 0.5,
          "z-index": 10
        }
      ]
    },
    {
      "transition": {
        "style": "fade",
        "duration": 1
      },
      "elements": [
        {
          "type": "video",
          "src": "https://example.com/video2.mp4", 
          "start": 0,
          "duration": -1
        },
        {
          "type": "text",
          "text": "Second Section",
          "start": 0.5,
          "duration": 4,
          "style": "002",
          "position": "top-right",
          "x": 50,
          "y": 50,
          "settings": {
            "font-family": "Arial",
            "font-size": "24px",
            "font-weight": "700",
            "font-color": "#FFD700",
            "text-align": "right",
            "vertical-position": "top",
            "horizontal-position": "right"
          },
          "z-index": 15
        }
      ]
    }
  ]
}
```

> **Important**: Do not use a `videos` array at the movie level - this is not supported by the API.

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

## Text Element Best Practices

### Subtitle Creation
1. **Use consistent styling**: Define a common font family, size, and color scheme
2. **Position for readability**: Bottom-center with sufficient contrast
3. **Time appropriately**: Start slightly after speech begins, end before it finishes
4. **Layer properly**: Use z-index 10+ to ensure text appears above video content

### Multi-language Support
1. **Font selection**: Use fonts that support your target languages (e.g., Noto Sans for international text)
2. **Text length**: Account for text expansion in different languages
3. **Reading speed**: Adjust duration based on language reading patterns

### Animation and Effects
1. **Subtle animations**: Use fade-in/out (0.3-0.5s) for professional look
2. **Consistent timing**: Maintain uniform fade timings across all text elements
3. **Avoid overuse**: Use text animations sparingly to maintain focus on content

### Performance Optimization
1. **Minimal text elements**: Combine related text when possible
2. **Efficient positioning**: Use position presets instead of custom coordinates when possible
3. **Cache management**: Use cache: true for repeated text styles

## Best Practices

1. Always include the core required properties (`fps`, `width`, `height`, `scenes`)
2. For complex video projects, build the full JSON template with all scenes and elements
3. Use override parameters for values that might change frequently between runs
4. For element positioning, use named positions like "center-center" instead of coordinates when possible
5. If precise positioning is needed, set `position: "custom"` and specify x/y coordinates
6. Use appropriate duration values:
   - `-1` for using media file's actual duration
   - `-2` for matching container duration  
   - Positive numbers for explicit control
7. Avoid using properties like `padding_color` or `horizontal_position` at the top level of the movie object
8. When referencing data from previous nodes, use expressions in the JSON template
9. For video merging, create separate scenes rather than using a `videos` array
10. Test with publicly accessible media URLs to avoid duration detection issues
11. For text elements, ensure proper contrast and readability
12. Use z-index values to control layering of overlapping elements

## Troubleshooting Duration Issues

If you encounter "Movie duration cannot be zero" errors:

1. **Use explicit durations**: Instead of `-1` or `-2`, use positive values (e.g., `"duration": 10`)
2. **Check media accessibility**: Ensure video/audio URLs are publicly accessible
3. **Verify file formats**: Use standard formats (MP4, H.264 for video; MP3, WAV for audio)
4. **Test different hosting**: Some CDNs work better with JSON2Video's duration detection
5. **Omit duration property**: Let the API determine duration automatically

## Text Element Validation

Text elements are validated for:

- **Required content**: Text field cannot be empty
- **Color format**: Colors must be valid hex codes (e.g., "#FFFFFF")
- **Numeric ranges**: All numeric properties must be within specified ranges
- **Enum values**: Position, alignment, and style values must be from predefined lists

Common validation errors and solutions:

- **"Text content is required"**: Ensure the text field is not empty or whitespace-only
- **"Invalid hex color"**: Use proper format like "#FF0000" instead of "red" or invalid codes
- **"Value out of range"**: Check that numeric values are within documented limits
- **"Invalid position value"**: Use predefined position values or "custom" for coordinates

## API Documentation

For the complete and most up-to-date API reference, see the [official JSON2Video API documentation](https://json2video.com/docs/v2/).