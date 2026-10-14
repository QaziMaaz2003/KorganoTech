import type { Tone } from "./env-tones";

export interface HeroSlideContent {
  image: string;
  alt: string;
  tag: string;
  caption: string;
}

export interface HeroContent {
  /** aria-label for the carousel */
  label: string;
  pill: string;
  headline: { text: string; accent?: boolean }[];
  body: string;
  primary: { label: string; href: string };
  secondary: { label: string; href: string };
  features: string[];
  stats: { value: string; label: string; tone: Tone }[];
  slides: HeroSlideContent[];
  /** Short labels shown inside the rising bubbles (index-matched; "" for none). */
  bubbleLabels?: string[];
  scrollHref?: string;
}

import type { IconKey } from "@/components/program/icons";

export interface OverviewContent {
  id?: string;
  eyebrow: string;
  title: string;
  body: string;
  image: string;
  imageAlt: string;
  badge: { code: string; line1: string; line2: string };
  floating: { title: string; rows: { step: string; label: string; dot: string }[] };
  benefitsTitle: string;
  benefits: { icon: IconKey; text: string }[];
  callout: { strong: string; text: string; cta: string; href: string };
}

export interface WhyBand {
  image: string;
  imageAlt: string;
  stats: [BigStat, BigStat];
  eyebrow: string;
  title: string;
  reasons: { title: string; body: string; tone: Tone }[];
  footnote?: string;
}

export interface BigStat {
  value?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  /** Shown instead of a counting number when there is no figure to count. */
  text?: string;
  label: string;
  source?: string;
}

export interface StepsContent {
  id?: string;
  eyebrow: string;
  title: string;
  body: string;
  subEyebrow: string;
  subTitle: string;
  steps: { icon: IconKey; title: string; body: string; tone: Tone }[];
}

export interface TechContent {
  id?: string;
  eyebrow: string;
  title: string;
  body: string;
  stats: { value?: number; prefix?: string; suffix?: string; text?: string; label: string }[];
  proofsTitle: string;
  proofs: { title: string; body: string }[];
  note?: string;
}

export interface FaqItem {
  q: string;
  a: string;
}
