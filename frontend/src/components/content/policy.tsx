import { Breadcrumbs, Prose } from "./page-hero";

export function PolicyPage({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) {
  return (
    <div className="container-page py-12">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: title }]} />
      <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-primary sm:text-5xl">{title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated {updated}</p>
      <Prose className="surface-card mt-8 max-w-4xl p-8">{children}</Prose>
    </div>
  );
}
