import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SampleCover, SampleSheet } from "@/components/books/sample-sheet";
import { PrintButton } from "@/components/books/print-button";
import { ConsultLink } from "@/components/books/parts";
import { getProductBySlug } from "@/lib/products";
import { getSample } from "@/lib/samples";

export const dynamic = "force-dynamic";
type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const p = await getProductBySlug((await params).slug);
  return { title: p ? `${p.title} 샘플 페이지` : "샘플 페이지", robots: { index: false, follow: true }, alternates: { canonical: p ? `/books/${p.slug}` : undefined } };
}

export default async function SamplePage({ params }: { params: Params }) {
  const p = await getProductBySlug((await params).slug);
  const sample = p ? getSample(p.slug) : null;
  if (!p || !sample) notFound();

  return (
    <div className="bg-muted pb-16 print:bg-white print:pb-0">
      <div className="container-page max-w-3xl pt-6 print:hidden">
        <nav aria-label="현재 위치" className="text-[13px] text-muted-foreground"><Link href="/books" className="hover:text-foreground">전체 교재</Link><span className="mx-2">/</span><Link href={`/books/${p.slug}`} className="hover:text-foreground">{p.title}</Link></nav>
        <h1 className="mt-5 text-[26px] leading-snug text-secondary-foreground md:text-[32px]">{p.title} · 샘플 페이지</h1>
        <p className="mt-3 text-[14px] leading-relaxed text-muted-foreground">{sample.summary}</p>
        <p className="mt-3 border-l-2 border-mustard pl-3 text-[12.5px] leading-relaxed text-muted-foreground">이 샘플은 교재의 구성 방식을 보여 드리는 <strong>예시 페이지</strong>입니다. 멜리사 에듀가 새로 작성한 예시이며 최종 교재의 문항·쪽수·구성은 상담 후 확정되는 원고에서 달라질 수 있습니다.</p>
        <div className="mt-5 flex flex-wrap gap-3"><PrintButton /><ConsultLink slug={p.slug} /></div>
      </div>
      <div className="container-page mt-8 max-w-3xl space-y-8 print:mt-0 print:max-w-none print:space-y-0 print:p-0">
        <SampleCover product={p} summary={sample.summary} />
        {sample.pages.map((pg, i) => <SampleSheet key={i} product={p} page={pg} no={i + 2} />)}
      </div>
    </div>
  );
}
