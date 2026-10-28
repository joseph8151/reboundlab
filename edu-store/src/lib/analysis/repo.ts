import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { SAMPLE_PASSAGE } from "./sample";
import { isPublicStatus, type AnalysisPassage } from "./types";

/**
 * 저장소: Supabase가 연결되면 analysis_passages 테이블, 아니면 코드에 들어 있는 샘플만 사용합니다.
 * 공개 화면은 승인(approved)·판매 중(on_sale) 상태만 보여 줍니다. (미연결 데모는 미리보기로 전부 표시)
 */
export const analysisDemoMode = () => !isSupabaseConfigured();

export async function listPassages(opts: { all?: boolean } = {}): Promise<AnalysisPassage[]> {
  if (analysisDemoMode()) return [SAMPLE_PASSAGE];
  let q = createAdminClient().from("analysis_passages").select("data").order("updated_at", { ascending: false });
  if (!opts.all) q = q.in("status", ["approved", "on_sale"]);
  const { data } = await q;
  return (data ?? []).map((r) => r.data as AnalysisPassage);
}

export async function getPassage(slug: string, opts: { all?: boolean } = {}): Promise<AnalysisPassage | null> {
  if (analysisDemoMode()) return slug === SAMPLE_PASSAGE.slug ? SAMPLE_PASSAGE : null;
  const { data } = await createAdminClient().from("analysis_passages").select("data").eq("slug", slug).maybeSingle();
  const p = (data?.data as AnalysisPassage | undefined) ?? null;
  if (!p) return null;
  return opts.all || isPublicStatus(p.status) ? p : null;
}

export async function savePassage(p: AnalysisPassage) {
  const row = { slug: p.slug, title: p.title, status: p.status, data: { ...p, updatedAt: new Date().toISOString() }, updated_at: new Date().toISOString() };
  return createAdminClient().from("analysis_passages").upsert(row, { onConflict: "slug" });
}
