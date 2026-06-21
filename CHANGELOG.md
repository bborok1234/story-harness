# Changelog

All notable changes to this project are documented here. Format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added
- **P1 — MVP distribution.** Story Harness as a Claude Code distribution:
  - `CLAUDE.md` lean constitution (≤120 lines) + `AGENTS.md` mirror.
  - `storyteller` output-style (game-master persona) and `storyteller` skill (the turn loop:
    CONTEXT → DECIDE → PERSIST → NARRATE, persist-before-narrate).
  - `/recap` and `/save` command skills.
  - OKF story file format + `templates/story/` scaffold.
  - `examples/imperial-ball/` runnable demo.
  - `scripts/check.sh` (L0 static checks) and `evals/` L1 scenario runner with `dance-prince`.
  - Open-source project setup (LICENSE, CONTRIBUTING, CODE_OF_CONDUCT, SECURITY, CI).
- **Docs & i18n.** `docs/` split into `guide/` + `reference/` with a `docs/README.md` index; root
  `ROADMAP.md`. Bilingual docs (English source of truth + Korean `*.ko.md` siblings, `README.ko.md`)
  with a language switcher. `scripts/check.sh` now link-checks docs too. Structure modeled on
  `oh-my-openagent` / lazycodex, kept minimal (no website).

See [`docs/plan/2026-06-21-story-harness.md`](docs/plan/2026-06-21-story-harness.md) for the roadmap
(P2 guardrails/authoring, P3 CLI wrapper + plugin packaging, P4 interop).
