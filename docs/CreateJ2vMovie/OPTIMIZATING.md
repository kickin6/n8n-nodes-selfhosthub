# JSON2Video API Optimization & Mastering Guide

This guide covers advanced techniques for optimizing performance and mastering complex video creation workflows with the JSON2Video API.

---

## Duration and Timing Mastery

### Understanding Duration Hierarchy

The JSON2Video API calculates durations hierarchically:

1. **Movie Duration**: Cannot be set directly - calculated from scenes and movie-level elements
2. **Scene Duration**: Can be explicit or auto-calculated from contained elements
3. **Element Duration**: Can be explicit, intrinsic (-1), or container-matched (-2)

### Duration Calculation Rules

#### Movie Duration
```json
// Movie duration = max(all scene durations, longest movie-level element)
{
  "elements": [
    {"type": "audio", "duration": 30}  // Movie-level background music
  ],
  "scenes": [
    {"duration": 20},  // Scene 1: 20 seconds
    {"duration": 25}   // Scene 2: 25 seconds
  ]
}
// Result: Movie duration = 30 seconds (longest element)
```

#### Scene Duration Priority
1. **Explicit duration** overrides element durations
2. **Auto-calculated** (`duration: -1`) accommodates all elements
3. **Elements beyond scene duration** get trimmed

```json
// Example: Scene duration overrides element duration
{
  "duration": 10,  // Scene limited to 10 seconds
  "elements": [
    {
      "type": "video",
      "src": "long-video.mp4",
      "duration": 30  // Will be trimmed to 10 seconds
    }
  ]
}
```

