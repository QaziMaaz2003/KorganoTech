import Link from "next/link";
import { cn } from "@/lib/utils";

const variants = {
  primary:
    "bg-gradient-brand text-white shadow-card hover:shadow-lift hover:-translate-y-px",
  outline:
    "border border-border bg-white text-primary hover:border-brand/40 hover:bg-accent",
  ghostLight: "border border-white/60 text-white hover:bg-white/10",
  light: "bg-white text-primary shadow-card hover:bg-lavender",
  dark: "bg-night text-white hover:bg-primary",
};

const sizes = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-6 text-sm",
  lg: "h-13 px-7 text-base",
};

export type ButtonLinkProps = React.ComponentProps<typeof Link> & {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
};

/** Link styled as the redesign's pill buttons. */
export function ButtonLink({ variant = "primary", size = "md", className, ...props }: ButtonLinkProps) {
  return (
    <Link
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap transition-all duration-300",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  );
}

export function buttonClasses(variant: keyof typeof variants = "primary", size: keyof typeof sizes = "md") {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap transition-all duration-300 disabled:pointer-events-none disabled:opacity-60",
    variants[variant],
    sizes[size],
  );
}
