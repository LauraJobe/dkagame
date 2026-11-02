import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceArea, ResponsiveContainer, Legend } from 'recharts';
import { TABLES } from '../engine/game.js';

const METRICS = [
  { key: 'k', label: 'Potassium', unit: 'mEq/L', green: [4.0, 5.0], domain: [1.5, 6.5] },
  { key: 'glucose', label: 'Glucose', unit: 'mg/dL', green: [150, 250], domain: [0, 550] },
  { key: 'bhb', label: 'Beta-hydroxybutyrate', unit: 'mmol/L', green: [0, 0.6], domain: [0, 8] },
  { key: 'ph', label: 'pH', unit: '', green: [7.3, 7.45], domain: [6.8, 7.5] },
  { key: 'map', label: 'MAP', unit: 'mmHg', green: [65, 100], domain: [40, 105] },
  { key: 'gcs', label: 'GCS', unit: '', green: [15, 15], domain: [3, 15] },
  { key: 'score', label: 'Body score', unit: 'of 20', green: [16, 20], domain: [0, 20] },
];

const QUESTIONS = [
  'Point to where K⁺ left the green on our graph. Which table saw it first, how did that information travel, and how many hours did it take?',
  'When the provider asked to stop the drip, what told us the DKA was not resolved, and which table had that number?',
  'Where did our patient do better than the protocol-only patient? What did we anticipate that the protocol did not?',
  'Why does insulin lower serum potassium? Trace it to the Na⁺/K⁺-ATPase.',
  'What would you teach Jordan before discharge so this does not happen with the next illness?',
];

export default function Debrief({ game, onBack, onLeave }) {
  const results = [...(game.results || [])].sort((a, b) => a.sceneIdx - b.sceneIdx);
  const [metric, setMetric] = useState('k');
  const m = METRICS.find((x) => x.key === metric);

  return (
    <div className="host debrief">
      <header className="host-head">
        <div className="host-scene">
          <div className="hs-title">Debrief</div>
          <div className="hs-sub">Our Jordan (solid) vs. the protocol-only Jordan (dashed). Green band = target range.</div>
        </div>
        <div className="host-actions">
          <button className="btn btn-ghost" onClick={onBack}>Back to game</button>
          <button className="btn btn-ghost" onClick={onLeave}>Close room</button>
        </div>
      </header>

      <div className="metric-tabs" role="tablist">
        {METRICS.map((x) => (
          <button key={x.key} role="tab" aria-selected={metric === x.key} className={`tab ${metric === x.key ? 'on' : ''}`} onClick={() => setMetric(x.key)}>
            {x.label}
          </button>
        ))}
      </div>

      {results.length === 0 && <p className="muted pad">Finish at least one scene to see graphs.</p>}

      <div className="debrief-grid">
        {results.map((r) => {
          const data = r.history.map((h, i) => ({
            hour: h.hour,
            ours: h[metric],
            protocol: r.botHistory[i]?.[metric],
          }));
          return (
            <section key={r.sceneIdx} className="panel chart-panel">
              <h2>{r.title}</h2>
              <div className="totals">
                <span><strong>{r.classTotal}</strong> our score</span>
                <span><strong>{r.botTotal}</strong> protocol-only</span>
                <span>Resolved: {r.resolvedAtHour != null ? `hour ${r.resolvedAtHour}` : 'not yet'}</span>
              </div>
              <div className="chart">
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={data} margin={{ top: 10, right: 16, bottom: 8, left: 0 }}>
                    <CartesianGrid stroke="#ebe7dd" vertical={false} />
                    <ReferenceArea y1={m.green[0]} y2={m.green[1]} fill="#0e5a3c" fillOpacity={0.12} stroke="none" />
                    <XAxis dataKey="hour" tickFormatter={(h) => `h${h}`} stroke="#69716c" />
                    <YAxis domain={m.domain} stroke="#69716c" width={44} />
                    <Tooltip formatter={(v) => `${v} ${m.unit}`} labelFormatter={(h) => `Hour ${h}`} />
                    <Legend />
                    <Line type="monotone" dataKey="ours" name="Our Jordan" stroke="#0e5a3c" strokeWidth={3} dot={{ r: 4 }} connectNulls isAnimationActive={false} />
                    <Line type="monotone" dataKey="protocol" name="Protocol-only" stroke="#c8960c" strokeWidth={2.5} strokeDasharray="6 4" dot={false} connectNulls isAnimationActive={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              {r.cards.filter((c) => c.severity !== 'info').length > 0 && (
                <ul className="card-log">
                  {r.cards.filter((c) => c.severity !== 'info').map((c) => (
                    <li key={c.id} className={c.severity}>
                      Hour {c.hour}: <strong>{c.title}</strong> ({TABLES.find((t) => t.id === c.table)?.name})
                    </li>
                  ))}
                </ul>
              )}
            </section>
          );
        })}
      </div>

      <section className="panel questions">
        <h2>Talk it through</h2>
        <ol>
          {QUESTIONS.map((q) => <li key={q}>{q}</li>)}
        </ol>
      </section>
    </div>
  );
}
