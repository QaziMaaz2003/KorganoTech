export const unsplash = (id: string, width = 2000) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${width}&q=80`;

export const site = {
  name: "Environmental Filters",
  company: "KorganoTech",
  partner: "Lawrence Livermore National Laboratory",
  partnerShort: "LLNL",
  address: "69 E Airway Blvd, Livermore, CA 94551",
  email: "CO2@KorganoTech.com",
  phone: "925-989-8726",
};

export const navLinks = [
  { label: "The Problem", href: "#problem" },
  { label: "Our Solution", href: "#solution" },
  { label: "Technology", href: "#technology" },
  { label: "Case Study", href: "#case-study" },
  { label: "Partner", href: "#partner" },
];

export type HeroSlide = {
  image: string;
  alt: string;
  tag: string;
  caption: string;
};

export const heroSlides: HeroSlide[] = [
  {
    image: unsplash("1441974231531-c6227db76b6e", 2400),
    alt: "Sunlight streaming through a green forest",
    tag: "Clean air",
    caption: "Cutting the greenhouse-gas burden our children will inherit",
  },
  {
    image: unsplash("1770068511850-50f9bd0ad5ed", 2400),
    alt: "Bulldozer compacting waste at a large landfill site",
    tag: "Landfill gas",
    caption: "Buried organic waste releases roughly half CH₄, half CO₂",
  },
  {
    image: unsplash("1532187863486-abf9dbad1b69", 2400),
    alt: "Pipette dispensing into a tray of laboratory sample tubes",
    tag: "LLNL science",
    caption: "Encapsulated sorbent absorbs CO₂ about 10× faster",
  },
  {
    image: unsplash("1473341304170-971dccb5ac1e", 2400),
    alt: "Electricity transmission towers at sunset",
    tag: "Renewable energy",
    caption: "Recovered methane becomes renewable gas or fuel for power",
  },
  {
    image: unsplash("1501854140801-50d01698950b", 2400),
    alt: "Rolling green hills seen from above",
    tag: "Captured carbon",
    caption: "CO₂ is collected and compressed for storage or reuse",
  },
];

export const heroFeatures = [
  "Automated carbon capture",
  "Methane recovery",
  "Reusable sorbent platform",
];

export const heroStats = [
  { value: "14.4%", label: "of U.S. human-related methane emissions came from landfills (2022)", tone: "leaf" },
  { value: "≥28×", label: "more heat trapped by methane than CO₂ over 100 years", tone: "sky" },
  { value: "~10×", label: "faster CO₂ absorption (LLNL lab data)", tone: "sun" },
  { value: "TRL 6", label: "technology readiness level", tone: "white" },
] as const;

export const tickerItems = [
  "Automated carbon capture",
  "Methane recovery",
  "Reusable sorbent media",
  "Developed with LLNL",
  "TRL 6 technology",
  "Off-the-shelf components",
  "MERV 13 integrated filter",
  "Low-energy regeneration",
];

export const footerNote =
  "This website is for information only. Performance figures come from laboratory studies and screening models; results at a specific site require pilot testing.";
