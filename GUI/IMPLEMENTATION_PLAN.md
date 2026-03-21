# 🎨 GUI Builder - Implementation Plan

**Edit Existing TermuxDroid Project - XML ↔ JSON Visual Editor**

---

## 🎯 Objective

Enable visual drag-and-drop editing of the **existing TermuxDroid project** (`app/src/main/res/layout/activity_main.xml`) with real-time XML generation and APK build.

---

## 📁 Project Structure

```
TermuxDroid/
├── IDE/                          # New GUI Builder
│   ├── backend/
│   │   ├── src/
│   │   │   ├── controllers/
│   │   │   │   ├── project.controller.js
│   │   │   │   ├── layout.controller.js
│   │   │   │   └── build.controller.js
│   │   │   ├── services/
│   │   │   │   ├── xml-parser.service.js      # XML → JSON
│   │   │   │   ├── xml-generator.service.js   # JSON → XML
│   │   │   │   ├── project-loader.service.js  # Load existing project
│   │   │   │   └── build.service.js           # Gradle build
│   │   │   ├── routes/
│   │   │   │   └── api.routes.js
│   │   │   ├── config/
│   │   │   │   └── database.js
│   │   │   └── app.js
│   │   ├── package.json
│   │   └── server.js
│   │
│   ├── frontend/
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── Canvas/
│   │   │   │   ├── Toolbox/
│   │   │   │   ├── Properties/
│   │   │   │   ├── Preview/
│   │   │   │   └── TreeView/
│   │   │   ├── pages/
│   │   │   │   └── Editor.jsx
│   │   │   ├── stores/
│   │   │   │   ├── projectStore.js
│   │   │   │   └── canvasStore.js
│   │   │   ├── services/
│   │   │   │   └── api.js
│   │   │   ├── utils/
│   │   │   │   └── xmlParser.js
│   │   │   ├── App.jsx
│   │   │   └── main.jsx
│   │   ├── package.json
│   │   ├── vite.config.js
│   │   └── jsconfig.json
│   │
│   └── shared/
│       └── component-mapping.js
│
├── app/                          # Existing TermuxDroid (edited by IDE)
│   └── src/main/
│       ├── java/com/myapp/
│       ├── res/layout/
│       └── AndroidManifest.xml
│
└── package.json                  # Root orchestrator
```

---

## 🔄 Core Flow

### 1. Load Existing Project

```javascript
// POST /api/projects/load
{
  "projectPath": "/data/data/com.termux/files/home/TermuxDroid"
}

// Response
{
  "success": true,
  "project": {
    "name": "TermuxDroid",
    "packageName": "com.myapp",
    "path": "/data/data/com.termux/files/home/TermuxDroid"
  },
  "layouts": [
    {
      "id": 1,
      "name": "activity_main",
      "file": "app/src/main/res/layout/activity_main.xml",
      "components": [...]  // Parsed JSON from XML
    }
  ],
  "resources": {
    "strings": [...],
    "colors": [...]
  }
}
```

### 2. XML → JSON Parsing (Reverse Engineering)

```javascript
// IDE/backend/src/services/xml-parser.service.js

import { parseStringPromise } from 'xml2js';

export async function parseLayoutXml(xmlContent) {
  const result = await parseStringPromise(xmlContent);
  return convertToComponentTree(result);
}

function convertToComponentTree(xmlNode) {
  // Convert XML structure to JSON component tree
  // Example:
  // <LinearLayout> → { type: 'LinearLayout', children: [...] }
  
  return {
    id: xmlNode.$['android:id']?.replace('@+id/', '') || null,
    type: mapTagName(xmlNode['#name']),
    properties: extractProperties(xmlNode.$),
    children: xmlNode.$$?.map(child => convertToComponentTree(child)) || []
  };
}

function extractProperties(attrs) {
  const props = {};
  for (const [key, value] of Object.entries(attrs)) {
    if (key.startsWith('android:')) {
      props[key.replace('android:', '')] = value;
    }
  }
  return props;
}
```

### 3. JSON → XML Generation

```javascript
// IDE/backend/src/services/xml-generator.service.js

export function generateLayoutXml(component) {
  const { type, properties, children } = component;
  
  const openingTag = `<${type}\n  ${generateAttributes(properties)}`;
  
  if (!children || children.length === 0) {
    return `${openingTag} />`;
  }
  
  const childrenXml = children.map(child => 
    '  ' + generateLayoutXml(child).split('\n').join('\n  ')
  ).join('\n');
  
  return `${openingTag}\n>\n${childrenXml}\n</${type}>`;
}

function generateAttributes(props) {
  return Object.entries(props)
    .map(([key, value]) => `android:${key}="${value}"`)
    .join('\n  ');
}
```

### 4. Edit Layout (Incremental Update)

