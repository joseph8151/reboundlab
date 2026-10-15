import Link from "next/link";
import { siteConfig } from "@/lib/site";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { HeaderActions } from "./header-actions";
import { Logo } from "./logo";

export const NAV_ITEMS = [
  { href: "/products", label: "전체 자료" },
  { href: "/products?grade=high3", label: "수능" },
  { href: "/products?grade=middle", label: "중등" },
  { href: "/study", label: "무료 학습 도구" },
  { href: "/consult", label: "상담 신청" },
  { href: "/faq", label: "자주 묻는 질문" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 print:hidden border-b border-border/80 bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75">
      <div className="container-page flex h-16 items-center justify-between gap-6">
        <Link href="/" className="flex items-center gap-2 font-bold" aria-label={`${siteConfig.name} 홈`}>
          <Logo />
          <span className="flex flex-col leading-none">
            <span className="text-[17px]">{siteConfig.name}</span>
            <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-gold-foreground">{siteConfig.nameEn}</span>
          </span>
        </Link>
        <nav className="hidden flex-1 items-center gap-1 md:flex" aria-label="주요 메뉴">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 text-[15px] font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <HeaderActions authEnabled={isSupabaseConfigured()} navItems={NAV_ITEMS} />
      </div>
    </header>
  );
}
