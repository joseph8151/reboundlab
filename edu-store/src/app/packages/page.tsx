import type { Metadata } from "next";
import Link from "next/link";
import { BookCover } from "@/components/books/book-cover";
import { getBundles } from "@/lib/products";
import { trackLabel } from "@/lib/catalog";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "패키지 · 교재 묶음 구성",
  description: "수능 영어 독해, 수능 국어 문학·독서, 고1 내신, 중등 영어 문법·독해 등 여러 교재를 한 번에 상담·구매하는 멜리사 에듀(MELISA EDU) 패키지.",
  alternates: { canonical: "/packages" },
};

export default async function PackagesPage() {
  const bundles = await getBundles();
  const onSale = bundles.filter((b) => b.consultable);

  return (
    <div className="container-page py-10 md:py-14">
      <p className="font-display text-[15px] font-semibold tracking-[0.24em] text-muted-foreground">PACKAGES</p>
      <h1 className="mt-2 text-[32px] font-bold tracking-[-0.03em] md:text-[40px]">패키지</h1>
      <p className="mt-4 max-w-xl text-[15px] leading-[1.8] text-muted-foreground">
        학습 흐름에 맞는 교재를 묶어 구성합니다. 패키지에는 판매 목록에 등록된 교재만 포함하며, 할인액은 포함 교재의 개별 판매가 합계와 패키지 가격의 실제 차이로 표시합니다.
      </p>

      {onSale.length > 0 && (
        <ul className="mt-12 divide-y divide-border border-y border-border">
          {onSale.map((b) => (
            <li key={b.id}>
              <Link href={`/packages/${b.slug}`} className="grid gap-5 py-7 md:grid-cols-[220px_1fr_auto] md:items-center">
                <div className="flex -space-x-6">
                  {b.items.slice(0, 3).map((p, i) => <div key={p.id} className="w-[72px] shrink-0" style={{ zIndex: 3 - i }}><BookCover product={p} sizes="72px" /></div>)}
                </div>
                <div>
                  <p className="text-[12px] text-muted-foreground">{b.track ? trackLabel(b.track) : ""} · {b.items.length}권 구성</p>
                  <h2 className="mt-1 text-[19px] font-semibold">{b.title}</h2>
                  <p className="mt-1 text-[14px] text-muted-foreground">{b.summary}</p>
                </div>
                <div className="text-right">
                  {b.price !== null && <p className="text-[18px] font-semibold tabular-nums">{formatPrice(b.price)}</p>}
                  {b.discount !== null && <p className="text-[12px] text-muted-foreground">개별 구매 대비 {formatPrice(b.discount)} 절약</p>}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

    </div>
  );
}
