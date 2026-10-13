"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "motion/react";
import { ArrowRight, Calculator, MapPin } from "lucide-react";
import { useRef } from "react";
import { caseStudy } from "@/lib/env-data";
import { toneBg, toneText } from "@/lib/env-tones";
import { CountUp } from "@/components/environmental/ui/count-up";
import { Reveal, Stagger, StaggerItem } from "@/components/environmental/ui/reveal";
import { SectionHeading } from "@/components/environmental/ui/section-heading";

export function CaseStudy() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);

  return (
    <section ref={ref} id="case-study" className="relative isolate overflow-hidden py-24 text-white sm:py-32">
      <motion.div style={{ y: bgY }} className="absolute -inset-y-[12%] inset-x-0 -z-20">
        <Image src={caseStudy.image} alt={caseStudy.imageAlt} fill sizes="100vw" className="object-cover" />
      </motion.div>
      <div aria-hidden className="absolute inset-0 -z-10 bg-linear-to-b from-abyss/90 via-abyss/80 to-abyss/95" />

      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid items-end gap-8 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <SectionHeading dark eyebrow={caseStudy.eyebrow} title={caseStudy.title} body={caseStudy.body} />
          </div>
          <Reveal delay={0.1} className="lg:col-span-4 lg:justify-self-end">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm backdrop-blur-md">
              <MapPin className="h-4 w-4 text-sun" />
              ~15,000 CFM modeled countywide
            </span>
          </Reveal>
        </div>

        <Stagger className="mt-14 grid gap-4 lg:grid-cols-3" stagger={0.18}>
          {caseStudy.flow.map((item, i) => (
            <StaggerItem key={item.step} className="relative">
              <div className="h-full rounded-[1.75rem] border border-white/15 bg-white/[0.07] p-8 backdrop-blur-xl">
                <div className="flex items-center gap-3">
                  <span className={`hex grid h-8 w-9 place-items-center font-mono text-xs font-medium text-abyss ${toneBg[item.tone]}`}>
                    {i + 1}
                  </span>
                  <span className="eyebrow text-white/70">{item.step}</span>
                </div>
                <p className={`mt-8 font-display text-6xl font-semibold tracking-tight ${toneText[item.tone]}`}>
                  <CountUp value={item.value} decimals={item.decimals} suffix={item.suffix} duration={2.4} />
                </p>
                <p className="mt-2 text-white/75">{item.unit}</p>
              </div>
              {i < caseStudy.flow.length - 1 ? (
                <span className="absolute top-1/2 -right-5 z-10 hidden h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white text-deep shadow-lg lg:grid">
                  <ArrowRight className="h-4 w-4" />
                </span>
              ) : null}
            </StaggerItem>
          ))}
        </Stagger>

        <div className="mt-10 grid gap-6 lg:grid-cols-12">
          <Reveal className="lg:col-span-7">
            <div className="rounded-2xl border border-white/10 bg-abyss/60 p-6">
              <p className="flex items-center gap-2 eyebrow text-white/60">
                <Calculator className="h-4 w-4" /> How the gas volume is estimated
              </p>
              <p className="mt-3 font-mono text-sm leading-relaxed text-leaf sm:text-base">
                {caseStudy.formula}
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.1} className="lg:col-span-5">
            <p className="text-lg leading-relaxed text-white/85">{caseStudy.closing}</p>
          </Reveal>
        </div>

        <Reveal delay={0.1}>
          <div className="mt-10 flex flex-col gap-6 border-t border-white/10 pt-8 md:flex-row md:items-center md:justify-between">
            <p className="max-w-2xl text-xs leading-relaxed text-white/50">{caseStudy.disclaimer}</p>
            <a
              href="#contact"
              className="group inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-deep transition-all hover:-translate-y-0.5 hover:shadow-xl"
            >
              Get a screening estimate for your site
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
