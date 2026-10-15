import type { MetadataRoute } from "next";
import { CATEGORIES } from "@/lib/categories";
import { getBundles, getCatalog } from "@/lib/products";
import { isIndexable } from "@/lib/seo";
import { siteConfig } from "@/lib/site";
import { PASSAGES } from "@/lib/study/passages";
import { STUDY_TOOLS } from "@/lib/study/tools";

export const dynamic = "force-dynamic";

/** 색인 대상만 포함합니다: 판매 중이거나 설명이 갖춰진 교재, 판매 중 패키지. 출시 예정 교재 대부분은 제외됩니다. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [catalog, bundles] = await Promise.all([getCatalog(), getBundles()]);
  const at = (path: string, priority: number, changeFrequency: "daily" | "weekly" | "monthly", lastModified?: string) => ({
    url: `${siteConfig.url}${path}`, priority, changeFrequency, ...(lastModified ? { lastModified } : {}),
  });
  return [
    at("", 1, "weekly"),
    at("/books", 0.9, "daily"),
    ...CATEGORIES.map((c) => at(`/category/${c.slug}`, c.parent ? 0.7 : 0.8, "weekly")),
    at("/packages", 0.6, "weekly"),
    ...catalog.filter(isIndexable).map((p) => at(`/books/${p.slug}`, p.status === "on_sale" ? 0.8 : 0.5, "monthly", p.updatedAt)),
    ...bundles.filter((b) => b.status === "on_sale").map((b) => at(`/packages/${b.slug}`, 0.6, "monthly")),
    at("/study", 0.6, "monthly"),
    ...STUDY_TOOLS.map((t) => at(t.href, 0.5, "monthly")),
    ...PASSAGES.map((p) => at(`/study/speed-reading/${p.id}`, 0.4, "monthly")),
    at("/support", 0.4, "monthly"),
    at("/faq", 0.4, "monthly"),
    at("/consult", 0.4, "monthly"),
    at("/refund", 0.3, "monthly"),
    at("/terms", 0.2, "monthly"),
    at("/privacy", 0.2, "monthly"),
  ];
}
