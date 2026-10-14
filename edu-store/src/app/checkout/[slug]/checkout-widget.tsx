"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { loadTossPayments, type TossPaymentsWidgets } from "@tosspayments/tosspayments-sdk";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";

type Props = { clientKey: string; customerKey: string; slug: string; price: number };

export function CheckoutWidget({ clientKey, customerKey, slug, price }: Props) {
  const router = useRouter();
  const widgetsRef = useRef<TossPaymentsWidgets | null>(null);
  const [ready, setReady] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const tossPayments = await loadTossPayments(clientKey);
        const widgets = tossPayments.widgets({ customerKey });
        await widgets.setAmount({ currency: "KRW", value: price });
        await Promise.all([
          widgets.renderPaymentMethods({ selector: "#payment-method", variantKey: "DEFAULT" }),
          widgets.renderAgreement({ selector: "#agreement", variantKey: "AGREEMENT" }),
        ]);
        if (!cancelled) {
          widgetsRef.current = widgets;
          setReady(true);
        }
      } catch (e) {
        console.error(e);
        if (!cancelled) setError("결제 화면을 불러오지 못했습니다. 새로고침 후 다시 시도해 주세요.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [clientKey, customerKey, price]);

  async function pay() {
    if (!widgetsRef.current) return;
    if (!agreed) {
      setError("디지털 콘텐츠 청약철회 제한 안내에 동의해 주세요.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      const order = await res.json();
      if (!res.ok) throw new Error(order.message ?? "주문을 만들지 못했습니다.");
      if (order.alreadyOwned) {
        router.push("/mypage");
        return;
      }
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
      // 사용자가 결제창을 닫은 경우(USER_CANCEL)는 조용히 처리합니다.
      const code = (e as { code?: string }).code;
      if (code !== "USER_CANCEL") setError((e as Error).message || "결제 요청 중 문제가 생겼습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div className="overflow-hidden rounded-2xl border border-border">
        <div id="payment-method" />
        <div id="agreement" />
      </div>

      <label className="mt-6 flex items-start gap-3 rounded-xl bg-muted p-4 text-sm leading-relaxed">
        <input type="checkbox" className="mt-0.5 size-4 shrink-0 accent-primary" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
        <span>
          <strong>(필수)</strong> 디지털 콘텐츠 특성상 <strong>다운로드한 이후에는 단순 변심에 의한 청약철회(환불)가 제한</strong>됨을
          확인했으며, 미리보기로 내용을 확인했습니다. 다운로드 전에는 결제일로부터 7일 이내 전액 환불이 가능합니다.{" "}
          <Link href="/refund" target="_blank" className="font-semibold text-primary underline">
            환불 정책 보기
          </Link>
        </span>
      </label>

      {error && (
        <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-destructive">
          {error}
        </p>
      )}

      <Button size="lg" className="mt-6 w-full" onClick={pay} disabled={!ready || submitting}>
        {!ready ? "결제 수단 불러오는 중…" : submitting ? "결제창 여는 중…" : `${formatPrice(price)} 결제하기`}
      </Button>
      <p className="mt-3 text-center text-xs text-muted-foreground">결제는 토스페이먼츠를 통해 처리되며, 카드 정보는 저장되지 않습니다.</p>
    </div>
  );
}
