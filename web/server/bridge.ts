// Story Harness — local bridge.
// Spawns the user's OWN `claude` headless in a story folder, streams stream-json,
// re-emits ONLY narration (token-streamed) + state over SSE, persists a transcript,
// and supports regenerate (re-roll the last turn). Localhost only.
//
// Usage: tsx server/bridge.ts [storyDir] [--serve-static] [--mock]
import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { streamSSE } from "hono/streaming";
import type { SSEStreamingApi } from "hono/streaming";
import { spawn } from "node:child_process";
import readline from "node:readline";
import { readFile, writeFile, mkdir, appendFile } from "node:fs/promises";
import path from "node:path";

const args = process.argv.slice(2);
const flags = new Set(args.filter((a) => a.startsWith("--")));
const positional = args.filter((a) => !a.startsWith("--"));
const MOCK = flags.has("--mock") || process.env.MOCK === "1";
const SERVE_STATIC = flags.has("--serve-static");
const PORT = Number(process.env.PORT ?? 8787);
const STORY = path.resolve(process.cwd(), positional[0] ?? process.env.STORY ?? "../examples/imperial-ball");
const SESSION_DIR = path.join(STORY, ".session");

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

const STATE_PATH = path.join(STORY, "states", "state.json");
const LOG_PATH = path.join(STORY, "log.md");
const TRANSCRIPT_PATH = path.join(SESSION_DIR, "transcript.jsonl");

async function readText(p: string): Promise<string> { try { return await readFile(p, "utf8"); } catch { return ""; } }
async function readJSON(p: string): Promise<any> { try { return JSON.parse(await readFile(p, "utf8")); } catch { return {}; } }
const readState = () => readJSON(STATE_PATH);

function flatten(s: any): Record<string, number> {
  const out: Record<string, number> = {};
  const take = (o: any, pre: string) => { for (const [k, v] of Object.entries(o ?? {})) if (typeof v === "number") out[`${pre}${k}`] = v; };
  take(s.world, "world."); take(s.player, "player.");
  for (const [who, vals] of Object.entries(s.relationships ?? {})) take(vals, `${who}.`);
  return out;
}
function diff(before: any, after: any): Record<string, number> {
  const a = flatten(before), b = flatten(after), d: Record<string, number> = {};
  for (const k of Object.keys(b)) if (typeof a[k] === "number" && b[k] !== a[k]) d[k] = b[k] - a[k];
  return d;
}

// Scene mode + first active character (name/avatar) for chat-mode UI.
async function sceneMeta(): Promise<{ mode: string; character: { name: string; avatar?: string } | null }> {
  const scene = await readText(path.join(STORY, "SCENE.md"));
  const mode = (scene.match(/^mode:\s*(\w+)/m)?.[1] ?? "story").toLowerCase();
  const link = scene.match(/Active characters[\s\S]*?\]\((characters\/[^)]+\.md)\)/)?.[1];
  let character: { name: string; avatar?: string } | null = null;
  if (link) {
    const cf = await readText(path.join(STORY, link));
    const fm = cf.startsWith("---") ? (cf.split("---", 3)[1] ?? "") : "";
    const name = fm.match(/^name:\s*(.+)$/m)?.[1]?.trim();
    const avatar = fm.match(/^avatar:\s*(.+)$/m)?.[1]?.trim();
    if (name) character = { name, avatar };
  }
  return { mode, character };
}

async function loadTranscript(): Promise<{ beats: Beat[]; sessionId?: string }> {
  let beats: Beat[] = [];
  let sessionId: string | undefined;
  try { beats = (await readFile(TRANSCRIPT_PATH, "utf8")).split("\n").filter(Boolean).map((l) => JSON.parse(l)); } catch { /* none */ }
  try { sessionId = (await readFile(path.join(SESSION_DIR, "id"), "utf8")).trim() || undefined; } catch { /* none */ }
  return { beats, sessionId };
}
async function persistTurn(player: string, gm: string, sessionId?: string) {
  await mkdir(SESSION_DIR, { recursive: true });
  const line = (b: Beat) => JSON.stringify(b) + "\n";
  await appendFile(TRANSCRIPT_PATH, line({ role: "player", text: player }) + line({ role: "gm", text: gm }));
  if (sessionId) await writeFile(path.join(SESSION_DIR, "id"), sessionId);
}

