import React from 'react';
import { TABLES } from '../engine/game.js';

// The projector's living patient. Never a number: the heart beats at Jordan's rate,
// the lungs breathe at his rate and depth, IV fluid and insulin are drawn on their
// way, the whole body reads "steady" or "struggling", and a symptom is drawn only
// when a table's gauges are red.
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const INK = '#14161a';
const CX = 440;
const HX = CX + 6, HY = 244;

const LOOPS = [
  `M${HX} ${HY} C ${HX + 12} 200, ${CX + 10} 150, ${CX + 14} 100 C ${CX + 10} 140, ${CX - 14} 180, ${HX - 10} ${HY}`,
  `M${HX} ${HY} C ${CX + 60} 230, ${CX + 110} 260, ${CX + 130} 380 C ${CX + 100} 280, ${CX + 40} 260, ${HX} ${HY}`,
  `M${HX} ${HY} C ${CX - 60} 230, ${CX - 110} 260, ${CX - 130} 380 C ${CX - 100} 280, ${CX - 40} 260, ${HX} ${HY}`,
  `M${HX} ${HY} C ${CX + 20} 330, ${CX + 50} 420, ${CX + 46} 570 C ${CX + 34} 440, ${CX + 6} 340, ${HX} ${HY}`,
  `M${HX} ${HY} C ${CX - 20} 330, ${CX - 50} 420, ${CX - 46} 570 C ${CX - 34} 440, ${CX - 6} 340, ${HX} ${HY}`,
  `M${HX} ${HY} C ${CX + 30} 300, ${CX + 60} 340, ${CX + 46} 372 C ${CX + 20} 380, ${CX - 40} 380, ${CX - 46} 372 C ${CX - 60} 340, ${CX - 20} 300, ${HX} ${HY}`,
];

const LABELS = {
  neuro: { sub: 'Brain', x: 40, y: 70, to: [CX - 40, 96] },
  resp: { sub: 'Lungs, blood gas', x: 612, y: 160, to: [CX + 56, 230] },
  cardio: { sub: 'Heart, IV fluids', x: 40, y: 220, to: [CX - 20, 246] },
  metabolic: { sub: 'Pancreas, liver, insulin', x: 612, y: 330, to: [CX + 50, 330] },
  renal: { sub: 'Kidneys, potassium', x: 40, y: 400, to: [CX - 50, 372] },
};
const LW = 228, LH = 70;

