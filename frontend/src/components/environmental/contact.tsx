"use client";

import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Check, Copy, Mail, MapPin, Phone } from "lucide-react";
import { useState, type FormEvent } from "react";
import { contact, site } from "@/lib/env-data";
import { post } from "@/lib/client-api";
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
              <input
                type="radio"
                name={name}
                value={option}
                checked={checked}
                onChange={() => onChange(option)}
                className="sr-only"
              />
              {option}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

export function Contact() {
  const [copied, setCopied] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [handling, setHandling] = useState(contact.handling[0]);
  const [interest, setInterest] = useState(contact.interests[0]);

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(site.address);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Landfill enquiries land in the admin dashboard's Inquiries inbox.
  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const field = (k: string) => String(form.get(k) ?? "").trim();
    const message = [
      `Environmental Filters enquiry`,
      `Landfill: ${field("landfill")} (${field("location")})`,
      field("flow") ? `Gas flow: ${field("flow")} CFM` : null,
      field("mix") ? `CH4/CO2 mix: ${field("mix")}` : null,
      `Gas handled today: ${handling}`,
      `Interested in: ${interest}`,
      field("message") ? `\n${field("message")}` : null,
    ]
      .filter(Boolean)
      .join("\n");
    setSending(true);
    setError(null);
    try {
      await post("/inquiries", {
        type: "GENERAL",
        name: field("name"),
        email: field("email"),
        company: field("landfill"),
        message,
      });
      setSubmitted(true);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSending(false);
    }
  };

  return (
    <section id="contact" className="relative isolate overflow-hidden bg-deep py-24 text-white sm:py-32">
      <div aria-hidden className="topo absolute inset-0 -z-10" />
      {/* Hexagon motif */}
      <div aria-hidden className="pointer-events-none absolute -top-10 right-[4%] -z-10 hidden md:block">
        <div className="animate-float hex h-44 w-52 bg-flare/90" />
        <div className="animate-float-slow hex mt-3 ml-24 h-44 w-52 bg-co2/80" />
        <div className="animate-float hex -mt-16 -ml-24 h-24 w-28 bg-leaf/60 [animation-delay:1.5s]" />
      </div>

      <div className="mx-auto grid max-w-7xl gap-14 px-5 sm:px-8 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <SectionHeading dark eyebrow={contact.eyebrow} title={contact.title} body={contact.body} />

          <Reveal delay={0.1} className="mt-10 space-y-4">
            <p className="font-display text-lg font-semibold">KorganoTech · Environmental Filters</p>
            <div className="flex items-start gap-3 text-white/80">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-sun" />
              <span className="flex flex-wrap items-center gap-3">
                {site.address}
                <button
                  type="button"
                  onClick={copyAddress}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/20 px-3 py-1 text-xs text-white/80 transition-colors hover:bg-white/10"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-leaf" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </span>
            </div>
            {/* Shown once real details replace the source site's placeholders. */}
            {!site.email.startsWith("[") ? (
              <p className="flex items-center gap-3 text-white/80">
                <Mail className="h-5 w-5 shrink-0 text-sun" />
                {site.email}
              </p>
            ) : null}
            {!site.phone.startsWith("[") ? (
              <p className="flex items-center gap-3 text-white/80">
                <Phone className="h-5 w-5 shrink-0 text-sun" />
                {site.phone}
              </p>
            ) : null}
          </Reveal>

          <Reveal delay={0.15} className="mt-10">
            <p className="font-display text-lg font-semibold text-sun">Please share with us</p>
            <Stagger className="mt-4 space-y-3" stagger={0.08}>
              {contact.share.map((item) => (
                <StaggerItem key={item} className="flex gap-3 text-sm leading-relaxed text-white/75">
                  <span className="hex mt-1 h-3 w-3.5 shrink-0 bg-leaf" />
                  {item}
                </StaggerItem>
              ))}
            </Stagger>
          </Reveal>
        </div>

        <Reveal delay={0.1} y={40} className="lg:col-span-7 lg:pt-32">
          <div className="relative rounded-[2rem] bg-white p-6 text-ink shadow-2xl shadow-black/30 sm:p-10">
            <AnimatePresence mode="wait" initial={false}>
              {submitted ? (
                <motion.div
                  key="done"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex min-h-[28rem] flex-col items-center justify-center text-center"
                >
                  <motion.span
                    initial={{ scale: 0, rotate: -90 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 14 }}
                    className="hex grid h-20 w-24 place-items-center bg-ch4 text-white"
                  >
                    <Check className="h-9 w-9" strokeWidth={3} />
                  </motion.span>
                  <h3 className="mt-6 font-display text-3xl font-semibold">Thank you</h3>
                  <p className="mt-3 max-w-sm text-muted">
                    We have your site details. Our team will follow up about next steps.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSubmitted(false)}
                    className="mt-8 text-sm font-semibold text-co2 hover:underline"
                  >
                    Send another enquiry
                  </button>
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
                    <h3 className="font-display text-2xl font-semibold">Tell us about your site</h3>
                    <p className="mt-1 text-sm text-muted">Takes about a minute. Fields marked * are required.</p>
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <label className="grid gap-2 text-sm font-medium">
                      Your name *
                      <input required name="name" autoComplete="name" className={inputClass} placeholder="Jane Rivera" />
                    </label>
                    <label className="grid gap-2 text-sm font-medium">
                      Work email *
                      <input
                        required
                        type="email"
                        name="email"
                        autoComplete="email"
                        className={inputClass}
                        placeholder="jane@landfill.org"
                      />
                    </label>
                    <label className="grid gap-2 text-sm font-medium">
                      Landfill name *
                      <input required name="landfill" className={inputClass} placeholder="County Sanitary Landfill" />
                    </label>
                    <label className="grid gap-2 text-sm font-medium">
                      Location *
                      <input required name="location" className={inputClass} placeholder="City, State" />
                    </label>
                    <label className="grid gap-2 text-sm font-medium">
                      Gas flow (CFM)
                      <input name="flow" inputMode="numeric" className={inputClass} placeholder="e.g. 2,500" />
                    </label>
                    <label className="grid gap-2 text-sm font-medium">
                      CH₄ / CO₂ mix
                      <input name="mix" className={inputClass} placeholder="e.g. 52 / 46, if known" />
                    </label>
                  </div>
                  <ChipGroup
                    name="handling"
                    legend="How is the gas handled today?"
                    options={contact.handling}
                    value={handling}
                    onChange={setHandling}
                  />
                  <ChipGroup
                    name="interest"
                    legend="What are you interested in?"
                    options={contact.interests}
                    value={interest}
                    onChange={setInterest}
                  />
                  <label className="grid gap-2 text-sm font-medium">
                    Anything else?
                    <textarea
                      name="message"
                      rows={3}
                      className={`${inputClass} resize-none`}
                      placeholder="Tell us about your gas-collection system or timeline"
                    />
                  </label>
                  {error ? (
                    <p role="alert" className="rounded-xl bg-flare/10 px-4 py-3 text-sm font-medium text-flare">
                      {error}
                    </p>
                  ) : null}
                  <button
                    type="submit"
                    disabled={sending}
                    className="group mt-1 disabled:opacity-60 inline-flex items-center justify-center gap-2 rounded-full bg-flare px-7 py-4 font-semibold text-white shadow-lg shadow-flare/30 transition-all hover:-translate-y-0.5 hover:bg-[#c2561a]"
                  >
                    {sending ? "Sending…" : "Send enquiry"}
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
