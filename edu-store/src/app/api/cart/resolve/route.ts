import { NextResponse, type NextRequest } from "next/server";
import { getCatalog } from "@/lib/products";
import { effectivePrice } from "@/lib/types";

/** 장바구니(브라우저에 저장된 슬러그)를 현재 가격·판매 상태로 해석합니다. 로그인 없이 호출할 수 있고, 파일 정보는 포함하지 않습니다. */
export async function POST(request: NextRequest) {
  const { slugs } = (await request.json().catch(() => ({}))) as { slugs?: unknown };
  const wanted = Array.isArray(slugs) ? [...new Set(slugs.filter((s): s is string => typeof s === "string"))].slice(0, 40) : [];
  const catalog = await getCatalog();
  const items = wanted.map((slug) => {
    const p = catalog.find((c) => c.slug === slug);
    if (!p) return { slug, missing: true as const };
    return {
      slug: p.slug,
      title: p.title,
      series: p.series,
      area: p.area,
      levels: p.levels,
      course: p.course,
      kind: p.kind,
      curriculum: p.curriculum,
      examYear: p.examYear,
      coverUrl: p.coverUrl,
      price: p.price,
      salePrice: p.salePrice,
      unit: effectivePrice(p),
      status: p.status,
      purchasable: p.purchasable,
    };
  });
  return NextResponse.json({ items });
}
