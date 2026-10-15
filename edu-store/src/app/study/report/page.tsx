import type { Metadata } from "next";
import { StudyHeader } from "@/components/study/study-header";
import { StudyReport } from "@/components/study/study-report";

const description = "순공 시간, 영단어 챌린지, 속독, 오답노트, 66일 습관 기록을 한 화면에 모은 주간 학습 리포트입니다. 인쇄하거나 PDF로 저장해 보호자와 공유할 수 있어요.";

export const metadata: Metadata = {
  title: "주간 학습 리포트",
  description,
  alternates: { canonical: "/study/report" },
  openGraph: { title: "주간 학습 리포트", description, url: "/study/report" },
};

export default function ReportPage() {
  return (
    <div className="container-page max-w-4xl py-10 sm:py-14">
      <StudyHeader eyebrow="학습 리포트" title="주간 학습 리포트" description={description} />
      <StudyReport />
    </div>
  );
}
