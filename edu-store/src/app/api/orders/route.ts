import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getOwnedProductIds } from "@/lib/orders";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createOrderId } from "@/lib/toss";

export const runtime = "nodejs";

type DbProduct = { id: string; slug: string; title: string; price: number | null; sale_price: number | null; status: string; file_path: string | null };
const unit = (p: DbProduct) => (p.price === null ? null : p.sale_price !== null && p.sale_price < p.price ? p.sale_price : p.price);
const sellable = (p: DbProduct) => p.status === "on_sale" && unit(p) !== null && Boolean(p.file_path);

/**
 * 결제 전 주문 생성. 금액·판매 상태·파일 준비 여부는 모두 서버(DB)에서 다시 확인하며,
 * 클라이언트가 보낸 금액이나 상품 정보는 신뢰하지 않습니다.
 * body: { slugs: string[] } (장바구니·바로 구매) 또는 { bundle: string } (패키지)
 */
export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) return NextResponse.json({ message: "교재 데이터베이스가 연결되지 않았습니다." }, { status: 503 });
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as { slugs?: unknown; bundle?: unknown };
  const admin = createAdminClient();
  const owned = await getOwnedProductIds(user.id);
  const COLS = "id, slug, title, price, sale_price, status, file_path";

  let products: DbProduct[] = [];
  let amount = 0;
  let bundleId: string | null = null;
  let orderTitle = "";

  if (typeof body.bundle === "string") {
    const { data: bundle } = await admin.from("bundles").select("id, title, price, status, bundle_items(product_id)").eq("slug", body.bundle).maybeSingle();
    if (!bundle || bundle.status !== "on_sale" || bundle.price === null) return NextResponse.json({ message: "판매 중인 패키지가 아닙니다." }, { status: 404 });
    const ids = (bundle.bundle_items ?? []).map((i: { product_id: string }) => i.product_id);
    const { data } = await admin.from("products").select(COLS).in("id", ids);
    products = (data ?? []) as DbProduct[];
    if (ids.length < 2 || products.length !== ids.length || !products.every(sellable)) {
      return NextResponse.json({ message: "패키지에 포함된 교재의 판매 준비가 끝나지 않았습니다." }, { status: 409 });
    }
    if (products.some((p) => owned.has(p.id))) {
      return NextResponse.json({ message: "이미 구매한 교재가 포함되어 있어 패키지로 구매할 수 없습니다. 나머지 교재를 개별로 구매해 주세요." }, { status: 409 });
    }
    amount = bundle.price;
    bundleId = bundle.id;
    orderTitle = bundle.title;
  } else {
    const slugs = Array.isArray(body.slugs) ? [...new Set(body.slugs.filter((s): s is string => typeof s === "string"))].slice(0, 20) : [];
    if (!slugs.length) return NextResponse.json({ message: "구매할 교재를 선택해 주세요." }, { status: 400 });
    const { data } = await admin.from("products").select(COLS).in("slug", slugs);
    const found = (data ?? []) as DbProduct[];
    const bad = found.find((p) => !sellable(p));
    if (found.length !== slugs.length || bad) {
      return NextResponse.json({ message: bad ? `‘${bad.title}’은(는) 지금 구매할 수 없는 교재입니다.` : "판매 중이 아닌 교재가 포함되어 있습니다." }, { status: 409 });
    }
    products = found.filter((p) => !owned.has(p.id));
    if (!products.length) return NextResponse.json({ alreadyOwned: true });
    amount = products.reduce((sum, p) => sum + (unit(p) ?? 0), 0);
    orderTitle = products.length === 1 ? products[0].title : `${products[0].title} 외 ${products.length - 1}권`;
  }

  const orderId = createOrderId();
  const { data: order, error } = await admin
    .from("orders")
    .insert({
      order_id: orderId,
      user_id: user.id,
      product_id: products.length === 1 ? products[0].id : null,
      bundle_id: bundleId,
      product_title: orderTitle.slice(0, 200),
      amount,
      status: "pending",
    })
    .select("id")
    .single();
  if (error || !order) {
    console.error("[orders] 주문 생성 실패", error?.message);
    return NextResponse.json({ message: "주문을 만들지 못했습니다. 다시 시도해 주세요." }, { status: 500 });
  }
  const { error: itemsError } = await admin.from("order_items").insert(
    products.map((p) => ({ order_uuid: order.id, product_id: p.id, product_title: p.title, unit_price: unit(p) ?? 0 })),
  );
  if (itemsError) {
    console.error("[orders] 주문 항목 생성 실패", itemsError.message);
    await admin.from("orders").delete().eq("id", order.id);
    return NextResponse.json({ message: "주문을 만들지 못했습니다. 다시 시도해 주세요." }, { status: 500 });
  }

  return NextResponse.json({
    orderId,
    orderName: orderTitle.slice(0, 100),
    amount,
    customerKey: user.id,
    customerEmail: user.email,
    excluded: Array.isArray(body.slugs) ? body.slugs.length - products.length : 0,
  });
}
