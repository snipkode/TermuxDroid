# 🤖 TermuxDroid Framework

**Native Android Development Framework for Termux**

Build pure Android native applications directly on your Android device using Termux - no PC, no Android Studio required!

[![Platform](https://img.shields.io/badge/platform-Android-green.svg)](https://www.android.com/)
[![Java](https://img.shields.io/badge/java-17-orange.svg)](https://openjdk.java.net/)
[![Gradle](https://img.shields.io/badge/gradle-8.x-blue.svg)](https://gradle.org/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

---

## 🚀 Features

- ✅ **100% Native Android** - Pure Java, no React Native/Flutter overhead
- ✅ **Lightweight** - APK size ~2-3 MB (vs 20-30 MB for RN/Flutter)
- ✅ **Termux Optimized** - Built specifically for Termux environment
- ✅ **Material Design** - Modern UI with Material Components
- ✅ **Multi-Device Support** - Install to multiple devices simultaneously
- ✅ **Java 17** - Latest LTS Java version support
- ✅ **Gradle 8.x** - Latest Gradle build system
- ✅ **Ready to Customize** - Clean architecture for your apps

---

## 📦 Quick Start

### Prerequisites

```bash
pkg update && pkg upgrade
pkg install openjdk-17 git android-tools
```

### Clone & Build

```bash
git clone https://github.com/snipkode/TermuxDroid.git
cd TermuxDroid

# Build and install
npm run build
npm run install

# Or use shell scripts
./build.sh
./install-apk.sh
```

---

## ✅ Environment Checklist

Before you start, verify your setup:

```bash
./scripts/setup-check.sh
# or
npm run doctor
```

This will check:
- Java installation
- ADB and Android tools
- Android SDK (optional, for advanced features)
- Project structure
- Device connection
- Optional tools (inotifywait for auto-reload)

**Quick install all requirements:**
```bash
pkg install openjdk-17 git android-tools inotify-tools
```

**Full setup with Android SDK from Google:**
```bash
npm run install-deps
# or
./scripts/install-deps.sh --all -y
```

**Setup environment variables:**
```bash
npm run setup-env
# or
./scripts/setup-env.sh
```

---

## 🛠️ Available Commands

### Node.js Orchestrator (Recommended)

Quick commands via NPM:

| Command | Description |
|---------|-------------|
| `npm run dev` | **Dev mode with auto-reload** |
| `npm run build` | Build debug APK |
| `npm run build:release` | Build release APK (auto-sign if keystore exists) |
| `npm run build:aab` | Build AAB for Play Store (auto-sign if keystore exists) |
| `npm run doctor` | Check environment setup |
| `npm run keystore` | Create/manage signing keystore |
| `npm run clean` | Clean build artifacts |
| `npm run install` | Install APK to device |
| `npm run install-deps` | **Install all dependencies** (Java, SDK, tools) |
| `npm run setup-env` | **Setup environment variables** (ANDROID_HOME, PATH) |

```bash
# See all commands
npm run

# Or use directly
node bin/orchestrator.js dev
```

### Shell Scripts

| Command | Description |
|---------|-------------|
| `./scripts/build.sh` | Build debug APK (default) |
| `./scripts/build.sh --release` | Build release APK (unsigned) |
| `./scripts/build.sh --aab` | Build AAB (for Google Play) |
| `./scripts/setup-check.sh` | Check environment setup |
| `./scripts/install-deps.sh` | **Install all dependencies** |
| `./scripts/setup-env.sh` | **Setup environment variables** |
| `./scripts/install-apk.sh` | Install APK to device |
| `./scripts/run.sh` | Launch app on device |
| `./scripts/dev.sh` | **Dev mode with auto-reload** |

### Gradle Commands

| Command | Description |
|---------|-------------|
| `./gradlew clean` | Clean build artifacts |
| `./gradlew assembleDebug` | Build debug APK |
| `./gradlew assembleRelease` | Build release APK |

### Direct Script Access

All scripts are in the `scripts/` folder:
```bash
./scripts/build.sh      # Build APK
./scripts/dev.sh        # Dev mode with auto-reload
./scripts/install-apk.sh
```

---

## 🔐 Signing Release Builds

For **Play Store upload** or **distribution**, you need to sign your APK/AAB.

### Quick Setup

```bash
# 1. Check signing tools
npm run doctor

# 2. Create keystore
npm run keystore
# or
./scripts/keystore.sh --create
```

### Build Signed Release

```bash
# Signed APK
npm run build:release

# Signed AAB (for Play Store)
npm run build:aab
```

**How it works:**
- If keystore exists, release builds are **automatically signed**
- You'll be prompted for keystore password during build
- Unsigned builds available with `--no-sign` flag

### Keystore Commands

```bash
# Create new keystore
./scripts/keystore.sh --create

# View keystore info
./scripts/keystore.sh --info

# Check signing tools
./scripts/keystore.sh --check

# Sign APK manually
./scripts/keystore.sh --sign
```

### ⚠️ Important

- **Backup your keystore!** Lost keystore = can't update your app
- **Never commit keystore to git** (already in `.gitignore`)
- Use same keystore for all updates to same app on Play Store

---

## 🔥 Dev Mode (Auto-Reload)

For faster development with **hot reload-like** experience:

### Start Dev Mode

```bash
./scripts/dev.sh
```

This will:
1. Build initial APK
2. Install to device
3. Launch the app
4. **Watch for file changes** and auto-rebuild + auto-restart

### How It Works

| Change Detected | Action |
|-----------------|--------|
| Java files (`.java`) | Rebuild → Install → Restart app |
| Resources (`.xml`, etc) | Rebuild → Install → Restart app |

### Detection Modes

- **inotifywait** (instant) - Real-time file watching
- **Polling** (fallback) - Checks every 2 seconds

### Install inotifywait for Instant Detection

```bash
pkg install inotify-tools
```

### Stop Dev Mode

Press `Ctrl+C` to stop watching.

---

## 📁 Project Structure

```
TermuxDroid/
├── bin/
│   └── orchestrator.js    # Node.js command orchestrator
├── app/
│   ├── src/main/
│   │   ├── java/com/myapp/
│   │   │   ├── MainActivity.java
│   │   │   └── MyApplication.java
│   │   ├── res/layout/activity_main.xml
│   │   └── AndroidManifest.xml
│   └── build.gradle
├── scripts/
│   ├── build.sh         # Build APK with device selection
│   ├── install-apk.sh   # Install APK to device
│   ├── run.sh           # Launch app
│   ├── dev.sh           # Dev mode with auto-reload
│   ├── keystore.sh      # Create/manage signing keystore
│   └── setup-check.sh   # Environment checklist
├── docs/                # Documentation
│   ├── ORCHESTRATOR.md
│   ├── TOOLS_REFERENCE.md
│   └── UI_DEVELOPMENT_GUIDE.md
├── package.json         # NPM scripts configuration
├── build.gradle
└── README.md
```

---

## 🎨 Customization

### Change Package Name

1. Edit `app/build.gradle`: `applicationId "com.yourapp"`
2. Update `AndroidManifest.xml`
3. Move Java files to new package directory

### Change App Name

Edit `app/src/main/res/values/strings.xml`

---

## 📄 License

MIT License

---

**Made with ❤️ for Termux developers**
