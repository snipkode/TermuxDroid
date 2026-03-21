import React from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
} from '@mui/material';
import { Description as FileIcon } from '@mui/icons-material';

export default function LayoutSelector({ layouts, currentLayoutId, onChange }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <FileIcon fontSize="small" sx={{ color: 'text.secondary' }} />
      <FormControl size="small" sx={{ minWidth: 200 }}>
        <InputLabel id="layout-selector-label">Layout</InputLabel>
        <Select
          labelId="layout-selector-label"
          value={currentLayoutId || ''}
          label="Layout"
          onChange={(e) => onChange(e.target.value)}
          sx={{ bgcolor: 'rgba(255,255,255,0.1)' }}
        >
          {layouts.map((layout) => (
            <MenuItem key={layout.id} value={layout.id}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <FileIcon fontSize="small" sx={{ color: 'primary.main' }} />
                <Typography variant="body2">{layout.name}.xml</Typography>
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
}
