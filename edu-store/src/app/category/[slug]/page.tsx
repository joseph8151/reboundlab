import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/books/json-ld";
import { PlannedList, ShelfItem } from "@/components/books/parts";
import { COURSE_PLAN, kindLabel } from "@/lib/catalog";
import { CATEGORIES, getCategory } from "@/lib/categories";
import { applyFilters, getCatalog, sortProducts } from "@/lib/products";
import { absolute, breadcrumbJsonLd } from "@/lib/seo";

export const dynamic = "force-dynamic";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const c = getCategory((await params).slug);
  if (!c) return { title: "카테고리를 찾을 수 없습니다", robots: { index: false } };
  return {
    title: c.seoTitle,
    description: c.seoDescription,
    alternates: { canonical: `/category/${c.slug}` },
    openGraph: { title: c.seoTitle, description: c.seoDescription, url: `/category/${c.slug}` },
  };
}

export default async function CategoryPage({ params }: { params: Params }) {
  const c = getCategory((await params).slug);
  if (!c) notFound();
  const catalog = await getCatalog();
  const all = sortProducts(applyFilters(catalog, { ...c.filter, status: "all" }), "recommended");
  const onSale = all.filter((p) => p.status === "on_sale");
  const planned = all.filter((p) => p.status === "coming_soon");
  const parent = c.parent ? getCategory(c.parent) : null;
  const children = (c.children ?? []).map((s) => getCategory(s)!).filter(Boolean);
  const siblings = parent ? (parent.children ?? []).filter((s) => s !== c.slug).map((s) => getCategory(s)!) : [];
  const plan = c.courseTable ? COURSE_PLAN[c.courseTable] : null;

  const crumbs = [{ name: "홈", path: "/" }, ...(parent ? [{ name: parent.short, path: `/category/${parent.slug}` }] : []), { name: c.short, path: `/category/${c.slug}` }];

  return (
    <div className="pb-4">
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      {onSale.length > 0 && (
        <JsonLd data={{ "@context": "https://schema.org", "@type": "ItemList", itemListElement: onSale.map((p, i) => ({ "@type": "ListItem", position: i + 1, url: absolute(`/books/${p.slug}`), name: p.title })) }} />
      )}

      <header className="border-b border-border">
        <div className="container-page pb-12 pt-6 md:pb-16">
          <nav aria-label="현재 위치" className="text-[13px] text-muted-foreground">
            <Link href="/" className="hover:text-foreground">홈</Link>
            {parent && <><span className="mx-2">/</span><Link href={`/category/${parent.slug}`} className="hover:text-foreground">{parent.short}</Link></>}
          </nav>
          <div className="mt-8 grid gap-8 md:grid-cols-[1fr_1fr] md:gap-16">
            <div>
              <h1 className="text-[34px] font-bold leading-[1.2] tracking-[-0.04em] md:text-[48px]">{c.title}</h1>
              <p className="mt-4 text-[17px] leading-[1.6] text-muted-foreground">{c.lead}</p>
            </div>
            <div className="max-w-xl space-y-4 text-[15px] leading-[1.85] md:pt-3">
              {c.intro.map((t) => <p key={t}>{t}</p>)}
            </div>
          </div>
          {(children.length > 0 || c.slug === "high-school" || c.slug === "middle-school") && (
            <ul className="mt-10 flex flex-wrap gap-x-7 gap-y-2 border-t border-border pt-5 text-[15px]">
              {children.map((k) => <li key={k.slug}><Link href={`/category/${k.slug}`} className="underline decoration-border underline-offset-[6px] hover:decoration-foreground">{k.short.replace("수능 ", "")}</Link></li>)}
              {c.slug === "high-school" && ["high1", "high2", "high3"].map((l, i) => <li key={l}><Link href={`/books?level=${l}&status=all`} className="underline decoration-border underline-offset-[6px] hover:decoration-foreground">고{i + 1}</Link></li>)}
              {c.slug === "middle-school" && ["middle1", "middle2", "middle3"].map((l, i) => <li key={l}><Link href={`/books?level=${l}&status=all`} className="underline decoration-border underline-offset-[6px] hover:decoration-foreground">중{i + 1}</Link></li>)}
            </ul>
          )}
        </div>
      </header>

      <section className="container-page py-14" aria-labelledby="on-sale">
        <div className="flex items-end justify-between">
          <h2 id="on-sale" className="text-[22px] font-bold tracking-[-0.02em]">판매 중인 교재</h2>
          {onSale.length > 0 && <Link href={`/books?${new URLSearchParams({ ...(c.filter.area ? { area: c.filter.area } : {}), ...(c.filter.kind ? { kind: c.filter.kind } : {}) }).toString()}`} className="border-b border-foreground/50 pb-0.5 text-[13px] font-medium">필터로 더 보기</Link>}
        </div>
        {onSale.length > 0 ? (
          <div className="mt-8 grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-4">
            {onSale.map((p, i) => <ShelfItem key={p.id} product={p} priority={i < 4} />)}
          </div>
        ) : (
          <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
            이 분류에서 지금 구매할 수 있는 교재는 아직 없습니다. 아래 출시 예정 교재가 준비되는 대로 판매를 시작합니다.
          </p>
        )}
      </section>

      {plan && (
        <section className="border-t border-border bg-sage/50 py-14" aria-labelledby="courses">
          <div className="container-page">
            <h2 id="courses" className="text-[22px] font-bold tracking-[-0.02em]">{plan.label} 과목별 시리즈</h2>
            <p className="mt-2 max-w-xl text-[14px] leading-relaxed text-muted-foreground">과목마다 개념 정리, 기출 분석, 고난도 문제, 실전 모의고사를 순서대로 준비합니다. 판매 중인 교재가 있는 칸만 링크로 연결됩니다.</p>
            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[560px] border-collapse text-left text-[14px]">
                <thead>
                  <tr className="border-b border-foreground/30 text-[12px] tracking-[0.08em] text-muted-foreground">
                    <th className="py-2 pr-4 font-semibold">과목</th>
                    {plan.kinds.map((k) => <th key={k} className="py-2 pr-4 font-semibold">{kindLabel(k)}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {plan.courses.map((course) => (
                    <tr key={course} className="border-b border-border">
                      <th className="py-3 pr-4 font-semibold">{course}</th>
                      {plan.kinds.map((k) => {
                        const n = onSale.filter((p) => p.course?.startsWith(course) && p.kind === k).length;
                        return (
                          <td key={k} className="py-3 pr-4">
                            {n > 0 ? <Link className="underline underline-offset-4" href={`/books?${new URLSearchParams({ area: c.filter.area!, kind: k }).toString()}`}>{n}권</Link> : <span className="text-muted-foreground">준비 중</span>}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {c.courseTable === "science" && (
              <p className="mt-5 max-w-2xl text-[13px] leading-relaxed text-muted-foreground">
                교육과정별 과목명 — 2015 개정: {COURSE_PLAN.science.courseNamesByCurriculum["2015"].join(", ")} / 2022 개정: {COURSE_PLAN.science.courseNamesByCurriculum["2022"].join(", ")}. 교재마다 적용 교육과정을 표기합니다.
              </p>
            )}
          </div>
        </section>
      )}

      {planned.length > 0 && (
        <section className="container-page py-14" aria-labelledby="planned">
          <details>
            <summary className="flex cursor-pointer list-none items-baseline justify-between border-b border-foreground/30 pb-3">
              <h2 id="planned" className="text-[18px] font-bold tracking-[-0.02em]">출시 예정 교재 <span className="ml-1 text-[14px] font-normal text-muted-foreground">{planned.length}권</span></h2>
              <span className="text-[13px] text-muted-foreground">목록 보기</span>
            </summary>
            <p className="mt-4 max-w-xl text-[13px] leading-relaxed text-muted-foreground">준비 중인 교재입니다. 출시 일정과 교육과정·학년도는 확정되는 대로 각 교재 페이지에 안내합니다.</p>
            <PlannedList items={planned} className="mt-4" />
          </details>
        </section>
      )}

      <section className="container-page py-10">
        <p className="text-[12px] font-semibold tracking-[0.12em] text-muted-foreground">다른 분류</p>
        <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-[15px]">
          {(siblings.length ? siblings : CATEGORIES.filter((x) => !x.parent && x.slug !== c.slug)).map((x) => (
            <li key={x.slug}><Link href={`/category/${x.slug}`} className="underline decoration-border underline-offset-4 hover:decoration-foreground">{x.short}</Link></li>
          ))}
          <li><Link href="/packages" className="underline decoration-border underline-offset-4 hover:decoration-foreground">패키지</Link></li>
        </ul>
      </section>
    </div>
  );
}
