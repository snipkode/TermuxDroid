#!/bin/bash
# Wrapper for install-apk.sh - runs from project root
exec "$(dirname "$0")/scripts/install-apk.sh" "$@"
