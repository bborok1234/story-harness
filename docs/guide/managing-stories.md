# Managing stories

**English** | [한국어](managing-stories.ko.md)

The one rule that removes all confusion:

> **Manage from the harness root. Play from the story folder.**
> One story = one folder = one Claude Code session.

## Where things live

| Place | What |
|---|---|
| the cloned repo (harness root) | the engine: skills, templates, `scripts/`. Run management commands here. |
| `examples/imperial-ball/` | the bundled **demo** — a sample, not your save. |
| `stories/<name>/` | **your** stories (git-ignored). Each is one playable folder. |

(Power users: set `STORY_HOME` to keep stories outside the repo.)

## The lifecycle

```bash
# 1. create — from the harness root
/new-story space-opera          # → scaffolds stories/space-opera/

# 2. play — from the story folder
cd stories/space-opera && claude
# the game-master voice + autosave turn on automatically (that folder's .claude/settings.json)

# 3. list — from the harness root
/stories

# 4. resume — just open the folder again; state lives in its files
cd stories/space-opera && claude
```

## Switching stories

Open a different folder. A story is bound to its directory, so "switching" = starting a session in
another story's folder. A single in-app picker/launcher is coming — see the
[roadmap](../../ROADMAP.md) (P3, local web surface).

## Why it's structured this way

Stories are plain files, so a folder *is* the save — portable, git-versionable, inspectable. Keeping
your stories in `stories/` (not in `examples/`) keeps your content separate from the distribution and
makes every story a clean, self-contained unit.
