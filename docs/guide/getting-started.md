# Getting started

**English** | [한국어](getting-started.ko.md)

## Prerequisites

- [Claude Code](https://code.claude.com) installed and authenticated (`claude --version`).
- `python3` (only for the static checks).

## Play the demo

```bash
git clone https://github.com/bborok1234/story-harness
cd story-harness/examples/imperial-ball
claude
```

In the session, set the game-master voice once — open `/config`, choose **Output style**, pick
**storyteller**. (The old `/output-style` command was removed in Claude Code v2.1.91.)

Then act **in character** — describe what your character does, in plain prose:

```
황태자 Aurelio에게 다가가 첫 춤을 청한다 — 진심 어린 미소로 손을 내민다.
```
(or in English: "I cross the floor and ask Prince Aurelio for the first dance.")

The Storyteller will:
1. read the relevant files (`SCENE.md`, `characters/prince.md`),
2. apply the outcome to `states/state.json` and `log.md` **before** narrating,
3. narrate the scene back to you.

## Commands

- `/recap` — a "previously on…" catch-up of where things stand.
- `/save` — snapshot the story to `saves/<timestamp>/` (restore by copying back).

## What just happened

Nothing was stuffed into a giant prompt. The agent navigated files on demand — the same way Claude
Code reads a codebase. Your relationships and the world live in plain files you can open and edit.

Next: [manage your stories](managing-stories.md) (where they live, how to create/switch) and
[write your own story](writing-a-story.md).
