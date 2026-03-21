#!/bin/bash

# ============================================
# Remote Control API Server Startup Script
# TermuxDroid Framework
# ============================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Project paths
PROJECT_ROOT="/data/data/com.termux/files/home/TermuxDroid"
BACKEND_DIR="$PROJECT_ROOT/IDE/backend"
ENV_FILE="$BACKEND_DIR/.env"

echo ""
echo -e "${CYAN}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║     🚀 Remote Control API - TermuxDroid Framework        ║${NC}"
echo -e "${CYAN}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if running in Termux
if [[ ! -d "/data/data/com.termux" ]]; then
    echo -e "${YELLOW}⚠ Warning: Not running in Termux environment${NC}"
    echo -e "${YELLOW}  Make sure you have proper permissions to access project files${NC}"
    echo ""
fi

# Navigate to backend directory
cd "$BACKEND_DIR"
echo -e "${BLUE}📁 Backend directory:${NC} $BACKEND_DIR"
echo ""

# Check Node.js version
echo -e "${BLUE}Checking Node.js...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}✗ Node.js is not installed${NC}"
    echo ""
    echo "Install Node.js with:"
    echo "  pkg install nodejs"
    exit 1
fi

NODE_VERSION=$(node --version)
echo -e "${GREEN}✓ Node.js: ${NODE_VERSION}${NC}"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo ""
    echo -e "${YELLOW}📦 Installing dependencies...${NC}"
    npm install
    echo -e "${GREEN}✓ Dependencies installed${NC}"
fi

# Create .env if not exists
if [ ! -f "$ENV_FILE" ]; then
    echo ""
    echo -e "${YELLOW}Creating .env file...${NC}"
    cat > "$ENV_FILE" << 'EOF'
# Remote Control API Configuration

# Server settings
PORT=5000
HOST=0.0.0.0

# API Key (optional, for production use)
# Leave empty or comment out for development mode (no authentication)
# Generate a secure key with: openssl rand -hex 32
# REMOTE_API_KEY=your-secure-api-key-here

# Project path (auto-detected, but can be overridden)
# PROJECT_PATH=/data/data/com.termux/files/home/TermuxDroid
EOF
    echo -e "${GREEN}✓ .env file created at: $ENV_FILE${NC}"
    echo -e "${YELLOW}  Edit this file to configure API key for production use${NC}"
fi

# Display configuration
echo ""
echo -e "${BLUE}Configuration:${NC}"
if [ -f "$ENV_FILE" ]; then
    echo -e "  ${CYAN}Environment file:${NC} .env"
else
    echo -e "  ${YELLOW}No .env file (using defaults)${NC}"
fi

# Get local IP for remote access
LOCAL_IP=$(hostname -I 2>/dev/null | awk '{print $1}' || echo "localhost")
echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                    Server Starting...                     ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}Local:${NC}      http://localhost:5000"
echo -e "${BLUE}Network:${NC}    http://$LOCAL_IP:5000"
echo -e "${BLUE}WebSocket:${NC}  ws://$LOCAL_IP:5000/ws"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop the server${NC}"
echo ""

# Start the server
npm run dev
