#!/usr/bin/env bash
# Launch the local web hub (library + create + play) for Story Harness.
# It drives your OWN Claude Code — nothing is hosted, no per-use billing.
# Usage:  scripts/play-web.sh        then open http://127.0.0.1:5173
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT/web"
command -v node >/dev/null || { echo "Node.js required (https://nodejs.org)"; exit 1; }
[ -d node_modules ] || { echo "installing web deps…"; npm install; }
echo "▶ Story Harness — web"
echo "  open:   http://127.0.0.1:5173"
echo "  there:  pick a story, or “+ 새 스토리” to create one (chat or story mode)"
echo "  engine: your own Claude Code (stays on your subscription)"
echo
exec npm run dev
