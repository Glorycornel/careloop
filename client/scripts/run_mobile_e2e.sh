#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FLOW_DIR="$ROOT_DIR/.maestro"

if ! command -v maestro >/dev/null 2>&1; then
  echo "maestro CLI is not installed or not on PATH"
  echo "install Java first, then install Maestro: curl -Ls https://get.maestro.mobile.dev | bash"
  exit 1
fi

if [[ -z "${MAESTRO_APP_ID:-}" ]]; then
  echo "MAESTRO_APP_ID is required"
  exit 1
fi

MAESTRO_E2E_FULL_NAME="${MAESTRO_E2E_FULL_NAME:-CareLoop E2E}"
MAESTRO_E2E_EMAIL="${MAESTRO_E2E_EMAIL:-careloop.e2e.$(date +%s)@example.com}"
MAESTRO_E2E_PASSWORD="${MAESTRO_E2E_PASSWORD:-secret123}"

echo "Running Maestro auth flows with $MAESTRO_E2E_EMAIL"

maestro test \
  -e MAESTRO_APP_ID="$MAESTRO_APP_ID" \
  -e MAESTRO_E2E_FULL_NAME="$MAESTRO_E2E_FULL_NAME" \
  -e MAESTRO_E2E_EMAIL="$MAESTRO_E2E_EMAIL" \
  -e MAESTRO_E2E_PASSWORD="$MAESTRO_E2E_PASSWORD" \
  "$FLOW_DIR/auth-signup-library-logout.yaml"

maestro test \
  -e MAESTRO_APP_ID="$MAESTRO_APP_ID" \
  -e MAESTRO_E2E_EMAIL="$MAESTRO_E2E_EMAIL" \
  -e MAESTRO_E2E_PASSWORD="$MAESTRO_E2E_PASSWORD" \
  "$FLOW_DIR/auth-signin.yaml"
