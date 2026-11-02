import React, { useEffect, useState } from 'react';
import { get } from 'firebase/database';
import { ensureSignedIn } from '../firebase.js';
import { roomRef } from '../room.js';
import { TABLES } from '../engine/game.js';

export default function Join({ initialCode }) {
  const [code, setCode] = useState((initialCode || '').toUpperCase());
  const [room, setRoom] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    ensureSignedIn().catch(() => setError('Could not connect. Check the internet connection.'));
  }, []);

  async function findRoom(e) {
    e?.preventDefault();
    setError('');
    const c = code.trim().toUpperCase();
    if (c.length !== 4) {
      setError('Room codes are 4 characters.');
      return;
    }
    setBusy(true);
    try {
      await ensureSignedIn();
      const snap = await get(roomRef(c));
      if (!snap.exists()) {
        setError('No room with that code. Check the projector.');
        setRoom(null);
      } else {
        setRoom({ code: c, tables: snap.val().tables || {} });
      }
    } catch (err) {
      setError('Could not reach the room. Try again.');
    }
    setBusy(false);
  }

  return (
    <div className="home">
      <div className="home-card">
        <div className="eyebrow">Join</div>
        {!room ? (
          <form onSubmit={findRoom}>
            <h1>Enter the room code</h1>
            <input
              className="code-input"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 4))}
              placeholder="ABCD"
              autoFocus
              aria-label="Room code"
            />
            <button className="btn btn-primary btn-lg" disabled={busy}>Find room</button>
          </form>
        ) : (
          <>
            <h1>Room {room.code}: pick your table</h1>
            <div className="table-pick">
              {TABLES.map((t) => {
                const taken = room.tables?.[t.id]?.joinedAt;
                return (
                  <a key={t.id} className="table-choice" style={{ '--tc': t.color }} href={`#/t/${room.code}/${t.id}`}>
                    <span className="dot" />
                    <span>{t.name}</span>
                    {taken && <span className="taken">joined</span>}
                  </a>
                );
              })}
            </div>
            <p className="fine">One device per table. If a device drops, rejoin the same table here.</p>
          </>
        )}
        {error && <p className="error">{error}</p>}
      </div>
    </div>
  );
}
