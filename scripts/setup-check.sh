#!/bin/bash
# Environment Setup Checklist for TermuxDroid
# Run this script to verify your development environment

# Don't exit on error - we want to show all checks
set +e

# Get project root directory (parent of scripts/)
PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_DIR"

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  TermuxDroid Environment Checklist    ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

PASS=0
FAIL=0
WARN=0

# Function to check command
check_cmd() {
    local cmd=$1
    local desc=$2
    
    if command -v $cmd &> /dev/null; then
        echo -e "${GREEN}✓${NC} $desc ($cmd)"
        ((PASS++))
        return 0
    else
        echo -e "${RED}✗${NC} $desc ($cmd) - NOT FOUND"
        ((FAIL++))
        return 1
    fi
}

# Function to check with warning
check_warn() {
    local cmd=$1
    local desc=$2
    local install_hint=$3
    
    if command -v $cmd &> /dev/null; then
        echo -e "${GREEN}✓${NC} $desc"
        ((PASS++))
        return 0
    else
        echo -e "${YELLOW}⚠${NC} $desc - Optional: $install_hint"
        ((WARN++))
        return 1
    fi
}

# Function to check file
check_file() {
    local file=$1
    local desc=$2
    
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $desc"
        ((PASS++))
        return 0
    else
        echo -e "${RED}✗${NC} $desc - NOT FOUND"
        ((FAIL++))
        return 1
    fi
}

echo -e "${YELLOW}📋 Checking Prerequisites...${NC}"
echo "─────────────────────────────────────"

# Check Termux
if [ -d "/data/data/com.termux" ]; then
    echo -e "${GREEN}✓${NC} Running in Termux"
    ((PASS++))
else
    echo -e "${YELLOW}⚠${NC} Not running in Termux (may still work)"
    ((WARN++))
fi

# Check Java
echo ""
echo -e "${YELLOW}📋 Checking Java...${NC}"
echo "─────────────────────────────────────"
if command -v java &> /dev/null; then
    JAVA_VER=$(java -version 2>&1 | head -1)
    echo -e "${GREEN}✓${NC} Java installed: $JAVA_VER"
    ((PASS++))
else
    echo -e "${RED}✗${NC} Java NOT FOUND"
    echo -e "   ${BLUE}Install: pkg install openjdk-17${NC}"
    ((FAIL++))
fi

# Check Android Build Tools
echo ""
echo -e "${YELLOW}📋 Checking Android Tools...${NC}"
echo "─────────────────────────────────────"
check_cmd "adb" "ADB (Android Debug Bridge)"

# Check Gradle Wrapper
echo ""
echo -e "${YELLOW}📋 Checking Build Tools...${NC}"
echo "─────────────────────────────────────"
check_file "gradlew" "Gradle Wrapper"
check_file "build.gradle" "Build Configuration"
check_file "settings.gradle" "Settings Configuration"

# Check Project Structure
echo ""
echo -e "${YELLOW}📋 Checking Project Structure...${NC}"
echo "─────────────────────────────────────"
check_file "app/src/main/AndroidManifest.xml" "Android Manifest"
check_file "app/build.gradle" "App Build Configuration"

# Check Source Files
echo ""
echo -e "${YELLOW}📋 Checking Source Files...${NC}"
echo "─────────────────────────────────────"
if [ -d "app/src/main/java" ]; then
    JAVA_FILES=$(find app/src/main/java -name "*.java" | wc -l)
    echo -e "${GREEN}✓${NC} Java files found: $JAVA_FILES"
    ((PASS++))
else
    echo -e "${RED}✗${NC} Java source directory NOT FOUND"
    ((FAIL++))
fi

if [ -d "app/src/main/res" ]; then
    RES_FILES=$(find app/src/main/res -type f | wc -l)
    echo -e "${GREEN}✓${NC} Resource files found: $RES_FILES"
    ((PASS++))
else
    echo -e "${RED}✗${NC} Resource directory NOT FOUND"
    ((FAIL++))
fi

# Check Optional Tools
echo ""
echo -e "${YELLOW}📋 Checking Optional Tools (Recommended)${NC}"
echo "─────────────────────────────────────"
check_warn "inotifywait" "inotifywait (auto-reload watcher)" "pkg install inotify-tools"
check_warn "watch" "watch command" "pkg install procps-ng"

# Check APK Signing & Analysis Tools
echo ""
echo -e "${YELLOW}📋 Checking APK Signing & Analysis Tools${NC}"
echo "─────────────────────────────────────"

if command -v apksigner &> /dev/null; then
    echo -e "${GREEN}✓${NC} apksigner (Android APK signer)"
    ((PASS++))
else
    echo -e "${YELLOW}⚠${NC} apksigner NOT FOUND"
    echo -e "   ${BLUE}Install: pkg install apksigner${NC}"
    ((WARN++))
