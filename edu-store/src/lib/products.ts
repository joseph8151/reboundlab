import "server-only";
import { cache } from "react";
import {
  AREAS, DIFFICULTIES, KINDS, LEVEL_GROUPS, LEVELS, PRICE_BANDS,
  type AreaId, type CurriculumId, type DifficultyId, type KindId, type LevelGroupId, type PriceBandId, type StatusId,
} from "./catalog";
import { SEED_PRODUCTS, PRIORITY_PRODUCTS, type SeedProduct } from "./catalog-plan";
import { createAdminClient, createPublicClient } from "./supabase/admin";
import { isSupabaseConfigured } from "./supabase/env";
import { effectivePrice, rowToProduct, type Bundle, type BundleRow, type Product, type ProductRow } from "./types";

export type SortId = "recommended" | "latest" | "price-asc" | "price-desc" | "title" | "popular";

export type ProductFilters = {
  q?: string;
  /** 중등/고1/고2/고3/수능 묶음 id 또는 중1~중3 같은 개별 학년 id */
  level?: string;
  area?: AreaId;
  kind?: KindId;
  difficulty?: DifficultyId;
  price?: PriceBandId;
  examYear?: number;
  curriculum?: CurriculumId;
  /** 'on_sale' 판매 중 / 'coming_soon' 출시 예정 / 'all' 전체 */
  status?: "on_sale" | "coming_soon" | "all";
  scope?: "csat" | "high-school" | "middle-school";
  course?: string;
  sort?: SortId;
  page?: number;
};

export const PAGE_SIZE = 24;

// ── 상품 목록 로드 ─────────────────────────────────────────
const COLUMNS =
  "id, sku, slug, title, series, summary, description, track, area, course, grades, kind, difficulty, curriculum, exam_year, page_count, question_count, price, sale_price, cover_url, toc, goals, targets, includes, preview_pdf_url, sample_images, answer_mode, has_file, has_answer_file, edition, revision_notes, release_date, status, featured_rank, seo_title, seo_description, keywords, created_at, updated_at";

/** 데모 모드(Supabase 미연결): 우선 출시 6종만 구매 UI를 확인할 수 있도록 '판매 중'으로 보이고, 나머지는 출시 예정입니다. */
function seedToRow(p: SeedProduct, index: number): ProductRow {
  const demoSellable = PRIORITY_PRODUCTS.some((x) => x.slug === p.slug);
  const created = new Date(Date.UTC(2026, 9, 1) + (SEED_PRODUCTS.length - index) * 3600_000).toISOString();
  return {
    id: `seed-${p.sku || p.slug}`,
    sku: p.sku,
    slug: p.slug,
    title: p.title,
    series: p.series ?? null,
    summary: p.summary,
    description: p.description ?? "",
    track: p.track,
    area: p.area,
    course: p.course ?? null,
    grades: p.levels,
    kind: p.kind,
    difficulty: p.difficulty ?? null,
    curriculum: null,
    exam_year: null,
    page_count: null,
    question_count: p.questionCount ?? null,
    price: p.price ?? null,
    sale_price: null,
    cover_url: null,
    toc: [],
    goals: p.goals ?? [],
    targets: [],
    includes: [],
    preview_pdf_url: null,
    sample_images: [],
    answer_mode: "none",
    has_answer_file: false,
    has_file: false,
    edition: null,
    revision_notes: [],
    release_date: null,
    status: demoSellable ? "on_sale" : "coming_soon",
    featured_rank: p.featuredRank ?? null,
    seo_title: p.seoTitle ?? null,
    seo_description: p.seoDescription ?? null,
    keywords: p.keywords ?? [],
    created_at: created,
    updated_at: created,
  };
}

export const getCatalog = cache(async (): Promise<Product[]> => {
  if (!isSupabaseConfigured()) {
    return SEED_PRODUCTS.map((p, i) => rowToProduct(seedToRow(p, i), { demo: true }));
  }
  const { data, error } = await createPublicClient().from("products").select(COLUMNS).neq("status", "discontinued");
  if (error) {
    console.error("[products] 목록 조회 실패", error.message);
    return [];
  }
  return (data as unknown as ProductRow[]).map((r) => rowToProduct(r));
});

// ── 검색어 해석: "고1 수학 변형" → 학년=고1, 과목=수학, 유형=변형문제 ──
type Keyword = { word: string; apply: (f: ProductFilters) => void };
const KEYWORDS: Keyword[] = ([
  ...LEVELS.map((l) => ({ word: l.label, apply: (f: ProductFilters) => void (f.level = l.id) })),
  { word: "중등", apply: (f) => void (f.level = "middle") },
  { word: "중학교", apply: (f) => void (f.level = "middle") },
  { word: "고등", apply: (f) => void (f.scope = "high-school") },
  ...AREAS.filter((a) => a.id !== "common").map((a) => ({ word: a.label, apply: (f: ProductFilters) => void (f.area = a.id) })),
  { word: "사탐", apply: (f) => void (f.area = "social") },
  { word: "과탐", apply: (f) => void (f.area = "science") },
  { word: "기출문제집", apply: (f) => void (f.kind = "past-exam") },
  { word: "기출", apply: (f) => void (f.kind = "past-exam") },
  { word: "변형문제", apply: (f) => void (f.kind = "variant") },
  { word: "변형", apply: (f) => void (f.kind = "variant") },
  { word: "모의고사", apply: (f) => void (f.kind = "mock") },
  ...KINDS.map((k) => ({ word: k.label, apply: (f: ProductFilters) => void (f.kind = k.id) })),
] as Keyword[]).sort((a, b) => b.word.length - a.word.length);

