import type { Metadata } from "next";
import { Suspense } from "react";
import { Check, Circle, Loader } from "lucide-react";
import { Footer } from "@/components/environmental/footer";
import { Hero } from "@/components/environmental/hero";
import { Navbar } from "@/components/environmental/navbar";
import { Ticker } from "@/components/environmental/ticker";
import { Reveal } from "@/components/environmental/ui/reveal";
import { ProgramApplications } from "@/components/program/program-applications";
import { ProgramContact } from "@/components/program/program-contact";
import { ProgramFaq } from "@/components/program/program-faq";
import { ProductsSkeleton, ProgramProducts } from "@/components/program/program-products";
import { ProgramOverview, ProgramSteps, ProgramTech, ProgramWhy } from "@/components/program/program-sections";
import { FactsCard, NanoExplorer, PathogenCompare, ProgramChecklist } from "@/components/program/program-visuals";
import { brand, pathogenCopy } from "@/lib/site";
import type { HeroContent } from "@/lib/program-types";

export const metadata: Metadata = {
  title: "Pathogen Air Filters (Technology Under Development)",
  description: pathogenCopy.intro,
};

const navLinks = [
  { label: "Overview", href: "#overview" },
  { label: "The gap", href: "#why" },
  { label: "How it works", href: "#process" },
  { label: "Validation", href: "#technology" },
  { label: "FAQ", href: "#faq" },
];

const U = "/images/unsplash";

const hero: HeroContent = {
  label: "Pathogen Air Filters highlights",
  pill: "Technology under development · Not yet available",
  headline: [
    { text: "Nanotechnology" },
    { text: "built" },
    { text: "to" },
    { text: "capture" },
    { text: "and" },
    { text: "neutralize", accent: true },
    { text: "airborne", accent: true },
    { text: "pathogens.", accent: true },
  ],
  body: "KorganoTech is developing a nanotechnology-based air filter designed to capture and neutralize airborne pathogens — with the goal of cleaner and safer indoor environments. It is in the research and development phase and is not yet commercially available.",
  primary: { label: "Request information", href: "#contact" },
  secondary: { label: "See how it works", href: "#process" },
  features: ["Bioactive metal particles", "Porous nanowire web", "Designed to work without electricity"],
  stats: [
    { value: "Ag · Cu", label: "silver, copper and metal oxide particles", tone: "leaf" },
    { value: "R&D", label: "research and development phase — not yet available", tone: "sun" },
    { value: "3rd-party", label: "certification testing to validate efficacy", tone: "sky" },
    { value: "EPA", label: "not yet registered as a pesticide or pesticide device", tone: "white" },
  ],
  slides: [
    {
      image: `${U}/lab-microscope.jpg`,
      alt: "A researcher working at a microscope",
      tag: "Research",
      caption: "Currently in the research and development phase",
    },
    {
      image: `${U}/lab-team.jpg`,
      alt: "Scientists working together in a laboratory",
      tag: "Validation",
      caption: "Efficacy is being validated through third-party certification testing",
    },
    {
      image: `${U}/lab-pipette.jpg`,
      alt: "A pipette dispensing into a tray of sample tubes",
      tag: "Nanotechnology",
      caption: "Antimicrobial metal particles embedded in a porous nanowire web",
    },
    {
      image: `${U}/lab-cells.jpg`,
      alt: "Microscope image of fluorescent cells",
      tag: "The mechanism",
      caption: "Designed to damage pathogens’ proteins and DNA, preventing growth",
    },
    {
      image: `${U}/classroom-teacher.jpg`,
      alt: "A teacher and students in a classroom",
      tag: "Where it matters",
      caption: "Aimed at schools, senior centers, poultry farms and other high-risk environments",
    },
  ],
  bubbleLabels: ["Ag", "", "Cu", "", "Ag", "", "Cu", ""],
  scrollHref: "#overview",
};

