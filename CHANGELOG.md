# Changelog

All notable changes to this project are documented here. Format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added
- **Platform parity — scene-making + 1:1 character chat** (toward Zeta/Crack/Character.AI/SillyTavern):
  - **Two play modes:** `SCENE.md` `mode: story` (GM, 2nd person) or `mode: chat` (1:1, character
    replies 1st person). New **`companion`** output-style for chat; the play loop is mode-aware.
  - **Persona:** `persona.md` (the player's own character) — the agent addresses it and never speaks
    for the player.
  - **Greetings + example dialogue:** character files carry `## Greeting` (first message) and
    `## Example dialogue` (voice anchor) — `first_mes`/`mes_example` equivalents.
  - **Scene-making:** `/new-scene` (fresh situation reusing characters); `/new-story` now asks mode +
    persona + sets the matching `outputStyle`; `/new-character` captures greeting + example dialogue.
  - **`examples/companion-cafe`** chat-mode demo (Yuna). `check.sh` validates `mode`. Pipeline verified
    via MOCK; real 1:1 play is a `claude` run.
- **Deepening — Track B (play experience, web).** Narration now **streams token-by-token**
  (`--include-partial-messages`). The browser **restores on reload**: the bridge persists each turn to
  `.session/transcript.jsonl` + the session `id`, and `/api/transcript` replays the feed and resumes
  the Claude session. The HUD shows **state deltas** (±N) — the bridge diffs `state.json` before/after a
  turn and emits a `delta` event. (Verified via typecheck/build + MOCK smoke.)
- **Deepening — Track A (memory & continuity).** Memory tiers so long stories stay coherent: a
  `Memory` file type, `memory/index.md` + `memory/chapters/NN.md`, and a `/compact` skill that rolls
  old `log.md` beats into chapter summaries (synopsis + durable facts + verbatim importance≥8 beats).
  `log.md` beats now carry an **importance 1–10** tag; the storyteller reads chapter taglines and opens
  a chapter just-in-time. State discipline: a `bands` frontmatter convention for character status, and
  `check.sh` now validates character `status` numbers (0–100). P4/P5 parked as far-future.
- **P3 (in progress) — local web play surface** (`web/`, per ADR-0002). A local Hono bridge spawns the
  user's own `claude` headless and streams **narration-only** + a live state HUD over SSE (tool diffs
  hidden); Vite + React + TS frontend; localhost-only with Origin/Host allowlist (DNS-rebinding guard);
  child env sanitized to stay on the subscription; MOCK mode. Typecheck/build + MOCK smoke + security
  guards verified. Live real-claude play is the next user step.
- **P2 — Guardrails + authoring.**
  - Per-story hooks in `.claude/settings.json`: `SessionStart` (orientation inject) and `Stop`
    (autosave `state.json`+`log.md` to `saves/_autosave/`). Scoped to the story dir, so the repo root
    stays a normal coding assistant. (Empirically verified firing.)
  - **Workspace model:** your stories live in `stories/<name>/` (git-ignored), separate from the
    `examples/` demo. Rule: *manage from the harness root, play from the story folder; one story =
    one folder = one session.* `/new-story` now scaffolds into `stories/` (location-independent) and
    prints the exact play command; new `/stories` skill lists/explains. Guide: `docs/guide/managing-stories`.
  - `/new-story` and `/new-character` authoring skills.
  - `lore-keeper` read-only sub-agent (history → facts/deltas + continuity verdict) and a `/lint`
    continuity check that delegates to it.
  - `scripts/check.sh` link-check covers docs; `SECURITY.md` notes story-settings hooks run code.

### Fixed
- Output-style activation: `/output-style` was removed in Claude Code v2.1.91. Stories now ship a
  per-story `.claude/settings.json` (`outputStyle: storyteller`) so the GM voice **auto-applies** when
  you run `claude` in a story dir — no command, and the repo root stays a normal coding assistant.
  Docs updated to the `/config` → Output style method. (Verified: skills/output-style resolve from the
  repo `.claude/`; settings select per-cwd.)

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
