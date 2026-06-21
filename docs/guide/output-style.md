# The game-master voice (output style)

**English** | [한국어](output-style.ko.md)

Claude Code ships as a software-engineering assistant. Roleplay swaps its system-level persona for the
**Storyteller** output style — second person, present tense, in character, no coding help. It removes
the built-in coding instructions (`keep-coding-instructions: false`) and installs the GM voice.

## It's already on for stories

The demo and any story scaffolded from `templates/story/` ship a `.claude/settings.json`:

```json
{ "outputStyle": "storyteller" }
```

So when you run `claude` from a story directory, the game-master voice applies **automatically** — no
command needed. The skills and the output-style file are found in the project's `.claude/`; the
per-story `settings.json` only *selects* the style, so normal Claude Code behavior is untouched
everywhere else (e.g. the repo root stays a plain coding assistant).

## Setting it manually

If a story has no setting, turn it on for the session: `/config` → **Output style** → **storyteller**.
Revert with `/config` → **Output style** → **default**.

> The old `/output-style` slash command was removed in Claude Code v2.1.91 — use `/config`.

## Voice vs. procedure

- The **output style** (`.claude/output-styles/storyteller.md`) = *who you are and how you sound.*
- The **`storyteller` skill** (`.claude/skills/storyteller/`) = *the step-by-step turn loop.*

The skill auto-loads when you're playing (it triggers on a story directory + an in-character action),
so even without the output style the mechanics work — but the prose is much better with it on.

## Out-of-character

Type `(OOC: ...)` to step out briefly (ask a question, adjust the scene); the Storyteller answers
plainly, changes nothing, and returns to the fiction next turn.
