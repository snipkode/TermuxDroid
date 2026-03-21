import React, { useCallback } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { useCanvasStore } from '@stores/canvasStore';

export default function CanvasNode({ component, depth = 0, selectedId, onSelect }) {
  const { setDropTarget } = useCanvasStore();
  
  const isSelected = component.id === selectedId;
  
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setDropTarget(component.id);
  }, [component.id, setDropTarget]);
  
  const handleClick = useCallback((e) => {
    e.stopPropagation();
    onSelect(component.id);
  }, [component.id, onSelect]);
  
  const renderComponent = () => {
    const { type, properties, children } = component;
    
    const baseStyles = {
      border: isSelected ? '2px solid #2196F3' : '1px dashed #ccc',
      borderRadius: 1,
      p: 1,
      mb: 1,
      cursor: 'pointer',
      transition: 'all 0.2s',
      bgcolor: isSelected ? 'rgba(33, 150, 243, 0.08)' : 'transparent',
      '&:hover': {
        bgcolor: 'rgba(33, 150, 243, 0.04)',
        border: '1px solid #2196F3',
      },
    };
    
    // Render based on component type
    switch (type) {
      case 'TextView':
        return (
          <Typography
            variant="body1"
            sx={{
              ...baseStyles,
              fontSize: properties.textSize || '16sp',
              color: properties.textColor || '#000000',
            }}
          >
            📝 {properties.text || 'TextView'}
          </Typography>
        );
      
      case 'MaterialButton':
      case 'Button':
        return (
          <Box
            sx={{
              ...baseStyles,
              bgcolor: properties.background || '#2196F3',
              color: '#FFFFFF',
              py: 1,
              px: 2,
              textAlign: 'center',
              borderRadius: 2,
              fontWeight: 500,
            }}
          >
            🔘 {properties.text || 'Button'}
          </Box>
        );
      
      case 'EditText':
        return (
          <Box
            sx={{
              ...baseStyles,
              border: isSelected ? '2px solid #2196F3' : '1px solid #ccc',
              borderRadius: 1,
              p: 1.5,
              bgcolor: 'rgba(0,0,0,0.02)',
            }}
          >
            <Typography variant="body2" color="text.secondary">
              ✏️ {properties.hint || 'Enter text'}
            </Typography>
          </Box>
        );
      
      case 'ImageView':
        return (
          <Box
            sx={{
              ...baseStyles,
              width: properties.layout_width || '100dp',
              height: properties.layout_height || '100dp',
              bgcolor: 'rgba(0,0,0,0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography variant="body2" color="text.secondary">
              🖼️ ImageView
            </Typography>
          </Box>
        );
      
      case 'LinearLayout':
        return (
          <Box
            sx={{
              ...baseStyles,
              border: isSelected ? '2px solid #2196F3' : '2px solid #90CAF9',
              p: 2,
              bgcolor: 'rgba(33, 150, 243, 0.02)',
            }}
          >
            <Typography variant="caption" color="primary" fontWeight={600}>
              📦 {properties.orientation || 'vertical'}: LinearLayout
            </Typography>
            <Box sx={{ mt: 1 }}>
              {children?.map((child, index) => (
                <CanvasNode
                  key={child.id || index}
                  component={child}
                  depth={depth + 1}
                  selectedId={selectedId}
                  onSelect={onSelect}
                />
              ))}
            </Box>
          </Box>
        );
      
      case 'ConstraintLayout':
        return (
          <Box
            sx={{
              ...baseStyles,
              border: isSelected ? '2px solid #2196F3' : '2px solid #4DB6AC',
              p: 2,
              bgcolor: 'rgba(77, 182, 172, 0.02)',
              minHeight: 200,
            }}
          >
            <Typography variant="caption" color="primary" fontWeight={600}>
              🔷 ConstraintLayout
            </Typography>
            <Box sx={{ mt: 1 }}>
              {children?.map((child, index) => (
                <CanvasNode
                  key={child.id || index}
                  component={child}
                  depth={depth + 1}
                  selectedId={selectedId}
                  onSelect={onSelect}
                />
              ))}
            </Box>
          </Box>
        );
      
      case 'MaterialCardView':
        return (
          <Paper
            elevation={3}
            sx={{
              ...baseStyles,
              border: isSelected ? '2px solid #2196F3' : 'none',
              p: 2,
              mb: 1,
            }}
          >
            <Typography variant="caption" color="primary" fontWeight={600}>
              📇 MaterialCardView
            </Typography>
            <Box sx={{ mt: 1 }}>
              {children?.map((child, index) => (
                <CanvasNode
                  key={child.id || index}
                  component={child}
                  depth={depth + 1}
                  selectedId={selectedId}
                  onSelect={onSelect}
                />
              ))}
            </Box>
          </Paper>
        );
      
      case 'NestedScrollView':
        return (
          <Box
            sx={{
              ...baseStyles,
              border: isSelected ? '2px solid #2196F3' : '2px solid #FFB74D',
              p: 2,
              bgcolor: 'rgba(255, 183, 77, 0.02)',
            }}
          >
            <Typography variant="caption" color="primary" fontWeight={600}>
              📜 NestedScrollView
            </Typography>
            <Box sx={{ mt: 1 }}>
              {children?.map((child, index) => (
                <CanvasNode
                  key={child.id || index}
                  component={child}
                  depth={depth + 1}
                  selectedId={selectedId}
                  onSelect={onSelect}
                />
              ))}
            </Box>
          </Box>
        );
      
      default:
        // Generic container for unknown types
        return (
          <Box
            sx={{
              ...baseStyles,
              p: 2,
              bgcolor: 'rgba(158, 158, 158, 0.05)',
            }}
          >
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              🔲 {type}
            </Typography>
            {children?.map((child, index) => (
              <CanvasNode
                key={child.id || index}
                component={child}
                depth={depth + 1}
                selectedId={selectedId}
                onSelect={onSelect}
              />
            ))}
          </Box>
        );
    }
  };
  
  return (
    <Box
      onClick={handleClick}
      onDragOver={handleDragOver}
    >
      {renderComponent()}
    </Box>
  );
}
