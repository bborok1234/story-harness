// Story Harness — local bridge (multi-story: library + create + play).
// Spawns the user's OWN `claude` headless in a story folder, streams stream-json,
// re-emits ONLY narration (token-streamed) + state over SSE, persists a transcript,
// supports regenerate, lists stories, and creates new ones from a form. Localhost only.
//
// Usage: tsx server/bridge.ts [--serve-static] [--mock]   (root = repo via web/..)
import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { streamSSE } from "hono/streaming";
import type { SSEStreamingApi } from "hono/streaming";
import { spawn } from "node:child_process";
import readline from "node:readline";
import { readFile, writeFile, mkdir, appendFile, readdir, cp, access } from "node:fs/promises";
import path from "node:path";

const args = process.argv.slice(2);
const flags = new Set(args.filter((a) => a.startsWith("--")));
const MOCK = flags.has("--mock") || process.env.MOCK === "1";
const SERVE_STATIC = flags.has("--serve-static");
const PORT = Number(process.env.PORT ?? 8787);
const ROOT = path.resolve(process.cwd(), process.env.SH_ROOT ?? "..");        // repo root
const DEFAULT_STORY = process.env.STORY
  ? path.relative(ROOT, path.resolve(process.cwd(), process.env.STORY))
  : "examples/imperial-ball";
const TEMPLATE = path.join(ROOT, "templates", "story");

const ALLOW_HOSTS = new Set(["127.0.0.1", "localhost"]);
const ALLOW_ORIGINS = new Set([
  "http://127.0.0.1:5173", "http://localhost:5173",
  `http://127.0.0.1:${PORT}`, `http://localhost:${PORT}`,
]);

type Beat = { role: "player" | "gm"; text: string };
type Snapshot = { input: string; sid?: string; stateText: string; logText: string; tlen: number };

const app = new Hono();
app.use("/api/*", async (c, next) => {
  const host = (c.req.header("host") ?? "").split(":")[0];
  if (!ALLOW_HOSTS.has(host)) return c.text("forbidden host", 403);
  const origin = c.req.header("origin");
  if (origin && !ALLOW_ORIGINS.has(origin)) return c.text("forbidden origin", 403);
  return next();
});

const slug = (s: string) => s.toLowerCase().trim().replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-+|-+$/g, "").slice(0, 48) || "story";
async function exists(p: string) { try { await access(p); return true; } catch { return false; } }
async function readText(p: string) { try { return await readFile(p, "utf8"); } catch { return ""; } }
async function readJSON(p: string) { try { return JSON.parse(await readFile(p, "utf8")); } catch { return {}; } }

// Resolve a story id (relative path under ROOT) to an absolute dir; reject traversal.
function storyDir(id: string): string {
  const abs = path.resolve(ROOT, id || DEFAULT_STORY);
  if (abs !== ROOT && !abs.startsWith(ROOT + path.sep)) throw new Error("bad story path");
  return abs;
}
const P = (dir: string) => ({
  state: path.join(dir, "states", "state.json"),
  log: path.join(dir, "log.md"),
  scene: path.join(dir, "SCENE.md"),
  session: path.join(dir, ".session"),
  transcript: path.join(dir, ".session", "transcript.jsonl"),
  id: path.join(dir, ".session", "id"),
});

function flatten(s: any): Record<string, number> {
  const out: Record<string, number> = {};
  const take = (o: any, pre: string) => { for (const [k, v] of Object.entries(o ?? {})) if (typeof v === "number") out[`${pre}${k}`] = v; };
  take(s.world, "world."); take(s.player, "player.");
  for (const [who, vals] of Object.entries(s.relationships ?? {})) take(vals, `${who}.`);
  return out;
}
function diff(a0: any, b0: any) { const a = flatten(a0), b = flatten(b0), d: Record<string, number> = {}; for (const k of Object.keys(b)) if (typeof a[k] === "number" && b[k] !== a[k]) d[k] = b[k] - a[k]; return d; }

