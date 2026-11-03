import { DEFAULT_ORDERS } from './model.js';

// Each scene starts from a fixed preset so scenes stand alone and the
// protocol-only patient can be compared hour for hour.
export const SCENES = [
  {
    id: 'arrival',
    title: 'Scene 1: Arrival',
    hours: 'Hours 0–3',
    beats: 3,
    report:
      'Jordan Reyes, 22, type 1 diabetes since age 12. Flu for 3 days, stopped eating, skipped insulin. 70 kg. ' +
      'The ED drew labs and gave 1 liter of 0.9% NaCl; it is now running at 250 mL/hr. No insulin yet. ' +
      'Admitting labs are on your monitors. Follow the DKA/HHS protocol: tap DKA protocol on your screen.',
    preset: (variant) => ({
      hour: 0,
      deficitL: 4.0,
      glucose: 512,
      bhb: 6.8,
      hco3: 6,
      paco2: 22,
      k: variant === 'B' ? 3.2 : 5.6,
      na: 131,
      cl: 98,
      bun: 32,
      cr: 1.6,
      phos: 2.2,
      gcs: 13,
      temp: 38.1,
    }),
    orders: { ...DEFAULT_ORDERS, fluidType: 'NS', fluidRate: 250 },
    cards: {
      2: (p) => ({
        table: 'renal',
        severity: 'info',
        title: '2-hour potassium',
        text: `Lab calls with the 2-hour potassium: ${p.k.toFixed(1)} mEq/L. Check the IV fluids table for the right potassium.`,
      }),
    },
  },
  {
    id: 'drip',
    title: 'Scene 2: The drip',
    hours: 'Hours 4–8',
    beats: 4,
    report:
      'Hour 4. Insulin was doubled to 7 units/hr an hour ago. 0.45% NaCl with 20 mEq K⁺ is running at 250 mL/hr. ' +
      'Jordan is less drowsy. Keep titrating insulin by the hourly glucose change, and watch for two readings under 200.',
    preset: () => ({
      hour: 4,
      deficitL: 1.4,
      glucose: 330,
      bhb: 4.2,
      hco3: 12.5,
      paco2: 27,
      k: 4.3,
      na: 138,
      cl: 103,
      bun: 26,
      cr: 1.25,
      phos: 1.7,
      gcs: 14,
      temp: 37.6,
      dripWasOn: true,
    }),
    orders: { ...DEFAULT_ORDERS, fluidType: 'HALF', fluidRate: 250, kclPerL: 20, insulinUnits: 7 },
    cards: {
      3: (p) => ({
        table: 'metabolic',
        severity: 'info',
        title: 'New provider order',
        text: `Dr. Patel calls the Metabolic table: "Glucose is ${Math.round(p.glucose)}. Stop the insulin drip." ` +
          'Is this order safe for Jordan right now? Carry it out, or call the provider to clarify it before the next hour.',
      }),
    },
  },
  {
    id: 'transition',
    title: 'Scene 3: Transition',
    hours: 'Hours 12–16',
    beats: 4,
    report:
      'Hour 12. Jordan is awake, alert, and asking for breakfast. Stage 2: insulin at 0.02 units/kg/hr (1.4 units/hr), ' +
      'Dextrose 5%–0.45% NaCl with 20 mEq K⁺ at 150 mL/hr. Home regimen: glargine 18 units daily plus lispro with meals.',
    preset: () => ({
      hour: 12,
      deficitL: 0.3,
      glucose: 178,
      bhb: 0.8,
      hco3: 17.5,
      paco2: 33,
      k: 4.1,
      na: 139,
      cl: 106,
      bun: 16,
      cr: 0.95,
      phos: 1.8,
      gcs: 15,
      temp: 37.0,
      dripWasOn: true,
    }),
    orders: { ...DEFAULT_ORDERS, fluidType: 'HALF', fluidRate: 150, kclPerL: 20, insulinUnits: 1.4, dextrose: 5 },
    cards: {},
    teachingChecklist: [
      'Never skip basal insulin, even when not eating',
      'Check blood glucose every 2–4 hours when sick',
      'Check ketones when glucose is over 250 or when ill',
      'Keep drinking sugar-free fluids',
      'Call the provider early: vomiting, ketones moderate or large, or glucose stays high',
    ],
  },
];
