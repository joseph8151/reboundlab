import type { Metadata } from "next";
import Link from "next/link";
import { Pager } from "@/components/books/pager";
import { ShelfItem } from "@/components/books/parts";
import {
  AREAS, CURRICULA, DIFFICULTIES, KINDS, LEVEL_GROUPS, LEVELS, PRICE_BANDS,
  isOneOf, type AreaId,
} from "@/lib/catalog";
import { CATEGORIES } from "@/lib/categories";
import { getCatalog, getPopularity, getProducts, PAGE_SIZE, parseSearchQuery, type ProductFilters, type SortId } from "@/lib/products";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

type SP = Promise<Record<string, string | string[] | undefined>>;

const SORTS: { id: SortId; label: string }[] = [
  { id: "recommended", label: "추천순" },
  { id: "latest", label: "최신 등록순" },
  { id: "price-asc", label: "가격 낮은순" },
  { id: "price-desc", label: "가격 높은순" },
  { id: "title", label: "상품명순" },
];

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

function readFilters(sp: Record<string, string | string[] | undefined>, onSaleCount: number): ProductFilters & { statusRaw?: string } {
  const g = (k: string) => first(sp[k]);
  const level = g("level");
  const status = g("status");
  return {
    q: g("q")?.slice(0, 60),
    level: level && (LEVEL_GROUPS.some((x) => x.id === level) || LEVELS.some((x) => x.id === level)) ? level : undefined,
    area: isOneOf(AREAS, g("area")) ? (g("area") as AreaId) : undefined,
    kind: isOneOf(KINDS, g("kind")) ? (g("kind") as ProductFilters["kind"]) : undefined,
    difficulty: isOneOf(DIFFICULTIES, g("difficulty")) ? (g("difficulty") as ProductFilters["difficulty"]) : undefined,
    price: isOneOf(PRICE_BANDS, g("price")) ? (g("price") as ProductFilters["price"]) : undefined,
    curriculum: isOneOf(CURRICULA, g("curriculum")) ? (g("curriculum") as ProductFilters["curriculum"]) : undefined,
    examYear: Number(g("year")) || undefined,
    // 판매 중인 교재가 하나도 없으면 빈 화면 대신 전체를 보여 줍니다.
    status: status === "coming_soon" || status === "all" || status === "on_sale" ? status : onSaleCount === 0 ? "all" : "on_sale",
    sort: SORTS.some((s) => s.id === g("sort")) || g("sort") === "popular" ? (g("sort") as SortId) : "recommended",
    page: Math.max(1, Number(g("page")) || 1),
  };
}

export async function generateMetadata({ searchParams }: { searchParams: SP }): Promise<Metadata> {
  const sp = await searchParams;
  const filtered = Object.keys(sp).length > 0;
  return {
    title: "전체 교재 · 수능 문제집, 내신 문제집 PDF",
    description: "멜리사 에듀(MELISA EDU)의 수능·고등 내신·중등 내신 교재를 학년, 과목, 유형, 난이도, 가격대로 찾아보세요. 모든 교재는 PDF로 제공됩니다.",
    alternates: { canonical: "/books" },
    // 필터·검색·페이지 조합이 색인에 중복 등록되지 않도록 합니다.
    robots: filtered ? { index: false, follow: true } : undefined,
  };
}