```javascript
// PATCH /api/layouts/:id
{
  "components": {
    "id": "root_layout",
    "type": "ConstraintLayout",
    "children": [
      {
        "id": "txt_title",
        "type": "TextView",
        "properties": {
          "layout_width": "wrap_content",
          "layout_height": "wrap_content",
          "text": "Hello World"
        }
      }
    ]
  }
}

// Response
{
  "success": true,
  "xml": "<?xml version=\"1.0\" ... ?>",
  "filePath": "app/src/main/res/layout/activity_main.xml",
  "written": true
}
```

### 5. Build APK

```javascript
// POST /api/build
{
  "projectId": 1,
  "options": {
    "variant": "debug",  // or "release"
    "install": true
  }
}

// Response
{
  "success": true,
  "apkPath": "app/build/outputs/apk/debug/app-debug.apk",
  "installed": true,
  "buildTime": "12.5s"
}
```

---

## 🛠️ Backend Implementation

### `IDE/backend/package.json`

```json
{
  "name": "gui-builder-backend",
  "version": "1.0.0",
  "type": "module",
  "main": "server.js",
  "scripts": {
    "dev": "nodemon server.js",
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "xml2js": "^0.6.2",
    "better-sqlite3": "^9.2.2",
    "chokidar": "^3.5.3"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
```

### `IDE/backend/src/app.js`

```javascript
import express from 'express';
import cors from 'cors';
import apiRoutes from './routes/api.routes.js';

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api', apiRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default app;
```

### `IDE/backend/src/routes/api.routes.js`

```javascript
import { Router } from 'express';
import { loadProject } from '../controllers/project.controller.js';
import { getLayout, updateLayout } from '../controllers/layout.controller.js';
import { buildProject } from '../controllers/build.controller.js';

const router = Router();

// Project
router.post('/projects/load', loadProject);

// Layouts
router.get('/layouts/:id', getLayout);
router.patch('/layouts/:id', updateLayout);

// Build
router.post('/build', buildProject);

export default router;
```

### `IDE/backend/src/controllers/project.controller.js`

```javascript
import { ProjectLoaderService } from '../services/project-loader.service.js';
import { XmlParserService } from '../services/xml-parser.service.js';
import { join } from 'path';
import { readFile } from 'fs/promises';

const projectLoader = new ProjectLoaderService();
const xmlParser = new XmlParserService();

export const loadProject = async (req, res) => {
  try {
    const { projectPath } = req.body;
    
    if (!projectPath) {
      return res.status(400).json({
        success: false,
        error: 'Project path is required'
      });
    }
    
    // Load project structure
    const project = await projectLoader.load(projectPath);
    
    // Parse all layouts
    const layouts = [];
    for (const layoutFile of project.layoutFiles) {
      const xmlPath = join(projectPath, layoutFile);
      const xmlContent = await readFile(xmlPath, 'utf-8');
      const components = await xmlParser.parse(xmlContent);
      
      layouts.push({
        name: layoutFile.replace('.xml', ''),
        file: layoutFile,
        components
      });
    }
    
    // Load resources
    const strings = await projectLoader.loadStrings(projectPath);
    const colors = await projectLoader.loadColors(projectPath);
    
    res.json({
      success: true,
      project: {
        name: project.name,
        packageName: project.packageName,
        path: projectPath
      },
      layouts,
      resources: {
        strings,
        colors
      }
    });
    
  } catch (error) {
    console.error('Load project error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
```

### `IDE/backend/src/controllers/layout.controller.js`

```javascript
import { XmlGeneratorService } from '../services/xml-generator.service.js';
import { writeFile } from 'fs/promises';
import { join } from 'path';

const xmlGenerator = new XmlGeneratorService();
let PROJECT_PATH = null;

export const getLayout = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Load layout from file
    const layoutPath = join(PROJECT_PATH, 'app/src/main/res/layout', `${id}.xml`);
    const xmlContent = await readFile(layoutPath, 'utf-8');
    
    res.json({
      success: true,
      layout: {
        name: id,
        xml: xmlContent
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export const updateLayout = async (req, res) => {
  try {
    const { id } = req.params;
    const { components } = req.body;
    
    if (!components) {
      return res.status(400).json({
        success: false,
        error: 'Components are required'
      });
    }
    
    // Generate XML from JSON
    const xml = xmlGenerator.generate(components);
    
    // Write to file
    const layoutPath = join(PROJECT_PATH, 'app/src/main/res/layout', `${id}.xml`);
    await writeFile(layoutPath, xml, 'utf-8');
    
    res.json({
      success: true,
      message: 'Layout updated successfully',
      xml,
      filePath: layoutPath
    });
    
  } catch (error) {
    console.error('Update layout error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
```

### `IDE/backend/src/controllers/build.controller.js`

