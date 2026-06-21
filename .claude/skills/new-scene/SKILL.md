---
name: new-scene
description: Start a fresh scene/situation in the current story (new location, mood, who's present, goal) reusing existing characters. Use when the player types /new-scene <idea> or asks to jump to a new situation, time-skip, or set up a new encounter.
disable-model-invocation: true
---

# New scene

Reset `SCENE.md` to a new situation in the **current** story, keeping the world and characters.

1. **Read** the current `SCENE.md`, `index.md`, `characters/index.md`, and `states/state.json` so the
   new scene is consistent with who exists and where things stand.
2. **Get the idea** from `$ARGUMENTS` (e.g. "three days later, the rival's gala"). If vague, ask 1–2
   quick questions (where, who's present, what the player wants here, mode if changing).
3. **Preserve continuity:** append a `log.md` beat marking the transition
   (`- [turn N] (imp:4) scene: <old> → <new>`). If the prior scene mattered, note it; long logs →
   suggest `/compact`.
4. **Rewrite `SCENE.md`:** set `mode:` (keep or change), `location`, `mood`, the `You: persona` link,
   **Active characters** (link existing `characters/*.md`; create a new one via `/new-character` if a
   new face appears), **Current goal**, and any **Available events**. If a character should open the
   scene, make sure their file has a fitting **Greeting**.
5. **Don't change `states/state.json`** numbers unless the time-skip logically shifts something — and if
   so, persist that first. Confirm briefly; the next player input starts the scene.
