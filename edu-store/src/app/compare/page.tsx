import type { Metadata } from "next";
import { Compare, type CompareProduct } from "@/components/guide/compare";
import { PageHead } from "@/components/guide/ui";
import { ANSWER_MODES } from "@/lib/catalog";
import { getGuideProducts } from "@/lib/guide-products";
import { getCatalog } from "@/lib/products";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "교재 비교", description: "교재 2~3권을 골라 대상 학년, 난이도, 가격, 학습 목표를 나란히 비교합니다.", alternates: { canonical: "/compare" } };

export default async function ComparePage({ searchParams }: { searchParams: Promise<{ p?: string }> }) {
  const sp = await searchParams;
  const [guide, catalog] = await Promise.all([getGuideProducts(), getCatalog()]);
  const bySlug = new Map(catalog.map((c) => [c.slug, c]));
  const products: CompareProduct[] = guide.map((g) => {
    const c = bySlug.get(g.slug)!;
    return { ...g, goals: c.goals, summary: c.summary, answer: c.hasAnswerFile ? "정답·해설 별도 PDF 제공" : c.answerMode !== "none" ? ANSWER_MODES.find((a) => a.id === c.answerMode)?.label ?? "상담 시 안내" : "제공 여부는 상담 시 안내" };
  });
  return (
    <>
      <PageHead eyebrow="COMPARE" title="교재 비교" lead="교재 2~3권을 골라 나란히 비교해 보세요. 등록되지 않은 항목은 ‘상담 시 안내’로 표시됩니다." />
      <div className="container-page max-w-5xl py-10 md:py-14"><Compare products={products} initial={(sp.p ?? "").split(",").filter(Boolean)} /></div>
    </>
  );
}
