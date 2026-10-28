import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PrintView } from "@/components/analysis/print-view";
import { analysisDemoMode, getPassage } from "@/lib/analysis/repo";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "PDF 출력", robots: { index: false } };

export default async function PrintPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ mode?: string }> }) {
  const p = await getPassage((await params).slug);
  if (!p) notFound();
  const mode = (await searchParams).mode === "teacher" ? "teacher" : "student";
  return <PrintView data={p} mode={mode} demo={analysisDemoMode()} />;
}
