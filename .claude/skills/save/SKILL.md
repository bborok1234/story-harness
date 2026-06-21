---
name: save
description: Snapshot the current story state to a timestamped folder so it can be restored later. Use when the player types /save.
disable-model-invocation: true
---

# Save

Take a full, restorable snapshot of the current story. Saves are plain copies — restore by copying back.

1. Get a timestamp: run `date -u "+%Y%m%dT%H%M%SZ"`.
2. Create `saves/<timestamp>/` and copy the live story into it (everything except `saves/` itself
   and tooling dirs):
   ```bash
   TS=$(date -u "+%Y%m%dT%H%M%SZ"); mkdir -p "saves/$TS"
   rsync -a --exclude saves --exclude .claude --exclude .git --exclude evals --exclude scripts \
     --exclude docs --exclude templates ./ "saves/$TS/" 2>/dev/null \
     || (cp -R SCENE.md log.md index.md world characters relationships events states "saves/$TS/" 2>/dev/null)
   ```
3. Confirm to the player out-of-character: the save name and what turn it captured (read `turn` from
   `states/state.json`). Example: "Saved as `20260621T120000Z` (turn 7)."

To **restore** later, the player copies a save's files back over the story root.
