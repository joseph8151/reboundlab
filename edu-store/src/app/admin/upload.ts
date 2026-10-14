"use client";

import { createClient } from "@/lib/supabase/client";

/** 서명 업로드 URL을 받아 브라우저에서 Supabase Storage로 바로 올립니다. 반환값: 저장 경로와 공개 URL */
export async function uploadFile(file: File, kind: "file" | "asset") {
  const res = await fetch("/api/admin/upload-url", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ kind, filename: file.name }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.message);

  const supabase = createClient();
  const { error } = await supabase.storage.from(body.bucket).uploadToSignedUrl(body.path, body.token, file, {
    contentType: file.type,
  });
  if (error) throw new Error(`업로드 실패: ${error.message}`);

  const publicUrl = kind === "asset" ? supabase.storage.from(body.bucket).getPublicUrl(body.path).data.publicUrl : null;
  return { path: body.path as string, publicUrl };
}
