import React from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
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

  const handleDragEnd = () => {
    // Clear dragged type after drag ends
    setTimeout(() => setDraggedType(null), 100);
  };
  
  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <Box sx={{ p: 1.5, borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
        <Typography variant="subtitle2" fontSize={13} fontWeight={600}>
          🧰 Toolbox
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Drag to canvas
        </Typography>
      </Box>

      <Box sx={{ flex: 1, overflow: 'auto', bgcolor: 'background.paper' }}>
        {Object.entries(ANDROID_COMPONENTS).map(([category, components]) => (
          <Accordion defaultExpanded key={category} disableGutters>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{
                px: 1.5,
                minHeight: 40,
                '& .MuiAccordionSummary-content': {
                  my: 0.75,
                },
              }}
            >
              <Typography variant="caption" fontWeight={600} fontSize={11}>
                {category}
              </Typography>
            </AccordionSummary>

            <AccordionDetails sx={{ p: 0.5 }}>
              <List dense>
                {components.map((component) => (
                  <ListItem key={component.type} disablePadding>
                    <ListItemButton
                      draggable
                      onDragStart={(e) => handleDragStart(e, component.type)}
                      onDragEnd={handleDragEnd}
                      sx={{
                        borderRadius: 0.75,
                        mb: 0.25,
                        cursor: 'grab',
                        px: 1,
                        py: 0.5,
                        '&:active': {
                          cursor: 'grabbing',
                        },
                        '&:hover': {
                          bgcolor: 'action.hover',
                        },
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 32, color: 'primary.main' }}>
                        {React.cloneElement(component.icon, { fontSize: 'small' })}
                      </ListItemIcon>
                      <ListItemText
                        primary={component.type}
                        secondary={component.description}
                        primaryTypographyProps={{ fontSize: 12, fontWeight: 500 }}
                        secondaryTypographyProps={{ fontSize: 10, noWrap: true }}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>

      <Box sx={{ p: 1.5, borderTop: 1, borderColor: 'divider', bgcolor: 'action.hover' }}>
        <Typography variant="caption" color="text.secondary">
          💡 Drag components to canvas
        </Typography>
      </Box>
    </Box>
  );
}
