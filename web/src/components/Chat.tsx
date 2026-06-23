import { useEffect, useRef } from "react";
import type { Beat } from "./Narration";

export type Character = { name: string; avatar?: string } | null;

// Render *...* as muted italic 지문 (narration), the rest as normal speech.
function RichText({ text }: { text: string }) {
  const parts = text.split(/(\*[^*]+\*)/g);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith("*") && p.endsWith("*") && p.length > 2
          ? <em key={i} className="narr">{p.slice(1, -1)}</em>
          : <span key={i}>{p}</span>,
      )}
    </>
  );
}

export function Chat({
  character, feed, busy, status, onRegenerate,
}: {
  character: Character;
  feed: Beat[];
  busy: boolean;
  status: string;
  onRegenerate: () => void;
}) {
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [feed, busy]);
  const av = character?.avatar || "🌙";
  const lastGm = (() => { for (let i = feed.length - 1; i >= 0; i--) if (feed[i].role === "gm") return i; return -1; })();

  return (
    <div className="chat">
      {feed.length === 0 && <p className="hint">{character?.name ?? "상대"}와의 대화가 여기서 시작됩니다.</p>}
      {feed.map((b, i) => {
        if (b.role === "player") return <div key={i} className="msg me"><div className="bubble">{b.text}</div></div>;
        if (b.role === "system") return <div key={i} className="msg sys">{b.text}</div>;
        return (
          <div key={i} className="msg them">
            <div className="avatar">{av}</div>
            <div className="col">
              <div className="who">{character?.name ?? "상대"}</div>
              <div className="bubble">
                <RichText text={b.text || (busy ? "…" : "")} />
              </div>
              {i === lastGm && !busy && b.text && (
                <button className="reroll" onClick={onRegenerate} title="다시 받기 (무제한 · 무과금)">↻ 다시</button>
              )}
            </div>
          </div>
        );
      })}
      {busy && <div className="msg them typing"><div className="avatar">{av}</div><div className="dots">✦ {status || "쓰는 중"}…</div></div>}
      <div ref={endRef} />
    </div>
  );
}
