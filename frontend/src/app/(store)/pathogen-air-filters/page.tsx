import type { Metadata } from "next";
import { Suspense } from "react";
import { AlertTriangle, ArrowRight, FlaskConical, Microscope, Network, ShieldCheck, Zap } from "lucide-react";
import { aboutCopy, pathogenCopy } from "@/lib/site";
import { PageHero } from "@/components/content/page-hero";
import { CategoryProducts, CategoryProductsSkeleton } from "@/components/content/category-products";
import { SectionHeading } from "@/components/site/section-heading";
import { ButtonLink } from "@/components/ui/button-link";
import { NotifyMe } from "@/components/shop/notify-me";

export const metadata: Metadata = {
  title: "Pathogen Air Filters (Technology Under Development)",
  description: pathogenCopy.intro,
};

// Each step restates part of the original "Nanotechnology at the Forefront" text.
const steps = [
  {
    icon: Network,
    title: "Capture",
    body: "An ultra-high surface area, porous nanowire web is designed to capture pathogens of all sizes.",
  },
  {
    icon: FlaskConical,
    title: "Interact",
    body: "Known antimicrobial bioactive metal particles (BMPs) — such as silver, copper and metal oxides — are embedded in the web and form metal ions through dissolution.",
  },
  {
    icon: ShieldCheck,
    title: "Neutralize",
    body: "The metal ions are designed to damage the captured pathogens' proteins and DNA, preventing them from growing and reproducing.",
  },
];

export default function PathogenPage() {
  return (
    <>
      <PageHero
        crumbs={[{ label: "Home", href: "/" }, { label: "Products" }, { label: "Pathogen Air Filters" }]}
        eyebrow={pathogenCopy.status}
        title="KorganoTech"
        accent="Pathogen Air Filter"
        image="/images/filter-pathogen.jpg"
        imageAlt="KorganoTech pathogen air filter prototype rendering"
        body={
          <>
            <p>{pathogenCopy.intro}.</p>
            <p className="mt-3 text-base">{pathogenCopy.development}</p>
          </>
        }
      >
        <ButtonLink href="#request-info" size="lg">
          Request information <ArrowRight className="size-4" />
        </ButtonLink>
        <ButtonLink href="/franchise" variant="outline" size="lg">Franchise opportunity</ButtonLink>
      </PageHero>

      <div className="container-page -mt-4">
        <p className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-relaxed text-amber-900">
          <AlertTriangle className="mt-0.5 size-5 shrink-0" /> {pathogenCopy.disclaimer}
        </p>
      </div>

      <section aria-labelledby="nano-title" className="container-page py-20">
        <SectionHeading eyebrow="Technology" title={<span id="nano-title">{pathogenCopy.nanoTitle}</span>} body={pathogenCopy.nano} />
        <ol className="mt-12 grid gap-5 md:grid-cols-3">
          {steps.map(({ icon: Icon, title, body }, i) => (
            <li key={title} className="surface-card relative p-7">
              <span className="absolute top-6 right-6 text-5xl font-extrabold text-lavender">0{i + 1}</span>
              <span className="grid size-12 place-items-center rounded-xl bg-gradient-brand text-white">
                <Icon className="size-6" />
              </span>
              <p className="mt-5 text-xl font-bold text-primary">{title}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
            </li>
          ))}
        </ol>
        <p className="mt-6 text-center text-xs text-muted-foreground">
          Product capabilities and performance are subject to testing, validation, and applicable regulatory requirements.
        </p>
      </section>

      <section aria-labelledby="motivation-title" className="bg-gradient-soft">
        <div className="container-page grid gap-10 py-20 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <p className="eyebrow">Motivation</p>
            <h2 id="motivation-title" className="mt-3 text-3xl font-extrabold tracking-tight text-primary sm:text-4xl">
              Why traditional filters aren&apos;t enough
            </h2>
            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="surface-card p-5">
                <Microscope className="size-6 text-brand" />
                <p className="mt-3 text-sm font-semibold">Captured, but not deactivated</p>
              </div>
              <div className="surface-card p-5">
                <Zap className="size-6 text-brand" />
                <p className="mt-3 text-sm font-semibold">Designed to work without electricity</p>
              </div>
            </div>
          </div>
          <div className="space-y-4 text-lg leading-relaxed text-muted-foreground">
            {aboutCopy.motivation.map((p) => (
              <p key={p.slice(0, 20)}>{p}</p>
            ))}
          </div>
        </div>
      </section>

      <section id="request-info" aria-labelledby="pathogen-products" className="container-page scroll-mt-40 py-20">
        <SectionHeading
          title={<span id="pathogen-products">Follow the program</span>}
          body="These filters are not currently available for purchase. Register your interest and we'll keep you updated."
        />
        <div className="mt-10 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          <Suspense fallback={<CategoryProductsSkeleton count={2} />}>
            <CategoryProducts slug="pathogen" />
          </Suspense>
          <NotifyMe productName="KorganoTech Pathogen Air Filter" note="The KorganoTech Pathogen Air Filter is in research and development." />
        </div>
      </section>

      <section className="container-page">
        <p className="rounded-2xl bg-muted p-6 text-sm leading-relaxed text-muted-foreground">{aboutCopy.disclaimer}</p>
      </section>
    </>
  );
}
