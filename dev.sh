#!/bin/bash
# Wrapper for dev.sh - runs from project root
exec "$(dirname "$0")/scripts/dev.sh" "$@"
