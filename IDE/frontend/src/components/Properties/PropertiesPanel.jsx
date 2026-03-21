import React from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Grid,
  Divider,
  Chip,
  IconButton,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  MenuItem,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  ExpandMore as ExpandMoreIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { useCanvasStore } from '@stores/canvasStore';
import { useProjectStore } from '@stores/projectStore';

export default function PropertiesPanel() {
  const { getSelectedComponent, updateComponent, selectedId } = useCanvasStore();
  const { updateLayout, currentLayoutId } = useProjectStore();
  
  const component = getSelectedComponent();
  
  const handlePropertyChange = async (key, value) => {
    if (!component) return;
    
    const updatedProperties = {
      ...component.properties,
      [key]: value,
    };
    
    updateComponent(component.id, updatedProperties);
    
    // Auto-save to backend (debounced in parent)
    // The canvas store will trigger the save
  };
  
  if (!component) {
    return (
      <Paper
        sx={{
          width: 280,
          borderLeft: 1,
          borderColor: 'divider',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ p: 1.5, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="subtitle2" fontSize={13} fontWeight={600}>
            ⚙️ Properties
          </Typography>
        </Box>

        <Box
          sx={{
            flex: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            p: 2,
          }}
        >
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              No component selected
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Click a component to edit
            </Typography>
          </Box>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper
      sx={{
        width: 280,
        borderLeft: 1,
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Box sx={{ p: 1.5, borderBottom: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <Typography variant="subtitle2" fontSize={13} fontWeight={600} sx={{ flexGrow: 1 }}>
            ⚙️ Properties
          </Typography>
          <Chip label={component.type} size="small" color="primary" variant="outlined" sx={{ height: 20, fontSize: 10 }} />
        </Box>
        <Typography variant="caption" color="text.secondary">
          {component.id || 'unnamed'}
        </Typography>
      </Box>
      
      {/* Properties Content */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 1.5 }}>
        {/* ID Property */}
        <Box sx={{ mb: 1.5 }}>
          <Typography variant="caption" fontWeight={600} display="block" gutterBottom>
            Identity
          </Typography>
          <TextField
            fullWidth
            size="small"
            label="ID"
            value={component.id || ''}
            onChange={(e) => handlePropertyChange('id', e.target.value)}
            helperText="Unique identifier"
            InputLabelProps={{ shrink: true, sx: { fontSize: 11 } }}
            inputProps={{ sx: { py: 0.75, fontSize: 12 } }}
            FormHelperTextProps={{ sx: { fontSize: 10 } }}
          />
        </Box>

        <Divider sx={{ my: 1.5 }} />

        {/* Layout Properties */}
        <Accordion defaultExpanded disableGutters>
          <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ minHeight: 36 }}>
            <Typography variant="caption" fontWeight={600} fontSize={11}>
              📐 Layout
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 0, pt: 0.5 }}>
            <Grid container spacing={1}>
              <Grid size={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Width"
                  value={component.properties?.layout_width || 'wrap_content'}
                  onChange={(e) => handlePropertyChange('layout_width', e.target.value)}
                  select
                  InputLabelProps={{ shrink: true, sx: { fontSize: 11 } }}
                  inputProps={{ sx: { py: 0.5, fontSize: 12 } }}
                >
                  <MenuItem value="wrap_content">WRAP</MenuItem>
                  <MenuItem value="match_parent">MATCH</MenuItem>
                  <MenuItem value="0dp">0dp</MenuItem>
                </TextField>
              </Grid>
              <Grid size={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Height"
                  value={component.properties?.layout_height || 'wrap_content'}
                  onChange={(e) => handlePropertyChange('layout_height', e.target.value)}
                  select
                  InputLabelProps={{ shrink: true, sx: { fontSize: 11 } }}
                  inputProps={{ sx: { py: 0.5, fontSize: 12 } }}
                >
                  <MenuItem value="wrap_content">WRAP</MenuItem>
                  <MenuItem value="match_parent">MATCH</MenuItem>
                  <MenuItem value="0dp">0dp</MenuItem>
                </TextField>
              </Grid>

              <Grid size={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Margin Start"
                  value={component.properties?.layout_marginStart || ''}
                  onChange={(e) => handlePropertyChange('layout_marginStart', e.target.value)}
                  placeholder="16dp"
                  InputLabelProps={{ shrink: true, sx: { fontSize: 11 } }}
                  inputProps={{ sx: { py: 0.5, fontSize: 12 } }}
                />
              </Grid>
              <Grid size={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Margin End"
                  value={component.properties?.layout_marginEnd || ''}
                  onChange={(e) => handlePropertyChange('layout_marginEnd', e.target.value)}
                  placeholder="16dp"
                  InputLabelProps={{ shrink: true, sx: { fontSize: 11 } }}
                  inputProps={{ sx: { py: 0.5, fontSize: 12 } }}
                />
              </Grid>

              <Grid size={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Margin Top"
                  value={component.properties?.layout_marginTop || ''}
                  onChange={(e) => handlePropertyChange('layout_marginTop', e.target.value)}
                  placeholder="16dp"
                  InputLabelProps={{ shrink: true, sx: { fontSize: 11 } }}
                  inputProps={{ sx: { py: 0.5, fontSize: 12 } }}
                />
              </Grid>
              <Grid size={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Margin Bottom"
                  value={component.properties?.layout_marginBottom || ''}
                  onChange={(e) => handlePropertyChange('layout_marginBottom', e.target.value)}
                  placeholder="16dp"
                  InputLabelProps={{ shrink: true, sx: { fontSize: 11 } }}
                  inputProps={{ sx: { py: 0.5, fontSize: 12 } }}
                />
              </Grid>

              <Grid size={12}>
                <TextField
                  fullWidth
                  size="small"
                  label="Padding"
                  value={component.properties?.padding || ''}
                  onChange={(e) => handlePropertyChange('padding', e.target.value)}
                  placeholder="16dp"
                  InputLabelProps={{ shrink: true, sx: { fontSize: 11 } }}
                  inputProps={{ sx: { py: 0.5, fontSize: 12 } }}
                />
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        {/* Text Properties (for TextView, Button, etc.) */}
        {(component.type.includes('Text') || component.type.includes('Button')) && (
          <Accordion defaultExpanded disableGutters>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ minHeight: 36 }}>
              <Typography variant="caption" fontWeight={600} fontSize={11}>
                📝 Text
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 0, pt: 0.5 }}>
              <Grid container spacing={1}>
                {component.type.includes('Button') ? (
                  <Grid size={12}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Text"
                      value={component.properties?.text || ''}
                      onChange={(e) => handlePropertyChange('text', e.target.value)}
                      InputLabelProps={{ shrink: true, sx: { fontSize: 11 } }}
                      inputProps={{ sx: { py: 0.5, fontSize: 12 } }}
                    />
                  </Grid>
                ) : (
                  <>
                    <Grid size={12}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Text"
                        value={component.properties?.text || ''}
                        onChange={(e) => handlePropertyChange('text', e.target.value)}
                        multiline
                        rows={2}
                        InputLabelProps={{ shrink: true, sx: { fontSize: 11 } }}
                        inputProps={{ sx: { py: 0.5, fontSize: 12 } }}
                      />
                    </Grid>
                    <Grid size={6}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Text Size"
                        value={component.properties?.textSize || ''}
                        onChange={(e) => handlePropertyChange('textSize', e.target.value)}
                        placeholder="16sp"
                        InputLabelProps={{ shrink: true, sx: { fontSize: 11 } }}
                        inputProps={{ sx: { py: 0.5, fontSize: 12 } }}
                      />
                    </Grid>
                    <Grid size={6}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Text Color"
                        type="color"
                        value={component.properties?.textColor || '#000000'}
                        onChange={(e) => handlePropertyChange('textColor', e.target.value)}
                        InputLabelProps={{ shrink: true, sx: { fontSize: 11 } }}
                        inputProps={{ sx: { py: 0.5, fontSize: 12 } }}
                      />
                    </Grid>
                  </>
                )}
              </Grid>
            </AccordionDetails>
          </Accordion>
        )}

        {/* Input Properties (for EditText) */}
        {component.type === 'EditText' && (
          <Accordion defaultExpanded disableGutters>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ minHeight: 36 }}>
              <Typography variant="caption" fontWeight={600} fontSize={11}>
                ⌨️ Input
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 0, pt: 0.5 }}>
              <Grid container spacing={1}>
                <Grid size={12}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Hint"
                    value={component.properties?.hint || ''}
                    onChange={(e) => handlePropertyChange('hint', e.target.value)}
                    placeholder="Placeholder"
                    InputLabelProps={{ shrink: true, sx: { fontSize: 11 } }}
                    inputProps={{ sx: { py: 0.5, fontSize: 12 } }}
                  />
                </Grid>
                <Grid size={12}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Input Type"
                    value={component.properties?.inputType || 'text'}
                    onChange={(e) => handlePropertyChange('inputType', e.target.value)}
                    select
                    InputLabelProps={{ shrink: true, sx: { fontSize: 11 } }}
                    inputProps={{ sx: { py: 0.5, fontSize: 12 } }}
                  >
                    <MenuItem value="text">Text</MenuItem>
                    <MenuItem value="textPassword">Password</MenuItem>
                    <MenuItem value="number">Number</MenuItem>
                    <MenuItem value="phone">Phone</MenuItem>
                    <MenuItem value="email">Email</MenuItem>
                  </TextField>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        )}

        {/* Layout-Specific Properties */}
        {component.type === 'LinearLayout' && (
          <Accordion defaultExpanded disableGutters>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ minHeight: 36 }}>
              <Typography variant="caption" fontWeight={600} fontSize={11}>
                📐 Orientation
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 0, pt: 0.5 }}>
              <TextField
                fullWidth
                size="small"
                label="Orientation"
                value={component.properties?.orientation || 'vertical'}
                onChange={(e) => handlePropertyChange('orientation', e.target.value)}
                select
                InputLabelProps={{ shrink: true, sx: { fontSize: 11 } }}
                inputProps={{ sx: { py: 0.5, fontSize: 12 } }}
              >
                <MenuItem value="vertical">Vertical</MenuItem>
                <MenuItem value="horizontal">Horizontal</MenuItem>
              </TextField>
            </AccordionDetails>
          </Accordion>
        )}

        {/* Background */}
        <Accordion disableGutters>
          <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ minHeight: 36 }}>
            <Typography variant="caption" fontWeight={600} fontSize={11}>
              🎨 Background
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 0, pt: 0.5 }}>
            <TextField
              fullWidth
              size="small"
              label="Background"
              value={component.properties?.background || ''}
              onChange={(e) => handlePropertyChange('background', e.target.value)}
              placeholder="@color/primary or #FFFFFF"
              InputLabelProps={{ shrink: true, sx: { fontSize: 11 } }}
              inputProps={{ sx: { py: 0.5, fontSize: 12 } }}
            />
          </AccordionDetails>
        </Accordion>

      </Box>

      {/* Footer */}
      <Box sx={{ p: 1.5, borderTop: 1, borderColor: 'divider', bgcolor: 'action.hover' }}>
        <Typography variant="caption" color="text.secondary" fontSize={10}>
          💡 Auto-saved
        </Typography>
      </Box>
    </Paper>
  );
}
