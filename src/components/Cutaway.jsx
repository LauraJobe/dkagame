import React from 'react';

// Living pictures for each table's screen. The SVG is stable between hours, so the
// animations never restart; only their speed and what is drawn change with the numbers.
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const INK = '#0d1412';

export default function Cutaway({ tableId, a }) {
  if (!a) return null;
  const Pic = { cardio: Cardio, resp: Resp, renal: Renal, metabolic: Metabolic, neuro: Neuro }[tableId];
  return Pic ? <div className="cutaway"><Pic a={a} /></div> : null;
}

// ---------------------------------------------------------------- ECG
function beatPath(x0, w, pattern, i) {
  const y = 50;
  const X = (f) => (x0 + f * w).toFixed(1);
  if (pattern === 'vt') {
    return `L${X(0)} ${y} Q${X(0.25)} 4 ${X(0.5)} ${y} Q${X(0.75)} 96 ${X(1)} ${y}`;
  }
  let d = `L${X(0.12)} ${y} Q${X(0.16)} ${y - 12} ${X(0.2)} ${y}`; // P wave
  const pvc = pattern === 'pvcs' && i % 3 === 2;
  if (pvc) {
    return `L${X(0.24)} ${y} L${X(0.3)} 8 L${X(0.42)} 92 L${X(0.5)} ${y} Q${X(0.62)} 76 ${X(0.74)} ${y} L${X(1)} ${y}`;
  }
  if (pattern === 'wide') d += ` L${X(0.26)} ${y} L${X(0.3)} ${y + 6} L${X(0.36)} 18 L${X(0.44)} ${y + 14} L${X(0.48)} ${y}`;
  else d += ` L${X(0.28)} ${y} L${X(0.29)} ${y + 5} L${X(0.31)} 12 L${X(0.33)} ${y + 12} L${X(0.35)} ${y}`;
  const T = { normal: 12, peaked: 26, wide: 24, flatT: 3, uWaves: 3, pvcs: 3 }[pattern] ?? 12;
  const tw = pattern === 'peaked' || pattern === 'wide' ? 0.12 : 0.18;
  d += ` L${X(0.48)} ${y} Q${X(0.48 + tw / 2)} ${y - 2 * T} ${X(0.48 + tw)} ${y}`;
  if (pattern === 'uWaves' || pattern === 'pvcs') d += ` L${X(0.72)} ${y} Q${X(0.76)} ${y - 16} ${X(0.8)} ${y}`;
  return d + ` L${X(1)} ${y}`;
}

function ecgD(hr, pattern) {
  const W = 1200; // 12 seconds at 100 px per second
  const rate = pattern === 'vt' ? 180 : hr;
  const n = Math.max(1, Math.round((12 * rate) / 60));
  const w = W / n;
  let d = 'M0 50';
  for (let i = 0; i < n; i++) d += ' ' + beatPath(i * w, w, pattern, i);
  return d;
}

function Drip({ x, y, rate, color = '#9cd3ff', len = 46 }) {
  if (!rate) return null;
  const dur = clamp((250 / rate) * 1.2, 0.45, 3);
  return (
    <g>
      {[0, 0.5].map((off) => (
        <circle key={off} cx={x} cy={y} r="4" fill={color} className="cw-drip"
          style={{ '--len': `${len}px`, animationDuration: `${dur}s`, animationDelay: `${-off * dur}s` }} />
      ))}
    </g>
  );
}

function IvBag({ x, y, label, rate, color = '#cfe8ff' }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x="-24" y="0" width="48" height="64" rx="10" fill={color} fillOpacity="0.25" stroke={color} strokeWidth="2.5" />
      <rect x="-20" y={rate ? 18 : 10} width="40" height={rate ? 42 : 50} rx="7" fill={color} fillOpacity="0.35" />
      <text x="0" y="40" textAnchor="middle" className="cw-small" fill="#e8f2ed">{label}</text>
      <rect x="-4" y="64" width="8" height="14" fill={color} />
      <rect x="-9" y="78" width="18" height="22" rx="4" fill="none" stroke={color} strokeWidth="2" />
      <Drip x={0} y={82} rate={rate} color={color} len={14} />
    </g>
  );
}

