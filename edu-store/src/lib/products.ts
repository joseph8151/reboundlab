import "server-only";
import { cache } from "react";
import type { GradeId, SubjectId, TypeId } from "./catalog";
import { sampleProducts } from "./sample-products";
import { createPublicClient } from "./supabase/admin";
import { isSupabaseConfigured } from "./supabase/env";
import { rowToProduct, type Product, type ProductRow } from "./types";

export type ProductFilters = {
  subject?: SubjectId;
  grade?: GradeId;
  type?: TypeId;
  q?: string;
  sort?: "recent" | "price-asc" | "price-desc";
};

// file_path는 공개 역할에 SELECT 권한이 없으므로(schema.sql) 여기에 넣지 않습니다.
const PRODUCT_COLUMNS =
  "id, slug, title, summary, description, subject, grades, type, price, page_count, toc, targets, includes, sample_excerpt, thumbnail_url, sample_images, is_featured, is_published, updated_at";

function sortProducts(list: Product[], sort: ProductFilters["sort"]) {
  const sorted = [...list];
  if (sort === "price-asc") sorted.sort((a, b) => a.price - b.price);
  else if (sort === "price-desc") sorted.sort((a, b) => b.price - a.price);
  else sorted.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  return sorted;
}

/** PostgREST 필터 문법을 깨뜨릴 수 있는 문자를 제거합니다. */
function sanitizeQuery(q: string) {
  return q.replace(/[,()%*\\]/g, " ").trim().slice(0, 50);
}

export async function getProducts(filters: ProductFilters = {}): Promise<Product[]> {
  const q = filters.q ? sanitizeQuery(filters.q) : "";

  if (!isSupabaseConfigured()) {
    const keyword = q.toLowerCase();
    const list = sampleProducts.filter(
      (p) =>
        p.isPublished &&
        (!filters.subject || p.subject === filters.subject) &&
        (!filters.grade || p.grades.includes(filters.grade)) &&
        (!filters.type || p.type === filters.type) &&
        (!keyword || `${p.title} ${p.summary}`.toLowerCase().includes(keyword)),
    );
    return sortProducts(list, filters.sort);
  }

  const supabase = createPublicClient();
  let query = supabase.from("products").select(PRODUCT_COLUMNS).eq("is_published", true);
  if (filters.subject) query = query.eq("subject", filters.subject);
  if (filters.grade) query = query.contains("grades", [filters.grade]);
  if (filters.type) query = query.eq("type", filters.type);
  if (q) query = query.or(`title.ilike.%${q}%,summary.ilike.%${q}%`);

  if (filters.sort === "price-asc") query = query.order("price", { ascending: true });
  else if (filters.sort === "price-desc") query = query.order("price", { ascending: false });
  else query = query.order("updated_at", { ascending: false });

  const { data, error } = await query;
  if (error) {
    console.error("[products] 목록 조회 실패", error.message);
    return [];
  }
  return (data as ProductRow[]).map(rowToProduct);
}

export async function getFeaturedProducts(limit = 6): Promise<Product[]> {
  const all = await getProducts();
  const featured = all.filter((p) => p.isFeatured);
  return (featured.length ? featured : all).slice(0, limit);
}

export const getProductBySlug = cache(async (slug: string): Promise<Product | null> => {
  if (!isSupabaseConfigured()) {
    return sampleProducts.find((p) => p.slug === slug && p.isPublished) ?? null;
  }
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_COLUMNS)
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();
  if (error) console.error("[products] 상세 조회 실패", error.message);
  return data ? rowToProduct(data as ProductRow) : null;
});

/** 판매용 정보(파일 경로 등)는 클라이언트로 내려보내지 않도록 공개 필드만 고릅니다. */
export function toPublicProduct(p: Product) {
  const { filePath: _filePath, ...rest } = p;
  return rest;
}
