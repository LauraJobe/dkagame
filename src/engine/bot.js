// The protocol-only patient: follows the DKA/HHS protocol to the letter, reacts only to
// resulted labs (POC glucose hourly, potassium/BMP every 2 hours, BHB every 4 hours),
// never anticipates, and never shares cues between tables.
import { correctedNa } from './model.js';

const round1 = (v) => Math.round(v * 10) / 10;

export function botOrders(labs, current, hour, startHour) {
  const o = {
    ...current,
    bmpNow: false, bhbNow: false, gasNow: false, phosRepl: false, basal: false, bicarb: false,
    intubate: false, mannitol: false, insulinBolus: false, kBolus: false, d50: 0,
  };
  const since = hour - startHour;
  const k = labs.bmp?.k;
  const na = labs.bmp?.na;
  const g = labs.poc?.value;
  const gPrev = labs.pocPrev?.value;

  // Track consecutive POC readings under 200.
  o.under200 = g != null && g < 200 ? (current.under200 || 0) + 1 : 0;
  const stage2 = o.under200 >= 2 || current.stage2;
  o.stage2 = stage2;

  // Fluids: the second liter of NS as a bolus in the first hour of arrival, then 250 mL/hr,
  // 150 mL/hr once on dextrose. 0.45% if corrected Na > 132, else 0.9%.
  const cNa = na != null && g != null ? correctedNa(na, labs.bmp?.glucose ?? g) : null;
  o.fluidType = cNa != null && cNa > 132 ? 'HALF' : 'NS';
  if (startHour === 0 && since === 0) {
    o.fluidType = 'NS';
    o.fluidRate = 1000;
  } else {
    o.fluidRate = stage2 ? 150 : 250;
  }
  o.dextrose = stage2 ? 5 : 0;

  // Potassium in the fluid by the most recent K.
  if (k != null) o.kclPerL = k > 5.3 ? 0 : k >= 4.0 ? 20 : 40;
  if (o.fluidRate >= 1000) o.kclPerL = 0; // no potassium in the resuscitation bolus
  if (k != null && k < 3.3 && !(current.kBolusLeftHint > 0)) {
    o.kBolus = true;
    o.kBolusLeftHint = 4;
  } else {
    o.kBolusLeftHint = Math.max(0, (current.kBolusLeftHint || 0) - 1);
  }

  // Insulin.
  const resolved = labs.bmp && labs.bmp.ag < 12 && labs.bmp.hco3 > 18;
  let u = current.insulinUnits || 0;
  if (o.basalGivenHour != null && hour - o.basalGivenHour >= 2) {
    u = 0; // transition complete
  } else if (k != null && k < 3.3) {
    u = 0; // HOLD insulin
  } else if (g != null && g < 100) {
    u = 0; // hypoglycemia: D/C infusion
    if (g < 50) o.d50 = 25;
    else if (g < 75) o.d50 = 12.5;
    o.restartFactor = g < 75 ? 0.5 : 0.75;
    o.lastRate = current.insulinUnits || current.lastRate || 0;
  } else if (u === 0 && current.lastRate && g != null && g > 140) {
    u = round1(current.lastRate * (current.restartFactor || 0.5));
  } else if (u === 0 && !resolved) {
    u = 3.5; // begin at 0.05 units/kg/hr
  } else if (stage2) {
    if (!current.stage2) u = 1.4; // reduce to 0.02 units/kg/hr
    else if (g > 200) u = Math.min(3.5, round1(u + 0.7));
    else if (g < 150) u = Math.max(0.7, round1(u - 0.7));
  } else if (g != null && gPrev != null && g >= 200) {
    // Stage 1 adjustments apply until glucose reaches 200.
    const drop = gPrev - g;
    if (drop < 50) u = Math.min(20, round1(u * 2));
    else if (drop > 75) u = round1(u / 2);
  }
  o.insulinUnits = u;

  // Transition: SC basal once resolved; infusion continues 2 hours after.
  if (resolved && o.basalGivenHour == null && (current.insulinUnits || 0) > 0) {
    o.basal = true;
    o.basalGivenHour = hour;
  }
  return o;
}
