// Brand facts and copy. Text marked "original" is verbatim from korganotech.com.

export const brand = {
  name: "KorganoTech",
  tagline: "Advancing Air Filtration for Cleaner Environments", // original
  logoTagline: "Clean Air is Our Passion",
  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "",
  address: "69 E Airway Blvd, Livermore, CA 94551",
  epaEstablishment: "102482-CA-1", // original
  trademark: "7565070", // original
  walmartUrl: "https://www.walmart.com/search?q=KorganoTech",
  social: {
    twitter: "https://twitter.com/filterpathogen",
    facebook: "https://facebook.com/filterpathogen",
    instagram: "https://instagram.com/filterpathogen",
  },
};

export const programs = [
  {
    slug: "hvac",
    href: "/hvac-air-filters",
    name: "Traditional HVAC Air Filters",
    short: "HVAC Air Filters",
    status: "Available Now",
    available: true,
    image: "/images/filter-hvac.jpg",
    blurb: "Reliable filtration solutions designed for everyday HVAC applications.",
  },
  {
    slug: "pathogen",
    href: "/pathogen-air-filters",
    name: "Pathogen Air Filters",
    short: "Pathogen Air Filters",
    status: "Under Development",
    available: false,
    image: "/images/filter-pathogen.jpg",
    blurb: "A nanotechnology-based filter designed to capture and neutralize airborne pathogens.",
  },
  {
    slug: "environmental",
    href: "/environmental-air-filters",
    name: "Environmental Air Filters",
    short: "Environmental Air Filters",
    status: "Under Development",
    available: false,
    image: "/images/filter-environmental.jpg",
    blurb: "Next-generation filtration technology being developed for environmental and landfill applications.",
  },
] as const;

// ─── Original korganotech.com copy ──────────────────────────────────────────

export const hvacCopy = {
  title: "KorganoTech Traditional Air Filters",
  headline: "America’s #1 Pleated HVAC Air Filter",
  availability: "Available at Walmart.com",
  body: "KorganoTech specializes in manufacturing high-performance MERV 11 and MERV 13 air filters using traditional melt blown filtration media and engineered to improve indoor air quality by reducing airborne pollutants and other harmful particulates.",
  points: [
    "Designed with a pleated construction to contribute to a cleaner and fresher indoor environment",
    "Suitable for use in furnaces, air conditioners, heating systems, or HVAC systems",
  ],
  trademarkNote: "KorganoTech is a registered U.S. trademark # 7565070",
  bulk: "For Bulk Purchases of KorganoTech Traditional Air Filters, please fill out our Contact Form",
};

export const pathogenCopy = {
  title: "KorganoTech Pathogen Air Filter",
  status: "(Technology Under Development)*",
  intro:
    "KorganoTech is developing a nanotechnology-based air filter designed to effectively capture and neutralize airborne pathogens, ensuring cleaner and safer indoor environments",
  development:
    "KorganoTech Pathogen Air Filter is currently under development. Once developed and validated, it is expected to effectively capture and neutralize harmful airborne pathogens. Its efficacy is being validated through rigorous third-party certification testing to ensure compliance with EPA regulations and industry standards for air quality and safety. It is not yet registered as a pesticide or pesticide device.",
  disclaimer:
    "*Disclaimer: The KorganoTech Pathogen Air Filter is currently in the research and development phase and is not yet commercially available. Information presented on KorganoTech Pathogen Air Filters is intended for investor and informational purposes only and should not be construed as an endorsement, claim, or guarantee of performance until validated through regulatory approvals.",
  nanoTitle: "Nanotechnology at the Forefront",
  nano: "KorganoTech is a nanotechnology-based air filter that uses known antimicrobial bioactive metal particles (BMPs), such as silver, copper, and metal oxides, embedded in an ultra-high surface area, porous nanowire web to capture pathogens of all sizes. When BMPs interact with the captured pathogens to form metal ions (created via dissolution of BMPs) that damage the pathogens' proteins and DNA, preventing them from growing and reproducing.",
};

