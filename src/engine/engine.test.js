import { describe, it, expect } from 'vitest';
import { newGame, runBeat, startScene, finishScene, mergeOrders } from './game.js';
import { phFrom, isResolved, correctedNa } from './model.js';

const play = (g, list) => list.reduce((acc, o) => runBeat(acc, { ...acc.orders, ...o }), g);

describe('arrival values', () => {
  it('starts in severe DKA with consistent acid-base math', () => {
    const g = newGame();
    expect(g.patient.ph).toBeCloseTo(7.06, 1);
    expect(Math.round(g.patient.ag)).toBe(27);
    expect(phFrom(24, 40)).toBeCloseTo(7.4, 2);
  });
  it('uses the protocol’s Hillier sodium correction', () => {
    expect(correctedNa(131, 512)).toBeCloseTo(140.9, 1);
  });
});

describe('scene 1: potassium', () => {
  it('arrives with K+ that allows insulin, which falls under 3.3 by the 2-hour lab', () => {
    const g0 = newGame();
    expect(g0.patient.k).toBeGreaterThanOrEqual(3.3);
    const g = play(g0, [{ fluidRate: 1000, insulinUnits: 3.5 }, { fluidType: 'HALF', fluidRate: 250, kclPerL: 40 }]);
    expect(g.labs.bmp.k).toBeLessThan(3.3);
  });

  it('holding insulin with the K bolus raises potassium slowly', () => {
    let g = play(newGame(), [{ fluidRate: 1000, insulinUnits: 3.5 }, { fluidType: 'HALF', fluidRate: 250, kclPerL: 40 }]);
    const before = g.patient.k;
    g = runBeat(g, { ...g.orders, insulinUnits: 0, kBolus: true });
    expect(g.patient.k).toBeGreaterThan(before);
    expect(g.patient.k - before).toBeLessThan(0.3);
    expect(g.patient.kBolusLeft).toBe(4);
    expect(g.allCards.map((c) => c.title)).not.toContain('Insulin ran with K\u207a under 3.3');
  });

  it('running insulin after a K+ under 3.3 is flagged and costs points', () => {
    let g = play(newGame(), [{ fluidRate: 1000, insulinUnits: 3.5 }, { fluidType: 'HALF', fluidRate: 250, kclPerL: 40 }]);
    const held = runBeat(g, { ...g.orders, insulinUnits: 0, kBolus: true });
    const kept = runBeat(g, { ...g.orders });
    expect(kept.allCards.map((c) => c.title)).toContain('Insulin ran with K\u207a under 3.3');
    expect(kept.lastScore.total).toBeLessThan(held.lastScore.total);
  });

  it('no potassium replacement brings PVCs', () => {
    const g = play(newGame(), [{ fluidRate: 1000, insulinUnits: 3.5 }, { fluidType: 'HALF', fluidRate: 250 }, {}]);
    expect(g.patient.k).toBeLessThan(2.8);
  });
});

describe('scene 2: titration and dextrose', () => {
  it('leaving insulin at 7 units/hr with no dextrose causes hypoglycemia', () => {
    let g = startScene(newGame(), 1);
    g = play(g, [{}, {}, {}]);
    expect(g.allCards.map((c) => c.title)).toContain('Hypoglycemia');
  });

  it('halving, then Stage 2 with D5 at 150, keeps glucose safe', () => {
    let g = startScene(newGame(), 1);
    g = play(g, [{}, { insulinUnits: 3.5 }, { fluidRate: 150, dextrose: 5, insulinUnits: 1.4 }]);
    expect(g.patient.glucose).toBeGreaterThan(120);
    expect(g.allCards.some((c) => c.severity === 'danger')).toBe(false);
  });

  it('the provider order arrives after hour 6', () => {
    let g = startScene(newGame(), 1);
    g = play(g, [{}, {}]);
    expect(g.cards.map((c) => c.title)).toContain('New provider order');
  });

  it('D50 raises glucose', () => {
    let g = startScene(newGame(), 1);
    g = play(g, [{}, {}]);
    const before = g.patient.glucose;
    g = runBeat(g, { ...g.orders, insulinUnits: 0, d50: 25 });
    expect(g.patient.glucose).toBeGreaterThan(before);
  });

  it('stopping the drip on the provider order makes ketones rebound', () => {
    let g = startScene(newGame(), 1);
    g = play(g, [{}, { insulinUnits: 3.5 }]);
    const before = g.patient.bhb;
    g = runBeat(g, { ...g.orders, insulinUnits: 0 });
    expect(g.patient.bhb).toBeGreaterThan(before);
  });
});

describe('scene 3: transition', () => {
  it('resolves by the gap and bicarbonate definition', () => {
    let g = startScene(newGame(), 2);
    g = play(g, [{}]);
    expect(isResolved(g.patient)).toBe(true);
    expect(g.patient.na - g.patient.cl - g.patient.hco3).toBeLessThan(12);
    expect(g.patient.hco3).toBeGreaterThan(18);
  });

  it('basal overlap keeps it resolved', () => {
    let g = startScene(newGame(), 2);
    g = play(g, [{}, { basal: true }, { insulinUnits: 0, dextrose: 0 }]);
    expect(isResolved(g.patient)).toBe(true);
  });

  it('no overlap lets DKA return', () => {
    let g = startScene(newGame(), 2);
    g = play(g, [{ insulinUnits: 0, dextrose: 0 }, {}, {}]);
    expect(isResolved(g.patient)).toBe(false);
  });

  it('finishScene stores histories for the debrief', () => {
    let g = startScene(newGame(), 2);
    g = play(g, [{}, {}, {}]);
    g = finishScene(g);
    expect(g.results[0].history.length).toBe(4);
    expect(g.results[0].botHistory.length).toBe(4);
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
    let g = newGame();
    g = runBeat(g, { ...g.orders, fluidRate: 1000, insulinUnits: 3.5, intubate: true });
    expect(g.patient.ph).toBeLessThan(7.0);
  });
});
