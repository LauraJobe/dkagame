// DKA physiology engine. Pure functions only: no React, no Firebase.
// One beat = one hour of patient time. Effect sizes are teaching approximations
// of typical adult DKA response (see the DKA Game clinical spec), not exact physiology.

export const WEIGHT_KG = 70;

export const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const round = (v, d = 0) => {
  const m = 10 ** d;
  return Math.round(v * m) / m;
};

export function phFrom(hco3, paco2) {
  return 6.1 + Math.log10(Math.max(hco3, 0.5) / (0.03 * Math.max(paco2, 5)));
}

export function osmFrom(na, glucose, bun) {
  return 2 * na + glucose / 18 + bun / 2.8;
}

// Hillier (1999), as in the protocol: measured Na + 0.024 x (glucose - 100).
export function correctedNa(na, glucose) {
  return na + 0.024 * (glucose - 100);
}

// Insulin in units/hr for a 70 kg patient. 7 units/hr = 0.1 units/kg/hr.
export const unitsToPerKg = (u) => (u || 0) / WEIGHT_KG;

export const DEFAULT_ORDERS = {
  // Cardiovascular
  fluidType: 'NS', // 'NS' (0.9% NaCl) | 'HALF' (0.45% NaCl)
  fluidRate: 250, // mL/hr: 0, 150, 250, 500, 1000 (1000 = bolus)
  // Renal & Fluids
  kclPerL: 0, // mEq/L of K+ added to the running fluid: 0, 20, 40
  kBolus: false, // one-time: 40 mEq K+ bolus, runs 10 mEq/hr for 4 hours
  phosRepl: false, // one-time, provider approval required
  // Metabolic
  insulinUnits: 0, // regular insulin infusion, units/hr (0 to 20)
  insulinBolus: false, // one-time 0.1 units/kg (7 units), provider approval required
  dextrose: 0, // 0 or 5: dextrose 5% added to the running NaCl
  d50: 0, // one-time D50W in grams: 0, 12.5, 25
  basal: false, // one-time: subcutaneous basal insulin
  bicarb: false, // one-time, provider approval required
  // Respiratory
  gasNow: false, // one-time: VBG/ABG now
  o2: false,
  intubate: false, // one-time, provider approval required
  // Neuro
  neuroChecks: true,
  hob: true,
  mannitol: false, // one-time, provider approval required
  // Any table
  bmpNow: false, // one-time stat BMP
  bhbNow: false, // one-time stat beta-hydroxybutyrate
};

export const ONE_TIME_ORDERS = ['kBolus', 'phosRepl', 'insulinBolus', 'd50', 'basal', 'bicarb', 'gasNow', 'intubate', 'mannitol', 'bmpNow', 'bhbNow'];
export const APPROVAL_ORDERS = ['insulinBolus', 'phosRepl', 'bicarb', 'intubate', 'mannitol'];

export function ecgFor(k, hr) {
  const rhythm = hr > 100 ? 'Sinus tachycardia' : 'Normal sinus rhythm';
  if (k <= 2.3) return 'Ventricular tachycardia';
  if (k < 2.6) return `${rhythm}, runs of PVCs, prominent U waves`;
  if (k < 3.0) return `${rhythm}, U waves, occasional PVCs`;
  if (k < 3.5) return `${rhythm}, flattened T waves`;
  if (k < 5.5) return rhythm;
  if (k < 6.5) return `${rhythm}, peaked T waves`;
  return 'Wide QRS, peaked T waves';
}

// Build a full patient state from a scene preset.
export function makePatient(p) {
  const s = {
    hour: p.hour,
    deficitL: p.deficitL,
    glucose: p.glucose,
    bhb: p.bhb,
    hco3: p.hco3,
    paco2: p.paco2,
    k: p.k,
    na: p.na,
    cl: p.cl,
    bun: p.bun,
    cr: p.cr,
    phos: p.phos,
    gcs: p.gcs,
    temp: p.temp ?? 38.1,
    bicarbBoost: 0,
    bicarbParadox: 0,
    edemaRisk: 0,
    intubated: false,
    basalHour: p.basalHour ?? null,
    dripWasOn: p.dripWasOn ?? false,
    dripOnLast: p.dripWasOn ?? false,
    kBolusLeft: 0,
    totalIn: p.totalIn ?? 0,
    totalOut: p.totalOut ?? 0,
    safetyEvents: [],
    osmDrop: 0,
    glucoseDrop: 0,
  };
  return derive(s, null);
}

