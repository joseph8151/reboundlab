import Link from "next/link";
import { BookCover } from "@/components/books/book-cover";
import { BookRow, ConsultLink, DeliveryTag, FeaturedTag, Price, ShelfItem, metaLine } from "@/components/books/parts";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { SectionHead } from "@/components/layout/section";
import { AREAS } from "@/lib/catalog";
import { CONCERNS } from "@/lib/guide";
import { FAQ_ITEMS } from "@/lib/faq";
import { applyFilters, getBundles, getCatalog, getFeatured, sortProducts } from "@/lib/products";
import { STUDY_TOOLS } from "@/lib/study/tools";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

const pick = (list: Product[], n: number) => sortProducts(list, "recommended").slice(0, n);

export default async function HomePage() {
  const [catalog, featured, bundles] = await Promise.all([getCatalog(), getFeatured(3), getBundles()]);
  const scope = (f: Parameters<typeof applyFilters>[1]) => applyFilters(catalog, { ...f, status: "on_sale" });

  const csat = pick(scope({ scope: "csat" }).filter((p) => p.kind !== "mock" && p.track === "csat"), 4);
  const high = pick(scope({ scope: "high-school" }), 4);
  const middle = pick(scope({ scope: "middle-school" }), 5);
  const mocks = pick(scope({ kind: "mock" }), 7);
  const faqs = FAQ_ITEMS.slice(0, 6);
  const tools = STUDY_TOOLS.filter((t) => ["/study/words", "/study/speed-reading", "/study/structures", "/study/wrong-notes", "/study/time", "/study/habit"].includes(t.href));
  const packages = bundles.filter((b) => b.consultable).slice(0, 6);

  return (
    <>
      {/* 1. 브랜드 배너 */}
      <section className="border-b border-border bg-muted">
        <div className="container-page grid items-end gap-14 pb-16 pt-14 md:grid-cols-[1fr_minmax(0,520px)] md:pb-24 md:pt-24">
          <div className="max-w-xl">
            <p className="flex items-center gap-3 font-display text-[15px] font-semibold tracking-[0.3em] text-primary">MELISSA EDU<span aria-hidden className="h-[2px] w-8 bg-mustard" /></p>
            <h1 className="mt-6 text-[44px] font-extrabold leading-[1.12] tracking-[-0.05em] text-secondary-foreground md:text-[68px]">공부의 기준을<br /><span className="text-primary">다시 세우다.</span></h1>
            <p className="mt-7 max-w-md text-[17px] leading-[1.75] text-muted-foreground">필요한 교재를 함께 찾아드립니다. 수능부터 학교 내신까지, 학습의 깊이를 더하는 전문 교재 멜리사 에듀.</p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Button asChild size="lg"><Link href="/consult" data-consult-button>교재 구성 및 구매 상담</Link></Button>
              <Button asChild size="lg" variant="outline"><Link href="/diagnosis">3분 학습 진단</Link></Button>
            </div>
          </div>
          <div>
            <div className="flex items-end justify-center gap-3 border-b border-primary/30 px-2 md:gap-4">
              {featured.map((p, i) => (
                <Link key={p.id} href={`/books/${p.slug}`} aria-label={p.title} className="block shrink-0 transition-transform duration-300 hover:-translate-y-1" style={{ width: i === 0 ? "42%" : i === 1 ? "33%" : "29%" }}>
                  <BookCover product={p} priority sizes="(min-width: 768px) 220px, 40vw" />
                </Link>
              ))}
            </div>
            <ol className="mt-4 space-y-1.5 text-[13px]">
              {featured.map((p, i) => (
                <li key={p.id} className="flex items-baseline gap-3">
                  <span className="font-display text-[13px] text-dusty-rose">0{i + 1}</span>
                  <Link href={`/books/${p.slug}`} className="hover:underline">{p.title}</Link><FeaturedTag rank={p.featuredRank} />
                  <span className="ml-auto tabular-nums"><Price product={p} size="sm" /></span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* 학습 고민으로 교재 찾기 */}
      <section className="bg-light-pink py-20 md:py-24" aria-labelledby="concerns">
        <div className="container-page grid gap-10 md:grid-cols-[280px_1fr] md:gap-16">
          <div>
            <SectionHead eyebrow="FIND BY CONCERN" title="어떤 문제가 가장 어렵나요?" className="[&_h2]:text-[26px]" />
            <p className="mt-4 text-[14px] leading-[1.8] text-foreground/75">고민을 고르면 연결된 교재와 추천 이유를 보여 드립니다. 규칙에 따른 안내이며 실력을 측정하지는 않습니다.</p>
          </div>
          <ul id="concerns" className="grid border-t border-primary/40 sm:grid-cols-2 sm:gap-x-10">
            {CONCERNS.map((c) => (
              <li key={c.id} className="border-b border-blush">
                <Link href={`/find?c=${c.id}`} className="flex items-baseline justify-between gap-4 py-3.5 text-[15px] leading-snug hover:text-primary"><span>{c.label}</span><span aria-hidden className="shrink-0 text-dusty-rose">→</span></Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 2. 수능 주요 교재 */}
      <section className="container-page py-20 md:py-28" aria-labelledby="csat-core">
        <SectionHead no="01" eyebrow="수능" title="수능 주요 교재" href="/category/suneung" />
        <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-4">
          {csat.map((p, i) => <ShelfItem key={p.id} product={p} priority={i < 2} />)}
        </div>
      </section>

      {/* 3. 고등 내신 */}
      <section className="bg-muted py-20 md:py-28" aria-labelledby="high">
        <div className="container-page grid gap-12 md:grid-cols-[300px_1fr] md:gap-20">
          <div className="md:sticky md:top-32 md:self-start">
            <SectionHead no="02" eyebrow="고등 내신" title="학교 시험의 방식에 맞춰" />
            <p className="mt-5 text-[15px] leading-[1.85] text-foreground/80">고1·고2·고3 국어, 수학, 영어 교재. 서술형과 중간·기말고사 대비를 학기 단위로 구성합니다.</p>
            <Link href="/category/high-school" className="mt-6 inline-block border-b border-foreground pb-0.5 text-[13px] font-medium">고등 내신 전체 보기</Link>
          </div>
          <div id="high" className="border-b border-border">{high.map((p) => <BookRow key={p.id} product={p} className="border-foreground/15" />)}</div>
        </div>
      </section>

      {/* 4. 중등 내신 */}
      <section className="container-page py-20 md:py-28" aria-labelledby="middle">
        <SectionHead no="03" eyebrow="중등 내신" title="학습의 기초를 학년의 속도에" href="/category/middle-school" />
        <div className="mt-10 grid gap-10 md:grid-cols-[minmax(0,300px)_1fr] md:gap-16">
          {middle[0] && <Link href={`/books/${middle[0].slug}`} aria-label={middle[0].title}><BookCover product={middle[0]} sizes="300px" /></Link>}
          <div className="self-center">
            {middle[0] && (
              <>
                <p className="text-[13px] text-muted-foreground">{metaLine(middle[0])}</p>
                <h3 className="mt-2 text-[24px] font-bold leading-tight tracking-[-0.035em] md:text-[30px]"><Link href={`/books/${middle[0].slug}`} className="hover:underline">{middle[0].title}</Link></h3>
                {middle[0].summary && <p className="mt-4 max-w-lg text-[15px] leading-[1.85] text-muted-foreground">{middle[0].summary}</p>}
                <p className="mt-4 flex flex-wrap items-center gap-3"><Price product={middle[0]} size="md" /><DeliveryTag type={middle[0].deliveryType} /></p>
                <ConsultLink slug={middle[0].slug} className="mt-5" />
              </>
            )}
            <ul className="mt-10 grid gap-x-10 sm:grid-cols-2">
              {middle.slice(1).map((p) => (
                <li key={p.id} className="flex items-baseline justify-between gap-4 border-t border-border py-2.5 text-[14px]">
                  <Link href={`/books/${p.slug}`} className="hover:underline">{p.title}</Link>
                  <span className="shrink-0 text-[12px] tabular-nums text-muted-foreground">{p.price !== null ? formatPrice(p.salePrice ?? p.price) : ""}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 5. 실전 모의고사 */}
      <section className="bg-primary py-20 text-background md:py-28" aria-labelledby="mock">
        <div className="container-page grid gap-12 md:grid-cols-[1fr_1.2fr] md:gap-20">
          <div>
            <SectionHead no="04" eyebrow="MOCK EXAM" title="실전의 시간과 형식으로" tone="light" />
            <p className="mt-5 max-w-sm text-[15px] leading-[1.85] text-background/75">영역별 실전 모의고사와 학년별 전국연합·평가원 대비, 시험 직전 파이널 모의고사를 시리즈로 구성합니다.</p>
            <Link href="/category/mock" className="mt-7 inline-block border-b border-background/60 pb-0.5 text-[13px] font-medium">모의고사 전체 보기</Link>
          </div>
          <ul id="mock" className="border-t border-background/25">
            {mocks.map((p) => (
              <li key={p.id} className="border-b border-background/15">
                <Link href={`/books/${p.slug}`} className="flex items-baseline justify-between gap-4 py-3.5">
                  <span className="text-[16px]">{p.title}</span>
                  <span className="shrink-0 text-[13px] tabular-nums text-background/70">{p.price !== null ? formatPrice(p.salePrice ?? p.price) : ""}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 6. 과목별 교재 */}
      <section className="container-page py-20 md:py-28" aria-labelledby="by-subject">
        <SectionHead no="05" eyebrow="과목" title="과목별 교재" />
        <ul id="by-subject" className="mt-10 grid grid-cols-5 gap-1.5 md:gap-2">
          {AREAS.filter((a) => a.id !== "common").map((a, i) => (
            <li key={a.id}>
              <Link href={`/books?area=${a.id}`} className="group flex h-[220px] flex-col justify-between p-3 transition-[height] duration-300 hover:h-[244px] md:h-[300px] md:p-5 md:hover:h-[330px]" style={{ background: a.color, color: a.ink }}>
                <span className="font-display text-[12px] tracking-[0.2em] opacity-80">0{i + 1}</span>
                <span className="text-[20px] font-bold tracking-[-0.03em] [writing-mode:vertical-rl] md:text-[28px]">{a.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* 7. 패키지 */}
      <section className="border-y border-border bg-card py-20 md:py-24" aria-labelledby="packages">
        <div className="container-page">
          <SectionHead no="06" eyebrow="PACKAGES" title="약점에 맞춘 패키지" href="/packages" />
          <ul id="packages" className="mt-8 divide-y divide-border border-y border-border">
            {packages.map((b) => (
              <li key={b.id}>
                <Link href={`/packages/${b.slug}`} className="grid items-baseline gap-2 py-5 md:grid-cols-[1fr_2fr_auto] md:gap-8">
                  <span className="text-[17px] font-semibold">{b.title}</span>
                  <span className="text-[13px] leading-relaxed text-muted-foreground">{b.items.length}권 구성 · {b.summary}</span>
                  <span className="font-semibold tabular-nums">{b.price !== null ? formatPrice(b.price) : ""}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 8. 무료 학습 자료 */}
      <section className="bg-card" aria-labelledby="free"><div className="container-page py-20 md:py-28">
        <SectionHead no="07" eyebrow="FREE TOOLS" title="무료 학습 자료와 도구" />
        <div id="free" className="mt-10 grid gap-14 md:grid-cols-2 md:gap-20">
          <div>
            <h3 className="border-b border-dusty-rose/50 pb-2 text-[13px] font-semibold tracking-[0.1em] text-primary">학습 설계</h3>
            <ul>
              {[
                ["/exam", "시험이 얼마 남지 않았다면", "시험일을 입력하면 남은 기간에 맞는 공부 방향과 매일 체크리스트를 만듭니다."],
                ["/schedule", "학습 일정 만들기", "분량과 완료일을 입력하면 하루 분량을 배분하고 인쇄할 수 있습니다."],
                ["/compare", "교재 비교", "2~3권을 골라 대상·난이도·가격을 나란히 비교합니다."],
              ].map(([href, t, d]) => (
                <li key={href} className="border-b border-border"><Link href={href} className="grid grid-cols-[1fr_auto] items-baseline gap-4 py-3 hover:bg-light-pink"><span><span className="block text-[15px] font-semibold">{t}</span><span className="mt-0.5 block text-[13px] leading-snug text-muted-foreground">{d}</span></span><span aria-hidden>→</span></Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="border-b border-dusty-rose/50 pb-2 text-[13px] font-semibold tracking-[0.1em] text-primary">무료 학습 도구</h3>
            <ul>
              {tools.map((t) => (
                <li key={t.href} className="border-b border-border">
                  <Link href={t.href} className="grid grid-cols-[1fr_auto] items-baseline gap-4 py-3 hover:bg-light-pink">
                    <span><span className="block text-[15px] font-semibold">{t.short}</span><span className="mt-0.5 block text-[13px] leading-snug text-muted-foreground">{t.desc.split(".")[0]}.</span></span>
                    <span aria-hidden>→</span>
                  </Link>
                </li>
              ))}
            </ul>
            <Link href="/study" className="mt-5 inline-block border-b border-primary pb-0.5 text-[13px] font-medium text-primary">무료 학습 도구 전체 보기</Link>
          </div>
        </div>
      </div></section>

      {/* 9. 교재 구매 상담 안내 */}
      <section className="bg-blush/55 py-20 md:py-28" aria-labelledby="consult-guide">
        <div className="container-page grid gap-12 md:grid-cols-[1fr_1.1fr] md:gap-20">
          <div>
            <p className="font-display text-[15px] font-semibold tracking-[0.3em] text-primary">CONSULTATION</p>
            <h2 id="consult-guide" className="mt-5 text-[32px] font-extrabold leading-[1.2] tracking-[-0.045em] text-secondary-foreground md:text-[44px]">교재 구성 및<br /><span className="bg-[linear-gradient(transparent_62%,var(--gold)_62%)] px-0.5">구매 상담</span></h2>
            <p className="mt-5 max-w-md text-[15px] leading-[1.85] text-foreground/80">현재 학습 상황에 맞는 교재를 문의해 주세요. 원하는 단원과 유형을 선택해 나만의 구성을 상담받을 수도 있습니다.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg"><Link href="/consult" data-consult-button>교재 상담 및 구매 신청</Link></Button>
              <Button asChild size="lg" variant="outline"><Link href="/custom">MELISSA CUSTOM BOOK</Link></Button>
            </div>
          </div>
          <ol className="border-t border-primary/40">
            {[
              ["교재 선택", "교재와 패키지를 고르거나, 진단 도구로 찾습니다."],
              ["상담 신청", "연락처와 문의 내용을 남깁니다."],
              ["문자·전화 안내", "구매 방법과 제작 가능 여부, 납품 시점을 안내해 드립니다."],
              ["계좌이체", "안내받은 계좌로 입금합니다."],
              ["입금 확인 후 PDF 전달", "입금이 확인되면 PDF 교재를 전달해 드립니다."],
            ].map(([t, b], i) => (
              <li key={t} className="grid grid-cols-[2.5rem_1fr] gap-3 border-b border-primary/15 py-4">
                <span className="font-display text-[18px] text-primary">0{i + 1}</span>
                <span><span className="block text-[15px] font-semibold">{t}</span><span className="mt-0.5 block text-[13px] text-foreground/75">{b}</span></span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="container-page grid gap-10 py-20 md:grid-cols-[240px_1fr] md:gap-16 md:py-28" aria-labelledby="faq">
        <SectionHead no="08" eyebrow="FAQ" title="자주 묻는 질문" className="md:block [&_h2]:text-[24px]" />
        <Accordion type="single" collapsible id="faq" className="border-t border-foreground/30">
          {faqs.map((f, i) => (
            <AccordionItem key={f.q} value={`f${i}`}><AccordionTrigger>{f.q}</AccordionTrigger><AccordionContent>{f.a}</AccordionContent></AccordionItem>
          ))}
        </Accordion>
      </section>
    </>
  );
}