let undo: Snapshot | null = null;
async function snapshot(input: string, sid?: string): Promise<Snapshot> {
  const tlen = (await readText(TRANSCRIPT_PATH)).split("\n").filter(Boolean).length;
  return { input, sid, stateText: await readText(STATE_PATH), logText: await readText(LOG_PATH), tlen };
}
async function restore(s: Snapshot) {
  if (s.stateText) await writeFile(STATE_PATH, s.stateText);
  if (s.logText) await writeFile(LOG_PATH, s.logText);
  await mkdir(SESSION_DIR, { recursive: true });
  const keep = (await readText(TRANSCRIPT_PATH)).split("\n").filter(Boolean).slice(0, s.tlen);
  await writeFile(TRANSCRIPT_PATH, keep.length ? keep.join("\n") + "\n" : "");
  if (s.sid) await writeFile(path.join(SESSION_DIR, "id"), s.sid);
}

async function runTurn(stream: SSEStreamingApi, input: string, sessionId?: string) {
  await stream.writeSSE({ event: "status", data: "composing" });
  const before = await readState();
  let sid = sessionId, gm = "", sawDelta = false;
  for await (const ev of MOCK ? mockTurn(input) : runClaude(input, sessionId)) {
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
  const after = await readState();
  const d = diff(before, after);
  if (Object.keys(d).length) await stream.writeSSE({ event: "delta", data: JSON.stringify(d) });
  await stream.writeSSE({ event: "state", data: JSON.stringify(after) });
  await persistTurn(input, gm, sid);
  await stream.writeSSE({ event: "done", data: JSON.stringify({ sessionId: sid }) });
}

app.get("/api/info", async (c) => c.json({ story: path.basename(STORY), storyDir: STORY, mock: MOCK, ...(await sceneMeta()) }));
app.get("/api/state", async (c) => c.json(await readState()));
app.get("/api/transcript", async (c) => c.json(await loadTranscript()));

app.post("/api/play", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const input = (body.input ?? "").toString();
  if (!input.trim()) return c.text("empty input", 400);
  undo = await snapshot(input, body.sessionId);
  return streamSSE(c, (stream) => runTurn(stream, input, body.sessionId).catch((e) => stream.writeSSE({ event: "error", data: String(e) })));
});

// Re-roll the last turn: restore files/session to before it, then re-run the same input.
app.post("/api/regenerate", async (c) => {
  if (!undo) return c.text("nothing to regenerate", 400);
  const u = undo;
  await restore(u);
  return streamSSE(c, (stream) => runTurn(stream, u.input, u.sid).catch((e) => stream.writeSSE({ event: "error", data: String(e) })));
});

async function* runClaude(input: string, sessionId?: string): AsyncGenerator<any> {
  const cmd = ["-p", input, "--output-format", "stream-json", "--verbose", "--include-partial-messages", "--permission-mode", "acceptEdits"];
  if (sessionId) cmd.push("--resume", sessionId);
  const env = { ...process.env };
  delete env.ANTHROPIC_API_KEY; delete env.ANTHROPIC_AUTH_TOKEN;
  const child = spawn("claude", cmd, { cwd: STORY, env });
  child.on("error", (e) => { throw e; });
  const rl = readline.createInterface({ input: child.stdout! });
  for await (const line of rl) { const s = line.trim(); if (!s) continue; try { yield JSON.parse(s); } catch { /* noise */ } }
}

async function* mockTurn(input: string): AsyncGenerator<any> {
  const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
  const delta = (text: string) => ({ type: "stream_event", event: { type: "content_block_delta", delta: { type: "text_delta", text } } });
  yield { type: "system", subtype: "init", session_id: "mock-session" };
  await delay(150);
  const text = `*행주질하던 손을 멈추지 않는다.* "왔어, ${input.slice(0, 12)}…?" *잠깐 고개를 든다.* "남은 거 한 잔은 있어. 앉든가." (MOCK)`;
  for (const tok of text.split(/(\s+)/)) { yield delta(tok); await delay(20); }
  yield { type: "result", subtype: "success", session_id: "mock-session" };
}

if (SERVE_STATIC) {
  app.use("/*", serveStatic({ root: "./dist" }));
  app.get("*", serveStatic({ path: "./dist/index.html" }));
}

serve({ fetch: app.fetch, port: PORT, hostname: "127.0.0.1" }, (info) => {
  console.log(`Story Harness bridge → http://127.0.0.1:${info.port}`);
  console.log(`story: ${STORY}${MOCK ? "  [MOCK]" : ""}`);
  if (!SERVE_STATIC) console.log("dev frontend: run `npm run dev:web` (or `npm run dev` for both)");
});
