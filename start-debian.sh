#!/usr/bin/env bash
set -euo pipefail

APP_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$APP_DIR"

export NODE_ENV="${NODE_ENV:-production}"
export PORT="${PORT:-3100}"
exec node server/index.js
