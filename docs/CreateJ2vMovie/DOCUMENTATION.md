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

Combines multiple video files into a single video, with options for adding subtitles.

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

## Credentials

This node requires JSON2Video API credentials, which can be obtained from [JSON2Video](https://json2video.com).