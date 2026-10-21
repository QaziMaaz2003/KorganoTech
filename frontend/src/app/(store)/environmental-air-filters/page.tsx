import type { Metadata } from "next";
import { EnvironmentalContent } from "@/components/ref-pages/environmental-content";
import { RefRoot } from "@/components/ref-pages/ref-root";

export const metadata: Metadata = {
  title: "Environmental Air Filters — Landfill Gas to Renewable Methane",
  description:
    "KorganoTech's Environmental Air Filters capture CO₂ from landfill gas while recovering renewable methane, built on science from Lawrence Livermore National Laboratory. Technology in development.",
};

export default function EnvironmentalAirFiltersPage() {
  return (
    <RefRoot page="environmental">
      <EnvironmentalContent />
    </RefRoot>
  );
}
