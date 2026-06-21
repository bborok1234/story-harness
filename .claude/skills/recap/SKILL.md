---
name: recap
description: Summarize where the story currently stands — a "previously on…" catch-up. Use when the player types /recap or asks what's happened so far.
disable-model-invocation: true
---

# Recap

Give the player a quick, evocative catch-up. This is light out-of-character help — keep it short.

1. Read `SCENE.md` (where we are), `states/state.json` (key numbers), and the **tail** of `log.md`
   (recent beats). Glance at `index.md` if you need names.
2. Output, concisely:
   - **Where things stand** — current location, mood, who's present, the current goal.
   - **Relationships** — the notable numbers/bands from `state.json` (e.g. "Prince — trust 35 (neutral)").
   - **Recently** — 3–6 bullets of the latest events from `log.md`.
   - **Open threads** — any unresolved goals or available events worth pursuing.
3. End with a one-line nudge ("You're still in the ballroom; the Prince is watching."). Persist nothing.