// ---------------------------------------------------------------- Cardiovascular
function Cardio({ a }) {
  const beat = 60 / clamp(a.hr || 80, 30, 200);
  const label = { LR: 'LR', NS: 'NS', HALF: '½NS' }[a.fluidType] || 'IV';
  const vt = a.ecg === 'vt';
  return (
    <svg viewBox="0 0 600 300" role="img" aria-label={`Heart beating at ${a.hr} per minute. ECG: ${a.ecg}.`}>
      <defs>
        <clipPath id="ecgClip"><rect x="20" y="170" width="560" height="110" rx="10" /></clipPath>
        <pattern id="ecgGrid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M20 0 L0 0 0 20" fill="none" stroke="#1f3a2f" strokeWidth="1" />
        </pattern>
      </defs>
      {/* vessels with blood flow */}
      <path id="cwLoop" d="M300 92 C 420 40, 520 60, 520 110 C 520 150, 420 150, 300 120 C 180 150, 80 150, 80 110 C 80 60, 180 40, 300 92 Z"
        fill="none" stroke="#5b1f24" strokeWidth="10" strokeLinecap="round" />
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <circle key={i} r="5" fill="#e11d48" stroke="#fff" strokeWidth="1.2" className="cw-flow"
          style={{ offsetPath: "path('M300 92 C 420 40, 520 60, 520 110 C 520 150, 420 150, 300 120 C 180 150, 80 150, 80 110 C 80 60, 180 40, 300 92 Z')",
            animationDuration: `${beat * 6}s`, animationDelay: `${(-i / 8) * beat * 6}s` }} />
      ))}
      <g className={`cw-heart ${vt ? 'cw-quiver' : ''}`} style={{ animationDuration: `${vt ? 0.33 : beat}s`, transformOrigin: '300px 100px' }}>
        <path d="M300 78 C 288 56, 252 60, 254 92 C 256 118, 284 134, 300 150 C 316 134, 344 118, 346 92 C 348 60, 312 56, 300 78 Z"
          fill="#e11d48" stroke={INK} strokeWidth="3" />
        <path d="M282 84 C 286 98, 292 108, 300 116" stroke="#fda4af" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.7" />
      </g>
      <IvBag x={50} y={6} label={label} rate={a.fluidRate} />
      {/* ECG strip */}
      <rect x="20" y="170" width="560" height="110" rx="10" fill="#07110d" stroke="#1f3a2f" />
      <g clipPath="url(#ecgClip)">
        <rect x="20" y="170" width="560" height="110" fill="url(#ecgGrid)" />
        <g transform="translate(20 175)">
          <g className="cw-ecg" key={a.ecg + Math.round(a.hr / 5)}>
            <path d={ecgD(a.hr, a.ecg)} fill="none" stroke="#5ee08f" strokeWidth="2.5" strokeLinejoin="round" />
            <path d={ecgD(a.hr, a.ecg)} transform="translate(1200 0)" fill="none" stroke="#5ee08f" strokeWidth="2.5" strokeLinejoin="round" />
          </g>
        </g>
      </g>
      <text x="32" y="192" className="cw-small" fill="#5ee08f">II</text>
    </svg>
  );
}

