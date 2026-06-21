---
name: compact
description: Compact a long story log into a chapter summary so long stories stay coherent. Use when the player types /compact, or automatically when log.md has grown long (~25+ beats). Moves old beats into memory/chapters/NN.md and trims the log.
---

# Compact (memory tier roll-up)

When `log.md` gets long, roll its **older** beats into a chapter summary and trim the log. Keep recent
beats live; keep durable facts; preserve pivotal moments verbatim. This is the Karpathy/MemGPT idea:
hot state stays small, history is compressed into retrievable layers.

## When to run
- The player typed `/compact`, or
- `log.md` has more than ~25 beats. (Leave the most recent ~10 beats in `log.md`.)

## Steps
1. Read `log.md`. If ≤ ~25 beats, say so and stop (nothing to compact).
2. Pick the **oldest** block to roll up (everything except the last ~10 beats).
3. Find the next chapter number `NN` (count files in `memory/chapters/`). Write
   `memory/chapters/NN.md`:
   ```markdown
   ---
   type: Memory
   chapter: NN
   turns: [<first>, <last>]
   tagline: <one line — what this arc was>
   ---
   # Chapter NN — <short title>
   **Synopsis:** 2–4 sentences of what happened and why it mattered.
   **Durable facts:** bullets of things now true (relationships shifted, secrets known, world changes).
   **Pivotal beats:** copy verbatim any beat tagged importance ≥ 8.
   ```
4. **Trim `log.md`:** remove the rolled-up beats; replace them with one marker line:
   `- [turns <first>–<last> → memory/chapters/NN.md] <tagline>`
5. **Update `memory/index.md`:** add `- [Chapter NN](chapters/NN.md) — <tagline>` under Chapters.
6. Do **not** touch `states/state.json` (it's already the hot summary) or invent facts — summarize only
   what the log/files say. Confirm briefly; persist nothing else.
