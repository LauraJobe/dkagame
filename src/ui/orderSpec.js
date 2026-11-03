// The order controls each table sees.
// kind: select | toggle | action (one-time this hour) | approval (provider must approve) | insulin | call
export const ORDER_SPEC = {
  cardio: [
    {
      key: 'fluidType', label: 'IV fluid (NaCl)', kind: 'select',
      options: [
        { value: 'NS', label: '0.9% NaCl' },
        { value: 'HALF', label: '0.45% NaCl' },
      ],
      note: 'Corrected Na⁺ over 132: 0.45%. Under 132: 0.9%.',
    },
    {
      key: 'fluidRate', label: 'Rate', kind: 'select',
      options: [
        { value: 0, label: 'Off / KVO' },
        { value: 150, label: '150 mL/hr (with dextrose)' },
        { value: 250, label: '250 mL/hr' },
        { value: 500, label: '500 mL/hr' },
        { value: 1000, label: '1,000 mL/hr (bolus)' },
      ],
    },
  ],
  renal: [
    {
      key: 'kclPerL', label: 'K⁺ added to the IV fluid', kind: 'select',
      options: [0, 20, 40].map((v) => ({ value: v, label: v === 0 ? 'None' : `${v} mEq per liter` })),
      note: 'K⁺ over 5.3: none. 4.0–5.3: 20. Under 4.0: 40.',
    },
    { key: 'kBolus', label: 'Potassium bolus 40 mEq (runs over 4 hours)', kind: 'action' },
    { key: 'bmpNow', label: 'Stat BMP', kind: 'action' },
    { key: 'phosRepl', label: 'Phosphate replacement', kind: 'approval' },
  ],
  metabolic: [
    { key: 'insulinUnits', label: 'Regular insulin infusion', kind: 'insulin' },
    {
      key: 'dextrose', label: 'Dextrose added to the NaCl', kind: 'select',
      options: [
        { value: 0, label: 'None' },
        { value: 5, label: 'Dextrose 5%' },
      ],
      note: 'After 2 readings under 200: add dextrose and run at 150 mL/hr (tell Cardiovascular).',
    },
    {
      key: 'd50', label: 'D50W IV push this hour', kind: 'select',
      options: [
        { value: 0, label: 'None' },
        { value: 12.5, label: '12.5 g (½ amp)' },
        { value: 25, label: '25 g (1 amp)' },
      ],
    },
    { key: 'basal', label: 'Give basal insulin (glargine) subQ', kind: 'action' },
    { key: 'bhbNow', label: 'Stat beta-hydroxybutyrate', kind: 'action' },
    { key: 'insulinBolus', label: 'Insulin bolus 0.1 units/kg (7 units)', kind: 'approval' },
    { key: 'bicarb', label: 'Sodium bicarbonate IV', kind: 'approval' },
  ],
  resp: [
    { key: 'gasNow', label: 'Draw VBG/ABG now', kind: 'action' },
    { key: 'o2', label: 'Supplemental O₂', kind: 'toggle' },
    { key: 'intubate', label: 'Intubate', kind: 'approval' },
  ],
  neuro: [
    { key: 'neuroChecks', label: 'Neuro checks every hour', kind: 'toggle' },
    { key: 'hob', label: 'HOB 30°', kind: 'toggle' },
    { key: 'mannitol', label: 'Mannitol IV', kind: 'approval' },
  ],
};

// Every table can call the provider with an SBAR (no direct effect on the patient).
const CALL = { key: 'call', label: 'Call the provider (SBAR)', kind: 'call' };
for (const list of Object.values(ORDER_SPEC)) list.push(CALL);

export const ORDER_LABELS = Object.fromEntries(
  Object.values(ORDER_SPEC).flat().map((o) => [o.key, o.label]),
);

// The bag name, as the protocol writes it.
export function bagName(o) {
  const nacl = o.fluidType === 'HALF' ? '0.45% NaCl' : '0.9% NaCl';
  const base = o.dextrose ? `Dextrose 5%–${nacl}` : nacl;
  return `${base}${o.kclPerL ? ` w/ ${o.kclPerL} mEq K⁺` : ''}`;
}
