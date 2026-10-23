import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/content/page-hero";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ButtonLink } from "@/components/ui/button-link";

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description: "Answers about KorganoTech products, sizes, custom sizes, ordering, payment and order tracking.",
};

const groups: { title: string; items: { q: string; a: React.ReactNode }[] }[] = [
  {
    title: "Products",
    items: [
      {
        q: "What types of air filters does KorganoTech offer?",
        a: "KorganoTech manufactures high-performance MERV 11 and MERV 13 pleated HVAC air filters using traditional melt blown filtration media. We are also developing a nanotechnology-based Pathogen Air Filter and an Environmental CO₂-capture filter for landfill applications; those two are not yet available for purchase.",
      },
      {
        q: "What are Pathogen Air Filters?",
        a: (
          <>
            KorganoTech is developing a nanotechnology-based air filter designed to capture and neutralize airborne
            pathogens. It is in the research and development phase, is not yet registered as a pesticide or pesticide
            device, and is not commercially available. <Link href="/pathogen-air-filters">Learn about the program</Link>.
          </>
        ),
      },
      {
        q: "Are Pathogen Air Filters available for purchase?",
        a: "Not yet. You can register your interest on the Pathogen Air Filters page and we'll let you know when that changes.",
      },
      {
        q: "What are Environmental Air Filters?",
        a: (
          <>
            An automated carbon-capture and methane-recovery system developed with Lawrence Livermore National Laboratory
            that separates CO₂ from landfill gas using a reusable filter media. It is in development for landfill
            applications. <Link href="/environmental-air-filters">See the technology</Link>.
          </>
        ),
      },
      {
        q: "Which MERV rating should I choose?",
        a: "MERV 11 suits most homes, including those with pets or mild allergies. MERV 13 captures a higher share of smaller particles such as smoke and fine dust and suits households with allergies or higher-occupancy buildings. Check that your HVAC system is rated for the filter you choose.",
      },
    ],
  },
  {
    title: "Sizes",
    items: [
      {
        q: "How do I find the correct HVAC filter size?",
        a: (
          <>
            Read the size printed on the frame of your current filter (for example 16x25x1) and enter it in our size
            finder. If there is no size printed, measure width, length and depth and round up to the nearest inch. Our{" "}
            <Link href="/resources/choosing-the-right-filter-size">sizing guide</Link> explains nominal vs. actual size.
          </>
        ),
      },
      {
        q: "Do you make custom sizes?",
        a: (
          <>
            Yes. Enter your exact measurements on our <Link href="/custom-filters">custom size page</Link>, choose depth,
            MERV rating and pack size, and see your price instantly. For large or recurring orders,{" "}
            <Link href="/contact">contact sales</Link>.
          </>
        ),
      },
    ],
  },
  {
    title: "Ordering & delivery",
    items: [
      {
        q: "Can I purchase directly from KorganoTech?",
        a: "Yes. You can order KorganoTech Traditional Air Filters on this website, and they are also available at Walmart.com. For bulk purchases, please fill out our Contact Form.",
      },
      {
        q: "How do I pay?",
        a: "You pay by card on Stripe's secure checkout page after you place your order. Visa, Mastercard, American Express, Apple Pay and Google Pay are supported. Your card details go straight to Stripe and are never stored by KorganoTech.",
      },
      {
        q: "Which countries do you ship to, and in what currency?",
        a: "We currently ship to addresses in the United States only. All prices and payments are in US dollars (USD).",
      },
      {
        q: "Is sales tax added to my order?",
        a: "No. No sales tax is added at checkout, so the total in your cart is the amount you pay.",
      },
      {
        q: "How much is shipping?",
        a: "Orders above the free-shipping threshold shown in your cart ship free; smaller orders pay a flat shipping fee. The exact amounts are shown in your cart before you check out.",
      },
      {
        q: "How do I track my order?",
        a: (
          <>
            Sign in and open <Link href="/account/orders">My orders</Link>. Each order shows its status — pending,
            confirmed, processing, shipped or delivered — along with the carrier and tracking number once it ships.
          </>
        ),
      },
      {
        q: "Can I cancel an order?",
        a: "You can cancel online while an order is still awaiting payment. After it has been paid and confirmed, please contact us and we'll help.",
      },
      {
        q: "Can I return a filter?",
        a: (
          <>
            Yes. Email <a href="mailto:support@korganotech.com">support@korganotech.com</a> with your order number and the reason, and we will send a
            return authorization with instructions. Please don&apos;t send anything back before you have one. See our{" "}
            <Link href="/shipping-returns">Shipping &amp; Returns</Link> policy.
          </>
        ),
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <>
      <PageHero
        crumbs={[{ label: "Home", href: "/" }, { label: "FAQ" }]}
        eyebrow="FAQ"
        title="Frequently Asked"
        accent="Questions"
        body="Answers about products, availability, ordering and getting in touch."
      />
      <div className="container-page grid gap-10 py-16 lg:grid-cols-[1fr_320px]">
        <div className="space-y-10">
          {groups.map((g) => (
            <section key={g.title}>
              <h2 className="mb-4 text-2xl font-extrabold tracking-tight text-primary">{g.title}</h2>
              <Accordion className="surface-card divide-y divide-lavender px-6">
                {g.items.map((it) => (
                  <AccordionItem key={it.q} value={it.q} className="border-0">
                    <AccordionTrigger className="py-5 text-left text-base font-semibold hover:no-underline">{it.q}</AccordionTrigger>
                    <AccordionContent className="pb-5 text-muted-foreground [&_a]:font-semibold [&_a]:text-brand [&_a]:underline-offset-4 hover:[&_a]:underline">
                      {it.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </section>
          ))}
        </div>
        <aside className="lg:sticky lg:top-36 lg:self-start">
          <div className="rounded-2xl bg-gradient-brand p-6 text-white">
            <p className="text-lg font-bold">Have Questions About Our Filtration Solutions?</p>
            <p className="mt-2 text-sm text-white/80">Our team is happy to help with sizing, bulk orders and product questions.</p>
            <ButtonLink href="/contact" variant="light" size="sm" className="mt-4">Contact us</ButtonLink>
          </div>
        </aside>
      </div>
    </>
  );
}
