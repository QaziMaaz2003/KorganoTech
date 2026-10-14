"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import { ArrowRight, Check, Clock, Minus, Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { CountUp } from "@/components/environmental/ui/count-up";
import { Reveal, Stagger, StaggerItem } from "@/components/environmental/ui/reveal";
import { SectionHeading } from "@/components/environmental/ui/section-heading";

// ─── HVAC: minimum capture efficiency by particle size (ASHRAE 52.2) ────────

const mervRows = [
  { band: "3–10 µm", what: "Pollen, dust mites, mold spores", m11: 85, m13: 90 },
  { band: "1–3 µm", what: "Fine dust, pet dander, auto emissions", m11: 65, m13: 85 },
  { band: "0.3–1 µm", what: "Smoke and smog particles", m11: 20, m13: 50 },
];

export function MervPerformance() {
  return (
    <>
      <Reveal delay={0.1} className="mt-14">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <p className="eyebrow text-muted">Minimum capture efficiency by particle size</p>
          <p className="flex items-center gap-4 font-mono text-xs text-muted">
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-co2" /> MERV 11</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-flare" /> MERV 13</span>
          </p>
        </div>
        <ul className="mt-5 space-y-6 rounded-[1.75rem] border border-line bg-white p-6 sm:p-8">
          {mervRows.map((row) => (
            <li key={row.band}>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-display text-lg font-semibold text-ink">
                  {row.band} <span className="ml-2 text-sm font-normal text-muted">{row.what}</span>
                </p>
              </div>
              {([["m11", "bg-co2", row.m11], ["m13", "bg-flare", row.m13]] as const).map(([key, tone, value]) => (
                <div key={key} className="mt-2.5 flex items-center gap-3">
                  <span className="w-16 shrink-0 font-mono text-[0.7rem] tracking-wider text-muted uppercase">{key === "m11" ? "MERV 11" : "MERV 13"}</span>
                  <span className="h-3.5 flex-1 overflow-hidden rounded-full bg-tint">
                    <motion.span
                      className={`block h-full rounded-full ${tone}`}
                      initial={{ width: "0%" }}
                      whileInView={{ width: `${value}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.3, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
                    />
                  </span>
                  <span className="w-14 text-right font-display text-lg font-semibold tabular-nums text-ink">≥{value}%</span>
                </div>
              ))}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-muted">Minimum efficiencies defined by ASHRAE Standard 52.2 for each MERV level.</p>
      </Reveal>

      <Stagger className="mt-6 grid gap-6 md:grid-cols-2">
        {[
          { tone: "co2", name: "MERV 11 · Advanced", value: 20, text: "Captures fine dust, pollen, mold spores and pet dander — and at least a fifth of smoke-sized particles (0.3–1 µm). Ideal for homes with pets, kids or mild allergies." },
          { tone: "flare", name: "MERV 13 · Superior", value: 50, text: "Our highest-efficiency pleated filter captures at least half of smoke-sized particles (0.3–1 µm). Ideal for households with allergies, sensitivities and higher-occupancy buildings." },
        ].map((card) => (
          <StaggerItem
            key={card.name}
            className="group relative overflow-hidden rounded-[1.75rem] border border-line bg-white p-8 transition-shadow duration-500 hover:shadow-2xl hover:shadow-deep/10 sm:p-10"
          >
            <div className={`absolute -top-24 -right-24 h-64 w-64 rounded-full opacity-10 blur-2xl transition-opacity duration-500 group-hover:opacity-20 ${card.tone === "co2" ? "bg-co2" : "bg-flare"}`} />
            <p className={`eyebrow relative ${card.tone === "co2" ? "text-co2" : "text-flare"}`}>{card.name}</p>
            <p className={`relative mt-4 font-display text-6xl font-semibold tracking-tight sm:text-7xl ${card.tone === "co2" ? "text-co2" : "text-flare"}`}>
              ≥<CountUp value={card.value} suffix="%" />
            </p>
            <p className="relative mt-1 font-mono text-xs tracking-wider text-muted">OF 0.3–1 µm PARTICLES</p>
            <p className="relative mt-6 leading-relaxed text-muted">{card.text}</p>
          </StaggerItem>
        ))}
      </Stagger>
    </>
  );
}

// ─── Pathogen: traditional filter vs the program in development ─────────────

type Cell = { kind: "yes" | "no" | "soon" | "maybe"; text: string };
const compareRows: { label: string; traditional: Cell; pathogen: Cell }[] = [
  {
    label: "Captures airborne particles",
    traditional: { kind: "yes", text: "Yes — pleated media traps particles" },
    pathogen: { kind: "soon", text: "Designed to capture pathogens of all sizes" },
  },
  {
    label: "Deactivates what it captures",
    traditional: { kind: "no", text: "Not on its own — needs extra technology such as UV or heat sterilization" },
    pathogen: { kind: "soon", text: "Designed to, using antimicrobial metal ions" },
  },
  {
    label: "Trapped pathogens over time",
    traditional: { kind: "maybe", text: "Can accumulate and potentially be re-released into the air" },
    pathogen: { kind: "soon", text: "Designed to stop captured pathogens growing and reproducing" },
  },
  {
    label: "Electricity",
    traditional: { kind: "maybe", text: "Deactivation add-ons typically need power" },
    pathogen: { kind: "soon", text: "Designed to work without electricity" },
  },
  {
    label: "Availability",
    traditional: { kind: "yes", text: "Available today" },
    pathogen: { kind: "no", text: "Under development — not yet commercially available" },
  },
];

function CellIcon({ kind }: { kind: Cell["kind"] }) {
  const base = "mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full";
  if (kind === "yes") return <span className={`${base} bg-ch4/15 text-ch4`}><Check className="h-3.5 w-3.5" strokeWidth={3} /></span>;
  if (kind === "no") return <span className={`${base} bg-flare/15 text-flare`}><X className="h-3.5 w-3.5" strokeWidth={3} /></span>;
  if (kind === "soon") return <span className={`${base} bg-co2/15 text-co2`}><Clock className="h-3.5 w-3.5" strokeWidth={2.5} /></span>;
  return <span className={`${base} bg-sun/25 text-flare`}><Minus className="h-3.5 w-3.5" strokeWidth={3} /></span>;
}

export function PathogenCompare() {
  return (
    <Reveal delay={0.1} className="mt-14">
      <div className="overflow-hidden rounded-[1.75rem] border border-line bg-white">
        <div className="hidden grid-cols-[1.1fr_1.5fr_1.5fr] border-b border-line bg-tint px-6 py-4 md:grid">
          <span />
          <span className="eyebrow text-muted">Traditional air filter</span>
          <span className="eyebrow text-co2">KorganoTech Pathogen Air Filter · in development</span>
        </div>
        <ul className="divide-y divide-line">
          {compareRows.map((row) => (
            <li key={row.label} className="grid gap-4 px-6 py-5 md:grid-cols-[1.1fr_1.5fr_1.5fr] md:items-start">
              <p className="font-display text-lg font-semibold text-ink">{row.label}</p>
              {([["Traditional", row.traditional], ["Pathogen filter", row.pathogen]] as const).map(([who, cell]) => (
                <p key={who} className="flex gap-3 text-sm leading-relaxed text-muted">
                  <CellIcon kind={cell.kind} />
                  <span><span className="mr-1 font-mono text-[0.65rem] tracking-wider text-ink/50 uppercase md:hidden">{who}:</span>{cell.text}</span>
                </p>
              ))}
            </li>
          ))}
        </ul>
      </div>
      <p className="mt-3 text-xs text-muted">Information about the Pathogen Air Filter is for informational purposes only until validated through regulatory approvals.</p>
    </Reveal>
  );
}

// ─── Aside: HVAC size finder card ───────────────────────────────────────────

const field =
  "w-full rounded-xl border border-line bg-bg px-3 py-3 text-sm text-ink transition-colors focus:border-co2 focus:bg-white focus:outline-none";
const dims = Array.from({ length: 29 }, (_, i) => i + 8); // 8"–36"
const popular = ["16x20x1", "16x25x1", "20x20x1", "20x25x1", "20x25x4", "24x24x1"];

export function HvacSizeCard() {
  const router = useRouter();
  const [w, setW] = useState(16);
  const [l, setL] = useState(25);
  const [d, setD] = useState(1);
  return (
    <Reveal delay={0.1} x={30} y={0}>
      <div className="relative rounded-[2rem] bg-linear-to-br from-mist to-tint p-6 sm:p-10">
        <div className="flex items-center justify-between">
          <p className="eyebrow text-muted">Find your filter size</p>
          <p className="font-mono text-xs text-muted">Nominal size</p>
        </div>
        <form
          className="mt-6 space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            router.push(`/shop?width=${w}&height=${l}&depth=${d}`);
          }}
        >
          <div className="grid grid-cols-3 gap-3">
            {[
              ["Width", w, setW, dims],
              ["Length", l, setL, dims],
              ["Depth", d, setD, [1, 2, 4]],
            ].map(([label, value, set, options]) => (
              <label key={label as string} className="grid gap-2 text-sm font-medium text-ink">
                {label as string}
                <select className={field} value={value as number} onChange={(e) => (set as (n: number) => void)(Number(e.target.value))}>
                  {(options as number[]).map((o) => (
                    <option key={o} value={o}>{o}&quot;</option>
                  ))}
                </select>
              </label>
            ))}
          </div>
          <button type="submit" className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-flare px-7 py-4 font-semibold text-white shadow-lg shadow-flare/30 transition-all hover:-translate-y-0.5 hover:bg-[#c2561a]">
            <Search className="h-4 w-4" /> Find my filter
          </button>
        </form>
        <p className="mt-8 eyebrow text-muted">Popular sizes</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {popular.map((s) => (
            <Link key={s} href={`/shop?size=${s}`} className="rounded-full border border-line bg-white px-3.5 py-2 text-xs font-medium text-ink transition-colors hover:border-deep hover:bg-deep hover:text-white">
              {s}
            </Link>
          ))}
        </div>
        <p className="mt-6 text-sm leading-relaxed text-muted">
          The nominal size is printed on the frame of your current filter. Need a custom size or a bulk order?{" "}
          <Link href="#contact" className="font-semibold text-deep underline underline-offset-4">Contact sales</Link>.
        </p>
      </div>
    </Reveal>
  );
}

// ─── Aside: pathogen stage explorer (illustration) ──────────────────────────

const CYCLE_MS = 2600;
const stages = [
  { key: "capture", label: "Capture", note: "Held in the web" },
  { key: "interact", label: "Interact", note: "Metal ions form" },
  { key: "neutralize", label: "Neutralize", note: "Growth prevented" },
];

const wires = [
  "M10 40 C70 10 110 80 170 50 S270 30 310 60",
  "M10 90 C60 120 120 60 180 100 S270 130 310 100",
  "M10 140 C80 110 130 170 190 140 S270 120 310 150",
  "M10 185 C70 160 120 205 180 180 S260 170 310 195",
  "M60 10 C40 70 90 110 70 170 S60 200 80 215",
  "M150 10 C170 60 130 110 160 160 S150 200 170 215",
  "M240 10 C220 70 260 110 240 160 S250 200 235 215",
];
const pathogens = [
  { x: 95, y: 62 }, { x: 205, y: 92 }, { x: 140, y: 138 }, { x: 255, y: 150 }, { x: 70, y: 168 }, { x: 215, y: 190 },
];
const metals = [
  { x: 112, y: 76 }, { x: 192, y: 104 }, { x: 156, y: 126 }, { x: 240, y: 138 }, { x: 86, y: 154 }, { x: 228, y: 176 },
];

// Rounded so the server and the browser serialize identical SVG attributes.
const spike = (origin: number, deg: number, r: number, fn: "cos" | "sin") =>
  Math.round((origin + Math[fn]((deg * Math.PI) / 180) * r) * 100) / 100;

function Web({ stage }: { stage: number }) {
  return (
    <svg viewBox="0 0 320 225" className="w-full" aria-hidden>
      <rect width="320" height="225" rx="18" fill="#f7faf9" />
      {wires.map((d, i) => (
        <path key={i} d={d} fill="none" stroke="#b9c9c6" strokeWidth="1.6" strokeLinecap="round" />
      ))}
      {metals.map((m, i) => (
        <motion.circle
          key={`m${i}`}
          cx={m.x}
          cy={m.y}
          r="3.6"
          initial={false}
          animate={{ fill: i % 2 === 0 ? "#9aa5ad" : "#d9651b", opacity: stage >= 0 ? 1 : 0 }}
        />
      ))}
      {pathogens.map((p, i) => (
        <g key={`p${i}`}>
          <motion.circle
            cx={p.x}
            cy={p.y}
            r="12"
            fill="none"
            stroke="#1f64c8"
            strokeWidth="1.5"
            strokeDasharray="3 3"
            initial={false}
            animate={{ opacity: stage === 1 ? 0.9 : 0, r: stage === 1 ? 20 : 12 }}
            transition={{ duration: 0.6, delay: i * 0.05 }}
          />
          <motion.circle
            cx={p.x}
            cy={p.y}
            r="8"
            initial={false}
            animate={{ fill: stage === 2 ? "#c9d6d3" : "#8e4fa3", opacity: stage === 2 ? 0.6 : 1 }}
            transition={{ duration: 0.6, delay: i * 0.06 }}
          />
          {[0, 60, 120, 180, 240, 300].map((a) => (
            <motion.line
              key={a}
              x1={spike(p.x, a, 8, "cos")}
              y1={spike(p.y, a, 8, "sin")}
              x2={spike(p.x, a, 12.5, "cos")}
              y2={spike(p.y, a, 12.5, "sin")}
              strokeWidth="1.6"
              strokeLinecap="round"
              initial={false}
              animate={{ stroke: stage === 2 ? "#c9d6d3" : "#8e4fa3" }}
              transition={{ duration: 0.6, delay: i * 0.06 }}
            />
          ))}
          {stage === 2 ? (
            <motion.path
              d={`M${p.x - 4} ${p.y - 4} L${p.x + 4} ${p.y + 4} M${p.x + 4} ${p.y - 4} L${p.x - 4} ${p.y + 4}`}
              stroke="#56696c"
              strokeWidth="1.8"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.4, delay: 0.2 + i * 0.05 }}
            />
          ) : null}
        </g>
      ))}
    </svg>
  );
}

export function NanoExplorer() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "0px 0px -20% 0px" });
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (!inView || reduceMotion) return;
    const timer = window.setTimeout(() => setActive((a) => (a + 1) % stages.length), CYCLE_MS);
    return () => window.clearTimeout(timer);
  }, [inView, reduceMotion, active]);

  return (
    <Reveal delay={0.1} x={30} y={0}>
      <div ref={ref} className="relative rounded-[2rem] bg-linear-to-br from-mist to-tint p-6 sm:p-10">
        <div className="flex items-center justify-between">
          <p className="eyebrow text-muted">Nanowire web · design concept</p>
          <p className="font-mono text-xs text-muted">Illustration</p>
        </div>
        <div className="relative mx-auto mt-6 max-w-[24rem]">
          <div className="relative drop-shadow-[0_24px_40px_rgb(15_59_68/0.2)]">
            <Web stage={active} />
          </div>
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={active}
              initial={{ opacity: 0, y: 8, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="absolute -top-3 -right-2 rounded-full bg-deep px-4 py-2 font-mono text-xs text-white shadow-lg"
            >
              {stages[active].note}
            </motion.span>
          </AnimatePresence>
        </div>
        <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted">
          <li className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-[#8e4fa3]" /> Pathogen</li>
          <li className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-[#9aa5ad]" /> Silver / copper particle</li>
          <li className="flex items-center gap-2"><span className="h-3 w-3 rounded-full border border-dashed border-co2" /> Metal ions</li>
        </ul>
        <div className="mt-6 grid grid-cols-3 gap-2 sm:gap-3">
          {stages.map((s, i) => (
            <button
              key={s.key}
              type="button"
              onClick={() => setActive(i)}
              aria-pressed={active === i}
              className={`rounded-2xl border p-3 text-left transition-all duration-300 sm:p-4 ${active === i ? "border-transparent bg-white shadow-lg" : "border-line/80 hover:bg-white/60"}`}
            >
              <span className="font-mono text-[0.68rem] text-muted">0{i + 1}</span>
              <span className="mt-1 block font-display text-sm font-semibold text-ink sm:text-base">{s.label}</span>
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
        <p className="mt-6 text-center text-sm leading-relaxed text-muted">
          A simplified illustration of the design concept. The technology is under development and not yet validated.
        </p>
      </div>
    </Reveal>
  );
}

// ─── Tech visuals ───────────────────────────────────────────────────────────

export function PleatDiagram() {
  const teeth = Array.from({ length: 11 }, (_, i) => i);
  const d = teeth.map((i) => `${i === 0 ? "M" : "L"}${36 + i * 24} ${i % 2 === 0 ? 44 : 132}`).join(" ");
  // Particles caught in the valleys of the pleats, plus a few still in the air stream.
  const held = [1, 3, 5, 7, 9].map((i) => ({ x: 36 + i * 24, y: 124 + (i % 3) * 2 }));
  const flying = [{ x: 8, y: 66 }, { x: 14, y: 96 }, { x: 6, y: 112 }];
  return (
    <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.05] p-7 backdrop-blur-md sm:p-8">
      <div className="flex items-center justify-between">
        <p className="eyebrow text-white/50">Pleated media · side view</p>
        <p className="font-mono text-xs text-white/40">Illustration</p>
      </div>
      <svg viewBox="0 0 320 180" className="mt-4 w-full" role="img" aria-label="Air flowing through the pleats of a filter, with particles caught in the media">
        <rect x="30" y="30" width="260" height="7" rx="3" fill="#ffffff" opacity="0.25" />
        <rect x="30" y="139" width="260" height="7" rx="3" fill="#ffffff" opacity="0.25" />
        <path d={d} fill="none" stroke="#7ed3a0" strokeWidth="10" strokeLinejoin="round" strokeLinecap="round" opacity="0.12" />
        <path d={d} fill="none" stroke="#7ed3a0" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
        {[62, 92, 122].map((y) => (
          <g key={y}>
            <line x1="2" y1={y} x2="24" y2={y} stroke="#f4a261" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="5 5" className="animate-dash" />
            <path d={`M18 ${y - 5} L26 ${y} L18 ${y + 5}`} fill="none" stroke="#f4a261" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        ))}
        {flying.map((p) => (
          <circle key={`f${p.y}`} cx={p.x} cy={p.y - 7} r="2.6" fill="#8db6f2" opacity="0.7" />
        ))}
        {held.map((p) => (
          <circle key={p.x} cx={p.x} cy={p.y} r="3.4" fill="#8db6f2" />
        ))}
        <text x="162" y="168" textAnchor="middle" fontSize="7" letterSpacing="1.2" fill="#ffffff" opacity="0.55" fontFamily="var(--font-plex-mono)">
          PARTICLES HELD IN THE PLEATED MEDIA
        </text>
      </svg>
      <p className="mt-2 text-sm leading-relaxed text-white/70">
        Pleating folds the melt blown media into a zig-zag, packing far more filtering surface into the same frame so
        particles are caught while air keeps flowing.
      </p>
    </div>
  );
}

export function FactsCard({ title, rows, body }: { title: string; rows: { value: string; label: string }[]; body: string }) {
  return (
    <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.05] p-7 backdrop-blur-md sm:p-8">
      <p className="eyebrow text-white/50">{title}</p>
      <div className="mt-5 grid grid-cols-2 gap-3">
        {rows.map((r) => (
          <div key={`${r.value}-${r.label}`} className="rounded-xl bg-white/[0.06] p-4 text-center">
            <p className="font-display text-2xl font-semibold text-leaf">{r.value}</p>
            <p className="mt-1 text-xs text-white/60">{r.label}</p>
          </div>
        ))}
      </div>
      <p className="mt-6 text-sm leading-relaxed text-white/70">{body}</p>
    </div>
  );
}

// ─── Checklist section (points + panel + aside visual) ──────────────────────

export function ProgramChecklist({
  id,
  eyebrow,
  title,
  points,
  panel,
  aside,
}: {
  id?: string;
  eyebrow: string;
  title: string;
  points: string[];
  panel: { title: string; items: string[]; cta: { label: string; href: string } };
  aside: React.ReactNode;
}) {
  return (
    <section id={id} className="relative bg-white py-24 sm:py-32">
      <div className="mx-auto grid max-w-7xl items-center gap-16 px-5 sm:px-8 lg:grid-cols-2">
        <div>
          <SectionHeading eyebrow={eyebrow} title={title} />
          <Stagger className="mt-10 space-y-4">
            {points.map((point) => (
              <StaggerItem key={point} className="flex items-start gap-4">
                <span className="hex mt-0.5 grid h-7 w-8 shrink-0 place-items-center bg-deep text-leaf">
                  <Check className="h-3.5 w-3.5" strokeWidth={3} />
                </span>
                <span className="leading-relaxed text-ink">{point}</span>
              </StaggerItem>
            ))}
          </Stagger>
          <Reveal delay={0.15} className="mt-10 rounded-[1.5rem] bg-tint p-7">
            <h3 className="font-display text-xl font-semibold text-ink">{panel.title}</h3>
            <ul className="mt-4 space-y-3">
              {panel.items.map((item) => (
                <li key={item} className="flex gap-3 text-sm leading-relaxed text-muted">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-flare" />
                  {item}
                </li>
              ))}
            </ul>
            <a href={panel.cta.href} className="group mt-6 inline-flex items-center gap-2 text-sm font-semibold text-deep">
              {panel.cta.label}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>
          </Reveal>
        </div>
        {aside}
      </div>
    </section>
  );
}
