import Image from "next/image";
import { Award, Building2, FlaskConical, MapPin } from "lucide-react";
import { partner } from "@/lib/env-data";
import { Reveal, Stagger, StaggerItem } from "@/components/environmental/ui/reveal";
import { SectionHeading } from "@/components/environmental/ui/section-heading";

const highlightIcons = [Award, FlaskConical];

export function Partner() {
  return (
    <section id="partner" className="relative bg-white py-24 sm:py-32">
      <div className="mx-auto grid max-w-7xl gap-16 px-5 sm:px-8 lg:grid-cols-12 lg:gap-12">
        <Reveal x={-30} y={0} className="relative lg:col-span-5">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem]">
            <Image
              src={partner.image}
              alt={partner.imageAlt}
              fill
              sizes="(min-width: 1024px) 38vw, 100vw"
              className="object-cover transition-transform duration-[1.5s] hover:scale-105"
            />
            <div className="absolute inset-0 bg-linear-to-t from-deep/85 via-deep/10 to-transparent" />
            <div className="absolute inset-x-6 bottom-6 text-white">
              <p className="font-display text-6xl font-semibold tracking-tight text-sun">$1B+</p>
              <p className="mt-1 text-white/80">annual R&amp;D funding at LLNL</p>
            </div>
          </div>
          <div className="animate-float absolute -top-5 -right-3 flex items-center gap-3 rounded-2xl border border-line bg-white px-4 py-3 shadow-xl sm:-right-8">
            <span className="hex grid h-9 w-10 place-items-center bg-deep text-leaf">
              <Building2 className="h-4 w-4" />
            </span>
            <span className="text-sm leading-tight">
              <span className="block font-semibold text-ink">U.S. Department of Energy</span>
              <span className="text-muted">research backed &amp; vetted</span>
            </span>
          </div>
        </Reveal>

        <div className="lg:col-span-7">
          <SectionHeading eyebrow={partner.eyebrow} title={partner.title} body={partner.body} />

          <Reveal delay={0.1} className="mt-10">
            <div className="rounded-[1.75rem] border border-line bg-bg p-7 sm:p-8">
              <div className="flex items-center gap-5">
                <span className="relative grid h-16 w-16 shrink-0 place-items-center rounded-full bg-linear-to-br from-co2 to-ch4 p-[3px]">
                  <span className="grid h-full w-full place-items-center rounded-full bg-deep font-display text-lg font-semibold text-white">
                    CY
                  </span>
                </span>
                <div>
                  <p className="font-display text-xl font-semibold text-ink">{partner.collaborator.name}</p>
                  <p className="text-sm text-flare">{partner.collaborator.role}</p>
                </div>
              </div>
              <p className="mt-5 leading-relaxed text-muted">{partner.collaborator.bio}</p>
              <Stagger className="mt-6 grid gap-4 sm:grid-cols-2">
                {partner.collaborator.highlights.map((h, i) => {
                  const Icon = highlightIcons[i];
                  return (
                    <StaggerItem key={h.title} className="rounded-2xl bg-white p-5 shadow-sm">
                      <Icon className="h-5 w-5 text-co2" />
                      <p className="mt-3 font-semibold text-ink">{h.title}</p>
                      <p className="mt-1.5 text-sm leading-relaxed text-muted">{h.body}</p>
                    </StaggerItem>
                  );
                })}
              </Stagger>
            </div>
          </Reveal>

          <Reveal delay={0.15} className="mt-6">
            <div className="flex flex-col gap-4 rounded-[1.75rem] bg-deep p-7 text-white sm:flex-row sm:p-8">
              <span className="hex grid h-12 w-14 shrink-0 place-items-center bg-leaf text-deep">
                <MapPin className="h-5 w-5" />
              </span>
              <div>
                <p className="font-display text-xl font-semibold">{partner.about.title}</p>
                <p className="mt-2 leading-relaxed text-white/75">{partner.about.body}</p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
