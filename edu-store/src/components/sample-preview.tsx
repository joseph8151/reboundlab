import Image from "next/image";
import { siteConfig } from "@/lib/site";
import type { Product } from "@/lib/types";

function Watermark() {
  const label = `${siteConfig.name} 미리보기 · 무단 배포 금지`;
  return (
    <div className="pointer-events-none absolute inset-0 select-none overflow-hidden" aria-hidden="true">
      <div className="absolute -inset-1/2 flex rotate-[-24deg] flex-col justify-center gap-14">
        {Array.from({ length: 9 }).map((_, row) => (
          <div key={row} className="flex gap-10 whitespace-nowrap" style={{ marginLeft: row % 2 ? "-6rem" : 0 }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <span key={i} className="text-sm font-bold tracking-wide text-primary/15">
                {label}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * 샘플 페이지 미리보기. 업로드한 샘플 이미지가 있으면 그 위에, 없으면 sample_excerpt 텍스트로
 * 만든 가상 페이지 위에 워터마크를 겹칩니다.
 * 이미지 자체에도 워터마크를 넣어 업로드하는 것을 권장합니다(화면 캡처 대비).
 */
export function SamplePreview({ product }: { product: Product }) {
  if (product.sampleImages.length > 0) {
    return (
      <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2">
        {product.sampleImages.map((src, i) => (
          <figure key={src} className="relative w-[78%] shrink-0 snap-start overflow-hidden rounded-xl border border-border bg-white sm:w-[46%]">
            <div className="relative aspect-[1/1.414]">
              <Image src={src} alt={`${product.title} 샘플 ${i + 1}쪽`} fill sizes="(min-width: 640px) 46vw, 78vw" className="object-contain" draggable={false} />
            </div>
            <Watermark />
          </figure>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="relative aspect-[1/1.414] overflow-hidden rounded-xl border border-border bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-semibold text-primary">목차</p>
        <ol className="mt-4 space-y-2.5 text-[13px] leading-snug">
          {product.toc.map((item, i) => (
            <li key={item} className="flex gap-2 border-b border-dashed border-border pb-2">
              <span className="font-semibold text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
              <span>{item}</span>
            </li>
          ))}
        </ol>
        <Watermark />
      </div>
      <div className="relative aspect-[1/1.414] overflow-hidden rounded-xl border border-border bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-semibold text-primary">본문 샘플</p>
        <div className="mt-4 space-y-3 text-[13px] leading-relaxed">
          {product.sampleExcerpt.map((line, i) => (
            <p key={i} className={i === 0 ? "font-bold" : ""}>
              {line}
            </p>
          ))}
        </div>
        <div className="mt-6 space-y-2" aria-hidden="true">
          {[100, 92, 96, 70, 88, 60].map((w, i) => (
            <div key={i} className="h-2 rounded bg-muted" style={{ width: `${w}%` }} />
          ))}
        </div>
        <Watermark />
      </div>
    </div>
  );
}