```javascript
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export const buildProject = async (req, res) => {
  try {
    const { options = {} } = req.body;
    const { variant = 'debug', install = true } = options;
    
    console.log('Starting build process...');
    const startTime = Date.now();
    
    // Run Gradle build
    const { stdout, stderr } = await execAsync(
      `./gradlew assemble${variant.charAt(0).toUpperCase() + variant.slice(1)}`,
      { 
        cwd: PROJECT_PATH,
        maxBuffer: 1024 * 1024 * 10  // 10MB buffer
      }
    );
    
    if (stderr && !stderr.includes('warning')) {
      throw new Error(stderr);
    }
    
    const buildTime = ((Date.now() - startTime) / 1000).toFixed(1);
    
    let installed = false;
    if (install) {
      console.log('Installing APK...');
      const apkPath = `app/build/outputs/apk/${variant}/app-${variant}.apk`;
      await execAsync(`adb install -r ${apkPath}`, { cwd: PROJECT_PATH });
      installed = true;
    }
    
    res.json({
      success: true,
      message: `Build completed in ${buildTime}s`,
      apkPath: `app/build/outputs/apk/${variant}/app-${variant}.apk`,
      installed,
      buildTime,
      output: stdout
    });
    
  } catch (error) {
    console.error('Build error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      stderr: error.stderr
    });
  }
};
```

---

## 🎨 Frontend Implementation

### `IDE/frontend/package.json`

```json
{
  "name": "gui-builder-frontend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@mui/material": "^5.15.0",
    "@mui/icons-material": "^5.15.0",
    "@emotion/react": "^11.11.0",
    "@emotion/styled": "^11.11.0",
    "zustand": "^4.4.7",
    "axios": "^1.6.0",
    "@dnd-kit/core": "^6.1.0",
    "@dnd-kit/sortable": "^8.0.0",
    "@dnd-kit/utilities": "^3.2.2",
    "react-router-dom": "^6.20.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.0",
    "vite": "^5.0.0"
  }
}
```

### `IDE/frontend/vite.config.js`

```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@stores': path.resolve(__dirname, './src/stores'),
      '@services': path.resolve(__dirname, './src/services'),
      '@utils': path.resolve(__dirname, './src/utils'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': 'http://localhost:5000',
    },
  },
});
```

### `IDE/frontend/jsconfig.json`

```json
{
  "compilerOptions": {
    "baseUrl": "src",
    "paths": {
      "@/*": ["*"],
      "@components/*": ["components/*"],
      "@pages/*": ["pages/*"],
      "@stores/*": ["stores/*"],
      "@services/*": ["services/*"],
      "@utils/*": ["utils/*"]
    }
  },
  "include": ["src"]
}
```

### `IDE/frontend/src/stores/projectStore.js`

```javascript
import { create } from 'zustand';
import api from '@services/api';

export const useProjectStore = create((set, get) => ({
  project: null,
  layouts: [],
  resources: null,
  currentLayout: null,
  isLoading: false,
  error: null,
  
  loadProject: async (projectPath) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await api.post('/projects/load', { projectPath });
      const { project, layouts, resources } = response.data;
      
      set({
        project,
        layouts,
        resources,
        currentLayout: layouts[0] || null,
        isLoading: false
      });
      
      return { success: true };
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.error || error.message
      });
      return { success: false, error: error.message };
    }
  },
  
  setCurrentLayout: (layout) => {
    set({ currentLayout: layout });
  },
  
  updateLayout: async (layoutId, components) => {
    try {
      const response = await api.patch(`/layouts/${layoutId}`, { components });
      
      // Update local state
      set(state => ({
        layouts: state.layouts.map(l => 
          l.name === layoutId ? { ...l, components } : l
        ),
        currentLayout: state.currentLayout?.name === layoutId 
          ? { ...state.currentLayout, components }
          : state.currentLayout
      }));
      
      return { success: true, xml: response.data.xml };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
  
  buildProject: async (options = {}) => {
    set({ isLoading: true });
    
    try {
      const response = await api.post('/build', { options });
      set({ isLoading: false });
      return { success: true, data: response.data };
    } catch (error) {
      set({ isLoading: false });
      return { success: false, error: error.message };
    }
  }
}));
```

### `IDE/frontend/src/stores/canvasStore.js`

