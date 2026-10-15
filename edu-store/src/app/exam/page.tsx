import type { Metadata } from "next";
import { ExamPlanner } from "@/components/guide/exam-planner";
import { PageHead } from "@/components/guide/ui";
import { getGuideProducts } from "@/lib/guide-products";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "시험이 얼마 남지 않았다면 · 시험 D-DAY 학습 설계",
  description: "시험 날짜를 입력하면 남은 일수를 계산하고, D-30·D-14·D-7·D-3 단계에 맞는 공부 방향과 교재, 매일 체크리스트를 보여 드립니다.",
  alternates: { canonical: "/exam" },
};

export default async function ExamPage() {
  const products = await getGuideProducts();
  return (
    <>
      <PageHead eyebrow="EXAM D-DAY" title="시험이 얼마 남지 않았다면" lead="시험 날짜를 고르면 남은 기간에 맞는 공부 방향과 쓸 수 있는 교재, 매일 체크리스트를 보여 드립니다." />
      <div className="container-page max-w-3xl py-10 md:py-14"><ExamPlanner products={products} /></div>
    </>
  );
}
