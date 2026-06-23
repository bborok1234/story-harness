import { useState, type ChangeEvent, type FormEvent } from "react";

type F = Record<string, string>;

export function Create({ onCreated, onCancel }: { onCreated: (id: string) => void; onCancel: () => void }) {
  const [mode, setMode] = useState<"chat" | "story">("chat");
  const [f, setF] = useState<F>({});
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const set = (k: string) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF((p) => ({ ...p, [k]: e.target.value }));

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!f.title?.trim() || !f.cname?.trim()) { setErr("스토리 제목과 캐릭터 이름은 필수예요."); return; }
    setBusy(true); setErr("");
    const payload = {
      title: f.title, premise: f.premise, mode,
      persona: { name: f.pname || "나", about: f.pabout },
      character: { name: f.cname, avatar: f.avatar, role: f.role, personality: f.personality, goal: f.goal, secret: f.secret, voice: f.voice, greeting: f.greeting, example: f.example },
      opening: { location: f.location, mood: f.mood, goal: f.ogoal },
    };
    try {
      const res = await fetch("/api/create", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
      const d = await res.json();
      if (!res.ok) { setErr(d.error === "already exists" ? "같은 이름의 스토리가 이미 있어요." : "생성 실패: " + (d.error || res.status)); setBusy(false); return; }
      onCreated(d.id);
    } catch (e2) { setErr(String(e2)); setBusy(false); }
  }

  return (
    <form className="create" onSubmit={submit}>
      <header className="create-head">
        <button type="button" className="ghost" onClick={onCancel}>← 뒤로</button>
        <h2>새 스토리 만들기</h2>
        <button type="submit" className="primary" disabled={busy}>{busy ? "만드는 중…" : "만들기 ▶"}</button>
      </header>
      {err && <p className="err">{err}</p>}

      <div className="mode-pick">
        <button type="button" className={mode === "chat" ? "on" : ""} onClick={() => setMode("chat")}>💬 캐릭터챗 (1:1, 1인칭)</button>
        <button type="button" className={mode === "story" ? "on" : ""} onClick={() => setMode("story")}>📖 스토리 (GM 서술)</button>
      </div>

      <section>
        <h3>스토리</h3>
        <label>제목 *<input value={f.title || ""} onChange={set("title")} placeholder="예: 늦은 밤의 카페" /></label>
        <label>한 줄 설정<input value={f.premise || ""} onChange={set("premise")} placeholder="세계관/전제 한 줄" /></label>
      </section>

      <section>
        <h3>나 (페르소나)</h3>
        <label>이름<input value={f.pname || ""} onChange={set("pname")} placeholder="플레이어 캐릭터 이름" /></label>
        <label>소개<input value={f.pabout || ""} onChange={set("pabout")} placeholder="당신은 누구인가" /></label>
      </section>

      <section>
        <h3>캐릭터</h3>
        <div className="row">
          <label className="grow">이름 *<input value={f.cname || ""} onChange={set("cname")} placeholder="상대 캐릭터" /></label>
          <label className="av">아바타<input value={f.avatar || ""} onChange={set("avatar")} placeholder="🌙" maxLength={2} /></label>
        </div>
        <label>역할<input value={f.role || ""} onChange={set("role")} placeholder="예: 카페 주인" /></label>
        <label>성격<textarea value={f.personality || ""} onChange={set("personality")} placeholder="성격, 분위기" rows={2} /></label>
        <label>목표<input value={f.goal || ""} onChange={set("goal")} placeholder="이 캐릭터가 원하는 것" /></label>
        <label>비밀/긴장<input value={f.secret || ""} onChange={set("secret")} placeholder="숨긴 것 (선택)" /></label>
        <label>말투/보이스<input value={f.voice || ""} onChange={set("voice")} placeholder="어떻게 말하나" /></label>
        <label>인사말 (첫 메시지)<textarea value={f.greeting || ""} onChange={set("greeting")} placeholder={'*행동* "첫 대사"'} rows={2} /></label>
        <label>예시 대화<textarea value={f.example || ""} onChange={set("example")} placeholder={"- User: 안녕\n- 이름: \"…\""} rows={3} /></label>
      </section>

      <section>
        <h3>여는 장면</h3>
        <label>장소<input value={f.location || ""} onChange={set("location")} placeholder="어디서 시작" /></label>
        <label>분위기<input value={f.mood || ""} onChange={set("mood")} placeholder="톤" /></label>
        <label>목표<input value={f.ogoal || ""} onChange={set("ogoal")} placeholder="지금 하려는 것" /></label>
      </section>
    </form>
  );
}
