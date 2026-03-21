# 📋 TermuxDroid - Tools & Dependencies Reference

Complete reference for all tools, dependencies, and prerequisites required for TermuxDroid development.

---

## 🔧 Core Prerequisites (Required)

These tools **must** be installed before using TermuxDroid.

| Tool | Package Name | Minimum Version | Purpose | Used By |
|------|-------------|-----------------|---------|---------|
| **Java Development Kit** | `openjdk-17` | 17.x | Java compiler & runtime for building Android apps | Gradle builds, keytool, jarsigner |
| **Git** | `git` | 2.x | Version control for cloning and managing project | Project setup, version control |
| **Android Debug Bridge** | `android-tools` | 1.x | Communication with Android devices for installing/debugging apps | `adb`, device installation, debugging |

### Installation Command
```bash
pkg update && pkg upgrade
pkg install openjdk-17 git android-tools
```

---

## 📦 Optional Tools (Recommended)

These tools enhance development experience but are not strictly required.

| Tool | Package Name | Purpose | Used By | Impact if Missing |
|------|-------------|---------|---------|-------------------|
| **inotifywait** | `inotify-tools` | Real-time file system monitoring for auto-reload | `dev.sh` (dev mode) | Dev mode falls back to polling (2s delay) |
| **watch** | `procps-ng` | Periodic command execution for monitoring | `dev.sh` (status display) | Dev mode uses alternative display method |
| **apksigner** | Android SDK build-tools | Modern APK signature verification | `build.sh`, `keystore.sh` | Falls back to jarsigner verification |

### Installation Command
```bash
pkg install inotify-tools procps-ng
```

---

## 🔐 Signing Tools (For Release Builds)

Required for signing release APK/AAB for distribution.

| Tool | Package Name | Purpose | Used By |
|------|-------------|---------|---------|
| **keytool** | `openjdk-17` (included) | Generate and manage keystores | `keystore.sh --create` |
| **jarsigner** | `openjdk-17` (included) | Sign JAR/APK/AAB files | `build.sh`, `keystore.sh --sign` |
| **apksigner** | Android SDK build-tools | Android-specific APK signature verification | `build.sh` (verification) |

### Installation Command
```bash
# Already included with openjdk-17
pkg install openjdk-17
```

---

## 📊 Build Dependencies (Managed by Gradle)

These are automatically downloaded by Gradle during first build.

| Dependency | Version | Purpose | Location |
|------------|---------|---------|----------|
| **Android Gradle Plugin** | 8.0.1 | Android build system integration | `build.gradle` (project) |
| **Gradle Wrapper** | 8.x | Build automation tool | `gradlew`, `gradle/wrapper/` |
| **AndroidX AppCompat** | 1.6.1 | Backward-compatible Android components | `app/build.gradle` |
| **Material Components** | 1.9.0 | Material Design UI components | `app/build.gradle` |
| **ConstraintLayout** | 2.1.4 | Flexible layout management | `app/build.gradle` |
| **AndroidX Activity** | 1.7.2 | Activity compatibility library | `app/build.gradle` |
| **AndroidX Lifecycle** | 2.6.1 | Lifecycle-aware components | `app/build.gradle` |
| **Kotlin Stdlib** | 1.8.10 | Kotlin language support | `app/build.gradle` |

---

## 🛠️ Project Scripts Reference

| Script | Location | Purpose | NPM Command |
|--------|----------|---------|-------------|
| **Orchestrator** | `bin/orchestrator.js` | Main command runner | `node bin/orchestrator.js` |
| **Build** | `scripts/build.sh` | Build APK/AAB with signing | `npm run build` |
| **Dev Mode** | `scripts/dev.sh` | Development with auto-reload | `npm run dev` |
| **Keystore** | `scripts/keystore.sh` | Create/manage signing keys | `npm run keystore` |
| **Doctor** | `scripts/setup-check.sh` | Environment health check | `npm run doctor` |
| **Install APK** | `scripts/install-apk.sh` | Install APK to device | `npm run install` |
| **Run App** | `scripts/run.sh` | Launch app on device | - |

