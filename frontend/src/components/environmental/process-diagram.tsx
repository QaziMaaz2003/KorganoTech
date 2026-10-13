"use client";

import { motion, useReducedMotion } from "motion/react";

const C = {
  deep: "#0f3b44",
  co2: "#1f64c8",
  flare: "#d9651b",
  ch4: "#2e8a4f",
  line: "#d5dfdd",
  muted: "#56696c",
  sorbent: "#8e4fa3",
};

const flows = {
  gasIn: "M196 252 H 262",
  methane: "M330 160 V 112 H 436",
  co2ToRegen: "M396 292 H 512",
  co2ToTank: "M648 255 H 792",
  reuse: "M580 322 V 408 H 330 V 350",
};

const round = (n: number) => Math.round(n * 100) / 100;

type Particle = { path: string; color: string; dur: number; begin: number };

const particles: Particle[] = [
  { path: flows.gasIn, color: C.flare, dur: 1.4, begin: 0 },
  { path: flows.gasIn, color: C.co2, dur: 1.4, begin: 0.7 },
  { path: flows.methane, color: C.ch4, dur: 1.8, begin: 0.2 },
  { path: flows.methane, color: C.ch4, dur: 1.8, begin: 1.1 },
  { path: flows.co2ToRegen, color: C.co2, dur: 1.6, begin: 0.4 },
  { path: flows.co2ToRegen, color: C.co2, dur: 1.6, begin: 1.2 },
  { path: flows.co2ToTank, color: C.co2, dur: 1.8, begin: 0.1 },
  { path: flows.co2ToTank, color: C.co2, dur: 1.8, begin: 1 },
  { path: flows.reuse, color: C.flare, dur: 3.2, begin: 0.5 },
  { path: flows.reuse, color: C.flare, dur: 3.2, begin: 2.1 },
];

function Label({ x, w, fill, lines }: { x: number; w: number; fill: string; lines: [string, string] }) {
  const cx = x + w / 2;
  return (
    <g>
      <rect x={x} y={14} width={w} height={50} rx={12} fill={fill} />
      <text x={cx} y={35} textAnchor="middle" fill="white" fontSize="12.5" fontWeight="700" letterSpacing="0.6">
        {lines[0]}
      </text>
      <text x={cx} y={52} textAnchor="middle" fill="white" fontSize="12.5" fontWeight="700" letterSpacing="0.6">
        {lines[1]}
      </text>
    </g>
  );
}

