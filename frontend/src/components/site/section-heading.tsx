import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  body,
  align = "center",
  className,
  as: Tag = "h2",
}: {
  eyebrow?: string;
  title: React.ReactNode;
  body?: React.ReactNode;
  align?: "center" | "left";
  className?: string;
  as?: "h1" | "h2";
}) {
  return (
    <div className={cn(align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-2xl", className)}>
      {eyebrow ? <p className="eyebrow mb-3">{eyebrow}</p> : null}
      <Tag className="text-3xl font-extrabold tracking-tight text-primary sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]">
        {title}
      </Tag>
      {body ? <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">{body}</p> : null}
    </div>
  );
}
