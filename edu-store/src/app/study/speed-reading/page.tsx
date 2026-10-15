import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { StudyHeader } from "@/components/study/study-header";
import { Badge } from "@/components/ui/badge";
import { PASSAGES, TARGET_WPM, wordCount } from "@/lib/study/passages";
import { structureName } from "@/lib/study/structures";

const description = "수능형 영어 지문으로 읽기 속도(WPM)를 측정하고, 의미 단위 끊어 읽기 페이서로 목표 속도에 맞춰 읽는 연습을 합니다. 읽은 뒤 요지·세부 문제로 이해도까지 확인하세요.";

export const metadata: Metadata = {
  title: "수능 영어 지문 속독 훈련",
  description,
  alternates: { canonical: "/study/speed-reading" },
  openGraph: { title: "수능 영어 지문 속독 훈련", description, url: "/study/speed-reading" },
};

export default function SpeedReadingListPage() {
  return (
    <div className="container-page max-w-4xl py-10 sm:py-14">
      <StudyHeader eyebrow="지문 속독" title="수능 영어 지문 속독 훈련" description={description} />

      <div className="grid gap-4 rounded-2xl bg-accent p-6 sm:grid-cols-3">
        <div>
          <p className="text-xs font-semibold text-primary">왜 {TARGET_WPM} WPM인가요?</p>
          <p className="mt-1 text-sm leading-relaxed">듣기를 빼면 독해 28문항에 쓸 시간은 약 45분. 지문을 읽는 데만 시간을 다 쓰지 않으려면 분당 150단어 이상이 필요합니다.</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-primary">끊어 읽기</p>
          <p className="mt-1 text-sm leading-relaxed">문장을 의미 단위로 나눠 앞에서부터 이해합니다. 뒤로 돌아가 다시 읽는 습관이 속도를 가장 크게 떨어뜨립니다.</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-primary">구조와 함께</p>
          <p className="mt-1 text-sm leading-relaxed">지문마다 전개 구조가 표시되어 있어요. <Link href="/study/structures" className="underline">지문 구조 10가지</Link>를 먼저 보면 더 빨라집니다.</p>
        </div>
      </div>

      <ul className="mt-8 space-y-3">
        {PASSAGES.map((p, i) => (
          <li key={p.id}>
            <Link href={`/study/speed-reading/${p.id}`} className="group flex items-center gap-4 rounded-2xl border border-border p-5 transition-colors hover:border-primary/40">
              <span className="text-sm font-bold text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap gap-1.5">
                  <Badge variant={p.level === "심화" ? "solid" : p.level === "표준" ? "default" : "muted"}>{p.level}</Badge>
                  <Badge variant="outline">{structureName(p.structure)}</Badge>
                </span>
                <span className="mt-2 block font-semibold">{p.title}</span>
                <span className="text-sm text-muted-foreground">{wordCount(p.text)}단어 · 문제 {p.questions.length}개</span>
              </span>
              <ArrowRight className="size-5 text-muted-foreground group-hover:text-primary" />
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
        모든 지문은 수능 독해 형식을 참고해 새로 쓴 창작 지문입니다. 실제 기출 지문은 판매용 자료에서 출처를 표기해 제공합니다.
      </p>
    </div>
  );
}
