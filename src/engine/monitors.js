// Build what each table is allowed to see. Live values update every beat;
// lab values carry the hour they were drawn so tables can tell when they are stale.
const r1 = (v) => Math.round(v * 10) / 10;

export function buildMonitors(game) {
  const p = game.patient;
  const L = game.labs;
  const hour = p.hour;
  const lab = (label, value, unit, drawn) => ({ label, value, unit, drawn, kind: 'lab' });
  const live = (label, value, unit, tone) => ({ label, value, unit, kind: 'live', tone: tone || null });

  const cardio = [
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
    lab('Cl⁻', L.bmp.cl, 'mEq/L', L.bmp.hour),
    lab('BUN', L.bmp.bun, 'mg/dL', L.bmp.hour),
    lab('Creatinine', L.bmp.cr, 'mg/dL', L.bmp.hour),
    lab('Phosphate', L.bmp.phos, 'mg/dL', L.bmp.hour),
  ];

  const metabolic = [
    live('POC glucose', L.poc.value, 'mg/dL', L.poc.value < 70 || L.poc.value > 250 ? 'warn' : null),
    live('Last hour', L.pocPrev ? L.pocPrev.value : '—', 'mg/dL'),
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

  return { cardio, resp, renal, metabolic, neuro, hour };
}
