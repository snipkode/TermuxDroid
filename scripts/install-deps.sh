#!/bin/bash
# Automatic Dependency Installer for TermuxDroid
# Installs all required packages and tools for Android development in Termux

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

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  TermuxDroid Dependency Installer     ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

# Check if running in Termux
if [ ! -d "/data/data/com.termux" ]; then
    echo -e "${YELLOW}⚠${NC} Not running in Termux environment"
    echo "   This script is designed for Termux on Android"
    echo ""
    read -p "Continue anyway? (y/n): " continue_install
    if [[ ! "$continue_install" =~ ^[Yy]$ ]]; then
        echo "Installation cancelled."
        exit 0
    fi
fi

# Parse arguments
INSTALL_CORE=true
INSTALL_SIGNING=true
INSTALL_OPTIONAL=true
INSTALL_AAB=true
INSTALL_SDK=false
FORCE_REINSTALL=false
SHOW_HELP=false
SKIP_INTERACTIVE=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --core)
            INSTALL_SIGNING=false
            INSTALL_OPTIONAL=false
            INSTALL_AAB=false
            INSTALL_SDK=false
            shift
            ;;
        --signing)
            INSTALL_CORE=false
            INSTALL_OPTIONAL=false
            INSTALL_AAB=false
            INSTALL_SDK=false
            shift
            ;;
        --optional)
            INSTALL_CORE=false
            INSTALL_SIGNING=false
            INSTALL_AAB=false
            INSTALL_SDK=false
            shift
            ;;
        --aab)
            INSTALL_CORE=false
            INSTALL_SIGNING=false
            INSTALL_OPTIONAL=false
            INSTALL_SDK=false
            shift
            ;;
        --sdk)
            INSTALL_CORE=false
            INSTALL_SIGNING=false
            INSTALL_OPTIONAL=false
            INSTALL_AAB=false
            INSTALL_SDK=true
            shift
            ;;
        --all)
            INSTALL_CORE=true
            INSTALL_SIGNING=true
            INSTALL_OPTIONAL=true
            INSTALL_AAB=true
            INSTALL_SDK=true
            shift
            ;;
        --force)
            FORCE_REINSTALL=true
            shift
            ;;
        --yes|-y)
            SKIP_INTERACTIVE=true
            shift
            ;;
        --help|-h)
            SHOW_HELP=true
            shift
            ;;
        *)
            echo -e "${RED}❌ Unknown option: $1${NC}"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

if [ "$SHOW_HELP" = true ]; then
    echo "Usage: $0 [options]"
    echo ""
    echo "Options:"
    echo "  --core       Install only core dependencies (Java, Git, ADB)"
    echo "  --signing    Install only signing tools (apksigner, zipalign)"
    echo "  --optional   Install only optional tools (inotify-tools, procps-ng)"
    echo "  --aab        Install only AAB tools (bundletool)"
    echo "  --sdk        Install Android SDK (commandlinetools from Google)"
    echo "  --all        Install all dependencies (default)"
    echo "  --force      Force reinstall all packages"
    echo "  --yes, -y    Skip interactive prompts (auto-confirm)"
    echo "  --help, -h   Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0              # Install all dependencies"
    echo "  $0 --core       # Install only core dependencies"
    echo "  $0 --sdk        # Install Android SDK only"
    echo "  $0 --all -y     # Install all without prompts"
    exit 0
fi

# Function to check if package is installed
is_installed() {
    pkg list --installed 2>/dev/null | grep -q "^$1/"
}

# Function to install package
install_package() {
    local pkg_name=$1
    local description=$2

    if is_installed "$pkg_name" && [ "$FORCE_REINSTALL" = false ]; then
        echo -e "${GREEN}✓${NC} $description (already installed)"
        return 0
    fi

    echo -e "${YELLOW}📦 Installing: $description${NC}"
    pkg install -y "$pkg_name" 2>/dev/null

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓${NC} $description installed successfully"
        return 0
    else
        echo -e "${RED}✗${NC} Failed to install $description"
        return 1
    fi
}

