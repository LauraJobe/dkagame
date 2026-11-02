import { describe, it, expect } from 'vitest';
import { newGame, runBeat, startScene, finishScene, mergeOrders } from './game.js';
import { phFrom, isResolved } from './model.js';

const play = (g, list) => list.reduce((acc, o) => runBeat(acc, { ...acc.orders, ...o }), g);

describe('arrival values', () => {
  it('starts in severe DKA with consistent acid-base math', () => {
    const g = newGame('A');
    expect(g.patient.ph).toBeCloseTo(7.06, 1);
    expect(Math.round(g.patient.ag)).toBe(27);
    expect(Math.round(g.patient.osm)).toBe(302);
    expect(phFrom(24, 40)).toBeCloseTo(7.4, 2);
  });
});

describe('scene 1: potassium', () => {
  it('correct sequence keeps K in range', () => {
    const g = play(newGame('A'), [
      { fluidType: 'LR', fluidRate: 1000, insulinRate: 0.1 },
      { fluidRate: 1000, kclPerL: 20 },
      { fluidRate: 500, kclPerL: 20 },
    ]);
    expect(g.patient.k).toBeGreaterThanOrEqual(4.0);
    expect(g.allCards.some((c) => c.severity === 'danger')).toBe(false);
    expect(g.status).toBe('sceneEnd');
  });

  it('insulin with K under 3.5 causes ventricular tachycardia', () => {
    const g = play(newGame('B'), [
      { fluidType: 'LR', fluidRate: 1000, insulinRate: 0.1 },
      { fluidRate: 1000 },
    ]);
    expect(g.allCards.map((c) => c.title)).toContain('Ventricular tachycardia');
  });

  it('protocol-only patient holds insulin when K is under 3.5', () => {
    const g = play(newGame('B'), [{ fluidType: 'LR', fluidRate: 1000 }]);
    expect(g.bot.patient.k).toBeGreaterThan(3.2);
  });
});

describe('scene 2: dextrose and the drip', () => {
  it('no dextrose leads to hypoglycemia', () => {
    let g = startScene(newGame('A'), 1);
    g = play(g, [{}, {}, {}, {}]);
    expect(g.allCards.map((c) => c.title)).toContain('Hypoglycemia');
  });

  it('adding dextrose keeps glucose in range', () => {
    let g = startScene(newGame('A'), 1);
    g = play(g, [{}, { dextrose: 5 }, { dextrose: 5 }, { dextrose: 5 }]);
    expect(g.patient.glucose).toBeGreaterThan(120);
    expect(g.allCards.some((c) => c.severity === 'danger')).toBe(false);
  });

  it('stopping the drip early makes ketones rebound', () => {
    let g = startScene(newGame('A'), 1);
    g = play(g, [{}, { dextrose: 5 }, { dextrose: 5 }]);
    const before = g.patient.bhb;
    g = runBeat(g, { ...g.orders, insulinRate: 0 });
    expect(g.patient.bhb).toBeGreaterThan(before);
  });
});

describe('scene 3: transition', () => {
  it('basal overlap prevents rebound', () => {
    let g = startScene(newGame('A'), 2);
    g = play(g, [{ basal: true }, {}, { insulinRate: 0 }, { insulinRate: 0 }]);
    expect(isResolved(g.patient)).toBe(true);
  });

  it('no overlap lets DKA rebound', () => {
    let g = startScene(newGame('A'), 2);
    g = play(g, [{}, { insulinRate: 0 }, { insulinRate: 0 }, { insulinRate: 0 }]);
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
    const m1 = mergeOrders({}, { metabolic: { bicarb: true } }, {});
    expect(m1.bicarb).toBe(false);
    const m2 = mergeOrders({}, { metabolic: { bicarb: true } }, { bicarb: true });
    expect(m2.bicarb).toBe(true);
  });

  it('a table cannot set another table’s orders', () => {
    const m = mergeOrders({ insulinRate: 0 }, { cardio: { insulinRate: 0.1, fluidRate: 500 } }, {});
    expect(m.insulinRate).toBe(0);
    expect(m.fluidRate).toBe(500);
  });

  it('intubation crashes the pH', () => {
    let g = newGame('A');
    g = runBeat(g, { ...g.orders, fluidType: 'LR', fluidRate: 1000, insulinRate: 0.1, intubate: true });
    expect(g.patient.ph).toBeLessThan(7.0);
  });
});
