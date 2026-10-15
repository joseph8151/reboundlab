import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { getAdminUser } from "@/lib/auth";
import { STATUSES, TRACKS, isOneOf } from "@/lib/catalog";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

/**
 * 패키지 등록·수정. 판매 중 패키지는 구성 교재가 2권 이상이고 모두 판매 중(가격 등록)이며 패키지 가격이 있어야 합니다.
 */
async function save(request: NextRequest, mode: "create" | "update") {
  if (!(await getAdminUser())) return NextResponse.json({ message: "권한이 없습니다." }, { status: 403 });
  const b = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const admin = createAdminClient();

  const errors: string[] = [];
  const slug = String(b.slug ?? "").trim();
  const title = String(b.title ?? "").trim();
  const status = b.status;
  const price = b.price === "" || b.price === null || b.price === undefined ? null : Number(b.price);
  const itemSlugs = Array.isArray(b.itemSlugs) ? [...new Set(b.itemSlugs.filter((s): s is string => typeof s === "string" && s !== ""))] : [];
  if (!/^[a-z0-9-]{3,90}$/.test(slug)) errors.push("슬러그는 영문 소문자·숫자·하이픈 3~90자로 입력하세요.");
  if (!title) errors.push("패키지명을 입력하세요.");
  if (!isOneOf(STATUSES, status)) errors.push("판매 상태를 선택하세요.");
  if (price !== null && (!Number.isInteger(price) || price < 0)) errors.push("패키지 가격은 0 이상의 정수여야 합니다.");
  if (b.track && !isOneOf(TRACKS, b.track)) errors.push("학습 과정 값이 올바르지 않습니다.");

  let productIds: string[] = [];
  if (itemSlugs.length) {
    const { data } = await admin.from("products").select("id, slug, status, price").in("slug", itemSlugs);
    if ((data?.length ?? 0) !== itemSlugs.length) errors.push("존재하지 않는 교재가 포함되어 있습니다.");
    productIds = itemSlugs.map((s) => data?.find((p) => p.slug === s)?.id).filter((x): x is string => Boolean(x));
    if (status === "on_sale") {
      const notReady = data?.filter((p) => !(p.status === "on_sale" && p.price !== null)).map((p) => p.slug) ?? [];
      if (notReady.length) errors.push(`판매 중이 아니거나 가격이 없는 교재는 판매 중 패키지에 넣을 수 없습니다: ${notReady.join(", ")}`);
    }
  }
  if (status === "on_sale" && (productIds.length < 2 || price === null)) errors.push("판매 중 패키지는 교재 2권 이상과 패키지 가격이 필요합니다.");
  if (errors.length) return NextResponse.json({ message: errors.join("\n") }, { status: 400 });

  const row = {
    slug, title, status, price,
    summary: String(b.summary ?? "").trim(),
    description: String(b.description ?? "").trim(),
    track: b.track || null,
    release_date: b.releaseDate ? String(b.releaseDate) : null,
    seo_title: String(b.seoTitle ?? "").trim() || null,
    seo_description: String(b.seoDescription ?? "").trim() || null,
  };

  let id = typeof b.id === "string" ? b.id : "";
  if (mode === "create") {
    const { data, error } = await admin.from("bundles").insert(row).select("id").single();
    if (error) return NextResponse.json({ message: error.code === "23505" ? "이미 사용 중인 슬러그입니다." : error.message }, { status: 400 });
    id = data.id;
  } else {
    if (!id) return NextResponse.json({ message: "패키지 ID가 없습니다." }, { status: 400 });
    const { error } = await admin.from("bundles").update(row).eq("id", id);
    if (error) return NextResponse.json({ message: error.message }, { status: 400 });
    await admin.from("bundle_items").delete().eq("bundle_id", id);
  }
  if (productIds.length) {
    const { error } = await admin.from("bundle_items").insert(productIds.map((product_id, position) => ({ bundle_id: id, product_id, position })));
    if (error) return NextResponse.json({ message: error.message }, { status: 400 });
  }
  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true, id });
}

export const POST = (r: NextRequest) => save(r, "create");
export const PATCH = (r: NextRequest) => save(r, "update");
