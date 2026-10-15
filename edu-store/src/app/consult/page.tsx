import type { Metadata } from "next";
import Link from "next/link";
import { ConsultForm } from "@/components/consult-form";
import { getConsultOptions } from "@/lib/consult-products";
import { CONSULT_TITLES, type InquiryType } from "@/lib/consult";
import { siteConfig } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "교재 상담 및 구매 신청",
  description: "원하시는 교재와 연락처를 남겨주시면 문자 또는 전화로 구매 방법을 안내해 드립니다.",
  alternates: { canonical: "/consult" },
};

const MODES: InquiryType[] = ["book", "parent", "custom", "academy", "errata"];
const TAB: Record<InquiryType, string> = { book: "교재 구매 상담", parent: "학부모 상담", custom: "맞춤 구성 상담", academy: "학원·기관 문의", errata: "오류 제보" };

export default async function ConsultPage({ searchParams }: { searchParams: Promise<{ product?: string; type?: string }> }) {
  const sp = await searchParams;
  const mode = MODES.includes(sp.type as InquiryType) ? (sp.type as InquiryType) : "book";
  const options = await getConsultOptions();
  const initial = (sp.product ?? "").split(",").filter(Boolean);
  const t = CONSULT_TITLES[mode];

  return (
    <div className="container-page max-w-3xl py-10 sm:py-14">
      <nav aria-label="상담 유형" className="-mx-1 mb-8 flex gap-1 overflow-x-auto border-b border-border text-[14px]">
        {MODES.map((m) => (
          <Link key={m} href={m === "book" ? "/consult" : `/consult?type=${m}`} aria-current={m === mode ? "page" : undefined}
            className={`-mb-px shrink-0 border-b-2 px-3 py-2.5 ${m === mode ? "border-primary font-semibold text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            {TAB[m]}
          </Link>
        ))}
      </nav>
      <h1 className="text-[28px] font-bold leading-tight tracking-[-0.03em] text-secondary-foreground sm:text-[34px]">{t.title}</h1>
      <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">{t.desc}</p>
      <ol className="mt-6 flex flex-wrap gap-x-2 gap-y-1 text-[12px] text-muted-foreground">
        {["교재 선택", "상담 신청", "문자·전화 안내", "계좌이체", "입금 확인", "PDF 교재 전달"].map((s, i) => (
          <li key={s} className="flex items-center gap-2">{i > 0 && <span aria-hidden>→</span>}{s}</li>
        ))}
      </ol>
      <div className="mt-8 border border-blush bg-light-pink p-5 sm:p-8">
        <ConsultForm key={mode} mode={mode} options={options} initialSlugs={initial} endpoint={siteConfig.consultEndpoint} supportContact={siteConfig.supportEmail} />
      </div>
      <p className="mt-8 text-[12px] leading-relaxed text-muted-foreground">결제는 계좌이체로 진행되며, 계좌 정보는 상담 시 문자 또는 전화로 개별 안내드립니다.</p>
    </div>
  );
}
