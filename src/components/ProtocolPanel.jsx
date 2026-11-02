import React from 'react';
import { PROTOCOL_TITLE, PROTOCOL_INTRO, PROTOCOL_SECTIONS, PROTOCOL_SOURCE } from '../content/protocol.js';

// The DKA standing orders. When a tableId is given, that table's sections come first and are marked.
export default function ProtocolPanel({ tableId, onClose, dark = false }) {
  const sections = tableId
    ? [...PROTOCOL_SECTIONS].sort((a, b) => Number(b.tables.includes(tableId)) - Number(a.tables.includes(tableId)))
    : PROTOCOL_SECTIONS;
  return (
    <div className="modal-back" role="dialog" aria-modal="true" aria-label="DKA protocol" onClick={onClose}>
      <div className={`protocol ${dark ? 'dark' : ''}`} onClick={(e) => e.stopPropagation()}>
        <div className="protocol-head">
          <h3>{PROTOCOL_TITLE}</h3>
          <button className="btn btn-ghost" onClick={onClose}>Close</button>
        </div>
        <p className="protocol-intro">{PROTOCOL_INTRO}</p>
        {sections.map((s) => {
          const yours = tableId && s.tables.includes(tableId);
          return (
            <section key={s.id} className={`protocol-section ${yours ? 'yours' : ''}`}>
              <h4>
                {s.title}
                {yours && <span className="yours-tag">your table</span>}
              </h4>
              <ul>
                {s.items.map((i) => <li key={i}>{i}</li>)}
              </ul>
            </section>
          );
        })}
        <p className="fine">{PROTOCOL_SOURCE}</p>
      </div>
    </div>
  );
}
