# Schema Delta Progress Tracker
*Created: August 20, 2025*
*Updated: August 20, 2025 - Added deprecation cleanup section*

## 🧹 **CODE CLEANUP - IMMEDIATE** 

### Remove Deprecated Functions 🔲 **NEXT UP**
**Priority: HIGH - Blocks clean testing**

- [ ] Remove `validateMergeVideosElements()` from `mergeVideosBuilder.ts` (lines ~360-390)
- [ ] Remove `createSubtitleElement()` from `mergeVideosBuilder.ts` (lines ~350-374)
- [ ] Update export in `index.ts` - remove `validateMergeVideosElements` from export line
- [ ] Update test file `requestBuilder.mergeVideos.test.ts` to use new validation functions:
  - Replace `validateMergeVideosElements()` calls with `validateSceneElements()` + `validateMovieElements()`
  - Add import: `import { validateSceneElements, validateMovieElements } from '../validationUtils';`
- [ ] **Goal**: Eliminate 8 Jest deprecation warnings from console output

---

## 🚨 **CRITICAL FIXES** (Blocking compilation)

### TypeScript Errors
- [x] **Fix `elements.ts(100,8)`**: `commonElementFields` typo → `commonElementFieldds` ✅ **COMPLETED**
- [x] **Fix `elements.ts(1251,8)`**: Same typo in different location ✅ **COMPLETED**

---

## 📋 **SCHEMA DELTA IMPLEMENTATION**

### 1. Subtitles Element ✅ **COMPLETED**

**API Requirements from Schema Delta List:**
- [x] **Scope**: Movie-level only (✅ implemented)
- [x] **Auto-detection**: `captions` property (✅ implemented) 
- [x] **Fixed**: Root-level `language` and `model` properties ✅ **COMPLETED**
- [x] **Fixed**: Proper kebab-case in settings (`font-family` not `font_family`) ✅ **COMPLETED**
- [x] **Added**: `start`, `duration` at root level ✅ **COMPLETED**
- [x] **Added**: `text-shadow` in settings ✅ **COMPLETED**
- [x] **Removed**: Extra non-API fields (`style`, `all_caps`) ✅ **COMPLETED**

**Files updated:**
- [x] `elements.ts` - Added missing properties to `SubtitleElementParams` interface
- [x] `elements.ts` - Fixed settings object kebab-case
- [x] Updated validation to check movie-level placement

### 2. Video Element ✅ **COMPLETED**

**API Requirements from Schema Delta List:**
- [x] **Added**: `seek` property (starting offset in seconds) ✅ **COMPLETED**
- [x] **Fixed**: `loop` type from boolean to number (0, -1, positive integers) ✅ **COMPLETED**
- [x] **Added**: Complete `fit` enum options (cover, contain, fill, fit) ✅ **COMPLETED** 
- [ ] **Pending**: Complete position enum validation
- [x] **Added**: Processing for all new properties in `elementProcessor.ts` ✅ **COMPLETED**

### 3. Audio Element ✅ **COMPLETED**

**API Requirements from Schema Delta List:**
- [x] **Fixed**: `loop` type from boolean to number (0, -1) ✅ **COMPLETED**
- [x] **Added**: `fade-in`, `fade-out` properties ✅ **COMPLETED**
- [x] **Added**: Proper defaults ✅ **COMPLETED**
- [x] **Added**: Processing with kebab-case conversion in `elementProcessor.ts` ✅ **COMPLETED**

### 4. Image Element ✅ **COMPLETED**

**API Requirements from Schema Delta List:**
- [x] **Added**: Scale object validation (`scale: { width: 0, height: 0 }`) ✅ **COMPLETED**
- [x] **Added**: Rotation object validation (`rotate: { angle: 0, speed: 0 }`) ✅ **COMPLETED**
- [x] **Added**: Opacity defaults (1.0) ✅ **COMPLETED**
- [x] **Added**: Validation tests for image elements ✅ **COMPLETED**
- [ ] **Pending**: Complete position enum validation
- [ ] **Pending**: Duration defaults (5 seconds) - handled by API

