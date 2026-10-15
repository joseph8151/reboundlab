"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { Search, X } from "lucide-react";
import { Wordmark } from "@/components/brand/wordmark";
import { NAV, SUBJECT_LINKS } from "@/lib/nav";
import { cn } from "@/lib/utils";

export function HeaderClient() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => void (document.body.style.overflow = "");
  }, [open]);

  function onSearch(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const q = String(new FormData(e.currentTarget).get("q") ?? "").trim();
    setOpen(false);
    router.push(q ? `/books?q=${encodeURIComponent(q)}` : "/books");
  }

  const isActive = (href: string) => (href === "/books" ? pathname === "/books" || pathname.startsWith("/books/") : pathname.startsWith(href.split("?")[0]));

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur print:hidden">
      <div className="container-page flex h-14 items-center justify-between gap-4 md:h-[68px]">
        <button type="button" className="-ml-2 px-2 py-2 text-[13px] font-medium md:hidden" aria-expanded={open} aria-controls="mobile-panel" onClick={() => setOpen(true)}>
          메뉴
        </button>
        <Link href="/" aria-label="MELISSA EDU 홈" className="max-md:absolute max-md:left-1/2 max-md:-translate-x-1/2">
          <Wordmark size="md" className="max-md:[&>span:first-child]:text-[18px]" />
        </Link>

        <form onSubmit={onSearch} role="search" className="ml-auto hidden w-[260px] items-center gap-2 border-b border-foreground/40 pb-1 focus-within:border-foreground md:flex">
          <Search className="size-4 text-muted-foreground" aria-hidden />
          <input name="q" type="search" aria-label="교재 검색" placeholder="교재명, 학년, 과목 검색" className="w-full bg-transparent text-[14px] outline-none placeholder:text-muted-foreground/80" />
        </form>

        <Link href="/consult" data-consult-button className="hidden h-9 items-center bg-primary px-4 text-[13px] font-semibold text-primary-foreground hover:bg-primary-hover md:inline-flex">교재 상담 신청</Link>

        <Link href="/consult" data-consult-button className="text-[13px] font-semibold md:hidden">상담 신청</Link>
      </div>

      <nav aria-label="주요 메뉴" className="hidden border-t border-border md:block">
        <ul className="container-page flex items-center gap-7 overflow-x-auto">
          {NAV.map((n) => (
            <li key={n.href} className="shrink-0">
              <Link
                href={n.href}
                aria-current={isActive(n.href) ? "page" : undefined}
                className={cn("-mb-px inline-block border-b py-3 text-[14px] transition-colors", isActive(n.href) ? "border-primary font-semibold text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}
              >
                {n.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {open && (
        <div id="mobile-panel" role="dialog" aria-modal="true" aria-label="메뉴" className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-background md:hidden">
          <div className="flex h-14 shrink-0 items-center justify-between border-b border-border px-5">
            <Wordmark size="sm" />
            <button type="button" aria-label="메뉴 닫기" className="-mr-2 p-2" onClick={() => setOpen(false)}><X className="size-5" /></button>
          </div>
          <form onSubmit={onSearch} role="search" className="mx-5 mt-5 flex items-center gap-2 border-b border-foreground pb-2">
            <Search className="size-4 text-muted-foreground" aria-hidden />
            <input name="q" type="search" aria-label="교재 검색" placeholder="교재명, 학년, 과목 검색 (예: 고1 수학)" className="w-full bg-transparent text-[16px] outline-none" />
            <button type="submit" className="text-[14px] font-semibold">검색</button>
          </form>
          <ul className="mt-4 px-5">
            {NAV.map((n) => (
              <li key={n.href} className="border-b border-border">
                <Link href={n.href} className={cn("flex items-center justify-between py-4 text-[17px]", isActive(n.href) && "font-semibold")}>{n.label}<span className="text-muted-foreground" aria-hidden>→</span></Link>
              </li>
            ))}
          </ul>
          <div className="px-5 pt-6">
            <p className="text-[12px] font-semibold tracking-wide text-muted-foreground">과목별</p>
            <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-[15px]">
              {SUBJECT_LINKS.map((s) => <li key={s.href}><Link href={s.href} className="underline decoration-border underline-offset-4">{s.label}</Link></li>)}
            </ul>
          </div>
          <div className="mt-auto border-t border-border px-5 py-5">
            <Link href="/consult" data-consult-button className="flex h-12 items-center justify-center bg-primary text-[15px] font-semibold text-primary-foreground">교재 상담 및 구매 신청</Link>
            <p className="mt-3 flex gap-5 text-[13px] text-muted-foreground"><Link href="/academy">학원·기관 문의</Link><Link href="/support">고객지원</Link></p>
          </div>
        </div>
      )}
    </header>
  );
}
