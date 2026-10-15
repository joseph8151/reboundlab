import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookCover } from "@/components/books/book-cover";
import { BuyActions, RecentTracker } from "@/components/books/buy-panel";
import { JsonLd } from "@/components/books/json-ld";
import { Price, ShelfItem, StatusTag } from "@/components/books/parts";
import { RecentBooks } from "@/components/books/recent-books";
import {
  ANSWER_MODES, areaLabel, curriculumLabel, difficultyLabel, kindLabel, levelsText, trackLabel,
} from "@/lib/catalog";
import { getCatalog, getProductBySlug, getRelated } from "@/lib/products";
import { breadcrumbJsonLd, isIndexable, productDescription, productJsonLd } from "@/lib/seo";
import { downloadPolicy } from "@/lib/site";
import { effectivePrice } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const p = await getProductBySlug((await params).slug);
  if (!p) return { title: "교재를 찾을 수 없습니다", robots: { index: false } };
  const description = productDescription(p);
  const title = p.seoTitle || p.title;
  return {
    title,
    description,
    alternates: { canonical: `/books/${p.slug}` },
    robots: isIndexable(p) ? undefined : { index: false, follow: true },
    openGraph: { type: "website", title, description, url: `/books/${p.slug}`, images: p.coverUrl ? [{ url: p.coverUrl }] : undefined },
  };
}

