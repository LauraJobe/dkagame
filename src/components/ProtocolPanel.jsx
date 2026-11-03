import React from 'react';
import ProtocolView from './ProtocolView.jsx';
import { PROTOCOL_SOURCE } from '../content/protocol.js';

// The DKA/HHS protocol in a pop-up. The blocks a table acts on are marked "your table".
export default function ProtocolPanel({ tableId, onClose }) {
  return (
    <div className="modal-back" role="dialog" aria-modal="true" aria-label="DKA/HHS protocol" onClick={onClose}>
      <div className="protocol" onClick={(e) => e.stopPropagation()}>
        <div className="protocol-head">
          <span className="protocol-kicker">Standing orders</span>
          <button className="btn btn-ghost" onClick={onClose}>Close</button>
        </div>
        <ProtocolView tableId={tableId} />
        <p className="fine">{PROTOCOL_SOURCE}</p>
      </div>
    </div>
  );
}
