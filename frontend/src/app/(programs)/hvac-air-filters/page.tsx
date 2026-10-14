import type { Metadata } from "next";
import { Suspense } from "react";
import { Footer } from "@/components/environmental/footer";
import { Hero } from "@/components/environmental/hero";
import { Navbar } from "@/components/environmental/navbar";
import { Ticker } from "@/components/environmental/ticker";
import { ProgramApplications } from "@/components/program/program-applications";
import { ProgramContact } from "@/components/program/program-contact";
import { ProgramFaq } from "@/components/program/program-faq";
import { ProductsSkeleton, ProgramProducts } from "@/components/program/program-products";
import { ProgramOverview, ProgramSteps, ProgramTech, ProgramWhy } from "@/components/program/program-sections";
import {
  FactsCard,
  HvacSizeCard,
  MervPerformance,
  PleatDiagram,
  ProgramChecklist,
} from "@/components/program/program-visuals";
import { Reveal } from "@/components/environmental/ui/reveal";
import { brand, hvacCopy } from "@/lib/site";
import type { HeroContent } from "@/lib/program-types";

export const metadata: Metadata = {
  title: "Traditional HVAC Air Filters — MERV 11 & MERV 13",
  description: hvacCopy.body,
};

const navLinks = [
  { label: "Overview", href: "#overview" },
  { label: "Performance", href: "#performance" },
  { label: "How it works", href: "#process" },
  { label: "Shop", href: "#shop" },
  { label: "FAQ", href: "#faq" },
];

const U = "/images/unsplash";

const hero: HeroContent = {
  label: "Traditional HVAC Air Filters highlights",
  pill: "Available now · Manufactured in Livermore, CA",
  headline: [
    { text: "High-performance" },
    { text: "air" },
    { text: "filters" },
    { text: "built" },
    { text: "for" },
    { text: "cleaner", accent: true },
    { text: "indoor", accent: true },
    { text: "air.", accent: true },
  ],
  body: "KorganoTech manufactures MERV 11 and MERV 13 pleated HVAC air filters using traditional melt blown filtration media, engineered to improve indoor air quality by reducing airborne pollutants and other harmful particulates.",
  primary: { label: "Shop HVAC filters", href: "#shop" },
  secondary: { label: "See how it works", href: "#process" },
  features: ["MERV 11 & MERV 13", "Pleated construction", "Bulk & custom orders"],
  stats: [
    { value: "11 & 13", label: "MERV ratings made by KorganoTech", tone: "leaf" },
    { value: "1″–4″", label: "filter depths for furnaces and HVAC systems", tone: "sky" },
    { value: "#1", label: "America’s pleated HVAC air filter, at Walmart.com", tone: "sun" },
    { value: "COD", label: "Cash on Delivery on every online order", tone: "white" },
  ],
  slides: [
    {
      image: `${U}/hvac-living.jpg`,
      alt: "A bright, clean living room",
      tag: "Cleaner air",
      caption: "Pleated MERV 11 and MERV 13 filters help reduce airborne pollutants indoors",
    },
    {
      image: `${U}/hvac-factory.jpg`,
      alt: "An engineer working at a manufacturing machine",
      tag: "Made in Livermore",
      caption: "Manufactured in Livermore, California from melt blown filtration media",
    },
    {
      image: `${U}/classroom.jpg`,
      alt: "A classroom full of students",
      tag: "Schools",
      caption: "Built to improve indoor air quality in schools and other high-risk environments",
    },
    {
      image: `${U}/warehouse.jpg`,
      alt: "A large warehouse with racks of boxed goods",
      tag: "Bulk orders",
      caption: "Volume and custom-size orders for farms, senior centers and commercial buildings",
    },
    {
      image: `${U}/hvac-living-plants.jpg`,
      alt: "A sunny living room with plants",
      tag: "Everyday homes",
      caption: "Suitable for furnaces, air conditioners, heating systems and HVAC systems",
    },
  ],
  bubbleLabels: ["PM", "", "dust", "", "pollen", "", "mold", ""],
  scrollHref: "#overview",
};

