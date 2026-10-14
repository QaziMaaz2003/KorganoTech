"use client";

import { AnimatePresence, motion, useScroll, useSpring } from "motion/react";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Menu, ShoppingCart, UserRound, X } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useCartStore } from "@/lib/cart-store";
import { useEffect, useState } from "react";
import { navLinks } from "@/lib/env-data";
import { Logo } from "@/components/environmental/ui/logo";

type NavbarProps = {
  links?: { label: string; href: string }[];
  ctaLabel?: string;
  ctaHref?: string;
  logoTitle?: string;
  logoSubtitle?: string;
};

export function Navbar({
  links = navLinks,
  ctaLabel = "Contact us",
  ctaHref = "#contact",
  logoTitle,
  logoSubtitle,
}: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const { scrollYProgress } = useScroll();
  const { count } = useCart();
  const openCart = useCartStore((s) => s.setDrawerOpen);
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 24, mass: 0.3 });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const hrefs = links.map((link) => link.href);
    const sections = ["#top", "#overview", ...hrefs]
      .map((href) => document.querySelector(href))
      .filter((el): el is Element => el !== null);
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const href = `#${entry.target.id}`;
          setActive(hrefs.includes(href) ? href : null);
        }
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [links]);

  const solid = scrolled || open;

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div
        className={`transition-[background-color,box-shadow,backdrop-filter] duration-500 ${
          solid
            ? "bg-white/85 shadow-[0_1px_0_rgb(15_59_68/0.08),0_12px_40px_-24px_rgb(15_59_68/0.45)] backdrop-blur-xl"
            : "bg-transparent"
        }`}
      >
        <nav className="mx-auto flex h-18 max-w-7xl items-center justify-between px-5 sm:px-8">
          <a href="#top" aria-label={`${logoTitle ?? "Environmental Filters"} home`} onClick={() => setOpen(false)}>
            <Logo light={!solid} title={logoTitle} subtitle={logoSubtitle} />
          </a>

          <ul className="hidden items-center gap-1 lg:flex">
            {links.map((link) => {
              const isActive = active === link.href;
              return (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className={`relative isolate rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                      solid
                        ? isActive
                          ? "text-deep"
                          : "text-muted hover:text-ink"
                        : isActive
                          ? "text-white"
                          : "text-white/75 hover:text-white"
                    }`}
                  >
                    {isActive ? (
                      <motion.span
                        layoutId="nav-pill"
                        className={`absolute inset-0 -z-10 rounded-full ${
                          solid ? "bg-tint" : "bg-white/15"
                        }`}
                        transition={{ type: "spring", stiffness: 380, damping: 32 }}
                      />
                    ) : null}
                    {link.label}
                  </a>
                </li>
              );
            })}
          </ul>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/"
              className={`hidden items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium transition-colors xl:inline-flex ${
                solid ? "text-muted hover:text-ink" : "text-white/75 hover:text-white"
              }`}
            >
              <ArrowLeft className="h-4 w-4" /> KorganoTech store
            </Link>
            <Link
              href="/account"
              aria-label="My account"
              className={`grid h-11 w-11 place-items-center rounded-full transition-colors ${
                solid ? "bg-tint text-ink hover:bg-line" : "bg-white/15 text-white backdrop-blur hover:bg-white/25"
              }`}
            >
              <UserRound className="h-5 w-5" />
            </Link>
            <button
              type="button"
              onClick={() => openCart(true)}
              aria-label={`Cart, ${count} items`}
              className={`relative grid h-11 w-11 place-items-center rounded-full transition-colors ${
                solid ? "bg-tint text-ink hover:bg-line" : "bg-white/15 text-white backdrop-blur hover:bg-white/25"
              }`}
            >
              <ShoppingCart className="h-5 w-5" />
              {count > 0 ? (
                <span className="absolute -top-1 -right-1 grid min-w-5 place-items-center rounded-full bg-flare px-1 text-[11px] font-bold text-white">
                  {count}
                </span>
              ) : null}
            </button>
            <a
              href={ctaHref}
              className="group hidden items-center gap-2 rounded-full bg-flare px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-flare/25 transition-all hover:bg-[#c2561a] hover:shadow-flare/40 sm:inline-flex"
            >
              {ctaLabel}
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
            <button
              type="button"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
              className={`grid h-11 w-11 place-items-center rounded-full transition-colors lg:hidden ${
                solid ? "bg-tint text-ink" : "bg-white/15 text-white backdrop-blur"
              }`}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </nav>

        <AnimatePresence>
          {open ? (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden border-t border-line lg:hidden"
            >
              <ul className="mx-auto flex max-w-7xl flex-col gap-1 px-5 py-4 sm:px-8">
                {links.map((link, i) => (
                  <motion.li
                    key={link.href}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * i }}
                  >
                    <a
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className="block rounded-xl px-4 py-3 font-display text-lg font-medium text-ink hover:bg-tint"
                    >
                      {link.label}
                    </a>
                  </motion.li>
                ))}
                <li>
                  <Link
                    href="/"
                    onClick={() => setOpen(false)}
                    className="block rounded-xl px-4 py-3 font-display text-lg font-medium text-ink hover:bg-tint"
                  >
                    ← KorganoTech store
                  </Link>
                </li>
                <li className="pt-2">
                  <a
                    href={ctaHref}
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-center gap-2 rounded-full bg-flare px-5 py-3 font-semibold text-white"
                  >
                    {ctaLabel} <ArrowUpRight className="h-4 w-4" />
                  </a>
                </li>
              </ul>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
      <motion.div
        style={{ scaleX: progress }}
        className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-linear-to-r from-leaf via-ch4 to-co2"
        aria-hidden
      />
    </header>
  );
}
