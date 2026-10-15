import "server-only";
import { downloadPolicy } from "./site";
import { createAdminClient } from "./supabase/admin";

export type OwnedItem = {
  orderUuid: string;
  orderId: string;
  productId: string;
  productSlug: string | null;
  productTitle: string;
  unitPrice: number;
  method: string | null;
  receiptUrl: string | null;
  approvedAt: string;
  expiresAt: string;
  downloadCount: number;
  remaining: number;
  expired: boolean;
  /** 같은 주문 안에서 한 번도 내려받지 않았고 결제 후 7일 이내일 때 */
  refundable: boolean;
  hasAnswerFile: boolean;
  answerRemaining: number;
};

const DAY = 24 * 60 * 60 * 1000;

export function computeEntitlement(approvedAt: string, downloadCount: number) {
  const approved = new Date(approvedAt).getTime();
  const expiresAt = new Date(approved + downloadPolicy.validDays * DAY);
  const expired = Date.now() > expiresAt.getTime();
  const remaining = Math.max(0, downloadPolicy.maxCount - downloadCount);
  return { expiresAt: expiresAt.toISOString(), expired, remaining };
}

type ItemRow = {
  order_uuid: string;
  product_id: string;
  product_title: string;
  unit_price: number;
  orders: { order_id: string; status: string; user_id: string; method: string | null; receipt_url: string | null; approved_at: string };
  products: { slug: string; has_answer_file: boolean } | null;
};

/** 사용자가 결제 완료한 교재 목록 (교재별 다운로드 횟수 포함) */
export async function getOwnedItems(userId: string): Promise<OwnedItem[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("order_items")
    .select("order_uuid, product_id, product_title, unit_price, orders!inner(order_id, status, user_id, method, receipt_url, approved_at), products(slug, has_answer_file)")
    .eq("orders.user_id", userId)
    .eq("orders.status", "paid");
  if (error) throw error;
  const rows = (data ?? []) as unknown as ItemRow[];
  if (!rows.length) return [];

  const { data: downloads } = await admin
    .from("downloads")
    .select("order_id, product_id, kind")
    .in("order_id", [...new Set(rows.map((r) => r.order_uuid))]);
  const perItem = new Map<string, number>();
  const perAnswer = new Map<string, number>();
  const perOrder = new Map<string, number>();
  downloads?.forEach((d) => {
    const key = `${d.order_id}:${d.product_id}`;
    (d.kind === "answer" ? perAnswer : perItem).set(key, ((d.kind === "answer" ? perAnswer : perItem).get(key) ?? 0) + 1);
    perOrder.set(d.order_id, (perOrder.get(d.order_id) ?? 0) + 1);
  });

  return rows
    .map((r): OwnedItem => {
      const key = `${r.order_uuid}:${r.product_id}`;
      const count = perItem.get(key) ?? 0;
      const ent = computeEntitlement(r.orders.approved_at, count);
      return {
        orderUuid: r.order_uuid,
        orderId: r.orders.order_id,
        productId: r.product_id,
        productSlug: r.products?.slug ?? null,
        productTitle: r.product_title,
        unitPrice: r.unit_price,
        method: r.orders.method,
        receiptUrl: r.orders.receipt_url,
        approvedAt: r.orders.approved_at,
        downloadCount: count,
        ...ent,
        refundable: (perOrder.get(r.order_uuid) ?? 0) === 0 && Date.now() - new Date(r.orders.approved_at).getTime() <= 7 * DAY,
        hasAnswerFile: Boolean(r.products?.has_answer_file),
        answerRemaining: Math.max(0, downloadPolicy.maxCount - (perAnswer.get(key) ?? 0)),
      };
    })
    .sort((a, b) => b.approvedAt.localeCompare(a.approvedAt));
}

/** 이미 결제 완료한 교재의 id 집합 */
export async function getOwnedProductIds(userId: string): Promise<Set<string>> {
  const { data } = await createAdminClient()
    .from("order_items")
    .select("product_id, orders!inner(status, user_id)")
    .eq("orders.user_id", userId)
    .eq("orders.status", "paid");
  return new Set((data ?? []).map((r) => r.product_id as string));
}
