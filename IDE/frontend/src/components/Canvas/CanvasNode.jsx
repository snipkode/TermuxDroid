import React, { useCallback } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { useCanvasStore } from '@stores/canvasStore';

export default function CanvasNode({ component, depth = 0, selectedId, onSelect, onDrop, draggedType }) {
  const { setDropTarget, addComponent, dropTargetId } = useCanvasStore();

  const isSelected = component.id === selectedId;
  const isDropTarget = dropTargetId === component.id && draggedType;

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
    setDropTarget(component.id);
  }, [component.id, setDropTarget]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();

    if (draggedType) {
      const newComponent = {
        id: `${draggedType.toLowerCase()}_${Date.now()}`,
        type: draggedType,
        properties: getDefaultProperties(draggedType),
        children: [],
      };

      addComponent(newComponent, component.id);

      if (onDrop) {
        onDrop();
      }
    }
  }, [draggedType, component.id, addComponent, onDrop]);

  const handleClick = useCallback((e) => {
    e.stopPropagation();
    onSelect(component.id);
  }, [component.id, onSelect]);
  
  const renderComponent = () => {
    const { type, properties, children } = component;

    const baseStyles = {
      border: isDropTarget 
        ? '2px solid #4CAF50' 
        : isSelected 
          ? '2px solid #2196F3' 
          : '1px dashed #ccc',
      borderRadius: 0.75,
      p: 0.75,
      mb: 0.75,
      cursor: 'pointer',
      transition: 'all 0.2s',
      bgcolor: isDropTarget
        ? 'rgba(76, 175, 80, 0.15)'
        : isSelected 
          ? 'rgba(33, 150, 243, 0.08)' 
          : 'transparent',
      '&:hover': {
        bgcolor: 'rgba(33, 150, 243, 0.04)',
        border: isDropTarget ? '2px solid #4CAF50' : '1px solid #2196F3',
      },
    };

    // Render based on component type
    switch (type) {
      case 'TextView':
        return (
          <Typography
            variant="body2"
            sx={{
              ...baseStyles,
              fontSize: properties.textSize || '14sp',
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
              py: 0.5,
              px: 1,
              textAlign: 'center',
              borderRadius: 1,
              fontWeight: 500,
              fontSize: 12,
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
              borderRadius: 0.75,
              p: 1,
              bgcolor: 'rgba(0,0,0,0.02)',
            }}
          >
            <Typography variant="caption" color="text.secondary" fontSize={11}>
              ✏️ {properties.hint || 'Enter text'}
            </Typography>
          </Box>
        );

      case 'ImageView':
        return (
          <Box
            sx={{
              ...baseStyles,
              width: properties.layout_width || '80dp',
              height: properties.layout_height || '80dp',
              bgcolor: 'rgba(0,0,0,0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography variant="caption" color="text.secondary" fontSize={11}>
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
              p: 1.5,
              bgcolor: 'rgba(33, 150, 243, 0.02)',
            }}
          >
            <Typography variant="caption" color="primary" fontWeight={600} fontSize={10}>
              📦 {properties.orientation || 'vertical'}: LinearLayout
            </Typography>
            <Box sx={{ mt: 0.75 }}>
              {children?.map((child, index) => (
                <CanvasNode
                  key={child.id || index}
                  component={child}
                  depth={depth + 1}
                  selectedId={selectedId}
                  onSelect={onSelect}
                  onDrop={onDrop}
                  draggedType={draggedType}
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
              p: 1.5,
              bgcolor: 'rgba(77, 182, 172, 0.02)',
              minHeight: 150,
            }}
          >
            <Typography variant="caption" color="primary" fontWeight={600} fontSize={10}>
              🔷 ConstraintLayout
            </Typography>
            <Box sx={{ mt: 0.75 }}>
              {children?.map((child, index) => (
                <CanvasNode
                  key={child.id || index}
                  component={child}
                  depth={depth + 1}
                  selectedId={selectedId}
                  onSelect={onSelect}
                  onDrop={onDrop}
                  draggedType={draggedType}
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
              p: 1.5,
              mb: 0.75,
            }}
          >
            <Typography variant="caption" color="primary" fontWeight={600} fontSize={10}>
              📇 MaterialCardView
            </Typography>
            <Box sx={{ mt: 0.75 }}>
              {children?.map((child, index) => (
                <CanvasNode
                  key={child.id || index}
                  component={child}
                  depth={depth + 1}
                  selectedId={selectedId}
                  onSelect={onSelect}
                  onDrop={onDrop}
                  draggedType={draggedType}
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
              p: 1.5,
              bgcolor: 'rgba(255, 183, 77, 0.02)',
            }}
          >
            <Typography variant="caption" color="primary" fontWeight={600} fontSize={10}>
              📜 NestedScrollView
            </Typography>
            <Box sx={{ mt: 0.75 }}>
              {children?.map((child, index) => (
                <CanvasNode
                  key={child.id || index}
                  component={child}
                  depth={depth + 1}
                  selectedId={selectedId}
                  onSelect={onSelect}
                  onDrop={onDrop}
                  draggedType={draggedType}
                />
              ))}
            </Box>
          </Box>
        );

      case 'MaterialCardView':
        return (
          <Paper
            elevation={2}
            sx={{
              ...baseStyles,
              border: isSelected ? '2px solid #2196F3' : '1px solid #E0E0E0',
              p: 1.5,
              mb: 0.75,
              bgcolor: 'rgba(255, 255, 255, 0.5)',
            }}
          >
            <Typography variant="caption" color="primary" fontWeight={600} fontSize={10}>
              📇 MaterialCardView
            </Typography>
            <Box sx={{ mt: 0.75 }}>
              {children?.map((child, index) => (
                <CanvasNode
                  key={child.id || index}
                  component={child}
                  depth={depth + 1}
                  selectedId={selectedId}
                  onSelect={onSelect}
                  onDrop={onDrop}
                  draggedType={draggedType}
                />
              ))}
            </Box>
          </Paper>
        );

      default:
        // Generic container for unknown types
        return (
          <Box
            sx={{
              ...baseStyles,
              p: 1.5,
              bgcolor: 'rgba(158, 158, 158, 0.05)',
            }}
          >
            <Typography variant="caption" color="text.secondary" fontWeight={600} fontSize={10}>
              🔲 {type}
            </Typography>
            {children?.map((child, index) => (
              <CanvasNode
                key={child.id || index}
                component={child}
                depth={depth + 1}
                selectedId={selectedId}
                onSelect={onSelect}
                onDrop={onDrop}
                draggedType={draggedType}
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
      onDrop={handleDrop}
      sx={{
        '&:last-child': {
          mb: 0,
        },
      }}
    >
      {renderComponent()}
    </Box>
  );
}
