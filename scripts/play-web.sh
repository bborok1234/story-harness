#!/usr/bin/env bash
# Launch the local web play surface for a story (drives your own Claude Code).
# Usage:  scripts/play-web.sh [storyDir]        (default: examples/imperial-ball)
# Then open http://127.0.0.1:5173 and play.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ARG="${1:-examples/imperial-ball}"
STORY_ABS="$(cd "$ROOT/$ARG" 2>/dev/null && pwd || true)"
[ -n "$STORY_ABS" ] && [ -f "$STORY_ABS/SCENE.md" ] || { echo "no story at: $ARG (need a SCENE.md)"; exit 1; }

cd "$ROOT/web"
command -v node >/dev/null || { echo "Node.js required (https://nodejs.org)"; exit 1; }
[ -d node_modules ] || { echo "installing web deps…"; npm install; }

echo "▶ Story Harness — web play"
echo "  story:  $STORY_ABS"
echo "  open:   http://127.0.0.1:5173   (press ▶ 시작 / Begin)"
echo "  engine: your own Claude Code (the bridge keeps it on your subscription)"
echo
STORY="$STORY_ABS" exec npm run dev
