import type { Metadata } from "next";
import { Suspense } from "react";
import { CaseStudy } from "@/components/environmental/case-study";
import { Contact } from "@/components/environmental/contact";
import { Demonstrated } from "@/components/environmental/demonstrated";
import { Footer } from "@/components/environmental/footer";
import { Hero } from "@/components/environmental/hero";
import { EnvLiveProducts } from "@/components/environmental/live-products";
import { Navbar } from "@/components/environmental/navbar";
import { Overview } from "@/components/environmental/overview";
import { Partner } from "@/components/environmental/partner";
import { Problem } from "@/components/environmental/problem";
import { Products } from "@/components/environmental/products";
import { Solution } from "@/components/environmental/solution";
import { Technology } from "@/components/environmental/technology";
import { Ticker } from "@/components/environmental/ticker";

export const metadata: Metadata = {
  title: "Environmental Filters — Landfill Gas to Renewable Methane",
  description:
    "An automated carbon-capture and methane-recovery system developed by KorganoTech with Lawrence Livermore National Laboratory. Separate CO₂ from landfill gas with a reusable filter media.",
};

export default function EnvironmentalPage() {
  return (
    <>
      <Navbar />
      <main id="main">
        <Hero />
        <Ticker />
        <Overview />
        <Problem />
        <Solution />
        <Demonstrated />
        <Technology />
        <CaseStudy />
        <Products>
          <Suspense fallback={null}>
            <EnvLiveProducts />
          </Suspense>
        </Products>
        <Partner />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
