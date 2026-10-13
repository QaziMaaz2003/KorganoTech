import Link from "next/link";
import { products } from "@/lib/env-data";
import { toneBg, toneSoftBg, toneText } from "@/lib/env-tones";
import { FilterArt } from "./filter-art";
import { Stagger, StaggerItem } from "@/components/environmental/ui/reveal";
import { SectionHeading } from "@/components/environmental/ui/section-heading";

const programHref: Record<string, string> = {
  hvac: "/hvac-air-filters",
  pathogen: "/pathogen-air-filters",
  environmental: "#contact",
};

export function Products({ children }: { children?: React.ReactNode }) {
  return (
    <section className="relative overflow-hidden py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading align="center" eyebrow={products.eyebrow} title={products.title} body={products.body} />

        <Stagger className="mt-16 grid gap-6 md:grid-cols-3" stagger={0.14}>
          {products.items.map((item) => {
            const featured = item.kind === "environmental";
            return (
              <StaggerItem
                key={item.kind}
                className={`group relative flex flex-col overflow-hidden rounded-[1.75rem] border transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-deep/15 ${
                  featured ? "border-co2/30 bg-white ring-4 ring-co2/10" : "border-line bg-white"
                }`}
              >
                {featured ? (
                  <span className="absolute top-5 right-5 z-10 rounded-full bg-co2 px-3 py-1 font-mono text-[0.65rem] tracking-wider text-white uppercase">
                    This project
                  </span>
                ) : null}
                <div className="relative grid h-56 place-items-center overflow-hidden bg-linear-to-br from-mist to-tint p-6">
                  <div
                    aria-hidden
                    className={`absolute -bottom-16 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full opacity-20 blur-2xl transition-all duration-700 group-hover:scale-150 ${toneBg[item.statusTone]}`}
                  />
                  <div className="relative h-full transition-transform duration-700 group-hover:scale-105">
                    <FilterArt kind={item.kind} />
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-7">
                  <p className="eyebrow text-muted">{item.subtitle}</p>
                  <h3 className="mt-2 font-display text-2xl font-semibold text-ink">{item.title}</h3>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">{item.body}</p>
                  <span
                    className={`mt-6 inline-flex w-fit items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold ${toneSoftBg[item.statusTone]} ${toneText[item.statusTone]}`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${toneBg[item.statusTone]}`} />
                    {item.status}
                  </span>
                  <Link
                    href={programHref[item.kind]}
                    className="mt-4 text-sm font-semibold text-deep underline-offset-4 hover:text-co2 hover:underline"
                  >
                    {item.kind === "environmental" ? "Request information →" : "Learn more →"}
                  </Link>
                </div>
              </StaggerItem>
            );
          })}
        </Stagger>
        {children}
      </div>
    </section>
  );
}
