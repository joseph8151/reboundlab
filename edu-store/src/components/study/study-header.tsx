import Link from "next/link";

export function StudyHeader({ eyebrow, title, description, children }: { eyebrow: string; title: string; description: string; children?: React.ReactNode }) {
  return (
    <div className="mb-8">
      <nav className="text-sm text-muted-foreground" aria-label="현재 위치">
        <Link href="/study" className="hover:text-foreground">무료 학습 도구</Link>
        <span className="mx-2">/</span>
        <span>{eyebrow}</span>
      </nav>
      <h1 className="mt-3 text-2xl font-bold sm:text-3xl">{title}</h1>
      <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">{description}</p>
      {children}
    </div>
  );
}