const faqs = [
  {
    q: "Is the Pathogen Air Filter available to buy?",
    a: "No. The KorganoTech Pathogen Air Filter is in the research and development phase and is not commercially available. You can register your interest below and we’ll keep you updated.",
  },
  {
    q: "Is it registered with the EPA?",
    a: "Not yet. It is not registered as a pesticide or pesticide device. Its efficacy is being validated through rigorous third-party certification testing to ensure compliance with EPA regulations and industry standards for air quality and safety.",
  },
  {
    q: "How is it designed to work?",
    a: "The filter uses known antimicrobial bioactive metal particles — such as silver, copper and metal oxides — embedded in an ultra-high surface area, porous nanowire web to capture pathogens of all sizes. When the particles interact with captured pathogens they form metal ions, which are designed to damage the pathogens’ proteins and DNA, preventing them from growing and reproducing.",
  },
  {
    q: "Does it need electricity?",
    a: "The system is designed to neutralize and deactivate captured pathogens without electricity.",
  },
  {
    q: "Where would it be used?",
    a: "Our mission is to enhance indoor air quality in schools, poultry farms, senior centers, and other high-risk environments, as well as homes, buildings and vehicles.",
  },
  {
    q: "Can an air filter fully prevent infection?",
    a: "No. Air filters and air purifiers cannot fully prevent transmission of a pathogen and protect people from COVID-19 and other airborne diseases. Please follow the directions and best practices recommended by the Centers for Disease Control and other government authorities.",
  },
];

const timeline: { label: string; note: string; state: "done" | "now" | "next" }[] = [
  { label: "Concept & design", note: "Nanowire web with bioactive metal particles", state: "done" },
  { label: "Research & development", note: "Where the program is today", state: "now" },
  { label: "Third-party certification testing", note: "To validate efficacy and safety", state: "next" },
  { label: "Regulatory approvals", note: "Including registration where required", state: "next" },
  { label: "Commercial availability", note: "Not yet available for purchase", state: "next" },
];

