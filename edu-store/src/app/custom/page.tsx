import type { Metadata } from "next";
import { CustomBook } from "@/components/guide/custom-book";
import { PageHead } from "@/components/guide/ui";

export const metadata: Metadata = {
  title: "MELISA CUSTOM BOOK · 나만의 문제집 구성 상담",
  description: "필요한 단원과 유형만 선택해 나만의 학습 구성을 상담받으세요. 제작 가능 여부와 가격, 납품 일정은 상담으로 안내합니다.",
  alternates: { canonical: "/custom" },
};

export default function CustomPage() {
  return (
    <>
      <PageHead eyebrow="MELISA CUSTOM BOOK" title="나만의 문제집 구성 상담" lead="필요한 단원과 유형만 선택해 나만의 학습 구성을 상담받으세요. 원하는 단원과 유형을 선택해 보세요." />
      <div className="container-page max-w-5xl py-10 md:py-14"><CustomBook /></div>
    </>
  );
}
