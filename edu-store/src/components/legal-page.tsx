export function LegalPage({ title, effectiveDate, children }: { title: string; effectiveDate: string; children: React.ReactNode }) {
  return (
    <div className="container-page max-w-3xl py-10 sm:py-14">
      <h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">시행일: {effectiveDate}</p>
      <div className="mt-4 rounded-lg bg-amber-50 p-3 text-xs leading-relaxed text-amber-900">
        이 문서는 서비스 오픈을 위한 초안입니다. 실제 사업자 정보로 교체하고, 게시 전 법률 전문가의 검토를 받으세요.
      </div>
      <article className="prose-doc mt-8">{children}</article>
    </div>
  );
}
