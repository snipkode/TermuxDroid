# 🎨 GUI Builder - Design Plan

**Drag & Drop Web IDE for Native Android UI Generation**

---

## 📋 Overview

Web-based visual UI builder that allows users to design Android layouts through drag-and-drop interface, then generates native Android XML layouts and Java/Kotlin code.

---

## 🏗️ Architecture

```
IDE/
├── backend/                 # Node.js + Express Server
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── project.controller.js
│   │   │   ├── layout.controller.js
│   │   │   └── generator.controller.js
│   │   ├── models/
│   │   │   ├── Project.js
│   │   │   ├── Layout.js
│   │   │   └── Component.js
│   │   ├── routes/
│   │   │   ├── projects.routes.js
│   │   │   ├── layouts.routes.js
│   │   │   └── generator.routes.js
│   │   ├── services/
│   │   │   ├── xmlGenerator.service.js
│   │   │   ├── javaGenerator.service.js
│   │   │   └── previewGenerator.service.js
│   │   ├── config/
│   │   │   ├── database.js
│   │   │   └── cors.js
│   │   ├── middleware/
│   │   │   └── errorHandler.js
│   │   └── app.js
│   ├── package.json
│   └── server.js
│
├── frontend/                # React + Vite + Material Design
│   ├── src/
│   │   ├── components/
│   │   │   ├── Canvas/
│   │   │   │   ├── Canvas.jsx
│   │   │   │   ├── CanvasNode.jsx
│   │   │   │   └── DropZone.jsx
│   │   │   ├── Toolbox/
│   │   │   │   ├── Toolbox.jsx
│   │   │   │   ├── ComponentItem.jsx
│   │   │   │   └── ComponentCategory.jsx
│   │   │   ├── Properties/
│   │   │   │   ├── PropertiesPanel.jsx
│   │   │   │   ├── PropertyEditor.jsx
│   │   │   │   └── PropertyField.jsx
│   │   │   ├── Preview/
│   │   │   │   ├── PreviewPanel.jsx
│   │   │   │   └── DeviceFrame.jsx
│   │   │   ├── Header/
│   │   │   │   ├── Header.jsx
│   │   │   │   └── Toolbar.jsx
│   │   │   └── Sidebar/
│   │   │       ├── Sidebar.jsx
│   │   │       └── LayerTree.jsx
│   │   ├── pages/
│   │   │   ├── Editor.jsx
│   │   │   ├── ProjectList.jsx
│   │   │   └── Settings.jsx
│   │   ├── stores/
│   │   │   ├── projectStore.js
│   │   │   ├── canvasStore.js
│   │   │   ├── propertiesStore.js
│   │   │   └── previewStore.js
│   │   ├── hooks/
│   │   │   ├── useDragDrop.js
│   │   │   ├── useSelection.js
│   │   │   └── useProperties.js
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   ├── projectService.js
│   │   │   └── generatorService.js
│   │   ├── utils/
│   │   │   ├── componentMapper.js
│   │   │   ├── propertyValidators.js
│   │   │   └── codeFormatter.js
│   │   ├── styles/
│   │   │   ├── globals.css
│   │   │   └── theme.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/
│   │   └── devices/
│   │       └── phone-frame.svg
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── jsconfig.json        # Absolute imports config
│
└── shared/                  # Shared types/constants
    └── componentDefinitions.js
```

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| **Node.js** | Runtime environment |
| **Express.js** | Web framework |
| **Sequelize** | ORM for database |
| **MariaDB** | Database storage |
| **CORS** | Cross-origin resource sharing |

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 18** | UI framework |
| **Vite** | Build tool & dev server |
| **Material Design (MUI)** | Component library |
| **Zustand** | State management |
| **React DnD / dnd-kit** | Drag & drop functionality |
| **Axios** | HTTP client |

---

## 🗄️ Database Schema (MariaDB)

### Projects Table
```sql
CREATE TABLE projects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  package_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Layouts Table
```sql
CREATE TABLE layouts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  type ENUM('activity', 'fragment', 'dialog', 'item') DEFAULT 'activity',
  layout_json JSON NOT NULL,
  generated_xml TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);
