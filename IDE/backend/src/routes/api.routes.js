import { Router } from 'express';
import { loadProject } from '../controllers/project.controller.js';
import { getLayout, updateLayout } from '../controllers/layout.controller.js';
import { buildProject } from '../controllers/build.controller.js';
import { updateButtonStyle } from '../controllers/style.controller.js';
import { SyncController } from '../controllers/sync.controller.js';

const router = Router();

// Project endpoints
router.post('/projects/load', loadProject);

// Layout endpoints (existing GUI builder)
router.get('/layouts/:id', getLayout);
router.patch('/layouts/:id', updateLayout);

// Style endpoints
router.patch('/styles/button', updateButtonStyle);

// Build endpoints
router.post('/build', buildProject);

// ============================================
// Remote Control API Endpoints
// ============================================

// Sync status
router.get('/sync/status', (req, res) => {
  const controller = req.app.get('syncController');
  if (!controller) {
    return res.status(503).json({ success: false, error: 'Sync controller not initialized' });
  }
  controller.getSyncStatus(req, res);
});

// List all layouts
router.get('/layouts', (req, res) => {
  const controller = req.app.get('syncController');
  if (!controller) {
    return res.status(503).json({ success: false, error: 'Sync controller not initialized' });
  }
  controller.listLayouts(req, res);
});

// Get layout as JSON
router.get('/layout/:name/json', (req, res) => {
  const controller = req.app.get('syncController');
  if (!controller) {
    return res.status(503).json({ success: false, error: 'Sync controller not initialized' });
  }
  controller.getLayoutJson(req, res);
});

// Get layout as XML
router.get('/layout/:name/xml', (req, res) => {
  const controller = req.app.get('syncController');
  if (!controller) {
    return res.status(503).json({ success: false, error: 'Sync controller not initialized' });
  }
  controller.getLayoutXml(req, res);
});

// Update layout from JSON
router.post('/layout/update', (req, res) => {
  const controller = req.app.get('syncController');
  if (!controller) {
    return res.status(503).json({ success: false, error: 'Sync controller not initialized' });
  }
  controller.updateLayout(req, res);
});

// Delete layout
router.delete('/layout/:name', (req, res) => {
  const controller = req.app.get('syncController');
  if (!controller) {
    return res.status(503).json({ success: false, error: 'Sync controller not initialized' });
  }
  controller.deleteLayout(req, res);
});

// Convert XML to JSON
router.post('/convert/xml-to-json', (req, res) => {
  const controller = req.app.get('syncController');
  if (!controller) {
    return res.status(503).json({ success: false, error: 'Sync controller not initialized' });
  }
  controller.convertXmlToJson(req, res);
});

// Convert JSON to XML
router.post('/convert/json-to-xml', (req, res) => {
  const controller = req.app.get('syncController');
  if (!controller) {
    return res.status(503).json({ success: false, error: 'Sync controller not initialized' });
  }
  controller.convertJsonToXml(req, res);
});

// Watch layout for changes
router.post('/sync/watch', (req, res) => {
  const controller = req.app.get('syncController');
  if (!controller) {
    return res.status(503).json({ success: false, error: 'Sync controller not initialized' });
  }
  controller.watchLayout(req, res);
});

export default router;
