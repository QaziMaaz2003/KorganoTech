import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
      {items.map((it, i) => (
        <span key={it.label}>
          {i > 0 ? " / " : null}
          {it.href ? (
            <Link href={it.href} className="hover:text-primary">
              {it.label}
            </Link>
          ) : (
            <span className="text-foreground">{it.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

/** Redesign-style page hero: soft lavender gradient, large headline, optional image. */
export function PageHero({
  eyebrow,
  title,
  accent,
  body,
  image,
  imageAlt = "",
  crumbs,
  children,
  fullScreen = false,
  className,
}: {
  eyebrow?: string;
  title: string;
  accent?: string;
  body?: React.ReactNode;
  image?: string;
  imageAlt?: string;
  crumbs?: { label: string; href?: string }[];
  children?: React.ReactNode;
  /** Fill the viewport below the sticky site header. */
  fullScreen?: boolean;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "bg-gradient-hero",
        fullScreen && "flex min-h-[calc(100svh-10rem)] flex-col md:min-h-[calc(100svh-7rem)] lg:min-h-[calc(100svh-10rem)]",
        className,
      )}
    >
      <div className={cn("container-page w-full py-12 sm:py-16", fullScreen && "my-auto")}>
        {crumbs ? <Breadcrumbs items={crumbs} /> : null}
        <div className={cn("mt-6 grid items-center gap-10", image && "lg:grid-cols-[1.1fr_1fr]")}>
          <div>
            {eyebrow ? (
              <p className="inline-flex items-center gap-2 rounded-full border border-lavender bg-white px-3.5 py-1.5 text-xs font-semibold text-brand">
                <span className="size-1.5 rounded-full bg-brand" /> {eyebrow}
              </p>
            ) : null}
            <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-[3.4rem] lg:leading-[1.05]">
              {title} {accent ? <span className="text-brand">{accent}</span> : null}
            </h1>
            {body ? <div className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">{body}</div> : null}
            {children ? <div className="mt-8 flex flex-wrap gap-3">{children}</div> : null}
          </div>
          {image ? (
            <div className="relative aspect-[5/4] overflow-hidden rounded-[1.75rem] border border-white bg-gradient-card shadow-lift">
              <Image src={image} alt={imageAlt} fill sizes="(min-width: 1024px) 45vw, 100vw" loading="eager" className="object-cover" />
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export function Prose({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "max-w-3xl space-y-4 text-base leading-relaxed text-muted-foreground [&_a]:font-semibold [&_a]:text-brand [&_a]:underline-offset-4 hover:[&_a]:underline [&_h2]:mt-10 [&_h2]:text-2xl [&_h2]:font-extrabold [&_h2]:tracking-tight [&_h2]:text-primary [&_h3]:mt-6 [&_h3]:text-lg [&_h3]:font-bold [&_h3]:text-foreground [&_li]:ml-5 [&_li]:list-disc [&_strong]:text-foreground",
        className,
      )}
    >
      {children}
    </div>
  );
}
