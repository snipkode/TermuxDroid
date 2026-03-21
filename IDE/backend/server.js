import http from 'http';
import app from './src/app.js';
import { WebSocketController } from './src/controllers/websocket.controller.js';
import { SyncController } from './src/controllers/sync.controller.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Set project root (TermuxDroid project path)
const PROJECT_ROOT = join(__dirname, '../..');
process.env.PROJECT_PATH = PROJECT_ROOT;

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';
const API_KEY = process.env.REMOTE_API_KEY || null;

// Create HTTP server
const server = http.createServer(app);

// Initialize WebSocket server
const wsController = new WebSocketController(server, {
  path: '/ws'
});

// Initialize Sync Controller and attach to app
const syncController = new SyncController(PROJECT_ROOT, wsController);
app.set('syncController', syncController);
app.set('wsController', wsController);

// Graceful shutdown
const gracefulShutdown = (signal) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  
  // Cleanup sync controller
  syncController.cleanup();
  
  // Close WebSocket connections
  wsController.close();
  
  // Close HTTP server
  server.close(() => {
    console.log('✓ HTTP server closed');
    process.exit(0);
  });
  
  // Force exit after timeout
  setTimeout(() => {
    console.error('⚠ Forced shutdown');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start server
server.listen(PORT, HOST, () => {
  console.log('');
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║     🚀 Remote Control API - TermuxDroid Framework        ║');
  console.log('╠═══════════════════════════════════════════════════════════╣');
  console.log(`║  HTTP Server:  http://${HOST}:${PORT}                       ║`);
  console.log(`║  WebSocket:    ws://${HOST}:${PORT}/ws                      ║`);
  console.log(`║  Project Root: ${PROJECT_ROOT}`);
  console.log(`║  API Key:      ${API_KEY ? 'Enabled' : 'Disabled (dev mode)'}                        ║`);
  console.log('╠═══════════════════════════════════════════════════════════╣');
  console.log('║  Endpoints:                                                ║');
  console.log('║  GET  /api/layouts           - List all layouts           ║');
  console.log('║  GET  /api/layout/:name/json - Get layout as JSON         ║');
  console.log('║  GET  /api/layout/:name/xml  - Get layout as XML          ║');
  console.log('║  POST /api/layout/update     - Update layout from JSON    ║');
  console.log('║  POST /api/convert/xml-to-json  - Convert XML to JSON     ║');
  console.log('║  POST /api/convert/json-to-xml  - Convert JSON to XML     ║');
  console.log('║  GET  /api/sync/status       - Get sync status            ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');
  console.log('');
  console.log('📡 Ready for remote connections...');
  console.log('');
});

export { server, wsController, syncController };
