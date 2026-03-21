#!/bin/bash
# Wrapper for setup-check.sh - runs from project root
exec "$(dirname "$0")/scripts/setup-check.sh" "$@"
