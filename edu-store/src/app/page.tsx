import Link from "next/link";
import { BookCover } from "@/components/books/book-cover";
import { BookRow, PlannedList, ShelfItem, StatusTag, metaLine } from "@/components/books/parts";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { SectionHead } from "@/components/layout/section";
import { AREAS } from "@/lib/catalog";
import { FAQ_ITEMS } from "@/lib/faq";
import { applyFilters, getCatalog, getFeatured, getNewest, sortProducts } from "@/lib/products";
import { siteConfig } from "@/lib/site";
import { STUDY_TOOLS } from "@/lib/study/tools";
import { effectivePrice, type Product } from "@/lib/types";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

const pick = (list: Product[], n: number) => sortProducts(list, "recommended").slice(0, n);

export default async function HomePage() {
  const [catalog, featured, newest] = await Promise.all([getCatalog(), getFeatured(3), getNewest(4)]);
  const scope = (f: Parameters<typeof applyFilters>[1]) => applyFilters(catalog, { ...f, status: "all" });

  const csat = pick(scope({ scope: "csat" }), 4);
  const high = pick(scope({ scope: "high-school" }), 4);
  const middle = pick(scope({ scope: "middle-school" }), 4);
  const mocks = pick(scope({ kind: "mock" }), 7);
  const planners = pick(scope({ kind: "material" }), 6);
  const faqs = FAQ_ITEMS.slice(0, 6);
  const tools = STUDY_TOOLS.filter((t) => ["/study/words", "/study/speed-reading", "/study/structures", "/study/wrong-notes", "/study/time", "/study/habit"].includes(t.href));

  return (
    <>
      {/* 1. 프리미엄 히어로 */}
      <section className="border-b border-border">
        <div className="container-page grid items-end gap-14 pb-16 pt-14 md:grid-cols-[1fr_minmax(0,520px)] md:pb-24 md:pt-24">
          <div className="max-w-xl">
            <p className="font-display text-[15px] font-semibold tracking-[0.3em] text-muted-foreground">MELISA EDU</p>
            <h1 className="mt-6 text-[44px] font-extrabold leading-[1.12] tracking-[-0.05em] md:text-[68px]">공부의 기준을<br />다시 세우다.</h1>
            <p className="mt-7 max-w-md text-[17px] leading-[1.75] text-muted-foreground">수능부터 학교 내신까지. 학습의 깊이를 더하는 전문 교재, 멜리사 에듀.</p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Button asChild size="lg"><Link href="/books">교재 둘러보기</Link></Button>
              <Button asChild size="lg" variant="outline"><Link href="/category/suneung">수능 교재 보기</Link></Button>
            </div>
          </div>

          {/* 대표 교재: 같은 선반 위에 놓인 세 권 */}
          <div>
            <div className="flex items-end justify-center gap-3 border-b border-foreground/25 px-2 pb-0 md:gap-4">
              {featured.map((p, i) => (
                <Link key={p.id} href={`/books/${p.slug}`} aria-label={p.title} className="block shrink-0 transition-transform duration-300 hover:-translate-y-1" style={{ width: i === 0 ? "42%" : i === 1 ? "33%" : "29%", transform: i === 2 ? undefined : undefined }}>
                  <BookCover product={p} priority sizes="(min-width: 768px) 220px, 40vw" />
                </Link>
              ))}
            </div>
            <ol className="mt-4 space-y-1.5 text-[13px]">
              {featured.map((p, i) => (
                <li key={p.id} className="flex items-baseline gap-3">
                  <span className="font-display text-[13px] text-muted-foreground">0{i + 1}</span>
                  <Link href={`/books/${p.slug}`} className="hover:underline">{p.title}</Link>
                  <StatusTag status={p.status} className="ml-auto" />
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* 2. 학습 과정별 교재 탐색 */}
      <section className="container-page py-20 md:py-28" aria-labelledby="by-course">
        <div className="grid gap-10 md:grid-cols-[240px_1fr]">
          <SectionHead no="01" eyebrow="학습 과정" title="어디에서 시작할까요" className="md:block [&_h2]:text-[24px]" />
          <ul id="by-course" className="border-t border-foreground/30">
            {[
              { href: "/category/suneung", name: "수능", en: "CSAT", body: "국어, 수학, 영어, 사회, 과학 영역별 시리즈. 개념부터 실전 모의고사까지." },
              { href: "/category/high-school", name: "고등 내신", en: "HIGH SCHOOL", body: "고1·고2·고3 학교 시험 대비. 서술형과 중간·기말고사 대비 교재." },
              { href: "/category/middle-school", name: "중등 내신", en: "MIDDLE SCHOOL", body: "중1~중3 개념 정리와 유형별 문제. 고등 선행 교재까지." },
            ].map((r) => (
              <li key={r.href} className="border-b border-border">
                <Link href={r.href} className="group grid items-baseline gap-2 py-7 transition-colors hover:bg-sage/60 md:grid-cols-[1fr_1.1fr_auto] md:gap-8 md:px-4">
                  <span className="flex items-baseline gap-4"><span className="text-[28px] font-bold tracking-[-0.04em] md:text-[34px]">{r.name}</span><span className="font-display text-[13px] tracking-[0.24em] text-muted-foreground">{r.en}</span></span>
                  <span className="text-[14px] leading-relaxed text-muted-foreground">{r.body}</span>
                  <span aria-hidden className="hidden text-[18px] transition-transform group-hover:translate-x-1 md:block">→</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 3. 수능 핵심 교재 */}
      <section className="container-page pb-24" aria-labelledby="csat-core">
        <SectionHead no="02" eyebrow="수능" title="수능 핵심 교재" href="/category/suneung" />
        <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-4">
          {csat.map((p, i) => <ShelfItem key={p.id} product={p} priority={i < 2} />)}
        </div>
      </section>

      {/* 4. 고등 내신 교재 */}
      <section className="bg-sage/70 py-20 md:py-28" aria-labelledby="high">
        <div className="container-page grid gap-12 md:grid-cols-[300px_1fr] md:gap-20">
          <div className="md:sticky md:top-32 md:self-start">
            <SectionHead no="03" eyebrow="고등 내신" title="학교 시험의 방식에 맞춰" />
            <p className="mt-5 text-[15px] leading-[1.85] text-foreground/80">고1·고2·고3 국어, 수학, 영어 교재. 서술형과 중간·기말고사 대비를 학기 단위로 구성합니다.</p>
            <Link href="/category/high-school" className="mt-6 inline-block border-b border-foreground pb-0.5 text-[13px] font-medium">고등 내신 전체 보기</Link>
          </div>
          <div id="high" className="border-b border-border">{high.map((p) => <BookRow key={p.id} product={p} className="border-foreground/15" />)}</div>
        </div>
      </section>

      {/* 5. 중등 내신 교재 */}
      <section className="container-page py-20 md:py-28" aria-labelledby="middle">
        <SectionHead no="04" eyebrow="중등 내신" title="학습의 기초를 학년의 속도에" href="/category/middle-school" />
        <div className="mt-10 grid gap-10 md:grid-cols-[minmax(0,300px)_1fr] md:gap-16">
          {middle[0] && (
            <article>
              <Link href={`/books/${middle[0].slug}`} aria-label={middle[0].title}><BookCover product={middle[0]} sizes="300px" /></Link>
            </article>
          )}
          <div className="self-center">
            {middle[0] && (
              <>
                <p className="text-[13px] text-muted-foreground">{metaLine(middle[0])}</p>
                <h3 className="mt-2 text-[24px] font-bold leading-tight tracking-[-0.035em] md:text-[30px]"><Link href={`/books/${middle[0].slug}`} className="hover:underline">{middle[0].title}</Link></h3>
                {middle[0].summary && <p className="mt-4 max-w-lg text-[15px] leading-[1.85] text-muted-foreground">{middle[0].summary}</p>}
                <p className="mt-4 flex items-center gap-3 text-[15px] font-semibold tabular-nums">{effectivePrice(middle[0]) !== null ? formatPrice(effectivePrice(middle[0])!) : "가격은 출시 시 공개"}<StatusTag status={middle[0].status} /></p>
              </>
            )}
            <p className="mt-10 text-[12px] font-semibold tracking-[0.12em] text-muted-foreground">중등 교재 목록</p>
            <PlannedList items={middle.slice(1).concat(scope({ scope: "middle-school" }).filter((p) => !middle.includes(p)).slice(0, 4))} className="mt-2" />
          </div>
        </div>
      </section>

      {/* 6. 신규 교재 (판매 중인 교재가 있을 때만) */}
      {newest.length > 0 && (
        <section className="border-y border-border py-16" aria-labelledby="new">
          <div className="container-page">
            <SectionHead no="05" eyebrow="NEW" title="새로 나온 교재" href="/books?sort=latest" />
            <ul className="mt-8 flex gap-6 overflow-x-auto pb-2">
              {newest.map((p) => (
                <li key={p.id} className="w-[132px] shrink-0 md:w-[168px]">
                  <Link href={`/books/${p.slug}`} aria-label={p.title}><BookCover product={p} sizes="168px" /></Link>
                  <p className="mt-3 text-[13px] font-semibold leading-snug">{p.title}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* 7. 과목별 교재 탐색: 책등 */}
      <section className="container-page py-20 md:py-28" aria-labelledby="by-subject">
        <SectionHead no="06" eyebrow="과목" title="과목별 교재 탐색" />
        <ul id="by-subject" className="mt-10 grid grid-cols-5 gap-1.5 md:gap-2">
          {AREAS.filter((a) => a.id !== "common").map((a, i) => (
            <li key={a.id}>
              <Link href={`/books?area=${a.id}&status=all`} className="group flex h-[220px] flex-col justify-between p-3 text-[#f7f5f0] transition-[height] duration-300 hover:h-[244px] md:h-[300px] md:p-5 md:hover:h-[330px]" style={{ background: a.color }}>
                <span className="font-display text-[12px] tracking-[0.2em] opacity-80">0{i + 1}</span>
                <span className="text-[20px] font-bold tracking-[-0.03em] [writing-mode:vertical-rl] md:text-[28px]">{a.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* 8. 모의고사 및 실전 문제집 */}
      <section className="bg-primary py-20 text-background md:py-28" aria-labelledby="mock">
        <div className="container-page grid gap-12 md:grid-cols-[1fr_1.2fr] md:gap-20">
          <div>
            <SectionHead no="07" eyebrow="MOCK EXAM" title="실전의 시간과 형식으로" tone="light" />
            <p className="mt-5 max-w-sm text-[15px] leading-[1.85] text-background/75">영역별 실전 모의고사와 학년별 전국연합·평가원 대비, 시험 직전 파이널 모의고사를 시리즈로 준비합니다.</p>
            <Link href="/category/mock" className="mt-7 inline-block border-b border-background/60 pb-0.5 text-[13px] font-medium">모의고사 전체 보기</Link>
          </div>
          <ul id="mock" className="border-t border-background/25">
            {mocks.map((p) => (
              <li key={p.id} className="border-b border-background/15">
                <Link href={`/books/${p.slug}`} className="flex items-baseline justify-between gap-4 py-3.5 hover:text-background">
                  <span className="text-[16px]">{p.title}</span>
                  <span className="shrink-0 text-[12px] text-background/60">{p.status === "on_sale" ? (effectivePrice(p) !== null ? formatPrice(effectivePrice(p)!) : "") : "출시 예정"}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 9. 학습 플래너 및 무료 자료 */}
      <section className="container-page py-20 md:py-28" aria-labelledby="free">
        <SectionHead no="08" eyebrow="STUDY TOOLS" title="학습을 관리하는 자료와 도구" />
        <div id="free" className="mt-10 grid gap-14 md:grid-cols-2 md:gap-20">
          <div>
            <h3 className="border-b border-foreground/30 pb-2 text-[13px] font-semibold tracking-[0.1em] text-muted-foreground">학습 관리 자료 (PDF)</h3>
            <PlannedList items={planners} className="!grid-cols-1" />
            <Link href="/category/material" className="mt-5 inline-block border-b border-foreground pb-0.5 text-[13px] font-medium">학습자료 전체 보기</Link>
          </div>
          <div>
            <h3 className="border-b border-foreground/30 pb-2 text-[13px] font-semibold tracking-[0.1em] text-muted-foreground">무료 학습 도구</h3>
            <ul>
              {tools.map((t) => (
                <li key={t.href} className="border-b border-border">
                  <Link href={t.href} className="grid grid-cols-[1fr_auto] items-baseline gap-4 py-3 hover:bg-sage/50">
                    <span><span className="block text-[15px] font-semibold">{t.short}</span><span className="mt-0.5 block text-[13px] leading-snug text-muted-foreground">{t.desc.split(".")[0]}.</span></span>
                    <span aria-hidden>→</span>
                  </Link>
                </li>
              ))}
            </ul>
            <Link href="/study" className="mt-5 inline-block border-b border-foreground pb-0.5 text-[13px] font-medium">무료 학습 도구 전체 보기</Link>
          </div>
        </div>
      </section>

      {/* 10. 멜리사 에듀의 편집 철학 */}
      <section className="bg-sand/45 py-20 md:py-32" aria-labelledby="philosophy">
        <div className="container-page">
          <p className="font-display text-[15px] font-semibold tracking-[0.3em] text-muted-foreground">EDITORIAL PRINCIPLES</p>
          <h2 id="philosophy" className="mt-6 max-w-3xl text-[34px] font-extrabold leading-[1.2] tracking-[-0.045em] md:text-[54px]">한 권의 교재에도<br />기준이 필요합니다.</h2>
          <ol className="mt-16 grid gap-10 md:grid-cols-3 md:gap-14">
            {[
              ["근거를 밝힌다", "정답에는 풀이의 근거를 함께 싣고, 기출 문항은 출처를 표기하는 것을 원칙으로 합니다."],
              ["범위를 정확히 적는다", "교재마다 대상 학년과 교육과정, 적용 학년도를 표기해 학습자가 범위를 확인할 수 있게 합니다."],
              ["학습의 흐름을 잇는다", "개념, 기출, 변형문제, 실전 모의고사가 한 시리즈 안에서 이어지도록 구성합니다."],
            ].map(([t, b], i) => (
              <li key={t} className="border-t border-foreground/40 pt-5">
                <span className="font-display text-[15px] text-muted-foreground">0{i + 1}</span>
                <h3 className="mt-3 text-[20px] font-bold tracking-[-0.03em]">{t}</h3>
                <p className="mt-3 text-[14px] leading-[1.85] text-foreground/80">{b}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 11. 자주 묻는 질문 */}
      <section className="container-page grid gap-10 py-20 md:grid-cols-[240px_1fr] md:gap-16 md:py-28" aria-labelledby="faq">
        <SectionHead no="09" eyebrow="FAQ" title="자주 묻는 질문" className="md:block [&_h2]:text-[24px]" />
        <Accordion type="single" collapsible id="faq" className="border-t border-foreground/30">
          {faqs.map((f, i) => (
            <AccordionItem key={f.q} value={`f${i}`}><AccordionTrigger>{f.q}</AccordionTrigger><AccordionContent>{f.a}</AccordionContent></AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* 12. 고객지원 */}
      <section className="border-t border-border" aria-labelledby="support">
        <div className="container-page flex flex-col gap-8 py-14 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 id="support" className="text-[22px] font-bold tracking-[-0.03em]">교재 선택이 어렵다면 상담을 남겨 주세요.</h2>
            <p className="mt-2 text-[14px] text-muted-foreground">학년, 과목, 현재 상황을 알려 주시면 교재와 학습 순서를 안내해 드립니다. 영업일 기준 1일 이내에 답변드립니다.</p>
          </div>
          <div className="flex flex-wrap items-center gap-x-7 gap-y-3 text-[14px]">
            <Button asChild><Link href="/consult">상담 신청</Link></Button>
            <Link href="/support" className="underline underline-offset-4">고객지원 센터</Link>
            <Link href="/refund" className="underline underline-offset-4">환불·교환 정책</Link>
            {siteConfig.supportEmail && <span className="text-muted-foreground">{siteConfig.supportEmail}</span>}
          </div>
        </div>
      </section>
    </>
  );
}
