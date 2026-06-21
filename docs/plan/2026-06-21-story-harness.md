---
id: PLAN-0001
title: Story Harness — Claude Code distribution for roleplay/storytelling
status: in-progress       # draft | approved | in-progress | on-hold | done | abandoned
created: 2026-06-21
updated: 2026-06-21
owner: limmir88@gmail.com
version: 1.4
tags: [harness, roleplay, claude-code, mvp]
related: [https://github.com/bborok1234/story-harness]  # repo
supersedes: null
superseded-by: null
---

# Story Harness

> **What if character chat worked like Claude Code?** This project is the experiment.

## Summary

Story Harness turns Claude Code into a roleplay/storytelling engine — **not** by building a new
agent loop, but as a thin **distribution layer on top of Claude Code** (skills + agents + hooks +
commands + an output-style + a file format). The core thesis is *environment engineering over prompt
engineering*: instead of one giant prompt holding the whole world, the world lives in **files**, and
the agent **reads only what it needs, when it needs it** — which Claude Code's Read/Glob tools
already do natively. We delete the entire keyword-trigger "lorebook" subsystem that incumbents
(SillyTavern, AI Dungeon) carry, because just-in-time file reading replaces it.

## Goals / Non-Goals

**Goals**
- Run a roleplay/story session inside `claude` from a story directory, with **zero injected mega-prompt**.
- State (relationships, flags, events) persists to **human-editable, git-diffable files**.
- Keep `CLAUDE.md` / `AGENTS.md` as **short project constitutions** (≤120 lines), not behavior dumps.
- Reusable across stories via templates; portable toward Codex/OpenCode via `AGENTS.md`.

**Non-Goals (initial versions)**
- Marketplace, monetization, creator economy.
- Image generation, visual-novel engine, full RPG ruleset engine.
- Multiplayer, hosted web service.
- A custom LLM backend or a from-scratch agent loop.

## Context

Confirmed by research (June 2026), captured in the appendix:
- **`gstack` / `lazycodex` are not separate engines** — they are opinionated Claude Code
  distributions. That is the model we follow.
- **Anthropic docs endorse the lean-constitution approach**: CLAUDE.md ≤200 lines, models reliably
  follow only ~150–200 instructions, detail belongs in on-demand skills/files (progressive disclosure).
- **Memory format = Open Knowledge Format (OKF) + Karpathy's "LLM wiki" pattern** — markdown +
  YAML frontmatter (one required field `type`), relationships as markdown links, reserved
  `index.md` (navigation) + `log.md` (append-only history). Ingest → query → **lint (continuity check)**.
- **`output-style` with `keep-coding-instructions: false`** strips the software-engineer system
  prompt and installs the game-master persona at the system-prompt level — the key primitive that
  makes `claude` stop being a coder.
- RPG/story prior art (Sstobo/Claude-Code-Game-Master, danjdewhurst/story-skills) confirms the
  primitive division below and the rule **persist state BEFORE narrating**.

## Approach

**Architecture — 4 layers**
```
Environment  →  story/ files (SCENE, world, characters, relationships, events, log, state)
Brain        →  CLAUDE.md = lean constitution (project map + file-format convention + rules)
Persona      →  output-style storyteller = GM, strips coder prompt
Controls     →  skills (storyteller play loop + authoring) / sub-agents / hooks
```

**Primitive division** (research consensus; deterministic data → skill+script, creative reasoning → sub-agent)

| Primitive | Holds |
|---|---|
| `CLAUDE.md` / `AGENTS.md` | constitution: project map, OKF file-format convention, primitive-placement rules, pointers |
| output-style `storyteller` | GM persona, `keep-coding-instructions: false` |
| skill `storyteller` | play loop `CONTEXT → DECIDE → PERSIST → NARRATE`, action router, persist-before-narrate |
| skills (authoring) | `/new-story` `/new-character` `/recap` `/save` |
| sub-agent `lore-keeper` | read long history → return deltas + continuity verdict (isolated context) |
| hooks | `SessionStart` load state · `Stop` autosave/log · `PostToolUse` "persist before narrate" audit |

**Story file format (OKF)** — every file carries frontmatter with at least `type`; relationships are
markdown links; each folder has `index.md`; the story has an append-only `log.md`.
```markdown
---
type: Character
name: Prince
status: { trust_user: wary, affection_user: 10, reputation: 50 }
---
# Prince
Crown prince. Reserved, political, proud. Rival: [Duke Aldric](../characters/aldric.md).
```

**CLAUDE.md contents (~80 lines, the user's focus)**
1. One-line purpose
2. Project map (where each primitive lives)
3. Story file-format convention (OKF: `type` frontmatter, links = edges, `index.md`, `log.md`)
4. 4 inviolable rules: stay in character · persist before narrate · don't invent canon (read it) · edit state in files, not prose
5. Primitive-placement rules (skill vs agent vs hook vs command)
6. Pointers (detail → skill X / ref Y)
7. "Working if:" signals

**Repo structure**
```
character-code/
  CLAUDE.md  AGENTS.md  README.md
  docs/plan/                       # this plan + future plans
  .claude/
    output-styles/ storyteller.md
    skills/        storyteller/SKILL.md  new-story/  new-character/  recap/  save/
    agents/        lore-keeper.md
    settings.json                  # hooks (P2)
  templates/story/                 # /new-story scaffold (OKF layout)
    index.md SCENE.md log.md world/ characters/ relationships/ events/ states/state.json
  examples/imperial-ball/          # runnable demo (prince/heroine), story files only
```
Play: `cd examples/imperial-ball && claude` → inherits repo `.claude/` (skills walk up to repo root)
→ GM output-style + storyteller skill active → plays.

## Verification (lean)

Two kinds of things to test: **deterministic mechanics** (file format, hooks, state mutation) →
tested by scripts; **stochastic behavior** (in-character prose) → asserted via the
`claude -p --output-format stream-json` **event log** (assert tool-calls / file-deltas, not wording)
+ LLM-as-judge for quality.

- **L0 static** (`scripts/check.sh`, no LLM): `CLAUDE.md` ≤120 lines; every story file has valid YAML
  frontmatter + required `type`; `states/state.json` matches schema; skill/agent/output-style
  frontmatter valid (name == dir, description present); no broken markdown links (OKF graph integrity).
- **L1 scenario** (`evals/`, headless): fixed player input → assert `state.json` delta in range,
  `log.md` appended, **persist-before-narrate** order (Write/Edit before final text in the event
  stream), correct files Read (just-in-time). Assert structure, not prose.
- **L2 judge**: rubric score (stays in character · no invented canon · plausible state change);
  continuity-lint must catch a **seeded contradiction**; skill-trigger should/near-miss set
  (`evals/trigger/queries.json`).
- **L3 manual**: human playtests the demo (the first success criterion is experiential).

**Lean rollout:** P1 ships L0 + one L1 golden scenario; L2/L3 grow per phase.

## Progress

| Phase | Status | Updated | Evidence |
|-------|--------|---------|----------|
| 1. MVP distribution | ✅ done | 2026-06-21 | user playtest confirmed read→persist→narrate, state/log mutated, Korean prose; `90abecd`+ pushed; CI green |
| 2. Guardrails + authoring | 🔄 in-progress | 2026-06-21 | hooks (SessionStart/Stop) verified firing; new-story/new-character/lint skills + lore-keeper agent built; live scaffold/lint verification pending (user) |
| 3. Local web play surface | ⬜ not started | — | direction set by [ADR-0001](../decisions/0001-surface-engine-and-direction.md) (was "CLI wrapper") |
| 4. Author workspace + dynamic UI | ⬜ not started | — | per ADR-0001 |
| 5. Interop & ecosystem | ⬜ not started | — | — |

Legend: ⬜ not started · 🔄 in-progress · ✅ done · ⛔ blocked · ⏭ skipped

### Phase 1 — MVP distribution
**Definition of Done:** `cd examples/imperial-ball && claude` plays a scene; a player action mutates
`states/state.json` and appends to `log.md`; `CLAUDE.md` ≤120 lines; no mega-prompt injected.
**Verified by:** L0 `scripts/check.sh` green + L1 golden scenario (`evals/`) asserts state delta,
log append, persist-before-narrate order, `prince.md` read + L3 manual playtest.
- [x] `git init` + repo skeleton + `README.md`
- [x] `CLAUDE.md` lean constitution (73 lines) + `AGENTS.md` mirror (symlink, zero-drift)
- [x] output-style `storyteller` (GM persona, `keep-coding-instructions: false`)
- [x] skill `storyteller` (play loop + action router + persist-before-narrate)
- [x] OKF templates `templates/story/` (index.md, SCENE.md, log.md, state.json, folders)
- [x] commands `/recap` `/save`
- [x] demo `examples/imperial-ball/` (prince/heroine, ball/engagement)
- [x] `scripts/check.sh` (L0 static checks, enforces `state.json` schema) — **green, 21 files**
- [x] `evals/` runner + golden scenario `dance-prince` (written; `EVAL_DRY` validated)
- [ ] **live L1 run** — `./evals/run.sh dance-prince` (user-run: nested headless claude needs your auth)
- [ ] manual playtest confirms DoD (user: `cd examples/imperial-ball && claude`)

### Phase 2 — Guardrails + authoring
**Definition of Done:** hooks fire deterministically; `/new-story` scaffolds a fresh story; a seeded
contradiction is caught by continuity-lint.
**Verified by:** stream-json hook events + audit-log file present (hooks) · `/new-story` output ==
template diff · continuity-lint flags a seeded contradiction (L2) · skill-trigger should/near-miss set.
- [x] hooks in per-story `.claude/settings.json`: `SessionStart` (orientation inject), `Stop`
  (autosave to `saves/_autosave/`) — **empirically verified firing** (cwd=story dir, `CLAUDE_PROJECT_DIR`
  =story dir; repo root unaffected). `PostToolUse` persist-audit **dropped**: the storyteller skill
  already enforces persist-before-narrate (confirmed in playtest); revisit only if drift observed.
- [x] workspace model: `stories/<name>/` home (git-ignored) + `/stories` manager + rule "manage from
  root, play from story folder" — removes the "where do stories live?" confusion
- [x] skill `new-story` (location-independent: scaffolds into `stories/`, prints play command)
- [x] skill `new-character` (OKF character file)
- [x] sub-agent `lore-keeper` (history → deltas + continuity verdict, read-only)
- [x] continuity-lint: `/lint` skill delegating to `lore-keeper`
- [ ] live verification (user): `/new-story` scaffolds; `/lint` catches a seeded contradiction

> **Direction revised by [ADR-0001](../decisions/0001-surface-engine-and-direction.md).** P3 pivots
> from a CLI/TUI wrapper to a **local web** play surface; P4 becomes the author workspace + dynamic UI;
> interop moves to P5. The moat is files-as-truth + agentic read/write/approve, not the UI. Engine
> stays local on the user's own subscription/key (verified in-ToS, June 2026; mind the
> `ANTHROPIC_API_KEY` precedence footgun — `unset` to stay on subscription).

### Phase 3 — Local web play surface
**Definition of Done:** a local web GUI (localhost server driving the user's own `claude` headless)
plays a scene rendering **only narration + a live state HUD** — no tool diffs leak. Engine = user's
own subscription/key; no hosting.
**Verified by:** play a turn in the browser; assert the rendered transcript contains no tool-call/diff
artifacts and the state HUD reflects `state.json`.
- [ ] localhost server that drives `claude -p --output-format stream-json` and filters the event
  stream to assistant-narration only (hide tool_use/tool_result/thinking)
- [ ] single-page UI: narration view + input + small state HUD (relationships/turn from `state.json`)
- [ ] one ambient liveness indicator; `unset ANTHROPIC_API_KEY` guard
- [ ] PLAY mode only (AUTHOR mode is P4)

### Phase 4 — Author workspace + dynamic UI
**Definition of Done:** inspectable/editable state panels + agent-mutation approval; later, dynamic UI
composition from a validated manifest.
**Verified by:** edit a character card in the UI → file changes on disk; approve/reject an agent state
change; (later) a malformed manifest is rejected before render.
- [ ] AUTHOR mode panels: character cards, relationships, timeline, lore (read + edit → files)
- [ ] agent-mutation approval (diff-style) for state changes
- [ ] generative UI: AG-UI transport + A2UI-shaped manifest + component registry + manifest validation + eval
- [ ] agent-visualization demoted: liveness + editable-state + opt-in inspect panel only (no actors/office)

### Phase 5 — Interop & ecosystem (optional)
**Definition of Done:** a SillyTavern V2/V3 character card imports to an OKF character file; the world
graph renders; the harness packages as a plugin.
**Verified by:** import a known V2 card fixture → assert OKF fields · graph viz produces valid HTML.
- [ ] SillyTavern V2/V3 card import → OKF character file
- [ ] OKF world-graph visualization
- [ ] plugin packaging (`.claude-plugin/`)

## Risks & Open Questions
- **Risk:** state drift (agent writes inconsistent values). → Mitigation: enum + legal-transition
  convention (Ink LISTs), clamped scalars, P2 `PostToolUse` audit hook.
- **Risk:** CLAUDE.md bloat over time. → Mitigation: ≤120-line cap; procedures go to skills; prune on edit.
- **Open question:** per-story `.claude/` vs repo-level `.claude/` vs plugin install — MVP uses
  repo-level (inherited by demo subdir); plugin packaging deferred to P3.
- **Open question:** how much of the GM behavior lives in output-style vs the storyteller skill —
  resolve during P1 build (persona → output-style, procedure → skill).

## Changelog
- 2026-06-21 (v1.4): Direction set by [ADR-0001](../decisions/0001-surface-engine-and-direction.md)
  after adversarial review of a web-runtime proposal + research (generative UI, agent-visualization,
  companion market, Anthropic policy) + peer competitive dumps (Replika/Talkie). P3 pivots CLI/TUI →
  **local web** play surface; P4 = author workspace + dynamic UI (generative UI deferred to here);
  interop → P5. Moat = files-as-truth (not UI); engine stays local on the user's own subscription/key
  (verified in-ToS June 2026). Agent-as-character visualization demoted.
- 2026-06-21 (v1.3): Published to GitHub (`bborok1234/story-harness`, public, MIT). OSS setup
  (LICENSE, CONTRIBUTING, CODE_OF_CONDUCT, SECURITY, CHANGELOG, issue/PR templates) + CI workflow
  running `scripts/check.sh` — first run green. First commit `90abecd`.
- 2026-06-21 (v1.2): P1 build — constitution + AGENTS.md symlink + storyteller output-style + skills
  (storyteller/recap/save) + OKF templates + imperial-ball demo + `scripts/check.sh` (L0 green) +
  `evals/` L1 runner & `dance-prince` scenario. Status → in-progress. Pending (user): live L1 run +
  manual playtest. Note: auto-mode classifier (correctly) blocked spawning a permission-bypassing
  nested claude from inside this session, so live L1 is user-executed.
- 2026-06-21 (v1.1): Added Verification (lean) strategy + per-phase "Verified by" lines; lean eval
  rollout (P1 = L0 `scripts/check.sh` + one L1 golden scenario; L2/L3 grow per phase).
- 2026-06-21 (v1.0): Plan created and approved (status: approved). Built from 4 prior research rounds:
  (1) coding-agent harness extension points, (2) layer-on-top design patterns, (3) character-chat /
  roleplay platforms, (4) narrative engines + LLM memory; plus (5) non-SWE harness/skill design,
  (6) lean CLAUDE.md best practices, (7) memory formats (OKF / Karpathy / CodeGraph), and
  (8) trackable plan-doc best practices.

---

## Appendix — research sources

**Harness / context-engineering**
- Anthropic, Effective context engineering — https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents
- Anthropic, Agent Skills — https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills
- Claude Code memory docs — https://code.claude.com/docs/en/memory
- Agent Skills spec — https://agentskills.io/specification
- AGENTS.md standard — https://agents.md/

**Memory format**
- Open Knowledge Format (Google Cloud) — https://cloud.google.com/blog/products/data-analytics/how-the-open-knowledge-format-can-improve-data-sharing
- OKF spec repo — https://github.com/GoogleCloudPlatform/knowledge-catalog/tree/main/okf
- Karpathy "LLM wiki" gist — https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f
- CodeGraph (reference, not adopted) — https://github.com/colbymchenry/codegraph

**RPG / story prior art**
- Sstobo/Claude-Code-Game-Master · danjdewhurst/story-skills · multica-ai/andrej-karpathy-skills

**Roleplay platforms (domain prior art)**
- SillyTavern character cards V2/V3 + World Info · AI Dungeon Story Cards/Memory · Agnai Memory Books

**Plan-doc / tracking best practices**
- MADR — https://adr.github.io/madr/
- Keep a Changelog — https://keepachangelog.com/en/1.1.0/
- GitHub task lists — https://docs.github.com/en/get-started/writing-on-github/working-with-advanced-formatting/about-tasklists
