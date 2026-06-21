---
name: new-story
description: Scaffold a brand-new story and tell the player exactly how to play it. Use when the player types /new-story <name> or asks to start a new story. Works from anywhere inside the harness; creates the story under stories/.
disable-model-invocation: true
---

# New story

Create a fresh, playable story folder under the **stories home**, then print the exact command to play
it. Stories are kept separate from the bundled demo (`examples/`) — never scaffold into `examples/`.

1. **Locate the harness root and stories home** (run this; don't guess paths):
   ```bash
   ROOT="${STORY_HARNESS_ROOT:-$(git rev-parse --show-toplevel 2>/dev/null)}"
   # fall back: walk up from cwd to find the folder containing templates/story
   d="$PWD"; while [ "$d" != "/" ] && [ ! -d "$d/templates/story" ]; do d="$(dirname "$d")"; done
   [ -d "$d/templates/story" ] && ROOT="$d"
   STORY_HOME="${STORY_HOME:-$ROOT/stories}"
   echo "ROOT=$ROOT  STORY_HOME=$STORY_HOME"
   ```
   If `ROOT` has no `templates/story`, tell the player to run from inside the harness repo.
2. **Name** from `$ARGUMENTS`; slugify (lowercase, spaces→hyphens, ASCII). If empty, ask.
3. **Scaffold:** `mkdir -p "$STORY_HOME" && cp -R "$ROOT/templates/story" "$STORY_HOME/<slug>"`.
   If `$STORY_HOME/<slug>` already exists, stop and ask (don't overwrite).
4. **Interview** the player with `AskUserQuestion` (2–4 questions) unless already specified: genre/tone,
   setting, who the player's character is, opening situation, 1–2 key NPCs.
5. **Fill the scaffold** (replace every `<placeholder>`): `index.md` (title + premise), `SCENE.md`
   (opening location/mood/active characters/goal/events), one `characters/<name>.md` per NPC (linked
   from `characters/index.md`), `states/state.json` (real characters, `turn: 0`), `log.md` opening line.
6. **Verify:** run `"$ROOT/scripts/check.sh"` if present.
7. **Print the play command, exactly:**
   > Created `stories/<slug>/`. To play: `cd "$STORY_HOME/<slug>" && claude`
   Remind them the game-master voice + autosave apply automatically there. Don't start narrating — this
   is authoring.
