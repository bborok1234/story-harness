# Writing a story

**English** | [한국어](writing-a-story.ko.md)

A story is a folder of files. Copy the scaffold and edit it:

```bash
cp -R templates/story my-story && cd my-story
```

## The pieces

| File / folder | Role |
|---|---|
| `index.md` | The story's front page — premise + links to everything. |
| `SCENE.md` | The **current** scene: location, mood, active characters, current goal, available events. |
| `characters/` | One file per character (`type: Character`). Personality, goals, what they know. |
| `world/` | Places, factions, lore (`type: Location` / `Faction`). |
| `relationships/` | Optional: a file per significant bond. |
| `events/` | Things that can fire in a scene (`type: Event`) — trigger, effects, outcome. |
| `log.md` | Append-only history; one line per beat. |
| `states/state.json` | Live numbers (relationships, world), `0–100`, plus a `turn` counter. |

## Minimum to be playable

You only need three things for a scene to run:

1. **`SCENE.md`** that names its active characters and goal.
2. **`characters/<name>.md`** for each named character.
3. **`log.md`** (can start with just the opening beat).

Everything else (world, events, relationships) deepens the story but isn't required. Add files as the
story grows — the agent reads them when they're referenced.

## Tips

- **Link, don't repeat.** Reference a character/place with a Markdown link; the link is the graph.
- **Let `state.json` drive stakes.** Gate an event on a number (e.g. the demo's proposal fires at
  `prince.trust ≥ 60`).
- **Write characters with wants and secrets**, not just descriptions — they make better scene partners.
- Run `./scripts/check.sh` (from the repo root) to validate format.

See the full format in [reference/file-format](../reference/file-format.md).
