import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { confirmTossPayment } from "@/lib/toss";

/**
 * 결제 승인. 토스 결제창 → successUrl 페이지 → 이 API 순서로 호출됩니다.
 * 1) 주문 소유자 확인 2) 금액 위변조 확인 3) 토스 승인 API 호출 4) 주문 상태 갱신
 */
export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as { paymentKey?: string; orderId?: string; amount?: number | string };
  const paymentKey = body.paymentKey;
  const orderId = body.orderId;
  const amount = Number(body.amount);
  if (!paymentKey || !orderId || !Number.isFinite(amount)) {
    return NextResponse.json({ message: "결제 정보가 올바르지 않습니다." }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: order } = await admin
    .from("orders")
    .select("id, user_id, amount, status, product_title")
    .eq("order_id", orderId)
    .maybeSingle();

  if (!order || order.user_id !== user.id) {
    return NextResponse.json({ message: "주문을 찾을 수 없습니다." }, { status: 404 });
  }
  if (order.status === "paid") {
    return NextResponse.json({ ok: true, productTitle: order.product_title });
  }
  if (order.status !== "pending") {
    return NextResponse.json({ message: "이미 처리된 주문입니다." }, { status: 409 });
  }
  if (order.amount !== amount) {
    await admin.from("orders").update({ status: "failed" }).eq("id", order.id);
    return NextResponse.json({ message: "결제 금액이 주문 금액과 다릅니다." }, { status: 400 });
  }

  const result = await confirmTossPayment({ paymentKey, orderId, amount });
  if (!result.ok) {
    console.error("[payments] 승인 실패", result.error);
    return NextResponse.json({ message: result.error.message, code: result.error.code }, { status: 400 });
  }

  const { payment } = result;
  // 가상계좌는 승인 시점에 WAITING_FOR_DEPOSIT 상태입니다. 입금 확인은 웹훅으로 처리하세요(README 참고).
  const paid = payment.status === "DONE";
  await admin
    .from("orders")
    .update({
      status: paid ? "paid" : "pending",
      payment_key: payment.paymentKey,
      method: payment.method,
      receipt_url: payment.receipt?.url ?? null,
      approved_at: paid ? payment.approvedAt ?? new Date().toISOString() : null,
    })
    .eq("id", order.id);

  const { data: bought } = await admin.from("order_items").select("products(slug)").eq("order_uuid", order.id);
  const slugs = (bought ?? []).flatMap((r) => (Array.isArray(r.products) ? r.products : [r.products])).map((p) => (p as { slug: string } | null)?.slug).filter(Boolean);
  return NextResponse.json({ ok: true, waitingForDeposit: !paid, productTitle: order.product_title, slugs });
}
