import React, { useEffect, useState } from 'react';
import { ref, update, set } from 'firebase/database';
import { db, ensureSignedIn } from '../firebase.js';
import { listen } from '../room.js';
import { TABLES } from '../engine/game.js';
import { ORDER_SPEC } from '../ui/orderSpec.js';
import ProtocolPanel from '../components/ProtocolPanel.jsx';

export default function TableView({ code, tableId }) {
  const table = TABLES.find((t) => t.id === tableId);
  const [meta, setMeta] = useState(null);
  const [monitor, setMonitor] = useState(null);
  const [mine, setMine] = useState(null);
  const [error, setError] = useState('');
  const [sbarFor, setSbarFor] = useState(null);
  const [showProtocol, setShowProtocol] = useState(false);
  const [showReport, setShowReport] = useState(true);
  const base = `rooms/${code}/tables/${tableId}`;

  useEffect(() => {
    if (!table) return;
    let offs = [];
    ensureSignedIn()
      .then((uid) => {
        update(ref(db, base), { joinedAt: Date.now(), uid }).catch(() => setError('This room no longer exists.'));
        offs.push(listen(code, 'meta', setMeta));
        offs.push(listen(code, `monitors/${tableId}`, setMonitor));
        offs.push(listen(code, `tables/${tableId}`, setMine));
      })
      .catch(() => setError('Could not connect. Check the internet connection.'));
    return () => offs.forEach((off) => off());
  }, [code, tableId]);

  if (!table) return <div className="home"><p className="error">Unknown table.</p></div>;

  const orders = mine?.orders || {};
  const requests = mine?.requests || {};
  const ready = Boolean(mine?.ready);
  const hour = meta?.hour ?? 0;
  const locked = !meta || meta.status !== 'ordering';
  const myCards = (meta?.cards || []).filter((c) => c.table === tableId);

  const setOrder = (key, value) => set(ref(db, `${base}/orders/${key}`), value);
  const setReady = (v) => set(ref(db, `${base}/ready`), v);

  async function sendRequest(order, sbar) {
    await set(ref(db, `${base}/requests/${order}`), { order, sbar, status: 'pending', at: Date.now() });
    setSbarFor(null);
  }

  return (
    <div className="table-screen" style={{ '--tc': table.color }}>
      <header className="table-head">
        <div>
          <div className="table-name">{table.name}</div>
          <div className="table-sub">Room {code} · Jordan Reyes, 22 · 70 kg</div>
        </div>
        <div className="clock">
          <div className="clock-hour">Hour {hour}</div>
          <div className="clock-scene">{meta?.sceneTitle || 'Waiting for instructor'}</div>
        </div>
      </header>

      <div className="table-tools">
        <button className="btn btn-protocol" onClick={() => setShowProtocol(true)}>DKA protocol</button>
        {meta?.report && (
          <button className="btn btn-ghost" onClick={() => setShowReport(!showReport)}>
            {showReport ? 'Hide shift report' : 'Shift report'}
          </button>
        )}
      </div>
      {showReport && meta?.report && <div className="report-box">{meta.report}</div>}

      {error && <p className="error">{error}</p>}

      {meta && meta.status !== 'ordering' && (
        <div className="banner">
          {meta.status === 'debrief' ? 'Debrief: eyes on the projector.' : 'Scene paused. Eyes on the projector.'}
        </div>
      )}

      {myCards.map((c) => (
        <div key={c.id} className={`event-card ${c.severity}`}>
          <strong>{c.title}</strong>
          <span>{c.text}</span>
        </div>
      ))}

      <section className="monitor" aria-label="Your monitor">
        {(Array.isArray(monitor) ? monitor : Object.values(monitor || {})).map((row) => {
          const stale = row.kind === 'lab' && row.drawn < hour;
          return (
            <div key={row.label} className={`reading ${row.tone || ''} ${row.kind}`}>
              <div className="reading-label">{row.label}</div>
              <div className="reading-value">
                {row.value}
                {row.unit && <span className="unit"> {row.unit}</span>}
              </div>
              {row.kind === 'lab' && (
                <div className={`drawn ${stale ? 'stale' : ''}`}>
                  {stale ? `drawn hour ${row.drawn}` : 'new this hour'}
                </div>
              )}
            </div>
          );
        })}
        {!monitor && <p className="muted">Waiting for the instructor to start.</p>}
      </section>

      <section className="orders" aria-label="Your orders">
        <h2>Your orders</h2>
        {ORDER_SPEC[tableId].map((spec) => (
          <OrderControl
            key={spec.key}
            spec={spec}
            value={orders[spec.key]}
            request={requests[spec.key]}
            disabled={locked}
            onChange={(v) => setOrder(spec.key, v)}
            onRequest={() => setSbarFor(spec)}
          />
        ))}
      </section>

      <div className="ready-bar">
        <button
          className={`btn btn-lg ${ready ? 'btn-ready' : 'btn-primary'}`}
          disabled={locked}
          onClick={() => setReady(!ready)}
        >
          {ready ? 'Ready ✓ (tap to change orders)' : 'Our table is ready'}
        </button>
      </div>

      {showProtocol && <ProtocolPanel tableId={tableId} dark onClose={() => setShowProtocol(false)} />}
      {sbarFor && <SbarModal spec={sbarFor} onCancel={() => setSbarFor(null)} onSend={(text) => sendRequest(sbarFor.key, text)} />}
    </div>
  );
}

