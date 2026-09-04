#!/usr/bin/env bash
# Stops any running Metro/Expo instance, then starts the app fresh.
# Uses --tunnel since LAN mode is unreliable under WSL2 (see scripts/start-lan.sh).
set -euo pipefail

PORT=8081

echo "Stopping any process on port $PORT..."
PIDS=$(lsof -ti "tcp:$PORT" 2>/dev/null || true)
if [ -n "$PIDS" ]; then
  kill -9 $PIDS 2>/dev/null || true
fi

pkill -f "expo start" 2>/dev/null || true

echo "Starting Expo (tunnel)..."
exec npx expo start --tunnel "$@"
