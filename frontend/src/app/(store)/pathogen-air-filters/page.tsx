import type { Metadata } from "next";
import { PathogenContent } from "@/components/ref-pages/pathogen-content";
import { RefRoot } from "@/components/ref-pages/ref-root";

export const metadata: Metadata = {
  title: "Pathogen Air Filters (Technology Under Development)",
  description:
    "KorganoTech is developing a nanotechnology-based air filter designed to capture and neutralize airborne pathogens. Currently in research and development; not yet commercially available.",
};

export default function PathogenAirFiltersPage() {
  return (
    <RefRoot page="pathogen">
      <PathogenContent />
    </RefRoot>
  );
}
