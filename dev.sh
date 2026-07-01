#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="${ROOT_DIR}/backend"
WEB_DIR="${ROOT_DIR}/web"

start_backend() (
  cd "${BACKEND_DIR}"
  if [ ! -f "venv/bin/activate" ]; then
    echo "Backend venv not found. Creating..."
    python3 -m venv venv
  fi
  # shellcheck disable=SC1091
  source "venv/bin/activate"
  pip install -q -r requirements.txt
  if [ ! -f "tarifhane.db" ]; then
    python seed.py
  fi
  uvicorn main:app --reload --host 0.0.0.0 --port 8000
)

start_web() (
  cd "${WEB_DIR}"
  if [ ! -d "node_modules" ]; then
    echo "Installing web dependencies..."
    npm install
  fi
  npm run dev
)

start_backend &
BACKEND_PID=$!
start_web &
WEB_PID=$!

cleanup() {
  kill "${BACKEND_PID}" "${WEB_PID}" 2>/dev/null || true
}
trap cleanup EXIT

wait "${BACKEND_PID}" "${WEB_PID}"