```

### Components Table
```sql
CREATE TABLE components (
  id INT AUTO_INCREMENT PRIMARY KEY,
  layout_id INT NOT NULL,
  parent_id INT,
  component_type VARCHAR(100) NOT NULL,
  properties JSON NOT NULL,
  order_index INT DEFAULT 0,
  FOREIGN KEY (layout_id) REFERENCES layouts(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_id) REFERENCES components(id) ON DELETE SET NULL
);
```

---

## 🎨 Frontend Components

### 1. Canvas (Drop Zone)
- Main design area
- Visual representation of Android layout
- Nested drop zones for ViewGroup containers
- Grid/snapping support

**Features:**
- Drag from Toolbox
- Drop to add components
- Select to edit properties
- Resize handles (future)
- Hierarchy visualization

### 2. Toolbox (Component Palette)
Categorized Android UI components:

**Layouts:**
- LinearLayout
- RelativeLayout
- ConstraintLayout
- FrameLayout
- GridLayout

**Views:**
- TextView
- EditText
- Button
- ImageButton
- ImageView
- CheckBox
- RadioButton
- Switch
- ProgressBar
- Spinner

**Containers:**
- ScrollView
- RecyclerView (future)
- CardView

### 3. Properties Panel
Dynamic property editor based on selected component:

**Common Properties:**
- `id` - Component ID
- `layout_width` - MATCH_PARENT / WRAP_CONTENT / dimension
- `layout_height` - MATCH_PARENT / WRAP_CONTENT / dimension
- `layout_margin` - Margin settings
- `padding` - Padding settings
- `background` - Background drawable/color
- `gravity` - Content gravity
- `orientation` - For LinearLayout

**Component-Specific:**
- TextView: `text`, `textSize`, `textColor`, `fontStyle`
- Button: `text`, `onClick`
- ImageView: `src`, `scaleType`
- EditText: `hint`, `inputType`

### 4. Preview Panel
- Real-time XML preview
- Device frame selector
- Orientation toggle (portrait/landscape)
- Screen size presets

### 5. Layer Tree
- Hierarchical view of components
- Drag to reorder
- Visibility toggle
- Lock/unlock layers

---

## 🔄 State Management (Zustand)

### Canvas Store
```javascript
// stores/canvasStore.js
{
  components: [],        // Tree of components
  selectedId: null,      // Currently selected component
  draggedType: null,     // Type being dragged from toolbox
  dropTargetId: null,    // Current drop target
  zoom: 1.0,             // Canvas zoom level
  
  // Actions
  addComponent: (type, parentId, index) => void
  removeComponent: (id) => void
  moveComponent: (id, newParentId, newIndex) => void
  updateComponent: (id, properties) => void
  selectComponent: (id) => void
  setDraggedType: (type) => void
}
```

### Properties Store
```javascript
// stores/propertiesStore.js
{
  selectedComponent: null,
  availableProperties: {},
  
  // Actions
  loadProperties: (component) => void
  updateProperty: (key, value) => void
  resetProperty: (key) => void
}
```

### Project Store
```javascript
// stores/projectStore.js
{
  projects: [],
  currentProject: null,
  currentLayout: null,
  
  // Actions
  loadProjects: () => Promise
  createProject: (data) => Promise
  deleteProject: (id) => Promise
  loadLayout: (id) => Promise
  saveLayout: () => Promise
}
```

---

## 📡 API Endpoints

### Projects
```
GET    /api/projects          - List all projects
POST   /api/projects          - Create new project
GET    /api/projects/:id      - Get project details
PUT    /api/projects/:id      - Update project
DELETE /api/projects/:id      - Delete project
```

### Layouts
```
GET    /api/projects/:projectId/layouts        - List layouts
POST   /api/projects/:projectId/layouts        - Create layout
GET    /api/layouts/:id                        - Get layout with components
PUT    /api/layouts/:id                        - Update layout
DELETE /api/layouts/:id                        - Delete layout
```

### Generator
```
POST   /api/generator/xml       - Generate XML from layout JSON
POST   /api/generator/java      - Generate Java code from layout
POST   /api/generator/preview   - Generate preview image/render
GET    /api/generator/download/:id - Download complete project
```

---

## 🧩 Component Definitions

### Component Structure
```javascript
{
  id: "btn_submit",
  type: "Button",
  parent: "linear_layout_root",
  properties: {
    layout_width: "MATCH_PARENT",
    layout_height: "wrap_content",
    text: "Submit",
    textColor: "#FFFFFF",
    background: "@color/colorPrimary",
    padding: "16dp",
    onClick: "onSubmitClick"
  },
  children: []
}
```

### Component Mapping (Frontend → Android)
```javascript
// utils/componentMapper.js
const componentMap = {
  'TextView': 'android.widget.TextView',
  'Button': 'android.widget.Button',
  'EditText': 'android.widget.EditText',
  'ImageView': 'android.widget.ImageView',
  'LinearLayout': 'android.widget.LinearLayout',
  'RelativeLayout': 'android.widget.RelativeLayout',
  'ConstraintLayout': 'androidx.constraintlayout.widget.ConstraintLayout',
  'FrameLayout': 'android.widget.FrameLayout',
  'CardView': 'androidx.cardview.widget.CardView',
  // ... more components
};
```

---

## 🎯 Code Generation

### XML Generator Service
```javascript
// services/xmlGenerator.service.js
function generateXML(layout) {
  return `<?xml version="1.0" encoding="utf-8"?>
<${layout.type}
  xmlns:android="http://schemas.android.com/apk/res/android"
  ${generateProperties(layout.properties)}
>
  ${layout.children.map(child => generateXML(child)).join('\n')}
</${layout.type}>`;
}
```

### Java Generator Service
```javascript
// services/javaGenerator.service.js
function generateJava(layout, activityName) {
  return `package com.example.app;

import android.app.Activity;
import android.os.Bundle;
${generateImports(layout)}

public class ${activityName} extends Activity {
  ${generateFieldDeclarations(layout)}
  
  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    setContentView(R.layout.${layout.name});
    ${generateViewBindings(layout)}
  }
}`;
}
```

---

## 🚀 Development Phases

### Phase 1: Foundation (Week 1-2)
- [ ] Setup backend with Express + Sequelize
- [ ] Setup MariaDB database
- [ ] Setup frontend with Vite + React
- [ ] Configure Material Design (MUI)
- [ ] Setup Zustand stores
- [ ] Implement basic drag & drop

### Phase 2: Core Features (Week 3-4)
- [ ] Canvas with drop zones
- [ ] Toolbox with basic components
- [ ] Properties panel
- [ ] Component tree visualization
- [ ] XML generation

### Phase 3: Advanced Features (Week 5-6)
- [ ] Preview panel
- [ ] Layer tree with reordering
- [ ] Undo/Redo functionality
- [ ] Save/Load projects
- [ ] Export to TermuxDroid project

### Phase 4: Polish (Week 7-8)
- [ ] More Android components
- [ ] ConstraintLayout visual editor
- [ ] Theme/color picker
- [ ] Responsive design
- [ ] Performance optimization

---

## 📝 Usage Flow

1. **Create Project**
   - Enter project name
   - Set package name
   - Choose minimum SDK

2. **Design Layout**
   - Drag components from Toolbox
   - Drop onto Canvas
   - Configure properties in Properties Panel
   - View hierarchy in Layer Tree

3. **Preview**
   - See real-time XML preview
   - Toggle device orientation
   - Test on different screen sizes

4. **Export**
   - Generate XML layout file
   - Generate Java activity code
   - Download complete project
   - Import to TermuxDroid

---

## 🔧 Configuration Files

### `frontend/jsconfig.json` - Absolute Imports
```json
{
  "compilerOptions": {
    "baseUrl": "src",
    "paths": {
      "@/*": ["*"],
      "@components/*": ["components/*"],
      "@pages/*": ["pages/*"],
      "@stores/*": ["stores/*"],
      "@hooks/*": ["hooks/*"],
      "@services/*": ["services/*"],
      "@utils/*": ["utils/*"],
      "@styles/*": ["styles/*"]
    }
  },
  "include": ["src"]
}
```

### `frontend/vite.config.js`
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
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@services': path.resolve(__dirname, './src/services'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@styles': path.resolve(__dirname, './src/styles'),
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

### `backend/.env.example`
```env
NODE_ENV=development
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=gui_builder
DB_USER=root
DB_PASSWORD=
```

---

## 📦 Package Dependencies

### Backend (`backend/package.json`)
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "sequelize": "^6.35.0",
    "mariadb": "^3.2.0",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "express-validator": "^7.0.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
```

### Frontend (`frontend/package.json`)
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@mui/material": "^5.15.0",
    "@mui/icons-material": "^5.15.0",
    "@emotion/react": "^11.11.0",
    "@emotion/styled": "^11.11.0",
    "zustand": "^4.4.7",
    "axios": "^1.6.0",
    "dnd-kit": "^6.1.0",
    "react-router-dom": "^6.20.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.0",
    "vite": "^5.0.0"
  }
}
```

---

## 🎯 Next Steps

1. ✅ Branch `feature/gui-builder` created
2. ⏳ Create IDE folder structure
3. ⏳ Initialize backend with Express + Sequelize
4. ⏳ Initialize frontend with Vite + React
5. ⏳ Setup MariaDB database
6. ⏳ Implement basic drag & drop
7. ⏳ Build component palette
8. ⏳ Create properties panel
9. ⏳ Implement XML generator
10. ⏳ Test integration with TermuxDroid

---

**Status:** Ready for Implementation  
**Branch:** `feature/gui-builder`  
**Created:** 2026-03-21
