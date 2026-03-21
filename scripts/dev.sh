#!/bin/bash
# Dev mode with auto-reload for TermuxDroid
# Watches for file changes and auto-builds

set -e

ADB="/data/data/com.termux/files/usr/bin/adb"
# Get project root directory (parent of scripts/)
PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_DIR"

APK_PATH="app/build/outputs/apk/debug/app-debug.apk"
PACKAGE="com.myapp"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔥 TermuxDroid Dev Mode${NC}"
echo "========================"
echo ""

# Get device
DEVICE=$($ADB devices | grep -v "List" | awk '{print $1}' | head -1)

if [ -z "$DEVICE" ]; then
    echo -e "${RED}❌ No device found!${NC}"
    exit 1
fi

echo -e "${GREEN}📱 Device: $DEVICE${NC}"
echo ""

# Initial build
echo -e "${YELLOW}📦 Building initial APK...${NC}"
./gradlew assembleDebug -q

if [ ! -f "$APK_PATH" ]; then
    echo -e "${RED}❌ Build failed!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Initial build done${NC}"
echo ""

# Install initial APK
echo -e "${YELLOW}📥 Installing...${NC}"

# Uninstall first to avoid signature conflicts
$ADB -s "$DEVICE" uninstall $PACKAGE > /dev/null 2>&1

if $ADB -s "$DEVICE" install -r "$APK_PATH" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Installed${NC}"
else
    echo -e "${RED}❌ Install failed${NC}"
    echo "Trying with -t flag..."
    $ADB -s "$DEVICE" install -r -t "$APK_PATH"
fi
echo ""

# Launch app
echo -e "${YELLOW}🚀 Launching app...${NC}"
$ADB -s "$DEVICE" shell monkey -p $PACKAGE -c android.intent.category.LAUNCHER 1 > /dev/null 2>&1
echo -e "${GREEN}✅ App launched${NC}"
echo ""

echo -e "${BLUE}👁️  Watching for changes...${NC}"
echo "   Press Ctrl+C to stop"
echo ""

# Watch for changes using inotifywait or fallback to polling
if command -v inotifywait &> /dev/null; then
    # inotifywait available
    while true; do
        CHANGED_FILE=$(inotifywait -q -r -e modify,create,delete --format '%w%f' \
            --exclude 'build/' \
            --exclude '.git/' \
            app/src/main/java/ app/src/main/res/ 2>/dev/null)

        if [ -n "$CHANGED_FILE" ]; then
            echo -e "${YELLOW}⚡ Change detected: $CHANGED_FILE${NC}"
            echo -e "${BLUE}📦 Building...${NC}"

            # Build and capture output
            BUILD_OUTPUT=$(./gradlew assembleDebug 2>&1)
            BUILD_STATUS=$?

            if [ $BUILD_STATUS -eq 0 ]; then
                echo -e "${GREEN}✅ Build success${NC}"
                echo -e "${BLUE}📥 Installing...${NC}"

                # Uninstall first to avoid signature conflicts
                $ADB -s "$DEVICE" uninstall $PACKAGE > /dev/null 2>&1

                if $ADB -s "$DEVICE" install -r "$APK_PATH" > /dev/null 2>&1; then
                    echo -e "${GREEN}✅ Installed${NC}"
                    echo -e "${BLUE}🚀 Restarting app...${NC}"
                    $ADB -s "$DEVICE" shell am force-stop $PACKAGE
                    sleep 0.5
                    $ADB -s "$DEVICE" shell monkey -p $PACKAGE -c android.intent.category.LAUNCHER 1 > /dev/null 2>&1
                    echo -e "${GREEN}✅ App restarted${NC}"
                else
                    echo -e "${RED}❌ Install failed${NC}"
                    echo "Trying with -t flag..."
                    if $ADB -s "$DEVICE" install -r -t "$APK_PATH" > /dev/null 2>&1; then
                        echo -e "${GREEN}✅ Installed with -t flag${NC}"
                    fi
                fi
            else
                echo -e "${RED}❌ Build failed!${NC}"
                echo ""
                echo -e "${YELLOW}Error details:${NC}"
                echo "$BUILD_OUTPUT" | grep -E "(error:|FAILED|Exception)" | head -20
                echo ""
            fi
            echo ""
        fi
    done
else
    # Fallback: polling every 2 seconds
    echo -e "${YELLOW}⚠️  inotifywait not found, using polling (2s interval)${NC}"
    echo ""

    LAST_CHECK=$(date +%s)

    while true; do
        sleep 2

        # Check if any source file changed
        CHANGED=$(find app/src/main/java app/src/main/res \
            -type f -newer "$APK_PATH" 2>/dev/null | head -1)

        if [ -n "$CHANGED" ]; then
            echo -e "${YELLOW}⚡ Change detected${NC}"
            echo -e "${BLUE}📦 Building...${NC}"

            # Build and capture output
            BUILD_OUTPUT=$(./gradlew assembleDebug 2>&1)
            BUILD_STATUS=$?

            if [ $BUILD_STATUS -eq 0 ]; then
                echo -e "${GREEN}✅ Build success${NC}"
                echo -e "${BLUE}📥 Installing...${NC}"

                # Uninstall first to avoid signature conflicts
                $ADB -s "$DEVICE" uninstall $PACKAGE > /dev/null 2>&1

                if $ADB -s "$DEVICE" install -r "$APK_PATH" > /dev/null 2>&1; then
                    echo -e "${GREEN}✅ Installed${NC}"
                    echo -e "${BLUE}🚀 Restarting app...${NC}"
                    $ADB -s "$DEVICE" shell am force-stop $PACKAGE
                    sleep 0.5
                    $ADB -s "$DEVICE" shell monkey -p $PACKAGE -c android.intent.category.LAUNCHER 1 > /dev/null 2>&1
                    echo -e "${GREEN}✅ App restarted${NC}"
                else
                    echo -e "${RED}❌ Install failed${NC}"
                    echo "Trying with -t flag..."
                    if $ADB -s "$DEVICE" install -r -t "$APK_PATH" > /dev/null 2>&1; then
                        echo -e "${GREEN}✅ Installed with -t flag${NC}"
                    fi
                fi
            else
                echo -e "${RED}❌ Build failed!${NC}"
                echo ""
                echo -e "${YELLOW}Error details:${NC}"
                echo "$BUILD_OUTPUT" | grep -E "(error:|FAILED|Exception)" | head -20
                echo ""
            fi
            echo ""
        fi
    done
fi
