#!/bin/bash
# Keystore management for signing release APK/AAB

set -e

# Get project root directory
PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_DIR"

KEYSTORE_DIR="$PROJECT_DIR/keystore"
KEYSTORE_FILE="$KEYSTORE_DIR/release.keystore"
KEYSTORE_PROPS="$KEYSTORE_DIR/keystore.properties"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Function to check if keystore exists
check_keystore() {
    if [ -f "$KEYSTORE_FILE" ]; then
        return 0
    else
        return 1
    fi
}

# Function to create new keystore
create_keystore() {
    echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║  Create New Signing Keystore          ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
    echo ""

    if [ -f "$KEYSTORE_FILE" ]; then
        echo -e "${YELLOW}⚠${NC} Keystore already exists!"
        echo "   Location: $KEYSTORE_FILE"
        echo ""
        read -p "Overwrite existing keystore? (y/n): " overwrite
        if [[ ! "$overwrite" =~ ^[Yy]$ ]]; then
            echo "Cancelled."
            return 1
        fi
    fi

    # Create keystore directory
    mkdir -p "$KEYSTORE_DIR"

    echo -e "${YELLOW}📝 Enter keystore information:${NC}"
    echo ""
    echo "Store Password (min 6 chars):"
    read -s -p "  > " STORE_PASS
    echo ""
    read -s -p "  > Confirm: " STORE_PASS_CONFIRM
    echo ""

    if [ "$STORE_PASS" != "$STORE_PASS_CONFIRM" ]; then
        echo -e "${RED}❌ Passwords do not match!${NC}"
        return 1
    fi

    if [ ${#STORE_PASS} -lt 6 ]; then
        echo -e "${RED}❌ Password must be at least 6 characters!${NC}"
        return 1
    fi

    echo ""
    echo "Key Alias:"
    read -p "  > " KEY_ALIAS

    echo "Key Password (min 6 chars):"
    read -s -p "  > " KEY_PASS
    echo ""
    read -s -p "  > Confirm: " KEY_PASS_CONFIRM
    echo ""

    if [ "$KEY_PASS" != "$KEY_PASS_CONFIRM" ]; then
        echo -e "${RED}❌ Key passwords do not match!${NC}"
        return 1
    fi

    echo ""
    echo "Certificate Information:"
    read -p "  First and Last Name (e.g., John Doe): " CN
    read -p "  Organizational Unit (e.g., Development): " OU
    read -p "  Organization (e.g., MyCompany): " O
    read -p "  City: " L
    read -p "  State/Province: " ST
    read -p "  Country Code (2 letters, e.g., US): " C

    echo ""
    echo -e "${YELLOW}⏳ Generating keystore...${NC}"

    # Generate keystore using keytool
    keytool -genkey -v \
        -keystore "$KEYSTORE_FILE" \
        -alias "$KEY_ALIAS" \
        -keyalg RSA \
        -keysize 2048 \
        -validity 10000 \
        -storepass "$STORE_PASS" \
        -keypass "$KEY_PASS" \
        -dname "CN=$CN, OU=$OU, O=$O, L=$L, ST=$ST, C=$C"

    if [ $? -eq 0 ]; then
        echo ""
        echo -e "${GREEN}✅ Keystore created successfully!${NC}"
        echo "   Location: $KEYSTORE_FILE"
        echo ""

        # Save properties (except passwords!)
        cat > "$KEYSTORE_PROPS" << EOF
# Keystore Properties
# DO NOT COMMIT THIS FILE TO GIT!
storeFile=$KEYSTORE_FILE
keyAlias=$KEY_ALIAS
# Passwords are NOT stored in this file for security
EOF

        echo -e "${YELLOW}📝 Properties file created:${NC} $KEYSTORE_PROPS"
        echo ""
        echo -e "${RED}⚠️  IMPORTANT:${NC}"
        echo "   - Backup your keystore file securely!"
        echo "   - NEVER lose your keystore - you won't be able to update your app!"
        echo "   - Add 'keystore/' to .gitignore (already done)"
        echo ""
        echo -e "${BLUE}📋 Keystore Details:${NC}"
        keytool -list -v -keystore "$KEYSTORE_FILE" -alias "$KEY_ALIAS" -storepass "$STORE_PASS"
    else
        echo -e "${RED}❌ Failed to create keystore!${NC}"
        return 1
    fi
}

# Function to display keystore info
show_info() {
    if ! check_keystore; then
        echo -e "${RED}❌ Keystore not found!${NC}"
        echo "   Run: $0 --create"
        return 1
    fi

    echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║  Keystore Information                 ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
    echo ""

    echo "Enter keystore password:"
    read -s -p "  > " STORE_PASS
    echo ""

    echo ""
    echo -e "${YELLOW}Available aliases:${NC}"
    keytool -list -keystore "$KEYSTORE_FILE" -storepass "$STORE_PASS"

    echo ""
    echo -e "${YELLOW}Enter alias to view details:${NC}"
    read -p "  > " ALIAS

    echo ""
    keytool -list -v -keystore "$KEYSTORE_FILE" -alias "$ALIAS" -storepass "$STORE_PASS"
}

# Function to verify signing tools
check_tools() {
    echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║  Checking Signing Tools               ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
    echo ""

    PASS=0
    FAIL=0

    # Check Java
    if command -v java &> /dev/null; then
        echo -e "${GREEN}✓${NC} Java installed"
        ((PASS++))
    else
        echo -e "${RED}✗${NC} Java NOT FOUND"
        echo "   Install: pkg install openjdk-17"
        ((FAIL++))
    fi

    # Check keytool
    if command -v keytool &> /dev/null; then
        echo -e "${GREEN}✓${NC} keytool available"
        ((PASS++))
    else
        echo -e "${RED}✗${NC} keytool NOT FOUND"
        echo "   Install: pkg install openjdk-17"
        ((FAIL++))
    fi

    # Check apksigner (from Android build-tools)
    if command -v apksigner &> /dev/null; then
        echo -e "${GREEN}✓${NC} apksigner available"
        ((PASS++))
    else
        echo -e "${YELLOW}⚠${NC} apksigner NOT FOUND"
        echo "   Install Android SDK build-tools for apksigner"
        ((FAIL++))
    fi

    # Check jarsigner
    if command -v jarsigner &> /dev/null; then
        echo -e "${GREEN}✓${NC} jarsigner available"
        ((PASS++))
    else
        echo -e "${RED}✗${NC} jarsigner NOT FOUND"
        echo "   Install: pkg install openjdk-17"
        ((FAIL++))
    fi

    echo ""
    echo "══════════════════════════════════════"
    if [ $FAIL -gt 0 ]; then
        echo -e "${RED}❌ Missing $FAIL required tool(s)${NC}"
        echo ""
        echo "Install Java:"
        echo "   pkg install openjdk-17"
        exit 1
    else
        echo -e "${GREEN}✅ All signing tools available!${NC}"
    fi
}

# Function to sign APK manually
sign_apk() {
    if ! check_keystore; then
        echo -e "${RED}❌ Keystore not found!${NC}"
        echo "   Run: $0 --create"
        return 1
    fi

    echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║  Sign APK                             ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
    echo ""

    echo "Enter path to unsigned APK:"
    read -p "  > " APK_PATH

    if [ ! -f "$APK_PATH" ]; then
        echo -e "${RED}❌ APK not found!${NC}"
        return 1
    fi

    echo "Enter keystore password:"
    read -s -p "  > " STORE_PASS
    echo ""

    echo "Enter key alias:"
    read -p "  > " KEY_ALIAS
    echo ""

    OUTPUT_PATH="${APK_PATH%.apk}-signed.apk"

    echo -e "${YELLOW}⏳ Signing APK...${NC}"

    if command -v apksigner &> /dev/null; then
        apksigner sign --ks "$KEYSTORE_FILE" --ks-pass pass:"$STORE_PASS" \
            --ks-key-alias "$KEY_ALIAS" "$APK_PATH" --out "$OUTPUT_PATH"
    else
        jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 \
            -keystore "$KEYSTORE_FILE" -storepass "$STORE_PASS" \
            "$APK_PATH" "$KEY_ALIAS"
        OUTPUT_PATH="$APK_PATH"
    fi

    if [ $? -eq 0 ]; then
        echo ""
        echo -e "${GREEN}✅ APK signed successfully!${NC}"
        echo "   Output: $OUTPUT_PATH"
    else
        echo -e "${RED}❌ Failed to sign APK!${NC}"
        return 1
    fi
}

# Show help
show_help() {
    echo "Keystore Management for TermuxDroid"
    echo ""
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  --create, -c    Create new keystore"
    echo "  --info, -i      View keystore information"
    echo "  --check, -t     Check signing tools availability"
    echo "  --sign, -s      Sign an APK manually"
    echo "  --help, -h      Show this help"
    echo ""
    echo "Examples:"
    echo "  $0 --create     # Create new keystore"
    echo "  $0 --check      # Verify signing tools"
    echo "  $0 --sign       # Sign an APK"
}

# Main
case "${1:-}" in
    --create|-c)
        create_keystore
        ;;
    --info|-i)
        show_info
        ;;
    --check|-t)
        check_tools
        ;;
    --sign|-s)
        sign_apk
        ;;
    --help|-h)
        show_help
        ;;
    *)
        # Default: check if keystore exists, if not create it
        if check_keystore; then
            echo -e "${GREEN}✅ Keystore found!${NC}"
            echo "   Location: $KEYSTORE_FILE"
            echo ""
            echo "Use commands:"
            echo "  --create  Create new/replacement keystore"
            echo "  --info    View keystore details"
            echo "  --check   Check signing tools"
            echo "  --sign    Sign APK manually"
        else
            echo -e "${YELLOW}⚠️  No keystore found!${NC}"
            echo ""
            echo "Create a new keystore to sign release builds?"
            read -p "(y/n): " create
            if [[ "$create" =~ ^[Yy]$ ]]; then
                create_keystore
            fi
        fi
        ;;
esac
