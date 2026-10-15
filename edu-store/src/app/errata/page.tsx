import type { Metadata } from "next";
import { ConsultForm } from "@/components/consult-form";
import { PageHead } from "@/components/guide/ui";
import { getConsultOptions } from "@/lib/consult-products";
import { siteConfig } from "@/lib/site";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "교재 오류 제보 · 정오표",
  description: "교재 오류와 해설 관련 문의를 남겨 주세요. 확인된 내용만 정오표로 안내합니다.",
  alternates: { canonical: "/errata" },
};

export default async function ErrataPage({ searchParams }: { searchParams: Promise<{ product?: string }> }) {
  const sp = await searchParams;
  const options = await getConsultOptions();
  return (
    <>
      <PageHead eyebrow="ERRATA" title="교재 오류 제보 · 정오표" lead="교재명과 오류 내용을 남겨 주시면 확인 후 안내해 드립니다." />
      <div className="container-page max-w-3xl py-10 md:py-14">
        <section className="mb-10 border-t border-foreground/30 pt-5" aria-labelledby="errata-list">
          <h2 id="errata-list" className="text-[13px] font-semibold tracking-[0.1em] text-muted-foreground">공식 정오표</h2>
          <p className="mt-3 text-[15px] leading-relaxed">현재 공개된 공식 정오표는 없습니다. 제보된 내용은 확인이 끝나기 전에는 정오표로 게시하지 않으며, 확인된 오류는 수정 이력과 함께 해당 교재 페이지에 안내합니다.</p>
        </section>
        <ConsultForm mode="errata" options={options} initialSlugs={(sp.product ?? "").split(",").filter(Boolean).slice(0, 1)} endpoint={siteConfig.consultEndpoint} supportContact={siteConfig.supportEmail} />
      </div>
    </>
  );
}
