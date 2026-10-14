import "server-only";

export type TossPayment = {
  paymentKey: string;
  orderId: string;
  status: string;
  method: string | null;
  totalAmount: number;
  approvedAt: string | null;
  receipt?: { url?: string } | null;
};

export type TossError = { code: string; message: string };

export function isTossConfigured() {
  return Boolean(process.env.TOSS_SECRET_KEY && process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY);
}

/**
 * 결제 승인 API. 금액 검증은 호출 전에 반드시 서버의 주문 정보로 해야 합니다.
 * https://docs.tosspayments.com/reference#결제-승인
 */
export async function confirmTossPayment(params: {
  paymentKey: string;
  orderId: string;
  amount: number;
}): Promise<{ ok: true; payment: TossPayment } | { ok: false; error: TossError }> {
  const secretKey = process.env.TOSS_SECRET_KEY;
  if (!secretKey) {
    return { ok: false, error: { code: "NOT_CONFIGURED", message: "결제 키가 설정되지 않았습니다." } };
  }

  const res = await fetch("https://api.tosspayments.com/v1/payments/confirm", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${secretKey}:`).toString("base64")}`,
      "Content-Type": "application/json",
      // 같은 주문을 두 번 승인 요청해도 한 번만 처리되도록 합니다.
      "Idempotency-Key": params.orderId,
    },
    body: JSON.stringify(params),
    cache: "no-store",
  });

  const body = await res.json();
  if (!res.ok) return { ok: false, error: body as TossError };
  return { ok: true, payment: body as TossPayment };
}

export function createOrderId() {
  const random = crypto.randomUUID().replace(/-/g, "").slice(0, 12);
  return `ORD-${Date.now()}-${random}`;
}

/** 결제 조회. 웹훅 본문을 그대로 믿지 않고 토스에 다시 확인할 때 사용합니다. */
export async function getTossPayment(paymentKey: string): Promise<TossPayment | null> {
  const secretKey = process.env.TOSS_SECRET_KEY;
  if (!secretKey) return null;
  const res = await fetch(`https://api.tosspayments.com/v1/payments/${encodeURIComponent(paymentKey)}`, {
    headers: { Authorization: `Basic ${Buffer.from(`${secretKey}:`).toString("base64")}` },
    cache: "no-store",
  });
  return res.ok ? ((await res.json()) as TossPayment) : null;
}
