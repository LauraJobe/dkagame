import React, { useEffect, useState } from 'react';
import { ensureSignedIn } from '../firebase.js';
import { listen } from '../room.js';
import { TABLES } from '../engine/game.js';
import Debrief from './Debrief.jsx';

// Read-only view for the classroom screen. The instructor runs the game from
// the instructor page on a laptop or tablet; this window goes on the projector.
export default function Screen({ code }) {
  const [meta, setMeta] = useState(null);
  const [tables, setTables] = useState({});
  const [engine, setEngine] = useState(null);
  const [full, setFull] = useState(false);

  useEffect(() => {
    const offs = [];
    ensureSignedIn().then(() => {
      offs.push(listen(code, 'meta', setMeta));
      offs.push(listen(code, 'tables', (v) => setTables(v || {})));
      offs.push(listen(code, 'engine', setEngine));
    });
    const onFs = () => setFull(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onFs);
    return () => {
      offs.forEach((o) => o());
      document.removeEventListener('fullscreenchange', onFs);
    };
  }, [code]);

  const goFull = () => document.documentElement.requestFullscreen?.().catch(() => {});
  const site = `${window.location.host}${window.location.pathname}`.replace(/\/$/, '');

  if (meta?.status === 'debrief' && engine) {
    let game = null;
    try { game = JSON.parse(engine); } catch {}
    if (game) {
      return (
        <div className="screen-wrap">
          {!full && <button className="btn btn-ghost fs-btn" onClick={goFull}>Full screen</button>}
          <Debrief game={game} />
        </div>
      );
    }
  }

  const readyCount = TABLES.filter((t) => tables[t.id]?.ready).length;
  const atStart = meta && meta.sceneIdx === 0 && meta.beat === 0;

  return (
    <div className="screen">
      {!full && <button className="btn btn-ghost fs-btn" onClick={goFull}>Full screen</button>}
      <header className="screen-head">
        <div className="screen-join">
          <div className="sj-label">Join at</div>
          <div className="sj-site">{site}</div>
          <div className="sj-label">Room code</div>
          <div className="sj-code">{code}</div>
        </div>
        <div className="screen-scene">
          <div className="ss-title">{meta?.sceneTitle || 'Waiting for the instructor'}</div>
          {meta && <div className="ss-hour">Hour {meta.hour}</div>}
          {meta && <div className="ss-beat">Beat {meta.beat} of {meta.beats}</div>}
        </div>
      </header>

      {meta && (
        <main className="screen-grid">
          <section className="screen-panel">
            <h2>{atStart ? 'Shift report' : 'Report'}</h2>
            <p className="screen-report">{meta.report}</p>
            {(meta.cards || []).length > 0 && (
              <div className="screen-cards">
                {meta.cards.map((c) => (
                  <div key={c.id} className={`event-card ${c.severity}`}>
                    <strong>{c.title} <span className="who">→ {TABLES.find((t) => t.id === c.table)?.name}</span></strong>
                    <span>{c.text}</span>
                  </div>
                ))}
              </div>
            )}
          </section>
          <section className="screen-panel">
            <h2>Tables <span className="count">{readyCount} of 5 ready</span></h2>
            <div className="screen-tiles">
              {TABLES.map((t) => {
                const d = tables[t.id];
                return (
                  <div key={t.id} className={`tile big ${d?.ready ? 'ready' : ''} ${d?.joinedAt ? '' : 'absent'}`} style={{ '--tc': t.color }}>
                    <div className="tile-name">{t.name}</div>
                    <div className="tile-state">{!d?.joinedAt ? 'Not joined' : d.ready ? 'Ready ✓' : 'Deciding…'}</div>
                  </div>
                );
              })}
            </div>
            {meta.status !== 'ordering' && <p className="screen-note">Scene paused. Talk it through.</p>}
          </section>
        </main>
      )}
    </div>
  );
}
