export const unsplash = (id: string, width = 2000) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${width}&q=80`;

export const site = {
  name: "Environmental Filters",
  company: "KorganoTech",
  partner: "Lawrence Livermore National Laboratory",
  partnerShort: "LLNL",
  address: "69 E Airway Blvd, Livermore, CA 94551",
  // Placeholders carried over from the source site until real details are supplied.
  email: "[add email address]",
  phone: "[add phone number]",
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
  { value: "≈50%", label: "CH₄ in typical landfill gas", tone: "leaf" },
  { value: "≈50%", label: "CO₂ in typical landfill gas", tone: "sky" },
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

export const overview = {
  eyebrow: "What it does",
  title: "A filter that keeps the carbon and lets the methane go to work",
  body: "Landfill gas passes through a selective CO₂ filter media. CO₂ is held in the media and methane passes through for recovery. The system senses when the media is loaded, swaps cartridges automatically, and regenerates the media with low-energy heat so it can be reused.",
  image: unsplash("1473448912268-2022ce9509d8", 1400),
  imageAlt: "Calm river flowing between tall evergreen forests",
  benefits: [
    "Reduce methane and CO₂ released from your site",
    "Recover methane as renewable natural gas or fuel for power",
    "Collect CO₂ for storage or reuse",
    "Built from off-the-shelf components with automated operation",
  ],
};

export const problem = {
  eyebrow: "The problem",
  title: "Landfills turn organic waste into two climate liabilities",
  body: "As buried organic waste breaks down, it produces landfill gas that is roughly half methane and half carbon dioxide. Both add to the greenhouse-gas burden our children will inherit.",
  image: unsplash("1674321576323-82be6b715ebd", 2000),
  imageAlt: "Open landfill with scattered waste beneath distant mountains",
  gases: [
    {
      tone: "flare",
      share: 50,
      formula: "CH₄",
      name: "Methane",
      title: "High-impact methane",
      body: "Methane is at least 28 times more effective than CO₂ at trapping heat over 100 years, so near-term capture has an outsized effect.",
    },
    {
      tone: "co2",
      share: 50,
      formula: "CO₂",
      name: "Carbon dioxide",
      title: "Cumulative emissions",
      body: "CO₂ released from landfill gas adds directly to the long-term greenhouse-gas burden.",
    },
  ],
  headlineStat: {
    value: 14.4,
    decimals: 1,
    suffix: "%",
    label:
      "of U.S. human-related methane emissions came from municipal solid waste landfills (2022)",
    source: "U.S. EPA",
  },
  secondaryStat: {
    value: 28,
    suffix: "×",
    label: "heat-trapping effect of methane vs. CO₂ over 100 years (at least)",
  },
  reasons: [
    {
      tone: "flare",
      title: "Compliance pressure is increasing",
      body: "EPA inspections at municipal solid waste landfills have found recurring monitoring and maintenance failures that can lead to significant methane releases.",
    },
    {
      tone: "ch4",
      title: "Wasted gas is a lost energy asset",
      body: "Captured landfill gas can be upgraded into renewable methane or used for electricity, reducing emissions while creating value.",
    },
    {
      tone: "co2",
      title: "A solution is ready to demonstrate",
      body: "TRL 6 technology, an LLNL collaboration, an operating filter business and demonstration-site availability reduce execution risk.",
    },
  ],
  sources:
    "Sources: U.S. EPA, Basic Information about Landfill Gas; U.S. EPA, Enforcement Alert on MSW landfill monitoring and maintenance.",
} as const;

export const solution = {
  eyebrow: "Our solution",
  title: "An automated filter system that separates CO₂ from methane",
  body: "Working with LLNL, we have designed a system that combines a selective CO₂ media filter, optical sensing, automated cartridge exchange and low-energy regeneration.",
  steps: [
    {
      tone: "co2",
      title: "CO₂ capture + methane recovery",
      body: "Raw landfill gas (CH₄ + CO₂) flows through the filter cartridge. The capture media absorbs CO₂, and the remaining methane-rich gas is recovered.",
    },
    {
      tone: "flare",
      title: "Automated regeneration",
      body: "When optical sensors show the media is loaded, the system exchanges the cartridge and applies low-energy heat to release the CO₂.",
    },
    {
      tone: "ch4",
      title: "CO₂ collection + compression",
      body: "Released CO₂ is collected and compressed for storage or reuse.",
    },
    {
      tone: "deep",
      title: "Media reuse",
      body: "Regenerated media returns to service, so the sorbent is used again rather than replaced.",
    },
  ],
} as const;

export const demonstrated = {
  eyebrow: "Demonstrated functionality",
  title: "We have demonstrated the technology works",
  points: [
    "CO₂ capture media integrated with a MERV 13 particulate layer",
    "Gas-entry and gas-exit cartridge architecture",
    "Visible sensor response after CO₂ absorption",
    "Sensor restoration after heat-assisted CO₂ removal",
  ],
  deploy: [
    "Integrated, automated platform with minimal operator attention",
    "Major system components are commercially available and off the shelf",
    "Preliminary system design is complete",
  ],
  caption:
    "The media changes color as it absorbs CO₂ and returns to its original color after regeneration. After Vericella et al., Nature Communications (2015).",
};

export const technology = {
  eyebrow: "Technology validated · LLNL innovation",
  title: "Liquid sorbent, encapsulated for faster CO₂ capture",
  body: "LLNL developed microcapsules that hold a liquid carbonate sorbent inside a thin, highly permeable silicone shell. CO₂ diffuses through the shell and is absorbed by the core. Heating the capsules releases the CO₂ for collection, and the capsules are reused.",
  stats: [
    {
      value: 10,
      prefix: "~",
      suffix: "×",
      label: "higher CO₂ absorption rate vs. an identical neat liquid sorbent",
    },
    {
      value: 90,
      prefix: "≥",
      suffix: "%",
      label: "of initial absorption rate retained after 10 full absorption–desorption cycles",
    },
    {
      value: 80,
      label: "cycles run with no observed material degradation",
    },
  ],
  chart: {
    title: "CO₂ absorption rate: capsules vs. neat liquid sorbent",
    unit: "Relative absorption rate",
    series: [
      { key: "neat", label: "Neat liquid sorbent (pool)", color: "#d9651b" },
      { key: "capsules", label: "Encapsulated capsules (MECS)", color: "#1f64c8" },
    ],
    groups: [
      { label: "0 mM catalyst", neat: 80, capsules: 790 },
      { label: "25 mM catalyst", neat: 95, capsules: 900 },
      { label: "60 mM catalyst", neat: 105, capsules: 960 },
    ],
    note: "Values approximate, reproduced from Fig. 3i, Vericella et al., Nature Communications 6:6124 (2015), LLNL. Gram-scale lab data; pilot and commercial testing are required for deployment.",
  },
  proofs: [
    {
      title: "Capacity",
      body: "7.1 wt% CO₂ (sodium carbonate core), on par with or exceeding monoethanolamine (MEA, 6.9 wt%), today's commercial capture benchmark.",
    },
    {
      title: "Cycling durability",
      body: "≥90% of initial absorption rate retained after 10 full cycles, with consistent colorimetric and structural response across 80 cycles.",
    },
    {
      title: "Mechanically robust",
      body: "Microcapsules withstand a 4× increase in diameter (osmotic swelling) without rupture.",
    },
    {
      title: "Deployment-relevant form",
      body: "Demonstrated in a fluidized-bed configuration, surviving rigorous agitation while retaining capture function.",
    },
    {
      title: "Room to improve",
      body: "Shell CO₂ permeability of 3,260 Barrer confirms membrane diffusion is not rate-limiting.",
    },
  ],
  capsule: {
    title: "How the microcapsules are made",
    body: "A flow-focusing microfluidic device combines three fluids: the carbonate solution, an ultraviolet-curable silicone, and an outer aqueous solution. The result is cured silicone microcapsules of uniform size, with far more available sorbent surface area than a traditional MEA absorber tower packed with metal mesh.",
    specs: [
      { value: "~600 µm", label: "capsule diameter" },
      { value: "32 µm", label: "silicone wall" },
    ],
  },
  source:
    "Vericella, J.J. et al. “Encapsulated liquid sorbents for carbon dioxide capture.” Nature Communications 6:6124 (2015). DOI: 10.1038/ncomms7124",
};

export const caseStudy = {
  eyebrow: "Case study · Orange County, California",
  title: "Orange County landfill gas: a problem and an opportunity",
  body: "Combined landfill-gas flow across the county is modeled at approximately 15,000 CFM, or about 7.88 billion standard cubic feet a year.",
  image: unsplash("1470071459604-3b5ec3a7fe05", 2400),
  imageAlt: "Misty green valley at sunrise",
  flow: [
    {
      step: "The county problem",
      value: 7.88,
      decimals: 2,
      suffix: "B",
      unit: "scf/yr raw landfill gas",
      tone: "flare",
    },
    {
      step: "Recover methane",
      value: 3.745,
      decimals: 3,
      suffix: "B",
      unit: "scf/yr methane",
      tone: "leaf",
    },
    {
      step: "Capture CO₂ + value",
      value: 186614,
      decimals: 0,
      suffix: "",
      unit: "metric tons CO₂ per year",
      tone: "sky",
    },
  ],
  formula: "15,000 ft³/min × 60 min/hr × 24 hr/day × 365 days/yr ≈ 7.884 billion scf/yr",
  closing:
    "At this scale, separating CO₂ from landfill gas turns a large emissions source into a steady supply of renewable methane and a collectable CO₂ stream.",
  disclaimer:
    "All outcome figures are countywide screening-model estimates assuming successful validation and scale-up. They are not expected output from an initial demonstration.",
} as const;

export const products = {
  eyebrow: "The KorganoTech filter family",
  title: "From the air you breathe to the gas a landfill releases",
  body: "Environmental Filters builds on an operating filter business. The same design and manufacturing experience now targets landfill gas.",
  items: [
    {
      kind: "hvac",
      title: "Traditional HVAC Air Filters",
      subtitle: "MERV 13 pleated filtration",
      status: "Available now",
      statusTone: "ch4",
      body: "Commercial and residential air filters manufactured and sold by KorganoTech today.",
    },
    {
      kind: "pathogen",
      title: "Pathogen Air Filters",
      subtitle: "Capture and kill pathogens",
      status: "EPA registration under way",
      statusTone: "flare",
      body: "Not available for purchase while EPA registration is completed.",
    },
    {
      kind: "environmental",
      title: "Environmental Filters",
      subtitle: "Capture CO₂ gas",
      status: "In development · landfill application",
      statusTone: "co2",
      body: "A reusable CO₂ capture cartridge, the heart of the landfill-gas system.",
    },
  ],
} as const;

export const partner = {
  eyebrow: "About our partner",
  title: "Lawrence Livermore National Laboratory",
  body: "Over $1 billion in annual R&D funding, a validated IP pipeline, and a proven track record of moving breakthrough laboratory technology into commercial markets. Research backed and vetted by the U.S. Department of Energy.",
  image: unsplash("1581093450021-4a7360e9a6b5", 1400),
  imageAlt: "Two scientists working together at a laboratory bench",
  collaborator: {
    name: "Dr. Congwang (CW) Ye",
    role: "Collaborator · Lead materials scientist",
    bio: "Specializing in microfluidics, microencapsulation and advanced carbon-trapping architectures.",
    highlights: [
      {
        title: "Disruptive innovation",
        body: "Co-inventor of the R&D 100 Award-winning In-air Drop Encapsulation Apparatus (IDEA).",
      },
      {
        title: "The breakthrough",
        body: "Using LLNL's advanced manufacturing to encase liquid carbon-absorbing solvents inside tiny, CO₂-permeable polymer shells, giving a roughly 10× boost in absorption rate.",
      },
    ],
  },
  about: {
    title: "About KorganoTech",
    body: "KorganoTech is an operating manufacturer of commercial HVAC air filters based in Livermore, California. Environmental Filters applies our filter design and manufacturing experience to landfill gas, together with carbon-capture science developed at LLNL.",
  },
};

export const contact = {
  eyebrow: "Landfill operators",
  title: "Contact us for more information",
  body: "We are looking for landfill operators interested in learning more about Environmental Filters and in hosting demonstration projects. Reach out and our team will follow up.",
  share: [
    "Landfill name and location",
    "Approximate landfill-gas flow (CFM) and CH₄/CO₂ mix, if known",
    "How the gas is handled today (flare, power, RNG upgrading)",
    "Your interest: information, a site screening estimate, or a demonstration",
  ],
  interests: ["General information", "Site screening estimate", "Host a demonstration"],
  handling: ["Flare", "Power generation", "RNG upgrading", "Not sure"],
};

export const footerNote =
  "This website is for information only. Performance figures come from laboratory studies and screening models; results at a specific site require pilot testing.";
