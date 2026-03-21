# 🚀 Remote Control API - TermuxDroid Framework

**Real-time Android Layout Management via JSON/XML Conversion**

---

## 📋 Overview

Remote Control API memungkinkan Anda untuk mengelola layout Android secara remote melalui konversi **JSON ↔ XML**. Backend berfungsi sebagai middleware yang menerjemahkan antara format JSON (untuk frontend) dan XML (untuk Android native source code).

### Arsitektur

```
┌─────────────────────────────────────────────────────────────┐
│                      Client Devices                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │   Mobile    │  │   Desktop   │  │   Custom App        │ │
│  │   Browser   │  │   Browser   │  │   (HTTP/WebSocket)  │ │
│  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘ │
└─────────┼────────────────┼─────────────────────┼────────────┘
          │                │                     │
          │    HTTP/WS     │                     │
          ▼                ▼                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Termux (Local Server)                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │   Backend Middleware (Express.js + WebSocket)        │  │
│  │   ├─ JSON Validator                                  │  │
│  │   ├─ XML Parser (xml2js)                             │  │
│  │   ├─ XML Generator                                   │  │
│  │   └─ File Sync Service                               │  │
│  └──────────────────────────────────────────────────────┘  │
│                          │                                  │
│                          ▼                                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │   Android Source Code                                │  │
│  │   app/src/main/res/layout/*.xml                      │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### 1. Start Backend Server

```bash
# Menggunakan script
./scripts/remote-server.sh

# Atau manual
cd IDE/backend
npm install
npm run dev
```

Server akan berjalan di:
- **HTTP:** `http://localhost:5000`
- **WebSocket:** `ws://localhost:5000/ws`

### 2. Akses Frontend

Buka browser dan akses:
```
http://localhost:3000/remote
```

Atau jalankan frontend dev server:
```bash
cd IDE/frontend
npm install
npm run dev
```

---

## 📡 API Endpoints

### Base URL
```
http://localhost:5000/api
```

### Health Check

```http
GET /health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "projectPath": "/data/data/com.termux/files/home/TermuxDroid"
}
```

---

### List All Layouts

```http
GET /layouts
```

**Response:**
```json
{
  "success": true,
  "count": 3,
  "layouts": [
    {
      "name": "activity_main",
      "path": "/path/to/activity_main.xml",
      "size": 2048,
      "modified": "2024-01-15T10:30:00.000Z"
    },
    {
      "name": "activity_detail",
      "path": "/path/to/activity_detail.xml",
      "size": 1536,
      "modified": "2024-01-14T08:15:00.000Z"
    }
  ]
}
```

---

### Get Layout as JSON

```http
GET /layout/:name/json
```

**Response:**
```json
{
  "success": true,
  "layoutName": "activity_main",
  "path": "/path/to/activity_main.xml",
  "components": {
    "type": "LinearLayout",
    "properties": {
      "orientation": "vertical",
      "layout_width": "match_parent",
      "layout_height": "match_parent"
    },
    "children": [
      {
        "type": "MaterialButton",
        "id": "@+id/btnSubmit",
        "properties": {
          "text": "Submit",
          "layout_width": "wrap_content",
          "layout_height": "wrap_content"
        }
      }
    ]
  }
}
```

---

### Get Layout as XML

```http
GET /layout/:name/xml
```

**Query Parameters:**
- `raw=true` - Get raw XML content (Content-Type: application/xml)

**Response:**
```json
{
  "success": true,
  "layoutName": "activity_main",
  "path": "/path/to/activity_main.xml",
  "xml": "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n<LinearLayout...>...</LinearLayout>"
}
```

---

### Update Layout from JSON

```http
POST /layout/update
Content-Type: application/json
```

**Request Body:**
```json
{
  "layoutName": "activity_main",
  "json": {
    "type": "LinearLayout",
    "properties": {
      "orientation": "vertical",
      "layout_width": "match_parent",
      "layout_height": "match_parent"
    },
    "children": [
      {
        "type": "MaterialButton",
        "id": "btnSubmit",
        "properties": {
          "text": "Submit",
          "layout_width": "wrap_content",
          "layout_height": "wrap_content"
        }
      }
    ]
  },
  "options": {
    "backup": true,
    "format": true,
    "notify": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Layout activity_main updated successfully",
  "path": "/path/to/activity_main.xml",
  "backup": "created",
  "json": { ... },
  "xml": "<?xml version=\"1.0\" encoding=\"utf-8\"?>..."
}
```

