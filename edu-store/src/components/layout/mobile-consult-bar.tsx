"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/** 모바일 하단 고정 상담 버튼. 자체 상담 바가 있는 페이지(교재 상세)와 상담·관리자 페이지에서는 숨깁니다. */
export function MobileConsultBar() {
  const pathname = usePathname();
  const hidden = pathname.startsWith("/consult") || pathname.startsWith("/books/") || pathname.startsWith("/admin") || pathname.startsWith("/login") || pathname.startsWith("/academy") || pathname.startsWith("/errata");
  if (hidden) return null;
  return (
    <>
      <div aria-hidden className="h-16 md:hidden print:hidden" />
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background md:hidden print:hidden">
        <div className="container-page py-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))]">
          <Link href="/consult" data-consult-button className="flex h-11 items-center justify-center bg-primary text-[14px] font-semibold text-primary-foreground">교재 상담 및 구매 신청</Link>
        </div>
      </div>
    </>
  );
}
