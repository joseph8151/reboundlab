import type { Metadata } from "next";
import { getAdminUser } from "@/lib/auth";
import { analysisDemoMode, getPassage } from "@/lib/analysis/repo";
import { AnalysisEditor } from "@/components/analysis/editor";

export const metadata: Metadata = { title: "지문 분석 편집", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function AdminAnalysisEdit({ params }: { params: Promise<{ slug: string }> }) {
  const demo = analysisDemoMode();
  if (!demo && !(await getAdminUser())) return <div className="container-page max-w-5xl py-14"><h1 className="text-[26px] font-bold">접근 권한이 없습니다</h1></div>;
  const p = await getPassage((await params).slug, { all: true });
  return <div className="container-page max-w-5xl py-8 md:py-12"><AnalysisEditor initial={p} demo={demo} /></div>;
}
