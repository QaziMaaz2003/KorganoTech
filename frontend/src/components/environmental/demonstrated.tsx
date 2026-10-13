"use client";

import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import { ArrowRight, Check } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { demonstrated } from "@/lib/env-data";
import { Reveal, Stagger, StaggerItem } from "@/components/environmental/ui/reveal";
import { SectionHeading } from "@/components/environmental/ui/section-heading";

// Hex-packed sorbent beads inside a petri dish, computed once so SSR and client agree.
const CYCLE_MS = 2200;
const BEAD_R = 7.2;
const beads: { x: number; y: number; d: number }[] = [];
for (let row = -6; row <= 6; row++) {
  const y = row * BEAD_R * 1.74;
  const offset = row % 2 === 0 ? 0 : BEAD_R;
  for (let col = -7; col <= 7; col++) {
    const x = col * BEAD_R * 2 + offset;
    const d = Math.hypot(x, y);
    if (d < 78) beads.push({ x: Math.round(x * 10) / 10 + 100, y: Math.round(y * 10) / 10 + 100, d });
  }
}

const PURPLE = "#b366c6";
const AMBER = "#dcae57";

const states = [
  { key: "none", label: "No CO₂", note: "Media ready", loaded: false },
  { key: "absorbed", label: "CO₂ absorbed", note: "Sensor color shifts", loaded: true },
  { key: "regen", label: "Regenerated", note: "Heat releases CO₂", loaded: false },
];

function Dish({ state }: { state: number }) {
  const loaded = states[state].loaded;
  return (
    <svg viewBox="0 0 200 200" className="w-full" aria-hidden>
      <circle cx="100" cy="100" r="96" fill="#f7faf9" stroke="#c9d6d3" strokeWidth="2.5" />
      <circle cx="100" cy="100" r="88" fill="#e3ebe9" />
      {beads.map((b, i) => (
        <g key={i}>
          <motion.circle
            cx={b.x}
            cy={b.y}
            r={BEAD_R - 0.7}
            initial={false}
            animate={{ fill: loaded ? AMBER : PURPLE }}
            transition={{
              duration: 0.6,
              // CO₂ diffuses in from the rim; heat regenerates from the core outward.
              delay: loaded ? (80 - b.d) / 220 : b.d / 220,
            }}
          />
          <circle cx={b.x - 2} cy={b.y - 2.2} r="2" fill="white" opacity="0.55" />
        </g>
      ))}
      <ellipse cx="70" cy="48" rx="36" ry="13" fill="white" opacity="0.3" transform="rotate(-30 70 48)" />
    </svg>
  );
}

export function Demonstrated() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "0px 0px -20% 0px" });
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (!inView || reduceMotion) return;
    const timer = window.setTimeout(() => setActive((a) => (a + 1) % states.length), CYCLE_MS);
    return () => window.clearTimeout(timer);
  }, [inView, reduceMotion, active]);

  return (
    <section className="relative bg-white py-24 sm:py-32">
      <div className="mx-auto grid max-w-7xl items-center gap-16 px-5 sm:px-8 lg:grid-cols-2">
        <div>
          <SectionHeading eyebrow={demonstrated.eyebrow} title={demonstrated.title} />
          <Stagger className="mt-10 space-y-4">
            {demonstrated.points.map((point) => (
              <StaggerItem key={point} className="flex items-start gap-4">
                <span className="hex mt-0.5 grid h-7 w-8 shrink-0 place-items-center bg-deep text-leaf">
                  <Check className="h-3.5 w-3.5" strokeWidth={3} />
                </span>
                <span className="leading-relaxed text-ink">{point}</span>
              </StaggerItem>
            ))}
          </Stagger>

          <Reveal delay={0.15} className="mt-10 rounded-[1.5rem] bg-tint p-7">
            <h3 className="font-display text-xl font-semibold text-ink">Practical to deploy</h3>
            <ul className="mt-4 space-y-3">
              {demonstrated.deploy.map((item) => (
                <li key={item} className="flex gap-3 text-sm leading-relaxed text-muted">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-flare" />
                  {item}
                </li>
              ))}
            </ul>
            <a
              href="#contact"
              className="group mt-6 inline-flex items-center gap-2 text-sm font-semibold text-deep"
            >
              See how it would connect to your gas-collection system
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>
          </Reveal>
        </div>

        <Reveal delay={0.1} x={30} y={0}>
          <div ref={ref} className="relative rounded-[2rem] bg-linear-to-br from-mist to-tint p-6 sm:p-10">
            <div className="flex items-center justify-between">
              <p className="eyebrow text-muted">Colorimetric sensor response</p>
              <p className="font-mono text-xs text-muted">Illustration</p>
            </div>
            <div className="relative mx-auto mt-6 max-w-[20rem]">
              <div className="absolute inset-6 rounded-full bg-[#b366c6]/25 blur-3xl" aria-hidden />
              <div className="relative drop-shadow-[0_24px_40px_rgb(15_59_68/0.25)]">
                <Dish state={active} />
              </div>
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={active}
                  initial={{ opacity: 0, y: 8, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  className="absolute -right-2 bottom-4 rounded-full bg-deep px-4 py-2 font-mono text-xs text-white shadow-lg"
                >
                  {states[active].note}
                </motion.span>
              </AnimatePresence>
            </div>
            <div className="mt-10 grid grid-cols-3 gap-2 sm:gap-3">
              {states.map((state, i) => (
                <button
                  key={state.key}
                  type="button"
                  onClick={() => setActive(i)}
                  aria-pressed={active === i}
                  className={`rounded-2xl border p-3 text-left transition-all duration-300 sm:p-4 ${
                    active === i ? "border-transparent bg-white shadow-lg" : "border-line/80 hover:bg-white/60"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span
                      className="h-3 w-3 shrink-0 rounded-full"
                      style={{ background: state.loaded ? AMBER : PURPLE }}
                    />
                    <span className="font-mono text-[0.68rem] text-muted">0{i + 1}</span>
                  </span>
                  <span className="mt-2 block font-display text-sm font-semibold text-ink sm:text-base">
                    {state.label}
                  </span>
                  <span className="mt-3 block h-1 overflow-hidden rounded-full bg-line">
                    {active === i ? (
                      <motion.span
                        key={`${active}-${inView}`}
                        className="block h-full origin-left rounded-full bg-flare"
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: inView && !reduceMotion ? 1 : 0 }}
                        transition={{ duration: CYCLE_MS / 1000, ease: "linear" }}
                      />
                    ) : null}
                  </span>
                </button>
              ))}
            </div>
            <p className="mt-6 text-center text-sm leading-relaxed text-muted">{demonstrated.caption}</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
