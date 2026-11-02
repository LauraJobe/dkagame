// Content for the Teacher Guide and the printable student materials.

export const TABLE_INFO = {
  cardio: {
    role: 'You manage Jordan’s circulation and IV fluids. You are the first to see potassium trouble, because it shows up on the ECG before the lab comes back.',
    sees: ['Heart rate, blood pressure, MAP', 'Capillary refill, temperature', 'ECG rhythm strip'],
    controls: ['IV fluid type: LR, 0.9% NaCl, or 0.45% NaCl', 'IV rate: off to 1,000 mL/hr'],
    protocol: ['fluids', 'potassium', 'call'],
    ask: [
      'Renal: what is the latest K⁺, and when was it drawn? (Compare it to your ECG.)',
      'Renal: is urine output 50 mL/hr or more yet?',
      'Respiratory: any crackles or falling SpO₂? (Too much fluid?)',
      'Metabolic: is dextrose being added to the fluid you are running?',
    ],
  },
  resp: {
    role: 'You manage breathing and the blood gas. Jordan’s fast, deep breathing is the body blowing off CO₂ to buffer the acid. Your job is to read it, not to stop it.',
    sees: ['Respiratory rate and breathing pattern', 'SpO₂ and lung sounds', 'Breath odor', 'Blood gas: pH, PaCO₂, HCO₃⁻ (only when you draw one)'],
    controls: ['Draw a VBG/ABG this hour', 'Supplemental O₂', 'Intubation (provider order)'],
    protocol: ['monitoring', 'provider', 'resolution'],
    ask: [
      'Metabolic: what is the HCO₃⁻ and anion gap? Does the breathing match the acid?',
      'Cardiovascular: how much fluid is running? (Watch for crackles.)',
      'Neuro: is Jordan more alert as the pH improves?',
    ],
  },
  renal: {
    role: 'You manage the kidneys, electrolytes, and potassium replacement. Insulin pushes potassium into the cells, so the number on your lab will fall fast once the drip starts.',
    sees: ['Urine output and intake/output totals', 'BMP: K⁺, Na⁺, Cl⁻, BUN, creatinine, phosphate (every 2 hours or stat)'],
    controls: ['KCl added to IV fluids: 0–40 mEq/L', 'KCl 10 mEq/hr IV rider', 'Phosphate replacement', 'Stat BMP'],
    protocol: ['potassium', 'monitoring', 'provider'],
    ask: [
      'Metabolic: is the insulin drip running, and at what rate?',
      'Cardiovascular: what does the ECG show? What rate are the fluids? (Your KCl is per liter of that fluid.)',
      'Metabolic: what is the glucose? (You need it to correct the sodium.)',
    ],
  },
  metabolic: {
    role: 'You manage insulin, dextrose, and the ketones. Glucose falls long before the ketones clear, so glucose alone does not tell you the DKA is over.',
    sees: ['POC glucose every hour', 'Beta-hydroxybutyrate (every 2 hours or stat)', 'HCO₃⁻ and anion gap', 'pH (when Respiratory draws a gas)'],
    controls: ['Insulin infusion: off to 0.14 units/kg/hr', 'Dextrose added to fluids: D5 or D10', 'Basal insulin (glargine) subQ', 'Stat beta-hydroxybutyrate', 'Sodium bicarbonate (provider order)'],
    protocol: ['insulin', 'dextrose', 'potassium', 'resolution', 'transition'],
    ask: [
      'Renal: what is the K⁺ right now? (Never start insulin under 3.5.)',
      'Cardiovascular: what fluid is running? (Dextrose goes into it.)',
      'Respiratory: what is the newest pH?',
      'Neuro: any headache or change in GCS?',
    ],
  },
  neuro: {
    role: 'You watch Jordan’s brain. Low glucose and a too-fast drop in osmolality both show up here first, as confusion, headache, or a falling GCS.',
    sees: ['GCS and mental status', 'Headache, pupils, skin', 'Serum osmolality (with each BMP)'],
    controls: ['Neuro checks every hour', 'Head of bed 30°', 'Mannitol (provider order)'],
    protocol: ['monitoring', 'provider', 'call'],
    ask: [
      'Metabolic: how fast is glucose falling each hour?',
      'Metabolic: is dextrose running now that glucose is under 250?',
      'Respiratory: has the pH improved? (Mental status should follow it.)',
    ],
  },
};

export const JOBS = [
  ['Reader', 'Reads the monitor out loud to the table each hour and flags anything new or stale.'],
  ['Caller', 'Walks to other tables to get the numbers you need. Carries one question at a time.'],
  ['Host', 'Stays at the table and answers visiting Callers with your current numbers.'],
  ['Dialer', 'Enters the orders the table agrees on, then taps Ready.'],
  ['Charter', 'Tables of 5 or more: records each hour’s key numbers and the orders given.'],
];

