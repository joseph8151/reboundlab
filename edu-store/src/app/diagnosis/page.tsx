import type { Metadata } from "next";
import { Diagnosis } from "@/components/guide/diagnosis";
import { PageHead } from "@/components/guide/ui";
import { getGuideProducts } from "@/lib/guide-products";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "3분 학습 진단",
  description: "학년, 과목, 성적대, 어려운 유형을 선택하면 보완할 영역과 추천 교재 3권을 안내합니다. 회원가입 없이 이용할 수 있습니다.",
  alternates: { canonical: "/diagnosis" },
};

export default async function DiagnosisPage() {
  const products = await getGuideProducts();
  return (
    <>
      <PageHead eyebrow="3-MINUTE CHECK" title="3분 학습 진단" lead="여섯 가지 질문에 답하면 보완할 영역과 추천 교재를 안내합니다. 회원가입은 필요 없고, 입력한 내용은 상담을 신청할 때에만 전달됩니다." />
      <div className="container-page max-w-3xl py-10 md:py-14"><Diagnosis products={products} /></div>
    </>
  );
}
