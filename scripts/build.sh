#!/bin/bash
# Build script for Native Android Framework

set -e

# Get project root directory (parent of scripts/)
PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_DIR"

# Setup Android SDK environment
SDK_ROOT="$PROJECT_DIR/android-sdk"
if [ -d "$SDK_ROOT" ]; then
    export ANDROID_HOME="$SDK_ROOT"
    export PATH="$ANDROID_HOME/cmdline-tools/latest/bin:$PATH"
fi

ADB="/data/data/com.termux/files/usr/bin/adb"
KEYSTORE_FILE="$PROJECT_DIR/keystore/release.keystore"
KEYSTORE_PROPS="$PROJECT_DIR/keystore/keystore.properties"

# Build type (default: debug)
BUILD_TYPE="debug"
BUILD_TASK="assembleDebug"
OUTPUT_PATH="app/build/outputs/apk/debug/app-debug.apk"
OUTPUT_FORMAT="apk"
SKIP_SIGNING=false
NO_PROMPT=false

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --release|-r)
            BUILD_TYPE="release"
            BUILD_TASK="assembleRelease"
            OUTPUT_PATH="app/build/outputs/apk/release/app-release.apk"
            OUTPUT_FORMAT="apk"
            shift
            ;;
        --release-aab|-ra)
            BUILD_TYPE="release"
            BUILD_TASK="bundleRelease"
            OUTPUT_PATH="app/build/outputs/bundle/release/app-release.aab"
            OUTPUT_FORMAT="aab"
            shift
            ;;
        --debug|-d)
            BUILD_TYPE="debug"
            BUILD_TASK="assembleDebug"
            OUTPUT_PATH="app/build/outputs/apk/debug/app-debug.apk"
            OUTPUT_FORMAT="apk"
            shift
            ;;
        --aab|-a)
            BUILD_TYPE="release"
            BUILD_TASK="bundleRelease"
            OUTPUT_PATH="app/build/outputs/bundle/release/app-release.aab"
            OUTPUT_FORMAT="aab"
            shift
            ;;
        --no-sign)
            SKIP_SIGNING=true
            shift
            ;;
        --no-prompt|-n)
            NO_PROMPT=true
            shift
            ;;
        --help|-h)
            echo "Usage: $0 [options]"
            echo ""
            echo "Options:"
            echo "  --debug, -d       Build debug APK (default)"
            echo "  --release, -r     Build release APK (signed if keystore exists)"
            echo "  --aab, -a         Build release AAB (signed if keystore exists)"
            echo "  --release-aab, -ra  Same as --aab"
            echo "  --no-sign         Skip signing even if keystore exists"
            echo "  --no-prompt, -n   Skip interactive prompts (auto-install)"
            echo "  --help, -h        Show this help"
            echo ""
            echo "Signing:"
            echo "  Release builds will be automatically signed if keystore exists."
            echo "  Create keystore: ./scripts/keystore.sh --create"
            echo ""
            echo "Examples:"
            echo "  $0                    # Debug APK"
            echo "  $0 --release          # Release APK (signed)"
            echo "  $0 --aab              # Release AAB (signed, for Play Store)"
            echo "  $0 --release --no-sign  # Release APK (unsigned)"
            exit 0
            ;;
        *)
            echo "❌ Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Function to check signing prerequisites
check_signing() {
    if [ "$SKIP_SIGNING" = true ]; then
        echo -e "${YELLOW}⚠${NC} Signing skipped (--no-sign flag)"
        return 1
    fi

    if [ ! -f "$KEYSTORE_FILE" ]; then
        echo -e "${YELLOW}⚠${NC} Keystore not found: $KEYSTORE_FILE"
        echo ""
        echo "Create keystore now for signed release builds?"
        read -p "(y/n): " create_ks
        if [[ "$create_ks" =~ ^[Yy]$ ]]; then
            ./scripts/keystore.sh --create
            if [ $? -ne 0 ]; then
                echo -e "${RED}❌ Failed to create keystore${NC}"
                return 1
            fi
        else
            echo -e "${YELLOW}⚠${NC} Build will continue without signing"
            return 1
        fi
    fi

    # Check if keytool is available
    if ! command -v keytool &> /dev/null; then
        echo -e "${RED}❌ keytool not found! Install Java: pkg install openjdk-17${NC}"
        return 1
    fi

    # Verify keystore is valid
    echo -e "${YELLOW}🔐 Keystore found, verifying...${NC}"
    if keytool -list -keystore "$KEYSTORE_FILE" > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} Keystore is valid"
        return 0
    else
        echo -e "${RED}❌ Invalid keystore!${NC}"
        return 1
    fi
}

