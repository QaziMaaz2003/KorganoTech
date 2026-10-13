"use client";

import { motion, useReducedMotion } from "motion/react";

// CO₂ molecules drifting in from outside, crossing the shell into the sorbent core.
const incoming = [
  { angle: 200, delay: 0 },
  { angle: 250, delay: 0.9 },
  { angle: 320, delay: 1.8 },
  { angle: 20, delay: 0.5 },
  { angle: 80, delay: 1.4 },
  { angle: 140, delay: 2.3 },
];

const polar = (angle: number, r: number) => {
  const a = (angle * Math.PI) / 180;
  return { x: Math.round(Math.cos(a) * r * 10) / 10, y: Math.round(Math.sin(a) * r * 10) / 10 };
};

export function Capsule() {
  const reduceMotion = useReducedMotion();

  return (
    <svg viewBox="-160 -160 320 320" className="w-full max-w-sm" role="img" aria-label="Microcapsule: a liquid carbonate core inside a thin, CO₂-permeable silicone shell">
      <defs>
        <radialGradient id="core" cx="0.38" cy="0.35">
          <stop offset="0" stopColor="#9cc4ff" />
          <stop offset="0.6" stopColor="#3f7fdc" />
          <stop offset="1" stopColor="#1f4f9e" />
        </radialGradient>
        <radialGradient id="shell" cx="0.5" cy="0.5">
          <stop offset="0.82" stopColor="#e9f3f1" stopOpacity="0.1" />
          <stop offset="0.9" stopColor="#e9f3f1" stopOpacity="0.55" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0.9" />
        </radialGradient>
      </defs>

      {/* Dimension rings */}
      <circle r="150" fill="none" stroke="white" strokeOpacity="0.12" strokeDasharray="3 7" />

      <motion.g
        animate={reduceMotion ? undefined : { scale: [1, 1.03, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <circle r="104" fill="url(#core)" />
        {/* liquid shimmer */}
        <motion.ellipse
          cx="-30"
          cy="-38"
          rx="34"
          ry="16"
          fill="white"
          opacity="0.28"
          transform="rotate(-30)"
          animate={reduceMotion ? undefined : { opacity: [0.18, 0.4, 0.18] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
        <circle r="112" fill="url(#shell)" />
        <circle r="112" fill="none" stroke="white" strokeOpacity="0.85" strokeWidth="2" />
        <circle r="104" fill="none" stroke="white" strokeOpacity="0.45" strokeWidth="1" />
      </motion.g>

      {incoming.map((m, i) => {
        const from = polar(m.angle, 158);
        const to = polar(m.angle, 60);
        return (
          <motion.g
            key={i}
            initial={{ x: from.x, y: from.y, opacity: 0 }}
            animate={
              reduceMotion
                ? { x: polar(m.angle, 132).x, y: polar(m.angle, 132).y, opacity: 1 }
                : { x: [from.x, to.x], y: [from.y, to.y], opacity: [0, 1, 1, 0] }
            }
            transition={{ duration: 2.8, delay: m.delay, repeat: Infinity, ease: "easeIn" }}
          >
            <circle r="13" fill="#0a2c33" stroke="#7ed3a0" strokeWidth="1.5" />
            <text y="3.5" textAnchor="middle" fontSize="9" fontWeight="700" fill="#7ed3a0">
              CO₂
            </text>
          </motion.g>
        );
      })}

      <text y="-4" textAnchor="middle" fontSize="13" fontWeight="700" fill="white" letterSpacing="1">
        CARBONATE
      </text>
      <text y="14" textAnchor="middle" fontSize="11" fill="white" fillOpacity="0.8">
        liquid sorbent core
      </text>
    </svg>
  );
}
