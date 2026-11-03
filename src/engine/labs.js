import { osmFrom, correctedNa } from './model.js';

const r1 = (v) => Math.round(v * 10) / 10;

export function drawBmp(p) {
  return {
    hour: p.hour,
    na: Math.round(p.na),
    k: r1(p.k),
    cl: Math.round(p.cl),
    hco3: r1(p.hco3),
    bun: Math.round(p.bun),
    cr: Math.round(p.cr * 100) / 100,
    phos: r1(p.phos),
    glucose: Math.round(p.glucose),
    ag: Math.round(p.na - p.cl - p.hco3),
    osm: Math.round(osmFrom(p.na, p.glucose, p.bun)),
    correctedNa: Math.round(correctedNa(p.na, p.glucose)),
  };
}

export function drawBhb(p) {
  return { hour: p.hour, value: r1(p.bhb) };
}

export function drawGas(p) {
  return { hour: p.hour, ph: Math.round(p.ph * 100) / 100, paco2: Math.round(p.paco2), hco3: r1(p.hco3) };
}

export function drawPoc(p) {
  return { hour: p.hour, value: Math.round(p.glucose) };
}

export function admitLabs(p) {
  return { bmp: drawBmp(p), bhb: drawBhb(p), gas: drawGas(p), poc: drawPoc(p), pocPrev: null };
}

// Class lab schedule: POC glucose hourly, BMP and BHB every 2 hours or stat, gas only when ordered.
export function updateClassLabs(labs, p, o) {
  const next = { ...labs, pocPrev: labs.poc, poc: drawPoc(p) };
  if (p.hour % 2 === 0 || o.bmpNow) next.bmp = drawBmp(p);
  if (p.hour % 2 === 0 || o.bhbNow) next.bhb = drawBhb(p);
  if (o.gasNow) next.gas = drawGas(p);
  return next;
}

// Protocol-only schedule (the protocol's monitoring parameters): POC glucose hourly,
// potassium/BMP every 2 hours, BHB and gas every 4 hours. Never a stat draw.
export function updateBotLabs(labs, p, startHour) {
  const since = p.hour - startHour;
  const next = { ...labs, pocPrev: labs.poc, poc: drawPoc(p) };
  if (since % 2 === 0) next.bmp = drawBmp(p);
  if (since % 4 === 0) {
    next.bhb = drawBhb(p);
    next.gas = drawGas(p);
  }
  return next;
}
