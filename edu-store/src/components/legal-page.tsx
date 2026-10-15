export function LegalPage({ title, effectiveDate, children }: { title: string; effectiveDate: string; children: React.ReactNode }) {
  // 법률 검토를 마친 뒤 NEXT_PUBLIC_LEGAL_REVIEWED=true 를 설정하면 안내 문구가 사라집니다.
  const reviewed = process.env.NEXT_PUBLIC_LEGAL_REVIEWED === "true";
  return (
    <div className="container-page max-w-3xl py-10 sm:py-14">
      <h1 className="text-[30px] font-bold tracking-[-0.035em] md:text-[38px]">{title}</h1>
      <p className="mt-2 text-[13px] text-muted-foreground">시행일 {effectiveDate}</p>
      {!reviewed && <p className="mt-4 border-l-2 border-sand pl-3 text-[12px] leading-relaxed text-muted-foreground">이 문서는 서비스 오픈을 위한 초안입니다. 사업자 정보를 입력하고 법률 전문가의 검토를 마친 뒤 게시해 주세요.</p>}
      <article className="prose-doc mt-8">{children}</article>
    </div>
  );
}
