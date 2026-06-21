# File format (OKF)

**English** | [한국어](file-format.ko.md)

Story files follow the **Open Knowledge Format** convention: Markdown + YAML frontmatter, links as
edges, an `index.md` per folder, an append-only `log.md`. It's human-editable, git-diffable, and needs
no database.

## Frontmatter

Every story file starts with YAML frontmatter. The one required field is **`type`**:

```markdown
---
type: Character
name: Prince Aurelio
role: Crown Prince
status: { trust_user: 20, affection_user: 10 }
---
# Prince Aurelio
Crown prince. Reserved, political, proud. Rival of [Duke Aldric](aldric.md).
```

Valid `type` values: `Character`, `Location`, `Relationship`, `Event`, `Faction`, `Scene`.

## Relationships are links

Reference another file with a Markdown link — `[Duke Aldric](aldric.md)`. The set of links **is** the
world graph; no separate graph store is needed. Edge vocabulary (used in `relationships/`):
`knows · likes · loves · rivals · fears · serves · betrayed`.

## Reserved files

- **`index.md`** (per folder) — what's inside, for navigation / progressive disclosure.
- **`log.md`** (per story) — append-only, chronological: `- [turn N] <who/what>: <what happened>`.

## `states/state.json`

Live numeric state. Numbers are clamped `0–100`; `turn` is a non-negative integer.

```json
{
  "turn": 0,
  "world": { "reputation": 50 },
  "relationships": {
    "prince": { "trust": 20, "affection": 10 }
  }
}
```

Narrative facts (a revealed secret, a status) live in the relevant Markdown file; only *numbers* live
in `state.json`. Use named bands with one-step legal transitions to bound drift
(e.g. `wary → neutral → warm → loyal`).

## Validation

`./scripts/check.sh` enforces: frontmatter + valid `type`, `state.json` schema (numbers in `0–100`,
integer `turn`), and no broken relative Markdown links.

Background on OKF: [Open Knowledge Format](https://cloud.google.com/blog/products/data-analytics/how-the-open-knowledge-format-can-improve-data-sharing)
and Karpathy's [LLM-wiki pattern](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f).
