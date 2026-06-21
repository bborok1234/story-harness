# Your stories live here

Each subfolder of `stories/` is **one story = one folder = one Claude Code session**.

- **Create:** from the harness root, run `/new-story <name>` → it scaffolds `stories/<name>/`.
- **Play:** `cd stories/<name> && claude` (the game-master voice + autosave hooks come from that
  folder's own `.claude/settings.json`; the skills resolve from the harness root automatically).
- **List:** run `/stories` from the harness root.

The bundled demo lives in [`../examples/imperial-ball`](../examples/imperial-ball) — that's a sample,
not your save. Put your own stories here.

> Everything under `stories/` except this README is git-ignored — it's your content, not part of the
> distribution. (Set `STORY_HOME` to keep stories somewhere else.)
