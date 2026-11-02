// The protocol-only patient: follows standing orders exactly, reacts only to
// resulted labs on the protocol schedule, never anticipates, never shares cues.
export function botOrders(labs, current, hour, startHour) {
  const o = { ...current, bmpNow: false, bhbNow: false, gasNow: false, phosRepl: false, basal: false, bicarb: false, intubate: false, mannitol: false };
  const since = hour - startHour;
  const k = labs.bmp?.k;
  const glucose = labs.poc?.value ?? labs.bmp?.glucose;

  // Fluids: LR 1000 mL/hr for the first 2 hours of arrival, then 500, then 250.
  if (startHour === 0) {
    o.fluidType = 'LR';
    o.fluidRate = since < 2 ? 1000 : since < 4 ? 500 : 250;
  }

  // Potassium: 10 mEq/hr rider if under 3.5; 20 mEq/L in fluids if under 5.0.
  if (k != null) {
    if (k < 3.5) {
      o.kclPerL = current.insulinRate > 0 ? 30 : 0;
      o.kRider = true;
    } else if (k < 5.0) {
      o.kclPerL = 20;
      o.kRider = false;
    } else {
      o.kclPerL = 0;
      o.kRider = false;
    }
  }

  // Insulin: fixed rate 0.1 units/kg/hr once K is known to be at least 3.5.
  const resolved = labs.bhb && labs.bhb.value < 0.6 && labs.bmp && labs.bmp.hco3 >= 18;
  if (o.basalGivenHour != null && hour - o.basalGivenHour >= 2) {
    o.insulinRate = 0;
  } else if (k != null && k < 3.5 && !(current.insulinRate > 0)) {
    // Delay insulin only at presentation; once running, replace potassium instead.
    o.insulinRate = 0;
  } else if (!resolved) {
    o.insulinRate = current.insulinRate > 0 ? current.insulinRate : 0.1;
  }

  // Dextrose once glucose is reported under 250; D10 under 150.
  if (glucose != null) {
    if (glucose < 150) o.dextrose = 10;
    else if (glucose < 250) o.dextrose = Math.max(o.dextrose, 5);
  }

  // Transition: basal insulin at resolution, drip off 2 hours later.
  if (resolved && o.basalGivenHour == null) {
    o.basal = true;
    o.basalGivenHour = hour;
  }
  return o;
}
