import { useEffect, useRef, useState } from "react";
import { postSSE } from "./sse";
import { Narration, type Beat } from "./components/Narration";
import { Hud, type StoryState } from "./components/Hud";

export function App() {
  const [feed, setFeed] = useState<Beat[]>([]);
  const [hud, setHud] = useState<StoryState>({});
  const [deltas, setDeltas] = useState<Record<string, number>>({});
  const [story, setStory] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [input, setInput] = useState("");
  const sessionId = useRef<string | undefined>(undefined);

  // Restore on load: prior transcript + sessionId, then current state.
  useEffect(() => {
    fetch("/api/info").then((r) => r.json()).then((d) => setStory(d.story)).catch(() => {});
    fetch("/api/transcript").then((r) => r.json()).then((d) => {
      if (Array.isArray(d.beats)) setFeed(d.beats);
      if (d.sessionId) sessionId.current = d.sessionId;
    }).catch(() => {});
    fetch("/api/state").then((r) => r.json()).then(setHud).catch(() => {});
  }, []);

  async function send(text: string) {
    const t = text.trim();
    if (!t || busy) return;
    setInput("");
    setBusy(true);
    setStatus("composing");
    setDeltas({});
    setFeed((f) => [...f, { role: "player", text: t }, { role: "gm", text: "" }]);
    try {
      for await (const ev of postSSE("/api/play", { input: t, sessionId: sessionId.current })) {
        if (ev.event === "narration") {
          setFeed((f) => {
            const c = [...f];
            c[c.length - 1] = { role: "gm", text: c[c.length - 1].text + ev.data };
            return c;
          });
        } else if (ev.event === "delta") {
          try { setDeltas(JSON.parse(ev.data)); } catch { /* ignore */ }
        } else if (ev.event === "state") {
          try { setHud(JSON.parse(ev.data)); } catch { /* ignore */ }
        } else if (ev.event === "done") {
          try { sessionId.current = JSON.parse(ev.data).sessionId; } catch { /* ignore */ }
        } else if (ev.event === "status") {
          setStatus(ev.data);
        } else if (ev.event === "error") {
          setFeed((f) => [...f, { role: "system", text: "⚠ " + ev.data }]);
        }
      }
    } catch (e) {
      setFeed((f) => [...f, { role: "system", text: "⚠ " + String(e) }]);
    } finally {
      setBusy(false);
      setStatus("");
    }
  }

  return (
    <div className="app">
      <main className="stage">
        <header className="topbar">
          <span className="brand">Story Harness</span>
          {story && <span className="story">· {story}</span>}
        </header>
        <Narration feed={feed} busy={busy} status={status} />
        <form className="composer" onSubmit={(e) => { e.preventDefault(); send(input); }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={feed.length ? "무엇을 하시겠습니까…" : "행동을 입력하거나 ‘시작’을 누르세요"}
            disabled={busy}
            autoFocus
          />
          {feed.length === 0 && (
            <button
              type="button"
              className="begin"
              disabled={busy}
              onClick={() => send("(장면을 시작해줘 — 여는 서술을 들려줘.)")}
            >
              ▶ 시작
            </button>
          )}
          <button type="submit" disabled={busy || !input.trim()}>보내기</button>
        </form>
      </main>
      <aside className="sidebar">
        <Hud state={hud} deltas={deltas} />
      </aside>
    </div>
  );
}
