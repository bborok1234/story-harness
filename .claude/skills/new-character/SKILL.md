---
name: new-character
description: Add a new character to the current story in OKF format. Use when the player types /new-character <name> or asks to add/introduce a new character to the story they're in.
disable-model-invocation: true
---

# New character

Add one character file to the story in the current directory.

1. **Name** from the command arguments (`$ARGUMENTS`); slugify for the filename (ASCII).
2. **Gather essentials** (ask briefly with `AskUserQuestion` if not given): role, personality in a
   line or two, a goal, a secret or tension, who they relate to, a **greeting** (their opening line /
   first message), and a snippet of **example dialogue** (so their voice is anchored).
3. **Create `characters/<slug>.md`:**
   ```markdown
   ---
   type: Character
   name: <Name>
   role: <role>
   status: { trust_user: 0, affection_user: 0 }
   bands: { trust_user: [hostile, wary, neutral, warm, loyal], affection_user: [cold, cordial, fond, devoted] }
   ---
   # <Name>
   Personality. **Goals:** … **Knows:** … **Relationships:** rival of [Other](other.md).

   ## Voice
   How they sound in one line (register, tics).

   ## Greeting
   Their opening line / first message — used when they enter a scene.

   ## Example dialogue
   - User: …
   - <Name>: "…"   (1–3 exchanges that capture the voice)
   ```
   `bands` name the 0–100 ranges; move a status one band-step at a time during play. The **Greeting**
   and **Example dialogue** sections are what the play loop uses for the opening and for voice.
   Write relationships as Markdown links to other character files.
4. **Register state:** add `"<slug>": { "trust": 0, "affection": 0 }` under `relationships` in
   `states/state.json` (only if you track numbers for this character).
5. **Link** the character from `characters/index.md` (add a roster line).
6. **Confirm** and offer to bring them into the scene (`SCENE.md` → Active characters) if appropriate.

Don't start narrating — this is authoring, not a play turn.
