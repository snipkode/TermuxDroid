#!/bin/bash
# Install APK script for Native Android Framework

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

# APK paths
DEBUG_APK="app/build/outputs/apk/debug/app-debug.apk"
RELEASE_APK="app/build/outputs/apk/release/app-release.apk"
SELECTED_APK=""

# Function to check if APK exists
apk_exists() {
    [ -f "$1" ]
}

# Function to select APK type
select_apk_type() {
    local available_apks=()
    local apk_paths=()

    if apk_exists "$DEBUG_APK"; then
        available_apks+=("Debug APK (app-debug.apk)")
        apk_paths+=("$DEBUG_APK")
    fi

    if apk_exists "$RELEASE_APK"; then
        available_apks+=("Release APK (app-release.apk)")
        apk_paths+=("$RELEASE_APK")
    fi

    if [ ${#available_apks[@]} -eq 0 ]; then
        echo "❌ No APK found!"
        echo "👉 Run 'npm run build' or 'npm run build:release' first"
        return 1
    fi

    if [ ${#available_apks[@]} -eq 1 ]; then
        echo "✅ Found: ${available_apks[0]}"
        SELECTED_APK="${apk_paths[0]}"
        return 0
    fi

    echo "📦 Available APKs:"
    echo ""
    for i in "${!available_apks[@]}"; do
        echo "   [$((i+1))] ${available_apks[$i]}"
    done
    echo ""

    while true; do
        read -p "Select APK (enter number 1-${#available_apks[@]}): " choice
        if [[ "$choice" =~ ^[0-9]+$ ]] && [ "$choice" -ge 1 ] && [ "$choice" -le "${#available_apks[@]}" ]; then
            SELECTED_APK="${apk_paths[$((choice-1))]}"
            echo "✅ Selected: [$choice] ${available_apks[$((choice-1))]}"
            return 0
        else
            echo "❌ Invalid choice."
        fi
    done
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

# Select APK type
if ! select_apk_type; then
    exit 1
fi

# Check ADB
if ! $ADB version >/dev/null 2>&1; then
    echo "❌ ADB not working!"
    exit 1
fi

# Select device
if ! select_device; then
    exit 1
fi

echo ""

# Install
echo "📥 Installing APK on $SELECTED_DEVICE..."
$ADB -s "$SELECTED_DEVICE" install -r "$SELECTED_APK"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Installation successful!"
    echo ""
    echo "👉 Launch app:"
    echo "   adb -s $SELECTED_DEVICE shell monkey -p com.myapp -c android.intent.category.LAUNCHER 1"
else
    echo ""
    echo "❌ Installation failed!"
    exit 1
fi