fi

if command -v zipalign &> /dev/null; then
    echo -e "${GREEN}✓${NC} zipalign (APK alignment optimizer)"
    ((PASS++))
else
    echo -e "${YELLOW}⚠${NC} zipalign NOT FOUND"
    echo -e "   ${BLUE}Install: See rendiix/termux-zipalign${NC}"
    ((WARN++))
fi

# Check bundletool
if [ -f "$PROJECT_DIR/bin/bundletool.jar" ] || command -v bundletool &> /dev/null; then
    echo -e "${GREEN}✓${NC} bundletool (AAB to APK converter)"
    ((PASS++))
else
    echo -e "${YELLOW}⚠${NC} bundletool NOT FOUND"
    echo -e "   ${BLUE}Install: Auto-downloaded with --aab flag${NC}"
    ((WARN++))
fi

# Check Signing Tools
echo ""
echo -e "${YELLOW}📋 Checking Signing Tools (For Release Builds)${NC}"
echo "─────────────────────────────────────"

if command -v keytool &> /dev/null; then
    echo -e "${GREEN}✓${NC} keytool (for keystore generation)"
    ((PASS++))
else
    echo -e "${RED}✗${NC} keytool NOT FOUND"
    echo -e "   ${BLUE}Install: pkg install openjdk-17${NC}"
    ((FAIL++))
fi

if command -v jarsigner &> /dev/null; then
    echo -e "${GREEN}✓${NC} jarsigner (for signing APK/AAB)"
    ((PASS++))
else
    echo -e "${RED}✗${NC} jarsigner NOT FOUND"
    echo -e "   ${BLUE}Install: pkg install openjdk-17${NC}"
    ((FAIL++))
fi

if command -v apksigner &> /dev/null; then
    echo -e "${GREEN}✓${NC} apksigner (Android APK signer)"
    ((PASS++))
else
    echo -e "${YELLOW}⚠${NC} apksigner NOT FOUND"
    echo -e "   Install Android SDK build-tools for apksigner"
    ((WARN++))
fi

# Check existing keystore
if [ -f "keystore/release.keystore" ]; then
    echo -e "${GREEN}✓${NC} Keystore found: keystore/release.keystore"
    ((PASS++))
else
    echo -e "${YELLOW}⚠${NC} No keystore found"
    echo -e "   ${BLUE}Create: ./scripts/keystore.sh --create${NC}"
    ((WARN++))
fi

# Check Device Connection
echo ""
echo -e "${YELLOW}📋 Checking Device Connection...${NC}"
echo "─────────────────────────────────────"
DEVICE_COUNT=$(adb devices 2>/dev/null | grep -v "List" | wc -l)
if [ "$DEVICE_COUNT" -gt 0 ]; then
    echo -e "${GREEN}✓${NC} Device(s) connected: $DEVICE_COUNT"
    adb devices | grep -v "List" | awk '{print "   → " $1}'
    ((PASS++))
else
    echo -e "${YELLOW}⚠${NC} No device connected"
    echo -e "   ${BLUE}Connect device and enable USB debugging${NC}"
    ((WARN++))
fi

# Summary
echo ""
echo "══════════════════════════════════════"
echo -e "${BLUE}📊 Summary${NC}"
echo "══════════════════════════════════════"
echo -e "${GREEN}Passed: $PASS${NC}"
echo -e "${RED}Failed: $FAIL${NC}"
echo -e "${YELLOW}Warnings: $WARN${NC}"
echo ""

if [ $FAIL -gt 0 ]; then
    echo -e "${RED}❌ Setup incomplete! Fix the failed items above.${NC}"
    echo ""
    echo -e "${BLUE}Quick install all requirements:${NC}"
    echo "   pkg update && pkg upgrade"
    echo "   pkg install openjdk-17 git android-tools inotify-tools apksigner"
    echo ""
    echo -e "${BLUE}Or use auto-installer:${NC}"
    echo "   ./install-deps.sh --all -y"
    exit 1
elif [ $WARN -gt 0 ]; then
    echo -e "${GREEN}✅ Setup complete! (optional items missing)${NC}"
    echo ""
    echo -e "${YELLOW}Recommended:${NC} Install optional tools for better experience"
    echo "   ./install-deps.sh --all -y"
    echo "   # Or: pkg install inotify-tools procps-ng apksigner"
else
    echo -e "${GREEN}✅ All checks passed! Ready to develop!${NC}"
fi

echo ""
echo -e "${BLUE}📚 Quick Start:${NC}"
echo "   ./build.sh     - Build and install APK"
echo "   ./dev.sh       - Dev mode with auto-reload"
echo "   ./run.sh       - Launch app"
echo ""
