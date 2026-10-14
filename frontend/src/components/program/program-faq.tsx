import { Plus } from "lucide-react";
import type { FaqItem } from "@/lib/program-types";
import { Reveal } from "@/components/environmental/ui/reveal";
import { SectionHeading } from "@/components/environmental/ui/section-heading";

export function ProgramFaq({
  id = "faq",
  eyebrow,
  title,
  items,
}: {
  id?: string;
  eyebrow: string;
  title: string;
  items: FaqItem[];
}) {
  return (
    <section id={id} className="relative py-24 sm:py-32">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <SectionHeading eyebrow={eyebrow} title={title} />
        </div>
        <Reveal delay={0.1} className="lg:col-span-8">
          <div className="divide-y divide-line overflow-hidden rounded-[1.75rem] border border-line bg-white">
            {items.map((item, i) => (
              <details key={item.q} name="program-faq" open={i === 0} className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 px-6 py-5 font-display text-lg font-semibold text-ink transition-colors hover:bg-tint/60 sm:px-8 [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-tint text-deep transition-transform duration-300 group-open:rotate-45">
                    <Plus className="h-4 w-4" />
                  </span>
                </summary>
                <p className="px-6 pb-6 leading-relaxed text-muted sm:px-8">{item.a}</p>
              </details>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
