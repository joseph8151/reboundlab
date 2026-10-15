import type { Metadata } from "next";
import Link from "next/link";
import { PageHead, primaryBtn } from "@/components/guide/ui";

export const metadata: Metadata = {
  title: "학원 및 교육기관 교재 문의",
  description: "수업용 문제집, 단원별 문제지, 내신 대비 자료, 서술형 문제집, 맞춤형 PDF 교재와 단체 이용·라이선스 상담을 안내합니다.",
  alternates: { canonical: "/academy" },
};

const SERVICES = [
  ["수업용 문제집", "수업 진도에 맞춘 문제집 구성"], ["단원별 문제지", "단원·유형 단위로 나눈 문제지"], ["내신 대비 자료", "학교 시험 대비 자료"],
  ["서술형 문제집", "서술형·논술형 집중 훈련"], ["시험 대비 모의고사", "시험 직전 실전 점검"], ["맞춤형 PDF 교재", "기관에 맞춘 구성 제작 상담"], ["단체 이용·라이선스 상담", "이용 규모와 조건은 개별 상담"],
];

export default function AcademyPage() {
  return (
    <>
      <PageHead eyebrow="FOR INSTITUTIONS" title="학원 및 교육기관 교재 문의" lead="수업에 쓰는 교재와 자료를 상담해 드립니다. 단체 가격과 이용 조건은 확정된 표가 없으며, 규모와 구성에 따라 개별 상담으로 안내합니다." />
      <div className="container-page max-w-3xl py-10 md:py-14">
        <ul className="border-t border-foreground/30">
          {SERVICES.map(([t, d]) => <li key={t} className="grid gap-1 border-b border-border py-4 sm:grid-cols-[14rem_1fr]"><span className="font-semibold">{t}</span><span className="text-[14px] text-muted-foreground">{d}</span></li>)}
        </ul>
        <p className="mt-8 text-[14px] leading-relaxed text-foreground/80">문의 양식에는 학원명, 담당자명, 연락처, 과목, 대상 학년, 예상 이용 규모를 남겨 주시면 됩니다. 개인 구매 상담과 구분되어 접수됩니다.</p>
        <div className="mt-6"><Link href="/consult?type=academy" data-consult-button className={primaryBtn}>학원·기관 교재 문의하기</Link></div>
      </div>
    </>
  );
}
