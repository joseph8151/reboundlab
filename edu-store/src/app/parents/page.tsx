import type { Metadata } from "next";
import { ParentFinder } from "@/components/guide/parent-finder";
import { PageHead } from "@/components/guide/ui";
import { getGuideProducts } from "@/lib/guide-products";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "우리 아이 교재 찾기 · 학부모 교재 추천",
  description: "자녀의 학년, 과목, 학습 고민, 목표, 시험 일정을 알려 주시면 맞는 교재를 안내합니다. 보호자 연락처로 상담합니다.",
  alternates: { canonical: "/parents" },
};

export default async function ParentsPage() {
  const products = await getGuideProducts();
  return (
    <>
      <PageHead eyebrow="FOR PARENTS" title="우리 아이 교재 찾기" lead="자녀의 학년과 학습 고민을 알려 주세요. 학부모님이 이해하기 쉬운 설명과 함께 교재를 안내하고, 보호자 연락처로 상담해 드립니다." />
      <div className="container-page max-w-3xl py-10 md:py-14"><ParentFinder products={products} /></div>
    </>
  );
}
