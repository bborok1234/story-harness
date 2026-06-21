# Contributing to Story Harness

Thanks for your interest. Story Harness is a thin distribution layer on top of Claude Code — most
contributions are Markdown (skills, output-styles, story templates), not application code.

## Ground rules

- **Read the constitution first:** [`CLAUDE.md`](CLAUDE.md). It defines where each thing lives and
  the rules new contributions must follow.
- **Keep the constitution lean.** `CLAUDE.md` must stay ≤120 lines. Procedures go in a skill; tone
  goes in the output-style; deterministic enforcement goes in a hook — not in `CLAUDE.md`.
- **Story files follow the OKF convention:** Markdown + YAML frontmatter with a `type`, relationships
  as Markdown links, an `index.md` per folder, an append-only `log.md`.

## Before you open a PR

```bash
./scripts/check.sh              # L0 static checks — must be green
EVAL_DRY=1 ./evals/run.sh       # validate eval setup (no LLM)
```
Run a live scenario when you change play behavior: `./evals/run.sh dance-prince`.

## Adding things

- **A play/authoring procedure** → a skill: `.claude/skills/<name>/SKILL.md` (frontmatter `name`
  matching the folder + a `description` saying *what it does and when to use it*).
- **A user command** (`/foo`) → a skill with `disable-model-invocation: true`.
- **A context-heavy lookup or critique** → a sub-agent: `.claude/agents/<name>.md`.
- **Something that must run every time** → a hook in `.claude/settings.json`.
- **A new example story** → a folder under `examples/` following `templates/story/`.

## PR checklist

- [ ] `./scripts/check.sh` is green
- [ ] `CLAUDE.md` still ≤120 lines (if touched)
- [ ] New skills have a triggering `description`
- [ ] Updated the relevant `index.md` / docs
- [ ] If it changes the plan's scope, updated `docs/plan/`

By contributing you agree your work is licensed under the [MIT License](LICENSE).
