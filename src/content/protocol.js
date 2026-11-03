// The DKA/HHS Treatment Protocol used in the game (from the course's clinical protocol).
// Each block lists the tables that act on it. Row types:
//   banner: one full-width line   head: column headings   row: table cells   cols: side-by-side bullet columns
export const PROTOCOL_TITLE = 'DKA/HHS Treatment Protocol';

export const PROTOCOL_INTRO = [
  'Complete initial evaluation, confirming hyperglycemia and ketonemia/ketonuria.',
  'Draw all initial labs and start NS bolus of 1–2 liters before transitioning to fluids listed below.',
];

export const PROTOCOL_BLOCKS = [
  {
    id: 'fluids',
    title: 'IV Fluids',
    color: '#3f7fc8',
    tint: '#dce9f8',
    tables: ['cardio', 'renal', 'metabolic'],
    rows: [
      { type: 'banner', text: 'PROVIDE RESUSCITATIVE FLUIDS AS NEEDED FOR SEVERE HYPOVOLEMIA OR SHOCK', style: 'em' },
      { type: 'banner', text: 'Evaluate corrected serum sodium. Corrected sodium (Hillier, 1999) = measured sodium + 0.024 × (serum glucose − 100)' },
      { type: 'banner', text: 'Run fluid at 250 mL/hr based on hydration status and serum potassium', strong: '250 mL/hr' },
      { type: 'head', cells: ['Potassium level', 'Serum sodium high or normal (>132 mmol/L)', 'Serum sodium low (<132 mmol/L)'] },
      { type: 'row', cells: ['K⁺ > 5.3', '0.45% NaCl', '0.9% NaCl'] },
      { type: 'row', cells: ['K⁺ = 4.0–5.3', '0.45% NaCl w/ 20 mEq K⁺', '0.9% NaCl w/ 20 mEq K⁺'] },
      { type: 'row', cells: ['K⁺ < 4.0', '0.45% NaCl w/ 40 mEq K⁺', '0.9% NaCl w/ 40 mEq K⁺'] },
      { type: 'banner', text: 'When serum glucose reaches 200 mg/dL for DKA or 300 mg/dL for HHS for 2 consecutive readings, inform physician and transition to fluid with dextrose to run at 150 mL/hr. Choose based on most recent sodium and potassium level.', strong: '150 mL/hr' },
      { type: 'head', cells: ['Potassium level', 'Serum sodium high or normal (>132 mmol/L)', 'Serum sodium low (<132 mmol/L)'] },
      { type: 'row', cells: ['K⁺ > 5.3', 'Dextrose 5%–0.45% NaCl', 'Dextrose 5%–0.9% NaCl'] },
      { type: 'row', cells: ['K⁺ = 4.0–5.3', 'Dextrose 5%–0.45% NaCl w/ 20 mEq K⁺', 'Dextrose 5%–0.9% NaCl w/ 20 mEq K⁺'] },
      { type: 'row', cells: ['K⁺ < 4.0', 'Dextrose 5%–0.45% NaCl w/ 40 mEq K⁺', 'Dextrose 5%–0.9% NaCl w/ 40 mEq K⁺'] },
    ],
  },
  {
    id: 'potassium',
    title: 'Potassium',
    color: '#8a74c6',
    tint: '#e6e0f5',
    tables: ['renal', 'metabolic', 'cardio'],
    rows: [
      { type: 'banner', text: 'If potassium is <3.3, HOLD insulin and give 40 mEq K⁺ as bolus every 4 hours until K⁺ >3.3', strong: 'HOLD insulin' },
      { type: 'banner', text: 'Monitor serum potassium every 2 hours while on insulin infusion' },
      { type: 'banner', text: 'Notify physician if potassium falls <4.0 mEq/L' },
      { type: 'banner', text: 'If potassium falls despite using fluid with potassium, call provider and consider additional potassium bolus. Note that this will result in potassium running at >10 mEq/hr.' },
    ],
  },
  {
    id: 'insulin',
    title: 'IV Regular Insulin (Stage 1)',
    note: '*use adjusted body weight if >130% of IBW',
    color: '#2b3442',
    tint: '#e3e6eb',
    tables: ['metabolic'],
    rows: [
      { type: 'banner', text: '0.1 units/kg IV bolus if ordered by provider', style: 'em' },
      { type: 'banner', text: 'Begin continuous IV infusion at 0.05 units/kg/hr and check blood glucose hourly. Adjust per following until glucose reaches 200 mg/dL for DKA or 300 mg/dL for HHS:' },
      { type: 'head', cells: ['Glucose level', 'Intervention'] },
      { type: 'row', cells: ['Decreased by <50 mg/dL or increased at all', 'Double infusion rate up to max of 20 units/hr'] },
      { type: 'row', cells: ['Decreased by 50–75 mg/dL', 'Continue current rate'] },
      { type: 'row', cells: ['Decreased by >75 mg/dL', 'Decrease rate by 50%'] },
    ],
  },
  {
    id: 'insulin2',
    title: 'IV Regular Insulin (Stage 2)',
    color: '#2b3442',
    tint: '#e3e6eb',
    tables: ['metabolic'],
    rows: [
      {
        type: 'cols',
        cols: [
          {
            head: 'DKA',
            lead: 'After 2 consecutive BG of < 200 mg/dL',
            items: [
              'Reduce infusion to 0.02 units/kg/hr',
              'Titrate up or down by 0.01 units/kg/hr as needed to a max of 0.05 units/kg/hr',
              'Goal to maintain serum glucose between 150 and 200 mg/dL until DKA resolves.',
              'If BG increases to >250 mg/dL with insulin at max of 0.05 units/kg/hr, contact physician and consider insulin bolus of up to 0.05 units/kg',
            ],
          },
          {
            head: 'HHS',
            lead: 'After 2 consecutive BG of < 300 mg/dL',
            items: [
              'Reduce infusion to 0.02 units/kg/hr',
              'Titrate up or down by 0.01 units/kg/hr as needed to a max of 0.05 units/kg/hr',
              'Goal to maintain serum glucose between 250 and 300 mg/dL and patient is mentally alert.',
              'If BG increases to >350 mg/dL with insulin at max of 0.05 units/kg/hr, contact physician and consider insulin bolus of up to 0.05 units/kg',
            ],
          },
        ],
      },
      { type: 'banner', text: 'After resolution of DKA or HHS and when patient is able to eat, initiate SC insulin regimen.' },
      { type: 'banner', text: 'To transfer from IV to SC continue IV insulin infusion for 1–2 hours after SC insulin begins.', strong: 'continue IV insulin infusion for 1–2 hours after SC insulin begins' },
      { type: 'banner', text: 'In insulin naïve patients, start at 0.5–0.8 units/kg per day' },
    ],
  },
  {
    id: 'hypo',
    title: 'Management of Hypoglycemia',
    color: '#c9504c',
    tint: '#f6dcdb',
    tables: ['metabolic', 'neuro'],
    rows: [
      {
        type: 'cols',
        cols: [
          {
            head: 'Blood glucose < 50 mg/dL',
            items: ['D/C insulin infusion', 'Give 25 g (1 amp) D50W IV', 'Recheck BG q15min until >90, then q1h until >140', 'Once BG >140, wait 30 minutes and restart drip at 50% most recent rate'],
          },
          {
            head: 'Blood glucose 50–74 mg/dL',
            items: ['D/C insulin infusion', 'Administer 12.5 g (½ amp) D50W IV', 'Recheck BG q15min until >90, then q1h until >140', 'Once BG >140, wait 30 minutes and restart drip at 50% most recent rate'],
          },
          {
            head: 'Blood glucose 75–99 mg/dL',
            items: ['D/C insulin infusion', 'Recheck BG q15min until >90, then q1h until >140', 'Once BG >140, wait 30 minutes and restart drip at 75% most recent rate'],
          },
        ],
      },
      { type: 'banner', text: '***This hypoglycemia management protocol is to be used only with patients in DKA/HHS***', style: 'em' },
    ],
  },
  {
    id: 'monitoring',
    title: 'Monitoring Parameters',
    color: '#6fa83a',
    tint: '#e3efd6',
    tables: ['cardio', 'resp', 'renal', 'metabolic', 'neuro'],
    rows: [
      {
        type: 'cols',
        cols: [
          { head: 'Blood glucose', items: ['Hourly POC BG tests until resolution of DKA/HHS, then POC BG every 2 hours until insulin drip discontinued', '*If POC reads “HI”, send serum glucose*'] },
          { head: 'Potassium', items: ['Every 2 hours while on insulin drip'] },
        ],
      },
    ],
  },
];

// Course additions used by the game; shown apart from the hospital protocol.
export const COURSE_NOTES = {
  title: 'For this game (Jordan Reyes, 70 kg)',
  tables: ['cardio', 'resp', 'renal', 'metabolic', 'neuro'],
  items: [
    'Insulin doses for 70 kg: 0.1 units/kg bolus = 7 units; 0.05 units/kg/hr = 3.5 units/hr; 0.02 units/kg/hr = 1.4 units/hr; 0.01 units/kg/hr = 0.7 units/hr.',
    'Corrected sodium is calculated for you with every BMP and shown on the Cardiovascular and Renal monitors. The BMP is drawn every 2 hours.',
    'DKA resolved when the anion gap is under 12 AND serum bicarbonate is over 18.',
    'Provider order required: insulin bolus, sodium bicarbonate (only if pH under 7.0), intubation, mannitol, phosphate replacement, and any change outside this protocol.',
    'Neuro checks every hour with head of bed 30°. Report any drop in GCS or new headache.',
  ],
};

export const PROTOCOL_SOURCE = 'Hospital DKA/HHS Treatment Protocol, reproduced for classroom simulation.';
