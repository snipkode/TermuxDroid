# 🎨 GUI Builder API Documentation

**Base URL:** `http://localhost:5000/api`

---

## Table of Contents

- [Styles](#styles)
  - [Update Button Style](#update-button-style)
- [Layouts](#layouts)
  - [Get Layout](#get-layout)
  - [Update Layout](#update-layout)
- [Projects](#projects)
  - [Load Project](#load-project)
- [Build](#build)
  - [Build Project](#build-project)

---

## Styles

### Update Button Style

Update Android native button styles dynamically via API.

**Endpoint:** `PATCH /api/styles/button`

**Request Body:**
```json
{
  "style": {
    "cornerRadius": 16,
    "backgroundColor": "#FFF44336",
    "textColor": "#FFFFFFFF",
    "textAllCaps": false,
    "textSize": 16,
    "elevation": 4,
    "customColors": {
      "primary": "#FFF44336",
      "primary_dark": "#FFD32F2F",
      "accent": "#FFFF5252"
    },
    "buttons": {
      "btnIncrement": {
        "cornerRadius": 16,
        "style": "contained"
      },
      "btnDecrement": {
        "cornerRadius": 16,
        "style": "outlined"
      },
      "btnReset": {
        "cornerRadius": 16,
        "style": "text"
      }
    }
  }
}
```

**Style Properties:**

| Property | Type | Description | Example |
|----------|------|-------------|---------|
| `cornerRadius` | number | Button corner radius in dp | `16` |
| `backgroundColor` | string | Background color (hex ARGB) | `"#FFF44336"` |
| `textColor` | string | Text color (hex ARGB) | `"#FFFFFFFF"` |
| `textAllCaps` | boolean | Enable/disable text all caps | `false` |
| `textSize` | number | Text size in sp | `16` |
| `elevation` | number | Shadow elevation in dp | `4` |
| `customColors` | object | Custom color definitions | See below |
| `buttons` | object | Individual button customization | See below |

**Custom Colors:**

| Color Name | Description |
|------------|-------------|
| `primary` | Primary brand color |
| `primary_dark` | Darker variant of primary |
| `primary_light` | Lighter variant of primary |
| `accent` | Accent/secondary color |
| `accent_variant` | Alternative accent color |

**Button Styles:**

| Style | Description |
|-------|-------------|
| `contained` | Filled button with background color |
| `outlined` | Button with border only |
| `text` | Text-only button (no background/border) |

**Response:**
```json
{
  "success": true,
  "message": "Android button styles updated successfully",
  "style": { ... },
  "files": {
    "themes": "/path/to/themes.xml",
    "colors": "/path/to/colors.xml",
    "layout": "/path/to/activity_main.xml"
  }
}
```

**Example (cURL):**
```bash
curl -X PATCH http://localhost:5000/api/styles/button \
  -H "Content-Type: application/json" \
  -d '{
    "style": {
      "cornerRadius": 16,
      "backgroundColor": "#FFF44336",
      "textColor": "#FFFFFFFF",
      "textSize": 16,
      "buttons": {
        "btnIncrement": { "style": "contained" },
        "btnDecrement": { "style": "outlined" }
      }
    }
  }'
```

**Example (JavaScript):**
```javascript
const response = await fetch('http://localhost:5000/api/styles/button', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    style: {
      cornerRadius: 16,
      backgroundColor: '#FFF44336',
      textColor: '#FFFFFFFF',
      buttons: {
        btnIncrement: { style: 'contained' }
      }
    }
  })
});

const data = await response.json();
```

---

## Layouts

### Get Layout

Retrieve a specific layout XML file.

**Endpoint:** `GET /api/layouts/:id`

**Parameters:**
- `id` (path) - Layout name (e.g., `activity_main`)

**Response:**
```json
{
  "success": true,
  "layout": {
    "name": "activity_main",
    "xml": "<?xml version=\"1.0\" encoding=\"utf-8\"?>..."
  }
}
```

**Example:**
```bash
curl http://localhost:5000/api/layouts/activity_main
```

---

### Update Layout

Update a layout with new components or XML.

**Endpoint:** `PATCH /api/layouts/:id`

**Parameters:**
- `id` (path) - Layout name
- `components` (body, optional) - Component tree
- `xml` (body, optional) - Raw XML content

**Request Body:**
```json
{
  "components": [
    {
      "id": "1",
      "type": "Button",
      "properties": {
        "text": "Click Me",
        "layout_width": "wrap_content",
        "layout_height": "wrap_content"
      }
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Layout updated successfully",
  "xml": "<?xml version=\"1.0\" encoding=\"utf-8\"?>...",
  "filePath": "/path/to/layout.xml"
}
```

**Example:**
```bash
curl -X PATCH http://localhost:5000/api/layouts/activity_main \
  -H "Content-Type: application/json" \
  -d '{
    "components": [...]
  }'
```

---

## Projects

### Load Project

Load a TermuxDroid project with all layouts and resources.

**Endpoint:** `POST /api/projects/load`

**Request Body:**
```json
{
  "projectPath": "/path/to/TermuxDroid"
}
```

**Response:**
```json
{
  "success": true,
  "project": {
    "name": "TermuxDroid",
    "packageName": "com.myapp",
    "path": "/path/to/TermuxDroid",
    "layoutFiles": ["activity_main.xml"],
    "javaFiles": ["MainActivity.java"]
  },
  "layouts": [
    {
      "id": "activity_main",
      "name": "activity_main",
      "file": "activity_main.xml",
      "components": [...],
      "xml": "..."
    }
  ],
  "resources": {
    "strings": {...},
    "colors": {...}
  }
}
```

**Example:**
```bash
curl -X POST http://localhost:5000/api/projects/load \
  -H "Content-Type: application/json" \
  -d '{
    "projectPath": "/data/data/com.termux/files/home/TermuxDroid"
  }'
```

---

## Build

### Build Project

Trigger an APK build.

**Endpoint:** `POST /api/build`

**Request Body:**
```json
{
  "buildType": "debug",
  "arguments": []
}
```

**Build Types:**
- `debug` - Debug build (default)
- `release` - Release build (unsigned)
- `aab` - Android App Bundle for Play Store

**Response:**
```json
{
  "success": true,
  "message": "Build completed successfully",
  "output": {
    "apkPath": "/path/to/app-debug.apk",
    "buildTime": "2.5s"
  }
}
```

**Example:**
```bash
curl -X POST http://localhost:5000/api/build \
  -H "Content-Type: application/json" \
  -d '{
    "buildType": "debug"
  }'
```

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "success": false,
  "error": "Error message description"
}
```

**Common HTTP Status Codes:**

| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Bad Request (invalid input) |
| 404 | Not Found |
| 500 | Internal Server Error |

---

## Quick Start

**1. Start Backend:**
```bash
cd IDE/backend
npm run dev
```

**2. Test API:**
```bash
curl http://localhost:5000/health
```

**3. Update Button Style:**
```bash
curl -X PATCH http://localhost:5000/api/styles/button \
  -H "Content-Type: application/json" \
  -d '{
    "style": {
      "cornerRadius": 12,
      "backgroundColor": "#FF2196F3"
    }
  }'
```

**4. Build App:**
```bash
npm run build
```

---

## Color Format

Use Android ARGB hex format: `#AARRGGBB`

- `AA` - Alpha (transparency): `FF` = opaque, `00` = transparent
- `RR` - Red component
- `GG` - Green component
- `BB` - Blue component

**Examples:**
- `#FFFF0000` - Solid red
- `#FF2196F3` - Material blue
- `#80000000` - Semi-transparent black
- `#FFFFFFFF` - Solid white

---

**Last Updated:** March 21, 2026