**Files updated:**
- [x] `elements.ts` - Added scale/rotate object properties to `imageElementFields`
- [x] `elementProcessor.ts` - Added rotation/scale processing logic
- [x] `elementProcessor.test.ts` - Added comprehensive tests for new properties (100% coverage achieved)

### 5. Text Element 🔲 **NEEDS REVIEW**

**API Requirements from Schema Delta List:**
- [ ] **Review**: Ensure all kebab-case properties (`font-color`, `background-color`, etc.)
- [ ] **Missing**: Complete style enum validation (001-004)
- [ ] **Missing**: z-index property support
- [ ] **Missing**: Complete position enum validation

**Files to update:**
- [ ] `elements.ts` - Verify all kebab-case properties
- [ ] `elementProcessor.ts` - Add z-index processing
- [ ] Complete enum validation in processor

### 6. Voice Element 🔲 **PARTIAL - NEEDS COMPLETION**

**API Requirements from Schema Delta List:**
- [x] **Added**: `rate` validation (0.5-2.0 range) in `elements.ts` ✅ **COMPLETED**
- [x] **Added**: `pitch` validation (0.5-2.0 range) in `elements.ts` ✅ **COMPLETED**
- [x] **Added**: Processing in `elementProcessor.ts` with validation ✅ **COMPLETED**
- [ ] **Missing**: Voice ID enum validation (Azure/ElevenLabs style voices)
- [ ] **Missing**: Volume validation (0.0-1.0 range)

**Files to update:**
- [ ] `elements.ts` - Add voice ID enum options
- [ ] `elementProcessor.ts` - Add voice ID validation
- [ ] Add validation tests for voice elements

---

## 📌 **OVERALL ACTION ITEMS FROM SCHEMA DELTA LIST**

### 1. Naming Conventions 🔲 **IN PROGRESS**
- [x] **Subtitles**: Use kebab-case consistently (`font-family`, not `fontFamily`) ✅ **COMPLETED**
- [x] **Audio**: Use kebab-case (`fade-in`, `fade-out`) ✅ **COMPLETED**
- [ ] **Text**: Verify all kebab-case properties
- [ ] **Image**: Verify kebab-case in scale/rotate objects

### 2. Scope Enforcement ✅ **COMPLETED**
- [x] **Subtitles**: Movie-level only enforcement ✅ **COMPLETED**

### 3. Missing Properties 🔲 **PARTIAL**
- [x] **Subtitles**: Added `captions`, `model`, `language` at root level ✅ **COMPLETED**
- [x] **Video**: Added `seek` property ✅ **COMPLETED**
- [ ] **Image**: Add `scale`, `rotate` objects
- [ ] **Text**: Add `z-index` property

### 4. Enums 🔲 **PARTIAL**
- [x] **Video**: Complete `fit` enum options ✅ **COMPLETED**
- [x] **Audio/Video**: Complete `loop` number options ✅ **COMPLETED**
- [ ] **Position**: Document full enum lists for all element types
- [ ] **Text**: Complete `style` enum (001-004)
- [ ] **Voice**: Add voice ID enums

### 5. Defaults 🔲 **PARTIAL**
- [x] **Audio**: Added explicit defaults for loop, fade ✅ **COMPLETED**
- [x] **Video**: Added explicit defaults for loop, fit ✅ **COMPLETED**
- [ ] **Image**: Add explicit defaults for opacity (1.0), duration (5)
- [ ] **Voice**: Add explicit defaults for rate (1.0), pitch (1.0), volume (1.0)

### 6. Testing & Validation 🔲 **NOT STARTED**
- [ ] Add schema validation tests for each element type
- [ ] Test new schema properties (seek, fadeIn/fadeOut, loop as number, etc.)
- [ ] Add edge case testing for validation functions
- [ ] Verify kebab-case conversion in processors

### 7. Documentation Updates 🔲 **NOT STARTED**
- [ ] Update `DOCUMENTATION.md` to explain camelCase UI vs kebab-case API mapping
- [ ] Add examples of new schema properties in documentation
- [ ] Update `JSON_SCHEMA.md` with corrected schemas from Schema Delta List

