import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Factory,
  Gauge,
  HeartPulse,
  Home as HomeIcon,
  Landmark,
  Leaf,
  Microscope,
  Recycle,
  Wind,
} from "lucide-react";
import { PageHero } from "@/components/content/page-hero";
import { SectionHeading } from "@/components/site/section-heading";
import { ButtonLink } from "@/components/ui/button-link";

export const metadata: Metadata = {
  title: "Technology & Applications",
  description:
    "Four areas of engineering work shape every KorganoTech filtration program: filtration engineering, HVAC integration, pathogen research and environmental innovation.",
};

const areas = [
  { icon: Wind, title: "Filtration Engineering", body: "Media, pleat geometry, and airflow behavior studied together." },
  { icon: Gauge, title: "HVAC Integration", body: "Designs intended to work within standard air handling systems." },
  { icon: Microscope, title: "Pathogen Research", body: "Development work focused on airborne pathogen capture." },
  { icon: Leaf, title: "Environmental Innovation", body: "Early-stage filtration approaches for environmental use cases." },
];

const applications = [
  { icon: HomeIcon, title: "Residential HVAC" },
  { icon: Building2, title: "Commercial Buildings" },
  { icon: Landmark, title: "Offices" },
  { icon: HeartPulse, title: "Healthcare Environments" },
  { icon: Factory, title: "Industrial Facilities" },
  { icon: Recycle, title: "Environmental Applications" },
];

const comparison = {
  head: ["Traditional HVAC Filters", "Pathogen Air Filters", "Environmental Air Filters"],
  rows: [
    ["Primary Application", "Everyday HVAC systems", "Airborne pathogen capture", "Environmental & landfill use cases"],
    ["Availability", "Available to purchase", "Not available for purchase", "Not available for purchase"],
    ["Development Status", "In production", "Technology under development", "Under development"],
    ["Intended Use", "Residential and commercial air handling", "HVAC-integrated filtration", "Emerging environmental applications"],
  ],
  links: ["/hvac-air-filters", "/pathogen-air-filters", "/environmental-air-filters"],
};

export default function TechnologyPage() {
  return (
    <>
      <PageHero
        fullScreen
        crumbs={[{ label: "Home", href: "/" }, { label: "Technology" }]}
        eyebrow="Technology"
        title="Technology Built Around"
        accent="Better Air"
        body="Four areas of engineering work shape every KorganoTech filtration program — from everyday residential systems to filtration approaches still in development."
        image="/images/hero-filter.jpg"
      />

      <section className="container-page py-16">
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {areas.map(({ icon: Icon, title, body }) => (
            <li key={title} className="surface-card p-7 hover:-translate-y-1 hover:shadow-lift">
              <span className="grid size-12 place-items-center rounded-xl bg-accent text-primary">
                <Icon className="size-6" />
              </span>
              <p className="mt-5 text-lg font-bold text-primary">{title}</p>
              <p className="mt-2 text-sm text-muted-foreground">{body}</p>
            </li>
          ))}
        </ul>
      </section>

      <section id="applications" aria-labelledby="apps-title" className="scroll-mt-40 bg-gradient-soft">
        <div className="container-page py-20">
          <SectionHeading
            eyebrow="Applications"
            title={<span id="apps-title">Designed for a Range of Applications</span>}
            body="Filtration needs differ by environment. Our programs consider each setting's airflow and system requirements."
          />
          <ul className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-3">
            {applications.map(({ icon: Icon, title }) => (
              <li key={title} className="surface-card flex items-center gap-4 p-6">
                <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-gradient-brand text-white">
                  <Icon className="size-6" />
                </span>
                <span className="font-bold text-primary">{title}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="compare-title" className="container-page py-20">
        <SectionHeading eyebrow="Compare" title={<span id="compare-title">Product Comparison</span>} body="A factual side-by-side of the three filtration programs." />
        <div className="mt-10 overflow-x-auto rounded-2xl border border-lavender bg-white shadow-card">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="bg-muted/60">
                <th className="p-4 text-left" />
                {comparison.head.map((h) => (
                  <th key={h} className="p-4 text-left font-bold text-primary">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {comparison.rows.map(([label, ...cells]) => (
                <tr key={label} className="border-t border-lavender">
                  <th scope="row" className="p-4 text-left font-semibold">{label}</th>
                  {cells.map((c, i) => (
                    <td key={i} className="p-4 text-muted-foreground">{c}</td>
                  ))}
                </tr>
              ))}
              <tr className="border-t border-lavender">
                <th scope="row" className="p-4 text-left font-semibold">Learn More</th>
                {comparison.links.map((href) => (
                  <td key={href} className="p-4">
                    <Link href={href} className="inline-flex items-center gap-1 font-semibold text-brand hover:underline">
                      View details <ArrowRight className="size-4" />
                    </Link>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
        <div className="mt-10 text-center">
          <ButtonLink href="/shop" size="lg">Shop HVAC filters <ArrowRight className="size-4" /></ButtonLink>
        </div>
      </section>
    </>
  );
}