---

### Delete Layout

```http
DELETE /layout/:name
```

**Query Parameters:**
- `backup=true` (default) - Create backup before delete

**Response:**
```json
{
  "success": true,
  "message": "Layout activity_main deleted successfully",
  "path": "/path/to/activity_main.xml"
}
```

---

### Convert XML to JSON

```http
POST /convert/xml-to-json
Content-Type: application/json
```

**Request Body:**
```json
{
  "xml": "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n<LinearLayout...>...</LinearLayout>"
}
```

**Response:**
```json
{
  "success": true,
  "components": {
    "type": "LinearLayout",
    "properties": { ... },
    "children": [ ... ]
  }
}
```

---

### Convert JSON to XML

```http
POST /convert/json-to-xml
Content-Type: application/json
```

**Request Body:**
```json
{
  "json": {
    "type": "LinearLayout",
    "properties": { ... },
    "children": [ ... ]
  },
  "full": true
}
```

**Response:**
```json
{
  "success": true,
  "xml": "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n<LinearLayout...>...</LinearLayout>"
}
```

---

### Get Sync Status

```http
GET /sync/status
```

**Response:**
```json
{
  "success": true,
  "projectRoot": "/data/data/com.termux/files/home/TermuxDroid",
  "layoutCount": 3,
  "layouts": ["activity_main", "activity_detail", "fragment_home"],
  "websocket": {
    "connectedClients": 2,
    "totalSubscriptions": 3,
    "layouts": ["activity_main", "activity_detail"]
  }
}
```

---

### Watch Layout for Changes

```http
POST /sync/watch
Content-Type: application/json
```

**Request Body:**
```json
{
  "layoutName": "activity_main"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Watching layout: activity_main"
}
```

---

## 🔌 WebSocket API

### Connection

```javascript
const ws = new WebSocket('ws://localhost:5000/ws');
```

### Client → Server Messages

#### Subscribe to Layout Updates
```json
{
  "type": "subscribe",
  "layoutName": "activity_main"
}
```

#### Unsubscribe
```json
{
  "type": "unsubscribe",
  "layoutName": "activity_main"
}
```

#### Ping
```json
{
  "type": "ping"
}
```