async function sceneMeta(dir: string) {
  const scene = await readText(path.join(dir, "SCENE.md"));
  const mode = (scene.match(/^mode:\s*(\w+)/m)?.[1] ?? "story").toLowerCase();
  const link = scene.match(/Active characters[\s\S]*?\]\((characters\/[^)]+\.md)\)/)?.[1];
  let character: { name: string; avatar?: string } | null = null;
  if (link) {
    const fm0 = await readText(path.join(dir, link));
    const fm = fm0.startsWith("---") ? (fm0.split("---", 3)[1] ?? "") : "";
    const name = fm.match(/^name:\s*(.+)$/m)?.[1]?.trim();
    if (name) character = { name, avatar: fm.match(/^avatar:\s*(.+)$/m)?.[1]?.trim() };
  }
  return { mode, character };
}

async function listStories() {
  const out: any[] = [];
  for (const base of ["examples", "stories"]) {
    const baseDir = path.join(ROOT, base);
    let entries: string[] = [];
    try { entries = await readdir(baseDir); } catch { continue; }
    for (const e of entries) {
      const dir = path.join(baseDir, e);
      if (!(await exists(path.join(dir, "SCENE.md")))) continue;
      const meta = await sceneMeta(dir);
      const st = await readJSON(path.join(dir, "states", "state.json"));
      out.push({ id: `${base}/${e}`, name: e, demo: base === "examples", turn: st.turn ?? 0, ...meta });
    }
  }
  return out;
}

async function loadTranscript(dir: string) {
  const p = P(dir); let beats: Beat[] = []; let sessionId: string | undefined;
  try { beats = (await readFile(p.transcript, "utf8")).split("\n").filter(Boolean).map((l) => JSON.parse(l)); } catch { /* */ }
  try { sessionId = (await readFile(p.id, "utf8")).trim() || undefined; } catch { /* */ }
  return { beats, sessionId };
}
async function persistTurn(dir: string, player: string, gm: string, sessionId?: string) {
  const p = P(dir); await mkdir(p.session, { recursive: true });
  const line = (b: Beat) => JSON.stringify(b) + "\n";
  await appendFile(p.transcript, line({ role: "player", text: player }) + line({ role: "gm", text: gm }));
  if (sessionId) await writeFile(p.id, sessionId);
}

const undos = new Map<string, Snapshot>();
async function snapshot(dir: string, input: string, sid?: string): Promise<Snapshot> {
  const p = P(dir);
  const tlen = (await readText(p.transcript)).split("\n").filter(Boolean).length;
  return { input, sid, stateText: await readText(p.state), logText: await readText(p.log), tlen };
}
async function restore(dir: string, s: Snapshot) {
  const p = P(dir);
  if (s.stateText) await writeFile(p.state, s.stateText);
  if (s.logText) await writeFile(p.log, s.logText);
  await mkdir(p.session, { recursive: true });
  const keep = (await readText(p.transcript)).split("\n").filter(Boolean).slice(0, s.tlen);
  await writeFile(p.transcript, keep.length ? keep.join("\n") + "\n" : "");
  if (s.sid) await writeFile(p.id, s.sid);
}

async function runTurn(dir: string, stream: SSEStreamingApi, input: string, sessionId?: string) {
  await stream.writeSSE({ event: "status", data: "composing" });
  const before = await readJSON(P(dir).state);
  let sid = sessionId, gm = "", sawDelta = false;
  for await (const ev of MOCK ? mockTurn(input) : runClaude(dir, input, sessionId)) {
    if (ev.type === "system" && ev.subtype === "init" && ev.session_id) sid = ev.session_id;
    else if (ev.type === "stream_event") {
      const d = ev.event;
      if (d?.type === "content_block_delta" && d.delta?.type === "text_delta" && d.delta.text) {
        sawDelta = true; gm += d.delta.text;
        await stream.writeSSE({ event: "narration", data: JSON.stringify(d.delta.text) });
      }
    } else if (ev.type === "assistant" && !sawDelta) {
      for (const block of ev.message?.content ?? []) if (block?.type === "text" && block.text) {
        gm += block.text; await stream.writeSSE({ event: "narration", data: JSON.stringify(block.text) });
      }
    } else if (ev.type === "result") { if (ev.session_id) sid = ev.session_id; break; }
  }
  const after = await readJSON(P(dir).state);
  const d = diff(before, after);
  if (Object.keys(d).length) await stream.writeSSE({ event: "delta", data: JSON.stringify(d) });
  await stream.writeSSE({ event: "state", data: JSON.stringify(after) });
  await persistTurn(dir, input, gm, sid);
  await stream.writeSSE({ event: "done", data: JSON.stringify({ sessionId: sid }) });
}

