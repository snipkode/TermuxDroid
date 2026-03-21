#!/bin/bash
# Wrapper for build.sh - runs from project root
exec "$(dirname "$0")/scripts/build.sh" "$@"
