import { cn } from "@/lib/utils";

/**
 * MELISA EDU 워드마크. 영문 세리프(대문자·넓은 자간)가 중심이고 한글 이름은 보조로 씁니다.
 * 아이콘 없이 글자만으로 구성합니다.
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
  const main = { sm: "text-[17px] tracking-[0.2em]", md: "text-[22px] tracking-[0.22em]", lg: "text-[34px] tracking-[0.24em]", xl: "text-[56px] tracking-[0.26em]" }[size];
  const sub = { sm: "text-[9px]", md: "text-[10px]", lg: "text-[12px]", xl: "text-[16px]" }[size];
  return (
    <span className={cn("inline-flex flex-col leading-none", className)}>
      <span className={cn("font-display font-semibold uppercase", main)}>Melisa&nbsp;Edu</span>
      {korean && <span className={cn("mt-1.5 font-medium tracking-[0.42em] text-muted-foreground", sub)}>멜리사 에듀</span>}
    </span>
  );
}
