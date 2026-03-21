# 🎨 GUI Builder for TermuxDroid

**Visual Drag & Drop Editor for Native Android UI**

Build Android layouts visually with real-time preview and one-click APK build.

---

## 🚀 Features

- ✅ **Visual Editor** - Drag & drop Android components
- ✅ **Real-time Preview** - See changes instantly
- ✅ **XML ↔ JSON** - Auto-convert between formats
- ✅ **Properties Panel** - Edit all component attributes
- ✅ **One-Click Build** - Build APK directly from editor
- ✅ **Auto Install** - Deploy to device automatically
- ✅ **Undo/Redo** - Full history support
- ✅ **Multi-Layout** - Edit any layout in your project

---

## 📁 Project Structure

```
IDE/
├── backend/                 # Node.js + Express Server
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── project.controller.js
│   │   │   ├── layout.controller.js
│   │   │   └── build.controller.js
│   │   ├── services/
│   │   │   ├── xml-parser.service.js
│   │   │   ├── xml-generator.service.js
│   │   │   └── project-loader.service.js
│   │   ├── routes/
│   │   │   └── api.routes.js
│   │   └── app.js
│   ├── package.json
│   └── server.js
│
├── frontend/                # React + Vite + Material Design
│   ├── src/
│   │   ├── components/
│   │   │   ├── Canvas/
│   │   │   │   ├── Canvas.jsx
│   │   │   │   └── CanvasNode.jsx
│   │   │   ├── Toolbox/
│   │   │   │   └── Toolbox.jsx
│   │   │   ├── Properties/
│   │   │   │   └── PropertiesPanel.jsx
│   │   │   ├── LayoutSelector.jsx
│   │   │   └── pages/
│   │   │       └── Editor.jsx
│   │   ├── stores/
│   │   │   ├── projectStore.js
│   │   │   └── canvasStore.js
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
│
└── shared/                  # Shared constants/types
    └── component-mapping.js
```

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| **Node.js** | Runtime |
| **Express.js** | Web framework |
| **xml2js** | XML parsing |
| **better-sqlite3** | Local database (optional) |
| **chokidar** | File watching |

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 18** | UI framework |
| **Vite** | Build tool |
| **Material UI (MUI)** | Component library |
| **Zustand** | State management |
| **Axios** | HTTP client |
| **React Router** | Navigation |

---

## 📦 Installation

### 1. Install Backend Dependencies

```bash
cd IDE/backend
npm install
```

### 2. Install Frontend Dependencies

```bash
cd IDE/frontend
npm install
```

---

## 🚀 Quick Start

### Start Backend Server

```bash
cd IDE/backend
npm run dev

# Server runs on http://localhost:5000
```

### Start Frontend Dev Server

```bash
cd IDE/frontend
npm run dev

# Frontend runs on http://localhost:3000
```

### Open in Browser

```
http://localhost:3000
```

---

## 🎯 Usage Flow

### 1. Load Project

On first load, the editor automatically loads the TermuxDroid project from:
```
/data/data/com.termux/files/home/TermuxDroid
```

All layouts in `app/src/main/res/layout/` will be parsed and displayed.

### 2. Select Layout

Use the dropdown in the header to switch between layouts:
- `activity_main.xml`
- Any other layout files you create

### 3. Edit Layout

**Drag Components:**
- Drag components from the **Toolbox** (left panel)
- Drop onto the **Canvas** (center area)

**Select Component:**
- Click on any component in the canvas
- Selected component shows blue border

**Edit Properties:**
- Use the **Properties Panel** (right panel)
- Changes auto-save to the project

### 4. Build APK

Click **"Build APK"** button in the header:
- Runs `./gradlew assembleDebug`
- Auto-installs to connected device via ADB
- Shows build status and time

---

## 🔧 API Endpoints

### Project

```http
POST /api/projects/load
Content-Type: application/json

{
  "projectPath": "/data/data/com.termux/files/home/TermuxDroid"
}

Response:
{
  "success": true,
  "project": { ... },
  "layouts": [ ... ],
  "resources": { ... }
}
```

