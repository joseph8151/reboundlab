import { NextResponse, type NextRequest } from "next/server";
import { getAdminUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { STORAGE_BUCKETS } from "@/lib/supabase/env";

/**
 * 관리자용 서명 업로드 URL 발급. 대용량 PDF를 서버 함수를 거치지 않고 브라우저에서 Storage로 바로 올립니다.
 *  preview 미리보기 PDF (공개)      asset   표지·미리보기 이미지 (공개)
 * 판매용 PDF는 사이트에서 다운로드로 제공하지 않으므로(상담·계좌이체 후 직접 전달) 업로드를 받지 않습니다.
 */
const KIND_MAP = {
  preview: { bucket: STORAGE_BUCKETS.assets, ext: ["pdf"] },
  asset: { bucket: STORAGE_BUCKETS.assets, ext: ["png", "jpg", "jpeg", "webp"] },
} as const;

export async function POST(request: NextRequest) {
  if (!(await getAdminUser())) return NextResponse.json({ message: "권한이 없습니다." }, { status: 403 });

  const { kind, filename } = (await request.json().catch(() => ({}))) as { kind?: keyof typeof KIND_MAP; filename?: string };
  const def = kind ? KIND_MAP[kind] : undefined;
  if (!def || !filename) return NextResponse.json({ message: "잘못된 요청입니다." }, { status: 400 });
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  if (!(def.ext as readonly string[]).includes(ext)) return NextResponse.json({ message: `허용되지 않는 형식입니다 (${def.ext.join(", ")}).` }, { status: 400 });

  const path = `${kind === "preview" ? "previews" : kind === "asset" ? "images" : "images"}/${new Date().toISOString().slice(0, 7)}/${crypto.randomUUID()}.${ext}`;
  const { data, error } = await createAdminClient().storage.from(def.bucket).createSignedUploadUrl(path);
  if (error || !data) return NextResponse.json({ message: error?.message ?? "업로드 URL 발급 실패" }, { status: 500 });
  return NextResponse.json({ bucket: def.bucket, path: data.path, token: data.token });
}
