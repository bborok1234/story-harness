---
id: ADR-0001
title: Surface, engine, and product direction for Story Harness
status: accepted
date: 2026-06-21
deciders: [bborok1234]
related: [../plan/2026-06-21-story-harness.md, ../../ROADMAP.md]
---

# ADR-0001 — Surface, engine, and product direction

## Context

A web-runtime vision was proposed: a domain-specific AI workspace (Agent Session ↔ Story State ↔ UI
Composer ↔ Web) with dynamic UI composition and live agent-as-character visualization. We evaluated it
adversarially against research (generative UI, agent-visualization, the companion/RP market, and
Anthropic's current subscription policy) and clarified the actual intent.

Key facts that shaped the decision:

- **Audience is non-technical** — people who enjoy character chat and build worlds, who are *not* CLI
  users. The intended web surface is a **locally-run GUI for accessibility**, never a hosted SaaS.
- **Our local architecture is in-ToS (verified, June 2026).** A local tool driving the user's *own*
  `claude` on the user's *own* Pro/Max subscription is allowed; headless `claude -p` on subscription
  OAuth is supported with no per-token billing; the June 15 plan to move Agent SDK / `claude -p` to a
  separate credit pool was **paused** (still draws from subscription limits). What's banned is using
  consumer OAuth to serve *other* users (the OpenClaw pattern) — not us. (See operational notes.)
- **Generative UI = "compose, not generate" is the 2026 consensus** (CopilotKit taxonomy; Google A2UI,
  OpenAI Open-JSON-UI standardize the manifest+registry pattern). Sound — but the cost is the component
  vocabulary, schema versioning, manifest validation, and eval, not the renderer.
- **Agent-as-character visualization is mostly "observability theater"** (Pixel Agents is a dev toy
  that tails JSONL). For an end-user storytelling product it *breaks* immersion — the opposite of what
  the player wants.
- **Market read:** the category's #1 unsolved problem is memory/persistence/consistency; trust breaks
  when operators swap to cheaper/filtered models (Character.AI, Replika "lobotomy", Janitor, Chai).
  App-layer companions (Replika, Talkie/MiniMax) have **no model moat** and weak pricing power in a
  flooded market (300+ apps). Incumbents structurally **cannot** offer inspectable/editable state.
  Files-as-truth (validated this quarter by Karpathy's LLM-wiki and Anthropic's file-based memory) is
  unbuilt in storytelling. That is our white space.

## Decision

1. **Moat = files-as-truth, not UI.** The differentiator is an agent that reads world files on demand
   and **mutates them with user approval**, git-versioned and inspectable. UI is the lens that makes
   this legible; it is not the product. Do not try to out-UI the generative-UI infra companies.

2. **Engine/auth = Fork A, local, BYO-own-subscription.** Story Harness stays a **local** tool that
   drives the user's own Claude Code on their own subscription (or their own API key). No hosting, no
   pooling, no per-user inference cost to us. Monetize software/UX if ever — never tokens we don't pay.

3. **Surface = local web, not TUI.** The post-P2 play surface pivots from the originally-planned
   CLI/TUI wrapper to a **minimal local web GUI** (localhost server drives `claude` headless; the
   browser renders). Rationale: a TUI is still a terminal and does not serve the non-technical
   audience; web is also the correct substrate for the eventual workspace. Keep v1 thin (a single
   page + a small state HUD), not a framework sprawl — still a thin layer, web instead of terminal.

4. **Two modes.** **PLAY** = immersive; machinery hidden; render only narration + diegetic state
   beats (fixes the "tool diffs break immersion" complaint by filtering the stream-json event log).
   **AUTHOR/WORKSPACE** = inspectable/editable state (character cards, relationships, timeline, lore)
   + approval of agent mutations.

5. **Generative UI (manifest + component registry) is deferred.** Introduce it only **after** the
   hand-built panels stabilize. When we do: reuse **AG-UI** for transport and an **A2UI-shaped flat
   manifest**, build the storytelling component vocabulary ourselves, and gate every manifest behind
   schema validation + an eval set (the agent picking the wrong component is a known failure mode). Not
   v1.

6. **Agent visualization is demoted.** Keep only (a) one ambient liveness indicator
   ("the storyteller is composing…"), (b) the *work* surfaced as editable state artifacts (not the
   workers), and (c) an opt-in "inspect / behind the scenes" panel for power users. **Cut** animated
   actors / office / spatial-workspace as a default end-user feature — it fights immersion.

## Consequences

- **Positive:** leans into the one defensible edge; near-zero inference cost and low regulatory
  exposure; fixes the immersion complaint at the surface layer; avoids competing with funded UI-infra
  and mass-market companion players on their turf; keeps the "thin layer" philosophy.
- **Negative / cost:** a local web GUI is more work than a TUI and risks scope creep toward "a
  platform" — mitigated by keeping v1 deliberately thin. Deferring generative UI means some hand-built
  panels now, refactored later.
- **Supersedes** the P3 "CLI wrapper + plugin packaging" framing in PLAN-0001 / the original roadmap.

## Operational notes

- **API-key precedence footgun:** if `ANTHROPIC_API_KEY` is set, headless `claude -p` silently uses it
  → per-token API billing (a Max user reported ~$1,800 in two days). To stay on subscription, `unset
  ANTHROPIC_API_KEY` and confirm via `/status`. Avoid `--bare` (it ignores the OAuth token).
- **Volatile:** the June 15 credit-pool split is *paused, not cancelled* — Anthropic could revive it,
  after which heavy headless/SDK use might draw a separate credit. Re-verify before betting on
  subscription-draw for heavy workloads.

## Verification confidence

High: local-own-subscription is in-ToS; `setup-token`/`CLAUDE_CODE_OAUTH_TOKEN` headless supported;
the June 15 pause; the API-key footgun. Medium: in-ToS status of a *local GUI wrapper* specifically
(allowed by principle + community consensus, no explicit Anthropic statement). Some market figures
(MAU/revenue) and the exact harness-ban enforcement remain soft — see the plan appendix and peer
research dumps. Re-verify the volatile items before they gate a decision.
