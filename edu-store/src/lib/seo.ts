import { areaLabel, kindLabel, levelsText } from "./catalog";
import { siteConfig } from "./site";
import { effectivePrice, type Bundle, type Product } from "./types";

export const absolute = (path: string) => `${siteConfig.url}${path}`;

/** 설명이 비어 있는 교재를 위한 기본 문장. 사실만 담습니다. */
export function productDescription(p: Product) {
  if (p.seoDescription) return p.seoDescription;
  if (p.summary) return p.summary;
  const base = [levelsText(p.levels), areaLabel(p.area), kindLabel(p.kind)].filter(Boolean).join(" ");
  return `${p.title}. ${base} 교재입니다. 상담 후 계좌이체로 구매하며 PDF로 전달됩니다.`;
}

/** 검색 노출 대상: 상담 가능한(판매 중, 가격 등록) 교재. */
export function isIndexable(p: Product) {
  return p.consultable;
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
      ? { offers: { "@type": "Offer", price, priceCurrency: "KRW", availability: p.deliveryType === "ready" ? "https://schema.org/InStock" : "https://schema.org/PreOrder", url: absolute(`/books/${p.slug}`) } }
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
    ...(b.consultable && b.price !== null
      ? { offers: { "@type": "Offer", price: b.price, priceCurrency: "KRW", availability: b.deliveryType === "ready" ? "https://schema.org/InStock" : "https://schema.org/PreOrder", url: absolute(`/packages/${b.slug}`) } }
      : {}),
  };
}

export const jsonLd = (data: unknown) => ({ __html: JSON.stringify(data).replace(/</g, "\\u003c") });
