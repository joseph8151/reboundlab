import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PainPoints } from "@/components/study/pain-points";
import { SuneungDday } from "@/components/study/suneung-dday";
import { ToolIcon } from "@/components/study/tool-icon";
import { Badge } from "@/components/ui/badge";
import { STUDY_TOOLS } from "@/lib/study/tools";

const description = "영단어 30일 챌린지, 수능 영어 속독 훈련, 지문 구조 10가지, AI 지문 분석, 66일 습관, 순공 시간 분석, 오답노트까지. 무료로 쓰는 자기주도 학습 도구 모음입니다.";

export const metadata: Metadata = {
  title: "무료 학습 도구",
  description,
  alternates: { canonical: "/study" },
  openGraph: { title: "무료 학습 도구 | 영어 트레이닝 · 자기주도 관리", description, url: "/study" },
};

export default function StudyHubPage() {
  return (
    <>
      <section className="border-b border-border bg-gradient-to-b from-accent/70 to-background">
        <div className="container-page py-14 sm:py-20">
          <SuneungDday className="inline-block rounded-full bg-primary px-3 py-1 text-[13px] font-bold text-primary-foreground" />
          <h1 className="mt-4 text-3xl font-extrabold leading-tight sm:text-4xl">
            혼자 공부하는 힘을 기르는
            <br />
            <span className="text-primary">무료 학습 도구</span>
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            수능 영어 트레이닝부터 습관·시간·오답 관리까지. 회원가입 없이 바로 쓸 수 있고, 로그인하면 기록이 계정에 저장되어 어느 기기에서든 이어서 할 수 있습니다.
          </p>
        </div>
      </section>

      <section className="container-page py-14">
        <h2 className="text-xl font-bold sm:text-2xl">이런 고민, 있나요?</h2>
        <p className="mt-2 text-[15px] text-muted-foreground">고민을 누르면 바로 맞는 도구로 안내해 드려요.</p>
        <div className="mt-6"><PainPoints /></div>
      </section>

      <section className="border-t border-border bg-muted py-14">
        <div className="container-page">
          <h2 className="text-xl font-bold sm:text-2xl">수능 영어 트레이닝</h2>
          <ToolGrid tag="영어" withAi />
          <h2 className="mt-14 text-xl font-bold sm:text-2xl">자기주도 관리 프로그램</h2>
          <p className="mt-2 text-[15px] text-muted-foreground">계획 → 실행 → 기록 → 점검. 관리받지 않아도 스스로 굴러가는 공부 루틴을 만듭니다.</p>
          <ToolGrid tag="자기주도" />
        </div>
      </section>
    </>
  );
}

function ToolGrid({ tag, withAi }: { tag: string; withAi?: boolean }) {
  const tools = STUDY_TOOLS.filter((t) => t.tag === tag || (withAi && t.tag === "AI"));
  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {tools.map((t, i) => (
        <Link key={t.href} href={t.href} className="group flex flex-col rounded-2xl border border-border bg-background p-6 transition-shadow hover:shadow-[0_12px_32px_-16px_rgba(15,31,61,0.25)]">
          <div className="flex items-center justify-between">
            <span className="flex size-10 items-center justify-center rounded-xl bg-accent text-primary"><ToolIcon name={t.icon} className="size-5" /></span>
            <Badge variant="muted">{String(i + 1).padStart(2, "0")}</Badge>
          </div>
          <h3 className="mt-4 text-lg font-bold leading-snug">{t.title}</h3>
          <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{t.desc}</p>
          <span className="mt-4 flex items-center gap-1 text-sm font-semibold text-primary">시작하기 <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" /></span>
        </Link>
      ))}
    </div>
  );
}
