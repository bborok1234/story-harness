---
id: ADR-0002
title: Web stack for the play surface (P3) and beyond
status: accepted
date: 2026-06-21
deciders: [bborok1234]
related: [0001-surface-engine-and-direction.md, ../../ROADMAP.md]
---

# ADR-0002 — Web stack

## Context

[ADR-0001](0001-surface-engine-and-direction.md) set the surface as a **local web** GUI driving the
user's own Claude Code, with a contributor ecosystem and an eventual hosted/generative-UI future. The
stack must serve: (1) a low-friction local play surface NOW, (2) a large contributor pool extending
panels/visualizations, (3) a clean swap to a managed-agent hosted product LATER, (4) the P4
generative-UI roadmap (AG-UI + manifest + component registry), (5) a robust local `claude` bridge.

Research (2026) is decisive: the generative-UI ecosystem (AG-UI, CopilotKit, assistant-ui, Vercel AI
SDK) and the contributor pool are **React/TypeScript-first**; the Agent SDK exists in TS with parity to
the CLI; `claude-code-webui` already ships this exact pattern (Hono + Vite + React, spawn CLI →
NDJSON → SSE). The only thing minimal-deps (Python/static) wins is day-one boot friction — a one-time,
buyable-down cost — while the other four criteria are recurring and compounding.

## Decision

**Build a TypeScript monorepo.**

- **Frontend:** Vite + React + TypeScript; Tailwind + shadcn/ui; component-per-panel (narration feed,
  state HUD, future relationship-graph/timeline/map panels) so contributors add a folder.
- **Local bridge (NOW):** Node + **Hono**. Spawn the user's own `claude` headless, parse the
  stream-json NDJSON, re-emit to the browser as **SSE** using **AG-UI-shaped events from day 0**
  (`TEXT_MESSAGE_CONTENT` = narration; drop `tool_use`/`tool_result`/thinking; `STATE_SNAPSHOT`/
  `STATE_DELTA` for the HUD from watching `states/state.json`).
- **Transport:** SSE (AG-UI default; proxy/CDN-friendly for hosting). WebSocket only if we later need
  mid-turn bidirectional control.
- **Do NOT** start in Python/static and migrate — the migration tax lands exactly where the weights are
  heaviest (contributors + hosted + generative UI). **Do NOT** over-build with Next.js now — ceremony
  for a localhost child-process tool. Hono + Vite + React is the **minimal expression of the target
  stack**; `(b) → (c)` Next.js is an additive deployment change for hosting, not a rewrite.

### Engine bridge (exact)
- Spawn: `claude -p "<input>" --output-format stream-json --verbose --permission-mode acceptEdits
  [--resume <session_id>]`, cwd = the story folder.
- **Not `--bare`** (it ignores `CLAUDE_CODE_OAUTH_TOKEN` → would force an API key).
- **Env-sanitize the child:** set `CLAUDE_CODE_OAUTH_TOKEN`; **delete `ANTHROPIC_API_KEY` and
  `ANTHROPIC_AUTH_TOKEN`** (precedence footgun — they silently override OAuth and bill the API).
- Read **raw stdout line-by-line** (don't naively pipe; stream-json can buffer when piped, #25670).
- Capture `session_id` from the `system`/`subtype:init` event; `--resume` per turn. Later keep context
  warm with `--input-format stream-json` (NDJSON user messages to stdin).
- Render keyed on the stable `system.init → assistant/tool → result` event shape, so the LATER swap to
  the Agent SDK `query()` async iterator is a transport change, not a rewrite.

### Security (load-bearing — a local server driving `claude` is an RCE primitive)
- Bind **`127.0.0.1` only** (never `0.0.0.0`).
- Validate the **`Origin` header** (your UI origin only) and a **`Host` allowlist** (reject non-local
  Host → kills DNS rebinding, CVE-2026-11624). Real 2026 attacks: DNS rebinding on local MCP servers,
  AutoJack (host RCE via a local agent's WebSocket).
- Require a **per-launch random token** in the SSE/POST handshake; CORS to the exact origin; CSRF on
  state-changing POSTs.
- Scope the engine: `acceptEdits` only within the story dir; never default to `bypassPermissions`.

### Hosted path (LATER)
- Swap `child_process.spawn` → Claude **Agent SDK `query()`** (same event shape; `canUseTool`
  callback, `interrupt()`, warm start). Hono → Next.js/Vercel; **frontend unchanged**.
- **ToS constraints:** hosted third-party products **may not** use claude.ai/subscription login — must
  bill via `ANTHROPIC_API_KEY` (or Bedrock/Vertex). Branding: "Powered by Claude", not "Claude Code".
  Production path is **Managed Agents**. So: local = user's subscription; hosted = your/customer key.

## Consequences

- **Positive:** one stack across NOW/contributors/hosted/generative-UI; zero frontend rewrite; rides
  the React generative-UI ecosystem; a proven reference (`claude-code-webui`).
- **Negative:** adds a Node/npm toolchain to a so-far zero-dependency repo. Mitigate end-user friction
  with a one-command launcher (`npx story-harness`); contributors already have Node.
- The Python `scripts/check.sh` (L0) stays as-is — engine/story tooling stays language-neutral; only
  the web surface is TS.
- Supersedes the earlier "Python stdlib local server" suggestion.

## Phasing (NOW → LATER)

P3.0 Hono bridge skeleton (spawn → SSE, narration-only, session resume, localhost+token) ·
P3.1 React app (narration feed + state HUD) + `npx` launch ·
P4.0 lock panel contract + AG-UI event schema (extension API) ·
P4.1 spec-compliant AG-UI + CopilotKit client ·
P4.2 generative UI (A2UI manifest + component registry) ·
P5 hosted (Agent SDK + Next.js, API-key billing).

## Sources

claude-code-webui (sugyan) · AG-UI protocol · CopilotKit · Vercel AI SDK · Claude Code headless &
Agent SDK docs · Anthropic auth precedence; DNS-rebinding CVE-2026-11624; Microsoft AutoJack writeup.
