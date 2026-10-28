import { NextResponse, type NextRequest } from "next/server";
import { isAiConfigured } from "@/lib/ai";
import { getAdminUser } from "@/lib/auth";
import { generateAnalysis } from "@/lib/analysis/generate";
import { mergeRegenerated, CONTENT_KEYS, type AnalysisPassage } from "@/lib/analysis/types";

export const runtime = "nodejs";
export const maxDuration = 300;

/** AI 분석 생성/재생성. 관리자가 직접 고친(lockedPaths) 항목은 덮어쓰지 않습니다. 저장은 하지 않고 결과만 돌려줍니다. */
export async function POST(req: NextRequest) {
  if (!(await getAdminUser())) return NextResponse.json({ message: "권한이 없습니다." }, { status: 403 });
  if (!isAiConfigured()) return NextResponse.json({ message: "ANTHROPIC_API_KEY가 설정되지 않아 AI 생성을 쓸 수 없습니다. 직접 입력은 가능합니다." }, { status: 503 });
  const b = (await req.json().catch(() => null)) as { passage?: AnalysisPassage; keys?: string[] } | null;
  if (!b?.passage?.passage?.sentences?.length) return NextResponse.json({ message: "지문이 비어 있습니다." }, { status: 400 });
  try {
    const fresh = await generateAnalysis(b.passage);
    const keys = b.keys?.filter((k) => (CONTENT_KEYS as readonly string[]).includes(k));
    const { result, protectedPaths } = mergeRegenerated(b.passage, fresh, keys?.length ? keys : undefined);
    return NextResponse.json({ passage: result, protectedPaths });
  } catch (e) {
    return NextResponse.json({ message: e instanceof Error ? e.message : "AI 생성 중 오류가 발생했습니다." }, { status: 502 });
  }
}
