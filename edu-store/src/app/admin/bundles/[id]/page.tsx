import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { BundleForm, EMPTY_BUNDLE, type BundleInit } from "../../bundle-form";

export const metadata: Metadata = { title: "패키지 등록·수정", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function AdminBundlePage({ params }: { params: Promise<{ id: string }> }) {
  if (!isSupabaseConfigured() || !(await getAdminUser())) notFound();
  const { id } = await params;
  const admin = createAdminClient();
  const { data: sellable } = await admin.from("products").select("slug, title, price").eq("status", "on_sale").not("file_path", "is", null).not("price", "is", null).order("title");

  let init: BundleInit = EMPTY_BUNDLE;
  if (id !== "new") {
    const { data } = await admin.from("bundles").select("*, bundle_items(product_id, position, products(slug))").eq("id", id).maybeSingle();
    if (!data) notFound();
    const items = [...(data.bundle_items ?? [])].sort((a: { position: number }, b: { position: number }) => a.position - b.position);
    init = {
      id: data.id, slug: data.slug, title: data.title, summary: data.summary, description: data.description, track: data.track ?? "", price: data.price === null ? "" : String(data.price),
      status: data.status, releaseDate: data.release_date ?? "", seoTitle: data.seo_title ?? "", seoDescription: data.seo_description ?? "",
      itemSlugs: items.map((i: { products: { slug: string } | { slug: string }[] | null }) => (Array.isArray(i.products) ? i.products[0]?.slug : i.products?.slug) ?? "").filter(Boolean),
    };
  }
  return (
    <div className="container-page max-w-3xl py-10 md:py-14">
      <Link href="/admin" className="text-[13px] text-muted-foreground underline underline-offset-4">← 관리자</Link>
      <h1 className="mt-4 text-[28px] font-bold tracking-[-0.03em]">{id === "new" ? "패키지 등록" : "패키지 수정"}</h1>
      <div className="mt-8"><BundleForm init={init} sellable={sellable ?? []} /></div>
    </div>
  );
}
