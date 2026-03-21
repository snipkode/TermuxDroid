import React, { useCallback } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { useCanvasStore } from '@stores/canvasStore';

export default function CanvasNode({ component, depth = 0, selectedId, onSelect, onDrop, draggedType }) {
  const { setDropTarget, addComponent, dropTargetId } = useCanvasStore();

  // Use component reference for selection if no ID
  const componentKey = component.id || component._ref || JSON.stringify(component);
  const isSelected = selectedId && (component.id === selectedId || componentKey === selectedId);
  const isDropTarget = dropTargetId && (component.id === dropTargetId || componentKey === dropTargetId);

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
    onSelect(componentKey);
  }, [componentKey, onSelect]);
  
  const renderComponent = () => {
    const { type, properties, children, text, id } = component;

    // Get display text from properties or text field
    const displayText = properties?.text || text || '';
    const textColor = properties?.textColor || '#000000';
    const textSize = properties?.textSize || '14sp';

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
              fontSize: typeof textSize === 'string' ? textSize : `${textSize}px`,
              color: textColor,
              fontWeight: properties?.textStyle === 'bold' ? 'bold' : 'normal',
            }}
          >
            📝 {displayText || 'TextView'}
            {id && <Typography component="span" fontSize={9} color="text.secondary" sx={{ ml: 0.5 }}>#{id}</Typography>}
          </Typography>
        );

      case 'MaterialButton':
      case 'Button':
        return (
          <Box
            sx={{
              ...baseStyles,
              bgcolor: properties?.background || properties?.backgroundTint || '#2196F3',
              color: properties?.textColor || '#FFFFFF',
              py: 0.75,
              px: 1.5,
              textAlign: 'center',
              borderRadius: properties?.cornerRadius ? `${parseInt(properties.cornerRadius)}px` : 1,
              fontWeight: 500,
              fontSize: 13,
            }}
          >
            🔘 {displayText || 'Button'}
            {id && <Typography component="span" fontSize={9} color="inherit" sx={{ ml: 0.5, opacity: 0.8 }}>#{id}</Typography>}
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
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.75 }}>
              <Typography variant="caption" color="primary" fontWeight={600} fontSize={10}>
                📦 {properties?.orientation || 'vertical'}: LinearLayout
              </Typography>
              {id && (
                <Typography component="span" variant="caption" fontSize={9} color="text.secondary">
                  #{id}
                </Typography>
              )}
            </Box>
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
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.75 }}>
              <Typography variant="caption" color="primary" fontWeight={600} fontSize={10}>
                📜 NestedScrollView
              </Typography>
              {id && (
                <Typography component="span" variant="caption" fontSize={9} color="text.secondary">
                  #{id}
                </Typography>
              )}
            </Box>
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
              bgcolor: 'rgba(255, 255, 255, 0.8)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.75 }}>
              <Typography variant="caption" color="primary" fontWeight={600} fontSize={10}>
                📇 MaterialCardView
              </Typography>
              {id && (
                <Typography component="span" variant="caption" fontSize={9} color="text.secondary">
                  #{id}
                </Typography>
              )}
            </Box>
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
