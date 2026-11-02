import React, { useState } from 'react';
import { TABLES, SCENES } from '../engine/game.js';
import { PROTOCOL_TITLE, PROTOCOL_INTRO, PROTOCOL_SECTIONS, PROTOCOL_SOURCE } from '../content/protocol.js';
import { TABLE_INFO, JOBS, EXIT_TICKET, KEY_TERMS, SCENE_KEYS } from '../content/guide.js';

const OPTIONS = [
  ['roles', 'Role cards (one page per table)'],
  ['protocol', 'DKA protocol (one copy per table)'],
  ['sbar', 'SBAR call card'],
  ['terms', 'Key terms sheet'],
  ['exit', 'Exit ticket'],
  ['key', 'Instructor answer key (do not hand out)'],
];

export default function Print() {
  const [pick, setPick] = useState({ roles: true, protocol: true, sbar: true, terms: true, exit: true, key: false });
  const [tables, setTables] = useState(Object.fromEntries(TABLES.map((t) => [t.id, true])));

  return (
    <div className="print-root">
      <div className="print-controls no-print">
        <nav className="doc-nav">
          <a href="#/">DKA Game</a>
          <a href="#/guide">Teacher guide</a>
        </nav>
        <h1>Print student materials</h1>
        <p className="muted">Each item starts on a new page. Role cards are two pages (front and back): print double-sided. Choose "Save as PDF" in the print dialog to keep a copy.</p>
        <div className="print-pick">
          <fieldset>
            <legend>Include</legend>
            {OPTIONS.map(([k, label]) => (
              <label key={k}><input type="checkbox" checked={pick[k]} onChange={(e) => setPick({ ...pick, [k]: e.target.checked })} /> {label}</label>
            ))}
          </fieldset>
          <fieldset>
            <legend>Role cards for</legend>
            {TABLES.map((t) => (
              <label key={t.id}><input type="checkbox" checked={tables[t.id]} onChange={(e) => setTables({ ...tables, [t.id]: e.target.checked })} /> {t.name}</label>
            ))}
          </fieldset>
        </div>
        <button className="btn btn-primary btn-lg" onClick={() => window.print()}>Print</button>
      </div>

      <div className="sheets">
        {pick.roles && TABLES.filter((t) => tables[t.id]).map((t) => <RoleCard key={t.id} table={t} />)}
        {pick.protocol && <ProtocolSheet />}
        {pick.sbar && <SbarCard />}
        {pick.terms && <TermsSheet />}
        {pick.exit && <ExitTicket />}
        {pick.key && <AnswerKey />}
      </div>
    </div>
  );
}

function Sheet({ children, title, kicker, color, className = '' }) {
  return (
    <section className={`sheet ${className}`} style={{ '--tc': color || '#0e5a3c' }}>
      <header className="sheet-head">
        <div className="sheet-kicker">{kicker || 'DKA: One Patient, Five Tables'}</div>
        <h2 className="sheet-title">{title}</h2>
      </header>
      {children}
    </section>
  );
}

function RoleCard({ table }) {
  const info = TABLE_INFO[table.id];
  const sections = PROTOCOL_SECTIONS.filter((s) => info.protocol.includes(s.id));
  return (
    <>
      <Sheet title={`${table.name} Table`} kicker="Role card · front" color={table.color}>
        <p className="sheet-lead">{info.role}</p>
        <div className="sheet-cols">
          <div>
            <h3>Your monitor shows</h3>
            <ul>{info.sees.map((s) => <li key={s}>{s}</li>)}</ul>
          </div>
          <div>
            <h3>Your orders</h3>
            <ul>{info.controls.map((s) => <li key={s}>{s}</li>)}<li>Call the provider with an SBAR</li></ul>
          </div>
        </div>
        <h3>The patient</h3>
        <p>{SCENES[0].report.replace(/ You are working.*$/, '')}</p>
        <h3>Questions your Caller should ask</h3>
        <ul>{info.ask.map((s) => <li key={s}>{s}</li>)}</ul>
        <h3>Jobs (rotate each scene)</h3>
        <table className="sheet-table"><tbody>
          {JOBS.map(([j, d]) => <tr key={j}><td><strong>{j}</strong></td><td>{d}</td><td className="blank">Name:</td></tr>)}
        </tbody></table>
      </Sheet>
      <Sheet title={`${table.name}: Your Protocol Sections`} kicker="Role card · back" color={table.color}>
        <p className="sheet-lead">These are the standing orders your table acts on. The full protocol is on the DKA protocol button on your screen.</p>
        {sections.map((s) => (
          <div key={s.id} className="sheet-protocol big">
            <strong>{s.title}</strong>
            <ul>{s.items.map((i) => <li key={i}>{i}</li>)}</ul>
          </div>
        ))}
      </Sheet>
    </>
  );
}

