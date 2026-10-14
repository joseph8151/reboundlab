import type { MetadataRoute } from "next";
import { getProducts } from "@/lib/products";
import { siteConfig } from "@/lib/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getProducts();
  const staticPages = ["", "/products", "/faq", "/refund", "/terms", "/privacy"].map((path) => ({
    url: `${siteConfig.url}${path}`,
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.6,
  }));
  return [
    ...staticPages,
    ...products.map((p) => ({
      url: `${siteConfig.url}/products/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
