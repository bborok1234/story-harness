import { useEffect, useRef, useState } from "react";
import { postSSE } from "./sse";
import { Narration, type Beat } from "./components/Narration";
import { Chat, type Character } from "./components/Chat";
import { Hud, type StoryState } from "./components/Hud";

export function App() {
  const [feed, setFeed] = useState<Beat[]>([]);
  const [hud, setHud] = useState<StoryState>({});
  const [deltas, setDeltas] = useState<Record<string, number>>({});
  const [story, setStory] = useState("");
  const [mode, setMode] = useState("story");
  const [character, setCharacter] = useState<Character>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [input, setInput] = useState("");
  const sessionId = useRef<string | undefined>(undefined);

  useEffect(() => {
    fetch("/api/info").then((r) => r.json()).then((d) => {
      setStory(d.story); setMode(d.mode ?? "story"); setCharacter(d.character ?? null);
    }).catch(() => {});
    fetch("/api/transcript").then((r) => r.json()).then((d) => {
      if (Array.isArray(d.beats)) setFeed(d.beats);
      if (d.sessionId) sessionId.current = d.sessionId;
    }).catch(() => {});
    fetch("/api/state").then((r) => r.json()).then(setHud).catch(() => {});
  }, []);

  // Stream a turn's SSE into the last gm beat.
  async function stream(url: string, body: unknown) {
    setBusy(true); setStatus("composing"); setDeltas({});
    try {
      for await (const ev of postSSE(url, body)) {
        if (ev.event === "narration") {
          let chunk = ev.data; try { chunk = JSON.parse(ev.data); } catch { /* plain */ }
          setFeed((f) => { const c = [...f]; c[c.length - 1] = { role: "gm", text: c[c.length - 1].text + chunk }; return c; });
        } else if (ev.event === "delta") { try { setDeltas(JSON.parse(ev.data)); } catch { /* */ } }
        else if (ev.event === "state") { try { setHud(JSON.parse(ev.data)); } catch { /* */ } }
        else if (ev.event === "done") { try { sessionId.current = JSON.parse(ev.data).sessionId; } catch { /* */ } }
        else if (ev.event === "status") setStatus(ev.data);
        else if (ev.event === "error") setFeed((f) => [...f, { role: "system", text: "⚠ " + ev.data }]);
      }
    } catch (e) { setFeed((f) => [...f, { role: "system", text: "⚠ " + String(e) }]); }
    finally { setBusy(false); setStatus(""); }
  }

  async function send(text: string) {
    const t = text.trim();
    if (!t || busy) return;
    setInput("");
    setFeed((f) => [...f, { role: "player", text: t }, { role: "gm", text: "" }]);
    await stream("/api/play", { input: t, sessionId: sessionId.current });
  }

  async function regenerate() {
    if (busy) return;
    setFeed((f) => { const c = [...f]; for (let i = c.length - 1; i >= 0; i--) if (c[i].role === "gm") { c[i] = { role: "gm", text: "" }; break; } return c; });
    await stream("/api/regenerate", {});
  }

  const cont = () => send(mode === "chat" ? "(계속 이어서 말해줘.)" : "(계속 이어서 서술해줘.)");

  return (
    <div className="app">
      <main className="stage">
        <header className="topbar">
          <span className="brand">Story Harness</span>
          {mode === "chat" && character ? <span className="story">· {character.avatar ?? "🌙"} {character.name}</span> : story && <span className="story">· {story}</span>}
          <span className="mode-tag">{mode === "chat" ? "chat" : "story"}</span>
        </header>
        {mode === "chat"
          ? <Chat character={character} feed={feed} busy={busy} status={status} onRegenerate={regenerate} />
          : <Narration feed={feed} busy={busy} status={status} />}
        <form className="composer" onSubmit={(e) => { e.preventDefault(); send(input); }}>
          <input value={input} onChange={(e) => setInput(e.target.value)}
            placeholder={feed.length ? (mode === "chat" ? "메시지…" : "무엇을 하시겠습니까…") : "행동/대사를 입력하거나 ‘시작’"}
            disabled={busy} autoFocus />
          {feed.length === 0
            ? <button type="button" className="begin" disabled={busy}
                onClick={() => send(mode === "chat" ? "(장면을 시작해줘 — 첫 인사를 들려줘.)" : "(장면을 시작해줘 — 여는 서술을 들려줘.)")}>▶ 시작</button>
            : <button type="button" className="ghost" disabled={busy} onClick={cont} title="이어서">⤵ 이어서</button>}
          <button type="submit" disabled={busy || !input.trim()}>보내기</button>
        </form>
      </main>
      <aside className="sidebar"><Hud state={hud} deltas={deltas} /></aside>
    </div>
  );
}
