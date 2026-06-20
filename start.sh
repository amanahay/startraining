#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"
export NODE_ENV="${NODE_ENV:-production}"
export PORT="${PORT:-3100}"
node server/index.js
