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

## 🛠️ Available Commands

| Command | Description |
|---------|-------------|
| `./build.sh` | Build debug APK with device selection |
| `./install-apk.sh` | Install APK to connected device |
| `./run.sh` | Launch the app on device |
| `./gradlew clean` | Clean build artifacts |
| `./gradlew assembleDebug` | Build debug APK |
| `./gradlew assembleRelease` | Build release APK |

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
├── build.sh
├── install-apk.sh
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