# Function to install from third-party repo
install_thirdparty() {
    local pkg_name=$1
    local description=$2
    local repo_url=$3

    if command -v "$pkg_name" &> /dev/null && [ "$FORCE_REINSTALL" = false ]; then
        echo -e "${GREEN}✓${NC} $description (already installed)"
        return 0
    fi

    echo -e "${YELLOW}📦 Installing: $description${NC}"

    # Install from rendiix repo for zipalign
    if [[ "$pkg_name" == "zipalign" ]]; then
        echo -e "${BLUE}   Adding rendiix repository...${NC}"
        curl -sL "https://raw.githubusercontent.com/rendiix/rendiix.github.io/master/install-repo.sh" | bash 2>/dev/null
        pkg install -y zipalign 2>/dev/null
    fi

    if command -v "$pkg_name" &> /dev/null; then
        echo -e "${GREEN}✓${NC} $description installed successfully"
        return 0
    else
        echo -e "${RED}✗${NC} Failed to install $description"
        return 1
    fi
}

# Function to download and install bundletool
install_bundletool() {
    if [ -f "$PROJECT_DIR/bin/bundletool.jar" ] && [ "$FORCE_REINSTALL" = false ]; then
        echo -e "${GREEN}✓${NC} bundletool (already installed)"
        return 0
    fi

    echo -e "${YELLOW}📦 Installing: bundletool${NC}"

    # Create bin directory if not exists
    mkdir -p "$PROJECT_DIR/bin"

    # Download latest bundletool from GitHub
    BUNDLETOOL_URL="https://github.com/google/bundletool/releases/download/1.15.6/bundletool-all-1.15.6.jar"
    echo -e "${BLUE}   Downloading bundletool...${NC}"

    curl -sL "$BUNDLETOOL_URL" -o "$PROJECT_DIR/bin/bundletool.jar" 2>/dev/null

    if [ -f "$PROJECT_DIR/bin/bundletool.jar" ]; then
        # Create wrapper script
        cat > "$PROJECT_DIR/bin/bundletool" << 'EOF'
#!/bin/bash
java -jar "$(dirname "$0")/bundletool.jar" "$@"
EOF
        chmod +x "$PROJECT_DIR/bin/bundletool"

        echo -e "${GREEN}✓${NC} bundletool installed successfully"
        return 0
    else
        echo -e "${RED}✗${NC} Failed to install bundletool"
        return 1
    fi
}

