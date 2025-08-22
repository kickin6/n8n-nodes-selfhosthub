# JSON2Video Node Documentation

The JSON2Video node allows you to create, merge, and manipulate videos using the JSON2Video API service.

## Operations

The node supports the following operations:

### Create Video

Creates a video using either Basic Mode or Advanced Mode:

- **Basic Mode**: Configure elements individually using a user-friendly interface
- **Advanced Mode**: Use a JSON template with optional override parameters

### Merge Video & Audio

Combines a video file with an audio file, with options for adding subtitles.

### Merge Videos

Combines multiple video files into a single video by creating separate scenes for each video, with optional transitions between scenes and support for both scene-level and movie-level elements.

#### Movie-Level Elements

The Merge Videos operation now supports **Movie Elements** that appear across all scenes in the merged video:

- **Text Elements**: Global text overlays using the same configuration as scene-level text
- **Subtitle Elements**: Global subtitle tracks with language support and auto-detection
- **Positioning**: Movie-level elements appear consistently across all video scenes
- **Timing Control**: Independent timing control from scene transitions

#### Scene-Level Text Elements (Subtitles)

The Merge Videos operation also supports adding text elements to individual scenes for subtitles, captions, and text overlays:

- **Font settings**: Family, size, weight, color, background color
- **Text positioning**: Canvas position presets (top-left, bottom-center, etc.) or custom coordinates
- **Text canvas alignment**: Vertical (top/center/bottom) and horizontal (left/center/right) positioning within the text canvas
- **Timing controls**: Start time, duration, fade in/out effects
- **Advanced effects**: Z-index layering, animations (pan, zoom, rotation), visual corrections (brightness, contrast, etc.)
- **Animation styles**: Basic, word-by-word, character-by-character, jumping letters

#### Subtitle Auto-Detection

Movie-level subtitle elements feature intelligent content detection:

- **URL Detection**: Captions starting with 'http' are treated as subtitle file URLs (SRT, VTT, ASS)
- **Inline Content**: Non-URL captions are treated as inline subtitle text content
- **Language Support**: Full language selection with ISO language codes
- **Flexible Input**: Users can provide either file references or direct subtitle content

**Example use cases:**
- Adding global subtitles to an entire merged video sequence
- Creating scene-specific captions for individual video clips
- Adding branded text overlays that appear throughout the video
- Combining external subtitle files with inline text overlays
- Creating multilingual support with multiple subtitle tracks

### Check Status

Checks the status of a previously submitted job.

## Advanced Mode

In Advanced Mode, you provide a JSON template that follows the [JSON2Video API schema](JSON_SCHEMA.md). The following parameters are always required and will override any values in your JSON template:

- Record ID
- Output Width
- Output Height
- Framerate

Additional override parameters are available under the "Override Parameters" section, allowing you to modify specific aspects of the JSON template without editing the JSON directly.

## Basic Mode

In Basic Mode, you configure video elements using a user-friendly interface:

1. Add elements (images, videos, text, audio, voice, subtitles)
2. Configure properties for each element
3. Set global parameters like width, height, etc.

For detailed information about the JSON schema used in Advanced Mode, see the [JSON Schema Documentation](JSON_SCHEMA.md).

## Duration Values

The JSON2Video API supports special duration values for automatic duration handling:

