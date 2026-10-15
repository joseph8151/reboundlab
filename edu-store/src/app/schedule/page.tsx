import type { Metadata } from "next";
import { PageHead } from "@/components/guide/ui";
import { Schedule } from "@/components/guide/schedule";
import { getGuideProducts } from "@/lib/guide-products";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "학습 일정 만들기", description: "교재 분량과 목표 완료일을 입력하면 하루 학습량을 배분하고 인쇄할 수 있습니다.", alternates: { canonical: "/schedule" } };

export default async function SchedulePage() {
  const products = await getGuideProducts();
  return (
    <>
      <PageHead eyebrow="STUDY SCHEDULE" title="학습 일정 만들기" lead="분량과 목표 완료일을 입력하면 하루 학습량을 나누어 드립니다. 완성한 일정은 인쇄하거나 PDF로 저장할 수 있습니다." />
      <div className="container-page max-w-3xl py-10 md:py-14"><Schedule books={products.map((p) => ({ slug: p.slug, title: p.title, questionCount: p.questionCount }))} /></div>
    </>
  );
}
