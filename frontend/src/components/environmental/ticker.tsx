import { tickerItems } from "@/lib/env-data";

export function Ticker() {
  const items = [...tickerItems, ...tickerItems];
  return (
    <div className="group relative overflow-hidden border-y border-white/10 bg-deep py-5 text-white">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-linear-to-r from-deep to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-linear-to-l from-deep to-transparent" />
      <ul className="animate-marquee flex w-max items-center group-hover:[animation-play-state:paused]">
        {items.map((item, i) => (
          <li
            key={i}
            aria-hidden={i >= tickerItems.length}
            className="flex items-center gap-6 px-6 font-display text-xl font-medium tracking-tight whitespace-nowrap sm:text-2xl"
          >
            <span
              className={`hex h-3.5 w-4 ${
                ["bg-flare", "bg-leaf", "bg-co2-soft"][i % 3]
              }`}
            />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
