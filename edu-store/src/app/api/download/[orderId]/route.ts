import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { computeEntitlement } from "@/lib/orders";
import { downloadPolicy } from "@/lib/site";
import { createAdminClient } from "@/lib/supabase/admin";
import { STORAGE_BUCKETS } from "@/lib/supabase/env";

export const dynamic = "force-dynamic";

/**
 * 안전한 다운로드.
 * 로그인·소유·결제 상태·기간·횟수를 모두 확인한 뒤, 짧게 유효한 서명 URL로 리다이렉트합니다.
 * 원본 PDF는 비공개 버킷에 있어 서명 URL 없이는 접근할 수 없습니다.
 */
// POST만 허용: 링크 미리 불러오기(prefetch)나 크롤러가 다운로드 횟수를 소진하지 않도록 합니다.
export async function POST(request: NextRequest, { params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.redirect(new URL(`/login?next=${encodeURIComponent("/mypage")}`, request.url), { status: 303 });
  }

  const admin = createAdminClient();
  const { data: order } = await admin
    .from("orders")
    .select("id, user_id, status, approved_at, product_title, products(file_path, slug)")
    .eq("order_id", orderId)
    .maybeSingle();

  const fail = (reason: string) => NextResponse.redirect(new URL(`/mypage?error=${reason}`, request.url), { status: 303 });

  if (!order || order.user_id !== user.id || order.status !== "paid" || !order.approved_at) return fail("not_found");

  const product = (Array.isArray(order.products) ? order.products[0] : order.products) as
    | { file_path: string | null; slug: string }
    | null;
  if (!product?.file_path) return fail("file_missing");

  const { count } = await admin
    .from("downloads")
    .select("id", { count: "exact", head: true })
    .eq("order_id", order.id);
  const { expired, remaining } = computeEntitlement(order.approved_at, count ?? 0);
  if (expired) return fail("expired");
  if (remaining <= 0) return fail("limit");

  const filename = `${order.product_title.replace(/[\\/:*?"<>|]/g, "")}.pdf`;
  const { data: signed, error } = await admin.storage
    .from(STORAGE_BUCKETS.files)
    .createSignedUrl(product.file_path, downloadPolicy.urlTtlSeconds, { download: filename });
  if (error || !signed) {
    console.error("[download] 서명 URL 발급 실패", error?.message);
    return fail("storage");
  }

  await admin.from("downloads").insert({
    order_id: order.id,
    user_id: user.id,
    ip: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
    user_agent: request.headers.get("user-agent")?.slice(0, 300) ?? null,
  });

  return NextResponse.redirect(signed.signedUrl, { status: 303 });
}
