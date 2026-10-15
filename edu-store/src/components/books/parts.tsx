import Link from "next/link";
import { areaLabel, difficultyLabel, kindLabel, levelsText, statusLabel } from "@/lib/catalog";
import { effectivePrice, type Product } from "@/lib/types";
import { cn, formatPrice } from "@/lib/utils";
import { BookCover } from "./book-cover";

/** 정가·할인가·가격 미정을 한 곳에서 표기합니다. 할인 표시는 판매가가 정가보다 낮을 때만 나타납니다. */
export function Price({ product, size = "md", className }: { product: Pick<Product, "price" | "salePrice" | "status">; size?: "sm" | "md" | "lg"; className?: string }) {
  const now = effectivePrice(product);
  const sizeCls = { sm: "text-[14px]", md: "text-[16px]", lg: "text-[26px]" }[size];
  if (now === null) return <span className={cn("text-[13px] text-muted-foreground", className)}>가격은 출시 시 공개</span>;
  const discounted = product.price !== null && now < product.price;
  return (
    <span className={cn("inline-flex items-baseline gap-2 tabular-nums", className)}>
      <span className={cn("font-semibold", sizeCls)}>{formatPrice(now)}</span>
      {discounted && <span className="text-[12px] text-muted-foreground line-through">{formatPrice(product.price!)}</span>}
    </span>
  );
}

export function StatusTag({ status, className }: { status: Product["status"]; className?: string }) {
  if (status === "on_sale") return null;
  return (
    <span className={cn("inline-block border border-foreground/30 px-1.5 py-px text-[11px] font-medium tracking-wide text-foreground/80", className)}>
      {statusLabel(status)}
    </span>
  );
}

export function metaLine(p: Product) {
  return [levelsText(p.levels), areaLabel(p.area), kindLabel(p.kind), difficultyLabel(p.difficulty)].filter(Boolean).join(" · ");
}

/** 서가형: 표지 아래에 짧은 캡션. 카드 테두리 없이 표지 자체가 주인공입니다. */
export function ShelfItem({ product, priority, className }: { product: Product; priority?: boolean; className?: string }) {
  return (
    <article className={cn("group", className)}>
      <Link href={`/books/${product.slug}`} className="block" aria-label={product.title}>
        <BookCover product={product} priority={priority} className="transition-transform duration-300 group-hover:-translate-y-0.5" />
      </Link>
      <div className="mt-3">
        <p className="text-[12px] text-muted-foreground">{metaLine(product)}</p>
        <h3 className="mt-1 text-[15px] font-semibold leading-snug">
          <Link href={`/books/${product.slug}`} className="hover:underline">{product.title}</Link>
        </h3>
        <div className="mt-1.5 flex items-center gap-2">
          <Price product={product} size="sm" />
          <StatusTag status={product.status} />
        </div>
      </div>
    </article>
  );
}

/** 목록형: 작은 표지 + 서지 정보 + 가격. 고등·중등 내신 구역과 검색 결과에 씁니다. */
export function BookRow({ product, className }: { product: Product; className?: string }) {
  return (
    <article className={cn("grid grid-cols-[76px_1fr] gap-4 border-t border-border py-5 sm:grid-cols-[92px_1fr_auto] sm:gap-6", className)}>
      <Link href={`/books/${product.slug}`} aria-label={product.title} className="row-span-2 sm:row-span-1">
        <BookCover product={product} sizes="92px" />
      </Link>
      <div className="min-w-0">
        <p className="text-[12px] text-muted-foreground">{metaLine(product)}</p>
        <h3 className="mt-1 text-[16px] font-semibold leading-snug">
          <Link href={`/books/${product.slug}`} className="hover:underline">{product.title}</Link>
        </h3>
        {product.summary && <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-muted-foreground">{product.summary}</p>}
        {product.series && <p className="mt-1.5 text-[12px] text-muted-foreground">{product.series}</p>}
      </div>
      <div className="col-start-2 flex items-center gap-3 sm:col-start-3 sm:flex-col sm:items-end sm:justify-start">
        <Price product={product} />
        <StatusTag status={product.status} />
      </div>
    </article>
  );
}

/** 출시 예정 교재는 표지 없이 제목만 가볍게 나열합니다. */
export function PlannedList({ items, className }: { items: Product[]; className?: string }) {
  if (!items.length) return null;
  return (
    <ul className={cn("grid gap-x-10 sm:grid-cols-2", className)}>
      {items.map((p) => (
        <li key={p.id} className="flex items-baseline justify-between gap-4 border-t border-border py-2.5 text-[14px]">
          <Link href={`/books/${p.slug}`} className="hover:underline">{p.title}</Link>
          <span className="shrink-0 text-[12px] text-muted-foreground">{levelsText(p.levels)}</span>
        </li>
      ))}
    </ul>
  );
}
