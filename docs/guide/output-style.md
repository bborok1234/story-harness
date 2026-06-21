# The game-master voice (output style)

**English** | [한국어](output-style.ko.md)

Claude Code ships as a software-engineering assistant. To roleplay, you swap its system-level persona
for the **Storyteller** output style:

```
/output-style storyteller
```

This is the single switch that turns the coder into a game master. It:

- removes the built-in coding instructions (`keep-coding-instructions: false`),
- installs the GM voice: second person, present tense, scene-paced, characters with their own voices,
- enforces the contract — *the player owns their character; facts come from files; persist before you
  narrate.*

You only set it **once per session**; it persists. To go back to normal Claude Code, run
`/output-style default`.

## Voice vs. procedure

- The **output style** (`.claude/output-styles/storyteller.md`) = *who you are and how you sound.*
- The **`storyteller` skill** (`.claude/skills/storyteller/`) = *the step-by-step turn loop.*

The skill auto-loads when you're playing (it triggers on a story directory + an in-character action),
so even without the output style the mechanics work — but the prose is much better with it on.

## Out-of-character

Type `(OOC: ...)` to step out briefly (ask a question, adjust the scene); the Storyteller answers
plainly, changes nothing, and returns to the fiction next turn.
