import React, { useEffect, useState } from 'react';
import { serverNow, watchServerOffset } from '../room.js';

// Counts down to the end of the hour from meta.clock: { deadline, paused, remaining, hold }.
export function useCountdown(clock) {
  const [now, setNow] = useState(serverNow());
  useEffect(() => watchServerOffset(), []);
  useEffect(() => {
    const t = setInterval(() => setNow(serverNow()), 250);
    return () => clearInterval(t);
  }, []);
  if (!clock) return null;
  const ms = clock.paused ? clock.remaining || 0 : Math.max(0, (clock.deadline || 0) - now);
  return { ms, paused: Boolean(clock.paused), hold: Boolean(clock.hold) };
}

export const mmss = (ms) => {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

export default function Countdown({ clock, label = 'Orders lock in', className = '' }) {
  const c = useCountdown(clock);
  if (!c) return null;
  const soon = !c.paused && c.ms <= 15000;
  return (
    <span className={`countdown ${soon ? 'soon' : ''} ${c.paused ? 'paused' : ''} ${className}`} role="timer" aria-live="off">
      {c.paused ? 'Clock paused' : c.ms === 0 && c.hold ? 'Waiting on the provider' : `${label} ${mmss(c.ms)}`}
    </span>
  );
}
