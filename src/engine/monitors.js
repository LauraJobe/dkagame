// Build what each table is allowed to see. Live values update every beat;
// lab values carry the hour they were drawn so tables can tell when they are stale.
import { bagName } from '../ui/orderSpec.js';

const r1 = (v) => Math.round(v * 10) / 10;

export function ecgPattern(k) {
  if (k <= 2.3) return 'vt';
  if (k < 2.6) return 'pvcs';
  if (k < 3.0) return 'uWaves';
  if (k < 3.5) return 'flatT';
  if (k < 5.5) return 'normal';
  if (k < 6.5) return 'peaked';
  return 'wide';
}

// Values for each table's animated picture: only what that table can see or controls.
export function buildAnimations(game) {
  const p = game.patient;
  const L = game.labs;
  const o = game.orders || {};
  return {
    cardio: { hr: Math.round(p.hr), map: Math.round(p.map), ecg: ecgPattern(p.k), fluidRate: o.fluidRate || 0, fluidType: o.fluidType || 'NS' },
    resp: { rr: p.rr, kussmaul: p.ph < 7.25 && !p.intubated, crackles: p.lungs !== 'Clear', spo2: p.spo2, ventilated: Boolean(p.intubated) },
    renal: { uo: Math.round(p.uo), k: L.bmp.k, shifting: (o.insulinUnits || 0) > 0, kclIn: (o.kclPerL || 0) > 0 || (p.kBolusLeft || 0) > 0 },
    metabolic: { glucose: L.poc.value, insulin: (o.insulinUnits || 0) / 70, dextrose: o.dextrose || 0, bhb: L.bhb.value },
    neuro: { gcs: p.gcs, pressure: p.edemaRisk >= 3 ? 2 : p.edemaRisk >= 2 ? 1 : 0, sweaty: p.glucose < 70, headache: p.headache !== 'None' },
    // What is hanging on the IV pole (projector).
    iv: {
      nacl: o.fluidType === 'HALF' ? '0.45% NaCl' : '0.9% NaCl',
      dextrose: Boolean(o.dextrose),
      kcl: o.kclPerL || 0,
      rate: o.fluidRate || 0,
      insulin: o.insulinUnits || 0,
      kBolus: (p.kBolusLeft || 0) > 0,
      basal: p.basalHour != null,
    },
  };
}

// Overall status per table for the projector picture (green 2, yellow 1, red 0 per gauge).
export function tableStatus(score) {
  if (!score) return null;
  const out = {};
  for (const [t, g] of Object.entries(score.gauges)) {
    const sum = g[0] + g[1];
    out[t] = sum >= 4 ? 'green' : sum >= 2 ? 'yellow' : 'red';
  }
  return out;
}

export function buildMonitors(game) {
  const p = game.patient;
  const L = game.labs;
  const hour = p.hour;
  const lab = (label, value, unit, drawn) => ({ label, value, unit, drawn, kind: 'lab' });
  const live = (label, value, unit, tone) => ({ label, value, unit, kind: 'live', tone: tone || null });

  const o = game.orders || {};
  // The BMP is drawn every 2 hours on even hours; corrected sodium comes calculated with it.
  const nextBmp = hour % 2 === 0 ? hour + 2 : hour + 1;
  const cNa = lab('Corrected Na⁺', L.bmp.correctedNa, 'mEq/L', L.bmp.hour);
  const cardio = [
    live('IV running', `${bagName(o)} at ${o.fluidRate || 0} mL/hr`, ''),
    cNa,
    live('Heart rate', Math.round(p.hr), 'bpm', p.hr > 110 ? 'warn' : null),
    live('Blood pressure', `${p.sbp}/${p.dbp}`, 'mmHg'),
    live('MAP', Math.round(p.map), 'mmHg', p.map < 65 ? 'warn' : null),
    live('Cap refill', p.capRefill, 'sec', p.capRefill > 2 ? 'warn' : null),
    live('Temp', r1(p.temp), '°C'),
    live('ECG', p.ecg, '', p.ecg !== 'Normal sinus rhythm' && p.ecg !== 'Sinus tachycardia' ? 'warn' : null),
  ];

  const resp = [
    live('Resp rate', p.rr, '/min', p.rr > 24 ? 'warn' : null),
    live('Breathing', p.breathing, ''),
    live('SpO₂', p.spo2, '%', p.spo2 < 94 ? 'warn' : null),
    live('Lung sounds', p.lungs, '', p.lungs !== 'Clear' ? 'warn' : null),
    live('Breath odor', p.breathOdor, ''),
    lab('pH', L.gas.ph.toFixed(2), '', L.gas.hour),
    lab('PaCO₂', L.gas.paco2, 'mmHg', L.gas.hour),
    lab('HCO₃⁻ (gas)', L.gas.hco3, 'mEq/L', L.gas.hour),
  ];

  const renal = [
    live('Urine output', Math.round(p.uo), 'mL/hr', p.uo < 50 ? 'warn' : null),
    live('Intake total', p.totalIn, 'mL'),
    live('Output total', p.totalOut, 'mL'),
    lab('K⁺', L.bmp.k, 'mEq/L', L.bmp.hour),
    lab('Na⁺', L.bmp.na, 'mEq/L', L.bmp.hour),
    cNa,
    live('Next BMP', `hour ${nextBmp}`, ''),
    lab('Cl⁻', L.bmp.cl, 'mEq/L', L.bmp.hour),
    lab('BUN', L.bmp.bun, 'mg/dL', L.bmp.hour),
    lab('Creatinine', L.bmp.cr, 'mg/dL', L.bmp.hour),
    lab('Phosphate', L.bmp.phos, 'mg/dL', L.bmp.hour),
  ];

  const metabolic = [
    live('Next BMP', `hour ${nextBmp}`, ''),
    live('POC glucose', L.poc.value, 'mg/dL', L.poc.value < 70 || L.poc.value > 250 ? 'warn' : null),
    live('Last hour', L.pocPrev ? L.pocPrev.value : '—', 'mg/dL'),
    live('Change this hour', L.pocPrev ? `${L.poc.value - L.pocPrev.value > 0 ? '+' : ''}${L.poc.value - L.pocPrev.value}` : '—', 'mg/dL'),
    lab('Beta-hydroxybutyrate', L.bhb.value, 'mmol/L', L.bhb.hour),
    lab('HCO₃⁻ (BMP)', L.bmp.hco3, 'mEq/L', L.bmp.hour),
    lab('Anion gap', L.bmp.ag, '', L.bmp.hour),
    lab('pH', L.gas.ph.toFixed(2), '', L.gas.hour),
  ];

  const neuro = [
    live('GCS', p.gcs, '/15', p.gcs < 15 ? 'warn' : null),
    live('Mental status', p.mentalStatus, ''),
    live('Headache', p.headache, '', p.headache === 'Severe, worsening' ? 'warn' : null),
    live('Pupils', p.pupils, '', p.pupils !== 'PERRLA' ? 'warn' : null),
    live('Skin', p.skin, ''),
    lab('Serum osmolality', L.bmp.osm, 'mOsm/kg', L.bmp.hour),
  ];

  return { cardio, resp, renal, metabolic, neuro, hour, anim: buildAnimations(game) };
}
