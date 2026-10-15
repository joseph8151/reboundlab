import Image from "next/image";
import { areaInfo, areaLabel, curriculumLabel, kindLabel, levelsText } from "@/lib/catalog";
import { cn } from "@/lib/utils";
import type { Product } from "@/lib/types";

type CoverData = Pick<Product, "slug" | "title" | "series" | "area" | "course" | "levels" | "kind" | "curriculum" | "examYear" | "coverUrl">;

/** 중등 교재는 과목과 관계없이 소프트 세이지 계열로 통일합니다. */
const MIDDLE = { color: "#566d5f", tint: "#e4e9e1" };

function palette(p: CoverData) {
  const onlyMiddle = p.levels.length > 0 && p.levels.every((l) => l.startsWith("middle"));
  return onlyMiddle ? MIDDLE : areaInfo(p.area);
}

/** 같은 교재는 항상 같은 배치가 나오도록 슬러그로 고릅니다. */
function layoutOf(slug: string): 0 | 1 | 2 {
  let h = 0;
  for (const c of slug) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return (h % 3) as 0 | 1 | 2;
}

function titleSize(title: string) {
  const n = title.length;
  return n <= 12 ? 11.5 : n <= 20 ? 9.8 : n <= 30 ? 8.4 : 7.2;
}

/**
 * 출판사형 교재 표지. 글자 크기를 컨테이너 너비 기준(cqw)으로 잡아 썸네일에서도 비율이 유지됩니다.
 * 표지 이미지가 등록되면 그 이미지를 그대로 보여 줍니다.
 */
export function BookCover({ product, className, priority = false, sizes = "(min-width: 768px) 25vw, 50vw" }: { product: CoverData; className?: string; priority?: boolean; sizes?: string }) {
  const frame = "relative block aspect-[3/4] w-full overflow-hidden shadow-[0_1px_0_rgba(34,37,34,0.08),0_12px_20px_-14px_rgba(34,37,34,0.45)]";
  if (product.coverUrl) {
    return (
      <div className={cn(frame, "bg-muted", className)}>
        <Image src={product.coverUrl} alt={`${product.title} 표지`} fill sizes={sizes} priority={priority} className="object-cover" />
      </div>
    );
  }

  const { color, tint } = palette(product);
  const variant = layoutOf(product.slug);
  const level = levelsText(product.levels);
  const edition = [curriculumLabel(product.curriculum), product.examYear ? `${product.examYear}학년도` : ""].filter(Boolean).join(" · ");
  const subject = product.course ? `${areaLabel(product.area)} · ${product.course}` : areaLabel(product.area);
  const fs = titleSize(product.title);

  const label = "font-display uppercase tracking-[0.28em] font-semibold";

  return (
    <div
      role="img"
      aria-label={`${product.title} 표지`}
      className={cn(frame, "[container-type:inline-size]", className)}
      style={{ background: variant === 1 ? "#f3f0e8" : color, color: variant === 1 ? "#222522" : "#f7f5f0" }}
    >
      {/* 제본 느낌의 좌측 홈: 아주 옅게 */}
      <span className="pointer-events-none absolute inset-y-0 left-[3.5cqw] w-px bg-black/10" aria-hidden />

      {variant === 0 && (
        <div className="absolute inset-0 flex flex-col justify-between p-[9cqw] pl-[11cqw]">
          <div>
            <p className={cn(label, "text-[4.2cqw] opacity-90")}>Melisa Edu</p>
            <div className="mt-[3.5cqw] h-px w-[14cqw] bg-current opacity-50" />
            <p className="mt-[4cqw] text-[4.4cqw] font-medium opacity-90">{subject}</p>
          </div>
          <div>
            <h3 className="font-bold leading-[1.22] tracking-[-0.03em]" style={{ fontSize: `${fs}cqw` }}>{product.title}</h3>
            {product.series && <p className="mt-[3cqw] text-[3.8cqw] opacity-80">{product.series}</p>}
            <div className="mt-[5cqw] flex items-end justify-between gap-[2cqw] text-[3.6cqw] opacity-85">
              <span>{level}</span>
              <span className="text-right">{edition || kindLabel(product.kind)}</span>
            </div>
          </div>
        </div>
      )}

      {variant === 1 && (
        <>
          <span className="absolute inset-y-0 left-0 w-[16cqw]" style={{ background: color }} aria-hidden />
          <span className={cn(label, "absolute bottom-[8cqw] left-[3.2cqw] text-[3.6cqw] text-[#f7f5f0] [writing-mode:vertical-rl] rotate-180")}>Melisa Edu</span>
          <div className="absolute inset-0 flex flex-col justify-between py-[9cqw] pl-[22cqw] pr-[8cqw]">
            <div>
              <p className="text-[4.2cqw] font-semibold" style={{ color }}>{subject}</p>
              <h3 className="mt-[5cqw] font-bold leading-[1.22] tracking-[-0.03em]" style={{ fontSize: `${fs * 0.96}cqw` }}>{product.title}</h3>
            </div>
            <div className="text-[3.7cqw]">
              {product.series && <p className="mb-[2.5cqw] font-medium">{product.series}</p>}
              <p className="opacity-70">{[level, edition].filter(Boolean).join("  |  ")}</p>
            </div>
          </div>
        </>
      )}

      {variant === 2 && (
        <>
          <div className="absolute inset-x-0 top-0 h-[58%]" style={{ background: color }}>
            <div className="flex h-full flex-col justify-between p-[9cqw] pl-[11cqw]">
              <p className={cn(label, "text-[4.2cqw] opacity-90")}>Melisa Edu</p>
              <h3 className="font-bold leading-[1.22] tracking-[-0.03em]" style={{ fontSize: `${fs}cqw` }}>{product.title}</h3>
            </div>
          </div>
          <div className="absolute inset-x-0 bottom-0 h-[42%] p-[9cqw] pl-[11cqw]" style={{ background: tint, color: "#222522" }}>
            <p className="text-[4.4cqw] font-semibold" style={{ color }}>{subject}</p>
            {product.series && <p className="mt-[2.5cqw] text-[3.8cqw]">{product.series}</p>}
            <p className="mt-[4cqw] text-[3.6cqw] opacity-75">{[level, edition].filter(Boolean).join("  |  ")}</p>
          </div>
        </>
      )}
    </div>
  );
}
