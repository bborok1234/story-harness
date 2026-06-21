# Story Harness

[![check](https://github.com/bborok1234/story-harness/actions/workflows/check.yml/badge.svg)](https://github.com/bborok1234/story-harness/actions/workflows/check.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**English** | [한국어](README.ko.md)

**What if character chat worked like Claude Code?**

Story Harness turns Claude Code into an interactive roleplay/storytelling engine — not by building a
new agent loop, but as a thin **distribution layer on top of Claude Code**. The world lives in
**files**; the agent reads only what a scene needs, when it needs it. *Environment engineering, not
prompt engineering.*

## Play the demo

```bash
cd examples/imperial-ball
claude            # then, in character:  "I ask Prince Aurelio for the first dance."
```

The Storyteller reads the scene, applies your action to the story files, then narrates. Try `/recap`
or `/save`. Your relationships and the world's state persist in `states/state.json` and `log.md` —
plain files you can read, edit, and version with git.

> For the full game-master voice, set it once via `/config` → **Output style** → **storyteller**.

## Play in the browser (local web surface)

Prefer a clean GUI over the raw CLI? A local web surface renders **only the narration + a live state
HUD** (no tool diffs), streaming token-by-token, and restores on reload. It drives **your own** Claude
Code — nothing is hosted.

```bash
./scripts/play-web.sh                         # imperial-ball (story mode)
./scripts/play-web.sh examples/companion-cafe # 1:1 character chat (Yuna)
./scripts/play-web.sh stories/<name>          # your own story
```
Open **http://127.0.0.1:5173**, press **▶ 시작 / Begin**, and play. Needs Node.js; see [`web/`](web/README.md).

## How it works

| Layer | Where |
|---|---|
| **Environment** | `story/` files — `SCENE.md`, `characters/`, `world/`, `events/`, `log.md`, `states/state.json` |
| **Brain** | `CLAUDE.md` — a short constitution (file format + rules), not a mega-prompt |
| **Persona** | `.claude/output-styles/storyteller.md` — the GM voice |
| **Controls** | `.claude/skills/` (play loop + `/recap` `/save`), `.claude/agents/`, hooks |

Story files use the **Open Knowledge Format** convention: markdown + YAML frontmatter (`type:`),
relationships as markdown links, an `index.md` per folder, an append-only `log.md`.

## Start a new story

Copy the scaffold and edit it:
```bash
cp -R templates/story my-story && cd my-story && claude
```

## Verify

```bash
./scripts/check.sh             # static checks (no LLM)
./evals/run.sh dance-prince    # scenario test (drives claude headless)
```

## Status

P1 (MVP) — see the [roadmap](ROADMAP.md) and the
[plan](docs/plan/2026-06-21-story-harness.md) for progress. Built on Claude Code; portable toward
Codex/OpenCode via `AGENTS.md`.

## Docs

Full documentation in [`docs/`](docs/README.md) — guides and reference. Korean: [한국어 문서](docs/README.ko.md).

## Contributing & license

See [CONTRIBUTING.md](CONTRIBUTING.md) and the [Code of Conduct](CODE_OF_CONDUCT.md). Licensed under
the [MIT License](LICENSE).