export function ProcessDiagram() {
  const reduceMotion = useReducedMotion();
  const sorbentDots: { x: number; y: number; i: number }[] = [];
  for (let row = 0; row < 7; row++) {
    for (let col = 0; col < 5; col++) {
      sorbentDots.push({ x: 290 + col * 20, y: 190 + row * 20, i: row * 5 + col });
    }
  }

  return (
    <svg
      viewBox="0 0 1000 440"
      className="h-auto w-full font-sans"
      role="img"
      aria-labelledby="process-title process-desc"
    >
      <title id="process-title">Environmental Filters process schematic</title>
      <desc id="process-desc">
        Landfill gas containing methane and carbon dioxide flows into a filter cartridge. Methane
        passes through and is recovered. Captured CO₂ moves to a solar-assisted automated
        regeneration unit, then to collection and compression. Regenerated media returns to the
        filter for reuse.
      </desc>
      <defs>
        {Object.entries({ co2: C.co2, ch4: C.ch4, flare: C.flare, muted: C.muted }).map(([k, v]) => (
          <marker
            key={k}
            id={`arrow-${k}`}
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path d="M0 0 L10 5 L0 10 z" fill={v} />
          </marker>
        ))}
        <linearGradient id="tank" x1="0" x2="1">
          <stop offset="0" stopColor="#dfe8e6" />
          <stop offset="0.45" stopColor="#ffffff" />
          <stop offset="1" stopColor="#c9d6d3" />
        </linearGradient>
        <radialGradient id="regen" cx="0.4" cy="0.35">
          <stop offset="0" stopColor="#1b5b66" />
          <stop offset="1" stopColor={C.deep} />
        </radialGradient>
      </defs>

      {/* Labels */}
      <Label x={220} w={220} fill={C.co2} lines={["CO₂ CAPTURE +", "METHANE RECOVERY"]} />
      <Label x={480} w={200} fill={C.flare} lines={["AUTOMATED", "REGENERATION"]} />
      <Label x={740} w={220} fill={C.ch4} lines={["CO₂ COLLECTION +", "COMPRESSION"]} />

      {/* Flow lines */}
      <g fill="none" strokeWidth="3" strokeLinecap="round">
        <path d={flows.gasIn} stroke={C.muted} markerEnd="url(#arrow-muted)" />
        <path d={flows.methane} stroke={C.ch4} markerEnd="url(#arrow-ch4)" />
        <path d={flows.co2ToRegen} stroke={C.co2} markerEnd="url(#arrow-co2)" />
        <path d={flows.co2ToTank} stroke={C.co2} markerEnd="url(#arrow-co2)" />
        <path
          d={flows.reuse}
          stroke={C.flare}
          strokeDasharray="7 7"
          markerEnd="url(#arrow-flare)"
          className="animate-dash"
        />
      </g>

      {/* Flow text */}
      <g fontSize="12" fontWeight="700" letterSpacing="0.8">
        <text x="440" y="104" fill={C.ch4} textAnchor="end">
          RECOVERED METHANE
        </text>
        <text x="454" y="282" fill={C.co2} textAnchor="middle">
          CO₂
        </text>
        <text x="720" y="245" fill={C.co2} textAnchor="middle">
          CO₂
        </text>
        <text x="455" y="428" fill={C.flare} textAnchor="middle">
          MEDIA REUSE
        </text>
      </g>

      {/* Flame at the methane outlet */}
      <g transform="translate(446 92)">
        <motion.path
          d="M10 0 C 14 7 20 11 20 19 a10 10 0 0 1 -20 0 c0 -5 3 -8 5 -11 c1 4 3 6 5 6 c-1 -5 -1 -9 0 -14z"
          fill={C.flare}
          style={{ originX: "50%", originY: "100%" }}
          animate={reduceMotion ? undefined : { scaleY: [1, 1.12, 0.96, 1.08, 1] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
        />
        <path d="M10 12 c3 3 5 5 5 8 a5 5 0 0 1 -10 0 c0 -3 2 -5 5 -8z" fill="#f4c261" />
      </g>

      {/* Landfill gas cloud */}
      <g>
        <g fill="#eef3f2" stroke={C.line} strokeWidth="2">
          <ellipse cx="80" cy="262" rx="58" ry="40" />
          <ellipse cx="130" cy="240" rx="55" ry="46" />
          <ellipse cx="160" cy="268" rx="40" ry="32" />
        </g>
        <ellipse cx="118" cy="262" rx="70" ry="34" fill="#eef3f2" />
        <text x="116" y="252" textAnchor="middle" fontSize="14" fontWeight="700" fill={C.deep} letterSpacing="0.6">
          LANDFILL GAS
        </text>
        <text x="116" y="274" textAnchor="middle" fontSize="13" fontWeight="600" fill={C.muted}>
          CH₄ + CO₂
        </text>
      </g>

      {/* Filter cartridge */}
      <g>
        <rect x="262" y="150" width="136" height="200" rx="16" fill="white" stroke={C.deep} strokeWidth="3" />
        <rect x="262" y="150" width="136" height="22" rx="10" fill={C.deep} />
        <rect x="262" y="328" width="136" height="22" rx="10" fill={C.deep} />
        {sorbentDots.map((dot) => (
          <motion.circle
            key={dot.i}
            cx={dot.x}
            cy={dot.y}
            r="6.5"
            initial={{ fill: C.sorbent }}
            animate={reduceMotion ? undefined : { fill: [C.sorbent, "#e0a23a", C.sorbent] }}
            transition={{ duration: 4, repeat: Infinity, delay: (dot.i % 7) * 0.12, ease: "easeInOut" }}
          />
        ))}
      </g>

      {/* Sun + solar heat */}
      <g>
        <g
          className={reduceMotion ? undefined : "animate-spin-slow"}
          style={{ transformBox: "fill-box", transformOrigin: "center" }}
        >
          {Array.from({ length: 12 }, (_, i) => {
            const a = (i * Math.PI) / 6;
            return (
              <line
                key={i}
                x1={round(580 + Math.cos(a) * 27)}
                y1={round(108 + Math.sin(a) * 27)}
                x2={round(580 + Math.cos(a) * 36)}
                y2={round(108 + Math.sin(a) * 36)}
                stroke="#f0b429"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
            );
          })}
        </g>
        <circle cx="580" cy="108" r="19" fill="#f6c343" />
        <path d="M580 150 V 186" stroke="#f0b429" strokeWidth="3" strokeDasharray="4 5" className="animate-dash" />
      </g>

      {/* Regeneration unit */}
      <g>
        <circle cx="580" cy="255" r="68" fill="url(#regen)" />
        <circle cx="580" cy="255" r="54" fill="none" stroke="white" strokeOpacity="0.15" strokeWidth="2" />
        <g
          className={reduceMotion ? undefined : "animate-spin-slow"}
          style={{ transformBox: "fill-box", transformOrigin: "center", animationDuration: "6s" }}
        >
          {Array.from({ length: 6 }, (_, i) => (
            <path
              key={i}
              d="M580 255 C 592 238, 606 232, 616 236 C 606 246, 596 252, 580 255z"
              fill="white"
              fillOpacity="0.85"
              transform={`rotate(${i * 60} 580 255)`}
            />
          ))}
          <circle cx="580" cy="255" r="9" fill={C.flare} />
        </g>
        {[0, 1, 2].map((i) => (
          <motion.path
            key={i}
            d={`M${562 + i * 18} 300 q 5 -8 0 -16 q -5 -8 0 -16`}
            fill="none"
            stroke={C.flare}
            strokeWidth="3"
            strokeLinecap="round"
            initial={{ opacity: 0.2, y: 0 }}
            animate={reduceMotion ? undefined : { opacity: [0.2, 1, 0.2], y: [0, -6, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.3 }}
          />
        ))}
      </g>

      {/* Compression tank */}
      <g>
        <rect x="812" y="150" width="76" height="16" rx="4" fill={C.deep} />
        <rect x="844" y="132" width="12" height="20" rx="3" fill={C.deep} />
        <path d="M800 190 a50 26 0 0 1 100 0 V 330 a50 18 0 0 1 -100 0z" fill="url(#tank)" stroke={C.deep} strokeWidth="3" />
        <ellipse cx="850" cy="190" rx="50" ry="14" fill="none" stroke={C.deep} strokeOpacity="0.25" strokeWidth="2" />
        <rect x="818" y="236" width="64" height="48" rx="10" fill={C.co2} />
        <text x="850" y="267" textAnchor="middle" fill="white" fontSize="17" fontWeight="700">
          CO₂
        </text>
        <rect x="826" y="340" width="10" height="24" fill={C.deep} />
        <rect x="864" y="340" width="10" height="24" fill={C.deep} />
      </g>

      {/* Moving gas particles */}
      {reduceMotion
        ? null
        : particles.map((p, i) => (
            <circle key={i} r="5" fill={p.color} stroke="white" strokeWidth="2">
              <animateMotion dur={`${p.dur}s`} begin={`-${p.begin}s`} repeatCount="indefinite" path={p.path} />
            </circle>
          ))}
    </svg>
  );
}
