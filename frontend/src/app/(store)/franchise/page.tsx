import type { Metadata } from "next";
import { BadgeDollarSign, Check, Eye, HandHeart, Rocket, Target, Users } from "lucide-react";
import { franchiseCopy } from "@/lib/site";
import { PageHero } from "@/components/content/page-hero";
import { SectionHeading } from "@/components/site/section-heading";
import { ButtonLink } from "@/components/ui/button-link";
import { InquiryForm } from "@/components/content/inquiry-form";

export const metadata: Metadata = {
  title: "Franchise Opportunity",
  description: franchiseCopy.vision,
};

const whyIcons = [BadgeDollarSign, HandHeart, Users];

export default function FranchisePage() {
  return (
    <>
      <PageHero
        crumbs={[{ label: "Home", href: "/" }, { label: "Franchise Opportunity" }]}
        eyebrow={franchiseCopy.subtitle.replace(/[()]/g, "")}
        title="Franchise"
        accent="Opportunity"
        body={franchiseCopy.vision}
        image="/images/unsplash/franchise-handshake.jpg"
        imageAlt="Two people shaking hands to seal a business partnership"
      >
        <ButtonLink href="#apply" size="lg">Fill out the Franchise Form</ButtonLink>
      </PageHero>

      <section className="container-page grid gap-6 py-16 md:grid-cols-2">
        <div className="surface-card p-7">
          <Eye className="size-7 text-brand" />
          <h2 className="mt-4 text-xl font-bold text-primary">Our Vision</h2>
          <p className="mt-2 text-muted-foreground">{franchiseCopy.vision}</p>
        </div>
        <div className="surface-card p-7">
          <Target className="size-7 text-brand" />
          <h2 className="mt-4 text-xl font-bold text-primary">Our Mission</h2>
          <p className="mt-2 text-muted-foreground">{franchiseCopy.mission}</p>
        </div>
      </section>

      <section className="bg-gradient-soft">
        <div className="container-page py-20">
          <SectionHeading title="Your Business Opportunity" body={franchiseCopy.opportunity} />
          <ul className="mx-auto mt-8 flex max-w-3xl flex-wrap justify-center gap-3">
            {franchiseCopy.customers.map((c) => (
              <li key={c} className="rounded-full border border-lavender bg-white px-5 py-2.5 font-semibold text-primary shadow-card">{c}</li>
            ))}
          </ul>
          <h3 className="mt-16 text-center text-2xl font-extrabold tracking-tight text-primary">Why Partner With Us?</h3>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {franchiseCopy.why.map((w, i) => {
              const Icon = whyIcons[i];
              return (
                <div key={w.title} className="surface-card p-7">
                  <span className="grid size-12 place-items-center rounded-xl bg-gradient-brand text-white">
                    <Icon className="size-6" />
                  </span>
                  <p className="mt-5 text-lg font-bold text-primary">{w.title}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{w.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="container-page grid gap-10 py-20 lg:grid-cols-[1fr_1.4fr]">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-primary">What You&apos;ll Receive</h2>
          <ul className="mt-6 space-y-3">
            {franchiseCopy.receive.map((r) => (
              <li key={r} className="flex gap-3">
                <Check className="mt-0.5 size-5 shrink-0 text-emerald-600" /> <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-primary">How It Works</h2>
          <ol className="mt-6 space-y-4">
            {franchiseCopy.steps.map((s, i) => (
              <li key={s.title} className="flex gap-4">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-gradient-brand font-bold text-white">{i + 1}</span>
                <div className="pt-1.5">
                  <p className="font-bold text-primary">{s.title}</p>
                  <p className="text-sm text-muted-foreground">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="apply" className="container-page scroll-mt-40">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr]">
          <div className="rounded-[1.75rem] bg-night p-8 text-white sm:p-10">
            <Rocket className="size-9 text-[oklch(80%_0.1_298)]" />
            <h2 className="mt-5 text-3xl font-extrabold tracking-tight">{franchiseCopy.closing}</h2>
            <p className="mt-3 text-white/75">{franchiseCopy.closingSub}</p>
            <p className="mt-8 text-sm text-white/60">Want to Own a Manufacturing Franchise? Submit the form and we&apos;ll be in touch.</p>
          </div>
          <InquiryForm variant="franchise" />
        </div>
      </section>
    </>
  );
}
