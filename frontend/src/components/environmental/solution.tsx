"use client";

import { motion } from "motion/react";
import { Filter, Recycle, ScanEye, Warehouse } from "lucide-react";
import { solution } from "@/lib/env-data";
import { toneBg, toneSoftBg, toneText } from "@/lib/env-tones";
import { ProcessDiagram } from "./process-diagram";
import { Reveal, Stagger, StaggerItem } from "@/components/environmental/ui/reveal";
import { SectionHeading } from "@/components/environmental/ui/section-heading";

const stepIcons = [Filter, ScanEye, Warehouse, Recycle];

export function Solution() {
  return (
    <section id="solution" className="relative overflow-hidden py-24 sm:py-32">
      <div aria-hidden className="absolute -left-40 top-40 h-[30rem] w-[30rem] rounded-full bg-co2/10 blur-3xl" />
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid items-end gap-8 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <SectionHeading eyebrow={solution.eyebrow} title={solution.title} />
          </div>
          <Reveal delay={0.1} className="lg:col-span-4">
            <p className="text-lg leading-relaxed text-muted">{solution.body}</p>
          </Reveal>
        </div>

        <Reveal delay={0.15} className="mt-14">
          <div className="relative rounded-[2rem] border border-line bg-white p-4 shadow-[0_30px_80px_-40px_rgb(15_59_68/0.35)] sm:p-8">
            <div className="absolute top-5 right-6 flex items-center gap-2 font-mono text-[0.68rem] tracking-[0.14em] text-muted uppercase">
              <span className="h-2 w-2 animate-pulse rounded-full bg-ch4" />
              Live schematic
            </div>
            <p className="pt-1 font-mono text-[0.68rem] tracking-[0.14em] text-muted uppercase md:hidden">
              Swipe to explore →
            </p>
            <div className="overflow-x-auto">
              <div className="min-w-[760px] pt-6">
                <ProcessDiagram />
              </div>
            </div>
          </div>
        </Reveal>

        <div className="mt-24">
          <Reveal className="max-w-2xl">
            <p className="eyebrow flex items-center gap-3 text-flare">
              <span className="h-px w-8 bg-flare" aria-hidden />
              How the process works
            </p>
            <h3 className="mt-4 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
              Four automated steps, one reusable media
            </h3>
          </Reveal>

          <div className="relative mt-12">
            {/* Connector line that draws itself across the steps */}
            <motion.div
              aria-hidden
              className="absolute top-8 right-[12%] left-[12%] hidden h-0.5 origin-left bg-linear-to-r from-co2 via-flare to-ch4 lg:block"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, margin: "0px 0px -20% 0px" }}
              transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
            />
            <Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4" stagger={0.15}>
              {solution.steps.map((step, i) => {
                const Icon = stepIcons[i];
                return (
                  <StaggerItem key={step.title} className="group relative">
                    <div className="relative z-10 mx-auto mb-6 hidden h-16 w-16 place-items-center lg:grid">
                      <span className={`hex absolute inset-0 ${toneBg[step.tone]} transition-transform duration-500 group-hover:rotate-60`} />
                      <Icon className="relative h-6 w-6 text-white" />
                    </div>
                    <div className="h-full rounded-[1.5rem] border border-line bg-white p-7 transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-2xl group-hover:shadow-deep/10">
                      <div className="flex items-center justify-between">
                        <span className={`font-display text-5xl font-semibold ${toneText[step.tone]}`}>
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className={`grid h-11 w-11 place-items-center rounded-xl lg:hidden ${toneSoftBg[step.tone]} ${toneText[step.tone]}`}>
                          <Icon className="h-5 w-5" />
                        </span>
                      </div>
                      <h4 className="mt-5 font-display text-xl font-semibold text-ink">{step.title}</h4>
                      <p className="mt-3 text-sm leading-relaxed text-muted">{step.body}</p>
                    </div>
                  </StaggerItem>
                );
              })}
            </Stagger>
          </div>
        </div>
      </div>
    </section>
  );
}
