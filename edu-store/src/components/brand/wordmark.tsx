import { cn } from "@/lib/utils";

/**
 * MELISSA EDU 워드마크. 영문 세리프 대문자가 중심이며 와인색을 씁니다.
 * ‘EDU’는 한 단계 가벼운 더스티 로즈로 두고 아이콘은 쓰지 않습니다. 푸터처럼 어두운 면에서는 부모의 글자색을 따릅니다.
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
  const main = { sm: "text-[18px] tracking-[0.2em]", md: "text-[24px] tracking-[0.22em]", lg: "text-[36px] tracking-[0.24em]", xl: "text-[58px] tracking-[0.26em]" }[size];
  const sub = { sm: "text-[9px]", md: "text-[10px]", lg: "text-[12px]", xl: "text-[16px]" }[size];
  return (
    <span className={cn("inline-flex flex-col leading-none text-primary", className)}>
      <span className={cn("font-display uppercase", main)}>
        <span className="font-semibold">Melissa</span>
        <span className="ml-[0.5em] font-medium italic text-dusty-rose">Edu</span>
      </span>
      {korean && <span className={cn("mt-1.5 font-medium tracking-[0.42em] text-primary/70", sub)}>멜리사 에듀</span>}
    </span>
  );
}