export const aboutCopy = {
  mission:
    "Our mission is to enhance indoor air quality in schools, poultry farms, senior centers, and other high-risk environments.",
  about: [
    "KorganoTech specializes in manufacturing high-performance MERV 11 and MERV 13 air filters using traditional melt blown filtration media. These Air Filters are available to purchase at Walmart.com.",
    "KorganoTech is also developing a nanotechnology-based air filtration system to neutralizes and deactivates captured pathogens without electricity and ensure a cleaner, and safer air. These filters are not currently available for purchase.",
  ],
  motivation: [
    "At the onset of the COVID-19 pandemic, many of us relied on traditional air filters to keep us safe by providing clean air. However, published research shows that these filters are largely ineffective against airborne pathogens such as viruses, bacteria, and other microorganisms. While they may capture particles, traditional filters do not have the ability to deactivate or destroy pathogens—unless paired with additional technologies like UV purification or heat sterilization.",
    "Over time, trapped pathogens can accumulate and potentially be re-released into the air, contaminating homes, buildings, and vehicles. This critical gap in air safety inspired us to develop KorganoTech Pathogen Air Filters, with the mission to protect lives, reduce costs, and improve public health.",
    "Today, clean air matters more than ever because airborne diseases and viral outbreaks have had devastating effects on both public health and the global economy. We believe that investing in advanced air purification is no longer a luxury—it’s a necessity.",
  ],
  commitment: [
    "Since our inception, we have been committed to delivering high-quality, affordable filtration solutions. Our passion for innovation continues to drive us forward, setting new standards for indoor air quality. Our passion for excellence has driven us from the beginning and continues to drive us into the future.",
    "Explore our website to learn more about our innovation.",
  ],
  disclaimer:
    "Disclaimer: Please note that air filters and air purifiers cannot fully prevent transmission of a pathogen and protect people from COVID-19 and other airborne diseases. Please follow the directions and best practices recommended by the Centers for Disease Control and other Government authorities. KorganoTech Air filters can be part of a plan to protect yourself and your family, employees, and customers.",
};

// ─── Navigation ─────────────────────────────────────────────────────────────

export const mainNav = [
  { label: "About Us", href: "/about" },
  { label: "Resources", href: "/resources" },
];

export const technologyNav = programs.filter((p) => p.slug !== "hvac").map((p) => ({
  ...p,
  navLabel: p.slug === "pathogen" ? "Pathogen Air Filter" : "Environmental Filters",
}));

export const footerNav = [
  {
    title: "Shop Filters",
    links: [
      { label: "All Air Filters", href: "/shop" },
      { label: "Air Filter Sizes", href: "/shop/sizes" },
      { label: "1 Inch Air Filters", href: "/shop?depth=1" },
      { label: "2 Inch Air Filters", href: "/shop?depth=2" },
      { label: "4 Inch Air Filters", href: "/shop?depth=4" },
      { label: "MERV 11 Air Filters", href: "/shop?merv=11" },
      { label: "MERV 13 Air Filters", href: "/shop?merv=13" },
      { label: "Bulk & Custom Sizes", href: "/contact" },
    ],
  },
  {
    title: "Our Products",
    links: [
      { label: "Traditional HVAC Air Filters", href: "/hvac-air-filters" },
      { label: "Pathogen Air Filters", href: "/pathogen-air-filters" },
      { label: "Environmental Air Filters", href: "/environmental-air-filters" },
      { label: "Technology", href: "/technology" },
      { label: "Applications", href: "/technology#applications" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Learning Center", href: "/resources" },
      { label: "Choosing the Right Size", href: "/resources/choosing-the-right-filter-size" },
      { label: "Understanding HVAC Filters", href: "/resources/understanding-hvac-air-filters" },
      { label: "FAQs", href: "/faq" },
      { label: "Shipping & Returns", href: "/shipping-returns" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Contact Sales", href: "/contact" },
      { label: "My Account", href: "/account" },
      { label: "Track an Order", href: "/account/orders" },
    ],
  },
];
