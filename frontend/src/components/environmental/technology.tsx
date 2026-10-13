import { technology } from "@/lib/env-data";
import { AbsorptionChart } from "./absorption-chart";
import { Capsule } from "./capsule";
import { CountUp } from "@/components/environmental/ui/count-up";
import { Reveal, Stagger, StaggerItem } from "@/components/environmental/ui/reveal";
import { SectionHeading } from "@/components/environmental/ui/section-heading";

const statTones = ["text-sun", "text-leaf", "text-co2-soft"];

export function Technology() {
  return (
    <section id="technology" className="relative isolate overflow-hidden bg-deep py-24 text-white sm:py-32">
      <div aria-hidden className="topo absolute inset-0 -z-10" />
      <div aria-hidden className="grain absolute inset-0 -z-10 opacity-[0.05] mix-blend-overlay" />

      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <SectionHeading dark eyebrow={technology.eyebrow} title={technology.title} body={technology.body} />
          </div>
          <Stagger className="grid gap-3 sm:grid-cols-3 lg:col-span-5 lg:grid-cols-1">
            {technology.stats.map((stat, i) => (
              <StaggerItem
                key={stat.label}
                className="flex items-center gap-5 rounded-2xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur-md sm:flex-col sm:items-start lg:flex-row lg:items-center"
              >
                <span className={`min-w-40 shrink-0 font-display text-5xl font-semibold tracking-tight ${statTones[i]}`}>
                  <CountUp value={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
                </span>
                <span className="text-sm leading-snug text-white/75">{stat.label}</span>
              </StaggerItem>
            ))}
          </Stagger>
        </div>

        <div className="mt-16 grid items-start gap-8 lg:grid-cols-12">
          <Reveal className="lg:col-span-7">
            <AbsorptionChart />
          </Reveal>

          <Reveal delay={0.15} className="lg:col-span-5">
            <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.05] p-7 backdrop-blur-md sm:p-8">
              <div className="flex justify-center">
                <Capsule />
              </div>
              <div className="mt-2 grid grid-cols-2 gap-3">
                {technology.capsule.specs.map((spec) => (
                  <div key={spec.label} className="rounded-xl bg-white/[0.06] p-4 text-center">
                    <p className="font-display text-2xl font-semibold text-leaf">{spec.value}</p>
                    <p className="mt-1 text-xs text-white/60">{spec.label}</p>
                  </div>
                ))}
              </div>
              <h3 className="mt-6 font-display text-xl font-semibold">{technology.capsule.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-white/70">{technology.capsule.body}</p>
            </div>
          </Reveal>
        </div>

        <Reveal className="mt-20">
          <h3 className="font-display text-2xl font-semibold sm:text-3xl">Why the fundamental science is proven</h3>
        </Reveal>
        <Stagger className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5" stagger={0.08}>
          {technology.proofs.map((proof, i) => (
            <StaggerItem
              key={proof.title}
              className="group rounded-2xl border border-white/10 bg-white/[0.04] p-6 transition-all duration-500 hover:-translate-y-1.5 hover:border-leaf/40 hover:bg-white/[0.08]"
            >
              <span className="font-mono text-xs text-leaf">0{i + 1}</span>
              <h4 className="mt-3 font-display text-lg font-semibold">{proof.title}</h4>
              <p className="mt-2 text-sm leading-relaxed text-white/65">{proof.body}</p>
            </StaggerItem>
          ))}
        </Stagger>

        <p className="mt-10 max-w-4xl text-xs leading-relaxed text-white/45">
          Source: {technology.source}. Data reflect gram-scale laboratory validation; pilot- and
          commercial-scale testing are required for deployment.
        </p>
      </div>
    </section>
  );
}