export function parseSearchQuery(raw: string): { filters: ProductFilters; terms: string[] } {
  const filters: ProductFilters = {};
  const terms: string[] = [];
  for (let token of raw.trim().toLowerCase().split(/\s+/).filter(Boolean)) {
    // "고1수학"처럼 붙여 쓴 경우 앞에서부터 알려진 낱말을 떼어 냅니다.
    let progressed = true;
    while (token && progressed) {
      progressed = false;
      for (const k of KEYWORDS) {
        if (token.startsWith(k.word.toLowerCase())) {
          k.apply(filters);
          token = token.slice(k.word.length);
          progressed = true;
          break;
        }
      }
    }
    if (token) terms.push(token);
  }
  return { filters, terms };
}

const squash = (s: string) => s.toLowerCase().replace(/[\s·\-_.,]/g, "");

function haystack(p: Product) {
  return squash([p.title, p.series, p.course, p.summary, p.keywords.join(" "), p.sku].filter(Boolean).join(" "));
}

const levelMatches = (p: Product, level: string) => {
  const group = LEVEL_GROUPS.find((g) => g.id === level);
  return group ? p.levels.some((l) => group.members.includes(l)) : p.levels.includes(level as never);
};

export function applyFilters(list: Product[], input: ProductFilters): Product[] {
  const parsed = input.q ? parseSearchQuery(input.q) : { filters: {} as ProductFilters, terms: [] as string[] };
  const f: ProductFilters = { ...parsed.filters, ...stripUndefined(input) };
  const status = f.status ?? "on_sale";
  const band = f.price ? PRICE_BANDS.find((b) => b.id === f.price) : undefined;

  return list.filter((p) => {
    if (status === "on_sale" && p.status !== "on_sale") return false;
    if (status === "coming_soon" && p.status !== "coming_soon") return false;
    if (status === "all" && p.status === "discontinued") return false;
    if (f.scope === "csat" && p.track !== "csat") return false;
    if (f.scope === "high-school" && !(p.track === "school" && p.levels.some((l) => l.startsWith("high")))) return false;
    if (f.scope === "middle-school" && !(p.track === "school" && p.levels.some((l) => l.startsWith("middle")))) return false;
    if (f.level && !levelMatches(p, f.level)) return false;
    if (f.area && p.area !== f.area) return false;
    if (f.kind && p.kind !== f.kind) return false;
    if (f.difficulty && p.difficulty !== f.difficulty) return false;
    if (f.curriculum && p.curriculum !== f.curriculum) return false;
    if (f.examYear && p.examYear !== f.examYear) return false;
    if (f.course && p.course !== f.course) return false;
    if (band) {
      const price = effectivePrice(p);
      if (price === null || price < band.min || price > band.max) return false;
    }
    if (parsed.terms.length) {
      const hay = haystack(p);
      if (!parsed.terms.every((t) => hay.includes(squash(t)))) return false;
    }
    return true;
  });
}

function stripUndefined<T extends object>(o: T): T {
  return Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined && v !== "")) as T;
}

export function sortProducts(list: Product[], sort: SortId = "recommended", popularity?: Map<string, number>): Product[] {
  const out = [...list];
  const priceOf = (p: Product) => effectivePrice(p);
  const byLatest = (a: Product, b: Product) => (b.releaseDate ?? b.createdAt).localeCompare(a.releaseDate ?? a.createdAt);
  switch (sort) {
    case "latest":
      return out.sort(byLatest);
    case "price-asc":
      return out.sort((a, b) => (priceOf(a) ?? Infinity) - (priceOf(b) ?? Infinity));
    case "price-desc":
      return out.sort((a, b) => (priceOf(b) ?? -1) - (priceOf(a) ?? -1));
    case "title":
      return out.sort((a, b) => a.title.localeCompare(b.title, "ko"));
    case "popular":
      return out.sort((a, b) => (popularity?.get(b.id) ?? 0) - (popularity?.get(a.id) ?? 0) || byLatest(a, b));
    default:
      return out.sort(
        (a, b) =>
          (a.featuredRank ?? 999) - (b.featuredRank ?? 999) ||
          Number(b.status === "on_sale") - Number(a.status === "on_sale") ||
          byLatest(a, b),
      );
  }
}

