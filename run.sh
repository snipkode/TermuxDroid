#!/bin/bash
# Wrapper for run.sh - runs from project root
exec "$(dirname "$0")/scripts/run.sh" "$@"
