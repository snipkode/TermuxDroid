import React, { useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Tooltip,
  Chip,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  ContentCopy as CopyIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useCanvasStore } from '@stores/canvasStore';
import CanvasNode from './CanvasNode';

export default function Canvas({ components, onChange }) {
  const {
    selectedId,
    selectComponent,
    draggedType,
    setDropTarget,
    addComponent,
    removeComponent,
    zoom,
  } = useCanvasStore();
  
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }, []);
  
  const handleDrop = useCallback((e, targetId = null) => {
    e.preventDefault();
    
    if (draggedType) {
      const newComponent = {
        id: `${draggedType.toLowerCase()}_${Date.now()}`,
        type: draggedType,
        properties: getDefaultProperties(draggedType),
        children: [],
      };
      
      addComponent(newComponent, targetId || components?.id);
      
      if (onChange) {
        // Trigger save after drop
        const updatedComponents = JSON.parse(JSON.stringify(components));
        onChange(updatedComponents);
      }
    }
  }, [draggedType, components, addComponent, onChange]);
  
  const handleSelectComponent = useCallback((id) => {
    selectComponent(id);
  }, [selectComponent]);
  
  const handleDeleteComponent = useCallback(() => {
    if (selectedId) {
      removeComponent(selectedId);
      if (onChange) {
        onChange(components);
      }
    }
  }, [selectedId, components, removeComponent, onChange]);
  
  if (!components) {
    return (
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          bgcolor: 'background.default',
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No layout loaded
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Loading TermuxDroid project...
          </Typography>
        </Box>
      </Box>
    );
  }
  
  return (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        bgcolor: 'background.default',
      }}
    >
      {/* Canvas Toolbar */}
      <Box
        sx={{
          px: 2,
          py: 1,
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'paper',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <Chip
          label={components.type}
          size="small"
          color="primary"
          variant="outlined"
        />
        
        <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
          {components.id || 'root'}
        </Typography>
        
        <Box sx={{ flexGrow: 1 }} />
        
        {selectedId && (
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Tooltip title="Delete Component">
              <IconButton
                size="small"
                color="error"
                onClick={handleDeleteComponent}
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </Box>
        )}
      </Box>
      
      {/* Canvas Area */}
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          p: 3,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
        }}
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, null)}
      >
        <Paper
          elevation={3}
          sx={{
            minWidth: 375,
            minHeight: 667,
            bgcolor: 'white',
            transform: `scale(${zoom})`,
            transformOrigin: 'top center',
            transition: 'transform 0.2s',
          }}
        >
          {/* Device Frame Simulation */}
          <Box
            sx={{
              width: 375,
              minHeight: 667,
              position: 'relative',
            }}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, components.id)}
          >
            <CanvasNode
              component={components}
              depth={0}
              selectedId={selectedId}
              onSelect={handleSelectComponent}
            />
          </Box>
        </Paper>
      </Box>
      
      {/* Canvas Info */}
      <Box
        sx={{
          px: 2,
          py: 1,
          borderTop: 1,
          borderColor: 'divider',
          bgcolor: 'action.hover',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <Typography variant="caption" color="text.secondary">
          📱 Device Preview (375x667)
        </Typography>
        <Typography variant="caption" color="text.secondary">
          •
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Zoom: {Math.round(zoom * 100)}%
        </Typography>
      </Box>
    </Box>
  );
}

// Default properties for new components
function getDefaultProperties(type) {
  const defaults = {
    // Layout properties
    layout_width: 'match_parent',
    layout_height: 'wrap_content',
    
    // TextView
    TextView: {
      layout_width: 'wrap_content',
      layout_height: 'wrap_content',
      text: 'Sample Text',
      textSize: '16sp',
      textColor: '#000000',
    },
    
    // MaterialButton
    MaterialButton: {
      layout_width: 'wrap_content',
      layout_height: 'wrap_content',
      text: 'Button',
    },
    
    // Button
    Button: {
      layout_width: 'wrap_content',
      layout_height: 'wrap_content',
      text: 'Button',
    },
    
    // EditText
    EditText: {
      layout_width: 'match_parent',
      layout_height: 'wrap_content',
      hint: 'Enter text',
      inputType: 'text',
    },
    
    // ImageView
    ImageView: {
      layout_width: '100dp',
      layout_height: '100dp',
      src: '@drawable/ic_launcher',
      scaleType: 'centerCrop',
    },
    
    // LinearLayout
    LinearLayout: {
      layout_width: 'match_parent',
      layout_height: 'wrap_content',
      orientation: 'vertical',
      padding: '16dp',
    },
    
    // ConstraintLayout
    ConstraintLayout: {
      layout_width: 'match_parent',
      layout_height: 'match_parent',
    },
    
    // MaterialCardView
    MaterialCardView: {
      layout_width: 'match_parent',
      layout_height: 'wrap_content',
      cardElevation: '4dp',
      cardCornerRadius: '8dp',
      contentPadding: '16dp',
    },
  };
  
  return defaults[type] || defaults;
}