# Function to install Android SDK
install_android_sdk() {
    echo -e "${BLUE}📋 Installing Android SDK...${NC}"
    echo "─────────────────────────────────────"

    SDK_ROOT="$PROJECT_DIR/android-sdk"
    CMDLINE_TOOLS_URL="https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip"
    CMDLINE_DIR="$SDK_ROOT/cmdline-tools"
    LATEST_DIR="$CMDLINE_DIR/latest"

    # Check if SDK is already installed
    if [ -f "$LATEST_DIR/bin/sdkmanager" ] && [ "$FORCE_REINSTALL" = false ]; then
        echo -e "${GREEN}✓${NC} Android SDK (already installed)"
        echo "   Location: $SDK_ROOT"
        echo ""
        echo -e "${YELLOW}ℹ${NC} To reinstall, use --force flag"
        return 0
    fi

    echo -e "${YELLOW}📦 Installing: Android SDK Command-line Tools${NC}"

    # Create SDK directory
    mkdir -p "$SDK_ROOT"
    mkdir -p "$CMDLINE_DIR"

    # Download command-line tools
    TEMP_ZIP="/sdcard/download/cmdline-tools.zip"
    echo -e "${BLUE}   Downloading from Google...${NC}"
    echo "   URL: $CMDLINE_TOOLS_URL"
    
    # Check if wget is available
    if command -v wget &> /dev/null; then
        wget -q --show-progress "$CMDLINE_TOOLS_URL" -O "$TEMP_ZIP" 2>/dev/null
    elif command -v curl &> /dev/null; then
        curl -L "$CMDLINE_TOOLS_URL" -o "$TEMP_ZIP" 2>/dev/null
    else
        echo -e "${RED}✗${NC} Neither wget nor curl found"
        return 1
    fi

    if [ ! -f "$TEMP_ZIP" ]; then
        echo -e "${RED}✗${NC} Failed to download Android SDK"
        return 1
    fi

    # Extract
    echo -e "${BLUE}   Extracting...${NC}"
    unzip -q "$TEMP_ZIP" -d "$CMDLINE_DIR" 2>/dev/null
    
    # The zip extracts to 'cmdline-tools', rename to 'latest'
    if [ -d "$CMDLINE_DIR/cmdline-tools" ]; then
        mv "$CMDLINE_DIR/cmdline-tools" "$LATEST_DIR"
    fi

    # Clean up
    rm -f "$TEMP_ZIP"

    if [ -f "$LATEST_DIR/bin/sdkmanager" ]; then
        echo -e "${GREEN}✓${NC} Android SDK installed successfully"
        echo "   Location: $SDK_ROOT"
        echo ""
        
        # Accept licenses automatically
        echo -e "${BLUE}   Accepting SDK licenses...${NC}"
        yes | "$LATEST_DIR/bin/sdkmanager" --licenses > /dev/null 2>&1 || true
        
        # Install essential packages
        echo -e "${BLUE}   Installing essential packages...${NC}"
        echo "   - build-tools;34.0.0"
        echo "   - platforms;android-34"
        echo "   - platform-tools (uses Termux ADB, skipped)"
        
        # Install build-tools and platform (skip platform-tools since we use Termux adb)
        "$LATEST_DIR/bin/sdkmanager" "build-tools;34.0.0" "platforms;android-34" 2>/dev/null
        
        echo ""
        echo -e "${GREEN}✓${NC} SDK packages installed"
        echo ""
        
        # Setup environment hint
        echo -e "${YELLOW}📌 Environment Setup:${NC}"
        echo "   Add to ~/.bashrc:"
        echo "   export ANDROID_HOME=\"$SDK_ROOT\""
        echo "   export PATH=\"\$ANDROID_HOME/cmdline-tools/latest/bin:\$PATH\""
        echo ""
        
        return 0
    else
        echo -e "${RED}✗${NC} Failed to install Android SDK"
        return 1
    fi
}

# Core dependencies
install_core() {
    echo -e "${BLUE}📋 Installing Core Dependencies...${NC}"
    echo "─────────────────────────────────────"

    # Update package list
    echo -e "${YELLOW}🔄 Updating package list...${NC}"
    pkg update -y 2>/dev/null || true

    # Java (OpenJDK 17)
    install_package "openjdk-17" "OpenJDK 17 (Java)"

    # Git
    install_package "git" "Git"

    # Android Tools (ADB, fastboot)
    install_package "android-tools" "Android Tools (ADB)"

    # wget/curl for downloads
    install_package "wget" "Wget (downloader)"
    install_package "curl" "Curl (downloader)"

    # unzip for extracting
    install_package "unzip" "Unzip (archive extractor)"

    echo ""
}

# Signing tools (apksigner, zipalign)
install_signing() {
    echo -e "${BLUE}📋 Installing Signing Tools...${NC}"
    echo "─────────────────────────────────────"

    # apksigner (official Termux package)
    install_package "apksigner" "apksigner (APK signer)"

    # zipalign (from third-party repo)
    install_thirdparty "zipalign" "zipalign (APK alignment tool)" "rendiix repo"

    echo ""
}

# Optional dependencies
install_optional() {
    echo -e "${BLUE}📋 Installing Optional Dependencies...${NC}"
    echo "─────────────────────────────────────"

    # inotify-tools (for auto-reload in dev mode)
    install_package "inotify-tools" "inotify-tools (file watcher)"

    # procps-ng (for watch command)
    install_package "procps-ng" "procps-ng (process tools)"

    echo ""
}

# AAB tools (bundletool)
install_aab() {
    echo -e "${BLUE}📋 Installing AAB Tools...${NC}"
    echo "─────────────────────────────────────"

    # bundletool (download from GitHub)
    install_bundletool

    echo ""
}

