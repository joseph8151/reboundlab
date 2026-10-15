"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { Search, X } from "lucide-react";
import { Wordmark } from "@/components/brand/wordmark";
import { NAV, SUBJECT_LINKS } from "@/lib/nav";
import { useShelf } from "@/lib/shelf";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

export function HeaderClient({ authEnabled }: { authEnabled: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const { cart } = useShelf();
  const [open, setOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => void (document.body.style.overflow = "");
  }, [open]);

  useEffect(() => {
    if (!authEnabled) return;
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => setLoggedIn(Boolean(data.session)));
    const { data } = supabase.auth.onAuthStateChange((_e, session) => setLoggedIn(Boolean(session)));
    return () => data.subscription.unsubscribe();
  }, [authEnabled]);

  function onSearch(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const q = String(new FormData(e.currentTarget).get("q") ?? "").trim();
    setOpen(false);
    router.push(q ? `/books?q=${encodeURIComponent(q)}&status=all` : "/books");
  }

  const isActive = (href: string) => (href === "/books" ? pathname === "/books" || pathname.startsWith("/books/") : pathname.startsWith(href.split("?")[0]));
  const utility = "text-[13px] text-muted-foreground transition-colors hover:text-foreground";

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur print:hidden">
      <div className="container-page flex h-14 items-center justify-between gap-4 md:h-[68px]">
        <button type="button" className="-ml-2 px-2 py-2 text-[13px] font-medium md:hidden" aria-expanded={open} aria-controls="mobile-panel" onClick={() => setOpen(true)}>
          메뉴
        </button>
        <Link href="/" aria-label="MELISA EDU 홈" className="max-md:absolute max-md:left-1/2 max-md:-translate-x-1/2">
          <Wordmark size="md" className="max-md:[&>span:first-child]:text-[18px]" />
        </Link>

        <form onSubmit={onSearch} role="search" className="ml-auto hidden w-[260px] items-center gap-2 border-b border-foreground/40 pb-1 focus-within:border-foreground md:flex">
          <Search className="size-4 text-muted-foreground" aria-hidden />
          <input name="q" type="search" aria-label="교재 검색" placeholder="교재명, 학년, 과목 검색" className="w-full bg-transparent text-[14px] outline-none placeholder:text-muted-foreground/80" />
        </form>

        <div className="hidden items-center gap-5 md:flex">
          <Link href={loggedIn ? "/mypage" : "/login"} className={utility}>{loggedIn ? "내 자료함" : "로그인"}</Link>
          <Link href="/cart" className={utility}>장바구니{cart.length > 0 && <span className="ml-1 font-semibold text-foreground">{cart.length}</span>}</Link>
        </div>

        <div className="flex items-center gap-4 md:hidden">
          <Link href="/cart" className="text-[13px] font-medium">장바구니{cart.length > 0 && <span className="ml-1">{cart.length}</span>}</Link>
        </div>
      </div>

      <nav aria-label="주요 메뉴" className="hidden border-t border-border md:block">
        <ul className="container-page flex items-center gap-7 overflow-x-auto">
          {NAV.map((n) => (
            <li key={n.href} className="shrink-0">
              <Link
                href={n.href}
                aria-current={isActive(n.href) ? "page" : undefined}
                className={cn("-mb-px inline-block border-b py-3 text-[14px] transition-colors", isActive(n.href) ? "border-foreground font-semibold" : "border-transparent text-muted-foreground hover:text-foreground")}
              >
                {n.label}
              </Link>
            </li>
          ))}
          <li className="ml-auto shrink-0">
            <Link href={loggedIn ? "/mypage" : "/login"} className="text-[14px] text-muted-foreground hover:text-foreground">{loggedIn ? "내 자료함" : "내 자료함"}</Link>
          </li>
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
          <div className="mt-auto flex gap-6 border-t border-border px-5 py-5 text-[14px]">
            <Link href={loggedIn ? "/mypage" : "/login"}>{loggedIn ? "내 자료함" : "로그인"}</Link>
            <Link href="/mypage">내 자료함</Link>
            <Link href="/cart">장바구니{cart.length > 0 ? ` (${cart.length})` : ""}</Link>
          </div>
        </div>
      )}
    </header>
  );
}
