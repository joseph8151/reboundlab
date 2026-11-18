import { cn } from "@/lib/utils";

/**
 * 박선생 워드마크. 세리프 한글 굵은 글씨에 와인색을 씁니다. 푸터처럼 어두운 면에서는 부모의 글자색을 따릅니다.
 */
export function Wordmark({
  size = "md",
  korean = true,
  className,
}: {
  size?: "sm" | "md" | "lg" | "xl";
  korean?: boolean;
  className?: string;
}) {
  const main = { sm: "text-[20px] tracking-[0.06em]", md: "text-[26px] tracking-[0.06em]", lg: "text-[40px] tracking-[0.08em]", xl: "text-[64px] tracking-[0.08em]" }[size];
  const sub = { sm: "text-[8px]", md: "text-[9px]", lg: "text-[11px]", xl: "text-[15px]" }[size];
  return (
    <span className={cn("inline-flex flex-col leading-none text-primary", className)}>
      <span className={cn("font-heading font-bold", main)}>박선생</span>
      {korean && <span className={cn("mt-1.5 font-display font-medium uppercase tracking-[0.36em] text-primary/70", sub)}>Premium PDF Books</span>}
    </span>
  );
}
