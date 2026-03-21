#!/usr/bin/env node

/**
 * TermuxDroid Orchestrator
 * Node.js script runner for common tasks
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Project root is one level up from bin/
const PROJECT_ROOT = dirname(__dirname);

// Available commands
const COMMANDS = {
  dev: {
    script: './scripts/dev.sh',
    description: 'Run development mode',
  },
  build: {
    script: './scripts/build.sh --debug --no-prompt',
    description: 'Build debug APK (auto-install)',
  },
  'build:release': {
    script: './scripts/build.sh --release',
    description: 'Build release APK (auto-sign if keystore exists)',
  },
  'build:aab': {
    script: './scripts/build.sh --aab',
    description: 'Build AAB for Play Store (auto-sign if keystore exists)',
  },
  doctor: {
    script: './scripts/setup-check.sh',
    description: 'Check environment setup',
  },
  keystore: {
    script: './scripts/keystore.sh',
    description: 'Create/manage signing keystore',
  },
  clean: {
    script: './gradlew clean',
    description: 'Clean build artifacts',
  },
  install: {
    script: './scripts/install-apk.sh',
    description: 'Install APK to device',
  },
  'install-deps': {
    script: './scripts/install-deps.sh --all -y',
    description: 'Install all dependencies',
  },
};

function printHelp() {
  console.log(`
TermuxDroid Orchestrator

Usage:
  npm run <command>
  node bin/orchestrator.js <command>

Available commands:
${Object.entries(COMMANDS)
  .map(([name, cmd]) => `  ${name.padEnd(13)} - ${cmd.description}`)
  .join('\n')}

Examples:
  npm run dev       - Start development mode
  npm run build     - Build the project
  npm run setup     - Install all dependencies (first-time setup)
  npm run doctor    - Check environment
`);
}

function runCommand(command) {
  const cmdConfig = COMMANDS[command];

  if (!cmdConfig) {
    console.error(`❌ Unknown command: ${command}`);
    printHelp();
    process.exit(1);
  }

  const [script, ...args] = cmdConfig.script.split(' ');
  
  console.log(`🚀 Running: ${cmdConfig.script}`);
  console.log('─'.repeat(40));

  const child = spawn(script, args, {
    stdio: 'inherit',
    shell: true,
    cwd: PROJECT_ROOT,
  });

  child.on('error', (err) => {
    console.error(`❌ Failed to start: ${err.message}`);
    process.exit(1);
  });

  child.on('close', (code) => {
    if (code === 0) {
      console.log('─'.repeat(40));
      console.log(`✅ Command '${command}' completed successfully`);
    } else {
      console.error(`❌ Command '${command}' failed with code ${code}`);
    }
    process.exit(code);
  });
}

// Main
const args = process.argv.slice(2);
const command = args[0];

if (!command || args.includes('--help') || args.includes('-h')) {
  printHelp();
  process.exit(0);
}

runCommand(command);
