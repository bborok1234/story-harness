# Story Harness — local web play surface

A **local** browser UI that drives **your own** Claude Code and shows **only the narration + a live
state HUD** — the tool diffs stay hidden. Engine = your own `claude`/subscription. No hosting.
(Stack & rationale: [ADR-0002](../docs/decisions/0002-web-stack.md).)

## Run

```bash
cd web
npm install

# 1) Try it without Claude (fake narration):
npm run dev:web            # frontend on http://127.0.0.1:5173
MOCK=1 npm run dev:bridge  # bridge on 127.0.0.1:8787 (mock)

# 2) Real play — point the bridge at a story folder, BYO your own subscription:
unset ANTHROPIC_API_KEY    # stay on your subscription (else it bills the API)
npm run dev                # runs both; bridge defaults to ../examples/imperial-ball
# or a specific story:
STORY=../stories/wuxia-idol npm run dev
```

Open http://127.0.0.1:5173, press **▶ 시작**, then type actions. State persists in the story's files
(the agent reads/writes them); the HUD reflects `states/state.json`.

Built mode (one process serving everything): `npm start -- ../stories/wuxia-idol`.

## How it works

```
browser (React) ──POST /api/play──▶ Hono bridge ──spawn──▶ claude -p --output-format stream-json
        ▲  SSE: narration / state / done                    (your story folder, your subscription)
        └────────────────────────────────────────  bridge keeps only assistant text; drops
                                                     tool_use / tool_result / thinking
```

- `server/bridge.ts` — spawns `claude`, parses stream-json, re-emits SSE. Localhost-only, Origin/Host
  allowlist. Env-sanitized (`ANTHROPIC_API_KEY` deleted from the child so it stays on your subscription).
- `src/` — React app. `components/Narration.tsx` (the story), `components/Hud.tsx` (state). 

## Add a panel (contributors)

Drop a component in `src/components/`, render it in `App.tsx`. It reads from the same `/api/state`
(or, later, AG-UI `STATE_DELTA` events). The bridge's SSE event shape (`narration`/`state`/`done`) is
the stable extension point — see ADR-0002 for the AG-UI roadmap.

## Status

P3.0/P3.1 (per [ROADMAP](../ROADMAP.md)). PLAY mode only — author/workspace + generative UI are P4.

> ⚠ A local server that spawns `claude` can run shell. It binds `127.0.0.1` and checks Origin/Host.
> Don't expose it to the network. See [SECURITY.md](../SECURITY.md).
