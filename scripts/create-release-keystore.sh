#!/bin/bash
# Create release keystore with predefined configuration
# Non-interactive version for automation

set -e

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_DIR"

KEYSTORE_DIR="$PROJECT_DIR/keystore"
KEYSTORE_FILE="$KEYSTORE_DIR/release.keystore"
KEYSTORE_PROPS="$KEYSTORE_DIR/keystore.properties"

# Default configuration
DEFAULT_STORE_PASS="alam123"
DEFAULT_KEY_ALIAS="alam123"
DEFAULT_KEY_PASS="alam123"

# Certificate info (customize these for production)
DEFAULT_CN="TermuxDroid"
DEFAULT_OU="Development"
DEFAULT_O="TermuxDroid"
DEFAULT_L="Jakarta"
DEFAULT_ST="Jakarta"
DEFAULT_C="ID"

echo "╔════════════════════════════════════════╗"
echo "║  Create Release Keystore (Auto)       ║"
echo "╚════════════════════════════════════════╝"
echo ""

# Create keystore directory
mkdir -p "$KEYSTORE_DIR"

# Remove existing keystore if present
if [ -f "$KEYSTORE_FILE" ]; then
    echo "⚠ Removing existing keystore..."
    rm -f "$KEYSTORE_FILE"
fi

echo "📦 Generating release keystore..."
echo "   Location: $KEYSTORE_FILE"
echo "   Alias: $DEFAULT_KEY_ALIAS"
echo ""

# Generate keystore using keytool
keytool -genkey -v \
    -keystore "$KEYSTORE_FILE" \
    -alias "$DEFAULT_KEY_ALIAS" \
    -keyalg RSA \
    -keysize 2048 \
    -validity 10000 \
    -storepass "$DEFAULT_STORE_PASS" \
    -keypass "$DEFAULT_KEY_PASS" \
    -dname "CN=$DEFAULT_CN, OU=$DEFAULT_OU, O=$DEFAULT_O, L=$DEFAULT_L, ST=$DEFAULT_ST, C=$DEFAULT_C"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Keystore created successfully!"
    echo ""
    
    # Create properties file with passwords
    cat > "$KEYSTORE_PROPS" << EOF
# Keystore Properties
# ⚠️ DO NOT COMMIT THIS FILE TO GIT!
storeFile=$KEYSTORE_FILE
keyAlias=$DEFAULT_KEY_ALIAS
storePassword=$DEFAULT_STORE_PASS
keyPassword=$DEFAULT_KEY_PASS
EOF
    
    echo "📝 Properties file created: $KEYSTORE_PROPS"
    echo ""
    echo "╔════════════════════════════════════════╗"
    echo "║  ⚠️  SECURITY WARNING                  ║"
    echo "╚════════════════════════════════════════╝"
    echo ""
    echo "   - Backup keystore/release.keystore securely!"
    echo "   - NEVER lose your keystore!"
    echo "   - Add keystore/ to .gitignore (already done)"
    echo "   - For production, use STRONG passwords!"
    echo ""
    echo "📋 Keystore Details:"
    keytool -list -v -keystore "$KEYSTORE_FILE" -alias "$DEFAULT_KEY_ALIAS" -storepass "$DEFAULT_STORE_PASS"
else
    echo "❌ Failed to create keystore!"
    exit 1
fi
