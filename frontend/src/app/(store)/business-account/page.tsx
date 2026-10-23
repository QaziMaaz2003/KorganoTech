import type { Metadata } from "next";
import Link from "next/link";
import { ClipboardList, Headphones, ListChecks, RefreshCcw } from "lucide-react";
import { PageHero } from "@/components/content/page-hero";
import { BusinessRequestForm } from "@/components/business/business-request-form";

export const metadata: Metadata = {
  title: "Business Accounts",
  description:
    "Request a free KorganoTech business account. Sign in to see the filter sizes set up for your building and reorder them in a few clicks.",
};

const perks = [
  { icon: ListChecks, title: "Your sizes, saved", body: "We set up the filter sizes, MERV ratings and quantities for each of your buildings." },
  { icon: RefreshCcw, title: "Reorder in a few clicks", body: "Sign in, pick what you need this time and check out — no re-measuring, no hunting for sizes." },
  { icon: ClipboardList, title: "Order history in one place", body: "Every order, payment and tracking number for your team sits in your account." },
  { icon: Headphones, title: "A real advisor", body: "Someone on our team knows your account and can help with sizing, custom filters and large orders." },
];

export default function BusinessAccountPage() {
  return (
    <>
      <PageHero
        crumbs={[{ label: "Home", href: "/" }, { label: "Business Account" }]}
        eyebrow="For businesses"
        title="Fresh air for your business,"
        accent="reordered in minutes"
        body="Tell us about your building and we will set up a free business account with your filter sizes ready to reorder."
      />

      <section className="container-page py-12 sm:py-16">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-start">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-primary">How a business account works</h2>
            <ul className="mt-6 space-y-4">
              {perks.map(({ icon: Icon, title, body }) => (
                <li key={title} className="surface-card flex gap-4 p-5">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-gradient-brand text-white">
                    <Icon className="size-5" />
                  </span>
                  <div>
                    <p className="font-bold text-primary">{title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{body}</p>
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/account/business" className="font-semibold text-brand hover:underline">
                Go to your business filters
              </Link>
              . Prices are the same list prices everyone sees, and all orders are paid by card at checkout.
            </p>
          </div>
          <BusinessRequestForm />
        </div>
      </section>
    </>
  );
}
