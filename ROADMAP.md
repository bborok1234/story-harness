# Roadmap

High-level phases. The detailed, trackable plan (with per-phase Definition of Done and progress) lives
in [`docs/plan/2026-06-21-story-harness.md`](docs/plan/2026-06-21-story-harness.md).

| Phase | Status | What |
|---|---|---|
| **P1 — MVP distribution** | ✅ done | Constitution + `storyteller` output-style & skill, OKF templates, `imperial-ball` demo, `/recap` `/save`, static checks + one scenario eval. |
| **P2 — Guardrails + authoring** | ✅ done | Per-story hooks (`SessionStart` orient / `Stop` autosave), `/new-story` `/new-character` `/stories` `/lint`, `lore-keeper` sub-agent, `stories/` workspace model. User-verified live. |
| **P3 — Local web play surface** | ⬜ planned | A minimal **local** web GUI (localhost server drives the user's own Claude Code headless) rendering **only narration + a live state HUD**, hiding tool diffs. Fixes immersion; serves non-technical users. PLAY mode first. |
| **P4 — Author workspace + dynamic UI** | ⬜ planned | Inspectable/editable state panels (character cards, relationships, timeline, lore) + agent-mutation approval; then generative-UI composition (AG-UI transport + A2UI-shaped manifest + validated component registry). |
| **P5 — Interop & ecosystem** | ⬜ planned | Import SillyTavern V2/V3 character cards → OKF; world-graph viz; plugin packaging. |

Direction rationale and trade-offs: see [ADR-0001](docs/decisions/0001-surface-engine-and-direction.md).
The moat is **files-as-truth + agentic read/write/approve**, not the UI. Engine stays **local, on the
user's own subscription/key** (no hosting). Ideas and feedback welcome — open an issue.