// ---------------------------------------------------------------- Respiratory
function Resp({ a }) {
  const dur = 60 / clamp(a.rr || 14, 6, 44);
  const depth = a.kussmaul ? 1.16 : 1.05;
  const puffs = a.kussmaul ? 5 : 2;
  return (
    <svg viewBox="0 0 600 300" role="img" aria-label={`Lungs breathing ${a.rr} times a minute${a.kussmaul ? ', deep Kussmaul breaths' : ''}.`}>
      <path d="M300 44 L300 110 M300 110 C 284 120, 268 126, 252 132 M300 110 C 316 120, 332 126, 348 132" stroke="#9fb1a9" strokeWidth="12" fill="none" strokeLinecap="round" />
      <g className="cw-breathe" style={{ animationDuration: `${dur}s`, '--depth': depth, transformOrigin: '300px 120px' }}>
        <path d="M282 100 C 210 90, 170 160, 178 230 C 184 272, 240 280, 286 252 C 292 200, 292 150, 282 100 Z" fill="#93c5fd" stroke={INK} strokeWidth="3" />
        <path d="M318 100 C 390 90, 430 160, 422 230 C 416 272, 360 280, 314 252 C 308 200, 308 150, 318 100 Z" fill="#93c5fd" stroke={INK} strokeWidth="3" />
        <path d="M250 150 C 236 170, 230 196, 232 220 M350 150 C 364 170, 370 196, 368 220" stroke="#3b82f6" strokeWidth="3" fill="none" opacity="0.6" />
      </g>
      {a.crackles && (
        <g className="cw-blink">
          <path d="M196 246 q 6 -8 12 0 t 12 0 t 12 0 M366 246 q 6 -8 12 0 t 12 0 t 12 0" stroke="#fbbf24" strokeWidth="3" fill="none" />
          <text x="300" y="292" textAnchor="middle" className="cw-small" fill="#fbbf24">crackles</text>
        </g>
      )}
      {a.ventilated ? (
        <g>
          <rect x="286" y="0" width="28" height="40" rx="6" fill="#e5e7eb" stroke={INK} strokeWidth="2" />
          <text x="420" y="30" className="cw-small" fill="#fbbf24">ventilator</text>
        </g>
      ) : (
        Array.from({ length: puffs }).map((_, i) => (
          <g key={i} className="cw-puff" style={{ animationDuration: `${dur}s`, animationDelay: `${(-i / puffs) * dur}s` }}>
            <circle cx={300 + (i % 2 ? 14 : -14)} cy="40" r="11" fill="#cbd5e1" fillOpacity="0.85" stroke={INK} strokeWidth="1.5" />
            <text x={300 + (i % 2 ? 14 : -14)} y="44" textAnchor="middle" fontSize="9" fontWeight="700" fill={INK}>CO₂</text>
          </g>
        ))
      )}
      <g transform="translate(520 220)">
        <circle r="40" fill="none" stroke="#24312c" strokeWidth="10" />
        <circle r="40" fill="none" stroke={a.spo2 < 94 ? '#fbbf24' : '#5ee08f'} strokeWidth="10"
          strokeDasharray={`${(clamp(a.spo2, 70, 100) - 70) / 30 * 251} 251`} transform="rotate(-90)" strokeLinecap="round" />
        <text y="6" textAnchor="middle" className="cw-small" fill="#e8f2ed">SpO₂</text>
      </g>
    </svg>
  );
}

// ---------------------------------------------------------------- Renal & Fluids
function Renal({ a }) {
  const dur = clamp(90 / Math.max(a.uo || 1, 1), 0.6, 5);
  const fill = clamp((a.uo || 0) / 150, 0.1, 1);
  return (
    <svg viewBox="0 0 600 300" role="img" aria-label={`Kidney making ${a.uo} mL of urine an hour.${a.shifting ? ' Potassium is moving into the cells.' : ''}`}>
      {/* kidney */}
      <path d="M120 40 C 60 40, 40 110, 60 160 C 76 200, 130 206, 150 176 C 160 160, 136 140, 140 116 C 144 92, 168 82, 164 62 C 160 46, 140 40, 120 40 Z"
        fill="#c2410c" stroke={INK} strokeWidth="3" />
      <path d="M90 80 C 80 110, 84 140, 100 160" stroke="#fdba74" strokeWidth="4" fill="none" opacity="0.7" />
      {[0, 1, 2].map((i) => (
        <circle key={i} r="4" fill="#fecaca" className="cw-flow"
          style={{ offsetPath: "path('M160 60 C 120 50, 80 70, 80 110 C 80 150, 120 170, 150 150')", animationDuration: '2.4s', animationDelay: `${-i * 0.8}s` }} />
      ))}
      {/* ureter to bag */}
      <path d="M140 140 C 180 170, 190 200, 200 228" stroke="#fde68a" strokeWidth="6" fill="none" />
      <g key={Math.round(dur * 10)}>
        <circle cx="200" cy="228" r="4.5" fill="#fde047" className="cw-drip" style={{ '--len': '26px', animationDuration: `${dur}s` }} />
      </g>
      <rect x="176" y="250" width="56" height="44" rx="10" fill="none" stroke="#fde68a" strokeWidth="2.5" />
      <rect x="180" y={290 - 38 * fill} width="48" height={38 * fill} rx="7" fill="#fde047" fillOpacity="0.7" />
      <text x="248" y="280" className="cw-small" fill="#fde68a">urine</text>

      {/* a cell: potassium shifts in with insulin */}
      <g transform="translate(430 150)">
        <circle r="96" fill="#123026" stroke="#5ee08f" strokeWidth="3" strokeDasharray="10 6" />
        <text y="-70" textAnchor="middle" className="cw-small" fill="#9fb1a9">a body cell</text>
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const ang = (i / 6) * Math.PI * 2;
          const ox = Math.cos(ang) * 140, oy = Math.sin(ang) * 120;
          const ix = Math.cos(ang) * 50, iy = Math.sin(ang) * 40;
          return a.shifting ? (
            <g key={i} className="cw-flow" style={{ offsetPath: `path('M${ox.toFixed(0)} ${oy.toFixed(0)} L${ix.toFixed(0)} ${iy.toFixed(0)}')`, animationDuration: '3s', animationDelay: `${-i * 0.5}s`, offsetRotate: '0deg' }}>
              <circle r="11" fill="#a78bfa" stroke={INK} strokeWidth="1.5" />
              <text y="4" textAnchor="middle" fontSize="11" fontWeight="700" fill={INK}>K⁺</text>
            </g>
          ) : (
            <g key={i} className="cw-float" style={{ animationDelay: `${-i * 0.6}s` }} transform={`translate(${(ox * 0.85).toFixed(0)} ${(oy * 0.8).toFixed(0)})`}>
              <circle r="11" fill="#a78bfa" stroke={INK} strokeWidth="1.5" />
              <text y="4" textAnchor="middle" fontSize="11" fontWeight="700" fill={INK}>K⁺</text>
            </g>
          );
        })}
        <text y="110" textAnchor="middle" className="cw-small" fill={a.shifting ? '#c4b5fd' : '#9fb1a9'}>
          {a.shifting ? 'insulin is moving K⁺ into cells' : 'K⁺ stays in the blood'}
        </text>
      </g>
      {a.kclIn && (
        <g>
          <path d="M300 30 C 300 60, 320 70, 340 70" stroke="#a78bfa" strokeWidth="4" fill="none" strokeDasharray="6 6" className="cw-dash" />
          <text x="300" y="22" textAnchor="middle" className="cw-small" fill="#c4b5fd">KCl running</text>
        </g>
      )}
    </svg>
  );
}

