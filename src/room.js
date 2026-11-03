import { ref, set, update, get, query, orderByChild, endAt, remove, onValue } from 'firebase/database';
import { db } from './firebase.js';
import { buildMonitors, tableStatus } from './engine/monitors.js';
import { TABLES, ordersForTable, SCENES } from './engine/game.js';

const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const DAY_MS = 24 * 60 * 60 * 1000;

export function makeCode() {
  let c = '';
  for (let i = 0; i < 4; i++) c += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  return c;
}

export const roomRef = (code, path = '') => ref(db, `rooms/${code}${path ? '/' + path : ''}`);

// Rooms delete themselves after 24 hours: each new host removes expired rooms.
export async function cleanupOldRooms() {
  try {
    const q = query(ref(db, 'rooms'), orderByChild('createdAt'), endAt(Date.now() - DAY_MS));
    const snap = await get(q);
    const jobs = [];
    snap.forEach((child) => {
      jobs.push(remove(child.ref));
    });
    await Promise.all(jobs);
  } catch (e) {
    console.warn('Room cleanup skipped', e);
  }
}

export function metaFor(game) {
  const scene = SCENES[game.sceneIdx];
  return {
    status: game.status,
    sceneIdx: game.sceneIdx,
    sceneTitle: scene.title,
    sceneHours: scene.hours,
    report: scene.report,
    beat: game.beat,
    beats: scene.beats,
    hour: game.patient.hour,
    variant: game.variant,
    cards: game.cards || [],
    status5: tableStatus(game.lastScore && game.beat > 0 ? game.lastScore : null),
    clock: game.clock || null,
  };
}

// Everything the host publishes after a change in game state.
export function publishPayload(game, { resetTables = false } = {}) {
  const mon = buildMonitors(game);
  const anim = mon.anim;
  delete mon.anim;
  const payload = {
    meta: metaFor(game),
    monitors: mon,
    anim,
    engine: JSON.stringify(game),
  };
  for (const t of TABLES) {
    payload[`tables/${t.id}/ready`] = false;
    if (resetTables) {
      payload[`tables/${t.id}/orders`] = ordersForTable(game.orders, t.id);
      payload[`tables/${t.id}/requests`] = null;
    }
  }
  return payload;
}

export async function createRoom(uid, game) {
  await cleanupOldRooms();
  for (let tries = 0; tries < 5; tries++) {
    const code = makeCode();
    const existing = await get(roomRef(code));
    if (existing.exists()) continue;
    const base = { hostUid: uid, createdAt: Date.now() };
    await set(roomRef(code), base);
    await update(roomRef(code), publishPayload(game, { resetTables: true }));
    return code;
  }
  throw new Error('Could not create a room code. Try again.');
}

export function publish(code, game, opts) {
  return update(roomRef(code), publishPayload(game, opts));
}

export function listen(code, path, cb) {
  return onValue(roomRef(code, path), (snap) => cb(snap.val()));
}

export { update, set, get };

// Firebase's estimate of (server time - this device's time), so every screen counts down together.
let serverOffset = 0;
export function watchServerOffset() {
  try {
    return onValue(ref(db, '.info/serverTimeOffset'), (snap) => {
      serverOffset = Number(snap.val()) || 0;
    });
  } catch {
    return () => {};
  }
}
export const serverNow = () => Date.now() + serverOffset;
