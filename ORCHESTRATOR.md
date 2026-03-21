# TermuxDroid Orchestrator

Node.js orchestrator untuk menjalankan scripts project TermuxDroid.

## Setup

```bash
# Install dependencies (jika diperlukan)
npm install

# Atau langsung gunakan (tanpa dependencies)
npm run <command>
```

## Commands

| Command | Deskripsi | Script |
|---------|-----------|--------|
| `npm run dev` | Run development mode | `./dev.sh` |
| `npm run build` | Build project | `./build.sh` |
| `npm run doctor` | Check environment | `./setup-check.sh` |
| `npm run clean` | Clean build | `./gradlew clean` |
| `npm run install` | Install APK | `./install-apk.sh` |

## Usage

```bash
# Lihat semua commands
npm run

# Run development
npm run dev

# Build project
npm run build

# Check environment
npm run doctor
```

## Alternative Usage

```bash
# Langsung via node
node bin/orchestrator.js dev
node bin/orchestrator.js build
node bin/orchestrator.js doctor

# Lihat help
node bin/orchestrator.js --help
```
