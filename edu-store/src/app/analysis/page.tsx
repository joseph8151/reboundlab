import type { Metadata } from "next";
import Link from "next/link";
import { analysisDemoMode, listPassages } from "@/lib/analysis/repo";
import { statusLabel } from "@/lib/analysis/types";
import { Tag } from "@/components/analysis/common";

export const metadata: Metadata = { title: "수능 영어 프리미엄 지문 분석", description: "문장별 해석부터 논리 구조, 정답 근거, 패러프레이징, 변형문제까지 한 지문을 끝까지 파고드는 멜리사 에듀 분석 자료." };
export const dynamic = "force-dynamic";

export default async function AnalysisIndex() {
  const list = await listPassages();
  const demo = analysisDemoMode();
  return (
    <div className="container-page max-w-5xl py-10 md:py-14">
      <p className="font-display text-[13px] tracking-[0.2em] text-primary">PREMIUM PASSAGE ANALYSIS</p>
      <h1 className="mt-2 text-[30px] leading-tight text-secondary-foreground md:text-[40px]">수능 영어 프리미엄 지문 분석</h1>
      <p className="mt-3 max-w-2xl text-[15px] leading-[1.8] text-muted-foreground">한 지문을 소재·주제·논리 구조·정답 근거·패러프레이징·오답 원인·어휘·요약까지 8개 영역으로 분석하고, 같은 지문에서 파생한 변형문제로 마무리합니다.</p>
      {demo && <p className="mt-4 border-l-2 border-mustard pl-3 text-[12.5px] text-muted-foreground">개발 미리보기: 데이터베이스가 연결되기 전이라 검수 중인 샘플을 함께 보여 드립니다. 연결 후에는 승인된 분석만 공개됩니다.</p>}
      <ul className="mt-8 grid gap-4 md:grid-cols-2">
        {list.map((p) => (
          <li key={p.slug}><Link href={`/analysis/${p.slug}`} className="block border border-border bg-card p-5 transition-colors hover:border-primary">
            <div className="flex flex-wrap gap-1.5"><Tag tone="wine">{p.meta.questionType}</Tag><Tag>난이도 {p.meta.difficulty}</Tag>{demo && <Tag tone="gold">{statusLabel(p.status)}</Tag>}</div>
            <h2 className="mt-3 text-[20px] leading-snug text-secondary-foreground">{p.title}</h2>
            <p className="mt-1 text-[13.5px] text-muted-foreground">{p.overview.titleKo}</p>
            <p className="mt-3 text-[13px] leading-relaxed">{p.overview.theme} · 변형문제 {p.variants.length}문항</p>
          </Link></li>
        ))}
        {!list.length && <li className="text-muted-foreground">아직 공개된 분석이 없습니다.</li>}
      </ul>
    </div>
  );
}