# Function to get keystore password
get_keystore_password() {
    if [ -f "$KEYSTORE_PROPS" ]; then
        # Try to read from properties file (if user stored it there)
        local stored_pass=$(grep -E "^storePassword=" "$KEYSTORE_PROPS" 2>/dev/null | cut -d'=' -f2)
        if [ -n "$stored_pass" ]; then
            echo "$stored_pass"
            return
        fi
    fi

    # Prompt for password
    echo "Enter keystore password:"
    read -s -p "  > " STORE_PASS
    echo ""
    echo "$STORE_PASS"
}

# Function to select device by index
select_device() {
    local devices=()

    echo "🔍 Available devices:"
    echo ""

    while IFS= read -r line; do
        if [[ -n "$line" && "$line" != "List of devices"* ]]; then
            devices+=("$(echo "$line" | awk '{print $1}')")
            echo "   [${#devices[@]}] ${devices[-1]}"
        fi
    done < <($ADB devices)

    echo ""

    if [ ${#devices[@]} -eq 0 ]; then
        echo "❌ No device found!"
        return 1
    fi

    if [ ${#devices[@]} -eq 1 ]; then
        echo "✅ 1 device found, auto-selecting..."
        SELECTED_DEVICE="${devices[0]}"
        return 0
    fi

    while true; do
        read -p "Select device (enter number 1-${#devices[@]}): " choice
        if [[ "$choice" =~ ^[0-9]+$ ]] && [ "$choice" -ge 1 ] && [ "$choice" -le "${#devices[@]}" ]; then
            SELECTED_DEVICE="${devices[$((choice-1))]}"
            echo "✅ Selected: [$choice] $SELECTED_DEVICE"
            return 0
        else
            echo "❌ Invalid choice."
        fi
    done
}

cd "$PROJECT_DIR"

# Check Gradle wrapper
if [ ! -f gradlew ]; then
    echo "❌ gradlew not found!"
    echo "👉 Copy from SampleApp/android or create wrapper"
    exit 1
fi

chmod +x gradlew

# For release builds, check signing
if [ "$BUILD_TYPE" = "release" ]; then
    echo ""
    echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║  Release Build Configuration          ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
    echo ""

    if check_signing; then
        echo ""
        echo -e "${GREEN}✅ Signing configured!${NC}"

        # Get password once and export for Gradle
        STORE_PASS=$(get_keystore_password)
        export KEYSTORE_PASSWORD="$STORE_PASS"

        # Try to get key alias from properties
        if [ -f "$KEYSTORE_PROPS" ]; then
            KEY_ALIAS=$(grep -E "^keyAlias=" "$KEYSTORE_PROPS" 2>/dev/null | cut -d'=' -f2)
            if [ -n "$KEY_ALIAS" ]; then
                export KEY_ALIAS="$KEY_ALIAS"
                echo -e "${GREEN}✓${NC} Using alias: $KEY_ALIAS"
            fi
        fi

        echo ""
    else
        echo ""
        echo -e "${YELLOW}⚠️  Building UNSIGNED release (for testing only)${NC}"
        echo "   For Play Store upload, create keystore first!"
        echo ""
    fi
fi

# Build
if [ "$OUTPUT_FORMAT" = "aab" ]; then
    echo "📱 Building ${BUILD_TYPE} AAB (Android App Bundle)..."
else
    echo "📱 Building ${BUILD_TYPE} APK..."
fi

./gradlew $BUILD_TASK

# Check output
if [ -f "$OUTPUT_PATH" ]; then
    echo ""
    if [ "$OUTPUT_FORMAT" = "aab" ]; then
        echo "✅ Build successful!"
        echo "📍 AAB: $OUTPUT_PATH"
        echo ""

        # Verify AAB signing
        if [ "$BUILD_TYPE" = "release" ] && [ "$SKIP_SIGNING" = false ] && [ -f "$KEYSTORE_FILE" ]; then
            echo -e "${YELLOW}🔐 Verifying AAB signature...${NC}"
            if jarsigner -verify -verbose -certs "$OUTPUT_PATH" 2>&1 | grep -q "verified"; then
                echo -e "${GREEN}✓${NC} AAB is signed"
            else
                echo -e "${YELLOW}⚠${NC} AAB signature could not be verified"
            fi
        fi

        echo ""
        echo "📤 Upload to Google Play Console:"
        echo "   https://play.google.com/console"
        echo ""
        echo "📋 File size:"
        ls -lh "$OUTPUT_PATH" | awk '{print "   " $5}'
    else
        echo "✅ Build successful!"
        echo "📍 APK: $OUTPUT_PATH"
        echo ""

        # Verify APK signing
        if [ "$BUILD_TYPE" = "release" ] && [ "$SKIP_SIGNING" = false ] && [ -f "$KEYSTORE_FILE" ]; then
            echo -e "${YELLOW}🔐 Verifying APK signature...${NC}"
            if command -v apksigner &> /dev/null; then
                if apksigner verify "$OUTPUT_PATH" 2>/dev/null; then
                    echo -e "${GREEN}✓${NC} APK is signed and verified"
                else
                    echo -e "${YELLOW}⚠${NC} APK signature verification failed"
                fi
            elif jarsigner -verify -verbose -certs "$OUTPUT_PATH" 2>&1 | grep -q "verified"; then
                echo -e "${GREEN}✓${NC} APK is signed (jarsigner)"
            else
                echo -e "${YELLOW}⚠${NC} APK may be unsigned"
            fi
            echo ""
        fi

        # Ask to install (skip for release with warning)
        if [ "$BUILD_TYPE" = "release" ]; then
            if [ "$SKIP_SIGNING" = true ] || [ ! -f "$KEYSTORE_FILE" ]; then
                echo "⚠️  Release APK is UNSIGNED. Install may fail on some devices."
                echo ""
            fi
        fi

        if [ "$NO_PROMPT" = true ]; then
            # Auto-install without prompting
            if select_device; then
                echo ""
                echo "📥 Installing on $SELECTED_DEVICE..."
                $ADB -s "$SELECTED_DEVICE" install -r "$OUTPUT_PATH"

                if [ $? -eq 0 ]; then
                    echo ""
                    echo "✅ Installation successful!"
                    echo ""
                    echo "👉 Launch app:"
                    echo "   adb -s $SELECTED_DEVICE shell monkey -p com.myapp -c android.intent.category.LAUNCHER 1"
                else
                    echo ""
                    echo "❌ Installation failed!"
                    if [ "$BUILD_TYPE" = "release" ] && { [ "$SKIP_SIGNING" = true ] || [ ! -f "$KEYSTORE_FILE" ]; }; then
                        echo "   APK may be unsigned - some devices block unsigned apps"
                    fi
                    exit 1
                fi
            else
                echo ""
                echo "👉 Install manually:"
                echo "   adb -s <device> install -r $OUTPUT_PATH"
            fi
        else
            # Prompt user
            read -p "Install to device? (y/n): " install_choice
            if [[ "$install_choice" =~ ^[Yy]$ ]]; then
                if select_device; then
                    echo ""
                    echo "📥 Installing on $SELECTED_DEVICE..."
                    $ADB -s "$SELECTED_DEVICE" install -r "$OUTPUT_PATH"

                    if [ $? -eq 0 ]; then
                        echo ""
                        echo "✅ Installation successful!"
                        echo ""
                        echo "👉 Launch app:"
                        echo "   adb -s $SELECTED_DEVICE shell monkey -p com.myapp -c android.intent.category.LAUNCHER 1"
                    else
                        echo ""
                        echo "❌ Installation failed!"
                        if [ "$BUILD_TYPE" = "release" ] && { [ "$SKIP_SIGNING" = true ] || [ ! -f "$KEYSTORE_FILE" ]; }; then
                            echo "   APK may be unsigned - some devices block unsigned apps"
                        fi
                        exit 1
                    fi
                else
                    echo ""
                    echo "👉 Install manually:"
                    echo "   adb -s <device> install -r $OUTPUT_PATH"
                fi
            fi
        fi
    fi
else
    echo ""
    echo "❌ Build failed! Output not found at: $OUTPUT_PATH"
    echo ""
    echo "🔍 Checking build outputs..."
    if [ -d "app/build/outputs" ]; then
        find app/build/outputs -name "*.apk" -o -name "*.aab" 2>/dev/null | head -10
    else
        echo "   No build outputs found"
    fi
    exit 1
fi
