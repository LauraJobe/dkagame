import React, { useEffect, useRef, useState } from 'react';
import { get } from 'firebase/database';
import { ensureSignedIn } from '../firebase.js';
import { createRoom, publish, listen, roomRef, update } from '../room.js';
import { newGame, runBeat, startScene, finishScene, mergeOrders, ordersForTable, TABLES, SCENES } from '../engine/game.js';
import { isResolved, ONE_TIME_ORDERS } from '../engine/model.js';
import { ORDER_LABELS, bagName } from '../ui/orderSpec.js';
import Debrief from './Debrief.jsx';
import ProtocolPanel from '../components/ProtocolPanel.jsx';

const STORE_KEY = 'dka-host-room';

export default function Host() {
  const [uid, setUid] = useState(null);
  const [code, setCode] = useState(null);
  const [game, setGame] = useState(null);
  const [tables, setTables] = useState({});
  const [variant, setVariant] = useState('A');
  const [showTruth, setShowTruth] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [checklist, setChecklist] = useState({});
  const [showProtocol, setShowProtocol] = useState(false);
  const gameRef = useRef(null);
  const tablesRef = useRef({});
  const runningRef = useRef(false);
  gameRef.current = game;
  tablesRef.current = tables;



  // Sign in, then resume this browser's room if it still exists.
  useEffect(() => {
    ensureSignedIn()
      .then(async (id) => {
        setUid(id);
        let saved = null;
        try { saved = localStorage.getItem(STORE_KEY); } catch {}
        if (!saved) return;
        const snap = await get(roomRef(saved));
        const val = snap.val();
        if (val && val.hostUid === id && val.engine) {
          setCode(saved);
          setGame(JSON.parse(val.engine));
        }
      })
      .catch(() => setError('Could not connect to Firebase.'));
  }, []);

  useEffect(() => {
    if (!code) return;
    return listen(code, 'tables', (v) => setTables(v || {}));
  }, [code]);

  async function create() {
    setBusy(true);
    setError('');
    try {
      const g = newGame(variant);
      const c = await createRoom(uid, g);
      try { localStorage.setItem(STORE_KEY, c); } catch {}
      setGame(g);
      setCode(c);
    } catch (e) {
      setError(e.message || 'Could not create the room.');
    }
    setBusy(false);
  }

  async function save(g, opts) {
    setGame(g);
    await publish(code, g, opts);
  }

  async function doRunBeat() {
    if (runningRef.current) return;
    runningRef.current = true;
    const game = gameRef.current;
    const tables = tablesRef.current;
    setBusy(true);
    const tableOrders = {};
    const approvals = {};
    const extra = {};
    for (const t of TABLES) {
      const d = tables[t.id] || {};
      const o = { ...ordersForTable(game.orders, t.id), ...(d.orders || {}) };
      for (const [key, r] of Object.entries(d.requests || {})) {
        if (r.status === 'approved') {
          o[key] = true;
          approvals[key] = true;
          extra[`tables/${t.id}/requests/${key}/status`] = 'used';
        }
      }
      tableOrders[t.id] = o;
    }
    const merged = mergeOrders(game.orders, tableOrders, approvals);
    const g2 = runBeat(game, merged);
    for (const t of TABLES) {
      for (const k of ONE_TIME_ORDERS) {
        if (tableOrders[t.id][k] !== undefined) extra[`tables/${t.id}/orders/${k}`] = false;
      }
    }
    try {
      await save(g2);
      await update(roomRef(code), extra);
    } finally {
      setBusy(false);
      runningRef.current = false;
    }
  }

  async function decide(tableId, key, status) {
    await update(roomRef(code), { [`tables/${tableId}/requests/${key}/status`]: status });
  }

  async function endScene() {
    await save(finishScene(game));
  }

  async function nextScene() {
    setChecklist({});
    await save(startScene(game, game.sceneIdx + 1), { resetTables: true });
  }

  async function restartScene() {
    await save(startScene(game, game.sceneIdx), { resetTables: true });
  }

  async function toDebrief() {
    await save({ ...game, status: 'debrief' });
  }

  function leave() {
    try { localStorage.removeItem(STORE_KEY); } catch {}
    setGame(null);
    setCode(null);
  }

  if (!uid) return <div className="home"><p className="muted">Connecting…</p>{error && <p className="error">{error}</p>}</div>;

  if (!game || !code) {
    return (
      <div className="home">
        <div className="home-card">
          <div className="eyebrow">Instructor</div>
          <h1>Start a DKA room</h1>
          <fieldset className="variant">
            <legend>Arrival potassium</legend>
            <label><input type="radio" checked={variant === 'A'} onChange={() => setVariant('A')} /> Version A: K⁺ 5.6 (high on arrival; the drop comes later)</label>
            <label><input type="radio" checked={variant === 'B'} onChange={() => setVariant('B')} /> Version B: K⁺ 3.2 (insulin must wait)</label>
          </fieldset>
          <button className="btn btn-primary btn-lg" disabled={busy} onClick={create}>Create room</button>
          {error && <p className="error">{error}</p>}
          <div className="home-links">
            <a href="#/guide" target="_blank" rel="noreferrer">Teacher guide</a>
            <a href="#/print" target="_blank" rel="noreferrer">Print student materials</a>
          </div>
        </div>
      </div>
    );
  }

  if (game.status === 'debrief') {
    return <Debrief game={game} code={code} onBack={() => save({ ...game, status: 'sceneDone' })} onLeave={leave} />;
  }

  const scene = SCENES[game.sceneIdx];
  const joinUrl = `${window.location.origin}${window.location.pathname}#/join/${code}`;
  const pending = [];
  for (const t of TABLES) {
    for (const [key, r] of Object.entries(tables[t.id]?.requests || {})) {
      if (r.status === 'pending') pending.push({ table: t, key, r });
    }
  }
  const readyCount = TABLES.filter((t) => tables[t.id]?.ready).length;
  const joinedCount = TABLES.filter((t) => tables[t.id]?.joinedAt).length;
  const p = game.patient;

  return (
    <div className="host">
      <header className="host-head">
        <div className="room-code">
          <span className="rc-label">Room</span>
          <span className="rc">{code}</span>
          <span className="rc-url">{joinUrl.replace(/^https?:\/\//, '')}</span>
        </div>
        <div className="host-scene">
          <div className="hs-title">{scene.title}</div>
          <div className="hs-sub">Hour {p.hour} · Beat {game.beat} of {scene.beats}</div>
        </div>
        <div className="host-actions">
          <button
            className="btn btn-gold"
            onClick={() => window.open(`${window.location.pathname}#/screen/${code}`, 'dka-projector')}
          >
            Open projector view ↗
          </button>
          <button className="btn btn-ghost" onClick={() => setShowProtocol(true)}>DKA protocol</button>
          <a className="btn btn-ghost" href="#/guide" target="_blank" rel="noreferrer">Teacher guide</a>
          <button className="btn btn-ghost" onClick={() => setShowTruth(!showTruth)}>
            {showTruth ? 'Hide instructor panel' : 'Instructor panel'}
          </button>
        </div>
      </header>

      <main className="host-grid">
        <section className="panel report">
          <h2>Shift report</h2>
          <p>{scene.report}</p>
          {game.cards?.length > 0 && (
            <div className="cards">
              {game.cards.map((c) => (
                <div key={c.id} className={`event-card ${c.severity}`}>
                  <strong>{c.title} <span className="who">→ {TABLES.find((t) => t.id === c.table)?.name}</span></strong>
                  <span>{c.text}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="panel tables-panel">
          <h2>Tables <span className="count">{joinedCount}/5 joined · {readyCount}/5 ready</span></h2>
          <div className="table-tiles">
            {TABLES.map((t) => {
              const d = tables[t.id];
              return (
                <div key={t.id} className={`tile ${d?.ready ? 'ready' : ''} ${d?.joinedAt ? '' : 'absent'}`} style={{ '--tc': t.color }}>
                  <div className="tile-name">{t.name}</div>
                  <div className="tile-state">{!d?.joinedAt ? 'Not joined' : d.ready ? 'Ready' : 'Deciding…'}</div>
                </div>
              );
            })}
          </div>

          <div className="run-row">
            {game.status === 'ordering' && (
              <>
                <button className="btn btn-primary btn-lg" disabled={busy} onClick={doRunBeat}>
                  {readyCount < 5 ? `Run hour ${p.hour + 1} (${5 - readyCount} not ready)` : `Run hour ${p.hour + 1}`}
                </button>
              </>
            )}
            {game.status === 'sceneEnd' && (
              <button className="btn btn-primary btn-lg" onClick={endScene}>End {scene.title.split(':')[0]}</button>
            )}
            {game.status === 'sceneDone' && (
              <>
                {game.sceneIdx < SCENES.length - 1 && (
                  <button className="btn btn-primary btn-lg" onClick={nextScene}>Start {SCENES[game.sceneIdx + 1].title}</button>
                )}
                <button className="btn btn-ghost btn-lg" onClick={toDebrief}>Debrief</button>
              </>
            )}
          </div>
        </section>

        <section className="panel requests">
          <h2>Provider line</h2>
          {pending.length === 0 && <p className="muted">No calls waiting.</p>}
          {pending.map(({ table, key, r }) => (
            <div key={table.id + key} className="request" style={{ '--tc': table.color }}>
              <div className="req-head">
                {key === 'call'
                  ? <><strong>{table.name}</strong> is calling you</>
                  : <><strong>{table.name}</strong> requests <strong>{ORDER_LABELS[key]}</strong></>}
              </div>
              <pre className="sbar">{r.sbar}</pre>
              <div className="req-actions">
                <button className="btn btn-ghost" onClick={() => decide(table.id, key, 'declined')}>{key === 'call' ? 'Disagree' : 'Decline'}</button>
                <button className="btn btn-primary" onClick={() => decide(table.id, key, 'approved')}>{key === 'call' ? 'Agree' : 'Approve'}</button>
              </div>
            </div>
          ))}
        </section>

        <section className="panel howto">
          <h2>Running this room</h2>
          <ol>
            <li>Click <strong>Open projector view</strong> and drag that window onto the classroom screen, then click <strong>Full screen</strong> there. Students see the room code, report, and table status, but never the answers.</li>
            <li>Keep this page on your laptop or tablet to run hours, answer provider calls, and open the instructor panel.</li>
            <li>One screen only? Project the projector view and switch back to this tab to run each hour.</li>
          </ol>
        </section>

        {showProtocol && <ProtocolPanel onClose={() => setShowProtocol(false)} />}
        {showTruth && <TruthPanel game={game} tables={tables} checklist={checklist} setChecklist={setChecklist} onRestart={restartScene} onLeave={leave} />}
      </main>
    </div>
  );
}

function TruthPanel({ game, tables, checklist, setChecklist, onRestart, onLeave }) {
  const p = game.patient;
  const scene = SCENES[game.sceneIdx];
  const rows = [
    ['Glucose', Math.round(p.glucose), 'mg/dL'],
    ['K⁺', p.k.toFixed(1), 'mEq/L'],
    ['BHB', p.bhb.toFixed(1), 'mmol/L'],
    ['pH', p.ph.toFixed(2), ''],
    ['HCO₃⁻', p.hco3.toFixed(1), 'mEq/L'],
    ['Anion gap', Math.round(p.ag), ''],
    ['PaCO₂', Math.round(p.paco2), 'mmHg'],
    ['Na⁺ (corrected)', `${Math.round(p.na)} (${Math.round(p.correctedNa)})`, 'mEq/L'],
    ['Osmolality', Math.round(p.osm), 'mOsm/kg'],
    ['MAP', Math.round(p.map), 'mmHg'],
    ['UO', Math.round(p.uo), 'mL/hr'],
    ['GCS', p.gcs, ''],
    ['Fluid deficit', p.deficitL.toFixed(1), 'L'],
  ];
  const classScore = game.history.reduce((a, h) => a + (h.score ?? 0), 0);
  const botScore = game.bot.history.reduce((a, h) => a + (h.score ?? 0), 0);
  const o = game.orders;
  return (
    <section className="panel truth">
      <h2>Instructor panel <span className="count">not for projection</span></h2>
      <div className="truth-grid">
        {rows.map(([l, v, u]) => (
          <div key={l}><span>{l}</span><strong>{v}</strong> <em>{u}</em></div>
        ))}
      </div>
      <p><strong>DKA resolved:</strong> {isResolved(p) ? `Yes${game.resolvedAtHour != null ? ` (hour ${game.resolvedAtHour})` : ''}` : 'No'}</p>
      <p><strong>Running:</strong> {bagName(o)} at {o.fluidRate} mL/hr; insulin {o.insulinUnits || 0} units/hr ({((o.insulinUnits || 0) / 70).toFixed(3)} units/kg/hr){p.kBolusLeft ? `; K⁺ bolus running (${p.kBolusLeft} h left)` : ''}</p>
      <p><strong>Score this scene:</strong> class {classScore} · protocol-only {botScore}</p>
      {scene.teachingChecklist && (
        <div className="checklist">
          <strong>Sick-day teaching checklist</strong>
          {scene.teachingChecklist.map((item) => (
            <label key={item}>
              <input type="checkbox" checked={Boolean(checklist[item])} onChange={(e) => setChecklist({ ...checklist, [item]: e.target.checked })} /> {item}
            </label>
          ))}
        </div>
      )}
      <div className="truth-actions">
        <button className="btn btn-ghost" onClick={onRestart}>Restart this scene</button>
        <button className="btn btn-ghost" onClick={onLeave}>Close room on this device</button>
      </div>
    </section>
  );
}
