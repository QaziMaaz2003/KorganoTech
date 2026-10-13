export type Tone = "flare" | "co2" | "ch4" | "deep" | "leaf" | "sun" | "sky" | "white";

// Full class strings so Tailwind can see them at build time.
export const toneText: Record<Tone, string> = {
  flare: "text-flare",
  co2: "text-co2",
  ch4: "text-ch4",
  deep: "text-deep",
  leaf: "text-leaf",
  sun: "text-sun",
  sky: "text-co2-soft",
  white: "text-white",
};

export const toneBg: Record<Tone, string> = {
  flare: "bg-flare",
  co2: "bg-co2",
  ch4: "bg-ch4",
  deep: "bg-deep",
  leaf: "bg-leaf",
  sun: "bg-sun",
  sky: "bg-co2-soft",
  white: "bg-white",
};

export const toneSoftBg: Record<Tone, string> = {
  flare: "bg-flare/10",
  co2: "bg-co2/10",
  ch4: "bg-ch4/10",
  deep: "bg-deep/10",
  leaf: "bg-leaf/15",
  sun: "bg-sun/15",
  sky: "bg-co2-soft/15",
  white: "bg-white/15",
};

export const toneBorder: Record<Tone, string> = {
  flare: "border-flare",
  co2: "border-co2",
  ch4: "border-ch4",
  deep: "border-deep",
  leaf: "border-leaf",
  sun: "border-sun",
  sky: "border-co2-soft",
  white: "border-white",
};
