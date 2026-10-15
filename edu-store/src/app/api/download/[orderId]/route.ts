import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { computeEntitlement } from "@/lib/orders";
import { downloadPolicy } from "@/lib/site";
import { createAdminClient } from "@/lib/supabase/admin";
import { STORAGE_BUCKETS } from "@/lib/supabase/env";
import { getStampedPath, isWatermarkEnabled } from "@/lib/watermark";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * 안전한 다운로드. 폼 필드: p(교재 id), k(main 본책 | answer 정답·해설).
 * 로그인·소유·결제 상태·기간·교재별 횟수를 확인한 뒤, 짧게 유효한 서명 URL로 이동시킵니다.
 * 원본 PDF는 비공개 버킷에 있어 서명 URL 없이는 접근할 수 없습니다.
 * POST만 허용: 링크 미리 불러오기나 크롤러가 횟수를 소진하지 않도록 합니다.
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.redirect(new URL(`/login?next=${encodeURIComponent("/mypage")}`, request.url), { status: 303 });

  const form = await request.formData().catch(() => null);
  const productId = String(form?.get("p") ?? "");
  const kind = form?.get("k") === "answer" ? "answer" : "main";
  const fail = (reason: string) => NextResponse.redirect(new URL(`/mypage?error=${reason}`, request.url), { status: 303 });

  const admin = createAdminClient();
  const { data: order } = await admin.from("orders").select("id, user_id, status, approved_at").eq("order_id", orderId).maybeSingle();
  if (!order || order.user_id !== user.id || order.status !== "paid" || !order.approved_at) return fail("not_found");

  const { data: items } = await admin
    .from("order_items")
    .select("product_id, product_title, products(file_path, answer_path)")
    .eq("order_uuid", order.id);
  // 단일 교재 주문은 p가 없어도 동작합니다(이전 버전 호환).
  const item = (items ?? []).find((i) => i.product_id === productId) ?? (items?.length === 1 && !productId ? items[0] : null);
  if (!item) return fail("not_found");

  const files = (Array.isArray(item.products) ? item.products[0] : item.products) as { file_path: string | null; answer_path: string | null } | null;
  const source = kind === "answer" ? files?.answer_path : files?.file_path;
  if (!source) return fail("file_missing");

  const { count } = await admin
    .from("downloads")
    .select("id", { count: "exact", head: true })
    .eq("order_id", order.id)
    .eq("product_id", item.product_id)
    .eq("kind", kind);
  const { expired, remaining } = computeEntitlement(order.approved_at, count ?? 0);
  if (expired) return fail("expired");
  if (remaining <= 0) return fail("limit");

  let path = source;
  if (isWatermarkEnabled()) {
    try {
      path = await getStampedPath({ filePath: source, orderUuid: order.id, orderId, email: user.email ?? user.id });
    } catch (e) {
      // 암호화·손상 등으로 워터마크를 못 넣으면 원본을 제공하고 로그만 남깁니다.
      console.error("[download] 워터마크 실패, 원본 제공", (e as Error).message);
    }
  }

  const safeTitle = item.product_title.replace(/[\\/:*?"<>|]/g, "");
  const filename = `${safeTitle}${kind === "answer" ? " 정답과 해설" : ""}.pdf`;
  const { data: signed, error } = await admin.storage.from(STORAGE_BUCKETS.files).createSignedUrl(path, downloadPolicy.urlTtlSeconds, { download: filename });
  if (error || !signed) {
    console.error("[download] 서명 URL 발급 실패", error?.message);
    return fail("storage");
  }

  await admin.from("downloads").insert({
    order_id: order.id,
    user_id: user.id,
    product_id: item.product_id,
    kind,
    ip: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
    user_agent: request.headers.get("user-agent")?.slice(0, 300) ?? null,
  });

  return NextResponse.redirect(signed.signedUrl, { status: 303 });
}
