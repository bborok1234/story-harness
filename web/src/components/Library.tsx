import { useEffect, useState } from "react";

export type Story = {
  id: string; name: string; demo: boolean; turn: number; mode: string;
  character?: { name: string; avatar?: string } | null;
};

export function Library({ onOpen, onCreate }: { onOpen: (id: string) => void; onCreate: () => void }) {
  const [stories, setStories] = useState<Story[]>([]);
  useEffect(() => { fetch("/api/stories").then((r) => r.json()).then(setStories).catch(() => {}); }, []);
  return (
    <div className="library">
      <header className="lib-head">
        <span className="brand">Story Harness</span>
        <button className="primary" onClick={onCreate}>+ 새 스토리</button>
      </header>
      <p className="lib-sub">무검열 · 무제한 재생성 · 구독 기반(턴당 과금 0) — 당신의 Claude Code로 돌아갑니다.</p>
      <div className="grid">
        {stories.map((s) => (
          <button key={s.id} className="card" onClick={() => onOpen(s.id)}>
            <div className="card-av">{s.character?.avatar ?? (s.mode === "chat" ? "💬" : "📖")}</div>
            <div className="card-body">
              <div className="card-title">{s.character?.name ?? s.name}</div>
              <div className="card-meta">{s.mode === "chat" ? "채팅" : "스토리"} · turn {s.turn}{s.demo ? " · demo" : ""}</div>
            </div>
          </button>
        ))}
        {stories.length === 0 && <p className="hint">아직 스토리가 없어요. “+ 새 스토리”로 시작하세요.</p>}
      </div>
    </div>
  );
}
