import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AnalysisViewer } from "@/components/analysis/viewer";
import { analysisDemoMode, getPassage } from "@/lib/analysis/repo";

export const dynamic = "force-dynamic";
type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const p = await getPassage((await params).slug);
  return { title: p ? `${p.title} — 지문 분석` : "지문 분석", robots: analysisDemoMode() ? { index: false } : undefined };
}

export default async function AnalysisPage({ params }: { params: Params }) {
  const p = await getPassage((await params).slug);
  if (!p) notFound();
  return <AnalysisViewer data={p} demo={analysisDemoMode()} />;
}
