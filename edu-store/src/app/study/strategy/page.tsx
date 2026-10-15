import type { Metadata } from "next";
import Link from "next/link";
import { SectionTimer } from "@/components/study/section-timer";
import { StudyHeader } from "@/components/study/study-header";
import { STRATEGY_PRINCIPLES, TIME_BLOCKS } from "@/lib/study/strategy";

const description = "수능 영어 독해 28문항을 45분 안에 푸는 시간 배분과 풀이 순서. 유형별 목표 시간과 시간을 줄이는 요령, 실전 구간 타이머를 제공합니다.";

export const metadata: Metadata = {
  title: "수능 영어 시간 단축 풀이 전략",
  description,
  alternates: { canonical: "/study/strategy" },
  openGraph: { title: "수능 영어 시간 단축 풀이 전략", description, url: "/study/strategy" },
};

export default function StrategyPage() {
  const total = TIME_BLOCKS.reduce((a, b) => a + b.minutes, 0);
  return (
    <div className="container-page max-w-4xl py-10 sm:py-14">
      <StudyHeader eyebrow="시간 단축 전략" title="수능 영어, 독해 45분 시간 배분" description={description} />

      <div className="grid gap-3 sm:grid-cols-3">
        {[["시험 시간", "70분 · 45문항"], ["듣기 (1~17번)", "약 25분"], ["독해 (18~45번)", `목표 ${total}분 + 마킹 5분`]].map(([k, v]) => (
          <div key={k} className="rounded-2xl bg-muted p-4"><p className="text-xs text-muted-foreground">{k}</p><p className="mt-1 text-lg font-bold">{v}</p></div>
        ))}
      </div>

      <h2 className="mt-12 text-xl font-bold">푸는 순서와 블록별 목표 시간</h2>
      <p className="mt-2 text-sm text-muted-foreground">문항 번호 순서가 아니라, 점수를 빨리 확보할 수 있는 순서로 풉니다.</p>
      <ol className="mt-5 space-y-3">
        {TIME_BLOCKS.map((b, i) => (
          <li key={b.range} className="grid grid-cols-[2.5rem_1fr] gap-3 rounded-2xl border border-border p-4 sm:grid-cols-[2.5rem_8rem_1fr_4rem] sm:items-center">
            <span className="flex size-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">{i + 1}</span>
            <div>
              <p className="font-bold">{b.range}번</p>
              <p className="text-xs text-muted-foreground sm:hidden">{b.types} · {b.minutes}분</p>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <p className="hidden text-sm font-semibold sm:block">{b.types}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{b.tip}</p>
            </div>
            <p className="hidden text-right text-lg font-bold text-primary sm:block">{b.minutes}분</p>
          </li>
        ))}
      </ol>

      <h2 className="mt-12 text-xl font-bold">시간을 줄이는 4가지 원칙</h2>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {STRATEGY_PRINCIPLES.map((p) => (
          <div key={p.title} className="rounded-2xl border border-border p-5">
            <p className="font-bold">{p.title}</p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-12"><SectionTimer /></div>

      <p className="mt-8 text-sm text-muted-foreground">
        시간 배분은 읽기 속도가 받쳐 줘야 지킬 수 있어요. <Link href="/study/speed-reading" className="text-primary underline">속독 훈련</Link>으로 150 WPM을 먼저 만들고,{" "}
        <Link href="/study/structures" className="text-primary underline">지문 구조</Link>로 읽을 곳과 훑을 곳을 구분해 보세요.
      </p>
    </div>
  );
}
