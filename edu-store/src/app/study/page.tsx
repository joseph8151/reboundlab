import type { Metadata } from "next";
import Link from "next/link";
import { SuneungDday } from "@/components/study/suneung-dday";
import { isAiConfigured } from "@/lib/ai";
import { STUDY_TOOLS } from "@/lib/study/tools";

const description = "영어 단어 학습, 독해 속도 훈련, 지문 구조 분석, 오답노트, 공부 시간 기록, 학습 플래너, 학습 리포트. 멜리사 에듀의 무료 학습 도구를 회원가입 없이 이용할 수 있습니다.";

export const metadata: Metadata = {
  title: "무료 학습 도구",
  description,
  alternates: { canonical: "/study" },
  openGraph: { title: "무료 학습 도구", description, url: "/study" },
};

const GROUPS = [
  { tag: ["영어", "AI"], title: "영어 트레이닝", lead: "수능 영어를 위한 어휘, 독해 속도, 지문 구조 훈련." },
  { tag: ["자기주도"], title: "학습 관리", lead: "계획하고, 기록하고, 다시 점검하는 도구." },
];

export default function StudyHubPage() {
  const aiOn = isAiConfigured();
  return (
    <div className="container-page py-10 md:py-14">
      <p className="font-display text-[15px] font-semibold tracking-[0.24em] text-muted-foreground">STUDY TOOLS</p>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
        <h1 className="text-[32px] font-bold tracking-[-0.03em] md:text-[44px]">무료 학습 도구</h1>
        <SuneungDday className="font-display text-[22px] font-semibold tracking-[0.12em]" />
      </div>
      <p className="mt-4 max-w-xl text-[15px] leading-[1.8] text-muted-foreground">
        회원가입 없이 바로 쓸 수 있습니다. 기록은 이 브라우저에 저장되고, 로그인하면 계정에도 저장되어 다른 기기에서 이어서 사용할 수 있습니다.
      </p>

      <div className="mt-14 space-y-16">
        {GROUPS.map((g) => (
          <section key={g.title} className="grid gap-6 md:grid-cols-[240px_1fr] md:gap-16">
            <div>
              <h2 className="text-[22px] font-bold tracking-[-0.03em]">{g.title}</h2>
              <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{g.lead}</p>
            </div>
            <ul className="border-t border-foreground/30">
              {STUDY_TOOLS.filter((t) => (g.tag as readonly string[]).includes(t.tag)).map((t, i) => (
                <li key={t.href} className="border-b border-border">
                  <Link href={t.href} className="group grid grid-cols-[32px_1fr_auto] items-baseline gap-4 py-5 transition-colors hover:bg-sage/50 md:px-3">
                    <span className="font-display text-[15px] text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
                    <span>
                      <span className="block text-[17px] font-semibold">{t.title}{t.tag === "AI" && <span className="ml-2 align-middle text-[11px] font-medium text-muted-foreground">{aiOn ? "사이트 내 분석 연결됨" : "외부 GPT 연결"}</span>}</span>
                      <span className="mt-1 block max-w-xl text-[13px] leading-[1.7] text-muted-foreground">{t.desc}</span>
                    </span>
                    <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
