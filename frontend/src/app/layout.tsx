import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "KorganoTech — Advanced Air Filtration for a Cleaner Future",
    template: "%s | KorganoTech",
  },
  description:
    "KorganoTech manufactures high-performance MERV 11 and MERV 13 pleated HVAC air filters and develops pathogen and environmental filtration technology. Livermore, California.",
  openGraph: {
    title: "KorganoTech — Advanced Air Filtration for a Cleaner Future",
    description:
      "HVAC air filters, pathogen filtration technology, and environmental filtration solutions for cleaner indoor and outdoor air.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#3f2d7a",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={jakarta.variable}>
      <body className="min-h-dvh">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
