# JSON2Video API JSON Schema Documentation (Updated)

This document defines the authoritative JSON schema for the JSON2Video API. It reflects the API's actual structure, parameter names, types, defaults, and restrictions. Use this as the single source of truth for development, testing, and processor validation.

---

## Top-Level Movie Object

```json
{
  "id": "string",                 // Optional: Unique identifier
  "fps": number,                  // Required: Frames per second
  "width": number,                // Required: Output width (px)
  "height": number,               // Required: Output height (px)
  "quality": "low|medium|high",   // Optional: Output quality
  "resolution": "full-hd|hd|4k|custom", // Optional preset resolution
  "cache": boolean,               // Optional: Force refresh
  "draft": boolean,               // Optional: Draft rendering
  "webhook": "string",            // Optional: URL for notifications
  "elements": [ ... ],            // Optional: Movie-level elements (e.g. subtitles, text, audio)
  "scenes": [ ... ]               // Required: Array of scenes
}
```

### Notes

* `elements` at the movie level apply globally (e.g. subtitles, background music, banners).
* `subtitles` element **can only appear here**.

---

## Scene Object

```json
{
  "background-color": "#000000",   // Optional background color
  "duration": number,              // Duration in seconds (-1 auto, -2 match container)
  "transition": {                  // Optional transition effect
    "style": "fade|wiperight|wipeleft|wipeup|wipedown|dissolve",
    "duration": number
  },
  "elements": [ ... ],             // Scene-level elements
  "cache": boolean                 // Optional: force refresh rendering
}
```

---

## Common Element Properties

All elements share these common properties:

```json
{
  "id": "string",                 // Unique identifier
  "condition": "expression",      // Conditional rendering
  "variables": { ... },            // Local variables
  "comment": "string",            // Internal notes
  "duration": number,              // Length of element (-1 intrinsic, -2 match container)
  "start": number,                 // Start time in seconds
  "extra-time": number,            // Additional trailing time
  "z-index": number,               // Stacking order (-99 to 99)
  "cache": boolean,                // Force re-render
  "fade-in": number,               // Fade in seconds
  "fade-out": number               // Fade out seconds
}
```

---

## Element Types

### 1. Video Element

```json
{
  "type": "video",
  "src": "https://example.com/video.mp4", // Required
  "start": 0,
  "duration": -1,                        // -1 full length, -2 match container
  "seek": 0,                             // NEW: Start offset within the file
  "volume": 1.0,
  "muted": false,
  "speed": 1.0,
  "loop": -1,                            // -1 infinite, positive = repeat count
  "crop": false,
  "fit": "cover|contain|fill|fit",
  "zoom": 0
}
```

### 2. Audio Element

```json
{
  "type": "audio",
  "src": "https://example.com/audio.mp3",
  "start": 0,
  "duration": -1,
  "volume": 0.8,
  "loop": false,
  "fade-in": 1.0,
  "fade-out": 1.0
}
```

### 3. Image Element

```json
{
  "type": "image",
  "src": "https://example.com/image.jpg",
  "start": 0,
  "duration": 5,
  "position": "top-left|top-center|top-right|center-left|center-center|center-right|bottom-left|bottom-center|bottom-right|custom",
  "x": 0,
  "y": 0,
  "scale": { "width": 0, "height": 0 },
  "zoom": 0,
  "rotate": { "angle": 0, "speed": 0 },
  "opacity": 1.0
}
```

### 4. Text Element

```json
{
  "type": "text",
  "text": "Your text content",
  "start": 0,
  "duration": 5,
  "style": "001|002|003|004",
  "position": "bottom-left|bottom-center|bottom-right|center-center|custom",
  "x": 0,
  "y": 0,
  "z-index": 10,
  "settings": {
    "font-family": "Roboto",
    "font-size": "32px",
    "font-weight": "600",
    "font-color": "#FFFFFF",
    "background-color": "rgba(0,0,0,0.7)",
    "text-align": "center",
    "vertical-position": "bottom",
    "horizontal-position": "center"
  }
}
```

### 5. Voice Element

```json
{
  "type": "voice",
  "text": "Hello world",
  "voice": "en-US-AriaNeural",
  "start": 0,
  "volume": 1.0,
  "rate": 1.0,
  "pitch": 1.0
}
```

### 6. Subtitles Element (Movie-Level Only)

```json
{
  "type": "subtitles",
  "captions": "https://example.com/subtitles.srt", // or auto-generate from audio
  "language": "en",                               // ISO code
  "model": "default|whisper|...",                // API-supported model
  "settings": {
    "style": "classic|modern",
    "all-caps": false,
    "position": "bottom-center",
    "font-size": 16,
    "font-family": "Arial"
  }
}
```

---

## Key Schema Notes

1. **Subtitles** must be at movie level, not in scenes.
2. **Property names** use kebab-case (API-accurate). n8n processors handle camelCase → kebab-case conversion.
3. **Defaults**: If omitted, API applies its own defaults (e.g. `loop = -1` for video).
4. **Duration values**: `-1` = intrinsic length, `-2` = match container.

---

## Action Items

* ✅ Update `JSON_SCHEMA.md` to this version.
* 🔲 Adjust processors/builders to:

  * Support `video.seek`.
  * Support root-level `language` and `model` in subtitles.
  * Enforce movie-level restriction for subtitles.
* 🔲 Add schema validation tests for each element type.
* 🔲 Update documentation (`DOCUMENTATION.md`) to explain camelCase UI vs kebab-case API mapping.
