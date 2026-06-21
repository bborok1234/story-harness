# Architecture

**English** | [한국어](architecture.ko.md)

## The idea

Most character-chat platforms put the entire world — lore, characters, memory, rules — into one giant
prompt. It doesn't scale: lore grows, memory bloats, everything competes for the context window.

Claude Code showed a different way: **don't load everything; read what you need, when you need it.**
Story Harness applies that to roleplay. *Prompt engineering → environment engineering.*

## Not a new engine — a layer

Story Harness is **not** a new agent loop or LLM backend. Claude Code already provides the loop (read
files, edit files, sub-agents, sessions). We add a thin **distribution layer** on top — like
`gstack` / `lazycodex` are opinionated Claude Code distributions, not separate engines.

## Four layers

```
Environment  →  story/ files (the world, on disk)
Brain        →  CLAUDE.md = a short constitution (file format + rules + pointers)
Persona      →  output-style storyteller = the GM voice (strips the coder prompt)
Controls     →  skills (play loop + commands), sub-agents, hooks
```

## Why no lorebook engine

SillyTavern / AI Dungeon spend their architecture on a keyword-trigger system: scan the chat, match
keywords, inject matching lore under a token budget. Story Harness deletes that subsystem — the agent's
**Read tool + good file layout + naming is the retrieval.** `SCENE.md` names `prince`, so the agent
reads `characters/prince.md`. Just-in-time, no budget juggling.

## Design influences

- **Context / environment engineering** — Anthropic; file-system-as-memory, just-in-time retrieval.
- **OKF + Karpathy's LLM-wiki** — the file/memory format (frontmatter, links, `index.md`, `log.md`).
- **Ink (interactive fiction)** — state as enums with legal transitions, to bound drift.
- **MemGPT / Generative Agents** — tiered memory; recency + importance + relevance for what resurfaces.

## Portability

`CLAUDE.md` is mirrored as `AGENTS.md` (symlink), which Codex and OpenCode read natively — so the same
story files and conventions carry to other engines later.
