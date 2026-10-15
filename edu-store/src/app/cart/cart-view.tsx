"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BookCover } from "@/components/books/book-cover";
import { resolveSlugs, type ResolvedItem } from "@/components/books/cart-items";
import { metaLine } from "@/components/books/parts";
import { Button } from "@/components/ui/button";
import { shelfActions, useShelf } from "@/lib/shelf";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/lib/types";

type Item = Extract<ResolvedItem, { missing?: false }>;

export function CartView() {
  const router = useRouter();
  const { cart, wishlist } = useShelf();
  const [items, setItems] = useState<ResolvedItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const key = cart.join("|");

  useEffect(() => {
    let live = true;
    resolveSlugs(cart).then((r) => live && setItems(r)).catch((e) => live && setError((e as Error).message));
    return () => void (live = false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  if (error) return <p role="alert" className="mt-8 text-destructive">{error}</p>;
  if (items === null && cart.length > 0) return <p className="mt-10 text-muted-foreground">불러오는 중…</p>;

  const resolved = (items ?? []).filter((i): i is Item => !i.missing);
  const buyable = resolved.filter((i) => i.purchasable);
  const total = buyable.reduce((s, i) => s + (i.unit ?? 0), 0);

  if (cart.length === 0) {
    return (
      <div className="mt-10 border-t border-border pt-10">
        <p className="text-[18px] font-semibold">장바구니가 비어 있습니다.</p>
        <p className="mt-2 text-[14px] text-muted-foreground">마음에 드는 교재를 담아 한 번에 결제할 수 있습니다.</p>
        <Button asChild className="mt-6"><Link href="/books">교재 둘러보기</Link></Button>
        <Wishlist slugs={wishlist} />
      </div>
    );
  }

  return (
    <div className="mt-8 grid gap-12 lg:grid-cols-[1fr_320px]">
      <section aria-label="담은 교재">
        <ul className="border-b border-border">
          {(items ?? []).map((i) =>
            i.missing ? (
              <li key={i.slug} className="flex items-center justify-between border-t border-border py-5 text-[14px] text-muted-foreground">
                더 이상 판매하지 않는 교재입니다.
                <button className="underline underline-offset-4" onClick={() => shelfActions.removeFromCart(i.slug)}>삭제</button>
              </li>
            ) : (
              <li key={i.slug} className="grid grid-cols-[72px_1fr_auto] gap-4 border-t border-border py-5 sm:grid-cols-[88px_1fr_auto] sm:gap-6">
                <Link href={`/books/${i.slug}`}><BookCover product={i} sizes="88px" /></Link>
                <div className="min-w-0">
                  <p className="text-[12px] text-muted-foreground">{metaLine(i as unknown as Product)}</p>
                  <Link href={`/books/${i.slug}`} className="mt-1 block text-[16px] font-semibold leading-snug hover:underline">{i.title}</Link>
                  {!i.purchasable && <p className="mt-2 text-[13px] text-destructive">지금은 구매할 수 없는 교재입니다. 결제 대상에서 제외됩니다.</p>}
                  <button className="mt-3 text-[13px] text-muted-foreground underline underline-offset-4" onClick={() => shelfActions.removeFromCart(i.slug)}>삭제</button>
                </div>
                <p className="text-[16px] font-semibold tabular-nums">{i.unit !== null ? formatPrice(i.unit) : "-"}</p>
              </li>
            ),
          )}
        </ul>
        <Wishlist slugs={wishlist} />
      </section>

      <aside className="lg:sticky lg:top-28 lg:self-start">
        <div className="border border-border bg-card p-6">
          <dl className="space-y-2 text-[14px]">
            <div className="flex justify-between"><dt className="text-muted-foreground">교재 {buyable.length}권</dt><dd className="tabular-nums">{formatPrice(total)}</dd></div>
          </dl>
          <p className="mt-4 flex justify-between border-t border-border pt-4 text-[20px] font-semibold"><span>결제 예정 금액</span><span className="tabular-nums">{formatPrice(total)}</span></p>
          <Button size="lg" className="mt-5 w-full" disabled={buyable.length === 0} onClick={() => router.push("/checkout")}>주문하기</Button>
          <p className="mt-4 text-[12px] leading-relaxed text-muted-foreground">장바구니는 이 기기의 브라우저에 저장됩니다. 가격과 판매 상태는 결제 직전에 다시 확인합니다.</p>
        </div>
      </aside>
    </div>
  );
}

function Wishlist({ slugs }: { slugs: string[] }) {
  const [items, setItems] = useState<ResolvedItem[]>([]);
  const key = slugs.join("|");
  useEffect(() => {
    let live = true;
    resolveSlugs(slugs).then((r) => live && setItems(r)).catch(() => {});
    return () => void (live = false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  const list = items.filter((i): i is Item => !i.missing);
  if (!list.length) return null;
  return (
    <section className="mt-14" aria-label="위시리스트">
      <h2 className="text-[13px] font-semibold tracking-[0.1em] text-muted-foreground">위시리스트 <span className="font-normal">(이 기기에 저장)</span></h2>
      <ul className="mt-3 border-b border-border">
        {list.map((i) => (
          <li key={i.slug} className="flex items-center justify-between gap-4 border-t border-border py-3 text-[14px]">
            <Link href={`/books/${i.slug}`} className="hover:underline">{i.title}</Link>
            <span className="flex shrink-0 gap-4">
              {i.purchasable && <button className="underline underline-offset-4" onClick={() => shelfActions.addToCart(i.slug)}>장바구니 담기</button>}
              <button className="text-muted-foreground underline underline-offset-4" onClick={() => shelfActions.toggleWishlist(i.slug)}>빼기</button>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
