import { areaLabel, kindLabel, levelsText } from "./catalog";
import { siteConfig } from "./site";
import { effectivePrice, type Bundle, type Product } from "./types";

export const absolute = (path: string) => `${siteConfig.url}${path}`;

/** 설명이 비어 있는 교재(출시 예정)를 위한 기본 문장. 사실만 담습니다. */
export function productDescription(p: Product) {
  if (p.seoDescription) return p.seoDescription;
  if (p.summary) return p.summary;
  const base = [levelsText(p.levels), areaLabel(p.area), kindLabel(p.kind)].filter(Boolean).join(" ");
  return `${p.title}. ${base} 교재입니다. 출시 일정과 상세 구성은 확정되는 대로 안내합니다.`;
}

/**
 * 검색 노출 대상: 판매 중이거나, 설명과 가격이 갖춰진 우선 출시 교재만 색인합니다.
 * 설명이 거의 없는 출시 예정 교재는 얇은 페이지가 되지 않도록 noindex 처리합니다.
 */
export function isIndexable(p: Product) {
  if (p.status === "on_sale") return true;
  return p.status === "coming_soon" && p.featuredRank !== null && p.description.length >= 120;
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: absolute(it.path) })),
  };
}

export function productJsonLd(p: Product) {
  const price = effectivePrice(p);
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.title,
    description: productDescription(p),
    sku: p.sku || undefined,
    category: `${areaLabel(p.area)} ${kindLabel(p.kind)}`,
    brand: { "@type": "Brand", name: siteConfig.nameEn },
    image: p.coverUrl ?? undefined,
    // 판매 중이고 가격이 있을 때만 Offer를 노출합니다.
    ...(p.status === "on_sale" && price !== null
      ? { offers: { "@type": "Offer", price, priceCurrency: "KRW", availability: "https://schema.org/InStock", url: absolute(`/books/${p.slug}`) } }
      : {}),
  };
}

export function bundleJsonLd(b: Bundle) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: b.title,
    description: b.seoDescription || b.summary,
    brand: { "@type": "Brand", name: siteConfig.nameEn },
    ...(b.purchasable && b.price !== null
      ? { offers: { "@type": "Offer", price: b.price, priceCurrency: "KRW", availability: "https://schema.org/InStock", url: absolute(`/packages/${b.slug}`) } }
      : {}),
  };
}

export const jsonLd = (data: unknown) => ({ __html: JSON.stringify(data).replace(/</g, "\\u003c") });