const faqs = [
  {
    q: "What MERV ratings does KorganoTech make?",
    a: "KorganoTech manufactures MERV 11 and MERV 13 pleated HVAC air filters using traditional melt blown filtration media. MERV 11 is a strong everyday choice for homes with pets or mild allergies, while MERV 13 captures a higher share of smaller particles such as smoke and fine dust.",
  },
  {
    q: "How do I find my filter size?",
    a: "Look at the frame of your current filter for the nominal size, for example 16x25x1 (width x length x depth in inches). Enter it in the size finder on this page. If there is no size printed, measure the slot and round up to the nearest standard size, or contact us about a custom size.",
  },
  {
    q: "How often should I change my filter?",
    a: "For most homes with a 1-inch filter, 60–90 days is a reliable baseline. Change it sooner with pets, allergies or a dusty environment. Deeper 2-inch and 4-inch filters typically last longer.",
  },
  {
    q: "Will a higher MERV rating work in my system?",
    a: "Higher-efficiency filters create a little more resistance to airflow. Check your equipment manufacturer's guidance to confirm your furnace or air conditioner is designed for the MERV level you choose.",
  },
  {
    q: "Can I pay when my filters arrive?",
    a: "Yes. Cash on Delivery is available on every online order — place your order, then pay the courier in cash when it arrives. Online card payments are coming soon.",
  },
  {
    q: "Where can I buy KorganoTech filters?",
    a: "You can order directly on this website, and KorganoTech Traditional Air Filters are also available at Walmart.com. For bulk purchases, please use the contact form below.",
  },
];

