import React from 'react';
import { TABLES } from '../engine/game.js';

// The projector's patient. Calm on purpose: the only steady motion is the heart, which
// beats at Jordan's rate. The IV pole shows what is actually hanging: the main bag named
// as the protocol names it, the insulin drip, and the potassium bolus, each with its pump.
// A bag that is new or changed slides onto the pole once. A symptom is drawn only when a
// table's gauges are red.
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const INK = '#14161a';
const CX = 440;
const HX = CX + 6;

const LABELS = {
  neuro: { sub: 'Brain', x: 40, y: 70, to: [CX - 40, 96] },
  resp: { sub: 'Lungs, blood gas', x: 612, y: 150, to: [CX + 56, 230] },
  cardio: { sub: 'Heart, IV fluids', x: 40, y: 220, to: [CX - 20, 246] },
  metabolic: { sub: 'Pancreas, liver, insulin', x: 612, y: 300, to: [CX + 50, 330] },
  renal: { sub: 'Kidneys, potassium', x: 40, y: 400, to: [CX - 50, 372] },
};
const LW = 228, LH = 70;
const POLE_X = 1010;

function Bag({ x, y, w, h, color, lines, sig }) {
  return (
    <g key={sig} className="iv-bag-in">
      <line x1={x + w / 2} y1={y - 16} x2={x + w / 2} y2={y} stroke={INK} strokeWidth="2.5" />
      <rect x={x} y={y} width={w} height={h} rx="10" fill="#f8fbff" stroke={INK} strokeWidth="2.5" />
      <rect x={x + 5} y={y + h * 0.28} width={w - 10} height={h * 0.66} rx="7" fill={color} fillOpacity="0.35" />
      {lines.map((t, i) => (
        <text key={i} x={x + w / 2} y={y + 20 + i * 17} textAnchor="middle" fontSize={i === 0 ? 14.5 : 13} fontWeight={i === 0 ? 700 : 500} fill={INK}>{t}</text>
      ))}
      <rect x={x + w / 2 - 5} y={y + h} width="10" height="14" fill="#cbd5e1" stroke={INK} strokeWidth="1.5" />
    </g>
  );
}

function Pump({ x, y, text, sub }) {
  return (
    <g>
      <rect x={x} y={y} width="96" height="52" rx="8" fill="#e2e8f0" stroke={INK} strokeWidth="2.5" />
      <rect x={x + 7} y={y + 7} width="82" height="26" rx="4" fill="#052e1c" />
      <text x={x + 48} y={y + 26} textAnchor="middle" fontSize="15" fontWeight="700" fill="#5ee08f" fontFamily="JetBrains Mono, monospace">{text}</text>
      <text x={x + 48} y={y + 46} textAnchor="middle" fontSize="11" fill="#334155">{sub}</text>
    </g>
  );
}

