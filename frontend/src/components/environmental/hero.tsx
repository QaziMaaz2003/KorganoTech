"use client";

import Image from "next/image";
import { AnimatePresence, motion, type Variants } from "motion/react";
import { ArrowDown, ArrowRight, Check, Play } from "lucide-react";
import { useCallback, useEffect, useState, type CSSProperties } from "react";
import { heroFeatures, heroSlides, heroStats } from "@/lib/env-data";
import { toneBg, toneText } from "@/lib/env-tones";
import type { HeroContent } from "@/lib/program-types";

const SLIDE_INTERVAL_MS = 2000;
const EASE = [0.22, 1, 0.36, 1] as const;

const slideVariants: Variants = {
  enter: (dir: number) => ({ x: dir > 0 ? "100%" : "-100%", zIndex: 2 }),
  center: { x: "0%", zIndex: 2, transition: { duration: 0.95, ease: EASE } },
  exit: (dir: number) => ({
    x: dir > 0 ? "-28%" : "28%",
    zIndex: 1,
    transition: { duration: 0.95, ease: EASE },
  }),
};

// Deterministic so server and client render the same bubbles.
const bubbles = [
  { left: "6%", size: 54, delay: 0, duration: 16, drift: 30, label: "CO₂" },
  { left: "18%", size: 30, delay: 5, duration: 13, drift: -20, label: "" },
  { left: "31%", size: 42, delay: 9, duration: 18, drift: 24, label: "CH₄" },
  { left: "47%", size: 24, delay: 2, duration: 12, drift: -30, label: "" },
  { left: "58%", size: 48, delay: 7, duration: 17, drift: 18, label: "CO₂" },
  { left: "71%", size: 28, delay: 11, duration: 14, drift: -16, label: "" },
  { left: "83%", size: 40, delay: 3, duration: 15, drift: 26, label: "CH₄" },
  { left: "93%", size: 22, delay: 8, duration: 11, drift: -24, label: "" },
];

const envHeroContent: HeroContent = {
  label: "Environmental Filters highlights",
  pill: "Technology in development · Built on LLNL science",
  headline: [
    { text: "Turn" },
    { text: "landfill" },
    { text: "gas" },
    { text: "into" },
    { text: "renewable", accent: true },
    { text: "methane", accent: true },
    { text: "and" },
    { text: "captured" },
    { text: "carbon." },
  ],
  body: "Environmental Filters is an automated carbon-capture and methane-recovery system developed by KorganoTech with Lawrence Livermore National Laboratory. It separates CO₂ from landfill gas using a reusable filter media, leaving methane you can put to work.",
  primary: { label: "Host a demonstration", href: "#contact" },
  secondary: { label: "See how it works", href: "#solution" },
  features: heroFeatures,
  stats: [...heroStats],
  slides: heroSlides,
};

