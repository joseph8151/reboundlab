"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CircleCheckBig, Clock3, LoaderCircle, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { shelfActions } from "@/lib/shelf";

type State =
  | { status: "loading" }
  | { status: "done"; title: string }
  | { status: "waiting"; title: string }
  | { status: "error"; message: string };

export function ConfirmPayment() {
  const params = useSearchParams();
  const [state, setState] = useState<State>({ status: "loading" });
  const requested = useRef(false);

  useEffect(() => {
    // React Strict Mode의 이중 실행으로 승인 요청이 두 번 가지 않도록 막습니다.
    if (requested.current) return;
    requested.current = true;
    const payload = {
      paymentKey: params.get("paymentKey"),
      orderId: params.get("orderId"),
      amount: params.get("amount"),
    };
    fetch("/api/payments/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then(async (res) => {
        const body = await res.json();
        if (!res.ok) throw new Error(body.message ?? "결제 승인에 실패했습니다.");
        // 결제한 교재는 장바구니에서 뺍니다.
        (body.slugs as string[] | undefined)?.forEach((slug) => shelfActions.removeFromCart(slug));
        setState(body.waitingForDeposit ? { status: "waiting", title: body.productTitle } : { status: "done", title: body.productTitle });
      })
      .catch((e: Error) => setState({ status: "error", message: e.message }));
  }, [params]);

  if (state.status === "loading") {
    return (
      <>
        <LoaderCircle className="size-10 animate-spin text-primary" />
        <h1 className="mt-6 text-xl font-bold">결제를 확인하고 있습니다</h1>
        <p className="mt-2 text-muted-foreground">창을 닫지 말고 잠시만 기다려 주세요.</p>
      </>
    );
  }

  if (state.status === "error") {
    return (
      <>
        <TriangleAlert className="size-10 text-destructive" />
        <h1 className="mt-6 text-xl font-bold">결제를 완료하지 못했습니다</h1>
        <p className="mt-2 text-muted-foreground">{state.message}</p>
        <p className="mt-1 text-sm text-muted-foreground">결제 금액이 빠져나갔다면 자동으로 취소되며, 문제가 계속되면 고객센터로 문의해 주세요.</p>
        <Button asChild variant="outline" className="mt-8">
          <Link href="/products">자료 목록으로</Link>
        </Button>
      </>
    );
  }

  if (state.status === "waiting") {
    return (
      <>
        <Clock3 className="size-10 text-primary" />
        <h1 className="mt-6 text-xl font-bold">입금을 기다리고 있습니다</h1>
        <p className="mt-2 text-muted-foreground">
          {state.title} 주문이 접수되었습니다. 가상계좌로 입금이 확인되면 내 자료함에서 바로 내려받을 수 있습니다.
        </p>
        <Button asChild className="mt-8">
          <Link href="/mypage">내 자료함으로 이동</Link>
        </Button>
      </>
    );
  }

  return (
    <>
      <CircleCheckBig className="size-12 text-success" />
      <h1 className="mt-6 text-2xl font-bold">결제가 완료되었습니다</h1>
      <p className="mt-2 text-muted-foreground">
        <strong className="text-foreground">{state.title}</strong>을(를) 지금 바로 내려받을 수 있습니다.
      </p>
      <Button asChild size="lg" className="mt-8">
        <Link href="/mypage">내 자료함에서 다운로드</Link>
      </Button>
      <p className="mt-4 text-xs text-muted-foreground">다운로드 전에는 결제일로부터 7일 이내 전액 환불이 가능합니다.</p>
    </>
  );
}
