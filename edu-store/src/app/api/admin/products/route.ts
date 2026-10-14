import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { getAdminUser } from "@/lib/auth";
import { isGrade, isSubject, isType } from "@/lib/catalog";
import { createAdminClient } from "@/lib/supabase/admin";

const lines = (v: unknown) =>
  String(v ?? "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

export async function POST(request: NextRequest) {
  if (!(await getAdminUser())) return NextResponse.json({ message: "권한이 없습니다." }, { status: 403 });
  const b = (await request.json().catch(() => ({}))) as Record<string, unknown>;

  const slug = String(b.slug ?? "").trim();
  const grades = Array.isArray(b.grades) ? b.grades.filter(isGrade) : [];
  const price = Number(b.price);
  const errors: string[] = [];
  if (!/^[a-z0-9-]{3,80}$/.test(slug)) errors.push("슬러그는 영문 소문자·숫자·하이픈 3~80자로 입력하세요.");
  if (!String(b.title ?? "").trim()) errors.push("제목을 입력하세요.");
  if (!String(b.summary ?? "").trim()) errors.push("한 줄 요약을 입력하세요.");
  if (!isSubject(b.subject)) errors.push("과목을 선택하세요.");
  if (!isType(b.type)) errors.push("유형을 선택하세요.");
  if (!grades.length) errors.push("학년을 하나 이상 선택하세요.");
  if (!Number.isInteger(price) || price < 0) errors.push("가격은 0 이상의 정수로 입력하세요.");
  if (!b.filePath) errors.push("PDF 파일을 업로드하세요.");
  if (errors.length) return NextResponse.json({ message: errors.join("\n") }, { status: 400 });

  const { error } = await createAdminClient()
    .from("products")
    .insert({
      slug,
      title: String(b.title).trim(),
      summary: String(b.summary).trim(),
      description: String(b.description ?? "").trim(),
      subject: b.subject,
      grades,
      type: b.type,
      price,
      page_count: Number(b.pageCount) || 0,
      toc: lines(b.toc),
      targets: lines(b.targets),
      includes: lines(b.includes),
      sample_excerpt: lines(b.sampleExcerpt),
      thumbnail_url: typeof b.thumbnailUrl === "string" && b.thumbnailUrl ? b.thumbnailUrl : null,
      sample_images: Array.isArray(b.sampleImages) ? b.sampleImages.filter((u): u is string => typeof u === "string") : [],
      file_path: String(b.filePath),
      is_featured: Boolean(b.isFeatured),
      is_published: Boolean(b.isPublished),
    });
  if (error) {
    const msg = error.code === "23505" ? "이미 사용 중인 슬러그입니다." : error.message;
    return NextResponse.json({ message: msg }, { status: 400 });
  }

  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true, slug });
}

/** 기존 상품(예: seed 상품)에 PDF만 연결하거나 공개 여부를 바꿀 때 사용합니다. */
export async function PATCH(request: NextRequest) {
  if (!(await getAdminUser())) return NextResponse.json({ message: "권한이 없습니다." }, { status: 403 });
  const b = (await request.json().catch(() => ({}))) as { id?: string; filePath?: string; isPublished?: boolean };
  if (!b.id) return NextResponse.json({ message: "상품 ID가 없습니다." }, { status: 400 });

  const patch: Record<string, unknown> = {};
  if (typeof b.filePath === "string" && b.filePath) patch.file_path = b.filePath;
  if (typeof b.isPublished === "boolean") patch.is_published = b.isPublished;
  const { error } = await createAdminClient().from("products").update(patch).eq("id", b.id);
  if (error) return NextResponse.json({ message: error.message }, { status: 400 });

  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true });
}
