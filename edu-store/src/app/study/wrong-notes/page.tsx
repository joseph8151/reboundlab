import type { Metadata } from "next";
import { StudyHeader } from "@/components/study/study-header";
import { WrongNotes } from "@/components/study/wrong-notes";

const description = "틀린 문제를 기록하고 틀린 이유를 5가지로 분류합니다. 1일·3일·7일·14일 간격으로 다시 풀 문제를 알려 주는 간격 복습 오답노트입니다.";

export const metadata: Metadata = {
  title: "오답노트 & 간격 복습",
  description,
  alternates: { canonical: "/study/wrong-notes" },
  openGraph: { title: "오답노트 & 간격 복습", description, url: "/study/wrong-notes" },
};

export default function WrongNotesPage() {
  return (
    <div className="container-page max-w-3xl py-10 sm:py-14">
      <StudyHeader eyebrow="오답노트" title="모르는 문제가 없어질 때까지, 오답노트" description={description} />
      <WrongNotes />
    </div>
  );
}
