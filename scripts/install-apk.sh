#!/bin/bash
# Install APK script for Native Android Framework

set -e

# Get project root directory (parent of scripts/)
PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_DIR"

ADB="/data/data/com.termux/files/usr/bin/adb"
APK_PATH="app/build/outputs/apk/debug/app-debug.apk"

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

# Check APK exists
if [ ! -f "$APK_PATH" ]; then
    echo "❌ APK not found at: $APK_PATH"
    echo "👉 Run ./build.sh first"
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
$ADB -s "$SELECTED_DEVICE" install -r "$APK_PATH"

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
