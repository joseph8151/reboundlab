import Link from "next/link";

export function StudyHeader({ eyebrow, title, description, children }: { eyebrow: string; title: string; description: string; children?: React.ReactNode }) {
  return (
    <div className="mb-10">
      <nav className="text-[13px] text-muted-foreground" aria-label="현재 위치">
        <Link href="/study" className="hover:text-foreground">무료 학습 도구</Link>
        <span className="mx-2">/</span>
        <span>{eyebrow}</span>
      </nav>
      <h1 className="mt-4 text-[30px] font-bold tracking-[-0.035em] md:text-[40px]">{title}</h1>
      <p className="mt-3 max-w-2xl text-[15px] leading-[1.8] text-muted-foreground">{description}</p>
      {children}
    </div>
  );
}
