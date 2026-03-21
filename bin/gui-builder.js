#!/usr/bin/env node

/**
 * GUI Builder Launcher for TermuxDroid
 * Starts both backend and frontend servers
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');

console.log(`
╔═══════════════════════════════════════════════════════════╗
║         🎨 GUI Builder for TermuxDroid                     ║
║         Visual Drag & Drop Editor for Android UI           ║
╚═══════════════════════════════════════════════════════════╝

📦 Starting servers...
`);

// Start backend
console.log('▶️  Backend: http://localhost:5000');
const backend = spawn('npm', ['run', 'dev'], {
  cwd: join(ROOT, 'IDE', 'backend'),
  stdio: 'inherit',
  shell: true,
});

backend.on('error', (err) => {
  console.error('❌ Backend error:', err.message);
});

// Wait a bit for backend to start, then start frontend
setTimeout(() => {
  console.log('\n▶️  Frontend: http://localhost:3000');
  console.log('\n✨ Open browser: http://localhost:3000\n');
  console.log('─'.repeat(60));
  
  const frontend = spawn('npm', ['run', 'dev'], {
    cwd: join(ROOT, 'IDE', 'frontend'),
    stdio: 'inherit',
    shell: true,
  });

  frontend.on('error', (err) => {
    console.error('❌ Frontend error:', err.message);
  });
}, 2000);

// Handle process exit
process.on('SIGINT', () => {
  console.log('\n\n👋 Shutting down GUI Builder...');
  backend.kill();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n\n👋 Shutting down GUI Builder...');
  backend.kill();
  process.exit(0);
});
