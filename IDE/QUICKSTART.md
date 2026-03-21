# 🚀 Quick Start - GUI Builder

## Installation (Already Done ✅)

All dependencies are installed. You're ready to go!

---

## Start GUI Builder

### Option 1: Run Both Servers Together (Recommended)

```bash
npm run gui
```

This starts both backend and frontend automatically.

### Option 2: Run Separately

**Terminal 1 - Backend:**
```bash
cd IDE/backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd IDE/frontend
npm run dev
```

---

## Open in Browser

Once servers are running:

```
http://localhost:3000
```

---

## What You'll See

### 1. Editor Interface

- **Left Panel (Toolbox)**: Drag Android components
- **Center (Canvas)**: Visual preview of your layout
- **Right Panel (Properties)**: Edit component attributes
- **Top Bar**: Layout selector, undo/redo, zoom, build button

### 2. Loaded Project

The editor automatically loads:
```
/data/data/com.termux/files/home/TermuxDroid
```

You'll see:
- `activity_main.xml` - Main app layout
- All existing components parsed from XML

---

## Basic Usage

### Edit a Component

1. **Click** on any component in the canvas
2. **Edit** properties in the right panel
3. **Auto-saved** to project automatically

### Add New Component

1. **Drag** from Toolbox (left panel)
2. **Drop** onto canvas
3. **Configure** properties

### Build APK

1. Click **"Build APK"** button (top right)
2. Wait for build (~30-60 seconds)
3. APK auto-installs to your device

---

## Example: Add a Button

1. Drag `MaterialButton` from Toolbox
2. Drop onto canvas (inside a layout)
3. Select the button
4. In Properties panel:
   - ID: `btn_hello`
   - Text: `Click Me`
   - layout_width: `match_parent`
5. Click "Build APK"

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Z` | Undo |
| `Ctrl+Y` | Redo |
| `Delete` | Remove selected component |
| `+` | Zoom in |
| `-` | Zoom out |

---

## Troubleshooting

### Backend won't start

```bash
cd IDE/backend
npm install
npm run dev
```

### Frontend won't start

```bash
cd IDE/frontend
npm install
npm run dev
```

### Port already in use

**Backend (5000):**
```bash
# Kill process on port 5000
kill $(lsof -t -i:5000)
```

**Frontend (3000):**
```bash
# Kill process on port 3000
kill $(lsof -t -i:3000)
```

### Build fails

Check TermuxDroid project builds normally:
```bash
cd /data/data/com.termux/files/home/TermuxDroid
./gradlew assembleDebug
```

---

## Next Steps

1. ✅ Explore existing `activity_main.xml`
2. ✅ Try editing a component property
3. ✅ Add a new component
4. ✅ Build APK
5. ✅ Check generated XML in:
   ```
   app/src/main/res/layout/activity_main.xml
   ```

---

## Features

- ✅ Load existing TermuxDroid project
- ✅ Parse XML → JSON (reverse engineering)
- ✅ Visual drag & drop editor
- ✅ Real-time property editing
- ✅ Auto-save to project files
- ✅ One-click APK build
- ✅ Auto-install via ADB
- ✅ Undo/Redo support
- ✅ Multi-layout support

---

## Support

For issues or questions, check:
- `IDE/README.md` - Full documentation
- `GUI/IMPLEMENTATION_PLAN.md` - Technical details

---

**Happy Building! 🎨**
