---
name: lint
description: Continuity check of the current story — find contradictions, dead characters still acting, orphan plot threads, state-vs-narrative mismatches, and broken links. Use when the player types /lint or asks to check continuity / find plot holes.
disable-model-invocation: true
---

# Continuity lint

Run a continuity pass over the story in the current directory. This is the Karpathy "lint" step:
catch the bookkeeping problems a long story accumulates.

1. **Delegate to the `lore-keeper` sub-agent** (via the Task tool) so the deep read happens in an
   isolated context and only the verdict returns. Ask it for the **Continuity issues** + **Suggested
   fixes** sections for the whole story.
2. If sub-agents aren't available, do it inline: read `log.md`, `states/state.json`, `SCENE.md`, and
   the referenced character/world/event files, then check for:
   - contradictions (a fact stated two ways),
   - dead/removed characters still acting, or acting against what they know,
   - state-vs-narrative mismatch (`state.json` vs the prose/log),
   - orphan threads (a setup never paid off),
   - broken links / referenced-but-missing files.
3. **Report** a short numbered list: each issue with its file/turn and a one-line fix. If clean, say so.
4. **Persist nothing** unless the player asks you to apply a fix. This is a read-only check.
