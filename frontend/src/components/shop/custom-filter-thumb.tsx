import { Ruler } from "lucide-react";
import type { CustomSpec } from "@/lib/types";
import { cn } from "@/lib/utils";

const trim = (n: number) => String(Number(n.toFixed(3)));

/** Stand-in image for a made-to-order filter: shows its dimensions. */
export function CustomFilterThumb({
  spec,
  className,
}: {
  spec: Pick<CustomSpec, "width" | "height" | "depth"> | null;
  className?: string;
}) {
  return (
    <div className={cn("relative grid place-items-center overflow-hidden bg-gradient-card text-primary", className)}>
      <div className="flex flex-col items-center gap-0.5 px-1 text-center leading-tight">
        <Ruler className="size-1/4 min-h-4 min-w-4 text-brand" aria-hidden />
        {spec ? (
          <span className="text-[11px] font-bold tabular-nums">
            {trim(spec.width)}×{trim(spec.height)}×{trim(spec.depth)}
          </span>
        ) : null}
        <span className="text-[9px] font-semibold tracking-wide text-muted-foreground uppercase">Custom</span>
      </div>
    </div>
  );
}