export function Hero({ content }: { content?: HeroContent }) {
  const c = content ?? envHeroContent;
  const slides = c.slides;
  const [[index, dir], setSlide] = useState<[number, number]>([0, 1]);
  const [paused, setPaused] = useState(false);
  const slide = slides[index];

  const goTo = useCallback((next: number) => {
    setSlide(([current]) => {
      if (next === current) return [current, 1];
      return [next, next > current ? 1 : -1];
    });
  }, []);

  // Advance every 2 seconds; re-arms whenever the slide changes (including manual jumps).
  useEffect(() => {
    if (paused) return;
    const timer = window.setTimeout(() => {
      setSlide(([current]) => [(current + 1) % slides.length, 1]);
    }, SLIDE_INTERVAL_MS);
    return () => window.clearTimeout(timer);
  }, [index, paused, slides.length]);

  // Don't burn through slides in a background tab.
  useEffect(() => {
    const onVisibility = () => setPaused(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  return (
    <section
      id="top"
      aria-roledescription="carousel"
      aria-label={c.label}
      className="relative isolate flex min-h-svh flex-col overflow-hidden bg-abyss text-white"
    >
      {/* Slides */}
      <div className="absolute inset-0 -z-20 overflow-hidden">
        <AnimatePresence initial={false} custom={dir}>
          <motion.div
            key={index}
            custom={dir}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="absolute inset-0"
          >
            <motion.div
              className="absolute inset-0"
              initial={{ scale: 1.14 }}
              animate={{ scale: 1.02 }}
              transition={{ duration: 3.2, ease: "easeOut" }}
            >
              <Image
                src={slide.image}
                alt={slide.alt}
                fill
                sizes="100vw"
                preload={index === 0}
                className="object-cover"
              />
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* Warm every slide in the cache so each 2-second change lands instantly. */}
        <div className="hidden" aria-hidden>
          {slides.slice(1).map((s) => (
            <Image
              key={s.image}
              src={s.image}
              alt=""
              width={1920}
              height={1080}
              sizes="100vw"
              loading="eager"
              fetchPriority="low"
            />
          ))}
        </div>
      </div>

      {/* Legibility + atmosphere */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-linear-to-r from-abyss/90 via-abyss/55 to-abyss/5"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-linear-to-t from-abyss/90 via-transparent to-abyss/50"
      />
      <div aria-hidden className="grain absolute inset-0 -z-10 opacity-[0.07] mix-blend-overlay" />

      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        {bubbles.map((b, i) => (
          <span
            key={i}
            className="animate-rise absolute -bottom-20 grid place-items-center rounded-full border border-white/25 bg-white/5 font-mono text-[0.6rem] text-white/80 backdrop-blur-[2px]"
            style={
              {
                left: b.left,
                width: b.size,
                height: b.size,
                animationDelay: `${b.delay}s`,
                "--rise-duration": `${b.duration}s`,
                "--rise-drift": `${b.drift}px`,
                "--rise-opacity": 0.5,
              } as CSSProperties
            }
          >
            {c.bubbleLabels ? (c.bubbleLabels[i] ?? "") : b.label}
          </span>
        ))}
      </div>

      {/* Content */}
      <div className="mx-auto grid w-full max-w-7xl flex-1 items-center gap-12 px-5 pt-28 pb-10 sm:px-8 lg:grid-cols-12 lg:gap-8 lg:pt-24">
        <div className="lg:col-span-7">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE }}
            className="inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-white/10 py-1.5 pr-4 pl-2 text-sm text-white/85 backdrop-blur-md"
          >
            <span className="relative grid h-5 w-5 place-items-center">
              <span className="animate-pulse-ring absolute inset-0 rounded-full bg-leaf/60" />
              <span className="relative h-2 w-2 rounded-full bg-leaf" />
            </span>
            {c.pill}
          </motion.p>

          <h1 className="mt-6 font-display text-[2.6rem] leading-[1.02] font-semibold tracking-tight text-balance sm:text-6xl xl:text-[4.25rem]">
            {c.headline.map((word, i) => (
              <span key={i} className="inline-block overflow-hidden pb-[0.12em] align-bottom">
                <motion.span
                  className={`inline-block ${
                    word.accent ? "font-serif font-normal text-leaf italic" : ""
                  }`}
                  initial={{ y: "110%" }}
                  animate={{ y: "0%" }}
                  transition={{ duration: 0.9, delay: 0.15 + i * 0.07, ease: EASE }}
                >
                  {word.text}
                </motion.span>
                {i < c.headline.length - 1 ? " " : null}
              </span>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.85, ease: EASE }}
            className="mt-6 max-w-xl text-lg leading-relaxed text-white/80 text-pretty"
          >
            {c.body}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1, ease: EASE }}
            className="mt-8 flex flex-wrap items-center gap-4"
          >
            <a
              href={c.primary.href}
              className="group inline-flex items-center gap-2 rounded-full bg-flare px-7 py-4 font-semibold text-white shadow-xl shadow-flare/30 transition-all hover:-translate-y-0.5 hover:bg-[#c2561a]"
            >
              {c.primary.label}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>
            <a
              href={c.secondary.href}
              className="group inline-flex items-center gap-3 rounded-full border border-white/25 bg-white/5 py-2 pr-6 pl-2 font-semibold text-white backdrop-blur-md transition-colors hover:bg-white/15"
            >
              <span className="grid h-10 w-10 place-items-center rounded-full bg-white text-deep transition-transform group-hover:scale-110">
                <Play className="h-4 w-4 fill-current" />
              </span>
              {c.secondary.label}
            </a>
          </motion.div>

          <motion.ul
            initial="hidden"
            animate="show"
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1, delayChildren: 1.15 } } }}
            className="mt-8 flex flex-wrap gap-x-6 gap-y-3"
          >
            {c.features.map((feature) => (
              <motion.li
                key={feature}
                variants={{ hidden: { opacity: 0, x: -10 }, show: { opacity: 1, x: 0 } }}
                className="flex items-center gap-2 text-sm text-white/80"
              >
                <span className="grid h-5 w-5 place-items-center rounded-full bg-leaf/20 text-leaf">
                  <Check className="h-3 w-3" strokeWidth={3} />
                </span>
                {feature}
              </motion.li>
            ))}
          </motion.ul>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6, ease: EASE }}
          className="flex flex-col gap-4 lg:col-span-5 lg:pl-8"
        >
          {/* Slide caption, synced to the carousel */}
          <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur-xl">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={{ duration: 0.35, ease: EASE }}
                className="flex items-start gap-4"
              >
                <span className="font-mono text-3xl leading-none font-medium text-white/30">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span>
                  <span className="eyebrow text-leaf">{slide.tag}</span>
                  <span className="mt-1.5 block font-display text-lg leading-snug text-white">
                    {slide.caption}
                  </span>
                </span>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="animate-float-slow grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-white/15 bg-white/15 backdrop-blur-xl">
            {c.stats.map((stat) => (
              <div key={stat.label} className="bg-abyss/60 p-5">
                <span className={`block h-1 w-8 rounded-full ${toneBg[stat.tone]}`} />
                <span
                  className={`mt-4 block font-display text-3xl font-semibold tracking-tight sm:text-4xl ${toneText[stat.tone]}`}
                >
                  {stat.value}
                </span>
                <span className="mt-1 block text-sm leading-snug text-white/65">{stat.label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Slide controls */}
      <div className="relative mx-auto w-full max-w-7xl px-5 pb-7 sm:px-8">
        <div className="flex items-end justify-between gap-6">
          <div className="grid flex-1 grid-cols-5 gap-2 sm:gap-3" role="tablist" aria-label="Choose slide">
            {slides.map((s, i) => (
              <button
                key={s.tag}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={`Slide ${i + 1}: ${s.tag}`}
                onClick={() => goTo(i)}
                className="group text-left"
              >
                <span
                  className={`hidden pb-2 font-mono text-[0.68rem] tracking-[0.14em] uppercase transition-colors sm:block ${
                    i === index ? "text-white" : "text-white/45 group-hover:text-white/80"
                  }`}
                >
                  {s.tag}
                </span>
                <span className="block h-1 overflow-hidden rounded-full bg-white/20">
                  {i === index ? (
                    <motion.span
                      key={`${index}-${paused}`}
                      className="block h-full origin-left rounded-full bg-leaf"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: paused ? 0 : 1 }}
                      transition={{ duration: SLIDE_INTERVAL_MS / 1000, ease: "linear" }}
                    />
                  ) : i < index ? (
                    <span className="block h-full rounded-full bg-white/50" />
                  ) : null}
                </span>
              </button>
            ))}
          </div>
          <a
            href={c.scrollHref ?? "#overview"}
            className="hidden shrink-0 items-center gap-2 font-mono text-xs tracking-[0.14em] text-white/60 uppercase transition-colors hover:text-white md:flex"
          >
            Scroll
            <span className="grid h-9 w-9 place-items-center rounded-full border border-white/25">
              <ArrowDown className="h-4 w-4 animate-bounce" />
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
