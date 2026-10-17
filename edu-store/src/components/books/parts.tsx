import Link from "next/link";
import { areaLabel, deliveryLabel, difficultyLabel, kindLabel, levelsText } from "@/lib/catalog";
import { collectionLabel } from "@/lib/catalog-guides";
import { CONSULT_COPY } from "@/lib/consult";
import { effectivePrice, type Product } from "@/lib/types";
import { cn, formatPrice } from "@/lib/utils";
import { BookCover } from "./book-cover";

/** 정가·할인가·가격 미정을 한 곳에서 표기합니다. 할인 표시는 판매가가 정가보다 낮을 때만 나타납니다. */
export function Price({ product, size = "md", className }: { product: Pick<Product, "price" | "salePrice">; size?: "sm" | "md" | "lg"; className?: string }) {
  const now = effectivePrice(product);
  const sizeCls = { sm: "text-[14px]", md: "text-[16px]", lg: "text-[26px]" }[size];
  if (now === null) return <span className={cn("text-[13px] text-muted-foreground", className)}>가격 상담</span>;
  const discounted = product.price !== null && now < product.price;
  return (
    <span className={cn("inline-flex items-baseline gap-2 tabular-nums", className)}>
      <span className={cn("font-semibold text-primary", sizeCls)}>{formatPrice(now)}</span>
      {discounted && <span className="text-[12px] text-muted-foreground line-through">{formatPrice(product.price!)}</span>}
    </span>
  );
}

/** 주문 제작 상담 표기. 완성된 PDF가 있는 교재에는 붙지 않습니다. */
export function DeliveryTag({ type, className }: { type: Product["deliveryType"]; className?: string }) {
  if (type !== "custom") return null;
  return (
    <span className={cn("inline-block whitespace-nowrap border border-dusty-rose/70 bg-light-pink px-1.5 py-px text-[11px] font-medium tracking-wide text-secondary-foreground", className)}>
      {deliveryLabel(type)}
    </span>
  );
}

/** 상담·구매 신청 버튼: 상담 페이지로 이동하며 해당 교재가 자동 선택됩니다. */
export function ConsultLink({ slug, label = CONSULT_COPY.button, className, variant = "solid" }: { slug?: string; label?: string; className?: string; variant?: "solid" | "line" | "text" }) {
  const href = slug ? `/consult?product=${encodeURIComponent(slug)}` : "/consult";
  const base = { solid: "inline-flex h-11 items-center justify-center bg-primary px-5 text-[14px] font-semibold text-primary-foreground hover:bg-primary-hover", line: "inline-flex h-10 items-center justify-center border border-dusty-rose/70 bg-card px-4 text-[13px] font-semibold text-secondary-foreground hover:bg-blush/60", text: "text-[13px] font-semibold text-primary underline decoration-dusty-rose underline-offset-4" }[variant];
  return <Link href={href} data-consult-button className={cn(base, className)}>{label}</Link>;
}

/** 추천 교재 라벨: 옐로우는 이런 작은 면에만 씁니다. */
export function FeaturedTag({ rank, className }: { rank: number | null; className?: string }) {
  if (rank === null) return null;
  return <span className={cn("inline-block bg-gold px-1.5 py-px text-[10.5px] font-bold tracking-[0.04em] text-secondary-foreground", className)}>추천</span>;
}

export function metaLine(p: Product) {
  if (p.collection) return [collectionLabel(p.collection), levelsText(p.levels)].filter(Boolean).join(" · ");
  return [levelsText(p.levels), areaLabel(p.area), kindLabel(p.kind), difficultyLabel(p.difficulty)].filter(Boolean).join(" · ");
}

/** 서가형: 표지 아래에 짧은 캡션. 카드 테두리 없이 표지 자체가 주인공입니다. */
export function ShelfItem({ product, priority, className }: { product: Product; priority?: boolean; className?: string }) {
  return (
    <article className={cn("group [&_img]:transition-transform", className)}>
      <Link href={`/books/${product.slug}`} className="block" aria-label={product.title}>
        <BookCover product={product} priority={priority} className="transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_18px_28px_-16px_rgba(74,29,40,0.5)]" />
      </Link>
      <div className="mt-3">
        <p className="text-[12px] text-muted-foreground">{metaLine(product)}</p>
        <h3 className="mt-1 text-[15px] font-semibold leading-snug text-secondary-foreground">
          <Link href={`/books/${product.slug}`} className="hover:underline">{product.title}</Link>
        </h3>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
          <Price product={product} size="sm" />
          <FeaturedTag rank={product.featuredRank} />
          <DeliveryTag type={product.deliveryType} />
        </div>
        <ConsultLink slug={product.slug} label="구매 상담 신청" variant="text" className="mt-2.5 inline-block max-md:flex max-md:h-10 max-md:w-full max-md:items-center max-md:justify-center max-md:border max-md:border-dusty-rose/70 max-md:bg-card max-md:no-underline" />
      </div>
    </article>
  );
}

/** 목록형: 작은 표지 + 서지 정보 + 가격. 고등·중등 내신 구역과 검색 결과에 씁니다. */
export function BookRow({ product, className }: { product: Product; className?: string }) {
  return (
    <article className={cn("grid grid-cols-[76px_minmax(0,1fr)] gap-4 border-t border-border py-5 sm:grid-cols-[92px_minmax(0,1fr)_auto] sm:gap-6", className)}>
      <Link href={`/books/${product.slug}`} aria-label={product.title} className="row-span-2 sm:row-span-1">
        <BookCover product={product} sizes="92px" />
      </Link>
      <div className="min-w-0">
        <p className="text-[12px] text-muted-foreground">{metaLine(product)}</p>
        <h3 className="mt-1 text-[16px] font-semibold leading-snug text-secondary-foreground">
          <Link href={`/books/${product.slug}`} className="hover:underline">{product.title}</Link>
        </h3>
        {product.summary && <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-muted-foreground">{product.summary}</p>}
        {product.series && <p className="mt-1.5 text-[12px] text-muted-foreground">{product.series}</p>}
      </div>
      <div className="col-start-2 flex flex-wrap items-center gap-x-3 gap-y-2 sm:col-start-3 sm:flex-col sm:items-end sm:justify-start">
        <Price product={product} />
        <FeaturedTag rank={product.featuredRank} />
        <DeliveryTag type={product.deliveryType} />
        <ConsultLink slug={product.slug} label="구매 상담 신청" variant="line" className="max-sm:w-full" />
      </div>
    </article>
  );
}
