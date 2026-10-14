import type { Metadata } from "next";
import { ArrowRight, Building2, HeartHandshake, Lightbulb, Target } from "lucide-react";
import { aboutCopy, brand } from "@/lib/site";
import { PageHero } from "@/components/content/page-hero";
import { ButtonLink } from "@/components/ui/button-link";
import { SocialIcons } from "@/components/site/social-icons";

export const metadata: Metadata = {
  title: "About Us",
  description: aboutCopy.mission,
};

export default function AboutPage() {
  return (
    <>
      <PageHero
        fullScreen
        crumbs={[{ label: "Home", href: "/" }, { label: "About Us" }]}
        eyebrow="About Us"
        title="Advancing air filtration for"
        accent="cleaner environments"
        body={aboutCopy.mission}
        image="/images/hero-filter.jpg"
        imageAlt="Air flowing through a KorganoTech filter"
      />

      <section className="container-page grid gap-6 py-16 lg:grid-cols-3">
        {[
          { icon: Target, title: "Mission", body: [aboutCopy.mission] },
          { icon: Building2, title: "About KorganoTech", body: aboutCopy.about },
          { icon: HeartHandshake, title: "Our Commitment", body: aboutCopy.commitment },
        ].map(({ icon: Icon, title, body }) => (
          <article key={title} className="surface-card p-7">
            <span className="grid size-12 place-items-center rounded-xl bg-gradient-brand text-white">
              <Icon className="size-6" />
            </span>
            <h2 className="mt-5 text-xl font-bold text-primary">{title}</h2>
            <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted-foreground">
              {body.map((p) => (
                <p key={p.slice(0, 24)}>{p}</p>
              ))}
            </div>
          </article>
        ))}
      </section>

      <section aria-labelledby="motivation" className="bg-gradient-soft">
        <div className="container-page grid gap-10 py-20 lg:grid-cols-[1fr_1.5fr]">
          <div>
            <span className="grid size-12 place-items-center rounded-xl bg-white text-brand shadow-card">
              <Lightbulb className="size-6" />
            </span>
            <h2 id="motivation" className="mt-5 text-3xl font-extrabold tracking-tight text-primary sm:text-4xl">Motivation</h2>
          </div>
          <div className="space-y-5 text-lg leading-relaxed text-muted-foreground">
            {aboutCopy.motivation.map((p) => (
              <p key={p.slice(0, 24)}>{p}</p>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page grid gap-6 py-16 lg:grid-cols-[1.3fr_1fr]">
        <div className="surface-card p-7">
          <h2 className="text-xl font-bold text-primary">Company details</h2>
          <dl className="mt-5 divide-y divide-lavender text-sm">
            {[
              ["Company", "KorganoTech — Air Filtration Technology"],
              ["Address", brand.address],
              ["EPA Establishment Number", brand.epaEstablishment],
              ["U.S. registered trademark", `#${brand.trademark}`],
              ["Retail availability", "KorganoTech Traditional Air Filters on Walmart.com"],
            ].map(([k, v]) => (
              <div key={k} className="flex flex-col gap-1 py-3 sm:flex-row sm:justify-between">
                <dt className="font-semibold">{k}</dt>
                <dd className="text-muted-foreground sm:text-right">{v}</dd>
              </div>
            ))}
          </dl>
          <SocialIcons className="mt-6" itemClassName="border-lavender text-primary hover:bg-accent" />
        </div>
        <div className="flex flex-col justify-between rounded-[1.75rem] bg-gradient-brand p-8 text-white">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight">Grow clean air in your community</h2>
            <p className="mt-3 text-white/80">Manufacturing franchises are available for qualified entrepreneurs.</p>
          </div>
          <ButtonLink href="/franchise" variant="light" className="mt-6 self-start">
            Franchise opportunity <ArrowRight className="size-4" />
          </ButtonLink>
        </div>
      </section>

      <section className="container-page">
        <p className="rounded-2xl bg-muted p-6 text-sm leading-relaxed text-muted-foreground">{aboutCopy.disclaimer}</p>
      </section>
    </>
  );
}
