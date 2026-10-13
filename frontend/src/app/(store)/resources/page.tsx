import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { articles } from "@/lib/resources";
import { PageHero } from "@/components/content/page-hero";

export const metadata: Metadata = {
  title: "Learn More About Air Filtration",
  description: "Guides and background reading on filtration, sizing, and the technology behind it.",
};

export default function ResourcesPage() {
  return (
    <>
      <PageHero
        crumbs={[{ label: "Home", href: "/" }, { label: "Resources" }]}
        eyebrow="Resources"
        title="Learn More About"
        accent="Air Filtration"
        body="Guides and background reading on filtration, sizing, and the technology behind it."
      />
      <section className="container-page py-16">
        <ul className="grid gap-6 md:grid-cols-2">
          {articles.map((a) => (
            <li key={a.slug}>
              <Link href={`/resources/${a.slug}`} className="group surface-card flex h-full flex-col overflow-hidden hover:-translate-y-1 hover:shadow-lift sm:flex-row">
                <div className="relative aspect-[16/10] shrink-0 bg-gradient-card sm:aspect-auto sm:w-56">
                  <Image src={a.image} alt="" fill sizes="(min-width: 640px) 224px, 100vw" className="object-cover transition duration-700 group-hover:scale-105" />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <p className="eyebrow">{a.category}</p>
                  <h2 className="mt-2 text-xl font-bold text-primary">{a.title}</h2>
                  <p className="mt-2 flex-1 text-sm text-muted-foreground">{a.excerpt}</p>
                  <p className="mt-4 flex items-center justify-between text-sm">
                    <span className="inline-flex items-center gap-1.5 text-muted-foreground"><Clock className="size-4" /> {a.minutes} min read</span>
                    <span className="inline-flex items-center gap-1 font-semibold text-brand">Read More <ArrowRight className="size-4 transition group-hover:translate-x-0.5" /></span>
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