export default function HvacPage() {
  return (
    <>
      <Navbar links={navLinks} ctaLabel="Bulk orders" logoTitle="HVAC Air Filters" logoSubtitle="by KorganoTech" />
      <main id="main">
        <Hero content={hero} />
        <Ticker
          items={[
            "MERV 11 filtration",
            "MERV 13 filtration",
            "Melt blown media",
            "Pleated construction",
            "Furnaces & air conditioners",
            "Available at Walmart.com",
            "Bulk & custom sizes",
            "Cash on Delivery",
          ]}
        />

        <ProgramOverview
          c={{
            eyebrow: "What it does",
            title: "A pleated filter that catches particulates before they circulate",
            body: "Every time your furnace or air conditioner runs, it moves air through a filter. KorganoTech’s pleated MERV 11 and MERV 13 filters use melt blown filtration media to capture airborne pollutants and other harmful particulates, contributing to a cleaner and fresher indoor environment.",
            image: `${U}/hvac-living.jpg`,
            imageAlt: "A clean, bright living room",
            badge: { code: "MERV", line1: "Pleated, melt blown media", line2: "Cleaner, fresher indoor air" },
            floating: {
              title: "Through the filter",
              rows: [
                { step: "In", label: "Dust, pollen, dander", dot: "bg-flare" },
                { step: "Held", label: "In the pleated media", dot: "bg-co2" },
                { step: "Out", label: "Cleaner air", dot: "bg-ch4" },
              ],
            },
            benefitsTitle: "Why it matters to you",
            benefits: [
              { icon: "wind", text: "Reduce airborne pollutants and other harmful particulates" },
              { icon: "sparkles", text: "Pleated construction for a cleaner, fresher indoor environment" },
              { icon: "flame", text: "Suitable for furnaces, air conditioners, heating systems or HVAC systems" },
              { icon: "shield", text: "MERV 11 and MERV 13 to match your home, school or building" },
            ],
            callout: {
              strong: "Buying in bulk?",
              text: "Schools, farms, senior centers and commercial buildings can order in volume.",
              cta: "Contact sales",
              href: "#contact",
            },
          }}
        />

        <ProgramWhy
          id="performance"
          eyebrow="Performance"
          title="Higher MERV ratings capture more of the particles you can’t see"
          body="MERV measures how much of each particle size a filter captures. KorganoTech makes MERV 11 and MERV 13 pleated filters so you can match protection to your home or building."
          lead={<MervPerformance />}
          band={{
            image: `${U}/hvac-living-plants.jpg`,
            imageAlt: "A sunny living room with plants",
            stats: [
              {
                value: 90,
                prefix: "≤",
                suffix: " days",
                label: "Typical upper limit between changes for a 1-inch filter in most homes — sooner with pets or allergies",
              },
              {
                value: 13,
                prefix: "MERV ",
                label: "KorganoTech’s highest-efficiency pleated rating, for smaller particles such as smoke and fine dust",
              },
            ],
            eyebrow: "Why filter choice matters",
            title: "The right filter protects your air and your equipment",
            reasons: [
              {
                tone: "flare",
                title: "A clogged filter makes your system work harder",
                body: "Once a filter is full, dirty air keeps circulating and your system has to push harder to move air — which can raise energy use and strain equipment.",
              },
              {
                tone: "co2",
                title: "Finer particles need higher efficiency",
                body: "Basic filters let fine dust and smoke-sized particles pass. Moving up to MERV 11 or MERV 13 captures a larger share of them.",
              },
              {
                tone: "ch4",
                title: "A proper fit prevents bypass",
                body: "Air takes the path of least resistance. A filter that matches your slot’s nominal size seals properly, so air passes through the media instead of around it.",
              },
              {
                tone: "sun",
                title: "High-occupancy spaces need more",
                body: "Schools, senior centers, poultry farms and commercial buildings put more load on air systems. Our mission is to improve indoor air quality in exactly these environments.",
              },
            ],
            footnote:
              "MERV efficiencies are minimum values defined by ASHRAE Standard 52.2. Replacement intervals are general guidance; follow your equipment manufacturer’s recommendations.",
          }}
        />

        <ProgramSteps
          c={{
            eyebrow: "How it works",
            title: "How a pleated filter cleans the air in your home or building",
            body: "From the return duct to your rooms, every cubic foot of air your system moves passes through the filter media.",
            subEyebrow: "The filtering process",
            subTitle: "Four steps, every time your system runs",
            steps: [
              { icon: "wind", tone: "co2", title: "Air is drawn in", body: "When your furnace or air conditioner runs, the blower pulls air from your rooms through the return and into the filter." },
              { icon: "filter", tone: "flare", title: "Particles are captured", body: "Melt blown media — a dense web of very fine fibers — traps dust, pollen, pet dander and other airborne particulates." },
              { icon: "layers", tone: "ch4", title: "Pleats add capacity", body: "The zig-zag pleated construction multiplies the filtering surface, so the filter holds more while air keeps moving." },
              { icon: "sparkles", tone: "deep", title: "Cleaner air returns", body: "Filtered air continues through the system and back into the space, helping create a cleaner, fresher indoor environment." },
            ],
          }}
        />

        <ProgramChecklist
          id="specs"
          eyebrow="Specifications"
          title="Engineered for a precise fit"
          points={[
            "High-performance MERV 11 and MERV 13 filtration",
            "Traditional melt blown filtration media",
            "Pleated construction for a cleaner and fresher indoor environment",
            "Suitable for furnaces, air conditioners, heating systems or HVAC systems",
            "Common 1″, 2″ and 4″ depths, with custom sizes available on request",
            `U.S. registered trademark #${brand.trademark} · EPA Establishment Number ${brand.epaEstablishment}`,
          ]}
          panel={{
            title: "Buying for more than one home?",
            items: [
              "Bulk purchases of KorganoTech Traditional Air Filters are handled by our sales team",
              "MERV 11, MERV 13 and custom sizes can be combined in a single order",
              "A good fit for schools, senior centers, animal and poultry farms and commercial buildings",
            ],
            cta: { label: "Request a bulk quote", href: "#contact" },
          }}
          aside={<HvacSizeCard />}
        />

        <ProgramApplications
          eyebrow="Applications"
          title="Built for the places clean air matters"
          body="Our mission is to enhance indoor air quality in schools, poultry farms, senior centers, and other high-risk environments — and in the homes where we all spend most of our time."
          items={[
            { icon: "home", title: "Homes", body: "Furnaces, air conditioners and residential HVAC systems.", image: `${U}/hvac-living.jpg` },
            { icon: "school", title: "Schools", body: "High-occupancy classrooms with long HVAC run times.", image: `${U}/classroom-teacher.jpg` },
            { icon: "heart", title: "Senior centers", body: "Residents who are more sensitive to airborne particulates.", image: `${U}/care-nurse.jpg` },
            { icon: "warehouse", title: "Commercial buildings & farms", body: "Offices, facilities and animal and poultry farms ordering in volume.", image: `${U}/warehouse.jpg` },
          ]}
        />

        <ProgramTech
          c={{
            eyebrow: "Product details",
            title: "Traditional melt blown media, built into a pleated filter",
            body: "KorganoTech’s MERV 11 and MERV 13 filters are manufactured in Livermore, California from traditional melt blown filtration media, and sold as America’s #1 Pleated HVAC Air Filter at Walmart.com.",
            stats: [
              { value: 2, label: "MERV ratings made: MERV 11 and MERV 13" },
              { value: 3, label: "common filter depths: 1″, 2″ and 4″" },
              { value: 1, prefix: "#", label: "America’s #1 Pleated HVAC Air Filter, available at Walmart.com" },
            ],
            proofsTitle: "What goes into every filter",
            proofs: [
              { title: "Melt blown media", body: "A dense web of very fine fibers captures airborne pollutants and other harmful particulates." },
              { title: "Pleated construction", body: "Folded media multiplies the filtering surface inside the same frame for better capacity." },
              { title: "Two efficiency levels", body: "Choose MERV 11 for everyday protection or MERV 13 for smaller particles." },
              { title: "Sized to fit", body: "Standard nominal sizes with actual dimensions listed, and custom sizes on request." },
              { title: "Made in Livermore", body: "Manufactured by KorganoTech, a U.S. registered trademark, in California." },
            ],
            note: "MERV efficiencies are minimum values defined by ASHRAE Standard 52.2. Air filters and air purifiers cannot fully prevent transmission of a pathogen; follow the directions and best practices recommended by the Centers for Disease Control and other government authorities.",
          }}
        >
          <div className="grid items-start gap-8 lg:grid-cols-12">
            <Reveal className="lg:col-span-7">
              <PleatDiagram />
            </Reveal>
            <Reveal delay={0.15} className="lg:col-span-5">
              <FactsCard
                title="At a glance"
                rows={[
                  { value: "MERV 11", label: "Advanced" },
                  { value: "MERV 13", label: "Superior" },
                  { value: "Pleated", label: "construction" },
                  { value: "Melt blown", label: "filtration media" },
                ]}
                body="Designed to contribute to a cleaner and fresher indoor environment in furnaces, air conditioners, heating systems and HVAC systems."
              />
            </Reveal>
          </div>
        </ProgramTech>

        <Suspense fallback={<ProductsSkeleton />}>
          <ProgramProducts
            slug="hvac"
            eyebrow="Shop"
            title="Shop Traditional HVAC Filters"
            body="Find the right filter for your HVAC system. Pick your size, choose MERV 11 or MERV 13, and pay on delivery."
            cta={{ label: "Shop all sizes", href: "/shop?category=hvac" }}
          />
        </Suspense>

        <ProgramFaq
          eyebrow="Questions"
          title="HVAC filter questions, answered"
          items={faqs}
        />

        <ProgramContact
          c={{
            variant: "sales",
            subject: "Bulk order enquiry",
            eyebrow: "Bulk orders",
            title: "Contact Sales: Bulk Order of KorganoTech Traditional Air Filters",
            body: "For bulk purchases of KorganoTech Traditional Air Filters, please fill out our contact form and our sales team will get back to you.",
            shareTitle: "Please share with us",
            share: [
              "Filter sizes and MERV rating (MERV 11, MERV 13 or a custom size)",
              "Approximate quantity and how often you reorder",
              "Delivery location and timeline",
              "Type of facility: school, farm, senior center or commercial building",
            ],
            formTitle: "Tell us about your order",
            formHint: "Takes about a minute. Fields marked * are required.",
            chipLegend: "Product Type",
            chips: ["MERV 13", "MERV 11", "Custom Size", "Other"],
            messagePlaceholder: "Sizes, quantities, delivery location and timeline",
            submit: "Send",
            thanksTitle: "Thank you",
            thanksBody: "We have your request. Our sales team will follow up about your order.",
          }}
        />
      </main>
      <Footer
        logoTitle="HVAC Air Filters"
        logoSubtitle="by KorganoTech"
        programName="Traditional HVAC Air Filters"
        address={brand.address}
        description="High-performance MERV 11 and MERV 13 pleated HVAC air filters, manufactured by KorganoTech in Livermore, California."
        links={navLinks}
        note="Air filters and air purifiers cannot fully prevent transmission of a pathogen and protect people from COVID-19 and other airborne diseases. Please follow the directions and best practices recommended by the Centers for Disease Control and other Government authorities."
      />
    </>
  );
}
