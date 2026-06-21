# Plans

Trackable planning docs for this project. One file per plan.

## Convention

- **Filename:** `YYYY-MM-DD-<slug>.md` (ISO date prefix → sorts chronologically).
- **Header:** YAML frontmatter — `id, title, status, created, updated, owner, tags, related, supersedes, superseded-by`.
- **Status lifecycle:** `draft → approved → in-progress → done` (plus `on-hold`, `abandoned`).
- **Tracking:** a `## Progress` status table + per-phase checklists with a **Definition of Done**.
  - Legend: ⬜ not started · 🔄 in-progress · ✅ done · ⛔ blocked · ⏭ skipped
  - Check a box only with **evidence** (commit SHA / PR / file). Bump `updated:` every session.
- **Immutability:** don't rewrite a finished plan; write a new one and set `supersedes` / `superseded-by`.

## Index

| Plan | Status | Title |
|------|--------|-------|
| [PLAN-0001](2026-06-21-story-harness.md) | in-progress | Story Harness — Claude Code distribution for roleplay |
