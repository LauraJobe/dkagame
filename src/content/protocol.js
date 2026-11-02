// Nurse-driven adult DKA protocol used in the game.
// Based on the 2024 adult hyperglycemic crises consensus (ADA/EASD/JBDS/AACE/DTS),
// simplified for teaching. Each section lists the tables that act on it.
export const PROTOCOL_TITLE = 'Adult DKA Protocol: Nurse-Driven Standing Orders';

export const PROTOCOL_INTRO =
  'Use for adults with DKA: glucose 200 mg/dL or higher (or known diabetes), beta-hydroxybutyrate 3.0 mmol/L or higher, ' +
  'and pH under 7.3 and/or bicarbonate under 18 mEq/L. Patient weight for this protocol: 70 kg.';

export const PROTOCOL_SECTIONS = [
  {
    id: 'fluids',
    title: '1. IV fluids',
    tables: ['cardio'],
    items: [
      "Start Lactated Ringer's (preferred) or 0.9% NaCl at 500–1,000 mL/hr for the first 2–4 hours.",
      'Then 250–500 mL/hr, guided by blood pressure, heart rate, urine output, and lung sounds.',
      'Use 0.45% NaCl only if the corrected sodium is normal or high.',
      'Corrected Na⁺ = measured Na⁺ + 1.6 × (glucose − 100) ÷ 100.',
      'Slow the rate and call the provider for new crackles or falling SpO₂.',
    ],
  },
  {
    id: 'potassium',
    title: '2. Potassium (check before insulin)',
    tables: ['renal', 'metabolic', 'cardio'],
    items: [
      'K⁺ under 3.5: HOLD insulin. Give KCl 10 mEq/hr IV rider. Recheck before starting insulin.',
      'K⁺ 3.5 to 5.0: add KCl 20–30 mEq per liter of IV fluid. Goal K⁺ 4.0–5.0.',
      'K⁺ over 5.0: no potassium. Recheck in 2 hours.',
      'Add potassium only if urine output is at least 50 mL/hr.',
      'Maximum peripheral potassium rate: 10–20 mEq/hr total.',
      'Continuous cardiac monitoring. Report T-wave or U-wave changes and PVCs.',
    ],
  },
  {
    id: 'insulin',
    title: '3. Insulin infusion',
    tables: ['metabolic'],
    items: [
      'Start regular insulin at 0.1 units/kg/hr (7 units/hr) once K⁺ is 3.5 or higher and fluids are running.',
      'Expected glucose drop: 50–75 mg/dL per hour. Call the provider if it falls faster than 100 mg/dL per hour.',
      'Do NOT stop the drip because glucose is normal. Continue until DKA has resolved (section 7).',
    ],
  },
  {
    id: 'dextrose',
    title: '4. Dextrose',
    tables: ['metabolic', 'cardio'],
    items: [
      'When glucose falls below 250 mg/dL: add D5 to the IV fluids and continue insulin.',
      'Insulin may be reduced to 0.05 units/kg/hr (3.5 units/hr). Keep glucose 150–250 mg/dL.',
      'If glucose falls below 150 mg/dL: change to D10.',
      'Glucose under 70 mg/dL: treat hypoglycemia and call the provider.',
    ],
  },
  {
    id: 'monitoring',
    title: '5. Monitoring',
    tables: ['cardio', 'resp', 'renal', 'metabolic', 'neuro'],
    items: [
      'Vital signs, SpO₂, urine output, and POC glucose every hour.',
      'BMP and beta-hydroxybutyrate every 2 hours. A stat draw may be sent any time.',
      'Venous or arterial blood gas as needed to follow pH.',
      'Neuro checks every hour with head of bed 30°. Report new or worsening headache or any drop in GCS.',
      'Strict intake and output.',
    ],
  },
  {
    id: 'provider',
    title: '6. Provider order required',
    tables: ['metabolic', 'resp', 'neuro', 'renal'],
    items: [
      'Sodium bicarbonate: considered only if pH is below 7.0.',
      'Intubation: avoid if possible; breathing fast is the body buffering the acid.',
      'Mannitol or hypertonic saline: suspected cerebral edema.',
      'Phosphate: only if severely low (under 1.0 mg/dL) or with muscle or breathing weakness.',
      'Any order outside this protocol.',
    ],
  },
  {
    id: 'resolution',
    title: '7. DKA resolved when',
    tables: ['metabolic', 'resp'],
    items: [
      'Beta-hydroxybutyrate is under 0.6 mmol/L, AND',
      'pH is 7.3 or higher, OR bicarbonate is 18 mEq/L or higher.',
      'Glucose alone does not show resolution.',
    ],
  },
  {
    id: 'transition',
    title: '8. Transition to subcutaneous insulin',
    tables: ['metabolic'],
    items: [
      'Once resolved and the patient can eat: give basal insulin (glargine) subcutaneously.',
      'Continue the insulin drip for 1–2 hours AFTER the basal dose, then stop it.',
      'Starting dose: home regimen, or 0.3–0.6 units/kg/day total.',
      'Teach sick-day rules before discharge.',
    ],
  },
  {
    id: 'call',
    title: '9. Call the provider for',
    tables: ['cardio', 'resp', 'renal', 'metabolic', 'neuro'],
    items: [
      'SBP under 90 mmHg or MAP under 65 after 2 liters of fluid.',
      'K⁺ under 3.0 or over 6.0, or new arrhythmia.',
      'Glucose under 70 mg/dL.',
      'Any drop in GCS, new or worsening headache, or seizure.',
      'Urine output under 30 mL/hr for 2 hours.',
    ],
  },
];

export const PROTOCOL_SOURCE =
  'Adapted for teaching from the 2024 consensus report on hyperglycemic crises in adults (ADA, EASD, JBDS, AACE, DTS).';
