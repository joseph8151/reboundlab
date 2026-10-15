import type { Metadata } from "next";
import Link from "next/link";
import { AiAnalyzer } from "@/components/study/ai-analyzer";
import { StudyHeader } from "@/components/study/study-header";
import { AI_DAILY_LIMIT, isAiConfigured } from "@/lib/ai";
import { siteConfig } from "@/lib/site";
import { isSupabaseConfigured } from "@/lib/supabase/env";

const { aiTutor } = siteConfig;
const description = "영어 지문의 핵심 내용, 문장별 해석, 어휘, 문법, 글의 구조, 정답 근거를 정리해 주는 AI 멜리사 학습 도우미입니다.";

export const metadata: Metadata = {
  title: `${aiTutor.name} 학습 도우미 · 영어 지문 분석`,
  description,
  alternates: { canonical: "/study/ai-melisa" },
  openGraph: { title: `${aiTutor.name} 학습 도우미`, description, url: "/study/ai-melisa" },
};

const FEATURES = ["핵심 내용", "글의 구조", "문장별 해석", "어휘", "문법·구문", "정답 근거"];

export default function AiMelisaPage() {
  const enabled = isAiConfigured();
  return (
    <div className="container-page max-w-4xl py-10 sm:py-14">
      <StudyHeader eyebrow={aiTutor.name} title="AI 멜리사 학습 도우미" description={description} />

      <p className="text-[13px] tracking-wide text-muted-foreground">분석 항목 · {FEATURES.join(" · ")}</p>

      {enabled ? (
        <section className="mt-8" aria-label="지문 분석">
          <h2 className="text-[20px] font-bold tracking-[-0.02em]">사이트에서 바로 분석하기</h2>
          <p className="mb-5 mt-1 text-[14px] text-muted-foreground">지문을 붙여넣거나 사진을 올리면 위 항목으로 정리합니다. 로그인한 이용자에게 하루 {AI_DAILY_LIMIT}회까지 제공합니다.</p>
          <AiAnalyzer enabled dailyLimit={AI_DAILY_LIMIT} loginRequired={isSupabaseConfigured()} gptUrl={aiTutor.url} tutorName={aiTutor.name} />
        </section>
      ) : (
        <section className="mt-8 border-t border-border pt-8" aria-label="이용 방법">
          <p className="max-w-xl text-[15px] leading-[1.8]">
            사이트 안에서 바로 분석하는 기능은 아직 연결되지 않았습니다. 지금은 {aiTutor.author}이 만든 GPT(OpenAI ChatGPT, 외부 서비스)에서 같은 방식으로 분석할 수 있습니다. ChatGPT 계정이 필요합니다.
          </p>
          <a href={aiTutor.url} target="_blank" rel="noopener noreferrer" className="mt-6 inline-block bg-primary px-6 py-3 text-[14px] font-semibold text-primary-foreground">{aiTutor.name} GPT 열기 (외부 서비스)</a>
        </section>
      )}

      {enabled && (
        <p className="mt-10 text-[14px] text-muted-foreground">
          대화로 이어서 질문하고 싶다면 <a href={aiTutor.url} target="_blank" rel="noopener noreferrer" className="text-foreground underline underline-offset-4">{aiTutor.name} GPT(외부 서비스)</a>를 이용할 수 있습니다.
        </p>
      )}

      <div className="mt-12 border-t border-border pt-6 text-[13px] leading-[1.85] text-muted-foreground">
        <p className="font-semibold text-foreground">이용 전 알아 두세요</p>
        <ul className="mt-2 space-y-1">
          <li>· AI 분석은 틀릴 수 있습니다. 정답과 해설은 공식 해설과 함께 확인하세요.</li>
          <li>· 입력한 지문·사진은 처리를 위해 AI 서비스 제공사로 전송됩니다. 지문 외의 개인정보는 입력하지 마세요.</li>
          <li>· 분석 결과를 다른 사람에게 배포하거나 판매하는 것은 지문 저작권 문제로 삼가 주세요.</li>
        </ul>
        <p className="mt-5">함께 쓰면 좋은 도구: <Link href="/study/speed-reading" className="underline underline-offset-4">독해 속도 훈련</Link> · <Link href="/study/structures" className="underline underline-offset-4">지문 구조 분석</Link> · <Link href="/study/wrong-notes" className="underline underline-offset-4">오답노트</Link></p>
      </div>
    </div>
  );
}