```javascript
import { create } from 'zustand';

export const useCanvasStore = create((set, get) => ({
  components: null,
  selectedId: null,
  draggedType: null,
  history: [],
  historyIndex: -1,
  
  loadComponents: (components) => {
    set({ 
      components, 
      history: [components], 
      historyIndex: 0 
    });
  },
  
  updateComponents: (newComponents) => {
    const state = get();
    const newHistory = state.history.slice(0, state.historyIndex + 1);
    newHistory.push(newComponents);
    
    set({
      components: newComponents,
      history: newHistory,
      historyIndex: newHistory.length - 1
    });
  },
  
  selectComponent: (id) => {
    set({ selectedId: id });
  },
  
  setDraggedType: (type) => {
    set({ draggedType: type });
  },
  
  undo: () => {
    const state = get();
    if (state.historyIndex > 0) {
      set({
        components: state.history[state.historyIndex - 1],
        historyIndex: state.historyIndex - 1
      });
    }
  },
  
  redo: () => {
    const state = get();
    if (state.historyIndex < state.history.length - 1) {
      set({
        components: state.history[state.historyIndex + 1],
        historyIndex: state.historyIndex + 1
      });
    }
  }
}));
```

### `IDE/frontend/src/pages/Editor.jsx`

```javascript
import React, { useEffect } from 'react';
import { Box, AppBar, Toolbar, Typography, Button, CircularProgress } from '@mui/material';
import { useProjectStore } from '@stores/projectStore';
import Canvas from '@components/Canvas/Canvas';
import Toolbox from '@components/Toolbox/Toolbox';
import PropertiesPanel from '@components/Properties/PropertiesPanel';
import PreviewPanel from '@components/Preview/PreviewPanel';

export default function Editor() {
  const { 
    project, 
    currentLayout, 
    isLoading, 
    loadProject, 
    updateLayout,
    buildProject 
  } = useProjectStore();
  
  useEffect(() => {
    // Load existing TermuxDroid project
    const PROJECT_PATH = '/data/data/com.termux/files/home/TermuxDroid';
    loadProject(PROJECT_PATH);
  }, []);
  
  const handleComponentChange = async (newComponents) => {
    if (currentLayout) {
      await updateLayout(currentLayout.name, newComponents);
    }
  };
  
  const handleBuild = async () => {
    const result = await buildProject({ variant: 'debug', install: true });
    if (result.success) {
      alert(`Build successful! APK installed in ${result.data.buildTime}s`);
    } else {
      alert(`Build failed: ${result.error}`);
    }
  };
  
  if (isLoading && !project) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading TermuxDroid project...</Typography>
      </Box>
    );
  }
  
  return (
    <Box sx={{ flexGrow: 1, height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            🎨 GUI Builder - {project?.name || 'TermuxDroid'}
          </Typography>
          <Button color="inherit" onClick={handleBuild} disabled={isLoading}>
            {isLoading ? <CircularProgress size={24} /> : '🚀 Build APK'}
          </Button>
        </Toolbar>
      </AppBar>
      
      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left: Toolbox */}
        <Toolbox />
        
        {/* Center: Canvas */}
        <Canvas 
          components={currentLayout?.components}
          onChange={handleComponentChange}
        />
        
        {/* Right: Properties + Preview */}
        <Box sx={{ width: 400, borderLeft: 1, borderColor: 'divider', display: 'flex', flexDirection: 'column' }}>
          <PropertiesPanel />
          <PreviewPanel xml={currentLayout?.xml} />
        </Box>
      </Box>
    </Box>
  );
}
```

---

## 🚀 Quick Start Commands

### 1. Setup Backend

```bash
cd IDE/backend
npm install
npm run dev
# Server runs on http://localhost:5000
```

### 2. Setup Frontend

```bash
cd IDE/frontend
npm install
npm run dev
# Frontend runs on http://localhost:3000
```

### 3. Open Browser

```
http://localhost:3000
```

### 4. Load Project

Auto-loads: `/data/data/com.termux/files/home/TermuxDroid`

### 5. Edit & Build

- Drag components from Toolbox
- Drop on Canvas
- Edit properties
- Click "Build APK"

---

## 📊 Component Mapping

| Android XML | React Component | Properties |
|-------------|-----------------|------------|
| `TextView` | `<TextView />` | text, textSize, textColor |
| `Button` | `<Button />` | text, onClick, background |
| `EditText` | `<EditText />` | hint, inputType, text |
| `ImageView` | `<ImageView />` | src, scaleType |
| `LinearLayout` | `<LinearLayout />` | orientation, gravity |
| `ConstraintLayout` | `<ConstraintLayout />` | constraints |
| `MaterialButton` | `<MaterialButton />` | text, icon, variant |
| `CardView` | `<CardView />` | elevation, radius |

---

## ✅ Next Steps

1. ⏳ Create IDE folder structure
2. ⏳ Initialize backend with Express
3. ⏳ Initialize frontend with Vite + React + MUI
4. ⏳ Implement XML ↔ JSON parser
5. ⏳ Build Canvas component with dnd-kit
6. ⏳ Build Toolbox with Android components
7. ⏳ Build Properties Panel
8. ⏳ Implement build controller
9. ⏳ Test with existing TermuxDroid project

---

**Status:** Ready for Implementation  
**Branch:** `feature/gui-builder`  
**Approach:** Edit Existing Project (TermuxDroid)