// Compute the dependent values (vitals, pH, labs-as-truth) from core state.
function derive(s, prev) {
  s.ph = phFrom(s.hco3, s.paco2);
  s.ag = s.na - s.cl - s.hco3;
  s.osm = osmFrom(s.na, s.glucose, s.bun);
  s.correctedNa = correctedNa(s.na, s.glucose);
  const d = s.deficitL;
  s.map = clamp(95 - 7 * d, 35, 100);
  s.sbp = Math.round(s.map + 25);
  s.dbp = Math.round(s.map - 13);
  let hr = 80 + 12 * Math.max(d, 0) + (s.temp - 37) * 4;
  if (s.glucose < 70) hr += 15;
  if (s.k < 2.6) hr += 10;
  s.hr = clamp(hr, 50, 170);
  s.capRefill = d > 3 ? 4 : d > 1.5 ? 3 : 2;
  s.uo = clamp(140 - 30 * d, 5, 200) + (s.glucose > 300 && d < 3 ? 40 : 0);
  s.rr = s.intubated ? 14 : clamp(Math.round(14 + (40 - s.paco2) * 0.9), 10, 40);
  s.breathing = s.intubated ? 'Ventilated' : s.ph < 7.25 ? 'Deep, rapid (Kussmaul)' : s.rr > 22 ? 'Rapid' : 'Even, unlabored';
  s.lungs = d < -1.0 ? 'Crackles in both bases' : 'Clear';
  s.spo2 = clamp(98 - (d < -1.0 ? Math.round((-1.0 - d) * 4) : 0), 82, 100);
  s.breathOdor = s.bhb > 1.5 ? 'Fruity (ketones)' : 'None';
  s.ecg = ecgFor(s.k, s.hr);
  s.headache = s.edemaRisk >= 2 ? 'Severe, worsening' : s.ph < 7.2 ? 'Mild' : 'None';
  s.mentalStatus = s.gcs >= 15 ? 'Alert, oriented' : s.gcs >= 13 ? 'Drowsy, follows commands' : s.gcs >= 10 ? 'Lethargic, confused' : 'Obtunded';
  s.skin = s.glucose < 70 ? 'Diaphoretic' : d > 2.5 ? 'Dry mucous membranes' : 'Warm, dry';
  s.pupils = s.edemaRisk >= 3 ? 'Sluggish' : 'PERRLA';
  if (prev) {
    s.osmDrop = prev.osm - s.osm;
  }
  return s;
}

