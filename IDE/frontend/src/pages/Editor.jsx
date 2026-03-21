import React, { useEffect, useState } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Snackbar,
  Chip,
  Divider,
  IconButton,
  Tooltip,
  Drawer,
  CssBaseline,
} from '@mui/material';
import {
  Build as BuildIcon,
  Refresh as RefreshIcon,
  Undo as UndoIcon,
  Redo as RedoIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  Save as SaveIcon,
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
import { useProjectStore } from '@stores/projectStore';
import { useCanvasStore } from '@stores/canvasStore';
import Toolbox from '@components/Toolbox/Toolbox';
import Canvas from '@components/Canvas/Canvas';
import PropertiesPanel from '@components/Properties/PropertiesPanel';
import LayoutSelector from '@components/LayoutSelector';

export default function Editor() {
  const {
    project,
    layouts,
    currentLayoutId,
    isLoading,
    isBuilding,
    buildStatus,
    error,
    loadProject,
    setCurrentLayout,
    updateLayout,
    buildProject,
    clearError,
  } = useProjectStore();

  const {
    components,
    loadComponents,
    updateComponents,
    undo,
    redo,
    canUndo,
    canRedo,
    zoom,
    setZoom,
  } = useCanvasStore();

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [drawerOpen, setDrawerOpen] = useState(true);

  const toggleDrawer = () => {
    setDrawerOpen(prev => !prev);
  };

  useEffect(() => {
    // Load existing TermuxDroid project on mount
    loadProject();
  }, []);
  
  // Load components when layout changes
  useEffect(() => {
    if (layouts.length > 0 && currentLayoutId) {
      const layout = layouts.find(l => l.id === currentLayoutId);
      if (layout?.components) {
        loadComponents(layout.components);
      }
    }
  }, [currentLayoutId, layouts]);
  
  const handleComponentChange = async (newComponents) => {
    updateComponents(newComponents);
    
    // Debounced save to backend
    const timeoutId = setTimeout(async () => {
      const result = await updateLayout(currentLayoutId, newComponents);
      if (result.success) {
        setSnackbar({ open: true, message: 'Layout saved!', severity: 'success' });
      }
    }, 500);
    
    return () => clearTimeout(timeoutId);
  };
  
  const handleBuild = async () => {
    const result = await buildProject({ variant: 'debug', install: true });
    if (result.success) {
      setSnackbar({ 
        open: true, 
        message: `Build completed in ${result.data.buildTime}s! APK installed.`, 
        severity: 'success' 
      });
    } else {
      setSnackbar({ 
        open: true, 
        message: `Build failed: ${result.error}`, 
        severity: 'error' 
      });
    }
  };
  
  const handleUndo = () => {
    undo();
  };
  
  const handleRedo = () => {
    redo();
  };
  
  const handleZoomIn = () => {
    setZoom(zoom + 0.1);
  };
  
  const handleZoomOut = () => {
    setZoom(zoom - 0.1);
  };
  
  const handleLayoutChange = (layoutId) => {
    setCurrentLayout(layoutId);
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
      {/* Header */}
      <AppBar position="static" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Toolbar variant="dense" sx={{ minHeight: 48, py: 0.5 }}>
          <Typography variant="subtitle1" sx={{ flexGrow: 1, fontWeight: 600, fontSize: 14 }}>
            🎨 GUI Builder
            <Chip
              label={project?.name || 'TermuxDroid'}
              size="small"
              sx={{ ml: 1, bgcolor: 'rgba(255,255,255,0.15)', height: 20, fontSize: 11 }}
            />
          </Typography>

          {/* Toggle Drawer Button */}
          <Tooltip title={drawerOpen ? 'Close Toolbox' : 'Open Toolbox'}>
            <IconButton
              size="small"
              onClick={toggleDrawer}
              sx={{ color: 'inherit', mr: 1 }}
            >
              {drawerOpen ? <ChevronLeftIcon fontSize="small" /> : <ChevronRightIcon fontSize="small" />}
            </IconButton>
          </Tooltip>

          {/* Layout Selector */}
          {layouts.length > 0 && (
            <LayoutSelector
              layouts={layouts}
              currentLayoutId={currentLayoutId}
              onChange={handleLayoutChange}
            />
          )}

          <Divider orientation="vertical" flexItem sx={{ mx: 0.75 }} />

          {/* Undo/Redo */}
          <Tooltip title="Undo (Ctrl+Z)">
            <span>
              <IconButton
                size="small"
                onClick={handleUndo}
                disabled={!canUndo()}
                sx={{ color: 'inherit', p: 0.5 }}
              >
                <UndoIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>

          <Tooltip title="Redo (Ctrl+Y)">
            <span>
              <IconButton
                size="small"
                onClick={handleRedo}
                disabled={!canRedo()}
                sx={{ color: 'inherit', p: 0.5 }}
              >
                <RedoIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>

          <Divider orientation="vertical" flexItem sx={{ mx: 0.75 }} />

          {/* Zoom Controls */}
          <Tooltip title="Zoom Out">
            <IconButton size="small" onClick={handleZoomOut} sx={{ color: 'inherit', p: 0.5 }}>
              <ZoomOutIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Typography variant="caption" sx={{ mx: 0.5, minWidth: 40, textAlign: 'center', fontSize: 11 }}>
            {Math.round(zoom * 100)}%
          </Typography>

          <Tooltip title="Zoom In">
            <IconButton size="small" onClick={handleZoomIn} sx={{ color: 'inherit', p: 0.5 }}>
              <ZoomInIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Divider orientation="vertical" flexItem sx={{ mx: 0.75 }} />

          {/* Build Button */}
          <Button
            color="inherit"
            variant="contained"
            startIcon={isBuilding ? <CircularProgress size={16} /> : <BuildIcon fontSize="small" />}
            onClick={handleBuild}
            disabled={isBuilding || isLoading}
            sx={{ ml: 0.75, fontSize: 12, px: 1.5, minHeight: 32 }}
          >
            {isBuilding ? 'Building...' : 'Build'}
          </Button>
        </Toolbar>

        {/* Build Status Bar */}
        {buildStatus && (
          <Box sx={{ px: 1.5, pb: 0.75 }}>
            <Alert
              severity={buildStatus.includes('failed') ? 'error' : 'success'}
              size="small"
              onClose={() => clearError()}
              sx={{ fontSize: 12 }}
            >
              {buildStatus}
            </Alert>
          </Box>
        )}
      </AppBar>
      
      {/* Main Content */}
      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative' }}>
        {/* Left: Toolbox Drawer */}
        <Drawer
          variant="persistent"
          open={drawerOpen}
          sx={{
            width: drawerOpen ? 240 : 0,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: 240,
              boxSizing: 'border-box',
              borderRight: 'none',
              boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
            },
          }}
        >
          <Toolbox />
        </Drawer>

        {/* Center: Canvas */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            transition: 'margin-left 0.3s ease-in-out',
            marginLeft: drawerOpen ? 0 : `-240px`,
          }}
        >
          <Canvas
            components={components}
            onChange={handleComponentChange}
          />
        </Box>

        {/* Right: Properties Panel */}
        <PropertiesPanel />
      </Box>
      
      {/* Error Snackbar */}
      {error && (
        <Snackbar 
          open={!!error} 
          autoHideDuration={6000} 
          onClose={clearError}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert severity="error" onClose={clearError}>
            {error}
          </Alert>
        </Snackbar>
      )}
      
      {/* Success/Info Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
