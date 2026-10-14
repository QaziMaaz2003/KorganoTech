"use client";

import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Check, MapPin } from "lucide-react";
import { useState, type FormEvent } from "react";
import { post } from "@/lib/client-api";
import { brand } from "@/lib/site";
import { Reveal, Stagger, StaggerItem } from "@/components/environmental/ui/reveal";
import { SectionHeading } from "@/components/environmental/ui/section-heading";

const inputClass =
  "w-full rounded-xl border border-line bg-bg px-4 py-3 text-sm text-ink placeholder:text-muted/70 transition-colors focus:border-co2 focus:bg-white focus:outline-none";

function ChipGroup({
  name,
  legend,
  options,
  value,
  onChange,
}: {
  name: string;
  legend: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <fieldset>
      <legend className="text-sm font-medium text-ink">{legend}</legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((option) => {
          const checked = value === option;
          return (
            <label
              key={option}
              className={`cursor-pointer rounded-full border px-3.5 py-2 text-xs font-medium transition-all has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-co2 ${
                checked ? "border-deep bg-deep text-white" : "border-line bg-white text-muted hover:border-deep/40"
              }`}
            >
              <input type="radio" name={name} value={option} checked={checked} onChange={() => onChange(option)} className="sr-only" />
              {option}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

export interface ContactContent {
  eyebrow: string;
  title: string;
  body: string;
  shareTitle: string;
  share: string[];
  formTitle: string;
  formHint: string;
  chipLegend: string;
  chips: string[];
  messagePlaceholder: string;
  submit: string;
  thanksTitle: string;
  thanksBody: string;
  /** "sales" is Contact Sales (bulk order); "interest" is program interest (pathogen). */
  variant: "sales" | "interest";
  subject: string;
}

export function ProgramContact({ c }: { c: ContactContent }) {
  const [chip, setChip] = useState(c.chips[0]);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const field = (k: string) => String(form.get(k) ?? "").trim();
    if (c.variant === "sales" && field("email").toLowerCase() !== field("email2").toLowerCase()) {
      setError("The two email addresses don't match.");
      return;
    }
    setSending(true);
    setError(null);
    try {
      await post("/inquiries", {
        type: c.variant === "sales" ? "CONTACT_SALES" : "PRODUCT_INTEREST",
        name: field("name"),
        email: field("email"),
        phone: field("phone") || undefined,
        company: field("company") || undefined,
        productType: c.variant === "sales" ? chip : undefined,
        message:
          c.variant === "sales"
            ? field("message")
            : `${c.subject}\nInterested in: ${chip}\n\n${field("message")}`.trim(),
        website: field("website") || undefined,
      });
      setDone(true);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSending(false);
    }
  };

  return (
    <section id="contact" className="relative isolate overflow-hidden bg-deep py-24 text-white sm:py-32">
      <div aria-hidden className="topo absolute inset-0 -z-10" />
      <div aria-hidden className="grain absolute inset-0 -z-10 opacity-[0.05] mix-blend-overlay" />
      <div className="mx-auto grid max-w-7xl gap-14 px-5 sm:px-8 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <SectionHeading dark eyebrow={c.eyebrow} title={c.title} body={c.body} />
          <Reveal delay={0.1} className="mt-10 space-y-4">
            <div className="flex items-start gap-3 text-white/80">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-sun" />
              <span>
                KorganoTech
                <br />
                {brand.address}
                <br />
                <span className="text-sm text-white/55">EPA Establishment Number: {brand.epaEstablishment}</span>
              </span>
            </div>
          </Reveal>
          <Reveal delay={0.15} className="mt-10">
            <p className="font-display text-lg font-semibold text-sun">{c.shareTitle}</p>
            <Stagger className="mt-4 space-y-3" stagger={0.08}>
              {c.share.map((item) => (
                <StaggerItem key={item} className="flex gap-3 text-sm leading-relaxed text-white/75">
                  <span className="hex mt-1 h-3 w-3.5 shrink-0 bg-leaf" />
                  {item}
                </StaggerItem>
              ))}
            </Stagger>
          </Reveal>
        </div>

        <Reveal delay={0.1} y={40} className="lg:col-span-7">
          <div className="relative rounded-[2rem] bg-white p-6 text-ink shadow-2xl shadow-black/30 sm:p-10">
            <AnimatePresence mode="wait" initial={false}>
              {done ? (
                <motion.div
                  key="done"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex min-h-[26rem] flex-col items-center justify-center text-center"
                >
                  <motion.span
                    initial={{ scale: 0, rotate: -90 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 14 }}
                    className="hex grid h-20 w-24 place-items-center bg-ch4 text-white"
                  >
                    <Check className="h-9 w-9" strokeWidth={3} />
                  </motion.span>
                  <h3 className="mt-6 font-display text-3xl font-semibold">{c.thanksTitle}</h3>
                  <p className="mt-3 max-w-sm text-muted">{c.thanksBody}</p>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  onSubmit={onSubmit}
                  className="grid gap-5"
                >
                  <div>
                    <h3 className="font-display text-2xl font-semibold">{c.formTitle}</h3>
                    <p className="mt-1 text-sm text-muted">{c.formHint}</p>
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <label className="grid gap-2 text-sm font-medium">
                      Your name *
                      <input required name="name" autoComplete="name" className={inputClass} />
                    </label>
                    <label className="grid gap-2 text-sm font-medium">
                      Phone number
                      <input name="phone" type="tel" autoComplete="tel" className={inputClass} />
                    </label>
                    <label className="grid gap-2 text-sm font-medium">
                      Email *
                      <input required type="email" name="email" autoComplete="email" className={inputClass} />
                    </label>
                    {c.variant === "sales" ? (
                      <label className="grid gap-2 text-sm font-medium">
                        Email confirmation *
                        <input required type="email" name="email2" className={inputClass} />
                      </label>
                    ) : null}
                    <label className={`grid gap-2 text-sm font-medium ${c.variant === "sales" ? "sm:col-span-2" : ""}`}>
                      {c.variant === "sales" ? "Company" : "Organization (optional)"}
                      <input name="company" autoComplete="organization" className={inputClass} />
                    </label>
                  </div>
                  <ChipGroup name="chip" legend={c.chipLegend} options={c.chips} value={chip} onChange={setChip} />
                  <label className="grid gap-2 text-sm font-medium">
                    Comment *
                    <textarea
                      required
                      name="message"
                      rows={4}
                      maxLength={4000}
                      className={`${inputClass} resize-none`}
                      placeholder={c.messagePlaceholder}
                    />
                  </label>
                  {/* Honeypot: hidden from people, irresistible to bots */}
                  <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
                  {error ? (
                    <p role="alert" className="rounded-xl bg-flare/10 px-4 py-3 text-sm font-medium text-flare">
                      {error}
                    </p>
                  ) : null}
                  <button
                    type="submit"
                    disabled={sending}
                    className="group mt-1 inline-flex items-center justify-center gap-2 rounded-full bg-flare px-7 py-4 font-semibold text-white shadow-lg shadow-flare/30 transition-all hover:-translate-y-0.5 hover:bg-[#c2561a] disabled:opacity-60"
                  >
                    {sending ? "Sending…" : c.submit}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
