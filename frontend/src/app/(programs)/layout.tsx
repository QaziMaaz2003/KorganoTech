import type { Viewport } from "next";
import { Bricolage_Grotesque, Fraunces, IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import { CartDrawer } from "@/components/site/cart-drawer";

// The three product-program pages (HVAC, Pathogen, Environmental) share the
// Environmental Filters look: its own fonts and palette, scoped to these
// routes by the .theme-env wrapper (see globals.css).
const bricolage = Bricolage_Grotesque({ variable: "--font-bricolage", subsets: ["latin"] });
const fraunces = Fraunces({ variable: "--font-fraunces", subsets: ["latin"], style: ["italic"] });
const plexSans = IBM_Plex_Sans({ variable: "--font-plex-sans", subsets: ["latin"] });
const plexMono = IBM_Plex_Mono({ variable: "--font-plex-mono", subsets: ["latin"], weight: ["400", "500"] });

export const viewport: Viewport = {
  themeColor: "#0f3b44",
};

export default function ProgramsLayout({ children }: LayoutProps<"/">) {
  return (
    <div
      className={`theme-env min-h-dvh antialiased ${bricolage.variable} ${fraunces.variable} ${plexSans.variable} ${plexMono.variable}`}
    >
      {children}
      <CartDrawer />
    </div>
  );
}
