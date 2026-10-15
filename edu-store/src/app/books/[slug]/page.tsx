import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookCover } from "@/components/books/book-cover";
import { JsonLd } from "@/components/books/json-ld";
import { ConsultLink, DeliveryTag, Price, ShelfItem } from "@/components/books/parts";
import { RecentBooks, RecentTracker } from "@/components/books/recent-books";
import {
  ANSWER_MODES, areaLabel, curriculumLabel, difficultyLabel, kindLabel, levelsText, trackLabel,
} from "@/lib/catalog";
import { getCatalog, getProductBySlug, getRelated } from "@/lib/products";
import { breadcrumbJsonLd, isIndexable, productDescription, productJsonLd } from "@/lib/seo";
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
    ["정답·해설", p.hasAnswerFile ? "정답 및 해설 별도 PDF 제공" : p.answerMode !== "none" ? answer?.label ?? null : "제공 여부는 상담 시 안내"],
    ["제공 형태", "PDF (A4 인쇄 가능)"],
    ["교재 상태", p.deliveryType === "custom" ? "주문 제작 상담 가능" : "PDF 완성본"],
    ["개정", p.edition],
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
            {trackLabel(p.track)} · {areaLabel(p.area)}<DeliveryTag type={p.deliveryType} />
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

        {/* 상담·구매 패널 (PC 우측 고정) */}
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="border border-border bg-card p-6">
            <Price product={p} size="lg" />
            <p className="mt-1 text-[12px] text-muted-foreground">PDF 교재 · 상담 후 계좌이체로 구매</p>
            {p.deliveryType === "custom" && (
              <p className="mt-3 border-l-2 border-foreground/40 pl-3 text-[13px] leading-relaxed text-foreground/80">주문 제작 상담 가능 교재입니다. 제작 가능 여부와 납품 시점은 상담에서 안내해 드립니다.</p>
            )}
            <ConsultLink slug={p.slug} className="mt-5 w-full" />
            <ol className="mt-6 space-y-1 border-t border-border pt-4 text-[12px] leading-relaxed text-muted-foreground">
              <li>① 상담 신청 → ② 문자·전화 안내</li>
              <li>③ 계좌이체 → ④ 입금 확인 후 PDF 전달</li>
            </ol>
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
              <p className="max-w-2xl text-[14px] leading-relaxed text-muted-foreground">이 교재의 상세 구성(쪽수·문항 수·목차)은 제작 상담에서 확정해 안내합니다. 확정되지 않은 내용은 게시하지 않습니다.</p>
            )}
            {p.targets.length > 0 && (
              <>
                <h3 className="mt-8 text-[13px] font-semibold tracking-[0.08em] text-muted-foreground">이런 학습자에게</h3>
                <ul className="mt-3 max-w-2xl list-disc space-y-1.5 pl-5 text-[14px] leading-relaxed">{p.targets.map((t) => <li key={t}>{t}</li>)}</ul>
              </>
            )}
          </Block>

          {p.goals.length > 0 && <Block title="학습 목표">
            {p.goals.length ? (
              <ol className="max-w-2xl space-y-3 text-[15px] leading-relaxed">
                {p.goals.map((g, i) => <li key={g} className="grid grid-cols-[28px_1fr]"><span className="font-display text-[16px] text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>{g}</li>)}
              </ol>
            ) : null}
          </Block>}

          {p.toc.length > 0 && <Block title="상세 목차">
            {p.toc.length ? (
              <ol className="max-w-2xl divide-y divide-border border-y border-border text-[15px]">
                {p.toc.map((t, i) => <li key={t} className="grid grid-cols-[40px_1fr] py-3"><span className="font-display text-[15px] text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>{t}</li>)}
              </ol>
            ) : null}
          </Block>}

          {(p.previewImages.length > 0 || p.previewPdfUrl) && <Block title="PDF 미리보기" id="preview">
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
            ) : null}
          </Block>}

          {(p.edition || p.revisionNotes.length > 0) && (
            <Block title="개정 이력">
              {p.edition && <p className="text-[15px]">{p.edition}</p>}
              {p.revisionNotes.length > 0 && <ul className="mt-3 max-w-2xl list-disc space-y-1.5 pl-5 text-[14px] leading-relaxed">{p.revisionNotes.map((n) => <li key={n}>{n}</li>)}</ul>}
            </Block>
          )}

          <Block title="구매 방법과 환불 안내">
            <ol className="max-w-2xl space-y-2 text-[14px] leading-relaxed">
              <li><span className="mr-2 text-muted-foreground">1.</span>‘교재 상담 및 구매 신청’으로 연락처를 남깁니다.</li>
              <li><span className="mr-2 text-muted-foreground">2.</span>문자 또는 전화로 구매 방법, 제작 가능 여부, 납품 시점을 안내해 드립니다.</li>
              <li><span className="mr-2 text-muted-foreground">3.</span>안내받은 계좌로 입금하면 확인 후 PDF 교재를 전달해 드립니다.</li>
              <li><span className="mr-2 text-muted-foreground">4.</span>구매한 교재는 본인 학습 목적으로만 이용할 수 있으며 복제·공유·재판매는 금지됩니다.</li>
            </ol>
            <p className="mt-5 max-w-2xl text-[14px] leading-relaxed text-muted-foreground">
              디지털 콘텐츠는 PDF 전달 이후 단순 변심에 의한 청약철회가 제한될 수 있습니다. 전달 전에는 상담으로 취소할 수 있으며, 파일 오류나 내용상 결함은 수정본 제공 또는 환불로 처리합니다.{" "}
              <Link href="/refund" className="text-foreground underline underline-offset-4">환불·교환 정책 전문</Link>{" · "}
              <Link href="/errata" className="text-foreground underline underline-offset-4">오류 제보·정오표</Link>
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

      {/* 모바일 상담 바 */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background lg:hidden">
        <div className="container-page flex items-center gap-3 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <Price product={p} size="md" className="shrink-0 !text-[15px]" />
          <ConsultLink slug={p.slug} className="min-w-0 flex-1" />
        </div>
      </div>
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
