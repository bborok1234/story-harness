#!/usr/bin/env bash
# L0 static checks — no LLM. Validates the constitution, story file format (OKF),
# state.json schema, .claude component frontmatter, and markdown link integrity.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

command -v python3 >/dev/null 2>&1 || { echo "check: python3 required" >&2; exit 2; }

ROOT="$ROOT" python3 - <<'PY'
import os, sys, json, re, glob

root = os.environ["ROOT"]
os.chdir(root)
errors = []

VALID_TYPES = {"Character", "Location", "Relationship", "Event", "Faction", "Scene"}

def read(p):
    with open(p, encoding="utf-8") as f:
        return f.read()

def frontmatter(path):
    t = read(path)
    if not t.startswith("---"):
        return None
    parts = t.split("---", 2)
    return parts[1] if len(parts) >= 3 else None

# 1. constitution length
n = len(read("CLAUDE.md").splitlines())
if n > 120:
    errors.append(f"CLAUDE.md is {n} lines (>120) — move detail into skills/files")

story_md = glob.glob("examples/**/*.md", recursive=True) + glob.glob("templates/**/*.md", recursive=True)

# 2. every story file has type frontmatter
for p in story_md:
    fm = frontmatter(p)
    if fm is None:
        errors.append(f"{p}: missing YAML frontmatter"); continue
    m = re.search(r"^type:\s*(\S+)", fm, re.M)
    if not m:
        errors.append(f"{p}: frontmatter missing 'type'")
    elif m.group(1) not in VALID_TYPES:
        errors.append(f"{p}: type '{m.group(1)}' not in {sorted(VALID_TYPES)}")

# 3. state.json valid + numbers in 0..100, turn int>=0
for p in glob.glob("**/states/state.json", recursive=True):
    try:
        data = json.loads(read(p))
    except Exception as e:
        errors.append(f"{p}: invalid JSON ({e})"); continue
    if not isinstance(data.get("turn"), int) or data["turn"] < 0:
        errors.append(f"{p}: 'turn' must be int >= 0")
    def check_nums(d, where):
        for k, v in d.items():
            if not isinstance(v, (int, float)) or not (0 <= v <= 100):
                errors.append(f"{p}: {where}.{k}={v} out of 0..100")
    check_nums(data.get("world", {}), "world")
    for who, vals in data.get("relationships", {}).items():
        if not isinstance(vals, dict):
            errors.append(f"{p}: relationship '{who}' must be an object"); continue
        check_nums(vals, who)

# 4. .claude component frontmatter
for p in glob.glob(".claude/skills/*/SKILL.md"):
    fm = frontmatter(p) or ""
    name = re.search(r"^name:\s*(\S+)", fm, re.M)
    d = os.path.basename(os.path.dirname(p))
    if not name:
        errors.append(f"{p}: missing 'name'")
    elif name.group(1) != d:
        errors.append(f"{p}: name '{name.group(1)}' != dir '{d}'")
    if not re.search(r"^description:\s*\S", fm, re.M):
        errors.append(f"{p}: missing 'description'")
for p in glob.glob(".claude/output-styles/*.md") + glob.glob(".claude/agents/*.md"):
    fm = frontmatter(p) or ""
    if not re.search(r"^name:\s*\S", fm, re.M):
        errors.append(f"{p}: missing 'name'")
    if not re.search(r"^description:\s*\S", fm, re.M):
        errors.append(f"{p}: missing 'description'")

# 5. broken relative markdown links (story files + docs + root *.md); ignore code fences + placeholders
link_re = re.compile(r"\[[^\]]+\]\(([^)]+)\)")
link_md = sorted(set(story_md + glob.glob("*.md") + glob.glob("docs/**/*.md", recursive=True)))
for p in link_md:
    base = os.path.dirname(p)
    body = re.sub(r"```.*?```", "", read(p), flags=re.S)   # strip fenced code
    body = re.sub(r"`[^`\n]*`", "", body)                  # strip inline code (illustrative links)
    for m in link_re.finditer(body):
        t = m.group(1).strip().split("#")[0]
        if not t or t.startswith(("http", "<")) or "<" in t or ">" in t:
            continue
        if not os.path.exists(os.path.join(base, t)):
            errors.append(f"{p}: broken link -> {t}")

if errors:
    print("FAIL — %d issue(s):" % len(errors))
    for e in errors:
        print("  -", e)
    sys.exit(1)
print("OK — static checks passed (%d story files)" % len(story_md))
PY
