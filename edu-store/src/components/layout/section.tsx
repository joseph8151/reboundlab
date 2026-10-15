import Link from "next/link";
import { cn } from "@/lib/utils";

/** 섹션 머리: 번호·소제목·제목·우측 링크. 섹션마다 정렬과 배경은 호출하는 쪽에서 바꿉니다. */
export function SectionHead({ no, eyebrow, title, href, linkLabel, className, tone = "dark" }: { no?: string; eyebrow?: string; title: string; href?: string; linkLabel?: string; className?: string; tone?: "dark" | "light" }) {
  return (
    <div className={cn("flex items-end justify-between gap-6", className)}>
      <div>
        {(no || eyebrow) && (
          <p className={cn("flex items-baseline gap-3 text-[12px] font-semibold tracking-[0.14em]", tone === "light" ? "text-background/70" : "text-primary/80")}>
            {no && <span className="font-display text-[15px] tracking-[0.08em]">{no}</span>}
            <span aria-hidden className={cn("inline-block h-[2px] w-5 translate-y-[-3px]", tone === "light" ? "bg-gold" : "bg-mustard")} />
            {eyebrow}
          </p>
        )}
        <h2 className={cn("mt-2 text-[26px] font-bold leading-[1.25] tracking-[-0.03em] md:text-[32px]", tone === "light" ? "" : "text-secondary-foreground")}>{title}</h2>
      </div>
      {href && (
        <Link href={href} className={cn("shrink-0 border-b pb-0.5 text-[13px] font-medium", tone === "light" ? "border-background/50 text-background" : "border-primary/50 text-primary")}>
          {linkLabel ?? "전체 보기"}
        </Link>
      )}
    </div>
  );
}
