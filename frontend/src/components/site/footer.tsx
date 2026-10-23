import Link from "next/link";
import { brand, footerNav } from "@/lib/site";
import { SocialIcons } from "./social-icons";

export function Footer() {
  return (
    <footer className="relative mt-20 bg-night text-white">
      <div aria-hidden className="absolute inset-x-0 top-0 h-1 bg-gradient-brand" />
      <div className="container-page py-16">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_3fr]">
          <div>
            <div className="inline-flex rounded-xl bg-white px-3 py-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/korganotech-logo.png" alt="KorganoTech" className="h-14 w-auto" />
            </div>
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-white/70">
              {brand.tagline}. Engineered air filtration for HVAC systems, pathogen capture research, and emerging
              environmental applications.
            </p>
            <address className="mt-6 space-y-1 text-sm not-italic text-white/80">
              <p className="font-semibold text-white">KorganoTech</p>
              <p>{brand.address}</p>
              <p>EPA Establishment Number: {brand.epaEstablishment}</p>
              <p>U.S. registered trademark #{brand.trademark}</p>
            </address>
            <SocialIcons className="mt-6" itemClassName="border-white/20 text-white hover:bg-white hover:text-night" />
          </div>

          <div className="grid gap-10 sm:grid-cols-2 xl:grid-cols-3">
            {footerNav.map((col) => (
              <div key={col.title}>
                <h3 className="border-b border-white/25 pb-3 text-lg font-bold">{col.title}</h3>
                <ul>
                  {col.links.map((l) => (
                    <li key={l.href} className="border-b border-white/10">
                      <Link href={l.href} className="block py-3 text-sm font-semibold text-white/85 transition hover:text-white hover:underline">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="bg-black/20">
        <div className="container-page flex flex-col gap-2 py-5 text-xs text-white/60 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © 2026 KorganoTech. All rights reserved. ·{" "}
            <Link href="/terms" className="hover:text-white">Terms of Service</Link> ·{" "}
            <Link href="/privacy" className="hover:text-white">Privacy Policy</Link>
          </p>
          <p>Product capabilities are subject to testing, validation, and applicable regulations.</p>
        </div>
      </div>
    </footer>
  );
}
