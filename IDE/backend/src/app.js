import express from 'express';
import cors from 'cors';
import apiRoutes from './routes/api.routes.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// API Key middleware (optional, for production use)
app.use('/api', (req, res, next) => {
  const apiKey = process.env.REMOTE_API_KEY;
  
  // Skip auth if no API key configured (dev mode)
  if (!apiKey) {
    return next();
  }
  
  const clientKey = req.headers['x-api-key'];
  
  if (!clientKey || clientKey !== apiKey) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized. Valid X-API-Key header required.'
    });
  }
  
  next();
});

// API Routes
app.use('/api', apiRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    projectPath: process.env.PROJECT_PATH 
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: err.message
  });
});

export default app;