function StatusTimeline() {
  return (
    <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.05] p-7 backdrop-blur-md sm:p-8">
      <p className="eyebrow text-white/50">Program status</p>
      <ol className="mt-6 space-y-5">
        {timeline.map((t) => (
          <li key={t.label} className="flex gap-4">
            <span
              className={`mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full ${
                t.state === "done" ? "bg-leaf text-deep" : t.state === "now" ? "bg-sun text-deep" : "border border-white/25 text-white/40"
              }`}
            >
              {t.state === "done" ? <Check className="h-4 w-4" strokeWidth={3} /> : t.state === "now" ? <Loader className="h-4 w-4" /> : <Circle className="h-3 w-3" />}
            </span>
            <span>
              <span className={`block font-display text-lg font-semibold ${t.state === "next" ? "text-white/60" : "text-white"}`}>
                {t.label}
                {t.state === "now" ? <span className="ml-2 rounded-full bg-sun/20 px-2 py-0.5 font-mono text-[0.62rem] tracking-wider text-sun uppercase">In progress</span> : null}
              </span>
              <span className="text-sm text-white/55">{t.note}</span>
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

export default function PathogenPage() {
  return (
    <>
      <Navbar links={navLinks} ctaLabel="Request info" logoTitle="Pathogen Air Filters" logoSubtitle="by KorganoTech" />
      <main id="main">
        <Hero content={hero} />
        <Ticker
          items={[
            "Nanotechnology-based filter",
            "Silver, copper & metal oxides",
            "Porous nanowire web",
            "Designed to work without electricity",
            "Third-party testing",
            "Under development",
            "Informational purposes only",
          ]}
        />

        <ProgramOverview
          c={{
            eyebrow: "What it is",
            title: "A filter designed to stop pathogens from growing, not just trap them",
            body: "KorganoTech’s Pathogen Air Filter uses known antimicrobial bioactive metal particles (BMPs) — silver, copper and metal oxides — embedded in an ultra-high surface area, porous nanowire web designed to capture pathogens of all sizes.",
            image: `${U}/lab-microscope.jpg`,
            imageAlt: "A researcher working at a microscope",
            badge: { code: "BMP", line1: "Bioactive metal particles", line2: "In a porous nanowire web" },
            floating: {
              title: "Design concept",
              rows: [
                { step: "Web", label: "Captures pathogens", dot: "bg-co2" },
                { step: "Ions", label: "Metal ions form", dot: "bg-flare" },
                { step: "Goal", label: "Growth prevented", dot: "bg-ch4" },
              ],
            },
            benefitsTitle: "What the design aims for",
            benefits: [
              { icon: "network", text: "Capture pathogens of all sizes in an ultra-high surface area nanowire web" },
              { icon: "flask", text: "Use known antimicrobial bioactive metal particles: silver, copper and metal oxides" },
              { icon: "zap", text: "Neutralize captured pathogens without electricity" },
              { icon: "shield", text: "Support cleaner, safer air in schools, farms, senior centers and other high-risk places" },
            ],
            callout: {
              strong: "Investor or partner?",
              text: "Register your interest and we’ll share updates as validation progresses.",
              cta: "Request information",
              href: "#contact",
            },
          }}
        />

        <ProgramWhy
          id="why"
          eyebrow="The gap"
          title="Traditional filters capture particles — they don’t deactivate pathogens"
          body="Published research shows that traditional filters are largely ineffective against airborne pathogens such as viruses, bacteria and other microorganisms. They may capture particles, but they can’t deactivate or destroy pathogens unless paired with technologies like UV purification or heat sterilization."
          lead={<PathogenCompare />}
          band={{
            image: `${U}/lab-team.jpg`,
            imageAlt: "Scientists working together in a laboratory",
            stats: [
              {
                text: "Capture ≠ deactivate",
                label: "Traditional filters hold particles; on their own they do not have the ability to deactivate or destroy pathogens",
              },
              {
                text: "Re-release",
                label: "Over time, trapped pathogens can accumulate and potentially be re-released into the air, contaminating homes, buildings and vehicles",
              },
            ],
            eyebrow: "Why it matters",
            title: "A critical gap in air safety inspired this program",
            reasons: [
              {
                tone: "flare",
                title: "Clean air matters more than ever",
                body: "Airborne diseases and viral outbreaks have had devastating effects on both public health and the global economy.",
              },
              {
                tone: "co2",
                title: "Advanced air purification is a necessity",
                body: "We believe that investing in advanced air purification is no longer a luxury — it’s a necessity.",
              },
              {
                tone: "ch4",
                title: "High-risk environments come first",
                body: "Our mission is to enhance indoor air quality in schools, poultry farms, senior centers, and other high-risk environments.",
              },
              {
                tone: "sun",
                title: "Protect lives, reduce costs, improve public health",
                body: "That is the mission behind the KorganoTech Pathogen Air Filter.",
              },
            ],
            footnote:
              "Disclaimer: information presented is intended for investor and informational purposes only and should not be construed as an endorsement, claim or guarantee of performance until validated through regulatory approvals.",
          }}
        />

        <ProgramSteps
          c={{
            eyebrow: "How it is designed to work",
            title: "From capture to neutralization, in a single filter",
            body: "These steps describe the design concept for a technology that is still under development.",
            subEyebrow: "The design concept",
            subTitle: "Four steps, designed to work without electricity",
            steps: [
              { icon: "wind", tone: "co2", title: "Air passes through", body: "Air flows through an ultra-high surface area, porous nanowire web." },
              { icon: "microscope", tone: "flare", title: "Pathogens are captured", body: "The web is designed to capture pathogens of all sizes." },
              { icon: "flask", tone: "ch4", title: "Metal ions form", body: "Antimicrobial bioactive metal particles interact with captured pathogens and dissolve into metal ions." },
              { icon: "shield", tone: "deep", title: "Growth is prevented", body: "The ions are designed to damage the pathogens’ proteins and DNA, preventing them from growing and reproducing." },
            ],
          }}
        />

        <ProgramChecklist
          id="concept"
          eyebrow="Design concept"
          title="See the concept in three stages"
          points={[
            "Capture — pathogens of all sizes are held in a porous nanowire web",
            "Interact — bioactive metal particles form metal ions where they meet captured pathogens",
            "Neutralize — the ions are designed to damage proteins and DNA, preventing growth and reproduction",
            "Designed to neutralize and deactivate captured pathogens without electricity",
          ]}
          panel={{
            title: "Where it stands today",
            items: [
              "Currently in the research and development phase",
              "Efficacy is being validated through rigorous third-party certification testing",
              "Not yet registered as a pesticide or pesticide device",
            ],
            cta: { label: "Ask about the program", href: "#contact" },
          }}
          aside={<NanoExplorer />}
        />

        <ProgramApplications
          eyebrow="Target environments"
          title="Aimed at high-risk environments"
          body="Our mission is to enhance indoor air quality in schools, poultry farms, senior centers, and other high-risk environments — places where many people share the same air."
          items={[
            { icon: "school", title: "Schools", body: "Classrooms where many people share the same indoor air.", image: `${U}/classroom-teacher.jpg` },
            { icon: "heart", title: "Senior centers", body: "Residents who are more sensitive to airborne pathogens.", image: `${U}/care-nurse.jpg` },
            { icon: "tractor", title: "Poultry & animal farms", body: "High-density environments where air quality affects health." },
            { icon: "building", title: "Homes, buildings & vehicles", body: "Anywhere trapped pathogens could otherwise be re-released.", image: `${U}/office-hall.jpg` },
          ]}
        />

        <ProgramTech
          c={{
            eyebrow: "Validation & regulation",
            title: "A technology still being proven",
            body: "The KorganoTech Pathogen Air Filter is in the research and development phase. Its efficacy is being validated through rigorous third-party certification testing to ensure compliance with EPA regulations and industry standards for air quality and safety.",
            stats: [
              { text: "R&D", label: "Currently in the research and development phase" },
              { text: "3rd-party", label: "Certification testing to validate efficacy" },
              { text: "EPA", label: "Not yet registered as a pesticide or pesticide device" },
            ],
            proofsTitle: "What makes the approach different",
            proofs: [
              { title: "Antimicrobial metals", body: "Known antimicrobial bioactive metal particles such as silver, copper and metal oxides." },
              { title: "High surface area", body: "An ultra-high surface area, porous nanowire web designed to capture pathogens of all sizes." },
              { title: "Ion-based action", body: "Metal ions created by dissolution of the particles are designed to damage proteins and DNA." },
              { title: "No electricity", body: "Designed to neutralize captured pathogens without electricity." },
              { title: "Independent testing", body: "Third-party certification testing is being used to validate efficacy." },
            ],
            note: pathogenCopy.disclaimer,
          }}
        >
          <div className="grid items-start gap-8 lg:grid-cols-12">
            <Reveal className="lg:col-span-5">
              <FactsCard
                title="The technology"
                rows={[
                  { value: "Silver", label: "antimicrobial metal" },
                  { value: "Copper", label: "antimicrobial metal" },
                  { value: "Metal oxides", label: "bioactive particles" },
                  { value: "Nanowire", label: "porous capture web" },
                ]}
                body="Metal ions, created via dissolution of the particles, are designed to damage pathogens’ proteins and DNA, preventing them from growing and reproducing."
              />
            </Reveal>
            <Reveal delay={0.15} className="lg:col-span-7">
              <StatusTimeline />
            </Reveal>
          </div>
        </ProgramTech>

        <Suspense fallback={<ProductsSkeleton />}>
          <ProgramProducts
            slug="pathogen"
            id="program"
            eyebrow="The program"
            title="Follow the Pathogen Air Filter program"
            body="This filter is not currently available for purchase. Register your interest below and we’ll keep you updated as the program progresses."
          />
        </Suspense>

        <ProgramFaq eyebrow="Questions" title="Pathogen filter questions, answered" items={faqs} />

        <ProgramContact
          c={{
            variant: "interest",
            subject: "Pathogen Air Filter enquiry",
            eyebrow: "Stay informed",
            title: "Request information about the Pathogen Air Filter",
            body: "Information on this program is for investor and informational purposes only. Tell us how you’d like to stay involved and we’ll be in touch.",
            shareTitle: "Helpful to include",
            share: [
              "Your organization and role",
              "The environment you’re interested in: school, senior center, farm, building…",
              "Whether you are an investor, partner or prospective customer",
            ],
            formTitle: "Tell us about your interest",
            formHint: "Takes about a minute. Fields marked * are required.",
            chipLegend: "What are you interested in?",
            chips: ["Product updates", "Investor information", "Pilot or partnership", "Other"],
            messagePlaceholder: "Tell us about your organization and what you would like to know",
            submit: "Send request",
            thanksTitle: "Thank you",
            thanksBody: "We have your request and will share updates as the program progresses.",
          }}
        />
      </main>
      <Footer
        logoTitle="Pathogen Air Filters"
        logoSubtitle="by KorganoTech"
        programName="Pathogen Air Filters"
        address={brand.address}
        description="A nanotechnology-based air filter under development to capture and neutralize airborne pathogens. Not yet commercially available."
        links={navLinks}
        note={pathogenCopy.disclaimer}
      />
    </>
  );
}
