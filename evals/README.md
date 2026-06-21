# Evals

Two layers of verification (see the plan's Verification section).

## L0 — static checks (no LLM)
```bash
./scripts/check.sh
```
Validates: `CLAUDE.md` ≤120 lines · every story file has `type` frontmatter (OKF) · `state.json`
schema (numbers 0–100, `turn` int) · `.claude` component frontmatter · no broken markdown links.

## L1 — scenario (drives `claude` headless)
```bash
./evals/run.sh dance-prince        # or any scenario in evals/scenarios/
EVAL_DRY=1 ./evals/run.sh ...       # validate setup without invoking claude
```
Copies the story to `.eval-run/<name>/`, plays one fixed turn via
`claude -p --output-format stream-json`, then asserts on **structure, not prose**:

- a tracked number moved (`state_increase`)
- `turn` advanced and `log.md` was appended
- the right files were `Read` just-in-time (`read_files`)
- **persist-before-narrate**: a Write/Edit to `state.json`/`log.md` happened *before* the final
  narration text in the event stream

Add a scenario by dropping a JSON fixture in `evals/scenarios/` (see `dance-prince.json`).

> Note: `run.sh` defaults to `--permission-mode acceptEdits`. Run it yourself in your terminal so
> you authorize the nested agent; it is not run automatically from inside another Claude session.