function OrderControl({ spec, value, request, disabled, onChange, onRequest }) {
  if (spec.kind === 'select') {
    return (
      <label className="order">
        <span>{spec.label}</span>
        <select
          disabled={disabled}
          value={value ?? ''}
          onChange={(e) => {
            const raw = e.target.value;
            const opt = spec.options.find((o) => String(o.value) === raw);
            onChange(opt ? opt.value : raw);
          }}
        >
          {spec.options.map((o) => (
            <option key={String(o.value)} value={String(o.value)}>{o.label}</option>
          ))}
        </select>
      </label>
    );
  }
  if (spec.kind === 'toggle') {
    return (
      <label className="order toggle">
        <span>{spec.label}</span>
        <input type="checkbox" disabled={disabled} checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} />
      </label>
    );
  }
  if (spec.kind === 'action') {
    return (
      <div className="order">
        <span>{spec.label}</span>
        <button className={`btn ${value ? 'btn-ready' : 'btn-ghost'}`} disabled={disabled} onClick={() => onChange(!value)}>
          {value ? 'Queued for this hour' : 'Do this hour'}
        </button>
      </div>
    );
  }
  // approval
  const status = request?.status;
  return (
    <div className="order">
      <span>{spec.label} <em className="needs">provider order</em></span>
      {status === 'pending' && <span className="pill">Waiting on provider</span>}
      {status === 'approved' && <span className="pill ok">Approved: given this hour</span>}
      {status === 'declined' && <span className="pill no">Declined</span>}
      {status === 'used' && <span className="pill">Given</span>}
      {(!status || status === 'declined' || status === 'used') && (
        <button className="btn btn-ghost" disabled={disabled} onClick={onRequest}>Call provider</button>
      )}
    </div>
  );
}

function SbarModal({ spec, onCancel, onSend }) {
  const [text, setText] = useState('');
  return (
    <div className="modal-back" role="dialog" aria-modal="true">
      <div className="modal">
        <h3>Call the provider: {spec.label}</h3>
        <p className="muted">Give a short SBAR. The instructor reads it and approves or declines.</p>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={6}
          placeholder={'S: \nB: \nA: \nR: '}
          autoFocus
        />
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onCancel}>Cancel</button>
          <button className="btn btn-primary" disabled={text.trim().length < 10} onClick={() => onSend(text.trim())}>Send</button>
        </div>
      </div>
    </div>
  );
}
