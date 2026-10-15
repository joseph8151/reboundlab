"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { shelfActions, useShelf } from "@/lib/shelf";

/** 담기·바로 구매·위시리스트. 담은 목록은 이 브라우저에만 저장됩니다. */
export function BuyActions({ slug, purchasable, compact = false }: { slug: string; purchasable: boolean; compact?: boolean }) {
  const router = useRouter();
  const { cart, wishlist } = useShelf();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const inCart = mounted && cart.includes(slug);
  const wished = mounted && wishlist.includes(slug);

  if (!purchasable) return null;
  return (
    <div className={compact ? "flex min-w-0 flex-1 gap-2" : "space-y-3"}>
      <div className={compact ? "flex min-w-0 flex-1 gap-2" : "grid grid-cols-2 gap-3"}>
        {inCart ? (
          <Button asChild variant="outline" size={compact ? "default" : "lg"} className={compact ? "min-w-0 flex-1 px-2 text-[13px]" : undefined}>
            <Link href="/cart">장바구니 보기</Link>
          </Button>
        ) : (
          <Button variant="outline" size={compact ? "default" : "lg"} className={compact ? "min-w-0 flex-1 px-2 text-[13px]" : undefined} onClick={() => shelfActions.addToCart(slug)}>장바구니 담기</Button>
        )}
        <Button size={compact ? "default" : "lg"} className={compact ? "min-w-0 flex-1 px-2 text-[13px]" : undefined} onClick={() => router.push(`/checkout?buy=${encodeURIComponent(slug)}`)}>바로 구매</Button>
      </div>
      {!compact && (
        <button type="button" onClick={() => shelfActions.toggleWishlist(slug)} aria-pressed={wished} className="text-[13px] text-muted-foreground underline underline-offset-4 hover:text-foreground">
          {wished ? "위시리스트에서 빼기" : "위시리스트에 담기"}
          <span className="ml-1 text-[12px] no-underline">(이 기기에 저장)</span>
        </button>
      )}
    </div>
  );
}

/** 상세 페이지를 열면 '최근 본 교재'에 기록합니다. */
export function RecentTracker({ slug }: { slug: string }) {
  useEffect(() => shelfActions.pushRecent(slug), [slug]);
  return null;
}