# Verify installation
verify_installation() {
    echo -e "${BLUE}📋 Verifying Installation...${NC}"
    echo "─────────────────────────────────────"

    PASS=0
    FAIL=0

    # Check Java
    if command -v java &> /dev/null; then
        JAVA_VER=$(java -version 2>&1 | head -1)
        echo -e "${GREEN}✓${NC} Java: $JAVA_VER"
        ((PASS++))
    else
        echo -e "${RED}✗${NC} Java not found"
        ((FAIL++))
    fi

    # Check Git
    if command -v git &> /dev/null; then
        echo -e "${GREEN}✓${NC} Git installed"
        ((PASS++))
    else
        echo -e "${RED}✗${NC} Git not found"
        ((FAIL++))
    fi

    # Check ADB
    if command -v adb &> /dev/null; then
        echo -e "${GREEN}✓${NC} ADB installed"
        ((PASS++))
    else
        echo -e "${RED}✗${NC} ADB not found"
        ((FAIL++))
    fi

    # Check apksigner
    if command -v apksigner &> /dev/null; then
        echo -e "${GREEN}✓${NC} apksigner installed"
        ((PASS++))
    else
        echo -e "${YELLOW}⚠${NC} apksigner not installed (signing will use jarsigner)"
    fi

    # Check zipalign
    if command -v zipalign &> /dev/null; then
        echo -e "${GREEN}✓${NC} zipalign installed"
        ((PASS++))
    else
        echo -e "${YELLOW}⚠${NC} zipalign not installed"
    fi

    # Check bundletool
    if [ -f "$PROJECT_DIR/bin/bundletool.jar" ] || command -v bundletool &> /dev/null; then
        echo -e "${GREEN}✓${NC} bundletool installed"
        ((PASS++))
    else
        echo -e "${YELLOW}⚠${NC} bundletool not installed (AAB to APK conversion unavailable)"
    fi

    # Check inotifywait (optional)
    if command -v inotifywait &> /dev/null; then
        echo -e "${GREEN}✓${NC} inotifywait installed (dev mode)"
        ((PASS++))
    else
        echo -e "${YELLOW}⚠${NC} inotifywait not installed (dev mode will use polling)"
    fi

    # Check keytool (for signing)
    if command -v keytool &> /dev/null; then
        echo -e "${GREEN}✓${NC} keytool available (for signing)"
        ((PASS++))
    else
        echo -e "${RED}✗${NC} keytool not found (signing will fail)"
        ((FAIL++))
    fi

    # Check jarsigner
    if command -v jarsigner &> /dev/null; then
        echo -e "${GREEN}✓${NC} jarsigner available (for signing)"
        ((PASS++))
    else
        echo -e "${RED}✗${NC} jarsigner not found (signing will fail)"
        ((FAIL++))
    fi

    # Check Android SDK
    SDK_ROOT="$PROJECT_DIR/android-sdk"
    if [ -f "$SDK_ROOT/cmdline-tools/latest/bin/sdkmanager" ]; then
        echo -e "${GREEN}✓${NC} Android SDK installed"
        ((PASS++))
    else
        echo -e "${YELLOW}⚠${NC} Android SDK not installed (using Termux tools only)"
    fi

    echo ""
    echo "══════════════════════════════════════"
    echo -e "${GREEN}Verified: $PASS${NC}"
    if [ $FAIL -gt 0 ]; then
        echo -e "${RED}Missing: $FAIL${NC}"
    fi
    echo "══════════════════════════════════════"
    echo ""

    if [ $FAIL -gt 0 ]; then
        echo -e "${RED}❌ Some dependencies are missing!${NC}"
        echo ""
        echo "Try manual install:"
        echo "   pkg update && pkg upgrade"
        echo "   pkg install openjdk-17 git android-tools"
        echo ""
        return 1
    else
        echo -e "${GREEN}✅ All core dependencies installed!${NC}"
        return 0
    fi
}

