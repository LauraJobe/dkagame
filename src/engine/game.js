import { makePatient, step, scoreBeat, snapshot, DEFAULT_ORDERS, ONE_TIME_ORDERS, APPROVAL_ORDERS, isResolved } from './model.js';
import { SCENES } from './scenes.js';
import { admitLabs, updateClassLabs, updateBotLabs } from './labs.js';
import { botOrders } from './bot.js';

export const TABLES = [
  { id: 'cardio', name: 'Cardiovascular', color: '#c2410c' },
  { id: 'resp', name: 'Respiratory', color: '#0369a1' },
  { id: 'renal', name: 'Renal & Fluids', color: '#a16207' },
  { id: 'metabolic', name: 'Metabolic', color: '#7c3aed' },
  { id: 'neuro', name: 'Neuro', color: '#047857' },
];

// Which table controls which order keys.
export const OWNERSHIP = {
  cardio: ['fluidType', 'fluidRate'],
  renal: ['kclPerL', 'kRider', 'phosRepl', 'bmpNow'],
  metabolic: ['insulinRate', 'dextrose', 'basal', 'bicarb', 'bhbNow'],
  resp: ['gasNow', 'o2', 'intubate'],
  neuro: ['neuroChecks', 'hob', 'mannitol'],
};

export function ordersForTable(orders, tableId) {
  const out = {};
  for (const key of OWNERSHIP[tableId]) out[key] = orders[key];
  return out;
}

// Merge each table's submitted orders onto the running orders.
// Approval-only orders take effect only if the provider (instructor) approved them.
export function mergeOrders(running, tableOrders = {}, approvals = {}) {
  const merged = { ...running };
  for (const t of Object.keys(OWNERSHIP)) {
    const sub = tableOrders[t];
    if (!sub) continue;
    for (const key of OWNERSHIP[t]) {
      if (sub[key] === undefined) continue;
      if (APPROVAL_ORDERS.includes(key)) {
        merged[key] = Boolean(sub[key] && approvals[key]);
      } else {
        merged[key] = sub[key];
      }
    }
  }
  return merged;
}

export function newGame(variant = 'A') {
  return startScene({ variant, sceneIdx: 0, results: [] }, 0);
}

export function startScene(game, sceneIdx) {
  const scene = SCENES[sceneIdx];
  const patient = makePatient(scene.preset(game.variant));
  const botPatient = makePatient(scene.preset(game.variant));
  const first = snapshot(patient, null);
  return {
    ...game,
    sceneIdx,
    beat: 0,
    status: 'ordering',
    patient,
    labs: admitLabs(patient),
    orders: { ...scene.orders },
    history: [first],
    orderLog: [],
    cards: [],
    allCards: [],
    resolvedAtHour: null,
    bot: {
      patient: botPatient,
      labs: admitLabs(botPatient),
      orders: { ...scene.orders },
      history: [snapshot(botPatient, null)],
      resolvedAtHour: null,
    },
  };
}

function clearOneTime(o) {
  const out = { ...o };
  for (const k of ONE_TIME_ORDERS) out[k] = false;
  return out;
}

export function runBeat(game, orders) {
  const scene = SCENES[game.sceneIdx];
  const startHour = scene.preset(game.variant).hour;

  // Class patient
  const { patient, events } = step(game.patient, orders);
  const score = scoreBeat(patient, game.patient);
  const labs = updateClassLabs(game.labs, patient, orders);
  const beat = game.beat + 1;
  const cards = [...events];
  const scripted = scene.cards?.[beat];
  if (scripted) cards.push(scripted(patient));
  const resolvedAtHour = game.resolvedAtHour ?? (isResolved(patient) ? patient.hour : null);

  // Protocol-only patient
  const bo = botOrders(game.bot.labs, game.bot.orders, game.bot.patient.hour, startHour);
  const botStep = step(game.bot.patient, bo);
  const botScore = scoreBeat(botStep.patient, game.bot.patient);
  const botLabs = updateBotLabs(game.bot.labs, botStep.patient, startHour);

  const done = beat >= scene.beats;
  const stamped = cards.map((c, i) => ({ ...c, hour: patient.hour, id: `${patient.hour}-${i}` }));
  return {
    ...game,
    beat,
    status: done ? 'sceneEnd' : 'ordering',
    patient,
    labs,
    orders: clearOneTime(orders),
    history: [...game.history, snapshot(patient, score)],
    orderLog: [...game.orderLog, { hour: game.patient.hour, orders }],
    lastScore: score,
    cards: stamped,
    allCards: [...game.allCards, ...stamped],
    resolvedAtHour,
    bot: {
      patient: botStep.patient,
      labs: botLabs,
      orders: clearOneTime({ ...bo, basalGivenHour: bo.basalGivenHour }),
      history: [...game.bot.history, snapshot(botStep.patient, botScore)],
      resolvedAtHour: game.bot.resolvedAtHour ?? (isResolved(botStep.patient) ? botStep.patient.hour : null),
    },
  };
}

// Close the scene: store its histories for the debrief.
export function finishScene(game) {
  const scene = SCENES[game.sceneIdx];
  const total = (h) => h.reduce((a, s) => a + (s.score ?? 0), 0);
  const result = {
    sceneIdx: game.sceneIdx,
    title: scene.title,
    history: game.history,
    botHistory: game.bot.history,
    classTotal: total(game.history),
    botTotal: total(game.bot.history),
    cards: game.allCards,
    resolvedAtHour: game.resolvedAtHour,
    botResolvedAtHour: game.bot.resolvedAtHour,
  };
  const results = [...(game.results || []).filter((r) => r.sceneIdx !== game.sceneIdx), result];
  return { ...game, results, status: 'sceneDone' };
}

export { SCENES, DEFAULT_ORDERS };