function dirOf(c: any): string { return storyDir((c.req.query("story") as string) || DEFAULT_STORY); }

app.get("/api/stories", async (c) => c.json(await listStories()));
app.get("/api/info", async (c) => { const dir = dirOf(c); return c.json({ story: path.basename(dir), id: path.relative(ROOT, dir), mock: MOCK, ...(await sceneMeta(dir)) }); });
app.get("/api/state", async (c) => c.json(await readJSON(P(dirOf(c)).state)));
app.get("/api/transcript", async (c) => c.json(await loadTranscript(dirOf(c))));

app.post("/api/play", async (c) => {
  const dir = dirOf(c);
  const body = await c.req.json().catch(() => ({}));
  const input = (body.input ?? "").toString();
  if (!input.trim()) return c.text("empty input", 400);
  undos.set(dir, await snapshot(dir, input, body.sessionId));
  return streamSSE(c, (s) => runTurn(dir, s, input, body.sessionId).catch((e) => s.writeSSE({ event: "error", data: String(e) })));
});
app.post("/api/regenerate", async (c) => {
  const dir = dirOf(c); const u = undos.get(dir);
  if (!u) return c.text("nothing to regenerate", 400);
  await restore(dir, u);
  return streamSSE(c, (s) => runTurn(dir, s, u.input, u.sid).catch((e) => s.writeSSE({ event: "error", data: String(e) })));
});

