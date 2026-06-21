import { useEffect, useRef } from "react";

export type Beat = { role: "player" | "gm" | "system"; text: string };

export function Narration({ feed, busy, status }: { feed: Beat[]; busy: boolean; status: string }) {
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [feed, busy]);

  return (
    <div className="narration">
      {feed.length === 0 && <p className="hint">당신의 이야기가 여기서 시작됩니다.</p>}
      {feed.map((b, i) => (
        <div key={i} className={`beat ${b.role}`}>
          {b.role === "player" ? (
            <span className="you">▸ {b.text}</span>
          ) : (
            <p>{b.text || (busy ? "…" : "")}</p>
          )}
        </div>
      ))}
      {busy && <div className="liveness">✎ {status || "the storyteller is composing"}…</div>}
      <div ref={endRef} />
    </div>
  );
}
