import { create } from 'zustand';
import api from '@services/api';

export const useProjectStore = create((set, get) => ({
  // State
  project: null,
  layouts: [],
  resources: null,
  currentLayoutId: null,
  isLoading: false,
  isBuilding: false,
  error: null,
  buildStatus: null,
  
  // Actions
  loadProject: async (projectPath) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await api.post('/projects/load', { 
        projectPath: projectPath || '/data/data/com.termux/files/home/TermuxDroid' 
      });
      
      const { project, layouts, resources } = response.data;
      
      set({
        project,
        layouts,
        resources,
        currentLayoutId: layouts[0]?.id || null,
        isLoading: false
      });
      
      return { success: true, data: response.data };
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.message;
      set({
        isLoading: false,
        error: errorMsg
      });
      return { success: false, error: errorMsg };
    }
  },
  
  setCurrentLayout: (layoutId) => {
    set({ currentLayoutId: layoutId });
  },
  
  getCurrentLayout: () => {
    const { layouts, currentLayoutId } = get();
    return layouts.find(l => l.id === currentLayoutId) || null;
  },
  
  updateLayout: async (layoutId, components) => {
    try {
      const response = await api.patch(`/layouts/${layoutId}`, { components });
      
      // Update local state
      set(state => ({
        layouts: state.layouts.map(l => 
          l.id === layoutId 
            ? { ...l, components, xml: response.data.xml } 
            : l
        )
      }));
      
      return { success: true, xml: response.data.xml };
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.message;
      return { success: false, error: errorMsg };
    }
  },
  
  buildProject: async (options = {}) => {
    set({ isBuilding: true, buildStatus: 'Starting build...' });
    
    try {
      const response = await api.post('/build', { options });
      set({ 
        isBuilding: false, 
        buildStatus: 'Build completed!',
        lastBuildResult: response.data
      });
      return { success: true, data: response.data };
    } catch (error) {
      const errorMsg = error.response?.data?.error || 
                       error.response?.data?.details || 
                       error.message;
      set({ 
        isBuilding: false, 
        buildStatus: 'Build failed',
        error: errorMsg
      });
      return { success: false, error: errorMsg };
    }
  },
  
  clearError: () => {
    set({ error: null });
  },
  
  resetProject: () => {
    set({
      project: null,
      layouts: [],
      resources: null,
      currentLayoutId: null,
      error: null,
      buildStatus: null
    });
  }
}));
