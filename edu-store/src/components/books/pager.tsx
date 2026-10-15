import Link from "next/link";

export function Pager({ page, total, pageSize, hrefFor }: { page: number; total: number; pageSize: number; hrefFor: (page: number) => string }) {
  const pages = Math.ceil(total / pageSize);
  if (pages <= 1) return null;
  const nums = Array.from({ length: pages }, (_, i) => i + 1).filter((n) => n === 1 || n === pages || Math.abs(n - page) <= 2);
  return (
    <nav aria-label="페이지" className="mt-12 flex items-center justify-center gap-1 text-[14px]">
      {page > 1 && <Link href={hrefFor(page - 1)} className="px-3 py-2 hover:underline">이전</Link>}
      {nums.map((n, i) => (
        <span key={n} className="flex items-center">
          {i > 0 && nums[i - 1] !== n - 1 && <span className="px-1 text-muted-foreground">…</span>}
          <Link href={hrefFor(n)} aria-current={n === page ? "page" : undefined} className={n === page ? "border-b border-foreground px-3 py-2 font-semibold" : "px-3 py-2 text-muted-foreground hover:text-foreground"}>{n}</Link>
        </span>
      ))}
      {page < pages && <Link href={hrefFor(page + 1)} className="px-3 py-2 hover:underline">다음</Link>}
    </nav>
  );
}
