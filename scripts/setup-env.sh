#!/bin/bash
# Environment Setup Script for TermuxDroid
# Automatically configures ANDROID_HOME and PATH exports

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Get project root directory
PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_DIR"

SDK_ROOT="$PROJECT_DIR/android-sdk"

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  TermuxDroid Environment Setup         ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

# Check if running in Termux
if [ ! -d "/data/data/com.termux" ]; then
    echo -e "${YELLOW}⚠${NC} Not running in Termux environment"
    echo "   Manual environment setup may be required"
    echo ""
fi

# Determine shell config file
if [ -n "$ZSH_VERSION" ]; then
    SHELL_RC="$HOME/.zshrc"
    SHELL_NAME="zsh"
elif [ -n "$BASH_VERSION" ]; then
    SHELL_RC="$HOME/.bashrc"
    SHELL_NAME="bash"
else
    SHELL_RC="$HOME/.bashrc"
    SHELL_NAME="bash"
fi

echo -e "${BLUE}📋 Shell Configuration:${NC}"
echo "   Shell: $SHELL_NAME"
echo "   Config: $SHELL_RC"
echo ""

# Environment variables to set
ANDROID_HOME_EXPORT="export ANDROID_HOME=\"$SDK_ROOT\""
PATH_EXPORT="export PATH=\"\$ANDROID_HOME/cmdline-tools/latest/bin:\$PATH\""

# Check if already configured
if grep -q "ANDROID_HOME.*$SDK_ROOT" "$SHELL_RC" 2>/dev/null; then
    echo -e "${GREEN}✓${NC} ANDROID_HOME already configured in $SHELL_RC"
else
    echo -e "${YELLOW}📝 Adding ANDROID_HOME to $SHELL_RC...${NC}"
    echo "" >> "$SHELL_RC"
    echo "# TermuxDroid Environment" >> "$SHELL_RC"
    echo "$ANDROID_HOME_EXPORT" >> "$SHELL_RC"
    echo -e "${GREEN}✓${NC} ANDROID_HOME added"
fi

if grep -q "PATH.*ANDROID_HOME" "$SHELL_RC" 2>/dev/null; then
    echo -e "${GREEN}✓${NC} PATH with ANDROID_HOME already configured in $SHELL_RC"
else
    echo -e "${YELLOW}📝 Adding PATH export to $SHELL_RC...${NC}"
    echo "$PATH_EXPORT" >> "$SHELL_RC"
    echo -e "${GREEN}✓${NC} PATH export added"
fi

echo ""
echo -e "${BLUE}📌 Environment Variables:${NC}"
echo "   ANDROID_HOME=$SDK_ROOT"
echo "   PATH includes: \$ANDROID_HOME/cmdline-tools/latest/bin"
echo ""

# Set environment for current session
export ANDROID_HOME="$SDK_ROOT"
export PATH="$ANDROID_HOME/cmdline-tools/latest/bin:$PATH"

echo -e "${GREEN}✅ Environment configured for current session!${NC}"
echo ""

# Verify SDK installation
if [ -f "$SDK_ROOT/cmdline-tools/latest/bin/sdkmanager" ]; then
    echo -e "${GREEN}✓${NC} Android SDK found"
    echo "   sdkmanager: $(which sdkmanager)"
    
    # Show installed packages
    echo ""
    echo -e "${BLUE}📦 Installed SDK Packages:${NC}"
    if [ -d "$SDK_ROOT/build-tools" ]; then
        echo "   Build Tools:"
        ls "$SDK_ROOT/build-tools" 2>/dev/null | sed 's/^/      /'
    fi
    if [ -d "$SDK_ROOT/platforms" ]; then
        echo "   Platforms:"
        ls "$SDK_ROOT/platforms" 2>/dev/null | sed 's/^/      /'
    fi
else
    echo -e "${YELLOW}⚠${NC} Android SDK not found at $SDK_ROOT"
    echo "   Run: ./scripts/install-deps.sh --sdk"
    echo ""
fi

echo ""
echo -e "${YELLOW}📌 Note:${NC}"
echo "   Environment will be loaded automatically on next shell session"
echo "   To apply now: source $SHELL_RC"
echo ""
