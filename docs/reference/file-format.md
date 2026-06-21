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

Valid `type` values: `Character`, `Location`, `Relationship`, `Event`, `Faction`, `Scene`, `Memory`.

**Bands.** A character's `status` numbers map to named bands declared in frontmatter, so the agent moves
them one legal step at a time (bounds drift):
```yaml
status: { trust_user: 20, affection_user: 10 }
bands: { trust_user: [hostile, wary, neutral, warm, loyal], affection_user: [cold, cordial, fond, devoted] }
```

## Relationships are links

Reference another file with a Markdown link — `[Duke Aldric](aldric.md)`. The set of links **is** the
world graph; no separate graph store is needed. Edge vocabulary (used in `relationships/`):
`knows · likes · loves · rivals · fears · serves · betrayed`.

## Modes, persona & greetings (scene-making + chat)

- **Mode.** `SCENE.md` frontmatter sets `mode: story` (GM narration, 2nd person — pairs with the
  `storyteller` output-style) or `mode: chat` (1:1 character chat, the character replies 1st person —
  pairs with `companion`, like Character.AI / 제타 / 크랙). The story's `.claude/settings.json` selects
  the matching `outputStyle`.
- **Persona.** `persona.md` (`type: Character`, `role: player`) is the **player's own** character. The
  agent reads it to know who it's addressing and never speaks or acts for the player. `SCENE.md` links
  it as `**You:** [name](persona.md)`.
- **Greeting + example dialogue.** A character file may carry a `## Greeting` (its opening line / first
  message, used when it enters a scene) and `## Example dialogue` (1–3 exchanges anchoring its voice) —
  the SillyTavern `first_mes` / `mes_example` equivalents.

## Reserved files

- **`index.md`** (per folder) — what's inside, for navigation / progressive disclosure.
- **`log.md`** (per story) — append-only event log: `- [turn N] (imp:1–10) <who/what>: <what happened>`.
  Each beat is tagged **importance 1–10** so pivotal beats resurface and trivia fades.
- **`memory/index.md` + `memory/chapters/NN.md`** (`type: Memory`) — compacted older arcs.

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
in `state.json` (the **hot** memory tier — always loaded).

## Memory tiers

Long stories stay coherent by tiering memory instead of reloading everything:

- **hot** — `states/state.json` (small, always read).
- **recent** — `log.md` (read the tail).
- **compacted** — `memory/chapters/NN.md`, indexed by `memory/index.md` taglines. The agent reads the
  taglines always and opens one chapter only when relevant. The `compact` skill rolls old `log.md`
  beats into chapters (synopsis + durable facts + verbatim importance≥8 beats), keeping the hot/recent
  tiers small. (Pattern: Karpathy LLM-wiki compaction + MemGPT tiers + Generative-Agents importance.)

## Validation

`./scripts/check.sh` enforces: frontmatter + valid `type`, `state.json` schema (numbers in `0–100`,
integer `turn`), and no broken relative Markdown links.

Background on OKF: [Open Knowledge Format](https://cloud.google.com/blog/products/data-analytics/how-the-open-knowledge-format-can-improve-data-sharing)
and Karpathy's [LLM-wiki pattern](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f).
