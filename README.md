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
./build.sh
./install-apk.sh
```

---

## ✅ Environment Checklist

Before you start, verify your setup:

```bash
./setup-check.sh
```

This will check:
- Java installation
- ADB and Android tools
- Project structure
- Device connection
- Optional tools (inotifywait for auto-reload)

**Quick install all requirements:**
```bash
pkg install openjdk-17 git android-tools inotify-tools
```

---

## 🛠️ Available Commands

### Main Scripts

| Command | Description |
|---------|-------------|
| `./setup-check.sh` | Check environment setup and prerequisites |
| `./build.sh` | Build debug APK with device selection |
| `./install-apk.sh` | Install APK to connected device |
| `./run.sh` | Launch the app on device |
| `./dev.sh` | **Dev mode with auto-reload** (hot reload-like) |

### Gradle Commands

| Command | Description |
|---------|-------------|
| `./gradlew clean` | Clean build artifacts |
| `./gradlew assembleDebug` | Build debug APK |
| `./gradlew assembleRelease` | Build release APK |

### Direct Script Access

Scripts are located in `scripts/` folder. You can run them directly:
```bash
./scripts/dev.sh      # Same as ./dev.sh
./scripts/build.sh    # Same as ./build.sh
```

---

## 🔥 Dev Mode (Auto-Reload)

For faster development with **hot reload-like** experience:

### Start Dev Mode

```bash
./dev.sh
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
│   └── setup-check.sh   # Environment checklist
├── build.sh             # Wrapper (runs scripts/build.sh)
├── run.sh               # Wrapper (runs scripts/run.sh)
├── dev.sh               # Wrapper (runs scripts/dev.sh)
├── install-apk.sh       # Wrapper (runs scripts/install-apk.sh)
├── setup-check.sh       # Wrapper (runs scripts/setup-check.sh)
├── build.gradle
└── README.md
```

**Note:** Wrapper scripts in root directory call scripts in `scripts/` folder.
You can use either `./dev.sh` or `./scripts/dev.sh` - both work the same!

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