// Advance one beat (one hour). `o` = merged orders from all tables.
// Returns { patient, events } where events are cards to show.
export function step(prev, o) {
  const s = { ...prev, safetyEvents: [] };
  const events = [];
  s.hour = prev.hour + 1;
  const rateL = (o.fluidRate || 0) / 1000;

  // ---- insulin ----
  const units = o.insulinUnits ?? (o.insulinRate || 0) * WEIGHT_KG;
  const dripOn = units > 0;
  // Basal insulin takes 1-2 hours to cover: partial at 1 hour, full at 2.
  const basalAge = s.basalHour == null ? -1 : s.hour - s.basalHour;
  const basalEff = basalAge >= 2 ? 0.45 : basalAge >= 1 ? 0.25 : 0;
  const basalActive = basalEff > 0;
  // effF 1 = 0.1 units/kg/hr (7 units/hr). A 0.1 units/kg bolus adds about an hour of that.
  const effF = (dripOn ? units / 7 : basalEff) + (o.insulinBolus ? 1 : 0);
  if (dripOn) s.dripWasOn = true;
  s.dripOnLast = dripOn;
  if (o.basal && s.basalHour == null) s.basalHour = prev.hour;

  // ---- volume ----
  const losses = prev.uo / 1000 + 0.05;
  s.deficitL = prev.deficitL - rateL + losses;
  s.totalIn = (prev.totalIn || 0) + (o.fluidRate || 0);
  s.totalOut = (prev.totalOut || 0) + Math.round(prev.uo);

  // ---- glucose ----
  let dG = 0;
  if (prev.glucose > 200) dG -= rateL * 30; // dilution
  if (prev.uo > 50 && prev.glucose > 250) dG -= 12; // renal glucose loss
  if (effF === 0) dG += 15; // unopposed counter-regulatory hormones
  dG -= 60 * effF * (prev.glucose > 100 ? 1 : 0.5);
  const dexGrams = (o.dextrose || 0) * 10 * rateL;
  dG += dexGrams * 3.6;
  dG += (Number(o.d50) || 0) * 4; // D50W: 25 g raises glucose about 100 mg/dL
  s.glucose = clamp(prev.glucose + dG, 20, 900);
  s.glucoseDrop = prev.glucose - s.glucose;

  // ---- ketones ----
  const glucoseAvailable = prev.glucose >= 120 || (o.dextrose || 0) > 0;
  const dB = effF > 0 ? -0.9 * effF * (glucoseAvailable ? 1 : 0.6) : 0.5;
  s.bhb = clamp(prev.bhb + dB, 0.2, 9);

  // ---- chloride / sodium ----
  const clPerL = o.fluidType === 'NS' ? 2.5 : o.fluidType === 'LR' ? 0.3 : -0.5;
  s.cl = clamp(prev.cl + clPerL * rateL, 85, 122);
  let dNa = -2.4 * (dG / 100);
  if (o.fluidType === 'HALF') dNa -= 1.2 * rateL;
  if (o.fluidType === 'NS' && prev.na < 145) dNa += 0.4 * rateL;
  s.na = clamp(prev.na + dNa, 115, 165);

  // ---- bicarbonate / gas ----
  s.bicarbBoost = prev.bicarbBoost * 0.5;
  s.bicarbParadox = Math.max(0, prev.bicarbParadox - 1);
  if (o.bicarb) {
    s.bicarbBoost += 4;
    if (prev.ph >= 7.0) s.bicarbParadox = 2;
  }
  const hco3Target = 24 - 2.6 * s.bhb - Math.max(0, s.cl - 106) * 0.8 + s.bicarbBoost;
  s.hco3 = clamp(prev.hco3 + 0.6 * (hco3Target - prev.hco3), 2, 32);
  if (o.intubate && !prev.intubated) {
    s.intubated = true;
    events.push(card('resp', 'danger', 'Intubated',
      'Jordan is now on the ventilator at a standard rate. The deep breathing that was blowing off CO₂ to buffer the acid is gone.'));
  }
  s.intubated = s.intubated || prev.intubated;
  if (s.intubated) {
    s.paco2 = 40;
  } else {
    const paTarget = 1.5 * s.hco3 + 8 + 2 + (prev.phos < 1.0 ? 3 : 0);
    s.paco2 = prev.paco2 + 0.6 * (paTarget - prev.paco2);
  }
  s.ph = phFrom(s.hco3, s.paco2);

  // ---- potassium ----
  const acidF = clamp((7.4 - prev.ph) / 0.3, 0.25, 1);
  let dK = -0.75 * effF * acidF; // insulin drives K into cells
  dK -= 0.12 * rateL; // dilution
  if (prev.uo > 50) dK -= 0.12; // urinary loss
  s.kBolusLeft = o.kBolus ? 4 : Math.max(0, (prev.kBolusLeft || 0) - 1);
  const bolusRunning = o.kBolus || (prev.kBolusLeft || 0) > 0;
  const mEq = (o.kclPerL || 0) * rateL + (bolusRunning ? 10 : 0) + (o.kRider ? 10 : 0);
  dK += mEq * 0.028;
  if (o.bicarb) dK -= 0.5;
  if (s.ph < prev.ph - 0.05) dK += 0.3; // worsening acidosis shifts K out
  s.k = clamp(prev.k + dK, 1.6, 8);

  // ---- renal ----
  if (s.deficitL < 2) {
    s.bun = prev.bun - (prev.bun - 14) * 0.12;
    s.cr = prev.cr - (prev.cr - 0.9) * 0.12;
  } else {
    s.bun = prev.bun + 0.5;
    s.cr = prev.cr + 0.02;
  }
  let dP = -0.25 * (dripOn ? Math.min(effF, 2) : 0) + (o.phosRepl ? 0.8 : 0) - (prev.uo > 50 ? 0.05 : 0);
  s.phos = clamp(prev.phos + dP, 0.3, 6);

  // ---- neuro ----
  const osmNow = osmFrom(s.na, s.glucose, s.bun);
  const osmDrop = prev.osm - osmNow;
  if (osmDrop > 3) s.edemaRisk = prev.edemaRisk + 1;
  else s.edemaRisk = Math.max(0, prev.edemaRisk - 0.5);
  if (o.mannitol) s.edemaRisk = 0;
  let gcsTarget = s.ph < 7.1 ? 13 : s.ph < 7.2 ? 14 : 15;
  if (s.glucose < 45) gcsTarget -= 5;
  else if (s.glucose < 70) gcsTarget -= 2;
  if (s.edemaRisk >= 2) gcsTarget -= 2;
  if (s.edemaRisk >= 3) gcsTarget -= 3;
  if (s.bicarbParadox > 0) gcsTarget -= 1;
  s.gcs = gcsTarget < prev.gcs ? gcsTarget : Math.min(gcsTarget, prev.gcs + 1);
  s.gcs = clamp(s.gcs, 3, 15);
  s.temp = Math.max(37.0, prev.temp - 0.2);

  derive(s, prev);

  // ---- safety event cards ----
  if (s.k <= 2.3) safety(s, events, 'cardio', 'Ventricular tachycardia',
    `The monitor alarms: wide-complex tachycardia. Serum K⁺ is ${s.k.toFixed(1)}. Insulin kept driving potassium into the cells.`);
  else if (s.k < 2.6 && prev.k >= 2.6) events.push(card('cardio', 'warn', 'Frequent PVCs',
    'The rhythm strip shows runs of PVCs and prominent U waves.'));
  if (s.k >= 6.5 && prev.k < 6.5) safety(s, events, 'cardio', 'Wide QRS',
    `QRS widening on the monitor. K⁺ is ${s.k.toFixed(1)}.`);
  if (s.glucose < 45 && prev.glucose >= 45) safety(s, events, 'neuro', 'Hypoglycemic seizure',
    `Jordan has a generalized seizure. POC glucose ${Math.round(s.glucose)} mg/dL.`);
  else if (s.glucose < 75 && prev.glucose >= 75) safety(s, events, 'neuro', 'Hypoglycemia',
    `Jordan is sweaty, shaky, and confused. POC glucose ${Math.round(s.glucose)} mg/dL. Follow the hypoglycemia section of the protocol.`);
  if (s.edemaRisk >= 3 && prev.edemaRisk < 3) safety(s, events, 'neuro', 'Cerebral edema signs',
    'Severe headache, GCS falling, pupils sluggish. Osmolality has dropped too fast for several hours.');
  else if (s.edemaRisk >= 2 && prev.edemaRisk < 2) events.push(card('neuro', 'warn', 'Headache worsening',
    'Jordan says the headache is getting worse and seems harder to wake.'));
  if (s.ph < 6.95 && prev.ph >= 6.95) safety(s, events, 'resp', 'Cardiac arrest',
    `pH ${s.ph.toFixed(2)}. Jordan goes into PEA arrest. Code called.`);
  if (s.lungs !== 'Clear' && prev.lungs === 'Clear') events.push(card('resp', 'warn', 'New crackles',
    'Crackles in both bases and SpO₂ drifting down. Is the fluid still needed?'));
  if (s.bicarbParadox === 2) events.push(card('neuro', 'warn', 'Mental status dipped',
    'After the bicarbonate push, Jordan is more confused.'));
  if (mEq > 20) events.push(card('renal', 'warn', 'Potassium infusing too fast',
    `Potassium is running at ${Math.round(mEq)} mEq/hr. The protocol requires a provider call before potassium runs above 10 mEq/hr with a bolus.`));
  const dripWasRunning = prev.dripOnLast ?? prev.dripWasOn;
  // A hold for low K+ or low glucose is the protocol, not a missed overlap.
  if (dripWasRunning && !dripOn && basalEff < 0.45 && prev.k >= 3.3 && prev.glucose >= 100) {
    events.push(card('metabolic', 'warn', 'Drip off, no basal coverage',
      'The insulin drip stopped while ketones are still present and basal insulin is not yet covering.'));
  }

  return { patient: s, events };
}