**Response:**
```json
{
  "type": "pong",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

#### Get Connected Clients
```json
{
  "type": "clients"
}
```

**Response:**
```json
{
  "type": "clients",
  "count": 2,
  "clients": [
    {
      "clientId": "client_1705312200000_abc123",
      "subscriptions": ["activity_main"]
    }
  ]
}
```

---

### Server → Client Messages

#### Connected
```json
{
  "type": "connected",
  "clientId": "client_1705312200000_abc123",
  "message": "Connected to Remote Control API",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

#### Layout Update Notification
```json
{
  "type": "layout:update",
  "layoutName": "activity_main",
  "action": "updated",
  "json": { ... },
  "xml": "<?xml version=\"1.0\" encoding=\"utf-8\"?>...",
  "path": "/path/to/activity_main.xml",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

#### Build Status
```json
{
  "type": "build:status",
  "status": "success",
  "message": "Build completed in 12.5s",
  "apkPath": "app/build/outputs/apk/debug/app-debug.apk",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## 📦 JSON Component Schema

### Root Component
```json
{
  "type": "LinearLayout",
  "id": "rootLayout",
  "properties": {
    "orientation": "vertical",
    "layout_width": "match_parent",
    "layout_height": "match_parent",
    "padding": "16dp"
  },
  "children": [ ... ]
}
```

### Supported Component Types

#### Layouts
- `ConstraintLayout`
- `LinearLayout`
- `RelativeLayout`
- `FrameLayout`
- `MaterialCardView`
- `NestedScrollView`

#### Views
- `TextView`
- `MaterialButton` / `Button`
- `EditText`
- `ImageView`
- `CheckBox`
- `RadioButton`
- `Switch`
- `ProgressBar`

### Example: Complete Layout

```json
{
  "type": "LinearLayout",
  "properties": {
    "orientation": "vertical",
    "layout_width": "match_parent",
    "layout_height": "match_parent",
    "padding": "16dp"
  },
  "children": [
    {
      "type": "TextView",
      "id": "tvTitle",
      "properties": {
        "text": "Hello World",
        "textSize": "24sp",
        "textStyle": "bold",
        "layout_width": "wrap_content",
        "layout_height": "wrap_content"
      }
    },
    {
      "type": "MaterialButton",
      "id": "btnSubmit",
      "properties": {
        "text": "Submit",
        "layout_width": "match_parent",
        "layout_height": "wrap_content",
        "backgroundTint": "#2196F3"
      }
    }
  ]
}
```

---

## 🔐 Security

### API Key Authentication

Untuk production, gunakan API key:

1. Edit `.env` file:
```bash
REMOTE_API_KEY=your-secure-api-key-here
```

2. Include API key in requests:
```javascript
const response = await fetch('http://localhost:5000/api/layout/update', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'your-secure-api-key-here'
  },
  body: JSON.stringify({ ... })
});
```

---

## 🛠️ Configuration

### Environment Variables

File: `IDE/backend/.env`

```bash
# Server settings
PORT=5000
HOST=0.0.0.0

# API Key (optional)
REMOTE_API_KEY=your-secure-api-key-here

# Project path (auto-detected)
# PROJECT_PATH=/data/data/com.termux/files/home/TermuxDroid
```

---

## 📝 Backup System

Setiap kali layout diupdate, backup otomatis dibuat di:
```
.backups/layouts/<layout_name>_<timestamp>.xml
```

Backup lama (lebih dari 10) akan dihapus otomatis.

---

## 🧪 Testing with cURL

### Get All Layouts
```bash
curl http://localhost:5000/api/layouts
```

### Get Layout as JSON
```bash
curl http://localhost:5000/api/layout/activity_main/json
```

### Update Layout
```bash
curl -X POST http://localhost:5000/api/layout/update \
  -H "Content-Type: application/json" \
  -d '{
    "layoutName": "activity_main",
    "json": {
      "type": "LinearLayout",
      "properties": {
        "orientation": "vertical",
        "layout_width": "match_parent",
        "layout_height": "match_parent"
      },
      "children": []
    }
  }'
```

### Convert XML to JSON
```bash
curl -X POST http://localhost:5000/api/convert/xml-to-json \
  -H "Content-Type: application/json" \
  -d '{
    "xml": "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n<LinearLayout android:layout_width=\"match_parent\" android:layout_height=\"match_parent\" />"
  }'
```

---

## 🚨 Error Handling

### Validation Errors

```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    "Missing required property: layout_width",
    "Invalid component type: InvalidView",
    "Child[0]: Invalid color format for backgroundTint"
  ]
}
```

### File Not Found

```json
{
  "success": false,
  "error": "Layout activity_main not found"
}
```

### Unauthorized

```json
{
  "success": false,
  "error": "Unauthorized. Valid X-API-Key header required."
}
```

---

## 📊 Frontend Integration Example

### React Hook

```javascript
import { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

export function useRemoteLayout() {
  const [layouts, setLayouts] = useState([]);
  const [selectedLayout, setSelectedLayout] = useState(null);
  const [layoutJson, setLayoutJson] = useState(null);

  // Load layouts
  const loadLayouts = async () => {
    const response = await axios.get(`${API_BASE}/layouts`);
    setLayouts(response.data.layouts);
  };

  // Load specific layout
  const loadLayout = async (name) => {
    const response = await axios.get(`${API_BASE}/layout/${name}/json`);
    setSelectedLayout(name);
    setLayoutJson(response.data.components);
  };

  // Update layout
  const updateLayout = async (json) => {
    const response = await axios.post(`${API_BASE}/layout/update`, {
      layoutName: selectedLayout,
      json: json
    });
    return response.data;
  };

  useEffect(() => {
    loadLayouts();
  }, []);

  return {
    layouts,
    selectedLayout,
    layoutJson,
    loadLayout,
    updateLayout
  };
}
```

---

## 🔮 Future Enhancements

- [ ] Batch layout operations
- [ ] Layout templates
- [ ] Component library/presets
- [ ] Diff/patch for layout updates
- [ ] Version control integration (Git)
- [ ] Multi-device preview
- [ ] Live sync across multiple clients
- [ ] Plugin system for custom converters

---

## 📄 License

MIT License - Same as TermuxDroid main project

---

**Made with ❤️ for TermuxDroid Framework**
