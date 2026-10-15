import type { Metadata } from "next";
import Link from "next/link";
import { Disclaimer, PageHead, RecList, lineBtn, primaryBtn } from "@/components/guide/ui";
import { CONCERNS, GRADE_CHOICES, recommend, sumPrice } from "@/lib/guide";
import { getGuideProducts } from "@/lib/guide-products";
import { cn, formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "학습 고민으로 교재 찾기",
  description: "어떤 문제가 가장 어렵나요? 고민을 고르면 연결된 교재와 추천 이유를 보여 드립니다.",
  alternates: { canonical: "/find" },
};

export default async function FindPage({ searchParams }: { searchParams: Promise<{ c?: string; g?: string }> }) {
  const sp = await searchParams;
  const concern = CONCERNS.find((c) => c.id === sp.c);
  const grade = GRADE_CHOICES.find((g) => g.id === sp.g);
  const products = await getGuideProducts();
  const recs = concern ? recommend(products, { tags: [...concern.tags], area: concern.area, levels: grade?.levels, limit: 4 }) : [];
  const total = sumPrice(recs.map((r) => r.product));
  const q = (c: string, g?: string) => `/find?c=${c}${g ? `&g=${g}` : ""}`;

  return (
    <>
      <PageHead eyebrow="FIND BY CONCERN" title="어떤 문제가 가장 어렵나요?" lead="가장 가까운 고민을 고르면 그 유형과 연결된 교재를 보여 드립니다. 규칙에 따른 추천이며 학생의 실력을 측정하지는 않습니다." />
      <div className="container-page max-w-3xl py-10">
        <ul className="grid border-t border-foreground/30 sm:grid-cols-2 sm:gap-x-8">
          {CONCERNS.map((c) => (
            <li key={c.id} className="border-b border-border">
              <Link href={q(c.id, sp.g)} aria-current={c.id === concern?.id ? "true" : undefined} className={cn("block py-3.5 text-[15px] leading-snug hover:underline", c.id === concern?.id && "font-semibold underline")}>{c.label}</Link>
            </li>
          ))}
        </ul>

        {concern && (
          <section className="mt-14" aria-labelledby="result">
            <h2 id="result" className="text-[22px] font-bold tracking-[-0.03em]">“{concern.label}”</h2>
            <p className="mt-4 text-[13px] font-semibold text-muted-foreground">학년으로 좁히기 (선택)</p>
            <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5 text-[14px]">
              <Link href={q(concern.id)} className={cn(!grade && "font-semibold underline underline-offset-4")}>전체</Link>
              {GRADE_CHOICES.map((g) => <Link key={g.id} href={q(concern.id, g.id)} className={cn(grade?.id === g.id ? "font-semibold underline underline-offset-4" : "text-muted-foreground hover:text-foreground")}>{g.label}</Link>)}
            </p>

            {recs.length > 0 ? (
              <div className="mt-6">
                <RecList recs={recs} />
                {total !== null && recs.length > 1 && <p className="mt-3 text-right text-[13px] text-muted-foreground">추천 교재 {recs.length}권 합계 <span className="font-semibold text-foreground tabular-nums">{formatPrice(total)}</span></p>}
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link href={`/consult?product=${recs.map((r) => r.product.slug).join(",")}`} data-consult-button className={primaryBtn}>이 교재로 상담 신청</Link>
                  <Link href={`/compare?p=${recs.slice(0, 3).map((r) => r.product.slug).join(",")}`} className={lineBtn}>교재 비교하기</Link>
                </div>
              </div>
            ) : (
              <div className="mt-6 border-t border-border pt-6">
                <p className="text-[15px] leading-relaxed">이 고민과 연결된 교재가 아직 등록되어 있지 않습니다.{grade ? " 학년 조건을 ‘전체’로 바꿔 보거나, " : " "}필요한 단원과 유형을 알려 주시면 제작 가능 여부와 가격, 납품 일정을 상담으로 안내해 드립니다.</p>
                <div className="mt-5 flex flex-wrap gap-3"><Link href="/custom" className={primaryBtn}>맞춤 구성 상담</Link><Link href="/consult" data-consult-button className={lineBtn}>교재 상담 신청</Link></div>
              </div>
            )}
            <div className="mt-8"><Disclaimer>추천은 교재에 연결된 취약 유형 태그, 학년, 과목을 기준으로 한 규칙 기반 안내입니다. 성적 향상을 보장하지 않으며, 정확한 교재 선택은 상담에서 함께 확인해 드립니다.</Disclaimer></div>
          </section>
        )}
      </div>
    </>
  );
}
