import { DEFAULT_ORDERS } from './model.js';

// Each scene starts from a fixed preset so scenes stand alone and the
// protocol-only patient can be compared beat for beat.
export const SCENES = [
  {
    id: 'arrival',
    title: 'Scene 1: Arrival',
    hours: 'Hours 0–3',
    beats: 3,
    report:
      'Jordan Reyes, 22, type 1 diabetes since age 12. Flu for 3 days, stopped eating, skipped insulin. ' +
      'The ED gave 1 liter of 0.9% NaCl; it is running at 250 mL/hr through one of two 20 g IVs. No insulin yet. ' +
      'Admitting labs are on your monitors. You are working under the nurse-driven DKA protocol: tap DKA protocol on your screen to read it.',
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
      // shown after the given beat has run (beat numbers start at 1)
      2: (p) => ({
        table: 'renal',
        severity: 'info',
        title: '2-hour potassium',
        text: `Lab calls with the 2-hour potassium: ${p.k.toFixed(1)} mEq/L.`,
      }),
    },
  },
  {
    id: 'drip',
    title: 'Scene 2: The drip',
    hours: 'Hours 4–8',
    beats: 4,
    report:
      'Hour 4. The insulin drip is running at 0.1 units/kg/hr (7 units/hr). LR at 250 mL/hr with 20 mEq/L KCl. ' +
      'Jordan is less drowsy. The numbers are moving in the right direction.',
    preset: () => ({
      hour: 4,
      deficitL: 1.4,
      glucose: 330,
      bhb: 4.2,
      hco3: 12.5,
      paco2: 27,
      k: 4.3,
      na: 135,
      cl: 103,
      bun: 26,
      cr: 1.25,
      phos: 1.7,
      gcs: 14,
      temp: 37.6,
      dripWasOn: true,
    }),
    orders: { ...DEFAULT_ORDERS, fluidType: 'LR', fluidRate: 250, kclPerL: 20, insulinRate: 0.1 },
    cards: {
      3: (p) => ({
        table: 'metabolic',
        severity: 'info',
        title: 'The provider asks',
        text: `"Glucose is ${Math.round(p.glucose)}. Can we stop the insulin drip?" Decide as a class before the next beat.`,
      }),
    },
  },
  {
    id: 'transition',
    title: 'Scene 3: Transition',
    hours: 'Hours 12–16',
    beats: 4,
    report:
      'Hour 12. Jordan is awake, alert, and asking for breakfast. Insulin drip at 0.05 units/kg/hr (3.5 units/hr) with ' +
      'D5 LR at 125 mL/hr and 20 mEq/L KCl. Home regimen: glargine 18 units daily plus lispro with meals.',
    preset: () => ({
      hour: 12,
      deficitL: 0.3,
      glucose: 190,
      bhb: 1.0,
      hco3: 16.5,
      paco2: 32,
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
    orders: { ...DEFAULT_ORDERS, fluidType: 'LR', fluidRate: 125, kclPerL: 20, insulinRate: 0.05, dextrose: 5 },
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
