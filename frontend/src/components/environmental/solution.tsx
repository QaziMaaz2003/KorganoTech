"use client";

import Image from "next/image";
import { Filter, Flame, Repeat, ScanEye } from "lucide-react";
import { solution } from "@/lib/env-data";
import { toneBg, toneText } from "@/lib/env-tones";
import { ProcessDiagram } from "./process-diagram";
import { Reveal, Stagger, StaggerItem } from "@/components/environmental/ui/reveal";
import { SectionHeading } from "@/components/environmental/ui/section-heading";

const stepIcons = [Filter, ScanEye, Repeat, Flame];

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

        <div className="mt-24 grid items-center gap-10 lg:grid-cols-12 lg:gap-14">
          <Reveal className="lg:col-span-7">
            <figure className="overflow-hidden rounded-[1.75rem] border border-line bg-white p-3 shadow-[0_30px_80px_-50px_rgb(15_59_68/0.35)] sm:p-4">
              <Image
                src={solution.schematic.image}
                alt={solution.schematic.alt}
                width={solution.schematic.width}
                height={solution.schematic.height}
                sizes="(min-width: 1024px) 58vw, 100vw"
                className="h-auto w-full rounded-2xl"
              />
              <figcaption className="px-2 pt-3 text-xs text-muted italic">{solution.schematic.caption}</figcaption>
            </figure>
          </Reveal>

          <div className="lg:col-span-5">
            <Reveal>
              <p className="eyebrow flex items-center gap-3 text-flare">
                <span className="h-px w-8 bg-flare" aria-hidden />
                How the process works
              </p>
              <h3 className="mt-4 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
                Four automated steps, one reusable media
              </h3>
            </Reveal>
            <Stagger className="mt-8 space-y-3" stagger={0.12}>
              {solution.steps.map((step, i) => {
                const Icon = stepIcons[i];
                return (
                  <StaggerItem
                    key={step.title}
                    className="group flex items-start gap-4 rounded-2xl border border-line bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-deep/10"
                  >
                    <span className="relative grid h-12 w-12 shrink-0 place-items-center">
                      <span className={`hex absolute inset-0 ${toneBg[step.tone]} transition-transform duration-500 group-hover:rotate-60`} />
                      <Icon className="relative h-5 w-5 text-white" />
                    </span>
                    <span>
                      <span className="flex items-baseline gap-2">
                        <span className={`font-mono text-xs font-medium ${toneText[step.tone]}`}>
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="font-display text-lg font-semibold text-ink">{step.title}</span>
                      </span>
                      <span className="mt-1 block text-sm leading-relaxed text-muted">{step.body}</span>
                    </span>
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
