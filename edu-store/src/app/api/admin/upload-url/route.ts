import { NextResponse, type NextRequest } from "next/server";
import { getAdminUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { STORAGE_BUCKETS } from "@/lib/supabase/env";

/**
 * 관리자용 서명 업로드 URL 발급.
 * 대용량 PDF를 서버(Vercel 함수 본문 4.5MB 제한)를 거치지 않고 브라우저에서 Storage로 바로 올립니다.
 */
export async function POST(request: NextRequest) {
  if (!(await getAdminUser())) return NextResponse.json({ message: "권한이 없습니다." }, { status: 403 });

  const { kind, filename } = (await request.json().catch(() => ({}))) as { kind?: "file" | "asset"; filename?: string };
  if (!filename || (kind !== "file" && kind !== "asset")) {
    return NextResponse.json({ message: "잘못된 요청입니다." }, { status: 400 });
  }
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  const allowed = kind === "file" ? ["pdf"] : ["png", "jpg", "jpeg", "webp"];
  if (!allowed.includes(ext)) return NextResponse.json({ message: `허용되지 않는 형식입니다 (${allowed.join(", ")}).` }, { status: 400 });

  const bucket = kind === "file" ? STORAGE_BUCKETS.files : STORAGE_BUCKETS.assets;
  const path = `${new Date().toISOString().slice(0, 7)}/${crypto.randomUUID()}.${ext}`;
  const { data, error } = await createAdminClient().storage.from(bucket).createSignedUploadUrl(path);
  if (error || !data) return NextResponse.json({ message: error?.message ?? "업로드 URL 발급 실패" }, { status: 500 });

  return NextResponse.json({ bucket, path: data.path, token: data.token });
}
