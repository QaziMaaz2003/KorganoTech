"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { NativeSelect } from "@/components/ui/native-select";

const wholes = Array.from({ length: 31 }, (_, i) => i + 6); // 6"–36"
const fractions = [
  { label: '0"', value: 0 },
  { label: '1/4"', value: 0.25 },
  { label: '1/2"', value: 0.5 },
  { label: '3/4"', value: 0.75 },
];
const depths = [1, 2, 4];


function DimensionPicker({
  label,
  whole,
  fraction,
  onWhole,
  onFraction,
}: {
  label: string;
  whole: number;
  fraction: number;
  onWhole: (n: number) => void;
  onFraction: (n: number) => void;
}) {
  const id = label.toLowerCase().replace(/\W+/g, "-");
  return (
    <fieldset className="min-w-0">
      <legend className="mb-2 text-sm font-bold text-primary">{label}</legend>
      <div className="grid grid-cols-2 gap-2">
        <label htmlFor={`${id}-whole`} className="sr-only">{label} inches</label>
        <NativeSelect size="lg" id={`${id}-whole`} value={whole} onChange={(e) => onWhole(Number(e.target.value))}>
          {wholes.map((w) => (
            <option key={w} value={w}>{w}&quot;</option>
          ))}
        </NativeSelect>
        <label htmlFor={`${id}-fraction`} className="sr-only">{label} fraction</label>
        <NativeSelect size="lg" id={`${id}-fraction`} value={fraction} onChange={(e) => onFraction(Number(e.target.value))}>
          {fractions.map((f) => (
            <option key={f.value} value={f.value}>{f.label}</option>
          ))}
        </NativeSelect>
      </div>
    </fieldset>
  );
}

function FilterDiagram() {
  return (
    <svg viewBox="0 0 420 300" className="h-auto w-full max-w-md" role="img" aria-label="Diagram showing filter width, length and depth">
      <defs>
        <linearGradient id="fd-face" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#ece8f6" />
        </linearGradient>
        <pattern id="fd-pleat" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="skewX(-28)">
          <rect width="14" height="14" fill="#efeafa" />
          <path d="M0 0 L7 14 L14 0" fill="none" stroke="#b9acd9" strokeWidth="1.2" />
        </pattern>
        <marker id="fd-arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10z" fill="#3f2d7a" />
        </marker>
      </defs>
      {/* depth side */}
      <path d="M330 105 L355 85 L355 215 L330 235 Z" fill="#d9d1ee" />
      {/* top */}
      <path d="M90 105 L115 85 L355 85 L330 105 Z" fill="#e7e1f5" />
      {/* face */}
      <rect x="90" y="105" width="240" height="130" rx="3" fill="url(#fd-face)" stroke="#cfc5ea" />
      <rect x="104" y="117" width="212" height="106" fill="url(#fd-pleat)" />
      <path d="M104 117 L210 223 L316 117 M104 223 L210 117 L316 223" stroke="#ffffff" strokeWidth="8" fill="none" opacity="0.9" />
      <rect x="104" y="117" width="212" height="106" fill="none" stroke="#cfc5ea" />
      {/* length arrow */}
      <line x1="115" y1="60" x2="355" y2="60" stroke="#3f2d7a" strokeWidth="2" markerStart="url(#fd-arrow)" markerEnd="url(#fd-arrow)" />
      <text x="235" y="48" textAnchor="middle" fontSize="16" fontWeight="700" fill="#3f2d7a">Length</text>
      {/* width arrow */}
      <line x1="62" y1="105" x2="62" y2="235" stroke="#3f2d7a" strokeWidth="2" markerStart="url(#fd-arrow)" markerEnd="url(#fd-arrow)" />
      <text x="44" y="175" textAnchor="middle" fontSize="16" fontWeight="700" fill="#3f2d7a" transform="rotate(-90 44 175)">Width</text>
      {/* depth arrow */}
      <line x1="338" y1="258" x2="363" y2="238" stroke="#3f2d7a" strokeWidth="2" markerStart="url(#fd-arrow)" markerEnd="url(#fd-arrow)" />
      <text x="372" y="268" fontSize="16" fontWeight="700" fill="#3f2d7a">Depth</text>
    </svg>
  );
}

export function SizeFinder({ className }: { className?: string }) {
  const router = useRouter();
  const [w, setW] = useState(16);
  const [wf, setWf] = useState(0);
  const [l, setL] = useState(25);
  const [lf, setLf] = useState(0);
  const [d, setD] = useState(1);

  return (
    <section id="find-your-size" aria-labelledby="finder-title" className={cn("container-page", className)}>
      <div className="grid overflow-hidden rounded-[1.75rem] border border-lavender bg-white shadow-card lg:grid-cols-2">
        <form
          className="p-6 sm:p-10 lg:p-12"
          onSubmit={(e) => {
            e.preventDefault();
            const width = w + wf;
            const height = l + lf;
            router.push(`/shop?width=${width}&height=${height}&depth=${d}`);
          }}
        >
          <h2 id="finder-title" className="text-3xl font-extrabold tracking-tight text-primary sm:text-4xl">
            Find your filter size
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Check the size printed on the frame of your current filter, then pick it below.
          </p>
          <div className="mt-8 grid items-end gap-4 sm:grid-cols-[1fr_auto_1fr_auto_0.6fr]">
            <DimensionPicker label="1. Width" whole={w} fraction={wf} onWhole={setW} onFraction={setWf} />
            <span className="hidden pb-3 text-xl font-bold text-muted-foreground sm:block" aria-hidden>×</span>
            <DimensionPicker label="2. Length" whole={l} fraction={lf} onWhole={setL} onFraction={setLf} />
            <span className="hidden pb-3 text-xl font-bold text-muted-foreground sm:block" aria-hidden>×</span>
            <div>
              <label htmlFor="finder-depth" className="mb-2 block text-sm font-bold text-primary">3. Depth</label>
              <NativeSelect size="lg" id="finder-depth" value={d} onChange={(e) => setD(Number(e.target.value))}>
                {depths.map((x) => (
                  <option key={x} value={x}>{x}&quot;</option>
                ))}
              </NativeSelect>
            </div>
          </div>
          <button
            type="submit"
            className="mt-8 inline-flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-gradient-brand text-base font-bold text-white shadow-card transition hover:shadow-lift"
          >
            <Search className="size-5" /> Find filter
          </button>
        </form>
        <div className="grid place-items-center bg-gradient-soft p-8">
          <FilterDiagram />
        </div>
      </div>
    </section>
  );
}
