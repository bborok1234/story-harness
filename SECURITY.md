# Security Policy

## Reporting a vulnerability

Please report security issues privately to **limmir88@gmail.com** (or via GitHub's private security
advisories), not in public issues. We aim to acknowledge within a few days.

## Scope & caveats

Story Harness runs **on top of Claude Code**, which is an autonomous agent that reads and writes files
and can run shell commands. Keep this in mind:

- **Play stories you trust.** A story directory is data the agent reads and acts on. A malicious
  `SCENE.md`/character file could attempt prompt-injection. Treat downloaded stories like untrusted
  code.
- **A story carries a `.claude/settings.json` with hooks.** Story dirs (the demo, anything from
  `templates/story/`) ship a `.claude/settings.json` that selects the output style and runs `Stop`/
  `SessionStart` hooks (shell commands) when you open them. A malicious shared story could put harmful
  commands there — i.e. opening it can run code. **Inspect `.claude/settings.json` before playing a
  story you didn't create.** Claude Code may also prompt before trusting new hooks.
- **The eval runner spawns `claude` with `--permission-mode acceptEdits`** (or `bypassPermissions`
  via `EVAL_BYPASS=1`). Only run it on scenarios you trust, in a directory you control.
- **Saves are plain file copies.** They contain whatever the story contained — review before sharing.

This project itself stores no secrets and makes no network calls beyond what the underlying Claude
Code engine does.