export default async function BookPage({ params }: { params: Params }) {
  const p = await getProductBySlug((await params).slug);
  if (!p) notFound();
  const [related, catalog] = await Promise.all([getRelated(p, 4), getCatalog()]);
  const price = effectivePrice(p);
  const onSale = p.status === "on_sale";
  const answer = ANSWER_MODES.find((a) => a.id === p.answerMode);

  const facts: [string, string | null][] = [
    ["대상", levelsText(p.levels) || null],
    ["과목", [areaLabel(p.area), p.course].filter(Boolean).join(" · ")],
    ["유형", kindLabel(p.kind)],
    ["난이도", difficultyLabel(p.difficulty) || null],
    ["교육과정", curriculumLabel(p.curriculum) || null],
    ["적용 학년도", p.examYear ? `${p.examYear}학년도` : null],
    ["페이지", p.pageCount ? `${p.pageCount}쪽` : null],
    ["문항 수", p.questionCount ? `${p.questionCount}문항` : null],
    ["정답·해설", p.hasAnswerFile ? "정답 및 해설 별도 PDF 제공" : p.answerMode !== "none" ? answer?.label ?? null : null],
    ["판형", "PDF (A4 인쇄 가능)"],
    ["개정", p.edition],
    ["출시일", p.releaseDate ? formatDate(p.releaseDate) : null],
    ["상품 코드", p.sku || null],
  ];

  const category = p.track === "csat" ? { name: "수능", path: "/category/suneung" } : p.levels.some((l) => l.startsWith("middle")) ? { name: "중등 내신", path: "/category/middle-school" } : { name: "고등 내신", path: "/category/high-school" };

  return (
    <div className="pb-28 lg:pb-0">
      <JsonLd data={productJsonLd(p)} />
      <JsonLd data={breadcrumbJsonLd([{ name: "홈", path: "/" }, { name: "전체 교재", path: "/books" }, { name: category.name, path: category.path }, { name: p.title, path: `/books/${p.slug}` }])} />
      <RecentTracker slug={p.slug} />

      <div className="container-page pt-6">
        <nav aria-label="현재 위치" className="text-[13px] text-muted-foreground">
          <Link href="/books" className="hover:text-foreground">전체 교재</Link><span className="mx-2">/</span>
          <Link href={category.path} className="hover:text-foreground">{category.name}</Link>
        </nav>
      </div>

      {/* 상단: 표지 · 서지 정보 · 구매 */}
      <section className="container-page grid gap-10 pb-14 pt-8 md:grid-cols-[minmax(0,320px)_1fr] lg:grid-cols-[minmax(0,380px)_1fr_300px] lg:gap-14">
        <div className="mx-auto w-full max-w-[320px] md:max-w-none"><BookCover product={p} priority sizes="(min-width: 1024px) 380px, 320px" /></div>

        <div className="min-w-0">
          <p className="flex flex-wrap items-center gap-2 text-[13px] text-muted-foreground">
            {trackLabel(p.track)} · {areaLabel(p.area)}<StatusTag status={p.status} />
          </p>
          <h1 className="mt-3 text-[28px] font-bold leading-[1.25] tracking-[-0.035em] md:text-[36px]">{p.title}</h1>
          {p.series && <p className="mt-2 text-[14px] text-muted-foreground">{p.series}</p>}
          {p.summary && <p className="mt-5 max-w-xl text-[16px] leading-[1.75]">{p.summary}</p>}

          <dl className="mt-8 grid max-w-xl grid-cols-[88px_1fr] gap-x-4 gap-y-2.5 border-t border-border pt-5 text-[14px]">
            {facts.filter(([, v]) => v).map(([k, v]) => (
              <div key={k} className="contents"><dt className="text-muted-foreground">{k}</dt><dd>{v}</dd></div>
            ))}
          </dl>
        </div>

        {/* 구매 패널 (PC 우측 고정) */}
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="border border-border bg-card p-6">
            {onSale ? (
              <>
                <Price product={p} size="lg" />
                <p className="mt-1 text-[12px] text-muted-foreground">PDF 교재 · 결제 후 내 자료함에서 바로 다운로드</p>
                {p.purchasable ? (
                  <div className="mt-5"><BuyActions slug={p.slug} purchasable /></div>
                ) : (
                  <p className="mt-5 text-[13px] text-muted-foreground">판매를 위한 파일 연결을 마치는 중입니다. 잠시 후 다시 확인해 주세요.</p>
                )}
              </>
            ) : (
              <>
                <p className="text-[15px] font-semibold">{p.status === "coming_soon" ? "출시 예정" : p.status === "sold_out" ? "품절" : "판매 중단"}</p>
                {price !== null && <p className="mt-2 text-[13px] text-muted-foreground">예정 판매가 <span className="font-semibold text-foreground">{price.toLocaleString("ko-KR")}원</span></p>}
                <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
                  {p.status === "coming_soon" ? (p.releaseDate ? `출시일 ${formatDate(p.releaseDate)}` : "출시 일정은 확정되는 대로 안내합니다.") : "현재 구매할 수 없는 교재입니다."}
                </p>
                <Link href={`/consult?track=${p.track === "csat" ? "suneung" : "middle"}`} className="mt-5 inline-block border-b border-foreground pb-0.5 text-[14px] font-medium">출시 문의하기</Link>
              </>
            )}
            <ul className="mt-6 space-y-1.5 border-t border-border pt-4 text-[12px] leading-relaxed text-muted-foreground">
              <li>다운로드 기간 {downloadPolicy.validDays}일 · 최대 {downloadPolicy.maxCount}회</li>
              <li>다운로드 전 7일 이내 전액 환불</li>
            </ul>
          </div>
        </aside>
      </section>

      {/* 본문: 좌측 소제목 · 우측 내용의 편집형 구성 */}
      <div className="border-t border-border bg-sage/50">
        <div className="container-page divide-y divide-border">
          <Block title="상품 소개">
            {p.description ? (
              <div className="max-w-2xl space-y-4 text-[15px] leading-[1.9]">{p.description.split(/\n{2,}/).map((t, i) => <p key={i}>{t}</p>)}</div>
            ) : (
              <p className="text-[14px] text-muted-foreground">상세 소개는 교재 구성이 확정되면 공개됩니다.</p>
            )}
            {p.targets.length > 0 && (
              <>
                <h3 className="mt-8 text-[13px] font-semibold tracking-[0.08em] text-muted-foreground">이런 학습자에게</h3>
                <ul className="mt-3 max-w-2xl list-disc space-y-1.5 pl-5 text-[14px] leading-relaxed">{p.targets.map((t) => <li key={t}>{t}</li>)}</ul>
              </>
            )}
          </Block>

          <Block title="학습 목표">
            {p.goals.length ? (
              <ol className="max-w-2xl space-y-3 text-[15px] leading-relaxed">
                {p.goals.map((g, i) => <li key={g} className="grid grid-cols-[28px_1fr]"><span className="font-display text-[16px] text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>{g}</li>)}
              </ol>
            ) : <p className="text-[14px] text-muted-foreground">학습 목표는 교재 구성이 확정되면 공개됩니다.</p>}
          </Block>

          <Block title="상세 목차">
            {p.toc.length ? (
              <ol className="max-w-2xl divide-y divide-border border-y border-border text-[15px]">
                {p.toc.map((t, i) => <li key={t} className="grid grid-cols-[40px_1fr] py-3"><span className="font-display text-[15px] text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>{t}</li>)}
              </ol>
            ) : <p className="text-[14px] text-muted-foreground">상세 목차는 교재 구성이 확정되면 공개됩니다.</p>}
          </Block>

          <Block title="PDF 미리보기" id="preview">
            {p.previewImages.length > 0 && (
              <ul className="flex snap-x gap-4 overflow-x-auto pb-3">
                {p.previewImages.map((src, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <li key={src} className="w-[72%] shrink-0 snap-start sm:w-[300px]"><img src={src} alt={`${p.title} 미리보기 ${i + 1}쪽`} loading="lazy" draggable={false} className="aspect-[1/1.414] w-full border border-border bg-white object-contain" /></li>
                ))}
              </ul>
            )}
            {p.previewPdfUrl ? (
              <a href={p.previewPdfUrl} target="_blank" rel="noopener noreferrer" className="inline-block border-b border-foreground pb-0.5 text-[14px] font-semibold">미리보기 PDF 열기 (새 창)</a>
            ) : p.previewImages.length === 0 ? (
              <p className="text-[14px] text-muted-foreground">{onSale ? "이 교재의 미리보기 자료를 준비하고 있습니다." : "미리보기는 출시 시점에 공개됩니다."}</p>
            ) : null}
          </Block>

          {(p.edition || p.revisionNotes.length > 0) && (
            <Block title="개정 이력">
              {p.edition && <p className="text-[15px]">{p.edition}</p>}
              {p.revisionNotes.length > 0 && <ul className="mt-3 max-w-2xl list-disc space-y-1.5 pl-5 text-[14px] leading-relaxed">{p.revisionNotes.map((n) => <li key={n}>{n}</li>)}</ul>}
            </Block>
          )}

          <Block title="다운로드와 이용 안내">
            <ol className="max-w-2xl space-y-2 text-[14px] leading-relaxed">
              <li><span className="mr-2 text-muted-foreground">1.</span>결제가 완료되면 내 자료함에 교재가 추가됩니다.</li>
              <li><span className="mr-2 text-muted-foreground">2.</span>내 자료함에서 PDF를 내려받습니다. 파일마다 구매자 정보가 표시된 개인용 사본으로 제공됩니다.</li>
              <li><span className="mr-2 text-muted-foreground">3.</span>결제일로부터 {downloadPolicy.validDays}일, 교재당 최대 {downloadPolicy.maxCount}회까지 내려받을 수 있습니다.</li>
              <li><span className="mr-2 text-muted-foreground">4.</span>구매한 교재는 본인 학습 목적으로만 이용할 수 있으며, 복제·공유·재판매는 금지됩니다.</li>
            </ol>
            <p className="mt-5 max-w-2xl text-[14px] leading-relaxed text-muted-foreground">
              디지털 콘텐츠는 내려받은 이후 단순 변심에 의한 청약철회가 제한됩니다. 다운로드 전 결제일로부터 7일 이내에는 전액 환불할 수 있으며, 파일 오류나 내용상의 결함은 다운로드 여부와 관계없이 수정본 제공 또는 환불로 처리합니다.{" "}
              <Link href="/refund" className="text-foreground underline underline-offset-4">환불·교환 정책 전문</Link>
            </p>
          </Block>
        </div>
      </div>

      {related.length > 0 && (
        <section className="container-page mt-16" aria-labelledby="related">
          <h2 id="related" className="text-[22px] font-bold tracking-[-0.02em]">함께 보면 좋은 교재</h2>
          <div className="mt-6 grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-4">
            {related.map((r) => <ShelfItem key={r.id} product={r} />)}
          </div>
        </section>
      )}

      <RecentBooks catalog={catalog.map(({ slug, title, series, area, course, levels, kind, curriculum, examYear, coverUrl }) => ({ slug, title, series, area, course, levels, kind, curriculum, examYear, coverUrl }))} excludeSlug={p.slug} />

      {/* 모바일 구매 바 */}
      {onSale && p.purchasable && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background lg:hidden">
          <div className="container-page flex items-center gap-3 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <Price product={p} size="md" className="shrink-0 !text-[15px]" />
            <BuyActions slug={p.slug} purchasable compact />
          </div>
        </div>
      )}
    </div>
  );
}

function Block({ title, id, children }: { title: string; id?: string; children: React.ReactNode }) {
  return (
    <section id={id} className="grid scroll-mt-28 gap-4 py-10 md:grid-cols-[180px_1fr] md:gap-10">
      <h2 className="text-[13px] font-semibold tracking-[0.1em] text-muted-foreground">{title}</h2>
      <div>{children}</div>
    </section>
  );
}
