import Image from "next/image";
import { areaInfo, areaLabel, curriculumLabel, kindLabel, levelsText } from "@/lib/catalog";
import { cn } from "@/lib/utils";
import type { Product } from "@/lib/types";

type CoverData = Pick<Product, "slug" | "title" | "series" | "area" | "course" | "levels" | "kind" | "curriculum" | "examYear" | "coverUrl"> & { collection?: string | null };

/** 중등 교재는 과목과 관계없이 웜 베이지 핑크 바탕에 와인 글자로 통일합니다. */
const MIDDLE = { color: "#f3d5dc", ink: "#6e2132", tint: "#faf6f2", accent: "#6e2132", text: "#6e2132" };

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
  const frame = "relative block aspect-[3/4] w-full overflow-hidden shadow-[0_1px_0_rgba(74,29,40,0.08),0_12px_20px_-14px_rgba(74,29,40,0.45)]";
  if (product.coverUrl) {
    return (
      <div className={cn(frame, "bg-muted", className)}>
        <Image src={product.coverUrl} alt={`${product.title} 표지`} fill sizes={sizes} priority={priority} className="object-cover" />
      </div>
    );
  }

  if (product.collection) return <SeriesCover product={product} className={className} frame={frame} />;

  const { color, ink, tint, accent, text } = palette(product);
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
      style={{ background: variant === 1 ? "#faf6f2" : color, color: variant === 1 ? "#4a1d28" : ink }}
    >
      {/* 제본 느낌의 좌측 홈: 아주 옅게 */}
      <span className="pointer-events-none absolute inset-y-0 left-[3.5cqw] w-px bg-black/10" aria-hidden />

      {variant === 0 && (
        <div className="absolute inset-0 flex flex-col justify-between p-[9cqw] pl-[11cqw]">
          <div>
            <p className={cn(label, "text-[4.2cqw] opacity-90")}>Melissa Edu</p>
            <div className="mt-[3.5cqw] h-[0.6cqw] w-[14cqw]" style={{ background: accent }} />
            <p className="mt-[4cqw] text-[4.4cqw] font-medium opacity-90">{subject}</p>
          </div>
          <div>
            <h3 className="font-[family-name:var(--font-heading)] font-semibold leading-[1.22] tracking-[-0.03em]" style={{ fontSize: `${fs}cqw` }}>{product.title}</h3>
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
          <span className={cn(label, "absolute bottom-[8cqw] left-[3.2cqw] text-[3.6cqw] [writing-mode:vertical-rl] rotate-180")} style={{ color: ink }}>Melissa Edu</span>
          <div className="absolute inset-0 flex flex-col justify-between py-[9cqw] pl-[22cqw] pr-[8cqw]">
            <div>
              <p className="text-[4.2cqw] font-semibold" style={{ color: text }}>{subject}</p>
              <div className="mt-[3cqw] h-[0.6cqw] w-[10cqw]" style={{ background: accent === "#faf6f2" ? text : accent }} />
              <h3 className="mt-[5cqw] font-[family-name:var(--font-heading)] font-semibold leading-[1.22] tracking-[-0.03em]" style={{ fontSize: `${fs * 0.96}cqw` }}>{product.title}</h3>
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
          <div className="absolute inset-x-0 top-0 h-[58%]" style={{ background: color, color: ink }}>
            <div className="flex h-full flex-col justify-between p-[9cqw] pl-[11cqw]">
              <p className={cn(label, "text-[4.2cqw] opacity-90")}>Melissa Edu</p>
              <h3 className="font-[family-name:var(--font-heading)] font-semibold leading-[1.22] tracking-[-0.03em]" style={{ fontSize: `${fs}cqw` }}>{product.title}</h3>
            </div>
          </div>
          <div className="absolute inset-x-0 bottom-0 h-[42%] p-[9cqw] pl-[11cqw]" style={{ background: tint, color: "#4a1d28" }}>
            <p className="text-[4.4cqw] font-semibold" style={{ color: text }}>{subject}</p>
            <div className="mt-[2.5cqw] h-[0.6cqw] w-[10cqw]" style={{ background: accent }} />
            {product.series && <p className="mt-[2.5cqw] text-[3.8cqw]">{product.series}</p>}
            <p className="mt-[4cqw] text-[3.6cqw] opacity-75">{[level, edition].filter(Boolean).join("  |  ")}</p>
          </div>
        </>
      )}
    </div>
  );
}


/**
 * 시리즈 표지(자기주도학습·공부법·플래너·학부모 가이드). 시리즈마다 구성이 다르고,
 * 같은 시리즈 안에서도 슬러그로 고른 변주(여백·정렬·포인트 색)가 달라 표지가 똑같아 보이지 않게 합니다.
 */
function hashOf(slug: string) {
  let h = 7;
  for (const c of slug) h = (h * 33 + c.charCodeAt(0)) >>> 0;
  return h;
}

