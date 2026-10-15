import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { EMPTY_PRODUCT, ProductForm, type ProductInit } from "../../product-form";

export const metadata: Metadata = { title: "교재 등록·수정", robots: { index: false } };
export const dynamic = "force-dynamic";

const join = (a: string[] | null) => (a ?? []).join("\n");
const str = (v: unknown) => (v === null || v === undefined ? "" : String(v));

export default async function AdminProductPage({ params }: { params: Promise<{ id: string }> }) {
  if (!isSupabaseConfigured() || !(await getAdminUser())) notFound();
  const { id } = await params;
  let init: ProductInit = EMPTY_PRODUCT;

  if (id !== "new") {
    const { data } = await createAdminClient().from("products").select("*").eq("id", id).maybeSingle();
    if (!data) notFound();
    init = {
      id: data.id, title: data.title, slug: data.slug, sku: str(data.sku), series: str(data.series), summary: data.summary, description: data.description,
      track: data.track, area: data.area, course: str(data.course), grades: data.grades ?? [], kind: data.kind, difficulty: str(data.difficulty), curriculum: str(data.curriculum),
      examYear: str(data.exam_year), pageCount: str(data.page_count), questionCount: str(data.question_count), price: str(data.price), salePrice: str(data.sale_price),
      toc: join(data.toc), goals: join(data.goals), targets: join(data.targets), includes: join(data.includes), keywords: (data.keywords ?? []).join(", "),
      edition: str(data.edition), revisionNotes: join(data.revision_notes), releaseDate: str(data.release_date), status: data.status, featuredRank: str(data.featured_rank),
      seoTitle: str(data.seo_title), seoDescription: str(data.seo_description), answerMode: data.answer_mode ?? "none",
      deliveryType: data.delivery_type ?? "custom", weakTags: data.weak_tags ?? [], previewPdfUrl: str(data.preview_pdf_url), coverUrl: str(data.cover_url), previewImages: data.sample_images ?? [],
    };
  }

  return (
    <div className="container-page max-w-3xl py-10 md:py-14">
      <Link href="/admin" className="text-[13px] text-muted-foreground underline underline-offset-4">← 관리자</Link>
      <h1 className="mt-4 text-[28px] font-bold tracking-[-0.03em]">{id === "new" ? "교재 등록" : "교재 수정"}</h1>
      <div className="mt-8"><ProductForm init={init} /></div>
    </div>
  );
}
