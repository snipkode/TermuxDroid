# TermuxDroid Scripts

Collection of development scripts for TermuxDroid Framework.

## 📜 Available Scripts

| Script | Description | Usage |
|--------|-------------|-------|
| `setup-check.sh` | Verify environment setup | `./setup-check.sh` |
| `build.sh` | Build debug APK | `./build.sh` |
| `install-apk.sh` | Install APK to device | `./install-apk.sh` |
| `run.sh` | Launch app on device | `./run.sh` |
| `dev.sh` | Dev mode with auto-reload | `./dev.sh` |

## 🚀 Quick Start

### 1. Check Environment
```bash
./setup-check.sh
```

### 2. Build & Install
```bash
./build.sh
```

### 3. Dev Mode (Recommended)
```bash
./dev.sh
```

## 📝 Notes

- All scripts can be run from project root directory
- Wrapper scripts in root (`./dev.sh`) call scripts in `scripts/` folder
- Scripts automatically detect project directory

## 🔧 Requirements

- Java 17+
- ADB (Android Debug Bridge)
- Gradle wrapper (included)
- Optional: `inotify-tools` for instant file watching

Install requirements:
```bash
pkg install openjdk-17 git android-tools inotify-tools
```
