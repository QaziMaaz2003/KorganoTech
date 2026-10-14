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
    <>
      {/*
        Keep a tiny element first. After a client navigation Next.js scrolls to the
        first element of the new page, but skips it if it is already on screen, and
        the page-tall themed wrapper below always is, so the new page would open
        wherever the previous one was scrolled. This skip link scrolls out of view
        like any small element, so navigation lands at the top (and it helps
        keyboard users).
      */}
      <a
        href="#main"
        className="sr-only z-50 rounded-lg bg-white px-4 py-2 font-semibold text-deep focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>
      <div
        className={`theme-env min-h-dvh antialiased ${bricolage.variable} ${fraunces.variable} ${plexSans.variable} ${plexMono.variable}`}
      >
        {children}
        <CartDrawer />
      </div>
    </>
  );
}
