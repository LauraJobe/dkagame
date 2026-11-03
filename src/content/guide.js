// Content for the Teacher Guide and the printable student materials.

export const TABLE_INFO = {
  cardio: {
    role: 'You manage Jordan’s circulation and IV fluids. You are the first to see potassium trouble, because it shows up on the ECG before the lab comes back.',
    sees: ['The IV running and the corrected sodium (calculated for you)', 'Heart rate, blood pressure, MAP', 'Capillary refill, temperature', 'ECG rhythm strip'],
    controls: ['IV fluid: 0.9% or 0.45% NaCl (by corrected sodium)', 'IV rate: bolus 1,000, 250, or 150 mL/hr with dextrose'],
    protocol: ['fluids', 'potassium', 'monitoring'],
    ask: [
      'Renal: what is the latest K⁺? (Check it against the IV fluids table in the protocol.)',
      'Renal: is urine output 50 mL/hr or more yet?',
      'Respiratory: any crackles or falling SpO₂? (Too much fluid?)',
      'Metabolic: has glucose been under 200 twice? (Then dextrose at 150 mL/hr.)',
    ],
  },
  resp: {
    role: 'You manage breathing and the blood gas. Jordan’s fast, deep breathing is the body blowing off CO₂ to buffer the acid. Your job is to read it, not to stop it.',
    sees: ['Respiratory rate and breathing pattern', 'SpO₂ and lung sounds', 'Breath odor', 'Blood gas: pH, PaCO₂, HCO₃⁻ (only when you draw one)'],
    controls: ['Draw a VBG/ABG this hour', 'Supplemental O₂', 'Intubation (provider order)'],
    protocol: ['monitoring'],
    ask: [
      'Metabolic: what is the HCO₃⁻ and anion gap? Does the breathing match the acid?',
      'Cardiovascular: how much fluid is running? (Watch for crackles.)',
      'Neuro: is Jordan more alert as the pH improves?',
    ],
  },
  renal: {
    role: 'You manage the kidneys, electrolytes, and potassium replacement. Insulin pushes potassium into the cells, so the number on your lab will fall fast once the drip starts.',
    sees: ['Urine output and intake/output totals', 'BMP every 2 hours or stat: K⁺, Na⁺, corrected Na⁺ (calculated for you), Cl⁻, BUN, creatinine, phosphate'],
    controls: ['K⁺ added to the IV fluid: 0, 20, or 40 mEq per liter', 'Potassium bolus 40 mEq (runs over 4 hours)', 'Stat BMP', 'Phosphate replacement (provider order)'],
    protocol: ['fluids', 'potassium', 'monitoring'],
    ask: [
      'Metabolic: is the insulin drip running, and at what rate?',
      'Cardiovascular: what does the ECG show? What rate are the fluids? (Your KCl is per liter of that fluid.)',
      'Cardiovascular: which bag is hanging, and at what rate?',
    ],
  },
  metabolic: {
    role: 'You manage insulin, dextrose, and the ketones. Glucose falls long before the ketones clear, so glucose alone does not tell you the DKA is over.',
    sees: ['POC glucose every hour', 'Beta-hydroxybutyrate (every 2 hours or stat)', 'HCO₃⁻ and anion gap', 'pH (when Respiratory draws a gas)'],
    controls: ['Regular insulin infusion in units/hr (titrated hourly)', 'Dextrose 5% added to the NaCl', 'D50W 12.5 g or 25 g', 'Basal insulin (glargine) subQ', 'Stat beta-hydroxybutyrate', 'Insulin bolus and sodium bicarbonate (provider orders)'],
    protocol: ['insulin', 'insulin2', 'hypo'],
    ask: [
      'Renal: what is the K⁺ right now? (Hold insulin under 3.3.)',
      'Cardiovascular: what fluid is running? (Dextrose goes into it.)',
      'Respiratory: what is the newest pH?',
      'Neuro: any headache or change in GCS?',
    ],
  },
  neuro: {
    role: 'You watch Jordan’s brain. Low glucose and a too-fast drop in osmolality both show up here first, as confusion, headache, or a falling GCS.',
    sees: ['GCS and mental status', 'Headache, pupils, skin', 'Serum osmolality (with each BMP)'],
    controls: ['Neuro checks every hour', 'Head of bed 30°', 'Mannitol (provider order)'],
    protocol: ['hypo', 'monitoring'],
    ask: [
      'Metabolic: how fast is glucose falling each hour?',
      'Metabolic: is dextrose running now that glucose has been under 200 twice?',
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
  ['Scene 1: Arrival', '8–10 min', 'Hours 0–3. Three hours. Fluids, potassium, then insulin at 0.05 units/kg/hr.'],
  ['Scene 2: The drip', '8–10 min', 'Hours 4–7. Three hours. Hourly titration, Stage 2 after two readings under 200, and the provider’s stop-the-drip order.'],
  ['Scene 3: Transition', '8–10 min', 'Hours 12–15. Three hours. Confirm resolution, give basal insulin, overlap, stop the drip, teach sick-day rules.'],
  ['Debrief', '12 min', 'Project the graphs. Our Jordan against the protocol-only Jordan.'],
  ['Exit ticket', '5 min', 'Three questions on paper (print materials).'],
];

export const SCENE_KEYS = [
  {
    title: 'Scene 1: Arrival (hours 0\u20133)',
    goal: 'Finish the NS bolus, start insulin at 0.05 units/kg/hr (K\u207a 3.8 is over 3.3), replace potassium, and HOLD insulin when K\u207a falls under 3.3.',
    hours: [
      ['Hour 0 \u2192 1', 'Cardiovascular gives the second liter of 0.9% NaCl as a bolus (1,000 mL/hr), with no potassium in it. K\u207a 3.8 is over 3.3, so Metabolic starts insulin at 3.5 units/hr. K\u207a is under 4.0, so the next bag needs 40 mEq.'],
      ['Hour 1 \u2192 2', 'The monitors show corrected sodium about 141 (over 132), so the bag becomes 0.45% NaCl w/ 40 mEq K\u207a at 250 mL/hr. Cardiovascular\u2019s ECG already shows flattened T waves: a cue to ask Renal for a stat BMP.'],
      ['Hour 2 \u2192 3', 'The 2-hour K\u207a comes back 3.1. HOLD insulin (Metabolic) and give the 40 mEq potassium bolus (Renal); notify the physician (under 4.0). The bolus runs 10 mEq/hr over 4 hours, so K\u207a rises only slowly (about 3.2 by hour 3) and insulin stays held for the rest of the scene. Insulin restarts only once a K\u207a over 3.3 comes back.'],

    ],
    traps: 'Keeping insulin running after the K\u207a of 3.1 costs 5 points and drives K\u207a to about 2.8 with U waves; with no potassium in the bag it falls further, with PVCs. Potassium in the 1,000 mL/hr bolus runs 40 mEq/hr and triggers a rate warning.',
  },
  {
    title: 'Scene 2: The drip (hours 4\u20137)',
    goal: 'Titrate insulin by the hourly change, move to Stage 2 after two readings under 200, and clarify the unsafe order.',
    hours: [
      ['Hour 4 \u2192 5', 'Glucose is 270 on 7 units/hr. With no change to judge yet, the rate stays; glucose falls about 80 to near 190.'],
      ['Hour 5 \u2192 6', 'The fall was over 75, so Metabolic halves insulin to 3.5 units/hr. That is the first reading under 200. K\u207a drifts toward 4.0: Renal watches for the protocol\u2019s notify-under-4.0 rule.'],
      ['Hour 6 \u2192 7', 'Second reading under 200: Stage 2. Insulin to 1.4 units/hr (0.02 units/kg/hr); the bag becomes Dextrose 5%\u20130.45% NaCl w/ 20 mEq K\u207a at 150 mL/hr; the physician is informed. At the same moment the provider orders the drip stopped. The correct response is to clarify with an SBAR: the anion gap is still about 21 and bicarbonate about 14, so the DKA is NOT resolved. If the SBAR is clear, click Agree and say: \u201cGood catch. Keep the drip with dextrose.\u201d'],
    ],
    traps: 'Leaving insulin at 7 units/hr with no dextrose: glucose falls about 60\u201380 an hour and reaches the hypoglycemia range by hour 7. Then the hypoglycemia section applies: D/C insulin, D50W by tier, restart at 50% or 75% of the last rate once over 140. Stopping the drip on the provider\u2019s order: ketones rebound and the gap stays open.',
  },
  {
    title: 'Scene 3: Transition (hours 12\u201315)',
    goal: 'Keep glucose 150\u2013200 on Stage 2, prove resolution, overlap basal insulin, then stop the drip.',
    hours: [
      ['Hour 12 \u2192 13', 'On D5 at 150 mL/hr with 1.4 units/hr, glucose drifts up; over 200, Metabolic titrates up 0.7 units/hr (max 3.5). Renal orders a stat BMP to check the gap and bicarbonate.'],
      ['Hour 13 \u2192 14', 'Resolved: anion gap under 12 and bicarbonate over 18. Jordan can eat, so Metabolic gives glargine SC (home dose 18 units). The drip CONTINUES.'],
      ['Hour 14 \u2192 15', 'One to two hours after the basal dose, Metabolic stops the drip and the dextrose. One table teaches sick-day rules; check them off on the instructor panel.'],
    ],
    traps: 'Stopping the drip with no basal on board: glucose and ketones climb back within 2 hours. Potassium drifts toward 3.8 if nobody is watching it.',
  },
];

export const PROVIDER_CALLS = [
  ['Insulin bolus (0.1 units/kg)', 'The protocol allows it only if you order it. Approve at arrival if you want to show its effect; it adds about an hour of extra insulin and pushes K\u207a down faster.'],
  ['Additional potassium', 'Expect this call when K\u207a keeps falling on 40 mEq per liter. Agree, and remind them potassium will then run over 10 mEq/hr.'],
  ['Sodium bicarbonate', 'Decline unless pH is under 7.0 (it starts at 7.06). If approved anyway, K\u207a drops 0.5 and mental status worsens briefly.'],
  ['Intubation', 'Decline. Ask: \u201cWhat will happen to the CO\u2082 he is blowing off?\u201d If approved, pH crashes and a cardiac arrest card appears.'],
  ['Mannitol', 'Approve only if Neuro reports a worsening headache or falling GCS with a fast osmolality drop.'],
  ['General SBAR call', 'Listen for a complete SBAR with numbers from other tables. Agree or disagree, and say why out loud.'],
];

export const DEBRIEF_KEY = [
  ['Where did K⁺ leave the green, and who saw it first?', 'Usually Cardiovascular (ECG change) before Renal (lab). The lag between a cue and an action is the point.'],
  ['When the provider ordered the drip stopped, what showed the DKA was not resolved?', 'The anion gap was still over 12 and bicarbonate under 18. Metabolic had both numbers. Glucose alone never shows resolution; that is why Stage 2 adds dextrose instead of stopping insulin.'],
  ['Where did we beat the protocol-only patient?', 'The protocol-only patient waits for scheduled labs: K⁺ only at 2 hours then every 4, and glucose only every 2 hours. Anticipating and sharing cues closes that gap.'],
  ['Why does insulin lower serum potassium?', 'Insulin activates the Na⁺/K⁺-ATPase, moving K⁺ into cells. Correcting acidosis shifts it in too. Total body K⁺ was already low from osmotic diuresis.'],
  ['What will you teach Jordan?', 'Never skip basal insulin when sick. Check glucose every 2–4 hours and ketones when ill. Drink sugar-free fluids. Call early for vomiting or moderate/large ketones.'],
];

export const EXIT_TICKET = [
  {
    q: 'An adult in DKA has K\u207a 3.1 mEq/L, glucose 480 mg/dL, and corrected sodium 138. Using the protocol, what do you do about insulin and potassium, and which bag do you hang after the NS bolus?',
    a: 'HOLD insulin (K\u207a under 3.3) and give 40 mEq K\u207a as a bolus every 4 hours until K\u207a is over 3.3. Bag: 0.45% NaCl w/ 40 mEq K\u207a (sodium over 132, K\u207a under 4.0) at 250 mL/hr.',
  },
  {
    q: 'Insulin is at 3.5 units/hr. Glucose went from 410 to 372 this hour. What does the protocol tell you to do, and why?',
    a: 'It fell only 38 (under 50), so double the infusion to 7 units/hr (max 20 units/hr). Stage 1 aims for a fall of 50\u201375 mg/dL per hour.',
  },
  {
    q: 'Glucose has read 188 and then 176. The anion gap is 18 and bicarbonate is 15. The provider says to stop the insulin. What do you do and say?',
    a: 'Do not stop it; clarify with SBAR. The gap is 18 and bicarbonate 15, so DKA is not resolved (gap under 12 and bicarbonate over 18). Two readings under 200 means Stage 2: reduce insulin to 0.02 units/kg/hr (1.4 units/hr), change to Dextrose 5% fluid at 150 mL/hr, and keep glucose 150–200 until the DKA resolves.',
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
  ['Anion gap', 'Na⁺ − (Cl⁻ + HCO₃⁻). Elevated in DKA from ketoacids; under 12 (with bicarbonate over 18) means resolved.'],
  ['Beta-hydroxybutyrate (BHB)', 'The main ketone in DKA. It falls as insulin clears the ketoacids.'],
  ['DKA resolution', 'Anion gap under 12 and serum bicarbonate over 18. Glucose alone never shows resolution.'],
  ['Corrected sodium', 'Measured Na⁺ + 0.024 × (glucose − 100) (Hillier, 1999). High glucose pulls water into the blood and lowers measured sodium. Over 132: 0.45% NaCl.'],
  ['Kussmaul respirations', 'Deep, rapid breathing that blows off CO₂ to buffer metabolic acidosis.'],
  ['Osmotic diuresis', 'Glucose in the urine pulls water and electrolytes out with it, causing dehydration and potassium loss.'],
  ['Serum osmolality', '2 × Na⁺ + glucose ÷ 18 + BUN ÷ 2.8. A fall of more than 3 mOsm/kg per hour raises cerebral edema risk.'],
  ['Basal-IV overlap', 'Continuing the IV insulin infusion for 1–2 hours after subcutaneous insulin begins.'],
  ['Stage 1 / Stage 2', 'Stage 1: start at 0.05 units/kg/hr and adjust hourly by the glucose change. Stage 2: after two readings under 200, 0.02 units/kg/hr with dextrose, glucose goal 150–200.'],
  ['SBAR', 'Situation, Background, Assessment, Recommendation: a structured way to call a provider.'],
];
