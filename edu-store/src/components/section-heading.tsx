import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  className,
  align = "left",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
  align?: "left" | "center";
}) {
  return (
    <div className={cn(align === "center" && "mx-auto text-center", "max-w-2xl", className)}>
      {eyebrow && <p className="text-sm font-semibold text-primary">{eyebrow}</p>}
      <h2 className="mt-2 text-2xl font-bold leading-tight sm:text-[28px]">{title}</h2>
      {description && <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground sm:text-base">{description}</p>}
    </div>
  );
}
