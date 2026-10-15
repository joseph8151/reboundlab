import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/books/json-ld";
import { BookRow } from "@/components/books/parts";
import { Button } from "@/components/ui/button";
import { getBundleBySlug } from "@/lib/products";
import { bundleJsonLd, breadcrumbJsonLd } from "@/lib/seo";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";
type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const b = await getBundleBySlug((await params).slug);
  if (!b) return { title: "패키지를 찾을 수 없습니다", robots: { index: false } };
  const description = b.seoDescription || b.summary || `${b.title} — 멜리사 에듀(MELISA EDU) 패키지`;
  return {
    title: b.seoTitle || b.title,
    description,
    alternates: { canonical: `/packages/${b.slug}` },
    robots: b.status === "on_sale" ? undefined : { index: false, follow: true },
  };
}

export default async function PackagePage({ params }: { params: Params }) {
  const b = await getBundleBySlug((await params).slug);
  if (!b) notFound();
  const onSale = b.status === "on_sale";

  return (
    <div className="container-page py-10 md:py-14">
      <JsonLd data={bundleJsonLd(b)} />
      <JsonLd data={breadcrumbJsonLd([{ name: "홈", path: "/" }, { name: "패키지", path: "/packages" }, { name: b.title, path: `/packages/${b.slug}` }])} />
      <nav aria-label="현재 위치" className="text-[13px] text-muted-foreground"><Link href="/packages" className="hover:text-foreground">패키지</Link></nav>
      <h1 className="mt-6 text-[30px] font-bold leading-[1.2] tracking-[-0.035em] md:text-[40px]">{b.title}</h1>
      {b.summary && <p className="mt-4 max-w-xl text-[16px] leading-[1.75] text-muted-foreground">{b.summary}</p>}

      {b.items.length > 0 ? (
        <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_320px]">
          <section aria-label="포함 교재">
            <h2 className="pb-3 text-[13px] font-semibold tracking-[0.1em] text-muted-foreground">포함 교재 {b.items.length}권</h2>
            {b.items.map((p) => <BookRow key={p.id} product={p} />)}
          </section>
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="border border-border bg-card p-6">
              <dl className="space-y-2.5 text-[14px]">
                {b.listTotal !== null && <div className="flex justify-between"><dt className="text-muted-foreground">개별 판매가 합계</dt><dd className="tabular-nums">{formatPrice(b.listTotal)}</dd></div>}
                {b.totalPages !== null && <div className="flex justify-between"><dt className="text-muted-foreground">총 페이지</dt><dd className="tabular-nums">{b.totalPages}쪽</dd></div>}
                {b.discount !== null && <div className="flex justify-between"><dt className="text-muted-foreground">패키지 할인</dt><dd className="tabular-nums">−{formatPrice(b.discount)}</dd></div>}
              </dl>
              {b.price !== null && <p className="mt-5 border-t border-border pt-4 text-[26px] font-semibold tabular-nums">{formatPrice(b.price)}</p>}
              {onSale && b.purchasable ? (
                <Button asChild size="lg" className="mt-5 w-full"><Link href={`/checkout?bundle=${encodeURIComponent(b.slug)}`}>패키지 구매</Link></Button>
              ) : (
                <p className="mt-5 text-[13px] leading-relaxed text-muted-foreground">구성 교재가 모두 판매 중일 때 구매할 수 있습니다.</p>
              )}
              <p className="mt-4 text-[12px] leading-relaxed text-muted-foreground">패키지로 구매한 교재는 내 자료함에 교재별로 추가되며, 교재마다 다운로드할 수 있습니다.</p>
            </div>
          </aside>
        </div>
      ) : (
        <p className="mt-10 max-w-xl border-t border-border pt-6 text-[15px] leading-[1.8] text-muted-foreground">
          출시 예정 패키지입니다. 구성 교재와 가격은 포함될 교재가 모두 판매 중이 된 뒤에 공개합니다.
          {" "}<Link href="/books" className="text-foreground underline underline-offset-4">판매 중인 교재 보기</Link>
        </p>
      )}
    </div>
  );
}