export default function Patient({ anim, status, stopped }) {
  const c = anim?.cardio || {};
  const iv = anim?.iv || {};
  const beat = 60 / clamp(c.hr || 80, 30, 200);
  const red = (t) => status?.[t] === 'red';
  const struggling = status && Object.values(status).some((s) => s !== 'green');

  const mainName = iv.dextrose ? `Dextrose 5%–${iv.nacl || '0.9% NaCl'}` : (iv.nacl || '0.9% NaCl');
  const mainLines = iv.dextrose ? ['Dextrose 5%–', iv.nacl] : [iv.nacl || '0.9% NaCl'];
  if (iv.kcl) mainLines.push(`w/ ${iv.kcl} mEq K⁺`);
  const mainColor = iv.dextrose ? '#fde68a' : iv.kcl ? '#c4b5fd' : '#93c5fd';
  const bolus = iv.rate >= 1000;

  // Pole layout: main bag left, insulin center, potassium bolus right.
  const bags = [];
  if (iv.rate > 0) bags.push({ id: 'main', x: POLE_X - 150, w: 124, h: 112, color: mainColor, lines: mainLines, sig: `${mainName}|${iv.kcl}`,
    pump: bolus ? 'BOLUS' : `${iv.rate} mL/h`, pumpSub: bolus ? '1,000 mL/hr' : 'primary' });
  if (iv.insulin > 0) bags.push({ id: 'ins', x: POLE_X - 16, w: 88, h: 90, color: '#60a5fa', lines: ['Regular', 'insulin', '1 unit/mL'], sig: 'ins',
    pump: `${iv.insulin} u/h`, pumpSub: 'insulin' });
  if (iv.kBolus) bags.push({ id: 'k', x: POLE_X + 78, w: 80, h: 80, color: '#a78bfa', lines: ['KCl', '40 mEq', 'bolus'], sig: 'k',
    pump: '10 mEq/h', pumpSub: 'potassium' });

  return (
    <svg viewBox="0 0 1180 614" className="patient" role="img"
      aria-label={`Jordan is ${struggling ? 'struggling' : 'steady'}. Hanging: ${iv.rate ? mainName + (iv.kcl ? ` with ${iv.kcl} mEq potassium` : '') : 'no IV fluid'}${iv.insulin ? ', insulin drip' : ''}${iv.kBolus ? ', potassium bolus' : ''}.`}>
      <defs>
        <linearGradient id="figFill" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#b9c3d8" /><stop offset=".45" stopColor="#d6dcea" /><stop offset="1" stopColor="#b3bdd3" />
        </linearGradient>
        <radialGradient id="halo"><stop offset="0" stopColor="#fff" /><stop offset="1" stopColor="#eef2fa" /></radialGradient>
        <radialGradient id="haloS"><stop offset="0" stopColor="#fff7e6" /><stop offset=".7" stopColor="#fde3a7" /><stop offset="1" stopColor="#f8c76b" /></radialGradient>
      </defs>

      <ellipse cx={CX} cy="330" rx="240" ry="270" fill={struggling ? 'url(#haloS)' : 'url(#halo)'} />
      {struggling && <ellipse cx={CX} cy="330" rx="232" ry="262" fill="none" stroke="#f59e0b" strokeWidth="4" strokeDasharray="12 10" />}
      {red('metabolic') && <ellipse cx={CX} cy="330" rx="200" ry="240" fill="#f97316" fillOpacity="0.12" />}

      <g className={stopped ? 'pt-stopped' : ''}>
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

        <path d={`M${CX - 36} 104 C ${CX - 40} 70, ${CX - 10} 58, ${CX} 64 C ${CX + 14} 56, ${CX + 44} 70, ${CX + 38} 104 C ${CX + 30} 118, ${CX - 30} 120, ${CX - 36} 104 Z`}
          fill="#f9a8d4" stroke={INK} strokeWidth="2.5" />
        <path d={`M${CX - 12} 190 C ${CX - 60} 186, ${CX - 76} 230, ${CX - 74} 270 C ${CX - 72} 296, ${CX - 46} 300, ${CX - 16} 286 Z`} fill="#93c5fd" stroke={INK} strokeWidth="2.5" />
        <path d={`M${CX + 12} 190 C ${CX + 60} 186, ${CX + 76} 230, ${CX + 74} 270 C ${CX + 72} 296, ${CX + 46} 300, ${CX + 16} 286 Z`} fill="#93c5fd" stroke={INK} strokeWidth="2.5" />
        <path d={`M${CX - 70} 304 C ${CX - 60} 290, ${CX + 10} 290, ${CX + 20} 300 C ${CX + 16} 320, ${CX - 30} 340, ${CX - 66} 336 C ${CX - 80} 330, ${CX - 78} 312, ${CX - 70} 304 Z`} fill="#b45309" stroke={INK} strokeWidth="2.5" />
        <path d={`M${CX + 8} 344 C ${CX + 30} 334, ${CX + 60} 334, ${CX + 66} 342 C ${CX + 60} 352, ${CX + 30} 354, ${CX + 8} 344 Z`} fill="#fcd34d" stroke={INK} strokeWidth="2.5" />
        {[[CX - 46, 372, 0], [CX + 46, 372, 1]].map(([x, y, i]) => (
          <path key={i} d={`M${x} ${y - 18} c ${i ? 16 : -16} 0 ${i ? 16 : -16} 36 0 36 c ${i ? -8 : 8} 0 ${i ? -8 : 8} -12 ${i ? -2 : 2} -18 c ${i ? -6 : 6} -6 ${i ? -6 : 6} -18 0 -18 z`}
            fill={red('renal') ? '#78716c' : '#c2410c'} stroke={INK} strokeWidth="2.5" />
        ))}

        {/* the heart: the one thing that keeps moving, at Jordan's rate */}
        <g className={`cw-heart ${red('cardio') ? 'cw-quiver' : ''}`} style={{ animationDuration: `${beat}s`, transformOrigin: `${HX}px 255px` }}>
          <path d={`M${HX} 232 C ${HX - 10} 216, ${HX - 36} 222, ${HX - 34} 244 C ${HX - 32} 264, ${HX - 10} 276, ${HX} 286 C ${HX + 12} 276, ${HX + 34} 262, ${HX + 34} 242 C ${HX + 34} 220, ${HX + 10} 216, ${HX} 232 Z`}
            fill="#e11d48" stroke={INK} strokeWidth="3" />
        </g>

        {/* symptoms, only at red (still drawings) */}
        {red('neuro') && [0, 120, 240].map((dg) => {
          const ang = (dg * Math.PI) / 180;
          return <path key={dg} d="M0 -9 L2.6 -2.8 L9 -2.8 L4 1.2 L5.8 8 L0 4 L-5.8 8 L-4 1.2 L-9 -2.8 L-2.6 -2.8 Z"
            transform={`translate(${(CX + 62 * Math.cos(ang)).toFixed(1)} ${(46 + 18 * Math.sin(ang)).toFixed(1)})`} fill="#facc15" stroke={INK} strokeWidth="2" />;
        })}
        {red('resp') && (
          <path d={`M${CX + 30} 120 q 20 -4 34 4 M${CX + 34} 134 q 24 0 40 10 M${CX + 30} 148 q 20 4 34 14`} stroke="#0369a1" strokeWidth="4" fill="none" strokeLinecap="round" />
        )}
        {red('cardio') && (
          <path d={`M${HX + 44} 226 l 12 -10 l -4 12 l 12 -8 M${HX - 44} 226 l -12 -10 l 4 12 l -12 -8`} stroke="#e11d48" strokeWidth="4" fill="none" />
        )}
        {iv.basal && (
          <g transform={`translate(${CX - 128} 300) rotate(-30)`}>
            <rect x="-4" y="-22" width="8" height="30" rx="2" fill="#e0f2fe" stroke={INK} strokeWidth="1.5" />
            <text x="12" y="-6" fontSize="12" fontWeight="700" fill={INK} transform="rotate(30)">basal SC</text>
          </g>
        )}
      </g>

      {/* IV pole */}
      <g>
        <line x1={POLE_X} y1="18" x2={POLE_X} y2="590" stroke="#64748b" strokeWidth="6" strokeLinecap="round" />
        <line x1={POLE_X - 170} y1="22" x2={POLE_X + 170} y2="22" stroke="#64748b" strokeWidth="5" strokeLinecap="round" />
        <path d={`M${POLE_X - 60} 590 l 60 -18 l 60 18`} stroke="#64748b" strokeWidth="6" fill="none" strokeLinecap="round" />
        {bags.length === 0 && <text x={POLE_X} y="120" textAnchor="middle" fontSize="16" fill="#64748b">Nothing infusing</text>}
        {bags.map((b, i) => {
          const pumpY = 300 + i * 66;
          const top = 38;
          return (
            <g key={b.id}>
              <Bag x={b.x} y={top} w={b.w} h={b.h} color={b.color} lines={b.lines} sig={b.sig} />
              {/* tubing: bag to its pump, pump to the right arm */}
              <path d={`M${b.x + b.w / 2} ${top + b.h + 14} C ${b.x + b.w / 2} ${top + b.h + 80}, ${POLE_X - 120} ${pumpY - 30}, ${POLE_X - 110} ${pumpY + 26}`}
                stroke="#38bdf8" strokeWidth="3" fill="none" />
              <Pump x={POLE_X - 144} y={pumpY} text={b.pump} sub={b.pumpSub} />
              <path d={`M${POLE_X - 144} ${pumpY + 30} C ${POLE_X - 250} ${pumpY + 40}, ${CX + 200} ${470 + i * 6}, ${CX + 132} ${384 - i * 4}`}
                stroke={b.id === 'ins' ? '#2563eb' : b.id === 'k' ? '#7c3aed' : '#38bdf8'} strokeWidth="3" fill="none" />
            </g>
          );
        })}
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