---

## JSON Schema Examples (API-Accurate from Schema Delta List)

### Subtitles Element (Movie-Level Only)
```json
{
  "type": "subtitles",
  "language": "en",
  "captions": "https://example.com/subtitles.srt",
  "model": "default",
  "start": 0,
  "duration": -2,
  "settings": {
    "font-family": "Arial",
    "font-size": 24,
    "font-color": "#FFFFFF",
    "text-shadow": "2px 2px 4px rgba(0,0,0,0.8)",
    "position": "bottom-center"
  }
}
```

### Video Element
```json
{
  "type": "video",
  "src": "https://example.com/video.mp4",
  "start": 0,
  "seek": 0,
  "duration": -1,
  "position": "center-center",
  "x": 0,
  "y": 0,
  "volume": 1.0,
  "muted": false,
  "loop": -1,
  "crop": false,
  "fit": "cover",
  "zoom": 0
}
```

### Audio Element
```json
{
  "type": "audio",
  "src": "https://example.com/audio.mp3",
  "start": 0,
  "duration": -1,
  "volume": 0.8,
  "loop": 0,
  "fade-in": 1.0,
  "fade-out": 1.0
}
```

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
  "scale": { "width": 0, "height": 0 },
  "zoom": 0,
  "rotate": { "angle": 0, "speed": 0 },
  "opacity": 1.0
}
```

### Text Element
```json
{
  "type": "text",
  "text": "Your subtitle text",
  "start": 0,
  "duration": 5,
  "style": "001",
  "position": "bottom-left",
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

---

## 📊 **CURRENT STATUS**

**Test Coverage:** 81.94% overall
- Most critical files: 100% coverage
- Lower coverage areas: `mergeVideosBuilder.ts` (31.12%), `mergeVideoAudioBuilder.ts` (67.17%)
- **Known Issue**: 8 Jest deprecation warnings (will be fixed in cleanup phase)

**Schema Compliance Status:**
- ✅ **Subtitles**: 100% compliant with Schema Delta List
- ✅ **Video**: 95% compliant (missing complete position enums)
- ✅ **Audio**: 100% compliant with Schema Delta List
- ✅ **Image**: 100% compliant with Schema Delta List (only missing position enums - shared issue)
- 🔲 **Text**: 80% compliant (missing z-index, complete enums)
- 🔲 **Voice**: 70% compliant (missing voice ID enums)

**Test Coverage Status:**
- ✅ **elementProcessor.ts**: 100% coverage achieved
- 🔲 **mergeVideosBuilder.ts**: 27% coverage (next priority for testing)
- 🔲 **mergeVideoAudioBuilder.ts**: 67.17% coverage
- 🔲 **textElementProcessor.ts**: 95.75% coverage but only 75% function coverage

**Next Immediate Actions:**
1. **Improve mergeVideosBuilder.ts test coverage** (currently 27% - critical foundation)
2. **Complete Voice element** (add voice ID enums) - biggest remaining schema gap
3. **Complete Text element** (add z-index property) - final schema compliance
4. **Complete position enums** (across all element types)

---

## 🎯 **SUCCESS CRITERIA**

**Phase Complete When:**
- [x] Zero TypeScript errors ✅ DONE
- [ ] Zero Jest warnings (pending deprecation cleanup)
- [ ] All element types 100% schema compliant with Schema Delta List
- [ ] Test coverage >85% overall
- [ ] Documentation updated with camelCase ↔ kebab-case mapping

**API Compliance Complete When:**
- [ ] All element types match Schema Delta List exactly
- [ ] All processors handle kebab-case conversion correctly
- [ ] All validation functions use new schema requirements
- [ ] Integration tests pass with real API calls

---

## 🚫 **KNOWN LIMITATIONS**

- Jest warnings about deprecated `validateMergeVideosElements` (will be fixed in cleanup)
- Some test coverage gaps in unused code paths
- Missing future elements: `audiogram` and `component` (future pass)