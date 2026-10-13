// Learning-center articles (titles from the redesign's Resources section).

export interface Article {
  slug: string;
  category: string;
  title: string;
  excerpt: string;
  minutes: number;
  image: string;
  sections: { heading?: string; paragraphs?: string[]; list?: string[] }[];
}

export const articles: Article[] = [
  {
    slug: "understanding-hvac-air-filters",
    category: "HVAC Basics",
    title: "Understanding HVAC Air Filters",
    excerpt: "What an HVAC filter does, where it sits in the system, and why it matters.",
    minutes: 5,
    image: "/images/filter-hvac.jpg",
    sections: [
      {
        paragraphs: [
          "Every forced-air heating and cooling system moves the air in your home or building through a filter before it reaches the blower and coils. That filter has two jobs: protect the equipment from dust build-up, and catch particles so they don't keep circulating through your rooms.",
        ],
      },
      {
        heading: "Where the filter sits",
        paragraphs: [
          "Most residential systems hold the filter in a slot beside the furnace or air handler, or behind a return-air grille in a wall or ceiling. Larger commercial systems may use banks of filters inside the air-handling unit.",
          "Air always flows in one direction through the filter. Look for the airflow arrow printed on the frame and point it toward the furnace or air handler — away from the return grille.",
        ],
      },
      {
        heading: "Pleated filters and MERV ratings",
        paragraphs: [
          "Pleated filters fold their media into a zig-zag so more filter material fits in the same frame. More surface area means more capacity to hold particles while keeping airflow steady.",
          "Filters are rated on the MERV scale (Minimum Efficiency Reporting Value) defined by ASHRAE Standard 52.2. Higher MERV values capture a larger share of smaller particles. KorganoTech manufactures MERV 11 and MERV 13 filters using traditional melt blown filtration media.",
        ],
      },
      {
        heading: "How often to change it",
        paragraphs: [
          "For most homes with a 1-inch filter, 60–90 days is a reliable baseline. Change it more often if you have pets, allergies, a dusty environment or heavy system use. Thicker 2-inch and 4-inch filters hold more and typically last longer.",
        ],
        list: [
          "Allergies or asthma in the home: about every 6 weeks",
          "Pets: about every 2 months",
          "Typical household: every 60–90 days",
          "Vacation homes or light use: up to 6 months for deeper filters",
        ],
      },
      {
        heading: "Signs a filter needs replacing",
        list: [
          "The media looks grey or visibly loaded with dust",
          "Rooms take longer to heat or cool",
          "More dust settles on surfaces than usual",
          "The system runs longer or energy bills creep up",
        ],
      },
    ],
  },
  {
    slug: "choosing-the-right-filter-size",
    category: "Buying Guide",
    title: "Choosing the Right Filter Size",
    excerpt: "How filter dimensions are measured and how to confirm the size you need.",
    minutes: 4,
    image: "/images/hero-filter.jpg",
    sections: [
      {
        paragraphs: [
          "Air filters are sold by their nominal size: rounded width × length × depth in inches, such as 16x25x1. The quickest way to find yours is to read the size printed on the frame of the filter you are replacing.",
        ],
      },
      {
        heading: "Nominal vs. actual size",
        paragraphs: [
          "A filter's actual dimensions are usually a little smaller than its nominal size so it slides easily into the slot. A 16x25x1 filter typically measures about 15.5 × 24.5 × 0.75 inches. Each KorganoTech product page lists both nominal and actual size.",
        ],
      },
      {
        heading: "If there's no size on the frame",
        list: [
          "Measure the width and length of the old filter (or the slot) to the nearest quarter inch",
          "Measure the depth — most residential filters are 1, 2 or 4 inches deep",
          "Round up to the nearest standard nominal size",
          "If it doesn't match a standard size, contact us about a custom filter",
        ],
      },
      {
        heading: "Width or length first?",
        paragraphs: [
          "Filters are interchangeable either way: 16x25x1 and 25x16x1 are the same filter. Our size finder accepts either order.",
        ],
      },
    ],
  },
  {
    slug: "how-air-filtration-works",
    category: "Technology",
    title: "How Air Filtration Works",
    excerpt: "A plain-language look at how air moves through filtration media.",
    minutes: 5,
    image: "/images/filter-pathogen.jpg",
    sections: [
      {
        paragraphs: [
          "A filter isn't just a sieve. Fibrous filter media captures particles through several mechanisms working together, and each one is most effective at a different particle size.",
        ],
      },
      {
        heading: "The four capture mechanisms",
        list: [
          "Straining: particles larger than the gaps between fibers simply can't pass",
          "Impaction: heavier particles can't follow the air as it bends around a fiber, so they hit it and stick",
          "Interception: particles that follow the airflow still brush against a fiber and are held",
          "Diffusion: the smallest particles move erratically and eventually collide with fibers",
        ],
      },
      {
        heading: "Why melt blown media matters",
        paragraphs: [
          "Melt blown media is made of very fine synthetic fibers laid down in a dense, random web. The fine fibers create a large surface area for interception and diffusion, which is how pleated filters reach MERV 11 and MERV 13 efficiencies without restricting airflow excessively.",
        ],
      },
      {
        heading: "Capture is not deactivation",
        paragraphs: [
          "Traditional filters hold particles; they don't change them. That is the gap KorganoTech's Pathogen Air Filter program is researching — a nanotechnology-based media designed to capture and neutralize airborne pathogens. That product is still under development and is not commercially available.",
        ],
      },
    ],
  },
  {
    slug: "future-of-environmental-filtration",
    category: "Innovation",
    title: "The Future of Environmental Filtration",
    excerpt: "Where filtration research is heading for environmental applications.",
    minutes: 6,
    image: "/images/filter-environmental.jpg",
    sections: [
      {
        paragraphs: [
          "Filtration isn't only about the air indoors. The same design and manufacturing experience behind HVAC filters can be applied to gas separation — and landfills are one of the most important places to do it.",
        ],
      },
      {
        heading: "The landfill-gas problem",
        paragraphs: [
          "As buried organic waste breaks down it produces landfill gas that is roughly half methane and half carbon dioxide. Methane is at least 28 times more effective than CO₂ at trapping heat over 100 years, so capturing it has an outsized effect.",
        ],
      },
      {
        heading: "Separating CO₂ from methane",
        paragraphs: [
          "KorganoTech's Environmental Filters program, developed with Lawrence Livermore National Laboratory, passes landfill gas through a selective CO₂ filter media. CO₂ is held in the media while methane passes through for recovery as renewable natural gas or fuel for power.",
          "When sensors show the media is loaded, the system swaps cartridges and regenerates the media with low-energy heat so it can be reused, and the released CO₂ is collected for storage or reuse.",
        ],
      },
      {
        heading: "Where it stands",
        paragraphs: [
          "The technology is at TRL 6 and in development for landfill applications. Performance figures come from laboratory studies and screening models; results at a specific site require pilot testing.",
        ],
      },
    ],
  },
];

export const findArticle = (slug: string) => articles.find((a) => a.slug === slug);
