# Roadmap

High-level phases. The detailed, trackable plan (with per-phase Definition of Done and progress) lives
in [`docs/plan/2026-06-21-story-harness.md`](docs/plan/2026-06-21-story-harness.md).

| Phase | Status | What |
|---|---|---|
| **P1 — MVP distribution** | ✅ done | Constitution + `storyteller` output-style & skill, OKF templates, `imperial-ball` demo, `/recap` `/save`, static checks + one scenario eval. |
| **P2 — Guardrails + authoring** | ✅ done | Per-story hooks (`SessionStart` orient / `Stop` autosave), `/new-story` `/new-character` `/stories` `/lint`, `lore-keeper` sub-agent, `stories/` workspace model. User-verified live. |
| **P3 — Local web play surface** | ✅ done | Local web GUI in `web/` (Hono bridge spawns the user's own Claude Code; Vite/React/TS + SSE) rendering **only narration + a live state HUD**, hiding tool diffs. Per [ADR-0002](docs/decisions/0002-web-stack.md). **Live real-claude verified** end-to-end (multi-turn resume, both modes); `scripts/play-web.sh`. Dynamic UI (P4) not required for the connection. |
| **P4 — Author workspace + dynamic UI** | 🅿️ parked (far future) | Inspectable/editable state panels + agent-mutation approval; generative-UI composition (AG-UI + A2UI-shaped manifest + component registry). |
| **P5 — Interop & ecosystem** | 🅿️ parked (far future) | SillyTavern V2/V3 card import → OKF; world-graph viz; plugin packaging. |

**Current focus: deepen P1–P3** (not new phases). Active tracks — **A: memory & continuity** (chapter
compaction, importance, retrieval, state bands) and **B: play experience** (token streaming, reload
restore, state deltas). See the plan's "Deepening" section.

Direction rationale and trade-offs: see [ADR-0001](docs/decisions/0001-surface-engine-and-direction.md).
The moat is **files-as-truth + agentic read/write/approve**, not the UI. Engine stays **local, on the
user's own subscription/key** (no hosting). Ideas and feedback welcome — open an issue.
