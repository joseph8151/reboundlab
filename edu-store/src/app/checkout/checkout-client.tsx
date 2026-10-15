"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { loadTossPayments, type TossPaymentsWidgets } from "@tosspayments/tosspayments-sdk";
import { resolveSlugs, type ResolvedItem } from "@/components/books/cart-items";
import { Button } from "@/components/ui/button";
import { useShelf } from "@/lib/shelf";
import { formatPrice } from "@/lib/utils";

export type CheckoutSource =
  | { mode: "cart" }
  | { mode: "direct"; item: { slug: string; title: string; unit: number | null; purchasable: boolean; owned: boolean } | null }
  | { mode: "bundle"; slug: string; title: string; price: number | null; items: { slug: string; title: string; unit: number | null }[]; ownedConflict: boolean };

type Line = { slug: string; title: string; unit: number };
type Props = { ready: boolean; clientKey: string; customerKey: string; source: CheckoutSource; ownedSlugs: string[] };

export function CheckoutClient({ ready, clientKey, customerKey, source, ownedSlugs }: Props) {
  const router = useRouter();
  const { cart } = useShelf();
  const [cartItems, setCartItems] = useState<ResolvedItem[] | null>(null);
  const cartKey = cart.join("|");

  useEffect(() => {
    if (source.mode !== "cart") return;
    let live = true;
    resolveSlugs(cart).then((r) => live && setCartItems(r)).catch(() => live && setCartItems([]));
    return () => void (live = false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartKey, source.mode]);

  // 결제할 줄 목록과 합계 (서버가 주문 생성 시 다시 계산하므로 여기 값은 화면 표시용)
  const { lines, total, problem, payload, label } = useMemo(() => {
    const owned = new Set(ownedSlugs);
    if (source.mode === "bundle") {
      const ok = source.price !== null && source.items.length >= 2 && !source.ownedConflict;
      return {
        lines: source.items.map((i) => ({ slug: i.slug, title: i.title, unit: i.unit ?? 0 })),
        total: source.price ?? 0,
        problem: !source.title ? "패키지를 찾을 수 없습니다." : source.ownedConflict ? "이미 구매한 교재가 포함된 패키지입니다. 나머지 교재를 개별로 구매해 주세요." : !ok ? "지금 구매할 수 없는 패키지입니다." : null,
        payload: { bundle: source.slug },
        label: source.title,
      };
    }
    if (source.mode === "direct") {
      const i = source.item;
      if (!i) return { lines: [] as Line[], total: 0, problem: "교재를 찾을 수 없습니다.", payload: {}, label: "" };
      return {
        lines: i.unit !== null ? [{ slug: i.slug, title: i.title, unit: i.unit }] : [],
        total: i.unit ?? 0,
        problem: i.owned ? "이미 구매한 교재입니다. 내 자료함에서 내려받을 수 있습니다." : !i.purchasable ? "지금은 구매할 수 없는 교재입니다." : null,
        payload: { slugs: [i.slug] },
        label: i.title,
      };
    }
    const ls = (cartItems ?? []).filter((x): x is Extract<ResolvedItem, { missing?: false }> => !x.missing && x.purchasable && x.unit !== null && !owned.has(x.slug)).map((x) => ({ slug: x.slug, title: x.title, unit: x.unit as number }));
    return {
      lines: ls,
      total: ls.reduce((s, l) => s + l.unit, 0),
      problem: cartItems && cart.length === 0 ? "장바구니가 비어 있습니다." : cartItems && ls.length === 0 ? "결제할 수 있는 교재가 없습니다." : null,
      payload: { slugs: ls.map((l) => l.slug) },
      label: ls.length === 1 ? ls[0].title : ls.length > 1 ? `${ls[0].title} 외 ${ls.length - 1}권` : "",
    };
  }, [source, cartItems, cart.length, ownedSlugs]);

  const widgetsRef = useRef<TossPaymentsWidgets | null>(null);
  const [widgetReady, setWidgetReady] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canPay = ready && !problem && total > 0;

  useEffect(() => {
    if (!canPay) return;
    let cancelled = false;
    setWidgetReady(false);
    (async () => {
      try {
        const toss = await loadTossPayments(clientKey);
        const widgets = toss.widgets({ customerKey });
        await widgets.setAmount({ currency: "KRW", value: total });
        await Promise.all([
          widgets.renderPaymentMethods({ selector: "#payment-method", variantKey: "DEFAULT" }),
          widgets.renderAgreement({ selector: "#agreement", variantKey: "AGREEMENT" }),
        ]);
        if (!cancelled) {
          widgetsRef.current = widgets;
          setWidgetReady(true);
        }
      } catch (e) {
        console.error(e);
        if (!cancelled) setError("결제 화면을 불러오지 못했습니다. 새로고침 후 다시 시도해 주세요.");
      }
    })();
    return () => void (cancelled = true);
  }, [canPay, clientKey, customerKey, total]);

  async function pay() {
    if (!widgetsRef.current) return;
    if (!agreed) return setError("디지털 콘텐츠 청약철회 제한 안내에 동의해 주세요.");
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const order = await res.json();
      if (!res.ok) throw new Error(order.message ?? "주문을 만들지 못했습니다.");
      if (order.alreadyOwned) return void router.push("/mypage");
      // 서버가 정한 금액으로 다시 맞춘 뒤 결제를 요청합니다.
      await widgetsRef.current.setAmount({ currency: "KRW", value: order.amount });
      await widgetsRef.current.requestPayment({
        orderId: order.orderId,
        orderName: order.orderName,
        customerEmail: order.customerEmail ?? undefined,
        successUrl: `${window.location.origin}/checkout/success`,
        failUrl: `${window.location.origin}/checkout/fail`,
      });
    } catch (e) {
      // 사용자가 결제창을 닫은 경우는 조용히 처리합니다.
      if ((e as { code?: string }).code !== "USER_CANCEL") setError((e as Error).message || "결제 요청 중 문제가 생겼습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  if (source.mode === "cart" && cartItems === null && cart.length > 0) return <p className="mt-10 text-muted-foreground">주문 내용을 확인하는 중…</p>;

  return (
    <div className="mt-8 grid gap-12 md:grid-cols-[1fr_300px]">
      <div>
        <section aria-label="주문 교재">
          <h2 className="border-b border-foreground/30 pb-2 text-[13px] font-semibold tracking-[0.1em] text-muted-foreground">주문 교재</h2>
          {lines.length > 0 ? (
            <ul>
              {lines.map((l) => (
                <li key={l.slug} className="flex items-baseline justify-between gap-4 border-b border-border py-3.5 text-[15px]">
                  <span>{l.title}</span>
                  <span className="shrink-0 tabular-nums text-muted-foreground">{source.mode === "bundle" ? "" : formatPrice(l.unit)}</span>
                </li>
              ))}
            </ul>
          ) : null}
          {problem && (
            <p role="alert" className="mt-4 text-[14px] text-destructive">
              {problem}{" "}
              <Link href={problem.includes("자료함") ? "/mypage" : source.mode === "cart" ? "/books" : "/cart"} className="underline underline-offset-4">
                {problem.includes("자료함") ? "내 자료함으로" : source.mode === "cart" ? "교재 둘러보기" : "장바구니로"}
              </Link>
            </p>
          )}
        </section>

        {!ready ? (
          <p className="mt-8 border-l-2 border-sand bg-card p-4 text-[14px] leading-relaxed text-muted-foreground">
            결제 환경이 아직 연결되지 않았습니다. 운영자가 교재 데이터베이스(Supabase)와 결제(토스페이먼츠) 키를 설정하면 이 화면에서 결제할 수 있습니다.
          </p>
        ) : canPay ? (
          <>
            <div className="mt-8 overflow-hidden border border-border bg-white"><div id="payment-method" /><div id="agreement" /></div>
            <label className="mt-6 flex items-start gap-3 text-[13px] leading-relaxed">
              <input type="checkbox" className="mt-0.5 size-4 shrink-0 accent-primary" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
              <span>
                <strong>(필수)</strong> 디지털 콘텐츠 특성상 <strong>다운로드한 이후에는 단순 변심에 의한 청약철회가 제한</strong>됨을 확인했고, 상세 페이지의 미리보기와 목차를 확인했습니다. 다운로드 전에는 결제일로부터 7일 이내 전액 환불이 가능합니다.{" "}
                <Link href="/refund" target="_blank" className="underline underline-offset-4">환불 정책</Link>
              </span>
            </label>
          </>
        ) : null}
        {error && <p role="alert" className="mt-4 text-[14px] text-destructive">{error}</p>}
      </div>

      <aside className="md:sticky md:top-28 md:self-start">
        <div className="border border-border bg-card p-6">
          <p className="flex justify-between text-[20px] font-semibold"><span>결제 금액</span><span className="tabular-nums">{formatPrice(total)}</span></p>
          <Button size="lg" className="mt-5 w-full" onClick={pay} disabled={!canPay || !widgetReady || submitting}>
            {submitting ? "결제창 여는 중…" : !canPay ? "결제할 수 없습니다" : !widgetReady ? "결제 수단 불러오는 중…" : `${formatPrice(total)} 결제하기`}
          </Button>
          {label && <p className="mt-3 text-[12px] leading-relaxed text-muted-foreground">{label}</p>}
          <p className="mt-3 text-[12px] leading-relaxed text-muted-foreground">결제는 토스페이먼츠를 통해 처리되며 카드 정보는 저장되지 않습니다.</p>
        </div>
      </aside>
    </div>
  );
}