# Interactive prompt
interactive_prompt() {
    if [ "$SKIP_INTERACTIVE" = true ]; then
        return 0
    fi

    echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║  Installation Options                  ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
    echo ""
    echo "What would you like to install?"
    echo ""
    echo "  [1] All dependencies (recommended for first-time setup)"
    echo "  [2] Core only (Java, Git, ADB, wget, curl, unzip)"
    echo "  [3] Core + Signing tools (for release builds)"
    echo "  [4] Core + Optional tools (for dev mode)"
    echo "  [5] Core + Android SDK (full development setup)"
    echo "  [6] Android SDK only"
    echo "  [7] Custom selection"
    echo ""
    read -p "Enter choice (1-7): " choice

    case $choice in
        1)
            INSTALL_CORE=true
            INSTALL_SIGNING=true
            INSTALL_OPTIONAL=true
            INSTALL_AAB=true
            INSTALL_SDK=true
            ;;
        2)
            INSTALL_CORE=true
            INSTALL_SIGNING=false
            INSTALL_OPTIONAL=false
            INSTALL_AAB=false
            INSTALL_SDK=false
            ;;
        3)
            INSTALL_CORE=true
            INSTALL_SIGNING=true
            INSTALL_OPTIONAL=false
            INSTALL_AAB=false
            INSTALL_SDK=false
            ;;
        4)
            INSTALL_CORE=true
            INSTALL_SIGNING=false
            INSTALL_OPTIONAL=true
            INSTALL_AAB=false
            INSTALL_SDK=false
            ;;
        5)
            INSTALL_CORE=true
            INSTALL_SIGNING=true
            INSTALL_OPTIONAL=false
            INSTALL_AAB=false
            INSTALL_SDK=true
            ;;
        6)
            INSTALL_CORE=false
            INSTALL_SIGNING=false
            INSTALL_OPTIONAL=false
            INSTALL_AAB=false
            INSTALL_SDK=true
            ;;
        7)
            echo ""
            echo "Select individual components:"
            read -p "  Install Core dependencies? (y/n): " core_choice
            [[ "$core_choice" =~ ^[Yy]$ ]] && INSTALL_CORE=true || INSTALL_CORE=false

            read -p "  Install Signing tools (apksigner, zipalign)? (y/n): " sign_choice
            [[ "$sign_choice" =~ ^[Yy]$ ]] && INSTALL_SIGNING=true || INSTALL_SIGNING=false

            read -p "  Install Optional tools (inotify-tools, procps-ng)? (y/n): " opt_choice
            [[ "$opt_choice" =~ ^[Yy]$ ]] && INSTALL_OPTIONAL=true || INSTALL_OPTIONAL=false

            read -p "  Install AAB tools (bundletool)? (y/n): " aab_choice
            [[ "$aab_choice" =~ ^[Yy]$ ]] && INSTALL_AAB=true || INSTALL_AAB=false

            read -p "  Install Android SDK? (y/n): " sdk_choice
            [[ "$sdk_choice" =~ ^[Yy]$ ]] && INSTALL_SDK=true || INSTALL_SDK=false
            ;;
        *)
            echo -e "${RED}❌ Invalid choice${NC}"
            exit 1
            ;;
    esac
}

# Main installation flow
echo ""

# Interactive prompt (unless skipped)
interactive_prompt

if [ "$INSTALL_CORE" = true ]; then
    install_core
fi

if [ "$INSTALL_SIGNING" = true ]; then
    install_signing
fi

if [ "$INSTALL_OPTIONAL" = true ]; then
    install_optional
fi

if [ "$INSTALL_AAB" = true ]; then
    install_aab
fi

if [ "$INSTALL_SDK" = true ]; then
    install_android_sdk
fi

# Verify
verify_installation
VERIFY_STATUS=$?

if [ $VERIFY_STATUS -eq 0 ]; then
    echo -e "${GREEN}🎉 Installation complete!${NC}"
    echo ""
    echo -e "${BLUE}📚 Next steps:${NC}"
    echo "   ./build.sh        - Build your first APK"
    echo "   ./dev.sh          - Start dev mode with auto-reload"
    echo "   ./setup-check.sh  - Full environment check"
    echo ""

    # Check if keystore exists
    if [ ! -f "keystore/release.keystore" ]; then
        echo -e "${YELLOW}🔐 Note: No keystore found for signing release builds${NC}"
        echo "   Create one with: ./scripts/keystore.sh --create"
        echo ""
    fi
else
    echo -e "${RED}❌ Installation incomplete. Please fix the issues above.${NC}"
    exit 1
fi
