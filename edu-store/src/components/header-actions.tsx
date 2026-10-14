"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, UserRound, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

type Props = { authEnabled: boolean; navItems: { href: string; label: string }[] };

/** 로그인 상태는 클라이언트에서 확인해 나머지 페이지를 정적으로 유지합니다. */
export function HeaderActions({ authEnabled, navItems }: Props) {
  const [loggedIn, setLoggedIn] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!authEnabled) return;
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => setLoggedIn(Boolean(data.session)));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => setLoggedIn(Boolean(session)));
    return () => data.subscription.unsubscribe();
  }, [authEnabled]);

  return (
    <>
      <div className="flex items-center gap-2">
        {loggedIn ? (
          <Button asChild variant="outline" size="sm">
            <Link href="/mypage">
              <UserRound />
              <span className="hidden sm:inline">내 자료함</span>
            </Link>
          </Button>
        ) : (
          <Button asChild variant="outline" size="sm">
            <Link href="/login">로그인</Link>
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </Button>
      </div>
      {open && (
        <nav className="absolute inset-x-0 top-16 border-b border-border bg-background shadow-sm md:hidden" aria-label="모바일 메뉴">
          <ul className="container-page py-2">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="block py-3 text-[15px] font-medium">
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href={loggedIn ? "/mypage" : "/login"} className="block py-3 text-[15px] font-medium text-primary">
                {loggedIn ? "내 자료함 · 다운로드" : "로그인 / 회원가입"}
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </>
  );
}
