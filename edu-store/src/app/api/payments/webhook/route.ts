import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getTossPayment } from "@/lib/toss";

/**
 * 토스페이먼츠 웹훅 (개발자센터 → 웹훅 → PAYMENT_STATUS_CHANGED 등록).
 * 가상계좌 입금 완료, 관리자 콘솔에서의 취소 등을 주문에 반영합니다.
 * 웹훅 본문은 위조될 수 있으므로 paymentKey로 결제를 다시 조회해 상태를 확인합니다.
 */
export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as { data?: { paymentKey?: string; orderId?: string } } | null;
  const paymentKey = body?.data?.paymentKey;
  if (!paymentKey) return NextResponse.json({ ok: true });

  const payment = await getTossPayment(paymentKey);
  if (!payment) return NextResponse.json({ ok: false }, { status: 400 });

  const admin = createAdminClient();
  const { data: order } = await admin
    .from("orders")
    .select("id, amount, status")
    .eq("order_id", payment.orderId)
    .maybeSingle();
  if (!order) return NextResponse.json({ ok: true });

  if (payment.status === "DONE" && order.status === "pending" && payment.totalAmount === order.amount) {
    await admin
      .from("orders")
      .update({
        status: "paid",
        payment_key: payment.paymentKey,
        method: payment.method,
        receipt_url: payment.receipt?.url ?? null,
        approved_at: payment.approvedAt ?? new Date().toISOString(),
      })
      .eq("id", order.id);
  } else if (payment.status === "CANCELED" || payment.status === "PARTIAL_CANCELED") {
    await admin.from("orders").update({ status: payment.status === "CANCELED" ? "refunded" : order.status }).eq("id", order.id);
  } else if (payment.status === "EXPIRED" || payment.status === "ABORTED") {
    await admin.from("orders").update({ status: "failed" }).eq("id", order.id).eq("status", "pending");
  }

  return NextResponse.json({ ok: true });
}
