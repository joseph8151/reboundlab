import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth";
import { getOwnedProductIds } from "@/lib/orders";
import { getBundleBySlug, getProductBySlug } from "@/lib/products";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { isTossConfigured } from "@/lib/toss";
import { effectivePrice } from "@/lib/types";
import { CheckoutClient, type CheckoutSource } from "./checkout-client";

export const metadata: Metadata = { title: "주문·결제", robots: { index: false } };
export const dynamic = "force-dynamic";

type SP = Promise<{ buy?: string; bundle?: string }>;

export default async function CheckoutPage({ searchParams }: { searchParams: SP }) {
  const { buy, bundle } = await searchParams;
  const ready = isSupabaseConfigured() && isTossConfigured();
  const user = ready ? await getCurrentUser() : null;
  const ownedIds = user ? await getOwnedProductIds(user.id) : new Set<string>();

  let source: CheckoutSource = { mode: "cart" };
  if (bundle) {
    const b = await getBundleBySlug(bundle);
    source = {
      mode: "bundle",
      slug: bundle,
      title: b?.title ?? "",
      price: b?.purchasable ? b.price : null,
      items: (b?.items ?? []).map((p) => ({ slug: p.slug, title: p.title, unit: effectivePrice(p) })),
      ownedConflict: Boolean(b?.items.some((p) => ownedIds.has(p.id))),
    };
  } else if (buy) {
    const p = await getProductBySlug(buy);
    source = { mode: "direct", item: p ? { slug: p.slug, title: p.title, unit: effectivePrice(p), purchasable: p.purchasable, owned: ownedIds.has(p.id) } : null };
  }

  // 장바구니 모드에서 이미 구매한 교재를 걸러 내기 위해 슬러그 목록을 내려줍니다.
  let ownedSlugs: string[] = [];
  if (ownedIds.size) {
    const { getCatalog } = await import("@/lib/products");
    ownedSlugs = (await getCatalog()).filter((p) => ownedIds.has(p.id)).map((p) => p.slug);
  }

  return (
    <div className="container-page max-w-4xl py-10 md:py-14">
      <h1 className="text-[30px] font-bold tracking-[-0.03em] md:text-[36px]">주문·결제</h1>
      <CheckoutClient
        ready={ready}
        clientKey={process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY ?? ""}
        customerKey={user?.id ?? ""}
        source={source}
        ownedSlugs={ownedSlugs}
      />
    </div>
  );
}
