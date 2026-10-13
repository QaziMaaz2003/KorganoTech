"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { technology } from "@/lib/env-data";

const { chart } = technology;
const MAX = 1050;
const ticks = [0, 250, 500, 750, 1000];
type SeriesKey = "neat" | "capsules";

export function AbsorptionChart() {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <figure className="rounded-[1.75rem] bg-white p-6 text-ink shadow-2xl shadow-black/20 sm:p-8">
      <figcaption>
        <p className="font-display text-lg font-semibold">{chart.title}</p>
        <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted">
          {chart.series.map((s) => (
            <li key={s.key} className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-[3px]" style={{ background: s.color }} />
              {s.label}
            </li>
          ))}
        </ul>
      </figcaption>

      <div className="mt-8 flex gap-3">
        {/* Y axis */}
        <div className="relative h-64 w-9 shrink-0 font-mono text-[0.68rem] text-muted sm:h-72">
          {ticks.map((t) => (
            <span
              key={t}
              className="absolute right-0 translate-y-1/2"
              style={{ bottom: `${(t / MAX) * 100}%` }}
            >
              {t}
            </span>
          ))}
        </div>

        {/* Plot */}
        <div className="relative h-64 flex-1 sm:h-72">
          {ticks.map((t) => (
            <span
              key={t}
              aria-hidden
              className={`absolute inset-x-0 h-px ${t === 0 ? "bg-ink/40" : "bg-line/70"}`}
              style={{ bottom: `${(t / MAX) * 100}%` }}
            />
          ))}

          <div className="absolute inset-0 flex">
            {chart.groups.map((group, gi) => (
              <div
                key={group.label}
                className="relative flex flex-1 items-end justify-center gap-0.5 rounded-t-xl"
                onMouseEnter={() => setHovered(gi)}
                onMouseLeave={() => setHovered(null)}
                onFocus={() => setHovered(gi)}
                onBlur={() => setHovered(null)}
                tabIndex={0}
                aria-label={`${group.label}: ${chart.series
                  .map((s) => `${s.label} ${group[s.key as SeriesKey]}`)
                  .join(", ")}`}
              >
                <span
                  aria-hidden
                  className={`absolute inset-x-2 inset-y-0 rounded-t-xl bg-tint transition-opacity duration-200 ${
                    hovered === gi ? "opacity-100" : "opacity-0"
                  }`}
                />
                {chart.series.map((s, si) => {
                  const value = group[s.key as SeriesKey];
                  return (
                    <div key={s.key} className="relative flex h-full w-[28%] max-w-14 items-end">
                      <motion.div
                        className="relative w-full rounded-t-[4px]"
                        style={{ background: s.color }}
                        initial={{ height: "0%" }}
                        whileInView={{ height: `${(value / MAX) * 100}%` }}
                        viewport={{ once: true, margin: "0px 0px -15% 0px" }}
                        transition={{ duration: 1.2, delay: 0.15 * gi + 0.1 * si, ease: [0.22, 1, 0.36, 1] }}
                      >
                        {s.key === "capsules" ? (
                          <span className="absolute -top-6 left-1/2 -translate-x-1/2 font-mono text-xs font-medium text-ink">
                            {value}
                          </span>
                        ) : null}
                      </motion.div>
                    </div>
                  );
                })}

                {hovered === gi ? (
                  <div
                    role="tooltip"
                    className="pointer-events-none absolute bottom-[40%] left-1/2 z-10 w-52 -translate-x-1/2 rounded-xl bg-ink px-4 py-3 text-xs text-white shadow-xl"
                  >
                    <p className="font-semibold">{group.label}</p>
                    {chart.series.map((s) => (
                      <p key={s.key} className="mt-1.5 flex items-center justify-between gap-3">
                        <span className="flex items-center gap-2 text-white/75">
                          <span className="h-2 w-2 rounded-[2px]" style={{ background: s.color }} />
                          {s.key === "neat" ? "Neat liquid" : "Capsules"}
                        </span>
                        <span className="font-mono">{group[s.key as SeriesKey]}</span>
                      </p>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* X axis */}
      <div className="mt-3 flex pl-12">
        {chart.groups.map((g) => (
          <span key={g.label} className="flex-1 text-center font-mono text-[0.7rem] text-muted">
            {g.label}
          </span>
        ))}
      </div>
      <p className="mt-2 text-center text-xs text-muted">{chart.unit}</p>

      <details className="group mt-6 border-t border-line pt-4 text-sm">
        <summary className="cursor-pointer font-medium text-deep marker:text-muted">View data table</summary>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-muted">
              <tr>
                <th className="py-2 pr-4 font-medium">Catalyst</th>
                {chart.series.map((s) => (
                  <th key={s.key} className="py-2 pr-4 font-medium">
                    {s.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="font-mono">
              {chart.groups.map((g) => (
                <tr key={g.label} className="border-t border-line">
                  <td className="py-2 pr-4">{g.label}</td>
                  <td className="py-2 pr-4">{g.neat}</td>
                  <td className="py-2 pr-4">{g.capsules}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>

      <p className="mt-4 text-xs leading-relaxed text-muted">{chart.note}</p>
    </figure>
  );
}
