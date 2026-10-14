import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { hasPurchased } from "@/lib/orders";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createOrderId } from "@/lib/toss";

/**
 * 결제 전 주문 생성. 금액은 반드시 서버(DB)의 상품 가격으로 정합니다.
 * 클라이언트가 보낸 금액은 신뢰하지 않습니다.
 */
export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ message: "Supabase가 설정되지 않았습니다." }, { status: 503 });
  }
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });

  const { slug } = (await request.json().catch(() => ({}))) as { slug?: string };
  if (!slug) return NextResponse.json({ message: "상품 정보가 없습니다." }, { status: 400 });

  const admin = createAdminClient();
  const { data: product } = await admin
    .from("products")
    .select("id, title, price, file_path")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();
  if (!product) return NextResponse.json({ message: "판매 중인 상품이 아닙니다." }, { status: 404 });
  if (!product.file_path) {
    return NextResponse.json({ message: "자료 파일이 준비 중입니다. 잠시 후 다시 시도해 주세요." }, { status: 409 });
  }

  if (await hasPurchased(user.id, product.id)) {
    return NextResponse.json({ alreadyOwned: true });
  }

  const orderId = createOrderId();
  const { error } = await admin.from("orders").insert({
    order_id: orderId,
    user_id: user.id,
    product_id: product.id,
    product_title: product.title,
    amount: product.price,
    status: "pending",
  });
  if (error) {
    console.error("[orders] 주문 생성 실패", error.message);
    return NextResponse.json({ message: "주문을 만들지 못했습니다. 다시 시도해 주세요." }, { status: 500 });
  }

  return NextResponse.json({
    orderId,
    orderName: product.title.slice(0, 100),
    amount: product.price,
    customerKey: user.id,
    customerEmail: user.email,
  });
}
