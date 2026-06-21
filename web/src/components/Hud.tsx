export type StoryState = {
  turn?: number;
  world?: Record<string, number>;
  player?: Record<string, number>;
  relationships?: Record<string, Record<string, number>>;
};

function Bar({ label, value }: { label: string; value: number }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className="bar">
      <span className="bar-label">{label}</span>
      <span className="bar-track">
        <span className="bar-fill" style={{ width: `${pct}%` }} />
      </span>
      <span className="bar-val">{value}</span>
    </div>
  );
}

export function Hud({ state }: { state: StoryState }) {
  const { turn, world, player, relationships } = state;
  const has = (o?: object) => o && Object.keys(o).length > 0;
  return (
    <div className="hud">
      <h2>
        상태 {typeof turn === "number" && <span className="turn">turn {turn}</span>}
      </h2>
      {has(player) && (
        <section>
          <h3>나</h3>
          {Object.entries(player!).map(([k, v]) => <Bar key={k} label={k} value={v} />)}
        </section>
      )}
      {has(world) && (
        <section>
          <h3>세계</h3>
          {Object.entries(world!).map(([k, v]) => <Bar key={k} label={k} value={v} />)}
        </section>
      )}
      {has(relationships) && (
        <section>
          <h3>관계</h3>
          {Object.entries(relationships!).map(([who, vals]) => (
            <div key={who} className="rel">
              <div className="rel-name">{who}</div>
              {Object.entries(vals).map(([k, v]) => <Bar key={k} label={k} value={v} />)}
            </div>
          ))}
        </section>
      )}
      {!has(world) && !has(player) && !has(relationships) && <p className="hint">상태 없음.</p>}
    </div>
  );
}
