import type { MetadataRoute } from "next";
import { getProducts } from "@/lib/products";
import { siteConfig } from "@/lib/site";
import { PASSAGES } from "@/lib/study/passages";
import { STUDY_TOOLS } from "@/lib/study/tools";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getProducts();
  const staticPages = ["", "/products", "/consult", "/faq", "/refund", "/terms", "/privacy"].map((path) => ({
    url: `${siteConfig.url}${path}`,
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.6,
  }));
  const studyPages = ["/study", ...STUDY_TOOLS.map((t) => t.href), ...PASSAGES.map((p) => `/study/speed-reading/${p.id}`)].map((path) => ({
    url: `${siteConfig.url}${path}`,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));
  return [
    ...staticPages,
    ...studyPages,
    ...products.map((p) => ({
      url: `${siteConfig.url}/products/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
