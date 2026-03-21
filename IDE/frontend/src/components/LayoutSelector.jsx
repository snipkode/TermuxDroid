import React from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  IconButton,
} from '@mui/material';
import {
  Description as FileIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';

export default function LayoutSelector({ layouts, currentLayoutId, onChange }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      <FileIcon fontSize="small" sx={{ color: 'text.secondary', fontSize: 16 }} />
      <FormControl size="small" sx={{ minWidth: 160 }}>
        <InputLabel id="layout-selector-label" sx={{ fontSize: 11 }}>Layout</InputLabel>
        <Select
          labelId="layout-selector-label"
          value={currentLayoutId || ''}
          label="Layout"
          onChange={(e) => onChange(e.target.value)}
          sx={{
            bgcolor: 'rgba(255,255,255,0.1)',
            minHeight: 32,
            '& .MuiSelect-select': {
              py: 0.5,
              fontSize: 12,
            },
            '& .MuiSvgIcon-root': {
              fontSize: 16,
            }
          }}
          IconComponent={ExpandMoreIcon}
        >
          {layouts.map((layout) => (
            <MenuItem key={layout.id} value={layout.id} sx={{ py: 0.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <FileIcon fontSize="small" sx={{ color: 'primary.main', fontSize: 16 }} />
                <Typography variant="body2" fontSize={12}>{layout.name}.xml</Typography>
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
}
