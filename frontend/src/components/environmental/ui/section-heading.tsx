import type { ReactNode } from "react";
import { Reveal } from "./reveal";

type SectionHeadingProps = {
  eyebrow: string;
  title: ReactNode;
  body?: ReactNode;
  align?: "left" | "center";
  dark?: boolean;
};

export function SectionHeading({
  eyebrow,
  title,
  body,
  align = "left",
  dark = false,
}: SectionHeadingProps) {
  const centered = align === "center";
  return (
    <Reveal className={centered ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      <p
        className={`eyebrow flex items-center gap-3 ${centered ? "justify-center" : ""} ${
          dark ? "text-sun" : "text-flare"
        }`}
      >
        <span className={`h-px w-8 ${dark ? "bg-sun" : "bg-flare"}`} aria-hidden />
        {eyebrow}
      </p>
      <h2
        className={`mt-4 font-display text-4xl font-semibold leading-[1.05] tracking-tight text-balance sm:text-5xl ${
          dark ? "text-white" : "text-ink"
        }`}
      >
        {title}
      </h2>
      {body ? (
        <p
          className={`mt-5 text-lg leading-relaxed text-pretty ${
            dark ? "text-white/70" : "text-muted"
          }`}
        >
          {body}
        </p>
      ) : null}
    </Reveal>
  );
}
