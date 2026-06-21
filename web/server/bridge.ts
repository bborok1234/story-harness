// Story Harness — local bridge.
// Spawns the user's OWN `claude` headless in a story folder, streams stream-json,
// and re-emits ONLY the narration + state to the browser over SSE. Localhost only.
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
import { readFile } from "node:fs/promises";
import path from "node:path";

const args = process.argv.slice(2);
const flags = new Set(args.filter((a) => a.startsWith("--")));
const positional = args.filter((a) => !a.startsWith("--"));
const MOCK = flags.has("--mock") || process.env.MOCK === "1";
const SERVE_STATIC = flags.has("--serve-static");
const PORT = Number(process.env.PORT ?? 8787);
const STORY = path.resolve(process.cwd(), positional[0] ?? process.env.STORY ?? "../examples/imperial-ball");

const ALLOW_HOSTS = new Set(["127.0.0.1", "localhost"]);
const ALLOW_ORIGINS = new Set([
  "http://127.0.0.1:5173", "http://localhost:5173",
  `http://127.0.0.1:${PORT}`, `http://localhost:${PORT}`,
]);

const app = new Hono();

// Security: localhost only + Origin/Host allowlist (kills DNS rebinding).
app.use("/api/*", async (c, next) => {
  const host = (c.req.header("host") ?? "").split(":")[0];
  if (!ALLOW_HOSTS.has(host)) return c.text("forbidden host", 403);
  const origin = c.req.header("origin");
  if (origin && !ALLOW_ORIGINS.has(origin)) return c.text("forbidden origin", 403);
  return next();
});

async function readState(): Promise<unknown> {
  try {
    return JSON.parse(await readFile(path.join(STORY, "states", "state.json"), "utf8"));
  } catch {
    return {};
  }
}

app.get("/api/info", (c) => c.json({ story: path.basename(STORY), storyDir: STORY, mock: MOCK }));
app.get("/api/state", async (c) => c.json(await readState()));

// One turn: POST { input, sessionId? } -> SSE { status | narration | state | done | error }.
app.post("/api/play", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const input: string = (body.input ?? "").toString();
  const sessionId: string | undefined = body.sessionId;
  if (!input.trim()) return c.text("empty input", 400);

  return streamSSE(c, async (stream) => {
    await stream.writeSSE({ event: "status", data: "composing" });
    let sid = sessionId;
    try {
      for await (const ev of MOCK ? mockTurn(input) : runClaude(input, sessionId)) {
        if (ev.type === "system" && ev.subtype === "init" && ev.session_id) sid = ev.session_id;
        else if (ev.type === "assistant") {
          for (const block of ev.message?.content ?? []) {
            if (block?.type === "text" && block.text) {
              await stream.writeSSE({ event: "narration", data: block.text });
            }
          }
        } else if (ev.type === "result") {
          if (ev.session_id) sid = ev.session_id;
          break;
        }
        // tool_use / tool_result / thinking / stream_event: intentionally dropped (immersion).
      }
      await stream.writeSSE({ event: "state", data: JSON.stringify(await readState()) });
      await stream.writeSSE({ event: "done", data: JSON.stringify({ sessionId: sid }) });
    } catch (err) {
      await stream.writeSSE({ event: "error", data: String(err) });
    }
  });
});

// Spawn the user's own claude; yield parsed stream-json events.
async function* runClaude(input: string, sessionId?: string): AsyncGenerator<any> {
  const cmd = ["-p", input, "--output-format", "stream-json", "--verbose", "--permission-mode", "acceptEdits"];
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

// Fake turn for local testing without Claude.
async function* mockTurn(input: string): AsyncGenerator<any> {
  const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
  yield { type: "system", subtype: "init", session_id: "mock-session" };
  await delay(300);
  const beats = [
    `당신은 "${input}".\n\n`,
    "촛불이 흔들린다. 누군가 당신을 본다 — 잠깐, 그러나 분명히.\n\n",
    "(MOCK 모드: 실제 Claude 대신 가짜 서술. `--mock` 빼고 실행하면 진짜로 돈다.)",
  ];
  for (const b of beats) { yield { type: "assistant", message: { content: [{ type: "text", text: b }] } }; await delay(300); }
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
