import React from 'react';
import { TABLES } from '../engine/game.js';
import { PROTOCOL_BLOCKS } from '../content/protocol.js';
import ProtocolView from '../components/ProtocolView.jsx';
import {
  TABLE_INFO, JOBS, FLOW, SCENE_KEYS, PROVIDER_CALLS, DEBRIEF_KEY, EXIT_TICKET, SIMPLIFICATIONS, KEY_TERMS,
} from '../content/guide.js';

const sectionTitle = (id) => PROTOCOL_BLOCKS.find((s) => s.id === id)?.title;

export default function Guide() {
  return (
    <div className="doc">
      <nav className="doc-nav">
        <a href="#/">DKA Game</a>
        <a href="#/host">Instructor dashboard</a>
        <a className="btn btn-primary" href="#/print">Print student materials</a>
      </nav>

      <h1>DKA: One Patient, Five Tables. Teacher Guide</h1>
      <p className="doc-lead">
        Adult severe DKA, three 5-minute scenes plus a debrief, about 30–35 minutes. Runs on the hospital DKA/HHS
        Treatment Protocol. For NUR 4206 (Advanced Med-Surg/ICU) or pharmacology.
      </p>

      <h2>What this is</h2>
      <p>
        Five tables run one ICU patient, Jordan Reyes (22, type 1 diabetes, 70 kg), through severe DKA. Each table sees only
        its own organ system and controls only its own orders. The class has to share cues across tables to keep Jordan
        safe. You play the provider: any order outside the nurse-driven protocol needs a call to you with an SBAR.
      </p>
      <p>
        Each hour, every table has two gauges scored green (2), yellow (1), or red (0), for up to 20 points per hour. A
        safety event (VT, hypoglycemia, cerebral edema signs, cardiac arrest) costs 5 points. A second, invisible
        <strong> protocol-only Jordan</strong> runs alongside, following the standing orders exactly but reacting only
        to scheduled labs. The debrief graphs compare the two.
      </p>

      <h2>Learning objectives</h2>
      <ol>
        <li>Recognize DKA from glucose, ketones, and acidosis.</li>
        <li>Sequence the first hour: fluids, then potassium, then insulin.</li>
        <li>Explain why potassium falls once insulin starts, and act before it does.</li>
        <li>Titrate to ketone and acid-base resolution, not glucose, adding dextrose under 250 mg/dL.</li>
        <li>Transition safely with basal insulin overlap, and clarify an unsafe order using SBAR.</li>
      </ol>

      <h2>Before you run it</h2>
      <ul>
        <li>Devices: one per table (phone, tablet, or Chromebook) plus your laptop. Any browser works; no app or login.</li>
        <li>Print the role cards, the protocol, and the exit tickets from <a href="#/print">Print student materials</a>.</li>
        <li>Open the instructor dashboard, choose <strong>Version A</strong> (K⁺ 5.6, first run) or <strong>Version B</strong> (K⁺ 3.2, insulin must wait), and create a room.</li>
        <li>Click <strong>Open projector view</strong>, move that window to the classroom screen, and click Full screen. Keep the dashboard and its instructor panel off the projector.</li>
        <li>Choose the hour length before you start: <strong>5 minutes per scene</strong> (default), 8 minutes, or untimed. When the timer runs out, or every joined table taps Ready, the hour runs by itself.</li>
        <li>Classes of 12–14: run four tables and have the Respiratory table also cover Neuro.</li>
      </ul>

      <h2>The tables</h2>
      <table className="doc-table">
        <thead>
          <tr><th>Table</th><th>Sees</th><th>Controls</th><th>Protocol sections</th></tr>
        </thead>
        <tbody>
          {TABLES.map((t) => (
            <tr key={t.id}>
              <td><strong style={{ color: t.color }}>{t.name}</strong></td>
              <td>{TABLE_INFO[t.id].sees.join('; ')}</td>
              <td>{TABLE_INFO[t.id].controls.join('; ')}</td>
              <td>{TABLE_INFO[t.id].protocol.map(sectionTitle).join('; ')}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Jobs at each table</h3>
      <p>Jobs rotate one seat to the left after each scene so every student takes a turn as Caller.</p>
      <table className="doc-table">
        <tbody>
          {JOBS.map(([j, d]) => <tr key={j}><td><strong>{j}</strong></td><td>{d}</td></tr>)}
        </tbody>
      </table>

      <h2>The flow</h2>
      <table className="doc-table">
        <thead><tr><th>Step</th><th>Time</th><th>What happens</th></tr></thead>
        <tbody>
          {FLOW.map(([s, m, w]) => <tr key={s}><td><strong>{s}</strong></td><td>{m}</td><td>{w}</td></tr>)}
        </tbody>
      </table>
      <p>
        <strong>Each hour:</strong> tables read their monitors, Callers gather numbers, the table agrees on orders, and
        the Dialer taps Ready. The hour runs when the countdown ends or when every joined table is ready, whichever
        comes first. Tables that miss the countdown keep their last orders. You can pause the clock or run the hour early
        from the dashboard.
      </p>

      <h2>Scene-by-scene facilitation and answer key</h2>
      {SCENE_KEYS.map((s) => (
        <section key={s.title} className="doc-scene">
          <h3>{s.title}</h3>
          <p><strong>Goal:</strong> {s.goal}</p>
          <table className="doc-table">
            <thead><tr><th>When</th><th>What a strong class does</th></tr></thead>
            <tbody>
              {s.hours.map(([h, d]) => <tr key={h}><td><strong>{h}</strong></td><td>{d}</td></tr>)}
            </tbody>
          </table>
          <p className="doc-trap"><strong>Traps:</strong> {s.traps}</p>
        </section>
      ))}

      <h2>The protocol</h2>
      <p>Every table can open this from the <strong>DKA protocol</strong> button. Print copies from Print student materials.</p>
      <div className="doc-protocol"><ProtocolView /></div>

      <h2>Answering provider calls</h2>
      <table className="doc-table">
        <thead><tr><th>Request</th><th>How to respond</th></tr></thead>
        <tbody>
          {PROVIDER_CALLS.map(([r, d]) => <tr key={r}><td><strong>{r}</strong></td><td>{d}</td></tr>)}
        </tbody>
      </table>

      <h2>The debrief</h2>
      <p>
        End the last scene, then click <strong>Debrief</strong>. The projector shows each scene's graph: our Jordan
        (solid green) against the protocol-only Jordan (dashed gold), with the target range shaded. Start with Potassium,
        then Glucose, then Beta-hydroxybutyrate.
      </p>
      <table className="doc-table">
        <thead><tr><th>Question</th><th>What to listen for</th></tr></thead>
        <tbody>
          {DEBRIEF_KEY.map(([q, a]) => <tr key={q}><td>{q}</td><td>{a}</td></tr>)}
        </tbody>
      </table>

      <h2>Exit ticket key</h2>
      <ol>
        {EXIT_TICKET.map((e) => (
          <li key={e.q}><p>{e.q}</p><p className="doc-answer"><strong>Answer:</strong> {e.a}</p></li>
        ))}
      </ol>

      <h2>What the model simplifies</h2>
      <ul>{SIMPLIFICATIONS.map((s) => <li key={s}>{s}</li>)}</ul>

      <h2>Key terms</h2>
      <table className="doc-table">
        <tbody>{KEY_TERMS.map(([t, d]) => <tr key={t}><td><strong>{t}</strong></td><td>{d}</td></tr>)}</tbody>
      </table>

      <p className="fine">
        Treatment values follow the 2024 consensus report on hyperglycemic crises in adults (ADA, EASD, JBDS, AACE, DTS),
        simplified for teaching. Effect sizes are approximations, not exact physiology.
      </p>
    </div>
  );
}
