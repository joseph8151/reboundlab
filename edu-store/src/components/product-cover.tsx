import Image from "next/image";
import { gradeLabel, subjectLabel, typeLabel } from "@/lib/catalog";
import { cn } from "@/lib/utils";
import type { Product } from "@/lib/types";

const PALETTE: Record<string, { bg: string; band: string; text: string }> = {
  korean: { bg: "#EEF3FF", band: "#1F4FD1", text: "#14307F" },
  math: { bg: "#EAF6FF", band: "#0B6BCB", text: "#0A3F78" },
  english: { bg: "#EEF1F8", band: "#3B4A6B", text: "#1F2A44" },
  inquiry: { bg: "#E8F7F3", band: "#0E8A6E", text: "#0B4D3F" },
  common: { bg: "#F3F4F6", band: "#475467", text: "#1D2939" },
};

type Props = {
  product: Pick<Product, "title" | "subject" | "type" | "grades" | "thumbnailUrl">;
  className?: string;
  sizes?: string;
};

/** 썸네일 이미지가 없으면 과목 색으로 표지를 그립니다. */
export function ProductCover({ product, className, sizes = "(min-width: 768px) 33vw, 100vw" }: Props) {
  if (product.thumbnailUrl) {
    return (
      <div className={cn("relative aspect-[4/3] overflow-hidden bg-muted", className)}>
        <Image src={product.thumbnailUrl} alt="" fill sizes={sizes} className="object-cover" />
      </div>
    );
  }
  const c = PALETTE[product.subject] ?? PALETTE.common;
  return (
    <div className={cn("relative flex aspect-[4/3] items-center justify-center overflow-hidden", className)} style={{ background: c.bg }} aria-hidden="true">
      <div className="relative h-[78%] w-[52%] rounded-sm bg-white shadow-[0_8px_24px_-8px_rgba(15,31,61,0.25)]">
        <div className="h-[18%] w-full rounded-t-sm" style={{ background: c.band }} />
        <div className="space-y-1.5 p-[9%]">
          <p className="text-[10px] font-semibold" style={{ color: c.band }}>
            {subjectLabel(product.subject)} · {typeLabel(product.type)}
          </p>
          <p className="line-clamp-3 text-[11px] font-bold leading-snug sm:text-xs" style={{ color: c.text }}>
            {product.title}
          </p>
          <div className="space-y-1 pt-1">
            <div className="h-1 w-full rounded bg-gray-100" />
            <div className="h-1 w-4/5 rounded bg-gray-100" />
            <div className="h-1 w-3/5 rounded bg-gray-100" />
          </div>
        </div>
        <p className="absolute bottom-[6%] left-[9%] text-[9px] font-medium text-gray-400">
          {product.grades.map(gradeLabel).join(" · ")}
        </p>
      </div>
    </div>
  );
}
