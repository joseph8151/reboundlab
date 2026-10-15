import type { Metadata } from "next";
import Link from "next/link";
import { BookA, Camera, ExternalLink, FileSearch, Languages, ListTree, MessageSquareText, SpellCheck, Target } from "lucide-react";
import { StudyHeader } from "@/components/study/study-header";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/site";

const { aiTutor } = siteConfig;
const description = `${aiTutor.name}는 ${aiTutor.author}이 만든 수능 영어 기출·모의고사 지문 분석 AI입니다. 지문 사진이나 텍스트를 넣으면 핵심 내용, 문장별 해석, 어휘, 문법, 글의 구조, 정답 근거까지 정리해 줍니다.`;

export const metadata: Metadata = {
  title: `${aiTutor.name} · 수능 영어 지문 분석 AI`,
  description,
  alternates: { canonical: "/study/ai-melisa" },
  openGraph: { title: `${aiTutor.name} · 수능 영어 지문 분석 AI`, description, url: "/study/ai-melisa" },
};

const FEATURES = [
  { icon: Target, title: "핵심 내용", body: "지문이 결국 무슨 말을 하는지 한두 문장으로 요약" },
  { icon: Languages, title: "문장별 해석", body: "한 문장씩 끊어 읽기 방식으로 직독직해" },
  { icon: BookA, title: "어휘", body: "수능 빈출 어휘와 문맥 속 의미 정리" },
  { icon: SpellCheck, title: "문법", body: "해석을 막는 구문(관계사, 분사구문, 도치 등) 설명" },
  { icon: ListTree, title: "글의 구조", body: "통념-반박, 실험·연구 등 전개 방식과 주제문 위치" },
  { icon: FileSearch, title: "정답 근거", body: "정답이 지문의 어느 문장에 근거하는지, 오답은 왜 틀렸는지" },
];

export default function AiMelisaPage() {
  return (
    <div className="container-page max-w-4xl py-10 sm:py-14">
      <StudyHeader eyebrow={aiTutor.name} title={`${aiTutor.name} · 수능 영어 지문 분석`} description={description} />

      <div className="flex flex-col gap-4 rounded-3xl bg-primary p-6 text-primary-foreground sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div>
          <p className="text-xl font-bold">공부하다 막히면, 지문을 그대로 보여 주세요</p>
          <p className="mt-1 text-sm text-primary-foreground/80">ChatGPT에서 열립니다 · ChatGPT 계정이 필요해요</p>
        </div>
        <Button asChild size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90">
          <a href={aiTutor.url} target="_blank" rel="noopener noreferrer">{aiTutor.name} 열기 <ExternalLink /></a>
        </Button>
      </div>

      <h2 className="mt-12 text-xl font-bold">이렇게 분석해 줘요</h2>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map(({ icon: Icon, title, body }) => (
          <div key={title} className="rounded-2xl border border-border p-5">
            <Icon className="size-5 text-primary" />
            <p className="mt-3 font-bold">{title}</p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{body}</p>
          </div>
        ))}
      </div>

      <h2 className="mt-12 text-xl font-bold">사용 방법</h2>
      <ol className="mt-5 grid gap-4 sm:grid-cols-3">
        {[
          { icon: Camera, title: "지문 사진 찍기", body: "모의고사·교재 지문을 반듯하게 찍거나, 텍스트를 복사해 둡니다." },
          { icon: MessageSquareText, title: "AI 멜리사에 넣기", body: "사진을 올리거나 지문을 붙여넣고, 문항 번호와 선택지도 함께 넣어 주세요." },
          { icon: Target, title: "내 풀이와 비교", body: "먼저 혼자 풀어 본 뒤 정답 근거를 확인해야 실력이 늡니다. 틀린 건 오답노트에 기록!" },
        ].map(({ icon: Icon, title, body }, i) => (
          <li key={title} className="rounded-2xl bg-muted p-5">
            <span className="text-sm font-bold text-primary">STEP {i + 1}</span>
            <p className="mt-2 flex items-center gap-2 font-bold"><Icon className="size-4" /> {title}</p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{body}</p>
          </li>
        ))}
      </ol>

      <div className="mt-12 rounded-2xl border border-border p-5 text-sm leading-relaxed text-muted-foreground">
        <p className="font-semibold text-foreground">이용 전 알아 두세요</p>
        <ul className="mt-2 space-y-1">
          <li>· AI 분석은 틀릴 수 있어요. 정답·해설은 반드시 공식 해설과 함께 확인하세요.</li>
          <li>· {aiTutor.name}는 OpenAI의 ChatGPT에서 동작하며, 입력한 내용은 OpenAI 정책에 따라 처리됩니다. 개인정보는 입력하지 마세요.</li>
          <li>· 분석 결과를 다른 사람에게 배포하거나 판매하는 것은 지문 저작권 문제로 삼가 주세요.</li>
        </ul>
      </div>

      <p className="mt-8 text-sm text-muted-foreground">
        함께 쓰면 좋은 도구: <Link href="/study/speed-reading" className="text-primary underline">지문 속독 훈련</Link> ·{" "}
        <Link href="/study/structures" className="text-primary underline">지문 구조 10가지</Link> · <Link href="/study/wrong-notes" className="text-primary underline">오답노트</Link>
      </p>
    </div>
  );
}
