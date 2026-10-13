"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "motion/react";
import { ArrowRight, Factory, Flame, Leaf, Wrench } from "lucide-react";
import { useRef } from "react";
import { overview } from "@/lib/env-data";
import { Reveal, Stagger, StaggerItem } from "@/components/environmental/ui/reveal";
import { SectionHeading } from "@/components/environmental/ui/section-heading";

const benefitIcons = [Leaf, Flame, Factory, Wrench];
const benefitTones = [
  "bg-ch4/10 text-ch4",
  "bg-flare/10 text-flare",
  "bg-co2/10 text-co2",
  "bg-deep/10 text-deep",
];

export function Overview() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const imageY = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);

  return (
    <section id="overview" className="relative overflow-hidden py-24 sm:py-32">
      <div
        aria-hidden
        className="absolute top-20 -right-40 h-[28rem] w-[28rem] rounded-full bg-leaf/20 blur-3xl"
      />
      <div className="relative mx-auto grid max-w-7xl items-center gap-16 px-5 sm:px-8 lg:grid-cols-2 lg:gap-20">
        <Reveal x={-30} y={0} className="relative">
          <div ref={ref} className="relative aspect-[4/5] overflow-hidden rounded-[2rem] shadow-2xl shadow-deep/20">
            <motion.div style={{ y: imageY }} className="absolute -inset-y-[10%] inset-x-0">
              <Image
                src={overview.image}
                alt={overview.imageAlt}
                fill
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="object-cover"
              />
            </motion.div>
            <div className="absolute inset-0 bg-linear-to-t from-deep/70 via-transparent to-transparent" />
            <div className="absolute inset-x-6 bottom-6 flex items-center gap-3 text-white">
              <span className="hex grid h-10 w-11 place-items-center bg-leaf font-mono text-xs font-medium text-deep">
                CH₄
              </span>
              <span className="text-sm leading-snug">
                Methane-rich gas passes through
                <br />
                <span className="text-white/70">CO₂ stays in the media</span>
              </span>
            </div>
          </div>

          {/* Floating separation card */}
          <div className="animate-float absolute -right-4 -top-6 hidden w-60 rounded-2xl border border-line bg-white/95 p-4 shadow-xl backdrop-blur sm:block lg:-right-10">
            <p className="eyebrow text-muted">Selective media</p>
            <ul className="mt-3 space-y-2.5">
              {[
                { step: "In", label: "CH₄ + CO₂", dot: "bg-flare" },
                { step: "Held", label: "CO₂ in the media", dot: "bg-co2" },
                { step: "Out", label: "Methane-rich gas", dot: "bg-ch4" },
              ].map((row, i) => (
                <motion.li
                  key={row.step}
                  initial={{ opacity: 0, x: 12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.4 + i * 0.15, ease: [0.22, 1, 0.36, 1] }}
                  className="flex items-center gap-3 text-sm"
                >
                  <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${row.dot}`} />
                  <span className="w-9 font-mono text-[0.7rem] tracking-wider text-muted uppercase">
                    {row.step}
                  </span>
                  <span className="font-medium text-ink">{row.label}</span>
                </motion.li>
              ))}
            </ul>
          </div>
        </Reveal>

        <div>
          <SectionHeading eyebrow={overview.eyebrow} title={overview.title} body={overview.body} />

          <Reveal delay={0.1} className="mt-10">
            <h3 className="font-display text-xl font-semibold text-ink">Why it matters to you</h3>
          </Reveal>
          <Stagger className="mt-5 grid gap-3 sm:grid-cols-2">
            {overview.benefits.map((benefit, i) => {
              const Icon = benefitIcons[i];
              return (
                <StaggerItem
                  key={benefit}
                  className="group flex gap-4 rounded-2xl border border-line bg-white p-4 transition-all duration-300 hover:-translate-y-1 hover:border-transparent hover:shadow-xl hover:shadow-deep/10"
                >
                  <span
                    className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl transition-transform duration-300 group-hover:scale-110 ${benefitTones[i]}`}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="text-sm leading-relaxed text-ink">{benefit}</span>
                </StaggerItem>
              );
            })}
          </Stagger>

          <Reveal delay={0.2}>
            <div className="mt-8 flex flex-col gap-4 rounded-2xl border-l-4 border-flare bg-tint p-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm leading-relaxed text-ink">
                <strong className="font-semibold">Operate a landfill?</strong> We are working with
                landfill operators on demonstration projects.
              </p>
              <a
                href="#contact"
                className="group inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-flare"
              >
                Contact us
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
