import React from 'react';
import { PROTOCOL_TITLE, PROTOCOL_INTRO, PROTOCOL_BLOCKS, COURSE_NOTES } from '../content/protocol.js';

// Renders the DKA/HHS protocol as banded tables, like the hospital sheet.
// tableId marks the blocks that table acts on; only = show just those blocks.
function Emph({ text, strong }) {
  if (!strong || !text.includes(strong)) return text;
  const [a, b] = text.split(strong);
  return <>{a}<strong>{strong}</strong>{b}</>;
}

function Block({ block, yours }) {
  const cols = block.rows.find((r) => r.type === 'head')?.cells.length || 1;
  return (
    <section className={`pblock ${yours ? 'yours' : ''}`} style={{ '--pc': block.color, '--pt': block.tint }}>
      <div className="pblock-title">
        <span>{block.title}</span>
        {block.note && <em>{block.note}</em>}
        {yours && <span className="yours-tag">your table</span>}
      </div>
      <table className="ptable">
        <tbody>
          {block.rows.map((r, i) => {
            if (r.type === 'banner') {
              return (
                <tr key={i}><td colSpan={cols} className={`pbanner ${r.style === 'em' ? 'em' : ''}`}><Emph text={r.text} strong={r.strong} /></td></tr>
              );
            }
            if (r.type === 'head') return <tr key={i} className="phead">{r.cells.map((c) => <th key={c}>{c}</th>)}</tr>;
            if (r.type === 'row') return <tr key={i}>{r.cells.map((c, j) => <td key={j} className={j === 0 ? 'pfirst' : ''}>{c}</td>)}</tr>;
            if (r.type === 'cols') {
              return (
                <tr key={i}>
                  <td colSpan={cols} className="pcols-cell">
                    <div className="pcols" style={{ gridTemplateColumns: `repeat(${r.cols.length}, 1fr)` }}>
                      {r.cols.map((c) => (
                        <div key={c.head} className="pcol">
                          <div className="pcol-head">{c.head}</div>
                          {c.lead && <div className="pcol-lead">{c.lead}</div>}
                          <ul>{c.items.map((it) => <li key={it}>{it}</li>)}</ul>
                        </div>
                      ))}
                    </div>
                  </td>
                </tr>
              );
            }
            return null;
          })}
        </tbody>
      </table>
    </section>
  );
}

export default function ProtocolView({ tableId, only = false, ids = null, notes = true }) {
  const blocks = PROTOCOL_BLOCKS.filter((b) => (ids ? ids.includes(b.id) : !only || !tableId || b.tables.includes(tableId)));
  return (
    <div className="protocol-view">
      <h3 className="ptitle">{PROTOCOL_TITLE}</h3>
      {PROTOCOL_INTRO.map((t) => <p key={t} className="pintro">{t}</p>)}
      {blocks.map((b) => <Block key={b.id} block={b} yours={Boolean(tableId) && b.tables.includes(tableId)} />)}
      {notes && (
        <section className="pblock notes" style={{ '--pc': '#5f6b66', '--pt': '#eef1ef' }}>
          <div className="pblock-title"><span>{COURSE_NOTES.title}</span></div>
          <ul className="pnotes">{COURSE_NOTES.items.map((i) => <li key={i}>{i}</li>)}</ul>
        </section>
      )}
    </div>
  );
}