### Layout

```http
GET /api/layouts/:id

Response:
{
  "success": true,
  "layout": {
    "name": "activity_main",
    "xml": "<?xml ... ?>"
  }
}
```

```http
PATCH /api/layouts/:id
Content-Type: application/json

{
  "components": { ... }
}

Response:
{
  "success": true,
  "xml": "<?xml ... ?>",
  "filePath": "app/src/main/res/layout/activity_main.xml"
}
```

### Build

```http
POST /api/build
Content-Type: application/json

{
  "options": {
    "variant": "debug",
    "install": true,
    "clean": false
  }
}

Response:
{
  "success": true,
  "message": "Build completed in 12.5s",
  "apkPath": "app/build/outputs/apk/debug/app-debug.apk",
  "installed": true,
  "buildTime": 12.5
}
```

---

## 🎨 Supported Components

### Layouts
- `LinearLayout`
- `ConstraintLayout`
- `RelativeLayout`
- `FrameLayout`
- `MaterialCardView`

### Views
- `TextView`
- `MaterialButton` / `Button`
- `EditText`
- `ImageView`
- `CheckBox`
- `RadioButton`
- `Switch`
- `ProgressBar`
- `Spinner`

### Containers
- `NestedScrollView`
- `RecyclerView` (future)
- `WebView` (future)

---

## 📝 Component Properties

### Common Properties
- `id` - Unique identifier
- `layout_width` - MATCH_PARENT / WRAP_CONTENT / dimension
- `layout_height` - MATCH_PARENT / WRAP_CONTENT / dimension
- `layout_margin*` - Margins (Start, End, Top, Bottom)
- `padding` - Internal padding
- `background` - Background color/drawable

### TextView Properties
- `text` - Display text
- `textSize` - Font size (e.g., "16sp")
- `textColor` - Color (e.g., "#000000")
- `textStyle` - normal/bold/italic

### Button Properties
- `text` - Button label
- `onClick` - Click handler method name
- `background` - Background color

### EditText Properties
- `hint` - Placeholder text
- `inputType` - text/password/number/phone/email

### LinearLayout Properties
- `orientation` - vertical/horizontal
- `gravity` - Content alignment

---

## 🐛 Troubleshooting

### Backend won't start

```bash
# Check Node.js version (need 18+)
node --version

# Reinstall dependencies
cd IDE/backend
rm -rf node_modules package-lock.json
npm install
```

### Frontend won't start

```bash
# Check Node.js version
node --version

# Reinstall dependencies
cd IDE/frontend
rm -rf node_modules package-lock.json
npm install
```

### Build fails

```bash
# Check Gradle setup
cd /data/data/com.termux/files/home/TermuxDroid
./gradlew --version

# Try manual build
./gradlew assembleDebug
```

### ADB install fails

```bash
# Check device connection
adb devices

# Restart ADB server
adb kill-server
adb start-server
adb devices
```

---

## 📊 Performance

| Action | Expected Time |
|--------|---------------|
| Load Project | 1-2 seconds |
| Switch Layout | < 500ms |
| Drag & Drop | Instant |
| Property Edit | Instant (auto-save ~500ms) |
| Build APK | 30-60 seconds (first time) |
| Incremental Build | 10-20 seconds |

---

## 🔮 Future Enhancements

- [ ] ConstraintLayout visual editor
- [ ] Theme/color picker
- [ ] Image asset manager
- [ ] String resources editor
- [ ] Menu editor
- [ ] Navigation editor
- [ ] Code export (Java/Kotlin)
- [ ] Preview on multiple device sizes
- [ ] Collaboration mode
- [ ] Plugin system

---

## 📄 License

MIT License - Same as TermuxDroid main project

---

## 🙏 Credits

Built for **TermuxDroid** - Native Android Development Framework for Termux

**Made with ❤️ using TermuxDroid**