// ---------------------------------------------------------------- Metabolic
function Metabolic({ a }) {
  const on = a.insulin > 0;
  const keyDur = on ? clamp(0.6 / a.insulin, 3, 12) : 0;
  const ketones = clamp(Math.round((a.bhb || 0) * 2), 0, 14);
  return (
    <svg viewBox="0 0 600 300" role="img" aria-label={`Insulin ${on ? 'running' : 'off'}. Ketones ${ketones > 6 ? 'high' : ketones > 1 ? 'present' : 'nearly cleared'}.`}>
      {/* ketone bubbles in the blood */}
      {Array.from({ length: ketones }).map((_, i) => (
        <circle key={i} cx={30 + ((i * 41) % 200)} cy={280} r={6 + (i % 3) * 2} fill="#f97316" fillOpacity="0.55" stroke="#fdba74"
          className="cw-bubble" style={{ animationDuration: `${4 + (i % 4)}s`, animationDelay: `${-i * 0.7}s` }} />
      ))}
      <text x="20" y="24" className="cw-small" fill="#fdba74">ketones in the blood</text>
      {/* cell with insulin receptors */}
      <g transform="translate(400 160)">
        <rect x="-130" y="-110" width="260" height="220" rx="60" fill="#1d1533" stroke="#a78bfa" strokeWidth="3" />
        <text y="-84" textAnchor="middle" className="cw-small" fill="#c4b5fd">muscle and fat cell</text>
        {[-60, 0, 60].map((y) => (
          <g key={y} transform={`translate(-130 ${y})`}>
            <rect x="-6" y="-14" width="12" height="28" rx="3" fill={on ? '#5ee08f' : '#475569'} stroke={INK} strokeWidth="1.5" />
          </g>
        ))}
        {/* glucose entering when insulin is on */}
        {Array.from({ length: 6 }).map((_, i) => (
          <g key={i} className={on ? 'cw-flow' : 'cw-float'}
            style={on ? { offsetPath: `path('M-230 ${-60 + (i % 3) * 60} L-40 ${-60 + (i % 3) * 60 + (i > 2 ? 20 : -10)}')`, animationDuration: `${keyDur * 0.6}s`, animationDelay: `${-i * keyDur * 0.1}s`, offsetRotate: '0deg' }
              : { animationDelay: `${-i * 0.5}s` }}
            transform={on ? undefined : `translate(${-200 + (i % 2) * 30} ${-70 + i * 26})`}>
            <polygon points="0,-9 8,-4 8,5 0,10 -8,5 -8,-4" fill="#fde047" stroke={INK} strokeWidth="1.5" />
          </g>
        ))}
        <text y="96" textAnchor="middle" className="cw-small" fill={on ? '#5ee08f' : '#9fb1a9'}>
          {on ? 'insulin is letting glucose in' : 'no insulin: glucose stays out'}
        </text>
      </g>
      {/* insulin keys arriving */}
      {on && Array.from({ length: 3 }).map((_, i) => (
        <g key={i} className="cw-flow" style={{ offsetPath: `path('M120 ${100 + i * 60} L262 ${100 + (i - 1) * 60 + 60}')`, animationDuration: `${keyDur}s`, animationDelay: `${(-i / 3) * keyDur}s`, offsetRotate: '0deg' }}>
          <circle cx="-8" r="7" fill="#60a5fa" stroke={INK} strokeWidth="1.5" />
          <rect x="-2" y="-3" width="16" height="6" rx="1.5" fill="#60a5fa" stroke={INK} strokeWidth="1.5" />
        </g>
      ))}
      {a.dextrose > 0 && <IvBag x={210} y={10} label={`D${a.dextrose}`} rate={250} color="#fde68a" />}
    </svg>
  );
}

