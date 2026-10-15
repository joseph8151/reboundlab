import type { Metadata } from "next";
import Link from "next/link";
import { StudyHeader } from "@/components/study/study-header";
import { Badge } from "@/components/ui/badge";
import { PASSAGES } from "@/lib/study/passages";
import { STRUCTURES } from "@/lib/study/structures";

const description = "수능 영어 독해 지문에서 반복되는 전개 구조 10가지. 구조별 신호어, 주제문 위치, 자주 나오는 유형과 읽는 요령을 정리했습니다.";

export const metadata: Metadata = {
  title: "수능 영어 지문 구조 10가지",
  description,
  alternates: { canonical: "/study/structures" },
  openGraph: { title: "수능 영어 지문 구조 10가지", description, url: "/study/structures" },
};

export default function StructuresPage() {
  return (
    <div className="container-page max-w-4xl py-10 sm:py-14">
      <StudyHeader eyebrow="지문 구조 10" title="수능 영어 지문 구조 10가지" description={description}>
        <p className="mt-4 rounded-xl bg-accent p-4 text-sm leading-relaxed">
          <strong>읽는 순서:</strong> 첫 두 문장으로 구조를 예측 → 신호어에 표시하며 읽기 → 구조가 알려 주는 &lsquo;주제문 자리&rsquo;를 꼼꼼히 → 나머지는 훑어 읽기
        </p>
      </StudyHeader>

      <nav className="-mx-1 mb-8 flex gap-2 overflow-x-auto px-1 pb-1" aria-label="구조 바로가기">
        {STRUCTURES.map((s) => (
          <a key={s.id} href={`#${s.id}`} className="shrink-0 rounded-full border border-border px-3 py-1.5 text-sm hover:border-primary hover:text-primary">{s.no}. {s.name}</a>
        ))}
      </nav>

      <div className="space-y-5">
        {STRUCTURES.map((s) => {
          const practice = PASSAGES.filter((p) => p.structure === s.id);
          return (
            <section key={s.id} id={s.id} className="scroll-mt-24 rounded-2xl border border-border p-5 sm:p-7">
              <p className="text-sm font-bold text-primary">구조 {String(s.no).padStart(2, "0")}</p>
              <h2 className="mt-1 text-xl font-bold">{s.name}</h2>
              <ol className="mt-4 flex flex-wrap items-center gap-2 text-sm">
                {s.flow.map((f, i) => (
                  <li key={f} className="flex items-center gap-2">
                    <span className="rounded-lg bg-muted px-3 py-1.5 font-medium">{f}</span>
                    {i < s.flow.length - 1 && <span className="text-muted-foreground">→</span>}
                  </li>
                ))}
              </ol>
              <p className="mt-4 text-[15px] leading-relaxed">{s.summary}</p>
              <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
                <div>
                  <dt className="font-semibold">신호어</dt>
                  <dd className="mt-2 flex flex-wrap gap-1.5" lang="en">{s.signals.map((g) => <Badge key={g} variant="outline">{g}</Badge>)}</dd>
                </div>
                <div>
                  <dt className="font-semibold">주제문 위치</dt>
                  <dd className="mt-2 text-muted-foreground">{s.mainIdea}</dd>
                </div>
                <div>
                  <dt className="font-semibold">자주 나오는 유형</dt>
                  <dd className="mt-2 text-muted-foreground">{s.types}</dd>
                </div>
                <div>
                  <dt className="font-semibold">읽는 요령</dt>
                  <dd className="mt-2 text-muted-foreground">{s.tip}</dd>
                </div>
              </dl>
              {practice.length > 0 && (
                <p className="mt-5 text-sm">
                  연습 지문:{" "}
                  {practice.map((p, i) => (
                    <span key={p.id}>{i > 0 && ", "}<Link href={`/study/speed-reading/${p.id}`} className="font-semibold text-primary underline-offset-2 hover:underline">{p.title}</Link></span>
                  ))}
                </p>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
