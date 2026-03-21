import React from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
} from '@mui/material';
import {
  ViewHeadline as LayoutIcon,
  TextFields as TextIcon,
  SmartButton as ButtonIcon,
  Image as ImageIcon,
  CheckBox as CheckboxIcon,
  RadioButtonChecked as RadioIcon,
  ToggleOn as SwitchIcon,
  HourglassEmpty as ProgressIcon,
  ExpandMore as ExpandMoreIcon,
  Apps as AppsIcon,
  ViewList as ListIcon,
  Web as WebIcon,
} from '@mui/icons-material';
import { useCanvasStore } from '@stores/canvasStore';

const ANDROID_COMPONENTS = {
  Layouts: [
    { type: 'LinearLayout', icon: <LayoutIcon />, description: 'Vertical or horizontal arrangement' },
    { type: 'ConstraintLayout', icon: <LayoutIcon />, description: 'Flexible layout with constraints' },
    { type: 'RelativeLayout', icon: <LayoutIcon />, description: 'Position relative to parent/siblings' },
    { type: 'FrameLayout', icon: <LayoutIcon />, description: 'Stack children on top of each other' },
    { type: 'MaterialCardView', icon: <AppsIcon />, description: 'Material Design card container' },
  ],
  Views: [
    { type: 'TextView', icon: <TextIcon />, description: 'Display text content' },
    { type: 'MaterialButton', icon: <ButtonIcon />, description: 'Material Design button' },
    { type: 'EditText', icon: <TextIcon />, description: 'Text input field' },
    { type: 'ImageView', icon: <ImageIcon />, description: 'Display images' },
    { type: 'CheckBox', icon: <CheckboxIcon />, description: 'Checkbox for multiple selection' },
    { type: 'RadioButton', icon: <RadioIcon />, description: 'Radio button for single selection' },
    { type: 'Switch', icon: <SwitchIcon />, description: 'On/off toggle switch' },
    { type: 'ProgressBar', icon: <ProgressIcon />, description: 'Progress indicator' },
    { type: 'Spinner', icon: <ListIcon />, description: 'Dropdown selector' },
  ],
  Containers: [
    { type: 'NestedScrollView', icon: <ListIcon />, description: 'Scrollable container' },
    { type: 'RecyclerView', icon: <ListIcon />, description: 'Efficient scrollable list' },
    { type: 'WebView', icon: <WebIcon />, description: 'Display web content' },
  ],
};

export default function Toolbox() {
  const { setDraggedType } = useCanvasStore();
  
  const handleDragStart = (e, componentType) => {
    setDraggedType(componentType);
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('application/react-component', componentType);
  };
  
  return (
    <Paper
      sx={{
        width: 280,
        borderRight: 1,
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6" fontSize={16}>
          🧰 Toolbox
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Drag components to canvas
        </Typography>
      </Box>
      
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {Object.entries(ANDROID_COMPONENTS).map(([category, components]) => (
          <Accordion defaultExpanded key={category} disableGutters>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{
                px: 2,
                minHeight: 48,
                '& .MuiAccordionSummary-content': {
                  my: 1,
                },
              }}
            >
              <Typography variant="subtitle2" fontWeight={600}>
                {category}
              </Typography>
            </AccordionSummary>
            
            <AccordionDetails sx={{ p: 1 }}>
              <List dense>
                {components.map((component) => (
                  <ListItem key={component.type} disablePadding>
                    <ListItemButton
                      draggable
                      onDragStart={(e) => handleDragStart(e, component.type)}
                      sx={{
                        borderRadius: 1,
                        mb: 0.5,
                        cursor: 'grab',
                        '&:active': {
                          cursor: 'grabbing',
                        },
                        '&:hover': {
                          bgcolor: 'action.hover',
                        },
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 36, color: 'primary.main' }}>
                        {component.icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={component.type}
                        secondary={component.description}
                        primaryTypographyProps={{ fontSize: 13, fontWeight: 500 }}
                        secondaryTypographyProps={{ fontSize: 11 }}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
      
      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', bgcolor: 'action.hover' }}>
        <Typography variant="caption" color="text.secondary">
          💡 Tip: Drag and drop components onto the canvas to build your UI
        </Typography>
      </Box>
    </Paper>
  );
}