/** 인기순은 실제 결제 완료 건수가 있을 때만 제공합니다. */
export const getPopularity = cache(async (): Promise<Map<string, number> | null> => {
  if (!isSupabaseConfigured()) return null;
  try {
    const { data } = await createAdminClient()
      .from("order_items")
      .select("product_id, orders!inner(status)")
      .eq("orders.status", "paid")
      .limit(5000);
    if (!data?.length) return null;
    const map = new Map<string, number>();
    data.forEach((r) => map.set(r.product_id, (map.get(r.product_id) ?? 0) + 1));
    return map;
  } catch {
    return null;
  }
});

export async function getProducts(filters: ProductFilters = {}) {
  const all = await getCatalog();
  const popularity = filters.sort === "popular" ? await getPopularity() : undefined;
  const sorted = sortProducts(applyFilters(all, filters), popularity ? "popular" : filters.sort === "popular" ? "recommended" : filters.sort, popularity ?? undefined);
  const page = Math.max(1, filters.page ?? 1);
  return { items: sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), total: sorted.length, page, pageSize: PAGE_SIZE };
}

/** 첫 화면 대표 교재: 운영자가 지정한 노출 순서(featuredRank)를 따릅니다. */
export async function getFeatured(limit = 6) {
  return sortProducts((await getCatalog()).filter((p) => p.featuredRank !== null), "recommended").slice(0, limit);
}

export async function getNewest(limit = 6) {
  return sortProducts((await getCatalog()).filter((p) => p.status === "on_sale"), "latest").slice(0, limit);
}

export const getProductBySlug = cache(async (slug: string): Promise<Product | null> => {
  return (await getCatalog()).find((p) => p.slug === slug) ?? null;
});

/** 관련 교재: 같은 과목·학년을 우선하고, 판매 중인 교재를 먼저 보여 줍니다. */
export async function getRelated(product: Product, limit = 4) {
  const all = (await getCatalog()).filter((p) => p.id !== product.id);
  const score = (p: Product) =>
    (p.series && p.series === product.series ? 4 : 0) +
    (p.area === product.area ? 3 : 0) +
    (p.levels.some((l) => product.levels.includes(l)) ? 2 : 0) +
    (p.track === product.track ? 1 : 0) +
    (p.status === "on_sale" ? 2 : 0);
  return all
    .map((p) => ({ p, s: score(p) }))
    .filter((x) => x.s >= 4)
    .sort((a, b) => b.s - a.s || (a.p.featuredRank ?? 999) - (b.p.featuredRank ?? 999))
    .slice(0, limit)
    .map((x) => x.p);
}

// ── 패키지 ─────────────────────────────────────────────────
export function assembleBundle(row: BundleRow, catalog: Product[]): Bundle {
  const byId = new Map(catalog.map((p) => [p.id, p]));
  const ordered = [...(row.bundle_items ?? [])].sort((a, b) => a.position - b.position);
  const items = ordered.map((i) => byId.get(i.product_id)).filter((p): p is Product => Boolean(p));
  const prices = items.map(effectivePrice);
  const listTotal = items.length && prices.every((p) => p !== null) ? (prices as number[]).reduce((a, b) => a + b, 0) : null;
  const pages = items.map((p) => p.pageCount);
  const discount = listTotal !== null && row.price !== null && row.price < listTotal ? listTotal - row.price : null;
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    description: row.description,
    track: row.track,
    price: row.price,
    status: row.status,
    releaseDate: row.release_date,
    seoTitle: row.seo_title,
    seoDescription: row.seo_description,
    itemIds: items.map((p) => p.id),
    items,
    listTotal,
    discount,
    totalPages: items.length && pages.every((n) => n !== null) ? (pages as number[]).reduce((a, b) => a + b, 0) : null,
    // 모든 구성 교재가 지금 구매 가능할 때만 패키지를 판매합니다.
    purchasable: row.status === "on_sale" && row.price !== null && items.length >= 2 && items.every((p) => p.purchasable),
  };
}

export const getBundles = cache(async (): Promise<Bundle[]> => {
  const catalog = await getCatalog();
  if (!isSupabaseConfigured()) {
    const { PLANNED_PACKAGES } = await import("./catalog-plan");
    return PLANNED_PACKAGES.map((b) =>
      assembleBundle(
        { id: `seed-${b.slug}`, slug: b.slug, title: b.title, summary: "구성 교재와 가격은 교재 출시 후 확정됩니다.", description: "", track: b.track, price: null, status: "coming_soon", release_date: null, seo_title: null, seo_description: null, bundle_items: [] },
        catalog,
      ),
    );
  }
  const { data, error } = await createPublicClient()
    .from("bundles")
    .select("id, slug, title, summary, description, track, price, status, release_date, seo_title, seo_description, bundle_items(product_id, position)")
    .neq("status", "discontinued");
  if (error) {
    console.error("[bundles] 조회 실패", error.message);
    return [];
  }
  return (data as unknown as BundleRow[]).map((r) => assembleBundle(r, catalog));
});

export async function getBundleBySlug(slug: string) {
  return (await getBundles()).find((b) => b.slug === slug) ?? null;
}

export const FACETS = { LEVEL_GROUPS, AREAS, KINDS, DIFFICULTIES, PRICE_BANDS };
export type { LevelGroupId, StatusId };
