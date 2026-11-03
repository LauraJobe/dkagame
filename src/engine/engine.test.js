import { describe, it, expect } from 'vitest';
import { newGame, runBeat, startScene, finishScene, mergeOrders } from './game.js';
import { phFrom, isResolved, correctedNa } from './model.js';

const play = (g, list) => list.reduce((acc, o) => runBeat(acc, { ...acc.orders, ...o }), g);

describe('arrival values', () => {
  it('starts in severe DKA with consistent acid-base math', () => {
    const g = newGame('A');
    expect(g.patient.ph).toBeCloseTo(7.06, 1);
    expect(Math.round(g.patient.ag)).toBe(27);
    expect(phFrom(24, 40)).toBeCloseTo(7.4, 2);
  });
  it('uses the protocol’s Hillier sodium correction', () => {
    expect(correctedNa(131, 512)).toBeCloseTo(140.9, 1);
  });
});

describe('scene 1: potassium', () => {
  it('following the protocol keeps K in range', () => {
    const g = play(newGame('A'), [
      { fluidRate: 1000, insulinUnits: 3.5 },
      { fluidType: 'HALF', fluidRate: 250, kclPerL: 20 },
      { kclPerL: 20 },
    ]);
    expect(g.patient.k).toBeGreaterThanOrEqual(4.0);
    expect(g.allCards.some((c) => c.severity === 'danger')).toBe(false);
    expect(g.status).toBe('sceneEnd');
  });

  it('insulin with K under 3.3 causes ventricular tachycardia', () => {
    const g = play(newGame('B'), [{ fluidRate: 1000, insulinUnits: 3.5 }, {}]);
    expect(g.allCards.map((c) => c.title)).toContain('Ventricular tachycardia');
  });

  it('holding insulin and giving the K bolus raises potassium', () => {
    const g = play(newGame('B'), [{ fluidRate: 1000, kBolus: true }, {}]);
    expect(g.patient.k).toBeGreaterThan(3.3);
  });

  it('protocol-only patient holds insulin when K is under 3.3', () => {
    const g = play(newGame('B'), [{ fluidRate: 1000 }]);
    expect(g.bot.patient.k).toBeGreaterThan(3.2);
  });
});

describe('scene 2: titration and dextrose', () => {
  it('leaving insulin at 7 units/hr with no dextrose causes hypoglycemia', () => {
    let g = startScene(newGame('A'), 1);
    g = play(g, [{}, {}, {}, {}]);
    expect(g.allCards.map((c) => c.title)).toContain('Hypoglycemia');
  });

  it('stage 2 with D5 at 150 keeps glucose safe', () => {
    let g = startScene(newGame('A'), 1);
    g = play(g, [{ insulinUnits: 3.5 }, {}, { fluidRate: 150, dextrose: 5, insulinUnits: 1.4 }, {}]);
    expect(g.patient.glucose).toBeGreaterThan(120);
    expect(g.allCards.some((c) => c.severity === 'danger')).toBe(false);
  });

  it('D50 raises glucose', () => {
    let g = startScene(newGame('A'), 1);
    g = play(g, [{}, {}, {}]);
    const before = g.patient.glucose;
    g = runBeat(g, { ...g.orders, insulinUnits: 0, d50: 25 });
    expect(g.patient.glucose).toBeGreaterThan(before);
  });

  it('stopping the drip early makes ketones rebound', () => {
    let g = startScene(newGame('A'), 1);
    g = play(g, [{ insulinUnits: 3.5 }, {}, { fluidRate: 150, dextrose: 5, insulinUnits: 1.4 }]);
    const before = g.patient.bhb;
    g = runBeat(g, { ...g.orders, insulinUnits: 0 });
    expect(g.patient.bhb).toBeGreaterThan(before);
  });
});

describe('scene 3: transition', () => {
  it('basal overlap prevents rebound', () => {
    let g = startScene(newGame('A'), 2);
    g = play(g, [{}, { basal: true }, {}, { insulinUnits: 0, dextrose: 0 }]);
    expect(isResolved(g.patient)).toBe(true);
  });

  it('no overlap lets DKA rebound', () => {
    let g = startScene(newGame('A'), 2);
    g = play(g, [{}, { insulinUnits: 0, dextrose: 0 }, {}, {}]);
    expect(isResolved(g.patient)).toBe(false);
  });

  it('finishScene stores histories for the debrief', () => {
    let g = startScene(newGame('A'), 2);
    g = play(g, [{}, {}, {}, {}]);
    g = finishScene(g);
    expect(g.results[0].history.length).toBe(5);
    expect(g.results[0].botHistory.length).toBe(5);
  });
});

describe('orders', () => {
  it('approval-only orders need provider approval', () => {
    expect(mergeOrders({}, { metabolic: { insulinBolus: true } }, {}).insulinBolus).toBe(false);
    expect(mergeOrders({}, { metabolic: { insulinBolus: true } }, { insulinBolus: true }).insulinBolus).toBe(true);
  });

  it('a table cannot set another table’s orders', () => {
    const m = mergeOrders({ insulinUnits: 0 }, { cardio: { insulinUnits: 7, fluidRate: 500 } }, {});
    expect(m.insulinUnits).toBe(0);
    expect(m.fluidRate).toBe(500);
  });

  it('intubation crashes the pH', () => {
    let g = newGame('A');
    g = runBeat(g, { ...g.orders, fluidRate: 1000, insulinUnits: 3.5, intubate: true });
    expect(g.patient.ph).toBeLessThan(7.0);
  });
});