// ---------------------------------------------------------------- Neuro
function Neuro({ a }) {
  const eyes = a.gcs >= 15 ? 1 : a.gcs >= 13 ? 0.45 : a.gcs >= 10 ? 0.2 : 0.05;
  return (
    <svg viewBox="0 0 600 300" role="img" aria-label={`GCS ${a.gcs}.${a.pressure ? ' Signs of rising pressure in the brain.' : ''}${a.sweaty ? ' Sweaty.' : ''}`}>
      {a.pressure > 0 && [0, 1, 2].map((i) => (
        <ellipse key={i} cx="300" cy="110" rx="150" ry="95" fill="none" stroke="#ef4444" strokeWidth={a.pressure * 2}
          className="cw-ring" style={{ animationDelay: `${-i * 0.6}s` }} />
      ))}
      <g className="cw-brain" style={{ transformOrigin: '300px 110px' }}>
        <path d="M300 30 C 250 20, 200 40, 196 84 C 160 96, 162 150, 200 160 C 210 196, 260 200, 290 184 C 300 190, 310 190, 320 184 C 350 200, 400 196, 410 160 C 448 150, 440 96, 404 84 C 400 40, 350 20, 300 30 Z"
          fill="#f9a8d4" stroke={INK} strokeWidth="3" />
        <path d="M300 34 L300 182 M236 70 q 20 14 0 30 t 4 34 M364 70 q -20 14 0 30 t -4 34 M216 128 q 24 -6 30 10 M384 128 q -24 -6 -30 10"
          stroke="#be185d" strokeWidth="3" fill="none" strokeLinecap="round" />
      </g>
      {a.headache && (
        <path d="M150 50 l 14 10 l -10 6 l 14 10 M450 50 l -14 10 l 10 6 l -14 10" stroke="#fbbf24" strokeWidth="4" fill="none" className="cw-blink" />
      )}
      {/* face: eyes open with GCS */}
      <g transform="translate(300 245)">
        <circle r="48" fill="#fde2c8" stroke={INK} strokeWidth="3" />
        {[-18, 18].map((x) => (
          <g key={x} transform={`translate(${x} -6)`}>
            <ellipse rx="10" ry={10 * eyes} fill="#fff" stroke={INK} strokeWidth="2" />
            {eyes > 0.15 && <circle r={Math.min(4.5, 9 * eyes)} fill={INK} />}
          </g>
        ))}
        <path d={a.gcs >= 15 ? 'M-14 22 q 14 8 28 0' : 'M-12 24 q 12 -4 24 0'} stroke={INK} strokeWidth="3" fill="none" strokeLinecap="round" />
        {a.sweaty && [[-34, -26], [36, -20], [-40, 8]].map(([x, y], i) => (
          <path key={i} d={`M${x} ${y} c 0 6 -6 10 -6 14 a 6 6 0 0 0 12 0 c 0 -4 -6 -8 -6 -14 z`} fill="#93c5fd" stroke={INK} strokeWidth="1.5"
            className="cw-sweat" style={{ animationDelay: `${-i * 0.5}s` }} />
        ))}
      </g>
      <text x="470" y="240" className="cw-big" fill="#e8f2ed">GCS {a.gcs}</text>
    </svg>
  );
}
