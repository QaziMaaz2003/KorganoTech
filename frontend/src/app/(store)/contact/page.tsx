import type { Metadata } from "next";
import Link from "next/link";
import { Building2, HelpCircle, MapPin, Package } from "lucide-react";
import { brand } from "@/lib/site";
import { Breadcrumbs } from "@/components/content/page-hero";
import { InquiryForm } from "@/components/content/inquiry-form";
import { SocialIcons } from "@/components/site/social-icons";

export const metadata: Metadata = {
  title: "Contact Sales — Bulk Orders",
  description: "Contact Sales: bulk orders of KorganoTech Traditional Air Filters in MERV 11, MERV 13 and custom sizes.",
};

export default function ContactPage() {
  return (
    <div className="bg-gradient-hero">
      <div className="container-page py-12">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Contact" }]} />
        <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_1.5fr]">
          <div>
            <p className="eyebrow">Contact</p>
            <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-primary sm:text-5xl">
              Contact Sales: Bulk Order of KorganoTech Traditional Air Filters
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Have questions about our filtration solutions, custom sizes or volume orders? Send us a message and our team
              will get back to you.
            </p>
            <ul className="mt-8 space-y-4">
              <li className="surface-card flex gap-4 p-5">
                <MapPin className="size-6 shrink-0 text-brand" />
                <div>
                  <p className="font-bold">KorganoTech</p>
                  <p className="text-sm text-muted-foreground">{brand.address}</p>
                  <p className="text-sm text-muted-foreground">EPA Establishment Number: {brand.epaEstablishment}</p>
                </div>
              </li>
              <li className="surface-card flex gap-4 p-5">
                <Building2 className="size-6 shrink-0 text-brand" />
                <div>
                  <p className="font-bold">Schools, farms &amp; commercial buildings</p>
                  <p className="text-sm text-muted-foreground">Ask about MERV 11, MERV 13 and custom-size volume orders.</p>
                </div>
              </li>
              <li className="surface-card flex gap-4 p-5">
                <Package className="size-6 shrink-0 text-brand" />
                <div>
                  <p className="font-bold">Already ordered?</p>
                  <p className="text-sm text-muted-foreground">
                    Track delivery status in <Link href="/account/orders" className="font-semibold text-brand hover:underline">My orders</Link>.
                  </p>
                </div>
              </li>
              <li className="surface-card flex gap-4 p-5">
                <HelpCircle className="size-6 shrink-0 text-brand" />
                <div>
                  <p className="font-bold">Quick answers</p>
                  <p className="text-sm text-muted-foreground">
                    See our <Link href="/faq" className="font-semibold text-brand hover:underline">frequently asked questions</Link>.
                  </p>
                </div>
              </li>
            </ul>
            <SocialIcons className="mt-6" itemClassName="border-lavender bg-white text-primary hover:bg-accent" />
          </div>
          <InquiryForm variant="sales" />
        </div>
      </div>
    </div>
  );
}
