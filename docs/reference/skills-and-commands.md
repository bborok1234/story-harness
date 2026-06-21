# Skills, commands, agents & hooks

**English** | [한국어](skills-and-commands.ko.md)

Story Harness is built from Claude Code primitives. Here's what each does and where it lives.

## Output style

- **`storyteller`** (`.claude/output-styles/storyteller.md`) — the game-master persona. Set with
  `/config` → **Output style** → **storyteller**. See [guide/output-style](../guide/output-style.md).

## Skills

| Skill | Type | What |
|---|---|---|
| `storyteller` | auto | The turn loop: **CONTEXT → DECIDE → PERSIST → NARRATE**. Auto-triggers when you're in a story dir and act in character. |
| `recap` | `/recap` | A "previously on…" catch-up from `SCENE.md` + `state.json` + recent `log.md`. |
| `save` | `/save` | Snapshots the story to `saves/<timestamp>/`. |

User commands are skills with `disable-model-invocation: true`. Auto skills trigger from their
`description`. Skills live in `.claude/skills/<name>/SKILL.md`.

## The turn loop (storyteller)

1. **CONTEXT** — read `index.md`, `SCENE.md`, `state.json`, the tail of `log.md`, and each active
   character file. Read on demand, never the whole world.
2. **DECIDE** — interpret the player's action; what reacts, what changes, which event fires.
3. **PERSIST** — write changes *first*: update `state.json` (clamp 0–100, advance `turn`), append
   `log.md`, edit/create the affected files.
4. **NARRATE** — only then write the prose.

The cardinal rule: **persist before you narrate.**

## Planned (P2)

- **Sub-agent `lore-keeper`** — reads long history in an isolated context, returns just the deltas +
  a continuity verdict.
- **Hooks** (`.claude/settings.json`) — `SessionStart` loads state, `Stop` autosaves + appends the
  log, `PostToolUse` audits persist-before-narrate. Hooks are deterministic rails, not advice.

See the [roadmap](../../ROADMAP.md).
