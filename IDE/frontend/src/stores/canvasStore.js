import { create } from 'zustand';

export const useCanvasStore = create((set, get) => ({
  // State
  components: null,
  selectedId: null,
  draggedType: null,
  dropTargetId: null,
  zoom: 1,
  history: [],
  historyIndex: -1,
  
  // Actions
  loadComponents: (components) => {
    set({ 
      components, 
      history: [JSON.parse(JSON.stringify(components))], 
      historyIndex: 0 
    });
  },
  
  updateComponents: (newComponents, addToHistory = true) => {
    const state = get();
    
    if (addToHistory) {
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push(JSON.parse(JSON.stringify(newComponents)));
      
      set({
        components: newComponents,
        history: newHistory,
        historyIndex: newHistory.length - 1
      });
    } else {
      set({ components: newComponents });
    }
  },
  
  selectComponent: (id) => {
    set({ selectedId: id });
  },
  
  getSelectedComponent: () => {
    const { components, selectedId } = get();
    if (!components || !selectedId) return null;
    
    const findComponent = (comp) => {
      if (comp.id === selectedId) return comp;
      if (comp.children) {
        for (const child of comp.children) {
          const found = findComponent(child);
          if (found) return found;
        }
      }
      return null;
    };
    
    return findComponent(components);
  },
  
  setDraggedType: (type) => {
    set({ draggedType: type });
  },
  
  setDropTarget: (id) => {
    set({ dropTargetId: id });
  },
  
  setZoom: (zoom) => {
    set({ zoom: Math.max(0.5, Math.min(2, zoom)) });
  },
  
  // Find component by ID
  findComponent: (id, components = get().components) => {
    if (!components) return null;
    
    const find = (comp) => {
      if (comp.id === id) return comp;
      if (comp.children) {
        for (const child of comp.children) {
          const found = find(child);
          if (found) return found;
        }
      }
      return null;
    };
    
    return find(components);
  },
  
  // Find parent of component
  findParent: (childId, components = get().components) => {
    if (!components) return null;
    
    const find = (comp) => {
      if (comp.children) {
        for (const child of comp.children) {
          if (child.id === childId) return comp;
          const found = find(child);
          if (found) return found;
        }
      }
      return null;
    };
    
    return find(components);
  },
  
  // Add component to parent
  addComponent: (newComponent, parentId) => {
    const { components, updateComponents } = get();
    
    const add = (comp) => {
      if (comp.id === parentId) {
        comp.children = comp.children || [];
        comp.children.push(newComponent);
        return true;
      }
      if (comp.children) {
        for (const child of comp.children) {
          if (add(child)) return true;
        }
      }
      return false;
    };
    
    const newComponents = JSON.parse(JSON.stringify(components));
    add(newComponents);
    updateComponents(newComponents);
  },
  
  // Remove component
  removeComponent: (id) => {
    const { components, updateComponents, selectedId } = get();
    
    if (id === selectedId) {
      set({ selectedId: null });
    }
    
    const remove = (comp) => {
      if (comp.children) {
        comp.children = comp.children.filter(child => {
          if (child.id === id) return false;
          remove(child);
          return true;
        });
      }
    };
    
    const newComponents = JSON.parse(JSON.stringify(components));
    remove(newComponents);
    updateComponents(newComponents);
  },
  
  // Update component properties
  updateComponent: (id, properties) => {
    const { components, updateComponents } = get();
    
    const update = (comp) => {
      if (comp.id === id) {
        comp.properties = { ...comp.properties, ...properties };
        return true;
      }
      if (comp.children) {
        for (const child of comp.children) {
          if (update(child)) return true;
        }
      }
      return false;
    };
    
    const newComponents = JSON.parse(JSON.stringify(components));
    update(newComponents);
    updateComponents(newComponents);
  },
  
  // Undo
  undo: () => {
    const state = get();
    if (state.historyIndex > 0) {
      set({
        components: JSON.parse(JSON.stringify(state.history[state.historyIndex - 1])),
        historyIndex: state.historyIndex - 1
      });
    }
  },
  
  // Redo
  redo: () => {
    const state = get();
    if (state.historyIndex < state.history.length - 1) {
      set({
        components: JSON.parse(JSON.stringify(state.history[state.historyIndex + 1])),
        historyIndex: state.historyIndex + 1
      });
    }
  },
  
  // Can undo/redo
  canUndo: () => get().historyIndex > 0,
  canRedo: () => get().historyIndex < get().history.length - 1
}));