export default async function BooksPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const catalog = await getCatalog();
  const onSaleCount = catalog.filter((p) => p.status === "on_sale").length;
  const f = readFilters(sp, onSaleCount);
  const popularity = await getPopularity();
  const { items, total, page } = await getProducts(f);
  const parsed = f.q ? parseSearchQuery(f.q) : null;

  const base: Record<string, string> = {};
  const put = (k: string, v: unknown) => v !== undefined && v !== "" && void (base[k] = String(v));
  put("q", f.q); put("level", f.level); put("area", f.area); put("kind", f.kind); put("difficulty", f.difficulty);
  put("price", f.price); put("curriculum", f.curriculum); put("year", f.examYear);
  put("status", first(sp.status)); put("sort", first(sp.sort));
  const href = (patch: Record<string, string | null>) => {
    const next = { ...base };
    for (const [k, v] of Object.entries(patch)) v === null ? delete next[k] : (next[k] = v);
    const qs = new URLSearchParams(next).toString();
    return `/books${qs ? `?${qs}` : ""}`;
  };

  const years = [...new Set(catalog.map((p) => p.examYear).filter((y): y is number => y !== null))].sort((a, b) => b - a);
  const hasCurriculum = catalog.some((p) => p.curriculum);
  const middleSelected = f.level === "middle" || LEVELS.some((l) => l.id === f.level && l.group === "middle");

  const group = (title: string, children: React.ReactNode) => (
    <fieldset className="border-t border-border py-4">
      <legend className="float-left w-full pb-2 text-[12px] font-semibold tracking-[0.1em] text-muted-foreground">{title}</legend>
      <ul className="clear-both space-y-1.5 text-[14px]">{children}</ul>
    </fieldset>
  );
  const opt = (label: string, active: boolean, to: string) => (
    <li key={label + to}>
      <Link href={to} aria-current={active ? "true" : undefined} className={cn("block py-0.5", active ? "font-semibold text-foreground underline underline-offset-4" : "text-muted-foreground hover:text-foreground")}>{label}</Link>
    </li>
  );

  const filters = (
    <>
      {group("학년", <>
        {opt("전체", !f.level, href({ level: null, page: null }))}
        {LEVEL_GROUPS.map((l) => opt(l.label, f.level === l.id, href({ level: l.id, page: null })))}
        {middleSelected && (
          <li className="flex gap-3 pl-3 pt-1 text-[13px]">
            {LEVELS.filter((l) => l.group === "middle").map((l) => (
              <Link key={l.id} href={href({ level: f.level === l.id ? "middle" : l.id, page: null })} className={cn(f.level === l.id ? "font-semibold underline underline-offset-4" : "text-muted-foreground hover:text-foreground")}>{l.label}</Link>
            ))}
          </li>
        )}
      </>)}
      {group("과목", <>
        {opt("전체", !f.area, href({ area: null, page: null }))}
        {AREAS.filter((a) => a.id !== "common").map((a) => opt(a.label, f.area === a.id, href({ area: a.id, page: null })))}
      </>)}
      {group("유형", <>
        {opt("전체", !f.kind, href({ kind: null, page: null }))}
        {KINDS.map((k) => opt(k.label, f.kind === k.id, href({ kind: k.id, page: null })))}
      </>)}
      {group("난이도", <>
        {opt("전체", !f.difficulty, href({ difficulty: null, page: null }))}
        {DIFFICULTIES.map((d) => opt(d.label, f.difficulty === d.id, href({ difficulty: d.id, page: null })))}
      </>)}
      {group("가격대", <>
        {opt("전체", !f.price, href({ price: null, page: null }))}
        {PRICE_BANDS.map((b) => opt(b.label, f.price === b.id, href({ price: b.id, page: null })))}
      </>)}
      {years.length > 0 && group("학년도", <>
        {opt("전체", !f.examYear, href({ year: null, page: null }))}
        {years.map((y) => opt(`${y}학년도`, f.examYear === y, href({ year: String(y), page: null })))}
      </>)}
      {hasCurriculum && group("교육과정", <>
        {opt("전체", !f.curriculum, href({ curriculum: null, page: null }))}
        {CURRICULA.map((c) => opt(c.label, f.curriculum === c.id, href({ curriculum: c.id, page: null })))}
      </>)}
    </>
  );

  const activeFilterCount = [f.level, f.area, f.kind, f.difficulty, f.price, f.curriculum, f.examYear].filter(Boolean).length;
  const sorts = popularity ? [...SORTS, { id: "popular" as SortId, label: "인기순" }] : SORTS;
  const statusTabs: { id: "on_sale" | "coming_soon" | "all"; label: string }[] = [
    { id: "on_sale", label: "판매 중" },
    { id: "coming_soon", label: "출시 예정" },
    { id: "all", label: "전체" },
  ];

  return (
    <div className="container-page py-10 md:py-14">
      <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-display text-[15px] font-semibold tracking-[0.24em] text-muted-foreground">BOOKS</p>
          <h1 className="mt-2 text-[32px] font-bold tracking-[-0.03em] md:text-[40px]">전체 교재</h1>
        </div>
        <form action="/books" role="search" className="flex w-full items-center gap-3 border-b border-foreground pb-2 md:w-[360px]">
          <input name="q" defaultValue={f.q ?? ""} type="search" aria-label="교재 검색" placeholder="교재명, 학년, 과목, 키워드 (예: 고1 수학)" className="w-full bg-transparent text-[15px] outline-none placeholder:text-muted-foreground/80" />
          <input type="hidden" name="status" value="all" />
          <button type="submit" className="shrink-0 text-[14px] font-semibold">검색</button>
        </form>
      </header>

      <div className="mt-8 grid gap-x-12 gap-y-8 md:grid-cols-[200px_1fr]">
        <aside>
          <details className="group md:hidden" open={activeFilterCount > 0}>
            <summary className="flex cursor-pointer list-none items-center justify-between border-y border-border py-3 text-[14px] font-semibold">
              필터{activeFilterCount > 0 && ` (${activeFilterCount})`}<span aria-hidden className="text-muted-foreground group-open:rotate-45">+</span>
            </summary>
            <div className="pb-2">{filters}</div>
          </details>
          <div className="hidden md:block">{filters}</div>
        </aside>

        <section aria-label="교재 목록">
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-b border-border pb-3 text-[14px]">
            <div className="flex gap-5">
              {statusTabs.map((t) => (
                <Link key={t.id} href={href({ status: t.id, page: null })} aria-current={f.status === t.id ? "true" : undefined} className={cn("pb-1", f.status === t.id ? "border-b border-foreground font-semibold" : "text-muted-foreground hover:text-foreground")}>{t.label}</Link>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-muted-foreground">
              {sorts.map((s) => (
                <Link key={s.id} href={href({ sort: s.id === "recommended" ? null : s.id, page: null })} className={cn(f.sort === s.id ? "font-semibold text-foreground underline underline-offset-4" : "hover:text-foreground")}>{s.label}</Link>
              ))}
            </div>
          </div>

          <p className="mt-4 text-[13px] text-muted-foreground" aria-live="polite">
            {f.q && <>‘{f.q}’ 검색 결과 </>}총 {total}권
            {parsed && (Object.keys(parsed.filters).length > 0) && <> · 검색어에서 학년·과목·유형 조건을 함께 적용했습니다</>}
          </p>

          {items.length > 0 ? (
            <>
              <div className="mt-6 grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-3 xl:grid-cols-4">
                {items.map((p, i) => <ShelfItem key={p.id} product={p} priority={i < 4} />)}
              </div>
              <Pager page={page} total={total} pageSize={PAGE_SIZE} hrefFor={(n) => href({ page: n === 1 ? null : String(n) })} />
            </>
          ) : (
            <div className="mt-10 border-t border-border pt-10">
              <p className="text-[18px] font-semibold">조건에 맞는 교재를 찾지 못했습니다.</p>
              <ul className="mt-4 list-disc space-y-1.5 pl-5 text-[14px] leading-relaxed text-muted-foreground">
                <li>필터를 줄이거나 ‘전체’ 탭에서 출시 예정 교재까지 함께 확인해 보세요.</li>
                <li>학년과 과목으로 검색할 수 있습니다. 예: ‘고1 수학’, ‘수능 영어 빈칸’, ‘중등 문법’</li>
                <li>찾는 교재가 없다면 <Link href="/consult" className="text-foreground underline underline-offset-4">상담 신청</Link>으로 알려 주세요.</li>
              </ul>
              <p className="mt-8 text-[12px] font-semibold tracking-[0.1em] text-muted-foreground">카테고리로 찾아보기</p>
              <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-[15px]">
                {CATEGORIES.filter((c) => !c.parent).map((c) => (
                  <li key={c.slug}><Link href={`/category/${c.slug}`} className="underline underline-offset-4">{c.short}</Link></li>
                ))}
                <li><Link href="/packages" className="underline underline-offset-4">패키지</Link></li>
              </ul>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
