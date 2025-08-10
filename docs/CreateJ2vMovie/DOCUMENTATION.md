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

Combines multiple video files into a single video by creating separate scenes for each video, with optional transitions between scenes.

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

When merging videos, each video becomes a separate scene in the final movie:

```json
{
  "scenes": [
    {
      "elements": [
        {
          "type": "video",
          "src": "https://example.com/video1.mp4",
          "duration": -1
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
          "duration": -1
        }
      ]
    }
  ]
}
```

## Known Issues & Troubleshooting

### Recent Fixes (August 2025)

The JSON2Video node has been updated to resolve API compatibility issues:

- **Fixed TypeError toLowerCase function**: Corrected API response handling to prevent type errors
- **Data Type Conversions**: Implemented proper conversions between UI and API formats:
  - `loop` parameter: UI boolean → API number (1 = play once, -1 = infinite loop)
  - `crop` parameter: UI boolean → API resize mode ("cover" for crop, "contain" for fit)  
  - `muted` parameter: Proper boolean conversion for API requirements
- **API Response Handling**: Fixed array casting issues in response processing
- **Duration Handling**: Fixed duration parameter handling to preserve exact values (-1, -2, positive numbers)
- **Video Merging Structure**: Fixed merge videos operation to use proper scene-based structure instead of invalid `videos` array

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

## Architecture

The node has been refactored into a modular structure for better maintainability:

### Utility Files

- **`requestBuilder.ts`**: Handles request body construction for all operations
- **`elementProcessor.ts`**: Processes individual elements based on their type
- **`webhookUtils.ts`**: Manages webhook functionality and validation
- **`positionUtils.ts`**: Handles element positioning calculations
- **`imageUtils.ts`**: Image dimension detection utilities

### Templates

- **`templates/createMovie.json`**: Default template for create movie operation
- **`templates/mergeVideoAudio.json`**: Default template for video/audio merging
- **`templates/mergeVideos.json`**: Default template for video merging

### Shared Components

- **`operations/shared/commonParams.ts`**: Common parameters across operations
- **`operations/shared/elements.ts`**: Shared element definitions

## Credentials

This node requires JSON2Video API credentials, which can be obtained from [JSON2Video](https://json2video.com).

## API Documentation

For complete API reference, see the [official JSON2Video API documentation](https://json2video.com/docs/v2/).