function ProtocolSheet() {
  return (
    <Sheet title={PROTOCOL_TITLE} kicker="Standing orders" className="compact">
      <p className="sheet-lead">{PROTOCOL_INTRO}</p>
      <div className="sheet-two">
        {PROTOCOL_SECTIONS.map((s) => (
          <div key={s.id} className="sheet-protocol">
            <strong>{s.title}</strong>
            <ul>{s.items.map((i) => <li key={i}>{i}</li>)}</ul>
          </div>
        ))}
      </div>
      <p className="sheet-fine">{PROTOCOL_SOURCE}</p>
    </Sheet>
  );
}

function SbarCard() {
  const rows = [
    ['S: Situation', 'Who you are, which table, and the problem in one sentence.', 'This is the ___ table calling about Jordan Reyes. I am concerned that ___.'],
    ['B: Background', 'Diagnosis, hour of care, what is running now.', '22-year-old with severe DKA, hour ___. Running: ___ fluid at ___ mL/hr, insulin at ___.'],
    ['A: Assessment', 'The numbers that worry you, including numbers from OTHER tables.', 'K⁺ ___, glucose ___, BHB ___, pH ___, ECG ___, GCS ___.'],
    ['R: Recommendation', 'Exactly what you want, and when to recheck.', 'I recommend ___. I will recheck ___ in ___.'],
  ];
  return (
    <Sheet title="Calling the Provider: SBAR" kicker="Call card">
      <p className="sheet-lead">Use this card every time your table calls the provider. Read it out loud. Numbers beat adjectives.</p>
      <table className="sheet-table sbar-table"><tbody>
        {rows.map(([h, d, ex]) => (
          <tr key={h}><td><strong>{h}</strong><div className="small">{d}</div></td><td className="fill">{ex}</td></tr>
        ))}
      </tbody></table>
      <h3>When an order seems unsafe</h3>
      <p>Do not carry it out and do not ignore it. Call back, state what worries you with numbers, and recommend what you think is safe. If you are still concerned, say so again and go up the chain.</p>
    </Sheet>
  );
}

function TermsSheet() {
  return (
    <Sheet title="Key Terms" kicker="Reference">
      <table className="sheet-table"><tbody>
        {KEY_TERMS.map(([t, d]) => <tr key={t}><td><strong>{t}</strong></td><td>{d}</td></tr>)}
      </tbody></table>
    </Sheet>
  );
}

function ExitTicket() {
  return (
    <Sheet title="Exit Ticket" kicker="Name: ______________________________">
      {EXIT_TICKET.map((e, i) => (
        <div key={e.q} className="ticket-q">
          <p><strong>{i + 1}.</strong> {e.q}</p>
          <div className="write-lines" />
        </div>
      ))}
    </Sheet>
  );
}

function AnswerKey() {
  return (
    <Sheet title="Instructor Answer Key" kicker="Do not hand out">
      {SCENE_KEYS.map((s) => (
        <div key={s.title} className="sheet-protocol">
          <strong>{s.title}</strong>
          <p><em>Goal:</em> {s.goal}</p>
          <ul>{s.hours.map(([h, d]) => <li key={h}><strong>{h}:</strong> {d}</li>)}</ul>
          <p><em>Traps:</em> {s.traps}</p>
        </div>
      ))}
      <strong>Exit ticket</strong>
      <ol>{EXIT_TICKET.map((e) => <li key={e.q}>{e.a}</li>)}</ol>
    </Sheet>
  );
}
