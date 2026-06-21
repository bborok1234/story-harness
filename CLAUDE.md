# Story Harness — project constitution

Turn Claude Code into a roleplay/storytelling engine. Environment engineering, not prompt
engineering: the world lives in **files**; read only what the scene needs, when it needs it.
This file is the constitution — short, always-on. Behavior lives in skills; detail lives in files.

## Project map

| Path | What |
|---|---|
| `.claude/output-styles/storyteller.md` | GM persona (the play-time system prompt) |
| `.claude/skills/storyteller/` | the play loop (auto-loads when playing) |
| `.claude/skills/{recap,save,new-story,new-character}/` | user commands |
| `.claude/agents/lore-keeper.md` | sub-agent: digests long history → deltas + continuity |
| `templates/story/` | scaffold a new story copies this |
| `examples/imperial-ball/` | runnable demo |
| `scripts/check.sh` | static checks (L0) |
| `evals/` | headless scenario tests (L1) |
| `docs/plan/` | trackable plans |

## Story file format (OKF)

Every story file is **markdown + YAML frontmatter**. One required field: `type`
(`Character` · `Location` · `Relationship` · `Event` · `Faction` · `Scene`).
- **Relationships are markdown links** — `[Prince](../characters/prince.md)`. The links are the graph.
- Each folder has an **`index.md`** (what's inside, for navigation).
- The story has one **`log.md`** — append-only, chronological (`- [turn N] who: what happened`).
- Live numeric state lives in **`states/state.json`** (clamped 0–100); narrative state lives in files.
- Numeric ranges use named bands with legal transitions, e.g. `trust: wary → neutral → warm → loyal`.

```markdown
---
type: Character
name: Prince
status: { trust_user: 20, affection_user: 10 }
---
# Prince
Crown prince. Reserved, political, proud. Rival of [Duke Aldric](aldric.md).
```

## Inviolable rules (always)

1. **Stay in the fiction.** You are the world and its characters, never an assistant. The
   output-style sets this; do not break character or offer meta help unless asked out-of-character.
2. **Persist before you narrate.** Apply state changes to files (`state.json`, `log.md`, the
   relevant character/event file) *first*, then write the prose. Never narrate an unsaved change.
3. **Don't invent canon — read it.** Before referencing a character/place/fact, read its file. If a
   needed fact doesn't exist, create the file (don't hallucinate it inline).
4. **State changes go in files, not prose.** A relationship shift is an edit to `state.json` /
   the character file, not just a sentence. Files are the source of truth.

## Where things go (placement rules)

- **A multi-step play/authoring procedure** → a **skill** (`.claude/skills/<name>/SKILL.md`).
- **A user-typed command** (`/save`) → a skill with `disable-model-invocation: true`.
- **Context-heavy lookup or a critique with a disposable result** → a **sub-agent**.
- **Something that must run every time, deterministically** (load state on start, autosave on stop)
  → a **hook** in `.claude/settings.json` — never a rule here.
- **The play-time persona / tone** → the **output-style**, not this file.
- Keep this constitution ≤120 lines. If a rule is a procedure or path-specific, move it to a skill.

## Pointers

- How a turn is played → skill `storyteller`.
- How to start/recap/save → skills `new-story` / `recap` / `save`.
- How state is verified → `scripts/check.sh`, `evals/`.
- The full design + progress → `docs/plan/2026-06-21-story-harness.md`.

## Working if

- A scene plays from `SCENE.md` + `characters/` + `log.md` with no giant prompt.
- After a turn, `state.json` and `log.md` reflect what happened, and `check.sh` stays green.
- The world stays consistent across sessions because facts live in files, not memory.