export const FLOW = [
  ['Set up', '5 min', 'Seat five tables, one device each. Project the projector view. Tables join with the room code and assign jobs.'],
  ['Opening', '3 min', 'Read the shift report aloud. Point every table to the DKA protocol button. Remind them: no table sees everything.'],
  ['Scene 1: Arrival', '12 min', 'Hours 0–3. Three hours. The key decision is the order of fluids, potassium, and insulin.'],
  ['Scene 2: The drip', '14 min', 'Hours 4–8. Four hours. Dextrose at glucose under 250, potassium drifting down, and the provider’s stop-the-drip order.'],
  ['Scene 3: Transition', '12 min', 'Hours 12–16. Four hours. Confirm resolution, give basal insulin, overlap, stop the drip, and teach sick-day rules.'],
  ['Debrief', '12 min', 'Project the graphs. Our Jordan against the protocol-only Jordan.'],
  ['Exit ticket', '5 min', 'Three questions on paper (print materials).'],
];

export const SCENE_KEYS = [
  {
    title: 'Scene 1: Arrival (hours 0–3)',
    goal: 'Restore volume, find out the potassium, then start insulin. In that order.',
    hours: [
      ['Hour 0 → 1', 'Cardiovascular switches to LR at 1,000 mL/hr. Version A: K⁺ is 5.6, so Metabolic starts insulin at 0.1 units/kg/hr and Renal adds no potassium yet (over 5.0). Version B: K⁺ is 3.2, so insulin is HELD and Renal starts the KCl 10 mEq/hr rider. Respiratory recognizes Kussmaul breathing as compensation.'],
      ['Hour 1 → 2', 'Version A: the ECG’s peaked T waves flatten. Renal should anticipate the drop. Fluids stay at 1,000 if MAP is under 80. Version B: Renal orders a stat BMP; insulin starts only once K⁺ is 3.5 or more.'],
      ['Hour 2 → 3', 'The 2-hour K⁺ comes back (about 4.6 in Version A). Renal adds KCl 20–30 mEq/L now that urine output is over 50 mL/hr. Cardiovascular can drop to 500 mL/hr as MAP climbs. Glucose is near 250 by hour 3: Metabolic should be ready with dextrose.'],
    ],
    traps: 'Insulin with K⁺ under 3.5 causes VT within 2 hours. No KCl once K⁺ falls under 5.0 lets it slide to about 3.4 by hour 3. KCl at 1,000 mL/hr × 40 mEq/L is 40 mEq/hr, twice the safe maximum.',
  },
  {
    title: 'Scene 2: The drip (hours 4–8)',
    goal: 'Keep insulin running until the ketones clear, add dextrose to keep glucose 150–250, and keep potassium up.',
    hours: [
      ['Hour 4 → 5', 'Glucose falls about 80 mg/dL per hour and will cross 250 near hour 5. Metabolic adds D5 as soon as it does, and can lower insulin to 0.05 units/kg/hr.'],
      ['Hour 5 → 7', 'K⁺ drifts from 4.3 toward 3.6 even with 20 mEq/L at 250 mL/hr (only 5 mEq/hr). Renal increases to 30–40 mEq/L or adds the rider. Phosphate falls but stays above 1.0; no replacement needed.'],
      ['After hour 7: the provider’s order', 'The provider orders the drip stopped because glucose is normal. The correct response is to clarify: BHB is still about 1.5 and the anion gap about 16, so the DKA is NOT resolved. Metabolic calls with an SBAR. If the SBAR is clear, click Agree and say: “Good catch. Keep the drip with dextrose.” If they simply stop the drip, ketones rebound next hour.'],
    ],
    traps: 'No dextrose: glucose under 70 by hour 8 with a hypoglycemia card. Stopping the drip: BHB and the gap rise. Fixed insulin at 0.14 units/kg/hr drops glucose more than 100 mg/dL per hour and osmolality falls too fast (Neuro headache card).',
  },
  {
    title: 'Scene 3: Transition (hours 12–16)',
    goal: 'Prove the DKA is resolved, overlap basal insulin, stop the drip safely, and teach.',
    hours: [
      ['Hour 12 → 13', 'Respiratory draws a gas and Metabolic orders a stat BHB. Resolution (BHB under 0.6 and HCO₃⁻ 18 or more) arrives at hour 13–14.'],
      ['Hour 13 → 14', 'Metabolic gives glargine subQ (home dose 18 units). The drip CONTINUES.'],
      ['Hour 14 → 16', 'At least 1–2 hours after the basal dose, Metabolic stops the drip and dextrose. One table teaches sick-day rules; check them off on the instructor panel.'],
    ],
    traps: 'Stopping the drip with no basal on board: glucose and BHB climb back within 2 hours. Forgetting potassium: K⁺ drifts to 3.5 by hour 16.',
  },
];

