---
name: stories
description: List the player's stories and show exactly how to play, create, or resume one. Use when the player types /stories or asks "what stories do I have", "where are my stories", or "how do I switch story".
disable-model-invocation: true
---

# Stories

Show the player their story library and the simple rules for managing it. Read-only.

1. **Find the homes** (run this):
   ```bash
   ROOT="${STORY_HARNESS_ROOT:-$(git rev-parse --show-toplevel 2>/dev/null)}"
   d="$PWD"; while [ "$d" != "/" ] && [ ! -d "$d/templates/story" ]; do d="$(dirname "$d")"; done
   [ -d "$d/templates/story" ] && ROOT="$d"
   STORY_HOME="${STORY_HOME:-$ROOT/stories}"
   echo "== your stories ($STORY_HOME) =="
   for s in "$STORY_HOME"/*/; do [ -d "$s" ] && [ -f "$s/SCENE.md" ] && echo "- $(basename "$s")"; done
   echo "== demo =="; echo "- examples/imperial-ball (sample)"
   ```
2. **Report** the list. For each story, if useful, peek at its `states/state.json` `turn` and
   `SCENE.md` location for a one-line status (e.g. "space-opera — turn 12, Bridge").
3. **State the rules plainly:**
   - One story = one folder = one session.
   - **Play / resume:** `cd <story folder> && claude` (it remembers state from its files).
   - **New:** `/new-story <name>` (creates under `stories/`).
   - **Switch story:** open a different folder. (A picker UI is coming — see ROADMAP P3.)
4. If `STORY_HOME` is empty, point them at `/new-story` and the demo. Persist nothing.
