"use client";

import Image from "next/image";
import { Stagger, StaggerItem } from "@/components/environmental/ui/reveal";
import { SectionHeading } from "@/components/environmental/ui/section-heading";
import { programIcons, type IconKey } from "./icons";

export interface ApplicationItem {
  icon: IconKey;
  title: string;
  body: string;
  image?: string;
}

/** Photo (or gradient) tiles showing where the product is used. */
export function ProgramApplications({
  id = "applications",
  eyebrow,
  title,
  body,
  items,
}: {
  id?: string;
  eyebrow: string;
  title: string;
  body: string;
  items: ApplicationItem[];
}) {
  return (
    <section id={id} className="relative overflow-hidden py-24 sm:py-32">
      <div aria-hidden className="absolute -right-40 bottom-10 h-[26rem] w-[26rem] rounded-full bg-flare/10 blur-3xl" />
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading eyebrow={eyebrow} title={title} body={body} />
        <Stagger className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4" stagger={0.1}>
          {items.map((item) => {
            const Icon = programIcons[item.icon];
            return (
              <StaggerItem
                key={item.title}
                className="group relative isolate flex min-h-[22rem] flex-col justify-end overflow-hidden rounded-[1.75rem] bg-linear-to-br from-deep to-deeper p-6 text-white transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-deep/25"
              >
                {item.image ? (
                  <Image
                    src={item.image}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                    className="-z-20 object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                ) : (
                  <div aria-hidden className="topo absolute inset-0 -z-20" />
                )}
                <div aria-hidden className="absolute inset-0 -z-10 bg-linear-to-t from-abyss/95 via-abyss/55 to-abyss/10" />
                <span className="hex mb-5 grid h-12 w-14 place-items-center bg-leaf text-deep transition-transform duration-500 group-hover:rotate-60">
                  <Icon className="h-5 w-5 transition-transform duration-500 group-hover:-rotate-60" />
                </span>
                <h3 className="font-display text-2xl font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/75">{item.body}</p>
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}