---

## 📋 Complete Installation Checklist

### 1. Base Requirements
```bash
pkg update && pkg upgrade
pkg install openjdk-17 git android-tools
```

### 2. Optional (Recommended)
```bash
pkg install inotify-tools procps-ng
```

### 3. Verify Installation
```bash
npm run doctor
```

### 4. Create Signing Keystore (for release builds)
```bash
npm run keystore
```

---

## 🔍 Tool Verification Commands

| Tool | Verification Command | Expected Output |
|------|---------------------|-----------------|
| Java | `java -version` | `openjdk version "17.x.x"` |
| Git | `git --version` | `git version 2.x.x` |
| ADB | `adb --version` | `Android Debug Bridge version 1.x.x` |
| keytool | `keytool -help` | Shows keytool usage |
| jarsigner | `jarsigner -help` | Shows jarsigner usage |
| apksigner | `apksigner --version` | Version number or "Android" |
| inotifywait | `inotifywait --help` | Shows inotifywait usage |

---

## ⚠️ Common Issues & Solutions

| Issue | Missing Tool | Solution |
|-------|-------------|----------|
| `java: command not found` | openjdk-17 | `pkg install openjdk-17` |
| `adb: command not found` | android-tools | `pkg install android-tools` |
| `gradlew: not found` | Git clone incomplete | Re-clone repository |
| `inotifywait: command not found` | inotify-tools | `pkg install inotify-tools` |
| `keytool: command not found` | openjdk-17 | `pkg install openjdk-17` |
| Build fails with signing error | No keystore | `npm run keystore` |

---

## 📁 Project Structure & Dependencies

```
TermuxDroid/
├── bin/
│   └── orchestrator.js        # Node.js command runner
├── scripts/
│   ├── build.sh              # Build script (requires: bash, gradle, java)
│   ├── dev.sh                # Dev mode (requires: inotifywait - optional)
│   ├── keystore.sh           # Keystore management (requires: keytool, jarsigner)
│   ├── setup-check.sh        # Environment check (requires: bash, adb)
│   ├── install-apk.sh        # Install APK to device
│   └── run.sh                # Launch app on device
├── app/
│   ├── build.gradle          # App dependencies (auto-downloaded by Gradle)
│   └── src/                  # Source code
├── gradle/
│   └── wrapper/              # Gradle wrapper (auto-downloads Gradle)
├── keystore/
│   └── release.keystore      # Signing key (created by user)
├── docs/                     # Documentation
│   ├── ORCHESTRATOR.md
│   ├── TOOLS_REFERENCE.md
│   └── UI_DEVELOPMENT_GUIDE.md
├── package.json              # NPM scripts configuration
└── build.gradle              # Project dependencies
```

---

## 🎯 Quick Reference: What Each Tool Does

### Development Flow

| Stage | Tools Used | Purpose |
|-------|-----------|---------|
| **Setup** | git, bash | Clone project, run scripts |
| **Code** | Any text editor | Write Java/Kotlin code |
| **Build** | Java, Gradle, Android Gradle Plugin | Compile code to APK/AAB |
| **Sign** | keytool, jarsigner, apksigner | Sign release builds |
| **Install** | adb | Install APK to device |
| **Debug** | adb, logcat | Debug running app |
| **Dev Mode** | inotifywait, bash | Auto-reload on file changes |

---

## 📞 Support & Documentation

- **Main Docs**: `README.md`
- **Orchestrator**: `docs/ORCHESTRATOR.md`
- **Tools Reference**: `docs/TOOLS_REFERENCE.md`
- **UI Guide**: `docs/UI_DEVELOPMENT_GUIDE.md`
- **Environment Check**: `npm run doctor`

---

**Last Updated**: March 21, 2026  
**TermuxDroid Version**: 1.0
