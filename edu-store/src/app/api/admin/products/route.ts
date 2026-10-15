import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { getAdminUser } from "@/lib/auth";
import { buildProductRow, skuFor } from "@/lib/admin-product";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

function dbMessage(error: { code?: string; message: string }) {
  if (error.code === "23505") return error.message.includes("sku") ? "이미 사용 중인 상품 코드입니다." : "이미 사용 중인 슬러그입니다.";
  if (error.code === "23514" && error.message.includes("on_sale_ready")) return "판매 중으로 바꾸려면 판매가를 입력해야 합니다.";
  return error.message;
}

export async function POST(request: NextRequest) {
  if (!(await getAdminUser())) return NextResponse.json({ message: "권한이 없습니다." }, { status: 403 });
  const b = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const { row, errors } = buildProductRow(b, false);
  if (errors.length) return NextResponse.json({ message: errors.join("\n") }, { status: 400 });
  if (!row.sku) row.sku = skuFor(String(row.track), String(row.area));

  const { data, error } = await createAdminClient().from("products").insert(row).select("id, slug").single();
  if (error) return NextResponse.json({ message: dbMessage(error) }, { status: 400 });
  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true, id: data.id, slug: data.slug });
}

/** 교재 수정: 전달한 필드만 바꿉니다. */
export async function PATCH(request: NextRequest) {
  if (!(await getAdminUser())) return NextResponse.json({ message: "권한이 없습니다." }, { status: 403 });
  const b = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const id = typeof b.id === "string" ? b.id : "";
  if (!id) return NextResponse.json({ message: "상품 ID가 없습니다." }, { status: 400 });
  const { row, errors } = buildProductRow(b, true);
  if (errors.length) return NextResponse.json({ message: errors.join("\n") }, { status: 400 });
  if (!Object.keys(row).length) return NextResponse.json({ message: "변경할 내용이 없습니다." }, { status: 400 });

  const { error } = await createAdminClient().from("products").update(row).eq("id", id);
  if (error) return NextResponse.json({ message: dbMessage(error) }, { status: 400 });
  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true });
}
