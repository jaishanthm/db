#!/usr/bin/env bash
set -e

# Trap exit/interrupt to kill all background processes cleanly
trap 'kill $(jobs -p) 2>/dev/null || true; exit' SIGINT SIGTERM EXIT

echo "=================================================="
echo " Starting Malware Information Platform"
echo " Backend:  http://localhost:8000 (API Docs: /docs)"
echo " Frontend: http://localhost:5173"
echo "=================================================="

# Start FastAPI backend
.venv/bin/uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload &

# Start Vite frontend
bun run --cwd frontend dev --host 0.0.0.0 --port 5173 &

# Wait for both processes
wait
