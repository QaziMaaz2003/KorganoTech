type LogoProps = {
  light?: boolean;
};

export function Logo({ light = false }: LogoProps) {
  return (
    <span className="flex items-center gap-3">
      <svg viewBox="0 0 40 40" className="h-9 w-9 shrink-0" aria-hidden>
        <path
          d="M10 3h20l10 17-10 17H10L0 20z"
          className={light ? "fill-white/10" : "fill-deep"}
        />
        <path
          d="M20 9c-5 4.5-7.5 8.6-7.5 12.4a7.5 7.5 0 0 0 15 0C27.5 17.6 25 13.5 20 9Z"
          className="fill-leaf"
        />
        <path
          d="M20 15.5v14M20 22l-3.4-3M20 25.5l3.6-3.4"
          fill="none"
          strokeWidth="1.6"
          strokeLinecap="round"
          className="stroke-deep"
        />
      </svg>
      <span className="flex flex-col leading-none">
        <span
          className={`font-display text-lg font-semibold tracking-tight ${
            light ? "text-white" : "text-ink"
          }`}
        >
          Environmental Filters
        </span>
        <span
          className={`mt-1 font-mono text-[0.62rem] tracking-[0.22em] uppercase ${
            light ? "text-white/60" : "text-muted"
          }`}
        >
          by KorganoTech
        </span>
      </span>
    </span>
  );
}