export default function Patient({ anim, status, stopped }) {
  const c = anim?.cardio || {}, r = anim?.resp || {}, m = anim?.metabolic || {};
  const beat = 60 / clamp(c.hr || 80, 30, 200);
  const breath = 60 / clamp(r.rr || 14, 6, 44);
  const depth = r.kussmaul ? 1.1 : 1.03;
  const red = (t) => status?.[t] === 'red';
  const struggling = status && Object.values(status).some((s) => s !== 'green');
  const fluidDur = c.fluidRate ? clamp((250 / c.fluidRate) * 1.2, 0.45, 3) : 0;
  const insulinOn = (m.insulin || 0) > 0;

  return (
    <svg viewBox="0 0 880 614" className="patient" role="img"
      aria-label={`Jordan is ${struggling ? 'struggling' : 'steady'}.${c.fluidRate ? ' IV fluid is running.' : ''}${insulinOn ? ' Insulin is on its way.' : ''}`}>
      <defs>
        <linearGradient id="figFill" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#b9c3d8" /><stop offset=".45" stopColor="#d6dcea" /><stop offset="1" stopColor="#b3bdd3" />
        </linearGradient>
        <radialGradient id="halo"><stop offset="0" stopColor="#fff" /><stop offset="1" stopColor="#eef2fa" /></radialGradient>
        <radialGradient id="haloS"><stop offset="0" stopColor="#fff7e6" /><stop offset=".7" stopColor="#fde3a7" /><stop offset="1" stopColor="#f8c76b" /></radialGradient>
      </defs>

      <ellipse cx={CX} cy="330" rx="240" ry="270" fill={struggling ? 'url(#haloS)' : 'url(#halo)'} />
      {struggling && <ellipse cx={CX} cy="330" rx="232" ry="262" fill="none" stroke="#f59e0b" strokeWidth="4" strokeDasharray="12 10" className="pt-stress" />}

      {/* ketone haze: Metabolic red */}
      {red('metabolic') && <ellipse cx={CX} cy="330" rx="200" ry="240" fill="#f97316" fillOpacity="0.12" className="pt-haze" />}

      <g className={stopped ? 'pt-stopped' : ''}>
        {/* body */}
        {[
          ['circle', { cx: CX, cy: 108, r: 50 }],
          ['rect', { x: CX - 20, y: 150, width: 40, height: 30, rx: 8 }],
          ['rect', { x: CX - 92, y: 168, width: 184, height: 240, rx: 56 }],
          ['rect', { x: CX - 140, y: 178, width: 46, height: 214, rx: 23, transform: `rotate(8 ${CX - 117} 190)` }],
          ['rect', { x: CX + 94, y: 178, width: 46, height: 214, rx: 23, transform: `rotate(-8 ${CX + 117} 190)` }],
          ['rect', { x: CX - 78, y: 370, width: 68, height: 214, rx: 30 }],
          ['rect', { x: CX + 10, y: 370, width: 68, height: 214, rx: 30 }],
        ].map(([Tag, p], i) => (
          <g key={i}>
            {React.createElement(Tag, { ...p, fill: INK, stroke: INK, strokeWidth: 6 })}
            {React.createElement(Tag, { ...p, fill: 'url(#figFill)' })}
          </g>
        ))}

        {/* brain */}
        <path d={`M${CX - 36} 104 C ${CX - 40} 70, ${CX - 10} 58, ${CX} 64 C ${CX + 14} 56, ${CX + 44} 70, ${CX + 38} 104 C ${CX + 30} 118, ${CX - 30} 120, ${CX - 36} 104 Z`}
          fill="#f9a8d4" stroke={INK} strokeWidth="2.5" />
        {/* lungs */}
        <g className="pt-breath" style={{ animationDuration: `${breath}s`, '--depth': depth, transformOrigin: `${CX}px 200px` }}>
          <path d={`M${CX - 12} 190 C ${CX - 60} 186, ${CX - 76} 230, ${CX - 74} 270 C ${CX - 72} 296, ${CX - 46} 300, ${CX - 16} 286 Z`} fill="#93c5fd" stroke={INK} strokeWidth="2.5" />
          <path d={`M${CX + 12} 190 C ${CX + 60} 186, ${CX + 76} 230, ${CX + 74} 270 C ${CX + 72} 296, ${CX + 46} 300, ${CX + 16} 286 Z`} fill="#93c5fd" stroke={INK} strokeWidth="2.5" />
        </g>
        {/* liver and pancreas */}
        <path d={`M${CX - 70} 304 C ${CX - 60} 290, ${CX + 10} 290, ${CX + 20} 300 C ${CX + 16} 320, ${CX - 30} 340, ${CX - 66} 336 C ${CX - 80} 330, ${CX - 78} 312, ${CX - 70} 304 Z`} fill="#b45309" stroke={INK} strokeWidth="2.5" />
        <path d={`M${CX + 8} 344 C ${CX + 30} 334, ${CX + 60} 334, ${CX + 66} 342 C ${CX + 60} 352, ${CX + 30} 354, ${CX + 8} 344 Z`} fill="#fcd34d" stroke={INK} strokeWidth="2.5" />
        {/* kidneys */}
        {[[CX - 46, 372, 0], [CX + 46, 372, 1]].map(([x, y, i]) => (
          <path key={i} d={`M${x} ${y - 18} c ${i ? 16 : -16} 0 ${i ? 16 : -16} 36 0 36 c ${i ? -8 : 8} 0 ${i ? -8 : 8} -12 ${i ? -2 : 2} -18 c ${i ? -6 : 6} -6 ${i ? -6 : 6} -18 0 -18 z`}
            fill={red('renal') ? '#78716c' : '#c2410c'} stroke={INK} strokeWidth="2.5" />
        ))}

        {/* blood */}
        {LOOPS.map((d, li) => (
          <g key={li}>
            <path d={d} fill="none" stroke="#7f1d1d" strokeOpacity="0.25" strokeWidth="5" />
            {[0, 1, 2].map((i) => (
              <circle key={i} r="5" fill="#b3121b" stroke="#fff" strokeWidth="1.5" className="cw-flow"
                style={{ offsetPath: `path('${d}')`, animationDuration: `${beat * 5}s`, animationDelay: `${(-i / 3) * beat * 5}s` }} />
            ))}
          </g>
        ))}

        {/* heart */}
        <g className={`cw-heart ${red('cardio') ? 'cw-quiver' : ''}`} style={{ animationDuration: `${beat}s`, transformOrigin: `${HX}px 255px` }}>
          <path d={`M${HX} 232 C ${HX - 10} 216, ${HX - 36} 222, ${HX - 34} 244 C ${HX - 32} 264, ${HX - 10} 276, ${HX} 286 C ${HX + 12} 276, ${HX + 34} 262, ${HX + 34} 242 C ${HX + 34} 220, ${HX + 10} 216, ${HX} 232 Z`}
            fill="#e11d48" stroke={INK} strokeWidth="3" />
        </g>

        {/* IV bag above the right arm, line into the arm */}
        <g>
          <rect x="600" y="80" width="44" height="60" rx="9" fill="#e0f2fe" stroke={INK} strokeWidth="2.5" />
          <path d="M622 140 L622 150 C 622 220, 600 260, 572 300" fill="none" stroke="#38bdf8" strokeWidth="3" />
          {fluidDur > 0 && [0, 1, 2].map((i) => (
            <circle key={i} r="4" fill="#38bdf8" stroke={INK} strokeWidth="1" className="cw-flow"
              style={{ offsetPath: "path('M622 150 C 622 220, 600 260, 572 300')", animationDuration: `${fluidDur * 3}s`, animationDelay: `${(-i / 3) * fluidDur * 3}s` }} />
          ))}
        </g>

        {/* insulin keys on their way from the IV to the cells */}
        {insulinOn && [0, 1].map((i) => (
          <g key={i} className="cw-flow" style={{ offsetPath: `path('M572 300 C 540 340, 480 400, 470 470')`, animationDuration: '3.4s', animationDelay: `${-i * 1.7}s`, offsetRotate: '0deg' }}>
            <circle cx="-8" r="7" fill="#2563eb" stroke={INK} strokeWidth="1.5" />
            <rect x="-2" y="-3" width="16" height="6" rx="1.5" fill="#2563eb" stroke={INK} strokeWidth="1.5" />
          </g>
        ))}

        {/* symptoms, only at red */}
        {red('neuro') && (
          <g className="pt-orbit" style={{ transformOrigin: `${CX}px 52px` }}>
            {[0, 120, 240].map((dg) => {
              const ang = (dg * Math.PI) / 180;
              return <path key={dg} d="M0 -9 L2.6 -2.8 L9 -2.8 L4 1.2 L5.8 8 L0 4 L-5.8 8 L-4 1.2 L-9 -2.8 L-2.6 -2.8 Z"
                transform={`translate(${(CX + 62 * Math.cos(ang)).toFixed(1)} ${(52 + 18 * Math.sin(ang)).toFixed(1)})`} fill="#facc15" stroke={INK} strokeWidth="2" />;
            })}
          </g>
        )}
        {red('resp') && (
          <path d={`M${CX + 30} 120 q 20 -4 34 4 M${CX + 34} 134 q 24 0 40 10 M${CX + 30} 148 q 20 4 34 14`} stroke="#0369a1" strokeWidth="4" fill="none" strokeLinecap="round" className="cw-blink" />
        )}
        {red('cardio') && (
          <path d={`M${HX + 44} 226 l 12 -10 l -4 12 l 12 -8 M${HX - 44} 226 l -12 -10 l 4 12 l -12 -8`} stroke="#e11d48" strokeWidth="4" fill="none" className="cw-blink" />
        )}
      </g>

      {/* table labels */}
      {TABLES.map((t) => {
        const L = LABELS[t.id];
        const right = L.x > CX;
        const ax = right ? L.x : L.x + LW, ay = L.y + LH / 2;
        return (
          <g key={t.id}>
            <path d={`M${ax} ${ay} L ${L.to[0]} ${L.to[1]}`} stroke={t.color} strokeWidth="3" fill="none" />
            <circle cx={L.to[0]} cy={L.to[1]} r="6" fill={t.color} stroke={INK} strokeWidth="2" />
            <rect x={L.x} y={L.y} width={LW} height={LH} rx="12" fill="#fff" stroke={INK} strokeWidth="2.5" />
            <rect x={L.x} y={L.y} width="16" height={LH} rx="6" fill={t.color} />
            <text x={L.x + 28} y={L.y + 31} fontSize="25" fontWeight="700" fill={INK}>{t.name}</text>
            <text x={L.x + 28} y={L.y + 57} fontSize="17" fill="#555">{L.sub}</text>
          </g>
        );
      })}
    </svg>
  );
}
