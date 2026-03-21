#!/bin/bash
# Build script for Native Android Framework

set -e

# Get project root directory (parent of scripts/)
PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_DIR"

ADB="/data/data/com.termux/files/usr/bin/adb"

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

# Build APK
echo "📱 Building debug APK..."
./gradlew assembleDebug

# Check output
APK_PATH="app/build/outputs/apk/debug/app-debug.apk"

if [ -f "$APK_PATH" ]; then
    echo ""
    echo "✅ Build successful!"
    echo "📍 APK: $APK_PATH"
    echo ""
    
    # Ask to install
    read -p "Install to device? (y/n): " install_choice
    if [[ "$install_choice" =~ ^[Yy]$ ]]; then
        if select_device; then
            echo ""
            echo "📥 Installing on $SELECTED_DEVICE..."
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
        else
            echo ""
            echo "👉 Install manually:"
            echo "   adb -s <device> install -r $APK_PATH"
        fi
    fi
else
    echo ""
    echo "❌ Build failed! APK not found."
    exit 1
fi
