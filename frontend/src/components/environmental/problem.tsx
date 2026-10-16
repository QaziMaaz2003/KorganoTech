"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "motion/react";
import { Flame } from "lucide-react";
import { useRef } from "react";
import { problem } from "@/lib/env-data";
import { toneBg, toneText } from "@/lib/env-tones";
import { CountUp } from "@/components/environmental/ui/count-up";
import { Molecule } from "@/components/environmental/ui/molecule";
import { Reveal, Stagger, StaggerItem } from "@/components/environmental/ui/reveal";
import { SectionHeading } from "@/components/environmental/ui/section-heading";

export function Problem() {
  const bandRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: bandRef, offset: ["start end", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["-12%", "12%"]);

  return (
    <section id="problem" className="relative pt-24 sm:pt-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading eyebrow={problem.eyebrow} title={problem.title} body={problem.body} />

        {/* Landfill-gas composition */}
        <Reveal delay={0.1} className="mt-14">
          <div className="flex items-baseline justify-between">
            <p className="eyebrow text-muted">Typical landfill gas</p>
            <p className="font-mono text-xs text-muted">by volume, approx.</p>
          </div>
          <div className="mt-3 flex h-14 gap-0.5 overflow-hidden rounded-2xl">
            {problem.gases.map((gas, i) => (
              <motion.div
                key={gas.formula}
                className={`flex items-center px-5 font-display text-lg font-semibold text-white ${toneBg[gas.tone]} ${
                  i === 1 ? "justify-end" : ""
                }`}
                initial={{ width: "0%" }}
                whileInView={{ width: `${gas.share}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1.4, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              >
                <span className="whitespace-nowrap">
                  ≈{gas.share}% {gas.formula}
                </span>
              </motion.div>
            ))}
          </div>
        </Reveal>

        <Stagger className="mt-6 grid gap-6 md:grid-cols-2">
          {problem.gases.map((gas) => (
            <StaggerItem
              key={gas.formula}
              className="group relative overflow-hidden rounded-[1.75rem] border border-line bg-white p-8 transition-shadow duration-500 hover:shadow-2xl hover:shadow-deep/10 sm:p-10"
            >
              <div
                className={`absolute -top-24 -right-24 h-64 w-64 rounded-full opacity-10 blur-2xl transition-opacity duration-500 group-hover:opacity-20 ${toneBg[gas.tone]}`}
              />
              <div className="relative flex items-start justify-between gap-6">
                <div>
                  <p className={`eyebrow ${toneText[gas.tone]}`}>
                    {gas.formula} · {gas.name}
                  </p>
                  <p className={`mt-4 font-display text-6xl font-semibold tracking-tight sm:text-7xl ${toneText[gas.tone]}`}>
                    ≈<CountUp value={gas.share} suffix="%" />
                  </p>
                </div>
                <Molecule
                  kind={gas.tone === "flare" ? "ch4" : "co2"}
                  className={`animate-float w-24 shrink-0 sm:w-32 ${toneText[gas.tone]}`}
                />
              </div>
              <h3 className="relative mt-6 font-display text-2xl font-semibold text-ink">{gas.title}</h3>
              <p className="relative mt-3 leading-relaxed text-muted">{gas.body}</p>
            </StaggerItem>
          ))}
        </Stagger>

        <Reveal delay={0.1} className="mt-6">
          <div className="flex flex-col gap-5 rounded-[1.75rem] bg-deep p-7 text-white sm:flex-row sm:items-center sm:p-9">
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-flare/20 text-sun">
              <Flame className="h-7 w-7" />
            </span>
            <p className="font-display text-xl leading-snug text-balance sm:text-2xl">
              <strong className="font-semibold text-sun">{problem.flaring.lead}</strong>{" "}
              <span className="text-white/90">{problem.flaring.body}</span>
            </p>
          </div>
          <p className="mt-3 text-xs text-muted">{problem.flaring.source}</p>
        </Reveal>
      </div>

      {/* Why act now */}
      <div ref={bandRef} className="relative isolate mt-24 overflow-hidden bg-deeper py-24 text-white sm:mt-32 sm:py-28">
        <motion.div style={{ y: bgY }} className="absolute -inset-y-[15%] inset-x-0 -z-10">
          <Image src={problem.image} alt={problem.imageAlt} fill sizes="100vw" className="object-cover opacity-25" />
        </motion.div>
        <div className="absolute inset-0 -z-10 bg-linear-to-br from-deeper via-deeper/90 to-deep/80" />
        <div className="topo absolute inset-0 -z-10" />

        <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-12 lg:gap-16">
          <div className="grid content-start gap-5 sm:grid-cols-2 lg:col-span-5 lg:grid-cols-1">
            <Reveal className="rounded-[1.75rem] border border-white/10 bg-white/5 p-8 backdrop-blur-md">
              <p className="font-display text-7xl font-semibold tracking-tight text-sun sm:text-8xl">
                <CountUp
                  value={problem.headlineStat.value}
                  decimals={problem.headlineStat.decimals}
                  suffix={problem.headlineStat.suffix}
                />
              </p>
              <p className="mt-4 text-lg leading-snug text-white/85">{problem.headlineStat.label}</p>
              <p className="mt-6 font-mono text-xs tracking-wider text-white/45 uppercase">
                Source: {problem.headlineStat.source}
              </p>
            </Reveal>
            <Reveal delay={0.15} className="rounded-[1.75rem] border border-white/10 bg-white/5 p-8 backdrop-blur-md">
              <p className="font-display text-6xl font-semibold tracking-tight text-leaf">
                <CountUp value={problem.secondaryStat.value} suffix={problem.secondaryStat.suffix} />
              </p>
              <p className="mt-3 leading-snug text-white/80">{problem.secondaryStat.label}</p>
            </Reveal>
          </div>

          <div className="lg:col-span-7">
            <SectionHeading
              dark
              eyebrow="Why act now"
              title="Climate and regulatory pressure make landfill-gas capture urgent"
            />
            <Stagger className="mt-10 space-y-4">
              {problem.reasons.map((reason) => (
                <StaggerItem
                  key={reason.title}
                  className="group flex gap-5 rounded-2xl border border-white/10 bg-white/[0.04] p-6 transition-colors duration-300 hover:bg-white/[0.08]"
                >
                  <span
                    className={`hex mt-1 h-7 w-8 shrink-0 transition-transform duration-500 group-hover:rotate-180 ${toneBg[reason.tone]}`}
                  />
                  <span>
                    <span className="block font-display text-xl font-semibold">{reason.title}</span>
                    <span className="mt-2 block leading-relaxed text-white/70">{reason.body}</span>
                  </span>
                </StaggerItem>
              ))}
            </Stagger>
            <p className="mt-8 text-xs leading-relaxed text-white/45">{problem.sources}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
