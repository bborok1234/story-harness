#!/usr/bin/env bash
# L1 scenario eval — drives `claude` headless against a copy of a story, then asserts on the
# resulting files and the stream-json event log. Asserts STRUCTURE (tool calls, file deltas),
# never prose. Usage: ./evals/run.sh <scenario>   (default: dance-prince)
# Env: EVAL_DRY=1 validates the fixture/runner without invoking claude.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

NAME="${1:-dance-prince}"
FIX="evals/scenarios/$NAME.json"
[ -f "$FIX" ] || { echo "no scenario: $FIX" >&2; exit 2; }

STORY=$(python3 -c "import json;print(json.load(open('$FIX'))['story'])")
INPUT=$(python3 -c "import json;print(json.load(open('$FIX'))['input'])")
RUNDIR=".eval-run/$NAME"
STREAM="evals/last-run.jsonl"

rm -rf "$RUNDIR"; mkdir -p "$RUNDIR"
cp -R "$STORY/." "$RUNDIR/"
cp "$RUNDIR/states/state.json" "evals/.before.json"
BEFORE_LOG=$(wc -l < "$RUNDIR/log.md")

if [ "${EVAL_DRY:-0}" = "1" ]; then
  echo "DRY: fixture ok, story copied to $RUNDIR (claude not invoked)"; exit 0
fi
command -v claude >/dev/null 2>&1 || { echo "eval: 'claude' not on PATH — run live later" >&2; exit 3; }

echo "running scenario '$NAME' …"
# Note: if ANTHROPIC_API_KEY is set, `claude -p` silently uses it (per-token API billing) instead of
# your subscription. Run `unset ANTHROPIC_API_KEY` first to stay on your subscription (see ADR-0001).
# acceptEdits auto-approves file edits but keeps other gates (no full bypass).
# Set EVAL_BYPASS=1 to use bypassPermissions instead (only if you trust the scenario).
PERM="acceptEdits"; [ "${EVAL_BYPASS:-0}" = "1" ] && PERM="bypassPermissions"
( cd "$RUNDIR" && claude -p "$INPUT" \
    --output-format stream-json --verbose \
    --permission-mode "$PERM" \
    --allowedTools "Read Edit Write MultiEdit Glob Grep" ) > "$ROOT/$STREAM" 2>/dev/null || true

ROOT="$ROOT" RUNDIR="$RUNDIR" FIX="$FIX" STREAM="$STREAM" BEFORE_LOG="$BEFORE_LOG" python3 - <<'PY'
import os, json, re, sys

root=os.environ["ROOT"]; rundir=os.environ["RUNDIR"]
fix=json.load(open(os.environ["FIX"])); A=fix["assert"]
before=json.load(open("evals/.before.json"))
after=json.load(open(os.path.join(rundir,"states","state.json")))
before_log=int(os.environ["BEFORE_LOG"]); after_log=sum(1 for _ in open(os.path.join(rundir,"log.md")))

def dig(d,path):
    for k in path.split("."): d=d[k]
    return d

# parse stream-json
reads=[]; edits=[]; texts=[]; i=0
for line in open(os.environ["STREAM"], errors="ignore"):
    line=line.strip()
    if not line: continue
    try: ev=json.loads(line)
    except: continue
    msg=ev.get("message",{})
    for blk in (msg.get("content") or []):
        if not isinstance(blk,dict): continue
        if blk.get("type")=="tool_use":
            name=blk.get("name",""); inp=blk.get("input",{}) or {}
            tgt=str(inp.get("file_path") or inp.get("path") or "")
            if name=="Read": reads.append((i,tgt))
            if name in ("Write","Edit","MultiEdit","NotebookEdit"): edits.append((i,tgt))
        if blk.get("type")=="text" and blk.get("text","").strip():
            texts.append((i,blk["text"]))
    i+=1

results=[]
def check(name, ok, detail=""):
    results.append((ok,name,detail))

for path in A.get("state_increase",[]):
    try: ok = dig(after,path) > dig(before,path); d=f"{dig(before,path)} -> {dig(after,path)}"
    except Exception as e: ok=False; d=f"missing ({e})"
    check(f"state_increase {path}", ok, d)

if A.get("turn_advanced"):
    check("turn_advanced", after.get("turn",0) > before.get("turn",0), f"{before.get('turn')} -> {after.get('turn')}")

if A.get("log_appended"):
    check("log_appended", after_log > before_log, f"{before_log} -> {after_log} lines")

for f in A.get("read_files",[]):
    check(f"read {f}", any(f in t for _,t in reads), f"reads={[t for _,t in reads]}")

if A.get("persist_before_narrate"):
    state_edits=[i for i,t in edits if "state.json" in t or "log.md" in t]
    last_text=max((i for i,_ in texts), default=-1)
    ok = bool(state_edits) and min(state_edits) < last_text
    check("persist_before_narrate", ok, f"edit@{min(state_edits) if state_edits else None} < narrate@{last_text}")

fails=[r for r in results if not r[0]]
for ok,name,d in results:
    print(("  PASS " if ok else "  FAIL ")+name+(f"  [{d}]" if d else ""))
print(("L1 %s: PASS" % fix["name"]) if not fails else ("L1 %s: FAIL (%d)" % (fix["name"], len(fails))))
sys.exit(1 if fails else 0)
PY
