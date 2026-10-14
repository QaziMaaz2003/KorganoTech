"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "motion/react";
import { ArrowRight } from "lucide-react";
import { useRef } from "react";
import { toneBg, toneSoftBg, toneText } from "@/lib/env-tones";
import type { BigStat, OverviewContent, StepsContent, TechContent, WhyBand } from "@/lib/program-types";
import { CountUp } from "@/components/environmental/ui/count-up";
import { Reveal, Stagger, StaggerItem } from "@/components/environmental/ui/reveal";
import { SectionHeading } from "@/components/environmental/ui/section-heading";
import { programIcons } from "./icons";

const benefitTones = ["bg-ch4/10 text-ch4", "bg-flare/10 text-flare", "bg-co2/10 text-co2", "bg-deep/10 text-deep"];

// ─── Overview: parallax photo + floating card + benefits ────────────────────

export function ProgramOverview({ c }: { c: OverviewContent }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const imageY = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);

  return (
    <section id={c.id ?? "overview"} className="relative overflow-hidden py-24 sm:py-32">
      <div aria-hidden className="absolute top-20 -right-40 h-[28rem] w-[28rem] rounded-full bg-leaf/20 blur-3xl" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-16 px-5 sm:px-8 lg:grid-cols-2 lg:gap-20">
        <Reveal x={-30} y={0} className="relative">
          <div ref={ref} className="relative aspect-[4/5] overflow-hidden rounded-[2rem] shadow-2xl shadow-deep/20">
            <motion.div style={{ y: imageY }} className="absolute -inset-y-[10%] inset-x-0">
              <Image src={c.image} alt={c.imageAlt} fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" />
            </motion.div>
            <div className="absolute inset-0 bg-linear-to-t from-deep/70 via-transparent to-transparent" />
            <div className="absolute inset-x-6 bottom-6 flex items-center gap-3 text-white">
              <span className="hex grid h-10 w-11 shrink-0 place-items-center bg-leaf font-mono text-xs font-medium text-deep">
                {c.badge.code}
              </span>
              <span className="text-sm leading-snug">
                {c.badge.line1}
                <br />
                <span className="text-white/70">{c.badge.line2}</span>
              </span>
            </div>
          </div>

          <div className="animate-float absolute -right-4 -top-6 hidden w-64 rounded-2xl border border-line bg-white/95 p-4 shadow-xl backdrop-blur sm:block lg:-right-10">
            <p className="eyebrow text-muted">{c.floating.title}</p>
            <ul className="mt-3 space-y-2.5">
              {c.floating.rows.map((row, i) => (
                <motion.li
                  key={row.step}
                  initial={{ opacity: 0, x: 12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.4 + i * 0.15, ease: [0.22, 1, 0.36, 1] }}
                  className="flex items-center gap-3 text-sm"
                >
                  <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${row.dot}`} />
                  <span className="w-12 shrink-0 font-mono text-[0.7rem] tracking-wider text-muted uppercase">{row.step}</span>
                  <span className="font-medium text-ink">{row.label}</span>
                </motion.li>
              ))}
            </ul>
          </div>
        </Reveal>

        <div>
          <SectionHeading eyebrow={c.eyebrow} title={c.title} body={c.body} />

          <Reveal delay={0.1} className="mt-10">
            <h3 className="font-display text-xl font-semibold text-ink">{c.benefitsTitle}</h3>
          </Reveal>
          <Stagger className="mt-5 grid gap-3 sm:grid-cols-2">
            {c.benefits.map((benefit, i) => {
              const Icon = programIcons[benefit.icon];
              return (
                <StaggerItem
                  key={benefit.text}
                  className="group flex gap-4 rounded-2xl border border-line bg-white p-4 transition-all duration-300 hover:-translate-y-1 hover:border-transparent hover:shadow-xl hover:shadow-deep/10"
                >
                  <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl transition-transform duration-300 group-hover:scale-110 ${benefitTones[i % 4]}`}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="text-sm leading-relaxed text-ink">{benefit.text}</span>
                </StaggerItem>
              );
            })}
          </Stagger>

          <Reveal delay={0.2}>
            <div className="mt-8 flex flex-col gap-4 rounded-2xl border-l-4 border-flare bg-tint p-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm leading-relaxed text-ink">
                <strong className="font-semibold">{c.callout.strong}</strong> {c.callout.text}
              </p>
              <a href={c.callout.href} className="group inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-flare">
                {c.callout.cta}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