export const PROVIDER_CALLS = [
  ['Sodium bicarbonate', 'Decline unless pH is under 7.0 (it starts at 7.06). If approved anyway, K⁺ drops 0.5 and mental status worsens briefly.'],
  ['Intubation', 'Decline. Ask: “What will happen to the CO₂ he is blowing off?” If approved, pH crashes and a cardiac arrest card appears.'],
  ['Mannitol', 'Approve only if Neuro reports a worsening headache or falling GCS with a fast osmolality drop.'],
  ['General SBAR call', 'Listen for a complete SBAR with numbers from other tables. Agree or disagree, and say why out loud.'],
];

export const DEBRIEF_KEY = [
  ['Where did K⁺ leave the green, and who saw it first?', 'Usually Cardiovascular (ECG change) before Renal (lab). The lag between a cue and an action is the point.'],
  ['When the provider ordered the drip stopped, what showed the DKA was not resolved?', 'BHB still over 0.6 and the anion gap still open. Metabolic had both. Glucose alone never shows resolution.'],
  ['Where did we beat the protocol-only patient?', 'The protocol-only patient waits for scheduled labs: K⁺ only at 2 hours then every 4, and glucose only every 2 hours. Anticipating and sharing cues closes that gap.'],
  ['Why does insulin lower serum potassium?', 'Insulin activates the Na⁺/K⁺-ATPase, moving K⁺ into cells. Correcting acidosis shifts it in too. Total body K⁺ was already low from osmotic diuresis.'],
  ['What will you teach Jordan?', 'Never skip basal insulin when sick. Check glucose every 2–4 hours and ketones when ill. Drink sugar-free fluids. Call early for vomiting or moderate/large ketones.'],
];

export const EXIT_TICKET = [
  {
    q: 'An adult in DKA has K⁺ 3.1 mEq/L, glucose 480 mg/dL, and pH 7.12. List your first three actions in order and explain why insulin is not one of them.',
    a: 'Start isotonic fluids; give KCl (10 mEq/hr rider); recheck K⁺. Insulin moves K⁺ into cells and would drop it to a dangerous level, so it waits until K⁺ is 3.5 or more.',
  },
  {
    q: 'Hour 7: glucose 145 mg/dL, BHB 1.6 mmol/L, anion gap 17. The provider orders the insulin drip stopped. What do you do and say?',
    a: 'Do not stop the drip yet; clarify. SBAR: ketones and gap show DKA is not resolved. Recommend continuing insulin (possibly 0.05 units/kg/hr) with D5 or D10 to keep glucose 150–250.',
  },
  {
    q: 'Why must basal insulin be given 1–2 hours before the insulin drip is stopped?',
    a: 'IV insulin wears off within minutes and subcutaneous basal takes 1–2 hours to start working. Without overlap, there is a gap with no insulin and ketoacidosis returns.',
  },
];

export const SIMPLIFICATIONS = [
  'Time is compressed: each beat is one hour, and scenes jump from hour 3 to 4 and hour 8 to 12.',
  'Each scene starts from a fixed set of values, so a mistake in one scene does not carry into the next.',
  'Labs result instantly when drawn. Real turnaround is 30–60 minutes.',
  'Weight is fixed at 70 kg, and there is no oral intake, vomiting, or insulin bolus.',
  'Potassium, glucose, and ketone changes are linear teaching approximations of typical adult response.',
  'Cerebral edema is uncommon in adults; the game exaggerates its warning signs to teach the principle of not dropping osmolality too fast.',
  'The ECG is a text description, not a waveform.',
  'The protocol-only patient follows the standing orders exactly, using only labs on the protocol schedule.',
];

export const KEY_TERMS = [
  ['Anion gap', 'Na⁺ − (Cl⁻ + HCO₃⁻). Elevated in DKA from ketoacids; closing it shows ketoacids clearing.'],
  ['Beta-hydroxybutyrate (BHB)', 'The main ketone in DKA. Under 0.6 mmol/L is part of the resolution criteria.'],
  ['Corrected sodium', 'Measured Na⁺ + 1.6 × (glucose − 100) ÷ 100. High glucose pulls water into the blood and lowers measured sodium.'],
  ['Kussmaul respirations', 'Deep, rapid breathing that blows off CO₂ to buffer metabolic acidosis.'],
  ['Osmotic diuresis', 'Glucose in the urine pulls water and electrolytes out with it, causing dehydration and potassium loss.'],
  ['Serum osmolality', '2 × Na⁺ + glucose ÷ 18 + BUN ÷ 2.8. A fall of more than 3 mOsm/kg per hour raises cerebral edema risk.'],
  ['Basal-IV overlap', 'Giving subcutaneous basal insulin 1–2 hours before stopping the IV drip.'],
  ['SBAR', 'Situation, Background, Assessment, Recommendation: a structured way to call a provider.'],
];
