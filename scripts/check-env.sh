#!/usr/bin/env bash
set -e

echo "Checking tools..."

node --version
npm --version
git --version
python3 --version || true
uv --version || true
openspec --version || true

echo "Environment looks usable."