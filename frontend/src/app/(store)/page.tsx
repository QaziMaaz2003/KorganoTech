import { Suspense } from "react";
import Link from "next/link";
import { Hero } from "@/components/home/hero";
import { SizeFinder } from "@/components/home/size-finder";
import {
  BulkCompare,
  Guide,
  ShopByMerv,
  ShopByProduct,
  SizesSection,
  SizesSkeleton,
  Trusted,
  WhereCleanAirMatters,
  WhyChoose,
} from "@/components/home/sections";
import { Newsletter } from "@/components/site/newsletter";

// Section order mirrors filterking.com's homepage, with KorganoTech content.
export default function HomePage() {
  return (
    <>
      <Hero />
      <SizeFinder className="mt-16" />

      <section aria-labelledby="sizes-title" className="container-page pt-20">
        <h2 id="sizes-title" className="mb-8 text-center text-3xl font-extrabold tracking-tight text-primary sm:text-4xl">
          HVAC air filter sizes
        </h2>
        <Suspense fallback={<SizesSkeleton />}>
          <SizesSection />
        </Suspense>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Don&apos;t see your size?{" "}
          <Link href="/contact" className="font-semibold text-brand hover:underline">
            Ask about custom sizes
          </Link>
        </p>
      </section>

      <ShopByProduct />
      <ShopByMerv />
      <Guide />
      <WhereCleanAirMatters />
      <WhyChoose />
      <Trusted />
      <BulkCompare />
      <div className="mt-20">
        <Newsletter />
      </div>
    </>
  );
}
