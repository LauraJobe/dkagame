// The order controls each table sees. kind: select | toggle | action (one-time) | approval (provider must approve).
export const ORDER_SPEC = {
  cardio: [
    {
      key: 'fluidType', label: 'IV fluid', kind: 'select',
      options: [
        { value: 'LR', label: "Lactated Ringer's (LR)" },
        { value: 'NS', label: '0.9% NaCl' },
        { value: 'HALF', label: '0.45% NaCl' },
      ],
    },
    {
      key: 'fluidRate', label: 'Rate', kind: 'select',
      options: [0, 125, 250, 500, 1000].map((v) => ({ value: v, label: v === 0 ? 'Off / KVO' : `${v} mL/hr` })),
    },
  ],
  renal: [
    {
      key: 'kclPerL', label: 'KCl added to IV fluids', kind: 'select',
      options: [0, 20, 30, 40].map((v) => ({ value: v, label: v === 0 ? 'None' : `${v} mEq/L` })),
    },
    { key: 'kRider', label: 'KCl 10 mEq/hr IV rider', kind: 'toggle' },
    { key: 'phosRepl', label: 'Give phosphate replacement', kind: 'action' },
    { key: 'bmpNow', label: 'Stat BMP', kind: 'action' },
  ],
  metabolic: [
    {
      key: 'insulinRate', label: 'Insulin infusion (regular)', kind: 'select',
      options: [
        { value: 0, label: 'Off' },
        { value: 0.05, label: '0.05 units/kg/hr (3.5 units/hr)' },
        { value: 0.1, label: '0.1 units/kg/hr (7 units/hr)' },
        { value: 0.14, label: '0.14 units/kg/hr (10 units/hr)' },
      ],
    },
    {
      key: 'dextrose', label: 'Dextrose added to IV fluids', kind: 'select',
      options: [
        { value: 0, label: 'None' },
        { value: 5, label: 'D5' },
        { value: 10, label: 'D10' },
      ],
    },
    { key: 'basal', label: 'Give basal insulin (glargine) subQ', kind: 'action' },
    { key: 'bhbNow', label: 'Stat beta-hydroxybutyrate', kind: 'action' },
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

export const ORDER_LABELS = Object.fromEntries(
  Object.values(ORDER_SPEC).flat().map((o) => [o.key, o.label]),
);
