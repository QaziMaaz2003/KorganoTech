import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/** Styled native <select>: accessible, mobile-friendly, no portal. */
export function NativeSelect({
  className,
  wrapperClassName,
  size = "md",
  ...props
}: Omit<React.ComponentProps<"select">, "size"> & {
  wrapperClassName?: string;
  size?: "sm" | "md" | "lg";
}) {
  return (
    <div className={cn("relative", wrapperClassName)}>
      <select
        className={cn(
          "w-full appearance-none rounded-xl border border-input bg-white pr-9 pl-3.5 text-sm font-medium text-foreground outline-none transition focus:border-brand focus:ring-3 focus:ring-brand/15 disabled:cursor-not-allowed disabled:opacity-60 aria-invalid:border-destructive",
          size === "sm" ? "h-9" : size === "lg" ? "h-12" : "h-10",
          className,
        )}
        {...props}
      />
      <ChevronDown
        aria-hidden
        className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-primary"
      />
    </div>
  );
}
