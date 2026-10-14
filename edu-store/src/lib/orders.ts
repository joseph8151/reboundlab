import "server-only";
import { downloadPolicy } from "./site";
import { createAdminClient } from "./supabase/admin";

export type OwnedItem = {
  orderUuid: string;
  orderId: string;
  productId: string;
  productSlug: string | null;
  productTitle: string;
  amount: number;
  method: string | null;
  receiptUrl: string | null;
  approvedAt: string;
  expiresAt: string;
  downloadCount: number;
  remaining: number;
  expired: boolean;
  refundable: boolean;
};

const DAY = 24 * 60 * 60 * 1000;

export function computeEntitlement(approvedAt: string, downloadCount: number) {
  const approved = new Date(approvedAt).getTime();
  const expiresAt = new Date(approved + downloadPolicy.validDays * DAY);
  const expired = Date.now() > expiresAt.getTime();
  const remaining = Math.max(0, downloadPolicy.maxCount - downloadCount);
  // 청약철회 가능: 결제 후 7일 이내 + 다운로드 이력 없음
  const refundable = downloadCount === 0 && Date.now() - approved <= 7 * DAY;
  return { expiresAt: expiresAt.toISOString(), expired, remaining, refundable };
}

/** 사용자가 결제 완료한 자료 목록 (다운로드 횟수 포함) */
export async function getOwnedItems(userId: string): Promise<OwnedItem[]> {
  const admin = createAdminClient();
  const { data: orders, error } = await admin
    .from("orders")
    .select("id, order_id, product_id, product_title, amount, method, receipt_url, approved_at, products(slug)")
    .eq("user_id", userId)
    .eq("status", "paid")
    .order("approved_at", { ascending: false });
  if (error) throw error;
  if (!orders?.length) return [];

  const { data: downloads } = await admin
    .from("downloads")
    .select("order_id")
    .in("order_id", orders.map((o) => o.id));
  const counts = new Map<string, number>();
  downloads?.forEach((d) => counts.set(d.order_id, (counts.get(d.order_id) ?? 0) + 1));

  return orders.map((o) => {
    const count = counts.get(o.id) ?? 0;
    const product = Array.isArray(o.products) ? o.products[0] : (o.products as { slug: string } | null);
    return {
      orderUuid: o.id,
      orderId: o.order_id,
      productId: o.product_id,
      productSlug: product?.slug ?? null,
      productTitle: o.product_title,
      amount: o.amount,
      method: o.method,
      receiptUrl: o.receipt_url,
      approvedAt: o.approved_at,
      downloadCount: count,
      ...computeEntitlement(o.approved_at, count),
    };
  });
}

export async function hasPurchased(userId: string, productId: string) {
  const admin = createAdminClient();
  const { count } = await admin
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("product_id", productId)
    .eq("status", "paid");
  return (count ?? 0) > 0;
}
