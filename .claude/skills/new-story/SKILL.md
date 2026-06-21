---
name: new-story
description: Scaffold a brand-new story directory from the template. Use when the player types /new-story <name> or asks to start a new story from scratch. Run from the harness repo (where templates/ lives).
disable-model-invocation: true
---

# New story

Create a fresh, playable story folder from `templates/story/`.

1. **Name.** Take it from the command arguments (`$ARGUMENTS`). Slugify: lowercase, spaces→hyphens,
   ASCII only. If no name was given, ask for one.
2. **Copy the template:**
   ```bash
   cp -R templates/story "<slug>"
   ```
   (If `templates/story` isn't in the current directory, you're not in the harness repo — tell the
   player to run this from the repo, or copy the folder manually.)
3. **Interview the player** with `AskUserQuestion` for the essentials, unless they're already in the
   request: genre/tone, setting, who the player's character is, the opening situation, 1–2 key NPCs.
   Keep it to 2–4 questions.
4. **Fill the scaffold** (replace every `<placeholder>`):
   - `<slug>/index.md` — title + one-line premise.
   - `<slug>/SCENE.md` — opening location, mood, active characters, current goal, available events.
   - `<slug>/characters/<name>.md` — one file per named NPC (OKF `type: Character`), linked from
     `characters/index.md`.
   - `<slug>/states/state.json` — replace the `<character>` placeholder with real characters
     (trust/affection 0–100); keep `turn: 0`.
   - `<slug>/log.md` — set the `[turn 0]` opening line.
5. **Verify:** run `./scripts/check.sh` if available.
6. **Confirm:** "Created `<slug>/` — `cd <slug> && claude` to play." (It already carries
   `.claude/settings.json` so the storyteller voice auto-applies.)