// Create a new story from a form payload -> writes OKF files under stories/<slug>/.
app.post("/api/create", async (c) => {
  const b = await c.req.json().catch(() => ({}));
  const sl = slug(b.slug || b.title || b.character?.name || "story");
  const dir = path.join(ROOT, "stories", sl);
  if (await exists(dir)) return c.json({ error: "already exists", id: `stories/${sl}` }, 409);
  await cp(TEMPLATE, dir, { recursive: true });

  const mode = b.mode === "chat" ? "chat" : "story";
  const ch = b.character ?? {};
  const cslug = slug(ch.name || "character");
  const pname = b.persona?.name || "you";
  const w = (rel: string, txt: string) => writeFile(path.join(dir, rel), txt);

  await w("index.md", `---\ntype: Scene\ntitle: ${b.title || sl}\n---\n# ${b.title || sl}\n\n${b.premise || ""}\n\n## Map\n- [Current scene](SCENE.md)\n- [You (persona)](persona.md)\n- [Characters](characters/index.md)\n- [World](world/index.md)\n- [History log](log.md)\n- [Memory](memory/index.md)\n`);
  await w("SCENE.md", `---\ntype: Scene\nmode: ${mode}\nlocation: ${b.opening?.location || "—"}\nmood: ${b.opening?.mood || "—"}\n---\n# Current Scene\n\n**Location:** ${b.opening?.location || "—"}\n**Mood:** ${b.opening?.mood || "—"}\n\n**You:** [${pname}](persona.md)\n\n## Active characters\n- [${ch.name || "Character"}](characters/${cslug}.md)\n\n## Current goal\n${b.opening?.goal || "—"}\n`);
  await w("persona.md", `---\ntype: Character\nname: ${pname}\nrole: player\nstatus: {}\n---\n# ${pname} (you)\n\n${b.persona?.about || "The character you play. The agent never speaks or acts for you."}\n`);
  await w(`characters/${cslug}.md`, `---\ntype: Character\nname: ${ch.name || "Character"}\n${ch.avatar ? `avatar: ${ch.avatar}\n` : ""}role: ${ch.role || "—"}\nstatus: { trust_user: 10, affection_user: 10 }\nbands: { trust_user: [hostile, wary, neutral, warm, loyal], affection_user: [cold, cordial, fond, devoted] }\n---\n# ${ch.name || "Character"}\n\n${ch.personality || ""}\n\n**Goals:** ${ch.goal || "—"}${ch.secret ? `\n**Secret:** ${ch.secret}` : ""}\n\n## Voice\n${ch.voice || "—"}\n\n## Greeting\n${ch.greeting || "—"}\n\n## Example dialogue\n${ch.example || "- User: …\n- " + (ch.name || "Character") + ": \"…\""}\n`);
  await w("characters/index.md", `---\ntype: Character\ntitle: Characters\n---\n# Characters\n\n## Roster\n- [${ch.name || "Character"}](${cslug}.md) — ${ch.role || ""}\n`);
  await w("states/state.json", JSON.stringify({ turn: 0, relationships: { [cslug]: { trust: 10, affection: 10 } } }, null, 2) + "\n");
  await w("log.md", `---\ntype: Event\ntitle: History log\n---\n# History log\n\nAppend-only. One line per beat: \`- [turn N] (imp:1–10) <who/what>: <what happened>\`.\n\n- [turn 0] world: ${b.premise || "the story begins"}.\n`);
  await w(".claude/settings.json", JSON.stringify({
    outputStyle: mode === "chat" ? "companion" : "storyteller",
    hooks: {
      SessionStart: [{ hooks: [{ type: "command", command: "test -f SCENE.md && echo 'You are resuming an interactive story. Read SCENE.md, states/state.json, persona.md, and the tail of log.md, then stay in character.'" }] }],
      Stop: [{ hooks: [{ type: "command", command: "mkdir -p saves/_autosave && cp states/state.json log.md saves/_autosave/ 2>/dev/null; true" }] }],
    },
  }, null, 2) + "\n");
  return c.json({ id: `stories/${sl}`, name: sl });
});

async function* runClaude(dir: string, input: string, sessionId?: string): AsyncGenerator<any> {
  const cmd = ["-p", input, "--output-format", "stream-json", "--verbose", "--include-partial-messages", "--permission-mode", "acceptEdits"];
  if (sessionId) cmd.push("--resume", sessionId);
  const env = { ...process.env }; delete env.ANTHROPIC_API_KEY; delete env.ANTHROPIC_AUTH_TOKEN;
  const child = spawn("claude", cmd, { cwd: dir, env });
  child.on("error", (e) => { throw e; });
  const rl = readline.createInterface({ input: child.stdout! });
  for await (const line of rl) { const s = line.trim(); if (!s) continue; try { yield JSON.parse(s); } catch { /* */ } }
}
async function* mockTurn(input: string): AsyncGenerator<any> {
  const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
  const delta = (text: string) => ({ type: "stream_event", event: { type: "content_block_delta", delta: { type: "text_delta", text } } });
  yield { type: "system", subtype: "init", session_id: "mock-session" };
  await delay(120);
  const text = `*행주질하던 손을 멈추지 않는다.* "왔어, ${input.slice(0, 12)}…?" "남은 거 한 잔은 있어. 앉든가." (MOCK)`;
  for (const tok of text.split(/(\s+)/)) { yield delta(tok); await delay(18); }
  yield { type: "result", subtype: "success", session_id: "mock-session" };
}

if (SERVE_STATIC) { app.use("/*", serveStatic({ root: "./dist" })); app.get("*", serveStatic({ path: "./dist/index.html" })); }
serve({ fetch: app.fetch, port: PORT, hostname: "127.0.0.1" }, (info) => {
  console.log(`Story Harness bridge → http://127.0.0.1:${info.port}  (root: ${ROOT})`);
  if (!SERVE_STATIC) console.log("dev frontend: `npm run dev`");
});
