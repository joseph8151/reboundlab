import type { Metadata } from "next";
import { Suspense } from "react";
import { ProductCard } from "@/components/product-card";
import { ProductFilters, SortSelect } from "@/components/product-filters";
import { gradeLabel, isGrade, isSubject, isType, subjectLabel, typeLabel } from "@/lib/catalog";
import { getProducts, type ProductFilters as Filters } from "@/lib/products";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function parseFilters(sp: Record<string, string | string[] | undefined>): Filters {
  const one = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : undefined);
  const sort = one("sort");
  return {
    subject: isSubject(one("subject")) ? (one("subject") as Filters["subject"]) : undefined,
    grade: isGrade(one("grade")) ? (one("grade") as Filters["grade"]) : undefined,
    type: isType(one("type")) ? (one("type") as Filters["type"]) : undefined,
    q: one("q"),
    sort: sort === "price-asc" || sort === "price-desc" ? sort : "recent",
  };
}

function headingFor(f: Filters) {
  const parts = [f.grade && gradeLabel(f.grade), f.subject && subjectLabel(f.subject), f.type && typeLabel(f.type)].filter(Boolean);
  return parts.length ? `${parts.join(" ")} 자료` : "전체 자료";
}

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const f = parseFilters(await searchParams);
  const heading = headingFor(f);
  const description = `${heading} 목록입니다. 수능·내신 기출, 변형문제, 스터디가이드, 자기주도학습 자료를 샘플로 먼저 확인하고 PDF로 바로 내려받으세요.`;
  return {
    title: heading,
    description,
    openGraph: { title: heading, description, url: "/products" },
    alternates: { canonical: "/products" },
  };
}

export default async function ProductsPage({ searchParams }: { searchParams: SearchParams }) {
  const filters = parseFilters(await searchParams);
  const products = await getProducts(filters);

  return (
    <div className="container-page py-10 sm:py-14">
      <h1 className="text-2xl font-bold sm:text-3xl">{headingFor(filters)}</h1>
      <p className="mt-2 text-[15px] text-muted-foreground">모든 자료는 샘플 미리보기를 제공하며, 결제 후 바로 내려받을 수 있습니다.</p>

      <div className="mt-8 rounded-2xl border border-border p-4 sm:p-6">
        <Suspense>
          <ProductFilters />
        </Suspense>
      </div>

      <div className="mt-8 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {filters.q && <span className="font-semibold text-foreground">‘{filters.q}’ 검색 결과 </span>}총 {products.length}개
        </p>
        <Suspense>
          <SortSelect />
        </Suspense>
      </div>

      {products.length > 0 ? (
        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <div className="mt-5 rounded-2xl border border-dashed border-border py-20 text-center">
          <p className="font-semibold">조건에 맞는 자료가 아직 없습니다</p>
          <p className="mt-2 text-sm text-muted-foreground">필터를 줄이거나 다른 검색어로 찾아보세요.</p>
        </div>
      )}
    </div>
  );
}