- **Positive numbers** (e.g., `5`, `10.5`): Explicit duration in seconds
- **`-1`**: Automatically set duration based on the intrinsic length of the asset file (video/audio file's actual duration)
- **`-2`**: Set duration to match the parent container (scene or movie duration)
- **No duration specified**: Let the API determine the appropriate duration

### Duration Best Practices

1. **For explicit control**: Use positive duration values (e.g., `duration: 10` for 10 seconds)
2. **For full media duration**: Use `duration: -1` to use the full length of video/audio files
3. **For container matching**: Use `duration: -2` to match scene or movie duration
4. **For API auto-detection**: Omit the duration property entirely

## Video Merging

When merging videos, each video becomes a separate scene in the final movie. The operation supports both scene-level and movie-level elements:

### Scene-Level Elements
Elements added to individual scenes, appearing only during that specific video:

```json
{
  "scenes": [
    {
      "elements": [
        {
          "type": "video",
          "src": "https://example.com/video1.mp4",
          "duration": -1
        },
        {
          "type": "text",
          "text": "Scene 1 subtitle",
          "start": 2,
          "duration": 3,
          "style": "001",
          "position": "bottom-left",
          "settings": {
            "font-family": "Roboto",
            "font-size": "32px",
            "font-color": "#FFFFFF",
            "background-color": "rgba(0,0,0,0.7)",
            "vertical-position": "bottom",
            "horizontal-position": "center"
          }
        }
      ]
    }
  ]
}
```

### Movie-Level Elements
Elements that appear across all scenes in the merged video:

```json
{
  "elements": [
    {
      "type": "text",
      "text": "Global Title",
      "start": 0,
      "duration": -2,
      "style": "001",
      "position": "top-center",
      "settings": {
        "font-family": "Arial",
        "font-size": "36px",
        "font-color": "#FFD700",
        "font-weight": "bold"
      }
    },
    {
      "type": "subtitles",
      "src": "https://example.com/subtitles.srt",
      "language": "en"
    }
  ],
  "scenes": [
    // Individual video scenes...
  ]
}
```

## Known Issues & Troubleshooting

### Recent Fixes (August 2025)

The JSON2Video node has been updated to resolve API compatibility issues:

- **Movie-Level Elements**: Added support for global elements in mergeVideos operation
- **Subtitle Auto-Detection**: Implemented intelligent content detection for URL vs inline subtitles
- **Fixed TypeError toLowerCase function**: Corrected API response handling to prevent type errors
- **Data Type Conversions**: Implemented proper conversions between UI and API formats:
  - `loop` parameter: UI boolean → API number (1 = play once, -1 = infinite loop)
  - `crop` parameter: UI boolean → API resize mode ("cover" for crop, "contain" for fit)  
  - `muted` parameter: Proper boolean conversion for API requirements
- **API Response Handling**: Fixed array casting issues in response processing
- **Duration Handling**: Fixed duration parameter handling to preserve exact values (-1, -2, positive numbers)
- **Video Merging Structure**: Fixed merge videos operation to use proper scene-based structure instead of invalid `videos` array
- **Text Elements Support**: Added comprehensive text element support for subtitles and captions in merge videos operation

### Common Issues

- **Movie duration cannot be zero**: 
  - Ensure video URLs are publicly accessible
  - Use explicit positive durations if auto-detection fails
  - Verify video file formats are supported (MP4 with H.264 recommended)
  - Avoid using `-1` or `-2` if the API cannot access the media files

- **URL Access Errors (403)**: Ensure media URLs are publicly accessible from JSON2Video's servers

- **Format Compatibility**: Verify that media file formats are supported by JSON2Video

- **Duration Detection Issues**: If using `-1` fails, try:
  1. Using explicit positive durations (e.g., `duration: 10`)
  2. Using different video hosting services
  3. Ensuring videos are in standard formats (MP4, H.264)

- **Text Element Validation Errors**: Ensure text elements have:
  - Non-empty text content
  - Valid hex color codes (e.g., `#FFFFFF`)
  - Numeric values within specified ranges
  - Valid position and alignment options

## Architecture

The node has been refactored into a modular structure for better maintainability:

### Utility Files

- **`requestBuilder/`**: Handles request body construction for all operations
  - `createMovieBuilder.ts`: Create movie operation request building
  - `mergeVideoAudioBuilder.ts`: Video/audio merge operation request building
  - `mergeVideosBuilder.ts`: Video merge operation with movie-level and scene-level element support
  - `advanced.ts`: Advanced mode JSON template processing
  - `shared.ts`: Shared utilities across request builders
- **`elementProcessor.ts`**: Processes individual elements based on their type
- **`textElementProcessor.ts`**: Processes and validates text elements for subtitle functionality
- **`webhookUtils.ts`**: Manages webhook functionality and validation
- **`positionUtils.ts`**: Handles element positioning calculations

### Operation Files

- **`createMovieOperation.ts`**: Parameter definitions for create movie operation
- **`mergeVideoAudioOperation.ts`**: Parameter definitions for video/audio merging
- **`mergeVideosOperation.ts`**: Parameter definitions for video merging with movie-level element support

### Templates

- **`templates/createMovie.json`**: Default template for create movie operation
- **`templates/mergeVideoAudio.json`**: Default template for video/audio merging
- **`templates/mergeVideos.json`**: Default template for video merging

### Shared Components

- **`operations/shared/commonParams.ts`**: Common parameters across operations
- **`operations/shared/elements.ts`**: Shared element definitions including text element interfaces and types

## Text Element Configuration

When adding text elements to videos, you can configure:

### Basic Properties
- **Text Content**: The actual text to display
- **Style**: Animation style (001-004 for different text reveal effects)
- **Start Time**: When the text appears (in seconds)
- **Duration**: How long the text is visible (-2 = match container, -1 = auto, positive = explicit seconds)

### Font Settings
- **Font Family**: Google Fonts (Roboto, Arial, etc.) or custom font URLs
- **Font Size**: Size with units (e.g., "32px", "2em")
- **Font Weight**: 300 (light) to 800 (extra bold)
- **Font Color**: Hex color code (e.g., "#FFFFFF")
- **Background Color**: Background behind text (hex or rgba)
- **Text Alignment**: left, center, right, justify

### Positioning
- **Canvas Position**: Predefined positions (top-left, bottom-center, etc.) or custom coordinates
- **Text Canvas Alignment**: How text aligns within its canvas area
  - Vertical: top, center, bottom
  - Horizontal: left, center, right
- **Z-Index**: Layering order (-99 to 99, higher values appear on top)

### Effects
- **Fade In/Out**: Transition duration in seconds
- **Animations**: Pan, zoom, rotation effects
- **Visual Corrections**: Brightness, contrast, gamma, saturation adjustments
- **Chroma Key**: Green screen effects for transparency

## Movie-Level vs Scene-Level Elements

### When to Use Movie-Level Elements
- **Global branding**: Logos, watermarks, or titles that should appear throughout
- **Continuous subtitles**: Subtitle tracks that span multiple video segments
- **Background elements**: Elements that provide context across all scenes

### When to Use Scene-Level Elements
- **Scene-specific content**: Text or graphics relevant to individual videos
- **Timing-sensitive elements**: Elements that need precise timing within specific scenes
- **Dynamic content**: Elements that change between different video segments

## Credentials

This node requires JSON2Video API credentials, which can be obtained from [JSON2Video](https://json2video.com).

## API Documentation

For complete API reference, see the [official JSON2Video API documentation](https://json2video.com/docs/v2/).