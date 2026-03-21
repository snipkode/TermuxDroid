#!/bin/bash
# Run script for TermuxDroid

ADB="/data/data/com.termux/files/usr/bin/adb"

echo "🚀 Launching TermuxDroid App"
echo "============================"
echo ""

# Select device if multiple
DEVICE=""
DEVICE_COUNT=$($ADB devices | grep -v "List" | wc -l)

if [ "$DEVICE_COUNT" -eq 0 ]; then
    echo "❌ No device found!"
    exit 1
elif [ "$DEVICE_COUNT" -eq 1 ]; then
    DEVICE=$($ADB devices | grep -v "List" | awk '{print $1}')
else
    echo "🔍 Multiple devices found:"
    $ADB devices | grep -v "List" | nl
    read -p "Select device (number): " choice
    DEVICE=$($ADB devices | grep -v "List" | sed -n "${choice}p" | awk '{print $1}')
fi

echo "📱 Launching on: $DEVICE"
$ADB -s "$DEVICE" shell monkey -p com.myapp -c android.intent.category.LAUNCHER 1
echo ""
echo "✅ App launched!"
