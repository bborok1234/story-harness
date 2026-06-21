// Story Harness — local bridge.
// Spawns the user's OWN `claude` headless in a story folder, streams stream-json,
// and re-emits ONLY the narration (token-streamed) + state to the browser over SSE.
// Persists a transcript so the browser can restore on reload. Localhost only.
//
// Usage:
//   tsx server/bridge.ts [storyDir] [--serve-static] [--mock]
//   storyDir defaults to ../examples/imperial-ball (relative to web/).
//   MOCK=1 (or --mock) streams fake narration so you can test without Claude.
import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { streamSSE } from "hono/streaming";
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

const app = new Hono();

// Security: localhost only + Origin/Host allowlist (kills DNS rebinding).
app.use("/api/*", async (c, next) => {
  const host = (c.req.header("host") ?? "").split(":")[0];
  if (!ALLOW_HOSTS.has(host)) return c.text("forbidden host", 403);
  const origin = c.req.header("origin");
  if (origin && !ALLOW_ORIGINS.has(origin)) return c.text("forbidden origin", 403);
  return next();
});

async function readJSON(p: string): Promise<any> {
  try { return JSON.parse(await readFile(p, "utf8")); } catch { return {}; }
}
const readState = () => readJSON(path.join(STORY, "states", "state.json"));

function flatten(s: any): Record<string, number> {
  const out: Record<string, number> = {};
  const take = (o: any, pre: string) => {
    for (const [k, v] of Object.entries(o ?? {})) if (typeof v === "number") out[`${pre}${k}`] = v;
  };
  take(s.world, "world."); take(s.player, "player.");
  for (const [who, vals] of Object.entries(s.relationships ?? {})) take(vals, `${who}.`);
  return out;
}
function diff(before: any, after: any): Record<string, number> {
  const a = flatten(before), b = flatten(after), d: Record<string, number> = {};
  for (const k of Object.keys(b)) if (typeof a[k] === "number" && b[k] !== a[k]) d[k] = b[k] - a[k];
  return d;
}

async function loadTranscript(): Promise<{ beats: Beat[]; sessionId?: string }> {
  let beats: Beat[] = [];
  let sessionId: string | undefined;
  try {
    const raw = await readFile(path.join(SESSION_DIR, "transcript.jsonl"), "utf8");
    beats = raw.split("\n").filter(Boolean).map((l) => JSON.parse(l));
  } catch { /* none yet */ }
  try { sessionId = (await readFile(path.join(SESSION_DIR, "id"), "utf8")).trim() || undefined; } catch { /* none */ }
  return { beats, sessionId };
}
async function persistTurn(player: string, gm: string, sessionId?: string) {
  await mkdir(SESSION_DIR, { recursive: true });
  const line = (b: Beat) => JSON.stringify(b) + "\n";
  await appendFile(path.join(SESSION_DIR, "transcript.jsonl"), line({ role: "player", text: player }) + line({ role: "gm", text: gm }));
  if (sessionId) await writeFile(path.join(SESSION_DIR, "id"), sessionId);
}

app.get("/api/info", (c) => c.json({ story: path.basename(STORY), storyDir: STORY, mock: MOCK }));
app.get("/api/state", async (c) => c.json(await readState()));
app.get("/api/transcript", async (c) => c.json(await loadTranscript()));

// One turn: POST { input, sessionId? } -> SSE { status | narration | delta | state | done | error }.
app.post("/api/play", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const input: string = (body.input ?? "").toString();
  const sessionId: string | undefined = body.sessionId;
  if (!input.trim()) return c.text("empty input", 400);

  return streamSSE(c, async (stream) => {
    await stream.writeSSE({ event: "status", data: "composing" });
    const before = await readState();
    let sid = sessionId;
    let gm = "";
    let sawDelta = false;
    try {
      for await (const ev of MOCK ? mockTurn(input) : runClaude(input, sessionId)) {
        if (ev.type === "system" && ev.subtype === "init" && ev.session_id) {
          sid = ev.session_id;
        } else if (ev.type === "stream_event") {
          const d = ev.event;
          if (d?.type === "content_block_delta" && d.delta?.type === "text_delta" && d.delta.text) {
            sawDelta = true;
            gm += d.delta.text;
            await stream.writeSSE({ event: "narration", data: d.delta.text });
          }
        } else if (ev.type === "assistant" && !sawDelta) {
          // fallback: no partial deltas this turn -> emit whole text blocks
          for (const block of ev.message?.content ?? []) {
            if (block?.type === "text" && block.text) {
              gm += block.text;
              await stream.writeSSE({ event: "narration", data: block.text });
            }
          }
        } else if (ev.type === "result") {
          if (ev.session_id) sid = ev.session_id;
          break;
        }
        // tool_use / tool_result / thinking deltas: intentionally dropped (immersion).
      }
      const after = await readState();
      const d = diff(before, after);
      if (Object.keys(d).length) await stream.writeSSE({ event: "delta", data: JSON.stringify(d) });
      await stream.writeSSE({ event: "state", data: JSON.stringify(after) });
      await persistTurn(input, gm, sid);
      await stream.writeSSE({ event: "done", data: JSON.stringify({ sessionId: sid }) });
    } catch (err) {
      await stream.writeSSE({ event: "error", data: String(err) });
    }
  });
});

// Spawn the user's own claude; yield parsed stream-json events (token-streamed).
async function* runClaude(input: string, sessionId?: string): AsyncGenerator<any> {
  const cmd = [
    "-p", input,
    "--output-format", "stream-json", "--verbose", "--include-partial-messages",
    "--permission-mode", "acceptEdits",
  ];
  if (sessionId) cmd.push("--resume", sessionId);
  const env = { ...process.env };
  delete env.ANTHROPIC_API_KEY;   // precedence footgun: these silently override OAuth and bill the API
  delete env.ANTHROPIC_AUTH_TOKEN;
  const child = spawn("claude", cmd, { cwd: STORY, env });
  child.on("error", (e) => { throw e; });
  const rl = readline.createInterface({ input: child.stdout! });
  for await (const line of rl) {
    const s = line.trim();
    if (!s) continue;
    try { yield JSON.parse(s); } catch { /* ignore non-JSON noise */ }
  }
}

// Fake turn for local testing without Claude — emits token-style deltas.
async function* mockTurn(input: string): AsyncGenerator<any> {
  const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
  const delta = (text: string) => ({ type: "stream_event", event: { type: "content_block_delta", delta: { type: "text_delta", text } } });
  yield { type: "system", subtype: "init", session_id: "mock-session" };
  await delay(200);
  const text = `당신은 "${input}".\n\n촛불이 흔들린다. 누군가 당신을 본다 — 잠깐, 그러나 분명히.\n\n(MOCK: 가짜 서술. \`--mock\` 빼면 진짜 claude.)`;
  for (const tok of text.split(/(\s+)/)) { yield delta(tok); await delay(25); }
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
