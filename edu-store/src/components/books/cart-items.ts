import type { Product } from "@/lib/types";

export type ResolvedItem =
  | { slug: string; missing: true }
  | (Pick<Product, "slug" | "title" | "series" | "area" | "levels" | "course" | "kind" | "curriculum" | "examYear" | "coverUrl" | "price" | "salePrice" | "status" | "purchasable"> & { unit: number | null; missing?: false });

export async function resolveSlugs(slugs: string[]): Promise<ResolvedItem[]> {
  if (!slugs.length) return [];
  const res = await fetch("/api/cart/resolve", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ slugs }) });
  if (!res.ok) throw new Error("교재 정보를 불러오지 못했습니다.");
  return (await res.json()).items as ResolvedItem[];
}