function card(table, severity, title, text) {
  return { table, severity, title, text };
}

function safety(s, events, table, title, text) {
  s.safetyEvents = [...(s.safetyEvents || []), title];
  events.push(card(table, 'danger', title, text));
}

// ---- resolution ----
// Course definition: anion gap under 12 and serum bicarbonate over 18.
export function isResolved(p) {
  return p.na - p.cl - p.hco3 < 12 && p.hco3 > 18;
}

// ---- scoring ----
function band(v, green, yellow) {
  if (green(v)) return 2;
  if (yellow(v)) return 1;
  return 0;
}

export function scoreBeat(p, prev) {
  const g = {};
  g.cardio = [
    band(p.map, (v) => v >= 65, (v) => v >= 60),
    band(p.hr, (v) => v >= 60 && v <= 110, (v) => v > 110 && v <= 130),
  ];
  const expectedCo2 = 1.5 * p.hco3 + 8;
  g.resp = [
    band(p.rr, (v) => v >= 12 && v <= 24, (v) => v > 24 && v <= 32),
    band(Math.abs(p.paco2 - expectedCo2), (v) => v <= 4, (v) => v <= 8),
  ];
  g.renal = [
    band(p.k, (v) => v >= 4.0 && v <= 5.0, (v) => (v >= 3.5 && v < 4.0) || (v > 5.0 && v <= 5.5)),
    band(p.uo, (v) => v >= 50, (v) => v >= 30),
  ];
  const drop = prev ? prev.glucose - p.glucose : 0;
  let glu;
  if (p.glucose < 75) glu = 0;
  else if (p.glucose >= 150 && p.glucose <= 200) glu = 2; // stage 2 goal
  else if (p.glucose > 200 && drop >= 45 && drop <= 90) glu = 2; // stage 1: falling about 50-75 an hour
  else glu = 1;
  const bhbDelta = prev ? p.bhb - prev.bhb : 0;
  const ket = p.bhb < 0.6 || bhbDelta < -0.2 ? 2 : bhbDelta <= 0.05 ? 1 : 0;
  g.metabolic = [glu, ket];
  const gcsDelta = prev ? p.gcs - prev.gcs : 0;
  const osmDrop = prev ? prev.osm - p.osm : 0;
  g.neuro = [
    p.gcs >= 15 || gcsDelta > 0 ? 2 : gcsDelta === 0 ? 1 : 0,
    band(osmDrop, (v) => v <= 3, (v) => v <= 5),
  ];
  let total = Object.values(g).reduce((a, arr) => a + arr[0] + arr[1], 0);
  const penalty = (p.safetyEvents || []).length * 5;
  return { gauges: g, total: Math.max(0, total - penalty), penalty };
}

// Snapshot used for debrief graphs.
export function snapshot(p, score) {
  return {
    hour: p.hour,
    glucose: Math.round(p.glucose),
    k: round(p.k, 1),
    bhb: round(p.bhb, 1),
    ph: round(p.ph, 2),
    hco3: round(p.hco3, 1),
    ag: Math.round(p.ag),
    map: Math.round(p.map),
    gcs: p.gcs,
    osm: Math.round(p.osm),
    uo: Math.round(p.uo),
    score: score ? score.total : null,
  };
}