function SeriesCover({ product, className, frame }: { product: CoverData; className?: string; frame: string }) {
  const h = hashOf(product.slug);
  const v = h % 2; // 시리즈 안의 변주
  const level = levelsText(product.levels);
  const fs = titleSize(product.title);
  const label = "font-display uppercase tracking-[0.26em] font-semibold";
  const seriesName = (product.series ?? "").replace("MELISSA ", "");
  const wrap = (style: React.CSSProperties, children: React.ReactNode) => (
    <div role="img" aria-label={`${product.title} 표지`} className={cn(frame, "[container-type:inline-size]", className)} style={style}>
      <span className="pointer-events-none absolute inset-y-0 left-[3.5cqw] w-px bg-black/10" aria-hidden />
      {children}
    </div>
  );

  // 자기주도학습: 아이보리 바탕, 와인 제목, 얇은 세로선과 작은 옐로우 점
  if (product.collection === "self-study") {
    return wrap({ background: "#faf6f2", color: "#4a1d28" }, (
      <>
        <span className="absolute top-0 h-full w-px bg-[#d88fa0]" style={{ left: v ? "78%" : "24%" }} aria-hidden />
        <span className="absolute size-[4.2cqw] bg-[#f2c94c]" style={{ top: "9cqw", [v ? "left" : "right"]: "9cqw" } as React.CSSProperties} aria-hidden />
        <div className={cn("absolute inset-0 flex flex-col justify-between p-[9cqw] pl-[11cqw]", v ? "pr-[26cqw]" : "pl-[30cqw]")}>
          <p className={cn(label, "text-[3.6cqw] text-[#6e2132]")}>Melissa<br />{seriesName}</p>
          <div>
            <h3 className="font-[family-name:var(--font-heading)] font-semibold leading-[1.2] tracking-[-0.035em] text-[#6e2132]" style={{ fontSize: `${fs * 1.02}cqw` }}>{product.title}</h3>
            <p className="mt-[4cqw] text-[3.6cqw] opacity-70">{level}</p>
          </div>
        </div>
      </>
    ));
  }

  // 공부법: 와인 전면, 큰 이탤릭 숫자 워터마크, 머스터드 가는 선
  if (product.collection === "study-method") {
    return wrap({ background: v ? "#7b263b" : "#6e2132", color: "#faf6f2" }, (
      <>
        <span className="font-display pointer-events-none absolute -right-[6cqw] text-[34cqw] italic leading-none text-[#d88fa0]/20" style={{ top: v ? "14%" : "36%" }} aria-hidden>Method</span>
        <div className="absolute inset-0 flex flex-col justify-between p-[9cqw] pl-[11cqw]">
          <p className={cn(label, "text-[3.6cqw] text-[#f3d5dc]")}>Melissa {seriesName}</p>
          <div>
            <div className="mb-[4cqw] h-[0.7cqw] w-[12cqw] bg-[#d9a63a]" />
            <h3 className="font-[family-name:var(--font-heading)] font-semibold leading-[1.2] tracking-[-0.035em]" style={{ fontSize: `${fs}cqw` }}>{product.title}</h3>
            <p className="mt-[4cqw] text-[3.6cqw] text-[#f3d5dc]/85">{level}</p>
          </div>
        </div>
      </>
    ));
  }

  // 플래너: 블러시 바탕에 줄 노트 무늬, 흰 제목 띠와 옐로우 형광펜 선
  if (product.collection === "study-planner") {
    return wrap({ background: "#f3d5dc", color: "#4a1d28", backgroundImage: "repeating-linear-gradient(to bottom, transparent 0, transparent 6.2cqw, rgba(201,123,141,0.35) 6.2cqw, rgba(201,123,141,0.35) 6.5cqw)" }, (
      <>
        <div className={cn("absolute inset-x-[9cqw] bg-[#faf6f2] p-[6cqw]", v ? "top-[16cqw]" : "bottom-[18cqw]")} style={{ marginLeft: "3cqw" }}>
          <p className={cn(label, "text-[3.4cqw] text-[#c97b8d]")}>Melissa {seriesName}</p>
          <h3 className="mt-[3cqw] font-[family-name:var(--font-heading)] font-semibold leading-[1.22] tracking-[-0.03em] text-[#6e2132]" style={{ fontSize: `${fs * 0.92}cqw` }}>{product.title}</h3>
          <div className="mt-[3.5cqw] h-[1.6cqw] w-[22cqw] bg-[#f2c94c]/80" />
        </div>
        <p className="absolute bottom-[8cqw] left-[14cqw] text-[3.6cqw] font-medium text-[#6e2132]">{level}</p>
      </>
    ));
  }

  // 학부모 가이드: 상단 버건디 면과 하단 아이보리 면, 제목이 경계를 넘어 걸침
  return wrap({ background: "#faf6f2", color: "#4a1d28" }, (
    <>
      <div className="absolute inset-x-0 top-0" style={{ height: v ? "46%" : "38%", background: "#7b263b" }}>
        <p className={cn(label, "p-[9cqw] pl-[11cqw] text-[3.6cqw] text-[#f3d5dc]")}>Melissa {seriesName}</p>
      </div>
      <span className="absolute right-[9cqw] size-[10cqw] rounded-full bg-[#d88fa0]" style={{ top: v ? "40%" : "32%" }} aria-hidden />
      <div className="absolute inset-x-0 bottom-0 p-[9cqw] pl-[11cqw]" style={{ top: v ? "52%" : "44%" }}>
        <h3 className="font-[family-name:var(--font-heading)] font-semibold leading-[1.2] tracking-[-0.035em] text-[#6e2132]" style={{ fontSize: `${fs * 0.96}cqw` }}>{product.title}</h3>
        <p className="mt-[3.5cqw] text-[3.6cqw] opacity-70">보호자를 위한 안내 · {level}</p>
      </div>
    </>
  ));
}
