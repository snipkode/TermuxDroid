import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Alert,
  Snackbar,
  CircularProgress,
  Divider,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Folder as FolderIcon,
  Refresh as RefreshIcon,
  Upload as UploadIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Code as CodeIcon,
  ViewModule as LayoutIcon,
  WebSocket as WebSocketIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

/**
 * Remote Control Page
 * Allows users to manage Android layouts via JSON/XML conversion
 */
export default function RemoteControl() {
  // State
  const [layouts, setLayouts] = useState([]);
  const [selectedLayout, setSelectedLayout] = useState(null);
  const [layoutJson, setLayoutJson] = useState(null);
  const [layoutXml, setLayoutXml] = useState('');
  const [loading, setLoading] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [jsonInput, setJsonInput] = useState('');
  const [viewMode, setViewMode] = useState('preview'); // 'preview' | 'json' | 'xml'

  // WebSocket connection
  useEffect(() => {
    const ws = new WebSocket('ws://localhost:5000/ws');
    
    ws.onopen = () => {
      console.log('WebSocket connected');
      setWsConnected(true);
      showSnackbar('Connected to Remote Control API', 'success');
    };
    
    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setWsConnected(false);
      showSnackbar('Disconnected from server', 'warning');
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      showSnackbar('WebSocket connection error', 'error');
    };
    
    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log('WebSocket message:', message);
        
        if (message.type === 'layout:update') {
          showSnackbar(`Layout ${message.layoutName} updated`, 'info');
          if (selectedLayout === message.layoutName) {
            loadLayout(message.layoutName);
          }
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
    
    return () => {
      ws.close();
    };
  }, [selectedLayout]);
  
  // Load layouts on mount
  useEffect(() => {
    loadLayouts();
  }, []);
  
  // Auto-refresh layouts
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      loadLayouts();
    }, 5000);
    
    return () => clearInterval(interval);
  }, [autoRefresh]);
  
  // Show snackbar
  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };
  
  // Load all layouts
  const loadLayouts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/layouts`);
      setLayouts(response.data.layouts || []);
    } catch (error) {
      console.error('Error loading layouts:', error);
      showSnackbar('Failed to load layouts', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  // Load specific layout
  const loadLayout = async (layoutName) => {
    try {
      setLoading(true);
      setSelectedLayout(layoutName);
      
      // Load JSON
      const jsonRes = await axios.get(`${API_BASE_URL}/layout/${layoutName}/json`);
      setLayoutJson(jsonRes.data.components);
      setJsonInput(JSON.stringify(jsonRes.data.components, null, 2));
      
      // Load XML
      const xmlRes = await axios.get(`${API_BASE_URL}/layout/${layoutName}/xml`);
      setLayoutXml(xmlRes.data.xml);
      
      showSnackbar(`Loaded ${layoutName}`, 'success');
    } catch (error) {
      console.error('Error loading layout:', error);
      showSnackbar(`Failed to load ${layoutName}`, 'error');
    } finally {
      setLoading(false);
    }
  };
  
  // Update layout from JSON
  const updateLayout = async () => {
    if (!selectedLayout) {
      showSnackbar('No layout selected', 'warning');
      return;
    }
    
    try {
      const jsonComponent = JSON.parse(jsonInput);
      
      setLoading(true);
      const response = await axios.post(`${API_BASE_URL}/layout/update`, {
        layoutName: selectedLayout,
        json: jsonComponent
      });
      
      if (response.data.success) {
        showSnackbar(`Layout ${selectedLayout} updated successfully`, 'success');
        loadLayout(selectedLayout);
      }
    } catch (error) {
      console.error('Error updating layout:', error);
      const errorMsg = error.response?.data?.error || error.message;
      showSnackbar(`Failed to update layout: ${errorMsg}`, 'error');
    } finally {
      setLoading(false);
    }
  };
  
  // Download layout as JSON file
  const downloadJson = () => {
    if (!layoutJson) return;
    
    const blob = new Blob([JSON.stringify(layoutJson, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedLayout}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    showSnackbar('Downloaded JSON', 'success');
  };
  
  // Download layout as XML file
  const downloadXml = () => {
    if (!layoutXml) return;
    
    const blob = new Blob([layoutXml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedLayout}.xml`;
    a.click();
    URL.revokeObjectURL(url);
    
    showSnackbar('Downloaded XML', 'success');
  };
  
  // Convert XML to JSON
  const convertXmlToJson = async () => {
    if (!layoutXml) {
      showSnackbar('No XML to convert', 'warning');
      return;
    }
    
    try {
      setLoading(true);
      const response = await axios.post(`${API_BASE_URL}/convert/xml-to-json`, {
        xml: layoutXml
      });
      
      if (response.data.success) {
        setLayoutJson(response.data.components);
        setJsonInput(JSON.stringify(response.data.components, null, 2));
        setViewMode('json');
        showSnackbar('Converted to JSON', 'success');
      }
    } catch (error) {
      console.error('Error converting XML to JSON:', error);
      showSnackbar('Failed to convert XML to JSON', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  // Convert JSON to XML
  const convertJsonToXml = async () => {
    if (!jsonInput) {
      showSnackbar('No JSON to convert', 'warning');
      return;
    }
    
    try {
      setLoading(true);
      const jsonComponent = JSON.parse(jsonInput);
      const response = await axios.post(`${API_BASE_URL}/convert/json-to-xml`, {
        json: jsonComponent,
        full: true
      });
      
      if (response.data.success) {
        setLayoutXml(response.data.xml);
        setViewMode('xml');
        showSnackbar('Converted to XML', 'success');
      }
    } catch (error) {
      console.error('Error converting JSON to XML:', error);
      const errorMsg = error.response?.data?.details?.join(', ') || error.message;
      showSnackbar(`Failed to convert: ${errorMsg}`, 'error');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <WebSocketIcon 
              color={wsConnected ? 'success' : 'error'} 
              sx={{ fontSize: 40 }} 
            />
            <div>
              <Typography variant="h4" component="h1">
                Remote Control API
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {wsConnected ? 'Connected to server' : 'Disconnected from server'}
              </Typography>
            </div>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Tooltip title="Auto-refresh layouts">
              <FormControlLabel
                control={
                  <Switch
                    checked={autoRefresh}
                    onChange={(e) => setAutoRefresh(e.target.checked)}
                    color="primary"
                  />
                }
                label="Auto-refresh"
              />
            </Tooltip>
            
            <IconButton onClick={loadLayouts} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Box>
        </Box>
      </Box>
      
      <Grid container spacing={3}>
        {/* Left Panel - Layout List */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ height: 'calc(100vh - 200px)', overflow: 'auto' }}>
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="h6">Layouts</Typography>
            </Box>
            
            {loading && layouts.length === 0 ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : layouts.length === 0 ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <InfoIcon color="action" sx={{ fontSize: 48, mb: 2 }} />
                <Typography>No layouts found</Typography>
              </Box>
            ) : (
              <List>
                {layouts.map((layout) => (
                  <ListItem
                    key={layout.name}
                    button
                    selected={selectedLayout === layout.name}
                    onClick={() => loadLayout(layout.name)}
                  >
                    <ListItemIcon>
                      <LayoutIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary={layout.name}
                      secondary={
                        <Typography variant="caption" color="text.secondary">
                          {layout.modified 
                            ? new Date(layout.modified).toLocaleString() 
                            : 'Unknown'}
                        </Typography>
                      }
                    />
                    {selectedLayout === layout.name && (
                      <CheckCircleIcon color="success" fontSize="small" />
                    )}
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>
        
        {/* Main Panel - Editor */}
        <Grid item xs={12} md={9}>
          <Paper sx={{ height: 'calc(100vh - 200px)', display: 'flex', flexDirection: 'column' }}>
            {/* Toolbar */}
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="h6">
                    {selectedLayout || 'Select a layout'}
                  </Typography>
                  {selectedLayout && (
                    <Chip
                      label={viewMode}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  )}
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Tooltip title="Download JSON">
                    <IconButton 
                      onClick={downloadJson} 
                      disabled={!layoutJson}
                      size="small"
                    >
                      <DownloadIcon />
                    </IconButton>
                  </Tooltip>
                  
                  <Tooltip title="Download XML">
                    <IconButton 
                      onClick={downloadXml} 
                      disabled={!layoutXml}
                      size="small"
                    >
                      <CodeIcon />
                    </IconButton>
                  </Tooltip>
                  
                  <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
                  
                  <Button
                    variant="outlined"
                    startIcon={<CodeIcon />}
                    onClick={() => setViewMode('json')}
                    size="small"
                  >
                    JSON
                  </Button>
                  
                  <Button
                    variant="outlined"
                    startIcon={<FolderIcon />}
                    onClick={() => setViewMode('xml')}
                    size="small"
                  >
                    XML
                  </Button>
                  
                  <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
                  
                  <Button
                    variant="contained"
                    startIcon={<UploadIcon />}
                    onClick={updateLayout}
                    disabled={!selectedLayout || loading}
                    size="small"
                  >
                    Apply
                  </Button>
                </Box>
              </Box>
            </Box>
            
            {/* Content */}
            <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
              {!selectedLayout ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                  <LayoutIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    Select a layout to edit
                  </Typography>
                </Box>
              ) : loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <CircularProgress />
                </Box>
              ) : viewMode === 'json' ? (
                <TextField
                  fullWidth
                  multiline
                  minRows={30}
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  variant="outlined"
                  sx={{ 
                    fontFamily: 'monospace',
                    '& .MuiOutlinedInput-input': {
                      fontFamily: 'monospace',
                      fontSize: '13px'
                    }
                  }}
                />
              ) : (
                <TextField
                  fullWidth
                  multiline
                  minRows={30}
                  value={layoutXml}
                  onChange={(e) => setLayoutXml(e.target.value)}
                  variant="outlined"
                  sx={{ 
                    fontFamily: 'monospace',
                    '& .MuiOutlinedInput-input': {
                      fontFamily: 'monospace',
                      fontSize: '13px'
                    }
                  }}
                />
              )}
            </Box>
            
            {/* Bottom Actions */}
            {selectedLayout && viewMode === 'json' && (
              <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={<CodeIcon />}
                  onClick={convertJsonToXml}
                  disabled={loading}
                >
                  Convert to XML
                </Button>
                
                <Button
                  variant="contained"
                  startIcon={<UploadIcon />}
                  onClick={updateLayout}
                  disabled={loading}
                  sx={{ ml: 'auto' }}
                >
                  Apply Changes
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
      
      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
