import React, { useEffect, useRef, useState } from 'react';
import { ref, update, set } from 'firebase/database';
import { db, ensureSignedIn } from '../firebase.js';
import { listen } from '../room.js';
import { TABLES } from '../engine/game.js';
import { ORDER_SPEC } from '../ui/orderSpec.js';
import ProtocolPanel from '../components/ProtocolPanel.jsx';
import Cutaway from '../components/Cutaway.jsx';

export default function TableView({ code, tableId }) {
  const table = TABLES.find((t) => t.id === tableId);
  const [meta, setMeta] = useState(null);
  const [monitor, setMonitor] = useState(null);
  const [anim, setAnim] = useState(null);
  const prevVals = useRef({});
  const [changed, setChanged] = useState({});
  const [mine, setMine] = useState(null);
  const [error, setError] = useState('');
  const [sbarFor, setSbarFor] = useState(null);
  const [showProtocol, setShowProtocol] = useState(false);
  const [reportOpen, setShowReport] = useState(null);
  const base = `rooms/${code}/tables/${tableId}`;

  useEffect(() => {
    if (!table) return;
    let offs = [];
    ensureSignedIn()
      .then((uid) => {
        update(ref(db, base), { joinedAt: Date.now(), uid }).catch(() => setError('This room no longer exists.'));
        offs.push(listen(code, 'meta', setMeta));
        offs.push(listen(code, `monitors/${tableId}`, setMonitor));
        offs.push(listen(code, `anim/${tableId}`, setAnim));
        offs.push(listen(code, `tables/${tableId}`, setMine));
      })
      .catch(() => setError('Could not connect. Check the internet connection.'));
    return () => offs.forEach((off) => off());
  }, [code, tableId]);

  // Flash readings whose value changed since the last hour.
  useEffect(() => {
    const rows = Array.isArray(monitor) ? monitor : Object.values(monitor || {});
    const next = {};
    const flash = {};
    for (const r of rows) {
      const v = String(r.value);
      next[r.label] = v;
      if (prevVals.current[r.label] !== undefined && prevVals.current[r.label] !== v) flash[r.label] = true;
    }
    prevVals.current = next;
    setChanged(flash);
    const t = setTimeout(() => setChanged({}), 1700);
    return () => clearTimeout(t);
  }, [monitor]);

  if (!table) return <div className="home"><p className="error">Unknown table.</p></div>;

  const orders = mine?.orders || {};
  const requests = mine?.requests || {};
  const ready = Boolean(mine?.ready);
  const hour = meta?.hour ?? 0;
  const locked = !meta || meta.status !== 'ordering';
  const myCards = (meta?.cards || []).filter((c) => c.table === tableId);
  const showReport = reportOpen ?? (meta?.beat === 0);

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

      {anim && <Cutaway tableId={tableId} a={anim} />}

      <section className="monitor" aria-label="Your monitor">
        {(Array.isArray(monitor) ? monitor : Object.values(monitor || {})).map((row) => {
          const stale = row.kind === 'lab' && row.drawn < hour;
          return (
            <div key={row.label} className={`reading ${row.tone || ''} ${row.kind} ${changed[row.label] ? 'changed' : ''}`}>
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
          className={`btn btn-lg ${ready ? 'btn-ready' : 'btn-primary btn-act-now'}`}
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

function InsulinControl({ value, disabled, onChange }) {
  const u = Number(value) || 0;
  const [draft, setDraft] = useState(String(u));
  useEffect(() => setDraft(String(u)), [u]);
  const set = (v) => onChange(Math.max(0, Math.min(20, Math.round(v * 10) / 10)));
  const perKg = (u / 70).toFixed(3).replace(/0+$/, '').replace(/\.$/, '');
  return (
    <div className="order insulin">
      <span>Regular insulin infusion</span>
      <div className="insulin-now">
        <strong>{u ? `${u} units/hr` : 'Off'}</strong>
        {u > 0 && <em>= {perKg} units/kg/hr</em>}
      </div>
      <div className="insulin-row">
        <input
          type="number" min="0" max="20" step="0.1" inputMode="decimal" aria-label="Insulin units per hour"
          disabled={disabled} value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => set(Number(draft) || 0)}
          onKeyDown={(e) => { if (e.key === 'Enter') set(Number(draft) || 0); }}
        />
        <span className="unit-label">units/hr</span>
      </div>
      <div className="insulin-btns">
        <button className="btn btn-ghost" disabled={disabled} onClick={() => set(3.5)}>Start 3.5</button>
        <button className="btn btn-ghost" disabled={disabled || !u} onClick={() => set(u * 2)}>Double</button>
        <button className="btn btn-ghost" disabled={disabled || !u} onClick={() => set(u / 2)}>Halve</button>
        <button className="btn btn-ghost" disabled={disabled} onClick={() => set(1.4)}>Stage 2: 1.4</button>
        <button className="btn btn-ghost" disabled={disabled} onClick={() => set(u + 0.7)}>+0.7</button>
        <button className="btn btn-ghost" disabled={disabled || !u} onClick={() => set(u - 0.7)}>−0.7</button>
        <button className="btn btn-ghost" disabled={disabled || !u} onClick={() => set(0)}>Stop</button>
      </div>
      <p className="order-note">Stage 1: change under 50 or rising, double (max 20). Down 50–75, keep. Down over 75, halve. 0.01 units/kg/hr = 0.7 units/hr.</p>
    </div>
  );
}

function OrderControl({ spec, value, request, disabled, onChange, onRequest }) {
  if (spec.kind === 'insulin') return <InsulinControl value={value} disabled={disabled} onChange={onChange} />;
  if (spec.kind === 'select') {
    return (
      <label className="order">
        <span>{spec.label}{spec.note && <small className="order-note">{spec.note}</small>}</span>
        <select
          disabled={disabled}
          value={String(value === false || value == null ? spec.options[0].value : value)}
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
  const status = request?.status;
  if (spec.kind === 'call') {
    return (
      <div className="order">
        <span>{spec.label}</span>
        {status === 'pending' && <span className="pill">Provider reading your SBAR</span>}
        {status === 'approved' && <span className="pill ok">Provider agreed</span>}
        {status === 'declined' && <span className="pill no">Provider disagreed</span>}
        {status !== 'pending' && (
          <button className="btn btn-ghost" disabled={disabled} onClick={onRequest}>Call provider</button>
        )}
      </div>
    );
  }
  // approval
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
        <h3>{spec.kind === 'call' ? 'Call the provider' : `Call the provider: ${spec.label}`}</h3>
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
