// MERV reference data. Efficiencies are the ASHRAE 52.2-2017 minimums
// (E1: 0.3–1 µm, E2: 1–3 µm, E3: 3–10 µm).

export const MERV_INFO: Record<number, { tag: string; summary: string; recommended: string; tone: string }> = {
  8: {
    tag: "Standard",
    summary: "Everyday filtration for dust, lint and pollen.",
    recommended: "Basic air quality in standard homes",
    tone: "bg-[oklch(45%_0.08_260)] text-white",
  },
  11: {
    tag: "Advanced",
    summary: "Captures fine dust, pollen, mold spores and pet dander.",
    recommended: "Homes with pets, kids or mild allergies",
    tone: "bg-gradient-brand text-white",
  },
  13: {
    tag: "Superior",
    summary: "Our highest-efficiency pleated filter, for smaller particles such as smoke and fine dust.",
    recommended: "Allergies, sensitivities and higher-occupancy buildings",
    tone: "bg-night text-white",
  },
};

export const ASHRAE_ROWS = [
  { band: "E3 · 3–10 µm", examples: "Pollen, dust mites, mold spores, lint", m11: "≥ 85%", m13: "≥ 90%" },
  { band: "E2 · 1–3 µm", examples: "Fine dust, pet dander, auto emissions", m11: "≥ 65%", m13: "≥ 85%" },
  { band: "E1 · 0.3–1 µm", examples: "Smoke and smog particles", m11: "≥ 20%", m13: "≥ 50%" },
];
