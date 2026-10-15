import "server-only";
import { getCatalog } from "./products";
import { effectivePrice } from "./types";
import type { GuideProduct } from "./guide";

/** 도구 화면에 내려줄 상담 가능 교재 목록(최소 필드). */
export async function getGuideProducts(): Promise<GuideProduct[]> {
  return (await getCatalog())
    .filter((p) => p.consultable)
    .map((p) => ({
      slug: p.slug, title: p.title, price: effectivePrice(p), levels: p.levels, area: p.area, kind: p.kind, difficulty: p.difficulty,
      weakTags: p.weakTags, track: p.track, deliveryType: p.deliveryType, featuredRank: p.featuredRank, questionCount: p.questionCount, pageCount: p.pageCount,
    }));
}