#### Element Duration Options
- **Positive numbers**: `"duration": 15` (15 seconds exactly)
- **-1**: `"duration": -1` (use asset's intrinsic length)
- **-2**: `"duration": -2` (match parent container duration)

### Looping Elements Strategy

When using infinite loops (`loop: -1`), always set `duration: -2`:

```json
{
  "scenes": [
    {
      "duration": 60,  // Scene: 1 minute
      "elements": [
        {
          "type": "video",
          "src": "short-loop.mp4",  // 5-second video
          "loop": -1,               // Loop forever
          "duration": -2            // Match scene duration (60s)
        }
      ]
    }
  ]
}
```

**Result**: 5-second video loops 12 times over 60 seconds.

---

## Layering and Z-Index Management

### Default Layering Rules

1. **Array Order**: Later elements in `elements` array appear on top
2. **Movie vs Scene**: Movie elements always render above scene elements
3. **Z-Index Override**: Explicit `z-index` values override array order

### Layering Examples

#### Basic Array-Order Layering
```json
{
  "elements": [
    {
      "type": "image",
      "src": "background.jpg"  // Bottom layer
    },
    {
      "type": "text",
      "text": "Overlay Text"     // Top layer
    }
  ]
}
```

#### Z-Index Override
```json
{
  "elements": [
    {
      "type": "text",
      "text": "Front Text",
      "z-index": 10          // Will appear on top
    },
    {
      "type": "image", 
      "src": "background.jpg",
      "z-index": -1          // Will appear behind
    }
  ]
}
```

#### Transparent Scenes with Video Backgrounds
```json
{
  "elements": [
    {
      "type": "video",
      "src": "background-video.mp4",
      "z-index": -10         // Behind all scenes
    }
  ],
  "scenes": [
    {
      "background-color": "transparent",  // See through to video
      "elements": [
        {
          "type": "text",
          "text": "Scene 1 Content"
        }
      ]
    }
  ]
}
```

---

## Advanced Positioning Techniques

### Two-Layer Positioning System

Text and Component elements use a two-layer positioning approach:

#### Layer 1: Element Canvas
Positioned using standard properties:
- `position`: "top-left", "center-center", "custom"
- `x`, `y`: Pixel coordinates (when position="custom")  
- `width`, `height`: Canvas dimensions

#### Layer 2: Content Alignment
Content aligned within canvas using `settings`:
- `vertical-position`: "top", "center", "bottom"
- `horizontal-position`: "left", "center", "right"

### Positioning Examples

#### Predefined Positions
```json
{
  "type": "text",
  "text": "Top Right Corner",
  "position": "top-right"  // 5% margin from edges
}
```

#### Custom Coordinates
```json
{
  "type": "image",
  "src": "logo.png",
  "position": "custom",
  "x": 100,              // 100px from left
  "y": 50               // 50px from top
}
```

#### Dynamic Text Positioning
```json
{
  "type": "text",
  "text": "Dynamic Length Title That Could Vary",
  "position": "custom",
  "x": 200,
  "y": 100,
  "width": 400,          // Canvas: 400px wide
  "settings": {
    "horizontal-position": "center",  // Center text in 400px canvas
    "vertical-position": "bottom"     // Align to bottom of canvas
  }
}
```

**Benefit**: Text stays consistently positioned regardless of content length.

---

## Caching System Optimization

### Cache Hierarchy

The caching system operates at three levels:

1. **Movie Level**: `"cache": false` rebuilds entire movie
2. **Scene Level**: `"cache": false` rebuilds specific scene
3. **Element Level**: `"cache": false` re-downloads/re-renders element

### Cache Propagation Rules

- **Element cache refresh** → Triggers scene rebuild
- **Scene cache refresh** → Uses cached elements (unless they're also refreshed)
- **Movie cache refresh** → Rebuilds using cached scenes/elements

### Strategic Cache Control

#### Force Asset Re-download
```json
{
  "type": "image",
  "src": "https://dynamic-api.com/generated-image.jpg",
  "cache": false  // Always fetch fresh image
}
```

#### Selective Scene Refresh
```json
{
  "scenes": [
    {
      "comment": "Static intro - use cache",
      "cache": true,
      "elements": [...]
    },
    {
      "comment": "Dynamic content - refresh",
      "cache": false,
      "elements": [...]
    }
  ]
}
```

---

## Variables and Expression System

### Variable Scope Hierarchy

1. **Element Variables**: Highest priority (element-specific)
2. **Scene Variables**: Override movie variables within scene
3. **Movie Variables**: Global defaults

### Expression Capabilities

#### Arithmetic Operations
```json
{
  "variables": {
    "base_duration": 10,
    "multiplier": 1.5
  },
  "duration": "{{ base_duration * multiplier }}"  // Result: 15
}
```

#### Conditional Logic
```json
{
  "variables": {
    "user_type": "premium",
    "premium_text": "VIP Access",
    "standard_text": "Regular User"
  },
  "text": "{{ user_type == 'premium' ? premium_text : standard_text }}"
}
```

#### Mathematical Functions
```json
{
  "variables": {
    "values": [10, 25, 15, 30]
  },
  "duration": "{{ max(values[0], values[1]) }}"  // Result: 25
}
```

### Variable Best Practices

#### Use Meaningful Names
```json
// Good
{
  "variables": {
    "brand_primary_color": "#FF6B6B",
    "video_intro_duration": 3,
    "show_watermark": true
  }
}

// Avoid
{
  "variables": {
    "c1": "#FF6B6B",
    "d": 3,
    "flag": true
  }
}
```

#### Group Related Variables
```json
{
  "variables": {
    "branding": {
      "logo_url": "https://brand.com/logo.png",
      "primary_color": "#FF6B6B",
      "font_family": "Roboto"
    },
    "timing": {
      "intro_duration": 3,
      "outro_duration": 2,
      "transition_speed": 0.5
    }
  }
}
```

---

## Conditional Elements and Dynamic Scenes

### Conditional Element Patterns

#### Feature Flags
```json
{
  "variables": {
    "features": {
      "show_subtitle": true,
      "include_logo": false,
      "premium_effects": true
    }
  },
  "elements": [
    {
      "type": "text",
      "text": "Subtitle Text",
      "condition": "{{ features.show_subtitle }}"
    },
    {
      "type": "image", 
      "src": "logo.png",
      "condition": "{{ features.include_logo }}"
    }
  ]
}
```

#### User-Specific Content
```json
{
  "variables": {
    "user": {
      "name": "John",
      "subscription": "premium",
      "language": "en"
    }
  },
  "elements": [
    {
      "type": "text",
      "text": "Welcome back, {{user.name}}!",
      "condition": "{{ user.name != '' }}"
    },
    {
      "type": "text", 
      "text": "Premium Features Available",
      "condition": "{{ user.subscription == 'premium' }}"
    }
  ]
}
```

### Dynamic Scene Generation

#### Data-Driven Slideshows
```json
{
  "variables": {
    "products": [
      {
        "name": "Product A",
        "image": "https://example.com/product-a.jpg",
        "price": 29.99,
        "duration": 4
      },
      {
        "name": "Product B", 
        "image": "https://example.com/product-b.jpg",
        "price": 39.99,
        "duration": 6
      }
    ]
  },
  "scenes": [
    {
      "iterate": "products",
      "duration": "{{ duration }}",
      "elements": [
        {
          "type": "image",
          "src": "{{ image }}"
        },
        {
          "type": "text",
          "text": "{{ name }} - ${{ price }}",
          "position": "bottom-center"
        }
      ]
    }
  ]
}
```

**Result**: Generates one scene per product with dynamic durations.

---

## Performance Optimization Strategies

### Scene Structure Optimization

#### ❌ Poor Performance: Single Scene Approach
```json
{
  "scenes": [
    {
      "elements": [
        {
          "type": "image",
          "src": "image1.jpg",
          "duration": 5,
          "start": 0
        },
        {
          "type": "image", 
          "src": "image2.jpg",
          "duration": 5,
          "start": 5
        },
        {
          "type": "image",
          "src": "image3.jpg", 
          "duration": 5,
          "start": 10
        }
      ]
    }
  ]
}
```
**Problems**: 
- Sequential rendering (no parallelization)
- Longer timeout risk
- Harder to cache individual segments

#### ✅ Optimized: Multiple Scene Approach
```json
{
  "scenes": [
    {
      "duration": 5,
      "elements": [
        {
          "type": "image",
          "src": "image1.jpg"
        }
      ]
    },
    {
      "duration": 5,
      "elements": [
        {
          "type": "image",
          "src": "image2.jpg" 
        }
      ]
    },
    {
      "duration": 5,
      "elements": [
        {
          "type": "image",
          "src": "image3.jpg"
        }
      ]
    }
  ]
}
```
**Benefits**:
- Parallel scene rendering
- Individual scene caching
- Better timeout handling
- Easier debugging

### Asset Optimization Guidelines

#### Image Assets
- **Format**: JPEG for photos, PNG for transparency
- **Compression**: Balance quality vs file size
- **Dimensions**: Match or scale to video resolution
- **Tools**: TinyPNG, ImageOptim

#### Video Assets  
- **Codec**: H.264 for compatibility, ProRes for transparency (keep short)
- **Resolution**: Match project resolution (avoid unnecessary 4K)
- **Bitrate**: Optimize for file size
- **Tools**: HandBrake, FFmpeg

#### Audio Assets
- **Format**: MP3 or AAC for compression
- **Quality**: 128-192 kbps for music, 64-128 kbps for voice
- **Normalization**: Consistent volume levels
- **Duration**: Trim unnecessary content

### Transition Optimization

#### Avoid Heavy Transitions
```json
// Avoid complex transitions that slow rendering
{
  "scenes": [
    {
      "transition": {
        "style": "dissolve",        // Slower rendering
        "duration": 2.0             // Longer = slower
      }
    }
  ]
}
```

#### Prefer Simple Transitions
```json
// Use fade for best performance
{
  "scenes": [
    {
      "transition": {
        "style": "fade",            // Fastest transition
        "duration": 0.5             // Shorter = faster
      }
    }
  ]
}
```

#### Consider Wipes Instead
```json
// Alternative: Use pan effects instead of transitions
{
  "scenes": [
    {
      "elements": [
        {
          "type": "image",
          "src": "image.jpg",
          "pan": "left",            // Wipe effect via panning
          "pan-distance": 0.3
        }
      ]
    }
  ]
}
```

---

## Advanced Workflow Patterns

### Multi-Language Video Generation

#### Template with Language Variables
```json
{
  "variables": {
    "language": "en",
    "texts": {
      "en": {
        "title": "Welcome to Our Service",
        "subtitle": "Get started today",
        "cta": "Sign Up Now"
      },
      "es": {
        "title": "Bienvenido a Nuestro Servicio", 
        "subtitle": "Comienza hoy",
        "cta": "Regístrate Ahora"
      },
      "fr": {
        "title": "Bienvenue dans Notre Service",
        "subtitle": "Commencez aujourd'hui", 
        "cta": "Inscrivez-vous Maintenant"
      }
    },
    "voice_models": {
      "en": "en-US-AriaNeural",
      "es": "es-ES-ElviraNeural", 
      "fr": "fr-FR-DeniseNeural"
    }
  },
  "elements": [
    {
      "type": "voice",
      "text": "{{ texts[language].title }}",
      "voice": "{{ voice_models[language] }}"
    }
  ],
  "scenes": [
    {
      "elements": [
        {
          "type": "text",
          "text": "{{ texts[language].title }}",
          "settings": {
            "font-size": "48px"
          }
        },
        {
          "type": "text",
          "text": "{{ texts[language].cta }}",
          "start": 3,
          "position": "bottom-center"
        }
      ]
    }
  ]
}
```

### Personalized Video Campaigns

#### User Data Integration
```json
{
  "variables": {
    "user": {
      "first_name": "Sarah",
      "company": "TechCorp",
      "industry": "software",
      "logo_url": "https://api.company.com/logos/techcorp.png",
      "stats": {
        "growth": 25,
        "employees": 150,
        "revenue": "2.5M"
      }
    },
    "industry_colors": {
      "software": "#3498db",
      "healthcare": "#e74c3c",
      "finance": "#f39c12",
      "retail": "#9b59b6"
    }
  },
  "scenes": [
    {
      "background-color": "{{ industry_colors[user.industry] }}",
      "elements": [
        {
          "type": "text",
          "text": "Hi {{ user.first_name }}, here's {{ user.company }}'s personalized report",
          "settings": {
            "font-color": "#ffffff"
          }
        },
        {
          "type": "image",
          "src": "{{ user.logo_url }}",
          "position": "top-right",
          "condition": "{{ user.logo_url != '' }}"
        },
        {
          "type": "text", 
          "text": "{{ user.stats.growth }}% Growth | {{ user.stats.employees }} Employees | ${{ user.stats.revenue }} Revenue",
          "start": 2,
          "position": "bottom-center"
        }
      ]
    }
  ]
}
```

### A/B Testing Video Variations

#### Template with Variation Control
```json
{
  "variables": {
    "test_variant": "A",
    "variants": {
      "A": {
        "headline": "Save 50% Today Only!",
        "color": "#e74c3c",
        "cta": "Shop Now",
        "urgency": true
      },
      "B": {
        "headline": "Premium Quality Products",
        "color": "#3498db", 
        "cta": "Explore Collection",
        "urgency": false
      }
    }
  },
  "scenes": [
    {
      "background-color": "{{ variants[test_variant].color }}",
      "elements": [
        {
          "type": "text",
          "text": "{{ variants[test_variant].headline }}",
          "settings": {
            "font-size": "42px",
            "font-weight": "bold"
          }
        },
        {
          "type": "text",
          "text": "⏰ Limited Time",
          "condition": "{{ variants[test_variant].urgency }}",
          "position": "top-right",
          "settings": {
            "font-color": "#ff0000"
          }
        },
        {
          "type": "text",
          "text": "{{ variants[test_variant].cta }}",
          "start": 3,
          "position": "bottom-center",
          "settings": {
            "background-color": "#ffffff",
            "font-color": "{{ variants[test_variant].color }}"
          }
        }
      ]
    }
  ]
}
```

---

## Dynamic Scene Considerations for n8n

### Current n8n Array Structure Challenge

The current n8n node assumes scenes are in a fixed array structure:

```javascript
// Current n8n approach
const scenesCollection = this.getNodeParameter('scenes.sceneValues', itemIndex, []);
```

### Dynamic Scene Solutions

#### Option 1: Pre-processing Variable Arrays
```javascript
// n8n could pre-process dynamic data into scene arrays
function expandDynamicScenes(templateData) {
  if (templateData.scenes?.some(scene => scene.iterate)) {
    // Expand iterate scenes into full scene arrays
    const expandedScenes = [];
    
    templateData.scenes.forEach(scene => {
      if (scene.iterate) {
        const dataArray = templateData.variables[scene.iterate];
        dataArray.forEach(item => {
          const expandedScene = {
            ...scene,
            // Replace variables with item data
            elements: scene.elements.map(element => 
              replaceVariables(element, item)
            )
          };
          delete expandedScene.iterate;
          expandedScenes.push(expandedScene);
        });
      } else {
        expandedScenes.push(scene);
      }
    });
    
    return { ...templateData, scenes: expandedScenes };
  }
  return templateData;
}
```

#### Option 2: Advanced Mode for Dynamic Scenes
```javascript
// Use Advanced Mode for dynamic scene generation
const advancedTemplate = {
  "variables": {
    "dynamic_data": getFromPreviousNode()
  },
  "scenes": [
    {
      "iterate": "dynamic_data",
      "elements": [...]
    }
  ]
};

// Let JSON2Video API handle the iteration
```

#### Option 3: Hybrid Approach
- **Basic Mode**: Fixed scene arrays (current approach)
- **Advanced Mode**: Support dynamic scenes with iterate
- **Smart Detection**: Auto-switch based on data structure

---

## Debugging and Troubleshooting

### Performance Diagnosis

#### Render Time Analysis
1. **Single Long Scene**: Suspect sequential processing
2. **Large Assets**: Check file sizes and formats
3. **Complex Transitions**: Try removing transitions
4. **Heavy Effects**: Simplify visual effects

#### Common Performance Issues
```json
// Problem: Huge single scene
{
  "scenes": [
    {
      "duration": 300,  // 5 minutes in one scene = slow
      "elements": [/* many elements */]
    }
  ]
}

// Solution: Break into chunks
{
  "scenes": [
    {"duration": 30, "elements": [/* chunk 1 */]},
    {"duration": 30, "elements": [/* chunk 2 */]},
    {"duration": 30, "elements": [/* chunk 3 */]}
    // etc.
  ]
}
```

### Cache Debugging

#### Force Fresh Render
```json
{
  "cache": false,  // Movie level - rebuilds everything
  "scenes": [
    {
      "cache": false,  // Scene level - rebuilds this scene
      "elements": [
        {
          "type": "image",
          "src": "updated-image.jpg",
          "cache": false  // Element level - re-downloads image
        }
      ]
    }
  ]
}
```

### Variable Debugging

#### Variable Inspection
```json
{
  "variables": {
    "debug_mode": true,
    "user_name": "John",
    "calculated_value": 42
  },
  "elements": [
    {
      "type": "text",
      "text": "Debug: user={{user_name}}, calc={{calculated_value}}",
      "condition": "{{ debug_mode }}"
    }
  ]
}
```

---

## Best Practices Summary

### Performance
1. **Split long videos into multiple scenes** (aim for <30s per scene)
2. **Optimize asset sizes** before upload
3. **Use caching strategically** (true for static, false for dynamic)
4. **Minimize transitions** (prefer fade or wipes)

### Structure
1. **Use meaningful variable names** and group related data
2. **Leverage conditional elements** for dynamic content
3. **Implement proper z-index layering** for complex layouts
4. **Use movie-level elements** for global overlays (logo, subtitles)

### Maintainability  
1. **Add comments** to complex scenes and elements
2. **Use variables** instead of hardcoded values
3. **Test with cache: false** during development
4. **Validate dynamic data** before template processing

### Scalability
1. **Design templates** for data-driven content
2. **Use iterate property** for dynamic scene generation
3. **Implement A/B testing** with variant variables
4. **Consider multi-language** support from the start