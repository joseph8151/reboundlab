import "server-only";
import { getCatalog, getBundles } from "./products";
import { effectivePrice } from "./types";

export type ConsultOption = { slug: string; title: string; price: number | null; kind: "book" | "package"; id: string };

/** 상담폼 '관심 교재' 선택 목록(교재 + 패키지). 가격은 상품 데이터와 같은 값입니다. */
export async function getConsultOptions(): Promise<ConsultOption[]> {
  const [catalog, bundles] = await Promise.all([getCatalog(), getBundles()]);
  return [
    ...bundles.filter((b) => b.consultable).map((b) => ({ slug: b.slug, title: b.title, price: b.price, kind: "package" as const, id: b.id })),
    ...catalog.filter((p) => p.consultable).map((p) => ({ slug: p.slug, title: p.title, price: effectivePrice(p), kind: "book" as const, id: p.id })),
  ];
}
