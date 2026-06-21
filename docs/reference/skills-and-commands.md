# Skills, commands, agents & hooks

**English** | [한국어](skills-and-commands.ko.md)

Story Harness is built from Claude Code primitives. Here's what each does and where it lives.

## Output style

- **`storyteller`** (`.claude/output-styles/storyteller.md`) — game-master persona (story mode, 2nd person).
- **`companion`** (`.claude/output-styles/companion.md`) — 1:1 character chat (chat mode, the character
  replies in 1st person to your persona). Picked by the scene's `mode` via the story's settings; or set
  manually `/config` → **Output style**. See [guide/output-style](../guide/output-style.md).

## Skills

| Skill | Type | What |
|---|---|---|
| `storyteller` | auto | The turn loop: **CONTEXT → DECIDE → PERSIST → NARRATE**. Auto-triggers when you're in a story dir and act in character. |
| `recap` | `/recap` | A "previously on…" catch-up from `SCENE.md` + `state.json` + recent `log.md`. |
| `save` | `/save` | Snapshots the story to `saves/<timestamp>/`. |
| `new-story` | `/new-story` | Scaffold a new story into `stories/<name>/` + print how to play it. |
| `stories` | `/stories` | List your stories and show how to play/create/switch. |
| `new-character` | `/new-character` | Add an OKF character (with greeting + example dialogue) to the story. |
| `new-scene` | `/new-scene` | Start a fresh situation in the current story, reusing characters. |
| `lint` | `/lint` | Continuity check — delegates to the `lore-keeper` sub-agent. |
| `compact` | `/compact` | Roll old `log.md` beats into a `memory/chapters/` summary (long-story coherence). |

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

## Sub-agents

- **`lore-keeper`** (`.claude/agents/lore-keeper.md`) — reads the full history in an isolated context
  and returns only facts/deltas + a continuity verdict. Read-only. Used by `/lint`.

## Hooks

Story directories carry a `.claude/settings.json` with deterministic hooks (they run every time and
can't be skipped by the model):

- **`SessionStart`** — injects a one-line orientation so a resumed session knows it's mid-story.
- **`Stop`** — autosaves `state.json` + `log.md` to `saves/_autosave/` after each turn.

Hooks are scoped per story (settings resolve from the working directory), so the harness repo root
stays a normal coding assistant. A story's hooks run shell commands on open — only play stories you
trust (see [SECURITY.md](../../SECURITY.md)).

See the [roadmap](../../ROADMAP.md).
