import type { Metadata } from "next";
import { StudyHeader } from "@/components/study/study-header";
import { StudyTimer } from "@/components/study/study-timer";

const description = "과목별 스톱워치로 실제로 공부한 순공 시간만 기록하고, 요일별·과목별 그래프로 한 주의 공부 균형을 분석합니다.";

export const metadata: Metadata = {
  title: "순공 시간 분석기",
  description,
  alternates: { canonical: "/study/time" },
  openGraph: { title: "순공 시간 분석기", description, url: "/study/time" },
};

export default function StudyTimePage() {
  return (
    <div className="container-page max-w-4xl py-10 sm:py-14">
      <StudyHeader eyebrow="순공 시간" title="순공 시간 분석기" description={description} />
      <StudyTimer />
    </div>
  );
}
