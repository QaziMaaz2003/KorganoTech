"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { post } from "@/lib/client-api";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "done">("idle");

  return (
    <section aria-labelledby="newsletter-title" className="container-page">
      <div className="flex flex-col gap-6 rounded-[2rem] bg-gradient-brand px-6 py-10 text-white shadow-lift sm:px-12 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 id="newsletter-title" className="text-2xl font-extrabold tracking-tight sm:text-3xl">
            Stay Connected With KorganoTech
          </h2>
          <p className="mt-2 text-sm text-white/80">
            Receive product updates, technology news, and company announcements.
          </p>
        </div>
        {state === "done" ? (
          <p className="flex items-center gap-2 rounded-2xl bg-white/15 px-5 py-4 font-semibold">
            <CheckCircle2 className="size-5" /> Thanks — you&apos;re subscribed.
          </p>
        ) : (
          <form
            className="flex w-full flex-col gap-3 sm:flex-row lg:max-w-lg"
            onSubmit={async (e) => {
              e.preventDefault();
              setState("busy");
              try {
                await post("/newsletter", { email });
                setState("done");
              } catch (err) {
                setState("idle");
                toast.error((err as Error).message);
              }
            }}
          >
            <label htmlFor="newsletter-email" className="sr-only">
              Email address
            </label>
            <input
              id="newsletter-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="h-12 flex-1 rounded-xl border-0 bg-white px-4 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:ring-3 focus:ring-white/50"
            />
            <button
              type="submit"
              disabled={state === "busy"}
              className="h-12 rounded-xl bg-lavender px-6 text-sm font-bold text-primary transition hover:bg-white disabled:opacity-60"
            >
              {state === "busy" ? "Subscribing…" : "Subscribe"}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