// ─── "Why it matters": light lead + dark band with stats ────────────────────

function BigNumber({ stat, className }: { stat: BigStat; className: string }) {
  if (stat.value !== undefined) {
    return (
      <p className={className}>
        <CountUp value={stat.value} decimals={stat.decimals} prefix={stat.prefix} suffix={stat.suffix} />
      </p>
    );
  }
  return <p className={className}>{stat.text}</p>;
}

export function ProgramWhy({
  id = "why",
  eyebrow,
  title,
  body,
  lead,
  band,
}: {
  id?: string;
  eyebrow: string;
  title: string;
  body: string;
  lead?: React.ReactNode;
  band: WhyBand;
}) {
  const bandRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: bandRef, offset: ["start end", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["-12%", "12%"]);

  return (
    <section id={id} className="relative pt-24 sm:pt-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading eyebrow={eyebrow} title={title} body={body} />
        {lead}
      </div>

      <div ref={bandRef} className="relative isolate mt-24 overflow-hidden bg-deeper py-24 text-white sm:mt-32 sm:py-28">
        <motion.div style={{ y: bgY }} className="absolute -inset-y-[15%] inset-x-0 -z-10">
          <Image src={band.image} alt={band.imageAlt} fill sizes="100vw" className="object-cover opacity-25" />
        </motion.div>
        <div className="absolute inset-0 -z-10 bg-linear-to-br from-deeper via-deeper/90 to-deep/80" />
        <div className="topo absolute inset-0 -z-10" />

        <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-12 lg:gap-16">
          <div className="grid content-start gap-5 sm:grid-cols-2 lg:col-span-5 lg:grid-cols-1">
            <Reveal className="rounded-[1.75rem] border border-white/10 bg-white/5 p-8 backdrop-blur-md">
              <BigNumber stat={band.stats[0]} className="font-display text-6xl font-semibold tracking-tight text-sun sm:text-7xl" />
              <p className="mt-4 text-lg leading-snug text-white/85">{band.stats[0].label}</p>
              {band.stats[0].source ? (
                <p className="mt-6 font-mono text-xs tracking-wider text-white/45 uppercase">Source: {band.stats[0].source}</p>
              ) : null}
            </Reveal>
            <Reveal delay={0.15} className="rounded-[1.75rem] border border-white/10 bg-white/5 p-8 backdrop-blur-md">
              <BigNumber stat={band.stats[1]} className="font-display text-5xl font-semibold tracking-tight text-leaf sm:text-6xl" />
              <p className="mt-3 leading-snug text-white/80">{band.stats[1].label}</p>
            </Reveal>
          </div>

          <div className="lg:col-span-7">
            <SectionHeading dark eyebrow={band.eyebrow} title={band.title} />
            <Stagger className="mt-10 space-y-4">
              {band.reasons.map((reason) => (
                <StaggerItem
                  key={reason.title}
                  className="group flex gap-5 rounded-2xl border border-white/10 bg-white/[0.04] p-6 transition-colors duration-300 hover:bg-white/[0.08]"
                >
                  <span className={`hex mt-1 h-7 w-8 shrink-0 transition-transform duration-500 group-hover:rotate-180 ${toneBg[reason.tone]}`} />
                  <span>
                    <span className="block font-display text-xl font-semibold">{reason.title}</span>
                    <span className="mt-2 block leading-relaxed text-white/70">{reason.body}</span>
                  </span>
                </StaggerItem>
              ))}
            </Stagger>
            {band.footnote ? <p className="mt-8 text-xs leading-relaxed text-white/45">{band.footnote}</p> : null}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Four-step process with a self-drawing connector ────────────────────────

export function ProgramSteps({ c }: { c: StepsContent }) {
  return (
    <section id={c.id ?? "process"} className="relative overflow-hidden py-24 sm:py-32">
      <div aria-hidden className="absolute -left-40 top-40 h-[30rem] w-[30rem] rounded-full bg-co2/10 blur-3xl" />
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid items-end gap-8 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <SectionHeading eyebrow={c.eyebrow} title={c.title} />
          </div>
          <Reveal delay={0.1} className="lg:col-span-4">
            <p className="text-lg leading-relaxed text-muted">{c.body}</p>
          </Reveal>
        </div>

        <div className="mt-20">
          <Reveal className="max-w-2xl">
            <p className="eyebrow flex items-center gap-3 text-flare">
              <span className="h-px w-8 bg-flare" aria-hidden />
              {c.subEyebrow}
            </p>
            <h3 className="mt-4 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">{c.subTitle}</h3>
          </Reveal>

          <div className="relative mt-12">
            <motion.div
              aria-hidden
              className="absolute top-8 right-[12%] left-[12%] hidden h-0.5 origin-left bg-linear-to-r from-co2 via-flare to-ch4 lg:block"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, margin: "0px 0px -20% 0px" }}
              transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
            />
            <Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4" stagger={0.15}>
              {c.steps.map((step, i) => {
                const Icon = programIcons[step.icon];
                return (
                  <StaggerItem key={step.title} className="group relative">
                    <div className="relative z-10 mx-auto mb-6 hidden h-16 w-16 place-items-center lg:grid">
                      <span className={`hex absolute inset-0 ${toneBg[step.tone]} transition-transform duration-500 group-hover:rotate-60`} />
                      <Icon className="relative h-6 w-6 text-white" />
                    </div>
                    <div className="h-full rounded-[1.5rem] border border-line bg-white p-7 transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-2xl group-hover:shadow-deep/10">
                      <div className="flex items-center justify-between">
                        <span className={`font-display text-5xl font-semibold ${toneText[step.tone]}`}>{String(i + 1).padStart(2, "0")}</span>
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

// ─── Technology: dark section with stat tiles, a visual slot and proof cards ─

const statTones = ["text-sun", "text-leaf", "text-co2-soft"];

export function ProgramTech({ c, children }: { c: TechContent; children?: React.ReactNode }) {
  return (
    <section id={c.id ?? "technology"} className="relative isolate overflow-hidden bg-deep py-24 text-white sm:py-32">
      <div aria-hidden className="topo absolute inset-0 -z-10" />
      <div aria-hidden className="grain absolute inset-0 -z-10 opacity-[0.05] mix-blend-overlay" />

      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <SectionHeading dark eyebrow={c.eyebrow} title={c.title} body={c.body} />
          </div>
          <Stagger className="grid gap-3 sm:grid-cols-3 lg:col-span-5 lg:grid-cols-1">
            {c.stats.map((stat, i) => (
              <StaggerItem
                key={stat.label}
                className="flex items-center gap-5 rounded-2xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur-md sm:flex-col sm:items-start lg:flex-row lg:items-center"
              >
                <span className={`min-w-40 shrink-0 font-display text-4xl font-semibold tracking-tight sm:text-5xl ${statTones[i % 3]}`}>
                  {stat.value !== undefined ? <CountUp value={stat.value} prefix={stat.prefix} suffix={stat.suffix} /> : stat.text}
                </span>
                <span className="text-sm leading-snug text-white/75">{stat.label}</span>
              </StaggerItem>
            ))}
          </Stagger>
        </div>

        {children ? <div className="mt-16">{children}</div> : null}

        <Reveal className="mt-20">
          <h3 className="font-display text-2xl font-semibold sm:text-3xl">{c.proofsTitle}</h3>
        </Reveal>
        <Stagger className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5" stagger={0.08}>
          {c.proofs.map((proof, i) => (
            <StaggerItem
              key={proof.title}
              className="group rounded-2xl border border-white/10 bg-white/[0.04] p-6 transition-all duration-500 hover:-translate-y-1.5 hover:border-leaf/40 hover:bg-white/[0.08]"
            >
              <span className="font-mono text-xs text-leaf">0{i + 1}</span>
              <h4 className="mt-3 font-display text-lg font-semibold">{proof.title}</h4>
              <p className="mt-2 text-sm leading-relaxed text-white/65">{proof.body}</p>
            </StaggerItem>
          ))}
        </Stagger>

        {c.note ? <p className="mt-10 max-w-4xl text-xs leading-relaxed text-white/45">{c.note}</p> : null}
      </div>
    </section>
  );
}
