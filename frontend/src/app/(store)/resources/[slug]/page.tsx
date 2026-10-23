import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock } from "lucide-react";
import { articles, findArticle } from "@/lib/resources";
import { Breadcrumbs, Prose } from "@/components/content/page-hero";
import { ButtonLink } from "@/components/ui/button-link";

export function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata(props: PageProps<"/resources/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const a = findArticle(slug);
  return a ? { title: a.title, description: a.excerpt } : { title: "Article not found" };
}

export default async function ArticlePage(props: PageProps<"/resources/[slug]">) {
  const { slug } = await props.params;
  const article = findArticle(slug);
  if (!article) notFound();
  const others = articles.filter((a) => a.slug !== slug).slice(0, 3);

  return (
    <article>
      <header className="bg-gradient-hero">
        <div className="container-page py-12">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Resources", href: "/resources" }, { label: article.title }]} />
          <p className="eyebrow mt-8">{article.category}</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-extrabold tracking-tight text-primary sm:text-5xl">{article.title}</h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">{article.excerpt}</p>
          <p className="mt-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground"><Clock className="size-4" /> {article.minutes} min read</p>
        </div>
      </header>
      <div className="container-page grid gap-12 py-12 lg:grid-cols-[1fr_320px]">
        <div>
          <div className="relative mb-10 aspect-[16/8] overflow-hidden rounded-[1.75rem] bg-gradient-card">
            <Image src={article.image} alt="" fill sizes="(min-width: 1024px) 60vw, 100vw" className="object-cover" />
          </div>
          <Prose>
            {article.sections.map((s, i) => (
              <section key={i}>
                {s.heading ? <h2>{s.heading}</h2> : null}
                {s.paragraphs?.map((p) => <p key={p.slice(0, 30)} className="mt-4">{p}</p>)}
                {s.list ? (
                  <ul className="mt-4 space-y-2">
                    {s.list.map((li) => <li key={li}>{li}</li>)}
                  </ul>
                ) : null}
              </section>
            ))}
          </Prose>
        </div>
        <aside className="space-y-6 lg:sticky lg:top-36 lg:self-start">
          <div className="rounded-2xl bg-gradient-brand p-6 text-white">
            <p className="text-lg font-bold">Find your filter</p>
            <p className="mt-1 text-sm text-white/80">MERV 11 and MERV 13 pleated filters, with secure card checkout.</p>
            <ButtonLink href="/shop" variant="light" size="sm" className="mt-4">Shop filters</ButtonLink>
          </div>
          <div className="surface-card p-6">
            <p className="font-bold text-primary">More guides</p>
            <ul className="mt-3 space-y-3">
              {others.map((o) => (
                <li key={o.slug}>
                  <Link href={`/resources/${o.slug}`} className="text-sm font-semibold hover:text-brand">{o.title}</Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </article>
  );
}
